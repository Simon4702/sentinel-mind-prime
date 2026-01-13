import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Globe,
  Shield,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Server,
  FileSearch,
  Loader2,
  ExternalLink,
  Copy,
  Fingerprint,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EnrichmentResult {
  source: string;
  data: any;
  risk_score?: number;
  is_malicious?: boolean;
  geolocation?: any;
}

interface EnrichmentResponse {
  success: boolean;
  enrichments: EnrichmentResult[];
  aggregate_risk_score: number | null;
  is_malicious: boolean;
  geolocation: any;
  threat_actors: string[];
  related_campaigns: string[];
  sources_queried: string[];
}

export const ThreatEnrichmentEngine = () => {
  const { toast } = useToast();
  const [indicator, setIndicator] = useState("");
  const [indicatorType, setIndicatorType] = useState<string>("ip");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EnrichmentResponse | null>(null);
  const [history, setHistory] = useState<{ indicator: string; type: string; result: EnrichmentResponse }[]>([]);

  const enrichIndicator = async () => {
    if (!indicator.trim()) {
      toast({
        title: "Enter an Indicator",
        description: "Please enter an IP, domain, hash, or URL to enrich",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("threat-enrichment", {
        body: {
          indicator_value: indicator.trim(),
          indicator_type: indicatorType,
        },
      });

      if (error) throw error;

      setResult(data as EnrichmentResponse);
      setHistory(prev => [
        { indicator: indicator.trim(), type: indicatorType, result: data },
        ...prev.slice(0, 9),
      ]);

      toast({
        title: "Enrichment Complete",
        description: `Queried ${data.sources_queried.length} sources`,
      });
    } catch (error) {
      console.error("Enrichment failed:", error);
      toast({
        title: "Enrichment Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (score: number | null) => {
    if (score === null) return "text-muted-foreground";
    if (score >= 75) return "text-red-400";
    if (score >= 50) return "text-orange-400";
    if (score >= 25) return "text-yellow-400";
    return "text-emerald-400";
  };

  const getRiskBadge = (score: number | null, isMalicious: boolean) => {
    if (isMalicious) return <Badge className="bg-red-500/20 text-red-400">Malicious</Badge>;
    if (score === null) return <Badge variant="outline">Unknown</Badge>;
    if (score >= 75) return <Badge className="bg-red-500/20 text-red-400">High Risk</Badge>;
    if (score >= 50) return <Badge className="bg-orange-500/20 text-orange-400">Medium Risk</Badge>;
    if (score >= 25) return <Badge className="bg-yellow-500/20 text-yellow-400">Low Risk</Badge>;
    return <Badge className="bg-emerald-500/20 text-emerald-400">Clean</Badge>;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-cyan-500/10">
          <Fingerprint className="h-6 w-6 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Threat Enrichment</h2>
          <p className="text-sm text-muted-foreground">
            VirusTotal • AbuseIPDB • Shodan
          </p>
        </div>
      </div>

      {/* Search Panel */}
      <Card className="border-cyan-500/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Select value={indicatorType} onValueChange={setIndicatorType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ip">IP Address</SelectItem>
                <SelectItem value="domain">Domain</SelectItem>
                <SelectItem value="hash">File Hash</SelectItem>
                <SelectItem value="url">URL</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder={
                indicatorType === "ip" ? "e.g., 8.8.8.8" :
                indicatorType === "domain" ? "e.g., example.com" :
                indicatorType === "hash" ? "e.g., d41d8cd98f00b204..." :
                "e.g., https://example.com/path"
              }
              value={indicator}
              onChange={(e) => setIndicator(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enrichIndicator()}
              className="flex-1"
            />

            <Button onClick={enrichIndicator} disabled={isLoading} className="gap-2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Enrich
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary Card */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Risk Assessment
                </span>
                {getRiskBadge(result.aggregate_risk_score, result.is_malicious)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-4">
                <div className={`text-5xl font-bold ${getRiskColor(result.aggregate_risk_score)}`}>
                  {result.aggregate_risk_score ?? "N/A"}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Aggregate Risk Score
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span className="flex items-center gap-1">
                    {result.is_malicious ? (
                      <><AlertTriangle className="h-4 w-4 text-red-400" /> Malicious</>
                    ) : (
                      <><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Clean</>
                    )}
                  </span>
                </div>

                {result.geolocation && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Location</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {result.geolocation.country_name || result.geolocation.country}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sources</span>
                  <span>{result.sources_queried.join(", ")}</span>
                </div>
              </div>

              {result.threat_actors.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Threat Actors</p>
                  <div className="flex flex-wrap gap-1">
                    {result.threat_actors.map((actor, idx) => (
                      <Badge key={idx} variant="destructive">{actor}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Card className="lg:col-span-2 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileSearch className="h-5 w-5 text-primary" />
                Source Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={result.enrichments[0]?.source || "virustotal"}>
                <TabsList className="mb-4">
                  {result.enrichments.map((enrichment) => (
                    <TabsTrigger key={enrichment.source} value={enrichment.source}>
                      {enrichment.source}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {result.enrichments.map((enrichment) => (
                  <TabsContent key={enrichment.source} value={enrichment.source}>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-4">
                        {/* Risk Score for this source */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                          <span className="text-sm">Risk Score</span>
                          <span className={`text-lg font-bold ${getRiskColor(enrichment.risk_score ?? null)}`}>
                            {enrichment.risk_score ?? "N/A"}
                          </span>
                        </div>

                        {/* Data fields */}
                        {Object.entries(enrichment.data).map(([key, value]) => {
                          if (value === null || value === undefined) return null;
                          
                          return (
                            <div key={key} className="p-3 rounded-lg bg-muted/20">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-muted-foreground">
                                  {key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => copyToClipboard(JSON.stringify(value))}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="text-sm">
                                {typeof value === "object" ? (
                                  <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                                    {JSON.stringify(value, null, 2)}
                                  </pre>
                                ) : (
                                  String(value)
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Recent Lookups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {history.map((item, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIndicator(item.indicator);
                    setIndicatorType(item.type);
                    setResult(item.result);
                  }}
                  className="gap-2"
                >
                  {item.result.is_malicious ? (
                    <AlertTriangle className="h-3 w-3 text-red-400" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  )}
                  <span className="max-w-[150px] truncate">{item.indicator}</span>
                  <Badge variant="outline" className="text-xs">{item.type}</Badge>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
