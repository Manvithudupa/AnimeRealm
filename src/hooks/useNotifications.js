import { useEffect, useState } from "react";
import { supabase } from "../integrations/supabase/client";

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`
        },
        fetchNotifications
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  async function fetchNotifications() {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setNotifications(data || []);
    setLoading(false);
  }

  async function markAsRead(id) {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    fetchNotifications();
  }

  return {
    notifications,
    loading,
    markAsRead
  };
}
