import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Brain,
  Eye,
  Zap,
  BarChart3,
  Activity,
  Radio,
  Radar,
  Crosshair,
  Lock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeThreats } from "@/hooks/useRealtimeThreats";
import { Link } from "react-router-dom";
import { 
  DefconStatus, 
  ThreatLevelBar, 
  SecurityControlsPanel, 
  LiveAuditTrail,
  TacticalMetricsGrid 
} from "@/components/tactical";

export const SentinelDashboard = () => {
  const { profile } = useAuth();
  const { threats, incidents, alerts, stats, loading } = useRealtimeThreats();

  const getThreatLevel = () => {
    if (stats.criticalThreats > 0) return { level: "CRITICAL", color: "text-destructive", icon: AlertTriangle };
    if (stats.openIncidents > 3) return { level: "HIGH", color: "text-warning", icon: AlertTriangle };
    if (stats.activeThreats > 5) return { level: "MEDIUM", color: "text-warning", icon: Shield };
    return { level: "LOW", color: "text-success", icon: Shield };
  };

  const threatLevel = getThreatLevel();
  const currentTime = new Date().toISOString().replace('T', ' ').substring(0, 19) + 'Z';

  return (
    <div className="min-h-screen bg-background relative">
      {/* Tactical Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <svg 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.03] w-[1000px] h-[1000px]" 
          viewBox="0 0 400 400" 
          fill="none"
        >
          <defs>
            <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(120, 60%, 40%)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(45, 100%, 50%)" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <path 
            d="M200 50 L320 100 L320 200 Q320 280 200 350 Q80 280 80 200 L80 100 Z" 
            stroke="url(#shieldGradient)" 
            strokeWidth="2" 
            fill="url(#shieldGradient)"
          />
          <circle cx="200" cy="180" r="60" stroke="hsl(120, 60%, 40%)" strokeWidth="1" fill="none" opacity="0.2" />
          <circle cx="200" cy="180" r="40" stroke="hsl(120, 60%, 40%)" strokeWidth="1" fill="none" opacity="0.3" />
          <circle cx="200" cy="180" r="20" stroke="hsl(120, 60%, 40%)" strokeWidth="1" fill="none" opacity="0.4" />
          {/* Crosshair */}
          <line x1="140" y1="180" x2="260" y2="180" stroke="hsl(45, 100%, 50%)" strokeWidth="0.5" opacity="0.3" />
          <line x1="200" y1="120" x2="200" y2="240" stroke="hsl(45, 100%, 50%)" strokeWidth="0.5" opacity="0.3" />
        </svg>
      </div>

      {/* Command Center Header */}
      <div className="relative z-10 border-b border-accent/20 bg-black/40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Crosshair className="h-5 w-5 text-primary animate-tactical-pulse" />
                <span className="font-tactical text-sm tracking-widest text-primary">COMMAND CENTER</span>
              </div>
              <ThreatLevelBar className="w-32" />
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1">
                <Radio className="h-3 w-3 text-success animate-tactical-pulse" />
                LIVE FEED
              </span>
              <span>{currentTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tactical Metrics */}
      <div className="relative z-10 px-4 py-6">
        <div className="container mx-auto">
          <TacticalMetricsGrid />
        </div>
      </div>

      {/* Main Operations Grid */}
      <div className="relative z-10 px-4 pb-8">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column - DEFCON & Security Controls */}
            <div className="lg:col-span-3 space-y-6">
              <DefconStatus />
              <SecurityControlsPanel />
            </div>

            {/* Center Column - Threat Feed & Training */}
            <div className="lg:col-span-6 space-y-6">
              {/* Recent Threats */}
              <Card className="tactical-card">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-tactical text-sm tracking-wider flex items-center gap-2">
                      <Radar className="h-4 w-4 text-primary animate-radar-sweep" />
                      THREAT INTELLIGENCE FEED
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Radio className="h-3 w-3 text-success animate-tactical-pulse" />
                      <span className="text-[10px] font-mono text-success">LIVE</span>
                    </div>
                  </div>
                  <p className="text-[10px] font-mono text-muted-foreground mt-1">
                    REAL-TIME THREAT DETECTION • LAST UPDATE: {currentTime}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loading ? (
                      <>
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </>
                    ) : threats.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Shield className="h-16 w-16 mx-auto mb-3 opacity-30" />
                        <p className="font-tactical text-sm tracking-wider">NO ACTIVE THREATS</p>
                        <p className="text-[10px] font-mono mt-1">ALL SECTORS CLEAR</p>
                      </div>
                    ) : (
                      threats.slice(0, 5).map((threat) => (
                        <div 
                          key={threat.id} 
                          className={`flex items-center justify-between p-3 rounded-sm border transition-all hover:bg-muted/30 ${
                            threat.severity === 'critical' ? 'border-destructive/40 bg-destructive/5' :
                            threat.severity === 'high' ? 'border-warning/40 bg-warning/5' :
                            'border-border'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-8 rounded-sm ${
                              threat.severity === 'critical' ? 'bg-destructive animate-tactical-pulse' :
                              threat.severity === 'high' ? 'bg-warning' :
                              'bg-accent'
                            }`} />
                            <div>
                              <p className="font-mono text-sm uppercase">{threat.threat_type}</p>
                              <p className="text-[10px] font-mono text-muted-foreground truncate max-w-xs">
                                {threat.indicator_type}: {threat.indicator_value}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            className={`font-tactical text-[10px] tracking-wider ${
                              threat.severity === 'critical' ? 'bg-destructive text-white' :
                              threat.severity === 'high' ? 'bg-warning text-black' :
                              'bg-accent/20 text-accent border-accent/30'
                            }`}
                          >
                            {threat.severity?.toUpperCase()}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex justify-between">
                    <Button variant="outline" size="sm" className="btn-tactical text-[10px]" asChild>
                      <Link to="/threat-monitoring">
                        <Eye className="h-3 w-3 mr-1" />
                        VIEW ALL THREATS
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" className="btn-tactical text-[10px]" asChild>
                      <Link to="/incident-response">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        INCIDENT RESPONSE
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 btn-tactical"
                  asChild
                >
                  <Link to="/behavior-engine">
                    <Brain className="h-6 w-6" />
                    <span className="text-[10px] tracking-widest">BEHAVIORAL</span>
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 btn-tactical"
                  asChild
                >
                  <Link to="/siem">
                    <Activity className="h-6 w-6" />
                    <span className="text-[10px] tracking-widest">SIEM</span>
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2 btn-tactical"
                  asChild
                >
                  <Link to="/advanced-security">
                    <Zap className="h-6 w-6" />
                    <span className="text-[10px] tracking-widest">ARSENAL</span>
                  </Link>
                </Button>
              </div>

              {/* Analytics Summary */}
              <Card className="tactical-card">
                <CardHeader className="pb-3">
                  <CardTitle className="font-tactical text-sm tracking-wider flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    OPERATIONAL METRICS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border border-success/20 rounded-sm bg-success/5">
                      <h3 className="text-2xl font-tactical font-bold text-success">99.7%</h3>
                      <p className="text-[10px] font-mono text-muted-foreground mt-1">DETECTION RATE</p>
                    </div>
                    
                    <div className="text-center p-4 border border-primary/20 rounded-sm bg-primary/5">
                      <h3 className="text-2xl font-tactical font-bold text-primary">2.3s</h3>
                      <p className="text-[10px] font-mono text-muted-foreground mt-1">AVG RESPONSE</p>
                    </div>
                    
                    <div className="text-center p-4 border border-accent/20 rounded-sm bg-accent/5">
                      <h3 className="text-2xl font-tactical font-bold text-accent">847</h3>
                      <p className="text-[10px] font-mono text-muted-foreground mt-1">BLOCKED TODAY</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Audit Trail */}
            <div className="lg:col-span-3">
              <LiveAuditTrail />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
