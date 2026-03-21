import axios from "axios";
import { transformAnilistItem } from "./transformAnilistItem.utils";

const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const getSearch = async (keyword, page) => {
  const base_url = import.meta.env.VITE_ANIMEPAHE_URL;
  if (!page) page = 1;
  try {
    // Check sessionStorage cache before making a network request.
    const cacheKey = `searchCache_${keyword}_p${page}`;
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (raw) {
        const { data: cachedData, timestamp } = JSON.parse(raw);
        if (Date.now() - timestamp < SEARCH_CACHE_TTL_MS) {
          return cachedData;
        }
        sessionStorage.removeItem(cacheKey);
      }
    } catch {
      // Ignore storage errors
    }

    const response = await axios.get(
      `${base_url}/api/anilist/anime/search?q=${encodeURIComponent(keyword)}&page=${page}&perPage=20`
    );
    const result = response.data;
    const transformed = {
      data: (result?.data || []).map(transformAnilistItem),
      totalPage: result?.lastPage || 1,
      currentPage: result?.currentPage || page,
      total: result?.total || 0,
    };

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ data: transformed, timestamp: Date.now() }));
    } catch {
      // Ignore storage errors (e.g. quota exceeded)
    }

    return transformed;
  } catch (err) {
    console.error("Error fetching search results:", err);
    return err;
  }
};

export default getSearch;
