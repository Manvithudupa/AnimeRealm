import axios from "axios";
import { apiUrl } from "@/src/config/api";

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

function toTooltip(data = {}) {
  if (!data?.id) return null;
  const title = typeof data.title === "object" ? data.title : {};
  const genres = Array.isArray(data.genres)
    ? data.genres
    : typeof data.genres === "string"
      ? data.genres.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

  return {
    title: title.english || title.romaji || data.name || "Untitled",
    japaneseTitle: title.native || title.romaji || data.native || null,
    rating: data.score ?? null,
    subCount: null,
    dubCount: null,
    episodeCount: data.episodes || data.totalEpisodes ? String(data.episodes || data.totalEpisodes) : null,
    type: data.format || data.type || null,
    poster: data.image || data.posterImage || data.poster || "",
    description: stripHtml(data.synopsis || data.description || ""),
    airedDate: data.releaseDate || data.startDate || null,
    status: data.status || null,
    tvInfo: {
      showType: data.format || data.type || null,
      duration: data.duration ? `${data.duration}`.endsWith("m") ? `${data.duration}` : `${data.duration}m` : null,
      releaseDate: data.releaseDate || data.startDate || null,
    },
    genres,
    watchLink: `/${data.id}`,
  };
}

export default async function getQtip(id) {
  const numericId = String(id || "").trim();
  if (!/^\d+$/.test(numericId)) return null;

  try {
    const response = await axios.get(apiUrl(`/anime/${numericId}`, "anilist"), { timeout: 12000 });
    return toTooltip(response.data?.data || response.data);
  } catch (error) {
    console.warn("AniList tooltip request failed:", error?.message || error);
    return null;
  }
}
