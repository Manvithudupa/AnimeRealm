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
  faChevronDown,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import website_name from "@/src/config/website";
import CategoryCard from "@/src/components/categorycard/CategoryCard";
import OptimizedImage from "@/src/components/OptimizedImage/OptimizedImage";
import Loader from "@/src/components/Loader/Loader";
import Error from "@/src/components/error/Error";
import { useLanguage } from "@/src/context/LanguageContext";
import Voiceactor from "@/src/components/voiceactor/Voiceactor";
import { supabase } from "@/src/integrations/supabase/client";
import { useAuth } from "@/src/hooks/useAuth";
import Breadcrumb from "@/src/components/breadcrumb/Breadcrumb";

/* ------------------------------------------------------------------ */
/* Watchlist status config                                              */
/* ------------------------------------------------------------------ */

const WATCHLIST_STATUSES = [
  { value: "watching",      label: "Watching",      color: "text-green-400",  bg: "hover:bg-green-500/20" },
  { value: "plan_to_watch", label: "Plan to Watch", color: "text-blue-400",   bg: "hover:bg-blue-500/20" },
  { value: "completed",     label: "Completed",     color: "text-purple-400", bg: "hover:bg-purple-500/20" },
  { value: "on_hold",       label: "On Hold",       color: "text-yellow-400", bg: "hover:bg-yellow-500/20" },
  { value: "dropped",       label: "Dropped",       color: "text-red-400",    bg: "hover:bg-red-500/20" },
];

function statusLabel(value) {
  return WATCHLIST_STATUSES.find((s) => s.value === value)?.label ?? "Add to Watchlist";
}

