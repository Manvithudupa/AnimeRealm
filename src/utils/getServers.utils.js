import axios from "axios";

export default async function getServers(episodeId) {
  try {
    const api_url = import.meta.env.VITE_API_URL;
    const response = await axios.get(`${api_url}/servers/${episodeId}`);
    return response.data.results;
  } catch (error) {
    console.error(error);
    return error;
  }
}
