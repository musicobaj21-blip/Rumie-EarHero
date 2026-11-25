import { LevelDefinition, MedalDefinition, WorldDefinition } from '../types/music';
import { Language } from './types';

interface LocalizedWorldText {
  title: string;
  shortName: string;
  subtitle: string;
  rewardTitle: string;
}

interface LocalizedLevelText {
  title: string;
  shortTitle: string;
  description: string;
  estimatedMinutes: string;
}

interface LocalizedMedalText {
  title: string;
  description: string;
  requirementText: string;
}

export const WORLDS_I18N: Record<Language, Record<number, LocalizedWorldText>> = {
  es: {
    1: {
      title: 'Mundo 1: El Despertar del Oído',
      shortName: 'Despertar del Oído',
      subtitle: 'Altura, dirección melódica, discriminación auditiva y memoria inicial.',
      rewardTitle: 'Oído Despierto',
    },
    2: {
      title: 'Mundo 2: Los Intervalos',
      shortName: 'Los Intervalos',
      subtitle: 'Domina las distancias musicales desde segundas hasta octavas armónicas.',
      rewardTitle: 'Arquitecto de Intervalos',
    },
    3: {
      title: 'Mundo 3: Acordes Misteriosos',
      shortName: 'Acordes Misteriosos',
      subtitle: 'Colores armónicos, tríadas, inversiones y acordes de séptima.',
      rewardTitle: 'Descifrador de Acordes',
    },
    4: {
      title: 'Mundo 4: El Universo de las Escalas',
      shortName: 'Universo de Escalas',
      subtitle: 'Escalas mayores, menores, pentatónicas y el color del blues.',
      rewardTitle: 'Navegante de Escalas',
    },
    5: {
      title: 'Mundo 5: Armonía en Acción',
      shortName: 'Armonía en Acción',
      subtitle: 'Funciones tonales, cadencias, progresiones populares y cambios armónicos.',
      rewardTitle: 'Guía Armónico',
    },
    6: {
      title: 'Mundo 6: Melodías y Memoria',
      shortName: 'Melodías y Memoria',
      subtitle: 'Dictado melódico, reproducción en piano virtual y grados tonales.',
      rewardTitle: 'Memoria Melódica',
    },
    7: {
      title: 'Mundo 7: Ritmo y Precisión',
      shortName: 'Ritmo y Precisión',
      subtitle: 'Pulso interno, figuras rítmicas, síncopas y reproducción de patrones.',
      rewardTitle: 'Precisión Rítmica',
    },
    8: {
      title: 'Mundo 8: Maestro del Oído',
      shortName: 'Maestro del Oído',
      subtitle: 'Integración total para graduarte y obtener el Diploma Rumie EarHero.',
      rewardTitle: 'Maestro del Oído',
    },
  },
  en: {
    1: {
      title: 'World 1: Ear Awakening',
      shortName: 'Ear Awakening',
      subtitle: 'Pitch height, melodic contour, ear discrimination, and foundational memory.',
      rewardTitle: 'Awakened Ear',
    },
    2: {
      title: 'World 2: The Intervals',
      shortName: 'The Intervals',
      subtitle: 'Master musical distances from minor seconds to harmonic octaves.',
      rewardTitle: 'Interval Architect',
    },
    3: {
      title: 'World 3: Mystery Chords',
      shortName: 'Mystery Chords',
      subtitle: 'Harmonic colors, triads, chord inversions, and seventh chords.',
      rewardTitle: 'Chord Decoder',
    },
    4: {
      title: 'World 4: Universe of Scales',
      shortName: 'Universe of Scales',
      subtitle: 'Major, minor, pentatonic scales, and the expressive blues color.',
      rewardTitle: 'Scale Navigator',
    },
    5: {
      title: 'World 5: Harmony in Action',
      shortName: 'Harmony in Action',
      subtitle: 'Tonal functions, cadences, popular progressions, and harmonic changes.',
      rewardTitle: 'Harmony Guide',
    },
    6: {
      title: 'World 6: Melodies & Memory',
      shortName: 'Melodies & Memory',
      subtitle: 'Melodic dictation, virtual piano playback, and scale degrees.',
      rewardTitle: 'Melodic Memory',
    },
    7: {
      title: 'World 7: Rhythm & Precision',
      shortName: 'Rhythm & Precision',
      subtitle: 'Internal pulse, rhythmic figures, syncopation, and live pattern tapping.',
      rewardTitle: 'Rhythmic Precision',
    },
    8: {
      title: 'World 8: Master of the Ear',
      shortName: 'Master of the Ear',
      subtitle: 'Full mastery integration to graduate and earn the Rumie EarHero Diploma.',
      rewardTitle: 'Master of the Ear',
    },
  },
  pt: {
    1: {
      title: 'Mundo 1: O Despertar do Ouvido',
      shortName: 'Despertar do Ouvido',
      subtitle: 'Altura, direção melódica, discriminação auditiva e memória inicial.',
      rewardTitle: 'Ouvido Desperto',
    },
    2: {
      title: 'Mundo 2: Os Intervalos',
      shortName: 'Os Intervalos',
      subtitle: 'Domine as distâncias musicais de segundas até oitavas harmônicas.',
      rewardTitle: 'Arquiteto de Intervalos',
    },
    3: {
      title: 'Mundo 3: Acordes Misteriosos',
      shortName: 'Acordes Misteriosos',
      subtitle: 'Cores harmônicas, tríades, inversões e acordes com sétima.',
      rewardTitle: 'Decifrador de Acordes',
    },
    4: {
      title: 'Mundo 4: Universo das Escalas',
      shortName: 'Universo das Escalas',
      subtitle: 'Escalas maiores, menores, pentatônicas e a cor do blues.',
      rewardTitle: 'Navegador de Escalas',
    },
    5: {
      title: 'Mundo 5: Harmonia em Ação',
      shortName: 'Harmonia em Ação',
      subtitle: 'Funções tonais, cadências, progressões populares e trocas harmônicas.',
      rewardTitle: 'Guia Harmônico',
    },
    6: {
      title: 'Mundo 6: Melodias e Memória',
      shortName: 'Melodias e Memória',
      subtitle: 'Ditado melódico, reprodução no piano virtual e graus tonais.',
      rewardTitle: 'Memória Melódica',
    },
    7: {
      title: 'Mundo 7: Ritmo e Precisão',
      shortName: 'Ritmo e Precisão',
      subtitle: 'Pulso interno, figuras rítmicas, síncopes e execução de padrões.',
      rewardTitle: 'Precisão Rítmica',
    },
    8: {
      title: 'Mundo 8: Mestre do Ouvido',
      shortName: 'Mestre do Ouvido',
      subtitle: 'Integração total para se formar e conquistar o Diploma Rumie EarHero.',
      rewardTitle: 'Mestre do Ouvido',
    },
  },
};

