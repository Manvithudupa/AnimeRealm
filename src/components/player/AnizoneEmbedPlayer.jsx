/* eslint-disable react/prop-types */
import { useEffect, useRef, useState, useCallback } from "react";
import BouncingLoader from "../ui/bouncingloader/Bouncingloader";

// How close to the end (seconds) we treat the video as finished
const END_THRESHOLD_SECONDS = 1;
// Minimum video duration (seconds) before auto-next triggers, to avoid false positives
const MIN_VIDEO_DURATION = 30;

/* ── Subtitle parsing helpers ──────────────────────────────────────────── */

function timeToSeconds(timeStr) {
  const trimmed = timeStr.trim();
  // Handles HH:MM:SS.mmm, HH:MM:SS,mmm, MM:SS.mmm
  const parts = trimmed.replace(",", ".").split(":");
  if (parts.length === 3) {
    return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
  }
  return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
}

function stripHtmlTags(text) {
  // Strip all angle brackets so no HTML tags or incomplete tags remain
  return text.replace(/[<>]/g, "");
}

function parseVTT(text) {
  const cues = [];
  const blocks = text.replace(/\r\n/g, "\n").split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    // Find the timestamp line (contains "-->")
    const tsIdx = lines.findIndex((l) => l.includes("-->"));
    if (tsIdx === -1) continue;
    const [startStr, endStr] = lines[tsIdx].split("-->").map((s) => s.trim());
    // Strip VTT cue settings after the end timestamp
    const endClean = endStr.split(/\s/)[0];
    const start = timeToSeconds(startStr);
    const end = timeToSeconds(endClean);
    const cueText = lines
      .slice(tsIdx + 1)
      .map(stripHtmlTags)
      .join("\n")
      .trim();
    if (cueText) {
      cues.push({ start, end, text: cueText });
    }
  }
  return cues;
}

function parseSRT(text) {
  const cues = [];
  const blocks = text.replace(/\r\n/g, "\n").split(/\n\s*\n/);
  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 3) continue;
    // First line is index, second is timestamp
    const tsLine = lines[1];
    if (!tsLine?.includes("-->")) continue;
    const [startStr, endStr] = tsLine.split("-->").map((s) => s.trim());
    const start = timeToSeconds(startStr);
    const end = timeToSeconds(endStr);
    const cueText = lines
      .slice(2)
      .map(stripHtmlTags)
      .join("\n")
      .trim();
    if (cueText) {
      cues.push({ start, end, text: cueText });
    }
  }
  return cues;
}

function detectFormat(fileUrl) {
  if (!fileUrl) return "vtt";
  const lower = fileUrl.toLowerCase();
  if (lower.includes(".srt")) return "srt";
  return "vtt";
}

async function fetchAndParseSubs(fileUrl) {
  if (!fileUrl) return [];
  try {
    const res = await fetch(fileUrl);
    const text = await res.text();
    const fmt = detectFormat(fileUrl);
    return fmt === "srt" ? parseSRT(text) : parseVTT(text);
  } catch {
    return [];
  }
}

function findActiveCue(cues, currentTime) {
  return cues.find((c) => currentTime >= c.start && currentTime < c.end) || null;
}

/* ── Component ──────────────────────────────────────────────────────────── */

