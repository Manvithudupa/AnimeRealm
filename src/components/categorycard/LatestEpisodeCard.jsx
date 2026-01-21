import React from "react";
import { useNavigate } from "react-router-dom";

const LatestEpisodeCard = ({ item, path }) => {
  const navigate = useNavigate();

  const episodeNum =
    item.tvInfo?.episode ||
    item.tvInfo?.sub ||
    item.tvInfo?.eps ||
    1;

  return (
    <div
      onClick={() =>
        navigate(
          path === "top-upcoming" ? `/${item.id}` : `/watch/${item.id}`
        )
      }
      className="relative rounded-lg overflow-hidden group cursor-pointer
                 transition-transform duration-300 ease-out
                 hover:scale-[1.02]
                 hover:shadow-lg hover:shadow-black/40"
    >
      {/* Landscape Thumbnail */}
      <div className="aspect-video relative">
        <img
          src={item.poster}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover
                     transition-transform duration-300
                     group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Episode Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5
                        bg-black/60 backdrop-blur-sm px-2 py-1
                        rounded text-xs font-medium text-white">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span>Episode {episodeNum}</span>
        </div>

        {/* 18+ Badge */}
        {(item.tvInfo?.rating === "18+" || item.adultContent) && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
            18+
          </div>
        )}

        {/* Latest Episode Tag */}
        {item.isLatest && (
          <div className="absolute bottom-14 left-2 bg-green-600 text-white text-[10px] font-semibold px-2 py-1 rounded-md">
            Latest Episode Aired
          </div>
        )}

        {/* Bottom Content */}
        <div className="absolute bottom-2 left-2 right-2 text-white">
          <p className="text-sm font-semibold leading-tight line-clamp-2">
            {item.title}
          </p>

          <p className="text-xs opacity-80 mt-0.5">
            {item.tvInfo?.showType || item.type || "TV"} •{" "}
            {item.tvInfo?.duration || item.duration || "24m"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LatestEpisodeCard;
