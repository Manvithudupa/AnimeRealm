import axios from "axios";
import { apiUrl } from "@/src/config/api";

export default async function getAnilistScheduleInfo(date, page = 1) {
  try {
    const response = await axios.get(apiUrl(`/airing/date/${date}`, "anilist"), {
      params: { page, perPage: 20 },
    });
    const payload = response.data || {};
    const items = Array.isArray(payload.data) ? payload.data : [];

    return {
      data: items.map((item) => ({
        anilistId: item.id || item.anilistId,
        title: item.title || { english: "", romaji: "", native: "" },
        image: item.image || item.poster || "",
        bannerImage: item.bannerImage || null,
        color: item.color || null,
        format: item.format || item.type || null,
        score: item.score || null,
        genres: item.genres || [],
        nextAiringEpisode: item.nextAiringEpisode || null,
      })),
      hasNextPage: Boolean(payload.hasNextPage),
      currentPage: payload.currentPage || page,
    };
  } catch (error) {
    console.error("Error fetching schedule info:", error);
    return { data: [], hasNextPage: false };
  }
}
