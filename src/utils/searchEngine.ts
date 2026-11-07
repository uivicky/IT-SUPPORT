import { DifficultyLevel, ITCategory, ITIssue } from '../types';

export interface SearchFilterOptions {
  query?: string;
  category?: ITCategory | 'All';
  difficulty?: DifficultyLevel | 'All';
}

export const POPULAR_SEARCH_EXAMPLES: string[] = [
  '0x80070005',
  'WiFi connected no internet',
  'DNS not resolving',
  'Outlook not opening',
  'Printer offline',
  'Domain login failed',
  'Windows update failed',
  'VPN not connecting',
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s./:-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

export function scoreIssueMatch(issue: ITIssue, rawQuery: string): number {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return 1;

  let score = 0;
  const titleLower = issue.title.toLowerCase();
  const categoryLower = issue.category.toLowerCase();
  const errorLower = (issue.errorCode || '').toLowerCase();
  const descLower = issue.shortDescription.toLowerCase();
  const symptomsJoined = issue.symptoms.join(' ').toLowerCase();
  const causesJoined = issue.possibleCauses.join(' ').toLowerCase();
  const commandsJoined = issue.commands.map((c) => c.command).join(' ').toLowerCase();
  const keywordsJoined = issue.keywords.join(' ').toLowerCase();

  // Exact or substring phrase boosts
  if (errorLower && (errorLower === query || errorLower.includes(query) || query.includes(errorLower))) {
    score += 120;
  }
  if (titleLower === query) {
    score += 110;
  } else if (titleLower.includes(query)) {
    score += 75;
  }
  if (commandsJoined.includes(query)) {
    score += 65;
  }
  if (categoryLower.includes(query)) {
    score += 45;
  }
  if (symptomsJoined.includes(query)) {
    score += 40;
  }
  if (keywordsJoined.includes(query)) {
    score += 35;
  }
  if (descLower.includes(query)) {
    score += 25;
  }

  // Multi-token relevance scoring
  const tokens = tokenize(query);
  if (tokens.length > 0) {
    let matchedTokenCount = 0;
    for (const token of tokens) {
      let tokenHit = false;
      if (errorLower.includes(token)) {
        score += 35;
        tokenHit = true;
      }
      if (titleLower.includes(token)) {
        score += 22;
        tokenHit = true;
      }
      if (commandsJoined.includes(token)) {
        score += 18;
        tokenHit = true;
      }
      if (keywordsJoined.includes(token)) {
        score += 15;
        tokenHit = true;
      }
      if (categoryLower.includes(token)) {
        score += 14;
        tokenHit = true;
      }
      if (symptomsJoined.includes(token)) {
        score += 12;
        tokenHit = true;
      }
      if (descLower.includes(token) || causesJoined.includes(token)) {
        score += 8;
        tokenHit = true;
      }
      if (tokenHit) matchedTokenCount++;
    }

    // Require high token coverage for multi-word queries so irrelevant partial hits stay out
    const requiredMatches = tokens.length <= 2 ? tokens.length : Math.ceil(tokens.length * 0.6);
    if (matchedTokenCount < requiredMatches && score < 60) {
      return 0;
    }
    if (matchedTokenCount === tokens.length && tokens.length > 1) {
      score += 30;
    }
  }

  return score;
}

export function searchIssues(issues: ITIssue[], options: SearchFilterOptions): ITIssue[] {
  const { query = '', category = 'All', difficulty = 'All' } = options;
  const trimmedQuery = query.trim();

  const filtered = issues.filter((issue) => {
    if (category !== 'All' && issue.category !== category) return false;
    if (difficulty !== 'All' && issue.difficulty !== difficulty) return false;
    return true;
  });

  if (!trimmedQuery) {
    return filtered;
  }

  const scored: { issue: ITIssue; score: number }[] = [];
  for (const issue of filtered) {
    const score = scoreIssueMatch(issue, trimmedQuery);
    if (score > 0) {
      scored.push({ issue, score });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.issue.title.localeCompare(b.issue.title));
  return scored.map((item) => item.issue);
}

export function getSearchSuggestions(issues: ITIssue[], rawQuery: string, limit = 6): ITIssue[] {
  const trimmed = rawQuery.trim();
  if (trimmed.length < 2) return [];
  return searchIssues(issues, { query: trimmed }).slice(0, limit);
}

export function getRelatedIssues(issues: ITIssue[], currentIssue: ITIssue, limit = 4): ITIssue[] {
  const candidates = issues.filter((item) => item.id !== currentIssue.id);
  const currentKeywords = new Set(currentIssue.keywords.map((k) => k.toLowerCase()));
  const titleWords = new Set(tokenize(currentIssue.title));

  const scored = candidates.map((candidate) => {
    let score = 0;
    if (candidate.category === currentIssue.category) {
      score += 50;
    }
    for (const kw of candidate.keywords) {
      if (currentKeywords.has(kw.toLowerCase())) score += 15;
    }
    for (const word of tokenize(candidate.title)) {
      if (titleWords.has(word) && word.length > 3) score += 8;
    }
    if (candidate.difficulty === currentIssue.difficulty) {
      score += 4;
    }
    return { candidate, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.candidate);
}

export function getNoResultSuggestions(issues: ITIssue[]): {
  suggestedQueries: string[];
  popularIssues: ITIssue[];
} {
  return {
    suggestedQueries: POPULAR_SEARCH_EXAMPLES,
    popularIssues: issues.slice(0, 6),
  };
}
