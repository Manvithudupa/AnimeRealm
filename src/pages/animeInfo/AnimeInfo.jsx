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
  faSignal,
  faFilm,
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

/* ---------------- Info Row ---------------- */
function InfoItem({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="group flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-all duration-300">
      <dt className="flex items-center gap-2 text-sm text-white/50 font-medium">
        {icon && <FontAwesomeIcon icon={icon} className="text-xs text-white/30" />}
        {label}
      </dt>
      <dd className="text-sm text-white/90 text-right max-w-[60%] font-medium group-hover:text-white transition-colors">
        {value}
      </dd>
    </div>
  );
}

/* ---------------- Genre / Tag ---------------- */
function Tag({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-white/10 to-white/5 border border-white/10 text-xs text-white/90 font-medium hover:from-white/15 hover:to-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-sm">
      {icon && <FontAwesomeIcon icon={icon} className="text-xs" />}
      {text}
    </span>
  );
}

/* ---------------- Genre Pills ---------------- */
function GenrePill({ genre }) {
  return (
    <Link
      to={`/genre/${genre.toLowerCase().replace(/\s+/g, "-")}`}
      className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white/80 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-300 backdrop-blur-sm"
    >
      {genre}
    </Link>
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

  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);

  const [lastWatchedEpisode, setLastWatchedEpisode] = useState(null);
  const [isFullOverview, setIsFullOverview] = useState(false);

  /* ---------- Fetch Anime ---------- */
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
      .then(({ data }) => setInWatchlist(!!data));
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

      if (error) {
        console.error("Error fetching last watched episode:", error);
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
  const currentId = animeInfo?.data_id || animeInfo?.id?.split('-').pop();

  const tags = [
    info?.tvInfo?.rating,
    info?.tvInfo?.quality,
    info?.tvInfo?.sub && { icon: faClosedCaptioning, text: info.tvInfo.sub },
    info?.tvInfo?.dub && { icon: faMicrophone, text: info.tvInfo.dub },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-14 overflow-hidden">
        {/* Backdrop with Enhanced Gradient */}
        <div className="relative h-[55vh] md:h-[60vh]">
          <div className="absolute inset-0">
            <OptimizedImage
              src={poster}
              alt={title}
              className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-40"
              lazy={false}
            />
          </div>
          {/* Multi-layered gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]" />
        </div>

        {/* Content Container */}
        <div className="relative -mt-40 md:-mt-48 mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">

            {/* Poster Card with Glow Effect */}
            <div className="relative group shrink-0 mx-auto md:mx-0">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative w-44 md:w-56 lg:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 transform hover:scale-105 transition-transform duration-500">
                <OptimizedImage
                  src={poster}
                  alt={title}
                  className="w-full h-full object-cover"
                  lazy={false}
                />
                {/* Subtle overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>

            {/* Details Section */}
            <div className="flex-1 pt-4 md:pt-24 space-y-6">
              
              {/* Status Bar */}
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                {info?.Status && (
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 backdrop-blur-sm">
                    <FontAwesomeIcon icon={faSignal} className="text-xs" />
                    {info.Status}
                  </span>
                )}
                {info?.Premiered && (
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 backdrop-blur-sm">
                    <FontAwesomeIcon icon={faCalendar} className="text-xs" />
                    {info.Premiered}
                  </span>
                )}
                {info?.Duration && (
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/90 backdrop-blur-sm">
                    <FontAwesomeIcon icon={faClock} className="text-xs" />
                    {info.Duration}
                  </span>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                  {language === "EN" ? title : japanese_title}
                </h1>
                {japanese_title && language === "EN" && (
                  <p className="text-sm md:text-base text-white/50 font-light tracking-wide">
                    {japanese_title}
                  </p>
                )}
              </div>

              {/* Rating */}
              {info?.["MAL Score"] && (
                <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 backdrop-blur-sm">
                  <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-lg" />
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-yellow-400">{info["MAL Score"]}</span>
                    <span className="text-xs text-white/50 font-medium">MAL Score</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                {info?.Status?.toLowerCase() !== "not-yet-aired" && (
                  <Link
                    to={
                      lastWatchedEpisode
                        ? `/watch/${animeInfo.id}?ep=${lastWatchedEpisode.id}`
                        : `/watch/${animeInfo.id}`
                    }
                    className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-xl bg-white text-black text-sm font-bold overflow-hidden shadow-lg shadow-white/20 hover:shadow-xl hover:shadow-white/30 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <FontAwesomeIcon icon={faPlay} className="relative z-10 text-sm" />
                    <span className="relative z-10">
                      {lastWatchedEpisode
                        ? `Continue Ep ${lastWatchedEpisode.num}`
                        : "Watch Now"}
                    </span>
                  </Link>
                )}

                <button
                  onClick={toggleWatchlist}
                  disabled={watchlistLoading}
                  className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-sm font-bold transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FontAwesomeIcon 
                    icon={inWatchlist ? faCheck : faBookmark} 
                    className={`text-sm transition-transform duration-300 ${inWatchlist ? 'scale-110' : 'group-hover:scale-110'}`}
                  />
                  <span>{inWatchlist ? "In Watchlist" : "Add to Watchlist"}</span>
                </button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2.5">
                {tags.map((tag, i) =>
                  typeof tag === "string"
                    ? <Tag key={i} text={tag} />
                    : <Tag key={i} icon={tag.icon} text={tag.text} />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTENT SECTION ================= */}
      <section className="py-16 px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* Synopsis Card */}
              <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-500">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <h2 className="flex items-center gap-3 text-lg font-bold mb-6 text-white/90">
                    <div className="w-1 h-6 bg-gradient-to-b from-white to-white/50 rounded-full" />
                    Synopsis
                  </h2>
                  
                  <div className="prose prose-invert max-w-none">
                    <p className="text-white/70 leading-relaxed text-sm md:text-base">
                      {info?.Overview ? (
                        info.Overview.length > 300 ? (
                          <>
                            {isFullOverview ? info.Overview : `${info.Overview.slice(0, 300)}...`}
                            <button
                              className="ml-2 inline-flex items-center gap-1 text-sm text-white/60 hover:text-white font-semibold transition-colors duration-200 underline underline-offset-4"
                              onClick={() => setIsFullOverview(!isFullOverview)}
                            >
                              {isFullOverview ? "Show Less" : "Read More"}
                            </button>
                          </>
                        ) : info.Overview
                      ) : (
                        <span className="text-white/40 italic">No description available.</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Genres Section */}
              {info?.Genres && (
                <div className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-500">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <h2 className="flex items-center gap-3 text-lg font-bold mb-6 text-white/90">
                      <div className="w-1 h-6 bg-gradient-to-b from-white to-white/50 rounded-full" />
                      Genres
                    </h2>
                    
                    <div className="flex flex-wrap gap-3">
                      {(Array.isArray(info.Genres) 
                        ? info.Genres 
                        : typeof info.Genres === 'string' 
                          ? info.Genres.split(',') 
                          : []
                      ).map((genre, idx) => (
                        <GenrePill key={idx} genre={typeof genre === 'string' ? genre.trim() : String(genre).trim()} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 group relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm hover:border-white/20 transition-all duration-500">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <h3 className="flex items-center gap-3 text-lg font-bold mb-6 text-white/90">
                    <div className="w-1 h-6 bg-gradient-to-b from-white to-white/50 rounded-full" />
                    Information
                  </h3>
                  
                  <div className="space-y-1">
                    <InfoItem icon={faFilm} label="Japanese" value={info?.Japanese} />
                    <InfoItem label="Synonyms" value={info?.Synonyms} />
                    <InfoItem icon={faCalendar} label="Aired" value={info?.Aired} />
                    <InfoItem label="Premiered" value={info?.Premiered} />
                    <InfoItem icon={faClock} label="Duration" value={info?.Duration} />
                    <InfoItem icon={faSignal} label="Status" value={info?.Status} />
                    <InfoItem icon={faStar} label="MAL Score" value={info?.["MAL Score"]} />
                    {info?.Studios && <InfoItem label="Studios" value={info.Studios} />}
                    {info?.Producers && <InfoItem label="Producers" value={info.Producers} />}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SEASONS SECTION ================= */}
      {seasons?.length > 0 && (
        <section className="py-12 px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="flex items-center gap-3 text-2xl font-bold mb-8 text-white/90">
              <div className="w-1 h-8 bg-gradient-to-b from-white to-white/50 rounded-full" />
              More Seasons
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {seasons.map((season, index) => (
                <Link
                  to={`/${season.id}`}
                  key={index}
                  className={`group relative aspect-[3/1] rounded-xl overflow-hidden ${
                    currentId === String(season.data_id)
                      ? "ring-2 ring-white/60 shadow-xl shadow-white/20"
                      : "ring-1 ring-white/10 hover:ring-white/30"
                  } transition-all duration-300`}
                >
                  {/* Background Image */}
                  <img
                    src={season.season_poster}
                    alt={season.season}
                    className={`absolute inset-0 w-full h-full object-cover scale-150 transition-all duration-500 ${
                      currentId === String(season.data_id)
                        ? "opacity-60 group-hover:opacity-70"
                        : "opacity-40 group-hover:opacity-60"
                    }`}
                  />
                  
                  {/* Noise Texture */}
                  <div 
                    className="absolute inset-0 z-10 opacity-20" 
                    style={{ 
                      backgroundImage: `url('data:image/svg+xml,<svg width="4" height="4" viewBox="0 0 4 4" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="2" cy="2" r="0.5" fill="white" fill-opacity="0.3"/></svg>')`,
                      backgroundSize: '4px 4px'
                    }}
                  />
                  
                  {/* Gradient Overlays */}
                  <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                  <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Active Indicator */}
                  {currentId === String(season.data_id) && (
                    <div className="absolute top-3 right-3 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span className="text-xs font-bold text-white">Watching</span>
                    </div>
                  )}
                  
                  {/* Title */}
                  <div className="absolute inset-0 z-30 flex items-center justify-center p-4">
                    <p className={`text-sm md:text-base font-bold text-center transition-all duration-300 ${
                      currentId === String(season.data_id)
                        ? "text-white scale-105"
                        : "text-white/90 group-hover:text-white group-hover:scale-105"
                    }`}>
                      {season.season}
                    </p>
                  </div>

                  {/* Hover Border Effect */}
                  <div className="absolute inset-0 z-40 rounded-xl border-2 border-white/0 group-hover:border-white/20 transition-colors duration-300" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      
      {/* ================= VOICE ACTORS ================= */}
      {animeInfo?.charactersVoiceActors?.length > 0 && (
        <section className="py-12 px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Voiceactor animeInfo={animeInfo} />
          </div>
        </section>
      )}
      
      {/* ================= RECOMMENDATIONS ================= */}
      {animeInfo?.recommended_data?.length > 0 && (
        <section className="py-12">
          <CategoryCard label="You May Also Like" data={animeInfo.recommended_data} showViewMore={false} />
        </section>
      )}
    </div>
  );
}

export default AnimeInfo;
