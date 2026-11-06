
import {
  FileText,
  Images,
  FolderOpen,
  Search,
  Layers3,
  Image as ImageIcon,
  X,
  Files,
  Eye,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  ExternalLink,
  Code2,
  ListFilter,
  Archive,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";

const PAGE_SIZE = 15;

const formatNumber = (value) =>
  (Number(value) || 0).toLocaleString("id-ID");

function normalizePath(path) {
  return String(path || "").replace(/\\/g, "/");
}

function getFileName(path) {
  return normalizePath(path).split("/").pop() || path;
}

function getFolderName(path) {
  const parts = normalizePath(path).split("/");
  return parts.length > 1
    ? parts.slice(0, -1).join("/")
    : "Folder utama";
}

function formatDate(timestamp) {
  if (!timestamp) return "Tanggal tidak tersedia";

  let value = Number(timestamp);

  if (!Number.isFinite(value)) return "Tanggal tidak tersedia";

  // Instagram export biasanya memakai Unix timestamp dalam detik.
  if (value < 100000000000) value *= 1000;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak tersedia";
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getText(value) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(getText).filter(Boolean).join(", ");
  }

  if (value && typeof value === "object") {
    return (
      value.value ||
      value.title ||
      value.href ||
      value.uri ||
      ""
    );
  }

  return "";
}

function getRecordTimestamp(item) {
  if (!item || typeof item !== "object") return null;

  if (item.creation_timestamp) return item.creation_timestamp;
  if (item.timestamp) return item.timestamp;
  if (item.taken_at) return item.taken_at;

  for (const value of Object.values(item.string_map_data || {})) {
    if (value?.timestamp) return value.timestamp;
  }

  for (const value of item.string_list_data || []) {
    if (value?.timestamp) return value.timestamp;
  }

  return null;
}

function getRecordUrl(item) {
  return (
    item?.uri ||
    item?.href ||
    item?.media?.[0]?.uri ||
    item?.media_list_data?.[0]?.uri ||
    item?.string_list_data?.find((entry) => entry.href)?.href ||
    ""
  );
}

function getRecordCaption(item) {
  return (
    item?.title ||
    item?.caption ||
    item?.text ||
    item?.string_map_data?.Caption?.value ||
    item?.string_map_data?.Comment?.value ||
    item?.string_list_data?.find((entry) => entry.value)?.value ||
    ""
  );
}

function collectRecords(data) {
  const results = [];
  const seen = new WeakSet();

  function walk(value, source = "") {
    if (!value || typeof value !== "object") return;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        walk(item, source || `Data ${index + 1}`);
      });
      return;
    }

    if (seen.has(value)) return;
    seen.add(value);

    const hasInstagramFields =
      value.string_list_data ||
      value.string_map_data ||
      value.media ||
      value.media_list_data ||
      value.uri ||
      value.creation_timestamp ||
      value.taken_at ||
      value.caption;

    if (hasInstagramFields) {
      const caption = getRecordCaption(value);
      const url = getRecordUrl(value);
      const timestamp = getRecordTimestamp(value);

      const media = [
        ...(Array.isArray(value.media) ? value.media : []),
        ...(Array.isArray(value.media_list_data)
          ? value.media_list_data
          : []),
      ];

      const mediaUris = media
        .map((entry) => entry?.uri || entry?.href)
        .filter(Boolean);

      results.push({
        id: `${source}-${results.length}`,
        caption: getText(caption),
        timestamp,
        url,
        mediaUris,
        mediaType:
          value.media_type ||
          value.product_type ||
          value.media_metadata?.type ||
          "",
        raw: value,
      });

      // Jangan membaca ulang objek anak dari record yang sudah ditemukan.
      return;
    }

    Object.entries(value).forEach(([key, child]) => {
      walk(child, source ? `${source}/${key}` : key);
    });
  }

  walk(data);

  return results;
}

function StatCard({ icon: Icon, label, value, description, color }) {
  return (
    <article className="content-v2-stat">
      <div className={`content-v2-stat-icon ${color}`}>
        <Icon size={21} />
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{description}</p>
    </article>
  );
}

