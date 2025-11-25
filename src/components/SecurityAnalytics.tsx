import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  AlertTriangle,
  Users,
  Clock,
  Target,
} from "lucide-react";

const COLORS = {
  critical: "hsl(0, 84%, 60%)",
  high: "hsl(25, 95%, 53%)",
  medium: "hsl(45, 93%, 47%)",
  low: "hsl(142, 71%, 45%)",
  primary: "hsl(195, 100%, 50%)",
  success: "hsl(142, 71%, 45%)",
};

export const SecurityAnalytics = () => {
  // Fetch incidents data
  const { data: incidents = [] } = useQuery({
    queryKey: ["analytics_incidents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_incidents")
        .select("*")
        .order("detected_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch threats data
  const { data: threats = [] } = useQuery({
    queryKey: ["analytics_threats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("threat_intelligence")
        .select("*")
        .order("last_seen", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch alerts data
  const { data: alerts = [] } = useQuery({
    queryKey: ["analytics_alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("security_alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch risk scores
  const { data: riskScores = [] } = useQuery({
    queryKey: ["analytics_risk_scores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("risk_scores")
        .select("*")
        .order("overall_score", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Calculate metrics
  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter((i) => i.status === "open" || i.status === "investigating").length;
  const resolvedIncidents = incidents.filter((i) => i.status === "resolved" || i.status === "closed").length;
  const criticalIncidents = incidents.filter((i) => i.severity === "critical").length;
  const activeThreats = threats.filter((t) => t.is_active).length;
  const totalAlerts = alerts.length;
  const unacknowledgedAlerts = alerts.filter((a) => !a.is_acknowledged).length;

  // Prepare incident trend data (last 7 days)
  const incidentTrendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayIncidents = incidents.filter((inc) => {
      const incDate = new Date(inc.detected_at);
      return incDate.toDateString() === date.toDateString();
    });
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      incidents: dayIncidents.length,
      critical: dayIncidents.filter((i) => i.severity === "critical").length,
      high: dayIncidents.filter((i) => i.severity === "high").length,
    };
  });

  // Incident by severity
  const incidentsBySeverity = [
    { name: "Critical", value: incidents.filter((i) => i.severity === "critical").length, color: COLORS.critical },
    { name: "High", value: incidents.filter((i) => i.severity === "high").length, color: COLORS.high },
    { name: "Medium", value: incidents.filter((i) => i.severity === "medium").length, color: COLORS.medium },
    { name: "Low", value: incidents.filter((i) => i.severity === "low").length, color: COLORS.low },
  ];

  // Incident by type
  const incidentsByType = incidents.reduce((acc, incident) => {
    const type = incident.incident_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const incidentTypeData = Object.entries(incidentsByType)
    .map(([name, value]) => ({
      name: name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      value,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Threat by severity
  const threatsBySeverity = [
    { name: "Critical", value: threats.filter((t) => t.severity === "critical").length, color: COLORS.critical },
    { name: "High", value: threats.filter((t) => t.severity === "high").length, color: COLORS.high },
    { name: "Medium", value: threats.filter((t) => t.severity === "medium").length, color: COLORS.medium },
    { name: "Low", value: threats.filter((t) => t.severity === "low").length, color: COLORS.low },
  ];

  // Risk score distribution
  const riskDistribution = [
    { range: "0-20", count: riskScores.filter((r) => r.overall_score <= 20).length },
    { range: "21-40", count: riskScores.filter((r) => r.overall_score > 20 && r.overall_score <= 40).length },
    { range: "41-60", count: riskScores.filter((r) => r.overall_score > 40 && r.overall_score <= 60).length },
    { range: "61-80", count: riskScores.filter((r) => r.overall_score > 60 && r.overall_score <= 80).length },
    { range: "81-100", count: riskScores.filter((r) => r.overall_score > 80).length },
  ];

  const avgRiskScore = riskScores.length > 0
    ? Math.round(riskScores.reduce((sum, r) => sum + r.overall_score, 0) / riskScores.length)
    : 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Security Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive security metrics and threat intelligence overview
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Total Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIncidents}</div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="border-warning/20 text-warning">
                {openIncidents} Open
              </Badge>
              <Badge variant="outline" className="border-success/20 text-success">
                {resolvedIncidents} Resolved
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Critical Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalIncidents}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Active Threats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{activeThreats}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Currently being monitored
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Avg Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRiskScore}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Organization-wide average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different analytics views */}
      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="risks">Risk Scores</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Incident Trend */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Incident Trend (7 Days)</CardTitle>
                <CardDescription>Daily incident detection over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={incidentTrendData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="incidents"
                      stackId="1"
                      stroke={COLORS.primary}
                      fill={COLORS.primary}
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Incidents by Severity */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Incidents by Severity</CardTitle>
                <CardDescription>Distribution of incident severity levels</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={incidentsBySeverity}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {incidentsBySeverity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Incidents by Type */}
            <Card className="border-primary/20 lg:col-span-2">
              <CardHeader>
                <CardTitle>Incidents by Type</CardTitle>
                <CardDescription>Top incident categories</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={incidentTypeData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Threats by Severity */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Threats by Severity</CardTitle>
                <CardDescription>Active threat severity distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={threatsBySeverity}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {threatsBySeverity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Threat Stats */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Threat Intelligence Stats</CardTitle>
                <CardDescription>Current threat landscape overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-primary/20 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Threats</p>
                    <p className="text-2xl font-bold">{threats.length}</p>
                  </div>
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div className="flex items-center justify-between p-3 border border-success/20 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Threats</p>
                    <p className="text-2xl font-bold text-warning">{activeThreats}</p>
                  </div>
                  <Activity className="h-8 w-8 text-warning" />
                </div>
                <div className="flex items-center justify-between p-3 border border-muted/20 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Inactive Threats</p>
                    <p className="text-2xl font-bold text-muted-foreground">
                      {threats.length - activeThreats}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Risk Score Distribution */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Risk Score Distribution</CardTitle>
                <CardDescription>User risk score ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={riskDistribution}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk Metrics */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Risk Metrics Summary</CardTitle>
                <CardDescription>Key risk indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-primary/20 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Overall Score</p>
                    <p className="text-2xl font-bold">{avgRiskScore}</p>
                  </div>
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">High Risk Users</p>
                    <p className="text-2xl font-bold text-destructive">
                      {riskScores.filter((r) => r.overall_score > 70).length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <div className="flex items-center justify-between p-3 border border-success/20 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Low Risk Users</p>
                    <p className="text-2xl font-bold text-success">
                      {riskScores.filter((r) => r.overall_score <= 30).length}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Alert Status</CardTitle>
                <CardDescription>Current alert acknowledgment status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-warning/20 rounded-lg bg-warning/5">
                  <div>
                    <p className="text-sm text-muted-foreground">Unacknowledged</p>
                    <p className="text-3xl font-bold text-warning">{unacknowledgedAlerts}</p>
                  </div>
                  <AlertTriangle className="h-10 w-10 text-warning" />
                </div>
                <div className="flex items-center justify-between p-4 border border-success/20 rounded-lg bg-success/5">
                  <div>
                    <p className="text-sm text-muted-foreground">Acknowledged</p>
                    <p className="text-3xl font-bold text-success">
                      {totalAlerts - unacknowledgedAlerts}
                    </p>
                  </div>
                  <Shield className="h-10 w-10 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Alert Priority</CardTitle>
                <CardDescription>Alert distribution by priority level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["critical", "high", "medium", "low", "info"].map((priority) => {
                    const count = alerts.filter((a) => a.priority === priority).length;
                    const percentage = totalAlerts > 0 ? (count / totalAlerts) * 100 : 0;
                    return (
                      <div key={priority} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{priority}</span>
                          <span className="font-medium">{count}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
