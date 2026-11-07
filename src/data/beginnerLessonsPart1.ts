export interface LessonFlowNode {
  label: string;
  subtitle: string;
  detail: string;
}

export interface MiniQuizQuestion {
  question: string;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
  explanation: string;
}

export interface BeginnerLesson {
  id: string;
  number: number;
  title: string;
  chapter: 'Computer Basics' | 'Inside a PC' | 'Networking & Internet' | 'Enterprise & Security';
  simpleExplanation: string;
  hinglishExplanation: string;
  realLifeExample: string;
  flowTitle: string;
  flowNodes: LessonFlowNode[];
  whyItMatters: string;
  commonMistakes: string[];
  miniQuiz: [MiniQuizQuestion, MiniQuizQuestion, MiniQuizQuestion];
}

export const BEGINNER_LESSONS_PART_1: BeginnerLesson[] = [
  {
    id: 'what-is-a-computer',
    number: 1,
    title: 'What is a Computer?',
    chapter: 'Computer Basics',
    simpleExplanation:
      'A computer is an electronic smart machine that takes information from you (like typing or clicking), follows instructions to process it, and shows you a useful result on the screen.',
    hinglishExplanation:
      'Computer ek smart electronic machine hai jo aapse input leti hai (jaise keyboard type karna ya mouse click), usko fast process karti hai, aur screen par result (output) dikhati hai.',
    realLifeExample:
      'Think of a kitchen blender: you put fruit inside (Input), the blades spin to mix it (Processing), and you pour out a smoothie (Output).',
    flowTitle: 'Every Computer Follows This 4-Step Loop',
    flowNodes: [
      { label: 'Input', subtitle: 'Keyboard / Mouse / Mic', detail: 'You type text, click an icon, or speak into a microphone.' },
      { label: 'Process', subtitle: 'CPU Brain', detail: 'The processor calculates and follows app instructions in milliseconds.' },
      { label: 'Store', subtitle: 'RAM & SSD', detail: 'Data is held temporarily in memory or saved permanently on disk.' },
      { label: 'Output', subtitle: 'Screen / Speaker', detail: 'You see the webpage, video, or printed page!' },
    ],
    whyItMatters:
      'In IT Support, 90% of problems become easy when you ask: "Is this an Input problem, a Processing problem, a Storage problem, or an Output display problem?"',
    commonMistakes: [
      'Calling the monitor (screen) "the computer"—the screen only shows output; the real computer parts sit inside the laptop base or desktop tower.',
      'Assuming smartphones are not computers—phones, laptops, ATMs, and smart TVs are all computers!',
    ],
    miniQuiz: [
      {
        question: 'Which part of using a computer is considered "Input"?',
        options: ['Typing your name on a keyboard', 'Watching a movie on the monitor', 'Hearing music from speakers'],
        correctIndex: 0,
        explanation: 'Typing sends information INTO the computer, making the keyboard an input device.',
      },
      {
        question: 'If a desktop PC tower is turned on, what is the monitor’s job?',
        options: ['To store all your files permanently', 'To display visual Output from the computer', 'To connect WiFi to your router'],
        correctIndex: 1,
        explanation: 'The monitor is an output screen that displays what the computer processes.',
      },
      {
        question: 'Which of these everyday devices is ALSO a computer?',
        options: ['A wooden desk chair', 'A smartphone', 'A paper notebook'],
        correctIndex: 1,
        explanation: 'A smartphone has a CPU, RAM, storage, operating system, and input/output—it is a pocket computer!',
      },
    ],
  },
  {
    id: 'how-does-a-computer-work',
    number: 2,
    title: 'How Does a Computer Work?',
    chapter: 'Computer Basics',
    simpleExplanation:
      'Inside a computer, electricity switches tiny microscopic circuits ON (1) and OFF (0) billions of times per second. Programs combine those 1s and 0s into letters, photos, music, and websites.',
    hinglishExplanation:
      'Computer ke andar sirf bijli ke tiny switches hote hain: ON matlab 1 aur OFF matlab 0 (Binary). Crore switches milkar aapki photos, videos aur apps banate hain.',
    realLifeExample:
      'Just like Morse code uses short and long flashes of a flashlight to spell any sentence in English, computers use 1s and 0s to represent everything.',
    flowTitle: 'From Your Click to Screen Action',
    flowNodes: [
      { label: 'Your Click', subtitle: 'Open Browser', detail: 'You double-click Chrome or Edge on your desktop.' },
      { label: 'OS Translates', subtitle: 'Windows Kernel', detail: 'The Operating System asks the SSD for the app files.' },
      { label: 'RAM + CPU Work', subtitle: 'Binary Math', detail: 'Files load into fast RAM and the CPU runs billions of 1/0 steps.' },
      { label: 'Window Opens', subtitle: 'Pixels Drawn', detail: 'Graphics chip paints the browser window on your screen.' },
    ],
    whyItMatters:
      'Knowing the chain from storage → RAM → CPU → screen helps you spot why an app is slow to open versus why a display is frozen.',
    commonMistakes: [
      'Thinking computers "understand human feelings"—they strictly follow step-by-step rules!',
      'Confusing internet speed with computer speed—a PC can open local apps super fast even with WiFi turned off.',
    ],
    miniQuiz: [
      {
        question: 'What basic language of ON and OFF switches does every computer chip use?',
        options: ['Binary (1s and 0s)', 'HTML paragraphs', 'Radio FM waves'],
        correctIndex: 0,
        explanation: 'Transistors switch electricity ON (1) and OFF (0), known as binary.',
      },
      {
        question: 'When you double-click an app, where are its saved files copied BEFORE the CPU works on them?',
        options: ['Into the printer tray', 'Into fast RAM memory', 'Into the power cable'],
        correctIndex: 1,
        explanation: 'Apps are stored on the SSD/hard drive and loaded into fast RAM when opened.',
      },
      {
        question: 'Does a computer need internet access just to open Notepad or Calculator?',
        options: ['Yes, nothing opens without WiFi', 'No, local apps run using your own CPU and RAM', 'Only during daytime'],
        correctIndex: 1,
        explanation: 'Local software runs right on your computer hardware without needing the internet.',
      },
    ],
  },
  {
    id: 'what-is-hardware',
    number: 3,
    title: 'What is Hardware?',
    chapter: 'Computer Basics',
    simpleExplanation:
      'Hardware is every physical part of a computer system that you can actually touch with your hands—such as the screen, keyboard, mouse, motherboard, battery, and cables.',
    hinglishExplanation:
      'Computer ka har woh physical part jise aap haath se chhoo (touch) sakte ho—jaise screen, keyboard, mouse, battery, RAM stick—use Hardware kehte hain.',
    realLifeExample:
      'In a human body, your bones, hands, eyes, and heart are your physical "Hardware" (while your thoughts and languages are "Software").',
    flowTitle: 'External vs Internal Hardware',
    flowNodes: [
      { label: 'Peripherals', subtitle: 'Outside Parts', detail: 'Keyboard, mouse, webcam, headset, external monitor, printer.' },
      { label: 'Ports & Cables', subtitle: 'Connectors', detail: 'USB-C, HDMI, Ethernet RJ45, and power adapters.' },
      { label: 'Motherboard', subtitle: 'Main Circuit Board', detail: 'Connects all internal chips together so they can talk.' },
      { label: 'Core Chips', subtitle: 'Inside Case', detail: 'CPU, RAM sticks, NVMe SSD, cooling fan, and battery.' },
    ],
    whyItMatters:
      'IT Support engineers separate Hardware issues (broken cable, dead battery, overheating fan) from Software issues (corrupted setting, buggy update) in the first 60 seconds.',
    commonMistakes: [
      'Reinstalling Windows for 2 hours when the real problem was just a loose HDMI monitor cable!',
      'Blocking laptop bottom air vents on a soft bed or pillow, causing internal hardware to overheat.',
    ],
    miniQuiz: [
      {
        question: 'Which of the following is an example of Computer Hardware?',
        options: ['Microsoft Excel spreadsheet app', 'A physical USB mouse and SSD chip', 'An email attachment'],
        correctIndex: 1,
        explanation: 'A mouse and SSD chip are physical components you can hold—they are hardware.',
      },
      {
        question: 'What is the main circuit board inside a PC that connects the CPU, RAM, and SSD together?',
        options: ['The Motherboard', 'The Screen Saver', 'The Wallpaper'],
        correctIndex: 0,
        explanation: 'Every internal hardware part plugs into the Motherboard.',
      },
      {
        question: 'If a monitor stays completely black and its power LED light is off, what hardware item should you check FIRST?',
        options: ['Delete all files', 'Check the power cable and wall outlet switch', 'Change browser homepage'],
        correctIndex: 1,
        explanation: 'Always check simple physical power and display cables first!',
      },
    ],
  },
  {
    id: 'what-is-software',
    number: 4,
    title: 'What is Software?',
    chapter: 'Computer Basics',
    simpleExplanation:
      'Software is a collection of digital programs, apps, and instructions that tell the physical hardware what to do. You can see software on screen, but you cannot physically touch it.',
    hinglishExplanation:
      'Software digital apps aur programs hote hain jo hardware ko batate hain ki kya kaam karna hai—jaise Chrome, WhatsApp, Word, ya Windows. Ise aap touch nahi kar sakte.',
    realLifeExample:
      'A television set is Hardware, while the Netflix show or cricket match playing on it is like Software—hardware without software is just a blank box!',
    flowTitle: 'Two Main Types of Software',
    flowNodes: [
      { label: 'Hardware', subtitle: 'Physical Machine', detail: 'Raw metal, silicon chips, screen, and keyboard.' },
      { label: 'System Software', subtitle: 'OS & Drivers', detail: 'Windows, macOS, Linux, and device drivers managing hardware.' },
      { label: 'App Software', subtitle: 'Daily Tools', detail: 'Chrome, Outlook, Teams, Excel, Zoom, and games.' },
      { label: 'Your Work', subtitle: 'Files & Tasks', detail: 'Emails sent, reports written, and calls completed.' },
    ],
    whyItMatters:
      'Most daily helpdesk tickets involve updating, configuring, repairing, or reinstalling application software and drivers.',
    commonMistakes: [
      'Downloading "free cracked software" from random websites—the #1 way malware infects PCs.',
      'Deleting program folders directly from C:\\Program Files instead of using Settings → Installed Apps → Uninstall.',
    ],
    miniQuiz: [
      {
        question: 'Which item below is Software?',
        options: ['Google Chrome web browser', 'Laptop cooling fan', 'HDMI cable'],
        correctIndex: 0,
        explanation: 'Google Chrome is a digital application program (software).',
      },
      {
        question: 'What is the proper way to remove an unwanted program in Windows?',
        options: ['Smash the Esc key', 'Use Windows Settings → Apps → Uninstall', 'Unplug the monitor'],
        correctIndex: 1,
        explanation: 'Using the built-in Uninstaller cleanly removes registry entries and background services.',
      },
      {
        question: 'What small piece of system software helps Windows talk to a new printer or graphics card?',
        options: ['A Device Driver', 'A Wallpaper JPG', 'A Mouse Pad'],
        correctIndex: 0,
        explanation: 'Device drivers act as translators between the Operating System and specific hardware.',
      },
    ],
  },
  {
    id: 'what-is-an-operating-system',
    number: 5,
    title: 'What is an Operating System?',
    chapter: 'Computer Basics',
    simpleExplanation:
      'An Operating System (OS) is the master boss software of a computer. It starts when you press the power button and manages all hardware, memory, files, and apps so you do not have to write code.',
    hinglishExplanation:
      'Operating System (OS) computer ka main manager hota hai (jaise Windows, macOS, Android, iOS, Linux). Yeh hardware aur apps ke beech bridge ka kaam karta hai.',
    realLifeExample:
      'Think of a restaurant manager: customers (Apps) place orders, and the manager (Operating System) coordinates the chefs, stove, and ingredients (Hardware) smoothly without chaos.',
    flowTitle: 'How the Operating System Sits in the Middle',
    flowNodes: [
      { label: 'You (User)', subtitle: 'Clicks & Touch', detail: 'You interact with icons, folders, and menus.' },
      { label: 'Applications', subtitle: 'Outlook / Chrome', detail: 'Apps ask the OS for memory, internet, or screen space.' },
      { label: 'Operating System', subtitle: 'Windows / Linux / macOS', detail: 'Schedules CPU tasks, enforces security, and prevents app crashes.' },
      { label: 'Hardware', subtitle: 'CPU / RAM / Disk', detail: 'Executes the low-level electrical work.' },
    ],
    whyItMatters:
      'Every IT job specifies which Operating Systems you support—Windows 11 for office PCs, Windows Server & Linux for backend servers, iOS & Android for mobile.',
    commonMistakes: [
      'Confusing Microsoft Office (Word/Excel) with the Windows Operating System—Windows is the OS; Office is an app pack installed ON Windows.',
      'Skipping OS security updates for months, leaving known security holes open.',
    ],
    miniQuiz: [
      {
        question: 'Which list contains ONLY Operating Systems?',
        options: ['Windows 11, macOS, Linux, Android', 'Word, Excel, PowerPoint, Paint', 'Mouse, Keyboard, Monitor, Printer'],
        correctIndex: 0,
        explanation: 'Windows, macOS, Linux, iOS, and Android are Operating Systems.',
      },
      {
        question: 'Can you install Chrome or Outlook on a blank PC that has NO Operating System?',
        options: ['Yes, apps install directly onto the power cord', 'No, an Operating System must be installed first to run desktop apps', 'Only if the mouse is wireless'],
        correctIndex: 1,
        explanation: 'Desktop apps rely on the Operating System to access screen, disk, and memory.',
      },
      {
        question: 'Which free, open-source Operating System powers most of the world’s cloud servers?',
        options: ['Linux', 'Notepad', 'Adobe Reader'],
        correctIndex: 0,
        explanation: 'Linux powers the vast majority of cloud infrastructure, web servers, and containers.',
      },
    ],
  },
  {
    id: 'what-is-windows',
    number: 6,
    title: 'What is Windows?',
    chapter: 'Computer Basics',
    simpleExplanation:
      'Microsoft Windows (such as Windows 10 and Windows 11) is the most widely used desktop Operating System in offices, schools, banks, and businesses around the world.',
    hinglishExplanation:
      'Microsoft Windows duniya ka sabse popular laptop/desktop Operating System hai. Office companies mein 80%+ computers Windows 10 ya Windows 11 chalate hain.',
    realLifeExample:
      'It is called "Windows" because it lets you open multiple rectangular app boxes ("windows") side-by-side on your Desktop at the same time!',
    flowTitle: 'Key Tools Inside Windows Every IT Tech Uses',
    flowNodes: [
      { label: 'Start & Settings', subtitle: 'Win + I', detail: 'Manage WiFi, Bluetooth, Windows Update, accounts, and apps.' },
      { label: 'File Explorer', subtitle: 'Win + E', detail: 'Browse C: drive, Downloads, Documents, and shared network folders.' },
      { label: 'Task Manager', subtitle: 'Ctrl + Shift + Esc', detail: 'See which apps use CPU/RAM and close frozen programs.' },
      { label: 'Command / PowerShell', subtitle: 'Admin CLI', detail: 'Run fast diagnostic and repair commands like ipconfig and sfc.' },
    ],
    whyItMatters:
      'Mastering Windows shortcuts, Settings, Task Manager, Device Manager, and Event Viewer immediately prepares you for L1 Helpdesk & Desktop Support roles.',
    commonMistakes: [
      'Holding the physical power button to shut down every day instead of clicking Start → Shut down (can corrupt open files!).',
      'Saving critical business files only on the Desktop without OneDrive or backup enabled.',
    ],
    miniQuiz: [
      {
        question: 'Which keyboard shortcut opens Windows Task Manager directly to close a frozen app?',
        options: ['Ctrl + Shift + Esc', 'Alt + F4 on Desktop', 'Ctrl + P'],
        correctIndex: 0,
        explanation: 'Ctrl + Shift + Esc opens Task Manager instantly without extra menus!',
      },
      {
        question: 'What drive letter does Windows almost always use for its main system installation?',
        options: ['C: drive', 'Z: drive', 'Q: drive'],
        correctIndex: 0,
        explanation: 'By convention, Windows installs onto C:\\ (for example, C:\\Windows).',
      },
      {
        question: 'Which Windows tool shows hardware driver warnings (yellow exclamation marks)?',
        options: ['Device Manager', 'Paint', 'Calculator'],
        correctIndex: 0,
        explanation: 'Device Manager lists all hardware devices and highlights missing or broken drivers.',
      },
    ],
  },
  {
    id: 'what-is-ram',
    number: 7,
    title: 'What is RAM?',
    chapter: 'Inside a PC',
    simpleExplanation:
      'RAM (Random Access Memory) is your computer’s super-fast short-term working memory. Every app and browser tab you currently have open lives in RAM—and clears out when you turn the PC off.',
    hinglishExplanation:
      'RAM computer ki fast "short-term memory" hai. Jo bhi apps aur Chrome tabs abhi khule hain woh RAM mein rehte hain. PC band karte hi RAM khali (reset) ho jaati hai!',
    realLifeExample:
      'RAM is like the top of your office desk, while your SSD/Hard Drive is your big filing cabinet. A bigger desk (16 GB RAM vs 4 GB RAM) lets you spread out 20 open books at once without slowing down!',
    flowTitle: 'How RAM Works With Your Storage Drive',
    flowNodes: [
      { label: 'PC Off', subtitle: 'RAM is Empty', detail: 'All your saved documents rest safely inside your SSD filing cabinet.' },
      { label: 'Open 15 Tabs', subtitle: 'Copied to RAM', detail: 'Active browser tabs, Teams, and Excel load into ultra-fast RAM.' },
      { label: 'Fast Switching', subtitle: 'Nanosecond Access', detail: 'CPU reads from RAM ~50x faster than older storage.' },
      { label: 'RAM Full!', subtitle: 'PC Feels Laggy', detail: 'If 100% RAM fills up, Windows spills onto slower disk ("paging"), causing lag.' },
    ],
    whyItMatters:
      'When a user complains "My laptop freezes when Chrome, Teams, and Excel are open together," checking RAM usage in Task Manager is Step #1!',
    commonMistakes: [
      'Confusing "8 GB RAM" with "512 GB Storage"—deleting old vacation photos from Downloads frees up Storage, NOT RAM!',
      'Buying 4 GB or 8 GB soldered laptops for heavy business multitasking (16 GB RAM is today’s sweet spot).',
    ],
    miniQuiz: [
      {
        question: 'What happens to unsaved data sitting only in RAM if the desktop PC loses electricity?',
        options: ['It disappears because RAM is temporary (volatile) memory', 'It stays in RAM for 10 years', 'It prints automatically'],
        correctIndex: 0,
        explanation: 'RAM is volatile memory—it needs continuous electricity and clears on shutdown/power loss.',
      },
      {
        question: 'Will deleting old movies from your Downloads folder increase your PC’s RAM?',
        options: ['Yes, it doubles your RAM', 'No, deleting files frees disk storage; closing open apps/tabs frees RAM', 'Only on Mondays'],
        correctIndex: 1,
        explanation: 'Downloads sit on your SSD/Hard Drive; open running programs consume RAM.',
      },
      {
        question: 'How much RAM is generally recommended today for smooth Windows 11 office multitasking?',
        options: ['16 GB RAM', '512 MB RAM', '1 KB RAM'],
        correctIndex: 0,
        explanation: '16 GB RAM handles Windows 11, Teams, Outlook, and 20+ browser tabs comfortably.',
      },
    ],
  },
  {
    id: 'what-is-a-hard-disk',
    number: 8,
    title: 'What is a Hard Disk?',
    chapter: 'Inside a PC',
    simpleExplanation:
      'A Hard Disk Drive (HDD) is a traditional permanent storage device that saves your files on spinning magnetic metal platters—even when the computer is turned off.',
    hinglishExplanation:
      'Hard Disk (HDD) purani style ki permanent storage hoti hai jisme gol magnetic plates ghoomti (spin karti) hain. PC band hone par bhi aapka data isme safe rehta hai.',
    realLifeExample:
      'An HDD works like a vinyl record player: a tiny mechanical arm moves physically across a spinning magnetic disc to read or write your photos and videos.',
    flowTitle: 'Inside a Mechanical Hard Disk Drive (HDD)',
    flowNodes: [
      { label: 'Spinning Platter', subtitle: '5400 / 7200 RPM', detail: 'Magnetic discs spin thousands of times per minute.' },
      { label: 'Read/Write Head', subtitle: 'Moving Arm', detail: 'Physical arm jumps across tracks to locate your file.' },
      { label: 'Permanent Data', subtitle: 'Non-Volatile', detail: 'Files stay saved without power for years.' },
      { label: 'Drop Risk!', subtitle: 'Fragile Mechanics', detail: 'Dropping a running HDD can scratch platters ("clicking noise").' },
    ],
    whyItMatters:
      'Many older slow office PCs and large cheap backup NAS servers still use HDDs. Hearing a "click-click-click" noise from an HDD means back up data IMMEDIATELY!',
    commonMistakes: [
      'Running Windows 11 directly on a mechanical HDD—causes 100% Disk Usage and 3-minute boot times.',
      'Bumping or moving a desktop/external HDD while it is actively copying files.',
    ],
    miniQuiz: [
      {
        question: 'Why are traditional Hard Disk Drives (HDDs) slower and more fragile than modern SSDs?',
        options: ['They have physical spinning platters and moving mechanical arms', 'They run on water', 'They delete files every night'],
        correctIndex: 0,
        explanation: 'Waiting for physical platters to spin and arms to move creates mechanical delay and drop fragility.',
      },
      {
        question: 'Does a Hard Disk keep your saved photos when you shut down the computer?',
        options: ['Yes, it is permanent (non-volatile) storage', 'No, everything erases on shutdown', 'Only if WiFi stays on'],
        correctIndex: 0,
        explanation: 'Both HDDs and SSDs are non-volatile permanent storage.',
      },
      {
        question: 'If a user’s external hard drive starts making a rhythmic clicking noise, what should you do FIRST?',
        options: ['Shake it hard', 'Back up critical files immediately before complete mechanical failure', 'Format the drive'],
        correctIndex: 1,
        explanation: 'Clicking ("click of death") indicates failing read/write heads—copy critical files out first!',
      },
    ],
  },
  {
    id: 'what-is-an-ssd',
    number: 9,
    title: 'What is an SSD?',
    chapter: 'Inside a PC',
    simpleExplanation:
      'An SSD (Solid State Drive) is modern, ultra-fast permanent storage made of silent flash memory chips with ZERO moving parts. It makes laptops boot in 10 seconds!',
    hinglishExplanation:
      'SSD (Solid State Drive) nayi generation ki permanent storage hai jisme koi moving part nahi hota—sirf fast flash chips hoti hain. Isse laptop 10 second mein start ho jata hai!',
    realLifeExample:
      'Finding a song on an old cassette tape (HDD) requires rewinding physical tape, while tapping a song on your phone (SSD) jumps to it instantly!',
    flowTitle: 'HDD vs SATA SSD vs NVMe M.2 SSD Speed',
    flowNodes: [
      { label: 'Old HDD', subtitle: '~120 MB/s', detail: 'Spinning platters; slow Windows boot (1–3 minutes).' },
      { label: 'SATA SSD', subtitle: '~550 MB/s', detail: '5x faster; great drop-in upgrade for older PCs.' },
      { label: 'NVMe M.2 SSD', subtitle: '3,500 – 7,000 MB/s', detail: 'Stick-of-gum chip plugged straight into modern motherboards!' },
      { label: 'Instant Responsiveness', subtitle: 'Silent & Shockproof', detail: 'Apps launch in 1 second with zero noise.' },
    ],
    whyItMatters:
      'Upgrading an older office PC from a spinning HDD to an SSD is the single highest-impact hardware upgrade in IT Support.',
    commonMistakes: [
      'Running manual "Disk Defragment" loops on an SSD—SSDs do not need traditional defragging (Windows runs TRIM automatically instead).',
      'Filling an SSD to 99.9% full, which slows down its write performance and blocks Windows Updates.',
    ],
    miniQuiz: [
      {
        question: 'How many moving mechanical parts are inside an SSD?',
        options: ['Zero—it uses solid-state flash memory chips', 'Four spinning wheels', 'Two cooling fans'],
        correctIndex: 0,
        explanation: '"Solid State" means zero moving parts—making it silent, shock-resistant, and super fast.',
      },
      {
        question: 'Which modern SSD type looks like a slim stick of gum and reaches speeds over 3,500 MB/s?',
        options: ['NVMe M.2 SSD', 'Floppy Disk', 'DVD-ROM'],
        correctIndex: 0,
        explanation: 'NVMe M.2 SSDs connect directly over high-speed PCIe lanes on the motherboard.',
      },
      {
        question: 'If an older laptop takes 3 minutes to boot and shows 100% Disk Usage on an HDD, what is the best upgrade?',
        options: ['Replace the HDD with an SSD', 'Buy a bigger mouse pad', 'Change desktop wallpaper'],
        correctIndex: 0,
        explanation: 'Replacing a bottlenecked mechanical HDD with an SSD transforms boot and app load speeds.',
      },
    ],
  },
  {
    id: 'what-is-a-cpu',
    number: 10,
    title: 'What is a CPU?',
    chapter: 'Inside a PC',
    simpleExplanation:
      'The CPU (Central Processing Unit)—made by brands like Intel, AMD, or Apple—is the "brain" of the computer. It executes decisions, math, and instructions for every running program.',
    hinglishExplanation:
      'CPU (Central Processing Unit)—jaise Intel Core i5/i7, AMD Ryzen, ya Apple M-series—computer ka asli "Dimaag" (Brain) hota hai jo saare calculations aur decisions leta hai.',
    realLifeExample:
      'In a busy kitchen, the CPU is the Head Chef: a multi-core CPU is like having 8 chefs working side-by-side on 8 dishes at once!',
    flowTitle: 'How the CPU Executes Billions of Tasks',
    flowNodes: [
      { label: 'Fetch', subtitle: 'Read Instruction', detail: 'CPU grabs the next app instruction waiting in RAM.' },
      { label: 'Decode', subtitle: 'Understand Task', detail: 'Control unit translates what calculation is needed.' },
      { label: 'Execute', subtitle: 'Cores & Threads', detail: 'Multiple cores solve math/logic at 3+ Billion cycles/sec (GHz).' },
      { label: 'Cooling Needed!', subtitle: 'Heatsink + Fan', detail: 'Hard thinking creates heat—thermal paste and fans keep it cool.' },
    ],
    whyItMatters:
      'High 100% CPU usage in Task Manager causes fans to roar loudly and video calls to stutter. Checking which process hogs the CPU solves slow-PC tickets fast!',
    commonMistakes: [
      'Calling the entire desktop cabinet "the CPU"—the cabinet is the PC case/tower; the CPU is a small square chip inside!',
      'Letting dust clog laptop cooling vents so the CPU overheats and slows itself down ("thermal throttling").',
    ],
    miniQuiz: [
      {
        question: 'What role does the CPU play inside a computer?',
        options: ['It acts as the "Brain" executing program instructions and calculations', 'It stores 2 TB of movies offline', 'It supplies backup battery power'],
        correctIndex: 0,
        explanation: 'The Central Processing Unit executes logic and calculations for the OS and all apps.',
      },
      {
        question: 'What does a "Quad-Core" or "8-Core" CPU allow a computer to do?',
        options: ['Process multiple tasks in parallel at the same time', 'Connect 8 monitors without cables', 'Print in 8 colors'],
        correctIndex: 0,
        explanation: 'Each core acts like an independent processing lane handling tasks simultaneously.',
      },
      {
        question: 'Why does a CPU have a metal heatsink and cooling fan sitting right on top of it?',
        options: ['Because billions of electrical calculations generate heat that must be cooled', 'To blow dust onto the screen', 'To make sound effects'],
        correctIndex: 0,
        explanation: 'Without proper cooling, a CPU reaches ~100°C and slows down to protect itself.',
      },
    ],
  },
  {
    id: 'what-is-an-ip-address',
    number: 11,
    title: 'What is an IP Address?',
    chapter: 'Networking & Internet',
    simpleExplanation:
      'An IP address (Internet Protocol address) is like your home’s street address, but for a computer, phone, or printer on a network—so data packets know exactly where to go and return!',
    hinglishExplanation:
      'Jaise Swiggy/Amazon delivery ke liye aapke ghar ka exact address zaroori hota hai, waise hi network par har laptop, phone aur printer ka ek digital number address hota hai—jise IP Address kehte hain (jaise 192.168.1.25).',
    realLifeExample:
      'If you mail a letter without a return address or destination house number, the post office cannot deliver it. Every internet message carries a Source IP and Destination IP!',
    flowTitle: 'Laptop → Router → Internet Using IP Addresses',
    flowNodes: [
      { label: 'Your Laptop', subtitle: 'Private IP: 192.168.1.25', detail: 'Unique local room/home address given by your WiFi router.' },
      { label: 'WiFi Router', subtitle: 'Gateway: 192.168.1.1', detail: 'Collects traffic from your home devices and translates to 1 Public IP.' },
      { label: 'Internet Highway', subtitle: 'Public IP: 49.36.120.8', detail: 'ISP routes your request across global networks.' },
      { label: 'Website Server', subtitle: 'Server IP: 142.250.183.14', detail: 'Sends the webpage right back to your exact IP address!' },
    ],
    whyItMatters:
      'Checking the IP address (`ipconfig`) is the very first command every IT engineer runs when internet, WiFi, or a network printer stops working.',
    commonMistakes: [
      'Giving two office devices the exact same static IP address—causes an "IP Address Conflict" knocking both offline!',
      'Ignoring a 169.254.x.x IP address—that special number means the PC failed to contact the router/DHCP server.',
    ],
    miniQuiz: [
      {
        question: 'Why does a computer or smartphone need an IP address?',
        options: [
          'So routers and servers know where to send and return network data',
          'To make the screen brighter',
          'To charge the battery faster',
        ],
        correctIndex: 0,
        explanation: 'Just like a postal house address, an IP address identifies each device on a network.',
      },
      {
        question: 'Which of these looks like a valid standard IPv4 address?',
        options: ['192.168.1.25', '999.888.777.1', 'www.laptop@home'],
        correctIndex: 0,
        explanation: 'IPv4 addresses have 4 numbers separated by dots, each between 0 and 255.',
      },
      {
        question: 'Which command do you type in Windows Command Prompt to check your own IP address?',
        options: ['ipconfig', 'notepad', 'calc'],
        correctIndex: 0,
        explanation: 'Running ipconfig displays your IPv4 address, Subnet Mask, and Default Gateway.',
      },
    ],
  },
  {
    id: 'what-is-wifi',
    number: 12,
    title: 'What is WiFi?',
    chapter: 'Networking & Internet',
    simpleExplanation:
      'WiFi is invisible wireless radio waves that connect your laptop or phone to your local router without needing a physical Ethernet cable. Note: WiFi itself is NOT the internet!',
    hinglishExplanation:
      'WiFi invisible radio waves hoti hain jo aapke phone/laptop ko bina taar (cable) ke router se jode rakhti hain. Dhyan rahe: "WiFi connected" ka matlab hamesha internet chalu hona nahi hota!',
    realLifeExample:
      'WiFi is like a cordless telephone handset talking to its base station in your living room. If the outside telephone pole line is cut, the handset still connects to the base ("WiFi Connected, No Internet")!',
    flowTitle: '2.4 GHz vs 5 GHz WiFi Radio Bands',
    flowNodes: [
      { label: 'Your Device', subtitle: 'WiFi Radio Card', detail: 'Connects to SSID network name using WPA2/WPA3 password.' },
      { label: '2.4 GHz Band', subtitle: 'Longer Range', detail: 'Passes through thick walls better, but slower and more crowded.' },
      { label: '5 GHz / 6 GHz', subtitle: 'Ultra Fast Speed', detail: 'Blazing fast for video calls & downloads when closer to the router.' },
      { label: 'Access Point', subtitle: 'Sends to Cable LAN', detail: 'Hands wireless packets onto the wired internet connection.' },
    ],
    whyItMatters:
      '"WiFi Connected, No Internet" is one of the top 5 tickets in IT Support—now you immediately know it means Laptop ↔ Router WiFi works, while Router ↔ ISP WAN is down!',
    commonMistakes: [
      'Hiding the WiFi router inside a closed metal cupboard or behind an aquarium (water & metal block WiFi waves!).',
      'Leaving public or guest WiFi completely open without a WPA2/WPA3 password.',
    ],
    miniQuiz: [
      {
        question: 'What does "WiFi Connected, No Internet" actually mean?',
        options: [
          'Your laptop is talking to your WiFi router, but the router cannot reach the outside internet',
          'Your laptop screen is broken',
          'Your keyboard battery is empty',
        ],
        correctIndex: 0,
        explanation: 'WiFi is just the local wireless bridge to your router; the router still needs a working ISP internet link.',
      },
      {
        question: 'Which WiFi frequency band gives faster speeds with less interference when sitting in the same room as the router?',
        options: ['5 GHz (or 6 GHz)', '0.1 Hz', 'AM Radio'],
        correctIndex: 0,
        explanation: '5 GHz and 6 GHz offer much wider, cleaner, faster channels than crowded 2.4 GHz.',
      },
      {
        question: 'For a stationary office desktop PC or server that needs rock-solid stability, what is even more reliable than WiFi?',
        options: ['A wired Cat6 Ethernet cable', 'Bluetooth', 'Airplane Mode'],
        correctIndex: 0,
        explanation: 'Wired Ethernet cables are immune to wireless wall interference and give consistent low latency.',
      },
    ],
  },
  {
    id: 'what-is-a-router',
    number: 13,
    title: 'What is a Router?',
    chapter: 'Networking & Internet',
    simpleExplanation:
      'A Router is the "traffic police officer" of your network. It sits between your local home/office devices and the outside internet, directing every data packet to the right device.',
    hinglishExplanation:
      'Router aapke ghar ya office ka "Traffic Police" hota hai. Ek internet connection ko 10–50 devices (phones, TV, laptops) mein smartly baantna aur sahi device tak data pahunchana Router ka kaam hai.',
    realLifeExample:
      'When 4 family members watch 4 different YouTube videos on the same internet line, the Router makes sure Dad’s cricket stream goes to the TV while your tutorial goes to your laptop!',
    flowTitle: 'How a Router Directs Local & Internet Traffic',
    flowNodes: [
      { label: 'Phone & Laptop', subtitle: 'Inside LAN', detail: 'Multiple devices share the private 192.168.1.x network.' },
      { label: 'Router (Gateway)', subtitle: 'Traffic Director', detail: 'Reads IP headers, runs NAT firewall, and assigns DHCP IPs.' },
      { label: 'Local Traffic', subtitle: 'Laptop → Printer', detail: 'Stays inside your office without even touching the internet!' },
      { label: 'Internet Traffic', subtitle: 'Router → Modem/ISP', detail: 'Forwards outside web requests out the WAN port.' },
    ],
    whyItMatters:
      'Your router’s internal IP address is called the "Default Gateway." Pinging the Default Gateway tells an engineer instantly whether the local network is healthy.',
    commonMistakes: [
      'Pressing the tiny pinhole "RESET" button on a router instead of power-cycling—wiping out ISP settings and WiFi passwords!',
      'Keeping the router admin login password set to default "admin / admin".',
    ],
    miniQuiz: [
      {
        question: 'What is the main job of a Router?',
        options: [
          'Direct network traffic between your local devices and the outside internet',
          'Cool down the laptop CPU',
          'Store Excel spreadsheets permanently',
        ],
        correctIndex: 0,
        explanation: 'Routers forward IP packets between different networks (like your home LAN and the Internet WAN).',
      },
      {
        question: 'In Windows ipconfig output, what is your local router’s IP address called?',
        options: ['Default Gateway', 'Screen Resolution', 'Audio Output'],
        correctIndex: 0,
        explanation: 'The Default Gateway is the router door your PC uses to reach outside networks.',
      },
      {
        question: 'Why should you be careful NOT to hold the pinhole "Reset" button on an office router?',
        options: [
          'It erases all saved router configurations back to factory blank defaults',
          'It changes your monitor color',
          'It installs Microsoft Word',
        ],
        correctIndex: 0,
        explanation: 'Unplugging power for 15 seconds reboots safely; holding pinhole Reset wipes all configuration!',
      },
    ],
  },
];
