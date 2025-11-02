import { useState } from "react";
import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import { useLanguage } from "@/src/context/LanguageContext";
import useToolTipPosition from "@/src/hooks/useToolTipPosition";
import Qtip from "@/src/components/qtip/Qtip";

function TabbedAnimeSection({
  topAiring,
  mostFavorite,
  latestCompleted,
  className = "",
}) {
  const [activeTab, setActiveTab] = useState("airing");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const { language } = useLanguage();
  const navigate = useNavigate();

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

  const { tooltipPosition, tooltipHorizontalPosition, cardRefs } =
    useToolTipPosition(hoveredItem, activeTabData?.data || []);

  const handleMouseEnter = (item, index) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setHoveredItem(item.id + index);
  };

  const handleMouseLeave = () => {
    setHoverTimeout(setTimeout(() => setHoveredItem(null), 300));
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header Tabs */}
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
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-y-[-1px]">
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

      {/* Anime Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-3 mt-5 overflow-visible">
        {activeTabData?.data?.slice(0, 12).map((item, index) => (
          <div
            key={item.id}
            className="group relative overflow-visible"
            ref={(el) => (cardRefs.current[index] = el)}
          >
            {/* Card */}
            <div
              className="relative cursor-pointer rounded-lg overflow-hidden transition-transform duration-200 hover:scale-[1.03]"
              onMouseEnter={() => handleMouseEnter(item, index)}
              onMouseLeave={handleMouseLeave}
              onClick={() => navigate(`/watch/${item.id}`)}
            >
              {/* ✅ Aspect ratio preserved */}
              <div className="relative w-full aspect-[3/4] overflow-hidden">
                <img
                  src={item.poster}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-[14px] font-medium text-white line-clamp-1">
                  {language === "EN" ? item.title : item.japanese_title}
                </p>
              </div>
            </div>

            {/* ✅ Qtip Tooltip (fixed) */}
            {hoveredItem === item.id + index && window.innerWidth > 1024 && (
              <div
                className={`absolute z-[100000] ${tooltipPosition} ${tooltipHorizontalPosition}`}
                style={{
                  pointerEvents: "auto",
                  opacity: hoveredItem === item.id + index ? 1 : 0,
                  transform:
                    hoveredItem === item.id + index ? "scale(1)" : "scale(0.95)",
                  transition: "opacity 0.25s ease, transform 0.25s ease",
                }}
                onMouseEnter={() => clearTimeout(hoverTimeout)}
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
