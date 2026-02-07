import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Activity,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

const departments = ["Engineering", "Marketing", "Finance", "HR", "Sales", "IT Security"];

const peerGroupData = [
  {
    id: "1",
    name: "Sarah Chen",
    department: "Engineering",
    riskScore: 18,
    peerAvg: 22,
    deviation: -18,
    status: "normal" as const,
    metrics: {
      loginFrequency: 85,
      fileAccess: 72,
      networkUsage: 90,
      afterHoursAccess: 15,
      privilegeUsage: 60,
      dataTransfer: 45,
    },
  },
  {
    id: "2",
    name: "Mike Rodriguez",
    department: "Finance",
    riskScore: 67,
    peerAvg: 30,
    deviation: 123,
    status: "outlier" as const,
    metrics: {
      loginFrequency: 45,
      fileAccess: 92,
      networkUsage: 78,
      afterHoursAccess: 85,
      privilegeUsage: 88,
      dataTransfer: 95,
    },
  },
  {
    id: "3",
    name: "Alex Thompson",
    department: "IT Security",
    riskScore: 89,
    peerAvg: 35,
    deviation: 154,
    status: "critical" as const,
    metrics: {
      loginFrequency: 30,
      fileAccess: 95,
      networkUsage: 42,
      afterHoursAccess: 92,
      privilegeUsage: 95,
      dataTransfer: 88,
    },
  },
  {
    id: "4",
    name: "Lisa Park",
    department: "Marketing",
    riskScore: 12,
    peerAvg: 20,
    deviation: -40,
    status: "normal" as const,
    metrics: {
      loginFrequency: 92,
      fileAccess: 65,
      networkUsage: 88,
      afterHoursAccess: 5,
      privilegeUsage: 30,
      dataTransfer: 20,
    },
  },
  {
    id: "5",
    name: "James Wilson",
    department: "Sales",
    riskScore: 45,
    peerAvg: 28,
    deviation: 61,
    status: "warning" as const,
    metrics: {
      loginFrequency: 60,
      fileAccess: 78,
      networkUsage: 55,
      afterHoursAccess: 50,
      privilegeUsage: 70,
      dataTransfer: 75,
    },
  },
  {
    id: "6",
    name: "Emma Davis",
    department: "HR",
    riskScore: 52,
    peerAvg: 25,
    deviation: 108,
    status: "outlier" as const,
    metrics: {
      loginFrequency: 55,
      fileAccess: 85,
      networkUsage: 60,
      afterHoursAccess: 65,
      privilegeUsage: 80,
      dataTransfer: 70,
    },
  },
];

const departmentBaselines = departments.map((dept) => ({
  department: dept,
  avgRisk: Math.floor(Math.random() * 30) + 15,
  outliers: Math.floor(Math.random() * 5),
  totalUsers: Math.floor(Math.random() * 50) + 20,
}));

const radarData = [
  { metric: "Login", userValue: 45, peerAvg: 85 },
  { metric: "File Access", peerAvg: 60, userValue: 92 },
  { metric: "Network", peerAvg: 82, userValue: 78 },
  { metric: "After Hours", peerAvg: 20, userValue: 85 },
  { metric: "Privilege", peerAvg: 45, userValue: 88 },
  { metric: "Data Xfer", peerAvg: 35, userValue: 95 },
];

const scatterData = peerGroupData.map((u) => ({
  name: u.name,
  riskScore: u.riskScore,
  deviation: Math.abs(u.deviation),
  z: u.metrics.dataTransfer,
}));

