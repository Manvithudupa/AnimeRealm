/* eslint-disable react/prop-types */
import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
import Artplayer from "artplayer";
import artplayerPluginChapter from "./artPlayerPluinChaper";
import autoSkip from "./autoSkip";
import artplayerPluginVttThumbnail from "./artPlayerPluginVttThumbnail";
import {
  backward10Icon,
  backwardIcon,
  captionIcon,
  forward10Icon,
  forwardIcon,
  fullScreenOffIcon,
  fullScreenOnIcon,
  loadingIcon,
  logo,
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
  const leftAtRef = useRef(0);
  const saveIntervalRef = useRef(null);

  const proxy = import.meta.env.VITE_PROXY_URL;
  const m3u8proxy = import.meta.env.VITE_M3U8_PROXY_URL?.split(",") || [];

  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(
    episodes?.findIndex(
      (episode) => episode.id.match(/ep=(\d+)/)?.[1] === episodeId
    )
  );

  /* ===========================
     Episode Index Sync
  =========================== */
  useEffect(() => {
    if (episodes?.length > 0) {
      const newIndex = episodes.findIndex(
        (episode) => episode.id.match(/ep=(\d+)/)?.[1] === episodeId
      );
      setCurrentEpisodeIndex(newIndex);
    }
  }, [episodeId, episodes]);

  /* ===========================
     Chapter Styles
  =========================== */
  useEffect(() => {
    const applyChapterStyles = () => {
      const existingStyles = document.querySelectorAll(
        "style[data-chapter-styles]"
      );
      existingStyles.forEach((style) => style.remove());

      const styleElement = document.createElement("style");
      styleElement.setAttribute("data-chapter-styles", "true");

      const styles = getChapterStyles(intro, outro);
      styleElement.textContent = styles;

      document.head.appendChild(styleElement);

      return () => styleElement.remove();
    };

    if (streamUrl || intro || outro) {
      const cleanup = applyChapterStyles();
      return cleanup;
    }
  }, [streamUrl, intro, outro]);

  /* ===========================
     HLS Handler
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

    if (intro?.start !== 0 || intro?.end !== 0) {
      chapters.push({ start: intro.start, end: intro.end, title: "Intro" });
    }

    if (outro?.start !== 0 || outro?.end !== 0) {
      chapters.push({ start: outro.start, end: outro.end, title: "Outro" });
    }

    return chapters;
  };

  /* ===========================
     Main Player
  =========================== */
  useEffect(() => {
    if (!streamUrl || !artRef.current) return;

    const iframeUrl = streamInfo?.streamingLink?.iframe;
    const headers = {};

    if (iframeUrl) {
      headers.referer = new URL(iframeUrl).origin + "/";
    }

    const art = new Artplayer({
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
        playsInline: true,
      },

      plugins: [
        artplayerPluginHlsControl({
          quality: {
            setting: true,
            getName: (level) => level.height + "P",
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
       When Ready
    =========================== */
    art.on("ready", () => {
      /* ---------- Restore Progress ---------- */
      const list =
        JSON.parse(localStorage.getItem("continueWatching")) || [];

      const saved = list.find(
        (item) => item.episodeId === episodeId
      );

      if (saved?.leftAt) {
        const resumeTime = saved.leftAt;

        art.once("video:loadedmetadata", () => {
          if (resumeTime < art.duration - 10) {
            art.currentTime = resumeTime;
          }
        });
      }

      /* ---------- Track Current Time ---------- */
      art.on("video:timeupdate", () => {
        leftAtRef.current = Math.floor(art.currentTime);
      });

      /* ---------- Auto Save Every 5s ---------- */
      const saveProgress = () => {
        const currentTime = Math.floor(art.currentTime);
        const duration = Math.floor(art.duration);

        if (!currentTime || currentTime < 5) return;

        let list =
          JSON.parse(localStorage.getItem("continueWatching")) || [];

        const entry = {
          id: animeInfo?.id,
          data_id: animeInfo?.data_id,
          episodeId,
          episodeNum,
          adultContent: animeInfo?.adultContent,
          poster: animeInfo?.poster,
          title: animeInfo?.title,
          japanese_title: animeInfo?.japanese_title,

          leftAt: currentTime,
          duration,
          updatedAt: Date.now(),
        };

        const index = list.findIndex(
          (item) => item.episodeId === episodeId
        );

        if (index !== -1) {
          list[index] = entry;
        } else {
          list.push(entry);
        }

        localStorage.setItem(
          "continueWatching",
          JSON.stringify(list)
        );
      };

      saveIntervalRef.current = setInterval(saveProgress, 5000);

      /* ---------- Auto Remove On Finish ---------- */
      art.on("video:ended", () => {
        let list =
          JSON.parse(localStorage.getItem("continueWatching")) || [];

        list = list.filter(
          (item) => item.episodeId !== episodeId
        );

        localStorage.setItem(
          "continueWatching",
          JSON.stringify(list)
        );

        if (currentEpisodeIndex < episodes?.length - 1 && autoNext) {
          playNext(
            episodes[currentEpisodeIndex + 1].id.match(/ep=(\d+)/)?.[1]
          );
        }
      });

      /* ---------- Default Subtitle ---------- */
      const defaultSubtitle = subtitles?.find(
        (sub) => sub.label.toLowerCase() === "english"
      );

      if (defaultSubtitle) {
        art.subtitle.switch(defaultSubtitle.file, {
          name: defaultSubtitle.label,
          default: true,
        });
      }

      /* ---------- Auto Skip ---------- */
      const skipRanges = [
        ...(intro?.start != null && intro?.end != null
          ? [[intro.start + 1, intro.end - 1]]
          : []),

        ...(outro?.start != null && outro?.end != null
          ? [[outro.start + 1, outro.end]]
          : []),
      ];

      autoSkipIntro && art.plugins.add(autoSkip(skipRanges));

      /* ---------- Thumbnails ---------- */
      if (thumbnail) {
        art.plugins.add(
          artplayerPluginVttThumbnail({
            vtt: `${proxy}${thumbnail}`,
          })
        );
      }

      /* ---------- Logo Fade ---------- */
      setTimeout(() => {
        if (art.layers[website_name]) {
          art.layers[website_name].style.opacity = 0;
        }
      }, 2000);
    });

    /* ===========================
       Cleanup
    =========================== */
    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }

      if (art && art.destroy) {
        art.destroy(false);
      }
    };
  }, [
    streamUrl,
    subtitles,
    intro,
    outro,
    episodeId,
    animeInfo,
    autoNext,
    autoPlay,
    episodes,
  ]);

  return <div ref={artRef} className="w-full h-full"></div>;
}
