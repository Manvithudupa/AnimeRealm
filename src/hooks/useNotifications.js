import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    fetchNotifications();

    // Realtime listener (ALL changes)
    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  /* ---------------- FETCH ---------------- */

  async function fetchNotifications() {
    setLoading(true);

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error) {
      setNotifications(data || []);
    }

    setLoading(false);
  }

  /* ---------------- MARK READ ---------------- */

  async function markAsRead(id) {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
  }

  /* ---------------- MARK ALL READ (BONUS) ---------------- */

  async function markAllAsRead() {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
  }

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead // optional
  };
}
