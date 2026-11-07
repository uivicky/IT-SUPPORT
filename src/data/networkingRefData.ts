export interface PortEntry {
  port: number;
  protocol: 'TCP' | 'UDP' | 'TCP/UDP';
  service: string;
  usage: string;
  securityNote: string;
}

export const COMMON_PORTS: PortEntry[] = [
  { port: 20, protocol: 'TCP', service: 'FTP Data', usage: 'Legacy active FTP data channel', securityNote: 'Cleartext—replace with SFTP (22) or HTTPS.' },
  { port: 21, protocol: 'TCP', service: 'FTP Control', usage: 'Legacy File Transfer Protocol control', securityNote: 'Sends credentials in cleartext; use SFTP/FTPS.' },
  { port: 22, protocol: 'TCP', service: 'SSH / SFTP / SCP', usage: 'Encrypted remote shell & file transfer', securityNote: 'Disable password auth; enforce Ed25519/RSA keys + VPN/Bastion.' },
  { port: 23, protocol: 'TCP', service: 'Telnet', usage: 'Legacy unencrypted terminal', securityNote: 'Strictly prohibited in modern networks—use SSH.' },
  { port: 25, protocol: 'TCP', service: 'SMTP', usage: 'Server-to-server mail transfer (MTA)', securityNote: 'Block outbound port 25 from all client VLANs to stop spam RBL listings.' },
  { port: 53, protocol: 'TCP/UDP', service: 'DNS', usage: 'Domain Name System queries (UDP) & zone/large EDNS0/DNSSEC (TCP)', securityNote: 'Permit outbound 53 strictly from internal AD DNS servers.' },
  { port: 67, protocol: 'UDP', service: 'DHCP Server', usage: 'Receives client Discover/Request broadcasts', securityNote: 'Protect access switches with DHCP Snooping.' },
  { port: 68, protocol: 'UDP', service: 'DHCP Client', usage: 'Receives Offer/ACK leases', securityNote: 'Pair with ip helper-address across routed VLANs.' },
  { port: 69, protocol: 'UDP', service: 'TFTP', usage: 'PXE network boot & VoIP firmware provisioning', securityNote: 'Unauthenticated—restrict strictly to provisioning VLANs.' },
  { port: 80, protocol: 'TCP', service: 'HTTP', usage: 'Unencrypted web, ACME HTTP-01 challenges, PKI CRL CDP', securityNote: 'Redirect web apps 301 -> HTTPS 443; note PKI CRL requires HTTP 80!' },
  { port: 88, protocol: 'TCP/UDP', service: 'Kerberos', usage: 'Active Directory ticket authentication (KDC)', securityNote: 'Requires clock sync within 5 minutes across domain.' },
  { port: 123, protocol: 'UDP', service: 'NTP', usage: 'Network Time Protocol clock synchronization', securityNote: 'Mandatory for Kerberos, TLS, and MFA TOTP.' },
  { port: 135, protocol: 'TCP', service: 'RPC Endpoint Mapper', usage: 'AD replication, WMI, DCOM port negotiation', securityNote: 'Never expose to internet; restrict to management/AD tiers.' },
  { port: 161, protocol: 'UDP', service: 'SNMP', usage: 'Network switch/UPS/printer monitoring', securityNote: 'Disable SNMPv1/v2c public/private strings; use encrypted SNMPv3.' },
  { port: 389, protocol: 'TCP/UDP', service: 'LDAP', usage: 'Active Directory directory queries', securityNote: 'Enforce LDAP Signing or migrate third-party apps to LDAPS 636.' },
  { port: 443, protocol: 'TCP/UDP', service: 'HTTPS / QUIC (HTTP/3)', usage: 'TLS encrypted web, REST APIs, SSL-VPN, DoH', securityNote: 'Enforce TLS 1.2 / TLS 1.3 with HSTS.' },
  { port: 445, protocol: 'TCP', service: 'SMB', usage: 'Windows File Sharing, SYSVOL/NETLOGON, IPC$', securityNote: 'Block on WAN/Internet; enforce SMB Signing (default on Win11 24H2).' },
  { port: 500, protocol: 'UDP', service: 'IKE (ISAKMP)', usage: 'IPSec VPN Phase 1 key exchange', securityNote: 'Pair with UDP 4500 for NAT-Traversal.' },
  { port: 514, protocol: 'UDP/TCP' as any, service: 'Syslog', usage: 'Centralized firewall/switch/Linux log forwarding', securityNote: 'Prefer TLS Syslog (TCP 6514) for sensitive audit logs.' },
  { port: 587, protocol: 'TCP', service: 'SMTP Submission', usage: 'Authenticated client/app outbound email with STARTTLS', securityNote: 'Require OAuth 2.0 or API tokens + TLS 1.2.' },
  { port: 636, protocol: 'TCP', service: 'LDAPS', usage: 'LDAP over SSL/TLS', securityNote: 'Requires valid Enterprise CA certificate on Domain Controllers.' },
  { port: 993, protocol: 'TCP', service: 'IMAPS', usage: 'Encrypted IMAP mail retrieval', securityNote: 'Prefer Modern Auth Exchange ActiveSync / Graph API.' },
  { port: 1433, protocol: 'TCP', service: 'Microsoft SQL Server', usage: 'Default SQL database engine listener', securityNote: 'Isolate in DB VLAN; enforce TLS encryption.' },
  { port: 1688, protocol: 'TCP', service: 'KMS', usage: 'Windows/Office Key Management Service volume activation', securityNote: 'Internal LAN/VPN only; pair with _vlmcs._tcp SRV record.' },
  { port: 1812, protocol: 'UDP', service: 'RADIUS Auth', usage: '802.1X WiFi & VPN authentication (NPS)', securityNote: 'Set 60s timeout when using MFA Push extensions.' },
  { port: 3268, protocol: 'TCP', service: 'AD Global Catalog', usage: 'Forest-wide LDAP Global Catalog queries (3269 = GC SSL)', securityNote: 'Required between multi-domain forest members and DCs.' },
  { port: 3306, protocol: 'TCP', service: 'MySQL / MariaDB', usage: 'Relational database client connections', securityNote: 'Bind to 127.0.0.1 or private DB subnet only.' },
  { port: 3389, protocol: 'TCP/UDP', service: 'RDP', usage: 'Windows Remote Desktop Protocol', securityNote: 'NEVER expose to 0.0.0.0/0 WAN; require VPN, RD Gateway, or Bastion + NLA.' },
  { port: 4500, protocol: 'UDP', service: 'IPSec NAT-T', usage: 'Encapsulates ESP VPN traffic across NAT routers', securityNote: 'Required alongside UDP 500 for IKEv2 VPNs.' },
  { port: 5060, protocol: 'TCP/UDP', service: 'SIP (5061 TLS)', usage: 'VoIP call signaling setup/teardown', securityNote: 'Disable SIP ALG on edge routers; prefer encrypted TCP 5061.' },
  { port: 5432, protocol: 'TCP', service: 'PostgreSQL', usage: 'PostgreSQL database listener', securityNote: 'In Docker, publish as 127.0.0.1:5432:5432 so UFW is not bypassed.' },
  { port: 5985, protocol: 'TCP', service: 'WinRM HTTP (5986 HTTPS)', usage: 'PowerShell Remoting & Windows Admin Center', securityNote: 'Kerberos-encrypted on domain even over 5985; restrict to Admin jump boxes.' },
  { port: 6379, protocol: 'TCP', service: 'Redis', usage: 'In-memory cache & message broker', securityNote: 'Require ACL password and private loopback/VPC binding.' },
  { port: 8443, protocol: 'TCP', service: 'HTTPS Alt', usage: 'UniFi/Tomcat/Management admin consoles', securityNote: 'Restrict management UIs to dedicated Admin VLAN.' },
  { port: 9100, protocol: 'TCP', service: 'RAW JetDirect Printing', usage: 'Direct TCP/IP network laser printing', securityNote: 'Exclude from Nessus port scans to prevent endless garbage pages!' },
  { port: 51820, protocol: 'UDP', service: 'WireGuard VPN', usage: 'Modern stateless encrypted VPN tunnel', securityNote: 'Silent on unauthenticated packets—resistant to port scanning.' }
];

