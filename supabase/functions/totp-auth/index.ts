import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base32Encode } from "https://deno.land/std@0.190.0/encoding/base32.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory rate limiting store (per isolate)
// Note: In production, use Redis or database for distributed rate limiting
const rateLimitStore = new Map<string, { attempts: number; lastAttempt: number; lockedUntil: number }>();

const RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  lockoutMs: 30 * 60 * 1000, // 30 minutes after max failures
};

// Check and update rate limit for a user
function checkRateLimit(userId: string): { allowed: boolean; remainingAttempts: number; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(userId);

  // Clean up old records
  if (record && now - record.lastAttempt > RATE_LIMIT_CONFIG.windowMs) {
    rateLimitStore.delete(userId);
    return { allowed: true, remainingAttempts: RATE_LIMIT_CONFIG.maxAttempts };
  }

  // Check if user is locked out
  if (record && record.lockedUntil > now) {
    const retryAfter = Math.ceil((record.lockedUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfter };
  }

  // Check attempts within window
  if (record && record.attempts >= RATE_LIMIT_CONFIG.maxAttempts) {
    // Lock the user out
    record.lockedUntil = now + RATE_LIMIT_CONFIG.lockoutMs;
    rateLimitStore.set(userId, record);
    const retryAfter = Math.ceil(RATE_LIMIT_CONFIG.lockoutMs / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfter };
  }

  const remainingAttempts = record 
    ? RATE_LIMIT_CONFIG.maxAttempts - record.attempts 
    : RATE_LIMIT_CONFIG.maxAttempts;
  
  return { allowed: true, remainingAttempts };
}

// Record a failed attempt
function recordFailedAttempt(userId: string): void {
  const now = Date.now();
  const record = rateLimitStore.get(userId) || { attempts: 0, lastAttempt: now, lockedUntil: 0 };
  
  record.attempts += 1;
  record.lastAttempt = now;
  
  if (record.attempts >= RATE_LIMIT_CONFIG.maxAttempts) {
    record.lockedUntil = now + RATE_LIMIT_CONFIG.lockoutMs;
  }
  
  rateLimitStore.set(userId, record);
}

// Clear rate limit on successful verification
function clearRateLimit(userId: string): void {
  rateLimitStore.delete(userId);
}

// Constant-time string comparison to prevent timing attacks
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

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

// Verify TOTP with window for clock drift - uses constant-time comparison
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
    // Use constant-time comparison to prevent timing attacks
    if (constantTimeEqual(expectedCode, code)) {
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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Client for reading user data
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Admin client for updating user metadata
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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
    const body = await req.json();
    const { action, code, secret } = body;

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
      // Check rate limit before processing verification
      const rateLimit = checkRateLimit(userId);
      if (!rateLimit.allowed) {
        console.log(`Rate limit exceeded for user ${userId}. Retry after ${rateLimit.retryAfter} seconds`);
        return new Response(
          JSON.stringify({ 
            error: 'Too many failed attempts. Please try again later.',
            retryAfter: rateLimit.retryAfter 
          }),
          { 
            status: 429, 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Retry-After': String(rateLimit.retryAfter)
            } 
          }
        );
      }

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
      
      if (isValid) {
        // Clear rate limit on successful verification
        clearRateLimit(userId);
        console.log(`TOTP verification successful for user ${userId}`);
      } else {
        // Record failed attempt
        recordFailedAttempt(userId);
        const updatedLimit = checkRateLimit(userId);
        console.log(`TOTP verification failed for user ${userId}. Remaining attempts: ${updatedLimit.remainingAttempts}`);
      }
      
      return new Response(
        JSON.stringify({ valid: isValid }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'enable') {
      // Check rate limit for enable action too (uses code verification)
      const rateLimit = checkRateLimit(userId);
      if (!rateLimit.allowed) {
        console.log(`Rate limit exceeded for user ${userId} during enable`);
        return new Response(
          JSON.stringify({ 
            error: 'Too many failed attempts. Please try again later.',
            retryAfter: rateLimit.retryAfter 
          }),
          { 
            status: 429, 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Retry-After': String(rateLimit.retryAfter)
            } 
          }
        );
      }

      if (!code || !secret) {
        return new Response(
          JSON.stringify({ error: 'Code and secret are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify the code first
      const isValid = await verifyTOTP(secret, code);
      
      if (!isValid) {
        // Record failed attempt
        recordFailedAttempt(userId);
        const updatedLimit = checkRateLimit(userId);
        console.log(`TOTP enable verification failed for user ${userId}. Remaining attempts: ${updatedLimit.remainingAttempts}`);
        
        return new Response(
          JSON.stringify({ error: 'Invalid code', enabled: false }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Clear rate limit on successful verification
      clearRateLimit(userId);

      // Store the secret in user metadata using admin client
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { 
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
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { 
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