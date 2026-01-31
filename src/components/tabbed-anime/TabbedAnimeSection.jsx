import React, { useState, useRef } from "react";
import PropTypes from "prop-types";
import CategoryCard from "@/src/components/categorycard/CategoryCard.jsx";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";

import useToolTipPosition from "@/src/hooks/useToolTipPosition";
import Qtip from "@/src/components/qtip/Qtip.jsx";

function TabbedAnimeSection({
  topAiring,
  mostFavorite,
  latestCompleted,
  className = "",
}) {
  const [activeTab, setActiveTab] = useState("airing");
  const [hoveredItem, setHoveredItem] = useState(null);

  const navigate = useNavigate();

  /* Tooltip timers */
  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);

  /* Refs for each card */
  const cardRefs = useRef({});

  const tabs = [
    { id: "airing", label: "Top Airing", data: topAiring, path: "top-airing" },
    {
      id: "favorite",
      label: "Most Favorite",
      data: mostFavorite,
      path: "most-favorite",
    },
    {
      id: "completed",
      label: "Latest Completed",
      data: latestCompleted,
      path: "completed",
    },
  ];

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  /* Tooltip position */
  const { tooltipPosition, tooltipHorizontalPosition } =
    useToolTipPosition(
      hoveredItem,
      activeTabData?.data,
      cardRefs
    );

  /* Hover handlers */
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
              <span className="relative z-10 transition-transform duration-300 group-hover:-translate-y-[1px]">
                {tab.label}
              </span>
            </button>
          ))}

        </div>

        {/* View All */}
        <Link
          to={`/${activeTabData?.path}`}
          className="flex items-center gap-x-1 py-1 px-2 -mr-2 rounded-md
            text-[13px] font-medium text-[#ffffff80] hover:text-white
            transition-all duration-300 group"
        >
          View all

          <FaChevronRight
            className="text-[10px] transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </Link>

      </div>

      {/* Cards + Tooltip Wrapper */}
      <div className="relative">

        {/* Category Cards */}
        <CategoryCard
          data={activeTabData?.data || []}
          path={activeTabData?.path}
          limit={12}
          showViewMore={false}

          /* Pass refs + hover handlers */
          cardRefs={cardRefs}
          onItemHover={handleMouseEnter}
          onItemLeave={handleMouseLeave}
        />

        {/* Tooltips */}
        {hoveredItem && window.innerWidth > 1024 && (
          <div
            className={`absolute ${tooltipPosition || "top-full"} ${
              tooltipHorizontalPosition || "left-0"
            }
            z-[100000] transition-all duration-200 ease-in-out`}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
            style={{ pointerEvents: "auto" }}
          >
            <Qtip id={hoveredItem} />
          </div>
        )}

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
