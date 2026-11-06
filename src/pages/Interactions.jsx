import {
  Heart,
  MessageCircle,
  FileText,
  FolderOpen,
  Search,
  Layers3,
  Activity,
  ExternalLink,
  CalendarDays,
  UserRound,
  X,
  Code2,
  Eye,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Database,
  Sparkles,
  Filter,
} from "lucide-react";

import { useMemo, useState } from "react";

const PAGE_SIZE = 10;

const formatNumber = (value) =>
  (Number(value) || 0).toLocaleString("id-ID");

const getFileName = (path = "") => {
  const normalized = String(path).replace(/\\/g, "/");
  return normalized.split("/").pop() || normalized;
};

const getFolderName = (path = "") => {
  const normalized = String(path).replace(/\\/g, "/");
  const parts = normalized.split("/");
  return parts.length > 1
    ? parts.slice(0, -1).join("/")
    : "Folder utama";
};

const formatDate = (timestamp) => {
  if (!timestamp) return "Tanggal tidak tersedia";

  const date = new Date(Number(timestamp) * 1000);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak tersedia";
  }

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStringValue = (object, key) => {
  if (!object || typeof object !== "object") return "";

  const value = object[key];

  if (value && typeof value === "object") {
    return value.value || value.href || "";
  }

  return typeof value === "string" ? value : "";
};

const getLabelValue = (item, label) => {
  const values = item?.label_values || [];

  const found = values.find(
    (value) =>
      String(value.label || "").toLowerCase() ===
      label.toLowerCase()
  );

  return found?.value || found?.href || "";
};

const getOwner = (item) => {
  const values = item?.label_values || [];

  const owner = values.find(
    (value) =>
      String(value.title || "").toLowerCase() === "owner"
  );

  const ownerData = owner?.dict?.[0]?.dict || [];

  const username = ownerData.find(
    (value) =>
      String(value.label || "").toLowerCase() === "username"
  );

  const name = ownerData.find(
    (value) =>
      String(value.label || "").toLowerCase() === "name"
  );

  return username?.value || name?.value || "";
};

function normalizeRecords(data, categoryId, sourceKey = "") {
  const result = [];

  const addRecord = (item, index, currentSource = "") => {
    if (!item || typeof item !== "object") return;

    const stringMap = item.string_map_data || {};
    const stringList = item.string_list_data || [];

    let username = "";
    let content = "";
    let timestamp = item.timestamp || null;
    let url = "";
    let owner = "";
    let caption = "";
    let type = categoryId === "likes" ? "Like" : "Komentar";

    if (categoryId === "likes") {
      username =
        item.title ||
        stringList[0]?.value ||
        "";

      url =
        stringList[0]?.href ||
        getLabelValue(item, "URL");

      content =
        getLabelValue(item, "Caption") ||
        "Menyukai konten Instagram";

      timestamp =
        stringList[0]?.timestamp ||
        item.timestamp ||
        null;

      owner = getOwner(item);
      caption = getLabelValue(item, "Caption");

      if (currentSource.includes("comment")) {
        type = "Like Komentar";
      } else if (currentSource.includes("post")) {
        type = "Like Postingan";
      }
    } else {
      content =
        getStringValue(stringMap, "Comment") ||
        getStringValue(stringMap, "comment");

      username =
        getStringValue(stringMap, "Username") ||
        getStringValue(stringMap, "Media Owner") ||
        item.title ||
        "";

      owner = getStringValue(stringMap, "Media Owner");

      timestamp =
        stringMap.Time?.timestamp ||
        item.timestamp ||
        null;

      url =
        item.href ||
        item.uri ||
        item.media_list_data?.[0]?.uri ||
        "";

      type = currentSource.includes("reel")
        ? "Komentar Reels"
        : "Komentar Postingan";
    }

    if (!content && !username && !url && !owner) return;

    result.push({
      id: `${currentSource}-${index}-${result.length}`,
      username,
      content,
      timestamp,
      url,
      owner,
      caption,
      type,
      source: currentSource,
      raw: item,
    });
  };

  const walk = (value, currentSource = "") => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (
          item &&
          typeof item === "object" &&
          (
            item.string_list_data ||
            item.string_map_data ||
            item.label_values ||
            item.media
          )
        ) {
          addRecord(item, index, currentSource);
        } else {
          walk(item, currentSource);
        }
      });

      return;
    }

    if (!value || typeof value !== "object") return;

    Object.entries(value).forEach(([key, child]) => {
      const nextSource = currentSource
        ? `${currentSource}_${key}`
        : key;

      walk(child, nextSource);
    });
  };

  walk(data, sourceKey);

  return result;
}

