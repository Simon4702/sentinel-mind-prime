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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AgentGrid } from "./AgentGrid";
import { EventsStream } from "./EventsStream";
import { SIEMAnalytics } from "./SIEMAnalytics";
import { AgentDeployModal } from "./AgentDeployModal";

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
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing SIEM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg shadow-purple-500/25">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">SIEM Console</h1>
                <p className="text-purple-200">Security Information & Event Management</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={fetchStats}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/25"
              onClick={() => setShowDeployModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Deploy Agent
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-6 gap-4 mt-8">
          <StatCard
            label="Total Agents"
            value={stats.total}
            icon={Server}
            color="text-white"
            bgColor="bg-white/10"
          />
          <StatCard
            label="Online"
            value={stats.online}
            icon={Activity}
            color="text-emerald-400"
            bgColor="bg-emerald-500/20"
            pulse
          />
          <StatCard
            label="Offline"
            value={stats.offline}
            icon={Monitor}
            color="text-red-400"
            bgColor="bg-red-500/20"
          />
          <StatCard
            label="Warning"
            value={stats.warning}
            icon={AlertTriangle}
            color="text-yellow-400"
            bgColor="bg-yellow-500/20"
          />
          <StatCard
            label="Events Today"
            value={stats.eventsToday.toLocaleString()}
            icon={Zap}
            color="text-blue-400"
            bgColor="bg-blue-500/20"
          />
          <StatCard
            label="Alerts Today"
            value={stats.alertsToday}
            icon={AlertTriangle}
            color="text-orange-400"
            bgColor="bg-orange-500/20"
          />
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-card/50 backdrop-blur-sm border p-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Globe className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="agents" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Server className="h-4 w-4 mr-2" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Activity className="h-4 w-4 mr-2" />
            Live Events
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
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
  <div className={`${bgColor} backdrop-blur-sm rounded-xl p-4 border border-white/10`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${bgColor} ${pulse ? "animate-pulse" : ""}`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-white/60">{label}</p>
      </div>
    </div>
  </div>
);

export default SIEMDashboard;
