import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IOCWatchlistItem {
  id: string;
  indicator_type: string;
  indicator_value: string;
  last_risk_score: number | null;
  is_malicious: boolean;
  organization_id: string | null;
}

async function scanWithVirusTotal(indicator: string, type: string): Promise<{ risk_score: number; is_malicious: boolean; raw: any }> {
  const apiKey = Deno.env.get('VIRUSTOTAL_API_KEY');
  if (!apiKey) throw new Error('VirusTotal API key not configured');

  let endpoint = '';
  if (type === 'ip') {
    endpoint = `https://www.virustotal.com/api/v3/ip_addresses/${indicator}`;
  } else if (type === 'domain') {
    endpoint = `https://www.virustotal.com/api/v3/domains/${indicator}`;
  } else if (type === 'hash') {
    endpoint = `https://www.virustotal.com/api/v3/files/${indicator}`;
  } else if (type === 'url') {
    const urlId = btoa(indicator).replace(/=/g, '');
    endpoint = `https://www.virustotal.com/api/v3/urls/${urlId}`;
  }

  const response = await fetch(endpoint, {
    headers: { 'x-apikey': apiKey },
  });

  if (!response.ok) {
    throw new Error(`VirusTotal API error: ${response.status}`);
  }

  const data = await response.json();
  const stats = data.data?.attributes?.last_analysis_stats || {};
  const malicious = stats.malicious || 0;
  const suspicious = stats.suspicious || 0;
  const total = Object.values(stats).reduce((a: number, b: any) => a + (b || 0), 0) as number;
  
  const risk_score = total > 0 ? Math.round(((malicious + suspicious) / total) * 100) : 0;
  const is_malicious = malicious > 0 || suspicious > 2;

  return { risk_score, is_malicious, raw: data };
}

async function scanWithAbuseIPDB(ip: string): Promise<{ risk_score: number; is_malicious: boolean; raw: any }> {
  const apiKey = Deno.env.get('ABUSEIPDB_API_KEY');
  if (!apiKey) throw new Error('AbuseIPDB API key not configured');

  const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`, {
    headers: {
      'Key': apiKey,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`AbuseIPDB API error: ${response.status}`);
  }

  const data = await response.json();
  const abuseScore = data.data?.abuseConfidenceScore || 0;
  
  return {
    risk_score: abuseScore,
    is_malicious: abuseScore > 50,
    raw: data,
  };
}

async function performScan(item: IOCWatchlistItem): Promise<{ risk_score: number; is_malicious: boolean; scan_result: any }> {
  try {
    if (item.indicator_type === 'ip') {
      // Try AbuseIPDB first for IPs, fallback to VirusTotal
      try {
        const result = await scanWithAbuseIPDB(item.indicator_value);
        return { ...result, scan_result: result.raw };
      } catch {
        const result = await scanWithVirusTotal(item.indicator_value, 'ip');
        return { ...result, scan_result: result.raw };
      }
    } else {
      const result = await scanWithVirusTotal(item.indicator_value, item.indicator_type);
      return { ...result, scan_result: result.raw };
    }
  } catch (error) {
    console.error(`Scan failed for ${item.indicator_value}:`, error);
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting scheduled IOC scan...');

    // Get all active IOCs that need scanning
    const now = new Date();
    const { data: watchlist, error: fetchError } = await supabase
      .from('ioc_watchlist')
      .select('*')
      .eq('is_active', true)
      .or(`last_scan_at.is.null,last_scan_at.lt.${new Date(now.getTime() - 60 * 60 * 1000).toISOString()}`);

    if (fetchError) {
      throw new Error(`Failed to fetch watchlist: ${fetchError.message}`);
    }

    console.log(`Found ${watchlist?.length || 0} IOCs to scan`);

    const results = {
      scanned: 0,
      alerts_generated: 0,
      errors: 0,
      details: [] as any[],
    };

    for (const item of watchlist || []) {
      try {
        // Check scan frequency
        if (item.last_scan_at) {
          const lastScan = new Date(item.last_scan_at);
          const hoursSinceLastScan = (now.getTime() - lastScan.getTime()) / (1000 * 60 * 60);
          if (hoursSinceLastScan < (item.scan_frequency_hours || 24)) {
            continue;
          }
        }

        console.log(`Scanning ${item.indicator_type}: ${item.indicator_value}`);
        const scanResult = await performScan(item);
        
        const reputationChange = item.last_risk_score !== null 
          ? scanResult.risk_score - item.last_risk_score 
          : 0;

        const statusChanged = item.is_malicious !== scanResult.is_malicious;
        const significantChange = Math.abs(reputationChange) >= 10;
        const shouldAlert = item.alert_on_change && (statusChanged || significantChange);

        // Record scan history
        await supabase.from('ioc_scan_history').insert({
          ioc_id: item.id,
          risk_score: scanResult.risk_score,
          is_malicious: scanResult.is_malicious,
          scan_result: scanResult.scan_result,
          reputation_change: reputationChange,
          alert_generated: shouldAlert,
        });

        // Update watchlist item
        await supabase
          .from('ioc_watchlist')
          .update({
            last_scan_at: now.toISOString(),
            previous_risk_score: item.last_risk_score,
            last_risk_score: scanResult.risk_score,
            was_malicious: item.is_malicious,
            is_malicious: scanResult.is_malicious,
          })
          .eq('id', item.id);

        // Generate security alert if needed
        if (shouldAlert && item.organization_id) {
          const alertTitle = statusChanged
            ? `IOC Status Changed: ${item.indicator_value} is now ${scanResult.is_malicious ? 'MALICIOUS' : 'CLEAN'}`
            : `IOC Reputation Change: ${item.indicator_value} (${reputationChange > 0 ? '+' : ''}${reputationChange}%)`;

          await supabase.from('security_alerts').insert({
            organization_id: item.organization_id,
            alert_type: 'ioc_reputation_change',
            title: alertTitle,
            description: `Automated IOC scan detected changes for ${item.indicator_type}: ${item.indicator_value}. Previous score: ${item.last_risk_score ?? 'N/A'}, New score: ${scanResult.risk_score}. Status: ${scanResult.is_malicious ? 'Malicious' : 'Clean'}`,
            priority: scanResult.is_malicious ? 'high' : (significantChange ? 'medium' : 'low'),
            source_system: 'scheduled-ioc-scan',
            raw_data: {
              ioc_id: item.id,
              indicator_type: item.indicator_type,
              indicator_value: item.indicator_value,
              previous_score: item.last_risk_score,
              new_score: scanResult.risk_score,
              reputation_change: reputationChange,
              was_malicious: item.is_malicious,
              is_malicious: scanResult.is_malicious,
            },
          });

          results.alerts_generated++;
        }

        results.scanned++;
        results.details.push({
          indicator: item.indicator_value,
          type: item.indicator_type,
          risk_score: scanResult.risk_score,
          is_malicious: scanResult.is_malicious,
          reputation_change: reputationChange,
          alert_generated: shouldAlert,
        });

        // Rate limiting - wait between scans
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error scanning ${item.indicator_value}:`, error);
        results.errors++;
        results.details.push({
          indicator: item.indicator_value,
          error: error.message,
        });
      }
    }

    console.log(`Scan complete: ${results.scanned} scanned, ${results.alerts_generated} alerts, ${results.errors} errors`);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Scheduled IOC scan error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
