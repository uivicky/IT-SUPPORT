import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  RotateCcw,
  Search,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { ALL_CATEGORIES, ALL_ISSUES } from '../data/issuesIndex';
import { AIDiagnosticResponse, ITCategory, ITIssue } from '../types';
import {
  getStagePresetForCategory,
  groupIssuesByCategory,
} from '../utils/quickDeskHelpers';
import { searchIssues } from '../utils/searchEngine';
import { ThreeDiagnosticStage } from './ThreeDiagnosticStage';

interface QuickDeskExplorerProps {
  query: string;
  selectedCategory: ITCategory | 'All';
  onQueryChange: (q: string) => void;
  onCategoryChange: (cat: ITCategory | 'All') => void;
}

interface InlineAiState {
  active: boolean;
  loading: boolean;
  prompt: string;
  answerText: string;
  diagnostic: AIDiagnosticResponse | null;
  error: string | null;
}

export const QuickDeskExplorer: React.FC<QuickDeskExplorerProps> = ({
  query,
  selectedCategory,
  onQueryChange,
  onCategoryChange,
}) => {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string>(
    () => ALL_ISSUES[0].id
  );
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [emptyPromptNotice, setEmptyPromptNotice] = useState<string | null>(null);
  const [aiState, setAiState] = useState<InlineAiState>({
    active: false,
    loading: false,
    prompt: '',
    answerText: '',
    diagnostic: null,
    error: null,
  });

  const filteredIssues = useMemo(
    () =>
      searchIssues(ALL_ISSUES, {
        query,
        category: selectedCategory,
      }),
    [query, selectedCategory]
  );

  const groupedIssues = useMemo(
    () => groupIssuesByCategory(filteredIssues),
    [filteredIssues]
  );

  // Keep selected issue synced when filtering changes if user isn't viewing AI answer
  useEffect(() => {
    if (aiState.active) return;
    if (
      filteredIssues.length > 0 &&
      !filteredIssues.some((item) => item.id === selectedIssueId)
    ) {
      setSelectedIssueId(filteredIssues[0].id);
    }
  }, [filteredIssues, selectedIssueId, aiState.active]);

  const activeIssue: ITIssue = useMemo(() => {
    return (
      ALL_ISSUES.find((i) => i.id === selectedIssueId) ||
      filteredIssues[0] ||
      ALL_ISSUES[0]
    );
  }, [selectedIssueId, filteredIssues]);

  const handleSelectIssue = (issue: ITIssue) => {
    setEmptyPromptNotice(null);
    setAiState((prev) => (prev.active ? { ...prev, active: false } : prev));
    setSelectedIssueId(issue.id);
  };

  const runInlineAiSearch = async (customPrompt?: string) => {
    const promptToAsk = (customPrompt ?? query).trim();
    if (!promptToAsk) {
      setEmptyPromptNotice(
        'Enter an IT problem, error code, or symptom above, then click "Ask AI to find solution".'
      );
      searchInputRef.current?.focus();
      return;
    }

    setEmptyPromptNotice(null);
    if (customPrompt !== undefined && customPrompt !== query) {
      onQueryChange(customPrompt);
    }

    setAiState({
      active: true,
      loading: true,
      prompt: promptToAsk,
      answerText: '',
      diagnostic: null,
      error: null,
    });

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: promptToAsk }),
      });

      const rawText = await response.text();
      let parsed: Record<string, any> = {};
      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = {
          error: `Unexpected server response (HTTP ${response.status}).`,
        };
      }

      if (!response.ok || parsed.error) {
        setAiState({
          active: true,
          loading: false,
          prompt: promptToAsk,
          answerText: '',
          diagnostic: null,
          error:
            parsed.error ||
            'Unable to reach IT SUPPORT AI right now. Browse the 325+ verified solutions on the left.',
        });
        return;
      }

      setAiState({
        active: true,
        loading: false,
        prompt: promptToAsk,
        answerText: String(parsed.answer || ''),
        diagnostic: (parsed.diagnostic as AIDiagnosticResponse) || null,
        error: null,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network request failed';
      setAiState({
        active: true,
        loading: false,
        prompt: promptToAsk,
        answerText: '',
        diagnostic: null,
        error: `Network error: ${msg}`,
      });
    }
  };

  const handleCopyCommand = async (cmd: string) => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopiedCmd(cmd);
      window.setTimeout(() => {
        setCopiedCmd((prev) => (prev === cmd ? null : prev));
      }, 1800);
    } catch {
      // Clipboard API unavailable in restricted contexts
    }
  };

  const stagePreset = aiState.active
    ? getStagePresetForCategory('AI Assistant')
    : getStagePresetForCategory(activeIssue.category);

  const stageCategoryLabel = aiState.active
    ? 'IT SUPPORT AI · Instant Solution'
    : activeIssue.category;

  const stageTitle = aiState.active
    ? aiState.prompt
    : activeIssue.title;

  const stageSubtitleMeta = aiState.active
    ? aiState.diagnostic
      ? `${aiState.diagnostic.severity} Severity · Live Diagnostic`
      : 'Analyzing Symptoms & Safe Fixes'
    : [
        activeIssue.errorCode,
        activeIssue.difficulty,
        activeIssue.estimatedTime,
      ]
        .filter(Boolean)
        .join(' · ');

  return (
    <div
      data-testid="quick-desk-explorer"
      className="overflow-hidden rounded-2xl border border-[#1d243b] bg-[#06070d] shadow-2xl lg:grid lg:grid-cols-[350px_1fr] lg:min-h-[760px]"
    >
      {/* LEFT SIDEBAR: Instant Search + Ask AI + Categorized Issue List */}
      <aside
        aria-label="IT Issues Quick Explorer Sidebar"
        className="flex flex-col border-b border-[#1c233a] bg-[#0e1019] lg:border-b-0 lg:border-r"
      >
        <div className="space-y-2.5 border-b border-[#1c233a] p-3.5 sm:p-4">
          <div className="relative">
            <label htmlFor="quick-desk-search" className="sr-only">
              Search any IT issue
            </label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              ref={searchInputRef}
              id="quick-desk-search"
              type="search"
              value={query}
              onChange={(e) => {
                setEmptyPromptNotice(null);
                onQueryChange(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filteredIssues.length === 0 && query.trim()) {
                  e.preventDefault();
                  runInlineAiSearch();
                }
              }}
              placeholder="Search any IT issue…"
              autoComplete="off"
              className="w-full rounded-[10px] border border-[#242c46] bg-[#06070d] pl-9 pr-3 py-2.5 text-sm text-[#e9ebf7] placeholder:text-[#8a90ab] focus:border-[#27d3f0] focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => runInlineAiSearch()}
            disabled={aiState.loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-[#8b6cff] to-[#5b8cff] px-4 py-2.5 font-['Sora',sans-serif] text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60 transition-opacity cursor-pointer whitespace-nowrap"
          >
            {aiState.loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Finding Solution…</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Ask AI to find solution</span>
              </>
            )}
          </button>

          {emptyPromptNotice && (
            <p
              role="alert"
              className="text-xs text-[#27d3f0] leading-relaxed px-0.5"
            >
              {emptyPromptNotice}
            </p>
          )}

          {/* Compact Domain Filter + Match Count */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <label htmlFor="quick-desk-category" className="sr-only">
              Filter sidebar by category
            </label>
            <select
              id="quick-desk-category"
              value={selectedCategory}
              onChange={(e) =>
                onCategoryChange(e.target.value as ITCategory | 'All')
              }
              className="min-w-0 flex-1 rounded-lg border border-[#202740] bg-[#080a12] px-2.5 py-1.5 text-xs text-slate-300 focus:border-[#8b6cff] focus:outline-none"
            >
              <option value="All">All 25 Categories ({ALL_ISSUES.length})</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {(query.trim() || selectedCategory !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  onQueryChange('');
                  onCategoryChange('All');
                  setEmptyPromptNotice(null);
                }}
                aria-label="Clear sidebar search and category filter"
                className="inline-flex items-center gap-1 rounded-lg border border-[#242c46] bg-[#151827] px-2.5 py-1.5 text-xs font-medium text-[#27d3f0] hover:border-[#27d3f0] cursor-pointer whitespace-nowrap shrink-0"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Categorized Scrollable Issue List */}
        <div className="max-h-[40vh] lg:max-h-[650px] flex-1 overflow-y-auto px-2.5 py-2 pb-5">
          <div className="px-2.5 py-1.5 text-[11px] text-[#8a90ab] flex items-center justify-between">
            <span>
              <strong className="text-slate-200 tabular-nums">
                {filteredIssues.length}
              </strong>{' '}
              matching issues
            </span>
            <span>Click to inspect</span>
          </div>

          {groupedIssues.length > 0 ? (
            groupedIssues.map((group) => (
              <div key={group.category} className="mb-2">
                <h3 className="px-2.5 pt-3 pb-1.5 font-['Sora',sans-serif] text-xs font-semibold text-[#8a90ab]">
                  {group.category}{' '}
                  <span className="font-normal text-slate-500 tabular-nums">
                    ({group.issues.length})
                  </span>
                </h3>
                <div className="space-y-1">
                  {group.issues.map((issue) => {
                    const isSelected =
                      !aiState.active && issue.id === activeIssue.id;
                    return (
                      <button
                        key={issue.id}
                        type="button"
                        onClick={() => handleSelectIssue(issue)}
                        aria-current={isSelected ? 'true' : undefined}
                        className={`block w-full rounded-[10px] border px-3 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-[#27d3f0]/60 bg-[#151827] font-medium text-white shadow-sm'
                            : 'border-transparent text-slate-300 hover:bg-[#151827]/75 hover:text-white'
                        }`}
                      >
                        <span className="block leading-snug">{issue.title}</span>
                        {issue.errorCode && (
                          <span className="mt-0.5 block font-mono text-[11px] text-[#27d3f0]/85">
                            {issue.errorCode}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="px-3 py-8 text-center space-y-3">
              <p className="font-['Sora',sans-serif] text-xs font-semibold text-[#8a90ab]">
                No offline runbook matched &ldquo;{query.trim()}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => runInlineAiSearch()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-3.5 py-2 text-xs font-bold text-[#06070d] cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ask AI for &ldquo;{query.trim().slice(0, 22)}&rdquo;</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT WORKSPACE: Interactive Three.js Stage + Step-by-Step Solution */}
      <section
        aria-label="Selected Issue Solution Workspace"
        className="flex flex-col min-w-0 bg-[#06070d]"
      >
        <ThreeDiagnosticStage
          presetId={stagePreset.id}
          morphKey={aiState.active ? `ai-${aiState.prompt}` : activeIssue.id}
          categoryLabel={stageCategoryLabel}
          title={stageTitle}
          subtitleMeta={stageSubtitleMeta}
        />

        <div className="flex-1 p-5 sm:p-7 max-w-4xl space-y-6">
          {aiState.active ? (
            /* INLINE AI SOLUTION VIEW */
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#181f35] pb-4">
                <p className="text-xs sm:text-sm text-slate-300">
                  Generated live by{' '}
                  <strong className="text-white">IT SUPPORT AI</strong> for your
                  custom query.
                </p>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setAiState((prev) => ({ ...prev, active: false }))
                    }
                    className="rounded-lg border border-[#242c46] bg-[#0e1019] px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-[#27d3f0] hover:text-white cursor-pointer whitespace-nowrap"
                  >
                    ← Back to Issue List
                  </button>
                  <Link
                    to={`/ai-assistant?q=${encodeURIComponent(aiState.prompt)}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#8b6cff]/50 bg-[#15122b] px-3 py-1.5 text-xs font-semibold text-[#27d3f0] hover:border-[#27d3f0] whitespace-nowrap"
                  >
                    <span>Open Multi-Turn AI Tutor</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {aiState.loading ? (
                <div className="rounded-[14px] border border-[#8b6cff]/50 bg-[#0e1019] p-6 flex items-center gap-3.5 text-sm text-slate-200">
                  <Loader2 className="h-5 w-5 animate-spin text-[#27d3f0] shrink-0" />
                  <span>
                    Searching for a verified step-by-step IT solution for &ldquo;
                    {aiState.prompt}&rdquo;…
                  </span>
                </div>
              ) : aiState.error ? (
                <div className="space-y-4">
                  <div className="rounded-[14px] border border-amber-500/40 bg-[#14111a] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-2.5 text-sm text-amber-100">
                      <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">{aiState.error}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => runInlineAiSearch(aiState.prompt)}
                      className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-[#8b6cff]/60 bg-[#1a1633] px-3.5 py-2 text-xs font-semibold text-white hover:border-[#27d3f0] cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-[#27d3f0]" />
                      <span>Retry Live AI</span>
                    </button>
                  </div>

                  {filteredIssues.length > 0 && (
                    <div className="space-y-2.5 pt-1">
                      <h3 className="font-['Sora',sans-serif] text-sm font-semibold text-white">
                        Closest Verified Runbooks for &ldquo;{aiState.prompt}&rdquo;
                      </h3>
                      <div className="space-y-2.5">
                        {filteredIssues.slice(0, 3).map((match) => (
                          <div
                            key={match.id}
                            className="rounded-[14px] border border-[#1f263e] bg-[#0e1019] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-[#27d3f0]">
                                {match.category} · {match.difficulty}
                              </p>
                              <p className="font-['Sora',sans-serif] text-sm font-semibold text-white">
                                {match.title}
                              </p>
                              <p className="text-xs text-slate-400 line-clamp-2">
                                {match.shortDescription}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSelectIssue(match)}
                              className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-3.5 py-2 text-xs font-bold text-[#06070d] hover:opacity-95 cursor-pointer whitespace-nowrap shrink-0"
                            >
                              <span>View {match.solutionSteps.length}-Step Fix</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : aiState.diagnostic ? (
                <div className="space-y-5">
                  <div className="rounded-[14px] border border-[#8b6cff]/45 bg-[#0e1019] p-4 sm:p-5">
                    <p className="text-xs font-semibold text-[#27d3f0]">
                      Diagnostic Summary
                    </p>
                    <p className="mt-1.5 text-sm sm:text-base text-slate-200 leading-relaxed">
                      {aiState.diagnostic.problemSummary}
                    </p>
                  </div>

                  {/* Staggered Numbered Steps (.st style) */}
                  <div className="space-y-3">
                    <h3 className="font-['Sora',sans-serif] text-sm font-semibold text-white">
                      Step-by-Step Fix
                    </h3>
                    {aiState.diagnostic.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3.5 rounded-[14px] border border-[#1f263e] bg-[#0e1019] p-4"
                      >
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#8b6cff] to-[#27d3f0] font-['Sora',sans-serif] text-[13px] font-bold text-[#06070d] tabular-nums">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-[#e9ebf7] leading-relaxed pt-0.5">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Safe CLI Commands */}
                  {aiState.diagnostic.commands.length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className="font-['Sora',sans-serif] text-sm font-semibold text-white">
                        Recommended Safe Commands
                      </h3>
                      <div className="space-y-2.5">
                        {aiState.diagnostic.commands.map((cmd, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl border border-[#202842] bg-[#0a0c15] p-3.5 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-xs text-[#27d3f0]">
                                {cmd.shell} · {cmd.description}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyCommand(cmd.command)}
                                aria-label={`Copy command ${cmd.command}`}
                                className="inline-flex items-center gap-1 rounded-md border border-[#26304f] bg-[#151827] px-2.5 py-1 text-xs text-slate-200 hover:border-[#27d3f0] cursor-pointer whitespace-nowrap shrink-0"
                              >
                                {copiedCmd === cmd.command ? (
                                  <>
                                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3.5 w-3.5" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="overflow-x-auto rounded-lg bg-[#06070d] px-3 py-2 font-mono text-xs sm:text-sm text-emerald-300">
                              <code>{cmd.command}</code>
                            </pre>
                            {cmd.safetyWarning && (
                              <p className="text-xs text-amber-300">
                                Caution: {cmd.safetyWarning}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Quick Prompts */}
                  {aiState.diagnostic.followUpQuestions.length > 0 && (
                    <div className="pt-2 space-y-2">
                      <p className="text-xs font-medium text-slate-400">
                        Follow-up checks:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {aiState.diagnostic.followUpQuestions.map((fq) => (
                          <button
                            key={fq}
                            type="button"
                            onClick={() => runInlineAiSearch(fq)}
                            className="rounded-lg border border-[#252e4c] bg-[#0e1019] px-3 py-1.5 text-xs text-slate-200 hover:border-[#27d3f0] hover:text-white transition-colors cursor-pointer text-left"
                          >
                            {fq}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <pre className="whitespace-pre-wrap rounded-[14px] border border-[#8b6cff] bg-[#0e1019] p-4 font-sans text-sm text-[#e9ebf7] leading-relaxed">
                  {aiState.answerText}
                </pre>
              )}
            </div>
          ) : (
            /* SELECTED KNOWLEDGE BASE ISSUE SOLUTION VIEW */
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#181f35] pb-4">
                <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                  {activeIssue.shortDescription}
                </p>
                <Link
                  to={`/issues/${activeIssue.slug}`}
                  className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#06070d] hover:opacity-95 transition-opacity whitespace-nowrap shrink-0"
                >
                  <span>Full Runbook &amp; Checklist</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Numbered Step-by-Step Solution Cards (matching .st in reference) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-['Sora',sans-serif] text-sm sm:text-base font-semibold text-white">
                    Step-by-Step Solution ({activeIssue.solutionSteps.length}{' '}
                    Steps)
                  </h3>
                  <span className="text-xs text-[#8a90ab] tabular-nums">
                    ID: {activeIssue.id}
                  </span>
                </div>

                {activeIssue.solutionSteps.map((step, index) => (
                  <div
                    key={`${activeIssue.id}-step-${index}`}
                    className="flex items-start gap-3.5 rounded-[14px] border border-[#1f263e] bg-[#0e1019] p-4 transition-colors hover:border-[#2c3659]"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#8b6cff] to-[#27d3f0] font-['Sora',sans-serif] text-[13px] font-bold text-[#06070d] tabular-nums">
                      {index + 1}
                    </span>
                    <p className="text-sm sm:text-[15px] text-[#e9ebf7] leading-relaxed pt-0.5">
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              {/* Copy-Ready CLI Commands */}
              {activeIssue.commands.length > 0 && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-['Sora',sans-serif] text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-[#27d3f0]" />
                      <span>Diagnostic &amp; Fix Commands</span>
                    </h3>
                    <Link
                      to="/commands"
                      className="text-xs font-medium text-[#27d3f0] hover:underline whitespace-nowrap"
                    >
                      Practice in CLI Terminal →
                    </Link>
                  </div>

                  <div className="space-y-2.5">
                    {activeIssue.commands.map((cmd, idx) => (
                      <div
                        key={`${activeIssue.id}-cmd-${idx}`}
                        className="rounded-xl border border-[#1f263e] bg-[#0b0e18] p-3.5 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-slate-400">
                            <strong className="font-mono text-[#27d3f0]">
                              {cmd.shell}
                            </strong>
                            {cmd.note ? ` · ${cmd.note}` : ''}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCommand(cmd.command)}
                            aria-label={`Copy command ${cmd.command}`}
                            className="inline-flex items-center gap-1 rounded-md border border-[#26304f] bg-[#151827] px-2.5 py-1 text-xs font-medium text-slate-200 hover:border-[#27d3f0] cursor-pointer whitespace-nowrap shrink-0"
                          >
                            {copiedCmd === cmd.command ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="overflow-x-auto rounded-lg bg-[#06070d] px-3 py-2 font-mono text-xs sm:text-sm text-emerald-300">
                          <code>{cmd.command}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety Warning (clean all-around border, no thick left bar) */}
              {activeIssue.safetyWarning && (
                <div className="rounded-xl border border-amber-500/35 bg-amber-950/20 p-4 flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-amber-200 leading-relaxed">
                    <strong className="font-semibold text-amber-300">
                      Safety Caution:{' '}
                    </strong>
                    {activeIssue.safetyWarning}
                  </p>
                </div>
              )}

              {/* Symptoms, Root Causes & Expected Verification */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-1">
                <div className="rounded-xl border border-[#1c233a] bg-[#0e1019] p-4 space-y-2">
                  <h4 className="font-['Sora',sans-serif] text-xs font-semibold text-[#27d3f0]">
                    Common Symptoms
                  </h4>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                    {activeIssue.symptoms.map((sym, i) => (
                      <li key={i} className="leading-relaxed">
                        • {sym}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-[#1c233a] bg-[#0e1019] p-4 space-y-2">
                  <h4 className="font-['Sora',sans-serif] text-xs font-semibold text-[#8b6cff]">
                    Likely Root Causes
                  </h4>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                    {activeIssue.possibleCauses.map((cause, i) => (
                      <li key={i} className="leading-relaxed">
                        • {cause}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-[#1c2a38] bg-[#0a121b] p-4 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  <strong className="text-emerald-300">Expected Result: </strong>
                  {activeIssue.expectedResult}
                </p>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};
