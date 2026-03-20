import axios from "axios";

const BASE_URL = import.meta.env.VITE_ANIMEPAHE_URL;

// Module-level cache for kaido episodes keyed by anilist ID string.
// Prevents redundant network calls from rapid re-renders, React StrictMode
// double-invocation, and the checkNewEpisodes background scan iterating over
// every anime in the user's watchlist.
const _episodesCache = new Map(); // key -> { data, timestamp }
const _episodesInFlight = new Map(); // key -> Promise (deduplicates concurrent calls)
const EPISODES_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const EPISODES_CACHE_MAX_SIZE = 200; // evict oldest entries beyond this limit

function _evictOldestCacheEntry() {
  // Map iterates in insertion order; the first entry is the oldest.
  const firstKey = _episodesCache.keys().next().value;
  if (firstKey !== undefined) {
    _episodesCache.delete(firstKey);
  }
}

/**
 * Get episodes for an anime using AniList ID via the anilist episodes endpoint with kaido provider
 * @param {string|number} anilistId - AniList anime ID
 * @returns {Promise} Episodes list
 */
export async function getKaidoEpisodesByAnilistId(anilistId) {
  const key = String(anilistId);

  // Return cached result if still within TTL.
  const cached = _episodesCache.get(key);
  if (cached && Date.now() - cached.timestamp < EPISODES_CACHE_TTL_MS) {
    return cached.data;
  }

  // Deduplicate concurrent requests for the same anilist ID.
  if (_episodesInFlight.has(key)) {
    return _episodesInFlight.get(key);
  }

  const fetchPromise = (async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/anilist/episodes/${anilistId}?provider=kaido`
      );
      const providerEpisodes = response.data?.providerEpisodes || [];

      const transformedEpisodes = providerEpisodes.map((ep) => ({
        id: `ep=${ep.episodeNumber}`,
        episode_no: ep.episodeNumber,
        episodeId: ep.episodeId,
        title: ep.title || `Episode ${ep.episodeNumber}`,
        thumbnail: ep.thumbnail || null,
      }));

      const result = {
        episodes: transformedEpisodes,
        totalEpisodes: providerEpisodes.length,
      };

      _episodesCache.set(key, { data: result, timestamp: Date.now() });
      if (_episodesCache.size > EPISODES_CACHE_MAX_SIZE) {
        _evictOldestCacheEntry();
      }
      return result;
    } catch (error) {
      if (error.response) {
        console.warn(
          "Kaido episodes not available for this title:",
          error.response.data?.error || error.message
        );
        const emptyResult = { episodes: [], totalEpisodes: 0 };
        // Cache empty results too so repeated failures don't hammer the API.
        _episodesCache.set(key, { data: emptyResult, timestamp: Date.now() });
        if (_episodesCache.size > EPISODES_CACHE_MAX_SIZE) {
          _evictOldestCacheEntry();
        }
        return emptyResult;
      }
      console.error("Error fetching Kaido episodes by AniList ID:", error);
      throw error;
    } finally {
      _episodesInFlight.delete(key);
    }
  })();

  _episodesInFlight.set(key, fetchPromise);
  return fetchPromise;
}

/**
 * Get available streaming servers for a specific episode using the kaido API
 * @param {string} episodeId - Episode ID
 * @returns {Promise} Servers list
 */
export async function getKaidoServers(episodeId) {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/kaido/episode/${episodeId}/servers`
    );
    const data = response.data?.data || {};
    const servers = [];

    if (data.sub && data.sub.length > 0) {
      data.sub.forEach((server, index) => {
        servers.push({
          serverId: server.serverId,
          serverName: `SUB-${index + 1}`,
          displayName: server.serverName,
          type: "sub",
          mediaId: server.mediaId,
          data_id: `sub-${server.serverId}`,
          server_id: `sub-${index}`,
        });
      });
    }

    if (data.dub && data.dub.length > 0) {
      data.dub.forEach((server, index) => {
        servers.push({
          serverId: server.serverId,
          serverName: `DUB-${index + 1}`,
          displayName: server.serverName,
          type: "dub",
          mediaId: server.mediaId,
          data_id: `dub-${server.serverId}`,
          server_id: `dub-${index}`,
        });
      });
    }

    if (data.raw && data.raw.length > 0) {
      data.raw.forEach((server, index) => {
        servers.push({
          serverId: server.serverId,
          serverName: `RAW-${index + 1}`,
          displayName: server.serverName,
          type: "raw",
          mediaId: server.mediaId,
          data_id: `raw-${server.serverId}`,
          server_id: `raw-${index}`,
        });
      });
    }

    return { servers };
  } catch (error) {
    console.error("Error fetching Kaido servers:", error);
    throw error;
  }
}

/**
 * Get streaming sources for a specific episode using the kaido API
 * @param {string} episodeId - Episode ID
 * @param {string} version - Language preference: sub, dub, raw (default: "sub")
 * @param {string} server - Streaming server: vidstreaming, vidcloud (default: "vidcloud")
 * @returns {Promise} Streaming sources with M3U8 URLs, subtitles, intro/outro timings
 */
export async function getKaidoStreamInfo(
  episodeId,
  version = "sub",
  server = "vidcloud"
) {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/kaido/sources/${episodeId}?version=${version}&server=${encodeURIComponent(server)}`
    );
    const data = response.data?.data || {};
    const sources = data.sources || [];

    const subtitles = (data.subtitles || []).map((sub) => ({
      file: sub.url || sub.file,
      label: sub.lang || sub.label,
      kind: sub.kind || "captions",
      default: sub.default || false,
    }));

    const intro = data.intro
      ? { start: data.intro.start, end: data.intro.end }
      : null;

    const outro = data.outro
      ? { start: data.outro.start, end: data.outro.end }
      : null;

    return {
      sources: sources.map((source) => ({
        url: source.url,
        isM3u8: source.isM3u8,
        type: source.type,
      })),
      subtitles,
      intro,
      outro,
      headers: response.data?.headers || {},
      syncData: response.data?.syncData || null,
    };
  } catch (error) {
    console.error("Error fetching Kaido stream info:", error);
    throw error;
  }
}
