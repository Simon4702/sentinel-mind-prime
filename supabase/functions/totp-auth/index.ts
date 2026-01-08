import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base32Encode } from "https://deno.land/std@0.190.0/encoding/base32.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a random secret for TOTP
function generateSecret(): string {
  const array = new Uint8Array(20);
  crypto.getRandomValues(array);
  return base32Encode(array).replace(/=/g, '');
}

// Generate TOTP code from secret and time
function generateTOTP(secret: string, timeStep: number = 30): string {
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / timeStep);
  
  // Decode base32 secret
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const secretBytes: number[] = [];
  let buffer = 0;
  let bitsLeft = 0;
  
  for (const char of secret.toUpperCase()) {
    const val = base32Chars.indexOf(char);
    if (val === -1) continue;
    buffer = (buffer << 5) | val;
    bitsLeft += 5;
    if (bitsLeft >= 8) {
      secretBytes.push((buffer >> (bitsLeft - 8)) & 0xff);
      bitsLeft -= 8;
    }
  }
  
  // Convert counter to 8-byte big-endian
  const counterBytes = new Uint8Array(8);
  let temp = counter;
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = temp & 0xff;
    temp = Math.floor(temp / 256);
  }
  
  // HMAC-SHA1 implementation
  const keyBytes = new Uint8Array(secretBytes);
  return hmacSha1TOTP(keyBytes, counterBytes);
}

// Simple HMAC-SHA1 for TOTP
async function hmacSha1TOTP(key: Uint8Array, message: Uint8Array): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, message);
  const hash = new Uint8Array(signature);
  
  // Dynamic truncation
  const offset = hash[hash.length - 1] & 0x0f;
  const binary = 
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);
  
  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

// Verify TOTP with window for clock drift
async function verifyTOTP(secret: string, code: string, window: number = 1): Promise<boolean> {
  for (let i = -window; i <= window; i++) {
    const epoch = Math.floor(Date.now() / 1000) + (i * 30);
    const counter = Math.floor(epoch / 30);
    
    // Generate code for this time window
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const secretBytes: number[] = [];
    let buffer = 0;
    let bitsLeft = 0;
    
    for (const char of secret.toUpperCase()) {
      const val = base32Chars.indexOf(char);
      if (val === -1) continue;
      buffer = (buffer << 5) | val;
      bitsLeft += 5;
      if (bitsLeft >= 8) {
        secretBytes.push((buffer >> (bitsLeft - 8)) & 0xff);
        bitsLeft -= 8;
      }
    }
    
    const counterBytes = new Uint8Array(8);
    let temp = counter;
    for (let j = 7; j >= 0; j--) {
      counterBytes[j] = temp & 0xff;
      temp = Math.floor(temp / 256);
    }
    
    const expectedCode = await hmacSha1TOTP(new Uint8Array(secretBytes), counterBytes);
    if (expectedCode === code) {
      return true;
    }
  }
  return false;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    
    if (claimsError || !claimsData.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.user.id;
    const userEmail = claimsData.user.email || 'user';
    const { action, code } = await req.json();

    console.log(`TOTP action: ${action} for user: ${userId}`);

    if (action === 'generate') {
      // Generate new TOTP secret
      const secret = generateSecret();
      const issuer = 'CyberSentinel';
      const otpauthUrl = `otpauth://totp/${issuer}:${userEmail}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
      
      // Store secret temporarily (user needs to verify before it's active)
      const { error: upsertError } = await supabase
        .from('profiles')
        .update({ 
          // Store in a JSON field or create a new table for MFA
          // For now, we'll use the raw_user_meta_data approach
        })
        .eq('user_id', userId);

      console.log('Generated TOTP secret for user:', userId);
      
      return new Response(
        JSON.stringify({ 
          secret,
          otpauthUrl,
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'verify') {
      if (!code) {
        return new Response(
          JSON.stringify({ error: 'Code is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get stored secret from user metadata
      const { data: userData } = await supabase.auth.getUser();
      const storedSecret = userData?.user?.user_metadata?.totp_secret;
      
      if (!storedSecret) {
        return new Response(
          JSON.stringify({ error: 'TOTP not configured', valid: false }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const isValid = await verifyTOTP(storedSecret, code);
      console.log(`TOTP verification for user ${userId}: ${isValid}`);
      
      return new Response(
        JSON.stringify({ valid: isValid }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'enable') {
      const { secret } = await req.json();
      
      if (!code || !secret) {
        return new Response(
          JSON.stringify({ error: 'Code and secret are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify the code first
      const isValid = await verifyTOTP(secret, code);
      
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: 'Invalid code', enabled: false }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Store the secret in user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          totp_enabled: true,
          totp_secret: secret
        }
      });

      if (updateError) {
        console.error('Error enabling TOTP:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to enable TOTP' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('TOTP enabled for user:', userId);
      
      return new Response(
        JSON.stringify({ enabled: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'disable') {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          totp_enabled: false,
          totp_secret: null
        }
      });

      if (updateError) {
        console.error('Error disabling TOTP:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to disable TOTP' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('TOTP disabled for user:', userId);
      
      return new Response(
        JSON.stringify({ disabled: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'status') {
      const { data: userData } = await supabase.auth.getUser();
      const totpEnabled = userData?.user?.user_metadata?.totp_enabled === true;
      
      return new Response(
        JSON.stringify({ enabled: totpEnabled }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('TOTP auth error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
