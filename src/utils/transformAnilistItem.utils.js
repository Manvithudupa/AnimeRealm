/**
 * Transforms a raw Anilist API anime item into the shape expected
 * by the app's components (CategoryCard, Spotlight, Banner, etc.).
 */
export function transformAnilistItem(item) {
  if (!item) return null;
  return {
    id: String(item.anilistId),
    anilistId: item.anilistId,
    malId: item.malId,
    title: item.title?.english || item.title?.romaji || "",
    japanese_title: item.title?.native || item.title?.romaji || "",
    poster: item.image,
    bannerImage: item.bannerImage,
    color: item.color,
    description: item.synopsis,
    episodes: item.episodes,
    tvInfo: {
      showType: item.format,
      duration: item.duration ? `${item.duration}m` : null,
      releaseDate: item.releaseDate,
      rating: null,
      quality: null,
      sub: null,
      dub: null,
    },
    genres: item.genres || [],
    score: item.score,
    status: item.status,
    season: item.season,
    studio: item.studio,
    producers: item.producers || [],
  };
}
