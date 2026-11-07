export interface QuizItem {
  id: string;
  category: 'Networking' | 'Windows' | 'Hardware' | 'Active Directory' | 'Scenario' | 'Interview';
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface QuizModeConfig {
  id: string;
  title: string;
  subtitle: string;
  badgeHint?: string;
}

export const QUIZ_MODES: QuizModeConfig[] = [
  {
    id: 'daily',
    title: 'Daily IT Challenge',
    subtitle: '5 fresh cross-topic questions seeded daily—keep your streak alive!',
    badgeHint: 'Boosts Daily Streak + XP',
  },
  {
    id: 'quick-5',
    title: 'Quick 5-Question Quiz',
    subtitle: 'Fast 2-minute warm-up mixing fundamentals and real helpdesk tickets.',
  },
  {
    id: 'networking',
    title: 'Networking Quiz',
    subtitle: 'IP addresses, WiFi, Routers, DNS, DHCP DORA, VLANs, and ports.',
    badgeHint: 'Score 80%+ to unlock Networking Explorer!',
  },
  {
    id: 'windows',
    title: 'Windows Quiz',
    subtitle: 'Windows 10/11 tools, SFC/DISM, Task Manager, BitLocker, and updates.',
    badgeHint: 'Score 80%+ to unlock Windows Troubleshooter!',
  },
  {
    id: 'hardware',
    title: 'Hardware Quiz',
    subtitle: 'CPU, RAM vs SSD vs HDD, UEFI POST, overheating, docks, and printers.',
  },
  {
    id: 'active-directory',
    title: 'Active Directory Quiz',
    subtitle: 'Domain Controllers, Kerberos, lockouts, OUs, Security Groups, and GPOs.',
  },
  {
    id: 'scenario',
    title: 'IT Support Scenario Quiz',
    subtitle: 'Real ticket triage—what do you check FIRST when users call the helpdesk?',
  },
  {
    id: 'interview',
    title: 'Interview Challenge',
    subtitle: 'High-value L1/L2 & SysAdmin technical hiring questions.',
  },
];

export const QUIZ_QUESTION_BANK: QuizItem[] = [
  // Networking (5)
  {
    id: 'qz-net-1',
    category: 'Networking',
    question: 'A Windows laptop shows IPv4 address `169.254.42.19`. What does this immediately tell you?',
    options: [
      'The laptop could not reach a DHCP server and self-assigned an APIPA address',
      'The laptop is connected to high-speed 5G satellite internet',
      'The SSD hard drive is full',
      'The monitor cable is unplugged',
    ],
    correctIndex: 0,
    explanation: 'Any 169.254.x.x address is APIPA—assigned automatically when DHCP Discover fails to get an answer.',
  },
  {
    id: 'qz-net-2',
    category: 'Networking',
    question: 'If `ping 8.8.8.8` replies in 14ms with 0% loss, yet typing `www.microsoft.com` in Chrome fails, what is the culprit?',
    options: [
      'A broken Ethernet cable',
      'DNS resolution failure (name-to-IP lookup is failing)',
      'Empty laptop battery',
      'Dead WiFi router power supply',
    ],
    correctIndex: 1,
    explanation: 'Pinging 8.8.8.8 proves your router and internet line work! Failing only on domain names proves DNS is the issue.',
  },
  {
    id: 'qz-net-3',
    category: 'Networking',
    question: 'What is the exact 4-step sequence of DHCP IP assignment?',
    options: [
      'Download → Open → Run → Archive',
      'Discover → Offer → Request → Acknowledge (DORA)',
      'DNS → OSI → Router → Adapter',
      'Ping → Trace → Flush → Reboot',
    ],
    correctIndex: 1,
    explanation: 'DHCP clients broadcast Discover, receive an Offer, send a Request, and get a final Acknowledge (DORA).',
  },
  {
    id: 'qz-net-4',
    category: 'Networking',
    question: 'Which standard TCP port is used by secure HTTPS websites?',
    options: ['Port 21', 'Port 25', 'Port 443', 'Port 3389'],
    correctIndex: 2,
    explanation: 'HTTPS uses TCP Port 443 (HTTP uses 80, SMTP uses 25, and RDP uses 3389).',
  },
  {
    id: 'qz-net-5',
    category: 'Networking',
    question: 'In `192.168.1.0/24` (Subnet Mask `255.255.255.0`), how many usable host IP addresses are available for devices?',
    options: ['254 usable hosts', '12 usable hosts', '1,000,000 usable hosts', '2 usable hosts'],
    correctIndex: 0,
    explanation: 'A /24 has 256 total addresses (`0` to `255`), minus `.0` (Network ID) and `.255` (Broadcast) = 254 usable hosts.',
  },

  // Windows (5)
  {
    id: 'qz-win-1',
    category: 'Windows',
    question: 'Which command scans and repairs corrupted protected Windows system files?',
    options: ['ipconfig /all', 'sfc /scannow', 'dir /w', 'notepad.exe'],
    correctIndex: 1,
    explanation: 'System File Checker (`sfc /scannow`) verifies and repairs protected OS binaries from an Administrator prompt.',
  },
  {
    id: 'qz-win-2',
    category: 'Windows',
    question: 'Before updating a laptop’s BIOS/UEFI firmware, what should you suspend for 1 reboot so the user isn’t locked out by a 48-digit prompt?',
    options: ['Windows Calculator', 'BitLocker Drive Encryption', 'Desktop Wallpaper', 'Sticky Notes'],
    correctIndex: 1,
    explanation: 'BIOS updates change TPM PCR 0 measurements; suspending BitLocker for 1 reboot lets it re-seal cleanly afterward.',
  },
  {
    id: 'qz-win-3',
    category: 'Windows',
    question: 'A user logs in and sees an empty desktop (`C:\\Users\\TEMP`) with a popup "You’ve been signed in with a temporary profile." What rule comes FIRST?',
    options: [
      'Warn the user NOT to save files only on that desktop (they vanish on logoff) and fix the `.bak` ProfileList registry key',
      'Format the C: drive immediately',
      'Unplug the mouse',
      'Change monitor brightness to 100%',
    ],
    correctIndex: 0,
    explanation: 'Temporary profiles wipe on sign-out! Back up any open work first, then restore the `<SID>.bak` ProfileList key.',
  },
  {
    id: 'qz-win-4',
    category: 'Windows',
    question: 'Which built-in Windows log tool records Application crashes (Event ID 1000) and unexpected reboots (Event ID 41)?',
    options: ['Event Viewer (`eventvwr.msc`)', 'Snipping Tool', 'Character Map', 'Sound Recorder'],
    correctIndex: 0,
    explanation: 'Event Viewer is the black-box flight recorder of Windows troubleshooting.',
  },
  {
    id: 'qz-win-5',
    category: 'Windows',
    question: 'If `sfc /scannow` reports it found corrupt files it was UNABLE to fix, what command repairs the Windows component store first?',
    options: [
      'DISM /Online /Cleanup-Image /RestoreHealth',
      'ping localhost',
      'cls',
      'echo hello',
    ],
    correctIndex: 0,
    explanation: 'DISM repairs `C:\\Windows\\WinSxS` so that the subsequent `sfc /scannow` pass has clean source files.',
  },

  // Hardware (5)
  {
    id: 'qz-hw-1',
    category: 'Hardware',
    question: 'A user deletes 50 GB of old videos from Downloads hoping to fix "98% RAM Memory Usage" in Task Manager. Will that free RAM?',
    options: [
      'No—deleting files frees SSD/HDD disk space; closing memory-heavy open apps/tabs or upgrading RAM fixes RAM usage',
      'Yes—Downloads live directly inside RAM chips',
      'Yes—every deleted video adds 4 GB of DDR5 RAM',
      'Only if the Recycle Bin icon is blue',
    ],
    correctIndex: 0,
    explanation: 'RAM holds currently running apps/tabs (volatile), whereas Downloads sit on permanent SSD/HDD disk storage.',
  },
  {
    id: 'qz-hw-2',
    category: 'Hardware',
    question: 'Why does upgrading an older office PC from a spinning HDD to an NVMe/SATA SSD make such a dramatic speed difference?',
    options: [
      'SSDs use solid-state flash chips with zero moving parts and near-instant random access times',
      'SSDs spin at 100,000 RPM',
      'SSDs increase internet Mbps from your ISP',
      'SSDs make the screen bigger',
    ],
    correctIndex: 0,
    explanation: 'Eliminating mechanical platter seek latency speeds up boot times and app launches by 5x–30x!',
  },
  {
    id: 'qz-hw-3',
    category: 'Hardware',
    question: 'A laptop’s fan screams loudly, its bottom chassis feels burning hot, and CPU speed drops to 0.4 GHz during video calls. What is happening?',
    options: [
      'CPU Thermal Throttling due to dust-clogged vents, blocked airflow, or dried thermal paste',
      'Too many bookmarks in Chrome',
      'DNS cache is full',
      'Keyboard language changed to French',
    ],
    correctIndex: 0,
    explanation: 'Modern CPUs intentionally lower their clock speed ("thermal throttling") near 95–100°C to avoid melting.',
  },
  {
    id: 'qz-hw-4',
    category: 'Hardware',
    question: 'When a shared office printer stays stuck with 12 documents queued and clicking Cancel does nothing, what fixes the stuck queue?',
    options: [
      'Stop Print Spooler service, clear files in `C:\\Windows\\System32\\spool\\PRINTERS`, and start Print Spooler',
      'Reinstall Windows on all 40 office laptops',
      'Replace the office WiFi router',
      'Buy new HDMI cables',
    ],
    correctIndex: 0,
    explanation: 'Stopping `Spooler` releases locked `.SPL`/`.SHD` spool files so you can clear the wedged print queue cleanly.',
  },
  {
    id: 'qz-hw-5',
    category: 'Hardware',
    question: 'What motherboard firmware runs the Power-On Self-Test (POST) right when you press the PC power button?',
    options: ['UEFI / BIOS', 'Microsoft Outlook', 'Adobe Reader', 'Print Spooler'],
    correctIndex: 0,
    explanation: 'UEFI/BIOS initializes CPU, RAM, and storage before handing off to the OS bootloader.',
  },

  // Active Directory (5)
  {
    id: 'qz-ad-1',
    category: 'Active Directory',
    question: 'Why must an Active Directory domain-joined PC NEVER use `8.8.8.8` as its secondary DNS server?',
    options: [
      'Public DNS cannot resolve internal `_msdcs` Active Directory records, causing domain login & GPO failures',
      '8.8.8.8 charges $5 per query',
      '8.8.8.8 only works on Linux',
      'Google DNS disables USB ports',
    ],
    correctIndex: 0,
    explanation: 'Domain PCs must point exclusively to internal AD DNS servers (which then forward external queries to public DNS).',
  },
  {
    id: 'qz-ad-2',
    category: 'Active Directory',
    question: 'Which Security Event ID on the PDC Emulator identifies the exact `Caller Computer Name` locking out an AD user account?',
    options: ['Event ID 4740', 'Event ID 404', 'Event ID 12', 'Event ID 9999'],
    correctIndex: 0,
    explanation: 'Security Event ID 4740 is logged whenever an Active Directory user account is locked out.',
  },
  {
    id: 'qz-ad-3',
    category: 'Active Directory',
    question: 'In what order do Active Directory Group Policy Objects (GPOs) apply?',
    options: [
      'Local → Site → Domain → Organizational Unit (LSDOU)',
      'Alphabetical order by GPO title',
      'Random order on every reboot',
      'Cloud → Printer → Mouse → Monitor',
    ],
    correctIndex: 0,
    explanation: 'GPOs process in LSDOU order, where policies applied later (closest OU) win conflicts unless Enforced.',
  },
  {
    id: 'qz-ad-4',
    category: 'Active Directory',
    question: 'How do you fix "The trust relationship between this workstation and the primary domain failed" without unjoining/rejoining?',
    options: [
      'Sign in locally and run `Test-ComputerSecureChannel -Repair -Credential (Get-Credential)` in Admin PowerShell',
      'Delete the user’s mailbox',
      'Format the domain controller',
      'Disable Ethernet permanently',
    ],
    correctIndex: 0,
    explanation: 'Test-ComputerSecureChannel -Repair resets the out-of-sync machine password with AD in 5 seconds—zero reboot needed!',
  },
  {
    id: 'qz-ad-5',
    category: 'Active Directory',
    question: 'Why does Kerberos domain authentication suddenly fail if a computer’s clock is 15 minutes behind real time?',
    options: [
      'Kerberos enforces a strict 5-minute maximum clock skew tolerance to block replay attacks',
      'Domain Controllers sleep during different time zones',
      'Monitors stop working when clocks drift',
      'Passwords expire every 10 minutes',
    ],
    correctIndex: 0,
    explanation: 'NTP time sync (`w32tm /resync`) is critical because Kerberos rejects tickets skewed beyond 5 minutes.',
  },

  // Scenario (5)
  {
    id: 'qz-sc-1',
    category: 'Scenario',
    question: 'At 9:00 AM, ALL 35 employees on Floor 2 lose network & internet simultaneously, while Floor 1 works fine. Where do you look FIRST?',
    options: [
      'Floor 2’s shared network switch / IDF closet power, uplink fiber, or VLAN DHCP scope',
      'Reinstall Chrome on all 35 laptops one by one',
      'Replace 35 keyboards',
      'Ask everyone to change their desktop background',
    ],
    correctIndex: 0,
    explanation: 'Always match troubleshooting to the blast radius! 35 simultaneous users on one floor = shared Floor 2 infrastructure.',
  },
  {
    id: 'qz-sc-2',
    category: 'Scenario',
    question: 'A remote worker at home says: "Netflix works great, so my internet is fine—why won’t our private `http://intranet.corp.local` open?"',
    options: [
      'Check if they connected their Corporate VPN client first!',
      'Tell them to cancel Netflix',
      'Replace their laptop screen',
      'Run Disk Cleanup',
    ],
    correctIndex: 0,
    explanation: 'Private `.corp.local` servers are only reachable from home when the encrypted Corporate VPN tunnel is connected!',
  },
  {
    id: 'qz-sc-3',
    category: 'Scenario',
    question: 'An executive forwards an urgent email asking for gift cards from `"ceo.office.urgent99@gmail.com"` signed with the real CEO’s name. What is this?',
    options: [
      'Display-name spoofing / BEC phishing—warn them NOT to reply or buy anything and report to Security',
      'A legitimate IT software update',
      'A DNS MX record upgrade',
      'A standard Windows notification',
    ],
    correctIndex: 0,
    explanation: 'Attackers fake display names using free webmail accounts to trick staff into urgent wire/gift-card fraud.',
  },
  {
    id: 'qz-sc-4',
    category: 'Scenario',
    question: 'A caller on the phone claims to be a VP traveling abroad and demands an immediate password + MFA reset without verification. What do you do?',
    options: [
      'Politely follow strict out-of-band identity verification policy (callback to HR-listed phone / video + manager verification) before touching credentials',
      'Reset both password and MFA immediately because they sounded angry',
      'Email the password to their personal Gmail',
      'Disable the company firewall',
    ],
    correctIndex: 0,
    explanation: 'Social engineers rely on urgency and authority! Out-of-band verification protects the entire company.',
  },
  {
    id: 'qz-sc-5',
    category: 'Scenario',
    question: 'Outlook won’t open properly because a user installed a buggy third-party add-in yesterday. How do you launch Outlook cleanly to disable it?',
    options: [
      'Run `outlook.exe /safe` (Safe Mode) and disable the faulty COM Add-in',
      'Delete the user’s Windows account',
      'Unplug the WiFi router',
      'Replace the RAM sticks',
    ],
    correctIndex: 0,
    explanation: '`outlook.exe /safe` opens Outlook with all third-party add-ins bypassed so you can uncheck the crashing add-in.',
  },

  // Interview (5)
  {
    id: 'qz-int-1',
    category: 'Interview',
    question: 'INTERVIEW: When combining SMB Share Permissions (`Full Control`) and NTFS Folder Permissions (`Read Only`), which permission wins over the network?',
    options: [
      'Read Only—the MOST RESTRICTIVE permission between Share and NTFS always wins',
      'Full Control—the most generous permission always wins',
      'Neither—nobody can open the folder',
      'It depends on the day of the week',
    ],
    correctIndex: 0,
    explanation: 'Across SMB network shares, effective access is the intersection (most restrictive) of Share + NTFS permissions.',
  },
  {
    id: 'qz-int-2',
    category: 'Interview',
    question: 'INTERVIEW: Why is RAID (like RAID 1 or RAID 5) NOT a substitute for proper 3-2-1 backups?',
    options: [
      'RAID instantly mirrors accidental file deletions, SQL corruption, and ransomware encryption across all disks',
      'RAID only works when the server is powered off',
      'RAID deletes files after 7 days',
      'RAID slows down monitors',
    ],
    correctIndex: 0,
    explanation: 'RAID protects hardware uptime if 1 physical disk dies—only offline/immutable backups protect against ransomware or accidental deletion!',
  },
  {
    id: 'qz-int-3',
    category: 'Interview',
    question: 'INTERVIEW: On Linux, `df -h` shows `/` is 100% full, yet `du -sh /*` only adds up to 40%. Why?',
    options: [
      'A running process still holds an open file handle (`lsof +L1`) to a large deleted log file',
      'Linux cannot count above 40%',
      'The keyboard cable is loose',
      'DNS port 53 is closed',
    ],
    correctIndex: 0,
    explanation: 'Deleting an open log file with `rm` unlinks its name, but disk blocks stay locked until the daemon reloads or closes the handle.',
  },
  {
    id: 'qz-int-4',
    category: 'Interview',
    question: 'INTERVIEW: What is the proper Microsoft 365 offboarding order to preserve an ex-employee’s `<50 GB` mailbox without paying a monthly license?',
    options: [
      'Block sign-in → Convert mailbox to Shared Mailbox → Delegate access if approved → THEN remove license',
      'Delete user account first → Hope emails come back next year',
      'Remove license first and wait 90 days',
      'Forward all company mail to public pastebin',
    ],
    correctIndex: 0,
    explanation: 'Converting to a Shared Mailbox BEFORE removing the license retains `<50 GB` of mail permanently at $0 license cost.',
  },
  {
    id: 'qz-int-5',
    category: 'Interview',
    question: 'INTERVIEW: Why can ICMP `ping` work across a VPN tunnel while HTTPS websites hang indefinitely?',
    options: [
      'MTU / TCP MSS blackhole—small 32-byte pings pass, while full 1500-byte TLS packets exceed tunnel MTU and drop',
      'HTTPS uses sound waves instead of IP packets',
      'Ping runs at Layer 7',
      'Browsers cannot work over VPNs',
    ],
    correctIndex: 0,
    explanation: 'VPN encapsulation adds ~50–76 bytes of headers; clamping TCP MSS to ~1360 fixes VPN TLS blackholes immediately.',
  },
];

export function getQuestionsForMode(modeId: string, dateSeed = new Date().toISOString().slice(0, 10)): QuizItem[] {
  if (modeId === 'networking') return QUIZ_QUESTION_BANK.filter((q) => q.category === 'Networking');
  if (modeId === 'windows') return QUIZ_QUESTION_BANK.filter((q) => q.category === 'Windows');
  if (modeId === 'hardware') return QUIZ_QUESTION_BANK.filter((q) => q.category === 'Hardware');
  if (modeId === 'active-directory') return QUIZ_QUESTION_BANK.filter((q) => q.category === 'Active Directory');
  if (modeId === 'scenario') return QUIZ_QUESTION_BANK.filter((q) => q.category === 'Scenario');
  if (modeId === 'interview') return QUIZ_QUESTION_BANK.filter((q) => q.category === 'Interview');

  if (modeId === 'daily') {
    // Deterministic daily hash from YYYY-MM-DD so everyone gets the same 5 Daily Challenge questions today
    let hash = 0;
    for (let i = 0; i < dateSeed.length; i++) {
      hash = (hash * 31 + dateSeed.charCodeAt(i)) >>> 0;
    }
    const picked: QuizItem[] = [];
    const pool = [...QUIZ_QUESTION_BANK];
    for (let i = 0; i < 5 && pool.length > 0; i++) {
      const idx = (hash + i * 7) % pool.length;
      picked.push(pool.splice(idx, 1)[0]);
    }
    return picked;
  }

  // quick-5: balanced 5-question sampler across categories
  return [
    QUIZ_QUESTION_BANK[0],
    QUIZ_QUESTION_BANK[5],
    QUIZ_QUESTION_BANK[10],
    QUIZ_QUESTION_BANK[15],
    QUIZ_QUESTION_BANK[20],
  ];
}
