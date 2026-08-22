import axios from "axios";
import { apiUrl } from "@/src/config/api";
import { transformAnilistItem } from "./transformAnilistItem.utils";

const CACHE_TTL = 5 * 60 * 1000;

export default async function getSearchSuggestion(keyword) {
  const query = String(keyword || "").trim();
  if (!query) return [];
  const cacheKey = `searchSuggestions_kenjitsu_${query.toLowerCase()}`;
  try {
    const cached = JSON.parse(sessionStorage.getItem(cacheKey) || "null");
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
  } catch { /* ignore */ }
  try {
    const response = await axios.get(apiUrl("/anime/search", "anilist"), { params: { q: query, page: 1, perPage: 8 } });
    const data = Array.isArray(response.data?.data) ? response.data.data : [];
    const suggestions = data.slice(0, 8).map((item) => {
      const normalized = transformAnilistItem(item);
      return {
        id: normalized.id,
        title: normalized.title,
        japanese_title: normalized.japanese_title,
        poster: normalized.poster,
        releaseDate: normalized.tvInfo.releaseDate,
        showType: normalized.tvInfo.showType,
      };
    });
    try { sessionStorage.setItem(cacheKey, JSON.stringify({ data: suggestions, timestamp: Date.now() })); } catch { /* ignore */ }
    return suggestions;
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return [];
  }
}
