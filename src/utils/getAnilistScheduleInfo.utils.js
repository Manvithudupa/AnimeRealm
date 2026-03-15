import axios from "axios";

export default async function getAnilistScheduleInfo(date, page = 1) {
  const base_url = import.meta.env.VITE_ANIMEPAHE_URL;
  const response = await axios.get(
    `${base_url}/api/anilist/airing/date/${date}`,
    { params: { page, perPage: 20 } }
  );
  return response.data || {};
}
