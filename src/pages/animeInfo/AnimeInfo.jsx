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
import Sidecard from "@/src/components/sidecard/Sidecard";
import Loader from "@/src/components/Loader/Loader";
import Error from "@/src/components/error/Error";
import { useLanguage } from "@/src/context/LanguageContext";
import { useHomeInfo } from "@/src/context/HomeInfoContext";
import Voiceactor from "@/src/components/voiceactor/Voiceactor";

function InfoItem({ label, value, isProducer = true }) {
  return (
    value && (
      <div className="text-[11px] sm:text-[14px] font-medium">
        <span className="text-gray-400">{label}: </span>
        <span className="font-light text-white/90">
          {Array.isArray(value)
            ? value.map((item, i) => (
                <span key={i}>
                  {item}
                  {i < value.length - 1 && ", "}
                </span>
              ))
            : value}
        </span>
      </div>
    )
  );
}

function Tag({ icon, text }) {
  return (
    <div className="flex items-center px-2 sm:px-3 py-0.5 sm:py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] sm:text-[13px]">
      {icon && <FontAwesomeIcon icon={icon} className="mr-1 text-xs" />}
      {text}
    </div>
  );
}

function AnimeInfo({ random = false }) {
  const { language } = useLanguage();
  const { id: paramId } = useParams();
  const id = random ? null : paramId;
  const [isFull, setIsFull] = useState(false);
  const [animeInfo, setAnimeInfo] = useState(null);
  const [seasons, setSeasons] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id: currentId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnimeInfo = async () => {
      setLoading(true);
      try {
        const data = await getAnimeInfo(id, random);
        setAnimeInfo(data.data);
        setSeasons(data?.seasons);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnimeInfo();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, random]);

  useEffect(() => {
    if (animeInfo) {
      document.title = `Watch ${animeInfo.title} on ${website_name}`;
    }
    return () => {
      document.title = website_name;
    };
  }, [animeInfo]);

  if (loading) return <Loader type="animeInfo" />;
  if (error) return <Error />;
  if (!animeInfo) {
    navigate("/404-not-found-page");
    return null;
  }

  const { title, japanese_title, poster, animeInfo: info } = animeInfo;

  const tags = [
    info?.tvInfo?.rating,
    info?.tvInfo?.quality,
    info?.tvInfo?.sub && "SUB",
    info?.tvInfo?.dub && "DUB",
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative">

      {/* ===== BACKGROUND IMAGE ===== */}
      <div className="absolute inset-0 -z-10">
        <img
          src={poster}
          alt="background"
          className="w-full h-full object-cover scale-110 blur-2xl opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative z-10 container mx-auto mt-[74px] max-md:mt-[60px] py-6 bg-black/30 backdrop-blur-sm rounded-2xl">

        <div className="flex flex-col md:flex-row gap-6 lg:gap-10">

          {/* Poster */}
          <div className="flex-shrink-0">
            <div className="relative w-[180px] md:w-[240px] aspect-[2/3] rounded-xl overflow-hidden shadow-lg">
              <img src={poster} alt={title} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <h1 className="text-2xl lg:text-4xl font-bold">
              {language === "EN" ? title : japanese_title}
            </h1>

            {language === "EN" && japanese_title && (
              <p className="text-white/50 text-sm">JP: {japanese_title}</p>
            )}

            <div className="flex flex-wrap gap-2">
              {tags.map((t, i) => (
                <Tag key={i} text={t} />
              ))}
            </div>

            {info?.Overview && (
              <p className="text-gray-300 max-w-3xl">
                {isFull ? info.Overview : info.Overview.slice(0, 250) + "..."}
                <button
                  onClick={() => setIsFull(!isFull)}
                  className="ml-2 text-white/70 hover:text-white"
                >
                  {isFull ? "Show Less" : "Read More"}
                </button>
              </p>
            )}

            <Link
              to={`/watch/${animeInfo.id}`}
              className="inline-flex items-center px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20"
            >
              <FontAwesomeIcon icon={faPlay} className="mr-2" />
              Watch Now
            </Link>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
              <InfoItem label="Aired" value={info?.Aired} />
              <InfoItem label="Status" value={info?.Status} />
              <InfoItem label="Duration" value={info?.Duration} />
              <InfoItem label="Score" value={info?.["MAL Score"]} />
            </div>
          </div>
        </div>
      </div>

      {/* ===== SEASONS ===== */}
      {seasons?.length > 0 && (
        <div className="container mx-auto py-12">
          <h2 className="text-2xl font-bold mb-6">More Seasons</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {seasons.map((season) => (
              <Link
                key={season.id}
                to={`/${season.id}`}
                className={`relative aspect-[3/1] rounded-lg overflow-hidden ${
                  currentId === String(season.id)
                    ? "ring-2 ring-white/40"
                    : ""
                }`}
              >
                <img
                  src={season.season_poster}
                  alt={season.season}
                  className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <p className="font-bold">{season.season}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ===== VOICE ACTORS ===== */}
      {animeInfo?.charactersVoiceActors?.length > 0 && (
        <div className="container mx-auto py-12">
          <Voiceactor animeInfo={animeInfo} />
        </div>
      )}

      {/* ===== RECOMMENDATIONS ===== */}
      {animeInfo?.recommended_data?.length > 0 && (
        <div className="container mx-auto py-12">
          <CategoryCard
            label="Recommended for you"
            data={animeInfo.recommended_data}
            showViewMore={false}
          />
        </div>
      )}
    </div>
  );
}

export default AnimeInfo;
