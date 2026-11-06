
import {
  Activity,
  Search,
  FolderArchive,
  Files,
  CheckCircle2,
  CircleAlert,
  ArrowUpRight,
  ChartNoAxesCombined,
} from "lucide-react";

export default function ActivityPage({ report }) {
  const data = report?.categories?.searches ?? {};

  const archiveFiles = Number(report?.archiveFiles) || 0;
  const searchFiles = Number(data.files) || 0;
  const searchRecords = Number(data.records) || 0;

  const hasSearchData = searchFiles > 0;
  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("id-ID");

  return (
    <div className="activity-page">
      <section className="activity-hero">
        <div className="activity-hero-content">
          <span className="activity-eyebrow">
            <span className="activity-pulse" />
            INSTAGRAM ACTIVITY ANALYTICS
          </span>

          <div className="activity-title">
            <span className="activity-title-icon">
              <Activity size={23} />
            </span>
            <h2>Activity & Search</h2>
          </div>

          <p>
            Informasi aktivitas arsip dan riwayat pencarian yang berhasil
            ditemukan dari data ekspor Instagram.
          </p>
        </div>

        <div className={`activity-status ${hasSearchData ? "available" : "unavailable"}`}>
          {hasSearchData ? (
            <CheckCircle2 size={16} />
          ) : (
            <CircleAlert size={16} />
          )}
          {hasSearchData ? "Data pencarian tersedia" : "Data pencarian tidak tersedia"}
        </div>
      </section>

      <section className="activity-summary-grid">
        <div className="activity-summary-card archive">
          <div className="activity-summary-top">
            <span className="activity-summary-icon purple">
              <FolderArchive size={21} />
            </span>
            <span className="activity-summary-label">TOTAL ARSIP</span>
          </div>

          <strong>{formatNumber(archiveFiles)}</strong>
          <p>File yang terdapat dalam arsip ZIP.</p>

          <div className="activity-summary-footer">
            <span>Seluruh kategori</span>
            <Files size={15} />
          </div>
        </div>

        <div className="activity-summary-card search">
          <div className="activity-summary-top">
            <span className="activity-summary-icon cyan">
              <Search size={21} />
            </span>
            <span className="activity-summary-label">FILE PENCARIAN</span>
          </div>

          <strong>{formatNumber(searchFiles)}</strong>
          <p>File riwayat pencarian yang ditemukan.</p>

          <div className="activity-summary-footer">
            <span>Search history</span>
            <Search size={15} />
          </div>
        </div>

        <div className="activity-summary-card records">
          <div className="activity-summary-top">
            <span className="activity-summary-icon blue">
              <ChartNoAxesCombined size={21} />
            </span>
            <span className="activity-summary-label">TOTAL RECORD</span>
          </div>

          <strong>{hasSearchData ? formatNumber(searchRecords) : "—"}</strong>
          <p>Jumlah record pencarian yang dibaca parser.</p>

          <div className="activity-summary-footer">
            <span>Search records</span>
            <Activity size={15} />
          </div>
        </div>
      </section>

      <section className="activity-detail-panel">
        <div className="activity-detail-heading">
          <div className="activity-detail-heading-icon">
            <Search size={19} />
          </div>

          <div>
            <h3>Detail riwayat pencarian</h3>
            <p>Informasi hasil pembacaan data pencarian Instagram.</p>
          </div>
        </div>

        <div className="activity-detail-grid">
          <div className="activity-detail-item">
            <span>Status data</span>
            <strong className={hasSearchData ? "success" : "muted"}>
              {hasSearchData ? "Tersedia" : "Tidak tersedia"}
            </strong>
          </div>

          <div className="activity-detail-item">
            <span>File ditemukan</span>
            <strong>{formatNumber(searchFiles)}</strong>
          </div>

          <div className="activity-detail-item">
            <span>Jumlah record</span>
            <strong>{hasSearchData ? formatNumber(searchRecords) : "—"}</strong>
          </div>
        </div>

        <div className={`activity-information ${hasSearchData ? "success" : "warning"}`}>
          {hasSearchData ? (
            <CheckCircle2 size={18} />
          ) : (
            <CircleAlert size={18} />
          )}

          <p>
            {hasSearchData
              ? "Riwayat pencarian berhasil ditemukan dalam arsip Instagram. Jumlah file dan record ditampilkan berdasarkan hasil pembacaan parser."
              : "Riwayat pencarian tidak ditemukan atau tidak tersedia dalam arsip Instagram yang diunggah. Hal ini tidak berarti aktivitas pencarian akun tidak pernah dilakukan."}
          </p>
        </div>
      </section>

      <section className="activity-archive-panel">
        <div className="activity-archive-icon">
          <FolderArchive size={21} />
        </div>

        <div className="activity-archive-content">
          <h3>Informasi arsip Instagram</h3>
          <p>
            Arsip ZIP berisi berbagai kategori data akun. Angka total arsip
            menunjukkan jumlah file yang terdeteksi, bukan jumlah aktivitas
            pengguna.
          </p>
        </div>

        <div className="activity-archive-count">
          <strong>{formatNumber(archiveFiles)}</strong>
          <span>Total file</span>
        </div>
      </section>
    </div>
  );
}
