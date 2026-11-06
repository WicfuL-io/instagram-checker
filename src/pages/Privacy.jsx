import { ShieldCheck, LockKeyhole, FileArchive } from "lucide-react";

export default function Privacy({ report, onClear }) {
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Privacy & Security</h2>
          <p>Informasi privasi dan arsip yang sedang digunakan.</p>
        </div>
      </div>

      <div className="privacy-grid">
        <div className="panel detail-card">
          <ShieldCheck size={25} />
          <h3>Local Processing</h3>
          <p>
            Arsip dibaca langsung oleh browser. Aplikasi
            tidak meminta password Instagram.
          </p>
        </div>

        <div className="panel detail-card">
          <FileArchive size={25} />
          <h3>File aktif</h3>
          <strong>{report.fileName}</strong>
          <p>
            {(report.fileSize / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>

      <div className="panel explanation">
        <LockKeyhole size={21} />

        <h3>Kontrol data</h3>

        <p>
          Hapus hasil analisis dari tampilan aplikasi
          ketika kamu sudah selesai.
        </p>

        <button className="danger-button" onClick={onClear}>
          Hapus hasil analisis
        </button>
      </div>

      <div className="panel explanation">
        <h3>Batasan data Instagram</h3>

        <p>
          Instagram tidak menyediakan data pengunjung profil
          atau orang yang mengambil screenshot profil melalui
          arsip ekspornya. Histori unfollow memerlukan
          perbandingan dua arsip berbeda tanggal.
        </p>
      </div>
    </>
  );
}