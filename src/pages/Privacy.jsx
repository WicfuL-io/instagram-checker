
import {
  ShieldCheck,
  LockKeyhole,
  FileArchive,
  Trash2,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Database,
} from "lucide-react";

export default function Privacy({ report, onClear }) {
  const fileName = report?.fileName || "Tidak diketahui";
  const fileSize = Number(report?.fileSize) || 0;
  const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);

  const formatNumber = (value) =>
    Number(value || 0).toLocaleString("id-ID");

  return (
    <div className="privacy-page">
      <section className="privacy-hero">
        <div className="privacy-hero-content">
          <span className="privacy-eyebrow">
            <span className="privacy-pulse" />
            PRIVACY & SECURITY
          </span>

          <div className="privacy-title">
            <span className="privacy-title-icon">
              <ShieldCheck size={24} />
            </span>
            <h2>Privasi & Keamanan</h2>
          </div>

          <p>
            Informasi mengenai keamanan pemrosesan, file arsip yang
            digunakan, dan kontrol data analisis Instagram.
          </p>
        </div>

        <div className="privacy-protected">
          <ShieldCheck size={17} />
          <span>
            <strong>Local Processing</strong>
            <small>Pemrosesan melalui browser</small>
          </span>
        </div>
      </section>

      <section className="privacy-security-grid">
        <div className="privacy-security-card">
          <div className="privacy-security-icon purple">
            <ShieldCheck size={22} />
          </div>

          <div className="privacy-security-content">
            <span>PEMROSESAN DATA</span>
            <h3>Local Processing</h3>
            <p>
              Arsip dibaca langsung oleh browser. Aplikasi tidak meminta
              password Instagram untuk melakukan analisis.
            </p>
          </div>

          <div className="privacy-card-footer">
            <CheckCircle2 size={15} />
            <span>Tidak memerlukan password Instagram</span>
          </div>
        </div>

        <div className="privacy-security-card">
          <div className="privacy-security-icon cyan">
            <LockKeyhole size={22} />
          </div>

          <div className="privacy-security-content">
            <span>PERLINDUNGAN AKUN</span>
            <h3>Kontrol Privasi</h3>
            <p>
              Analisis dilakukan berdasarkan file ekspor yang kamu
              unggah, bukan dengan mengakses akun Instagram secara langsung.
            </p>
          </div>

          <div className="privacy-card-footer">
            <CheckCircle2 size={15} />
            <span>Berbasis data ekspor pengguna</span>
          </div>
        </div>
      </section>

      <section className="privacy-file-panel">
        <div className="privacy-section-heading">
          <div className="privacy-section-icon">
            <FileArchive size={19} />
          </div>

          <div>
            <h3>File arsip aktif</h3>
            <p>Informasi file yang sedang digunakan dalam analisis.</p>
          </div>

          <span className="privacy-file-badge">
            <span />
            Aktif
          </span>
        </div>

        <div className="privacy-file-content">
          <div className="privacy-file-main">
            <div className="privacy-file-icon">
              <FileArchive size={27} />
            </div>

            <div className="privacy-file-info">
              <span>NAMA FILE</span>
              <strong title={fileName}>{fileName}</strong>
              <small>Arsip Instagram ZIP</small>
            </div>
          </div>

          <div className="privacy-file-size">
            <span>UKURAN FILE</span>
            <strong>{fileSizeMB} MB</strong>
            <small>
              {formatNumber(fileSize)} bytes
            </small>
          </div>
        </div>

        <div className="privacy-file-note">
          <HardDrive size={16} />
          <span>
            Informasi file ditampilkan berdasarkan arsip yang sedang
            digunakan oleh aplikasi.
          </span>
        </div>
      </section>

      <section className="privacy-control-panel">
        <div className="privacy-control-heading">
          <div className="privacy-control-icon">
            <Database size={20} />
          </div>

          <div>
            <h3>Kontrol data analisis</h3>
            <p>Kelola hasil analisis yang sedang ditampilkan.</p>
          </div>
        </div>

        <div className="privacy-control-content">
          <div className="privacy-control-description">
            <strong>Hapus hasil analisis</strong>
            <p>
              Gunakan tindakan ini jika kamu sudah selesai. Hasil analisis
              akan dihapus dari aplikasi dan kamu perlu mengunggah kembali
              arsip untuk melakukan analisis baru.
            </p>
          </div>

          <button
            type="button"
            className="privacy-delete-button"
            onClick={onClear}
          >
            <Trash2 size={17} />
            Hapus hasil analisis
          </button>
        </div>

        <div className="privacy-delete-warning">
          <AlertTriangle size={16} />
          <span>
            Pastikan kamu sudah selesai menggunakan hasil analisis sebelum
            menghapusnya.
          </span>
        </div>
      </section>

      <section className="privacy-limit-panel">
        <div className="privacy-limit-heading">
          <span className="privacy-limit-icon">
            <Shield size={20} />
          </span>

          <div>
            <h3>Batasan data Instagram</h3>
            <p>Hal yang perlu diketahui mengenai hasil analisis.</p>
          </div>
        </div>

        <div className="privacy-limit-list">
          <div className="privacy-limit-item">
            <span className="privacy-limit-number">01</span>
            <div>
              <strong>Pengunjung profil</strong>
              <p>
                Arsip ekspor Instagram tidak menyediakan informasi
                mengenai siapa yang mengunjungi profil kamu.
              </p>
            </div>
          </div>

          <div className="privacy-limit-item">
            <span className="privacy-limit-number">02</span>
            <div>
              <strong>Screenshot profil</strong>
              <p>
                Data ekspor tidak menyediakan daftar orang yang
                mengambil screenshot profil kamu.
              </p>
            </div>
          </div>

          <div className="privacy-limit-item">
            <span className="privacy-limit-number">03</span>
            <div>
              <strong>Riwayat unfollow</strong>
              <p>
                Untuk mengetahui perubahan followers atau unfollow,
                diperlukan perbandingan dua arsip dari tanggal berbeda.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
