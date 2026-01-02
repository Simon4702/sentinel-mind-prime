import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Server,
  Activity,
  Shield,
  AlertTriangle,
  Zap,
  Globe,
  Cpu,
  HardDrive,
  Network,
  RefreshCw,
  Plus,
  Eye,
  Clock,
  TrendingUp,
  BarChart3,
  Monitor,
  Loader2,
  Radio,
  Crosshair,
  Target,
  Radar,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AgentGrid } from "./AgentGrid";
import { EventsStream } from "./EventsStream";
import { SIEMAnalytics } from "./SIEMAnalytics";
import { AgentDeployModal } from "./AgentDeployModal";
import { CorrelationRules } from "./CorrelationRules";
import { CyberToolsSidebar } from "./CyberToolsSidebar";

interface AgentStats {
  total: number;
  online: number;
  offline: number;
  warning: number;
  eventsToday: number;
  alertsToday: number;
}

export const SIEMDashboard = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<AgentStats>({
    total: 0,
    online: 0,
    offline: 0,
    warning: 0,
    eventsToday: 0,
    alertsToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchStats = async () => {
    if (!profile?.organization_id) return;

    try {
      const { data: agents, error } = await supabase
        .from("siem_agents")
        .select("*")
        .eq("organization_id", profile.organization_id);

      if (error) throw error;

      const online = agents?.filter((a) => a.status === "online").length || 0;
      const offline = agents?.filter((a) => a.status === "offline").length || 0;
      const warning = agents?.filter((a) => a.status === "warning").length || 0;

      // Get today's events count
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { count: eventsCount } = await supabase
        .from("siem_events")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", profile.organization_id)
        .gte("timestamp", today.toISOString());

      const { count: alertsCount } = await supabase
        .from("siem_events")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", profile.organization_id)
        .eq("is_alert", true)
        .gte("timestamp", today.toISOString());

      setStats({
        total: agents?.length || 0,
        online,
        offline,
        warning,
        eventsToday: eventsCount || 0,
        alertsToday: alertsCount || 0,
      });
    } catch (error) {
      console.error("Error fetching SIEM stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Subscribe to real-time agent updates
    const agentChannel = supabase
      .channel("siem-agents-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "siem_agents" },
        () => fetchStats()
      )
      .subscribe();

    // Subscribe to real-time event updates
    const eventChannel = supabase
      .channel("siem-events-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "siem_events" },
        (payload) => {
          if ((payload.new as any).is_alert) {
            toast({
              title: "New Security Alert",
              description: (payload.new as any).message,
              variant: "destructive",
            });
          }
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(agentChannel);
      supabase.removeChannel(eventChannel);
    };
  }, [profile?.organization_id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="relative inline-block">
            <Radar className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
            <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping" />
          </div>
          <p className="text-primary font-mono text-sm tracking-widest animate-pulse">INITIALIZING SIEM...</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Cyber Tools Sidebar */}
      <CyberToolsSidebar />

      {/* Main Content */}
      <div className="flex-1 space-y-6 p-6 overflow-auto">
        {/* Military-Grade Hero Header */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-background via-card to-primary/5">
          {/* Animated grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_100%)]" />
          
          {/* Scan lines */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.02)_50%)] bg-[length:100%_4px]" />
          </div>

          {/* Glowing orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/5 rounded-full blur-[60px]" />
          
          <div className="relative z-10 p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="relative">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 border border-primary/30 shadow-lg shadow-primary/20">
                      <Shield className="h-10 w-10 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-cyan-500 rounded-full border-2 border-background" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-mono font-bold text-foreground tracking-tight">SIEM COMMAND CENTER</h1>
                      <Badge variant="outline" className="font-mono text-xs border-emerald-500/50 text-emerald-400 animate-pulse">
                        <Radio className="h-3 w-3 mr-1" />
                        LIVE
                      </Badge>
                    </div>
                    <p className="text-muted-foreground font-mono text-sm tracking-wide">
                      SECURITY INFORMATION & EVENT MANAGEMENT // THREAT LEVEL: ELEVATED
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="border-primary/30 text-primary hover:bg-primary/10 font-mono"
                  onClick={fetchStats}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  SYNC
                </Button>
                <Button
                  className="bg-gradient-to-r from-primary to-cyan-500 hover:from-primary/90 hover:to-cyan-500/90 shadow-lg shadow-primary/25 font-mono"
                  onClick={() => setShowDeployModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  DEPLOY AGENT
                </Button>
              </div>
            </div>

            {/* Stats Row - Military Style */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-8">
              <StatCard
                label="TOTAL AGENTS"
                value={stats.total}
                icon={Server}
                color="text-foreground"
                bgColor="bg-card/50 border-border/50"
              />
              <StatCard
                label="OPERATIONAL"
                value={stats.online}
                icon={Crosshair}
                color="text-emerald-400"
                bgColor="bg-emerald-500/10 border-emerald-500/30"
                pulse
              />
              <StatCard
                label="OFFLINE"
                value={stats.offline}
                icon={Monitor}
                color="text-red-400"
                bgColor="bg-red-500/10 border-red-500/30"
              />
              <StatCard
                label="CAUTION"
                value={stats.warning}
                icon={AlertTriangle}
                color="text-yellow-400"
                bgColor="bg-yellow-500/10 border-yellow-500/30"
              />
              <StatCard
                label="EVENTS/24H"
                value={stats.eventsToday.toLocaleString()}
                icon={Zap}
                color="text-primary"
                bgColor="bg-primary/10 border-primary/30"
              />
              <StatCard
                label="ALERTS/24H"
                value={stats.alertsToday}
                icon={Target}
                color="text-orange-400"
                bgColor="bg-orange-500/10 border-orange-500/30"
              />
            </div>
          </div>
        </div>

        {/* Main Content Tabs - Military Style */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-card/50 backdrop-blur-sm border border-border/50 p-1 font-mono">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/30 border border-transparent">
              <Globe className="h-4 w-4 mr-2" />
              OVERVIEW
            </TabsTrigger>
            <TabsTrigger value="agents" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/30 border border-transparent">
              <Server className="h-4 w-4 mr-2" />
              AGENTS
            </TabsTrigger>
            <TabsTrigger value="events" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/30 border border-transparent">
              <Activity className="h-4 w-4 mr-2" />
              LIVE FEED
            </TabsTrigger>
            <TabsTrigger value="correlation" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/30 border border-transparent">
              <Shield className="h-4 w-4 mr-2" />
              CORRELATIONS
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-primary/30 border border-transparent">
              <BarChart3 className="h-4 w-4 mr-2" />
              ANALYTICS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AgentGrid compact />
              </div>
              <div>
                <EventsStream compact limit={10} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="agents">
            <AgentGrid />
          </TabsContent>

          <TabsContent value="events">
            <EventsStream />
          </TabsContent>

          <TabsContent value="correlation">
            <CorrelationRules />
          </TabsContent>

          <TabsContent value="analytics">
            <SIEMAnalytics />
          </TabsContent>
        </Tabs>

        <AgentDeployModal 
          open={showDeployModal} 
          onClose={() => setShowDeployModal(false)}
          onSuccess={() => {
            setShowDeployModal(false);
            fetchStats();
          }}
        />
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  pulse?: boolean;
}

const StatCard = ({ label, value, icon: Icon, color, bgColor, pulse }: StatCardProps) => (
  <div className={`${bgColor} backdrop-blur-sm rounded-xl p-4 border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-background/50 ${pulse ? "animate-pulse" : ""}`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <p className={`text-2xl font-mono font-bold ${color}`}>{value}</p>
        <p className="text-[10px] font-mono text-muted-foreground tracking-widest">{label}</p>
      </div>
    </div>
  </div>
);

export default SIEMDashboard;
