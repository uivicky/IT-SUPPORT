import { CommandLibraryItem } from '../types';

export const COMMANDS_LIBRARY: CommandLibraryItem[] = [
  {
    id: 'CMD-01',
    command: 'ipconfig',
    platform: 'Windows CMD',
    purpose: 'Display basic IPv4/IPv6 addresses, subnet mask, and default gateway for all active adapters.',
    example: 'ipconfig',
    expectedOutput: 'Ethernet adapter Ethernet:\n   IPv4 Address. . . . . . . . . . . : 10.10.1.45\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 10.10.1.1',
    explanation: 'Fastest first check to verify whether an endpoint has a valid routable subnet IP vs 169.254.x.x APIPA.',
    permissions: 'Standard User'
  },
  {
    id: 'CMD-02',
    command: 'ipconfig /all',
    platform: 'Windows CMD',
    purpose: 'Display full adapter details including MAC (Physical Address), DHCP server IP, DNS servers, and lease times.',
    example: 'ipconfig /all',
    expectedOutput: 'Physical Address: 00-1A-2B-3C-4D-5E | DHCP Enabled: Yes | DHCP Server: 10.10.0.10 | DNS Servers: 10.10.0.10, 10.10.0.11',
    explanation: 'Essential for spotting rogue DHCP servers, wrong DNS servers (e.g., 8.8.8.8 on a domain PC), and hardware MAC addresses.',
    permissions: 'Standard User'
  },
  {
    id: 'CMD-03',
    command: 'ipconfig /flushdns',
    platform: 'Windows CMD',
    purpose: 'Purge local Windows DNS client resolver cache including stale negative NXDOMAIN entries.',
    example: 'ipconfig /flushdns',
    expectedOutput: 'Windows IP Configuration\nSuccessfully flushed the DNS Resolver Cache.',
    explanation: 'Forces Windows to query configured DNS servers fresh after DNS record updates or transient network drops.',
    permissions: 'Standard User'
  },
  {
    id: 'CMD-04',
    command: 'ipconfig /release && ipconfig /renew',
    platform: 'Windows CMD',
    purpose: 'Drop current DHCP IPv4 lease and request a fresh IP configuration from the DHCP server.',
    example: 'ipconfig /release && ipconfig /renew',
    expectedOutput: 'Ethernet adapter Ethernet: IPv4 Address: 10.10.1.48 (fresh lease acquired)',
    explanation: 'Resolves 169.254.x.x APIPA states and picks up updated VLAN/DHCP scope options.',
    permissions: 'Local Administrator',
    safetyWarning: 'Briefly disconnects active network/RDP sessions! Never run `ipconfig /release` alone over RDP without chaining `&& ipconfig /renew`.'
  },
  {
    id: 'CMD-05',
    command: 'ping',
    platform: 'Networking',
    purpose: 'Test Layer 3 ICMP Echo reachability, round-trip latency (ms), packet loss, and MTU fragmentation.',
    example: 'ping -n 10 1.1.1.1',
    expectedOutput: 'Packets: Sent = 10, Received = 10, Lost = 0 (0% loss), Approximate round trip times: Minimum = 8ms, Maximum = 11ms',
    explanation: 'Use `ping <gateway>` to test LAN, `ping 1.1.1.1` to test WAN routing, and `ping -f -l 1472 1.1.1.1` to test 1500 MTU.',
    permissions: 'Standard User'
  },
  {
    id: 'CMD-06',
    command: 'tracert',
    platform: 'Networking',
    purpose: 'Trace every Layer 3 router hop between source and destination to pinpoint where packets drop or stall.',
    example: 'tracert -d 8.8.8.8',
    expectedOutput: '1    <1 ms   <1 ms   <1 ms  10.10.1.1\n2     4 ms    4 ms    5 ms  203.0.113.1\n3    11 ms   10 ms   11 ms  8.8.8.8',
    explanation: 'Pass `-d` to skip slow reverse-DNS lookups on intermediate ISP routers for 5x faster output.',
    permissions: 'Standard User'
  },
  {
    id: 'CMD-07',
    command: 'nslookup',
    platform: 'Networking',
    purpose: 'Query DNS servers directly for A, AAAA, MX, TXT, CNAME, PTR, or Active Directory SRV records.',
    example: 'nslookup -type=srv _ldap._tcp.dc._msdcs.corp.local',
    expectedOutput: 'svr hostname = dc01.corp.local | internet address = 10.10.0.10',
    explanation: 'Note: `nslookup` queries DNS directly and ignores the local `hosts` file; compare against `ping` or `Resolve-DnsName`.',
    permissions: 'Standard User'
  },
  {
    id: 'CMD-08',
    command: 'netstat',
    platform: 'Networking',
    purpose: 'List active TCP/UDP connections, listening server ports, and the owning Process ID (PID).',
    example: 'netstat -ano | findstr ":443"',
    expectedOutput: 'TCP    0.0.0.0:443    0.0.0.0:0    LISTENING    4192',
    explanation: 'Crucial for troubleshooting `Address already in use` port conflicts and spotting suspicious outbound malware sockets.',
    permissions: 'Local Administrator'
  },
  {
    id: 'CMD-09',
    command: 'arp',
    platform: 'Networking',
    purpose: 'View or clear the Layer 2 MAC-to-Layer 3 IPv4 Address Resolution Protocol cache.',
    example: 'arp -a',
    expectedOutput: 'Interface: 10.10.1.45\n  10.10.1.1             00-09-0f-09-00-02     dynamic',
    explanation: 'Used to track down duplicate IP conflicts and identify rogue DHCP/device vendor OUIs on the local subnet.',
    permissions: 'Standard User'
  },
  {
    id: 'CMD-10',
    command: 'route print',
    platform: 'Networking',
    purpose: 'Display the local IPv4 and IPv6 kernel routing tables and interface metrics.',
    example: 'route print -4',
    expectedOutput: 'Network Destination   Netmask         Gateway      Interface    Metric\n0.0.0.0               0.0.0.0         10.10.1.1    10.10.1.45   25',
    explanation: 'Diagnoses split-tunnel VPN overlaps, dual-NIC default gateway conflicts, and static persistent routes.',
    permissions: 'Standard User'
  },
  {
    id: 'CMD-11',
    command: 'sfc /scannow',
    platform: 'Windows CMD',
    purpose: 'Scan all protected Windows OS files and replace corrupted binaries from the local component store.',
    example: 'sfc /scannow',
    expectedOutput: 'Windows Resource Protection found corrupt files and successfully repaired them.',
    explanation: 'Run AFTER `DISM /Online /Cleanup-Image /RestoreHealth` so the local WinSxS repair source is verified healthy first.',
    permissions: 'Local Administrator',
    safetyWarning: 'Do not close the console or force-power off while verification is in progress.'
  },
  {
    id: 'CMD-12',
    command: 'DISM /Online /Cleanup-Image /RestoreHealth',
    platform: 'Windows CMD',
    purpose: 'Repair corruption inside the Windows Component Store (C:\\Windows\\WinSxS) using Windows Update.',
    example: 'DISM /Online /Cleanup-Image /RestoreHealth',
    expectedOutput: '[==========================100.0%==========================] The restore operation completed successfully.',
    explanation: 'Fixes broken Windows Updates (0x800f081f / 0x80070002), BSODs, and damaged system servicing packages.',
    permissions: 'Local Administrator',
    safetyWarning: 'Requires internet or valid `-Source:wim` media; takes 5–15 minutes to complete.'
  },
  {
    id: 'CMD-13',
    command: 'chkdsk',
    platform: 'Windows CMD',
    purpose: 'Check NTFS volume metadata and repair logical filesystem errors online (`/scan` / `/spotfix`) or at boot (`/f`).',
    example: 'chkdsk C: /scan',
    expectedOutput: 'Windows has scanned the file system and found no problems. No further action is required.',
    explanation: 'Prefer `chkdsk C: /scan` + `/spotfix` on modern Windows Server to reduce offline downtime to seconds.',
    permissions: 'Local Administrator',
    safetyWarning: 'NEVER run `chkdsk /r` on a physically clicking/failing drive before backing up user files—heavy surface reads can kill a dying disk!'
  },
  {
    id: 'CMD-14',
    command: 'Get-Service',
    platform: 'PowerShell',
    purpose: 'Query status, startup type, and dependencies of local or remote Windows services.',
    example: 'Get-Service -Name wuauserv, bits, Spooler | Select Name, Status, StartType',
    expectedOutput: 'Name     Status  StartType\nwuauserv Running Manual\nbits     Running DelayedAutoStart\nSpooler  Running Automatic',
    explanation: 'Pipe to `Restart-Service -Force` to cleanly bounce wedged background daemons.',
    permissions: 'Standard User'
  },
  {
    id: 'CMD-15',
    command: 'Get-Process',
    platform: 'PowerShell',
    purpose: 'Inspect running processes sorted by CPU time or working-set RAM utilization.',
    example: 'Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 10 Name, Id, @{N="RAM_MB";E={[math]::Round($_.WorkingSet64/1MB)}}',
    expectedOutput: 'Name       Id   RAM_MB\nsqlservr 3120     4096\nmsedge   8814     1180',
    explanation: 'Quickly identifies runaway memory leaks or hung PIDs holding ports/files.',
    permissions: 'Standard User'
  },
  {
    id: 'CMD-16',
    command: 'Get-NetIPConfiguration',
    platform: 'PowerShell',
    purpose: 'Display structured PowerShell summary of interfaces, IPv4/IPv6 addresses, gateways, DNS, and NetworkProfile.',
    example: 'Get-NetIPConfiguration -Detailed',
    expectedOutput: 'InterfaceAlias: Ethernet | NetProfile.NetworkCategory: DomainAuthenticated | IPv4Address: 10.10.1.45',
    explanation: 'Modern PowerShell replacement for `ipconfig` that also reveals active Firewall Profile (`Public` vs `DomainAuthenticated`).',
    permissions: 'Standard User'
  },
  {
    id: 'CMD-17',
    command: 'Test-NetConnection',
    platform: 'PowerShell',
    purpose: 'Test specific TCP port connectivity (modern replacement for `telnet`), ICMP ping, and hop routing.',
    example: 'Test-NetConnection -ComputerName dc01.corp.local -Port 389',
    expectedOutput: 'ComputerName: dc01.corp.local | RemotePort: 389 | PingSucceeded: True | TcpTestSucceeded: True',
    explanation: 'Essential for proving whether a firewall blocks TCP 445 (SMB), 3389 (RDP), 1433 (SQL), or 443 (HTTPS).',
    permissions: 'Standard User'
  },
  {
    id: 'CMD-18',
    command: 'Get-ADUser',
    platform: 'Active Directory',
    purpose: 'Query Active Directory user attributes including LockedOut state, PasswordExpired, UPN, and group memberships.',
    example: 'Get-ADUser -Identity jsmith -Properties LockedOut, PasswordLastSet, PasswordExpired, MemberOf | Select Name, UserPrincipalName, LockedOut, PasswordLastSet',
    expectedOutput: 'Name: John Smith | UserPrincipalName: jsmith@company.com | LockedOut: False | PasswordLastSet: 10/15/2026',
    explanation: 'Requires RSAT ActiveDirectory module; pairs with `Unlock-ADAccount` for instant L1/L2 user triage.',
    permissions: 'Standard User'
  },
  {
    id: 'CMD-19',
    command: 'Get-ADComputer',
    platform: 'Active Directory',
    purpose: 'Audit Active Directory computer objects, OS build versions, OU placement, and stale inactive endpoints.',
    example: 'Get-ADComputer -Filter {Name -like "CORP-LT*"} -Properties OperatingSystem, LastLogonDate | Select Name, OperatingSystem, LastLogonDate',
    expectedOutput: 'Name: CORP-LT-104 | OperatingSystem: Windows 11 Enterprise | LastLogonDate: 10/31/2026',
    explanation: 'Used to audit Windows 10 EOL machines and identify stale >90-day computer objects.',
    permissions: 'Standard User'
  },
  {
    id: 'CMD-20',
    command: 'Test-ComputerSecureChannel -Repair',
    platform: 'Active Directory',
    purpose: 'Repair a broken workstation-to-domain trust relationship online without unjoining or rebooting.',
    example: 'Test-ComputerSecureChannel -Repair -Credential (Get-Credential)',
    expectedOutput: 'True',
    explanation: 'Fixes "The trust relationship between this workstation and the primary domain failed" in 5 seconds.',
    permissions: 'Local Administrator'
  },
  {
    id: 'CMD-21',
    command: 'repadmin /replsummary',
    platform: 'Active Directory',
    purpose: 'Summarize Active Directory replication health, largest delta lag, and error counts across all Domain Controllers.',
    example: 'repadmin /replsummary',
    expectedOutput: 'Source DSA          largest delta    fails/total %%   error\n DC01                      05m:12s    0 /   5    0',
    explanation: 'First command to run whenever password resets or new users are not visible across all sites.',
    permissions: 'Domain Admin / Elevated'
  },
  {
    id: 'CMD-22',
    command: 'gpresult /h',
    platform: 'Windows CMD',
    purpose: 'Generate a comprehensive HTML Resultant Set of Policy (RSoP) report showing applied and denied GPOs.',
    example: 'gpresult /h "%USERPROFILE%\\Desktop\\GPO-Report.html"',
    expectedOutput: 'Saves interactive HTML report listing Winning GPOs, WMI filter results, and Security Filtering denials.',
    explanation: 'Run as standard user for User GPOs, or in an Elevated prompt to include Computer Configuration GPOs.',
    permissions: 'Local Administrator'
  },
  {
    id: 'CMD-23',
    command: 'gpupdate /force',
    platform: 'Windows CMD',
    purpose: 'Reapply all Computer and User Group Policy settings immediately without waiting for the 90-minute background refresh.',
    example: 'gpupdate /force',
    expectedOutput: 'Updating policy...\nComputer Policy update has completed successfully.\nUser Policy update has completed successfully.',
    explanation: 'Note: `gpupdate` does NOT refresh AD security group membership tokens—sign out/in when group memberships change.',
    permissions: 'Standard User'
  },
  {
    id: 'CMD-24',
    command: 'robocopy',
    platform: 'Windows CMD',
    purpose: 'Multithreaded enterprise file migration tool preserving NTFS ACLs, timestamps, and >260-char paths.',
    example: 'robocopy "\\\\oldfs\\Dept" "\\\\newfs\\Dept" /E /COPYALL /DCOPY:DAT /ZB /MT:16 /R:2 /W:2 /LOG:C:\\temp\\mig.log',
    expectedOutput: 'Dirs : 1420 | Files : 48912 | Failed : 0 | Speed : 345,120,000 Bytes/sec',
    explanation: 'Always set `/R:2 /W:2` (default retries is 1,000,000 which hangs forever on 1 locked file!).',
    permissions: 'Local Administrator',
    safetyWarning: 'Extreme caution with `/MIR` (Mirror)—`/MIR` DELETES destination files missing from source! Test with `/L` (List-only dry run) first!'
  },
  {
    id: 'CMD-25',
    command: 'df -h',
    platform: 'Linux',
    purpose: 'Display mounted Linux filesystem capacity, used space, free space, and mount points in human-readable GB/MB.',
    example: 'df -h -x tmpfs -x squashfs',
    expectedOutput: 'Filesystem                         Size  Used Avail Use% Mounted on\n/dev/mapper/ubuntu--vg-ubuntu--lv   98G   42G   52G  45% /',
    explanation: 'Pair with `df -i` to check inode exhaustion and `lsof +L1` if deleted files fail to release disk space.',
    permissions: 'Standard User'
  },
  {
    id: 'CMD-26',
    command: 'free -h',
    platform: 'Linux',
    purpose: 'Display Linux physical RAM, kernel page cache, `available` memory, and swap usage.',
    example: 'free -h',
    expectedOutput: '              total        used        free      shared  buff/cache   available\nMem:           15Gi       4.2Gi       1.1Gi       120Mi        10Gi        11Gi',
    explanation: 'Always read the **`available`** column (not `free`!), because Linux productively uses free RAM for disk cache.',
    permissions: 'Standard User'
  },
  {
    id: 'CMD-27',
    command: 'systemctl',
    platform: 'Linux',
    purpose: 'Manage systemd services, check daemon health, enable boot start, and reload unit configurations.',
    example: 'sudo systemctl status nginx --no-pager',
    expectedOutput: '● nginx.service - A high performance web server\n     Active: active (running) since Sat 2026-10-31 08:00:12 UTC',
    explanation: 'Prefer `systemctl reload nginx` over `restart` when applying config changes with zero dropped connections.',
    permissions: 'Root / sudo'
  },
  {
    id: 'CMD-28',
    command: 'journalctl',
    platform: 'Linux',
    purpose: 'Query structured systemd logs filtered by service unit, boot session, severity, or time window.',
    example: 'sudo journalctl -u ssh -S "1 hour ago" --no-pager',
    expectedOutput: 'Oct 31 12:41:09 prod-01 sshd[8192]: Accepted publickey for ubuntu from 10.20.1.5 port 54122 ssh2',
    explanation: 'Use `journalctl -xeu <unit>` for startup crashes and `journalctl --vacuum-size=500M` to trim disk usage.',
    permissions: 'Root / sudo'
  },
  {
    id: 'CMD-29',
    command: 'ss -tulpn',
    platform: 'Linux',
    purpose: 'Modern fast replacement for `netstat` on Linux showing all TCP/UDP listening ports and owning PIDs.',
    example: 'sudo ss -tulpn',
    expectedOutput: 'Netid  State   Local Address:Port   Process\ntcp    LISTEN  127.0.0.1:5432       users:(("postgres",pid=1142,fd=6))',
    explanation: 'Instantly verifies whether databases bind safely to `127.0.0.1` vs public `0.0.0.0`.',
    permissions: 'Root / sudo'
  },
  {
    id: 'CMD-30',
    command: 'dig',
    platform: 'Networking',
    purpose: 'Precision DNS lookup tool on Linux/macOS showing authoritative flags, TTLs, MX, TXT, and `+trace` delegation.',
    example: 'dig company.com MX +short',
    expectedOutput: '10 company-com.mail.protection.outlook.com.',
    explanation: 'Use `dig +trace example.com` to follow delegation step-by-step from root `.` servers down to authoritative NS.',
    permissions: 'Standard User'
  },
  {
    id: 'CMD-31',
    command: 'lsof',
    platform: 'Linux',
    purpose: 'List open files, network ports (`lsof -i :8080`), or unlinked deleted files (`lsof +L1`) held by processes.',
    example: 'sudo lsof -iTCP:3000 -sTCP:LISTEN',
    expectedOutput: 'COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME\nnode    19204  app   21u  IPv6 149201      0t0  TCP *:3000 (LISTEN)',
    explanation: 'Essential when a port is busy or `df -h` remains 100% full after deleting large logs.',
    permissions: 'Root / sudo'
  },
  {
    id: 'CMD-32',
    command: 'dsregcmd /status',
    platform: 'Windows CMD',
    purpose: 'Inspect Microsoft Entra ID (Azure AD) Join, Hybrid Join, MDM Intune URL, and Primary Refresh Token (`AzureAdPrt`) state.',
    example: 'dsregcmd /status',
    expectedOutput: 'AzureAdJoined : YES | DomainJoined : YES | AzureAdPrt : YES',
    explanation: 'Run in a non-elevated user window to check the signed-in user SSO Primary Refresh Token.',
    permissions: 'Standard User'
  }
];
