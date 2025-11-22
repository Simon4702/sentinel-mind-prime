import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  AlertTriangle, 
  Shield, 
  Globe, 
  Wifi, 
  Monitor, 
  MapPin, 
  Clock, 
  Zap, 
  Eye, 
  Target, 
  TrendingUp,
  Server,
  Database,
  Lock,
  Unlock,
  FileText,
  Download,
  Upload,
  RefreshCw,
  Play,
  Pause,
  Filter
} from "lucide-react";
import ThreatMap from "@/components/ThreatMap";
import { useThreatData } from "@/hooks/useThreatData";

// Simulated network metrics generator
const generateNetworkMetrics = () => ({
  bandwidth: {
    inbound: Math.floor(Math.random() * 500) + 100,
    outbound: Math.floor(Math.random() * 300) + 50
  },
  connections: {
    active: Math.floor(Math.random() * 1000) + 500,
    suspicious: Math.floor(Math.random() * 50) + 10,
    blocked: Math.floor(Math.random() * 100) + 20
  },
  packets: {
    total: Math.floor(Math.random() * 10000) + 5000,
    malicious: Math.floor(Math.random() * 100) + 20,
    dropped: Math.floor(Math.random() * 200) + 50
  }
});

const ThreatFeed = () => {
  const { threats: dbThreats, alerts, loading } = useThreatData();
  const [isLive, setIsLive] = useState(true);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "LOW": return "success";
      case "MEDIUM": return "warning";
      case "HIGH": return "destructive";
      case "CRITICAL": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DETECTED": return "warning";
      case "INVESTIGATING": return "primary";
      case "CONTAINED": return "accent";
      case "RESOLVED": return "success";
      default: return "secondary";
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Live Threat Feed
            </CardTitle>
            <CardDescription>Real-time security event monitoring</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
              className={isLive ? "border-success/20 text-success" : "border-warning/20 text-warning"}
            >
              {isLive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isLive ? "Pause" : "Resume"}
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Activity className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {dbThreats.map((threat, index) => (
                <div 
                  key={threat.id}
                  className={`p-4 rounded-lg border transition-all duration-500 ${
                    index === 0 && isLive ? 'border-primary/40 bg-primary/5 animate-pulse' : 'border-border/20 bg-muted/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`border-${getSeverityColor(threat.severity.toUpperCase())}/20 text-${getSeverityColor(threat.severity.toUpperCase())}`}>
                        {threat.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="border-accent/20 text-accent">
                        {threat.indicator_type}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(threat.last_seen).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <h4 className="font-medium mb-1">{threat.threat_type}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{threat.description || 'No description available'}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Indicator: </span>
                      <span className="font-mono">{threat.indicator_value}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Source: </span>
                      <span className="font-mono">{threat.source}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">First Seen: </span>
                      <span>{new Date(threat.first_seen).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Confidence: </span>
                      <span className="font-semibold">{threat.confidence_level || 0}%</span>
                    </div>
                  </div>
                </div>
              ))}
              {dbThreats.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No active threats detected
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const NetworkMonitor = () => {
  const [metrics, setMetrics] = useState(generateNetworkMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(generateNetworkMetrics());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Network Activity Monitor</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bandwidth */}
        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Bandwidth
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-success" />
                  <span className="text-sm">Inbound</span>
                </div>
                <span className="font-bold">{metrics.bandwidth.inbound} Mbps</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Upload className="h-4 w-4 text-warning" />
                  <span className="text-sm">Outbound</span>
                </div>
                <span className="font-bold">{metrics.bandwidth.outbound} Mbps</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connections */}
        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wifi className="h-5 w-5 text-accent" />
              Connections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Active</span>
                <span className="font-bold text-success">{metrics.connections.active}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Suspicious</span>
                <span className="font-bold text-warning">{metrics.connections.suspicious}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Blocked</span>
                <span className="font-bold text-destructive">{metrics.connections.blocked}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Packets */}
        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5 text-warning" />
              Packet Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total</span>
                <span className="font-bold">{metrics.packets.total.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Malicious</span>
                <span className="font-bold text-destructive">{metrics.packets.malicious}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Dropped</span>
                <span className="font-bold text-warning">{metrics.packets.dropped}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};


const SystemHealth = () => {
  const systems = [
    { name: "Firewall", status: "ONLINE", uptime: "99.98%", load: 34 },
    { name: "IDS/IPS", status: "ONLINE", uptime: "99.95%", load: 67 },
    { name: "SIEM", status: "WARNING", uptime: "98.23%", load: 89 },
    { name: "Endpoint Protection", status: "ONLINE", uptime: "99.99%", load: 23 },
    { name: "Network Scanner", status: "ONLINE", uptime: "99.87%", load: 45 },
    { name: "Behavioral Engine", status: "ONLINE", uptime: "99.92%", load: 56 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ONLINE": return "success";
      case "WARNING": return "warning";
      case "ERROR": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Security System Health</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systems.map((system, index) => (
          <Card key={index} className="border-primary/20 bg-gradient-cyber shadow-elegant">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">{system.name}</CardTitle>
                <Badge variant="outline" className={`border-${getStatusColor(system.status)}/20 text-${getStatusColor(system.status)}`}>
                  {system.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uptime</span>
                <span className="font-semibold">{system.uptime}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Load</span>
                <span className="font-semibold">{system.load}%</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    system.load > 80 ? 'bg-destructive' : 
                    system.load > 60 ? 'bg-warning' : 'bg-success'
                  }`}
                  style={{ width: `${system.load}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const RealTimeMonitoring = () => {
  const { threats, alerts } = useThreatData();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                Real-Time Monitoring Center
              </h1>
              <p className="text-muted-foreground">
                Live threat detection and network security monitoring
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Card className="border-destructive/20">
                <CardContent className="p-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <div>
                    <p className="text-xs text-muted-foreground">Active Threats</p>
                    <p className="text-xl font-bold">{threats.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-warning/20">
                <CardContent className="p-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-warning" />
                  <div>
                    <p className="text-xs text-muted-foreground">Unresolved Alerts</p>
                    <p className="text-xl font-bold">{alerts.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Tabs defaultValue="threats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-card border-primary/20">
            <TabsTrigger value="threats" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Threat Feed
            </TabsTrigger>
            <TabsTrigger value="network" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              Network
            </TabsTrigger>
            <TabsTrigger value="geography" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Geography
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Global Map
            </TabsTrigger>
            <TabsTrigger value="systems" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Systems
            </TabsTrigger>
          </TabsList>

          <TabsContent value="threats">
            <ThreatFeed />
          </TabsContent>

          <TabsContent value="network">
            <NetworkMonitor />
          </TabsContent>

          <TabsContent value="geography">
            <div className="space-y-6">
              <h3 className="text-xl font-bold">Global Threat Intelligence</h3>
              
              <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    Geographic Threat Distribution
                  </CardTitle>
                  <CardDescription>Real-time threat activity by location</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { location: "San Francisco, CA", threats: 12, severity: "MEDIUM" },
                      { location: "New York, NY", threats: 8, severity: "HIGH" },
                      { location: "London, UK", threats: 15, severity: "LOW" },
                      { location: "Tokyo, JP", threats: 23, severity: "CRITICAL" },
                      { location: "Sydney, AU", threats: 6, severity: "MEDIUM" },
                      { location: "Berlin, DE", threats: 9, severity: "LOW" },
                      { location: "Unknown/Tor", threats: 31, severity: "CRITICAL" }
                    ].map((location, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/20">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{location.location}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{location.threats} threats</span>
                          <Badge variant="outline" className={`border-${
                            location.severity === "LOW" ? "success" :
                            location.severity === "MEDIUM" ? "warning" : 
                            "destructive"
                          }/20 text-${
                            location.severity === "LOW" ? "success" :
                            location.severity === "MEDIUM" ? "warning" : 
                            "destructive"
                          }`}>
                            {location.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="map">
            <ThreatMap />
          </TabsContent>

          <TabsContent value="systems">
            <SystemHealth />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};