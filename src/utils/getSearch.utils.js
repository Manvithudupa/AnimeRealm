import axios from "axios";
import { apiUrl } from "@/src/config/api";

const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Actual search response (live-tested):
 * {
 *   data: {
 *     results: [ { id, title, jname, ename, poster, type, duration, episodes: {sub, dub} } ],
 *     pagination: { currentPage, totalPages, hasNextPage }
 *   }
 * }
 */
const getSearch = async (keyword, page) => {
  if (!page) page = 1;
  try {
    const cacheKey = `searchCache_${keyword}_p${page}`;
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (raw) {
        const { data: cachedData, timestamp } = JSON.parse(raw);
        if (Date.now() - timestamp < SEARCH_CACHE_TTL_MS) return cachedData;
        sessionStorage.removeItem(cacheKey);
      }
    } catch { /* ignore */ }

    const response = await axios.get(apiUrl('/search'), {
      params: { q: keyword, page },
    });
    const result = response.data?.data || {};
    const items = result.results || [];
    const pagination = result.pagination || {};

    const transformed = {
      data: items.map(mapSearchItem),
      totalPage: pagination.totalPages || 1,
      currentPage: pagination.currentPage || page,
      total: items.length || 0,
    };

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ data: transformed, timestamp: Date.now() }));
    } catch { /* ignore */ }

    return transformed;
  } catch (err) {
    console.error("Error fetching search results:", err);
    return err;
  }
};

function mapSearchItem(item) {
  const epSub = item.episodes?.sub || null;
  const epDub = item.episodes?.dub || null;
  return {
    id: item.id || "",
    anilistId: item.id || "",
    malId: null,
    title: item.title || item.ename || item.jname || "",
    japanese_title: item.jname || item.title || "",
    poster: item.poster || "",
    bannerImage: null,
    color: null,
    description: "",
    episodes: epSub || null,
    tvInfo: {
      showType: item.type || null,
      duration: null,
      releaseDate: null,
      rating: null,
      quality: null,
      sub: epSub,
      dub: epDub,
    },
    genres: [],
    score: null,
    status: null,
    season: null,
    studio: null,
    producers: [],
  };
}

export default getSearch;
