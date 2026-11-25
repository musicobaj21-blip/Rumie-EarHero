import { UserProgress } from '../types/music';

const STORAGE_KEY = 'rumie_ear_training_progress_v1';
const LARAVEL_API_BASE =
  (import.meta.env?.VITE_LARAVEL_API_URL as string | undefined)?.replace(/\/$/, '') || '';

export function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getYesterdayIsoDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function createDefaultDailyChallenge() {
  return {
    lastCompletedDate: null,
    todayBestCorrect: 0,
    todayBestScore: 0,
    todayAttempts: 0,
    bestCorrectEver: 0,
    bestScoreEver: 0,
    bestComboEver: 0,
    totalCompletedDays: 0,
  };
}

export function createDefaultProgress(): UserProgress {
  return {
    userId: `rumie-student-${Math.random().toString(36).slice(2, 10)}`,
    studentName: 'Estudiante Rumie',
    avatarId: 0,
    licensePlan: 'free',
    instrument: 'piano',
    xp: 0,
    streakDays: 0,
    lastActiveDate: null,
    totalCorrect: 0,
    totalWrong: 0,
    levels: {},
    unlockedMedals: [],
    conceptStats: {},
    diagnosticResult: null,
    diplomaUnlockedAt: null,
    dailyChallenge: createDefaultDailyChallenge(),
    syncPending: false,
    lastSyncedAt: null,
  };
}

export function computeUpdatedStreak(progress: UserProgress): {
  streakDays: number;
  lastActiveDate: string;
} {
  const today = getTodayIsoDate();
  if (progress.lastActiveDate === today) {
    return {
      streakDays: Math.max(1, progress.streakDays),
      lastActiveDate: today,
    };
  }
  const yesterday = getYesterdayIsoDate();
  if (progress.lastActiveDate === yesterday) {
    return {
      streakDays: progress.streakDays + 1,
      lastActiveDate: today,
    };
  }
  return {
    streakDays: 1,
    lastActiveDate: today,
  };
}

/**
 * ProgressRepository persists student data locally for the prototype
 * and prepares an explicit Laravel API synchronization adapter.
 */
export const ProgressRepository = {
  load(): UserProgress {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return createDefaultProgress();
      const parsed = JSON.parse(raw) as Partial<UserProgress>;
      return {
        ...createDefaultProgress(),
        ...parsed,
        levels: parsed.levels ?? {},
        unlockedMedals: Array.isArray(parsed.unlockedMedals) ? parsed.unlockedMedals : [],
        conceptStats: parsed.conceptStats ?? {},
        dailyChallenge: {
          ...createDefaultDailyChallenge(),
          ...(parsed.dailyChallenge ?? {}),
        },
      };
    } catch {
      return createDefaultProgress();
    }
  },

  save(progress: UserProgress): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors in restricted frames
    }
  },

  reset(): UserProgress {
    const fresh = createDefaultProgress();
    this.save(fresh);
    return fresh;
  },

  /**
   * Prepared Laravel API sync endpoint.
   * Sends progress snapshot to Laravel backend when VITE_LARAVEL_API_URL is configured.
   */
  async syncToLaravel(
    progress: UserProgress,
    bearerToken?: string
  ): Promise<{ synced: boolean; syncedAt: string | null; reason?: string }> {
    if (!LARAVEL_API_BASE) {
      return {
        synced: false,
        syncedAt: null,
        reason: 'Almacenamiento local activo (endpoint Laravel no configurado).',
      };
    }

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };
      if (bearerToken) {
        headers.Authorization = `Bearer ${bearerToken}`;
      }

      const res = await fetch(`${LARAVEL_API_BASE}/api/rumie/ear-training/progress`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          user_id: progress.userId,
          student_name: progress.studentName,
          xp: progress.xp,
          streak_days: progress.streakDays,
          last_active_date: progress.lastActiveDate,
          total_correct: progress.totalCorrect,
          total_wrong: progress.totalWrong,
          levels: progress.levels,
          unlocked_medals: progress.unlockedMedals,
          concept_stats: progress.conceptStats,
          diploma_unlocked_at: progress.diplomaUnlockedAt,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const syncedAt = new Date().toISOString();
      return { synced: true, syncedAt };
    } catch {
      return {
        synced: false,
        syncedAt: null,
        reason: 'Sincronización pendiente; los datos siguen protegidos localmente.',
      };
    }
  },
};
