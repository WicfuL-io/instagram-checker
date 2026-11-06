import JSZip from "jszip";

const normalizeUsername = (value) => {
  return String(value || "")
    .trim()
    .replace(/^@/, "")
    .toLowerCase();
};

function extractUsername(entry) {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const data = entry.string_list_data || [];

  for (const item of data) {
    if (item.value) {
      return normalizeUsername(item.value);
    }

    if (item.href) {
      try {
        const url = new URL(item.href);
        const parts = url.pathname.split("/").filter(Boolean);

        if (parts.length) {
          return normalizeUsername(parts[parts.length - 1]);
        }
      } catch {
        const parts = item.href.split("/").filter(Boolean);

        if (parts.length) {
          return normalizeUsername(parts[parts.length - 1]);
        }
      }
    }
  }

  return normalizeUsername(entry.title) || null;
}

function extractEntries(data, result = []) {
  if (Array.isArray(data)) {
    data.forEach((item) => extractEntries(item, result));
    return result;
  }

  if (!data || typeof data !== "object") {
    return result;
  }

  if (Array.isArray(data.string_list_data)) {
    const username = extractUsername(data);

    if (username) {
      result.push({
        username,
        timestamp: data.string_list_data[0]?.timestamp || null,
        href: data.string_list_data[0]?.href || null
      });
    }

    return result;
  }

  Object.values(data).forEach((value) => {
    extractEntries(value, result);
  });

  return result;
}

function uniqueEntries(entries) {
  const map = new Map();

  entries.forEach((entry) => {
    if (entry.username) {
      map.set(entry.username, entry);
    }
  });

  return Array.from(map.values()).sort((a, b) =>
    a.username.localeCompare(b.username)
  );
}

async function readJson(zip, path) {
  const file = zip.files[path];

  if (!file) {
    return null;
  }

  try {
    return JSON.parse(await file.async("string"));
  } catch {
    return null;
  }
}

function findPaths(zip, regex) {
  return Object.keys(zip.files).filter((path) => {
    return !zip.files[path].dir && regex.test(path.toLowerCase());
  });
}

async function readMultipleJson(zip, paths) {
  const results = [];

  for (const path of paths) {
    const data = await readJson(zip, path);

    if (data !== null) {
      results.push(data);
    }
  }

  return results;
}

function countRecords(data) {
  let count = 0;

  function walk(value) {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    if (!value || typeof value !== "object") {
      return;
    }

    if (
      Array.isArray(value.string_list_data) ||
      value.title ||
      value.media
    ) {
      count++;
    }

    Object.values(value).forEach(walk);
  }

  walk(data);

  return count;
}

export async function parseInstagramZip(file, onProgress = () => {}) {
  if (!file || !file.name.toLowerCase().endsWith(".zip")) {
    throw new Error("File harus menggunakan format ZIP.");
  }

  onProgress(5, "Membuka arsip Instagram...");

  const zip = await JSZip.loadAsync(file);

  const allFiles = Object.keys(zip.files).filter(
    (path) => !zip.files[path].dir
  );

  if (!allFiles.length) {
    throw new Error("Arsip ZIP kosong.");
  }

  onProgress(20, "Membaca data followers...");

  const followerPaths = findPaths(
    zip,
    /followers_and_following\/followers(_\d+)?\.json$/
  );

  const followingPaths = findPaths(
    zip,
    /followers_and_following\/following\.json$/
  );

  const followerDocuments = await readMultipleJson(zip, followerPaths);

  const followingDocuments = await readMultipleJson(zip, followingPaths);

  const followers = uniqueEntries(
    followerDocuments.flatMap((document) => extractEntries(document))
  );

  const following = uniqueEntries(
    followingDocuments.flatMap((document) => extractEntries(document))
  );

  if (!followerPaths.length && !followingPaths.length) {
    throw new Error(
      "Data followers dan following tidak ditemukan. Pastikan ekspor Instagram menggunakan format JSON."
    );
  }

  onProgress(40, "Menghitung hubungan akun...");

  const followerSet = new Set(
    followers.map((item) => item.username)
  );

  const followingSet = new Set(
    following.map((item) => item.username)
  );

  const mutual = followers.filter((item) =>
    followingSet.has(item.username)
  );

  const notFollowingBack = following.filter(
    (item) => !followerSet.has(item.username)
  );

  const notFollowedByYou = followers.filter(
    (item) => !followingSet.has(item.username)
  );

  onProgress(55, "Membaca kategori aktivitas...");

  const patterns = {
    messages: /your_instagram_activity\/messages\/.*\.json$/,
    likes: /your_instagram_activity\/likes\/.*\.json$/,
    comments: /your_instagram_activity\/comments\/.*\.json$/,
    posts: /your_instagram_activity\/content\/posts_.*\.json$/,
    stories: /your_instagram_activity\/content\/stories_.*\.json$/,
    saved: /your_instagram_activity\/saved\/.*\.json$/,
    searches: /search.*\.json$/
  };

  const categories = {};

  for (const [key, regex] of Object.entries(patterns)) {
    const paths = findPaths(zip, regex);
    const documents = await readMultipleJson(zip, paths);

    categories[key] = {
      files: paths.length,
      records: documents.reduce(
        (total, document) => total + countRecords(document),
        0
      )
    };
  }

  onProgress(90, "Menyusun laporan...");

  return {
    fileName: file.name,
    fileSize: file.size,
    processedAt: new Date().toISOString(),

    archiveFiles: allFiles.length,

    followers: followers.length,
    following: following.length,
    mutual: mutual.length,

    notFollowingBack,
    notFollowedByYou,

    followersList: followers,
    followingList: following,
    mutualList: mutual,

    categories
  };
}