export const OSI_LAYERS = [
  { layer: 7, name: 'Application', pdu: 'Data / Payload', protocols: 'HTTP/S, DNS, SMB, SMTP, SSH, LDAP, DHCP', devices: 'Browsers, L7 WAF, Next-Gen Firewalls, Reverse Proxies', failureSymptoms: 'HTTP 502/503, DNS NXDOMAIN, SMB 0x80070005 Access Denied, expired SSL cert', checkCmd: 'curl -Iv https://app.corp.local' },
  { layer: 6, name: 'Presentation', pdu: 'Data', protocols: 'TLS/SSL, X.509, MIME Base64, UTF-8, JSON', devices: 'TLS Offloaders, OS Schannel/OpenSSL', failureSymptoms: 'TLS 1.0/1.2 cipher mismatch, garbled character encoding, winmail.dat TNEF', checkCmd: 'openssl s_client -connect host:443' },
  { layer: 5, name: 'Session', pdu: 'Data', protocols: 'RPC, NetBIOS, SMB Session Setup, SIP', devices: 'Session Border Controllers, OS Sockets', failureSymptoms: 'RPC Server Unavailable (1722), Error 1219 multiple SMB credentials, VoIP 30s drop', checkCmd: 'Get-SmbSession' },
  { layer: 4, name: 'Transport', pdu: 'Segment (TCP) / Datagram (UDP)', protocols: 'TCP, UDP, QUIC', devices: 'Stateful Firewalls, L4 Load Balancers', failureSymptoms: 'TCP SYN timeout (firewall drop), Connection Refused (RST—service stopped), port conflict', checkCmd: 'Test-NetConnection host -Port 443' },
  { layer: 3, name: 'Network', pdu: 'Packet', protocols: 'IPv4, IPv6, ICMP, OSPF, BGP, IPSec', devices: 'Routers, Layer 3 Core Switches, VPN Gateways', failureSymptoms: '169.254.x.x APIPA, Destination Host Unreachable, asymmetric routing, MTU blackhole', checkCmd: 'tracert -d 1.1.1.1 && route print -4' },
  { layer: 2, name: 'Data Link', pdu: 'Frame', protocols: '802.3 Ethernet, 802.1Q VLAN, STP, ARP, 802.11 WiFi, LACP', devices: 'Managed Access Switches, Wireless APs, NICs', failureSymptoms: 'Wrong VLAN tag, STP broadcast loop, Port-Security err-disabled, duplicate IP ARP flip', checkCmd: 'arp -a && Get-NetAdapter' },
  { layer: 1, name: 'Physical', pdu: 'Bits / Symbols', protocols: '1000BASE-T, SFP+ Fiber, Cat6, PoE (802.3at), RF Spectrum', devices: 'Patch Cables, Keystones, Fiber Transceivers, Patch Panels', failureSymptoms: 'No link LEDs, Gigabit stuck at 100 Mbps (broken wire pair), rising CRC errors, 2.4GHz interference', checkCmd: 'Get-NetAdapterStatistics' }
];

