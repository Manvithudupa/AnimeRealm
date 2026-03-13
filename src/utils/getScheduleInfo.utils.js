import axios from "axios";

export default async function getSchedInfo(date) {
  const base_url = import.meta.env.VITE_API_URL;
  const response = await axios.get(`${base_url}/api/schedule`, { params: { date } });
  return response.data?.results || [];
}
