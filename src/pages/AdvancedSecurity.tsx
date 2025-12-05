import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/Layout";
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

const AdvancedSecurity = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Advanced Security Suite</h1>
          <p className="text-muted-foreground">Enterprise-grade security features</p>
        </div>

        <Tabs defaultValue="deception" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-card p-1">
            <TabsTrigger value="deception" className="text-xs">Deception Grid</TabsTrigger>
            <TabsTrigger value="predictive" className="text-xs">Predictive Engine</TabsTrigger>
            <TabsTrigger value="defense" className="text-xs">Auto Defense</TabsTrigger>
            <TabsTrigger value="cognitive" className="text-xs">Cognitive Profiles</TabsTrigger>
            <TabsTrigger value="twin" className="text-xs">Digital Twin</TabsTrigger>
            <TabsTrigger value="soc" className="text-xs">Autonomous SOC</TabsTrigger>
            <TabsTrigger value="biometrics" className="text-xs">Human Risk</TabsTrigger>
            <TabsTrigger value="copilot" className="text-xs">AI Copilot</TabsTrigger>
            <TabsTrigger value="redteam" className="text-xs">Red Team</TabsTrigger>
            <TabsTrigger value="supply" className="text-xs">Supply Chain</TabsTrigger>
            <TabsTrigger value="zerotrust" className="text-xs">Zero Trust</TabsTrigger>
            <TabsTrigger value="darkweb" className="text-xs">Dark Web</TabsTrigger>
            <TabsTrigger value="quantum" className="text-xs">Quantum Security</TabsTrigger>
          </TabsList>

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
