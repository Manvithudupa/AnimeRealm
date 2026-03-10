/* eslint-disable react/prop-types */
import getAnimeInfo from "@/src/utils/getAnimeInfo.utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faClosedCaptioning,
  faMicrophone,
  faBookmark,
  faCheck,
  faStar,
  faCalendar,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import website_name from "@/src/config/website";
import CategoryCard from "@/src/components/categorycard/CategoryCard";
import OptimizedImage from "@/src/components/OptimizedImage";
import Loader from "@/src/components/Loader/Loader";
import Error from "@/src/components/error/Error";
import { useLanguage } from "@/src/context/LanguageContext";
import Voiceactor from "@/src/components/voiceactor/Voiceactor";
import { supabase } from "@/src/integrations/supabase/client";
import { useAuth } from "@/src/hooks/useAuth";
import Breadcrumb from "@/src/components/breadcrumb/Breadcrumb";

/* ------------------------------------------------------------------ */
/* Helper components                                                    */
/* ------------------------------------------------------------------ */

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-4 py-2.5 border-b border-white/5 last:border-0">
      <dt className="text-xs text-white/40 uppercase tracking-wider shrink-0">{label}</dt>
      <dd className="text-sm text-white/80 text-right max-w-[65%] leading-relaxed">{value}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Genre pill                                                            */
/* ------------------------------------------------------------------ */

const GENRE_COLORS = [
  "from-violet-600/30 to-violet-800/20 border-violet-500/30 text-violet-300",
  "from-blue-600/30 to-blue-800/20 border-blue-500/30 text-blue-300",
  "from-emerald-600/30 to-emerald-800/20 border-emerald-500/30 text-emerald-300",
  "from-rose-600/30 to-rose-800/20 border-rose-500/30 text-rose-300",
  "from-amber-600/30 to-amber-800/20 border-amber-500/30 text-amber-300",
  "from-cyan-600/30 to-cyan-800/20 border-cyan-500/30 text-cyan-300",
  "from-pink-600/30 to-pink-800/20 border-pink-500/30 text-pink-300",
  "from-indigo-600/30 to-indigo-800/20 border-indigo-500/30 text-indigo-300",
];

