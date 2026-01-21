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
      className="relative rounded-xl overflow-hidden group cursor-pointer
                 transition-transform duration-300 ease-out
                 hover:scale-[1.03]
                 hover:shadow-xl hover:shadow-black/50"
    >
      {/* Bigger Landscape Thumbnail */}
      <div className="aspect-video relative">
        <img
          src={item.poster}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover
                     transition-transform duration-300
                     group-hover:scale-110"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

        {/* Episode Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-2
                        bg-black/70 backdrop-blur-sm px-3 py-1.5
                        rounded-md text-sm font-semibold text-white">
          <span className="w-2.5 h-2.5 rounded-full bg-accent" />
          <span>Episode {episodeNum}</span>
        </div>

        {/* 18+ Badge */}
        {(item.tvInfo?.rating === "18+" || item.adultContent) && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-md">
            18+
          </div>
        )}

        {/* Latest Episode Tag */}
        {item.isLatest && (
          <div className="absolute bottom-16 left-3 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md">
            Latest Episode Aired
          </div>
        )}

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <p className="text-base font-semibold leading-tight line-clamp-2">
            {item.title}
          </p>

          <p className="text-sm opacity-80 mt-1">
            {item.tvInfo?.showType || item.type || "TV"} •{" "}
            {item.tvInfo?.duration || item.duration || "24m"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LatestEpisodeCard;
