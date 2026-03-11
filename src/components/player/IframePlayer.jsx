/* eslint-disable react/prop-types */
import { useCallback, useEffect, useRef, useState } from "react";
import BouncingLoader from "../ui/bouncingloader/Bouncingloader";

// How close to the end (seconds) we treat the video as finished
const END_THRESHOLD_SECONDS = 1;
// Minimum video duration (seconds) before auto-next triggers, to avoid false positives
const MIN_VIDEO_DURATION = 30;
// Auto-next countdown duration (seconds)
const AUTO_NEXT_COUNTDOWN = 5;

export default function IframePlayer({
  episodeId,
  serverName,
  servertype,
  animeInfo,
  episodeNum,
  episodes,
  playNext,
  autoNext,
  autoPlay,
  autoSkipIntro,
  intro,
  outro,
}) {
  const baseURL =
    serverName.toLowerCase() === "hd-1"
      ? import.meta.env.VITE_BASE_IFRAME_URL
      : serverName.toLowerCase() === "hd-4"
      ? import.meta.env.VITE_BASE_IFRAME_URL_2
      : undefined;

  // Derive the target origin for postMessage from the configured base URL.
  // Falls back to "*" only if the URL is unavailable/unparseable.
  const iframeOrigin = (() => {
    try {
      return baseURL ? new URL(baseURL).origin : "*";
    } catch {
      return "*";
    }
  })();

  const [loading, setLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  // Countdown shown before auto-advancing to next episode (null = hidden)
  const [nextCountdown, setNextCountdown] = useState(null);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(
    episodes?.findIndex(
      (episode) => episode.id.match(/ep=(\d+)/)?.[1] === episodeId
    )
  );

  const iframeRef = useRef(null);
  const skipSentRef = useRef(false);
  const countdownTimerRef = useRef(null);
  const nextTriggeredRef = useRef(false); // prevent firing playNext twice

  // Refs so event handlers always see latest props without re-registration
  const autoNextRef = useRef(autoNext);
  const autoSkipIntroRef = useRef(autoSkipIntro);
  const introRef = useRef(intro);
  const outroRef = useRef(outro);
  const currentEpisodeIndexRef = useRef(currentEpisodeIndex);
  const episodesRef = useRef(episodes);
  const playNextRef = useRef(playNext);

  useEffect(() => { autoNextRef.current = autoNext; }, [autoNext]);
  useEffect(() => { autoSkipIntroRef.current = autoSkipIntro; }, [autoSkipIntro]);
  useEffect(() => { introRef.current = intro; }, [intro]);
  useEffect(() => { outroRef.current = outro; }, [outro]);
  useEffect(() => { currentEpisodeIndexRef.current = currentEpisodeIndex; }, [currentEpisodeIndex]);
  useEffect(() => { episodesRef.current = episodes; }, [episodes]);
  useEffect(() => { playNextRef.current = playNext; }, [playNext]);

  /* ── helpers ─────────────────────────────────────────────────────── */

  /** Extract { currentTime, duration } from any known postMessage format */
  function extractTime(data) {
    if (!data || typeof data !== "object") return null;

    // Format 1: { currentTime, duration }
    if (typeof data.currentTime === "number") {
      return { currentTime: data.currentTime, duration: data.duration ?? 0 };
    }
    // Format 2: { type/event: 'timeupdate', currentTime, duration }
    if (
      (data.type === "timeupdate" || data.event === "timeupdate") &&
      typeof data.currentTime === "number"
    ) {
      return { currentTime: data.currentTime, duration: data.duration ?? 0 };
    }
    // Format 3: nested in data.data or data.payload
    const nested = data.data ?? data.payload;
    if (nested && typeof nested === "object" && typeof nested.currentTime === "number") {
      return { currentTime: nested.currentTime, duration: nested.duration ?? 0 };
    }
    return null;
  }

  /** Start a countdown then play the next episode */
  const startAutoNextCountdown = useCallback(() => {
    if (nextTriggeredRef.current) return;
    const idx = currentEpisodeIndexRef.current;
    const eps = episodesRef.current;
    if (!autoNextRef.current || idx < 0 || idx >= (eps?.length ?? 0) - 1) return;

    nextTriggeredRef.current = true;
    setNextCountdown(AUTO_NEXT_COUNTDOWN);

    let remaining = AUTO_NEXT_COUNTDOWN;
    countdownTimerRef.current = setInterval(() => {
      remaining -= 1;
      setNextCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
        setNextCountdown(null);
        const nextId = eps[idx + 1].id.match(/ep=(\d+)/)?.[1];
        if (nextId) playNextRef.current(nextId);
      }
    }, 1000);
  }, []); // intentionally empty — all values read via refs

  /* ── iframe src ──────────────────────────────────────────────────── */
  useEffect(() => {
    setLoading(true);
    setIframeLoaded(false);
    setIframeSrc("");
    setIframeSrc(`${baseURL}/${episodeId}/${servertype}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeId, servertype, serverName, animeInfo]);

  /* ── episode index ───────────────────────────────────────────────── */
  useEffect(() => {
    if (episodes?.length > 0) {
      const newIndex = episodes.findIndex(
        (episode) => episode.id.match(/ep=(\d+)/)?.[1] === episodeId
      );
      setCurrentEpisodeIndex(newIndex);
    }
  }, [episodeId, episodes]);

  /* ── reset per-episode state ─────────────────────────────────────── */
  useEffect(() => {
    setShowSkipIntro(false);
    setNextCountdown(null);
    skipSentRef.current = false;
    nextTriggeredRef.current = false;
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, [episodeId]);

  /* ── postMessage listener ────────────────────────────────────────── */
  useEffect(() => {
    const handleMessage = (event) => {
      // Also handle "ended" event type
      if (
        event.data &&
        (event.data.type === "ended" || event.data.event === "ended")
      ) {
        startAutoNextCountdown();
        return;
      }

      const times = extractTime(event.data);
      if (!times) return;

      const { currentTime, duration } = times;
      const intr = introRef.current;
      const outr = outroRef.current;

      const inIntroRange =
        intr?.start != null &&
        intr?.end != null &&
        currentTime >= intr.start &&
        currentTime < intr.end;
      const inOutroRange =
        outr?.start != null &&
        outr?.end != null &&
        currentTime >= outr.start &&
        currentTime < outr.end;

      setShowSkipIntro(inIntroRange || inOutroRange);

      // Auto-skip: send seek postMessage (guard against repeated sends)
      if (autoSkipIntroRef.current && iframeRef.current?.contentWindow) {
        if (inIntroRange || inOutroRange) {
          if (!skipSentRef.current) {
            skipSentRef.current = true;
            const target = inIntroRange ? intr.end : outr.end;
            // Send in multiple formats for compatibility
            iframeRef.current.contentWindow.postMessage(
              { type: "seek", time: target },
              iframeOrigin
            );
            iframeRef.current.contentWindow.postMessage(
              { event: "seek", time: target },
              iframeOrigin
            );
          }
        } else {
          skipSentRef.current = false;
        }
      } else if (!inIntroRange && !inOutroRange) {
        skipSentRef.current = false;
      }

      // Auto-next when video ends (within threshold of duration)
      if (
        duration > MIN_VIDEO_DURATION &&
        currentTime >= duration - END_THRESHOLD_SECONDS &&
        autoNextRef.current
      ) {
        startAutoNextCountdown();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [startAutoNextCountdown, iframeOrigin]);

  /* ── continue-watching on unmount ────────────────────────────────── */
  useEffect(() => {
    setLoading(true);
    setIframeLoaded(false);
    return () => {
      const continueWatching = JSON.parse(localStorage.getItem("continueWatching")) || [];
      const newEntry = {
        id: animeInfo?.id,
        data_id: animeInfo?.data_id,
        episodeId,
        episodeNum,
        adultContent: animeInfo?.adultContent,
        poster: animeInfo?.poster,
        title: animeInfo?.title,
        japanese_title: animeInfo?.japanese_title,
      };
      if (!newEntry.data_id) return;
      const existingIndex = continueWatching.findIndex(
        (item) => item.data_id === newEntry.data_id
      );
      if (existingIndex !== -1) {
        continueWatching[existingIndex] = newEntry;
      } else {
        continueWatching.push(newEntry);
      }
      localStorage.setItem("continueWatching", JSON.stringify(continueWatching));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeId, servertype]);

  /* ── cleanup countdown on unmount ───────────────────────────────── */
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  /* ── helpers ─────────────────────────────────────────────────────── */
  function handleSkipClick() {
    const intr = introRef.current;
    const outr = outroRef.current;
    const target = intr?.end ?? outr?.end;
    if (target != null && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: "seek", time: target }, iframeOrigin);
      iframeRef.current.contentWindow.postMessage({ event: "seek", time: target }, iframeOrigin);
    }
    setShowSkipIntro(false);
  }

  function cancelAutoNext() {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setNextCountdown(null);
    nextTriggeredRef.current = false;
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Loader Overlay */}
      <div
        className={`absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 z-10 transition-opacity duration-500 ${
          loading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <BouncingLoader />
      </div>

      {/* Skip Intro Overlay Button */}
      {showSkipIntro && !autoSkipIntro && (
        <button
          className="absolute bottom-16 right-4 z-20 px-4 py-2 bg-black/80 text-white text-sm font-medium rounded border border-white/30 hover:bg-white/10 transition-all duration-200"
          onClick={handleSkipClick}
        >
          Skip Intro
        </button>
      )}

      {/* Auto-next Countdown Overlay */}
      {nextCountdown !== null && (
        <div className="absolute bottom-16 right-4 z-20 flex items-center gap-3 px-4 py-2 bg-black/85 text-white text-sm font-medium rounded border border-white/30">
          <span>Next episode in {nextCountdown}s</span>
          <button
            className="ml-1 px-2 py-0.5 bg-white/10 hover:bg-white/20 rounded text-xs border border-white/20 transition-colors"
            onClick={cancelAutoNext}
          >
            Cancel
          </button>
        </div>
      )}

      <iframe
        ref={iframeRef}
        key={`${episodeId}-${servertype}-${serverName}-${iframeSrc}`}
        src={iframeSrc}
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        className={`w-full h-full transition-opacity duration-500 ${
          iframeLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => {
          setIframeLoaded(true);
          setTimeout(() => setLoading(false), 1000);
          if (iframeRef.current?.contentWindow) {
            // Notify embedded player of autoplay preference in multiple formats
            if (autoPlay) {
              iframeRef.current.contentWindow.postMessage({ type: "autoplay" }, iframeOrigin);
              iframeRef.current.contentWindow.postMessage({ event: "autoplay" }, iframeOrigin);
            }
          }
        }}
      ></iframe>
    </div>
  );
}
