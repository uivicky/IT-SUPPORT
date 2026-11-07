import { CompactIssueSeed, expandIssues } from './issueBuilder';

const SEEDS_PART_5: CompactIssueSeed[] = [
  // ================= 21. IT Helpdesk & Ticketing (13 issues) =================
  {
    id: 'HLP-001',
    title: 'ITSM Email-to-Ticket Auto-Responder Infinite Loop Flooding Queue',
    category: 'IT Helpdesk & Ticketing',
    desc: 'ServiceNow / Jira Service Management / Freshdesk creates 1,000+ tickets in 10 minutes replying to an external support@ auto-responder.',
    symptoms: ['Hundreds of new tickets per minute from external noreply@ or support@ bot', 'Agent notifications overwhelmed'],
    causes: ['Two ticketing systems emailing each other auto-receipts without X-Auto-Response-Suppress / Auto-Submitted loop headers'],
    steps: ['Immediately add the offending sender address/domain to the ITSM Email Blocklist / Suppression filter.', 'Bulk-close duplicate generated tickets silently (disable Customer Closure Notification first!).', 'Configure inbound mail parser to ignore `Auto-Submitted: auto-replied`, `Precedence: bulk`, and `noreply@` senders.'],
    cmds: [
      ['PowerShell', 'Get-MessageTrace -RecipientAddress "helpdesk@company.com" -StartDate (Get-Date).AddHours(-1) -EndDate (Get-Date) | Group SenderAddress | Sort Count -Descending | Select -First 5 Count, Name', 'Identify top looping sender address']
    ],
    expected: 'Ticket creation flood stops immediately without spamming external systems.',
    prevent: ['Enforce RFC 3834 Auto-Submitted header suppression and max 5 tickets/10 min per sender rate limit'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['ticket loop', 'auto-responder loop', 'servicenow jira flood']
  },
  {
    id: 'HLP-002',
    title: 'New Hire Day-1 Access Missing (Incomplete Onboarding Provisioning)',
    category: 'IT Helpdesk & Ticketing',
    desc: 'New employee arrives at 9:00 AM without laptop ready, AD group access, or department SaaS apps.',
    symptoms: ['Urgent P2 walk-up request on Monday morning', 'Account created without role-based security groups'],
    causes: ['Free-text email HR request instead of structured RBAC catalog form with SLA lead time'],
    steps: ['Verify approved HR/Manager authorization in ticket first.', 'Clone/apply the standardized Department Role Group (AGDLP template) rather than copying a random coworker’s bloated 5-year-old group list!', 'Verify UPN, M365 license, MFA TAP, and OneDrive before handing off credentials.'],
    cmds: [
      ['PowerShell', 'Get-ADUser -Identity jdoe -Properties MemberOf, UserPrincipalName, Enabled | Select Name, UserPrincipalName, Enabled', 'Verify core AD attributes']
    ],
    warn: 'Avoid copying senior employee permissions directly (`Copy User`)—it silently propagates legacy privilege creep.',
    expected: 'New hire receives exact least-privilege role access within 15 minutes.',
    prevent: ['Integrate HRIS (Workday/BambooHR) automated lifecycle provisioning 5 business days pre-start'],
    diff: 'Beginner',
    time: '15 minutes',
    tags: ['new hire onboarding', 'copy user privilege creep', 'day 1 access']
  },
  {
    id: 'HLP-003',
    title: 'Emergency Employee Offboarding / Immediate Termination Lockout Checklist',
    category: 'IT Helpdesk & Ticketing',
    desc: 'HR submits immediate high-priority termination requiring instant access revocation across cloud, VPN, and devices.',
    symptoms: ['Time-critical offboarding during active exit meeting'],
    causes: ['Disabling AD user alone takes up to 30-60 min to sync and leaves active OAuth/M365 refresh tokens alive'],
    steps: ['1. Block Sign-In in Entra ID AND run `Revoke-MgUserSignInSession` immediately.', '2. Disable on-prem AD account, clear manager/GAL visibility if requested, and move to Disabled Users OU.', '3. Sever active VPN/RDP sessions, remote-wipe corporate mobile/BYOD app data via Intune, and convert mailbox to Shared before unlicensing.'],
    cmds: [
      ['PowerShell', 'Disable-ADAccount -Identity terminated_user', 'Disable on-prem AD account'],
      ['PowerShell', 'Revoke-MgUserSignInSession -UserId "terminated@company.com"', 'Kill cloud/mobile OAuth sessions immediately']
    ],
    warn: 'Never delete the user account or wipe laptop SSD if Legal/HR specifies Litigation Hold preservation!',
    expected: 'All cloud, VPN, email, and workstation sessions terminate within 60 seconds.',
    prevent: ['Automate a single-script Offboarding Runbook with full audit log output attached to HR ticket'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['employee termination checklist', 'offboarding', 'revoke sessions']
  },
  {
    id: 'HLP-004',
    title: 'SLA Breach Spike Caused by Tickets Stuck in Waiting on User Without Auto-Chase',
    category: 'IT Helpdesk & Ticketing',
    desc: 'Monthly ITSM metrics show 30% SLA breaches because open tickets stay in In Progress when users stop replying.',
    symptoms: ['False SLA breach alerts on unresponsive user tickets', 'Stale backlog >90 days'],
    causes: ['Agents reply by email without transitioning workflow state to Pending Customer (pauses SLA clock)'],
    steps: ['Configure ITSM workflow so agent public comment transitions status to **Waiting for Customer** (pausing SLA timer) and customer reply auto-reopens to **In Progress**.', 'Enable a polite **3-strike rule** automation (Day 2 nudge, Day 5 nudge, Day 7 auto-resolve with easy reply-to-reopen).'],
    cmds: [
      ['Config / CLI', 'ITSM SLA Rule: Pause Clock when Status IN ("Waiting for Customer", "Pending Vendor")', 'Pause SLA accurately']
    ],
    expected: 'SLA reports reflect true IT responsiveness and stale queues stay clean.',
    prevent: ['Review aging >14-day tickets in weekly L1/L2 standups'],
    diff: 'Beginner',
    time: '15 minutes',
    tags: ['sla breach', 'waiting for customer', '3 strike rule helpdesk']
  },
  {
    id: 'HLP-005',
    title: 'Major Incident P1 Ticket Storm (50+ Users Calling About Same Outage)',
    category: 'IT Helpdesk & Ticketing',
    desc: 'ISP, M365, or ERP goes down and 80 individual users open duplicate tickets within 15 minutes.',
    symptoms: ['Phone queue and chat flooded simultaneously', 'L2 engineers distracted answering status pings instead of fixing root cause'],
    causes: ['Lack of Parent/Problem Major Incident linking and proactive status banner'],
    steps: ['Declare a **P1 Major Incident Parent Ticket** within the first 5 minutes and post a visible Status Banner on the Self-Service Portal / Slack `#it-announcements`!', 'Have L1 link all incoming child tickets to the Parent Incident (`Link as Child`) so a single resolution update notifies all 80 users at once.', 'Assign one dedicated Incident Comms lead while L3 focuses 100% on restoration.'],
    cmds: [
      ['Config / CLI', 'Status Comms Cadence: Initial notice <10m, updates every 30m with Affected Service + Workaround + Next Update ETA', 'Clear executive & user communication']
    ],
    expected: 'Inbound call volume drops by 70% and engineers resolve outage undisturbed.',
    prevent: ['Pre-write P1 Comms Templates and Parent-Child ticket linking macros'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['major incident storm', 'parent child tickets', 'p1 outage comms']
  },
  {
    id: 'HLP-006',
    title: 'Poor L1->L2 Ticket Escalations Bouncing Back (Ping-Pong Escalation)',
    category: 'IT Helpdesk & Ticketing',
    desc: 'Tickets bounce back and forth between L1 Service Desk and L2 SysAdmins ("Need hostname and error screenshot").',
    symptoms: ['High ticket reassignment count (>3 hops)', 'Frustrated end user asked same basic questions twice'],
    causes: ['Escalation lacked minimum diagnostic artifacts (Hostname, IP, Timestamp, Error text, What was already tested)'],
    steps: ['Standardize a mandatory **5-Line L1 Escalation Note** before reassigning to L2/Network: (1) Exact Hostname & IP, (2) Affected User UPN & Scope (1 user vs whole floor), (3) Exact Error Code/Screenshot + UTC Timestamp, (4) Steps Already Attempted, (5) Direct Callback Method.'],
    cmds: [
      ['CMD', 'hostname && whoami /upn && ipconfig | findstr "IPv4"', 'Quick 1-liner for L1 ticket diagnostic capture']
    ],
    expected: 'L2/L3 engineers begin root-cause remediation immediately with zero ping-pong.',
    prevent: ['Embed structured Escalation Checklist template inside ITSM internal note macro'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['ticket escalation checklist', 'l1 to l2 handoff', 'ping pong tickets']
  },
  {
    id: 'HLP-007',
    title: 'Unattended Remote Support Tool Showing Black Screen on UAC Admin Prompt',
    category: 'IT Helpdesk & Ticketing',
    desc: 'Helpdesk technician clicks Run as Administrator remotely and their screen-share freezes black until user clicks Cancel.',
    symptoms: ['Technician sees black screen whenever UAC Secure Desktop triggers'],
    causes: ['Remote session launched as standard user applet (Quick Assist / Teams screen share) rather than elevated Windows Service RMM agent'],
    steps: ['Deploy your approved enterprise RMM / Remote Control agent as a `SYSTEM` Windows Service so it renders the Winlogon Secure Desktop natively!', 'If using Microsoft **Quick Assist** ad-hoc on non-RMM PCs: have an on-site user confirm, OR temporarily shift via Intune Remote Help (which supports elevation for authorized helpers).'],
    cmds: [
      ['CMD', 'start ms-quick-assist:', 'Launch built-in Windows Quick Assist']
    ],
    warn: 'Never turn off UAC `PromptOnSecureDesktop` permanently via registry—malware can then spoof UAC clicks!',
    expected: 'Technicians enter LAPS credentials on Secure Desktop cleanly without compromising UAC security.',
    prevent: ['Ensure enterprise RMM agent installs during Windows Autopilot OOBE'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['uac black screen remote support', 'quick assist admin', 'secure desktop']
  },
  {
    id: 'HLP-008',
    title: 'Social Engineering Caller Requesting Urgent Executive Password / MFA Reset',
    category: 'IT Helpdesk & Ticketing',
    desc: 'Caller claiming to be a traveling VP demands an immediate password + MFA reset to join a board call in 2 minutes.',
    symptoms: ['High artificial urgency, refusal to get on Teams video, caller ID spoofed'],
    causes: ['Scattered Spider / Helpdesk voice-phishing (vishing) attack targeting L1 agents'],
    steps: ['NEVER accept inbound caller ID, employee ID number, or SMS codes as proof of identity for privileged or MFA resets!', 'Follow strict out-of-band verification: initiate a **live Teams Video Call** matching HR photo + verify via their direct reporting Executive/Manager on internal Teams/directory phone.', 'Escalate suspicious vishing attempts immediately to Security Operations!'],
    cmds: [
      ['PowerShell', 'Get-ADUser -Identity vp_user -Properties Manager, Title, LockedOut | Select Name, Title, Manager, LockedOut', 'Verify reporting chain in AD']
    ],
    warn: 'Polite firmness saves companies from multi-million-dollar breaches—never let artificial urgency bypass identity verification.',
    expected: 'Vishing attempt stopped cold at L1 Service Desk.',
    prevent: ['Run quarterly Helpdesk vishing tabletop drills and require live video + manager callback for MFA resets'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['helpdesk social engineering', 'vishing mfa reset', 'verify caller identity']
  },
  {
    id: 'HLP-009',
    title: 'Asset Inventory Drift: Returned Laptops Not Unassigned in CMDB / Intune',
    category: 'IT Helpdesk & Ticketing',
    desc: 'Audit shows 25 laptops assigned to former staff or wrong Primary User in Intune.',
    symptoms: ['License/asset reconciliation mismatches physical stockroom shelf'],
    causes: ['Returned hardware shelved without updating CMDB state and Intune Primary User'],
    steps: ['Scan serial tag on intake (`wmic bios get serialnumber` / `Get-CimInstance Win32_BIOS`).', 'Run **Autopilot Fresh Start / Wipe** before putting any returned laptop in loaner stock, update CMDB state to `In Stock - Ready`, and update Intune Primary User upon redeployment.'],
    cmds: [
      ['PowerShell', 'Get-CimInstance Win32_BIOS | Select SerialNumber, SMBIOSBIOSVersion', 'Read exact hardware asset serial number']
    ],
    expected: 'CMDB and Intune Primary User stay 100% audit-ready.',
    prevent: ['Require Asset Tag scan field before closing Offboarding Hardware Return subtasks'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['cmdb drift', 'serial number powershell', 'intune primary user']
  },
  {
    id: 'HLP-010',
    title: 'VIP / Conference Room Meeting Emergency Audio-Visual Failure 5 Minutes Before Kickoff',
    category: 'IT Helpdesk & Ticketing',
    desc: 'Boardroom Teams Room / Zoom Room touch controller says Disconnected or TV shows No Signal right as clients sit down.',
    symptoms: ['Touch console disconnected from compute NUC or HDMI ingest dead'],
    causes: ['Loose USB-C/Cat6 link to table touch console, TV switched to HDMI 2 instead of HDMI 1, or hung MTR app'],
    steps: ['Check TV input source (`HDMI 1`) FIRST (solves 40% of room calls in 10 seconds!).', 'Have presenter join the meeting from their laptop (**Join with Audio Off** to prevent loud echo howl!) and share slides in the cloud immediately so the meeting starts on time!', 'Reboot the compute NUC + touch panel PoE port cleanly right after the meeting concludes.'],
    cmds: [
      ['Config / CLI', 'Meeting Triage Rule #1: Get slides on screen via Cloud Join (Audio Muted!) in <60s; debug hardware cables AFTER VIPs finish.', 'Zero-stress VIP support']
    ],
    expected: 'Executive meeting starts on schedule with zero acoustic feedback echo.',
    prevent: ['Enable daily automated 03:00 AM maintenance reboot on Microsoft Teams Rooms compute appliances'],
    diff: 'Beginner',
    time: '3-5 minutes',
    tags: ['conference room av down', 'teams room disconnected', 'echo in meeting']
  },
  {
    id: 'HLP-011',
    title: 'ITSM Knowledge Base Articles Outdated or Ignored by Users and Agents',
    category: 'IT Helpdesk & Ticketing',
    desc: 'Self-service deflection is <3% because KB articles are 8-page walls of screenshots from Windows 7.',
    symptoms: ['Users skip KB links and open tickets for simple WiFi/printer tasks'],
    causes: ['Articles lack symptom-first titles, error codes, and concise numbered steps'],
    steps: ['Rewrite top 20 ticket drivers using **Knowledge-Centered Service (KCS)** format: exact user error phrase in Title, 1-line summary, max 6 numbered bullets, copyable CLI command, and Expected Result.', 'Archive any KB article untouched for >18 months without verification.'],
    cmds: [
      ['Config / CLI', 'KCS Standard: Title = Exact Error/Symptom | Steps <= 6 | Review Cycle = 180 Days', 'High-deflection KB template']
    ],
    expected: 'L1 first-contact resolution (FCR) and portal self-service deflection double.',
    prevent: ['Empower agents to flag or update inaccurate KB steps inline while closing tickets'],
    diff: 'Beginner',
    time: '15 minutes',
    tags: ['kcs knowledge base', 'ticket deflection', 'fcr helpdesk']
  },
  {
    id: 'HLP-012',
    title: 'Shadow IT SaaS Subscription Discovered Without SSO or Offboarding Control',
    category: 'IT Helpdesk & Ticketing',
    desc: 'Department expensed a cloud project/AI tool on a corporate credit card with 30 shared local passwords and company data.',
    symptoms: ['Former employees still have login access to unmanaged SaaS tool', 'No SAML SSO or audit log'],
    causes: ['Department bypassed IT procurement due to slow intake or missing feature awareness'],
    steps: ['Approach collaboratively rather than punitively: inventory active users and data sensitivity classification.', 'Work with vendor to upgrade/federate behind **Entra ID / Okta SAML/OIDC SSO + SCIM provisioning** (or migrate data to an already-licensed approved equivalent).', 'Audit rogue local accounts and remove former staff immediately.'],
    cmds: [
      ['Config / CLI', 'Microsoft Defender for Cloud Apps > Cloud Discovery -> Inspect firewall/Defender traffic for unsanctioned SaaS', 'Discover Shadow IT apps']
    ],
    expected: 'Business workflow continues safely under centralized MFA, SSO, and automated offboarding.',
    prevent: ['Partner with Finance AP to require lightweight IT Security/SSO review on all new software card merchants'],
    diff: 'Intermediate',
    time: '20-30 minutes',
    tags: ['shadow it saas', 'saml sso onboarding', 'cloud discovery']
  },
  {
    id: 'HLP-013',
    title: 'Unauthorized Production Change Causing Monday Morning Outage (Change Management Gap)',
    category: 'IT Helpdesk & Ticketing',
    desc: 'An undocumented Friday evening firewall/DNS tweak broke Monday morning payroll or warehouse scanning.',
    symptoms: ['Nobody knows what changed over the weekend', '30 minutes wasted hunting before discovering manual edit'],
    causes: ['Emergency/informal production edit made without Change Record, Peer Review, or Rollback Plan'],
    steps: ['Check firewall/AD/switch configuration audit diff logs immediately to spot exact Friday/weekend commits and execute clean rollback.', 'Institute lightweight, frictionless **Standard vs Normal Change** workflow: every prod change logs *What, When, Blast Radius, Test Step, and 1-Minute Rollback Command* (and avoid non-emergency Friday 4 PM changes!).'],
    cmds: [
      ['PowerShell', 'Get-WinEvent -FilterHashtable @{LogName="Security"; ID=5136,4719} -MaxEvents 20', 'Audit recent AD / System Policy modifications']
    ],
    expected: 'Fast rollback restores operations in minutes instead of hours of guesswork.',
    prevent: ['Maintain Read-Only Friday culture for non-emergency infrastructure changes'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['unauthorized change outage', 'rollback plan', 'event 5136']
  },

  // ================= 22. Virtualization (13 issues) =================
  {
    id: 'VRT-001',
    title: 'Hyper-V VM Stuck in Stopping or Starting State (Cannot Power Off in GUI)',
    category: 'Virtualization',
    desc: 'Hyper-V Manager shows a hung VM stuck at `Stopping... (10%)` and right-click Turn Off / Settings are greyed out.',
    symptoms: ['VM frozen in Stopping or Backing Up state', 'Restarting vmms service alone does not kill hung worker'],
    causes: ['Individual `vmwp.exe` (Virtual Machine Worker Process) for that VM GUID is deadlocked on storage/VHDX I/O'],
    steps: ['Find the exact **VMId GUID** of ONLY the stuck VM (so you never affect healthy VMs running on the same Hyper-V host!).', 'Locate the `vmwp.exe` process whose CommandLine contains that exact VM GUID.', 'Terminate ONLY that single `vmwp.exe` PID, then start the VM cleanly!'],
    cmds: [
      ['PowerShell', "$guid = (Get-VM -Name \"SRV-HUNG01\").VMId.Guid\n$wp = Get-CimInstance Win32_Process -Filter \"Name='vmwp.exe' AND CommandLine LIKE '%$guid%'\"\nStop-Process -Id $wp.ProcessId -Force", 'Safely terminate ONLY the single hung VM worker process']
    ],
    warn: 'NEVER run `Stop-Process -Name vmwp` without filtering by VM GUID—that would hard-crash EVERY VM on the host!',
    expected: 'Hung VM immediately flips to Off while all sibling VMs continue running untouched.',
    prevent: ['Keep host storage multipathing (MPIO) and backup VSS agents updated'],
    diff: 'Intermediate',
    time: '5 minutes',
    tags: ['hyper-v stuck stopping', 'vmwp.exe guid', 'kill hung hyper-v vm']
  },
  {
    id: 'VRT-002',
    title: 'VMware ESXi High CPU Ready % (`%RDY > 10%`) Making Multi-Core VM Feel Sluggish',
    category: 'Virtualization',
    desc: 'Admin gave a slow SQL/ERP VM 16 vCPUs instead of 4, and the VM actually became SLOWER despite Guest Task Manager showing 25% CPU!',
    symptoms: ['Guest OS feels laggy with micro-stutters, yet Guest Task Manager shows low CPU!', 'esxtop `%RDY` exceeds 10%'],
    causes: ['**vCPU Over-Provisioning / Co-Stop (`%CSTP`)**: Hypervisor scheduler waits for more physical cores to become simultaneously free for oversized vCPU VMs!'],
    steps: ['Check `esxtop` (press `c`) or vCenter Performance chart for **CPU Ready (ms / %)** and **Co-Stop (`%CSTP`)**—anything `> 5%` (`1000ms` per 20s sample) degrades latency!', 'Right-size oversized VMs **DOWN** (e.g., from 16 vCPUs to 4 or 8 vCPUs matching actual peak workload) during a maintenance window—smaller vCPU count schedules 4x faster on busy hosts!'],
    cmds: [
      ['Bash', '# On ESXi SSH shell:\nesxtop # Press c, then f to enable %RDY and %CSTP columns', 'Measure hypervisor CPU Ready scheduling wait']
    ],
    expected: '`%RDY` drops `< 1%` and application query latency improves immediately.',
    prevent: ['Start VMs lean (2–4 vCPUs) and scale up only when guest sustained CPU exceeds 75%'],
    diff: 'Advanced',
    time: '15-20 minutes',
    tags: ['cpu ready high', 'esxtop rdy', 'too many vcpus slow', 'co-stop']
  },
  {
    id: 'VRT-003',
    title: 'Hyper-V Generation 2 VM Fails to Boot ISO (`Boot Failed. EFI SCSI Device` Secure Boot)',
    category: 'Virtualization',
    desc: 'Mounting a Linux, Proxmox, Clonezilla, or custom utility ISO on a Hyper-V Gen 2 VM fails with `Unsigned / Security Violation`.',
    symptoms: ['Boot Failed. EFI DVD/CDROM. The image hash and certificate are not allowed (DB)', 'Windows ISO boots fine, Linux/Rescue ISO fails'],
    causes: ['Hyper-V Generation 2 Secure Boot defaults to `Microsoft Windows` template ONLY, rejecting Microsoft UEFI CA third-party Linux shims!'],
    steps: ['With the VM powered off, open VM **Settings > Security**.', 'Keep Secure Boot enabled for Ubuntu/RHEL, and change **Template** from *Microsoft Windows* to **`Microsoft UEFI Certificate Authority`**! (Or uncheck Secure Boot temporarily only for unsigned rescue utilities like Clonezilla/GParted).'],
    cmds: [
      ['PowerShell', 'Set-VMFirmware -VMName "Ubuntu-Prod01" -SecureBootTemplate "MicrosoftUEFICertificateAuthority"', 'Switch Gen2 VM to Linux-compatible Secure Boot template']
    ],
    expected: 'Linux and signed UEFI ISOs boot cleanly with Secure Boot protection active.',
    prevent: ['Always set `-SecureBootTemplate MicrosoftUEFICertificateAuthority` in Linux Hyper-V provisioning scripts'],
    diff: 'Beginner',
    time: '3 minutes',
    tags: ['hyper-v linux boot failed', 'microsoft uefi certificate authority', 'gen2 secure boot']
  },
  {
    id: 'VRT-004',
    title: 'VMware vMotion or Hyper-V Live Migration Failing Due to CPU Instruction Compatibility',
    category: 'Virtualization',
    desc: 'Live-migrating a running VM from an Intel Ice Lake host to an older Cascade Lake host fails with CPU incompatibility.',
    symptoms: ['The target host does not support the virtual machines current hardware requirements (AVX-512 / SSE / CPUID)', 'Cluster mixes two server generations'],
    causes: ['VM booted on newer CPU generation exposes newer CPUID instruction flags unavailable on older host'],
    steps: ['For **VMware vSphere**: enable **EVC (Enhanced vMotion Compatibility)** on the cluster set to the oldest host generation baseline in the cluster!', 'For **Hyper-V**: open VM Settings > Processor > Compatibility -> check **Migrate to a physical computer with a different processor version** (requires one brief VM restart if currently running on newer host without EVC).'],
    cmds: [
      ['PowerShell', 'Set-VMProcessor -VMName "SRV-APP01" -CompatibilityForMigrationEnabled $true', 'Enable cross-generation Hyper-V CPU Live Migration']
    ],
    expected: 'VMs Live Migrate seamlessly in both directions across mixed-generation hosts.',
    prevent: ['Always enable VMware EVC at cluster creation before powering on your first workload'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['vmotion cpu incompatible', 'evc mode', 'compatibilityformigrationenabled']
  },
  {
    id: 'VRT-005',
    title: 'Thin-Provisioned Datastore Out of Physical Space Pausing All Production VMs',
    category: 'Virtualization',
    desc: 'Hypervisor pauses critical VMs (`Paused-Critical` / `No space left`) because thin-provisioned disks overcommitted physical SAN LUN capacity.',
    symptoms: ['Multiple VMs freeze in Paused-Critical (Hyper-V) or VMware Question Lock state simultaneously!', 'Physical datastore reads 0 B free'],
    causes: ['Thin provisioning over-allocated 15 TB of virtual disks onto a 10 TB physical LUN without UNMAP or space alerts'],
    steps: ['DO NOT kill paused VMs—they resume cleanly without data loss the moment free blocks appear on the datastore!', 'Immediately delete old ISO images, stale non-chained templates, or **expand the underlying SAN LUN + Datastore online** so paused VMs automatically resume!', 'After recovery, run `Optimize-Volume -ReTrim` / `fstrim -av` inside guests to reclaim dead blocks via SCSI UNMAP.'],
    cmds: [
      ['PowerShell', 'Get-VM | Where State -eq "PausedCritical" | Select Name, State, Status', 'List Hyper-V VMs paused due to host disk exhaustion'],
      ['PowerShell', '# Once datastore free space > 20 GB:\nGet-VM | Where State -eq "PausedCritical" | Resume-VM', 'Resume paused VMs cleanly without reboot!']
    ],
    warn: 'Never Turn Off a `PausedCritical` database VM—free datastore space and `Resume-VM` so in-flight memory transactions flush intact!',
    expected: 'Paused VMs resume mid-instruction with zero filesystem corruption.',
    prevent: ['Alert at 75% and 85% physical datastore utilization when using Thin Provisioning'],
    diff: 'Advanced',
    time: '15-25 minutes',
    tags: ['paused-critical', 'datastore full vm paused', 'thin provisioning full', 'resume-vm']
  },
  {
    id: 'VRT-006',
    title: 'Cloned Windows VM Causing Domain / WSUS / KMS Collisions (Sysprep Skipped)',
    category: 'Virtualization',
    desc: 'Cloning a configured Windows VM directly without running `sysprep` causes WSUS/EDR duplicates and KMS activation refusal.',
    symptoms: ['New cloned VM replaces previous VM inside WSUS/SCCM/EDR console every time it checks in!', 'KMS activation count refuses to increment (`CMID` identical)'],
    causes: ['Cloning without `sysprep /generalize` duplicates machine SID, KMS `CMID`, and `SusClientId`'],
    steps: ['If machine was NOT yet promoted to a DC: run `sysprep.exe /generalize /oobe /reboot` on non-production clones (back up static config first!).', 'For WSUS/EDR specifically if already in production and only SusClientId collided, reset `SusClientId`—but ALWAYS generalize golden templates BEFORE converting to Template!'],
    cmds: [
      ['CMD', 'C:\\Windows\\System32\\Sysprep\\sysprep.exe /generalize /oobe /shutdown', 'Generalize golden VM image before converting to template']
    ],
    warn: 'Running `sysprep /generalize` resets local SID, unjoins AD domain, and clears static NIC bindings—run on templates, never on live Domain Controllers!',
    expected: 'Every deployed VM gets a unique Machine SID, CMID, and EDR Agent ID.',
    prevent: ['Always shut down golden images via `sysprep /generalize /oobe /shutdown` prior to templating'],
    diff: 'Intermediate',
    time: '15-20 minutes',
    tags: ['cloned vm duplicate sid', 'sysprep generalize', 'wsus susclientid duplicate']
  },
  {
    id: 'VRT-007',
    title: 'Guest VM Clock Drifting Despite NTP Due to Hypervisor Host Time Sync Conflict',
    category: 'Virtualization',
    desc: 'Domain-joined VM or Domain Controller jumps 4 minutes forward/backward every hour because ESXi/Hyper-V host CMOS clock is wrong.',
    symptoms: ['Clock jumps back after `w32tm /resync`', 'Event ID 50 Time-Service logged'],
    causes: ['Hyper-V `Time Synchronization` Integration Service or VMware Tools `syncTimeWithHost` overrides AD NT5DS time using an unsynced ESXi/Hyper-V host clock!'],
    steps: ['FIRST configure accurate NTP on every **ESXi / Hyper-V / Proxmox physical host**!', 'On virtualized **Domain Controllers** specifically: uncheck *Time Synchronization* (or disable `VMICTimeProvider` periodic sync while keeping resume-from-saved-state carefully per Microsoft virtualized DC guidance) so PDC Emulator strictly tracks authoritative NTP!'],
    cmds: [
      ['PowerShell', 'Get-VMIntegrationService -VMName "DC01" -Name "Time Synchronization"', 'Check Hyper-V host-to-guest time sync status'],
      ['CMD', 'w32tm /query /source', 'Verify DC uses external NTP / NT5DS, NOT VM IC Time Synchronization Provider!']
    ],
    expected: '`w32tm /query /source` shows authoritative NTP peer rather than `VM IC Time Synchronization Provider`.',
    prevent: ['Point all physical hypervisors and PDC Emulator to reliable stratum-1/2 NTP pools'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['vm ic time synchronization provider', 'virtualized dc time drift', 'vmware sync time']
  },
  {
    id: 'VRT-008',
    title: 'WSL2 / Docker Desktop Failing on Windows (`0x80370102` Nested Virtualization Disabled)',
    category: 'Virtualization',
    errorCode: '0x80370102',
    desc: 'Starting WSL2 or Docker Desktop inside a developer VM or new PC throws `WslRegisterDistribution failed with error: 0x80370102`.',
    symptoms: ['Error 0x80370102: Please enable the Virtual Machine Platform Windows feature and ensure virtualization is enabled in the BIOS'],
    causes: ['Intel VT-x / AMD-V disabled in BIOS (physical PC), OR Nested Virtualization (`ExposeVirtualizationExtensions`) disabled on VDI VM!'],
    steps: ['On physical PC: enable **Intel Virtualization Technology (VT-x) / AMD SVM** in UEFI BIOS.', 'On Hyper-V / Azure VDI VM: power off VM and run `Set-VMProcessor -VMName <DevVM> -ExposeVirtualizationExtensions $true` on the host.', 'Enable `VirtualMachinePlatform` feature inside Windows and reboot.'],
    cmds: [
      ['CMD', 'dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart', 'Enable Windows Virtual Machine Platform'],
      ['PowerShell', '# On Hyper-V Host for nested dev VM:\nSet-VMProcessor -VMName "Dev-VDI-01" -ExposeVirtualizationExtensions $true', 'Expose hardware VT-x into nested guest VM']
    ],
    expected: '`wsl --status` starts Linux kernel cleanly and Docker Desktop boots.',
    prevent: ['Enable VT-x/SVM in BIOS configuration profiles across engineering laptops'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['0x80370102', 'wslregisterdistribution', 'nested virtualization', 'docker desktop error']
  },
  {
    id: 'VRT-009',
    title: 'VM Network Lost After Replacing Host NIC or Importing VM (`Synthetic NIC Disconnected`)',
    category: 'Virtualization',
    desc: 'Imported or migrated VM fails to start or boots with disconnected cable because old vSwitch name does not exist on target host.',
    symptoms: ['Hyper-V error: Synthetic Ethernet Port failed to power on (Virtual Switch not found)', 'Or VMware NIC unchecked Connected at power on'],
    causes: ['Target host vSwitch is named `vSwitch-Prod` instead of `External-Switch`, or `Connected at power on` checkbox unticked'],
    steps: ['Open VM Settings > Network Adapter and select the valid Virtual Switch / Port Group on the current host (and verify VLAN ID tag!).', 'In VMware, ensure both **Connected** and **Connect at power on** checkboxes are ticked!'],
    cmds: [
      ['PowerShell', 'Get-VMSwitch | Select Name, SwitchType', 'List available Hyper-V virtual switches on host'],
      ['PowerShell', 'Connect-VMNetworkAdapter -VMName "SRV-WEB01" -SwitchName "vSwitch-Prod"', 'Rebind VM NIC to host virtual switch']
    ],
    expected: 'VM powers on and establishes Layer 2 network link immediately.',
    prevent: ['Standardize identical vSwitch names (or use VMware vSphere Distributed Switch) across all cluster nodes'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['synthetic ethernet port failed', 'connect-vmnetworkadapter', 'vswitch mismatch']
  },
  {
    id: 'VRT-010',
    title: 'Hyper-V Dynamic Memory Starving SQL Server / Exchange (`0 MB Available` Inside Guest)',
    category: 'Virtualization',
    desc: 'Database VM has Dynamic Memory Min=2GB Max=32GB, yet Hyper-V never balloons it up above 4 GB while SQL crawls!',
    symptoms: ['SQL Server performance terrible while Hyper-V Assigned Memory stays low'],
    causes: ['SQL Server / Java / Exchange pre-allocates buffer pool or locks pages in memory in ways that confuse Hyper-V Dynamic Memory pressure heuristics!'],
    steps: ['**Disable Dynamic Memory** on production SQL Server, Exchange, and Domain Controller VMs—assign **Static Fixed RAM** (with Guest NUMA aligned to physical socket boundaries)!', 'Reserve Dynamic Memory strictly for light stateless VDI/file/print workloads.'],
    cmds: [
      ['PowerShell', 'Get-VMMemory -VMName "SQL-PROD01" | Select DynamicMemoryEnabled, Startup, Minimum, Maximum', 'Audit Dynamic vs Static RAM on DB VM']
    ],
    expected: 'Database locks full static buffer pool in single NUMA node with predictable low latency.',
    prevent: ['Always configure Static RAM on Tier-1 database and directory VMs'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['hyper-v dynamic memory sql', 'static ram database vm']
  },
  {
    id: 'VRT-011',
    title: 'Proxmox VE / KVM Guest Agent Not Reporting IP or Freezing During Backup (`fsfreeze` Hang)',
    category: 'Virtualization',
    desc: 'Proxmox shows `Guest Agent not running`, or nightly snapshot backup freezes Windows/Linux guest for 60 seconds.',
    symptoms: ['Proxmox Summary says Guest Agent not running despite `QEMU Guest Agent` enabled in Options', 'Or backup hangs on `guest-fsfreeze-freeze`'],
    causes: ['`qemu-guest-agent` package / VirtIO `vioserial` PCI driver not installed inside guest OS!'],
    steps: ['Enable `QEMU Guest Agent` in Proxmox VM > Options FIRST (requires one cold Stop -> Start to expose VirtIO Serial PCI device!).', 'On **Linux guest**: `apt install qemu-guest-agent && systemctl enable --now qemu-guest-agent`.', 'On **Windows guest**: mount `virtio-win.iso` and run `virtio-win-guest-tools.exe` to install VirtIO Serial + `qemu-ga` VSS service!'],
    cmds: [
      ['Bash', 'sudo apt-get update && sudo apt-get install -y qemu-guest-agent && sudo systemctl status qemu-guest-agent', 'Install and start QEMU Guest Agent on Ubuntu/Debian']
    ],
    expected: 'Proxmox displays live guest IPs and performs clean 1-second VSS/fsfreeze backups.',
    prevent: ['Bake `qemu-guest-agent` and VirtIO SCSI (`virtio-scsi-single` + `discard=on`) into Proxmox cloud-init templates'],
    diff: 'Beginner',
    time: '10 minutes',
    tags: ['proxmox guest agent not running', 'qemu-guest-agent', 'virtio-win']
  },
  {
    id: 'VRT-012',
    title: 'Dynamic VHDX File Bloated to 1 TB on Host Despite Guest Only Using 150 GB',
    category: 'Virtualization',
    desc: 'After deleting 800 GB of temp archives inside a guest VM, the `.vhdx` file on the Hyper-V host still consumes the full 950 GB!',
    symptoms: ['Guest C: shows 800 GB free, Host datastore `.vhdx` is still 950 GB'],
    causes: ['Dynamic VHDX files grow automatically when blocks write, but require TRIM zeroing + `Optimize-VHD` compaction to shrink file size on host'],
    steps: ['Inside the running Windows Guest: run `Optimize-Volume -DriveLetter C -ReTrim -Verbose` so freed clusters zero/unmap.', 'During a brief maintenance window, shut down the VM gracefully and run `Optimize-VHD -Path <file.vhdx> -Mode Full` on the Hyper-V host!'],
    cmds: [
      ['PowerShell', '# Step 1 inside Guest:\nOptimize-Volume -DriveLetter C -ReTrim -Verbose', 'Send TRIM hints for deleted blocks'],
      ['PowerShell', '# Step 2 on Hyper-V Host (VM Off):\nOptimize-VHD -Path "D:\\VMs\\App01\\Data.vhdx" -Mode Full', 'Compact VHDX physical size on host']
    ],
    expected: 'Host `.vhdx` shrinks from 950 GB down to actual 150 GB used.',
    prevent: ['Mount VHDX on Virtual SCSI controllers (supports live UNMAP) rather than legacy Gen1 IDE'],
    diff: 'Intermediate',
    time: '20-30 minutes',
    tags: ['compact vhdx', 'optimize-vhd', 'shrink dynamic vhdx']
  },
  {
    id: 'VRT-013',
    title: 'ESXi Host Disconnected (`Not Responding`) in vCenter While VMs Keep Running Fine',
    category: 'Virtualization',
    desc: 'vCenter marks an ESXi host `Not Responding (greyed out)`, yet pinging all production VMs on that host succeeds with zero downtime!',
    symptoms: ['Host and its VMs appear greyed out/disconnected in vCenter', 'All VMs continue serving production traffic normally!'],
    causes: ['ESXi management agents (`hostd` / `vpxa`) hung on the host without affecting kernel `vmkernel` running VMs!'],
    steps: ['DO NOT hard-reboot the physical ESXi blade—your VMs are still happily running in `vmkernel`!', 'SSH into the ESXi Management IP (or use DCUI via iDRAC/iLO -> *Troubleshooting Options > Restart Management Agents*).', 'Run `/etc/init.d/hostd restart && /etc/init.d/vpxa restart`—zero impact to running guest VMs!'],
    cmds: [
      ['Bash', '/etc/init.d/hostd restart && /etc/init.d/vpxa restart', 'Restart ESXi management daemons with ZERO VM impact']
    ],
    warn: 'Restarting `hostd` and `vpxa` is 100% non-disruptive to running VMs; never power-cycle the server first!',
    expected: 'ESXi host reconnects to vCenter within 30 seconds without dropping a single VM packet.',
    prevent: ['Ensure ESXi scratch/log partition points to healthy NVMe/flash rather than worn SD cards'],
    diff: 'Intermediate',
    time: '5 minutes',
    tags: ['esxi not responding vms running', 'hostd vpxa restart', 'restart management agents']
  },

  // ================= 23. Storage & Disk Management (13 issues) =================
  {
    id: 'STO-001',
    title: 'Extend Volume Greyed Out in Windows Disk Management Due to Recovery Partition in the Middle',
    category: 'Storage & Disk Management',
    desc: 'Admin expanded virtual disk by +50 GB, sees Unallocated Space on the far right, yet right-clicking `C:` shows `Extend Volume` greyed out!',
    symptoms: ['Layout is `[EFI] [C: OS] [550MB Recovery Partition] [50GB Unallocated]`', 'Extend Volume is disabled on C:'],
    causes: ['NTFS `Extend Volume` requires Unallocated Space to be **immediately contiguous** to the right of `C:`, and the Recovery Partition sits in between!'],
    steps: ['Verify if the middle partition is standard WinRE (`reagentc /info`).', 'Temporarily disable WinRE (`reagentc /disable`—this safely moves `Winre.wim` back into `C:\\Windows\\System32\\Recovery\\Winre.wim`!), delete the blocking empty recovery partition in `diskpart` (`delete partition override`), extend `C:` leaving 1024 MB at the end, recreate the 1 GB Recovery partition (`id=de94bba4-06d1-4d40-a16a-bfd50179d6ac` GPT), and run `reagentc /enable`!'],
    cmds: [
      ['CMD', 'reagentc /info', 'Confirm which partition hosts Windows Recovery Environment'],
      ['PowerShell', 'Get-Partition -DiskNumber 0 | Select PartitionNumber, DriveLetter, Size, Type', 'Inspect exact partition layout']
    ],
    warn: 'Take a VM snapshot first and ALWAYS confirm `Winre.wim` staged to `C:\\Windows\\System32\\Recovery` via `reagentc /disable` before deleting the old recovery partition.',
    expected: '`C:` extends seamlessly and healthy 1 GB WinRE partition sits cleanly at the end of the disk.',
    prevent: ['Place data/logs on a separate `D:` disk with zero trailing recovery partitions so online expansion takes 5 seconds'],
    diff: 'Advanced',
    time: '15-20 minutes',
    tags: ['extend volume greyed out', 'recovery partition blocking extend', 'reagentc']
  },
  {
    id: 'STO-002',
    title: 'External Drive or Volume Suddenly Shows `RAW` Filesystem (`You Need to Format the Disk`)',
    category: 'Storage & Disk Management',
    desc: 'Plugging in an external hard drive or SAN LUN prompts `You need to format the disk in drive E: before you can use it` and Disk Management says `RAW`.',
    symptoms: ['Volume filesystem shows RAW instead of NTFS/exFAT', 'Windows prompts to Format'],
    causes: ['Unclean USB yank corrupted primary NTFS `$MFT` / boot sector, BitLocker header unrecognized on old OS, or hardware bridge failure'],
    steps: ['**CLICK CANCEL IMMEDIATELY—DO NOT FORMAT!** Formatting overwrites filesystem metadata!', 'Check `Get-PhysicalDisk` / SMART health first; if drive is clicking or throwing bad-sector errors, image bit-for-bit (`ddrescue`) BEFORE touching it.', 'If hardware is healthy and only boot sector corrupted from unsafe unplug, test `chkdsk E: /f` (if NTFS MFT mirror intact) or read-only recovery software (`TestDisk` / `DMDE` / `R-Studio`) to copy files off safely first!'],
    cmds: [
      ['PowerShell', 'Get-Partition | Where DriveLetter -eq "E" | Select DriveLetter, Size, Type', 'Inspect partition type without writing to disk']
    ],
    warn: 'NEVER click Format when Windows prompts on a `RAW` drive containing needed data!',
    expected: 'Partition table/boot sector recovered or files extracted safely via read-only imager.',
    prevent: ['Use Safely Remove Hardware on exFAT/external drives and maintain 3-2-1 backups'],
    diff: 'Advanced',
    time: '30-60 minutes',
    tags: ['drive turned raw', 'you need to format the disk', 'recover raw partition']
  },
  {
    id: 'STO-003',
    title: 'Hardware RAID Array Degraded (`Amber Drive LED` on Dell PERC / HPE Smart Array)',
    category: 'Storage & Disk Management',
    desc: 'Server chassis front bezel turns amber and iDRAC/iLO alerts Physical Disk 0:1:4 Failed - Virtual Disk Degraded.',
    symptoms: ['RAID 5/6/10 Virtual Disk status = Degraded', 'Server stays online on remaining parity/mirror disks'],
    causes: ['Mechanical SAS HDD or enterprise SSD wear failure'],
    steps: ['1. Verify your **most recent backup succeeded** BEFORE touching any physical drive bays (if a second disk hits URE during RAID-5 rebuild, backups are your lifeline!).', '2. Confirm the **EXACT Slot Number & Serial Number** in iDRAC/iLO and turn on the **Blink / Locate LED** so nobody EVER pulls the wrong healthy drive!', '3. Hot-swap the failed drive with an identical/certified spare and monitor automatic background rebuild to `Optimal`.'],
    cmds: [
      ['Config / CLI', '# Dell PERCCLI check:\nperccli64 /c0 /eall /sall show\nperccli64 /c0 /e32 /s4 start locate', 'Blink blue Locate LED on exact failed bay before pulling!']
    ],
    warn: 'Pulling the wrong healthy disk from a degraded RAID-5 array takes down the entire array—ALWAYS blink the Locate LED and match Serial Number!',
    expected: 'Replacement disk auto-rebuilds online and Virtual Disk returns to `Optimal`.',
    prevent: ['Prefer RAID 6 or RAID 10 over RAID 5 on large (>4 TB) drives to survive dual-faults during rebuild'],
    diff: 'Intermediate',
    time: '20 minutes + background rebuild',
    tags: ['raid degraded', 'amber light server drive', 'perccli locate', 'hot swap raid']
  },
  {
    id: 'STO-004',
    title: 'Cannot Initialize or Partition Disk >2 TB Beyond 2048 GB Limit (MBR vs GPT)',
    category: 'Storage & Disk Management',
    desc: 'Adding a 6 TB data disk allows creating a 2048 GB partition while the remaining 3.9 TB stays permanently unusable.',
    symptoms: ['New Simple Volume greyed out on space past 2048 GB'],
    causes: ['Disk was initialized with legacy **MBR (Master Boot Record)** 32-bit LBA addressing (hard ceiling 2 TiB) instead of **GPT (GUID Partition Table)**!'],
    steps: ['Check PartitionStyle (`MBR` vs `GPT`) with `Get-Disk`.', 'If this is a brand-new empty data disk: delete empty volume and convert to `GPT` (`Set-Disk -PartitionStyle GPT` or right-click Disk > Convert to GPT Disk).', 'If OS disk with data: use Microsoft’s built-in non-destructive `mbr2gpt /validate /allowFullOS` (after verified backup!).'],
    cmds: [
      ['PowerShell', 'Get-Disk | Select Number, FriendlyName, PartitionStyle, @{N="SizeGB";E={[math]::Round($_.Size/1GB)}}', 'Check MBR vs GPT partition style'],
      ['CMD', 'mbr2gpt /validate /allowFullOS', 'Validate non-destructive MBR-to-GPT conversion']
    ],
    expected: 'GPT partition table addresses the entire 6 TB+ volume cleanly (up to 9.4 ZB theoretical).',
    prevent: ['Always initialize all modern disks >0 bytes as GPT unless supporting a 2008 legacy BIOS appliance'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['2tb limit mbr gpt', 'unallocated past 2048gb', 'mbr2gpt']
  },
  {
    id: 'STO-005',
    title: 'New SAN LUN / Secondary Disk Stuck `Offline` (`The Disk Is Offline Because of Policy Set by an Administrator`)',
    category: 'Storage & Disk Management',
    desc: 'Newly attached VMware/Hyper-V/SAN data disk shows `Offline` and `Read-Only` in Windows Server Disk Management.',
    symptoms: ['Disk status: Offline (Policy set by an administrator)', 'Right-click Online still leaves Read-Only flag on some SAN LUNs'],
    causes: ['Windows Server Enterprise/Datacenter defaults `SAN Policy = OfflineShared` to prevent accidental multi-host NTFS corruption on shared LUNs'],
    steps: ['Confirm this LUN is dedicated exclusively to THIS server (not an unclustered shared LUN mounted raw to two hosts!).', 'Bring the disk Online and clear the `IsReadOnly` attribute cleanly via PowerShell or `diskpart`.'],
    cmds: [
      ['PowerShell', 'Get-Disk | Where IsOffline -eq $true | Set-Disk -IsOffline $false', 'Bring offline data disk online'],
      ['PowerShell', 'Set-Disk -Number 1 -IsReadOnly $false', 'Clear SAN Read-Only attribute']
    ],
    expected: 'Secondary data volume mounts Read-Write with assigned drive letter.',
    prevent: ['Include `Set-Disk -IsOffline $false -IsReadOnly $false` in server data-disk provisioning scripts'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['disk offline policy set by administrator', 'san policy read only', 'set-disk']
  },
  {
    id: 'STO-006',
    title: 'iSCSI Target Disconnecting Under Load or Not Reconnecting After Server Reboot',
    category: 'Storage & Disk Management',
    desc: 'Mounted iSCSI SAN volume disappears after rebooting Windows Server or drops with Event ID 20 / 39.',
    symptoms: ['D: drive missing after reboot until admin opens iscsicpl.exe and clicks Connect!', 'Or iSCSI stutters on single path'],
    causes: ['Target was connected WITHOUT checking **Add this connection to the list of Favorite Targets** (`IsPersistent = False`)!', 'Jumbo Frames (MTU 9000) enabled on NIC without matching MTU 9216 on physical switch!'],
    steps: ['In `iscsicpl.exe` (or PowerShell `Register-IscsiSession`), ALWAYS register the session as **Persistent (Favorite Targets)** AND add `MSiSCSI` as a service dependency on SQL/File services using that drive!', 'Verify end-to-end MTU (`ping <san-ip> -f -l 8972`)—if switch is 1500 MTU, keep NIC at 1500 until switch Jumbo Frames are configured end-to-end!'],
    cmds: [
      ['PowerShell', 'Get-IscsiSession | Select TargetNodeAddress, IsConnected, IsPersistent', 'Verify IsPersistent = True so LUN survives reboots!'],
      ['PowerShell', 'Get-IscsiSession | Register-IscsiSession', 'Make active iSCSI session persistent across reboots']
    ],
    expected: '`IsPersistent` shows `True` and SAN volumes mount automatically at every boot.',
    prevent: ['Use dedicated dual isolated iSCSI VLANs + MPIO (`mpclaim`) rather than sharing general LAN NICs'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['iscsi not reconnecting after reboot', 'favorite targets', 'register-iscsisession', 'jumbo frames']
  },
  {
    id: 'STO-007',
    title: 'Dirty Bit Locked on NTFS Volume Triggering `Checking File System on C:` Every Reboot',
    category: 'Storage & Disk Management',
    desc: 'Workstation or server tries running `autochk` on every single boot or reports volume is dirty.',
    symptoms: ['Scanning and repairing drive C: appears on every restart', 'fsutil dirty query C: reports Volume C: is Dirty'],
    causes: ['Filesystem corruption pending repair or third-party AV blocking boot-time `autochk.exe` from clearing the dirty bit'],
    steps: ['Query dirty status with `fsutil dirty query C:`.', 'Run online non-disruptive scan first (`chkdsk C: /scan`) to assess severity!', 'If errors remain, schedule a maintenance window reboot (`echo Y | chkdsk C: /f`) so `autochk` repairs metadata and clears the dirty bit cleanly.'],
    cmds: [
      ['CMD', 'fsutil dirty query C:', 'Check if NTFS dirty bit is set'],
      ['CMD', 'chkdsk C: /scan', 'Run online live NTFS scan with ZERO downtime first!']
    ],
    warn: 'On multi-terabyte File Servers, `chkdsk /f` offline can take hours—always run `chkdsk /scan` + `/spotfix` (seconds of offline time on Server 2012 R2+!) instead of legacy full `/r`!',
    expected: '`fsutil dirty query` reports `Volume - C: is NOT Dirty`.',
    prevent: ['Use `chkdsk /spotfix` on modern Windows Server NTFS volumes to shrink repair downtime to <15 seconds'],
    diff: 'Intermediate',
    time: '10-20 minutes',
    tags: ['fsutil dirty query', 'checking file system every boot', 'chkdsk spotfix']
  },
  {
    id: 'STO-008',
    title: 'Finding What Is Secretly Eating 200 GB on Windows `C:` Drive (`System Volume Information` / `hiberfil` / `Temp`)',
    category: 'Storage & Disk Management',
    desc: '`C:` shows 10 GB free out of 500 GB, yet selecting all visible folders in `C:\\` Properties only adds up to 180 GB!',
    symptoms: ['300 GB "missing" between drive capacity and visible folder sum'],
    causes: ['Non-elevated Explorer returns `0 bytes` for ACL-protected folders: `C:\\System Volume Information` (runaway VSS shadow copies!), `C:\\Windows\\Temp` (`cab_*` logs!), other user profiles, or `hiberfil.sys`'],
    steps: ['Check VSS Shadow Storage first (`vssadmin list shadowstorage`—an unbounded shadow copy limit often hides 200+ GB inside `System Volume Information`!).', 'Cap shadow storage cleanly (`vssadmin resize shadowstorage /for=C: /on=C: /maxsize=10%`).', 'Audit top root directory sizes from an **Elevated PowerShell** session.'],
    cmds: [
      ['CMD', 'vssadmin list shadowstorage', 'Check hidden System Volume Information shadow usage'],
      ['CMD', 'vssadmin resize shadowstorage /for=C: /on=C: /maxsize=10%', 'Reclaim unbounded VSS space safely'],
      ['PowerShell', 'Get-ChildItem C:\\ -Force -ErrorAction SilentlyContinue | Select Name, Attributes', 'List hidden/system root items including hiberfil.sys & pagefile.sys']
    ],
    warn: 'Never modify ACL permissions on `C:\\System Volume Information`—always manage it via `vssadmin`!',
    expected: 'Hidden shadow/temp bloat reclaimed safely in seconds.',
    prevent: ['Always set explicit percentage caps (`10%-15%`) when enabling VSS Shadow Copies'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['missing disk space windows', 'system volume information huge', 'vssadmin resize shadowstorage']
  },
  {
    id: 'STO-009',
    title: 'Cannot Copy 6 GB `.ISO` or `.ZIP` to Empty 64 GB USB Flash Drive (`File Is Too Large for Destination`)',
    category: 'Storage & Disk Management',
    desc: 'Copying a 5.5 GB Windows ISO to a brand-new 64 GB USB stick with 58 GB free fails immediately with `File is too large for the destination file system`!',
    symptoms: ['Error: The file is too large for the destination file system despite 50+ GB free space!'],
    causes: ['USB drive is factory-formatted as **FAT32**, which has a hard architectural **4 GB minus 1 byte (`4,294,967,295` bytes) single-file limit**!'],
    steps: ['If drive is empty (or back up existing files first!): format as **exFAT** (cross-platform Windows + macOS + Linux) or **NTFS** (Windows-only).', 'If drive already has small files on it and you want NTFS without copying off: `convert E: /fs:ntfs` converts FAT32 -> NTFS in-place!'],
    cmds: [
      ['PowerShell', 'Get-Volume -DriveLetter E | Select DriveLetter, FileSystem, SizeRemaining', 'Confirm FAT32 filesystem'],
      ['CMD', 'format E: /FS:exFAT /Q /V:DataUSB', 'Quick-format empty drive to exFAT (WIPES DRIVE - confirm letter!)']
    ],
    warn: '`format` erases all files on the selected drive letter—triple-check the drive letter in `Get-Volume` first!',
    expected: '6 GB+ single files copy cleanly at full USB 3.x speed.',
    prevent: ['Format multi-OS transfer drives as exFAT'],
    diff: 'Beginner',
    time: '3 minutes',
    tags: ['file is too large for destination file system', 'fat32 4gb limit', 'exfat']
  },
  {
    id: 'STO-010',
    title: 'Windows Storage Spaces Virtual Disk Degraded After Replacing Failed Physical Drive',
    category: 'Storage & Disk Management',
    desc: 'Admin swapped a failed disk in a Windows Storage Spaces pool, yet Virtual Disk remains `Warning / Degraded` until old retired metadata is cleaned.',
    symptoms: ['Get-VirtualDisk shows OperationalStatus = Degraded even after inserting healthy spare'],
    causes: ['New physical disk not added to Pool as `AutoSelect`, or dead disk not set to `Retired` -> `Repair-VirtualDisk` -> `Remove-PhysicalDisk`'],
    steps: ['1. Add the new replacement disk into the Storage Pool.', '2. Mark the dead `Lost Communication` disk Usage as **`Retired`**.', '3. Run **`Repair-VirtualDisk`** and wait for `Get-StorageJob` to reach 100%, then `Remove-PhysicalDisk` on the retired entry!'],
    cmds: [
      ['PowerShell', 'Get-PhysicalDisk | Select FriendlyName, SerialNumber, OperationalStatus, Usage', 'Identify Lost Communication vs Healthy disks'],
      ['PowerShell', 'Get-PhysicalDisk | Where OperationalStatus -eq "Lost Communication" | Set-PhysicalDisk -Usage Retired\nRepair-VirtualDisk -FriendlyName "DataMirror"', 'Retire failed disk and rebuild mirror/parity']
    ],
    expected: '`Get-StorageJob` completes at 100% and `Get-VirtualDisk` returns `Healthy`.',
    prevent: ['Label physical caddy bays with exact disk Serial Numbers for zero-guesswork Storage Spaces swaps'],
    diff: 'Advanced',
    time: '20 minutes + rebuild',
    tags: ['storage spaces degraded', 'repair-virtualdisk', 'retired physicaldisk']
  },
  {
    id: 'STO-011',
    title: 'NVMe SSD Running at Half Rated Speed (PCIe Gen3 Slot / Shared Lane Bottleneck)',
    category: 'Storage & Disk Management',
    desc: 'PCIe 4.0 NVMe SSD rated at 7,000 MB/s benchmarks at only 1,700 MB/s or 3,400 MB/s.',
    symptoms: ['Sequential read caps at ~3,400 MB/s (Gen3 x4) or ~1,700 MB/s (Gen3 x2)'],
    causes: ['M.2 drive installed in secondary chipset M.2_3 slot wired only as PCIe 3.0 x2 instead of top CPU-direct M.2_1 PCIe 4.0/5.0 x4 slot', 'Thermal throttling without M.2 heatsink'],
    steps: ['Check motherboard block diagram: install primary OS/scratch NVMe in **M.2_1** (closest to CPU socket, wired x4 directly to CPU lanes) WITH the thermal pad heatsink installed (peeling the clear protective plastic film off the thermal pad!).', 'Verify negotiated PCIe Link Width & Speed and drive temperature.'],
    cmds: [
      ['PowerShell', 'Get-StorageReliabilityCounter -PhysicalDisk (Get-PhysicalDisk) | Select DeviceId, Temperature, TemperatureMax', 'Verify NVMe is not thermal throttling (>75C)']
    ],
    expected: 'NVMe negotiates full PCIe Gen4 x4 lanes at <55°C.',
    prevent: ['Always peel protective plastic film off motherboard M.2 thermal pads during workstation assembly!'],
    diff: 'Beginner',
    time: '15 minutes',
    tags: ['nvme slow speed', 'pcie x2 vs x4', 'm.2 heatsink plastic']
  },
  {
    id: 'STO-012',
    title: 'Cannot Safely Eject External Drive (`This Device Is Currently in Use`)',
    category: 'Storage & Disk Management',
    desc: 'Clicking Safely Remove Hardware says `Windows cant stop your Generic Volume device because a program is still using it` even with all windows closed.',
    symptoms: ['All Explorer and Office windows closed, drive still refuses safe eject'],
    causes: ['Windows Search indexer, Defender scan, PowerShell `cd E:\\` working directory, or Quick Access preview holding an open handle'],
    steps: ['Check if any terminal window has `E:\\` as its current directory (`cd C:\\`).', 'Find the exact process holding a handle on `E:\\` using Resource Monitor (`resmon.exe` > CPU > Associated Handles > search `E:\\`) or Sysinternals `handle.exe`, OR offline the disk cleanly via `Set-Disk -IsOffline $true` (flushes NTFS write cache safely before unplugging!).'],
    cmds: [
      ['CMD', 'resmon.exe', 'Search E:\\ under CPU > Associated Handles to see exact locking PID']
    ],
    expected: 'Open handle closes cleanly and NTFS write cache flushes safely prior to removal.',
    prevent: ['Verify Better Performance vs Quick Removal policy in Device Manager Disk Policies'],
    diff: 'Beginner',
    time: '3-5 minutes',
    tags: ['device is currently in use eject', 'associated handles resmon', 'cant eject usb']
  },
  {
    id: 'STO-013',
    title: 'Synology / QNAP NAS Btrfs / RAID Volume Degraded or Pool Read-Only Warning',
    category: 'Storage & Disk Management',
    desc: 'Office NAS beeps continuously with amber status LED and Storage Manager reports Storage Pool 1 Degraded.',
    symptoms: ['Audible NAS beep alarm', '1 drive Crashed/Removed in SHR/RAID5/RAID6 pool'],
    causes: ['CMR/NAS drive bad sector threshold exceeded (or consumer SMR drive mistakenly used in RAID timing out under rebuild!)'],
    steps: ['Silence the audible beep in NAS Control Panel > Hardware & Power so office staff can focus while you work.', 'Verify drive model compatibility: **NEVER replace a NAS RAID disk with a cheap SMR (Shingled Magnetic Recording) drive**—always use **CMR** enterprise/NAS drives (WD Red Plus/Pro, Seagate IronWolf/Exos) of `>=` capacity!', 'Hot-swap failed bay and click **Storage Pool > Repair**.'],
    cmds: [
      ['Bash', '# Via NAS SSH diagnostic check:\ncat /proc/mdstat', 'Inspect Linux mdadm RAID array sync percentage']
    ],
    warn: 'Using SMR drives in ZFS or mdadm RAID causes multi-day rebuild timeouts and array drop-outs—always verify CMR specification.',
    expected: 'Array rebuilds cleanly to Healthy without URE timeouts.',
    prevent: ['Schedule monthly RAID Data Scrubbing and SMART Extended tests on all NAS units'],
    diff: 'Intermediate',
    time: '20 minutes + rebuild',
    tags: ['synology beeping degraded', 'cmr vs smr raid', 'cat proc mdstat']
  },

  // ================= 24. File Sharing & Permissions (13 issues) =================
  {
    id: 'FSP-001',
    title: 'SMB Network Share Error `0x80070035` (The Network Path Was Not Found)',
    category: 'File Sharing & Permissions',
    errorCode: '0x80070035',
    desc: 'Browsing `\\\\filesrv01\\projects` fails with `0x80070035: The network path was not found` even though `ping filesrv01` replies!',
    symptoms: ['Ping works, `\\\\filesrv01` fails with 0x80070035'],
    causes: ['TCP Port **445** blocked on target Windows Firewall (profile stuck on Public!) or VLAN ACL', '`LanmanServer` stopped on server or `LanmanWorkstation` stopped on client', 'Windows 11 24H2 blocking unauthenticated **Insecure Guest SMB** to consumer NAS!'],
    steps: ['Run `Test-NetConnection filesrv01 -Port 445` FIRST—if `PingSucceeded: True` and `TcpTestSucceeded: False`, TCP 445 is firewall-blocked!', 'If connecting to a third-party NAS from Windows 11 24H2 (which enforces SMB Signing + blocks Guest logons by default): create a proper username/password credential on the NAS instead of anonymous Guest access!'],
    cmds: [
      ['PowerShell', 'Test-NetConnection -ComputerName filesrv01.corp.local -Port 445', 'Isolate TCP 445 firewall block vs SMB auth issue'],
      ['PowerShell', 'Get-Service LanmanWorkstation, LanmanServer | Select Name, Status', 'Verify SMB client and server services']
    ],
    expected: 'TCP 445 connects and authenticated SMBv3 share opens.',
    prevent: ['Never re-enable insecure anonymous Guest SMB logons on Windows 11 24H2—use authenticated NAS accounts'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['0x80070035', 'network path was not found', 'port 445', 'windows 11 24h2 nas']
  },
  {
    id: 'FSP-002',
    title: 'User Added to AD Group Still Gets `Access Is Denied` on Network Folder',
    category: 'File Sharing & Permissions',
    desc: 'Helpdesk just added `jsmith` to `SG-Finance-Modify`, ran `gpupdate`, yet `\\\\fs01\\Finance` still says `Access is denied`!',
    symptoms: ['Check Effective Access shows Allowed, yet user live session still gets Access Denied!'],
    causes: ['1. **Kerberos Group Membership Token is ONLY built at Logon** (`gpupdate` does NOT refresh user security group SIDs—user MUST Sign Out & Sign Back In or purge `klist` + Explorer!)', '2. **Share Permission vs NTFS Permission**: Share tab is set to `Everyone = Read` (most restrictive wins!)', '3. Explicit `Deny` ACE on another group'],
    steps: ['Have the user **Sign Out of Windows and Sign Back In** first whenever adding them to a new AD Security Group!', 'If still denied after fresh logon: check **Share Permissions** (best practice: `Authenticated Users = Change/Full Control` on Share tab, and control granular access strictly via **NTFS Security** tab!) and check **Effective Access** for any Explicit `Deny` rule!'],
    cmds: [
      ['CMD', 'whoami /groups | findstr /i "Finance"', 'Verify new AD group SID is actually inside user live logon token!'],
      ['PowerShell', 'Get-SmbShareAccess -Name "Finance"', 'Verify Share-level permission is not capping NTFS at Read-Only!']
    ],
    expected: '`whoami /groups` lists new group after re-logon and folder opens with Modify rights.',
    prevent: ['Follow AGDLP + Share=Authenticated Users (Change) + NTFS=Role Security Groups; NEVER use Explicit Deny ACEs when omitting Allow suffices'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['added to ad group still access denied', 'whoami /groups', 'share vs ntfs permissions']
  },
  {
    id: 'FSP-003',
    title: 'Multiple Connections to a Server or Shared Resource by the Same User (`Error 1219`)',
    category: 'File Sharing & Permissions',
    errorCode: 'System Error 1219',
    desc: 'Mapping a second share on the same NAS/Server with different credentials fails with `Multiple connections to a server or shared resource by the same user, using more than one user name, are not allowed`.',
    symptoms: ['Error 1219 when trying to connect with admin/alternate credentials'],
    causes: ['Windows SMB client restricts one credential set per remote server string (`\\\\filesrv01`)'],
    steps: ['Inspect existing active SMB sessions with `net use`.', 'Disconnect existing cached connection (`net use \\\\filesrv01 /delete /y` or `net use * /delete /y`), then map with desired credential (or connect via FQDN vs IP if temporary admin check is needed).'],
    cmds: [
      ['CMD', 'net use', 'List active SMB server connections'],
      ['CMD', 'net use \\\\filesrv01 /delete /y', 'Clear existing SMB credential session to server']
    ],
    expected: 'Existing session clears and new authenticated SMB session connects.',
    prevent: ['Grant proper role-based permissions to the user primary AD account rather than sharing secondary NAS passwords'],
    diff: 'Beginner',
    time: '3 minutes',
    tags: ['error 1219', 'multiple connections to a server', 'net use delete']
  },
  {
    id: 'FSP-004',
    title: 'Shared Word / Excel / CAD File Locked on File Server (`File in Use by Another User` Who Left Hours Ago)',
    category: 'File Sharing & Permissions',
    desc: 'Department budget file on `\\\\fs01\\Dept` says locked by `alee`, even though `alee` closed their laptop and went home.',
    symptoms: ['File is locked for editing by user on SMB file server'],
    causes: ['Abrupt WiFi/VPN drop left an orphaned SMB file handle open on the Windows File Server'],
    steps: ['On the **File Server**, run `Get-SmbOpenFile` filtered by the filename (or open `fsmgmt.msc` > Shared Folders > Open Files).', 'Confirm with `alee` (or check idle status) that they are not actively typing, then close ONLY that single stuck file handle with `Close-SmbOpenFile`!'],
    cmds: [
      ['PowerShell', 'Get-SmbOpenFile | Where Path -like "*Q4-Budget.xlsx*" | Select FileId, ClientUserName, ClientComputerName, Path', 'Locate orphaned SMB lock on file server'],
      ['PowerShell', 'Close-SmbOpenFile -FileId <FileId> -Force', 'Release stuck SMB file lock cleanly']
    ],
    expected: 'Orphaned lock clears immediately and team resumes editing.',
    prevent: ['Migrate collaborative Office documents from legacy SMB shares to SharePoint/Teams for real-time co-authoring without single-user locks'],
    diff: 'Beginner',
    time: '3-5 minutes',
    tags: ['unlock smb file', 'get-smbopenfile', 'close-smbopenfile', 'fsmgmt.msc']
  },
  {
    id: 'FSP-005',
    title: 'Destination Path Too Long (`MAX_PATH` > 260 Characters) Blocking Copy or Delete',
    category: 'File Sharing & Permissions',
    desc: 'File Explorer refuses to copy, rename, or delete deeply nested legal/engineering project folders due to 260-character path limit.',
    symptoms: ['The file name(s) would be too long for the destination folder', 'Cannot even delete or move deep subfolder'],
    causes: ['Win32 legacy `MAX_PATH` (260 chars) hit by nested verbose folder names'],
    steps: ['Enable `LongPathsEnabled = 1` in `HKLM\\SYSTEM\\CurrentControlSet\\Control\\FileSystem` for modern Win32 apps.', 'To move/copy/delete long paths right now (since `explorer.exe` still enforces legacy shell limits in places): use **`robocopy`** (natively bypasses 260-char limit!) or map a temporary `subst X:` deep inside the path!'],
    cmds: [
      ['PowerShell', 'Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Control\\FileSystem" -Name "LongPathsEnabled" -Value 1', 'Enable Win32 Long Paths support'],
      ['CMD', 'robocopy "D:\\DeepFolder\\Source" "E:\\Archive\\Target" /E /ZB /R:1 /W:1 /MT:16', 'Robocopy natively handles >32,000 char paths!']
    ],
    expected: 'Deep folder hierarchies copy, archive, or clean up with zero path truncation errors.',
    prevent: ['Keep top-level share taxonomy flat (max 3-4 folder levels) with concise naming conventions'],
    diff: 'Intermediate',
    time: '5-10 minutes',
    tags: ['path too long 260', 'longpathsenabled', 'robocopy long path']
  },
  {
    id: 'FSP-006',
    title: 'Taking Ownership & Repairing Broken NTFS Permissions (`icacls` / Departed User Private Folder)',
    category: 'File Sharing & Permissions',
    desc: 'Even Domain Admins get `Access Denied` opening an offboarded employee home folder where `Inheritance` was disabled and `Admins` removed.',
    symptoms: ['Administrators get Access Denied viewing folder properties'],
    causes: ['Creator Owner / exclusive user ACL stripped Administrators while SeTakeOwnershipPrivilege allows recovery'],
    steps: ['NEVER click GUI *Take Ownership* recursively as your personal admin account (it replaces user ownership and can wipe existing child ACLs if misclicked!).', 'From an **Elevated CMD**, assign ownership cleanly to the local **`Administrators` group** (`takeown /F <path> /A /R /D Y`) and **grant** `Administrators:(OI)(CI)F` via `icacls` WITHOUT `/reset` so existing valid ACLs stay intact!'],
    cmds: [
      ['CMD', 'takeown /F "D:\\Homes\\departed_user" /A /R /D Y', 'Assign ownership to Administrators group (/A) recursively'],
      ['CMD', 'icacls "D:\\Homes\\departed_user" /grant "BUILTIN\\Administrators:(OI)(CI)F" /T /C', 'Add Administrators Full Control cleanly']
    ],
    warn: 'Always pass `/A` to `takeown` so the `Administrators` group becomes owner rather than your individual admin user SID!',
    expected: 'Administrators gain full read/archive access cleanly.',
    prevent: ['Enforce `CREATOR OWNER` + `SYSTEM` + `FileServer-Admins:(OI)(CI)F` at home-root creation'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['takeown /a', 'icacls grant', 'domain admin access denied folder']
  },
  {
    id: 'FSP-007',
    title: 'Access-Based Enumeration (ABE) Hiding Folders or Confusing Users',
    category: 'File Sharing & Permissions',
    desc: 'User connects to `\\\\corp.local\\shares\\Departments` and sees an empty window (while coworker sees `HR`, `Finance`, `Engineering`).',
    symptoms: ['Share opens fine, but specific department subfolder is completely invisible to user'],
    causes: ['**Access-Based Enumeration (ABE)** hides any subfolder where the user lacks at least NTFS `Read` permission (feature, not a bug!)'],
    steps: ['Confirm ABE is enabled on the SMB / DFS share (`Get-SmbShare | Select Name, FolderEnumerationMode`).', 'Grant the user (via their Department AD Security Group!) NTFS `Read & Execute` / `Modify` on the specific subfolder—the folder immediately becomes visible to them while keeping `HR`/`Payroll` invisible!'],
    cmds: [
      ['PowerShell', 'Get-SmbShare -Name "Departments" | Select Name, Path, FolderEnumerationMode', 'Check AccessBased vs Unrestricted enumeration']
    ],
    expected: 'Authorized department folder appears immediately while unauthorized folders stay hidden.',
    prevent: ['Enable Access-Based Enumeration on all multi-department root shares for clean zero-clutter security'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['folder invisible network share', 'access-based enumeration', 'folderenumerationmode']
  },
  {
    id: 'FSP-008',
    title: 'Users Accidentally Dragging and Dropping Whole Top-Level Department Folders Inside Each Other!',
    category: 'File Sharing & Permissions',
    desc: 'Entire `\\\\fs01\\Projects\\2026-Active` folder suddenly vanished because someone’s mouse slipped and dragged it inside `2025-Archive`!',
    symptoms: ['Critical shared root folder "deleted/missing" at 2 PM—usually found nested inside an adjacent folder!'],
    causes: ['Users were granted `Modify` (which includes **`Delete` on the parent folder itself**!) on top-level root folders instead of `Subfolders and files only`!'],
    steps: ['FIRST search sibling folders (`Get-ChildItem -Directory -Recurse -Filter "2026-Active"`)—95% of "vanished" share folders were accidentally drag-dropped into the folder right next to them! Move it back instantly.', 'Prevent forever: on Grade-1 top-level department folders, set Group permission to **`Read & Execute` (`This folder, subfolders and files`)** + **`Modify` (`Subfolders and files ONLY`)** so nobody can ever delete, rename, or drag the root folder itself!'],
    cmds: [
      ['PowerShell', 'Get-ChildItem "D:\\Shares\\Projects" -Directory -Recurse -Filter "*2026*" -ErrorAction SilentlyContinue | Select FullName', 'Instantly locate accidentally dragged folder!']
    ],
    expected: 'Missing folder moved back in 5 seconds and root folder locked against future mouse-slip moves.',
    prevent: ['Always apply Modify to `Subfolders and files only` on structural top-level shared folders'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['accidental drag and drop shared folder', 'prevent moving root folder ntfs', 'subfolders and files only']
  },
  {
    id: 'FSP-009',
    title: 'DFS Namespace Referral Pointing Clients to Remote WAN File Server Instead of Local Site Target',
    category: 'File Sharing & Permissions',
    desc: 'London users opening `\\\\corp.local\\dfs\\Software` pull gigabytes slowly across the WAN from New York instead of their local London DFS target.',
    symptoms: ['Slow DFS transfers; Explorer DFS tab shows remote WAN server marked Active'],
    causes: ['Client IPv4 subnet missing from AD Sites & Services, OR DFS Namespace Referral Ordering set to random/wrong cost'],
    steps: ['Right-click the folder via `\\\\corp.local\\dfs\\Software` > **Properties > DFS** tab to see which Referral Target is currently `Active`!', 'Verify client subnet is bound to `Site-London` in AD Sites & Services and set DFS Namespace Ordering Method to **Lowest cost** (or *Exclude targets outside of client’s site* if desired), then flush DFS referral cache with `dfsutil cache referral flush`.'],
    cmds: [
      ['CMD', 'dfsutil /pktinfo', 'View active DFS referral server and site cache on client'],
      ['CMD', 'dfsutil cache referral flush', 'Flush client DFS referral cache']
    ],
    expected: 'Clients bind automatically to their local site DFS folder target at LAN Gigabit speeds.',
    prevent: ['Audit AD Sites & Services subnet mappings whenever new VLANs roll out'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['dfs hitting wrong server', 'dfsutil pktinfo', 'dfs referral flush']
  },
  {
    id: 'FSP-010',
    title: 'Linux NFS Share `Permission Denied` or `nobody:nogroup` Ownership (`root_squash`)',
    category: 'File Sharing & Permissions',
    desc: 'Root on Linux App Server mounts NFS `/mnt/shared`, but `mkdir` or `chown` fails with `Permission denied` or files show owned by `65534 / nobody`.',
    symptoms: ['root on NFS client gets Permission denied writing to share', 'ls -la shows nobody:nogroup'],
    causes: ['NFS exports default to **`root_squash`** (mapping client UID `0` to anonymous `nfsnobody` `65534` for security!), or NFSv4 `idmapd` Domain mismatch'],
    steps: ['Do NOT blindly enable `no_root_squash` (major privilege escalation risk if a client VM is compromised!).', 'Instead, chown the exported directory **directly on the NFS Server itself** to the matching service UID/GID (e.g., `uid=1001`) so the non-root app user writes cleanly!', 'For NFSv4 `nobody` display issues, verify `/etc/idmapd.conf` `Domain =` matches on server and client.'],
    cmds: [
      ['Bash', '# On NFS Server:\nexportfs -v', 'Inspect active NFS export options (root_squash, rw, sync)'],
      ['Bash', 'nfsstat -m', 'Inspect mounted NFS version and flags on client']
    ],
    warn: 'Avoid `no_root_squash` in production—anyone with root on a dev client can drop setuid-root binaries onto the NFS share.',
    expected: 'Matching service UID/GID reads and writes cleanly across NFSv4 with `root_squash` intact.',
    prevent: ['Synchronize service UIDs/GIDs across Linux hosts via Ansible/SSSD'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['nfs permission denied root', 'root_squash', 'nobody nogroup nfs4']
  },
  {
    id: 'FSP-011',
    title: 'Linux Samba (`smbd`) Share Connects But Returns `Permission Denied` on RHEL/Rocky',
    category: 'File Sharing & Permissions',
    desc: 'Windows user authenticates to Linux Samba share, sees the share name, but opening it throws `You do not have permission to access \\\\linuxsrv\\data`.',
    symptoms: ['chmod 775 and smb.conf valid users are both right, yet Samba still returns Access Denied!'],
    causes: ['**SELinux** blocks `smbd` from reading arbitrary directories like `/data` unless labeled `samba_share_t`!'],
    steps: ['Check SELinux context with `ls -ldZ /data`.', 'Apply the persistent `samba_share_t` SELinux file context using `semanage fcontext` + `restorecon` (keeps SELinux Enforcing safely!).'],
    cmds: [
      ['Bash', 'ls -ldZ /srv/samba/data', 'Check current SELinux label on shared directory'],
      ['Bash', 'sudo semanage fcontext -a -t samba_share_t "/srv/samba/data(/.*)?" && sudo restorecon -Rv /srv/samba/data', 'Label folder for Samba under SELinux Enforcing'],
      ['Bash', 'testparm -s', 'Validate /etc/samba/smb.conf syntax']
    ],
    expected: 'Samba share opens immediately with SELinux remaining strictly Enforcing.',
    prevent: ['Always check `ls -Z` and `ausearch -m avc` first on RHEL/Rocky file shares'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['samba permission denied selinux', 'samba_share_t', 'testparm']
  },
  {
    id: 'FSP-012',
    title: 'FSRM Storage Quota Blocking Saves Despite Physical Drive Having 2 TB Free',
    category: 'File Sharing & Permissions',
    desc: 'User gets `There is not enough space on H:` saving a 10 MB PDF even though the File Server `D:` volume has 2 TB free!',
    symptoms: ['Explorer shows user mapped H: drive as 4.99 GB / 5.00 GB while physical server disk has 2 TB free'],
    causes: ['**File Server Resource Manager (FSRM)** directory Hard Quota (e.g., 5 GB Home Folder cap) reached on that specific user subfolder!'],
    steps: ['Open **File Server Resource Manager (`fsrm.msc`) > Quota Management > Quotas** (or run `Get-FsrmQuota`) to check usage on that folder.', 'Have the user move personal `.mp4`/ISOs out or clean temp files, or raise the quota template if legitimate business role requires higher capacity.'],
    cmds: [
      ['PowerShell', 'Get-FsrmQuota | Where Usage -gt ($_.Size * 0.9) | Select Path, @{N="SizeGB";E={$_.Size/1GB}}, @{N="UsedGB";E={[math]::Round($_.Usage/1GB,2)}}', 'List folders hitting >90% FSRM Hard Quota']
    ],
    expected: 'Quota threshold identified immediately without wasting time checking physical RAID arrays.',
    prevent: ['Configure 85% email warning notifications on FSRM Quotas so users clean up before hitting 100%'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['not enough space mapped drive', 'fsrm quota', 'get-fsrmquota']
  },
  {
    id: 'FSP-013',
    title: 'Hardened UNC Paths (`\\\\*\\SYSVOL`) Breaking Custom Non-AD File Share With `0x80004005`',
    category: 'File Sharing & Permissions',
    errorCode: '0x80004005',
    desc: 'After security baseline deployment, connecting to a legacy NetApp/Samba filer by CNAME alias (`\\\\files\\data`) fails with `0x80004005`.',
    symptoms: ['Connecting by true hostname `\\\\nas01.corp.local\\data` works, CNAME alias `\\\\files.corp.local\\data` fails!'],
    causes: ['Kerberos SPN (`HOST/files.corp.local` / `cifs/files.corp.local`) missing on the NAS/Server AD computer object, causing Mutual Authentication (`RequireMutualAuthentication=1` in Hardened UNC Paths) to reject NTLM fallback!'],
    steps: ['Register the CNAME alias SPN onto the File Server / NAS AD computer object using `setspn -S` so **Kerberos Mutual Authentication** succeeds cleanly on the alias!'],
    cmds: [
      ['CMD', 'setspn -S HOST/files.corp.local FS01 && setspn -S HOST/files FS01', 'Register CNAME alias SPNs on File Server computer account']
    ],
    expected: 'Clients authenticate to `\\\\files.corp.local` via strong Kerberos instead of insecure NTLM.',
    prevent: ['Always use `setspn -S` (checks duplicates first!) whenever adding DNS CNAME aliases for Windows File/SQL servers'],
    diff: 'Advanced',
    time: '10 minutes',
    tags: ['smb cname alias fails', '0x80004005 smb', 'setspn -s host', 'hardened unc paths']
  },

  // ================= 25. User Account & Login Issues (13 issues) =================
  {
    id: 'USR-001',
    title: 'Windows Signed In With a Temporary Profile (`We Cant Sign In to Your Account`)',
    category: 'User Account & Login Issues',
    desc: 'User logs into Windows and panics because all Desktop files and browser bookmarks appear gone (`C:\\Users\\TEMP` loaded!).',
    symptoms: ['Toast: We cant sign in to your account', 'whoami /user or echo %USERPROFILE% shows C:\\Users\\TEMP'],
    causes: ['`ProfileList` registry key renamed user SID to `<SID>.bak` with `State = 0x8000` after locked `NTUSER.DAT` or AV hold'],
    steps: ['**REASSURE USER IMMEDIATELY**: their real files are still sitting untouched inside `C:\\Users\\<username>`—tell them **NOT to save new work onto the `TEMP` desktop** (which wipes on logoff)!', 'Sign out of the user session, log in as **Local Admin**, open `regedit` to `HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\ProfileList`!', 'Find the user SID key ending in **`.bak`**: if a duplicate non-`.bak` key points to `C:\\Users\\TEMP`, rename non-`.bak` to `.old`, remove `.bak` from the real key pointing to `C:\\Users\\<username>`, set `State = 0` and `RefCount = 0`, and reboot!'],
    cmds: [
      ['PowerShell', 'Get-ChildItem "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\ProfileList" | Get-ItemProperty | Select PSChildName, ProfileImagePath, State', 'Spot .bak SID key in ProfileList registry']
    ],
    warn: 'Never save files inside a `C:\\Users\\TEMP` session—Windows deletes `TEMP` automatically upon sign-out!',
    expected: 'User logs back into their real `C:\\Users\\<username>` profile with 100% of files and settings intact.',
    prevent: ['Keep >=10 GB free disk space on C: (0 MB free corrupts NTUSER.DAT saves on logoff!)'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['we cant sign in to your account', 'temporary profile', 'profilelist .bak', 'c users temp']
  },
  {
    id: 'USR-002',
    title: 'User Profile Service Failed the Sign-In (`User Profile Cannot Be Loaded` on First Login)',
    category: 'User Account & Login Issues',
    desc: 'Brand-new user logging into a shared PC for the very first time gets `The User Profile Service service failed the sign-in. User profile cannot be loaded`.',
    symptoms: ['Existing users can log into the PC, ANY brand-new user fails immediately!'],
    causes: ['Corrupted or bloated permissions/files inside the hidden template folder **`C:\\Users\\Default`** (e.g., locked OneDrive/WebView file left in Default profile during sysprep)!'],
    steps: ['Check Application Event Log **Event ID 1509 / 1500 (`User Profile Service`)**—it prints the exact file inside `C:\\Users\\Default` that failed to copy!', 'Remove the locked temporary cache file inside `C:\\Users\\Default\\AppData\\Local` (or restore clean `C:\\Users\\Default` ACLs from a healthy same-build Windows 11 PC), delete any half-created `C:\\Users\\<newuser>` + `ProfileList` SID, and test login.'],
    cmds: [
      ['PowerShell', 'Get-WinEvent -FilterHashtable @{LogName="Application"; ProviderName="Microsoft-Windows-User Profiles Service"} -MaxEvents 10 | Select TimeCreated, Id, Message', 'Identify exact file blocking Default Profile copy']
    ],
    expected: 'New domain users provision clean profiles in <10 seconds on shared workstations.',
    prevent: ['Never manually copy a live logged-in user folder over `C:\\Users\\Default`'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['user profile service failed the sign-in', 'user profile cannot be loaded', 'c users default', 'event 1509']
  },
  {
    id: 'USR-003',
    title: 'Windows Hello PIN Not Available (`Something Happened and Your PIN Isnt Available` `0x80090027` / `Ngc` Corrupt)',
    category: 'User Account & Login Issues',
    errorCode: '0x80090027',
    desc: 'Laptop lock screen rejects Windows Hello Fingerprint/Face and says `Something happened and your PIN isnt available. Click to set up your PIN again`.',
    symptoms: ['PIN unavailable at lock screen; clicking Set up my PIN loops back to lock screen!'],
    causes: ['Corrupted local TPM-backed **`Ngc`** Windows Hello key container after motherboard swap or TPM reset'],
    steps: ['Click **Sign-in options** (key icon) beneath the prompt and sign in using **Password** instead of PIN!', 'Once on the desktop, open an **Elevated Command Prompt**, take ownership and clear the corrupted `C:\\Windows\\ServiceProfiles\\LocalService\\AppData\\Local\\Microsoft\\Ngc` container, then set up a fresh Windows Hello PIN in Settings > Accounts > Sign-in options!'],
    cmds: [
      ['CMD', 'takeown /f C:\\Windows\\ServiceProfiles\\LocalService\\AppData\\Local\\Microsoft\\Ngc /r /d y\nicacls C:\\Windows\\ServiceProfiles\\LocalService\\AppData\\Local\\Microsoft\\Ngc /grant administrators:F /t\nrd /s /q C:\\Windows\\ServiceProfiles\\LocalService\\AppData\\Local\\Microsoft\\Ngc', 'Reset corrupted Windows Hello Ngc container (recreated automatically)']
    ],
    warn: 'Ensure the user knows their AD/Entra password (or is on corporate network/VPN) before clearing `Ngc`.',
    expected: 'Windows recreates a clean TPM `Ngc` container and fresh PIN + Biometrics enroll immediately.',
    prevent: ['Keep Password sign-in provider enabled alongside Windows Hello for emergency fallback after motherboard RMA'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['something happened and your pin isnt available', 'ngc folder reset', '0x80090027', 'windows hello broken']
  },
  {
    id: 'USR-004',
    title: 'Remote Laptop Cannot Sign In With Newly Reset AD Password (`We Cant Sign You In With This Credential`)',
    category: 'User Account & Login Issues',
    desc: 'Helpdesk reset a remote home-worker’s forgotten AD password, yet their laptop at home rejects the NEW password and says domain isn’t available!',
    symptoms: ['New password works in Webmail/OWA immediately, fails at Windows laptop lock screen at home!'],
    causes: ['Workstation is off corporate LAN/VPN at the lock screen, so Windows only knows the **OLD cached NTLM verifier** until it achieves Line-of-Sight to a Domain Controller!'],
    steps: ['Option 1: If **Pre-Logon VPN** (Always On VPN Device Tunnel / AnyConnect Start Before Logon / FortiClient Pre-Logon) is installed, click the **Network / VPN Sign-In** icon on the bottom-right of the Windows lock screen FIRST!', 'Option 2: If user remembers their **OLD** password (or Windows Hello PIN), sign into Windows with the OLD cached password/PIN -> connect VPN -> press **`Ctrl + Alt + Del` -> Lock -> Unlock** with the **NEW** password (instantly updates local cache!)!'],
    cmds: [
      ['CMD', '# Once connected to VPN, running klist or Lock/Unlock updates cached verifier:\nrunas /u:CORP\\jsmith cmd.exe', 'Update local cached AD credentials immediately over VPN without rebooting!']
    ],
    expected: 'Local cached domain credential updates over VPN and matches new AD password.',
    prevent: ['Deploy Pre-Logon Device VPN or cloud-native Entra ID Joined laptops for 100% remote teams'],
    diff: 'Beginner',
    time: '5-10 minutes',
    tags: ['new password not working remote laptop', 'cached credentials vpn', 'lock unlock update password']
  },
  {
    id: 'USR-005',
    title: 'Logon Denied: `Your Account Is Configured to Prevent You From Using This PC`',
    category: 'User Account & Login Issues',
    desc: 'Valid active AD user gets `Your account is configured to prevent you from using this PC` when signing into a new laptop.',
    symptoms: ['Password is correct and unlocked, login blocked on this specific workstation'],
    causes: ['AD user attribute **`LogonWorkstations`** (`Log On To...` button in ADUC > Account tab) restricts the user to their old workstation NetBIOS name!', 'Or GPO `Deny log on locally`'],
    steps: ['Check the user `LogonWorkstations` attribute in Active Directory!', 'Either append the new workstation hostname to `LogonWorkstations` or clear it (`Allow All Computers`) if machine restriction was legacy.', 'Run `klist purge` / retry login.'],
    cmds: [
      ['PowerShell', 'Get-ADUser -Identity jsmith -Properties LogonWorkstations, LogonHours | Select Name, LogonWorkstations', 'Inspect AD Log On To machine restrictions']
    ],
    expected: 'User logs into their new workstation cleanly.',
    prevent: ['Avoid hardcoding `LogonWorkstations` on regular staff accounts—use Tiered Admin Authentication Policies for privileged accounts instead'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['prevent you from using this pc', 'logonworkstations', 'log on to ad']
  },
  {
    id: 'USR-006',
    title: 'Windows Credential Manager Prompting Repeatedly for Old Network Share / Proxy Password',
    category: 'User Account & Login Issues',
    desc: 'After 90-day password change, user gets annoying credential popups and AD lockouts because Credential Manager holds old saved entries.',
    symptoms: ['Repeated Windows Security credential prompts', 'Account locks out 15 min after password rotation'],
    causes: ['Static saved entries in Windows Credential Manager (`Vault`) overriding current Kerberos logon ticket'],
    steps: ['List all saved entries in Windows Credential Manager via `cmdkey /list` (or Control Panel > Credential Manager > Windows Credentials).', 'Delete stale domain/SMB/Office entries (`cmdkey /delete:<target>`) so Windows seamlessly uses the user live SSO Kerberos ticket instead!'],
    cmds: [
      ['CMD', 'cmdkey /list', 'List all stored credentials in Windows Vault'],
      ['CMD', 'cmdkey /delete:filesrv01.corp.local', 'Remove stale hardcoded SMB credential']
    ],
    expected: 'Stale password source removed and SSO works silently.',
    prevent: ['Adopt NIST 800-63B guidance: strong MFA + breached-password ban WITHOUT forced 60-day arbitrary password rotations!'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['credential manager old password', 'cmdkey /list', 'cmdkey /delete']
  },
  {
    id: 'USR-007',
    title: 'Local Administrator Account Locked Out or Password Unknown (`LAPS` vs Offline Recovery)',
    category: 'User Account & Login Issues',
    desc: 'Domain trust broke AND technician needs Local Administrator login, but LAPS was never deployed or password fails.',
    symptoms: ['Both Domain login and Local Admin login fail on unencrypted or recovery-unlocked PC'],
    causes: ['Built-in `Administrator` account is Disabled (`Account active: No`) by Windows default, or LAPS rotated since last check'],
    steps: ['FIRST check **Active Directory / Microsoft Entra LAPS** blade (including LAPS Password History if it just rotated!).', 'If the PC is managed in **Intune** or **RMM** (still online to internet even when AD trust is broken!): push a 1-line `SYSTEM` remediation script creating/enabling a temporary break-glass local admin account remotely in 60 seconds!'],
    cmds: [
      ['PowerShell', '# Via RMM / Intune SYSTEM Remediation:\nEnable-LocalUser -Name "LocalAdmin"', 'Re-enable managed local admin via RMM SYSTEM channel'],
      ['PowerShell', 'Get-LapsADPassword -Identity "PC-SALES04" -AsPlainText', 'Retrieve current LAPS password from AD']
    ],
    expected: 'Technician logs in locally, repairs AD secure channel (`Test-ComputerSecureChannel -Repair`), and rotates LAPS immediately.',
    prevent: ['Verify 100% LAPS coverage across every domain and Entra-joined workstation'],
    diff: 'Intermediate',
    time: '10 minutes',
    tags: ['local admin password unknown', 'get-lapsadpassword', 'enable-localuser']
  },
  {
    id: 'USR-008',
    title: 'Hybrid Entra ID Join Stuck (`AzureAdPrt : NO` Breaking Seamless SSO)',
    category: 'User Account & Login Issues',
    desc: 'Domain-joined Windows 11 PC prompts constantly for M365 web logins because Primary Refresh Token (`AzureAdPrt`) is missing.',
    symptoms: ['Edge/Office asks for credentials every reboot', 'dsregcmd /status shows AzureAdJoined : NO or AzureAdPrt : NO'],
    causes: ['Computer OU excluded from Entra Connect Sync!', 'Firewall blocking `login.microsoftonline.com` / `device.login.microsoftonline.com` as `SYSTEM`', 'SCP missing in AD'],
    steps: ['Run `dsregcmd /status` from a **non-elevated** user prompt (PRT is per-user—running elevated as Admin checks the Admin account PRT, not the user!).', 'Verify the Computer object actually synced to Entra ID (`Workplace Join` task runs after Entra Connect syncs the Computer `userCertificate` attribute!).', 'Trigger `dsregcmd /join` as Admin if `AzureAdJoined : NO`, wait for next 30-min Entra Connect delta sync, then lock/unlock screen to acquire `AzureAdPrt : YES`!'],
    cmds: [
      ['CMD', 'dsregcmd /status', 'Run as STANDARD USER to inspect AzureAdJoined & AzureAdPrt'],
      ['PowerShell', 'Get-WinEvent -LogName "Microsoft-Windows-User Device Registration/Admin" -MaxEvents 10 | Select TimeCreated, Id, Message', 'Read exact Hybrid Join error']
    ],
    warn: 'Remember `dsregcmd /leave` breaks existing Conditional Access compliance until re-synced—check `User Device Registration/Admin` logs BEFORE running `/leave`!',
    expected: '`AzureAdJoined : YES` and `AzureAdPrt : YES` enable silent single sign-on across M365.',
    prevent: ['Ensure new Workstation OUs are checked inside Entra Connect Domain/OU Filtering'],
    diff: 'Advanced',
    time: '15-20 minutes',
    tags: ['azureadprt no', 'dsregcmd status', 'hybrid azure ad join failed']
  },
  {
    id: 'USR-009',
    title: 'Linux User Locked Out of `sudo` (`user is not in the sudoers file` or `faillock` PAM Lockout)',
    category: 'User Account & Login Issues',
    desc: 'Linux sysadmin account rejects valid password after 3 typos (`pam_faillock`), or new admin lacks `sudo`/`wheel` group.',
    symptoms: ['SSH or sudo rejects known-correct password after failed attempts', 'Or reports user is not in the sudoers file'],
    causes: ['`pam_faillock` (Ubuntu 22.04+ / RHEL 8/9) temporarily locked account after failed attempts', 'User added on Ubuntu with `useradd` without `-G sudo` (or `-G wheel` on RHEL)'],
    steps: ['From root/another admin session: check and reset PAM faillock tally using **`faillock --user <username> --reset`**!', 'Grant sudo cleanly by adding user to the OS admin group (`usermod -aG sudo <user>` on Debian/Ubuntu; `usermod -aG wheel <user>` on RHEL/Rocky)—and ALWAYS edit custom `/etc/sudoers.d/` files strictly via **`visudo`** (validates syntax so you never brick sudo!)!'],
    cmds: [
      ['Bash', 'sudo faillock --user jsmith --reset', 'Unlock PAM faillock counter on Linux'],
      ['Bash', 'sudo usermod -aG sudo jsmith # (or wheel on RHEL)', 'Add user to sudo group (remember -a append flag!)']
    ],
    warn: 'NEVER run `usermod -G sudo user` WITHOUT `-a` (`-aG`)—omitting `-a` strips the user from all their other supplementary groups (like `docker` or `www-data`)!',
    expected: 'PAM lockout clears and user executes `sudo` cleanly.',
    prevent: ['Always edit sudoers drop-ins via `sudo visudo -f /etc/sudoers.d/admins`'],
    diff: 'Beginner',
    time: '5 minutes',
    tags: ['faillock reset', 'not in the sudoers file', 'usermod -ag sudo', 'visudo']
  },
  {
    id: 'USR-010',
    title: 'Name Change / Marriage Rename Breaking AD, UPN, Email Alias, and OneDrive URL',
    category: 'User Account & Login Issues',
    desc: 'Employee changes last name and either stops receiving emails sent to their previous address or loses OneDrive shortcuts.',
    symptoms: ['External clients emailing previous `jane.doe@company.com` bounce after changing to `jane.smith@company.com`!'],
    causes: ['Admin overwrote primary SMTP instead of keeping old email as a secondary `smtp:` proxyAddress alias!'],
    steps: ['1. Update DisplayName, Surname, `sAMAccountName`, and `UserPrincipalName` (`jane.smith@company.com`).', '2. In `proxyAddresses`: set **`SMTP:jane.smith@company.com`** (uppercase `SMTP:` = Primary Reply-From) AND keep **`smtp:jane.doe@company.com`** (lowercase `smtp:` = Secondary Alias so all historical contacts still deliver forever!).', '3. Have user sign out/in of Office & OneDrive once Entra Connect syncs!'],
    cmds: [
      ['PowerShell', 'Set-ADUser jdoe -SamAccountName "jsmith" -UserPrincipalName "jane.smith@company.com" -Add @{proxyAddresses="SMTP:jane.smith@company.com","smtp:jane.doe@company.com"}', 'Update UPN while preserving previous email alias']
    ],
    expected: 'User logs in with new name while 100% of emails to both new and previous addresses arrive seamlessly.',
    prevent: ['Follow a standardized Name-Change Checklist covering AD, proxyAddresses, HRIS, and SSO apps using immutable `ObjectGUID`'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['employee name change ad', 'keep old email alias', 'smtp uppercase lowercase']
  },
  {
    id: 'USR-011',
    title: 'UAC Yes Button Missing / Greyed Out (`To Continue, Type an Admin Username and Password` With Zero Text Boxes!)',
    category: 'User Account & Login Issues',
    desc: 'User or technician triggers UAC elevation and the UAC prompt displays **only a `No` button**—no username box, no password box, and `Yes` is greyed out!',
    symptoms: ['UAC popup has only No button—completely impossible to type admin password!'],
    causes: ['ZERO active enabled accounts exist inside the local `BUILTIN\\Administrators` group (and PC is offline from domain)!'],
    steps: ['If PC is domain-joined: plug into **corporate LAN** so UAC detects Domain Controllers and displays the Domain Admin credential boxes immediately!', 'If workgroup PC where someone accidentally removed themselves from `Administrators`: boot into **Windows Safe Mode** (`Shift + Restart > Troubleshoot > Startup Settings > 4`)—Windows automatically un-blocks the built-in `Administrator` account ONLY inside Safe Mode so you can re-add an active Local Admin!'],
    cmds: [
      ['CMD', '# Inside Safe Mode elevated CMD:\nnet localgroup Administrators LocalAdmin /add && net user LocalAdmin /active:yes', 'Restore active Local Administrator from Safe Mode']
    ],
    expected: 'UAC dialog displays Username/Password input fields and `Yes` button normally.',
    prevent: ['Enforce Windows LAPS so at least one active managed local administrator always exists'],
    diff: 'Intermediate',
    time: '15 minutes',
    tags: ['uac yes button missing', 'uac only no button', 'no admin password box uac']
  },
  {
    id: 'USR-012',
    title: 'Smart Card / YubiKey PIV Domain Logon Failing (`No Valid Certificates Were Found on This Smart Card`)',
    category: 'User Account & Login Issues',
    desc: 'Privileged admin inserts YubiKey PIV / Smart Card at Windows logon and gets `No valid certificates were found` or `Untrusted KDC certificate`.',
    symptoms: ['YubiKey blinks, PIN accepted, then Windows rejects KDC or Smart Card Logon EKU'],
    causes: ['Domain Controller lacks a valid **Kerberos Authentication / Domain Controller Authentication** certificate trusted in `NTAuthCertificates`!', 'Or YubiKey cert missing `Smart Card Logon (1.3.6.1.4.1.311.20.2.2)` EKU / strong `altSecurityIdentities` mapping (KB5014754)!'],
    steps: ['Verify Enterprise Issuing CA is published inside Active Directory **`NTAuthCertificates`** store (`certutil -viewstore "ldap:///CN=NTAuthCertificates..."`).', 'Confirm KB5014754 Strong Certificate Mapping (`SAN Principal Name` + SID extension `1.3.6.1.4.1.311.25.2` or `X509:<I>...<SR>...` in `altSecurityIdentities`) is present on the user account and every DC has a valid KDC certificate!'],
    cmds: [
      ['CMD', 'certutil -scinfo', 'Run Smart Card diagnostic check on client reader & cert chain']
    ],
    expected: '`certutil -scinfo` validates full chain + KDC trust and YubiKey PIV logs in cleanly.',
    prevent: ['Monitor KB5014754 Event ID 39/41 KDC strong certificate mapping logs on Domain Controllers'],
    diff: 'Advanced',
    time: '20-30 minutes',
    tags: ['smart card logon failed', 'yubikey piv windows login', 'certutil -scinfo', 'kb5014754']
  },
  {
    id: 'USR-013',
    title: 'Service / Scheduled Task Failing After Password Rotation (`Logon Failure: The User Has Not Been Granted the Requested Logon Type` `Event 4625` Type 4/5)',
    category: 'User Account & Login Issues',
    errorCode: '0xC000015B',
    desc: 'Windows Service or Scheduled Task fails to start with `Error 1069: The service did not start due to a logon failure` even though the password is 100% right!',
    symptoms: ['Password tested valid via runas, yet Service (Type 5) or Task (Type 4) fails with 1069 / 0xC000015B'],
    causes: ['Account missing `SeServiceLogonRight` (*Log on as a service*) or `SeBatchLogonRight` (*Log on as a batch job*) overwritten by hardened Server GPO, OR exists in `Deny log on locally / as a service`!'],
    steps: ['Check Security Event ID **4625** `Logon Type` (`4` = Batch/Task, `5` = Service) and `Status = 0xC000015B`!', 'Add the service account (or better yet, migrate to a **Group Managed Service Account `gMSA$`**!) into the Server OU GPO **`Log on as a service` / `Log on as a batch job`** (note: adding via GUI `services.msc` grants it locally once, UNTIL a GPO overwrites `User Rights Assignment` 90 minutes later!).'],
    cmds: [
      ['CMD', 'secedit /export /cfg C:\\temp\\secpol.inf && findstr /i "SeServiceLogonRight SeBatchLogonRight" C:\\temp\\secpol.inf', 'Inspect effective User Rights Assignment SIDs']
    ],
    expected: 'Service / Scheduled Task starts cleanly and survives every `gpupdate` cycle.',
    prevent: ['Migrate legacy password-based service accounts to AD Group Managed Service Accounts (`gMSA`)'],
    diff: 'Intermediate',
    time: '10-15 minutes',
    tags: ['error 1069 logon failure', '0xc000015b', 'log on as a service gpo', 'seservicelogoonright']
  }
];

export const ISSUES_PART_5 = expandIssues(SEEDS_PART_5);
