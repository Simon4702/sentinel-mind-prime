import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type SecurityAlert = Tables<'security_alerts'>;
type SiemEvent = Tables<'siem_events'>;
type SecurityIncident = Tables<'security_incidents'>;

interface RealtimeEvent {
  id: string;
  type: 'alert' | 'event' | 'incident';
  title: string;
  severity: string;
  timestamp: string;
  data: SecurityAlert | SiemEvent | SecurityIncident;
}

export const useRealtimeAlerts = () => {
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const { toast } = useToast();

  const addEvent = useCallback((event: RealtimeEvent) => {
    setRealtimeEvents(prev => {
      const updated = [event, ...prev].slice(0, 100); // Keep last 100 events
      return updated;
    });
  }, []);

  const showNotification = useCallback((event: RealtimeEvent) => {
    const severityColors: Record<string, 'default' | 'destructive'> = {
      critical: 'destructive',
      high: 'destructive',
      medium: 'default',
      low: 'default',
    };

    toast({
      title: `🔴 New ${event.type}: ${event.title}`,
      description: `Severity: ${event.severity}`,
      variant: severityColors[event.severity.toLowerCase()] || 'default',
    });
  }, [toast]);

  useEffect(() => {
    console.log('[Realtime] Setting up subscriptions...');
    
    const channel = supabase
      .channel('security-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_alerts'
        },
        (payload) => {
          console.log('[Realtime] New security alert:', payload);
          const alert = payload.new as SecurityAlert;
          const event: RealtimeEvent = {
            id: alert.id,
            type: 'alert',
            title: alert.title,
            severity: alert.priority,
            timestamp: alert.created_at,
            data: alert,
          };
          addEvent(event);
          if (alert.priority === 'critical' || alert.priority === 'high') {
            showNotification(event);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'siem_events'
        },
        (payload) => {
          console.log('[Realtime] New SIEM event:', payload);
          const siemEvent = payload.new as SiemEvent;
          const event: RealtimeEvent = {
            id: siemEvent.id,
            type: 'event',
            title: siemEvent.message,
            severity: siemEvent.severity,
            timestamp: siemEvent.timestamp,
            data: siemEvent,
          };
          addEvent(event);
          if (siemEvent.is_alert && (siemEvent.severity === 'critical' || siemEvent.severity === 'high')) {
            showNotification(event);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_incidents'
        },
        (payload) => {
          console.log('[Realtime] New security incident:', payload);
          const incident = payload.new as SecurityIncident;
          const event: RealtimeEvent = {
            id: incident.id,
            type: 'incident',
            title: incident.title,
            severity: incident.severity,
            timestamp: incident.detected_at,
            data: incident,
          };
          addEvent(event);
          showNotification(event);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'security_alerts'
        },
        (payload) => {
          console.log('[Realtime] Security alert updated:', payload);
          const alert = payload.new as SecurityAlert;
          setRealtimeEvents(prev => 
            prev.map(e => e.id === alert.id ? { ...e, data: alert } : e)
          );
        }
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setConnectionStatus('connected');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setConnectionStatus('disconnected');
        }
      });

    return () => {
      console.log('[Realtime] Cleaning up subscriptions...');
      supabase.removeChannel(channel);
    };
  }, [addEvent, showNotification]);

  const clearEvents = useCallback(() => {
    setRealtimeEvents([]);
  }, []);

  return {
    realtimeEvents,
    isConnected,
    connectionStatus,
    clearEvents,
  };
};
