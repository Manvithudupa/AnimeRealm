import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import CategoryCard from "@/src/components/categorycard/CategoryCard.jsx";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import Qtip from "@/src/components/qtip/Qtip.jsx";

function TabbedAnimeSection({
  topAiring,
  mostFavorite,
  latestCompleted,
  topUpcoming, // <-- new prop
  className = "",
}) {
  const [activeTab, setActiveTab] = useState("airing");
  const [hoveredItem, setHoveredItem] = useState(null);

  const showTimerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const cardRefs = useRef({});

  const tabs = [
    { id: "airing", label: "Top Airing", data: topAiring, path: "top-airing" },
    { id: "favorite", label: "Most Favorite", data: mostFavorite, path: "most-favorite" },
    { id: "completed", label: "Latest Completed", data: latestCompleted, path: "completed" },
    { id: "upcoming", label: "Top Upcoming", data: topUpcoming, path: "top-upcoming" }, // <-- new tab
  ];

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  // Hover handlers
  const handleMouseEnter = (item) => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (showTimerRef.current) clearTimeout(showTimerRef.current);

    showTimerRef.current = setTimeout(() => {
      setHoveredItem(item.id);
      showTimerRef.current = null;
    }, 200);
  };

  const handleMouseLeave = () => {
    if (showTimerRef.current) clearTimeout(showTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    hideTimerRef.current = setTimeout(() => {
      setHoveredItem(null);
      hideTimerRef.current = null;
    }, 200);
  };

  const handleTooltipMouseEnter = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  };

  const handleTooltipMouseLeave = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

    hideTimerRef.current = setTimeout(() => {
      setHoveredItem(null);
      hideTimerRef.current = null;
    }, 200);
  };

  // Dynamic tooltip position
  const [tooltipStyle, setTooltipStyle] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!hoveredItem || !cardRefs.current[hoveredItem]) return;

    const card = cardRefs.current[hoveredItem];
    const top = card.offsetTop;
    const left = card.offsetLeft + card.offsetWidth + 12; // 12px gap

    setTooltipStyle({ top, left });
  }, [hoveredItem]);

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
                ${activeTab === tab.id ? "text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-primary after:rounded-t-full" : "text-[#ffffff80] hover:text-white"}
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
          className="flex items-center gap-x-1 py-1 px-2 -mr-2 rounded-md text-[13px] font-medium text-[#ffffff80] hover:text-white transition-all duration-300 group"
        >
          View all
          <FaChevronRight className="text-[10px] transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Cards + Tooltip Wrapper */}
      <div className="relative">
        <CategoryCard
          data={activeTabData?.data || []}
          path={activeTabData?.path}
          limit={12}
          showViewMore={false}
          cardRefs={cardRefs}
          onItemHover={handleMouseEnter}
          onItemLeave={handleMouseLeave}
        />

        {/* Tooltip */}
        {hoveredItem && cardRefs.current[hoveredItem] && window.innerWidth > 1024 && (
          <div
            className="absolute z-[100000] transition-all duration-200 ease-in-out"
            style={{
              top: tooltipStyle.top,
              left: tooltipStyle.left,
              pointerEvents: "auto",
            }}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
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
  topUpcoming: PropTypes.array, // <-- new prop
  className: PropTypes.string,
};

export default TabbedAnimeSection;
