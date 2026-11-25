import { ConceptStat, SkillCategory, UserProgress } from '../types/music';
import {
  getLocalizedChord,
  getLocalizedInterval,
  getLocalizedProgression,
  getLocalizedRhythm,
  getLocalizedScale,
  SKILL_LABELS_I18N,
} from '../i18n/musicLocalization';
import { TRANSLATIONS } from '../i18n/translations';
import { Language } from '../i18n/types';
import { CHORD_MAP, INTERVAL_MAP, SCALE_MAP } from './MusicTheory';

export interface AdaptiveRecommendation {
  conceptId: string;
  label: string;
  category: SkillCategory;
  accuracy: number;
  attempts: number;
  contrastConceptId?: string;
  contrastLabel?: string;
  reason: string;
}

export interface SkillSummary {
  category: SkillCategory;
  label: string;
  attempts: number;
  correct: number;
  accuracy: number;
}

function resolveConceptLabel(conceptId: string, fallback: string, lang: Language): string {
  if (conceptId.startsWith('interval:')) {
    const raw = conceptId.replace('interval:', '');
    return getLocalizedInterval(raw, lang)?.name ?? fallback;
  }
  if (conceptId.startsWith('chord:')) {
    const raw = conceptId.replace('chord:', '');
    return getLocalizedChord(raw, lang)?.name ?? fallback;
  }
  if (conceptId.startsWith('scale:')) {
    const raw = conceptId.replace('scale:', '');
    return getLocalizedScale(raw, lang)?.name ?? fallback;
  }
  if (conceptId.startsWith('harmony:')) {
    const raw = conceptId.replace('harmony:', '');
    return getLocalizedProgression(raw, lang)?.name ?? fallback;
  }
  if (conceptId.startsWith('rhythm:')) {
    const raw = conceptId.replace('rhythm:', '');
    return getLocalizedRhythm(raw, lang)?.name ?? fallback;
  }
  return fallback;
}

/**
 * Deterministic pedagogical analytics & adaptive practice engine.
 * Tracks every mistake per musical concept and increases practice frequency
 * + contrast pairs (e.g., 3m vs 3M, minor vs major) without external AI calls.
 */
