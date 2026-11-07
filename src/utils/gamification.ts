export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  requirementHint: string;
  accent: 'cyan' | 'purple' | 'emerald' | 'amber';
}

export interface QuizAttemptSummary {
  bestScore: number;
  total: number;
  attempts: number;
}

export interface LearningProgressState {
  xp: number;
  streakDays: number;
  lastActiveDate: string | null;
  completedLessonIds: string[];
  exploredLabIds: string[];
  completedQuizModes: Record<string, QuizAttemptSummary>;
  solvedScenarioIds: string[];
  practicedCommands: string[];
  completedRoadmapStageIds: string[];
  earnedBadgeIds: string[];
  lastVisitedLessonId: string | null;
}

export const GAMIFICATION_STORAGE_KEY = 'itsupport_learning_progress_v1';

export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    id: 'first-step',
    title: 'First Step',
    description: 'Completed your very first interactive lesson, lab, command, quiz, or simulator ticket.',
    requirementHint: 'Complete any 1 learning activity',
    accent: 'cyan',
  },
  {
    id: 'networking-explorer',
    title: 'Networking Explorer',
    description: 'Mastered core networking concepts through quizzes or IP/DNS/Router lessons.',
    requirementHint: 'Score 80%+ in Networking Quiz or finish 3 Networking lessons',
    accent: 'purple',
  },
  {
    id: 'windows-troubleshooter',
    title: 'Windows Troubleshooter',
    description: 'Proved strong Windows OS diagnostic skills across quizzes or boot/slow-PC simulations.',
    requirementHint: 'Score 80%+ in Windows Quiz or solve 2 Windows simulator tickets',
    accent: 'cyan',
  },
  {
    id: 'command-master',
    title: 'Command Master',
    description: 'Practiced 5+ real-world CLI diagnostic commands inside the Interactive Practice Terminal.',
    requirementHint: 'Run 5 unique commands in Practice Terminal',
    accent: 'emerald',
  },
  {
    id: 'it-problem-solver',
    title: 'IT Problem Solver',
    description: 'Diagnosed and resolved 3+ realistic helpdesk tickets in the Real-World IT Simulator.',
    requirementHint: 'Solve 3 Real-World IT Simulator scenarios',
    accent: 'amber',
  },
  {
    id: 'it-support-champion',
    title: 'IT Support Champion',
    description: 'Reached 500+ XP and unlocked at least 4 core engineering badges.',
    requirementHint: 'Earn 500 XP + 4 badges',
    accent: 'purple',
  },
];

const LEVEL_TITLES = [
  'Curious Beginner',
  'Digital Explorer',
  'Helpdesk Trainee',
  'Support Apprentice',
  'L1 Troubleshooter',
  'Network Pathfinder',
  'L2 Support Specialist',
  'Systems Builder',
  'Cloud & Security Pro',
  'IT Support Champion',
];

export function createInitialProgressState(): LearningProgressState {
  return {
    xp: 0,
    streakDays: 0,
    lastActiveDate: null,
    completedLessonIds: [],
    exploredLabIds: [],
    completedQuizModes: {},
    solvedScenarioIds: [],
    practicedCommands: [],
    completedRoadmapStageIds: [],
    earnedBadgeIds: [],
    lastVisitedLessonId: null,
  };
}

export function getLevelInfo(xp: number): {
  level: number;
  title: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
} {
  const safeXp = Math.max(0, Math.floor(xp));
  const xpPerLevel = 150;
  const level = Math.floor(safeXp / xpPerLevel) + 1;
  const currentLevelXp = safeXp % xpPerLevel;
  const progressPercent = Math.min(100, Math.round((currentLevelXp / xpPerLevel) * 100));
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];

  return {
    level,
    title,
    currentLevelXp,
    nextLevelXp: xpPerLevel,
    progressPercent,
  };
}

function getDateDiffInDays(prevIsoDate: string, nextIsoDate: string): number {
  const [py, pm, pd] = prevIsoDate.split('-').map(Number);
  const [ny, nm, nd] = nextIsoDate.split('-').map(Number);
  const utcPrev = Date.UTC(py, pm - 1, pd);
  const utcNext = Date.UTC(ny, nm - 1, nd);
  return Math.round((utcNext - utcPrev) / 86_400_000);
}

export function updateStreakForDate(
  state: LearningProgressState,
  todayIso: string
): Pick<LearningProgressState, 'streakDays' | 'lastActiveDate'> {
  if (!state.lastActiveDate) {
    return { streakDays: 1, lastActiveDate: todayIso };
  }
  const diff = getDateDiffInDays(state.lastActiveDate, todayIso);
  if (diff === 0) {
    return { streakDays: Math.max(1, state.streakDays), lastActiveDate: todayIso };
  }
  if (diff === 1) {
    return { streakDays: state.streakDays + 1, lastActiveDate: todayIso };
  }
  return { streakDays: 1, lastActiveDate: todayIso };
}

