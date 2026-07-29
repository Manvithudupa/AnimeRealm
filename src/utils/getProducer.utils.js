import axios from "axios";
import { apiUrl } from "@/src/config/api";

const getProducer = async (producer, page) => {
  try {
    const response = await axios.get(apiUrl(`/producer/${encodeURIComponent(producer)}`), {
      params: { page },
    });
    const result = response.data?.data || {};
    const items = result.results || [];
    const pagination = result.pagination || {};

    return {
      data: items.map(mapItem),
      totalPages: pagination.totalPages || 1,
      currentPage: pagination.currentPage || page,
    };
  } catch (err) {
    console.error("Error fetching producer info:", err);
    return err;
  }
};

function mapItem(item) {
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

export default getProducer;
