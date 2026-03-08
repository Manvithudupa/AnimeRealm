import { useLanguage } from "@/src/context/LanguageContext";
import {
  faAngleDown,
  faCirclePlay,
  faList,
  faCheck,
  faGrip,
  faBars,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";
import "./Episodelist.css";

function Episodelist({
  episodes,
  onEpisodeClick,
  currentEpisode,
  totalEpisodes,
  source,
}) {
  const [activeEpisodeId, setActiveEpisodeId] = useState(currentEpisode);
  const { language } = useLanguage();
  const listContainerRef = useRef(null);
  const activeEpisodeRef = useRef(null);
  const [showDropDown, setShowDropDown] = useState(false);
  const [selectedRange, setSelectedRange] = useState([1, 100]);
  const [activeRange, setActiveRange] = useState("1-100");
  const [episodeNum, setEpisodeNum] = useState(currentEpisode);
  const dropDownRef = useRef(null);
  const [searchedEpisode, setSearchedEpisode] = useState(null);
  const proxyUrl = import.meta.env.VITE_PROXY_URL || "";

  // ✅ default to "list" view
  const [viewMode, setViewMode] = useState("list");

  const scrollToActiveEpisode = () => {
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
  };

  useEffect(() => setActiveEpisodeId(episodeNum), [episodeNum]);
  useEffect(() => scrollToActiveEpisode(), [activeEpisodeId]);

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
    if (value === "") {
      const newRange = findRangeForEpisode(1);
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

  const displayedEpisodes = episodes.slice(
    selectedRange[0] - 1,
    selectedRange[1]
  );

  function getThumbnailSrc(item) {
    if (!item?.thumbnail) return null;
    // Proxy animepahe thumbnails (or any external thumbnail) through VITE_PROXY_URL
    if (source === "animepahe" || proxyUrl) {
      return `${proxyUrl}${item.thumbnail}`;
    }
    return item.thumbnail;
  }

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 bg-[#1a1a1a] border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-white">Episodes</h1>

          {totalEpisodes > 100 && (
            <div className="relative" ref={dropDownRef}>
              <div
                onClick={() => setShowDropDown((prev) => !prev)}
                className="text-gray-300 flex items-center gap-2 cursor-pointer hover:text-white transition"
              >
                <FontAwesomeIcon icon={faList} />
                <p className="text-xs">
                  {selectedRange[0]}-{selectedRange[1]}
                </p>
                <FontAwesomeIcon icon={faAngleDown} className="text-[10px]" />
              </div>

              {showDropDown && (
                <div className="absolute top-full mt-2 left-0 z-30 bg-[#2a2a2a] w-[150px] max-h-[200px] overflow-y-auto rounded-lg border border-[#3a3a3a] shadow-lg">
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

        {/* View toggle + search */}
        <div className="flex items-center gap-3">
          <div className="flex gap-2 bg-[#2a2a2a] p-1 rounded-md border border-[#3a3a3a]">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded ${
                viewMode === "grid" ? "bg-[#3a3a3a] text-white" : "text-gray-400"
              } hover:text-white`}
            >
              <FontAwesomeIcon icon={faGrip} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded ${
                viewMode === "list" ? "bg-[#3a3a3a] text-white" : "text-gray-400"
              } hover:text-white`}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          </div>

          {totalEpisodes > 100 && (
            <div className="flex items-center min-w-[150px] bg-[#2a2a2a] rounded-lg px-2 py-1 border border-[#3a3a3a]">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="text-gray-400 text-xs" />
              <input
                type="text"
                className="w-full bg-transparent focus:outline-none text-xs text-white ml-2 placeholder:text-gray-500"
                placeholder="Go to episode..."
                onChange={handleChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Episode List */}
      <div
        ref={listContainerRef}
        className="w-full flex-1 overflow-y-auto bg-[#1a1a1a] max-h-[calc(100vh-200px)]"
      >
        {viewMode === "grid" ? (
          <div className="p-4 grid gap-2 grid-cols-6 max-[768px]:grid-cols-5 max-[576px]:grid-cols-4 max-[420px]:grid-cols-3">
            {displayedEpisodes.map((item, index) => {
              const episodeNumber = item?.id.match(/ep=(\d+)/)?.[1];
              const isActive =
                activeEpisodeId === episodeNumber || currentEpisode === episodeNumber;
              const isSearched = searchedEpisode === item?.id;

              return (
                <div
                  key={item?.id}
                  ref={isActive ? activeEpisodeRef : null}
                  className={`flex items-center justify-center h-[35px] text-xs font-medium rounded-md cursor-pointer transition-all
                    ${
                      isActive
                        ? "bg-white text-black"
                        : "bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a] hover:text-white"
                    }
                    ${isSearched ? "ring-1 ring-white" : ""}`}
                  onClick={() => {
                    if (episodeNumber) {
                      onEpisodeClick(episodeNumber);
                      setActiveEpisodeId(episodeNumber);
                      setSearchedEpisode(null);
                    }
                  }}
                >
                  {index + selectedRange[0]}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="divide-y divide-[#2a2a2a]">
            {displayedEpisodes.map((item) => {
              const episodeNumber = item?.id.match(/ep=(\d+)/)?.[1];
              const isActive =
                activeEpisodeId === episodeNumber || currentEpisode === episodeNumber;
              const isSearched = searchedEpisode === item?.id;
              const thumbnailSrc = getThumbnailSrc(item);

              return (
                <div
                  key={item?.id}
                  ref={isActive ? activeEpisodeRef : null}
                  className={`flex items-start gap-3 cursor-pointer transition-all
                    ${
                      isActive
                        ? "bg-[#252525]"
                        : "bg-[#1a1a1a] hover:bg-[#212121]"
                    }
                    ${isSearched ? "ring-1 ring-inset ring-white/30" : ""}`}
                  onClick={() => {
                    if (episodeNumber) {
                      onEpisodeClick(episodeNumber);
                      setActiveEpisodeId(episodeNumber);
                      setSearchedEpisode(null);
                    }
                  }}
                >
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-[110px] h-[62px] relative overflow-hidden bg-[#2a2a2a]">
                    {thumbnailSrc ? (
                      <img
                        src={thumbnailSrc}
                        alt={item?.title || `Episode ${item?.episode_no}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling && (e.target.nextSibling.style.display = "flex");
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
                    {isActive && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <FontAwesomeIcon icon={faCirclePlay} className="text-white text-xl" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 py-2 pr-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-medium truncate ${isActive ? "text-white" : "text-gray-300"}`}>
                        <span className="text-gray-500 mr-1.5">Ep {item?.episode_no}</span>
                        {language === "EN" ? item?.title : (item?.japanese_title || item?.title)}
                      </p>
                    </div>
                    {item?.overview && (
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-tight">
                        {item.overview}
                      </p>
                    )}
                    {item?.airDate && !item?.overview && (
                      <p className="text-[11px] text-gray-500 mt-0.5">{item.airDate}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Episodelist;

