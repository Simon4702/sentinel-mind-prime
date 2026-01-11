import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SendNotificationParams {
  alertId?: string;
  alertTitle: string;
  alertDescription: string;
  severity: string;
  recipientEmail: string;
  recipientName?: string;
  incidentId?: string;
  alertType?: string;
}

export const useAlertNotifications = () => {
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const sendNotification = useCallback(async (params: SendNotificationParams): Promise<boolean> => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-alert-notification', {
        body: params
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Notification Sent",
          description: `Alert notification sent to ${params.recipientEmail}`,
        });
        return true;
      } else {
        throw new Error(data?.error || 'Failed to send notification');
      }
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast({
        title: "Failed to Send Notification",
        description: error.message || "Could not send the alert notification",
        variant: "destructive"
      });
      return false;
    } finally {
      setSending(false);
    }
  }, [toast]);

  const sendCriticalAlertNotification = useCallback(async (
    alert: { id: string; title: string; description?: string; priority: string; alert_type?: string },
    recipientEmail: string,
    recipientName?: string
  ): Promise<boolean> => {
    return sendNotification({
      alertId: alert.id,
      alertTitle: alert.title,
      alertDescription: alert.description || '',
      severity: alert.priority,
      recipientEmail,
      recipientName,
      alertType: alert.alert_type,
    });
  }, [sendNotification]);

  return {
    sending,
    sendNotification,
    sendCriticalAlertNotification,
  };
};
