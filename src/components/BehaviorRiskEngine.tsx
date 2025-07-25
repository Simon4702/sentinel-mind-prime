import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Target, 
  Activity,
  Eye,
  Zap,
  BarChart3,
  Clock,
  MapPin,
  Monitor,
  Wifi,
  MousePointer,
  Keyboard,
  FileText,
  Lock,
  Unlock,
  ChevronDown,
  RefreshCw
} from "lucide-react";

// Simulated behavioral data
const generateBehaviorData = () => ({
  users: [
    {
      id: "usr_001",
      name: "Sarah Chen",
      department: "Marketing",
      riskScore: 15,
      riskLevel: "LOW",
      anomalies: 2,
      lastActivity: "2 minutes ago",
      behaviors: {
        loginPattern: { score: 95, status: "normal", trend: "stable" },
        fileAccess: { score: 92, status: "normal", trend: "up" },
        networkUsage: { score: 88, status: "normal", trend: "stable" },
        keystrokePattern: { score: 96, status: "normal", trend: "stable" },
        mouseMovement: { score: 94, status: "normal", trend: "down" }
      },
      locations: ["San Francisco, CA", "Remote VPN"],
      devices: ["MacBook Pro", "iPhone 14"]
    },
    {
      id: "usr_002", 
      name: "Mike Rodriguez",
      department: "Finance",
      riskScore: 67,
      riskLevel: "MEDIUM",
      anomalies: 7,
      lastActivity: "5 minutes ago",
      behaviors: {
        loginPattern: { score: 78, status: "unusual", trend: "down" },
        fileAccess: { score: 45, status: "anomaly", trend: "down" },
        networkUsage: { score: 82, status: "normal", trend: "stable" },
        keystrokePattern: { score: 91, status: "normal", trend: "stable" },
        mouseMovement: { score: 73, status: "unusual", trend: "down" }
      },
      locations: ["New York, NY", "Unknown IP"],
      devices: ["Windows Laptop", "Android Phone", "Unknown Device"]
    },
    {
      id: "usr_003",
      name: "Alex Thompson", 
      department: "IT",
      riskScore: 89,
      riskLevel: "HIGH",
      anomalies: 12,
      lastActivity: "1 minute ago",
      behaviors: {
        loginPattern: { score: 35, status: "critical", trend: "down" },
        fileAccess: { score: 28, status: "critical", trend: "down" },
        networkUsage: { score: 42, status: "anomaly", trend: "down" },
        keystrokePattern: { score: 31, status: "critical", trend: "down" },
        mouseMovement: { score: 39, status: "anomaly", trend: "down" }
      },
      locations: ["Austin, TX", "Foreign IP", "Tor Network"],
      devices: ["Linux Machine", "Unknown Device", "VM Instance"]
    }
  ],
  globalMetrics: {
    totalUsers: 1247,
    activeUsers: 892,
    anomaliesDetected: 34,
    criticalAlerts: 3,
    avgRiskScore: 32,
    behavioralBaseline: 94
  }
});

const BehaviorAnalysisCard = ({ user }: { user: any }) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "LOW": return "success";
      case "MEDIUM": return "warning"; 
      case "HIGH": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal": return "success";
      case "unusual": return "warning";
      case "anomaly": return "destructive";
      case "critical": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{user.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {user.department}
            </CardDescription>
          </div>
          <Badge variant="outline" className={`border-${getRiskColor(user.riskLevel)}/20 text-${getRiskColor(user.riskLevel)}`}>
            Risk: {user.riskLevel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Risk Score</span>
          <span className="text-2xl font-bold">{user.riskScore}/100</span>
        </div>
        <Progress value={user.riskScore} className="h-2" />
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span>{user.anomalies} anomalies</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{user.lastActivity}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Behavioral Patterns</h4>
          {Object.entries(user.behaviors).map(([key, behavior]: [string, any]) => (
            <div key={key} className="flex items-center justify-between p-2 rounded bg-muted/30">
              <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <Badge variant="outline" className={`border-${getStatusColor(behavior.status)}/20 text-${getStatusColor(behavior.status)}`}>
                {behavior.score}% 
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const AnomalyDetectionPanel = () => {
  const [realTimeData, setRealTimeData] = useState(generateBehaviorData());
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const runAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setRealTimeData(generateBehaviorData());
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Behavioral Risk Analysis
        </h2>
        <Button onClick={runAnalysis} disabled={isAnalyzing} className="shadow-cyber">
          <RefreshCw className={`mr-2 h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Refresh Analysis'}
        </Button>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{realTimeData.globalMetrics.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardContent className="pt-6">
            <div className="text-center">
              <Activity className="h-8 w-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold">{realTimeData.globalMetrics.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Active Now</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardContent className="pt-6">
            <div className="text-center">
              <Eye className="h-8 w-8 text-warning mx-auto mb-2" />
              <div className="text-2xl font-bold">{realTimeData.globalMetrics.anomaliesDetected}</div>
              <p className="text-xs text-muted-foreground">Anomalies</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <div className="text-2xl font-bold">{realTimeData.globalMetrics.criticalAlerts}</div>
              <p className="text-xs text-muted-foreground">Critical</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardContent className="pt-6">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold">{realTimeData.globalMetrics.avgRiskScore}%</div>
              <p className="text-xs text-muted-foreground">Avg Risk</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
          <CardContent className="pt-6">
            <div className="text-center">
              <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{realTimeData.globalMetrics.behavioralBaseline}%</div>
              <p className="text-xs text-muted-foreground">Baseline</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {realTimeData.users.map((user) => (
          <BehaviorAnalysisCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
};

const MLModelStatus = () => {
  const models = [
    { name: "Anomaly Detection", status: "active", accuracy: 97.8, type: "Isolation Forest" },
    { name: "Risk Scoring", status: "active", accuracy: 94.2, type: "XGBoost" },
    { name: "Pattern Recognition", status: "training", accuracy: 91.5, type: "Neural Network" },
    { name: "Behavioral Clustering", status: "active", accuracy: 89.3, type: "K-Means" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
        ML Model Performance
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models.map((model, index) => (
          <Card key={index} className="border-primary/20 bg-gradient-cyber shadow-elegant">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{model.name}</CardTitle>
                <Badge variant="outline" className={`border-${model.status === 'active' ? 'success' : 'warning'}/20 text-${model.status === 'active' ? 'success' : 'warning'}`}>
                  {model.status}
                </Badge>
              </div>
              <CardDescription>{model.type}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Accuracy</span>
                  <span className="text-lg font-bold">{model.accuracy}%</span>
                </div>
                <Progress value={model.accuracy} className="h-2" />
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Brain className="h-4 w-4" />
                    <span>Neural</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    <span>Real-time</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const BehaviorRiskEngine = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <Tabs defaultValue="analysis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card border-primary/20">
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Real-time Analysis
            </TabsTrigger>
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              ML Models
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Behavior Patterns
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis">
            <AnomalyDetectionPanel />
          </TabsContent>

          <TabsContent value="models">
            <MLModelStatus />
          </TabsContent>

          <TabsContent value="patterns">
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Advanced Pattern Analysis</h3>
              <p className="text-muted-foreground">Deep behavioral pattern recognition and clustering algorithms</p>
              <Button variant="outline" className="mt-4">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Pattern Details
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};