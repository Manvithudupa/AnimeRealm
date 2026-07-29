import axios from "axios";
import { apiUrl } from "@/src/config/api";

export default async function getSchedInfo(date) {
  try {
    const response = await axios.get(apiUrl('/schedule'), { params: { date } });
    const data = response.data?.data || {};
    const scheduleItems = data.results || [];
    return scheduleItems.map((item) => ({
      id: String(item.id || ""),
      title: item.title || item.ename || item.jname || "N/A",
      japanese_title: item.jname || item.title || "",
      time: item.time || null,
      episode_no: item.episode || item.episodeNumber || null,
      poster: item.poster || null,
    }));
  } catch (error) {
    console.error("Error fetching schedule info:", error);
    return [];
  }
}
