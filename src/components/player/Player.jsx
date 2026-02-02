/* eslint-disable react/prop-types */
import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import Artplayer from "artplayer";
import artplayerPluginChapter from "./artPlayerPluinChaper";
import autoSkip from "./autoSkip";
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
import artplayerPluginUploadSubtitle from "./artplayerPluginUploadSubtitle";
import { supabase } from "@/src/integrations/supabase/client";

Artplayer.LOG_VERSION = false;
Artplayer.CONTEXTMENU = false;

export default function Player({
  streamUrl,
  subtitles,
  thumbnail,
  intro,
  outro,
  autoSkipIntro,
  autoPlay,
  autoNext,
  episodeId,
  episodes,
  playNext,
  animeInfo,
  episodeNum,
  streamInfo,
}) {
  const artRef = useRef(null);
  const saveIntervalRef = useRef(null);

  const proxy = import.meta.env.VITE_PROXY_URL;
  const m3u8proxy = import.meta.env.VITE_M3U8_PROXY_URL?.split(",") || [];

  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(
    episodes?.findIndex((ep) => ep.id.match(/ep=(\d+)/)?.[1] === episodeId)
  );

  /* ===========================
     Episode Sync
  =========================== */
  useEffect(() => {
    if (!episodes?.length) return;

    const index = episodes.findIndex(
      (ep) => ep.id.match(/ep=(\d+)/)?.[1] === episodeId
    );

    setCurrentEpisodeIndex(index);
  }, [episodeId, episodes]);

  /* ===========================
     Chapter Styles
  =========================== */
  useEffect(() => {
    if (!streamUrl) return;

    const style = document.createElement("style");
    style.dataset.chapterStyles = "true";
    style.textContent = getChapterStyles(intro, outro);

    document.head.appendChild(style);

    return () => style.remove();
  }, [streamUrl, intro, outro]);

  /* ===========================
     HLS
  =========================== */
  const playM3u8 = (video, url, art) => {
    if (Hls.isSupported()) {
      if (art.hls) art.hls.destroy();

      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      art.hls = hls;

      art.on("destroy", () => hls.destroy());
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    }
  };

  /* ===========================
     Chapters
  =========================== */
  const createChapters = () => {
    const chapters = [];

    if (intro?.start || intro?.end) {
      chapters.push({
        start: intro.start,
        end: intro.end,
        title: "Intro",
      });
    }

    if (outro?.start || outro?.end) {
      chapters.push({
        start: outro.start,
        end: outro.end,
        title: "Outro",
      });
    }

    return chapters;
  };

  /* ===========================
     Main Player
  =========================== */
  useEffect(() => {
    if (!streamUrl || !artRef.current) return;

    let art;

    const init = async () => {
      /* ---------- Get User ---------- */
      const {
        data: { user },
      } = await supabase.auth.getUser();

      /* ---------- Load Resume Time ---------- */
      let resumeTime = 0;

      if (user) {
        const { data } = await supabase
          .from("continue_watching")
          .select("left_at")
          .eq("user_id", user.id)
          .eq("episode_id", episodeId)
          .single();

        if (data?.left_at) resumeTime = data.left_at;
      }

      // fallback
      if (!resumeTime) {
        const local =
          JSON.parse(localStorage.getItem("continueWatching")) || [];

        const saved = local.find((i) => i.episodeId === episodeId);

        if (saved?.leftAt) resumeTime = saved.leftAt;
      }

      /* ---------- Headers ---------- */
      const iframeUrl = streamInfo?.streamingLink?.iframe;
      const headers = {};

      if (iframeUrl) {
        headers.referer = new URL(iframeUrl).origin + "/";
      }

      /* ---------- Init Player ---------- */
      art = new Artplayer({
        url:
          m3u8proxy[Math.floor(Math.random() * m3u8proxy.length)] +
          encodeURIComponent(streamUrl) +
          "&headers=" +
          encodeURIComponent(JSON.stringify(headers)),

        container: artRef.current,
        type: "m3u8",
        autoplay: autoPlay,
        volume: 1,

        setting: true,
        playbackRate: true,
        pip: true,
        fullscreen: true,
        mutex: true,
        playsInline: true,

        moreVideoAttr: {
          crossOrigin: "anonymous",
          preload: "none",
        },

        plugins: [
          artplayerPluginHlsControl({
            quality: {
              setting: true,
              getName: (l) => l.height + "P",
              title: "Quality",
              auto: "Auto",
            },
          }),

          artplayerPluginUploadSubtitle(),

          artplayerPluginChapter({
            chapters: createChapters(),
          }),
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

        customType: {
          m3u8: playM3u8,
        },
      });

      /* ===========================
         Ready
      =========================== */
      art.on("ready", () => {
        /* Resume */
        if (resumeTime) {
          art.once("video:loadedmetadata", () => {
            if (resumeTime < art.duration - 10) {
              art.currentTime = resumeTime;
            }
          });
        }

        /* Default Subtitle */
        const def = subtitles?.find(
          (s) => s.label.toLowerCase() === "english"
        );

        if (def) {
          art.subtitle.switch(def.file, {
            name: def.label,
            default: true,
          });
        }

        /* Auto Skip */
        const skipRanges = [
          ...(intro?.start != null && intro?.end != null
            ? [[intro.start + 1, intro.end - 1]]
            : []),

          ...(outro?.start != null && outro?.end != null
            ? [[outro.start + 1, outro.end]]
            : []),
        ];

        autoSkipIntro && art.plugins.add(autoSkip(skipRanges));

        /* Thumbnails */
        if (thumbnail) {
          art.plugins.add(
            artplayerPluginVttThumbnail({
              vtt: `${proxy}${thumbnail}`,
            })
          );
        }

        /* Logo */
        setTimeout(() => {
          if (art.layers[website_name]) {
            art.layers[website_name].style.opacity = 0;
          }
        }, 2000);

        /* ===========================
           Save Progress
        =========================== */
        const saveProgress = async () => {
          const time = Math.floor(art.currentTime);
          const duration = Math.floor(art.duration);

          if (!time || time < 5) return;

          /* ---------- Local Backup ---------- */
          let list =
            JSON.parse(localStorage.getItem("continueWatching")) || [];

          const entry = {
            id: animeInfo?.id,
            episodeId,
            episodeNum,
            leftAt: time,
            duration,
          };

          const i = list.findIndex((x) => x.episodeId === episodeId);

          if (i >= 0) list[i] = entry;
          else list.push(entry);

          localStorage.setItem("continueWatching", JSON.stringify(list));

          /* ---------- Supabase Sync ---------- */
          if (!user) return;

          // Check if the anime already exists for this user
          const { data: existing } = await supabase
            .from("continue_watching")
            .select("*")
            .eq("user_id", user.id)
            .eq("anime_id", animeInfo?.id)
            .single();

          if (existing) {
            // Update existing row
            await supabase
              .from("continue_watching")
              .update({
                episode_id: episodeId,
                episode_num: episodeNum,
                left_at: time,
                duration,
                title: animeInfo?.title,
                japanese_title: animeInfo?.japanese_title,
                poster: animeInfo?.poster,
                adult_content: !!animeInfo?.adultContent,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existing.id);
          } else {
            // Insert new row
            await supabase.from("continue_watching").insert({
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
            });
          }
        };

        saveIntervalRef.current = setInterval(saveProgress, 5000);

        /* ===========================
           Ended
        =========================== */
        art.on("video:ended", async () => {
          /* Remove Local */
          let list =
            JSON.parse(localStorage.getItem("continueWatching")) || [];

          list = list.filter((i) => i.episodeId !== episodeId);

          localStorage.setItem(
            "continueWatching",
            JSON.stringify(list)
          );

          /* Remove DB */
          if (user) {
            await supabase
              .from("continue_watching")
              .delete()
              .eq("user_id", user.id)
              .eq("episode_id", episodeId);
          }

          /* Auto Next */
          if (
            currentEpisodeIndex < episodes?.length - 1 &&
            autoNext
          ) {
            playNext(
              episodes[currentEpisodeIndex + 1].id.match(
                /ep=(\d+)/
              )?.[1]
            );
          }
        });
      });
    };

    init();

    /* Cleanup */
    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
      if (art?.destroy) art.destroy(false);
    };
  }, [
    streamUrl,
    episodeId,
    subtitles,
    intro,
    outro,
    autoPlay,
    autoNext,
    episodes,
    animeInfo,
  ]);

  return <div ref={artRef} className="w-full h-full" />;
}
