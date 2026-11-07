import React, { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Play,
  RotateCcw,
  Search,
  Shield,
  Terminal,
} from 'lucide-react';
import { COMMANDS_LIBRARY } from '../data/commandsData';
import { CommandLibraryItem } from '../types';
import { CopyButton } from '../components/CopyButton';
import {
  executeSimulatedCommand,
  PRACTICE_TERMINAL_SUGGESTIONS,
  SimulatedCommandResult,
} from '../utils/terminalSimulator';
import { useLearningProgress } from '../hooks/useLearningProgress';
import { usePageSEO } from '../utils/seo';

type TrainerCategory =
  | 'All'
  | 'Beginner CMD'
  | 'Networking CMD'
  | 'Windows Administration'
  | 'PowerShell'
  | 'Active Directory'
  | 'Linux';

const TRAINER_CATEGORIES: TrainerCategory[] = [
  'All',
  'Beginner CMD',
  'Networking CMD',
  'Windows Administration',
  'PowerShell',
  'Active Directory',
  'Linux',
];

const BEGINNER_CMD_LIST = [
  'ipconfig',
  'ipconfig /all',
  'ipconfig /flushdns',
  'ping',
  'whoami',
  'gpupdate',
  'tasklist',
];

function getTrainerCategoriesForCommand(item: CommandLibraryItem): TrainerCategory[] {
  const cats = new Set<TrainerCategory>();
  const baseCmd = item.command.toLowerCase();

  if (BEGINNER_CMD_LIST.some((b) => baseCmd === b || baseCmd.startsWith(`${b} `))) {
    cats.add('Beginner CMD');
  }

  if (
    item.platform === 'Networking' ||
    baseCmd.startsWith('ipconfig') ||
    baseCmd.startsWith('ping') ||
    baseCmd.startsWith('tracert') ||
    baseCmd.startsWith('nslookup') ||
    baseCmd.startsWith('netstat') ||
    baseCmd.startsWith('test-netconnection')
  ) {
    cats.add('Networking CMD');
  }

  if (item.platform === 'Windows CMD') {
    cats.add('Windows Administration');
  }

  if (item.platform === 'PowerShell') {
    cats.add('PowerShell');
  }

  if (item.platform === 'Active Directory' || baseCmd.includes('aduser') || baseCmd.includes('dcdiag') || baseCmd.includes('repadmin') || baseCmd.includes('gpupdate') || baseCmd.includes('gpresult')) {
    cats.add('Active Directory');
  }

  if (item.platform === 'Linux') {
    cats.add('Linux');
  }

  return Array.from(cats);
}

function getWhenToUseGuidance(cmd: CommandLibraryItem): {
  whyEngineersUseIt: string;
  whenToUseIt: string;
} {
  const lower = cmd.command.toLowerCase();
  if (lower.startsWith('ipconfig')) {
    return {
      whyEngineersUseIt:
        'Instantly reveals whether a PC has a valid IP lease, gateway, and DNS server before touching cables or routers.',
      whenToUseIt:
        'Run first whenever a user reports "No Internet", "WiFi connected with warning icon", or stale website lookups.',
    };
  }
  if (lower.startsWith('ping') || lower.startsWith('tracert') || lower.startsWith('nslookup') || lower.startsWith('netstat') || lower.startsWith('test-netconnection')) {
    return {
      whyEngineersUseIt:
        'Separates cable/WiFi problems (Layer 1/2), IP routing problems (Layer 3), firewall port blocks (Layer 4), and DNS failures.',
      whenToUseIt:
        'Use when websites, VPNs, internal servers, or shared folders fail to load or feel laggy.',
    };
  }
  if (cmd.platform === 'Active Directory') {
    return {
      whyEngineersUseIt:
        'Audits Domain Controller health, user account lockouts, Kerberos replication, and Group Policy application without guessing.',
      whenToUseIt:
        'Use during login failures, Event ID 4740 account lockouts, or missing mapped drives/printers.',
    };
  }
  if (cmd.platform === 'Linux') {
    return {
      whyEngineersUseIt:
        'Inspects live Linux server disks, RAM cache, systemd daemons, sockets, and kernel logs safely over SSH.',
      whenToUseIt:
        'Use when a Linux VM/container slows down, runs out of disk space, or a web service stops responding.',
    };
  }
  return {
    whyEngineersUseIt: `Provides reliable ${cmd.platform} telemetry and safe built-in OS repair without third-party tools.`,
    whenToUseIt: `Run with ${cmd.permissions} access when diagnosing system errors, service crashes, or OS corruption.`,
  };
}

