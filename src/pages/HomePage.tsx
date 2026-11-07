import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calculator,
  CheckCircle2,
  Cloud,
  Cpu,
  Flame,
  GraduationCap,
  HardDrive,
  Headphones,
  Layers,
  Lock,
  Network,
  Play,
  Search,
  Server,
  Shield,
  Sparkles,
  Terminal,
  Trophy,
  Wifi,
  Zap,
} from 'lucide-react';
import beginnerImg from '../assets/images/level_complete_beginner_1793481764840.jpg';
import learnerImg from '../assets/images/level_it_learner_1793481765578.jpg';
import proImg from '../assets/images/level_it_professional_1793481765438.jpg';
import { ALL_CATEGORIES, ALL_ISSUES } from '../data/issuesIndex';
import { BEGINNER_LESSONS } from '../data/beginnerLessonsData';
import { SIMULATOR_SCENARIOS } from '../data/simulatorData';
import { VISUAL_LEARNING_LABS } from '../data/learningLabData';
import {
  getSearchSuggestions,
  POPULAR_SEARCH_EXAMPLES,
} from '../utils/searchEngine';
import { IssueCard } from '../components/IssueCard';
import { AboutDeveloperSection } from '../components/DeveloperBranding';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { usePageSEO } from '../utils/seo';

const HERO_FLOW_NODES = [
  {
    step: '01',
    title: 'Your Laptop',
    subtitle: 'IP: 192.168.1.25',
    detail: 'Browser prepares an HTTPS request & checks local WiFi IP lease.',
    icon: Cpu,
  },
  {
    step: '02',
    title: 'WiFi Router',
    subtitle: 'Gateway: 192.168.1.1',
    detail: 'Translates private LAN IP to Public WAN IP via NAT.',
    icon: Wifi,
  },
  {
    step: '03',
    title: 'DNS Server',
    subtitle: 'Resolver: 1.1.1.1',
    detail: 'Looks up the website domain name and returns the server IP.',
    icon: Network,
  },
  {
    step: '04',
    title: 'Cloud Server',
    subtitle: 'HTTPS Port 443',
    detail: 'Completes TLS encryption and streams the webpage in 40ms!',
    icon: Cloud,
  },
];

const EXPLORE_TECH_DOMAINS = [
  {
    title: 'Windows 10 & 11',
    desc: 'Boot repairs, BSOD codes, Registry, BitLocker & Windows Update fixes.',
    to: '/windows-troubleshooting',
    icon: Cpu,
  },
  {
    title: 'Networking & WiFi',
    desc: 'IPv4 subnetting, DNS, DHCP DORA, VLAN trunks, routing & packet loss.',
    to: '/networking-solutions',
    icon: Network,
  },
  {
    title: 'Hardware & Printers',
    desc: 'CPU thermals, RAM/NVMe diagnostics, docking stations & Print Spooler.',
    to: '/issues?category=Laptop%20%26%20Desktop%20Hardware',
    icon: HardDrive,
  },
  {
    title: 'Active Directory',
    desc: 'Domain Controllers, Kerberos tickets, Event ID 4740 lockouts & GPOs.',
    to: '/active-directory-guide',
    icon: Shield,
  },
  {
    title: 'Microsoft 365',
    desc: 'Entra ID MFA, Exchange Online mail flow, Teams & Outlook profiles.',
    to: '/microsoft-365-guide',
    icon: Layers,
  },
  {
    title: 'Linux Systems',
    desc: 'Systemd services, disk space / inode rescue, permissions & SSH.',
    to: '/linux-troubleshooting',
    icon: Terminal,
  },
  {
    title: 'Azure & Cloud',
    desc: 'VNets, NSGs, Private Endpoints, hybrid sync & Windows Server.',
    to: '/azure-cloud-guide',
    icon: Cloud,
  },
  {
    title: 'Cybersecurity & VPN',
    desc: 'Firewalls, IPSec/SSL VPN MTU blackholes, phishing & endpoint defense.',
    to: '/issues?category=Cybersecurity',
    icon: Lock,
  },
];

