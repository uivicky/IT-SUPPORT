import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Languages,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Terminal,
  Zap,
} from 'lucide-react';
import { VISUAL_LEARNING_LABS, VisualLabSimulation } from '../data/learningLabData';
import { CopyButton } from '../components/CopyButton';
import { AnimatedPacketPipeline } from '../components/TechVisuals';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { usePageSEO } from '../utils/seo';

export const LearningLabPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { progress, exploreLab, recentReward, clearReward } = useLearningProgress();

  const initialLabId = searchParams.get('lab') || VISUAL_LEARNING_LABS[0].id;
  const [selectedLabId, setSelectedLabId] = useState<string>(() =>
    VISUAL_LEARNING_LABS.some((l) => l.id === initialLabId)
      ? initialLabId
      : VISUAL_LEARNING_LABS[0].id
  );
  const [stageIdx, setStageIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [showHinglish, setShowHinglish] = useState<boolean>(false);
  const [simulateFault, setSimulateFault] = useState<boolean>(false);

  const lab: VisualLabSimulation =
    VISUAL_LEARNING_LABS.find((l) => l.id === selectedLabId) || VISUAL_LEARNING_LABS[0];
  const currentStage = lab.stages[stageIdx] || lab.stages[0];

  usePageSEO({
    title: `${lab.title} — Visual IT Learning Lab | IT SUPPORT`,
    description: `${lab.subtitle} Play, pause, step forward, and simulate real network & system failures visually.`,
    canonicalPath: '/learning-lab',
  });

  useEffect(() => {
    setStageIdx(0);
    setSimulateFault(false);
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsPlaying(!reduced);
  }, [lab.id]);

  useEffect(() => {
    if (!isPlaying || simulateFault) return;
    const timer = window.setInterval(() => {
      setStageIdx((prev) => {
        const next = prev + 1;
        if (next >= lab.stages.length) {
          setIsPlaying(false);
          exploreLab(lab.id);
          return lab.stages.length - 1;
        }
        return next;
      });
    }, 2400);
    return () => window.clearInterval(timer);
  }, [isPlaying, simulateFault, lab.id, lab.stages.length, exploreLab]);

  const handleSelectLab = (id: string) => {
    clearReward();
    setSelectedLabId(id);
    setSearchParams({ lab: id }, { replace: true });
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setStageIdx((prev) => {
      const next = (prev + 1) % lab.stages.length;
      if (next === lab.stages.length - 1) {
        exploreLab(lab.id);
      }
      return next;
    });
  };

  const handleRestart = () => {
    setSimulateFault(false);
    setStageIdx(0);
    setIsPlaying(true);
  };

  const progressRatio = ((stageIdx + 1) / lab.stages.length) * 100;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#181e31] pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
            EXPLORE HOW TECHNOLOGY WORKS · 8 INTERACTIVE PACKET &amp; SYSTEM SIMULATIONS
          </p>
          <h1 className="mt-2 font-['Sora',sans-serif] text-2xl sm:text-4xl font-bold text-white">
            Visual IT Learning Lab
          </h1>
          <p className="mt-2 max-w-3xl text-sm sm:text-base text-slate-400">
            Watch live data packets travel step-by-step across routers, DNS, DHCP, UEFI bootloaders, Active Directory, VPN tunnels, and mail servers—and inject faults to see how engineers diagnose breaks.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-300">
          <span className="font-mono text-[#27d3f0] font-semibold tabular-nums">
            {progress.exploredLabIds.length} / {VISUAL_LEARNING_LABS.length} Labs Explored
          </span>
          <span>·</span>
          <button
            type="button"
            onClick={() => setShowHinglish((p) => !p)}
            aria-pressed={showHinglish}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              showHinglish
                ? 'border-[#27d3f0] bg-[#27d3f0]/15 text-[#27d3f0]'
                : 'border-[#242d4c] bg-[#0d101b] text-slate-300 hover:border-[#8b6cff]'
            }`}
          >
            <Languages className="h-3.5 w-3.5" />
            <span>{showHinglish ? 'Hinglish ON' : 'Hinglish'}</span>
          </button>
        </div>
      </header>

      {/* Lab Selector Tabs */}
      <div
        role="tablist"
        aria-label="Choose visual technology simulation"
        className="mt-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2"
      >
        {VISUAL_LEARNING_LABS.map((item) => {
          const active = item.id === lab.id;
          const explored = progress.exploredLabIds.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleSelectLab(item.id)}
              className={`rounded-xl border px-3 py-2.5 text-left transition-all cursor-pointer flex flex-col justify-between ${
                active
                  ? 'border-[#8b6cff] bg-[#8b6cff]/20 text-white shadow-[0_0_20px_rgba(139,108,255,0.18)]'
                  : 'border-[#1d2338] bg-[#0d101b] text-slate-300 hover:border-[#27d3f0]/50 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between gap-1 text-[10px] text-slate-400">
                <span className="truncate">{item.category}</span>
                {explored && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />}
              </div>
              <span className="mt-1 font-['Sora',sans-serif] text-xs font-semibold leading-snug">
                {item.shortTitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Two-Zone Simulation Stage */}
      <div className="mt-7 rounded-2xl border border-[#222b49] bg-[#0a0d18] overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#19213a] bg-[#0f1324] px-5 py-4">
          <div>
            <h2 className="font-['Sora',sans-serif] text-lg sm:text-xl font-bold text-white">
              {lab.title}
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-400">{lab.subtitle}</p>
          </div>

          {/* Playback Controls: Play / Pause / Step Forward / Restart */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSimulateFault(false);
                if (stageIdx === lab.stages.length - 1 && !isPlaying) {
                  setStageIdx(0);
                  setIsPlaying(true);
                } else {
                  setIsPlaying((p) => !p);
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-3.5 py-2 text-xs font-semibold text-[#06070d] hover:opacity-95 cursor-pointer"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>Play</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleStepForward}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#283356] bg-[#13192e] px-3 py-2 text-xs font-medium text-white hover:border-[#27d3f0] cursor-pointer"
            >
              <SkipForward className="h-3.5 w-3.5 text-[#27d3f0]" />
              <span>Step Forward</span>
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#283356] bg-[#13192e] px-3 py-2 text-xs font-medium text-slate-200 hover:border-[#8b6cff] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restart</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsPlaying(false);
                setSimulateFault((p) => !p);
              }}
              aria-pressed={simulateFault}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                simulateFault
                  ? 'border-amber-400 bg-amber-500/20 text-amber-200'
                  : 'border-[#283356] bg-[#13192e] text-amber-300 hover:border-amber-400/60'
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{simulateFault ? 'Clear Fault' : 'What If It Breaks?'}</span>
            </button>
          </div>
        </div>

        {/* Visual Animated Packet Pipeline */}
        <div className="p-5 sm:p-8 bg-[radial-gradient(ellipse_at_top,#171c36_0%,#080a12_70%)]">
          {/* Progress Track */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-[#27d3f0]">
                ACTIVE PACKET: [{currentStage.packetBadge}]
              </span>
              <span className="tabular-nums">
                Stage {stageIdx + 1} of {lab.stages.length}
              </span>
            </div>
            <div className="relative h-2.5 w-full rounded-full bg-[#151c33] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  simulateFault
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                    : 'bg-gradient-to-r from-[#8b6cff] via-[#5c9ff8] to-[#27d3f0]'
                }`}
                style={{ width: `${progressRatio}%` }}
              />
            </div>
          </div>

          {/* Animated SVG Packet Flow Diagram */}
          <AnimatedPacketPipeline
            stages={lab.stages}
            activeIndex={stageIdx}
            isPlaying={isPlaying}
            simulateFault={simulateFault}
            onSelectStage={(idx) => {
              setIsPlaying(false);
              setStageIdx(idx);
              if (idx === lab.stages.length - 1) {
                exploreLab(lab.id);
              }
            }}
          />

          {/* Interactive Node Topology Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lab.stages.map((st, idx) => {
              const isCurrent = idx === stageIdx;
              const isPassed = idx < stageIdx;

              return (
                <button
                  key={st.stepNumber}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStageIdx(idx);
                    if (idx === lab.stages.length - 1) {
                      exploreLab(lab.id);
                    }
                  }}
                  className={`group relative rounded-xl border p-4 text-left transition-all cursor-pointer ${
                    isCurrent
                      ? simulateFault
                        ? 'border-amber-400 bg-amber-500/10 shadow-[0_0_25px_rgba(245,158,11,0.18)]'
                        : 'border-[#27d3f0] bg-[#111c33] shadow-[0_0_28px_rgba(39,211,240,0.16)]'
                      : isPassed
                      ? 'border-[#8b6cff]/45 bg-[#0f1324]'
                      : 'border-[#1b223a] bg-[#0b0e19] hover:border-[#8b6cff]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span
                      className={`font-mono font-bold ${
                        isCurrent
                          ? simulateFault
                            ? 'text-amber-300'
                            : 'text-[#27d3f0]'
                          : isPassed
                          ? 'text-[#8b6cff]'
                          : 'text-slate-500'
                      }`}
                    >
                      HOP 0{st.stepNumber}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {st.packetBadge}
                    </span>
                  </div>

                  <p className="mt-2 font-['Sora',sans-serif] text-base font-bold text-white flex items-center justify-between gap-2">
                    <span>{st.nodeLabel}</span>
                    {isPassed && !isCurrent && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    )}
                    {isCurrent && (
                      <ArrowRight
                        className={`h-4 w-4 shrink-0 ${
                          simulateFault ? 'text-amber-400' : 'text-[#27d3f0]'
                        }`}
                      />
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{st.nodeRole}</p>
                </button>
              );
            })}
          </div>

          {/* Live Stage Telemetry & Fault Inspector */}
          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-12">
            <div className="lg:col-span-7 rounded-xl border border-[#222c4c] bg-[#0c1020] p-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold uppercase tracking-wider text-[#27d3f0]">
                  Stage {currentStage.stepNumber}: {currentStage.nodeLabel}
                </span>
                <span className="font-mono text-slate-300">{currentStage.nodeRole}</span>
              </div>

              <p className="text-sm sm:text-base leading-relaxed text-white">
                {currentStage.whatHappens}
              </p>

              {showHinglish && (
                <div className="rounded-lg border border-[#27d3f0]/30 bg-[#081320] p-3 text-xs sm:text-sm text-slate-200">
                  <strong className="text-[#27d3f0]">Hinglish: </strong>
                  {currentStage.hinglishTip}
                </div>
              )}

              {recentReward && (
                <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 pt-1">
                  <Zap className="h-3.5 w-3.5" />
                  <span>{recentReward.message}</span>
                </p>
              )}
            </div>

            <div className="lg:col-span-5 rounded-xl border border-[#222c4c] bg-[#0c1020] p-5 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  <span>If Failure Happens At This Hop</span>
                </h3>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-200">
                  {currentStage.ifThisBreaks}
                </p>
              </div>

              <div className="rounded-lg border border-[#1a223b] bg-[#070911] p-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Terminal className="h-3.5 w-3.5 text-[#8b6cff]" />
                    Engineer Verification Check
                  </span>
                  <CopyButton text={currentStage.checkCommand} />
                </div>
                <code className="font-mono text-xs sm:text-sm text-[#27d3f0]">
                  {currentStage.checkCommand}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Strip */}
        <div className="border-t border-[#182038] bg-[#0b0e1a] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
          <span className="text-slate-400">
            Ready to test what you observed in a real broken helpdesk ticket?
          </span>
          <div className="flex items-center gap-3">
            <Link
              to="/simulator"
              className="font-semibold text-[#27d3f0] hover:underline inline-flex items-center gap-1"
            >
              <span>Launch Real-World IT Simulator</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <span className="text-slate-600">·</span>
            <Link to="/challenges" className="font-semibold text-[#8b6cff] hover:underline">
              Take Networking &amp; IT Quizzes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
