import axios from "axios";
import { apiUrl } from "@/src/config/api";

export default async function getEpisodes(id) {
  try {
    const response = await axios.get(apiUrl(`/anime/${id}/episodes`));
    const rawEpisodes = Array.isArray(response.data?.data) ? response.data.data : [];
    const episodes = rawEpisodes.map((ep) => ({
      episodeId: ep.episodeId,
      id: `ep=${ep.episodeNumber}`,
      episode_no: ep.episodeNumber,
      title: ep.title || `Episode ${ep.episodeNumber}`,
      thumbnail: null,
      overview: null,
      airDate: null,
      aired: true,
      hasDub: Boolean(ep.hasDub),
      hasSub: Boolean(ep.hasSub),
      isFiller: false,
    }));
    return { episodes, totalEpisodes: episodes.length };
  } catch (error) {
    console.error("Error fetching anime episodes:", error);
    return { episodes: [], totalEpisodes: 0, error };
  }
}
