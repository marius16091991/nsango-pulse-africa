import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Notification {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  description: string | null;
  link: string | null;
  icon: string | null;
  metadata: any;
  read: boolean;
  created_at: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user) { setNotifications([]); setLoading(false); return; }
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setNotifications((data || []) as Notification[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Realtime
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notifications-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, (payload) => {
        if (payload.eventType === "INSERT") {
          const n = payload.new as Notification;
          setNotifications((prev) => [n, ...prev]);
          toast(n.title, { description: n.description || undefined });
        } else if (payload.eventType === "UPDATE") {
          setNotifications((prev) => prev.map(x => x.id === (payload.new as any).id ? payload.new as Notification : x));
        } else if (payload.eventType === "DELETE") {
          setNotifications((prev) => prev.filter(x => x.id !== (payload.old as any).id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  };
  const markAllRead = async () => {
    const ids = notifications.filter(n => !n.read).map(n => n.id);
    if (ids.length === 0) return;
    await supabase.from("notifications").update({ read: true }).in("id", ids);
  };
  const remove = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
  };
  const removeAll = async () => {
    const ids = notifications.map(n => n.id);
    if (ids.length === 0) return;
    await supabase.from("notifications").delete().in("id", ids);
  };

  return { notifications, loading, unreadCount, markRead, markAllRead, remove, removeAll, refetch: fetchNotifications };
};
