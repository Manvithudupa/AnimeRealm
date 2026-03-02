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
    <div className="relative w-full h-full bg-black">
      <iframe
        ref={iframeRef}
        className="absolute inset-0 w-full h-full"
        allowFullScreen
        allow="autoplay; fullscreen; picture-in-picture"
        sandbox="allow-scripts allow-same-origin allow-presentation"
        style={{
          border: "none",
        }}
      />
    </div>
  );
}
