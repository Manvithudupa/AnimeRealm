/* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from "react";
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
}) {
  const baseURL =
    serverName.toLowerCase() === "hd-1"
      ? import.meta.env.VITE_BASE_IFRAME_URL
      : serverName.toLowerCase() === "hd-4"
      ? import.meta.env.VITE_BASE_IFRAME_URL_2
      : undefined; 

  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(
    episodes?.findIndex(
      (episode) => episode.id.match(/ep=(\d+)/)?.[1] === episodeId
    )
  );

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

  useEffect(() => {
    const handleMessage = (event) => {
      const { currentTime, duration } = event.data;
      if (typeof currentTime === "number" && typeof duration === "number") {
        if (
          currentTime >= duration &&
          currentEpisodeIndex < episodes?.length - 1 &&
          autoNext
        ) {
          playNext(episodes[currentEpisodeIndex + 1].id.match(/ep=(\d+)/)?.[1]);
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [autoNext, currentEpisodeIndex, episodes, playNext]);

  // Inject CSS to make video fill iframe (after load)
  useEffect(() => {
    if (!iframeRef.current || !iframeLoaded) return;

    const tryInjectStyles = () => {
      try {
        const iframeDoc = iframeRef.current.contentDocument || 
                          iframeRef.current.contentWindow?.document;
        
        if (!iframeDoc) return;

        // Create style element if it doesn't exist
        let styleEl = iframeDoc.getElementById('video-fill-styles');
        if (!styleEl) {
          styleEl = iframeDoc.createElement('style');
          styleEl.id = 'video-fill-styles';
          styleEl.textContent = `
            * {
              margin: 0 !important;
              padding: 0 !important;
              box-sizing: border-box !important;
            }
            html, body {
              width: 100% !important;
              height: 100% !important;
              overflow: hidden !important;
              background: #000 !important;
            }
            video {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: 100% !important;
              object-fit: contain !important;
            }
          `;
          iframeDoc.head?.appendChild(styleEl);
        }
      } catch (e) {
        // CORS prevents access - this is expected for cross-origin iframes
        console.log('Cannot inject styles (CORS protected)');
      }
    };

    // Try immediately and after a delay
    tryInjectStyles();
    const timer = setTimeout(tryInjectStyles, 500);

    return () => clearTimeout(timer);
  }, [iframeLoaded]);

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
    <div className="absolute inset-0 w-full h-full bg-black">
      {/* Loader Overlay */}
      <div
        className={`absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 z-10 transition-opacity duration-500 ${
          loading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <BouncingLoader />
      </div>

      <iframe
        ref={iframeRef}
        key={`${episodeId}-${servertype}-${serverName}-${iframeSrc}`}
        src={iframeSrc}
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-500 ${
          iframeLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          border: "none",
          margin: 0,
          padding: 0,
        }}
        onLoad={() => {
          setIframeLoaded(true);
          setTimeout(() => setLoading(false), 1000);
        }}
      />
    </div>
  );
}
