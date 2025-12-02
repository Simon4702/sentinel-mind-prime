import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailData {
  from: string;
  to: string;
  subject: string;
  body: string;
  html?: string;
  headers?: Record<string, string>;
  receivedAt?: string;
  provider: 'gmail' | 'outlook' | 'webhook';
  messageId?: string;
}

interface PhishingIndicator {
  type: string;
  risk: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  value?: string;
}

// Known phishing domains and patterns
const SUSPICIOUS_DOMAINS = [
  'secure-login', 'account-verify', 'signin-', 'login-', 'verify-account',
  'update-billing', 'suspended-account', 'urgent-action', 'confirm-identity'
];

const SUSPICIOUS_TLD = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.click', '.loan'];

const URGENCY_KEYWORDS = [
  'urgent', 'immediate', 'suspend', 'terminate', 'expire', 'locked',
  'verify now', 'act now', 'limited time', '24 hours', 'account will be'
];

const CREDENTIAL_KEYWORDS = [
  'password', 'credentials', 'login', 'signin', 'verify your account',
  'confirm your identity', 'update your information', 'security alert'
];

function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
  return text.match(urlRegex) || [];
}

function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return url;
  }
}

function calculateLevenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function checkDomainSpoofing(domain: string): { isSpoofed: boolean; legitimateDomain?: string; similarity?: number } {
  const legitimateDomains = [
    'google.com', 'microsoft.com', 'apple.com', 'amazon.com', 'paypal.com',
    'facebook.com', 'netflix.com', 'dropbox.com', 'linkedin.com', 'twitter.com',
    'instagram.com', 'chase.com', 'bankofamerica.com', 'wellsfargo.com'
  ];
  
  const domainLower = domain.toLowerCase().replace('www.', '');
  
  for (const legit of legitimateDomains) {
    if (domainLower === legit) continue;
    
    const distance = calculateLevenshtein(domainLower, legit);
    const maxLen = Math.max(domainLower.length, legit.length);
    const similarity = 1 - (distance / maxLen);
    
    if (similarity > 0.7 && similarity < 1) {
      return { isSpoofed: true, legitimateDomain: legit, similarity };
    }
    
    // Check for common spoofing patterns
    if (domainLower.includes(legit.replace('.com', '')) && domainLower !== legit) {
      return { isSpoofed: true, legitimateDomain: legit, similarity: 0.8 };
    }
  }
  
  return { isSpoofed: false };
}

