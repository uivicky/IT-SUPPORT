import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Terminal } from 'lucide-react';
import { ITIssue } from '../types';

interface IssueCardProps {
  issue: ITIssue;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const difficultyColor =
    issue.difficulty === 'Beginner'
      ? 'text-emerald-400'
      : issue.difficulty === 'Intermediate'
      ? 'text-[#27d3f0]'
      : 'text-[#8b6cff]';

  const primaryCmd = issue.commands[0]?.command;

  return (
    <Link
      to={`/issues/${issue.slug}`}
      className="group flex flex-col justify-between rounded-xl border border-[#1d2338] bg-[#0d101b] p-5 transition-all duration-200 hover:border-[#8b6cff]/50 hover:bg-[#111524]"
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-medium text-slate-300">{issue.category}</span>
            <span aria-hidden="true">·</span>
            <span className={`font-medium ${difficultyColor}`}>{issue.difficulty}</span>
            <span aria-hidden="true">·</span>
            <span>{issue.estimatedTime}</span>
          </div>
          {issue.errorCode && (
            <span className="font-mono text-xs font-medium text-[#27d3f0]">
              {issue.errorCode}
            </span>
          )}
        </div>

        <h3 className="mt-2.5 font-['Sora',sans-serif] text-base font-semibold leading-snug text-slate-100 transition-colors group-hover:text-[#27d3f0]">
          {issue.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">
          {issue.shortDescription}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-[#181e31] flex items-center justify-between gap-3">
        {primaryCmd ? (
          <div className="flex min-w-0 items-center gap-2 text-xs text-slate-400 font-mono">
            <Terminal className="h-3.5 w-3.5 shrink-0 text-[#8b6cff]" />
            <span className="truncate">{primaryCmd.split('\n')[0]}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-500">Step-by-step fix</span>
        )}
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-slate-300 transition-colors group-hover:text-white">
          Solution
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
};
