import axios from "axios";
import { apiUrl } from "@/src/config/api";

/**
 * Fetch streaming sources for an episode from the Shirayuki API.
 *
 * Actual response (live-tested):
 * {
 *   data: {
 *     animeId: "attack-on-titan",
 *     episode: 1,
 *     sources: [
 *       {
 *         m3u8: "https://.../master.m3u8",    // << actual streaming URL
 *         type: "m3u8",
 *         quality: null,
 *         referer: "https://...",
 *         server: "hd-1",
 *         category: "sub",
 *         embed: "https://..."
 *       }
 *     ],
 *     tracks: [
 *       { file: "https://.../eng-0.vtt", label: "English", kind: "captions", default: true, forced: false }
 *     ],
 *     intro: null,
 *     outro: null
 *   }
 * }
 *
 * Parameters:
 * @param {string} animeEpisodeId - Anime slug or full episode ID (e.g. "attack-on-titan" or "attack-on-titan/ep-1")
 * @param {string|number} ep - Episode number
 * @param {string} server - Server nameId (e.g. "hd-1")
 * @param {string} category - "sub" or "dub"
 */
export default async function getStreamInfo(animeEpisodeId, ep, server, category) {
  try {
    const response = await axios.get(apiUrl('/episode/sources'), {
      params: { animeEpisodeId, ep, server, category },
    });
    const data = response.data?.data || {};

    // Extract the m3u8 URL from the sources array
    const sources = data.sources || [];
    const primarySource = sources[0] || {};
    const streamUrl = primarySource.m3u8 || "";

    // Build tracks array for subtitles and thumbnails
    const tracks = (data.tracks || []).map((track) => ({
      file: track.file,
      label: track.label,
      kind: track.kind || "captions",
      default: track.default || false,
    }));

    const streamingLink = {
      link: {
        file: streamUrl,
        type: primarySource.type || "m3u8",
      },
      headers: primarySource.referer ? { Referer: primarySource.referer } : {},
      tracks,
      intro: data.intro || null,
      outro: data.outro || null,
    };

    return {
      streamingLink,
      sources: sources.map(s => ({
        url: s.m3u8 || "",
        isM3u8: s.type === "m3u8",
        type: s.type || "hls",
      })),
      subtitles: tracks,
      thumbnail: null,
      headers: primarySource.referer ? { Referer: primarySource.referer } : {},
    };
  } catch (error) {
    console.error("Error fetching stream info:", error);
    return error;
  }
}
