import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import OptimizedImage from "@/src/components/OptimizedImage/OptimizedImage";
import { useLanguage } from "@/src/context/LanguageContext";

const LatestEpisodeCard = ({ item, path }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const proxyUrl = import.meta.env.VITE_PROXY_URL || "";
  const [isNavigating, setIsNavigating] = useState(false);

  // Detect data format: episode-format has episodeId but no id (AniList ID)
  const isEpisodeData = Boolean(item.episodeId && !item.id);

  const episodeNum = isEpisodeData
    ? item.episodeNumber
    : item.latestEpisode ?? item.tvInfo?.sub ?? item.tvInfo?.eps ?? null;

  // Use proxied thumbnail for episode data, poster for anime data
  const imageSrc = isEpisodeData
    ? `${proxyUrl}${item.thumbnail}`
    : item.poster;

  const title = isEpisodeData || language === "EN"
    ? item.title
    : item.japanese_title;

  const handleClick = async () => {
    if (isEpisodeData) {
      setIsNavigating(true);
      try {
        const base_url = import.meta.env.VITE_ANIMEPAHE_URL;
        const response = await axios.get(
          `${base_url}/api/anilist/anime/search?q=${encodeURIComponent(item.title)}&page=1&perPage=1`
        );
        const result = response.data?.data?.[0];
        if (result?.anilistId) {
          navigate(`/watch/${result.anilistId}?ep=${item.episodeNumber}`);
        } else {
          navigate(`/search?q=${encodeURIComponent(item.title)}`);
        }
      } catch (error) {
        console.error("Failed to find AniList ID for episode navigation:", error);
        navigate(`/search?q=${encodeURIComponent(item.title)}`);
      } finally {
        setIsNavigating(false);
      }
    } else {
      navigate(path === "top-upcoming" ? `/${item.id}` : `/watch/${item.id}`);
    }
  };

  return (
    <div
      onClick={isNavigating ? undefined : handleClick}
      aria-disabled={isNavigating}
      aria-busy={isNavigating}
      className={`relative rounded-xl overflow-hidden bg-[#0f0f1a] group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 ${isNavigating ? "cursor-wait opacity-80" : "cursor-pointer"}`}
    >
      {/* Thumbnail */}
      <div className="w-full h-48 overflow-hidden">
        <OptimizedImage
          src={imageSrc}
          alt={title}
          className="w-full h-48 object-cover"
          lazy={true}
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />

      {/* Loading Overlay */}
      {isNavigating && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

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
      {!isEpisodeData && (item.tvInfo?.rating === "18+" || item.adultContent) && (
        <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
          18+
        </div>
      )}

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent pt-6 pb-3 px-3 rounded-b-xl">
        <p className="text-white text-sm font-semibold leading-snug line-clamp-2">
          {title}
        </p>
      </div>
    </div>
  );
};

export default LatestEpisodeCard;
