import { useEffect, useState } from "react";
import { supabase } from "@/src/integrations/supabase/client";
import { useAuth } from "@/src/hooks/useAuth";
import { Link } from "react-router-dom";
import Loader from "@/src/components/Loader/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faCheck, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { Bookmark } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Status config                                                        */
/* ------------------------------------------------------------------ */

const STATUSES = [
  { value: "all",           label: "All",           color: "text-white",        dot: "bg-white/60" },
  { value: "watching",      label: "Watching",      color: "text-green-400",    dot: "bg-green-400" },
  { value: "plan_to_watch", label: "Plan to Watch", color: "text-blue-400",     dot: "bg-blue-400" },
  { value: "completed",     label: "Completed",     color: "text-purple-400",   dot: "bg-purple-400" },
  { value: "on_hold",       label: "On Hold",       color: "text-yellow-400",   dot: "bg-yellow-400" },
  { value: "dropped",       label: "Dropped",       color: "text-red-400",      dot: "bg-red-400" },
];

const STATUS_MAP = Object.fromEntries(STATUSES.map((s) => [s.value, s]));

function statusLabel(value) {
  return STATUS_MAP[value]?.label ?? value;
}

function statusDot(value) {
  return STATUS_MAP[value]?.dot ?? "bg-white/40";
}

function statusTextColor(value) {
  return STATUS_MAP[value]?.color ?? "text-white/60";
}

/* ------------------------------------------------------------------ */

function Watchlist() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [openDropdown, setOpenDropdown] = useState(null); // anime_id whose dropdown is open

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

  /* ---------- Close dropdown on outside click ---------- */
  useEffect(() => {
    const handler = () => setOpenDropdown(null);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ---------- Remove ---------- */
  const removeFromWatchlist = async (animeId) => {
    await supabase
      .from("watchlists")
      .delete()
      .eq("user_id", user.id)
      .eq("anime_id", animeId);

    setWatchlist((prev) => prev.filter((item) => item.anime_id !== animeId));
    setOpenDropdown(null);
  };

  /* ---------- Update Status ---------- */
  const updateStatus = async (animeId, newStatus) => {
    await supabase
      .from("watchlists")
      .update({ status: newStatus })
      .eq("user_id", user.id)
      .eq("anime_id", animeId);

    setWatchlist((prev) =>
      prev.map((item) =>
        item.anime_id === animeId ? { ...item, status: newStatus } : item
      )
    );
    setOpenDropdown(null);
  };

  if (loading || authLoading) return <Loader />;

  /* ---------- Filtered list ---------- */
  const filtered =
    activeTab === "all"
      ? watchlist
      : watchlist.filter((item) => item.status === activeTab);

  /* ---------- Counts per tab ---------- */
  const counts = STATUSES.reduce((acc, s) => {
    acc[s.value] =
      s.value === "all"
        ? watchlist.length
        : watchlist.filter((item) => item.status === s.value).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white pt-[90px] pb-16">
      <div className="max-w-[1400px] mx-auto px-4">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-purple-500" />
            My Watchlist
          </h1>
          <p className="text-white/60 mt-1 text-sm">
            {watchlist.length} anime saved
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setActiveTab(s.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === s.value
                  ? "bg-white/15 text-white border border-white/20"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              {s.value !== "all" && (
                <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              )}
              {s.label}
              {counts[s.value] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === s.value ? "bg-white/20" : "bg-white/10"
                }`}>
                  {counts[s.value]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Bookmark className="w-7 h-7 text-white/20" />
            </div>
            <p className="text-lg font-semibold mb-2">
              {activeTab === "all" ? "Your watchlist is empty" : `No anime with status "${statusLabel(activeTab)}"`}
            </p>
            <p className="text-white/50 text-sm mb-6">
              {activeTab === "all"
                ? "Start adding anime you want to watch later"
                : "Change the tab or add anime with this status"}
            </p>
            <Link
              to="/home"
              className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-700 transition"
            >
              Browse Anime
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filtered.map((anime) => (
              <div key={anime.id} className="relative group rounded-xl overflow-hidden bg-black/60 hover:ring-2 hover:ring-purple-500/60 transition-all duration-200">
                <Link to={`/${anime.anime_id}`} className="block">
                  {/* Poster */}
                  <img
                    src={anime.anime_poster}
                    alt={anime.anime_title}
                    className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  {/* Title */}
                  <div className="absolute bottom-0 p-3">
                    <p className="text-sm font-semibold leading-snug line-clamp-2">
                      {anime.anime_title}
                    </p>
                  </div>
                </Link>

                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/70 backdrop-blur text-xs font-medium ${statusTextColor(anime.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot(anime.status)}`} />
                    {statusLabel(anime.status)}
                  </span>
                </div>

                {/* Status Dropdown */}
                <div
                  className="absolute top-2 right-2"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === anime.anime_id ? null : anime.anime_id);
                    }}
                    className="p-2 rounded-full bg-black/70 backdrop-blur hover:bg-white/20 transition"
                    aria-label="Change status"
                  >
                    <FontAwesomeIcon icon={faChevronDown} size="xs" />
                  </button>

                  {openDropdown === anime.anime_id && (
                    <div className="absolute right-0 top-full mt-1 w-44 rounded-xl bg-[#1a1a1a] border border-white/10 shadow-2xl z-50 overflow-hidden">
                      {STATUSES.filter((s) => s.value !== "all").map((s) => (
                        <button
                          key={s.value}
                          onClick={(e) => {
                            e.preventDefault();
                            updateStatus(anime.anime_id, s.value);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs transition-colors ${
                            anime.status === s.value
                              ? "bg-white/10 font-semibold"
                              : `text-white/80 hover:bg-white/10`
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                          <span className={anime.status === s.value ? s.color : ""}>{s.label}</span>
                          {anime.status === s.value && (
                            <FontAwesomeIcon icon={faCheck} className={`ml-auto text-xs ${s.color}`} />
                          )}
                        </button>
                      ))}
                      <div className="h-px bg-white/10 mx-3" />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeFromWatchlist(anime.anime_id);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Watchlist;
