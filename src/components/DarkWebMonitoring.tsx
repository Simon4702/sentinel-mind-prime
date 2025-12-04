import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  AlertTriangle, 
  Shield, 
  Search,
  Globe,
  Key,
  Users,
  FileText,
  MessageSquare,
  RefreshCw,
  ExternalLink,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockCredentialLeaks = [
  { id: "1", email: "john.doe@company.com", source: "Dark Forum XYZ", discoveredAt: "2 hours ago", severity: "critical", status: "active" },
  { id: "2", email: "jane.smith@company.com", source: "Paste Site ABC", discoveredAt: "1 day ago", severity: "high", status: "mitigated" },
  { id: "3", email: "admin@company.com", source: "Data Dump Market", discoveredAt: "3 days ago", severity: "critical", status: "active" },
];

const mockDataDumps = [
  { id: "1", title: "Corporate Database Leak", records: "50,000", price: "$5,000", source: "Underground Forum", date: "Jan 10, 2024" },
  { id: "2", title: "Employee PII Collection", records: "12,000", price: "$2,500", source: "Dark Market", date: "Jan 8, 2024" },
];

const mockTyposquats = [
  { id: "1", domain: "c0mpany.com", similarity: 95, status: "active", type: "Homoglyph", risk: "high" },
  { id: "2", domain: "company-login.net", similarity: 78, status: "active", type: "Keyword", risk: "medium" },
  { id: "3", domain: "companny.com", similarity: 92, status: "taken_down", type: "Typo", risk: "high" },
];

const mockBrandAbuse = [
  { id: "1", platform: "WhatsApp", type: "Fake Support", reach: "5,000+", status: "investigating" },
  { id: "2", platform: "Telegram", type: "Impersonation", reach: "2,300", status: "reported" },
  { id: "3", platform: "Twitter/X", type: "Fake Account", reach: "12,000", status: "taken_down" },
];

const mockImpersonations = [
  { id: "1", name: "CEO - Fake Profile", platform: "LinkedIn", followers: 2500, status: "active" },
  { id: "2", name: "CFO - Impersonation", platform: "Twitter", followers: 890, status: "reported" },
];

export const DarkWebMonitoring = () => {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);

  const runScan = () => {
    setScanning(true);
    toast({
      title: "Dark Web Scan Initiated",
      description: "Scanning dark web sources for organization mentions...",
    });
    setTimeout(() => setScanning(false), 3000);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge className="bg-red-500/20 text-red-400">Critical</Badge>;
      case "high": return <Badge className="bg-orange-500/20 text-orange-400">High</Badge>;
      case "medium": return <Badge className="bg-yellow-500/20 text-yellow-400">Medium</Badge>;
      default: return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-red-500/20 text-red-400">Active</Badge>;
      case "mitigated": return <Badge className="bg-emerald-500/20 text-emerald-400">Mitigated</Badge>;
      case "taken_down": return <Badge className="bg-emerald-500/20 text-emerald-400">Taken Down</Badge>;
      case "investigating": return <Badge className="bg-blue-500/20 text-blue-400">Investigating</Badge>;
      case "reported": return <Badge className="bg-yellow-500/20 text-yellow-400">Reported</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="h-6 w-6 text-purple-400" />
            Dark Web & Reputational Defense
          </h2>
          <p className="text-muted-foreground">Monitor external threats and brand abuse</p>
        </div>
        <Button onClick={runScan} disabled={scanning}>
          {scanning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Run Deep Scan
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4 text-center">
            <Key className="h-6 w-6 text-red-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">{mockCredentialLeaks.length}</div>
            <div className="text-xs text-muted-foreground">Credential Leaks</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4 text-center">
            <FileText className="h-6 w-6 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">{mockDataDumps.length}</div>
            <div className="text-xs text-muted-foreground">Data Dumps</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <Globe className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">{mockTyposquats.length}</div>
            <div className="text-xs text-muted-foreground">Typosquats</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">{mockImpersonations.length}</div>
            <div className="text-xs text-muted-foreground">Impersonations</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">{mockBrandAbuse.length}</div>
            <div className="text-xs text-muted-foreground">Brand Abuse</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="credentials">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="credentials">Credential Leaks</TabsTrigger>
          <TabsTrigger value="dumps">Data Dumps</TabsTrigger>
          <TabsTrigger value="typosquats">Typosquats</TabsTrigger>
          <TabsTrigger value="impersonation">Impersonation</TabsTrigger>
          <TabsTrigger value="brand">Brand Abuse</TabsTrigger>
        </TabsList>

        <TabsContent value="credentials" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-red-400" />
                Leaked Credentials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockCredentialLeaks.map((leak) => (
                  <div key={leak.id} className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30">
                    <div className="flex items-center gap-3">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-mono text-sm">{leak.email}</div>
                        <div className="text-xs text-muted-foreground">Source: {leak.source}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{leak.discoveredAt}</span>
                      {getSeverityBadge(leak.severity)}
                      {getStatusBadge(leak.status)}
                      <Button size="sm" variant="outline">
                        <Shield className="h-3 w-3 mr-1" />
                        Mitigate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dumps" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-400" />
                Data Dumps Detected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockDataDumps.map((dump) => (
                  <div key={dump.id} className="p-4 bg-card/30 rounded-lg border border-red-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{dump.title}</span>
                      <Badge className="bg-red-500/20 text-red-400">{dump.price}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Records: </span>
                        <span className="font-medium">{dump.records}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Source: </span>
                        <span>{dump.source}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date: </span>
                        <span>{dump.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typosquats" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-yellow-400" />
                Typosquatted Domains
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockTyposquats.map((domain) => (
                  <div key={domain.id} className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30">
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-mono">{domain.domain}</div>
                        <div className="text-xs text-muted-foreground">{domain.type} - {domain.similarity}% similarity</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getSeverityBadge(domain.risk)}
                      {getStatusBadge(domain.status)}
                      {domain.status !== "taken_down" && (
                        <Button size="sm" variant="outline">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Report
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impersonation" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" />
                Executive Impersonations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockImpersonations.map((imp) => (
                  <div key={imp.id} className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{imp.name}</div>
                        <div className="text-xs text-muted-foreground">{imp.platform} - {imp.followers.toLocaleString()} followers</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(imp.status)}
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brand" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-400" />
                Brand Abuse Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockBrandAbuse.map((abuse) => (
                  <div key={abuse.id} className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{abuse.type}</div>
                        <div className="text-xs text-muted-foreground">{abuse.platform} - Reach: {abuse.reach}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(abuse.status)}
                      <Button size="sm" variant="outline">
                        <Shield className="h-3 w-3 mr-1" />
                        Take Action
                      </Button>
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

export default DarkWebMonitoring;
