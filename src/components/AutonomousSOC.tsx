import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Shield, 
  Search, 
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  Eye,
  Send,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockThreatHunts = [
  { id: "1", name: "Credential Stuffing Detection", status: "running", progress: 67, findings: 3, runtime: "2h 15m" },
  { id: "2", name: "Lateral Movement Analysis", status: "completed", progress: 100, findings: 1, runtime: "4h 32m" },
  { id: "3", name: "Data Exfiltration Patterns", status: "queued", progress: 0, findings: 0, runtime: "Pending" },
];

const mockInvestigations = [
  { id: "1", incident: "Suspicious Login - Finance", status: "auto-investigating", step: "Correlating events", confidence: 85 },
  { id: "2", incident: "Malware Detection - Endpoint #42", status: "auto-contained", step: "Generating report", confidence: 92 },
  { id: "3", incident: "DLP Alert - External Email", status: "escalated", step: "Awaiting human review", confidence: 45 },
];

const mockReports = [
  { id: "1", title: "Daily Threat Summary", generated: "Today 06:00", recipients: "Security Team", status: "sent" },
  { id: "2", title: "Weekly Executive Brief", generated: "Monday 08:00", recipients: "C-Suite", status: "sent" },
  { id: "3", title: "Incident Report #2024-0142", generated: "2 hours ago", recipients: "SOC Lead", status: "pending" },
];

const socCapabilities = [
  { id: "threat_hunting", name: "Auto Threat Hunting", description: "Proactive threat detection", enabled: true },
  { id: "investigation", name: "Auto Investigation", description: "Automated incident analysis", enabled: true },
  { id: "correlation", name: "Alert Correlation", description: "Cross-reference alerts automatically", enabled: true },
  { id: "escalation", name: "Smart Escalation", description: "Escalate only when necessary", enabled: true },
  { id: "reporting", name: "Auto Reporting", description: "Generate reports automatically", enabled: true },
  { id: "documentation", name: "Evidence Collection", description: "Auto-document with evidence", enabled: false },
];

export const AutonomousSOC = () => {
  const { toast } = useToast();
  const [autonomousMode, setAutonomousMode] = useState(true);
  const [capabilities, setCapabilities] = useState(socCapabilities);
  const [activeAlerts, setActiveAlerts] = useState(23);

  useEffect(() => {
    if (autonomousMode) {
      const interval = setInterval(() => {
        setActiveAlerts(prev => Math.max(0, prev + Math.floor(Math.random() * 3) - 2));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autonomousMode]);

  const toggleCapability = (id: string) => {
    setCapabilities(prev => prev.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  const runManualHunt = () => {
    toast({
      title: "Threat Hunt Initiated",
      description: "Manual threat hunting scan started across all systems.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-emerald-400" />
            Autonomous SOC Mode
          </h2>
          <p className="text-muted-foreground">Turn on SentinelMind and sleep</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${autonomousMode ? "bg-emerald-500/20 border border-emerald-500/50" : "bg-card border"}`}>
            <div className={`h-3 w-3 rounded-full ${autonomousMode ? "bg-emerald-500 animate-pulse" : "bg-muted"}`} />
            <span className="font-medium">Autonomous Mode</span>
            <Switch checked={autonomousMode} onCheckedChange={setAutonomousMode} />
          </div>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="p-4 text-center">
            <Shield className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">247</div>
            <div className="text-xs text-muted-foreground">Threats Blocked (24h)</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Search className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">12</div>
            <div className="text-xs text-muted-foreground">Active Hunts</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Eye className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">89</div>
            <div className="text-xs text-muted-foreground">Auto-Investigated</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <Activity className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">{activeAlerts}</div>
            <div className="text-xs text-muted-foreground">Active Alerts</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border-pink-500/20">
          <CardContent className="p-4 text-center">
            <FileText className="h-6 w-6 text-pink-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">34</div>
            <div className="text-xs text-muted-foreground">Reports Generated</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Capabilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              SOC Capabilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {capabilities.map((cap) => (
              <div key={cap.id} className="flex items-center justify-between p-2 bg-card/50 rounded-lg border border-border/30">
                <div>
                  <div className="font-medium text-sm">{cap.name}</div>
                  <div className="text-xs text-muted-foreground">{cap.description}</div>
                </div>
                <Switch checked={cap.enabled} onCheckedChange={() => toggleCapability(cap.id)} />
              </div>
            ))}
            <Button className="w-full mt-4" variant="outline" onClick={runManualHunt}>
              <Search className="h-4 w-4 mr-2" />
              Run Manual Hunt
            </Button>
          </CardContent>
        </Card>

        {/* Threat Hunts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-400" />
              Active Threat Hunts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {mockThreatHunts.map((hunt) => (
                  <div key={hunt.id} className="p-3 bg-card/50 rounded-lg border border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{hunt.name}</span>
                      {hunt.status === "running" && (
                        <Badge className="bg-blue-500/20 text-blue-400 animate-pulse">
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Running
                        </Badge>
                      )}
                      {hunt.status === "completed" && (
                        <Badge className="bg-emerald-500/20 text-emerald-400">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Done
                        </Badge>
                      )}
                      {hunt.status === "queued" && (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Queued
                        </Badge>
                      )}
                    </div>
                    {hunt.status !== "queued" && (
                      <Progress value={hunt.progress} className="h-1 mb-2" />
                    )}
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{hunt.findings} findings</span>
                      <span>{hunt.runtime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Investigations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-400" />
              Auto-Investigations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {mockInvestigations.map((inv) => (
                  <div key={inv.id} className="p-3 bg-card/50 rounded-lg border border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{inv.incident}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      {inv.status === "auto-investigating" && (
                        <Badge className="bg-blue-500/20 text-blue-400">
                          <Activity className="h-3 w-3 mr-1 animate-pulse" />
                          Investigating
                        </Badge>
                      )}
                      {inv.status === "auto-contained" && (
                        <Badge className="bg-emerald-500/20 text-emerald-400">
                          <Shield className="h-3 w-3 mr-1" />
                          Contained
                        </Badge>
                      )}
                      {inv.status === "escalated" && (
                        <Badge className="bg-orange-500/20 text-orange-400">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Escalated
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">{inv.confidence}% confidence</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{inv.step}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Auto Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-pink-400" />
            Auto-Generated Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockReports.map((report) => (
              <div key={report.id} className="p-4 bg-card/50 rounded-lg border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{report.title}</span>
                  {report.status === "sent" ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400">
                      <Send className="h-3 w-3 mr-1" />
                      Sent
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">Generated: {report.generated}</div>
                <div className="text-sm text-muted-foreground">To: {report.recipients}</div>
                <Button size="sm" variant="outline" className="w-full mt-3">View Report</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutonomousSOC;
