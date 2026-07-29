import axios from "axios";
import { ANIME_GENRES } from "@/src/constants/genres";
import { apiUrl } from "@/src/config/api";

const CACHE_KEY = "homeInfoCache_v3";
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export default async function getHomeInfo() {
  const currentTime = Date.now();
  const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY));

  if (cachedData && currentTime - cachedData.timestamp < CACHE_DURATION) {
    return cachedData.data;
  }

  try {
    const response = await axios.get(apiUrl('/home'));
    const data = response.data?.data || {};

    // Map exact Shirayuki home response fields
    const spotlights = (data.spotlight || []).map(mapSpotlightItem);
    const trending = (data.trending || []).map(mapListItem);
    const topAiring = (data.topAiring || []).map(mapListItem);
    const mostPopular = (data.mostPopular || []).map(mapListItem);
    const latestEpisodes = (data.latestEpisodes || []).map(mapLatestEpisode);
    const top10Day = (data.top10?.day || data.top10day || []).map(mapTop10Item);
    const top10Week = (data.top10?.week || data.top10week || []).map(mapTop10Item);
    const top10Month = (data.top10?.month || data.top10month || []).map(mapTop10Item);

    const dataToCache = {
      data: {
        spotlights,
        trending,
        topten: {
          today: top10Day.slice(0, 10),
          week: top10Week.slice(0, 10),
          month: top10Month.slice(0, 10),
        },
        todaySchedule: [],
        top_airing: topAiring,
        most_popular: mostPopular,
        most_favorite: mostPopular,
        latest_completed: top10Month,
        latest_episode: latestEpisodes.length > 0 ? latestEpisodes : topAiring,
        top_upcoming: (data.topUpcoming || data.quickLists?.newReleases || []).map(mapListItem),
        recently_added: trending,
        genres: ANIME_GENRES,
      },
      timestamp: currentTime,
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(dataToCache));
    return dataToCache.data;
  } catch (error) {
    console.error("Error fetching home info:", error);
    return null;
  }
}

/**
 * Map spotlight item (has extra description, episodes, type, quality fields).
 */
function mapSpotlightItem(item) {
  const epSub = item.episodes?.sub || null;
  const epDub = item.episodes?.dub || null;
  return {
    id: item.id || "",
    title: item.title || item.ename || item.jname || "",
    japanese_title: item.jname || item.title || "",
    poster: item.poster || "",
    description: item.description || "",
    rank: item.rank || 1,
    episodes: epSub || epDub || null,
    tvInfo: {
      showType: item.type || null,
      duration: null,
      releaseDate: null,
      rating: null,
      quality: item.quality || null,
      sub: epSub,
      dub: epDub,
    },
    score: null,
    otherInfo: [],
  };
}

/**
 * Map generic list item (trending, topAiring, mostPopular, etc.).
 */
function mapListItem(item) {
  const epSub = item.episodes?.sub || null;
  const epDub = item.episodes?.dub || null;
  return {
    id: item.id || "",
    anilistId: item.id || null,
    title: item.title || item.ename || item.jname || "",
    japanese_title: item.jname || item.title || "",
    poster: item.poster || "",
    bannerImage: null,
    color: null,
    description: "",
    episodes: epSub || null,
    tvInfo: {
      showType: item.type || null,
      duration: null,
      releaseDate: null,
      rating: null,
      quality: null,
      sub: epSub,
      dub: epDub,
    },
    genres: [],
    score: null,
    status: null,
    season: null,
    studio: null,
    producers: [],
  };
}

/**
 * Map latest episode item (has episode number).
 */
function mapLatestEpisode(item) {
  const epSub = item.episodes?.sub || null;
  const epDub = item.episodes?.dub || null;
  return {
    id: item.id || "",
    anilistId: item.id || null,
    title: item.title || item.ename || item.jname || "",
    japanese_title: item.jname || item.title || "",
    poster: item.poster || "",
    episodeId: `ep=${item.episode || item.episodeNumber || ""}`,
    episodeNumber: item.episode || item.episodeNumber || "",
    thumbnail: item.poster || "",
    tvInfo: {
      sub: epSub,
      dub: epDub,
      eps: item.episode || item.episodeNumber || null,
      showType: item.type || null,
    },
  };
}

/**
 * Map top10 item (has rank and episodes sub/dub).
 */
function mapTop10Item(item) {
  const epSub = item.episodes?.sub || null;
  const epDub = item.episodes?.dub || null;
  return {
    id: item.id || "",
    anilistId: item.id || null,
    title: item.title || item.ename || item.jname || "",
    japanese_title: item.jname || item.title || "",
    poster: item.poster || "",
    rank: item.rank || 0,
    score: null,
    tvInfo: {
      sub: epSub,
      dub: epDub,
      showType: null,
      duration: null,
    },
  };
}
