import axios from "axios";
import { apiUrl } from "@/src/config/api";
import getEpisodes from "./getEpisodes.utils";
import getStreamInfo from "./getStreamInfo.utils";

// Compatibility exports retained for older call sites while all catalog data is AniList-owned.
export async function searchAnimepaheBackend(keyword, page = 1) {
  const response = await axios.get(apiUrl("/anime/search", "anilist"), {
    params: { q: keyword, page, perPage: 20 },
  });
  return response.data;
}

export async function getAnimepaheInfo(anilistId) {
  const response = await axios.get(apiUrl(`/anime/${anilistId}`, "anilist"));
  return response.data;
}

export async function getAnimepaheEpisodes(anilistId) {
  return getEpisodes(anilistId);
}

export async function getAnimepaheEpisodesByAnilistId(anilistId) {
  const result = await getEpisodes(anilistId);
  return { episodes: result.episodes || [], totalEpisodes: result.totalEpisodes || 0, provider: "anilist" };
}

export async function getAnimepaheServers() {
  return { servers: [], downloadOptions: { sub: [], dub: [], raw: [] } };
}

export async function getRecentEpisodes() {
  return { data: [] };
}

export async function getAnimepaheStreamInfo(episodeId, version = "sub", provider = "anibd", server = null) {
  return getStreamInfo(episodeId, version, provider, server);
}
