import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Target, 
  Brain,
  Eye,
  Zap,
  BarChart3,
  Activity,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import heroCyber from "@/assets/hero-cyber.jpg";
import { UserProfileDropdown } from "@/components/UserProfileDropdown";

export const SentinelDashboard = () => {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="border-b border-primary/20 bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">SentinelMind</h1>
                <p className="text-sm text-muted-foreground">
                  {profile?.department || 'Security Platform'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <UserProfileDropdown />
              {profile?.role === 'admin' && (
                <Link to="/admin">
                  <Button variant="outline" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Panel
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroCyber})` }}
        />
        <div className="absolute inset-0 bg-gradient-cyber opacity-80" />
        <div className="relative px-6 py-20 text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6">
              SentinelMind
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Elite Behavioral Cyber Defense Platform
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Button variant="default" size="lg" className="shadow-cyber" asChild>
                <a href="/behavior-engine">
                  <Brain className="mr-2 h-5 w-5" />
                  Analyze Behavior
                </a>
              </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="/threat-monitoring">
                    <Eye className="mr-2 h-5 w-5" />
                    Monitor Threats
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="/phishing-training">
                    <Target className="mr-2 h-5 w-5" />
                    Phishing Training
                  </a>
                </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Threat Level</CardTitle>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-success" />
                  <span className="text-2xl font-bold text-success">LOW</span>
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="border-success/20 text-success">
                  All Systems Secure
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-2xl font-bold">1,247</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-sm text-success">+12% from last week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Phishing Attempts</CardTitle>
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-warning" />
                  <span className="text-2xl font-bold">23</span>
                </div>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="border-warning/20 text-warning">
                  24h Detection
                </Badge>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Defense Score</CardTitle>
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-accent" />
                  <span className="text-2xl font-bold">94%</span>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={94} className="h-2" />
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Behavioral Risk Monitor */}
            <Card className="lg:col-span-2 border-primary/20 bg-gradient-cyber shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Behavioral Risk Monitor
                </CardTitle>
                <CardDescription>Real-time user behavior analysis and threat detection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-success/20">
                    <div>
                      <p className="font-medium">Sarah Chen - Marketing</p>
                      <p className="text-sm text-muted-foreground">Normal login pattern detected</p>
                    </div>
                    <Badge variant="outline" className="border-success/20 text-success">
                      <Shield className="mr-1 h-3 w-3" />
                      Safe
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-warning/20">
                    <div>
                      <p className="font-medium">Mike Rodriguez - Finance</p>
                      <p className="text-sm text-muted-foreground">Unusual file access pattern</p>
                    </div>
                    <Badge variant="outline" className="border-warning/20 text-warning">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Monitor
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-primary/20">
                    <div>
                      <p className="font-medium">Alex Thompson - IT</p>
                      <p className="text-sm text-muted-foreground">Elevated privileges detected</p>
                    </div>
                    <Badge variant="outline" className="border-primary/20 text-primary">
                      <Eye className="mr-1 h-3 w-3" />
                      Review
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Center */}
            <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-accent" />
                  Training Center
                </CardTitle>
                <CardDescription>Gamified cybersecurity training</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 border border-accent/20 rounded-lg bg-accent/5">
                  <h3 className="font-semibold text-accent">Active Campaign</h3>
                  <p className="text-sm text-muted-foreground">Phishing Simulation #47</p>
                  <Progress value={67} className="mt-2 h-2" />
                  <p className="text-xs text-muted-foreground mt-1">67% completion rate</p>
                </div>
                
                <Button variant="outline" className="w-full border-accent/20 hover:bg-accent/10">
                  <Zap className="mr-2 h-4 w-4" />
                  Launch New Campaign
                </Button>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Top Performers</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Emma Wilson</span>
                      <span className="text-success">98% score</span>
                    </div>
                    <div className="flex justify-between">
                      <span>David Kim</span>
                      <span className="text-success">95% score</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lisa Garcia</span>
                      <span className="text-success">92% score</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Overview */}
          <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Security Analytics
              </CardTitle>
              <CardDescription>Comprehensive security metrics and threat intelligence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border border-success/20 rounded-lg bg-success/5">
                  <h3 className="text-2xl font-bold text-success">99.7%</h3>
                  <p className="text-sm text-muted-foreground">Threat Detection Rate</p>
                </div>
                
                <div className="text-center p-4 border border-primary/20 rounded-lg bg-primary/5">
                  <h3 className="text-2xl font-bold text-primary">2.3s</h3>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </div>
                
                <div className="text-center p-4 border border-accent/20 rounded-lg bg-accent/5">
                  <h3 className="text-2xl font-bold text-accent">847</h3>
                  <p className="text-sm text-muted-foreground">Threats Prevented</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};