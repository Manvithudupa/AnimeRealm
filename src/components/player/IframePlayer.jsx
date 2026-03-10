/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import BouncingLoader from "../ui/bouncingloader/Bouncingloader";

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

  const [loading, setLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(
    episodes?.findIndex(
      (episode) => episode.id.match(/ep=(\d+)/)?.[1] === episodeId
    )
  );

  const iframeRef = useRef(null);
  // Guard against sending multiple seek commands for the same skip range
  const skipSentRef = useRef(false);

  // Refs so the message-event handler always sees the latest values
  // without needing to be torn-down and re-registered on every change.
  const autoNextRef = useRef(autoNext);
  const autoSkipIntroRef = useRef(autoSkipIntro);
  const introRef = useRef(intro);
  const outroRef = useRef(outro);
  const currentEpisodeIndexRef = useRef(currentEpisodeIndex);
  const episodesRef = useRef(episodes);

  useEffect(() => { autoNextRef.current = autoNext; }, [autoNext]);
  useEffect(() => { autoSkipIntroRef.current = autoSkipIntro; }, [autoSkipIntro]);
  useEffect(() => { introRef.current = intro; }, [intro]);
  useEffect(() => { outroRef.current = outro; }, [outro]);
  useEffect(() => { currentEpisodeIndexRef.current = currentEpisodeIndex; }, [currentEpisodeIndex]);
  useEffect(() => { episodesRef.current = episodes; }, [episodes]);

  useEffect(() => {
    const loadIframeUrl = async () => {
      setLoading(true);
      setIframeLoaded(false);
      setIframeSrc("");

      setIframeSrc(`${baseURL}/${episodeId}/${servertype}`);
    };

    loadIframeUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeId, servertype, serverName, animeInfo]);

  useEffect(() => {
    if (episodes?.length > 0) {
      const newIndex = episodes.findIndex(
        (episode) => episode.id.match(/ep=(\d+)/)?.[1] === episodeId
      );
      setCurrentEpisodeIndex(newIndex);
    }
  }, [episodeId, episodes]);

  // Reset skip-intro button and sent guard when episode changes
  useEffect(() => {
    setShowSkipIntro(false);
    skipSentRef.current = false;
  }, [episodeId]);

  useEffect(() => {
    const handleMessage = (event) => {
      const { currentTime, duration } = event.data;
      if (typeof currentTime === "number" && typeof duration === "number") {
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

        // Show/hide the Skip Intro overlay button
        setShowSkipIntro(inIntroRange || inOutroRange);

        // Auto-skip: send a seek postMessage to the embedded player.
        // Use skipSentRef to avoid sending the seek command on every
        // timeupdate tick while inside the same skip range.
        if (autoSkipIntroRef.current && iframeRef.current?.contentWindow) {
          if (inIntroRange || inOutroRange) {
            if (!skipSentRef.current) {
              skipSentRef.current = true;
              const target = inIntroRange ? intr.end : outr.end;
              iframeRef.current.contentWindow.postMessage(
                { type: "seek", time: target },
                "*"
              );
            }
          } else {
            // Reset guard once we leave the skip range
            skipSentRef.current = false;
          }
        } else if (!inIntroRange && !inOutroRange) {
          skipSentRef.current = false;
        }

        // Auto-next episode when video ends
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
  }, [episodeId, servertype]);

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
          onClick={() => {
            const intr = introRef.current;
            const outr = outroRef.current;
            const target = intr?.end ?? outr?.end;
            if (target != null && iframeRef.current?.contentWindow) {
              iframeRef.current.contentWindow.postMessage(
                { type: "seek", time: target },
                "*"
              );
            }
          }}
        >
          Skip Intro
        </button>
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
          // Notify embedded player of autoplay preference
          if (autoPlay && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({ type: "autoplay" }, "*");
          }
        }}
      ></iframe>
    </div>
  );
} 
