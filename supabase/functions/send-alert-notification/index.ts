import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertNotificationRequest {
  alertId?: string;
  alertTitle: string;
  alertDescription: string;
  severity: string;
  recipientEmail: string;
  recipientName?: string;
  incidentId?: string;
  alertType?: string;
}

const getSeverityColor = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'critical': return '#dc2626';
    case 'high': return '#ea580c';
    case 'medium': return '#ca8a04';
    case 'low': return '#16a34a';
    default: return '#6b7280';
  }
};

const getSeverityEmoji = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'critical': return '🚨';
    case 'high': return '⚠️';
    case 'medium': return '⚡';
    case 'low': return 'ℹ️';
    default: return '📢';
  }
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      alertId,
      alertTitle,
      alertDescription,
      severity,
      recipientEmail,
      recipientName,
      incidentId,
      alertType
    }: AlertNotificationRequest = await req.json();

    if (!alertTitle || !severity || !recipientEmail) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const severityColor = getSeverityColor(severity);
    const severityEmoji = getSeverityEmoji(severity);
    const timestamp = new Date().toLocaleString('en-US', { 
      timeZone: 'UTC',
      dateStyle: 'full',
      timeStyle: 'long'
    });

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <tr>
      <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; padding: 32px; border: 1px solid #334155;">
        <!-- Header -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="text-align: center; padding-bottom: 24px; border-bottom: 1px solid #334155;">
              <h1 style="margin: 0; color: #38bdf8; font-size: 28px; font-weight: 700;">
                🛡️ SentinelMind
              </h1>
              <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 14px;">
                Security Alert Notification
              </p>
            </td>
          </tr>
        </table>

        <!-- Alert Badge -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
          <tr>
            <td style="text-align: center;">
              <span style="display: inline-block; background-color: ${severityColor}; color: white; padding: 8px 24px; border-radius: 999px; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                ${severityEmoji} ${severity} Alert
              </span>
            </td>
          </tr>
        </table>

        <!-- Alert Content -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
          <tr>
            <td style="background-color: #1e293b; border-radius: 12px; padding: 24px; border-left: 4px solid ${severityColor};">
              <h2 style="margin: 0 0 12px 0; color: #f1f5f9; font-size: 20px; font-weight: 600;">
                ${alertTitle}
              </h2>
              <p style="margin: 0; color: #cbd5e1; font-size: 15px; line-height: 1.6;">
                ${alertDescription || 'No additional details provided.'}
              </p>
              ${alertType ? `
              <p style="margin: 16px 0 0 0; color: #94a3b8; font-size: 13px;">
                <strong>Type:</strong> ${alertType}
              </p>
              ` : ''}
              ${alertId ? `
              <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 13px;">
                <strong>Alert ID:</strong> ${alertId}
              </p>
              ` : ''}
              ${incidentId ? `
              <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 13px;">
                <strong>Incident ID:</strong> ${incidentId}
              </p>
              ` : ''}
            </td>
          </tr>
        </table>

        <!-- Timestamp -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 13px;">
                🕐 Alert generated at: ${timestamp} UTC
              </p>
            </td>
          </tr>
        </table>

        <!-- CTA Button -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
          <tr>
            <td style="text-align: center;">
              <a href="#" style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
                View in Dashboard →
              </a>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #334155;">
          <tr>
            <td style="text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                This is an automated security notification from SentinelMind.
              </p>
              <p style="margin: 8px 0 0 0; color: #475569; font-size: 11px;">
                Please do not reply to this email. For support, contact your security team.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const emailResponse = await resend.emails.send({
      from: "SentinelMind <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `${severityEmoji} [${severity.toUpperCase()}] Security Alert: ${alertTitle}`,
      html: emailHtml,
    });

    console.log("Alert notification sent successfully:", emailResponse);

    // Log the notification in audit logs
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (profile?.organization_id) {
      await supabase.from('audit_logs').insert({
        organization_id: profile.organization_id,
        user_id: user.id,
        action: 'alert_notification_sent',
        resource_type: 'security_alert',
        resource_id: alertId || null,
        details: {
          recipient: recipientEmail,
          severity,
          alertTitle
        }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error sending alert notification:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send notification" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