function analyzeEmail(email: EmailData): { indicators: PhishingIndicator[]; riskScore: number; isPhishing: boolean } {
  const indicators: PhishingIndicator[] = [];
  let riskScore = 0;
  
  const fullContent = `${email.subject} ${email.body} ${email.html || ''}`.toLowerCase();
  const urls = extractUrls(fullContent);
  
  // Check sender domain
  const senderDomain = email.from.split('@')[1]?.toLowerCase() || '';
  const spoofCheck = checkDomainSpoofing(senderDomain);
  if (spoofCheck.isSpoofed) {
    indicators.push({
      type: 'domain_spoofing',
      risk: 'critical',
      description: `Sender domain "${senderDomain}" appears to impersonate "${spoofCheck.legitimateDomain}"`,
      value: senderDomain
    });
    riskScore += 40;
  }
  
  // Check for suspicious TLDs in sender
  for (const tld of SUSPICIOUS_TLD) {
    if (senderDomain.endsWith(tld)) {
      indicators.push({
        type: 'suspicious_tld',
        risk: 'medium',
        description: `Sender uses suspicious top-level domain: ${tld}`,
        value: senderDomain
      });
      riskScore += 15;
      break;
    }
  }
  
  // Analyze URLs
  for (const url of urls) {
    const domain = extractDomain(url);
    
    // Check URL domain spoofing
    const urlSpoofCheck = checkDomainSpoofing(domain);
    if (urlSpoofCheck.isSpoofed) {
      indicators.push({
        type: 'url_spoofing',
        risk: 'critical',
        description: `URL domain "${domain}" may be impersonating "${urlSpoofCheck.legitimateDomain}"`,
        value: url
      });
      riskScore += 35;
    }
    
    // Check for suspicious domain patterns
    for (const pattern of SUSPICIOUS_DOMAINS) {
      if (domain.includes(pattern)) {
        indicators.push({
          type: 'suspicious_url_pattern',
          risk: 'high',
          description: `URL contains suspicious pattern: "${pattern}"`,
          value: url
        });
        riskScore += 25;
        break;
      }
    }
    
    // Check for IP address URLs
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipRegex.test(domain)) {
      indicators.push({
        type: 'ip_address_url',
        risk: 'high',
        description: 'URL uses IP address instead of domain name',
        value: url
      });
      riskScore += 30;
    }
    
    // Check for suspicious TLDs in URLs
    for (const tld of SUSPICIOUS_TLD) {
      if (domain.endsWith(tld)) {
        indicators.push({
          type: 'suspicious_url_tld',
          risk: 'medium',
          description: `URL uses suspicious top-level domain: ${tld}`,
          value: url
        });
        riskScore += 15;
        break;
      }
    }
  }
  
  // Check for urgency keywords
  const foundUrgency = URGENCY_KEYWORDS.filter(kw => fullContent.includes(kw.toLowerCase()));
  if (foundUrgency.length > 0) {
    indicators.push({
      type: 'urgency_language',
      risk: foundUrgency.length > 2 ? 'high' : 'medium',
      description: `Email contains urgency language: ${foundUrgency.slice(0, 3).join(', ')}`,
      value: foundUrgency.join(', ')
    });
    riskScore += foundUrgency.length * 8;
  }
  
  // Check for credential harvesting keywords
  const foundCredential = CREDENTIAL_KEYWORDS.filter(kw => fullContent.includes(kw.toLowerCase()));
  if (foundCredential.length > 0) {
    indicators.push({
      type: 'credential_harvesting',
      risk: foundCredential.length > 2 ? 'high' : 'medium',
      description: `Email requests sensitive information: ${foundCredential.slice(0, 3).join(', ')}`,
      value: foundCredential.join(', ')
    });
    riskScore += foundCredential.length * 10;
  }
  
  // Check for mismatched sender name and email
  const displayName = email.from.match(/^([^<]+)</)?.[1]?.trim();
  if (displayName && senderDomain) {
    const nameParts = displayName.toLowerCase().split(/\s+/);
    const companyNames = ['google', 'microsoft', 'apple', 'amazon', 'paypal', 'netflix', 'bank'];
    
    for (const company of companyNames) {
      if (nameParts.some(p => p.includes(company)) && !senderDomain.includes(company)) {
        indicators.push({
          type: 'sender_mismatch',
          risk: 'high',
          description: `Display name "${displayName}" doesn't match sender domain "${senderDomain}"`,
          value: email.from
        });
        riskScore += 25;
        break;
      }
    }
  }
  
  // Check for attachment mentions without actual attachments (social engineering)
  if (fullContent.includes('attachment') || fullContent.includes('attached file')) {
    indicators.push({
      type: 'attachment_reference',
      risk: 'low',
      description: 'Email references attachments - verify legitimacy before opening',
    });
    riskScore += 5;
  }
  
  // Normalize score
  riskScore = Math.min(100, riskScore);
  
  return {
    indicators,
    riskScore,
    isPhishing: riskScore >= 50 || indicators.some(i => i.risk === 'critical')
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const contentType = req.headers.get('content-type') || '';
    let emailData: EmailData;

    // Handle different webhook formats
    if (contentType.includes('application/json')) {
      const body = await req.json();
      
      // Detect provider format
      if (body.message && body.message.data) {
        // Gmail Pub/Sub format
        const decoded = atob(body.message.data);
        const gmailData = JSON.parse(decoded);
        emailData = {
          from: gmailData.from || '',
          to: gmailData.to || '',
          subject: gmailData.subject || '',
          body: gmailData.snippet || gmailData.body || '',
          html: gmailData.html,
          messageId: gmailData.id,
          provider: 'gmail',
          receivedAt: new Date().toISOString()
        };
      } else if (body.value && Array.isArray(body.value)) {
        // Microsoft Graph webhook format
        const notification = body.value[0];
        emailData = {
          from: notification.from?.emailAddress?.address || '',
          to: notification.toRecipients?.[0]?.emailAddress?.address || '',
          subject: notification.subject || '',
          body: notification.bodyPreview || notification.body?.content || '',
          html: notification.body?.contentType === 'html' ? notification.body.content : undefined,
          messageId: notification.id,
          provider: 'outlook',
          receivedAt: notification.receivedDateTime || new Date().toISOString()
        };
      } else {
        // Generic webhook format (SendGrid, Mailgun, etc.)
        emailData = {
          from: body.from || body.sender || body.envelope?.from || '',
          to: body.to || body.recipient || body.envelope?.to || '',
          subject: body.subject || '',
          body: body.text || body.body || body['body-plain'] || '',
          html: body.html || body['body-html'],
          headers: body.headers,
          messageId: body.messageId || body['Message-Id'],
          provider: 'webhook',
          receivedAt: body.timestamp ? new Date(body.timestamp * 1000).toISOString() : new Date().toISOString()
        };
      }
    } else {
      // Form data (some webhooks use this)
      const formData = await req.formData();
      emailData = {
        from: formData.get('from')?.toString() || formData.get('sender')?.toString() || '',
        to: formData.get('to')?.toString() || formData.get('recipient')?.toString() || '',
        subject: formData.get('subject')?.toString() || '',
        body: formData.get('text')?.toString() || formData.get('body-plain')?.toString() || '',
        html: formData.get('html')?.toString() || formData.get('body-html')?.toString(),
        provider: 'webhook',
        receivedAt: new Date().toISOString()
      };
    }

    console.log('Processing email from:', emailData.from, 'Subject:', emailData.subject);

    // Analyze the email
    const analysis = analyzeEmail(emailData);
    
    console.log('Analysis complete. Risk score:', analysis.riskScore, 'Is phishing:', analysis.isPhishing);

    // If phishing detected, create a security alert
    if (analysis.isPhishing || analysis.riskScore >= 30) {
      const { data: orgs } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .single();

      if (orgs) {
        // Create security alert
        const { error: alertError } = await supabase
          .from('security_alerts')
          .insert({
            organization_id: orgs.id,
            title: `Phishing Email Detected: ${emailData.subject.substring(0, 50)}`,
            description: `Suspicious email from ${emailData.from}. Risk Score: ${analysis.riskScore}%. Indicators: ${analysis.indicators.map(i => i.type).join(', ')}`,
            alert_type: 'phishing_detection',
            priority: analysis.riskScore >= 70 ? 'critical' : analysis.riskScore >= 50 ? 'high' : 'medium',
            raw_data: {
              email: {
                from: emailData.from,
                to: emailData.to,
                subject: emailData.subject,
                provider: emailData.provider,
                messageId: emailData.messageId,
                receivedAt: emailData.receivedAt
              },
              analysis: {
                riskScore: analysis.riskScore,
                isPhishing: analysis.isPhishing,
                indicators: analysis.indicators
              }
            },
            source_system: `email_monitor_${emailData.provider}`
          });

        if (alertError) {
          console.error('Error creating alert:', alertError);
        }

        // Also add to threat intelligence if critical
        if (analysis.riskScore >= 70) {
          const senderDomain = emailData.from.split('@')[1] || '';
          await supabase
            .from('threat_intelligence')
            .insert({
              indicator_type: 'email_domain',
              indicator_value: senderDomain,
              threat_type: 'phishing',
              severity: 'high',
              source: `email_monitor_${emailData.provider}`,
              description: `Phishing email detected from domain. Subject: ${emailData.subject}`,
              confidence_level: Math.min(analysis.riskScore, 95),
              organization_id: orgs.id
            });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: {
          riskScore: analysis.riskScore,
          isPhishing: analysis.isPhishing,
          indicatorCount: analysis.indicators.length,
          indicators: analysis.indicators,
          email: {
            from: emailData.from,
            subject: emailData.subject,
            provider: emailData.provider
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in email-monitor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
