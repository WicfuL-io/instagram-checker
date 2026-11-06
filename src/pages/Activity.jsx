import { Activity, Search } from "lucide-react";

export default function ActivityPage({ report }) {
  const data = report.categories.searches;

  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Activity & Search</h2>
          <p>Aktivitas pencarian yang tersedia di arsip.</p>
        </div>
      </div>

      <div className="category-detail-grid">
        <div className="panel detail-card">
          <Activity size={23} />
          <h3>Aktivitas</h3>
          <strong>{report.archiveFiles}</strong>
          <p>File dalam arsip ZIP</p>
        </div>

        <div className="panel detail-card">
          <Search size={23} />
          <h3>Riwayat pencarian</h3>
          <strong>{data.files ? data.records : "—"}</strong>
          <p>
            {data.files
              ? `${data.files} file ditemukan`
              : "Tidak tersedia dalam arsip"}
          </p>
        </div>
      </div>
    </>
  );
}