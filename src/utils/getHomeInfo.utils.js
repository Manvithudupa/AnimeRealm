import axios from "axios";
import { ANIME_GENRES } from "@/src/constants/genres";
import { apiUrl } from "@/src/config/api";
import { transformAnilistItem } from "./transformAnilistItem.utils";

const CACHE_KEY = "homeInfoCache_kenjitsu_v1";
const CACHE_DURATION = 15 * 60 * 1000;

async function request(url, params) {
  try {
    const response = await axios.get(url, { params });
    return response.data || {};
  } catch (error) {
    console.warn("Kenjitsu home request failed:", url, error?.message || error);
    return { data: [], hasNextPage: false };
  }
}

function toList(payload) {
  return (Array.isArray(payload?.data) ? payload.data : []).map(transformAnilistItem);
}

function withRank(items) {
  return items.map((item, index) => ({ ...item, number: index + 1, rank: index + 1 }));
}

function toSpotlight(item, index) {
  return { ...item, rank: index + 1, description: item.description || "" };
}

function toLatestEpisode(item) {
  return { ...item, episodeId: null, episodeNumber: null, thumbnail: item.poster, tvInfo: item.tvInfo };
}

export default async function getHomeInfo() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) return cached.data;
  } catch { /* ignore storage failures */ }

  const today = new Date();
  const seasonNames = ["WINTER", "SPRING", "SUMMER", "FALL"];
  const season = seasonNames[Math.floor(today.getUTCMonth() / 3) % 4];
  const year = today.getUTCFullYear();
  const date = today.toISOString().slice(0, 10);
  const [trendingPayload, airingPayload, popularPayload, upcomingPayload, ratedPayload, seasonPayload, schedulePayload] = await Promise.all([
    request(apiUrl("/anime/top/trending", "anilist"), { format: "TV", page: 1, perPage: 20 }),
    request(apiUrl("/anime/top/airing", "anilist"), { format: "TV", page: 1, perPage: 20 }),
    request(apiUrl("/anime/top/popular", "anilist"), { format: "TV", page: 1, perPage: 20 }),
    request(apiUrl("/anime/top/upcoming", "anilist"), { format: "TV", page: 1, perPage: 20 }),
    request(apiUrl("/anime/top/rating", "anilist"), { format: "TV", page: 1, perPage: 20 }),
    request(apiUrl(`/seasons/${season}/${year}`, "anilist"), { format: "TV", page: 1, perPage: 20 }),
    request(apiUrl(`/airing/date/${date}`, "anilist"), { page: 1, perPage: 20 }),
  ]);

  const trending = toList(trendingPayload);
  const topAiring = toList(airingPayload);
  const mostPopular = toList(popularPayload);
  const topUpcoming = toList(upcomingPayload);
  const rated = toList(ratedPayload);
  const seasonal = toList(seasonPayload);
  const todaySchedule = toList(schedulePayload);
  const data = {
    spotlights: withRank((trending.length ? trending : mostPopular).slice(0, 8)).map(toSpotlight),
    trending: withRank(trending),
    topten: {
      today: withRank(mostPopular.slice(0, 10)),
      week: withRank(trending.slice(0, 10)),
      month: withRank(rated.slice(0, 10)),
    },
    todaySchedule,
    top_airing: topAiring,
    most_popular: mostPopular,
    most_favorite: rated,
    latest_completed: rated,
    latest_episode: (topAiring.length ? topAiring : seasonal).map(toLatestEpisode),
    top_upcoming: topUpcoming,
    recently_added: seasonal,
    genres: ANIME_GENRES,
  };
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() })); } catch { /* ignore */ }
  return data;
}
