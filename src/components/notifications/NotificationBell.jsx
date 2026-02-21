import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, Trash2, X } from "lucide-react";
import { useNotifications } from "@/src/hooks/useNotifications";
import { checkNewEpisodes } from "@/src/utils/checkNewEpisodes.utils";
import { useAuth } from "@/src/hooks/useAuth";

const NotificationBell = () => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    refetch,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;

    const checkInterval = setInterval(async () => {
      await checkNewEpisodes(user.id);
      refetch();
    }, 5 * 60 * 1000);

    return () => clearInterval(checkInterval);
  }, [user, refetch]);

  const handleCheckNow = async () => {
    if (!user || isChecking) return;

    setIsChecking(true);
    try {
      await checkNewEpisodes(user.id);
      await refetch();
    } finally {
      setIsChecking(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
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

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-white/70 hover:text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-[#111]/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-xl overflow-hidden z-[1000001]">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-white/50">
                  {unreadCount} unread
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCheckNow}
                disabled={isChecking}
                className="text-xs text-white/70 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                {isChecking ? "Checking..." : "Check Now"}
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-white/70 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors"
                  title="Mark all as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-white/50 text-sm">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-white/50 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <Link
                  key={notification.id}
                  to={`/watch/${notification.anime_id}`}
                  onClick={() => handleNotificationClick(notification)}
                  className={`block px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                    !notification.is_read ? "bg-white/[0.02]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={notification.anime_poster || "/placeholder.png"}
                      alt={notification.anime_title}
                      className="w-12 h-16 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white line-clamp-1">
                            {notification.anime_title}
                          </p>
                          <p className="text-xs text-white/60 mt-0.5">
                            Episode {notification.episode_num} is now available
                          </p>
                          <p className="text-xs text-white/40 mt-1">
                            {formatTime(notification.created_at)}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      className="p-1 hover:bg-red-500/10 rounded transition-colors flex-shrink-0"
                      title="Delete notification"
                    >
                      <X className="w-4 h-4 text-white/40 hover:text-red-400" />
                    </button>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
