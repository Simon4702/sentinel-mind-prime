import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface IOCWatchlistItem {
  id: string;
  organization_id: string | null;
  indicator_type: string;
  indicator_value: string;
  description: string | null;
  last_scan_at: string | null;
  last_risk_score: number | null;
  previous_risk_score: number | null;
  is_malicious: boolean;
  was_malicious: boolean;
  scan_frequency_hours: number;
  is_active: boolean;
  alert_on_change: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface IOCScanHistory {
  id: string;
  ioc_id: string;
  scanned_at: string;
  risk_score: number | null;
  is_malicious: boolean | null;
  scan_result: Record<string, unknown>;
  reputation_change: number | null;
  alert_generated: boolean;
}

export const useIOCWatchlist = () => {
  return useQuery({
    queryKey: ['ioc-watchlist'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ioc_watchlist')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as IOCWatchlistItem[];
    },
  });
};

export const useIOCScanHistory = (iocId: string) => {
  return useQuery({
    queryKey: ['ioc-scan-history', iocId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ioc_scan_history')
        .select('*')
        .eq('ioc_id', iocId)
        .order('scanned_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as IOCScanHistory[];
    },
    enabled: !!iocId,
  });
};

export const useAddIOC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ioc: {
      indicator_type: string;
      indicator_value: string;
      description?: string;
      scan_frequency_hours?: number;
      tags?: string[];
    }) => {
      // Get user's organization_id from their profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profile?.organization_id) {
        throw new Error('Could not determine user organization');
      }

      const { data, error } = await supabase
        .from('ioc_watchlist')
        .insert({
          indicator_type: ioc.indicator_type,
          indicator_value: ioc.indicator_value,
          description: ioc.description,
          scan_frequency_hours: ioc.scan_frequency_hours || 24,
          tags: ioc.tags || [],
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ioc-watchlist'] });
      toast.success('IOC added to watchlist');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add IOC: ${error.message}`);
    },
  });
};

export const useRemoveIOC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('ioc_watchlist')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ioc-watchlist'] });
      toast.success('IOC removed from watchlist');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove IOC: ${error.message}`);
    },
  });
};

export const useToggleIOC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('ioc_watchlist')
        .update({ is_active })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ioc-watchlist'] });
    },
  });
};

export const useTriggerIOCScan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('scheduled-ioc-scan');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ioc-watchlist'] });
      queryClient.invalidateQueries({ queryKey: ['ioc-scan-history'] });
      toast.success(`Scan complete: ${data.scanned} scanned, ${data.alerts_generated} alerts`);
    },
    onError: (error: Error) => {
      toast.error(`Scan failed: ${error.message}`);
    },
  });
};
