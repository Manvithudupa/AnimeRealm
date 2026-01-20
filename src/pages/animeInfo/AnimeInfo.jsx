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

function Tag({ icon, text }) {
  return (
    <div className="flex items-center px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs">
      {icon && <FontAwesomeIcon icon={icon} className="mr-1 text-[11px]" />}
      {text}
    </div>
  );
}

function InfoItem({ label, value }) {
  if (!value) return null;
  return (
    <div className="text-sm">
      <span className="text-gray-400">{label}: </span>
      <span className="text-white/90">{value}</span>
    </div>
  );
}

function AnimeInfo({ random = false }) {
  const { language } = useLanguage();
  const { id: paramId } = useParams();
  const id = random ? null : paramId;
  const [animeInfo, setAnimeInfo] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
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
    fetchData();
    window.scrollTo({ top: 0 });
  }, [id, random]);

  useEffect(() => {
    if (animeInfo) {
      document.title = `${animeInfo.title} | ${website_name}`;
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

  return (
    <div className="bg-[#0a0a0a] text-white">

      {/* ================= HERO SECTION ================= */}
      <div className="relative w-full h-[520px] md:h-[580px] overflow-hidden mt-[74px] max-md:mt-[60px]">

        {/* Background */}
        <img
          src={poster}
          alt="background"
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-50"
        />

        {/* Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />

        {/* Content */}
        <div className="relative z-10 container mx-auto h-full flex items-center">
          <div className="flex gap-6 lg:gap-10">

            {/* Poster */}
            <div className="hidden sm:block">
              <div className="w-[220px] aspect-[2/3] rounded-xl overflow-hidden shadow-lg">
                <img
                  src={poster}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="max-w-3xl space-y-4">
              <h1 className="text-3xl lg:text-4xl font-bold">
                {language === "EN" ? title : japanese_title}
              </h1>

              {language === "EN" && japanese_title && (
                <p className="text-white/50 text-sm">
                  JP: {japanese_title}
                </p>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {info?.tvInfo?.rating && <Tag text={info.tvInfo.rating} />}
                {info?.tvInfo?.quality && <Tag text={info.tvInfo.quality} />}
                {info?.tvInfo?.sub && (
                  <Tag icon={faClosedCaptioning} text="SUB" />
                )}
                {info?.tvInfo?.dub && (
                  <Tag icon={faMicrophone} text="DUB" />
                )}
              </div>

              {/* Synopsis */}
              {info?.Overview && (
                <p className="text-gray-300 text-sm leading-relaxed line-clamp-4">
                  {info.Overview}
                </p>
              )}

              {/* Watch Button */}
              {info?.Status?.toLowerCase() !== "not-yet-aired" && (
                <Link
                  to={`/watch/${animeInfo.id}`}
                  className="inline-flex items-center px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-xl hover:bg-white/20 transition"
                >
                  <FontAwesomeIcon icon={faPlay} className="mr-2 text-sm" />
                  Watch Now
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* ================= END HERO ================= */}

      {/* ================= DETAILS ================= */}
      <div className="container mx-auto py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InfoItem label="Aired" value={info?.Aired} />
          <InfoItem label="Status" value={info?.Status} />
          <InfoItem label="Duration" value={info?.Duration} />
          <InfoItem label="Score" value={info?.["MAL Score"]} />
        </div>
      </div>

      {/* ================= VOICE ACTORS ================= */}
      {animeInfo?.charactersVoiceActors?.length > 0 && (
        <div className="container mx-auto py-12">
          <Voiceactor animeInfo={animeInfo} />
        </div>
      )}

      {/* ================= RECOMMENDATIONS ================= */}
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
