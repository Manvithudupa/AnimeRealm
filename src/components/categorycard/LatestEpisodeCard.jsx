import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/src/context/LanguageContext";

const LatestEpisodeCard = ({ item, path }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const episodeNum =
    item.latestEpisode ?? item.tvInfo?.sub ?? item.tvInfo?.eps ?? null;

  return (
    <div
      onClick={() =>
        navigate(
          path === "top-upcoming" ? `/${item.id}` : `/watch/${item.id}`
        )
      }
      className="relative cursor-pointer rounded-xl overflow-hidden bg-[#0f0f1a] group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
    >
      {/* Thumbnail */}
      <img
        src={item.poster}
        alt={item.title}
        className="w-full h-48 object-cover"
        loading="lazy"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />

      {/* Episode Badge */}
      {episodeNum && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs text-white font-medium">
            Episode {episodeNum}
          </span>
        </div>
      )}

      {/* 18+ Badge */}
      {(item.tvInfo?.rating === "18+" || item.adultContent) && (
        <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
          18+
        </div>
      )}

      {/* Bottom Info */}
      <div className="absolute bottom-3 left-3 right-3">
        <p className="text-white text-sm font-semibold leading-snug line-clamp-2">
          {language === "EN" ? item.title : item.japanese_title}
        </p>

        <p className="text-xs text-white/70 mt-1">
          {item.tvInfo?.showType || item.type || "TV"}
        </p>
      </div>
    </div>
  );
};

export default LatestEpisodeCard;
