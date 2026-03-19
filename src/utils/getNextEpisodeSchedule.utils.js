import axios from "axios";
import { extractAnilistId } from "./extractAnilistId.utils";

const getNextEpisodeSchedule = async (id) => {
  const base_url = import.meta.env.VITE_ANIMEPAHE_URL;
  try {
    const anilistId = extractAnilistId(id);
    const response = await axios.get(`${base_url}/api/anilist/anime/schedule/${anilistId}`);
    const nextAiring = response.data?.data?.nextAiringEpisode;
    if (!nextAiring?.airingAt) return null;
    // Convert Unix timestamp to ISO date string for Watch.jsx
    return {
      nextEpisodeSchedule: new Date(nextAiring.airingAt * 1000).toISOString(),
      episode: nextAiring.episode,
    };
  } catch (err) {
    console.error("Error fetching next episode schedule:", err);
    return null;
  }
};

export default getNextEpisodeSchedule;
