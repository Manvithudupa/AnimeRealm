import axios from "axios";
import { apiUrl } from "@/src/config/api";

function toTooltip(data) {
  if (!data?.id) return null;
  const title = data.title || {};
  return {
    title: title.english || title.romaji || data.name || "Untitled",
    japaneseTitle: title.native || title.romaji || data.native || null,
    rating: data.score ?? null,
    subCount: null,
    dubCount: null,
    episodeCount: data.episodes || data.totalEpisodes ? String(data.episodes || data.totalEpisodes) : null,
    type: data.format || data.type || null,
    poster: data.image || data.posterImage || "",
    description: data.synopsis || "",
    airedDate: data.releaseDate || null,
    status: data.status || null,
    tvInfo: { showType: data.format || data.type || null, duration: data.duration ? `${data.duration}m` : null, releaseDate: data.releaseDate || null },
    genres: Array.isArray(data.genres) ? data.genres : (typeof data.genres === "string" ? data.genres.split(",").map((item) => item.trim()) : []),
    watchLink: `/${data.id}`,
  };
}

export default async function getQtip(id) {
  try {
    const metadataResponse = await axios.get(apiUrl(`/anime/${id}`, "anilist")).catch(() => null);
    if (metadataResponse?.data?.data?.id) return toTooltip(metadataResponse.data.data);
    const providerResponse = await axios.get(apiUrl(`/anime/${id}`)).catch(() => null);
    const providerData = providerResponse?.data?.data;
    if (!providerData?.id) return null;
    const metadata = providerData.anilistId
      ? await axios.get(apiUrl(`/anime/${providerData.anilistId}`, "anilist")).catch(() => null)
      : null;
    const result = toTooltip(metadata?.data?.data || providerData);
    return result ? { ...result, watchLink: `/${providerData.id}` } : null;
  } catch (error) {
    console.error("Error fetching qtip info:", error);
    return null;
  }
}
