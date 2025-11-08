import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Qtip from "@/src/components/qtip/Qtip.jsx";

const LatestEpisodeCard = ({ item, path }) => {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);
  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);

  // Hover handling with slight delay (prevents flicker)
  const handleMouseEnter = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    showTimerRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    hideTimerRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 200);
  };

  const handleTooltipMouseEnter = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const handleTooltipMouseLeave = () => {
    hideTimerRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 200);
  };

  return (
    <div
      className="relative overflow-hidden rounded-lg group cursor-pointer bg-black/20 transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-black/40"
      onClick={() =>
        navigate(path === "top-upcoming" ? `/${item.id}` : `/watch/${item.id}`)
      }
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Thumbnail */}
      <div className="relative aspect-[2/3]">
        <img
          src={item.poster}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Episode Badge */}
      {item.tvInfo?.episode && (
        <div className="absolute top-2 right-2 bg-sky-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
          Ep {item.tvInfo.episode}
        </div>
      )}

      {/* 18+ Badge */}
      {(item.tvInfo?.rating === "18+" || item.adultContent) && (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
          18+
        </div>
      )}

      {/* Latest Episode Tag */}
      {item.isLatest && (
        <div className="absolute bottom-10 left-2 bg-green-600 text-white text-[10px] font-semibold px-2 py-1 rounded-md">
          Latest Episode Aired
        </div>
      )}

      {/* Title & Info */}
      <div className="absolute bottom-2 left-2 right-2 text-white">
        <p className="text-sm font-semibold leading-tight line-clamp-2">
          {item.title}
        </p>
        <p className="text-xs opacity-80 mt-0.5">
          {item.tvInfo?.showType || item.type || "TV"} •{" "}
          {item.tvInfo?.duration || item.duration || "24m"}
        </p>
      </div>

      {/* ✅ Tooltip */}
      {showTooltip && window.innerWidth > 1024 && (
        <div
          className="absolute top-0 left-full ml-2 z-[10000]"
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          style={{ pointerEvents: "auto" }}
        >
          <Qtip id={item.id} />
        </div>
      )}
    </div>
  );
};

export default LatestEpisodeCard;
