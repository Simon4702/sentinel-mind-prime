import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Atom, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Zap,
  Lock,
  Key,
  RefreshCw,
  Calendar,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CryptoAlgorithm {
  id: string;
  algorithm: string;
  usage: string;
  status: 'safe' | 'vulnerable' | 'at-risk' | 'deprecated';
  quantumSafe: boolean;
  migrationPriority: 'critical' | 'high' | 'medium' | 'low' | 'none';
  estimatedFall: string;
  nistLevel?: number;
  recommendedReplacement?: string;
}

const defaultCryptoInventory: CryptoAlgorithm[] = [
  { id: "1", algorithm: "RSA-2048", usage: "TLS Certificates", status: "vulnerable", quantumSafe: false, migrationPriority: "critical", estimatedFall: "2030", recommendedReplacement: "CRYSTALS-Kyber" },
  { id: "2", algorithm: "AES-256", usage: "Data Encryption", status: "safe", quantumSafe: true, migrationPriority: "none", estimatedFall: "N/A" },
  { id: "3", algorithm: "SHA-256", usage: "Hashing", status: "safe", quantumSafe: true, migrationPriority: "none", estimatedFall: "N/A" },
  { id: "4", algorithm: "ECDSA P-256", usage: "Digital Signatures", status: "vulnerable", quantumSafe: false, migrationPriority: "high", estimatedFall: "2032", recommendedReplacement: "CRYSTALS-Dilithium" },
  { id: "5", algorithm: "RSA-4096", usage: "Key Exchange", status: "at-risk", quantumSafe: false, migrationPriority: "medium", estimatedFall: "2035", recommendedReplacement: "SPHINCS+" },
  { id: "6", algorithm: "3DES", usage: "Legacy Systems", status: "deprecated", quantumSafe: false, migrationPriority: "critical", estimatedFall: "Already weak", recommendedReplacement: "AES-256" },
  { id: "7", algorithm: "ChaCha20-Poly1305", usage: "Mobile Encryption", status: "safe", quantumSafe: true, migrationPriority: "none", estimatedFall: "N/A" },
  { id: "8", algorithm: "Ed25519", usage: "SSH Keys", status: "vulnerable", quantumSafe: false, migrationPriority: "high", estimatedFall: "2032", recommendedReplacement: "CRYSTALS-Dilithium" },
];

const pqcRecommendations = [
  { current: "RSA-2048", recommended: "CRYSTALS-Kyber", type: "Key Encapsulation", nistLevel: 3, standardized: true },
  { current: "ECDSA", recommended: "CRYSTALS-Dilithium", type: "Digital Signature", nistLevel: 3, standardized: true },
  { current: "RSA-4096", recommended: "SPHINCS+", type: "Signature (Stateless)", nistLevel: 5, standardized: true },
  { current: "DH Key Exchange", recommended: "BIKE/HQC", type: "Key Encapsulation", nistLevel: 1, standardized: false },
  { current: "Ed25519", recommended: "Falcon", type: "Digital Signature", nistLevel: 5, standardized: true },
];

const migrationTimeline = [
  { year: "2024", milestone: "Crypto Inventory Complete", status: "completed", description: "Full audit of cryptographic algorithms" },
  { year: "2025", milestone: "PQC Algorithm Selection", status: "in-progress", description: "Evaluating NIST-approved algorithms" },
  { year: "2026", milestone: "Hybrid Implementation Start", status: "planned", description: "Deploy hybrid classical+PQC encryption" },
  { year: "2028", milestone: "Full PQC Migration", status: "planned", description: "Complete transition to post-quantum cryptography" },
  { year: "2030", milestone: "Legacy Algorithm Sunset", status: "planned", description: "Deprecate all vulnerable algorithms" },
];

