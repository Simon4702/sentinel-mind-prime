import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  Settings,
  History,
  RefreshCw,
  Lock,
  Ban,
  FileX,
  UserX,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface RemediationRule {
  id: string;
  name: string;
  trigger_type: string;
  severity_threshold: string[];
  actions: string[];
  is_enabled: boolean;
}

interface ExecutedAction {
  type: string;
  target: string;
  action: string;
  status: "pending" | "executed" | "failed" | "rolled_back";
  details: any;
  timestamp: string;
}

const actionIcons: Record<string, React.ReactNode> = {
  block_ip: <Ban className="h-4 w-4" />,
  isolate_endpoint: <Lock className="h-4 w-4" />,
  disable_user: <UserX className="h-4 w-4" />,
  quarantine_file: <FileX className="h-4 w-4" />,
  create_alert: <AlertTriangle className="h-4 w-4" />,
  revoke_sessions: <XCircle className="h-4 w-4" />,
};

export const AutoRemediationEngine = () => {
  const { toast } = useToast();
  const [executing, setExecuting] = useState<string | null>(null);
  const [executionHistory, setExecutionHistory] = useState<ExecutedAction[]>([]);
  const [enabledRules, setEnabledRules] = useState<Record<string, boolean>>({});

  const { data: rules, isLoading, refetch } = useQuery({
    queryKey: ["remediation-rules"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("auto-remediation", {
        body: { action: "get_rules" },
      });
      if (error) throw error;
      
      const rulesData = data.rules as RemediationRule[];
      const initialEnabled: Record<string, boolean> = {};
      rulesData.forEach(r => { initialEnabled[r.id] = r.is_enabled; });
      setEnabledRules(initialEnabled);
      
      return rulesData;
    },
  });

  const { data: defenseActions } = useQuery({
    queryKey: ["defense-actions-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("defense_actions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const testRule = async (rule: RemediationRule) => {
    setExecuting(rule.id);
    try {
      const testTarget = {
        id: "test-" + Date.now(),
        indicator_value: "192.168.1.100",
        hostname: "test-endpoint",
        user_id: "test-user",
      };

      const { data, error } = await supabase.functions.invoke("auto-remediation", {
        body: {
          action: "execute",
          rule_id: rule.id,
          trigger_type: rule.trigger_type,
          severity: rule.severity_threshold[0],
          target: testTarget,
          dry_run: false,
        },
      });

      if (error) throw error;

      setExecutionHistory(prev => [
        ...data.actions_executed,
        ...prev,
      ].slice(0, 50));

      toast({
        title: "Remediation Executed",
        description: `${data.summary.succeeded}/${data.summary.total} actions completed successfully`,
      });
    } catch (error) {
      console.error("Remediation test failed:", error);
      toast({
        title: "Execution Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setExecuting(null);
    }
  };

  const toggleRule = (ruleId: string) => {
    setEnabledRules(prev => ({
      ...prev,
      [ruleId]: !prev[ruleId],
    }));
    toast({
      title: enabledRules[ruleId] ? "Rule Disabled" : "Rule Enabled",
      description: `Auto-remediation rule has been ${enabledRules[ruleId] ? "disabled" : "enabled"}`,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/20 text-red-400";
      case "high": return "bg-orange-500/20 text-orange-400";
      case "medium": return "bg-yellow-500/20 text-yellow-400";
      default: return "bg-blue-500/20 text-blue-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "executed": return "text-emerald-400";
      case "completed": return "text-emerald-400";
      case "failed": return "text-red-400";
      case "pending": return "text-yellow-400";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Auto-Remediation Engine</h2>
            <p className="text-sm text-muted-foreground">
              Automated threat response and containment
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rules Panel */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5 text-primary" />
              Remediation Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {rules?.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <span className="font-medium">{rule.name}</span>
                        </div>
                        <Switch
                          checked={enabledRules[rule.id] ?? rule.is_enabled}
                          onCheckedChange={() => toggleRule(rule.id)}
                        />
                      </div>

                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {rule.trigger_type.replace(/_/g, " ")}
                        </Badge>
                        {rule.severity_threshold.map((sev) => (
                          <Badge key={sev} className={`text-xs ${getSeverityColor(sev)}`}>
                            {sev}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {rule.actions.map((action) => (
                          <div
                            key={action}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-background text-xs"
                          >
                            {actionIcons[action] || <Zap className="h-3 w-3" />}
                            <span>{action.replace(/_/g, " ")}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => testRule(rule)}
                        disabled={executing === rule.id || !enabledRules[rule.id]}
                      >
                        {executing === rule.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        Test Rule
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Execution History */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5 text-primary" />
              Execution History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {/* Recent test executions */}
                {executionHistory.map((action, idx) => (
                  <div
                    key={`exec-${idx}`}
                    className="p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {actionIcons[action.type] || <Zap className="h-4 w-4" />}
                        <span className="font-medium text-sm">
                          {action.type.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className={`flex items-center gap-1 ${getStatusColor(action.status)}`}>
                        {action.status === "executed" ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        <span className="text-xs">{action.status}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{action.action}</p>
                    <p className="text-xs text-muted-foreground">
                      Target: {action.target}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(action.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}

                {/* Database history */}
                {defenseActions?.map((action: any) => (
                  <div
                    key={action.id}
                    className="p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">
                          {action.action_type}
                        </span>
                      </div>
                      <Badge className={getStatusColor(action.status)}>
                        {action.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {action.trigger_reason}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(action.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}

                {executionHistory.length === 0 && (!defenseActions || defenseActions.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No execution history yet</p>
                    <p className="text-xs">Test a rule to see results here</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
