import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Brain,
  Shield,
  Zap,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Lock,
  Eye,
  Target,
  Loader2,
  Sparkles,
  History,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface LearnedPattern {
  id: string;
  pattern_name: string;
  attack_type: string;
  indicators: string[];
  confidence_score: number;
  times_detected: number;
  last_seen_at: string;
  is_active: boolean;
}

interface AdaptiveRule {
  id: string;
  rule_name: string;
  rule_type: string;
  description: string;
  priority: number;
  is_enabled: boolean;
  times_triggered: number;
  effectiveness_score: number;
}

interface LearningEvent {
  id: string;
  event_type: string;
  patterns_identified: number;
  rules_generated: number;
  processing_time_ms: number;
  status: string;
  created_at: string;
}

export const AdaptiveLearningSystem = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [isLearning, setIsLearning] = useState(false);
  const [patterns, setPatterns] = useState<LearnedPattern[]>([]);
  const [rules, setRules] = useState<AdaptiveRule[]>([]);
  const [recentEvents, setRecentEvents] = useState<LearningEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLearningStatus = async () => {
    if (!profile?.organization_id) return;

    try {
      const response = await supabase.functions.invoke("adaptive-learning", {
        body: {
          action: "get_learning_status",
          organizationId: profile.organization_id,
        },
      });

      if (response.error) throw response.error;

      const data = response.data;
      setPatterns(data.patterns || []);
      setRules(data.rules || []);
      setRecentEvents(data.recent_events || []);
    } catch (error) {
      console.error("Error fetching learning status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLearningStatus();
  }, [profile?.organization_id]);

  const runLearningCycle = async () => {
    if (!profile?.organization_id) return;

    setIsLearning(true);
    toast({
      title: "Learning Initiated",
      description: "AI is analyzing attack patterns and generating defense rules...",
    });

    try {
      const response = await supabase.functions.invoke("adaptive-learning", {
        body: {
          action: "analyze_and_learn",
          organizationId: profile.organization_id,
        },
      });

      if (response.error) throw response.error;

      const data = response.data;
      
      toast({
        title: "Learning Complete",
        description: `Identified ${data.patterns_learned} patterns and generated ${data.rules_generated} defense rules.`,
      });

      // Refresh data
      await fetchLearningStatus();
    } catch (error) {
      console.error("Learning cycle error:", error);
      toast({
        title: "Learning Failed",
        description: error instanceof Error ? error.message : "Failed to complete learning cycle",
        variant: "destructive",
      });
    } finally {
      setIsLearning(false);
    }
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from("adaptive_defense_rules")
        .update({ is_enabled: enabled })
        .eq("id", ruleId);

      if (error) throw error;

      setRules(prev =>
        prev.map(r => (r.id === ruleId ? { ...r, is_enabled: enabled } : r))
      );

      toast({
        title: enabled ? "Rule Enabled" : "Rule Disabled",
        description: `Defense rule has been ${enabled ? "activated" : "deactivated"}.`,
      });
    } catch (error) {
      console.error("Error toggling rule:", error);
    }
  };

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case "block": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "isolate": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "alert": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "rate_limit": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "quarantine": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getAttackTypeIcon = (type: string) => {
    switch (type) {
      case "phishing": return Target;
      case "malware": return AlertTriangle;
      case "ransomware": return Lock;
      case "apt": return Eye;
      default: return Shield;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-400" />
            Adaptive Learning System
          </h2>
          <p className="text-muted-foreground">
            AI-powered defense that learns from attacks and evolves automatically
          </p>
        </div>
        <Button
          onClick={runLearningCycle}
          disabled={isLearning}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isLearning ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Learning...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Run Learning Cycle
            </>
          )}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Patterns Learned</p>
                <p className="text-2xl font-bold">{patterns.length}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Rules</p>
                <p className="text-2xl font-bold">{rules.filter(r => r.is_enabled).length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Threats Blocked</p>
                <p className="text-2xl font-bold">
                  {rules.reduce((sum, r) => sum + r.times_triggered, 0)}
                </p>
              </div>
              <Zap className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
                <p className="text-2xl font-bold">
                  {patterns.length > 0
                    ? Math.round(
                        patterns.reduce((sum, p) => sum + (p.confidence_score || 0), 0) /
                          patterns.length
                      )
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learned Attack Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-400" />
              Learned Attack Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {patterns.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Brain className="h-8 w-8 mb-2 opacity-50" />
                  <p>No patterns learned yet</p>
                  <p className="text-sm">Run a learning cycle to analyze attacks</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patterns.map((pattern) => {
                    const Icon = getAttackTypeIcon(pattern.attack_type);
                    return (
                      <div
                        key={pattern.id}
                        className="p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-red-400" />
                            <span className="font-medium">{pattern.pattern_name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {pattern.attack_type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Confidence: {pattern.confidence_score}%</span>
                          <span>Detected: {pattern.times_detected}x</span>
                        </div>
                        <Progress
                          value={pattern.confidence_score}
                          className="h-1 mt-2"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Adaptive Defense Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-400" />
              Adaptive Defense Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {rules.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                  <Shield className="h-8 w-8 mb-2 opacity-50" />
                  <p>No defense rules generated</p>
                  <p className="text-sm">Run a learning cycle to create rules</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-3 rounded-lg border bg-card/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{rule.rule_name}</span>
                            <Badge className={getRuleTypeColor(rule.rule_type)}>
                              {rule.rule_type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {rule.description}
                          </p>
                        </div>
                        <Switch
                          checked={rule.is_enabled}
                          onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                        />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Triggered: {rule.times_triggered}x
                        </span>
                        <span>Priority: {rule.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Recent Learning Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            Learning History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <RefreshCw className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No learning events yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    {event.status === "completed" ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    )}
                    <div>
                      <p className="font-medium capitalize">
                        {event.event_type.replace(/_/g, " ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p>
                      {event.patterns_identified} patterns, {event.rules_generated} rules
                    </p>
                    <p className="text-muted-foreground">
                      {event.processing_time_ms}ms
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdaptiveLearningSystem;
