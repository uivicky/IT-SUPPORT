export interface SimulatedCommandResult {
  recognized: boolean;
  canonicalKey: string;
  clearScreen?: boolean;
  shellLabel: 'Windows CMD' | 'PowerShell' | 'Linux Bash' | 'Simulator';
  output: string;
  meaningBreakdown: string[];
  safetyNote?: string;
}

export const PRACTICE_TERMINAL_SUGGESTIONS: string[] = [
  'ipconfig',
  'ipconfig /flushdns',
  'ping 8.8.8.8',
  'nslookup microsoft.com',
  'tracert 1.1.1.1',
  'sfc /scannow',
  'netstat -ano',
  'whoami',
  'Test-NetConnection portal.corp.local -Port 443',
  'Get-ADUser jsmith',
  'df -h',
  'free -h',
];

export function executeSimulatedCommand(rawInput: string): SimulatedCommandResult {
  const trimmed = rawInput.trim();
  const lower = trimmed.toLowerCase().replace(/\s+/g, ' ');

  if (!lower) {
    return {
      recognized: false,
      canonicalKey: '',
      shellLabel: 'Simulator',
      output: 'Type a command (for example: ipconfig, ping 8.8.8.8, df -h, or help) and press Enter.',
      meaningBreakdown: [],
    };
  }

  if (lower === 'clear' || lower === 'cls') {
    return {
      recognized: true,
      canonicalKey: 'clear',
      clearScreen: true,
      shellLabel: 'Simulator',
      output: '',
      meaningBreakdown: [],
    };
  }

  if (lower === 'help') {
    return {
      recognized: true,
      canonicalKey: 'help',
      shellLabel: 'Simulator',
      output: [
        '=== IT SUPPORT SAFE PRACTICE TERMINAL (SIMULATED) ===',
        'Try typing or clicking any of these real IT Support commands:',
        '  ipconfig              -> View IPv4 address, Subnet Mask & Default Gateway',
        '  ipconfig /all         -> View MAC address, DHCP server & DNS servers',
        '  ipconfig /flushdns    -> Clear local DNS cache when websites fail to resolve',
        '  ping 8.8.8.8          -> Test internet reachability & packet loss',
        '  tracert 1.1.1.1       -> Trace router hops along the network path',
        '  nslookup google.com   -> Test DNS name-to-IP resolution',
        '  netstat -ano          -> List active network ports and Process IDs (PIDs)',
        '  sfc /scannow          -> Scan and repair corrupted Windows system files',
        '  whoami                -> Show current logged-in domain\\username',
        '  Test-NetConnection    -> Test TCP firewall port reachability in PowerShell',
        '  Get-ADUser jsmith     -> Inspect Active Directory account lockouts',
        '  df -h                 -> Check Linux disk usage in human-readable GB',
        '  free -h               -> Check Linux RAM and available memory',
        '  clear / cls           -> Clear practice terminal history',
      ].join('\n'),
      meaningBreakdown: [
        'This sandbox simulates real Windows, PowerShell, and Linux outputs safely in your browser.',
        'Nothing runs on your real device—experiment freely to build muscle memory!',
      ],
    };
  }

  if (lower === 'ipconfig') {
    return {
      recognized: true,
      canonicalKey: 'ipconfig',
      shellLabel: 'Windows CMD',
      output: [
        'Windows IP Configuration',
        '',
        'Wireless LAN adapter Wi-Fi:',
        '   Connection-specific DNS Suffix  . : corp.local',
        '   IPv4 Address. . . . . . . . . . . : 192.168.10.45',
        '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
        '   Default Gateway . . . . . . . . . : 192.168.10.1',
      ].join('\n'),
      meaningBreakdown: [
        'IPv4 Address (192.168.10.45): Your laptop has a healthy private IP (not a broken 169.254.x.x APIPA address).',
        'Subnet Mask (255.255.255.0): Means /24 network—devices from 192.168.10.1 to .254 are in your local room/VLAN.',
        'Default Gateway (192.168.10.1): Your local router IP. Ping this first if the internet stops working!',
      ],
    };
  }

  if (lower === 'ipconfig /all') {
    return {
      recognized: true,
      canonicalKey: 'ipconfig /all',
      shellLabel: 'Windows CMD',
      output: [
        'Wireless LAN adapter Wi-Fi:',
        '   Description . . . . . . . . . . . : Intel(R) Wi-Fi 6E AX211 160MHz',
        '   Physical Address. . . . . . . . . : 3C-52-82-9A-1F-B4',
        '   DHCP Enabled. . . . . . . . . . . : Yes',
        '   IPv4 Address. . . . . . . . . . . : 192.168.10.45(Preferred)',
        '   DHCP Server . . . . . . . . . . . : 192.168.10.10',
        '   DNS Servers . . . . . . . . . . . : 192.168.10.10',
        '                                       192.168.10.11',
      ].join('\n'),
      meaningBreakdown: [
        'Physical Address (3C-52-82-9A-1F-B4): Your hardware MAC address used by switches and WiFi access points.',
        'DHCP Server (192.168.10.10): The server that automatically leased your IP address.',
        'DNS Servers (.10 & .11): Internal Active Directory DNS servers translating names into IP addresses.',
      ],
    };
  }

  if (lower === 'ipconfig /flushdns') {
    return {
      recognized: true,
      canonicalKey: 'ipconfig /flushdns',
      shellLabel: 'Windows CMD',
      output: [
        'Windows IP Configuration',
        '',
        'Successfully flushed the DNS Resolver Cache.',
      ].join('\n'),
      meaningBreakdown: [
        'Clears old or poisoned website IP lookups stored in Windows memory.',
        'Safe to run anytime—it does not disconnect active downloads or VPN calls.',
      ],
    };
  }

  if (lower === 'ipconfig /renew' || lower === 'ipconfig /release') {
    return {
      recognized: true,
      canonicalKey: 'ipconfig /renew',
      shellLabel: 'Windows CMD',
      output: [
        'Windows IP Configuration',
        '',
        'Wireless LAN adapter Wi-Fi:',
        '   IPv4 Address. . . . . . . . . . . : 192.168.10.48',
        '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
        '   Default Gateway . . . . . . . . . : 192.168.10.1',
      ].join('\n'),
      meaningBreakdown: [
        'Requests a fresh IPv4 lease from the DHCP server using the DORA handshake.',
        'Notice the IP updated to .48 cleanly.',
      ],
      safetyNote: 'Briefly pauses network connections for 1–3 seconds—never run ipconfig /release over a remote RDP session!',
    };
  }

  if (lower.startsWith('ping')) {
    const target = trimmed.split(/\s+/)[1] || '8.8.8.8';
    return {
      recognized: true,
      canonicalKey: 'ping',
      shellLabel: 'Windows CMD',
      output: [
        `Pinging ${target} with 32 bytes of data:`,
        `Reply from ${target}: bytes=32 time=14ms TTL=117`,
        `Reply from ${target}: bytes=32 time=13ms TTL=117`,
        `Reply from ${target}: bytes=32 time=15ms TTL=117`,
        `Reply from ${target}: bytes=32 time=14ms TTL=117`,
        '',
        `Ping statistics for ${target}:`,
        '    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),',
        'Approximate round trip times in milli-seconds:',
        '    Minimum = 13ms, Maximum = 15ms, Average = 14ms',
      ].join('\n'),
      meaningBreakdown: [
        '0% loss: Every test packet reached the destination and returned cleanly.',
        'time=14ms: Very healthy low latency (<30ms is crisp; >150ms feels laggy on video calls).',
        'Tip: Some secure servers block ICMP ping on purpose—use Test-NetConnection for specific TCP ports.',
      ],
    };
  }

  if (lower.startsWith('tracert') || lower.startsWith('traceroute')) {
    const target = trimmed.split(/\s+/)[1] || '1.1.1.1';
    return {
      recognized: true,
      canonicalKey: 'tracert',
      shellLabel: 'Windows CMD',
      output: [
        `Tracing route to ${target} over a maximum of 30 hops:`,
        '',
        '  1     2 ms     1 ms     1 ms  192.168.10.1   [Local Office Router]',
        '  2     9 ms     8 ms     9 ms  100.64.0.1     [ISP Regional Gateway]',
        '  3    13 ms    12 ms    13 ms  172.68.12.4    [Core Backbone Edge]',
        `  4    14 ms    14 ms    13 ms  ${target}      [Destination Reached]`,
        '',
        'Trace complete.',
      ].join('\n'),
      meaningBreakdown: [
        'Hop 1 (192.168.10.1): Confirms WiFi/Ethernet inside your building works (<2ms).',
        'Hops 2–3: Shows packets crossing your Internet Service Provider cleanly.',
        'If timeouts (* * *) start at Hop 1, the issue is inside your office; if at Hop 2+, contact your ISP!',
      ],
    };
  }

  if (lower.startsWith('nslookup')) {
    const domain = trimmed.split(/\s+/)[1] || 'microsoft.com';
    return {
      recognized: true,
      canonicalKey: 'nslookup',
      shellLabel: 'Windows CMD',
      output: [
        'Server:  dc01.corp.local',
        'Address:  192.168.10.10',
        '',
        'Non-authoritative answer:',
        `Name:    ${domain}`,
        'Addresses:  20.70.246.20',
        '            20.231.239.246',
      ].join('\n'),
      meaningBreakdown: [
        'Server (192.168.10.10): Tells you WHICH DNS server answered your question.',
        'Addresses (20.70.246.20): DNS successfully translated the human website name into routable IP addresses.',
      ],
    };
  }

  if (lower.startsWith('netstat')) {
    return {
      recognized: true,
      canonicalKey: 'netstat -ano',
      shellLabel: 'Windows CMD',
      output: [
        'Active Connections',
        '  Proto  Local Address          Foreign Address        State           PID',
        '  TCP    0.0.0.0:443            0.0.0.0:0              LISTENING       4120',
        '  TCP    0.0.0.0:3389           0.0.0.0:0              LISTENING       1188',
        '  TCP    192.168.10.45:52418    52.96.165.18:443       ESTABLISHED     8844',
      ].join('\n'),
      meaningBreakdown: [
        'LISTENING on :443 (PID 4120): Process 4120 is hosting an HTTPS web server on this machine.',
        'ESTABLISHED on :443 (PID 8844): Outlook or browser has an active encrypted cloud connection.',
        'Match the PID column in Task Manager -> Details to see the exact .exe program name!',
      ],
    };
  }

  if (lower.startsWith('sfc')) {
    return {
      recognized: true,
      canonicalKey: 'sfc /scannow',
      shellLabel: 'Windows CMD',
      output: [
        'Beginning system scan.  This process will take some time.',
        'Beginning verification phase of system scan.',
        'Verification 100% complete.',
        '',
        'Windows Resource Protection found corrupt files and successfully repaired them.',
        'Details are included in the CBS.Log windir\\Logs\\CBS\\CBS.log.',
      ].join('\n'),
      meaningBreakdown: [
        'System File Checker verified protected Windows .dll and .exe files and replaced damaged ones automatically.',
        'Pro Tip: If SFC ever says "unable to fix some of them", run DISM /Online /Cleanup-Image /RestoreHealth first!',
      ],
      safetyNote: 'Requires running Command Prompt as Administrator.',
    };
  }

  if (lower.startsWith('dism')) {
    return {
      recognized: true,
      canonicalKey: 'dism',
      shellLabel: 'Windows CMD',
      output: [
        'Deployment Image Servicing and Management tool',
        'Version: 10.0.22621.2792',
        '[==========================100.0%==========================]',
        'The restore operation completed successfully.',
        'The operation completed successfully.',
      ].join('\n'),
      meaningBreakdown: [
        'DISM repaired the underlying Windows Component Store (WinSxS) using healthy upstream files.',
        'Now running sfc /scannow right afterward is guaranteed to have clean source files.',
      ],
      safetyNote: 'Run from an Administrator terminal; takes 5–10 minutes on real PCs.',
    };
  }

  if (lower === 'whoami' || lower === 'whoami /all') {
    return {
      recognized: true,
      canonicalKey: 'whoami',
      shellLabel: 'Windows CMD',
      output: 'corp\\alex.rivera',
      meaningBreakdown: [
        'corp\\ is the Active Directory domain name; alex.rivera is the currently signed-in account.',
        'Use whoami /groups when troubleshooting why a user cannot open a restricted shared folder.',
      ],
    };
  }

  if (lower.startsWith('gpupdate')) {
    return {
      recognized: true,
      canonicalKey: 'gpupdate /force',
      shellLabel: 'Windows CMD',
      output: [
        'Updating policy...',
        'Computer Policy update has completed successfully.',
        'User Policy update has completed successfully.',
      ].join('\n'),
      meaningBreakdown: [
        'Pulled the latest Group Policy settings (mapped drives, printers, security rules) from the Domain Controller immediately instead of waiting 90 minutes.',
      ],
    };
  }

  if (lower.startsWith('test-netconnection') || lower.startsWith('tnc')) {
    return {
      recognized: true,
      canonicalKey: 'test-netconnection',
      shellLabel: 'PowerShell',
      output: [
        'ComputerName     : portal.corp.local',
        'RemoteAddress    : 10.20.1.15',
        'RemotePort       : 443',
        'InterfaceAlias   : Wi-Fi',
        'SourceAddress    : 192.168.10.45',
        'TcpTestSucceeded : True',
      ].join('\n'),
      meaningBreakdown: [
        'TcpTestSucceeded : True proves DNS worked, routing worked, the firewall allowed TCP 443, AND the web server answered!',
        'Much more reliable than ping when firewalls block ICMP.',
      ],
    };
  }

  if (lower.startsWith('get-aduser')) {
    return {
      recognized: true,
      canonicalKey: 'get-aduser',
      shellLabel: 'PowerShell',
      output: [
        'DistinguishedName : CN=Jordan Smith,OU=Finance,DC=corp,DC=local',
        'Enabled           : True',
        'LockedOut         : True',
        'PasswordExpired   : False',
        'SamAccountName    : jsmith',
      ].join('\n'),
      meaningBreakdown: [
        'LockedOut : True immediately reveals why Jordan cannot sign in—too many bad password attempts locked the account!',
        'Next step: Check Event ID 4740 on the PDC Emulator or unlock via Unlock-ADAccount -Identity jsmith.',
      ],
    };
  }

  if (lower.startsWith('get-service')) {
    return {
      recognized: true,
      canonicalKey: 'get-service',
      shellLabel: 'PowerShell',
      output: [
        'Status   Name               DisplayName',
        '------   ----               -----------',
        'Running  Dhcp               DHCP Client',
        'Running  Dnscache           DNS Client',
        'Stopped  Spooler            Print Spooler',
        'Running  wuauserv           Windows Update',
      ].join('\n'),
      meaningBreakdown: [
        'Notice Spooler is Stopped—that explains why no printers appear or print jobs fail!',
        'Start it with Start-Service Spooler in an elevated PowerShell window.',
      ],
    };
  }

  if (lower.startsWith('df')) {
    return {
      recognized: true,
      canonicalKey: 'df -h',
      shellLabel: 'Linux Bash',
      output: [
        'Filesystem      Size  Used Avail Use% Mounted on',
        '/dev/nvme0n1p2   80G   34G   42G  45% /',
        '/dev/nvme0n1p1  511M  6.1M  505M   2% /boot/efi',
        '/dev/sdf1       200G  196G  4.0G  98% /var/log',
      ].join('\n'),
      meaningBreakdown: [
        '-h formats sizes in human-readable Gigabytes (G) and Megabytes (M).',
        'Look at /var/log at 98% Use%—log files are nearly filling that partition and need rotation!',
      ],
    };
  }

  if (lower.startsWith('free')) {
    return {
      recognized: true,
      canonicalKey: 'free -h',
      shellLabel: 'Linux Bash',
      output: [
        '               total        used        free      shared  buff/cache   available',
        'Mem:           15Gi       4.2Gi       2.1Gi       180Mi       9.1Gi        10Gi',
        'Swap:          4.0Gi          0B       4.0Gi',
      ].join('\n'),
      meaningBreakdown: [
        'Always read the "available" column (10Gi), NOT the "free" column (2.1Gi)!',
        'Linux uses spare RAM for fast disk cache (buff/cache = 9.1Gi) and gives it back to apps instantly when needed.',
      ],
    };
  }

  if (lower.startsWith('systemctl') || lower.startsWith('journalctl')) {
    return {
      recognized: true,
      canonicalKey: lower.startsWith('systemctl') ? 'systemctl' : 'journalctl',
      shellLabel: 'Linux Bash',
      output: [
        '● nginx.service - A high performance web server and a reverse proxy server',
        '     Loaded: loaded (/lib/systemd/system/nginx.service; enabled)',
        '     Active: active (running) since Mon 2025-05-12 08:14:22 UTC; 6h ago',
        '   Main PID: 1492 (nginx)',
      ].join('\n'),
      meaningBreakdown: [
        'enabled means Nginx starts automatically when the Linux server reboots.',
        'active (running) confirms the web service process (PID 1492) is healthy right now.',
      ],
    };
  }

  return {
    recognized: false,
    canonicalKey: '',
    shellLabel: 'Simulator',
    output: [
      `'${trimmed}' is not in the quick simulator preset list yet.`,
      'Type "help" to view 15+ supported Windows, PowerShell, Active Directory, and Linux practice commands!',
    ].join('\n'),
    meaningBreakdown: [
      'Try clicking one of the quick-run chips above the terminal, such as ipconfig, ping 8.8.8.8, Test-NetConnection, or df -h.',
    ],
  };
}
