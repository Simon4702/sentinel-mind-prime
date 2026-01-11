import { useState } from "react";
import { SecurityAnalytics } from "@/components/SecurityAnalytics";
import { EnhancedDashboardCharts } from "@/components/EnhancedDashboardCharts";
import { ReportExport } from "@/components/ReportExport";
import { Layout } from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, FileText } from "lucide-react";

const Analytics = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Security Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive security metrics, visualizations, and reporting
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="visualizations" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Visualizations
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports & Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <SecurityAnalytics />
          </TabsContent>

          <TabsContent value="visualizations" className="space-y-6">
            <EnhancedDashboardCharts />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportExport />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Analytics;
