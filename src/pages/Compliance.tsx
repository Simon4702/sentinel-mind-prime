import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ComplianceFrameworks } from "@/components/ComplianceFrameworks";
import { ComplianceGapAnalysis } from "@/components/ComplianceGapAnalysis";
import { ScheduledReports } from "@/components/ScheduledReports";
import { ReportExport } from "@/components/ReportExport";
import { AuditTrail } from "@/components/AuditTrail";
import { 
  Shield, 
  AlertTriangle, 
  Calendar, 
  FileText,
  ClipboardList
} from "lucide-react";

const Compliance = () => {
  const [activeTab, setActiveTab] = useState("frameworks");

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Compliance & Reporting</h1>
            <p className="text-muted-foreground">
              Manage compliance frameworks, identify gaps, and automate reporting
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="frameworks" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Frameworks
            </TabsTrigger>
            <TabsTrigger value="gaps" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Gap Analysis
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Scheduled Reports
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Audit Trail
            </TabsTrigger>
          </TabsList>

          <TabsContent value="frameworks" className="space-y-6">
            <ComplianceFrameworks />
          </TabsContent>

          <TabsContent value="gaps" className="space-y-6">
            <ComplianceGapAnalysis />
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-6">
            <ScheduledReports />
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <ReportExport />
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <AuditTrail />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Compliance;
