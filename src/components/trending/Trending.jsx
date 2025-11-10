import { useLanguage } from "@/src/context/LanguageContext";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClosedCaptioning, faMicrophone, faFire } from "@fortawesome/free-solid-svg-icons";
import Qtip from "../qtip/Qtip";
import { useState, useEffect, useRef } from "react";

const Trending = ({ trending, className }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [hoveredItem, setHoveredItem] = useState(null);
  const [tooltipStyle, setTooltipStyle] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);
  const cardRefs = useRef([]);

  const handleMouseEnter = (item, index) => {
    const card = cardRefs.current[index];
    if (!card) return;

    const rect = card.getBoundingClientRect();
    setTooltipStyle({
      top: rect.top + window.scrollY,
      left: rect.right + 10 + window.scrollX,
    });

    setHoveredItem(item.id + index);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  // Update tooltip position on scroll or resize
  useEffect(() => {
    const handleUpdate = () => {
      if (!hoveredItem) return;
      const index = trending.findIndex(item => item.id + trending.indexOf(item) === hoveredItem);
      const card = cardRefs.current[index];
      if (!card) return;
      const rect = card.getBoundingClientRect();
      setTooltipStyle({
        top: rect.top + window.scrollY,
        left: rect.right + 10 + window.scrollX,
      });
    };
    window.addEventListener("scroll", handleUpdate);
    window.addEventListener("resize", handleUpdate);
    return () => {
      window.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [hoveredItem, trending]);

  return (
    <div
      className={`bg-[#1a1a1a] rounded-lg p-4 shadow-lg shadow-black/30 relative ${className}`}
      ref={containerRef}
    >
      <div className="flex items-center gap-2 mb-4">
        <FontAwesomeIcon icon={faFire} className="text-pink-500 text-lg drop-shadow-sm" />
        <h2 className="text-xl font-semibold text-white tracking-wide">Trending Now</h2>
      </div>

      <div className="flex flex-col space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-[#1a1a1a] scrollbar-thumb-[#2a2a2a] hover:scrollbar-thumb-[#333] scrollbar-thumb-rounded">
        {trending && trending.length > 0 ? (
          trending.map((item, index) => {
            const info = item.tvInfo || item;
            return (
              <div
                key={index}
                ref={el => (cardRefs.current[index] = el)}
                className="flex items-start gap-3 p-2 rounded-lg transition-all duration-200 hover:bg-[#2a2a2a]/60 relative"
              >
                <div
                  className="relative cursor-pointer flex-shrink-0"
                  onClick={() => navigate(`/watch/${item.id}`)}
                  onMouseEnter={() => handleMouseEnter(item, index)}
                  onMouseLeave={handleMouseLeave}
                >
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-[55px] h-[80px] rounded-lg object-cover shadow-md transition-transform duration-200 group-hover:scale-[1.02]"
                  />
                  <div className="absolute top-0 left-0 bg-gradient-to-r from-pink-500 to-orange-500 text-white text-[11px] font-bold px-1.5 rounded-br-md">
                    #{index + 1}
                  </div>
                </div>

                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <Link
                    to={`/${item.id}`}
                    className="text-[0.95em] font-medium text-gray-200 hover:text-white transition-colors line-clamp-2"
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                    {language === "EN" ? item.title : item.japanese_title}
                  </Link>

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {info.sub && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white/10 rounded-md text-gray-300 hover:bg-white/20 transition">
                        <FontAwesomeIcon icon={faClosedCaptioning} className="text-[10px]" />
                        <span className="text-[10px] font-medium">{info.sub}</span>
                      </div>
                    )}
                    {info.dub && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white/10 rounded-md text-gray-300 hover:bg-white/20 transition">
                        <FontAwesomeIcon icon={faMicrophone} className="text-[10px]" />
                        <span className="text-[10px] font-medium">{info.dub}</span>
                      </div>
                    )}
                    {info.showType && (
                      <span className="text-xs text-gray-400 font-medium">{info.showType}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400 text-sm text-center py-6">No trending shows found.</p>
        )}
      </div>

      {/* Tooltip overlay */}
      {hoveredItem && (
        <div
          className="absolute z-[1000] pointer-events-none"
          style={{ top: tooltipStyle.top, left: tooltipStyle.left }}
        >
          <Qtip id={hoveredItem.slice(0, hoveredItem.length - 1)} />
        </div>
      )}
    </div>
  );
};

export default Trending;
