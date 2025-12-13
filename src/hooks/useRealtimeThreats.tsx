import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type ThreatIntelligence = Tables<"threat_intelligence">;
type SecurityIncident = Tables<"security_incidents">;
type SecurityAlert = Tables<"security_alerts">;

export const useRealtimeThreats = () => {
  const { profile } = useAuth();
  const [threats, setThreats] = useState<ThreatIntelligence[]>([]);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.organization_id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      
      const [threatsRes, incidentsRes, alertsRes] = await Promise.all([
        supabase
          .from("threat_intelligence")
          .select("*")
          .eq("is_active", true)
          .order("last_seen", { ascending: false })
          .limit(20),
        supabase
          .from("security_incidents")
          .select("*")
          .eq("organization_id", profile.organization_id)
          .neq("status", "closed")
          .order("detected_at", { ascending: false })
          .limit(20),
        supabase
          .from("security_alerts")
          .select("*")
          .eq("organization_id", profile.organization_id)
          .eq("is_resolved", false)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      if (threatsRes.data) setThreats(threatsRes.data);
      if (incidentsRes.data) setIncidents(incidentsRes.data);
      if (alertsRes.data) setAlerts(alertsRes.data);
      
      setLoading(false);
    };

    fetchData();

    // Real-time subscriptions
    const channel = supabase
      .channel("realtime-threats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "threat_intelligence",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newThreat = payload.new as ThreatIntelligence;
            setThreats((prev) => [newThreat, ...prev].slice(0, 20));
            toast.warning("New Threat Detected", {
              description: `${newThreat.threat_type}: ${newThreat.indicator_value}`,
            });
          } else if (payload.eventType === "UPDATE") {
            setThreats((prev) =>
              prev.map((t) =>
                t.id === payload.new.id ? (payload.new as ThreatIntelligence) : t
              )
            );
          } else if (payload.eventType === "DELETE") {
            setThreats((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "security_incidents",
          filter: `organization_id=eq.${profile.organization_id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newIncident = payload.new as SecurityIncident;
            setIncidents((prev) => [newIncident, ...prev].slice(0, 20));
            toast.error("Security Incident Created", {
              description: newIncident.title,
            });
          } else if (payload.eventType === "UPDATE") {
            setIncidents((prev) =>
              prev.map((i) =>
                i.id === payload.new.id ? (payload.new as SecurityIncident) : i
              )
            );
          } else if (payload.eventType === "DELETE") {
            setIncidents((prev) => prev.filter((i) => i.id !== payload.old.id));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "security_alerts",
          filter: `organization_id=eq.${profile.organization_id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newAlert = payload.new as SecurityAlert;
            setAlerts((prev) => [newAlert, ...prev].slice(0, 20));
          } else if (payload.eventType === "UPDATE") {
            setAlerts((prev) =>
              prev.map((a) =>
                a.id === payload.new.id ? (payload.new as SecurityAlert) : a
              )
            );
          } else if (payload.eventType === "DELETE") {
            setAlerts((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.organization_id]);

  const stats = {
    activeThreats: threats.filter((t) => t.is_active).length,
    criticalThreats: threats.filter((t) => t.severity === "critical").length,
    openIncidents: incidents.filter((i) => i.status === "open").length,
    unresolvedAlerts: alerts.filter((a) => !a.is_resolved).length,
  };

  return {
    threats,
    incidents,
    alerts,
    stats,
    loading,
  };
};
