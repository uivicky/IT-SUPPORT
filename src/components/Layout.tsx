import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Menu,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  X,
} from 'lucide-react';
import {
  FloatingWhatsAppButton,
  FooterDeveloperBanner,
} from './DeveloperBranding';
import { DEVELOPER_BRANDING } from '../utils/developerBranding';

const GUIDE_LINKS = [
  { label: 'Windows Troubleshooting', to: '/windows-troubleshooting' },
  { label: 'Networking Solutions', to: '/networking-solutions' },
  { label: 'Active Directory Guide', to: '/active-directory-guide' },
  { label: 'Microsoft 365 Guide', to: '/microsoft-365-guide' },
  { label: 'Windows Server Guide', to: '/windows-server-guide' },
  { label: 'Linux Troubleshooting', to: '/linux-troubleshooting' },
  { label: 'Azure & Cloud Guide', to: '/azure-cloud-guide' },
];

const PRIMARY_NAV = [
  { label: 'Learn Basics', to: '/beginners' },
  { label: 'Visual Lab', to: '/learning-lab' },
  { label: 'Simulator', to: '/simulator' },
  { label: 'Challenges', to: '/challenges' },
  { label: 'IT Issues', to: '/issues' },
];

const SECONDARY_TOOLS = [
  { label: '3D Quick Desk', to: '/quick-desk' },
  { label: 'Commands Trainer', to: '/commands' },
  { label: 'Networking Tools', to: '/networking-tools' },
  { label: 'Interview Prep', to: '/interview-questions' },
  { label: 'Career Roadmap', to: '/roadmap' },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#06070d] text-[#e9ebf7] selection:bg-[#8b6cff]/30 selection:text-white">
      <header className="sticky top-0 z-40 h-16 border-b border-[#191f34] bg-[#06070d]/92 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          {/* Zone 1: Clean Single-Element Brand Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 whitespace-nowrap focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#8b6cff] to-[#27d3f0] text-[#06070d] shadow-sm">
              <TerminalSquare className="h-5 w-5 stroke-[2.2]" />
            </div>
            <span className="font-['Sora',sans-serif] text-base font-bold tracking-tight text-white">
              IT SUPPORT
            </span>
          </Link>

          {/* Zone 2: 5 Concise Single-Line Primary Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-2"
          >
            {PRIMARY_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-[#151827] text-[#27d3f0]'
                      : 'text-slate-300 hover:bg-[#111525] hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Single Primary Action + Mobile Drawer Toggle */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/ai-assistant"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#06070d] whitespace-nowrap transition-opacity hover:opacity-95"
            >
              <Sparkles className="h-4 w-4" />
              <span>IT SUPPORT AI</span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              className="inline-flex lg:hidden items-center justify-center rounded-lg border border-[#232b45] bg-[#0d101b] p-2 text-slate-200 hover:border-[#8b6cff]"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-b border-[#232b45] bg-[#0a0d17] px-4 pt-3 pb-6 shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto">
            <nav aria-label="Mobile Navigation" className="space-y-4">
              <div className="grid grid-cols-1 gap-1">
                <Link
                  to="/"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-[#14192b]"
                >
                  Home
                </Link>
                {PRIMARY_NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 hover:bg-[#14192b]"
                  >
                    {item.label}
                  </Link>
                ))}
                {SECONDARY_TOOLS.map((tool) => (
                  <Link
                    key={tool.to}
                    to={tool.to}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-[#14192b]"
                  >
                    {tool.label}
                  </Link>
                ))}
              </div>

              <div className="border-t border-[#1b2238] pt-3">
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Platform Troubleshooting Guides
                </p>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {GUIDE_LINKS.map((guide) => (
                    <Link
                      key={guide.to}
                      to={guide.to}
                      className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-[#14192b] hover:text-[#27d3f0]"
                    >
                      {guide.label}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#181e31] bg-[#080a12] mt-20">
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-24 sm:px-6 sm:pb-16 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#8b6cff] to-[#27d3f0] text-[#06070d]">
                  <TerminalSquare className="h-4 w-4 stroke-[2.2]" />
                </div>
                <span className="font-['Sora',sans-serif] text-lg font-bold text-white">
                  IT SUPPORT
                </span>
              </Link>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
                Your Complete IT Troubleshooting Guide
              </p>
              <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-slate-400">
                Interactive beginner lessons, animated packet labs, real-world ticket simulations, 325+ verified IT troubleshooting runbooks, and AI tutoring—100% open public access with zero login walls.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-[#27d3f0]" />
                <span>Public IT Learning &amp; Troubleshooting Platform</span>
              </div>
            </div>

            <div>
              <h2 className="font-['Sora',sans-serif] text-sm font-semibold text-white">
                Interactive Learning
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>
                  <Link to="/beginners" className="hover:text-[#27d3f0] transition-colors">
                    IT For Absolute Beginners (25)
                  </Link>
                </li>
                <li>
                  <Link to="/learning-lab" className="hover:text-[#27d3f0] transition-colors">
                    Visual IT Learning Lab (8)
                  </Link>
                </li>
                <li>
                  <Link to="/simulator" className="hover:text-[#27d3f0] transition-colors">
                    Real-World IT Simulator (10)
                  </Link>
                </li>
                <li>
                  <Link to="/challenges" className="hover:text-[#27d3f0] transition-colors">
                    Quizzes &amp; Daily Challenge
                  </Link>
                </li>
                <li>
                  <Link to="/roadmap" className="hover:text-[#27d3f0] transition-colors">
                    IT Learning Roadmap
                  </Link>
                </li>
                <li>
                  <Link to="/interview-questions" className="hover:text-[#27d3f0] transition-colors">
                    IT Interview Questions
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-['Sora',sans-serif] text-sm font-semibold text-white">
                Platform Guides
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                {GUIDE_LINKS.map((g) => (
                  <li key={g.to}>
                    <Link to={g.to} className="hover:text-[#27d3f0] transition-colors">
                      {g.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-['Sora',sans-serif] text-sm font-semibold text-white">
                Engineer Toolkit
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>
                  <Link to="/quick-desk" className="hover:text-[#27d3f0] transition-colors">
                    3D Quick Desk Explorer
                  </Link>
                </li>
                <li>
                  <Link to="/issues?view=grid" className="hover:text-[#27d3f0] transition-colors">
                    All IT Issues Grid (325+)
                  </Link>
                </li>
                <li>
                  <Link to="/ai-assistant" className="hover:text-[#27d3f0] transition-colors">
                    IT SUPPORT AI Tutor
                  </Link>
                </li>
                <li>
                  <Link to="/commands" className="hover:text-[#27d3f0] transition-colors">
                    CLI Commands &amp; Terminal
                  </Link>
                </li>
                <li>
                  <Link to="/networking-tools" className="hover:text-[#27d3f0] transition-colors">
                    Subnet &amp; Networking Tools
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-['Sora',sans-serif] text-sm font-semibold text-white">
                Resources &amp; Legal
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>
                  <Link to="/about" className="hover:text-[#27d3f0] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-[#27d3f0] transition-colors">
                    Contact &amp; Submit Issue
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="hover:text-[#27d3f0] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-[#27d3f0] transition-colors">
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <a
                    href="/sitemap.xml"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#27d3f0] transition-colors"
                  >
                    XML Sitemap
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <FooterDeveloperBanner />

          <div className="mt-8 border-t border-[#181e31] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 text-center sm:text-left">
            <p className="font-medium text-slate-300">
              {DEVELOPER_BRANDING.finalSiteTitle}
            </p>
            <p className="font-semibold text-[#e9ebf7]">
              {DEVELOPER_BRANDING.finalDeveloperCredit}
            </p>
          </div>
        </div>
      </footer>

      <FloatingWhatsAppButton />
    </div>
  );
};
