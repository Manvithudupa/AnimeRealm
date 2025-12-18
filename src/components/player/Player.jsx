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
import { supabase } from "@/src/lib/supabase";

Artplayer.LOG_VERSION = false;
Artplayer.CONTEXTMENU = false;

const KEY_CODES = {
  M: "m",
  I: "i",
  F: "f",
  V: "v",
  SPACE: " ",
  ARROW_UP: "arrowup",
  ARROW_DOWN: "arrowdown",
  ARROW_RIGHT: "arrowright",
  ARROW_LEFT: "arrowleft",
};

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
  const proxy = import.meta.env.VITE_PROXY_URL;

  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(
    episodes?.findIndex(
      (ep) => ep.id.match(/ep=(\d+)/)?.[1] === episodeId
    )
  );

  useEffect(() => {
    if (episodes?.length) {
      setCurrentEpisodeIndex(
        episodes.findIndex(
          (ep) => ep.id.match(/ep=(\d+)/)?.[1] === episodeId
        )
      );
    }
  }, [episodeId, episodes]);

  /* -------------------- HD-2 SUPABASE PROXY -------------------- */
  const getHD2Url = async (url) => {
    try {
      const iframe = streamInfo?.streamingLink?.iframe;
      const headers = {
        referer: iframe ? new URL(iframe).origin + "/" : undefined,
      };

      const { data, error } = await supabase.functions.invoke("M3U8-Proxy", {
        body: { url, headers },
      });

      if (error) throw error;
      return data?.url || url;
    } catch (e) {
      console.error("HD-2 Proxy failed:", e);
      return url;
    }
  };
  /* ------------------------------------------------------------- */

  useEffect(() => {
    const applyStyles = () => {
      document
        .querySelectorAll("style[data-chapter-styles]")
        .forEach((s) => s.remove());
      const style = document.createElement("style");
      style.setAttribute("data-chapter-styles", "true");
      style.textContent = getChapterStyles(intro, outro);
      document.head.appendChild(style);
      return () => style.remove();
    };
    if (streamUrl) return applyStyles();
  }, [streamUrl, intro, outro]);

  const playM3u8 = (video, url, art) => {
    if (Hls.isSupported()) {
      art.hls?.destroy();
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      art.hls = hls;
      art.on("destroy", () => hls.destroy());
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    }
  };

  const createChapters = () => {
    const arr = [];
    if (intro?.end) arr.push({ start: intro.start, end: intro.end, title: "intro" });
    if (outro?.end) arr.push({ start: outro.start, end: outro.end, title: "outro" });
    return arr;
  };

  const handleKeydown = (e, art) => {
    if (["input", "textarea"].includes(e.target.tagName.toLowerCase())) return;
    const k = e.key.toLowerCase();
    if (k === " ") return art.playing ? art.pause() : art.play();
    if (k === "f") art.fullscreen = !art.fullscreen;
    if (k === "m") art.muted = !art.muted;
    if (k === "v") art.subtitle.show = !art.subtitle.show;
    if (k === "arrowright") art.currentTime += 10;
    if (k === "arrowleft") art.currentTime -= 10;
  };

  useEffect(() => {
    if (!streamUrl || !artRef.current) return;
    let art;
    let destroyed = false;

    (async () => {
      let finalUrl = streamUrl;

      if (streamInfo?.serverName?.toLowerCase() === "hd-2") {
        finalUrl = await getHD2Url(streamUrl);
      }

      if (destroyed) return;

      art = new Artplayer({
        url: finalUrl,
        container: artRef.current,
        type: "m3u8",
        autoplay: autoPlay,
        customType: { m3u8: playM3u8 },
        plugins: [
          artplayerPluginHlsControl({
            quality: {
              setting: true,
              getName: (l) => l.height + "P",
              auto: "Auto",
            },
          }),
          artplayerPluginUploadSubtitle(),
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
      });

      art.on("ready", () => {
        const saved =
          JSON.parse(localStorage.getItem("continueWatching"))?.find(
            (i) => i.episodeId === episodeId
          );
        if (saved?.leftAt) art.currentTime = saved.leftAt;

        art.on("video:timeupdate", () => {
          leftAtRef.current = Math.floor(art.currentTime);
        });

        document.addEventListener("keydown", (e) => handleKeydown(e, art));

        if (thumbnail) {
          art.plugins.add(
            artplayerPluginVttThumbnail({ vtt: `${proxy}${thumbnail}` })
          );
        }
      });
    })();

    return () => {
      destroyed = true;
      if (art) art.destroy(false);

      const list = JSON.parse(localStorage.getItem("continueWatching")) || [];
      const entry = {
        data_id: animeInfo?.data_id,
        episodeId,
        episodeNum,
        leftAt: leftAtRef.current,
        poster: animeInfo?.poster,
        title: animeInfo?.title,
      };
      if (entry.data_id) {
        const i = list.findIndex((x) => x.data_id === entry.data_id);
        i > -1 ? (list[i] = entry) : list.push(entry);
        localStorage.setItem("continueWatching", JSON.stringify(list));
      }
    };
  }, [streamUrl]);

  return <div ref={artRef} className="w-full h-full" />;
}
