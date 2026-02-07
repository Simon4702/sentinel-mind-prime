import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Clock,
  AlertTriangle,
  Shield,
  LogIn,
  LogOut,
  FileText,
  Download,
  Upload,
  Globe,
  Key,
  Monitor,
  Search,
  Filter,
  ChevronDown,
  Eye,
  Zap,
  MapPin,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type EventType = "login" | "logout" | "file_access" | "file_download" | "file_upload" | "web_access" | "privilege_change" | "anomaly" | "location_change";

interface TimelineEvent {
  id: string;
  timestamp: string;
  type: EventType;
  description: string;
  severity: "info" | "warning" | "critical";
  details: string;
  user: string;
  ip: string;
  location: string;
  isAnomaly: boolean;
}

const eventIcons: Record<EventType, typeof Clock> = {
  login: LogIn,
  logout: LogOut,
  file_access: FileText,
  file_download: Download,
  file_upload: Upload,
  web_access: Globe,
  privilege_change: Key,
  anomaly: AlertTriangle,
  location_change: MapPin,
};

const mockEvents: TimelineEvent[] = [
  { id: "1", timestamp: "2026-02-07 14:32:15", type: "login", description: "Successful login from new device", severity: "warning", details: "Device: MacBook Pro M4 | Browser: Chrome 131", user: "Mike Rodriguez", ip: "192.168.1.45", location: "New York, NY", isAnomaly: false },
  { id: "2", timestamp: "2026-02-07 14:35:42", type: "file_access", description: "Accessed sensitive financial reports", severity: "warning", details: "File: Q4_2025_Financial_Report.xlsx | Permission: Read", user: "Mike Rodriguez", ip: "192.168.1.45", location: "New York, NY", isAnomaly: false },
  { id: "3", timestamp: "2026-02-07 14:38:10", type: "file_download", description: "Bulk download of 47 files from Finance share", severity: "critical", details: "47 files totaling 2.3GB from /finance/reports/ directory", user: "Mike Rodriguez", ip: "192.168.1.45", location: "New York, NY", isAnomaly: true },
  { id: "4", timestamp: "2026-02-07 14:41:55", type: "web_access", description: "Accessed cloud storage service", severity: "warning", details: "URL: drive.google.com | Duration: 12 min | Upload detected", user: "Mike Rodriguez", ip: "192.168.1.45", location: "New York, NY", isAnomaly: true },
  { id: "5", timestamp: "2026-02-07 14:52:30", type: "privilege_change", description: "Attempted privilege escalation", severity: "critical", details: "Attempted to access admin panel without authorization", user: "Mike Rodriguez", ip: "192.168.1.45", location: "New York, NY", isAnomaly: true },
  { id: "6", timestamp: "2026-02-07 15:01:12", type: "location_change", description: "VPN connection from unusual location", severity: "critical", details: "Connected via VPN from unrecognized IP range", user: "Mike Rodriguez", ip: "45.33.32.156", location: "Unknown (Tor Exit Node)", isAnomaly: true },
  { id: "7", timestamp: "2026-02-07 15:05:00", type: "file_upload", description: "Uploaded files to external service", severity: "critical", details: "3 files uploaded to external Dropbox account", user: "Mike Rodriguez", ip: "45.33.32.156", location: "Unknown", isAnomaly: true },
  { id: "8", timestamp: "2026-02-07 15:12:30", type: "logout", description: "Session terminated by system", severity: "info", details: "Auto-logout triggered by anomaly detection system", user: "Mike Rodriguez", ip: "45.33.32.156", location: "Unknown", isAnomaly: false },
];

