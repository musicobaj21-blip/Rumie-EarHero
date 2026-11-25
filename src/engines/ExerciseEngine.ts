import {
  AudioEvent,
  AudioSequence,
  ConceptStat,
  Exercise,
  ExerciseOption,
  InstrumentType,
  LevelDefinition,
} from '../types/music';
import { EXERCISE_COPY } from '../i18n/exerciseStrings';
import {
  formatMidiNote,
  getLocalizedChord,
  getLocalizedInterval,
  getLocalizedProgression,
  getLocalizedRhythm,
  getLocalizedScale,
} from '../i18n/musicLocalization';
import { Language } from '../i18n/types';
import { LearningAnalytics } from './LearningAnalytics';
import {
  buildChordMidi,
  buildProgressionChordVoicing,
  buildScaleMidi,
  CADENCES,
  CHORD_MAP,
  INTERVAL_MAP,
  POPULAR_PROGRESSIONS,
  RHYTHM_MAP,
  RHYTHM_PATTERNS,
  SCALE_MAP,
} from './MusicTheory';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

let exerciseCounter = 0;
function nextExId(prefix: string): string {
  exerciseCounter += 1;
  return `${prefix}-${Date.now()}-${exerciseCounter}-${Math.random().toString(36).slice(2, 6)}`;
}

// ---------- WORLD 1: EL DESPERTAR DEL OÍDO ----------

function createPitchCompareExercise(
  worldId: number,
  levelNumber: number,
  instrument: InstrumentType,
  stepIndex: number,
  lang: Language
): Exercise {
  const copy = EXERCISE_COPY[lang];
  const askHigher = Math.random() > 0.5;
  const minDiff = stepIndex < 3 ? 6 : 2;
  const maxDiff = stepIndex < 3 ? 14 : 7;
  const diff = randomInt(minDiff, maxDiff);
  const lowMidi = randomInt(48, 66);
  const highMidi = lowMidi + diff;
  const firstIsHigher = Math.random() > 0.5;
  const midiA = firstIsHigher ? highMidi : lowMidi;
  const midiB = firstIsHigher ? lowMidi : highMidi;

  const correctOptionId = askHigher
    ? midiA > midiB
      ? 'A'
      : 'B'
    : midiA < midiB
      ? 'A'
      : 'B';

  const events: AudioEvent[] = [
    { type: 'note', midiNotes: [midiA], startBeat: 0, durationBeats: 1.4, label: copy.soundA },
    { type: 'note', midiNotes: [midiB], startBeat: 2.0, durationBeats: 1.4, label: copy.soundB },
  ];

  return {
    id: nextExId('pitch-cmp'),
    worldId,
    levelNumber,
    interactionType: 'compare-two',
    skillCategory: 'pitch',
    conceptId: askHigher ? 'pitch:higher' : 'pitch:lower',
    conceptLabel: askHigher ? copy.conceptHigher : copy.conceptLower,
    instruction: askHigher ? copy.askHigherInstr : copy.askLowerInstr,
    promptSubtitle: copy.compareTwoSub,
    audio: {
      tempoBpm: 96,
      events,
      totalBeats: 3.6,
      instrument,
      secondaryEvents: [
        { type: 'note', midiNotes: [midiB], startBeat: 0, durationBeats: 1.4, label: copy.soundB },
      ],
      secondaryTotalBeats: 1.6,
    },
    options: [
      { id: 'A', label: copy.soundAOptLabel, sublabel: copy.soundAOptSub },
      { id: 'B', label: copy.soundBOptLabel, sublabel: copy.soundBOptSub },
    ],
    correctOptionId,
    explanation: copy.pitchCompareExplain(
      formatMidiNote(midiA, lang),
      formatMidiNote(midiB, lang),
      diff,
      askHigher,
      correctOptionId
    ),
    revealMidiNotes: [midiA, midiB],
  };
}

function createContourDirectionExercise(
  worldId: number,
  levelNumber: number,
  instrument: InstrumentType,
  stats: Record<string, ConceptStat>,
  lang: Language,
  lastConcept?: string
): Exercise {
  const copy = EXERCISE_COPY[lang];
  const direction = LearningAnalytics.pickWeightedItem(
    ['ascending', 'descending', 'same'] as const,
    'pitch',
    stats,
    lastConcept as 'ascending' | 'descending' | 'same' | undefined
  );

  const root = randomInt(55, 69);
  const step1 = randomInt(2, 4);
  const step2 = randomInt(2, 5);
  let notes: number[];
  if (direction === 'ascending') {
    notes = [root, root + step1, root + step1 + step2];
  } else if (direction === 'descending') {
    notes = [root + step1 + step2, root + step2, root];
  } else {
    notes = [root, root, root];
  }

  return {
    id: nextExId('contour'),
    worldId,
    levelNumber,
    interactionType: 'multiple-choice',
    skillCategory: 'pitch',
    conceptId: `pitch:${direction}`,
    conceptLabel: copy.contourConcept(copy.contourLabels[direction]),
    instruction: copy.contourInstr,
    audio: {
      tempoBpm: 100,
      events: notes.map((m, i) => ({
        type: 'note',
        midiNotes: [m],
        startBeat: i * 1.1,
        durationBeats: 0.95,
      })),
      totalBeats: 3.4,
      instrument,
    },
    options: [
      { id: 'ascending', label: copy.contourOpts.ascending[0], sublabel: copy.contourOpts.ascending[1] },
      { id: 'descending', label: copy.contourOpts.descending[0], sublabel: copy.contourOpts.descending[1] },
      { id: 'same', label: copy.contourOpts.same[0], sublabel: copy.contourOpts.same[1] },
    ],
    correctOptionId: direction,
    explanation: copy.contourExplain(
      notes.map((n) => formatMidiNote(n, lang)).join(' → '),
      copy.contourLabels[direction].toLowerCase()
    ),
    revealMidiNotes: notes,
  };
}

