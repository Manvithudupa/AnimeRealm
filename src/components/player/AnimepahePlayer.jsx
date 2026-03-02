/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";
import Hls from "hls.js";

export default function AnimePahePlayer({ streamUrl, m3u8ProxyUrl, autoPlay }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    if (!streamUrl || !videoRef.current) {
      console.log("❌ Missing streamUrl or videoRef");
      return;
    }

    const video = videoRef.current;

    // Construct final URL (with proxy if provided)
    let finalUrl;
    
    if (m3u8ProxyUrl) {
      // Check if proxy URL already has query params
      const separator = m3u8ProxyUrl.includes('?') ? '&' : '?';
      
      // Try different proxy formats
      if (m3u8ProxyUrl.endsWith('/')) {
        // Format: https://proxy.com/ + encoded_url
        finalUrl = m3u8ProxyUrl + encodeURIComponent(streamUrl);
      } else if (m3u8ProxyUrl.includes('?url=') || m3u8ProxyUrl.includes('&url=')) {
        // Format: https://proxy.com?url= + encoded_url
        finalUrl = m3u8ProxyUrl + encodeURIComponent(streamUrl);
      } else {
        // Default: append with separator
        finalUrl = `${m3u8ProxyUrl}${separator}url=${encodeURIComponent(streamUrl)}`;
      }
    } else {
      // No proxy, use direct URL
      finalUrl = streamUrl;
    }

    console.log("🔍 Original Stream URL:", streamUrl);
    console.log("🔍 Proxy URL:", m3u8ProxyUrl);
    console.log("📡 Final URL:", finalUrl);

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
        debug: true,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
          // Log the actual request URL
          console.log("🌐 XHR Request to:", xhr.responseURL || "pending");
        },
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("❌ HLS Error:", data);
        console.error("❌ Error Details:", {
          type: data.type,
          details: data.details,
          fatal: data.fatal,
          url: data.url,
          response: data.response
        });
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.log("🔄 Network error, trying to recover...");
              console.log("Failed URL:", data.url);
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
        console.log("✅ Manifest parsed successfully!");
        console.log("✅ Available quality levels:", data.levels);
        if (autoPlay) {
          video.play()
            .then(() => console.log("▶️ Autoplay started"))
            .catch((err) => console.log("⚠️ Autoplay prevented:", err));
        }
      });

      hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
        console.log("✅ Level loaded:", data.level);
      });

      console.log("📡 Loading source:", finalUrl);
      hls.loadSource(finalUrl);
      hls.attachMedia(video);
      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      console.log("✅ Using native HLS (Safari)");
      video.src = finalUrl;
      
      video.addEventListener('loadedmetadata', () => {
        console.log("✅ Metadata loaded");
        if (autoPlay) {
          video.play()
            .then(() => console.log("▶️ Autoplay started"))
            .catch((err) => console.log("⚠️ Autoplay prevented:", err));
        }
      });

      video.addEventListener('error', (e) => {
        console.error("❌ Video error:", e);
        console.error("❌ Video error code:", video.error?.code);
        console.error("❌ Video error message:", video.error?.message);
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
