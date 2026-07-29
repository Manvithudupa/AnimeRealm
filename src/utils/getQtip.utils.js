import axios from "axios";
import { apiUrl } from "@/src/config/api";

const getQtip = async (id) => {
  try {
    const response = await axios.get(apiUrl(`/anime/${id}`));
    const data = response.data?.data || {};

    if (!data || !data.id) return null;

    const stats = data.stats || {};
    const info = data.info || {};
    const genresList = (info.genres || []).map(g => g.name || g).filter(Boolean);

    return {
      title: data.title || data.ename || data.jname || "",
      japaneseTitle: data.jname || null,
      rating: info["mal score"] || null,
      subCount: stats.sub || null,
      dubCount: stats.dub || null,
      episodeCount: stats.sub ? String(stats.sub) : null,
      type: stats.type || info.type || null,
      poster: data.poster || "",
      description: data.description || null,
      airedDate: info.premiered || null,
      status: info.status || null,
      tvInfo: {
        showType: stats.type || null,
        duration: info.duration ? `${info.duration}m` : null,
        releaseDate: info.premiered || null,
      },
      genres: genresList,
    };
  } catch (err) {
    console.error("Error fetching qtip info:", err);
    return null;
  }
};

export default getQtip;
