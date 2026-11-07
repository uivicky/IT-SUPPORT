import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Search, Sparkles, Terminal } from 'lucide-react';
import { ALL_ISSUES, DomainGuideConfig } from '../data/issuesIndex';
import { ITCategory } from '../types';
import { searchIssues } from '../utils/searchEngine';
import { CopyButton } from '../components/CopyButton';
import { IssueCard } from '../components/IssueCard';
import { usePageSEO } from '../utils/seo';

interface DomainGuidePageProps {
  guide: DomainGuideConfig;
}

export const DomainGuidePage: React.FC<DomainGuidePageProps> = ({ guide }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ITCategory | 'All'>('All');

  useEffect(() => {
    setSearchQuery('');
    setActiveCategory('All');
  }, [guide.slug]);

  usePageSEO({
    title: guide.title,
    description: guide.metaDescription,
    canonicalPath: guide.route,
  });

  const domainIssues = useMemo(() => {
    const base = ALL_ISSUES.filter((issue) =>
      guide.categories.includes(issue.category)
    );
    return searchIssues(base, {
      query: searchQuery,
      category: activeCategory,
    });
  }, [guide, searchQuery, activeCategory]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="border-b border-[#181e31] pb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
            Enterprise Domain Playbook
          </p>
          <h1 className="mt-2 font-['Sora',sans-serif] text-2xl sm:text-4xl font-bold text-white leading-tight">
            {guide.title}
          </h1>
          <p className="mt-3 text-base text-slate-300 leading-relaxed">
            {guide.subtitle}
          </p>
        </div>

        <Link
          to={`/ai-assistant?q=${encodeURIComponent(
            `Help me diagnose an issue in ${guide.title}`
          )}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-4 py-2.5 text-sm font-semibold text-[#06070d]"
        >
          <Sparkles className="h-4 w-4" />
          <span>Launch AI Diagnostics</span>
        </Link>
      </header>

      {/* Golden Diagnostic Workflow + Pro Checklist */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="lg:col-span-8 rounded-xl border border-[#1d2338] bg-[#0d101b] p-6">
          <h2 className="font-['Sora',sans-serif] text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="h-5 w-5 text-[#8b6cff]" />
            Golden Diagnostic Sequence
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Run these non-destructive baseline checks first before applying invasive changes.
          </p>

          <div className="mt-5 space-y-4">
            {guide.goldenWorkflow.map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-[#1b2238] bg-[#080a12] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {item.stepTitle}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-slate-400">
                      {item.detail}
                    </p>
                  </div>
                  <CopyButton text={item.command} />
                </div>
                <pre className="mt-3 overflow-x-auto rounded-md bg-[#05060b] px-3 py-2 font-mono text-xs text-[#27d3f0]">
                  <code>{item.command}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>

        <aside className="lg:col-span-4 rounded-xl border border-[#1d2338] bg-[#0d101b] p-6 flex flex-col justify-between">
          <div>
            <h2 className="font-['Sora',sans-serif] text-lg font-bold text-white">
              Senior Engineer Rules
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Critical operational guardrails that prevent recurring outages.
            </p>

            <ul className="mt-5 space-y-3.5 text-sm leading-relaxed text-slate-300">
              {guide.proChecklist.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-1" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 border-t border-[#181e31] pt-5">
            <p className="text-xs text-slate-400">
              Need subnetting math or port numbers while working this ticket?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to="/networking-tools"
                className="rounded-lg border border-[#242c46] bg-[#121728] px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-[#27d3f0]"
              >
                Networking Calculators
              </Link>
              <Link
                to="/commands"
                className="rounded-lg border border-[#242c46] bg-[#121728] px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-[#8b6cff]"
              >
                CLI Commands Library
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Domain Runbooks Directory */}
      <section className="mt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-['Sora',sans-serif] text-xl sm:text-2xl font-bold text-white">
              Step-by-Step Troubleshooting Runbooks ({domainIssues.length})
            </h2>
          </div>

          <div className="relative w-full md:w-80">
            <label htmlFor="domain-guide-search" className="sr-only">
              Search within {guide.title}
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="domain-guide-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter issues, error codes, commands..."
              className="w-full rounded-lg border border-[#242c46] bg-[#0d101b] pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#8b6cff] focus:outline-none"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div
          role="group"
          aria-label="Filter guide categories"
          className="mt-5 flex flex-wrap gap-2"
        >
          <button
            type="button"
            onClick={() => setActiveCategory('All')}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              activeCategory === 'All'
                ? 'border-[#8b6cff] bg-[#8b6cff]/15 text-white'
                : 'border-[#1d2338] bg-[#0d101b] text-slate-400 hover:text-white'
            }`}
          >
            All Related Categories
          </button>
          {guide.categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'border-[#27d3f0] bg-[#27d3f0]/15 text-[#27d3f0]'
                  : 'border-[#1d2338] bg-[#0d101b] text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {domainIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </section>
    </div>
  );
};
