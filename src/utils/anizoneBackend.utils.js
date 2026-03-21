import axios from "axios";

const BASE_URL = import.meta.env.VITE_ANIMEPAHE_URL;

// Module-level cache for anizone episodes keyed by anilist ID string.
// Prevents redundant network calls from rapid re-renders and the
// source-fallback chain in useWatchMultiSource.
const _episodesCache = new Map(); // key -> { data, timestamp }
const _episodesInFlight = new Map(); // key -> Promise (deduplicates concurrent calls)
const EPISODES_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const EPISODES_CACHE_MAX_SIZE = 200;

function _evictOldestEpisodeEntry() {
  const firstKey = _episodesCache.keys().next().value;
  if (firstKey !== undefined) {
    _episodesCache.delete(firstKey);
  }
}

/**
 * Get episodes for an anime using AniList ID via the anilist episodes API
 * @param {string|number} anilistId - AniList anime ID
 * @returns {Promise} Episodes list
 */
export async function getAnizoneEpisodesByAnilistId(anilistId) {
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
        `${BASE_URL}/api/anilist/episodes/${anilistId}?provider=anizone`
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
        _evictOldestEpisodeEntry();
      }
      return result;
    } catch (error) {
      if (error.response) {
        console.warn(
          "Anizone episodes not available for this title:",
          error.response.data?.error || error.message
        );
        const emptyResult = { episodes: [], totalEpisodes: 0 };
        // Cache empty results too so repeated failures don't hammer the API.
        _episodesCache.set(key, { data: emptyResult, timestamp: Date.now() });
        if (_episodesCache.size > EPISODES_CACHE_MAX_SIZE) {
          _evictOldestEpisodeEntry();
        }
        return emptyResult;
      }
      console.error("Error fetching Anizone episodes by AniList ID:", error);
      throw error;
    } finally {
      _episodesInFlight.delete(key);
    }
  })();

  _episodesInFlight.set(key, fetchPromise);
  return fetchPromise;
}

/**
 * Get streaming sources for an episode using the anizone API
 * @param {string} episodeId - Episode ID
 * @returns {Promise} Streaming sources with M3U8 URLs and subtitles
 */
export async function getAnizoneStreamInfo(episodeId) {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/anizone/sources/${episodeId}`
    );
    const data = response.data?.data || {};
    const sources = data.sources || [];

    const subtitles = (data.subtitles || []).map((sub) => ({
      file: sub.url,
      label: sub.lang,
      kind: "captions",
      default: sub.default || false,
    }));

    const posterImage = data.posterImage || null;
    const thumbnailTrack = (data.tracks || []).find((t) => t.type === "thumbnails")?.url || null;

    return {
      sources: sources.map((source) => ({
        url: source.url,
        isM3u8: source.isM3u8,
        type: source.type,
      })),
      subtitles,
      posterImage,
      thumbnail: thumbnailTrack,
      headers: response.data?.headers || {},
    };
  } catch (error) {
    console.error("Error fetching Anizone stream info:", error);
    throw error;
  }
}
