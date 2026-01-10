import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlaybookExecutor } from "@/components/PlaybookExecutor";
import { AIAnalysisPanel } from "@/components/AIAnalysisPanel";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import type { Database } from "@/integrations/supabase/types";
import { AlertTriangle, Calendar, Clock, User, Brain } from "lucide-react";

type Incident = Database["public"]["Tables"]["security_incidents"]["Row"];

interface IncidentDetailsProps {
  incident: Incident;
}

export const IncidentDetails = ({ incident }: IncidentDetailsProps) => {
  const { summarizeIncident, isAnalyzing, analysisResult, clearAnalysis } = useAIAnalysis();

  const handleAIAnalysis = () => {
    summarizeIncident({
      title: incident.title,
      incident_type: incident.incident_type,
      severity: incident.severity,
      status: incident.status,
      detected_at: incident.detected_at,
      description: incident.description || undefined,
      detection_method: incident.detection_method || undefined,
      risk_score: incident.risk_score || undefined,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "destructive";
      case "investigating":
      case "contained":
        return "secondary";
      case "resolved":
        return "default";
      case "closed":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                {incident.title}
              </CardTitle>
              <CardDescription className="mt-2">
                {incident.description || "No description provided"}
              </CardDescription>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex flex-col gap-2">
                <Badge variant={getSeverityColor(incident.severity)}>
                  {incident.severity}
                </Badge>
                <Badge variant={getStatusColor(incident.status)}>
                  {incident.status}
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAIAnalysis}
                disabled={isAnalyzing}
                className="gap-2"
              >
                <Brain className="h-4 w-4" />
                {isAnalyzing ? "Analyzing..." : "AI Summary"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Type:</span>
              <span>{incident.incident_type.replace(/_/g, " ")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Detected:</span>
              <span>{new Date(incident.detected_at).toLocaleString()}</span>
            </div>
            {incident.detection_method && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Detection Method:</span>
                <span>{incident.detection_method}</span>
              </div>
            )}
            {incident.risk_score !== null && incident.risk_score !== undefined && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="font-medium">Risk Score:</span>
                <span>{incident.risk_score}/100</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {(analysisResult || isAnalyzing) && (
        <AIAnalysisPanel
          title="Incident Summary & Recommendations"
          analysisType="Incident"
          isAnalyzing={isAnalyzing}
          analysisResult={analysisResult}
          onAnalyze={handleAIAnalysis}
          onClose={clearAnalysis}
        />
      )}

      <PlaybookExecutor
        incidentId={incident.id}
        incidentType={incident.incident_type}
      />
    </div>
  );
};
