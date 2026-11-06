import { FileText } from "lucide-react";

export default function Content({ report }) {
  const items = [
    ["Postingan", report.categories.posts],
    ["Stories", report.categories.stories]
  ];

  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Content Analytics</h2>
          <p>Data konten yang terdeteksi dalam arsip Instagram.</p>
        </div>
      </div>

      <div className="category-detail-grid">
        {items.map(([label, data]) => (
          <div className="panel detail-card" key={label}>
            <FileText size={23} />
            <h3>{label}</h3>
            <strong>{data?.files ? data.records : "—"}</strong>
            <p>
              {data?.files
                ? `${data.files} file ditemukan`
                : "Tidak tersedia"}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}