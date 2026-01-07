import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Brain, 
  Clock, 
  AlertTriangle,
  Laptop,
  Battery,
  Gauge,
  TrendingUp,
  TrendingDown,
  User,
  Fingerprint,
  ScanFace,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import BiometricAuthPanel from "@/components/BiometricAuthPanel";

const mockUserBiometrics = [
  { 
    id: "1", 
    name: "John Mitchell", 
    department: "Finance",
    fatigue: 78,
    deviceSwitching: 45,
    workload: 92,
    stressIndicators: 65,
    typingPaceChange: -15,
    errorRate: 23,
    riskLevel: "high",
    trend: "up"
  },
  { 
    id: "2", 
    name: "Sarah Chen", 
    department: "Engineering",
    fatigue: 45,
    deviceSwitching: 62,
    workload: 68,
    stressIndicators: 35,
    typingPaceChange: -5,
    errorRate: 8,
    riskLevel: "medium",
    trend: "stable"
  },
  { 
    id: "3", 
    name: "Mike Rodriguez", 
    department: "Sales",
    fatigue: 82,
    deviceSwitching: 78,
    workload: 95,
    stressIndicators: 72,
    typingPaceChange: -22,
    errorRate: 31,
    riskLevel: "critical",
    trend: "up"
  },
  { 
    id: "4", 
    name: "Emily Watson", 
    department: "Marketing",
    fatigue: 25,
    deviceSwitching: 30,
    workload: 45,
    stressIndicators: 20,
    typingPaceChange: 5,
    errorRate: 3,
    riskLevel: "low",
    trend: "down"
  },
];