const activityVolumeData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}:00`,
  events: Math.floor(Math.random() * 30) + (i >= 14 && i <= 16 ? 40 : 5),
  anomalies: i >= 14 && i <= 16 ? Math.floor(Math.random() * 8) + 3 : Math.floor(Math.random() * 2),
}));

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case "critical":
      return { badge: "bg-destructive/20 text-destructive border-0", line: "border-l-destructive", dot: "bg-destructive" };
    case "warning":
      return { badge: "bg-warning/20 text-warning border-0", line: "border-l-warning", dot: "bg-warning" };
    default:
      return { badge: "bg-primary/20 text-primary border-0", line: "border-l-primary", dot: "bg-primary" };
  }
};

export const UserActivityTimeline = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);

  const filteredEvents = mockEvents.filter((e) => {
    if (severityFilter !== "all" && e.severity !== severityFilter) return false;
    if (showAnomaliesOnly && !e.isAnomaly) return false;
    if (searchQuery && !e.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const anomalyCount = mockEvents.filter((e) => e.isAnomaly).length;
  const criticalCount = mockEvents.filter((e) => e.severity === "critical").length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-3">
          <Clock className="h-8 w-8 text-primary" />
          User Activity Timeline
        </h1>
        <p className="text-muted-foreground mt-1">
          Visual timeline of user actions with anomaly detection markers
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardContent className="pt-6 text-center">
            <Eye className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold">{mockEvents.length}</div>
            <p className="text-xs text-muted-foreground">Total Events</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <div className="text-3xl font-bold text-destructive">{anomalyCount}</div>
            <p className="text-xs text-muted-foreground">Anomalies Detected</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardContent className="pt-6 text-center">
            <Zap className="h-8 w-8 text-warning mx-auto mb-2" />
            <div className="text-3xl font-bold text-warning">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Critical Events</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardContent className="pt-6 text-center">
            <Monitor className="h-8 w-8 text-success mx-auto mb-2" />
            <div className="text-3xl font-bold text-success">Active</div>
            <p className="text-xs text-muted-foreground">Monitoring Status</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Volume Chart */}
      <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
        <CardHeader>
          <CardTitle className="text-lg">24-Hour Activity Volume</CardTitle>
          <CardDescription>Events and anomalies per hour — spikes indicate unusual activity</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={activityVolumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(225 15% 18%)" />
              <XAxis dataKey="hour" tick={{ fill: "hsl(180 20% 65%)", fontSize: 11 }} interval={2} />
              <YAxis tick={{ fill: "hsl(180 20% 65%)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(225 20% 8%)",
                  border: "1px solid hsl(225 15% 18%)",
                  borderRadius: "8px",
                  color: "hsl(180 100% 95%)",
                }}
              />
              <Area type="monotone" dataKey="events" stroke="hsl(195 100% 50%)" fill="hsl(195 100% 50%)" fillOpacity={0.15} name="Events" />
              <Area type="monotone" dataKey="anomalies" stroke="hsl(0 75% 55%)" fill="hsl(0 75% 55%)" fillOpacity={0.25} name="Anomalies" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={showAnomaliesOnly ? "default" : "outline"}
          onClick={() => setShowAnomaliesOnly(!showAnomaliesOnly)}
          size="sm"
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Anomalies Only
        </Button>
      </div>

      {/* Timeline */}
      <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
        <CardHeader>
          <CardTitle className="text-lg">Event Timeline — Mike Rodriguez</CardTitle>
          <CardDescription>Showing {filteredEvents.length} events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border/50" />

            <div className="space-y-1">
              {filteredEvents.map((event) => {
                const Icon = eventIcons[event.type] || Clock;
                const styles = getSeverityStyles(event.severity);

                return (
                  <div
                    key={event.id}
                    className={`relative pl-12 py-4 pr-4 rounded-lg border-l-4 ${styles.line} ${
                      event.isAnomaly ? "bg-destructive/5" : "bg-muted/20"
                    } hover:bg-muted/40 transition-colors`}
                  >
                    {/* Dot */}
                    <div
                      className={`absolute left-[14px] top-6 w-3 h-3 rounded-full ${styles.dot} ring-2 ring-background`}
                    />

                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-muted/50">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {event.description}
                            {event.isAnomaly && (
                              <Badge className="bg-destructive/20 text-destructive border-0 text-[10px]">
                                ANOMALY
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">{event.details}</div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Monitor className="h-3 w-3" />{event.ip}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{event.location}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Badge className={styles.badge}>{event.severity}</Badge>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {event.timestamp.split(" ")[1]}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
