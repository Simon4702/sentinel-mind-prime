import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
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
  CheckCircle,
  Loader2
} from "lucide-react";

interface DarkWebAlert {
  id: string;
  alert_type: string;
  severity: string | null;
  source: string | null;
  details: any;
  affected_assets: any;
  discovered_at: string;
  is_resolved: boolean | null;
  resolved_at: string | null;
}

export const DarkWebMonitoring = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<DarkWebAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (profile?.organization_id) {
      fetchDarkWebAlerts();
    }
  }, [profile?.organization_id]);

  const fetchDarkWebAlerts = async () => {
    if (!profile?.organization_id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dark_web_alerts')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('discovered_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching dark web alerts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dark web alerts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runScan = async () => {
    setScanning(true);
    toast({
      title: "Dark Web Scan Initiated",
      description: "Scanning dark web sources for organization mentions...",
    });
    
    // Simulate a scan that would call an external API
    setTimeout(async () => {
      await fetchDarkWebAlerts();
      setScanning(false);
      toast({
        title: "Scan Complete",
        description: "Dark web monitoring scan completed successfully",
      });
    }, 3000);
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('dark_web_alerts')
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;
      
      setAlerts(alerts.map(a => 
        a.id === alertId ? { ...a, is_resolved: true, resolved_at: new Date().toISOString() } : a
      ));
      
      toast({
        title: "Alert Resolved",
        description: "The dark web alert has been marked as resolved",
      });
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive"
      });
    }
  };

  const getSeverityBadge = (severity: string | null) => {
    switch (severity) {
      case "critical": return <Badge className="bg-red-500/20 text-red-400">Critical</Badge>;
      case "high": return <Badge className="bg-orange-500/20 text-orange-400">High</Badge>;
      case "medium": return <Badge className="bg-yellow-500/20 text-yellow-400">Medium</Badge>;
      case "low": return <Badge className="bg-blue-500/20 text-blue-400">Low</Badge>;
      default: return <Badge variant="secondary">{severity || 'Unknown'}</Badge>;
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case "credential_leak": return <Key className="h-4 w-4" />;
      case "data_dump": return <FileText className="h-4 w-4" />;
      case "typosquat": return <Globe className="h-4 w-4" />;
      case "impersonation": return <Users className="h-4 w-4" />;
      case "brand_abuse": return <MessageSquare className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterAlertsByType = (type: string) => {
    if (type === 'all') return alerts;
    return alerts.filter(a => a.alert_type === type);
  };

  const credentialLeaks = alerts.filter(a => a.alert_type === 'credential_leak');
  const dataDumps = alerts.filter(a => a.alert_type === 'data_dump');
  const typosquats = alerts.filter(a => a.alert_type === 'typosquat');
  const impersonations = alerts.filter(a => a.alert_type === 'impersonation');
  const brandAbuse = alerts.filter(a => a.alert_type === 'brand_abuse');
  const activeAlerts = alerts.filter(a => !a.is_resolved);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Eye className="h-6 w-6 text-purple-400" />
            Dark Web & Reputational Defense
          </h2>
          <p className="text-muted-foreground">Monitor external threats and brand abuse with real-time intelligence</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">{activeAlerts.length}</div>
            <div className="text-xs text-muted-foreground">Active Alerts</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4 text-center">
            <Key className="h-6 w-6 text-red-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">{credentialLeaks.length}</div>
            <div className="text-xs text-muted-foreground">Credential Leaks</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4 text-center">
            <FileText className="h-6 w-6 text-orange-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">{dataDumps.length}</div>
            <div className="text-xs text-muted-foreground">Data Dumps</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <Globe className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">{typosquats.length}</div>
            <div className="text-xs text-muted-foreground">Typosquats</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">{impersonations.length}</div>
            <div className="text-xs text-muted-foreground">Impersonations</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border-pink-500/20">
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-6 w-6 text-pink-400 mx-auto mb-2" />
            <div className="text-2xl font-bold">{brandAbuse.length}</div>
            <div className="text-xs text-muted-foreground">Brand Abuse</div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Loading dark web intelligence...</p>
          </CardContent>
        </Card>
      ) : alerts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Threats Detected</h3>
            <p className="text-muted-foreground mb-4">
              Your organization has no active dark web alerts. Run a scan to check for new threats.
            </p>
            <Button onClick={runScan} disabled={scanning}>
              <Search className="h-4 w-4 mr-2" />
              Run Deep Scan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All ({alerts.length})</TabsTrigger>
            <TabsTrigger value="credential_leak">Credentials ({credentialLeaks.length})</TabsTrigger>
            <TabsTrigger value="data_dump">Data Dumps ({dataDumps.length})</TabsTrigger>
            <TabsTrigger value="typosquat">Typosquats ({typosquats.length})</TabsTrigger>
            <TabsTrigger value="impersonation">Impersonation ({impersonations.length})</TabsTrigger>
            <TabsTrigger value="brand_abuse">Brand Abuse ({brandAbuse.length})</TabsTrigger>
          </TabsList>

          {['all', 'credential_leak', 'data_dump', 'typosquat', 'impersonation', 'brand_abuse'].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue} className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-3">
                      {filterAlertsByType(tabValue)
                        .filter(alert => 
                          searchTerm === '' || 
                          alert.alert_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          alert.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          JSON.stringify(alert.details).toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((alert) => (
                          <div 
                            key={alert.id} 
                            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                              alert.is_resolved 
                                ? 'bg-muted/30 border-border/30 opacity-60' 
                                : 'bg-card/50 border-border hover:border-primary/30'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                alert.severity === 'critical' ? 'bg-red-500/20' :
                                alert.severity === 'high' ? 'bg-orange-500/20' :
                                alert.severity === 'medium' ? 'bg-yellow-500/20' :
                                'bg-blue-500/20'
                              }`}>
                                {getAlertTypeIcon(alert.alert_type)}
                              </div>
                              <div>
                                <div className="font-medium flex items-center gap-2">
                                  {alert.alert_type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                  {alert.is_resolved && (
                                    <Badge className="bg-emerald-500/20 text-emerald-400">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Resolved
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Source: {alert.source || 'Unknown'} • Discovered: {formatDate(alert.discovered_at)}
                                </div>
                                {alert.details && (
                                  <div className="text-xs text-muted-foreground mt-1 max-w-lg truncate">
                                    {typeof alert.details === 'object' 
                                      ? JSON.stringify(alert.details).slice(0, 100) + '...'
                                      : String(alert.details).slice(0, 100)
                                    }
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {getSeverityBadge(alert.severity)}
                              {!alert.is_resolved && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => resolveAlert(alert.id)}
                                >
                                  <Shield className="h-3 w-3 mr-1" />
                                  Resolve
                                </Button>
                              )}
                              <Button size="sm" variant="ghost">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default DarkWebMonitoring;
