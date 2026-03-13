import axios from "axios";

const getTopSearch = async () => {
  const base_url = import.meta.env.VITE_ANIMEPAHE_URL;
  try {
    const storedData = localStorage.getItem("topSearch");
    if (storedData) {
      const { data, timestamp } = JSON.parse(storedData);
      if (Date.now() - timestamp <= 7 * 24 * 60 * 60 * 1000) {
        return data;
      }
    }
    const response = await axios.get(
      `${base_url}/api/anilist/anime/top/popular?perPage=20`
    );
    const items = response.data?.data || [];
    const results = items.map((item) => {
      const title = item.title?.english || item.title?.romaji || "";
      return {
        title,
        link: `/search?keyword=${encodeURIComponent(title)}`,
      };
    });
    if (results.length) {
      localStorage.setItem(
        "topSearch",
        JSON.stringify({ data: results, timestamp: Date.now() })
      );
      return results;
    }
    return [];
  } catch (error) {
    console.error("Error fetching top search data:", error);
    return [];
  }
};

export default getTopSearch;
