import React from 'react';
import { Code2, ExternalLink, Layers, Sparkles } from 'lucide-react';
import { DEVELOPER_BRANDING } from '../utils/developerBranding';

export const WhatsAppIcon: React.FC<{ className?: string }> = ({
  className = 'h-5 w-5',
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.968 0 1.758.459 3.474 1.332 4.988L2 22l5.18-1.359a9.927 9.927 0 0 0 4.847 1.258h.004c5.515 0 9.969-4.453 9.969-9.968A9.908 9.908 0 0 0 19.08 4.92 9.906 9.906 0 0 0 12.031 2Zm0 18.25h-.003a8.26 8.26 0 0 1-4.212-1.153l-.302-.179-3.133.822.836-3.054-.197-.313a8.252 8.252 0 0 1-1.271-4.405c0-4.568 3.717-8.285 8.286-8.285 2.212 0 4.292.862 5.856 2.427a8.228 8.228 0 0 1 2.425 5.859c0 4.569-3.717 8.281-8.285 8.281Zm4.545-6.204c-.249-.125-1.474-.728-1.703-.811-.228-.083-.394-.125-.56.125-.166.249-.644.811-.789.977-.145.166-.291.187-.54.062-.249-.125-1.052-.388-2.004-1.237-.741-.661-1.241-1.477-1.386-1.726-.145-.249-.015-.384.11-.508.112-.112.249-.291.374-.436.124-.146.166-.25.249-.416.083-.166.041-.312-.021-.436-.062-.125-.56-1.351-.768-1.85-.202-.485-.408-.419-.56-.427l-.478-.008c-.166 0-.436.062-.664.312-.229.249-.872.852-.872 2.078 0 1.226.893 2.411 1.017 2.577.125.166 1.758 2.684 4.259 3.763.595.257 1.059.41 1.421.525.597.19 1.141.163 1.571.099.479-.072 1.474-.603 1.682-1.185.208-.582.208-1.081.145-1.185-.062-.104-.228-.166-.477-.291Z" />
  </svg>
);

interface WhatsAppContactButtonProps {
  className?: string;
  compact?: boolean;
}

export const WhatsAppContactButton: React.FC<WhatsAppContactButtonProps> = ({
  className = '',
  compact = false,
}) => (
  <a
    href={DEVELOPER_BRANDING.whatsappUrl}
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-[#041b0c] font-bold whitespace-nowrap shrink-0 shadow-md transition-transform duration-150 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] ${
      compact ? 'px-4 py-2.5 text-xs sm:text-sm' : 'px-5 py-3 text-sm'
    } ${className}`}
  >
    <WhatsAppIcon className={compact ? 'h-4 w-4 shrink-0' : 'h-5 w-5 shrink-0'} />
    <span>{DEVELOPER_BRANDING.ctaLabel}</span>
    <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-75" aria-hidden="true" />
  </a>
);

export const AboutDeveloperSection: React.FC<{ className?: string }> = ({
  className = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
}) => (
  <section aria-labelledby="about-developer-heading" className={className}>
    <div className="rounded-2xl border border-[#253052] bg-gradient-to-br from-[#14182b] via-[#0d101b] to-[#080b14] p-6 sm:p-8 lg:p-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
        {/* Left Story & Engineering Craft */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
              About the Developer
            </p>
            <h2
              id="about-developer-heading"
              className="font-['Sora',sans-serif] text-2xl sm:text-3xl font-bold text-[#e9ebf7] [text-wrap:balance]"
            >
              Crafted for Clarity, Speed &amp; Real-World IT Problem Solving
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              <strong className="text-white">IT SUPPORT</strong> was designed and engineered by{' '}
              <strong className="text-white">{DEVELOPER_BRANDING.name}</strong> under the{' '}
              <strong className="text-[#27d3f0]">{DEVELOPER_BRANDING.brandName}</strong> digital
              brand to make technical troubleshooting accessible to everyone—from complete
              beginners to production System &amp; Network Engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-5 border-t border-[#1e2642]">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#8b6cff]">
                <Code2 className="h-4 w-4 shrink-0" />
                <span>Full-Stack Engineering</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Responsive React &amp; TypeScript architecture with 325+ structured runbooks.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#27d3f0]">
                <Layers className="h-4 w-4 shrink-0" />
                <span>Modern UI/UX Systems</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                High-contrast dark purple-cyan interface built for mobile and desktop speed.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#8b6cff]">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>Direct Collaboration</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect directly on WhatsApp for custom websites, SaaS tools, and web apps.
              </p>
            </div>
          </div>
        </div>

        {/* Right Official Developer Credit Column */}
        <div className="lg:col-span-5 border-t border-[#1e2642] pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400">
              {DEVELOPER_BRANDING.creditHeading}
            </p>
            <p className="font-['Sora',sans-serif] text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-[#8b6cff] via-[#6fa8ff] to-[#27d3f0] bg-clip-text text-transparent">
              {DEVELOPER_BRANDING.fullCreditName}
            </p>
            <p className="text-sm sm:text-base font-semibold text-[#e9ebf7]">
              {DEVELOPER_BRANDING.role}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>Name: {DEVELOPER_BRANDING.name}</span>
              <span aria-hidden="true">·</span>
              <span>Brand: {DEVELOPER_BRANDING.brandName}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">+{DEVELOPER_BRANDING.whatsappNumber}</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <WhatsAppContactButton className="w-full sm:w-auto lg:w-full" />
            <p className="text-xs text-slate-400">
              Instant connection via official WhatsApp link (opens in a new tab).
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export const FooterDeveloperBanner: React.FC = () => (
  <div className="mt-10 border-t border-[#181e31] pt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
    <div className="space-y-1">
      <p className="text-xs font-medium text-slate-400">
        {DEVELOPER_BRANDING.creditHeading}
      </p>
      <p className="font-['Sora',sans-serif] text-xl font-extrabold tracking-tight bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] bg-clip-text text-transparent">
        {DEVELOPER_BRANDING.fullCreditName}
      </p>
      <p className="text-xs sm:text-sm font-medium text-slate-300">
        {DEVELOPER_BRANDING.role}
      </p>
    </div>

    <div className="flex items-center">
      <WhatsAppContactButton compact />
    </div>
  </div>
);

export const FloatingWhatsAppButton: React.FC = () => (
  <a
    href={DEVELOPER_BRANDING.whatsappUrl}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Contact Developer VICKY VICTORIX on WhatsApp"
    title={DEVELOPER_BRANDING.ctaLabel}
    data-testid="floating-whatsapp-button"
    className="fixed bottom-5 right-5 z-40 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.38)] transition-transform duration-200 hover:scale-105 hover:bg-[#1ebe5d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
  >
    <WhatsAppIcon className="h-7 w-7" />
  </a>
);
