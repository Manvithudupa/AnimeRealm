import axios from "axios";

/**
 * Fetch anime with filters
 * @param {Object} filters - Filter options
 * @param {number} page - Page number
 * @returns {Promise<Object>} - Results from API
 */
const getFilter = async (filters = {}, page = 1) => {
  const api_url = import.meta.env.VITE_API_URL;

  // Ensure genres is a comma-separated string
  const params = {
    ...filters,
    page,
    genres: filters.genres ? filters.genres.join(",") : "",
  };

  try {
    const response = await axios.get(`${api_url}/filter`, { params });
    return response.data.results;
  } catch (err) {
    console.error("Error fetching filtered anime:", err);
    return { data: [], totalPage: 1, currentPage: 1 };
  }
};

export default getFilter;
