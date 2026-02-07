import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Activity,
  BarChart3,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Brain,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  ComposedChart,
  Bar,
} from "recharts";

// Generate 30 days of risk data
const generateHistoricalData = (userName: string, baseRisk: number, trend: "rising" | "falling" | "stable") => {
  return Array.from({ length: 30 }, (_, i) => {
    const trendFactor = trend === "rising" ? i * 1.5 : trend === "falling" ? -i * 0.8 : 0;
    const noise = Math.random() * 15 - 7.5;
    const score = Math.min(100, Math.max(0, baseRisk + trendFactor + noise));
    return {
      day: `Day ${i + 1}`,
      date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: Math.round(score),
      predicted: i >= 25 ? Math.round(score + (trend === "rising" ? 5 : trend === "falling" ? -3 : 1)) : null,
    };
  });
};

const users = [
  { name: "Sarah Chen", department: "Engineering", trend: "stable" as const, currentRisk: 18, change: -2, baseRisk: 20 },
  { name: "Mike Rodriguez", department: "Finance", trend: "rising" as const, currentRisk: 67, change: +23, baseRisk: 35 },
  { name: "Alex Thompson", department: "IT Security", trend: "rising" as const, currentRisk: 89, change: +31, baseRisk: 45 },
  { name: "Lisa Park", department: "Marketing", trend: "falling" as const, currentRisk: 12, change: -8, baseRisk: 25 },
  { name: "James Wilson", department: "Sales", trend: "stable" as const, currentRisk: 45, change: +3, baseRisk: 42 },
];

const departmentTrends = [
  { month: "Sep", Engineering: 22, Finance: 30, ITSecurity: 38, Marketing: 18, Sales: 28 },
  { month: "Oct", Engineering: 20, Finance: 35, ITSecurity: 42, Marketing: 16, Sales: 30 },
  { month: "Nov", Engineering: 19, Finance: 42, ITSecurity: 48, Marketing: 15, Sales: 32 },
  { month: "Dec", Engineering: 21, Finance: 50, ITSecurity: 55, Marketing: 14, Sales: 35 },
  { month: "Jan", Engineering: 18, Finance: 58, ITSecurity: 65, Marketing: 13, Sales: 40 },
  { month: "Feb", Engineering: 18, Finance: 67, ITSecurity: 89, Marketing: 12, Sales: 45 },
];

const riskDistribution = [
  { range: "0-20 (Low)", count: 542, color: "hsl(120 65% 50%)" },
  { range: "21-40 (Moderate)", count: 318, color: "hsl(195 100% 50%)" },
  { range: "41-60 (Elevated)", count: 156, color: "hsl(45 90% 55%)" },
  { range: "61-80 (High)", count: 67, color: "hsl(25 85% 55%)" },
  { range: "81-100 (Critical)", count: 12, color: "hsl(0 75% 55%)" },
];

const TrendIcon = ({ change }: { change: number }) => {
  if (change > 10) return <ArrowUpRight className="h-4 w-4 text-destructive" />;
  if (change > 0) return <ArrowUpRight className="h-4 w-4 text-warning" />;
  if (change < -5) return <ArrowDownRight className="h-4 w-4 text-success" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

export const RiskScoreTrends = () => {
  const [selectedUser, setSelectedUser] = useState(users[2].name);
  const [timeRange, setTimeRange] = useState("30d");

  const user = users.find((u) => u.name === selectedUser) || users[0];
  const historicalData = generateHistoricalData(user.name, user.baseRisk, user.trend);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-primary" />
            Risk Score Trends
          </h1>
          <p className="text-muted-foreground mt-1">
            Historical risk evolution with AI-powered predictive trajectories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* User Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {users.map((u) => (
          <Card
            key={u.name}
            onClick={() => setSelectedUser(u.name)}
            className={`cursor-pointer transition-all border-primary/20 bg-gradient-cyber shadow-elegant ${
              selectedUser === u.name ? "ring-2 ring-primary" : "hover:border-primary/40"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{u.department}</span>
                <TrendIcon change={u.change} />
              </div>
              <div className="font-semibold text-sm">{u.name}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-2xl font-bold">{u.currentRisk}</span>
                <span
                  className={`text-xs font-semibold ${
                    u.change > 10
                      ? "text-destructive"
                      : u.change > 0
                      ? "text-warning"
                      : "text-success"
                  }`}
                >
                  {u.change > 0 ? "+" : ""}{u.change}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Chart */}
      <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Risk Score Timeline — {selectedUser}</CardTitle>
              <CardDescription>
                Historical trend with AI-predicted trajectory (dashed line)
              </CardDescription>
            </div>
            <Badge
              className={
                user.trend === "rising"
                  ? "bg-destructive/20 text-destructive border-0"
                  : user.trend === "falling"
                  ? "bg-success/20 text-success border-0"
                  : "bg-primary/20 text-primary border-0"
              }
            >
              {user.trend === "rising" ? "↑ Rising" : user.trend === "falling" ? "↓ Falling" : "→ Stable"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 15% 18%)" />
              <XAxis dataKey="date" tick={{ fill: "hsl(180 20% 65%)", fontSize: 11 }} interval={4} />
              <YAxis domain={[0, 100]} tick={{ fill: "hsl(180 20% 65%)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(225 20% 8%)",
                  border: "1px solid hsl(225 15% 18%)",
                  borderRadius: "8px",
                  color: "hsl(180 100% 95%)",
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(195 100% 50%)"
                fill="hsl(195 100% 50%)"
                fillOpacity={0.1}
                strokeWidth={2}
                name="Risk Score"
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="hsl(0 75% 55%)"
                strokeDasharray="8 4"
                strokeWidth={2}
                dot={false}
                name="AI Prediction"
                connectNulls={false}
              />
              <Legend />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Department Trends & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardHeader>
            <CardTitle className="text-lg">Department Risk Trends</CardTitle>
            <CardDescription>6-month risk evolution by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={departmentTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 15% 18%)" />
                <XAxis dataKey="month" tick={{ fill: "hsl(180 20% 65%)", fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "hsl(180 20% 65%)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(225 20% 8%)",
                    border: "1px solid hsl(225 15% 18%)",
                    borderRadius: "8px",
                    color: "hsl(180 100% 95%)",
                  }}
                />
                <Line type="monotone" dataKey="Engineering" stroke="hsl(195 100% 50%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Finance" stroke="hsl(45 90% 55%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="ITSecurity" stroke="hsl(0 75% 55%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Marketing" stroke="hsl(120 65% 50%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Sales" stroke="hsl(280 70% 60%)" strokeWidth={2} dot={false} />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardHeader>
            <CardTitle className="text-lg">Risk Distribution</CardTitle>
            <CardDescription>Organization-wide user risk score distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskDistribution.map((bucket) => (
                <div key={bucket.range} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{bucket.range}</span>
                    <span className="font-semibold">{bucket.count} users</span>
                  </div>
                  <div className="w-full h-3 bg-muted/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(bucket.count / 542) * 100}%`,
                        backgroundColor: bucket.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">AI Prediction</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on current trends, <strong className="text-destructive">3 users</strong> are projected
                to cross the critical threshold (80+) within the next 14 days. Immediate review recommended
                for Finance and IT Security departments.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
