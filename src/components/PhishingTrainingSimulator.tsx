import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Shield, 
  Target, 
  Brain,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Mail,
  Link,
  Users,
  Trophy,
  Zap,
  Activity,
  Eye,
  Globe,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhishingIndicator {
  type: string;
  risk: 'low' | 'medium' | 'high';
  description: string;
}

interface TrainingScenario {
  id: string;
  type: 'email' | 'url' | 'social';
  title: string;
  content: string;
  isPhishing: boolean;
  indicators: PhishingIndicator[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface UserProgress {
  name: string;
  department: string;
  score: number;
  scenariosCompleted: number;
  accuracy: number;
  lastActivity: string;
}

export const PhishingTrainingSimulator = () => {
  const [activeUrl, setActiveUrl] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [detectionResults, setDetectionResults] = useState<PhishingIndicator[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<TrainingScenario | null>(null);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [realTimeThreats, setRealTimeThreats] = useState<any[]>([]);
  const { toast } = useToast();

  const trainingScenarios: TrainingScenario[] = [
    {
      id: "1",
      type: "email",
      title: "Urgent Account Verification",
      content: "From: security@paypaI.com\nSubject: Immediate Action Required - Account Suspended\n\nDear Valued Customer,\n\nYour PayPal account has been temporarily suspended due to suspicious activity. Please verify your account immediately by clicking the link below:\n\nhttp://paypal-verification.security-update.net/verify\n\nFailure to verify within 24 hours will result in permanent account closure.\n\nBest Regards,\nPayPal Security Team",
      isPhishing: true,
      indicators: [
        { type: "Suspicious Domain", risk: "high", description: "Domain uses 'paypaI.com' with capital 'I' instead of 'l'" },
        { type: "Urgency Tactics", risk: "medium", description: "Creates false urgency with threats of account closure" },
        { type: "Suspicious URL", risk: "high", description: "Link redirects to non-PayPal domain" }
      ],
      difficulty: "beginner"
    },
    {
      id: "2", 
      type: "email",
      title: "Company IT Update",
      content: "From: it-support@company.com\nSubject: Mandatory Security Update\n\nDear Team,\n\nAs part of our ongoing security improvements, all employees must update their passwords using our new secure portal.\n\nPlease visit: https://company-security-update.com/login\n\nUse your current credentials to log in and create a new password.\n\nIT Department",
      isPhishing: true,
      indicators: [
        { type: "Domain Spoofing", risk: "high", description: "External domain pretending to be company IT" },
        { type: "Credential Harvesting", risk: "high", description: "Requests current login credentials" },
        { type: "Authority Impersonation", risk: "medium", description: "Impersonates IT department" }
      ],
      difficulty: "intermediate"
    },
    {
      id: "3",
      type: "email", 
      title: "Legitimate Bank Statement",
      content: "From: statements@chase.com\nSubject: Your Monthly Statement is Ready\n\nDear Customer,\n\nYour Chase account statement for October 2024 is now available.\n\nView your statement by logging into your account at chase.com\n\nThank you for banking with Chase.\n\nChase Customer Service",
      isPhishing: false,
      indicators: [
        { type: "Legitimate Domain", risk: "low", description: "Email from official chase.com domain" },
        { type: "No Suspicious Links", risk: "low", description: "Directs to official website without direct links" },
        { type: "Standard Communication", risk: "low", description: "Normal bank communication pattern" }
      ],
      difficulty: "beginner"
    }
  ];

  const userProgress: UserProgress[] = [
    { name: "Sarah Chen", department: "Marketing", score: 95, scenariosCompleted: 12, accuracy: 92, lastActivity: "2 hours ago" },
    { name: "Mike Rodriguez", department: "Finance", score: 88, scenariosCompleted: 10, accuracy: 85, lastActivity: "1 day ago" },
    { name: "Emma Wilson", department: "HR", score: 92, scenariosCompleted: 15, accuracy: 89, lastActivity: "3 hours ago" },
    { name: "David Kim", department: "IT", score: 98, scenariosCompleted: 18, accuracy: 96, lastActivity: "30 min ago" },
    { name: "Lisa Garcia", department: "Sales", score: 78, scenariosCompleted: 8, accuracy: 78, lastActivity: "5 hours ago" }
  ];

  // Real-time phishing detection
  const analyzeUrl = async (url: string) => {
    setIsAnalyzing(true);
    const indicators: PhishingIndicator[] = [];

    try {
      // Simulate real-time analysis with actual detection logic
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check for suspicious domains
      const suspiciousDomains = ['bit.ly', 'tinyurl.com', 'shortened.link', 'sus-domain.net'];
      const domain = new URL(url).hostname;
      
      if (suspiciousDomains.some(sus => domain.includes(sus))) {
        indicators.push({
          type: "Suspicious Domain",
          risk: "high",
          description: `Domain ${domain} is known for hosting malicious content`
        });
      }

      // Check for URL shorteners
      if (url.includes('bit.ly') || url.includes('tinyurl') || url.includes('t.co')) {
        indicators.push({
          type: "URL Shortener",
          risk: "medium", 
          description: "URL shorteners can hide malicious destinations"
        });
      }

      // Check for HTTPS
      if (!url.startsWith('https://')) {
        indicators.push({
          type: "Insecure Connection",
          risk: "medium",
          description: "URL does not use secure HTTPS protocol"
        });
      }

      // Check for suspicious patterns
      if (url.includes('login') && !url.includes('google.com') && !url.includes('microsoft.com')) {
        indicators.push({
          type: "Potential Credential Harvesting",
          risk: "high",
          description: "URL contains login functionality from untrusted domain"
        });
      }

      // Check for typosquatting
      const legitimateDomains = ['google.com', 'microsoft.com', 'apple.com', 'amazon.com', 'paypal.com'];
      const typoPatterns = legitimateDomains.filter(legit => {
        const similarity = calculateSimilarity(domain, legit);
        return similarity > 0.7 && similarity < 1.0;
      });

      if (typoPatterns.length > 0) {
        indicators.push({
          type: "Typosquatting",
          risk: "high",
          description: `Domain appears to mimic ${typoPatterns[0]}`
        });
      }

      setDetectionResults(indicators);
      
      toast({
        title: "URL Analysis Complete",
        description: `Found ${indicators.length} potential security indicators`,
      });

    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Unable to analyze URL. Please check the format.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeEmail = async (content: string) => {
    setIsAnalyzing(true);
    const indicators: PhishingIndicator[] = [];

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check for urgency keywords
      const urgencyKeywords = ['urgent', 'immediate', 'suspended', 'expires', 'act now', 'limited time'];
      if (urgencyKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
        indicators.push({
          type: "Urgency Tactics",
          risk: "medium",
          description: "Email uses urgency language to pressure quick action"
        });
      }

      // Check for suspicious domains in email
      const emailMatch = content.match(/From:.*@([^\s]+)/);
      if (emailMatch) {
        const domain = emailMatch[1];
        if (domain.includes('secure-') || domain.includes('-security') || domain.includes('verification-')) {
          indicators.push({
            type: "Suspicious Sender Domain",
            risk: "high", 
            description: `Sender domain ${domain} uses security-themed naming`
          });
        }
      }

      // Check for suspicious links
      const urlMatches = content.match(/(http[s]?:\/\/[^\s]+)/g);
      if (urlMatches) {
        urlMatches.forEach(url => {
          if (!url.includes('https://')) {
            indicators.push({
              type: "Insecure Link",
              risk: "medium",
              description: "Email contains non-HTTPS links"
            });
          }
        });
      }

      // Check for credential requests
      if (content.toLowerCase().includes('password') || content.toLowerCase().includes('login') || content.toLowerCase().includes('verify')) {
        indicators.push({
          type: "Credential Request",
          risk: "high",
          description: "Email requests sensitive login information"
        });
      }

      setDetectionResults(indicators);
      
      toast({
        title: "Email Analysis Complete",
        description: `Identified ${indicators.length} potential phishing indicators`,
      });

    } catch (error) {
      toast({
        title: "Analysis Error", 
        description: "Unable to analyze email content",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  };

  const startScenario = (scenario: TrainingScenario) => {
    setCurrentScenario(scenario);
    setUserAnswer(null);
    setShowResult(false);
  };

  const submitAnswer = (answer: boolean) => {
    setUserAnswer(answer);
    setShowResult(true);
    
    const isCorrect = answer === currentScenario?.isPhishing;
    toast({
      title: isCorrect ? "Correct!" : "Incorrect",
      description: isCorrect ? "Great job identifying the threat!" : "Review the indicators to improve your detection skills",
      variant: isCorrect ? "default" : "destructive"
    });
  };

  // Simulate real-time threat feed
  useEffect(() => {
    const interval = setInterval(() => {
      const threats = [
        { type: "Phishing Email", target: "finance@company.com", source: "external", severity: "high", timestamp: new Date() },
        { type: "Suspicious URL", target: "hr-team", source: "social media", severity: "medium", timestamp: new Date() },
        { type: "Spear Phishing", target: "executives", source: "email", severity: "critical", timestamp: new Date() }
      ];
      
      setRealTimeThreats(prev => [
        threats[Math.floor(Math.random() * threats.length)],
        ...prev.slice(0, 9)
      ]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-destructive';
      case 'medium': return 'text-warning';
      case 'low': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Phishing Training Simulator
          </h1>
          <p className="text-xl text-muted-foreground">
            Real-time phishing detection and interactive security training
          </p>
        </div>

        <Tabs defaultValue="detection" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="detection">Real-Time Detection</TabsTrigger>
            <TabsTrigger value="training">Interactive Training</TabsTrigger>
            <TabsTrigger value="monitoring">Threat Monitoring</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Real-Time Detection */}
          <TabsContent value="detection" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* URL Analysis */}
              <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link className="h-5 w-5 text-primary" />
                    URL Threat Analysis
                  </CardTitle>
                  <CardDescription>Analyze URLs for phishing indicators in real-time</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter URL to analyze..."
                      value={activeUrl}
                      onChange={(e) => setActiveUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => analyzeUrl(activeUrl)}
                      disabled={!activeUrl || isAnalyzing}
                    >
                      {isAnalyzing ? <Activity className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                      Analyze
                    </Button>
                  </div>
                  
                  {detectionResults.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Detection Results:</h4>
                      {detectionResults.map((indicator, index) => (
                        <Alert key={index} className={`border-l-4 ${indicator.risk === 'high' ? 'border-l-destructive' : indicator.risk === 'medium' ? 'border-l-warning' : 'border-l-success'}`}>
                          <AlertTriangle className={`h-4 w-4 ${getRiskColor(indicator.risk)}`} />
                          <AlertTitle className="flex items-center justify-between">
                            {indicator.type}
                            <Badge variant={getRiskBadgeVariant(indicator.risk)}>
                              {indicator.risk.toUpperCase()}
                            </Badge>
                          </AlertTitle>
                          <AlertDescription>{indicator.description}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Email Analysis */}
              <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-accent" />
                    Email Threat Analysis
                  </CardTitle>
                  <CardDescription>Analyze email content for phishing patterns</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Paste email content here..."
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    className="min-h-32"
                  />
                  <Button 
                    onClick={() => analyzeEmail(emailContent)}
                    disabled={!emailContent || isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? <Activity className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                    Analyze Email
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Interactive Training */}
          <TabsContent value="training" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Training Scenarios */}
              <Card className="lg:col-span-2 border-primary/20 bg-gradient-cyber shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Interactive Scenarios
                  </CardTitle>
                  <CardDescription>Practice identifying phishing attempts</CardDescription>
                </CardHeader>
                <CardContent>
                  {!currentScenario ? (
                    <div className="space-y-4">
                      <h3 className="font-medium">Choose a training scenario:</h3>
                      {trainingScenarios.map((scenario) => (
                        <div 
                          key={scenario.id}
                          className="p-4 border border-muted rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => startScenario(scenario)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{scenario.title}</h4>
                            <Badge variant="outline">{scenario.difficulty}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {scenario.type === 'email' ? 'Email Scenario' : 'URL Scenario'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{currentScenario.title}</h3>
                        <Button variant="outline" size="sm" onClick={() => setCurrentScenario(null)}>
                          Back to Scenarios
                        </Button>
                      </div>
                      
                      <div className="p-4 bg-muted/50 rounded-lg border">
                        <pre className="whitespace-pre-wrap text-sm">{currentScenario.content}</pre>
                      </div>

                      {!showResult ? (
                        <div className="space-y-4">
                          <h4 className="font-medium">Is this a phishing attempt?</h4>
                          <div className="flex gap-4">
                            <Button 
                              variant={userAnswer === true ? "default" : "outline"}
                              onClick={() => submitAnswer(true)}
                              className="flex-1"
                            >
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Yes, it's phishing
                            </Button>
                            <Button 
                              variant={userAnswer === false ? "default" : "outline"}
                              onClick={() => submitAnswer(false)}
                              className="flex-1"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              No, it's legitimate
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Alert className={userAnswer === currentScenario.isPhishing ? "border-success" : "border-destructive"}>
                            {userAnswer === currentScenario.isPhishing ? 
                              <CheckCircle className="h-4 w-4 text-success" /> : 
                              <XCircle className="h-4 w-4 text-destructive" />
                            }
                            <AlertTitle>
                              {userAnswer === currentScenario.isPhishing ? "Correct!" : "Incorrect"}
                            </AlertTitle>
                            <AlertDescription>
                              This {currentScenario.isPhishing ? "is" : "is not"} a phishing attempt.
                            </AlertDescription>
                          </Alert>

                          <div className="space-y-2">
                            <h4 className="font-medium">Key Indicators:</h4>
                            {currentScenario.indicators.map((indicator, index) => (
                              <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                                <Badge variant={getRiskBadgeVariant(indicator.risk)}>
                                  {indicator.risk}
                                </Badge>
                                <span className="text-sm">{indicator.type}: {indicator.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Progress Tracking */}
              <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-accent" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 border border-accent/20 rounded-lg bg-accent/5">
                    <h3 className="text-2xl font-bold text-accent">87%</h3>
                    <p className="text-sm text-muted-foreground">Detection Accuracy</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Scenarios Completed</span>
                      <span>12/20</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Training Level</span>
                      <span>Intermediate</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>

                  <div className="pt-2 border-t">
                    <h4 className="font-medium mb-2">Recent Achievements</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Shield className="h-3 w-3 text-success" />
                        <span>Phishing Expert</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-3 w-3 text-primary" />
                        <span>Quick Learner</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Threat Monitoring */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Real-time Threats */}
              <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-warning" />
                    Live Threat Feed
                  </CardTitle>
                  <CardDescription>Real-time phishing attempts detected</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {realTimeThreats.map((threat, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-muted rounded-lg">
                        <div>
                          <p className="font-medium">{threat.type}</p>
                          <p className="text-sm text-muted-foreground">Target: {threat.target}</p>
                          <p className="text-xs text-muted-foreground">
                            {threat.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge variant={threat.severity === 'critical' ? 'destructive' : threat.severity === 'high' ? 'outline' : 'secondary'}>
                          {threat.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Protection Status */}
              <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-success" />
                    Protection Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border border-success/20 rounded-lg bg-success/5">
                      <h3 className="text-xl font-bold text-success">99.2%</h3>
                      <p className="text-xs text-muted-foreground">Detection Rate</p>
                    </div>
                    <div className="text-center p-3 border border-primary/20 rounded-lg bg-primary/5">
                      <h3 className="text-xl font-bold text-primary">1.3s</h3>
                      <p className="text-xs text-muted-foreground">Avg Response</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Email Protection</span>
                      <Badge variant="outline" className="border-success/20 text-success">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">URL Scanning</span>
                      <Badge variant="outline" className="border-success/20 text-success">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Real-time Analysis</span>
                      <Badge variant="outline" className="border-success/20 text-success">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">User Training</span>
                      <Badge variant="outline" className="border-warning/20 text-warning">Pending</Badge>
                    </div>
                  </div>

                  <Button className="w-full" variant="outline">
                    <Zap className="h-4 w-4 mr-2" />
                    Run Security Scan
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Team Leaderboard */}
              <Card className="lg:col-span-2 border-primary/20 bg-gradient-cyber shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Team Performance
                  </CardTitle>
                  <CardDescription>Employee training progress and scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {userProgress.map((user, index) => (
                      <div key={user.name} className="flex items-center justify-between p-3 border border-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl font-bold text-muted-foreground">#{index + 1}</div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.department}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{user.score}%</p>
                          <p className="text-xs text-muted-foreground">{user.scenariosCompleted} scenarios</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-accent" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 border border-primary/20 rounded-lg bg-primary/5">
                    <h3 className="text-2xl font-bold text-primary">1,247</h3>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                  </div>

                  <div className="text-center p-4 border border-success/20 rounded-lg bg-success/5">
                    <h3 className="text-2xl font-bold text-success">89%</h3>
                    <p className="text-sm text-muted-foreground">Avg Team Score</p>
                  </div>

                  <div className="text-center p-4 border border-warning/20 rounded-lg bg-warning/5">
                    <h3 className="text-2xl font-bold text-warning">156</h3>
                    <p className="text-sm text-muted-foreground">Threats Blocked</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Training Completion</h4>
                    <Progress value={78} className="h-2" />
                    <p className="text-xs text-muted-foreground">78% company-wide</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};