import React from 'react';
import { LabStage } from '../data/learningLabData';

/**
 * Custom Futuristic SVG Technology Illustration for the 25 Beginner Lessons
 */
export const ConceptIllustration: React.FC<{
  lessonNumber: number;
  chapter: string;
  title: string;
}> = ({ lessonNumber, chapter, title }) => {
  const variant =
    chapter === 'Computer Basics'
      ? 'basics'
      : chapter === 'Inside a PC'
      ? 'hardware'
      : chapter === 'Networking & Internet'
      ? 'network'
      : 'enterprise';

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#222c4c] bg-gradient-to-br from-[#12172e] via-[#0b0f1e] to-[#070912] p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div className="w-full sm:w-56 shrink-0">
          <svg
            viewBox="0 0 260 150"
            role="img"
            aria-label={`Visual diagram for ${title}`}
            className="w-full h-auto block"
          >
            <defs>
              <linearGradient id={`grad-${lessonNumber}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b6cff" />
                <stop offset="100%" stopColor="#27d3f0" />
              </linearGradient>
              <radialGradient id={`glow-${lessonNumber}`} cx="50%" cy="50%" r="55%">
                <stop offset="0%" stopColor="#27d3f0" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#06070d" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Ambient glow & subtle engineering grid */}
            <rect width="260" height="150" rx="12" fill="#090c18" />
            <circle cx="130" cy="75" r="70" fill={`url(#glow-${lessonNumber})`} />
            <path
              d="M20 35 H240 M20 75 H240 M20 115 H240 M65 15 V135 M130 15 V135 M195 15 V135"
              stroke="#18203a"
              strokeWidth="1"
              strokeDasharray="3 3"
            />

            {variant === 'basics' && (
              <g>
                {/* Laptop Screen + Base + Binary Pulse */}
                <rect
                  x="68"
                  y="26"
                  width="124"
                  height="76"
                  rx="8"
                  fill="#0f152a"
                  stroke={`url(#grad-${lessonNumber})`}
                  strokeWidth="2.2"
                />
                <rect x="78" y="36" width="104" height="54" rx="4" fill="#070a14" />
                {/* Code / UI bars inside screen */}
                <rect x="86" y="45" width="46" height="6" rx="3" fill="#8b6cff" />
                <rect x="86" y="57" width="76" height="5" rx="2.5" fill="#27d3f0" opacity="0.85" />
                <rect x="86" y="68" width="60" height="5" rx="2.5" fill="#475569" />
                <path
                  d="M52 108 H208 L220 120 H40 Z"
                  fill="#171f3a"
                  stroke="#27d3f0"
                  strokeWidth="1.5"
                />
                {/* Floating I/O badges */}
                <circle cx="36" cy="56" r="13" fill="#131930" stroke="#8b6cff" strokeWidth="1.5" />
                <text x="36" y="60" textAnchor="middle" fill="#27d3f0" fontSize="9" fontFamily="monospace">
                  IN
                </text>
                <circle cx="224" cy="56" r="13" fill="#131930" stroke="#27d3f0" strokeWidth="1.5" />
                <text x="224" y="60" textAnchor="middle" fill="#e9ebf7" fontSize="8" fontFamily="monospace">
                  OUT
                </text>
              </g>
            )}

            {variant === 'hardware' && (
              <g>
                {/* CPU Die + Circuit Traces + RAM/NVMe */}
                <path
                  d="M40 55 H92 M40 75 H92 M40 95 H92 M168 55 H220 M168 75 H220 M168 95 H220 M110 22 V42 M130 22 V42 M150 22 V42 M110 108 V128 M130 108 V128 M150 108 V128"
                  stroke="#27d3f0"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <rect
                  x="92"
                  y="40"
                  width="76"
                  height="70"
                  rx="10"
                  fill="#12182f"
                  stroke={`url(#grad-${lessonNumber})`}
                  strokeWidth="2.4"
                />
                <rect
                  x="106"
                  y="54"
                  width="48"
                  height="42"
                  rx="5"
                  fill="#080b16"
                  stroke="#8b6cff"
                  strokeWidth="1.4"
                />
                <text x="130" y="79" textAnchor="middle" fill="#27d3f0" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  CORE
                </text>
              </g>
            )}

            {variant === 'network' && (
              <g>
                {/* Laptop -> Router -> Cloud Animated Link */}
                <line x1="62" y1="80" x2="130" y2="80" stroke="#8b6cff" strokeWidth="2.2" strokeDasharray="5 4" />
                <line x1="130" y1="80" x2="202" y2="80" stroke="#27d3f0" strokeWidth="2.2" strokeDasharray="5 4" />

                {/* Left Node: Laptop */}
                <rect x="24" y="58" width="44" height="36" rx="6" fill="#11172d" stroke="#8b6cff" strokeWidth="1.8" />
                <text x="46" y="80" textAnchor="middle" fill="#e9ebf7" fontSize="9" fontFamily="monospace">
                  PC
                </text>

                {/* Center Node: WiFi Router */}
                <rect x="106" y="60" width="48" height="34" rx="7" fill="#131c36" stroke="#27d3f0" strokeWidth="2" />
                <line x1="118" y1="60" x2="114" y2="40" stroke="#27d3f0" strokeWidth="2" />
                <line x1="142" y1="60" x2="146" y2="40" stroke="#8b6cff" strokeWidth="2" />
                <path d="M120 34 Q130 24 140 34" fill="none" stroke="#27d3f0" strokeWidth="1.6" />
                <text x="130" y="81" textAnchor="middle" fill="#27d3f0" fontSize="8" fontFamily="monospace">
                  ROUTER
                </text>

                {/* Right Node: Internet / DNS */}
                <circle cx="212" cy="77" r="22" fill="#11172d" stroke={`url(#grad-${lessonNumber})`} strokeWidth="2" />
                <text x="212" y="80" textAnchor="middle" fill="#e9ebf7" fontSize="9" fontFamily="monospace">
                  WAN
                </text>
              </g>
            )}

            {variant === 'enterprise' && (
              <g>
                {/* Shield + Cloud + Server Rack */}
                <rect x="34" y="38" width="52" height="74" rx="6" fill="#10162b" stroke="#8b6cff" strokeWidth="1.8" />
                <line x1="42" y1="54" x2="78" y2="54" stroke="#27d3f0" strokeWidth="2" />
                <line x1="42" y1="74" x2="78" y2="74" stroke="#8b6cff" strokeWidth="2" />
                <line x1="42" y1="94" x2="78" y2="94" stroke="#27d3f0" strokeWidth="2" />

                <line x1="86" y1="75" x2="164" y2="75" stroke={`url(#grad-${lessonNumber})`} strokeWidth="2.4" />

                <path
                  d="M196 34 L228 48 V78 C228 100 212 114 196 120 C180 114 164 100 164 78 V48 Z"
                  fill="#111a33"
                  stroke="#27d3f0"
                  strokeWidth="2"
                />
                <path
                  d="M186 76 L193 83 L208 67"
                  fill="none"
                  stroke="#27d3f0"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}
          </svg>
        </div>

        <div className="space-y-1.5 text-center sm:text-left">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#27d3f0]">
            Visual Concept Blueprint · {chapter}
          </span>
          <h3 className="font-['Sora',sans-serif] text-base sm:text-lg font-bold text-white">
            Picturing {title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Don’t memorize definitions—picture how signals enter, get processed or verified, and travel cleanly to the next component in the chain below.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Interactive Animated SVG Packet Flow Diagram for Visual IT Learning Lab
 */
export const AnimatedPacketPipeline: React.FC<{
  stages: LabStage[];
  activeIndex: number;
  isPlaying: boolean;
  simulateFault: boolean;
  onSelectStage: (idx: number) => void;
}> = ({ stages, activeIndex, isPlaying, simulateFault, onSelectStage }) => {
  const count = stages.length;
  const width = 900;
  const height = 148;
  const padX = 72;
  const usableWidth = width - padX * 2;
  const stepGap = count > 1 ? usableWidth / (count - 1) : 0;

  const activeX = padX + activeIndex * stepGap;

  return (
    <div className="mb-6 rounded-xl border border-[#1d2746] bg-[#070a14] p-3 sm:p-4 overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full min-w-[640px] h-auto block"
        role="img"
        aria-label="Interactive animated data packet pipeline"
      >
        <defs>
          <linearGradient id="labPipeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b6cff" />
            <stop offset="100%" stopColor="#27d3f0" />
          </linearGradient>
        </defs>

        {/* Base Wire */}
        <line
          x1={padX}
          y1={68}
          x2={width - padX}
          y2={68}
          stroke="#1b2440"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Active Illuminated Wire up to current hop */}
        <line
          x1={padX}
          y1={68}
          x2={activeX}
          y2={68}
          stroke={simulateFault ? '#f59e0b' : 'url(#labPipeGrad)'}
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Animated Moving Data Packet Orb along current segment */}
        {isPlaying && !simulateFault && count > 1 && (
          <circle r="7" cy={68} fill="#27d3f0">
            <animate
              attributeName="cx"
              from={Math.max(padX, activeX - stepGap)}
              to={activeX}
              dur="1.4s"
              repeatCount="indefinite"
            />
          </circle>
        )}

        {/* Stage Nodes */}
        {stages.map((st, idx) => {
          const cx = padX + idx * stepGap;
          const isCurrent = idx === activeIndex;
          const isPassed = idx < activeIndex;
          const stroke = isCurrent
            ? simulateFault
              ? '#f59e0b'
              : '#27d3f0'
            : isPassed
            ? '#8b6cff'
            : '#283458';

          return (
            <g
              key={st.stepNumber}
              onClick={() => onSelectStage(idx)}
              className="cursor-pointer"
            >
              {isCurrent && (
                <circle
                  cx={cx}
                  cy={68}
                  r="27"
                  fill={simulateFault ? '#f59e0b' : '#27d3f0'}
                  opacity="0.16"
                />
              )}
              <circle
                cx={cx}
                cy={68}
                r="20"
                fill={isCurrent ? '#121d38' : '#0c1020'}
                stroke={stroke}
                strokeWidth={isCurrent ? '2.8' : '2'}
              />
              <text
                x={cx}
                y={72}
                textAnchor="middle"
                fill={isCurrent ? '#ffffff' : '#cbd5e1'}
                fontSize="11"
                fontWeight="bold"
                fontFamily="monospace"
              >
                0{st.stepNumber}
              </text>

              {/* Node Title */}
              <text
                x={cx}
                y={112}
                textAnchor="middle"
                fill={isCurrent ? '#27d3f0' : '#e2e8f0'}
                fontSize="11"
                fontWeight={isCurrent ? '700' : '500'}
              >
                {st.nodeLabel.length > 16
                  ? `${st.nodeLabel.slice(0, 15)}…`
                  : st.nodeLabel}
              </text>

              {/* Packet Tag */}
              <text
                x={cx}
                y={30}
                textAnchor="middle"
                fill={isCurrent ? '#8b6cff' : '#64748b'}
                fontSize="10"
                fontFamily="monospace"
              >
                {st.packetBadge.length > 16
                  ? `${st.packetBadge.slice(0, 15)}…`
                  : st.packetBadge}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/**
 * Illustrated Overview Banner for all 325+ IT Troubleshooting Issues
 */
export const IssueCategorySchematic: React.FC<{
  category: string;
  difficulty: string;
  mode: 'beginner' | 'engineer';
}> = ({ category, difficulty, mode }) => {
  return (
    <div className="rounded-xl border border-[#222c4c] bg-gradient-to-r from-[#12172d] via-[#0d1222] to-[#090d19] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="space-y-1">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#27d3f0]">
          {mode === 'beginner'
            ? 'Beginner Visual Walkthrough · Plain English Mode'
            : 'Engineer Diagnostic Schematic · Technical Runbook Mode'}
        </span>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
          {mode === 'beginner'
            ? `We broke this ${category} issue into simple, safe steps anyone can follow. Tick off your symptoms and complete one step at a time!`
            : `Structured ${difficulty}-level isolation workflow for ${category}. Verify symptoms first, execute non-destructive read checks, then apply remediation.`}
        </p>
      </div>

      {/* Compact Diagnostic Signal SVG */}
      <svg
        viewBox="0 0 220 64"
        className="w-48 h-14 shrink-0"
        role="img"
        aria-label={`${category} diagnostic flow`}
      >
        <rect width="220" height="64" rx="10" fill="#080b15" stroke="#1f2947" />
        <circle cx="34" cy="32" r="12" fill="#151c36" stroke="#8b6cff" strokeWidth="2" />
        <text x="34" y="36" textAnchor="middle" fill="#e9ebf7" fontSize="9" fontFamily="monospace">
          SYM
        </text>
        <line x1="46" y1="32" x2="98" y2="32" stroke="#8b6cff" strokeWidth="2" strokeDasharray="4 3" />
        <circle cx="110" cy="32" r="12" fill="#151c36" stroke="#27d3f0" strokeWidth="2" />
        <text x="110" y="36" textAnchor="middle" fill="#27d3f0" fontSize="9" fontFamily="monospace">
          CLI
        </text>
        <line x1="122" y1="32" x2="174" y2="32" stroke="#27d3f0" strokeWidth="2" strokeDasharray="4 3" />
        <circle cx="186" cy="32" r="12" fill="#0f2924" stroke="#34d399" strokeWidth="2" />
        <text x="186" y="36" textAnchor="middle" fill="#34d399" fontSize="9" fontFamily="monospace">
          FIX
        </text>
      </svg>
    </div>
  );
};
