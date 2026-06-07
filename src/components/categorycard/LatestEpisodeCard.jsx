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
      className={`relative rounded-lg overflow-hidden bg-[#111] group transition-all duration-300 hover:-translate-y-1.5 ${isNavigating ? "cursor-wait opacity-80" : "cursor-pointer"}`}
    >
      {/* Thumbnail */}
      <div className="w-full h-48 overflow-hidden relative">
        <OptimizedImage
          src={imageSrc}
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
          lazy={true}
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />

        {/* Play Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
           <div className="bg-[#eb3349] w-10 h-10 rounded-full flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
           </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isNavigating && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="w-6 h-6 border-2 border-[#eb3349] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Episode Badge */}
      {episodeNum && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-[#eb3349] px-2 py-0.5 rounded text-[10px] font-black uppercase text-white shadow-lg">
          EP {episodeNum}
        </div>
      )}

      {/* Bottom Info */}
      <div className="p-3">
        <p className="text-white text-[13px] font-bold leading-tight line-clamp-1 group-hover:text-[#eb3349] transition-colors">
          {title}
        </p>
      </div>
    </div>
  );
};

export default LatestEpisodeCard;
