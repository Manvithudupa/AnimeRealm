import axios from "axios";

export default async function getStreamInfo(episodeId, serverName, type) {
  const base_url = import.meta.env.VITE_ANIMEPAHE_URL;
  try {
    const response = await axios.get(
      `${base_url}/stream?id=${episodeId}&server=${serverName}&type=${type}`
    );
    return response.data.results;
  } catch (error) {
    console.error("Error fetching stream info:", error);
    return error;
  }
}
