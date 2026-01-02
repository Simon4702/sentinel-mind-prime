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
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteAgent = async () => {
    if (!agentToDelete) return;
    
    setIsDeleting(true);
    try {
      // First delete related events
      await supabase
        .from("siem_events")
        .delete()
        .eq("agent_id", agentToDelete.id);

      // Then delete the agent
      const { error } = await supabase
        .from("siem_agents")
        .delete()
        .eq("id", agentToDelete.id);

      if (error) throw error;

      toast({
        title: "Agent Removed",
        description: `${agentToDelete.agent_name} has been successfully removed.`,
      });

      setAgents(agents.filter((a) => a.id !== agentToDelete.id));
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast({
        title: "Error",
        description: "Failed to remove agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setAgentToDelete(null);
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
      <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground font-mono text-sm">LOADING AGENTS...</p>
        </CardContent>
      </Card>
    );
  }

  if (agents.length === 0) {
    return (
      <Card className="border-dashed border-primary/30 bg-gradient-to-br from-card to-primary/5">
        <CardContent className="p-12 text-center">
          <div className="relative inline-block">
            <Server className="h-16 w-16 mx-auto text-primary/30 mb-4" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          </div>
          <h3 className="text-lg font-mono font-bold mb-2 text-primary">NO AGENTS DEPLOYED</h3>
          <p className="text-muted-foreground font-mono text-sm">
            Deploy your first agent to initialize security monitoring
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayAgents = compact ? agents.slice(0, 6) : agents;

  return (
    <>
      <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm">
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="relative">
                <Server className="h-5 w-5 text-primary" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              <span className="font-mono tracking-wide">DEPLOYED AGENTS</span>
              <Badge variant="outline" className="font-mono border-primary/30 text-primary">
                {agents.length} UNITS
              </Badge>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchAgents} className="font-mono">
              <RefreshCw className="h-4 w-4 mr-2" />
              SYNC
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <ScrollArea className={compact ? "h-[400px]" : "h-[600px]"}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayAgents.map((agent) => {
                const Icon = getAgentIcon(agent.agent_type);
                return (
                  <div
                    key={agent.id}
                    className="group relative p-4 rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 backdrop-blur-sm"
                  >
                    {/* Scan line effect */}
                    <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse" />
                    </div>

                    {/* Status indicator */}
                    <div className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${
                      agent.status === "online" ? "bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse" :
                      agent.status === "warning" ? "bg-yellow-400 shadow-lg shadow-yellow-400/50" : "bg-red-400 shadow-lg shadow-red-400/50"
                    }`} />

                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`p-3 rounded-xl border ${
                        agent.status === "online" 
                          ? "bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border-emerald-500/30" 
                          : agent.status === "warning"
                          ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
                          : "bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30"
                      }`}>
                        <Icon className={`h-6 w-6 ${
                          agent.status === "online" ? "text-emerald-400" : 
                          agent.status === "warning" ? "text-yellow-400" : "text-red-400"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-mono font-bold truncate text-foreground">{agent.agent_name}</h3>
                          <span>{getOSIcon(agent.os_type)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono truncate">{agent.hostname}</p>
                        <p className="text-xs text-primary/70 font-mono">{agent.ip_address}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="font-mono">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Restart Agent
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => setAgentToDelete(agent)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Agent
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={`${getStatusColor(agent.status)} font-mono text-xs`}>
                        {getStatusIcon(agent.status)}
                        <span className="ml-1 uppercase">{agent.status}</span>
                      </Badge>
                      {agent.last_heartbeat_at && (
                        <span className="text-xs text-muted-foreground font-mono">
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
                        label="MEM" 
                        value={agent.memory_usage || 0} 
                      />
                      <ResourceBar 
                        icon={HardDrive} 
                        label="DSK" 
                        value={agent.disk_usage || 0} 
                      />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50 text-sm font-mono">
                      <div className="flex items-center gap-1 text-primary">
                        <Activity className="h-3 w-3" />
                        <span>{agent.events_collected?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-orange-400">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{agent.alerts_generated || 0}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {agent.tags && agent.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {agent.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] font-mono border-primary/30">
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!agentToDelete} onOpenChange={() => setAgentToDelete(null)}>
        <AlertDialogContent className="border-destructive/50 bg-gradient-to-br from-card to-destructive/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-mono text-destructive">
              <Trash2 className="h-5 w-5" />
              CONFIRM AGENT REMOVAL
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono">
              Are you sure you want to remove <span className="text-foreground font-bold">{agentToDelete?.agent_name}</span>?
              This will also delete all associated events and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono" disabled={isDeleting}>
              CANCEL
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAgent}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 font-mono"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  REMOVING...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  REMOVE AGENT
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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
      <span className="text-[10px] text-muted-foreground font-mono w-8">{label}</span>
      <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden border border-border/30">
        <div
          className={`h-full rounded-full transition-all ${getColor(value)} shadow-sm`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[10px] font-mono w-8 text-right text-primary">{value}%</span>
    </div>
  );
};

export default AgentGrid;
