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
    <div className="flex justify-between text-sm">
      <dt className="text-white/50">{label}</dt>
      <dd className="text-white/90 text-right max-w-[60%] truncate">{value}</dd>
    </div>
  );
}

/* ---------------- Genre / Tag ---------------- */
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
        setSeasons(data.seasons || []); // ✅ FIXED: fetch from top-level data
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

  const tags = [
    info?.tvInfo?.rating,
    info?.tvInfo?.quality,
    info?.tvInfo?.sub && { icon: faClosedCaptioning, text: info.tvInfo.sub },
    info?.tvInfo?.dub && { icon: faMicrophone, text: info.tvInfo.dub },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ================= HERO ================= */}
      <section className="relative pt-14">
        <div className="relative h-[50vh] overflow-hidden">
          <img src={poster} alt={title} className="absolute inset-0 w-full h-full object-cover blur-sm scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
        </div>

        {/* Info */}
        <div className="relative -mt-32 mx-auto max-w-7xl px-5">
          <div className="flex flex-col md:flex-row gap-6">

            {/* Poster */}
            <div className="relative w-40 md:w-52 aspect-[3/4] rounded-xl overflow-hidden shadow-xl shrink-0">
              <img src={poster} alt={title} className="w-full h-full object-cover" />
            </div>

            {/* Details */}
            <div className="flex-1 pt-4 md:pt-20">
              <p className="text-xs uppercase tracking-wider text-white/50 mb-2">
                {info?.Status} · {info?.Premiered} · {info?.Duration}
              </p>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                {language === "EN" ? title : japanese_title}
              </h1>

              {japanese_title && <p className="text-sm text-white/40 mb-4">{japanese_title}</p>}

              <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 mb-6">
                {info?.["MAL Score"] && <span className="text-yellow-400">⭐ {info["MAL Score"]}</span>}
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 mb-6">
                {info?.Status?.toLowerCase() !== "not-yet-aired" && (
                  <Link
                    to={
                      lastWatchedEpisode
                        ? `/watch/${animeInfo.id}?ep=${lastWatchedEpisode.id}`
                        : `/watch/${animeInfo.id}`
                    }
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition"
                  >
                    <FontAwesomeIcon icon={faPlay} />
                    {lastWatchedEpisode
                      ? `Continue Watching Ep ${lastWatchedEpisode.num}`
                      : "Watch"}
                  </Link>
                )}

                <button
                  onClick={toggleWatchlist}
                  disabled={watchlistLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition"
                >
                  <FontAwesomeIcon icon={inWatchlist ? faCheck : faBookmark} />
                  {inWatchlist ? "Saved" : "Save"}
                </button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
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

      {/* ================= SYNOPSIS + INFO ================= */}
      <section className="py-10 px-5">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-3 gap-8">

          {/* Synopsis */}
          <div className="lg:col-span-2">
            <h2 className="text-sm uppercase tracking-wider text-white/50 mb-4">Synopsis</h2>
            <p className="text-white/70 leading-relaxed">
              {info?.Overview ? (
                info.Overview.length > 270 ? (
                  <>
                    {isFullOverview ? info.Overview : `${info.Overview.slice(0, 270)}...`}
                    <button
                      className="ml-2 text-gray-300 hover:text-white transition-colors"
                      onClick={() => setIsFullOverview(!isFullOverview)}
                    >
                      {isFullOverview ? "Show Less" : "Read More"}
                    </button>
                  </>
                ) : info.Overview
              ) : (
                "No description available."
              )}
            </p>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-1">
            <div className="bg-white/[0.05] rounded-xl p-5 border border-white/10">
              <h3 className="text-sm uppercase tracking-wider text-white/50 mb-4">Information</h3>
              <dl className="space-y-3">
                <InfoItem label="Japanese" value={info?.Japanese} />
                <InfoItem label="Synonyms" value={info?.Synonyms} />
                <InfoItem label="Aired" value={info?.Aired} />
                <InfoItem label="Premiered" value={info?.Premiered} />
                <InfoItem label="Duration" value={info?.Duration} />
                <InfoItem label="Status" value={info?.Status} />
                <InfoItem label="MAL Score" value={info?.["MAL Score"]} />
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
                  currentId === String(season.id)
                    ? "ring-2 ring-white/40 shadow-lg shadow-white/10"
                    : ""
                }`}
              >
                <img
                  src={season.season_poster}
                  alt={season.season}
                  className={`w-full h-full object-cover scale-150 ${
                    currentId === String(season.id)
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
                  currentId === String(season.id)
                    ? "from-black/50 to-transparent"
                    : "from-black/40 to-transparent"
                }`} />
                {/* Title Container */}
                <div className="absolute inset-0 z-30 flex items-center justify-center">
                  <p className={`text-[14px] sm:text-[16px] md:text-[18px] font-bold text-center px-2 sm:px-4 transition-colors duration-300 ${
                    currentId === String(season.id)
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
      
      {/* Voice Actors Section */}
      {animeInfo?.charactersVoiceActors.length > 0 && (
        <div className="container mx-auto py-12">
          <Voiceactor animeInfo={animeInfo} />
        </div>
      )}
      
      {/* ================= RECOMMENDATIONS ================= */}
      {animeInfo?.recommended_data?.length > 0 && (
        <CategoryCard label="You may also like" data={animeInfo.recommended_data} showViewMore={false} />
      )}
    </div>
  );
}

export default AnimeInfo;
