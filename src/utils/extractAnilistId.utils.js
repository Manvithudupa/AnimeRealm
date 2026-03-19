/**
 * Extracts the numeric AniList ID from a route parameter that may be either
 * a plain numeric string (e.g. "11757") or a slug with a trailing ID
 * (e.g. "kimi-ni-todoke-from-me-to-you-season-3-19203").
 *
 * @param {string|number} id - Route parameter or raw ID
 * @returns {string} Numeric AniList ID as a string
 */
export function extractAnilistId(id) {
  const match = String(id).match(/(\d+)$/);
  return match ? match[1] : String(id);
}