export default function Content({ report }) {
  const [expanded, setExpanded] = useState("posts");
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState("");
  const [detailSearch, setDetailSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showRaw, setShowRaw] = useState(false);

  const categories = report?.categories || {};

  const contentItems = useMemo(
    () => [
      {
        id: "posts",
        label: "Postingan",
        description: "Postingan, termasuk konten yang diarsipkan.",
        icon: FileText,
        color: "blue",
        data: categories.posts,
      },
      {
        id: "stories",
        label: "Stories",
        description: "Data Stories Instagram yang ditemukan.",
        icon: Images,
        color: "purple",
        data: categories.stories,
      },
    ],
    [categories.posts, categories.stories]
  );

  const totalFiles = contentItems.reduce(
    (sum, item) => sum + (Number(item.data?.files) || 0),
    0
  );

  const totalRecords = contentItems.reduce(
    (sum, item) => sum + (Number(item.data?.records) || 0),
    0
  );

  const availableCategories = contentItems.filter(
    (item) => Number(item.data?.files) > 0
  ).length;

  const allDocuments = useMemo(
    () =>
      contentItems.flatMap((item) => {
        const documents = Array.isArray(item.data?.documents)
          ? item.data.documents
          : [];

        return documents.map((document) => ({
          ...document,
          categoryId: item.id,
          categoryLabel: item.label,
          records: collectRecords(document.data),
        }));
      }),
    [contentItems]
  );

  const selectedDocument = allDocuments.find(
    (document) => document.path === selectedFile
  );

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return contentItems.map((item) => {
      const paths = Array.isArray(item.data?.paths)
        ? item.data.paths
        : [];

      return {
        ...item,
        paths: paths.filter((path) =>
          String(path).toLowerCase().includes(keyword)
        ),
      };
    });
  }, [contentItems, search]);

  const filteredRecords = useMemo(() => {
    if (!selectedDocument) return [];

    const keyword = detailSearch.trim().toLowerCase();

    if (!keyword) return selectedDocument.records;

    return selectedDocument.records.filter((record) => {
      const searchable = [
        record.caption,
        record.url,
        record.mediaType,
        formatDate(record.timestamp),
        JSON.stringify(record.raw),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(keyword);
    });
  }, [selectedDocument, detailSearch]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecords.length / PAGE_SIZE)
  );

  const visibleRecords = filteredRecords.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const openFile = (path) => {
    setSelectedFile(path);
    setDetailSearch("");
    setPage(1);
    setShowRaw(false);

    setTimeout(() => {
      document
        .getElementById("content-v2-detail")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const closeFile = () => {
    setSelectedFile("");
    setDetailSearch("");
    setPage(1);
    setShowRaw(false);
  };

  return (
    <div className="content-v2">
      <header className="content-v2-hero">
        <div className="content-v2-hero-main">
          <div className="content-v2-eyebrow">
            <span />
            INSTAGRAM DATA ANALYTICS
          </div>

          <div className="content-v2-title-row">
            <div className="content-v2-title-icon">
              <ImageIcon size={25} />
            </div>
            <div>
              <h2>Content Analytics</h2>
              <p>Eksplorasi postingan dan Stories dari arsip Instagram.</p>
            </div>
          </div>
        </div>

        <div className="content-v2-hero-badge">
          <Archive size={17} />
          <span>ZIP Archive</span>
        </div>
      </header>

      <section className="content-v2-stats">
        <StatCard
          icon={FolderOpen}
          label="Total File"
          value={formatNumber(totalFiles)}
          description="File postingan dan Stories"
          color="blue"
        />
        <StatCard
          icon={Layers3}
          label="Total Record"
          value={formatNumber(totalRecords)}
          description="Record yang dikenali parser"
          color="purple"
        />
        <StatCard
          icon={ImageIcon}
          label="Kategori Tersedia"
          value={`${availableCategories}/2`}
          description="Kategori konten ditemukan"
          color="cyan"
        />
      </section>

      <section className="content-v2-section">
        <div className="content-v2-section-heading">
          <div>
            <span className="content-v2-kicker">ARSIP KONTEN</span>
            <h3>File Postingan & Stories</h3>
            <p>Pilih file untuk membaca isi JSON di dalam arsip.</p>
          </div>
          <div className="content-v2-section-count">
            {formatNumber(totalFiles)} file
          </div>
        </div>

        <div className="content-v2-category-grid">
          {contentItems.map((item) => {
            const Icon = item.icon;
            const files = Number(item.data?.files) || 0;
            const records = Number(item.data?.records) || 0;
            const paths = Array.isArray(item.data?.paths)
              ? item.data.paths
              : [];
            const isExpanded = expanded === item.id;

            return (
              <article
                className={`content-v2-category ${item.color}`}
                key={item.id}
              >
                <div className="content-v2-category-top">
                  <div className={`content-v2-category-icon ${item.color}`}>
                    <Icon size={23} />
                  </div>
                  <span className={`content-v2-status ${files ? "yes" : "no"}`}>
                    <i />
                    {files ? "Tersedia" : "Tidak tersedia"}
                  </span>
                </div>

                <h3>{item.label}</h3>
                <p className="content-v2-category-description">
                  {item.description}
                </p>

                <div className="content-v2-category-metrics">
                  <div>
                    <span>File ditemukan</span>
                    <strong>{formatNumber(files)}</strong>
                  </div>
                  <div>
                    <span>Jumlah record</span>
                    <strong>{formatNumber(records)}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="content-v2-expand"
                  onClick={() =>
                    setExpanded((current) =>
                      current === item.id ? "" : item.id
                    )
                  }
                  disabled={!paths.length}
                >
                  <span>
                    <FolderOpen size={16} />
                    {isExpanded ? "Tutup daftar file" : "Jelajahi file"}
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={17} />
                  ) : (
                    <ChevronDown size={17} />
                  )}
                </button>

                {isExpanded && (
                  <div className="content-v2-file-list">
                    {paths.map((path) => {
                      const document = allDocuments.find(
                        (entry) => entry.path === path
                      );

                      return (
                        <button
                          type="button"
                          key={path}
                          className={`content-v2-file ${
                            selectedFile === path ? "active" : ""
                          }`}
                          onClick={() => openFile(path)}
                        >
                          <div className="content-v2-file-icon">
                            <FileText size={18} />
                          </div>
                          <span className="content-v2-file-info">
                            <strong>{getFileName(path)}</strong>
                            <small>{getFolderName(path)}</small>
                          </span>
                          <span className="content-v2-file-records">
                            {formatNumber(document?.records?.length || 0)}
                            <small>data</small>
                          </span>
                          <Eye size={16} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {selectedDocument && (
        <section
          className="content-v2-detail"
          id="content-v2-detail"
        >
          <div className="content-v2-detail-header">
            <div className="content-v2-detail-file">
              <div className="content-v2-detail-file-icon">
                <FileText size={23} />
              </div>
              <div>
                <span className="content-v2-kicker">JSON FILE VIEWER</span>
                <h3>{getFileName(selectedDocument.path)}</h3>
                <p>{getFolderName(selectedDocument.path)}</p>
              </div>
            </div>

            <button
              type="button"
              className="content-v2-close"
              onClick={closeFile}
              aria-label="Tutup detail"
            >
              <X size={19} />
            </button>
          </div>

          <div className="content-v2-detail-stats">
            <div>
              <span>Data dikenali</span>
              <strong>{formatNumber(selectedDocument.records.length)}</strong>
            </div>
            <div>
              <span>Kategori</span>
              <strong>{selectedDocument.categoryLabel}</strong>
            </div>
            <div>
              <span>Format</span>
              <strong>JSON</strong>
            </div>
          </div>

          <div className="content-v2-toolbar">
            <div className="content-v2-detail-search">
              <Search size={17} />
              <input
                value={detailSearch}
                onChange={(event) => {
                  setDetailSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Cari caption, tanggal, atau isi data..."
              />
              {detailSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setDetailSearch("");
                    setPage(1);
                  }}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <button
              type="button"
              className={`content-v2-raw-button ${showRaw ? "active" : ""}`}
              onClick={() => setShowRaw((value) => !value)}
            >
              <Code2 size={16} />
              {showRaw ? "Tampilan ringkas" : "JSON asli"}
            </button>
          </div>

          {showRaw ? (
            <pre className="content-v2-raw">
              {JSON.stringify(selectedDocument.data, null, 2)}
            </pre>
          ) : (
            <>
              <div className="content-v2-record-heading">
                <div>
                  <h4>
                    <ListFilter size={17} />
                    Data Postingan
                  </h4>
                  <p>
                    Menampilkan {formatNumber(visibleRecords.length)} dari{" "}
                    {formatNumber(filteredRecords.length)} data
                  </p>
                </div>
              </div>

              {visibleRecords.length ? (
                <div className="content-v2-record-list">
                  {visibleRecords.map((record) => (
                    <article className="content-v2-record" key={record.id}>
                      <div className="content-v2-record-top">
                        <div className="content-v2-record-icon">
                          <ImageIcon size={19} />
                        </div>
                        <div className="content-v2-record-meta">
                          <strong>
                            {record.mediaType || "Konten Instagram"}
                          </strong>
                          <span>
                            <CalendarDays size={13} />
                            {formatDate(record.timestamp)}
                          </span>
                        </div>
                        <span className="content-v2-record-number">
                          #{record.id.split("-").pop()}
                        </span>
                      </div>

                      <div className="content-v2-record-body">
                        <span>Caption / Keterangan</span>
                        <p>
                          {record.caption || "Tidak ada caption pada data ini."}
                        </p>
                      </div>

                      {record.mediaUris.length > 0 && (
                        <div className="content-v2-media-list">
                          {record.mediaUris.map((uri, index) => (
                            <div key={`${uri}-${index}`}>
                              <ImageIcon size={14} />
                              <span>{getFileName(uri)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {record.url && /^https?:\/\//i.test(record.url) && (
                        <a
                          className="content-v2-record-link"
                          href={record.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Buka konten
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="content-v2-empty">
                  <Search size={25} />
                  <strong>
                    {selectedDocument.records.length
                      ? "Data tidak ditemukan"
                      : "Struktur data belum dikenali"}
                  </strong>
                  <p>
                    {selectedDocument.records.length
                      ? "Coba kata kunci pencarian yang berbeda."
                      : "Buka JSON asli untuk melihat struktur lengkap file ini."}
                  </p>
                  {!selectedDocument.records.length && (
                    <button
                      type="button"
                      onClick={() => setShowRaw(true)}
                    >
                      <Code2 size={15} />
                      Lihat JSON asli
                    </button>
                  )}
                </div>
              )}

              {filteredRecords.length > PAGE_SIZE && (
                <div className="content-v2-pagination">
                  <span>
                    Halaman {page} dari {totalPages}
                  </span>
                  <div>
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((value) => value - 1)}
                    >
                      Sebelumnya
                    </button>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((value) => value + 1)}
                    >
                      Berikutnya
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}

      <section className="content-v2-explorer">
        <div className="content-v2-section-heading">
          <div>
            <span className="content-v2-kicker">FILE EXPLORER</span>
            <h3>Penelusuran File</h3>
            <p>Cari file berdasarkan nama atau lokasi dalam arsip.</p>
          </div>
          <Files size={22} />
        </div>

        <div className="content-v2-main-search">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari archived_posts.json, posts, stories..."
          />
          {search && (
            <button type="button" onClick={() => setSearch("")}>
              <X size={16} />
            </button>
          )}
        </div>

        <div className="content-v2-explorer-results">
          {filteredItems.map((item) => {
            const Icon = item.icon;

            return (
              <div className="content-v2-explorer-group" key={item.id}>
                <div className="content-v2-explorer-group-heading">
                  <div>
                    <Icon size={17} />
                    <strong>{item.label}</strong>
                  </div>
                  <span>{formatNumber(item.paths.length)} file</span>
                </div>

                {item.paths.length ? (
                  item.paths.map((path) => (
                    <button
                      type="button"
                      className="content-v2-explorer-file"
                      key={path}
                      onClick={() => openFile(path)}
                    >
                      <FileText size={17} />
                      <span>
                        <strong>{getFileName(path)}</strong>
                        <small>{getFolderName(path)}</small>
                      </span>
                      <Eye size={16} />
                    </button>
                  ))
                ) : (
                  <div className="content-v2-explorer-empty">
                    {search
                      ? "Tidak ada file yang cocok."
                      : "Belum ada file pada kategori ini."}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
