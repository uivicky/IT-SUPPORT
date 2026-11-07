export interface NetworkingVisualLesson {
  id: string;
  title: string;
  tagline: string;
  simpleExplanation: string;
  realLifeAnalogy: string;
  packetFlow: [string, string, string, string];
  engineerExample: string;
  quickQuestion: string;
  quickAnswer: string;
}

export const NETWORKING_VISUAL_LESSONS: NetworkingVisualLesson[] = [
  {
    id: 'ip-address',
    title: 'IP Address',
    tagline: 'Every device’s digital street address',
    simpleExplanation:
      'An IPv4 address (like 192.168.1.25) uniquely identifies a computer, phone, or printer on an IP network so routers know where to deliver packets.',
    realLifeAnalogy:
      'Like a postal house address on an envelope—without both a Sender Address and Destination Address, mail can never reach you.',
    packetFlow: ['Laptop (192.168.1.25)', 'Switch (LAN)', 'Router (192.168.1.1)', 'Server (8.8.8.8)'],
    engineerExample: 'Run `ipconfig` on Windows or `ip a` on Linux. Watch out for `169.254.x.x` (APIPA = DHCP failed).',
    quickQuestion: 'How many octets (0–255 numbers) make up an IPv4 address?',
    quickAnswer: '4 octets (32 bits total), e.g., 192.168.10.45.',
  },
  {
    id: 'subnet-mask',
    title: 'Subnet Mask',
    tagline: 'Draws the boundary of your local room/VLAN',
    simpleExplanation:
      'A Subnet Mask (like 255.255.255.0 or /24) tells a computer which part of an IP address is the shared local Network ID and which part is the individual Host ID.',
    realLifeAnalogy:
      'Like an apartment building code vs apartment door number: `192.168.1.` is Building 1, and `.25` is Apartment 25!',
    packetFlow: ['255.255.255.0 (/24)', 'Network: 192.168.1.0', 'Hosts: .1 to .254', 'Broadcast: .255'],
    engineerExample: 'If two PCs are on 192.168.1.10/24 and 192.168.2.10/24, they are in DIFFERENT subnets and need a router to talk.',
    quickQuestion: 'How many usable host IPs exist in a standard /24 (255.255.255.0) network?',
    quickAnswer: '254 usable hosts (256 total minus Network .0 and Broadcast .255).',
  },
  {
    id: 'default-gateway',
    title: 'Default Gateway',
    tagline: 'The exit door out of your local network',
    simpleExplanation:
      'Your Default Gateway is the local IP address of your Router (usually `.1`, like `192.168.1.1`). Whenever your PC wants to reach an IP outside its own subnet, it sends packets to the Default Gateway.',
    realLifeAnalogy:
      'Like the main lobby exit gate of your office building—you don’t need it to visit a coworker’s desk inside, but you MUST walk through it to go anywhere in the city!',
    packetFlow: ['Your PC (.25)', 'Checks Subnet Mask', 'Sends to Gateway (.1)', 'Routes to Internet'],
    engineerExample: 'Missing Default Gateway = local LAN printers still work, while all external websites fail!',
    quickQuestion: 'What happens if a PC has a valid IP and Subnet Mask, but Default Gateway is blank?',
    quickAnswer: 'It can talk to devices in the same room/VLAN, but cannot reach other VLANs or the Internet.',
  },
  {
    id: 'dns',
    title: 'DNS (Domain Name System)',
    tagline: 'The phonebook of the Internet (UDP/TCP 53)',
    simpleExplanation:
      'Humans remember names like `google.com`, while routers only route numeric IPs like `142.250.183.14`. DNS translates domain names into IP addresses automatically.',
    realLifeAnalogy:
      'Like tapping "Mom" in your phone’s Contacts app—your phone dials her 10-digit number behind the scenes.',
    packetFlow: ['Type microsoft.com', 'Ask DNS (Port 53)', 'Receive 20.70.246.20', 'Connect HTTPS (443)'],
    engineerExample: 'If `ping 8.8.8.8` works, yet websites fail with NXDOMAIN, fix DNS settings and run `ipconfig /flushdns`.',
    quickQuestion: 'Which port does standard DNS use?',
    quickAnswer: 'Port 53 (UDP for fast lookups, TCP for zone transfers & large responses).',
  },
  {
    id: 'dhcp',
    title: 'DHCP',
    tagline: 'Automatic IP leasing via D-O-R-A (UDP 67/68)',
    simpleExplanation:
      'Dynamic Host Configuration Protocol automatically assigns an IP address, Subnet Mask, Default Gateway, and DNS servers the moment a device joins WiFi or Ethernet.',
    realLifeAnalogy:
      'Like a hotel reception desk automatically handing you Room Key #204, WiFi code, and checkout time when you arrive.',
    packetFlow: ['1. Discover', '2. Offer', '3. Request', '4. Acknowledge'],
    engineerExample: 'If a DHCP scope runs out of free IPs, new WiFi laptops get stuck on `169.254.x.x` and cannot get online.',
    quickQuestion: 'What does DORA stand for in DHCP?',
    quickAnswer: 'Discover → Offer → Request → Acknowledge.',
  },
  {
    id: 'mac-address',
    title: 'MAC Address',
    tagline: 'Hardware fingerprint burned into your network card',
    simpleExplanation:
      'A Media Access Control (MAC) address is a permanent 48-bit hexadecimal hardware ID (like `3C:52:82:9A:1F:B4`) used at Layer 2 by Ethernet switches and WiFi access points.',
    realLifeAnalogy:
      'An IP address is like your current mailing address (changes when you travel); a MAC address is like your passport/chassis number!',
    packetFlow: ['NIC Hardware Chip', '3C-52-82 (Vendor OUI)', '9A-1F-B4 (Device ID)', 'Layer 2 Switch Table'],
    engineerExample: 'View yours via `ipconfig /all` ("Physical Address") or `arp -a` to see IP-to-MAC mappings on your LAN.',
    quickQuestion: 'At which OSI layer do MAC addresses and network switches operate?',
    quickAnswer: 'Layer 2 (Data Link Layer).',
  },
  {
    id: 'public-ip',
    title: 'Public IP Address',
    tagline: 'Your globally routable address on the Internet',
    simpleExplanation:
      'A Public IP (such as `49.36.120.8` or `8.8.8.8`) is assigned by your ISP and is globally unique across the entire world internet.',
    realLifeAnalogy:
      'Like your company’s main published street address on Google Maps where external couriers deliver packages.',
    packetFlow: ['Assigned by ISP', 'Unique Worldwide', 'Lives on Router WAN', 'Visible to Websites'],
    engineerExample: 'Every device in your home usually shares ONE Public IPv4 address using NAT on your WiFi router.',
    quickQuestion: 'Who assigns your home or office Public IP address?',
    quickAnswer: 'Your Internet Service Provider (ISP).',
  },
  {
    id: 'private-ip',
    title: 'Private IP Address',
    tagline: 'Free reusable internal LAN addresses (RFC 1918)',
    simpleExplanation:
      'Private IPs (`10.x.x.x`, `172.16–31.x.x`, `192.168.x.x`) are used inside homes, offices, and cloud VNets. They cannot be routed directly on the public internet without NAT.',
    realLifeAnalogy:
      'Like internal office desk extension numbers (`Ext 104`)—thousands of companies have an Ext 104 without clashing!',
    packetFlow: ['10.0.0.0/8 (Enterprise)', '172.16.0.0/12 (Cloud)', '192.168.0.0/16 (Home/SMB)', 'Router NAT → Internet'],
    engineerExample: 'Spotting `192.168.x.x` tells you immediately it is an internal LAN address, safe to show in screenshots.',
    quickQuestion: 'Which 3 IPv4 blocks are reserved as RFC 1918 Private IPs?',
    quickAnswer: '10.0.0.0/8, 172.16.0.0/12 (172.16–172.31), and 192.168.0.0/16.',
  },
  {
    id: 'tcp',
    title: 'TCP (Transmission Control Protocol)',
    tagline: 'Guaranteed, ordered delivery via 3-Way Handshake',
    simpleExplanation:
      'TCP establishes a reliable connection (`SYN → SYN-ACK → ACK`), numbers every packet, and automatically resends any lost piece so webpages, emails, and files arrive 100% intact.',
    realLifeAnalogy:
      'Like registered courier delivery requiring a signature receipt for every box.',
    packetFlow: ['1. SYN (Hello?)', '2. SYN-ACK (Ready!)', '3. ACK (Connected)', 'Verified Data Transfer'],
    engineerExample: 'Used by HTTPS (443), SSH (22), SMB (445), RDP (3389), and SMTP (25/587).',
    quickQuestion: 'What are the 3 steps of the TCP handshake?',
    quickAnswer: 'SYN → SYN-ACK → ACK.',
  },
  {
    id: 'udp',
    title: 'UDP (User Datagram Protocol)',
    tagline: 'Ultra-fast real-time streaming with zero delay',
    simpleExplanation:
      'UDP blasts packets out immediately with no handshake and no retransmission—making it super fast and lag-free for live voice calls, video meetings, gaming, DNS, and DHCP.',
    realLifeAnalogy:
      'Like a live radio broadcast or talking in person—if 0.1s glitches, you keep talking live rather than rewinding 5 seconds ago!',
    packetFlow: ['No Handshake Delay', 'Stream Live Packets', 'Minimal Header', 'Real-Time Audio/Video'],
    engineerExample: 'Used by DNS (53), DHCP (67/68), WireGuard/OpenVPN, Zoom/Teams live media, and NTP (123).',
    quickQuestion: 'Why do Zoom/Teams calls prefer UDP over TCP for live audio?',
    quickAnswer: 'Waiting to retransmit old audio packets causes awkward lag; real-time speed matters most.',
  },
  {
    id: 'ports',
    title: 'Network Ports',
    tagline: 'Service doors on a single IP address (1–65535)',
    simpleExplanation:
      'A single server IP can run a website, SSH login, and email simultaneously because each app listens on a numbered Port (like `:443` for HTTPS or `:22` for SSH).',
    realLifeAnalogy:
      'If an IP address is a hospital building’s address, Port numbers are specific department doors (Room 443 = Web, Room 3389 = Remote Desktop)!',
    packetFlow: ['80 / 443 → HTTP/HTTPS', '53 → DNS', '22 / 3389 → SSH / RDP', '445 → SMB File Share'],
    engineerExample: 'Test if a firewall blocks a specific port in PowerShell: `Test-NetConnection server01 -Port 443`.',
    quickQuestion: 'Which port numbers are used by HTTPS and Remote Desktop (RDP)?',
    quickAnswer: 'HTTPS = TCP 443, Remote Desktop (RDP) = TCP/UDP 3389.',
  },
  {
    id: 'osi-model',
    title: 'OSI 7-Layer Model',
    tagline: 'Universal map for isolating any network bug',
    simpleExplanation:
      'The Open Systems Interconnection model splits networking into 7 clear layers from Physical cables (Layer 1) up to Browser Applications (Layer 7) so engineers isolate faults systematically.',
    realLifeAnalogy:
      'Please Do Not Throw Sausage Pizza Away -> Physical (1), Data Link (2), Network (3), Transport (4), Session (5), Presentation (6), Application (7).',
    packetFlow: ['L1–L2: Cable & MAC', 'L3: IP & Routers', 'L4: TCP/UDP Ports', 'L5–L7: TLS & HTTP Apps'],
    engineerExample: 'Unplugged cable = Layer 1. Bad VLAN = Layer 2. Wrong IP/Route = Layer 3. Blocked Port 443 = Layer 4. HTTP 500 = Layer 7!',
    quickQuestion: 'At which OSI layer do Routers and IP addresses work?',
    quickAnswer: 'Layer 3 (Network Layer).',
  },
  {
    id: 'tcp-ip-model',
    title: 'TCP/IP 4-Layer Model',
    tagline: 'Practical real-world blueprint of the Internet',
    simpleExplanation:
      'While OSI is great for teaching and troubleshooting, real internet protocols follow the streamlined 4-layer TCP/IP stack: Network Access, Internet, Transport, and Application.',
    realLifeAnalogy:
      'Combines OSI Layers 5–7 into one clean Application layer and Layers 1–2 into Network Access.',
    packetFlow: ['4. Application (HTTPS/DNS)', '3. Transport (TCP/UDP)', '2. Internet (IPv4/IPv6)', '1. Network Access (WiFi/Eth)'],
    engineerExample: 'Every packet gets wrapped ("encapsulated") downward from Layer 4 → 1 on the sender, and unwrapped 1 → 4 on the receiver!',
    quickQuestion: 'Which TCP/IP layer maps to OSI Layers 5, 6, and 7 combined?',
    quickAnswer: 'The Application Layer.',
  },
];

