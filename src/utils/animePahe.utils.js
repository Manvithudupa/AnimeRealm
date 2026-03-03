const BASE_URL = import.meta.env.VITE_ANIMEPAHE_API;

/**
 * Search AnimePahe for an anime by title.
 * Returns the best-matching anime object (with .session) or null.
 */
export async function searchAnimePahe(title) {
  const res = await fetch(
    `${BASE_URL}/api/search?q=${encodeURIComponent(title)}`
  );
  if (!res.ok) throw new Error("AnimePahe search failed");
  const json = await res.json();
  const results = json?.data || [];
  if (!results.length) return null;

  // Try exact title match first, then fuzzy
  const lower = title.toLowerCase();
  const exact = results.find(
    (r) =>
      r.title?.toLowerCase() === lower ||
      r.title?.toLowerCase().includes(lower) ||
      lower.includes(r.title?.toLowerCase())
  );
  return exact || results[0];
}

/**
 * Find a specific episode from AnimePahe by episode number.
 * Searches through paginated results if needed.
 */
export async function getAnimePaheEpisode(animeSession, episodeNum) {
  const epNum = Number(episodeNum);

  // Try descending first (most common case - recent episodes)
  const firstPage = await fetchReleasesPage(animeSession, 1, "episode_desc");
  const totalPages = firstPage.paginationInfo?.lastPage || 1;
  const perPage = firstPage.paginationInfo?.perPage || 30;

  // Check first page
  const foundOnFirst = firstPage.data?.find((ep) => ep.episode === epNum);
  if (foundOnFirst) return foundOnFirst;

  // Calculate which page the episode is likely on (ascending order from end)
  // Episodes in desc order: page 1 has newest, last page has oldest
  // episode 1 would be on the last page
  const totalEpisodes = firstPage.paginationInfo?.total || 0;

  if (totalEpisodes > 0) {
    // Estimate page: episodes are desc sorted, so ep1 is on last page
    const positionFromEnd = epNum - 1; // 0-indexed from start
    const estimatedPageFromEnd = Math.floor(positionFromEnd / perPage) + 1;
    const estimatedPage = totalPages - estimatedPageFromEnd + 1;
    const clampedPage = Math.max(1, Math.min(totalPages, estimatedPage));

    if (clampedPage !== 1) {
      const targetPage = await fetchReleasesPage(
        animeSession,
        clampedPage,
        "episode_desc"
      );
      const found = targetPage.data?.find((ep) => ep.episode === epNum);
      if (found) return found;
    }
  }

  // Fallback: search ascending page by page (expensive)
  for (let page = 1; page <= Math.min(totalPages, 5); page++) {
    if (page === 1) continue; // already checked
    const pageData = await fetchReleasesPage(animeSession, page, "episode_desc");
    const found = pageData.data?.find((ep) => ep.episode === epNum);
    if (found) return found;
  }

  return null;
}

async function fetchReleasesPage(animeSession, page, sort = "episode_desc") {
  const res = await fetch(
    `${BASE_URL}/api/${animeSession}/releases?sort=${sort}&page=${page}`
  );
  if (!res.ok) throw new Error("AnimePahe releases fetch failed");
  return res.json();
}

/**
 * Get streaming sources for an episode.
 * animeSession: from search result
 * episodeSession: episode.session from releases
 */
export async function getAnimePaheSources(animeSession, episodeSession) {
  const res = await fetch(
    `${BASE_URL}/api/play/${animeSession}?episodeId=${episodeSession}`
  );
  if (!res.ok) throw new Error("AnimePahe sources fetch failed");
  const json = await res.json();

  const sources = json?.sources || [];
  // Sort by resolution descending (1080 > 720 > 360)
  sources.sort((a, b) => Number(b.resolution) - Number(a.resolution));

  const downloads = json?.downloads || [];
  downloads.sort((a, b) => Number(b.resolution) - Number(a.resolution));

  return { sources, downloads, meta: json };
}
