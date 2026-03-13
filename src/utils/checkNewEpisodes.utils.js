import { supabase } from "@/src/integrations/supabase/client";
import axios from "axios";

export const checkNewEpisodes = async (userId) => {
  if (!userId) return;

  const base_url = import.meta.env.VITE_ANIMEPAHE_URL;

  try {
    const [continueWatchingData, watchlistData] = await Promise.all([
      supabase
        .from("continue_watching")
        .select("anime_id, episode_num, title, poster")
        .eq("user_id", userId),
      supabase
        .from("watchlists")
        .select("anime_id, anime_title, anime_poster, status")
        .eq("user_id", userId)
        .in("status", ["watching", "on_hold"]),
    ]);

    const continueWatching = continueWatchingData.data || [];
    const watchlist = watchlistData.data || [];

    const allAnimeIds = [
      ...new Set([
        ...continueWatching.map((item) => item.anime_id),
        ...watchlist.map((item) => item.anime_id),
      ]),
    ];

    const newNotifications = [];

    for (const animeId of allAnimeIds) {
      try {
        const response = await axios.get(
          `${base_url}/api/anilist/episodes/${animeId}?provider=hianime`
        );
        const providerEpisodes = response.data?.providerEpisodes || [];

        if (!providerEpisodes.length) continue;

        // Find the latest episode by episodeNumber
        const latestEpisode = providerEpisodes.reduce((prev, current) =>
          (current.episodeNumber || 0) > (prev.episodeNumber || 0)
            ? current
            : prev
        );

        const latestEpisodeNum = latestEpisode.episodeNumber || 0;
        const latestEpisodeId = latestEpisode.episodeId;

        const continueWatchingItem = continueWatching.find(
          (item) => item.anime_id === animeId
        );

        if (
          continueWatchingItem &&
          latestEpisodeNum > (continueWatchingItem.episode_num || 0)
        ) {
          const { data: existing } = await supabase
            .from("notifications")
            .select("id")
            .eq("user_id", userId)
            .eq("anime_id", animeId)
            .eq("episode_num", latestEpisodeNum)
            .eq("notification_type", "continue_watching")
            .maybeSingle();

          if (!existing) {
            newNotifications.push({
              user_id: userId,
              anime_id: animeId,
              anime_title: continueWatchingItem.title || "Unknown Anime",
              anime_poster: continueWatchingItem.poster,
              episode_num: latestEpisodeNum,
              episode_id: latestEpisodeId,
              notification_type: "continue_watching",
            });
          }
        }

        const watchlistItem = watchlist.find(
          (item) => item.anime_id === animeId
        );

        if (watchlistItem && !continueWatchingItem) {
          const { data: existing } = await supabase
            .from("notifications")
            .select("id")
            .eq("user_id", userId)
            .eq("anime_id", animeId)
            .eq("episode_num", latestEpisodeNum)
            .eq("notification_type", "watchlist")
            .maybeSingle();

          if (!existing) {
            newNotifications.push({
              user_id: userId,
              anime_id: animeId,
              anime_title: watchlistItem.anime_title || "Unknown Anime",
              anime_poster: watchlistItem.anime_poster,
              episode_num: latestEpisodeNum,
              episode_id: latestEpisodeId,
              notification_type: "watchlist",
            });
          }
        }
      } catch (error) {
        console.error(`Error checking episodes for ${animeId}:`, error);
      }
    }

    if (newNotifications.length > 0) {
      const { error } = await supabase
        .from("notifications")
        .insert(newNotifications);

      if (error) {
        if (error.code !== "23505") {
          console.error("Error inserting notifications:", error);
        }
        return 0;
      }
      return newNotifications.length;
    }

    return 0;
  } catch (error) {
    console.error("Error checking new episodes:", error);
    return 0;
  }
};
