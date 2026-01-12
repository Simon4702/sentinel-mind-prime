import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CommandRequest {
  toolId: string;
  command: string;
  target?: string;
  options?: Record<string, any>;
}

// Input validation constants
const MAX_COMMAND_LENGTH = 500;
const MAX_TARGET_LENGTH = 255;
const MAX_TOOL_ID_LENGTH = 50;

// Allowed tool IDs (whitelist)
const ALLOWED_TOOL_IDS = [
  'nmap', 'metasploit', 'wireshark', 'burp', 'snort', 'osquery',
  'hashcat', 'autopsy', 'volatility', 'zeek', 'misp', 'kali',
  'virustotal', 'abuseipdb', 'shodan'
];

// Validation patterns
const VALID_IP_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const VALID_DOMAIN_REGEX = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
const VALID_HASH_REGEX = /^[a-fA-F0-9]{32,64}$/;
const VALID_CIDR_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/;

// Characters to sanitize from commands (prevent shell injection)
const DANGEROUS_CHARS_REGEX = /[;&|`$(){}[\]<>\\!]/g;

function validateAndSanitizeInput(input: string, maxLength: number): { valid: boolean; sanitized: string; error?: string } {
  if (!input || typeof input !== 'string') {
    return { valid: false, sanitized: '', error: 'Input is required and must be a string' };
  }
  
  if (input.length > maxLength) {
    return { valid: false, sanitized: '', error: `Input exceeds maximum length of ${maxLength} characters` };
  }
  
  // Remove dangerous characters
  const sanitized = input.replace(DANGEROUS_CHARS_REGEX, '').trim();
  
  return { valid: true, sanitized };
}

function validateTarget(target: string): { valid: boolean; type: 'ip' | 'domain' | 'hash' | 'cidr' | 'search'; error?: string } {
  if (!target || typeof target !== 'string') {
    return { valid: true, type: 'search' }; // Target is optional for some tools
  }
  
  if (target.length > MAX_TARGET_LENGTH) {
    return { valid: false, type: 'search', error: `Target exceeds maximum length of ${MAX_TARGET_LENGTH} characters` };
  }
  
  // Check for dangerous characters in target
  if (DANGEROUS_CHARS_REGEX.test(target)) {
    return { valid: false, type: 'search', error: 'Target contains invalid characters' };
  }
  
  // Determine target type
  if (VALID_IP_REGEX.test(target)) {
    return { valid: true, type: 'ip' };
  }
  if (VALID_CIDR_REGEX.test(target)) {
    return { valid: true, type: 'cidr' };
  }
  if (VALID_HASH_REGEX.test(target)) {
    return { valid: true, type: 'hash' };
  }
  if (VALID_DOMAIN_REGEX.test(target)) {
    return { valid: true, type: 'domain' };
  }
  
  // Generic search query (for Shodan searches, etc.)
  return { valid: true, type: 'search' };
}

function validateToolId(toolId: string): { valid: boolean; error?: string } {
  if (!toolId || typeof toolId !== 'string') {
    return { valid: false, error: 'Tool ID is required' };
  }
  
  if (toolId.length > MAX_TOOL_ID_LENGTH) {
    return { valid: false, error: 'Invalid tool ID' };
  }
  
  if (!ALLOWED_TOOL_IDS.includes(toolId.toLowerCase())) {
    return { valid: false, error: `Tool '${toolId}' is not available. Allowed tools: ${ALLOWED_TOOL_IDS.join(', ')}` };
  }
  
  return { valid: true };
}

// Real API integrations
async function queryVirusTotal(target: string, queryType: 'ip' | 'domain' | 'hash'): Promise<string> {
  const apiKey = Deno.env.get('VIRUSTOTAL_API_KEY');
  if (!apiKey) {
    return "Error: VIRUSTOTAL_API_KEY not configured. Please add your API key in project settings.";
  }

  try {
    let endpoint = '';
    if (queryType === 'ip') {
      endpoint = `https://www.virustotal.com/api/v3/ip_addresses/${target}`;
    } else if (queryType === 'domain') {
      endpoint = `https://www.virustotal.com/api/v3/domains/${target}`;
    } else if (queryType === 'hash') {
      endpoint = `https://www.virustotal.com/api/v3/files/${target}`;
    }

    const response = await fetch(endpoint, {
      headers: { 'x-apikey': apiKey }
    });

    if (!response.ok) {
      if (response.status === 404) return `[VirusTotal] No data found for: ${target}`;
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const stats = data.data?.attributes?.last_analysis_stats || {};
    const reputation = data.data?.attributes?.reputation || 'N/A';
    
    return `[VirusTotal] Analysis for: ${target}
=====================================
Type: ${queryType.toUpperCase()}
Reputation Score: ${reputation}

Detection Stats:
  ✗ Malicious: ${stats.malicious || 0}
  ⚠ Suspicious: ${stats.suspicious || 0}
  ✓ Harmless: ${stats.harmless || 0}
  ? Undetected: ${stats.undetected || 0}

Last Analysis: ${data.data?.attributes?.last_analysis_date ? new Date(data.data.attributes.last_analysis_date * 1000).toISOString() : 'N/A'}
${stats.malicious > 0 ? '\n⚠️  WARNING: This indicator has been flagged as MALICIOUS!' : ''}`;
  } catch (error) {
    console.error('VirusTotal API error:', error);
    return `[VirusTotal] Error querying API: ${error.message}`;
  }
}

