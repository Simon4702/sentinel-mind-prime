import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface IOCData {
  indicator_type: string;
  indicator_value: string;
  risk_score?: number;
  tags?: string[];
  description?: string;
}

interface AlertData {
  title: string;
  alert_type: string;
  priority: string;
  description?: string;
  source_system?: string;
  raw_data?: Record<string, unknown>;
}

interface IncidentData {
  title: string;
  incident_type: string;
  severity: string;
  status: string;
  detected_at: string;
  description?: string;
  detection_method?: string;
  risk_score?: number;
}

interface ThreatData {
  threat_type: string;
  indicator_type: string;
  indicator_value: string;
  severity: string;
  source: string;
  description?: string;
  first_seen?: string;
}

type AnalysisType = "ioc_analysis" | "alert_triage" | "incident_summary" | "threat_enrichment";

export const useAIAnalysis = () => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const analyze = async (
    type: AnalysisType,
    data: IOCData | AlertData | IncidentData | ThreatData
  ): Promise<string | null> => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const { data: result, error } = await supabase.functions.invoke("ai-threat-analysis", {
        body: { type, data },
      });

      if (error) {
        throw error;
      }

      if (result?.error) {
        throw new Error(result.error);
      }

      const analysis = result?.analysis || "No analysis available";
      setAnalysisResult(analysis);
      return analysis;
    } catch (error) {
      console.error("AI Analysis error:", error);
      const message = error instanceof Error ? error.message : "Failed to analyze";
      
      toast({
        title: "Analysis Failed",
        description: message,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeIOC = (ioc: IOCData) => analyze("ioc_analysis", ioc);
  const triageAlert = (alert: AlertData) => analyze("alert_triage", alert);
  const summarizeIncident = (incident: IncidentData) => analyze("incident_summary", incident);
  const enrichThreat = (threat: ThreatData) => analyze("threat_enrichment", threat);

  const clearAnalysis = () => setAnalysisResult(null);

  return {
    isAnalyzing,
    analysisResult,
    analyzeIOC,
    triageAlert,
    summarizeIncident,
    enrichThreat,
    clearAnalysis,
  };
};
