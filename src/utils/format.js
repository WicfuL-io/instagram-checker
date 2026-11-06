export function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(value || 0);
}

export function formatDate(value) {
  if (!value) return "Tidak tersedia";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

export function formatFileSize(bytes) {
  if (!bytes) return "0 MB";

  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}