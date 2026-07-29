import axios from "axios";
import { apiUrl } from "@/src/config/api";

/**
 * Fetches episodes from the Shirayuki API.
 *
 * Actual response shape (live-tested):
 * {
 *   data: {
 *     totalEpisodes: 25,
 *     episodes: [
 *       {
 *         number: 1,
 *         title: "To You Two Thousand Years Later",
 *         episodeId: "attack-on-titan/ep-1"   // format: "slug/ep-N"
 *       }
 *     ]
 *   }
 * }
 */
export default async function getEpisodes(id) {
  try {
    const response = await axios.get(apiUrl(`/anime/${id}/episodes`));
    const data = response.data?.data || {};

    const rawEpisodes = data.episodes || [];
    const totalEpisodes = data.totalEpisodes || rawEpisodes.length;

    const episodes = rawEpisodes.map((ep) => ({
      // Store the full API episodeId (e.g., "attack-on-titan/ep-1")
      episodeId: ep.episodeId || `${id}/ep-${ep.number}`,
      // id is the episode number string for app compatibility
      id: `ep=${ep.number}`,
      episode_no: ep.number,
      title: ep.title || `Episode ${ep.number}`,
      thumbnail: null, // Shirayuki API doesn't provide thumbnails per episode
      overview: null,
      airDate: null,
      aired: true,
      rating: null,
      hasDub: false,
      hasSub: true,
      isFiller: false,
    }));

    return { episodes, totalEpisodes };
  } catch (error) {
    console.error("Error fetching anime episodes:", error);
    return error;
  }
}
