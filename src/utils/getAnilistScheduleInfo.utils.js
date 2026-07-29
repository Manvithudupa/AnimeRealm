import axios from "axios";
import { apiUrl } from "@/src/config/api";

export default async function getAnilistScheduleInfo(date, page = 1) {
  try {
    const response = await axios.get(apiUrl('/schedule'), {
      params: { date, page },
    });
    const data = response.data?.data || {};
    const items = data.results || [];

    return {
      data: items.map((item) => ({
        anilistId: item.id || item.anilistId,
        title: {
          english: item.title || item.ename || "",
          romaji: item.jname || "",
          native: item.jname || "",
        },
        image: item.poster || "",
        bannerImage: null,
        color: null,
        format: item.type || null,
        score: null,
        genres: [],
        nextAiringEpisode: {
          airingAt: item.time ? new Date(item.time).getTime() / 1000 : null,
          episode: item.episode || null,
          time: item.time || null,
        },
      })),
      hasNextPage: data.pagination?.hasNextPage || false,
      currentPage: data.pagination?.currentPage || page,
    };
  } catch (error) {
    console.error("Error fetching schedule info:", error);
    return { data: [], hasNextPage: false };
  }
}
