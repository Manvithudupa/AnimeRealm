import axios from "axios";

const getSearchSuggestion = async (keyword) => {
  const base_url = import.meta.env.VITE_ANIMEPAHE_URL;
  try {
    const response = await axios.get(
      `${base_url}/api/anilist/anime/search?q=${encodeURIComponent(keyword)}&page=1&perPage=10`
    );
    const items = response.data?.data || [];
    return items.map((item) => ({
      id: String(item.anilistId),
      title: item.title?.english || item.title?.romaji || "",
      japanese_title: item.title?.native || item.title?.romaji || "",
      poster: item.image,
      releaseDate: item.releaseDate,
      showType: item.format,
      duration: item.duration ? `${item.duration}m` : null,
    }));
  } catch (err) {
    console.error("Error fetching search suggestions:", err);
    return [];
  }
};

export default getSearchSuggestion;
