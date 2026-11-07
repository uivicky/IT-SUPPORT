import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Languages,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
  Terminal,
  Wrench,
} from 'lucide-react';
import { ALL_ISSUES } from '../data/issuesIndex';
import { AIDiagnosticResponse, ChatMessage, ITIssue } from '../types';
import { searchIssues } from '../utils/searchEngine';
import { CopyButton } from '../components/CopyButton';
import { usePageSEO } from '../utils/seo';

const TROUBLESHOOT_PROMPTS = [
  'Windows 11 Update fails with 0x80070005 Access Denied even after reboot',
  'Domain user account locks out every 15 minutes in Active Directory',
  'Laptop connected to corporate WiFi but internal DNS hostnames do not resolve',
  'Linux Ubuntu server df -h shows 100% full on / but du only shows 35% used',
  'Outlook stuck on Trying to connect after enabling Microsoft 365 MFA',
  'IPSec VPN connects and ping works, but HTTPS websites and SMB shares hang',
];

const TUTOR_PROMPTS = [
  'Explain IP address like I am a beginner.',
  'What is DNS?',
  'Teach me Active Directory.',
  'Why do we use DHCP?',
  'Explain the OSI model with examples.',
  'How can I become an IT Support Engineer?',
  'Give me a networking quiz.',
  'Explain this error code: 0x80070005',
];

type LearnerLevel = 'beginner' | 'student' | 'advanced';

