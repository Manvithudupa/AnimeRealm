import axios from "axios";
import { apiUrl } from "@/src/config/api";

const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;

export const mapAnimeSummary = (item = {}) => ({
  id: item.id ?? "",
  data_id: item.id ?? "",
  anilistId: item.anilistId ?? null,
  malId: null,
  title: item.name || item.title || item.romaji || "Untitled",
  japanese_title: item.romaji || item.name || "Untitled",
  poster: item.posterImage || item.poster || "",
  bannerImage: null,
  color: null,
  description: "",
  episodes: null,
  tvInfo: {
    showType: item.type || null,
    duration: null,
    releaseDate: null,
    rating: null,
    quality: null,
    sub: null,
    dub: null,
  },
  genres: [],
  score: null,
  status: null,
  season: null,
  studio: null,
  producers: [],
});

const getSearch = async (keyword, page = 1) => {
  try {
    const cacheKey = `searchCache_${keyword}_p${page}`;
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (raw) {
        const { data: cachedData, timestamp } = JSON.parse(raw);
        if (Date.now() - timestamp < SEARCH_CACHE_TTL_MS) return cachedData;
        sessionStorage.removeItem(cacheKey);
      }
    } catch { /* ignore storage failures */ }

    const response = await axios.get(apiUrl("/anime/search"), {
      params: { q: keyword },
    });
    const payload = response.data || {};
    const items = Array.isArray(payload.data) ? payload.data : [];
    const transformed = {
      data: items.map(mapAnimeSummary),
      totalPage: payload.hasNextPage ? page + 1 : page,
      currentPage: payload.currentPage || page,
      total: items.length,
    };

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ data: transformed, timestamp: Date.now() }));
    } catch { /* ignore storage failures */ }
    return transformed;
  } catch (err) {
    console.error("Error fetching search results:", err);
    return { data: [], totalPage: 1, currentPage: page, total: 0, error: err };
  }
};

export default getSearch;