export const LEVELS_I18N: Record<Language, Record<string, LocalizedLevelText>> = {
  es: {
    'w1-l1': { title: 'Graves y agudos', shortTitle: 'Graves y agudos', description: 'Compara dos sonidos e identifica cuál es más grave o más agudo.', estimatedMinutes: '3 min' },
    'w1-l2': { title: 'Sonidos ascendentes y descendentes', shortTitle: 'Ascendente / Desc.', description: 'Reconoce si una secuencia musical sube, baja o se mantiene.', estimatedMinutes: '3 min' },
    'w1-l3': { title: 'Sonidos iguales y diferentes', shortTitle: 'Iguales / Diferentes', description: 'Afina tu percepción comparando notas y pequeños motivos musicales.', estimatedMinutes: '3 min' },
    'w1-l4': { title: 'Memoria auditiva', shortTitle: 'Memoria auditiva', description: 'Escucha patrones cortos, ordénalos y reprodúcelos en el piano virtual.', estimatedMinutes: '4 min' },
    'w1-l5': { title: 'Desafío final: El Despertar', shortTitle: 'Desafío final', description: 'Supera la prueba integradora del Mundo 1 y gana tu primera medalla.', estimatedMinutes: '5 min' },

    'w2-l1': { title: 'Segundas', shortTitle: 'Segundas', description: 'Distingue el semitono (2m) del tono completo (2M) en distintas tonalidades.', estimatedMinutes: '3 min' },
    'w2-l2': { title: 'Terceras', shortTitle: 'Terceras', description: 'Diferencia la expresividad de la tercera menor (3m) frente a la mayor (3M).', estimatedMinutes: '3 min' },
    'w2-l3': { title: 'Cuartas y quintas', shortTitle: 'Cuartas y quintas', description: 'Identifica cuarta justa (4J), tritono (TT) y quinta justa (5J).', estimatedMinutes: '4 min' },
    'w2-l4': { title: 'Sextas, séptimas y octavas', shortTitle: 'Sextas, 7as y 8as', description: 'Reconoce saltos amplios: 6m, 6M, 7m, 7M y octava justa (8J).', estimatedMinutes: '4 min' },
    'w2-l5': { title: 'Desafío final: Intervalos Armónicos', shortTitle: 'Desafío final', description: 'Reto completo que combina intervalos melódicos y simultáneos (armónicos).', estimatedMinutes: '5 min' },

    'w3-l1': { title: 'Mayor y menor', shortTitle: 'Mayor y menor', description: 'Identifica al instante el carácter luminoso mayor y melancólico menor.', estimatedMinutes: '3 min' },
    'w3-l2': { title: 'Disminuido y aumentado', shortTitle: 'Dism. y Aumentado', description: 'Reconoce la tensión del disminuido y el misterio del acorde aumentado.', estimatedMinutes: '4 min' },
    'w3-l3': { title: 'Inversiones', shortTitle: 'Inversiones', description: 'Escucha el bajo y distingue estado fundamental, 1.ª y 2.ª inversión.', estimatedMinutes: '4 min' },
    'w3-l4': { title: 'Acordes de séptima', shortTitle: 'Acordes de 7ª', description: 'Diferencia Maj7, m7, dominante 7 y semidisminuido (m7b5).', estimatedMinutes: '4 min' },
    'w3-l5': { title: 'Desafío final: Acordes', shortTitle: 'Desafío final', description: 'Identifica cualidades, inversiones y séptimas en múltiples registros.', estimatedMinutes: '5 min' },

    'w4-l1': { title: 'Mayor vs. Menor', shortTitle: 'Mayor vs. Menor', description: 'Distingue el carácter luminoso de la escala mayor frente a la escala menor natural.', estimatedMinutes: '3 min' },
    'w4-l2': { title: 'Las 3 Menores', shortTitle: 'Las 3 Menores', description: 'Diferencia el color final entre la escala menor natural, armónica y melódica.', estimatedMinutes: '4 min' },
    'w4-l3': { title: 'Sonido Pentatónico', shortTitle: 'Pentatónico', description: 'Reconoce la sonoridad abierta de 5 notas frente a las escalas diatónicas de 7 notas.', estimatedMinutes: '4 min' },
    'w4-l4': { title: 'El Color del Blues', shortTitle: 'Color Blues', description: 'Detecta la presencia característica de la blue note frente a las pentatónicas puras.', estimatedMinutes: '4 min' },
    'w4-l5': { title: 'Desafío final', shortTitle: 'Desafío final', description: 'Mezcla integradora de todas las escalas del mundo: mayor, las 3 menores, pentatónicas y blues.', estimatedMinutes: '5 min' },

    'w5-l1': { title: 'Tónica y dominante', shortTitle: 'Tónica y dom.', description: 'Siente la gravedad del reposo (I) frente a la tensión dominante (V).', estimatedMinutes: '3 min' },
    'w5-l2': { title: 'Cadencias', shortTitle: 'Cadencias', description: 'Identifica cadencia auténtica, plagal, semicadencia y cadencia rota.', estimatedMinutes: '4 min' },
    'w5-l3': { title: 'Progresiones populares', shortTitle: 'Progresiones', description: 'Reconoce I-V-vi-IV, I-IV-V-I, ii-V-I y I-vi-IV-V al oído.', estimatedMinutes: '4 min' },
    'w5-l4': { title: 'Reconocimiento de cambios armónicos', shortTitle: 'Cambios arm.', description: 'Detecta hacia qué grado se mueve la armonía dentro de una frase.', estimatedMinutes: '4 min' },
    'w5-l5': { title: 'Desafío final: Armonía', shortTitle: 'Desafío final', description: 'Dominio total de cadencias, funciones y progresiones reales.', estimatedMinutes: '5 min' },

    'w6-l1': { title: 'Melodías de tres notas', shortTitle: '3 notas', description: 'Escucha motivos de 3 notas y reprodúcelos en el teclado virtual.', estimatedMinutes: '4 min' },
    'w6-l2': { title: 'Completar melodías', shortTitle: 'Completar', description: 'Escucha la frase musical y toca la nota final que la completa.', estimatedMinutes: '4 min' },
    'w6-l3': { title: 'Dictado melódico', shortTitle: 'Dictado', description: 'Reconstruye frases de 4 notas combinando oído y piano virtual.', estimatedMinutes: '5 min' },
    'w6-l4': { title: 'Reconocimiento de grados tonales', shortTitle: 'Grados tonales', description: 'Escucha la cadencia inicial e identifica el grado exacto de la escala.', estimatedMinutes: '4 min' },
    'w6-l5': { title: 'Desafío final: Melodías', shortTitle: 'Desafío final', description: 'Prueba integral de dictado, grados tonales y reproducción musical.', estimatedMinutes: '5 min' },

    'w7-l1': { title: 'Pulso', shortTitle: 'Pulso', description: 'Siente el pulso estable y reproduce negras y blancas con precisión.', estimatedMinutes: '3 min' },
    'w7-l2': { title: 'Figuras rítmicas', shortTitle: 'Figuras', description: 'Identifica combinaciones de blancas, negras y corcheas al oído.', estimatedMinutes: '4 min' },
    'w7-l3': { title: 'Síncopas', shortTitle: 'Síncopas', description: 'Distingue acentos en contratiempo y patrones sincopados.', estimatedMinutes: '4 min' },
    'w7-l4': { title: 'Reconocimiento de patrones', shortTitle: 'Patrones', description: 'Escucha el ritmo y reprodúcelo con el pad rítmico interactivo.', estimatedMinutes: '4 min' },
    'w7-l5': { title: 'Desafío final: Ritmo', shortTitle: 'Desafío final', description: 'Combina reconocimiento de figuras, síncopas y ejecución en tiempo real.', estimatedMinutes: '5 min' },

    'w8-l1': { title: 'Intervalos combinados', shortTitle: 'Intervalos mix', description: 'Intervalos ascendentes, descendentes y armónicos en cualquier registro.', estimatedMinutes: '4 min' },
    'w8-l2': { title: 'Acordes de diferentes cualidades', shortTitle: 'Acordes avanz.', description: 'Tríadas, inversiones y acordes de séptima sin pistas previas.', estimatedMinutes: '4 min' },
    'w8-l3': { title: 'Escalas y progresiones', shortTitle: 'Escalas y arm.', description: 'Identificación rápida de escalas, cadencias y progresiones armónicas.', estimatedMinutes: '4 min' },
    'w8-l4': { title: 'Retos de memoria musical', shortTitle: 'Memoria pro', description: 'Melodías extendidas en piano virtual y patrones rítmicos complejos.', estimatedMinutes: '5 min' },
    'w8-l5': { title: 'Gran desafío final', shortTitle: 'Gran desafío', description: 'El examen maestro de Rumie EarHero. Complétalo para desbloquear tu Diploma.', estimatedMinutes: '6 min' },
  },
  en: {
    'w1-l1': { title: 'High & Low Pitch', shortTitle: 'High & Low', description: 'Compare two tones and identify which one is lower or higher.', estimatedMinutes: '3 min' },
    'w1-l2': { title: 'Ascending & Descending', shortTitle: 'Up / Down', description: 'Recognize whether a musical sequence rises, falls, or stays flat.', estimatedMinutes: '3 min' },
    'w1-l3': { title: 'Same & Different Sounds', shortTitle: 'Same / Diff.', description: 'Sharpen your ear by comparing notes and short musical motifs.', estimatedMinutes: '3 min' },
    'w1-l4': { title: 'Auditory Memory', shortTitle: 'Ear Memory', description: 'Hear short patterns, order them, and replay them on the virtual piano.', estimatedMinutes: '4 min' },
    'w1-l5': { title: 'Boss Trial: The Awakening', shortTitle: 'Boss Trial', description: 'Pass the World 1 capstone challenge and earn your first medal.', estimatedMinutes: '5 min' },

    'w2-l1': { title: 'Seconds', shortTitle: 'Seconds', description: 'Tell apart the half step (m2) from the whole step (M2) across keys.', estimatedMinutes: '3 min' },
    'w2-l2': { title: 'Thirds', shortTitle: 'Thirds', description: 'Distinguish the expressive minor 3rd (m3) from the bright major 3rd (M3).', estimatedMinutes: '3 min' },
    'w2-l3': { title: 'Fourths & Fifths', shortTitle: '4ths & 5ths', description: 'Identify perfect 4th (P4), tritone (TT), and perfect 5th (P5).', estimatedMinutes: '4 min' },
    'w2-l4': { title: 'Sixths, Sevenths & Octaves', shortTitle: '6ths, 7ths & 8ve', description: 'Recognize wide leaps: m6, M6, m7, M7, and perfect octave (P8).', estimatedMinutes: '4 min' },
    'w2-l5': { title: 'Boss Trial: Harmonic Intervals', shortTitle: 'Boss Trial', description: 'Full challenge blending melodic and simultaneous harmonic intervals.', estimatedMinutes: '5 min' },

    'w3-l1': { title: 'Major & Minor', shortTitle: 'Major & Minor', description: 'Instantly spot bright major and melancholic minor chord colors.', estimatedMinutes: '3 min' },
    'w3-l2': { title: 'Diminished & Augmented', shortTitle: 'Dim & Aug', description: 'Hear the tense pull of diminished and the mystery of augmented triads.', estimatedMinutes: '4 min' },
    'w3-l3': { title: 'Chord Inversions', shortTitle: 'Inversions', description: 'Listen to the bass to identify root position, 1st, and 2nd inversion.', estimatedMinutes: '4 min' },
    'w3-l4': { title: 'Seventh Chords', shortTitle: '7th Chords', description: 'Differentiate Maj7, m7, dominant 7, and half-diminished (m7b5).', estimatedMinutes: '4 min' },
    'w3-l5': { title: 'Boss Trial: Chords', shortTitle: 'Boss Trial', description: 'Identify qualities, inversions, and seventh chords across registers.', estimatedMinutes: '5 min' },

    'w4-l1': { title: 'Major vs. Minor', shortTitle: 'Major vs. Minor', description: 'Distinguish the bright character of the major scale from the natural minor scale.', estimatedMinutes: '3 min' },
    'w4-l2': { title: 'The 3 Minors', shortTitle: 'The 3 Minors', description: 'Distinguish the ending color of natural, harmonic, and melodic minor scales.', estimatedMinutes: '4 min' },
    'w4-l3': { title: 'Pentatonic Sound', shortTitle: 'Pentatonic', description: 'Recognize the open 5-note sound versus 7-note diatonic scales.', estimatedMinutes: '4 min' },
    'w4-l4': { title: 'The Color of Blues', shortTitle: 'Blues Color', description: 'Detect the signature blue note contrasted against pure pentatonic scales.', estimatedMinutes: '4 min' },
    'w4-l5': { title: 'Final Challenge', shortTitle: 'Final Challenge', description: 'Integrated mix of all world scales: major, the 3 minors, pentatonics, and blues.', estimatedMinutes: '5 min' },

    'w5-l1': { title: 'Tonic & Dominant', shortTitle: 'Tonic & Dom.', description: 'Feel the pull of home (I) versus dominant tension (V).', estimatedMinutes: '3 min' },
    'w5-l2': { title: 'Cadences', shortTitle: 'Cadences', description: 'Identify authentic, plagal, half, and deceptive cadences.', estimatedMinutes: '4 min' },
    'w5-l3': { title: 'Popular Progressions', shortTitle: 'Progressions', description: 'Recognize I-V-vi-IV, I-IV-V-I, ii-V-I, and I-vi-IV-V by ear.', estimatedMinutes: '4 min' },
    'w5-l4': { title: 'Harmonic Changes', shortTitle: 'Chord Shifts', description: 'Detect which scale degree the harmony moves to within a phrase.', estimatedMinutes: '4 min' },
    'w5-l5': { title: 'Boss Trial: Harmony', shortTitle: 'Boss Trial', description: 'Complete command of cadences, tonal functions, and real progressions.', estimatedMinutes: '5 min' },

    'w6-l1': { title: 'Three-Note Melodies', shortTitle: '3 Notes', description: 'Listen to 3-note motifs and play them back on the virtual piano.', estimatedMinutes: '4 min' },
    'w6-l2': { title: 'Complete the Melody', shortTitle: 'Complete', description: 'Hear the musical phrase and play the final note that completes it.', estimatedMinutes: '4 min' },
    'w6-l3': { title: 'Melodic Dictation', shortTitle: 'Dictation', description: 'Rebuild 4-note phrases combining ear training and the virtual piano.', estimatedMinutes: '5 min' },
    'w6-l4': { title: 'Scale Degrees', shortTitle: 'Scale Degrees', description: 'Listen to the opening cadence and identify the exact scale degree.', estimatedMinutes: '4 min' },
    'w6-l5': { title: 'Boss Trial: Melodies', shortTitle: 'Boss Trial', description: 'Integrated trial of dictation, scale degrees, and musical playback.', estimatedMinutes: '5 min' },

    'w7-l1': { title: 'Pulse & Beat', shortTitle: 'Pulse', description: 'Lock into a steady beat and tap quarter and half notes accurately.', estimatedMinutes: '3 min' },
    'w7-l2': { title: 'Rhythmic Figures', shortTitle: 'Figures', description: 'Identify combinations of half, quarter, and eighth notes by ear.', estimatedMinutes: '4 min' },
    'w7-l3': { title: 'Syncopation', shortTitle: 'Syncopation', description: 'Distinguish offbeat accents and syncopated groove patterns.', estimatedMinutes: '4 min' },
    'w7-l4': { title: 'Pattern Tapping', shortTitle: 'Patterns', description: 'Listen to the rhythm and tap it back on the interactive drum pad.', estimatedMinutes: '4 min' },
    'w7-l5': { title: 'Boss Trial: Rhythm', shortTitle: 'Boss Trial', description: 'Blend figure recognition, syncopation, and real-time performance.', estimatedMinutes: '5 min' },

    'w8-l1': { title: 'Mixed Intervals', shortTitle: 'Mixed Int.', description: 'Ascending, descending, and harmonic intervals in any register.', estimatedMinutes: '4 min' },
    'w8-l2': { title: 'Advanced Chords', shortTitle: 'Adv. Chords', description: 'Triads, inversions, and seventh chords without prior hints.', estimatedMinutes: '4 min' },
    'w8-l3': { title: 'Scales & Progressions', shortTitle: 'Scales & Harm.', description: 'Rapid identification of scales, cadences, and chord progressions.', estimatedMinutes: '4 min' },
    'w8-l4': { title: 'Musical Memory Pro', shortTitle: 'Memory Pro', description: 'Extended piano melodies and complex rhythmic tap patterns.', estimatedMinutes: '5 min' },
    'w8-l5': { title: 'Grand Final Challenge', shortTitle: 'Grand Final', description: 'The Rumie EarHero master exam. Pass it to unlock your official Diploma.', estimatedMinutes: '6 min' },
  },
  pt: {
    'w1-l1': { title: 'Graves e agudos', shortTitle: 'Graves e agudos', description: 'Compare dois sons e identifique qual é mais grave ou mais agudo.', estimatedMinutes: '3 min' },
    'w1-l2': { title: 'Sons ascendentes e descendentes', shortTitle: 'Ascend. / Desc.', description: 'Reconheça se uma sequência musical sobe, desce ou se mantém.', estimatedMinutes: '3 min' },
    'w1-l3': { title: 'Sons iguais e diferentes', shortTitle: 'Iguais / Diferentes', description: 'Afine sua percepção comparando notas e pequenos motivos musicais.', estimatedMinutes: '3 min' },
    'w1-l4': { title: 'Memória auditiva', shortTitle: 'Memória auditiva', description: 'Ouça padrões curtos, ordene-os e reproduza-os no piano virtual.', estimatedMinutes: '4 min' },
    'w1-l5': { title: 'Desafio final: O Despertar', shortTitle: 'Desafio final', description: 'Supere a prova integradora do Mundo 1 e ganhe sua primeira medalha.', estimatedMinutes: '5 min' },

    'w2-l1': { title: 'Segundas', shortTitle: 'Segundas', description: 'Diferencie o semitom (2m) do tom inteiro (2M) em várias tonalidades.', estimatedMinutes: '3 min' },
    'w2-l2': { title: 'Terças', shortTitle: 'Terças', description: 'Diferencie a expressividade da terça menor (3m) frente à maior (3M).', estimatedMinutes: '3 min' },
    'w2-l3': { title: 'Quartas e quintas', shortTitle: 'Quartas e quintas', description: 'Identifique quarta justa (4J), trítono (TT) e quinta justa (5J).', estimatedMinutes: '4 min' },
    'w2-l4': { title: 'Sextas, sétimas e oitavas', shortTitle: 'Sextas, 7as e 8as', description: 'Reconheça saltos amplos: 6m, 6M, 7m, 7M e oitava justa (8J).', estimatedMinutes: '4 min' },
    'w2-l5': { title: 'Desafio final: Intervalos Harmônicos', shortTitle: 'Desafio final', description: 'Desafio completo combinando intervalos melódicos e simultâneos.', estimatedMinutes: '5 min' },

    'w3-l1': { title: 'Maior e menor', shortTitle: 'Maior e menor', description: 'Identifique na hora o caráter luminoso maior e melancólico menor.', estimatedMinutes: '3 min' },
    'w3-l2': { title: 'Diminuto e aumentado', shortTitle: 'Dim. e Aumentado', description: 'Reconheça a tensão do diminuto e o mistério do acorde aumentado.', estimatedMinutes: '4 min' },
    'w3-l3': { title: 'Inversões', shortTitle: 'Inversões', description: 'Ouça o baixo e diferencie estado fundamental, 1ª e 2ª inversão.', estimatedMinutes: '4 min' },
    'w3-l4': { title: 'Acordes com sétima', shortTitle: 'Acordes de 7ª', description: 'Diferencie Maj7, m7, dominante 7 e meio-diminuto (m7b5).', estimatedMinutes: '4 min' },
    'w3-l5': { title: 'Desafio final: Acordes', shortTitle: 'Desafio final', description: 'Identifique qualidades, inversões e sétimas em vários registros.', estimatedMinutes: '5 min' },

    'w4-l1': { title: 'Maior vs. Menor', shortTitle: 'Maior vs. Menor', description: 'Distinga o caráter luminoso da escala maior frente à escala menor natural.', estimatedMinutes: '3 min' },
    'w4-l2': { title: 'As 3 Menores', shortTitle: 'As 3 Menores', description: 'Diferencie a cor final entre a escala menor natural, harmônica e melódica.', estimatedMinutes: '4 min' },
    'w4-l3': { title: 'Som Pentatônico', shortTitle: 'Pentatônico', description: 'Reconheça a sonoridade aberta de 5 notas frente às escalas diatônicas de 7 notas.', estimatedMinutes: '4 min' },
    'w4-l4': { title: 'A Cor do Blues', shortTitle: 'Cor do Blues', description: 'Detecte a presença característica da blue note frente às pentatônicas puras.', estimatedMinutes: '4 min' },
    'w4-l5': { title: 'Desafio final', shortTitle: 'Desafio final', description: 'Mistura integradora de todas as escalas do mundo: maior, as 3 menores, pentatônicas e blues.', estimatedMinutes: '5 min' },

    'w5-l1': { title: 'Tônica e dominante', shortTitle: 'Tônica e dom.', description: 'Sinta a gravidade do repouso (I) frente à tensão dominante (V).', estimatedMinutes: '3 min' },
    'w5-l2': { title: 'Cadências', shortTitle: 'Cadências', description: 'Identifique cadência autêntica, plagal, semicadência e deceptiva.', estimatedMinutes: '4 min' },
    'w5-l3': { title: 'Progressões populares', shortTitle: 'Progressões', description: 'Reconheça I-V-vi-IV, I-IV-V-I, ii-V-I e I-vi-IV-V de ouvido.', estimatedMinutes: '4 min' },
    'w5-l4': { title: 'Mudanças harmônicas', shortTitle: 'Mudanças harm.', description: 'Detecte para qual grau a harmonia se move dentro de uma frase.', estimatedMinutes: '4 min' },
    'w5-l5': { title: 'Desafio final: Harmonia', shortTitle: 'Desafio final', description: 'Domínio total de cadências, funções e progressões reais.', estimatedMinutes: '5 min' },

    'w6-l1': { title: 'Melodias de três notas', shortTitle: '3 notas', description: 'Ouça motivos de 3 notas e reproduza-os no teclado virtual.', estimatedMinutes: '4 min' },
    'w6-l2': { title: 'Completar melodias', shortTitle: 'Completar', description: 'Ouça a frase musical e toque a nota final que a completa.', estimatedMinutes: '4 min' },
    'w6-l3': { title: 'Ditado melódico', shortTitle: 'Ditado', description: 'Reconstrua frases de 4 notas combinando ouvido e piano virtual.', estimatedMinutes: '5 min' },
    'w6-l4': { title: 'Graus tonais', shortTitle: 'Graus tonais', description: 'Ouça a cadência inicial e identifique o grau exato da escala.', estimatedMinutes: '4 min' },
    'w6-l5': { title: 'Desafio final: Melodias', shortTitle: 'Desafio final', description: 'Prova integral de ditado, graus tonais e reprodução musical.', estimatedMinutes: '5 min' },

    'w7-l1': { title: 'Pulso', shortTitle: 'Pulso', description: 'Sinta o pulso estável e reproduza semínimas e mínimas com precisão.', estimatedMinutes: '3 min' },
    'w7-l2': { title: 'Figuras rítmicas', shortTitle: 'Figuras', description: 'Identifique combinações de mínimas, semínimas e colcheias de ouvido.', estimatedMinutes: '4 min' },
    'w7-l3': { title: 'Síncopes', shortTitle: 'Síncopes', description: 'Distinga acentos em contratempo e padrões sincopados.', estimatedMinutes: '4 min' },
    'w7-l4': { title: 'Execução de padrões', shortTitle: 'Padrões', description: 'Ouça o ritmo e reproduza-o no pad rítmico interativo.', estimatedMinutes: '4 min' },
    'w7-l5': { title: 'Desafio final: Ritmo', shortTitle: 'Desafio final', description: 'Combine reconhecimento de figuras, síncopes e execução em tempo real.', estimatedMinutes: '5 min' },

    'w8-l1': { title: 'Intervalos combinados', shortTitle: 'Intervalos mix', description: 'Intervalos ascendentes, descendentes e harmônicos em qualquer registro.', estimatedMinutes: '4 min' },
    'w8-l2': { title: 'Acordes avançados', shortTitle: 'Acordes avanç.', description: 'Tríades, inversões e acordes com sétima sem dicas prévias.', estimatedMinutes: '4 min' },
    'w8-l3': { title: 'Escalas e progressões', shortTitle: 'Escalas e harm.', description: 'Identificação rápida de escalas, cadências e progressões harmônicas.', estimatedMinutes: '4 min' },
    'w8-l4': { title: 'Desafios de memória musical', shortTitle: 'Memória pro', description: 'Melodias estendidas no piano virtual e padrões rítmicos complexos.', estimatedMinutes: '5 min' },
    'w8-l5': { title: 'Grande desafio final', shortTitle: 'Grande desafio', description: 'O exame mestre do Rumie EarHero. Complete-o para desbloquear seu Diploma.', estimatedMinutes: '6 min' },
  },
};

