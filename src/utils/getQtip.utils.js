import axios from "axios";

const getQtip = async (id) => {
  const base_url = import.meta.env.VITE_ANIMEPAHE_URL;
  try {
    if (!base_url) {
      throw new Error("VITE_ANIMEPAHE_URL is not defined");
    }

    // id is already an Anilist ID (numeric string)
    const response = await axios.get(
      `${base_url}/api/anilist/anime/${id}`
    );

    const item = response.data?.data;
    if (!item) return null;

    return {
      title: item.title?.english || item.title?.romaji || "",
      japaneseTitle: item.title?.native || item.title?.romaji || null,
      rating: item.score ? String(item.score) : null,
      subCount: null,
      dubCount: null,
      episodeCount: item.episodes ? String(item.episodes) : null,
      type: item.format || null,
      poster: item.image,
      description: item.synopsis,
      airedDate: item.releaseDate || null,
      status: item.status || null,
      tvInfo: {
        showType: item.format,
        duration: item.duration ? `${item.duration}m` : null,
        releaseDate: item.releaseDate,
      },
      genres: item.genres || [],
    };
  } catch (err) {
    console.error("Error fetching qtip info:", err);
    return null;
  }
};

export default getQtip;
