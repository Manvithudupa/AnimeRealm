import axios from "axios";
import { transformAnilistItem } from "./transformAnilistItem.utils";

const getSearch = async (keyword, page) => {
  const base_url = import.meta.env.VITE_ANIMEPAHE_URL;
  if (!page) page = 1;
  try {
    const response = await axios.get(
      `${base_url}/api/anilist/anime/search?q=${encodeURIComponent(keyword)}&page=${page}&perPage=20`
    );
    const result = response.data;
    return {
      data: (result?.data || []).map(transformAnilistItem),
      totalPage: result?.lastPage || 1,
      currentPage: result?.currentPage || page,
      total: result?.total || 0,
    };
  } catch (err) {
    console.error("Error fetching search results:", err);
    return err;
  }
};

export default getSearch;
