import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CyberArsenalScan {
  id: string;
  organization_id: string | null;
  user_id: string | null;
  tool_name: string;
  target: string;
  target_type: string;
  scan_result: {
    raw_output?: string;
    parsed_at?: string;
  };
  risk_score: number | null;
  is_malicious: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export const useCyberArsenalScans = (limit = 100) => {
  return useQuery({
    queryKey: ['cyber-arsenal-scans', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cyber_arsenal_scans')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as CyberArsenalScan[];
    },
  });
};

export const useScanStats = () => {
  return useQuery({
    queryKey: ['cyber-arsenal-scan-stats'],
    queryFn: async () => {
      const { data: scans, error } = await supabase
        .from('cyber_arsenal_scans')
        .select('tool_name, risk_score, is_malicious, target_type, created_at, tags');

      if (error) throw error;

      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const totalScans = scans?.length || 0;
      const maliciousCount = scans?.filter(s => s.is_malicious).length || 0;
      const scansLast24h = scans?.filter(s => new Date(s.created_at) > last24h).length || 0;
      const scansLast7d = scans?.filter(s => new Date(s.created_at) > last7d).length || 0;

      const avgRiskScore = scans?.length 
        ? Math.round(scans.reduce((acc, s) => acc + (s.risk_score || 0), 0) / scans.length)
        : 0;

      const byTool = scans?.reduce((acc, s) => {
        acc[s.tool_name] = (acc[s.tool_name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const byTargetType = scans?.reduce((acc, s) => {
        acc[s.target_type] = (acc[s.target_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const tagCounts = scans?.reduce((acc, s) => {
        (s.tags || []).forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>) || {};

      // Timeline data for last 7 days
      const timeline = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayScans = scans?.filter(s => s.created_at.startsWith(dateStr)) || [];
        return {
          date: dateStr,
          label: date.toLocaleDateString('en-US', { weekday: 'short' }),
          total: dayScans.length,
          malicious: dayScans.filter(s => s.is_malicious).length,
        };
      });

      return {
        totalScans,
        maliciousCount,
        scansLast24h,
        scansLast7d,
        avgRiskScore,
        byTool,
        byTargetType,
        tagCounts,
        timeline,
      };
    },
  });
};
