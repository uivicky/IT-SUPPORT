import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CheckSquare,
  Clock,
  GraduationCap,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Square,
  Terminal,
  Trophy,
  Wrench,
} from 'lucide-react';
import { ALL_ISSUES } from '../data/issuesIndex';
import { BEGINNER_LESSONS } from '../data/beginnerLessonsData';
import { QUIZ_MODES } from '../data/quizzesData';
import { getRelatedIssues } from '../utils/searchEngine';
import { CopyButton } from '../components/CopyButton';
import { IssueCard } from '../components/IssueCard';
import { IssueCategorySchematic } from '../components/TechVisuals';
import { usePageSEO } from '../utils/seo';
import { enrichRunbookSEO } from '../utils/runbookSEO';
import { DEVELOPER_BRANDING } from '../utils/developerBranding';
import { ExternalLink } from 'lucide-react';

function getBeginnerContextForCategory(category: string): {
  analogy: string;
  quizModeId: string;
  lessonKeywords: string[];
} {
  const lower = category.toLowerCase();
  if (lower.includes('dns') || lower.includes('dhcp')) {
    return {
      analogy:
        'Think of DHCP as the hotel front desk handing your computer a room number (IP address), and DNS as the phonebook translating website names into IP numbers. When either breaks, WiFi looks connected while websites refuse to open.',
      quizModeId: 'networking',
      lessonKeywords: ['dns', 'dhcp', 'ip'],
    };
  }
  if (lower.includes('network') || lower.includes('wifi') || lower.includes('vpn')) {
    return {
      analogy:
        'Picture network data like delivery vans driving from your laptop through your router door (Default Gateway) onto internet highways. We test local lanes first, then external highways, so we pinpoint the exact roadblock.',
      quizModeId: 'networking',
      lessonKeywords: ['wifi', 'router', 'network', 'vpn'],
    };
  }
  if (lower.includes('active directory') || lower.includes('group policy') || lower.includes('login')) {
    return {
      analogy:
        'Active Directory is your company’s central security reception desk (Domain Controller). If an employee’s ID badge (password/Kerberos ticket) or office rulebook (Group Policy) gets out of sync, we refresh and unlock it centrally.',
      quizModeId: 'active-directory',
      lessonKeywords: ['active directory', 'windows', 'server'],
    };
  }
  if (lower.includes('hardware') || lower.includes('printer') || lower.includes('storage')) {
    return {
      analogy:
        'Hardware components (CPU, RAM, SSD, and printers) need clean power, cool airflow, free disk breathing room, and healthy driver translators so Windows can talk to the physical device.',
      quizModeId: 'hardware',
      lessonKeywords: ['ram', 'ssd', 'cpu', 'hardware'],
    };
  }
  if (lower.includes('security') || lower.includes('antivirus') || lower.includes('firewall')) {
    return {
      analogy:
        'Firewalls and endpoint security act like smart security guards checking every door (port) and package. Our goal is to block threats while keeping legitimate work apps flowing safely.',
      quizModeId: 'scenario',
      lessonKeywords: ['cybersecurity', 'firewall', 'vpn'],
    };
  }
  return {
    analogy:
      'Even complex computer glitches follow cause-and-effect! Instead of guessing or reinstalling everything, we verify what symptoms match, check system health safely, and apply one targeted fix at a time.',
    quizModeId: 'windows',
    lessonKeywords: ['windows', 'operating system', 'computer'],
  };
}

