import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import Artplayer from "artplayer";
import artplayerPluginChapter from "./artPlayerPluinChaper";
import artplayerPluginVttThumbnail from "./artPlayerPluginVttThumbnail";
import {
  fullScreenOffIcon,
  fullScreenOnIcon,
  loadingIcon,
  muteIcon,
  pauseIcon,
  pipIcon,
  playIcon,
  playIconLg,
  settingsIcon,
  volumeIcon,
} from "./PlayerIcons";
import "./Player.css";
import website_name from "@/src/config/website";
import getChapterStyles from "./getChapterStyle";
import artplayerPluginHlsControl from "artplayer-plugin-hls-control";
import artplayerPluginSubtitleSelection from "./artplayerPluginSubtitleSelection";
import { supabase } from "@/src/integrations/supabase/client";

Artplayer.LOG_VERSION = false;
Artplayer.CONTEXTMENU = false;

// How close to the end (seconds) we treat the video as finished for the
// near-end auto-next fallback for the current player instance.
const END_THRESHOLD_SECONDS = 2;
// Minimum video duration (seconds) before auto-next triggers.
const MIN_VIDEO_DURATION = 30;

export default function Player({
  streamUrl,
  m3u8ProxyUrl,
  subtitles,
  thumbnail,
  poster,
  intro,
  outro,
  autoSkipIntro,
  autoPlay,
  autoNext,
  hardSub,
  episodeId,
  episodes,
  playNext,
  animeInfo,
  episodeNum,
  streamInfo,
  onSourceFallback,
}) {
  const artRef = useRef(null);
  const artInstanceRef = useRef(null);
  const saveIntervalRef = useRef(null);
  const lastSavedTimeRef = useRef(0);
  const nextTriggeredRef = useRef(false);
  const skipIntroVisibleRef = useRef(false);
  const skipOutroVisibleRef = useRef(false);
  const [skipIntroVisible, setSkipIntroVisible] = useState(false);
  const [skipOutroVisible, setSkipOutroVisible] = useState(false);

  const proxy = import.meta.env.VITE_PROXY_URL;
  const m3u8proxy = import.meta.env.VITE_M3U8_PROXY_URL?.split(",") || [];

  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(
    episodes?.findIndex((ep) => ep.id.match(/ep=(\d+)/)?.[1] === episodeId)
  );

  /* =========================== Episode Sync =========================== */
  useEffect(() => {
    if (!episodes?.length) return;
    const index = episodes.findIndex(
      (ep) => ep.id.match(/ep=(\d+)/)?.[1] === episodeId
    );
    setCurrentEpisodeIndex(index);
  }, [episodeId, episodes]);

  /* =========================== Control Refs =========================== */
  // Keep refs in sync with the latest prop values so that event handlers
  // inside the player (video:ended, timeupdate) always read the current
  // toggle state WITHOUT needing to destroy/recreate the player on toggle.
  const autoPlayRef = useRef(autoPlay);
  const autoNextRef = useRef(autoNext);
  const autoSkipIntroRef = useRef(autoSkipIntro);
  const hardSubRef = useRef(hardSub);
  const currentEpisodeIndexRef = useRef(currentEpisodeIndex);
  const episodesRef = useRef(episodes);

  useEffect(() => { autoPlayRef.current = autoPlay; }, [autoPlay]);
  useEffect(() => { autoNextRef.current = autoNext; }, [autoNext]);
  useEffect(() => { autoSkipIntroRef.current = autoSkipIntro; }, [autoSkipIntro]);
  useEffect(() => { hardSubRef.current = hardSub; }, [hardSub]);
  useEffect(() => { currentEpisodeIndexRef.current = currentEpisodeIndex; }, [currentEpisodeIndex]);
  useEffect(() => { episodesRef.current = episodes; }, [episodes]);

  // Reset per-episode state when the episode changes so that the near-end
  // fallback and video:ended handler never double-fire for the same episode.
  useEffect(() => {
    nextTriggeredRef.current = false;
  }, [episodeId]);

  // Helper: apply or remove bold subtitle styling on an art instance.
  const applyHardSubStyle = (art, isHard) => {
    if (!art?.subtitle || typeof art.subtitle.style !== "function") return;
    try {
      art.subtitle.style({ fontWeight: isHard ? "bold" : "normal" });
    } catch {
      // Subtitle may not be ready yet; the ready handler will apply the style.
    }
  };

  // Apply / remove bold subtitle styling when hardSub is toggled while the
  // player is already live (no player recreation needed).
  useEffect(() => {
    applyHardSubStyle(artInstanceRef.current, hardSub);
  }, [hardSub]);

  /* =========================== Chapter Styles =========================== */
  useEffect(() => {
    if (!streamUrl) return;
    const style = document.createElement("style");
    style.dataset.chapterStyles = "true";
    style.textContent = getChapterStyles(intro, outro);
    document.head.appendChild(style);
    return () => style.remove();
  }, [streamUrl, intro, outro]);

  /* =========================== HLS Handler =========================== */
  const playM3u8 = (video, url, art) => {
    if (Hls.isSupported()) {
      if (art.hls) art.hls.destroy();

      const hls = new Hls({
        loader: Hls.DefaultConfig.loader,
        testBandwidth: false,
        fragLoadingTimeoutMs: 30000,
        fragLoadingMaxRetry: 6,
        fragLoadingRetryDelay: 1000,
        fragLoadingRetryDelayMax: 8000,
        manifestLoadingTimeoutMs: 10000,
        manifestLoadingMaxRetry: 3,
      });

      // Trigger autoplay once HLS has parsed the manifest and media is
      // attached.  Artplayer's built-in autoplay flag is unreliable when
      // the source is managed by HLS.js (it may fire before any segments
      // are buffered, resulting in a play() rejection).
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlayRef.current) {
          art.play().catch(() => {
            // Browser autoplay policy blocked the request – the user can
            // start playback manually.  This is an expected failure on
            // first page load in some browsers.
          });
        }
      });

      let hlsRetryCount = 0;
      const MAX_HLS_RETRIES = 3;

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hlsRetryCount++;
              if (hlsRetryCount >= MAX_HLS_RETRIES && onSourceFallback) {
                // All retries exhausted — fall back to next source
                console.warn(`HLS fatal network error after ${hlsRetryCount} retries, falling back to next source`);
                hls.destroy();
                onSourceFallback();
              } else {
                hls.startLoad();
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hlsRetryCount++;
              if (hlsRetryCount >= MAX_HLS_RETRIES && onSourceFallback) {
                console.warn(`HLS fatal media error after ${hlsRetryCount} retries, falling back to next source`);
                hls.destroy();
                onSourceFallback();
              } else {
                hls.recoverMediaError();
              }
              break;
            default:
              // Unknown fatal error — try fallback
              if (onSourceFallback) {
                console.warn("HLS unknown fatal error, falling back to next source");
                hls.destroy();
                onSourceFallback();
              }
              break;
          }
        }
      });

      hls.loadSource(url);
      hls.attachMedia(video);
      art.hls = hls;
      art.on("destroy", () => hls.destroy());
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    }
  };

  /* =========================== Chapters =========================== */
  const createChapters = () => {
    const chapters = [];
    if (intro?.start || intro?.end) chapters.push({ start: intro.start, end: intro.end, title: "Intro" });
    if (outro?.start || outro?.end) chapters.push({ start: outro.start, end: outro.end, title: "Outro" });
    return chapters;
  };

  /* =========================== Main Player =========================== */
  useEffect(() => {
    if (!streamUrl || !artRef.current) return;

    // Reset skip button visibility for the new stream
    skipIntroVisibleRef.current = false;
    skipOutroVisibleRef.current = false;
    setSkipIntroVisible(false);
    setSkipOutroVisible(false);

    let art;
    // Guard that prevents a slow async init from creating a player after
    // the effect has already been cleaned up (e.g. rapid prop changes).
    let isCancelled = false;

    const init = async () => {
      // Get logged-in user
      const { data: { user } } = await supabase.auth.getUser();
      if (isCancelled) return;
      let resumeTime = 0;

      // Fetch resume time from Supabase
      if (user) {
        const { data } = await supabase
          .from("continue_watching")
          .select("left_at")
          .eq("user_id", user.id)
          .eq("anime_id", animeInfo?.id)
          .single();
        if (data?.left_at) resumeTime = data.left_at;
      }

      if (isCancelled) return;

      // Fallback to localStorage
      if (!resumeTime) {
        const local = JSON.parse(localStorage.getItem("continueWatching")) || [];
        const saved = local.find((i) => i.episodeId === episodeId);
        if (saved?.leftAt) resumeTime = saved.leftAt;
      }

      // Headers for proxied streams
      const iframeUrl = streamInfo?.streamingLink?.iframe;
      const existingHeaders = streamInfo?.streamingLink?.headers || {};
      const headers = { ...existingHeaders };
      if (iframeUrl) headers.referer = new URL(iframeUrl).origin + "/";

      const defaultProxy = m3u8proxy.find(Boolean) || "";
      const proxiedStreamUrl = m3u8ProxyUrl
        ? `${m3u8ProxyUrl}${encodeURIComponent(streamUrl)}&headers=${encodeURIComponent(JSON.stringify(headers))}`
        : defaultProxy
          ? `${defaultProxy}${encodeURIComponent(streamUrl)}&headers=${encodeURIComponent(JSON.stringify(headers))}`
          : streamUrl;

      // Initialize Artplayer — pass autoplay:false here because we trigger
      // play explicitly from the Hls.Events.MANIFEST_PARSED handler inside
      // playM3u8, which gives better guarantees that media data is ready.
      art = new Artplayer({
        url: proxiedStreamUrl,
        container: artRef.current,
        poster: poster || "",
        type: "m3u8",
        autoplay: false,
        volume: 1,
        setting: true,
        playbackRate: true,
        pip: true,
        fullscreen: true,
        fullscreenWeb: true,
        screenshot: true,
        miniProgressBar: true,
        hotkey: true,
        fastForward: true,
        mutex: true,
        playsInline: true,
        moreVideoAttr: { crossOrigin: "anonymous", preload: "none" },
        plugins: [
          artplayerPluginHlsControl({
            quality: { setting: true, getName: (l) => l.height + "P", title: "Quality", auto: "Auto" },
          }),
          artplayerPluginSubtitleSelection(subtitles),
          artplayerPluginChapter({ chapters: createChapters() }),
        ],
        icons: {
          play: playIcon,
          pause: pauseIcon,
          setting: settingsIcon,
          volume: volumeIcon,
          pip: pipIcon,
          volumeClose: muteIcon,
          state: playIconLg,
          loading: loadingIcon,
          fullscreenOn: fullScreenOnIcon,
          fullscreenOff: fullScreenOffIcon,
        },
        customType: { m3u8: playM3u8 },
      });

      // Store the instance so that the hardSub useEffect can apply live style
      // changes without destroying and recreating the player.
      artInstanceRef.current = art;

      /* =========================== Ready =========================== */
      art.on("ready", () => {
        // Apply initial hard sub style
        applyHardSubStyle(art, hardSubRef.current);

        // Resume playback
        if (resumeTime) {
          art.once("video:loadedmetadata", () => {
            if (resumeTime < art.duration - 10) art.currentTime = resumeTime;
          });
        }


        // Auto skip intro/outro — check the ref on every tick so that
        // toggling Skip Intro ON/OFF takes effect immediately without
        // destroying and recreating the player.
        const skipRanges = [
          ...(intro?.start != null && intro?.end != null ? [[intro.start, intro.end]] : []),
          ...(outro?.start != null && outro?.end != null ? [[outro.start, outro.end]] : []),
        ];

        art.on("video:timeupdate", () => {
          const ct = art.currentTime;

          // Show / hide skip buttons based on current playback position
          const inIntro =
            intro?.start != null && intro?.end != null &&
            ct >= intro.start && ct < intro.end;
          const inOutro =
            outro?.start != null && outro?.end != null &&
            ct >= outro.start && ct < outro.end;

          if (inIntro !== skipIntroVisibleRef.current) {
            skipIntroVisibleRef.current = inIntro;
            setSkipIntroVisible(inIntro);
          }
          if (inOutro !== skipOutroVisibleRef.current) {
            skipOutroVisibleRef.current = inOutro;
            setSkipOutroVisible(inOutro);
          }

          // Auto skip intro / outro
          if (autoSkipIntroRef.current && skipRanges.length > 0) {
            for (const [start, end] of skipRanges) {
              if (ct >= start && ct < end) {
                art.currentTime = end;
                break;
              }
            }
          }

          // Near-end fallback for auto-next.  Some HLS streams (especially
          // through a proxy) never fire the native "ended" event because the
          // last segment stalls or the MediaSource does not signal EOS.  We
          // trigger auto-next whenever the player is within END_THRESHOLD_SECONDS
          // of the end.
          const dur = art.duration;
          if (
            !nextTriggeredRef.current &&
            autoNextRef.current &&
            dur > MIN_VIDEO_DURATION &&
            ct >= dur - END_THRESHOLD_SECONDS
          ) {
            nextTriggeredRef.current = true;
            const idx = currentEpisodeIndexRef.current;
            const eps = episodesRef.current;
            if (idx >= 0 && idx < eps?.length - 1) {
              playNext(eps[idx + 1].id.match(/ep=(\d+)/)?.[1]);
            }
          }
        });

        // Thumbnails
        if (thumbnail) art.plugins.add(artplayerPluginVttThumbnail({ vtt: `${proxy}${thumbnail}` }));

        // Logo fade
        setTimeout(() => {
          if (art.layers[website_name]) art.layers[website_name].style.opacity = 0;
        }, 2000);

        /* =========================== Save Progress =========================== */
        const saveProgress = async () => {
          const time = Math.floor(art.currentTime);
          const duration = Math.floor(art.duration);
          if (!time || time < 5) return;
          if (time - lastSavedTimeRef.current < 30) return; // save every 30s
          lastSavedTimeRef.current = time;

          // LocalStorage
          let list = JSON.parse(localStorage.getItem("continueWatching")) || [];
          const entry = { id: animeInfo?.id, episodeId, episodeNum, leftAt: time, duration };
          const i = list.findIndex((x) => x.episodeId === episodeId);
          if (i >= 0) list[i] = entry; else list.push(entry);
          localStorage.setItem("continueWatching", JSON.stringify(list));

          // Supabase: upsert one row per anime
          if (user) {
            await supabase.from("continue_watching").upsert(
              {
                user_id: user.id,
                anime_id: animeInfo?.id,
                episode_id: episodeId,
                episode_num: episodeNum,
                left_at: time,
                duration,
                title: animeInfo?.title,
                japanese_title: animeInfo?.japanese_title,
                poster: animeInfo?.poster,
                adult_content: !!animeInfo?.adultContent,
                updated_at: new Date().toISOString(),
              },
              { onConflict: ["user_id", "anime_id"] } // <-- ensures single row per anime
            );
          }
        };

        saveIntervalRef.current = setInterval(saveProgress, 30000);
        art.on("video:pause", saveProgress);
        art.on("video:seeked", saveProgress);

        /* =========================== Video Ended =========================== */
        art.on("video:ended", async () => {
          // Remove localStorage
          let list = JSON.parse(localStorage.getItem("continueWatching")) || [];
          list = list.filter((i) => i.episodeId !== episodeId);
          localStorage.setItem("continueWatching", JSON.stringify(list));

          // Remove from Supabase
          if (user) {
            await supabase
              .from("continue_watching")
              .delete()
              .eq("user_id", user.id)
              .eq("episode_id", episodeId);
          }

          // Auto next episode — guard with nextTriggeredRef so the near-end
          // fallback in video:timeupdate and this handler never both fire.
          const idx = currentEpisodeIndexRef.current;
          const eps = episodesRef.current;
          if (!nextTriggeredRef.current && autoNextRef.current && idx >= 0 && idx < eps?.length - 1) {
            nextTriggeredRef.current = true;
            playNext(eps[idx + 1].id.match(/ep=(\d+)/)?.[1]);
          }
        });
      });
    };

    init();

    // Cleanup
    return () => {
      isCancelled = true;
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      artInstanceRef.current = null;
      if (art?.destroy) art.destroy(false);
      setSkipIntroVisible(false);
      setSkipOutroVisible(false);
      skipIntroVisibleRef.current = false;
      skipOutroVisibleRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamUrl, episodeId, subtitles, intro, outro, animeInfo]);

  const skipBtnClass =
    "absolute bottom-16 right-4 bg-black/75 border border-white/30 text-white px-4 py-2 rounded font-semibold text-sm hover:bg-black/90 transition-colors cursor-pointer z-10";

  return (
    <div className="w-full h-full relative">
      <div ref={artRef} className="w-full h-full" />
      {skipIntroVisible && (
        <button
          className={skipBtnClass}
          onClick={() => {
            if (artInstanceRef.current && intro?.end != null) {
              artInstanceRef.current.currentTime = intro.end;
            }
          }}
        >
          ⏭ Skip Intro
        </button>
      )}
      {skipOutroVisible && (
        <button
          className={skipBtnClass}
          onClick={() => {
            if (artInstanceRef.current && outro?.end != null) {
              artInstanceRef.current.currentTime = outro.end;
            }
          }}
        >
          ⏭ Skip Outro
        </button>
      )}
    </div>
  );
}
