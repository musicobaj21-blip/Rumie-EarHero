export type LicensePlan = 'free' | 'premium';

export type InstrumentType = 'piano' | 'guitar';

export type SkillCategory =
  | 'pitch'
  | 'intervals'
  | 'chords'
  | 'scales'
  | 'harmony'
  | 'melody'
  | 'rhythm';

export type ExerciseInteractionType =
  | 'multiple-choice'
  | 'compare-two'
  | 'note-order'
  | 'piano-play'
  | 'rhythm-tap';

export interface AudioEvent {
  type: 'note' | 'chord' | 'rhythm';
  midiNotes: number[];
  startBeat: number; // in beats (at tempoBpm)
  durationBeats: number;
  velocity?: number;
  accent?: boolean;
  label?: string;
}

export interface AudioSequence {
  tempoBpm: number;
  events: AudioEvent[];
  totalBeats: number;
  countInBeats?: number;
  instrument?: InstrumentType;
  /** Optional secondary sequence for "compare-two" or contrast playback */
  secondaryEvents?: AudioEvent[];
  secondaryTotalBeats?: number;
  /** Optional harmonic context chord/cadence played first (e.g. for scale degrees) */
  contextLabel?: string;
}

export type RhythmToken =
  | 'whole'
  | 'half'
  | 'dotted-half'
  | 'quarter'
  | 'dotted-quarter'
  | 'eighth'
  | 'dotted-eighth'
  | 'eighth-pair'
  | 'sixteenth-quad'
  | 'gallop'
  | 'reverse-gallop'
  | 'syncopation'
  | 'dotted-eighth-sixteenth'
  | 'eighth-triplet'
  | 'eighth-tie-quarter'
  | 'rest-whole'
  | 'rest-half'
  | 'rest-quarter'
  | 'rest-eighth';

export interface ExerciseOption {
  id: string;
  label: string;
  sublabel?: string;
  rhythmSteps?: number[]; // optional visual rhythm steps in 16th-note grid (0..15)
  rhythmTokens?: RhythmToken[]; // pure-SVG rhythmic notation tokens
}

export interface Exercise {
  id: string;
  worldId: number;
  levelNumber: number;
  interactionType: ExerciseInteractionType;
  skillCategory: SkillCategory;
  /** Concept identifier used by LearningAnalytics (e.g., "interval:3m", "chord:minor") */
  conceptId: string;
  conceptLabel: string;
  instruction: string;
  promptSubtitle?: string;
  audio: AudioSequence;
  /** Options for multiple-choice, compare-two, or rhythm recognition */
  options?: ExerciseOption[];
  /** Correct option ID (for multiple-choice & compare-two) */
  correctOptionId?: string;
  /** For note-order: shuffled MIDI notes to order low->high or in heard sequence */
  orderPool?: { id: string; midi: number; displayLabel: string }[];
  correctOrderIds?: string[];
  /** For piano-play: expected MIDI notes sequence (and optional given starter note) */
  pianoConfig?: {
    startMidi: number;
    endMidi: number;
    expectedMidi: number[];
    givenPrefixMidi?: number[];
    keyRootMidi?: number;
    keyName?: string;
  };
  /** For rhythm-tap: expected tap beat offsets relative to beat 0 (after count-in) */
  rhythmTapConfig?: {
    beatsCount: number;
    expectedOnsets: number[]; // beat positions e.g. [0, 1, 2.5, 3]
    toleranceBeats: number;
    patternLabel: string;
  };
  /** Pedagogical explanation revealed AFTER the student answers */
  explanation: string;
  /** MIDI notes highlighted on the post-answer keyboard review */
  revealMidiNotes?: number[];
  /** Optional rhythmic notation tokens revealed in post-answer feedback */
  revealRhythmTokens?: RhythmToken[];
  /** Optional contrast audio to play when explaining mistakes (e.g., 3m vs 3M) */
  contrastAudio?: {
    label: string;
    sequence: AudioSequence;
  };
}

export interface LevelDefinition {
  id: string; // e.g., "w1-l1"
  worldId: number;
  levelNumber: number; // 1..5 (5 = Desafío final)
  title: string;
  shortTitle: string;
  description: string;
  isBoss: boolean;
  questionCount: number;
  baseXp: number;
  skillCategory: SkillCategory;
  estimatedMinutes: string;
}

export interface WorldDefinition {
  id: number; // 1..8
  slug: string;
  title: string;
  subtitle: string;
  iconName:
    | 'ear'
    | 'waves'
    | 'layers'
    | 'music'
    | 'compass'
    | 'sparkles'
    | 'drum'
    | 'crown';
  skillCategory: SkillCategory;
  rewardMedalId: string;
  rewardTitle: string;
  requiresPremium: boolean;
  levels: LevelDefinition[];
}

export interface LevelProgress {
  levelId: string;
  completed: boolean;
  bestAccuracy: number; // 0..100
  stars: 0 | 1 | 2 | 3;
  attempts: number;
  xpEarned: number;
  lastPlayedAt: string;
}

export interface ConceptStat {
  conceptId: string;
  label: string;
  category: SkillCategory;
  attempts: number;
  correct: number;
  wrong: number;
  recentWrongStreak: number;
  lastPracticedAt: string;
}

export interface MedalDefinition {
  id: string;
  title: string;
  description: string;
  category: 'world' | 'precision' | 'streak' | 'mastery';
  iconName: string;
  requirementText: string;
}

export interface DiagnosticResult {
  completedAt: string;
  scorePercent: number;
  recommendedWorldId: number;
  strengths: SkillCategory[];
  focusAreas: SkillCategory[];
}

export interface DailyChallengeRecord {
  lastCompletedDate: string | null; // YYYY-MM-DD
  todayBestCorrect: number;
  todayBestScore: number;
  todayAttempts: number;
  bestCorrectEver: number;
  bestScoreEver: number;
  bestComboEver: number;
  totalCompletedDays: number;
}

export type ShareCardBadgeType =
  | 'medal'
  | 'world'
  | 'diagnostic'
  | 'daily60'
  | 'progress'
  | 'boss';

export interface ShareCardPayload {
  badgeType: ShareCardBadgeType;
  categoryTag: string;
  title: string;
  subtitle: string;
  metric4Label?: string;
  metric4Value?: string;
  highlightStat?: string;
}

export interface UserProgress {
  userId: string;
  studentName: string;
  avatarId: number;
  licensePlan: LicensePlan;
  instrument: InstrumentType;
  xp: number;
  streakDays: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  totalCorrect: number;
  totalWrong: number;
  levels: Record<string, LevelProgress>;
  unlockedMedals: string[];
  conceptStats: Record<string, ConceptStat>;
  diagnosticResult: DiagnosticResult | null;
  diplomaUnlockedAt: string | null;
  dailyChallenge?: DailyChallengeRecord;
  syncPending: boolean;
  lastSyncedAt: string | null;
}

export interface LevelCompletionSummary {
  level: LevelDefinition;
  correctCount: number;
  totalCount: number;
  accuracy: number;
  passed: boolean;
  starsEarned: 0 | 1 | 2 | 3;
  previousStars: 0 | 1 | 2 | 3;
  xpGained: number;
  newlyUnlockedMedals: MedalDefinition[];
  unlockedNextLevelTitle: string | null;
  diplomaJustUnlocked: boolean;
}
