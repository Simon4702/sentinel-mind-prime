import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Clock,
  MapPin,
  Server,
  Activity,
  Eye,
  Shield,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Time-based heatmap data (24h x 7 days)
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

const generateTimeHeatmap = () =>
  days.map((day) =>
    hours.map((hour) => {
      const h = parseInt(hour);
      const isWeekend = day === "Sat" || day === "Sun";
      const isWorkHours = h >= 8 && h <= 18;
      const base = isWeekend
        ? Math.random() * 3
        : isWorkHours
        ? Math.random() * 60 + 20
        : Math.random() * 15;
      return { day, hour, value: Math.round(base), isAnomaly: !isWorkHours && base > 10 };
    })
  );

const timeHeatmapData = generateTimeHeatmap();

// Location data
const locationData = [
  { location: "San Francisco, CA", accesses: 1245, risk: "low", percentage: 45 },
  { location: "New York, NY", accesses: 856, risk: "low", percentage: 31 },
  { location: "Remote VPN", accesses: 423, risk: "medium", percentage: 15 },
  { location: "Unknown IP", accesses: 89, risk: "high", percentage: 3 },
  { location: "Tor Network", accesses: 23, risk: "critical", percentage: 1 },
  { location: "Foreign IPs", accesses: 142, risk: "high", percentage: 5 },
];

// Resource access data
const resourceData = [
  { resource: "Email System", accesses: 3421, category: "Communication", risk: 12 },
  { resource: "File Shares", accesses: 2156, category: "Storage", risk: 35 },
  { resource: "Cloud Apps", accesses: 1834, category: "SaaS", risk: 28 },
  { resource: "Admin Panels", accesses: 456, category: "Infrastructure", risk: 65 },
  { resource: "Database", accesses: 234, category: "Data", risk: 55 },
  { resource: "Source Code", accesses: 567, category: "Development", risk: 42 },
  { resource: "Financial Sys", accesses: 189, category: "Finance", risk: 70 },
  { resource: "HR Portal", accesses: 312, category: "HR", risk: 38 },
];

const getHeatColor = (value: number) => {
  if (value === 0) return "bg-muted/20";
  if (value < 10) return "bg-primary/20";
  if (value < 25) return "bg-primary/40";
  if (value < 40) return "bg-warning/40";
  if (value < 60) return "bg-warning/70";
  return "bg-destructive/70";
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case "low": return "bg-success/20 text-success";
    case "medium": return "bg-warning/20 text-warning";
    case "high": return "bg-destructive/20 text-destructive";
    case "critical": return "bg-destructive/30 text-destructive";
    default: return "bg-muted text-muted-foreground";
  }
};

const getBarColor = (risk: number) => {
  if (risk < 25) return "hsl(120 65% 50%)";
  if (risk < 45) return "hsl(195 100% 50%)";
  if (risk < 60) return "hsl(45 90% 55%)";
  return "hsl(0 75% 55%)";
};

