import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  AlertTriangle,
  Info,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  Pause,
  Play,
  Download,
  ChevronDown,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Event {
  id: string;
  event_type: string;
  severity: string;
  source: string;
  message: string;
  source_ip: string;
  destination_ip: string;
  user_name: string;
  is_alert: boolean;
  timestamp: string;
  mitre_tactic: string;
  mitre_technique: string;
}

interface EventsStreamProps {
  compact?: boolean;
  limit?: number;
}

export const EventsStream = ({ compact = false, limit = 50 }: EventsStreamProps) => {
  const { profile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchEvents = async () => {
    if (!profile?.organization_id) return;

    try {
      let query = supabase
        .from("siem_events")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (filter !== "all") {
        query = query.eq("severity", filter);
      }

      if (search) {
        query = query.ilike("message", `%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

    if (isLive) {
      const channel = supabase
        .channel("siem-events-stream")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "siem_events",
          },
          (payload) => {
            setEvents((prev) => [payload.new as Event, ...prev].slice(0, limit));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile?.organization_id, filter, search, isLive]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <XCircle className="h-4 w-4 text-red-500" />;
      case "high": return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case "medium": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "low": return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getEventTypeColor = (type: string) => {
    if (type.includes("auth")) return "text-purple-400";
    if (type.includes("network")) return "text-blue-400";
    if (type.includes("file")) return "text-green-400";
    if (type.includes("process")) return "text-orange-400";
    return "text-muted-foreground";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {compact ? "Recent Events" : "Live Event Stream"}
            {isLive && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                LIVE
              </span>
            )}
          </CardTitle>
          {!compact && (
            <div className="flex items-center gap-2">
              <Button
                variant={isLive ? "default" : "outline"}
                size="sm"
                onClick={() => setIsLive(!isLive)}
              >
                {isLive ? (
                  <>
                    <Pause className="h-3 w-3 mr-1" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-1" /> Resume
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            </div>
          )}
        </div>

        {!compact && (
          <div className="flex items-center gap-2 mt-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className={compact ? "h-[400px]" : "h-[600px]"} ref={scrollRef}>
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <Activity className="h-8 w-8 mb-2 opacity-50" />
              <p>No events recorded</p>
              <p className="text-sm">Events will appear here in real-time</p>
            </div>
          ) : (
            <div className="space-y-2">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className={`group p-3 rounded-lg border transition-all hover:bg-accent/50 ${
                    event.is_alert ? "border-l-4 border-l-red-500 bg-red-500/5" : ""
                  } ${index === 0 && isLive ? "animate-in slide-in-from-top-2" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getSeverityIcon(event.severity)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                        <span className={`text-xs font-medium ${getEventTypeColor(event.event_type)}`}>
                          {event.event_type}
                        </span>
                        {event.is_alert && (
                          <Badge variant="destructive" className="text-xs">
                            ALERT
                          </Badge>
                        )}
                        {event.mitre_technique && (
                          <Badge variant="outline" className="text-xs">
                            {event.mitre_technique}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm line-clamp-2">{event.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{event.source}</span>
                        {event.source_ip && <span>{event.source_ip}</span>}
                        {event.user_name && <span>👤 {event.user_name}</span>}
                        <span className="ml-auto">
                          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default EventsStream;
