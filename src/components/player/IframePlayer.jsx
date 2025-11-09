/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import Artplayer from "artplayer";
import autoSkip from "../plugins/autoSkip";
import BouncingLoader from "../ui/bouncingloader/Bouncingloader";

export default function ArtplayerPlayer({
  videoUrl,
  episodeId,
  episodeNum,
  animeInfo,
  episodes,
  playNext,
  autoNext,
}) {
  const artRef = useRef(null);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(
    episodes?.findIndex(
      (ep) => ep.id.match(/ep=(\d+)/)?.[1] === episodeId
    )
  );

  useEffect(() => {
    setCurrentEpisodeIndex(
      episodes?.findIndex(
        (ep) => ep.id.match(/ep=(\d+)/)?.[1] === episodeId
      )
    );
  }, [episodeId, episodes]);

  useEffect(() => {
    setLoading(true);
    const art = new Artplayer({
      container: containerRef.current,
      url: videoUrl,
      autoplay: true,
      autoSize: true,
      autoMini: true,
      setting: true,
      playbackRate: true,
      fullscreen: true,
      pip: true,
      plugins: [
        autoSkip([
          [0, 85], // Skip intro
          [1250, 1300], // Skip outro
        ]),
      ],
    });

    art.on("ready", () => setLoading(false));

    // Auto next
    art.on("video:ended", () => {
      if (autoNext && currentEpisodeIndex < episodes.length - 1) {
        const nextEpId = episodes[currentEpisodeIndex + 1].id.match(/ep=(\d+)/)?.[1];
        playNext(nextEpId);
      }
    });

    artRef.current = art;
    return () => {
      // Save continue watching
      const continueWatching =
        JSON.parse(localStorage.getItem("continueWatching")) || [];
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
      if (newEntry.data_id) {
        const index = continueWatching.findIndex(
          (i) => i.data_id === newEntry.data_id
        );
        if (index !== -1) continueWatching[index] = newEntry;
        else continueWatching.push(newEntry);
        localStorage.setItem(
          "continueWatching",
          JSON.stringify(continueWatching)
        );
      }

      art.destroy(false);
    };
  }, [videoUrl, episodeId]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Loader */}
      <div
        className={`absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 z-10 transition-opacity duration-500 ${
          loading
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <BouncingLoader />
      </div>

      <div
        ref={containerRef}
        className="w-full h-full bg-black"
      ></div>
    </div>
  );
}