function createSameDifferentExercise(
  worldId: number,
  levelNumber: number,
  instrument: InstrumentType,
  lang: Language
): Exercise {
  const copy = EXERCISE_COPY[lang];
  const isSame = Math.random() > 0.48;
  const root = randomInt(57, 69);
  const interval = pickRandom([2, 3, 4, 5, 7]);
  const motifA = [root, root + interval];
  let motifB: number[];
  if (isSame) {
    motifB = [...motifA];
  } else {
    const shift = pickRandom([-2, -1, 1, 2, 3]);
    motifB = [root, root + Math.max(1, interval + shift)];
    if (motifB[1] === motifA[1]) motifB[1] = motifA[1] + 2;
  }

  const strA = motifA.map((n) => formatMidiNote(n, lang)).join(' – ');
  const strB = motifB.map((n) => formatMidiNote(n, lang)).join(' – ');

  return {
    id: nextExId('same-diff'),
    worldId,
    levelNumber,
    interactionType: 'compare-two',
    skillCategory: 'pitch',
    conceptId: isSame ? 'pitch:equal' : 'pitch:different',
    conceptLabel: isSame ? copy.sameConcept : copy.diffConcept,
    instruction: copy.sameDiffInstr,
    audio: {
      tempoBpm: 104,
      events: [
        { type: 'note', midiNotes: [motifA[0]], startBeat: 0, durationBeats: 0.85 },
        { type: 'note', midiNotes: [motifA[1]], startBeat: 0.9, durationBeats: 1.0 },
        { type: 'note', midiNotes: [motifB[0]], startBeat: 2.7, durationBeats: 0.85 },
        { type: 'note', midiNotes: [motifB[1]], startBeat: 3.6, durationBeats: 1.0 },
      ],
      totalBeats: 4.8,
      instrument,
      secondaryEvents: [
        { type: 'note', midiNotes: [motifB[0]], startBeat: 0, durationBeats: 0.85 },
        { type: 'note', midiNotes: [motifB[1]], startBeat: 0.9, durationBeats: 1.0 },
      ],
      secondaryTotalBeats: 2.1,
    },
    options: [
      { id: 'same', label: copy.sameOpt[0], sublabel: copy.sameOpt[1] },
      { id: 'different', label: copy.diffOpt[0], sublabel: copy.diffOpt[1] },
    ],
    correctOptionId: isSame ? 'same' : 'different',
    explanation: isSame ? copy.sameExplain(strA) : copy.diffExplain(strA, strB),
    revealMidiNotes: [...new Set([...motifA, ...motifB])],
  };
}

function createNoteOrderExercise(
  worldId: number,
  levelNumber: number,
  instrument: InstrumentType,
  lang: Language
): Exercise {
  const copy = EXERCISE_COPY[lang];
  const base = randomInt(57, 65);
  const gap1 = randomInt(2, 4);
  const gap2 = randomInt(2, 4);
  const sortedNotes = [base, base + gap1, base + gap1 + gap2];
  const shuffledNotes = shuffle(sortedNotes);
  const pool = shuffledNotes.map((midi, idx) => ({
    id: `n-${idx}`,
    midi,
    displayLabel: copy.noteChipLabel(idx + 1),
  }));
  const correctOrderIds = [...pool]
    .sort((a, b) => a.midi - b.midi)
    .map((item) => item.id);

  return {
    id: nextExId('order'),
    worldId,
    levelNumber,
    interactionType: 'note-order',
    skillCategory: 'melody',
    conceptId: 'melody:order_pitch',
    conceptLabel: copy.orderConcept,
    instruction: copy.orderInstr,
    promptSubtitle: copy.orderSub,
    audio: {
      tempoBpm: 96,
      events: pool.map((item, idx) => ({
        type: 'note',
        midiNotes: [item.midi],
        startBeat: idx * 1.15,
        durationBeats: 0.95,
      })),
      totalBeats: 3.6,
      instrument,
    },
    orderPool: pool,
    correctOrderIds,
    explanation: copy.orderExplain(sortedNotes.map((m) => formatMidiNote(m, lang)).join(' → ')),
    revealMidiNotes: sortedNotes,
  };
}

// ---------- WORLD 2: LOS INTERVALOS ----------

function createIntervalExercise(
  worldId: number,
  levelNumber: number,
  allowedIds: string[],
  instrument: InstrumentType,
  stats: Record<string, ConceptStat>,
  lang: Language,
  options?: {
    harmonic?: boolean;
    allowDescending?: boolean;
    lastInterval?: string;
  }
): Exercise {
  const copy = EXERCISE_COPY[lang];
  const targetId = LearningAnalytics.pickWeightedItem(
    allowedIds,
    'interval',
    stats,
    options?.lastInterval
  );
  const target = INTERVAL_MAP[targetId];
  const locTarget = getLocalizedInterval(targetId, lang);
  const harmonic = options?.harmonic ?? false;
  const descending = !harmonic && options?.allowDescending && Math.random() > 0.55;

  const lowMidi = randomInt(54, 67);
  const highMidi = lowMidi + target.semitones;
  const firstMidi = descending ? highMidi : lowMidi;
  const secondMidi = descending ? lowMidi : highMidi;

  const optionIds = new Set<string>([targetId]);
  if (allowedIds.includes(target.contrastId)) {
    optionIds.add(target.contrastId);
  }
  for (const candidate of shuffle(allowedIds)) {
    if (optionIds.size >= Math.min(4, allowedIds.length)) break;
    optionIds.add(candidate);
  }
  const exerciseOptions: ExerciseOption[] = Array.from(optionIds)
    .sort((a, b) => INTERVAL_MAP[a].semitones - INTERVAL_MAP[b].semitones)
    .map((id) => {
      const loc = getLocalizedInterval(id, lang);
      return {
        id,
        label: loc.name,
        sublabel: `${loc.shortName} · ${copy.semitonesWord(INTERVAL_MAP[id].semitones)}`,
      };
    });

  const events: AudioEvent[] = harmonic
    ? [{ type: 'chord', midiNotes: [lowMidi, highMidi], startBeat: 0, durationBeats: 2.2 }]
    : [
        { type: 'note', midiNotes: [firstMidi], startBeat: 0, durationBeats: 1.15 },
        { type: 'note', midiNotes: [secondMidi], startBeat: 1.2, durationBeats: 1.5 },
      ];

  const contrastDef = INTERVAL_MAP[target.contrastId];
  const locContrast = getLocalizedInterval(target.contrastId, lang);
  const contrastMidi = lowMidi + contrastDef.semitones;
  const contrastAudio: AudioSequence = {
    tempoBpm: 96,
    instrument,
    totalBeats: 2.8,
    events: harmonic
      ? [{ type: 'chord', midiNotes: [lowMidi, contrastMidi], startBeat: 0, durationBeats: 2.2 }]
      : [
          { type: 'note', midiNotes: [lowMidi], startBeat: 0, durationBeats: 1.1 },
          { type: 'note', midiNotes: [contrastMidi], startBeat: 1.15, durationBeats: 1.45 },
        ],
  };

  return {
    id: nextExId('interval'),
    worldId,
    levelNumber,
    interactionType: 'multiple-choice',
    skillCategory: 'intervals',
    conceptId: `interval:${targetId}`,
    conceptLabel: locTarget.name,
    instruction: harmonic
      ? copy.intervalHarmonicInstr
      : descending
        ? copy.intervalDescInstr
        : copy.intervalAscInstr,
    audio: {
      tempoBpm: 96,
      events,
      totalBeats: harmonic ? 2.4 : 2.9,
      instrument,
    },
    options: exerciseOptions,
    correctOptionId: targetId,
    explanation: `${locTarget.name} (${formatMidiNote(firstMidi, lang)} → ${formatMidiNote(secondMidi, lang)}). ${locTarget.character}`,
    revealMidiNotes: [lowMidi, highMidi],
    contrastAudio: {
      label: copy.compareWith(locContrast.name),
      sequence: contrastAudio,
    },
  };
}

