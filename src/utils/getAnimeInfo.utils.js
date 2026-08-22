import axios from "axios";
import { apiUrl } from "@/src/config/api";
import { transformAnilistItem } from "./transformAnilistItem.utils";

const CACHE_PREFIX = "animeInfoCache_anilist_v2_";
const CACHE_DURATION = 60 * 60 * 1000;

function getCached(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < CACHE_DURATION) return data;
    localStorage.removeItem(key);
  } catch {
    // Local storage is optional and can be unavailable in private browsing.
  }
  return null;
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // Ignore storage failures; the page can still use the fresh result.
  }
}

function unwrapData(payload) {
  if (payload?.data && !Array.isArray(payload.data)) return payload.data;
  return payload || {};
}

function mapAniListEpisodes(payload) {
  const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload?.episodes) ? payload.episodes : [];
  return items
    .map((episode, index) => {
      const episodeNumber = Number(episode.episodeNumber ?? episode.number ?? episode.episode ?? index + 1);
      if (!Number.isFinite(episodeNumber)) return null;
      return {
        episodeId: null,
        id: `ep=${episodeNumber}`,
        episode_no: episodeNumber,
        title: episode.title || `Episode ${episodeNumber}`,
        thumbnail: episode.thumbnail || episode.image || null,
        overview: episode.overview || episode.synopsis || null,
        airDate: episode.airDate || episode.releaseDate || null,
        aired: episode.aired !== false,
        hasDub: null,
        hasSub: null,
        isFiller: Boolean(episode.isFiller || episode.filler),
      };
    })
    .filter(Boolean)
    .filter((episode, index, all) => all.findIndex((item) => item.episode_no === episode.episode_no) === index)
    .sort((a, b) => a.episode_no - b.episode_no);
}

function buildAnimeInfo(base) {
  const tvInfo = base.tvInfo || {};
  return {
    genres: base.genres || [],
    Genres: base.genres || [],
    Type: tvInfo.showType,
    Studios: base.studio,
    Japanese: base.japanese_title,
    Aired: tvInfo.releaseDate,
    Status: base.status,
    Duration: tvInfo.duration,
    Premiered: tvInfo.releaseDate,
    Overview: base.description,
    "MAL Score": base.score,
    tvInfo,
    moreInfo: {
      Aired: tvInfo.releaseDate,
      Studios: base.studio,
      Japanese: base.japanese_title,
      Status: base.status,
    },
  };
}

function transformAnimeDetail(metadataPayload, episodePayload, relatedPayload) {
  const metadata = unwrapData(metadataPayload);
  const episodes = mapAniListEpisodes(episodePayload);
  const base = transformAnilistItem({
    ...metadata,
    poster: metadata.image || metadata.poster,
    type: metadata.format || metadata.type,
    releaseDate: metadata.releaseDate || metadata.startDate,
    studio: metadata.studio || metadata.studios,
    producers: metadata.producers || [],
  });
  const relatedRecords = Array.isArray(relatedPayload?.data)
    ? relatedPayload.data
    : Array.isArray(relatedPayload?.relations)
      ? relatedPayload.relations
      : Array.isArray(relatedPayload?.edges)
        ? relatedPayload.edges.map((edge) => edge.node || edge)
        : [];
  const relatedItems = relatedRecords
    .map((item) => item?.media || item)
    .map(transformAnilistItem)
    .filter((item) => item.id && item.id !== base.id);
  const episodeCount = base.episodes ?? episodes.length ?? null;
  const data = {
    ...base,
    episodes: episodeCount,
    providerId: null,
    providerEpisodes: [],
    providerEpisodesByProvider: {},
    animeInfo: buildAnimeInfo(base),
    recommended_data: relatedItems,
  };

  return {
    data,
    seasons: [],
    episodes,
    recommended_data: relatedItems,
  };
}

async function fetchJson(url, config = {}) {
  try {
    const response = await axios.get(url, { timeout: 18000, ...config });
    return response.data || null;
  } catch (error) {
    console.warn(`AniList request failed for ${url}:`, error?.message || error);
    return null;
  }
}

export default async function fetchAnimeInfo(id) {
  const numericId = String(id || "").trim();
  if (!/^\d+$/.test(numericId)) return null;

  const cacheKey = CACHE_PREFIX + numericId;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const [metadata, episodes] = await Promise.all([
      fetchJson(apiUrl(`/anime/${numericId}`, "anilist")),
      fetchJson(apiUrl(`/anime/${numericId}/episodes`, "anilist")),
    ]);

    if (!metadata?.data?.id && !metadata?.id) return null;
    const metadataData = unwrapData(metadata);
    const result = transformAnimeDetail(metadata, episodes, {
      data: metadataData.relatedAnime || metadataData.relations || metadataData.recommendations || [],
    });
    setCache(cacheKey, result);
    return result;
  } catch (error) {
    console.error("Error fetching AniList anime info:", error);
    return null;
  }
}

export { mapAniListEpisodes, transformAnimeDetail };