export const TCPIP_MODEL = [
  { layer: '4. Application Layer', mapsToOsi: 'OSI Layers 5, 6, 7 (Session, Presentation, Application)', summary: 'Handles application protocols, TLS encryption, DNS name resolution, HTTP APIs, SSH, and SMB file operations.' },
  { layer: '3. Transport Layer', mapsToOsi: 'OSI Layer 4 (Transport)', summary: 'Provides end-to-end host communication via connection-oriented reliable TCP (3-way handshake, windowing, retransmissions) or low-overhead stateless UDP.' },
  { layer: '2. Internet Layer', mapsToOsi: 'OSI Layer 3 (Network)', summary: 'Handles logical IPv4/IPv6 addressing, CIDR subnetting, routing across networks, NAT, and ICMP diagnostics.' },
  { layer: '1. Network Access (Link) Layer', mapsToOsi: 'OSI Layers 1 & 2 (Physical + Data Link)', summary: 'Manages physical cabling/RF signaling, MAC hardware framing, 802.1Q VLAN tagging, and ARP neighbor resolution on the local link.' }
];

export const TCP_VS_UDP = [
  { attribute: 'Connection Model', tcp: 'Connection-oriented (SYN -> SYN-ACK -> ACK 3-way handshake)', udp: 'Connectionless (stateless fire-and-forget datagrams)' },
  { attribute: 'Reliability & Ordering', tcp: 'Guaranteed delivery, sequence numbering, ACKs, automatic retransmission', udp: 'Best-effort delivery; packets can drop or arrive out of order without OS retry' },
  { attribute: 'Header Size', tcp: '20–60 bytes (higher overhead)', udp: '8 bytes fixed (ultra-lightweight)' },
  { attribute: 'Flow & Congestion Control', tcp: 'Sliding window, CUBIC/BBR congestion control', udp: 'None at L4 (handled by app layer if needed, e.g., QUIC)' },
  { attribute: 'Real-World Protocols', tcp: 'HTTPS (443), SMB (445), SSH (22), SQL (1433/5432), SMTP (25/587), BGP (179)', udp: 'DNS (53), DHCP (67/68), NTP (123), VoIP/Teams RTP Media, WireGuard (51820), QUIC (443)' },
  { attribute: 'Troubleshooting Tip', tcp: '`Test-NetConnection -Port` proves listener & firewall immediately via SYN-ACK.', udp: 'Cannot prove open port with SYN-ACK alone; test with protocol-native query (`nslookup`, `w32tm`, `wg show`).' }
];

