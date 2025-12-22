import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Server,
  Monitor,
  Laptop,
  Database,
  Cloud,
  Cpu,
  HardDrive,
  Wifi,
  Activity,
  MoreVertical,
  Eye,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Agent {
  id: string;
  agent_name: string;
  hostname: string;
  ip_address: string;
  agent_type: string;
  os_type: string;
  os_version: string;
  status: string;
  last_heartbeat_at: string;
  events_collected: number;
  alerts_generated: number;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  tags: string[];
}

interface AgentGridProps {
  compact?: boolean;
}

export const AgentGrid = ({ compact = false }: AgentGridProps) => {
  const { profile } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAgents = async () => {
    if (!profile?.organization_id) return;

    try {
      const { data, error } = await supabase
        .from("siem_agents")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .order("status", { ascending: true })
        .order("last_heartbeat_at", { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [profile?.organization_id]);

  const getAgentIcon = (type: string) => {
    switch (type) {
      case "endpoint": return Laptop;
      case "server": return Server;
      case "database": return Database;
      case "cloud": return Cloud;
      case "network": return Wifi;
      default: return Monitor;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online": return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case "offline": return <XCircle className="h-4 w-4 text-red-400" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "offline": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "warning": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getOSIcon = (os: string) => {
    if (os?.toLowerCase().includes("windows")) return "🪟";
    if (os?.toLowerCase().includes("linux")) return "🐧";
    if (os?.toLowerCase().includes("mac")) return "🍎";
    return "💻";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading agents...</p>
        </CardContent>
      </Card>
    );
  }

  if (agents.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <Server className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Agents Deployed</h3>
          <p className="text-muted-foreground mb-4">
            Deploy your first agent to start collecting security events
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayAgents = compact ? agents.slice(0, 6) : agents;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Deployed Agents
            <Badge variant="secondary">{agents.length}</Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchAgents}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className={compact ? "h-[400px]" : "h-[600px]"}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayAgents.map((agent) => {
              const Icon = getAgentIcon(agent.agent_type);
              return (
                <div
                  key={agent.id}
                  className="group relative p-4 rounded-xl border bg-gradient-to-br from-card to-card/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  {/* Status indicator */}
                  <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
                    agent.status === "online" ? "bg-emerald-400 animate-pulse" :
                    agent.status === "warning" ? "bg-yellow-400" : "bg-red-400"
                  }`} />

                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`p-3 rounded-xl ${
                      agent.status === "online" 
                        ? "bg-gradient-to-br from-emerald-500/20 to-blue-500/20" 
                        : "bg-muted"
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        agent.status === "online" ? "text-emerald-400" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{agent.agent_name}</h3>
                        <span>{getOSIcon(agent.os_type)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{agent.hostname}</p>
                      <p className="text-xs text-muted-foreground">{agent.ip_address}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Restart Agent
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Agent
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <Badge className={getStatusColor(agent.status)}>
                      {getStatusIcon(agent.status)}
                      <span className="ml-1 capitalize">{agent.status}</span>
                    </Badge>
                    {agent.last_heartbeat_at && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(agent.last_heartbeat_at), { addSuffix: true })}
                      </span>
                    )}
                  </div>

                  {/* Resource Usage */}
                  <div className="space-y-3">
                    <ResourceBar 
                      icon={Cpu} 
                      label="CPU" 
                      value={agent.cpu_usage || 0} 
                    />
                    <ResourceBar 
                      icon={Database} 
                      label="Memory" 
                      value={agent.memory_usage || 0} 
                    />
                    <ResourceBar 
                      icon={HardDrive} 
                      label="Disk" 
                      value={agent.disk_usage || 0} 
                    />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Activity className="h-3 w-3" />
                      <span>{agent.events_collected?.toLocaleString() || 0} events</span>
                    </div>
                    <div className="flex items-center gap-1 text-orange-400">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{agent.alerts_generated || 0} alerts</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {agent.tags && agent.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {agent.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

interface ResourceBarProps {
  icon: React.ElementType;
  label: string;
  value: number;
}

const ResourceBar = ({ icon: Icon, label, value }: ResourceBarProps) => {
  const getColor = (val: number) => {
    if (val >= 90) return "bg-red-500";
    if (val >= 70) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3 w-3 text-muted-foreground" />
      <span className="text-xs text-muted-foreground w-12">{label}</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${getColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-mono w-8 text-right">{value}%</span>
    </div>
  );
};

export default AgentGrid;
