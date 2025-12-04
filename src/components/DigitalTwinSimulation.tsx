import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Box, 
  Play, 
  AlertTriangle, 
  DollarSign, 
  Target,
  Shield,
  Server,
  Database,
  Users,
  Zap,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockSimulations = [
  { 
    id: "1", 
    name: "Ransomware Attack Simulation", 
    type: "ransomware", 
    status: "completed",
    blastRadius: { systems: 45, users: 234, data: "2.3 TB" },
    financialImpact: 2500000,
    recommendations: ["Implement network segmentation", "Deploy endpoint detection", "Backup validation"],
    completedAt: "2 hours ago"
  },
  { 
    id: "2", 
    name: "Insider Data Theft", 
    type: "insider_abuse", 
    status: "running",
    progress: 67,
    blastRadius: { systems: 12, users: 45, data: "500 GB" },
    financialImpact: 750000,
    recommendations: ["DLP policy enforcement", "Access reviews"],
    completedAt: null
  },
  { 
    id: "3", 
    name: "Phishing Campaign Impact", 
    type: "phishing", 
    status: "completed",
    blastRadius: { systems: 8, users: 156, data: "200 GB" },
    financialImpact: 450000,
    recommendations: ["Security awareness training", "Email filtering"],
    completedAt: "1 day ago"
  },
];

const attackTypes = [
  { value: "malware", label: "Malware Infection" },
  { value: "ransomware", label: "Ransomware Attack" },
  { value: "insider_abuse", label: "Insider Abuse" },
  { value: "phishing", label: "Phishing Campaign" },
  { value: "apt", label: "Advanced Persistent Threat" },
];

const SimulationCard = ({ sim }: { sim: typeof mockSimulations[0] }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-emerald-500/20 text-emerald-400"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "running": return <Badge className="bg-blue-500/20 text-blue-400 animate-pulse"><Play className="h-3 w-3 mr-1" />Running</Badge>;
      case "draft": return <Badge variant="secondary">Draft</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="bg-card/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="font-semibold text-lg">{sim.name}</div>
            <div className="text-sm text-muted-foreground">Type: {sim.type.replace("_", " ")}</div>
          </div>
          {getStatusBadge(sim.status)}
        </div>

        {sim.status === "running" && sim.progress && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{sim.progress}%</span>
            </div>
            <Progress value={sim.progress} className="h-2" />
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-card/50 rounded-lg">
            <Server className="h-5 w-5 mx-auto text-blue-400 mb-1" />
            <div className="text-xl font-bold">{sim.blastRadius.systems}</div>
            <div className="text-xs text-muted-foreground">Systems Affected</div>
          </div>
          <div className="text-center p-3 bg-card/50 rounded-lg">
            <Users className="h-5 w-5 mx-auto text-purple-400 mb-1" />
            <div className="text-xl font-bold">{sim.blastRadius.users}</div>
            <div className="text-xs text-muted-foreground">Users Impacted</div>
          </div>
          <div className="text-center p-3 bg-card/50 rounded-lg">
            <Database className="h-5 w-5 mx-auto text-orange-400 mb-1" />
            <div className="text-xl font-bold">{sim.blastRadius.data}</div>
            <div className="text-xs text-muted-foreground">Data at Risk</div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-red-400" />
            <span className="text-sm">Estimated Financial Impact</span>
          </div>
          <span className="text-xl font-bold text-red-400">
            ${sim.financialImpact.toLocaleString()}
          </span>
        </div>

        <div>
          <div className="text-sm font-medium mb-2">Recommendations</div>
          <div className="flex flex-wrap gap-2">
            {sim.recommendations.map((rec, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                {rec}
              </Badge>
            ))}
          </div>
        </div>

        {sim.completedAt && (
          <div className="text-xs text-muted-foreground mt-3">
            Completed: {sim.completedAt}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const DigitalTwinSimulation = () => {
  const { toast } = useToast();
  const [selectedAttack, setSelectedAttack] = useState("");
  const [running, setRunning] = useState(false);

  const runSimulation = () => {
    if (!selectedAttack) {
      toast({ title: "Select Attack Type", description: "Please select an attack type to simulate.", variant: "destructive" });
      return;
    }
    setRunning(true);
    toast({
      title: "Simulation Started",
      description: "Digital twin simulation is now running. This may take a few minutes.",
    });
    setTimeout(() => setRunning(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Box className="h-6 w-6 text-cyan-400" />
            Digital Twin Simulation
          </h2>
          <p className="text-muted-foreground">Predict attack outcomes before they happen</p>
        </div>
      </div>

      {/* New Simulation */}
      <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Launch New Simulation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Select value={selectedAttack} onValueChange={setSelectedAttack}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select attack scenario" />
              </SelectTrigger>
              <SelectContent>
                {attackTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={runSimulation} disabled={running}>
              {running ? (
                <>
                  <Play className="h-4 w-4 mr-2 animate-spin" />
                  Simulating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Simulation
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Simulations run against your digital twin environment without affecting production systems.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Box className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">23</div>
                <div className="text-sm text-muted-foreground">Simulations Run</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">156</div>
                <div className="text-sm text-muted-foreground">Vulnerabilities Found</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Shield className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">89</div>
                <div className="text-sm text-muted-foreground">Fixes Implemented</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">$4.2M</div>
                <div className="text-sm text-muted-foreground">Potential Loss Avoided</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simulations Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Simulations</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {mockSimulations.map((sim) => (
            <SimulationCard key={sim.id} sim={sim} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DigitalTwinSimulation;
