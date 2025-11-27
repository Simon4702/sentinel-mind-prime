import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AssignmentRule {
  id: string;
  enabled: boolean;
  method: "round_robin" | "least_loaded" | "department_based";
  priority: number;
}

interface AnalystWorkload {
  analyst_id: string;
  full_name: string;
  department_id: string | null;
  active_incidents: number;
}

export const useIncidentAssignment = () => {
  const [rules, setRules] = useState<AssignmentRule[]>([
    { id: "1", enabled: true, method: "least_loaded", priority: 1 },
    { id: "2", enabled: false, method: "department_based", priority: 2 },
    { id: "3", enabled: false, method: "round_robin", priority: 3 },
  ]);

  const getAnalystWorkloads = async (organizationId: string): Promise<AnalystWorkload[]> => {
    // Get all security analysts in the organization
    const { data: analysts, error: analystsError } = await supabase
      .from("profiles")
      .select("user_id, full_name, department_id")
      .eq("organization_id", organizationId)
      .eq("role", "security_analyst");

    if (analystsError) throw analystsError;
    if (!analysts || analysts.length === 0) return [];

    // Get workload for each analyst
    const workloads = await Promise.all(
      analysts.map(async (analyst) => {
        const { count } = await supabase
          .from("security_incidents")
          .select("*", { count: "exact", head: true })
          .eq("assigned_to", analyst.user_id)
          .in("status", ["open", "investigating"]);

        return {
          analyst_id: analyst.user_id,
          full_name: analyst.full_name || "Unknown",
          department_id: analyst.department_id,
          active_incidents: count || 0,
        };
      })
    );

    return workloads;
  };

  const assignIncidentLeastLoaded = async (
    organizationId: string,
    departmentId?: string | null
  ): Promise<string | null> => {
    const workloads = await getAnalystWorkloads(organizationId);
    
    if (workloads.length === 0) return null;

    // Filter by department if specified
    const filteredWorkloads = departmentId
      ? workloads.filter((w) => w.department_id === departmentId)
      : workloads;

    if (filteredWorkloads.length === 0) {
      // Fallback to any analyst if no department match
      return workloads.sort((a, b) => a.active_incidents - b.active_incidents)[0].analyst_id;
    }

    // Sort by workload and return analyst with least incidents
    const leastLoaded = filteredWorkloads.sort(
      (a, b) => a.active_incidents - b.active_incidents
    )[0];

    return leastLoaded.analyst_id;
  };

  const assignIncidentDepartmentBased = async (
    organizationId: string,
    departmentId?: string | null
  ): Promise<string | null> => {
    if (!departmentId) return assignIncidentLeastLoaded(organizationId);

    const workloads = await getAnalystWorkloads(organizationId);
    const departmentAnalysts = workloads.filter(
      (w) => w.department_id === departmentId
    );

    if (departmentAnalysts.length === 0) {
      // No department-specific analysts, fallback to least loaded
      return assignIncidentLeastLoaded(organizationId);
    }

    // Return least loaded analyst in the department
    const assigned = departmentAnalysts.sort(
      (a, b) => a.active_incidents - b.active_incidents
    )[0];

    return assigned.analyst_id;
  };

  const assignIncidentRoundRobin = async (
    organizationId: string
  ): Promise<string | null> => {
    const workloads = await getAnalystWorkloads(organizationId);
    
    if (workloads.length === 0) return null;

    // Get last assigned analyst from localStorage for this org
    const storageKey = `last_assigned_${organizationId}`;
    const lastAssignedIndex = parseInt(localStorage.getItem(storageKey) || "0", 10);
    
    // Get next analyst in round-robin
    const nextIndex = (lastAssignedIndex + 1) % workloads.length;
    localStorage.setItem(storageKey, nextIndex.toString());

    return workloads[nextIndex].analyst_id;
  };

  const autoAssignIncident = async (
    incidentId: string,
    organizationId: string,
    departmentId?: string | null
  ): Promise<boolean> => {
    try {
      const activeRule = rules.find((r) => r.enabled);
      
      if (!activeRule) {
        toast({
          title: "Auto-assignment disabled",
          description: "No assignment rules are enabled",
          variant: "destructive",
        });
        return false;
      }

      let assignedTo: string | null = null;

      switch (activeRule.method) {
        case "least_loaded":
          assignedTo = await assignIncidentLeastLoaded(organizationId, departmentId);
          break;
        case "department_based":
          assignedTo = await assignIncidentDepartmentBased(organizationId, departmentId);
          break;
        case "round_robin":
          assignedTo = await assignIncidentRoundRobin(organizationId);
          break;
      }

      if (!assignedTo) {
        toast({
          title: "Assignment failed",
          description: "No available analysts to assign",
          variant: "destructive",
        });
        return false;
      }

      // Update incident with assigned analyst
      const { error: updateError } = await supabase
        .from("security_incidents")
        .update({ assigned_to: assignedTo })
        .eq("id", incidentId);

      if (updateError) throw updateError;

      // Get analyst name for toast
      const { data: analyst } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", assignedTo)
        .single();

      toast({
        title: "Incident auto-assigned",
        description: `Assigned to ${analyst?.full_name || "analyst"} using ${activeRule.method} method`,
      });

      return true;
    } catch (error) {
      console.error("Auto-assignment error:", error);
      toast({
        title: "Assignment error",
        description: "Failed to auto-assign incident",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    rules,
    setRules,
    autoAssignIncident,
  };
};
