import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Check } from "lucide-react";
import { useNotifications } from "@/src/hooks/useNotifications";
import { useAuth } from "@/src/hooks/useAuth";

const NotificationBell = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [hasInitialFetch, setHasInitialFetch] = useState(false);
  const dropdownRef = useRef(null);

  // Lazy-load notifications only when dropdown is opened
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
  } = useNotifications(hasInitialFetch);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Trigger initial fetch when dropdown is first opened
  useEffect(() => {
    if (isOpen && !hasInitialFetch) {
      setHasInitialFetch(true);
    }
  }, [isOpen, hasInitialFetch]);

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
        <div
          className="
            fixed sm:absolute
            top-16 sm:top-auto
            left-2 right-2 sm:left-auto sm:right-0
            mt-2
            w-[calc(100vw-1rem)] sm:w-96
            bg-[#111]/95 backdrop-blur-xl
            rounded-xl border border-white/10
            shadow-xl overflow-hidden
            z-[1000001]
          "
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-white/50">{unreadCount} unread</p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-white/70 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors"
                title="Mark all as read"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-white/50 text-sm">
                Loading notifications...
              </div>
            ) : notifications.filter((n) => !n.is_read).length === 0 ? (
              <div className="p-8 text-center text-white/50 text-sm">
                No notifications yet
              </div>
            ) : (
              notifications
                .filter((n) => !n.is_read)
                .map((notification) => (
                  <Link
                    key={notification.id}
                    to={`/watch/${notification.episode_id}`} // Use full episode ID from API
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
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0" />
                      )}
                    </div>
                  </Link>
                ))
            )}
          </div>

          {/* Footer */}
          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            className="block text-center text-sm text-white/70 hover:text-white py-3 bg-white/[0.02] hover:bg-white/[0.04] transition"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
