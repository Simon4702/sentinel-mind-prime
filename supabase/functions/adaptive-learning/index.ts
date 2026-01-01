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

  const startTime = Date.now();

  try {
    // Verify authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized - No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Create client with user's token to verify auth
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user's token
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Authenticated user: ${user.id}`);

    // Get user's profile and verify organization access
    const { data: profile, error: profileError } = await userClient
      .from("profiles")
      .select("organization_id, role")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile lookup failed:", profileError?.message);
      return new Response(
        JSON.stringify({ error: "Forbidden - User profile not found" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user has security analyst or admin role
    const { data: userRole } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["admin", "security_analyst"])
      .limit(1)
      .single();

    if (!userRole) {
      console.error("User does not have required role");
      return new Response(
        JSON.stringify({ error: "Forbidden - Security analyst or admin role required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, organizationId } = await req.json();

    // Verify the requested organization matches user's organization
    if (organizationId && organizationId !== profile.organization_id) {
      console.error(`Organization mismatch: requested ${organizationId}, user belongs to ${profile.organization_id}`);
      return new Response(
        JSON.stringify({ error: "Forbidden - Cannot access other organization's data" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orgId = organizationId || profile.organization_id;

    // Use service role for database operations (with verified user context)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Adaptive Learning - Action: ${action}, Org: ${orgId}, User: ${user.id}`);

    if (action === "analyze_and_learn") {
      // Fetch recent security incidents, alerts, and threat intelligence
      const [incidentsRes, alertsRes, threatsRes] = await Promise.all([
        supabase
          .from("security_incidents")
          .select("*")
          .eq("organization_id", orgId)
          .order("detected_at", { ascending: false })
          .limit(50),
        supabase
          .from("security_alerts")
          .select("*")
          .eq("organization_id", orgId)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("threat_intelligence")
          .select("*")
          .eq("is_active", true)
          .or(`organization_id.eq.${orgId},organization_id.is.null`)
          .limit(50),
      ]);

      const incidents = incidentsRes.data || [];
      const alerts = alertsRes.data || [];
      const threats = threatsRes.data || [];

      console.log(`Analyzing ${incidents.length} incidents, ${alerts.length} alerts, ${threats.length} threats`);

      // Prepare data for AI analysis
      const analysisPrompt = `You are a cybersecurity AI that analyzes attack patterns and generates adaptive defense rules.

Analyze the following security data and identify:
1. Common attack patterns and techniques
2. Indicators of compromise (IOCs)
3. Recommended detection rules
4. Automated countermeasures

INCIDENTS:
${JSON.stringify(incidents.slice(0, 20), null, 2)}

ALERTS:
${JSON.stringify(alerts.slice(0, 20), null, 2)}

THREAT INTELLIGENCE:
${JSON.stringify(threats.slice(0, 20), null, 2)}

Respond with a JSON object containing:
{
  "patterns": [
    {
      "pattern_name": "string",
      "attack_type": "string (phishing, malware, ransomware, brute_force, data_exfiltration, apt, insider_threat)",
      "indicators": ["array of IOCs"],
      "confidence_score": 0-100,
      "description": "string"
    }
  ],
  "defense_rules": [
    {
      "rule_name": "string",
      "rule_type": "string (block, alert, isolate, rate_limit, quarantine)",
      "description": "string",
      "trigger_conditions": { "field": "value" },
      "actions": ["array of actions to take"],
      "priority": 1-100
    }
  ],
  "recommendations": ["array of strategic recommendations"]
}

Focus on actionable, specific patterns and rules based on the actual data provided.`;

      // Call AI for analysis
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a cybersecurity AI expert. Always respond with valid JSON only, no markdown." },
            { role: "user", content: analysisPrompt },
          ],
          temperature: 0.3,
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error(`AI analysis failed: ${aiResponse.status} - ${errorText}`);
        throw new Error("AI analysis failed");
      }

      const aiData = await aiResponse.json();
      const aiContent = aiData.choices?.[0]?.message?.content || "{}";
      
      // Parse AI response
      let analysis;
      try {
        // Clean up potential markdown formatting
        const cleanedContent = aiContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        analysis = JSON.parse(cleanedContent);
      } catch (e) {
        console.error("Failed to parse AI response:", aiContent);
        analysis = { patterns: [], defense_rules: [], recommendations: [] };
      }

      console.log(`AI identified ${analysis.patterns?.length || 0} patterns and ${analysis.defense_rules?.length || 0} rules`);

      // Store learned patterns
      let patternsCreated = 0;
      let rulesCreated = 0;

      for (const pattern of analysis.patterns || []) {
        const { error } = await supabase.from("learned_attack_patterns").insert({
          organization_id: orgId,
          pattern_name: pattern.pattern_name,
          attack_type: pattern.attack_type,
          indicators: pattern.indicators || [],
          detection_rules: [],
          countermeasures: [],
          confidence_score: pattern.confidence_score || 50,
          learned_from_incidents: incidents.slice(0, 5).map((i: any) => i.id),
        });
        
        if (!error) patternsCreated++;
      }

      // Store adaptive defense rules
      for (const rule of analysis.defense_rules || []) {
        const { error } = await supabase.from("adaptive_defense_rules").insert({
          organization_id: orgId,
          rule_name: rule.rule_name,
          rule_type: rule.rule_type,
          description: rule.description,
          trigger_conditions: rule.trigger_conditions || {},
          actions: rule.actions || [],
          priority: rule.priority || 50,
          is_auto_generated: true,
        });
        
        if (!error) rulesCreated++;
      }

      // Log the learning event
      const processingTime = Date.now() - startTime;
      await supabase.from("defense_learning_events").insert({
        organization_id: orgId,
        event_type: "full_analysis",
        source_data: {
          incidents_analyzed: incidents.length,
          alerts_analyzed: alerts.length,
          threats_analyzed: threats.length,
          triggered_by_user: user.id,
        },
        analysis_result: analysis,
        patterns_identified: patternsCreated,
        rules_generated: rulesCreated,
        processing_time_ms: processingTime,
        status: "completed",
      });

      return new Response(
        JSON.stringify({
          success: true,
          patterns_learned: patternsCreated,
          rules_generated: rulesCreated,
          recommendations: analysis.recommendations || [],
          processing_time_ms: processingTime,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_learning_status") {
      // Get learning statistics
      const [patternsRes, rulesRes, eventsRes] = await Promise.all([
        supabase
          .from("learned_attack_patterns")
          .select("*", { count: "exact" })
          .eq("organization_id", orgId)
          .eq("is_active", true),
        supabase
          .from("adaptive_defense_rules")
          .select("*", { count: "exact" })
          .eq("organization_id", orgId)
          .eq("is_enabled", true),
        supabase
          .from("defense_learning_events")
          .select("*")
          .eq("organization_id", orgId)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      return new Response(
        JSON.stringify({
          total_patterns: patternsRes.count || 0,
          active_rules: rulesRes.count || 0,
          patterns: patternsRes.data || [],
          rules: rulesRes.data || [],
          recent_events: eventsRes.data || [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Adaptive Learning error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});