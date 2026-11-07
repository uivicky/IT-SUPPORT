export interface SimulatorOption {
  id: string;
  label: string;
  isCorrect: boolean;
  feedback: string;
}

export interface SimulatorStep {
  stepNumber: number;
  prompt: string;
  diagnosticOutput?: string;
  options: SimulatorOption[];
}

export interface SimulatorScenario {
  id: string;
  ticketNumber: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  callerName: string;
  callerRole: string;
  problemReport: string;
  environmentClue: string;
  relatedCategory: string;
  verificationCommand: string;
  resolutionSummary: string;
  steps: [SimulatorStep, SimulatorStep];
}

export const SIMULATOR_SCENARIOS: SimulatorScenario[] = [
  {
    id: 'no-internet',
    ticketNumber: 'INC-1041',
    title: 'No Internet — WiFi Connected With Warning Icon',
    difficulty: 'Beginner',
    callerName: 'Maya Patel',
    callerRole: 'Marketing Coordinator',
    problemReport:
      'My laptop is connected to Office-WiFi with full signal bars, yet Chrome says "No Internet" and Slack will not load.',
    environmentClue: 'Windows 11 laptop · Other coworkers in the same room HAVE working internet.',
    relatedCategory: 'WiFi & LAN',
    verificationCommand: 'ipconfig /renew && ping 8.8.8.8',
    resolutionSummary:
      'Isolated the problem to Maya’s laptop (since coworkers were online), spotted a 169.254.x.x APIPA address in ipconfig, and renewed a valid DHCP lease.',
    steps: [
      {
        stepNumber: 1,
        prompt:
          'Other coworkers on the same WiFi are online, so the office ISP is healthy. What is your BEST first diagnostic step on Maya’s laptop?',
        options: [
          {
            id: 'a',
            label: 'Unplug the main office router in the server closet so everyone reboots',
            isCorrect: false,
            feedback:
              'Not recommended! Coworkers are actively working online—rebooting core office hardware for a single user causes an unnecessary outage.',
          },
          {
            id: 'b',
            label: 'Open Command Prompt and run `ipconfig` to inspect her IPv4 address & Default Gateway',
            isCorrect: true,
            feedback:
              'Spot on! Checking Layer 3 IP configuration first takes 5 seconds and tells you whether the laptop actually received a valid IP lease.',
          },
          {
            id: 'c',
            label: 'Reinstall Windows 11 from a USB stick',
            isCorrect: false,
            feedback:
              'Way too destructive! Always run basic non-destructive network checks before touching the operating system.',
          },
          {
            id: 'd',
            label: 'Replace the laptop LCD screen cable',
            isCorrect: false,
            feedback:
              'Her display is working fine—this is a network connectivity problem, not display hardware.',
          },
        ],
      },
      {
        stepNumber: 2,
        prompt:
          '`ipconfig` reveals IPv4 Address: `169.254.88.14` and Default Gateway: `(blank)`. How do you fix this cleanly?',
        diagnosticOutput:
          'Wireless LAN adapter Wi-Fi:\n   Autoconfiguration IPv4 Address. . : 169.254.88.14\n   Subnet Mask . . . . . . . . . . . : 255.255.0.0\n   Default Gateway . . . . . . . . . : ',
        options: [
          {
            id: 'a',
            label: 'Run `ipconfig /release` followed by `ipconfig /renew` (and reconnect WiFi if needed) to request a fresh DHCP IP',
            isCorrect: true,
            feedback:
              'Correct! `169.254.x.x` is an APIPA self-assigned address when DHCP timed out. Renewing DHCP obtains `192.168.10.52` with a valid gateway and restores internet immediately.',
          },
          {
            id: 'b',
            label: 'Clear Chrome browsing history only',
            isCorrect: false,
            feedback:
              'Browser cache cannot fix a missing Default Gateway or a 169.254.x.x OS network address.',
          },
          {
            id: 'c',
            label: 'Manually type `192.168.10.1` (the router’s own IP) as Maya’s laptop IP',
            isCorrect: false,
            feedback:
              'Dangerous! Assigning the router’s IP to a laptop creates an IP address conflict that knocks the whole floor offline.',
          },
        ],
      },
    ],
  },
  {
    id: 'dns-failure',
    ticketNumber: 'INC-1042',
    title: 'DNS Failure — Ping Works By IP, Websites Fail By Name',
    difficulty: 'Beginner',
    callerName: 'Liam Chen',
    callerRole: 'Sales Analyst',
    problemReport:
      'Every website shows `DNS_PROBE_FINISHED_NXDOMAIN`, even though my VPN/Zoom call that was already connected stayed alive!',
    environmentClue: 'Windows 11 · Static DNS was manually edited last week during home travel.',
    relatedCategory: 'DNS & DHCP',
    verificationCommand: 'ipconfig /flushdns && nslookup microsoft.com',
    resolutionSummary:
      'Verified IP routing worked with `ping 8.8.8.8`, identified a dead manual DNS server IP on the Wi-Fi adapter, reset DNS to automatic/1.1.1.1, and flushed the DNS cache.',
    steps: [
      {
        stepNumber: 1,
        prompt:
          'You suspect DNS (the internet phonebook) is failing while raw internet packets still work. Which quick command proves this hypothesis?',
        options: [
          {
            id: 'a',
            label: 'Run `ping 8.8.8.8` and compare it with `nslookup microsoft.com`',
            isCorrect: true,
            feedback:
              'Textbook troubleshooting! `ping 8.8.8.8` replies in 13ms (proving internet routing works), while `nslookup` times out against a dead DNS IP `10.99.0.53`.',
          },
          {
            id: 'b',
            label: 'Run `chkdsk C: /r` and wait 2 hours',
            isCorrect: false,
            feedback:
              '`chkdsk` scans hard disk sectors—it has nothing to do with `DNS_PROBE_FINISHED_NXDOMAIN`.',
          },
          {
            id: 'c',
            label: 'Buy a brand-new Wi-Fi 7 router',
            isCorrect: false,
            feedback:
              'Active Zoom media is still flowing through the router—hardware is completely fine.',
          },
        ],
      },
      {
        stepNumber: 2,
        prompt:
          '`nslookup` shows Liam’s Wi-Fi adapter is hardcoded to an old hotel DNS server `10.99.0.53` that doesn’t exist here. What fixes this?',
        diagnosticOutput:
          'DNS request timed out.\nServer:  UnKnown\nAddress:  10.99.0.53',
        options: [
          {
            id: 'a',
            label: 'Switch IPv4 DNS settings back to "Obtain DNS server address automatically" (or `1.1.1.1` / corporate DNS) and run `ipconfig /flushdns`',
            isCorrect: true,
            feedback:
              'Solved! Removing the stale static DNS IP lets DHCP assign the healthy DNS server, and `ipconfig /flushdns` clears negative cached lookups.',
          },
          {
            id: 'b',
            label: 'Disable Windows Firewall permanently',
            isCorrect: false,
            feedback:
              'Disabling the firewall leaves the laptop exposed and still sends DNS queries to the dead `10.99.0.53` IP.',
          },
          {
            id: 'c',
            label: 'Uninstall Google Chrome and Edge',
            isCorrect: false,
            feedback:
              'DNS settings live on the Windows network adapter, so reinstalling browsers won’t fix `nslookup`.',
          },
        ],
      },
    ],
  },
  {
    id: 'printer-offline',
    ticketNumber: 'INC-1043',
    title: 'Printer Offline — Queue Stuck on 3rd Floor',
    difficulty: 'Beginner',
    callerName: 'Sofia Rossi',
    callerRole: 'HR Operations',
    problemReport:
      'I clicked Print 6 times on an onboarding packet, nothing came out of the HP LaserJet, and Windows says "Printer Offline — 6 documents waiting".',
    environmentClue: 'HP LaserJet screen is awake and shows IP `192.168.20.85` · `ping 192.168.20.85` replies!',
    relatedCategory: 'Printer & Scanner',
    verificationCommand: 'Restart-Service Spooler -Force',
    resolutionSummary:
      'Confirmed the printer was reachable on TCP/IP, cleared corrupted `.SPL`/`.SHD` spooler files, restarted Print Spooler, and disabled SNMP Status Enabled on the Standard TCP/IP port.',
    steps: [
      {
        stepNumber: 1,
        prompt:
          '`ping 192.168.20.85` succeeds, so the printer is powered on and connected to the LAN! Why are Sofia’s 6 jobs stuck on her PC?',
        options: [
          {
            id: 'a',
            label: 'The local Windows Print Spooler queue has a hung job or false SNMP offline status',
            isCorrect: true,
            feedback:
              'Exactly! When the printer pings cleanly on the network, a stuck local Print Spooler service or SNMP status glitch on the PC is the #1 culprit.',
          },
          {
            id: 'b',
            label: 'The printer’s power cord is unplugged from the wall',
            isCorrect: false,
            feedback:
              'An unplugged printer could never show an awake LCD screen or reply to `ping 192.168.20.85`.',
          },
          {
            id: 'c',
            label: 'Her Microsoft 365 password expired',
            isCorrect: false,
            feedback:
              'Local LAN TCP/IP printing on port 9100 does not depend on cloud email passwords.',
          },
        ],
      },
      {
        stepNumber: 2,
        prompt:
          'How do you clear the jammed print queue and stop false "Offline" flags on that TCP/IP port?',
        diagnosticOutput:
          'Service: Spooler (Print Spooler) — Stuck processing 00004.SPL\nPort: IP_192.168.20.85 (SNMP Status Enabled: Checked)',
        options: [
          {
            id: 'a',
            label: 'Stop `Spooler` service, clear stuck files in `C:\\Windows\\System32\\spool\\PRINTERS`, start `Spooler`, and uncheck "SNMP Status Enabled" if false offline persists',
            isCorrect: true,
            feedback:
              'Clean resolution! Clearing orphaned spool files and restarting `Spooler` unblocks the queue, and disabling flaky SNMP status polling prevents false "Offline" banners.',
          },
          {
            id: 'b',
            label: 'Click Print 20 more times to push the stuck document through',
            isCorrect: false,
            feedback:
              'Adding more jobs behind a corrupted spool file just piles up 26 stuck documents!',
          },
          {
            id: 'c',
            label: 'Delete `C:\\Windows\\System32` entirely',
            isCorrect: false,
            feedback:
              'Never touch `System32` itself—only clear files inside the `spool\\PRINTERS` subfolder while Spooler is stopped.',
          },
        ],
      },
    ],
  },
  {
    id: 'outlook-not-opening',
    ticketNumber: 'INC-1044',
    title: 'Outlook Not Opening — Stuck on "Loading Profile"',
    difficulty: 'Intermediate',
    callerName: 'David Kim',
    callerRole: 'Senior Accountant',
    problemReport:
      'Classic Outlook freezes forever on the blue splash screen saying "Loading Profile..." even after I restarted my PC.',
    environmentClue: 'Outlook on the Web (OWA) works fine in Edge · User installed a 3rd-party PDF COM add-in yesterday.',
    relatedCategory: 'Outlook & Exchange',
    verificationCommand: 'outlook.exe /safe',
    resolutionSummary:
      'Verified mailbox health via Outlook on the Web, launched `outlook.exe /safe` to bypass faulty COM add-ins, disabled the crashing PDF add-in, and verified normal startup.',
    steps: [
      {
        stepNumber: 1,
        prompt:
          'Since Outlook on the Web works, David’s Exchange Online mailbox is healthy. What safe command isolates whether an add-in or navigation pane file is freezing desktop Outlook?',
        options: [
          {
            id: 'a',
            label: 'Press `Win + R` and run `outlook.exe /safe` to launch Outlook in Safe Mode without add-ins',
            isCorrect: true,
            feedback:
              'Spot on! `outlook.exe /safe` disables COM add-ins and custom toolbar extensions—Outlook opens in 2 seconds, proving an add-in caused the hang!',
          },
          {
            id: 'b',
            label: 'Delete David’s Microsoft 365 user account in Entra ID',
            isCorrect: false,
            feedback:
              'Whoa! Never delete a user’s cloud mailbox for a local desktop app crash—especially when webmail works.',
          },
          {
            id: 'c',
            label: 'Format the C: drive immediately',
            isCorrect: false,
            feedback:
              'Always isolate application-level faults (Safe Mode / new Outlook profile) before reimaging.',
          },
        ],
      },
      {
        stepNumber: 2,
        prompt:
          'Outlook opened immediately in Safe Mode! What do you do inside Outlook so normal startup works permanently?',
        diagnosticOutput:
          'Active COM Add-ins:\n  [x] AcrobatPDFMakerOfficeCOMAddin (Load time: HUNG)\n  [x] Microsoft Teams Meeting Add-in (Load time: 90ms)',
        options: [
          {
            id: 'a',
            label: 'Go to File → Options → Add-ins → COM Add-ins → Go, uncheck the hung 3rd-party PDF add-in, and reopen Outlook normally',
            isCorrect: true,
            feedback:
              'Ticket resolved! Disabling the crashing COM add-in lets Outlook open cleanly in normal mode while keeping all emails and Teams meetings intact.',
          },
          {
            id: 'b',
            label: 'Tell David to only run Safe Mode manually forever and close the ticket',
            isCorrect: false,
            feedback:
              'Safe Mode is a diagnostic step, not a permanent fix—fixing the offending COM add-in (or rebuilding the OST profile if corrupted) restores full features.',
          },
          {
            id: 'c',
            label: 'Block port 443 on the corporate firewall',
            isCorrect: false,
            feedback:
              'Blocking HTTPS port 443 would disconnect Exchange Online for the entire company!',
          },
        ],
      },
    ],
  },
  {
    id: 'domain-login-failure',
    ticketNumber: 'INC-1045',
    title: 'Domain Login Failure — Account Keeps Locking Out',
    difficulty: 'Intermediate',
    callerName: 'Jordan Smith',
    callerRole: 'Finance Manager',
    problemReport:
      'I changed my Active Directory password this morning. Every 15 minutes my account locks out again even when I am not touching my keyboard!',
    environmentClue: 'Hybrid AD environment · Jordan uses a Windows laptop AND corporate Wi-Fi / Mail on an iPhone.',
    relatedCategory: 'Active Directory',
    verificationCommand: 'Get-ADUser jsmith -Properties LockedOut,BadPwdCount | Unlock-ADAccount',
    resolutionSummary:
      'Inspected Event ID 4740 on the PDC Emulator to trace the lockout source to wireless RADIUS/mobile sync, updated saved credentials on Jordan’s phone + Credential Manager, and unlocked the AD account.',
    steps: [
      {
        stepNumber: 1,
        prompt:
          'Unlocking `jsmith` alone only lasts 15 minutes before locking again. How do you find WHICH device or service is sending the old password?',
        options: [
          {
            id: 'a',
            label: 'Check Security Event ID `4740` ("A user account was locked out") on the PDC Emulator Domain Controller to view the Caller Computer Name',
            isCorrect: true,
            feedback:
              'Senior-level move! Event ID `4740` records the exact source workstation, VPN gateway, or Wi-Fi RADIUS controller triggering the bad password count.',
          },
          {
            id: 'b',
            label: 'Turn off Active Directory account lockout policy for the whole company',
            isCorrect: false,
            feedback:
              'Major security violation! Disabling lockout policies exposes every employee account to brute-force password attacks.',
          },
          {
            id: 'c',
            label: 'Replace Jordan’s USB mouse',
            isCorrect: false,
            feedback:
              'Hardware peripherals cannot submit Kerberos/NTLM authentication attempts.',
          },
        ],
      },
      {
        stepNumber: 2,
        prompt:
          'Event ID `4740` points to `WLC-RADIUS-01` (Corporate Wi-Fi) and a disconnected RDP session on `FIN-JUMP-02`. How do you stop the lockouts for good?',
        diagnosticOutput:
          'Event ID: 4740\nAccount Name: jsmith\nCaller Computer Name: WLC-RADIUS-01 / FIN-JUMP-02',
        options: [
          {
            id: 'a',
            label: 'Update the saved Wi-Fi/Mail password on Jordan’s phone, sign out the stale RDP session on `FIN-JUMP-02`, clear stale Windows Credential Manager entries, then run `Unlock-ADAccount -Identity jsmith`',
            isCorrect: true,
            feedback:
              'Complete root-cause fix! Eliminating all background devices retrying the old password before unlocking stops the 15-minute lockout loop permanently.',
          },
          {
            id: 'b',
            label: 'Just click Unlock one more time and hope it stops on its own',
            isCorrect: false,
            feedback:
              'Phones and hung RDP sessions retry automatically in the background—without updating them, `jsmith` will lock again in minutes.',
          },
          {
            id: 'c',
            label: 'Rename the Active Directory domain',
            isCorrect: false,
            feedback:
              'Never touch forest/domain architecture for a single user’s cached credential issue.',
          },
        ],
      },
    ],
  },
  {
    id: 'slow-computer',
    ticketNumber: 'INC-1046',
    title: 'Slow Computer — 100% Disk & 96% RAM Usage After Boot',
    difficulty: 'Beginner',
    callerName: 'Elena Gomez',
    callerRole: 'Project Coordinator',
    problemReport:
      'My Windows laptop takes 4 minutes to open Excel or switch browser tabs. Everything feels frozen!',
    environmentClue: 'Windows 11 · 16 GB RAM · System Uptime in Task Manager says `28 days:14:22:09`.',
    relatedCategory: 'Windows 10 & Windows 11',
    verificationCommand: 'taskmgr /0 /startup',
    resolutionSummary:
      'Checked Task Manager Performance & Startup Apps, noticed 28-day uptime (Fast Startup prevented real kernel reboot) plus 14 heavy startup bloat apps, disabled unnecessary startup apps, and performed a clean Restart.',
    steps: [
      {
        stepNumber: 1,
        prompt:
          'Elena says "I shut down my laptop every night!", yet Task Manager CPU Uptime shows `28 days`. What do you inspect first?',
        options: [
          {
            id: 'a',
            label: 'Open Task Manager (`Ctrl + Shift + Esc`) to check which processes hog CPU/RAM/Disk and check Startup Apps',
            isCorrect: true,
            feedback:
              'Great instinct! Always measure CPU, Memory, and Disk bottlenecks in Task Manager before guessing—and remember Windows "Shut down" with Fast Startup hibernates the kernel instead of restarting!',
          },
          {
            id: 'b',
            label: 'Download a random "Free PC Speed Booster" app from an ad banner',
            isCorrect: false,
            feedback:
              'Never! "PC Cleaner/Booster" downloads are frequently adware/PUPs that make laptops slower and risk security.',
          },
          {
            id: 'c',
            label: 'Change desktop wallpaper to solid black',
            isCorrect: false,
            feedback:
              'A wallpaper won’t free 15.4 GB of leaked RAM or 14 heavy auto-launch apps.',
          },
        ],
      },
      {
        stepNumber: 2,
        prompt:
          'Task Manager shows 12 non-essential apps auto-launching at login and 47 leaked browser/updater processes after 28 days of uptime. What is the clean fix?',
        diagnosticOutput:
          'Memory: 15.4 / 16.0 GB (96%)\nCPU Uptime: 28:14:22:09\nHigh-Impact Startup Apps: 12 enabled',
        options: [
          {
            id: 'a',
            label: 'Disable non-essential Startup Apps in Task Manager, save open work, and click **Restart** (not Shut Down) to perform a full kernel reset',
            isCorrect: true,
            feedback:
              'Solved! Clicking **Restart** forces a true cold kernel reload (resetting uptime to `0:00:01:12`), and trimming Startup Apps drops idle RAM usage from 96% down to 29%.',
          },
          {
            id: 'b',
            label: 'End-task `csrss.exe` and `wininit.exe` in Task Manager',
            isCorrect: false,
            feedback:
              'Careful! Killing critical Windows system processes triggers an immediate Blue Screen of Death.',
          },
          {
            id: 'c',
            label: 'Close the laptop lid for 5 seconds',
            isCorrect: false,
            feedback:
              'Closing the lid only puts the laptop to sleep—every leaked process stays in RAM.',
          },
        ],
      },
    ],
  },
  {
    id: 'laptop-overheating',
    ticketNumber: 'INC-1047',
    title: 'Laptop Overheating — Loud Fan & Sudden Shutdowns on Calls',
    difficulty: 'Intermediate',
    callerName: 'Marcus Vance',
    callerRole: 'Product Designer',
    problemReport:
      'Whenever I share my screen on Teams while Figma is open, the laptop keyboard gets scorching hot, fans roar, and yesterday it powered off mid-meeting!',
    environmentClue: '2.5-year-old corporate ultrabook · Used on a plush fabric couch during WFH days · CPU hits 99°C.',
    relatedCategory: 'Laptop & Desktop Hardware',
    verificationCommand: 'Get-WinEvent -FilterHashtable @{LogName="System"; Id=41,6008} -MaxEvents 5',
    resolutionSummary:
      'Verified thermal throttling (99°C package temp, CPU throttled to 0.79 GHz), cleared thick dust buildup from heatsink fins with compressed air, updated BIOS/thermal drivers, and advised using a hard flat desk surface.',
    steps: [
      {
        stepNumber: 1,
        prompt:
          'CPU speed drops to `0.79 GHz` right before shutting off, and bottom vents feel blocked. What is happening inside the laptop?',
        options: [
          {
            id: 'a',
            label: 'Thermal throttling & emergency thermal trip caused by blocked intake vents (plush fabric + dust-clogged heatsink fins)',
            isCorrect: true,
            feedback:
              'Spot on! Soft couches seal bottom air intakes, and 2.5 years of dust mats the heatsink radiator—forcing the CPU to throttle to 0.79 GHz and emergency-off at ~100°C to prevent silicon damage.',
          },
          {
            id: 'b',
            label: 'A computer virus is physically heating the Wi-Fi antenna',
            isCorrect: false,
            feedback:
              'Video encoding + 3D canvas rendering naturally uses CPU/GPU watts; physical heat buildup to shutdown is an airflow/cooling transfer issue.',
          },
          {
            id: 'c',
            label: 'Put the laptop inside a freezer for 15 minutes',
            isCorrect: false,
            feedback:
              'Never put electronics in a freezer! Condensation forms water droplets on the motherboard and shorts circuits.',
          },
        ],
      },
      {
        stepNumber: 2,
        prompt:
          'How do you remediate this safely at the IT bench and prevent repeat shutdowns?',
        diagnosticOutput:
          'CPU Package Temp: 99°C (PROCHOT Active)\nFan RPM: 5400 RPM (Airflow weak through exhaust vent)',
        options: [
          {
            id: 'a',
            label: 'Power off, clean dust from fan & heatsink fins using short bursts of compressed air (holding fan blades gently so they don’t overspin), apply OEM BIOS/thermal updates, and advise using a hard flat surface',
            isCorrect: true,
            feedback:
              'Pro hardware technique! Holding the fan prevents back-EMF bearing damage while clearing the dust mat—load temperatures drop from 99°C to a steady 74°C.',
          },
          {
            id: 'b',
            label: 'Unplug the internal cooling fan wire so the fan stops making noise',
            isCorrect: false,
            feedback:
              'Unplugging the fan removes cooling completely and causes thermal shutdown in under 60 seconds!',
          },
          {
            id: 'c',
            label: 'Wash the motherboard with tap water',
            isCorrect: false,
            feedback:
              'Liquids destroy powered electronics—only use dry compressed air and 99% isopropyl alcohol for thermal paste repasting.',
          },
        ],
      },
    ],
  },
  {
    id: 'vpn-not-connecting',
    ticketNumber: 'INC-1048',
    title: 'VPN Connects, Ping Works, But Internal HTTPS Sites Hang',
    difficulty: 'Advanced',
    callerName: 'Priya Nair',
    callerRole: 'DevOps Engineer',
    problemReport:
      'From my mobile hotspot, corporate IPSec VPN connects! `ping 10.20.1.15` works fine, yet opening `https://git.corp.local` in Chrome hangs forever on "Establishing TLS handshake".',
    environmentClue: '5G Mobile Hotspot + IPSec VPN · Small packets pass, large packets drop silently.',
    relatedCategory: 'VPN & Remote Access',
    verificationCommand: 'ping 10.20.1.15 -f -l 1400',
    resolutionSummary:
      'Diagnosed a classic VPN MTU / TCP MSS blackhole (`ping -f -l 1400` returned "Packet needs to be fragmented"), and lowered tunnel interface MTU / clamped TCP MSS to 1350 bytes.',
    steps: [
      {
        stepNumber: 1,
        prompt:
          'Tiny 32-byte `ping` packets succeed, while large TLS handshake certificates hang over a mobile hotspot + IPSec VPN. Which test confirms an MTU fragmentation blackhole?',
        options: [
          {
            id: 'a',
            label: 'Run `ping 10.20.1.15 -f -l 1400` (Don’t Fragment flag with 1400-byte payload) to test maximum unfragmented packet size',
            isCorrect: true,
            feedback:
              'Nailed it! Mobile carrier NAT + IPSec headers eat ~80–120 bytes of overhead. `ping -f -l 1400` fails with "Packet needs to be fragmented", proving large TLS packets are dropping!',
          },
          {
            id: 'b',
            label: 'Reinstall Git and Visual Studio Code',
            isCorrect: false,
            feedback:
              'Both browser HTTPS and Git fail identically because the packet size drop happens at Layer 3/4 on the VPN tunnel.',
          },
          {
            id: 'c',
            label: 'Reset Priya’s Active Directory password',
            isCorrect: false,
            feedback:
              'Her VPN already authenticated and connected—credentials are valid.',
          },
        ],
      },
      {
        stepNumber: 2,
        prompt:
          '`ping 10.20.1.15 -f -l 1320` succeeds, while `1400` drops. What is the clean engineering fix?',
        diagnosticOutput:
          'Pinging 10.20.1.15 with 1400 bytes of data:\nPacket needs to be fragmented but DF set.\nPinging 10.20.1.15 with 1320 bytes of data:\nReply from 10.20.1.15: bytes=1320 time=38ms',
        options: [
          {
            id: 'a',
            label: 'Set the VPN virtual adapter MTU to `1350` (e.g., `netsh interface ipv4 set subinterface "CorpVPN" mtu=1350 store=persistent`) and clamp TCP MSS on the VPN concentrator',
            isCorrect: true,
            feedback:
              'Textbook network engineering! Lowering VPN tunnel MTU to 1350 ensures encrypted packets fit comfortably inside mobile carrier frames—`https://git.corp.local` loads instantaneously.',
          },
          {
            id: 'b',
            label: 'Set MTU to `9000` Jumbo Frames on the laptop',
            isCorrect: false,
            feedback:
              '9000-byte Jumbo Frames only work on специально configured data-center switches—over the internet/WAN they guarantee 100% fragmentation drops!',
          },
          {
            id: 'c',
            label: 'Turn off HTTPS/TLS on the company Git server',
            isCorrect: false,
            feedback:
              'Never downgrade enterprise security! Even plain HTTP downloads >1400 bytes would still stall on an MTU blackhole.',
          },
        ],
      },
    ],
  },
  {
    id: 'windows-boot-failure',
    ticketNumber: 'INC-1049',
    title: 'Windows Boot Failure — INACCESSIBLE_BOOT_DEVICE After BIOS Reset',
    difficulty: 'Advanced',
    callerName: 'Noah Brooks',
    callerRole: 'Field Engineer',
    problemReport:
      'My laptop CMOS battery ran flat overnight, BIOS reset to factory defaults, and now Windows 11 crashes at startup with a blue screen: `INACCESSIBLE_BOOT_DEVICE`!',
    environmentClue: 'NVMe SSD shows up healthy in BIOS System Info · No Windows updates were installed yesterday.',
    relatedCategory: 'Windows 10 & Windows 11',
    verificationCommand: 'bcdedit /enum | findstr osdevice',
    resolutionSummary:
      'Recognized that resetting BIOS flipped Storage Controller mode between Intel VMD / RAID On and AHCI (so Windows lacked the matching boot-start storage driver), restored the original Storage Controller mode in UEFI, and booted cleanly without data loss.',
    steps: [
      {
        stepNumber: 1,
        prompt:
          'The NVMe SSD is detected in UEFI, and the crash started immediately after BIOS settings reset to factory defaults. What caused `INACCESSIBLE_BOOT_DEVICE`?',
        options: [
          {
            id: 'a',
            label: 'BIOS reset switched the Storage Controller mode (Intel VMD / RAID On ↔ AHCI) or Legacy CSM vs UEFI mode, so Windows lacks the active boot storage driver',
            isCorrect: true,
            feedback:
              'Spot on! When Windows is installed under AHCI (or Intel VMD) and BIOS resets to the opposite mode, the kernel cannot mount `C:` during boot and throws `INACCESSIBLE_BOOT_DEVICE`.',
          },
          {
            id: 'b',
            label: 'The SSD physically melted overnight while powered off',
            isCorrect: false,
            feedback:
              'UEFI System Information still detects the NVMe SSD model and serial cleanly.',
          },
          {
            id: 'c',
            label: 'Wipe all partitions with `diskpart clean` immediately',
            isCorrect: false,
            feedback:
              'STOP! `diskpart clean` destroys all user data when a 10-second UEFI setting toggle restores boot cleanly!',
          },
        ],
      },
      {
        stepNumber: 2,
        prompt:
          'You enter UEFI Setup (`F2` at power-on) and see Storage Operation defaulted to `RAID On (Intel VMD)`, whereas your company image uses `AHCI / NVMe`. What do you do?',
        diagnosticOutput:
          'UEFI Setup -> Storage Configuration:\n  SATA/NVMe Operation: [RAID On / Intel VMD Enabled]\n  Boot Mode: [UEFI Only]',
        options: [
          {
            id: 'a',
            label: 'Switch Storage Operation back to `AHCI/NVMe` (matching how Windows was imaged), keep `UEFI` boot mode, Save & Exit (and have BitLocker recovery key ready just in case PCRs changed)',
            isCorrect: true,
            feedback:
              'Zero-data-loss rescue! Restoring the matching storage controller mode lets `stornvme.sys` mount the boot volume immediately—and anticipating a BitLocker prompt after BIOS changes is pure pro polish.',
          },
          {
            id: 'b',
            label: 'Switch Boot Mode to `Legacy MBR Only` and disable UEFI',
            isCorrect: false,
            feedback:
              'Windows 11 uses GPT + UEFI exclusively—enabling Legacy MBR prevents finding the EFI System Partition altogether.',
          },
          {
            id: 'c',
            label: 'Remove the RAM sticks from the motherboard',
            isCorrect: false,
            feedback:
              'Removing all RAM prevents the laptop from completing POST at all.',
          },
        ],
      },
    ],
  },
  {
    id: 'disk-space-full',
    ticketNumber: 'INC-1050',
    title: 'Disk Space Full — C: Drive Shows 0 Bytes Free',
    difficulty: 'Intermediate',
    callerName: 'Hannah Wright',
    callerRole: 'Video Producer',
    problemReport:
      'Windows popped up "Low Disk Space (0 MB free on Local Disk C:)" and now Outlook cannot save attachments and Adobe Premiere refuses to save my project!',
    environmentClue: '512 GB NVMe SSD · Recycle Bin already has 48 GB + `C:\\Windows\\Temp` & `SoftwareDistribution\\Download` are bloated.',
    relatedCategory: 'Storage & Disk Management',
    verificationCommand: 'cleanmgr /sagerun:1',
    resolutionSummary:
      'Used Storage Sense / Disk Cleanup + directory size inspection to safely purge Recycle Bin, Temp caches, and stale Windows Update downloads—freeing 74 GB without touching user projects or `WinSxS` directly.',
    steps: [
      {
        stepNumber: 1,
        prompt:
          'With `0 MB` free, apps cannot even write temporary lock files. Which folders are SAFE to inspect and clean first to regain breathing room?',
        options: [
          {
            id: 'a',
            label: 'Empty Recycle Bin, clear `%TEMP%` (skipping files currently in use), and run Windows Storage Sense / Disk Cleanup (`cleanmgr`) as Administrator',
            isCorrect: true,
            feedback:
              'Safe and effective! Recycle Bin, `%TEMP%`, and Windows Update cache (`cleanmgr` System Files) routinely reclaim 20–80 GB with zero risk to Windows stability.',
          },
          {
            id: 'b',
            label: 'Manually Shift+Delete the `C:\\Windows\\WinSxS` folder in File Explorer',
            isCorrect: false,
            feedback:
              'CRITICAL TRAP! Deleting `WinSxS` manually breaks Windows servicing and updates—only ever shrink it safely via `DISM /Online /Cleanup-Image /StartComponentCleanup`.',
          },
          {
            id: 'c',
            label: 'Randomly delete `.ost` and `.vhdx` files without asking what they are',
            isCorrect: false,
            feedback:
              'Wait! `.vhdx` could be a developer’s WSL2 Linux VM or local Hyper-V data—always identify large files with the user before deleting.',
          },
        ],
      },
      {
        stepNumber: 2,
        prompt:
          'You freed 56 GB immediately! You also spot a 28 GB `Windows.old` / Component Store footprint from last month’s feature upgrade. What safe built-in command trims obsolete OS update packages?',
        diagnosticOutput:
          'C: Free Space Restored: 56.4 GB\nWindows Component Store reclaimable packages detected: 18.2 GB',
        options: [
          {
            id: 'a',
            label: 'Run `DISM.exe /Online /Cleanup-Image /StartComponentCleanup` in Administrator PowerShell/CMD (and configure Storage Sense + OneDrive Files On-Demand)',
            isCorrect: true,
            feedback:
              'Masterful! `DISM ... /StartComponentCleanup` safely removes superseded Windows update components, and OneDrive Files On-Demand keeps massive video archives in the cloud until opened.',
          },
          {
            id: 'b',
            label: 'Delete the EFI System Partition in Disk Management',
            isCorrect: false,
            feedback:
              'Deleting the 100 MB EFI partition makes Windows unbootable and saves virtually zero space!',
          },
          {
            id: 'c',
            label: 'Compress `C:\\Windows\\System32\\config` registry hives while Windows is running',
            isCorrect: false,
            feedback:
              'Never tamper with live SAM/SYSTEM/SOFTWARE registry hive files.',
          },
        ],
      },
    ],
  },
];
