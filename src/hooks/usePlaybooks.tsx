import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Playbook = Database["public"]["Tables"]["security_playbooks"]["Row"];
type PlaybookInsert = Database["public"]["Tables"]["security_playbooks"]["Insert"];
type PlaybookExecution = Database["public"]["Tables"]["playbook_executions"]["Row"];

export interface PlaybookStep {
  title: string;
  description: string;
  action: string;
  estimatedMinutes?: number;
}

export const usePlaybooks = (incidentType?: string) => {
  const queryClient = useQueryClient();

  // Fetch playbooks
  const { data: playbooks = [], isLoading } = useQuery({
    queryKey: ["playbooks", incidentType],
    queryFn: async () => {
      let query = supabase
        .from("security_playbooks")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (incidentType) {
        query = query.eq("incident_type", incidentType as Database["public"]["Enums"]["incident_type"]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Playbook[];
    },
  });

  // Create playbook
  const createPlaybook = useMutation({
    mutationFn: async (playbook: PlaybookInsert) => {
      const { error } = await supabase
        .from("security_playbooks")
        .insert(playbook);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
      toast({
        title: "Playbook created",
        description: "Security playbook created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create playbook",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update playbook
  const updatePlaybook = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Playbook>;
    }) => {
      const { error } = await supabase
        .from("security_playbooks")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
      toast({
        title: "Playbook updated",
        description: "Security playbook updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update playbook",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete playbook
  const deletePlaybook = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("security_playbooks")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbooks"] });
      toast({
        title: "Playbook deactivated",
        description: "Security playbook has been deactivated",
      });
    },
  });

  return {
    playbooks,
    isLoading,
    createPlaybook,
    updatePlaybook,
    deletePlaybook,
  };
};

export const usePlaybookExecution = (incidentId?: string) => {
  const queryClient = useQueryClient();

  // Fetch execution for incident
  const { data: execution, isLoading } = useQuery({
    queryKey: ["playbook_execution", incidentId],
    queryFn: async () => {
      if (!incidentId) return null;
      
      const { data, error } = await supabase
        .from("playbook_executions")
        .select("*, security_playbooks(*)")
        .eq("incident_id", incidentId)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!incidentId,
  });

  // Start playbook execution
  const startExecution = useMutation({
    mutationFn: async ({
      playbookId,
      incidentId,
      userId,
    }: {
      playbookId: string;
      incidentId: string;
      userId: string;
    }) => {
      const { error } = await supabase
        .from("playbook_executions")
        .insert({
          playbook_id: playbookId,
          incident_id: incidentId,
          executed_by: userId,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbook_execution"] });
      toast({
        title: "Playbook started",
        description: "Following the security playbook",
      });
    },
  });

  // Update step status
  const updateStepStatus = useMutation({
    mutationFn: async ({
      executionId,
      stepIndex,
      status,
      currentStep,
    }: {
      executionId: string;
      stepIndex: number;
      status: "pending" | "completed" | "skipped";
      currentStep: number;
    }) => {
      // Get current execution
      const { data: exec } = await supabase
        .from("playbook_executions")
        .select("step_statuses")
        .eq("id", executionId)
        .single();

      const stepStatuses = (exec?.step_statuses as Record<string, string>) || {};
      stepStatuses[stepIndex.toString()] = status;

      const { error } = await supabase
        .from("playbook_executions")
        .update({
          step_statuses: stepStatuses,
          current_step: currentStep,
        })
        .eq("id", executionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbook_execution"] });
    },
  });

  // Complete execution
  const completeExecution = useMutation({
    mutationFn: async ({
      executionId,
      notes,
    }: {
      executionId: string;
      notes?: string;
    }) => {
      const { error } = await supabase
        .from("playbook_executions")
        .update({
          completed_at: new Date().toISOString(),
          notes,
        })
        .eq("id", executionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playbook_execution"] });
      toast({
        title: "Playbook completed",
        description: "Incident response playbook completed",
      });
    },
  });

  return {
    execution,
    isLoading,
    startExecution,
    updateStepStatus,
    completeExecution,
  };
};
