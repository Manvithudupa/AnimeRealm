import axios from "axios";
import { apiUrl } from "@/src/config/api";
import { transformAnilistItem } from "./transformAnilistItem.utils";

const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000;

export const mapAnimeSummary = (item = {}) => transformAnilistItem(item);

const getSearch = async (keyword, page = 1) => {
  const query = String(keyword || "").trim();
  if (!query) return { data: [], totalPage: 1, currentPage: page, total: 0 };

  try {
    const cacheKey = `searchCache_anilist_${query.toLowerCase()}_p${page}`;
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (raw) {
        const { data: cachedData, timestamp } = JSON.parse(raw);
        if (Date.now() - timestamp < SEARCH_CACHE_TTL_MS) return cachedData;
        sessionStorage.removeItem(cacheKey);
      }
    } catch {
      // Storage can be unavailable in private browsing; continue with the request.
    }

    const response = await axios.get(apiUrl("/anime/search", "anilist"), {
      params: { q: query, page, perPage: 20 },
    });
    const payload = response.data || {};
    const items = Array.isArray(payload.data) ? payload.data : [];
    const transformed = {
      data: items.map(mapAnimeSummary),
      totalPage: payload.lastPage || (payload.hasNextPage ? page + 1 : page),
      currentPage: payload.currentPage || page,
      total: items.length,
      hasNextPage: Boolean(payload.hasNextPage),
    };

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ data: transformed, timestamp: Date.now() }));
    } catch {
      // Ignore storage failures and return the fresh result.
    }
    return transformed;
  } catch (error) {
    console.error("Error fetching AniList search results:", error);
    return { data: [], totalPage: 1, currentPage: page, total: 0, error };
  }
};

export default getSearch;
