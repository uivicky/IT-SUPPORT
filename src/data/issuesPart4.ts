import { CompactIssueSeed, expandIssues } from './issueBuilder';

const SEEDS_PART_4: CompactIssueSeed[] = [
  // ================= 16. Antivirus & Firewall (13 issues) =================
  {
    id: 'AVF-001',
    title: 'Windows Defender Controlled Folder Access Blocking Legitimate App Save',
    category: 'Antivirus & Firewall',
    errorCode: 'Event ID 1123',
    desc: 'Accounting or CAD app cannot save to Documents because Controlled Folder Access blocked write access.',
    symptoms: ['Unauthorized changes blocked toast notification', 'Event ID 1123 in Defender Operational log'],
    causes: ['Ransomware folder protection blocks unsigned internal executables from writing to protected folders'],
    steps: ['Check Defender Operational Event ID 1123 for the exact blocked executable path.', 'Verify the binary is a trusted internal or signed vendor app.', 'Add the specific executable to ControlledFolderAccessAllowedApplications instead of disabling protection.'],
    cmds: [
      ['PowerShell', 'Get-WinEvent -FilterHashtable @{LogName="Microsoft-Windows-Windows Defender/Operational"; ID=1123} -MaxEvents 5', 'Identify blocked binary'],
      ['PowerShell', 'Add-MpPreference -ControlledFolderAccessAllowedApplications "C:\\Program Files\\App\\app.exe"', 'Allow verified app']
    ],
    expected: 'Trusted app saves files cleanly while ransomware protection stays active.',
    prevent: ['Test Controlled Folder Access in Audit Mode (Event 1124) prior to enforcement'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['unauthorized changes blocked', 'controlled folder access', 'event 1123']
  },
  {
    id: 'AVF-002',
    title: 'Windows Firewall Blocking Inbound Port After Network Profile Flipped to Public',
    category: 'Antivirus & Firewall',
    desc: 'Local SQL/Agent listener works on Domain/Private profile, but drops connections when NIC flips to Public.',
    symptoms: ['Localhost connects, LAN clients time out', 'Get-NetConnectionProfile shows Public'],
    causes: ['Inbound rule scoped to Domain/Private while adapter switched to Public'],
    steps: ['Check active profile with Get-NetConnectionProfile.', 'Restore DomainAuthenticated via Restart-Service NlaSvc (or Private on trusted home LAN).', 'Scope inbound rules explicitly to authorized RemoteAddress subnets.'],
    cmds: [
      ['PowerShell', 'Get-NetConnectionProfile', 'Check active network profile'],
      ['PowerShell', 'New-NetFirewallRule -DisplayName "App 8443" -Direction Inbound -Protocol TCP -LocalPort 8443 -Profile Domain,Private -RemoteAddress 10.0.0.0/8 -Action Allow', 'Add scoped allow rule']
    ],
    expected: 'Authorized LAN subnets connect while untrusted public networks stay blocked.',
    prevent: ['Never stop the mpssvc Windows Firewall service—manage rules instead'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['windows firewall blocking port', 'new-netfirewallrule', 'public profile']
  },
  {
    id: 'AVF-003',
    title: 'MsMpEng.exe High CPU Usage During Developer Builds',
    category: 'Antivirus & Firewall',
    desc: 'Antimalware Service Executable pegs CPU at 80% during npm, Docker, or Visual Studio builds.',
    symptoms: ['Builds take 5x longer than normal', 'MsMpEng.exe uses 60-90% CPU'],
    causes: ['Synchronous real-time scanning of thousands of tiny generated build artifacts'],
    steps: ['Move source code onto a Windows 11 ReFS Dev Drive to activate asynchronous Defender Performance Mode.', 'Run Defender Performance Analyzer to locate exact hot-paths before adding narrow exclusions.'],
    cmds: [
      ['PowerShell', 'New-MpPerformanceRecording -RecordTo C:\\temp\\def.etl', 'Capture scan trace'],
      ['PowerShell', 'Get-MpPerformanceReport -Path C:\\temp\\def.etl -TopProcesses 10', 'View top scanned processes']
    ],
    warn: 'Never exclude Downloads, Temp, or *.exe globally.',
    expected: 'Build times drop dramatically while preserving endpoint protection.',
    prevent: ['Provision ReFS Dev Drives on developer laptops'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['msmpeng high cpu', 'antimalware service executable', 'dev drive']
  },
  {
    id: 'AVF-004',
    title: 'False Positive Quarantine of Internal Line-of-Business Executable',
    category: 'Antivirus & Firewall',
    desc: 'EDR/Defender quarantines an unsigned internal .exe across workstations after deployment.',
    symptoms: ['Application shortcut says item moved or deleted', 'Protection history shows heuristic quarantine'],
    causes: ['Unsigned internal build lacks code-signing certificate reputation'],
    steps: ['Verify binary SHA256 matches your clean CI/CD build server output.', 'Restore from quarantine and create a SHA256 File Hash Allow Indicator.', 'Sign internal builds with your Enterprise PKI or EV Code Signing certificate.'],
    cmds: [
      ['PowerShell', 'Get-MpThreatDetection | Select InitialDetectionTime, Resources', 'Inspect quarantined items'],
      ['PowerShell', 'Get-FileHash "C:\\Build\\InternalApp.exe" -Algorithm SHA256', 'Get SHA256 hash']
    ],
    expected: 'Verified binary runs across endpoints without disabling cloud protection.',
    prevent: ['Code-sign all internal executables in CI/CD pipelines'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['false positive quarantine', 'get-mpthreatdetection', 'sha256 allow']
  },
  {
    id: 'AVF-005',
    title: 'Corporate SSL Inspection Breaking Git, npm, and Python pip CLI Tools',
    category: 'Antivirus & Firewall',
    errorCode: 'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
    desc: 'Browsers trust HTTPS behind Zscaler/FortiGate SSL inspection, but CLI tools fail certificate validation.',
    symptoms: ['self-signed certificate in certificate chain in git, npm, or pip', 'Edge and Chrome load URLs fine'],
    causes: ['CLI runtimes bundle private CA stores missing the corporate Root CA'],
    steps: ['Export corporate Root CA as Base64 PEM.', 'Set Git to use Windows Schannel store and point NODE_EXTRA_CA_CERTS / REQUESTS_CA_BUNDLE to CorpRootCA.pem.'],
    cmds: [
      ['CMD', 'git config --global http.sslBackend schannel', 'Use Windows cert store in Git'],
      ['PowerShell', '[Environment]::SetEnvironmentVariable("NODE_EXTRA_CA_CERTS","C:\\Certs\\CorpRootCA.pem","Machine")', 'Trust Corp CA in Node.js']
    ],
    warn: 'Never set NODE_TLS_REJECT_UNAUTHORIZED=0 or sslVerify=false.',
    expected: 'All developer CLIs validate TLS chains securely.',
    prevent: ['Push CorpRootCA.pem environment variables via Intune/GPO'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['unable_to_verify_leaf_signature', 'zscaler git', 'node_extra_ca_certs']
  },
  {
    id: 'AVF-006',
    title: 'Two Antivirus Agents Installed Simultaneously Causing System Freezes',
    category: 'Antivirus & Firewall',
    desc: 'Workstation hangs when opening files after migrating EDR vendors without clean removal of legacy AV.',
    symptoms: ['30-second freezes opening Office files', 'Two AV minifilter drivers active in fltmc'],
    causes: ['Competing kernel filesystem minifilters deadlocking file I/O'],
    steps: ['Run fltmc as Administrator to list loaded AV minifilter drivers.', 'Disable Tamper Protection on the retired AV and run its official removal tool.', 'Verify only one active AV provider in SecurityCenter2.'],
    cmds: [
      ['CMD', 'fltmc', 'List loaded kernel minifilter drivers'],
      ['PowerShell', 'Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntiVirusProduct', 'Check registered AV products']
    ],
    expected: 'Kernel I/O contention disappears and desktop responsiveness returns.',
    prevent: ['Deploy new EDR in passive mode until legacy AV uninstall completes'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['two antivirus freeze', 'fltmc', 'edr conflict']
  },
  {
    id: 'AVF-007',
    title: 'Attack Surface Reduction (ASR) Rule Blocking Signed Finance Excel Macro',
    category: 'Antivirus & Firewall',
    errorCode: 'Event ID 1121',
    desc: 'Trusted internal .xlsm macro workbook is blocked from spawning processes or Win32 calls.',
    symptoms: ['Action blocked by organization banner in Excel', 'Event ID 1121 in Defender log'],
    causes: ['Office ASR rule triggered on unsigned VBA project'],
    steps: ['Inspect Event ID 1121 for the exact ASR Rule GUID and workbook path.', 'Sign internal VBA macros with an Enterprise Code Signing cert and store on a GPO Trusted Location.'],
    cmds: [
      ['PowerShell', 'Get-WinEvent -FilterHashtable @{LogName="Microsoft-Windows-Windows Defender/Operational"; ID=1121} -MaxEvents 5', 'Read ASR block event']
    ],
    expected: 'Signed internal macros execute while malicious email macros stay blocked.',
    prevent: ['Digitally sign internal VBA macros rather than disabling ASR'],
    diff: 'Advanced',
    time: '15 minutes',
    tags: ['asr rule', 'event 1121', 'excel macro blocked']
  },
  {
    id: 'AVF-008',
    title: 'Linux UFW or firewalld Accidentally Blocking SSH Access',
    category: 'Antivirus & Firewall',
    desc: 'Enabling UFW or reloading firewalld drops SSH connections because custom SSH port was not permitted.',
    symptoms: ['SSH times out right after firewall reload', 'HTTPS 443 remains reachable'],
    causes: ['SSH port missing from permanent allow rules before enabling default-deny firewall'],
    steps: ['Connect via hypervisor or cloud serial console.', 'Add explicit SSH allow rule and reload firewall.', 'Verify in a second terminal window before closing console.'],
    cmds: [
      ['Bash', 'sudo ufw allow 22/tcp && sudo ufw reload', 'Permit SSH on Ubuntu UFW'],
      ['Bash', 'sudo firewall-cmd --permanent --add-service=ssh && sudo firewall-cmd --reload', 'Permit SSH on RHEL firewalld']
    ],
    expected: 'SSH connects cleanly with host firewall active.',
    prevent: ['Always keep an open backup SSH session while testing firewall rules'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['ufw blocked ssh', 'firewalld ssh', 'locked out ssh']
  },
  {
    id: 'AVF-009',
    title: 'Docker Published Port Bypassing UFW Firewall on Linux Host',
    category: 'Antivirus & Firewall',
    desc: 'Database container run with -p 5432:5432 is exposed publicly despite ufw deny 5432.',
    symptoms: ['External port scan reaches 5432/6379 even with UFW active'],
    causes: ['Docker NAT PREROUTING iptables rules evaluate before UFW input chains'],
    steps: ['Bind internal container ports strictly to localhost (`127.0.0.1:5432:5432`) in docker-compose.yml.', 'Apply any host-level container filters inside the DOCKER-USER chain.'],
    cmds: [
      ['Bash', 'ss -tulpn | grep 5432', 'Confirm 127.0.0.1 vs 0.0.0.0 binding']
    ],
    warn: 'Never publish database ports on 0.0.0.0 assuming UFW blocks them.',
    expected: 'Database port is unreachable from outside while local app connects.',
    prevent: ['Use internal Docker networks without host port publishing for DBs'],
    diff: 'Advanced',
    time: '10 minutes',
    tags: ['docker ufw bypass', 'docker-user', '127.0.0.1:5432']
  },
  {
    id: 'AVF-010',
    title: 'Firewall SIP ALG Causing One-Way Audio and 30-Second VoIP Call Drops',
    category: 'Antivirus & Firewall',
    desc: 'Desk phones ring, but callers experience one-way audio or disconnects at 30 seconds.',
    symptoms: ['Caller cannot hear agent or call drops at 30s mark'],
    causes: ['Router SIP ALG rewriting already NAT-aware SDP headers and short UDP state timers'],
    steps: ['Disable SIP ALG / SIP Session Helper on the edge firewall and ISP gateway.', 'Increase UDP NAT timeout to 300s for VoIP PBX IPs and reboot phones.'],
    cmds: [
      ['Config / CLI', 'config system session-helper -> delete sip; set voip sip status disable', 'Disable SIP ALG on firewall']
    ],
    expected: 'Two-way voice RTP streams stay clear and stable.',
    prevent: ['Use SIP over TLS (TCP 5061) to prevent middlebox header mangling'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['one way audio', 'sip alg', 'voip dropping 30s']
  },
  {
    id: 'AVF-011',
    title: 'Defender Antivirus Definitions Stale (>7 Days) on Isolated Server',
    category: 'Antivirus & Firewall',
    errorCode: '0x8024402c',
    desc: 'Restricted VLAN server triggers compliance alert due to outdated Defender signatures.',
    symptoms: ['AntivirusSignatureAge > 7 days', 'Update-MpSignature fails with 0x8024402c'],
    causes: ['Outbound proxy/firewall blocking Microsoft definition CDNs and missing WSUS/UNC fallback'],
    steps: ['Check signature age with Get-MpComputerStatus.', 'Allowlist Defender definition URLs on proxy or configure internal WSUS / UNC FileShare signature source.'],
    cmds: [
      ['PowerShell', 'Get-MpComputerStatus | Select AntivirusSignatureAge, AntivirusSignatureVersion', 'Check signature age'],
      ['PowerShell', 'Update-MpSignature', 'Force signature refresh']
    ],
    expected: 'Signature age resets to 0 days.',
    prevent: ['Configure internal WSUS or UNC definition share for air-gapped VLANs'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['0x8024402c', 'update-mpsignature', 'defender definitions outdated']
  },
  {
    id: 'AVF-012',
    title: 'Mark-of-the-Web Blocking Verified PowerShell Script (Zone.Identifier)',
    category: 'Antivirus & Firewall',
    desc: 'Downloaded internal admin script fails under RemoteSigned policy because ZoneId=3 marks it from Internet.',
    symptoms: ['Script cannot be loaded because it is not digitally signed'],
    causes: ['NTFS Alternate Data Stream :Zone.Identifier tags browser downloads'],
    steps: ['Verify script origin and hash first.', 'Run Unblock-File on the verified script instead of weakening ExecutionPolicy globally.'],
    cmds: [
      ['PowerShell', 'Get-Item .\\script.ps1 -Stream *', 'Inspect Zone.Identifier stream'],
      ['PowerShell', 'Unblock-File -Path .\\script.ps1', 'Unblock verified file safely']
    ],
    warn: 'Never unblock unverified files from external sources.',
    expected: 'Script executes cleanly under RemoteSigned policy.',
    prevent: ['Add internal intranet domains to Local Intranet Zone via GPO'],
    diff: 'Beginner',
    time: '3 minutes',
    tags: ['unblock-file', 'zone.identifier', 'remotesigned']
  },
  {
    id: 'AVF-013',
    title: 'Overly Broad Outbound Geo-IP Block Breaking Cloud CDN Assets',
    category: 'Antivirus & Firewall',
    desc: 'Blanket outbound Geo-IP firewall rule causes SaaS web apps to fail loading scripts and fonts.',
    symptoms: ['Cloud apps partially render while firewall logs Geo-IP drops on CDN edge IPs'],
    causes: ['Anycast CDNs register IP blocks across multiple regional registries'],
    steps: ['Restrict Geo-IP blocking to Inbound authentication surfaces rather than all Outbound 443 traffic.', 'Use FQDN/Category threat feeds and allowlist published M365/Cloud IP ranges.'],
    cmds: [
      ['PowerShell', 'Test-NetConnection cdn.office.net -Port 443', 'Test CDN edge connectivity']
    ],
    expected: 'Cloud SaaS static assets load reliably.',
    prevent: ['Enforce Geo-IP rules at Identity Conditional Access and Inbound WAN only'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['geo-ip blocking cdn', 'outbound geo block']
  },

  // ================= 17. WiFi & LAN (13 issues) =================
  {
    id: 'WIF-001',
    title: 'WiFi Connected But No Internet Access',
    category: 'WiFi & LAN',
    desc: 'WiFi connects with full signal bars, but Windows shows No Internet, Secured and websites do not open.',
    symptoms: ['WiFi connected, websites not opening', 'Status reads No Internet, Secured'],
    causes: ['Router WAN uplink down', 'Stale DNS or DHCP lease', 'Unaccepted hotel/guest captive portal'],
    steps: ['Restart router and modem if all devices lack internet; open http://neverssl.com if on guest WiFi.', 'Open CMD as Administrator on PC.', 'Run ipconfig /flushdns and ipconfig /release && ipconfig /renew.', 'Test ping 1.1.1.1 and verify browser connectivity.'],
    cmds: [
      ['CMD', 'ipconfig /flushdns', 'Flush local DNS cache'],
      ['CMD', 'ipconfig /release && ipconfig /renew', 'Renew IPv4 DHCP lease']
    ],
    expected: 'Internet works normally across browsers and apps.',
    prevent: ['Keep wireless NIC drivers updated via OEM utility'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['wifi connected no internet', 'no internet secured', 'flushdns']
  },
  {
    id: 'WIF-002',
    title: 'Sticky WiFi Client Holding Distant Access Point While Walking Office',
    category: 'WiFi & LAN',
    desc: 'Laptop stays connected to a faraway AP at 1 bar (-82 dBm) despite standing beneath a closer AP.',
    symptoms: ['1 signal bar right under ceiling AP', 'Toggling WiFi Off/On jumps to 5 bars'],
    causes: ['Adapter Roaming Aggressiveness too low', 'AP Tx power set to 100% Max', '802.11k/v disabled'],
    steps: ['Set Intel Wi-Fi Roaming Aggressiveness to Medium-High in Device Manager.', 'Enable 802.11k/v on WLAN controller and tune 5 GHz Tx power to 14-18 dBm (2.4 GHz 6 dBm lower).'],
    cmds: [
      ['CMD', 'netsh wlan show interfaces', 'Check current BSSID, channel, and signal %']
    ],
    expected: 'Client roams smoothly to nearest AP below -70 dBm.',
    prevent: ['Never run multi-AP enterprise WiFi at 100% transmit power'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['sticky wifi', 'roaming aggressiveness', '802.11k']
  },
  {
    id: 'WIF-003',
    title: 'Can’t Connect to This Network After WiFi Password or WPA3 Update',
    category: 'WiFi & LAN',
    desc: 'Windows immediately says Cant connect to this network without asking for the updated WiFi password.',
    symptoms: ['Instant connection failure on previously saved SSID'],
    causes: ['Saved WLAN profile caches old PSK or WPA2 cipher mismatching WPA3'],
    steps: ['Delete the cached wireless profile using netsh or Forget in Settings.', 'Enable WPA2/WPA3 Transition Mode on AP for mixed fleets and reconnect.'],
    cmds: [
      ['CMD', 'netsh wlan delete profile name="CorpWiFi"', 'Delete stale saved WiFi profile']
    ],
    expected: 'Windows prompts for fresh credentials and connects.',
    prevent: ['Use WPA2/WPA3 Transition Mode when older Wi-Fi 5 clients exist'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['cant connect to this network', 'netsh wlan delete profile', 'wpa3']
  },
  {
    id: 'WIF-004',
    title: 'WiFi Icon Missing Completely From Windows 11 Taskbar',
    category: 'WiFi & LAN',
    desc: 'Wireless toggle disappears and Intel AX201/AX211 shows Code 10 or Code 43 in Device Manager.',
    symptoms: ['Only Airplane Mode shown in Quick Settings', 'Wi-Fi adapter Code 43'],
    causes: ['CNVi PCIe radio hang on sleep/resume or stopped WlanSvc'],
    steps: ['Ensure WlanSvc is running.', 'Perform a full Cold Shutdown, unplug AC, and hold Power button 20 seconds to reset CNVi rail.', 'Update Intel Wireless driver once adapter reappears.'],
    cmds: [
      ['PowerShell', 'Start-Service WlanSvc; Get-NetAdapter -Physical', 'Check WLAN service and NICs']
    ],
    expected: 'Wireless adapter resets cleanly and WiFi networks reappear.',
    prevent: ['Deploy latest OEM-validated Intel/Qualcomm WLAN drivers'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['wifi icon missing', 'ax211 code 43', 'wlansvc']
  },
  {
    id: 'WIF-005',
    title: 'Slow 2.4 GHz WiFi Speeds Despite Full Signal in Dense Office',
    category: 'WiFi & LAN',
    desc: 'Devices on 2.4 GHz get <5 Mbps and high jitter due to adjacent-channel congestion.',
    symptoms: ['5 signal bars but severe packet jitter and slow speed'],
    causes: ['Overlapping 2.4 GHz channels (2-5, 7-10) or 40 MHz width used on 2.4 GHz'],
    steps: ['Restrict 2.4 GHz strictly to channels 1, 6, 11 at 20 MHz width.', 'Move corporate SSID to 5 GHz + 6 GHz only, keeping 2.4 GHz strictly for IoT devices.'],
    cmds: [
      ['CMD', 'netsh wlan show networks mode=bssid', 'Audit surrounding channels and widths']
    ],
    expected: 'Laptops operate on clean 5/6 GHz spectrum at 300+ Mbps.',
    prevent: ['Never configure 40 MHz channel width on 2.4 GHz'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['2.4ghz slow', 'channels 1 6 11', 'mode=bssid']
  },
  {
    id: 'WIF-006',
    title: '5 GHz WiFi Dropping Simultaneously for All Room Users (DFS Radar Event)',
    category: 'WiFi & LAN',
    desc: 'AP near airport or weather station drops all 5 GHz clients abruptly when radar hits channels 52-144.',
    symptoms: ['Simultaneous 60s drop across room', 'AP logs DFS Radar Detected'],
    causes: ['Mandatory DFS channel evacuation on UNII-2 channels 52-144'],
    steps: ['Verify DFS radar events in WLAN controller logs.', 'Bind conference room APs to non-DFS UNII-1 (36-48) and UNII-3 (149-165) at 40 MHz width.'],
    cmds: [
      ['CMD', 'netsh wlan show interfaces | findstr "Channel"', 'Check active 5 GHz channel']
    ],
    expected: 'Conference video calls run uninterrupted by radar channel hops.',
    prevent: ['Use 40 MHz width instead of 80/160 MHz near airports'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['dfs radar', '5ghz disconnect', 'unii-1']
  },
  {
    id: 'WIF-007',
    title: 'Hotel / Airport Captive Portal Login Screen Not Opening',
    category: 'WiFi & LAN',
    desc: 'Guest WiFi connects with No Internet, and HSTS blocks browser redirect to terms login page.',
    symptoms: ['HTTPS sites show certificate error instead of hotel login splash'],
    causes: ['Custom DNS (1.1.1.1 / DoH) or HSTS blocking HTTP captive redirect'],
    steps: ['Set Wi-Fi DNS temporarily to Automatic (DHCP).', 'Browse to plain HTTP http://neverssl.com or http://<Default-Gateway-IP>.', 'Reconnect VPN after portal authentication succeeds.'],
    cmds: [
      ['CMD', 'ipconfig | findstr "Gateway"', 'Find captive gateway IP']
    ],
    expected: 'Hotel splash page loads immediately.',
    prevent: ['Keep http://neverssl.com bookmarked for travel staff'],
    diff: 'Beginner',
    time: '3 minutes',
    tags: ['captive portal', 'hotel wifi login', 'neverssl']
  },
  {
    id: 'WIF-008',
    title: 'Guest WiFi Client Isolation Blocking Conference Room Wireless Casting',
    category: 'WiFi & LAN',
    desc: 'Visitors on Guest WiFi cannot AirPlay or Cast to room display.',
    symptoms: ['Internet works on Guest WiFi, room display invisible'],
    causes: ['Layer 2 Client Isolation blocks multicast mDNS and RFC1918 subnets'],
    steps: ['Keep Guest Client Isolation ON for security.', 'Enable mDNS Bonjour Gateway scoped strictly to the Apple TV IP, or share via Teams/Zoom Room Meeting ID over internet!'],
    cmds: [
      ['PowerShell', 'Test-NetConnection 10.50.20.10 -Port 7000', 'Check Guest ACL to display IP']
    ],
    expected: 'Guests present securely without exposing corporate LAN.',
    prevent: ['Standardize cloud PIN/Meeting-ID casting in boardrooms'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['guest wifi airplay', 'client isolation', 'mdns gateway']
  },
  {
    id: 'WIF-009',
    title: '802.1X EAP-TLS WiFi Failing After Renaming Laptop Hostname',
    category: 'WiFi & LAN',
    desc: 'Renamed laptop fails certificate WiFi because Machine Certificate SAN still holds old DESKTOP-XXXX name.',
    symptoms: ['RADIUS rejects SAN mismatch after PC rename'],
    causes: ['Certificate enrolled prior to hostname change'],
    steps: ['Plug into Ethernet temporarily.', 'Delete old-named Machine Certificate in certlm.msc and run certutil -pulse to enroll fresh matching cert.'],
    cmds: [
      ['PowerShell', 'Get-ChildItem Cert:\\LocalMachine\\My | Select Subject', 'Check machine cert Subject'],
      ['CMD', 'certutil -pulse', 'Trigger auto-enrollment']
    ],
    expected: 'New certificate matches hostname and EAP-TLS connects.',
    prevent: ['Rename PC before domain certificate auto-enrollment step'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['eap-tls rename', 'certutil -pulse', '802.1x']
  },
  {
    id: 'WIF-010',
    title: 'Wall Ethernet Jack Completely Dead (Switch Port Err-Disabled)',
    category: 'WiFi & LAN',
    desc: 'Moving a dock or IP phone causes wall port link LEDs to turn completely off.',
    symptoms: ['Zero link lights even with known-good cable and laptop'],
    causes: ['Switch port-security tripped err-disabled when MAC count exceeded max'],
    steps: ['Check `show interfaces status err-disabled` on access switch.', 'Increase max MAC count to 3 for Phone + Dock + Laptop, clear sticky MAC, and `shutdown` / `no shutdown` port.'],
    cmds: [
      ['Config / CLI', 'show interfaces status err-disabled', 'Locate tripped switch port']
    ],
    expected: 'Access port recovers and link LEDs turn green.',
    prevent: ['Configure errdisable recovery timer and max 3 MACs for USB-C dock desks'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['err-disabled', 'wall jack dead', 'port security']
  },
  {
    id: 'WIF-011',
    title: 'Docked Laptop Routing Traffic Over Slow WiFi Instead of Gigabit Ethernet',
    category: 'WiFi & LAN',
    desc: 'Laptop keeps both WiFi and Ethernet connected and prefers slower WiFi path.',
    symptoms: ['Transfers cap at WiFi speed while docked to Gigabit LAN'],
    causes: ['Manual high metric on Ethernet or BIOS LAN/WLAN switching disabled'],
    steps: ['Verify AutomaticMetric=True so Gigabit Ethernet (metric 25) beats WiFi (metric 35+).', 'Enable LAN/WLAN Auto-Switching in BIOS if desired.'],
    cmds: [
      ['PowerShell', 'Get-NetIPInterface -AddressFamily IPv4 | Select InterfaceAlias, InterfaceMetric, AutomaticMetric', 'Check adapter metrics']
    ],
    expected: 'Docked traffic uses Gigabit Ethernet automatically.',
    prevent: ['Leave AutomaticMetric enabled across standard endpoints'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['wifi over ethernet', 'interfacemetric', 'docked slow']
  },
  {
    id: 'WIF-012',
    title: 'Micro-Disconnects and Retransmissions From Crushed Ethernet Patch Cable (CRC Errors)',
    category: 'WiFi & LAN',
    desc: 'Gigabit link stays Up, but SQL/RDP drops intermittently due to physical Layer 1 CRC frame errors.',
    symptoms: ['Link stays Up, Get-NetAdapterStatistics shows ReceivedPacketErrors > 0'],
    causes: ['Damaged desk patch cable or untwisted keystone punchdown'],
    steps: ['Check ReceivedPacketErrors in PowerShell and switch port CRC counters.', 'Replace patch cable first; re-terminate wall keystone if CRCs persist.'],
    cmds: [
      ['PowerShell', 'Get-NetAdapterStatistics -Name "Ethernet"', 'Check physical packet error counters']
    ],
    expected: 'CRC error count remains 0 under heavy load.',
    prevent: ['Keep patch cables clear of chair casters'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['crc errors', 'receivedpacketerrors', 'bad patch cable']
  },
  {
    id: 'WIF-013',
    title: 'Mobile Phone MAC Randomization Breaking Corporate NAC or Reservations',
    category: 'WiFi & LAN',
    desc: 'iOS/Android devices rotate synthetic MAC addresses, failing MAC-based NAC rules.',
    symptoms: ['Controller sees randomized locally-administered MAC instead of hardware MAC'],
    causes: ['Private Wi-Fi Address enabled by default on iOS/Android'],
    steps: ['Migrate authentication to 802.1X certificates instead of MAC filtering.', 'Push DisableAssociationMACRandomization=true via MDM strictly for managed corporate SSID.'],
    cmds: [
      ['Config / CLI', 'MDM Wi-Fi Profile -> DisableAssociationMACRandomization = true', 'Disable random MAC on corporate SSID']
    ],
    expected: 'Managed mobile devices authenticate consistently.',
    prevent: ['Use 802.1X EAP-TLS rather than MAC allowlists'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['mac randomization', 'private wifi address', 'nac ios']
  },

  // ================= 18. Software & Applications (13 issues) =================
  {
    id: 'SW-001',
    title: 'App Launch Error: VCRUNTIME140.dll or MSVCP140.dll Was Not Found',
    category: 'Software & Applications',
    desc: 'Desktop software fails to start due to missing Visual C++ 2015-2022 Redistributable libraries.',
    symptoms: ['VCRUNTIME140.dll or MSVCP140.dll was not found popup'],
    causes: ['Missing x86 or x64 VC++ Redistributable runtime'],
    steps: ['Install BOTH x64 and x86 Microsoft VC++ 2015-2022 Redistributables via winget.', 'Never download loose DLL files from unofficial sites.'],
    cmds: [
      ['CMD', 'winget install --id Microsoft.VCRedist.2015+.x64 --silent', 'Install official x64 VC++ runtime'],
      ['CMD', 'winget install --id Microsoft.VCRedist.2015+.x86 --silent', 'Install official x86 VC++ runtime']
    ],
    warn: 'Never download individual .dll files from third-party web pages.',
    expected: 'Application launches immediately.',
    prevent: ['Pre-install x86 + x64 VC++ runtimes in Autopilot baseline'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['vcruntime140.dll', 'msvcp140.dll', 'vcredist']
  },
  {
    id: 'SW-002',
    title: 'MSI Installer Fatal Error 1603 During Software Deployment',
    category: 'Software & Applications',
    errorCode: 'Error 1603',
    desc: 'MSI package rolls back near completion with generic fatal error 1603.',
    symptoms: ['Setup ended prematurely (1603)'],
    causes: ['Pending OS reboot, locked app binary, or missing elevation'],
    steps: ['Run msiexec with `/L*v` verbose logging and search for `Return value 3` to pinpoint exact failing step.', 'Close running app processes, complete pending reboot, and run elevated.'],
    cmds: [
      ['CMD', 'msiexec /i "C:\\Temp\\App.msi" /L*v "C:\\Temp\\install.log"', 'Run MSI with verbose log'],
      ['PowerShell', 'Select-String -Path "C:\\Temp\\install.log" -Pattern "Return value 3" -Context 8,2', 'Find exact failure line']
    ],
    expected: 'Root cause above Return value 3 resolved and MSI returns 0.',
    prevent: ['Always log `/L*v` to Windows\\Temp in enterprise deployment scripts'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['error 1603', 'return value 3', 'msiexec']
  },
  {
    id: 'SW-003',
    title: 'MSI Error 1618: Another Installation Is Already in Progress',
    category: 'Software & Applications',
    errorCode: 'Error 1618',
    desc: 'Software setup blocked because msiexec _MSIExecute mutex is held by another installer.',
    symptoms: ['Another installation is already in progress error'],
    causes: ['Background Intune update running or hung msiexec process'],
    steps: ['Inspect active msiexec command lines first to avoid killing active updates.', 'If completely idle/wedged, restart msiserver service and retry.'],
    cmds: [
      ['PowerShell', "Get-CimInstance Win32_Process -Filter \"Name='msiexec.exe'\" | Select ProcessId, CommandLine", 'Check active MSI command'],
      ['CMD', 'net stop msiserver', 'Release wedged installer mutex']
    ],
    expected: 'Mutex releases and installation proceeds.',
    prevent: ['Allow background Autopilot/Intune installs to finish before manual installs'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['error 1618', 'another installation in progress', 'msiserver']
  },
  {
    id: 'SW-004',
    title: 'Chrome or Edge Tabs Crashing With STATUS_ACCESS_VIOLATION',
    category: 'Software & Applications',
    errorCode: 'STATUS_ACCESS_VIOLATION',
    desc: 'Browser tabs crash repeatedly with Aw, Snap! STATUS_ACCESS_VIOLATION.',
    symptoms: ['Tabs crash on open or randomly with STATUS_ACCESS_VIOLATION'],
    causes: ['Outdated DLP/AV injected DLL hook, corrupted extension, or unstable BIOS/RAM'],
    steps: ['Check `edge://conflicts` or `chrome://conflicts` for third-party injected DLLs and test `--disable-extensions`.', 'Update endpoint DLP/AV agent and BIOS microcode if crashes affect multiple apps.'],
    cmds: [
      ['CMD', 'start msedge.exe --disable-extensions --disable-gpu', 'Test clean browser launch']
    ],
    expected: 'Browser tabs remain stable under heavy multitasking.',
    prevent: ['Keep DLP browser hooks updated alongside Chromium releases'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['status_access_violation', 'aw snap', 'edge conflicts']
  },
  {
    id: 'SW-005',
    title: 'Adobe Acrobat Freezing (Not Responding) for 30s Opening Any PDF',
    category: 'Software & Applications',
    desc: 'Small PDFs hang Acrobat for half a minute on launch.',
    symptoms: ['Acrobat shows Not Responding for 20-40s on every PDF open'],
    causes: ['Online certificate revocation timeout or Protected Mode SMB conflict'],
    steps: ['Uncheck Require server certificate revocation checking under Preferences > Signatures > Verification if offline.', 'Run Help > Repair Installation in Acrobat.'],
    cmds: [
      ['PowerShell', 'Stop-Process -Name "AcroRd32","Acrobat" -Force -ErrorAction SilentlyContinue', 'Terminate hung Acrobat processes']
    ],
    expected: 'PDFs open instantaneously.',
    prevent: ['Deploy clean enterprise Acrobat preferences via customization MST'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['acrobat freezing', 'pdf not responding', 'adobe slow']
  },
  {
    id: 'SW-006',
    title: 'Microsoft Office Click-to-Run Crash Error 30015-11',
    category: 'Software & Applications',
    errorCode: '30015-11',
    desc: 'Word and Excel fail to launch after an interrupted Click-to-Run background update.',
    symptoms: ['Something went wrong [30015-11] popup'],
    causes: ['Half-applied Click-to-Run update or stopped ClickToRunSvc'],
    steps: ['Ensure ClickToRunSvc service is running.', 'Trigger Office Quick Repair via command line (or Online Repair if needed).'],
    cmds: [
      ['PowerShell', 'Start-Service ClickToRunSvc', 'Start Click-to-Run service'],
      ['CMD', '"C:\\Program Files\\Common Files\\Microsoft Shared\\ClickToRun\\OfficeClickToRun.exe" scenario=Repair platform=x64 culture=en-us RepairType=QuickRepair DisplayLevel=True', 'Run Quick Repair']
    ],
    expected: 'Office apps repair in 3 minutes and launch normally.',
    prevent: ['Avoid hard-shutdowns during Office update installation'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['30015-11', 'office quick repair', 'clicktorunsvc']
  },
  {
    id: 'SW-007',
    title: 'Silent App Crash on Launch (Diagnosing Event ID 1000 & .NET 1026)',
    category: 'Software & Applications',
    errorCode: 'Event ID 1000',
    desc: 'Clicking an application icon spins briefly and exits with zero popup message.',
    symptoms: ['Silent exit on launch with no UI error'],
    causes: ['Unhandled .NET exception, read-only config.ini permission, or missing DLL'],
    steps: ['Query Application Event Log IDs 1000 and 1026 immediately to read the exact faulting module and .NET exception stack trace.', 'Fix the exact reported config, DB string, or file ACL.'],
    cmds: [
      ['PowerShell', 'Get-WinEvent -FilterHashtable @{LogName="Application"; ID=1000,1026} -MaxEvents 5 | Format-List TimeCreated, Id, Message', 'Read crash stack trace']
    ],
    expected: 'Exact crash cause identified without blind reinstalls.',
    prevent: ['Review Event 1026 first on every .NET desktop failure'],
    diff: 'Intermediate',
    time: '5-10 minutes',
    tags: ['silent app crash', 'event 1000', 'event 1026']
  },
  {
    id: 'SW-008',
    title: '32-Bit vs 64-Bit ODBC Data Source Not Found (IM002)',
    category: 'Software & Applications',
    errorCode: 'IM002',
    desc: '32-bit ERP/Crystal Reports app throws Data source name not found even though DSN exists in default 64-bit ODBC admin.',
    symptoms: ['Error IM002 Data source name not found'],
    causes: ['DSN created in 64-bit System32\\odbcad32.exe instead of 32-bit SysWOW64\\odbcad32.exe'],
    steps: ['Open `C:\\Windows\\SysWOW64\\odbcad32.exe` specifically for 32-bit applications and create the System DSN there.'],
    cmds: [
      ['CMD', 'C:\\Windows\\SysWOW64\\odbcad32.exe', 'Launch 32-bit ODBC Administrator'],
      ['PowerShell', 'Get-OdbcDsn | Select Name, Platform, DriverName', 'Audit 32-bit vs 64-bit DSNs']
    ],
    expected: '32-bit app connects to ODBC DSN immediately.',
    prevent: ['Check app bitness in Task Manager Details before configuring ODBC'],
    diff: 'Intermediate',
    time: '5 minutes',
    tags: ['im002', 'syswow64 odbcad32', 'dsn not found']
  },
  {
    id: 'SW-009',
    title: 'Cannot Uninstall or Upgrade Program Due to Missing Cached MSI',
    category: 'Software & Applications',
    desc: 'Uninstalling fails with The feature you are trying to use is on a network resource that is unavailable.',
    symptoms: ['Blocked from both uninstalling old version and installing new version'],
    causes: ['Deleted cached MSI inside C:\\Windows\\Installer'],
    steps: ['Supply original matching version .msi if available, or run Microsoft Program Install and Uninstall Troubleshooter to clean orphaned MSI GUID registry entries.'],
    cmds: [
      ['PowerShell', 'Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Where DisplayName -like "*App*" | Select DisplayName, PSChildName', 'Locate MSI ProductCode GUID']
    ],
    warn: 'Never delete files inside C:\\Windows\\Installer.',
    expected: 'Broken MSI registration clears and upgrade installs cleanly.',
    prevent: ['Ban third-party registry/disk cleaner tools on corporate PCs'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['network resource unavailable msi', 'missing msi uninstall']
  },
  {
    id: 'SW-010',
    title: 'Replacing Commercial Oracle Java JRE With OpenJDK / OpenWebStart',
    category: 'Software & Applications',
    desc: 'Legacy Java or .jnlp app fails after removing unlicensed Oracle Java SE.',
    symptoms: ['No Java Runtime Present or .jnlp opens in Notepad'],
    causes: ['Oracle JRE removed for licensing compliance without OpenJDK replacement'],
    steps: ['Install free Eclipse Temurin OpenJDK JRE via winget, plus OpenWebStart if .jnlp files are required.'],
    cmds: [
      ['CMD', 'winget install --id EclipseAdoptium.Temurin.17.JRE --silent', 'Install license-free Temurin JRE'],
      ['CMD', 'java -version', 'Verify active Java runtime']
    ],
    expected: 'Java apps run cleanly with zero licensing audit risk.',
    prevent: ['Audit endpoints quarterly for rogue commercial Oracle Java installs'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['oracle java replacement', 'temurin', 'jnlp openwebstart']
  },
  {
    id: 'SW-011',
    title: 'Tiny Cut-Off Buttons or Blurry Text in Legacy App on 4K Display',
    category: 'Software & Applications',
    desc: 'Older WinForms application renders tiny overlapping dialogs at 150-200% DPI scaling.',
    symptoms: ['Buttons clipped or text unreadable on HiDPI laptop'],
    causes: ['Legacy binary lacks HiDPI manifest'],
    steps: ['Right-click app .exe > Properties > Compatibility > Change high DPI settings.', 'Enable Override high DPI scaling behavior performed by: System (Enhanced).'],
    cmds: [
      ['PowerShell', 'Get-ItemProperty "HKCU:\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers" -ErrorAction SilentlyContinue', 'Inspect DPI compatibility flags']
    ],
    expected: 'Dialogs scale cleanly on 4K displays.',
    prevent: ['Deploy AppCompatFlags registry values via GPO for legacy apps'],
    diff: 'Beginner',
    time: '3 minutes',
    tags: ['blurry app 4k', 'hidpi scaling', 'system enhanced']
  },
  {
    id: 'SW-012',
    title: 'Winget Failing With 0x8a15000f (Source Data Missing)',
    category: 'Software & Applications',
    errorCode: '0x8a15000f',
    desc: 'winget search or upgrade fails due to outdated CDN certificate/index in App Installer.',
    symptoms: ['0x8a15000f : Data required by the source is missing'],
    causes: ['Stale local winget source cache'],
    steps: ['Update App Installer via Microsoft Store and reset winget sources as Administrator.'],
    cmds: [
      ['CMD', 'winget source reset --force && winget source update', 'Reset winget repository cache']
    ],
    expected: 'winget package searches and upgrades succeed.',
    prevent: ['Keep Microsoft.DesktopAppInstaller auto-updated'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['0x8a15000f', 'winget source reset']
  },
  {
    id: 'SW-013',
    title: 'CAD Floating License Checkout Error (FlexLM -15 / Vendor Daemon Port Blocked)',
    category: 'Software & Applications',
    errorCode: 'FlexLM -15',
    desc: 'AutoCAD or SolidWorks cannot check out network seat with error -15,570.',
    symptoms: ['FlexNet Licensing error -15,570 on launch'],
    causes: ['Dynamic Vendor Daemon port blocked by server firewall while only lmgrd 27000 is open'],
    steps: ['Pin static PORT=2080 on the VENDOR line in the .lic file, open BOTH TCP 27000 and TCP 2080 on server firewall, and restart FlexLM service.'],
    cmds: [
      ['PowerShell', 'Test-NetConnection lic01.corp.local -Port 27000', 'Verify lmgrd port'],
      ['PowerShell', 'Test-NetConnection lic01.corp.local -Port 2080', 'Verify pinned vendor daemon port']
    ],
    expected: 'Workstations check out floating CAD seats in <2 seconds.',
    prevent: ['Always pin static vendor daemon ports in FlexLM license files'],
    diff: 'Advanced',
    time: '15 minutes',
    tags: ['flexlm -15', '27000', 'cad floating license']
  },

  // ================= 19. Email Troubleshooting (13 issues) =================
  {
    id: 'EML-001',
    title: 'Outbound Mail Bouncing 550 5.7.1 Due to IP Blacklist (RBL)',
    category: 'Email Troubleshooting',
    errorCode: '550 5.7.1',
    desc: 'External emails bounce because static WAN IP is listed on Spamhaus or Barracuda RBL.',
    symptoms: ['550 5.7.1 Client host blocked using Spamhaus'],
    causes: ['Infected LAN PC sending port 25 spam or missing Reverse PTR record'],
    steps: ['Block outbound TCP 25 on edge firewall for all subnets EXCEPT your mail relay first.', 'Verify ISP Reverse DNS (PTR) matches SMTP banner, then submit RBL delisting.'],
    cmds: [
      ['PowerShell', 'Resolve-DnsName 203.0.113.25 -Type PTR', 'Verify Reverse DNS PTR record']
    ],
    expected: 'Port 25 leak closed, IP delisted, and outbound mail delivers.',
    prevent: ['Block outbound TCP 25 from client VLANs on every firewall'],
    diff: 'Intermediate',
    time: '20 minutes',
    tags: ['550 5.7.1', 'spamhaus blacklist', 'reverse ptr']
  },
  {
    id: 'EML-002',
    title: 'SPF PermError: Exceeding 10 DNS Lookup Limit',
    category: 'Email Troubleshooting',
    errorCode: 'SPF PermError',
    desc: 'Adding too many SaaS include statements pushes recursive SPF DNS queries past 10, breaking SPF.',
    symptoms: ['spf=permerror (too many DNS lookups) in headers'],
    causes: ['RFC 7208 caps SPF mechanisms at 10 total DNS lookups; or two v=spf1 TXT records exist'],
    steps: ['Ensure only ONE v=spf1 TXT record exists at root.', 'Remove retired includes and move bulk/CRM senders onto dedicated subdomains (e.g., mktg.company.com).'],
    cmds: [
      ['PowerShell', 'Resolve-DnsName company.com -Type TXT | Where Strings -match "spf1"', 'Inspect active SPF record']
    ],
    expected: 'Lookup count stays <= 8 and spf=pass restores.',
    prevent: ['Use separate subdomains for marketing and transactional SaaS mailers'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['spf permerror', '10 dns lookup limit']
  },
  {
    id: 'EML-003',
    title: 'Legitimate Supplier Email Held in Microsoft Defender Quarantine',
    category: 'Email Troubleshooting',
    desc: 'Expected invoice is missing from Inbox and Junk because Defender quarantined it.',
    symptoms: ['Message Trace shows Quarantined status'],
    causes: ['Spoof intelligence or high-confidence phish heuristic triggered'],
    steps: ['Run Exchange Message Trace first.', 'Inspect SPF/DKIM headers and URLs in security.microsoft.com > Quarantine before releasing safe mail.'],
    cmds: [
      ['PowerShell', 'Get-MessageTrace -SenderAddress "ap@vendor.com" -StartDate (Get-Date).AddDays(-2) -EndDate (Get-Date)', 'Trace message delivery']
    ],
    warn: 'Never whitelist entire external domains bypassing phish checks.',
    expected: 'Verified invoice releases safely to recipient Inbox.',
    prevent: ['Ask external suppliers to fix broken SPF/DKIM records on their domain'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['quarantine release', 'get-messagetrace']
  },
  {
    id: 'EML-004',
    title: 'NDR 550 5.1.10 Recipient Not Found in Exchange Hybrid',
    category: 'Email Troubleshooting',
    errorCode: '550 5.1.10',
    desc: 'External emails to new user bounce with RESOLVER.ADR.RecipientNotFound.',
    symptoms: ['550 5.1.10 bounce on external mail'],
    causes: ['Missing Enable-RemoteMailbox routing attributes in Hybrid AD or Authoritative domain mismatch'],
    steps: ['Check Get-EXORecipient for target address.', 'Use Enable-RemoteMailbox on-prem for Hybrid users, or set Accepted Domain to InternalRelay if split-routing.'],
    cmds: [
      ['PowerShell', 'Get-EXORecipient -Identity "newuser@company.com"', 'Confirm cloud mailbox exists']
    ],
    expected: 'Inbound external mail routes cleanly to user mailbox.',
    prevent: ['Standardize New-RemoteMailbox in Hybrid provisioning scripts'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['550 5.1.10', 'recipientnotfound', 'enable-remotemailbox']
  },
  {
    id: 'EML-005',
    title: 'Inbound OTP / Verification Emails Delayed by 45 Minutes',
    category: 'Email Troubleshooting',
    errorCode: '451 4.4.0',
    desc: 'Time-sensitive OTP emails arrive long after expiring.',
    symptoms: ['Large timestamp gap between Sent and Delivered'],
    causes: ['Spam gateway Greylisting or opportunistic TLS deferral'],
    steps: ['Analyze raw headers in Message Header Analyzer to pinpoint the exact delayed hop.', 'Disable legacy Greylisting or fix TLS cert on receiving gateway.'],
    cmds: [
      ['Bash', 'dig MX company.com +short', 'Verify MX records have no dead hosts']
    ],
    expected: 'Inbound transactional emails arrive in <5 seconds.',
    prevent: ['Replace Greylisting with modern DKIM/DMARC filtering'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['delayed email', 'greylisting', 'header analyzer']
  },
  {
    id: 'EML-006',
    title: '21 MB Attachment Bouncing Against 25 MB Limit (552 5.3.4 Base64 Overhead)',
    category: 'Email Troubleshooting',
    errorCode: '552 5.3.4',
    desc: 'Attachment smaller than 25 MB bounces with Message size exceeds fixed maximum.',
    symptoms: ['552 5.3.4 bounce on 20-22 MB attachment'],
    causes: ['MIME Base64 encoding adds ~33% size overhead on wire'],
    steps: ['Explain 33% Base64 overhead and share files >15 MB via OneDrive/SharePoint expiring links instead of raw attachments.'],
    cmds: [
      ['PowerShell', 'Get-Mailbox "jsmith@company.com" | Select MaxSendSize, MaxReceiveSize', 'Check mailbox limits']
    ],
    expected: 'Large deliverables share reliably via secure cloud links.',
    prevent: ['Enable OneDrive cloud attachment integration in Outlook'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['552 5.3.4', 'attachment too large', 'base64 33%']
  },
  {
    id: 'EML-007',
    title: 'External Customers Bouncing From Public Distribution List (550 5.7.133)',
    category: 'Email Troubleshooting',
    errorCode: '550 5.7.133',
    desc: 'External emails to sales@company.com bounce with SenderNotAuthenticatedForGroup.',
    symptoms: ['Internal mail works, external mail bounces 550 5.7.133'],
    causes: ['RequireSenderAuthenticationEnabled defaults to $true on new DLs'],
    steps: ['Verify list is intended for external customers, then set -RequireSenderAuthenticationEnabled $false.'],
    cmds: [
      ['PowerShell', 'Set-DistributionGroup -Identity "sales@company.com" -RequireSenderAuthenticationEnabled $false', 'Allow external senders']
    ],
    warn: 'Keep internal all-staff DLs locked to internal senders only.',
    expected: 'External customers reach sales@company.com cleanly.',
    prevent: ['Audit external sender flag when creating customer-facing groups'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['550 5.7.133', 'distribution list external']
  },
  {
    id: 'EML-008',
    title: 'User Blocked From Sending Outbound Mail (550 5.1.8 Restricted Entity)',
    category: 'Email Troubleshooting',
    errorCode: '550 5.1.8',
    desc: 'Exchange Online blocks user outbound mail due to spam/bulk threshold trigger.',
    symptoms: ['550 5.1.8 Access denied, bad outbound sender'],
    causes: ['Compromised account burst or bulk newsletter sent from Outlook'],
    steps: ['Audit Entra Sign-in logs for compromise first!', 'Once secured or confirmed benign, unblock user under security.microsoft.com > Restricted entities.'],
    cmds: [
      ['PowerShell', 'Get-BlockedSenderAddress', 'Check restricted outbound users']
    ],
    expected: 'Outbound sending restores within 30 minutes.',
    prevent: ['Never send bulk marketing blasts from standard Outlook mailboxes'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['550 5.1.8', 'restricted entities', 'bad outbound sender']
  },
  {
    id: 'EML-009',
    title: 'DKIM Body Hash Failing After Signature/Disclaimer Smart-Host',
    category: 'Email Troubleshooting',
    desc: 'External headers show dkim=fail (body hash did not verify) when HTML signature stamps.',
    symptoms: ['dkim=fail on outbound mail passing through signature gateway'],
    causes: ['Downstream relay altered body after Exchange signed DKIM'],
    steps: ['Configure custom DKIM CNAME signing on the final egress signature/DLP hop so post-modified body is re-signed.'],
    cmds: [
      ['PowerShell', 'Get-DkimSigningConfig -Identity company.com | Select Enabled, Selector1CNAME', 'Inspect DKIM status']
    ],
    expected: 'Final hop signs modified message and dkim=pass succeeds.',
    prevent: ['Test Authentication-Results headers whenever adding mail-flow connectors'],
    diff: 'Advanced',
    time: '15 minutes',
    tags: ['dkim body hash fail', 'exclaimer dkim']
  },
  {
    id: 'EML-010',
    title: 'Mail Loop Error 554 5.4.6 Hop Count Exceeded Between Gateways',
    category: 'Email Troubleshooting',
    errorCode: '554 5.4.6',
    desc: 'Emails ping-pong between Exchange Online and third-party gateway until hop count hits max.',
    symptoms: ['554 5.4.6 Hop count exceeded - possible mail loop'],
    causes: ['InternalRelay domain forwarding unknown recipients back to upstream MX'],
    steps: ['Set final mailbox host Accepted Domain to Authoritative after cutover and fix connector scoping.'],
    cmds: [
      ['PowerShell', 'Get-AcceptedDomain | Select DomainName, DomainType', 'Check Authoritative vs InternalRelay']
    ],
    expected: 'Mail delivers cleanly in single pass.',
    prevent: ['Switch InternalRelay to Authoritative immediately post-migration'],
    diff: 'Advanced',
    time: '20 minutes',
    tags: ['554 5.4.6', 'hop count exceeded', 'mail loop']
  },
  {
    id: 'EML-011',
    title: 'Website Contact Form Emails Quarantined as Spoofed Phishing',
    category: 'Email Troubleshooting',
    desc: 'Web server sends unauthenticated PHP mail() as From: info@company.com, triggering spoof blocks.',
    symptoms: ['Web lead notifications land in High Confidence Spoof quarantine'],
    causes: ['Unauthenticated web host IP not authorized or DKIM-signed'],
    steps: ['Send website forms via authenticated SES/Postmark/SendGrid on subdomain notify.company.com with Reply-To set to visitor email.'],
    cmds: [
      ['Bash', 'dig TXT notify.company.com +short', 'Verify transactional subdomain SPF']
    ],
    expected: 'Web notifications pass DKIM/DMARC and arrive in Inbox.',
    prevent: ['Never spoof visitor email in From header—use Reply-To'],
    diff: 'Beginner',
    time: '15 minutes',
    tags: ['contact form spam', 'spoof quarantine', 'reply-to']
  },
  {
    id: 'EML-012',
    title: 'Preserving Departed Employee Mailbox Without Paying Monthly M365 License',
    category: 'Email Troubleshooting',
    desc: 'Retaining former employee email (<50 GB) without ongoing license cost.',
    symptoms: ['Removing license directly deletes mailbox after 30 days'],
    causes: ['User mailbox not converted to Shared Mailbox prior to license removal'],
    steps: ['Convert to Shared Mailbox (`Set-Mailbox -Type Shared`) FIRST, verify <50 GB and no Litigation Hold, delegate manager access, then remove license.'],
    cmds: [
      ['PowerShell', 'Set-Mailbox -Identity "former@company.com" -Type Shared', 'Convert to Shared Mailbox before unlicensed']
    ],
    warn: 'Mailboxes >50 GB or on Litigation Hold still require Exchange Online Plan 2.',
    expected: 'Mailbox preserved at zero license cost.',
    prevent: ['Add Shared Mailbox conversion to standard offboarding SOP'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['departed employee mailbox', 'shared mailbox license']
  },
  {
    id: 'EML-013',
    title: 'Gmail / Yahoo Bulk Sender Rejections (550-5.7.26 One-Click Unsubscribe)',
    category: 'Email Troubleshooting',
    errorCode: '550-5.7.26',
    desc: 'Marketing blasts >5,000/day rejected by Gmail/Yahoo bulk sender enforcement.',
    symptoms: ['550-5.7.26 bounce or spam rate >0.3%'],
    causes: ['Missing aligned DMARC, PTR, or RFC 8058 List-Unsubscribe-Post header'],
    steps: ['Monitor spam rate (<0.10%) in Google Postmaster Tools, enforce aligned DKIM + DMARC, and enable One-Click List-Unsubscribe in ESP.'],
    cmds: [
      ['Bash', 'dig TXT _dmarc.mktg.company.com +short', 'Confirm DMARC policy exists']
    ],
    expected: 'Bulk newsletters deliver cleanly.',
    prevent: ['Sunset unengaged subscribers after 180 days'],
    diff: 'Intermediate',
    time: '20 minutes',
    tags: ['gmail 5.7.26', 'list-unsubscribe-post', 'bulk sender']
  },

  // ================= 20. Backup & Recovery (13 issues) =================
  {
    id: 'BKP-001',
    title: 'SQL Server .LDF Transaction Log Filling Disk Despite Nightly Full Backups',
    category: 'Backup & Recovery',
    desc: 'Full SQL backups succeed, yet .ldf transaction log balloons to ratusan GB.',
    symptoms: ['SQL .ldf consumes 99% of disk in FULL recovery model'],
    causes: ['Full backups never truncate logs—only Transaction Log backups reuse VLFs'],
    steps: ['Check log_reuse_wait_desc in sys.databases.', 'Schedule 15-minute Transaction Log backups, run one immediately, and shrink bloated .ldf to sensible fixed size once.'],
    cmds: [
      ['PowerShell', 'Invoke-Sqlcmd -Query "SELECT name, recovery_model_desc, log_reuse_wait_desc FROM sys.databases"', 'Check log reuse wait']
    ],
    warn: 'Never delete .ldf files in Explorer.',
    expected: 'Transaction log recycles space cleanly.',
    prevent: ['Always pair FULL recovery SQL DBs with 15-min log backups'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['sql ldf full', 'log_reuse_wait_desc', 'transaction log']
  },
  {
    id: 'BKP-002',
    title: 'Orphaned VMware / Hyper-V Backup Snapshots Filling Datastore',
    category: 'Backup & Recovery',
    desc: 'Lingering .avhdx or -delta.vmdk backup checkpoints degrade I/O and fill storage.',
    symptoms: ['Dozens of delta VMDK / AVHDX files in datastore'],
    causes: ['Interrupted backup proxy snapshot consolidation'],
    steps: ['Never delete .avhdx or -delta.vmdk manually!', 'Run VMware Snapshot > Consolidate or Hyper-V Remove-VMSnapshot / Merge-VHD during maintenance window.'],
    cmds: [
      ['PowerShell', 'Get-VM | Get-VMSnapshot | Select VMName, Name, CreationTime', 'List lingering Hyper-V checkpoints']
    ],
    warn: 'Manual deletion of delta disks permanently destroys recent VM data.',
    expected: 'Delta disks merge cleanly into base VHDX/VMDK.',
    prevent: ['Alert on any hypervisor snapshot older than 48 hours'],
    diff: 'Advanced',
    time: '30 minutes',
    tags: ['orphaned avhdx', 'consolidate disks', 'vm snapshot full']
  },
  {
    id: 'BKP-003',
    title: 'Backup Repository Out of Space During Weekly Synthetic Full',
    category: 'Backup & Recovery',
    desc: 'Backup target fills on weekends because NTFS lacks block-cloning.',
    symptoms: ['Synthetic Full fails with insufficient repository space'],
    causes: ['Repository formatted NTFS instead of ReFS 64K / XFS reflink'],
    steps: ['Prune retired VM chains for immediate space, and migrate repositories to ReFS 64K (Windows) or XFS reflink=1 (Linux) for spaceless Synthetic Fulls.'],
    cmds: [
      ['CMD', 'fsutil fsinfo refsinfo E:', 'Verify ReFS 64K Fast Clone volume']
    ],
    expected: 'Synthetic Fulls complete using zero-space block pointers.',
    prevent: ['Format Veeam repositories as ReFS 64KB or XFS reflink'],
    diff: 'Intermediate',
    time: '20 minutes',
    tags: ['synthetic full space', 'refs 64k', 'xfs reflink']
  },
  {
    id: 'BKP-004',
    title: 'Instant Single-File Recovery Using Windows VSS Previous Versions',
    category: 'Backup & Recovery',
    desc: 'User overwrote shared Excel file an hour ago and needs morning version fast.',
    symptoms: ['Accidental overwrite on Windows File Server share'],
    causes: ['Human edit mistake on shared drive'],
    steps: ['Right-click parent share folder > Properties > Previous Versions, open morning snapshot, and copy file out with -restored suffix.'],
    cmds: [
      ['CMD', 'vssadmin list shadows /for=D:', 'Verify scheduled VSS snapshots']
    ],
    expected: 'File recovered in 60 seconds without mounting full backups.',
    prevent: ['Schedule 07:00 and 12:00 VSS Shadow Copies on file servers'],
    diff: 'Beginner',
    time: '3 minutes',
    tags: ['previous versions', 'shadow copy restore']
  },
  {
    id: 'BKP-005',
    title: 'SharePoint / OneDrive Mass Ransomware or Deletion Point-in-Time Rollback',
    category: 'Backup & Recovery',
    desc: 'Infected PC synced thousands of encrypted/deleted files to SharePoint.',
    symptoms: ['Mass file corruption across SharePoint document library'],
    causes: ['OneDrive client synced endpoint ransomware/deletion'],
    steps: ['Isolate infected PC and revoke tokens FIRST.', 'Use SharePoint Settings > Restore this library to roll back point-in-time prior to spike (or restore from M365 SaaS backup).'],
    cmds: [
      ['Config / CLI', 'SharePoint Gear Icon > Restore this library -> Select pre-incident timestamp', 'Point-in-time library rollback']
    ],
    expected: 'Entire library restores cleanly to pre-incident state.',
    prevent: ['Maintain immutable 3rd-party M365 SaaS backups beyond 30-day native window'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['restore sharepoint library', 'onedrive rollback']
  },
  {
    id: 'BKP-006',
    title: 'Restored AD Users Deleted Again Due to Non-Authoritative Restore',
    category: 'Backup & Recovery',
    desc: 'AD objects restored from backup vanish upon replication with partner DCs.',
    symptoms: ['Restored OU disappears 5 minutes after booting DC'],
    causes: ['Non-authoritative restore has lower USN than live DCs'],
    steps: ['Use AD Recycle Bin (`Restore-ADObject`) online whenever enabled!', 'If DSRM restore required, mark subtree authoritative via `ntdsutil -> authoritative restore` before rebooting normal.'],
    cmds: [
      ['CMD', 'ntdsutil "activate instance ntds" "authoritative restore" "restore subtree OU=Sales,DC=corp,DC=local" q q', 'Bump USN in DSRM']
    ],
    warn: 'Run bcdedit /deletevalue safeboot before exiting DSRM.',
    expected: 'Restored objects replicate outward to all DCs.',
    prevent: ['Enable AD Recycle Bin across every forest'],
    diff: 'Advanced',
    time: '30 minutes',
    tags: ['authoritative restore', 'ntdsutil', 'dsrm']
  },
  {
    id: 'BKP-007',
    title: 'Nightly Linux rsync / Borg Offsite Backup Dropping With SSH Broken Pipe',
    category: 'Backup & Recovery',
    desc: 'Long offsite backup aborts at 2 AM with SSH Broken pipe.',
    symptoms: ['client_loop: send disconnect: Broken pipe in cron log'],
    causes: ['Stateful NAT dropping idle SSH control channel during file hashing'],
    steps: ['Add `-o ServerAliveInterval=30 -o ServerAliveCountMax=6` to SSH transport options.'],
    cmds: [
      ['Bash', 'rsync -avz --partial -e "ssh -o ServerAliveInterval=30" /data/ backup@vault:/repo/', 'Keep SSH backup session alive']
    ],
    expected: 'Offsite backups complete without idle disconnects.',
    prevent: ['Monitor nightly cron completion via heartbeat check'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['rsync broken pipe', 'serveraliveinterval']
  },
  {
    id: 'BKP-008',
    title: 'S3 Object Lock / Hardened Linux Immutable Backup Refusing Early Deletion',
    category: 'Backup & Recovery',
    desc: 'Admin gets Access Denied trying to delete immutable backup files early.',
    symptoms: ['Operation not permitted even as root / AWS Root'],
    causes: ['S3 Compliance Mode / immutable chattr +i prevents deletion before retention expiry by design'],
    steps: ['Expand storage bucket/disk capacity rather than attempting to bypass Compliance Lock, and adjust future retention policy.'],
    cmds: [
      ['Bash', 'lsattr /mnt/backup/repo/', 'Inspect immutable flags']
    ],
    expected: 'Capacity scaled safely while preserving anti-ransomware immutability.',
    prevent: ['Size immutable storage with 25% growth buffer'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['s3 object lock', 'immutable backup full', 'lsattr']
  },
  {
    id: 'BKP-009',
    title: 'Restored Bare-Metal Server BSOD INACCESSIBLE_BOOT_DEVICE on New Hypervisor',
    category: 'Backup & Recovery',
    errorCode: 'INACCESSIBLE_BOOT_DEVICE',
    desc: 'Physical-to-Virtual restore crashes on boot due to UEFI/BIOS or SCSI driver mismatch.',
    symptoms: ['INACCESSIBLE_BOOT_DEVICE 3 seconds into boot'],
    causes: ['MBR vs GPT UEFI mismatch or disabled pvscsi/storahci boot driver'],
    steps: ['Match Gen1 BIOS (MBR) vs Gen2 UEFI (GPT) first.', 'Boot initially on LSI Logic SAS / standard AHCI controller, install guest tools, then switch to Paravirtual SCSI.'],
    cmds: [
      ['CMD', 'bcdedit /enum', 'Verify boot loader path inside WinRE']
    ],
    expected: 'Restored server boots cleanly on target hypervisor.',
    prevent: ['Run automated DR boot verification quarterly'],
    diff: 'Advanced',
    time: '25 minutes',
    tags: ['inaccessible_boot_device', 'p2v bsod', 'lsi logic sas']
  },
  {
    id: 'BKP-010',
    title: 'Raw File Copy of Live PostgreSQL / MySQL Failing to Restore (Torn Pages)',
    category: 'Backup & Recovery',
    desc: 'Restoring tar/rsync of live /var/lib/mysql or postgresql fails checksums.',
    symptoms: ['Database refuses to start with corrupted WAL/InnoDB pages'],
    causes: ['Raw file copy of active DB without pg_dump/pg_basebackup or VSS freeze'],
    steps: ['Replace raw folder copies with `pg_dump -Fc`, `pg_basebackup`, or `mysqldump --single-transaction`.'],
    cmds: [
      ['Bash', 'pg_dump -Fc -U postgres appdb > /backups/appdb.dump', 'Consistent Postgres dump']
    ],
    expected: 'Database backups restore cleanly on every test.',
    prevent: ['Automate weekly test restores into disposable containers'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['corrupted db backup', 'pg_dump', 'mysqldump']
  },
  {
    id: 'BKP-011',
    title: 'Bare-Metal Windows Backup Failing With 0x80780119 (Recovery Partition Full)',
    category: 'Backup & Recovery',
    errorCode: '0x80780119',
    desc: 'Windows image backup fails despite 300 GB free on C: because hidden EFI/WinRE has <50 MB free.',
    symptoms: ['Error 0x80780119 creating volume shadow copy'],
    causes: ['Undersized 100 MB EFI or 500 MB WinRE partition full'],
    steps: ['Check hidden volume free MB with Get-Volume.', 'Trim USN journal on tight partition or expand WinRE partition to 1 GB.'],
    cmds: [
      ['PowerShell', 'Get-Volume | Select DriveLetter, FileSystemLabel, SizeRemaining', 'Check hidden partition free space']
    ],
    expected: 'VSS snapshot succeeds across all boot critical volumes.',
    prevent: ['Allocate 260 MB EFI and 1 GB WinRE on new installs'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['0x80780119', 'winre partition full', 'bare metal backup']
  },
  {
    id: 'BKP-012',
    title: 'BitLocker Encrypted Backup Drive Locked During Total AD-Down DR',
    category: 'Backup & Recovery',
    desc: 'USB/SAN backup volume requests 48-digit BitLocker Recovery Key while AD itself is offline.',
    symptoms: ['Cannot query AD for BitLocker key when restoring AD'],
    causes: ['Backup BitLocker keys stored only inside the AD domain being protected'],
    steps: ['Unlock volume with offline-escrowed 48-digit key using `manage-bde -unlock` and store DR keys in an out-of-band cloud/printed vault.'],
    cmds: [
      ['CMD', 'manage-bde -unlock E: -RecoveryPassword XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXXXX', 'Unlock encrypted backup drive']
    ],
    warn: 'Never store backup decryption keys solely inside the infrastructure they protect.',
    expected: 'Backup volume mounts immediately in clean-room DR.',
    prevent: ['Maintain break-glass offline vault of DR BitLocker & Veeam encryption passwords'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['bitlocker backup locked', 'manage-bde -unlock', 'break-glass dr']
  },
  {
    id: 'BKP-013',
    title: 'Nightly Backup Overrunning Into Business Hours (NBD Fallback Bottleneck)',
    category: 'Backup & Recovery',
    desc: 'VM backups crawl at 25 MB/s for 12 hours, impacting daytime production I/O.',
    symptoms: ['Backup still running at 10 AM; Network/Source bottleneck >85%'],
    causes: ['Backup proxy fell back to 1 GbE NBD management network or CBT disabled'],
    steps: ['Deploy on-cluster virtual Backup Proxy for HotAdd transport and verify Changed Block Tracking (ctkEnabled=TRUE) is active.'],
    cmds: [
      ['PowerShell', 'Get-NetAdapter | Select Name, LinkSpeed', 'Verify backup proxy 10GbE link']
    ],
    expected: 'Incremental window drops from 12 hours to <30 minutes.',
    prevent: ['Monitor backup transport mode (HotAdd/DirectSAN vs NBD) alerts'],
    diff: 'Advanced',
    time: '20 minutes',
    tags: ['slow backup', 'nbd vs hotadd', 'cbt vmware']
  }
];

export const ISSUES_PART_4 = expandIssues(SEEDS_PART_4);
