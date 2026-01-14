import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  FileCheck,
  Building2,
  Heart,
  Globe,
  Lock,
  ChevronRight,
  Download
} from "lucide-react";

interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  status: 'compliant' | 'partial' | 'non-compliant' | 'not-applicable';
  evidence?: string;
  lastAssessed?: string;
}

interface ComplianceFramework {
  id: string;
  name: string;
  shortName: string;
  icon: React.ReactNode;
  description: string;
  totalControls: number;
  compliantControls: number;
  partialControls: number;
  nonCompliantControls: number;
  controls: ComplianceControl[];
}

const frameworks: ComplianceFramework[] = [
  {
    id: 'soc2',
    name: 'SOC 2 Type II',
    shortName: 'SOC 2',
    icon: <Shield className="h-5 w-5" />,
    description: 'Service Organization Control 2 - Security, Availability, Processing Integrity',
    totalControls: 64,
    compliantControls: 52,
    partialControls: 8,
    nonCompliantControls: 4,
    controls: [
      { id: 'cc1.1', name: 'CC1.1 - Control Environment', description: 'The entity demonstrates a commitment to integrity and ethical values', status: 'compliant', lastAssessed: '2024-01-10' },
      { id: 'cc1.2', name: 'CC1.2 - Board Oversight', description: 'The board of directors demonstrates independence from management', status: 'compliant', lastAssessed: '2024-01-10' },
      { id: 'cc2.1', name: 'CC2.1 - Information Quality', description: 'Entity obtains or generates relevant, quality information', status: 'partial', lastAssessed: '2024-01-08' },
      { id: 'cc3.1', name: 'CC3.1 - Risk Assessment', description: 'Entity specifies objectives with sufficient clarity', status: 'compliant', lastAssessed: '2024-01-10' },
      { id: 'cc4.1', name: 'CC4.1 - Monitoring Activities', description: 'Entity selects and develops monitoring activities', status: 'non-compliant', lastAssessed: '2024-01-05' },
      { id: 'cc5.1', name: 'CC5.1 - Control Activities', description: 'Entity selects and develops control activities', status: 'compliant', lastAssessed: '2024-01-10' },
      { id: 'cc6.1', name: 'CC6.1 - Logical Access', description: 'Entity implements logical access security', status: 'compliant', lastAssessed: '2024-01-10' },
      { id: 'cc7.1', name: 'CC7.1 - System Operations', description: 'Entity manages system changes', status: 'partial', lastAssessed: '2024-01-07' },
    ]
  },
  {
    id: 'hipaa',
    name: 'HIPAA Security Rule',
    shortName: 'HIPAA',
    icon: <Heart className="h-5 w-5" />,
    description: 'Health Insurance Portability and Accountability Act - Healthcare Data Protection',
    totalControls: 42,
    compliantControls: 35,
    partialControls: 5,
    nonCompliantControls: 2,
    controls: [
      { id: '164.308a1', name: '§164.308(a)(1) - Security Management', description: 'Implement policies to prevent, detect, contain security violations', status: 'compliant', lastAssessed: '2024-01-09' },
      { id: '164.308a3', name: '§164.308(a)(3) - Workforce Security', description: 'Implement policies for authorization and supervision', status: 'compliant', lastAssessed: '2024-01-09' },
      { id: '164.308a4', name: '§164.308(a)(4) - Access Management', description: 'Implement policies for granting access to ePHI', status: 'partial', lastAssessed: '2024-01-08' },
      { id: '164.308a5', name: '§164.308(a)(5) - Security Training', description: 'Implement security awareness training program', status: 'compliant', lastAssessed: '2024-01-09' },
      { id: '164.312a1', name: '§164.312(a)(1) - Access Control', description: 'Implement technical policies for access control', status: 'compliant', lastAssessed: '2024-01-09' },
      { id: '164.312b', name: '§164.312(b) - Audit Controls', description: 'Implement mechanisms to record and examine access', status: 'non-compliant', lastAssessed: '2024-01-06' },
    ]
  },
  {
    id: 'gdpr',
    name: 'GDPR',
    shortName: 'GDPR',
    icon: <Globe className="h-5 w-5" />,
    description: 'General Data Protection Regulation - EU Data Privacy',
    totalControls: 38,
    compliantControls: 30,
    partialControls: 6,
    nonCompliantControls: 2,
    controls: [
      { id: 'art5', name: 'Article 5 - Data Processing Principles', description: 'Personal data shall be processed lawfully, fairly and transparently', status: 'compliant', lastAssessed: '2024-01-10' },
      { id: 'art6', name: 'Article 6 - Lawful Processing', description: 'Processing shall be lawful only with valid legal basis', status: 'compliant', lastAssessed: '2024-01-10' },
      { id: 'art17', name: 'Article 17 - Right to Erasure', description: 'Data subjects have the right to erasure', status: 'partial', lastAssessed: '2024-01-08' },
      { id: 'art25', name: 'Article 25 - Data Protection by Design', description: 'Implement data protection by design and by default', status: 'compliant', lastAssessed: '2024-01-10' },
      { id: 'art32', name: 'Article 32 - Security of Processing', description: 'Implement appropriate technical and organizational measures', status: 'compliant', lastAssessed: '2024-01-10' },
      { id: 'art33', name: 'Article 33 - Breach Notification', description: 'Notify supervisory authority within 72 hours of breach', status: 'non-compliant', lastAssessed: '2024-01-05' },
    ]
  },
  {
    id: 'iso27001',
    name: 'ISO 27001:2022',
    shortName: 'ISO 27001',
    icon: <Lock className="h-5 w-5" />,
    description: 'Information Security Management System Standard',
    totalControls: 93,
    compliantControls: 78,
    partialControls: 10,
    nonCompliantControls: 5,
    controls: [
      { id: 'a5.1', name: 'A.5.1 - Information Security Policies', description: 'Policies for information security approved and communicated', status: 'compliant', lastAssessed: '2024-01-10' },
      { id: 'a6.1', name: 'A.6.1 - Internal Organization', description: 'Security roles and responsibilities defined', status: 'compliant', lastAssessed: '2024-01-10' },
      { id: 'a7.1', name: 'A.7.1 - Human Resource Security', description: 'Background verification checks carried out', status: 'partial', lastAssessed: '2024-01-07' },
      { id: 'a8.1', name: 'A.8.1 - Asset Management', description: 'Information assets identified and inventoried', status: 'compliant', lastAssessed: '2024-01-10' },
      { id: 'a9.1', name: 'A.9.1 - Access Control', description: 'Access control policy documented and reviewed', status: 'compliant', lastAssessed: '2024-01-10' },
      { id: 'a12.1', name: 'A.12.1 - Operations Security', description: 'Operating procedures documented and available', status: 'non-compliant', lastAssessed: '2024-01-04' },
    ]
  },
];