export const IP_RANGES_GUIDE = [
  { range: '10.0.0.0 – 10.255.255.255', cidr: '10.0.0.0/8', scope: 'RFC 1918 Private (Class A)', typicalUse: 'Enterprise data centers, multi-site VLANs, Azure/AWS VPCs (avoid 10.0.0.0/24 home ISP overlap!)' },
  { range: '172.16.0.0 – 172.31.255.255', cidr: '172.16.0.0/12', scope: 'RFC 1918 Private (Class B)', typicalUse: 'Docker bridge networks (172.17.0.0/16), VPN client pools, DMZ segments (note: 172.32.x.x is PUBLIC!)' },
  { range: '192.168.0.0 – 192.168.255.255', cidr: '192.168.0.0/16', scope: 'RFC 1918 Private (Class C)', typicalUse: 'Small branch offices & home WiFi routers (avoid 192.168.0.0/24 & 192.168.1.0/24 on corporate servers!)' },
  { range: '100.64.0.0 – 100.127.255.255', cidr: '100.64.0.0/10', scope: 'RFC 6598 Shared CGNAT', typicalUse: 'Carrier-Grade NAT (Starlink / 5G ISPs) & Tailscale overlay mesh IPs—not publicly port-forwardable!' },
  { range: '169.254.0.0 – 169.254.255.255', cidr: '169.254.0.0/16', scope: 'RFC 3927 Link-Local (APIPA)', typicalUse: 'Self-assigned when DHCP fails (also 169.254.169.254 Cloud Instance Metadata Service!)' },
  { range: '127.0.0.0 – 127.255.255.255', cidr: '127.0.0.0/8', scope: 'Loopback Host', typicalUse: 'Localhost (127.0.0.1) & Ubuntu systemd-resolved local stub (127.0.0.53)' },
  { range: '224.0.0.0 – 239.255.255.255', cidr: '224.0.0.0/4', scope: 'Multicast (Class D)', typicalUse: 'mDNS/Bonjour (224.0.0.251), LLMNR, OSPF routing hellos (224.0.0.5), imaging streams' }
];

export const DNS_LOOKUP_GUIDE = [
  { record: 'A / AAAA', purpose: 'Maps FQDN to IPv4 (32-bit) or IPv6 (128-bit) address.', cmdWindows: 'Resolve-DnsName portal.company.com -Type A', cmdLinux: 'dig portal.company.com A +short' },
  { record: 'CNAME', purpose: 'Aliases one hostname to another canonical FQDN (cannot coexist with MX/SOA at zone apex @).', cmdWindows: 'Resolve-DnsName autodiscover.company.com -Type CNAME', cmdLinux: 'dig autodiscover.company.com CNAME +short' },
  { record: 'MX', purpose: 'Directs inbound domain email to Mail Exchanger servers ordered by lowest preference integer.', cmdWindows: 'Resolve-DnsName company.com -Type MX', cmdLinux: 'dig company.com MX +short' },
  { record: 'TXT (SPF / DMARC)', purpose: 'Publishes Sender Policy Framework (`v=spf1`), DMARC (`_dmarc`), and domain verification tokens.', cmdWindows: 'Resolve-DnsName _dmarc.company.com -Type TXT', cmdLinux: 'dig _dmarc.company.com TXT +short' },
  { record: 'PTR (Reverse DNS)', purpose: 'Maps IP address back to hostname in `in-addr.arpa`; mandatory for outbound SMTP reputation.', cmdWindows: 'Resolve-DnsName 1.1.1.1 -Type PTR', cmdLinux: 'dig -x 1.1.1.1 +short' },
  { record: 'SRV', purpose: 'Locates Active Directory Domain Controllers (`_ldap._tcp.dc._msdcs`), KMS (`_vlmcs._tcp`), and SIP services.', cmdWindows: 'nslookup -type=srv _ldap._tcp.dc._msdcs.corp.local', cmdLinux: 'dig _ldap._tcp.dc._msdcs.corp.local SRV +short' },
  { record: 'NS & SOA', purpose: 'Identifies authoritative Name Servers and Start of Authority serial/TTL parameters.', cmdWindows: 'Resolve-DnsName company.com -Type SOA', cmdLinux: 'dig company.com NS +short' }
];
