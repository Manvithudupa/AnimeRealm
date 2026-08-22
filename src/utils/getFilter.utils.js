import axios from "axios";
import { apiUrl } from "@/src/config/api";
import { mapAniListCollection } from "./transformAnilistItem.utils";

const TOP_CATEGORY_BY_SORT = {
  score: "rating",
  popularity: "popular",
  newest: "airing",
  default: "popular",
};

export default async function getFilter(filters = {}, page = 1) {
  try {
    const params = { page, perPage: 50 };
    let url;
    if (filters.q) {
      url = apiUrl("/anime/search", "anilist");
      params.q = filters.q;
    } else if (filters.season && filters.year) {
      url = apiUrl(`/seasons/${filters.season.toUpperCase()}/${filters.year}`, "anilist");
    } else {
      url = apiUrl(`/anime/top/${TOP_CATEGORY_BY_SORT[filters.sort] || "popular"}`, "anilist");
    }
    if (filters.type) params.format = filters.type.toUpperCase();
    const response = await axios.get(url, { params });
    let result = mapAniListCollection(response.data || {});
    let items = result.data;
    if (filters.genres?.length) {
      const wanted = filters.genres.map((genre) => genre.replaceAll("_", " ").toLowerCase());
      items = items.filter((item) => item.genres.some((genre) => wanted.includes(genre.toLowerCase())));
    }
    if (filters.status) items = items.filter((item) => String(item.status).toLowerCase() === String(filters.status).toLowerCase());
    if (filters.year) items = items.filter((item) => String(item.tvInfo.releaseDate || "").includes(String(filters.year)));
    return {
      data: items,
      currentPage: result.currentPage || page,
      totalPage: result.totalPage || page,
      hasNextPage: result.hasNextPage,
    };
  } catch (error) {
    console.error("Filter API Error:", error);
    return { data: [], currentPage: page, totalPage: 1, hasNextPage: false, error };
  }
}
