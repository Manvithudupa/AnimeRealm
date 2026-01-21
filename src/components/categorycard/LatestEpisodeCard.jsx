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
      className="relative rounded-2xl overflow-hidden group cursor-pointer
                 transition-transform duration-300 ease-out
                 hover:scale-[1.06]
                 hover:shadow-2xl hover:shadow-black/60"
    >
      {/* EXTRA BIG Landscape Thumbnail */}
      <div className="aspect-[16/8] relative">
        <img
          src={item.poster}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover
                     transition-transform duration-500
                     group-hover:scale-115"
        />

        {/* Strong Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

        {/* Episode Badge */}
        <div className="absolute top-4 right-4 flex items-center gap-2.5
                        bg-black/75 backdrop-blur-md px-4 py-2
                        rounded-lg text-base font-bold text-white">
          <span className="w-3 h-3 rounded-full bg-accent" />
          <span>Episode {episodeNum}</span>
        </div>

        {/* 18+ Badge */}
        {(item.tvInfo?.rating === "18+" || item.adultContent) && (
          <div className="absolute top-4 left-4 bg-red-600 text-white text-sm font-extrabold px-3 py-1.5 rounded-lg">
            18+
          </div>
        )}

        {/* Latest Episode Tag */}
        {item.isLatest && (
          <div className="absolute bottom-20 left-4 bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-lg">
            Latest Episode Aired
          </div>
        )}

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <p className="text-xl sm:text-2xl font-bold leading-tight line-clamp-2">
            {item.title}
          </p>

          <p className="text-base sm:text-lg opacity-90 mt-2">
            {item.tvInfo?.showType || item.type || "TV"} •{" "}
            {item.tvInfo?.duration || item.duration || "24m"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LatestEpisodeCard;
