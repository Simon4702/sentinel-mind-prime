import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Target, 
  Play, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Lock,
  Mail,
  Key,
  Network,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const attackTypes = [
  { id: "phishing", name: "Phishing Campaign", icon: Mail, description: "Simulated phishing emails", enabled: true },
  { id: "password_spray", name: "Password Spraying", icon: Key, description: "Test password policies", enabled: true },
  { id: "lateral_movement", name: "Lateral Movement", icon: Network, description: "Network traversal tests", enabled: false },
  { id: "privilege_escalation", name: "Privilege Escalation", icon: TrendingUp, description: "Permission boundary tests", enabled: true },
];

const mockTestResults = [
  { 
    id: "1", 
    name: "Q4 Security Assessment", 
    date: "Jan 10, 2024",
    status: "completed",
    postureScore: 72,
    vulnerabilities: 15,
    tests: [
      { type: "Phishing", passed: false, findings: "23% click rate" },
      { type: "Password Spray", passed: true, findings: "No weak passwords found" },
      { type: "Privilege Escalation", passed: false, findings: "3 escalation paths" },
    ]
  },
  { 
    id: "2", 
    name: "Monthly Phishing Drill", 
    date: "Jan 5, 2024",
    status: "completed",
    postureScore: 85,
    vulnerabilities: 5,
    tests: [
      { type: "Phishing", passed: true, findings: "8% click rate (improved)" },
    ]
  },
  { 
    id: "3", 
    name: "Network Penetration Test", 
    date: "Running...",
    status: "running",
    progress: 67,
    postureScore: null,
    vulnerabilities: 8,
    tests: [
      { type: "Lateral Movement", passed: null, findings: "In progress..." },
      { type: "Privilege Escalation", passed: null, findings: "In progress..." },
    ]
  },
];

export const RedTeamAutomation = () => {
  const { toast } = useToast();
  const [selectedAttacks, setSelectedAttacks] = useState<string[]>(["phishing", "password_spray", "privilege_escalation"]);
  const [running, setRunning] = useState(false);

  const toggleAttack = (id: string) => {
    setSelectedAttacks(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const launchTest = () => {
    if (selectedAttacks.length === 0) {
      toast({ title: "Select Tests", description: "Please select at least one test type.", variant: "destructive" });
      return;
    }
    setRunning(true);
    toast({
      title: "Red Team Test Launched",
      description: `Running ${selectedAttacks.length} automated attack simulations...`,
    });
    setTimeout(() => setRunning(false), 3000);
  };

  const getPostureColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-red-400" />
            Red Team Automation Suite
          </h2>
          <p className="text-muted-foreground">Automated offensive security testing</p>
        </div>
      </div>

      {/* Cyber Posture Scorecard */}
      <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            Cyber Posture Scorecard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-emerald-400">72</div>
              <div className="text-sm text-muted-foreground mt-1">Overall Score</div>
              <Progress value={72} className="h-2 mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">15</div>
              <div className="text-sm text-muted-foreground mt-1">Vulnerabilities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">23</div>
              <div className="text-sm text-muted-foreground mt-1">Tests Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">87%</div>
              <div className="text-sm text-muted-foreground mt-1">Issues Remediated</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attack Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Launch New Test
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {attackTypes.map((attack) => {
              const Icon = attack.icon;
              return (
                <div 
                  key={attack.id} 
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedAttacks.includes(attack.id) 
                      ? "bg-primary/10 border-primary/50" 
                      : "bg-card/50 border-border/50 hover:border-border"
                  }`}
                  onClick={() => toggleAttack(attack.id)}
                >
                  <Checkbox checked={selectedAttacks.includes(attack.id)} />
                  <div className="p-2 rounded-lg bg-card">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{attack.name}</div>
                    <div className="text-xs text-muted-foreground">{attack.description}</div>
                  </div>
                </div>
              );
            })}
            <Button className="w-full" onClick={launchTest} disabled={running}>
              {running ? (
                <>
                  <Play className="h-4 w-4 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Launch Attack Simulation
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Test Results */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {mockTestResults.map((test) => (
                    <Card key={test.id} className="bg-card/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-semibold">{test.name}</div>
                            <div className="text-sm text-muted-foreground">{test.date}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            {test.status === "completed" ? (
                              <Badge className="bg-emerald-500/20 text-emerald-400">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-500/20 text-blue-400 animate-pulse">
                                <Clock className="h-3 w-3 mr-1" />
                                Running
                              </Badge>
                            )}
                            {test.postureScore !== null && (
                              <div className={`text-2xl font-bold ${getPostureColor(test.postureScore)}`}>
                                {test.postureScore}
                              </div>
                            )}
                          </div>
                        </div>

                        {test.status === "running" && test.progress && (
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{test.progress}%</span>
                            </div>
                            <Progress value={test.progress} className="h-2" />
                          </div>
                        )}

                        <div className="space-y-2">
                          {test.tests.map((t, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-card/50 rounded border border-border/30">
                              <div className="flex items-center gap-2">
                                {t.passed === true && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                                {t.passed === false && <XCircle className="h-4 w-4 text-red-400" />}
                                {t.passed === null && <Clock className="h-4 w-4 text-blue-400 animate-pulse" />}
                                <span className="text-sm">{t.type}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">{t.findings}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                          <span className="text-sm text-muted-foreground">
                            {test.vulnerabilities} vulnerabilities found
                          </span>
                          <Button size="sm" variant="outline">View Report</Button>
                        </div>
                      </CardContent>
                    </Card>
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

export default RedTeamAutomation;
