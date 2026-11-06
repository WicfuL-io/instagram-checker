
import JSZip from "jszip";

/* =========================================================
   UTILITAS DASAR
========================================================= */

const normalizeUsername = (value) =>
    String(value || "")
        .trim()
        .replace(/^@/, "")
        .toLowerCase();

function extractUsername(entry) {
    if (!entry || typeof entry !== "object") return null;

    for (const item of entry.string_list_data || []) {
        if (item.value) return normalizeUsername(item.value);

        if (item.href) {
            try {
                const parts = new URL(item.href).pathname
                    .split("/")
                    .filter(Boolean);

                if (parts.length) {
                    return normalizeUsername(parts.at(-1));
                }
            } catch {
                const parts = String(item.href)
                    .split("/")
                    .filter(Boolean);

                if (parts.length) {
                    return normalizeUsername(parts.at(-1));
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

    if (!data || typeof data !== "object") return result;

    if (Array.isArray(data.string_list_data)) {
        const username = extractUsername(data);

        if (username) {
            result.push({
                username,
                timestamp: data.string_list_data[0]?.timestamp || null,
                href: data.string_list_data[0]?.href || null,
            });
        }

        return result;
    }

    Object.values(data).forEach((value) =>
        extractEntries(value, result)
    );

    return result;
}

function uniqueEntries(entries) {
    const map = new Map();

    entries.forEach((entry) => {
        if (entry.username) {
            map.set(entry.username, entry);
        }
    });

    return [...map.values()].sort((a, b) =>
        a.username.localeCompare(b.username)
    );
}

async function readJson(zip, path) {
    const file = zip.files[path];

    if (!file) return null;

    try {
        return JSON.parse(await file.async("string"));
    } catch (error) {
        console.warn(`Gagal membaca JSON: ${path}`, error);
        return null;
    }
}

/* =========================================================
   PENGHITUNGAN RECORD
========================================================= */

function countRecords(data) {
    if (Array.isArray(data)) {
        return data.length;
    }

    if (!data || typeof data !== "object") {
        return 0;
    }

    const candidates = [];

    const recordKeys = [
        "timestamp",
        "creation_timestamp",
        "string_list_data",
        "string_map_data",
        "media",
        "media_metadata",
        "uri",
        "title",
        "media_type",
        "taken_at",
        "comment",
        "likes",
    ];

    function walk(value) {
        if (Array.isArray(value)) {
            if (
                value.length > 0 &&
                value.some(
                    (item) =>
                        item &&
                        typeof item === "object" &&
                        !Array.isArray(item)
                )
            ) {
                const validRecords = value.filter((item) => {
                    if (
                        !item ||
                        typeof item !== "object" ||
                        Array.isArray(item)
                    ) {
                        return false;
                    }

                    return Object.keys(item).some((key) =>
                        recordKeys.includes(key)
                    );
                });

                if (validRecords.length > 0) {
                    candidates.push(validRecords.length);
                }
            }

            value.forEach(walk);
            return;
        }

        if (!value || typeof value !== "object") return;

        Object.values(value).forEach(walk);
    }

    walk(data);

    return candidates.length > 0
        ? Math.max(...candidates)
        : 0;
}

/* =========================================================
   KLASIFIKASI FILE INSTAGRAM
========================================================= */

function classifyPath(path) {
    const p = String(path || "")
        .replace(/\\/g, "/")
        .toLowerCase();

    const fileName = p.split("/").pop() || "";

    if (/\/messages\//.test(p)) return "messages";

    if (/followers_and_following\/followers(_\d+)?\.json$/.test(p)) {
        return "followers";
    }

    if (/followers_and_following\/following\.json$/.test(p)) {
        return "following";
    }

    if (/close_friends/.test(p)) return "closeFriends";
    if (/recently_unfollowed/.test(p)) return "recentlyUnfollowed";

    if (/follow_requests|pending_follow_requests/.test(p)) {
        return "followRequests";
    }

    if (/\/likes\//.test(p) || /^liked_posts/.test(fileName)) {
        return "likes";
    }

    if (/\/comments\//.test(p) || /^comments/.test(fileName)) {
        return "comments";
    }

    // POSTINGAN:
    // archived_posts.json
    // posts.json
    // posts_1.json
    // media/posts/...
    // content/posts/...
    if (
        /archived_posts?(_\d+)?\.json$/.test(fileName) ||
        /^posts?(_\d+)?\.json$/.test(fileName) ||
        /\/posts?\//.test(p) ||
        /\/media\/.*posts.*\.json$/.test(p) ||
        /post_media/.test(fileName)
    ) {
        return "posts";
    }

    // STORIES:
    // archived_stories.json
    // stories.json
    // stories_1.json
    // media/stories/...
    if (
        /archived_stories?(_\d+)?\.json$/.test(fileName) ||
        /^stories?(_\d+)?\.json$/.test(fileName) ||
        /\/stories?\//.test(p) ||
        /\/media\/.*stories.*\.json$/.test(p)
    ) {
        return "stories";
    }

    if (/\/saved\//.test(p) || /saved_posts/.test(fileName)) {
        return "saved";
    }

    if (
        /story_interactions\/polls/.test(p) ||
        /story_interactions\/questions/.test(p) ||
        /story_interactions\/quizzes/.test(p) ||
        /story_interactions\/emoji_sliders/.test(p) ||
        /story_interactions\/countdowns/.test(p)
    ) {
        return "storyInteractions";
    }

    if (/story_likes/.test(p)) return "storyLikes";
    if (/stories_viewed/.test(p)) return "storiesViewed";
    if (/search/.test(p)) return "searches";
    if (/link_history/.test(p)) return "linkHistory";
    if (/ads_information/.test(p)) return "ads";
    if (/security_and_login/.test(p)) return "security";
    if (/personal_information/.test(p)) return "profile";
    if (/contacts/.test(p)) return "contacts";
    if (/threads\//.test(p)) return "threads";

    return "other";
}

/* =========================================================
   LABEL KATEGORI
========================================================= */

const categoryLabels = {
    messages: "Pesan dan percakapan",
    followers: "Followers",
    following: "Following",
    closeFriends: "Teman dekat",
    recentlyUnfollowed: "Recently unfollowed",
    followRequests: "Permintaan follow",
    likes: "Likes",
    comments: "Komentar",
    posts: "Postingan",
    stories: "Stories",
    saved: "Konten tersimpan",
    storyInteractions: "Interaksi story",
    storyLikes: "Story likes",
    storiesViewed: "Story dilihat",
    searches: "Riwayat pencarian",
    linkHistory: "Riwayat tautan",
    ads: "Aktivitas iklan",
    security: "Keamanan akun",
    profile: "Informasi profil",
    contacts: "Kontak",
    threads: "Threads",
    other: "Data lainnya",
};

/*
 * Kategori yang isi JSON-nya perlu ditampilkan
 * langsung di halaman aplikasi.
 */
const readableCategories = new Set([
    "likes",
    "comments",
    "posts",
    "stories",
]);

function createCategory(key) {
    return {
        label: categoryLabels[key] || key,
        files: 0,
        records: 0,
        paths: [],
        ...(readableCategories.has(key)
            ? { documents: [] }
            : {}),
    };
}

/* =========================================================
   ANALISIS PERCAKAPAN
========================================================= */

function analyzeConversation(path, data) {
    const messages = Array.isArray(data.messages)
        ? data.messages
        : [];

    const participants = Array.isArray(data.participants)
        ? data.participants
            .map((item) => item?.name)
            .filter(Boolean)
        : [];

    const people = {};
    const timeline = {};

    const messageTypes = {
        text: 0,
        photos: 0,
        videos: 0,
        audio: 0,
        shared: 0,
        reactions: 0,
        calls: 0,
        other: 0,
    };

    let firstMessageAt = null;
    let lastMessageAt = null;

    const analyzedMessages = messages.map((message) => {
        const timestamp = Number(message.timestamp_ms || 0);
        const sender = message.sender_name || "Tidak diketahui";

        people[sender] = (people[sender] || 0) + 1;

        if (timestamp) {
            firstMessageAt = firstMessageAt === null
                ? timestamp
                : Math.min(firstMessageAt, timestamp);

            lastMessageAt = lastMessageAt === null
                ? timestamp
                : Math.max(lastMessageAt, timestamp);

            const date = new Date(timestamp)
                .toISOString()
                .slice(0, 10);

            timeline[date] = (timeline[date] || 0) + 1;
        }

        const hasPhoto = !!message.photos?.length;
        const hasVideo = !!message.videos?.length;

        const hasAudio = !!(
            message.audio_files?.length ||
            message.voice_media?.length
        );

        const hasShare = !!message.share;
        const hasReaction = !!message.reactions?.length;
        const hasCall = !!message.call_duration;

        if (message.content) messageTypes.text++;

        if (hasPhoto) {
            messageTypes.photos += message.photos.length;
        }

        if (hasVideo) {
            messageTypes.videos += message.videos.length;
        }

        if (hasAudio) {
            messageTypes.audio +=
                (message.audio_files?.length || 0) +
                (message.voice_media?.length || 0);
        }

        if (hasShare) messageTypes.shared++;

        if (hasReaction) {
            messageTypes.reactions += message.reactions.length;
        }

        if (hasCall) messageTypes.calls++;

        if (
            !message.content &&
            !hasPhoto &&
            !hasVideo &&
            !hasAudio &&
            !hasShare &&
            !hasCall
        ) {
            messageTypes.other++;
        }

        return {
            sender,
            timestamp,
            content: message.content || "",
            type: message.content
                ? "text"
                : hasPhoto
                    ? "photo"
                    : hasVideo
                        ? "video"
                        : hasAudio
                            ? "audio"
                            : hasShare
                                ? "shared"
                                : hasCall
                                    ? "call"
                                    : "other",
            hasPhoto,
            hasVideo,
            hasAudio,
            hasShare,
            hasReaction,
            hasCall,
            reactions: message.reactions || [],
        };
    });

    return {
        id: path,
        title:
            data.title ||
            participants.join(", ") ||
            path.split("/").slice(-2, -1)[0],
        participants,
        messageCount: messages.length,
        firstMessageAt,
        lastMessageAt,
        people,
        messageTypes,
        timeline: Object.entries(timeline)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({ date, count })),
        messages: analyzedMessages,
    };
}

/* =========================================================
   PARSER UTAMA
========================================================= */

export async function parseInstagramZip(
    file,
    onProgress = () => {}
) {
    if (
        !file ||
        !file.name ||
        !file.name.toLowerCase().endsWith(".zip")
    ) {
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

    const jsonPaths = allFiles.filter((path) =>
        path.toLowerCase().endsWith(".json")
    );

    onProgress(15, "Membaca seluruh file JSON...");

    const documents = new Map();

    for (let i = 0; i < jsonPaths.length; i++) {
        const path = jsonPaths[i];
        const data = await readJson(zip, path);

        if (data !== null) {
            documents.set(path, data);
        }

        if (i % 5 === 0 || i === jsonPaths.length - 1) {
            onProgress(
                15 + Math.round(
                    ((i + 1) / jsonPaths.length) * 35
                ),
                `Membaca JSON ${i + 1}/${jsonPaths.length}...`
            );
        }
    }

    /* =====================================================
       FOLLOWERS DAN FOLLOWING
    ===================================================== */

    onProgress(55, "Menganalisis followers dan following...");

    const followerDocs = [...documents]
        .filter(([path]) =>
            /followers_and_following\/followers(_\d+)?\.json$/i.test(
                path.replace(/\\/g, "/")
            )
        )
        .map(([, data]) => data);

    const followingDocs = [...documents]
        .filter(([path]) =>
            /followers_and_following\/following\.json$/i.test(
                path.replace(/\\/g, "/")
            )
        )
        .map(([, data]) => data);

    const followers = uniqueEntries(
        followerDocs.flatMap((data) => extractEntries(data))
    );

    const following = uniqueEntries(
        followingDocs.flatMap((data) => extractEntries(data))
    );

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

    /* =====================================================
       KATEGORI DAN ISI JSON
    ===================================================== */

    onProgress(65, "Menganalisis kategori aktivitas...");

    const categories = {};

    for (const [path, data] of documents) {
        const key = classifyPath(path);

        if (!categories[key]) {
            categories[key] = createCategory(key);
        }

        const category = categories[key];

        category.files++;
        category.records += countRecords(data);
        category.paths.push(path);

        /*
         * Simpan data JSON asli untuk Likes, Komentar,
         * Postingan, dan Stories.
         *
         * Dengan ini halaman Content bisa membaca
         * archived_posts.json secara langsung.
         */
        if (readableCategories.has(key)) {
            category.documents.push({
                path,
                data,
                fileName: path.split("/").pop(),
                records: countRecords(data),
            });
        }
    }

    // Pastikan seluruh kategori selalu tersedia.
    for (const [key] of Object.entries(categoryLabels)) {
        if (!categories[key]) {
            categories[key] = createCategory(key);
        }
    }

    /* =====================================================
       PERCAKAPAN
    ===================================================== */

    onProgress(75, "Menganalisis seluruh percakapan...");

    const conversations = [...documents]
        .filter(([path, data]) =>
            /\/messages\/.*\.json$/i.test(
                path.replace(/\\/g, "/")
            ) &&
            Array.isArray(data?.messages)
        )
        .map(([path, data]) => analyzeConversation(path, data))
        .sort((a, b) => b.messageCount - a.messageCount);

    const messageTotals = conversations.reduce(
        (total, conversation) => {
            total.messages += conversation.messageCount;

            Object.keys(total.types).forEach((key) => {
                total.types[key] +=
                    conversation.messageTypes[key] || 0;
            });

            return total;
        },
        {
            messages: 0,
            types: {
                text: 0,
                photos: 0,
                videos: 0,
                audio: 0,
                shared: 0,
                reactions: 0,
                calls: 0,
                other: 0,
            },
        }
    );

    /* =====================================================
       INDEKS ARSIP
    ===================================================== */

    onProgress(90, "Menyusun indeks arsip...");

    const mediaFiles = allFiles.filter(
        (path) => !path.toLowerCase().endsWith(".json")
    );

    /*
     * Hindari menggandakan isi JSON besar ke dataCoverage.
     * Isi JSON tetap disimpan di categories.documents.
     */
    const dataCoverage = Object.entries(categories).map(
        ([key, value]) => ({
            key,
            label: value.label,
            files: value.files,
            records: value.records,
            paths: value.paths,
            status: value.files > 0
                ? "available"
                : "not-in-export",
        })
    );

    const report = {
        fileName: file.name,
        fileSize: file.size,
        processedAt: new Date().toISOString(),

        archiveFiles: allFiles.length,
        jsonFiles: jsonPaths.length,
        parsedJsonFiles: documents.size,
        unreadableJsonFiles: jsonPaths.length - documents.size,
        mediaFiles: mediaFiles.length,

        followers: followers.length,
        following: following.length,
        mutual: mutual.length,

        notFollowingBack,
        notFollowedByYou,

        followersList: followers,
        followingList: following,
        mutualList: mutual,

        categories,
        dataCoverage,

        conversations,
        messageTotals,

        allFilesIndex: allFiles.map((path) => ({
            path,
            type: path.toLowerCase().endsWith(".json")
                ? "json"
                : "media",
            category: classifyPath(path),
        })),
    };

    onProgress(100, "Analisis selesai.");

    return report;
}
