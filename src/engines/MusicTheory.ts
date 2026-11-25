import { RhythmToken } from '../types/music';

export interface IntervalDefinition {
  id: string;
  semitones: number;
  name: string;
  shortName: string;
  character: string;
  contrastId: string;
  referenceHint: string;
}

export interface ChordDefinition {
  id: string;
  name: string;
  shortName: string;
  intervals: number[];
  character: string;
  contrastId: string;
}

export interface ScaleDefinition {
  id: string;
  name: string;
  shortName: string;
  intervals: number[];
  character: string;
  contrastId: string;
}

export interface ProgressionDefinition {
  id: string;
  roman: string;
  name: string;
  degrees: { rootOffset: number; quality: 'major' | 'minor' | 'dim'; romanLabel: string }[];
  description: string;
}

export interface RhythmPatternDefinition {
  id: string;
  name: string;
  notation: string;
  tokens: RhythmToken[];
  category: 'pulse' | 'figures' | 'syncopation' | 'mixed';
  beatsCount: number;
  onsets: number[]; // beat offsets in 4/4 (0..3.75)
  steps16: number[]; // indices 0..15 for visual grid
  description: string;
}

export const NOTE_NAMES_ES = [
  'Do',
  'Do#',
  'Re',
  'Mib',
  'Mi',
  'Fa',
  'Fa#',
  'Sol',
  'Lab',
  'La',
  'Sib',
  'Si',
] as const;

export const NOTE_NAMES_INTL = [
  'C',
  'C#',
  'D',
  'Eb',
  'E',
  'F',
  'F#',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
] as const;

export const TONE_NOTE_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;

