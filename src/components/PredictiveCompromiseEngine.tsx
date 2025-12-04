import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Clock,
  Shield,
  Zap,
  BarChart3
} from "lucide-react";

const mockInsiderRisks = [
  { id: "1", name: "John Mitchell", department: "Finance", riskScore: 87, factors: ["Unusual access patterns", "After-hours activity spike", "High stress indicators"], predictedEvent: "Data exfiltration", probability: 73, daysUntil: 14 },
  { id: "2", name: "Sarah Chen", department: "Engineering", riskScore: 62, factors: ["Behavior drift detected", "Increased file downloads"], predictedEvent: "Policy violation", probability: 45, daysUntil: 30 },
  { id: "3", name: "Mike Rodriguez", department: "Sales", riskScore: 45, factors: ["New employee", "Phishing test failed"], predictedEvent: "Phishing victim", probability: 68, daysUntil: 7 },
];

const mockDepartmentRisks = [
  { department: "Finance", riskScore: 78, vulnerabilities: 12, predictedIncidents: 3, trend: "up" },
  { department: "Engineering", riskScore: 65, vulnerabilities: 8, predictedIncidents: 2, trend: "stable" },
  { department: "HR", riskScore: 54, vulnerabilities: 5, predictedIncidents: 1, trend: "down" },
  { department: "Sales", riskScore: 71, vulnerabilities: 9, predictedIncidents: 2, trend: "up" },
  { department: "Marketing", riskScore: 42, vulnerabilities: 3, predictedIncidents: 0, trend: "down" },
];

const mockPhishingPredictions = [
  { id: "1", name: "Emily Watson", susceptibility: 89, lastTraining: "6 months ago", behaviorDrift: 34, recommendedAction: "Immediate training" },
  { id: "2", name: "Tom Anderson", susceptibility: 76, lastTraining: "3 months ago", behaviorDrift: 22, recommendedAction: "Refresher course" },
  { id: "3", name: "Lisa Park", susceptibility: 65, lastTraining: "1 month ago", behaviorDrift: 45, recommendedAction: "Monitor closely" },
];

const RiskGauge = ({ value, label }: { value: number; label: string }) => {
  const getColor = (v: number) => {
    if (v >= 75) return "text-red-400";
    if (v >= 50) return "text-yellow-400";
    return "text-emerald-400";
  };

  return (
    <div className="text-center">
      <div className={`text-4xl font-bold ${getColor(value)}`}>{value}%</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
};

export const PredictiveCompromiseEngine = () => {
  const [analyzing, setAnalyzing] = useState(false);

  const runPrediction = () => {
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-400" />
            Predictive Compromise Engine
          </h2>
          <p className="text-muted-foreground">AI-powered breach prediction before it happens</p>
        </div>
        <Button onClick={runPrediction} disabled={analyzing}>
          {analyzing ? (
            <>
              <Activity className="h-4 w-4 mr-2 animate-pulse" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Run Prediction
            </>
          )}
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-6">
            <RiskGauge value={73} label="Breach Probability (30 days)" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
          <CardContent className="p-6">
            <RiskGauge value={45} label="Insider Threat Index" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-6">
            <RiskGauge value={58} label="Phishing Vulnerability" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-6">
            <RiskGauge value={82} label="Model Confidence" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insider">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insider">Insider Threats</TabsTrigger>
          <TabsTrigger value="departments">Department Risk</TabsTrigger>
          <TabsTrigger value="phishing">Phishing Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="insider" className="mt-4 space-y-4">
          {mockInsiderRisks.map((user) => (
            <Card key={user.id} className="bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="font-semibold text-lg">{user.name}</div>
                      <Badge variant="outline">{user.department}</Badge>
                      <Badge className={user.riskScore >= 70 ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}>
                        Risk: {user.riskScore}%
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {user.factors.map((factor, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{factor}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>Predicted: <span className="font-medium text-foreground">{user.predictedEvent}</span></span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Within: <span className="font-medium text-foreground">{user.daysUntil} days</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-red-400">{user.probability}%</div>
                    <div className="text-xs text-muted-foreground">Probability</div>
                    <Button size="sm" variant="outline" className="mt-2">
                      <Shield className="h-3 w-3 mr-1" />
                      Mitigate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="departments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Department Risk Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDepartmentRisks.map((dept) => (
                  <div key={dept.department} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium w-24">{dept.department}</span>
                        <Badge variant="outline">{dept.vulnerabilities} vulnerabilities</Badge>
                        <Badge variant="secondary">{dept.predictedIncidents} predicted incidents</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className={`h-4 w-4 ${dept.trend === "up" ? "text-red-400" : dept.trend === "down" ? "text-emerald-400" : "text-yellow-400"}`} />
                        <span className="font-bold">{dept.riskScore}%</span>
                      </div>
                    </div>
                    <Progress value={dept.riskScore} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phishing" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                Predicted Phishing Victims
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPhishingPredictions.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">Last training: {user.lastTraining}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-400">{user.susceptibility}%</div>
                        <div className="text-xs text-muted-foreground">Susceptibility</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-400">{user.behaviorDrift}%</div>
                        <div className="text-xs text-muted-foreground">Behavior Drift</div>
                      </div>
                      <Badge className="bg-yellow-500/20 text-yellow-400">{user.recommendedAction}</Badge>
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

export default PredictiveCompromiseEngine;