export const QuantumSecurity = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [cryptoInventory, setCryptoInventory] = useState<CryptoAlgorithm[]>(defaultCryptoInventory);
  const [loading, setLoading] = useState(false);

  const runScan = async () => {
    setScanning(true);
    toast({
      title: "Quantum Readiness Scan",
      description: "Analyzing cryptographic inventory for quantum vulnerabilities...",
    });
    
    // Simulate scanning for quantum vulnerabilities
    setTimeout(() => {
      setScanning(false);
      toast({
        title: "Scan Complete",
        description: "Post-quantum cryptography analysis completed successfully",
      });
    }, 3000);
  };

  const getStatusBadge = (status: CryptoAlgorithm['status']) => {
    switch (status) {
      case "safe": return <Badge className="bg-emerald-500/20 text-emerald-400">Quantum Safe</Badge>;
      case "vulnerable": return <Badge className="bg-red-500/20 text-red-400">Vulnerable</Badge>;
      case "at-risk": return <Badge className="bg-yellow-500/20 text-yellow-400">At Risk</Badge>;
      case "deprecated": return <Badge className="bg-gray-500/20 text-gray-400">Deprecated</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: CryptoAlgorithm['migrationPriority']) => {
    switch (priority) {
      case "critical": return <Badge variant="destructive">Critical</Badge>;
      case "high": return <Badge className="bg-orange-500/20 text-orange-400">High</Badge>;
      case "medium": return <Badge className="bg-yellow-500/20 text-yellow-400">Medium</Badge>;
      case "low": return <Badge className="bg-blue-500/20 text-blue-400">Low</Badge>;
      case "none": return <Badge variant="secondary">None</Badge>;
      default: return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const vulnerableCount = cryptoInventory.filter(c => c.status === "vulnerable").length;
  const atRiskCount = cryptoInventory.filter(c => c.status === "at-risk").length;
  const safeCount = cryptoInventory.filter(c => c.quantumSafe).length;
  const deprecatedCount = cryptoInventory.filter(c => c.status === "deprecated").length;
  const pqcReadiness = Math.round((safeCount / cryptoInventory.length) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Atom className="h-6 w-6 text-violet-400" />
            Quantum-Resilient Security Module
          </h2>
          <p className="text-muted-foreground">Post-quantum cryptography readiness assessment & migration planning</p>
        </div>
        <Button onClick={runScan} disabled={scanning}>
          {scanning ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Atom className="h-4 w-4 mr-2" />
              Run PQC Scan
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Atom className="h-8 w-8 text-violet-400" />
              <div>
                <div className="text-2xl font-bold">{pqcReadiness}%</div>
                <div className="text-sm text-muted-foreground">PQC Readiness</div>
              </div>
            </div>
            <Progress value={pqcReadiness} className="h-2 mt-3" />
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <div>
                <div className="text-2xl font-bold">{vulnerableCount}</div>
                <div className="text-sm text-muted-foreground">Vulnerable</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-400" />
              <div>
                <div className="text-2xl font-bold">{atRiskCount}</div>
                <div className="text-sm text-muted-foreground">At Risk (5-10yr)</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-gray-500/10 to-gray-600/5 border-gray-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Lock className="h-8 w-8 text-gray-400" />
              <div>
                <div className="text-2xl font-bold">{deprecatedCount}</div>
                <div className="text-sm text-muted-foreground">Deprecated</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-emerald-400" />
              <div>
                <div className="text-2xl font-bold">{safeCount}</div>
                <div className="text-sm text-muted-foreground">Quantum Safe</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crypto Inventory */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Cryptographic Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {cryptoInventory.map((crypto) => (
                    <div key={crypto.id} className="flex items-center justify-between p-3 bg-card/30 rounded-lg border border-border/30 hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          crypto.quantumSafe ? 'bg-emerald-500/20' : 
                          crypto.status === 'deprecated' ? 'bg-gray-500/20' :
                          'bg-red-500/20'
                        }`}>
                          <Key className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-mono font-medium">{crypto.algorithm}</div>
                          <div className="text-xs text-muted-foreground">{crypto.usage}</div>
                          {crypto.recommendedReplacement && (
                            <div className="text-xs text-emerald-400 mt-1">
                              → Migrate to {crypto.recommendedReplacement}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Est. Fall</div>
                          <div className={`text-sm font-medium ${
                            crypto.estimatedFall === 'N/A' ? 'text-emerald-400' :
                            crypto.estimatedFall === 'Already weak' ? 'text-red-400' :
                            'text-yellow-400'
                          }`}>{crypto.estimatedFall}</div>
                        </div>
                        {getStatusBadge(crypto.status)}
                        {getPriorityBadge(crypto.migrationPriority)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Side Panels */}
        <div className="space-y-4">
          {/* PQC Recommendations */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                NIST PQC Standards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pqcRecommendations.map((rec, idx) => (
                  <div key={idx} className="p-2 bg-card/50 rounded-lg border border-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground line-through">{rec.current}</span>
                      <span className="text-xs">→</span>
                      <span className="text-xs font-medium text-emerald-400">{rec.recommended}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{rec.type}</span>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">NIST L{rec.nistLevel}</Badge>
                        {rec.standardized && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                            <CheckCircle className="h-2 w-2 mr-1" />
                            Std
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Migration Timeline */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                Migration Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {migrationTimeline.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                      item.status === "completed" ? "bg-emerald-500" :
                      item.status === "in-progress" ? "bg-blue-500 animate-pulse" :
                      "bg-muted"
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{item.year}</span>
                        {item.status === "completed" && <CheckCircle className="h-3 w-3 text-emerald-400" />}
                        {item.status === "in-progress" && <Clock className="h-3 w-3 text-blue-400" />}
                      </div>
                      <div className="text-sm text-foreground">{item.milestone}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quantum Threat Info */}
          <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Atom className="h-5 w-5 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Q-Day Preparedness</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cryptographically relevant quantum computers could break RSA and ECC within 10-15 years. 
                    Begin migration now to ensure "harvest now, decrypt later" attacks are mitigated.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuantumSecurity;
