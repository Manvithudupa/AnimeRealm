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
    <div className="text-[12px] sm:text-[14px]">
      <span className="text-white/50">{label}: </span>
      <span className="text-white/90">
        {Array.isArray(value) ? value.join(", ") : value}
      </span>
    </div>
  );
}

/* ---------------- Tags ---------------- */
function Tag({ icon, text }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-black/60 text-white text-[11px] font-semibold">
      {icon && <FontAwesomeIcon icon={icon} />}
      <span>{text}</span>
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

  /* ---------- Fetch anime ---------- */
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
    window.scrollTo({ top: 0 });
  }, [id, random]);

  /* ---------- Check watchlist ---------- */
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

  /* ---------- Add / Remove ---------- */
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
    info?.tvInfo?.rating,
    info?.tvInfo?.quality,
    info?.tvInfo?.sub && { icon: faClosedCaptioning, text: info.tvInfo.sub },
    info?.tvInfo?.dub && { icon: faMicrophone, text: info.tvInfo.dub },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white mt-[74px]">
      <div className="container mx-auto py-10">
        <div className="flex flex-col md:flex-row gap-8">

          {/* Poster */}
          <div className="w-[220px] shrink-0">
            <img
              src={poster}
              alt={title}
              className="rounded-2xl shadow-lg"
            />
          </div>

          {/* Info */}
          <div className="flex-1 space-y-5">
            <h1 className="text-3xl font-bold">
              {language === "EN" ? title : japanese_title}
            </h1>

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

            {/* Synopsis */}
            {info?.Overview && (
              <p className="text-gray-300 leading-relaxed max-w-2xl">
                {info.Overview.length > 270 && !isFull
                  ? `${info.Overview.slice(0, 270)}...`
                  : info.Overview}
                {info.Overview.length > 270 && (
                  <button
                    onClick={() => setIsFull(!isFull)}
                    className="ml-2 text-purple-400 hover:underline"
                  >
                    {isFull ? "Show Less" : "Read More"}
                  </button>
                )}
              </p>
            )}

            {/* Buttons BELOW synopsis */}
            <div className="flex gap-4 pt-2">
              <Link
                to={`/watch/${animeInfo.id}`}
                className="px-6 py-2.5 bg-purple-600 rounded-xl font-semibold hover:bg-purple-500 transition"
              >
                <FontAwesomeIcon icon={faPlay} /> Watch Now
              </Link>

              <button
                onClick={toggleWatchlist}
                disabled={watchlistLoading}
                className={`px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2
                  ${
                    inWatchlist
                      ? "bg-green-600 hover:bg-green-500"
                      : "bg-white/10 hover:bg-white/20"
                  }
                `}
              >
                <FontAwesomeIcon icon={inWatchlist ? faCheck : faBookmark} />
                {inWatchlist ? "In Watchlist" : "Add to Watchlist"}
              </button>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 bg-white/5 p-5 rounded-xl">
              <InfoItem label="Status" value={info?.Status} />
              <InfoItem label="Duration" value={info?.Duration} />
              <InfoItem label="Aired" value={info?.Aired} />
              <InfoItem label="Score" value={info?.["MAL Score"]} />
            </div>
          </div>
        </div>
      </div>

      {animeInfo?.recommended_data?.length > 0 && (
        <CategoryCard
          label="Recommended for you"
          data={animeInfo.recommended_data}
          showViewMore={false}
        />
      )}

      {animeInfo?.charactersVoiceActors?.length > 0 && (
        <Voiceactor animeInfo={animeInfo} />
      )}
    </div>
  );
}

export default AnimeInfo;