export const AIAssistantPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState<'troubleshoot' | 'tutor'>(() =>
    searchParams.get('mode') === 'tutor' ? 'tutor' : 'troubleshoot'
  );
  const [learnerLevel, setLearnerLevel] = useState<LearnerLevel>('beginner');
  const [hinglish, setHinglish] = useState<boolean>(false);
  const [input, setInput] = useState(searchParams.get('q') || '');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<ITIssue[]>(() =>
    ALL_ISSUES.slice(0, 5)
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  usePageSEO({
    title: 'IT SUPPORT AI — Mode 1: IT Troubleshooting & Mode 2: IT Learning Teacher',
    description:
      'Switch between MODE 1: IT TROUBLESHOOTING and MODE 2: IT LEARNING TEACHER with adaptive beginner/student/engineer explanations and safe CLI guardrails.',
    canonicalPath: '/ai-assistant',
  });

  useEffect(() => {
    fetch('/api/health')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.aiConfigured === 'boolean') {
          setAiConfigured(data.aiConfigured);
        }
      })
      .catch(() => {
        // Keep null until first submit
      });
  }, []);

  useEffect(() => {
    const qParam = searchParams.get('q');
    const modeParam = searchParams.get('mode');
    if (modeParam === 'tutor' || modeParam === 'troubleshoot') {
      setMode(modeParam);
    }
    if (qParam) {
      setInput(qParam);
      const matched = searchIssues(ALL_ISSUES, { query: qParam }).slice(0, 5);
      if (matched.length > 0) setRelatedArticles(matched);
    }
  }, [searchParams]);

  const submitQuery = async (rawProblem: string) => {
    const cleanProblem = rawProblem.trim();
    if (!cleanProblem || loading) return;

    const kbMatches = searchIssues(ALL_ISSUES, { query: cleanProblem }).slice(0, 5);
    if (kbMatches.length > 0) {
      setRelatedArticles(kbMatches);
    }

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: cleanProblem,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    if (searchParams.has('q')) {
      setSearchParams({}, { replace: true });
    }
    setLoading(true);

    try {
      const response = await fetch('/api/ai/troubleshoot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanProblem,
          mode,
          learnerLevel,
          hinglish,
          history: messages
            .filter((m) => m.role !== 'error')
            .slice(-6)
            .map((m) => ({
              role: m.role,
              content: m.diagnostic ? m.diagnostic.problemSummary : m.content,
            })),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (typeof data.configured === 'boolean') {
        setAiConfigured(data.configured);
      }

      if (!response.ok || !data.diagnostic) {
        const errText =
          data.error ||
          'IT SUPPORT AI could not process the request right now. Check the matched Knowledge Base runbooks in the sidebar.';
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'error',
            content: errText,
            relatedSlugs: kbMatches.map((m) => m.slug),
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ]);
      } else {
        const diag = data.diagnostic as AIDiagnosticResponse;
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: diag.problemSummary,
            diagnostic: diag,
            relatedSlugs: kbMatches.map((m) => m.slug),
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'error',
          content:
            'Network connection to /api/ai/troubleshoot failed. Ensure the backend server is running and GEMINI_API_KEY is configured on the server.',
          relatedSlugs: kbMatches.map((m) => m.slug),
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
    } finally {
      setLoading(false);
      window.setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setInput('');
    setRelatedArticles(ALL_ISSUES.slice(0, 5));
  };

  const activePrompts = mode === 'tutor' ? TUTOR_PROMPTS : TROUBLESHOOT_PROMPTS;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header + Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 border-b border-[#181e31] pb-6">
        <div>
          <p className="text-xs font-semibold tracking-wide text-[#27d3f0]">
            Dual-Mode AI IT Teacher &amp; Senior Troubleshooting Engineer · Safe CLI Guardrails
          </p>
          <h1 className="mt-2 font-['Sora',sans-serif] text-2xl sm:text-4xl font-bold text-white flex items-center gap-2.5">
            <Sparkles className="h-7 w-7 text-[#8b6cff]" />
            <span>IT SUPPORT AI</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl">
            {mode === 'tutor'
              ? 'MODE 2 — IT LEARNING TEACHER: Learn any IT topic with simple words, real-life analogies, adaptive difficulty, and interactive check questions.'
              : 'MODE 1 — IT TROUBLESHOOTING: Diagnose error codes, Event IDs, and broken systems with structured root-cause steps and safe CLI commands.'}
          </p>
        </div>

        {/* Mode, Adaptive Difficulty & Language Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            role="group"
            aria-label="Choose AI assistant mode"
            className="inline-flex rounded-xl border border-[#242d4c] bg-[#0a0d18] p-1"
          >
            <button
              type="button"
              onClick={() => setMode('troubleshoot')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                mode === 'troubleshoot'
                  ? 'bg-[#8b6cff] text-[#06070d]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Wrench className="h-3.5 w-3.5 shrink-0" />
              <span>MODE 1: IT Troubleshooting</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('tutor')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                mode === 'tutor'
                  ? 'bg-[#27d3f0] text-[#06070d]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              <span>MODE 2: IT Learning Teacher</span>
            </button>
          </div>

          {mode === 'tutor' && (
            <label className="inline-flex items-center gap-1.5 rounded-lg border border-[#242d4c] bg-[#0d101b] px-2.5 py-1.5 text-xs text-slate-300">
              <span className="text-slate-400">Level:</span>
              <select
                aria-label="Adaptive teacher difficulty level"
                value={learnerLevel}
                onChange={(e) => setLearnerLevel(e.target.value as LearnerLevel)}
                className="bg-transparent font-semibold text-[#27d3f0] focus:outline-none cursor-pointer"
              >
                <option value="beginner" className="bg-[#0d101b] text-white">
                  Absolute Beginner
                </option>
                <option value="student" className="bg-[#0d101b] text-white">
                  IT Student
                </option>
                <option value="advanced" className="bg-[#0d101b] text-white">
                  Advanced Engineer
                </option>
              </select>
            </label>
          )}

          <button
            type="button"
            onClick={() => setHinglish((p) => !p)}
            aria-pressed={hinglish}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
              hinglish
                ? 'border-[#27d3f0] bg-[#27d3f0]/15 text-[#27d3f0]'
                : 'border-[#242d4c] bg-[#0d101b] text-slate-300 hover:border-[#8b6cff]'
            }`}
          >
            <Languages className="h-3.5 w-3.5" />
            <span>{hinglish ? 'Hinglish: ON' : 'Hinglish'}</span>
          </button>

          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClearChat}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#242c46] bg-[#0d101b] px-3 py-2 text-xs font-medium text-slate-300 hover:border-[#8b6cff] hover:text-white cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Unconfigured Server Key Notice */}
      {aiConfigured === false && (
        <div
          role="status"
          className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 flex items-start gap-3"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="text-sm text-amber-100">
            <p className="font-semibold text-amber-300">
              Server Configuration Notice: GEMINI_API_KEY Not Detected
            </p>
            <p className="mt-1 text-amber-100/90 leading-relaxed">
              Live AI generation uses a secure server-side Gemini endpoint and never exposes keys in the browser. Configure <code className="font-mono text-amber-200">GEMINI_API_KEY</code> in your server environment (AI Studio Secrets or Vercel Environment Variables) to activate live responses. Matching offline runbooks and our 25 Beginner Lessons remain 100% available!
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Chat Column */}
        <div className="lg:col-span-8 flex flex-col rounded-xl border border-[#1d2338] bg-[#0d101b] overflow-hidden">
          <div className="flex-1 p-5 sm:p-6 space-y-6 min-h-[440px]">
            {messages.length === 0 ? (
              <div className="py-6">
                <h2 className="font-['Sora',sans-serif] text-lg font-semibold text-white">
                  {mode === 'tutor'
                    ? 'What IT concept would you like me to teach you today?'
                    : 'What IT problem are you troubleshooting today?'}
                </h2>
                <p className="mt-1.5 text-sm text-slate-400">
                  {mode === 'tutor'
                    ? 'Pick a beginner-friendly topic below or ask anything in your own words:'
                    : 'Select an example ticket below or describe your exact environment symptoms:'}
                </p>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {activePrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => submitQuery(prompt)}
                      className="text-left rounded-xl border border-[#1e2640] bg-[#080a12] p-4 text-sm text-slate-200 transition-colors hover:border-[#8b6cff]/60 hover:bg-[#111526] cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                if (msg.role === 'user') {
                  return (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-2xl rounded-xl border border-[#8b6cff]/40 bg-[#171430] px-4 py-3 text-sm text-white">
                        <p className="leading-relaxed">{msg.content}</p>
                        <span className="mt-1.5 block text-[11px] text-slate-400 text-right">
                          You · {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                }

                if (msg.role === 'error') {
                  return (
                    <div
                      key={msg.id}
                      role="alert"
                      className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 text-sm text-amber-100"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-300">
                            IT SUPPORT AI Configuration / Service Alert
                          </p>
                          <p className="mt-1 leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                }

                const diag = msg.diagnostic;
                if (!diag) return null;

                return (
                  <div
                    key={msg.id}
                    className="rounded-xl border border-[#242d4a] bg-[#080a12] p-5 sm:p-6 space-y-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#181f35] pb-3 text-xs text-slate-400">
                      <span className="font-semibold text-[#27d3f0]">
                        {mode === 'tutor'
                          ? 'IT SUPPORT AI · Personal Tutor Lesson'
                          : 'IT SUPPORT AI · Diagnostic Report'}
                      </span>
                      <span>
                        {mode === 'tutor' ? (
                          <span>Beginner Friendly · {msg.timestamp}</span>
                        ) : (
                          <>
                            Severity: <strong className="text-white">{diag.severity}</strong> ·{' '}
                            {msg.timestamp}
                          </>
                        )}
                      </span>
                    </div>

                    {/* Summary / Definition */}
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {mode === 'tutor'
                          ? 'Simple Explanation & Analogy'
                          : 'Problem Identification'}
                      </h3>
                      <p className="mt-1.5 text-sm sm:text-base font-medium text-white leading-relaxed">
                        {diag.problemSummary}
                      </p>
                    </div>

                    {/* Causes / Building Blocks */}
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {mode === 'tutor' ? 'Key Building Blocks' : 'Possible Causes'}
                      </h3>
                      <ul className="mt-2 space-y-1.5 text-sm text-slate-300">
                        {diag.possibleCauses.map((cause, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8b6cff]" />
                            <span>{cause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Step-by-Step */}
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {mode === 'tutor' ? 'How It Works Step-by-Step' : 'Step-by-Step Solution'}
                      </h3>
                      <ol className="mt-2.5 space-y-2.5 text-sm text-slate-200">
                        {diag.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-[#151b2e] font-mono text-xs text-[#27d3f0]">
                              {idx + 1}
                            </span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Commands */}
                    {diag.commands && diag.commands.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <Terminal className="h-3.5 w-3.5 text-[#8b6cff]" />
                          Recommended Commands
                        </h3>
                        <div className="mt-2.5 space-y-3">
                          {diag.commands.map((cmd, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg border border-[#1d2540] bg-[#05060b] overflow-hidden"
                            >
                              <div className="flex items-center justify-between gap-2 border-b border-[#151b30] bg-[#0c0f1d] px-3.5 py-2">
                                <span className="text-xs text-slate-300">
                                  <strong className="font-mono text-[#27d3f0]">
                                    {cmd.shell}
                                  </strong>{' '}
                                  · {cmd.description}
                                </span>
                                <CopyButton text={cmd.command} />
                              </div>
                              <pre className="overflow-x-auto p-3.5 font-mono text-xs sm:text-sm text-slate-100">
                                <code>{cmd.command}</code>
                              </pre>
                              {cmd.safetyWarning && (
                                <div className="border-t border-amber-500/20 bg-amber-500/10 px-3.5 py-2 text-xs text-amber-200 flex items-start gap-2">
                                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
                                  <span>{cmd.safetyWarning}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expected Result / Key Takeaway */}
                    <div className="rounded-lg border border-[#1a2238] bg-[#0d101b] p-3.5">
                      <h3 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {mode === 'tutor' ? 'Key Takeaway' : 'Expected Result'}
                      </h3>
                      <p className="mt-1 text-sm text-slate-300">{diag.expectedResult}</p>
                    </div>

                    {/* Further Checks / Mistakes */}
                    {diag.furtherTroubleshooting?.length > 0 && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          {mode === 'tutor'
                            ? 'Common Mistakes to Avoid'
                            : 'Further Escalation Checks'}
                        </h3>
                        <ul className="mt-2 space-y-1.5 text-sm text-slate-300">
                          {diag.furtherTroubleshooting.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#27d3f0]" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Clickable Follow-up Questions */}
                    {diag.followUpQuestions?.length > 0 && (
                      <div className="pt-2 border-t border-[#181f35]">
                        <p className="text-xs font-medium text-slate-400 mb-2">
                          Keep exploring:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {diag.followUpQuestions.map((fq, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => submitQuery(fq)}
                              className="rounded-lg border border-[#242d4a] bg-[#111526] px-3 py-1.5 text-xs text-slate-200 hover:border-[#27d3f0] cursor-pointer text-left"
                            >
                              {fq}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {loading && (
              <div className="flex items-center gap-3 rounded-xl border border-[#242c46] bg-[#080a12] p-4 text-sm text-slate-300">
                <Loader2 className="h-4 w-4 animate-spin text-[#27d3f0]" />
                <span>
                  {mode === 'tutor'
                    ? 'Preparing a clear step-by-step explanation & real-life analogy...'
                    : 'Analyzing symptoms, event codes, and safe remediation steps...'}
                </span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitQuery(input);
            }}
            className="border-t border-[#181e31] bg-[#090b14] p-4"
          >
            <label htmlFor="ai-problem-input" className="sr-only">
              Ask IT SUPPORT AI
            </label>
            <div className="flex items-end gap-3">
              <textarea
                id="ai-problem-input"
                rows={2}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  const live = searchIssues(ALL_ISSUES, { query: e.target.value }).slice(0, 5);
                  if (live.length > 0) setRelatedArticles(live);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submitQuery(input);
                  }
                }}
                placeholder={
                  mode === 'tutor'
                    ? 'Ask any IT question (e.g., "How does DHCP work?" or "What is RAM vs SSD?")...'
                    : 'Describe the IT issue, OS, error code, or what you already tried...'
                }
                className="w-full resize-none rounded-lg border border-[#242c46] bg-[#0d101b] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#8b6cff] focus:outline-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-lg px-5 text-sm font-semibold transition-all ${
                  loading || !input.trim()
                    ? 'border border-[#242c46] bg-[#14192b] text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] text-[#06070d] hover:opacity-95 cursor-pointer'
                }`}
              >
                <Send className="h-4 w-4" />
                <span>{mode === 'tutor' ? 'Explain' : 'Diagnose'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Related Knowledge Base + Learning Links Sidebar */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-5">
            <h2 className="font-['Sora',sans-serif] text-base font-bold text-white">
              Related Knowledge Base Articles
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Verified offline solutions matched from our 325+ IT runbooks:
            </p>

            <ul className="mt-4 divide-y divide-[#181e31]">
              {relatedArticles.map((art) => (
                <li key={art.id} className="py-3 first:pt-0 last:pb-0">
                  <Link to={`/issues/${art.slug}`} className="group block">
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                      <span>{art.category}</span>
                      {art.errorCode && (
                        <span className="font-mono text-[#27d3f0]">{art.errorCode}</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-200 group-hover:text-[#27d3f0] transition-colors flex items-start justify-between gap-2">
                      <span>{art.title}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-500 group-hover:text-[#27d3f0]" />
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-[#242e4e] bg-gradient-to-br from-[#14182d] to-[#0d101b] p-5 space-y-3">
            <h3 className="font-['Sora',sans-serif] text-sm font-bold text-white">
              Prefer Visual Interactive Learning?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Explore our animated packet simulations, 25 beginner lessons, and live ticket simulator:
            </p>
            <div className="grid grid-cols-1 gap-2 text-xs font-semibold">
              <Link
                to="/beginners"
                className="rounded-lg border border-[#263154] bg-[#090c16] px-3 py-2 text-[#27d3f0] hover:border-[#27d3f0]"
              >
                → 25 Beginner Lessons (From Zero)
              </Link>
              <Link
                to="/learning-lab"
                className="rounded-lg border border-[#263154] bg-[#090c16] px-3 py-2 text-white hover:border-[#8b6cff]"
              >
                → Visual IT Learning Lab (8 Flows)
              </Link>
              <Link
                to="/simulator"
                className="rounded-lg border border-[#263154] bg-[#090c16] px-3 py-2 text-white hover:border-[#8b6cff]"
              >
                → Real-World IT Simulator (10 Tickets)
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
