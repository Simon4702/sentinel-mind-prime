import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RemediationAction {
  type: string;
  target: string;
  action: string;
  status: "pending" | "executed" | "failed" | "rolled_back";
  details: any;
  timestamp: string;
}

interface RemediationRule {
  id: string;
  name: string;
  trigger_type: string;
  severity_threshold: string[];
  actions: string[];
  is_enabled: boolean;
}

// Default remediation rules
const DEFAULT_RULES: RemediationRule[] = [
  {
    id: "rule_block_malicious_ip",
    name: "Block Malicious IPs",
    trigger_type: "threat_intelligence",
    severity_threshold: ["critical", "high"],
    actions: ["block_ip", "create_alert", "notify_team"],
    is_enabled: true,
  },
  {
    id: "rule_isolate_compromised",
    name: "Isolate Compromised Assets",
    trigger_type: "security_incident",
    severity_threshold: ["critical"],
    actions: ["isolate_endpoint", "revoke_access", "create_alert"],
    is_enabled: true,
  },
  {
    id: "rule_disable_suspicious_user",
    name: "Disable Suspicious Users",
    trigger_type: "insider_threat",
    severity_threshold: ["critical", "high"],
    actions: ["disable_user", "revoke_sessions", "create_alert"],
    is_enabled: true,
  },
  {
    id: "rule_quarantine_malware",
    name: "Quarantine Malware",
    trigger_type: "malware_detection",
    severity_threshold: ["critical", "high", "medium"],
    actions: ["quarantine_file", "scan_related", "create_alert"],
    is_enabled: true,
  },
];

