import React, { useState } from "react";
import PropTypes from "prop-types";
import CategoryCard from "@/src/components/categorycard/CategoryCard.jsx";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import useToolTipPosition from "@/src/hooks/useToolTipPosition";
import Qtip from "@/src/components/qtip/Qtip.jsx";

function TabbedAnimeSection({ topAiring, mostFavorite, latestCompleted, className = "" }) {
  const [activeTab, setActiveTab] = useState("airing");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const navigate = useNavigate();

  const tabs = [
    { id: "airing", label: "Top Airing", data: topAiring, path: "top-airing" },
    { id: "favorite", label: "Most Favorite", data: mostFavorite, path: "most-favorite" },
    { id: "completed", label: "Latest Completed", data: latestCompleted, path: "completed" },
  ];

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  // Tooltip position hook
  const { tooltipPosition, tooltipHorizontalPosition, cardRefs } =
    useToolTipPosition(hoveredItem, activeTabData.data);

  // Hover handling (same as Topten)
  const handleMouseEnter = (item, index) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setHoveredItem(item.id + index);
  };

  const handleMouseLeave = () => {
    setHoverTimeout(
      setTimeout(() => {
        setHoveredItem(null);
      }, 200)
    );
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
                ${activeTab === tab.id 
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
          <FaChevronRight className="text-[10px] transform transition-transform duration-300 
            group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Anime Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-3 mt-4">
        {activeTabData.data?.slice(0, 12).map((item, index) => (
          <div
            key={index}
            ref={(el) => (cardRefs.current[index] = el)}
            className="relative group"
            onMouseEnter={() => handleMouseEnter(item, index)}
            onMouseLeave={handleMouseLeave}
          >
            <div
              onClick={() => navigate(`/watch/${item.id}`)}
              className="relative cursor-pointer overflow-hidden rounded-lg bg-black/20 transition-all duration-300 hover:shadow-lg hover:shadow-black/40"
            >
              <img
                src={item.poster}
                alt={item.title}
                className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <p className="absolute bottom-2 left-2 text-white text-sm font-semibold line-clamp-2">
                {item.title}
              </p>
            </div>

            {/* Tooltip (Anime Details Preview) */}
            {hoveredItem === item.id + index && window.innerWidth > 1024 && (
              <div
                className={`absolute ${tooltipPosition} ${tooltipHorizontalPosition}
                z-[100000] transform transition-all duration-300 ease-in-out
                ${hoveredItem === item.id + index
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
                }`}
                onMouseEnter={() => {
                  if (hoverTimeout) clearTimeout(hoverTimeout);
                }}
                onMouseLeave={handleMouseLeave}
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