async function queryAbuseIPDB(ip: string): Promise<string> {
  const apiKey = Deno.env.get('ABUSEIPDB_API_KEY');
  if (!apiKey) {
    return "Error: ABUSEIPDB_API_KEY not configured. Please add your API key in project settings.";
  }

  try {
    const response = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90&verbose`, {
      headers: {
        'Key': apiKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.data;

    return `[AbuseIPDB] IP Reputation Report for: ${ip}
=====================================
Abuse Confidence Score: ${result.abuseConfidenceScore}%
Total Reports: ${result.totalReports}
Country: ${result.countryCode || 'Unknown'}
ISP: ${result.isp || 'Unknown'}
Domain: ${result.domain || 'N/A'}
Usage Type: ${result.usageType || 'Unknown'}
Is Tor: ${result.isTor ? 'Yes ⚠️' : 'No'}
Is Public Proxy: ${result.isPublicProxy ? 'Yes ⚠️' : 'No'}
Last Reported: ${result.lastReportedAt || 'Never'}

${result.abuseConfidenceScore > 50 ? '⚠️  WARNING: HIGH ABUSE CONFIDENCE - This IP has been reported for malicious activity!' : result.abuseConfidenceScore > 0 ? '⚡ CAUTION: This IP has some abuse reports.' : '✓ This IP appears clean.'}`;
  } catch (error) {
    console.error('AbuseIPDB API error:', error);
    return `[AbuseIPDB] Error querying API: ${error.message}`;
  }
}

async function queryShodan(target: string, queryType: 'ip' | 'search'): Promise<string> {
  const apiKey = Deno.env.get('SHODAN_API_KEY');
  if (!apiKey) {
    return "Error: SHODAN_API_KEY not configured. Please add your API key in project settings.";
  }

  try {
    let endpoint = '';
    if (queryType === 'ip') {
      endpoint = `https://api.shodan.io/shodan/host/${target}?key=${apiKey}`;
    } else {
      endpoint = `https://api.shodan.io/shodan/host/search?key=${apiKey}&query=${encodeURIComponent(target)}`;
    }

    const response = await fetch(endpoint);

    if (!response.ok) {
      if (response.status === 404) return `[Shodan] No data found for: ${target}`;
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();

    if (queryType === 'ip') {
      const ports = data.ports?.join(', ') || 'None detected';
      const vulns = data.vulns ? Object.keys(data.vulns).slice(0, 10).join(', ') : 'None detected';
      
      return `[Shodan] Host Intelligence for: ${target}
=====================================
Organization: ${data.org || 'Unknown'}
ISP: ${data.isp || 'Unknown'}
Country: ${data.country_name || 'Unknown'} (${data.country_code || 'N/A'})
City: ${data.city || 'Unknown'}
OS: ${data.os || 'Unknown'}
Last Update: ${data.last_update || 'N/A'}

Open Ports: ${ports}
Hostnames: ${data.hostnames?.join(', ') || 'None'}

${data.vulns ? `⚠️  VULNERABILITIES DETECTED:
${vulns}
${Object.keys(data.vulns).length > 10 ? `... and ${Object.keys(data.vulns).length - 10} more` : ''}` : '✓ No known vulnerabilities detected'}

Services:
${data.data?.slice(0, 5).map((s: any) => `  - Port ${s.port}: ${s.product || 'Unknown'} ${s.version || ''}`).join('\n') || '  No service data available'}`;
    } else {
      const total = data.total || 0;
      const matches = data.matches?.slice(0, 5) || [];
      
      return `[Shodan] Search Results for: ${target}
=====================================
Total Results: ${total}

Top Matches:
${matches.map((m: any, i: number) => `  ${i + 1}. ${m.ip_str} (${m.org || 'Unknown'})
     Port: ${m.port} | Country: ${m.location?.country_name || 'Unknown'}`).join('\n') || '  No matches found'}`;
    }
  } catch (error) {
    console.error('Shodan API error:', error);
    return `[Shodan] Error querying API: ${error.message}`;
  }
}

