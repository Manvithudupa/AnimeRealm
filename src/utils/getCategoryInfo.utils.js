import axios from "axios";
import { apiUrl } from "@/src/config/api";
import { mapAniListCollection } from "./transformAnilistItem.utils";

const CATEGORY_CACHE_TTL_MS = 10 * 60 * 1000;
const TYPE_FORMATS = { movie: "MOVIE", special: "SPECIAL", ova: "OVA", ona: "ONA", tv: "TV" };

async function getPayload(url, params = {}) {
  const response = await axios.get(url, { params });
  return response.data || {};
}

function categoryConfig(path) {
  if (path.startsWith("genre/")) return { category: "popular", genre: path.slice(6).replaceAll("_", " ").replaceAll("-", " ") };
  if (path === "top-airing") return { category: "airing" };
  if (path === "most-popular" || path === "most-favorite") return { category: "popular" };
  if (path === "top-upcoming" || path === "recently-added") return { category: "upcoming" };
  if (path === "completed" || path === "latest-completed") return { category: "rating" };
  if (path === "recently-updated" || path === "subbed-anime" || path === "dubbed-anime") return { category: "airing" };
  if (TYPE_FORMATS[path]) return { category: "popular", format: TYPE_FORMATS[path] };
  return { category: "popular" };
}

function firstLetterFilter(items, path) {
  if (!(path === "az-list" || path.startsWith("az-list/"))) return items;
  const letter = (path.replace(/\/$/, "").slice(8) || "all").toUpperCase();
  if (letter === "ALL") return items;
  if (letter === "0-9") return items.filter((item) => /^\d/.test(item.title));
  if (letter === "OTHER") return items.filter((item) => /^[^A-Z0-9]/i.test(item.title));
  return items.filter((item) => item.title.toUpperCase().startsWith(letter));
}

const getCategoryInfo = async (path, page = 1) => {
  const cacheKey = `categoryCache_kenjitsu_${path}_p${page}`;
  try {
    const raw = sessionStorage.getItem(cacheKey);
    if (raw) {
      const cached = JSON.parse(raw);
      if (Date.now() - cached.timestamp < CATEGORY_CACHE_TTL_MS) return cached.data;
    }
  } catch { /* ignore storage failures */ }

  try {
    const config = categoryConfig(path);
    const isAz = path === "az-list" || path.startsWith("az-list/");
    const payload = isAz
      ? await getPayload(apiUrl("/anime/top/popular", "anilist"), { format: "TV", page, perPage: 50 })
      : await getPayload(apiUrl(`/anime/top/${config.category}`, "anilist"), { format: config.format || "TV", page, perPage: 50 });
    let items = mapAniListCollection(payload).data;
    if (config.genre) items = items.filter((item) => item.genres.some((genre) => genre.toLowerCase().replaceAll("-", " ") === config.genre.toLowerCase()));
    items = firstLetterFilter(items, path);
    const result = {
      data: items,
      currentPage: payload.currentPage || page,
      totalPages: payload.lastPage || (payload.hasNextPage ? page + 1 : page),
      hasNextPage: Boolean(payload.hasNextPage),
    };
    try { sessionStorage.setItem(cacheKey, JSON.stringify({ data: result, timestamp: Date.now() })); } catch { /* ignore */ }
    return result;
  } catch (error) {
    console.error("Error fetching category info:", error);
    return { data: [], currentPage: page, totalPages: 1, hasNextPage: false, error };
  }
};

export default getCategoryInfo;