interface TerminalHistoryEntry {
  id: string;
  input: string;
  result: SimulatedCommandResult;
}

export const CommandsPage: React.FC = () => {
  const [category, setCategory] = useState<TrainerCategory>('All');
  const [query, setQuery] = useState('');
  const [termInput, setTermInput] = useState('');
  const [history, setHistory] = useState<TerminalHistoryEntry[]>(() => [
    {
      id: 'welcome-0',
      input: 'ipconfig',
      result: executeSimulatedCommand('ipconfig'),
    },
  ]);

  const terminalRef = useRef<HTMLDivElement>(null);
  const { progress, practiceCommand } = useLearningProgress();

  usePageSEO({
    title: 'Visual IT Commands Trainer & CLI Library — IT SUPPORT',
    description:
      'Beginner-friendly Windows CMD, Networking CMD, Windows Administration, PowerShell, Active Directory, and Linux commands trainer with a safe simulated practice terminal.',
    canonicalPath: '/commands',
  });

  const runInSimulator = (cmdText: string) => {
    const res = executeSimulatedCommand(cmdText);
    if (res.clearScreen) {
      setHistory([]);
      setTermInput('');
      return;
    }

    if (res.recognized && res.canonicalKey) {
      practiceCommand(res.canonicalKey);
    }

    setHistory((prev) => [
      ...prev.slice(-7),
      {
        id: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        input: cmdText,
        result: res,
      },
    ]);
    setTermInput('');
  };

  const scrollAndRun = (exampleCmd: string) => {
    runInSimulator(exampleCmd);
    terminalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COMMANDS_LIBRARY.filter((item) => {
      if (category !== 'All') {
        const cats = getTrainerCategoriesForCommand(item);
        if (!cats.includes(category)) return false;
      }
      if (!q) return true;
      return (
        item.command.toLowerCase().includes(q) ||
        item.purpose.toLowerCase().includes(q) ||
        item.example.toLowerCase().includes(q) ||
        item.explanation.toLowerCase().includes(q) ||
        item.platform.toLowerCase().includes(q)
      );
    });
  }, [category, query]);

  const latestEntry = history[history.length - 1] || null;
  const practicedCount = progress.practicedCommands.length;
  const commandMasterUnlocked = progress.earnedBadgeIds.includes('command-master');

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      <header className="border-b border-[#181e31] pb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
          VISUAL IT COMMANDS TRAINER · BEGINNER TO SYSADMIN CLI GUIDE
        </p>
        <h1 className="mt-2 font-['Sora',sans-serif] text-2xl sm:text-4xl font-bold text-white">
          Visual IT Commands Trainer &amp; Practice Terminal
        </h1>
        <p className="mt-2 max-w-3xl text-sm sm:text-base text-slate-400">
          Every command below explains what it does, why engineers use it, when to run it, and what every output field means—plus a 100% safe simulated practice terminal.
        </p>
      </header>

      {/* Interactive Simulated Practice Terminal */}
      <section
        ref={terminalRef}
        aria-label="Interactive Simulated Practice Terminal"
        className="rounded-2xl border border-[#242e4e] bg-[#0b0e1a] overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1a223b] bg-[#101528] px-5 py-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
              SIMULATED PRACTICE TERMINAL · SAFE BROWSER SANDBOX (NO REAL OS EXECUTION)
            </span>
            <h2 className="mt-0.5 font-['Sora',sans-serif] text-lg font-bold text-white flex items-center gap-2">
              <Terminal className="h-5 w-5 text-[#8b6cff]" />
              <span>Interactive Command Simulator</span>
            </h2>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 font-mono text-slate-300 tabular-nums">
              <Award
                className={`h-4 w-4 ${
                  commandMasterUnlocked ? 'text-emerald-400' : 'text-[#8b6cff]'
                }`}
              />
              {commandMasterUnlocked
                ? 'Command Master Badge Unlocked!'
                : `${Math.min(practicedCount, 5)} / 5 Commands for Command Master`}
            </span>
            <button
              type="button"
              onClick={() => setHistory([])}
              className="inline-flex items-center gap-1 rounded-lg border border-[#263154] bg-[#090c16] px-2.5 py-1.5 text-slate-300 hover:border-[#27d3f0] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Quick-Try Command Buttons */}
        <div className="border-b border-[#171f36] bg-[#0d1120] px-5 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Click a command or type below to view simulated output &amp; field explanations (+15 XP per new command):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PRACTICE_TERMINAL_SUGGESTIONS.map((suggestion) => {
              const cleanKey = suggestion.split(' ')[0].toLowerCase();
              const practiced = progress.practicedCommands.some((p) =>
                p.startsWith(cleanKey)
              );
              return (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => runInSimulator(suggestion)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs transition-colors cursor-pointer ${
                    practiced
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200 hover:border-emerald-400'
                      : 'border-[#242e4e] bg-[#080a12] text-[#27d3f0] hover:border-[#8b6cff]'
                  }`}
                >
                  {practiced && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                  <span>{suggestion}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Split Simulated Console + Plain-English Output Decoder */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-[#182038] bg-[#05070e] p-5 flex flex-col justify-between min-h-[290px]">
            <div className="space-y-4 max-h-72 overflow-y-auto font-mono text-xs sm:text-sm">
              {history.length === 0 ? (
                <p className="text-slate-500">
                  Simulated terminal cleared. Click a command above or type `ipconfig` and press Enter.
                </p>
              ) : (
                history.map((entry) => (
                  <div key={entry.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="text-[#8b6cff] font-semibold text-xs sm:text-sm">
                        PS C:\ITSupport&gt; <span className="text-white">{entry.input}</span>
                      </span>
                      <span>[SIMULATED OUTPUT · {entry.result.shellLabel}]</span>
                    </div>
                    <pre className="whitespace-pre-wrap text-slate-200 leading-relaxed overflow-x-auto">
                      <code>{entry.result.output}</code>
                    </pre>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!termInput.trim()) return;
                runInSimulator(termInput);
              }}
              className="mt-4 pt-3 border-t border-[#151c32] flex items-center gap-2"
            >
              <label htmlFor="practice-terminal-input" className="font-mono text-xs text-[#27d3f0] shrink-0">
                SIM&gt;
              </label>
              <input
                id="practice-terminal-input"
                type="text"
                value={termInput}
                onChange={(e) => setTermInput(e.target.value)}
                placeholder="Type ipconfig, ping 8.8.8.8, df -h, or help..."
                className="w-full bg-transparent font-mono text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-gradient-to-r from-[#8b6cff] to-[#27d3f0] px-3.5 py-1.5 text-xs font-semibold text-[#06070d] hover:opacity-95 cursor-pointer shrink-0"
              >
                Simulate
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 bg-[#0a0d18] p-5 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#27d3f0]">
              What Does This Output Mean?
            </span>
            {latestEntry ? (
              <>
                <h3 className="font-['Sora',sans-serif] text-base font-bold text-white">
                  Field-by-Field Breakdown: `{latestEntry.input}`
                </h3>
                <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                  {latestEntry.result.meaningBreakdown.map((line, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#27d3f0]" />
                      <span className="leading-relaxed">{line}</span>
                    </li>
                  ))}
                </ul>
                {latestEntry.result.safetyNote && (
                  <div className="rounded-lg border border-amber-500/35 bg-amber-500/10 p-3 text-xs text-amber-200 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                    <span>{latestEntry.result.safetyNote}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Run any command in the simulator to decode every important field in plain English.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Command Categories Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
        <div
          role="group"
          aria-label="Filter commands by learning category"
          className="flex flex-wrap gap-2"
        >
          {TRAINER_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`rounded-lg border px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                category === cat
                  ? 'border-[#8b6cff] bg-[#8b6cff]/15 text-white'
                  : 'border-[#1d2338] bg-[#0d101b] text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-80">
          <label htmlFor="commands-search" className="sr-only">
            Search CLI commands
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="commands-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ipconfig, DISM, Get-ADUser, df -h..."
            className="w-full rounded-lg border border-[#242c46] bg-[#0d101b] pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-[#8b6cff] focus:outline-none"
          />
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Showing <strong className="text-white tabular-nums">{filteredCommands.length}</strong>{' '}
        commands in <strong className="text-[#27d3f0]">{category}</strong>
      </p>

      {/* Beginner-Friendly Command Cards (All 7 Required Fields) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredCommands.map((cmd) => {
          const guidance = getWhenToUseGuidance(cmd);
          return (
            <article
              key={cmd.id}
              className="rounded-xl border border-[#1d2338] bg-[#0d101b] p-6 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="font-semibold text-[#27d3f0]">{cmd.platform}</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 text-slate-300">
                        <Shield className="h-3.5 w-3.5 text-[#8b6cff]" />
                        {cmd.permissions}
                      </span>
                    </div>
                    <h2 className="mt-1.5 font-mono text-lg font-bold text-white flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-[#8b6cff] shrink-0" />
                      <span>{cmd.command}</span>
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => scrollAndRun(cmd.command.split(' ')[0])}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#263154] bg-[#12172a] px-2.5 py-1.5 text-xs font-medium text-[#27d3f0] hover:border-[#27d3f0] cursor-pointer"
                    >
                      <Play className="h-3 w-3" />
                      <span>Simulate</span>
                    </button>
                    <CopyButton text={cmd.example} label="Copy" />
                  </div>
                </div>

                {/* 1. What does it do? / 2. Why engineers use it? / 3. When should it be used? */}
                <div className="space-y-2 rounded-lg border border-[#1a223a] bg-[#090c17] p-3.5 text-xs sm:text-sm">
                  <p className="text-slate-200 leading-relaxed">
                    <strong className="text-white">What does it do?</strong> {cmd.purpose}
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    <strong className="text-[#27d3f0]">Why do engineers use it?</strong>{' '}
                    {guidance.whyEngineersUseIt}
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    <strong className="text-[#8b6cff]">When should it be used?</strong>{' '}
                    {guidance.whenToUseIt}
                  </p>
                </div>

                {/* 4. Example */}
                <div className="rounded-lg border border-[#1c243d] bg-[#070911] p-3.5">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Example Command
                  </span>
                  <pre className="overflow-x-auto font-mono text-xs sm:text-sm text-[#27d3f0]">
                    <code>{cmd.example}</code>
                  </pre>
                </div>

                {/* 5. Expected Output */}
                <div className="rounded-lg border border-[#181f34] bg-[#090c16] p-3.5">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Expected Output
                  </span>
                  <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-slate-300 leading-relaxed">
                    <code>{cmd.expectedOutput}</code>
                  </pre>
                </div>

                {/* 6. What does the output mean? */}
                <p className="text-xs sm:text-sm leading-relaxed text-slate-300">
                  <strong className="text-white">What does the output mean?</strong>{' '}
                  {cmd.explanation}
                </p>
              </div>

              {/* 7. Safety Warning */}
              <div
                className={`rounded-lg border px-3.5 py-2.5 text-xs flex items-start gap-2 ${
                  cmd.safetyWarning
                    ? 'border-amber-500/35 bg-amber-500/10 text-amber-200'
                    : 'border-emerald-500/25 bg-emerald-500/5 text-emerald-200/90'
                }`}
              >
                <AlertTriangle
                  className={`h-4 w-4 shrink-0 mt-0.5 ${
                    cmd.safetyWarning ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                />
                <span>
                  <strong className={cmd.safetyWarning ? 'text-amber-300' : 'text-emerald-300'}>
                    Safety Note:
                  </strong>{' '}
                  {cmd.safetyWarning ||
                    `Read-only diagnostic command (${cmd.permissions}). Safe to run on live production endpoints without changing system settings.`}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
