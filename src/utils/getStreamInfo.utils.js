import axios from "axios";
import { apiUrl } from "@/src/config/api";

export default async function getStreamInfo(episodeId, version = "sub") {
  try {
    const response = await axios.get(apiUrl(`/sources/${encodeURIComponent(episodeId)}`), {
      params: { version },
    });
    const data = response.data?.data || {};
    const sources = Array.isArray(data.sources) ? data.sources : [];
    const tracks = Array.isArray(data.tracks) ? data.tracks : [];
    const primary = sources.find((source) => source.url || source.file || source.m3u8) || {};
    const normalizedSources = sources.map((source) => ({
      url: source.url || source.file || source.m3u8 || "",
      isM3u8: (source.type || "").toLowerCase().includes("m3u8") || Boolean(source.m3u8),
      type: source.type || "hls",
      quality: source.quality || "auto",
      referer: source.referer || null,
    })).filter((source) => source.url);
    const subtitles = tracks.map((track) => ({
      file: track.file || track.url,
      label: track.label || "English",
      kind: track.kind || "captions",
      default: Boolean(track.default),
    })).filter((track) => track.file);
    return {
      sources: normalizedSources,
      headers: primary.referer ? { Referer: primary.referer } : {},
      subtitles,
      intro: data.intro || null,
      outro: data.outro || null,
      thumbnail: data.thumbnail || null,
    };
  } catch (error) {
    console.error("Error fetching stream info:", error);
    throw error;
  }
}
