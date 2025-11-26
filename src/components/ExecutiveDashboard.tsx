import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Target,
  CheckCircle,
} from "lucide-react";

interface ExecutiveMetrics {
  securityPosture: number;
  totalIncidents: number;
  activeThreats: number;
  criticalAlerts: number;
  riskTrend: "up" | "down" | "stable";
  incidentTrend: any[];
  severityDistribution: any[];
  departmentRisks: any[];
  topThreats: any[];
  complianceScore: number;
}

export const ExecutiveDashboard = () => {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<ExecutiveMetrics>({
    securityPosture: 0,
    totalIncidents: 0,
    activeThreats: 0,
    criticalAlerts: 0,
    riskTrend: "stable",
    incidentTrend: [],
    severityDistribution: [],
    departmentRisks: [],
    topThreats: [],
    complianceScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExecutiveMetrics();
  }, [profile?.organization_id]);

  const fetchExecutiveMetrics = async () => {
    if (!profile?.organization_id) return;

    setLoading(true);
    try {
      // Fetch incidents
      const { data: incidents } = await supabase
        .from("security_incidents")
        .select("*")
        .eq("organization_id", profile.organization_id);

      // Fetch threats
      const { data: threats } = await supabase
        .from("threat_intelligence")
        .select("*")
        .eq("is_active", true)
        .or(`organization_id.eq.${profile.organization_id},organization_id.is.null`);

      // Fetch alerts
      const { data: alerts } = await supabase
        .from("security_alerts")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .eq("is_resolved", false);

      // Fetch departments with risk levels
      const { data: departments } = await supabase
        .from("departments")
        .select("name, risk_level")
        .eq("organization_id", profile.organization_id);

      // Fetch risk scores for compliance
      const { data: riskScores } = await supabase
        .from("risk_scores")
        .select("compliance_score");

      // Calculate metrics
      const totalIncidents = incidents?.length || 0;
      const activeThreats = threats?.length || 0;
      const criticalAlerts = alerts?.filter((a) => a.priority === "critical").length || 0;

      // Calculate security posture (0-100 scale)
      const avgCompliance = riskScores?.length
        ? riskScores.reduce((sum, r) => sum + (r.compliance_score || 0), 0) / riskScores.length
        : 85;
      const openIncidents = incidents?.filter((i) => i.status !== "resolved" && i.status !== "closed").length || 0;
      const securityPosture = Math.max(
        0,
        Math.min(100, avgCompliance - openIncidents * 2 - criticalAlerts * 3)
      );

      // Incident trend over last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split("T")[0];
      });

      const incidentTrend = last7Days.map((date) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        incidents: incidents?.filter((i) => i.created_at.startsWith(date)).length || 0,
        alerts: alerts?.filter((a) => a.created_at.startsWith(date)).length || 0,
      }));

      // Severity distribution
      const severityCount = {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      };

      incidents?.forEach((i) => {
        severityCount[i.severity]++;
      });

      const severityDistribution = Object.entries(severityCount).map(([severity, count]) => ({
        name: severity.charAt(0).toUpperCase() + severity.slice(1),
        value: count,
      }));

      // Department risks
      const departmentRisks = departments
        ?.map((d) => ({
          name: d.name,
          risk: d.risk_level || 1,
        }))
        .sort((a, b) => b.risk - a.risk)
        .slice(0, 5) || [];

      // Top threats
      const topThreats = threats
        ?.filter((t) => t.confidence_level && t.confidence_level > 70)
        .sort((a, b) => (b.confidence_level || 0) - (a.confidence_level || 0))
        .slice(0, 5)
        .map((t) => ({
          type: t.threat_type,
          confidence: t.confidence_level,
          severity: t.severity,
        })) || [];

      // Determine trend
      const recentIncidents = incidents?.filter((i) => {
        const daysSince = Math.floor(
          (Date.now() - new Date(i.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysSince <= 7;
      }).length || 0;

      const previousIncidents = incidents?.filter((i) => {
        const daysSince = Math.floor(
          (Date.now() - new Date(i.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysSince > 7 && daysSince <= 14;
      }).length || 0;

      const riskTrend = recentIncidents > previousIncidents ? "up" : recentIncidents < previousIncidents ? "down" : "stable";

      setMetrics({
        securityPosture,
        totalIncidents,
        activeThreats,
        criticalAlerts,
        riskTrend,
        incidentTrend,
        severityDistribution,
        departmentRisks,
        topThreats,
        complianceScore: avgCompliance,
      });
    } catch (error) {
      console.error("Error fetching executive metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPostureColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getPostureStatus = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Critical";
  };

  const COLORS = {
    low: "#10b981",
    medium: "#f59e0b",
    high: "#ef4444",
    critical: "#991b1b",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading executive metrics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Executive Security Dashboard</h2>
          <p className="text-muted-foreground">
            High-level security posture and key performance indicators
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </Badge>
      </div>

      {/* Security Posture Score */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Overall Security Posture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-6xl font-bold ${getPostureColor(metrics.securityPosture)}`}>
                {metrics.securityPosture.toFixed(0)}
              </div>
              <div className="text-xl text-muted-foreground mt-2">
                {getPostureStatus(metrics.securityPosture)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {metrics.riskTrend === "up" ? (
                <TrendingUp className="h-12 w-12 text-red-500" />
              ) : metrics.riskTrend === "down" ? (
                <TrendingDown className="h-12 w-12 text-green-500" />
              ) : (
                <Activity className="h-12 w-12 text-yellow-500" />
              )}
              <span className="text-sm text-muted-foreground">
                {metrics.riskTrend === "up" ? "Increasing Risk" : metrics.riskTrend === "down" ? "Decreasing Risk" : "Stable"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Total Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.totalIncidents}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Active Threats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{metrics.activeThreats}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{metrics.criticalAlerts}</div>
            <p className="text-xs text-muted-foreground mt-1">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {metrics.complianceScore.toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average across users</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Trend */}
        <Card>
          <CardHeader>
            <CardTitle>7-Day Incident Trend</CardTitle>
            <CardDescription>Incidents and alerts over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.incidentTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Legend />
                <Line type="monotone" dataKey="incidents" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="alerts" stroke="hsl(var(--destructive))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Incident Severity Distribution</CardTitle>
            <CardDescription>Breakdown by severity level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.severityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Risk Levels */}
        <Card>
          <CardHeader>
            <CardTitle>Top Risk Departments</CardTitle>
            <CardDescription>Departments with highest risk scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={metrics.departmentRisks}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="risk" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Threats */}
        <Card>
          <CardHeader>
            <CardTitle>High-Confidence Threats</CardTitle>
            <CardDescription>Active threats with highest confidence</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topThreats.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No high-confidence threats detected
                </div>
              ) : (
                metrics.topThreats.map((threat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{threat.type}</div>
                      <div className="text-sm text-muted-foreground">
                        Confidence: {threat.confidence}%
                      </div>
                    </div>
                    <Badge
                      className={
                        threat.severity === "critical"
                          ? "bg-red-500"
                          : threat.severity === "high"
                          ? "bg-orange-500"
                          : "bg-yellow-500"
                      }
                    >
                      {threat.severity}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
