import axios from "axios";
import { apiUrl } from "@/src/config/api";

export default async function getSchedInfo(date) {
  try {
    const response = await axios.get(apiUrl(`/airing/date/${date}`, "anilist"), { params: { page: 1, perPage: 20 } });
    const items = Array.isArray(response.data?.data) ? response.data.data : [];
    return items.map((item) => ({
      id: String(item.id || ""),
      title: item.title?.english || item.title?.romaji || "N/A",
      japanese_title: item.title?.native || item.title?.romaji || "",
      time: item.nextAiringEpisode?.airingAt ? new Date(item.nextAiringEpisode.airingAt * 1000).toISOString() : null,
      episode_no: item.nextAiringEpisode?.episode || null,
      poster: item.image || null,
    }));
  } catch (error) {
    console.error("Error fetching schedule info:", error);
    return [];
  }
}
