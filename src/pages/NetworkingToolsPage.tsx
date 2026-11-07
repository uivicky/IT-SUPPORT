import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  Globe,
  HelpCircle,
  Layers,
  Network,
  Search,
  Terminal,
} from 'lucide-react';
import {
  COMMON_PORTS,
  DNS_LOOKUP_GUIDE,
  IP_RANGES_GUIDE,
  OSI_LAYERS,
  TCPIP_MODEL,
  TCP_VS_UDP,
} from '../data/networkingRefData';
import { NETWORKING_VISUAL_LESSONS } from '../data/networkingLessonsAndRoadmap13';
import {
  calculateSubnet,
  cidrToSubnetMask,
  getCommonCidrTable,
  subnetMaskToCidr,
} from '../utils/networkCalc';
import { CopyButton } from '../components/CopyButton';
import { usePageSEO } from '../utils/seo';

type ToolSection =
  | 'visual-lessons'
  | 'calculators'
  | 'models'
  | 'dns'
  | 'ports'
  | 'ip-guide';

export const NetworkingToolsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ToolSection>('visual-lessons');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    NETWORKING_VISUAL_LESSONS[0].id
  );
  const [activeHopIndex, setActiveHopIndex] = useState<number>(0);
  const [revealedAnswerIds, setRevealedAnswerIds] = useState<Record<string, boolean>>({});

  const [ipInput, setIpInput] = useState('192.168.10.45');
  const [cidrInput, setCidrInput] = useState<number>(26);
  const [maskInput, setMaskInput] = useState('255.255.255.192');
  const [maskError, setMaskError] = useState('');
  const [dnsDomain, setDnsDomain] = useState('company.com');
  const [portQuery, setPortQuery] = useState('');
  const [selectedOsiLayer, setSelectedOsiLayer] = useState<number>(7);

  usePageSEO({
    title: 'Interactive Networking Learning & Subnet Calculator — IP, DNS, DHCP, OSI & Ports',
    description:
      'Learn 13 core networking concepts visually (IP Address, Subnet Mask, Default Gateway, DNS, DHCP, MAC, TCP, UDP, Ports, OSI & TCP/IP) with an interactive IPv4 Subnet Calculator and clickable OSI layers.',
    canonicalPath: '/networking-tools',
  });

  const selectedLesson = useMemo(
    () =>
      NETWORKING_VISUAL_LESSONS.find((l) => l.id === selectedLessonId) ||
      NETWORKING_VISUAL_LESSONS[0],
    [selectedLessonId]
  );

  const subnetResult = useMemo(
    () => calculateSubnet(ipInput, cidrInput),
    [ipInput, cidrInput]
  );

  const cidrTable = useMemo(() => getCommonCidrTable(), []);

  const handleCidrChange = (nextCidr: number) => {
    const clamped = Math.max(0, Math.min(32, nextCidr));
    setCidrInput(clamped);
    setMaskInput(cidrToSubnetMask(clamped));
    setMaskError('');
  };

  const handleMaskChange = (rawMask: string) => {
    setMaskInput(rawMask);
    const parsedCidr = subnetMaskToCidr(rawMask);
    if (parsedCidr !== null) {
      setCidrInput(parsedCidr);
      setMaskError('');
    } else {
      setMaskError(
        'Enter a valid contiguous IPv4 subnet mask (e.g., 255.255.255.0 or 255.255.254.0).'
      );
    }
  };

  const filteredPorts = useMemo(() => {
    const q = portQuery.trim().toLowerCase();
    if (!q) return COMMON_PORTS;
    return COMMON_PORTS.filter(
      (p) =>
        String(p.port).includes(q) ||
        p.service.toLowerCase().includes(q) ||
        p.protocol.toLowerCase().includes(q) ||
        p.usage.toLowerCase().includes(q)
    );
  }, [portQuery]);

  const activeOsiData = useMemo(
    () => OSI_LAYERS.find((l) => l.layer === selectedOsiLayer) || OSI_LAYERS[0],
    [selectedOsiLayer]
  );

  const cleanDomain = (dnsDomain.trim() || 'company.com')
    .replace(/^https?:\/\//, '')
    .split('/')[0];

  const rawBinaryBits = useMemo(() => {
    if (!subnetResult.valid) return '';
    return subnetResult.binaryIp.replace(/\./g, '');
  }, [subnetResult]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-b border-[#181e31] pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-wide text-[#27d3f0]">
            Interactive Networking Learning &amp; Engineering Calculators
          </p>
          <h1 className="mt-2 font-['Sora',sans-serif] text-2xl sm:text-4xl font-bold text-white">
            Visual Networking Studio &amp; IPv4 Tools
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400">
            Master all 13 essential networking concepts with animated packet flows, inspect 32-bit IPv4 subnet boundaries visually, explore clickable OSI layers, and look up DNS &amp; ports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/challenges?mode=networking"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#263154] bg-[#151827] px-3.5 py-2 text-xs sm:text-sm font-semibold text-white hover:border-[#8b6cff] whitespace-nowrap shrink-0"
          >
            <span>Take Networking Quiz</span>
            <ArrowRight className="h-3.5 w-3.5 text-[#27d3f0]" />
          </Link>
        </div>
      </header>

      {/* Section Navigation Tabs */}
      <div
        role="tablist"
        aria-label="Networking learning and calculator sections"
        className="mt-8 flex flex-wrap gap-2"
      >
        {[
          { id: 'visual-lessons', label: '13 Visual Networking Lessons', icon: BookOpen },
          { id: 'calculators', label: 'Visual Subnet & CIDR Calculator', icon: Calculator },
          { id: 'models', label: 'Clickable OSI & TCP/IP Layers', icon: Layers },
          { id: 'dns', label: 'DNS Lookup Builder', icon: Globe },
          { id: 'ports', label: 'Common Ports', icon: Network },
          { id: 'ip-guide', label: 'Private vs Public IPs', icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id as ToolSection)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                active
                  ? 'border-[#27d3f0] bg-[#27d3f0]/15 text-[#27d3f0]'
                  : 'border-[#1d2338] bg-[#0d101b] text-slate-300 hover:border-[#8b6cff]/50 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 0: 13 VISUAL NETWORKING LESSONS */}
      {activeTab === 'visual-lessons' && (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Selector: All 13 Concepts */}
          <aside className="lg:col-span-4 rounded-xl border border-[#1d2338] bg-[#0d101b] p-4 space-y-2">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-[#181e31]">
              <h2 className="font-['Sora',sans-serif] text-sm font-bold text-white">
                13 Core Networking Concepts
              </h2>
              <span className="font-mono text-xs text-[#27d3f0] tabular-nums">
                {NETWORKING_VISUAL_LESSONS.findIndex((l) => l.id === selectedLesson.id) + 1}/13
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5">
              {NETWORKING_VISUAL_LESSONS.map((lesson, idx) => {
                const isSelected = lesson.id === selectedLesson.id;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => {
                      setSelectedLessonId(lesson.id);
                      setActiveHopIndex(0);
                    }}
                    className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'border-[#27d3f0] bg-[#131d36] text-white'
                        : 'border-transparent bg-[#090c16] text-slate-300 hover:border-[#242e4e] hover:text-white'
                    }`}
                  >
                    <span className="truncate text-xs sm:text-sm font-medium">
                      <span className="font-mono text-xs text-[#8b6cff] mr-2 tabular-nums">
                        {String(idx + 1).padStart(2, '0')}.
                      </span>
                      {lesson.title}
                    </span>
                    <ArrowRight
                      className={`h-3.5 w-3.5 shrink-0 ${
                        isSelected ? 'text-[#27d3f0]' : 'text-slate-600'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Stage: Visual Animated Packet Flow + Simple Analogy + Check Question */}
          <section className="lg:col-span-8 rounded-xl border border-[#1d2338] bg-[#0d101b] p-6 sm:p-7 space-y-6">
            <div className="border-b border-[#181e31] pb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs text-[#27d3f0] font-medium">
                  Concept {NETWORKING_VISUAL_LESSONS.findIndex((l) => l.id === selectedLesson.id) + 1} of 13 · {selectedLesson.tagline}
                </p>
                <h2 className="mt-1 font-['Sora',sans-serif] text-2xl sm:text-3xl font-bold text-white">
                  {selectedLesson.title}
                </h2>
              </div>

              {selectedLesson.id === 'subnet-mask' || selectedLesson.id === 'ip-address' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('calculators')}
                  className="rounded-lg border border-[#27d3f0]/50 bg-[#111c30] px-3.5 py-2 text-xs font-semibold text-[#27d3f0] hover:bg-[#162540] cursor-pointer whitespace-nowrap shrink-0"
                >
                  Try in Visual Subnet Calculator →
                </button>
              ) : selectedLesson.id === 'osi-model' || selectedLesson.id === 'tcp-ip-model' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('models')}
                  className="rounded-lg border border-[#8b6cff]/50 bg-[#171330] px-3.5 py-2 text-xs font-semibold text-[#e9ebf7] hover:border-[#8b6cff] cursor-pointer whitespace-nowrap shrink-0"
                >
                  Open Clickable OSI Layers →
                </button>
              ) : null}
            </div>

            {/* Animated SVG Packet Flow Diagram */}
            <div className="rounded-xl border border-[#1e2745] bg-[#070a14] p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span className="font-semibold text-white">
                  Animated Packet &amp; Signal Flow (Click any hop to inspect)
                </span>
                <span className="font-mono text-[#27d3f0]">
                  Active Hop: 0{activeHopIndex + 1} / 04
                </span>
              </div>

              <div className="overflow-x-auto">
                <svg
                  viewBox="0 0 760 128"
                  className="w-full min-w-[540px] h-auto block"
                  role="img"
                  aria-label={`Animated packet flow diagram for ${selectedLesson.title}`}
                >
                  <defs>
                    <linearGradient id="netFlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b6cff" />
                      <stop offset="100%" stopColor="#27d3f0" />
                    </linearGradient>
                  </defs>

                  <line
                    x1="95"
                    y1="54"
                    x2="665"
                    y2="54"
                    stroke="#1b2442"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <line
                    x1="95"
                    y1="54"
                    x2={95 + activeHopIndex * 190}
                    y2="54"
                    stroke="url(#netFlowGrad)"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  <circle r="6" cy="54" fill="#27d3f0">
                    <animate
                      attributeName="cx"
                      from="95"
                      to="665"
                      dur="3.6s"
                      repeatCount="indefinite"
                    />
                  </circle>

                  {selectedLesson.packetFlow.map((hop, idx) => {
                    const cx = 95 + idx * 190;
                    const active = idx === activeHopIndex;
                    return (
                      <g
                        key={hop}
                        onClick={() => setActiveHopIndex(idx)}
                        className="cursor-pointer"
                      >
                        {active && (
                          <circle cx={cx} cy="54" r="26" fill="#27d3f0" opacity="0.16" />
                        )}
                        <circle
                          cx={cx}
                          cy="54"
                          r="19"
                          fill={active ? '#13203d' : '#0c1020'}
                          stroke={active ? '#27d3f0' : '#8b6cff'}
                          strokeWidth={active ? '2.8' : '1.8'}
                        />
                        <text
                          x={cx}
                          y="58"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="11"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          0{idx + 1}
                        </text>
                        <text
                          x={cx}
                          y="98"
                          textAnchor="middle"
                          fill={active ? '#27d3f0' : '#e2e8f0'}
                          fontSize="11"
                          fontWeight={active ? '700' : '500'}
                        >
                          {hop.length > 22 ? `${hop.slice(0, 21)}…` : hop}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {selectedLesson.packetFlow.map((hop, idx) => (
                  <button
                    key={hop}
                    type="button"
                    onClick={() => setActiveHopIndex(idx)}
                    className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                      idx === activeHopIndex
                        ? 'border-[#27d3f0] bg-[#111c33] text-white font-semibold'
                        : 'border-[#1b233d] bg-[#0b0e1a] text-slate-300 hover:border-[#8b6cff]/60'
                    }`}
                  >
                    <span className="block font-mono text-[10px] text-[#27d3f0]">
                      HOP 0{idx + 1}
                    </span>
                    <span className="mt-0.5 block truncate">{hop}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Simple Explanation & Real-Life Analogy */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[#1d2540] bg-[#080b14] p-4 space-y-1.5">
                <span className="text-xs font-semibold text-[#27d3f0]">
                  Simple Plain-English Explanation
                </span>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {selectedLesson.simpleExplanation}
                </p>
              </div>

              <div className="rounded-xl border border-[#1d2540] bg-[#080b14] p-4 space-y-1.5">
                <span className="text-xs font-semibold text-[#8b6cff]">
                  Real-Life Everyday Analogy
                </span>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {selectedLesson.realLifeAnalogy}
                </p>
              </div>
            </div>

            {/* Engineer Troubleshooting Tip */}
            <div className="rounded-xl border border-[#1d2540] bg-[#080b14] p-4 flex items-start gap-3">
              <Terminal className="h-5 w-5 text-[#27d3f0] shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-white">
                  How IT Support Engineers Use This on Real Tickets
                </span>
                <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                  {selectedLesson.engineerExample}
                </p>
              </div>
            </div>

            {/* Quick Interactive Self-Check */}
            <div className="rounded-xl border border-[#263258] bg-[#101528] p-4 sm:p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="h-5 w-5 text-[#27d3f0] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-[#27d3f0]">
                      Quick Concept Check
                    </span>
                    <p className="mt-0.5 text-sm font-semibold text-white">
                      {selectedLesson.quickQuestion}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setRevealedAnswerIds((prev) => ({
                      ...prev,
                      [selectedLesson.id]: !prev[selectedLesson.id],
                    }))
                  }
                  className="rounded-lg border border-[#2c3963] bg-[#090c17] px-3 py-1.5 text-xs font-semibold text-[#27d3f0] hover:border-[#27d3f0] cursor-pointer whitespace-nowrap shrink-0"
                >
                  {revealedAnswerIds[selectedLesson.id] ? 'Hide Answer' : 'Reveal Answer'}
                </button>
              </div>

              {revealedAnswerIds[selectedLesson.id] && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200 flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{selectedLesson.quickAnswer}</span>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* TAB 1: IPv4 SUBNET + VISUAL IP BREAKDOWN + CIDR + MASK CALCULATOR */}
      {activeTab === 'calculators' && (
        <div className="mt-8 space-y-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Calculator Inputs */}
            <section className="lg:col-span-5 rounded-xl border border-[#1d2338] bg-[#0d101b] p-6 space-y-5">
              <h2 className="font-['Sora',sans-serif] text-lg font-bold text-white">
                Subnet, CIDR &amp; Mask Inputs
              </h2>

              <div>
                <label
                  htmlFor="ipv4-address-input"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  IPv4 Address
                </label>
                <input
                  id="ipv4-address-input"
                  type="text"
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  placeholder="e.g., 192.168.10.45"
                  className="w-full rounded-lg border border-[#242c46] bg-[#070911] px-3.5 py-2.5 font-mono text-sm text-white focus:border-[#27d3f0] focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <label htmlFor="cidr-prefix-select">
                    CIDR Prefix Length: /{cidrInput}
                  </label>
                  <span className="font-mono text-[#27d3f0] tabular-nums">
                    {cidrInput} Network bits · {32 - cidrInput} Host bits
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={32}
                  value={cidrInput}
                  aria-label="Adjust CIDR prefix slider"
                  onChange={(e) => handleCidrChange(Number(e.target.value))}
                  className="w-full accent-[#27d3f0] mb-2 cursor-pointer"
                />
                <select
                  id="cidr-prefix-select"
                  value={cidrInput}
                  onChange={(e) => handleCidrChange(Number(e.target.value))}
                  className="w-full rounded-lg border border-[#242c46] bg-[#070911] px-3.5 py-2.5 font-mono text-sm text-white focus:border-[#27d3f0] focus:outline-none"
                >
                  {Array.from({ length: 33 }, (_, idx) => 32 - idx).map((prefix) => (
                    <option key={prefix} value={prefix}>
                      /{prefix} — {cidrToSubnetMask(prefix)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="subnet-mask-input"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Subnet Mask Converter (Bidirectional)
                </label>
                <input
                  id="subnet-mask-input"
                  type="text"
                  value={maskInput}
                  onChange={(e) => handleMaskChange(e.target.value)}
                  placeholder="e.g., 255.255.255.192"
                  className="w-full rounded-lg border border-[#242c46] bg-[#070911] px-3.5 py-2.5 font-mono text-sm text-white focus:border-[#8b6cff] focus:outline-none"
                />
                {maskError && (
                  <p className="mt-1.5 text-xs text-amber-400">{maskError}</p>
                )}
              </div>

              {/* Quick Presets */}
              <div className="pt-2 border-t border-[#181e31]">
                <span className="block text-xs text-slate-400 mb-2">
                  Quick Network Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '192.168.10.45/26', ip: '192.168.10.45', cidr: 26 },
                    { label: '192.168.1.25/24', ip: '192.168.1.25', cidr: 24 },
                    { label: '10.20.0.1/22', ip: '10.20.0.1', cidr: 22 },
                    { label: '172.16.5.10/30', ip: '172.16.5.10', cidr: 30 },
                    { label: '169.254.12.8/16 (APIPA)', ip: '169.254.12.8', cidr: 16 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setIpInput(preset.ip);
                        handleCidrChange(preset.cidr);
                      }}
                      className="rounded-md border border-[#242c46] bg-[#121728] px-2.5 py-1 font-mono text-xs text-slate-300 hover:border-[#27d3f0] hover:text-white cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Live Calculation Output + Visual 32-Bit IP Breakdown */}
            <section className="lg:col-span-7 rounded-xl border border-[#1d2338] bg-[#0d101b] p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#181e31] pb-4">
                <h2 className="font-['Sora',sans-serif] text-lg font-bold text-white">
                  Visual IP Breakdown &amp; Calculated Subnet Range
                </h2>
                {subnetResult.valid && (
                  <CopyButton
                    text={`CIDR: ${subnetResult.cidrNotation} | Mask: ${subnetResult.subnetMask} | Range: ${subnetResult.firstUsableHost} - ${subnetResult.lastUsableHost} | Broadcast: ${subnetResult.broadcastAddress} | Usable Hosts: ${subnetResult.usableHosts.toLocaleString()}`}
                    label="Copy Summary"
                  />
                )}
              </div>

              {!subnetResult.valid ? (
                <div
                  role="alert"
                  className="mt-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200 flex items-center gap-3"
                >
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
                  <span>{subnetResult.error}</span>
                </div>
              ) : (
                <div className="mt-5 space-y-5">
                  {/* Visual 32-Bit Network vs Host Boundary Bar */}
                  <div className="rounded-xl border border-[#212b4a] bg-[#070a13] p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-semibold text-white">
                        Visual 32-Bit IPv4 Boundary (/{cidrInput})
                      </span>
                      <div className="flex items-center gap-3 font-mono text-xs tabular-nums">
                        <span className="text-[#8b6cff]">
                          ■ Network Prefix ({cidrInput} bits)
                        </span>
                        <span className="text-[#27d3f0]">
                          ■ Host Portion ({32 - cidrInput} bits)
                        </span>
                      </div>
                    </div>

                    {/* Proportional Split Bar */}
                    <div className="flex h-3.5 w-full overflow-hidden rounded-md border border-[#1e2744] bg-[#0c1020]">
                      <div
                        style={{ width: `${(cidrInput / 32) * 100}%` }}
                        className="bg-[#8b6cff] transition-all duration-200"
                        title={`Network Portion: ${cidrInput} bits`}
                      />
                      <div
                        style={{ width: `${((32 - cidrInput) / 32) * 100}%` }}
                        className="bg-[#27d3f0] transition-all duration-200"
                        title={`Host Portion: ${32 - cidrInput} bits`}
                      />
                    </div>

                    {/* Color-Coded 32 Individual Bits Grouped into 4 Octets */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {[0, 1, 2, 3].map((octetIdx) => {
                        const octetBits = rawBinaryBits.slice(
                          octetIdx * 8,
                          octetIdx * 8 + 8
                        );
                        const ipOctet = ipInput.trim().split('.')[octetIdx] || '0';
                        const maskOctet = subnetResult.subnetMask.split('.')[octetIdx];
                        return (
                          <div
                            key={octetIdx}
                            className="rounded-lg border border-[#1a223a] bg-[#0b0f1d] p-2.5 text-center"
                          >
                            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                              <span>Octet {octetIdx + 1}</span>
                              <span className="text-white font-bold tabular-nums">{ipOctet}</span>
                            </div>
                            <div className="mt-1.5 font-mono text-xs tracking-wider">
                              {octetBits.split('').map((bit, bitOffset) => {
                                const globalBitIndex = octetIdx * 8 + bitOffset;
                                const isNetworkBit = globalBitIndex < cidrInput;
                                return (
                                  <span
                                    key={bitOffset}
                                    className={
                                      isNetworkBit
                                        ? 'text-[#8b6cff] font-bold'
                                        : 'text-[#27d3f0] font-bold'
                                    }
                                  >
                                    {bit}
                                  </span>
                                );
                              })}
                            </div>
                            <span className="mt-1 block font-mono text-[10px] text-slate-400 tabular-nums">
                              Mask: {maskOctet}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-[#1c243c] bg-[#080a12] p-3.5">
                      <span className="text-xs text-slate-400">Network Address (CIDR)</span>
                      <p className="mt-1 font-mono text-base font-bold text-[#27d3f0] tabular-nums">
                        {subnetResult.cidrNotation}
                      </p>
                    </div>
                    <div className="rounded-lg border border-[#1c243c] bg-[#080a12] p-3.5">
                      <span className="text-xs text-slate-400">Broadcast Address</span>
                      <p className="mt-1 font-mono text-base font-bold text-white tabular-nums">
                        {subnetResult.broadcastAddress}
                      </p>
                    </div>
                    <div className="rounded-lg border border-[#1c243c] bg-[#080a12] p-3.5">
                      <span className="text-xs text-slate-400">Usable Host IP Range</span>
                      <p className="mt-1 font-mono text-sm font-semibold text-emerald-400 tabular-nums">
                        {subnetResult.firstUsableHost} – {subnetResult.lastUsableHost}
                      </p>
                    </div>
                    <div className="rounded-lg border border-[#1c243c] bg-[#080a12] p-3.5">
                      <span className="text-xs text-slate-400">Usable Hosts / Total IPs</span>
                      <p className="mt-1 font-mono text-sm font-semibold text-white tabular-nums">
                        {subnetResult.usableHosts.toLocaleString()} usable ({subnetResult.totalAddresses.toLocaleString()} total)
                      </p>
                    </div>
                    <div className="rounded-lg border border-[#1c243c] bg-[#080a12] p-3.5">
                      <span className="text-xs text-slate-400">Subnet Mask / Wildcard</span>
                      <p className="mt-1 font-mono text-sm text-slate-200 tabular-nums">
                        {subnetResult.subnetMask} · <span className="text-slate-400">{subnetResult.wildcardMask}</span>
                      </p>
                    </div>
                    <div className="rounded-lg border border-[#1c243c] bg-[#080a12] p-3.5">
                      <span className="text-xs text-slate-400">IP Class &amp; Routing Scope</span>
                      <p className="mt-1 text-xs sm:text-sm font-medium text-[#8b6cff]">
                        {subnetResult.ipClass} · {subnetResult.scopeType}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Quick CIDR Reference Table */}
          <section className="rounded-xl border border-[#1d2338] bg-[#0d101b] overflow-hidden">
            <div className="border-b border-[#181e31] px-6 py-4">
              <h2 className="font-['Sora',sans-serif] text-base font-bold text-white">
                CIDR &amp; Subnet Mask Cheat Sheet (Click any row to load calculator)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-[#181e31] bg-[#090c16] text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-5 py-3">CIDR</th>
                    <th className="px-5 py-3">Subnet Mask</th>
                    <th className="px-5 py-3">Wildcard Mask</th>
                    <th className="px-5 py-3 text-right">Total IPs</th>
                    <th className="px-5 py-3 text-right">Usable Hosts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161c2e] font-mono tabular-nums">
                  {cidrTable.map((row) => (
                    <tr
                      key={row.cidr}
                      onClick={() => handleCidrChange(row.cidr)}
                      className={`cursor-pointer transition-colors hover:bg-[#13182a] ${
                        row.cidr === cidrInput ? 'bg-[#8b6cff]/12 text-[#27d3f0]' : 'text-slate-300'
                      }`}
                    >
                      <td className="px-5 py-2.5 font-semibold">/{row.cidr}</td>
                      <td className="px-5 py-2.5">{row.subnetMask}</td>
                      <td className="px-5 py-2.5 text-slate-400">{row.wildcardMask}</td>
                      <td className="px-5 py-2.5 text-right">{row.totalAddresses.toLocaleString()}</td>
                      <td className="px-5 py-2.5 text-right text-emerald-400">
                        {row.usableHosts.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* TAB 2: CLICKABLE INTERACTIVE OSI 7-LAYER EXPLORER + TCP/IP + TCP VS UDP */}
      {activeTab === 'models' && (
        <div className="mt-8 space-y-10">
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Clickable 7-Layer Stack */}
            <div className="lg:col-span-5 rounded-xl border border-[#1d2338] bg-[#0d101b] p-5 space-y-2.5">
              <div className="pb-2 border-b border-[#181e31]">
                <h2 className="font-['Sora',sans-serif] text-lg font-bold text-white">
                  Clickable OSI 7-Layer Stack
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any layer from Layer 7 down to Layer 1 to inspect its PDU, real-world protocols, failure symptoms, and CLI check:
                </p>
              </div>

              {OSI_LAYERS.map((layer) => {
                const isSelected = layer.layer === selectedOsiLayer;
                return (
                  <button
                    key={layer.layer}
                    type="button"
                    onClick={() => setSelectedOsiLayer(layer.layer)}
                    className={`w-full rounded-xl border p-3.5 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-[#27d3f0] bg-gradient-to-r from-[#13223d] to-[#11162b] text-white'
                        : 'border-[#1b233b] bg-[#080a13] text-slate-300 hover:border-[#8b6cff]/60'
                    }`}
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-[#27d3f0] tabular-nums">
                        Layer {layer.layer} · {layer.pdu}
                      </span>
                      <p className="font-['Sora',sans-serif] text-base font-bold text-white mt-0.5">
                        {layer.name}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 truncate max-w-[140px]">
                      {layer.protocols}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Layer Inspector */}
            <div className="lg:col-span-7 rounded-xl border border-[#1d2338] bg-[#0d101b] p-6 sm:p-7 flex flex-col justify-between space-y-6">
              <div className="space-y-5">
                <div className="border-b border-[#181e31] pb-4">
                  <span className="font-mono text-xs font-semibold text-[#27d3f0]">
                    OSI Layer {activeOsiData.layer} of 7 · Protocol Data Unit: {activeOsiData.pdu}
                  </span>
                  <h3 className="mt-1 font-['Sora',sans-serif] text-2xl sm:text-3xl font-bold text-white">
                    Layer {activeOsiData.layer}: {activeOsiData.name} Layer
                  </h3>
                </div>

                {/* Animated Encapsulation Visual */}
                <div className="rounded-xl border border-[#1e2745] bg-[#070a14] p-4">
                  <span className="text-xs font-semibold text-slate-300">
                    Packet Encapsulation Journey (Sender wraps 7 → 1, Switch/Router forwards, Receiver unwraps 1 → 7)
                  </span>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 font-mono text-xs">
                    {[7, 6, 5, 4, 3, 2, 1].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSelectedOsiLayer(num)}
                        className={`rounded-md px-2.5 py-1.5 transition-colors cursor-pointer tabular-nums ${
                          num === activeOsiData.layer
                            ? 'bg-[#27d3f0] text-[#06070d] font-bold'
                            : 'bg-[#12172b] text-slate-300 hover:text-white'
                        }`}
                      >
                        L{num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#1c243c] bg-[#080a12] p-4">
                    <span className="text-xs font-semibold text-[#8b6cff]">
                      Protocols &amp; Standards
                    </span>
                    <p className="mt-1.5 text-sm text-white font-medium">
                      {activeOsiData.protocols}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#1c243c] bg-[#080a12] p-4">
                    <span className="text-xs font-semibold text-[#27d3f0]">
                      Hardware / System Components
                    </span>
                    <p className="mt-1.5 text-sm text-white font-medium">
                      {activeOsiData.devices}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <span className="text-xs font-semibold text-amber-300">
                    Real-World Failure Symptoms at Layer {activeOsiData.layer}
                  </span>
                  <p className="mt-1 text-sm text-amber-100 leading-relaxed">
                    {activeOsiData.failureSymptoms}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-[#1e2744] bg-[#070911] p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="block text-xs text-slate-400">
                    First Engineer Verification Command for Layer {activeOsiData.layer}
                  </span>
                  <code className="mt-1 block font-mono text-sm text-[#27d3f0]">
                    {activeOsiData.checkCmd}
                  </code>
                </div>
                <CopyButton text={activeOsiData.checkCmd} label="Copy Command" />
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-6">
              <h2 className="font-['Sora',sans-serif] text-lg font-bold text-white">
                TCP/IP 4-Layer Suite Mapping
              </h2>
              <div className="mt-4 space-y-3">
                {TCPIP_MODEL.map((m) => (
                  <div
                    key={m.layer}
                    className="rounded-lg border border-[#1a2238] bg-[#080a12] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-semibold text-white text-sm">{m.layer}</h3>
                      <span className="text-xs text-[#8b6cff]">{m.mapsToOsi}</span>
                    </div>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {m.summary}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-6">
              <h2 className="font-['Sora',sans-serif] text-lg font-bold text-white">
                TCP vs UDP Comparison
              </h2>
              <div className="mt-4 space-y-3">
                {TCP_VS_UDP.map((row) => (
                  <div
                    key={row.attribute}
                    className="rounded-lg border border-[#1a2238] bg-[#080a12] p-3.5 text-xs sm:text-sm"
                  >
                    <p className="font-semibold text-[#27d3f0]">{row.attribute}</p>
                    <p className="mt-1 text-slate-200">
                      <strong>TCP:</strong> {row.tcp}
                    </p>
                    <p className="mt-1 text-slate-400">
                      <strong>UDP:</strong> {row.udp}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}

      {/* TAB 3: DNS LOOKUP GUIDE & COMMAND GENERATOR */}
      {activeTab === 'dns' && (
        <div className="mt-8 space-y-6">
          <div className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-6">
            <label
              htmlFor="dns-domain-input"
              className="block text-xs font-medium text-slate-300 mb-2"
            >
              Enter Target Domain or Hostname to Generate Live DNS Diagnostic Commands
            </label>
            <input
              id="dns-domain-input"
              type="text"
              value={dnsDomain}
              onChange={(e) => setDnsDomain(e.target.value)}
              placeholder="e.g., microsoft.com or corp.local"
              className="w-full max-w-md rounded-lg border border-[#242c46] bg-[#070911] px-3.5 py-2.5 font-mono text-sm text-white focus:border-[#27d3f0] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {DNS_LOOKUP_GUIDE.map((item) => {
              const winCmd = item.cmdWindows.replace(/company\.com|corp\.local/g, cleanDomain);
              const linCmd = item.cmdLinux.replace(/company\.com|corp\.local/g, cleanDomain);
              return (
                <div
                  key={item.record}
                  className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-5 space-y-3.5"
                >
                  <div>
                    <h2 className="font-['Sora',sans-serif] text-base font-bold text-[#27d3f0]">
                      {item.record} Record
                    </h2>
                    <p className="mt-1 text-sm text-slate-300">{item.purpose}</p>
                  </div>

                  <div className="rounded-lg border border-[#1a2238] bg-[#070911] p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="block text-[11px] text-slate-400">Windows PowerShell / CMD</span>
                      <code className="block truncate font-mono text-xs text-slate-100 mt-0.5">
                        {winCmd}
                      </code>
                    </div>
                    <CopyButton text={winCmd} />
                  </div>

                  <div className="rounded-lg border border-[#1a2238] bg-[#070911] p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="block text-[11px] text-slate-400">Linux / macOS dig</span>
                      <code className="block truncate font-mono text-xs text-slate-100 mt-0.5">
                        {linCmd}
                      </code>
                    </div>
                    <CopyButton text={linCmd} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: COMMON PORT REFERENCE */}
      {activeTab === 'ports' && (
        <div className="mt-8 space-y-5">
          <div className="relative max-w-md">
            <label htmlFor="port-search-input" className="sr-only">
              Search port number or protocol
            </label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="port-search-input"
              type="search"
              value={portQuery}
              onChange={(e) => setPortQuery(e.target.value)}
              placeholder="Filter by port (445, 3389, 88) or service (Kerberos, SMB, SSH)..."
              className="w-full rounded-lg border border-[#242c46] bg-[#0d101b] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#27d3f0] focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-[#1d2338] bg-[#0d101b] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#181e31] bg-[#090c16] text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Port</th>
                    <th className="px-5 py-3">Transport</th>
                    <th className="px-5 py-3">Service</th>
                    <th className="px-5 py-3">Enterprise Role</th>
                    <th className="px-5 py-3">Security &amp; Firewall Guidance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161c2e]">
                  {filteredPorts.map((p) => (
                    <tr key={p.port} className="hover:bg-[#111627]">
                      <td className="px-5 py-3 font-mono font-bold text-[#27d3f0] tabular-nums">
                        {p.port}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-[#8b6cff]">
                        {p.protocol}
                      </td>
                      <td className="px-5 py-3 font-semibold text-white whitespace-nowrap">
                        {p.service}
                      </td>
                      <td className="px-5 py-3 text-slate-300">{p.usage}</td>
                      <td className="px-5 py-3 text-xs text-slate-400">{p.securityNote}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PRIVATE VS PUBLIC IP GUIDE */}
      {activeTab === 'ip-guide' && (
        <div className="mt-8 rounded-xl border border-[#1d2338] bg-[#0d101b] overflow-hidden">
          <div className="border-b border-[#181e31] px-6 py-4">
            <h2 className="font-['Sora',sans-serif] text-lg font-bold text-white">
              Private (RFC 1918), CGNAT, APIPA &amp; Special IPv4 Address Blocks
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Private addresses require NAT to reach the internet; any unicast IP outside these reserved blocks is publicly routable on the global internet.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#181e31] bg-[#090c16] text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3">CIDR Block</th>
                  <th className="px-5 py-3">Address Range</th>
                  <th className="px-5 py-3">Classification</th>
                  <th className="px-5 py-3">Enterprise Architecture Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161c2e]">
                {IP_RANGES_GUIDE.map((item) => (
                  <tr key={item.cidr} className="hover:bg-[#111627]">
                    <td className="px-5 py-3.5 font-mono font-semibold text-[#27d3f0] whitespace-nowrap">
                      {item.cidr}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-200 whitespace-nowrap">
                      {item.range}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#8b6cff] whitespace-nowrap">
                      {item.scope}
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">{item.typicalUse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