// ---------- WORLD 3: ACORDES MISTERIOSOS ----------

function createChordQualityExercise(
  worldId: number,
  levelNumber: number,
  allowedIds: string[],
  instrument: InstrumentType,
  stats: Record<string, ConceptStat>,
  lang: Language,
  lastChord?: string
): Exercise {
  const copy = EXERCISE_COPY[lang];
  const targetId = LearningAnalytics.pickWeightedItem(allowedIds, 'chord', stats, lastChord);
  const def = CHORD_MAP[targetId];
  const locDef = getLocalizedChord(targetId, lang);
  const rootMidi = randomInt(52, 64);
  const chordNotes = buildChordMidi(rootMidi, targetId, 0);

  const optionIds = new Set<string>([targetId]);
  if (allowedIds.includes(def.contrastId)) optionIds.add(def.contrastId);
  for (const id of shuffle(allowedIds)) {
    if (optionIds.size >= Math.min(4, allowedIds.length)) break;
    optionIds.add(id);
  }

  const options: ExerciseOption[] = Array.from(optionIds).map((id) => {
    const loc = getLocalizedChord(id, lang);
    return {
      id,
      label: loc.name,
      sublabel: loc.shortName,
    };
  });

  const locContrast = getLocalizedChord(def.contrastId, lang);
  const contrastNotes = buildChordMidi(rootMidi, def.contrastId, 0);

  return {
    id: nextExId('chord'),
    worldId,
    levelNumber,
    interactionType: 'multiple-choice',
    skillCategory: 'chords',
    conceptId: `chord:${targetId}`,
    conceptLabel: locDef.name,
    instruction: copy.chordQualityInstr,
    audio: {
      tempoBpm: 92,
      events: [{ type: 'chord', midiNotes: chordNotes, startBeat: 0, durationBeats: 2.6 }],
      totalBeats: 2.8,
      instrument,
    },
    options,
    correctOptionId: targetId,
    explanation: copy.chordQualityExplain(
      locDef.name,
      formatMidiNote(rootMidi, lang, false),
      chordNotes.map((n) => formatMidiNote(n, lang, false)).join(' - '),
      locDef.character
    ),
    revealMidiNotes: chordNotes,
    contrastAudio: {
      label: copy.compareWith(locContrast.name),
      sequence: {
        tempoBpm: 92,
        instrument,
        totalBeats: 2.8,
        events: [{ type: 'chord', midiNotes: contrastNotes, startBeat: 0, durationBeats: 2.5 }],
      },
    },
  };
}

function createChordInversionExercise(
  worldId: number,
  levelNumber: number,
  instrument: InstrumentType,
  stats: Record<string, ConceptStat>,
  lang: Language
): Exercise {
  const copy = EXERCISE_COPY[lang];
  const quality = Math.random() > 0.45 ? 'major' : 'minor';
  const invStr = LearningAnalytics.pickWeightedItem(
    ['0', '1', '2'] as const,
    'chord_inv',
    stats
  );
  const inversion = Number(invStr) as 0 | 1 | 2;
  const rootMidi = randomInt(53, 62);
  const notes = buildChordMidi(rootMidi, quality, inversion);

  const events: AudioEvent[] = [
    ...notes.map((n, idx) => ({
      type: 'note' as const,
      midiNotes: [n],
      startBeat: idx * 0.45,
      durationBeats: 0.7,
    })),
    { type: 'chord', midiNotes: notes, startBeat: 1.65, durationBeats: 2.1 },
  ];

  return {
    id: nextExId('inv'),
    worldId,
    levelNumber,
    interactionType: 'multiple-choice',
    skillCategory: 'chords',
    conceptId: `chord_inv:${invStr}`,
    conceptLabel: copy.invConcept(copy.invNames[inversion]),
    instruction: copy.invInstr(quality === 'major'),
    promptSubtitle: copy.invSub,
    audio: {
      tempoBpm: 100,
      events,
      totalBeats: 3.9,
      instrument,
    },
    options: [
      { id: '0', label: copy.invOpts[0][0], sublabel: copy.invOpts[0][1] },
      { id: '1', label: copy.invOpts[1][0], sublabel: copy.invOpts[1][1] },
      { id: '2', label: copy.invOpts[2][0], sublabel: copy.invOpts[2][1] },
    ],
    correctOptionId: invStr,
    explanation: copy.invFullExplain(
      copy.invNames[inversion],
      notes.map((n) => formatMidiNote(n, lang)).join(' - '),
      copy.invExplain[inversion]
    ),
    revealMidiNotes: notes,
  };
}

// ---------- WORLD 4: EL UNIVERSO DE LAS ESCALAS ----------

function createScaleExercise(
  worldId: number,
  levelNumber: number,
  allowedIds: string[],
  instrument: InstrumentType,
  stats: Record<string, ConceptStat>,
  lang: Language,
  lastScale?: string,
  config?: {
    allowDirectionVariation?: boolean;
    targetPool?: string[];
  }
): Exercise {
  const copy = EXERCISE_COPY[lang];
  const candidateTargets =
    config?.targetPool && config.targetPool.length > 0 ? config.targetPool : allowedIds;
  const targetId = LearningAnalytics.pickWeightedItem(candidateTargets, 'scale', stats, lastScale);
  const def = SCALE_MAP[targetId];
  const locDef = getLocalizedScale(targetId, lang);
  const rootMidi = randomInt(53, 64);
  const scaleNotes = buildScaleMidi(rootMidi, targetId);

  const optionIds = new Set<string>([targetId]);
  if (allowedIds.includes(def.contrastId)) optionIds.add(def.contrastId);
  for (const id of shuffle(allowedIds)) {
    if (optionIds.size >= Math.min(4, allowedIds.length)) break;
    optionIds.add(id);
  }

  const options: ExerciseOption[] = shuffle(Array.from(optionIds)).map((id) => ({
    id,
    label: getLocalizedScale(id, lang).name,
    sublabel: copy.scaleSoundsCount(SCALE_MAP[id].intervals.length - 1),
  }));

  let playbackNotes = scaleNotes;
  let tempoBpm = 112;
  let stepBeats = 0.55;
  let noteDur = 0.52;

  if (config?.allowDirectionVariation) {
    const dir = pickRandom(['ascending', 'descending', 'up-down'] as const);
    if (dir === 'descending') {
      playbackNotes = [...scaleNotes].reverse();
    } else if (dir === 'up-down') {
      playbackNotes = [...scaleNotes, ...scaleNotes.slice(0, -1).reverse()];
      tempoBpm = 128;
      stepBeats = 0.44;
      noteDur = 0.41;
    }
  }

  const events: AudioEvent[] = playbackNotes.map((n, idx) => ({
    type: 'note',
    midiNotes: [n],
    startBeat: idx * stepBeats,
    durationBeats: idx === playbackNotes.length - 1 ? 1.25 : noteDur,
  }));

  // Always contrast against a scale inside the current mission's allowed family
  const contrastId = allowedIds.includes(def.contrastId)
    ? def.contrastId
    : allowedIds.find((id) => id !== targetId) ?? def.contrastId;
  const locContrast = getLocalizedScale(contrastId, lang);
  const contrastNotes = buildScaleMidi(rootMidi, contrastId);

  return {
    id: nextExId('scale'),
    worldId,
    levelNumber,
    interactionType: 'multiple-choice',
    skillCategory: 'scales',
    conceptId: `scale:${targetId}`,
    conceptLabel: locDef.name,
    instruction: copy.scaleInstr,
    audio: {
      tempoBpm,
      events,
      totalBeats: playbackNotes.length * stepBeats + 0.95,
      instrument,
    },
    options,
    correctOptionId: targetId,
    explanation: copy.scaleExplain(
      locDef.name,
      formatMidiNote(rootMidi, lang, false),
      locDef.character
    ),
    revealMidiNotes: scaleNotes,
    contrastAudio: {
      label: copy.compareWith(locContrast.name),
      sequence: {
        tempoBpm: 112,
        instrument,
        totalBeats: contrastNotes.length * 0.55 + 1.0,
        events: contrastNotes.map((n, idx) => ({
          type: 'note',
          midiNotes: [n],
          startBeat: idx * 0.55,
          durationBeats: idx === contrastNotes.length - 1 ? 1.2 : 0.5,
        })),
      },
    },
  };
}

