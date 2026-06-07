import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClosedCaptioning,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import OptimizedImage from "@/src/components/OptimizedImage/OptimizedImage";
import { useLanguage } from "@/src/context/LanguageContext";
import { Link, useNavigate } from "react-router-dom";
import useToolTipPosition from "@/src/hooks/useToolTipPosition";
import Qtip from "../qtip/Qtip";

function Topten({ data, className }) {
  const { language } = useLanguage();
  const [activePeriod, setActivePeriod] = useState("today");
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const navigate = useNavigate();

  const handlePeriodChange = (period) => {
    setActivePeriod(period);
  };

  const handleNavigate = (id) => {
    navigate(`/${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentData =
    activePeriod === "today"
      ? data.today
      : activePeriod === "week"
      ? data.week
      : data.month;

  const { tooltipPosition, tooltipHorizontalPosition, cardRefs } =
    useToolTipPosition(hoveredItem, currentData);

  const handleMouseEnter = (item, index) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setHoveredItem(item.id + index);
  };

  const handleMouseLeave = () => {
    setHoverTimeout(
      setTimeout(() => {
        setHoveredItem(null);
      }, 300) // Small delay to prevent flickering
    );
  };

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      <div className="flex justify-between items-center max-[350px]:flex-col max-[350px]:gap-y-2 max-[350px]:items-start">
        <h1 className="font-bold text-2xl text-white tracking-tight">Top 10</h1>
        <ul className="flex justify-between w-fit bg-[#000000] rounded-full p-1 border border-white/5 shadow-lg">
          {["today", "week", "month"].map((period) => (
            <li
              key={period}
              className={`cursor-pointer px-4 py-1.5 rounded-full text-[13px] transition-all duration-300 ${
                activePeriod === period
                  ? "bg-[#eb3349] text-white font-bold"
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => handlePeriodChange(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col space-y-3 bg-black/40 border border-white/5 p-3 pt-6 rounded-2xl shadow-lg backdrop-blur-sm">
        {currentData &&
          currentData.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-x-3 group"
              ref={(el) => (cardRefs.current[index] = el)}
            >
              <h1
                className={`font-black text-3xl transition-colors min-w-[40px] text-center ${
                  index < 3
                    ? "text-[#eb3349]"
                    : "text-white/20"
                } max-[350px]:hidden`}
              >
                {index + 1}
              </h1>
              <div
                className="flex pb-3 relative container items-center border-b border-white/5 last:border-0 group-hover:bg-white/5 transition-colors duration-200 rounded-xl p-2"
              >
                <div
                  className="w-[55px] h-[70px] rounded-lg flex-shrink-0 overflow-hidden cursor-pointer shadow-md"
                  onClick={() => navigate(`/watch/${item.id}`)}
                  onMouseEnter={() => handleMouseEnter(item, index)}
                  onMouseLeave={handleMouseLeave}
                >
                  <OptimizedImage
                    src={item.poster}
                    alt={item.title}
                    className="w-[55px] h-[70px] rounded-lg object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    lazy={true}
                  />
                </div>

                {/* Tooltip positioned near image */}
                {hoveredItem === item.id + index &&
                  window.innerWidth > 1024 && (
                    <div
                      className={`absolute ${tooltipPosition} ${tooltipHorizontalPosition} 
                      ${
                        tooltipPosition === "top-1/2"
                          ? "translate-y-[50px]"
                          : "translate-y-[-50px]"
                      } 
                      z-[100000] transform transition-all duration-300 ease-in-out 
                      ${
                        hoveredItem === item.id + index
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

                <div className="flex flex-col ml-3 space-y-1.5">
                  <Link
                    to={`/${item.id}`}
                    className="text-[0.95em] font-medium text-gray-200 hover:text-white transform transition-all ease-out line-clamp-1 max-[478px]:line-clamp-2 max-[478px]:text-[14px]"
                    onClick={() => handleNavigate(item.id)}
                  >
                    {language === "EN" ? item.title : item.japanese_title}
                  </Link>
                  <div className="flex flex-wrap items-center w-fit space-x-2 max-[350px]:gap-y-[3px]">
                    {item.tvInfo?.sub && (
                      <div className="flex space-x-1 justify-center items-center bg-white/10 rounded px-1.5 py-0.5">
                        <FontAwesomeIcon
                          icon={faClosedCaptioning}
                          className="text-[10px] text-white/50"
                        />
                        <p className="text-[10px] font-bold text-white/50">
                          {item.tvInfo.sub}
                        </p>
                      </div>
                    )}
                    {item.tvInfo?.dub && (
                      <div className="flex space-x-1 justify-center items-center bg-white/10 rounded px-1.5 py-0.5">
                        <FontAwesomeIcon
                          icon={faMicrophone}
                          className="text-[10px] text-white/50"
                        />
                        <p className="text-[10px] font-bold text-white/50">
                          {item.tvInfo.dub}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default React.memo(Topten);
