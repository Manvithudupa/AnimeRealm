import axios from "axios";

const BASE_URL = import.meta.env.VITE_ANIMEPAHE_URL;

/**
 * Get episodes for an anime using the kaido API
 * @param {string} animeId - Anime ID slug (e.g. "bleach-thousand-year-blood-war-the-conflict-19322")
 * @returns {Promise} Episodes list
 */
export async function getKaidoEpisodes(animeId) {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/kaido/anime/${animeId}/episodes`
    );
    const episodes = response.data?.data || [];

    const transformedEpisodes = episodes.map((ep) => ({
      id: `ep=${ep.episodeNumber}`,
      episode_no: ep.episodeNumber,
      episodeId: ep.episodeId,
      title: ep.title || ep.romaji || `Episode ${ep.episodeNumber}`,
      thumbnail: null,
    }));

    return {
      episodes: transformedEpisodes,
      totalEpisodes: episodes.length,
    };
  } catch (error) {
    console.error("Error fetching Kaido episodes:", error);
    throw error;
  }
}

/**
 * Get episodes for an anime using AniList ID via the hianime mapping then kaido episodes API
 * @param {string|number} anilistId - AniList anime ID
 * @returns {Promise} Episodes list
 */
export async function getKaidoEpisodesByAnilistId(anilistId) {
  try {
    // Step 1: Get the hianime provider ID via the anilist mappings endpoint
    const mappingResponse = await axios.get(
      `${BASE_URL}/api/anilist/mappings/${anilistId}?provider=hianime`
    );
    const providerId = mappingResponse.data?.provider?.id;

    if (!providerId) {
      console.warn("No hianime provider ID found for anilistId:", anilistId);
      return { episodes: [], totalEpisodes: 0 };
    }

    // Step 2: Fetch episodes from kaido using the hianime provider ID
    return await getKaidoEpisodes(providerId);
  } catch (error) {
    if (error.response) {
      console.warn(
        "Kaido episodes not available for this title:",
        error.response.data?.error || error.message
      );
      return { episodes: [], totalEpisodes: 0 };
    }
    console.error("Error fetching Kaido episodes by AniList ID:", error);
    throw error;
  }
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
