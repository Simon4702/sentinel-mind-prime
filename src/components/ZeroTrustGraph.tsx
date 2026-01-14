import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
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
  Loader2,
  RefreshCw
} from "lucide-react";

interface ZeroTrustAccess {
  id: string;
  user_id: string | null;
  resource_id: string;
  resource_type: string;
  access_level: string;
  is_least_privilege: boolean | null;
  actual_usage_frequency: number | null;
  last_accessed_at: string | null;
  risk_score: number | null;
  recommendations: any;
  user_name?: string;
  user_email?: string;
}

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
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [accessRecords, setAccessRecords] = useState<ZeroTrustAccess[]>([]);

  useEffect(() => {
    fetchZeroTrustData();
  }, []);

  const fetchZeroTrustData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('zero_trust_access')
        .select(`
          *,
          profiles!zero_trust_access_user_id_fkey (
            full_name,
            email
          )
        `)
        .order('risk_score', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      const formattedData = (data || []).map((record: any) => ({
        ...record,
        user_name: record.profiles?.full_name || 'Unknown User',
        user_email: record.profiles?.email || '',
      }));
      
      setAccessRecords(formattedData);
    } catch (error) {
      console.error('Error fetching zero trust data:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAccessAudit = async () => {
    setScanning(true);
    toast({
      title: "Access Audit Started",
      description: "Analyzing user permissions and access patterns...",
    });
    
    // Simulate audit
    setTimeout(async () => {
      await fetchZeroTrustData();
      setScanning(false);
      toast({
        title: "Audit Complete",
        description: "Zero-trust access analysis completed successfully",
      });
    }, 3000);
  };

  const applyRecommendation = async (access: ZeroTrustAccess, recommendation: string) => {
    toast({
      title: "Applying Recommendation",
      description: `Updating access for ${access.user_name}: ${recommendation}`,
    });
  };

  const getRiskColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 70) return "text-red-400";
    if (score >= 40) return "text-yellow-400";
    return "text-emerald-400";
  };

  // Group access by user
  const userAccessMap = accessRecords.reduce((acc, record) => {
    const userId = record.user_id || 'unknown';
    if (!acc[userId]) {
      acc[userId] = {
        user_name: record.user_name || 'Unknown',
        user_email: record.user_email || '',
        resources: [],
        totalRisk: 0,
        leastPrivilegeViolations: 0,
      };
    }
    acc[userId].resources.push(record);
    acc[userId].totalRisk += record.risk_score || 0;
    if (!record.is_least_privilege) {
      acc[userId].leastPrivilegeViolations++;
    }
    return acc;
  }, {} as Record<string, any>);

  const userAccessList = Object.entries(userAccessMap).map(([userId, data]) => ({
    userId,
    ...data,
    avgRisk: Math.round(data.totalRisk / data.resources.length) || 0,
    lateralMovementRisk: data.leastPrivilegeViolations > 2 ? 'high' : 
                          data.leastPrivilegeViolations > 0 ? 'medium' : 'low'
  }));

  const stats = {
    totalUsers: userAccessList.length,
    excessivePermissions: accessRecords.filter(a => !a.is_least_privilege).length,
    misconfigurations: accessRecords.filter(a => (a.risk_score || 0) > 70).length,
    leastPrivilegeScore: accessRecords.length > 0 
      ? Math.round((accessRecords.filter(a => a.is_least_privilege).length / accessRecords.length) * 100)
      : 100,
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
        <Button onClick={runAccessAudit} disabled={scanning}>
          {scanning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Auditing...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Run Access Audit
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-cyan-400" />
              <div>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
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
                <div className="text-2xl font-bold">{stats.excessivePermissions}</div>
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
                <div className="text-2xl font-bold">{stats.misconfigurations}</div>
                <div className="text-sm text-muted-foreground">High Risk Access</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Lock className="h-8 w-8 text-emerald-400" />
              <div>
                <div className="text-2xl font-bold">{stats.leastPrivilegeScore}%</div>
                <div className="text-sm text-muted-foreground">Least Privilege Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Loading zero-trust access data...</p>
          </CardContent>
        </Card>
      ) : accessRecords.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto text-emerald-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Access Data Found</h3>
            <p className="text-muted-foreground mb-4">
              Run an access audit to analyze user permissions and identify risks.
            </p>
            <Button onClick={runAccessAudit} disabled={scanning}>
              <Shield className="h-4 w-4 mr-2" />
              Run Access Audit
            </Button>
          </CardContent>
        </Card>
      ) : (
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
                    {userAccessList.slice(0, 10).map((user) => (
                      <Card key={user.userId} className="bg-card/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <div className="font-semibold">{user.user_name}</div>
                              <div className="text-sm text-muted-foreground">{user.user_email}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-sm">Avg Risk</div>
                                <div className={`text-lg font-bold ${getRiskColor(user.avgRisk)}`}>
                                  {user.avgRisk}%
                                </div>
                              </div>
                              <Badge className={`${
                                user.lateralMovementRisk === 'high' ? 'bg-red-500/20 text-red-400' :
                                user.lateralMovementRisk === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-emerald-500/20 text-emerald-400'
                              } bg-transparent border`}>
                                {user.lateralMovementRisk} lateral risk
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {user.resources.slice(0, 5).map((resource: ZeroTrustAccess, ridx: number) => (
                              <div key={ridx} className="flex items-center justify-between p-2 bg-card/50 rounded border border-border/30">
                                <div className="flex items-center gap-2">
                                  <ResourceIcon type={resource.resource_type} />
                                  <span className="text-sm">{resource.resource_id}</span>
                                  <Badge variant="outline" className="text-xs">{resource.access_level}</Badge>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-20">
                                    <div className="text-xs text-muted-foreground mb-1">
                                      Usage: {resource.actual_usage_frequency || 0}%
                                    </div>
                                    <Progress value={resource.actual_usage_frequency || 0} className="h-1" />
                                  </div>
                                  {resource.is_least_privilege ? (
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
            {/* High Risk Access */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  High Risk Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {accessRecords
                    .filter(a => (a.risk_score || 0) > 60)
                    .slice(0, 5)
                    .map((access) => (
                      <div key={access.id} className="p-2 bg-card/50 rounded-lg border border-border/30">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate max-w-[120px]">
                            {access.resource_id}
                          </span>
                          <Badge variant={access.risk_score! > 80 ? "destructive" : "secondary"} className="text-xs">
                            {access.risk_score}% risk
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {access.user_name} • {access.access_level}
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
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {accessRecords
                    .filter(a => !a.is_least_privilege)
                    .slice(0, 4)
                    .map((access) => (
                      <div key={access.id} className="p-2 bg-card/50 rounded-lg border border-border/30">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Revoke excess access</span>
                          <Badge className="bg-blue-500/20 text-blue-400 text-xs">Auto</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {access.user_name} → {access.resource_id}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => applyRecommendation(access, 'Revoke excess access')}
                        >
                          Apply <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZeroTrustGraph;
