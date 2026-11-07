import { ITCategory, ITIssue } from '../types';
import { ISSUES_PART_1 } from './issuesPart1';
import { ISSUES_PART_2 } from './issuesPart2';
import { ISSUES_PART_3 } from './issuesPart3';
import { ISSUES_PART_4 } from './issuesPart4';
import { ISSUES_PART_5 } from './issuesPart5';

export const ALL_ISSUES: ITIssue[] = [
  ...ISSUES_PART_1,
  ...ISSUES_PART_2,
  ...ISSUES_PART_3,
  ...ISSUES_PART_4,
  ...ISSUES_PART_5,
];

export const ALL_CATEGORIES: ITCategory[] = [
  'Windows 10 & Windows 11',
  'Networking & TCP/IP',
  'DNS & DHCP',
  'Active Directory',
  'Group Policy',
  'Microsoft 365',
  'Outlook & Exchange',
  'Laptop & Desktop Hardware',
  'Printer & Scanner',
  'Windows Server',
  'Linux',
  'Azure & Cloud',
  'VPN & Remote Access',
  'Remote Desktop',
  'Cybersecurity',
  'Antivirus & Firewall',
  'WiFi & LAN',
  'Software & Applications',
  'Email Troubleshooting',
  'Backup & Recovery',
  'IT Helpdesk & Ticketing',
  'Virtualization',
  'Storage & Disk Management',
  'File Sharing & Permissions',
  'User Account & Login Issues',
];

export interface DomainGuideConfig {
  slug: string;
  route: string;
  title: string;
  metaDescription: string;
  subtitle: string;
  categories: ITCategory[];
  goldenWorkflow: {
    stepTitle: string;
    detail: string;
    command: string;
  }[];
  proChecklist: string[];
}

