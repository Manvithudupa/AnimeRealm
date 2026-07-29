/**
 * Shirayuki Scrapper API v2 configuration.
 *
 * Base URL and provider are configured via environment variables.
 * All endpoints use the pattern: /api/v2/<provider>/<endpoint>
 */

export const SHIPAYUKI_API_URL = import.meta.env.VITE_SHIPAYUKI_API_URL || '';
export const SHIPAYUKI_PROVIDER = import.meta.env.VITE_SHIPAYUKI_PROVIDER || 'hianime';

/**
 * Builds a full API URL for the given endpoint path.
 * @param {string} path - Endpoint path (e.g. '/home', '/anime/steinsgate-3')
 * @returns {string} Full URL
 */
export function apiUrl(path) {
  const base = SHIPAYUKI_API_URL.replace(/\/+$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}/api/v2/${SHIPAYUKI_PROVIDER}${cleanPath}`;
}

/**
 * Home & Discovery
 */
export const ENDPOINTS = {
  HOME: '/home',
  AZ_LIST: (letter) => `/azlist/${letter}`,
  ANIME_DETAIL: (id) => `/anime/${id}`,
  ANIME_EPISODES: (id) => `/anime/${id}/episodes`,
  NEXT_EPISODE_SCHEDULE: (id) => `/anime/${id}/next-episode-schedule`,
  EPISODE_SERVERS: '/episode/servers',
  EPISODE_SOURCES: '/episode/sources',
  SEARCH: '/search',
  SEARCH_ADVANCED: '/search/advanced',
  SEARCH_SUGGESTION: '/search/suggestion',
  PRODUCER: (name) => `/producer/${name}`,
  GENRE: (name) => `/genre/${name}`,
  CATEGORY: (name) => `/category/${name}`,
  SCHEDULE: '/schedule',
};
