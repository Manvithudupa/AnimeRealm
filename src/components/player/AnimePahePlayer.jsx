/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import Hls from "hls.js";

/**
 * Minimal HLS player for AnimePahe M3U8 sources.
 * Uses native <video> + HLS.js so it's completely separate from Artplayer.
 */
export default function AnimePahePlayer({ streamUrl, autoPlay }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    if (!streamUrl || !videoRef.current) return;

    const video = videoRef.current;

    // Destroy previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        },
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) video.play().catch(() => {});
      });
      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS
      video.src = streamUrl;
      if (autoPlay) video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, autoPlay]);

  return (
    <video
      ref={videoRef}
      className="w-full h-full bg-black"
      controls
      playsInline
      style={{ display: "block" }}
    />
  );
}
