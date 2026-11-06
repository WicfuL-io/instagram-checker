import { Bookmark } from "lucide-react";

export default function Saved({ report }) {
  const data = report.categories.saved;

  return (
    <>
      <div className="section-heading">
        <div>
          <h2>Saved Content</h2>
          <p>Informasi konten yang disimpan dari arsip.</p>
        </div>
      </div>

      <div className="panel detail-card">
        <Bookmark size={24} />
        <h3>Saved items</h3>

        <strong>{data.files ? data.records : "—"}</strong>

        <p>
          {data.files
            ? `${data.files} file ditemukan`
            : "Data tersimpan tidak tersedia dalam arsip"}
        </p>
      </div>
    </>
  );
}