export const ComplianceFrameworks = () => {
  const [selectedFramework, setSelectedFramework] = useState<string>('soc2');

  const getComplianceScore = (framework: ComplianceFramework) => {
    return Math.round((framework.compliantControls / framework.totalControls) * 100);
  };

  const getStatusIcon = (status: ComplianceControl['status']) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'non-compliant':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-muted" />;
    }
  };

  const getStatusBadge = (status: ComplianceControl['status']) => {
    switch (status) {
      case 'compliant':
        return <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">Compliant</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30">Partial</Badge>;
      case 'non-compliant':
        return <Badge className="bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30">Non-Compliant</Badge>;
      default:
        return <Badge variant="outline">N/A</Badge>;
    }
  };

  const currentFramework = frameworks.find(f => f.id === selectedFramework);

  return (
    <div className="space-y-6">
      {/* Framework Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {frameworks.map((framework) => {
          const score = getComplianceScore(framework);
          const isSelected = selectedFramework === framework.id;
          
          return (
            <Card 
              key={framework.id}
              className={`cursor-pointer transition-all hover:border-primary/50 ${
                isSelected ? 'border-primary ring-2 ring-primary/20' : ''
              }`}
              onClick={() => setSelectedFramework(framework.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/20 text-primary' : 'bg-muted'}`}>
                    {framework.icon}
                  </div>
                  <Badge 
                    variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}
                  >
                    {score}%
                  </Badge>
                </div>
                <h3 className="font-semibold mb-1">{framework.shortName}</h3>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {framework.description}
                </p>
                <Progress value={score} className="h-2" />
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{framework.compliantControls}/{framework.totalControls} controls</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Framework Details */}
      {currentFramework && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                  {currentFramework.icon}
                </div>
                <div>
                  <CardTitle>{currentFramework.name}</CardTitle>
                  <CardDescription>{currentFramework.description}</CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{currentFramework.totalControls}</div>
                <div className="text-xs text-muted-foreground">Total Controls</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-green-500/10">
                <div className="text-2xl font-bold text-green-600">{currentFramework.compliantControls}</div>
                <div className="text-xs text-muted-foreground">Compliant</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-yellow-500/10">
                <div className="text-2xl font-bold text-yellow-600">{currentFramework.partialControls}</div>
                <div className="text-xs text-muted-foreground">Partial</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-500/10">
                <div className="text-2xl font-bold text-red-600">{currentFramework.nonCompliantControls}</div>
                <div className="text-xs text-muted-foreground">Non-Compliant</div>
              </div>
            </div>

            {/* Controls List */}
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All Controls</TabsTrigger>
                <TabsTrigger value="non-compliant">Needs Attention</TabsTrigger>
                <TabsTrigger value="compliant">Compliant</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-4">
                <div className="space-y-2">
                  {currentFramework.controls.map((control) => (
                    <div 
                      key={control.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(control.status)}
                        <div>
                          <div className="font-medium">{control.name}</div>
                          <div className="text-sm text-muted-foreground">{control.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {control.lastAssessed && (
                          <span className="text-xs text-muted-foreground">
                            Assessed: {control.lastAssessed}
                          </span>
                        )}
                        {getStatusBadge(control.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="non-compliant" className="mt-4">
                <div className="space-y-2">
                  {currentFramework.controls
                    .filter(c => c.status === 'non-compliant' || c.status === 'partial')
                    .map((control) => (
                      <div 
                        key={control.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(control.status)}
                          <div>
                            <div className="font-medium">{control.name}</div>
                            <div className="text-sm text-muted-foreground">{control.description}</div>
                          </div>
                        </div>
                        {getStatusBadge(control.status)}
                      </div>
                    ))}
                </div>
              </TabsContent>
              
              <TabsContent value="compliant" className="mt-4">
                <div className="space-y-2">
                  {currentFramework.controls
                    .filter(c => c.status === 'compliant')
                    .map((control) => (
                      <div 
                        key={control.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {getStatusIcon(control.status)}
                          <div>
                            <div className="font-medium">{control.name}</div>
                            <div className="text-sm text-muted-foreground">{control.description}</div>
                          </div>
                        </div>
                        {getStatusBadge(control.status)}
                      </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