// ---------- WORLD 5: ARMONÍA EN ACCIÓN ----------

function createTonicDominantExercise(
  worldId: number,
  levelNumber: number,
  instrument: InstrumentType,
  stats: Record<string, ConceptStat>,
  lang: Language
): Exercise {
  const copy = EXERCISE_COPY[lang];
  const target = LearningAnalytics.pickWeightedItem(['I', 'V', 'IV'] as const, 'harmony_fn', stats);
  const keyRoot = randomInt(57, 64);

  const tonicChord = buildProgressionChordVoicing(keyRoot, 0, 'major');
  const targetChord =
    target === 'I'
      ? tonicChord
      : target === 'V'
        ? buildProgressionChordVoicing(keyRoot, 7, 'major')
        : buildProgressionChordVoicing(keyRoot, 5, 'major');

  const events: AudioEvent[] = [
    { type: 'chord', midiNotes: tonicChord, startBeat: 0, durationBeats: 1.5 },
    { type: 'chord', midiNotes: buildProgressionChordVoicing(keyRoot, 5, 'major'), startBeat: 1.6, durationBeats: 1.2 },
    { type: 'chord', midiNotes: buildProgressionChordVoicing(keyRoot, 7, 'major'), startBeat: 2.9, durationBeats: 1.2 },
    { type: 'chord', midiNotes: targetChord, startBeat: 4.2, durationBeats: 2.2 },
  ];

  return {
    id: nextExId('harm-fn'),
    worldId,
    levelNumber,
    interactionType: 'multiple-choice',
    skillCategory: 'harmony',
    conceptId: `harmony_fn:${target}`,
    conceptLabel:
      target === 'I'
        ? copy.tonicConcept
        : target === 'V'
          ? copy.dominantConcept
          : copy.subdominantConcept,
    instruction: copy.tonicDomInstr,
    audio: {
      tempoBpm: 96,
      events,
      totalBeats: 6.5,
      instrument,
    },
    options: [
      { id: 'I', label: copy.tonicDomOpts.I[0], sublabel: copy.tonicDomOpts.I[1] },
      { id: 'V', label: copy.tonicDomOpts.V[0], sublabel: copy.tonicDomOpts.V[1] },
      { id: 'IV', label: copy.tonicDomOpts.IV[0], sublabel: copy.tonicDomOpts.IV[1] },
    ],
    correctOptionId: target,
    explanation: copy.tonicDomExplain[target],
    revealMidiNotes: targetChord,
  };
}

function createProgressionExercise(
  worldId: number,
  levelNumber: number,
  mode: 'cadence' | 'progression',
  instrument: InstrumentType,
  stats: Record<string, ConceptStat>,
  lang: Language,
  lastId?: string
): Exercise {
  const copy = EXERCISE_COPY[lang];
  const pool = mode === 'cadence' ? CADENCES : POPULAR_PROGRESSIONS;
  const ids = pool.map((p) => p.id);
  const targetId = LearningAnalytics.pickWeightedItem(ids, 'harmony', stats, lastId);
  const def = pool.find((p) => p.id === targetId) ?? pool[0];
  const locDef = getLocalizedProgression(def.id, lang);
  const keyRoot = randomInt(57, 64);

  const events: AudioEvent[] = def.degrees.map((deg, idx) => ({
    type: 'chord',
    midiNotes: buildProgressionChordVoicing(keyRoot, deg.rootOffset, deg.quality),
    startBeat: idx * 1.8,
    durationBeats: idx === def.degrees.length - 1 ? 2.2 : 1.65,
  }));

  return {
    id: nextExId(mode),
    worldId,
    levelNumber,
    interactionType: 'multiple-choice',
    skillCategory: 'harmony',
    conceptId: `harmony:${def.id}`,
    conceptLabel: locDef.name,
    instruction: mode === 'cadence' ? copy.cadenceInstr : copy.progressionInstr,
    audio: {
      tempoBpm: 96,
      events,
      totalBeats: def.degrees.length * 1.8 + 0.8,
      instrument,
    },
    options: pool.map((p) => ({
      id: p.id,
      label: p.roman,
      sublabel: getLocalizedProgression(p.id, lang).name.split(' (')[0],
    })),
    correctOptionId: def.id,
    explanation: copy.progressionExplain(
      locDef.name,
      formatMidiNote(keyRoot, lang, false),
      locDef.description
    ),
    revealMidiNotes: events[events.length - 1].midiNotes,
  };
}

