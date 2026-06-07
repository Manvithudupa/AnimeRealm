import { useLanguage } from "@/src/context/LanguageContext";
import {
  faCirclePlay,
  faList,
  faCheck,
  faGrip,
  faBars,
  faArrowsRotate,
  faSort,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef, useCallback } from "react";
import "./Episodelist.css";

// Module-level thumbnail blob cache – persists across component mounts/unmounts
// so thumbnails are never re-fetched from the network once loaded.
const thumbnailBlobCache = new Map(); // originalUrl -> blobUrl (or original as fallback)
const thumbnailFetchingSet = new Set(); // prevents duplicate concurrent fetches

function cacheThumbnailBlob(url) {
  if (!url || thumbnailBlobCache.has(url) || thumbnailFetchingSet.has(url)) return;
  thumbnailFetchingSet.add(url);
  fetch(url)
    .then((r) => (r.ok ? r.blob() : Promise.reject()))
    .then((blob) => {
      thumbnailBlobCache.set(url, URL.createObjectURL(blob));
    })
    .catch(() => {
      thumbnailBlobCache.set(url, url); // cache original URL as fallback
    })
    .finally(() => thumbnailFetchingSet.delete(url));
}

// Helper: compute the range that contains a given episode number
function calcInitialRange(episodeNum, total) {
  const num = parseInt(episodeNum, 10);
  if (isNaN(num) || num < 1) return [1, 100];
  const step = 100;
  const start = Math.floor((num - 1) / step) * step + 1;
  const end = Math.min(start + step - 1, total || start + step - 1);
  return [start, end];
}

function getTimeAgo(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  const now = new Date();
  const diffMs = now - date;
  if (diffMs < 0) return null;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  const weeks = Math.floor(diffDays / 7);
  if (diffDays < 30) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  const months = Math.floor(diffDays / 30);
  if (diffDays < 365) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(diffDays / 365);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return null;
  const now = new Date();
  const diffMs = date - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : null;
}

