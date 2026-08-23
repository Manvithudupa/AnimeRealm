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
    navigate(`/watch/${notification.anime_id}?ep=${notification.episode_num}`);
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

  /* ================= SMART GROUPING ================= */
  const groupNotifications = (list = []) => {
    const today = [];
    const yesterday = [];
    const older = [];

    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfToday.getDate() - 1);

    list.forEach((n) => {
      const created = new Date(n.created_at);
      if (created >= startOfToday) {
        today.push(n);
      } else if (created >= startOfYesterday) {
        yesterday.push(n);
      } else {
        older.push(n);
      }
    });

    return { today, yesterday, older };
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-[1600px] mx-auto pt-20 max-md:pt-16">
        <Loader />
      </div>
    );
  }

  const { today, yesterday, older } = groupNotifications(notifications);

  const renderSection = (title, items) =>
    items.length > 0 && (
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-white/60 mb-3 px-1">
          {title}
        </h2>
        <div className="bg-white/[0.02] rounded-xl divide-y divide-white/5 overflow-hidden">
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`w-full text-left px-3 py-4 sm:px-4 flex gap-3 sm:gap-4 transition hover:bg-white/5 ${
                !n.is_read ? "bg-white/[0.04]" : ""
              }`}
            >
              {/* Poster */}
              <img
                src={n.anime_poster || "/placeholder_poster.png"}
                alt={n.anime_title}
                className="w-12 h-16 sm:w-14 sm:h-20 object-cover rounded-md flex-shrink-0"
              />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                      )}
                      <span className="font-semibold text-white truncate">
                        {n.anime_title || "Unknown Anime"}
                      </span>
                    </div>

                    <div className="text-sm text-white/60 mt-1">
                      {n.notification_type === "continue_watching"
                        ? `New episode (${n.episode_num ?? "?"}) available`
                        : n.notification_type === "watchlist"
                        ? "Anime in your watchlist updated"
                        : "Notification"}
                    </div>
                  </div>

                  <div className="text-xs text-white/50 mt-1 sm:mt-0 whitespace-nowrap">
                    {timeAgo(n.created_at)}
                  </div>
                </div>

                {n.description && (
                  <div className="mt-2 text-sm text-white/50 line-clamp-2">
                    {n.description}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );

  return (
    <div className="max-w-[1600px] mx-auto pt-20 max-md:pt-16 px-3 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-white/60 mt-1">
              {unreadCount} unread
            </p>
          )}
        </div>

        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-md transition ${
            unreadCount === 0
              ? "bg-white/5 text-white/40 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          <Check className="w-4 h-4" />
          Read all
        </button>
      </div>

      {/* Content */}
      {!notifications || notifications.length === 0 ? (
        <div className="p-10 text-center rounded-xl bg-white/[0.03] text-white/60">
          <p className="text-base font-medium">No notifications yet</p>
          <p className="text-sm mt-2">
            Updates about your anime will appear here ✨
          </p>
        </div>
      ) : (
        <>
          {renderSection("Today", today)}
          {renderSection("Yesterday", yesterday)}
          {renderSection("Older", older)}
        </>
      )}
    </div>
  );
}
