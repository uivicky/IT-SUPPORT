import { CompactIssueSeed, expandIssues } from './issueBuilder';

const SEEDS_PART_3: CompactIssueSeed[] = [
  // ================= 11. Linux (13 issues) =================
  {
    id: 'LNX-001',
    title: 'Linux Root Partition 100% Full (No Space Left on Device) Despite du Showing Free Space',
    category: 'Linux',
    errorCode: 'ENOSPC',
    desc: 'Services fail with No space left on device, df -h shows 100% Use, yet du -sh / totals only 55% of disk.',
    symptoms: ['df -h shows / at 100% full', 'Deleting large log files did not free disk space'],
    causes: ['Running daemon still holds open file descriptors to deleted unlinked log files', 'Or inode exhaustion (df -i at 100%)'],
    steps: ['Check both block usage (df -h) and inode exhaustion (df -i).', 'Find open unlinked (deleted) files held by running PIDs using lsof +L1.', 'Gracefully reload or restart the service holding the deleted log file (e.g., nginx, rsyslog, docker) or truncate in-place next time (`truncate -s 0 file.log`).'],
    cmds: [
      ['Bash', 'df -h && df -i', 'Compare block capacity vs inode usage'],
      ['Bash', 'sudo lsof +L1 | grep -i deleted', 'List open deleted files holding disk blocks'],
      ['Bash', 'sudo journalctl --vacuum-size=500M', 'Safely trim systemd journal logs']
    ],
    warn: 'Prefer truncate -s 0 over rm on active log files so file descriptors release blocks immediately without restarting critical daemons.',
    expected: 'Unlinked blocks release immediately and df -h drops back to normal.',
    prevent: ['Configure logrotate with copytruncate or postrotate reload hooks'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['no space left on device', 'df vs du mismatch', 'lsof deleted', 'df -i', 'inodes']
  },
  {
    id: 'LNX-002',
    title: 'SSH Permission Denied (publickey) When Connecting to Linux Server',
    category: 'Linux',
    desc: 'SSH key authentication fails immediately with Permission denied (publickey) despite pasting key into authorized_keys.',
    symptoms: ['ssh -i key.pem user@host returns Permission denied (publickey)', 'Password auth is disabled in sshd_config'],
    causes: ['Overly permissive chmod on ~/.ssh (must be 700) or ~/.ssh/authorized_keys (must be 600)', 'Wrong file ownership after root edited user home', 'SELinux context mismatch on RHEL/Rocky'],
    steps: ['Access server via cloud serial/VM console and check /var/log/auth.log or /var/log/secure.', 'Fix strict ownership and permissions on ~/.ssh (700) and ~/.ssh/authorized_keys (600).', 'Restore SELinux context on RHEL/Alma/Rocky using restorecon.'],
    cmds: [
      ['Bash', 'chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys && chown -R $USER:$USER ~/.ssh', 'Enforce strict SSH directory permissions'],
      ['Bash', 'sudo restorecon -Rv ~/.ssh', 'Fix SELinux labels on RHEL-based distros'],
      ['Bash', 'ssh -vvv user@server.example.com', 'Debug key offer from client']
    ],
    expected: 'sshd accepts public key signature and opens shell session.',
    prevent: ['Use ssh-copy-id when available to set permissions and SELinux contexts automatically'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['permission denied publickey', 'authorized_keys 600', 'ssh key rejected', 'restorecon']
  },
  {
    id: 'LNX-003',
    title: 'Systemd Service Failing to Start (exit-code / status=203/EXEC)',
    category: 'Linux',
    errorCode: 'status=203/EXEC',
    desc: 'Custom or application systemd unit fails immediately on systemctl start with status=203/EXEC or status=1/FAILURE.',
    symptoms: ['systemctl status myapp shows activating (auto-restart) (Result: exit-code)', 'status=203/EXEC logged in journal'],
    causes: ['Binary lacks chmod +x executable bit', 'Missing #!/usr/bin/env bash shebang or CRLF Windows line endings', 'SELinux blocking execution from /home or /tmp'],
    steps: ['Read full unit error output with journalctl -xeu <service>.', 'Verify ExecStart uses an absolute path, has chmod +x, and has Unix LF line endings (not DOS CRLF).', 'Move binary to /usr/local/bin or /opt/<app> and run systemctl daemon-reload.'],
    cmds: [
      ['Bash', 'sudo journalctl -xeu myapp.service --no-pager -n 40', 'Inspect exact systemd startup error'],
      ['Bash', 'sudo chmod +x /usr/local/bin/myapp && sed -i "s/\\r$//" /usr/local/bin/myapp', 'Ensure executable bit and strip CRLF'],
      ['Bash', 'sudo systemctl daemon-reload && sudo systemctl restart myapp', 'Reload unit and start']
    ],
    expected: 'Service transitions to active (running) cleanly.',
    prevent: ['Validate unit files with systemd-analyze verify /etc/systemd/system/myapp.service'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['203/exec', 'systemd failed', 'journalctl -xeu', 'crlf shebang']
  },
  {
    id: 'LNX-004',
    title: 'Linux Server Boots into Emergency Mode Due to Bad /etc/fstab Entry',
    category: 'Linux',
    desc: 'After adding an NFS or secondary disk mount to /etc/fstab, Linux refuses to boot normally and drops to Emergency Mode.',
    symptoms: ['You are in emergency mode. After logging in, type journalctl -xb', 'SSH daemon does not start'],
    causes: ['Typo in UUID inside /etc/fstab', 'Detached cloud volume or offline NFS share missing nofail mount option'],
    steps: ['Log into Emergency Mode console as root.', 'Remount root filesystem read-write if mounted read-only.', 'Edit /etc/fstab to fix the UUID (check blkid) or comment out the broken mount, and add nofail to non-OS disks.', 'Run mount -a to test BEFORE rebooting!'],
    cmds: [
      ['Bash', 'mount -o remount,rw /', 'Ensure / is writable in emergency shell'],
      ['Bash', 'blkid', 'Verify actual block device UUIDs'],
      ['Bash', 'mount -a', 'Always validate /etc/fstab before ever rebooting!']
    ],
    warn: 'NEVER reboot a Linux server after editing /etc/fstab without running sudo mount -a first to confirm zero errors.',
    expected: 'mount -a returns cleanly with exit code 0 and server boots multi-user target.',
    prevent: ['Add nofail,_netdev options to non-critical secondary/network mounts in /etc/fstab'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['emergency mode linux', 'etc fstab broken', 'mount -a', 'nofail']
  },
  {
    id: 'LNX-005',
    title: 'Linux Out-Of-Memory (OOM) Killer Terminating PostgreSQL / Java / Node',
    category: 'Linux',
    desc: 'Database or web worker vanishes randomly under peak load with Out of memory: Killed process in kernel ring buffer.',
    symptoms: ['Application restarts or vanishes without application-level exception', 'dmesg -T shows Out of memory: Killed process <PID>'],
    causes: ['JVM -Xmx or DB shared_buffers exceeds available physical RAM', 'Zero swap space configured on small VM', 'Memory leak in worker process'],
    steps: ['Confirm OOM Killer invocation in kernel logs with dmesg -T.', 'Inspect current RAM, cache, and swap via free -h.', 'Right-size application memory pool caps (e.g., JVM MaxRAMPercentage=70) and provision a 2-4 GB swapfile as safety cushion.'],
    cmds: [
      ['Bash', 'sudo dmesg -T | grep -iE "oom|killed process"', 'Confirm Linux kernel OOM event'],
      ['Bash', 'free -h && vmstat 1 5', 'Inspect available memory and swap pressure']
    ],
    expected: 'Application memory ceilings fit comfortably within host RAM and OOM kills stop.',
    prevent: ['Set systemd MemoryHigh / MemoryMax limits per service to contain runaway workers'],
    diff: 'Intermediate',
    time: '15-20 minutes',
    tags: ['oom killer', 'killed process linux', 'dmesg oom', 'free -h']
  },
  {
    id: 'LNX-006',
    title: 'Ubuntu APT / DPKG Broken Lock: Could Not Get Lock /var/lib/dpkg/lock-frontend',
    category: 'Linux',
    desc: 'Running sudo apt update or apt upgrade fails because lock-frontend is held or dpkg was interrupted.',
    symptoms: ['Could not get lock /var/lib/dpkg/lock-frontend', 'Or dpkg was interrupted, you must manually run dpkg --configure -a'],
    causes: ['unattended-upgrades is currently running in background', 'Previous SSH session disconnected mid-install'],
    steps: ['FIRST check ps aux | grep -i apt—if unattended-upgrades is actively running, wait 2 minutes for it to finish rather than deleting lock files!', 'Only if NO apt/dpkg process is running, repair interrupted package configuration with dpkg --configure -a and apt -f install.'],
    cmds: [
      ['Bash', 'ps aux | grep -E "apt|dpkg"', 'Verify no active updater is running first!'],
      ['Bash', 'sudo dpkg --configure -a && sudo apt-get install -f', 'Resume and repair interrupted package transaction']
    ],
    warn: 'Never blindly rm /var/lib/dpkg/lock* while apt is actively writing packages, or you will corrupt the package database.',
    expected: 'dpkg finishes pending post-install scripts and apt operations succeed cleanly.',
    prevent: ['Run long remote OS upgrades inside tmux or screen sessions'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['lock-frontend', 'dpkg --configure -a', 'apt lock', 'unattended-upgrades']
  },
  {
    id: 'LNX-007',
    title: 'SELinux Blocking Nginx / Apache Reverse Proxy (502 Bad Gateway on RHEL/Rocky)',
    category: 'Linux',
    errorCode: 'HTTP 502',
    desc: 'Backend app works on curl 127.0.0.1:3000, firewall is open, yet Nginx returns 502 Bad Gateway with Permission denied in error.log.',
    symptoms: ['curl localhost:3000 returns 200 OK', 'Nginx error.log shows connect() to 127.0.0.1:3000 failed (13: Permission denied)'],
    causes: ['SELinux httpd_can_network_connect boolean is off by default on RHEL/Rocky/AlmaLinux'],
    steps: ['Check /var/log/audit/audit.log for AVC denied entries rather than disabling SELinux!', 'Enable the persistent httpd_can_network_connect SELinux boolean cleanly with setsebool -P.'],
    cmds: [
      ['Bash', 'sudo ausearch -m avc -ts recent', 'Confirm SELinux AVC denial'],
      ['Bash', 'sudo setsebool -P httpd_can_network_connect 1', 'Allow Nginx/Apache outbound proxy connections securely']
    ],
    warn: 'Never set SELINUX=disabled in production when a single targeted boolean fixes the root cause.',
    expected: 'SELinuxstays Enforcing while Nginx proxies upstream traffic with HTTP 200.',
    prevent: ['Check getsebool -a | grep httpd during RHEL web stack deployments'],
    diff: 'Intermediate',
    time: '5-10 minutes',
    tags: ['nginx 502 permission denied', 'httpd_can_network_connect', 'selinux nginx']
  },
  {
    id: 'LNX-008',
    title: 'LVM Logical Volume Full Despite Expanding Virtual Disk in VMware/Cloud',
    category: 'Linux',
    desc: 'Admin expanded VM disk from 50 GB to 100 GB in hypervisor, but df -h inside Linux still shows 50 GB.',
    symptoms: ['lsblk shows 100G disk (sda), but ubuntu--vg-ubuntu--lv still shows 50G', 'Application still out of disk space'],
    causes: ['Partition table, Physical Volume (PV), Logical Volume (LV), and filesystem (ext4/xfs) were not extended online'],
    steps: ['Rescan SCSI block device if hot-expanded without reboot, then grow partition (growpart) if partitioned.', 'Resize LVM Physical Volume with pvresize.', 'Extend Logical Volume AND filesystem in one atomic safe command using lvextend -r!'],
    cmds: [
      ['Bash', 'lsblk', 'Inspect disk, partition, and LVM hierarchy'],
      ['Bash', 'sudo growpart /dev/sda 3 && sudo pvresize /dev/sda3', 'Expand partition 3 and LVM PV'],
      ['Bash', 'sudo lvextend -r -l +100%FREE /dev/mapper/ubuntu--vg-ubuntu--lv', 'Extend LV + ext4/xfs filesystem online']
    ],
    warn: 'Always pass -r (--resizefs) to lvextend so ext4/xfs grows automatically with matching tool.',
    expected: 'df -h immediately reflects full 100 GB online with zero reboot.',
    prevent: ['Use LVM on Linux data volumes for effortless online capacity expansion'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['lvextend', 'pvresize', 'growpart', 'expanded vm disk not showing linux']
  },
  {
    id: 'LNX-009',
    title: 'Cron Job Runs Manually in Shell But Fails Silently in Crontab',
    category: 'Linux',
    desc: 'Backup or Python script executes fine when run via SSH, but never produces output when scheduled in crontab -e.',
    symptoms: ['Manual ./backup.sh works, cron produces 0-byte file or fails', 'grep CRON /var/log/syslog shows command triggered'],
    causes: ['Cron runs with minimal PATH (/usr/bin:/bin), missing /usr/local/bin', 'Relative file paths fail because cron working directory is $HOME', 'Unescaped % sign in crontab command (cron treats % as newline!)'],
    steps: ['Declare explicit PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin at top of crontab.', 'Use absolute paths for both binaries and scripts, and escape any % signs (`\\%`) in date commands.', 'Redirect stdout and stderr (`>> /var/log/myjob.log 2>&1`) to capture exact error traces.'],
    cmds: [
      ['Bash', 'grep -i cron /var/log/syslog | tail -n 20', 'Verify cron daemon invoked job'],
      ['Bash', '# Example safe crontab entry:\n0 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1', 'Log both stdout and stderr']
    ],
    expected: 'Scheduled job runs identically in cron and interactive shells.',
    prevent: ['Consider systemd .timer + .service units for modern logging, retries, and resource caps'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['cron job not running', 'crontab path', 'percent sign cron']
  },
  {
    id: 'LNX-010',
    title: 'High CPU Load Average While CPU % Idle Is 90% (Uninterruptible I/O Wait)',
    category: 'Linux',
    desc: 'uptime reports load average of 32.00 on a 4-vCPU Linux box, yet top shows 90% idle / low %us CPU.',
    symptoms: ['Load average skyrockets while CPU usage looks low', 'Commands like ls hang on specific mount'],
    causes: ['Linux load average includes processes stuck in D state (Uninterruptible Sleep waiting on hung NFS/iSCSI/disk I/O)'],
    steps: ['Run vmstat 1 5 or top to check %wa (I/O wait) and look for processes in D state (`ps aux | awk "$8 ~ /D/"`).', 'Check if an NFS share (`df -h` hangs!) or SAN LUN lost connectivity.', 'Lazy-unmount hung stale NFS mounts (`umount -lf /mnt/nfs`) once upstream NFS server is investigated.'],
    cmds: [
      ['Bash', 'ps -eo state,pid,cmd | grep "^D"', 'List processes stuck in D (disk/NFS wait) state'],
      ['Bash', 'iostat -xz 1 3', 'Check block device await latency (ms)']
    ],
    expected: 'Stalled NFS/storage bottleneck is cleared and load average drops below vCPU count.',
    prevent: ['Mount non-critical NFS shares with timeo/retrans/intr options and monitor storage latency'],
    diff: 'Advanced',
    time: '15-20 minutes',
    tags: ['high load low cpu', 'd state linux', 'stale nfs file handle', 'io wait']
  },
  {
    id: 'LNX-011',
    title: 'Ubuntu systemd-resolved DNS Failing Inside VPN or Custom Domain',
    category: 'Linux',
    desc: 'Ubuntu 22.04/24.04 desktop or server cannot resolve internal corporate DNS names while 127.0.0.53 stub is active.',
    symptoms: ['/etc/resolv.conf points to 127.0.0.53', 'Internal corp domains fail while public domains work'],
    causes: ['DNS routing domain (~corp.local) not bound to VPN/LAN link in systemd-resolved'],
    steps: ['Inspect per-interface DNS servers and search domains with resolvectl status (do NOT overwrite /etc/resolv.conf symlink directly!).', 'Bind corporate DNS server and routing domain to the VPN/LAN interface via resolvectl or Netplan.', 'Flush systemd-resolved cache.'],
    cmds: [
      ['Bash', 'resolvectl status', 'Inspect per-interface DNS resolvers and domains'],
      ['Bash', 'sudo resolvectl flush-caches', 'Flush systemd-resolved DNS cache']
    ],
    expected: 'Internal corporate domains route cleanly to internal DNS while internet queries use primary uplink.',
    prevent: ['Configure nameservers and search domains declaratively inside /etc/netplan/*.yaml'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['127.0.0.53', 'resolvectl', 'systemd-resolved', 'ubuntu dns not working']
  },
  {
    id: 'LNX-012',
    title: 'Linux Filesystem Remounted Read-Only Automatically (Read-Only File System)',
    category: 'Linux',
    errorCode: 'EROFS',
    desc: 'Touching or saving any file fails with Read-only file system after brief storage SAN/hypervisor hiccup.',
    symptoms: ['touch /tmp/test returns Read-only file system', 'mount | grep " / " shows (ro,relatime,errors=remount-ro)'],
    causes: ['ext4 errors=remount-ro triggered to protect data integrity after transient hypervisor/SAN I/O timeout or journal error'],
    steps: ['Check dmesg -T immediately to see whether underlying disk hardware failed or experienced a transient VM stun.', 'Schedule brief maintenance reboot into rescue/initramfs and run fsck -fy on the unmounted partition (NEVER run fsck -y on a mounted rw filesystem!).', 'Reboot cleanly once fsck completes.'],
    cmds: [
      ['Bash', 'dmesg -T | grep -iE "ext4|xfs|i/o error|remount-ro"', 'Identify kernel reason for read-only remount'],
      ['Bash', 'findmnt /', 'Check current mount options']
    ],
    warn: 'NEVER run fsck repair on a live read-write mounted partition—it causes severe filesystem corruption.',
    expected: 'Journal replays cleanly during boot fsck and partition mounts read-write.',
    prevent: ['Set SCSI disk timeout to 60-180s inside guest Linux VMs running on enterprise SANs'],
    diff: 'Advanced',
    time: '20-30 minutes',
    tags: ['read-only file system', 'remount-ro', 'fsck', 'erofs']
  },
  {
    id: 'LNX-013',
    title: 'Too Many Open Files (EMFILE / ulimit Exhausted) on Linux Web/DB Server',
    category: 'Linux',
    errorCode: 'EMFILE',
    desc: 'Nginx, Redis, or Node.js throws socket() failed (24: Too many open files) when concurrent connections exceed 1024.',
    symptoms: ['Error 24: Too many open files under traffic spike', 'Default soft ulimit -n is 1024'],
    causes: ['systemd services ignore /etc/security/limits.conf and default LimitNOFILE to 1024 on older templates'],
    steps: ['Check the live LimitNOFILE of the running PID via /proc/<PID>/limits!', 'Create a systemd drop-in override (`systemctl edit nginx`) setting LimitNOFILE=65535.', 'Reload systemd and restart the daemon.'],
    cmds: [
      ['Bash', 'cat /proc/$(pgrep -o nginx)/limits | grep "Max open files"', 'Check actual live file descriptor limit on running PID'],
      ['Bash', 'sudo systemctl edit myapp.service\n# Add:\n# [Service]\n# LimitNOFILE=65535', 'Increase file descriptor ceiling in systemd']
    ],
    expected: '/proc/<PID>/limits shows 65535 max open files and connection drops stop.',
    prevent: ['Remember PAM /etc/security/limits.conf applies only to login shells, NOT systemd daemons—always set LimitNOFILE in unit files'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['too many open files', 'ulimit -n', 'limitnofile', 'emfile']
  },

  // ================= 12. Azure & Cloud (13 issues) =================
  {
    id: 'AZR-001',
    title: 'Cannot RDP or SSH into Azure Virtual Machine After NSG or Firewall Change',
    category: 'Azure & Cloud',
    desc: 'Azure VM shows Running in portal, but RDP (3389) or SSH (22) times out completely.',
    symptoms: ['Connection timed out to Azure VM IP', 'VM Resource Health shows Available'],
    causes: ['Subnet-level or NIC-level Network Security Group (NSG) blocking port', 'Guest OS Windows Firewall/ufw accidentally enabled blocking rule', 'Broken static IP set inside guest OS instead of Azure NIC'],
    steps: ['Run Azure Network Watcher > IP Flow Verify to test whether Subnet or NIC NSG drops inbound packets.', 'Never set static IPs inside the guest OS of an Azure VM—if someone did, use Azure Portal > Run Command (`ResetNIC` / PowerShell) to restore DHCP inside guest and set Static allocation on the Azure NIC resource!', 'Use Azure Bastion or Serial Console for emergency out-of-band login without exposing public 3389/22.'],
    cmds: [
      ['Bash', 'az network watcher test-ip-flow --vm MyVM --resource-group MyRG --direction Inbound --protocol TCP --local 10.0.1.4:3389 --remote 203.0.113.10:50000', 'Verify NSG allow/deny rule via Azure CLI']
    ],
    warn: 'Never open 0.0.0.0/0 (Any) on TCP 3389/22 to the public internet—use Azure Bastion, VPN, or Just-in-Time (JIT) access.',
    expected: 'NSG/guest NIC rule corrected and Bastion/VPN session connects.',
    prevent: ['Manage all Azure VM IP reservations at the Azure Virtual Network Interface blade, never inside Windows ncpa.cpl'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['azure vm rdp failed', 'nsg ip flow verify', 'static ip inside azure vm', 'bastion']
  },
  {
    id: 'AZR-002',
    title: 'Azure Site-to-Site IPSec VPN Tunnel Disconnected (IKEv2 Phase 1/2 Mismatch)',
    category: 'Azure & Cloud',
    desc: 'Azure Virtual Network Gateway S2S tunnel to Fortigate/PaloAlto/Cisco ASA fails to establish or drops every hour.',
    symptoms: ['Connection status: Not connected or Disconnecting every 3600s', 'IKE diagnostic logs show NO_PROPOSAL_CHOSEN or TS_UNACCEPTABLE'],
    causes: ['Mismatched DH Group / PFS / Encryption cipher between Azure IPSec policy and on-prem firewall', 'Policy-based traffic selector vs Route-based (0.0.0.0/0) mismatch'],
    steps: ['Query Azure VPN Gateway connection status and IKE diagnostic logs.', 'Ensure both sides use IKEv2 Route-Based selectors (0.0.0.0/0 <-> 0.0.0.0/0) or enable UsePolicyBasedTrafficSelectors on Azure if on-prem ASA requires strict subnet selectors.', 'Match exact Phase 1 (IKE) and Phase 2 (IPSec) lifetimes and PFS groups explicitly using a custom Azure IPSec Policy.'],
    cmds: [
      ['Bash', 'az network vpn-connection show --name HQ-to-Azure --resource-group NetRG --query "{status:connectionStatus, egress:egressBytesTransferred, ingress:ingressBytesTransferred}"', 'Check live S2S VPN status']
    ],
    expected: 'ConnectionStatus reaches Connected and bidirectional BGP/static routes pass traffic.',
    prevent: ['Always define an explicit Custom IPSec/IKE Policy on both Azure and on-prem edge rather than relying on vendor defaults'],
    diff: 'Advanced',
    time: '20-30 minutes',
    tags: ['azure s2s vpn not connecting', 'no_proposal_chosen', 'ts_unacceptable', 'ikev2']
  },
  {
    id: 'AZR-003',
    title: 'Azure VNet Peering Connected But Transitive Routing Fails Across Hub-and-Spoke',
    category: 'Azure & Cloud',
    desc: 'Spoke-A can ping Hub VNet, and Spoke-B can ping Hub VNet, but Spoke-A cannot reach Spoke-B.',
    symptoms: ['Hub <-> Spoke works, Spoke-A <-> Spoke-B times out', 'Both VNet Peerings show Connected'],
    causes: ['VNet Peering is non-transitive by design! Missing User-Defined Route (UDR) pointing spoke traffic through Hub Azure Firewall / NVA'],
    steps: ['Remember Azure VNet Peering does NOT transitively route Spoke-to-Spoke natively.', 'Create a Route Table (UDR) attached to Spoke-A and Spoke-B subnets with Next Hop = Virtual Appliance (Hub Firewall private IP).', 'Enable Allow forwarded traffic on both VNet peering links.'],
    cmds: [
      ['Bash', 'az network nic show-effective-route-table --name spokeA-vm-nic --resource-group SpokeRG -o table', 'Inspect effective routes on VM NIC']
    ],
    expected: 'Spoke-to-Spoke traffic routes cleanly and securely through the central Hub firewall.',
    prevent: ['Inspect Effective Routes on NIC blades whenever debugging Azure hub-and-spoke connectivity'],
    diff: 'Advanced',
    time: '15-20 minutes',
    tags: ['vnet peering transitive', 'spoke to spoke', 'udr virtual appliance', 'effective routes']
  },
  {
    id: 'AZR-004',
    title: 'Azure App Service Returning HTTP 500.30 / Application Error on Startup',
    category: 'Azure & Cloud',
    errorCode: 'HTTP 500.30',
    desc: 'Newly deployed .NET / Node / Python web app on Azure App Service shows :( Application Error or HTTP 500.30.',
    symptoms: ['Deployment succeeded in GitHub Actions, live URL returns 500.30 or 503', 'App works on developer localhost'],
    causes: ['Missing Environment Variables / Connection Strings in App Service Configuration', 'Node app hardcoded to port 3000 instead of process.env.PORT', 'Key Vault Managed Identity missing Get secret RBAC role'],
    steps: ['Open App Service > Diagnose and solve problems or stream live container/application logs.', 'Verify App Settings contain all required environment variables and app listens on process.env.PORT (or WEBSITES_PORT matches container port).', 'Verify System-Assigned Managed Identity has Key Vault Secrets User role if referencing @Microsoft.KeyVault(...).'],
    cmds: [
      ['Bash', 'az webapp log tail --name my-prod-webapp --resource-group AppRG', 'Stream live startup stderr logs']
    ],
    expected: 'Startup crash cause is visible immediately in log stream and app boots to HTTP 200.',
    prevent: ['Deploy to a Staging Deployment Slot first and auto-swap only after /health warm-up returns 200'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['http 500.30', 'azure app service error', 'az webapp log tail', 'websites_port']
  },
  {
    id: 'AZR-005',
    title: 'Azure Private Endpoint Resolving to Public IP Instead of Private 10.x.x.x',
    category: 'Azure & Cloud',
    desc: 'Azure SQL or Storage Account has Public Network Access Disabled + Private Endpoint, yet apps fail with Public access is not permitted.',
    symptoms: ['Connection denied: Public network access is disabled', 'nslookup mystorage.blob.core.windows.net returns public Azure IP instead of 10.x.x.x'],
    causes: ['Private DNS Zone (privatelink.blob.core.windows.net) not linked to client VNet', 'On-prem DNS lacks conditional forwarder to Azure DNS Private Resolver'],
    steps: ['Check Private DNS Zone Virtual Network Links and ensure the app/VM VNet is linked.', 'Verify A record exists inside `privatelink.<service>` zone.', 'For VPN/ExpressRoute on-prem clients, forward `blob.core.windows.net` / `database.windows.net` to your Azure Private DNS Resolver inbound endpoint.'],
    cmds: [
      ['PowerShell', 'Resolve-DnsName mystorage.blob.core.windows.net', 'Verify CNAME chains to privatelink and resolves 10.x.x.x']
    ],
    expected: 'FQDN resolves via CNAME to privatelink private IP and traffic stays 100% on private backbone.',
    prevent: ['Automate Private DNS Zone group creation inside Terraform/Bicep Private Endpoint modules'],
    diff: 'Advanced',
    time: '15-20 minutes',
    tags: ['azure private endpoint dns', 'privatelink', 'public access disabled']
  },
  {
    id: 'AZR-006',
    title: 'Azure Subscription Quota Exceeded (SkuNotAvailable / OperationNotAllowed)',
    category: 'Azure & Cloud',
    errorCode: 'QuotaExceeded',
    desc: 'Deploying VM scale sets or new Azure VMs fails with Family Cores quota exceeded in target region.',
    symptoms: ['Operation could not be completed as it results in exceeding approved standardDSv5Family Cores quota', 'Terraform/ARM deployment halts'],
    causes: ['Regional vCPU family soft quota limit (often 10-20 cores on new subscriptions) reached'],
    steps: ['Check current regional vCPU family usage vs limit.', 'Open Azure Portal > Quotas > Compute, select the VM family in that region, and request an automated quota increase (most reasonable increases approve automatically within 2 minutes).'],
    cmds: [
      ['Bash', 'az vm list-usage --location eastus -o table | grep -i "DSv5"', 'Check regional vCPU family usage vs quota']
    ],
    expected: 'vCPU quota increases and VM provisioning succeeds.',
    prevent: ['Verify regional vCPU quotas during disaster-recovery region readiness drills'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['quotaexceeded', 'skunotavailable', 'az vm list-usage', 'vcpu quota']
  },
  {
    id: 'AZR-007',
    title: 'Azure Storage / Key Vault Firewall Blocking Trusted Azure Service or Office IP',
    category: 'Azure & Cloud',
    errorCode: 'AuthorizationFailure 403',
    desc: 'Reading blobs or secrets throws 403 This request is not authorized to perform this operation despite Owner/Contributor role.',
    symptoms: ['HTTP 403 AuthorizationFailure even as Subscription Owner', 'Portal shows You do not have access to view blobs/secrets'],
    causes: [' Control-plane Owner role does NOT grant data-plane RBAC (Storage Blob Data Contributor), OR Storage Network Firewall blocks current client NAT IP'],
    steps: ['Check two things: (1) Networking tab—add your current public NAT IP (remember Azure Storage firewall cannot route same-region public IPs—use Service Endpoints or Private Endpoints for VMs in same region!).', '(2) Access Control (IAM)—assign data-plane role `Storage Blob Data Contributor` or `Key Vault Secrets Officer` (wait 5 min for RBAC propagation).'],
    cmds: [
      ['Bash', 'curl -s https://ifconfig.me', 'Verify exact outbound public IPv4 to allowlist']
    ],
    expected: 'Data-plane RBAC + Network ACL both pass and blobs/secrets load cleanly.',
    prevent: ['Remember Azure Control Plane (Contributor) != Data Plane (Blob/KeyVault Data roles)'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['403 authorizationfailure', 'storage blob data contributor', 'key vault firewall']
  },
  {
    id: 'AZR-008',
    title: 'Azure Files SMB Share Mount Failing on Port 445 From Remote ISP',
    category: 'Azure & Cloud',
    desc: 'Mounting `\\\\storageacct.file.core.windows.net\\share` works in data center, but times out from employee home WiFi.',
    symptoms: ['System error 53 or 67 has occurred on home ISP', 'Test-NetConnection port 445 returns TcpTestSucceeded : False'],
    causes: ['Residential and hotel ISPs universally block outbound TCP port 445 across the internet to prevent WannaCry/SMB worms'],
    steps: ['Verify TCP 445 blockage using Test-NetConnection.', 'Route traffic over Point-to-Site (P2S) VPN + Azure Private Endpoint so TCP 445 is encapsulated inside the VPN tunnel, OR enable SMB over QUIC (UDP 443) via Azure File Sync / Windows Server 2022 Datacenter Azure Edition!'],
    cmds: [
      ['PowerShell', 'Test-NetConnection -ComputerName mystorage.file.core.windows.net -Port 445', 'Confirm whether ISP blocks TCP 445']
    ],
    expected: 'SMB mounts reliably over P2S VPN Private Endpoint regardless of ISP port 445 filtering.',
    prevent: ['Never rely on raw internet TCP 445 for remote workforce Azure Files access'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['azure files port 445', 'system error 53', 'isp blocking 445', 'smb over quic']
  },
  {
    id: 'AZR-009',
    title: 'Entra ID Application Client Secret Expired Breaking Production SSO / API',
    category: 'Azure & Cloud',
    errorCode: 'AADSTS7000222',
    desc: 'SaaS SSO or automation pipeline suddenly fails at midnight with AADSTS7000222: The provided client secret keys are expired.',
    symptoms: ['OAuth token endpoint returns 401 invalid_client / AADSTS7000222', 'All automated Graph/API calls fail'],
    causes: ['App Registration Client Secret reached 6/12/24-month expiry without rotation alerting'],
    steps: ['Open Microsoft Entra Admin Center > App registrations > select App > Certificates & secrets.', 'Click + New client secret, copy the secret Value immediately (never the Secret ID!), and update Azure Key Vault / application secret store.', 'Restart/reload application pods if they cache secrets in memory, then delete the old expired secret.'],
    cmds: [
      ['Bash', 'az ad app credential list --id <APP_CLIENT_ID> --query "[].{Hint:hint, EndDate:endDateTime}" -o table', 'Audit App Registration secret expiration dates']
    ],
    warn: 'Copy the Secret VALUE, not the Secret ID UUID—pasting Secret ID is the #1 rotation mistake.',
    expected: 'OAuth client_credentials / OIDC flow immediately mints valid tokens.',
    prevent: ['Migrate workloads inside Azure/GitHub Actions to Workload Identity Federation or Managed Identities (zero secrets to expire!)'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['aadsts7000222', 'client secret expired', 'app registration', 'invalid_client']
  },
  {
    id: 'AZR-010',
    title: 'Unexpected Cloud Cost Spike From Unattached Premium SSDs & Public IPs',
    category: 'Azure & Cloud',
    desc: 'Monthly Azure/AWS invoice jumps unexpectedly after deleting temporary test VMs.',
    symptoms: ['Cost Management alerts budget threshold exceeded', 'VMs were deleted weeks ago, yet Storage and Network charges persist'],
    causes: ['Deleting an Azure VM historically left Managed OS/Data Disks and Static Public IP addresses unattached and billing 24/7', 'Verbose Log Analytics ingestion spike'],
    steps: ['Audit all unattached Managed Disks (`diskState == Unattached`) and unassociated Public IPs across subscriptions.', 'Snapshot archival disks to Cool Blob if needed, delete orphaned Premium SSDs, and set `deleteOption: Delete` on VM NIC/Disk templates.'],
    cmds: [
      ['Bash', 'az disk list --query "[?managedBy==null].{Name:name, RG:resourceGroup, Sku:sku.name, SizeGB:diskSizeGb}" -o table', 'List all orphaned unattached Azure disks']
    ],
    warn: 'Confirm with resource group owner before deleting unattached data disks.',
    expected: 'Orphaned Premium SSD and static IP charges stop immediately.',
    prevent: ['Set Azure Cost Anomaly Alerts and enforce Delete with VM on NICs and ephemeral disks'],
    diff: 'Beginner',
    time: '15 minutes',
    tags: ['unattached disks azure', 'cloud bill spike', 'orphaned resources']
  },
  {
    id: 'AZR-011',
    title: 'AKS Kubernetes Pod Stuck in CrashLoopBackOff or ImagePullBackOff',
    category: 'Azure & Cloud',
    desc: 'Newly deployed microservice in Azure Kubernetes Service refuses to become Ready.',
    symptoms: ['kubectl get pods shows ImagePullBackOff or CrashLoopBackOff', 'Rollout stalls'],
    causes: ['AKS kubelet identity not attached to Azure Container Registry (`--attach-acr`)', 'Wrong image tag', 'Liveness probe killing slow-starting container'],
    steps: ['Run `kubectl describe pod <pod>` first to distinguish ImagePullBackOff (registry auth/tag) vs CrashLoopBackOff (app exit code / OOMKilled).', 'Read previous crashed container logs with `kubectl logs <pod> --previous`.', 'Link ACR cleanly with `az aks update --attach-acr` if pulling from private ACR fails with 401 Unauthorized.'],
    cmds: [
      ['Bash', 'kubectl describe pod <pod-name> -n prod', 'Check Events and Last State exit code (e.g., 137 = OOMKilled)'],
      ['Bash', 'kubectl logs <pod-name> -n prod --previous', 'Read crash stack trace before restart']
    ],
    expected: 'Pod pulls image cleanly, passes readiness probes, and enters 1/1 Running.',
    prevent: ['Configure startupProbe separately from livenessProbe for slow-booting JVM/.NET services'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['crashloopbackoff', 'imagepullbackoff', 'aks acr', 'kubectl logs --previous']
  },
  {
    id: 'AZR-012',
    title: 'Azure Front Door / Application Gateway Returning 502 Bad Gateway (SSL CN Mismatch)',
    category: 'Azure & Cloud',
    errorCode: 'HTTP 502',
    desc: 'WAF / Application Gateway health probe marks backend pool Unhealthy and returns 502 Bad Gateway.',
    symptoms: ['Backend Health blade shows Unhealthy: Certificate common name (CN) does not match', 'Direct hit to backend works'],
    causes: ['Backend Settings missing Pick host name from backend target (sending raw IP in SNI Host header instead of domain)'],
    steps: ['Check Application Gateway > Backend health for the exact probe error message.', 'In Backend Settings, enable Override with new host name -> Pick host name from backend address (or enter exact SNI hostname matching backend TLS certificate).', 'Ensure backend health probe accepts HTTP 200-399 status codes (e.g., 302 redirect to /login is healthy if matched!).'],
    cmds: [
      ['Bash', 'az network application-gateway show-backend-health --name AppGW01 --resource-group WebRG', 'Inspect live backend pool health details']
    ],
    expected: 'SNI hostname matches backend TLS certificate, probe turns Healthy, and 502 clears.',
    prevent: ['Expose a lightweight unauthenticated `/healthz` returning HTTP 200 on every web tier'],
    diff: 'Advanced',
    time: '15 minutes',
    tags: ['application gateway 502', 'backend health unhealthy', 'sni cn mismatch']
  },
  {
    id: 'AZR-013',
    title: 'Resource Group Deletion Blocked by CanNotDelete Lock or Recovery Services Backup',
    category: 'Azure & Cloud',
    errorCode: 'ScopeLocked',
    desc: 'Deleting a retired Azure Resource Group fails due to ScopeLocked or lingering Recovery Services Vault soft-deleted items.',
    symptoms: ['ScopeLocked error or Vault cannot be deleted because backup items exist', 'Vault appears empty in main view'],
    causes: ['Management Lock (`CanNotDelete`) active on RG', 'Soft-deleted VM backups lingering for 14 days inside Recovery Services Vault'],
    steps: ['Check Resource Group > Locks and remove authorized `CanNotDelete` lock after change approval.', 'For Recovery Services Vault: disable Soft Delete under Vault Properties > Security Settings ONLY for authorized test/decommissioned vaults, undelete -> permanently delete backup items, then delete RG.'],
    cmds: [
      ['Bash', 'az lock list --resource-group OldLabRG -o table', 'List active management locks blocking deletion']
    ],
    warn: 'Never disable Soft Delete on production Recovery Services Vaults—it protects backups against ransomware admins.',
    expected: 'Decommissioned Resource Group deletes cleanly with zero lingering resources.',
    prevent: ['Tag lab/sandbox resource groups with owner and auto-expiry metadata'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['scopelocked', 'cannot delete recovery services vault', 'az lock list']
  },

  // ================= 13. VPN & Remote Access (13 issues) =================
  {
    id: 'VPN-001',
    title: 'VPN Connected Successfully But Internal Corporate Resources Unreachable',
    category: 'VPN & Remote Access',
    desc: 'Cisco AnyConnect / GlobalProtect / FortiClient shows Connected, yet internal servers and file shares time out.',
    symptoms: ['VPN tray icon has green padlock', 'Cannot ping internal 10.x.x.x servers or resolve internal DNS'],
    causes: ['Home WiFi uses `10.0.0.0/24` or `192.168.1.0/24` overlapping with corporate server subnet!', 'Missing split-tunnel route push', 'Internal DNS not bound to virtual VPN adapter'],
    steps: ['Run `ipconfig /all` and `route print -4` to check if the user home router subnet (`192.168.1.x` or Comcast `10.0.0.x`) overlaps with the target corporate subnet.', 'Verify VPN virtual adapter received corporate DNS server IPs.', 'Test connectivity from mobile hotspot (172.20.10.x) to instantly prove home subnet overlap, then re-address home router LAN to e.g. `192.168.88.0/24`.'],
    cmds: [
      ['CMD', 'route print -4', 'Check overlapping routes between physical WiFi and VPN interface'],
      ['PowerShell', 'Get-NetIPConfiguration | Select InterfaceAlias, IPv4Address, DNSServer', 'Compare physical vs VPN adapter subnets']
    ],
    expected: 'Split-tunnel routes and corporate DNS steer 10.x.x.x traffic cleanly down the VPN tunnel.',
    prevent: ['Never build corporate data center subnets inside consumer defaults (192.168.0.0/24, 192.168.1.0/24, 10.0.0.0/24)'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['vpn connected cant access internal', 'subnet overlap', '10.0.0.1 xfinity vpn']
  },
  {
    id: 'VPN-002',
    title: 'Connecting Corporate VPN Cuts Off All Internet Access',
    category: 'VPN & Remote Access',
    desc: 'As soon as employee connects to VPN, internal servers work, but Google, Zoom, and public websites stop loading.',
    symptoms: ['Internal intranet works on VPN, external internet dies completely', 'Disconnecting VPN immediately restores internet'],
    causes: ['Full-tunnel VPN (`0.0.0.0/0` / Use default gateway on remote network) active without NAT/outbound policy on HQ firewall', 'Missing outbound proxy PAC on full-tunnel'],
    steps: ['Check whether VPN profile pushes a full tunnel (`0.0.0.0/0`) or accidental Windows built-in VPN `Use default gateway on remote network`.', 'For Windows built-in IKEv2/SSTP VPN: run `Set-VpnConnection -Name "CorpVPN" -SplitTunneling $true` and add explicit `Add-VpnConnectionRoute` for internal subnets.', 'If full-tunnel is intentional for security inspection, fix HQ firewall VPN-to-WAN NAT rule.'],
    cmds: [
      ['PowerShell', 'Get-VpnConnection', 'Inspect SplitTunneling status on Windows VPN profiles'],
      ['PowerShell', 'Set-VpnConnection -Name "CorpVPN" -SplitTunneling $true', 'Enable split tunneling on Windows native VPN']
    ],
    expected: 'Internal corporate traffic uses VPN while high-bandwidth Teams/Internet exits directly (or NATs properly).',
    prevent: ['Use Split-Tunnel Exclude/Optimize for Microsoft 365 & Zoom media endpoints per vendor best practices'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['vpn blocks internet', 'split tunneling', 'use default gateway on remote network']
  },
  {
    id: 'VPN-003',
    title: 'Windows Always On VPN Error 809 (The Network Connection Could Not Be Established)',
    category: 'VPN & Remote Access',
    errorCode: 'Error 809',
    desc: 'IKEv2 VPN connection fails after 5 seconds with Error 809 because NAT-Traversal UDP 4500/500 is blocked or NAT-T registry is missing.',
    symptoms: ['Error 809: The remote server is not responding', 'Occurs behind hotel WiFi, CGNAT mobile hotspot, or double NAT'],
    causes: ['UDP ports 500 and 4500 blocked on firewall/hotel network', 'Windows client behind NAT talking to VPN server also behind NAT without AssumeUDPEncapsulationContextOnSendRule=2'],
    steps: ['Verify UDP 500 and UDP 4500 are open on the VPN concentrator.', 'If VPN server sits behind 1:1 NAT, set `AssumeUDPEncapsulationContextOnSendRule = 2` in HKLM\\SYSTEM\\CurrentControlSet\\Services\\PolicyAgent and reboot.', 'Provide an automatic SSTP / SSL-VPN TCP 443 fallback profile for restrictive hotel networks blocking UDP!'],
    cmds: [
      ['PowerShell', 'New-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\PolicyAgent" -Name "AssumeUDPEncapsulationContextOnSendRule" -Value 2 -PropertyType DWORD -Force', 'Support IKEv2 NAT-T behind NAT (requires reboot)']
    ],
    warn: 'Registry change to PolicyAgent requires a Windows restart to take effect.',
    expected: 'IKEv2 encapsulates ESP inside UDP 4500 cleanly across NAT routers.',
    prevent: ['Configure IKEv2 primary with automatic SSTP/TLS 443 fallback for hotel/airport networks'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['vpn error 809', 'ikev2 nat-t', 'udp 4500', 'assumeudpencapsulation']
  },
  {
    id: 'VPN-004',
    title: 'SSL VPN Client Stuck on Connecting / SAML Browser Popup Blank',
    category: 'VPN & Remote Access',
    desc: 'FortiClient / GlobalProtect / AnyConnect SAML SSO login window stays blank white or hangs at 40%/98%.',
    symptoms: ['Embedded SAML SSO login window stays blank', 'VPN hangs waiting for MFA callback'],
    causes: ['Corrupted embedded WebView2 / IE cache', 'TLS 1.3 inspection / self-signed cert untrusted', 'Stale WAN Miniport adapters'],
    steps: ['Enable Use External Browser for SAML Authentication in the VPN client settings so system Edge/Chrome handles Entra/Okta MFA cleanly.', 'Repair Microsoft Edge WebView2 Runtime if embedded browser is mandatory.', 'Restart the vendor VPN Windows service (e.g., PanGPS, csc_vpnagent, FA_Scheduler).'],
    cmds: [
      ['PowerShell', 'Get-Service *vpn*, *PanGPS*, *Forti* -ErrorAction SilentlyContinue | Select Name, Status', 'Check vendor VPN daemon status']
    ],
    expected: 'SAML MFA prompt completes in default browser and hands session token back to VPN client.',
    prevent: ['Prefer External System Browser SAML authentication + FIDO2/Windows Hello support'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['vpn saml blank window', 'forticlient stuck 98', 'pangps', 'anyconnect saml']
  },
  {
    id: 'VPN-005',
    title: 'Windows WAN Miniport Corruption (VPN Error 720: No PPP Control Protocols Configured)',
    category: 'VPN & Remote Access',
    errorCode: 'Error 720',
    desc: 'Connecting to VPN fails immediately with Error 720 because Windows WAN Miniport (IP / IPv6 / IKEv2) virtual drivers are corrupted.',
    symptoms: ['Error 720: A connection to the remote computer could not be established', 'WAN Miniports show yellow exclamation in Device Manager'],
    causes: ['Corrupted WAN Miniport driver bindings after OS upgrade or third-party VPN uninstall'],
    steps: ['Uninstall broken WAN Miniport (IP), WAN Miniport (IPv6), and WAN Miniport (IKEv2) devices in Device Manager.', 'Click Action > Scan for hardware changes in Device Manager (Windows automatically recreates pristine WAN Miniports!).', 'Run `netsh int ip reset` and reboot.'],
    cmds: [
      ['PowerShell', 'Get-PnpDevice | Where FriendlyName -like "WAN Miniport*" | Select FriendlyName, Status', 'Inspect WAN Miniport virtual adapters'],
      ['CMD', 'pnputil /scan-devices', 'Recreate WAN Miniports after removal']
    ],
    expected: 'Pristine WAN Miniport bindings restore PPP/IKEv2 negotiation and Error 720 clears.',
    prevent: ['Use vendor clean-uninstall utilities before switching enterprise VPN clients'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['vpn error 720', 'wan miniport', 'ppp control protocols']
  },
  {
    id: 'VPN-006',
    title: 'WireGuard Tunnel Handshake Not Completing (0 B Received)',
    category: 'VPN & Remote Access',
    desc: 'WireGuard client activates instantly (`Active` UI), shows `Tx: 4.2 KiB`, but `Rx: 0 B` and zero traffic passes.',
    symptoms: ['WireGuard always shows Active (stateless UDP!) even when completely broken', '0 B received, no Latest Handshake timestamp'],
    causes: ['Public/Private key pair swapped between peer and server', 'UDP port (default 51820) blocked/not port-forwarded', 'Duplicate AllowedIPs /32 peer IP assigned to two clients'],
    steps: ['Remember WireGuard is silent on bad keys—verify Client PublicKey is in Server `[Peer]` and Server PublicKey is in Client `[Peer]`.', 'Confirm UDP 51820 reaches the server public IP (`nc -zvu` or firewall packet capture).', 'Ensure `PersistentKeepalive = 25` is set on NATed road-warrior clients.'],
    cmds: [
      ['Bash', 'sudo wg show', 'Verify peer public keys, endpoints, and latest handshake on server']
    ],
    expected: '`wg show` displays `latest handshake: 3 seconds ago` and Rx bytes increment.',
    prevent: ['Automate WireGuard peer config generation so public/private keys are never pasted backwards'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['wireguard 0 b received', 'wireguard no handshake', 'wg show', 'udp 51820']
  },
  {
    id: 'VPN-007',
    title: 'OpenVPN TLS Error: TLS Key Negotiation Failed to Occur Within 60 Seconds',
    category: 'VPN & Remote Access',
    desc: 'OpenVPN client loops every 60 seconds with `TLS Error: TLS key negotiation failed to occur within 60 seconds`.',
    symptoms: ['Log repeats TLS key negotiation failed every minute', 'Never reaches authentication prompt'],
    causes: ['UDP 1194 blocked by firewall/ISP', 'Mismatched `tls-auth` vs `tls-crypt` static key direction', 'Connecting with UDP client config to TCP OpenVPN listener'],
    steps: ['Confirm `proto udp` vs `proto tcp` and port number match between client `.ovpn` and server config.', 'Verify `tls-crypt` or `key-direction 1` matches server `key-direction 0`.', 'Test switching to an OpenVPN TCP 443 listener if user is on restrictive guest WiFi blocking UDP 1194.'],
    cmds: [
      ['PowerShell', 'Test-NetConnection -ComputerName vpn.company.com -Port 443', 'Verify TCP fallback listener reachability']
    ],
    expected: 'TLS control channel completes handshake in <1 second and tunnel comes up.',
    prevent: ['Publish dual listeners (UDP 1194 primary for speed + TCP 443 fallback inside same `.ovpn` `<connection>` blocks)'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['tls key negotiation failed', 'openvpn 60 seconds', 'udp 1194', 'tls-crypt']
  },
  {
    id: 'VPN-008',
    title: 'Slow File Transfers (<2 MB/s) Over High-Speed Gigabit VPN',
    category: 'VPN & Remote Access',
    desc: 'Employee has 500 Mbps home fiber and HQ has 1 Gbps fiber, yet copying a 100 MB file over VPN takes 3 minutes.',
    symptoms: ['Speedtest off VPN is 500 Mbps, SMB over VPN crawls at 1-2 MB/s', 'VPN uses SSL/TCP tunnel instead of DTLS/UDP'],
    causes: ['TCP-over-TCP meltdown (running TCP VPN instead of UDP/DTLS/IKEv2/WireGuard)', 'Packet fragmentation from 1500 MTU inside tunnel', 'Chatty SMB protocol over high-latency cross-country RTT'],
    steps: ['Ensure DTLS (AnyConnect), IPSec UDP (GlobalProtect), or WireGuard/IKEv2 is active instead of TCP-fallback SSL mode!', 'Lower VPN tunnel MTU / clamp MSS to 1360 bytes to eliminate double-packet fragmentation.', 'Use `robocopy /J /MT:16` or HTTPS SharePoint/OneDrive instead of raw chatty Explorer SMB over >50ms WAN links.'],
    cmds: [
      ['CMD', 'ping fileserver.corp.local -f -l 1350', 'Verify zero packet fragmentation across VPN']
    ],
    expected: 'Switching from TCP-over-TCP to DTLS/UDP + clean MTU multiplies VPN throughput 5x-10x.',
    prevent: ['Permit UDP 443 (DTLS) / UDP 4500 on corporate edge firewalls so clients do not degrade to TCP'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['slow vpn speed', 'tcp meltdown', 'dtls', 'smb slow over vpn']
  },
  {
    id: 'VPN-009',
    title: 'VPN Host Checker / Posture Check Rejecting Endpoint Compliance',
    category: 'VPN & Remote Access',
    desc: 'Zero Trust / VPN client authenticates user MFA, then immediately disconnects with Host Posture Check Failed.',
    symptoms: ['Posture check failed: Antivirus / OS Patch / Domain Certificate missing', 'Personal laptop or stale corporate PC denied'],
    causes: ['Personal BYOD machine missing corporate Machine Certificate in Local Computer\\Personal store', 'Defender virus definitions >7 days old', 'BitLocker suspended'],
    steps: ['Confirm user is on a corporate-managed device (BYOD should use browser VDI / Azure Virtual Desktop, not L3 network VPN!).', 'Verify valid Machine Certificate exists in `certlm.msc` > Personal > Certificates.', 'Update Defender definitions (`Update-MpSignature`) and confirm BitLocker Protection is On.'],
    cmds: [
      ['PowerShell', 'Update-MpSignature', 'Update Windows Defender signatures for posture check'],
      ['PowerShell', 'Get-ChildItem Cert:\\LocalMachine\\My | Select Subject, NotAfter', 'Verify corporate machine certificate expiry']
    ],
    expected: 'Endpoint passes Host Posture verification and receives full corporate network access.',
    prevent: ['Auto-renew corporate PKI machine certificates at 80% lifetime'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['posture check failed', 'hostscan', 'hip check', 'machine certificate vpn']
  },
  {
    id: 'VPN-010',
    title: 'DNS Leak or Split-DNS Failing After Disconnecting VPN',
    category: 'VPN & Remote Access',
    desc: 'After disconnecting from corporate VPN, laptop loses all DNS resolution until rebooted.',
    symptoms: ['Disconnecting VPN leaves PC with zero DNS resolution', 'Physical WiFi adapter still points to unreachable 10.x.x.x DNS'],
    causes: ['VPN client crashed without restoring Name Resolution Policy Table (NRPT) or physical adapter DNS registry'],
    steps: ['Check for leftover NRPT rules left behind by crashed VPN software (`Get-DnsClientNrptRule`).', 'Reset WiFi/Ethernet DNS back to Automatic (DHCP) if VPN overwrote static DNS.', 'Flush local DNS cache.'],
    cmds: [
      ['PowerShell', 'Get-DnsClientNrptPolicy', 'Check lingering Name Resolution Policy Table rules'],
      ['PowerShell', 'Set-DnsClientServerAddress -InterfaceAlias "Wi-Fi" -ResetServerAddresses', 'Restore DHCP DNS on Wi-Fi']
    ],
    expected: 'Local ISP/router DNS resumes cleanly upon VPN disconnect.',
    prevent: ['Update VPN client to latest stable release fixing unclean sleep/wake NRPT teardown'],
    diff: 'Intermediate',
    time: '5-10 minutes',
    tags: ['no internet after disconnecting vpn', 'nrpt', 'resetserveraddresses']
  },
  {
    id: 'VPN-011',
    title: 'Mobile Hotspot IPv6-Only Carrier Breaking Legacy IPv4 Corporate VPN',
    category: 'VPN & Remote Access',
    desc: 'Employee tethering laptop to T-Mobile/EE/Jio 5G phone hotspot cannot connect to corporate IPv4-only VPN.',
    symptoms: ['VPN works on home WiFi, fails on 5G smartphone hotspot', 'Phone carrier uses 464XLAT / IPv6-only APN with lower 1280-1400 MTU'],
    causes: ['Carrier NAT64/464XLAT drops raw ESP or fragments oversized IKEv2 packets (>1380 bytes)'],
    steps: ['Switch VPN transport to SSL/TLS or DTLS over port 443, which traverses NAT64 seamlessly.', 'Lower IKEv2 fragmentation threshold (`ike-frag` / MTU 1340) on VPN gateway.', 'If using phone APN, test setting APN Protocol to IPv4/IPv6 dual-stack.'],
    cmds: [
      ['CMD', 'ping vpn.company.com', 'Verify NAT64 synthesis resolves VPN FQDN (never hardcode raw IPv4 literal in VPN profile!)']
    ],
    expected: 'FQDN-based VPN connects cleanly over 5G mobile hotspots.',
    prevent: ['Always configure VPN client profiles with DNS FQDNs rather than hardcoded IPv4 literals (breaks DNS64!)'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['vpn not working on mobile hotspot', 'nat64', 't-mobile hotspot vpn', 'fqdn vs ip']
  },
  {
    id: 'VPN-012',
    title: 'Tailscale / Mesh Overlay DERP Relay Fallback (High Latency Direct UDP Blocked)',
    category: 'VPN & Remote Access',
    desc: 'Zero-trust mesh VPN works, but latency is 120ms instead of 8ms because peers relay via DERP instead of direct WireGuard UDP.',
    symptoms: ['tailscale status shows relay "ord" instead of direct IP', 'Throughput capped by TCP relay'],
    causes: ['Symmetric NAT on both corporate firewalls preventing UDP hole-punching', 'Outbound UDP 41641 blocked'],
    steps: ['Run `tailscale netcheck` to inspect NAT mapping behavior (`MappingVariesByDestIP: true` = Symmetric NAT) and UDP reachability.', 'Allow outbound UDP 41641 (or static port map on at least ONE side of a site-to-site subnet router) so direct peer-to-peer tunnels form.'],
    cmds: [
      ['Bash', 'tailscale netcheck', 'Diagnose NAT type, STUN, and DERP latency'],
      ['Bash', 'tailscale ping <peer-hostname>', 'Watch direct UDP upgrade vs relay']
    ],
    expected: 'Connection upgrades from DERP TCP relay to direct encrypted WireGuard UDP.',
    prevent: ['Enable Endpoint-Independent NAT / UPnP-safe outbound UDP on subnet router gateways'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['tailscale relay', 'derp latency', 'symmetric nat', 'udp 41641']
  },
  {
    id: 'VPN-013',
    title: 'RADIUS MFA Push Timeout Before User Can Approve VPN Prompt',
    category: 'VPN & Remote Access',
    desc: 'VPN login fails after 5 seconds while employee is unlocking their phone to tap Approve on Duo/Entra NPS Extension.',
    symptoms: ['VPN shows Authentication failed while MFA push arrives 2 seconds later', 'Fast TOTP 6-digit code works, Push times out'],
    causes: ['Default VPN gateway RADIUS timeout is 5 seconds, whereas phone push approval needs 30-60 seconds!'],
    steps: ['Increase RADIUS Server Timeout on the VPN firewall/concentrator from default 5s to **60 seconds** (with 1 retry) so push MFA waits cleanly.', 'Verify NTP sync on RADIUS/NPS host.'],
    cmds: [
      ['Config / CLI', '# Firewall RADIUS Server Config:\nset timeout 60', 'Extend RADIUS timeout to 60s for MFA push']
    ],
    expected: 'VPN waits up to 60 seconds for user phone push approval and connects smoothly.',
    prevent: ['Always set RADIUS auth timeout = 60s whenever integrating NPS MFA Extension or Duo Proxy'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['vpn mfa timeout', 'nps extension push timeout', 'radius 5 seconds']
  },

  // ================= 14. Remote Desktop (13 issues) =================
  {
    id: 'RDP-001',
    title: 'Remote Desktop Error: CredSSP Encryption Oracle Remediation',
    category: 'Remote Desktop',
    desc: 'mstsc.exe blocks RDP connection with An authentication error has occurred. This could be due to CredSSP encryption oracle remediation.',
    symptoms: ['RDP blocked immediately with CredSSP encryption oracle remediation message', 'Happens connecting from patched Windows 11 PC to unpatched legacy Windows Server'],
    causes: ['CVE-2018-0886 patch mismatch between patched RDP client and unpatched target host'],
    steps: ['Patch the target Windows Server with cumulative security updates (via console/WinRM) so both sides enforce updated CredSSP!', 'Do NOT weaken client AllowEncryptionOracle=2 permanently; use VM console/Bastion to install the missing Windows Rollup on the server and reboot.'],
    cmds: [
      ['PowerShell', 'Invoke-Command -ComputerName SRV-LEGACY -ScriptBlock { Get-HotFix | Sort InstalledOn -Descending | Select -First 5 }', 'Audit missing security patches on target server']
    ],
    warn: 'Setting AllowEncryptionOracle to Vulnerable (2) exposes NLA credentials to man-in-the-middle attacks—patch the target server instead.',
    expected: 'Patched target negotiates hardened CredSSP NLA and RDP succeeds securely.',
    prevent: ['Maintain monthly cumulative patching across all Windows servers'],
    diff: 'Intermediate',
    time: '15-20 minutes',
    tags: ['credssp encryption oracle', 'cve-2018-0886', 'rdp authentication error']
  },
  {
    id: 'RDP-002',
    title: 'RDP Black Screen After Login (Cursor Moves on Blank Black Desktop)',
    category: 'Remote Desktop',
    desc: 'User connects over Remote Desktop, enters credentials, and sees only a movable white mouse arrow on a pitch-black screen.',
    symptoms: ['Black screen with working mouse cursor over RDP', 'Disconnecting and reconnecting still shows black screen'],
    causes: ['Hung explorer.exe or AppReadiness service in disconnected session', 'WDDM graphics driver bug over UDP RDP transport', 'Ctrl+Alt+End works while shell is frozen'],
    steps: ['Press **Ctrl + Alt + End** inside the RDP window (equivalent to Ctrl+Alt+Del remotely!) -> open Task Manager -> File > Run new task -> type `explorer.exe` and press Enter.', 'Log off stale disconnected sessions (`quser` / `logoff <ID>`) rather than clicking X.', 'If recurring on Windows 11 22H2/23H2/24H2 targets, disable UDP transport on client (`Select networkDetect` / `fClientDisableUDP = 1`) to test TCP-only stability.'],
    cmds: [
      ['CMD', 'quser /server:PC-TARGET01', 'List active and disconnected session IDs'],
      ['CMD', 'logoff 2 /server:PC-TARGET01', 'Cleanly log off stuck session ID 2']
    ],
    expected: 'Desktop wallpaper and taskbar render immediately.',
    prevent: ['Train users to Sign Out of jump servers or configure GPO disconnected session timeout (e.g., 4 hours)'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['rdp black screen', 'ctrl alt end', 'quser', 'fclientdisableudp']
  },
  {
    id: 'RDP-003',
    title: 'Remote Desktop Cannot Connect: Remote Access Not Enabled / Turned Off / Not Available',
    category: 'Remote Desktop',
    desc: 'Standard mstsc.exe popup says Remote Desktop cant connect to the remote computer for one of three reasons.',
    symptoms: ['Generic 3-bullet mstsc connection failure dialog', 'Target PC might be asleep, off, or firewall-blocked'],
    causes: ['Office desktop went to Sleep/Hibernate!', 'Remote Desktop (`fDenyTSConnections`) not enabled', 'TCP 3389 blocked on Windows Firewall or VPN ACL'],
    steps: ['Test network reachability and TCP 3389 first using `Test-NetConnection`.', 'If ping also fails on an office desktop, send a Wake-on-LAN packet or disable Sleep when on AC power (`powercfg /change standby-timeout-ac 0`)!', 'If ping works but TCP 3389 fails, enable RDP and Windows Firewall rule remotely via PowerShell/WinRM.'],
    cmds: [
      ['PowerShell', 'Test-NetConnection -ComputerName PC-DESK04 -Port 3389', 'Test both ping and TCP 3389'],
      ['PowerShell', 'Invoke-Command -ComputerName PC-DESK04 -ScriptBlock { Set-ItemProperty -Path "HKLM:\\System\\CurrentControlSet\\Control\\Terminal Server" -Name "fDenyTSConnections" -Value 0; Enable-NetFirewallRule -DisplayGroup "Remote Desktop" }', 'Enable RDP remotely via WinRM']
    ],
    expected: 'TCP 3389 responds (`TcpTestSucceeded : True`) and RDP connects.',
    prevent: ['Configure office desktops tuned for remote access to Never Sleep while on AC power (Turn off display only)'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['rdp cant connect', 'fdenytsconnections', 'port 3389', 'pc asleep rdp']
  },
  {
    id: 'RDP-004',
    title: 'Terminal Server / Windows Server Has Exceeded Maximum Number of Allowed Connections (2 Admins)',
    category: 'Remote Desktop',
    desc: 'Admins cannot RDP into a member Windows Server because 2 disconnected admin sessions already occupy both administrative slots.',
    symptoms: ['The terminal server has exceeded the maximum number of allowed connections', 'Happens when prior admins clicked X instead of Sign Out'],
    causes: ['Standard Windows Server (without RDS Licensing role) permits maximum 2 concurrent administrative RDP sessions'],
    steps: ['Query the stuck sessions remotely from any admin workstation using `quser /server:<ServerName>`.', 'Identify `Disc` (Disconnected) idle sessions (confirm no active batch GUI script is running inside them).', 'Log off the stale session ID remotely with `logoff <ID> /server:<ServerName>`, then connect!'],
    cmds: [
      ['CMD', 'quser /server:SRV-APP01', 'View both occupied session IDs and idle times'],
      ['CMD', 'logoff 3 /server:SRV-APP01', 'Free stale disconnected admin slot']
    ],
    expected: 'Disconnected slot clears immediately and administrative RDP succeeds.',
    prevent: ['Set GPO: Set time limit for disconnected sessions = 2 hours on member servers'],
    diff: 'Beginner',
    time: '3-5 minutes',
    tags: ['exceeded maximum number of allowed connections', '2 rdp limit', 'quser', 'logoff remote']
  },
  {
    id: 'RDP-005',
    title: 'User Denied RDP: To Sign In Remotely, You Need the Right to Sign In Through Remote Desktop Services',
    category: 'Remote Desktop',
    desc: 'Non-admin employee authenticates password over RDP, then gets blocked by SeRemoteInteractiveLogonRight.',
    symptoms: ['To sign in remotely, you need the right to sign in through Remote Desktop Services', 'Domain Admins work, standard assigned employee is blocked'],
    causes: ['User is missing from local `Remote Desktop Users` group on target PC', 'Or GPO `Allow log on through Remote Desktop Services` overwrote local group'],
    steps: ['Add the authorized domain user (or group) to the target workstation local `Remote Desktop Users` group.', 'If still denied, run `gpresult /r /scope:computer` to check if a GPO defines `Allow log on through Remote Desktop Services` exclusively for Admins!'],
    cmds: [
      ['PowerShell', 'Invoke-Command -ComputerName PC-FIN02 -ScriptBlock { Add-LocalGroupMember -Group "Remote Desktop Users" -Member "CORP\\jsmith" }', 'Grant standard user RDP access without giving Local Admin!']
    ],
    warn: 'Add standard users to `Remote Desktop Users`, NEVER to `Administrators`, just to allow RDP.',
    expected: 'Authorized user signs into their assigned office desktop remotely with standard least-privilege rights.',
    prevent: ['Manage workstation `Remote Desktop Users` membership via Group Policy Restricted Groups / Intune Account Protection'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['right to sign in through remote desktop services', 'remote desktop users group', 'seremoteinteractivelogonright']
  },
  {
    id: 'RDP-006',
    title: 'RDS Session Host Grace Period Expired: No Remote Desktop License Servers Available',
    category: 'Remote Desktop',
    desc: '120 days after deploying an RDS farm, all users suddenly get blocked with No Remote Desktop License Servers available to provide a license.',
    symptoms: ['Multi-user RDS farm worked for 120 days then locked everyone out overnight', 'RD Licensing Diagnoser shows 0 CALs or unconfigured mode'],
    causes: ['120-day RDS grace period expired without specifying Licensing Server + Per-User/Per-Device mode via GPO/Deployment'],
    steps: ['Open Server Manager > Remote Desktop Services > Overview > Edit Deployment Properties > RD Licensing (or configure via GPO).', 'Specify the activated RD Licensing Server FQDN AND explicitly select **Per User** or **Per Device** matching installed CALs.', 'Open RD Licensing Diagnoser (`lsdiag.msc`) on the Session Host to confirm 0 warnings and green CAL availability.'],
    cmds: [
      ['PowerShell', 'Get-WmiObject -Namespace "Root/CIMV2/TerminalServices" -Class Win32_TerminalServiceSetting | Select LicensingType, LicensingName', 'Verify RDS licensing mode (2=PerDevice, 4=PerUser)']
    ],
    expected: 'Session Host checks out RDS CALs cleanly and multi-user sessions connect.',
    prevent: ['Always validate `lsdiag.msc` on Day 1 of RDS deployment—never leave a farm running on the 120-day grace timer'],
    diff: 'Advanced',
    time: '15-20 minutes',
    tags: ['no remote desktop license servers available', '120 day grace period rds', 'lsdiag.msc']
  },
  {
    id: 'RDP-007',
    title: 'Network Level Authentication (NLA) Failing to Entra ID / Azure AD Joined Windows 11 PC',
    category: 'Remote Desktop',
    desc: 'Connecting via mstsc.exe to a cloud-only Entra ID Joined laptop fails password validation despite typing accurate email and password.',
    symptoms: ['The logon attempt failed when typing user@company.com in mstsc', 'Target PC is AzureAdJoined : YES, DomainJoined : NO'],
    causes: ['Classic mstsc NLA expects `AzureAD\\user@company.com` syntax and PKU2U/CredSSP mismatch when source PC is non-joined or different tenant'],
    steps: ['Use username format `AzureAD\\user@company.com` on Entra-joined clients.', 'In mstsc > Save As `.rdp` -> edit in Notepad and add `enablecredsspsupport:i:0` + `authentication level:i:2` if connecting from an unmanaged machine, OR use Windows App / Azure Virtual Desktop.', 'Ensure user has `Virtual Machine User Login` RBAC role if target is an Entra-joined Azure VM.'],
    cmds: [
      ['CMD', 'dsregcmd /status | findstr "AzureAdJoined DomainJoined"', 'Confirm target join state']
    ],
    expected: 'Entra ID credentials authenticate cleanly inside the RDP session.',
    prevent: ['Deploy Azure Virtual Desktop or Windows 365 Cloud PC for seamless Entra SSO + MFA'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['rdp to azure ad joined pc', 'azuread\\user', 'enablecredsspsupport']
  },
  {
    id: 'RDP-008',
    title: 'RDP Copy-Paste File / Text Redirect Stopped Working Mid-Session',
    category: 'Remote Desktop',
    desc: 'Clipboard sharing between local laptop and remote server suddenly stops mid-session even though Clipboard is checked in Local Resources.',
    symptoms: ['Text or files copied locally will not paste inside RDP window', 'Worked earlier in the exact same session'],
    causes: ['`rdpclip.exe` (RDP Clipboard Monitor) crashed or lost clipboard viewer chain inside the remote session'],
    steps: ['Inside the **remote** RDP session, terminate `rdpclip.exe` and start a fresh `rdpclip.exe` instance!', 'Verify GPO `Do not allow Clipboard redirection` is not enforced if this is a restricted PCI/HIPAA jump box.'],
    cmds: [
      ['CMD', 'taskkill /f /im rdpclip.exe && start rdpclip.exe', 'Run INSIDE remote RDP session to restore clipboard immediately']
    ],
    expected: 'Bidirectional clipboard copy-paste resumes instantly without logging off.',
    prevent: ['Avoid copying multi-gigabyte folders over RDP clipboard—use SMB/SFTP or mapped drives instead'],
    diff: 'Beginner',
    time: '2 minutes',
    tags: ['rdp clipboard not working', 'rdpclip.exe', 'copy paste rdp']
  },
  {
    id: 'RDP-009',
    title: 'FSLogix Profile Container Failing to Attach on AVD / RDS (Temporary Profile Loaded)',
    category: 'Remote Desktop',
    desc: 'VDI / Azure Virtual Desktop user signs in to an empty desktop with missing Outlook/Edge data because FSLogix failed to mount their VHDX.',
    symptoms: ['User gets blank temporary profile on AVD/RDS host', 'frxtray.exe shows yellow/red status'],
    causes: ['Orphaned VHDX file lock left open on another session host that crashed', 'Storage share quota full', 'User missing Modify rights on own VHDX folder'],
    steps: ['Check FSLogix Profile logs in `C:\\ProgramData\\FSLogix\\Logs\\Profile`.', 'Check SMB open files on the Azure Files / Windows File Server (`Get-SmbOpenFile`) to see which crashed session host holds an exclusive write lock on `<user>.VHDX`.', 'Close the orphaned SMB handle (`Close-SmbOpenFile`), have the user sign out and sign back in!'],
    cmds: [
      ['PowerShell', 'Get-SmbOpenFile | Where Path -like "*jsmith*" | Select FileId, ClientComputerName, Path', 'Find stale VHDX lock on file server'],
      ['PowerShell', 'Get-Content "C:\\ProgramData\\FSLogix\\Logs\\Profile\\Profile_*.log" -Tail 30', 'Inspect FSLogix mount error code']
    ],
    warn: 'Verify the user does NOT have an active working session on the other host before force-closing their VHDX SMB handle.',
    expected: 'FSLogix mounts the user VHDX container cleanly in <3 seconds on next login.',
    prevent: ['Configure FSLogix `LockedRetryCount` and `ReAttachIntervalSeconds` policies'],
    diff: 'Advanced',
    time: '10-15 minutes',
    tags: ['fslogix not mounting', 'avd temporary profile', 'vhdx locked', 'frxtray']
  },
  {
    id: 'RDP-010',
    title: 'Remote Desktop Gateway (RD Gateway) Error 0x3000008 / Certificate Untrusted',
    category: 'Remote Desktop',
    errorCode: '0x3000008',
    desc: 'External users connecting through `rdgw.company.com` over HTTPS 443 fail with Remote Desktop Gateway server certificate expired or untrusted.',
    symptoms: ['Error code 0x3000008 or certificate mismatch popup', 'Direct LAN RDP works, external RD Gateway fails'],
    causes: ['Let’s Encrypt / Public TLS certificate renewed in IIS, but RD Gateway Manager still binds to old expired certificate thumbprint!', 'CAP/RAP policy rejection'],
    steps: ['Open **RD Gateway Manager** (`tsgateway.msc`) -> right-click Server -> Properties -> SSL Certificate tab.', 'Click **Select an existing certificate** and pick the newly renewed public SSL certificate (updating IIS alone does NOT update RD Gateway!).', 'Click Apply and restart Remote Desktop Gateway (`TSGateway`) service.'],
    cmds: [
      ['PowerShell', 'Restart-Service TSGateway -Force', 'Restart RD Gateway after rebinding SSL cert']
    ],
    expected: 'RD Gateway serves valid TLS certificate on TCP/UDP 443 and external RDP connects.',
    prevent: ['Add `Import-RDGWCertificate` PowerShell hook into ACME/cert renewal automation'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['rd gateway certificate', '0x3000008', 'tsgateway.msc']
  },
  {
    id: 'RDP-011',
    title: 'Severe Lag and Frame Drops Over RDP on Windows 11 24H2 (UDP Transport Issue)',
    category: 'Remote Desktop',
    desc: 'RDP window freezes for 5-10 seconds periodically over VPN despite low ping.',
    symptoms: ['RDP screen freezes intermittently then fast-forwards', 'Connection bar signal icon drops to 1 bar'],
    causes: ['RDP Shortpath / UDP 3391 packet loss or firewall stateful UDP inspection dropping large frames'],
    steps: ['Click the connection quality icon on the top RDP blue bar to check if UDP is Enabled and dropping packets.', 'Test disabling client UDP RDP transport so RDP uses reliable TCP 3389 exclusively over the VPN tunnel.', 'Lower Experience visual effects (disable Desktop Background / Menu Animations) on constrained links.'],
    cmds: [
      ['PowerShell', 'New-ItemProperty -Path "HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows NT\\Terminal Services\\Client" -Name "fClientDisableUDP" -Value 1 -PropertyType DWORD -Force', 'Force reliable TCP transport for mstsc client']
    ],
    expected: 'Periodic 5-second UDP freezes vanish completely and typing/mouse stay responsive.',
    prevent: ['Match VPN MTU cleanly if using RDP UDP Shortpath'],
    diff: 'Intermediate',
    time: '5-10 minutes',
    tags: ['rdp freezing every few seconds', 'fclientdisableudp', 'rdp shortpath lag']
  },
  {
    id: 'RDP-012',
    title: 'Local Headset Microphone or Webcam Not Redirecting Into RDP / AVD Session',
    category: 'Remote Desktop',
    desc: 'User inside remote desktop can hear audio, but Teams/softphone inside the remote session detects No Microphone.',
    symptoms: ['Playback works in RDP, Recording tab shows No audio devices installed', 'Microphone works locally'],
    causes: ['mstsc Local Resources > Audio defaulted to Do not record!', 'Server GPO `Allow audio and video playback/recording redirection` is Not Configured / Disabled on Windows Server'],
    steps: ['In mstsc > Show Options > Local Resources > Remote audio > Settings..., change **Remote audio recording** from *Do not record* to **Record from this computer**!', 'On Windows Server RDS hosts, enable GPO: `Computer Configuration > Policies > Admin Templates > Windows Components > Remote Desktop Services > Remote Desktop Session Host > Device and Resource Redirection > Allow audio recording redirection = Enabled`.'],
    cmds: [
      ['PowerShell', 'Get-Service Audiosrv | Select Name, Status', 'Confirm Windows Audio is running on RDS host']
    ],
    expected: 'Remote Audio Input appears inside remote session Sound settings.',
    prevent: ['Pre-configure `audiocapturemode:i:1` in published `.rdp` / AVD host pool properties'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['rdp microphone not working', 'audiocapturemode', 'record from this computer']
  },
  {
    id: 'RDP-013',
    title: 'Time Zone Inside Remote Desktop Session Showing UTC Instead of User Local Time',
    category: 'Remote Desktop',
    desc: 'East/West Coast employees logged into a central cloud VDI host see timestamps in UTC instead of their local time zone.',
    symptoms: ['System tray clock and Outlook timestamps inside VDI show UTC', 'Confuses scheduled calendar reminders'],
    causes: ['Time Zone Redirection GPO disabled on RDS/AVD Session Host'],
    steps: ['Enable Group Policy on the RDS/AVD OU: `Computer Configuration > Administrative Templates > Windows Components > Remote Desktop Services > Remote Desktop Session Host > Device and Resource Redirection > Allow time zone redirection = Enabled`.', 'Run `gpupdate /force` and have user reconnect their session.'],
    cmds: [
      ['CMD', 'tzutil /g', 'Check active time zone inside current session']
    ],
    expected: 'Each user session dynamically reflects their own local laptop time zone.',
    prevent: ['Include Allow time zone redirection in baseline AVD/RDS session host GPOs'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['rdp wrong time zone', 'allow time zone redirection', 'tzutil', 'avd utc']
  },

  // ================= 15. Cybersecurity (13 issues) =================
  {
    id: 'SEC-001',
    title: 'Active Ransomware Encryption Suspected on Workstation or File Share',
    category: 'Cybersecurity',
    desc: 'Files on shared drive suddenly gain unknown extensions (`.locked`, `.akira`, `.play`) accompanied by ransom notes.',
    symptoms: ['Files unreadable with appended extension and README_RESTORE.txt dropped in folders', 'High SMB write I/O from a single workstation IP'],
    causes: ['Compromised endpoint executing ransomware payload over mapped SMB shares'],
    steps: ['IMMEDIATELY isolate the infected workstation from the network (unplug Ethernet, turn off WiFi, or trigger EDR Network Contain—DO NOT reboot or wipe RAM if forensics needed!).', 'On the File Server, check `Get-SmbSession` / `Get-SmbOpenFile` to pinpoint the exact source ClientComputerName & UserName, and disable that AD user + block SMB immediately!', 'Verify immutable / offline backups are intact before touching recovery, and escalate to Incident Response / CISO.'],
    cmds: [
      ['PowerShell', 'Get-SmbOpenFile | Select ClientComputerName, ClientUserName, Path | Select -First 30', 'Identify exact infected PC encrypting network shares'],
      ['PowerShell', 'Disable-ADAccount -Identity compromised_user; Revoke-SmbClientAccess # / Close-SmbSession -ClientComputerName 10.10.5.88 -Force', 'Sever active SMB session immediately']
    ],
    warn: 'NEVER connect backup NAS/tape systems to the network until infection vector and lateral movement are 100% eradicated.',
    expected: 'Blast radius contained within seconds, preserving unencrypted shares and immutable backups.',
    prevent: ['Deploy FSRM File Screens, EDR behavioral containment, MFA everywhere, and immutable 3-2-1-1-0 backups'],
    diff: 'Advanced',
    time: '15-30 minutes (Immediate Containment)',
    tags: ['ransomware response', 'encrypted files smb', 'isolate endpoint', 'close-smbsession']
  },
  {
    id: 'SEC-002',
    title: 'Employee Clicked Phishing Link and Entered Microsoft 365 Credentials + MFA (AiTM)',
    category: 'Cybersecurity',
    desc: 'User reports entering email, password, and MFA code into a fake DocuSign/SharePoint Adversary-in-the-Middle (Evilginx) page 10 minutes ago.',
    symptoms: ['Suspicious sign-in from unfamiliar Hosting/VPS IP in Entra Sign-in logs', 'Password reset alone does NOT invalidate stolen session cookies immediately unless tokens are revoked!'],
    causes: ['AiTM reverse-proxy phishing stole live session cookiepost-MFA'],
    steps: ['Immediately click **Revoke sessions** (`Revoke-MgUserSignInSession`) AND reset the user password in Entra Admin Center!', 'Require MFA re-registration and check Entra Sign-in logs for new MFA devices added by the attacker!', 'Audit Exchange hidden Inbox Rules (`Get-InboxRule -IncludeHidden`), Enterprise App OAuth consents, and search-and-purge the phishing email across all other employee mailboxes.'],
    cmds: [
      ['PowerShell', 'Connect-MgGraph -Scopes "User.ReadWrite.All"\nRevoke-MgUserSignInSession -UserId "victim@company.com"', 'Invalidate all stolen session & refresh tokens immediately'],
      ['PowerShell', 'Get-InboxRule -Mailbox "victim@company.com" -IncludeHidden', 'Check for attacker persistence rules']
    ],
    warn: 'Changing password WITHOUT calling Revoke Sessions leaves active browser cookies alive for up to an hour.',
    expected: 'Stolen session tokens are killed instantly and zero persistence remains.',
    prevent: ['Enforce Phishing-Resistant MFA (FIDO2 security keys / Windows Hello for Business passkeys) via Conditional Access'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['aitm phishing', 'clicked phishing link', 'revoke-mgusersigninsession', 'bec']
  },
  {
    id: 'SEC-003',
    title: 'Brute-Force RDP / SSH Login Storm Detected in Security Logs (Event ID 4625)',
    category: 'Cybersecurity',
    errorCode: 'Event ID 4625',
    desc: 'Thousands of failed Logon Type 3/10 attempts against `administrator` or `root` flood server logs every minute.',
    symptoms: ['Security Event Log fills with thousands of Event ID 4625 per hour', 'Legitimate accounts risk lockout'],
    causes: ['TCP 3389 or TCP 22 exposed directly to 0.0.0.0/0 on public firewall/cloud NSG', 'Or compromised internal IoT/workstation scanning laterally'],
    steps: ['Check Source Network Address inside Event ID 4625!', 'If external public IPs appear: IMMEDIATELY close public WAN port forwarding / NSG 3389 & 22 and require VPN or Azure Bastion.', 'If an internal LAN IP appears: isolate that internal machine immediately for malware/cobalt-strike investigation!'],
    cmds: [
      ['PowerShell', 'Get-WinEvent -FilterHashtable @{LogName="Security"; ID=4625} -MaxEvents 50 | Select TimeCreated, @{N="TargetUser";E={$_.Properties[5].Value}}, @{N="SourceIP";E={$_.Properties[19].Value}}', 'Extract target username and attacker IP from Event 4625']
    ],
    expected: 'Exposed management ports are removed from the public internet and Event 4625 drops to zero.',
    prevent: ['Never expose TCP 3389, 445, 5985, or password-auth SSH directly to the internet'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['event 4625', 'rdp brute force', 'failed logon flood']
  },
  {
    id: 'SEC-004',
    title: 'Suspicious Scheduled Task or Startup Persistence Re-Spawning PowerShell Popups',
    category: 'Cybersecurity',
    desc: 'A blue PowerShell window flashes for a split second every 10 minutes on a user PC.',
    symptoms: ['Brief PowerShell console flash every few minutes', 'Unknown outbound HTTPS connections'],
    causes: ['Info-stealer malware persistence or poorly packaged legitimate RMM/updater running without `-WindowStyle Hidden`'],
    steps: ['Download Sysinternals **Autoruns** (or inspect Scheduled Tasks & Run keys via PowerShell) to see every startup/task entry and VirusTotal hash.', 'Enable and check **PowerShell Operational Log (Event ID 4104 Script Block Logging)** to read the exact decoded command executed!', 'Quarantine host and reimage if obfuscated (`-enc` Base64 / `IEX`) payload is found.'],
    cmds: [
      ['PowerShell', 'Get-ScheduledTask | Where State -ne "Disabled" | Get-ScheduledTaskInfo | Sort LastRunTime -Descending | Select -First 15 TaskName, TaskPath, LastRunTime', 'Find task that just executed'],
      ['PowerShell', 'Get-WinEvent -FilterHashtable @{LogName="Microsoft-Windows-PowerShell/Operational"; ID=4104} -MaxEvents 10 | Format-List TimeCreated, Message', 'Read exact PowerShell script block']
    ],
    expected: 'Exact script block is identified (benign updater vs malicious persistence) with forensic certainty.',
    prevent: ['Enable PowerShell Script Block Logging (Event 4104) via GPO across all endpoints'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['powershell flashing', 'event 4104', 'scheduled task malware', 'autoruns']
  },
  {
    id: 'SEC-005',
    title: 'SSL/TLS Certificate Expired on Internal or Public Web Portal (NET::ERR_CERT_DATE_INVALID)',
    category: 'Cybersecurity',
    errorCode: 'NET::ERR_CERT_DATE_INVALID',
    desc: 'Browsers block company portal or API with Your connection is not private (NET::ERR_CERT_DATE_INVALID).',
    symptoms: ['HTTPS blocked by HSTS with expired certificate warning', 'Mobile apps and webhooks fail TLS verification'],
    causes: ['Let’s Encrypt / ACME renewal cron failed (port 80 closed or DNS TXT token expired)', 'Manual 398-day commercial certificate missed renewal'],
    steps: ['Inspect live certificate chain and NotAfter date using `openssl s_client` or browser viewer.', 'Renew via ACME (`certbot renew --dry-run` / `win-acme`) or import renewed PFX/PEM onto load balancer/Nginx/IIS.', 'Reload reverse proxy (`nginx -s reload` / IIS binding update) and verify live chain from outside network.'],
    cmds: [
      ['Bash', 'echo | openssl s_client -servername portal.company.com -connect portal.company.com:443 2>/dev/null | openssl x509 -noout -dates -subject -issuer', 'Verify live served TLS certificate expiry']
    ],
    expected: 'Server presents valid leaf + intermediate chain and HSTS browsers connect cleanly.',
    prevent: ['Automate ACME DNS-01 renewals and monitor certificate expiry externally at 30/14/7 days'],
    diff: 'Beginner',
    time: '10-15 minutes',
    tags: ['ssl certificate expired', 'err_cert_date_invalid', 'openssl s_client', 'certbot']
  },
  {
    id: 'SEC-006',
    title: 'Rogue USB Mass Storage Policy Violation / Blocking Unauthorized Flash Drives',
    category: 'Cybersecurity',
    desc: 'DLP / Compliance audit requires blocking unknown USB thumb drives while still permitting USB keyboards, mice, and headsets.',
    symptoms: ['Need to block USB data exfiltration without disabling USB docks/headsets', 'Or authorized encrypted USB needs temporary exemption'],
    causes: ['Blanket BIOS USB disable breaks peripherals; targeted Removable Storage / Device Control policy required'],
    steps: ['Never disable USB ports at the hardware level if users need docks/headsets—use **Defender for Endpoint Device Control** or GPO `Removable Storage Access: All Removable Storage classes: Deny all access` (blocks only mass storage `USBSTOR`, leaving HID/Audio untouched!).', 'Create hardware Device Instance ID / Serial exemptions only for company-issued hardware-encrypted drives.'],
    cmds: [
      ['PowerShell', 'Get-ItemProperty "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\USBSTOR" | Select Start', 'Check USBSTOR status (3=Enabled, 4=Disabled)']
    ],
    expected: 'Keyboards, mice, webcams, and docks work normally while unauthorized flash drives cannot mount.',
    prevent: ['Direct staff to approved SharePoint B2B expiring links instead of physical USB drives'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['block usb drives', 'usbstor', 'removable storage gpo', 'dlp usb']
  },
  {
    id: 'SEC-007',
    title: 'DMARC Reject Failing Legitimate Third-Party Marketing / CRM Emails',
    category: 'Cybersecurity',
    desc: 'After upgrading DMARC policy from `p=none` to `p=reject`, Salesforce/SendGrid/HubSpot emails bounce at Gmail and Yahoo.',
    symptoms: ['550 5.7.26 Unauthenticated email from company.com is not accepted due to domains DMARC policy', 'Internal M365 mail works, CRM blasts bounce'],
    causes: ['Third-party sender lacks aligned custom DKIM CNAMEs (SPF Return-Path uses vendor domain, failing SPF Identifier Alignment!)'],
    steps: ['Inspect DMARC aggregate XML reports or bounce headers for `dkim=fail` and `spf=pass (unaligned)`.', 'Publish the vendor’s two custom **DKIM CNAME records** (`s1._domainkey.company.com`) and custom Return-Path CNAME in public DNS so DKIM aligns with the `From: @company.com` domain!', 'Avoid exceeding the **10 DNS lookup limit** inside your SPF TXT record.'],
    cmds: [
      ['Bash', 'dig TXT _dmarc.company.com +short && dig TXT company.com +short', 'Inspect live DMARC and SPF records']
    ],
    expected: 'Aligned DKIM passes (`d=company.com`), satisfying DMARC `p=reject` across Gmail/Yahoo/M365.',
    prevent: ['Always audit 30 days of `p=none` rua XML reports to onboard all shadow SaaS senders before enforcing `p=reject`'],
    diff: 'Intermediate',
    time: '20 minutes',
    tags: ['dmarc reject bounce', '550 5.7.26', 'dkim alignment', 'spf 10 lookup limit']
  },
  {
    id: 'SEC-008',
    title: 'Fake Tech Support Scam Browser Fullscreen Lockup on Employee PC',
    category: 'Cybersecurity',
    desc: 'Loud siren plays in Chrome/Edge claiming Microsoft Defender Blocked Your PC - Call 1-888-XXX with locked mouse cursor.',
    symptoms: ['Fullscreen fake BSOD webpage playing audio alarm', 'User panicked—critical question is whether they called or ran AnyDesk/ScreenConnect!'],
    causes: ['Malvertising / typo-squatted domain using HTML5 Fullscreen + Pointer Lock API'],
    steps: ['FIRST ask the user gently: *"Did you call the number or download/run anything?"*', 'If NO (browser popup only): kill `msedge.exe` / `chrome.exe` via Task Manager (`Ctrl+Shift+Esc`), reopen WITHOUT restoring last tabs, clear browser site notifications, and deploy uBlock Origin Lite / Defender SmartScreen.', 'If YES (remote access tool installed): IMMEDIATELY disconnect network, isolate PC, revoke user M365 sessions, and reimage workstation!'],
    cmds: [
      ['PowerShell', 'Stop-Process -Name "msedge","chrome" -Force -ErrorAction SilentlyContinue', 'Kill browser lockup without clicking Close/Restore'],
      ['PowerShell', 'Get-ChildItem "$env:USERPROFILE\\Downloads" | Sort LastWriteTime -Descending | Select -First 10 Name, LastWriteTime', 'Verify zero remote-rat .exe/.msi downloaded']
    ],
    expected: 'Browser popup cleared safely (or full incident containment triggered if RMM tool ran).',
    prevent: ['Block unauthorized remote support binaries (ScreenConnect/AnyDesk/TeamViewer unmanaged) via AppLocker / WDAC'],
    diff: 'Beginner',
    time: '5-15 minutes',
    tags: ['tech support scam popup', 'browser locked loud siren', 'screenconnect scam']
  },
  {
    id: 'SEC-009',
    title: 'Stolen or Lost Corporate Laptop Emergency Lock & Remote Wipe',
    category: 'Cybersecurity',
    desc: 'Employee reports their corporate laptop was stolen from a car or airport lounge 20 minutes ago.',
    symptoms: ['Physical device lost outside IT custody', 'Contains cached M365 tokens and corporate files'],
    causes: ['Physical theft in transit'],
    steps: ['Verify BitLocker encryption status in Intune / AD (`Encrypted = Yes` provides strong data-at-rest protection if powered off/locked!).', 'Issue an immediate **Remote Wipe** (or Retire/Fresh Start) in Microsoft Intune so the device wipes the instant it touches any WiFi.', 'Disable the AD computer object, **Revoke all user Entra ID refresh tokens**, and rotate any local SSH/API keys stored on that developer laptop!'],
    cmds: [
      ['PowerShell', 'Disable-ADComputer -Identity "LAPTOP-LOST09"', 'Disable domain computer account immediately']
    ],
    warn: 'Preserve BitLocker compliance proof screenshot in the security incident ticket for legal/regulatory safe-harbor reporting!',
    expected: 'Device tokens invalidated immediately and compliance audit trail documented.',
    prevent: ['Enforce pre-boot BitLocker + TPM + 5-minute idle screen lock across 100% of laptops'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['stolen laptop', 'intune remote wipe', 'bitlocker safe harbor']
  },
  {
    id: 'SEC-010',
    title: 'Suspicious OAuth Consent Grant (Illicit Consent Phishing App in Entra ID)',
    category: 'Cybersecurity',
    desc: 'Third-party unverified OAuth app appears with `Mail.ReadWrite` and `Files.Read.All` permissions without stealing user password.',
    symptoms: ['Attacker reads mailbox via Microsoft Graph API even after user changes password and resets MFA!', 'Entra Enterprise Applications lists unfamiliar app'],
    causes: ['User clicked Accept on a malicious OAuth app consent screen when User Consent was unrestricted'],
    steps: ['Open Entra Admin Center > Identity > Applications > Enterprise applications -> locate the malicious app -> Properties -> set **Enabled for users to sign-in? = No**, delete OAuth2PermissionGrants, and delete service principal.', 'Restrict future OAuth attacks: set **User consent settings** to *Do not allow user consent* (or *Allow for verified publishers on low-risk scopes only*) with Admin Consent Workflow enabled!'],
    cmds: [
      ['PowerShell', 'Get-MgServicePrincipal -All | Sort CreatedDateTime -Descending | Select -First 15 DisplayName, AppId, CreatedDateTime', 'Audit recently added Enterprise Apps']
    ],
    expected: 'Malicious Graph API access ceases immediately and future unverified OAuth consent prompts require IT approval.',
    prevent: ['Enable Admin Consent Workflow in Entra ID for all tenants'],
    diff: 'Advanced',
    time: '15 minutes',
    tags: ['illicit consent grant', 'oauth phishing', 'enterprise applications', 'admin consent workflow']
  },
  {
    id: 'SEC-011',
    title: 'Legacy TLS 1.0 / 1.1 Vulnerability Flagged on Windows Server in PCI/SOC2 Scan',
    category: 'Cybersecurity',
    desc: 'External or internal vulnerability scan flags Windows Server accepting deprecated TLS 1.0 and TLS 1.1 ciphers.',
    symptoms: ['Qualys/Nessus reports TLS 1.0/1.1 Enabled on port 443 or 3389', 'Needs remediation without breaking TLS 1.2/1.3'],
    causes: ['Older upgraded Windows Server 2016/2019 still has SCHANNEL TLS 1.0/1.1 Server Enabled'],
    steps: ['Confirm all client apps (.NET 4.x `SchUseStrongCrypto=1`, SQL ODBC drivers) support TLS 1.2 first!', 'Disable TLS 1.0 and TLS 1.1 under `HKLM\\SYSTEM\\CurrentControlSet\\Control\\SecurityProviders\\SCHANNEL\\Protocols` (or via IIS Crypto Best Practices template) and ensure TLS 1.2 is explicitly Enabled.', 'Reboot during maintenance window and verify with `openssl s_client -tls1_2`.'],
    cmds: [
      ['Bash', 'openssl s_client -connect server.corp.local:443 -tls1_1', 'Confirm TLS 1.1 handshake is rejected after hardening']
    ],
    warn: 'Test old SQL Native Client (`SQLNCLI11`) on legacy apps before rebooting—upgrade old apps to `MSOLEDBSQL` / `ODBC Driver 18` for TLS 1.2.',
    expected: 'Vulnerability scanner grades endpoint A+ with strictly TLS 1.2 and TLS 1.3.',
    prevent: ['Bake SCHANNEL TLS 1.2/1.3 baseline into Windows Server golden images'],
    diff: 'Intermediate',
    time: '15-20 minutes',
    tags: ['disable tls 1.0', 'schannel', 'iis crypto', 'pci scan tls']
  },
  {
    id: 'SEC-012',
    title: 'Impossible Travel Alert in SIEM / Microsoft Defender XDR',
    category: 'Cybersecurity',
    desc: 'SOC alert triggers because jsmith signed in from New York at 09:00 and Frankfurt at 09:12.',
    symptoms: ['Impossible travel risk event in Identity Protection', 'Need fast triage: True Positive compromise vs False Positive VPN/Proxy'],
    causes: ['False Positive: Corporate SASE/Zscaler egress node, Apple iCloud Private Relay, or personal VPN', 'True Positive: Stolen token / leaked credentials used abroad'],
    steps: ['Compare **Device ID, User-Agent, MFA Auth Method, and ASN** between the two sign-ins in Entra Sign-in Logs!', 'If BOTH sign-ins share the exact same Compliant Intune Device ID or second IP belongs to Apple iCloud Private Relay / corporate Zscaler ASN -> confirm with user and mark Benign Positive.', 'If second IP is an unmanaged device / VPS ASN -> treat as active compromise and revoke sessions immediately!'],
    cmds: [
      ['Bash', 'whois 198.51.100.42 | grep -iE "OrgName|netname|descr"', 'Identify IP ASN owner (Apple Relay / Zscaler vs shady VPS)']
    ],
    expected: 'Rapid, accurate triage avoids unnecessary executive lockouts while catching real compromises.',
    prevent: ['Add corporate SASE/VPN static egress IPs to Named Trusted Locations in Entra ID'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['impossible travel alert', 'icloud private relay', 'entra sign in triage']
  },
  {
    id: 'SEC-013',
    title: 'Local Administrator Sprawl: Removing Users from Local Admins Without Breaking Workflow',
    category: 'Cybersecurity',
    desc: 'Audit reveals 80 workstations have end-users inside `BUILTIN\\Administrators`, violating cyber insurance requirements.',
    symptoms: ['End users hold persistent Local Admin rights', 'Removing abruptly risks helpdesk spike for printer/updater prompts'],
    causes: ['Legacy manual PC setups added staff to Local Administrators'],
    steps: ['Deploy **Windows LAPS** first so every PC has a unique, escrowed Local Admin password in AD/Entra.', 'Audit legitimate UAC prompts for 2 weeks and package recurring business apps into Intune Company Portal self-service (runs as SYSTEM without giving user admin!).', 'Enforce **Local User Group Membership** policy (`Replace` mode) in Intune/GPO keeping only `Administrator` + LAPS account + Domain Workstation Admins.'],
    cmds: [
      ['PowerShell', 'Get-LocalGroupMember -Group "Administrators" | Select Name, PrincipalSource', 'Audit current Local Administrators on endpoint']
    ],
    expected: 'Zero end-users retain standing Local Admin rights while Company Portal handles self-service installs.',
    prevent: ['Enroll new PCs via Windows Autopilot with User Account Type = Standard'],
    diff: 'Intermediate',
    time: '20-30 minutes',
    tags: ['remove local admin', 'local administrator sprawl', 'intune account protection']
  }
];

export const ISSUES_PART_3 = expandIssues(SEEDS_PART_3);