function Episodelist({
  episodes,
  onEpisodeClick,
  currentEpisode,
  totalEpisodes,
  source,
  animeTitle,
}) {
  const [activeEpisodeId, setActiveEpisodeId] = useState(currentEpisode);
  const { language } = useLanguage();
  const listContainerRef = useRef(null);
  const activeEpisodeRef = useRef(null);
  const [showDropDown, setShowDropDown] = useState(false);
  // Initialise the selected range to the range that contains the current episode
  // so "Go to current episode" works immediately even for episodes in the 500-600 range.
  const [selectedRange, setSelectedRange] = useState(() => calcInitialRange(currentEpisode, totalEpisodes));
  const [activeRange, setActiveRange] = useState(() => {
    const r = calcInitialRange(currentEpisode, totalEpisodes);
    return `${r[0]}-${r[1]}`;
  });
  const [episodeNum, setEpisodeNum] = useState(currentEpisode);
  const dropDownRef = useRef(null);
  const [searchedEpisode, setSearchedEpisode] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const searchedEpisodeRef = useRef(null);
  const [sortDesc, setSortDesc] = useState(false);
  const proxyUrl = import.meta.env.VITE_PROXY_URL || "";
  // Used to trigger a scroll after the range is updated by goToCurrentEpisode
  const pendingScrollRef = useRef(false);

  const [viewMode, setViewMode] = useState("list");

  const scrollToActiveEpisode = useCallback(() => {
    if (activeEpisodeRef.current && listContainerRef.current) {
      const container = listContainerRef.current;
      const activeEpisode = activeEpisodeRef.current;
      const containerTop = container.getBoundingClientRect().top;
      const containerHeight = container.clientHeight;
      const activeEpisodeTop = activeEpisode.getBoundingClientRect().top;
      const activeEpisodeHeight = activeEpisode.clientHeight;
      const offset = activeEpisodeTop - containerTop;
      container.scrollTop =
        container.scrollTop +
        offset -
        containerHeight / 2 +
        activeEpisodeHeight / 2;
    }
  }, []);

  // After selectedRange updates (triggered by goToCurrentEpisode), scroll to active episode
  useEffect(() => {
    if (pendingScrollRef.current) {
      pendingScrollRef.current = false;
      scrollToActiveEpisode();
    }
  }, [selectedRange, scrollToActiveEpisode]);

  useEffect(() => setActiveEpisodeId(episodeNum), [episodeNum]);
  useEffect(() => scrollToActiveEpisode(), [activeEpisodeId, scrollToActiveEpisode]);

  useEffect(() => {
    if (!searchedEpisode) return;
    if (searchedEpisodeRef.current) {
      searchedEpisodeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [searchedEpisode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target)) {
        setShowDropDown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(e) {
    const value = e.target.value.trim();
    setSearchTerm(value);

    if (value === "") {
      // Reset to the range that contains the currently active episode
      const activeEp = episodes?.find(
        (item) => item?.id.match(/ep=(\d+)/)?.[1] === currentEpisode
      );
      const epNum = activeEp?.episode_no || 1;
      const newRange = findRangeForEpisode(epNum);
      setSelectedRange(newRange);
      setActiveRange(`${newRange[0]}-${newRange[1]}`);
      setSearchedEpisode(null);
      return;
    }

    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1 || num > totalEpisodes) {
      setSearchedEpisode(null);
      return;
    }

    const foundEpisode = episodes.find((item) => item?.episode_no === num);
    if (foundEpisode) {
      const newRange = findRangeForEpisode(num);
      setSelectedRange(newRange);
      setActiveRange(`${newRange[0]}-${newRange[1]}`);
      setSearchedEpisode(foundEpisode?.id);
    }
  }

  // Navigate to the range containing the current episode, then scroll to it
  function goToCurrentEpisode() {
    const activeEp = episodes?.find(
      (item) => item?.id.match(/ep=(\d+)/)?.[1] === currentEpisode
    );
    const epNum = activeEp?.episode_no;
    if (epNum) {
      const newRange = findRangeForEpisode(epNum);
      setSelectedRange(newRange);
      setActiveRange(`${newRange[0]}-${newRange[1]}`);
      pendingScrollRef.current = true;
    } else {
      scrollToActiveEpisode();
    }
  }

  function findRangeForEpisode(episodeNumber) {
    const step = 100;
    const start = Math.floor((episodeNumber - 1) / step) * step + 1;
    const end = Math.min(start + step - 1, totalEpisodes);
    return [start, end];
  }

  function generateRangeOptions(totalEpisodes) {
    const ranges = [];
    const step = 100;
    for (let i = 0; i < totalEpisodes; i += step) {
      const start = i + 1;
      const end = Math.min(i + step, totalEpisodes);
      ranges.push(`${start}-${end}`);
    }
    return ranges;
  }

  useEffect(() => {
    const activeEpisode = episodes.find(
      (item) => item?.id.match(/ep=(\d+)/)?.[1] === activeEpisodeId
    );
    if (activeEpisode) setEpisodeNum(activeEpisode?.episode_no);
  }, [activeEpisodeId, episodes]);

  const slicedEpisodes = episodes.slice(selectedRange[0] - 1, selectedRange[1]);
  const displayedEpisodes = sortDesc ? [...slicedEpisodes].reverse() : slicedEpisodes;

  // When a search term is active, show ONLY the episode that exactly matches the number
  const searchNum = searchTerm ? parseInt(searchTerm, 10) : NaN;
  const filteredEpisodes = !isNaN(searchNum)
    ? displayedEpisodes.filter((item) => item?.episode_no === searchNum)
    : displayedEpisodes;

  // Resolve the human-readable episode number (episode_no, e.g. 2) for the
  // currently playing episode.  currentEpisode is the internal ep= ID
  // (e.g. "163517"), NOT the display episode number, so we look it up.
  // Use a direct string check (split on "?ep=") to avoid repeated regex
  // compilation inside the find callback.
  const currentEpNum =
    episodes.find((ep) => ep?.id?.split("?ep=")[1] === currentEpisode)
      ?.episode_no ?? null;

  // Compute "Up Next" episode number
  const nextEpisode = episodes.find(
    (ep) => ep.episode_no === (currentEpNum ?? 0) + 1
  );
  const nextEpNum = nextEpisode ? nextEpisode.episode_no : null;

  // Find next airing episode by checking if airDate is in the future
  const nextAiringEpisode = episodes.find((ep) => {
    if (!ep.airDate) return false;
    const date = new Date(ep.airDate);
    return !isNaN(date.getTime()) && date > new Date();
  });
  const daysUntilNextAiring = nextAiringEpisode
    ? getDaysUntil(nextAiringEpisode.airDate)
    : null;

  return (
    <div className="flex flex-col w-full h-full bg-black">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-md border-b border-white/5">
        {/* Up Next / Playing info */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-black uppercase tracking-widest text-[#eb3349] leading-tight">
                {nextEpNum ? `Up Next - Episode ${nextEpNum}` : "Episode List"}
              </p>
              {animeTitle && (
                <p className="text-[11px] text-white/40 mt-1 truncate font-bold uppercase tracking-wider">
                  Playing EP {currentEpNum || "–"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Search + Controls */}
        <div className="flex items-center gap-2 px-3 pb-3">
          <div className="flex items-center flex-1 bg-white/5 rounded-full px-3 py-1.5 border border-white/5">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-white/30 text-[10px] flex-shrink-0" />
            <input
              type="text"
              className="w-full bg-transparent focus:outline-none text-[11px] font-bold text-white ml-2 placeholder:text-white/20"
              placeholder="EPISODE NUMBER..."
              onChange={handleChange}
            />
          </div>

          {/* Refresh / scroll to current */}
          <button
            onClick={goToCurrentEpisode}
            title="Go to current episode"
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/5 text-white/40 hover:text-[#eb3349] hover:bg-white/10 transition-all"
          >
            <FontAwesomeIcon icon={faArrowsRotate} className="text-[10px]" />
          </button>

          {/* Sort toggle */}
          <button
            onClick={() => setSortDesc((prev) => !prev)}
            className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-white/5 transition-all ${
              sortDesc ? "bg-[#eb3349] text-white" : "bg-white/5 text-white/40 hover:text-white"
            }`}
          >
            <FontAwesomeIcon icon={faSort} className="text-[10px]" />
          </button>

          {/* Grid view toggle */}
          <button
            onClick={() => setViewMode((v) => (v === "grid" ? "list" : "grid"))}
            className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full border border-white/5 transition-all ${
              viewMode === "grid" ? "bg-[#eb3349] text-white" : "bg-white/5 text-white/40 hover:text-white"
            }`}
          >
            <FontAwesomeIcon icon={viewMode === "grid" ? faBars : faGrip} className="text-[10px]" />
          </button>

          {/* Range dropdown (only for long series) */}
          {totalEpisodes > 100 && (
            <div className="relative flex-shrink-0" ref={dropDownRef}>
              <button
                onClick={() => setShowDropDown((prev) => !prev)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/5 text-white/40 hover:text-white transition-all"
              >
                <FontAwesomeIcon icon={faList} className="text-[10px]" />
              </button>

              {showDropDown && (
                <div className="absolute top-full mt-2 right-0 z-30 bg-zinc-900 w-[150px] max-h-[200px] overflow-y-auto rounded-xl border border-white/10 shadow-2xl no-scrollbar">
                  {generateRangeOptions(totalEpisodes).map((item, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        const [start, end] = item.split("-").map(Number);
                        setSelectedRange([start, end]);
                        setActiveRange(item);
                        setShowDropDown(false);
                      }}
                      className={`hover:bg-[#eb3349] hover:text-white cursor-pointer transition-colors ${
                        item === activeRange ? "bg-[#eb3349] text-white" : "text-white/60"
                      }`}
                    >
                      <p className="font-bold text-[11px] p-3 flex justify-between items-center">
                        {item}
                        {item === activeRange && (
                          <FontAwesomeIcon icon={faCheck} />
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Episode List */}
      <div
        ref={listContainerRef}
        className="w-full flex-1 overflow-y-auto bg-black no-scrollbar"
      >
        {viewMode === "grid" ? (
          <div className="p-4 grid gap-2 grid-cols-6 max-[768px]:grid-cols-5 max-[576px]:grid-cols-4 max-[420px]:grid-cols-3">
            {filteredEpisodes.map((item, index) => {
              const episodeNumber = item?.id.match(/ep=(\d+)/)?.[1];
              const isActive =
                activeEpisodeId === episodeNumber || currentEpisode === episodeNumber;
              const isSearched = searchedEpisode === item?.id;
              const itemRef = isActive ? activeEpisodeRef : isSearched ? searchedEpisodeRef : null;
              const displayNum = sortDesc
                ? selectedRange[0] + (slicedEpisodes.length - 1 - index)
                : selectedRange[0] + index;

              return (
                <div
                  key={item?.id}
                  ref={itemRef}
                  className={`grid-item flex items-center justify-center h-[36px] text-[11px] font-black rounded-lg cursor-pointer transition-all
                    ${
                      isActive
                        ? "active"
                        : "text-white/40"
                    }
                    ${isSearched ? "ring-2 ring-[#eb3349]" : ""}`}
                  onClick={() => {
                    if (episodeNumber) {
                      onEpisodeClick(episodeNumber);
                      setActiveEpisodeId(episodeNumber);
                      setSearchedEpisode(null);
                    }
                  }}
                >
                  {displayNum}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 p-2">
            {filteredEpisodes.map((item) => {
              const episodeNumber = item?.id.match(/ep=(\d+)/)?.[1];
              const isActive =
                activeEpisodeId === episodeNumber || currentEpisode === episodeNumber;
              const isSearched = searchedEpisode === item?.id;
              // Get the original URL for cache-key lookup
              const originalUrl = item?.thumbnail
                ? (source === "animepahe" || source === "anizone") && proxyUrl
                  ? `${proxyUrl}${item.thumbnail}`
                  : item.thumbnail
                : null;
              const thumbnailSrc = originalUrl
                ? thumbnailBlobCache.get(originalUrl) || originalUrl
                : null;
              const timeAgo = getTimeAgo(item?.airDate);
              const itemRef = isActive ? activeEpisodeRef : isSearched ? searchedEpisodeRef : null;

              return (
                <div
                  key={item?.id}
                  ref={itemRef}
                  className={`episode-item flex items-center gap-3 px-3 py-3 cursor-pointer
                    ${
                      isActive
                        ? "active"
                        : ""
                    }
                    ${isSearched ? "bg-white/5" : ""}`}
                  onClick={() => {
                    if (episodeNumber) {
                      onEpisodeClick(episodeNumber);
                      setActiveEpisodeId(episodeNumber);
                      setSearchedEpisode(null);
                    }
                  }}
                >
                  {/* Thumbnail with Ep badge */}
                  <div className="relative flex-shrink-0 w-[120px] h-[68px] rounded-md overflow-hidden bg-[#2a2a2a]">
                    {thumbnailSrc ? (
                      <img
                        src={thumbnailSrc}
                        alt={item?.title || `Episode ${item?.episode_no}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onLoad={() => cacheThumbnailBlob(originalUrl)}
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full items-center justify-center bg-[#2a2a2a]"
                      style={{ display: thumbnailSrc ? "none" : "flex" }}
                    >
                      <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    {/* Playing overlay */}
                    {isActive && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <FontAwesomeIcon icon={faCirclePlay} className="text-white text-xl" />
                      </div>
                    )}
                    {/* Ep N badge */}
                    <div className="ep-badge absolute bottom-1.5 left-1.5">
                      Ep {item?.episode_no}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] font-bold truncate leading-tight ${isActive ? "text-[#eb3349]" : "text-white/80"}`}>
                      Episode {item?.episode_no}
                    </p>
                    {item?.title &&
                      item.title !== `Episode ${item?.episode_no}` &&
                      item.title !== String(item?.episode_no) && (
                        <p className="text-xs text-gray-400 truncate mt-0.5 leading-tight">
                          {language === "EN"
                            ? item.title
                            : item.japanese_title || item.title}
                        </p>
                      )}
                    {(item?.rating || timeAgo) && (
                      <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500">
                        {item?.rating && <span>★ {item.rating}</span>}
                        {item?.rating && timeAgo && <span>•</span>}
                        {timeAgo && <span>{timeAgo}</span>}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Next Airing Banner */}
      {daysUntilNextAiring !== null && (
        <div className="sticky bottom-0 z-10 flex items-center justify-center gap-2 px-4 py-3 bg-[#eb3349] text-white text-[11px] font-black uppercase tracking-widest">
          <FontAwesomeIcon icon={faBell} className="text-[10px] animate-bounce" />
          <span>
            Next episode in{" "}
            <span className="text-white">
              {daysUntilNextAiring} {daysUntilNextAiring === 1 ? "day" : "days"}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

export default Episodelist;
