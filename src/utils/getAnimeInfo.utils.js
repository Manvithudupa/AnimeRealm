import axios from "axios";

const CACHE_PREFIX = "animeInfoCache_";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

function getCached(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < CACHE_DURATION) return data;
    localStorage.removeItem(key);
  } catch {
    // ignore parse errors
  }
  return null;
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {
    // ignore storage errors (e.g. quota exceeded)
  }
}

export default async function fetchAnimeInfo(id, random = false) {
  const api_url = import.meta.env.VITE_API_URL;
  try {
    if (random) {
      const randomId = await axios.get(`${api_url}/random/id`);
      const animeId = randomId.data.results;
      const cacheKey = CACHE_PREFIX + animeId;
      const cached = getCached(cacheKey);
      if (cached) return cached;
      const response = await axios.get(`${api_url}/info?id=${animeId}`);
      const result = response.data.results;
      setCache(cacheKey, result);
      return result;
    } else {
      const cacheKey = CACHE_PREFIX + id;
      const cached = getCached(cacheKey);
      if (cached) return cached;
      const response = await axios.get(`${api_url}/info?id=${id}`);
      const result = response.data.results;
      setCache(cacheKey, result);
      return result;
    }
  } catch (error) {
    console.error("Error fetching anime info:", error);
    return error;
  }
}
