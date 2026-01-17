import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EscalationRule {
  id: string;
  organization_id: string | null;
  rule_name: string;
  description: string | null;
  severity_trigger: string[];
  response_time_minutes: number;
  escalation_level: number;
  escalation_target_type: string;
  escalation_target: string;
  notification_channels: string[];
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface EscalationHistory {
  id: string;
  rule_id: string | null;
  alert_id: string | null;
  escalated_at: string;
  escalation_level: number;
  escalated_to: string;
  notification_sent: boolean;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
}

export const useEscalationRules = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading, error } = useQuery({
    queryKey: ['escalation-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alert_escalation_rules')
        .select('*')
        .order('escalation_level', { ascending: true });

      if (error) throw error;
      return data as EscalationRule[];
    },
  });

  const createRule = useMutation({
    mutationFn: async (rule: Omit<EscalationRule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('alert_escalation_rules')
        .insert(rule)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalation-rules'] });
      toast({
        title: "Rule Created",
        description: "Escalation rule has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateRule = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EscalationRule> & { id: string }) => {
      const { data, error } = await supabase
        .from('alert_escalation_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalation-rules'] });
      toast({
        title: "Rule Updated",
        description: "Escalation rule has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('alert_escalation_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalation-rules'] });
      toast({
        title: "Rule Deleted",
        description: "Escalation rule has been deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleRule = useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      const { error } = await supabase
        .from('alert_escalation_rules')
        .update({ is_enabled })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, { is_enabled }) => {
      queryClient.invalidateQueries({ queryKey: ['escalation-rules'] });
      toast({
        title: is_enabled ? "Rule Enabled" : "Rule Disabled",
        description: `Escalation rule has been ${is_enabled ? 'enabled' : 'disabled'}.`,
      });
    },
  });

  return {
    rules,
    isLoading,
    error,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
  };
};

export const useEscalationHistory = (alertId?: string) => {
  return useQuery({
    queryKey: ['escalation-history', alertId],
    queryFn: async () => {
      let query = supabase
        .from('alert_escalation_history')
        .select(`
          *,
          alert_escalation_rules (
            rule_name,
            escalation_level
          )
        `)
        .order('escalated_at', { ascending: false });

      if (alertId) {
        query = query.eq('alert_id', alertId);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      return data;
    },
    enabled: alertId ? !!alertId : true,
  });
};
