import { DifficultyLevel, IssueCommand, ITCategory, ITIssue } from '../types';

export interface CompactIssueSeed {
  id: string;
  title: string;
  category: ITCategory;
  errorCode?: string;
  desc: string;
  symptoms: string[];
  causes: string[];
  steps: string[];
  cmds: [IssueCommand['shell'], string, string?][];
  warn?: string;
  expected: string;
  prevent: string[];
  diff: DifficultyLevel;
  time: string;
  tags: string[];
}

export function slugifyTitle(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return base || id.toLowerCase();
}

export function expandIssues(seeds: CompactIssueSeed[]): ITIssue[] {
  return seeds.map((s) => {
    const symptoms =
      s.symptoms.length >= 2
        ? s.symptoms
        : [
            ...s.symptoms,
            `Users or monitoring alerts report failures affecting ${s.category} workflows${
              s.errorCode ? ` (${s.errorCode})` : ''
            }.`,
          ];

    const possibleCauses =
      s.causes.length >= 2
        ? s.causes
        : [
            ...s.causes,
            `Recent configuration drift, policy update, or stale cached state in ${s.category}.`,
          ];

    const solutionSteps = [...s.steps];
    if (solutionSteps.length === 1) {
      solutionSteps.unshift(
        `Open an elevated ${s.cmds[0]?.[0] || 'terminal'} session and inspect current status/logs before applying changes.`
      );
    }
    if (solutionSteps.length === 2) {
      solutionSteps.push(
        `Verify normal operation and confirm "${s.expected.replace(/\.$/, '')}" before closing the ticket.`
      );
    }

    return {
      id: s.id,
      slug: slugifyTitle(s.title, s.id),
      title: s.title,
      category: s.category,
      errorCode: s.errorCode,
      shortDescription: s.desc,
      symptoms,
      possibleCauses,
      solutionSteps,
      commands: s.cmds.map(([shell, command, note]) => ({ shell, command, note })),
      safetyWarning: s.warn,
      expectedResult: s.expected,
      preventionTips: s.prevent,
      difficulty: s.diff,
      estimatedTime: s.time,
      keywords: s.tags,
    };
  });
}
