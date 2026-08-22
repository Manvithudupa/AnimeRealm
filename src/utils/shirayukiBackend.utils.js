import axios from "axios";
import { apiUrl } from "@/src/config/api";
import getEpisodes from "./getEpisodes.utils";
import getStreamInfo from "./getStreamInfo.utils";

export async function searchAnimepaheBackend(keyword) {
  const response = await axios.get(apiUrl("/anime/search"), { params: { q: keyword } });
  return response.data;
}

export async function getAnimepaheInfo(animeId) {
  const response = await axios.get(apiUrl(`/anime/${animeId}`));
  return response.data;
}

export async function getAnimepaheEpisodes(animeId) {
  return getEpisodes(animeId);
}

export async function getAnimepaheEpisodesByAnilistId(anilistId) {
  const result = await getEpisodes(anilistId);
  return { episodes: result.episodes || [], totalEpisodes: result.totalEpisodes || 0, provider: "anibd" };
}

export async function getAnimepaheServers() {
  return { servers: [], downloadOptions: { sub: [], dub: [], raw: [] } };
}

export async function getRecentEpisodes() {
  return { data: [] };
}

export async function getAnimepaheStreamInfo(episodeId, version = "sub") {
  return getStreamInfo(episodeId, version);
}