export const HomePage: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [focused, setFocused] = useState(false);
  const [heroNodeIdx, setHeroNodeIdx] = useState(0);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const { progress, levelInfo, badgeCatalog } = useLearningProgress();

  usePageSEO({
    title: 'IT SUPPORT — Your Complete IT Troubleshooting Guide',
    description:
      'Solve 325+ real-world Windows, Networking, Active Directory, Microsoft 365, Linux, and Azure issues with step-by-step fixes, commands, subnet tools, and IT SUPPORT AI.',
    canonicalPath: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'IT SUPPORT',
      alternateName: 'Your Complete IT Troubleshooting Guide',
      url: 'https://it-support-engg.vercel.app/',
      description:
        'Public IT troubleshooting knowledge base with 325+ real-world step-by-step solutions, Windows/Linux/AD/M365 guides, IT commands library, subnet calculators, interview prep, learning roadmap, and IT SUPPORT AI.',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://it-support-engg.vercel.app/issues?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  });

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const timer = window.setInterval(() => {
      setHeroNodeIdx((prev) => (prev + 1) % HERO_FLOW_NODES.length);
    }, 2400);
    return () => window.clearInterval(timer);
  }, []);

  const liveSuggestions = useMemo(
    () => getSearchSuggestions(ALL_ISSUES, searchInput, 6),
    [searchInput]
  );

  const featuredIssues = useMemo(() => {
    const preferredIds = [
      'WIN-001',
      'NET-001',
      'AD-001',
      'OUT-001',
      'LIN-001',
      'AZ-001',
    ];
    const picked = preferredIds
      .map((id) => ALL_ISSUES.find((i) => i.id === id))
      .filter((i): i is NonNullable<typeof i> => Boolean(i));
    return picked.length >= 6 ? picked : ALL_ISSUES.slice(0, 6);
  }, []);

  const resumeLesson = useMemo(() => {
    if (progress.lastVisitedLessonId) {
      return (
        BEGINNER_LESSONS.find((l) => l.id === progress.lastVisitedLessonId) ||
        BEGINNER_LESSONS[0]
      );
    }
    const nextUnfinished = BEGINNER_LESSONS.find(
      (l) => !progress.completedLessonIds.includes(l.id)
    );
    return nextUnfinished || BEGINNER_LESSONS[0];
  }, [progress.lastVisitedLessonId, progress.completedLessonIds]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    if (q) {
      import('../utils/analytics').then(({ trackEvent }) => {
        trackEvent('internal_search', { search_term: q, source: 'home_hero' });
      });
    }
    navigate(q ? `/issues?q=${encodeURIComponent(q)}` : '/issues');
  };

  const learningLevels = [
    {
      id: 'beginner',
      badge: 'LEVEL 01 · ZERO PRIOR KNOWLEDGE',
      title: 'COMPLETE BEGINNER',
      quote: '“I don’t know much about computers.”',
      desc: 'Learn computer basics, Windows, internet, hardware, WiFi, and simple everyday troubleshooting with visual diagrams and analogies.',
      img: beginnerImg,
      ctaLabel: 'Start Beginner Path',
      to: '/beginners',
      secondaryLabel: 'Visual Lab',
      secondaryTo: '/learning-lab',
      accentBorder: 'hover:border-[#27d3f0]',
    },
    {
      id: 'learner',
      badge: 'LEVEL 02 · CAREER BUILDER',
      title: 'IT LEARNER',
      quote: '“I want to become an IT Support Engineer.”',
      desc: 'Master networking, DNS/DHCP, Active Directory, Windows 11, Microsoft 365, and solve realistic helpdesk tickets step by step.',
      img: learnerImg,
      ctaLabel: 'Launch Simulator',
      to: '/simulator',
      secondaryLabel: 'IT Quizzes',
      secondaryTo: '/challenges',
      accentBorder: 'hover:border-[#8b6cff]',
    },
    {
      id: 'pro',
      badge: 'LEVEL 03 · ENGINEER & SYSADMIN',
      title: 'IT PROFESSIONAL',
      quote: '“I want to improve my technical skills.”',
      desc: 'Explore advanced commands, server administration, cloud, cybersecurity, and real-world scenarios across 325+ verified enterprise runbooks.',
      img: proImg,
      ctaLabel: '325+ Runbooks',
      to: '/issues',
      secondaryLabel: 'CLI Trainer',
      secondaryTo: '/commands',
      accentBorder: 'hover:border-[#27d3f0]',
    },
  ];

  return (
    <div className="space-y-20 pb-8">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-[#181f36] bg-[radial-gradient(ellipse_at_top,#181d3a_0%,#080b16_58%,#06070d_100%)] pt-12 pb-16 sm:pt-16 sm:pb-20">
        {/* Subtle ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 h-72 w-[42rem] rounded-full bg-gradient-to-r from-[#8b6cff]/20 via-[#27d3f0]/15 to-transparent blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
            {/* Hero Left Copy + Search + CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#27d3f0]">
                IT SUPPORT · Learn IT. Solve Problems. Build Your Career.
              </p>

              <h1 className="font-['Sora',sans-serif] text-3xl sm:text-5xl lg:text-[3.35rem] font-extrabold tracking-tight text-[#e9ebf7] leading-[1.12]">
                IT Looks Difficult?{' '}
                <span className="bg-gradient-to-r from-[#8b6cff] via-[#6fa8ff] to-[#27d3f0] bg-clip-text text-transparent">
                  Let&apos;s Make It Simple.
                </span>
              </h1>

              <p className="max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed">
                Learn IT from Zero. Understand Technology. Solve Real-World Problems.
              </p>

              {/* Main Search Bar */}
              <div className="relative max-w-2xl pt-1">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <label htmlFor="hero-it-search" className="sr-only">
                    What IT problem do you want to solve today?
                  </label>
                  <Search className="pointer-events-none absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-[#27d3f0]" />
                  <input
                    id="hero-it-search"
                    type="search"
                    value={searchInput}
                    onFocus={() => setFocused(true)}
                    onBlur={() => window.setTimeout(() => setFocused(false), 180)}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="What IT problem do you want to solve today?"
                    className="w-full rounded-xl border border-[#283252] bg-[#0c1020]/95 pl-10 sm:pl-12 pr-22 sm:pr-28 py-3.5 sm:py-4 text-xs sm:text-base text-white placeholder:text-slate-400 shadow-xl focus:border-[#8b6cff] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-[#06070d] hover:opacity-95 cursor-pointer"
                  >
                    Search
                  </button>
                </form>

                {/* Live Autocomplete Suggestions */}
                {focused && liveSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 z-30 mt-2 rounded-xl border border-[#263154] bg-[#0d1120] p-2 shadow-2xl">
                    {liveSuggestions.map((item) => (
                      <Link
                        key={item.id}
                        to={`/issues/${item.slug}`}
                        className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-[#161d35] hover:text-[#27d3f0]"
                      >
                        <span className="truncate font-medium">{item.title}</span>
                        <span className="shrink-0 text-xs font-mono text-slate-400">
                          {item.errorCode || item.category}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* 3 Primary Hero Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  to="/beginners"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-5 py-3 text-sm font-bold text-[#06070d] shadow-lg hover:opacity-95 transition-opacity"
                >
                  <Play className="h-4 w-4 fill-current" />
                  <span>Start Learning</span>
                </Link>

                <Link
                  to="/issues"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#2a3558] bg-[#151827] px-5 py-3 text-sm font-semibold text-[#e9ebf7] hover:border-[#27d3f0] transition-colors"
                >
                  <BookOpen className="h-4 w-4 text-[#27d3f0]" />
                  <span>Explore IT Problems</span>
                </Link>

                <Link
                  to="/ai-assistant"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#8b6cff]/50 bg-[#171330] px-5 py-3 text-sm font-semibold text-[#e9ebf7] hover:border-[#8b6cff] transition-colors"
                >
                  <Sparkles className="h-4 w-4 text-[#8b6cff]" />
                  <span>Ask IT SUPPORT AI</span>
                </Link>
              </div>

              <p className="text-xs text-slate-400">
                100% Free &amp; Open Public Platform · 25 Beginner Lessons · 8 Visual Labs · 10 Live Simulators · {ALL_ISSUES.length} Verified IT Solutions
              </p>
            </div>

            {/* Hero Right: Interactive Live Packet & Concept Visualizer */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-[#253052] bg-[#0e1222]/95 p-5 sm:p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#1c243f] pb-3">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#27d3f0]">
                      Interactive Concept Preview
                    </span>
                    <h2 className="font-['Sora',sans-serif] text-base font-bold text-white">
                      How Your Laptop Opens a Website
                    </h2>
                  </div>
                  <Link
                    to="/learning-lab"
                    className="text-xs font-semibold text-[#8b6cff] hover:text-[#27d3f0] whitespace-nowrap shrink-0"
                  >
                    Full Lab →
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {HERO_FLOW_NODES.map((node, idx) => {
                    const Icon = node.icon;
                    const active = idx === heroNodeIdx;
                    return (
                      <button
                        key={node.step}
                        type="button"
                        onClick={() => setHeroNodeIdx(idx)}
                        className={`rounded-xl border p-3.5 text-left transition-all cursor-pointer ${
                          active
                            ? 'border-[#27d3f0] bg-gradient-to-br from-[#14223d] to-[#101528] shadow-[0_0_22px_rgba(39,211,240,0.16)]'
                            : 'border-[#1d2540] bg-[#090c17] hover:border-[#8b6cff]/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-mono text-xs font-bold ${
                              active ? 'text-[#27d3f0]' : 'text-slate-500'
                            }`}
                          >
                            STEP {node.step}
                          </span>
                          <Icon
                            className={`h-4 w-4 ${
                              active ? 'text-[#27d3f0]' : 'text-[#8b6cff]'
                            }`}
                          />
                        </div>
                        <p className="mt-2 font-['Sora',sans-serif] text-sm font-bold text-white">
                          {node.title}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                          {node.subtitle}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-[#202a49] bg-[#080b15] p-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  <strong className="text-[#27d3f0]">
                    Step {HERO_FLOW_NODES[heroNodeIdx].step} ({HERO_FLOW_NODES[heroNodeIdx].title}):{' '}
                  </strong>
                  {HERO_FLOW_NODES[heroNodeIdx].detail}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Click any card above to inspect the hop</span>
                  <Link
                    to="/simulator"
                    className="font-semibold text-[#27d3f0] hover:underline"
                  >
                    Fix a Broken Network →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION A: CHOOSE YOUR LEARNING LEVEL */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
            PERSONALIZED ENTRY PATHS
          </p>
          <h2 className="mt-1.5 font-['Sora',sans-serif] text-2xl sm:text-3xl font-bold text-[#e9ebf7]">
            Choose Your Learning Level
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400">
            Whether you are touching a computer for the first time or managing production Active Directory and Linux servers, start right at your comfort level.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {learningLevels.map((lvl) => (
            <article
              key={lvl.id}
              className={`group rounded-2xl border border-[#222a46] bg-[#151827] overflow-hidden flex flex-col justify-between transition-all ${lvl.accentBorder}`}
            >
              <div>
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-[#181d38] via-[#0e1222] to-[#080a13] border-b border-[#1f2742]">
                  {!brokenImages[lvl.id] ? (
                    <img
                      src={lvl.img}
                      alt={lvl.title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setBrokenImages((prev) => ({ ...prev, [lvl.id]: true }))
                      }
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <GraduationCap className="h-12 w-12 text-[#27d3f0]" />
                    </div>
                  )}
                </div>

                <div className="p-6 space-y-3">
                  <p className="font-mono text-[11px] font-semibold tracking-wider text-[#27d3f0]">
                    {lvl.badge}
                  </p>
                  <h3 className="font-['Sora',sans-serif] text-xl font-bold text-white">
                    {lvl.title}
                  </h3>
                  <p className="text-sm font-semibold text-[#8b6cff]">{lvl.quote}</p>
                  <p className="text-sm text-slate-300 leading-relaxed">{lvl.desc}</p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 flex items-center gap-2.5">
                <Link
                  to={lvl.to}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#06070d] whitespace-nowrap hover:opacity-95"
                >
                  <span>{lvl.ctaLabel}</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
                <Link
                  to={lvl.secondaryTo}
                  className="rounded-lg border border-[#2a3456] bg-[#0d101b] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 whitespace-nowrap hover:border-[#27d3f0]"
                >
                  {lvl.secondaryLabel}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION B: CONTINUE LEARNING (LOCAL GAMIFIED PROGRESS DASHBOARD) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#252f50] bg-gradient-to-br from-[#151827] via-[#0e1222] to-[#090c16] p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
                YOUR INTERACTIVE PROGRESS · NO ACCOUNT REQUIRED
              </p>
              <h2 className="mt-1 font-['Sora',sans-serif] text-2xl font-bold text-white">
                Continue Learning — Level {levelInfo.level}: {levelInfo.title}
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Your XP, daily streak, completed lessons, and earned badges save automatically in this browser.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#8b6cff]" />
                <div>
                  <span className="block text-xs text-slate-400">Experience</span>
                  <strong className="font-['Sora',sans-serif] text-white tabular-nums">
                    {progress.xp} XP
                  </strong>
                </div>
              </div>

              <div className="h-8 w-px bg-[#232c4b]" />

              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-400" />
                <div>
                  <span className="block text-xs text-slate-400">Daily Streak</span>
                  <strong className="font-['Sora',sans-serif] text-amber-300 tabular-nums">
                    {progress.streakDays} {progress.streakDays === 1 ? 'Day' : 'Days'}
                  </strong>
                </div>
              </div>

              <div className="h-8 w-px bg-[#232c4b]" />

              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[#27d3f0]" />
                <div>
                  <span className="block text-xs text-slate-400">Earned Badges</span>
                  <strong className="font-['Sora',sans-serif] text-[#27d3f0] tabular-nums">
                    {progress.earnedBadgeIds.length} / {badgeCatalog.length}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Quick Resume Tracks */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to={`/beginners?lesson=${resumeLesson.id}`}
              className="rounded-xl border border-[#242e4e] bg-[#0a0d18] p-4 hover:border-[#27d3f0] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Beginner Lessons</span>
                  <span className="font-mono text-[#27d3f0] tabular-nums">
                    {progress.completedLessonIds.length}/{BEGINNER_LESSONS.length}
                  </span>
                </div>
                <p className="mt-2 font-['Sora',sans-serif] text-sm font-bold text-white">
                  Lesson {resumeLesson.number}: {resumeLesson.title}
                </p>
              </div>
              <span className="mt-3 text-xs font-semibold text-[#27d3f0]">
                {progress.completedLessonIds.length > 0 ? 'Resume Lesson →' : 'Start Lesson 1 →'}
              </span>
            </Link>

            <Link
              to="/learning-lab"
              className="rounded-xl border border-[#242e4e] bg-[#0a0d18] p-4 hover:border-[#8b6cff] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Visual IT Lab</span>
                  <span className="font-mono text-[#8b6cff] tabular-nums">
                    {progress.exploredLabIds.length}/{VISUAL_LEARNING_LABS.length}
                  </span>
                </div>
                <p className="mt-2 font-['Sora',sans-serif] text-sm font-bold text-white">
                  Animated DNS, DHCP, Boot &amp; VPN Flows
                </p>
              </div>
              <span className="mt-3 text-xs font-semibold text-[#8b6cff]">
                Open Visual Lab →
              </span>
            </Link>

            <Link
              to="/simulator"
              className="rounded-xl border border-[#242e4e] bg-[#0a0d18] p-4 hover:border-[#27d3f0] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Ticket Simulator</span>
                  <span className="font-mono text-emerald-400 tabular-nums">
                    {progress.solvedScenarioIds.length}/{SIMULATOR_SCENARIOS.length}
                  </span>
                </div>
                <p className="mt-2 font-['Sora',sans-serif] text-sm font-bold text-white">
                  Can You Fix Real Helpdesk Tickets?
                </p>
              </div>
              <span className="mt-3 text-xs font-semibold text-emerald-400">
                Solve a Ticket →
              </span>
            </Link>

            <Link
              to="/challenges?mode=daily"
              className="rounded-xl border border-[#242e4e] bg-[#0a0d18] p-4 hover:border-amber-400/70 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Daily Challenge</span>
                  <span className="font-mono text-amber-300 tabular-nums">
                    {Object.keys(progress.completedQuizModes).length}/8 Modes
                  </span>
                </div>
                <p className="mt-2 font-['Sora',sans-serif] text-sm font-bold text-white">
                  5-Question Daily IT Skill Boost
                </p>
              </div>
              <span className="mt-3 text-xs font-semibold text-amber-300">
                Play Today’s Quiz →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION C: POPULAR IT PROBLEMS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
              INSTANT STEP-BY-STEP FIXES
            </p>
            <h2 className="mt-1.5 font-['Sora',sans-serif] text-2xl sm:text-3xl font-bold text-[#e9ebf7]">
              Popular Real-World IT Problems
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-slate-400">
              Short, verified troubleshooting runbooks with symptoms, root causes, and copy-ready CLI commands.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/quick-desk"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#8b6cff]/50 bg-[#151827] px-3.5 py-2 text-xs sm:text-sm font-semibold text-white hover:border-[#27d3f0] transition-colors whitespace-nowrap"
            >
              <span>Open 3D Quick Desk</span>
              <ArrowRight className="h-4 w-4 text-[#27d3f0]" />
            </Link>
            <Link
              to="/issues?view=grid"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#27d3f0] hover:underline whitespace-nowrap"
            >
              <span>Browse All {ALL_ISSUES.length} Issues</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Quick Search Symptom Triggers */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 mr-1">Common searches:</span>
          {POPULAR_SEARCH_EXAMPLES.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => navigate(`/issues?q=${encodeURIComponent(term)}`)}
              className="rounded-lg border border-[#232c48] bg-[#0e1222] px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-[#8b6cff] hover:text-white transition-colors cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </section>

      {/* SECTION D: LEARN IT THROUGH CHALLENGES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8b6cff]">
            HANDS-ON GAMIFIED PRACTICE
          </p>
          <h2 className="mt-1.5 font-['Sora',sans-serif] text-2xl sm:text-3xl font-bold text-[#e9ebf7]">
            Learn IT Through Interactive Challenges
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-slate-400">
            Stop reading walls of text. Practice diagnosing broken computers, running terminal commands, and winning engineering badges.
          </p>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Link
            to="/challenges?mode=daily"
            className="group rounded-2xl border border-[#252f50] bg-gradient-to-b from-[#181634] to-[#0d101b] p-6 flex flex-col justify-between hover:border-[#8b6cff] transition-all"
          >
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#8b6cff]/20 text-[#8b6cff]">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="font-['Sora',sans-serif] text-lg font-bold text-white">
                8 Quiz Modes &amp; Daily Challenge
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Test Networking, Windows, Hardware, Active Directory, Helpdesk Scenarios, and Interview readiness in 2-minute sprints.
              </p>
            </div>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#27d3f0] group-hover:translate-x-1 transition-transform">
              <span>Start Daily IT Challenge</span>
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          <Link
            to="/simulator"
            className="group rounded-2xl border border-[#252f50] bg-gradient-to-b from-[#112238] to-[#0d101b] p-6 flex flex-col justify-between hover:border-[#27d3f0] transition-all"
          >
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#27d3f0]/20 text-[#27d3f0]">
                <Headphones className="h-6 w-6" />
              </div>
              <h3 className="font-['Sora',sans-serif] text-lg font-bold text-white">
                Real-World IT Ticket Simulator
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                “My WiFi has no internet!”, “Domain login keeps locking out!”, “C: drive is at 0 MB free!” — pick the right diagnostic moves to close 10 tickets.
              </p>
            </div>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#27d3f0] group-hover:translate-x-1 transition-transform">
              <span>Enter Helpdesk Simulator</span>
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>

          <Link
            to="/commands"
            className="group rounded-2xl border border-[#252f50] bg-gradient-to-b from-[#132629] to-[#0d101b] p-6 flex flex-col justify-between hover:border-emerald-400/70 transition-all"
          >
            <div className="space-y-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <Terminal className="h-6 w-6" />
              </div>
              <h3 className="font-['Sora',sans-serif] text-lg font-bold text-white">
                Visual CLI Practice Terminal
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Run `ipconfig`, `ping`, `nslookup`, `sfc /scannow`, `Get-ADUser`, and `df -h` safely in your browser and read plain-English output breakdowns.
              </p>
            </div>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform">
              <span>Practice CLI Commands</span>
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </section>

      {/* SECTION E: EXPLORE TECHNOLOGY */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
              25 IT CATEGORIES &amp; ENGINEER TOOLS
            </p>
            <h2 className="mt-1.5 font-['Sora',sans-serif] text-2xl sm:text-3xl font-bold text-[#e9ebf7]">
              Explore Technology Domains
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-slate-400">
              Deep-dive into core infrastructure guides, subnet calculators, and all {ALL_CATEGORIES.length} specialized IT categories.
            </p>
          </div>
          <Link
            to="/networking-tools"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#263154] bg-[#151827] px-4 py-2 text-xs sm:text-sm font-semibold text-[#27d3f0] hover:border-[#27d3f0] shrink-0"
          >
            <Calculator className="h-4 w-4" />
            <span>Open Subnet &amp; CIDR Calculator</span>
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EXPLORE_TECH_DOMAINS.map((dom) => {
            const Icon = dom.icon;
            return (
              <Link
                key={dom.title}
                to={dom.to}
                className="group rounded-xl border border-[#1f2742] bg-[#151827] p-5 hover:border-[#8b6cff] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0d101b] border border-[#252f50] text-[#27d3f0] group-hover:text-[#8b6cff] transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-3.5 font-['Sora',sans-serif] text-base font-bold text-white group-hover:text-[#27d3f0] transition-colors">
                    {dom.title}
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {dom.desc}
                  </p>
                </div>
                <span className="mt-4 text-xs font-semibold text-slate-300 group-hover:text-[#27d3f0]">
                  Explore Domain →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SECTION F: ASK IT SUPPORT AI */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#8b6cff]/40 bg-gradient-to-r from-[#181336] via-[#11172e] to-[#0c1a2e] p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
              PERSONAL IT TUTOR + SENIOR DIAGNOSTIC ENGINEER
            </p>
            <h2 className="font-['Sora',sans-serif] text-2xl sm:text-3xl font-bold text-white">
              Stuck on an Error or Confused by a Concept? Ask IT SUPPORT AI
            </h2>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Switch between <strong>Fix IT Problem Mode</strong> (structured root causes &amp; safe CLI commands) and <strong>Personal IT Tutor Mode</strong> (plain-English + optional Hinglish explanations from zero).
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/ai-assistant?mode=tutor"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-5 py-3 text-sm font-bold text-[#06070d] hover:opacity-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>Launch Personal IT Tutor</span>
            </Link>
            <Link
              to="/ai-assistant?mode=troubleshoot"
              className="inline-flex items-center gap-2 rounded-xl border border-[#2d3a63] bg-[#0d101b] px-5 py-3 text-sm font-semibold text-white hover:border-[#27d3f0]"
            >
              <span>Diagnose an Error</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION G: CAREER GROWTH */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
              BUILD YOUR IT CAREER
            </p>
            <h2 className="mt-1.5 font-['Sora',sans-serif] text-2xl sm:text-3xl font-bold text-[#e9ebf7]">
              Your Step-by-Step Career Growth Path
            </h2>
            <p className="mt-1.5 text-sm sm:text-base text-slate-400">
              Follow our structured roadmap and practice real technical interview questions for every stage of your IT career.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/roadmap"
              className="rounded-lg border border-[#263154] bg-[#151827] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:border-[#8b6cff]"
            >
              Full IT Learning Roadmap
            </Link>
            <Link
              to="/interview-questions"
              className="rounded-lg border border-[#263154] bg-[#151827] px-4 py-2 text-xs sm:text-sm font-semibold text-[#27d3f0] hover:border-[#27d3f0]"
            >
              Interview Prep (11 Tracks)
            </Link>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            {
              step: 'STAGE 01',
              role: 'Complete Beginner → IT Trainee',
              skills: 'Hardware, Windows 11, IP/WiFi/DNS basics, ticketing etiquette & safe CLI fundamentals.',
              linkLabel: 'Start 25 Beginner Lessons →',
              to: '/beginners',
            },
            {
              step: 'STAGE 02',
              role: 'L1 / L2 IT Support & Desktop Engineer',
              skills: 'Active Directory lockouts, Group Policy, Microsoft 365, Outlook, VPNs, printers & PowerShell.',
              linkLabel: 'Practice Helpdesk Simulator →',
              to: '/simulator',
            },
            {
              step: 'STAGE 03',
              role: 'System, Network & Cloud Administrator',
              skills: 'Windows Server, Linux systemd/LVM, VLAN routing, Azure VNets, backups & cybersecurity hardening.',
              linkLabel: 'Explore Career Roadmap & Interviews →',
              to: '/roadmap',
            },
          ].map((stage) => (
            <div
              key={stage.step}
              className="rounded-2xl border border-[#202844] bg-[#0d101b] p-6 flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-xs font-bold text-[#8b6cff]">
                  {stage.step}
                </span>
                <h3 className="mt-2 font-['Sora',sans-serif] text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#27d3f0] shrink-0" />
                  <span>{stage.role}</span>
                </h3>
                <p className="mt-2.5 text-sm text-slate-400 leading-relaxed">
                  {stage.skills}
                </p>
              </div>
              <Link
                to={stage.to}
                className="mt-5 inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#27d3f0] hover:underline"
              >
                {stage.linkLabel}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION H: ABOUT THE DEVELOPER */}
      <AboutDeveloperSection />
    </div>
  );
};
