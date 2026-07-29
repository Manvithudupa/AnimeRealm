/**
 * Transforms a raw anime item (from Shirayuki API or AniList) into the shape
 * expected by the app's components (CategoryCard, Spotlight, Banner, etc.).
 *
 * Handles both AniList-style items (with `anilistId`) and Shirayuki-style items
 * (with `id` as a slug).
 */
export function transformAnilistItem(item) {
  if (!item) return null;

  // Support both Shirayuki (id as slug) and AniList (anilistId as number) formats
  const anilistId = item.anilistId || extractNumericId(item.id) || item.id;
  const id = String(anilistId || item.id || "");

  return {
    id,
    anilistId: anilistId || item.id,
    malId: item.malId || null,
    title: item.title?.english || item.title?.romaji || item.name || item.title || "",
    japanese_title: item.title?.native || item.title?.romaji || item.japaneseTitle || "",
    poster: item.poster || item.image || "",
    bannerImage: item.bannerImage || item.banner || null,
    color: item.color || null,
    description: item.description || item.synopsis || "",
    episodes: item.episodes || item.episodeCount || null,
    tvInfo: {
      showType: item.type || item.format || item.showType || null,
      duration: item.duration ? (typeof item.duration === "string" && !item.duration.includes("m") ? `${item.duration}m` : item.duration) : null,
      releaseDate: item.releaseDate || null,
      rating: item.rating || item.ageRating || null,
      quality: item.quality || null,
      sub: item.sub || item.stats?.episodes?.sub || null,
      dub: item.dub || item.stats?.episodes?.dub || null,
    },
    genres: item.genres || [],
    score: item.score || item.rating || null,
    status: item.status || null,
    season: item.season || null,
    studio: item.studio || item.studios || null,
    producers: item.producers || [],
  };
}

/**
 * Extracts a trailing numeric ID from a slug like "steinsgate-3" => "3",
 * or returns the input if it's already numeric.
 */
function extractNumericId(value) {
  if (!value) return null;
  const str = String(value);
  // If already a pure number, return as-is
  if (/^\d+$/.test(str)) return str;
  // Extract trailing digits (e.g., "steinsgate-3" => "3")
  const match = str.match(/(\d+)$/);
  return match ? match[1] : null;
}
