import { CompactIssueSeed, expandIssues } from './issueBuilder';

const SEEDS_PART_1: CompactIssueSeed[] = [
  // ================= 1. Windows 10 & Windows 11 (13 issues) =================
  {
    id: 'WIN-001',
    title: 'Windows Update Failed with Error 0x80070005 (Access Denied)',
    category: 'Windows 10 & Windows 11',
    errorCode: '0x80070005',
    desc: 'Windows Update fails to install cumulative or feature updates due to insufficient permissions or locked SoftwareDistribution files.',
    symptoms: ['Windows Update stops at 0% or rolls back during installation', 'Error code 0x80070005 appears in Settings > Windows Update'],
    causes: ['Corrupted SoftwareDistribution cache', 'Third-party endpoint protection blocking TrustedInstaller', 'Standard user account or broken ACLs on system folders'],
    steps: ['Sign in with a Local Administrator account.', 'Stop Windows Update and BITS services from an elevated prompt.', 'Rename SoftwareDistribution and catroot2 folders to clear cached packages.', 'Restart update services and trigger a fresh update scan.'],
    cmds: [
      ['CMD', 'net stop wuauserv && net stop bits && net stop cryptsvc', 'Stop update services'],
      ['CMD', 'ren C:\\Windows\\SoftwareDistribution SoftwareDistribution.old', 'Reset update cache'],
      ['CMD', 'net start cryptsvc && net start bits && net start wuauserv', 'Restart update services']
    ],
    warn: 'Run commands as Administrator. Temporarily pausing endpoint protection requires security approval in corporate environments.',
    expected: 'Windows Update downloads fresh metadata and installs updates without access denied errors.',
    prevent: ['Keep at least 20 GB free on C: drive', 'Avoid force-powering off PCs during patch Tuesday reboots'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['0x80070005', 'windows update failed', 'access denied', 'wuauserv', 'softwaredistribution']
  },
  {
    id: 'WIN-002',
    title: 'Start Menu and Taskbar Unresponsive in Windows 11',
    category: 'Windows 10 & Windows 11',
    desc: 'Clicking the Windows Start button, Search icon, or system tray does nothing after login or OS upgrade.',
    symptoms: ['Start button does not open on click or Windows key press', 'Taskbar icons freeze or disappear'],
    causes: ['Hung Windows Explorer shell process', 'Corrupted StartMenuExperienceHost AppX registration', 'Damaged system component store'],
    steps: ['Restart Windows Explorer from Task Manager or PowerShell.', 'Re-register StartMenuExperienceHost and ShellExperienceHost packages.', 'Run System File Checker to repair damaged shell binaries.', 'Reboot the workstation and test Start Menu responsiveness.'],
    cmds: [
      ['PowerShell', 'Stop-Process -Name explorer -Force; Start-Process explorer', 'Restart shell immediately'],
      ['PowerShell', 'Get-AppxPackage Microsoft.Windows.StartMenuExperienceHost | Foreach {Add-AppxPackage -DisableDevelopmentMode -Register "$($_.InstallLocation)\\AppXManifest.xml"}', 'Re-register Start Menu package'],
      ['CMD', 'sfc /scannow', 'Verify core Windows files']
    ],
    warn: 'Restarting explorer briefly closes open File Explorer windows.',
    expected: 'Start Menu, Search, and Taskbar respond immediately to mouse and keyboard input.',
    prevent: ['Install latest cumulative updates', 'Avoid third-party taskbar customization hooks on enterprise builds'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['start menu not working', 'taskbar frozen', 'explorer.exe', 'startmenuexperiencehost']
  },
  {
    id: 'WIN-003',
    title: 'Blue Screen of Death (BSOD) CRITICAL_PROCESS_DIED',
    category: 'Windows 10 & Windows 11',
    errorCode: '0x000000EF',
    desc: 'Windows crashes with stop code CRITICAL_PROCESS_DIED when a mandatory kernel or user-mode subsystem terminates unexpectedly.',
    symptoms: ['Sudden blue screen with 0x000000EF or CRITICAL_PROCESS_DIED', 'Automatic reboot loop into Windows Recovery Environment'],
    causes: ['Corrupted system binaries or registry hives', 'Faulty NVMe/SATA storage driver', 'Bad RAM sectors or failing SSD'],
    steps: ['Boot into Safe Mode with Networking via Windows Recovery.', 'Repair the Windows component store using DISM.', 'Run SFC to replace corrupted critical OS files.', 'Review minidump files in C:\\Windows\\Minidump to isolate offending drivers.'],
    cmds: [
      ['CMD', 'DISM /Online /Cleanup-Image /RestoreHealth', 'Repair Windows image'],
      ['CMD', 'sfc /scannow', 'Repair protected OS files'],
      ['PowerShell', 'Get-WinEvent -FilterHashtable @{LogName="System"; ID=41,1001} -MaxEvents 5', 'Check crash events']
    ],
    warn: 'Do not interrupt DISM or SFC while repairing system files.',
    expected: 'System boots cleanly into normal mode without kernel crashes.',
    prevent: ['Deploy WHQL-certified storage and chipset drivers', 'Monitor SSD SMART health quarterly'],
    diff: 'Advanced',
    time: '20-35 minutes',
    tags: ['bsod', 'critical_process_died', '0x000000ef', 'dism', 'sfc', 'crash']
  },
  {
    id: 'WIN-004',
    title: '100% Disk Usage on Windows 10/11 Slowing Down PC',
    category: 'Windows 10 & Windows 11',
    desc: 'Task Manager shows 100% Active Time on C: drive even with minimal user applications open.',
    symptoms: ['Severe UI lag and slow application launches', 'Disk column pinned at 100% in Task Manager'],
    causes: ['SysMain (Superfetch) thrashing older SATA SSDs/HDDs', 'Stuck Windows Search indexing loop', 'Message-Signaled Interrupt (MSI) bug on AHCI controller'],
    steps: ['Open Task Manager > Processes and sort by Disk to confirm top consumers.', 'Stop and disable SysMain if excessive background prefetching occurs.', 'Rebuild or pause Windows Search indexing temporarily.', 'Check drive health for pending bad sectors.'],
    cmds: [
      ['PowerShell', 'Stop-Service -Name "SysMain" -Force; Set-Service -Name "SysMain" -StartupType Disabled', 'Disable SysMain thrashing'],
      ['CMD', 'sc query wsearch', 'Verify Windows Search service state'],
      ['PowerShell', 'Get-PhysicalDisk | Select FriendlyName, MediaType, HealthStatus, OperationalStatus', 'Check physical disk health']
    ],
    warn: 'Disabling SysMain is safe but only recommended if confirmed as the disk bottleneck.',
    expected: 'Idle disk utilization drops below 5% and applications open rapidly.',
    prevent: ['Replace legacy mechanical HDDs with NVMe SSDs', 'Keep storage controller firmware updated'],
    diff: 'Beginner',
    time: '10-15 minutes',
    tags: ['100% disk usage', 'slow pc', 'sysmain', 'superfetch', 'high disk']
  },
  {
    id: 'WIN-005',
    title: 'Windows Update Error 0x800f0922 During Cumulative Patch',
    category: 'Windows 10 & Windows 11',
    errorCode: '0x800f0922',
    desc: 'Update fails at 98%-99% and rolls back due to full System Reserved EFI partition or disconnected update session.',
    symptoms: ['We could not complete the updates - Undoing changes', 'Error 0x800f0922 logged in Windows Update history'],
    causes: ['EFI System Partition has less than 15 MB free space', '.NET Framework feature installer failure', 'Active VPN blocking Microsoft update CDN'],
    steps: ['Disconnect split-tunnel or full-tunnel VPN clients.', 'Check free space on the 100 MB EFI System Partition.', 'Clear font files inside EFI\\Microsoft\\Boot\\Fonts if space is exhausted, or extend EFI.', 'Run DISM RestoreHealth and retry the update.'],
    cmds: [
      ['CMD', 'mountvol Y: /s', 'Mount EFI partition temporarily to Y:'],
      ['PowerShell', 'Get-PSDrive Y', 'Inspect free space on EFI partition'],
      ['CMD', 'mountvol Y: /d', 'Unmount EFI partition safely after check']
    ],
    warn: 'Exercise extreme caution inside the mounted EFI partition. Never delete bootmgfw.efi or BCD files.',
    expected: 'EFI partition has adequate space (>30 MB free) and cumulative update completes.',
    prevent: ['Allocate 260 MB-500 MB EFI partition on new OS deployments', 'Keep BIOS firmware tools from bloating EFI'],
    diff: 'Advanced',
    time: '15-25 minutes',
    tags: ['0x800f0922', 'undoing changes', 'efi partition full', 'windows update rollback']
  },
  {
    id: 'WIN-006',
    title: 'Windows Search Bar Cannot Type or Freezes',
    category: 'Windows 10 & Windows 11',
    desc: 'Users can open Start or Search, but keyboard input is ignored in Search boxes, Settings, and UWP apps.',
    symptoms: ['Cannot type in Windows Search or Settings search box', 'Keyboard works normally in Notepad and browsers'],
    causes: ['ctfmon.exe (Text Services Framework) is not running', 'SearchHost.exe process deadlocked'],
    steps: ['Restart SearchHost.exe to clear UI input deadlocks.', 'Start ctfmon.exe manually to restore Text Input Management.', 'Verify Touch Keyboard and Handwriting Panel Service is set to Manual/Running.'],
    cmds: [
      ['CMD', 'C:\\Windows\\System32\\ctfmon.exe', 'Launch Text Services Framework'],
      ['PowerShell', 'Stop-Process -Name "SearchHost" -Force -ErrorAction SilentlyContinue', 'Reset Windows 11 SearchHost']
    ],
    expected: 'Typing works immediately across Windows Search, Start Menu, and Settings.',
    prevent: ['Do not disable ctfmon scheduled task in Task Scheduler > TextServicesFramework'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['cant type in windows search', 'ctfmon', 'searchhost', 'uwp keyboard']
  },
  {
    id: 'WIN-007',
    title: 'Windows Activation Error 0xC004F074 (KMS Server Unreachable)',
    category: 'Windows 10 & Windows 11',
    errorCode: '0xC004F074',
    desc: 'Enterprise Windows client fails volume activation because Key Management Service host cannot be contacted.',
    symptoms: ['Activate Windows watermark appears on desktop', 'Error 0xC004F074 in Activation settings'],
    causes: ['Client is off corporate VPN for >180 days', 'Missing _vlmcs._tcp DNS SRV record', 'TCP port 1688 blocked between client and KMS host'],
    steps: ['Connect the workstation to corporate LAN or VPN.', 'Verify DNS resolution of the KMS SRV record.', 'Test TCP port 1688 connectivity to the KMS server.', 'Trigger KMS activation manually via slmgr.vbs.'],
    cmds: [
      ['CMD', 'nslookup -type=srv _vlmcs._tcp', 'Locate corporate KMS server'],
      ['PowerShell', 'Test-NetConnection -ComputerName kms.corp.local -Port 1688', 'Verify KMS port reachability'],
      ['CMD', 'cscript //nologo C:\\Windows\\System32\\slmgr.vbs /ato', 'Activate Windows now']
    ],
    expected: 'slmgr outputs Product activated successfully and watermark disappears.',
    prevent: ['Migrate remote-first fleets to Active Directory-Based Activation or Subscription Activation'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['0xc004f074', 'kms activation', 'slmgr', 'activate windows', '1688']
  },
  {
    id: 'WIN-008',
    title: 'Audio Output Missing: No Audio Output Device Is Installed',
    category: 'Windows 10 & Windows 11',
    desc: 'Speaker tray icon shows red X and sound settings list zero playback endpoints.',
    symptoms: ['Red X on taskbar speaker icon', 'No playback devices listed under System > Sound'],
    causes: ['Intel Smart Sound Technology (SST) or Realtek driver crash', 'Windows Audio service stopped', 'Disabled HD Audio controller in Device Manager'],
    steps: ['Verify Windows Audio and Windows Audio Endpoint Builder services are running.', 'Scan for hardware changes via pnputil.', 'Roll back or reinstall the OEM audio and Intel SST drivers.', 'Reboot to re-enumerate audio endpoints.'],
    cmds: [
      ['PowerShell', 'Restart-Service -Name Audiosrv, AudioEndpointBuilder -Force', 'Restart Windows audio stack'],
      ['CMD', 'pnputil /scan-devices', 'Re-detect audio hardware']
    ],
    expected: 'Internal speakers and headset jacks reappear and play test chimes.',
    prevent: ['Pin OEM-validated audio drivers via Windows Update for Business policies'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['no audio output device', 'sound not working', 'realtek', 'audiosrv']
  },
  {
    id: 'WIN-009',
    title: 'Clipboard Copy-Paste Not Working Across Windows Apps',
    category: 'Windows 10 & Windows 11',
    desc: 'Ctrl+C and Ctrl+V fail silently or paste stale text in Windows 10/11.',
    symptoms: ['Ctrl+C does not capture new text or files', 'Win+V clipboard history fails to open'],
    causes: ['Hung rdpclip.exe or Clipboard User Service (cbdhsvc)', 'Third-party password manager locking clipboard chain'],
    steps: ['Clear the locked Windows clipboard buffer.', 'Restart the per-user Clipboard User Service.', 'If connected via RDP, restart rdpclip.exe.'],
    cmds: [
      ['CMD', 'cmd /c "echo off | clip"', 'Flush stuck clipboard buffer'],
      ['PowerShell', 'Get-Service cbdhsvc* | Restart-Service -Force', 'Restart Clipboard User Service']
    ],
    expected: 'Ctrl+C, Ctrl+V, and Win+V clipboard history operate normally.',
    prevent: ['Update RDP clients and clipboard-sync utilities regularly'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['copy paste not working', 'clipboard broken', 'cbdhsvc', 'rdpclip']
  },
  {
    id: 'WIN-010',
    title: 'BitLocker Recovery Key Prompt After BIOS or Dock Change',
    category: 'Windows 10 & Windows 11',
    desc: 'Laptop boots to blue BitLocker recovery screen asking for 48-digit numerical key.',
    symptoms: ['Enter the recovery key for this drive blue boot screen', 'Boot blocked after firmware update or Thunderbolt dock change'],
    causes: ['TPM PCR 0/2/4/7 measurements changed due to BIOS update or USB-C boot order', 'Secure Boot state toggled'],
    steps: ['Disconnect external USB drives and docks, then reboot once to test PCR match.', 'If still prompted, retrieve the 48-digit key from Active Directory or Entra ID.', 'Once booted into Windows, suspend BitLocker for one reboot so TPM reseals new PCR measurements.'],
    cmds: [
      ['PowerShell', 'Suspend-BitLocker -MountPoint "C:" -RebootCount 1', 'Suspend for 1 reboot to reseal TPM'],
      ['CMD', 'manage-bde -status C:', 'Verify Protection Status turns back On after reboot']
    ],
    warn: 'Always suspend BitLocker BEFORE flashing BIOS/UEFI firmware to prevent recovery lockouts.',
    expected: 'TPM reseals cleanly and subsequent boots bypass the BitLocker recovery screen.',
    prevent: ['Add Suspend-BitLocker step to BIOS deployment scripts in Intune/SCCM'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['bitlocker recovery', '48 digit key', 'tpm reseal', 'manage-bde']
  },
  {
    id: 'WIN-011',
    title: 'File Explorer Hangs on Quick Access or Home View',
    category: 'Windows 10 & Windows 11',
    desc: 'Opening File Explorer shows "Working on it..." indefinitely before rendering folders.',
    symptoms: ['File Explorer takes 30+ seconds to load Home/Quick Access', 'Green progress bar stalls in address bar'],
    causes: ['Pinned recent file points to an offline SMB network share', 'Corrupted AutomaticDestinations jump list file'],
    steps: ['Delete corrupted Quick Access AutomaticDestinations cache files.', 'Clear File Explorer history in Folder Options.', 'Restart Explorer process to reload clean navigation pane.'],
    cmds: [
      ['CMD', 'del /f /q "%AppData%\\Microsoft\\Windows\\Recent\\AutomaticDestinations\\*"', 'Clear Quick Access cache'],
      ['PowerShell', 'Stop-Process -Name explorer -Force', 'Reload File Explorer']
    ],
    warn: 'Clearing AutomaticDestinations resets pinned Quick Access shortcuts.',
    expected: 'File Explorer opens instantaneously in under 1 second.',
    prevent: ['Map network drives via DFS namespaces rather than pinning transient IP paths'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['file explorer slow', 'working on it', 'quick access hang', 'automaticdestinations']
  },
  {
    id: 'WIN-012',
    title: 'Windows Time Out of Sync Causing SSL and Login Failures',
    category: 'Windows 10 & Windows 11',
    desc: 'System clock drifts by more than 5 minutes, breaking Kerberos authentication and HTTPS certificates.',
    symptoms: ['NET::ERR_CERT_DATE_INVALID in browsers', 'Kerberos ticket rejection on domain resources'],
    causes: ['Windows Time (w32time) service stopped', 'UDP port 123 NTP blocked', 'Failing CMOS coin-cell battery'],
    steps: ['Ensure Windows Time service is running and set to Automatic.', 'Force an immediate NTP resynchronization.', 'Verify current NTP source (domain controller vs time.windows.com).'],
    cmds: [
      ['PowerShell', 'Start-Service w32time; w32tm /resync /force', 'Force clock resync'],
      ['CMD', 'w32tm /query /status', 'Check active time source and stratum']
    ],
    expected: 'System clock synchronizes within milliseconds of authoritative NTP server.',
    prevent: ['Ensure domain-joined clients use NT5DS hierarchy; standalone clients reach UDP 123'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['clock wrong', 'w32tm', 'ntp sync', 'err_cert_date_invalid', 'kerberos skew']
  },
  {
    id: 'WIN-013',
    title: 'Microsoft Store Apps Immediately Close on Launch',
    category: 'Windows 10 & Windows 11',
    desc: 'Built-in UWP apps such as Calculator, Snipping Tool, or Photos flash briefly and close.',
    symptoms: ['Calculator or Snipping Tool opens for 1 second and vanishes', 'Event ID 5973 AppModel-Runtime logged'],
    causes: ['Corrupted Microsoft Store licensing or AppX cache', 'Broken VCLibs framework dependency'],
    steps: ['Reset the Microsoft Store cache using wsreset.', 'Repair or reset the affected app in Settings > Apps > Installed apps.', 'Update Microsoft.VCLibs and UI.Xaml packages via winget.'],
    cmds: [
      ['CMD', 'wsreset.exe', 'Clear Microsoft Store cache'],
      ['PowerShell', 'Get-AppxPackage *WindowsCalculator* | Reset-AppxPackage', 'Reset broken UWP app']
    ],
    expected: 'Built-in Windows apps launch cleanly and retain user preferences.',
    prevent: ['Do not run aggressive debloat scripts that strip shared VCLibs runtimes'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['snipping tool crashing', 'calculator not opening', 'wsreset', 'uwp crash']
  },

  // ================= 2. Networking & TCP/IP (13 issues) =================
  {
    id: 'NET-001',
    title: 'Ethernet Shows Unidentified Network with 169.254.x.x APIPA IP',
    category: 'Networking & TCP/IP',
    desc: 'Workstation assigns itself a link-local 169.254.x.x IPv4 address and cannot reach default gateway or internet.',
    symptoms: ['No internet access with Unidentified Network label', 'ipconfig shows 169.254.x.x and subnet 255.255.0.0'],
    causes: ['Access switch port assigned to wrong VLAN', 'DHCP server unreachable or scope exhausted', 'Damaged patch cord or 802.1X port NAC quarantine'],
    steps: ['Verify physical link lights and test with a known-good patch cable.', 'Release and renew IPv4 lease from elevated CMD.', 'Reset Winsock and TCP/IP stack if local DHCP client is wedged.', 'Escalate switch port VLAN and DHCP helper check if renewal times out.'],
    cmds: [
      ['CMD', 'ipconfig /release && ipconfig /renew', 'Request fresh DHCP lease'],
      ['CMD', 'netsh winsock reset && netsh int ip reset', 'Reset local TCP/IP stack']
    ],
    warn: 'netsh int ip reset clears static IP settings on adapters and requires a reboot.',
    expected: 'Adapter receives valid subnet IP, mask, and default gateway from DHCP.',
    prevent: ['Monitor DHCP scope utilization alerts at 80% threshold', 'Document access switch VLAN port mappings'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['169.254', 'apipa', 'unidentified network', 'no default gateway', 'ipconfig renew']
  },
  {
    id: 'NET-002',
    title: 'Duplicate IPv4 Address Conflict Detected on LAN',
    category: 'Networking & TCP/IP',
    desc: 'Intermittent packet loss occurs because two hosts share the exact same IPv4 address on a subnet.',
    symptoms: ['Connection drops every few minutes as ARP caches flip', 'Windows logs Event ID 4199 Tcpip duplicate address'],
    causes: ['Device configured with static IP inside active DHCP pool', 'Rogue secondary router handing out overlapping leases'],
    steps: ['Ping the conflicting IP and inspect the ARP table to obtain the rogue MAC address.', 'Look up the MAC OUI vendor (e.g., printer, IoT, workstation) and trace switch MAC address table.', 'Move static device outside DHCP range or create a DHCP reservation.'],
    cmds: [
      ['CMD', 'arp -a | findstr "192.168.1.50"', 'Identify MAC address holding conflicting IP'],
      ['PowerShell', 'Get-NetNeighbor -IPAddress 192.168.1.50', 'Inspect neighbor state and link-layer MAC']
    ],
    expected: 'Each host holds a unique IPv4 address and intermittent ARP flapping stops.',
    prevent: ['Exclude static infrastructure ranges (.1-.50) from DHCP pools', 'Enable Dynamic ARP Inspection (DAI) on switches'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['ip conflict', 'duplicate ip', 'arp -a', 'event 4199']
  },
  {
    id: 'NET-003',
    title: 'High Latency and Packet Loss Beyond Local Default Gateway',
    category: 'Networking & TCP/IP',
    desc: 'Local LAN ping is <1ms, but internet and cloud SaaS traffic experiences >250ms latency and dropped packets.',
    symptoms: ['Teams/Zoom voice calls sound robotic', 'Ping to 1.1.1.1 drops 10-20% of packets while gateway ping is 1ms'],
    causes: ['Saturated WAN uplink or bufferbloat', 'ISP upstream routing congestion', 'Failing WAN transceiver or CRC errors on firewall WAN interface'],
    steps: ['Ping local default gateway first to prove LAN segment is clean.', 'Run tracert or pathping to pinpoint the exact hop introducing packet loss.', 'Check firewall WAN bandwidth utilization and interface CRC error counters.'],
    cmds: [
      ['CMD', 'ping -n 20 192.168.1.1', 'Baseline local gateway latency'],
      ['CMD', 'tracert -d 1.1.1.1', 'Identify high-latency upstream hop'],
      ['CMD', 'pathping -q 25 8.8.8.8', 'Measure per-hop packet loss']
    ],
    expected: 'Bottleneck hop is isolated (WAN firewall vs ISP peer) and QoS/traffic shaping or ISP ticket resolves loss.',
    prevent: ['Configure FQ-CoDel / Smart Queue Management on WAN edge to eliminate bufferbloat'],
    diff: 'Intermediate',
    time: '15-20 minutes',
    tags: ['packet loss', 'high ping', 'tracert', 'pathping', 'wan latency']
  },
  {
    id: 'NET-004',
    title: 'MTU Blackhole: Websites Load Partially or TLS Handshake Stalls',
    category: 'Networking & TCP/IP',
    desc: 'Small pings succeed, but HTTPS pages, SSH sessions, or large uploads stall over PPPoE, IPSec, or WireGuard links.',
    symptoms: ['Ping works, but HTTPS sites hang at Performing TLS handshake', 'SSH connects then freezes on large output'],
    causes: ['Tunnel encapsulation overhead lowers path MTU below 1500 bytes', 'Firewall blocks ICMP Type 3 Code 4 (Fragmentation Needed) breaking PMTUD'],
    steps: ['Test maximum unfragmented payload size using ping -f -l.', 'Add 28 bytes (20 IP + 8 ICMP) to highest working payload to determine path MTU.', 'Adjust interface MTU or configure TCP MSS clamping on edge router.'],
    cmds: [
      ['CMD', 'ping 1.1.1.1 -f -l 1472', 'Test standard 1500 MTU (1472 + 28)'],
      ['CMD', 'ping 1.1.1.1 -f -l 1372', 'Test 1400 MTU over tunnel'],
      ['CMD', 'netsh interface ipv4 set subinterface "Ethernet" mtu=1400 store=persistent', 'Set safe MTU if needed']
    ],
    warn: 'Setting MTU too low (<1280) degrades throughput and breaks IPv6 compliance.',
    expected: 'Large HTTPS payloads and TLS handshakes complete instantaneously without stalls.',
    prevent: ['Permit ICMP Fragmentation Needed on firewalls', 'Enable TCP MSS Clamping (e.g., 1360) on VPN/PPPoE interfaces'],
    diff: 'Advanced',
    time: '15-20 minutes',
    tags: ['mtu', 'packet needs to be fragmented', 'tls handshake stall', 'mss clamping', 'ping -f -l']
  },
  {
    id: 'NET-005',
    title: 'Gigabit Ethernet Link Negotiating at 100 Mbps Instead of 1000 Mbps',
    category: 'Networking & TCP/IP',
    desc: 'Desktop connected to Gigabit switch is capped at 94 Mbps throughput due to physical layer pair degradation.',
    symptoms: ['Speed tests cap around 90-95 Mbps on Gigabit fiber/LAN', 'Adapter Link Speed reads 100/100 (Mbps)'],
    causes: ['Broken wire on pin 4, 5, 7, or 8 inside Cat5e/Cat6 run (100BASE-TX only uses 2 pairs)', 'Switch port hardcoded to 100FDX', 'Energy-Efficient Ethernet bug'],
    steps: ['Check current negotiated link speed in PowerShell.', 'Ensure NIC Speed & Duplex is set to Auto Negotiation.', 'Swap patch cord and test wall jack with a cable pair tester for open/split pairs.'],
    cmds: [
      ['PowerShell', 'Get-NetAdapter | Where Status -eq "Up" | Select Name, InterfaceDescription, LinkSpeed, FullDuplex', 'Check negotiated speed']
    ],
    expected: 'LinkSpeed reports 1 Gbps Full Duplex and file transfers reach ~112 MB/s.',
    prevent: ['Terminate wall jacks to TIA/EIA-568B standard and certify runs with cable tester'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['stuck at 100mbps', 'gigabit slow', 'link speed', 'cat6 cable']
  },
  {
    id: 'NET-006',
    title: 'Default Gateway Missing After Connecting Split VPN or Dual NICs',
    category: 'Networking & TCP/IP',
    desc: 'Workstation with both Ethernet and WiFi or secondary lab NIC loses internet routing due to metric conflict.',
    symptoms: ['Local subnet works, internet fails with Destination host unreachable', 'Two 0.0.0.0/0 default routes exist with wrong interface metric'],
    causes: ['Secondary isolated lab NIC has a default gateway configured', 'Incorrect interface metric prioritizes non-routable adapter'],
    steps: ['Inspect active IPv4 routing table and default route metrics.', 'Remove the default gateway IP from isolated secondary/management NICs.', 'Adjust interface metric if needed so primary WAN-facing NIC has lowest metric.'],
    cmds: [
      ['CMD', 'route print -4', 'Inspect 0.0.0.0 default routes and metrics'],
      ['PowerShell', 'Set-NetIPInterface -InterfaceAlias "Ethernet" -InterfaceMetric 10', 'Prioritize primary Ethernet']
    ],
    expected: 'Internet traffic exits primary gateway while secondary NIC handles only local lab subnet.',
    prevent: ['Never configure a Default Gateway on out-of-band/SAN/iSCSI secondary NICs'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['dual nic', 'route print', 'default gateway conflict', 'interface metric']
  },
  {
    id: 'NET-007',
    title: 'VLAN Inter-Subnet Routing Blocked Between Workstations and Servers',
    category: 'Networking & TCP/IP',
    desc: 'Clients in VLAN 10 can reach the internet, but cannot connect to application servers in VLAN 20.',
    symptoms: ['Ping to VLAN 10 gateway works, ping to VLAN 20 server times out', 'tracert stops at Layer 3 core switch or firewall'],
    causes: ['Missing inter-VLAN firewall policy', 'Missing return route on server VLAN', 'Windows Firewall on target server blocking non-local subnets'],
    steps: ['Ping both VLAN SVI gateways from the L3 switch/firewall.', 'Test target TCP application port rather than relying solely on ICMP.', 'Check Windows Firewall scope on target server (LocalSubnet vs Any).'],
    cmds: [
      ['PowerShell', 'Test-NetConnection -ComputerName 10.20.0.15 -Port 443 -TraceRoute', 'Test L4 port and trace hops'],
      ['PowerShell', 'Get-NetFirewallRule -DisplayGroup "File and Printer Sharing" | Get-NetFirewallAddressFilter', 'Verify remote address scope']
    ],
    expected: 'Authorized TCP ports route cleanly between client VLAN and server VLAN.',
    prevent: ['Document inter-VLAN ACL matrices and avoid LocalSubnet-only rules on multi-VLAN servers'],
    diff: 'Intermediate',
    time: '15-20 minutes',
    tags: ['inter-vlan routing', 'vlan blocked', 'localsubnet firewall', 'test-netconnection']
  },
  {
    id: 'NET-008',
    title: 'Proxy Server Misconfiguration Blocking Browser and CLI Traffic',
    category: 'Networking & TCP/IP',
    errorCode: 'ERR_PROXY_CONNECTION_FAILED',
    desc: 'Browsers display ERR_PROXY_CONNECTION_FAILED even though direct ping and DNS succeed.',
    symptoms: ['ERR_PROXY_CONNECTION_FAILED in Chrome/Edge', 'winget, npm, or PowerShell Invoke-WebRequest fail to connect'],
    causes: ['Leftover localhost proxy (127.0.0.1:8080/8888) from Fiddler, Charles, or uninstalled VPN', 'WinHTTP proxy out of sync'],
    steps: ['Check current user WinINET proxy registry values.', 'Disable unintended manual proxy in Settings > Network & internet > Proxy.', 'Reset system-wide WinHTTP proxy configuration.'],
    cmds: [
      ['CMD', 'netsh winhttp show proxy', 'Inspect system WinHTTP proxy'],
      ['CMD', 'netsh winhttp reset proxy', 'Reset WinHTTP to direct access'],
      ['PowerShell', 'Get-ItemProperty -Path "HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" | Select ProxyEnable, ProxyServer', 'Check user WinINET proxy']
    ],
    expected: 'Browsers and system tools connect directly without proxy interception errors.',
    prevent: ['Close packet capture proxies cleanly before shutting down so proxy hooks revert'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['err_proxy_connection_failed', 'winhttp', 'proxy stuck', '127.0.0.1:8080']
  },
  {
    id: 'NET-009',
    title: 'Broadcast Storm / Switching Loop Taking Down Floor Network',
    category: 'Networking & TCP/IP',
    desc: 'All switch port LEDs blink rapidly in unison and network throughput drops to zero across a floor.',
    symptoms: ['Synchronized solid/rapid blinking LEDs across entire switch', 'Switch CPU spikes to 99% and MAC table flaps constantly'],
    causes: ['User plugged both ends of a patch cable into two wall jacks', 'Unmanaged desktop switch connected with STP disabled'],
    steps: ['Identify ports with highest broadcast pps or MAC flapping on managed switch.', 'Physically unplug suspected desktop switches or looped wall ports until LEDs calm.', 'Enable Rapid PVST+ / RSTP with BPDU Guard on all access ports.'],
    cmds: [
      ['Config / CLI', 'show spanning-tree inconsistentports', 'Check STP blocked ports (Cisco IOS)'],
      ['Config / CLI', 'spanning-tree portfast && spanning-tree bpduguard enable', 'Protect access ports against loops']
    ],
    warn: 'Enable BPDU Guard only on edge access ports, never on uplink trunks.',
    expected: 'Broadcast storm ceases immediately and access ports err-disable automatically on future loops.',
    prevent: ['Enforce BPDU Guard and Storm Control (e.g., 5% broadcast cap) on all edge switches'],
    diff: 'Advanced',
    time: '15-25 minutes',
    tags: ['broadcast storm', 'switching loop', 'stp', 'bpduguard', 'blinking switch lights']
  },
  {
    id: 'NET-010',
    title: 'IPv6 Preferential Routing Delaying Connections on IPv4-Only Network',
    category: 'Networking & TCP/IP',
    desc: 'Applications pause 3-5 seconds before connecting because broken IPv6 RA causes failed AAAA connection attempts.',
    symptoms: ['Initial connection delay in browsers, SSH, or Git', 'curl -4 is instant while default curl hangs'],
    causes: ['Router advertises SLAAC IPv6 prefix without working ISP IPv6 upstream', 'Misconfigured router advertisement on LAN'],
    steps: ['Test IPv4 vs IPv6 reachability separately.', 'Fix or disable broken Router Advertisements on the local router/firewall.', 'Do not uncheck IPv6 on Windows NICs; if temporary workaround is needed, prefer IPv4 via DisabledComponents=0x20.'],
    cmds: [
      ['CMD', 'ping -6 ipv6.google.com', 'Verify whether upstream IPv6 actually works'],
      ['CMD', 'ping -4 google.com', 'Compare IPv4 response time']
    ],
    warn: 'Microsoft advises against completely disabling IPv6 on Windows; use prefix policy preference (0x20) instead.',
    expected: 'Connections initiate with zero Happy Eyeballs fallback delay.',
    prevent: ['Advertise IPv6 Router Advertisements only when upstream PD delegation is active'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['ipv6 slow', 'aaaa timeout', 'prefer ipv4', 'happy eyeballs']
  },
  {
    id: 'NET-011',
    title: 'TCP Port Already in Use (Address Already in Use / EADDRINUSE)',
    category: 'Networking & TCP/IP',
    errorCode: 'EADDRINUSE',
    desc: 'Web server, agent, or local service fails to start because another PID or WinNAT holds the TCP port.',
    symptoms: ['Only one usage of each socket address is normally permitted', 'Port 80, 443, 3000, or 8080 cannot bind'],
    causes: ['Orphaned background process still listening on the port', 'Hyper-V / WSL WinNAT dynamic excluded port range reservation'],
    steps: ['Find the Process ID (PID) bound to the target TCP port.', 'Inspect the process name and stop it if safe.', 'Check Windows excluded port ranges if no active PID appears in netstat.'],
    cmds: [
      ['CMD', 'netstat -ano | findstr ":8080"', 'Find PID holding port 8080'],
      ['PowerShell', 'Get-Process -Id <PID>', 'Identify process before stopping'],
      ['CMD', 'netsh interface ipv4 show excludedportrange protocol=tcp', 'Check Hyper-V reserved ranges']
    ],
    warn: 'Verify process identity with Get-Process before terminating critical system services.',
    expected: 'Target TCP port binds cleanly and service starts.',
    prevent: ['Reserve static dev/service ports via netsh int ipv4 add excludedportrange before Hyper-V starts'],
    diff: 'Intermediate',
    time: '5-10 minutes',
    tags: ['port in use', 'eaddrinuse', 'netstat -ano', 'excludedportrange']
  },
  {
    id: 'NET-012',
    title: 'PoE IP Phone or Access Point Not Powering On from Switch',
    category: 'Networking & TCP/IP',
    desc: 'PoE+ wireless access point or VoIP desk phone stays dark or reboots repeatedly when plugged into wall port.',
    symptoms: ['AP LED stays off or amber-loops', 'Switch logs ILPOWER-5-IEEE_DISCONNECT or PoE budget exceeded'],
    causes: ['Switch total PoE watt budget exhausted', 'AP requires 802.3at (PoE+ 30W) or 802.3bt (60W) while switch only supplies 802.3af (15.4W)', 'LLDP disabled preventing power negotiation'],
    steps: ['Check switch PoE power budget consumption and per-port draw.', 'Enable LLDP on the switch port so PoE+ class negotiation succeeds.', 'Move high-draw Wi-Fi 6E/7 APs to an 802.3at/bt switch or Midspan PoE injector.'],
    cmds: [
      ['Config / CLI', 'show power inline', 'Check switch total PoE budget and port wattage'],
      ['Config / CLI', 'lldp run', 'Enable LLDP power negotiation']
    ],
    expected: 'Endpoint negotiates full PoE+/PoE++ wattage and boots into operational state.',
    prevent: ['Calculate worst-case PoE wattage budget + 20% headroom during switch sizing'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['poe not working', 'access point rebooting', '802.3at', 'show power inline']
  },
  {
    id: 'NET-013',
    title: 'Asymmetric Routing Dropping Stateful TCP Sessions After 30 Seconds',
    category: 'Networking & TCP/IP',
    desc: 'Cross-site TCP connections establish briefly then reset with TCP Out-of-State / SYN-ACK drops on firewall.',
    symptoms: ['ICMP ping works, but SMB/SQL/SSH connections drop after 20-30 seconds', 'Firewall logs TCP SYN-ACK without matching SYN'],
    causes: ['Outbound packet takes MPLS router while return packet routes through SD-WAN firewall'],
    steps: ['Run traceroute in BOTH directions (Client -> Server and Server -> Client).', 'Compare intermediate Layer 3 hops for symmetry.', 'Fix static/BGP route metrics or move inter-VLAN transit subnet off client segment.'],
    cmds: [
      ['CMD', 'tracert -d 10.50.10.20', 'Trace forward path from client'],
      ['PowerShell', 'Test-NetConnection 10.10.5.44 -TraceRoute', 'Trace return path from server']
    ],
    expected: 'Forward and reverse paths traverse the same stateful firewall and sessions remain stable.',
    prevent: ['Use dedicated /30 transit VLANs between routers and stateful firewalls'],
    diff: 'Advanced',
    time: '25-35 minutes',
    tags: ['asymmetric routing', 'tcp reset', 'out of state', 'syn-ack dropped']
  },

  // ================= 3. DNS & DHCP (13 issues) =================
  {
    id: 'DNS-001',
    title: 'DNS_PROBE_FINISHED_NXDOMAIN on Valid External Websites',
    category: 'DNS & DHCP',
    errorCode: 'DNS_PROBE_FINISHED_NXDOMAIN',
    desc: 'Browsers fail to resolve public domains with NXDOMAIN while IP connectivity (ping 1.1.1.1) works.',
    symptoms: ['Hmm, we cant reach this page / DNS_PROBE_FINISHED_NXDOMAIN', 'ping 8.8.8.8 works, ping google.com fails'],
    causes: ['Stale negative cache entry on workstation', 'ISP or forwarder DNS outage', 'Broken DNS-over-HTTPS browser override'],
    steps: ['Test resolution directly against a public resolver using nslookup.', 'Flush local Windows DNS resolver cache.', 'Verify DNS servers configured on active NIC (use internal AD DNS on domain PCs, 1.1.1.1/8.8.8.8 on home PCs).'],
    cmds: [
      ['CMD', 'ipconfig /flushdns', 'Clear local negative DNS cache'],
      ['CMD', 'nslookup example.com 1.1.1.1', 'Compare upstream resolver response'],
      ['PowerShell', 'Get-DnsClientServerAddress -AddressFamily IPv4', 'Inspect configured DNS servers']
    ],
    warn: 'Never configure 8.8.8.8 or 1.1.1.1 directly on Active Directory domain-joined workstations—use internal AD DNS servers with forwarders.',
    expected: 'Domain names resolve to valid A/AAAA records and websites load.',
    prevent: ['Configure redundant DNS forwarders on internal DNS servers'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['dns_probe_finished_nxdomain', 'dns not resolving', 'flushdns', 'nslookup']
  },
  {
    id: 'DNS-002',
    title: 'DHCP Scope Exhausted: New Devices Cannot Obtain IP Addresses',
    category: 'DNS & DHCP',
    desc: 'Guest WiFi or office VLAN stops issuing IPv4 addresses during peak occupancy.',
    symptoms: ['New laptops and phones get stuck on Obtaining IP address', 'DHCP Server logs Event ID 1020 / 1376 (0% available)'],
    causes: ['8-day default lease duration on high-churn WiFi network', 'Undersized /24 subnet for >250 client devices', 'Apple/Android MAC address randomization consuming multiple leases'],
    steps: ['Check current scope statistics and active leases on Windows DHCP Server.', 'Reduce lease time on guest/WiFi scopes to 2-8 hours instead of 8 days.', 'Reconcile the DHCP database or expand subnet to /23 or /22 if legitimate client count exceeds 250.'],
    cmds: [
      ['PowerShell', 'Get-DhcpServerv4ScopeStatistics', 'Check Free vs InUse IP counts'],
      ['PowerShell', 'Set-DhcpServerv4Scope -ScopeId 192.168.20.0 -LeaseDuration 0.04:00:00', 'Set 4-hour lease on high-churn scope']
    ],
    warn: 'Expanding subnet mask (e.g., /24 to /23) requires matching updates on the router SVI and all static hosts.',
    expected: 'Stale leases expire rapidly and new clients receive IPv4 leases immediately.',
    prevent: ['Use 4-hour leases on guest WiFi and 24-hour leases on corporate WiFi'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['dhcp full', 'scope exhausted', 'event 1020', 'obtaining ip address']
  },
  {
    id: 'DNS-003',
    title: 'Split-Horizon DNS Failing: Internal App Resolves to Public WAN IP',
    category: 'DNS & DHCP',
    desc: 'Office users cannot reach internal web app (erp.company.com) because it resolves to public WAN IP without hairpin NAT.',
    symptoms: ['App works on mobile hotspot, fails inside corporate office', 'nslookup erp.company.com returns public IP instead of 10.x.x.x'],
    causes: ['Missing internal DNS Pinpoint Zone or Split-Brain zone record', 'Browser Secure DNS (DoH) bypassing internal corporate DNS'],
    steps: ['Verify nslookup returns internal private IP from corporate DNS server.', 'Create a Pinpoint DNS Zone (erp.company.com) on internal AD DNS pointing @ A record to internal LAN IP.', 'Disable browser third-party DoH via Group Policy so browsers honor internal DNS.'],
    cmds: [
      ['PowerShell', 'Resolve-DnsName erp.company.com', 'Verify OS resolver output'],
      ['PowerShell', 'Add-DnsServerPrimaryZone -Name "erp.company.com" -ReplicationScope Domain', 'Create pinpoint zone for single host']
    ],
    expected: 'Internal clients resolve internal LAN IP directly without creating full split-zone maintenance overhead.',
    prevent: ['Prefer Pinpoint DNS zones for single internal hosts over duplicating entire public DNS zones'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['split dns', 'hairpin nat', 'pinpoint zone', 'doh bypass']
  },
  {
    id: 'DNS-004',
    title: 'DHCP Relay / IP Helper Not Forwarding Broadcasts Across VLANs',
    category: 'DNS & DHCP',
    desc: 'Workstations in a newly created VLAN receive 169.254.x.x while central DHCP server sits in Server VLAN.',
    symptoms: ['DHCP works in Server VLAN, fails in new User VLAN 30', 'Zero DHCP Discover packets reach DHCP server from VLAN 30'],
    causes: ['Missing ip helper-address on Layer 3 switch SVI', 'UDP ports 67/68 blocked by inter-VLAN ACL', 'DHCP scope still in Inactive state'],
    steps: ['Confirm the 10.30.0.0/24 scope is Active on the DHCP server.', 'Verify Layer 3 SVI for VLAN 30 has an IP address inside that scope and ip helper-address pointing to the DHCP server.', 'Permit UDP 67 and 68 between SVI and DHCP server.'],
    cmds: [
      ['Config / CLI', 'interface Vlan30\n ip address 10.30.0.1 255.255.255.0\n ip helper-address 10.10.0.10', 'Configure DHCP relay on L3 switch'],
      ['PowerShell', 'Get-DhcpServerv4Scope -ScopeId 10.30.0.0 | Select Name, State', 'Confirm scope is Active']
    ],
    expected: 'Broadcast DHCP Discover frames convert to unicast relay packets and clients receive 10.30.0.x leases.',
    prevent: ['Include secondary failover DHCP server IP as a second ip helper-address statement'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['ip helper-address', 'dhcp relay', 'vlan dhcp', 'udp 67']
  },
  {
    id: 'DNS-005',
    title: 'Stale DNS Host (A) Records Pointing to Wrong Workstation',
    category: 'DNS & DHCP',
    desc: 'Connecting to PC-FINANCE04 by hostname reaches a completely different employee laptop.',
    symptoms: ['Remote support or SMB share connects to wrong machine', 'Reverse PTR lookup mismatches forward A record'],
    causes: ['DNS Aging and Scavenging is disabled on AD-integrated zone', 'VPN DHCP pool not dynamically updating or cleaning PTR/A records'],
    steps: ['Flush local DNS cache and compare hostname vs actual target IP.', 'Enable DNS Aging and Scavenging at BOTH the zone level and server level.', 'Ensure No-refresh + Refresh intervals match or are shorter than DHCP lease time.'],
    cmds: [
      ['PowerShell', 'Get-DnsServerScavenging', 'Check server-wide scavenging status'],
      ['PowerShell', 'Get-DnsServerZoneAging -Name "corp.local"', 'Inspect zone aging intervals']
    ],
    warn: 'Verify static DNS records do not have timestamps before enabling scavenging for the first time.',
    expected: 'Expired dynamic A/PTR records are automatically scavenged and hostnames map accurately.',
    prevent: ['Set DHCP credentials for dynamic DNS updates so DHCP cleans up leases upon release'],
    diff: 'Advanced',
    time: '20 minutes',
    tags: ['dns scavenging', 'wrong hostname ip', 'stale dns record', 'ptr mismatch']
  },
  {
    id: 'DNS-006',
    title: 'Rogue DHCP Server Handing Out Invalid Gateway on Corporate LAN',
    category: 'DNS & DHCP',
    desc: 'Random users get 192.168.0.x or 192.168.1.x addresses instead of corporate 10.x.x.x subnet.',
    symptoms: ['ipconfig /all shows DHCP Server 192.168.0.1 instead of corporate DC', 'Affected users lose domain and internet access'],
    causes: ['Employee plugged personal WiFi router LAN port into office wall jack', 'Misconfigured lab VM running dnsmasq/isc-dhcp-server on bridged NIC'],
    steps: ['Run ipconfig /all on an affected PC to capture the rogue DHCP Server IP.', 'Ping the rogue IP and check arp -a to get its MAC address.', 'Locate the switch port via MAC address table and shut down the port.', 'Enable DHCP Snooping on access switches, trusting only uplink trunks.'],
    cmds: [
      ['CMD', 'ipconfig /all | findstr /i "DHCP Server"', 'Identify rogue DHCP IP'],
      ['Config / CLI', 'ip dhcp snooping\nip dhcp snooping vlan 10,20', 'Enable DHCP Snooping globally']
    ],
    warn: 'Configure ip dhcp snooping trust on uplink trunk ports BEFORE enabling snooping on VLANs, or legitimate DHCP will drop.',
    expected: 'Rogue DHCP Offer packets are dropped at the switch edge and clients only receive authorized leases.',
    prevent: ['Deploy DHCP Snooping across all access switches'],
    diff: 'Advanced',
    time: '15-25 minutes',
    tags: ['rogue dhcp', 'dhcp snooping', 'wrong subnet ip', '192.168.0.1']
  },
  {
    id: 'DNS-007',
    title: 'DNSSEC Validation Failure (SERVFAIL) for Specific External Domain',
    category: 'DNS & DHCP',
    errorCode: 'SERVFAIL',
    desc: 'A single partner or vendor domain fails with SERVFAIL while all other internet domains resolve normally.',
    symptoms: ['nslookup vendor.com returns Server failed (SERVFAIL)', 'Query with +cd (Checking Disabled) returns an IP'],
    causes: ['Remote domain has expired RRSIG signature or mismatched DS record at registrar', 'Local DNS server system clock skewed'],
    steps: ['Test domain with DNSSEC validation disabled (+cd flag) or check dnsviz.net.', 'Verify local DNS server NTP clock accuracy.', 'Notify vendor domain admin if their DS/DNSKEY chain is broken.'],
    cmds: [
      ['PowerShell', 'Resolve-DnsName vendor.com -Server 1.1.1.1', 'Test against validating public resolver'],
      ['Bash', 'dig vendor.com +cd @1.1.1.1', 'Test with DNSSEC Checking Disabled']
    ],
    expected: 'Root cause confirmed as broken upstream DNSSEC signature vs local clock skew.',
    prevent: ['Monitor DNSSEC RRSIG expiration dates when managing signed public zones'],
    diff: 'Advanced',
    time: '15 minutes',
    tags: ['servfail', 'dnssec', 'dig +cd', 'domain not resolving']
  },
  {
    id: 'DNS-008',
    title: 'Short Single-Label Hostnames (ping fileserver) Not Resolving',
    category: 'DNS & DHCP',
    desc: 'FQDN (fileserver.corp.local) resolves fine, but short hostname (fileserver) fails on VPN or multi-domain clients.',
    symptoms: ['ping fileserver.corp.local works, ping fileserver fails', 'Mapped drives using short netbios names disconnect on VPN'],
    causes: ['Missing Connection-specific DNS Suffix or DNS Suffix Search List', 'DHCP Option 015 / Option 119 not pushed by VPN gateway'],
    steps: ['Check DNS Suffix Search List in ipconfig /all.', 'Configure DHCP Option 015 (DNS Domain Name) and Option 119 (Domain Search List) on DHCP/VPN.', 'Deploy DNS Suffix Search List via Group Policy for multi-domain forests.'],
    cmds: [
      ['CMD', 'ipconfig /all | findstr /i "Suffix"', 'Inspect active DNS suffixes'],
      ['PowerShell', 'Set-DnsClientGlobalSetting -SuffixSearchList @("corp.local", "dev.corp.local")', 'Configure suffix search list']
    ],
    expected: 'Short hostnames automatically append corp.local and resolve cleanly.',
    prevent: ['Always use FQDNs in scripts, GPO drive maps, and printer deployments'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['dns suffix', 'short hostname', 'option 119', 'fqdn works short name fails']
  },
  {
    id: 'DNS-009',
    title: 'Hosts File Override Redirecting Production Site to Old Staging IP',
    category: 'DNS & DHCP',
    desc: 'One developer or admin workstation loads an outdated server despite nslookup showing the new DNS IP.',
    symptoms: ['nslookup returns new IP, but ping and browser hit old IP', 'Issue affects only a single machine'],
    causes: ['Forgotten static entry in C:\\Windows\\System32\\drivers\\etc\\hosts or /etc/hosts'],
    steps: ['Inspect the local hosts file for hardcoded IP overrides.', 'Comment out or remove the obsolete line.', 'Flush local DNS cache and test ping.'],
    cmds: [
      ['PowerShell', 'Get-Content C:\\Windows\\System32\\drivers\\etc\\hosts | Where { $_ -notmatch "^#" -and $_.Trim() -ne "" }', 'List active hosts overrides'],
      ['CMD', 'ipconfig /flushdns', 'Reload resolver cache']
    ],
    expected: 'Workstation honors authoritative DNS records instead of stale local override.',
    prevent: ['Remember nslookup bypasses the hosts file—use Resolve-DnsName or ping to verify OS resolution'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['hosts file', 'old ip', 'nslookup vs ping', 'etc hosts']
  },
  {
    id: 'DNS-010',
    title: 'DHCP Reservation Not Applying to Replaced Network Printer or Server',
    category: 'DNS & DHCP',
    desc: 'Replacement device receives random pool IP instead of the reserved static DHCP IP.',
    symptoms: ['Printer gets .142 instead of reserved .25', 'DHCP Reservation appears configured in console'],
    causes: ['Reservation still bound to old hardware MAC address', 'Hyphens/colons or DHCP Client Identifier mismatch (Linux/BSD sends DUID instead of MAC)'],
    steps: ['Print network configuration sheet or check switch port MAC to verify exact new MAC.', 'Update the MAC address (Unique ID) on the existing DHCP reservation.', 'Delete active dynamic lease on .142 and power-cycle the printer.'],
    cmds: [
      ['PowerShell', 'Get-DhcpServerv4Reservation -ScopeId 10.10.1.0', 'List current reservations'],
      ['PowerShell', 'Set-DhcpServerv4Reservation -IPAddress 10.10.1.25 -ClientId "00-1A-2B-3C-4D-5E"', 'Update reservation MAC']
    ],
    expected: 'Device pulls the exact reserved IPv4 address upon reboot.',
    prevent: ['Update DHCP reservation MAC immediately as part of hardware RMA swap checklist'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['dhcp reservation', 'mac address swap', 'wrong ip printer']
  },
  {
    id: 'DNS-011',
    title: 'Windows DNS Server Recursive Queries Timing Out (Root Hints Broken)',
    category: 'DNS & DHCP',
    desc: 'Internal AD records resolve instantly, but external domains time out intermittently on Windows DNS Server.',
    symptoms: ['Internal corp.local works, external websites take 10s or fail', 'DNS Event ID 4000/4015 or EDNS0 UDP fragmentation drops'],
    causes: ['Firewall blocking outbound UDP/TCP 53 from new DC to root hints', 'ISP blocking direct root-hint recursion or >512-byte EDNS0 UDP packets'],
    steps: ['Configure reliable upstream Forwarders (e.g., 1.1.1.1, 9.9.9.9, or ISP resolvers) on the DNS server.', 'Verify both UDP 53 and TCP 53 outbound are permitted exclusively from DNS servers (block direct port 53 from client VLANs).'],
    cmds: [
      ['PowerShell', 'Get-DnsServerForwarder', 'Check current DNS forwarders'],
      ['PowerShell', 'Set-DnsServerForwarder -IPAddress 1.1.1.1, 9.9.9.9 -UseRootHint $true', 'Configure fast upstream forwarders']
    ],
    expected: 'External DNS queries resolve in <25ms consistently across all clients.',
    prevent: ['Permit both UDP 53 and TCP 53 for large DNSSEC/TXT responses on DNS servers'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['dns forwarders', 'root hints', 'external dns slow', 'edns0']
  },
  {
    id: 'DNS-012',
    title: 'DHCP Failover Partner Out of Sync (MCLT / Communications Interrupted)',
    category: 'DNS & DHCP',
    desc: 'Secondary Windows DHCP server enters Communications Interrupted state and stops replicating leases.',
    symptoms: ['DHCP Failover status shows Communications Interrupted', 'Event ID 20252 logged on DHCP servers'],
    causes: ['Time difference >1 minute between DHCP failover partners', 'TCP port 647 blocked by Windows Firewall'],
    steps: ['Synchronize clocks on both DHCP servers via w32tm.', 'Verify TCP port 647 connectivity between primary and partner servers.', 'Replicate failover scopes from PowerShell.'],
    cmds: [
      ['PowerShell', 'Get-DhcpServerv4Failover', 'Check failover relationship state'],
      ['PowerShell', 'Test-NetConnection -ComputerName dhcp02.corp.local -Port 647', 'Verify failover port 647'],
      ['PowerShell', 'Invoke-DhcpServerv4FailoverReplication -Force', 'Sync scope configuration']
    ],
    expected: 'Failover state returns to Normal on both DHCP servers.',
    prevent: ['Monitor Event ID 20252 and ensure NTP sync across all infrastructure servers'],
    diff: 'Advanced',
    time: '15 minutes',
    tags: ['dhcp failover', 'communications interrupted', 'port 647', 'event 20252']
  },
  {
    id: 'DNS-013',
    title: 'CNAME Record at Zone Apex Failing or Breaking MX Email Delivery',
    category: 'DNS & DHCP',
    desc: 'Adding a CNAME at root domain (@ / company.com) fails or causes incoming email to bounce.',
    symptoms: ['DNS provider rejects CNAME on @ root', 'Or MX/TXT records stop working after adding CNAME on subdomain'],
    causes: ['RFC 1034/2181 prohibits CNAME from coexisting with SOA, NS, MX, or TXT records at the same node'],
    steps: ['Replace apex CNAME with A/AAAA records or use provider ALIAS/ANAME flattening (e.g., Cloudflare CNAME Flattening, Route53 Alias).', 'Never place a CNAME on a node that also requires MX or SPF TXT records.'],
    cmds: [
      ['PowerShell', 'Resolve-DnsName company.com -Type SOA', 'Verify apex SOA presence'],
      ['PowerShell', 'Resolve-DnsName company.com -Type MX', 'Confirm MX records resolve cleanly']
    ],
    expected: 'Web root resolves cleanly while preserving SOA, NS, MX, and SPF TXT records.',
    prevent: ['Use www CNAME -> CDN and HTTP 301 redirect apex -> www when DNS lacks ANAME flattening'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['cname apex', 'cname mx conflict', 'rfc 1034', 'cname flattening']
  },

  // ================= 4. Active Directory (13 issues) =================
  {
    id: 'AD-001',
    title: 'Trust Relationship Between Workstation and Primary Domain Failed',
    category: 'Active Directory',
    desc: 'Domain user cannot sign in because machine account password on PC is out of sync with Active Directory.',
    symptoms: ['The trust relationship between this workstation and the primary domain failed at login', 'Domain accounts blocked while cached offline login works when unplugged'],
    causes: ['VM reverted to an older snapshot (>30 days machine password rotation)', 'Computer object accidentally reset or deleted in AD', 'Duplicate computer hostname joined to domain'],
    steps: ['Unplug network cable to sign in with cached domain admin or use Local Administrator account.', 'Reconnect network cable once at desktop.', 'Repair the secure channel in-place without rebooting or unjoining using Test-ComputerSecureChannel -Repair.'],
    cmds: [
      ['PowerShell', 'Test-ComputerSecureChannel -Verbose', 'Verify broken secure channel'],
      ['PowerShell', 'Test-ComputerSecureChannel -Repair -Credential (Get-Credential)', 'Repair AD machine trust without unjoining']
    ],
    warn: 'Prefer Test-ComputerSecureChannel -Repair over unjoining/rejoining, which can orphan BitLocker keys or certificates.',
    expected: 'Command returns True and domain users can sign in immediately without rebooting.',
    prevent: ['Avoid reverting domain-joined VMs to snapshots older than 30 days'],
    diff: 'Intermediate',
    time: '5-10 minutes',
    tags: ['trust relationship failed', 'secure channel', 'test-computersecurechannel', 'domain login failed']
  },
  {
    id: 'AD-002',
    title: 'Active Directory User Account Repeatedly Locking Out (Event ID 4740)',
    category: 'Active Directory',
    errorCode: 'Event ID 4740',
    desc: 'Employee AD account locks out every 15-30 minutes right after changing their password.',
    symptoms: ['The referenced account is currently locked out', 'Unlocking account in ADUC works for 10 minutes then locks again'],
    causes: ['Saved old password on mobile phone corporate WiFi (802.1X) or mail app', 'Disconnected RDP session left open on jump server', 'Scheduled task or Windows Credential Manager holding old password'],
    steps: ['Query the PDC Emulator Security log for Event ID 4740 to identify Caller Computer Name.', 'Log onto the Caller Computer to clear disconnected RDP sessions (quser/logoff) or Credential Manager.', 'If Caller Name is RADIUS/NPS or Exchange, have user forget corporate WiFi and update mobile mail password.'],
    cmds: [
      ['PowerShell', '$pdc = (Get-ADDomain).PDCEmulator; Get-WinEvent -ComputerName $pdc -FilterHashtable @{LogName="Security"; ID=4740} -MaxEvents 10 | Select TimeCreated, @{N="User";E={$_.Properties[0].Value}}, @{N="Source";E={$_.Properties[1].Value}}', 'Find exact lockout source machine on PDC'],
      ['PowerShell', 'Unlock-ADAccount -Identity jsmith', 'Unlock AD user account']
    ],
    expected: 'Source of stale credentials is remediated and Event ID 4740 stops firing.',
    prevent: ['Have users sign out of all RDP jump hosts BEFORE changing expired passwords'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['account locked out', 'event 4740', 'pdc emulator', 'repeated lockout']
  },
  {
    id: 'AD-003',
    title: 'Active Directory Replication Failing Between Domain Controllers',
    category: 'Active Directory',
    errorCode: '8453 / 1722',
    desc: 'New users, password resets, or GPO edits created on DC01 do not appear on DC02.',
    symptoms: ['repadmin /replsummary shows errors >0 (RPC 1722 or Access Denied 8453)', 'Users in branch site cannot log in with newly reset password'],
    causes: ['Firewall blocking RPC Dynamic Ports (49152-65535), TCP 135, Kerberos 88, or LDAP 389', 'Broken DNS _msdcs CNAME record', 'Tombstone lifetime exceeded (>180 days offline)'],
    steps: ['Check overall forest replication health with repadmin /replsummary.', 'Run dcdiag /test:dns and verify _msdcs.<forest> GUID CNAME resolves.', 'Test RPC TCP 135 and Kerberos 88 between DCs, then force replication sync.'],
    cmds: [
      ['CMD', 'repadmin /replsummary', 'Summarize replication failures across DCs'],
      ['CMD', 'repadmin /showrepl * /errorsonly', 'View detailed error codes per naming context'],
      ['CMD', 'repadmin /syncall /AdeP', 'Push replication across all enterprise partitions']
    ],
    warn: 'Never force-sync a DC that has been isolated longer than Tombstone Lifetime (180 days)—demote cleanly and rebuild instead.',
    expected: 'All naming contexts replicate with 0 errors across every Domain Controller.',
    prevent: ['Monitor repadmin /replsummary daily via automated health alerts'],
    diff: 'Advanced',
    time: '20-30 minutes',
    tags: ['ad replication', 'repadmin', '1722', 'dcdiag', 'domain controller sync']
  },
  {
    id: 'AD-004',
    title: 'SYSVOL and NETLOGON Shares Missing After Domain Controller Reboot',
    category: 'Active Directory',
    desc: 'Domain controller stops advertising logon scripts and Group Policies because DFSR entered AutoRecovery or stalled.',
    symptoms: ['\\\\DC02\\SYSVOL and \\\\DC02\\NETLOGON shares missing in net share', 'Event ID 2213 or 4012 in DFS Replication log'],
    causes: ['Unclean power loss corrupted DFSR Jet database (Event 2213)', 'MaxOfflineTimeInDays exceeded (Event 4012)'],
    steps: ['Check net share on the affected DC to confirm SYSVOL absence.', 'Inspect DFS Replication event log for Event ID 2213 (exact WMI ResumeReplication command is printed inside the event!).', 'Execute the WMI ResumeReplication method for the reported volume GUID and verify State=4 (Normal).'],
    cmds: [
      ['CMD', 'net share', 'Check whether SYSVOL and NETLOGON are shared'],
      ['PowerShell', 'Get-WinEvent -LogName "DFS Replication" -MaxEvents 15 | Where Id -in 2213,4012,4604 | Format-List Id, Message', 'Retrieve exact DFSR recovery GUID'],
      ['CMD', 'wmic /namespace:\\\\root\\microsoftdfs path dfsrreplicatedfolderinfo get replicationgroupname,replicatedfoldername,state', 'Confirm DFSR state reaches 4 (Normal)']
    ],
    warn: 'Use non-authoritative D2 sync before ever attempting authoritative D4 SYSVOL rebuilds.',
    expected: 'DFSR reaches State 4 and NETLOGON/SYSVOL shares mount automatically.',
    prevent: ['Protect Domain Controllers with UPS graceful shutdown and Hyper-V host integration'],
    diff: 'Advanced',
    time: '20-30 minutes',
    tags: ['sysvol missing', 'netlogon missing', 'dfsr 2213', 'domain controller']
  },
  {
    id: 'AD-005',
    title: 'Cannot Join Workstation to Domain: Domain Does Not Exist or Could Not Be Contacted',
    category: 'Active Directory',
    desc: 'Joining a new Windows 11 PC to corp.local fails immediately even though pinging the DC IP succeeds.',
    symptoms: ['An Active Directory Domain Controller for the domain could not be contacted', 'nltest /dsgetdc fails with ERROR_NO_SUCH_DOMAIN'],
    causes: ['Workstation NIC is using public DNS (8.8.8.8 / ISP router) instead of internal AD DNS IP', 'UDP/TCP 389 (LDAP) or 88 (Kerberos) blocked'],
    steps: ['Change the workstation IPv4 Preferred DNS Server exclusively to the internal Domain Controller IP.', 'Verify _ldap._tcp.dc._msdcs.<domain> SRV lookup succeeds.', 'Join the domain using Add-Computer in PowerShell.'],
    cmds: [
      ['CMD', 'nslookup -type=srv _ldap._tcp.dc._msdcs.corp.local', 'Confirm AD SRV records resolve'],
      ['PowerShell', 'Add-Computer -DomainName "corp.local" -Credential (Get-Credential) -Restart', 'Join domain cleanly']
    ],
    expected: 'Workstation locates DC via DNS SRV record, creates machine account, and reboots onto domain.',
    prevent: ['Ensure DHCP Option 006 on office VLANs distributes ONLY internal AD DNS servers'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['cannot join domain', 'domain could not be contacted', '_ldap._tcp', 'add-computer']
  },
  {
    id: 'AD-006',
    title: 'FSMO Role Holder Offline: Seizing vs Transferring Operations Master Roles',
    category: 'Active Directory',
    desc: 'Primary DC suffers catastrophic hardware failure while holding PDC Emulator and RID Master roles.',
    symptoms: ['Time sync, password changes, and GPO edits fail or lag', 'netdom query fsmo lists dead DC'],
    causes: ['Failed DC held forest/domain FSMO roles without prior graceful transfer'],
    steps: ['Check current FSMO role holders with netdom query fsmo.', 'If old DC is reachable for planned maintenance, transfer gracefully WITHOUT -Force.', 'ONLY if old DC will NEVER come back online on the network, seize roles using Move-ADDirectoryServerOperationMasterRole -Force and perform metadata cleanup.'],
    cmds: [
      ['CMD', 'netdom query fsmo', 'List all 5 FSMO role holders'],
      ['PowerShell', 'Move-ADDirectoryServerOperationMasterRole -Identity "DC02" -OperationMasterRole PDCEmulator,RIDMaster,InfrastructureMaster', 'Graceful transfer (add -Force ONLY to seize from dead DC)']
    ],
    warn: 'If you seize RID Master or Schema Master with -Force, NEVER reconnect the old failed DC to the production network.',
    expected: 'Healthy DC assumes all 5 FSMO roles and domain operations resume normally.',
    prevent: ['Distribute and document FSMO holders; back up System State daily'],
    diff: 'Advanced',
    time: '20-30 minutes',
    tags: ['fsmo', 'seize roles', 'netdom query fsmo', 'pdc emulator dead']
  },
  {
    id: 'AD-007',
    title: 'Kerberos Token Bloat Causing HTTP 400 / File Share Access Failures',
    category: 'Active Directory',
    desc: 'Long-tenured user in 150+ nested security groups gets HTTP 400 Bad Request (Header Too Long) on internal IIS apps.',
    symptoms: ['Internal intranet sites fail with HTTP 400 Request Header Or Cookie Too Large for specific veteran users', 'New test user in same department works fine'],
    causes: ['Excessive AD group memberships inflate Kerberos PAC ticket beyond HTTP MaxFieldLength/MaxRequestBytes'],
    steps: ['Count the affected user total nested group memberships (tokenGroups).', 'Remove obsolete legacy project groups and flatten deep group nesting.', 'If large group count is unavoidable, increase MaxFieldLength and MaxRequestBytes on internal IIS servers.'],
    cmds: [
      ['PowerShell', '(Get-ADUser jsmith -Properties tokenGroups).tokenGroups.Count', 'Count total direct + nested security SIDs'],
      ['CMD', 'klist tickets', 'Inspect user active Kerberos tickets']
    ],
    expected: 'User Kerberos ticket size drops within standard limits and IIS/SMB authentication succeeds.',
    prevent: ['Follow AGDLP role-based group hygiene and audit stale group memberships semi-annually'],
    diff: 'Advanced',
    time: '20 minutes',
    tags: ['token bloat', 'kerberos', 'http 400 header too large', 'tokengroups']
  },
  {
    id: 'AD-008',
    title: 'Accidental Deletion of Organizational Unit or AD User Accounts',
    category: 'Active Directory',
    desc: 'Admin accidentally deletes an OU or user object and needs immediate restoration with original SID and group memberships.',
    symptoms: ['User loses access immediately across all domain resources', 'Recreating user manually fails to restore SID-based permissions'],
    causes: ['OU lacks Protect object from accidental deletion flag', 'Unfiltered bulk PowerShell script'],
    steps: ['Confirm Active Directory Recycle Bin optional feature is enabled.', 'Locate the deleted object in the Deleted Objects container.', 'Restore the object intact (preserving SID, password, and group memberships) via Restore-ADObject.'],
    cmds: [
      ['PowerShell', 'Get-ADObject -Filter {displayName -like "*John Smith*"} -IncludeDeletedObjects', 'Find deleted AD object'],
      ['PowerShell', 'Get-ADObject -Filter {sAMAccountName -eq "jsmith"} -IncludeDeletedObjects | Restore-ADObject', 'Restore user with original SID and groups']
    ],
    warn: 'If AD Recycle Bin was NOT enabled prior to deletion, tombstone reanimation drops group memberships unless restored from System State backup.',
    expected: 'User account and all security group memberships restore instantaneously.',
    prevent: ['Enable Active Directory Recycle Bin immediately on every forest and check Protect from accidental deletion on all OUs'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['restore deleted ad user', 'ad recycle bin', 'restore-adobject', 'deleted ou']
  },
  {
    id: 'AD-009',
    title: 'Slow Domain Logon (5+ Minutes on Welcome Screen) in Branch Office',
    category: 'Active Directory',
    desc: 'Branch office workstations take several minutes at Welcome / Applying user settings because they authenticate against remote HQ DC.',
    symptoms: ['Logon takes 3-8 minutes in remote office', 'echo %LOGONSERVER% shows distant WAN DC instead of local site DC'],
    causes: ['Branch IPv4 subnet is missing from Active Directory Sites and Services', 'Unreachable Folder Redirection or logon script UNC path'],
    steps: ['Check echo %LOGONSERVER% and nltest /dsgetsite on an affected PC.', 'Open Active Directory Sites and Services and create the missing IPv4 CIDR subnet object mapped to the branch Site.', 'Verify GPO logon scripts do not point to decommissioned file servers.'],
    cmds: [
      ['CMD', 'nltest /dsgetsite', 'Check which AD Site client maps to'],
      ['CMD', 'echo %LOGONSERVER%', 'Check authenticating Domain Controller'],
      ['PowerShell', 'New-ADReplicationSubnet -Name "10.40.0.0/24" -Site "Branch-Chicago"', 'Bind subnet to local AD Site']
    ],
    expected: 'Clients discover local Site DC and logon time drops under 15 seconds.',
    prevent: ['Register every new VLAN subnet in AD Sites and Services during network provisioning'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['slow domain login', 'sites and services', 'logonserver', 'nltest']
  },
  {
    id: 'AD-010',
    title: 'LDAP Signing / Channel Binding Warnings (Event ID 2889)',
    category: 'Active Directory',
    errorCode: 'Event ID 2889',
    desc: 'Directory Service log records Event ID 2889 identifying appliances or scripts binding over cleartext unsigned LDAP.',
    symptoms: ['Event ID 2889 logged on Domain Controllers', 'Risk of breaking legacy printers/scanners when enforcing LDAP signing'],
    causes: ['Copiers, NAS devices, or Linux scripts using plain port 389 without StartTLS or LDAPS 636'],
    steps: ['Enable temporary Field Engineering diagnostic logging or query Event ID 2889 for client IP and bind account.', 'Reconfigure identified scanners/apps to use LDAPS (TCP 636) with valid Enterprise CA cert on DCs.', 'Once Event 2889 drops to zero, enforce Require signing via Domain Controller GPO.'],
    cmds: [
      ['PowerShell', 'Get-WinEvent -FilterHashtable @{LogName="Directory Service"; ID=2889} -MaxEvents 20 | Select TimeCreated, Message', 'Identify cleartext LDAP clients']
    ],
    expected: 'All third-party LDAP integrations migrate to LDAPS 636 or SASL-signed binds.',
    prevent: ['Deploy auto-enrolled Domain Controller Kerberos Authentication certificates for LDAPS'],
    diff: 'Advanced',
    time: '25 minutes',
    tags: ['event 2889', 'ldap signing', 'ldaps 636', 'channel binding']
  },
  {
    id: 'AD-011',
    title: 'AdminSDHolder Resetting Delegated Permissions Every 60 Minutes',
    category: 'Active Directory',
    desc: 'Helpdesk L1 password-reset delegation works for some users, but gets stripped every hour for specific manager accounts.',
    symptoms: ['Include inheritable permissions keeps unchecking itself on specific users', 'adminCount attribute equals 1 on standard staff account'],
    causes: ['User was previously added to a Protected Group (Domain Admins, Account Operators, Backup Operators) and later removed, leaving adminCount=1'],
    steps: ['Verify the user is no longer a member of any privileged AD group.', 'Clear the adminCount attribute (<not set>) on the user object.', 'Re-enable ACL inheritance in Attribute Editor / Security Advanced tab.'],
    cmds: [
      ['PowerShell', 'Get-ADUser -Filter {adminCount -eq 1} | Select Name, SamAccountName', 'Audit all accounts flagged with adminCount=1'],
      ['PowerShell', 'Set-ADUser jsmith -Clear adminCount', 'Clear orphaned adminCount flag']
    ],
    expected: 'SDProp stops overwriting ACLs on the user and Helpdesk password delegation persists.',
    prevent: ['Never add standard user accounts to Domain Admins; use dedicated separate Tier-0 admin accounts'],
    diff: 'Advanced',
    time: '15 minutes',
    tags: ['adminsdholder', 'admincount', 'inheritance disabled', 'sdprop']
  },
  {
    id: 'AD-012',
    title: 'KDC Event ID 11 / Duplicate SPN Breaking Kerberos Authentication',
    category: 'Active Directory',
    errorCode: 'Event ID 11',
    desc: 'SQL Server or IIS Kerberos SSO falls back to NTLM or fails because two AD accounts register the same Service Principal Name.',
    symptoms: ['Clients prompt repeatedly for credentials on internal app', 'System log on DC shows KDC Event ID 11 duplicate SPN'],
    causes: ['Service switched from computer account to service account without removing old SPN'],
    steps: ['Search forest-wide for duplicate Service Principal Names using setspn -X.', 'Inspect SPNs on both conflicting accounts with setspn -L.', 'Delete the stale SPN from the incorrect account using setspn -D.'],
    cmds: [
      ['CMD', 'setspn -X', 'Find all duplicate SPNs in forest'],
      ['CMD', 'setspn -Q HTTP/intranet.corp.local', 'Locate accounts holding specific SPN'],
      ['CMD', 'setspn -D HTTP/intranet.corp.local OLD-SRV01', 'Remove duplicate SPN']
    ],
    expected: 'setspn -X reports 0 duplicates and Kerberos mutual authentication succeeds.',
    prevent: ['Use Group Managed Service Accounts (gMSA) with automatic SPN management'],
    diff: 'Advanced',
    time: '15 minutes',
    tags: ['duplicate spn', 'setspn', 'kdc event 11', 'kerberos fallback ntlm']
  },
  {
    id: 'AD-013',
    title: 'New User UPN Suffix Missing for Microsoft 365 Hybrid Sign-In',
    category: 'Active Directory',
    desc: 'Newly created AD user gets username@corp.local instead of routable username@company.com, causing Entra Connect .onmicrosoft.com mismatch.',
    symptoms: ['M365 login assigns user@tenant.onmicrosoft.com instead of @company.com', 'Routable domain missing from ADUC UPN dropdown'],
    causes: ['Public verified domain not added to Active Directory Domains and Trusts UPN Suffixes', 'User created in wrong OU or without -UserPrincipalName'],
    steps: ['Add company.com to alternative UPN suffixes in Active Directory Domains and Trusts.', 'Update the affected user UserPrincipalName to match their primary SMTP address.', 'Trigger delta sync on Entra Connect server.'],
    cmds: [
      ['PowerShell', 'Get-ADForest | Select UPNSuffixes', 'Check registered forest UPN suffixes'],
      ['PowerShell', 'Set-ADUser jsmith -UserPrincipalName "jsmith@company.com"', 'Fix user UPN suffix']
    ],
    expected: 'User signs into both Windows and Microsoft 365 seamlessly with jsmith@company.com.',
    prevent: ['Standardize user provisioning scripts to always set routable @company.com UPNs'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['upn suffix', 'corp.local', 'onmicrosoft.com', 'entra connect upn']
  },

  // ================= 5. Group Policy (13 issues) =================
  {
    id: 'GPO-001',
    title: 'Group Policy Processing Failed: Error 1058 Cannot Read gpt.ini',
    category: 'Group Policy',
    errorCode: 'Event ID 1058',
    desc: 'gpupdate /force fails because workstation cannot read \\\\domain\\sysvol\\domain\\Policies\\{GUID}\\gpt.ini.',
    symptoms: ['The processing of Group Policy failed. Windows attempted to read the file gpt.ini', 'Event ID 1058 in System log'],
    causes: ['SMB signing/Hardened UNC Paths blocking SYSVOL', 'DFSR out of sync on authenticating DC', 'Corrupted local Machine Registry.pol cache'],
    steps: ['Test manual UNC browse to \\\\corp.local\\SYSVOL from the client.', 'Confirm authenticating DC has healthy SYSVOL share.', 'If only one PC fails, delete local cached Registry.pol and run gpupdate /force.'],
    cmds: [
      ['CMD', 'dir \\\\corp.local\\sysvol\\corp.local\\Policies', 'Verify SYSVOL read access'],
      ['CMD', 'del /f /q C:\\Windows\\System32\\GroupPolicy\\Machine\\Registry.pol', 'Clear corrupted local Machine policy cache'],
      ['CMD', 'gpupdate /force', 'Reapply Group Policy']
    ],
    expected: 'Computer and User policy updates complete without Event ID 1058.',
    prevent: ['Maintain healthy DFSR replication across all Domain Controllers'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['event 1058', 'gpt.ini', 'gpupdate failed', 'sysvol gpo']
  },
  {
    id: 'GPO-002',
    title: 'User GPO Settings Not Applying After MS16-072 Security Filtering Change',
    category: 'Group Policy',
    desc: 'GPO scoped via Security Filtering to a custom User Security Group is silently skipped.',
    symptoms: ['gpresult /r lists GPO under Filtering: Denied (Security)', 'Authenticated Users was removed from Security Filtering tab'],
    causes: ['Since MS16-072, Computer accounts read User GPOs over SMB—removing Authenticated Users strips Domain Computers Read permission'],
    steps: ['Open Group Policy Management Console (GPMC) and select the GPO.', 'Leave custom User Group in Security Filtering.', 'Switch to the Delegation tab, click Add, add Domain Computers (or Authenticated Users), and grant Read permission ONLY (not Apply Group Policy).'],
    cmds: [
      ['CMD', 'gpresult /h C:\\temp\\gpreport.html', 'Generate HTML Resultant Set of Policy report'],
      ['CMD', 'gpupdate /force', 'Refresh policy after delegation fix']
    ],
    expected: 'Computer account reads the GPO and targeted User Group receives the policy settings.',
    prevent: ['Always keep Domain Computers Read permission on Delegation tab when custom-filtering User GPOs'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['ms16-072', 'denied security', 'gpo security filtering', 'authenticated users removed']
  },
  {
    id: 'GPO-003',
    title: 'GPO Mapped Network Drives Not Appearing at Logon',
    category: 'Group Policy',
    desc: 'Group Policy Preferences Drive Maps do not show in File Explorer until user manually runs gpupdate.',
    symptoms: ['Mapped S: or H: drive missing right after cold boot login', 'Running gpupdate after login makes drives appear'],
    causes: ['Fast Logon Optimization processes GPO asynchronously before WiFi/NIC link is ready', 'Action set to Create instead of Update or Replace', 'Reconnect checkbox unchecked'],
    steps: ['Set GPP Drive Map Action to Update (not Create or Replace, as Replace disconnects open files every 90 min).', 'Enable Always wait for the network at computer startup and logon in Computer Configuration > System > Logon.', 'Verify user has NTFS/Share Read permissions to the UNC target.'],
    cmds: [
      ['CMD', 'gpresult /r /scope:user', 'Verify Drive Map GPO applied to user'],
      ['CMD', 'net use', 'List active SMB drive mappings']
    ],
    expected: 'Mapped drives mount reliably on every initial login.',
    prevent: ['Use Action: Update with Reconnect enabled and DFS Namespace paths (\\\\corp.local\\shares\\dept)'],
    diff: 'Beginner',
    time: '10-15 minutes',
    tags: ['gpo mapped drive', 'drive map missing', 'fast logon optimization', 'gpp update']
  },
  {
    id: 'GPO-004',
    title: 'Computer Configuration Settings Ignored Inside User OU GPO',
    category: 'Group Policy',
    desc: 'Admin configures Windows Firewall or BitLocker rules in a GPO linked to OU=Users, and nothing happens.',
    symptoms: ['Computer Configuration policies never appear in gpresult /scope:computer', 'GPO is linked to an OU containing only User accounts'],
    causes: ['Computer Configuration applies strictly to Computer objects; linking to a User OU has zero effect without Loopback'],
    steps: ['Link Computer Configuration GPOs directly to the OU containing the target Workstation or Server computer objects.', 'For VDI/RDS kiosks where user settings must follow the machine, configure User Group Policy Loopback Processing Mode (Merge or Replace) on the Computer OU.'],
    cmds: [
      ['CMD', 'gpresult /r /scope:computer', 'Inspect applied Computer GPOs and workstation OU path']
    ],
    expected: 'Computer policies apply cleanly to workstations inside the target Computer OU.',
    prevent: ['Separate Computer GPOs and User GPOs by prefix (e.g., COMP-BitLocker vs USER-DriveMaps)'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['computer gpo not applying', 'wrong ou', 'loopback processing', 'gpresult']
  },
  {
    id: 'GPO-005',
    title: 'Outdated Windows 11 ADMX Templates Missing New OS Policy Settings',
    category: 'Group Policy',
    desc: 'GPMC on Windows Server 2019/2022 lacks Windows 11 23H2/24H2 settings like Copilot, Widgets, or LAPS.',
    symptoms: ['New Windows 11 administrative template nodes missing in GPMC', 'Templates retrieved from local workstation instead of Central Store'],
    causes: ['PolicyDefinitions Central Store in SYSVOL not created or contains older ADMX/ADML files'],
    steps: ['Download the latest official Windows 11 Administrative Templates (.msi) from Microsoft.', 'Copy *.admx and en-US\\*.adml into \\\\corp.local\\SYSVOL\\corp.local\\Policies\\PolicyDefinitions.', 'Reopen GPMC and confirm Administrative Templates reads from Central Store.'],
    cmds: [
      ['PowerShell', 'Test-Path "\\\\corp.local\\SYSVOL\\corp.local\\Policies\\PolicyDefinitions"', 'Verify Central Store exists']
    ],
    warn: 'Back up the existing PolicyDefinitions folder before overwriting ADMX/ADML files.',
    expected: 'All GPMC consoles across the domain display unified, up-to-date Windows 11 and Office templates.',
    prevent: ['Update SYSVOL PolicyDefinitions Central Store alongside annual Windows feature releases'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['admx central store', 'policydefinitions', 'windows 11 gpo missing']
  },
  {
    id: 'GPO-006',
    title: 'GPO Software Installation (.MSI) Failing at Boot',
    category: 'Group Policy',
    desc: 'Assigned MSI package via Group Policy Software Installation never installs on target workstations.',
    symptoms: ['Application missing after reboot', 'Event ID 102 / 108 Application Management logged in System log'],
    causes: ['MSI path entered as local C:\\ path instead of UNC \\\\server\\share', 'Domain Computers lack Read permission on distribution share', 'Asynchronous startup skips MSI install'],
    steps: ['Ensure software share grants Read & Execute to Domain Computers (not just Authenticated Users/Domain Users).', 'Specify UNC network path when adding the MSI package.', 'Enable Always wait for the network at computer startup and logon so synchronous boot triggers MSI installation.'],
    cmds: [
      ['PowerShell', 'Get-WinEvent -FilterHashtable @{LogName="System"; ProviderName="Application Management Group Policy"} -MaxEvents 10', 'Check MSI deployment errors']
    ],
    expected: 'Assigned MSI installs silently prior to the Ctrl+Alt+Del logon screen.',
    prevent: ['Migrate complex application deployments to Microsoft Intune or MECM/PDQ rather than legacy GPSI'],
    diff: 'Intermediate',
    time: '15-20 minutes',
    tags: ['gpo msi install', 'software installation gpo', 'domain computers share']
  },
  {
    id: 'GPO-007',
    title: 'Tattooed Registry Settings Persist After Unlinking GPO',
    category: 'Group Policy',
    desc: 'After unlinking or deleting a GPO, workstations remain locked down with the old restriction.',
    symptoms: ['Setting remains active even though gpresult no longer lists the GPO', 'Registry key resides outside \\Policies\\ branch'],
    causes: ['Group Policy Preferences (GPP) Registry items or unmanaged templates tattoo HKLM/HKCU permanently unless explicitly removed'],
    steps: ['Check whether the setting was deployed via Group Policy Preferences (Preferences > Windows Settings > Registry) rather than Administrative Templates.', 'Create a temporary remediation GPP item with Action: Delete or set the opposite value, or enable Remove this item when it is no longer applied.', 'Once fleet checks in, retire the cleanup rule.'],
    cmds: [
      ['PowerShell', 'reg query "HKLM\\Software\\Policies\\Microsoft\\Windows"', 'Inspect managed policy registry hive']
    ],
    expected: 'Tattooed registry values are cleanly removed across affected workstations.',
    prevent: ['Check Remove this item when it is no longer applied on Group Policy Preferences items'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['gpo tattooing', 'unlinked gpo still active', 'gpp registry']
  },
  {
    id: 'GPO-008',
    title: 'WMI Filter Slowing Logon or Failing to Match Windows 11 Clients',
    category: 'Group Policy',
    desc: 'GPO using OS version WMI filter fails to target Windows 11 because Win32_OperatingSystem Caption changed while BuildNumber >= 22000.',
    symptoms: ['gpresult shows Filtering: Denied (WMI Filter) on Windows 11', 'Or expensive Win32_Product WMI query adds 45 seconds to boot'],
    causes: ['Legacy WMI query checks Version LIKE "10.0%" expecting Win10 only (Win11 also reports 10.0.22xxx)', 'Win32_Product triggers full MSI reconfiguration scan'],
    steps: ['Never use Win32_Product in WMI filters!', 'Differentiate Windows 11 from Windows 10 using BuildNumber >= 22000 on Win32_OperatingSystem.', 'Test WMI query execution speed locally (<100ms) with Measure-Command before linking.'],
    cmds: [
      ['PowerShell', 'Get-CimInstance -Query "SELECT * FROM Win32_OperatingSystem WHERE BuildNumber >= 22000 AND ProductType = 1"', 'Test Windows 11 workstation WMI filter']
    ],
    warn: 'Querying Win32_Product causes extreme CPU/disk spikes and MSI self-repair storms—use registry uninstall keys instead.',
    expected: 'WMI filter evaluates in milliseconds and accurately targets Windows 11 workstations.',
    prevent: ['Keep WMI queries simple and indexed against Win32_OperatingSystem or Win32_ComputerSystem'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['wmi filter windows 11', 'buildnumber 22000', 'win32_product slow']
  },
  {
    id: 'GPO-009',
    title: 'Block Inheritance Overriding Mandatory Security Policies on Sub-OU',
    category: 'Group Policy',
    desc: 'Lab or developer sub-OU enabled Block Inheritance, inadvertently dropping baseline password/LAPS/Defender policies.',
    symptoms: ['Security audit flags sub-OU machines missing LAPS and firewall rules', 'Blue exclamation mark appears on OU icon in GPMC'],
    causes: ['OU administrator enabled Block Inheritance without Enforced status on Tier-0 security baselines'],
    steps: ['Mark mandatory domain-wide security baselines (LAPS, Defender, Firewall, Audit) as Enforced at the Domain root link.', 'Replace blanket Block Inheritance on sub-OUs with targeted Item-Level Targeting or WMI exemptions where possible.'],
    cmds: [
      ['PowerShell', 'Get-GPO -All | ForEach { Get-GPPermissions -Guid $_.Id -All > $null }; Get-ADOrganizationalUnit -Filter * -Properties gpOptions | Where gpOptions -eq 1 | Select Name, DistinguishedName', 'Find all OUs with Block Inheritance enabled']
    ],
    expected: 'Enforced security baselines apply across all sub-OUs regardless of Block Inheritance.',
    prevent: ['Audit gpOptions=1 OUs quarterly and restrict Enforced links strictly to InfoSec baselines'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['block inheritance', 'enforced gpo', 'gpoptions', 'security baseline']
  },
  {
    id: 'GPO-010',
    title: 'Windows LAPS Local Admin Password Not Backing Up to Active Directory',
    category: 'Group Policy',
    desc: 'Native Windows LAPS GPO applies, but Active Directory computer object shows empty LAPS tab.',
    symptoms: ['LAPS tab in ADUC shows No password available', 'Event ID 10014 / 10031 in Microsoft-Windows-LAPS/Operational log'],
    causes: ['AD Schema not extended with Update-LapsADSchema', 'SELF computer permission not granted via Set-LapsADComputerSelfPermission on target OU'],
    steps: ['Verify AD schema was updated for Windows LAPS.', 'Run Set-LapsADComputerSelfPermission on the workstation OU so computers can write their own encrypted password attribute.', 'Run Invoke-LapsPolicyProcessing on a test PC and check Event ID 10027.'],
    cmds: [
      ['PowerShell', 'Set-LapsADComputerSelfPermission -Identity "OU=Workstations,DC=corp,DC=local"', 'Grant computer SELF write permission'],
      ['PowerShell', 'Invoke-LapsPolicyProcessing', 'Trigger immediate LAPS rotation on client']
    ],
    warn: 'Delegate Read-LapsPassword strictly to authorized Tier-1/Tier-2 Helpdesk security groups, never Domain Users.',
    expected: 'Encrypted local administrator password populates on the AD computer object immediately.',
    prevent: ['Verify Microsoft-Windows-LAPS/Operational Event 10004/10027 when onboarding new OUs'],
    diff: 'Advanced',
    time: '15-20 minutes',
    tags: ['windows laps', 'laps password empty', 'set-lapsadcomputerselfpermission']
  },
  {
    id: 'GPO-011',
    title: 'Folder Redirection Failing on Offline / Roaming Laptops',
    category: 'Group Policy',
    desc: 'Remote employees experience frozen desktops and missing Desktop/Documents icons when working off VPN.',
    symptoms: ['Desktop icons vanish or Explorer freezes for 60s when saving files off-premises', 'Event ID 502 Folder Redirection failed'],
    causes: ['Legacy SMB Folder Redirection requires continuous LAN/VPN reachability or fragile Offline Files (CSC) cache'],
    steps: ['Check Folder Redirection operational event log and Offline Files sync conflicts.', 'Reset corrupted CSC cache only after backing up unsynced local changes.', 'Plan migration from legacy SMB Folder Redirection to OneDrive Known Folder Move (KFM) for modern hybrid laptops.'],
    cmds: [
      ['PowerShell', 'Get-WinEvent -LogName "Microsoft-Windows-Folder Redirection/Operational" -MaxEvents 10', 'Check redirection errors']
    ],
    warn: 'Formatting Offline Files CSC database deletes unsynced offline edits—always copy local files out first.',
    expected: 'Desktop and Documents access responds locally without SMB timeouts.',
    prevent: ['Use OneDrive Known Folder Move (KFM) instead of SMB Folder Redirection for laptop fleets'],
    diff: 'Intermediate',
    time: '20 minutes',
    tags: ['folder redirection', 'offline files', 'csc cache', 'event 502']
  },
  {
    id: 'GPO-012',
    title: 'Printer Deployed via GPO Fails with Point and Print Error 0x0000011b / 0x00000bcb',
    category: 'Group Policy',
    errorCode: '0x00000bcb',
    desc: 'Shared network printers deployed via GPO stop installing on patched Windows clients due to PrintNightmare hardening.',
    symptoms: ['GPO printer missing for non-admin users', 'Manual connection to \\\\printsrv\\printer prompts for Admin UAC or fails with 0x00000bcb / 0x0000011b'],
    causes: ['KB5005652 restricts non-admin Point and Print driver installs unless approved print server FQDN is allowlisted and V4/packaged drivers are used'],
    steps: ['Upgrade print queue drivers on the print server to Type 4 (V4) or WHQL signed packaged drivers.', 'Configure Point and Print Restrictions GPO: enable Users can only point and print to these servers and list exact print server FQDNs.', 'Pre-stage vendor print drivers into the OS driver store via pnputil if V3 drivers are mandatory.'],
    cmds: [
      ['CMD', 'pnputil /add-driver "\\\\filesrv\\drivers\\printer\\*.inf" /install', 'Pre-stage signed driver as Admin']
    ],
    warn: 'Do NOT set RestrictDriverInstallationToAdministrators=0 globally, as that reopens CVE-2021-34527 (PrintNightmare).',
    expected: 'Standard users map approved corporate print server queues cleanly without UAC prompts.',
    prevent: ['Standardize on Microsoft Universal Print or V4 packaged drivers'],
    diff: 'Advanced',
    time: '20-25 minutes',
    tags: ['0x00000bcb', '0x0000011b', 'printnightmare', 'point and print gpo']
  },
  {
    id: 'GPO-013',
    title: 'Conflicting GPO Precedence Overwriting Expected Browser or Lock Screen Policy',
    category: 'Group Policy',
    desc: 'A setting configured in a Domain-level GPO is unexpectedly overridden by another GPO.',
    symptoms: ['Expected Chrome/Edge homepage or lock timeout does not match edited GPO', 'Multiple GPOs touch the same registry key'],
    causes: ['LSDOU order (Local -> Site -> Domain -> OU): child OU GPOs override Domain GPOs, and Link Order 1 beats Link Order 2'],
    steps: ['Run Group Policy Modeling Wizard in GPMC or gpresult /h on an affected workstation.', 'Expand Winning GPO section in the HTML report to see the exact GPO winning precedence.', 'Consolidate duplicate settings or adjust Link Order on the OU.'],
    cmds: [
      ['CMD', 'gpresult /h "%USERPROFILE%\\Desktop\\GPO-Audit.html"', 'Export Winning GPO precedence report']
    ],
    expected: 'Winning GPO is clearly identified and link order/consolidation applies intended policy.',
    prevent: ['Follow single-purpose GPO design and avoid setting conflicting values across Domain and OU tiers'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['lsdou', 'winning gpo', 'gpo precedence', 'link order']
  }
];

export const ISSUES_PART_1 = expandIssues(SEEDS_PART_1);