export function midiToToneNote(midi: number): string {
  const clamped = Math.max(21, Math.min(108, Math.round(midi)));
  const pc = ((clamped % 12) + 12) % 12;
  const octave = Math.floor(clamped / 12) - 1;
  return `${TONE_NOTE_NAMES[pc]}${octave}`;
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function midiToSpanishName(midi: number, withOctave = true): string {
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return withOctave ? `${NOTE_NAMES_ES[pc]}${octave}` : NOTE_NAMES_ES[pc];
}

export function midiToIntlName(midi: number, withOctave = true): string {
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return withOctave ? `${NOTE_NAMES_INTL[pc]}${octave}` : NOTE_NAMES_INTL[pc];
}

export function isBlackKey(midi: number): boolean {
  const pc = ((midi % 12) + 12) % 12;
  return pc === 1 || pc === 3 || pc === 6 || pc === 8 || pc === 10;
}

export const INTERVALS: IntervalDefinition[] = [
  {
    id: '2m',
    semitones: 1,
    name: 'Segunda menor',
    shortName: '2m',
    character: 'Tensión muy cercana de 1 semitono, paso cromático inmediato.',
    contrastId: '2M',
    referenceHint: '1 semitono (sonido tenso y pegado)',
  },
  {
    id: '2M',
    semitones: 2,
    name: 'Segunda mayor',
    shortName: '2M',
    character: 'Paso diatónico completo de 2 semitonos (un tono entero).',
    contrastId: '2m',
    referenceHint: '2 semitonos (inicio de la escala mayor)',
  },
  {
    id: '3m',
    semitones: 3,
    name: 'Tercera menor',
    shortName: '3m',
    character: 'Sonido expresivo y melancólico de 3 semitonos; base de la tríada menor.',
    contrastId: '3M',
    referenceHint: '3 semitonos (carácter introspectivo o melancólico)',
  },
  {
    id: '3M',
    semitones: 4,
    name: 'Tercera mayor',
    shortName: '3M',
    character: 'Sonido luminoso y abierto de 4 semitonos; base de la tríada mayor.',
    contrastId: '3m',
    referenceHint: '4 semitonos (carácter brillante y estable)',
  },
  {
    id: '4J',
    semitones: 5,
    name: 'Cuarta justa',
    shortName: '4J',
    character: 'Salto firme y resonante de 5 semitonos, muy usado en fanfarrias.',
    contrastId: '5J',
    referenceHint: '5 semitonos (salto directo con impulso)',
  },
  {
    id: 'TT',
    semitones: 6,
    name: 'Tritono (4ª aum.)',
    shortName: 'TT',
    character: 'Intervalo inestable de 6 semitonos que divide la octava exactamente a la mitad.',
    contrastId: '5J',
    referenceHint: '6 semitonos (tensión armónica que pide resolución)',
  },
  {
    id: '5J',
    semitones: 7,
    name: 'Quinta justa',
    shortName: '5J',
    character: 'Consonancia abierta y poderosa de 7 semitonos, columna vertebral de la armonía.',
    contrastId: '4J',
    referenceHint: '7 semitonos (sonido amplio, hueco y estable)',
  },
  {
    id: '6m',
    semitones: 8,
    name: 'Sexta menor',
    shortName: '6m',
    character: 'Salto amplio y nostálgico de 8 semitonos.',
    contrastId: '6M',
    referenceHint: '8 semitonos (amplitud dramática)',
  },
  {
    id: '6M',
    semitones: 9,
    name: 'Sexta mayor',
    shortName: '6M',
    character: 'Salto amplio, cálido y cantable de 9 semitonos.',
    contrastId: '6m',
    referenceHint: '9 semitonos (amplitud dulce y luminosa)',
  },
  {
    id: '7m',
    semitones: 10,
    name: 'Séptima menor',
    shortName: '7m',
    character: 'Salto grande de 10 semitonos con carácter blues/dominante, un tono debajo de la octava.',
    contrastId: '7M',
    referenceHint: '10 semitonos (tensión suave antes de la octava)',
  },
  {
    id: '7M',
    semitones: 11,
    name: 'Séptima mayor',
    shortName: '7M',
    character: 'Salto muy amplio de 11 semitonos que roza la octava superior con gran brillo.',
    contrastId: '7m',
    referenceHint: '11 semitonos (sensible muy cercana a la octava)',
  },
  {
    id: '8J',
    semitones: 12,
    name: 'Octava justa',
    shortName: '8J',
    character: 'La misma nota duplicada en frecuencia exacta (12 semitonos).',
    contrastId: '7M',
    referenceHint: '12 semitonos (fusión total, misma nota más aguda)',
  },
];

export const INTERVAL_MAP: Record<string, IntervalDefinition> = Object.fromEntries(
  INTERVALS.map((i) => [i.id, i])
);

export const CHORDS: ChordDefinition[] = [
  {
    id: 'major',
    name: 'Acorde Mayor',
    shortName: 'Mayor',
    intervals: [0, 4, 7],
    character: 'Compuesto por 3ª mayor + 5ª justa (0-4-7). Sonido estable y luminoso.',
    contrastId: 'minor',
  },
  {
    id: 'minor',
    name: 'Acorde Menor',
    shortName: 'Menor',
    intervals: [0, 3, 7],
    character: 'Compuesto por 3ª menor + 5ª justa (0-3-7). Sonido introspectivo y melancólico.',
    contrastId: 'major',
  },
  {
    id: 'dim',
    name: 'Acorde Disminuido',
    shortName: 'Disminuido',
    intervals: [0, 3, 6],
    character: 'Dos terceras menores apiladas (0-3-6). Contiene un tritono tenso y cerrado.',
    contrastId: 'aug',
  },
  {
    id: 'aug',
    name: 'Acorde Aumentado',
    shortName: 'Aumentado',
    intervals: [0, 4, 8],
    character: 'Dos terceras mayores apiladas (0-4-8). Sonido simétrico, misterioso y suspendido.',
    contrastId: 'dim',
  },
  {
    id: 'maj7',
    name: 'Mayor 7 (Maj7)',
    shortName: 'Maj7',
    intervals: [0, 4, 7, 11],
    character: 'Tríada mayor con séptima mayor (0-4-7-11). Sonido cálido, jazzy y soñador.',
    contrastId: 'dom7',
  },
  {
    id: 'min7',
    name: 'Menor 7 (m7)',
    shortName: 'm7',
    intervals: [0, 3, 7, 10],
    character: 'Tríada menor con séptima menor (0-3-7-10). Sonido suave, soul y relajado.',
    contrastId: 'maj7',
  },
  {
    id: 'dom7',
    name: 'Dominante 7 (7)',
    shortName: '7 (Dom)',
    intervals: [0, 4, 7, 10],
    character: 'Tríada mayor con séptima menor (0-4-7-10). El tritono interno exige resolver a la tónica.',
    contrastId: 'maj7',
  },
  {
    id: 'm7b5',
    name: 'Semidisminuido (m7b5)',
    shortName: 'm7b5',
    intervals: [0, 3, 6, 10],
    character: 'Tríada disminuida con séptima menor (0-3-6-10). Tensión elegante, típica de II-V en menor.',
    contrastId: 'min7',
  },
];

export const CHORD_MAP: Record<string, ChordDefinition> = Object.fromEntries(
  CHORDS.map((c) => [c.id, c])
);

export function buildChordMidi(
  rootMidi: number,
  chordId: string,
  inversion: 0 | 1 | 2 = 0
): number[] {
  const def = CHORD_MAP[chordId] ?? CHORD_MAP.major;
  const notes = def.intervals.map((offset) => rootMidi + offset);
  const rotated = [...notes];
  for (let i = 0; i < inversion; i++) {
    const lowest = rotated.shift();
    if (lowest !== undefined) {
      rotated.push(lowest + 12);
    }
  }
  return rotated;
}

export const SCALES: ScaleDefinition[] = [
  {
    id: 'major',
    name: 'Escala Mayor',
    shortName: 'Mayor',
    intervals: [0, 2, 4, 5, 7, 9, 11, 12],
    character: 'Estructura T-T-S-T-T-T-S. Brillante, estable y con sensible hacia la tónica.',
    contrastId: 'natural_minor',
  },
  {
    id: 'natural_minor',
    name: 'Escala Menor Natural',
    shortName: 'Menor Nat.',
    intervals: [0, 2, 3, 5, 7, 8, 10, 12],
    character: 'Tercera, sexta y séptima menores (T-S-T-T-S-T-T). Carácter nostálgico y suave.',
    contrastId: 'major',
  },
  {
    id: 'harmonic_minor',
    name: 'Escala Menor Armónica',
    shortName: 'Menor Arm.',
    intervals: [0, 2, 3, 5, 7, 8, 11, 12],
    character: 'Como la menor natural pero con 7ª mayor: crea un salto exótico de 3 semitonos entre 6º y 7º grado.',
    contrastId: 'natural_minor',
  },
  {
    id: 'melodic_minor',
    name: 'Escala Menor Melódica',
    shortName: 'Menor Mel.',
    intervals: [0, 2, 3, 5, 7, 9, 11, 12],
    character: 'Tercera menor con 6º y 7º grados elevados (T-S-T-T-T-T-S). Cierre suave y luminoso hacia la tónica.',
    contrastId: 'harmonic_minor',
  },
  {
    id: 'pentatonic_major',
    name: 'Pentatónica Mayor',
    shortName: 'Pent. Mayor',
    intervals: [0, 2, 4, 7, 9, 12],
    character: '5 notas sin semitonos (1-2-3-5-6). Sonido abierto, alegre y folclórico.',
    contrastId: 'pentatonic_minor',
  },
  {
    id: 'pentatonic_minor',
    name: 'Pentatónica Menor',
    shortName: 'Pent. Menor',
    intervals: [0, 3, 5, 7, 10, 12],
    character: '5 notas (1-b3-4-5-b7). Base del rock, pop y la improvisación moderna.',
    contrastId: 'pentatonic_major',
  },
  {
    id: 'blues',
    name: 'Escala Blues (Menor)',
    shortName: 'Blues Menor',
    intervals: [0, 3, 5, 6, 7, 10, 12],
    character: 'Pentatónica menor con la "blue note" (b5 / 6 semitonos) que aporta el giro expresivo del blues.',
    contrastId: 'pentatonic_minor',
  },
  {
    id: 'blues_major',
    name: 'Escala Blues Mayor',
    shortName: 'Blues Mayor',
    intervals: [0, 2, 3, 4, 7, 9, 12],
    character: 'Pentatónica mayor con la "blue note" (b3 / 3 semitonos) que aporta un giro alegre y blusero.',
    contrastId: 'pentatonic_major',
  },
];

export const SCALE_MAP: Record<string, ScaleDefinition> = Object.fromEntries(
  SCALES.map((s) => [s.id, s])
);

export function buildScaleMidi(rootMidi: number, scaleId: string): number[] {
  const def = SCALE_MAP[scaleId] ?? SCALE_MAP.major;
  return def.intervals.map((offset) => rootMidi + offset);
}

export const CADENCES: ProgressionDefinition[] = [
  {
    id: 'authentic',
    roman: 'I – V – I',
    name: 'Cadencia Auténtica (I – V – I)',
    degrees: [
      { rootOffset: 0, quality: 'major', romanLabel: 'I' },
      { rootOffset: 7, quality: 'major', romanLabel: 'V' },
      { rootOffset: 0, quality: 'major', romanLabel: 'I' },
    ],
    description: 'Resolución concluyente desde la tensión dominante (V) hacia el reposo de la tónica (I).',
  },
  {
    id: 'plagal',
    roman: 'I – IV – I',
    name: 'Cadencia Plagal (I – IV – I)',
    degrees: [
      { rootOffset: 0, quality: 'major', romanLabel: 'I' },
      { rootOffset: 5, quality: 'major', romanLabel: 'IV' },
      { rootOffset: 0, quality: 'major', romanLabel: 'I' },
    ],
    description: 'Resolución suave y solemne ("Amén") desde la subdominante (IV) hacia la tónica (I).',
  },
  {
    id: 'half',
    roman: 'I – IV – V',
    name: 'Semicadencia (I – IV – V)',
    degrees: [
      { rootOffset: 0, quality: 'major', romanLabel: 'I' },
      { rootOffset: 5, quality: 'major', romanLabel: 'IV' },
      { rootOffset: 7, quality: 'major', romanLabel: 'V' },
    ],
    description: 'Termina en el acorde dominante (V), dejando una sensación abierta de suspenso.',
  },
  {
    id: 'deceptive',
    roman: 'I – V – vi',
    name: 'Cadencia Rota (I – V – vi)',
    degrees: [
      { rootOffset: 0, quality: 'major', romanLabel: 'I' },
      { rootOffset: 7, quality: 'major', romanLabel: 'V' },
      { rootOffset: 9, quality: 'minor', romanLabel: 'vi' },
    ],
    description: 'El dominante (V) sorprende al resolver al sexto grado menor (vi) en lugar de la tónica.',
  },
];

export const POPULAR_PROGRESSIONS: ProgressionDefinition[] = [
  {
    id: 'pop_1564',
    roman: 'I – V – vi – IV',
    name: 'Progresión Pop (I – V – vi – IV)',
    degrees: [
      { rootOffset: 0, quality: 'major', romanLabel: 'I' },
      { rootOffset: 7, quality: 'major', romanLabel: 'V' },
      { rootOffset: 9, quality: 'minor', romanLabel: 'vi' },
      { rootOffset: 5, quality: 'major', romanLabel: 'IV' },
    ],
    description: 'La progresión más reconocible de la música popular moderna.',
  },
  {
    id: 'classic_1451',
    roman: 'I – IV – V – I',
    name: 'Clásica Funcional (I – IV – V – I)',
    degrees: [
      { rootOffset: 0, quality: 'major', romanLabel: 'I' },
      { rootOffset: 5, quality: 'major', romanLabel: 'IV' },
      { rootOffset: 7, quality: 'major', romanLabel: 'V' },
      { rootOffset: 0, quality: 'major', romanLabel: 'I' },
    ],
    description: 'Recorrido completo: reposo (I), apertura (IV), tensión (V) y resolución (I).',
  },
  {
    id: 'jazz_251',
    roman: 'ii – V – I – I',
    name: 'Giro Jazz / Cadencial (ii – V – I)',
    degrees: [
      { rootOffset: 2, quality: 'minor', romanLabel: 'ii' },
      { rootOffset: 7, quality: 'major', romanLabel: 'V' },
      { rootOffset: 0, quality: 'major', romanLabel: 'I' },
      { rootOffset: 0, quality: 'major', romanLabel: 'I' },
    ],
    description: 'Inicia con el segundo grado menor (ii), sube al dominante (V) y descansa en la tónica (I).',
  },
  {
    id: 'doowop_1645',
    roman: 'I – vi – IV – V',
    name: 'Balada Clásica (I – vi – IV – V)',
    degrees: [
      { rootOffset: 0, quality: 'major', romanLabel: 'I' },
      { rootOffset: 9, quality: 'minor', romanLabel: 'vi' },
      { rootOffset: 5, quality: 'major', romanLabel: 'IV' },
      { rootOffset: 7, quality: 'major', romanLabel: 'V' },
    ],
    description: 'Pasa de la tónica mayor a su relativo menor (vi), luego subdominante y dominante.',
  },
];

export function buildProgressionChordVoicing(
  keyRootMidi: number,
  rootOffset: number,
  quality: 'major' | 'minor' | 'dim'
): number[] {
  const bass = keyRootMidi - 12 + rootOffset;
  const chordRoot = keyRootMidi + rootOffset;
  const intervals =
    quality === 'major' ? [0, 4, 7] : quality === 'minor' ? [0, 3, 7] : [0, 3, 6];
  // Voice-lead upper notes cleanly into C4..G5 range
  const upper = intervals.map((iv) => {
    let note = chordRoot + iv;
    while (note > keyRootMidi + 14) note -= 12;
    while (note < keyRootMidi) note += 12;
    return note;
  });
  return [bass, ...upper.sort((a, b) => a - b)];
}

export const RHYTHM_PATTERNS: RhythmPatternDefinition[] = [
  {
    id: 'pulse_quarters',
    name: 'Cuatro negras estables',
    notation: '1 - 2 - 3 - 4',
    tokens: ['quarter', 'quarter', 'quarter', 'quarter'],
    category: 'pulse',
    beatsCount: 4,
    onsets: [0, 1, 2, 3],
    steps16: [0, 4, 8, 12],
    description: 'Un golpe exacto en cada uno de los cuatro tiempos del compás.',
  },
  {
    id: 'pulse_halfs',
    name: 'Dos blancas (tiempos 1 y 3)',
    notation: '1 - - 3 - -',
    tokens: ['half', 'half'],
    category: 'pulse',
    beatsCount: 4,
    onsets: [0, 2],
    steps16: [0, 8],
    description: 'Dos golpes largos espaciados cada dos pulsos (tiempos 1 y 3).',
  },
  {
    id: 'fig_eighths_b2',
    name: 'Negra, dos corcheas, negra, negra',
    notation: '1 - 2& - 3 - 4',
    tokens: ['quarter', 'eighth-pair', 'quarter', 'quarter'],
    category: 'figures',
    beatsCount: 4,
    onsets: [0, 1, 1.5, 2, 3],
    steps16: [0, 4, 6, 8, 12],
    description: 'El segundo pulso se subdivide en dos corcheas iguales.',
  },
  {
    id: 'fig_eighths_b3',
    name: 'Negra, negra, dos corcheas, negra',
    notation: '1 - 2 - 3& - 4',
    tokens: ['quarter', 'quarter', 'eighth-pair', 'quarter'],
    category: 'figures',
    beatsCount: 4,
    onsets: [0, 1, 2, 2.5, 3],
    steps16: [0, 4, 8, 10, 12],
    description: 'La subdivisión en dos corcheas ocurre en el tercer tiempo.',
  },
  {
    id: 'fig_double_eighths',
    name: 'Par de corcheas y negras',
    notation: '1& - 2 - 3& - 4',
    tokens: ['eighth-pair', 'quarter', 'eighth-pair', 'quarter'],
    category: 'figures',
    beatsCount: 4,
    onsets: [0, 0.5, 1, 2, 2.5, 3],
    steps16: [0, 2, 4, 8, 10, 12],
    description: 'Alterna dos corcheas en tiempos 1 y 3 con negras en tiempos 2 y 4.',
  },
  {
    id: 'fig_half_eighths',
    name: 'Blanca seguida de corcheas y negra',
    notation: '1 - - 3& - 4',
    tokens: ['half', 'eighth-pair', 'quarter'],
    category: 'figures',
    beatsCount: 4,
    onsets: [0, 2, 2.5, 3],
    steps16: [0, 8, 10, 12],
    description: 'Sonido largo en los tiempos 1-2 y cierre activo en los tiempos 3 y 4.',
  },
  {
    id: 'sync_and2',
    name: 'Síncopa en el contratiempo del 2',
    notation: '1 - (&2) - 4',
    tokens: ['quarter', 'rest-eighth', 'eighth-tie-quarter', 'quarter'],
    category: 'syncopation',
    beatsCount: 4,
    onsets: [0, 1.5, 3],
    steps16: [0, 6, 12],
    description: 'El acento se desplaza al "y" del segundo pulso (1.5), omitiendo el tiempo 3.',
  },
  {
    id: 'sync_clave',
    name: 'Síncopa desplazada (1, 2-y, 4)',
    notation: '1 - 2 &2 &3 - 4',
    tokens: ['quarter', 'syncopation', 'quarter'],
    category: 'syncopation',
    beatsCount: 4,
    onsets: [0, 1, 1.5, 2.5, 3],
    steps16: [0, 4, 6, 10, 12],
    description: 'Anticipación en el contratiempo del 2 y el contratiempo del 3.',
  },
  {
    id: 'sync_tresillo_lat',
    name: 'Patrón Tresillo (1, 2-y, 4)',
    notation: '3 + 3 + 2',
    tokens: ['dotted-quarter', 'dotted-quarter', 'quarter'],
    category: 'syncopation',
    beatsCount: 4,
    onsets: [0, 1.5, 3],
    steps16: [0, 6, 12],
    description: 'División clásica 3+3+2 en corcheas, base de la música latina y pop.',
  },
  {
    id: 'sync_offbeat',
    name: 'Contratiempo en el 3-y',
    notation: '1 - 2 - &3 - &4',
    tokens: ['quarter', 'quarter', 'rest-eighth', 'eighth', 'rest-eighth', 'eighth'],
    category: 'syncopation',
    beatsCount: 4,
    onsets: [0, 1, 2.5, 3.5],
    steps16: [0, 4, 10, 14],
    description: 'Dos negras firmes seguidas de dos acentos desplazados en contratiempo.',
  },
];

export const RHYTHM_MAP: Record<string, RhythmPatternDefinition> = Object.fromEntries(
  RHYTHM_PATTERNS.map((r) => [r.id, r])
);
