import { Heart } from "lucide-react";

export default function Interactions({ report }) {
  return (
    <CategoryPage
      title="Interactions"
      description="Data interaksi likes dan komentar."
      icon={Heart}
      categories={[
        ["Likes", report.categories.likes],
        ["Komentar", report.categories.comments]
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
            <strong>{data?.files ? data.records : "—"}</strong>
            <p>
              {data?.files
                ? `${data.files} file ditemukan`
                : "Tidak tersedia dalam arsip"}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}