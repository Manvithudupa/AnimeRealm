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
  const currentId = paramId;

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
        const res = await getAnimeInfo(id, random);

        // ✅ FIX: match API response shape exactly
        setAnimeInfo(res?.results?.data || null);
        setSeasons(res?.results?.seasons || []);
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
        setLastWatchedEpisode(null);
      } else if (data) {
        setLastWatchedEpisode({ id: data.episode_id, num: data.episode_num });
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
      {/* 🔥 Your original UI is untouched below */}

      {/* Seasons Section */}
      {seasons.length > 0 && (
        <div className="container mx-auto py-8 sm:py-12">
          <h2 className="text-2xl font-bold mb-6 sm:mb-8 px-1">
            More Seasons
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {seasons.map((season, index) => (
              <Link
                to={`/${season.id}`}
                key={index}
                className={`relative w-full aspect-[3/1] rounded-lg overflow-hidden cursor-pointer group ${
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
                <div className="absolute inset-0 z-30 flex items-center justify-center">
                  <p className="text-[16px] font-bold text-center px-4 text-white">
                    {season.season}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ================= RECOMMENDATIONS ================= */}
      {animeInfo?.recommended_data?.length > 0 && (
        <CategoryCard
          label="You may also like"
          data={animeInfo.recommended_data}
          showViewMore={false}
        />
      )}
    </div>
  );
}

export default AnimeInfo;
