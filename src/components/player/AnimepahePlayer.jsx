/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";

export default function AnimePahePlayer({ streamUrl, m3u8ProxyUrl }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!streamUrl || !m3u8ProxyUrl || !iframeRef.current) return;
    
    const proxyPlayerUrl = m3u8ProxyUrl + encodeURIComponent(streamUrl);
    iframeRef.current.src = proxyPlayerUrl;
  }, [streamUrl, m3u8ProxyUrl]);

  return (
    <div className="absolute inset-0 w-full h-full bg-black">
      <iframe
        ref={iframeRef}
        className="w-full h-full"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          border: "none",
          margin: 0,
          padding: 0,
          overflow: "hidden",
        }}
      />
    </div>
  );
}
