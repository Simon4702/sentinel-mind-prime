import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BehavioralDeceptionGrid from "@/components/BehavioralDeceptionGrid";
import PredictiveCompromiseEngine from "@/components/PredictiveCompromiseEngine";
import AdaptiveDefenseOrchestration from "@/components/AdaptiveDefenseOrchestration";
import CognitiveProfiles from "@/components/CognitiveProfiles";
import DigitalTwinSimulation from "@/components/DigitalTwinSimulation";
import SupplyChainDefense from "@/components/SupplyChainDefense";
import DarkWebMonitoring from "@/components/DarkWebMonitoring";
import ZeroTrustGraph from "@/components/ZeroTrustGraph";
import RedTeamAutomation from "@/components/RedTeamAutomation";
import QuantumSecurity from "@/components/QuantumSecurity";
import AICopilot from "@/components/AICopilot";
import HumanRiskBiometrics from "@/components/HumanRiskBiometrics";
import AutonomousSOC from "@/components/AutonomousSOC";
import AdaptiveLearningSystem from "@/components/AdaptiveLearningSystem";
import {
  Brain,
  Target,
  Shield,
  Users,
  Layers,
  Link,
  Eye,
  Network,
  Crosshair,
  Atom,
  Bot,
  Activity,
  Cpu,
  Sparkles
} from "lucide-react";

const securityModules = [
  { id: "adaptive", name: "Adaptive Learning", icon: Brain, description: "Self-improving defense patterns", color: "text-cyan-400" },
  { id: "deception", name: "Deception Grid", icon: Target, description: "Honeypots & behavioral traps", color: "text-red-400" },
  { id: "predictive", name: "Predictive Engine", icon: Sparkles, description: "ML-powered threat prediction", color: "text-purple-400" },
  { id: "defense", name: "Auto Defense", icon: Shield, description: "Automated threat response", color: "text-emerald-400" },
  { id: "cognitive", name: "Cognitive Profiles", icon: Users, description: "User behavior modeling", color: "text-blue-400" },
  { id: "twin", name: "Digital Twin", icon: Layers, description: "Attack simulation sandbox", color: "text-orange-400" },
  { id: "soc", name: "Autonomous SOC", icon: Cpu, description: "24/7 automated operations", color: "text-pink-400" },
  { id: "biometrics", name: "Human Risk", icon: Activity, description: "Biometric risk analysis", color: "text-rose-400" },
  { id: "copilot", name: "AI Copilot", icon: Bot, description: "AI-powered security assistant", color: "text-primary" },
  { id: "redteam", name: "Red Team", icon: Crosshair, description: "Automated penetration testing", color: "text-red-500" },
  { id: "supply", name: "Supply Chain", icon: Link, description: "Third-party risk monitoring", color: "text-yellow-400" },
  { id: "zerotrust", name: "Zero Trust", icon: Network, description: "Access control & least privilege", color: "text-cyan-500" },
  { id: "darkweb", name: "Dark Web", icon: Eye, description: "External threat intelligence", color: "text-violet-400" },
  { id: "quantum", name: "Quantum Security", icon: Atom, description: "Post-quantum cryptography", color: "text-fuchsia-400" },
];

const AdvancedSecurity = () => {
  const [activeTab, setActiveTab] = useState("adaptive");

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Advanced Security Suite
            <Badge variant="outline" className="text-xs font-normal">Enterprise</Badge>
          </h1>
          <p className="text-muted-foreground">Next-generation AI-powered security capabilities</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {securityModules.slice(0, 7).map((module) => {
            const Icon = module.icon;
            const isActive = activeTab === module.id;
            return (
              <Card 
                key={module.id}
                className={`cursor-pointer transition-all hover:border-primary/50 ${
                  isActive ? 'border-primary ring-1 ring-primary/20' : ''
                }`}
                onClick={() => setActiveTab(module.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${module.color}`} />
                    <span className="text-xs font-medium truncate">{module.name}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-card p-1">
            {securityModules.map((module) => {
              const Icon = module.icon;
              return (
                <TabsTrigger key={module.id} value={module.id} className="text-xs flex items-center gap-1">
                  <Icon className="h-3 w-3" />
                  {module.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="adaptive"><AdaptiveLearningSystem /></TabsContent>
          <TabsContent value="deception"><BehavioralDeceptionGrid /></TabsContent>
          <TabsContent value="predictive"><PredictiveCompromiseEngine /></TabsContent>
          <TabsContent value="defense"><AdaptiveDefenseOrchestration /></TabsContent>
          <TabsContent value="cognitive"><CognitiveProfiles /></TabsContent>
          <TabsContent value="twin"><DigitalTwinSimulation /></TabsContent>
          <TabsContent value="soc"><AutonomousSOC /></TabsContent>
          <TabsContent value="biometrics"><HumanRiskBiometrics /></TabsContent>
          <TabsContent value="copilot"><AICopilot /></TabsContent>
          <TabsContent value="redteam"><RedTeamAutomation /></TabsContent>
          <TabsContent value="supply"><SupplyChainDefense /></TabsContent>
          <TabsContent value="zerotrust"><ZeroTrustGraph /></TabsContent>
          <TabsContent value="darkweb"><DarkWebMonitoring /></TabsContent>
          <TabsContent value="quantum"><QuantumSecurity /></TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdvancedSecurity;
