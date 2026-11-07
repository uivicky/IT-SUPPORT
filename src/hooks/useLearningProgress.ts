import { useCallback, useEffect, useState } from 'react';
import {
  BADGE_CATALOG,
  getLevelInfo,
  LearningProgressState,
  loadProgressFromStorage,
  recordCommandPracticed,
  recordLabExplored,
  recordLessonCompleted,
  recordQuizCompleted,
  recordRoadmapStageToggled,
  recordScenarioSolved,
  createInitialProgressState,
  saveProgressToStorage,
} from '../utils/gamification';

export interface ProgressRewardToast {
  xpGained: number;
  newlyUnlockedBadges: string[];
  message: string;
}

export function useLearningProgress() {
  const [progress, setProgress] = useState<LearningProgressState>(() =>
    loadProgressFromStorage()
  );
  const [recentReward, setRecentReward] = useState<ProgressRewardToast | null>(null);

  useEffect(() => {
    const sync = () => {
      setProgress(loadProgressFromStorage());
    };
    window.addEventListener('itsupport-progress-updated', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('itsupport-progress-updated', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const clearReward = useCallback(() => setRecentReward(null), []);

  const completeLesson = useCallback((lessonId: string) => {
    const current = loadProgressFromStorage();
    const res = recordLessonCompleted(current, lessonId);
    saveProgressToStorage(res.nextState);
    setProgress(res.nextState);
    setRecentReward({
      xpGained: res.xpGained,
      newlyUnlockedBadges: res.newlyUnlockedBadges,
      message:
        res.xpGained >= 30
          ? 'Lesson mastered! +30 XP earned.'
          : 'Lesson reviewed! +5 XP bonus.',
    });
    return res;
  }, []);

  const markVisitedLesson = useCallback((lessonId: string) => {
    const current = loadProgressFromStorage();
    if (current.lastVisitedLessonId === lessonId) return;
    const next: LearningProgressState = { ...current, lastVisitedLessonId: lessonId };
    saveProgressToStorage(next);
    setProgress(next);
  }, []);

  const exploreLab = useCallback((labId: string) => {
    const current = loadProgressFromStorage();
    const res = recordLabExplored(current, labId);
    saveProgressToStorage(res.nextState);
    setProgress(res.nextState);
    if (res.xpGained > 0 || res.newlyUnlockedBadges.length > 0) {
      setRecentReward({
        xpGained: res.xpGained,
        newlyUnlockedBadges: res.newlyUnlockedBadges,
        message: 'Visual simulation completed! +25 XP earned.',
      });
    }
    return res;
  }, []);

  const completeQuiz = useCallback((quizModeId: string, score: number, total: number) => {
    const current = loadProgressFromStorage();
    const res = recordQuizCompleted(current, quizModeId, score, total);
    saveProgressToStorage(res.nextState);
    setProgress(res.nextState);
    setRecentReward({
      xpGained: res.xpGained,
      newlyUnlockedBadges: res.newlyUnlockedBadges,
      message: `Quiz finished (${score}/${total})! +${res.xpGained} XP earned.`,
    });
    return res;
  }, []);

  const solveScenario = useCallback((scenarioId: string, firstTryBonus: boolean) => {
    const current = loadProgressFromStorage();
    const res = recordScenarioSolved(current, scenarioId, firstTryBonus);
    saveProgressToStorage(res.nextState);
    setProgress(res.nextState);
    setRecentReward({
      xpGained: res.xpGained,
      newlyUnlockedBadges: res.newlyUnlockedBadges,
      message: `Ticket resolved! +${res.xpGained} XP earned.`,
    });
    return res;
  }, []);

  const practiceCommand = useCallback((canonicalCommand: string) => {
    const current = loadProgressFromStorage();
    const res = recordCommandPracticed(current, canonicalCommand);
    if (res.nextState !== current) {
      saveProgressToStorage(res.nextState);
      setProgress(res.nextState);
      if (res.xpGained > 0 || res.newlyUnlockedBadges.length > 0) {
        setRecentReward({
          xpGained: res.xpGained,
          newlyUnlockedBadges: res.newlyUnlockedBadges,
          message: `New CLI command practiced! +${res.xpGained} XP earned.`,
        });
      }
    }
    return res;
  }, []);

  const toggleRoadmapStage = useCallback((stageId: string) => {
    const current = loadProgressFromStorage();
    const res = recordRoadmapStageToggled(current, stageId);
    saveProgressToStorage(res.nextState);
    setProgress(res.nextState);
    if (res.xpGained > 0) {
      setRecentReward({
        xpGained: res.xpGained,
        newlyUnlockedBadges: res.newlyUnlockedBadges,
        message: `Roadmap stage completed! +${res.xpGained} XP earned.`,
      });
    }
    return res;
  }, []);

  const resetProgress = useCallback(() => {
    const fresh = createInitialProgressState();
    saveProgressToStorage(fresh);
    setProgress(fresh);
    setRecentReward(null);
  }, []);

  const levelInfo = getLevelInfo(progress.xp);

  const unlockedBadges = BADGE_CATALOG.filter((b) =>
    progress.earnedBadgeIds.includes(b.id)
  );

  return {
    progress,
    levelInfo,
    unlockedBadges,
    badgeCatalog: BADGE_CATALOG,
    recentReward,
    clearReward,
    completeLesson,
    markVisitedLesson,
    exploreLab,
    completeQuiz,
    solveScenario,
    practiceCommand,
    toggleRoadmapStage,
    resetProgress,
  };
}
