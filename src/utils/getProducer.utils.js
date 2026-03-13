import axios from "axios";
import { transformAnilistItem } from "./transformAnilistItem.utils";

const getProducer = async (producer, page) => {
  const base_url = import.meta.env.VITE_ANIMEPAHE_URL;
  try {
    // Use search with the producer/studio name as the query
    const response = await axios.get(
      `${base_url}/api/anilist/anime/search?q=${encodeURIComponent(producer)}&page=${page}&perPage=20`
    );
    const result = response.data;
    return {
      data: (result?.data || []).map(transformAnilistItem),
      totalPages: result?.lastPage || 1,
      currentPage: result?.currentPage || page,
    };
  } catch (err) {
    console.error("Error fetching producer info:", err);
    return err;
  }
};

export default getProducer;
