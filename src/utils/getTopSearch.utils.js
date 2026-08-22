import axios from "axios";
import { apiUrl } from "@/src/config/api";
import { transformAnilistItem } from "./transformAnilistItem.utils";

const getTopSearch = async () => {
  try {
    const storedData = localStorage.getItem("topSearchKenjitsu");
    if (storedData) {
      const { data, timestamp } = JSON.parse(storedData);
      if (Date.now() - timestamp <= 7 * 24 * 60 * 60 * 1000) return data;
    }
    const response = await axios.get(apiUrl("/anime/top/popular", "anilist"), { params: { format: "TV", page: 1, perPage: 20 } });
    const items = Array.isArray(response.data?.data) ? response.data.data : [];
    const results = items.map(transformAnilistItem).map((item) => ({
      title: item.title,
      link: `/search?keyword=${encodeURIComponent(item.title)}`,
    }));
    if (results.length) localStorage.setItem("topSearchKenjitsu", JSON.stringify({ data: results, timestamp: Date.now() }));
    return results;
  } catch (error) {
    console.error("Error fetching top search data:", error);
    return [];
  }
};

export default getTopSearch;
