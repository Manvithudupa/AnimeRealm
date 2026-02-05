import "./Notifications.css";

import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";

export default function Notifications() {
  const { user } = useAuth();

  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead
  } = useNotifications(user?.id);

  if (!user) return null;

  return (
    <div className="notification-box">

      <div className="notif-header">
        <h3>Notifications</h3>

        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={markAllAsRead}
            className="mark-all-btn"
          >
            Mark all
          </button>
        )}
      </div>

      {loading && <p>Loading...</p>}

      {!loading && notifications.length === 0 && (
        <p>No notifications</p>
      )}

      {notifications.map((n) => (
        <div
          key={n.id}
          className={`notification-item ${
            n.is_read ? "read" : "unread"
          }`}
          onClick={() => markAsRead(n.id)}
        >
          <p>{n.message}</p>

          <span>
            {new Date(n.created_at).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
