import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

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

    const { type, data } = await req.json();
    console.log(`AI Threat Analysis - type: ${type}, user: ${user.id}`);

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "ioc_analysis":
        systemPrompt = `You are an expert threat intelligence analyst. Analyze the provided IOC (Indicator of Compromise) and provide:
1. **Risk Assessment**: Severity level (Critical/High/Medium/Low) with justification
2. **Threat Context**: Known associations with malware, APT groups, or campaigns
3. **Attack Patterns**: Common attack vectors using this IOC type
4. **Mitigation Steps**: Specific actions to block or monitor this threat
5. **Related IOCs**: Other indicators that often correlate with this one

Be concise and actionable. Format with clear sections.`;
        userPrompt = `Analyze this IOC:
Type: ${data.indicator_type}
Value: ${data.indicator_value}
Current Risk Score: ${data.risk_score || 'Unknown'}
Tags: ${data.tags?.join(', ') || 'None'}
Description: ${data.description || 'None provided'}`;
        break;

      case "alert_triage":
        systemPrompt = `You are a SOC analyst expert. Triage the following security alert and provide:
1. **Priority Classification**: P1/P2/P3/P4 with reasoning
2. **False Positive Assessment**: Likelihood this is a false positive (High/Medium/Low)
3. **Immediate Actions**: Steps to take right now
4. **Investigation Checklist**: Key items to verify
5. **Escalation Criteria**: When to escalate to senior analysts

Be decisive and clear. This helps analysts make quick decisions.`;
        userPrompt = `Triage this security alert:
Title: ${data.title}
Type: ${data.alert_type}
Priority: ${data.priority}
Description: ${data.description || 'None'}
Source System: ${data.source_system || 'Unknown'}
Raw Data: ${JSON.stringify(data.raw_data || {}).slice(0, 500)}`;
        break;

      case "incident_summary":
        systemPrompt = `You are a security incident responder. Create a comprehensive incident summary including:
1. **Executive Summary**: 2-3 sentences for leadership
2. **Timeline**: Key events in chronological order
3. **Impact Assessment**: Systems, data, and business impact
4. **Root Cause Analysis**: Initial hypothesis of how this happened
5. **Remediation Status**: Current containment and next steps
6. **Lessons Learned**: Recommendations to prevent recurrence

Format for both technical and executive audiences.`;
        userPrompt = `Summarize this security incident:
Title: ${data.title}
Type: ${data.incident_type}
Severity: ${data.severity}
Status: ${data.status}
Detected: ${data.detected_at}
Description: ${data.description || 'None'}
Detection Method: ${data.detection_method || 'Unknown'}
Risk Score: ${data.risk_score || 'Unknown'}`;
        break;

      case "threat_enrichment":
        systemPrompt = `You are a threat intelligence analyst. Enrich the provided threat data with:
1. **Threat Actor Profile**: Known groups, motivations, TTPs
2. **Campaign Analysis**: Related attacks and patterns
3. **MITRE ATT&CK Mapping**: Relevant techniques and tactics
4. **Geolocation Intelligence**: Origin and target regions
5. **Recommended Detections**: SIEM rules and signatures to detect this threat

Provide actionable intelligence for defenders.`;
        userPrompt = `Enrich this threat data:
Threat Type: ${data.threat_type}
Indicator Type: ${data.indicator_type}
Indicator Value: ${data.indicator_value}
Severity: ${data.severity}
Source: ${data.source}
Description: ${data.description || 'None'}
First Seen: ${data.first_seen || 'Unknown'}`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid analysis type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error(`AI gateway error: ${response.status}`);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI service error");
    }

    const aiResponse = await response.json();
    const analysis = aiResponse.choices?.[0]?.message?.content || "Unable to generate analysis";

    console.log(`AI Threat Analysis completed for ${type}`);

    return new Response(
      JSON.stringify({ analysis, type }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("AI Threat Analysis error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
