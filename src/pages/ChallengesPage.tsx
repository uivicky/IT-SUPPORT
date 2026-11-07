import React, { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Flame,
  Lock,
  RotateCcw,
  Trophy,
  Zap,
} from 'lucide-react';
import {
  getQuestionsForMode,
  QUIZ_MODES,
  QuizItem,
  QuizModeConfig,
} from '../data/quizzesData';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { usePageSEO } from '../utils/seo';

export const ChallengesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    progress,
    levelInfo,
    badgeCatalog,
    completeQuiz,
  } = useLearningProgress();

  const initialMode = searchParams.get('mode') || '';
  const [activeModeId, setActiveModeId] = useState<string>(() =>
    QUIZ_MODES.some((m) => m.id === initialMode) ? initialMode : ''
  );
  const [questionIndex, setQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [finishedResult, setFinishedResult] = useState<{
    score: number;
    total: number;
    xpGained: number;
    newlyUnlockedBadges: string[];
  } | null>(null);

  usePageSEO({
    title: 'IT Quizzes, Daily Challenge & Skill Badges — IT SUPPORT',
    description:
      'Test your IT Support knowledge with Daily IT Challenges, Networking, Windows, Hardware, Active Directory, Scenario, and Interview quizzes. Earn XP, streaks, and badges with zero login.',
    canonicalPath: '/challenges',
  });

  const activeMode: QuizModeConfig | null = useMemo(
    () => QUIZ_MODES.find((m) => m.id === activeModeId) || null,
    [activeModeId]
  );

  const questions: QuizItem[] = useMemo(
    () => (activeMode ? getQuestionsForMode(activeMode.id) : []),
    [activeMode]
  );

  const startMode = (modeId: string) => {
    setActiveModeId(modeId);
    setSearchParams({ mode: modeId }, { replace: true });
    setQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setFinishedResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exitMode = () => {
    setActiveModeId('');
    setSearchParams({}, { replace: true });
    setFinishedResult(null);
  };

  const currentQuestion = questions[questionIndex];

  const handleSelectAnswer = (idx: number) => {
    if (selectedOption !== null || !currentQuestion) return;
    setSelectedOption(idx);
    if (idx === currentQuestion.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!activeMode) return;
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((q) => q + 1);
      setSelectedOption(null);
    } else {
      const res = completeQuiz(activeMode.id, score, questions.length);
      setFinishedResult({
        score,
        total: questions.length,
        xpGained: res.xpGained,
        newlyUnlockedBadges: res.newlyUnlockedBadges,
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {/* Gamification Scoreboard Banner */}
      <section className="rounded-2xl border border-[#222b49] bg-gradient-to-br from-[#14182d] via-[#0d101b] to-[#080a12] p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
              GAMIFIED SKILL ARENA · SAVED AUTOMATICALLY IN YOUR BROWSER
            </p>
            <h1 className="mt-2 font-['Sora',sans-serif] text-2xl sm:text-4xl font-bold text-white">
              IT Challenges, Quizzes &amp; Badges
            </h1>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-300">
              Sharpen your instincts with daily challenges, topic quizzes, and interview drills. Every badge is strictly earned through real completions—zero login required.
            </p>
          </div>

          {/* XP, Level & Streak Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-5 rounded-xl border border-[#252f50] bg-[#080a12]/90 p-4">
            <div>
              <span className="text-xs text-slate-400">Current Level</span>
              <p className="mt-0.5 font-['Sora',sans-serif] text-lg sm:text-xl font-bold text-white tabular-nums">
                Lv.{levelInfo.level}
              </p>
              <span className="text-[11px] text-[#27d3f0]">{levelInfo.title}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400">Total XP</span>
              <p className="mt-0.5 font-['Sora',sans-serif] text-lg sm:text-xl font-bold text-[#8b6cff] tabular-nums flex items-center gap-1">
                <Zap className="h-4 w-4" />
                {progress.xp}
              </p>
              <span className="text-[11px] text-slate-400 tabular-nums">
                {levelInfo.currentLevelXp}/{levelInfo.nextLevelXp} next
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400">Daily Streak</span>
              <p className="mt-0.5 font-['Sora',sans-serif] text-lg sm:text-xl font-bold text-amber-300 tabular-nums flex items-center gap-1">
                <Flame className="h-4 w-4 text-amber-400" />
                {progress.streakDays}d
              </p>
              <span className="text-[11px] text-slate-400">
                {progress.earnedBadgeIds.length}/6 Badges
              </span>
            </div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>
              Level {levelInfo.level} ({levelInfo.title})
            </span>
            <span className="tabular-nums">{levelInfo.progressPercent}% to Level {levelInfo.level + 1}</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-[#171e35] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] transition-all duration-500"
              style={{ width: `${Math.max(levelInfo.progressPercent, 3)}%` }}
            />
          </div>
        </div>
      </section>

      {/* Active Quiz Runner OR Quiz Mode Selector */}
      {activeMode ? (
        <section className="rounded-2xl border border-[#242e4e] bg-[#0d101b] p-6 sm:p-8 max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#182038] pb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
                {activeMode.title}
              </span>
              <p className="text-xs text-slate-400 mt-0.5">{activeMode.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={exitMode}
              className="rounded-lg border border-[#252f50] bg-[#090c16] px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-[#8b6cff] hover:text-white cursor-pointer"
            >
              ← All Quiz Modes
            </button>
          </div>

          {finishedResult ? (
            <div className="py-8 text-center space-y-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8b6cff]/30 to-[#27d3f0]/30 border border-[#27d3f0]/50 text-[#27d3f0]">
                <Trophy className="h-8 w-8" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
                  Challenge Complete!
                </p>
                <h2 className="mt-1 font-['Sora',sans-serif] text-3xl font-bold text-white tabular-nums">
                  You Scored {finishedResult.score} / {finishedResult.total}
                </h2>
                <p className="mt-2 text-sm sm:text-base text-slate-300">
                  Earned <strong className="text-[#27d3f0]">+{finishedResult.xpGained} XP</strong> toward Level {levelInfo.level + 1}!
                </p>
              </div>

              {finishedResult.newlyUnlockedBadges.length > 0 && (
                <div className="mx-auto max-w-md rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                    New Badge Unlocked!
                  </p>
                  <p className="mt-1 font-['Sora',sans-serif] text-base font-bold text-white">
                    {finishedResult.newlyUnlockedBadges
                      .map((id) => badgeCatalog.find((b) => b.id === id)?.title || id)
                      .join(', ')}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => startMode(activeMode.id)}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#263052] bg-[#12172a] px-4 py-2.5 text-sm font-medium text-white hover:border-[#8b6cff] cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Retry Quiz</span>
                </button>
                <button
                  type="button"
                  onClick={exitMode}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-5 py-2.5 text-sm font-semibold text-[#06070d] hover:opacity-95 cursor-pointer"
                >
                  <span>Choose Another Challenge</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : currentQuestion ? (
            <div className="mt-6 space-y-6">
              {/* Question Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>
                    Question {questionIndex + 1} of {questions.length} ·{' '}
                    <strong className="text-slate-200">{currentQuestion.category}</strong>
                  </span>
                  <span className="tabular-nums text-[#27d3f0]">Score: {score}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#161d33] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] transition-all duration-300"
                    style={{
                      width: `${((questionIndex + 1) / questions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <h2 className="font-['Sora',sans-serif] text-lg sm:text-xl font-bold text-white leading-snug">
                {currentQuestion.question}
              </h2>

              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((opt, idx) => {
                  const answered = selectedOption !== null;
                  const isRight = idx === currentQuestion.correctIndex;
                  const isChosen = idx === selectedOption;

                  let style =
                    'border-[#232c48] bg-[#090c16] text-slate-200 hover:border-[#8b6cff]';
                  if (answered) {
                    if (isRight) {
                      style = 'border-emerald-500/70 bg-emerald-500/15 text-emerald-100';
                    } else if (isChosen && !isRight) {
                      style = 'border-rose-500/70 bg-rose-500/15 text-rose-100';
                    } else {
                      style = 'border-[#181f35] bg-[#090c16]/60 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={answered}
                      onClick={() => handleSelectAnswer(idx)}
                      className={`w-full rounded-xl border p-4 text-left text-sm font-medium transition-colors flex items-center justify-between gap-3 ${
                        answered ? 'cursor-default' : 'cursor-pointer'
                      } ${style}`}
                    >
                      <span>{opt}</span>
                      {answered && isRight && (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedOption !== null && (
                <div className="rounded-xl border border-[#242e4e] bg-[#080a12] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-200">
                    <strong
                      className={
                        selectedOption === currentQuestion.correctIndex
                          ? 'text-emerald-400'
                          : 'text-amber-300'
                      }
                    >
                      {selectedOption === currentQuestion.correctIndex
                        ? 'Correct! '
                        : 'Explanation: '}
                    </strong>
                    {currentQuestion.explanation}
                  </p>
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-4 py-2 text-xs sm:text-sm font-semibold text-[#06070d] hover:opacity-95 cursor-pointer shrink-0"
                  >
                    <span>
                      {questionIndex + 1 < questions.length
                        ? 'Next Question'
                        : 'Finish & Claim XP'}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </section>
      ) : (
        /* 8 Quiz Modes Grid */
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-['Sora',sans-serif] text-xl sm:text-2xl font-bold text-white">
              Choose a Quiz or Challenge Mode
            </h2>
            <Link
              to="/simulator"
              className="text-xs sm:text-sm font-semibold text-[#27d3f0] hover:underline"
            >
              Try Ticket Simulator →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {QUIZ_MODES.map((mode) => {
              const record = progress.completedQuizModes[mode.id];
              return (
                <article
                  key={mode.id}
                  className="rounded-xl border border-[#1e2640] bg-[#0d101b] p-5 flex flex-col justify-between hover:border-[#8b6cff]/70 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                      <span className="font-semibold text-[#27d3f0]">5 Questions</span>
                      {record ? (
                        <span className="text-emerald-400 font-mono font-semibold tabular-nums">
                          Best: {record.bestScore}/{record.total}
                        </span>
                      ) : (
                        <span>+60–80 XP</span>
                      )}
                    </div>

                    <h3 className="mt-2 font-['Sora',sans-serif] text-base font-bold text-white">
                      {mode.title}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-400">
                      {mode.subtitle}
                    </p>

                    {mode.badgeHint && (
                      <p className="mt-2.5 text-[11px] font-medium text-[#8b6cff]">
                        {mode.badgeHint}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => startMode(mode.id)}
                    className="mt-5 w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#151b30] border border-[#263154] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:border-[#27d3f0] hover:text-[#27d3f0] transition-colors cursor-pointer"
                  >
                    <span>{record ? 'Play Again' : 'Start Challenge'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Earned-Only Skill Badges Showcase */}
      <section className="pt-2">
        <div className="mb-5">
          <h2 className="font-['Sora',sans-serif] text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-[#8b6cff]" />
            <span>Earned Skill Badges ({progress.earnedBadgeIds.length} / {badgeCatalog.length})</span>
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Badges start locked and only unlock when you complete real lessons, commands, quizzes, or simulator tickets.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {badgeCatalog.map((badge) => {
            const unlocked = progress.earnedBadgeIds.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`rounded-xl border p-5 transition-all ${
                  unlocked
                    ? 'border-[#27d3f0]/60 bg-gradient-to-br from-[#122036] to-[#0d101b] shadow-[0_0_24px_rgba(39,211,240,0.12)]'
                    : 'border-[#1b2238] bg-[#0a0d16] opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {unlocked ? (
                        <span className="text-emerald-400">Unlocked Badge</span>
                      ) : (
                        <span>Locked</span>
                      )}
                    </p>
                    <h3 className="mt-1 font-['Sora',sans-serif] text-base font-bold text-white">
                      {badge.title}
                    </h3>
                  </div>

                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      unlocked
                        ? 'bg-[#27d3f0]/20 text-[#27d3f0]'
                        : 'bg-[#151a2c] text-slate-500'
                    }`}
                  >
                    {unlocked ? (
                      <Award className="h-5 w-5" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                  </div>
                </div>

                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-300">
                  {badge.description}
                </p>

                <p className="mt-3 text-xs font-mono text-slate-400">
                  Goal: {badge.requirementHint}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
