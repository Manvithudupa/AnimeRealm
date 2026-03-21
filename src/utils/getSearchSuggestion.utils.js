import axios from "axios";

// In-memory cache for search suggestions keyed by normalised query string.
const _suggestionCache = new Map(); // key -> { data, timestamp }
const _suggestionInFlight = new Map(); // key -> Promise (deduplicates concurrent calls)
const SUGGESTION_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const getSearchSuggestion = async (keyword) => {
  const base_url = import.meta.env.VITE_ANIMEPAHE_URL;
  const key = keyword.trim().toLowerCase();

  // Return cached result if still fresh.
  const cached = _suggestionCache.get(key);
  if (cached && Date.now() - cached.timestamp < SUGGESTION_CACHE_TTL_MS) {
    return cached.data;
  }

  // Deduplicate concurrent requests for the same query.
  if (_suggestionInFlight.has(key)) {
    return _suggestionInFlight.get(key);
  }

  const fetchPromise = (async () => {
    try {
      const response = await axios.get(
        `${base_url}/api/anilist/anime/search?q=${encodeURIComponent(keyword)}&page=1&perPage=10`
      );
      const items = response.data?.data || [];
      const result = items.map((item) => ({
        id: String(item.anilistId),
        title: item.title?.english || item.title?.romaji || "",
        japanese_title: item.title?.native || item.title?.romaji || "",
        poster: item.image,
        releaseDate: item.releaseDate,
        showType: item.format,
        duration: item.duration ? `${item.duration}m` : null,
      }));
      _suggestionCache.set(key, { data: result, timestamp: Date.now() });
      return result;
    } catch (err) {
      console.error("Error fetching search suggestions:", err);
      return [];
    } finally {
      _suggestionInFlight.delete(key);
    }
  })();

  _suggestionInFlight.set(key, fetchPromise);
  return fetchPromise;
};

export default getSearchSuggestion;
