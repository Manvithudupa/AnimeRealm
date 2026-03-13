import axios from "axios";

export default async function getServers(episodeId) {
  try {
    const base_url = import.meta.env.VITE_ANIMEPAHE_URL;
    const response = await axios.get(`${base_url}/servers/${episodeId}`);
    return response.data.results;
  } catch (error) {
    console.error(error);
    return error;
  }
}
