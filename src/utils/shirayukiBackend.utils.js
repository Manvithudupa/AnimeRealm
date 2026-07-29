import axios from "axios";
import { apiUrl } from "@/src/config/api";
import getEpisodes from "./getEpisodes.utils";
import getServersUtils from "./getServers.utils";

const _episodesByAnilistCache = new Map();
const _episodesByAnilistInFlight = new Map();
const EPISODES_CACHE_TTL_MS = 30 * 60 * 1000;
const EPISODES_CACHE_MAX_SIZE = 200;

function _evictOldestEpisodeEntry() {
  const firstKey = _episodesByAnilistCache.keys().next().value;
  if (firstKey !== undefined) _episodesByAnilistCache.delete(firstKey);
}

export async function searchAnimepaheBackend(keyword, page = 1) {
  try {
    const response = await axios.get(apiUrl('/search'), { params: { q: keyword, page } });
    return response.data;
  } catch (error) {
    console.error("Error searching anime:", error);
    throw error;
  }
}

export async function getAnimepaheInfo(animeId) {
  try {
    const response = await axios.get(apiUrl(`/anime/${animeId}`));
    return response.data;
  } catch (error) {
    console.error("Error fetching anime info:", error);
    throw error;
  }
}

export async function getAnimepaheEpisodes(animeId) {
  try {
    const result = await getEpisodes(animeId);
    return {
      episodes: result.episodes || [],
      totalEpisodes: result.totalEpisodes || 0,
    };
  } catch (error) {
    console.error("Error fetching episodes:", error);
    throw error;
  }
}

export async function getAnimepaheEpisodesByAnilistId(anilistId) {
  const key = String(anilistId);

  const cached = _episodesByAnilistCache.get(key);
  if (cached && Date.now() - cached.timestamp < EPISODES_CACHE_TTL_MS) {
    return cached.data;
  }

  if (_episodesByAnilistInFlight.has(key)) {
    return _episodesByAnilistInFlight.get(key);
  }

  const fetchPromise = (async () => {
    try {
      const result = await getEpisodes(anilistId);
      const transformedEpisodes = (result.episodes || []).map((ep) => ({
        id: ep.id,
        episode_no: ep.episode_no,
        episodeId: ep.episodeId,
        title: ep.title || `Episode ${ep.episode_no}`,
        thumbnail: ep.thumbnail,
      }));

      const data = {
        episodes: transformedEpisodes,
        totalEpisodes: result.totalEpisodes || transformedEpisodes.length,
        provider: "shirayuki",
      };

      _episodesByAnilistCache.set(key, { data, timestamp: Date.now() });
      if (_episodesByAnilistCache.size > EPISODES_CACHE_MAX_SIZE) _evictOldestEpisodeEntry();
      return data;
    } catch (error) {
      if (error.response) {
        console.warn("Episodes not available:", error.response.data?.error || error.message);
        const emptyResult = { episodes: [], totalEpisodes: 0, provider: null };
        _episodesByAnilistCache.set(key, { data: emptyResult, timestamp: Date.now() });
        if (_episodesByAnilistCache.size > EPISODES_CACHE_MAX_SIZE) _evictOldestEpisodeEntry();
        return emptyResult;
      }
      console.error("Error fetching episodes by ID:", error);
      throw error;
    } finally {
      _episodesByAnilistInFlight.delete(key);
    }
  })();

  _episodesByAnilistInFlight.set(key, fetchPromise);
  return fetchPromise;
}

export async function getAnimepaheServers(episodeId) {
  try {
    return await getServersUtils(episodeId);
  } catch (error) {
    console.error("Error fetching servers:", error);
    throw error;
  }
}

export async function getRecentEpisodes() {
  try {
    const response = await axios.get(apiUrl('/home'));
    const data = response.data?.data || {};
    return { data: data.latestEpisodes || [] };
  } catch (error) {
    console.error("Error fetching recent episodes:", error);
    throw error;
  }
}

export async function getAnimepaheStreamInfo(episodeId, version = "sub", serverName = "hd-1") {
  try {
    const parts = episodeId.split("/ep-");
    const animeEpisodeId = parts[0] || episodeId;
    const ep = parts[1] || episodeId;

    const response = await axios.get(apiUrl('/episode/sources'), {
      params: { animeEpisodeId, ep, server: serverName, category: version },
    });
    const data = response.data?.data || {};
    const sources = data.sources || [];
    const primarySource = sources[0] || {};
    const tracks = data.tracks || [];

    const headers = primarySource.referer
      ? { Referer: primarySource.referer }
      : { Referer: "https://hi-anime.me/" };

    return {
      sources: primarySource.m3u8
        ? [{ url: primarySource.m3u8, isM3u8: primarySource.type === "m3u8", type: primarySource.type || "hls", quality: "auto" }]
        : [],
      headers,
      subtitles: tracks.filter(t => t.kind === "captions").map(t => ({
        file: t.file,
        label: t.label || "English",
        kind: "captions",
        default: t.default || false,
      })),
      intro: data.intro || null,
      outro: data.outro || null,
      thumbnail: null,
    };
  } catch (error) {
    console.error("Error fetching stream info:", error);
    throw error;
  }
}
