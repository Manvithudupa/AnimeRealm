import axios from "axios";
import { apiUrl } from "@/src/config/api";

const getFilter = async (filters, page = 1) => {
  try {
    const params = { page };

    if (filters.season && filters.year) {
      params.season = filters.season.toLowerCase();
      params.start_date = `${filters.year}-0-0`;
    }

    if (filters.genres?.length > 0) {
      params.genres = filters.genres.join(",");
    }

    if (filters.type) params.type = filters.type.toLowerCase();
    if (filters.status) params.status = filters.status;
    if (filters.rated) params.rated = filters.rated;
    if (filters.score) params.score = filters.score;
    if (filters.language) params.language = filters.language;
    if (filters.q) params.q = filters.q;
    if (filters.sort && filters.sort !== "default") {
      const sortMap = { score: "score", popularity: "most-watched", newest: "recently-updated" };
      params.sort = sortMap[filters.sort] || "default";
    }

    const response = await axios.get(apiUrl('/search/advanced'), { params });
    const result = response.data?.data || {};
    const items = result.results || [];
    const pagination = result.pagination || {};

    return {
      data: items.map(mapSearchItem),
      currentPage: pagination.currentPage || page,
      totalPage: pagination.totalPages || 1,
    };
  } catch (err) {
    console.error("Filter API Error:", err);
    return { data: [], currentPage: 1, totalPage: 1 };
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

export default getFilter;
