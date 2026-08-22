import axios from "axios";
import { apiUrl } from "@/src/config/api";

const CACHE_PREFIX = "animeInfoCache_";
const CACHE_DURATION = 60 * 60 * 1000;

function getCached(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < CACHE_DURATION) return data;
    localStorage.removeItem(key);
  } catch { /* ignore storage failures */ }
  return null;
}

function setCache(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() })); } catch { /* ignore */ }
}

function splitList(value) {
  if (Array.isArray(value)) return value;
  return typeof value === "string" ? value.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

export function transformAnimeDetail(payload = {}) {
  const apiData = payload.data || payload;
  const providerEpisodes = payload.providerEpisodes || [];
  const genres = splitList(apiData.genres);
  const episodes = providerEpisodes.map((ep) => ({
    episodeId: ep.episodeId,
    id: `ep=${ep.episodeNumber}`,
    episode_no: ep.episodeNumber,
    title: ep.title || `Episode ${ep.episodeNumber}`,
    thumbnail: null,
    hasDub: Boolean(ep.hasDub),
    hasSub: Boolean(ep.hasSub),
    aired: true,
  }));
  const base = {
    id: apiData.id ?? "",
    data_id: apiData.id ?? "",
    anilistId: apiData.anilistId ?? null,
    malId: null,
    title: apiData.name || apiData.romaji || "Untitled",
    japanese_title: apiData.native || apiData.romaji || apiData.name || "Untitled",
    poster: apiData.posterImage || "",
    bannerImage: apiData.posterImage || null,
    color: null,
    description: apiData.synopsis || "",
    episodes: episodes.length || apiData.totalEpisodes || null,
    tvInfo: {
      showType: apiData.type || null,
      duration: null,
      releaseDate: apiData.releaseDate || null,
      rating: null,
      quality: null,
      sub: episodes.filter((ep) => ep.hasSub).length || null,
      dub: episodes.filter((ep) => ep.hasDub).length || null,
    },
    genres,
    score: null,
    status: null,
    season: null,
    studio: apiData.studios || null,
    producers: [],
  };
  const animeInfo = {
    genres, Genres: genres, Type: apiData.type || null, Studios: apiData.studios || null,
    Japanese: apiData.native || null, Aired: apiData.releaseDate || null,
    Status: null, Duration: null, Premiered: apiData.releaseDate || null,
    Overview: apiData.synopsis || null, tvInfo: base.tvInfo,
    moreInfo: { Aired: apiData.releaseDate || null, Studios: apiData.studios || null, Japanese: apiData.native || null },
  };
  return { data: { ...base, animeInfo, providerEpisodes: episodes }, seasons: [], episodes };
}

export default async function fetchAnimeInfo(id) {
  try {
    const cacheKey = CACHE_PREFIX + String(id).replace(/[^a-zA-Z0-9_-]/g, "_");
    const cached = getCached(cacheKey);
    if (cached) return cached;
    const response = await axios.get(apiUrl(`/anime/${id}`));
    if (!response.data?.data?.id) return null;
    const result = transformAnimeDetail(response.data);
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Error fetching anime info:", error);
    return error;
  }
}