export const DOMAIN_GUIDES: Record<string, DomainGuideConfig> = {
  windows: {
    slug: 'windows-troubleshooting',
    route: '/windows-troubleshooting',
    title: 'Windows 10 & Windows 11 Troubleshooting Guide',
    metaDescription: 'Complete Windows 10 and Windows 11 troubleshooting runbooks covering BSODs, Windows Update errors, BitLocker, shell hangs, software MSI repairs, and user profiles.',
    subtitle: 'Systematic diagnostic workflow and step-by-step fixes for Windows client endpoints, patching, boot failures, and desktop applications.',
    categories: ['Windows 10 & Windows 11', 'Laptop & Desktop Hardware', 'Software & Applications', 'Printer & Scanner', 'User Account & Login Issues'],
    goldenWorkflow: [
      { stepTitle: '1. Inspect Recent Crash & Servicing Events', detail: 'Check System and Application Event Logs before rebooting or reinstalling.', command: 'Get-WinEvent -FilterHashtable @{LogName="Application","System"; Level=1,2} -MaxEvents 15' },
      { stepTitle: '2. Repair Component Store (DISM)', detail: 'Ensure C:\\Windows\\WinSxS has clean upstream source files before running SFC.', command: 'DISM /Online /Cleanup-Image /RestoreHealth' },
      { stepTitle: '3. Verify Protected System Binaries (SFC)', detail: 'Scan and replace corrupted OS DLLs and shell components.', command: 'sfc /scannow' },
      { stepTitle: '4. Check Disk Health & Pending Reboots', detail: 'Verify NVMe/SSD SMART status and clear pending update locks.', command: 'Get-PhysicalDisk | Select FriendlyName, HealthStatus, OperationalStatus' },
    ],
    proChecklist: [
      'Always suspend BitLocker for 1 reboot prior to flashing UEFI/BIOS firmware.',
      'Check Event ID 1000 & 1026 first whenever an application closes silently.',
      'Never manually delete files inside C:\\Windows\\WinSxS or C:\\Windows\\Installer.',
      'Use Standard TCP/IP ports with SNMP Status Disabled to prevent false Printer Offline states.'
    ]
  },
  networking: {
    slug: 'networking-solutions',
    route: '/networking-solutions',
    title: 'Networking, DNS, DHCP & WiFi Troubleshooting Guide',
    metaDescription: 'Practical Layer 1 to Layer 7 enterprise networking solutions covering TCP/IP routing, VLANs, DNS/DHCP scopes, WiFi roaming, MTU blackholes, and VPNs.',
    subtitle: 'Isolate Layer 1 physical errors, VLAN trunking, DHCP scope exhaustion, split-horizon DNS, and IPSec/SSL VPN issues methodically.',
    categories: ['Networking & TCP/IP', 'DNS & DHCP', 'WiFi & LAN', 'VPN & Remote Access', 'Antivirus & Firewall'],
    goldenWorkflow: [
      { stepTitle: '1. Verify Physical Link & IP Lease (L1–L3)', detail: 'Confirm link speed (1000 Mbps vs 100 Mbps degraded pair) and valid non-169.254 DHCP lease.', command: 'Get-NetIPConfiguration -Detailed' },
      { stepTitle: '2. Isolate Local Gateway vs Upstream WAN', detail: 'Ping local default gateway first (<2ms), then public IP (1.1.1.1) before testing DNS.', command: 'ping -n 5 1.1.1.1' },
      { stepTitle: '3. Test Authoritative DNS Resolution', detail: 'Compare OS name resolution against direct DNS server queries.', command: 'Resolve-DnsName microsoft.com' },
      { stepTitle: '4. Test Layer 4 TCP Application Socket', detail: 'Never rely on ICMP ping alone—firewalls frequently drop ICMP while allowing or blocking TCP.', command: 'Test-NetConnection -ComputerName 10.10.1.20 -Port 443 -TraceRoute' },
    ],
    proChecklist: [
      'Never assign public DNS (8.8.8.8) on Active Directory domain-joined NICs.',
      'Enable Rapid PVST+ BPDU Guard and DHCP Snooping on all edge access ports.',
      'Restrict 2.4 GHz WiFi strictly to channels 1, 6, and 11 at 20 MHz channel width.',
      'Clamp TCP MSS to 1360 bytes on IPSec/PPPoE/WireGuard tunnels to prevent TLS blackholes.'
    ]
  },
  activeDirectory: {
    slug: 'active-directory-guide',
    route: '/active-directory-guide',
    title: 'Active Directory & Group Policy Administration Guide',
    metaDescription: 'Enterprise Active Directory troubleshooting for replication (repadmin/dcdiag), DFSR SYSVOL, Event 4740 lockouts, Kerberos SPNs, FSMO roles, and GPO precedence.',
    subtitle: 'Keep Domain Controllers, Kerberos authentication, SYSVOL replication, Windows LAPS, and Group Policy Objects healthy.',
    categories: ['Active Directory', 'Group Policy', 'User Account & Login Issues', 'File Sharing & Permissions'],
    goldenWorkflow: [
      { stepTitle: '1. Check Forest-Wide Replication Health', detail: 'Spot RPC 1722 or Access Denied 8453 replication failures immediately.', command: 'repadmin /replsummary' },
      { stepTitle: '2. Validate Domain Controller Diagnostics & DNS', detail: 'Verify _msdcs SRV records, SYSVOL/NETLOGON advertising, and KDC health.', command: 'dcdiag /test:dns /v /e' },
      { stepTitle: '3. Trace Account Lockouts on PDC Emulator', detail: 'Query Event ID 4740 on the PDC Emulator to pinpoint Caller Computer Name.', command: 'Get-ADDomain | Select PDCEmulator, InfrastructureMaster' },
      { stepTitle: '4. Audit Resultant Set of Group Policy', detail: 'Export HTML Winning GPO report to check WMI/Security filtering and LSDOU order.', command: 'gpresult /h C:\\temp\\gpreport.html' },
    ],
    proChecklist: [
      'Enable Active Directory Recycle Bin on Day 1 so deleted objects keep SIDs and group memberships.',
      'Keep Domain Computers (Read) on Delegation tab when custom security-filtering User GPOs (MS16-072).',
      'Map every new office VLAN subnet in AD Sites and Services to prevent slow cross-WAN logons.',
      'Use Test-ComputerSecureChannel -Repair instead of unjoining/rejoining broken domain trusts.'
    ]
  },
  microsoft365: {
    slug: 'microsoft-365-guide',
    route: '/microsoft-365-guide',
    title: 'Microsoft 365, Exchange Online & Outlook Guide',
    metaDescription: 'Step-by-step Microsoft 365 troubleshooting for Entra ID Conditional Access, Teams WAM loops, OneDrive sync, Exchange Online quarantine, SPF/DKIM/DMARC, and Outlook OST.',
    subtitle: 'Resolve Hybrid identity sync conflicts, Conditional Access blocks, mail-flow NDRs, Teams/OneDrive sync stalls, and classic/new Outlook issues.',
    categories: ['Microsoft 365', 'Outlook & Exchange', 'Email Troubleshooting', 'Cybersecurity'],
    goldenWorkflow: [
      { stepTitle: '1. Verify Endpoint Hybrid/Entra PRT Token State', detail: 'Run dsregcmd as the logged-in user to confirm AzureAdPrt : YES.', command: 'dsregcmd /status' },
      { stepTitle: '2. Trace Inbound & Outbound Mail Delivery', detail: 'Confirm whether missing emails were Quarantined, Deferred, or Failed.', command: 'Get-MessageTrace -StartDate (Get-Date).AddDays(-1) -EndDate (Get-Date)' },
      { stepTitle: '3. Audit Mailbox Hidden Rules & Forwarding', detail: 'Check -IncludeHidden rules immediately on any suspected phishing incident.', command: 'Get-InboxRule -Mailbox user@company.com -IncludeHidden' },
      { stepTitle: '4. Trigger Entra Connect Delta Synchronization', detail: 'Push on-premises AD proxyAddresses/UPN changes to Entra ID.', command: 'Start-ADSyncSyncCycle -PolicyType Delta' },
    ],
    proChecklist: [
      'Convert departed user mailboxes (<50 GB) to Shared Mailboxes BEFORE removing M365 licenses.',
      'Always call Revoke-MgUserSignInSession alongside password resets to kill stolen AiTM session cookies.',
      'Keep SPF recursive DNS lookups <= 10 by isolating marketing/CRM mailers onto subdomains.',
      'Disable Download Shared Folders in Outlook to stop multi-mailbox users hitting the 50 GB OST cap.'
    ]
  },
  windowsServer: {
    slug: 'windows-server-guide',
    route: '/windows-server-guide',
    title: 'Windows Server, Storage, Backup & Virtualization Guide',
    metaDescription: 'Production Windows Server 2019/2022/2025 troubleshooting covering IIS 503 crashes, VSS writers, Failover Clustering, Hyper-V/VMware, RAID/SAN storage, and Veeam backups.',
    subtitle: 'Maintain zero-downtime Windows Server infrastructure, IIS web tiers, SMB file clusters, hypervisors, and immutable 3-2-1-1-0 backups.',
    categories: ['Windows Server', 'Virtualization', 'Storage & Disk Management', 'Backup & Recovery', 'Remote Desktop'],
    goldenWorkflow: [
      { stepTitle: '1. Check VSS Writer Stability Before Nightly Backups', detail: 'Restart individual wedged writer services without rebooting production hosts.', command: 'vssadmin list writers' },
      { stepTitle: '2. Inspect NLA Firewall Profile & SMB Sessions', detail: 'Confirm member servers booted into DomainAuthenticated profile.', command: 'Get-NetConnectionProfile' },
      { stepTitle: '3. Safely Clean Superseded WinSxS Packages', detail: 'Reclaim gigabytes on C: safely without breaking Windows Update servicing.', command: 'Dism.exe /online /Cleanup-Image /StartComponentCleanup' },
      { stepTitle: '4. Audit Physical Disks & Failover Cluster Nodes', detail: 'Verify storage pool health and cluster quorum votes.', command: 'Get-PhysicalDisk | Select FriendlyName, OperationalStatus, HealthStatus' },
    ],
    proChecklist: [
      'Format backup repositories as ReFS 64KB (or hardened Linux XFS reflink) for zero-space Synthetic Fulls.',
      'Pair every FULL recovery SQL Server database with 15-minute Transaction Log backups so .ldf files recycle.',
      'Blink physical bay Locate LEDs and verify Serial Numbers before hot-swapping degraded RAID disks.',
      'Never store backup BitLocker decryption keys exclusively inside the Active Directory forest being backed up.'
    ]
  },
  linux: {
    slug: 'linux-troubleshooting',
    route: '/linux-troubleshooting',
    title: 'Linux Server Administration & Troubleshooting Guide',
    metaDescription: 'Real-world Ubuntu, Debian, RHEL, and Rocky Linux troubleshooting covering systemd failures, disk/inode exhaustion, LVM online resize, SSH keys, SELinux, and OOM kills.',
    subtitle: 'Diagnose Linux daemons, storage filesystems, kernel OOM events, SELinux contexts, network sockets, and cron automation safely.',
    categories: ['Linux', 'Networking & TCP/IP', 'Storage & Disk Management', 'File Sharing & Permissions', 'Antivirus & Firewall'],
    goldenWorkflow: [
      { stepTitle: '1. Check Disk Blocks, Inodes & Open Deleted Handles', detail: 'Spot 100% disks caused by unlinked open log descriptors or inode exhaustion.', command: 'df -h && df -i && sudo lsof +L1 | head -n 15' },
      { stepTitle: '2. Read Systemd Unit & Kernel Ring Buffer Logs', detail: 'Inspect exact daemon exit codes and OOM killer events.', command: 'sudo journalctl -xe --no-pager -n 40 && sudo dmesg -T | tail -n 20' },
      { stepTitle: '3. Audit Listening Sockets & Owning PIDs', detail: 'Verify whether services bind to 127.0.0.1 vs 0.0.0.0.', command: 'sudo ss -tulpn' },
      { stepTitle: '4. Validate /etc/fstab Before Any Reboot', detail: 'Prevent Emergency Mode boot lockouts after editing disk or NFS mounts.', command: 'sudo mount -a' },
    ],
    proChecklist: [
      'Always test sudo mount -a before rebooting after any /etc/fstab edit.',
      'Bind internal Docker database ports to 127.0.0.1:5432:5432 because Docker bypasses UFW chains.',
      'Use setsebool -P and semanage fcontext on RHEL/Rocky instead of disabling SELinux.',
      'Pass -aG (never -G alone!) to usermod when adding Linux users to sudo or docker groups.'
    ]
  },
  azureCloud: {
    slug: 'azure-cloud-guide',
    route: '/azure-cloud-guide',
    title: 'Microsoft Azure & Hybrid Cloud Troubleshooting Guide',
    metaDescription: 'Enterprise Azure troubleshooting covering VM NSG/Bastion access, Site-to-Site IPSec VPNs, non-transitive VNet peering, Private Endpoints, App Services, and AKS.',
    subtitle: 'Solve cloud networking, Private Link DNS split-brain, RBAC data-plane permissions, Entra App Registration expirations, and AKS pod crashes.',
    categories: ['Azure & Cloud', 'Microsoft 365', 'VPN & Remote Access', 'Cybersecurity', 'Backup & Recovery'],
    goldenWorkflow: [
      { stepTitle: '1. Verify Effective Routes & NSG IP Flow', detail: 'Check effective NIC routing tables and security rules in Network Watcher.', command: 'az network nic show-effective-route-table --name myVMNic --resource-group myRG -o table' },
      { stepTitle: '2. Validate Private Endpoint DNS Chain', detail: 'Confirm privatelink CNAME resolves to internal 10.x.x.x VNet IP.', command: 'nslookup mystorage.blob.core.windows.net' },
      { stepTitle: '3. Stream Live App Service / Container Crash Logs', detail: 'Read live stdout/stderr when deployments throw HTTP 500.30 or 503.', command: 'az webapp log tail --name my-webapp --resource-group myRG' },
      { stepTitle: '4. Audit Expiring App Secrets & Unattached Disks', detail: 'Prevent midnight AADSTS7000222 outages and orphaned SSD billing.', command: 'az disk list --query "[?managedBy==null].{Name:name,RG:resourceGroup,Size:diskSizeGb}" -o table' },
    ],
    proChecklist: [
      'Never configure static IPv4 inside an Azure VM guest OS—always set Static allocation on the Azure NIC.',
      'Remember VNet Peering is non-transitive: Spoke-to-Spoke traffic requires UDRs pointing to a Hub firewall.',
      'Azure Control-Plane Owner does NOT grant Data-Plane access (assign Storage Blob / Key Vault Data RBAC).',
      'Prefer Managed Identities and Workload Identity Federation over expiring App Registration client secrets.'
    ]
  }
};