const BiometricCard = ({ user }: { user: typeof mockUserBiometrics[0] }) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical": return "bg-red-500/20 text-red-400 border-red-500/50";
      case "high": return "bg-orange-500/20 text-orange-400 border-orange-500/50";
      case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      case "low": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/50";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getProgressColor = (value: number) => {
    if (value >= 75) return "bg-red-500";
    if (value >= 50) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  return (
    <Card className="bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/20">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold">{user.name}</div>
              <div className="text-sm text-muted-foreground">{user.department}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user.trend === "up" && <TrendingUp className="h-4 w-4 text-red-400" />}
            {user.trend === "down" && <TrendingDown className="h-4 w-4 text-emerald-400" />}
            {user.trend === "stable" && <Activity className="h-4 w-4 text-yellow-400" />}
            <Badge className={getRiskColor(user.riskLevel)}>{user.riskLevel} risk</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Battery className="h-3 w-3" /> Fatigue
              </span>
              <span>{user.fatigue}%</span>
            </div>
            <Progress value={user.fatigue} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Laptop className="h-3 w-3" /> Device Switch
              </span>
              <span>{user.deviceSwitching}%</span>
            </div>
            <Progress value={user.deviceSwitching} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Gauge className="h-3 w-3" /> Workload
              </span>
              <span>{user.workload}%</span>
            </div>
            <Progress value={user.workload} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Brain className="h-3 w-3" /> Stress
              </span>
              <span>{user.stressIndicators}%</span>
            </div>
            <Progress value={user.stressIndicators} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border/30">
          <div className="text-center">
            <div className={`text-lg font-bold ${user.typingPaceChange < 0 ? "text-red-400" : "text-emerald-400"}`}>
              {user.typingPaceChange > 0 ? "+" : ""}{user.typingPaceChange}%
            </div>
            <div className="text-xs text-muted-foreground">Typing Pace Change</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${user.errorRate > 15 ? "text-red-400" : user.errorRate > 10 ? "text-yellow-400" : "text-emerald-400"}`}>
              {user.errorRate}%
            </div>
            <div className="text-xs text-muted-foreground">Error Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const HumanRiskBiometrics = () => {
  const { user, profile } = useAuth();
  const highRiskUsers = mockUserBiometrics.filter(u => u.riskLevel === "critical" || u.riskLevel === "high").length;
  const avgFatigue = Math.round(mockUserBiometrics.reduce((acc, u) => acc + u.fatigue, 0) / mockUserBiometrics.length);
  const avgWorkload = Math.round(mockUserBiometrics.reduce((acc, u) => acc + u.workload, 0) / mockUserBiometrics.length);
  const avgStress = Math.round(mockUserBiometrics.reduce((acc, u) => acc + u.stressIndicators, 0) / mockUserBiometrics.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6 text-pink-400" />
          Human Risk Biometrics
        </h2>
        <p className="text-muted-foreground">Ethical, non-invasive human factor analysis & biometric authentication</p>
      </div>

      <Tabs defaultValue="auth" className="space-y-4">
        <TabsList>
          <TabsTrigger value="auth" className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4" />
            Biometric Auth
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Risk Analytics
          </TabsTrigger>
        </TabsList>

        {/* Biometric Authentication Tab */}
        <TabsContent value="auth" className="space-y-4">
          {user ? (
            <BiometricAuthPanel
              userId={user.id}
              userEmail={user.email || ""}
              mode="settings"
            />
          ) : (
            <Card className="border-border/50">
              <CardContent className="p-6 text-center">
                <ShieldCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Please sign in to configure biometric authentication
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Risk Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">

      {/* Privacy Notice */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-sm">Privacy & Ethics Notice</div>
              <p className="text-xs text-muted-foreground mt-1">
                All biometric analysis is performed on aggregate behavioral patterns only. No keystrokes, screen content, or personal communications are captured. 
                This feature complies with GDPR, CCPA, and workplace privacy regulations. Users can opt-out at any time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <div>
                <div className="text-2xl font-bold">{highRiskUsers}</div>
                <div className="text-sm text-muted-foreground">High Risk Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Battery className="h-8 w-8 text-orange-400" />
              <div>
                <div className="text-2xl font-bold">{avgFatigue}%</div>
                <div className="text-sm text-muted-foreground">Avg Fatigue Level</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Gauge className="h-8 w-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold">{avgWorkload}%</div>
                <div className="text-sm text-muted-foreground">Avg Workload</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border-pink-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-pink-400" />
              <div>
                <div className="text-2xl font-bold">{avgStress}%</div>
                <div className="text-sm text-muted-foreground">Avg Stress Index</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Biometrics */}
      <div>
        <h3 className="text-lg font-semibold mb-4">User Risk Profiles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockUserBiometrics.map((user) => (
            <BiometricCard key={user.id} user={user} />
          ))}
        </div>
      </div>

      {/* Metrics Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Biometric Indicators Explained</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-card/50 rounded-lg">
              <div className="font-medium flex items-center gap-2 mb-1">
                <Battery className="h-4 w-4 text-orange-400" /> Fatigue Level
              </div>
              <p className="text-muted-foreground text-xs">
                Based on login time patterns, break frequency, and activity continuity.
              </p>
            </div>
            <div className="p-3 bg-card/50 rounded-lg">
              <div className="font-medium flex items-center gap-2 mb-1">
                <Laptop className="h-4 w-4 text-blue-400" /> Device Switching
              </div>
              <p className="text-muted-foreground text-xs">
                Frequency of switching between devices and applications.
              </p>
            </div>
            <div className="p-3 bg-card/50 rounded-lg">
              <div className="font-medium flex items-center gap-2 mb-1">
                <Gauge className="h-4 w-4 text-yellow-400" /> Workload
              </div>
              <p className="text-muted-foreground text-xs">
                Derived from ticket count, meetings, and hours logged.
              </p>
            </div>
            <div className="p-3 bg-card/50 rounded-lg">
              <div className="font-medium flex items-center gap-2 mb-1">
                <Brain className="h-4 w-4 text-pink-400" /> Stress Indicators
              </div>
              <p className="text-muted-foreground text-xs">
                Composite score from typing patterns, error rates, and activity spikes.
              </p>
            </div>
            <div className="p-3 bg-card/50 rounded-lg">
              <div className="font-medium flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-purple-400" /> Typing Pace
              </div>
              <p className="text-muted-foreground text-xs">
                Change in typing speed compared to user's baseline.
              </p>
            </div>
            <div className="p-3 bg-card/50 rounded-lg">
              <div className="font-medium flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-red-400" /> Error Rate
              </div>
              <p className="text-muted-foreground text-xs">
                Frequency of corrections, backspaces, and form resubmissions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HumanRiskBiometrics;
