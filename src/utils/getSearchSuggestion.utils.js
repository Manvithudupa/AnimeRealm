import axios from "axios";
import { apiUrl } from "@/src/config/api";

const _suggestionCache = new Map();
const _suggestionInFlight = new Map();
const SUGGESTION_CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Actual suggestion response (live-tested):
 * {
 *   data: {
 *     suggestions: [
 *       { id, title, jname, poster, info: "2013TV" }
 *     ]
 *   }
 * }
 */
const getSearchSuggestion = async (keyword) => {
  const key = keyword.trim().toLowerCase();

  const cached = _suggestionCache.get(key);
  if (cached && Date.now() - cached.timestamp < SUGGESTION_CACHE_TTL_MS) {
    return cached.data;
  }

  if (_suggestionInFlight.has(key)) {
    return _suggestionInFlight.get(key);
  }

  const fetchPromise = (async () => {
    try {
      const response = await axios.get(apiUrl('/search/suggestion'), {
        params: { q: keyword },
      });
      const items = response.data?.data?.suggestions || [];

      const result = items
        .filter(item => item.id && item.title) // filter out the filter link entry
        .map((item) => {
          // info is like "2013TV" -> year=2013, type=TV
          const info = item.info || "";
          const yearMatch = info.match(/(\d{4})/);
          const typeMatch = info.match(/(TV|Movie|OVA|ONA|Special|Music)/);
          return {
            id: item.id || "",
            title: item.title || item.jname || "",
            japanese_title: item.jname || "",
            poster: item.poster || "",
            releaseDate: yearMatch ? yearMatch[1] : null,
            showType: typeMatch ? typeMatch[1] : null,
            duration: null,
          };
        });

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
