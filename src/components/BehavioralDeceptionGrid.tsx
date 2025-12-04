import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  Eye, 
  Target, 
  Activity, 
  AlertTriangle,
  Server,
  Database,
  Globe,
  Key,
  UserX,
  Fingerprint,
  Clock,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for honeypots
const mockHoneypots = [
  { id: "1", name: "Finance-DB-Decoy", type: "database", status: "active", interactions: 23, lastHit: "2 hours ago", riskLevel: "high" },
  { id: "2", name: "HR-FileShare-Trap", type: "file_share", status: "active", interactions: 8, lastHit: "1 day ago", riskLevel: "medium" },
  { id: "3", name: "API-Gateway-Honey", type: "api_endpoint", status: "active", interactions: 45, lastHit: "30 min ago", riskLevel: "critical" },
  { id: "4", name: "Admin-Portal-Fake", type: "web_app", status: "dormant", interactions: 2, lastHit: "1 week ago", riskLevel: "low" },
];

const mockTelemetry = [
  { id: "1", attackerIp: "185.x.x.42", technique: "Credential Stuffing", intent: "Data Exfiltration", time: "14:32:01", honeypot: "Finance-DB-Decoy", sandboxed: true },
  { id: "2", attackerIp: "92.x.x.118", technique: "SQL Injection", intent: "Database Access", time: "14:28:45", honeypot: "API-Gateway-Honey", sandboxed: true },
  { id: "3", attackerIp: "203.x.x.56", technique: "Directory Traversal", intent: "Reconnaissance", time: "14:15:22", honeypot: "HR-FileShare-Trap", sandboxed: false },
];

const mockDecoyCredentials = [
  { id: "1", username: "svc_backup_admin", seedLocation: "Chrome Password Manager", triggered: false, department: "IT" },
  { id: "2", username: "finance_readonly", seedLocation: "Edge Passwords", triggered: true, department: "Finance" },
  { id: "3", username: "hr_system_user", seedLocation: "Firefox Saved Logins", triggered: false, department: "HR" },
];

const HoneypotCard = ({ honeypot }: { honeypot: typeof mockHoneypots[0] }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "database": return <Database className="h-4 w-4" />;
      case "file_share": return <Server className="h-4 w-4" />;
      case "api_endpoint": return <Globe className="h-4 w-4" />;
      case "web_app": return <Globe className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical": return "bg-red-500/20 text-red-400 border-red-500/50";
      case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/50";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      default: return "bg-green-500/20 text-green-400 border-green-500/50";
    }
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getTypeIcon(honeypot.type)}
            <span className="font-medium">{honeypot.name}</span>
          </div>
          <Badge className={getRiskColor(honeypot.riskLevel)}>{honeypot.riskLevel}</Badge>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Interactions</span>
            <span className="text-foreground font-medium">{honeypot.interactions}</span>
          </div>
          <div className="flex justify-between">
            <span>Last Hit</span>
            <span className="text-foreground">{honeypot.lastHit}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Status</span>
            <Badge variant={honeypot.status === "active" ? "default" : "secondary"}>
              {honeypot.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const TelemetryRow = ({ event }: { event: typeof mockTelemetry[0] }) => (
  <div className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30">
    <div className="flex items-center gap-4">
      <div className="p-2 rounded-full bg-destructive/20">
        <UserX className="h-4 w-4 text-destructive" />
      </div>
      <div>
        <div className="font-medium">{event.attackerIp}</div>
        <div className="text-sm text-muted-foreground">{event.technique}</div>
      </div>
    </div>
    <div className="text-center">
      <div className="text-sm font-medium">{event.intent}</div>
      <div className="text-xs text-muted-foreground">{event.honeypot}</div>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">{event.time}</span>
      {event.sandboxed ? (
        <Badge className="bg-emerald-500/20 text-emerald-400">Sandboxed</Badge>
      ) : (
        <Badge variant="outline">Monitoring</Badge>
      )}
    </div>
  </div>
);

export const BehavioralDeceptionGrid = () => {
  const { toast } = useToast();
  const [attackerMirroring, setAttackerMirroring] = useState(true);
  const [autoSandbox, setAutoSandbox] = useState(true);

  const deployHoneypot = () => {
    toast({
      title: "Honeypot Deployed",
      description: "New dynamic honeypot is now active and mimicking real systems.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Target className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm text-muted-foreground">Active Honeypots</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">78</div>
                <div className="text-sm text-muted-foreground">Today's Interactions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Shield className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">23</div>
                <div className="text-sm text-muted-foreground">Attackers Sandboxed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Key className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">15</div>
                <div className="text-sm text-muted-foreground">Decoy Credentials</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Deception Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <Switch checked={attackerMirroring} onCheckedChange={setAttackerMirroring} />
              <div>
                <div className="font-medium">AI Attacker Mirroring</div>
                <div className="text-sm text-muted-foreground">Confuse attackers by mimicking their behavior</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={autoSandbox} onCheckedChange={setAutoSandbox} />
              <div>
                <div className="font-medium">Auto-Sandbox Redirect</div>
                <div className="text-sm text-muted-foreground">Automatically redirect suspicious users</div>
              </div>
            </div>
            <Button onClick={deployHoneypot} className="ml-auto">
              <Target className="h-4 w-4 mr-2" />
              Deploy New Honeypot
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="honeypots">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="honeypots">Honeypots</TabsTrigger>
          <TabsTrigger value="telemetry">Attacker Telemetry</TabsTrigger>
          <TabsTrigger value="credentials">Decoy Credentials</TabsTrigger>
        </TabsList>

        <TabsContent value="honeypots" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockHoneypots.map((hp) => (
              <HoneypotCard key={hp.id} honeypot={hp} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="telemetry" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fingerprint className="h-5 w-5" />
                Real-time Attacker Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {mockTelemetry.map((event) => (
                    <TelemetryRow key={event.id} event={event} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credentials" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Seeded Decoy Credentials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockDecoyCredentials.map((cred) => (
                  <div key={cred.id} className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30">
                    <div className="flex items-center gap-3">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-mono text-sm">{cred.username}</div>
                        <div className="text-xs text-muted-foreground">{cred.seedLocation}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{cred.department}</Badge>
                      {cred.triggered ? (
                        <Badge className="bg-red-500/20 text-red-400">Triggered</Badge>
                      ) : (
                        <Badge className="bg-emerald-500/20 text-emerald-400">Active</Badge>
                      )}
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

export default BehavioralDeceptionGrid;
