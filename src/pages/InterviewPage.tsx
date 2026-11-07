import React, { useMemo, useState } from 'react';
import { BookOpen, Search, Terminal } from 'lucide-react';
import {
  INTERVIEW_QUESTIONS,
  INTERVIEW_TRACKS,
} from '../data/interviewAndRoadmapData';
import { DifficultyLevel, InterviewTrack } from '../types';
import { usePageSEO } from '../utils/seo';

export const InterviewPage: React.FC = () => {
  const [selectedTrack, setSelectedTrack] = useState<'All' | InterviewTrack>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'All' | DifficultyLevel>('All');
  const [query, setQuery] = useState('');

  usePageSEO({
    title: 'IT Interview Questions & Scenario-Based Answers (L1 to SysAdmin)',
    description:
      'Prepare for L1/L2 Helpdesk, Desktop Support, Networking, Active Directory, Windows Server, Microsoft 365, Linux, Azure, and System Administrator interviews with practical examples.',
    canonicalPath: '/interview-questions',
  });

  const filteredQuestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return INTERVIEW_QUESTIONS.filter((item) => {
      if (selectedTrack !== 'All' && item.track !== selectedTrack) return false;
      if (selectedDifficulty !== 'All' && item.difficulty !== selectedDifficulty)
        return false;
      if (!q) return true;
      return (
        item.question.toLowerCase().includes(q) ||
        item.shortAnswer.toLowerCase().includes(q) ||
        item.practicalExample.toLowerCase().includes(q) ||
        item.track.toLowerCase().includes(q)
      );
    });
  }, [selectedTrack, selectedDifficulty, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="border-b border-[#181e31] pb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
          Career &amp; Technical Hiring Prep
        </p>
        <h1 className="mt-2 font-['Sora',sans-serif] text-2xl sm:text-4xl font-bold text-white">
          IT Support &amp; SysAdmin Interview Questions
        </h1>
        <p className="mt-2 max-w-3xl text-sm sm:text-base text-slate-400">
          Concise technical answers and real production examples across 11 hiring tracks—from L1 Helpdesk to Azure Cloud &amp; Scenario-Based Troubleshooting.
        </p>
      </header>

      {/* Track Selector */}
      <div className="mt-8 space-y-4">
        <div
          role="group"
          aria-label="Filter interview questions by track"
          className="flex flex-wrap gap-2"
        >
          <button
            type="button"
            onClick={() => setSelectedTrack('All')}
            className={`rounded-lg border px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
              selectedTrack === 'All'
                ? 'border-[#8b6cff] bg-[#8b6cff]/15 text-white'
                : 'border-[#1d2338] bg-[#0d101b] text-slate-400 hover:text-white'
            }`}
          >
            All 11 Tracks ({INTERVIEW_QUESTIONS.length})
          </button>
          {INTERVIEW_TRACKS.map((track) => (
            <button
              key={track}
              type="button"
              onClick={() => setSelectedTrack(track)}
              className={`rounded-lg border px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                selectedTrack === track
                  ? 'border-[#27d3f0] bg-[#27d3f0]/15 text-[#27d3f0]'
                  : 'border-[#1d2338] bg-[#0d101b] text-slate-400 hover:text-white'
              }`}
            >
              {track}
            </button>
          ))}
        </div>

        {/* Search & Difficulty */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="relative w-full sm:w-96">
            <label htmlFor="interview-search" className="sr-only">
              Search interview questions
            </label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="interview-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search DHCP DORA, FSMO, 169.254, SELinux, BEC..."
              className="w-full rounded-lg border border-[#242c46] bg-[#0d101b] pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#8b6cff] focus:outline-none"
            />
          </div>

          <div
            role="group"
            aria-label="Filter interview difficulty"
            className="flex items-center gap-2"
          >
            {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setSelectedDifficulty(diff)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer ${
                  selectedDifficulty === diff
                    ? 'border-[#8b6cff] bg-[#8b6cff] text-[#06070d] font-semibold'
                    : 'border-[#1d2338] bg-[#0d101b] text-slate-400 hover:text-white'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-5 text-xs text-slate-400">
        Showing <strong className="text-white tabular-nums">{filteredQuestions.length}</strong>{' '}
        interview questions
      </p>

      {/* Questions List */}
      <div className="mt-5 space-y-5">
        {filteredQuestions.map((q, index) => {
          const diffColor =
            q.difficulty === 'Beginner'
              ? 'text-emerald-400'
              : q.difficulty === 'Intermediate'
              ? 'text-[#27d3f0]'
              : 'text-[#8b6cff]';

          return (
            <article
              key={q.id}
              className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="font-mono text-slate-500">Q{index + 1}</span>
                <span>·</span>
                <span className="font-semibold text-slate-200">{q.track}</span>
                <span>·</span>
                <span className={`font-semibold ${diffColor}`}>{q.difficulty}</span>
              </div>

              <h2 className="font-['Sora',sans-serif] text-base sm:text-lg font-bold text-white leading-snug">
                {q.question}
              </h2>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 pt-1">
                <div className="rounded-lg border border-[#1b2238] bg-[#080a12] p-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#27d3f0]">
                    <BookOpen className="h-3.5 w-3.5" />
                    Direct Technical Answer
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-slate-200">
                    {q.shortAnswer}
                  </p>
                </div>

                <div className="rounded-lg border border-[#1b2238] bg-[#080a12] p-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8b6cff]">
                    <Terminal className="h-3.5 w-3.5" />
                    Real-World Production Example
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">
                    {q.practicalExample}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
