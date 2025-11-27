import { IncidentManagement } from "@/components/IncidentManagement";
import { PlaybookManager } from "@/components/PlaybookManager";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const IncidentResponse = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Incident Response</h1>
        <Tabs defaultValue="incidents" className="space-y-6">
          <TabsList>
            <TabsTrigger value="incidents">Active Incidents</TabsTrigger>
            <TabsTrigger value="playbooks">Playbooks</TabsTrigger>
          </TabsList>
          <TabsContent value="incidents">
            <IncidentManagement />
          </TabsContent>
          <TabsContent value="playbooks">
            <PlaybookManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default IncidentResponse;