function statusColor(value) {
  return WATCHLIST_STATUSES.find((s) => s.value === value)?.color ?? "";
}

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
  const [watchlistStatus, setWatchlistStatus] = useState(null);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
      .select("id, status")
      .eq("user_id", user.id)
      .eq("anime_id", animeInfo.id)
      .single()
      .then(({ data }) => {
        setInWatchlist(!!data);
        setWatchlistStatus(data?.status ?? null);
      });
  }, [user, animeInfo]);

  /* -------- Close dropdown on outside click -------- */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* -------- Set / Change Watchlist Status -------- */
  const setWatchlistEntry = async (status) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setWatchlistLoading(true);
    setStatusDropdownOpen(false);
    if (!inWatchlist) {
      await supabase.from("watchlists").insert({
        user_id: user.id,
        anime_id: animeInfo.id,
        anime_title: animeInfo.title,
        anime_poster: animeInfo.poster,
        status,
      });
      setInWatchlist(true);
      setWatchlistStatus(status);
    } else {
      await supabase
        .from("watchlists")
        .update({ status })
        .eq("user_id", user.id)
        .eq("anime_id", animeInfo.id);
      setWatchlistStatus(status);
    }
    setWatchlistLoading(false);
  };

  /* -------- Remove from Watchlist -------- */
  const removeFromWatchlist = async () => {
    setWatchlistLoading(true);
    setStatusDropdownOpen(false);
    await supabase
      .from("watchlists")
      .delete()
      .eq("user_id", user.id)
      .eq("anime_id", animeInfo.id);
    setInWatchlist(false);
    setWatchlistStatus(null);
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

  const { title, japanese_title, poster, bannerImage, animeInfo: info } = animeInfo;
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

      {/* ================= HERO ================= */}
      <section className="relative pt-14">
        <div className="relative h-[50vh] overflow-hidden bg-gradient-to-b from-gray-900 to-black">
          <div className="absolute inset-0">
            <OptimizedImage
              src={bannerImage || poster}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              lazy={false}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        </div>

        {/* Info */}
        <div className="relative -mt-32 mx-auto max-w-7xl px-5">
          <div className="flex flex-col md:flex-row gap-6">

            {/* Poster */}
            <div className="relative w-40 md:w-52 aspect-[3/4] rounded-xl overflow-hidden shadow-xl shrink-0 hover:shadow-2xl transition-shadow duration-300">
              <OptimizedImage
                src={poster}
                alt={title}
                className="w-full h-full object-cover"
                lazy={false}
              />
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
                {/* Watchlist Dropdown Button */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => {
                      if (!user) { navigate("/auth"); return; }
                      setStatusDropdownOpen((prev) => !prev);
                    }}
                    disabled={watchlistLoading}
                    className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 border ${
                      inWatchlist
                        ? "bg-white/10 border-white/20 text-white hover:bg-white/15"
                        : "bg-transparent border-white/20 text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <FontAwesomeIcon icon={inWatchlist ? faCheck : faBookmark} className="text-xs" />
                    <span className={inWatchlist ? statusColor(watchlistStatus) : ""}>
                      {inWatchlist ? statusLabel(watchlistStatus) : "Add to Watchlist"}
                    </span>
                    <FontAwesomeIcon icon={faChevronDown} className={`text-xs transition-transform ${statusDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {statusDropdownOpen && (
                    <div className="absolute left-0 top-full mt-2 w-52 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-2xl z-50 overflow-hidden">
                      {WATCHLIST_STATUSES.map((s) => (
                        <button
                          key={s.value}
                          onClick={() => setWatchlistEntry(s.value)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                            watchlistStatus === s.value
                              ? "bg-white/10 font-semibold"
                              : `text-white/80 ${s.bg}`
                          }`}
                        >
                          {watchlistStatus === s.value && (
                            <FontAwesomeIcon icon={faCheck} className={`text-xs ${s.color}`} />
                          )}
                          <span className={watchlistStatus === s.value ? s.color : ""}>{s.label}</span>
                        </button>
                      ))}
                      {inWatchlist && (
                        <>
                          <div className="h-px bg-white/10 mx-3" />
                          <button
                            onClick={removeFromWatchlist}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
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

      {/* Seasons Section */}
      {seasons?.length > 0 && (
        <div className="container mx-auto py-8 sm:py-12">
          <h2 className="text-2xl font-bold mb-6 sm:mb-8 px-1">More Seasons</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {seasons.map((season, index) => (
              <Link
                to={`/${season.id}`}
                key={index}
                className={`relative w-full aspect-[3/1] sm:aspect-[3/1] rounded-lg overflow-hidden cursor-pointer group ${
                  currentId === String(season.data_id)
                    ? "ring-2 ring-white/40 shadow-lg shadow-white/10"
                    : ""
                }`}
              >
                <img
                  src={season.season_poster}
                  alt={season.season}
                  className={`w-full h-full object-cover scale-150 ${
                    currentId === String(season.data_id)
                      ? "opacity-50"
                      : "opacity-40"
                  }`}
                />
                {/* Dots Pattern Overlay */}
                <div 
                  className="absolute inset-0 z-10" 
                  style={{ 
                    backgroundImage: `url('data:image/svg+xml,<svg width="3" height="3" viewBox="0 0 3 3" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="1.5" cy="1.5" r="0.5" fill="white" fill-opacity="0.25"/></svg>')`,
                    backgroundSize: '3px 3px'
                  }}
                />
                {/* Dark Gradient Overlay */}
                <div className={`absolute inset-0 z-20 bg-gradient-to-r ${
                  currentId === String(season.data_id)
                    ? "from-black/50 to-transparent"
                    : "from-black/40 to-transparent"
                }`} />
                {/* Title Container */}
                <div className="absolute inset-0 z-30 flex items-center justify-center">
                  <p className={`text-[14px] sm:text-[16px] md:text-[18px] font-bold text-center px-2 sm:px-4 transition-colors duration-300 ${
                    currentId === String(season.data_id)
                      ? "text-white"
                      : "text-white/90 group-hover:text-white"
                  }`}>
                    {season.season}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* =================== VOICE ACTORS =================== */}
      {animeInfo?.anilistId && (
        <div className="px-5 mx-auto max-w-7xl py-8">
          <Voiceactor anilistId={animeInfo.anilistId} />
        </div>
      )}

      {/* =================== RECOMMENDATIONS =================== */}
      {animeInfo?.recommended_data?.length > 0 && (
        <div className="px-5 mx-auto max-w-7xl py-8">
          <CategoryCard label="You May Also Like" data={animeInfo.recommended_data} showViewMore={false} />
        </div>
      )}
    </div>
  );
}

export default AnimeInfo;
