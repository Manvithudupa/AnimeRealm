import React, { useState } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClosedCaptioning, faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "@/src/context/LanguageContext";
import { Link } from "react-router-dom";
import useToolTipPosition from "@/src/hooks/useToolTipPosition";
import Qtip from "../qtip/Qtip";

function Sidecard({ data, label, className }) {
  const { language } = useLanguage();
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleMouseEnter = (item, index) => {
    const timeout = setTimeout(() => {
      setHoveredItem(item.id + index);
    }, 400);
    setHoverTimeout(timeout);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout);
    setHoveredItem(null);
  };

  const { tooltipPosition, tooltipHorizontalPosition, cardRefs } = useToolTipPosition(
    hoveredItem,
    data
  );

  // Render tooltip in a portal
  const renderTooltip = (item, index) => {
    if (hoveredItem !== item.id + index || window.innerWidth <= 1024) return null;

    const card = cardRefs.current[index];
    if (!card) return null;

    const rect = card.getBoundingClientRect(); // get card position
    const style = {
      position: "absolute",
      top: rect.bottom + window.scrollY + 5 + "px", // 5px gap below card
      left: rect.left + window.scrollX + "px",
      zIndex: 100000,
    };

    return createPortal(
      <div style={style} className="transition-all duration-300">
        <Qtip id={item.id} />
      </div>,
      document.body
    );
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && <h2 className="font-medium text-lg text-neutral-200 mb-4">{label}</h2>}

      <div className="flex flex-col space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-[#1a1a1a] scrollbar-thumb-[#2a2a2a] hover:scrollbar-thumb-[#333] scrollbar-thumb-rounded">
        {data &&
          data.map((item, index) => (
            <div
              key={index}
              className="group relative"
              ref={(el) => (cardRefs.current[index] = el)}
              onMouseEnter={() => handleMouseEnter(item, index)}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                to={`/${item.id}`}
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="block"
              >
                <div className="flex items-start gap-3 p-2 rounded-lg transition-colors hover:bg-[#1f1f1f]">
                  <img
                    src={item.poster}
                    alt={item.title}
                    className="w-[50px] h-[70px] rounded object-cover"
                  />

                  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors line-clamp-1">
                      {language === "EN" ? item.title : item.japanese_title}
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      {item.tvInfo?.sub && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#2a2a2a] rounded text-gray-300">
                          <FontAwesomeIcon icon={faClosedCaptioning} className="text-[10px]" />
                          <span className="text-[10px] font-medium">{item.tvInfo.sub}</span>
                        </div>
                      )}
                      {item.tvInfo?.dub && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-[#2a2a2a] rounded text-gray-300">
                          <FontAwesomeIcon icon={faMicrophone} className="text-[10px]" />
                          <span className="text-[10px] font-medium">{item.tvInfo.dub}</span>
                        </div>
                      )}
                      {item.tvInfo?.showType && (
                        <span className="text-xs text-gray-400">{item.tvInfo.showType}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>

              {/* Tooltip rendered in portal */}
              {renderTooltip(item, index)}
            </div>
          ))}
      </div>
    </div>
  );
}

export default React.memo(Sidecard);
