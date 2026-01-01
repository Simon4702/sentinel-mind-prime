import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  GitBranch,
  Shield,
  Zap,
  AlertTriangle,
  Clock,
  Target,
  Eye,
  Plus,
  RefreshCw,
  ChevronRight,
  Loader2,
  Brain,
  Lock,
  Network,
  UserX,
  Key,
  FileWarning,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CorrelationRule {
  id: string;
  rule_name: string;
  description: string | null;
  conditions: {
    event_types?: string[];
    time_window_minutes?: number;
    threshold?: number;
    sequence?: string[];
    source_ip_match?: boolean;
    user_match?: boolean;
  };
  actions: {
    create_alert?: boolean;
    alert_severity?: string;
    notify_soc?: boolean;
    auto_block?: boolean;
    create_incident?: boolean;
  }[];
  severity: string | null;
  is_enabled: boolean | null;
  times_triggered: number | null;
  last_triggered_at: string | null;
  created_at: string;
}

const ruleIcons: Record<string, React.ElementType> = {
  "brute-force": Lock,
  "lateral-movement": Network,
  "privilege-escalation": Key,
  "data-exfiltration": FileWarning,
  "insider-threat": UserX,
  default: Brain,
};

const severityColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export const CorrelationRules = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [rules, setRules] = useState<CorrelationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<CorrelationRule | null>(null);

  const fetchRules = async () => {
    if (!profile?.organization_id) return;

    try {
      const { data, error } = await supabase
        .from("siem_correlation_rules")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("severity", { ascending: true });

      if (error) throw error;
      setRules((data as CorrelationRule[]) || []);
    } catch (error) {
      console.error("Error fetching correlation rules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const seedSampleRules = async () => {
    if (!profile?.organization_id) return;

    const sampleRules = [
      {
        organization_id: profile.organization_id,
        rule_name: "Brute Force Attack Detection",
        description: "Detects multiple failed login attempts from the same source IP within a short time window, indicating potential credential stuffing or brute force attack.",
        conditions: {
          event_types: ["authentication_failure"],
          time_window_minutes: 5,
          threshold: 10,
          source_ip_match: true,
        },
        actions: [{ create_alert: true, alert_severity: "high", notify_soc: true, auto_block: true }],
        severity: "high",
        is_enabled: true,
      },
      {
        organization_id: profile.organization_id,
        rule_name: "Lateral Movement Sequence",
        description: "Identifies sequential access patterns across multiple systems that may indicate an attacker moving laterally through the network after initial compromise.",
        conditions: {
          event_types: ["remote_access", "service_creation", "scheduled_task"],
          time_window_minutes: 30,
          threshold: 3,
          sequence: ["initial_access", "discovery", "lateral_movement"],
          user_match: true,
        },
        actions: [{ create_alert: true, alert_severity: "critical", notify_soc: true, create_incident: true }],
        severity: "critical",
        is_enabled: true,
      },
      {
        organization_id: profile.organization_id,
        rule_name: "Privilege Escalation Chain",
        description: "Monitors for privilege escalation attempts including sudo abuse, token manipulation, and unauthorized admin access patterns.",
        conditions: {
          event_types: ["privilege_change", "sudo_execution", "admin_access"],
          time_window_minutes: 15,
          threshold: 2,
          user_match: true,
        },
        actions: [{ create_alert: true, alert_severity: "critical", notify_soc: true, auto_block: false }],
        severity: "critical",
        is_enabled: true,
      },
      {
        organization_id: profile.organization_id,
        rule_name: "Data Exfiltration Pattern",
        description: "Detects unusual data transfer volumes or patterns that may indicate data exfiltration, including large file uploads to external services.",
        conditions: {
          event_types: ["file_upload", "data_transfer", "cloud_sync"],
          time_window_minutes: 60,
          threshold: 5,
        },
        actions: [{ create_alert: true, alert_severity: "high", notify_soc: true }],
        severity: "high",
        is_enabled: true,
      },
      {
        organization_id: profile.organization_id,
        rule_name: "After-Hours Access Anomaly",
        description: "Flags access to sensitive resources during non-business hours, which may indicate compromised credentials or insider threat activity.",
        conditions: {
          event_types: ["resource_access", "file_access", "database_query"],
          time_window_minutes: 120,
          threshold: 1,
        },
        actions: [{ create_alert: true, alert_severity: "medium", notify_soc: false }],
        severity: "medium",
        is_enabled: true,
      },
      {
        organization_id: profile.organization_id,
        rule_name: "Command & Control Beacon Detection",
        description: "Identifies regular, periodic network connections that may indicate malware beaconing to command and control infrastructure.",
        conditions: {
          event_types: ["network_connection", "dns_query", "http_request"],
          time_window_minutes: 60,
          threshold: 10,
          source_ip_match: true,
        },
        actions: [{ create_alert: true, alert_severity: "critical", notify_soc: true, auto_block: true }],
        severity: "critical",
        is_enabled: true,
      },
      {
        organization_id: profile.organization_id,
        rule_name: "Suspicious PowerShell Activity",
        description: "Monitors for encoded or obfuscated PowerShell commands commonly used in malware and attack scripts.",
        conditions: {
          event_types: ["process_creation", "script_execution"],
          time_window_minutes: 5,
          threshold: 1,
        },
        actions: [{ create_alert: true, alert_severity: "high", notify_soc: true }],
        severity: "high",
        is_enabled: true,
      },
      {
        organization_id: profile.organization_id,
        rule_name: "Multi-Factor Authentication Bypass",
        description: "Detects attempts to bypass MFA through session hijacking, token theft, or authentication downgrade attacks.",
        conditions: {
          event_types: ["mfa_bypass", "session_anomaly", "auth_downgrade"],
          time_window_minutes: 10,
          threshold: 1,
        },
        actions: [{ create_alert: true, alert_severity: "critical", notify_soc: true, create_incident: true }],
        severity: "critical",
        is_enabled: true,
      },
    ];

    try {
      const { error } = await supabase
        .from("siem_correlation_rules")
        .insert(sampleRules);

      if (error) throw error;

      toast({
        title: "Rules Created",
        description: `${sampleRules.length} correlation rules have been added.`,
      });
      fetchRules();
    } catch (error) {
      console.error("Error seeding rules:", error);
      toast({
        title: "Error",
        description: "Failed to create sample rules.",
        variant: "destructive",
      });
    }
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from("siem_correlation_rules")
        .update({ is_enabled: enabled })
        .eq("id", ruleId);

      if (error) throw error;

      setRules(rules.map(r => 
        r.id === ruleId ? { ...r, is_enabled: enabled } : r
      ));

      toast({
        title: enabled ? "Rule Enabled" : "Rule Disabled",
        description: `Correlation rule has been ${enabled ? "activated" : "deactivated"}.`,
      });
    } catch (error) {
      console.error("Error toggling rule:", error);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [profile?.organization_id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getRuleIcon = (ruleName: string) => {
    if (ruleName.toLowerCase().includes("brute")) return ruleIcons["brute-force"];
    if (ruleName.toLowerCase().includes("lateral")) return ruleIcons["lateral-movement"];
    if (ruleName.toLowerCase().includes("privilege")) return ruleIcons["privilege-escalation"];
    if (ruleName.toLowerCase().includes("exfil")) return ruleIcons["data-exfiltration"];
    if (ruleName.toLowerCase().includes("insider")) return ruleIcons["insider-threat"];
    return ruleIcons.default;
  };

  const activeRules = rules.filter(r => r.is_enabled).length;
  const totalTriggers = rules.reduce((acc, r) => acc + (r.times_triggered || 0), 0);
  const criticalRules = rules.filter(r => r.severity === "critical").length;

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <GitBranch className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rules.length}</p>
                <p className="text-xs text-muted-foreground">Total Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Shield className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeRules}</p>
                <p className="text-xs text-muted-foreground">Active Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Zap className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalTriggers}</p>
                <p className="text-xs text-muted-foreground">Total Triggers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{criticalRules}</p>
                <p className="text-xs text-muted-foreground">Critical Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Correlation Rules
          </h2>
          <p className="text-sm text-muted-foreground">
            Automated multi-stage attack detection patterns
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchRules}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {rules.length === 0 && (
            <Button onClick={seedSampleRules} className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Sample Rules
            </Button>
          )}
        </div>
      </div>

      {/* Rules List */}
      {rules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Correlation Rules</h3>
            <p className="text-muted-foreground mb-4">
              Create correlation rules to automatically detect multi-stage attacks
            </p>
            <Button onClick={seedSampleRules}>
              <Plus className="h-4 w-4 mr-2" />
              Add Sample Rules
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => {
            const RuleIcon = getRuleIcon(rule.rule_name);
            const conditions = rule.conditions || {};
            const actions = rule.actions?.[0] || {};

            return (
              <Card
                key={rule.id}
                className={`transition-all hover:shadow-lg hover:shadow-primary/5 cursor-pointer ${
                  !rule.is_enabled ? "opacity-60" : ""
                }`}
                onClick={() => setSelectedRule(rule)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-xl ${
                        rule.severity === "critical" ? "bg-red-500/20" :
                        rule.severity === "high" ? "bg-orange-500/20" :
                        rule.severity === "medium" ? "bg-yellow-500/20" :
                        "bg-blue-500/20"
                      }`}>
                        <RuleIcon className={`h-6 w-6 ${
                          rule.severity === "critical" ? "text-red-400" :
                          rule.severity === "high" ? "text-orange-400" :
                          rule.severity === "medium" ? "text-yellow-400" :
                          "text-blue-400"
                        }`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{rule.rule_name}</h3>
                          <Badge className={severityColors[rule.severity || "medium"]}>
                            {rule.severity?.toUpperCase()}
                          </Badge>
                          {rule.is_enabled && (
                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                              ACTIVE
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {rule.description}
                        </p>

                        {/* Rule Details */}
                        <div className="flex flex-wrap gap-3 text-xs">
                          {conditions.time_window_minutes && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{conditions.time_window_minutes}min window</span>
                            </div>
                          )}
                          {conditions.threshold && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Target className="h-3 w-3" />
                              <span>Threshold: {conditions.threshold}</span>
                            </div>
                          )}
                          {conditions.event_types && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Zap className="h-3 w-3" />
                              <span>{conditions.event_types.length} event types</span>
                            </div>
                          )}
                          {actions.auto_block && (
                            <Badge variant="outline" className="border-red-500/30 text-red-400 text-xs">
                              Auto-Block
                            </Badge>
                          )}
                          {actions.create_incident && (
                            <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-xs">
                              Creates Incident
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Trigger Stats */}
                      <div className="text-right">
                        <p className="text-2xl font-bold">{rule.times_triggered || 0}</p>
                        <p className="text-xs text-muted-foreground">Triggers</p>
                      </div>

                      {/* Toggle */}
                      <Switch
                        checked={rule.is_enabled || false}
                        onCheckedChange={(checked) => {
                          event?.stopPropagation();
                          toggleRule(rule.id, checked);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />

                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>

                  {/* Detection Pattern Visualization */}
                  {conditions.sequence && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Attack Chain Detection:</p>
                      <div className="flex items-center gap-2">
                        {conditions.sequence.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              {step.replace(/_/g, " ")}
                            </div>
                            {idx < (conditions.sequence?.length || 0) - 1 && (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Rule Details Modal */}
      <Dialog open={!!selectedRule} onOpenChange={() => setSelectedRule(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedRule && (() => {
                const Icon = getRuleIcon(selectedRule.rule_name);
                return <Icon className="h-5 w-5 text-primary" />;
              })()}
              {selectedRule?.rule_name}
            </DialogTitle>
            <DialogDescription>
              {selectedRule?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedRule && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Badge className={severityColors[selectedRule.severity || "medium"]}>
                  {selectedRule.severity?.toUpperCase()} SEVERITY
                </Badge>
                <Badge variant="outline">
                  {selectedRule.times_triggered || 0} triggers
                </Badge>
                {selectedRule.last_triggered_at && (
                  <Badge variant="outline">
                    Last: {new Date(selectedRule.last_triggered_at).toLocaleDateString()}
                  </Badge>
                )}
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Detection Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {selectedRule.conditions?.event_types && (
                    <div>
                      <span className="text-muted-foreground">Event Types:</span>{" "}
                      {selectedRule.conditions.event_types.join(", ")}
                    </div>
                  )}
                  {selectedRule.conditions?.time_window_minutes && (
                    <div>
                      <span className="text-muted-foreground">Time Window:</span>{" "}
                      {selectedRule.conditions.time_window_minutes} minutes
                    </div>
                  )}
                  {selectedRule.conditions?.threshold && (
                    <div>
                      <span className="text-muted-foreground">Threshold:</span>{" "}
                      {selectedRule.conditions.threshold} events
                    </div>
                  )}
                  {selectedRule.conditions?.source_ip_match && (
                    <div>
                      <span className="text-muted-foreground">Source IP Match:</span> Yes
                    </div>
                  )}
                  {selectedRule.conditions?.user_match && (
                    <div>
                      <span className="text-muted-foreground">User Match:</span> Yes
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Automated Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {selectedRule.actions?.map((action, idx) => (
                    <div key={idx} className="flex flex-wrap gap-2">
                      {action.create_alert && (
                        <Badge variant="secondary">Create Alert ({action.alert_severity})</Badge>
                      )}
                      {action.notify_soc && (
                        <Badge variant="secondary">Notify SOC</Badge>
                      )}
                      {action.auto_block && (
                        <Badge variant="destructive">Auto-Block Source</Badge>
                      )}
                      {action.create_incident && (
                        <Badge variant="secondary">Create Incident</Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRule(null)}>
              Close
            </Button>
            <Button
              variant={selectedRule?.is_enabled ? "destructive" : "default"}
              onClick={() => {
                if (selectedRule) {
                  toggleRule(selectedRule.id, !selectedRule.is_enabled);
                  setSelectedRule({ ...selectedRule, is_enabled: !selectedRule.is_enabled });
                }
              }}
            >
              {selectedRule?.is_enabled ? "Disable Rule" : "Enable Rule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CorrelationRules;
