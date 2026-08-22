function stripHtml(value = "") {
  return String(value)
    .replace(/<br\s*\/?>(\s*)/gi, " $1")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function transformAnilistItem(item = {}) {
  const title = typeof item.title === "object" ? item.title : {};
  const id = item.id ?? item.anilistId ?? item.malId ?? "";
  const titleText = title.english || title.romaji || item.name || item.title || "Untitled";
  const nativeTitle = title.native || title.romaji || item.japaneseTitle || titleText;
  const episodes = item.episodes ?? item.episodeCount ?? null;
  const sub = item.sub ?? item.hasSub ?? null;
  const dub = item.dub ?? item.hasDub ?? null;
  return {
    id: String(id),
    data_id: String(id),
    anilistId: item.anilistId ?? item.id ?? null,
    malId: item.malId ?? null,
    title: titleText,
    japanese_title: nativeTitle,
    poster: item.poster || item.posterImage || item.image || item.coverImage?.large || "",
    bannerImage: item.bannerImage || item.banner || null,
    color: item.color || null,
    description: stripHtml(item.description || item.synopsis || ""),
    episodes,
    tvInfo: {
      showType: item.type || item.format || item.showType || null,
      duration: item.duration ? `${item.duration}`.endsWith("m") ? `${item.duration}` : `${item.duration}m` : null,
      releaseDate: item.releaseDate || null,
      rating: item.rating || item.ageRating || null,
      quality: item.quality || null,
      sub,
      dub,
    },
    genres: Array.isArray(item.genres) ? item.genres : [],
    score: item.score ?? null,
    status: item.status || null,
    season: item.season || null,
    studio: item.studio || item.studios || null,
    producers: Array.isArray(item.producers) ? item.producers : [],
  };
}

export function mapAniListCollection(payload = {}) {
  const items = Array.isArray(payload.data) ? payload.data : [];
  return {
    data: items.map(transformAnilistItem),
    currentPage: payload.currentPage || 1,
    totalPage: payload.lastPage || (payload.hasNextPage ? (payload.currentPage || 1) + 1 : payload.currentPage || 1),
    hasNextPage: Boolean(payload.hasNextPage),
    total: items.length,
  };
}
