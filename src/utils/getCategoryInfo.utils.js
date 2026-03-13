import axios from "axios";
import { transformAnilistItem } from "./transformAnilistItem.utils";

// Map known category paths to Anilist API parameters
const CATEGORY_MAP = {
  "top-airing": { category: "airing" },
  "most-popular": { category: "popular" },
  "most-favorite": { category: "popular" },
  completed: { category: "rating" },
  "recently-updated": { category: "airing" },
  "recently-added": { category: "trending" },
  "top-upcoming": { category: "upcoming" },
  "subbed-anime": { category: "popular" },
  "dubbed-anime": { category: "popular" },
  movie: { category: "popular", format: "MOVIE" },
  special: { category: "popular", format: "SPECIAL" },
  ova: { category: "popular", format: "OVA" },
  ona: { category: "popular", format: "ONA" },
  tv: { category: "popular", format: "TV" },
};

const getCategoryInfo = async (path, page) => {
  const base_url = import.meta.env.VITE_ANIMEPAHE_URL;
  try {
    let url;

    if (path.startsWith("genre/")) {
      // Genre pages – use search with genre name as query
      const genre = path.replace("genre/", "");
      url = `${base_url}/api/anilist/anime/search?q=${encodeURIComponent(genre)}&page=${page}&perPage=20`;
    } else {
      const mapping = CATEGORY_MAP[path];
      const category = mapping?.category || "popular";
      const params = new URLSearchParams({ page, perPage: 20 });
      if (mapping?.format) params.set("format", mapping.format);
      url = `${base_url}/api/anilist/anime/top/${category}?${params.toString()}`;
    }

    const response = await axios.get(url);
    const result = response.data;

    return {
      data: (result?.data || []).map(transformAnilistItem),
      totalPages: result?.lastPage || 1,
      currentPage: result?.currentPage || page,
    };
  } catch (err) {
    console.error("Error fetching category info:", err);
    return err;
  }
};

export default getCategoryInfo;
