import { useEffect, useState } from "react";
import { supabase } from "@/src/integrations/supabase/client";
import { useAuth } from "@/src/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import Loader from "@/src/components/Loader/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { Bookmark } from "lucide-react";

function Watchlist() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- Fetch Watchlist ---------- */
  useEffect(() => {
    if (!user || authLoading) return;

    let mounted = true;

    const fetchWatchlist = async () => {
      setLoading(true);

      const { data } = await supabase
        .from("watchlists")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (mounted) {
        setWatchlist(data || []);
        setLoading(false);
      }
    };

    fetchWatchlist();

    return () => {
      mounted = false;
    };
  }, [user?.id, authLoading]);

  /* ---------- Remove ---------- */
  const removeFromWatchlist = async (animeId) => {
    await supabase
      .from("watchlists")
      .delete()
      .eq("user_id", user.id)
      .eq("anime_id", animeId);

    setWatchlist((prev) =>
      prev.filter((item) => item.anime_id !== animeId)
    );
  };

  if (loading || authLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white pt-[90px] pb-16">
      <div className="max-w-[1400px] mx-auto px-4">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-purple-500" />
            My Watchlist
          </h1>
          <p className="text-white/60 mt-1 text-sm">
            {watchlist.length} anime saved
          </p>
        </div>

        {/* Empty State */}
        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24">
            <p className="text-lg font-semibold mb-2">
              Your watchlist is empty
            </p>
            <p className="text-white/50 text-sm mb-6">
              Start adding anime you want to watch later
            </p>
            <Link
              to="/home"
              className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 transition"
            >
              Browse Anime
            </Link>
          </div>
        ) : (
          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-3
              md:grid-cols-4
              lg:grid-cols-5
              gap-4
              sm:gap-6
            "
          >
            {watchlist.map((anime) => (
              <Link
                key={anime.id}
                to={`/${anime.anime_id}`}
                className="group relative rounded-xl overflow-hidden bg-black/60 hover:ring-2 hover:ring-purple-500 transition"
              >
                {/* Poster */}
                <img
                  src={anime.anime_poster}
                  alt={anime.anime_title}
                  className="
                    w-full
                    aspect-[2/3]
                    object-cover
                    group-hover:scale-105
                    transition-transform
                    duration-300
                  "
                />

                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Title with Icon */}
                <div className="absolute bottom-0 p-3 flex items-center gap-1">
                  <Bookmark className="w-4 h-4 text-purple-500" />
                  <p className="text-sm font-semibold leading-snug line-clamp-2">
                    {anime.anime_title}
                  </p>
                </div>

                {/* Remove */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFromWatchlist(anime.anime_id);
                  }}
                  className="
                    absolute
                    top-2
                    right-2
                    p-2
                    rounded-full
                    bg-black/70
                    backdrop-blur
                    hover:bg-red-600
                    transition
                  "
                  aria-label="Remove from watchlist"
                >
                  <FontAwesomeIcon icon={faTrash} size="sm" />
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Watchlist;
