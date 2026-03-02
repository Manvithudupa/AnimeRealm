import axios from "axios";

const BASE_URL = import.meta.env.VITE_ANIMEPAHE_URL;

/**
 * Search for anime on Animepahe
 * @param {string} keyword - Anime title to search
 * @param {number} page - Page number (default: 1)
 * @returns {Promise} Search results with anime list
 */
export async function searchAnimepaheBackend(keyword, page = 1) {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/animepahe/anime/search?q=${encodeURIComponent(keyword)}&page=${page}`
    );
    return response.data;
  } catch (error) {
    console.error("Error searching Animepahe:", error);
    throw error;
  }
}

/**
 * Get anime info by ID
 * @param {string} animeId - Animepahe anime ID
 * @returns {Promise} Anime information
 */
export async function getAnimepaheInfo(animeId) {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/animepahe/anime/${animeId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching Animepahe anime info:", error);
    throw error;
  }
}

/**
 * Get episodes for an anime
 * @param {string} animeId - Animepahe anime ID
 * @returns {Promise} Episodes list
 */
export async function getAnimepaheEpisodes(animeId) {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/animepahe/anime/${animeId}/episodes`
    );
    const episodes = response.data?.data || [];
    
    // Transform episodes to match expected format
    const transformedEpisodes = episodes.map((ep) => ({
      id: `ep=${ep.episodeNumber}`, // Match format: ep=1, ep=2, etc.
      episode_no: ep.episodeNumber,
      episodeId: ep.episodeId,
      title: ep.title || `Episode ${ep.episodeNumber}`,
      thumbnail: ep.thumbnail,
    }));

    return {
      episodes: transformedEpisodes,
      totalEpisodes: episodes.length,
    };
  } catch (error) {
    console.error("Error fetching Animepahe episodes:", error);
    throw error;
  }
}

/**
 * Get servers/sources for an episode
 * @param {string} episodeId - Animepahe episode ID
 * @returns {Promise} Available servers
 */
export async function getAnimepaheServers(episodeId) {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/animepahe/episode/${episodeId}/servers`
    );
    
    const servers = [];
    const data = response.data?.data || {};

    // Create server entries for sub, dub, and raw
    if (data.sub && data.sub.length > 0) {
      data.sub.forEach((server, index) => {
        servers.push({
          serverId: server.serverId,
          serverName: `SUB-${index + 1}`,
          displayName: server.serverName,
          type: "sub",
          mediaId: server.mediaId,
          data_id: server.serverId,
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
          data_id: server.serverId,
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
          data_id: server.serverId,
          server_id: `raw-${index}`,
        });
      });
    }

    return servers;
  } catch (error) {
    console.error("Error fetching Animepahe servers:", error);
    throw error;
  }
}

/**
 * Get streaming sources for an episode
 * @param {string} episodeId - Animepahe episode ID
 * @param {string} version - 'sub', 'dub', or 'raw' (default: 'sub')
 * @returns {Promise} Streaming sources with M3U8 URLs
 */
export async function getAnimepaheStreamInfo(episodeId, version = "sub") {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/animepahe/sources/${episodeId}?version=${version}`
    );
    
    const sources = response.data?.data?.sources || [];
    
    // Transform sources to match expected format
    const transformedSources = sources.map((source) => ({
      url: source.url,
      isM3u8: source.isM3u8,
      type: source.type,
      quality: source.quality,
    }));

    return {
      sources: transformedSources,
      headers: response.data?.headers || { Referer: "https://pahe.win/" },
    };
  } catch (error) {
    console.error("Error fetching Animepahe stream info:", error);
    throw error;
  }
}
