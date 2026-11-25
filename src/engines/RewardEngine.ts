import { MedalDefinition, UserProgress } from '../types/music';
import { WORLDS } from './WorldEngine';

export const MEDALS: MedalDefinition[] = [
  // 8 World Completion Medals
  {
    id: 'medal_world_1',
    title: 'Oído Despierto',
    description: 'Completaste los 5 niveles del Mundo 1: El Despertar del Oído.',
    category: 'world',
    iconName: 'ear',
    requirementText: 'Completar Mundo 1',
  },
  {
    id: 'medal_world_2',
    title: 'Arquitecto de Intervalos',
    description: 'Dominaste las distancias melódicas y armónicas del Mundo 2.',
    category: 'world',
    iconName: 'waves',
    requirementText: 'Completar Mundo 2',
  },
  {
    id: 'medal_world_3',
    title: 'Descifrador de Acordes',
    description: 'Identificaste tríadas, inversiones y acordes de séptima en el Mundo 3.',
    category: 'world',
    iconName: 'layers',
    requirementText: 'Completar Mundo 3',
  },
  {
    id: 'medal_world_4',
    title: 'Navegante de Escalas',
    description: 'Recorriste escalas mayores, menores, pentatónicas y blues en el Mundo 4.',
    category: 'world',
    iconName: 'music',
    requirementText: 'Completar Mundo 4',
  },
  {
    id: 'medal_world_5',
    title: 'Guía Armónico',
    description: 'Dominaste funciones tonales, cadencias y progresiones en el Mundo 5.',
    category: 'world',
    iconName: 'compass',
    requirementText: 'Completar Mundo 5',
  },
  {
    id: 'medal_world_6',
    title: 'Memoria Melódica',
    description: 'Superaste los dictados melódicos y grados tonales del Mundo 6.',
    category: 'world',
    iconName: 'sparkles',
    requirementText: 'Completar Mundo 6',
  },
  {
    id: 'medal_world_7',
    title: 'Precisión Rítmica',
    description: 'Dominaste pulso, figuras, síncopas y patrones en el Mundo 7.',
    category: 'world',
    iconName: 'drum',
    requirementText: 'Completar Mundo 7',
  },
  {
    id: 'medal_world_8',
    title: 'Maestro del Oído',
    description: 'Superaste el Gran Desafío Final y completaste los 8 mundos.',
    category: 'world',
    iconName: 'crown',
    requirementText: 'Completar Mundo 8',
  },
  // Precision Medals
  {
    id: 'medal_perfect_first',
    title: 'Oído Perfecto',
    description: 'Obtuviste 100% de aciertos (3 estrellas) en una misión auditiva.',
    category: 'precision',
    iconName: 'star',
    requirementText: '1 nivel con 100%',
  },
  {
    id: 'medal_precision_5',
    title: 'Precisión Quirúrgica',
    description: 'Lograste 3 estrellas en al menos 5 niveles distintos.',
    category: 'precision',
    iconName: 'target',
    requirementText: '5 niveles con 3 estrellas',
  },
  // Practice & Streak Medals
  {
    id: 'medal_first_step',
    title: 'Primera Nota',
    description: 'Completaste tu primera misión auditiva en Rumie EarHero.',
    category: 'streak',
    iconName: 'flame',
    requirementText: 'Completar 1 nivel',
  },
  {
    id: 'medal_streak_3',
    title: 'Ritmo Constante',
    description: 'Mantuviste una racha activa de 3 días de entrenamiento auditivo.',
    category: 'streak',
    iconName: 'flame',
    requirementText: 'Racha de 3 días',
  },
  {
    id: 'medal_streak_7',
    title: 'Disciplina Musical',
    description: 'Entrenaste tu oído durante 7 días consecutivos.',
    category: 'streak',
    iconName: 'award',
    requirementText: 'Racha de 7 días',
  },
  // Mastery Recognitions
  {
    id: 'medal_mastery_intervals',
    title: 'Dominio de Intervalos',
    description: 'Acumulaste al menos 20 aciertos en intervalos con ≥ 85% de precisión.',
    category: 'mastery',
    iconName: 'waves',
    requirementText: '≥ 20 aciertos (85%+) en Intervalos',
  },
  {
    id: 'medal_mastery_chords',
    title: 'Maestro de Acordes',
    description: 'Acumulaste al menos 20 aciertos en acordes con ≥ 85% de precisión.',
    category: 'mastery',
    iconName: 'layers',
    requirementText: '≥ 20 aciertos (85%+) en Acordes',
  },
  {
    id: 'medal_mastery_scales',
    title: 'Explorador de Escalas',
    description: 'Acumulaste al menos 18 aciertos en escalas con ≥ 85% de precisión.',
    category: 'mastery',
    iconName: 'music',
    requirementText: '≥ 18 aciertos (85%+) en Escalas',
  },
];

export const MEDAL_MAP: Record<string, MedalDefinition> = Object.fromEntries(
  MEDALS.map((m) => [m.id, m])
);

export const RewardEngine = {
  getAllMedals(): MedalDefinition[] {
    return MEDALS;
  },

  evaluateNewMedals(progress: UserProgress): {
    newlyUnlocked: MedalDefinition[];
    allUnlockedIds: string[];
    diplomaUnlockedAt: string | null;
    diplomaJustUnlocked: boolean;
  } {
    const owned = new Set(progress.unlockedMedals);
    const newlyUnlocked: MedalDefinition[] = [];

    const tryUnlock = (id: string, condition: boolean) => {
      if (condition && !owned.has(id)) {
        owned.add(id);
        const def = MEDAL_MAP[id];
        if (def) newlyUnlocked.push(def);
      }
    };

    // World completion medals
    for (const world of WORLDS) {
      const allDone = world.levels.every((lvl) => progress.levels[lvl.id]?.completed);
      tryUnlock(world.rewardMedalId, allDone);
    }

    const completedLevels = Object.values(progress.levels).filter((lp) => lp.completed);
    const threeStarLevels = completedLevels.filter((lp) => lp.stars === 3);

    tryUnlock('medal_first_step', completedLevels.length >= 1);
    tryUnlock('medal_perfect_first', threeStarLevels.length >= 1);
    tryUnlock('medal_precision_5', threeStarLevels.length >= 5);
    tryUnlock('medal_streak_3', progress.streakDays >= 3);
    tryUnlock('medal_streak_7', progress.streakDays >= 7);

    // Skill mastery recognitions
    const checkMastery = (cat: string, minCorrect: number) => {
      const items = Object.values(progress.conceptStats).filter((s) => s.category === cat);
      const attempts = items.reduce((s, i) => s + i.attempts, 0);
      const correct = items.reduce((s, i) => s + i.correct, 0);
      return correct >= minCorrect && attempts > 0 && correct / attempts >= 0.85;
    };

    tryUnlock('medal_mastery_intervals', checkMastery('intervals', 20));
    tryUnlock('medal_mastery_chords', checkMastery('chords', 20));
    tryUnlock('medal_mastery_scales', checkMastery('scales', 18));

    // Diploma unlocked upon completing World 8 Level 5 (Gran Desafío Final)
    const finalBossDone = Boolean(progress.levels['w8-l5']?.completed);
    const diplomaJustUnlocked = finalBossDone && !progress.diplomaUnlockedAt;
    const diplomaUnlockedAt =
      progress.diplomaUnlockedAt ?? (finalBossDone ? new Date().toISOString() : null);

    return {
      newlyUnlocked,
      allUnlockedIds: Array.from(owned),
      diplomaUnlockedAt,
      diplomaJustUnlocked,
    };
  },
};