function createHarmonicChangeExercise(
  worldId: number,
  levelNumber: number,
  instrument: InstrumentType,
  lang: Language
): Exercise {
  const copy = EXERCISE_COPY[lang];
  const candidates = copy.harmonicChangeCandidates;
  const target = pickRandom(candidates);
  const keyRoot = randomInt(57, 63);
  const chordI = buildProgressionChordVoicing(keyRoot, 0, 'major');
  const chordTarget = buildProgressionChordVoicing(keyRoot, target.offset, target.quality);

  return {
    id: nextExId('harm-change'),
    worldId,
    levelNumber,
    interactionType: 'multiple-choice',
    skillCategory: 'harmony',
    conceptId: `harmony_change:${target.id}`,
    conceptLabel: copy.harmonicChangeConcept(target.id),
    instruction: copy.harmonicChangeInstr,
    audio: {
      tempoBpm: 92,
      events: [
        { type: 'chord', midiNotes: chordI, startBeat: 0, durationBeats: 1.7 },
        { type: 'chord', midiNotes: chordTarget, startBeat: 1.9, durationBeats: 2.2 },
      ],
      totalBeats: 4.3,
      instrument,
    },
    options: candidates.map((c) => ({
      id: c.id,
      label: c.label,
      sublabel: c.quality === 'minor' ? copy.minorChordSub : copy.majorChordSub,
    })),
    correctOptionId: target.id,
    explanation: copy.harmonicChangeExplain(
      formatMidiNote(keyRoot, lang, false),
      target.id,
      target.label
    ),
    revealMidiNotes: chordTarget,
  };
}

// ---------- WORLD 6: MELODÍAS Y MEMORIA ----------

function createPianoMelodyExercise(
  worldId: number,
  levelNumber: number,
  noteCount: number,
  mode: 'reproduce' | 'complete',
  instrument: InstrumentType,
  lang: Language
): Exercise {
  const copy = EXERCISE_COPY[lang];
  const scaleMidi = [60, 62, 64, 65, 67, 69, 71, 72];
  const melody: number[] = [60];
  let currentIndex = 0;

  for (let i = 1; i < noteCount; i++) {
    const allowedMoves = [-2, -1, 1, 2].filter(
      (delta) => currentIndex + delta >= 0 && currentIndex + delta < scaleMidi.length
    );
    const move = pickRandom(allowedMoves);
    currentIndex += move;
    melody.push(scaleMidi[currentIndex]);
  }

  const givenPrefixMidi = mode === 'complete' ? melody.slice(0, melody.length - 1) : [melody[0]];
  const expectedMidi = mode === 'complete' ? [melody[melody.length - 1]] : melody;

  return {
    id: nextExId('piano-mel'),
    worldId,
    levelNumber,
    interactionType: 'piano-play',
    skillCategory: 'melody',
    conceptId: mode === 'complete' ? 'melody:complete' : `melody:dictation_${noteCount}`,
    conceptLabel:
      mode === 'complete' ? copy.pianoCompleteConcept : copy.pianoDictationConcept(noteCount),
    instruction:
      mode === 'complete'
        ? copy.pianoCompleteInstr
        : copy.pianoReproduceInstr(noteCount, formatMidiNote(60, lang)),
    promptSubtitle:
      mode === 'complete'
        ? copy.pianoCompleteSub(givenPrefixMidi.map((m) => formatMidiNote(m, lang, false)).join(' – '))
        : copy.pianoBlindSub,
    audio: {
      tempoBpm: 94,
      events: melody.map((m, idx) => ({
        type: 'note',
        midiNotes: [m],
        startBeat: idx * 1.0,
        durationBeats: idx === melody.length - 1 ? 1.35 : 0.85,
      })),
      totalBeats: melody.length + 0.6,
      instrument,
    },
    pianoConfig: {
      startMidi: 60,
      endMidi: 72,
      expectedMidi,
      givenPrefixMidi,
      keyRootMidi: 60,
      keyName: copy.pianoKeyName,
    },
    explanation: copy.pianoExplain(melody.map((m) => formatMidiNote(m, lang)).join(' → ')),
    revealMidiNotes: melody,
  };
}

function createScaleDegreeExercise(
  worldId: number,
  levelNumber: number,
  instrument: InstrumentType,
  stats: Record<string, ConceptStat>,
  lang: Language
): Exercise {
  const copy = EXERCISE_COPY[lang];
  const degrees = copy.scaleDegrees;

  const targetId = LearningAnalytics.pickWeightedItem(
    ['1', '2', '3', '4', '5', '6', '7'],
    'degree',
    stats
  );
  const target = degrees.find((d) => d.id === targetId) ?? degrees[0];
  const keyRoot = pickRandom([60, 62, 65, 67]);
  const targetNote = keyRoot + target.semitones;

  const events: AudioEvent[] = [
    { type: 'chord', midiNotes: buildProgressionChordVoicing(keyRoot, 0, 'major'), startBeat: 0, durationBeats: 1.2 },
    { type: 'chord', midiNotes: buildProgressionChordVoicing(keyRoot, 7, 'major'), startBeat: 1.3, durationBeats: 1.1 },
    { type: 'chord', midiNotes: buildProgressionChordVoicing(keyRoot, 0, 'major'), startBeat: 2.5, durationBeats: 1.3 },
    { type: 'note', midiNotes: [targetNote], startBeat: 4.5, durationBeats: 1.8, velocity: 0.9 },
  ];

  const optionIds = new Set<string>([target.id]);
  for (const d of shuffle(degrees)) {
    if (optionIds.size >= 4) break;
    optionIds.add(d.id);
  }
  const options = degrees
    .filter((d) => optionIds.has(d.id))
    .map((d) => ({ id: d.id, label: d.label, sublabel: d.sub }));

  const rootName = formatMidiNote(keyRoot, lang, false);

  return {
    id: nextExId('degree'),
    worldId,
    levelNumber,
    interactionType: 'multiple-choice',
    skillCategory: 'melody',
    conceptId: `degree:${target.id}`,
    conceptLabel: target.label,
    instruction: copy.scaleDegreeInstr,
    audio: {
      tempoBpm: 102,
      events,
      totalBeats: 6.5,
      instrument,
      contextLabel: copy.tonalityLabel(rootName),
    },
    options,
    correctOptionId: target.id,
    explanation: copy.scaleDegreeExplain(
      rootName,
      formatMidiNote(targetNote, lang),
      target.label
    ),
    revealMidiNotes: [keyRoot, targetNote],
  };
}

// ---------- WORLD 7: RITMO Y PRECISIÓN ----------

