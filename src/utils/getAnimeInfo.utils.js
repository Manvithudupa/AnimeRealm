import axios from "axios";
import { apiUrl } from "@/src/config/api";

const CACHE_PREFIX = "animeInfoCache_";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

function getCached(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < CACHE_DURATION) return data;
    localStorage.removeItem(key);
  } catch { /* ignore */ }
  return null;
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch { /* ignore */ }
}

/**
 * Transform the Shirayuki anime detail response into the shape expected by
 * AnimeInfo.jsx, Watch.jsx and useWatchMultiSource.
 *
 * Actual API response shape (live-tested):
 * {
 *   data: {
 *     id: "attack-on-titan",
 *     title: "Attack on Titan",
 *     jname: "Shingeki no Kyojin",
 *     ename: "Attack on Titan",
 *     description: "...",
 *     poster: "https://...",
 *     cover: "https://...",
 *     stats: { pg: "R", type: "TV", year: 2013, sub: 25, dub: 25 },
 *     info: {
 *       japanese: "...",
 *       aired: "Apr 7, 2013 ...",
 *       premiered: "2013",
 *       duration: "24",  // minutes as string
 *       status: "Finished Airing",
 *       "mal score": "0.",
 *       genres: [ { name: "Action", slug: "action" } ],
 *       studios: null,
 *       producers: null
 *     },
 *     recommended: [ ... ],
 *     trending: [ ... ],
 *     seasons: [ { order, id, title, jname, ename, poster, type, episodes: {sub, dub}, isCurrent } ]
 *   }
 * }
 */
function transformAnimeDetail(apiData) {
  const info = apiData.info || {};
  const stats = apiData.stats || {};
  const genresList = (info.genres || []).map(g => g.name || g).filter(Boolean);

  const base = {
    id: apiData.id || "",
    anilistId: apiData.id || "",
    malId: null,
    title: apiData.title || apiData.ename || apiData.jname || "",
    japanese_title: apiData.jname || apiData.title || "",
    poster: apiData.poster || "",
    bannerImage: apiData.cover || apiData.poster || null,
    color: null,
    description: apiData.description || "",
    episodes: stats.sub || info.sub || null,
    tvInfo: {
      showType: stats.type || info.type || null,
      duration: info.duration ? `${info.duration}m` : null,
      releaseDate: info.premiered || null,
      rating: stats.pg || null,
      quality: null,
      sub: stats.sub || null,
      dub: stats.dub || null,
    },
    genres: genresList,
    score: info["mal score"] || null,
    status: info.status || null,
    season: null,
    studio: info.studios || null,
    producers: info.producers ? (Array.isArray(info.producers) ? info.producers : [info.producers]) : [],
  };

  // Map seasons from the API response
  const seasons = (apiData.seasons || []).map((s) => ({
    id: s.id || "",
    data_id: s.id || "",
    season_poster: s.poster || apiData.poster || "",
    season: s.title || s.ename || s.jname || s.id || "Related",
  }));

  // Map recommended anime
  const recommended_data = (apiData.recommended || []).map((r) => ({
    id: r.id || "",
    anilistId: r.id || "",
    title: r.title || r.ename || r.jname || "",
    japanese_title: r.jname || r.title || "",
    poster: r.poster || "",
    bannerImage: null,
    color: null,
    tvInfo: { showType: r.type || null, duration: r.duration || null },
  }));

  const moreInfo = {
    Aired: info.aired || null,
    Status: info.status || null,
    Season: null,
    Studios: info.studios || null,
    Producers: info.producers || null,
    Japanese: info.japanese || null,
    Synonyms: null,
  };

  const animeInfo = {
    genres: genresList,
    Genres: genresList,
    Type: stats.type || info.type || null,
    Studios: info.studios || null,
    Japanese: info.japanese || null,
    Aired: info.aired || null,
    "MAL Score": info["mal score"] || null,
    Status: info.status || null,
    Duration: info.duration ? `${info.duration}m` : null,
    Premiered: info.premiered || null,
    Overview: apiData.description || null,
    tvInfo: {
      showType: stats.type || null,
      duration: info.duration ? `${info.duration}m` : null,
      releaseDate: info.premiered || null,
      rating: stats.pg || null,
      quality: null,
      sub: stats.sub || null,
      dub: stats.dub || null,
    },
    moreInfo,
  };

  return {
    data: {
      ...base,
      data_id: apiData.id || "",
      animeInfo,
      recommended_data,
    },
    seasons,
  };
}

export default async function fetchAnimeInfo(id, random = false) {
  try {
    // If random, get a random trending item from the home endpoint
    if (random) {
      const trendingRes = await axios.get(apiUrl('/home'));
      const items = trendingRes.data?.data?.trending || [];
      if (!items.length) return null;
      const randomItem = items[Math.floor(Math.random() * items.length)];
      id = randomItem.id;
    }

    // Use the slug/anilistId as the cache key
    const cacheKey = CACHE_PREFIX + String(id).replace(/[^a-zA-Z0-9_-]/g, '_');
    const cached = getCached(cacheKey);
    if (cached) return cached;

    // Fetch anime detail from Shirayuki API
    const response = await axios.get(apiUrl(`/anime/${id}`));
    const responseData = response.data?.data || {};

    if (!responseData || !responseData.id) return null;

    const result = transformAnimeDetail(responseData);
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Error fetching anime info:", error);
    return error;
  }
}