export const IssueDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [explanationMode, setExplanationMode] = useState<'beginner' | 'engineer'>('beginner');
  const [checkedSymptoms, setCheckedSymptoms] = useState<number[]>([]);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const issue = useMemo(
    () =>
      ALL_ISSUES.find(
        (item) => item.slug === slug || item.id.toLowerCase() === slug?.toLowerCase()
      ),
    [slug]
  );

  useEffect(() => {
    setCheckedSymptoms([]);
    setCompletedSteps([]);
  }, [issue?.id]);

  const relatedIssues = useMemo(
    () => (issue ? getRelatedIssues(ALL_ISSUES, issue, 4) : []),
    [issue]
  );

  const beginnerContext = useMemo(
    () => getBeginnerContextForCategory(issue?.category || ''),
    [issue?.category]
  );

  const relatedLessons = useMemo(() => {
    if (!issue) return BEGINNER_LESSONS.slice(0, 2);
    const matched = BEGINNER_LESSONS.filter((lesson) =>
      beginnerContext.lessonKeywords.some(
        (kw) =>
          lesson.title.toLowerCase().includes(kw) ||
          lesson.chapter.toLowerCase().includes(kw)
      )
    );
    return (matched.length >= 2 ? matched : BEGINNER_LESSONS).slice(0, 3);
  }, [issue, beginnerContext]);

  const relatedQuizMode = useMemo(
    () =>
      QUIZ_MODES.find((q) => q.id === beginnerContext.quizModeId) || QUIZ_MODES[0],
    [beginnerContext.quizModeId]
  );

  const enrichedSEO = useMemo(
    () => (issue ? enrichRunbookSEO(issue) : null),
    [issue]
  );

  const jsonLdPayload = useMemo(() => {
    if (!issue || !enrichedSEO) return undefined;
    const origin = 'https://it-support-engg.vercel.app';
    const canonicalUrl = `${origin}/issues/${issue.slug}`;

    return [
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: enrichedSEO.searchIntentTitle,
        alternativeHeadline: issue.title,
        description: enrichedSEO.metaDescription,
        proficiencyLevel: issue.difficulty,
        articleSection: issue.category,
        keywords: issue.keywords.join(', '),
        inLanguage: 'en',
        url: canonicalUrl,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
        author: {
          '@type': 'Person',
          name: DEVELOPER_BRANDING.fullCreditName,
          jobTitle: DEVELOPER_BRANDING.role,
          url: origin,
        },
        publisher: {
          '@type': 'Organization',
          name: 'IT SUPPORT',
          url: origin,
          logo: {
            '@type': 'ImageObject',
            url: `${origin}/favicon.ico`,
          },
        },
        datePublished: '2025-01-01T00:00:00Z',
        dateModified: new Date().toISOString().split('T')[0],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: enrichedSEO.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ];
  }, [issue, enrichedSEO]);

  usePageSEO({
    title: enrichedSEO ? enrichedSEO.searchIntentTitle : 'Troubleshooting Runbook',
    description: enrichedSEO
      ? enrichedSEO.metaDescription
      : 'Browse 325+ verified IT troubleshooting guides on IT SUPPORT.',
    canonicalPath: issue ? `/issues/${issue.slug}` : '/issues',
    ogType: 'article',
    breadcrumbs: issue
      ? [
          { name: 'Home', item: '/' },
          { name: 'IT Issues', item: '/issues' },
          { name: issue.category, item: `/issues?category=${encodeURIComponent(issue.category)}` },
          { name: issue.title, item: `/issues/${issue.slug}` },
        ]
      : undefined,
    jsonLd: jsonLdPayload,
  });

  if (!issue) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="font-['Sora',sans-serif] text-2xl sm:text-3xl font-bold text-white">
          Troubleshooting Runbook Not Found
        </h1>
        <p className="mt-3 text-slate-400">
          The requested issue URL could not be found. Search all {ALL_ISSUES.length} runbooks below.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/issues"
            className="rounded-lg bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-5 py-2.5 text-sm font-semibold text-[#06070d]"
          >
            Browse All IT Issues
          </Link>
        </div>
      </div>
    );
  }

  const difficultyColor =
    issue.difficulty === 'Beginner'
      ? 'text-emerald-400'
      : issue.difficulty === 'Intermediate'
      ? 'text-[#27d3f0]'
      : 'text-[#8b6cff]';

  const toggleSymptom = (idx: number) => {
    setCheckedSymptoms((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const stepProgressPct =
    issue.solutionSteps.length > 0
      ? Math.round((completedSteps.length / issue.solutionSteps.length) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
        <Link to="/issues" className="inline-flex items-center gap-1 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" />
          All Issues
        </Link>
        <span>/</span>
        <Link
          to={`/issues?category=${encodeURIComponent(issue.category)}`}
          className="hover:text-[#27d3f0]"
        >
          {issue.category}
        </Link>
        <span>/</span>
        <span className="text-slate-500 font-mono">{issue.id}</span>
      </nav>

      {/* Header + Explanation Mode Switcher */}
      <header className="mt-5 border-b border-[#181e31] pb-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">{issue.category}</span>
            <span>·</span>
            <span className={`font-semibold ${difficultyColor}`}>
              Difficulty: {issue.difficulty}
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 text-slate-300">
              <Clock className="h-3.5 w-3.5 text-[#27d3f0]" />
              Estimated Time: {issue.estimatedTime}
            </span>
            {issue.errorCode && (
              <>
                <span>·</span>
                <span className="font-mono font-semibold text-[#27d3f0]">
                  Error: {issue.errorCode}
                </span>
              </>
            )}
          </div>

          {/* BEGINNER MODE vs ENGINEER MODE Switcher */}
          <div
            role="group"
            aria-label="Explanation mode switcher"
            className="inline-flex rounded-xl border border-[#242e4e] bg-[#0a0d18] p-1"
          >
            <button
              type="button"
              onClick={() => setExplanationMode('beginner')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                explanationMode === 'beginner'
                  ? 'bg-[#27d3f0] text-[#06070d]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5 shrink-0" />
              <span>BEGINNER MODE</span>
            </button>
            <button
              type="button"
              onClick={() => setExplanationMode('engineer')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                explanationMode === 'engineer'
                  ? 'bg-[#8b6cff] text-[#06070d]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Wrench className="h-3.5 w-3.5 shrink-0" />
              <span>ENGINEER MODE</span>
            </button>
          </div>
        </div>

        <div>
          <h1 className="font-['Sora',sans-serif] text-2xl sm:text-4xl font-bold text-white leading-tight">
            {enrichedSEO ? enrichedSEO.primaryH1 : issue.title}
          </h1>

          <p className="mt-3 text-base sm:text-lg leading-relaxed text-slate-300">
            {issue.shortDescription}
          </p>
        </div>

        {/* Illustrated Issue Overview Banner */}
        <IssueCategorySchematic
          category={issue.category}
          difficulty={issue.difficulty}
          mode={explanationMode}
        />

        {/* Beginner Plain-English Analogy Card */}
        {explanationMode === 'beginner' && (
          <div className="rounded-xl border border-[#233256] bg-[#0e1428] p-4 sm:p-5 space-y-1.5">
            <span className="text-xs font-semibold text-[#27d3f0]">
              Plain-English Overview &amp; Everyday Analogy
            </span>
            <p className="text-sm text-slate-200 leading-relaxed">
              {beginnerContext.analogy}
            </p>
          </div>
        )}
      </header>

      {/* Main Content Grid */}
      <div className="mt-8 space-y-8">
        {/* Interactive Checkable Symptoms & Possible Causes */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-['Sora',sans-serif] text-base font-semibold text-white flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-[#27d3f0]" />
                <span>Interactive Symptoms Checklist</span>
              </h2>
              <span className="font-mono text-xs text-[#27d3f0] tabular-nums">
                {checkedSymptoms.length}/{issue.symptoms.length} matched
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Click the symptoms you see in your environment to confirm diagnosis:
            </p>

            <ul className="mt-3.5 space-y-2 text-sm leading-relaxed">
              {issue.symptoms.map((sym, idx) => {
                const isChecked = checkedSymptoms.includes(idx);
                return (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={() => toggleSymptom(idx)}
                      aria-pressed={isChecked}
                      className={`w-full rounded-lg border px-3 py-2 text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                        isChecked
                          ? 'border-[#27d3f0]/50 bg-[#101c30] text-white'
                          : 'border-[#1a2138] bg-[#080a12] text-slate-300 hover:border-[#2a3558]'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-[#27d3f0]" />
                      ) : (
                        <Square className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                      )}
                      <span>{sym}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-6">
            <h2 className="font-['Sora',sans-serif] text-base font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#8b6cff]" />
              <span>
                {explanationMode === 'beginner'
                  ? 'Why Does This Problem Happen?'
                  : 'Possible Root Causes'}
              </span>
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {explanationMode === 'beginner'
                ? 'Most common everyday reasons behind this glitch:'
                : 'Technical failure vectors ranked by likelihood:'}
            </p>
            <ul className="mt-3.5 space-y-2.5 text-sm leading-relaxed text-slate-300">
              {issue.possibleCauses.map((cause, idx) => (
                <li
                  key={idx}
                  className="rounded-lg border border-[#1a2138] bg-[#080a12] px-3 py-2 flex items-start gap-2.5"
                >
                  <span className="font-mono text-xs font-bold text-[#8b6cff] mt-0.5 tabular-nums">
                    0{idx + 1}
                  </span>
                  <span>{cause}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Safety Warning Banner (if present) */}
        {issue.safetyWarning && (
          <div
            role="alert"
            className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 sm:p-5 flex items-start gap-3.5"
          >
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <h2 className="text-sm font-semibold text-amber-300">
                System Safety Warning
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-amber-100/90">
                {issue.safetyWarning}
              </p>
            </div>
          </div>
        )}

        {/* Interactive Step-by-Step Troubleshooting Tracker */}
        <section className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-['Sora',sans-serif] text-lg sm:text-xl font-bold text-white">
                Interactive Step-by-Step Troubleshooting Tracker
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Click each step as you complete it to track your live remediation progress.
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-[#27d3f0] tabular-nums">
              {completedSteps.length} / {issue.solutionSteps.length} Steps Completed ({stepProgressPct}%)
            </span>
          </div>

          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[#161c30]">
            <div
              className="h-full bg-gradient-to-r from-[#27d3f0] to-[#8b6cff] transition-all duration-200"
              style={{ width: `${stepProgressPct}%` }}
            />
          </div>

          <ol className="mt-5 space-y-3">
            {issue.solutionSteps.map((step, index) => {
              const done = completedSteps.includes(index);
              return (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => toggleStep(index)}
                    aria-pressed={done}
                    className={`w-full rounded-xl border p-4 text-left flex items-start gap-3.5 transition-colors cursor-pointer ${
                      done
                        ? 'border-emerald-500/45 bg-emerald-500/10'
                        : 'border-[#1d2540] bg-[#080a12] hover:border-[#8b6cff]/50'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border font-mono text-xs font-bold tabular-nums ${
                        done
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                          : 'border-[#2a3454] bg-[#14192b] text-[#27d3f0]'
                      }`}
                    >
                      {done ? '✓' : index + 1}
                    </span>
                    <div className="flex-1">
                      <p
                        className={`text-sm sm:text-base leading-relaxed ${
                          done ? 'text-emerald-100' : 'text-slate-200'
                        }`}
                      >
                        {step}
                      </p>
                      {explanationMode === 'beginner' && index === 0 && (
                        <span className="mt-1.5 block text-xs text-[#27d3f0]">
                          Beginner Tip: Start here first—this quick check solves a huge share of tickets without changing system settings!
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        {/* CMD / PowerShell / Linux Commands */}
        <section className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-6 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-['Sora',sans-serif] text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Terminal className="h-5 w-5 text-[#8b6cff]" />
              <span>Copyable Diagnostic &amp; Fix Commands</span>
            </h2>
            <Link
              to="/commands"
              className="text-xs font-semibold text-[#27d3f0] hover:underline"
            >
              Practice Safely in Simulated Terminal →
            </Link>
          </div>

          {explanationMode === 'beginner' && (
            <p className="mt-2 rounded-lg border border-[#222d4e] bg-[#090d19] px-3.5 py-2.5 text-xs text-slate-300 leading-relaxed">
              <strong className="text-[#27d3f0]">How to open the terminal safely:</strong> On Windows, press the <strong>Start</strong> button, type <strong>cmd</strong> or <strong>PowerShell</strong>, right-click it, and choose <strong>Run as administrator</strong> when elevated permissions are noted below.
            </p>
          )}

          <div className="mt-5 space-y-4">
            {issue.commands.map((cmd, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-[#1e2640] bg-[#070911] overflow-hidden"
              >
                <div className="flex items-center justify-between gap-3 border-b border-[#181f35] bg-[#0b0e1a] px-4 py-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-mono font-semibold text-[#27d3f0]">
                      {cmd.shell}
                    </span>
                    {cmd.note && (
                      <>
                        <span>·</span>
                        <span>{cmd.note}</span>
                      </>
                    )}
                  </div>
                  <CopyButton text={cmd.command} label="Copy Command" />
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-xs sm:text-sm leading-relaxed text-slate-100">
                  <code>{cmd.command}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* Expected Result & Prevention Tips */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <section className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-6">
            <h2 className="font-['Sora',sans-serif] text-base font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Expected Result</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              {issue.expectedResult}
            </p>
          </section>

          <section className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-6">
            <h2 className="font-['Sora',sans-serif] text-base font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#27d3f0]" />
              <span>Prevention Tips</span>
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-300">
              {issue.preventionTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="font-mono text-xs font-bold text-emerald-400 mt-0.5">
                    •
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Verification Procedure & Advanced Diagnostics */}
        {enrichedSEO && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-6">
              <h2 className="font-['Sora',sans-serif] text-base font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#27d3f0]" />
                <span>Verification &amp; Remediation Validation</span>
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-300">
                {enrichedSEO.verificationProcedure.map((vStep, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#27d3f0] mt-0.5 tabular-nums">
                      {idx + 1}.
                    </span>
                    <span>{vStep}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-6">
              <h2 className="font-['Sora',sans-serif] text-base font-semibold text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-[#8b6cff]" />
                <span>Advanced Enterprise Isolation</span>
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-300">
                {enrichedSEO.advancedDiagnostics.map((diag, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#8b6cff] mt-0.5">
                      •
                    </span>
                    <span>{diag}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {/* Frequently Asked Questions (Structured FAQ) */}
        {enrichedSEO && enrichedSEO.faqs.length > 0 && (
          <section className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-[#27d3f0]" />
              <h2 className="font-['Sora',sans-serif] text-lg sm:text-xl font-bold text-white">
                Frequently Asked Questions — {issue.title}
              </h2>
            </div>
            <div className="space-y-4 pt-2">
              {enrichedSEO.faqs.map((faq, idx) => (
                <div key={idx} className="rounded-lg border border-[#1f2742] bg-[#080a13] p-4 space-y-2">
                  <h3 className="font-['Sora',sans-serif] text-sm sm:text-base font-semibold text-[#e9ebf7]">
                    {faq.question}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Official Vendor Documentation References */}
        {enrichedSEO && enrichedSEO.officialReferences.length > 0 && (
          <section className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-6 space-y-3">
            <h2 className="font-['Sora',sans-serif] text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#8b6cff]" />
              <span>Official Technical References &amp; Standards</span>
            </h2>
            <p className="text-xs text-slate-400">
              Verified documentation from official platform vendors for authoritative enterprise configuration:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {enrichedSEO.officialReferences.map((ref, idx) => (
                <a
                  key={idx}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-[#1e2642] bg-[#080a13] p-3.5 hover:border-[#27d3f0] transition-colors flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-[#27d3f0] group-hover:underline">
                      <span className="truncate">{ref.name}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 ml-1.5 opacity-80" />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                      {ref.note}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Ask AI About This Issue */}
        <section className="rounded-xl border border-[#8b6cff]/40 bg-gradient-to-r from-[#131127] to-[#0c1824] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-['Sora',sans-serif] text-base sm:text-lg font-semibold text-white">
              Need Custom Help or Want This Issue Explained Step by Step?
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              Launch IT SUPPORT AI with <strong>{issue.title}</strong> pre-loaded for deeper log triage or beginner Q&amp;A.
            </p>
          </div>
          <Link
            to={`/ai-assistant?mode=${explanationMode === 'beginner' ? 'tutor' : 'troubleshoot'}&q=${encodeURIComponent(
              explanationMode === 'beginner'
                ? `Explain "${issue.title}" (${issue.category}) in simple beginner terms and walk me through fixing it safely.`
                : `I am troubleshooting "${issue.title}" (${issue.category}), tried the initial steps, and need deeper isolation.`
            )}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-4 py-2.5 text-sm font-semibold text-[#06070d] whitespace-nowrap"
          >
            <Sparkles className="h-4 w-4" />
            <span>Ask AI About This Issue</span>
          </Link>
        </section>

        {/* Related Lessons & Related Quizzes */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-6 space-y-4">
            <h2 className="font-['Sora',sans-serif] text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[#27d3f0]" />
              <span>Related Beginner Lessons</span>
            </h2>
            <div className="space-y-2.5">
              {relatedLessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  to={`/beginners?lesson=${lesson.id}`}
                  className="group rounded-lg border border-[#1c243d] bg-[#080a12] p-3 flex items-center justify-between gap-3 hover:border-[#27d3f0] transition-colors"
                >
                  <div className="min-w-0">
                    <span className="font-mono text-[11px] text-[#27d3f0] tabular-nums">
                      Lesson {lesson.number} · {lesson.chapter}
                    </span>
                    <p className="truncate text-sm font-semibold text-white mt-0.5">
                      {lesson.title}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-[#27d3f0]" />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <h2 className="font-['Sora',sans-serif] text-base font-bold text-white flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#8b6cff]" />
                <span>Related Interactive Quizzes &amp; Simulator</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Test your understanding of <strong>{issue.category}</strong> with instant feedback, XP rewards, and live ticket scenarios:
              </p>
            </div>

            <div className="space-y-2.5">
              <Link
                to={`/challenges?mode=${relatedQuizMode.id}`}
                className="group rounded-lg border border-[#242e4e] bg-[#080a12] p-3.5 flex items-center justify-between gap-3 hover:border-[#8b6cff] transition-colors"
              >
                <div>
                  <span className="text-xs font-semibold text-[#8b6cff]">
                    Recommended Quiz Mode
                  </span>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {relatedQuizMode.title} (+XP)
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#8b6cff]" />
              </Link>

              <Link
                to="/simulator"
                className="group rounded-lg border border-[#242e4e] bg-[#080a12] p-3.5 flex items-center justify-between gap-3 hover:border-[#27d3f0] transition-colors"
              >
                <div>
                  <span className="text-xs font-semibold text-[#27d3f0]">
                    Hands-On Helpdesk Ticket
                  </span>
                  <p className="text-sm font-bold text-white mt-0.5">
                    Can You Fix This IT Problem? (10 Scenarios)
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#27d3f0]" />
              </Link>
            </div>
          </div>
        </section>

        {/* Related Issues */}
        <section className="pt-6 border-t border-[#181e31]">
          <h2 className="font-['Sora',sans-serif] text-xl font-bold text-white">
            Related Troubleshooting Runbooks
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            {relatedIssues.map((rel) => (
              <IssueCard key={rel.id} issue={rel} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