const NETWORKING_LESSON_IDS = [
  'what-is-an-ip-address',
  'what-is-wifi',
  'what-is-a-router',
  'what-is-a-modem',
  'what-is-the-internet',
  'what-is-a-server',
  'what-is-a-network',
  'what-is-dns',
  'what-is-dhcp',
];

const WINDOWS_SCENARIO_IDS = [
  'outlook-not-opening',
  'slow-computer',
  'windows-boot-failure',
  'disk-space-full',
  'domain-login-failure',
];

export function evaluateEarnedBadges(state: LearningProgressState): string[] {
  const earned = new Set<string>(state.earnedBadgeIds);

  const totalActivities =
    state.completedLessonIds.length +
    state.exploredLabIds.length +
    Object.keys(state.completedQuizModes).length +
    state.solvedScenarioIds.length +
    state.practicedCommands.length +
    (state.completedRoadmapStageIds?.length || 0);

  if (totalActivities >= 1) {
    earned.add('first-step');
  }

  const netQuiz = state.completedQuizModes['networking'];
  const netQuizPassed = Boolean(netQuiz && netQuiz.total > 0 && netQuiz.bestScore / netQuiz.total >= 0.8);
  const netLessonsDone = state.completedLessonIds.filter((id) =>
    NETWORKING_LESSON_IDS.includes(id)
  ).length;
  if (netQuizPassed || netLessonsDone >= 3) {
    earned.add('networking-explorer');
  }

  const winQuiz = state.completedQuizModes['windows'];
  const winQuizPassed = Boolean(winQuiz && winQuiz.total > 0 && winQuiz.bestScore / winQuiz.total >= 0.8);
  const winScenariosDone = state.solvedScenarioIds.filter((id) =>
    WINDOWS_SCENARIO_IDS.includes(id)
  ).length;
  if (winQuizPassed || winScenariosDone >= 2) {
    earned.add('windows-troubleshooter');
  }

  if (state.practicedCommands.length >= 5) {
    earned.add('command-master');
  }

  if (state.solvedScenarioIds.length >= 3) {
    earned.add('it-problem-solver');
  }

  const nonChampionCount = Array.from(earned).filter((id) => id !== 'it-support-champion').length;
  if (state.xp >= 500 && nonChampionCount >= 4) {
    earned.add('it-support-champion');
  }

  return BADGE_CATALOG.map((b) => b.id).filter((id) => earned.has(id));
}

