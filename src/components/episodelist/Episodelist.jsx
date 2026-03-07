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
          <div className="p-4 grid gap-4 grid-cols-6 max-[768px]:grid-cols-5 max-[576px]:grid-cols-4 max-[420px]:grid-cols-3">
            {displayedEpisodes.map((item, index) => {
              const episodeNumber = item?.id.match(/ep=(\d+)/)?.[1];
              const isActive =
                activeEpisodeId === episodeNumber || currentEpisode === episodeNumber;
              const isSearched = searchedEpisode === item?.id;

              return (
                <div
                  key={item?.id}
                  ref={isActive ? activeEpisodeRef : null}
                  className={`relative flex flex-col items-center justify-end h-[110px] rounded-lg cursor-pointer transition-all overflow-hidden group
                    ${isActive ? "ring-2 ring-purple-500" : isSearched ? "ring-2 ring-white" : ""}`}
                  onClick={() => {
                    if (episodeNumber) {
                      onEpisodeClick(episodeNumber);
                      setActiveEpisodeId(episodeNumber);
                      setSearchedEpisode(null);
                    }
                  }}
                  title={language === "EN" ? item?.title : item?.japanese_title}
                >
                  {item?.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={`Episode ${index + selectedRange[0]}`}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-[#2a2a2a]" />
                  )}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 bg-black/80 z-20">
                    <FontAwesomeIcon icon={faCirclePlay} className="text-white w-5 h-5" />
                    <span className="text-xs font-semibold text-white text-center line-clamp-2 break-words">
                      {language === "EN" ? item?.title : item?.japanese_title}
                    </span>
                  </div>
                  <div className="relative z-10 flex items-center justify-center w-full text-xs font-bold text-white bg-black/50 py-1 w-full">
                    Ep {index + selectedRange[0]}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {displayedEpisodes.map((item, index) => {
              const episodeNumber = item?.id.match(/ep=(\d+)/)?.[1];
              const isActive =
                activeEpisodeId === episodeNumber || currentEpisode === episodeNumber;
              const isSearched = searchedEpisode === item?.id;

              return (
                <div
                  key={item?.id}
                  ref={isActive ? activeEpisodeRef : null}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all group
                    ${
                      isActive
                        ? "bg-[#2a2a2a] ring-1 ring-purple-500/50"
                        : "bg-[#1a1a1a] hover:bg-[#252525]"
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
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0 w-24 h-16 rounded-md overflow-hidden bg-[#2a2a2a] group-hover:shadow-lg transition-shadow">
                    {item?.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={`Episode ${index + selectedRange[0]}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-[#2a2a2a]" />
                    )}
                    {/* Episode number badge */}
                    <div className="absolute bottom-1 left-1 bg-black/70 px-2 py-0.5 rounded text-xs font-bold text-white">
                      Ep {index + selectedRange[0]}
                    </div>
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <FontAwesomeIcon icon={faCirclePlay} className="text-white w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 flex flex-col justify-start">
                    <h2
                      className={`text-sm font-semibold line-clamp-2 break-words transition-colors
                        ${isActive ? "text-white" : "text-gray-200 group-hover:text-white"}
                      `}
                      title={language === "EN" ? item?.title : item?.japanese_title}
                    >
                      {language === "EN" ? item?.title : item?.japanese_title}
                    </h2>
                    {/* Metadata - you can add view counts and post dates here when data is available */}
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                      <span className="line-clamp-1">Episode {index + selectedRange[0]}</span>
                    </div>
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
