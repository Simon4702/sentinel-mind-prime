import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Package, 
  AlertTriangle, 
  Shield, 
  ExternalLink,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockVendors = [
  { id: "1", name: "Okta", type: "Identity Provider", riskScore: 25, status: "healthy", lastBreach: null, vulnerabilities: 0, integrations: 12, autoIsolate: true },
  { id: "2", name: "Salesforce", type: "CRM", riskScore: 35, status: "healthy", lastBreach: null, vulnerabilities: 2, integrations: 8, autoIsolate: true },
  { id: "3", name: "AWS", type: "Cloud Provider", riskScore: 18, status: "healthy", lastBreach: null, vulnerabilities: 1, integrations: 45, autoIsolate: false },
  { id: "4", name: "SolarWinds", type: "IT Management", riskScore: 92, status: "critical", lastBreach: "2020-12-13", vulnerabilities: 8, integrations: 3, autoIsolate: true },
  { id: "5", name: "GitHub", type: "Code Repository", riskScore: 28, status: "healthy", lastBreach: null, vulnerabilities: 1, integrations: 15, autoIsolate: true },
  { id: "6", name: "Zoom", type: "Communication", riskScore: 42, status: "monitoring", lastBreach: "2022-04-15", vulnerabilities: 3, integrations: 6, autoIsolate: true },
];

const mockBreachFeed = [
  { id: "1", vendor: "Generic Corp", severity: "critical", date: "2024-01-10", type: "Data Breach", affected: "2.3M records" },
  { id: "2", vendor: "Tech Solutions", severity: "high", date: "2024-01-08", type: "Ransomware", affected: "Service disruption" },
  { id: "3", vendor: "Cloud Services Inc", severity: "medium", date: "2024-01-05", type: "Vulnerability", affected: "CVE-2024-1234" },
];

const mockCVEs = [
  { id: "CVE-2024-1234", vendor: "AWS", severity: "high", description: "Remote code execution vulnerability", patchAvailable: true },
  { id: "CVE-2024-1235", vendor: "Salesforce", severity: "medium", description: "XSS vulnerability in admin console", patchAvailable: true },
  { id: "CVE-2024-1236", vendor: "Zoom", severity: "high", description: "Authentication bypass", patchAvailable: false },
];

const VendorCard = ({ vendor }: { vendor: typeof mockVendors[0] }) => {
  const [autoIsolate, setAutoIsolate] = useState(vendor.autoIsolate);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-emerald-500/20 text-emerald-400";
      case "monitoring": return "bg-yellow-500/20 text-yellow-400";
      case "critical": return "bg-red-500/20 text-red-400";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 75) return "text-red-400";
    if (score >= 50) return "text-yellow-400";
    return "text-emerald-400";
  };

  return (
    <Card className={`bg-card/50 ${vendor.status === "critical" ? "border-red-500/50" : "border-border/50"}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">{vendor.name}</div>
              <div className="text-sm text-muted-foreground">{vendor.type}</div>
            </div>
          </div>
          <Badge className={getStatusColor(vendor.status)}>{vendor.status}</Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Risk Score</span>
            <span className={`text-lg font-bold ${getRiskColor(vendor.riskScore)}`}>{vendor.riskScore}%</span>
          </div>
          <Progress value={vendor.riskScore} className="h-2" />

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-muted-foreground" />
              <span>{vendor.vulnerabilities} vulnerabilities</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3 text-muted-foreground" />
              <span>{vendor.integrations} integrations</span>
            </div>
          </div>

          {vendor.lastBreach && (
            <div className="text-xs text-red-400 flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              Last breach: {vendor.lastBreach}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border/30">
            <span className="text-sm">Auto-isolate on breach</span>
            <Switch checked={autoIsolate} onCheckedChange={setAutoIsolate} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const SupplyChainDefense = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVendors = mockVendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const scanVendors = () => {
    toast({
      title: "Vendor Scan Initiated",
      description: "Scanning all vendors for vulnerabilities and breach indicators.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6 text-orange-400" />
            Supply Chain Defense Hub
          </h2>
          <p className="text-muted-foreground">Monitor vendors, partners, and third-party integrations</p>
        </div>
        <Button onClick={scanVendors}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Scan All Vendors
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
              <div>
                <div className="text-2xl font-bold">{mockVendors.filter(v => v.status === "healthy").length}</div>
                <div className="text-sm text-muted-foreground">Healthy Vendors</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold">{mockVendors.filter(v => v.status === "monitoring").length}</div>
                <div className="text-sm text-muted-foreground">Under Monitoring</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-400" />
              <div>
                <div className="text-2xl font-bold">{mockVendors.filter(v => v.status === "critical").length}</div>
                <div className="text-sm text-muted-foreground">Critical Risk</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold">{mockVendors.reduce((acc, v) => acc + v.vulnerabilities, 0)}</div>
                <div className="text-sm text-muted-foreground">Total CVEs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendors List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search vendors..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </div>

        {/* Side Panels */}
        <div className="space-y-4">
          {/* Breach Feed */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                Live Breach Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {mockBreachFeed.map((breach) => (
                    <div key={breach.id} className="p-2 bg-card/50 rounded-lg border border-border/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{breach.vendor}</span>
                        <Badge variant={breach.severity === "critical" ? "destructive" : "secondary"} className="text-xs">
                          {breach.severity}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">{breach.type} - {breach.affected}</div>
                      <div className="text-xs text-muted-foreground">{breach.date}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* CVE Tracking */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-orange-400" />
                CVE Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px]">
                <div className="space-y-3">
                  {mockCVEs.map((cve) => (
                    <div key={cve.id} className="p-2 bg-card/50 rounded-lg border border-border/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs">{cve.id}</span>
                        <Badge variant={cve.severity === "high" ? "destructive" : "secondary"} className="text-xs">
                          {cve.severity}
                        </Badge>
                      </div>
                      <div className="text-xs">{cve.vendor}</div>
                      <div className="text-xs text-muted-foreground">{cve.description}</div>
                      <div className="mt-1">
                        {cve.patchAvailable ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">Patch Available</Badge>
                        ) : (
                          <Badge className="bg-red-500/20 text-red-400 text-xs">No Patch</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupplyChainDefense;