const getStatusBadge = (status: string) => {
  switch (status) {
    case "normal":
      return <Badge className="bg-success/20 text-success border-0">Normal</Badge>;
    case "warning":
      return <Badge className="bg-warning/20 text-warning border-0">Warning</Badge>;
    case "outlier":
      return <Badge className="bg-destructive/20 text-destructive border-0">Outlier</Badge>;
    case "critical":
      return <Badge className="bg-destructive/20 text-destructive border-0 animate-pulse">Critical</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
};

const DeviationIndicator = ({ value }: { value: number }) => {
  if (value > 50)
    return (
      <span className="flex items-center gap-1 text-destructive text-sm font-semibold">
        <ArrowUpRight className="h-4 w-4" />+{value}%
      </span>
    );
  if (value > 0)
    return (
      <span className="flex items-center gap-1 text-warning text-sm font-semibold">
        <ArrowUpRight className="h-4 w-4" />+{value}%
      </span>
    );
  if (value < -20)
    return (
      <span className="flex items-center gap-1 text-success text-sm font-semibold">
        <ArrowDownRight className="h-4 w-4" />{value}%
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-muted-foreground text-sm">
      <Minus className="h-4 w-4" />{value}%
    </span>
  );
};

export const PeerGroupAnalysis = () => {
  const [selectedDept, setSelectedDept] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredUsers =
    selectedDept === "all"
      ? peerGroupData
      : peerGroupData.filter((u) => u.department === selectedDept);

  const outlierCount = peerGroupData.filter((u) => u.status === "outlier" || u.status === "critical").length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Peer Group Analysis
          </h1>
          <p className="text-muted-foreground mt-1">
            Compare individual behavior against department and role baselines
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedDept} onValueChange={setSelectedDept}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" className="shadow-cyber">
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardContent className="pt-6 text-center">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold">{peerGroupData.length}</div>
            <p className="text-xs text-muted-foreground">Monitored Users</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <div className="text-3xl font-bold text-destructive">{outlierCount}</div>
            <p className="text-xs text-muted-foreground">Behavioral Outliers</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardContent className="pt-6 text-center">
            <BarChart3 className="h-8 w-8 text-warning mx-auto mb-2" />
            <div className="text-3xl font-bold">
              {Math.round(peerGroupData.reduce((a, b) => a + b.riskScore, 0) / peerGroupData.length)}
            </div>
            <p className="text-xs text-muted-foreground">Avg Risk Score</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardContent className="pt-6 text-center">
            <Shield className="h-8 w-8 text-success mx-auto mb-2" />
            <div className="text-3xl font-bold text-success">{departments.length}</div>
            <p className="text-xs text-muted-foreground">Peer Groups</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Comparison */}
        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardHeader>
            <CardTitle className="text-lg">User vs Peer Baseline</CardTitle>
            <CardDescription>Behavioral metrics comparison (selected outlier)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(225 15% 18%)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "hsl(180 20% 65%)", fontSize: 12 }} />
                <PolarRadiusAxis tick={{ fill: "hsl(180 20% 65%)", fontSize: 10 }} />
                <Radar name="User" dataKey="userValue" stroke="hsl(0 75% 55%)" fill="hsl(0 75% 55%)" fillOpacity={0.3} />
                <Radar name="Peer Avg" dataKey="peerAvg" stroke="hsl(195 100% 50%)" fill="hsl(195 100% 50%)" fillOpacity={0.2} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Scatter: Risk vs Deviation */}
        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardHeader>
            <CardTitle className="text-lg">Risk vs Deviation Map</CardTitle>
            <CardDescription>Bubble size = data transfer volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 15% 18%)" />
                <XAxis dataKey="riskScore" name="Risk Score" tick={{ fill: "hsl(180 20% 65%)", fontSize: 12 }} />
                <YAxis dataKey="deviation" name="Deviation %" tick={{ fill: "hsl(180 20% 65%)", fontSize: 12 }} />
                <ZAxis dataKey="z" range={[50, 400]} name="Data Transfer" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(225 20% 8%)",
                    border: "1px solid hsl(225 15% 18%)",
                    borderRadius: "8px",
                    color: "hsl(180 100% 95%)",
                  }}
                />
                <Scatter data={scatterData} fill="hsl(195 100% 50%)" fillOpacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Baselines */}
      <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
        <CardHeader>
          <CardTitle className="text-lg">Department Baselines</CardTitle>
          <CardDescription>Average risk score and outlier count per department</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={departmentBaselines}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 15% 18%)" />
              <XAxis dataKey="department" tick={{ fill: "hsl(180 20% 65%)", fontSize: 11 }} />
              <YAxis tick={{ fill: "hsl(180 20% 65%)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(225 20% 8%)",
                  border: "1px solid hsl(225 15% 18%)",
                  borderRadius: "8px",
                  color: "hsl(180 100% 95%)",
                }}
              />
              <Bar dataKey="avgRisk" name="Avg Risk" fill="hsl(195 100% 50%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outliers" name="Outliers" fill="hsl(0 75% 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Table */}
      <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
        <CardHeader>
          <CardTitle className="text-lg">Individual Peer Comparison</CardTitle>
          <CardDescription>Users ranked by deviation from peer group baseline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredUsers
              .sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation))
              .map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.department}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Risk Score</div>
                      <div className="font-bold text-lg">{user.riskScore}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Peer Avg</div>
                      <div className="font-medium">{user.peerAvg}</div>
                    </div>
                    <div className="text-center w-20">
                      <div className="text-xs text-muted-foreground">Deviation</div>
                      <DeviationIndicator value={user.deviation} />
                    </div>
                    <div className="w-32">
                      <Progress value={user.riskScore} className="h-2" />
                    </div>
                    {getStatusBadge(user.status)}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
