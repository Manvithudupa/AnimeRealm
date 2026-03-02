/* eslint-disable react/prop-types */
import { useEffect, useRef } from "react";

/**
 * Animepahe proxy player using the ramenflix M3U8 proxy endpoint.
 * This endpoint returns an HTML player page, so we use it as an iframe.
 */
export default function AnimepahePlayer({ streamUrl, m3u8ProxyUrl }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!streamUrl || !m3u8ProxyUrl || !iframeRef.current) return;

    // Construct the proxy player URL by appending the encoded stream URL
    const proxyPlayerUrl = m3u8ProxyUrl + encodeURIComponent(streamUrl);
    
    // Set the iframe source
    iframeRef.current.src = proxyPlayerUrl;
  }, [streamUrl, m3u8ProxyUrl]);

  return (
    <div className="w-full h-full bg-black overflow-hidden">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-none"
        allowFullScreen
        scrolling="no"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          margin: 0,
          padding: 0,
        }}
      />
    </div>
  );
}
