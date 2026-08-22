/**
 * Kenjitsu API configuration.
 *
 * AnimeRealm uses AniBD for provider search/details/episodes/sources and
 * AniList for metadata and discovery endpoints.
 */
export const KENJITSU_API_URL = (
  import.meta.env.VITE_KENJITSU_API_URL || "https://kenjitsu.koyeb.app"
).replace(/\/+$/, "");
export const ANIME_PROVIDER = import.meta.env.VITE_ANIME_PROVIDER || "anibd";
export const METADATA_PROVIDER = "anilist";

export function apiUrl(path, provider = ANIME_PROVIDER) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${KENJITSU_API_URL}/api/${provider}${cleanPath}`;
}

export const ENDPOINTS = {
  SEARCH: (q) => apiUrl(`/anime/search?q=${encodeURIComponent(q)}`),
  ANIME_DETAIL: (id) => apiUrl(`/anime/${id}`),
  ANIME_EPISODES: (id) => apiUrl(`/anime/${id}/episodes`),
  EPISODE_SOURCES: (episodeId, version = "sub") =>
    apiUrl(`/sources/${encodeURIComponent(episodeId)}?version=${encodeURIComponent(version)}`),
  ANILIST_SEARCH: (q) => apiUrl(`/anime/search?q=${encodeURIComponent(q)}`, METADATA_PROVIDER),
  ANILIST_DETAIL: (id) => apiUrl(`/anime/${id}`, METADATA_PROVIDER),
  ANILIST_TOP: (category, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiUrl(`/anime/top/${category}${query ? `?${query}` : ""}`, METADATA_PROVIDER);
  },
  ANILIST_SCHEDULE: (date, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiUrl(`/airing/date/${date}${query ? `?${query}` : ""}`, METADATA_PROVIDER);
  },
  ANILIST_ANIME_SCHEDULE: (id) => apiUrl(`/anime/${id}/schedule`, METADATA_PROVIDER),
  ANILIST_CHARACTERS: (id) => apiUrl(`/anime/${id}/characters`, METADATA_PROVIDER),
  ANILIST_MAPPINGS: (id, provider = ANIME_PROVIDER) =>
    apiUrl(`/anime/${id}/mappings?provider=${encodeURIComponent(provider)}`, METADATA_PROVIDER),
};
