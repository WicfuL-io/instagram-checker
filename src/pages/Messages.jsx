import { MessageCircle } from "lucide-react";

export default function Messages({ report }) {
  return (
    <CategoryPage
      title="Messages"
      description="Analisis data percakapan dari arsip Instagram."
      icon={MessageCircle}
      categories={[
        ["File pesan", report.categories.messages]
      ]}
    />
  );
}

function CategoryPage({ title, description, icon: Icon, categories }) {
  return (
    <>
      <div className="section-heading">
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      <div className="category-detail-grid">
        {categories.map(([label, data]) => (
          <div className="panel detail-card" key={label}>
            <Icon size={23} />

            <h3>{label}</h3>

            <strong>
              {data?.files ? data.records : "—"}
            </strong>

            <p>
              {data?.files
                ? `${data.files} file JSON ditemukan`
                : "Data tidak tersedia dalam arsip"}
            </p>
          </div>
        ))}
      </div>

      <div className="panel explanation">
        <h3>Informasi</h3>
        <p>
          Tampilan ini menunjukkan deteksi struktur file dan
          jumlah rekaman yang terbaca. Analisis detail isi
          percakapan memerlukan parser khusus sesuai struktur
          JSON ekspor Instagram.
        </p>
      </div>
    </>
  );
}