import axios from "axios";
import { apiUrl } from "@/src/config/api";

const getTopSearch = async () => {
  try {
    const storedData = localStorage.getItem("topSearch");
    if (storedData) {
      const { data, timestamp } = JSON.parse(storedData);
      if (Date.now() - timestamp <= 7 * 24 * 60 * 60 * 1000) return data;
    }

    const response = await axios.get(apiUrl('/category/most-popular'), { params: { page: 1 } });
    const result = response.data?.data || {};
    const items = result.results || [];

    const results = items.map((item) => {
      const title = item.title || item.ename || item.jname || "";
      return { title, link: `/search?keyword=${encodeURIComponent(title)}` };
    });

    if (results.length) {
      localStorage.setItem("topSearch", JSON.stringify({ data: results, timestamp: Date.now() }));
      return results;
    }
    return [];
  } catch (error) {
    console.error("Error fetching top search data:", error);
    return [];
  }
};

export default getTopSearch;
