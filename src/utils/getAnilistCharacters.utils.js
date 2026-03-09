import axios from "axios";

export default async function getAnilistCharacters(anilistId) {
  const base_url = import.meta.env.VITE_ANIMEPAHE_URL;
  try {
    const response = await axios.get(
      `${base_url}/api/anilist/anime/${anilistId}/characters`
    );
    return response.data?.data?.characters || [];
  } catch (error) {
    console.error("Error fetching anilist characters:", error);
    return [];
  }
}
