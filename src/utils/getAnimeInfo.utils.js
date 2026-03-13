import axios from "axios";
import { transformAnilistItem } from "./transformAnilistItem.utils";

const CACHE_PREFIX = "animeInfoCache_";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

function getCached(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < CACHE_DURATION) return data;
    localStorage.removeItem(key);
  } catch {
    // ignore parse errors
  }
  return null;
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // ignore storage errors (e.g. quota exceeded)
  }
}

/**
 * Transforms the Anilist API anime detail response into the shape
 * expected by AnimeInfo.jsx, Watch.jsx and useWatchMultiSource.
 */
function transformAnimeDetail(data, relatedAnime = []) {
  const base = transformAnilistItem(data);

  const seasons = relatedAnime
    .filter((r) =>
      ["SEQUEL", "PREQUEL", "SIDE_STORY", "ALTERNATIVE", "SPIN_OFF"].includes(
        r.type
      )
    )
    .map((r) => ({
      id: String(r.anilistId),
      data_id: r.anilistId,
      season_poster: r.image,
      season: r.title?.english || r.title?.romaji || "Related",
    }));

  const recommended_data = relatedAnime
    .map((r) => ({
      id: String(r.anilistId),
      anilistId: r.anilistId,
      title: r.title?.english || r.title?.romaji || "",
      japanese_title: r.title?.native || r.title?.romaji || "",
      poster: r.image,
      bannerImage: r.bannerImage,
      color: r.color,
      tvInfo: { showType: null, duration: null },
    }));

  return {
    data: {
      ...base,
      data_id: data.anilistId,
      animeInfo: {
        genres: data.genres || [],
        Genres: data.genres || [],
        Type: data.format,
        Studios: data.studio,
        "MAL Score": data.score ? String(data.score) : null,
        Status: data.status,
        Duration: data.duration ? `${data.duration}m` : null,
        Premiered: data.season && data.releaseDate
          ? `${data.season} ${data.releaseDate}`
          : data.releaseDate || null,
        Overview: data.synopsis || null,
        tvInfo: {
          showType: data.format,
          duration: data.duration ? `${data.duration}m` : null,
          releaseDate: data.releaseDate,
          rating: null,
          quality: null,
          sub: null,
          dub: null,
        },
        moreInfo: {
          Aired:
            data.releaseDate && data.endDate
              ? `${data.releaseDate} to ${data.endDate}`
              : data.releaseDate || null,
          Status: data.status,
          Season: data.season,
          Studios: data.studio,
          Producers: data.producers?.join(", ") || null,
        },
      },
      recommended_data,
    },
    seasons,
  };
}

export default async function fetchAnimeInfo(id, random = false) {
  const base_url = import.meta.env.VITE_ANIMEPAHE_URL;
  try {
    let anilistId = id;

    if (random) {
      // Pick a random item from the trending list
      const trendingRes = await axios.get(
        `${base_url}/api/anilist/anime/top/trending?perPage=20`
      );
      const items = trendingRes.data?.data || [];
      if (!items.length) return null;
      const randomItem = items[Math.floor(Math.random() * items.length)];
      anilistId = randomItem.anilistId;
    }

    const cacheKey = CACHE_PREFIX + anilistId;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const [infoRes, relatedRes] = await Promise.all([
      axios.get(`${base_url}/api/anilist/anime/${anilistId}`),
      axios.get(`${base_url}/api/anilist/anime/${anilistId}/related`).catch(
        () => ({ data: { data: [] } })
      ),
    ]);

    const animeData = infoRes.data?.data;
    const relatedData = relatedRes.data?.data || [];

    if (!animeData) return null;

    const result = transformAnimeDetail(animeData, relatedData);
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Error fetching anime info:", error);
    return error;
  }
}
