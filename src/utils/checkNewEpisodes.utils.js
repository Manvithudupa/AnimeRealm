import { supabase } from "../integrations/supabase/client";

/**
 * Check for new episodes and notify users
 */
export async function checkNewEpisodes() {
  try {
    // Get all watchlists
    const { data: watchlists, error } = await supabase
      .from("watchlists")
      .select("*");

    if (error) throw error;

    for (let item of watchlists) {
      const { user_id, anime_id, anime_title } = item;

      /* -----------------------------------
         Get last watched episode (MAX)
      ----------------------------------- */

      const { data: progress } = await supabase
        .from("continue_watching")
        .select("episode_num")
        .eq("user_id", user_id)
        .eq("anime_id", anime_id)
        .order("episode_num", { ascending: false })
        .limit(1);

      const lastWatched =
        progress?.length > 0
          ? progress[0].episode_num
          : 0;

      /* -----------------------------------
         Get latest episode (API)
      ----------------------------------- */

      const res = await fetch(
        `/api/getEpisodes?animeId=${anime_id}`
      );

      const apiData = await res.json();

      if (!apiData?.episodes?.length) continue;

      const latest =
        apiData.episodes[apiData.episodes.length - 1];

      const latestNum = latest.number;

      /* -----------------------------------
         Compare
      ----------------------------------- */

      if (latestNum <= lastWatched) continue;

      /* -----------------------------------
         Avoid duplicate notification
      ----------------------------------- */

      const { data: exists } = await supabase
        .from("notifications")
        .select("id")
        .eq("user_id", user_id)
        .eq("anime_id", anime_id)
        .eq("episode_number", latestNum)
        .maybeSingle();

      if (exists) continue;

      /* -----------------------------------
         Insert notification
      ----------------------------------- */

      await supabase.from("notifications").insert([
        {
          user_id,
          anime_id,
          anime_title,
          episode_number: latestNum,
          message: `New Episode ${latestNum} of ${anime_title} is available!`
        }
      ]);
    }
  } catch (err) {
    console.error("Notification Error:", err);
  }
}
