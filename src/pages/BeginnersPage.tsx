import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Flame,
  Languages,
  Lightbulb,
  Play,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  BEGINNER_CHAPTERS,
  BEGINNER_LESSONS,
  BeginnerLesson,
} from '../data/beginnerLessonsData';
import { ConceptIllustration } from '../components/TechVisuals';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { usePageSEO } from '../utils/seo';

export const BeginnersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    progress,
    levelInfo,
    badgeCatalog,
    recentReward,
    clearReward,
    completeLesson,
    markVisitedLesson,
  } = useLearningProgress();

  const initialLessonId =
    searchParams.get('lesson') ||
    progress.lastVisitedLessonId ||
    BEGINNER_LESSONS[0].id;

  const [selectedId, setSelectedId] = useState<string>(() => {
    const exists = BEGINNER_LESSONS.some((l) => l.id === initialLessonId);
    return exists ? initialLessonId : BEGINNER_LESSONS[0].id;
  });
  const [showHinglish, setShowHinglish] = useState<boolean>(false);
  const [activeFlowIndex, setActiveFlowIndex] = useState<number>(0);
  const [autoFlow, setAutoFlow] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [lessonJustCompleted, setLessonJustCompleted] = useState<boolean>(false);

  const currentIndex = useMemo(() => {
    const idx = BEGINNER_LESSONS.findIndex((l) => l.id === selectedId);
    return idx >= 0 ? idx : 0;
  }, [selectedId]);

  const lesson: BeginnerLesson = BEGINNER_LESSONS[currentIndex];
  const nextLesson = BEGINNER_LESSONS[currentIndex + 1] || null;
  const prevLesson = BEGINNER_LESSONS[currentIndex - 1] || null;
  const isCompleted = progress.completedLessonIds.includes(lesson.id);

  usePageSEO({
    title: `${lesson.title} — IT For Absolute Beginners | IT SUPPORT`,
    description: `${lesson.simpleExplanation} Learn IT from zero with interactive visual diagrams, real-life analogies, Hinglish support, and instant mini quizzes.`,
    canonicalPath: '/beginners',
  });

  useEffect(() => {
    markVisitedLesson(lesson.id);
    setActiveFlowIndex(0);
    setAutoFlow(false);
    setQuizAnswers({});
    setLessonJustCompleted(false);
  }, [lesson.id, markVisitedLesson]);

  useEffect(() => {
    if (!autoFlow) return;
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const intervalMs = reduced ? 2600 : 1700;
    const timer = window.setInterval(() => {
      setActiveFlowIndex((prev) => (prev + 1) % lesson.flowNodes.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [autoFlow, lesson.flowNodes.length]);

  const selectLesson = (id: string) => {
    setSelectedId(id);
    setSearchParams({ lesson: id }, { replace: true });
    clearReward();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnswerSelect = (qIdx: number, optIdx: number) => {
    const updated = { ...quizAnswers, [qIdx]: optIdx };
    setQuizAnswers(updated);

    // Check if all 3 mini-quiz questions have been answered
    const allAnswered = [0, 1, 2].every((i) => typeof updated[i] === 'number');
    if (allAnswered && !lessonJustCompleted) {
      completeLesson(lesson.id);
      setLessonJustCompleted(true);
    }
  };

  const correctQuizCount = [0, 1, 2].filter(
    (i) => quizAnswers[i] === lesson.miniQuiz[i].correctIndex
  ).length;
  const allThreeAnswered = [0, 1, 2].every((i) => typeof quizAnswers[i] === 'number');

  const completionPercent = Math.round(
    (progress.completedLessonIds.length / BEGINNER_LESSONS.length) * 100
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header & Progress Bar */}
      <div className="rounded-2xl border border-[#1f2742] bg-gradient-to-br from-[#121629] via-[#0d101b] to-[#090c16] p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
              IT FOR ABSOLUTE BEGINNERS · 25 VISUAL LESSONS · ZERO JARGON
            </p>
            <h1 className="mt-2 font-['Sora',sans-serif] text-2xl sm:text-4xl font-bold text-white">
              Learn Computers &amp; IT From Zero
            </h1>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-300">
              Never studied computer science? No problem. Every concept uses everyday analogies, clickable visual flows, optional Hinglish explanations, and quick 3-question checkups.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-[#242d4c] bg-[#080a12]/90 px-4 py-3.5 text-xs sm:text-sm">
            <div>
              <span className="text-slate-400">Course Progress</span>
              <p className="font-['Sora',sans-serif] text-base font-bold text-white tabular-nums">
                {progress.completedLessonIds.length} / {BEGINNER_LESSONS.length} Lessons ({completionPercent}%)
              </p>
            </div>
            <div className="h-8 w-px bg-[#1e2640]" />
            <div>
              <span className="text-slate-400">Your XP</span>
              <p className="font-['Sora',sans-serif] text-base font-bold text-[#27d3f0] tabular-nums flex items-center gap-1">
                <Zap className="h-4 w-4 text-[#8b6cff]" />
                {progress.xp} XP · Lv.{levelInfo.level}
              </p>
            </div>
            <div className="h-8 w-px bg-[#1e2640]" />
            <div>
              <span className="text-slate-400">Streak</span>
              <p className="font-['Sora',sans-serif] text-base font-bold text-amber-300 tabular-nums flex items-center gap-1">
                <Flame className="h-4 w-4 text-amber-400" />
                {progress.streakDays}d
              </p>
            </div>
          </div>
        </div>

        {/* Course Completion Bar */}
        <div className="mt-5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#192038]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] transition-all duration-500"
              style={{ width: `${Math.max(completionPercent, 3)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Curriculum Sidebar */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Mobile Quick Dropdown */}
          <div className="lg:hidden">
            <label
              htmlFor="mobile-lesson-picker"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
            >
              Jump to Lesson (1–25)
            </label>
            <select
              id="mobile-lesson-picker"
              value={lesson.id}
              onChange={(e) => selectLesson(e.target.value)}
              className="w-full rounded-lg border border-[#252f4f] bg-[#0d101b] px-3.5 py-2.5 text-sm text-white focus:border-[#8b6cff] focus:outline-none"
            >
              {BEGINNER_LESSONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {progress.completedLessonIds.includes(item.id) ? '✓ ' : ''}
                  Lesson {item.number}: {item.title}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop / Tablet Chapter List */}
          <div className="hidden lg:block rounded-xl border border-[#1d2338] bg-[#0d101b] p-4 max-h-[760px] overflow-y-auto space-y-5">
            {BEGINNER_CHAPTERS.map((chapter) => {
              const chapterLessons = BEGINNER_LESSONS.filter(
                (l) => l.chapter === chapter
              );
              const doneInChapter = chapterLessons.filter((l) =>
                progress.completedLessonIds.includes(l.id)
              ).length;

              return (
                <div key={chapter}>
                  <div className="flex items-center justify-between px-2 pb-2 border-b border-[#181f35]">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
                      {chapter}
                    </h2>
                    <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                      {doneInChapter}/{chapterLessons.length}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {chapterLessons.map((item) => {
                      const active = item.id === lesson.id;
                      const done = progress.completedLessonIds.includes(item.id);
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => selectLesson(item.id)}
                            className={`w-full flex items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs sm:text-sm transition-colors cursor-pointer ${
                              active
                                ? 'bg-[#8b6cff]/20 border border-[#8b6cff]/60 text-white font-semibold'
                                : 'text-slate-300 hover:bg-[#14192b] hover:text-white border border-transparent'
                            }`}
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <span className="font-mono text-[11px] text-slate-400 shrink-0 w-5">
                                {String(item.number).padStart(2, '0')}
                              </span>
                              <span className="truncate">{item.title}</span>
                            </span>
                            {done ? (
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Interactive Lesson Canvas */}
        <div className="lg:col-span-8 space-y-6">
          <article className="rounded-2xl border border-[#1f2742] bg-[#0d101b] p-6 sm:p-8 space-y-7">
            {/* Top Meta + Hinglish Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#181f35] pb-5">
              <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                <span className="font-mono font-semibold text-[#27d3f0]">
                  LESSON {lesson.number} OF {BEGINNER_LESSONS.length}
                </span>
                <span>·</span>
                <span>{lesson.chapter}</span>
                {isCompleted && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Completed
                    </span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowHinglish((prev) => !prev)}
                aria-pressed={showHinglish}
                className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  showHinglish
                    ? 'border-[#27d3f0] bg-[#27d3f0]/15 text-[#27d3f0]'
                    : 'border-[#263052] bg-[#13182a] text-slate-300 hover:border-[#8b6cff] hover:text-white'
                }`}
              >
                <Languages className="h-3.5 w-3.5" />
                <span>{showHinglish ? 'Hinglish Helper: ON' : 'Show Hinglish Also'}</span>
              </button>
            </div>

            {/* Lesson Title & Simple Explanation */}
            <div>
              <h2 className="font-['Sora',sans-serif] text-2xl sm:text-3xl font-bold text-white">
                {lesson.title}
              </h2>
              <p className="mt-3 text-base sm:text-lg leading-relaxed text-slate-200">
                {lesson.simpleExplanation}
              </p>

              {showHinglish && (
                <div className="mt-4 rounded-xl border border-[#27d3f0]/35 bg-[#091522] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
                    Easy Hinglish Explanation
                  </p>
                  <p className="mt-1.5 text-sm sm:text-base leading-relaxed text-slate-100">
                    {lesson.hinglishExplanation}
                  </p>
                </div>
              )}
            </div>

            {/* Attractive Custom SVG Technology Illustration */}
            <ConceptIllustration
              lessonNumber={lesson.number}
              chapter={lesson.chapter}
              title={lesson.title}
            />

            {/* Real-Life Analogy Card */}
            <div className="rounded-xl border border-[#8b6cff]/35 bg-gradient-to-r from-[#171330] to-[#0f1325] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8b6cff]/20 text-[#27d3f0]">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-['Sora',sans-serif] text-sm font-semibold text-white">
                    Real-Life Analogy
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-200">
                    {lesson.realLifeExample}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive Visual Flow Diagram */}
            <div className="rounded-xl border border-[#222b49] bg-[#080a12] p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#27d3f0]">
                    Interactive Visual Flow · Click Any Step
                  </span>
                  <h3 className="mt-0.5 font-['Sora',sans-serif] text-base sm:text-lg font-bold text-white">
                    {lesson.flowTitle}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAutoFlow((prev) => !prev)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      autoFlow
                        ? 'border-[#27d3f0] bg-[#27d3f0]/15 text-[#27d3f0]'
                        : 'border-[#263052] bg-[#12172a] text-slate-200 hover:border-[#8b6cff]'
                    }`}
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>{autoFlow ? 'Pause Flow' : 'Animate Flow'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveFlowIndex((prev) => (prev + 1) % lesson.flowNodes.length)
                    }
                    className="rounded-lg border border-[#263052] bg-[#12172a] px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-[#27d3f0] cursor-pointer"
                  >
                    Next Step →
                  </button>
                </div>
              </div>

              {/* Connected Flow Nodes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {lesson.flowNodes.map((node, idx) => {
                  const isCurrent = idx === activeFlowIndex;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAutoFlow(false);
                        setActiveFlowIndex(idx);
                      }}
                      className={`relative text-left rounded-xl border p-4 transition-all cursor-pointer ${
                        isCurrent
                          ? 'border-[#27d3f0] bg-gradient-to-b from-[#132038] to-[#0d1424] shadow-[0_0_24px_rgba(39,211,240,0.14)]'
                          : 'border-[#1c243d] bg-[#0d101b] hover:border-[#8b6cff]/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={`font-mono font-bold ${
                            isCurrent ? 'text-[#27d3f0]' : 'text-slate-400'
                          }`}
                        >
                          STEP 0{idx + 1}
                        </span>
                        {idx < lesson.flowNodes.length - 1 && (
                          <ArrowRight
                            className={`h-3.5 w-3.5 hidden lg:inline ${
                              isCurrent ? 'text-[#27d3f0]' : 'text-slate-600'
                            }`}
                          />
                        )}
                      </div>
                      <p className="mt-2 font-['Sora',sans-serif] text-sm font-bold text-white">
                        {node.label}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">{node.subtitle}</p>
                    </button>
                  );
                })}
              </div>

              {/* Active Step Inspector */}
              {lesson.flowNodes[activeFlowIndex] && (
                <div className="mt-4 rounded-lg border border-[#1d2744] bg-[#0d1222] px-4 py-3.5 text-sm text-slate-200 flex items-start gap-3">
                  <span className="font-mono text-xs font-bold text-[#27d3f0] mt-0.5 shrink-0">
                    [0{activeFlowIndex + 1}]
                  </span>
                  <p className="leading-relaxed">
                    <strong className="text-white">
                      {lesson.flowNodes[activeFlowIndex].label}:
                    </strong>{' '}
                    {lesson.flowNodes[activeFlowIndex].detail}
                  </p>
                </div>
              )}
            </div>

            {/* Why It Matters & Common Mistakes */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-xl border border-[#1e2640] bg-[#090c16] p-5">
                <h3 className="font-['Sora',sans-serif] text-sm font-bold text-[#27d3f0] flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Why This Matters in Real IT Jobs
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-300">
                  {lesson.whyItMatters}
                </p>
              </div>

              <div className="rounded-xl border border-[#1e2640] bg-[#090c16] p-5">
                <h3 className="font-['Sora',sans-serif] text-sm font-bold text-amber-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  Common Beginner Mistakes
                </h3>
                <ul className="mt-2.5 space-y-2 text-sm text-slate-300">
                  {lesson.commonMistakes.map((mistake, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                      <span className="leading-relaxed">{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 3-Question Mini Quiz */}
            <div className="rounded-xl border border-[#252f50] bg-[#080a12] p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#8b6cff]">
                    Quick Knowledge Check · +30 XP
                  </span>
                  <h3 className="mt-0.5 font-['Sora',sans-serif] text-lg font-bold text-white">
                    3-Question Mini Quiz
                  </h3>
                </div>
                <span className="text-xs text-slate-400 tabular-nums">
                  {Object.keys(quizAnswers).length} / 3 Answered
                </span>
              </div>

              <div className="space-y-5">
                {lesson.miniQuiz.map((q, qIdx) => {
                  const chosen = quizAnswers[qIdx];
                  const answered = typeof chosen === 'number';
                  return (
                    <div
                      key={qIdx}
                      className="rounded-xl border border-[#1b223a] bg-[#0d101b] p-4 space-y-3"
                    >
                      <p className="text-sm font-semibold text-white">
                        {qIdx + 1}. {q.question}
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = chosen === optIdx;
                          const isRight = q.correctIndex === optIdx;

                          let btnStyle =
                            'border-[#222b46] bg-[#090c16] text-slate-200 hover:border-[#8b6cff]';
                          if (answered) {
                            if (isRight) {
                              btnStyle =
                                'border-emerald-500/60 bg-emerald-500/15 text-emerald-100';
                            } else if (isSelected && !isRight) {
                              btnStyle =
                                'border-rose-500/60 bg-rose-500/15 text-rose-100';
                            } else {
                              btnStyle =
                                'border-[#192036] bg-[#090c16]/60 text-slate-400';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleAnswerSelect(qIdx, optIdx)}
                              className={`w-full rounded-lg border px-3.5 py-2.5 text-left text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center justify-between gap-2 ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {answered && isRight && (
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {answered && (
                        <p
                          className={`text-xs leading-relaxed ${
                            chosen === q.correctIndex
                              ? 'text-emerald-300'
                              : 'text-amber-200'
                          }`}
                        >
                          <strong>
                            {chosen === q.correctIndex ? 'Correct! ' : 'Good try — '}
                          </strong>
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Completion Celebration Banner */}
              {allThreeAnswered && (
                <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/15 via-[#131c31] to-[#1a1438] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-['Sora',sans-serif] text-base font-bold text-white flex items-center gap-2">
                      <Award className="h-5 w-5 text-[#27d3f0]" />
                      <span>
                        Lesson {lesson.number} Complete! Score: {correctQuizCount}/3
                      </span>
                    </p>
                    <p className="mt-1 text-xs sm:text-sm text-slate-200">
                      {recentReward ? recentReward.message : 'Progress saved in your browser.'}
                      {recentReward && recentReward.newlyUnlockedBadges.length > 0 && (
                        <strong className="ml-1.5 text-[#27d3f0]">
                          Unlocked Badge:{' '}
                          {recentReward.newlyUnlockedBadges
                            .map(
                              (id) =>
                                badgeCatalog.find((b) => b.id === id)?.title || id
                            )
                            .join(', ')}
                          !
                        </strong>
                      )}
                    </p>
                  </div>

                  {nextLesson ? (
                    <button
                      type="button"
                      onClick={() => selectLesson(nextLesson.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-5 py-2.5 text-sm font-semibold text-[#06070d] hover:opacity-95 cursor-pointer shrink-0"
                    >
                      <span>Next: {nextLesson.title}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <Link
                      to="/learning-lab"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-5 py-2.5 text-sm font-semibold text-[#06070d] hover:opacity-95 shrink-0"
                    >
                      <span>Explore Visual IT Lab</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Navigation & AI Tutor Helper */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#181f35]">
              <div>
                {prevLesson && (
                  <button
                    type="button"
                    onClick={() => selectLesson(prevLesson.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#242d4c] bg-[#090c16] px-4 py-2 text-xs sm:text-sm font-medium text-slate-200 hover:border-[#8b6cff] cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Lesson {prevLesson.number}</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  to={`/ai-assistant?mode=tutor&q=${encodeURIComponent(
                    `Explain "${lesson.title}" to a complete beginner with another real-life example`
                  )}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#8b6cff]/50 bg-[#15122b] px-4 py-2 text-xs sm:text-sm font-medium text-white hover:border-[#27d3f0]"
                >
                  <Sparkles className="h-4 w-4 text-[#27d3f0]" />
                  <span>Ask Personal AI Tutor</span>
                </Link>

                {nextLesson && (
                  <button
                    type="button"
                    onClick={() => selectLesson(nextLesson.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-4 py-2 text-xs sm:text-sm font-semibold text-[#06070d] hover:opacity-95 cursor-pointer"
                  >
                    <span>Next Lesson</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};
