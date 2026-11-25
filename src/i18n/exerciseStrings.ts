import { Language } from './types';

export interface ExerciseCopy {
  soundA: string;
  soundB: string;
  conceptHigher: string;
  conceptLower: string;
  askHigherInstr: string;
  askLowerInstr: string;
  compareTwoSub: string;
  soundAOptLabel: string;
  soundAOptSub: string;
  soundBOptLabel: string;
  soundBOptSub: string;
  pitchCompareExplain: (noteA: string, noteB: string, diff: number, askHigher: boolean, winner: string) => string;

  contourLabels: Record<'ascending' | 'descending' | 'same', string>;
  contourConcept: (label: string) => string;
  contourInstr: string;
  contourOpts: {
    ascending: [string, string];
    descending: [string, string];
    same: [string, string];
  };
  contourExplain: (notesStr: string, dirLower: string) => string;

  sameConcept: string;
  diffConcept: string;
  sameDiffInstr: string;
  sameOpt: [string, string];
  diffOpt: [string, string];
  sameExplain: (motifA: string) => string;
  diffExplain: (motifA: string, motifB: string) => string;

  noteChipLabel: (idx: number) => string;
  orderConcept: string;
  orderInstr: string;
  orderSub: string;
  orderExplain: (notesStr: string) => string;

  semitonesWord: (n: number) => string;
  intervalHarmonicInstr: string;
  intervalDescInstr: string;
  intervalAscInstr: string;
  compareWith: (name: string) => string;

  chordQualityInstr: string;
  chordQualityExplain: (name: string, root: string, notesStr: string, character: string) => string;

  invNames: Record<0 | 1 | 2, string>;
  invExplain: Record<0 | 1 | 2, string>;
  invConcept: (name: string) => string;
  invInstr: (isMajor: boolean) => string;
  invSub: string;
  invOpts: {
    0: [string, string];
    1: [string, string];
    2: [string, string];
  };
  invFullExplain: (name: string, notesStr: string, detail: string) => string;

  scaleSoundsCount: (count: number) => string;
  scaleInstr: string;
  scaleExplain: (name: string, root: string, character: string) => string;

  majorScaleConcept: string;
  majorCheckInstr: string;
  majorPureOpt: [string, string];
  majorAlteredOpt: [string, string];
  majorPureExplain: (root: string) => string;
  majorAlteredExplain: (reason: string) => string;
  majorLowered3rd: string;
  majorLowered7th: string;

  tonicConcept: string;
  dominantConcept: string;
  subdominantConcept: string;
  tonicDomInstr: string;
  tonicDomOpts: {
    I: [string, string];
    V: [string, string];
    IV: [string, string];
  };
  tonicDomExplain: Record<'I' | 'V' | 'IV', string>;

  cadenceInstr: string;
  progressionInstr: string;
  progressionExplain: (name: string, root: string, desc: string) => string;

  harmonicChangeCandidates: {
    id: 'IV' | 'V' | 'vi' | 'ii';
    offset: number;
    quality: 'major' | 'minor';
    label: string;
  }[];
  harmonicChangeConcept: (id: string) => string;
  harmonicChangeInstr: string;
  minorChordSub: string;
  majorChordSub: string;
  harmonicChangeExplain: (root: string, id: string, label: string) => string;

  pianoCompleteConcept: string;
  pianoDictationConcept: (count: number) => string;
  pianoCompleteInstr: string;
  pianoReproduceInstr: (count: number, startNote: string) => string;
  pianoCompleteSub: (prefixNotes: string) => string;
  pianoBlindSub: string;
  pianoKeyName: string;
  pianoExplain: (notesStr: string) => string;

  scaleDegrees: { id: string; semitones: number; label: string; sub: string }[];
  scaleDegreeInstr: string;
  tonalityLabel: (root: string) => string;
  scaleDegreeExplain: (root: string, targetNote: string, degreeLabel: string) => string;

  rhythmChoiceInstr: string;
  rhythmChoiceSub: string;
  rhythmTapConcept: (name: string) => string;
  rhythmTapInstr: string;
  rhythmTapSub: (hits: number) => string;
  rhythmTapExplain: (name: string, desc: string) => string;
}

