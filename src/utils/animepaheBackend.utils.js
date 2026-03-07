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
      // Use wsrv.nl image proxy for animepahe thumbnails (more reliable)
      thumbnail: ep.thumbnail
        ? `https://wsrv.nl/?url=${encodeURIComponent(ep.thumbnail)}&n=-1`
        : undefined,
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
 * @returns {Promise} Object with servers and download options
 */
export async function getAnimepaheServers(episodeId) {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/animepahe/episode/${episodeId}/servers`
    );

    const servers = [];
    const data = response.data?.data || {};
    const downloadData = response.data?.download || {};

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

    // Prepare download options from response
    const downloadOptions = {
      sub: [],
      dub: [],
      raw: [],
      episodeNumber: downloadData.episodeNumber || data.episodeNumber || null,
    };

    if (downloadData.sub && Array.isArray(downloadData.sub)) {
      downloadOptions.sub = downloadData.sub.map((item) => ({
        serverId: item.serverId,
        serverName: item.serverName,
        mediaId: item.mediaId,
      }));
    }

    if (downloadData.dub && Array.isArray(downloadData.dub)) {
      downloadOptions.dub = downloadData.dub.map((item) => ({
        serverId: item.serverId,
        serverName: item.serverName,
        mediaId: item.mediaId,
      }));
    }

    if (downloadData.raw && Array.isArray(downloadData.raw)) {
      downloadOptions.raw = downloadData.raw.map((item) => ({
        serverId: item.serverId,
        serverName: item.serverName,
        mediaId: item.mediaId,
      }));
    }

    return {
      servers,
      downloadOptions,
    };
  } catch (error) {
    console.error("Error fetching Animepahe servers:", error);
    throw error;
  }
}

/**
 * Extract m3u8 URL from HTML player page
 * @param {string} html - HTML content
 * @returns {string|null} m3u8 URL if found
 */
function extractM3u8FromHtml(html) {
  // Try multiple patterns to find m3u8 URL
  const patterns = [
    // Pattern 1: "url":"https://..."
    /"url"\s*:\s*"([^"]*\.m3u8[^"]*)"/i,
    // Pattern 2: url: 'https://...'
    /url\s*:\s*'([^']*\.m3u8[^']*)'/i,
    // Pattern 3: src="https://...m3u8..."
    /src="([^"]*\.m3u8[^"]*)"/i,
    // Pattern 4: data-src="https://...m3u8..."
    /data-src="([^"]*\.m3u8[^"]*)"/i,
    // Pattern 5: .m3u8 in script tag
    /["']([^"']*\.m3u8[^"']*)["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      const url = match[1]
        .replace(/\\u002F/g, "/")
        .replace(/\\\//g, "/");
      if (url.startsWith("http")) {
        return url;
      }
    }
  }

  return null;
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

    let sources = response.data?.data?.sources || [];

    // Handle case where backend returns HTML player instead of JSON
    if (typeof response.data === "string" || (sources.length === 0 && typeof response.data === "string")) {
      console.warn("Backend returned HTML instead of JSON. Attempting to parse...");
      const htmlContent = typeof response.data === "string" ? response.data : new XMLSerializer().serializeToString(response.data);
      const m3u8Url = extractM3u8FromHtml(htmlContent);

      if (m3u8Url) {
        console.log("Extracted m3u8 URL from HTML:", m3u8Url);
        sources = [
          {
            url: m3u8Url,
            isM3u8: true,
            type: "hls",
            quality: "auto",
          },
        ];
      } else {
        console.error("Could not extract m3u8 URL from HTML response");
      }
    }

    // Also try to extract from HTML if sources is empty
    if (sources.length === 0 && typeof response.data !== "object") {
      console.warn("No sources found in response. Attempting HTML parse...");
      const m3u8Url = extractM3u8FromHtml(JSON.stringify(response.data));
      if (m3u8Url) {
        console.log("Extracted m3u8 URL from stringified response:", m3u8Url);
        sources = [
          {
            url: m3u8Url,
            isM3u8: true,
            type: "hls",
            quality: "auto",
          },
        ];
      }
    }

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
