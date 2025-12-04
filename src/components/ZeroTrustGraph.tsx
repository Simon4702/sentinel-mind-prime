import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Network, 
  Shield, 
  AlertTriangle, 
  Users,
  Server,
  Database,
  Lock,
  Unlock,
  ChevronRight,
  CheckCircle,
  XCircle,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockAccessGraph = [
  { 
    user: "John Mitchell", 
    role: "Finance Manager",
    resources: [
      { name: "Financial Database", type: "database", accessLevel: "read-write", usage: 85, isLeastPrivilege: false },
      { name: "HR System", type: "application", accessLevel: "read", usage: 12, isLeastPrivilege: true },
      { name: "Admin Console", type: "system", accessLevel: "admin", usage: 5, isLeastPrivilege: false },
    ],
    blastRadius: 45,
    lateralMovementRisk: "high"
  },
  { 
    user: "Sarah Chen", 
    role: "Developer",
    resources: [
      { name: "Code Repository", type: "application", accessLevel: "read-write", usage: 95, isLeastPrivilege: true },
      { name: "Production DB", type: "database", accessLevel: "read", usage: 8, isLeastPrivilege: false },
      { name: "CI/CD Pipeline", type: "system", accessLevel: "admin", usage: 78, isLeastPrivilege: true },
    ],
    blastRadius: 32,
    lateralMovementRisk: "medium"
  },
  { 
    user: "Mike Rodriguez", 
    role: "Sales Rep",
    resources: [
      { name: "CRM System", type: "application", accessLevel: "read-write", usage: 90, isLeastPrivilege: true },
      { name: "Customer Data", type: "database", accessLevel: "read", usage: 75, isLeastPrivilege: true },
    ],
    blastRadius: 15,
    lateralMovementRisk: "low"
  },
];

const mockMisconfigurations = [
  { id: "1", type: "Excessive Permissions", resource: "Admin Console", users: 12, severity: "high" },
  { id: "2", type: "Unused Access", resource: "Legacy Database", users: 45, severity: "medium" },
  { id: "3", type: "Service Account Overreach", resource: "API Gateway", users: 3, severity: "critical" },
  { id: "4", type: "Group Policy Gap", resource: "File Server", users: 23, severity: "medium" },
];

const mockRecommendations = [
  { id: "1", action: "Remove admin access", target: "John Mitchell → Admin Console", impact: "High", automated: true },
  { id: "2", action: "Revoke unused permissions", target: "45 users → Legacy Database", impact: "Medium", automated: true },
  { id: "3", action: "Implement MFA", target: "All admin accounts", impact: "Critical", automated: false },
  { id: "4", action: "Segment network access", target: "Production DB", impact: "High", automated: false },
];

const ResourceIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "database": return <Database className="h-4 w-4" />;
    case "application": return <Server className="h-4 w-4" />;
    case "system": return <Network className="h-4 w-4" />;
    default: return <Server className="h-4 w-4" />;
  }
};

export const ZeroTrustGraph = () => {
  const { toast } = useToast();

  const applyRecommendation = (rec: typeof mockRecommendations[0]) => {
    toast({
      title: rec.automated ? "Applying Recommendation" : "Manual Action Required",
      description: rec.automated 
        ? `Automatically applying: ${rec.action}`
        : `Please review and manually apply: ${rec.action}`,
    });
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high": return "text-red-400";
      case "medium": return "text-yellow-400";
      case "low": return "text-emerald-400";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6 text-cyan-400" />
            Zero-Trust Graph Engine
          </h2>
          <p className="text-muted-foreground">Dynamic access visualization and least-privilege analysis</p>
        </div>
        <Button>
          <Shield className="h-4 w-4 mr-2" />
          Run Access Audit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-cyan-400" />
              <div>
                <div className="text-2xl font-bold">156</div>
                <div className="text-sm text-muted-foreground">Users Analyzed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Unlock className="h-8 w-8 text-red-400" />
              <div>
                <div className="text-2xl font-bold">23</div>
                <div className="text-sm text-muted-foreground">Excessive Permissions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold">8</div>
                <div className="text-sm text-muted-foreground">Misconfigurations</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Lock className="h-8 w-8 text-emerald-400" />
              <div>
                <div className="text-2xl font-bold">78%</div>
                <div className="text-sm text-muted-foreground">Least Privilege Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Access Graph */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                User Access Graph
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {mockAccessGraph.map((user, idx) => (
                    <Card key={idx} className="bg-card/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="font-semibold">{user.user}</div>
                            <div className="text-sm text-muted-foreground">{user.role}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-sm">Blast Radius</div>
                              <div className="text-lg font-bold text-orange-400">{user.blastRadius}%</div>
                            </div>
                            <Badge className={`${getRiskColor(user.lateralMovementRisk)} bg-transparent border`}>
                              {user.lateralMovementRisk} lateral risk
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {user.resources.map((resource, ridx) => (
                            <div key={ridx} className="flex items-center justify-between p-2 bg-card/50 rounded border border-border/30">
                              <div className="flex items-center gap-2">
                                <ResourceIcon type={resource.type} />
                                <span className="text-sm">{resource.name}</span>
                                <Badge variant="outline" className="text-xs">{resource.accessLevel}</Badge>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-20">
                                  <div className="text-xs text-muted-foreground mb-1">Usage: {resource.usage}%</div>
                                  <Progress value={resource.usage} className="h-1" />
                                </div>
                                {resource.isLeastPrivilege ? (
                                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-red-400" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Side Panels */}
        <div className="space-y-4">
          {/* Misconfigurations */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                Misconfigurations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockMisconfigurations.map((config) => (
                  <div key={config.id} className="p-2 bg-card/50 rounded-lg border border-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{config.type}</span>
                      <Badge variant={config.severity === "critical" ? "destructive" : config.severity === "high" ? "default" : "secondary"} className="text-xs">
                        {config.severity}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {config.resource} • {config.users} users affected
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400" />
                Least-Privilege Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockRecommendations.map((rec) => (
                  <div key={rec.id} className="p-2 bg-card/50 rounded-lg border border-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{rec.action}</span>
                      {rec.automated && (
                        <Badge className="bg-blue-500/20 text-blue-400 text-xs">Auto</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{rec.target}</div>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => applyRecommendation(rec)}>
                      Apply <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ZeroTrustGraph;