export const EXERCISE_COPY: Record<Language, ExerciseCopy> = {
  es: {
    soundA: 'Sonido A',
    soundB: 'Sonido B',
    conceptHigher: 'Reconocer sonido agudo',
    conceptLower: 'Reconocer sonido grave',
    askHigherInstr: 'Escucha los dos sonidos y elige cuál es más AGUDO.',
    askLowerInstr: 'Escucha los dos sonidos y elige cuál es más GRAVE.',
    compareTwoSub: 'Puedes escuchar ambos juntos o cada sonido por separado.',
    soundAOptLabel: 'Sonido A (Primero)',
    soundAOptSub: 'Primer sonido escuchado',
    soundBOptLabel: 'Sonido B (Segundo)',
    soundBOptSub: 'Segundo sonido escuchado',
    pitchCompareExplain: (a, b, diff, askHigher, winner) =>
      `El Sonido A fue ${a} y el Sonido B fue ${b} (${diff} semitonos de diferencia). Por eso el sonido más ${askHigher ? 'agudo' : 'grave'} es el Sonido ${winner}.`,

    contourLabels: {
      ascending: 'Ascendente (sube)',
      descending: 'Descendente (baja)',
      same: 'Constante (misma altura)',
    },
    contourConcept: (lbl) => `Dirección ${lbl}`,
    contourInstr: '¿Qué dirección sigue esta secuencia de tres sonidos?',
    contourOpts: {
      ascending: ['Ascendente', 'De grave hacia agudo'],
      descending: ['Descendente', 'De agudo hacia grave'],
      same: ['Misma altura', 'Se mantiene estable'],
    },
    contourExplain: (notesStr, dirLower) =>
      `Las notas escuchadas fueron ${notesStr}. El movimiento es ${dirLower}.`,

    sameConcept: 'Motivos iguales',
    diffConcept: 'Motivos diferentes',
    sameDiffInstr: 'Escucha el Motivo A y luego el Motivo B. ¿Son iguales o diferentes?',
    sameOpt: ['Son iguales', 'Mismas alturas exactas'],
    diffOpt: ['Son diferentes', 'Cambió al menos una nota'],
    sameExplain: (a) => `Ambos motivos tocaron exactamente ${a}.`,
    diffExplain: (a, b) => `El Motivo A fue ${a} y el Motivo B cambió a ${b}.`,

    noteChipLabel: (idx) => `Nota ${idx}`,
    orderConcept: 'Ordenamiento de alturas',
    orderInstr: 'Escucha las tres notas y ordénalas de la más GRAVE a la más AGUDA.',
    orderSub: 'Toca cada ficha para escucharla y agrégala en orden.',
    orderExplain: (notesStr) => `De más grave a más aguda el orden correcto es: ${notesStr}.`,

    semitonesWord: (n) => `${n} ${n === 1 ? 'semitono' : 'semitonos'}`,
    intervalHarmonicInstr: 'Escucha este intervalo ARMÓNICO (ambas notas a la vez) e identifícalo.',
    intervalDescInstr: 'Escucha este intervalo melódico DESCENDENTE e identifícalo.',
    intervalAscInstr: 'Escucha el intervalo e identifica la distancia entre ambas notas.',
    compareWith: (name) => `Comparar con ${name}`,

    chordQualityInstr: 'Escucha el acorde e identifica su cualidad armónica.',
    chordQualityExplain: (name, root, notesStr, ch) => `${name} sobre ${root} (${notesStr}). ${ch}`,

    invNames: { 0: 'Estado fundamental', 1: '1.ª inversión', 2: '2.ª inversión' },
    invExplain: {
      0: 'La fundamental está en el bajo: sonoridad completamente estable y centrada.',
      1: 'La tercera del acorde está en el bajo: sonido más ligero y fluido.',
      2: 'La quinta está en el bajo: genera una cuarta justa inferior con carácter suspensivo.',
    },
    invConcept: (name) => `Inversión: ${name}`,
    invInstr: (isMaj) => `Escucha este acorde ${isMaj ? 'mayor' : 'menor'} e identifica su inversión.`,
    invSub: 'Presta atención a la nota más grave del acorde.',
    invOpts: {
      0: ['Estado fundamental', 'Fundamental en el bajo (1-3-5)'],
      1: ['1.ª inversión', 'Tercera en el bajo (3-5-1)'],
      2: ['2.ª inversión', 'Quinta en el bajo (5-1-3)'],
    },
    invFullExplain: (name, notesStr, detail) => `Sonó en ${name} (${notesStr}). ${detail}`,

    scaleSoundsCount: (count) => `${count} sonidos`,
    scaleInstr: 'Escucha la escala completa e identifica cuál es.',
    scaleExplain: (name, root, ch) => `${name} desde ${root}. ${ch}`,

    majorScaleConcept: 'Escala Mayor',
    majorCheckInstr: 'Escucha atentamente. ¿Es una Escala Mayor pura o tiene una alteración?',
    majorPureOpt: ['Escala Mayor pura', 'T-T-S-T-T-T-S exacta'],
    majorAlteredOpt: ['Tiene una nota alterada', 'No corresponde a la escala mayor'],
    majorPureExplain: (root) =>
      `¡Exacto! Fue la Escala Mayor pura desde ${root} con su sensible brillante al final.`,
    majorAlteredExplain: (reason) => `Esta escala no fue mayor pura. ${reason}`,
    majorLowered3rd: 'Se rebajó la tercera (suena menor en lugar de mayor).',
    majorLowered7th: 'Se rebajó la séptima (perdió la tensión de sensible hacia la tónica).',

    tonicConcept: 'Función Tónica (I)',
    dominantConcept: 'Función Dominante (V)',
    subdominantConcept: 'Función Subdominante (IV)',
    tonicDomInstr: 'Escucha la frase armónica. ¿En qué función tonal termina el último acorde?',
    tonicDomOpts: {
      I: ['Tónica (I)', 'Reposo y resolución final'],
      V: ['Dominante (V)', 'Tensión que pide resolver'],
      IV: ['Subdominante (IV)', 'Movimiento abierto y cálido'],
    },
    tonicDomExplain: {
      I: 'El último acorde regresa a la Tónica (I): sensación clara de reposo y llegada a casa.',
      V: 'El último acorde permanece en la Dominante (V): mantiene tensión abierta que pide resolver.',
      IV: 'El último acorde se mueve a la Subdominante (IV): sensación amplia y abierta, sin tensión dominante.',
    },

    cadenceInstr: 'El 1.er acorde fija la tónica (I). Escucha los 3 acordes e identifica la cadencia.',
    progressionInstr: 'Escucha la secuencia de cuatro acordes e identifica la progresión.',
    progressionExplain: (name, root, desc) => `${name} en tonalidad de ${root} Mayor. ${desc}`,

    harmonicChangeCandidates: [
      { id: 'IV', offset: 5, quality: 'major', label: 'IV grado (Subdominante)' },
      { id: 'V', offset: 7, quality: 'major', label: 'V grado (Dominante)' },
      { id: 'vi', offset: 9, quality: 'minor', label: 'vi grado (Relativo menor)' },
      { id: 'ii', offset: 2, quality: 'minor', label: 'ii grado (Supertónica menor)' },
    ],
    harmonicChangeConcept: (id) => `Cambio hacia ${id}`,
    harmonicChangeInstr: 'Escucha: el primer acorde es la Tónica (I). ¿Hacia qué grado cambia el segundo acorde?',
    minorChordSub: 'Acorde menor',
    majorChordSub: 'Acorde mayor',
    harmonicChangeExplain: (root, id, label) => `En ${root} Mayor, el cambio fue I → ${id} (${label}).`,

    pianoCompleteConcept: 'Completar melodía',
    pianoDictationConcept: (count) => `Dictado de ${count} notas`,
    pianoCompleteInstr: 'Escucha la frase completa y toca en el piano la ÚLTIMA nota que completa la melodía.',
    pianoReproduceInstr: (count, start) =>
      `Escucha la melodía de ${count} notas (empieza en ${start}) y reprodúcela en el piano virtual.`,
    pianoCompleteSub: (prefix) => `Inicio de referencia: ${prefix} – ¿?`,
    pianoBlindSub: 'El teclado no revela las respuestas hasta que pulses Comprobar.',
    pianoKeyName: 'Do Mayor',
    pianoExplain: (notesStr) => `La melodía completa fue: ${notesStr}.`,

    scaleDegrees: [
      { id: '1', semitones: 0, label: '1.º Grado (Tónica)', sub: 'Reposo absoluto' },
      { id: '2', semitones: 2, label: '2.º Grado (Supertónica)', sub: 'Un tono arriba de la tónica' },
      { id: '3', semitones: 4, label: '3.º Grado (Mediante)', sub: 'Color mayor brillante' },
      { id: '4', semitones: 5, label: '4.º Grado (Subdominante)', sub: 'Tiende a bajar al 3.º' },
      { id: '5', semitones: 7, label: '5.º Grado (Dominante)', sub: 'Estabilidad abierta' },
      { id: '6', semitones: 9, label: '6.º Grado (Superdominante)', sub: 'Tinte expresivo' },
      { id: '7', semitones: 11, label: '7.º Grado (Sensible)', sub: 'Pide subir al 1.º' },
    ],
    scaleDegreeInstr: 'Escucha la cadencia inicial (I–V–I) y reconoce qué grado de la escala suena al final.',
    tonalityLabel: (root) => `Tonalidad: ${root} Mayor`,
    scaleDegreeExplain: (root, note, degLabel) =>
      `En ${root} Mayor, la nota ${note} corresponde al ${degLabel}.`,

    rhythmChoiceInstr: 'Escucha el conteo de 4 pulsos y reconoce qué patrón rítmico suena a continuación.',
    rhythmChoiceSub: 'Los bloques naranjas indican en qué subdivisión del compás cae cada golpe.',
    rhythmTapConcept: (name) => `Ejecución: ${name}`,
    rhythmTapInstr: 'Primero escucha el patrón. Luego pulsa INICIAR GRABACIÓN y repítelo al pulso del metrónomo.',
    rhythmTapSub: (hits) => `Compás de 4 tiempos (${hits} golpes esperados).`,
    rhythmTapExplain: (name, desc) => `El patrón era "${name}". ${desc}`,
  },

  en: {
    soundA: 'Sound A',
    soundB: 'Sound B',
    conceptHigher: 'Identify higher pitch',
    conceptLower: 'Identify lower pitch',
    askHigherInstr: 'Listen to both tones and choose which one is HIGHER.',
    askLowerInstr: 'Listen to both tones and choose which one is LOWER.',
    compareTwoSub: 'You can play both together or listen to each tone separately.',
    soundAOptLabel: 'Sound A (First)',
    soundAOptSub: 'First tone played',
    soundBOptLabel: 'Sound B (Second)',
    soundBOptSub: 'Second tone played',
    pitchCompareExplain: (a, b, diff, askHigher, winner) =>
      `Sound A was ${a} and Sound B was ${b} (${diff} semitones apart). So the ${askHigher ? 'higher' : 'lower'} tone is Sound ${winner}.`,

    contourLabels: {
      ascending: 'Ascending (rising)',
      descending: 'Descending (falling)',
      same: 'Steady (same pitch)',
    },
    contourConcept: (lbl) => `Contour: ${lbl}`,
    contourInstr: 'Which melodic direction does this three-note sequence follow?',
    contourOpts: {
      ascending: ['Ascending', 'From low to high'],
      descending: ['Descending', 'From high to low'],
      same: ['Same pitch', 'Stays level'],
    },
    contourExplain: (notesStr, dirLower) =>
      `The notes played were ${notesStr}. The motion is ${dirLower}.`,

    sameConcept: 'Identical motifs',
    diffConcept: 'Different motifs',
    sameDiffInstr: 'Listen to Motif A and then Motif B. Are they the same or different?',
    sameOpt: ['Same', 'Exact same pitches'],
    diffOpt: ['Different', 'At least one note changed'],
    sameExplain: (a) => `Both motifs played the exact same notes: ${a}.`,
    diffExplain: (a, b) => `Motif A was ${a} while Motif B changed to ${b}.`,

    noteChipLabel: (idx) => `Note ${idx}`,
    orderConcept: 'Pitch ordering',
    orderInstr: 'Listen to the three notes and arrange them from LOWEST to HIGHEST.',
    orderSub: 'Tap each tile to preview it and add it in order.',
    orderExplain: (notesStr) => `From lowest to highest, the right order is: ${notesStr}.`,

    semitonesWord: (n) => `${n} ${n === 1 ? 'semitone' : 'semitones'}`,
    intervalHarmonicInstr: 'Listen to this HARMONIC interval (both notes together) and identify it.',
    intervalDescInstr: 'Listen to this DESCENDING melodic interval and identify it.',
    intervalAscInstr: 'Listen to the interval and identify the distance between both notes.',
    compareWith: (name) => `Compare with ${name}`,

    chordQualityInstr: 'Listen to the chord and identify its harmonic quality.',
    chordQualityExplain: (name, root, notesStr, ch) => `${name} on ${root} (${notesStr}). ${ch}`,

    invNames: { 0: 'Root position', 1: '1st inversion', 2: '2nd inversion' },
    invExplain: {
      0: 'The root is in the bass: completely grounded and stable.',
      1: 'The 3rd of the chord is in the bass: lighter, flowing color.',
      2: 'The 5th is in the bass: creates a lower perfect 4th with suspended feel.',
    },
    invConcept: (name) => `Inversion: ${name}`,
    invInstr: (isMaj) => `Listen to this ${isMaj ? 'major' : 'minor'} chord and identify its inversion.`,
    invSub: 'Focus on the lowest note in the bass.',
    invOpts: {
      0: ['Root position', 'Root in bass (1-3-5)'],
      1: ['1st inversion', 'Third in bass (3-5-1)'],
      2: ['2nd inversion', 'Fifth in bass (5-1-3)'],
    },
    invFullExplain: (name, notesStr, detail) => `Played in ${name} (${notesStr}). ${detail}`,

    scaleSoundsCount: (count) => `${count} notes`,
    scaleInstr: 'Listen to the full scale and identify which one it is.',
    scaleExplain: (name, root, ch) => `${root} ${name}. ${ch}`,

    majorScaleConcept: 'Major Scale',
    majorCheckInstr: 'Listen closely. Is this a pure Major Scale or does it have an altered note?',
    majorPureOpt: ['Pure Major Scale', 'Exact W-W-H-W-W-W-H'],
    majorAlteredOpt: ['Contains an altered note', 'Does not match the major scale'],
    majorPureExplain: (root) =>
      `Spot on! That was a pure ${root} Major Scale with its bright leading tone at the top.`,
    majorAlteredExplain: (reason) => `This scale was not pure major. ${reason}`,
    majorLowered3rd: 'The 3rd degree was lowered (sounding minor instead of major).',
    majorLowered7th: 'The 7th degree was lowered (losing its leading-tone pull to the tonic).',

    tonicConcept: 'Tonic Function (I)',
    dominantConcept: 'Dominant Function (V)',
    subdominantConcept: 'Subdominant Function (IV)',
    tonicDomInstr: 'Listen to the harmonic phrase. Which tonal function does the final chord land on?',
    tonicDomOpts: {
      I: ['Tonic (I)', 'Rest and home resolution'],
      V: ['Dominant (V)', 'Tension seeking resolution'],
      IV: ['Subdominant (IV)', 'Open, warm movement'],
    },
    tonicDomExplain: {
      I: 'The last chord returns to the Tonic (I): a clear feeling of rest and arriving home.',
      V: 'The last chord stays on the Dominant (V): open tension asking to resolve.',
      IV: 'The last chord moves to the Subdominant (IV): wide and open without dominant pull.',
    },

    cadenceInstr: 'The 1st chord sets the tonic (I). Listen to all 3 chords and identify the cadence.',
    progressionInstr: 'Listen to the four-chord loop and identify the progression.',
    progressionExplain: (name, root, desc) => `${name} in ${root} Major. ${desc}`,

    harmonicChangeCandidates: [
      { id: 'IV', offset: 5, quality: 'major', label: 'IV degree (Subdominant)' },
      { id: 'V', offset: 7, quality: 'major', label: 'V degree (Dominant)' },
      { id: 'vi', offset: 9, quality: 'minor', label: 'vi degree (Relative minor)' },
      { id: 'ii', offset: 2, quality: 'minor', label: 'ii degree (Minor supertonic)' },
    ],
    harmonicChangeConcept: (id) => `Move to ${id}`,
    harmonicChangeInstr: 'Listen: the first chord is the Tonic (I). Which degree does the second chord move to?',
    minorChordSub: 'Minor chord',
    majorChordSub: 'Major chord',
    harmonicChangeExplain: (root, id, label) => `In ${root} Major, the move was I → ${id} (${label}).`,

    pianoCompleteConcept: 'Complete the melody',
    pianoDictationConcept: (count) => `${count}-note dictation`,
    pianoCompleteInstr: 'Listen to the whole phrase and play the FINAL note that completes the melody.',
    pianoReproduceInstr: (count, start) =>
      `Listen to the ${count}-note melody (starts on ${start}) and play it back on the virtual piano.`,
    pianoCompleteSub: (prefix) => `Opening reference: ${prefix} – ?`,
    pianoBlindSub: 'The keyboard stays blind until you press Check.',
    pianoKeyName: 'C Major',
    pianoExplain: (notesStr) => `The full melody was: ${notesStr}.`,

    scaleDegrees: [
      { id: '1', semitones: 0, label: '1st Degree (Tonic)', sub: 'Complete rest' },
      { id: '2', semitones: 2, label: '2nd Degree (Supertonic)', sub: 'One whole step above tonic' },
      { id: '3', semitones: 4, label: '3rd Degree (Mediant)', sub: 'Bright major color' },
      { id: '4', semitones: 5, label: '4th Degree (Subdominant)', sub: 'Tends to resolve down to 3' },
      { id: '5', semitones: 7, label: '5th Degree (Dominant)', sub: 'Open stability' },
      { id: '6', semitones: 9, label: '6th Degree (Submediant)', sub: 'Expressive shade' },
      { id: '7', semitones: 11, label: '7th Degree (Leading Tone)', sub: 'Pulls up to 1' },
    ],
    scaleDegreeInstr: 'Listen to the opening cadence (I–V–I) and identify which scale degree sounds at the end.',
    tonalityLabel: (root) => `Key: ${root} Major`,
    scaleDegreeExplain: (root, note, degLabel) =>
      `In ${root} Major, ${note} is the ${degLabel}.`,

    rhythmChoiceInstr: 'Listen to the 4-beat count-in and recognize which rhythmic pattern plays next.',
    rhythmChoiceSub: 'Orange blocks mark the exact subdivision of each hit in the bar.',
    rhythmTapConcept: (name) => `Tap: ${name}`,
    rhythmTapInstr: 'Listen to the pattern first, then press START RECORDING and tap it with the metronome.',
    rhythmTapSub: (hits) => `4/4 measure (${hits} hits expected).`,
    rhythmTapExplain: (name, desc) => `The pattern was "${name}". ${desc}`,
  },

  pt: {
    soundA: 'Som A',
    soundB: 'Som B',
    conceptHigher: 'Reconhecer som agudo',
    conceptLower: 'Reconhecer som grave',
    askHigherInstr: 'Ouça os dois sons e escolha qual é mais AGUDO.',
    askLowerInstr: 'Ouça os dois sons e escolha qual é mais GRAVE.',
    compareTwoSub: 'Você pode ouvir ambos juntos ou cada som separadamente.',
    soundAOptLabel: 'Som A (Primeiro)',
    soundAOptSub: 'Primeiro som ouvido',
    soundBOptLabel: 'Som B (Segundo)',
    soundBOptSub: 'Segundo som ouvido',
    pitchCompareExplain: (a, b, diff, askHigher, winner) =>
      `O Som A foi ${a} e o Som B foi ${b} (${diff} semitons de diferença). Portanto o som mais ${askHigher ? 'agudo' : 'grave'} é o Som ${winner}.`,

    contourLabels: {
      ascending: 'Ascendente (sobe)',
      descending: 'Descendente (desce)',
      same: 'Constante (mesma altura)',
    },
    contourConcept: (lbl) => `Direção ${lbl}`,
    contourInstr: 'Qual direção melódica segue esta sequência de três sons?',
    contourOpts: {
      ascending: ['Ascendente', 'Do grave para o agudo'],
      descending: ['Descendente', 'Do agudo para o grave'],
      same: ['Mesma altura', 'Mantém-se estável'],
    },
    contourExplain: (notesStr, dirLower) =>
      `As notas ouvidas foram ${notesStr}. O movimento é ${dirLower}.`,

    sameConcept: 'Motivos iguais',
    diffConcept: 'Motivos diferentes',
    sameDiffInstr: 'Ouça o Motivo A e depois o Motivo B. São iguais ou diferentes?',
    sameOpt: ['São iguais', 'Mesmas alturas exatas'],
    diffOpt: ['São diferentes', 'Mudou pelo menos uma nota'],
    sameExplain: (a) => `Ambos os motivos tocaram exatamente ${a}.`,
    diffExplain: (a, b) => `O Motivo A foi ${a} e o Motivo B mudou para ${b}.`,

    noteChipLabel: (idx) => `Nota ${idx}`,
    orderConcept: 'Ordenação de alturas',
    orderInstr: 'Ouça as três notas e ordene-as da mais GRAVE para a mais AGUDA.',
    orderSub: 'Toque em cada bloco para ouvir e adicione em ordem.',
    orderExplain: (notesStr) => `Da mais grave para a mais aguda a ordem correta é: ${notesStr}.`,

    semitonesWord: (n) => `${n} ${n === 1 ? 'semitom' : 'semitons'}`,
    intervalHarmonicInstr: 'Ouça este intervalo HARMÔNICO (as duas notas juntas) e identifique-o.',
    intervalDescInstr: 'Ouça este intervalo melódico DESCENDENTE e identifique-o.',
    intervalAscInstr: 'Ouça o intervalo e identifique a distância entre as duas notas.',
    compareWith: (name) => `Comparar com ${name}`,

    chordQualityInstr: 'Ouça o acorde e identifique sua qualidade harmônica.',
    chordQualityExplain: (name, root, notesStr, ch) => `${name} sobre ${root} (${notesStr}). ${ch}`,

    invNames: { 0: 'Estado fundamental', 1: '1ª inversão', 2: '2ª inversão' },
    invExplain: {
      0: 'A fundamental está no baixo: sonoridade totalmente estável e centrada.',
      1: 'A terça do acorde está no baixo: som mais leve e fluido.',
      2: 'A quinta está no baixo: gera uma quarta justa inferior com caráter suspenso.',
    },
    invConcept: (name) => `Inversão: ${name}`,
    invInstr: (isMaj) => `Ouça este acorde ${isMaj ? 'maior' : 'menor'} e identifique sua inversão.`,
    invSub: 'Preste atenção na nota mais grave do acorde.',
    invOpts: {
      0: ['Estado fundamental', 'Fundamental no baixo (1-3-5)'],
      1: ['1ª inversão', 'Terça no baixo (3-5-1)'],
      2: ['2ª inversão', 'Quinta no baixo (5-1-3)'],
    },
    invFullExplain: (name, notesStr, detail) => `Soou em ${name} (${notesStr}). ${detail}`,

    scaleSoundsCount: (count) => `${count} sons`,
    scaleInstr: 'Ouça a escala completa e identifique qual é.',
    scaleExplain: (name, root, ch) => `${name} a partir de ${root}. ${ch}`,

    majorScaleConcept: 'Escala Maior',
    majorCheckInstr: 'Ouça com atenção. É uma Escala Maior pura ou tem uma nota alterada?',
    majorPureOpt: ['Escala Maior pura', 'T-T-S-T-T-T-S exata'],
    majorAlteredOpt: ['Tem uma nota alterada', 'Não corresponde à escala maior'],
    majorPureExplain: (root) =>
      `Exato! Foi a Escala Maior pura a partir de ${root} com sua sensível brilhante no final.`,
    majorAlteredExplain: (reason) => `Esta escala não foi maior pura. ${reason}`,
    majorLowered3rd: 'A terça foi rebaixada (soa menor em vez de maior).',
    majorLowered7th: 'A sétima foi rebaixada (perdeu a tensão de sensível rumo à tônica).',

    tonicConcept: 'Função Tônica (I)',
    dominantConcept: 'Função Dominante (V)',
    subdominantConcept: 'Função Subdominante (IV)',
    tonicDomInstr: 'Ouça a frase harmônica. Em qual função tonal termina o último acorde?',
    tonicDomOpts: {
      I: ['Tônica (I)', 'Repouso e resolução final'],
      V: ['Dominante (V)', 'Tensão que pede resolução'],
      IV: ['Subdominante (IV)', 'Movimento aberto e caloroso'],
    },
    tonicDomExplain: {
      I: 'O último acorde volta à Tônica (I): sensação clara de repouso e chegada em casa.',
      V: 'O último acorde permanece na Dominante (V): mantém tensão aberta pedindo resolução.',
      IV: 'O último acorde vai para a Subdominante (IV): sensação ampla e aberta, sem tensão dominante.',
    },

    cadenceInstr: 'O 1º acorde define a tônica (I). Ouça os 3 acordes e identifique a cadência.',
    progressionInstr: 'Ouça a sequência de quatro acordes e identifique a progressão.',
    progressionExplain: (name, root, desc) => `${name} na tonalidade de ${root} Maior. ${desc}`,

    harmonicChangeCandidates: [
      { id: 'IV', offset: 5, quality: 'major', label: 'IV grau (Subdominante)' },
      { id: 'V', offset: 7, quality: 'major', label: 'V grau (Dominante)' },
      { id: 'vi', offset: 9, quality: 'minor', label: 'vi grau (Relativo menor)' },
      { id: 'ii', offset: 2, quality: 'minor', label: 'ii grau (Supertônica menor)' },
    ],
    harmonicChangeConcept: (id) => `Mudança para ${id}`,
    harmonicChangeInstr: 'Ouça: o primeiro acorde é a Tônica (I). Para qual grau muda o segundo acorde?',
    minorChordSub: 'Acorde menor',
    majorChordSub: 'Acorde maior',
    harmonicChangeExplain: (root, id, label) => `Em ${root} Maior, a mudança foi I → ${id} (${label}).`,

    pianoCompleteConcept: 'Completar melodia',
    pianoDictationConcept: (count) => `Ditado de ${count} notas`,
    pianoCompleteInstr: 'Ouça a frase completa e toque no piano a ÚLTIMA nota que completa a melodia.',
    pianoReproduceInstr: (count, start) =>
      `Ouça a melodia de ${count} notas (começa em ${start}) e reproduza-a no piano virtual.`,
    pianoCompleteSub: (prefix) => `Início de referência: ${prefix} – ?`,
    pianoBlindSub: 'O teclado não revela as respostas até você clicar em Verificar.',
    pianoKeyName: 'Do Maior',
    pianoExplain: (notesStr) => `A melodia completa foi: ${notesStr}.`,

    scaleDegrees: [
      { id: '1', semitones: 0, label: '1º Grau (Tônica)', sub: 'Repouso absoluto' },
      { id: '2', semitones: 2, label: '2º Grau (Supertônica)', sub: 'Um tom acima da tônica' },
      { id: '3', semitones: 4, label: '3º Grau (Mediante)', sub: 'Cor maior brilhante' },
      { id: '4', semitones: 5, label: '4º Grau (Subdominante)', sub: 'Tende a descer ao 3º' },
      { id: '5', semitones: 7, label: '5º Grau (Dominante)', sub: 'Estabilidade aberta' },
      { id: '6', semitones: 9, label: '6º Grau (Superdominante)', sub: 'Tom expressivo' },
      { id: '7', semitones: 11, label: '7º Grau (Sensível)', sub: 'Pede subir ao 1º' },
    ],
    scaleDegreeInstr: 'Ouça a cadência inicial (I–V–I) e reconheça qual grau da escala soa no final.',
    tonalityLabel: (root) => `Tonalidade: ${root} Maior`,
    scaleDegreeExplain: (root, note, degLabel) =>
      `Em ${root} Maior, a nota ${note} corresponde ao ${degLabel}.`,

    rhythmChoiceInstr: 'Ouça a contagem de 4 pulsos e reconheça qual padrão rítmico soa em seguida.',
    rhythmChoiceSub: 'Os blocos laranjas indicam em qual subdivisão do compasso cai cada toque.',
    rhythmTapConcept: (name) => `Execução: ${name}`,
    rhythmTapInstr: 'Primeiro ouça o padrão. Depois clique em INICIAR GRAVAÇÃO e repita-o no pulso do metrônomo.',
    rhythmTapSub: (hits) => `Compasso de 4 tempos (${hits} toques esperados).`,
    rhythmTapExplain: (name, desc) => `O padrão era "${name}". ${desc}`,
  },
};
