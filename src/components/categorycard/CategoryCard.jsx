import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClosedCaptioning,
  faMicrophone,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import LatestEpisodeCard from "./LatestEpisodeCard.jsx";
import { useLanguage } from "@/src/context/LanguageContext";
import "./CategoryCard.css";

const CategoryCard = React.memo(
  ({
    label,
    data,
    categoryPage = false,
    cardStyle,
    path,
    limit,
    cardRefs,
    onItemHover,
    onItemLeave,
  }) => {
    const { language } = useLanguage();
    const navigate = useNavigate();

    if (limit) data = data.slice(0, limit);

    const [itemsToRender, setItemsToRender] = useState({
      firstRow: [],
      remainingItems: [],
    });

    const getItemsToRender = useCallback(() => {
      if (categoryPage) {
        const firstRow =
          window.innerWidth > 758 && data.length > 4
            ? data.slice(0, 4)
            : [];

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

    const renderCard = (item, index) => {
      if (label === "Latest Episode") {
        return <LatestEpisodeCard key={index} item={item} path={path} />;
      }

      return (
        <div
          key={index}
          ref={(el) => cardRefs && (cardRefs.current[item.id] = el)}
          className="category-card-container"
          onMouseEnter={() => onItemHover && onItemHover(item)}
          onMouseLeave={() => onItemLeave && onItemLeave()}
        >
          {/* Poster */}
          <div className="card-poster group">
            <div
              className="poster-wrapper"
              onClick={() =>
                navigate(
                  path === "top-upcoming"
                    ? `/${item.id}`
                    : `/watch/${item.id}`
                )
              }
            >
              <img src={item.poster} alt={item.title} />

              <div className="overlay"></div>

              <FontAwesomeIcon icon={faPlay} className="play-icon" />

              {/* Sub / Dub overlay */}
              <div className="subdub-overlay">
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

            {/* 18+ Badge */}
            {(item.tvInfo?.rating === "18+" || item?.adultContent) && (
              <div className="adult-badge">18+</div>
            )}
          </div>

          {/* Title */}
          <Link to={`/${item.id}`} className="item-title line-clamp-1">
            {language === "EN" ? item.title : item.japanese_title}
          </Link>
        </div>
      );
    };

    return (
      <>
        {/* First Row */}
        {categoryPage && itemsToRender.firstRow.length > 0 && (
          <div className="grid grid-cols-4 gap-x-3 gap-y-6 mt-6 max-[758px]:hidden">
            {itemsToRender.firstRow.map(renderCard)}
          </div>
        )}

        {/* Main Grid */}
        <div
          className={`grid ${
            cardStyle ||
            "grid-cols-6 max-[1400px]:grid-cols-5 max-[1100px]:grid-cols-4 max-[758px]:grid-cols-3 max-[478px]:grid-cols-2"
          } gap-x-3 gap-y-6 mt-4`}
        >
          {itemsToRender.remainingItems.map(renderCard)}
        </div>
      </>
    );
  }
);

CategoryCard.displayName = "CategoryCard";
export default CategoryCard;
