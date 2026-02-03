import axios from "axios";

const getFilter = async (filters, page = 1) => {
  const api_url = import.meta.env.VITE_API_URL;

  try {
    const params = {};

    // Always send sort + page
    params.sort = filters.sort || "default";
    params.page = page;

    // Optional filters (only if selected)
    if (filters.type) params.type = filters.type;
    if (filters.status) params.status = filters.status;
    if (filters.rated) params.rated = filters.rated;
    if (filters.score) params.score = filters.score;
    if (filters.season) params.season = filters.season;
    if (filters.language) params.language = filters.language;
    if (filters.year) params.year = filters.year;

    // Genres (multiple)
    if (filters.genres && filters.genres.length > 0) {
      params.genres = filters.genres.join(",");
    }

    const response = await axios.get(`${api_url}/filter`, {
      params,
    });

    return response.data;
  } catch (err) {
    console.error("Error fetching filter data:", err);

    return {
      data: [],
      currentPage: 1,
      totalPage: 1,
    };
  }
};

export default getFilter;
