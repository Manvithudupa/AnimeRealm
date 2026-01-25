import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/src/integrations/supabase/client";
import { useAuth } from "@/src/hooks/useAuth";
import Loader from "@/src/components/Loader/Loader";

function Watchlist() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  /* ---------- Redirect if not logged in ---------- */
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [authLoading, user, navigate]);

  /* ---------- Fetch watchlist ---------- */
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

  /* ---------- Remove from watchlist ---------- */
  const removeFromWatchlist = async (animeId) => {
    setRemovingId(animeId);

    await supabase
      .from("watchlists")
      .delete()
      .eq("user_id", user.id)
      .eq("anime_id", animeId);

    setWatchlist((prev) =>
      prev.filter((item) => item.anime_id !== animeId)
    );

    setRemovingId(null);
  };

  if (loading || authLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white mt-[74px]">
      <div className="container mx-auto py-10">

        {/* Header */}
        <h1 className="text-3xl font-bold mb-8">My Watchlist</h1>

        {/* Empty state */}
        {watchlist.length === 0 && (
          <div className="text-center text-white/60 mt-20">
            <p className="text-lg">Your watchlist is empty 😴</p>
            <Link
              to="/"
              className="inline-block mt-4 px-6 py-2 bg-purple-600 rounded-lg font-semibold"
            >
              Browse Anime
            </Link>
          </div>
        )}

        {/* Watchlist grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {watchlist.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl overflow-hidden bg-black/60"
            >
              {/* Poster */}
              <Link to={`/${item.anime_id}`}>
                <img
                  src={item.anime_poster}
                  alt={item.anime_title}
                  className="w-full aspect-[2/3] object-cover transition group-hover:scale-105"
                />
              </Link>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition" />

              {/* Title */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
                <p className="text-sm font-semibold truncate">
                  {item.anime_title}
                </p>
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeFromWatchlist(item.anime_id)}
                disabled={removingId === item.anime_id}
                className="absolute top-2 right-2 p-2 rounded-full
                  bg-red-600 hover:bg-red-500
                  opacity-0 group-hover:opacity-100 transition"
              >
                <FontAwesomeIcon icon={faTrash} className="text-xs" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Watchlist;
