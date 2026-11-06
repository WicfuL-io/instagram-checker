
import {
  Bookmark,
  FolderOpen,
  Layers3,
  CheckCircle2,
  CircleAlert,
} from "lucide-react";

export default function Saved({ report }) {
  const data = report?.categories?.saved ?? {};

  const files = Number(data.files) || 0;
  const records = Number(data.records) || 0;
  const isAvailable = files > 0;

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("id-ID");

  return (
    <div className="saved-page">
      <div className="saved-heading">
        <div>
          <span className="saved-eyebrow">INSTAGRAM DATA ANALYTICS</span>

          <div className="saved-title">
            <div className="saved-title-icon">
              <Bookmark size={22} />
            </div>

            <h2>Saved Content</h2>
          </div>

          <p>
            Informasi konten Instagram yang disimpan dan terdeteksi
            dalam arsip akun.
          </p>
        </div>

        <span
          className={`saved-status ${
            isAvailable ? "available" : "unavailable"
          }`}
        >
          {isAvailable ? (
            <CheckCircle2 size={14} />
          ) : (
            <CircleAlert size={14} />
          )}

          {isAvailable ? "Data tersedia" : "Tidak tersedia"}
        </span>
      </div>

      <div className="saved-overview">
        <div className="saved-main-card">
          <div className="saved-main-top">
            <div>
              <span className="saved-card-label">
                TOTAL SAVED ITEMS
              </span>

              <strong>
                {isAvailable ? formatNumber(records) : "—"}
              </strong>

              <p>
                {isAvailable
                  ? "Jumlah data tersimpan yang terdeteksi"
                  : "Belum ada data tersimpan yang ditemukan"}
              </p>
            </div>

            <div className="saved-main-icon">
              <Bookmark size={27} />
            </div>
          </div>

          <div className="saved-main-bottom">
            <span>
              <span className="saved-dot" />
              Saved Content
            </span>

            <span>
              {isAvailable ? "Terdeteksi dalam arsip" : "Belum ditemukan"}
            </span>
          </div>
        </div>

        <div className="saved-side-card">
          <div className="saved-side-icon">
            <FolderOpen size={21} />
          </div>

          <span className="saved-card-label">FILE DITEMUKAN</span>

          <strong>{formatNumber(files)}</strong>

          <p>Jumlah file Saved dalam arsip Instagram.</p>
        </div>

        <div className="saved-side-card">
          <div className="saved-side-icon cyan">
            <Layers3 size={21} />
          </div>

          <span className="saved-card-label">TOTAL RECORD</span>

          <strong>{formatNumber(records)}</strong>

          <p>Jumlah record yang berhasil dibaca parser.</p>
        </div>
      </div>

      <div className="saved-detail-panel">
        <div className="saved-detail-heading">
          <div className="saved-detail-heading-icon">
            <Bookmark size={18} />
          </div>

          <div>
            <h3>Informasi Saved Content</h3>
            <p>Ringkasan hasil pembacaan data konten tersimpan.</p>
          </div>
        </div>

        <div className="saved-detail-content">
          <div className="saved-detail-row">
            <span>Status data</span>

            <strong className={isAvailable ? "text-available" : ""}>
              {isAvailable ? "Tersedia" : "Tidak tersedia"}
            </strong>
          </div>

          <div className="saved-detail-row">
            <span>File ditemukan</span>
            <strong>{formatNumber(files)}</strong>
          </div>

          <div className="saved-detail-row">
            <span>Jumlah record</span>
            <strong>{formatNumber(records)}</strong>
          </div>
        </div>

        <div className="saved-information">
          <Bookmark size={17} />

          <p>
            {isAvailable
              ? "Data Saved Content berhasil ditemukan dalam arsip Instagram. Jumlah file dan record ditampilkan berdasarkan hasil pembacaan parser."
              : "Data Saved Content tidak tersedia atau tidak ditemukan dalam arsip Instagram yang diunggah."}
          </p>
        </div>
      </div>
    </div>
  );
}
