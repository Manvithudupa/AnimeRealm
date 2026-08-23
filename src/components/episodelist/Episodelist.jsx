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
    <div className="flex flex-col w-full h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#2a2a2a]">
        {/* Up Next / Playing info */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white leading-tight">
                {nextEpNum ? `Up Next - Episode ${nextEpNum}` : "Episode List"}
              </p>
              {animeTitle && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">
                  Playing - Episode {currentEpNum || "–"} -{" "}
                  <span className="text-gray-300">{animeTitle}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Search + Controls */}
        <div className="flex items-center gap-2 px-3 pb-2.5">
          <div className="flex items-center flex-1 bg-[#111] rounded-lg px-2.5 py-1.5 border border-white/10">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-400 text-xs flex-shrink-0" />
            <input
              type="text"
              className="w-full bg-transparent focus:outline-none text-xs text-white ml-2 placeholder:text-gray-500"
              placeholder="Search Episode"
              onChange={handleChange}
            />
          </div>

          {/* Refresh / scroll to current */}
          <button
            onClick={goToCurrentEpisode}
            title="Go to current episode"
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-[#111] border border-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faArrowsRotate} className="text-xs" />
          </button>

          {/* Sort toggle */}
          <button
            onClick={() => setSortDesc((prev) => !prev)}
            title={sortDesc ? "Currently: descending" : "Currently: ascending"}
            className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md border border-white/10 transition-colors ${
              sortDesc ? "bg-white text-black" : "bg-[#111] text-gray-400 hover:text-white"
            }`}
          >
            <FontAwesomeIcon icon={faSort} className="text-xs" />
          </button>

          {/* Grid view toggle */}
          <button
            onClick={() => setViewMode((v) => (v === "grid" ? "list" : "grid"))}
            title={viewMode === "grid" ? "List view" : "Grid view"}
            className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md border border-[#3a3a3a] transition-colors ${
              viewMode === "grid" ? "bg-white text-black" : "bg-[#111] text-gray-400 hover:text-white"
            }`}
          >
            <FontAwesomeIcon icon={viewMode === "grid" ? faBars : faGrip} className="text-xs" />
          </button>

          {/* Range dropdown (only for long series) */}
          {totalEpisodes > 100 && (
            <div className="relative flex-shrink-0" ref={dropDownRef}>
              <button
                onClick={() => setShowDropDown((prev) => !prev)}
                title="Select episode range"
                className="w-8 h-8 flex items-center justify-center rounded-md bg-[#111] border border-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={faList} className="text-xs" />
              </button>

              {showDropDown && (
                <div className="absolute top-full mt-2 right-0 z-30 bg-[#111] w-[150px] max-h-[200px] overflow-y-auto rounded-lg border border-white/10 shadow-lg">
                  {generateRangeOptions(totalEpisodes).map((item, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        const [start, end] = item.split("-").map(Number);
                        setSelectedRange([start, end]);
                        setActiveRange(item);
                        setShowDropDown(false);
                      }}
                      className={`hover:bg-[#3a3a3a] cursor-pointer transition-colors ${
                        item === activeRange ? "bg-[#404040]" : ""
                      }`}
                    >
                      <p className="font-medium text-xs p-2.5 flex justify-between items-center text-gray-300 hover:text-white">
                        {item}
                        {item === activeRange && (
                          <FontAwesomeIcon icon={faCheck} className="text-white" />
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
        className="w-full flex-1 overflow-y-auto bg-[#0a0a0a]"
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
                  className={`flex items-center justify-center h-[35px] text-xs font-medium rounded-md cursor-pointer transition-all
                    ${
                      isActive
                        ? "bg-indigo-600 text-white dark:bg-white dark:text-black"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:bg-[#111] dark:text-gray-400 dark:hover:bg-[#1a1a1a] dark:hover:text-white"
                    }
                    ${isSearched ? "ring-1 ring-indigo-300 dark:ring-white" : ""}`}
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
                ? proxyUrl
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
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all
                    ${
                      isActive
                        ? "bg-indigo-50 border-l-2 border-indigo-500 dark:border-0 dark:bg-[#252525]"
                        : "bg-transparent hover:bg-gray-100 dark:bg-[#0a0a0a] dark:hover:bg-[#111]"
                    }
                    ${isSearched ? "ring-1 ring-inset ring-indigo-300 dark:ring-white/30" : ""}`}
                  onClick={() => {
                    if (episodeNumber) {
                      onEpisodeClick(episodeNumber);
                      setActiveEpisodeId(episodeNumber);
                      setSearchedEpisode(null);
                    }
                  }}
                >
                  {/* Thumbnail with Ep badge */}
                  <div className="relative flex-shrink-0 w-[120px] h-[68px] rounded-md overflow-hidden bg-[#111]">
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
                      className="w-full h-full items-center justify-center bg-[#111]"
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
                    <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                      Ep {item?.episode_no}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate leading-tight ${isActive ? "text-indigo-700 dark:text-white" : "text-gray-700 dark:text-gray-200"}`}>
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
        <div className="sticky bottom-0 z-10 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a3a2a] border-t border-[#2a4a3a] text-sm text-green-300">
          <FontAwesomeIcon icon={faBell} className="text-xs" />
          <span>
            Next ep airing in{" "}
            <span className="font-semibold text-green-400">
              {daysUntilNextAiring} {daysUntilNextAiring === 1 ? "day" : "days"}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

export default Episodelist;
