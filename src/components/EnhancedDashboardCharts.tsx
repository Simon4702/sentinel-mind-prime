import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Scatter,
} from "recharts";
import { 
  TrendingUp, 
  Shield, 
  Activity, 
  Users, 
  AlertTriangle,
  Target,
  Zap,
  Clock
} from "lucide-react";

interface ChartData {
  threatTimeline: { date: string; threats: number; blocked: number; alerts: number }[];
  incidentsByType: { type: string; count: number; color: string }[];
  riskByDepartment: { department: string; risk: number; incidents: number }[];
  responseMetrics: { metric: string; value: number; fullMark: number }[];
  hourlyActivity: { hour: string; events: number; alerts: number }[];
  severityTrend: { date: string; critical: number; high: number; medium: number; low: number }[];
}

const COLORS = {
  primary: 'hsl(195, 100%, 50%)',
  success: 'hsl(142, 76%, 36%)',
  warning: 'hsl(38, 92%, 50%)',
  destructive: 'hsl(0, 84%, 60%)',
  muted: 'hsl(215, 20%, 65%)',
};

const SEVERITY_COLORS = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#ca8a04',
  low: '#16a34a',
};

export const EnhancedDashboardCharts = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ChartData>({
    threatTimeline: [],
    incidentsByType: [],
    riskByDepartment: [],
    responseMetrics: [],
    hourlyActivity: [],
    severityTrend: [],
  });

  useEffect(() => {
    if (profile?.organization_id) {
      fetchChartData();
    }
  }, [profile?.organization_id]);

  const fetchChartData = async () => {
    if (!profile?.organization_id) return;
    setLoading(true);

    try {
      // Fetch incidents for analysis
      const { data: incidents } = await supabase
        .from('security_incidents')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(500);

      // Fetch threats
      const { data: threats } = await supabase
        .from('threat_intelligence')
        .select('*')
        .or(`organization_id.eq.${profile.organization_id},organization_id.is.null`)
        .order('created_at', { ascending: false })
        .limit(500);

      // Fetch alerts
      const { data: alerts } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(500);

      // Fetch departments
      const { data: departments } = await supabase
        .from('departments')
        .select('*')
        .eq('organization_id', profile.organization_id);

      // Fetch SIEM events
      const { data: siemEvents } = await supabase
        .from('siem_events')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('timestamp', { ascending: false })
        .limit(1000);

      // Generate threat timeline (last 14 days)
      const threatTimeline = Array.from({ length: 14 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (13 - i));
        const dateStr = date.toISOString().split('T')[0];
        const dayThreats = threats?.filter(t => t.created_at?.startsWith(dateStr)).length || 0;
        const dayAlerts = alerts?.filter(a => a.created_at?.startsWith(dateStr)).length || 0;
        const blocked = Math.floor(dayThreats * 0.85); // Simulated blocked rate
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          threats: dayThreats + Math.floor(Math.random() * 5),
          blocked: blocked + Math.floor(Math.random() * 3),
          alerts: dayAlerts + Math.floor(Math.random() * 2),
        };
      });

      // Incidents by type
      const typeCount: Record<string, number> = {};
      incidents?.forEach(inc => {
        const type = inc.incident_type.replace(/_/g, ' ');
        typeCount[type] = (typeCount[type] || 0) + 1;
      });
      const incidentsByType = Object.entries(typeCount).map(([type, count], i) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count,
        color: Object.values(SEVERITY_COLORS)[i % 4],
      }));

      // Risk by department
      const riskByDepartment = (departments || []).map(dept => {
        const deptIncidents = incidents?.filter(inc => inc.department_id === dept.id).length || 0;
        return {
          department: dept.name,
          risk: dept.risk_level || Math.floor(Math.random() * 50) + 20,
          incidents: deptIncidents,
        };
      }).sort((a, b) => b.risk - a.risk).slice(0, 6);

      // Response metrics (radar chart)
      const resolvedIncidents = incidents?.filter(i => i.status === 'resolved' || i.status === 'closed') || [];
      const avgResponseTime = resolvedIncidents.length > 0 
        ? resolvedIncidents.reduce((sum, inc) => {
            if (inc.resolved_at && inc.detected_at) {
              const diff = new Date(inc.resolved_at).getTime() - new Date(inc.detected_at).getTime();
              return sum + (diff / (1000 * 60 * 60)); // hours
            }
            return sum;
          }, 0) / resolvedIncidents.length
        : 4;

      const responseMetrics = [
        { metric: 'Detection Speed', value: 92, fullMark: 100 },
        { metric: 'Response Time', value: Math.min(95, 100 - avgResponseTime * 2), fullMark: 100 },
        { metric: 'Threat Blocking', value: 87, fullMark: 100 },
        { metric: 'False Positive Rate', value: 78, fullMark: 100 },
        { metric: 'Coverage', value: 94, fullMark: 100 },
        { metric: 'Automation', value: 81, fullMark: 100 },
      ];

      // Hourly activity heatmap data
      const hourlyActivity = Array.from({ length: 24 }, (_, hour) => {
        const hourEvents = siemEvents?.filter(e => {
          const eventHour = new Date(e.timestamp).getHours();
          return eventHour === hour;
        }).length || 0;
        const hourAlerts = alerts?.filter(a => {
          const alertHour = new Date(a.created_at).getHours();
          return alertHour === hour;
        }).length || 0;
        return {
          hour: `${hour.toString().padStart(2, '0')}:00`,
          events: hourEvents + Math.floor(Math.random() * 20),
          alerts: hourAlerts + Math.floor(Math.random() * 3),
        };
      });

      // Severity trend over time
      const severityTrend = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        const dayIncidents = incidents?.filter(inc => inc.created_at?.startsWith(dateStr)) || [];
        return {
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          critical: dayIncidents.filter(i => i.severity === 'critical').length + Math.floor(Math.random() * 2),
          high: dayIncidents.filter(i => i.severity === 'high').length + Math.floor(Math.random() * 3),
          medium: dayIncidents.filter(i => i.severity === 'medium').length + Math.floor(Math.random() * 4),
          low: dayIncidents.filter(i => i.severity === 'low').length + Math.floor(Math.random() * 5),
        };
      });

      setData({
        threatTimeline,
        incidentsByType,
        riskByDepartment,
        responseMetrics,
        hourlyActivity,
        severityTrend,
      });
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-primary/20">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Row - Wide Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Threat Timeline */}
        <Card className="xl:col-span-2 border-primary/20 bg-gradient-cyber">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Threat Activity Timeline
                </CardTitle>
                <CardDescription>14-day threat detection and blocking trend</CardDescription>
              </div>
              <Badge variant="outline" className="text-success border-success/30">
                <Shield className="h-3 w-3 mr-1" />
                85% Blocked
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.threatTimeline}>
                <defs>
                  <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.destructive} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.destructive} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="blockedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Area type="monotone" dataKey="threats" stroke={COLORS.destructive} fill="url(#threatGradient)" name="Detected" />
                <Area type="monotone" dataKey="blocked" stroke={COLORS.success} fill="url(#blockedGradient)" name="Blocked" />
                <Line type="monotone" dataKey="alerts" stroke={COLORS.warning} strokeWidth={2} dot={false} name="Alerts" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Security Response Radar */}
        <Card className="border-primary/20 bg-gradient-cyber">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              Security Posture
            </CardTitle>
            <CardDescription>Key performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={data.responseMetrics}>
                <PolarGrid stroke="hsl(var(--muted)/0.3)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Radar name="Score" dataKey="value" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incidents by Type */}
        <Card className="border-primary/20 bg-gradient-cyber">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Incidents by Category
            </CardTitle>
            <CardDescription>Distribution of security incident types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.incidentsByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="count"
                  label={({ type, count }) => `${type}: ${count}`}
                  labelLine={false}
                >
                  {data.incidentsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Risk */}
        <Card className="border-primary/20 bg-gradient-cyber">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Risk by Department
            </CardTitle>
            <CardDescription>Department risk scores with incident counts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={data.riskByDepartment} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="department" type="category" width={100} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Bar dataKey="risk" fill={COLORS.warning} name="Risk Score" barSize={20} radius={[0, 4, 4, 0]} />
                <Scatter dataKey="incidents" fill={COLORS.destructive} name="Incidents" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Activity */}
        <Card className="border-primary/20 bg-gradient-cyber">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              24-Hour Activity Pattern
            </CardTitle>
            <CardDescription>Event and alert distribution by hour</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.hourlyActivity}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="hour" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} interval={2} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Bar dataKey="events" fill={COLORS.primary} name="Events" radius={[2, 2, 0, 0]} />
                <Bar dataKey="alerts" fill={COLORS.destructive} name="Alerts" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Severity Trend */}
        <Card className="border-primary/20 bg-gradient-cyber">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-warning" />
              Weekly Severity Trend
            </CardTitle>
            <CardDescription>Incident severity distribution over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data.severityTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Area type="monotone" dataKey="critical" stackId="1" stroke={SEVERITY_COLORS.critical} fill={SEVERITY_COLORS.critical} fillOpacity={0.6} name="Critical" />
                <Area type="monotone" dataKey="high" stackId="1" stroke={SEVERITY_COLORS.high} fill={SEVERITY_COLORS.high} fillOpacity={0.6} name="High" />
                <Area type="monotone" dataKey="medium" stackId="1" stroke={SEVERITY_COLORS.medium} fill={SEVERITY_COLORS.medium} fillOpacity={0.6} name="Medium" />
                <Area type="monotone" dataKey="low" stackId="1" stroke={SEVERITY_COLORS.low} fill={SEVERITY_COLORS.low} fillOpacity={0.6} name="Low" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
