import axios from "axios";
import { apiUrl } from "@/src/config/api";

const CATEGORY_CACHE_TTL_MS = 10 * 60 * 1000;

const getCategoryInfo = async (path, page) => {
  try {
    let url;
    if (path.startsWith("genre/")) {
      url = apiUrl(`/genre/${encodeURIComponent(path.replace("genre/", ""))}`);
    } else if (path.startsWith("az-list/") || path === "az-list") {
      const letter = path.replace("az-list/", "") || "all";
      url = apiUrl(`/azlist/${letter}`);
    } else {
      // Category pages like most-popular, top-airing, recently-added, etc.
      url = apiUrl(`/category/${path}`);
    }

    const cacheKey = `categoryCache_${path}_p${page}`;
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (raw) {
        const { data: cachedData, timestamp } = JSON.parse(raw);
        if (Date.now() - timestamp < CATEGORY_CACHE_TTL_MS) return cachedData;
        sessionStorage.removeItem(cacheKey);
      }
    } catch { /* ignore */ }

    const response = await axios.get(url, { params: { page } });
    const result = response.data?.data || {};
    const items = result.results || [];
    const pagination = result.pagination || {};

    const transformed = {
      data: items.map(mapListItem),
      totalPages: pagination.totalPages || 1,
      currentPage: pagination.currentPage || page,
    };

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ data: transformed, timestamp: Date.now() }));
    } catch { /* ignore */ }

    return transformed;
  } catch (err) {
    console.error("Error fetching category info:", err);
    return err;
  }
};

function mapListItem(item) {
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

export default getCategoryInfo;
