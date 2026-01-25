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
import Loader from "@/src/components/Loader/Loader";
import Error from "@/src/components/error/Error";
import { useLanguage } from "@/src/context/LanguageContext";
import Voiceactor from "@/src/components/voiceactor/Voiceactor";
import { supabase } from "@/src/integrations/supabase/client";
import { useAuth } from "@/src/hooks/useAuth";

/* ---------------- Info Row ---------------- */
function InfoItem({ label, value }) {
  if (!value) return null;

  return (
    <div className="text-sm space-x-1">
      <span className="text-white/50">{label}:</span>
      <span className="text-white/90">{value}</span>
    </div>
  );
}

/* ---------------- Tags ---------------- */
function Tag({ icon, text }) {
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1 rounded-full
      bg-white/10 backdrop-blur-md text-sm font-medium
      hover:bg-white/20 transition"
    >
      {icon && <FontAwesomeIcon icon={icon} className="text-xs" />}
      {text}
    </div>
  );
}

function AnimeInfo({ random = false }) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { id: paramId } = useParams();
  const navigate = useNavigate();

  const id = random ? null : paramId;

  const [animeInfo, setAnimeInfo] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFull, setIsFull] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  const { id: currentId } = useParams();

  /* ---------- Fetch Anime ---------- */
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
    window.scrollTo(0, 0);
  }, [id, random]);

  /* ---------- Page Title ---------- */
  useEffect(() => {
    if (animeInfo) {
      document.title = `Watch ${animeInfo.title} on ${website_name}`;
    }

    return () => {
      document.title = `${website_name} | Free anime streaming`;
    };
  }, [animeInfo]);

  /* ---------- Check Watchlist ---------- */
  useEffect(() => {
    if (!user || !animeInfo) return;

    supabase
      .from("watchlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("anime_id", animeInfo.id)
      .single()
      .then(({ data }) => {
        setInWatchlist(!!data);
      });
  }, [user, animeInfo]);

  /* ---------- Toggle Watchlist ---------- */
  const toggleWatchlist = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

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
    <div className="min-h-screen bg-[#050505] text-white">

      {/* ---------- HERO ---------- */}
      <div className="relative h-[450px] overflow-hidden">

        {/* Background */}
        <img
          src={poster}
          className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-30"
          alt=""
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/20" />

        {/* Content */}
        <div className="relative container mx-auto px-5 h-full flex items-end pb-12">

          <div className="flex flex-col md:flex-row gap-8 items-end">

            {/* Poster */}
            <div className="w-[220px] shrink-0">
              <img
                src={poster}
                alt={title}
                className="rounded-2xl shadow-2xl"
              />
            </div>

            {/* Text */}
            <div className="space-y-4 max-w-2xl">

              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                {language === "EN" ? title : japanese_title}
              </h1>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) =>
                  typeof tag === "string" ? (
                    <Tag key={i} text={tag} />
                  ) : (
                    <Tag key={i} icon={tag.icon} text={tag.text} />
                  )
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-2">

                {info?.Status?.toLowerCase() !== "not-yet-aired" && (
                  <Link
                    to={`/watch/${animeInfo.id}`}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl
                    bg-purple-600 hover:bg-purple-500
                    font-semibold shadow-lg transition"
                  >
                    <FontAwesomeIcon icon={faPlay} />
                    Watch Now
                  </Link>
                )}

                <button
                  onClick={toggleWatchlist}
                  disabled={watchlistLoading}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold
                  transition ${
                    inWatchlist
                      ? "bg-green-600 hover:bg-green-500"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  <FontAwesomeIcon
                    icon={inWatchlist ? faCheck : faBookmark}
                  />
                  {inWatchlist ? "In Watchlist" : "Add"}
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- CONTENT ---------- */}
      <div className="container mx-auto px-5 py-12 space-y-12">

        {/* Overview */}
        {info?.Overview && (
          <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-lg p-6 rounded-2xl">

            <h2 className="text-xl font-semibold mb-3">Overview</h2>

            <p className="text-gray-300 leading-relaxed">

              {info.Overview.length > 300 && !isFull
                ? `${info.Overview.slice(0, 300)}...`
                : info.Overview}

              {info.Overview.length > 300 && (
                <button
                  onClick={() => setIsFull(!isFull)}
                  className="ml-2 text-purple-400 hover:text-purple-300"
                >
                  {isFull ? "Show Less" : "Read More"}
                </button>
              )}
            </p>
          </div>
        )}

        {/* Details */}
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-4
          bg-white/5 backdrop-blur-lg p-6 rounded-2xl">

          <InfoItem label="Japanese" value={info?.Japanese} />
          <InfoItem label="Synonyms" value={info?.Synonyms} />
          <InfoItem label="Aired" value={info?.Aired} />
          <InfoItem label="Premiered" value={info?.Premiered} />
          <InfoItem label="Duration" value={info?.Duration} />
          <InfoItem label="Status" value={info?.Status} />
          <InfoItem label="MAL Score" value={info?.["MAL Score"]} />

        </div>

        {/* Seasons */}
        {seasons.length > 0 && (
          <div>

            <h2 className="text-2xl font-bold mb-5">More Seasons</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">

              {seasons.map((season) => (
                <Link
                  to={`/${season.id}`}
                  key={season.id}
                  className={`relative h-[90px] rounded-xl overflow-hidden
                  group ${
                    currentId === String(season.id)
                      ? "ring-2 ring-purple-500"
                      : ""
                  }`}
                >
                  <img
                    src={season.season_poster}
                    alt={season.season}
                    className="w-full h-full object-cover scale-125 opacity-40
                    group-hover:scale-110 transition"
                  />

                  <div className="absolute inset-0 flex items-center justify-center
                    font-bold text-lg">
                    {season.season}
                  </div>
                </Link>
              ))}

            </div>
          </div>
        )}

        {/* Voice Actors */}
        {animeInfo?.charactersVoiceActors?.length > 0 && (
          <Voiceactor animeInfo={animeInfo} />
        )}

        {/* Recommendations */}
        {animeInfo?.recommended_data?.length > 0 && (
          <CategoryCard
            label="Recommended for you"
            data={animeInfo.recommended_data}
            showViewMore={false}
          />
        )}

      </div>
    </div>
  );
}

export default AnimeInfo;
