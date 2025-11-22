import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ThreatData {
  id: string;
  indicator_type: string;
  indicator_value: string;
  threat_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence_level: number | null;
  source: string;
  description: string | null;
  first_seen: string;
  last_seen: string;
  is_active: boolean;
}

export interface SecurityAlert {
  id: string;
  title: string;
  description: string | null;
  alert_type: string;
  priority: 'info' | 'low' | 'medium' | 'high' | 'critical';
  is_acknowledged: boolean | null;
  is_resolved: boolean | null;
  created_at: string;
  source_system: string | null;
}

export const useThreatData = () => {
  const [threats, setThreats] = useState<ThreatData[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchThreats();
    fetchAlerts();
    setupRealtimeSubscriptions();
  }, []);

  const fetchThreats = async () => {
    try {
      const { data, error } = await supabase
        .from('threat_intelligence')
        .select('*')
        .eq('is_active', true)
        .order('last_seen', { ascending: false })
        .limit(50);

      if (error) throw error;
      setThreats(data || []);
    } catch (error) {
      console.error('Error fetching threats:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch threat data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const threatsChannel = supabase
      .channel('threat-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'threat_intelligence',
        },
        (payload) => {
          setThreats((prev) => [payload.new as ThreatData, ...prev.slice(0, 49)]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'threat_intelligence',
        },
        (payload) => {
          setThreats((prev) =>
            prev.map((threat) =>
              threat.id === payload.new.id ? (payload.new as ThreatData) : threat
            )
          );
        }
      )
      .subscribe();

    const alertsChannel = supabase
      .channel('alert-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_alerts',
        },
        (payload) => {
          setAlerts((prev) => [payload.new as SecurityAlert, ...prev.slice(0, 19)]);
          toast({
            title: 'New Security Alert',
            description: (payload.new as SecurityAlert).title,
            variant: 'destructive',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(threatsChannel);
      supabase.removeChannel(alertsChannel);
    };
  };

  return { threats, alerts, loading, refetch: fetchThreats };
};
