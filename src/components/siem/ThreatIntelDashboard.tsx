import { useState } from "react";
import {
  Eye,
  AlertTriangle,
  Search,
  Shield,
  TrendingUp,
  Clock,
  Target,
  Activity,
  BarChart3,
  PieChart,
  List,
  RefreshCw,
  Radar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useCyberArsenalScans, useScanStats } from "@/hooks/useCyberArsenalScans";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { IOCWatchlistManager } from "./IOCWatchlistManager";

const COLORS = {
  virustotal: "#8b5cf6",
  abuseipdb: "#f59e0b",
  shodan: "#10b981",
};

const RISK_COLORS = ["#10b981", "#84cc16", "#eab308", "#f97316", "#ef4444"];

export const ThreatIntelDashboard = () => {
  const { data: scans, isLoading, refetch } = useCyberArsenalScans(200);
  const { data: stats } = useScanStats();
  const [selectedScan, setSelectedScan] = useState<string | null>(null);

  const getRiskColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score < 20) return "text-emerald-500";
    if (score < 40) return "text-lime-500";
    if (score < 60) return "text-yellow-500";
    if (score < 80) return "text-orange-500";
    return "text-red-500";
  };

  const getRiskBadge = (score: number | null) => {
    if (score === null) return { label: "Unknown", variant: "secondary" as const };
    if (score < 20) return { label: "Low", variant: "default" as const };
    if (score < 40) return { label: "Moderate", variant: "secondary" as const };
    if (score < 60) return { label: "Medium", variant: "outline" as const };
    if (score < 80) return { label: "High", variant: "destructive" as const };
    return { label: "Critical", variant: "destructive" as const };
  };

  const toolIcon = (tool: string) => {
    switch (tool) {
      case "virustotal": return <Eye className="h-4 w-4 text-violet-400" />;
      case "abuseipdb": return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case "shodan": return <Search className="h-4 w-4 text-emerald-400" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const pieData = stats?.byTool
    ? Object.entries(stats.byTool).map(([name, value]) => ({ name, value }))
    : [];

  const targetTypeData = stats?.byTargetType
    ? Object.entries(stats.byTargetType).map(([name, value]) => ({ name, value }))
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/20 rounded-lg">
                <Activity className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalScans || 0}</p>
                <p className="text-xs text-muted-foreground">Total Scans</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.maliciousCount || 0}</p>
                <p className="text-xs text-muted-foreground">Malicious Found</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Clock className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.scansLast24h || 0}</p>
                <p className="text-xs text-muted-foreground">Last 24 Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <TrendingUp className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.avgRiskScore || 0}%</p>
                <p className="text-xs text-muted-foreground">Avg Risk Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-background/50">
            <TabsTrigger value="timeline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="scans" className="gap-2">
              <List className="h-4 w-4" />
              Scans
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <PieChart className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="gap-2">
              <Radar className="h-4 w-4" />
              IOC Watchlist
            </TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <TabsContent value="timeline">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Scan Activity (7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.timeline || []}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorMalicious" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#8b5cf6"
                      fill="url(#colorTotal)"
                      strokeWidth={2}
                      name="Total Scans"
                    />
                    <Area
                      type="monotone"
                      dataKey="malicious"
                      stroke="#ef4444"
                      fill="url(#colorMalicious)"
                      strokeWidth={2}
                      name="Malicious"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scans">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Recent Scans
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Tool</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead className="w-20">Type</TableHead>
                      <TableHead className="w-24">Risk</TableHead>
                      <TableHead className="w-20">Status</TableHead>
                      <TableHead className="w-32">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scans?.map((scan) => {
                      const risk = getRiskBadge(scan.risk_score);
                      return (
                        <TableRow
                          key={scan.id}
                          className={cn(
                            "cursor-pointer hover:bg-muted/50",
                            selectedScan === scan.id && "bg-muted/50"
                          )}
                          onClick={() => setSelectedScan(selectedScan === scan.id ? null : scan.id)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {toolIcon(scan.tool_name)}
                              <span className="text-xs font-mono uppercase">
                                {scan.tool_name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {scan.target}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {scan.target_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={cn("font-mono font-bold", getRiskColor(scan.risk_score))}>
                              {scan.risk_score ?? "-"}%
                            </span>
                          </TableCell>
                          <TableCell>
                            {scan.is_malicious ? (
                              <Badge variant="destructive" className="text-xs">
                                Malicious
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Clean
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(scan.created_at), { addSuffix: true })}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {(!scans || scans.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No scans yet. Use the Cyber Arsenal to scan IPs, domains, or hashes.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {selectedScan && scans && (
            <Card className="mt-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Scan Details</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const scan = scans.find((s) => s.id === selectedScan);
                  if (!scan) return null;
                  return (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Tool</p>
                          <p className="font-mono uppercase">{scan.tool_name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Target</p>
                          <code className="text-xs">{scan.target}</code>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Scanned At</p>
                          <p>{format(new Date(scan.created_at), "PPpp")}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Tags</p>
                          <div className="flex gap-1 flex-wrap">
                            {scan.tags?.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm mb-1">Raw Output</p>
                        <ScrollArea className="h-40">
                          <pre className="text-xs font-mono bg-muted p-3 rounded-lg whitespace-pre-wrap">
                            {scan.scan_result?.raw_output || "No output available"}
                          </pre>
                        </ScrollArea>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Scans by Tool</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={false}
                      >
                        {pieData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={COLORS[entry.name as keyof typeof COLORS] || "#8884d8"}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Scans by Target Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={targetTypeData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={60} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Top Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {stats?.tagCounts &&
                    Object.entries(stats.tagCounts)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 20)
                      .map(([tag, count]) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className={cn(
                            "text-sm",
                            tag === "malicious" && "border-red-500/50 text-red-400",
                            tag === "suspicious" && "border-amber-500/50 text-amber-400",
                            tag === "vulnerable" && "border-orange-500/50 text-orange-400"
                          )}
                        >
                          {tag}
                          <span className="ml-1 text-muted-foreground">({count})</span>
                        </Badge>
                      ))}
                  {(!stats?.tagCounts || Object.keys(stats.tagCounts).length === 0) && (
                    <p className="text-muted-foreground text-sm">No tags yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="watchlist">
          <IOCWatchlistManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
