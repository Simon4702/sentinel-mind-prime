import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: "alert" | "incident" | "threat";
  priority: "info" | "low" | "medium" | "high" | "critical";
  created_at: string;
  read: boolean;
}

export const useNotifications = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!profile?.organization_id) return;

    // Fetch recent alerts
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from("security_alerts")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .eq("is_resolved", false)
        .order("created_at", { ascending: false })
        .limit(10);

      if (data) {
        const alertNotifications: Notification[] = data.map((alert) => ({
          id: alert.id,
          title: alert.title,
          description: alert.description || "",
          type: "alert",
          priority: alert.priority,
          created_at: alert.created_at,
          read: alert.is_acknowledged || false,
        }));
        setNotifications(alertNotifications);
        setUnreadCount(alertNotifications.filter((n) => !n.read).length);
      }
    };

    fetchAlerts();

    // Subscribe to new alerts
    const channel = supabase
      .channel("security-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "security_alerts",
          filter: `organization_id=eq.${profile.organization_id}`,
        },
        (payload) => {
          const newAlert = payload.new as any;
          const notification: Notification = {
            id: newAlert.id,
            title: newAlert.title,
            description: newAlert.description || "",
            type: "alert",
            priority: newAlert.priority,
            created_at: newAlert.created_at,
            read: false,
          };
          
          setNotifications((prev) => [notification, ...prev].slice(0, 10));
          setUnreadCount((prev) => prev + 1);
          
          toast.error(newAlert.title, {
            description: newAlert.description,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.organization_id]);

  const markAsRead = async (id: string) => {
    await supabase
      .from("security_alerts")
      .update({ is_acknowledged: true })
      .eq("id", id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    
    if (unreadIds.length > 0) {
      await supabase
        .from("security_alerts")
        .update({ is_acknowledged: true })
        .in("id", unreadIds);

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
};
