import axios from "axios";
import { transformAnilistItem } from "./transformAnilistItem.utils";
import { ANIME_GENRES } from "@/src/constants/genres";

const CACHE_KEY = "homeInfoCache";
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export default async function getHomeInfo() {
  const base_url = import.meta.env.VITE_ANIMEPAHE_URL;

  const currentTime = Date.now();
  const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY));

  if (cachedData && currentTime - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }

  const [trendingRes, popularRes, airingRes, upcomingRes, ratingRes] =
    await Promise.all([
      axios.get(`${base_url}/api/anilist/anime/top/trending?perPage=20`),
      axios.get(`${base_url}/api/anilist/anime/top/popular?perPage=20`),
      axios.get(`${base_url}/api/anilist/anime/top/airing?perPage=20`),
      axios.get(`${base_url}/api/anilist/anime/top/upcoming?perPage=20`),
      axios.get(`${base_url}/api/anilist/anime/top/rating?perPage=20`),
    ]);

  const trending = (trendingRes.data?.data || []).map(transformAnilistItem);
  const popular = (popularRes.data?.data || []).map(transformAnilistItem);
  const airing = (airingRes.data?.data || []).map(transformAnilistItem);
  const upcoming = (upcomingRes.data?.data || []).map(transformAnilistItem);
  const rating = (ratingRes.data?.data || []).map(transformAnilistItem);

  const dataToCache = {
    data: {
      spotlights: trending.slice(0, 10),
      trending,
      topten: {
        today: trending.slice(0, 10),
        week: popular.slice(0, 10),
        month: rating.slice(0, 10),
      },
      todaySchedule: [],
      top_airing: airing,
      most_popular: popular,
      most_favorite: popular,
      latest_completed: rating,
      latest_episode: airing,
      top_upcoming: upcoming,
      recently_added: trending,
      genres: ANIME_GENRES,
    },
    timestamp: currentTime,
  };

  localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));

  return dataToCache.data;
}
