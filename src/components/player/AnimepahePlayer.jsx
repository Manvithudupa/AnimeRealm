/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function AnimePahePlayer({ streamUrl, m3u8ProxyUrl, autoPlay }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const loadedUrlRef = useRef(null); // Track what URL we've already loaded

  useEffect(() => {
    if (!streamUrl || !videoRef.current) {
      console.log("❌ Missing streamUrl or videoRef");
      return;
    }

    const video = videoRef.current;

    // Construct final URL
    const finalUrl = m3u8ProxyUrl 
      ? m3u8ProxyUrl + encodeURIComponent(streamUrl)
      : streamUrl;

    // Prevent reloading the same URL
    if (loadedUrlRef.current === finalUrl && hlsRef.current) {
      console.log("⏭️ URL already loaded, skipping...");
      return;
    }

    console.log("🔍 Original Stream URL:", streamUrl);
    console.log("📡 Final URL:", finalUrl);

    // Destroy previous HLS instance
    if (hlsRef.current) {
      console.log("🧹 Destroying previous HLS instance");
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    loadedUrlRef.current = finalUrl; // Mark this URL as loaded

    if (Hls.isSupported()) {
      console.log("✅ HLS.js is supported");
      
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        debug: false, // Turn off debug to reduce console spam
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        },
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error("❌ Fatal HLS Error:", data.type, data.details);
          
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
              hlsRef.current = null;
              loadedUrlRef.current = null; // Allow retry on next render
              break;
          }
        }
      });

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log("✅ Manifest parsed, levels:", data.levels.length);
        if (autoPlay) {
          video.play()
            .then(() => console.log("▶️ Playing"))
            .catch((err) => console.log("⚠️ Autoplay blocked:", err.message));
        }
      });

      hls.loadSource(finalUrl);
      hls.attachMedia(video);
      hlsRef.current = hls;

    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      console.log("✅ Using native HLS (Safari)");
      video.src = finalUrl;
      
      const handleMetadata = () => {
        console.log("✅ Metadata loaded");
        if (autoPlay) {
          video.play()
            .then(() => console.log("▶️ Playing"))
            .catch((err) => console.log("⚠️ Autoplay blocked:", err.message));
        }
      };

      const handleError = (e) => {
        console.error("❌ Video error:", video.error?.code, video.error?.message);
        loadedUrlRef.current = null; // Allow retry
      };

      video.addEventListener('loadedmetadata', handleMetadata);
      video.addEventListener('error', handleError);

      // Cleanup listeners
      return () => {
        video.removeEventListener('loadedmetadata', handleMetadata);
        video.removeEventListener('error', handleError);
      };
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
  }, [streamUrl, m3u8ProxyUrl, autoPlay]);

  return (
    <div className="absolute inset-0 w-full h-full bg-black">
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
