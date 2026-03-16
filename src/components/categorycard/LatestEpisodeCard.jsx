import { useNavigate } from "react-router-dom";
import OptimizedImage from "@/src/components/OptimizedImage/OptimizedImage";
import { useLanguage } from "@/src/context/LanguageContext";

const LatestEpisodeCard = ({ item, path }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const proxyUrl = import.meta.env.VITE_PROXY_URL || "";

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

  const handleClick = () => {
    if (isEpisodeData) {
      navigate(`/search?q=${encodeURIComponent(item.title)}`);
    } else {
      navigate(path === "top-upcoming" ? `/${item.id}` : `/watch/${item.id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="relative cursor-pointer rounded-xl overflow-hidden bg-[#0f0f1a] group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40"
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