// Tool simulators for tools without APIs
const toolSimulators: Record<string, (cmd: string, target?: string) => Promise<string>> = {
  nmap: async (cmd: string, target?: string) => {
    const targetHost = target || "192.168.1.0/24";
    await new Promise(r => setTimeout(r, 1500));
    
    if (cmd.includes("-sS") || cmd.includes("-sV")) {
      return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for ${targetHost}
Host is up (0.0024s latency).

PORT      STATE    SERVICE       VERSION
22/tcp    open     ssh           OpenSSH 8.9p1
80/tcp    open     http          nginx 1.24.0
443/tcp   open     https         nginx 1.24.0
3306/tcp  filtered mysql
8080/tcp  open     http-proxy    

Nmap done: 1 IP address (1 host up) scanned in 4.23 seconds`;
    }
    
    if (cmd.includes("--script vuln")) {
      return `Starting Nmap 7.94 vulnerability scan for ${targetHost}

| http-vuln-cve2017-5638: 
|   VULNERABLE:
|   Apache Struts Remote Code Execution
|_    Risk factor: High

| ssl-poodle: 
|   VULNERABLE:
|   SSL POODLE information leak
|_    Risk factor: Medium

Nmap done: 1 IP address scanned in 12.45 seconds`;
    }
    
    return `Nmap scan completed for ${targetHost}\n256 hosts scanned, 12 hosts up`;
  },

  metasploit: async (cmd: string) => {
    await new Promise(r => setTimeout(r, 2000));
    
    if (cmd.includes("search")) {
      return `Matching Modules
================
   0  exploit/multi/http/apache_mod_cgi_bash_env_exec  excellent
   1  exploit/unix/webapp/wp_admin_shell_upload        excellent
   2  exploit/multi/handler                            manual
   3  auxiliary/scanner/ssh/ssh_login                  normal

   Total: 4 matching modules`;
    }
    
    return `[*] Metasploit Framework v6.3.44
[*] Command executed: ${cmd}`;
  },

  wireshark: async (cmd: string) => {
    await new Promise(r => setTimeout(r, 1000));
    
    if (cmd.includes("capture")) {
      return `Capturing on 'eth0'
   1 0.000000    192.168.1.100 → 8.8.8.8      DNS 74 Standard query A google.com
   2 0.023456    8.8.8.8 → 192.168.1.100      DNS 90 Standard query response
   3 0.024123    192.168.1.100 → 142.250.80.46  TCP 66 [SYN]
   4 0.045678    142.250.80.46 → 192.168.1.100  TCP 66 [SYN, ACK]

Packets captured: 4`;
    }
    
    return `Wireshark: ${cmd}\nCapture ready`;
  },

  burp: async (cmd: string, target?: string) => {
    await new Promise(r => setTimeout(r, 1800));
    
    if (cmd.includes("spider") || cmd.includes("scan")) {
      return `[BURP SUITE PRO] Active Scan
Target: ${target || 'https://target.example.com'}

VULNERABILITIES DETECTED:
[HIGH] SQL Injection - /api/users?id=1
[HIGH] Stored XSS - /comments (POST body)
[MEDIUM] CSRF - /account/settings
[LOW] Missing X-Frame-Options header

Issues Found: 4 (2 High, 1 Medium, 1 Low)`;
    }
    
    return `[BURP] ${cmd}`;
  },

  snort: async (cmd: string) => {
    await new Promise(r => setTimeout(r, 800));
    
    return `Snort 3.1.58.0-1 - Network IDS
[*] Loaded 31,456 rules
[*] Starting packet capture...

[**] [1:2100498:7] GPL ATTACK_RESPONSE id check returned root [**]
[Classification: Potentially Bad Traffic] [Priority: 2]

Alerts: 1 | Packets: 15,432`;
  },

  osquery: async (cmd: string) => {
    await new Promise(r => setTimeout(r, 600));
    
    if (cmd.includes("processes")) {
      return `+-------+----------------+------+--------+
| pid   | name           | uid  | state  |
+-------+----------------+------+--------+
| 1     | systemd        | 0    | S      |
| 423   | sshd           | 0    | S      |
| 892   | nginx          | 33   | S      |
| 2341  | suspicious.sh  | 0    | R      |
+-------+----------------+------+--------+
⚠️  WARNING: Process 'suspicious.sh' running as root`;
    }
    
    if (cmd.includes("listening_ports")) {
      return `+-------+------+----------+
| pid   | port | protocol |
+-------+------+----------+
| 423   | 22   | tcp      |
| 892   | 80   | tcp      |
| 892   | 443  | tcp      |
+-------+------+----------+`;
    }
    
    return `osquery> ${cmd}\nQuery executed`;
  },

  hashcat: async (cmd: string) => {
    await new Promise(r => setTimeout(r, 2500));
    
    return `hashcat (v6.2.6)
Speed.#1.........:  5847.3 MH/s
Recovered........: 3/5 (60.00%)

5d41402abc4b2a76b9719d911017c592:hello
098f6bcd4621d373cade4e832627b4f6:test
e10adc3949ba59abbe56e057f20f883e:123456`;
  },

  autopsy: async (cmd: string) => {
    await new Promise(r => setTimeout(r, 1200));
    
    return `[Autopsy 4.21.0] Digital Forensics
✓ Hash Lookup (NSRL) - 15,432 known files
✓ Email Parser - 234 emails extracted
⚠ Encryption Detection - 3 encrypted volumes

TIMELINE:
- 2024-03-10 14:23:15 - USB connected
- 2024-03-10 14:25:47 - sensitive_data.xlsx accessed
- 2024-03-10 14:28:33 - Large file copy detected`;
  },

  volatility: async (cmd: string) => {
    await new Promise(r => setTimeout(r, 1500));
    
    if (cmd.includes("pslist")) {
      return `Volatility 3 Framework 3.0.0
PID     PPID    ImageFileName
4       0       System
368     4       smss.exe
1456    608     suspicious.exe  [SUSPICIOUS]

⚠ suspicious.exe - unusual parent process`;
    }
    
    if (cmd.includes("netscan")) {
      return `Volatility 3 Framework 3.0.0
Proto   LocalAddr       ForeignAddr     State       PID
TCPv4   0.0.0.0:135     0.0.0.0:0       LISTENING   684
TCPv4   192.168.1.50:4444   185.234.72.10:8080  ESTABLISHED  1456

⚠ Connection to 185.234.72.10:8080 flagged as C2`;
    }
    
    return `Volatility 3: ${cmd}`;
  },

  zeek: async (cmd: string) => {
    await new Promise(r => setTimeout(r, 900));
    
    return `[Zeek 6.2.0] Network Monitor
Status: Running

Connection Log:
192.168.1.50:52847   142.250.80.46:443     tcp   ssl
192.168.1.50:52848   8.8.8.8:53            udp   dns
185.234.72.10:8080   192.168.1.50:4444     tcp   -

NOTICE: Potentially malicious traffic detected
src: 185.234.72.10 → dst: 192.168.1.50:4444`;
  },

  misp: async (cmd: string) => {
    await new Promise(r => setTimeout(r, 700));
    
    if (cmd.includes("sync")) {
      return `[MISP 2.4.183] Threat Intelligence
Synchronizing feeds...

✓ CIRCL OSINT Feed - 1,234 new indicators
✓ Abuse.ch URLhaus - 567 new URLs
✓ AlienVault OTX - 892 new IOCs

Total synchronized: 2,693 indicators`;
    }
    
    return `[MISP] ${cmd}`;
  },

  kali: async (cmd: string, target?: string) => {
    await new Promise(r => setTimeout(r, 1000));
    
    if (cmd.includes("aircrack")) {
      return `Aircrack-ng 1.7
[00:00:15] 52341 keys tested

KEY FOUND! [ s3cur1tyK3y2024 ]`;
    }
    
    if (cmd.includes("hydra")) {
      return `Hydra v9.5
[22][ssh] host: ${target || '192.168.1.50'}   login: admin   password: P@ssw0rd123
1 valid password found`;
    }
    
    return `┌──(kali㉿kali)-[~]
└─$ ${cmd}
Executed`;
  },

  // New real API integrations
  virustotal: async (cmd: string, target?: string) => {
    if (!target) {
      return "[VirusTotal] Error: Please provide a target (IP, domain, or hash) to analyze.";
    }
    
    // Determine query type
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const hashRegex = /^[a-fA-F0-9]{32,64}$/;
    
    let queryType: 'ip' | 'domain' | 'hash';
    if (ipRegex.test(target)) {
      queryType = 'ip';
    } else if (hashRegex.test(target)) {
      queryType = 'hash';
    } else {
      queryType = 'domain';
    }
    
    return await queryVirusTotal(target, queryType);
  },

  abuseipdb: async (cmd: string, target?: string) => {
    if (!target) {
      return "[AbuseIPDB] Error: Please provide an IP address to check.";
    }
    
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(target)) {
      return "[AbuseIPDB] Error: Invalid IP address format. Please provide a valid IPv4 address.";
    }
    
    return await queryAbuseIPDB(target);
  },

  shodan: async (cmd: string, target?: string) => {
    if (!target) {
      return "[Shodan] Error: Please provide an IP address or search query.";
    }
    
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const queryType: 'ip' | 'search' = ipRegex.test(target) ? 'ip' : 'search';
    
    return await queryShodan(target, queryType);
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, organization_id')
      .eq('user_id', user.id)
      .single();

    if (!profile || !['admin', 'security_analyst'].includes(profile.role)) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions. Security analyst role required.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: CommandRequest = await req.json();
    const { toolId, command, target } = body;

    // Validate toolId
    const toolValidation = validateToolId(toolId);
    if (!toolValidation.valid) {
      return new Response(JSON.stringify({ 
        error: toolValidation.error,
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate and sanitize command
    const commandValidation = validateAndSanitizeInput(command, MAX_COMMAND_LENGTH);
    if (!commandValidation.valid) {
      return new Response(JSON.stringify({ 
        error: `Invalid command: ${commandValidation.error}`,
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const sanitizedCommand = commandValidation.sanitized;

    // Validate target if provided
    let sanitizedTarget: string | undefined = undefined;
    if (target) {
      const targetValidation = validateTarget(target);
      if (!targetValidation.valid) {
        return new Response(JSON.stringify({ 
          error: `Invalid target: ${targetValidation.error}`,
          success: false 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      // Sanitize target
      const targetSanitization = validateAndSanitizeInput(target, MAX_TARGET_LENGTH);
      if (targetSanitization.valid) {
        sanitizedTarget = targetSanitization.sanitized;
      }
    }

    console.log(`[CYBER-ARSENAL] User ${user.email} executing ${toolId}: ${sanitizedCommand} ${sanitizedTarget ? `-> ${sanitizedTarget}` : ''}`);

    const simulator = toolSimulators[toolId.toLowerCase()];
    if (!simulator) {
      return new Response(JSON.stringify({ 
        error: `Tool '${toolId}' not available`,
        availableTools: Object.keys(toolSimulators)
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const output = await simulator(sanitizedCommand, sanitizedTarget);

    // Parse results for threat intel tools and store in database
    let scanRecord = null;
    const normalizedToolId = toolId.toLowerCase();
    if (['virustotal', 'abuseipdb', 'shodan'].includes(normalizedToolId) && sanitizedTarget) {
      // Use the validated target type from earlier validation
      const targetValidation = validateTarget(sanitizedTarget);
      let targetType = targetValidation.type === 'search' ? 'domain' : targetValidation.type;
      if (targetType === 'cidr') targetType = 'ip'; // Treat CIDR as IP type for storage
      
      // Parse output for risk indicators
      let riskScore = 0;
      let isMalicious = false;
      let tags: string[] = [];
      
      if (normalizedToolId === 'virustotal') {
        const maliciousMatch = output.match(/Malicious:\s*(\d+)/);
        const suspiciousMatch = output.match(/Suspicious:\s*(\d+)/);
        if (maliciousMatch) {
          const malCount = parseInt(maliciousMatch[1]);
          riskScore = Math.min(100, malCount * 5);
          isMalicious = malCount > 0;
          if (isMalicious) tags.push('malicious');
        }
        if (suspiciousMatch && parseInt(suspiciousMatch[1]) > 0) tags.push('suspicious');
        tags.push('virustotal');
      } else if (normalizedToolId === 'abuseipdb') {
        const scoreMatch = output.match(/Abuse Confidence Score:\s*(\d+)%/);
        const reportsMatch = output.match(/Total Reports:\s*(\d+)/);
        if (scoreMatch) {
          riskScore = parseInt(scoreMatch[1]);
          isMalicious = riskScore > 50;
        }
        if (reportsMatch && parseInt(reportsMatch[1]) > 0) tags.push('reported');
        if (output.includes('Is Tor: Yes')) tags.push('tor');
        if (output.includes('Is Public Proxy: Yes')) tags.push('proxy');
        tags.push('abuseipdb');
      } else if (normalizedToolId === 'shodan') {
        if (output.includes('VULNERABILITIES DETECTED')) {
          isMalicious = false; // Vulns don't mean malicious
          const vulnMatch = output.match(/VULNERABILITIES DETECTED:\s*\n([\s\S]*?)(?=\n\n|Services:)/);
          if (vulnMatch) {
            const vulnList = vulnMatch[1].trim().split(/,\s*/);
            riskScore = Math.min(100, vulnList.length * 10);
            tags.push('vulnerable');
          }
        }
        const portsMatch = output.match(/Open Ports:\s*(.+)/);
        if (portsMatch && portsMatch[1] !== 'None detected') {
          const ports = portsMatch[1].split(',').length;
          riskScore = Math.max(riskScore, ports * 5);
        }
        tags.push('shodan');
      }

      // Store scan result
      const { data: insertedScan, error: scanError } = await supabase
        .from('cyber_arsenal_scans')
        .insert({
          organization_id: profile.organization_id,
          user_id: user.id,
          tool_name: normalizedToolId,
          target: sanitizedTarget,
          target_type: targetType,
          scan_result: { raw_output: output, parsed_at: new Date().toISOString() },
          risk_score: riskScore,
          is_malicious: isMalicious,
          tags: tags,
        })
        .select()
        .single();

      if (scanError) {
        console.error('[CYBER-ARSENAL] Error storing scan:', scanError);
      } else {
        scanRecord = insertedScan;
        console.log('[CYBER-ARSENAL] Scan stored:', insertedScan?.id);
      }
    }

    if (profile.organization_id) {
      await supabase.from('audit_logs').insert({
        organization_id: profile.organization_id,
        user_id: user.id,
        action: 'cyber_tool_execution',
        resource_type: 'cyber_arsenal',
        resource_id: normalizedToolId,
        details: { 
          command: sanitizedCommand, 
          target: sanitizedTarget, 
          output_length: output.length, 
          scan_id: scanRecord?.id 
        },
        result: 'success',
      });
    }

    return new Response(JSON.stringify({
      success: true,
      toolId: normalizedToolId,
      command: sanitizedCommand,
      target: sanitizedTarget,
      output,
      scanId: scanRecord?.id,
      timestamp: new Date().toISOString(),
      executedBy: user.email,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[CYBER-ARSENAL] Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
