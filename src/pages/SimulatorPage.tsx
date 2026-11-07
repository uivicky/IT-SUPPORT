import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  Headphones,
  RotateCcw,
  Terminal,
  User,
  XCircle,
} from 'lucide-react';
import { SIMULATOR_SCENARIOS, SimulatorScenario } from '../data/simulatorData';
import { CopyButton } from '../components/CopyButton';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { usePageSEO } from '../utils/seo';

type DiffFilter = 'All' | 'Beginner' | 'Intermediate' | 'Advanced';

export const SimulatorPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { progress, solveScenario, badgeCatalog } = useLearningProgress();

  const initialTicket = searchParams.get('ticket') || SIMULATOR_SCENARIOS[0].id;
  const [difficultyFilter, setDifficultyFilter] = useState<DiffFilter>('All');
  const [selectedId, setSelectedId] = useState<string>(() =>
    SIMULATOR_SCENARIOS.some((s) => s.id === initialTicket)
      ? initialTicket
      : SIMULATOR_SCENARIOS[0].id
  );
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [triedOptionIds, setTriedOptionIds] = useState<string[]>([]);
  const [hadWrongAttempt, setHadWrongAttempt] = useState<boolean>(false);
  const [ticketSolvedBanner, setTicketSolvedBanner] = useState<{
    xpGained: number;
    newlyUnlockedBadges: string[];
  } | null>(null);

  const visibleScenarios = useMemo(() => {
    if (difficultyFilter === 'All') return SIMULATOR_SCENARIOS;
    return SIMULATOR_SCENARIOS.filter((s) => s.difficulty === difficultyFilter);
  }, [difficultyFilter]);

  const scenario: SimulatorScenario =
    SIMULATOR_SCENARIOS.find((s) => s.id === selectedId) || SIMULATOR_SCENARIOS[0];
  const currentStep = scenario.steps[stepIdx];

  usePageSEO({
    title: `${scenario.title} — Real-World IT Simulator | IT SUPPORT`,
    description:
      'Can you fix this IT problem? Step into an interactive IT Helpdesk & SysAdmin simulator across 10 real-world tickets with branching feedback.',
    canonicalPath: '/simulator',
  });

  const selectScenario = (id: string) => {
    setSelectedId(id);
    setSearchParams({ ticket: id }, { replace: true });
    setStepIdx(0);
    setTriedOptionIds([]);
    setHadWrongAttempt(false);
    setTicketSolvedBanner(null);
  };

  const handleChooseOption = (optionId: string, isCorrect: boolean) => {
    if (!triedOptionIds.includes(optionId)) {
      setTriedOptionIds((prev) => [...prev, optionId]);
    }
    if (!isCorrect) {
      setHadWrongAttempt(true);
    }
  };

  const correctOptionChosenOnCurrentStep = currentStep.options.some(
    (o) => o.isCorrect && triedOptionIds.includes(o.id)
  );

  const handleAdvanceStep = () => {
    if (stepIdx + 1 < scenario.steps.length) {
      setStepIdx(stepIdx + 1);
      setTriedOptionIds([]);
    } else {
      const res = solveScenario(scenario.id, !hadWrongAttempt);
      setTicketSolvedBanner({
        xpGained: res.xpGained,
        newlyUnlockedBadges: res.newlyUnlockedBadges,
      });
    }
  };

  const resetCurrentTicket = () => {
    setStepIdx(0);
    setTriedOptionIds([]);
    setHadWrongAttempt(false);
    setTicketSolvedBanner(null);
  };

  const nextUnsolvedScenario = SIMULATOR_SCENARIOS.find(
    (s) => s.id !== scenario.id && !progress.solvedScenarioIds.includes(s.id)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#181e31] pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
            CAN YOU FIX THIS IT PROBLEM? · REAL-WORLD HELPDESK &amp; SYSADMIN SIMULATOR
          </p>
          <h1 className="mt-2 font-['Sora',sans-serif] text-2xl sm:text-4xl font-bold text-white">
            Real-World IT Troubleshooting Simulator
          </h1>
          <p className="mt-2 max-w-3xl text-sm sm:text-base text-slate-400">
            Practice real decision-making across 10 live support tickets. Every option explains why an engineering action works—or why a risky shortcut makes things worse.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <span className="font-mono font-semibold text-emerald-400 tabular-nums">
            {progress.solvedScenarioIds.length} / {SIMULATOR_SCENARIOS.length} Tickets Resolved
          </span>
        </div>
      </header>

      {/* Difficulty Filter */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(['All', 'Beginner', 'Intermediate', 'Advanced'] as DiffFilter[]).map((diff) => (
          <button
            key={diff}
            type="button"
            onClick={() => setDifficultyFilter(diff)}
            className={`rounded-lg border px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              difficultyFilter === diff
                ? 'border-[#8b6cff] bg-[#8b6cff]/20 text-white'
                : 'border-[#1d2338] bg-[#0d101b] text-slate-400 hover:text-white'
            }`}
          >
            {diff}
          </button>
        ))}
      </div>

      {/* Main Split Workspace */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Ticket Queue Sidebar */}
        <aside className="lg:col-span-4 space-y-2.5">
          {visibleScenarios.map((item) => {
            const active = item.id === scenario.id;
            const solved = progress.solvedScenarioIds.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectScenario(item.id)}
                className={`w-full rounded-xl border p-4 text-left transition-all cursor-pointer ${
                  active
                    ? 'border-[#27d3f0] bg-[#11192e] shadow-[0_0_24px_rgba(39,211,240,0.12)]'
                    : 'border-[#1d2338] bg-[#0d101b] hover:border-[#8b6cff]/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                  <span>
                    <strong className="font-mono text-[#27d3f0]">{item.ticketNumber}</strong> ·{' '}
                    {item.difficulty}
                  </span>
                  {solved && (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Solved
                    </span>
                  )}
                </div>
                <p className="mt-1.5 font-['Sora',sans-serif] text-sm font-bold text-white">
                  {item.title}
                </p>
                <p className="mt-1 text-xs text-slate-400 truncate">
                  Caller: {item.callerName} ({item.callerRole})
                </p>
              </button>
            );
          })}
        </aside>

        {/* Active Ticket Console */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-[#222b49] bg-[#0d101b] overflow-hidden">
            {/* Ticket Header */}
            <div className="border-b border-[#19213a] bg-[#101528] p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1.5 font-mono text-[#27d3f0] font-semibold">
                  <Headphones className="h-3.5 w-3.5" />
                  TICKET {scenario.ticketNumber} · {scenario.difficulty.toUpperCase()}
                </span>
                <span>Category: {scenario.relatedCategory}</span>
              </div>

              <h2 className="mt-2 font-['Sora',sans-serif] text-xl sm:text-2xl font-bold text-white">
                {scenario.title}
              </h2>

              {/* Caller Quote Box */}
              <div className="mt-4 rounded-xl border border-[#232d4d] bg-[#080a12] p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <User className="h-3.5 w-3.5 text-[#8b6cff]" />
                  <span>
                    <strong className="text-slate-200">{scenario.callerName}</strong> ·{' '}
                    {scenario.callerRole}
                  </span>
                </div>
                <p className="mt-2 text-sm sm:text-base text-slate-100 leading-relaxed">
                  “{scenario.problemReport}”
                </p>
                <p className="mt-2.5 text-xs font-mono text-[#27d3f0]">
                  Environment Clue: {scenario.environmentClue}
                </p>
              </div>
            </div>

            {/* Ticket Body: Resolution Summary OR Step Decision */}
            <div className="p-5 sm:p-6 space-y-6">
              {ticketSolvedBanner ? (
                <div className="space-y-6 py-2">
                  <div className="rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-5 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-300 font-['Sora',sans-serif] text-lg font-bold">
                      <Award className="h-5 w-5" />
                      <span>
                        Ticket {scenario.ticketNumber} Resolved! (+{ticketSolvedBanner.xpGained} XP)
                      </span>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {scenario.resolutionSummary}
                    </p>
                    {ticketSolvedBanner.newlyUnlockedBadges.length > 0 && (
                      <p className="pt-1 text-xs font-semibold text-[#27d3f0]">
                        Badge Unlocked:{' '}
                        {ticketSolvedBanner.newlyUnlockedBadges
                          .map((id) => badgeCatalog.find((b) => b.id === id)?.title || id)
                          .join(', ')}
                        !
                      </p>
                    )}
                  </div>

                  {/* Verification CLI */}
                  <div className="rounded-xl border border-[#1d2642] bg-[#070911] p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Terminal className="h-3.5 w-3.5 text-[#8b6cff]" />
                        Engineer Verification Command
                      </span>
                      <CopyButton text={scenario.verificationCommand} />
                    </div>
                    <code className="font-mono text-xs sm:text-sm text-[#27d3f0]">
                      {scenario.verificationCommand}
                    </code>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetCurrentTicket}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#252f50] bg-[#090c16] px-4 py-2 text-xs sm:text-sm font-medium text-slate-200 hover:border-[#8b6cff] cursor-pointer"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Replay Ticket</span>
                    </button>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <Link
                        to={`/issues?category=${encodeURIComponent(scenario.relatedCategory)}`}
                        className="rounded-lg border border-[#252f50] bg-[#111629] px-4 py-2 text-xs sm:text-sm font-medium text-slate-200 hover:border-[#27d3f0]"
                      >
                        Browse {scenario.relatedCategory} Runbooks
                      </Link>
                      {nextUnsolvedScenario && (
                        <button
                          type="button"
                          onClick={() => selectScenario(nextUnsolvedScenario.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-5 py-2 text-xs sm:text-sm font-semibold text-[#06070d] hover:opacity-95 cursor-pointer"
                        >
                          <span>Next Ticket ({nextUnsolvedScenario.ticketNumber})</span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold uppercase tracking-wider text-[#8b6cff]">
                      Diagnostic Step {currentStep.stepNumber} of {scenario.steps.length}
                    </span>
                    <span>Click an action to test your engineering instinct</span>
                  </div>

                  {currentStep.diagnosticOutput && (
                    <div className="rounded-xl border border-[#1d2540] bg-[#060810] p-4">
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Live Terminal / System Output
                      </span>
                      <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs sm:text-sm text-[#27d3f0] leading-relaxed">
                        <code>{currentStep.diagnosticOutput}</code>
                      </pre>
                    </div>
                  )}

                  <h3 className="font-['Sora',sans-serif] text-base sm:text-lg font-bold text-white leading-snug">
                    {currentStep.prompt}
                  </h3>

                  <div className="space-y-3">
                    {currentStep.options.map((opt) => {
                      const tried = triedOptionIds.includes(opt.id);
                      let cardStyle =
                        'border-[#222b48] bg-[#090c16] hover:border-[#8b6cff] text-slate-200';
                      if (tried) {
                        cardStyle = opt.isCorrect
                          ? 'border-emerald-500/70 bg-emerald-500/12 text-white'
                          : 'border-amber-500/60 bg-amber-500/10 text-amber-100';
                      }

                      return (
                        <div key={opt.id} className={`rounded-xl border transition-all ${cardStyle}`}>
                          <button
                            type="button"
                            onClick={() => handleChooseOption(opt.id, opt.isCorrect)}
                            className="w-full p-4 text-left flex items-start justify-between gap-3 cursor-pointer"
                          >
                            <span className="text-sm font-medium leading-relaxed">
                              {opt.label}
                            </span>
                            {tried &&
                              (opt.isCorrect ? (
                                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
                              ) : (
                                <XCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
                              ))}
                          </button>

                          {tried && (
                            <div className="border-t border-white/10 px-4 py-3 text-xs sm:text-sm leading-relaxed">
                              <strong
                                className={
                                  opt.isCorrect ? 'text-emerald-300' : 'text-amber-300'
                                }
                              >
                                {opt.isCorrect
                                  ? 'Why this is the right move: '
                                  : 'Why engineers avoid this choice: '}
                              </strong>
                              <span className="text-slate-200">{opt.feedback}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {correctOptionChosenOnCurrentStep && (
                    <div className="space-y-4 pt-3 border-t border-[#182038]">
                      {/* Automatic breakdown of why other options were incorrect */}
                      <div className="rounded-xl border border-[#222c4a] bg-[#080a12] p-4 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0] flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>Why the Other Options Were Incorrect / Risky</span>
                        </p>
                        <ul className="space-y-1.5 text-xs text-slate-300">
                          {currentStep.options
                            .filter((o) => !o.isCorrect)
                            .map((wrongOpt) => (
                              <li key={wrongOpt.id} className="leading-relaxed">
                                <strong className="text-slate-100">• {wrongOpt.label}:</strong>{' '}
                                <span className="text-slate-400">{wrongOpt.feedback}</span>
                              </li>
                            ))}
                        </ul>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleAdvanceStep}
                          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-5 py-2.5 text-sm font-semibold text-[#06070d] hover:opacity-95 cursor-pointer"
                        >
                          <span>
                            {stepIdx + 1 < scenario.steps.length
                              ? 'Proceed to Step 2'
                              : 'Complete & Close Ticket'}
                          </span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
