import axios from "axios";

const BASE_URL = import.meta.env.VITE_ANIMEPAHE_URL;

/**
 * Get episodes for an anime using AniList ID via the anilist episodes API
 * @param {string|number} anilistId - AniList anime ID
 * @returns {Promise} Episodes list
 */
export async function getAnizoneEpisodesByAnilistId(anilistId) {
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

    return {
      episodes: transformedEpisodes,
      totalEpisodes: providerEpisodes.length,
    };
  } catch (error) {
    if (error.response) {
      console.warn(
        "Anizone episodes not available for this title:",
        error.response.data?.error || error.message
      );
      return { episodes: [], totalEpisodes: 0 };
    }
    console.error("Error fetching Anizone episodes by AniList ID:", error);
    throw error;
  }
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

    return {
      sources: sources.map((source) => ({
        url: source.url,
        isM3u8: source.isM3u8,
        type: source.type,
      })),
      subtitles,
      headers: response.data?.headers || {},
    };
  } catch (error) {
    console.error("Error fetching Anizone stream info:", error);
    throw error;
  }
}
