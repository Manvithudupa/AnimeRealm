import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/src/hooks/useAuth";
import { useNotifications } from "@/src/hooks/useNotifications";
import Loader from "@/src/components/Loader/Loader";
import { Check } from "lucide-react";

export default function Notifications() {
  const { user, loading: authLoading } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch,
  } = useNotifications();

  const navigate = useNavigate();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [authLoading, user, navigate]);

  const handleNotificationClick = async (notification) => {
    await markAsRead(notification.id);
    navigate(`/watch/${notification.anime_id}`);
  };

  const timeAgo = (isoDate) => {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-[1600px] mx-auto mt-[64px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto mt-[80px] px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-white/60 mt-1">
              You have {unreadCount} unread notification
              {unreadCount > 1 ? "s" : ""}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refetch}
            className="px-3 py-1.5 rounded-md bg-white/5 text-white/90 hover:bg-white/10 transition"
          >
            Refresh
          </button>

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition ${
              unreadCount === 0
                ? "bg-white/5 text-white/40 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            <Check className="w-4 h-4" />
            Mark all read
          </button>
        </div>
      </div>

      {/* Empty State */}
      {!notifications || notifications.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white/[0.03] text-white/60">
          <p className="text-lg font-medium">No notifications yet</p>
          <p className="text-sm mt-2">
            We’ll notify you when something important happens 👀
          </p>
        </div>
      ) : (
        <div className="bg-white/[0.02] rounded-xl divide-y divide-white/5 overflow-hidden">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`w-full text-left px-4 py-4 flex gap-4 items-start transition hover:bg-white/5 focus:outline-none ${
                !n.is_read ? "bg-white/[0.04]" : ""
              }`}
            >
              {/* Poster */}
              <img
                src={n.anime_poster || "/placeholder_poster.png"}
                alt={n.anime_title}
                className="w-14 h-20 object-cover rounded-md flex-shrink-0"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">
                      {n.anime_title || "Unknown Anime"}
                    </div>
                    <div className="text-sm text-white/60 mt-1">
                      {n.notification_type === "continue_watching"
                        ? `New episode (${n.episode_num ?? "?"}) available`
                        : n.notification_type === "watchlist"
                        ? "An anime in your watchlist has an update"
                        : "Notification"}
                    </div>
                  </div>

                  <div className="text-xs text-white/50 whitespace-nowrap">
                    {timeAgo(n.created_at)}
                  </div>
                </div>

                {n.description && (
                  <div className="mt-2 text-sm text-white/50 line-clamp-2">
                    {n.description}
                  </div>
                )}

                {!n.is_read && (
                  <div className="mt-2 text-xs text-green-400">
                    ● Unread
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
