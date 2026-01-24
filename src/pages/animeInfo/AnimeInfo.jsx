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

/* ---------------- Info Row ---------------- */
function InfoItem({ label, value, isProducer = true }) {
  if (!value) return null;

  return (
    <div className="text-[11px] sm:text-[14px]">
      <span className="text-white/50">{label}: </span>
      <span className="text-white/90 hover:text-white transition">
        {Array.isArray(value)
          ? value.join(", ")
          : value}
      </span>
    </div>
  );
}

/* ---------------- Tags ---------------- */
function Tag({ icon, text }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5
      rounded-md bg-black/60 backdrop-blur-md
      text-white text-[11px] sm:text-[13px]
      font-semibold hover:bg-black/80 transition">
      {icon && <FontAwesomeIcon icon={icon} className="text-[11px]" />}
      <span>{text}</span>
    </div>
  );
}

function AnimeInfo({ random = false }) {
  const { language } = useLanguage();
  const { id: paramId } = useParams();
  const id = random ? null : paramId;
  const navigate = useNavigate();

  const [animeInfo, setAnimeInfo] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFull, setIsFull] = useState(false);

  const { id: currentId } = useParams();

  useEffect(() => {
    const fetchAnime = async () => {
      setLoading(true);
      try {
        const data = await getAnimeInfo(id, random);
        setAnimeInfo(data.data);
        setSeasons(data?.seasons || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnime();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, random]);

  useEffect(() => {
    if (animeInfo) {
      document.title = `Watch ${animeInfo.title} on ${website_name}`;
    }
    return () => {
      document.title = `${website_name} | Free anime streaming`;
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
    info.tvInfo?.rating,
    info.tvInfo?.quality,
    info.tvInfo?.sub && { icon: faClosedCaptioning, text: info.tvInfo.sub },
    info.tvInfo?.dub && { icon: faMicrophone, text: info.tvInfo.dub },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white mt-[74px]">

      {/* ---------- MAIN ---------- */}
      <div className="container mx-auto py-10 animate-fadeIn">

        <div className="flex flex-col md:flex-row gap-8">

          {/* Poster */}
          <div className="group w-[220px] shrink-0">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-lg">
              <img
                src={poster}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {animeInfo.adultContent && (
                <div className="absolute top-3 left-3 bg-red-600 text-xs px-2 py-0.5 rounded-md">
                  18+
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-5">

            {/* Title */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold truncate">
                {language === "EN" ? title : japanese_title}
              </h1>
              {language === "EN" && japanese_title && (
                <p className="text-white/50 text-sm mt-1">🇯🇵 {japanese_title}</p>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) =>
                typeof tag === "string" ? (
                  <Tag key={i} text={tag} />
                ) : (
                  <Tag key={i} icon={tag.icon} text={tag.text} />
                )
              )}
            </div>

            {/* Overview */}
            {info?.Overview && (
              <p className="text-gray-300 leading-[1.65] tracking-[0.01em] max-w-2xl">
                {info.Overview.length > 270 && !isFull
                  ? `${info.Overview.slice(0, 270)}...`
                  : info.Overview}
                {info.Overview.length > 270 && (
                  <button
                    onClick={() => setIsFull(!isFull)}
                    className="ml-2 text-white/70 hover:text-white"
                  >
                    {isFull ? "Show Less" : "Read More"}
                  </button>
                )}
              </p>
            )}

            {/* Watch Button */}
            {info?.Status?.toLowerCase() !== "not-yet-aired" ? (
              <Link
                to={`/watch/${animeInfo.id}`}
                className="inline-flex items-center px-6 py-2.5
                bg-gradient-to-r from-purple-600 to-purple-500
                hover:from-purple-500 hover:to-purple-400
                rounded-xl text-white font-semibold
                shadow-lg shadow-purple-500/30
                transition hover:scale-[1.03]">
                <FontAwesomeIcon icon={faPlay} className="mr-2 text-sm" />
                Watch Now
              </Link>
            ) : (
              <div className="px-6 py-2.5 bg-gray-700/50 rounded-xl">
                Not released
              </div>
            )}

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 bg-white/5 backdrop-blur-md p-5 rounded-xl">
              <InfoItem label="Japanese" value={info?.Japanese} />
              <InfoItem label="Synonyms" value={info?.Synonyms} />
              <InfoItem label="Aired" value={info?.Aired} />
              <InfoItem label="Premiered" value={info?.Premiered} />
              <InfoItem label="Duration" value={info?.Duration} />
              <InfoItem label="Status" value={info?.Status} />
              <InfoItem label="MAL Score" value={info?.["MAL Score"]} />
            </div>
          </div>
        </div>
      </div>

      {/* ---------- SEASONS ---------- */}
      {seasons.length > 0 && (
        <div className="container mx-auto py-10">
          <h2 className="text-2xl font-bold mb-6">More Seasons</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {seasons.map((season) => (
              <Link
                to={`/${season.id}`}
                key={season.id}
                className={`relative aspect-[3/1] rounded-lg overflow-hidden group
                ${
                  currentId === String(season.id)
                    ? "ring-2 ring-purple-500 shadow-purple-500/30"
                    : ""
                }`}
              >
                <img
                  src={season.season_poster}
                  alt={season.season}
                  className="w-full h-full object-cover opacity-40 scale-150"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                <p className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                  {season.season}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ---------- VOICE ACTORS ---------- */}
      {animeInfo?.charactersVoiceActors?.length > 0 && (
        <div className="container mx-auto py-12">
          <Voiceactor animeInfo={animeInfo} />
        </div>
      )}

      {/* ---------- RECOMMENDATIONS ---------- */}
      {animeInfo?.recommended_data?.length > 0 && (
        <div className="container mx-auto py-12">
          <CategoryCard
            label="Recommended for you"
            data={animeInfo.recommended_data}
            limit={animeInfo.recommended_data.length}
            showViewMore={false}
          />
        </div>
      )}
    </div>
  );
}

export default AnimeInfo;
