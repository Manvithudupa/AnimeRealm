import { Link } from "react-router-dom";

interface LatestEpisodeCardProps {
  id: string;
  title: string;
  poster: string;
  tvInfo?: {
    showType?: string;
    sub?: number;
    dub?: number;
    eps?: number;
    quality?: string;
  };
  genres?: string[];
  latestEpisode?: number;
}

const LatestEpisodeCard = ({
  id,
  title,
  poster,
  tvInfo,
  genres = [],
  latestEpisode,
}: LatestEpisodeCardProps) => {
  // Resolve episode number safely
  const episodeNum =
    latestEpisode ??
    tvInfo?.sub ??
    tvInfo?.eps ??
    1;

  return (
    <Link to={`/watch/${id}`} className="block">
      <div className="relative rounded-xl overflow-hidden bg-[#0f0f1a] cursor-pointer
        transition-transform duration-300 ease-out hover:scale-[1.02] hover:shadow-xl hover:shadow-black/40"
      >
        {/* Image */}
        <div className="aspect-video relative">
          <img
            src={poster}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />

          {/* Soft overlay */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Episode Badge */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-medium text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Episode {episodeNum}</span>
          </div>

          {/* Bottom Content */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
            <h3 className="text-white font-semibold text-sm sm:text-base line-clamp-1">
              {title}
            </h3>

            {genres.length > 0 ? (
              <p className="text-xs text-white/70 mt-0.5 line-clamp-1">
                {genres.slice(0, 3).join(" • ")}
              </p>
            ) : (
              tvInfo?.showType && (
                <p className="text-xs text-white/70 mt-0.5">
                  {tvInfo.showType}
                </p>
              )
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default LatestEpisodeCard;
