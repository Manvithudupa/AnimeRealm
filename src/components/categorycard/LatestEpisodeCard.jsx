import React from "react";
import { useNavigate } from "react-router-dom";

const LatestEpisodeCard = ({ item, path }) => {
  const navigate = useNavigate();

  return (
    <div
      className="relative overflow-hidden rounded-lg group cursor-pointer bg-black/20 transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-black/40"
      onClick={() =>
        navigate(
          path === "top-upcoming" ? `/${item.id}` : `/watch/${item.id}`
        )
      }
    >
      {/* Thumbnail */}
      <img
        src={item.poster}
        alt={item.title}
        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Episode Badge */}
      {item.tvInfo?.episode && (
        <div className="absolute top-2 right-2 bg-sky-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
          Episode {item.tvInfo.episode}
        </div>
      )}

      {/* 18+ Badge */}
      {(item.tvInfo?.rating === "18+" || item.adultContent) && (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
          18+
        </div>
      )}

      {/* Title & Info */}
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
  );
};

export default LatestEpisodeCard;
