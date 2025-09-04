import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Globe, AlertTriangle, Shield, Zap, Activity, MapPin } from "lucide-react";

interface ThreatData {
  id: string;
  source: {
    country: string;
    city: string;
    coordinates: [number, number];
  };
  target: {
    country: string;
    city: string;
    coordinates: [number, number];
  };
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  attackVector: string;
}

const ThreatMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapReady, setIsMapReady] = useState(false);
  const [threatData, setThreatData] = useState<ThreatData[]>([]);
  const [activeThreatCount, setActiveThreatCount] = useState(0);

  // Sample threat locations for simulation
  const threatLocations = [
    { country: "Russia", city: "Moscow", coordinates: [37.6176, 55.7558] as [number, number] },
    { country: "China", city: "Beijing", coordinates: [116.4074, 39.9042] as [number, number] },
    { country: "North Korea", city: "Pyongyang", coordinates: [125.7481, 39.0392] as [number, number] },
    { country: "Iran", city: "Tehran", coordinates: [51.3890, 35.6892] as [number, number] },
    { country: "Brazil", city: "São Paulo", coordinates: [-46.6333, -23.5505] as [number, number] },
    { country: "Romania", city: "Bucharest", coordinates: [26.1025, 44.4268] as [number, number] },
    { country: "Nigeria", city: "Lagos", coordinates: [3.3792, 6.5244] as [number, number] },
    { country: "India", city: "Mumbai", coordinates: [72.8777, 19.0760] as [number, number] }
  ];

  const targetLocations = [
    { country: "USA", city: "New York", coordinates: [74.0060, 40.7128] as [number, number] },
    { country: "USA", city: "Los Angeles", coordinates: [-118.2437, 34.0522] as [number, number] },
    { country: "UK", city: "London", coordinates: [-0.1276, 51.5074] as [number, number] },
    { country: "Germany", city: "Berlin", coordinates: [13.4050, 52.5200] as [number, number] },
    { country: "Japan", city: "Tokyo", coordinates: [139.6917, 35.6895] as [number, number] },
    { country: "Australia", city: "Sydney", coordinates: [151.2093, -33.8688] as [number, number] },
    { country: "Canada", city: "Toronto", coordinates: [-79.3832, 43.6532] as [number, number] },
    { country: "France", city: "Paris", coordinates: [2.3522, 48.8566] as [number, number] }
  ];

  const attackTypes = [
    "DDoS Attack", "Ransomware", "Phishing", "Malware", "Data Breach", 
    "SQL Injection", "Brute Force", "Zero-day Exploit", "APT", "Cryptojacking"
  ];

  const attackVectors = [
    "Email", "Web Application", "Network", "Mobile", "IoT Device", 
    "Cloud Service", "Remote Access", "Supply Chain", "Social Engineering"
  ];

  // Generate random threat data
  const generateThreatData = (): ThreatData => {
    const source = threatLocations[Math.floor(Math.random() * threatLocations.length)];
    const target = targetLocations[Math.floor(Math.random() * targetLocations.length)];
    const severities: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      source,
      target,
      type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      timestamp: new Date(),
      attackVector: attackVectors[Math.floor(Math.random() * attackVectors.length)]
    };
  };

  // Initialize map when token is provided
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      projection: 'globe',
      zoom: 1.5,
      center: [0, 20],
      pitch: 0,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      'top-right'
    );

    map.current.scrollZoom.disable();

    map.current.on('style.load', () => {
      if (!map.current) return;
      
      map.current.setFog({
        color: 'rgb(0, 0, 0)',
        'high-color': 'rgb(50, 50, 100)',
        'horizon-blend': 0.1,
      });

      // Add threat source layer
      map.current.addSource('threat-sources', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add threat target layer
      map.current.addSource('threat-targets', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add threat connections layer
      map.current.addSource('threat-connections', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Style for threat sources (red circles)
      map.current.addLayer({
        id: 'threat-sources-layer',
        type: 'circle',
        source: 'threat-sources',
        paint: {
          'circle-radius': [
            'case',
            ['==', ['get', 'severity'], 'critical'], 12,
            ['==', ['get', 'severity'], 'high'], 8,
            ['==', ['get', 'severity'], 'medium'], 6,
            4
          ],
          'circle-color': [
            'case',
            ['==', ['get', 'severity'], 'critical'], '#dc2626',
            ['==', ['get', 'severity'], 'high'], '#ea580c',
            ['==', ['get', 'severity'], 'medium'], '#ca8a04',
            '#65a30d'
          ],
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Style for threat targets (blue circles)
      map.current.addLayer({
        id: 'threat-targets-layer',
        type: 'circle',
        source: 'threat-targets',
        paint: {
          'circle-radius': 6,
          'circle-color': '#3b82f6',
          'circle-opacity': 0.7,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });

      // Style for threat connections (lines)
      map.current.addLayer({
        id: 'threat-connections-layer',
        type: 'line',
        source: 'threat-connections',
        paint: {
          'line-color': [
            'case',
            ['==', ['get', 'severity'], 'critical'], '#dc2626',
            ['==', ['get', 'severity'], 'high'], '#ea580c',
            ['==', ['get', 'severity'], 'medium'], '#ca8a04',
            '#65a30d'
          ],
          'line-width': [
            'case',
            ['==', ['get', 'severity'], 'critical'], 4,
            ['==', ['get', 'severity'], 'high'], 3,
            ['==', ['get', 'severity'], 'medium'], 2,
            1
          ],
          'line-opacity': 0.6,
          'line-dasharray': [2, 2]
        }
      });

      // Add popups for threat sources
      map.current.on('click', 'threat-sources-layer', (e) => {
        if (!e.features || !e.features[0] || !map.current) return;
        
        const feature = e.features[0];
        const properties = feature.properties;
        
        new mapboxgl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(`
            <div class="p-2">
              <h3 class="font-bold text-red-600">${properties?.type}</h3>
              <p><strong>Source:</strong> ${properties?.source_city}, ${properties?.source_country}</p>
              <p><strong>Target:</strong> ${properties?.target_city}, ${properties?.target_country}</p>
              <p><strong>Severity:</strong> <span class="capitalize">${properties?.severity}</span></p>
              <p><strong>Vector:</strong> ${properties?.attack_vector}</p>
              <p class="text-xs text-gray-500">${new Date(properties?.timestamp).toLocaleString()}</p>
            </div>
          `)
          .addTo(map.current);
      });

      setIsMapReady(true);
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Update map with threat data
  useEffect(() => {
    if (!map.current || !isMapReady || threatData.length === 0) return;

    const sourceFeatures = threatData.map(threat => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: threat.source.coordinates
      },
      properties: {
        severity: threat.severity,
        type: threat.type,
        source_country: threat.source.country,
        source_city: threat.source.city,
        target_country: threat.target.country,
        target_city: threat.target.city,
        attack_vector: threat.attackVector,
        timestamp: threat.timestamp.toISOString()
      }
    }));

    const targetFeatures = threatData.map(threat => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: threat.target.coordinates
      },
      properties: {
        country: threat.target.country,
        city: threat.target.city
      }
    }));

    const connectionFeatures = threatData.map(threat => ({
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: [threat.source.coordinates, threat.target.coordinates]
      },
      properties: {
        severity: threat.severity,
        type: threat.type
      }
    }));

    const sourcesSource = map.current.getSource('threat-sources') as mapboxgl.GeoJSONSource;
    const targetsSource = map.current.getSource('threat-targets') as mapboxgl.GeoJSONSource;
    const connectionsSource = map.current.getSource('threat-connections') as mapboxgl.GeoJSONSource;

    if (sourcesSource) {
      sourcesSource.setData({
        type: 'FeatureCollection',
        features: sourceFeatures
      });
    }

    if (targetsSource) {
      targetsSource.setData({
        type: 'FeatureCollection',
        features: targetFeatures
      });
    }

    if (connectionsSource) {
      connectionsSource.setData({
        type: 'FeatureCollection',
        features: connectionFeatures
      });
    }
  }, [threatData, isMapReady]);

  // Generate new threats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newThreat = generateThreatData();
      setThreatData(prev => {
        const updated = [newThreat, ...prev.slice(0, 49)]; // Keep last 50 threats
        setActiveThreatCount(updated.length);
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Global Threat Map
          </CardTitle>
          <CardDescription>Real-time visualization of cyber attacks worldwide</CardDescription>
        </CardHeader>
      </Card>

      {/* Token Input (if not connected to Supabase) */}
      {!mapboxToken && (
        <Alert>
          <MapPin className="h-4 w-4" />
          <AlertDescription className="space-y-3">
            <p>To display the threat map, please enter your Mapbox public token:</p>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your Mapbox public token..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={() => {/* Token is already set via onChange */}}
                disabled={!mapboxToken}
              >
                Load Map
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Get your token at: <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a>
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Row */}
      {mapboxToken && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-destructive/20 bg-gradient-to-br from-destructive/5 to-destructive/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-2xl font-bold text-destructive">{activeThreatCount}</p>
                  <p className="text-sm text-muted-foreground">Active Threats</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-warning/20 bg-gradient-to-br from-warning/5 to-warning/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-warning" />
                <div>
                  <p className="text-2xl font-bold text-warning">
                    {threatData.filter(t => t.severity === 'critical' || t.severity === 'high').length}
                  </p>
                  <p className="text-sm text-muted-foreground">High Risk</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-primary">
                    {threatData.filter(t => Date.now() - t.timestamp.getTime() < 60000).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Last Minute</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-success/20 bg-gradient-to-br from-success/5 to-success/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-success" />
                <div>
                  <p className="text-2xl font-bold text-success">98.7%</p>
                  <p className="text-sm text-muted-foreground">Detection Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map and Threat Feed */}
      {mapboxToken && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Threat Map */}
          <Card className="lg:col-span-2 border-primary/20 bg-gradient-cyber shadow-elegant">
            <CardContent className="p-0">
              <div ref={mapContainer} className="h-96 w-full rounded-lg" />
              {!isMapReady && mapboxToken && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 animate-spin" />
                    <span>Loading threat map...</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Live Threat Feed */}
          <Card className="border-primary/20 bg-gradient-cyber shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-destructive" />
                Live Threat Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {threatData.slice(0, 10).map((threat) => (
                  <div key={threat.id} className="p-3 border border-muted rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getSeverityColor(threat.severity)}>
                        {threat.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {threat.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="font-medium text-sm">{threat.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {threat.source.city}, {threat.source.country} → {threat.target.city}, {threat.target.country}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Via: {threat.attackVector}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ThreatMap;