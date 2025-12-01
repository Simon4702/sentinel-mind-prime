import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useThreatEnrichment } from "@/hooks/useThreatEnrichment";
import { Database, Globe, MapPin, Shield, Users, Zap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ThreatEnrichmentPanelProps {
  threatId: string;
}

export const ThreatEnrichmentPanel = ({ threatId }: ThreatEnrichmentPanelProps) => {
  const { data: enrichments, isLoading, error } = useThreatEnrichment(threatId);

  if (isLoading) {
    return (
      <Card className="border-primary/20 bg-gradient-cyber">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Threat Intelligence Enrichment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load threat enrichment data
        </AlertDescription>
      </Alert>
    );
  }

  if (!enrichments || enrichments.length === 0) {
    return (
      <Card className="border-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            Threat Intelligence Enrichment
          </CardTitle>
          <CardDescription>
            No enrichment data available for this threat
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getSourceIcon = (source: string) => {
    const lowerSource = source.toLowerCase();
    if (lowerSource.includes('geo')) return MapPin;
    if (lowerSource.includes('abuse')) return Shield;
    if (lowerSource.includes('virus')) return Zap;
    return Database;
  };

  const getReputationColor = (score: number | null) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-success';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Threat Intelligence Enrichment
        </CardTitle>
        <CardDescription>
          External intelligence data from {enrichments.length} source{enrichments.length !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {enrichments.map((enrichment, index) => {
              const SourceIcon = getSourceIcon(enrichment.source);
              
              return (
                <div key={enrichment.id}>
                  <div className="space-y-3">
                    {/* Source Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SourceIcon className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-foreground">
                          {enrichment.source}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {new Date(enrichment.enriched_at).toLocaleDateString()}
                      </Badge>
                    </div>

                    {/* Reputation Score */}
                    {enrichment.reputation_score !== null && (
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Reputation:</span>
                        <span className={`text-sm font-semibold ${getReputationColor(enrichment.reputation_score)}`}>
                          {enrichment.reputation_score}/100
                        </span>
                      </div>
                    )}

                    {/* Geolocation */}
                    {enrichment.geolocation && (
                      <div className="flex items-start gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground">Location:</span>
                          <div className="text-sm text-foreground ml-2">
                            {enrichment.geolocation.city && (
                              <span>{enrichment.geolocation.city}, </span>
                            )}
                            {enrichment.geolocation.country && (
                              <span>{enrichment.geolocation.country}</span>
                            )}
                            {enrichment.geolocation.coordinates && (
                              <span className="text-muted-foreground text-xs block">
                                ({enrichment.geolocation.coordinates.lat}, {enrichment.geolocation.coordinates.lon})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Threat Actors */}
                    {enrichment.threat_actors && enrichment.threat_actors.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 text-destructive mt-0.5" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground">Threat Actors:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {enrichment.threat_actors.map((actor, i) => (
                              <Badge key={i} variant="destructive" className="text-xs">
                                {actor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Related Campaigns */}
                    {enrichment.related_campaigns && enrichment.related_campaigns.length > 0 && (
                      <div className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-warning mt-0.5" />
                        <div className="flex-1">
                          <span className="text-sm text-muted-foreground">Related Campaigns:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {enrichment.related_campaigns.map((campaign, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {campaign}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Additional Data */}
                    {enrichment.enrichment_data && Object.keys(enrichment.enrichment_data).length > 0 && (
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <div className="text-xs font-mono text-muted-foreground">
                          <pre className="overflow-x-auto">
                            {JSON.stringify(enrichment.enrichment_data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>

                  {index < enrichments.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
