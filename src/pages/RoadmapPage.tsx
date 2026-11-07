import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  CheckSquare,
  Clock,
  FlaskConical,
  Layers,
  Map,
  Square,
  Terminal,
  Trophy,
  Wrench,
} from 'lucide-react';
import { LEARNING_ROADMAP } from '../data/interviewAndRoadmapData';
import { ROADMAP_13_STAGES } from '../data/networkingLessonsAndRoadmap13';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { usePageSEO } from '../utils/seo';

const STORAGE_KEY = 'itsupport_roadmap_completed_v1';

export const RoadmapPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'journey-13' | 'career-modules'>('journey-13');
  const { progress, toggleRoadmapStage } = useLearningProgress();

  const [completedModuleIds, setCompletedModuleIds] = useState<string[]>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completedModuleIds));
    } catch {
      // Ignore storage quota errors in restricted frames
    }
  }, [completedModuleIds]);

  usePageSEO({
    title: '13-Stage IT Learning Roadmap — Computer Basics to Cloud & Cybersecurity',
    description:
      'Interactive 13-stage visual IT learning journey from Stage 1 Computer Basics through Windows, Networking, Active Directory, DNS/DHCP, M365, Linux, Azure, Cybersecurity, and Real-World Scenarios.',
    canonicalPath: '/roadmap',
  });

  const completedStages = progress.completedRoadmapStageIds || [];
  const stagePct = Math.round((completedStages.length / ROADMAP_13_STAGES.length) * 100);

  const totalTopics = LEARNING_ROADMAP.reduce(
    (acc, phase) => acc + phase.topics.length,
    0
  );
  const completedModuleCount = completedModuleIds.length;
  const modulePct =
    totalTopics > 0 ? Math.round((completedModuleCount / totalTopics) * 100) : 0;

  const toggleModuleTopic = (id: string) => {
    setCompletedModuleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-b border-[#181e31] pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold tracking-wide text-[#27d3f0]">
            Connected Career Journey · Saved Automatically in Browser (+20 XP per Stage)
          </p>
          <h1 className="mt-2 font-['Sora',sans-serif] text-2xl sm:text-4xl font-bold text-white">
            13-Stage Interactive IT Learning Roadmap
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400">
            Follow the connected step-by-step path from Computer Basics to Cloud, Cybersecurity, and Real-World IT Support Scenarios—each stage pairs visual lessons, quizzes, hands-on practice, and runbooks.
          </p>
        </div>

        {/* Local Progress Summary */}
        <div className="w-full lg:w-80 rounded-xl border border-[#1d2338] bg-[#0d101b] p-4">
          {viewMode === 'journey-13' ? (
            <>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">13-Stage Journey Progress</span>
                <span className="font-mono font-semibold text-[#27d3f0] tabular-nums">
                  {completedStages.length}/{ROADMAP_13_STAGES.length} ({stagePct}%)
                </span>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#171d30]">
                <div
                  className="h-full bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] transition-all duration-300"
                  style={{ width: `${stagePct}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300">Deep-Dive Modules Done</span>
                <span className="font-mono font-semibold text-[#27d3f0] tabular-nums">
                  {completedModuleCount}/{totalTopics} ({modulePct}%)
                </span>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#171d30]">
                <div
                  className="h-full bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] transition-all duration-300"
                  style={{ width: `${modulePct}%` }}
                />
              </div>
            </>
          )}
        </div>
      </header>

      {/* View Mode Switcher */}
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <div
          role="tablist"
          aria-label="Roadmap view mode"
          className="inline-flex rounded-xl border border-[#222b49] bg-[#0b0e1a] p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'journey-13'}
            onClick={() => setViewMode('journey-13')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              viewMode === 'journey-13'
                ? 'bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] text-[#06070d]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Map className="h-4 w-4 shrink-0" />
            <span>13-Stage Visual Journey</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={viewMode === 'career-modules'}
            onClick={() => setViewMode('career-modules')}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              viewMode === 'career-modules'
                ? 'bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] text-[#06070d]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="h-4 w-4 shrink-0" />
            <span>3-Tier Home Lab Modules ({totalTopics})</span>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Zero login required · Mark any stage complete to earn +20 XP
        </p>
      </div>

      {/* VIEW 1: 13-STAGE CONNECTED VISUAL LEARNING JOURNEY */}
      {viewMode === 'journey-13' && (
        <div className="mt-8 relative">
          {/* Vertical Connecting Path Spine on Desktop */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute left-7 top-6 bottom-6 w-0.5 bg-gradient-to-b from-[#27d3f0] via-[#8b6cff] to-[#1e2746]"
          />

          <div className="space-y-5">
            {ROADMAP_13_STAGES.map((stage) => {
              const isDone = completedStages.includes(stage.id);
              const tierAccent =
                stage.tier === 'Foundation'
                  ? 'text-emerald-400'
                  : stage.tier === 'Core IT Support'
                  ? 'text-[#27d3f0]'
                  : 'text-[#8b6cff]';

              return (
                <article
                  key={stage.id}
                  className="relative md:pl-20"
                >
                  {/* Connected Node Marker */}
                  <div
                    className={`hidden md:flex absolute left-2 top-6 h-10 w-10 items-center justify-center rounded-xl border font-mono text-xs font-bold tabular-nums transition-colors ${
                      isDone
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                        : 'border-[#2c375c] bg-[#101528] text-[#27d3f0]'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      String(stage.stageNumber).padStart(2, '0')
                    )}
                  </div>

                  <div
                    className={`rounded-2xl border p-5 sm:p-6 transition-colors ${
                      isDone
                        ? 'border-emerald-500/40 bg-[#0c141d]'
                        : 'border-[#1e2642] bg-[#0d101b] hover:border-[#8b6cff]/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                          <span className="font-mono font-bold text-white tabular-nums">
                            Stage {stage.stageNumber} of 13
                          </span>
                          <span>·</span>
                          <span className={`font-semibold ${tierAccent}`}>
                            {stage.tier}
                          </span>
                        </div>
                        <h2 className="mt-1.5 font-['Sora',sans-serif] text-lg sm:text-xl font-bold text-white">
                          Stage {stage.stageNumber}: {stage.title}
                        </h2>
                        <p className="mt-1.5 text-sm text-slate-300 leading-relaxed max-w-3xl">
                          {stage.summary}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleRoadmapStage(stage.id)}
                        aria-pressed={isDone}
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          isDone
                            ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                            : 'border-[#283356] bg-[#14192d] text-slate-200 hover:border-[#27d3f0]'
                        }`}
                      >
                        {isDone ? (
                          <CheckSquare className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Square className="h-4 w-4 text-[#27d3f0]" />
                        )}
                        <span>{isDone ? 'Stage Completed' : 'Mark Stage Done (+20 XP)'}</span>
                      </button>
                    </div>

                    {/* 4 Interactive Action Links: Lesson, Quiz, Practical Exercise, Real Runbooks */}
                    <div className="mt-5 pt-4 border-t border-[#181f36] grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                      <Link
                        to={stage.lessonLink.to}
                        className="group rounded-xl border border-[#212a46] bg-[#080b14] p-3 hover:border-[#27d3f0] transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#27d3f0]">
                            <BookOpen className="h-3.5 w-3.5 shrink-0" />
                            <span>1. Visual Lesson</span>
                          </span>
                          <p className="mt-1 truncate text-xs font-medium text-white">
                            {stage.lessonLink.label}
                          </p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-[#27d3f0]" />
                      </Link>

                      <Link
                        to={stage.quizLink.to}
                        className="group rounded-xl border border-[#212a46] bg-[#080b14] p-3 hover:border-[#8b6cff] transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8b6cff]">
                            <Trophy className="h-3.5 w-3.5 shrink-0" />
                            <span>2. Skill Quiz</span>
                          </span>
                          <p className="mt-1 truncate text-xs font-medium text-white">
                            {stage.quizLink.label}
                          </p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-[#8b6cff]" />
                      </Link>

                      <Link
                        to={stage.practiceLink.to}
                        className="group rounded-xl border border-[#212a46] bg-[#080b14] p-3 hover:border-emerald-400/70 transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                            <Wrench className="h-3.5 w-3.5 shrink-0" />
                            <span>3. Practical Exercise</span>
                          </span>
                          <p className="mt-1 truncate text-xs font-medium text-white">
                            {stage.practiceLink.label}
                          </p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-emerald-400" />
                      </Link>

                      <Link
                        to={`/issues?category=${encodeURIComponent(stage.issuesCategory)}`}
                        className="group rounded-xl border border-[#212a46] bg-[#080b14] p-3 hover:border-[#27d3f0] transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                            <Terminal className="h-3.5 w-3.5 shrink-0 text-[#27d3f0]" />
                            <span>4. Real IT Runbooks</span>
                          </span>
                          <p className="mt-1 truncate text-xs font-medium text-white">
                            {stage.issuesCategory}
                          </p>
                        </div>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-[#27d3f0]" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: ORIGINAL 3-TIER HOME LAB COMPETENCY MODULES */}
      {viewMode === 'career-modules' && (
        <div className="mt-8 space-y-12">
          {LEARNING_ROADMAP.map((phase, phaseIndex) => {
            const accent =
              phase.level === 'Beginner'
                ? 'text-emerald-400'
                : phase.level === 'Intermediate'
                ? 'text-[#27d3f0]'
                : 'text-[#8b6cff]';

            return (
              <section
                key={phase.level}
                className="rounded-2xl border border-[#1d2338] bg-[#0a0d17] p-6 sm:p-8"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#181e31] pb-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className={`font-semibold ${accent}`}>
                        Tier {phaseIndex + 1} · {phase.level}
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 text-slate-300">
                        <Clock className="h-3.5 w-3.5 text-[#27d3f0]" />
                        {phase.estimatedDuration}
                      </span>
                    </div>
                    <h2 className="mt-2 font-['Sora',sans-serif] text-xl sm:text-2xl font-bold text-white">
                      {phase.title}
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-400">{phase.subtitle}</p>
                  </div>

                  <div className="text-xs text-slate-400 md:text-right">
                    <span className="block font-semibold text-slate-200">Target Roles:</span>
                    <span className="mt-1 block">{phase.targetRoles.join(' · ')}</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {phase.topics.map((topic) => {
                    const done = completedModuleIds.includes(topic.id);
                    return (
                      <article
                        key={topic.id}
                        className={`rounded-xl border p-5 transition-colors flex flex-col justify-between ${
                          done
                            ? 'border-emerald-500/40 bg-[#0d141b]'
                            : 'border-[#1d2338] bg-[#0d101b]'
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-['Sora',sans-serif] text-base font-bold text-white">
                              {topic.title}
                            </h3>
                            <button
                              type="button"
                              onClick={() => toggleModuleTopic(topic.id)}
                              aria-pressed={done}
                              className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium cursor-pointer whitespace-nowrap ${
                                done
                                  ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                                  : 'border-[#252e4a] bg-[#14192b] text-slate-300 hover:border-[#27d3f0]'
                              }`}
                            >
                              {done ? (
                                <CheckSquare className="h-3.5 w-3.5" />
                              ) : (
                                <Square className="h-3.5 w-3.5" />
                              )}
                              <span>{done ? 'Completed' : 'Mark Done'}</span>
                            </button>
                          </div>

                          <p className="text-sm text-slate-300 leading-relaxed">
                            {topic.summary}
                          </p>

                          <div>
                            <span className="text-xs font-semibold text-slate-400">
                              Core Competencies:
                            </span>
                            <p className="mt-1 text-xs text-slate-300">
                              {topic.skills.join(' · ')}
                            </p>
                          </div>

                          <div className="rounded-lg border border-[#1a2238] bg-[#080a12] p-3.5 text-xs">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-[#27d3f0]">
                              <FlaskConical className="h-3.5 w-3.5" />
                              Hands-On Home Lab
                            </span>
                            <p className="mt-1.5 text-slate-300 leading-relaxed">
                              {topic.handsOnLab}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono">
                            <Terminal className="h-3.5 w-3.5 text-[#8b6cff] shrink-0" />
                            <span>{topic.keyCommands.join(' · ')}</span>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-[#181e31] flex items-center justify-between text-xs">
                          <span className="text-slate-400">Practice Real Tickets:</span>
                          <Link
                            to={`/issues?category=${encodeURIComponent(topic.relatedCategory)}`}
                            className="inline-flex items-center gap-1 font-medium text-[#27d3f0] hover:underline"
                          >
                            <span>{topic.relatedCategory} Runbooks</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
