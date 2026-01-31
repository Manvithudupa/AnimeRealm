import React, { useCallback, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClosedCaptioning,
  faMicrophone,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import LatestEpisodeCard from "./LatestEpisodeCard.jsx";
import { useLanguage } from "@/src/context/LanguageContext";
import Qtip from "@/src/components/qtip/Qtip.jsx";

const CategoryCard = React.memo(
  ({
    label,
    data,
    showViewMore = true,
    className,
    categoryPage = false,
    cardStyle,
    path,
    limit,
  }) => {
    const { language } = useLanguage();
    const navigate = useNavigate();

    if (limit) data = data.slice(0, limit);

    const [itemsToRender, setItemsToRender] = useState({
      firstRow: [],
      remainingItems: [],
    });

    /* Local hover state per card */
    const [localHoverId, setLocalHoverId] = useState(null);

    const handleEnter = (item) => setLocalHoverId(item.id);
    const handleLeave = () => setLocalHoverId(null);

    const getItemsToRender = useCallback(() => {
      if (categoryPage) {
        const firstRow =
          window.innerWidth > 758 && data.length > 4 ? data.slice(0, 4) : [];
        const remainingItems =
          window.innerWidth > 758 && data.length > 4
            ? data.slice(4)
            : data.slice(0);
        return { firstRow, remainingItems };
      }

      return { firstRow: [], remainingItems: data.slice(0) };
    }, [categoryPage, data]);

    useEffect(() => {
      const handleResize = () => setItemsToRender(getItemsToRender());

      setItemsToRender(getItemsToRender());

      window.addEventListener("resize", handleResize);

      return () => window.removeEventListener("resize", handleResize);
    }, [getItemsToRender]);

    return (
      <div className={`w-full ${className}`}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-semibold text-xl text-white max-[478px]:text-[17px] capitalize tracking-wide">
            {label}
          </h1>

          {showViewMore && (
            <Link
              to={`/${path}`}
              className="flex items-center gap-x-1 py-1 px-2 -mr-2 rounded-md
              text-[13px] font-medium text-[#ffffff80] hover:text-white
              transition-all duration-300 group"
            >
              View all
            <span className="text-[10px] transition-transform duration-300 group-hover:translate-x-0.5">
              ➔
            </span>
            </Link>
          )}
        </div>

        {/* FIRST ROW (Category Page) */}
        {categoryPage && itemsToRender.firstRow.length > 0 && (
          <div className="grid grid-cols-4 gap-x-3 gap-y-6 mt-6 max-[758px]:hidden">
            {itemsToRender.firstRow.map((item, index) => (
              <div
                key={index}
                className="relative flex flex-col category-card-container"
                onMouseEnter={() => handleEnter(item)}
                onMouseLeave={handleLeave}
              >
                {/* Poster */}
                <div className="card-poster group">
                  <div
                    className="poster-wrapper"
                    onClick={() =>
                      navigate(
                        path === "top-upcoming" ? `/${item.id}` : `/watch/${item.id}`
                      )
                    }
                  >
                    <img src={item.poster} alt={item.title} />
                    <div className="overlay"></div>
                    <FontAwesomeIcon icon={faPlay} className="play-icon" />
                  </div>
                </div>

                {/* Title */}
                <Link to={`/${item.id}`} className="item-title mt-2 line-clamp-1">
                  {language === "EN" ? item.title : item.japanese_title}
                </Link>

                {/* Tooltip */}
                {localHoverId === item.id && window.innerWidth > 1024 && (
                  <div className="absolute left-full top-0 ml-3 z-[10000]">
                    <Qtip id={item.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* MAIN GRID */}
        <div
          className={`grid ${
            cardStyle ||
            "grid-cols-6 max-[1400px]:grid-cols-5 max-[1100px]:grid-cols-4 max-[758px]:grid-cols-3 max-[478px]:grid-cols-2"
          } gap-x-3 gap-y-6 mt-4`}
        >
          {itemsToRender.remainingItems.map((item, index) =>
            label === "Latest Episode" ? (
              <LatestEpisodeCard key={index} item={item} path={path} />
            ) : (
              <div
                key={index}
                className="relative flex flex-col category-card-container"
                onMouseEnter={() => handleEnter(item)}
                onMouseLeave={handleLeave}
              >
                {/* Poster */}
                <div className="card-poster group">
                  <div
                    className="poster-wrapper"
                    onClick={() =>
                      navigate(
                        path === "top-upcoming" ? `/${item.id}` : `/watch/${item.id}`
                      )
                    }
                  >
                    <img src={item.poster} alt={item.title} />
                    <div className="overlay"></div>
                    <FontAwesomeIcon icon={faPlay} className="play-icon" />
                  </div>

                  {/* Adult Badge */}
                  {(item.tvInfo?.rating === "18+" || item?.adultContent) && (
                    <div className="adult-badge">18+</div>
                  )}

                  {/* Sub / Dub Info */}
                  <div className="info-container">
                    <div className="flex space-x-1">
                      {item.tvInfo?.sub && (
                        <div className="meta-badge">
                          <FontAwesomeIcon icon={faClosedCaptioning} />
                          <span>{item.tvInfo.sub}</span>
                        </div>
                      )}
                      {item.tvInfo?.dub && (
                        <div className="meta-badge">
                          <FontAwesomeIcon icon={faMicrophone} />
                          <span>{item.tvInfo.dub}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <Link to={`/${item.id}`} className="item-title mt-2 line-clamp-1">
                  {language === "EN" ? item.title : item.japanese_title}
                </Link>

                {/* Tooltip */}
                {localHoverId === item.id && window.innerWidth > 1024 && (
                  <div className="absolute left-full top-0 ml-3 z-[10000]">
                    <Qtip id={item.id} />
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    );
  }
);

CategoryCard.displayName = "CategoryCard";

export default CategoryCard;