function createRhythmChoiceExercise(
  worldId: number,
  levelNumber: number,
  categories: ('pulse' | 'figures' | 'syncopation')[],
  stats: Record<string, ConceptStat>,
  lang: Language,
  lastId?: string
): Exercise {
  const copy = EXERCISE_COPY[lang];
  const pool = RHYTHM_PATTERNS.filter((p) => categories.includes(p.category as 'pulse' | 'figures' | 'syncopation'));
  const targetId = LearningAnalytics.pickWeightedItem(
    pool.map((p) => p.id),
    'rhythm',
    stats,
    lastId
  );
  const target = RHYTHM_MAP[targetId] ?? pool[0];
  const locTarget = getLocalizedRhythm(target.id, lang);

  const choiceIds = new Set<string>([target.id]);
  for (const p of shuffle(pool)) {
    if (choiceIds.size >= Math.min(4, pool.length)) break;
    choiceIds.add(p.id);
  }
  if (choiceIds.size < 3) {
    for (const p of shuffle(RHYTHM_PATTERNS)) {
      if (choiceIds.size >= 3) break;
      choiceIds.add(p.id);
    }
  }

  const options: ExerciseOption[] = Array.from(choiceIds).map((id) => {
    const r = RHYTHM_MAP[id];
    const loc = getLocalizedRhythm(id, lang);
    return {
      id: r.id,
      label: loc.name,
      sublabel: loc.name,
      rhythmSteps: r.steps16,
      rhythmTokens: r.tokens,
    };
  });

  const tempoBpm = categories.includes('syncopation') ? 92 : 88;
  const events: AudioEvent[] = target.onsets.map((onset, idx) => ({
    type: 'rhythm',
    midiNotes: [],
    startBeat: onset,
    durationBeats: 0.25,
    accent: onset === 0 || idx === 0,
  }));

  return {
    id: nextExId('rhythm-mc'),
    worldId,
    levelNumber,
    interactionType: 'multiple-choice',
    skillCategory: 'rhythm',
    conceptId: `rhythm:${target.id}`,
    conceptLabel: locTarget.name,
    instruction: copy.rhythmChoiceInstr,
    promptSubtitle: copy.rhythmChoiceSub,
    audio: {
      tempoBpm,
      countInBeats: 4,
      events,
      totalBeats: 4,
    },
    options,
    correctOptionId: target.id,
    revealRhythmTokens: target.tokens,
    explanation: `${locTarget.name}. ${locTarget.description}`,
  };
}

function createRhythmTapExercise(
  worldId: number,
  levelNumber: number,
  categories: ('pulse' | 'figures' | 'syncopation')[],
  stats: Record<string, ConceptStat>,
  lang: Language
): Exercise {
  const copy = EXERCISE_COPY[lang];
  const pool = RHYTHM_PATTERNS.filter((p) => categories.includes(p.category as 'pulse' | 'figures' | 'syncopation'));
  const targetId = LearningAnalytics.pickWeightedItem(
    pool.map((p) => p.id),
    'rhythm_tap',
    stats
  );
  const target = RHYTHM_MAP[targetId] ?? pool[0];
  const locTarget = getLocalizedRhythm(target.id, lang);
  const tempoBpm = 84;

  const events: AudioEvent[] = target.onsets.map((onset) => ({
    type: 'rhythm',
    midiNotes: [],
    startBeat: onset,
    durationBeats: 0.25,
    accent: onset === 0,
  }));

  return {
    id: nextExId('rhythm-tap'),
    worldId,
    levelNumber,
    interactionType: 'rhythm-tap',
    skillCategory: 'rhythm',
    conceptId: `rhythm_tap:${target.id}`,
    conceptLabel: copy.rhythmTapConcept(locTarget.name),
    instruction: copy.rhythmTapInstr,
    promptSubtitle: copy.rhythmTapSub(target.onsets.length),
    audio: {
      tempoBpm,
      countInBeats: 4,
      events,
      totalBeats: 4,
    },
    rhythmTapConfig: {
      beatsCount: 4,
      expectedOnsets: target.onsets,
      toleranceBeats: 0.32,
      patternLabel: locTarget.name,
    },
    revealRhythmTokens: target.tokens,
    explanation: copy.rhythmTapExplain(locTarget.name, locTarget.description),
  };
}

// ---------- MASTER GENERATOR FOR ALL 40 LEVELS ----------

