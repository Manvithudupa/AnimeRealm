import { useEffect, useRef } from "react";
import { checkNewEpisodes } from "@/src/utils/checkNewEpisodes.utils";
import { useAuth } from "./useAuth";

const CHECK_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 hours
const LS_KEY = "animeRealm_lastEpisodeCheck";

/**
 * Runs checkNewEpisodes in the background on mount (throttled to once per
 * CHECK_INTERVAL_MS using localStorage) and then on a repeating interval.
 * This hook is intentionally decoupled from the notification dropdown so that
 * opening the dropdown does NOT trigger fetches to continue_watching /
 * watchlists tables.
 */
export const useEpisodeCheck = () => {
  const { user } = useAuth();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;

    const run = async () => {
      await checkNewEpisodes(user.id);
      if (mounted) {
        localStorage.setItem(LS_KEY, Date.now().toString());
      }
    };

    const lastCheck = parseInt(localStorage.getItem(LS_KEY) || "0", 10);
    const msSinceLast = Date.now() - lastCheck;

    // Run immediately if enough time has passed since last check
    if (msSinceLast >= CHECK_INTERVAL_MS) {
      run();
    }

    // Schedule periodic checks
    intervalRef.current = setInterval(run, CHECK_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(intervalRef.current);
    };
  }, [user?.id]);
};
