import React from "react";

function LatestEpisodeCard({ anime }) {
  if (!anime) return null;

  return (
    <div className="relative overflow-hidden rounded-lg group cursor-pointer bg-black/20">
      {/* Thumbnail */}
      <img
        src={anime.image}
        alt={anime.title}
        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Episode Badge */}
      {anime.episode && (
        <div className="absolute top-2 right-2 bg-sky-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
          Episode {anime.episode}
        </div>
      )}

      {/* Anime Info */}
      <div className="absolute bottom-2 left-2 right-2 text-white">
        <p className="text-sm font-semibold leading-tight line-clamp-2">
          {anime.title}
        </p>
        <p className="text-xs opacity-80 mt-0.5">
          {anime.type || "TV"} • {anime.duration || "24m"}
        </p>
      </div>
    </div>
  );
}

export default LatestEpisodeCard;
