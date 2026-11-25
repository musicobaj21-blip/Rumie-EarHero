import {
  LevelCompletionSummary,
  LevelDefinition,
  LevelProgress,
  UserProgress,
} from '../types/music';
import { computeUpdatedStreak } from '../services/ProgressRepository';
import { RewardEngine } from './RewardEngine';
import { WorldEngine } from './WorldEngine';

export const PASS_THRESHOLD_PERCENT = 80;

export function calculateStarsFromAccuracy(accuracyPercent: number): 0 | 1 | 2 | 3 {
  if (accuracyPercent >= 100) return 3;
  if (accuracyPercent >= 90) return 2;
  if (accuracyPercent >= 80) return 1;
  return 0;
}

/**
 * LevelEngine computes mission outcomes, prevents improper XP duplication,
 * updates stars/streaks/medals, and unlocks the next stage upon >= 80% accuracy.
 */
export const LevelEngine = {
  completeLevel(
    progress: UserProgress,
    level: LevelDefinition,
    correctCount: number,
    totalCount: number
  ): {
    updatedProgress: UserProgress;
    summary: LevelCompletionSummary;
  } {
    const safeTotal = Math.max(1, totalCount);
    const accuracy = Math.round((correctCount / safeTotal) * 100);
    const passed = accuracy >= PASS_THRESHOLD_PERCENT;
    const starsEarned = calculateStarsFromAccuracy(accuracy);

    const existing: LevelProgress | undefined = progress.levels[level.id];
    const previousStars = existing?.stars ?? 0;
    const wasAlreadyCompleted = Boolean(existing?.completed);

    // Prevent improper XP duplication:
    // - First completion awards full baseXp + star bonus (20 per star)
    // - Improving star rating awards star delta bonus (25 per new star)
    // - Repeating an already-completed level awards modest practice XP (15 XP, capped per level)
    // - Failing an attempt awards small effort XP (10 XP) only on first 2 attempts so student isn't punished
    let xpGained = 0;
    if (passed) {
      if (!wasAlreadyCompleted) {
        xpGained = level.baseXp + starsEarned * 20;
      } else if (starsEarned > previousStars) {
        xpGained = (starsEarned - previousStars) * 25 + 15;
      } else {
        const previousTotalLevelXp = existing?.xpEarned ?? 0;
        const cap = level.baseXp + 120;
        xpGained = previousTotalLevelXp < cap ? 15 : 5;
      }
    } else if ((existing?.attempts ?? 0) < 2) {
      xpGained = 10;
    }

    const updatedLevelProgress: LevelProgress = {
      levelId: level.id,
      completed: wasAlreadyCompleted || passed,
      bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, accuracy),
      stars: Math.max(previousStars, starsEarned) as 0 | 1 | 2 | 3,
      attempts: (existing?.attempts ?? 0) + 1,
      xpEarned: (existing?.xpEarned ?? 0) + xpGained,
      lastPlayedAt: new Date().toISOString(),
    };

    const streakUpdate = computeUpdatedStreak(progress);

    const interimProgress: UserProgress = {
      ...progress,
      xp: progress.xp + xpGained,
      streakDays: streakUpdate.streakDays,
      lastActiveDate: streakUpdate.lastActiveDate,
      levels: {
        ...progress.levels,
        [level.id]: updatedLevelProgress,
      },
      syncPending: true,
    };

    const medalEval = RewardEngine.evaluateNewMedals(interimProgress);

    const finalProgress: UserProgress = {
      ...interimProgress,
      unlockedMedals: medalEval.allUnlockedIds,
      diplomaUnlockedAt: medalEval.diplomaUnlockedAt,
    };

    let unlockedNextLevelTitle: string | null = null;
    if (passed && !wasAlreadyCompleted) {
      const next = WorldEngine.getNextLevel(level.id);
      if (next) {
        const nextStatus = WorldEngine.getLevelAccessStatus(next, finalProgress);
        if (nextStatus === 'current' || nextStatus === 'available') {
          unlockedNextLevelTitle = next.title;
        }
      }
    }

    const summary: LevelCompletionSummary = {
      level,
      correctCount,
      totalCount: safeTotal,
      accuracy,
      passed,
      starsEarned,
      previousStars,
      xpGained,
      newlyUnlockedMedals: medalEval.newlyUnlocked,
      unlockedNextLevelTitle,
      diplomaJustUnlocked: medalEval.diplomaJustUnlocked,
    };

    return { updatedProgress: finalProgress, summary };
  },
};
