import axios from "axios";
import { apiUrl } from "@/src/config/api";
import { transformAnilistItem } from "./transformAnilistItem.utils";

export default async function getProducer(producer, page = 1) {
  try {
    const response = await axios.get(apiUrl("/anime/top/popular", "anilist"), { params: { format: "TV", page, perPage: 50 } });
    const items = (Array.isArray(response.data?.data) ? response.data.data : []).map(transformAnilistItem);
    const wanted = decodeURIComponent(String(producer || "")).replaceAll("-", " ").toLowerCase();
    const filtered = items.filter((item) => item.producers.some((name) => String(name).toLowerCase().includes(wanted)));
    return {
      data: filtered,
      currentPage: response.data?.currentPage || page,
      totalPages: filtered.length ? (response.data?.lastPage || page) : 1,
      hasNextPage: Boolean(response.data?.hasNextPage && filtered.length),
    };
  } catch (error) {
    console.error("Error fetching producer info:", error);
    return { data: [], currentPage: page, totalPages: 1, hasNextPage: false, error };
  }
}
