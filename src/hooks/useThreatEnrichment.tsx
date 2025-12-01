import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ThreatEnrichment {
  id: string;
  threat_id: string;
  source: string;
  enrichment_data: any;
  reputation_score: number | null;
  geolocation: any | null;
  threat_actors: string[] | null;
  related_campaigns: string[] | null;
  enriched_at: string;
  enriched_by: string | null;
}

export const useThreatEnrichment = (threatId?: string) => {
  return useQuery({
    queryKey: ['threat-enrichment', threatId],
    queryFn: async () => {
      if (!threatId) return [];
      
      const { data, error } = await supabase
        .from('threat_enrichment')
        .select('*')
        .eq('threat_id', threatId)
        .order('enriched_at', { ascending: false });

      if (error) throw error;
      return data as ThreatEnrichment[];
    },
    enabled: !!threatId,
  });
};

export const useAllThreatEnrichments = () => {
  return useQuery({
    queryKey: ['all-threat-enrichments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('threat_enrichment')
        .select(`
          *,
          threat_intelligence (
            indicator_value,
            threat_type,
            severity
          )
        `)
        .order('enriched_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });
};
