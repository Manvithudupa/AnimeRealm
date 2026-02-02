import getAnimeInfo from "@/src/utils/getAnimeInfo.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faClosedCaptioning,
  faMicrophone,
  faBookmark,
  faCheck,
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
import { supabase } from "@/src/integrations/supabase/client";
import { useAuth } from "@/src/hooks/useAuth";

/* ---------------- Info Row ---------------- */
function InfoItem({ label, value, isProducer = true }) {
  if (!value) return null;
  return (
    <div className="text-[11px] sm:text-[14px] font-medium transition-all duration-300">
      <span className="text-gray-400">{`${label}: `}</span>
      <span className="font-light text-white/90">
        {Array.isArray(value)
          ? value.map((item, index) =>
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
          : isProducer ? (
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
  );
}

/* ---------------- Tag ---------------- */
function Tag({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-xs text-white/70">
      {icon && <FontAwesomeIcon icon={icon} className="text-xs" />}
      {text}
    </span>
  );
}

function AnimeInfo({ random = false }) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { id: paramId } = useParams();
  const { homeInfo } = useHomeInfo();
  const navigate = useNavigate();

  const id = random ? null : paramId;
  const currentId = paramId;

  const [animeInfo, setAnimeInfo] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullOverview, setIsFullOverview] = useState(false);

  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [lastWatchedEpisode, setLastWatchedEpisode] = useState(null);

  /* ---------- Fetch Anime ---------- */
  useEffect(() => {
    if (id === "404-not-found-page") return;

    const fetchAnimeInfo = async () => {
      setLoading(true);
      try {
        const data = await getAnimeInfo(id, random);
        setAnimeInfo(data?.data || null);
        setSeasons(data?.seasons || []);
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

  /* ---------- Page Title ---------- */
  useEffect(() => {
    if (animeInfo) {
      document.title = `Watch ${animeInfo.title} on ${website_name}`;
    }
    return () => {
      document.title = `${website_name} | Free anime streaming platform`;
    };
  }, [animeInfo]);

  /* ---------- Check Watchlist ---------- */
  useEffect(() => {
    if (!user || !animeInfo) return;

    const checkWatchlist = async () => {
      const { data, error } = await supabase
        .from("watchlists")
        .select("id")
        .eq("user_id", user.id)
        .eq("anime_id", animeInfo.id)
        .single();

      if (!error) setInWatchlist(!!data);
    };

    checkWatchlist();
  }, [user, animeInfo]);

  /* ---------- Toggle Watchlist ---------- */
  const toggleWatchlist = async () => {
    if (!user) return navigate("/auth");

    setWatchlistLoading(true);
    if (inWatchlist) {
      await supabase
        .from("watchlists")
        .delete()
        .eq("user_id", user.id)
        .eq("anime_id", animeInfo.id);
      setInWatchlist(false);
    } else {
      await supabase.from("watchlists").insert({
        user_id: user.id,
        anime_id: animeInfo.id,
        anime_title: animeInfo.title,
        anime_poster: animeInfo.poster,
      });
      setInWatchlist(true);
    }
    setWatchlistLoading(false);
  };

  /* ---------- Load Last Watched Episode ---------- */
  useEffect(() => {
    if (!user || !animeInfo) return;

    const fetchLastWatched = async () => {
      const { data, error } = await supabase
        .from("continue_watching")
        .select("episode_id, episode_num")
        .eq("user_id", user.id)
        .eq("anime_id", animeInfo.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();

      if (!error && data) setLastWatchedEpisode({ id: data.episode_id, num: data.episode_num });
    };

    fetchLastWatched();
  }, [user, animeInfo]);

  /* ---------- Handle missing anime ---------- */
  useEffect(() => {
    if (!loading && !animeInfo) navigate("/404-not-found-page");
  }, [loading, animeInfo, navigate]);

  if (loading) return <Loader type="animeInfo" />;
  if (error) return <Error />;
  if (!animeInfo) return null;

  const { title, japanese_title, poster, animeInfo: info } = animeInfo;

  const tags = [
    info?.tvInfo?.rating && { text: info.tvInfo.rating },
    info?.tvInfo?.quality && { text: info.tvInfo.quality },
    info?.tvInfo?.sub && { icon: faClosedCaptioning, text: info.tvInfo.sub },
    info?.tvInfo?.dub && { icon: faMicrophone, text: info.tvInfo.dub },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="relative w-full overflow-hidden mt-[74px] max-md:mt-[60px]">
        {/* Main Content */}
        <div className="relative z-10 container mx-auto py-4 sm:py-6 lg:py-12">
          {/* Mobile Layout */}
          <div className="block md:hidden">
            <div className="flex flex-row gap-4">
              {/* Poster Section */}
              <div className="flex-shrink-0">
                <div className="relative w-[130px] xs:w-[150px] aspect-[2/3] rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                  <img src={poster} alt={`${title} Poster`} className="w-full h-full object-cover" />
                  {animeInfo.adultContent && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500/90 backdrop-blur-sm rounded-md text-[10px] font-medium">
                      18+
                    </div>
                  )}
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 min-w-0 space-y-2">
                <h1 className="text-lg xs:text-xl font-bold tracking-tight truncate">
                  {language === "EN" ? title : japanese_title}
                </h1>
                {language === "EN" && japanese_title && (
                  <p className="text-white/50 text-[11px] xs:text-xs truncate">JP Title: {japanese_title}</p>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag, index) => (
                    <Tag key={index} icon={tag.icon} text={tag.text} />
                  ))}
                </div>
              </div>
            </div>

            {/* Watch Button */}
            <div className="mt-6">
              {info?.Status?.toLowerCase() !== "not-yet-aired" && (
                <Link to={`/watch/${animeInfo.id}`} className="flex justify-center items-center w-full px-4 py-3 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 transition">
                  <FontAwesomeIcon icon={faPlay} className="mr-2 text-xs" />
                  Watch Now
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Seasons Section */}
      {seasons.length > 0 && (
        <div className="container mx-auto py-8 sm:py-12">
          <h2 className="text-2xl font-bold mb-6 sm:mb-8 px-1">More Seasons</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {seasons.map((season, index) => (
              <Link
                to={`/${season.id}`}
                key={index}
                className={`relative w-full aspect-[3/1] sm:aspect-[3/1] rounded-lg overflow-hidden cursor-pointer group ${
                  currentId === String(season.id) ? "ring-2 ring-white/40 shadow-lg shadow-white/10" : ""
                }`}
              >
                <img
                  src={season.season_poster}
                  alt={season.season}
                  className={`w-full h-full object-cover scale-150 ${
                    currentId === String(season.id) ? "opacity-50" : "opacity-40"
                  }`}
                />
                <div className="absolute inset-0 z-10" style={{ backgroundImage: `url('data:image/svg+xml,<svg width="3" height="3" viewBox="0 0 3 3" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="1.5" cy="1.5" r="0.5" fill="white" fill-opacity="0.25"/></svg>')`, backgroundSize: '3px 3px' }} />
                <div className={`absolute inset-0 z-20 bg-gradient-to-r ${currentId === String(season.id) ? "from-black/50 to-transparent" : "from-black/40 to-transparent"}`} />
                <div className="absolute inset-0 z-30 flex items-center justify-center">
                  <p className={`text-[14px] sm:text-[16px] md:text-[18px] font-bold text-center px-2 sm:px-4 ${currentId === String(season.id) ? "text-white" : "text-white/90 group-hover:text-white"}`}>
                    {season.season}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Voice Actors */}
      {animeInfo?.charactersVoiceActors?.length > 0 && (
        <div className="container mx-auto py-12">
          <Voiceactor animeInfo={animeInfo} />
        </div>
      )}

      {/* Recommendations */}
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
