import { SkillCategory } from '../types/music';
import { Language } from './types';

export const NOTE_NAMES_LATIN = [
  'Do',
  'Do#',
  'Re',
  'Re#',
  'Mi',
  'Fa',
  'Fa#',
  'Sol',
  'Sol#',
  'La',
  'La#',
  'Si',
] as const;

export const NOTE_NAMES_EN = [
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

export function getNoteNames(lang: Language): readonly string[] {
  return lang === 'en' ? NOTE_NAMES_EN : NOTE_NAMES_LATIN;
}

export function formatMidiNote(midi: number, lang: Language, withOctave = true): string {
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const names = getNoteNames(lang);
  return withOctave ? `${names[pc]}${octave}` : names[pc];
}

export function getGuitarOpenStringLabels(lang: Language): readonly [string, string, string, string, string, string] {
  if (lang === 'en') {
    return ['E4', 'B3', 'G3', 'D3', 'A2', 'E2'];
  }
  return ['Mi4', 'Si3', 'Sol3', 'Re3', 'La2', 'Mi2'];
}

export const SKILL_LABELS_I18N: Record<Language, Record<SkillCategory, string>> = {
  es: {
    pitch: 'Altura y Dirección',
    intervals: 'Intervalos',
    chords: 'Acordes',
    scales: 'Escalas',
    harmony: 'Armonía y Cadencias',
    melody: 'Melodía y Memoria',
    rhythm: 'Ritmo y Precisión',
  },
  en: {
    pitch: 'Pitch & Direction',
    intervals: 'Intervals',
    chords: 'Chords',
    scales: 'Scales',
    harmony: 'Harmony & Cadences',
    melody: 'Melody & Memory',
    rhythm: 'Rhythm & Precision',
  },
  pt: {
    pitch: 'Altura e Direção',
    intervals: 'Intervalos',
    chords: 'Acordes',
    scales: 'Escalas',
    harmony: 'Harmonia e Cadências',
    melody: 'Melodia e Memória',
    rhythm: 'Ritmo e Precisão',
  },
};

export interface LocalizedInterval {
  name: string;
  shortName: string;
  character: string;
}

export const INTERVALS_I18N: Record<Language, Record<string, LocalizedInterval>> = {
  es: {
    '2m': {
      name: 'Segunda menor',
      shortName: '2m',
      character: 'Tensión muy cercana de 1 semitono, paso cromático inmediato.',
    },
    '2M': {
      name: 'Segunda mayor',
      shortName: '2M',
      character: 'Paso diatónico completo de 2 semitonos (un tono entero).',
    },
    '3m': {
      name: 'Tercera menor',
      shortName: '3m',
      character: 'Sonido expresivo y melancólico de 3 semitonos; base de la tríada menor.',
    },
    '3M': {
      name: 'Tercera mayor',
      shortName: '3M',
      character: 'Sonido luminoso y abierto de 4 semitonos; base de la tríada mayor.',
    },
    '4J': {
      name: 'Cuarta justa',
      shortName: '4J',
      character: 'Salto firme y resonante de 5 semitonos, muy usado en fanfarrias.',
    },
    TT: {
      name: 'Tritono (4ª aum.)',
      shortName: 'TT',
      character: 'Intervalo inestable de 6 semitonos que divide la octava exactamente a la mitad.',
    },
    '5J': {
      name: 'Quinta justa',
      shortName: '5J',
      character: 'Consonancia abierta y poderosa de 7 semitonos, columna vertebral de la armonía.',
    },
    '6m': {
      name: 'Sexta menor',
      shortName: '6m',
      character: 'Salto amplio y nostálgico de 8 semitonos.',
    },
    '6M': {
      name: 'Sexta mayor',
      shortName: '6M',
      character: 'Salto amplio, cálido y cantable de 9 semitonos.',
    },
    '7m': {
      name: 'Séptima menor',
      shortName: '7m',
      character: 'Salto grande de 10 semitonos con carácter blues/dominante, un tono debajo de la octava.',
    },
    '7M': {
      name: 'Séptima mayor',
      shortName: '7M',
      character: 'Salto muy amplio de 11 semitonos que roza la octava superior con gran brillo.',
    },
    '8J': {
      name: 'Octava justa',
      shortName: '8J',
      character: 'La misma nota duplicada en frecuencia exacta (12 semitonos).',
    },
  },
  en: {
    '2m': {
      name: 'Minor 2nd',
      shortName: 'm2',
      character: 'Close 1-semitone tension, an immediate chromatic half step.',
    },
    '2M': {
      name: 'Major 2nd',
      shortName: 'M2',
      character: 'Full diatonic 2-semitone step (one whole tone).',
    },
    '3m': {
      name: 'Minor 3rd',
      shortName: 'm3',
      character: 'Expressive, melancholic 3-semitone sound; foundation of the minor triad.',
    },
    '3M': {
      name: 'Major 3rd',
      shortName: 'M3',
      character: 'Bright, open 4-semitone sound; foundation of the major triad.',
    },
    '4J': {
      name: 'Perfect 4th',
      shortName: 'P4',
      character: 'Firm, resonant 5-semitone leap, classic in fanfares.',
    },
    TT: {
      name: 'Tritone (Aug 4th)',
      shortName: 'TT',
      character: 'Unstable 6-semitone interval that splits the octave exactly in half.',
    },
    '5J': {
      name: 'Perfect 5th',
      shortName: 'P5',
      character: 'Open, powerful 7-semitone consonance, the backbone of harmony.',
    },
    '6m': {
      name: 'Minor 6th',
      shortName: 'm6',
      character: 'Wide, nostalgic 8-semitone leap.',
    },
    '6M': {
      name: 'Major 6th',
      shortName: 'M6',
      character: 'Wide, warm, singable 9-semitone leap.',
    },
    '7m': {
      name: 'Minor 7th',
      shortName: 'm7',
      character: 'Large 10-semitone blues/dominant leap, one whole step below the octave.',
    },
    '7M': {
      name: 'Major 7th',
      shortName: 'M7',
      character: 'Very wide 11-semitone leap brushing right beneath the upper octave with bright shimmer.',
    },
    '8J': {
      name: 'Perfect Octave',
      shortName: 'P8',
      character: 'The same note doubled in exact frequency (12 semitones).',
    },
  },
  pt: {
    '2m': {
      name: 'Segunda menor',
      shortName: '2m',
      character: 'Tensão muito próxima de 1 semitom, passo cromático imediato.',
    },
    '2M': {
      name: 'Segunda maior',
      shortName: '2M',
      character: 'Passo diatônico completo de 2 semitons (um tom inteiro).',
    },
    '3m': {
      name: 'Terça menor',
      shortName: '3m',
      character: 'Som expressivo e melancólico de 3 semitons; base da tríade menor.',
    },
    '3M': {
      name: 'Terça maior',
      shortName: '3M',
      character: 'Som luminoso e aberto de 4 semitons; base da tríade maior.',
    },
    '4J': {
      name: 'Quarta justa',
      shortName: '4J',
      character: 'Salto firme e ressonante de 5 semitons, muito usado em fanfarras.',
    },
    TT: {
      name: 'Trítono (4ª aum.)',
      shortName: 'TT',
      character: 'Intervalo instável de 6 semitons que divide a oitava exatamente ao meio.',
    },
    '5J': {
      name: 'Quinta justa',
      shortName: '5J',
      character: 'Consonância aberta e poderosa de 7 semitons, espinha dorsal da harmonia.',
    },
    '6m': {
      name: 'Sexta menor',
      shortName: '6m',
      character: 'Salto amplo e nostálgico de 8 semitons.',
    },
    '6M': {
      name: 'Sexta maior',
      shortName: '6M',
      character: 'Salto amplo, caloroso e cantável de 9 semitons.',
    },
    '7m': {
      name: 'Sétima menor',
      shortName: '7m',
      character: 'Salto grande de 10 semitons com caráter blues/dominante, um tom abaixo da oitava.',
    },
    '7M': {
      name: 'Sétima maior',
      shortName: '7M',
      character: 'Salto muito amplo de 11 semitons que roça a oitava superior com grande brilho.',
    },
    '8J': {
      name: 'Oitava justa',
      shortName: '8J',
      character: 'A mesma nota duplicada em frequência exata (12 semitons).',
    },
  },
};

export interface LocalizedChord {
  name: string;
  shortName: string;
  character: string;
}

export const CHORDS_I18N: Record<Language, Record<string, LocalizedChord>> = {
  es: {
    major: {
      name: 'Acorde Mayor',
      shortName: 'Mayor',
      character: 'Compuesto por 3ª mayor + 5ª justa (0-4-7). Sonido estable y luminoso.',
    },
    minor: {
      name: 'Acorde Menor',
      shortName: 'Menor',
      character: 'Compuesto por 3ª menor + 5ª justa (0-3-7). Sonido introspectivo y melancólico.',
    },
    dim: {
      name: 'Acorde Disminuido',
      shortName: 'Disminuido',
      character: 'Dos terceras menores apiladas (0-3-6). Contiene un tritono tenso y cerrado.',
    },
    aug: {
      name: 'Acorde Aumentado',
      shortName: 'Aumentado',
      character: 'Dos terceras mayores apiladas (0-4-8). Sonido simétrico, misterioso y suspendido.',
    },
    maj7: {
      name: 'Mayor 7 (Maj7)',
      shortName: 'Maj7',
      character: 'Tríada mayor con séptima mayor (0-4-7-11). Sonido cálido, jazzy y soñador.',
    },
    min7: {
      name: 'Menor 7 (m7)',
      shortName: 'm7',
      character: 'Tríada menor con séptima menor (0-3-7-10). Sonido suave, soul y relajado.',
    },
    dom7: {
      name: 'Dominante 7 (7)',
      shortName: '7 (Dom)',
      character: 'Tríada mayor con séptima menor (0-4-7-10). El tritono interno exige resolver a la tónica.',
    },
    m7b5: {
      name: 'Semidisminuido (m7b5)',
      shortName: 'm7b5',
      character: 'Tríada disminuida con séptima menor (0-3-6-10). Tensión elegante, típica de II-V en menor.',
    },
  },
  en: {
    major: {
      name: 'Major Chord',
      shortName: 'Major',
      character: 'Built from a major 3rd + perfect 5th (0-4-7). Bright, stable sound.',
    },
    minor: {
      name: 'Minor Chord',
      shortName: 'Minor',
      character: 'Built from a minor 3rd + perfect 5th (0-3-7). Introspective, melancholic color.',
    },
    dim: {
      name: 'Diminished Chord',
      shortName: 'Dim',
      character: 'Two stacked minor 3rds (0-3-6). Contains a tense, compact tritone.',
    },
    aug: {
      name: 'Augmented Chord',
      shortName: 'Aug',
      character: 'Two stacked major 3rds (0-4-8). Symmetrical, mysterious, suspended feel.',
    },
    maj7: {
      name: 'Major 7 (Maj7)',
      shortName: 'Maj7',
      character: 'Major triad plus major 7th (0-4-7-11). Warm, dreamy, jazzy resonance.',
    },
    min7: {
      name: 'Minor 7 (m7)',
      shortName: 'm7',
      character: 'Minor triad plus minor 7th (0-3-7-10). Smooth, soulful, relaxed color.',
    },
    dom7: {
      name: 'Dominant 7 (7)',
      shortName: '7 (Dom)',
      character: 'Major triad plus minor 7th (0-4-7-10). Its inner tritone pulls toward the tonic.',
    },
    m7b5: {
      name: 'Half-Diminished (m7b5)',
      shortName: 'm7b5',
      character: 'Diminished triad plus minor 7th (0-3-6-10). Elegant tension typical of minor ii-V.',
    },
  },
  pt: {
    major: {
      name: 'Acorde Maior',
      shortName: 'Maior',
      character: 'Composto por 3ª maior + 5ª justa (0-4-7). Som estável e luminoso.',
    },
    minor: {
      name: 'Acorde Menor',
      shortName: 'Menor',
      character: 'Composto por 3ª menor + 5ª justa (0-3-7). Som introspectivo e melancólico.',
    },
    dim: {
      name: 'Acorde Diminuto',
      shortName: 'Diminuto',
      character: 'Duas terças menores empilhadas (0-3-6). Contém um trítono tenso e fechado.',
    },
    aug: {
      name: 'Acorde Aumentado',
      shortName: 'Aumentado',
      character: 'Duas terças maiores empilhadas (0-4-8). Som simétrico, misterioso e suspenso.',
    },
    maj7: {
      name: 'Maior com 7ª (Maj7)',
      shortName: 'Maj7',
      character: 'Tríade maior com sétima maior (0-4-7-11). Som caloroso, jazzístico e sonhador.',
    },
    min7: {
      name: 'Menor com 7ª (m7)',
      shortName: 'm7',
      character: 'Tríade menor com sétima menor (0-3-7-10). Som suave, soul e relaxado.',
    },
    dom7: {
      name: 'Dominante 7 (7)',
      shortName: '7 (Dom)',
      character: 'Tríade maior com sétima menor (0-4-7-10). O trítono interno pede resolução à tônica.',
    },
    m7b5: {
      name: 'Meio-diminuto (m7b5)',
      shortName: 'm7b5',
      character: 'Tríade diminuta com sétima menor (0-3-6-10). Tensão elegante, típica de II-V menor.',
    },
  },
};

export interface LocalizedScale {
  name: string;
  shortName: string;
  character: string;
}

export const SCALES_I18N: Record<Language, Record<string, LocalizedScale>> = {
  es: {
    major: {
      name: 'Escala Mayor',
      shortName: 'Mayor',
      character: 'Estructura T-T-S-T-T-T-S. Brillante, estable y con sensible hacia la tónica.',
    },
    natural_minor: {
      name: 'Escala Menor Natural',
      shortName: 'Menor Nat.',
      character: 'Tercera, sexta y séptima menores (T-S-T-T-S-T-T). Carácter nostálgico y suave.',
    },
    harmonic_minor: {
      name: 'Escala Menor Armónica',
      shortName: 'Menor Arm.',
      character: 'Como la menor natural pero con 7ª mayor: crea un salto exótico de 3 semitonos entre 6º y 7º grado.',
    },
    melodic_minor: {
      name: 'Escala Menor Melódica',
      shortName: 'Menor Mel.',
      character: 'Tercera menor con 6º y 7º grados elevados (T-S-T-T-T-T-S). Cierre suave y luminoso hacia la tónica.',
    },
    pentatonic_major: {
      name: 'Pentatónica Mayor',
      shortName: 'Pent. Mayor',
      character: '5 notas sin semitonos (1-2-3-5-6). Sonido abierto, alegre y folclórico.',
    },
    pentatonic_minor: {
      name: 'Pentatónica Menor',
      shortName: 'Pent. Menor',
      character: '5 notas (1-b3-4-5-b7). Base del rock, pop y la improvisación moderna.',
    },
    blues: {
      name: 'Escala Blues (Menor)',
      shortName: 'Blues Menor',
      character: 'Pentatónica menor con la "blue note" (b5 / 6 semitonos) que aporta el giro expresivo del blues.',
    },
    blues_major: {
      name: 'Escala Blues Mayor',
      shortName: 'Blues Mayor',
      character: 'Pentatónica mayor con la "blue note" (b3 / 3 semitonos) que aporta un giro alegre y blusero.',
    },
  },
  en: {
    major: {
      name: 'Major Scale',
      shortName: 'Major',
      character: 'W-W-H-W-W-W-H formula. Bright, stable, with a leading tone pulling to the tonic.',
    },
    natural_minor: {
      name: 'Natural Minor Scale',
      shortName: 'Nat. Minor',
      character: 'Minor 3rd, 6th, and 7th (W-H-W-W-H-W-W). Nostalgic, smooth character.',
    },
    harmonic_minor: {
      name: 'Harmonic Minor Scale',
      shortName: 'Harm. Minor',
      character: 'Natural minor with a raised 7th: creates an exotic 3-semitone leap between degrees 6 and 7.',
    },
    melodic_minor: {
      name: 'Melodic Minor Scale',
      shortName: 'Mel. Minor',
      character: 'Minor 3rd with raised 6th and 7th degrees (W-H-W-W-W-W-H). Smooth, bright finish toward the tonic.',
    },
    pentatonic_major: {
      name: 'Major Pentatonic',
      shortName: 'Maj. Pent.',
      character: '5 notes with no half steps (1-2-3-5-6). Open, joyful, folk-like sound.',
    },
    pentatonic_minor: {
      name: 'Minor Pentatonic',
      shortName: 'Min. Pent.',
      character: '5 notes (1-b3-4-5-b7). Backbone of rock, pop, and modern improvisation.',
    },
    blues: {
      name: 'Blues Scale (Minor)',
      shortName: 'Minor Blues',
      character: 'Minor pentatonic plus the "blue note" (b5 / 6 semitones) for expressive blues flavor.',
    },
    blues_major: {
      name: 'Major Blues Scale',
      shortName: 'Major Blues',
      character: 'Major pentatonic plus the "blue note" (b3 / 3 semitones) for an upbeat, soulful blues turn.',
    },
  },
  pt: {
    major: {
      name: 'Escala Maior',
      shortName: 'Maior',
      character: 'Estrutura T-T-S-T-T-T-S. Brilhante, estável e com sensível rumo à tônica.',
    },
    natural_minor: {
      name: 'Escala Menor Natural',
      shortName: 'Menor Nat.',
      character: 'Terça, sexta e sétima menores (T-S-T-T-S-T-T). Caráter nostálgico e suave.',
    },
    harmonic_minor: {
      name: 'Escala Menor Harmônica',
      shortName: 'Menor Harm.',
      character: 'Como a menor natural mas com 7ª maior: cria um salto exótico de 3 semitons entre o 6º e o 7º grau.',
    },
    melodic_minor: {
      name: 'Escala Menor Melódica',
      shortName: 'Menor Mel.',
      character: 'Terça menor com 6º e 7º graus elevados (T-S-T-T-T-T-S). Fechamento suave e luminoso rumo à tônica.',
    },
    pentatonic_major: {
      name: 'Pentatônica Maior',
      shortName: 'Pent. Maior',
      character: '5 notas sem semitons (1-2-3-5-6). Som aberto, alegre e folclórico.',
    },
    pentatonic_minor: {
      name: 'Pentatônica Menor',
      shortName: 'Pent. Menor',
      character: '5 notas (1-b3-4-5-b7). Base do rock, pop e da improvisação moderna.',
    },
    blues: {
      name: 'Escala Blues (Menor)',
      shortName: 'Blues Menor',
      character: 'Pentatônica menor com a "blue note" (b5 / 6 semitons) que traz o toque expressivo do blues.',
    },
    blues_major: {
      name: 'Escala Blues Maior',
      shortName: 'Blues Maior',
      character: 'Pentatônica maior com a "blue note" (b3 / 3 semitons) que traz um toque alegre e bluseiro.',
    },
  },
};

export interface LocalizedProgression {
  name: string;
  description: string;
}

export const PROGRESSIONS_I18N: Record<Language, Record<string, LocalizedProgression>> = {
  es: {
    authentic: {
      name: 'Cadencia Auténtica (I – V – I)',
      description: 'Resolución concluyente desde la tensión dominante (V) hacia el reposo de la tónica (I).',
    },
    plagal: {
      name: 'Cadencia Plagal (I – IV – I)',
      description: 'Resolución suave y solemne ("Amén") desde la subdominante (IV) hacia la tónica (I).',
    },
    half: {
      name: 'Semicadencia (I – IV – V)',
      description: 'Termina en el acorde dominante (V), dejando una sensación abierta de suspenso.',
    },
    deceptive: {
      name: 'Cadencia Rota (I – V – vi)',
      description: 'El dominante (V) sorprende al resolver al sexto grado menor (vi) en lugar de la tónica.',
    },
    pop_1564: {
      name: 'Progresión Pop (I – V – vi – IV)',
      description: 'La progresión más reconocible de la música popular moderna.',
    },
    classic_1451: {
      name: 'Clásica Funcional (I – IV – V – I)',
      description: 'Recorrido completo: reposo (I), apertura (IV), tensión (V) y resolución (I).',
    },
    jazz_251: {
      name: 'Giro Jazz / Cadencial (ii – V – I)',
      description: 'Inicia con el segundo grado menor (ii), sube al dominante (V) y descansa en la tónica (I).',
    },
    doowop_1645: {
      name: 'Balada Clásica (I – vi – IV – V)',
      description: 'Pasa de la tónica mayor a su relativo menor (vi), luego subdominante y dominante.',
    },
  },
  en: {
    authentic: {
      name: 'Authentic Cadence (I – V – I)',
      description: 'Conclusive resolution from dominant tension (V) home to the tonic (I).',
    },
    plagal: {
      name: 'Plagal Cadence (I – IV – I)',
      description: 'Gentle, solemn ("Amen") resolution from the subdominant (IV) to the tonic (I).',
    },
    half: {
      name: 'Half Cadence (I – IV – V)',
      description: 'Ends on the dominant chord (V), leaving an open feeling of suspense.',
    },
    deceptive: {
      name: 'Deceptive Cadence (I – V – vi)',
      description: 'The dominant (V) surprises by resolving to the minor sixth degree (vi) instead of the tonic.',
    },
    pop_1564: {
      name: 'Pop Progression (I – V – vi – IV)',
      description: 'The most recognizable chord progression in modern popular music.',
    },
    classic_1451: {
      name: 'Classic Functional (I – IV – V – I)',
      description: 'Complete tonal arc: home (I), departure (IV), tension (V), and resolution (I).',
    },
    jazz_251: {
      name: 'Jazz Turnaround (ii – V – I)',
      description: 'Starts on the minor second degree (ii), moves to dominant (V), and resolves to tonic (I).',
    },
    doowop_1645: {
      name: 'Classic Ballad (I – vi – IV – V)',
      description: 'Moves from major tonic to relative minor (vi), then subdominant and dominant.',
    },
  },
  pt: {
    authentic: {
      name: 'Cadência Autêntica (I – V – I)',
      description: 'Resolução conclusiva da tensão dominante (V) para o repouso da tônica (I).',
    },
    plagal: {
      name: 'Cadência Plagal (I – IV – I)',
      description: 'Resolução suave e solene ("Amém") da subdominante (IV) para a tônica (I).',
    },
    half: {
      name: 'Semicadência (I – IV – V)',
      description: 'Termina no acorde dominante (V), deixando uma sensação aberta de suspense.',
    },
    deceptive: {
      name: 'Cadência Deceptiva (I – V – vi)',
      description: 'O dominante (V) surpreende ao resolver no sexto grau menor (vi) em vez da tônica.',
    },
    pop_1564: {
      name: 'Progressão Pop (I – V – vi – IV)',
      description: 'A progressão mais reconhecível da música popular moderna.',
    },
    classic_1451: {
      name: 'Clássica Funcional (I – IV – V – I)',
      description: 'Percurso completo: repouso (I), abertura (IV), tensão (V) e resolução (I).',
    },
    jazz_251: {
      name: 'Cadência Jazz (ii – V – I)',
      description: 'Inicia no segundo grau menor (ii), vai ao dominante (V) e repousa na tônica (I).',
    },
    doowop_1645: {
      name: 'Balada Clássica (I – vi – IV – V)',
      description: 'Vai da tônica maior ao relativo menor (vi), depois subdominante e dominante.',
    },
  },
};

export interface LocalizedRhythm {
  name: string;
  description: string;
}

export const RHYTHMS_I18N: Record<Language, Record<string, LocalizedRhythm>> = {
  es: {
    pulse_quarters: {
      name: 'Cuatro negras estables',
      description: 'Un golpe exacto en cada uno de los cuatro tiempos del compás.',
    },
    pulse_halfs: {
      name: 'Dos blancas (tiempos 1 y 3)',
      description: 'Dos golpes largos espaciados cada dos pulsos (tiempos 1 y 3).',
    },
    fig_eighths_b2: {
      name: 'Negra, dos corcheas, negra, negra',
      description: 'El segundo pulso se subdivide en dos corcheas iguales.',
    },
    fig_eighths_b3: {
      name: 'Negra, negra, dos corcheas, negra',
      description: 'La subdivisión en dos corcheas ocurre en el tercer tiempo.',
    },
    fig_double_eighths: {
      name: 'Par de corcheas y negras',
      description: 'Alterna dos corcheas en tiempos 1 y 3 con negras en tiempos 2 y 4.',
    },
    fig_half_eighths: {
      name: 'Blanca seguida de corcheas y negra',
      description: 'Sonido largo en los tiempos 1-2 y cierre activo en los tiempos 3 y 4.',
    },
    sync_and2: {
      name: 'Síncopa en el contratiempo del 2',
      description: 'El acento se desplaza al "y" del segundo pulso (1.5), omitiendo el tiempo 3.',
    },
    sync_clave: {
      name: 'Síncopa desplazada (1, 2-y, 4)',
      description: 'Anticipación en el contratiempo del 2 y el contratiempo del 3.',
    },
    sync_tresillo_lat: {
      name: 'Patrón Tresillo (1, 2-y, 4)',
      description: 'División clásica 3+3+2 en corcheas, base de la música latina y pop.',
    },
    sync_offbeat: {
      name: 'Contratiempo en el 3-y',
      description: 'Dos negras firmes seguidas de dos acentos desplazados en contratiempo.',
    },
  },
  en: {
    pulse_quarters: {
      name: 'Four steady quarter notes',
      description: 'One crisp hit on each of the four beats in the measure.',
    },
    pulse_halfs: {
      name: 'Two half notes (beats 1 & 3)',
      description: 'Two sustained hits spaced every two beats (beats 1 and 3).',
    },
    fig_eighths_b2: {
      name: 'Quarter, two eighths, quarter, quarter',
      description: 'The second beat subdivides evenly into two eighth notes.',
    },
    fig_eighths_b3: {
      name: 'Quarter, quarter, two eighths, quarter',
      description: 'The two-eighth-note subdivision happens on beat three.',
    },
    fig_double_eighths: {
      name: 'Alternating eighths and quarters',
      description: 'Alternates paired eighth notes on beats 1 & 3 with quarters on beats 2 & 4.',
    },
    fig_half_eighths: {
      name: 'Half note, two eighths, quarter',
      description: 'Long sound across beats 1–2 followed by an active finish on beats 3 and 4.',
    },
    sync_and2: {
      name: 'Syncopation on the "and" of 2',
      description: 'The accent shifts to the offbeat of beat 2 (1.5), skipping beat 3.',
    },
    sync_clave: {
      name: 'Displaced syncopation (1, 2-and, 4)',
      description: 'Anticipation on the offbeats of beats 2 and 3.',
    },
    sync_tresillo_lat: {
      name: 'Tresillo Pattern (1, 2-and, 4)',
      description: 'Classic 3+3+2 eighth-note grouping, foundation of Latin and pop grooves.',
    },
    sync_offbeat: {
      name: 'Offbeat accent on 3-and',
      description: 'Two firm quarter notes followed by two syncopated offbeat hits.',
    },
  },
  pt: {
    pulse_quarters: {
      name: 'Quatro semínimas estáveis',
      description: 'Um golpe exato em cada um dos quatro tempos do compasso.',
    },
    pulse_halfs: {
      name: 'Duas mínimas (tempos 1 e 3)',
      description: 'Dois golpes longos espaçados a cada dois pulsos (tempos 1 e 3).',
    },
    fig_eighths_b2: {
      name: 'Semínima, duas colcheias, semínima, semínima',
      description: 'O segundo pulso se subdivide em duas colcheias iguais.',
    },
    fig_eighths_b3: {
      name: 'Semínima, semínima, duas colcheias, semínima',
      description: 'A subdivisão em duas colcheias ocorre no terceiro tempo.',
    },
    fig_double_eighths: {
      name: 'Par de colcheias e semínimas',
      description: 'Alterna duas colcheias nos tempos 1 e 3 com semínimas nos tempos 2 e 4.',
    },
    fig_half_eighths: {
      name: 'Mínima seguida de colcheias e semínima',
      description: 'Som longo nos tempos 1-2 e encerramento ativo nos tempos 3 e 4.',
    },
    sync_and2: {
      name: 'Síncope no contratempo do 2',
      description: 'O acento se desloca para o "e" do segundo pulso (1.5), omitindo o tempo 3.',
    },
    sync_clave: {
      name: 'Síncope deslocada (1, 2-e, 4)',
      description: 'Antecipação no contratempo do 2 e no contratempo do 3.',
    },
    sync_tresillo_lat: {
      name: 'Padrão Tresillo (1, 2-e, 4)',
      description: 'Divisão clássica 3+3+2 em colcheias, base da música latina e pop.',
    },
    sync_offbeat: {
      name: 'Contratempo no 3-e',
      description: 'Duas semínimas firmes seguidas de dois acentos deslocados em contratempo.',
    },
  },
};

export function getLocalizedInterval(id: string, lang: Language): LocalizedInterval {
  return INTERVALS_I18N[lang][id] ?? INTERVALS_I18N.es[id];
}

export function getLocalizedChord(id: string, lang: Language): LocalizedChord {
  return CHORDS_I18N[lang][id] ?? CHORDS_I18N.es[id];
}

export function getLocalizedScale(id: string, lang: Language): LocalizedScale {
  return SCALES_I18N[lang][id] ?? SCALES_I18N.es[id];
}

export function getLocalizedProgression(id: string, lang: Language): LocalizedProgression {
  return PROGRESSIONS_I18N[lang][id] ?? PROGRESSIONS_I18N.es[id];
}

export function getLocalizedRhythm(id: string, lang: Language): LocalizedRhythm {
  return RHYTHMS_I18N[lang][id] ?? RHYTHMS_I18N.es[id];
}
