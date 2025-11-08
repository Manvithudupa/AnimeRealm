import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import CategoryCard from "@/src/components/categorycard/CategoryCard.jsx";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import useToolTipPosition from "@/src/hooks/useToolTipPosition";
import Qtip from "@/src/components/qtip/Qtip.jsx";

function TabbedAnimeSection({ topAiring, mostFavorite, latestCompleted, className = "" }) {
  const [activeTab, setActiveTab] = useState("airing");
  const [hoveredItem, setHoveredItem] = useState(null); // will store item.id
  const navigate = useNavigate();

  // refs for timers and refs map (cardRefs used by useToolTipPosition)
  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const cardRefs = useRef({}); // map of id -> element

  const tabs = [
    { id: "airing", label: "Top Airing", data: topAiring, path: "top-airing" },
    { id: "favorite", label: "Most Favorite", data: mostFavorite, path: "most-favorite" },
    { id: "completed", label: "Latest Completed", data: latestCompleted, path: "completed" },
  ];

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  // Tooltip position hook expects hoveredItem and data
  const { tooltipPosition, tooltipHorizontalPosition } =
    useToolTipPosition(hoveredItem, activeTabData.data, cardRefs);

  // Hover handlers
  const handleMouseEnter = (item) => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    showTimerRef.current = setTimeout(() => {
      setHoveredItem(item.id);
      showTimerRef.current = null;
    }, 200);
  };

  const handleMouseLeave = () => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setHoveredItem(null);
      hideTimerRef.current = null;
    }, 200);
  };

  const handleTooltipMouseEnter = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const handleTooltipMouseLeave = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setHoveredItem(null);
      hideTimerRef.current = null;
    }, 200);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Tabs Header */}
      <div className="flex justify-between items-center border-b border-[#ffffff1a] relative">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-4 text-[15px] font-medium transition-all duration-300 
                ${
                  activeTab === tab.id
                    ? "text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-primary after:rounded-t-full"
                    : "text-[#ffffff80] hover:text-white"
                }
                before:absolute before:bottom-0 before:left-1/2 before:w-0 before:h-[2px] before:bg-[#ffffff40]
                before:transition-all before:duration-300 before:-translate-x-1/2
                hover:before:w-full
                group
              `}
            >
              <span className="relative z-10 transition-transform duration-300 group-hover:transform group-hover:translate-y-[-1px]">
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        <Link
          to={`/${activeTabData.path}`}
          className="flex items-center gap-x-1 py-1 px-2 -mr-2 rounded-md
            text-[13px] font-medium text-[#ffffff80] hover:text-white
            transition-all duration-300 group"
        >
          View all
          <FaChevronRight
            className="text-[10px] transform transition-transform duration-300 
            group-hover:translate-x-0.5"
          />
        </Link>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-3 mt-4">
        {activeTabData.data?.slice(0, 12).map((item) => (
          <div
            key={item.id}
            ref={(el) => (cardRefs.current[item.id] = el)}
            className="relative group"
            onMouseEnter={() => handleMouseEnter(item)}
            onMouseLeave={handleMouseLeave}
          >
            {/* ✅ Normalized Card Size */}
            <div
              onClick={() => navigate(`/watch/${item.id}`)}
              className="relative aspect-[2/3] cursor-pointer overflow-hidden rounded-lg bg-black/20 
              transition-all duration-300 hover:shadow-lg hover:shadow-black/40"
            >
              <img
                src={item.poster}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <p className="absolute bottom-2 left-2 text-white text-sm font-semibold line-clamp-2">
                {item.title}
              </p>
            </div>

            {/* Tooltip Preview */}
            {hoveredItem === item.id && window.innerWidth > 1024 && (
              <div
                className={`absolute ${tooltipPosition || "top-full"} ${
                  tooltipHorizontalPosition || "left-0"
                }
                  z-[100000] transform transition-all duration-200 ease-in-out
                  opacity-100 translate-y-0`}
                onMouseEnter={handleTooltipMouseEnter}
                onMouseLeave={handleTooltipMouseLeave}
                style={{ pointerEvents: "auto" }}
              >
                <Qtip id={item.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

TabbedAnimeSection.propTypes = {
  topAiring: PropTypes.array.isRequired,
  mostFavorite: PropTypes.array.isRequired,
  latestCompleted: PropTypes.array.isRequired,
  className: PropTypes.string,
};

export default TabbedAnimeSection;