function todayLocalIso(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function recordLessonCompleted(
  state: LearningProgressState,
  lessonId: string,
  todayIso = todayLocalIso()
): { nextState: LearningProgressState; xpGained: number; newlyUnlockedBadges: string[] } {
  const alreadyDone = state.completedLessonIds.includes(lessonId);
  const xpGained = alreadyDone ? 5 : 30;
  const streak = updateStreakForDate(state, todayIso);

  const draft: LearningProgressState = {
    ...state,
    ...streak,
    xp: state.xp + xpGained,
    completedLessonIds: alreadyDone
      ? state.completedLessonIds
      : [...state.completedLessonIds, lessonId],
    lastVisitedLessonId: lessonId,
  };

  const nextBadges = evaluateEarnedBadges(draft);
  const newlyUnlockedBadges = nextBadges.filter((b) => !state.earnedBadgeIds.includes(b));

  return {
    nextState: { ...draft, earnedBadgeIds: nextBadges },
    xpGained,
    newlyUnlockedBadges,
  };
}

export function recordLabExplored(
  state: LearningProgressState,
  labId: string,
  todayIso = todayLocalIso()
): { nextState: LearningProgressState; xpGained: number; newlyUnlockedBadges: string[] } {
  const alreadyDone = state.exploredLabIds.includes(labId);
  const xpGained = alreadyDone ? 0 : 25;
  const streak = updateStreakForDate(state, todayIso);

  const draft: LearningProgressState = {
    ...state,
    ...streak,
    xp: state.xp + xpGained,
    exploredLabIds: alreadyDone ? state.exploredLabIds : [...state.exploredLabIds, labId],
  };

  const nextBadges = evaluateEarnedBadges(draft);
  const newlyUnlockedBadges = nextBadges.filter((b) => !state.earnedBadgeIds.includes(b));

  return {
    nextState: { ...draft, earnedBadgeIds: nextBadges },
    xpGained,
    newlyUnlockedBadges,
  };
}

export function recordQuizCompleted(
  state: LearningProgressState,
  quizModeId: string,
  score: number,
  total: number,
  todayIso = todayLocalIso()
): { nextState: LearningProgressState; xpGained: number; newlyUnlockedBadges: string[] } {
  const prev = state.completedQuizModes[quizModeId];
  const baseXp = score * 12 + (score === total ? 20 : 0);
  const xpGained = prev ? Math.max(10, Math.round(baseXp * 0.5)) : baseXp;
  const streak = updateStreakForDate(state, todayIso);

  const draft: LearningProgressState = {
    ...state,
    ...streak,
    xp: state.xp + xpGained,
    completedQuizModes: {
      ...state.completedQuizModes,
      [quizModeId]: {
        bestScore: prev ? Math.max(prev.bestScore, score) : score,
        total,
        attempts: prev ? prev.attempts + 1 : 1,
      },
    },
  };

  const nextBadges = evaluateEarnedBadges(draft);
  const newlyUnlockedBadges = nextBadges.filter((b) => !state.earnedBadgeIds.includes(b));

  return {
    nextState: { ...draft, earnedBadgeIds: nextBadges },
    xpGained,
    newlyUnlockedBadges,
  };
}

export function recordScenarioSolved(
  state: LearningProgressState,
  scenarioId: string,
  firstTryBonus: boolean,
  todayIso = todayLocalIso()
): { nextState: LearningProgressState; xpGained: number; newlyUnlockedBadges: string[] } {
  const alreadySolved = state.solvedScenarioIds.includes(scenarioId);
  const xpGained = alreadySolved ? 10 : firstTryBonus ? 50 : 35;
  const streak = updateStreakForDate(state, todayIso);

  const draft: LearningProgressState = {
    ...state,
    ...streak,
    xp: state.xp + xpGained,
    solvedScenarioIds: alreadySolved
      ? state.solvedScenarioIds
      : [...state.solvedScenarioIds, scenarioId],
  };

  const nextBadges = evaluateEarnedBadges(draft);
  const newlyUnlockedBadges = nextBadges.filter((b) => !state.earnedBadgeIds.includes(b));

  return {
    nextState: { ...draft, earnedBadgeIds: nextBadges },
    xpGained,
    newlyUnlockedBadges,
  };
}

export function recordCommandPracticed(
  state: LearningProgressState,
  canonicalCommand: string,
  todayIso = todayLocalIso()
): { nextState: LearningProgressState; xpGained: number; newlyUnlockedBadges: string[] } {
  const clean = canonicalCommand.trim().toLowerCase();
  if (!clean || clean === 'help' || clean === 'clear' || clean === 'cls') {
    return { nextState: state, xpGained: 0, newlyUnlockedBadges: [] };
  }
  const alreadyUsed = state.practicedCommands.includes(clean);
  const xpGained = alreadyUsed ? 0 : 15;
  const streak = updateStreakForDate(state, todayIso);

  const draft: LearningProgressState = {
    ...state,
    ...streak,
    xp: state.xp + xpGained,
    practicedCommands: alreadyUsed
      ? state.practicedCommands
      : [...state.practicedCommands, clean],
  };

  const nextBadges = evaluateEarnedBadges(draft);
  const newlyUnlockedBadges = nextBadges.filter((b) => !state.earnedBadgeIds.includes(b));

  return {
    nextState: { ...draft, earnedBadgeIds: nextBadges },
    xpGained,
    newlyUnlockedBadges,
  };
}

export function recordRoadmapStageToggled(
  state: LearningProgressState,
  stageId: string,
  todayIso = todayLocalIso()
): { nextState: LearningProgressState; xpGained: number; newlyUnlockedBadges: string[] } {
  const existing = state.completedRoadmapStageIds || [];
  const alreadyCompleted = existing.includes(stageId);

  if (alreadyCompleted) {
    const nextStages = existing.filter((id) => id !== stageId);
    return {
      nextState: { ...state, completedRoadmapStageIds: nextStages },
      xpGained: 0,
      newlyUnlockedBadges: [],
    };
  }

  const xpGained = 20;
  const streak = updateStreakForDate(state, todayIso);
  const draft: LearningProgressState = {
    ...state,
    ...streak,
    xp: state.xp + xpGained,
    completedRoadmapStageIds: [...existing, stageId],
  };

  const nextBadges = evaluateEarnedBadges(draft);
  const newlyUnlockedBadges = nextBadges.filter((b) => !state.earnedBadgeIds.includes(b));

  return {
    nextState: { ...draft, earnedBadgeIds: nextBadges },
    xpGained,
    newlyUnlockedBadges,
  };
}

export function loadProgressFromStorage(): LearningProgressState {
  if (typeof window === 'undefined') return createInitialProgressState();
  try {
    const raw = window.localStorage.getItem(GAMIFICATION_STORAGE_KEY);
    if (!raw) return createInitialProgressState();
    const parsed = JSON.parse(raw);
    return {
      ...createInitialProgressState(),
      ...parsed,
    };
  } catch {
    return createInitialProgressState();
  }
}

export function saveProgressToStorage(state: LearningProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('itsupport-progress-updated'));
  } catch {
    // Ignore storage errors in restricted environments
  }
}