function GenrePill({ genre, index }) {
  const color = GENRE_COLORS[index % GENRE_COLORS.length];
  return (
    <Link
      to={`/genre/${genre}`}
      className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${color} border text-xs font-medium transition-all duration-200 hover:scale-105 hover:brightness-125`}
    >
      {genre}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Main component                                                        */
/* ------------------------------------------------------------------ */

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

  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  const [lastWatchedEpisode, setLastWatchedEpisode] = useState(null);
  const [isFullOverview, setIsFullOverview] = useState(false);

  /* -------- Fetch Anime -------- */
  useEffect(() => {
    const fetchAnime = async () => {
      setLoading(true);
      try {
        const data = await getAnimeInfo(id, random);
        setAnimeInfo(data.data);
        setSeasons(data.seasons || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnime();
    window.scrollTo(0, 0);
  }, [id, random]);

  /* -------- Page Title -------- */
  useEffect(() => {
    if (animeInfo) {
      document.title = `Watch ${animeInfo.title} on ${website_name}`;
    }
    return () => {
      document.title = `${website_name} | Free anime streaming`;
    };
  }, [animeInfo]);

  /* -------- Check Watchlist -------- */
  useEffect(() => {
    if (!user || !animeInfo) return;
    supabase
      .from("watchlists")
      .select("id")
      .eq("user_id", user.id)
      .eq("anime_id", animeInfo.id)
      .single()
      .then(({ data }) => setInWatchlist(!!data));
  }, [user, animeInfo]);

  /* -------- Toggle Watchlist -------- */
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

  /* -------- Load Last Watched Episode -------- */
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
      if (error) {
        setLastWatchedEpisode(null);
      } else if (data) {
        setLastWatchedEpisode({ id: data.episode_id, num: data.episode_num });
      } else {
        setLastWatchedEpisode(null);
      }
    };
    fetchLastWatched();
  }, [user, animeInfo]);

  if (loading) return <Loader type="animeInfo" />;
  if (error) return <Error />;
  if (!animeInfo) {
    navigate("/404-not-found-page");
    return null;
  }

  const { title, japanese_title, poster, animeInfo: info } = animeInfo;
  const currentId = animeInfo?.data_id || animeInfo?.id?.split("-").pop();
  const displayTitle = language === "EN" ? title : japanese_title || title;
  const genres = info?.Genres || info?.genres || [];
  const showType = info?.Type || info?.tvInfo?.showType;
  const studios = info?.Studios;
  const malScore = info?.["MAL Score"];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* =================== BREADCRUMB =================== */}
      <div className="pt-14">
        <Breadcrumb items={[{ label: displayTitle }]} />
      </div>

      {/* =================== HERO =================== */}
      <section className="relative overflow-hidden">
        {/* Blurred background */}
        <div className="absolute inset-0 h-[520px]">
          <OptimizedImage
            src={poster}
            alt={title}
            className="w-full h-full object-cover blur-xl scale-110 opacity-40"
            lazy={false}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/30 via-[#0a0a0a]/60 to-[#0a0a0a]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-[#0a0a0a]/60" />
        </div>

        {/* Hero content */}
        <div className="relative pt-10 pb-0 px-5 mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row gap-8 items-start">

            {/* Poster */}
            <div className="relative shrink-0 w-44 md:w-56 rounded-2xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/10">
              <OptimizedImage
                src={poster}
                alt={title}
                className="w-full aspect-[3/4] object-cover"
                lazy={false}
              />
              {/* Subtle shine */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            </div>

            {/* Info */}
            <div className="flex-1 pt-2 md:pt-6 min-w-0">
              {/* Type + Rating badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {showType && (
                  <span className="px-2.5 py-1 rounded-md bg-white/10 text-xs font-bold text-white/80 uppercase tracking-wider">
                    {showType}
                  </span>
                )}
                {info?.tvInfo?.rating && (
                  <span className="px-2.5 py-1 rounded-md bg-white/10 text-xs font-bold text-white/80 uppercase tracking-wider">
                    {info.tvInfo.rating}
                  </span>
                )}
                {info?.tvInfo?.quality && (
                  <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-xs font-bold text-blue-300 uppercase tracking-wider border border-blue-500/30">
                    {info.tvInfo.quality}
                  </span>
                )}
                {info?.Status && (() => {
                  const statusLower = info.Status.toLowerCase();
                  const statusClass = statusLower.includes("airing") && !statusLower.includes("finished")
                    ? "bg-green-500/20 text-green-300 border border-green-500/30"
                    : statusLower.includes("not")
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                    : "bg-white/5 text-white/50 border border-white/10";
                  return (
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${statusClass}`}>
                      {info.Status}
                    </span>
                  );
                })()}
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-black mb-2 leading-tight tracking-tight">
                {language === "EN" ? title : japanese_title || title}
              </h1>
              {japanese_title && language === "EN" && (
                <p className="text-sm text-white/40 mb-5 font-light">{japanese_title}</p>
              )}

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {malScore && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/25">
                    <FontAwesomeIcon icon={faStar} className="text-amber-400 text-xs" />
                    <span className="text-sm font-bold text-amber-300">{malScore}</span>
                  </div>
                )}
                {info?.tvInfo?.sub != null && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                    <FontAwesomeIcon icon={faClosedCaptioning} className="text-green-400 text-xs" />
                    <span className="text-xs font-semibold text-green-300">SUB {info.tvInfo.sub}</span>
                  </div>
                )}
                {info?.tvInfo?.dub != null && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <FontAwesomeIcon icon={faMicrophone} className="text-blue-400 text-xs" />
                    <span className="text-xs font-semibold text-blue-300">DUB {info.tvInfo.dub}</span>
                  </div>
                )}
                {info?.Duration && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <FontAwesomeIcon icon={faClock} className="text-white/40 text-xs" />
                    <span className="text-xs font-medium text-white/60">{info.Duration}</span>
                  </div>
                )}
                {info?.Premiered && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <FontAwesomeIcon icon={faCalendar} className="text-white/40 text-xs" />
                    <span className="text-xs font-medium text-white/60">{info.Premiered}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                {info?.Status?.toLowerCase() !== "not-yet-aired" && (
                  <Link
                    to={
                      lastWatchedEpisode
                        ? `/watch/${animeInfo.id}?ep=${lastWatchedEpisode.id}`
                        : `/watch/${animeInfo.id}`
                    }
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-white/90 active:scale-95 transition-all duration-200 shadow-lg shadow-white/10"
                  >
                    <FontAwesomeIcon icon={faPlay} className="text-xs" />
                    {lastWatchedEpisode
                      ? `Continue · Ep ${lastWatchedEpisode.num}`
                      : "Watch Now"}
                  </Link>
                )}
                <button
                  onClick={toggleWatchlist}
                  disabled={watchlistLoading}
                  className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 border ${
                    inWatchlist
                      ? "bg-white/10 border-white/20 text-white hover:bg-white/15"
                      : "bg-transparent border-white/20 text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <FontAwesomeIcon icon={inWatchlist ? faCheck : faBookmark} className="text-xs" />
                  {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
                </button>
              </div>

              {/* Genres */}
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre, i) => (
                    <GenrePill key={i} genre={genre} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =================== SYNOPSIS + INFO =================== */}
      <section className="py-12 px-5 mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Synopsis */}
          <div className="lg:col-span-2">
            <h2 className="text-xs uppercase tracking-widest text-white/40 mb-4 font-semibold">Synopsis</h2>
            <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.07]">
              <p className="text-white/70 leading-relaxed text-sm md:text-[15px]">
                {info?.Overview ? (
                  info.Overview.length > 300 ? (
                    <>
                      {isFullOverview ? info.Overview : `${info.Overview.slice(0, 300)}...`}
                      <button
                        className="ml-2 text-white/50 hover:text-white text-sm font-medium transition-colors duration-200 underline underline-offset-2"
                        onClick={() => setIsFullOverview(!isFullOverview)}
                      >
                        {isFullOverview ? "Show Less" : "Read More"}
                      </button>
                    </>
                  ) : (
                    info.Overview
                  )
                ) : (
                  <span className="text-white/30 italic">No description available.</span>
                )}
              </p>
            </div>

            {/* Studio row (below synopsis on large screens) */}
            {studios && (
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="text-white/30 uppercase tracking-wider text-xs">Studio</span>
                <span className="text-white/60 font-medium">{studios}</span>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-1">
            <h2 className="text-xs uppercase tracking-widest text-white/40 mb-4 font-semibold">Details</h2>
            <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.07] space-y-1">
              <dl>
                <InfoRow label="Type" value={showType} />
                <InfoRow label="Japanese" value={info?.Japanese} />
                <InfoRow label="Synonyms" value={info?.Synonyms} />
                <InfoRow label="Aired" value={info?.Aired} />
                <InfoRow label="Premiered" value={info?.Premiered} />
                <InfoRow label="Duration" value={info?.Duration} />
                <InfoRow label="Status" value={info?.Status} />
                <InfoRow label="MAL Score" value={malScore} />
                <InfoRow label="Studios" value={studios} />
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* =================== SEASONS =================== */}
      {seasons?.length > 0 && (
        <section className="py-8 px-5 mx-auto max-w-7xl">
          <h2 className="text-lg font-bold mb-5 text-white/90">More Seasons</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {seasons.map((season, index) => (
              <Link
                to={`/${season.id}`}
                key={index}
                className={`relative w-full aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group hover:scale-[1.03] transition-transform duration-200 ${
                  currentId === String(season.data_id)
                    ? "ring-2 ring-white/50 shadow-lg shadow-white/10"
                    : "ring-1 ring-white/10"
                }`}
              >
                <img
                  src={season.season_poster}
                  alt={season.season}
                  className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                    currentId === String(season.data_id) ? "opacity-60" : "opacity-50 group-hover:opacity-70"
                  }`}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                {/* Active indicator */}
                {currentId === String(season.data_id) && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white shadow-md shadow-white/50" />
                )}
                {/* Title */}
                <div className="absolute bottom-0 inset-x-0 p-3">
                  <p className="text-xs font-semibold text-white leading-tight line-clamp-2">
                    {season.season}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* =================== VOICE ACTORS =================== */}
      {animeInfo?.anilistId && (
        <div className="px-5 mx-auto max-w-7xl py-8">
          <Voiceactor anilistId={animeInfo.anilistId} />
        </div>
      )}

      {/* =================== RECOMMENDATIONS =================== */}
      {animeInfo?.recommended_data?.length > 0 && (
        <CategoryCard label="You May Also Like" data={animeInfo.recommended_data} showViewMore={false} />
      )}
    </div>
  );
}

export default AnimeInfo;
