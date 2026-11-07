import { BeginnerLesson } from './beginnerLessonsPart1';

export const BEGINNER_LESSONS_PART_2: BeginnerLesson[] = [
  {
    id: 'what-is-a-modem',
    number: 14,
    title: 'What is a Modem?',
    chapter: 'Networking & Internet',
    simpleExplanation:
      'A Modem (or Fiber ONT) is the translator box provided by your Internet Service Provider (ISP). It converts signals coming from the street fiber/cable line into digital Ethernet data your router can use.',
    hinglishExplanation:
      'Modem (ya Fiber ONT box) bahar sadak se aane wali ISP fiber/cable signal ko digital internet signal mein translate karta hai jise aapka WiFi Router samajh sake.',
    realLifeExample:
      'Think of a language interpreter: your ISP fiber cable speaks "Light Pulses," while your computer speaks "Ethernet Packets"—the Modem translates between both!',
    flowTitle: 'ISP Street Line → Modem/ONT → Router → Devices',
    flowNodes: [
      { label: 'ISP Fiber/Coax', subtitle: 'Street Line', detail: 'Laser light pulses or cable signals arrive from outside.' },
      { label: 'Modem / ONT', subtitle: 'Signal Translator', detail: 'Converts optical/coax signals into digital Ethernet.' },
      { label: 'WiFi Router', subtitle: 'Shares Connection', detail: 'Often combined into 1 box by home ISPs ("Modem-Router Combo").' },
      { label: 'Your Devices', subtitle: 'Online!', detail: 'Laptops and phones browse seamlessly.' },
    ],
    whyItMatters:
      'Looking at the LED lights on a Modem/ONT (such as a red blinking "LOS" Loss-of-Signal light) proves in 5 seconds that an outside fiber cable is cut!',
    commonMistakes: [
      'Confusing a Modem with a Router—a standalone Modem only connects ONE cable to the ISP; the Router shares it across WiFi/LAN.',
      'Bending thin yellow/white fiber-optic patch cords sharply—glass inside snaps easily!',
    ],
    miniQuiz: [
      {
        question: 'What is the primary job of a Modem (or Fiber ONT)?',
        options: [
          'Translate the ISP’s outside fiber/cable signal into digital data for your router',
          'Print PDF documents',
          'Store Windows user passwords',
        ],
        correctIndex: 0,
        explanation: 'Modem stands for Modulator-Demodulator—it bridges ISP physical lines to Ethernet.',
      },
      {
        question: 'If a fiber ONT modem has a blinking RED "LOS" (Loss of Signal) light, what is the likely cause?',
        options: [
          'The outside ISP fiber line is disconnected or damaged',
          'Chrome needs an update',
          'Your mouse battery is low',
        ],
        correctIndex: 0,
        explanation: 'Red LOS indicates zero optical light signal arriving from the ISP street cabinet.',
      },
      {
        question: 'Why do many homes only see ONE box instead of a separate Modem and Router?',
        options: [
          'ISPs often supply a combined "Gateway" box with both a Modem and WiFi Router inside',
          'Routers were banned in 2010',
          'Modems work inside keyboards',
        ],
        correctIndex: 0,
        explanation: 'Consumer ISP gateways combine the ONT/Modem and WiFi Router in a single plastic enclosure.',
      },
    ],
  },
  {
    id: 'what-is-the-internet',
    number: 15,
    title: 'What is the Internet?',
    chapter: 'Networking & Internet',
    simpleExplanation:
      'The Internet is a giant worldwide network of millions of connected networks, data centers, and undersea fiber-optic cables—allowing any two computers on Earth to exchange data in milliseconds.',
    hinglishExplanation:
      'Internet koi aasman mein udta hua baadal nahi hai! Yeh duniya bhar ke samundar ke neeche bichhi fiber cables, ISPs aur data centers ka ek global jaal (network of networks) hai.',
    realLifeExample:
      'Just as city streets connect to state highways and international airports so a package can travel from Mumbai to London, the Internet links local networks across continents.',
    flowTitle: 'Journey of One Click Across the Internet',
    flowNodes: [
      { label: 'Home / Office', subtitle: 'Your Laptop', detail: 'Sends HTTPS request out through your WiFi router.' },
      { label: 'Local ISP', subtitle: 'City Fiber Ring', detail: 'Carries data to regional internet exchange hubs (IXPs).' },
      { label: 'Subsea Cables', subtitle: 'Global Fiber', detail: '99% of intercontinental internet travels through ocean-floor fiber!' },
      { label: 'Data Center', subtitle: 'Website Server', detail: 'Google/YouTube/Bank server replies in <50 milliseconds!' },
    ],
    whyItMatters:
      'Understanding hops between your PC, your router, your ISP, and the destination server lets you run `tracert` and pinpoint exactly where an outage sits.',
    commonMistakes: [
      'Saying "The whole internet is down" when only one website’s server is having an outage!',
      'Thinking global internet traffic mostly goes through satellites—almost 99% travels via undersea fiber cables.',
    ],
    miniQuiz: [
      {
        question: 'How does 99% of international internet data actually travel between continents?',
        options: ['Through undersea fiber-optic cables on the ocean floor', 'By carrier pigeons', 'Through Bluetooth'],
        correctIndex: 0,
        explanation: 'Hundreds of high-capacity submarine fiber cables carry global internet traffic at near light speed.',
      },
      {
        question: 'If YouTube opens fine on your PC, can your home internet connection be completely dead?',
        options: [
          'No—if one live site loads, your internet link works and the other broken site has a server/DNS issue',
          'Yes, YouTube runs without electricity',
          'Only if your monitor is curved',
        ],
        correctIndex: 0,
        explanation: 'Testing a second independent site separates "My internet is down" from "That one website is down."',
      },
      {
        question: 'What does "ISP" stand for?',
        options: ['Internet Service Provider', 'Internal Screen Pixel', 'Instant Software Patch'],
        correctIndex: 0,
        explanation: 'An ISP (such as JioFiber, Airtel, Comcast, AT&T, BT) connects homes and businesses to the Internet.',
      },
    ],
  },
  {
    id: 'what-is-a-server',
    number: 16,
    title: 'What is a Server?',
    chapter: 'Networking & Internet',
    simpleExplanation:
      'A Server is a powerful, 24/7 computer built to "serve" websites, files, emails, or logins to hundreds or thousands of user computers ("Clients") at the same time.',
    hinglishExplanation:
      'Server ek powerful 24x7 chalne wala computer hota hai jiska kaam doosre computers (Clients) ko websites, files, emails ya database service dena hota hai.',
    realLifeExample:
      'In a restaurant, you at the table are the "Client" asking for food, and the kitchen + waiter bringing dishes to 50 tables at once is the "Server."',
    flowTitle: 'Client-Server Model in Everyday IT',
    flowNodes: [
      { label: 'Clients', subtitle: 'Laptops & Phones', detail: '100 employees open browsers, Outlook, or shared folders.' },
      { label: 'Network Request', subtitle: 'HTTPS / SMB', detail: 'Clients ask the server for a file, webpage, or login check.' },
      { label: '24/7 Server', subtitle: 'Rack / Cloud VM', detail: 'Runs Windows Server or Linux with dual power & RAID disks.' },
      { label: 'Response Sent', subtitle: 'Data Delivered', detail: 'Everyone gets centralized, backed-up access!' },
    ],
    whyItMatters:
      'If 1 laptop breaks, 1 employee is affected. If 1 company Server goes down, 500 employees stop working—which is why System Administrators earn top salaries keeping servers healthy!',
    commonMistakes: [
      'Rebooting a shared company server in the middle of Tuesday afternoon without warning—disconnecting hundreds of active users!',
      'Storing critical company databases on an employee’s personal laptop instead of a backed-up server.',
    ],
    miniQuiz: [
      {
        question: 'Why are business servers usually kept in cooled server rooms or cloud data centers instead of under someone’s desk?',
        options: [
          'They must stay powered, cooled, secure, and online 24/7 for everyone',
          'Because servers do not use electricity',
          'Because servers have no CPU or RAM',
        ],
        correctIndex: 0,
        explanation: 'Servers use redundant power, UPS batteries, RAID storage, and cooling to run 24/7/365.',
      },
      {
        question: 'In the Client-Server model, what is your phone when you open Instagram?',
        options: ['The Client requesting content from Instagram’s Servers', 'The Fiber Optic Cable', 'The Power Supply'],
        correctIndex: 0,
        explanation: 'Your phone app acts as the Client; Instagram’s cloud machines are the Servers.',
      },
      {
        question: 'Why must you NEVER casually restart a production office server during business hours?',
        options: [
          'Hundreds of employees may be actively connected to its files, apps, or logins',
          'Servers cannot restart once turned on',
          'Restarting deletes the monitor',
        ],
        correctIndex: 0,
        explanation: 'Server restarts require scheduled maintenance windows and change approval.',
      },
    ],
  },
  {
    id: 'what-is-a-network',
    number: 17,
    title: 'What is a Network?',
    chapter: 'Networking & Internet',
    simpleExplanation:
      'A Computer Network is simply two or more devices connected together (by cables or wireless) so they can share files, printers, apps, and internet access.',
    hinglishExplanation:
      'Jab 2 ya usse zyada computers, phones ya printers aapas mein taar (Ethernet) ya WiFi se judte hain taaki data aur printer share kar sakein, use Computer Network kehte hain.',
    realLifeExample:
      'An intercom phone system inside an apartment building lets neighbors talk to security and each other instantly—that is a local network!',
    flowTitle: 'LAN (Local) vs WAN (Wide Area Network)',
    flowNodes: [
      { label: 'Workstations', subtitle: 'Office PCs & Printers', detail: 'Plug into wall Ethernet ports across an office floor.' },
      { label: 'Network Switch', subtitle: 'Connects the LAN', detail: 'Links 24–48 office cables together into a fast Local Area Network (LAN).' },
      { label: 'Router / Firewall', subtitle: 'Edge Gatekeeper', detail: 'Connects your building LAN to remote branch offices.' },
      { label: 'WAN', subtitle: 'City-to-City Link', detail: 'Wide Area Network linking Delhi, London, and New York offices!' },
    ],
    whyItMatters:
      'Knowing the difference between a Switch (connects devices INSIDE one LAN) and a Router (connects DIFFERENT networks/WANs) is a classic IT Support interview question!',
    commonMistakes: [
      'Plugging both ends of a single Ethernet cable into two ports on the same cheap switch—creates a "network loop" that freezes the whole floor!',
      'Confusing a Network Switch (24–48 ports for local PCs) with a Router.',
    ],
    miniQuiz: [
      {
        question: 'What does "LAN" stand for?',
        options: ['Local Area Network (devices in one home, school, or office building)', 'Large Airplane Navigation', 'Linux Audio Node'],
        correctIndex: 0,
        explanation: 'LAN stands for Local Area Network.',
      },
      {
        question: 'Which hardware device has 24 or 48 Ethernet ports to connect dozens of office computers and printers together on the same LAN?',
        options: ['A Network Switch', 'A Webcam', 'A Laser Printer'],
        correctIndex: 0,
        explanation: 'Network Switches connect local wired devices together at high speed.',
      },
      {
        question: 'What happens if someone accidentally plugs both ends of one Ethernet cable into two wall ports on an unmanaged switch?',
        options: [
          'It can cause a broadcast storm (network loop) taking down the local network',
          'It doubles internet speed',
          'It charges the switch battery',
        ],
        correctIndex: 0,
        explanation: 'Switching loops flood packets endlessly unless Spanning Tree Protocol (STP) blocks the port!',
      },
    ],
  },
  {
    id: 'what-is-dns',
    number: 18,
    title: 'What is DNS?',
    chapter: 'Networking & Internet',
    simpleExplanation:
      'DNS (Domain Name System) is the "Phonebook of the Internet." Humans remember names like `google.com`, while computers only talk to IP numbers like `142.250.183.14`—DNS translates names into IPs automatically!',
    hinglishExplanation:
      'DNS internet ki "Contacts Phonebook" hai! Hum insaan `google.com` ya `amazon.in` naam yaad rakhte hain, par computer ko sirf IP number chahiye hota hai. DNS naam ko IP address mein badalta hai.',
    realLifeExample:
      'You tap "Mom" in your phone contacts instead of memorizing her 10-digit mobile number—your Contacts app looks up the number behind the scenes just like DNS!',
    flowTitle: 'How DNS Translates a Website Name in Milliseconds',
    flowNodes: [
      { label: 'You Type Name', subtitle: 'www.example.com', detail: 'Browser asks: "What is the IP address for example.com?"' },
      { label: 'DNS Server', subtitle: 'Port 53 Lookup', detail: 'Checks its directory phonebook for example.com’s A-Record.' },
      { label: 'IP Returned', subtitle: '93.184.216.34', detail: 'DNS replies with the exact numeric IP address!' },
      { label: 'Site Loads', subtitle: 'Direct Connection', detail: 'Your browser connects straight to 93.184.216.34.' },
    ],
    whyItMatters:
      'There is a famous IT joke: "It’s always DNS!" Often the internet cable is 100% fine (`ping 8.8.8.8` works), yet websites fail to open simply because DNS stopped translating names!',
    commonMistakes: [
      'Assuming the entire ISP line is dead when only DNS is failing—always test `ping 8.8.8.8` vs `nslookup google.com`!',
      'Setting public DNS `8.8.8.8` on an Active Directory corporate PC (breaks internal company server names!).',
    ],
    miniQuiz: [
      {
        question: 'What is the main purpose of DNS?',
        options: [
          'Translate human-friendly website names (like google.com) into numeric IP addresses',
          'Encrypt laptop hard drives',
          'Boost WiFi antenna power',
        ],
        correctIndex: 0,
        explanation: 'DNS acts as the internet’s phonebook, mapping domain names to IP addresses.',
      },
      {
        question: 'If `ping 8.8.8.8` succeeds, but opening `www.google.com` fails, what is broken?',
        options: ['DNS resolution!', 'Your monitor cable', 'Your laptop battery'],
        correctIndex: 0,
        explanation: 'Reaching an IP number directly while failing on a website name proves a DNS problem!',
      },
      {
        question: 'Which safe Windows command clears old or broken DNS entries cached on your PC?',
        options: ['ipconfig /flushdns', 'format C:', 'shutdown /s'],
        correctIndex: 0,
        explanation: 'ipconfig /flushdns resets your local DNS resolver cache safely in 1 second.',
      },
    ],
  },
  {
    id: 'what-is-dhcp',
    number: 19,
    title: 'What is DHCP?',
    chapter: 'Networking & Internet',
    simpleExplanation:
      'DHCP (Dynamic Host Configuration Protocol) is the automatic receptionist that hands out a free IP address, Subnet Mask, Gateway, and DNS server to every device the moment it joins WiFi or plugs in.',
    hinglishExplanation:
      'Socho agar airport WiFi se judne par aapko khud haath se IP address type karna padta! DHCP woh automatic system hai jo WiFi connect hote hi aapke phone/laptop ko free IP address de deta hai.',
    realLifeExample:
      'When you check into a hotel, the front desk receptionist automatically hands you an available Room Key (#204) for 3 days ("Lease") and puts it back in the pool when you leave!',
    flowTitle: 'The Famous 4-Step DHCP Handshake: D-O-R-A',
    flowNodes: [
      { label: '1. Discover', subtitle: 'Client Shouts', detail: '"Hello! I just joined WiFi—is any DHCP server out there?"' },
      { label: '2. Offer', subtitle: 'Server Replies', detail: '"Yes! You can use free IP 192.168.1.50."' },
      { label: '3. Request', subtitle: 'Client Accepts', detail: '"Awesome, I would like to take 192.168.1.50 please!"' },
      { label: '4. Acknowledge', subtitle: 'Lease Confirmed', detail: '"Confirmed! Keep .50 for 24 hours; Gateway is .1."' },
    ],
    whyItMatters:
      'Every IT interview asks "Explain DHCP DORA!" And if all rooms in the hotel fill up ("DHCP Scope Exhausted"), new laptops get stuck with a `169.254.x.x` address and no internet!',
    commonMistakes: [
      'Leaving an office printer on dynamic DHCP without a reservation—its IP changes next week and everyone’s printer goes "Offline"!',
      'Plugging a home WiFi router LAN port into an office wall jack, creating a "Rogue DHCP Server" that hands out wrong IPs.',
    ],
    miniQuiz: [
      {
        question: 'What do the 4 letters "DORA" stand for in DHCP?',
        options: [
          'Discover, Offer, Request, Acknowledge',
          'Download, Open, Run, Close',
          'Disk, Operating, RAM, Adapter',
        ],
        correctIndex: 0,
        explanation: 'DORA is the 4-packet handshake every device performs to lease an IP from DHCP.',
      },
      {
        question: 'What special IP address does Windows assign itself when DHCP fails to respond?',
        options: ['169.254.x.x (APIPA)', '8.8.8.8', '1.1.1.1'],
        correctIndex: 0,
        explanation: 'Any 169.254.x.x address instantly tells an engineer: "This PC could not reach a DHCP server!"',
      },
      {
        question: 'Should shared office printers and servers change IP addresses randomly every day, or keep a reserved/static IP?',
        options: ['Keep a DHCP Reservation or Static IP so users can always find them', 'Change IPs every 5 minutes', 'Have no IP address'],
        correctIndex: 0,
        explanation: 'Servers and network printers need fixed/reserved IPs so computers always reach them reliably.',
      },
    ],
  },
  {
    id: 'what-is-active-directory',
    number: 20,
    title: 'What is Active Directory?',
    chapter: 'Enterprise & Security',
    simpleExplanation:
      'Microsoft Active Directory (AD) is the central company security database used by businesses to manage thousands of employee usernames, passwords, computers, and permissions from one place.',
    hinglishExplanation:
      'Active Directory (AD) kisi bhi badi company ka central ID-card aur security system hota hai. Isse ek employee apni company ID/password se office ke kisi bhi computer par login kar sakta hai!',
    realLifeExample:
      'On your personal home laptop, only YOUR account exists on that one laptop. In a 2,000-person bank using Active Directory, IT creates a new hire’s account ONCE on the Domain Controller and controls everything centrally!',
    flowTitle: 'How an Employee Logs In With Active Directory',
    flowNodes: [
      { label: 'Employee PC', subtitle: 'Types Username + Pass', detail: 'User signs into a domain-joined Windows 11 laptop.' },
      { label: 'Domain Controller', subtitle: 'AD Server Checks', detail: 'Verifies password and checks if account is enabled/unlocked.' },
      { label: 'Group Policy (GPO)', subtitle: 'Applies Rules', detail: 'Automatically maps Finance shared drives and locks security settings!' },
      { label: 'Desktop Ready', subtitle: 'Access Granted', detail: 'Employee gets exact permissions matching their department group.' },
    ],
    whyItMatters:
      'Password resets, unlocking locked-out AD accounts, joining laptops to the domain, and adding users to Security Groups make up 40%+ of L1/L2 IT Support tickets!',
    commonMistakes: [
      'Giving individual permissions user-by-user on folders instead of putting users into Department Security Groups (like `Finance-ReadWrite`).',
      'Deleting an ex-employee’s AD account immediately on day 1 instead of disabling it first per HR retention policy.',
    ],
    miniQuiz: [
      {
        question: 'What do companies use Active Directory for?',
        options: [
          'Centrally managing employee user logins, computers, security groups, and Group Policies',
          'Editing YouTube thumbnails',
          'Cooling down server rooms',
        ],
        correctIndex: 0,
        explanation: 'Active Directory is the core identity and policy backbone of enterprise Windows networks.',
      },
      {
        question: 'What is the server that runs Active Directory and checks domain logins called?',
        options: ['A Domain Controller (DC)', 'A Print Spooler', 'A Sound Card'],
        correctIndex: 0,
        explanation: 'Domain Controllers store the AD database and authenticate users via Kerberos.',
      },
      {
        question: 'If an employee enters the wrong password 5 times in a row, what typically happens in Active Directory?',
        options: [
          'Their AD account gets temporarily Locked Out for security until unlocked or timer expires',
          'Their laptop hard drive formats itself',
          'Their monitor turns upside down',
        ],
        correctIndex: 0,
        explanation: 'Account Lockout Policies block brute-force password guessing attacks.',
      },
    ],
  },
  {
    id: 'what-is-microsoft-365',
    number: 21,
    title: 'What is Microsoft 365?',
    chapter: 'Enterprise & Security',
    simpleExplanation:
      'Microsoft 365 (M365) is a cloud subscription platform used by modern companies for business email (Exchange/Outlook), chat & meetings (Teams), cloud files (OneDrive & SharePoint), and Office apps.',
    hinglishExplanation:
      'Microsoft 365 (pehle Office 365) companies ka all-in-one cloud suite hai jisme business Email (Outlook/Exchange), Teams meetings, OneDrive cloud backup, Word/Excel aur Entra ID login milta hai.',
    realLifeExample:
      'Instead of every small company buying and maintaining its own physical email server in a closet, Microsoft runs it in the cloud and companies assign licenses per employee!',
    flowTitle: 'Core Apps Inside the Microsoft 365 Admin Center',
    flowNodes: [
      { label: 'Entra ID', subtitle: 'Cloud Login & MFA', detail: 'Cloud version of Active Directory handling SSO & Authenticator push.' },
      { label: 'Exchange Online', subtitle: 'Business Email', detail: 'Powers `@yourcompany.com` mailboxes inside Outlook.' },
      { label: 'Teams', subtitle: 'Chat & Video Calls', detail: 'Daily company messaging, screen sharing, and meetings.' },
      { label: 'OneDrive / SharePoint', subtitle: 'Cloud Files', detail: 'Syncs personal Desktop/Documents and team sites safely.' },
    ],
    whyItMatters:
      'Almost every modern IT Support job posting lists "Microsoft 365 Admin Center, Exchange Online, Teams, and OneDrive troubleshooting" as a must-have skill!',
    commonMistakes: [
      'Removing a departed employee’s M365 license BEFORE converting their mailbox to a free Shared Mailbox—causing email loss after 30 days!',
      'Using accounts without Multi-Factor Authentication (MFA) enabled.',
    ],
    miniQuiz: [
      {
        question: 'Which backend service inside Microsoft 365 actually powers business `@company.com` email delivery?',
        options: ['Exchange Online', 'Microsoft Paint', 'Windows Media Player'],
        correctIndex: 0,
        explanation: 'Exchange Online is the cloud mail server behind Outlook mailboxes.',
      },
      {
        question: 'Where should employees save their daily work files in M365 so files survive if their laptop is lost or stolen?',
        options: ['Inside OneDrive / SharePoint synced folders', 'Inside the Recycle Bin', 'Only in RAM'],
        correctIndex: 0,
        explanation: 'OneDrive Known Folder Move automatically backs up Desktop, Documents, and Pictures to the cloud.',
      },
      {
        question: 'Before removing an ex-employee’s paid M365 license, how can IT keep their under-50GB mailbox free for their manager?',
        options: ['Convert it to a Shared Mailbox first', 'Print every email on paper', 'Take photos of the screen'],
        correctIndex: 0,
        explanation: 'Shared Mailboxes under 50 GB preserve emails in M365 without requiring a paid user license!',
      },
    ],
  },
  {
    id: 'what-is-cloud-computing',
    number: 22,
    title: 'What is Cloud Computing?',
    chapter: 'Enterprise & Security',
    simpleExplanation:
      'Cloud Computing means renting servers, storage, databases, and software on-demand over the internet (from Microsoft Azure, AWS, or Google Cloud) instead of buying physical servers yourself.',
    hinglishExplanation:
      'Cloud Computing ka simple matlab hai: khud ke mehenge server kharidne ke bajaye internet par Microsoft Azure, AWS ya Google Cloud ke giant data centers se servers/storage rent par lena!',
    realLifeExample:
      'Buying a diesel power generator for your house is like owning physical servers ("On-Premises"). Plugging into the city electricity grid and paying only for the units you use is "Cloud Computing"!',
    flowTitle: 'Three Flavors of Cloud: IaaS, PaaS, and SaaS',
    flowNodes: [
      { label: 'On-Premises', subtitle: 'You Own Everything', detail: 'You buy hardware racks, AC cooling, disks, and OS.' },
      { label: 'IaaS (VMs)', subtitle: 'Azure VM / AWS EC2', detail: 'Cloud manages hardware; you manage Windows/Linux OS & apps.' },
      { label: 'PaaS', subtitle: 'App Service / Cloud SQL', detail: 'Cloud manages hardware + OS; you just deploy your code/data!' },
      { label: 'SaaS', subtitle: 'M365 / Gmail / Zoom', detail: 'Ready-to-use software in a browser—zero server maintenance!' },
    ],
    whyItMatters:
      'Most companies today are "Hybrid"—combining office laptops and local WiFi with cloud workloads in Microsoft Azure or AWS.',
    commonMistakes: [
      'Leaving expensive high-CPU cloud test VMs running 24/7 over weekends when nobody is using them—causing huge cloud bills!',
      'Accidentally setting a Cloud Storage bucket to "Public Anonymous Read," leaking company files.',
    ],
    miniQuiz: [
      {
        question: 'What is the biggest advantage of Cloud Computing for a growing company?',
        options: [
          'Spin up servers globally in minutes and pay only for resources used',
          'Cloud servers work without internet',
          'Cloud makes keyboards waterproof',
        ],
        correctIndex: 0,
        explanation: 'Cloud platforms provide instant scalability, global regions, and pay-as-you-go pricing.',
      },
      {
        question: 'Name the three largest global Cloud Computing providers:',
        options: ['AWS, Microsoft Azure, and Google Cloud', 'Word, Excel, and PowerPoint', 'USB, HDMI, and VGA'],
        correctIndex: 0,
        explanation: 'Amazon Web Services (AWS), Microsoft Azure, and Google Cloud Platform (GCP) lead enterprise cloud.',
      },
      {
        question: 'Which category of cloud service is Gmail, Zoom, or Microsoft 365?',
        options: ['SaaS (Software as a Service)', 'Hardware cabling', 'CPU thermal paste'],
        correctIndex: 0,
        explanation: 'End-user cloud apps ready to use out of the box are Software as a Service (SaaS).',
      },
    ],
  },
  {
    id: 'what-is-cybersecurity',
    number: 23,
    title: 'What is Cybersecurity?',
    chapter: 'Enterprise & Security',
    simpleExplanation:
      'Cybersecurity is the practice of protecting computers, servers, networks, accounts, and sensitive data from hackers, phishing scams, ransomware viruses, and unauthorized access.',
    hinglishExplanation:
      'Cybersecurity ka matlab hai apne computers, accounts, passwords aur company data ko hackers, fake phishing emails aur ransomware attacks se mehfooz (protect) rakhna.',
    realLifeExample:
      'Locking your front door, installing CCTV cameras, and checking a visitor’s ID card before letting them into your building is physical security—Cybersecurity does the exact same thing digitally!',
    flowTitle: 'Defense-in-Depth: Layers That Stop Hackers',
    flowNodes: [
      { label: 'Human Vigilance', subtitle: 'Spot Phishing', detail: 'Check sender email carefully; never approve unexpected MFA prompts!' },
      { label: 'Strong Identity', subtitle: 'Unique Pass + MFA', detail: 'Multi-Factor Authentication blocks 99% of simple password thefts.' },
      { label: 'Endpoint Security', subtitle: 'EDR + Patching', detail: 'Antivirus/Defender and fast OS updates close security holes.' },
      { label: 'Immutable Backups', subtitle: 'Last Line of Defense', detail: 'Offline/locked backups let you recover even if ransomware strikes!' },
    ],
    whyItMatters:
      'Over 80% of corporate breaches begin with a simple phishing email or tricked helpdesk call—every IT Support engineer is a frontline cybersecurity defender!',
    commonMistakes: [
      'Reusing the exact same password across personal websites and work accounts.',
      'Tapping "Approve" on a surprise Microsoft Authenticator MFA notification on your phone when you were NOT logging in ("MFA Fatigue Attack")!',
    ],
    miniQuiz: [
      {
        question: 'What is "Phishing"?',
        options: [
          'Fake emails or fake login pages designed to trick users into handing over passwords or money',
          'Upgrading a laptop SSD',
          'Testing Ethernet cable speed',
        ],
        correctIndex: 0,
        explanation: 'Phishing impersonates trusted brands, banks, or bosses to steal credentials.',
      },
      {
        question: 'If your phone suddenly pops up an MFA "Approve Sign-In?" prompt while you are eating lunch and NOT logging in, what must you do?',
        options: [
          'Tap DENY immediately and report/change your password—someone has your password!',
          'Tap Approve so the popup goes away',
          'Delete your phone',
        ],
        correctIndex: 0,
        explanation: 'Unexpected MFA prompts mean an attacker already entered your password and hopes you tap Approve!',
      },
      {
        question: 'What type of malware encrypts all company files and demands money to unlock them?',
        options: ['Ransomware', 'Screen Saver', 'Disk Cleanup'],
        correctIndex: 0,
        explanation: 'Ransomware locks files with encryption; isolated immutable backups are the ultimate cure.',
      },
    ],
  },
  {
    id: 'what-is-a-firewall',
    number: 24,
    title: 'What is a Firewall?',
    chapter: 'Enterprise & Security',
    simpleExplanation:
      'A Firewall is a digital security guard that inspects every network connection trying to enter or leave your computer or office network—allowing safe traffic and blocking dangerous ports!',
    hinglishExplanation:
      'Firewall aapke network ya Windows PC ka "Security Guard" hota hai. Yeh har aane-jaane wale network traffic ko rules ke hisaab se check karta hai—safe traffic ko allow aur hackers ke ports ko block karta hai!',
    realLifeExample:
      'At an airport security gate, passengers with valid boarding passes on open flights walk through, while anyone carrying prohibited items is stopped immediately.',
    flowTitle: 'How Firewall Rules Filter Traffic by IP & Port',
    flowNodes: [
      { label: 'Incoming Packet', subtitle: 'Arrives at Edge', detail: 'Outside computer tries to connect to your server.' },
      { label: 'Firewall Rule Check', subtitle: 'Inspects IP & Port', detail: 'Rule 1: Allow HTTPS Port 443. Rule 2: Block RDP Port 3389!' },
      { label: 'Allowed (Port 443)', subtitle: 'Web Visitor Enters', detail: 'Customers view your secure HTTPS website normally.' },
      { label: 'Blocked (Port 3389)', subtitle: 'Hacker Dropped!', detail: 'Direct remote desktop attacks from the internet hit a brick wall!' },
    ],
    whyItMatters:
      'Sometimes a brand-new server app works locally on the server itself, yet nobody else in the office can open it—9 times out of 10, Windows Firewall or a cloud NSG firewall needs that TCP port allowed!',
    commonMistakes: [
      'Turning Windows Firewall completely OFF permanently instead of creating one clean Inbound Rule for the needed app port!',
      'Opening Remote Desktop (Port 3389) directly to the entire public internet (`0.0.0.0/0`).',
    ],
    miniQuiz: [
      {
        question: 'What is the core job of a Firewall?',
        options: [
          'Allow or block network traffic based on security rules (IP addresses, protocols, and ports)',
          'Physically cool down hot CPUs',
          'Make WiFi reach 10 kilometers',
        ],
        correctIndex: 0,
        explanation: 'Firewalls enforce network access control rules at the OS or network perimeter.',
      },
      {
        question: 'If a new internal web tool runs on TCP Port 8080 and nobody else can connect to it, what is the RIGHT way to fix Windows Firewall?',
        options: [
          'Create a specific Inbound Rule allowing TCP Port 8080 on the corporate Domain network',
          'Uninstall all security tools permanently',
          'Unplug the Ethernet cable',
        ],
        correctIndex: 0,
        explanation: 'Least-privilege firewall rules open only the exact required port while keeping everything else protected.',
      },
      {
        question: 'Why must Remote Desktop (Port 3389) NEVER be exposed directly to the open internet without a VPN or Bastion?',
        options: [
          'Automated hacker bots scan and attack open RDP ports 24/7 around the world',
          'Port 3389 uses too much screen brightness',
          'RDP only works on floppy disks',
        ],
        correctIndex: 0,
        explanation: 'Exposed RDP is one of the top entry vectors for corporate ransomware attacks.',
      },
    ],
  },
  {
    id: 'what-is-a-vpn',
    number: 25,
    title: 'What is a VPN?',
    chapter: 'Enterprise & Security',
    simpleExplanation:
      'A VPN (Virtual Private Network) creates a secret, encrypted "digital tunnel" across the public internet—allowing remote employees working from home or a hotel to securely access private office servers.',
    hinglishExplanation:
      'VPN (Virtual Private Network) public internet ke upar ek secret encrypted "surang" (tunnel) bana deta hai! Isse Work-From-Home employee ghar baithe safely office ke private servers aur folders khol sakta hai.',
    realLifeExample:
      'Driving an armored, tinted-window bank van down a public highway: other drivers on the highway can see a van exists, but nobody can see inside or touch what it carries—and it drives straight into the private bank vault!',
    flowTitle: 'Work-From-Home Laptop → Encrypted VPN Tunnel → Office LAN',
    flowNodes: [
      { label: 'Remote Laptop', subtitle: 'Home / Hotel WiFi', detail: 'Opens Cisco AnyConnect, FortiClient, GlobalProtect, or WireGuard.' },
      { label: 'MFA Login', subtitle: 'Identity Verified', detail: 'User enters corporate credentials + Authenticator approval.' },
      { label: 'Encrypted Tunnel', subtitle: 'Scrambled Packets', detail: 'Public WiFi snoops only see unreadable encrypted math!' },
      { label: 'Corporate Network', subtitle: 'Internal Access', detail: 'Laptop gets an internal office IP and opens private file shares!' },
    ],
    whyItMatters:
      'Supporting remote workers whose VPN will not connect—or who cannot open internal office apps because they forgot to connect their VPN first!—is a daily staple of modern IT Support.',
    commonMistakes: [
      'Employee submits a ticket "Internal company ERP website won’t open from home!" when they simply forgot to turn on their company VPN!',
      'Using sketchy "100% Free Unlimited VPN" browser extensions on corporate laptops.',
    ],
    miniQuiz: [
      {
        question: 'Why do companies ask Work-From-Home employees to connect to a Corporate VPN?',
        options: [
          'To create an encrypted tunnel into the company’s private internal network safely over the internet',
          'To charge their laptop without a power cord',
          'To clean dust out of the keyboard',
        ],
        correctIndex: 0,
        explanation: 'Corporate VPNs encrypt traffic and securely connect remote devices to internal servers.',
      },
      {
        question: 'A remote worker says: "YouTube works fine at home, but our internal `\\\\fileserver\\hr` folder says Network Path Not Found!" What do you check FIRST?',
        options: [
          'Verify whether their Corporate VPN client is connected!',
          'Tell them to buy a new monitor',
          'Reinstall Microsoft Word',
        ],
        correctIndex: 0,
        explanation: 'Private internal office servers are unreachable from home internet unless the corporate VPN tunnel is active!',
      },
      {
        question: 'Can someone sitting next to you on café WiFi read the data inside an active encrypted VPN tunnel?',
        options: [
          'No—the VPN encrypts traffic end-to-end between your laptop and the VPN server',
          'Yes, it shows up in plain text on their desktop',
          'Only if they wear sunglasses',
        ],
        correctIndex: 0,
        explanation: 'Strong IPSec/TLS/WireGuard encryption scrambles all tunnel packets against local WiFi eavesdropping.',
      },
    ],
  },
];
