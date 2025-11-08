import getAnimeInfo from "@/src/utils/getAnimeInfo.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faClosedCaptioning,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import website_name from "@/src/config/website";
import CategoryCard from "@/src/components/categorycard/CategoryCard";
import Loader from "@/src/components/Loader/Loader";
import Error from "@/src/components/error/Error";
import { useLanguage } from "@/src/context/LanguageContext";
import { useHomeInfo } from "@/src/context/HomeInfoContext";
import Voiceactor from "@/src/components/voiceactor/Voiceactor";

// ---------- Reusable Subcomponents ----------
function InfoItem({ label, value, isProducer = true }) {
  return (
    value && (
      <div className="text-[11px] sm:text-[14px] font-medium transition-all duration-300">
        <span className="text-gray-400">{`${label}: `}</span>
        <span className="font-light text-white/90">
          {Array.isArray(value) ? (
            value.map((item, index) =>
              isProducer ? (
                <Link
                  to={`/producer/${item
                    .replace(/[&'"^%$#@!()+=<>:;,.?/\\|{}[\]`~*_]/g, "")
                    .split(" ")
                    .join("-")
                    .replace(/-+/g, "-")}`}
                  key={index}
                  className="cursor-pointer transition-colors duration-300 hover:text-gray-300"
                >
                  {item}
                  {index < value.length - 1 && ", "}
                </Link>
              ) : (
                <span key={index}>
                  {item}
                  {index < value.length - 1 && ", "}
                </span>
              )
            )
          ) : isProducer ? (
            <Link
              to={`/producer/${value
                .replace(/[&'"^%$#@!()+=<>:;,.?/\\|{}[\]`~*_]/g, "")
                .split(" ")
                .join("-")
                .replace(/-+/g, "-")}`}
              className="cursor-pointer transition-colors duration-300 hover:text-gray-300"
            >
              {value}
            </Link>
          ) : (
            <span>{value}</span>
          )}
        </span>
      </div>
    )
  );
}

function Tag({ icon, text }) {
  return (
    <div className="flex items-center justify-center space-x-1 px-2 sm:px-3 py-0.5 sm:py-1 text-white backdrop-blur-md bg-white/10 font-medium text-[10px] sm:text-[13px] rounded-md sm:rounded-full transition-all duration-300 hover:bg-white/20">
      {icon && <FontAwesomeIcon icon={icon} className="text-[10px] sm:text-[12px] mr-1" />}
      <p className="text-[10px] sm:text-[12px]">{text}</p>
    </div>
  );
}

// ---------- Main Component ----------
function AnimeInfo({ random = false }) {
  const { language } = useLanguage();
  const { id: paramId } = useParams();
  const id = random ? null : paramId;
  const navigate = useNavigate();
  const { homeInfo } = useHomeInfo();

  const [animeInfo, setAnimeInfo] = useState(null);
  const [seasons, setSeasons] = useState(null);
  const [isFull, setIsFull] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id === "404-not-found-page") return null;

    const fetchAnimeInfo = async () => {
      setLoading(true);
      try {
        const data = await getAnimeInfo(id, random);
        setAnimeInfo(data.data);
        setSeasons(data?.seasons);
      } catch (err) {
        console.error("Error fetching anime info:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeInfo();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, random]);

  useEffect(() => {
    if (animeInfo)
      document.title = `Watch ${animeInfo.title} English Sub/Dub online Free on ${website_name}`;
    return () => {
      document.title = `${website_name} | Free anime streaming platform`;
    };
  }, [animeInfo]);

  if (loading) return <Loader type="animeInfo" />;
  if (error) return <Error />;
  if (!animeInfo) {
    navigate("/404-not-found-page");
    return null;
  }

  const { title, japanese_title, poster, animeInfo: info } = animeInfo;
  const { id: currentId } = useParams();

  const tags = [
    { condition: info.tvInfo?.rating, text: info.tvInfo?.rating },
    { condition: info.tvInfo?.quality, text: info.tvInfo?.quality },
    { condition: info.tvInfo?.sub, icon: faClosedCaptioning, text: info.tvInfo?.sub },
    { condition: info.tvInfo?.dub, icon: faMicrophone, text: info.tvInfo?.dub },
  ];

  // ---------- JSX ----------
  return (
    <div className="relative min-h-screen text-white bg-[#0a0a0a]">
      {/* === BACKGROUND IMAGE LAYER === */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden z-0"
        style={{
          backgroundImage: `url(${poster})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(40px) brightness(0.4)",
          transform: "scale(1.2)",
        }}
      ></div>

      {/* Dark Overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90 z-0"></div>

      {/* === FOREGROUND CONTENT === */}
      <div className="relative z-10 container mx-auto mt-[74px] max-md:mt-[60px] py-10 px-3 sm:px-4">
        {/* Poster + Info */}
        <div className="flex flex-col md:flex-row md:gap-8 lg:gap-10 items-start">
          {/* Poster Section */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="relative w-[180px] sm:w-[220px] md:w-[260px] aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <img
                src={poster}
                alt={`${title} Poster`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {animeInfo.adultContent && (
                <div className="absolute top-3 left-3 px-2.5 py-0.5 bg-red-500/90 backdrop-blur-sm rounded-lg text-xs font-medium">
                  18+
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 mt-6 md:mt-0 space-y-4 lg:space-y-5">
            {/* Title */}
            <div className="space-y-1">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
                {language === "EN" ? title : japanese_title}
              </h1>
              {language === "EN" && japanese_title && (
                <p className="text-white/60 text-sm lg:text-base">
                  JP Title: {japanese_title}
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {tags.map(
                ({ condition, icon, text }, i) =>
                  condition && <Tag key={i} icon={icon} text={text} />
              )}
            </div>

            {/* Overview */}
            {info?.Overview && (
              <div className="text-gray-200 leading-relaxed max-w-3xl text-sm lg:text-base">
                {info.Overview.length > 270 ? (
                  <>
                    {isFull ? info.Overview : `${info.Overview.slice(0, 270)}...`}
                    <button
                      className="ml-2 text-white/70 hover:text-white transition-colors text-sm font-medium"
                      onClick={() => setIsFull(!isFull)}
                    >
                      {isFull ? "Show Less" : "Read More"}
                    </button>
                  </>
                ) : (
                  info.Overview
                )}
              </div>
            )}

            {/* Watch Button */}
            {animeInfo?.animeInfo?.Status?.toLowerCase() !== "not-yet-aired" ? (
              <Link
                to={`/watch/${animeInfo.id}`}
                className="inline-flex items-center px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-xl text-white transition-all duration-300 hover:bg-white/20 hover:scale-[1.03] group"
              >
                <FontAwesomeIcon
                  icon={faPlay}
                  className="mr-2 text-sm group-hover:text-white"
                />
                <span className="font-medium">Watch Now</span>
              </Link>
            ) : (
              <div className="inline-flex items-center px-5 py-2.5 bg-gray-700/50 rounded-xl">
                <span className="font-medium">Not released</span>
              </div>
            )}

            {/* Details */}
            <div className="space-y-4 py-4 backdrop-blur-md bg-white/5 rounded-xl px-5 border border-white/10 shadow-inner shadow-black/40">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Japanese", value: info?.Japanese },
                  { label: "Synonyms", value: info?.Synonyms },
                  { label: "Aired", value: info?.Aired },
                  { label: "Premiered", value: info?.Premiered },
                  { label: "Duration", value: info?.Duration },
                  { label: "Status", value: info?.Status },
                  { label: "MAL Score", value: info?.["MAL Score"] },
                ].map((item, index) => (
                  <InfoItem
                    key={index}
                    label={item.label}
                    value={item.value}
                    isProducer={false}
                  />
                ))}
              </div>

              {/* Genres */}
              {info?.Genres && (
                <div className="pt-3 border-t border-white/10">
                  <p className="text-gray-400 text-sm mb-2">Genres</p>
                  <div className="flex flex-wrap gap-1.5">
                    {info.Genres.map((genre, index) => (
                      <Link
                        to={`/genre/${genre.split(" ").join("-")}`}
                        key={index}
                        className="px-3 py-1 text-xs bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        {genre}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Studios & Producers */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                {[
                  { label: "Studios", value: info?.Studios },
                  { label: "Producers", value: info?.Producers },
                ].map((item, index) => (
                  <InfoItem key={index} label={item.label} value={item.value} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* === SEASONS === */}
        {seasons?.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">More Seasons</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {seasons.map((season, index) => (
                <Link
                  to={`/${season.id}`}
                  key={index}
                  className={`relative w-full aspect-[3/1] rounded-lg overflow-hidden group ${
                    currentId === String(season.id)
                      ? "ring-2 ring-white/40 shadow-lg shadow-white/10"
                      : ""
                  }`}
                >
                  <img
                    src={season.season_poster}
                    alt={season.season}
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-all"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-white text-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                      {season.season}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* === VOICE ACTORS === */}
        {animeInfo?.charactersVoiceActors?.length > 0 && (
          <div className="py-12">
            <Voiceactor animeInfo={animeInfo} />
          </div>
        )}

        {/* === RECOMMENDATIONS === */}
        {animeInfo.recommended_data?.length > 0 && (
          <div className="py-12">
            <CategoryCard
              label="Recommended for you"
              data={animeInfo.recommended_data}
              limit={animeInfo.recommended_data.length}
              showViewMore={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default AnimeInfo;