export const MEDALS_I18N: Record<Language, Record<string, LocalizedMedalText>> = {
  es: {
    medal_world_1: { title: 'Oído Despierto', description: 'Completaste los 5 niveles del Mundo 1: El Despertar del Oído.', requirementText: 'Completar Mundo 1' },
    medal_world_2: { title: 'Arquitecto de Intervalos', description: 'Dominaste las distancias melódicas y armónicas del Mundo 2.', requirementText: 'Completar Mundo 2' },
    medal_world_3: { title: 'Descifrador de Acordes', description: 'Identificaste tríadas, inversiones y acordes de séptima en el Mundo 3.', requirementText: 'Completar Mundo 3' },
    medal_world_4: { title: 'Navegante de Escalas', description: 'Recorriste escalas mayores, menores, pentatónicas y blues en el Mundo 4.', requirementText: 'Completar Mundo 4' },
    medal_world_5: { title: 'Guía Armónico', description: 'Dominaste funciones tonales, cadencias y progresiones en el Mundo 5.', requirementText: 'Completar Mundo 5' },
    medal_world_6: { title: 'Memoria Melódica', description: 'Superaste los dictados melódicos y grados tonales del Mundo 6.', requirementText: 'Completar Mundo 6' },
    medal_world_7: { title: 'Precisión Rítmica', description: 'Dominaste pulso, figuras, síncopas y patrones en el Mundo 7.', requirementText: 'Completar Mundo 7' },
    medal_world_8: { title: 'Maestro del Oído', description: 'Superaste el Gran Desafío Final y completaste los 8 mundos.', requirementText: 'Completar Mundo 8' },
    medal_perfect_first: { title: 'Oído Perfecto', description: 'Obtuviste 100% de aciertos (3 estrellas) en una misión auditiva.', requirementText: '1 nivel con 100%' },
    medal_precision_5: { title: 'Precisión Quirúrgica', description: 'Lograste 3 estrellas en al menos 5 niveles distintos.', requirementText: '5 niveles con 3 estrellas' },
    medal_first_step: { title: 'Primera Nota', description: 'Completaste tu primera misión auditiva en Rumie EarHero.', requirementText: 'Completar 1 nivel' },
    medal_streak_3: { title: 'Ritmo Constante', description: 'Mantuviste una racha activa de 3 días de entrenamiento auditivo.', requirementText: 'Racha de 3 días' },
    medal_streak_7: { title: 'Disciplina Musical', description: 'Entrenaste tu oído durante 7 días consecutivos.', requirementText: 'Racha de 7 días' },
    medal_mastery_intervals: { title: 'Dominio de Intervalos', description: 'Acumulaste al menos 20 aciertos en intervalos con ≥ 85% de precisión.', requirementText: '≥ 20 aciertos (85%+) en Intervalos' },
    medal_mastery_chords: { title: 'Maestro de Acordes', description: 'Acumulaste al menos 20 aciertos en acordes con ≥ 85% de precisión.', requirementText: '≥ 20 aciertos (85%+) en Acordes' },
    medal_mastery_scales: { title: 'Explorador de Escalas', description: 'Acumulaste al menos 18 aciertos en escalas con ≥ 85% de precisión.', requirementText: '≥ 18 aciertos (85%+) en Escalas' },
  },
  en: {
    medal_world_1: { title: 'Awakened Ear', description: 'Completed all 5 levels of World 1: Ear Awakening.', requirementText: 'Complete World 1' },
    medal_world_2: { title: 'Interval Architect', description: 'Mastered melodic and harmonic distances in World 2.', requirementText: 'Complete World 2' },
    medal_world_3: { title: 'Chord Decoder', description: 'Identified triads, inversions, and seventh chords in World 3.', requirementText: 'Complete World 3' },
    medal_world_4: { title: 'Scale Navigator', description: 'Conquered major, minor, pentatonic, and blues scales in World 4.', requirementText: 'Complete World 4' },
    medal_world_5: { title: 'Harmony Guide', description: 'Mastered tonal functions, cadences, and progressions in World 5.', requirementText: 'Complete World 5' },
    medal_world_6: { title: 'Melodic Memory', description: 'Passed melodic dictations and scale degrees in World 6.', requirementText: 'Complete World 6' },
    medal_world_7: { title: 'Rhythmic Precision', description: 'Mastered pulse, figures, syncopation, and patterns in World 7.', requirementText: 'Complete World 7' },
    medal_world_8: { title: 'Master of the Ear', description: 'Conquered the Grand Final Challenge and all 8 musical worlds.', requirementText: 'Complete World 8' },
    medal_perfect_first: { title: 'Perfect Ear', description: 'Scored 100% accuracy (3 stars) in an ear training mission.', requirementText: '1 level with 100%' },
    medal_precision_5: { title: 'Surgical Precision', description: 'Earned 3 stars across at least 5 different levels.', requirementText: '5 levels with 3 stars' },
    medal_first_step: { title: 'First Note', description: 'Completed your very first auditory mission in Rumie EarHero.', requirementText: 'Complete 1 level' },
    medal_streak_3: { title: 'Steady Groove', description: 'Maintained an active 3-day ear training streak.', requirementText: '3-day streak' },
    medal_streak_7: { title: 'Musical Discipline', description: 'Trained your ear for 7 consecutive days.', requirementText: '7-day streak' },
    medal_mastery_intervals: { title: 'Interval Mastery', description: 'Reached at least 20 correct interval answers with ≥ 85% accuracy.', requirementText: '≥ 20 hits (85%+) in Intervals' },
    medal_mastery_chords: { title: 'Chord Master', description: 'Reached at least 20 correct chord answers with ≥ 85% accuracy.', requirementText: '≥ 20 hits (85%+) in Chords' },
    medal_mastery_scales: { title: 'Scale Explorer', description: 'Reached at least 18 correct scale answers with ≥ 85% accuracy.', requirementText: '≥ 18 hits (85%+) in Scales' },
  },
  pt: {
    medal_world_1: { title: 'Ouvido Desperto', description: 'Você completou os 5 níveis do Mundo 1: O Despertar do Ouvido.', requirementText: 'Completar Mundo 1' },
    medal_world_2: { title: 'Arquiteto de Intervalos', description: 'Dominou as distâncias melódicas e harmônicas do Mundo 2.', requirementText: 'Completar Mundo 2' },
    medal_world_3: { title: 'Decifrador de Acordes', description: 'Identificou tríades, inversões e acordes com sétima no Mundo 3.', requirementText: 'Completar Mundo 3' },
    medal_world_4: { title: 'Navegador de Escalas', description: 'Percorreu escalas maiores, menores, pentatônicas e blues no Mundo 4.', requirementText: 'Completar Mundo 4' },
    medal_world_5: { title: 'Guia Harmônico', description: 'Dominou funções tonais, cadências e progressões no Mundo 5.', requirementText: 'Completar Mundo 5' },
    medal_world_6: { title: 'Memória Melódica', description: 'Superou ditados melódicos e graus tonais do Mundo 6.', requirementText: 'Completar Mundo 6' },
    medal_world_7: { title: 'Precisão Rítmica', description: 'Dominou pulso, figuras, síncopes e padrões no Mundo 7.', requirementText: 'Completar Mundo 7' },
    medal_world_8: { title: 'Mestre do Ouvido', description: 'Superou o Grande Desafio Final e completou os 8 mundos.', requirementText: 'Completar Mundo 8' },
    medal_perfect_first: { title: 'Ouvido Perfeito', description: 'Obteve 100% de acertos (3 estrelas) em uma missão auditiva.', requirementText: '1 nível com 100%' },
    medal_precision_5: { title: 'Precisão Cirúrgica', description: 'Conquistou 3 estrelas em pelo menos 5 níveis diferentes.', requirementText: '5 níveis com 3 estrelas' },
    medal_first_step: { title: 'Primeira Nota', description: 'Completou sua primeira missão auditiva no Rumie EarHero.', requirementText: 'Completar 1 nível' },
    medal_streak_3: { title: 'Ritmo Constante', description: 'Manteve uma sequência ativa de 3 dias de treino auditivo.', requirementText: 'Sequência de 3 dias' },
    medal_streak_7: { title: 'Disciplina Musical', description: 'Treinou seu ouvido durante 7 dias consecutivos.', requirementText: 'Sequência de 7 dias' },
    medal_mastery_intervals: { title: 'Domínio de Intervalos', description: 'Acumulou pelo menos 20 acertos em intervalos com ≥ 85% de precisão.', requirementText: '≥ 20 acertos (85%+) em Intervalos' },
    medal_mastery_chords: { title: 'Mestre dos Acordes', description: 'Acumulou pelo menos 20 acertos em acordes com ≥ 85% de precisão.', requirementText: '≥ 20 acertos (85%+) em Acordes' },
    medal_mastery_scales: { title: 'Explorador de Escalas', description: 'Acumulou pelo menos 18 acertos em escalas com ≥ 85% de precisão.', requirementText: '≥ 18 acertos (85%+) em Escalas' },
  },
};

export function getLocalizedWorld(world: WorldDefinition, lang: Language): LocalizedWorldText {
  return (
    WORLDS_I18N[lang][world.id] ?? {
      title: world.title,
      shortName: world.title.replace(/^Mundo \d+:\s*/, ''),
      subtitle: world.subtitle,
      rewardTitle: world.rewardTitle,
    }
  );
}

export function getLocalizedLevel(level: LevelDefinition, lang: Language): LocalizedLevelText {
  return (
    LEVELS_I18N[lang][level.id] ?? {
      title: level.title,
      shortTitle: level.shortTitle,
      description: level.description,
      estimatedMinutes: level.estimatedMinutes,
    }
  );
}

export function getLocalizedMedal(medal: MedalDefinition, lang: Language): LocalizedMedalText {
  return (
    MEDALS_I18N[lang][medal.id] ?? {
      title: medal.title,
      description: medal.description,
      requirementText: medal.requirementText,
    }
  );
}
