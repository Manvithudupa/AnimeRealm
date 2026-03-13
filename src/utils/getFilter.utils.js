import axios from "axios";
import { transformAnilistItem } from "./transformAnilistItem.utils";

// Map UI filter values to Anilist API format values
const FORMAT_MAP = {
  TV: "TV",
  Movie: "MOVIE",
  OVA: "OVA",
  ONA: "ONA",
  Special: "SPECIAL",
};

const SEASON_MAP = {
  Winter: "WINTER",
  Spring: "SPRING",
  Summer: "SUMMER",
  Fall: "FALL",
};

// Map sort values to Anilist category endpoints
const SORT_CATEGORY_MAP = {
  default: "popular",
  score: "rating",
  popularity: "popular",
  newest: "trending",
};

const getFilter = async (filters, page = 1) => {
  const base_url = import.meta.env.VITE_ANIMEPAHE_URL;

  try {
    let url;
    const perPage = 20;

    // If season + year are specified, use the seasonal endpoint
    if (filters.season && filters.year) {
      const season = SEASON_MAP[filters.season] || filters.season.toUpperCase();
      const params = new URLSearchParams({ page, perPage });
      if (filters.type) params.set("format", FORMAT_MAP[filters.type] || filters.type);
      url = `${base_url}/api/anilist/seasons/${season}/${filters.year}?${params.toString()}`;
    } else if (filters.genres?.length > 0) {
      // Genre filter – use search with first genre as query
      const query = filters.genres[0];
      url = `${base_url}/api/anilist/anime/search?q=${encodeURIComponent(query)}&page=${page}&perPage=${perPage}`;
    } else {
      // General filter – use top category
      const category = SORT_CATEGORY_MAP[filters.sort] || "popular";
      const params = new URLSearchParams({ page, perPage });
      if (filters.type) params.set("format", FORMAT_MAP[filters.type] || filters.type);
      url = `${base_url}/api/anilist/anime/top/${category}?${params.toString()}`;
    }

    const response = await axios.get(url);
    const result = response.data;

    return {
      data: (result?.data || []).map(transformAnilistItem),
      currentPage: result?.currentPage || page,
      totalPage: result?.lastPage || 1,
    };
  } catch (err) {
    console.error("Filter API Error:", err);
    return {
      data: [],
      currentPage: 1,
      totalPage: 1,
    };
  }
};

export default getFilter;
