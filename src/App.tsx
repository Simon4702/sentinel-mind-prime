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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
