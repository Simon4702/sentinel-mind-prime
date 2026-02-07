import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import BehaviorEngine from "./pages/BehaviorEngine";
import ThreatMonitoring from "./pages/ThreatMonitoring";
import PhishingTraining from "./pages/PhishingTraining";
import IncidentResponse from "./pages/IncidentResponse";
import ThreatManagement from "./pages/ThreatManagement";
import Admin from "./pages/Admin";
import Analytics from "./pages/Analytics";
import Executive from "./pages/Executive";
import AdvancedSecurity from "./pages/AdvancedSecurity";
import SIEM from "./pages/SIEM";
import Automation from "./pages/Automation";
import Compliance from "./pages/Compliance";
import PeerGroupAnalysisPage from "./pages/PeerGroupAnalysis";
import ActivityTimelinePage from "./pages/ActivityTimeline";
import RiskTrendsPage from "./pages/RiskTrends";
import HeatmapsPage from "./pages/Heatmaps";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/behavior-engine" element={
              <ProtectedRoute requiredRole="security_analyst">
                <BehaviorEngine />
              </ProtectedRoute>
            } />
            <Route path="/threat-monitoring" element={
              <ProtectedRoute requiredRole="security_analyst">
                <ThreatMonitoring />
              </ProtectedRoute>
            } />
            <Route path="/phishing-training" element={
              <ProtectedRoute>
                <PhishingTraining />
              </ProtectedRoute>
            } />
            <Route path="/incident-response" element={
              <ProtectedRoute requiredRole="security_analyst">
                <IncidentResponse />
              </ProtectedRoute>
            } />
            <Route path="/threat-management" element={
              <ProtectedRoute requiredRole="security_analyst">
                <ThreatManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute requiredRole="security_analyst">
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/executive" element={
              <ProtectedRoute requiredRole="admin">
                <Executive />
              </ProtectedRoute>
            } />
            <Route path="/advanced-security" element={
              <ProtectedRoute requiredRole="security_analyst">
                <AdvancedSecurity />
              </ProtectedRoute>
            } />
            <Route path="/siem" element={
              <ProtectedRoute requiredRole="security_analyst">
                <SIEM />
              </ProtectedRoute>
            } />
            <Route path="/automation" element={
              <ProtectedRoute requiredRole="security_analyst">
                <Automation />
              </ProtectedRoute>
            } />
            <Route path="/compliance" element={
              <ProtectedRoute requiredRole="security_analyst">
                <Compliance />
              </ProtectedRoute>
            } />
            <Route path="/peer-analysis" element={
              <ProtectedRoute requiredRole="security_analyst">
                <PeerGroupAnalysisPage />
              </ProtectedRoute>
            } />
            <Route path="/activity-timeline" element={
              <ProtectedRoute requiredRole="security_analyst">
                <ActivityTimelinePage />
              </ProtectedRoute>
            } />
            <Route path="/risk-trends" element={
              <ProtectedRoute requiredRole="security_analyst">
                <RiskTrendsPage />
              </ProtectedRoute>
            } />
            <Route path="/heatmaps" element={
              <ProtectedRoute requiredRole="security_analyst">
                <HeatmapsPage />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
