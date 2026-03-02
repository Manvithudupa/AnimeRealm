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
    <iframe
      ref={iframeRef}
      className="w-full h-full bg-black border-none"
      allowFullScreen
      scrolling="no"
      style={{ display: "block" }}
    />
  );
}
