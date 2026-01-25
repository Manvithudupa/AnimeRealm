import { useEffect, useState } from "react";
import { supabase } from "@/src/integrations/supabase/client";
import { useAuth } from "@/src/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import Loader from "@/src/components/Loader/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

function Watchlist() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- Auth Guard ---------- */
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  /* ---------- Fetch Watchlist ---------- */
  useEffect(() => {
    if (!user) return;

    const fetchWatchlist = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("watchlists")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) setWatchlist(data || []);
      setLoading(false);
    };

    fetchWatchlist();
  }, [user]);

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
    <div className="min-h-screen bg-[#0b0b0b] text-white mt-[74px]">
      <div className="container mx-auto px-4 py-10">

        <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>

        {watchlist.length === 0 ? (
          <p className="text-white/60">Your watchlist is empty.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {watchlist.map((anime) => (
              <div
                key={anime.id}
                className="relative rounded-xl overflow-hidden bg-black/50 hover:ring-2 hover:ring-purple-600 transition"
              >
                {/* ✅ CORRECT LINK */}
                <Link to={`/${anime.anime_id}`} className="block">
                  <img
                    src={anime.anime_poster}
                    alt={anime.anime_title}
                    className="aspect-[2/3] w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  <div className="absolute bottom-0 p-3">
                    <p className="text-sm font-semibold line-clamp-2">
                      {anime.anime_title}
                    </p>
                  </div>
                </Link>

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFromWatchlist(anime.anime_id);
                  }}
                  className="absolute top-2 right-2 p-2 rounded-full
                             bg-black/70 hover:bg-red-600 transition"
                >
                  <FontAwesomeIcon icon={faTrash} size="sm" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Watchlist;
