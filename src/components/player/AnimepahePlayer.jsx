/* eslint-disable react/prop-types */
import Player from "@/src/components/player/Player";

export default function AnimePahePlayer({ streamUrl, m3u8ProxyUrl, ...playerProps }) {
  return (
    <Player
      streamUrl={streamUrl}
      m3u8ProxyUrl={m3u8ProxyUrl || import.meta.env.VITE_ANIMEPAHE_M3U8_PROXY}
      subtitles={[]}
      intro={null}
      outro={null}
      thumbnail={null}
      {...playerProps}
    />
  );
}