export const BehavioralHeatmaps = () => {
  const [selectedDept, setSelectedDept] = useState("all");

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            Behavioral Heatmaps
          </h1>
          <p className="text-muted-foreground mt-1">
            Visual access pattern maps by time, location, and resource
          </p>
        </div>
        <Select value={selectedDept} onValueChange={setSelectedDept}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold">24/7</div>
            <p className="text-xs text-muted-foreground">Monitoring Coverage</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardContent className="pt-6 text-center">
            <MapPin className="h-8 w-8 text-warning mx-auto mb-2" />
            <div className="text-3xl font-bold">{locationData.length}</div>
            <p className="text-xs text-muted-foreground">Access Locations</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardContent className="pt-6 text-center">
            <Server className="h-8 w-8 text-accent mx-auto mb-2" />
            <div className="text-3xl font-bold">{resourceData.length}</div>
            <p className="text-xs text-muted-foreground">Monitored Resources</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <div className="text-3xl font-bold text-destructive">
              {timeHeatmapData.flat().filter((c) => c.isAnomaly).length}
            </div>
            <p className="text-xs text-muted-foreground">After-Hours Anomalies</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="time" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-card border-primary/20">
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Heatmap
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location Map
          </TabsTrigger>
          <TabsTrigger value="resource" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Resource Access
          </TabsTrigger>
        </TabsList>

        {/* Time Heatmap */}
        <TabsContent value="time">
          <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
            <CardHeader>
              <CardTitle className="text-lg">Weekly Access Heatmap</CardTitle>
              <CardDescription>
                Access frequency by hour and day — red cells indicate after-hours anomalies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Hour labels */}
                  <div className="flex items-center mb-1">
                    <div className="w-12 shrink-0" />
                    {hours.filter((_, i) => i % 2 === 0).map((h) => (
                      <div key={h} className="flex-1 text-center text-[10px] text-muted-foreground">
                        {h}
                      </div>
                    ))}
                  </div>

                  {/* Grid */}
                  {timeHeatmapData.map((dayData, dayIdx) => (
                    <div key={days[dayIdx]} className="flex items-center gap-[1px] mb-[1px]">
                      <div className="w-12 shrink-0 text-xs text-muted-foreground font-medium">
                        {days[dayIdx]}
                      </div>
                      {dayData.map((cell, hourIdx) => (
                        <div
                          key={`${dayIdx}-${hourIdx}`}
                          className={`flex-1 h-7 rounded-sm ${getHeatColor(cell.value)} ${
                            cell.isAnomaly ? "ring-1 ring-destructive/60" : ""
                          } transition-colors hover:ring-2 hover:ring-primary/60 cursor-pointer relative group`}
                          title={`${cell.day} ${cell.hour}: ${cell.value} events${cell.isAnomaly ? " (ANOMALY)" : ""}`}
                        >
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover border border-border rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {cell.value} events
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <span className="text-xs text-muted-foreground">Less</span>
                    <div className="flex gap-[2px]">
                      {["bg-muted/20", "bg-primary/20", "bg-primary/40", "bg-warning/40", "bg-warning/70", "bg-destructive/70"].map(
                        (c, i) => (
                          <div key={i} className={`w-5 h-5 rounded-sm ${c}`} />
                        )
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">More</span>
                    <div className="flex items-center gap-1 ml-4">
                      <div className="w-5 h-5 rounded-sm bg-muted/20 ring-1 ring-destructive/60" />
                      <span className="text-xs text-destructive">Anomaly</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Map */}
        <TabsContent value="location">
          <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
            <CardHeader>
              <CardTitle className="text-lg">Access by Location</CardTitle>
              <CardDescription>Geographic distribution of access events with risk classification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {locationData
                  .sort((a, b) => b.accesses - a.accesses)
                  .map((loc) => (
                    <div
                      key={loc.location}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/50 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-semibold">{loc.location}</div>
                          <div className="text-sm text-muted-foreground">{loc.accesses.toLocaleString()} accesses</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-40">
                          <div className="w-full h-3 bg-muted/50 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${loc.percentage}%`,
                                backgroundColor:
                                  loc.risk === "critical"
                                    ? "hsl(0 75% 55%)"
                                    : loc.risk === "high"
                                    ? "hsl(25 85% 55%)"
                                    : loc.risk === "medium"
                                    ? "hsl(45 90% 55%)"
                                    : "hsl(120 65% 50%)",
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{loc.percentage}%</span>
                        <Badge className={`${getRiskColor(loc.risk)} border-0 w-20 justify-center`}>
                          {loc.risk}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resource Access */}
        <TabsContent value="resource">
          <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
            <CardHeader>
              <CardTitle className="text-lg">Resource Access Patterns</CardTitle>
              <CardDescription>Access volume and associated risk score per resource category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={resourceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 15% 18%)" />
                  <XAxis type="number" tick={{ fill: "hsl(180 20% 65%)", fontSize: 12 }} />
                  <YAxis dataKey="resource" type="category" tick={{ fill: "hsl(180 20% 65%)", fontSize: 11 }} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(225 20% 8%)",
                      border: "1px solid hsl(225 15% 18%)",
                      borderRadius: "8px",
                      color: "hsl(180 100% 95%)",
                    }}
                    formatter={(value: number, name: string) => [
                      name === "accesses" ? `${value.toLocaleString()} accesses` : `Risk: ${value}`,
                      name === "accesses" ? "Volume" : "Risk Score",
                    ]}
                  />
                  <Bar dataKey="accesses" name="accesses" radius={[0, 4, 4, 0]}>
                    {resourceData.map((entry, idx) => (
                      <Cell key={idx} fill={getBarColor(entry.risk)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* Resource Risk Table */}
              <div className="mt-6 space-y-2">
                {resourceData
                  .sort((a, b) => b.risk - a.risk)
                  .slice(0, 4)
                  .map((r) => (
                    <div
                      key={r.resource}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{r.resource}</span>
                        <Badge variant="secondary" className="text-xs">{r.category}</Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{r.accesses.toLocaleString()} accesses</span>
                        <Badge
                          className={`border-0 ${
                            r.risk >= 60
                              ? "bg-destructive/20 text-destructive"
                              : r.risk >= 40
                              ? "bg-warning/20 text-warning"
                              : "bg-success/20 text-success"
                          }`}
                        >
                          Risk: {r.risk}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
