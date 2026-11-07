import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  FileText,
  Layers,
  Mail,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { ALL_ISSUES } from '../data/issuesIndex';
import {
  AboutDeveloperSection,
  WhatsAppContactButton,
  WhatsAppIcon,
} from '../components/DeveloperBranding';
import { DEVELOPER_BRANDING } from '../utils/developerBranding';
import { usePageSEO } from '../utils/seo';

export const AboutPage: React.FC = () => {
  usePageSEO({
    title: 'About IT SUPPORT & Enterprise Knowledge Architecture',
    description:
      'Learn how IT SUPPORT empowers IT Support Engineers, Network Engineers, and SysAdmins with open-access troubleshooting runbooks and future-ready IT SUPPORT PRO services.',
    canonicalPath: '/about',
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <header className="border-b border-[#181e31] pb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
          About Our Platform
        </p>
        <h1 className="mt-2 font-['Sora',sans-serif] text-2xl sm:text-4xl font-bold text-white">
          IT SUPPORT — Built by Engineers for Real-World Ticket Resolution
        </h1>
        <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-300">
          IT SUPPORT is an open, public-access technical runbook platform created to help L1/L2 Helpdesk Technicians, Desktop Support Engineers, Network Administrators, and Cloud/Linux SysAdmins solve production incidents cleanly without wading through bloated forum threads or login walls.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-6">
          <ShieldCheck className="h-6 w-6 text-[#27d3f0]" />
          <h2 className="mt-4 font-['Sora',sans-serif] text-lg font-bold text-white">
            100% Open Public Access
          </h2>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            Zero accounts, zero paywalls on our {ALL_ISSUES.length}+ core troubleshooting runbooks, CLI library, and IPv4 subnetting calculators. Open any URL during an outage and start fixing immediately.
          </p>
        </div>

        <div className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-6">
          <Layers className="h-6 w-6 text-[#8b6cff]" />
          <h2 className="mt-4 font-['Sora',sans-serif] text-lg font-bold text-white">
            Short, Verified Runbooks
          </h2>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            Every issue follows a strict engineering standard: Symptoms, Root Causes, Sequential Steps, Copyable Commands, Safety Warnings, Expected Results, and Prevention.
          </p>
        </div>

        <div className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-6">
          <Sparkles className="h-6 w-6 text-[#27d3f0]" />
          <h2 className="mt-4 font-['Sora',sans-serif] text-lg font-bold text-white">
            Safe Server-Side AI
          </h2>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed">
            IT SUPPORT AI processes complex multi-system symptoms via Google Gemini on a secure server endpoint with rate limiting and strict non-destructive command rules.
          </p>
        </div>
      </section>

      {/* Monetization-Ready Architecture Overview (Honest, No Fake Payments) */}
      <section className="rounded-2xl border border-[#232b45] bg-[#0d101b] p-7 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#8b6cff]">
          <Building2 className="h-4 w-4" />
          <span>Sustainability &amp; Future Enterprise Services</span>
        </div>
        <h2 className="font-['Sora',sans-serif] text-xl sm:text-2xl font-bold text-white">
          IT SUPPORT PRO &amp; Enterprise Knowledge Architecture
        </h2>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          While our public web knowledge base remains permanently free and login-free for the global IT community, our modular architecture is structured to support sustainable enterprise offerings:
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#1b2238] bg-[#080a12] p-5">
            <h3 className="font-semibold text-white text-sm">
              1. IT SUPPORT PRO Offline SOP Packs
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Air-gapped Markdown/Confluence/ServiceNow importable runbook bundles designed for restricted datacenters and defense/healthcare NOCs.
            </p>
          </div>
          <div className="rounded-xl border border-[#1b2238] bg-[#080a12] p-5">
            <h3 className="font-semibold text-white text-sm">
              2. Business IT Knowledge Services
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Custom MSP and corporate internal helpdesk playbook authoring tailored to your exact VPN, M365, and ERP stack.
            </p>
          </div>
          <div className="rounded-xl border border-[#1b2238] bg-[#080a12] p-5">
            <h3 className="font-semibold text-white text-sm">
              3. Curated Lab Hardware &amp; Cert Affiliates
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Vetted recommendations for homelab mini-PCs, managed switches, cable testers, and vendor certification exam vouchers.
            </p>
          </div>
          <div className="rounded-xl border border-[#1b2238] bg-[#080a12] p-5">
            <h3 className="font-semibold text-white text-sm">
              4. Non-Intrusive Display Sponsorships
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
              Clean, layout-stable sponsor and Google AdSense-ready containers engineered with zero popups and zero CLS layout shifts.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-5 py-2.5 text-sm font-semibold text-[#06070d]"
          >
            <span>Inquire About Enterprise Runbooks</span>
          </Link>
        </div>
      </section>

      {/* About the Developer Section */}
      <AboutDeveloperSection className="" />
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Suggest a New IT Issue / Fix');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  usePageSEO({
    title: 'Contact Us & Submit an IT Runbook',
    description:
      'Submit a new real-world IT troubleshooting scenario, report a command update, or inquire about IT SUPPORT enterprise knowledge services.',
    canonicalPath: '/contact',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please complete your name, email address, and technical message.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="border-b border-[#181e31] pb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
          Community &amp; Engineering Desk
        </p>
        <h1 className="mt-2 font-['Sora',sans-serif] text-2xl sm:text-4xl font-bold text-white">
          Contact Us &amp; Contribute Runbooks
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-400">
          Spotted a new Windows 11 cumulative update bug, want to request a Linux/Azure topic, or interested in custom MSP playbooks? Send our engineering team a note—no account needed.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-12">
        <div className="md:col-span-7 rounded-xl border border-[#1d2338] bg-[#0d101b] p-6">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
              <h2 className="font-['Sora',sans-serif] text-xl font-bold text-white">
                Submission Received
              </h2>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Thank you, {name}. Your message regarding <strong>{topic}</strong> has been logged for our editorial engineering review.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                }}
                className="rounded-lg border border-[#242c46] bg-[#131829] px-4 py-2 text-xs font-medium text-white hover:border-[#27d3f0] cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Your Name or Role
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera — Network Engineer"
                  className="w-full rounded-lg border border-[#242c46] bg-[#070911] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#8b6cff] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="w-full rounded-lg border border-[#242c46] bg-[#070911] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#8b6cff] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-topic"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Topic
                </label>
                <select
                  id="contact-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-lg border border-[#242c46] bg-[#070911] px-3.5 py-2.5 text-sm text-white focus:border-[#8b6cff] focus:outline-none"
                >
                  <option>Suggest a New IT Issue / Fix</option>
                  <option>Report Command / OS Update Correction</option>
                  <option>IT SUPPORT PRO &amp; Enterprise SOP Inquiry</option>
                  <option>General Feedback</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Details (Include OS version, error code, or steps if submitting an issue)
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe the issue, command revision, or partnership inquiry..."
                  className="w-full rounded-lg border border-[#242c46] bg-[#070911] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#8b6cff] focus:outline-none"
                />
              </div>

              {error && <p className="text-xs text-amber-400">{error}</p>}

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-5 py-2.5 text-sm font-semibold text-[#06070d] cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Submit Message</span>
              </button>
            </form>
          )}
        </div>

        <aside className="md:col-span-5 space-y-4">
          <div className="rounded-xl border border-[#243254] bg-[#0d101b] p-5 space-y-4">
            <div className="flex items-center gap-2.5 text-[#25D366]">
              <WhatsAppIcon className="h-5 w-5 shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                {DEVELOPER_BRANDING.creditHeading}
              </span>
            </div>
            <div>
              <h2 className="font-['Sora',sans-serif] text-lg font-bold bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] bg-clip-text text-transparent">
                {DEVELOPER_BRANDING.fullCreditName}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-300">
                {DEVELOPER_BRANDING.role}
              </p>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Reach out directly to {DEVELOPER_BRANDING.name} ({DEVELOPER_BRANDING.brandName}) on WhatsApp for website design, full-stack web development, or platform inquiries.
              </p>
            </div>
            <WhatsAppContactButton compact className="w-full" />
          </div>

          <div className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-5">
            <Mail className="h-5 w-5 text-[#27d3f0]" />
            <h2 className="mt-3 font-['Sora',sans-serif] text-base font-bold text-white">
              Direct Editorial Contact
            </h2>
            <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
              Need immediate troubleshooting help right now? Use{' '}
              <Link to="/ai-assistant" className="text-[#27d3f0] hover:underline">
                IT SUPPORT AI
              </Link>{' '}
              or search our{' '}
              <Link to="/issues" className="text-[#27d3f0] hover:underline">
                325+ IT Runbooks
              </Link>{' '}
              for instant resolution.
            </p>
          </div>

          <div className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-5">
            <FileText className="h-5 w-5 text-[#8b6cff]" />
            <h2 className="mt-3 font-['Sora',sans-serif] text-base font-bold text-white">
              Security &amp; Sanitization Reminder
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
              When sharing sample logs or error outputs, always redact private customer domains, public static IPs, tenant GUIDs, and credentials.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC = () => {
  usePageSEO({
    title: 'Privacy Policy — Zero-Account Public IT Knowledge Base',
    description:
      'Privacy Policy for IT SUPPORT detailing our zero-login public access model, local browser storage, and server-side AI troubleshooting data handling.',
    canonicalPath: '/privacy-policy',
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <header className="border-b border-[#181e31] pb-6">
        <h1 className="font-['Sora',sans-serif] text-2xl sm:text-4xl font-bold text-white">
          Privacy Policy
        </h1>
        <p className="mt-2 text-xs text-slate-400">Effective Date: January 1, 2025</p>
      </header>

      <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-300">
        <section className="space-y-2">
          <h2 className="font-['Sora',sans-serif] text-lg font-bold text-white">
            1. Zero User Accounts or Registration Tracking
          </h2>
          <p>
            IT SUPPORT operates as a completely public, open-access technical reference website. We do not require user registration, passwords, OAuth logins, or personal profiles to browse our 325+ IT troubleshooting runbooks, commands library, or networking calculators.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-['Sora',sans-serif] text-lg font-bold text-white">
            2. Local Browser Storage
          </h2>
          <p>
            Interactive study progress on the IT Learning Roadmap is stored strictly inside your own browser&apos;s <code className="font-mono text-xs text-[#27d3f0]">localStorage</code> and is never transmitted to external databases.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-['Sora',sans-serif] text-lg font-bold text-white">
            3. IT SUPPORT AI Processing &amp; Log Redaction
          </h2>
          <p>
            Prompts submitted to IT SUPPORT AI are transmitted over HTTPS to our server-side API route and processed via Google Gemini API solely to generate real-time troubleshooting diagnostics. Do not submit production passwords, private cryptographic keys, or personally identifiable customer data (PII) in troubleshooting prompts. Short-lived IP counters are kept in volatile server memory strictly for abuse rate limiting.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-['Sora',sans-serif] text-lg font-bold text-white">
            4. Future Advertising &amp; Affiliate Disclosure
          </h2>
          <p>
            Should advertising (such as Google AdSense) or affiliate links to lab hardware and certification providers be enabled in future updates, third-party vendors may use standard cookies in accordance with applicable regional consent policies.
          </p>
        </section>
      </div>
    </div>
  );
};

export const TermsPage: React.FC = () => {
  usePageSEO({
    title: 'Terms & Conditions — Safe IT Troubleshooting Disclaimer',
    description:
      'Terms and Conditions for using IT SUPPORT runbooks, administrative CLI commands, networking calculators, and IT SUPPORT AI.',
    canonicalPath: '/terms',
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <header className="border-b border-[#181e31] pb-6">
        <h1 className="font-['Sora',sans-serif] text-2xl sm:text-4xl font-bold text-white">
          Terms &amp; Conditions
        </h1>
        <p className="mt-2 text-xs text-slate-400">Effective Date: January 1, 2025</p>
      </header>

      <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-300">
        <section className="space-y-2">
          <h2 className="font-['Sora',sans-serif] text-lg font-bold text-white">
            1. Administrative Command &amp; Production Change Responsibility
          </h2>
          <p>
            Commands and troubleshooting guides published on IT SUPPORT (including Windows CMD, PowerShell, Registry edits, Active Directory operations, Linux root commands, and firewall/cloud changes) are provided for educational and professional reference. Always verify backups, read included Safety Warnings, follow your organization&apos;s Change Management policies, and validate commands in a non-production environment first.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-['Sora',sans-serif] text-lg font-bold text-white">
            2. No Warranty
          </h2>
          <p>
            All content, calculators, and AI-assisted diagnostic suggestions are provided &ldquo;AS IS&rdquo; without warranties of merchantability or fitness for a particular production environment. IT SUPPORT shall not be liable for service interruptions, data loss, or configuration drift resulting from command execution.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-['Sora',sans-serif] text-lg font-bold text-white">
            3. Acceptable Use of Public Endpoints
          </h2>
          <p>
            Automated scraping attacks, denial-of-service flooding, or attempts to bypass server rate limits on <code className="font-mono text-xs text-[#27d3f0]">/api/ai/troubleshoot</code> are prohibited.
          </p>
        </section>
      </div>
    </div>
  );
};
