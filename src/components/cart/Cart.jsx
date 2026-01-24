import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClosedCaptioning,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import { FaChevronRight } from "react-icons/fa";
import { useLanguage } from "@/src/context/LanguageContext";
import "./Cart.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import useToolTipPosition from "@/src/hooks/useToolTipPosition";
import Qtip from "../qtip/Qtip";

function Cart({ label, data, path }) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const { tooltipPosition, tooltipHorizontalPosition, cardRefs } =
    useToolTipPosition(hoveredItem, data);

  const handleImageEnter = (item, index) => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setHoveredItem(item.id + index);
  };

  const handleImageLeave = () => {
    setHoverTimeout(
      setTimeout(() => {
        setHoveredItem(null);
      }, 300)
    );
  };

  return (
    <div className="flex flex-col w-1/4 space-y-7 max-[1200px]:w-full">
      <h1 className="font-bold text-2xl text-white max-md:text-xl">
        {label}
      </h1>

      <div className="w-full space-y-4 flex flex-col flex-col">
        {data &&
          data.slice(0, 5).map((item, index) => (
            <div
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              style={{ borderBottom: "1px solid rgba(255,255,255,.075)" }}
              className="flex pb-4 items-center relative"
            >
              {/* Poster */}
              <img
                src={item.poster}
                alt={item.title}
                className="flex-shrink-0 w-[60px] h-[75px] rounded-md object-cover cursor-pointer"
                onClick={() => navigate(`/watch/${item.id}`)}
                onMouseEnter={() => handleImageEnter(item, index)}
                onMouseLeave={handleImageLeave}
              />

              {/* Tooltip */}
              {hoveredItem === item.id + index && window.innerWidth > 1024 && (
                <div
                  className={`absolute ${tooltipPosition} ${tooltipHorizontalPosition}
                  ${
                    tooltipHorizontalPosition === "left-1/2"
                      ? "translate-x-[-100px]"
                      : "translate-x-[-200px]"
                  }
                  z-[100000] transition-all duration-300
                  ${hoveredItem ? "opacity-100" : "opacity-0"}`}
                  onMouseEnter={() => hoverTimeout && clearTimeout(hoverTimeout)}
                  onMouseLeave={handleImageLeave}
                >
                  <Qtip id={item.id} />
                </div>
              )}

              {/* Info */}
              <div className="flex flex-col ml-4 space-y-2 w-full">
                <Link
                  to={`/${item.id}`}
                  className="line-clamp-2 text-[1em] font-medium hover:text-[#ffbade] transition-all max-[1200px]:text-[14px]"
                >
                  {language === "EN" ? item.title : item.japanese_title}
                </Link>

                {/* Meta Row */}
                <div className="flex items-center flex-wrap gap-x-2">
                  {/* CC Badge */}
                  {item.tvInfo?.sub && (
                    <div className="media-badge">
                      <FontAwesomeIcon icon={faClosedCaptioning} />
                      <span>{item.tvInfo.sub}</span>
                    </div>
                  )}

                  {/* Mic Badge */}
                  {item.tvInfo?.dub && (
                    <div className="media-badge mic">
                      <FontAwesomeIcon icon={faMicrophone} />
                      <span>{item.tvInfo.dub}</span>
                    </div>
                  )}

                  {/* Dot + Type */}
                  <div className="flex items-center gap-x-1 pl-1">
                    <span className="dot" />
                    <p className="text-[14px] text-[#D2D2D3]">
                      {item.tvInfo.showType}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

        {/* View More */}
        <Link to={`/${path}`} className="flex items-center gap-x-2 group w-fit">
          <p className="text-white text-[17px] group-hover:text-[#ffbade] transition-all">
            View more
          </p>
          <FaChevronRight className="text-white text-[10px] group-hover:text-[#ffbade] transition-all" />
        </Link>
      </div>
    </div>
  );
}

export default Cart;