export default function AnizoneEmbedPlayer({
  m3u8ProxyUrl,
  streamUrl,
  subtitles = [],
  episodeId,
  episodes,
  playNext,
  autoNext,
  animeInfo,
  episodeNum,
}) {
  const [loading, setLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(
    episodes?.findIndex((ep) => ep.id.match(/ep=(\d+)/)?.[1] === episodeId)
  );

  // Subtitle state
  const [selectedSubIndex, setSelectedSubIndex] = useState(() => {
    if (!subtitles?.length) return null;
    const byFlag = subtitles.findIndex((s) => s.default === true);
    if (byFlag >= 0) return byFlag;
    const byEng = subtitles.findIndex((s) => s.label?.toLowerCase() === "english");
    return byEng >= 0 ? byEng : 0;
  });
  const [parsedCues, setParsedCues] = useState([]);
  const [activeCue, setActiveCue] = useState(null);
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const currentTimeRef = useRef(0);

  // Refs so event handlers always see the latest values
  const autoNextRef = useRef(autoNext);
  const currentEpisodeIndexRef = useRef(currentEpisodeIndex);
  const episodesRef = useRef(episodes);
  const parsedCuesRef = useRef(parsedCues);

  useEffect(() => { autoNextRef.current = autoNext; }, [autoNext]);
  useEffect(() => { currentEpisodeIndexRef.current = currentEpisodeIndex; }, [currentEpisodeIndex]);
  useEffect(() => { episodesRef.current = episodes; }, [episodes]);
  useEffect(() => { parsedCuesRef.current = parsedCues; }, [parsedCues]);

  // Build the iframe URL from the m3u8ProxyUrl
  const iframeSrc =
    m3u8ProxyUrl && streamUrl ? `${m3u8ProxyUrl}${encodeURIComponent(streamUrl)}` : "";

  // Sync currentEpisodeIndex when episodeId changes
  useEffect(() => {
    if (episodes?.length > 0) {
      const newIndex = episodes.findIndex(
        (episode) => episode.id.match(/ep=(\d+)/)?.[1] === episodeId
      );
      setCurrentEpisodeIndex(newIndex);
    }
  }, [episodeId, episodes]);

  // Reset selected subtitle when subtitles list changes (episode change)
  useEffect(() => {
    if (!subtitles?.length) {
      setSelectedSubIndex(null);
      return;
    }
    const byFlag = subtitles.findIndex((s) => s.default === true);
    if (byFlag >= 0) { setSelectedSubIndex(byFlag); return; }
    const byEng = subtitles.findIndex((s) => s.label?.toLowerCase() === "english");
    setSelectedSubIndex(byEng >= 0 ? byEng : 0);
  }, [subtitles]);

  // Fetch and parse the selected subtitle file
  useEffect(() => {
    setParsedCues([]);
    setActiveCue(null);
    if (selectedSubIndex === null || !subtitles?.[selectedSubIndex]?.file) return;
    fetchAndParseSubs(subtitles[selectedSubIndex].file).then(setParsedCues);
  }, [selectedSubIndex, subtitles]);

  // Listen for postMessage events from the proxy iframe player
  useEffect(() => {
    const handleMessage = (event) => {
      const { currentTime, duration } = event.data || {};
      if (typeof currentTime !== "number") return;

      currentTimeRef.current = currentTime;

      // Update active subtitle cue
      const cue = findActiveCue(parsedCuesRef.current, currentTime);
      setActiveCue((prev) => {
        if (prev?.text === cue?.text && prev?.start === cue?.start) return prev;
        return cue;
      });

      // Auto-next episode
      if (
        typeof duration === "number" &&
        duration > MIN_VIDEO_DURATION &&
        currentTime >= duration - END_THRESHOLD_SECONDS &&
        autoNextRef.current
      ) {
        const idx = currentEpisodeIndexRef.current;
        const eps = episodesRef.current;
        if (idx >= 0 && idx < eps?.length - 1) {
          playNext(eps[idx + 1].id.match(/ep=(\d+)/)?.[1]);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [playNext]);

  // Loading state + continue-watching on episode unmount
  useEffect(() => {
    setLoading(true);
    setIframeLoaded(false);
    return () => {
      const continueWatching = JSON.parse(localStorage.getItem("continueWatching")) || [];
      const newEntry = {
        id: animeInfo?.id,
        data_id: animeInfo?.data_id,
        episodeId,
        episodeNum,
        adultContent: animeInfo?.adultContent,
        poster: animeInfo?.poster,
        title: animeInfo?.title,
        japanese_title: animeInfo?.japanese_title,
      };
      if (!newEntry.data_id) return;
      const existingIndex = continueWatching.findIndex(
        (item) => item.data_id === newEntry.data_id
      );
      if (existingIndex !== -1) {
        continueWatching[existingIndex] = newEntry;
      } else {
        continueWatching.push(newEntry);
      }
      localStorage.setItem("continueWatching", JSON.stringify(continueWatching));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeId]);

  const handleSubSelect = useCallback(
    (index) => {
      setSelectedSubIndex(index);
      setSubMenuOpen(false);
    },
    []
  );

  const hasSubtitles = subtitles?.length > 0;

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Loader Overlay */}
      <div
        className={`absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 z-20 transition-opacity duration-500 ${
          loading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <BouncingLoader />
      </div>

      {/* Iframe */}
      <iframe
        key={`${episodeId}-anizone-${iframeSrc}`}
        src={iframeSrc}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        className={`w-full h-full transition-opacity duration-500 ${
          iframeLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => {
          setIframeLoaded(true);
          setTimeout(() => setLoading(false), 500);
        }}
        onError={() => {
          console.error("Failed to load AniZone embed for URL:", iframeSrc);
          setLoading(false);
        }}
      />

      {/* Subtitle overlay — floats above the iframe */}
      {selectedSubIndex !== null && activeCue && (
        <div
          className="absolute bottom-[12%] left-0 right-0 flex justify-center items-end z-10 pointer-events-none px-4"
          aria-live="polite"
        >
          <span
            className="text-white text-center leading-snug whitespace-pre-line"
            style={{
              fontSize: "1.15rem",
              textShadow:
                "1px 1px 3px #000, -1px -1px 3px #000, 1px -1px 3px #000, -1px 1px 3px #000",
              background: "rgba(0,0,0,0.45)",
              borderRadius: "4px",
              padding: "2px 10px",
              maxWidth: "85%",
            }}
          >
            {activeCue.text}
          </span>
        </div>
      )}

      {/* Subtitle track selector button — top-right corner */}
      {hasSubtitles && iframeLoaded && (
        <div className="absolute top-2 right-2 z-30">
          <button
            onClick={() => setSubMenuOpen((o) => !o)}
            title="Subtitles"
            className="flex items-center gap-1 bg-black bg-opacity-60 hover:bg-opacity-80 text-white text-xs font-semibold px-2 py-1 rounded transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
            >
              <path d="M4 6h16v2H4V6zm2 5h12v2H6v-2zm3 5h6v2H9v-2z" />
            </svg>
            CC
          </button>

          {subMenuOpen && (
            <div className="absolute right-0 mt-1 w-44 rounded shadow-lg bg-[#1a1a1a] border border-[#333] overflow-hidden">
              <button
                className={`w-full text-left px-3 py-2 text-xs hover:bg-[#333] transition-colors ${
                  selectedSubIndex === null ? "text-blue-400 font-semibold" : "text-white"
                }`}
                onClick={() => handleSubSelect(null)}
              >
                Off
              </button>
              {subtitles.map((sub, i) => (
                <button
                  key={i}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-[#333] transition-colors ${
                    selectedSubIndex === i ? "text-blue-400 font-semibold" : "text-white"
                  }`}
                  onClick={() => handleSubSelect(i)}
                >
                  {sub.label || `Track ${i + 1}`}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