export default function Interactions({ report }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [fileSearch, setFileSearch] = useState("");
  const [detailSearch, setDetailSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showRaw, setShowRaw] = useState(false);

  const categories = report?.categories || {};

  const interactionItems = [
    {
      id: "likes",
      label: "Likes",
      description: "Aktivitas suka pada postingan dan komentar.",
      icon: Heart,
      color: "rose",
      data: categories.likes,
    },
    {
      id: "comments",
      label: "Komentar",
      description: "Komentar yang tercatat dalam arsip akun.",
      icon: MessageCircle,
      color: "blue",
      data: categories.comments,
    },
  ];

  const totalFiles = interactionItems.reduce(
    (total, item) => total + (Number(item.data?.files) || 0),
    0
  );

  const totalRecords = interactionItems.reduce(
    (total, item) => total + (Number(item.data?.records) || 0),
    0
  );

  const availableCategories = interactionItems.filter(
    (item) => Number(item.data?.files) > 0
  ).length;

  const allDocuments = useMemo(() => {
    return interactionItems.flatMap((item) => {
      const documents = Array.isArray(item.data?.documents)
        ? item.data.documents
        : [];

      return documents.map((document) => ({
        ...document,
        categoryId: item.id,
        categoryLabel: item.label,
        color: item.color,
        records: normalizeRecords(
          document.data,
          item.id,
          getFileName(document.path).toLowerCase()
        ),
      }));
    });
  }, [categories.likes, categories.comments]);

  const filteredDocuments = useMemo(() => {
    const keyword = fileSearch.trim().toLowerCase();

    return allDocuments.filter((document) => {
      const matchesCategory =
        activeCategory === "all" ||
        document.categoryId === activeCategory;

      const matchesSearch =
        !keyword ||
        document.path.toLowerCase().includes(keyword) ||
        getFileName(document.path).toLowerCase().includes(keyword);

      return matchesCategory && matchesSearch;
    });
  }, [allDocuments, activeCategory, fileSearch]);

  const selectedDocument = allDocuments.find(
    (document) => document.path === selectedFile
  );

  const filteredRecords = useMemo(() => {
    if (!selectedDocument) return [];

    const keyword = detailSearch.trim().toLowerCase();

    if (!keyword) return selectedDocument.records;

    return selectedDocument.records.filter((record) => {
      const searchable = [
        record.username,
        record.content,
        record.owner,
        record.caption,
        record.type,
        record.url,
        formatDate(record.timestamp),
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

  const openFile = (path) => {
    setSelectedFile(path);
    setDetailSearch("");
    setPage(1);
    setShowRaw(false);
  };

  const closeFile = () => {
    setSelectedFile(null);
    setDetailSearch("");
    setPage(1);
    setShowRaw(false);
  };

  return (
    <div className="ix-page">
      {/* HEADER */}
      <section className="ix-hero">
        <div className="ix-hero-content">
          <div className="ix-eyebrow">
            <Sparkles size={14} />
            INSTAGRAM DATA ANALYTICS
          </div>

          <h1>
            Interaction <span>Analytics</span>
          </h1>

          <p>
            Jelajahi aktivitas Likes dan komentar dari arsip Instagram.
            Buka setiap file untuk membaca data interaksi secara detail.
          </p>

          <div className="ix-hero-meta">
            <span>
              <Database size={14} />
              {formatNumber(totalFiles)} file terdeteksi
            </span>
            <span className="ix-meta-divider" />
            <span>
              <Activity size={14} />
              {formatNumber(totalRecords)} record
            </span>
          </div>
        </div>

        <div className="ix-hero-art">
          <div className="ix-orbit ix-orbit-one" />
          <div className="ix-orbit ix-orbit-two" />
          <div className="ix-hero-heart">
            <Heart size={42} fill="currentColor" />
          </div>
          <div className="ix-floating-icon ix-floating-heart">
            <Heart size={17} />
          </div>
          <div className="ix-floating-icon ix-floating-message">
            <MessageCircle size={19} />
          </div>
        </div>
      </section>

      {/* STATISTIK */}
      <section className="ix-stats">
        <article className="ix-stat-card">
          <div className="ix-stat-icon purple">
            <FolderOpen size={21} />
          </div>
          <div className="ix-stat-body">
            <span>Total File Interaksi</span>
            <strong>{formatNumber(totalFiles)}</strong>
            <small>File JSON Likes dan komentar</small>
          </div>
          <div className="ix-stat-decoration">
            <FolderOpen size={66} />
          </div>
        </article>

        <article className="ix-stat-card">
          <div className="ix-stat-icon cyan">
            <Layers3 size={21} />
          </div>
          <div className="ix-stat-body">
            <span>Total Record</span>
            <strong>{formatNumber(totalRecords)}</strong>
            <small>Data aktivitas yang terdeteksi</small>
          </div>
          <div className="ix-stat-decoration">
            <Layers3 size={66} />
          </div>
        </article>

        <article className="ix-stat-card">
          <div className="ix-stat-icon amber">
            <Activity size={21} />
          </div>
          <div className="ix-stat-body">
            <span>Kategori Tersedia</span>
            <strong>
              {availableCategories}
              <small className="ix-stat-total">/ 2</small>
            </strong>
            <small>Jenis interaksi dalam arsip</small>
          </div>
          <div className="ix-stat-decoration">
            <Activity size={66} />
          </div>
        </article>
      </section>

      {/* KATEGORI */}
      <section className="ix-section">
        <div className="ix-section-heading">
          <div>
            <span className="ix-section-kicker">RINGKASAN DATA</span>
            <h2>Kategori Interaksi</h2>
            <p>Pilih kategori untuk menyaring file yang ingin dibuka.</p>
          </div>
        </div>

        <div className="ix-category-grid">
          {interactionItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeCategory === item.id;

            return (
              <button
                type="button"
                key={item.id}
                className={`ix-category-card ${item.color} ${
                  isActive ? "active" : ""
                }`}
                onClick={() =>
                  setActiveCategory((current) =>
                    current === item.id ? "all" : item.id
                  )
                }
              >
                <div className="ix-category-top">
                  <div className="ix-category-icon">
                    <Icon size={23} />
                  </div>
                  <span className="ix-category-arrow">
                    <ArrowUpRight size={18} />
                  </span>
                </div>

                <div className="ix-category-info">
                  <h3>{item.label}</h3>
                  <p>{item.description}</p>
                </div>

                <div className="ix-category-bottom">
                  <div>
                    <strong>{formatNumber(item.data?.files)}</strong>
                    <span>File</span>
                  </div>
                  <div>
                    <strong>{formatNumber(item.data?.records)}</strong>
                    <span>Record</span>
                  </div>
                  <span className="ix-category-status">
                    {Number(item.data?.files) > 0
                      ? "Tersedia"
                      : "Kosong"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* FILE EXPLORER */}
      <section className="ix-section ix-explorer">
        <div className="ix-explorer-heading">
          <div>
            <span className="ix-section-kicker">ARSIP INSTAGRAM</span>
            <h2>Penelusuran File</h2>
            <p>
              Pilih file JSON untuk melihat isi data interaksi.
            </p>
          </div>

          <div className="ix-file-total">
            <FileText size={16} />
            {formatNumber(filteredDocuments.length)} file
          </div>
        </div>

        <div className="ix-explorer-toolbar">
          <div className="ix-search-box">
            <Search size={18} />
            <input
              type="search"
              value={fileSearch}
              onChange={(event) => setFileSearch(event.target.value)}
              placeholder="Cari nama file atau folder..."
            />
            {fileSearch && (
              <button
                type="button"
                onClick={() => setFileSearch("")}
                aria-label="Hapus pencarian"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="ix-filter-control">
            <Filter size={16} />
            <select
              value={activeCategory}
              onChange={(event) => setActiveCategory(event.target.value)}
              aria-label="Filter kategori"
            >
              <option value="all">Semua kategori</option>
              <option value="likes">Likes</option>
              <option value="comments">Komentar</option>
            </select>
          </div>
        </div>

        {filteredDocuments.length > 0 ? (
          <div className="ix-file-grid">
            {filteredDocuments.map((document) => {
              const Icon =
                document.categoryId === "likes"
                  ? Heart
                  : MessageCircle;

              const isSelected = selectedFile === document.path;

              return (
                <button
                  type="button"
                  key={document.path}
                  className={`ix-file-card ${document.color} ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={() => openFile(document.path)}
                >
                  <div className="ix-file-icon">
                    <Icon size={21} />
                  </div>

                  <div className="ix-file-main">
                    <div className="ix-file-name-row">
                      <strong>{getFileName(document.path)}</strong>
                      <span className="ix-file-badge">
                        {document.categoryLabel}
                      </span>
                    </div>

                    <span className="ix-file-path">
                      <FolderOpen size={12} />
                      {getFolderName(document.path)}
                    </span>

                    <span className="ix-file-records">
                      {formatNumber(document.records.length)} data terbaca
                    </span>
                  </div>

                  <div className="ix-file-open">
                    <Eye size={17} />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="ix-empty">
            <div className="ix-empty-icon">
              <Search size={25} />
            </div>
            <strong>File tidak ditemukan</strong>
            <p>
              Coba kata kunci lain atau ubah filter kategori.
            </p>
            <button
              type="button"
              onClick={() => {
                setFileSearch("");
                setActiveCategory("all");
              }}
            >
              Reset pencarian
            </button>
          </div>
        )}
      </section>

      {/* DETAIL FILE */}
      {selectedDocument && (
        <section className="ix-detail-section" id="interaction-file-detail">
          <div className="ix-detail-heading">
            <div className="ix-detail-title">
              <div className={`ix-detail-file-icon ${selectedDocument.color}`}>
                <FileText size={22} />
              </div>

              <div>
                <span className="ix-section-kicker">DETAIL DOKUMEN</span>
                <h2>{getFileName(selectedDocument.path)}</h2>
                <p>{getFolderName(selectedDocument.path)}</p>
              </div>
            </div>

            <button
              type="button"
              className="ix-close-button"
              onClick={closeFile}
              aria-label="Tutup detail"
            >
              <X size={19} />
            </button>
          </div>

          <div className="ix-detail-overview">
            <div>
              <span>Total data</span>
              <strong>
                {formatNumber(selectedDocument.records.length)}
              </strong>
            </div>
            <div>
              <span>Kategori</span>
              <strong>{selectedDocument.categoryLabel}</strong>
            </div>
            <div>
              <span>Format dokumen</span>
              <strong>JSON</strong>
            </div>
          </div>

          <div className="ix-detail-toolbar">
            <div className="ix-search-box ix-detail-search">
              <Search size={17} />
              <input
                type="search"
                value={detailSearch}
                onChange={(event) => {
                  setDetailSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Cari akun, komentar, caption..."
              />
              {detailSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setDetailSearch("");
                    setPage(1);
                  }}
                  aria-label="Hapus pencarian"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <button
              type="button"
              className={`ix-raw-button ${showRaw ? "active" : ""}`}
              onClick={() => setShowRaw((current) => !current)}
            >
              <Code2 size={16} />
              {showRaw ? "Tampilan ringkas" : "Lihat JSON asli"}
            </button>
          </div>

          {showRaw ? (
            <pre className="ix-raw-json">
              {JSON.stringify(selectedDocument.data, null, 2)}
            </pre>
          ) : (
            <>
              <div className="ix-record-heading">
                <div>
                  <h3>Daftar Aktivitas</h3>
                  <p>
                    {formatNumber(filteredRecords.length)} data ditemukan
                    {detailSearch ? " dari hasil pencarian" : ""}
                  </p>
                </div>
                <span className="ix-record-count">
                  {formatNumber(visibleRecords.length)} ditampilkan
                </span>
              </div>

              {visibleRecords.length > 0 ? (
                <div className="ix-record-list">
                  {visibleRecords.map((record, index) => (
                    <article className="ix-record-card" key={record.id}>
                      <div className="ix-record-index">
                        {String((page - 1) * PAGE_SIZE + index + 1).padStart(2, "0")}
                      </div>

                      <div className="ix-record-content">
                        <div className="ix-record-top">
                          <div className="ix-record-avatar">
                            {selectedDocument.categoryId === "likes" ? (
                              <Heart size={17} />
                            ) : (
                              <MessageCircle size={17} />
                            )}
                          </div>

                          <div className="ix-record-user">
                            <strong>
                              {record.username
                                ? record.username.startsWith("@")
                                  ? record.username
                                  : `@${record.username}`
                                : "Akun tidak tercatat"}
                            </strong>
                            <span>{record.type}</span>
                          </div>

                          <div className="ix-record-date">
                            <CalendarDays size={14} />
                            {formatDate(record.timestamp)}
                          </div>
                        </div>

                        {record.content && (
                          <p className="ix-record-text">
                            {record.content}
                          </p>
                        )}

                        {record.caption && (
                          <div className="ix-record-caption">
                            <span>CAPTION KONTEN</span>
                            <p>{record.caption}</p>
                          </div>
                        )}

                        {record.owner && (
                          <div className="ix-record-owner">
                            <UserRound size={14} />
                            Pemilik konten:
                            <strong>{record.owner}</strong>
                          </div>
                        )}

                        {record.url &&
                          record.url.startsWith("http") && (
                            <a
                              href={record.url}
                              target="_blank"
                              rel="noreferrer"
                              className="ix-record-link"
                            >
                              Buka konten
                              <ExternalLink size={14} />
                            </a>
                          )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="ix-empty ix-record-empty">
                  <div className="ix-empty-icon">
                    <Search size={25} />
                  </div>
                  <strong>Data tidak ditemukan</strong>
                  <p>
                    Tidak ada aktivitas yang sesuai dengan kata kunci tersebut.
                  </p>
                </div>
              )}

              {filteredRecords.length > PAGE_SIZE && (
                <div className="ix-pagination">
                  <span>
                    Halaman <strong>{page}</strong> dari{" "}
                    <strong>{totalPages}</strong>
                  </span>

                  <div>
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                    >
                      <ChevronLeft size={16} />
                      Sebelumnya
                    </button>

                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() =>
                        setPage((current) =>
                          Math.min(totalPages, current + 1)
                        )
                      }
                    >
                      Berikutnya
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}