/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function AnimePahePlayer({ streamUrl, autoPlay }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    console.log("🔍 Stream URL:", streamUrl);
    
    if (!streamUrl || !videoRef.current) {
      console.log("❌ Missing streamUrl or videoRef");
      return;
    }

    const video = videoRef.current;

    // Destroy previous HLS instance
    if (hlsRef.current) {
      console.log("🧹 Destroying previous HLS instance");
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      console.log("✅ HLS.js is supported");
      
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        debug: true, // Enable debug logging
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        },
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("❌ HLS Error:", data);
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("🔄 Network error, trying to recover...");
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.log("🔄 Media error, trying to recover...");
              hls.recoverMediaError();
              break;
            default:
              console.log("💀 Fatal error, destroying HLS");
              hls.destroy();
              break;
          }
        }
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log("✅ Manifest parsed, levels:", data.levels);
        if (autoPlay) {
          video.play()
            .then(() => console.log("▶️ Autoplay started"))
            .catch((err) => console.log("⚠️ Autoplay prevented:", err));
        }
      });

      hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
        console.log("✅ Level loaded:", data.level);
      });

      console.log("📡 Loading source:", streamUrl);
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      console.log("✅ Using native HLS (Safari)");
      video.src = streamUrl;
      
      video.addEventListener('loadedmetadata', () => {
        console.log("✅ Metadata loaded");
        if (autoPlay) {
          video.play()
            .then(() => console.log("▶️ Autoplay started"))
            .catch((err) => console.log("⚠️ Autoplay prevented:", err));
        }
      });

      video.addEventListener('error', (e) => {
        console.error("❌ Video error:", e, video.error);
      });
    } else {
      console.error("❌ HLS not supported");
    }

    return () => {
      if (hlsRef.current) {
        console.log("🧹 Cleanup: destroying HLS");
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, autoPlay]);

  return (
    <div className="relative w-full h-full bg-black">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        playsInline
        style={{ display: "block" }}
      />
    </div>
  );
}
