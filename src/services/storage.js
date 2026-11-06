const STORAGE_KEY = "instatrack_settings";

export function saveSettings(settings) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(settings)
    );
  } catch {
    console.warn("Pengaturan tidak dapat disimpan.");
  }
}

export function getSettings() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function clearSettings() {
  localStorage.removeItem(STORAGE_KEY);
}