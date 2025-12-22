import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Activity,
  TrendingUp,
  Shield,
  AlertTriangle,
  Clock,
  Target,
  Zap,
  BarChart3,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const SIEMAnalytics = () => {
  const { profile } = useAuth();
  const [eventsByHour, setEventsByHour] = useState<any[]>([]);
  const [eventsBySeverity, setEventsBySeverity] = useState<any[]>([]);
  const [eventsByType, setEventsByType] = useState<any[]>([]);
  const [topSources, setTopSources] = useState<any[]>([]);

  useEffect(() => {
    // Generate mock analytics data for visualization
    const hours = [];
    for (let i = 23; i >= 0; i--) {
      hours.push({
        hour: `${(24 - i).toString().padStart(2, "0")}:00`,
        events: Math.floor(Math.random() * 500) + 100,
        alerts: Math.floor(Math.random() * 20) + 5,
      });
    }
    setEventsByHour(hours);

    setEventsBySeverity([
      { name: "Critical", value: 12, color: "#EF4444" },
      { name: "High", value: 45, color: "#F97316" },
      { name: "Medium", value: 128, color: "#EAB308" },
      { name: "Low", value: 234, color: "#3B82F6" },
      { name: "Info", value: 890, color: "#6B7280" },
    ]);

    setEventsByType([
      { type: "Authentication", events: 1245 },
      { type: "Network", events: 892 },
      { type: "File Access", events: 654 },
      { type: "Process", events: 432 },
      { type: "Registry", events: 234 },
      { type: "DNS", events: 189 },
    ]);

    setTopSources([
      { source: "Endpoint Protection", events: 2341, trend: "+12%" },
      { source: "Firewall", events: 1892, trend: "+5%" },
      { source: "Active Directory", events: 1456, trend: "-3%" },
      { source: "Web Gateway", events: 987, trend: "+8%" },
      { source: "Email Gateway", events: 654, trend: "+15%" },
    ]);
  }, [profile?.organization_id]);

  const SEVERITY_COLORS = ["#EF4444", "#F97316", "#EAB308", "#3B82F6", "#6B7280"];

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Events/Hour</p>
                <p className="text-3xl font-bold">2,847</p>
                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" /> +12% from avg
                </p>
              </div>
              <div className="p-4 rounded-xl bg-blue-500/20">
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-3xl font-bold">23</p>
                <p className="text-xs text-red-400 flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3" /> 5 critical
                </p>
              </div>
              <div className="p-4 rounded-xl bg-red-500/20">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">MTTR</p>
                <p className="text-3xl font-bold">4.2m</p>
                <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" /> -18% improved
                </p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-500/20">
                <Clock className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Threat Score</p>
                <p className="text-3xl font-bold">72</p>
                <p className="text-xs text-yellow-400 flex items-center gap-1 mt-1">
                  <Target className="h-3 w-3" /> Moderate risk
                </p>
              </div>
              <div className="p-4 rounded-xl bg-purple-500/20">
                <Shield className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events Over Time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Events Over Time (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={eventsByHour}>
                <defs>
                  <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="hour" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="events"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorEvents)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="alerts"
                  stroke="#EF4444"
                  fillOpacity={1}
                  fill="url(#colorAlerts)"
                  strokeWidth={2}
                />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Events by Severity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              By Severity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventsBySeverity}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {eventsBySeverity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              Events by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventsByType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                <XAxis type="number" stroke="#888" fontSize={12} />
                <YAxis dataKey="type" type="category" stroke="#888" fontSize={12} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="events" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-400" />
              Top Event Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSources.map((source, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{source.source}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      {source.events.toLocaleString()}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        source.trend.startsWith("+")
                          ? "text-emerald-400"
                          : "text-red-400"
                      }
                    >
                      {source.trend}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SIEMAnalytics;