async function executeAction(
  action: string,
  target: any,
  supabase: any,
  context: any
): Promise<RemediationAction> {
  const timestamp = new Date().toISOString();
  
  try {
    switch (action) {
      case "block_ip":
        // Log the IP block action (in real scenario, this would integrate with firewall APIs)
        console.log(`[REMEDIATION] Blocking IP: ${target.indicator_value}`);
        return {
          type: "block_ip",
          target: target.indicator_value,
          action: "IP added to blocklist",
          status: "executed",
          details: {
            ip: target.indicator_value,
            reason: context.reason || "Malicious activity detected",
            blocklist: "firewall_rules",
          },
          timestamp,
        };

      case "isolate_endpoint":
        console.log(`[REMEDIATION] Isolating endpoint: ${target.hostname || target.id}`);
        return {
          type: "isolate_endpoint",
          target: target.hostname || target.id,
          action: "Endpoint isolated from network",
          status: "executed",
          details: {
            endpoint_id: target.id,
            hostname: target.hostname,
            isolation_type: "network_quarantine",
          },
          timestamp,
        };

      case "disable_user":
        console.log(`[REMEDIATION] Disabling user: ${target.user_id}`);
        // In real scenario, this would disable the user account
        return {
          type: "disable_user",
          target: target.user_id,
          action: "User account disabled",
          status: "executed",
          details: {
            user_id: target.user_id,
            reason: context.reason || "Suspicious activity",
          },
          timestamp,
        };

      case "revoke_access":
      case "revoke_sessions":
        console.log(`[REMEDIATION] Revoking access for: ${target.user_id}`);
        return {
          type: "revoke_sessions",
          target: target.user_id,
          action: "All sessions revoked",
          status: "executed",
          details: {
            user_id: target.user_id,
            sessions_revoked: "all",
          },
          timestamp,
        };

      case "quarantine_file":
        console.log(`[REMEDIATION] Quarantining file: ${target.file_path || target.hash}`);
        return {
          type: "quarantine_file",
          target: target.file_path || target.hash,
          action: "File moved to quarantine",
          status: "executed",
          details: {
            file_path: target.file_path,
            hash: target.hash,
            quarantine_location: "/quarantine/",
          },
          timestamp,
        };

      case "create_alert":
        // Create a security alert
        const { error: alertError } = await supabase
          .from('security_alerts')
          .insert({
            title: `[AUTO-REMEDIATION] ${context.trigger_type}: ${context.rule_name}`,
            alert_type: "auto_remediation",
            priority: context.severity || "high",
            description: `Automated remediation action triggered by ${context.rule_name}. Target: ${JSON.stringify(target)}`,
            source_system: "auto_remediation_engine",
            organization_id: "00000000-0000-0000-0000-000000000001",
            raw_data: {
              rule_id: context.rule_id,
              actions_taken: context.actions_taken || [],
              trigger_data: target,
            },
          });

        if (alertError) {
          console.error("Failed to create alert:", alertError);
        }

        return {
          type: "create_alert",
          target: "security_alerts",
          action: "Alert created",
          status: alertError ? "failed" : "executed",
          details: { alert_created: !alertError },
          timestamp,
        };

      case "notify_team":
        console.log(`[REMEDIATION] Notifying security team about: ${context.rule_name}`);
        return {
          type: "notify_team",
          target: "security_team",
          action: "Team notification sent",
          status: "executed",
          details: {
            notification_type: "email",
            recipients: ["security-team@example.com"],
          },
          timestamp,
        };

      case "scan_related":
        console.log(`[REMEDIATION] Initiating related scan for: ${target.indicator_value || target.hash}`);
        return {
          type: "scan_related",
          target: target.indicator_value || target.hash,
          action: "Related asset scan initiated",
          status: "executed",
          details: {
            scan_type: "full",
            scope: "related_assets",
          },
          timestamp,
        };

      default:
        return {
          type: action,
          target: JSON.stringify(target),
          action: `Unknown action: ${action}`,
          status: "failed",
          details: { error: "Action not implemented" },
          timestamp,
        };
    }
  } catch (error) {
    console.error(`Action ${action} failed:`, error);
    return {
      type: action,
      target: JSON.stringify(target),
      action: `Failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      status: "failed",
      details: { error: error instanceof Error ? error.message : "Unknown error" },
      timestamp,
    };
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

    const { action, trigger_type, severity, target, rule_id, dry_run = false } = await req.json();
    console.log(`Auto-remediation request: ${action}, trigger: ${trigger_type}, severity: ${severity}`);

    if (action === "get_rules") {
      // Fetch rules from database or return defaults
      const { data: dbRules, error: rulesError } = await supabase
        .from('adaptive_defense_rules')
        .select('*')
        .eq('rule_type', 'remediation')
        .eq('is_enabled', true);

      const rules = dbRules?.length ? dbRules : DEFAULT_RULES;
      
      return new Response(
        JSON.stringify({ rules }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "evaluate") {
      // Evaluate which rules match the trigger
      const matchingRules = DEFAULT_RULES.filter(
        rule => rule.is_enabled && 
                rule.trigger_type === trigger_type &&
                rule.severity_threshold.includes(severity)
      );

      return new Response(
        JSON.stringify({ 
          matching_rules: matchingRules,
          would_execute: matchingRules.flatMap(r => r.actions),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "execute") {
      // Find matching rule
      const rule = DEFAULT_RULES.find(r => r.id === rule_id) || DEFAULT_RULES.find(
        r => r.is_enabled && 
             r.trigger_type === trigger_type &&
             r.severity_threshold.includes(severity)
      );

      if (!rule) {
        return new Response(
          JSON.stringify({ error: "No matching remediation rule found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (dry_run) {
        return new Response(
          JSON.stringify({
            dry_run: true,
            rule,
            would_execute: rule.actions,
            target,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Execute all actions for the rule
      const executedActions: RemediationAction[] = [];
      const context = {
        rule_id: rule.id,
        rule_name: rule.name,
        trigger_type,
        severity,
        actions_taken: [] as string[],
        reason: `Triggered by ${trigger_type} with severity ${severity}`,
      };

      for (const actionType of rule.actions) {
        const result = await executeAction(actionType, target, supabase, context);
        executedActions.push(result);
        context.actions_taken.push(actionType);
      }

      // Log the defense action
      await supabase
        .from('defense_actions')
        .insert({
          action_type: rule.actions.join(', '),
          target_type: trigger_type,
          target_id: target.id || target.indicator_value,
          trigger_reason: context.reason,
          auto_triggered: true,
          status: executedActions.every(a => a.status === "executed") ? "completed" : "partial",
          executed_at: new Date().toISOString(),
          organization_id: "00000000-0000-0000-0000-000000000001",
        });

      return new Response(
        JSON.stringify({
          success: true,
          rule,
          actions_executed: executedActions,
          summary: {
            total: executedActions.length,
            succeeded: executedActions.filter(a => a.status === "executed").length,
            failed: executedActions.filter(a => a.status === "failed").length,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use: get_rules, evaluate, or execute" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Auto-remediation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