export const LearningAnalytics = {
  recordAttempt(
    progress: UserProgress,
    conceptId: string,
    label: string,
    category: SkillCategory,
    isCorrect: boolean
  ): UserProgress {
    const existing = progress.conceptStats[conceptId] ?? {
      conceptId,
      label,
      category,
      attempts: 0,
      correct: 0,
      wrong: 0,
      recentWrongStreak: 0,
      lastPracticedAt: new Date().toISOString(),
    };

    const updatedStat: ConceptStat = {
      ...existing,
      label,
      attempts: existing.attempts + 1,
      correct: existing.correct + (isCorrect ? 1 : 0),
      wrong: existing.wrong + (isCorrect ? 0 : 1),
      recentWrongStreak: isCorrect ? 0 : existing.recentWrongStreak + 1,
      lastPracticedAt: new Date().toISOString(),
    };

    return {
      ...progress,
      totalCorrect: progress.totalCorrect + (isCorrect ? 1 : 0),
      totalWrong: progress.totalWrong + (isCorrect ? 0 : 1),
      conceptStats: {
        ...progress.conceptStats,
        [conceptId]: updatedStat,
      },
      syncPending: true,
    };
  },

  /**
   * Computes deterministic sampling weight for a candidate concept.
   * Concepts with lower accuracy or active error streaks receive higher weight
   * so ExerciseEngine naturally reinforces weak areas.
   */
  getAdaptiveWeight(conceptId: string, stats: Record<string, ConceptStat>): number {
    const st = stats[conceptId];
    if (!st || st.attempts === 0) return 1.15; // slight priority for unseen concepts
    const accuracy = st.correct / st.attempts;
    let weight = 1;
    if (accuracy < 0.6) weight += 2.2;
    else if (accuracy < 0.8) weight += 1.2;
    if (st.recentWrongStreak >= 1) weight += st.recentWrongStreak * 0.9;
    return Math.min(5, weight);
  },

  /**
   * Given a list of candidate keys (e.g., ['3m', '3M']) and a prefix (e.g., 'interval'),
   * performs weighted deterministic-random selection favoring weak concepts and their contrast pairs.
   */
  pickWeightedItem<T extends string>(
    candidates: T[],
    conceptPrefix: string,
    stats: Record<string, ConceptStat>,
    excludeLast?: T
  ): T {
    const pool =
      candidates.length > 1 && excludeLast
        ? candidates.filter((c) => c !== excludeLast)
        : candidates;

    const weights = pool.map((id) => this.getAdaptiveWeight(`${conceptPrefix}:${id}`, stats));
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  },

  /**
   * Returns concrete pedagogical focus recommendations (weak concepts + contrast pairs).
   */
  getRecommendations(
    progress: UserProgress,
    limit = 4,
    lang: Language = 'es'
  ): AdaptiveRecommendation[] {
    const allStats = Object.values(progress.conceptStats).filter((s) => s.attempts >= 2);
    const weak = allStats
      .map((s) => ({
        stat: s,
        accuracy: Math.round((s.correct / s.attempts) * 100),
      }))
      .filter((item) => item.accuracy < 85 || item.stat.recentWrongStreak > 0)
      .sort((a, b) => a.accuracy - b.accuracy || b.stat.wrong - a.stat.wrong)
      .slice(0, limit);

    const adaptiveCopy = TRANSLATIONS[lang].adaptive;

    return weak.map(({ stat, accuracy }) => {
      let contrastConceptId: string | undefined;
      let contrastLabel: string | undefined;
      const localizedLabel = resolveConceptLabel(stat.conceptId, stat.label, lang);

      if (stat.conceptId.startsWith('interval:')) {
        const raw = stat.conceptId.replace('interval:', '');
        const def = INTERVAL_MAP[raw];
        if (def && INTERVAL_MAP[def.contrastId]) {
          contrastConceptId = `interval:${def.contrastId}`;
          contrastLabel = getLocalizedInterval(def.contrastId, lang).name;
        }
      } else if (stat.conceptId.startsWith('chord:')) {
        const raw = stat.conceptId.replace('chord:', '');
        const def = CHORD_MAP[raw];
        if (def && CHORD_MAP[def.contrastId]) {
          contrastConceptId = `chord:${def.contrastId}`;
          contrastLabel = getLocalizedChord(def.contrastId, lang).name;
        }
      } else if (stat.conceptId.startsWith('scale:')) {
        const raw = stat.conceptId.replace('scale:', '');
        const def = SCALE_MAP[raw];
        if (def && SCALE_MAP[def.contrastId]) {
          contrastConceptId = `scale:${def.contrastId}`;
          contrastLabel = getLocalizedScale(def.contrastId, lang).name;
        }
      }

      return {
        conceptId: stat.conceptId,
        label: localizedLabel,
        category: stat.category,
        accuracy,
        attempts: stat.attempts,
        contrastConceptId,
        contrastLabel,
        reason: contrastLabel
          ? adaptiveCopy.reasonWithContrast(accuracy, localizedLabel, contrastLabel)
          : adaptiveCopy.reasonBasic(accuracy, stat.attempts),
      };
    });
  },

  getSkillSummaries(progress: UserProgress, lang: Language = 'es'): SkillSummary[] {
    const categories: SkillCategory[] = [
      'pitch',
      'intervals',
      'chords',
      'scales',
      'harmony',
      'melody',
      'rhythm',
    ];

    return categories.map((cat) => {
      const items = Object.values(progress.conceptStats).filter((s) => s.category === cat);
      const attempts = items.reduce((sum, s) => sum + s.attempts, 0);
      const correct = items.reduce((sum, s) => sum + s.correct, 0);
      return {
        category: cat,
        label: SKILL_LABELS_I18N[lang][cat],
        attempts,
        correct,
        accuracy: attempts > 0 ? Math.round((correct / attempts) * 100) : 0,
      };
    });
  },

  getSkillLabel(cat: SkillCategory, lang: Language = 'es'): string {
    return SKILL_LABELS_I18N[lang][cat];
  },
};
