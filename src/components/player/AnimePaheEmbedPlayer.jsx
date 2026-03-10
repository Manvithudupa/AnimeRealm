/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import BouncingLoader from "../ui/bouncingloader/Bouncingloader";

export default function AnimePaheEmbedPlayer({
  m3u8ProxyUrl,
  streamUrl,
  episodeId,
  episodes,
  playNext,
  autoNext,
  animeInfo,
  episodeNum,
}) {
  const [loading, setLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(
    episodes?.findIndex((ep) => ep.id.match(/ep=(\d+)/)?.[1] === episodeId)
  );

  // Refs so the message-event handler always sees the latest values
  const autoNextRef = useRef(autoNext);
  const currentEpisodeIndexRef = useRef(currentEpisodeIndex);
  const episodesRef = useRef(episodes);

  useEffect(() => { autoNextRef.current = autoNext; }, [autoNext]);
  useEffect(() => { currentEpisodeIndexRef.current = currentEpisodeIndex; }, [currentEpisodeIndex]);
  useEffect(() => { episodesRef.current = episodes; }, [episodes]);

  // Build the iframe URL from the m3u8ProxyUrl.
  // Guard against null/undefined streamUrl to prevent proxy calls with "null".
  const iframeSrc =
    m3u8ProxyUrl && streamUrl ? `${m3u8ProxyUrl}${encodeURIComponent(streamUrl)}` : "";

  useEffect(() => {
    if (episodes?.length > 0) {
      const newIndex = episodes.findIndex(
        (episode) => episode.id.match(/ep=(\d+)/)?.[1] === episodeId
      );
      setCurrentEpisodeIndex(newIndex);
    }
  }, [episodeId, episodes]);

  useEffect(() => {
    const handleMessage = (event) => {
      const { currentTime, duration } = event.data;
      if (typeof currentTime === "number" && typeof duration === "number") {
        const idx = currentEpisodeIndexRef.current;
        const eps = episodesRef.current;
        if (
          currentTime >= duration &&
          autoNextRef.current &&
          idx >= 0 &&
          idx < eps?.length - 1
        ) {
          playNext(eps[idx + 1].id.match(/ep=(\d+)/)?.[1]);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [playNext]);

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
  }, [episodeId]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Loader Overlay */}
      <div
        className={`absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 z-10 transition-opacity duration-500 ${
          loading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <BouncingLoader />
      </div>

      <iframe
        key={`${episodeId}-animepahe-${iframeSrc}`}
        src={iframeSrc}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        className={`w-full h-full transition-opacity duration-500 ${
          iframeLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => {
          setIframeLoaded(true);
          setTimeout(() => setLoading(false), 500);
        }}
        onError={() => {
          console.error("Failed to load AnimePahe embed");
          setLoading(false);
        }}
      ></iframe>
    </div>
  );
}