export interface RoadmapJourneyStage {
  stageNumber: number;
  id: string;
  title: string;
  tier: 'Foundation' | 'Core IT Support' | 'Systems & Cloud';
  summary: string;
  lessonLink: { label: string; to: string };
  quizLink: { label: string; to: string };
  practiceLink: { label: string; to: string };
  issuesCategory: string;
}

export const ROADMAP_13_STAGES: RoadmapJourneyStage[] = [
  {
    stageNumber: 1,
    id: 'stage-01-computer-basics',
    title: 'COMPUTER BASICS',
    tier: 'Foundation',
    summary: 'Understand input/output, binary 1s & 0s, hardware vs software, files, folders, and peripheral ports from absolute zero.',
    lessonLink: { label: 'Lessons 1–4: Computer Basics', to: '/beginners?lesson=what-is-a-computer' },
    quizLink: { label: 'Quick 5-Question Quiz', to: '/challenges?mode=quick-5' },
    practiceLink: { label: 'Visual PC Boot Lab', to: '/learning-lab?lab=how-computer-boots' },
    issuesCategory: 'Software & Applications',
  },
  {
    stageNumber: 2,
    id: 'stage-02-windows-fundamentals',
    title: 'WINDOWS FUNDAMENTALS',
    tier: 'Foundation',
    summary: 'Master Windows 10 & 11 Settings, Task Manager, File Explorer, Safe Mode, Startup Apps, and user profiles.',
    lessonLink: { label: 'Lessons 5–6: OS & Windows', to: '/beginners?lesson=what-is-windows' },
    quizLink: { label: 'Windows Quiz', to: '/challenges?mode=windows' },
    practiceLink: { label: 'Fix Slow PC Ticket (INC-1046)', to: '/simulator?ticket=slow-computer' },
    issuesCategory: 'Windows 10 & Windows 11',
  },
  {
    stageNumber: 3,
    id: 'stage-03-hardware-troubleshooting',
    title: 'HARDWARE TROUBLESHOOTING',
    tier: 'Foundation',
    summary: 'Diagnose CPU thermals, RAM vs HDD vs NVMe SSD bottlenecks, UEFI/BIOS POST, printers, and docking stations.',
    lessonLink: { label: 'Lessons 7–10: RAM, SSD & CPU', to: '/beginners?lesson=what-is-ram' },
    quizLink: { label: 'Hardware Quiz', to: '/challenges?mode=hardware' },
    practiceLink: { label: 'Fix Overheating Laptop (INC-1047)', to: '/simulator?ticket=laptop-overheating' },
    issuesCategory: 'Laptop & Desktop Hardware',
  },
  {
    stageNumber: 4,
    id: 'stage-04-networking-fundamentals',
    title: 'NETWORKING FUNDAMENTALS',
    tier: 'Foundation',
    summary: 'Learn IPv4 addresses, Subnet Masks, Default Gateways, MAC addresses, TCP/UDP ports, WiFi bands, and OSI layers.',
    lessonLink: { label: '13 Visual Networking Lessons', to: '/networking-tools' },
    quizLink: { label: 'Networking Quiz', to: '/challenges?mode=networking' },
    practiceLink: { label: 'How the Internet Works Lab', to: '/learning-lab?lab=how-internet-works' },
    issuesCategory: 'Networking & TCP/IP',
  },
  {
    stageNumber: 5,
    id: 'stage-05-windows-administration',
    title: 'WINDOWS ADMINISTRATION',
    tier: 'Core IT Support',
    summary: 'Repair Windows with SFC & DISM, Event Viewer logs, Windows Services, BitLocker encryption, and Disk Cleanup.',
    lessonLink: { label: 'Windows Troubleshooting Hub', to: '/windows-troubleshooting' },
    quizLink: { label: 'Scenario Triage Quiz', to: '/challenges?mode=scenario' },
    practiceLink: { label: 'Practice sfc /scannow in Terminal', to: '/commands' },
    issuesCategory: 'Storage & Disk Management',
  },
  {
    stageNumber: 6,
    id: 'stage-06-active-directory',
    title: 'ACTIVE DIRECTORY',
    tier: 'Core IT Support',
    summary: 'Manage Domain Controllers, Users & OUs, Security Groups, Group Policy (`gpupdate`), and Event ID 4740 lockouts.',
    lessonLink: { label: 'Lesson 20: What is Active Directory?', to: '/beginners?lesson=what-is-active-directory' },
    quizLink: { label: 'Active Directory Quiz', to: '/challenges?mode=active-directory' },
    practiceLink: { label: 'Fix Domain Lockout (INC-1045)', to: '/simulator?ticket=domain-login-failure' },
    issuesCategory: 'Active Directory',
  },
  {
    stageNumber: 7,
    id: 'stage-07-dns-dhcp',
    title: 'DNS & DHCP',
    tier: 'Core IT Support',
    summary: 'Understand DHCP DORA leases, 169.254 APIPA recovery, A/MX/CNAME/SRV DNS records, and `nslookup` diagnostics.',
    lessonLink: { label: 'Lessons 18–19: DNS & DHCP', to: '/beginners?lesson=what-is-dns' },
    quizLink: { label: 'Daily IT Challenge', to: '/challenges?mode=daily' },
    practiceLink: { label: 'Animated DHCP DORA Lab', to: '/learning-lab?lab=how-dhcp-works' },
    issuesCategory: 'DNS & DHCP',
  },
  {
    stageNumber: 8,
    id: 'stage-08-microsoft-365',
    title: 'MICROSOFT 365',
    tier: 'Core IT Support',
    summary: 'Support Exchange Online mailboxes, Outlook Safe Mode & OST rebuilds, Teams, OneDrive sync, and Entra ID MFA.',
    lessonLink: { label: 'Lesson 21: What is Microsoft 365?', to: '/beginners?lesson=what-is-microsoft-365' },
    quizLink: { label: 'Interview Challenge', to: '/challenges?mode=interview' },
    practiceLink: { label: 'Fix Hung Outlook (INC-1044)', to: '/simulator?ticket=outlook-not-opening' },
    issuesCategory: 'Microsoft 365',
  },
  {
    stageNumber: 9,
    id: 'stage-09-windows-server',
    title: 'WINDOWS SERVER',
    tier: 'Systems & Cloud',
    summary: 'Administer NTFS vs Share permissions, SMB file shares, Print Servers, IIS pools, Hyper-V, and VSS backups.',
    lessonLink: { label: 'Windows Server Guide', to: '/windows-server-guide' },
    quizLink: { label: 'Scenario Quiz', to: '/challenges?mode=scenario' },
    practiceLink: { label: 'How Printing Works Lab', to: '/learning-lab?lab=how-printer-works' },
    issuesCategory: 'Windows Server',
  },
  {
    stageNumber: 10,
    id: 'stage-10-linux-fundamentals',
    title: 'LINUX FUNDAMENTALS',
    tier: 'Systems & Cloud',
    summary: 'Navigate Bash CLI, `df -h` & `free -h`, `chmod`/`chown` permissions, `systemctl`/`journalctl`, and SSH keys.',
    lessonLink: { label: 'Linux Troubleshooting Guide', to: '/linux-troubleshooting' },
    quizLink: { label: 'Interview Prep (Linux Track)', to: '/interview-questions' },
    practiceLink: { label: 'Practice Linux CLI in Terminal', to: '/commands' },
    issuesCategory: 'Linux',
  },
  {
    stageNumber: 11,
    id: 'stage-11-cloud-azure',
    title: 'CLOUD & AZURE',
    tier: 'Systems & Cloud',
    summary: 'Understand IaaS/PaaS/SaaS, Azure Virtual Machines, VNets, Network Security Groups (NSGs), and hybrid Entra Connect.',
    lessonLink: { label: 'Lesson 22: Cloud Computing', to: '/beginners?lesson=what-is-cloud-computing' },
    quizLink: { label: 'Interview Challenge', to: '/challenges?mode=interview' },
    practiceLink: { label: 'Azure & Cloud Guide', to: '/azure-cloud-guide' },
    issuesCategory: 'Azure & Cloud',
  },
  {
    stageNumber: 12,
    id: 'stage-12-cybersecurity',
    title: 'CYBERSECURITY',
    tier: 'Systems & Cloud',
    summary: 'Protect endpoints with MFA, Firewalls, IPSec/WireGuard VPNs, SPF/DKIM/DMARC email auth, and anti-phishing.',
    lessonLink: { label: 'Lessons 23–25: Security, Firewall & VPN', to: '/beginners?lesson=what-is-cybersecurity' },
    quizLink: { label: 'Daily IT Challenge', to: '/challenges?mode=daily' },
    practiceLink: { label: 'Animated Encrypted VPN Lab', to: '/learning-lab?lab=how-vpn-works' },
    issuesCategory: 'Cybersecurity',
  },
  {
    stageNumber: 13,
    id: 'stage-13-real-world-scenarios',
    title: 'REAL-WORLD IT SUPPORT SCENARIOS',
    tier: 'Systems & Cloud',
    summary: 'Combine everything to triage live multi-layer tickets under pressure and ace L1/L2 & SysAdmin interviews!',
    lessonLink: { label: 'Ask Personal AI IT Teacher', to: '/ai-assistant?mode=tutor' },
    quizLink: { label: 'IT Support Scenario Quiz', to: '/challenges?mode=scenario' },
    practiceLink: { label: 'Solve All 10 Live Simulator Tickets', to: '/simulator' },
    issuesCategory: 'IT Helpdesk & Ticketing',
  },
];
