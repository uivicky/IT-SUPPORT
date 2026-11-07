import React, { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Columns, Filter, LayoutGrid, RotateCcw, Search, Sparkles } from 'lucide-react';
import { ALL_CATEGORIES, ALL_ISSUES } from '../data/issuesIndex';
import { DifficultyLevel, ITCategory } from '../types';
import {
  getNoResultSuggestions,
  POPULAR_SEARCH_EXAMPLES,
  searchIssues,
} from '../utils/searchEngine';
import { IssueCard } from '../components/IssueCard';
import { QuickDeskExplorer } from '../components/QuickDeskExplorer';
import { usePageSEO } from '../utils/seo';

const DIFFICULTIES: ('All' | DifficultyLevel)[] = [
  'All',
  'Beginner',
  'Intermediate',
  'Advanced',
];

export interface IssuesListPageProps {
  defaultView?: 'desk' | 'grid';
}

export const IssuesListPage: React.FC<IssuesListPageProps> = ({
  defaultView = 'desk',
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const initialCat = (searchParams.get('category') as ITCategory | null) || 'All';
  const initialDiff = (searchParams.get('difficulty') as DifficultyLevel | null) || 'All';
  const paramView = searchParams.get('view');
  const initialView: 'desk' | 'grid' =
    paramView === 'grid' || paramView === 'desk' ? paramView : defaultView;

  const [viewMode, setViewMode] = useState<'desk' | 'grid'>(initialView);
  const [query, setQuery] = useState(initialQ);
  const [selectedCategory, setSelectedCategory] = useState<ITCategory | 'All'>(
    ALL_CATEGORIES.includes(initialCat as ITCategory) ? (initialCat as ITCategory) : 'All'
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'All'>(
    DIFFICULTIES.includes(initialDiff as DifficultyLevel)
      ? (initialDiff as DifficultyLevel)
      : 'All'
  );
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    const paramQ = searchParams.get('q') || '';
    const paramCat = searchParams.get('category') || 'All';
    const paramDiff = searchParams.get('difficulty') || 'All';
    const nextViewParam = searchParams.get('view');
    setQuery(paramQ);
    setSelectedCategory(
      ALL_CATEGORIES.includes(paramCat as ITCategory) ? (paramCat as ITCategory) : 'All'
    );
    setSelectedDifficulty(
      DIFFICULTIES.includes(paramDiff as DifficultyLevel)
        ? (paramDiff as DifficultyLevel)
        : 'All'
    );
    setViewMode(
      nextViewParam === 'grid' || nextViewParam === 'desk'
        ? nextViewParam
        : defaultView
    );
    setVisibleCount(24);
  }, [searchParams, defaultView]);

  const updateFilters = (
    nextQuery: string,
    nextCategory: ITCategory | 'All',
    nextDifficulty: DifficultyLevel | 'All',
    nextView: 'desk' | 'grid' = viewMode
  ) => {
    const next = new URLSearchParams();
    if (nextQuery.trim()) next.set('q', nextQuery.trim());
    if (nextCategory !== 'All') next.set('category', nextCategory);
    if (nextDifficulty !== 'All') next.set('difficulty', nextDifficulty);
    if (nextView !== defaultView) next.set('view', nextView);
    setSearchParams(next, { replace: true });
  };

  usePageSEO({
    title:
      selectedCategory !== 'All'
        ? `${selectedCategory} Troubleshooting Issues (${ALL_ISSUES.length}+ KB)`
        : 'All IT Troubleshooting Issues — 3D Quick Desk & 325+ Runbooks',
    description:
      'Explore 325+ real-world IT troubleshooting solutions in our interactive 3D Split-Pane Quick Desk with inline AI search or filterable card grid.',
    canonicalPath: '/issues',
  });

  const filteredIssues = useMemo(
    () =>
      searchIssues(ALL_ISSUES, {
        query,
        category: selectedCategory,
        difficulty: selectedDifficulty,
      }),
    [query, selectedCategory, selectedDifficulty]
  );

  const fallback = useMemo(() => getNoResultSuggestions(ALL_ISSUES), []);
  const displayedIssues = filteredIssues.slice(0, visibleCount);
  const hasActiveFilters =
    Boolean(query.trim()) || selectedCategory !== 'All' || selectedDifficulty !== 'All';

  const resetAll = () => {
    setQuery('');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    const next = new URLSearchParams();
    if (viewMode !== defaultView) next.set('view', viewMode);
    setSearchParams(next, { replace: true });
    setVisibleCount(24);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 border-b border-[#181e31] pb-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-wider text-[#27d3f0]">
            Interactive Troubleshooting Workspace · {ALL_ISSUES.length} Verified Runbooks
          </p>
          <h1 className="mt-1.5 font-['Sora',sans-serif] text-2xl sm:text-4xl font-bold text-white">
            All IT Troubleshooting Issues
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-slate-400">
            Inspect step-by-step solutions in the 3D Split-Pane Quick Desk with inline AI search, or switch to the full filterable card grid.
          </p>
        </div>

        <div className="flex flex-wrap lg:flex-nowrap items-center gap-3 self-start lg:self-auto shrink-0">
          {/* Segmented View Mode Switcher */}
          <div
            role="group"
            aria-label="Choose issue explorer layout"
            className="inline-flex items-center rounded-xl border border-[#242c46] bg-[#0d101b] p-1"
          >
            <button
              type="button"
              onClick={() => {
                setViewMode('desk');
                updateFilters(query, selectedCategory, selectedDifficulty, 'desk');
              }}
              aria-pressed={viewMode === 'desk'}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'desk'
                  ? 'bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] text-[#06070d]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Columns className="h-4 w-4" />
              <span>3D Quick Desk</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('grid');
                updateFilters(query, selectedCategory, selectedDifficulty, 'grid');
              }}
              aria-pressed={viewMode === 'grid'}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] text-[#06070d]'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>Card Grid ({ALL_ISSUES.length})</span>
            </button>
          </div>

          <Link
            to={
              query.trim()
                ? `/ai-assistant?q=${encodeURIComponent(query.trim())}`
                : '/ai-assistant'
            }
            className="inline-flex items-center gap-2 rounded-xl border border-[#8b6cff]/50 bg-[#141229] px-4 py-2.5 text-xs sm:text-sm font-medium text-white hover:border-[#27d3f0] transition-colors whitespace-nowrap"
          >
            <Sparkles className="h-4 w-4 text-[#27d3f0]" />
            <span>Full AI Tutor</span>
          </Link>
        </div>
      </div>

      {viewMode === 'desk' ? (
        <div className="mt-6">
          <QuickDeskExplorer
            query={query}
            selectedCategory={selectedCategory}
            onQueryChange={(nextQ) => {
              setQuery(nextQ);
              updateFilters(nextQ, selectedCategory, selectedDifficulty, 'desk');
            }}
            onCategoryChange={(nextCat) => {
              setSelectedCategory(nextCat);
              updateFilters(query, nextCat, selectedDifficulty, 'desk');
            }}
          />
        </div>
      ) : (
        <>
          {/* Filter & Search Controls */}
          <div className="mt-8 rounded-xl border border-[#1d2338] bg-[#0d101b] p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <label
              htmlFor="issues-search-input"
              className="block text-xs font-medium text-slate-400 mb-1.5"
            >
              Live Search (Title, Error Code, Symptom, Command)
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="issues-search-input"
                type="search"
                value={query}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuery(val);
                  updateFilters(val, selectedCategory, selectedDifficulty);
                }}
                placeholder="e.g., 0x80070005, Printer offline, ipconfig /flushdns, Kerberos..."
                className="w-full rounded-lg border border-[#242c46] bg-[#080a12] pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#8b6cff] focus:outline-none"
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <label
              htmlFor="issues-category-select"
              className="block text-xs font-medium text-slate-400 mb-1.5"
            >
              Category (25 Domains)
            </label>
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                id="issues-category-select"
                value={selectedCategory}
                onChange={(e) => {
                  const val = e.target.value as ITCategory | 'All';
                  setSelectedCategory(val);
                  updateFilters(query, val, selectedDifficulty);
                }}
                className="w-full rounded-lg border border-[#242c46] bg-[#080a12] pl-9 pr-3 py-2.5 text-sm text-white focus:border-[#8b6cff] focus:outline-none"
              >
                <option value="All">All Categories ({ALL_ISSUES.length})</option>
                {ALL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="lg:col-span-3">
            <span className="block text-xs font-medium text-slate-400 mb-1.5">
              Difficulty Level
            </span>
            <div
              role="group"
              aria-label="Filter by difficulty level"
              className="grid grid-cols-4 rounded-lg border border-[#242c46] bg-[#080a12] p-0.5"
            >
              {DIFFICULTIES.map((diff) => {
                const active = selectedDifficulty === diff;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => {
                      setSelectedDifficulty(diff);
                      updateFilters(query, selectedCategory, diff);
                    }}
                    className={`rounded-md py-2 text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#8b6cff] text-[#06070d] font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {diff === 'Intermediate' ? 'Interm.' : diff}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#181e31] text-xs text-slate-400">
          <p>
            Showing{' '}
            <span className="font-semibold text-white tabular-nums">
              {displayedIssues.length}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-[#27d3f0] tabular-nums">
              {filteredIssues.length}
            </span>{' '}
            matching troubleshooting solutions
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#27d3f0] hover:underline cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Results Grid or No-Result Suggestions */}
      {filteredIssues.length > 0 ? (
        <>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {displayedIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>

          {visibleCount < filteredIssues.length && (
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 24)}
                className="rounded-lg border border-[#2a3352] bg-[#0d101b] px-6 py-2.5 text-sm font-medium text-white hover:border-[#8b6cff] transition-colors cursor-pointer"
              >
                Load 24 More ({filteredIssues.length - visibleCount} remaining)
              </button>
              <button
                type="button"
                onClick={() => setVisibleCount(filteredIssues.length)}
                className="rounded-lg border border-[#1d2338] bg-[#080a12] px-4 py-2.5 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Show All {filteredIssues.length}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-10 rounded-xl border border-[#232b45] bg-[#0d101b] p-8">
          <div className="max-w-2xl">
            <h2 className="font-['Sora',sans-serif] text-xl font-bold text-white">
              No Exact Runbooks Matched &ldquo;{query}&rdquo;
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Try clearing your category/difficulty filter, picking one of the common searches below, or sending your exact error message to IT SUPPORT AI.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {POPULAR_SEARCH_EXAMPLES.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setQuery(suggestion);
                    setSelectedCategory('All');
                    setSelectedDifficulty('All');
                    updateFilters(suggestion, 'All', 'All');
                  }}
                  className="rounded-md border border-[#242c46] bg-[#121728] px-3 py-1.5 text-xs text-slate-200 hover:border-[#27d3f0] cursor-pointer"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <Link
                to={`/ai-assistant?q=${encodeURIComponent(query.trim())}`}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-4 py-2.5 text-sm font-semibold text-[#06070d]"
              >
                <Sparkles className="h-4 w-4" />
                <span>Troubleshoot &ldquo;{query.trim()}&rdquo; with IT SUPPORT AI</span>
              </Link>
            </div>
          </div>

          <div className="mt-10 border-t border-[#181e31] pt-8">
            <h3 className="font-['Sora',sans-serif] text-base font-semibold text-white">
              Popular IT Runbooks You Can Explore
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {fallback.popularIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
