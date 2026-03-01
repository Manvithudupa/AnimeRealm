import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/src/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useNotifications = (shouldFetch = true) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Derived state (no sync bugs)
  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.is_read).length,
    [notifications]
  );

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // Only depend on user.id

  useEffect(() => {
    let mounted = true;

    if (shouldFetch && user?.id && mounted) {
      fetchNotifications();
    }

    return () => {
      mounted = false;
    };
  }, [shouldFetch, user?.id, fetchNotifications]);

  const markAsRead = async (notificationId) => {
    if (!user) return;

    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );

    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error marking notification as read:", error);
      fetchNotifications(); // rollback safety
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true }))
    );

    const { error } = await supabase
      .from("notifications")
      .update({
        is_read: true,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) {
      console.error("Error marking all as read:", error);
      fetchNotifications(); // rollback safety
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
};