export const ExerciseEngine = {
  generateLevelExercises(
    level: LevelDefinition,
    stats: Record<string, ConceptStat>,
    instrument: InstrumentType = 'piano',
    lang: Language = 'es'
  ): Exercise[] {
    const list: Exercise[] = [];
    let lastConcept: string | undefined;

    for (let i = 0; i < level.questionCount; i++) {
      const ex = this.generateSingleForLevel(level, i, stats, instrument, lastConcept, lang);
      lastConcept = ex.conceptId.split(':')[1];
      list.push(ex);
    }
    return list;
  },

  generateSingleForLevel(
    level: LevelDefinition,
    index: number,
    stats: Record<string, ConceptStat>,
    instrument: InstrumentType,
    lastConcept?: string,
    lang: Language = 'es'
  ): Exercise {
    const { worldId, levelNumber } = level;

    // WORLD 1
    if (worldId === 1) {
      if (levelNumber === 1) return createPitchCompareExercise(1, 1, instrument, index, lang);
      if (levelNumber === 2) return createContourDirectionExercise(1, 2, instrument, stats, lang, lastConcept);
      if (levelNumber === 3) return createSameDifferentExercise(1, 3, instrument, lang);
      if (levelNumber === 4) {
        return index % 2 === 0
          ? createNoteOrderExercise(1, 4, instrument, lang)
          : createPianoMelodyExercise(1, 4, 3, 'reproduce', instrument, lang);
      }
      const mod = index % 4;
      if (mod === 0) return createPitchCompareExercise(1, 5, instrument, index + 3, lang);
      if (mod === 1) return createContourDirectionExercise(1, 5, instrument, stats, lang, lastConcept);
      if (mod === 2) return createSameDifferentExercise(1, 5, instrument, lang);
      return createNoteOrderExercise(1, 5, instrument, lang);
    }

    // WORLD 2: INTERVALS
    if (worldId === 2) {
      if (levelNumber === 1) {
        return createIntervalExercise(2, 1, ['2m', '2M'], instrument, stats, lang, {
          lastInterval: lastConcept,
        });
      }
      if (levelNumber === 2) {
        return createIntervalExercise(2, 2, ['3m', '3M', '2M'], instrument, stats, lang, {
          lastInterval: lastConcept,
        });
      }
      if (levelNumber === 3) {
        return createIntervalExercise(2, 3, ['4J', 'TT', '5J'], instrument, stats, lang, {
          lastInterval: lastConcept,
        });
      }
      if (levelNumber === 4) {
        return createIntervalExercise(2, 4, ['6m', '6M', '7m', '7M', '8J'], instrument, stats, lang, {
          lastInterval: lastConcept,
        });
      }
      return createIntervalExercise(
        2,
        5,
        ['2m', '2M', '3m', '3M', '4J', 'TT', '5J', '6m', '6M', '7m', '7M', '8J'],
        instrument,
        stats,
        lang,
        { harmonic: index % 2 === 1, lastInterval: lastConcept }
      );
    }

    // WORLD 3: CHORDS
    if (worldId === 3) {
      if (levelNumber === 1) {
        return createChordQualityExercise(3, 1, ['major', 'minor'], instrument, stats, lang, lastConcept);
      }
      if (levelNumber === 2) {
        return createChordQualityExercise(
          3,
          2,
          ['major', 'minor', 'dim', 'aug'],
          instrument,
          stats,
          lang,
          lastConcept
        );
      }
      if (levelNumber === 3) {
        return createChordInversionExercise(3, 3, instrument, stats, lang);
      }
      if (levelNumber === 4) {
        return createChordQualityExercise(
          3,
          4,
          ['maj7', 'min7', 'dom7', 'm7b5'],
          instrument,
          stats,
          lang,
          lastConcept
        );
      }
      if (index % 3 === 1) return createChordInversionExercise(3, 5, instrument, stats, lang);
      return createChordQualityExercise(
        3,
        5,
        ['major', 'minor', 'dim', 'aug', 'maj7', 'min7', 'dom7', 'm7b5'],
        instrument,
        stats,
        lang,
        lastConcept
      );
    }

    // WORLD 4: SCALES (Pedagogical family-contrast progression)
    if (worldId === 4) {
      if (levelNumber === 1) {
        return createScaleExercise(
          4,
          1,
          ['major', 'natural_minor'],
          instrument,
          stats,
          lang,
          undefined,
          { allowDirectionVariation: true }
        );
      }
      if (levelNumber === 2) {
        return createScaleExercise(
          4,
          2,
          ['natural_minor', 'harmonic_minor', 'melodic_minor'],
          instrument,
          stats,
          lang,
          lastConcept
        );
      }
      if (levelNumber === 3) {
        return createScaleExercise(
          4,
          3,
          ['pentatonic_major', 'pentatonic_minor', 'major', 'natural_minor'],
          instrument,
          stats,
          lang,
          lastConcept
        );
      }
      if (levelNumber === 4) {
        return createScaleExercise(
          4,
          4,
          ['blues', 'blues_major', 'pentatonic_minor', 'natural_minor'],
          instrument,
          stats,
          lang,
          lastConcept,
          {
            targetPool:
              index % 2 === 0
                ? ['blues', 'blues_major']
                : ['blues', 'blues_major', 'pentatonic_minor', 'natural_minor'],
          }
        );
      }
      return createScaleExercise(
        4,
        5,
        [
          'major',
          'natural_minor',
          'harmonic_minor',
          'melodic_minor',
          'pentatonic_major',
          'pentatonic_minor',
          'blues',
          'blues_major',
        ],
        instrument,
        stats,
        lang,
        lastConcept
      );
    }

    // WORLD 5: HARMONY
    if (worldId === 5) {
      if (levelNumber === 1) return createTonicDominantExercise(5, 1, instrument, stats, lang);
      if (levelNumber === 2) {
        return createProgressionExercise(5, 2, 'cadence', instrument, stats, lang, lastConcept);
      }
      if (levelNumber === 3) {
        return createProgressionExercise(5, 3, 'progression', instrument, stats, lang, lastConcept);
      }
      if (levelNumber === 4) return createHarmonicChangeExercise(5, 4, instrument, lang);
      const mod = index % 3;
      if (mod === 0) return createProgressionExercise(5, 5, 'cadence', instrument, stats, lang, lastConcept);
      if (mod === 1) return createProgressionExercise(5, 5, 'progression', instrument, stats, lang, lastConcept);
      return createHarmonicChangeExercise(5, 5, instrument, lang);
    }

    // WORLD 6: MELODIES & MEMORY
    if (worldId === 6) {
      if (levelNumber === 1) return createPianoMelodyExercise(6, 1, 3, 'reproduce', instrument, lang);
      if (levelNumber === 2) return createPianoMelodyExercise(6, 2, 4, 'complete', instrument, lang);
      if (levelNumber === 3) {
        return index % 3 === 2
          ? createNoteOrderExercise(6, 3, instrument, lang)
          : createPianoMelodyExercise(6, 3, 4, 'reproduce', instrument, lang);
      }
      if (levelNumber === 4) return createScaleDegreeExercise(6, 4, instrument, stats, lang);
      const mod = index % 3;
      if (mod === 0) return createPianoMelodyExercise(6, 5, 4, 'reproduce', instrument, lang);
      if (mod === 1) return createPianoMelodyExercise(6, 5, 4, 'complete', instrument, lang);
      return createScaleDegreeExercise(6, 5, instrument, stats, lang);
    }

    // WORLD 7: RHYTHM & PRECISION
    if (worldId === 7) {
      if (levelNumber === 1) {
        return index % 2 === 0
          ? createRhythmTapExercise(7, 1, ['pulse'], stats, lang)
          : createRhythmChoiceExercise(7, 1, ['pulse', 'figures'], stats, lang, lastConcept);
      }
      if (levelNumber === 2) {
        return createRhythmChoiceExercise(7, 2, ['figures', 'pulse'], stats, lang, lastConcept);
      }
      if (levelNumber === 3) {
        return createRhythmChoiceExercise(7, 3, ['syncopation', 'figures'], stats, lang, lastConcept);
      }
      if (levelNumber === 4) {
        return createRhythmTapExercise(7, 4, ['figures', 'syncopation'], stats, lang);
      }
      return index % 2 === 0
        ? createRhythmChoiceExercise(7, 5, ['figures', 'syncopation'], stats, lang, lastConcept)
        : createRhythmTapExercise(7, 5, ['figures', 'syncopation'], stats, lang);
    }

    // WORLD 8: MAESTRO DEL OÍDO
    if (levelNumber === 1) {
      return createIntervalExercise(
        8,
        1,
        ['2m', '2M', '3m', '3M', '4J', 'TT', '5J', '6m', '6M', '7m', '7M', '8J'],
        instrument,
        stats,
        lang,
        { harmonic: index % 3 === 0, allowDescending: true, lastInterval: lastConcept }
      );
    }
    if (levelNumber === 2) {
      return index % 3 === 2
        ? createChordInversionExercise(8, 2, instrument, stats, lang)
        : createChordQualityExercise(
            8,
            2,
            ['major', 'minor', 'dim', 'aug', 'maj7', 'min7', 'dom7', 'm7b5'],
            instrument,
            stats,
            lang,
            lastConcept
          );
    }
    if (levelNumber === 3) {
      return index % 2 === 0
        ? createScaleExercise(
            8,
            3,
            [
              'major',
              'natural_minor',
              'harmonic_minor',
              'melodic_minor',
              'pentatonic_major',
              'pentatonic_minor',
              'blues',
              'blues_major',
            ],
            instrument,
            stats,
            lang,
            lastConcept
          )
        : createProgressionExercise(
            8,
            3,
            index % 4 === 1 ? 'cadence' : 'progression',
            instrument,
            stats,
            lang,
            lastConcept
          );
    }
    if (levelNumber === 4) {
      if (index % 3 === 0) return createPianoMelodyExercise(8, 4, 5, 'reproduce', instrument, lang);
      if (index % 3 === 1) return createScaleDegreeExercise(8, 4, instrument, stats, lang);
      return createRhythmTapExercise(8, 4, ['figures', 'syncopation'], stats, lang);
    }

    // WORLD 8 LEVEL 5: GRAN DESAFÍO FINAL
    const finalOrder = index % 7;
    if (finalOrder === 0) {
      return createIntervalExercise(
        8,
        5,
        ['3m', '3M', '4J', 'TT', '5J', '6m', '6M', '7m', '7M'],
        instrument,
        stats,
        lang,
        { harmonic: true, lastInterval: lastConcept }
      );
    }
    if (finalOrder === 1) {
      return createChordQualityExercise(
        8,
        5,
        ['major', 'minor', 'dim', 'aug', 'maj7', 'min7', 'dom7', 'm7b5'],
        instrument,
        stats,
        lang,
        lastConcept
      );
    }
    if (finalOrder === 2) {
      return createScaleExercise(
        8,
        5,
        [
          'major',
          'natural_minor',
          'harmonic_minor',
          'melodic_minor',
          'pentatonic_major',
          'pentatonic_minor',
          'blues',
          'blues_major',
        ],
        instrument,
        stats,
        lang,
        lastConcept
      );
    }
    if (finalOrder === 3) {
      return createProgressionExercise(8, 5, 'progression', instrument, stats, lang, lastConcept);
    }
    if (finalOrder === 4) {
      return createPianoMelodyExercise(8, 5, 4, 'reproduce', instrument, lang);
    }
    if (finalOrder === 5) {
      return createRhythmChoiceExercise(8, 5, ['figures', 'syncopation'], stats, lang, lastConcept);
    }
    return createScaleDegreeExercise(8, 5, instrument, stats, lang);
  },

  generateDiagnosticExercises(instrument: InstrumentType = 'piano', lang: Language = 'es'): Exercise[] {
    const emptyStats: Record<string, ConceptStat> = {};
    return [
      createPitchCompareExercise(1, 1, instrument, 1, lang),
      createContourDirectionExercise(1, 2, instrument, emptyStats, lang),
      createIntervalExercise(2, 2, ['3m', '3M', '5J'], instrument, emptyStats, lang),
      createIntervalExercise(2, 3, ['4J', '5J', '8J'], instrument, emptyStats, lang),
      createChordQualityExercise(3, 1, ['major', 'minor', 'dim'], instrument, emptyStats, lang),
      createScaleExercise(
        4,
        1,
        ['major', 'natural_minor', 'pentatonic_minor', 'blues'],
        instrument,
        emptyStats,
        lang
      ),
      createProgressionExercise(5, 2, 'cadence', instrument, emptyStats, lang),
      createRhythmChoiceExercise(7, 2, ['pulse', 'figures'], emptyStats, lang),
    ];
  },

  generateAdaptiveDrill(
    stats: Record<string, ConceptStat>,
    instrument: InstrumentType = 'piano',
    lang: Language = 'es'
  ): Exercise[] {
    const weakList = Object.values(stats)
      .filter((s) => s.attempts >= 1 && s.correct / s.attempts < 0.85)
      .sort((a, b) => a.correct / a.attempts - b.correct / b.attempts);

    const exercises: Exercise[] = [];
    for (let i = 0; i < 6; i++) {
      const target = weakList[i % Math.max(1, weakList.length)];
      if (!target) {
        exercises.push(
          createIntervalExercise(2, 2, ['2m', '2M', '3m', '3M', '4J', '5J'], instrument, stats, lang)
        );
        continue;
      }

      if (target.conceptId.startsWith('interval:')) {
        const raw = target.conceptId.replace('interval:', '');
        const def = INTERVAL_MAP[raw];
        const pool = def ? [raw, def.contrastId, '4J', '5J'] : ['3m', '3M', '5J'];
        exercises.push(createIntervalExercise(2, 2, [...new Set(pool)], instrument, stats, lang));
      } else if (target.conceptId.startsWith('chord:')) {
        const raw = target.conceptId.replace('chord:', '');
        const def = CHORD_MAP[raw];
        const pool = def ? [raw, def.contrastId, 'major', 'minor'] : ['major', 'minor', 'dim'];
        exercises.push(createChordQualityExercise(3, 2, [...new Set(pool)], instrument, stats, lang));
      } else if (target.conceptId.startsWith('scale:')) {
        const raw = target.conceptId.replace('scale:', '');
        let pool: string[];
        if (raw === 'natural_minor' || raw === 'harmonic_minor' || raw === 'melodic_minor') {
          pool = ['natural_minor', 'harmonic_minor', 'melodic_minor'];
        } else if (raw === 'blues' || raw === 'blues_major') {
          pool = ['blues', 'blues_major', 'pentatonic_minor', 'natural_minor'];
        } else if (raw === 'pentatonic_major' || raw === 'pentatonic_minor') {
          pool = ['pentatonic_major', 'pentatonic_minor', 'major', 'natural_minor'];
        } else {
          pool = ['major', 'natural_minor'];
        }
        exercises.push(createScaleExercise(4, 2, pool, instrument, stats, lang));
      } else if (target.category === 'harmony') {
        exercises.push(createProgressionExercise(5, 2, 'cadence', instrument, stats, lang));
      } else if (target.category === 'rhythm') {
        exercises.push(createRhythmChoiceExercise(7, 2, ['figures', 'syncopation'], stats, lang));
      } else if (target.category === 'melody') {
        exercises.push(createPianoMelodyExercise(6, 1, 3, 'reproduce', instrument, lang));
      } else {
        exercises.push(createContourDirectionExercise(1, 2, instrument, stats, lang));
      }
    }
    return exercises;
  },

  /**
   * Generates rapid, varied auditory questions for the 60-second Daily Blitz
   * reusing existing Tone.js exercise generators (contour, intervals, major/minor triads, major/minor scales).
   */
  generateDaily60Question(
    index: number,
    instrument: InstrumentType = 'piano',
    stats: Record<string, ConceptStat> = {},
    lang: Language = 'es',
    lastConcept?: string
  ): Exercise {
    const slot = index % 4;
    if (slot === 0) {
      return createContourDirectionExercise(1, 2, instrument, stats, lang);
    }
    if (slot === 1) {
      return createIntervalExercise(
        2,
        2,
        ['2m', '2M', '3m', '3M', '4J', '5J', '8J'],
        instrument,
        stats,
        lang,
        { lastInterval: lastConcept }
      );
    }
    if (slot === 2) {
      return createChordQualityExercise(
        3,
        1,
        ['major', 'minor'],
        instrument,
        stats,
        lang,
        undefined
      );
    }
    return createScaleExercise(
      4,
      1,
      ['major', 'natural_minor'],
      instrument,
      stats,
      lang,
      undefined,
      { allowDirectionVariation: false }
    );
  },
};
