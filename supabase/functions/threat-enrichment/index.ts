import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EnrichmentResult {
  source: string;
  data: any;
  risk_score?: number;
  is_malicious?: boolean;
  geolocation?: any;
  threat_actors?: string[];
  related_campaigns?: string[];
}

async function enrichWithVirusTotal(indicator: string, type: string): Promise<EnrichmentResult | null> {
  const apiKey = Deno.env.get("VIRUSTOTAL_API_KEY");
  if (!apiKey) {
    console.log("VirusTotal API key not configured");
    return null;
  }

  try {
    let endpoint = "";
    
    if (type === "ip" || type === "ip_address") {
      endpoint = `https://www.virustotal.com/api/v3/ip_addresses/${indicator}`;
    } else if (type === "domain") {
      endpoint = `https://www.virustotal.com/api/v3/domains/${indicator}`;
    } else if (type === "hash" || type === "file_hash") {
      endpoint = `https://www.virustotal.com/api/v3/files/${indicator}`;
    } else if (type === "url") {
      const urlId = btoa(indicator).replace(/=/g, "");
      endpoint = `https://www.virustotal.com/api/v3/urls/${urlId}`;
    } else {
      return null;
    }

    const response = await fetch(endpoint, {
      headers: { "x-apikey": apiKey }
    });

    if (!response.ok) {
      console.error(`VirusTotal API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const stats = data.data?.attributes?.last_analysis_stats || {};
    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;
    const total = (stats.harmless || 0) + (stats.undetected || 0) + malicious + suspicious;
    
    const riskScore = total > 0 ? Math.round(((malicious * 100 + suspicious * 50) / total)) : 0;

    return {
      source: "VirusTotal",
      data: {
        last_analysis_stats: stats,
        reputation: data.data?.attributes?.reputation,
        last_analysis_date: data.data?.attributes?.last_analysis_date,
        tags: data.data?.attributes?.tags || [],
        categories: data.data?.attributes?.categories || {},
        asn: data.data?.attributes?.asn,
        as_owner: data.data?.attributes?.as_owner,
        country: data.data?.attributes?.country,
      },
      risk_score: riskScore,
      is_malicious: malicious > 3 || (total > 0 && malicious / total > 0.1),
      geolocation: data.data?.attributes?.country ? { country: data.data.attributes.country } : null,
    };
  } catch (error) {
    console.error("VirusTotal enrichment error:", error);
    return null;
  }
}

async function enrichWithAbuseIPDB(ip: string): Promise<EnrichmentResult | null> {
  const apiKey = Deno.env.get("ABUSEIPDB_API_KEY");
  if (!apiKey) {
    console.log("AbuseIPDB API key not configured");
    return null;
  }

  // Only works for IPs
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipRegex.test(ip)) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90&verbose`,
      {
        headers: {
          Key: apiKey,
          Accept: "application/json"
        }
      }
    );

    if (!response.ok) {
      console.error(`AbuseIPDB API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const abuseData = data.data || {};

    return {
      source: "AbuseIPDB",
      data: {
        abuse_confidence_score: abuseData.abuseConfidenceScore,
        total_reports: abuseData.totalReports,
        num_distinct_users: abuseData.numDistinctUsers,
        last_reported_at: abuseData.lastReportedAt,
        isp: abuseData.isp,
        domain: abuseData.domain,
        hostnames: abuseData.hostnames,
        is_tor: abuseData.isTor,
        is_whitelisted: abuseData.isWhitelisted,
        usage_type: abuseData.usageType,
        reports: abuseData.reports?.slice(0, 5) || [],
      },
      risk_score: abuseData.abuseConfidenceScore || 0,
      is_malicious: abuseData.abuseConfidenceScore > 50,
      geolocation: {
        country: abuseData.countryCode,
        country_name: abuseData.countryName,
      },
    };
  } catch (error) {
    console.error("AbuseIPDB enrichment error:", error);
    return null;
  }
}

async function enrichWithShodan(ip: string): Promise<EnrichmentResult | null> {
  const apiKey = Deno.env.get("SHODAN_API_KEY");
  if (!apiKey) {
    console.log("Shodan API key not configured");
    return null;
  }

  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipRegex.test(ip)) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.shodan.io/shodan/host/${ip}?key=${apiKey}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { source: "Shodan", data: { message: "No data found" }, risk_score: 0 };
      }
      console.error(`Shodan API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    const vulnerabilities = data.vulns || [];
    const riskScore = Math.min(100, vulnerabilities.length * 15 + (data.ports?.length || 0) * 2);

    return {
      source: "Shodan",
      data: {
        ports: data.ports,
        hostnames: data.hostnames,
        os: data.os,
        org: data.org,
        isp: data.isp,
        vulns: vulnerabilities.slice(0, 10),
        tags: data.tags,
        last_update: data.last_update,
      },
      risk_score: riskScore,
      is_malicious: vulnerabilities.length > 0,
      geolocation: {
        country: data.country_code,
        country_name: data.country_name,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    };
  } catch (error) {
    console.error("Shodan enrichment error:", error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { indicator_value, indicator_type, threat_id } = await req.json();
    console.log(`Enriching ${indicator_type}: ${indicator_value}`);

    const enrichments: EnrichmentResult[] = [];

    // Run enrichments in parallel
    const [vtResult, abuseResult, shodanResult] = await Promise.all([
      enrichWithVirusTotal(indicator_value, indicator_type),
      enrichWithAbuseIPDB(indicator_value),
      enrichWithShodan(indicator_value),
    ]);

    if (vtResult) enrichments.push(vtResult);
    if (abuseResult) enrichments.push(abuseResult);
    if (shodanResult) enrichments.push(shodanResult);

    // Calculate aggregate risk score
    const validScores = enrichments.filter(e => e.risk_score !== undefined).map(e => e.risk_score!);
    const aggregateRiskScore = validScores.length > 0 
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : null;

    const isMalicious = enrichments.some(e => e.is_malicious);

    // Merge geolocation from all sources
    const geoData = enrichments.find(e => e.geolocation)?.geolocation || null;

    // Collect threat actors and campaigns
    const threatActors = [...new Set(enrichments.flatMap(e => e.threat_actors || []))];
    const relatedCampaigns = [...new Set(enrichments.flatMap(e => e.related_campaigns || []))];

    // Save enrichment to database if threat_id provided
    if (threat_id) {
      const { error: insertError } = await supabase
        .from('threat_enrichment')
        .insert({
          threat_id,
          source: enrichments.map(e => e.source).join(', '),
          enrichment_data: { enrichments },
          reputation_score: aggregateRiskScore,
          geolocation: geoData,
          threat_actors: threatActors.length > 0 ? threatActors : null,
          related_campaigns: relatedCampaigns.length > 0 ? relatedCampaigns : null,
          enriched_by: user.id,
        });

      if (insertError) {
        console.error("Failed to save enrichment:", insertError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        enrichments,
        aggregate_risk_score: aggregateRiskScore,
        is_malicious: isMalicious,
        geolocation: geoData,
        threat_actors: threatActors,
        related_campaigns: relatedCampaigns,
        sources_queried: enrichments.map(e => e.source),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Threat enrichment error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
