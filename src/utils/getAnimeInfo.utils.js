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

function mapEpisodes(providerEpisodes = []) {
  return providerEpisodes.map((ep) => ({
    episodeId: ep.episodeId,
    id: `ep=${ep.episodeNumber}`,
    episode_no: ep.episodeNumber,
    title: ep.title || `Episode ${ep.episodeNumber}`,
    thumbnail: null,
    hasDub: Boolean(ep.hasDub),
    hasSub: Boolean(ep.hasSub),
    aired: true,
  }));
}

export function transformAnimeDetail(payload = {}, metadata = null) {
  const providerData = payload.data || {};
  const metadataData = metadata?.data || {};
  const providerEpisodes = payload.providerEpisodes || [];
  const title = metadataData.title || {};
  const genres = splitList(providerData.genres).length ? splitList(providerData.genres) : (metadataData.genres || []);
  const episodes = mapEpisodes(providerEpisodes);
  const base = {
    id: providerData.id ?? metadataData.id ?? "",
    data_id: providerData.id ?? metadataData.id ?? "",
    providerId: providerData.id ?? null,
    anilistId: providerData.anilistId ?? metadataData.id ?? null,
    malId: metadataData.malId ?? null,
    title: providerData.name || title.english || title.romaji || "Untitled",
    japanese_title: providerData.native || title.native || title.romaji || providerData.name || "Untitled",
    poster: providerData.posterImage || metadataData.image || "",
    bannerImage: metadataData.bannerImage || providerData.posterImage || null,
    color: metadataData.color || null,
    description: providerData.synopsis || metadataData.synopsis || "",
    episodes: episodes.length || Number(providerData.totalEpisodes || metadataData.episodes) || null,
    tvInfo: {
      showType: providerData.type || metadataData.format || null,
      duration: metadataData.duration ? `${metadataData.duration}m` : null,
      releaseDate: providerData.releaseDate || metadataData.releaseDate || null,
      rating: null,
      quality: null,
      sub: episodes.filter((ep) => ep.hasSub).length || null,
      dub: episodes.filter((ep) => ep.hasDub).length || null,
    },
    genres,
    score: metadataData.score ?? null,
    status: metadataData.status || null,
    season: metadataData.season || null,
    studio: providerData.studios || metadataData.studio || null,
    producers: metadataData.producers || [],
  };
  const animeInfo = {
    genres, Genres: genres, Type: base.tvInfo.showType, Studios: base.studio,
    Japanese: base.japanese_title, Aired: base.tvInfo.releaseDate, Status: base.status,
    Duration: base.tvInfo.duration, Premiered: base.tvInfo.releaseDate,
    Overview: base.description, "MAL Score": base.score, tvInfo: base.tvInfo,
    moreInfo: { Aired: base.tvInfo.releaseDate, Studios: base.studio, Japanese: base.japanese_title, Status: base.status },
  };
  return { data: { ...base, animeInfo, providerEpisodes: episodes }, seasons: [], episodes };
}

async function fetchJson(url) {
  try {
    const response = await axios.get(url);
    return response.data || null;
  } catch { return null; }
}

export default async function fetchAnimeInfo(id) {
  const cacheKey = CACHE_PREFIX + String(id).replace(/[^a-zA-Z0-9_-]/g, "_");
  const cached = getCached(cacheKey);
  if (cached) return cached;
  try {
    let providerPayload = await fetchJson(apiUrl(`/anime/${id}`));
    let metadata = null;
    if (!providerPayload?.data?.id && /^\d+$/.test(String(id))) {
      metadata = await fetchJson(apiUrl(`/anime/${id}`, "anilist"));
      const mapping = await fetchJson(apiUrl(`/anime/${id}/mappings?provider=anibd`, "anilist"));
      const providerId = mapping?.data?.provider?.id;
      if (providerId) providerPayload = await fetchJson(apiUrl(`/anime/${providerId}`));
      if (!providerPayload?.data?.id && metadata?.data?.id) {
        const result = transformAnimeDetail({}, metadata);
        setCache(cacheKey, result);
        return result;
      }
    }
    if (!providerPayload?.data?.id) return null;
    if (!metadata && providerPayload.data.anilistId) {
      metadata = await fetchJson(apiUrl(`/anime/${providerPayload.data.anilistId}`, "anilist"));
    }
    const result = transformAnimeDetail(providerPayload, metadata);
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Error fetching anime info:", error);
    return null;
  }
}
