import JSZip from "jszip";

/**
 * Ambil username dari string_list_data
 */
function extractFromStringList(stringList) {
    try {
        const item = stringList[0];

        if (item.value) {
            return item.value.toLowerCase();
        }

        if (item.href) {
            return item.href
                .replace(/\/$/, "")
                .split("/")
                .pop()
                .toLowerCase();
        }
    } catch (e) {
        return null;
    }

    return null;
}

/**
 * Rekursif mencari seluruh username
 */
function extractUsernames(data) {
    const usernames = new Set();

    function walk(obj) {
        if (Array.isArray(obj)) {
            obj.forEach(walk);
            return;
        }

        if (obj && typeof obj === "object") {

            if ("string_list_data" in obj) {

                const username = extractFromStringList(
                    obj.string_list_data
                );

                if (username) {
                    usernames.add(username);
                }
            }

            Object.values(obj).forEach(walk);
        }
    }

    walk(data);

    return usernames;
}

/**
 * Cari file dalam ZIP walaupun nama folder depannya berbeda
 */
function findFile(zip, fileName) {

    const keys = Object.keys(zip.files);

    const found = keys.find((key) =>
        key.endsWith(fileName)
    );

    if (!found) {
        throw new Error(`${fileName} tidak ditemukan.`);
    }

    return zip.files[found];
}

/**
 * Parsing ZIP Instagram
 */
export async function parseInstagramZip(file) {

    const zip = await JSZip.loadAsync(file);

    const followersFile = findFile(
        zip,
        "followers_and_following/followers_1.json"
    );

    const followingFile = findFile(
        zip,
        "followers_and_following/following.json"
    );

    const followersJSON = JSON.parse(
        await followersFile.async("string")
    );

    const followingJSON = JSON.parse(
        await followingFile.async("string")
    );

    const followers = extractUsernames(
        followersJSON
    );

    let following;

    if ("relationships_following" in followingJSON) {

        following = extractUsernames(
            followingJSON.relationships_following
        );

    } else {

        following = extractUsernames(
            followingJSON
        );

    }

    const mutual = new Set(
        [...followers].filter((x) =>
            following.has(x)
        )
    );

    const notFollowingBack = [...following].filter(
        (x) => !followers.has(x)
    );

    const notFollowedByYou = [...followers].filter(
        (x) => !following.has(x)
    );

    return {

        followers: followers.size,

        following: following.size,

        mutual: mutual.size,

        followersList: [...followers].sort(),

        followingList: [...following].sort(),

        mutualList: [...mutual].sort(),

        notFollowingBack: notFollowingBack.sort(),

        notFollowedByYou: notFollowedByYou.sort(),
    };
}