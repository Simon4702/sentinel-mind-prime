import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  Zap, 
  Lock, 
  UserX, 
  Wifi, 
  Key,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  Server,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockDefenseActions = [
  { id: "1", type: "isolate_user", target: "john.mitchell@company.com", reason: "High insider threat score", status: "executed", time: "14:32", auto: true },
  { id: "2", type: "enforce_mfa", target: "Engineering Department", reason: "Anomalous login patterns detected", status: "executed", time: "14:15", auto: true },
  { id: "3", type: "reset_password", target: "sarah.chen@company.com", reason: "Credential stuffing attempt", status: "pending", time: "14:05", auto: false },
  { id: "4", type: "vpn_only", target: "Finance Department", reason: "Critical alert threshold exceeded", status: "executed", time: "13:45", auto: true },
  { id: "5", type: "suspend_account", target: "external.contractor@vendor.com", reason: "Supply chain compromise detected", status: "rolled_back", time: "12:30", auto: true },
];

const defenseSettings = [
  { id: "auto_isolate", label: "Auto-Isolate Users", description: "Automatically isolate users when threat score exceeds threshold", enabled: true },
  { id: "auto_mfa", label: "Auto-Enforce MFA", description: "Force MFA re-authentication during suspicious activity", enabled: true },
  { id: "auto_vpn", label: "Auto-VPN Mode", description: "Restrict to VPN-only access during critical alerts", enabled: false },
  { id: "auto_suspend", label: "Auto-Suspend Accounts", description: "Suspend accounts when anomaly patterns hit threshold", enabled: true },
  { id: "auto_firewall", label: "Auto-Firewall Rules", description: "Dynamically adjust firewall rules based on threats", enabled: true },
  { id: "auto_password", label: "Auto-Password Reset", description: "Force password reset on compromised credentials", enabled: false },
];

const ActionIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "isolate_user": return <UserX className="h-4 w-4" />;
    case "enforce_mfa": return <Key className="h-4 w-4" />;
    case "reset_password": return <Lock className="h-4 w-4" />;
    case "vpn_only": return <Wifi className="h-4 w-4" />;
    case "suspend_account": return <UserX className="h-4 w-4" />;
    default: return <Shield className="h-4 w-4" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "executed": return <Badge className="bg-emerald-500/20 text-emerald-400"><CheckCircle className="h-3 w-3 mr-1" />Executed</Badge>;
    case "pending": return <Badge className="bg-yellow-500/20 text-yellow-400"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    case "rolled_back": return <Badge className="bg-blue-500/20 text-blue-400"><RefreshCw className="h-3 w-3 mr-1" />Rolled Back</Badge>;
    case "failed": return <Badge className="bg-red-500/20 text-red-400"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>;
    default: return <Badge variant="secondary">{status}</Badge>;
  }
};

export const AdaptiveDefenseOrchestration = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState(defenseSettings);
  const [autonomousMode, setAutonomousMode] = useState(true);

  const toggleSetting = (id: string) => {
    setSettings(settings.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
    toast({
      title: "Defense Setting Updated",
      description: "Adaptive defense configuration has been updated.",
    });
  };

  const triggerManualAction = (action: string) => {
    toast({
      title: "Manual Action Triggered",
      description: `${action} has been initiated. Awaiting confirmation.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-400" />
            Adaptive Defense Orchestration
          </h2>
          <p className="text-muted-foreground">Automatic environment-wide self-protection</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border">
            <div className={`h-3 w-3 rounded-full ${autonomousMode ? "bg-emerald-500 animate-pulse" : "bg-muted"}`} />
            <span className="font-medium">Autonomous SOC</span>
            <Switch checked={autonomousMode} onCheckedChange={setAutonomousMode} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">47</div>
                <div className="text-sm text-muted-foreground">Actions Executed Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Zap className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">12ms</div>
                <div className="text-sm text-muted-foreground">Avg Response Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Shield className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">23</div>
                <div className="text-sm text-muted-foreground">Threats Blocked</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <RefreshCw className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-muted-foreground">Actions Rolled Back</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Defense Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Defense Automation Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {settings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30">
                  <div className="flex-1">
                    <div className="font-medium">{setting.label}</div>
                    <div className="text-sm text-muted-foreground">{setting.description}</div>
                  </div>
                  <Switch checked={setting.enabled} onCheckedChange={() => toggleSetting(setting.id)} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Manual Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              Manual Defense Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => triggerManualAction("Organization Lockdown")}>
                <Lock className="h-5 w-5 text-red-400" />
                <span>Organization Lockdown</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => triggerManualAction("Force VPN Mode")}>
                <Wifi className="h-5 w-5 text-blue-400" />
                <span>Force VPN Mode</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => triggerManualAction("Mass Password Reset")}>
                <Key className="h-5 w-5 text-yellow-400" />
                <span>Mass Password Reset</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => triggerManualAction("Isolate All Endpoints")}>
                <Server className="h-5 w-5 text-purple-400" />
                <span>Isolate All Endpoints</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Defense Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {mockDefenseActions.map((action) => (
                <div key={action.id} className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/20">
                      <ActionIcon type={action.type} />
                    </div>
                    <div>
                      <div className="font-medium">{action.type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}</div>
                      <div className="text-sm text-muted-foreground">{action.target}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm">{action.reason}</div>
                      <div className="text-xs text-muted-foreground">{action.time}</div>
                    </div>
                    {getStatusBadge(action.status)}
                    {action.auto && <Badge variant="outline" className="text-xs">Auto</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdaptiveDefenseOrchestration;
