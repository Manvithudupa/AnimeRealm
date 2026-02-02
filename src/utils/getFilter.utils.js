import axios from "axios";

const getFilter = async (filters, page = 1) => {
  const api_url = import.meta.env.VITE_API_URL;
  try {
    const params = {
      ...filters,
      genres: filters.genres?.join(",") || "",
      page,
    };
    const response = await axios.get(`${api_url}/filter`, { params });
    return response.data.results;
  } catch (err) {
    console.error("Error fetching filter data:", err);
    return { data: [], currentPage: 1, totalPage: 1 };
  }
};

export default getFilter;
