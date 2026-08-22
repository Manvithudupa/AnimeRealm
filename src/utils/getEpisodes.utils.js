import axios from "axios";
import { apiUrl } from "@/src/config/api";

function normalizeEpisode(episode, index) {
  const episodeNumber = Number(episode.episodeNumber ?? episode.number ?? episode.episode ?? index + 1);
  if (!Number.isFinite(episodeNumber)) return null;
  return {
    episodeId: null,
    id: `ep=${episodeNumber}`,
    episode_no: episodeNumber,
    title: episode.title || `Episode ${episodeNumber}`,
    thumbnail: episode.thumbnail || episode.image || null,
    overview: episode.overview || episode.synopsis || null,
    airDate: episode.airDate || episode.releaseDate || null,
    aired: episode.aired !== false,
    hasDub: null,
    hasSub: null,
    isFiller: Boolean(episode.isFiller || episode.filler),
  };
}

export default async function getEpisodes(anilistId) {
  try {
    const response = await axios.get(apiUrl(`/anime/${anilistId}/episodes`, "anilist"), {
      timeout: 18000,
    });
    const rawEpisodes = Array.isArray(response.data?.data)
      ? response.data.data
      : Array.isArray(response.data?.episodes)
        ? response.data.episodes
        : [];
    const episodes = rawEpisodes
      .map(normalizeEpisode)
      .filter(Boolean)
      .filter((episode, index, all) => all.findIndex((item) => item.episode_no === episode.episode_no) === index)
      .sort((a, b) => a.episode_no - b.episode_no);
    return { episodes, totalEpisodes: episodes.length };
  } catch (error) {
    console.warn("AniList episode metadata request failed:", error?.message || error);
    return { episodes: [], totalEpisodes: 0, error };
  }
}
