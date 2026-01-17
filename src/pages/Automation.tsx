import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout } from "@/components/Layout";
import { AutoRemediationEngine } from "@/components/AutoRemediationEngine";
import { ThreatEnrichmentEngine } from "@/components/ThreatEnrichmentEngine";
import { AdaptiveLearningSystem } from "@/components/AdaptiveLearningSystem";
import { AlertEscalationManager } from "@/components/AlertEscalationManager";
import { Zap, Fingerprint, Brain, ArrowUpCircle } from "lucide-react";

const Automation = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Automation & Intelligence</h1>
          <p className="text-muted-foreground">
            AI-powered threat analysis, auto-remediation, and threat enrichment
          </p>
        </div>

        <Tabs defaultValue="enrichment" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[650px]">
            <TabsTrigger value="enrichment" className="gap-2">
              <Fingerprint className="h-4 w-4" />
              Enrichment
            </TabsTrigger>
            <TabsTrigger value="remediation" className="gap-2">
              <Zap className="h-4 w-4" />
              Auto-Remediation
            </TabsTrigger>
            <TabsTrigger value="escalation" className="gap-2">
              <ArrowUpCircle className="h-4 w-4" />
              Escalation
            </TabsTrigger>
            <TabsTrigger value="learning" className="gap-2">
              <Brain className="h-4 w-4" />
              Learning
            </TabsTrigger>
          </TabsList>

          <TabsContent value="enrichment">
            <ThreatEnrichmentEngine />
          </TabsContent>

          <TabsContent value="remediation">
            <AutoRemediationEngine />
          </TabsContent>

          <TabsContent value="escalation">
            <AlertEscalationManager />
          </TabsContent>

          <TabsContent value="learning">
            <AdaptiveLearningSystem />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Automation;
