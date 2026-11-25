import { Language } from './types';

export interface UITranslations {
  brand: {
    name: string;
    slogan: string;
    defaultStudent: string;
  };
  hud: {
    navAria: string;
    mobileNavAria: string;
    map: string;
    lab: string;
    labShort: string;
    rewards: string;
    diagnostic: string;
    diagnosticShort: string;
    diagnosticTitle: string;
    adaptive: string;
    adaptiveTitle: string;
    daily60: string;
    daily60Short: string;
    daily60Title: string;
    daily60DoneTitle: string;
    xpTitle: string;
    streakTitle: string;
    starsTitle: string;
    levelsProgressTitle: string;
    licenseBtn: string;
    premiumBtn: string;
    editProfileAria: string;
    languageAria: string;
    playerNameLabel: string;
    playerNameHint: string;
    avatarColorLabel: string;
    cancel: string;
    save: string;
  };
  map: {
    viewAllWorlds: string;
    backToStages: string;
    worldOfEight: (id: number) => string;
    yourLocation: string;
    premiumBadge: string;
    bossTag: string;
    bossWorldTag: (id: number) => string;
    worldLevelTag: (worldId: number, levelNum: number) => string;
    completedBadge: string;
    challengesLabel: string;
    timeLabel: string;
    rewardLabel: string;
    bestScore: string;
    accuracySuffix: (pct: number) => string;
    passRequired: string;
    passThreshold: string;
    worldMedal: (id: number) => string;
    recommendedDrill: string;
    unlockPremium: string;
    passPrevious: string;
    replayMission: string;
    playMission: string;
    starsAria: (stars: number) => string;
    bossAria: (title: string) => string;
    levelAria: (num: number, title: string) => string;
    finalGoalDiplomaLabel: string;
    diplomaCardTitle: string;
    labPracticeLabel: string;
    labPracticeByWorld: Record<number, string>;
  };
  atlas: {
    ariaLabel: string;
    title: string;
    subtitle: (worldId: number, completed: number) => {
      prefix: string;
      worldHighlight: string;
      mid: string;
      suffix: string;
    };
    remainingHint: (remaining: number) => string;
    completedHint: string;
    progressBarAria: string;
    finalGoalTitle: string;
    statusCompleted: string;
    statusActive: string;
    statusLockedProgress: string;
    statusLockedPremium: string;
    fiveStagesHeading: string;
    bossPrefix: string;
    exclusiveMedal: string;
    earnedTag: string;
    enterWorld: (id: number) => string;
    unlockAllWorlds: string;
    completePrevWorld: (prevId: number) => string;
  };
  lab: {
    modules: {
      keyboardPiano: string;
      keyboardGuitar: string;
      intervals: string;
      chords: string;
      scales: string;
      progressions: string;
      melody: string;
    };
    piano: string;
    guitar: string;
    root: string;
    octaveShort: string;
    idleGuitar: string;
    idlePiano: string;
    premiumTitle: string;
    premiumDesc: string;
    viewPremiumLicense: string;
    freeGuitarTitle: string;
    freePianoTitle: string;
    freeGuitarDesc: string;
    freePianoDesc: string;
    intervalPadsTitle: (rootNote: string) => string;
    melodic: string;
    harmonic: string;
    semitoneShort: string;
    chordPadsTitle: (rootNote: string) => string;
    rootPosShort: string;
    firstInvShort: string;
    secondInvShort: string;
    scalesTitle: (rootNote: string) => string;
    scaleOf: (scaleName: string, rootNote: string) => string;
    progressionInMajor: (progName: string, rootNote: string) => string;
    melodyTitle: string;
    melodyDescGuitar: (startNote: string) => string;
    melodyDescPiano: (startNote: string) => string;
    melodyPromptGuitar: (startNote: string) => string;
    melodyPromptPiano: (startNote: string) => string;
    melodyExactConsole: (notesStr: string) => string;
    melodyWrongConsole: (notesStr: string) => string;
    melodySuccessMsg: string;
    melodyHintGuitar: string;
    melodyHintPiano: string;
    newMelody: string;
    replay: string;
    playedNote: (noteName: string, midi: number) => string;
    pianoAria: string;
    pianoNoteAria: (noteName: string) => string;
    referenceNoteTitle: string;
    guitarAria: string;
    guitarCellAria: (strNum: number, strLabel: string, fret: number, noteName: string) => string;
    guitarAnchorTitle: (noteName: string) => string;
    guitarOpenLabel: string;
  };
  arena: {
    exitAria: string;
    adaptiveTag: string;
    worldLevelHeader: (worldId: number, levelNum: number) => string;
    challengeCounterAria: (curr: number, total: number) => string;
    challengeLabel: (curr: number, total: number) => string;
    listeningTag: string;
    niceTryTag: string;
    listenAria: string;
    playingBtn: string;
    repeatBtn: string;
    listenBtn: string;
    onlyA: string;
    onlyB: string;
    positionNum: (pos: number) => string;
    tapToPlay: string;
    reset: string;
    checkOrder: string;
    notesLabel: string;
    clear: string;
    check: string;
    beatLabel: (n: number) => string;
    startRecording: string;
    getReady: string;
    hitPad: string;
    hitsCounter: (curr: number, expected: number) => string;
    correctHeading: string;
    reviewHeading: string;
    comboLabel: (combo: number) => string;
    listenAgain: string;
    nextChallenge: string;
    viewResult: string;
    summaryAdaptiveTitle: string;
    summaryPassedTitle: string;
    summaryRetryTitle: string;
    summaryAdaptiveDesc: string;
    summaryPassedDesc: (levelTitle: string, accuracy: number) => string;
    summaryRetryDesc: (accuracy: number) => string;
    hitsTile: string;
    accuracyTile: string;
    maxComboTile: string;
    newMedalUnlocked: string;
    diplomaUnlockedBanner: string;
    nextLevelBtn: string;
    retryBtn: string;
    backToMapBtn: string;
  };
  diagnostic: {
    dialogAria: string;
    title: string;
    closeAria: string;
    scannerResultTag: string;
    suggestedRoutePrefix: string;
    suggestedWorld: (id: number) => string;
    strengths: string;
    readyToStart: string;
    focusAreas: string;
    outstandingMastery: string;
    backToAdventureMap: string;
    testCounter: (curr: number, total: number) => string;
    playing: string;
    listen: string;
  };
  rewards: {
    vaultTitle: string;
    medalsTab: string;
    statsDiplomaTab: string;
    diplomaBtn: string;
    medalsGridAria: string;
    earnedBadge: string;
    skillMasteryTitle: string;
    levelsCount: (done: number) => string;
    trainAdaptiveBtn: string;
    officialCertLabel: string;
    masterEarDiploma: string;
    diplomaReady: string;
    diplomaLockedHint: string;
    previewDiplomaAria: string;
    viewBtn: string;
    downloadDiplomaAria: string;
    diplomaModalAria: string;
    closePreviewAria: string;
    diplomaHeading: string;
    diplomaSubtitle: string;
    certifiesThat: string;
    completedJourneyLine: string;
    diplomaStatsLine: (xp: number, stars: number, acc: number) => string;
    accuracyWord: string;
    pendingWorld8: string;
    awardedOn: (dateStr: string) => string;
    rumieTagline: string;
    downloadDiplomaBtn: string;
    completeWorld8ToDownload: string;
    dateLocale: string;
  };
  license: {
    dialogAria: string;
    title: string;
    subtitle: string;
    closeAria: string;
    freeTitle: string;
    activeBadge: string;
    freeSubtitle: string;
    freeFeatures: [string, string, string, string];
    currentPlanBtn: string;
    tryFreeBtn: string;
    premiumTitle: string;
    premiumActiveBadge: string;
    premiumSubtitle: string;
    premiumFeatures: [string, string, string, string];
    premiumActiveBtn: string;
    activatePremiumBtn: string;
    laravelAdapterReady: string;
    verifyLicenseBtn: string;
    verifiedByServer: (plan: string, synced: boolean) => string;
    localCheckFallback: string;
    resetProgressBtn: string;
    resetConfirmPrompt: string;
    resetConfirmBtn: string;
    cancel: string;
  };
  adaptive: {
    levelTitle: string;
    levelShort: string;
    levelDesc: string;
    reasonWithContrast: (acc: number, label: string, contrast: string) => string;
    reasonBasic: (acc: number, attempts: number) => string;
  };
  daily60: {
    dialogAria: string;
    title: string;
    badge: string;
    readyHeading: string;
    readyDesc: string;
    categoriesHint: string;
    rewardHint: string;
    bestRecordLabel: string;
    hitsUnit: string;
    startBtn: string;
    timeLeft: string;
    scoreLabel: string;
    hitsLabel: string;
    comboLabel: (n: number) => string;
    listenBtn: string;
    playingBtn: string;
    finishTitle: string;
    newRecordBadge: string;
    energyEarnedLabel: string;
    accuracyLabel: string;
    maxComboLabel: string;
    recordEverLabel: string;
    todayMarkLabel: string;
    retryUnlimitedBtn: string;
    freeCompletedHeading: string;
    freeCompletedDesc: string;
    freeLimitNotice: string;
    unlockUnlimitedBtn: string;
    shareResultBtn: string;
    backToMapBtn: string;
    cardCategory: string;
    cardTitle: (hits: number) => string;
    cardSubtitle: (score: number, combo: number) => string;
    cardMetricHitsLabel: string;
    cardMetricHitsValue: (hits: number) => string;
    closeAria: string;
  };
  shareCard: {
    shareOrDownloadBtn: string;
    shareProgressBtn: string;
    shareShortBtn: string;
    modalAria: string;
    modalTitle: string;
    modalSubtitle: string;
    closeAria: string;
    downloadPngBtn: string;
    shareBtn: string;
    downloadedToShareMsg: string;
    downloadedMsg: string;
    sharedSuccessMsg: string;
    starsMetric: string;
    streakMetric: string;
    energyMetric: string;
    accuracyMetric: string;
    progressCategory: string;
    progressTitle: (levels: number) => string;
    progressSubtitle: (medals: number) => string;
    medalCategory: string;
    worldMedalCategory: (worldId: number) => string;
    bossCategory: (worldId: number) => string;
    bossTitle: (worldName: string) => string;
    bossSubtitle: (accuracy: number, stars: number) => string;
    diagnosticCategory: string;
    diagnosticTitle: (score: number) => string;
    diagnosticSubtitle: (worldId: number) => string;
    shareText: (title: string) => string;
    shareSocialHeading: string;
    instagramReadyMsg: string;
    linkCopiedMsg: string;
  };
}

export const TRANSLATIONS: Record<Language, UITranslations> = {
  es: {
    brand: {
      name: 'Rumie EarHero',
      slogan: 'Entrena tu oído jugando',
      defaultStudent: 'Estudiante',
    },
    hud: {
      navAria: 'Navegación principal',
      mobileNavAria: 'Navegación móvil',
      map: 'Mapa',
      lab: 'Laboratorio',
      labShort: 'Lab',
      rewards: 'Logros',
      diagnostic: 'Diagnóstico',
      diagnosticShort: 'Diag.',
      diagnosticTitle: 'Diagnóstico Auditivo',
      adaptive: 'Refuerzo',
      adaptiveTitle: 'Refuerzo Adaptativo',
      daily60: 'Diario 60s',
      daily60Short: '60s',
      daily60Title: 'Reto Diario de 60 segundos',
      daily60DoneTitle: 'Reto Diario de 60s completado hoy',
      xpTitle: 'Experiencia acumulada',
      streakTitle: 'Racha diaria de práctica',
      starsTitle: 'Estrellas obtenidas',
      levelsProgressTitle: 'Progreso de niveles',
      licenseBtn: 'Licencia',
      premiumBtn: 'Premium',
      editProfileAria: 'Editar perfil del jugador',
      languageAria: 'Cambiar idioma',
      playerNameLabel: 'Nombre del jugador (Diploma)',
      playerNameHint: 'Aparecerá en tu diploma oficial',
      avatarColorLabel: 'Color del avatar',
      cancel: 'Cancelar',
      save: 'Guardar',
    },
    map: {
      viewAllWorlds: 'Ver los 8 Mundos',
      backToStages: 'Volver a Etapas',
      worldOfEight: (id) => `Mundo ${id} de 8`,
      yourLocation: 'Tu ubicación actual',
      premiumBadge: 'Premium',
      bossTag: 'JEFE',
      bossWorldTag: (id) => `JEFE · MUNDO ${id}`,
      worldLevelTag: (w, l) => `MUNDO ${w} · NIVEL ${l}`,
      completedBadge: 'SUPERADO',
      challengesLabel: 'Retos',
      timeLabel: 'Tiempo',
      rewardLabel: 'Premio',
      bestScore: 'Mejor marca',
      accuracySuffix: (pct) => `${pct}% precisión`,
      passRequired: 'Aprobación requerida',
      passThreshold: '≥ 80% aciertos',
      worldMedal: (id) => `Medalla del Mundo ${id}`,
      recommendedDrill: 'Refuerzo recomendado',
      unlockPremium: 'DESBLOQUEAR PREMIUM',
      passPrevious: 'SUPERA EL NIVEL ANTERIOR (≥ 80%)',
      replayMission: 'REJUGAR MISIÓN',
      playMission: 'JUGAR MISIÓN',
      starsAria: (s) => `${s} de 3 estrellas`,
      bossAria: (t) => `Desafío Jefe: ${t}`,
      levelAria: (n, t) => `Nivel ${n}: ${t}`,
      finalGoalDiplomaLabel: 'META FINAL · DIPLOMA OFICIAL',
      diplomaCardTitle: 'Diploma Maestro EarHero',
      labPracticeLabel: 'PRÁCTICA PREVIA · LABORATORIO',
      labPracticeByWorld: {
        1: 'Ensayar Teclado antes de jugar',
        2: 'Ensayar Intervalos antes de jugar',
        3: 'Ensayar Acordes antes de jugar',
        4: 'Ensayar Escalas antes de jugar',
        5: 'Ensayar Progresiones antes de jugar',
        6: 'Ensayar Memoria antes de jugar',
        7: 'Ensayar Teclado antes de jugar',
        8: 'Ensayar Teclado antes de jugar',
      },
    },
    atlas: {
      ariaLabel: 'Atlas de los 8 Mundos Musicales',
      title: 'Mapa de la Aventura Musical',
      subtitle: (worldId, completed) => ({
        prefix: 'Estás en el ',
        worldHighlight: `Mundo ${worldId} de 8`,
        mid: ' · Llevas ',
        suffix: ` de 40 niveles superados`,
      }),
      remainingHint: (rem) => `Te faltan ${rem} niveles para el Diploma Maestro`,
      completedHint: '¡Expedición completada! Diploma Maestro obtenido',
      progressBarAria: 'Progreso en los 8 mundos',
      finalGoalTitle: 'Meta final: Diploma Maestro del Oído',
      statusCompleted: 'Completado',
      statusActive: 'En progreso',
      statusLockedProgress: 'Por descubrir',
      statusLockedPremium: 'Exclusivo Premium',
      fiveStagesHeading: 'Las 5 etapas del mundo',
      bossPrefix: 'Jefe',
      exclusiveMedal: 'Medalla exclusiva',
      earnedTag: 'GANADA',
      enterWorld: (id) => `ENTRAR AL MUNDO ${id}`,
      unlockAllWorlds: 'DESBLOQUEAR LOS 8 MUNDOS',
      completePrevWorld: (prev) => `Supera el Mundo ${prev} para abrir esta ruta`,
    },
    lab: {
      modules: {
        keyboardPiano: 'Teclado',
        keyboardGuitar: 'Mástil',
        intervals: 'Intervalos',
        chords: 'Acordes',
        scales: 'Escalas',
        progressions: 'Progresiones',
        melody: 'Memoria',
      },
      piano: 'Piano',
      guitar: 'Guitarra',
      root: 'Raíz',
      octaveShort: 'Oct',
      idleGuitar: 'Consola lista: dispara cualquier pad musical o toca el mástil de guitarra inferior.',
      idlePiano: 'Consola lista: dispara cualquier pad musical o toca el sintetizador inferior.',
      premiumTitle: 'Módulo incluido en Rumie Premium',
      premiumDesc:
        'El plan gratuito incluye el instrumento libre y los intervalos. Desbloquea acordes, escalas, progresiones y memoria melódica con Premium.',
      viewPremiumLicense: 'VER LICENCIA PREMIUM',
      freeGuitarTitle: 'Mástil de Guitarra Libre Rumie',
      freePianoTitle: 'Sintetizador Libre Rumie',
      freeGuitarDesc:
        'Pulsa cualquier cuerda al aire o traste (0 al 15) en el mástil inferior para explorar afinación estándar (Mi2–Sol5) y digitaciones en tiempo real.',
      freePianoDesc:
        'Toca libremente en el teclado inferior, cambia de octava o alterna entre piano acústico y guitarra pulsada en tiempo real.',
      intervalPadsTitle: (root) => `Pads de Intervalos desde ${root}`,
      melodic: 'Melódico',
      harmonic: 'Armónico',
      semitoneShort: 'st',
      chordPadsTitle: (root) => `Pads de Acordes sobre ${root}`,
      rootPosShort: 'Fund.',
      firstInvShort: '1.ª inv',
      secondInvShort: '2.ª inv',
      scalesTitle: (root) => `Escalas musicales en ${root}`,
      scaleOf: (name, root) => `${name} de ${root}`,
      progressionInMajor: (name, root) => `${name} en ${root} Mayor`,
      melodyTitle: 'Desafío Libre de Memoria Melódica',
      melodyDescGuitar: (start) =>
        `Genera una melodía aleatoria de 4 notas en ${start} Mayor y reprodúcela en el mástil de guitarra inferior sin pistas visuales.`,
      melodyDescPiano: (start) =>
        `Genera una melodía aleatoria de 4 notas en ${start} Mayor y reprodúcela en el piano inferior sin pistas visuales.`,
      melodyPromptGuitar: (start) =>
        `Escucha la melodía de 4 notas (empieza en ${start}) y reprodúcela en el mástil de guitarra.`,
      melodyPromptPiano: (start) =>
        `Escucha la melodía de 4 notas (empieza en ${start}) y reprodúcela en el piano.`,
      melodyExactConsole: (notes) => `¡Exacto! Melodía: ${notes}.`,
      melodyWrongConsole: (notes) => `La melodía era ${notes}.`,
      melodySuccessMsg: '¡Excelente oído! Melodía exacta.',
      melodyHintGuitar: 'Observa los trastes iluminados en el mástil e inténtalo de nuevo.',
      melodyHintPiano: 'Observa las teclas iluminadas en cian e inténtalo de nuevo.',
      newMelody: 'NUEVA MELODÍA',
      replay: 'Repetir',
      playedNote: (name, midi) => `Nota tocada: ${name} · MIDI ${midi}`,
      pianoAria: 'Teclado virtual interactivo',
      pianoNoteAria: (n) => `Nota ${n}`,
      referenceNoteTitle: 'Nota de referencia',
      guitarAria: 'Mástil de guitarra interactivo de 6 cuerdas y 15 trastes',
      guitarCellAria: (s, lbl, fret, n) => `Cuerda ${s} (${lbl}), traste ${fret}: ${n}`,
      guitarAnchorTitle: (n) => `Raíz ancla: ${n} (clic en otra cuerda para cambiar posición)`,
      guitarOpenLabel: 'AIRE',
    },
    arena: {
      exitAria: 'Salir al mapa',
      adaptiveTag: 'Refuerzo',
      worldLevelHeader: (w, l) => `Mundo ${w} · Nivel ${l}`,
      challengeCounterAria: (c, t) => `Reto ${c} de ${t}`,
      challengeLabel: (c, t) => `Reto ${c} de ${t}`,
      listeningTag: 'Escuchando',
      niceTryTag: '¡Buen intento!',
      listenAria: 'Escuchar ejemplo musical',
      playingBtn: 'SONANDO',
      repeatBtn: 'REPETIR',
      listenBtn: 'ESCUCHAR',
      onlyA: 'Solo A',
      onlyB: 'Solo B',
      positionNum: (p) => `Posición #${p}`,
      tapToPlay: 'Tocar',
      reset: 'Reiniciar',
      checkOrder: 'COMPROBAR ORDEN',
      notesLabel: 'NOTAS:',
      clear: 'Limpiar',
      check: 'COMPROBAR',
      beatLabel: (n) => `PULSO ${n}`,
      startRecording: 'INICIAR GRABACIÓN (CONTEO 1-2-3-4)',
      getReady: 'PREPÁRATE... (1 · 2 · 3 · 4)',
      hitPad: '¡GOLPEA EL PAD! (O BARRA ESPACIADORA)',
      hitsCounter: (c, e) => `Golpes: ${c} / ${e}`,
      correctHeading: '¡CORRECTO!',
      reviewHeading: 'A REVISAR',
      comboLabel: (c) => `· COMBO x${c}`,
      listenAgain: 'Escuchar',
      nextChallenge: 'SIGUIENTE RETO',
      viewResult: 'VER RESULTADO',
      summaryAdaptiveTitle: '¡Refuerzo completado!',
      summaryPassedTitle: '¡MISIÓN SUPERADA!',
      summaryRetryTitle: 'SIGUE AFINANDO TU OÍDO',
      summaryAdaptiveDesc: 'Tus estadísticas adaptativas se actualizaron al instante.',
      summaryPassedDesc: (title, acc) => `"${title}" completado con ${acc}% de precisión.`,
      summaryRetryDesc: (acc) =>
        `Lograste ${acc}%. Necesitas ≥ 80% para avanzar. Puedes repetir sin límites.`,
      hitsTile: 'Aciertos',
      accuracyTile: 'Precisión',
      maxComboTile: 'Combo máx',
      newMedalUnlocked: '¡Nueva medalla desbloqueada!',
      diplomaUnlockedBanner: '¡Diploma Rumie EarHero desbloqueado en la vitrina de Logros!',
      nextLevelBtn: 'SIGUIENTE NIVEL',
      retryBtn: 'REPETIR',
      backToMapBtn: 'Volver al Mapa',
    },
    diagnostic: {
      dialogAria: 'Diagnóstico Auditivo Rumie EarHero',
      title: 'Diagnóstico Auditivo',
      closeAria: 'Cerrar diagnóstico',
      scannerResultTag: 'Resultado del escáner auditivo',
      suggestedRoutePrefix: 'Ruta sugerida: inicia o enfócate en el ',
      suggestedWorld: (id) => `Mundo ${id}`,
      strengths: 'Fortalezas',
      readyToStart: 'Base lista para comenzar',
      focusAreas: 'Áreas a reforzar',
      outstandingMastery: '¡Dominio sobresaliente!',
      backToAdventureMap: 'VOLVER AL MAPA DE AVENTURA',
      testCounter: (c, t) => `PRUEBA ${c} DE ${t}`,
      playing: 'SONANDO',
      listen: 'ESCUCHAR',
    },
    rewards: {
      vaultTitle: 'Vitrina de Logros',
      medalsTab: 'Medallas',
      statsDiplomaTab: 'Stats / Diploma',
      diplomaBtn: 'Diploma',
      medalsGridAria: 'Vitrina de 16 medallas',
      earnedBadge: 'OBTENIDA',
      skillMasteryTitle: 'Dominio por Habilidad',
      levelsCount: (done) => `${done}/40 niveles`,
      trainAdaptiveBtn: 'ENTRENAR REFUERZO ADAPTATIVO',
      officialCertLabel: 'Certificado Oficial',
      masterEarDiploma: 'Diploma Maestro del Oído',
      diplomaReady: '¡Desbloqueado y listo!',
      diplomaLockedHint: 'Supera Mundo 8 · Nivel 5',
      previewDiplomaAria: 'Vista previa del Diploma',
      viewBtn: 'Ver',
      downloadDiplomaAria: 'Descargar Diploma',
      diplomaModalAria: 'Vista previa del Diploma Rumie EarHero',
      closePreviewAria: 'Cerrar vista previa',
      diplomaHeading: 'DIPLOMA DE FINALIZACIÓN',
      diplomaSubtitle: 'Rumie EarHero — Entrena tu oído jugando',
      certifiesThat: 'Se certifica que',
      completedJourneyLine: 'ha completado los 8 Mundos Musicales y superado el Gran Desafío Final.',
      diplomaStatsLine: (xp, stars, acc) =>
        `XP acumulados: ${xp} · Estrellas: ${stars}/120 · Precisión global: ${acc}%`,
      accuracyWord: 'Precisión',
      pendingWorld8: 'Pendiente de completar Mundo 8',
      awardedOn: (d) => `Otorgado el ${d}`,
      rumieTagline: 'Aprende, Comprende y Crea Música.',
      downloadDiplomaBtn: 'DESCARGAR DIPLOMA (.SVG)',
      completeWorld8ToDownload: 'Completa el Mundo 8 (Gran Desafío Final) para habilitar la descarga',
      dateLocale: 'es-ES',
    },
    license: {
      dialogAria: 'Licencias Rumie EarHero',
      title: 'Licencias Rumie EarHero',
      subtitle:
        'Las licencias se validan en el servidor Laravel de Rumie sin pasarelas externas dentro de la app.',
      closeAria: 'Cerrar ventana de licencias',
      freeTitle: 'Gratuita',
      activeBadge: 'Activa',
      freeSubtitle: 'Ideal para iniciar tu entrenamiento',
      freeFeatures: [
        'Mundo 1 completo (5 niveles)',
        'Reto Diario de 60 segundos',
        'Primeras medallas y XP',
        'Laboratorio limitado (Teclado e Intervalos)',
      ],
      currentPlanBtn: 'PLAN ACTUAL',
      tryFreeBtn: 'PROBAR MODO GRATUITO',
      premiumTitle: 'Premium',
      premiumActiveBadge: 'ACTIVA',
      premiumSubtitle: 'Licencia perpetua · Rumie EarHero',
      premiumFeatures: [
        'Los 8 mundos musicales (40 niveles)',
        'Laboratorio Auditivo completo',
        'Estadísticas detalladas y tarjetas de logro',
        'Gran Desafío Final y Diploma oficial',
      ],
      premiumActiveBtn: 'LICENCIA PREMIUM ACTIVA',
      activatePremiumBtn: 'ACTIVAR PREMIUM (PROTOTIPO)',
      laravelAdapterReady:
        'Adaptador Laravel listo (`GET /api/rumie/ear-training/license` y `POST /api/rumie/ear-training/progress`).',
      verifyLicenseBtn: 'Verificar licencia',
      verifiedByServer: (plan, synced) =>
        `Licencia verificada por servidor Laravel (${plan}). ${synced ? 'Progreso sincronizado.' : ''}`,
      localCheckFallback: 'Verificación local completada.',
      resetProgressBtn: 'Reiniciar progreso local',
      resetConfirmPrompt: '¿Seguro? Se borrarán XP y medallas locales.',
      resetConfirmBtn: 'Confirmar reinicio',
      cancel: 'Cancelar',
    },
    adaptive: {
      levelTitle: 'Refuerzo Adaptativo',
      levelShort: 'Refuerzo',
      levelDesc: 'Práctica dirigida con contrastes para tus áreas de mejora.',
      reasonWithContrast: (acc, label, contrast) =>
        `Precisión ${acc}%. Recomendado practicar ${label} en contraste con ${contrast}.`,
      reasonBasic: (acc, att) =>
        `Precisión ${acc}% en ${att} intentos. Conviene reforzar con nuevas rondas.`,
    },
    daily60: {
      dialogAria: 'Reto Diario de 60 segundos Rumie EarHero',
      title: 'Reto Diario 60s',
      badge: 'CONTRARRELOJ DIARIO',
      readyHeading: '¿Cuántos retos aciertas en 60 segundos?',
      readyDesc: 'Responde al instante preguntas rápidas de dirección melódica, intervalos, tríadas y escalas.',
      categoriesHint: 'Dirección · Intervalos · Tríadas · Escalas',
      rewardHint: '+100 energía base + bono por cada acierto',
      bestRecordLabel: 'Mejor récord histórico',
      hitsUnit: 'aciertos',
      startBtn: '¡COMENZAR 60s!',
      timeLeft: 'Tiempo',
      scoreLabel: 'Puntaje',
      hitsLabel: 'Aciertos',
      comboLabel: (n) => `Combo x${n}`,
      listenBtn: 'Repetir',
      playingBtn: 'Sonando',
      finishTitle: '¡Tiempo cumplido!',
      newRecordBadge: '¡NUEVO RÉCORD PERSONAL!',
      energyEarnedLabel: 'Energía ganada',
      accuracyLabel: 'Precisión',
      maxComboLabel: 'Combo máx.',
      recordEverLabel: 'Récord histórico',
      todayMarkLabel: 'Tu marca de hoy',
      retryUnlimitedBtn: 'Reintentar (PRO)',
      freeCompletedHeading: '¡Reto Diario de hoy completado!',
      freeCompletedDesc: 'Ya registraste tu partida oficial de hoy y mantuviste tu racha activa.',
      freeLimitNotice: 'Plan FREE: 1 partida oficial por día. Con Premium puedes reintentar sin límite para batir tu récord.',
      unlockUnlimitedBtn: 'Desbloquear Premium',
      shareResultBtn: 'Compartir / Descargar Logro',
      backToMapBtn: 'Volver al Mapa',
      cardCategory: 'RETO DIARIO 60 SEGUNDOS',
      cardTitle: (hits) => `${hits} aciertos en 60s`,
      cardSubtitle: (score, combo) => `Puntaje ${score} pts · Combo máximo x${combo}`,
      cardMetricHitsLabel: 'ACIERTOS 60s',
      cardMetricHitsValue: (hits) => `${hits}`,
      closeAria: 'Cerrar Reto Diario 60s',
    },
    shareCard: {
      shareOrDownloadBtn: 'Compartir / Descargar',
      shareProgressBtn: 'Compartir mi Progreso',
      shareShortBtn: 'Compartir',
      modalAria: 'Tarjeta compartible de logro Rumie EarHero',
      modalTitle: 'Tarjeta de Logro',
      modalSubtitle: 'PNG 1080×1080 listo para compartir en redes o guardar',
      closeAria: 'Cerrar tarjeta compartible',
      downloadPngBtn: 'Descargar PNG',
      shareBtn: 'Compartir',
      downloadedToShareMsg: '¡Imagen descargada lista para compartir!',
      downloadedMsg: '¡PNG guardado como Rumie-EarHero-Logro.png!',
      sharedSuccessMsg: '¡Logro compartido con éxito!',
      starsMetric: 'ESTRELLAS',
      streakMetric: 'RACHA',
      energyMetric: 'ENERGÍA',
      accuracyMetric: 'PRECISIÓN',
      progressCategory: 'PROGRESO MUSICAL',
      progressTitle: (levels) => `${levels}/40 Etapas Superadas`,
      progressSubtitle: (medals) => `${medals} de 16 medallas desbloqueadas en Rumie EarHero`,
      medalCategory: 'MEDALLA DESBLOQUEADA',
      worldMedalCategory: (worldId) => `MEDALLA · MUNDO ${worldId}`,
      bossCategory: (worldId) => `JEFE SUPERADO · MUNDO ${worldId}`,
      bossTitle: (worldName) => `Maestro de ${worldName}`,
      bossSubtitle: (accuracy, stars) => `${accuracy}% de precisión · ${stars}/3 estrellas obtenidas`,
      diagnosticCategory: 'DIAGNÓSTICO AUDITIVO',
      diagnosticTitle: (score) => `${score}% en Diagnóstico Auditivo`,
      diagnosticSubtitle: (worldId) => `Nivel recomendado: Mundo ${worldId} de 8`,
      shareText: (title) => `¡Mira mi logro en Rumie EarHero: ${title}!`,
      shareSocialHeading: 'Compartir en redes sociales',
      instagramReadyMsg: 'PNG descargado y texto copiado para subir a Instagram',
      linkCopiedMsg: 'Enlace y texto copiados al portapapeles',
    },
  },

  en: {
    brand: {
      name: 'Rumie EarHero',
      slogan: 'Train your ear by playing',
      defaultStudent: 'Student',
    },
    hud: {
      navAria: 'Main navigation',
      mobileNavAria: 'Mobile navigation',
      map: 'Map',
      lab: 'Lab',
      labShort: 'Lab',
      rewards: 'Awards',
      diagnostic: 'Diagnostic',
      diagnosticShort: 'Diag.',
      diagnosticTitle: 'Auditory Diagnostic',
      adaptive: 'Boost',
      adaptiveTitle: 'Adaptive Reinforcement',
      daily60: 'Daily 60s',
      daily60Short: '60s',
      daily60Title: '60-Second Daily Challenge',
      daily60DoneTitle: 'Daily 60s completed today',
      xpTitle: 'Total Experience',
      streakTitle: 'Daily Practice Streak',
      starsTitle: 'Earned Stars',
      levelsProgressTitle: 'Completed Levels',
      licenseBtn: 'License',
      premiumBtn: 'Premium',
      editProfileAria: 'Edit player profile',
      languageAria: 'Change language',
      playerNameLabel: 'Player name (Diploma)',
      playerNameHint: 'Printed on your official Diploma',
      avatarColorLabel: 'Avatar color',
      cancel: 'Cancel',
      save: 'Save',
    },
    map: {
      viewAllWorlds: 'View 8 Worlds',
      backToStages: 'Back to Stages',
      worldOfEight: (id) => `World ${id} of 8`,
      yourLocation: 'Your current location',
      premiumBadge: 'Premium',
      bossTag: 'BOSS',
      bossWorldTag: (id) => `BOSS · WORLD ${id}`,
      worldLevelTag: (w, l) => `WORLD ${w} · LEVEL ${l}`,
      completedBadge: 'CLEARED',
      challengesLabel: 'Trials',
      timeLabel: 'Time',
      rewardLabel: 'Reward',
      bestScore: 'Best score',
      accuracySuffix: (pct) => `${pct}% accuracy`,
      passRequired: 'Pass requirement',
      passThreshold: '≥ 80% accuracy',
      worldMedal: (id) => `World ${id} Medal`,
      recommendedDrill: 'Recommended boost',
      unlockPremium: 'UNLOCK PREMIUM',
      passPrevious: 'CLEAR PREVIOUS LEVEL (≥ 80%)',
      replayMission: 'REPLAY MISSION',
      playMission: 'PLAY MISSION',
      starsAria: (s) => `${s} of 3 stars`,
      bossAria: (t) => `Boss Challenge: ${t}`,
      levelAria: (n, t) => `Level ${n}: ${t}`,
      finalGoalDiplomaLabel: 'FINAL GOAL · OFFICIAL DIPLOMA',
      diplomaCardTitle: 'EarHero Master Diploma',
      labPracticeLabel: 'PRE-PRACTICE · LABORATORY',
      labPracticeByWorld: {
        1: 'Practice Keyboard before playing',
        2: 'Practice Intervals before playing',
        3: 'Practice Chords before playing',
        4: 'Practice Scales before playing',
        5: 'Practice Progressions before playing',
        6: 'Practice Memory before playing',
        7: 'Practice Keyboard before playing',
        8: 'Practice Keyboard before playing',
      },
    },
    atlas: {
      ariaLabel: 'Atlas of the 8 Musical Worlds',
      title: 'Musical Adventure Map',
      subtitle: (worldId, _completed) => ({
        prefix: 'You are in ',
        worldHighlight: `World ${worldId} of 8`,
        mid: ' · You have cleared ',
        suffix: ' of 40 levels',
      }),
      remainingHint: (rem) => `${rem} levels left to earn the Master Diploma`,
      completedHint: 'Expedition complete! Master Diploma unlocked',
      progressBarAria: 'Progress across the 8 worlds',
      finalGoalTitle: 'Final Goal: Master of the Ear Diploma',
      statusCompleted: 'Completed',
      statusActive: 'In progress',
      statusLockedProgress: 'Undiscovered',
      statusLockedPremium: 'Premium Only',
      fiveStagesHeading: 'The 5 stages of this world',
      bossPrefix: 'Boss',
      exclusiveMedal: 'Exclusive medal',
      earnedTag: 'EARNED',
      enterWorld: (id) => `ENTER WORLD ${id}`,
      unlockAllWorlds: 'UNLOCK ALL 8 WORLDS',
      completePrevWorld: (prev) => `Complete World ${prev} to unlock this path`,
    },
    lab: {
      modules: {
        keyboardPiano: 'Keyboard',
        keyboardGuitar: 'Fretboard',
        intervals: 'Intervals',
        chords: 'Chords',
        scales: 'Scales',
        progressions: 'Progressions',
        melody: 'Memory',
      },
      piano: 'Piano',
      guitar: 'Guitar',
      root: 'Root',
      octaveShort: 'Oct',
      idleGuitar: 'Console ready: trigger any musical pad or play the guitar fretboard below.',
      idlePiano: 'Console ready: trigger any musical pad or play the synthesizer below.',
      premiumTitle: 'Included in Rumie Premium',
      premiumDesc:
        'The Free plan includes the free-play instrument and intervals. Unlock chords, scales, progressions, and melodic memory with Premium.',
      viewPremiumLicense: 'VIEW PREMIUM LICENSE',
      freeGuitarTitle: 'Rumie Free Guitar Fretboard',
      freePianoTitle: 'Rumie Free Synthesizer',
      freeGuitarDesc:
        'Tap any open string or fret (0–15) on the fretboard below to explore standard tuning (E2–G5) and ergonomic voicings in real time.',
      freePianoDesc:
        'Play freely on the keyboard below, change octaves, or switch between acoustic piano and plucked guitar in real time.',
      intervalPadsTitle: (root) => `Interval Pads from ${root}`,
      melodic: 'Melodic',
      harmonic: 'Harmonic',
      semitoneShort: 'st',
      chordPadsTitle: (root) => `Chord Pads over ${root}`,
      rootPosShort: 'Root',
      firstInvShort: '1st inv',
      secondInvShort: '2nd inv',
      scalesTitle: (root) => `Musical Scales in ${root}`,
      scaleOf: (name, root) => `${root} ${name}`,
      progressionInMajor: (name, root) => `${name} in ${root} Major`,
      melodyTitle: 'Free Melodic Memory Challenge',
      melodyDescGuitar: (start) =>
        `Generate a random 4-note melody in ${start} Major and play it back on the guitar fretboard below without visual hints.`,
      melodyDescPiano: (start) =>
        `Generate a random 4-note melody in ${start} Major and play it back on the piano below without visual hints.`,
      melodyPromptGuitar: (start) =>
        `Listen to the 4-note melody (starts on ${start}) and play it on the guitar fretboard.`,
      melodyPromptPiano: (start) =>
        `Listen to the 4-note melody (starts on ${start}) and play it on the piano.`,
      melodyExactConsole: (notes) => `Spot on! Melody: ${notes}.`,
      melodyWrongConsole: (notes) => `The melody was ${notes}.`,
      melodySuccessMsg: 'Great ear! Exact melody.',
      melodyHintGuitar: 'Check the highlighted frets on the neck and try again.',
      melodyHintPiano: 'Check the cyan highlighted keys and try again.',
      newMelody: 'NEW MELODY',
      replay: 'Replay',
      playedNote: (name, midi) => `Note played: ${name} · MIDI ${midi}`,
      pianoAria: 'Interactive virtual keyboard',
      pianoNoteAria: (n) => `Note ${n}`,
      referenceNoteTitle: 'Reference note',
      guitarAria: 'Interactive 6-string 15-fret guitar fretboard',
      guitarCellAria: (s, lbl, fret, n) => `String ${s} (${lbl}), fret ${fret}: ${n}`,
      guitarAnchorTitle: (n) => `Root anchor: ${n} (click another string to reposition)`,
      guitarOpenLabel: 'OPEN',
    },
    arena: {
      exitAria: 'Back to map',
      adaptiveTag: 'Boost',
      worldLevelHeader: (w, l) => `World ${w} · Level ${l}`,
      challengeCounterAria: (c, t) => `Trial ${c} of ${t}`,
      challengeLabel: (c, t) => `Trial ${c} of ${t}`,
      listeningTag: 'Listening',
      niceTryTag: 'Nice try!',
      listenAria: 'Listen to musical example',
      playingBtn: 'PLAYING',
      repeatBtn: 'REPLAY',
      listenBtn: 'LISTEN',
      onlyA: 'Only A',
      onlyB: 'Only B',
      positionNum: (p) => `Position #${p}`,
      tapToPlay: 'Play',
      reset: 'Reset',
      checkOrder: 'CHECK ORDER',
      notesLabel: 'NOTES:',
      clear: 'Clear',
      check: 'CHECK',
      beatLabel: (n) => `BEAT ${n}`,
      startRecording: 'START RECORDING (COUNT-IN 1-2-3-4)',
      getReady: 'GET READY... (1 · 2 · 3 · 4)',
      hitPad: 'TAP THE PAD! (OR SPACEBAR)',
      hitsCounter: (c, e) => `Hits: ${c} / ${e}`,
      correctHeading: 'CORRECT!',
      reviewHeading: 'REVIEW',
      comboLabel: (c) => `· COMBO x${c}`,
      listenAgain: 'Listen',
      nextChallenge: 'NEXT TRIAL',
      viewResult: 'VIEW RESULT',
      summaryAdaptiveTitle: 'Boost Completed!',
      summaryPassedTitle: 'MISSION CLEARED!',
      summaryRetryTitle: 'KEEP TUNING YOUR EAR',
      summaryAdaptiveDesc: 'Your adaptive stats have been updated instantly.',
      summaryPassedDesc: (title, acc) => `"${title}" cleared with ${acc}% accuracy.`,
      summaryRetryDesc: (acc) =>
        `You scored ${acc}%. You need ≥ 80% to advance. Practice again anytime.`,
      hitsTile: 'Correct',
      accuracyTile: 'Accuracy',
      maxComboTile: 'Max Combo',
      newMedalUnlocked: 'New medal unlocked!',
      diplomaUnlockedBanner: 'Rumie EarHero Diploma unlocked in your Awards vault!',
      nextLevelBtn: 'NEXT LEVEL',
      retryBtn: 'RETRY',
      backToMapBtn: 'Back to Map',
    },
    diagnostic: {
      dialogAria: 'Rumie EarHero Auditory Diagnostic',
      title: 'Auditory Diagnostic',
      closeAria: 'Close diagnostic',
      scannerResultTag: 'Auditory scanner result',
      suggestedRoutePrefix: 'Suggested path: start or focus on ',
      suggestedWorld: (id) => `World ${id}`,
      strengths: 'Strengths',
      readyToStart: 'Ready to start building',
      focusAreas: 'Focus areas',
      outstandingMastery: 'Outstanding mastery!',
      backToAdventureMap: 'BACK TO ADVENTURE MAP',
      testCounter: (c, t) => `TEST ${c} OF ${t}`,
      playing: 'PLAYING',
      listen: 'LISTEN',
    },
    rewards: {
      vaultTitle: 'Trophy Vault',
      medalsTab: 'Medals',
      statsDiplomaTab: 'Stats / Diploma',
      diplomaBtn: 'Diploma',
      medalsGridAria: 'Showcase of 16 medals',
      earnedBadge: 'EARNED',
      skillMasteryTitle: 'Skill Mastery',
      levelsCount: (done) => `${done}/40 levels`,
      trainAdaptiveBtn: 'TRAIN ADAPTIVE BOOST',
      officialCertLabel: 'Official Certificate',
      masterEarDiploma: 'Master of the Ear Diploma',
      diplomaReady: 'Unlocked and ready!',
      diplomaLockedHint: 'Clear World 8 · Level 5',
      previewDiplomaAria: 'Preview Diploma',
      viewBtn: 'View',
      downloadDiplomaAria: 'Download Diploma',
      diplomaModalAria: 'Rumie EarHero Diploma Preview',
      closePreviewAria: 'Close preview',
      diplomaHeading: 'DIPLOMA OF COMPLETION',
      diplomaSubtitle: 'Rumie EarHero — Train your ear by playing',
      certifiesThat: 'This certifies that',
      completedJourneyLine:
        'has completed all 8 Musical Worlds and conquered the Grand Final Challenge.',
      diplomaStatsLine: (xp, stars, acc) =>
        `Total XP: ${xp} · Stars: ${stars}/120 · Global Accuracy: ${acc}%`,
      accuracyWord: 'Accuracy',
      pendingWorld8: 'Pending World 8 completion',
      awardedOn: (d) => `Awarded on ${d}`,
      rumieTagline: 'Learn, Understand, and Create Music.',
      downloadDiplomaBtn: 'DOWNLOAD DIPLOMA (.SVG)',
      completeWorld8ToDownload: 'Complete World 8 (Grand Final Challenge) to enable download',
      dateLocale: 'en-US',
    },
    license: {
      dialogAria: 'Rumie EarHero Licenses',
      title: 'Rumie EarHero Licenses',
      subtitle:
        'Licenses are verified on the Rumie Laravel server with no external checkout inside the app.',
      closeAria: 'Close license modal',
      freeTitle: 'Free',
      activeBadge: 'Active',
      freeSubtitle: 'Great way to start your ear training',
      freeFeatures: [
        'Complete World 1 (5 levels)',
        'Daily 60-Second Challenge',
        'Starter medals and XP',
        'Limited Lab (Keyboard & Intervals)',
      ],
      currentPlanBtn: 'CURRENT PLAN',
      tryFreeBtn: 'TRY FREE MODE',
      premiumTitle: 'Premium',
      premiumActiveBadge: 'ACTIVE',
      premiumSubtitle: 'Perpetual license · Rumie EarHero',
      premiumFeatures: [
        'All 8 musical worlds (40 levels)',
        'Full Auditory Laboratory',
        'Detailed stats & shareable achievement cards',
        'Grand Final Challenge & Official Diploma',
      ],
      premiumActiveBtn: 'PREMIUM LICENSE ACTIVE',
      activatePremiumBtn: 'ACTIVATE PREMIUM (PROTOTYPE)',
      laravelAdapterReady:
        'Laravel adapter ready (`GET /api/rumie/ear-training/license` & `POST /api/rumie/ear-training/progress`).',
      verifyLicenseBtn: 'Verify license',
      verifiedByServer: (plan, synced) =>
        `License verified by Laravel server (${plan}). ${synced ? 'Progress synced.' : ''}`,
      localCheckFallback: 'Local verification complete.',
      resetProgressBtn: 'Reset local progress',
      resetConfirmPrompt: 'Are you sure? Local XP and medals will be cleared.',
      resetConfirmBtn: 'Confirm reset',
      cancel: 'Cancel',
    },
    adaptive: {
      levelTitle: 'Adaptive Boost',
      levelShort: 'Boost',
      levelDesc: 'Targeted contrast practice for your focus areas.',
      reasonWithContrast: (acc, label, contrast) =>
        `Accuracy ${acc}%. Recommended to practice ${label} contrasted with ${contrast}.`,
      reasonBasic: (acc, att) =>
        `Accuracy ${acc}% over ${att} attempts. Worth reinforcing with fresh rounds.`,
    },
    daily60: {
      dialogAria: 'Rumie EarHero 60-Second Daily Challenge',
      title: 'Daily 60s',
      badge: 'DAILY BLITZ',
      readyHeading: 'How many can you nail in 60 seconds?',
      readyDesc: 'Answer rapid-fire ear challenges across melodic contour, intervals, triads, and scales.',
      categoriesHint: 'Contour · Intervals · Triads · Scales',
      rewardHint: '+100 base energy + bonus per correct hit',
      bestRecordLabel: 'All-time personal best',
      hitsUnit: 'hits',
      startBtn: 'START 60s BLITZ!',
      timeLeft: 'Time',
      scoreLabel: 'Score',
      hitsLabel: 'Hits',
      comboLabel: (n) => `Combo x${n}`,
      listenBtn: 'Replay',
      playingBtn: 'Playing',
      finishTitle: 'Time is up!',
      newRecordBadge: 'NEW PERSONAL RECORD!',
      energyEarnedLabel: 'Energy earned',
      accuracyLabel: 'Accuracy',
      maxComboLabel: 'Max combo',
      recordEverLabel: 'All-time record',
      todayMarkLabel: "Today's mark",
      retryUnlimitedBtn: 'Play Again (PRO)',
      freeCompletedHeading: "Today's Daily 60s Completed!",
      freeCompletedDesc: "You logged today's official run and kept your daily streak alive.",
      freeLimitNotice: 'FREE plan: 1 official run per day. Unlock Premium for unlimited retries to beat your record.',
      unlockUnlimitedBtn: 'Unlock Premium',
      shareResultBtn: 'Share / Download Achievement',
      backToMapBtn: 'Back to Map',
      cardCategory: 'DAILY 60-SECOND CHALLENGE',
      cardTitle: (hits) => `${hits} hits in 60s`,
      cardSubtitle: (score, combo) => `Score ${score} pts · Max combo x${combo}`,
      cardMetricHitsLabel: '60s HITS',
      cardMetricHitsValue: (hits) => `${hits}`,
      closeAria: 'Close Daily 60s Challenge',
    },
    shareCard: {
      shareOrDownloadBtn: 'Share / Download',
      shareProgressBtn: 'Share My Progress',
      shareShortBtn: 'Share',
      modalAria: 'Rumie EarHero shareable achievement card',
      modalTitle: 'Achievement Card',
      modalSubtitle: 'Crisp 1080×1080 PNG ready to save or share anywhere',
      closeAria: 'Close share card modal',
      downloadPngBtn: 'Download PNG',
      shareBtn: 'Share',
      downloadedToShareMsg: 'Image downloaded and ready to share!',
      downloadedMsg: 'PNG saved as Rumie-EarHero-Logro.png!',
      sharedSuccessMsg: 'Achievement shared successfully!',
      starsMetric: 'STARS',
      streakMetric: 'STREAK',
      energyMetric: 'ENERGY',
      accuracyMetric: 'ACCURACY',
      progressCategory: 'MUSICAL PROGRESS',
      progressTitle: (levels) => `${levels}/40 Stages Cleared`,
      progressSubtitle: (medals) => `${medals} of 16 medals unlocked in Rumie EarHero`,
      medalCategory: 'MEDAL UNLOCKED',
      worldMedalCategory: (worldId) => `MEDAL · WORLD ${worldId}`,
      bossCategory: (worldId) => `BOSS CLEARED · WORLD ${worldId}`,
      bossTitle: (worldName) => `Master of ${worldName}`,
      bossSubtitle: (accuracy, stars) => `${accuracy}% accuracy · ${stars}/3 stars earned`,
      diagnosticCategory: 'AUDITORY DIAGNOSTIC',
      diagnosticTitle: (score) => `${score}% on Auditory Diagnostic`,
      diagnosticSubtitle: (worldId) => `Recommended path: World ${worldId} of 8`,
      shareText: (title) => `Check out my Rumie EarHero achievement: ${title}!`,
      shareSocialHeading: 'Share on social media',
      instagramReadyMsg: 'PNG downloaded & text copied for Instagram',
      linkCopiedMsg: 'Link and achievement text copied to clipboard',
    },
  },

  pt: {
    brand: {
      name: 'Rumie EarHero',
      slogan: 'Treine seu ouvido jogando',
      defaultStudent: 'Estudante',
    },
    hud: {
      navAria: 'Navegação principal',
      mobileNavAria: 'Navegação móvel',
      map: 'Mapa',
      lab: 'Laboratório',
      labShort: 'Lab',
      rewards: 'Conquistas',
      diagnostic: 'Diagnóstico',
      diagnosticShort: 'Diag.',
      diagnosticTitle: 'Diagnóstico Auditivo',
      adaptive: 'Reforço',
      adaptiveTitle: 'Reforço Adaptativo',
      daily60: 'Diário 60s',
      daily60Short: '60s',
      daily60Title: 'Desafio Diário de 60 segundos',
      daily60DoneTitle: 'Desafio Diário de 60s concluído hoje',
      xpTitle: 'Experiência acumulada',
      streakTitle: 'Sequência diária de prática',
      starsTitle: 'Estrelas conquistadas',
      levelsProgressTitle: 'Progresso de níveis',
      licenseBtn: 'Licença',
      premiumBtn: 'Premium',
      editProfileAria: 'Editar perfil do jogador',
      languageAria: 'Alterar idioma',
      playerNameLabel: 'Nome do jogador (Diploma)',
      playerNameHint: 'Aparecerá no seu diploma oficial',
      avatarColorLabel: 'Cor do avatar',
      cancel: 'Cancelar',
      save: 'Salvar',
    },
    map: {
      viewAllWorlds: 'Ver os 8 Mundos',
      backToStages: 'Voltar às Etapas',
      worldOfEight: (id) => `Mundo ${id} de 8`,
      yourLocation: 'Sua localização atual',
      premiumBadge: 'Premium',
      bossTag: 'CHEFE',
      bossWorldTag: (id) => `CHEFE · MUNDO ${id}`,
      worldLevelTag: (w, l) => `MUNDO ${w} · NÍVEL ${l}`,
      completedBadge: 'CONCLUÍDO',
      challengesLabel: 'Desafios',
      timeLabel: 'Tempo',
      rewardLabel: 'Prêmio',
      bestScore: 'Melhor marca',
      accuracySuffix: (pct) => `${pct}% precisão`,
      passRequired: 'Aprovação mínima',
      passThreshold: '≥ 80% acertos',
      worldMedal: (id) => `Medalha do Mundo ${id}`,
      recommendedDrill: 'Reforço recomendado',
      unlockPremium: 'DESBLOQUEAR PREMIUM',
      passPrevious: 'SUPERE O NÍVEL ANTERIOR (≥ 80%)',
      replayMission: 'REJOGAR MISSÃO',
      playMission: 'JOGAR MISSÃO',
      starsAria: (s) => `${s} de 3 estrelas`,
      bossAria: (t) => `Desafio Chefe: ${t}`,
      levelAria: (n, t) => `Nível ${n}: ${t}`,
      finalGoalDiplomaLabel: 'META FINAL · DIPLOMA OFICIAL',
      diplomaCardTitle: 'Diploma Mestre EarHero',
      labPracticeLabel: 'PRÁTICA PRÉVIA · LABORATÓRIO',
      labPracticeByWorld: {
        1: 'Treinar Teclado antes de jogar',
        2: 'Treinar Intervalos antes de jogar',
        3: 'Treinar Acordes antes de jogar',
        4: 'Treinar Escalas antes de jogar',
        5: 'Treinar Progressões antes de jogar',
        6: 'Treinar Memória antes de jogar',
        7: 'Treinar Teclado antes de jogar',
        8: 'Treinar Teclado antes de jogar',
      },
    },
    atlas: {
      ariaLabel: 'Atlas dos 8 Mundos Musicais',
      title: 'Mapa da Aventura Musical',
      subtitle: (worldId, _completed) => ({
        prefix: 'Você está no ',
        worldHighlight: `Mundo ${worldId} de 8`,
        mid: ' · Já concluiu ',
        suffix: ' de 40 níveis',
      }),
      remainingHint: (rem) => `Faltam ${rem} níveis para o Diploma Mestre`,
      completedHint: 'Expedição concluída! Diploma Mestre conquistado',
      progressBarAria: 'Progresso nos 8 mundos',
      finalGoalTitle: 'Meta final: Diploma Mestre do Ouvido',
      statusCompleted: 'Concluído',
      statusActive: 'Em progresso',
      statusLockedProgress: 'A descobrir',
      statusLockedPremium: 'Exclusivo Premium',
      fiveStagesHeading: 'As 5 etapas do mundo',
      bossPrefix: 'Chefe',
      exclusiveMedal: 'Medalha exclusiva',
      earnedTag: 'GANHA',
      enterWorld: (id) => `ENTRAR NO MUNDO ${id}`,
      unlockAllWorlds: 'DESBLOQUEAR OS 8 MUNDOS',
      completePrevWorld: (prev) => `Conclua o Mundo ${prev} para abrir esta rota`,
    },
    lab: {
      modules: {
        keyboardPiano: 'Teclado',
        keyboardGuitar: 'Braço',
        intervals: 'Intervalos',
        chords: 'Acordes',
        scales: 'Escalas',
        progressions: 'Progressões',
        melody: 'Memória',
      },
      piano: 'Piano',
      guitar: 'Violão',
      root: 'Tônica',
      octaveShort: 'Oit',
      idleGuitar: 'Console pronto: dispare qualquer pad musical ou toque no braço do instrumento abaixo.',
      idlePiano: 'Console pronto: dispare qualquer pad musical ou toque no sintetizador abaixo.',
      premiumTitle: 'Módulo incluído no Rumie Premium',
      premiumDesc:
        'O plano gratuito inclui o instrumento livre e os intervalos. Desbloqueie acordes, escalas, progressões e memória melódica com o Premium.',
      viewPremiumLicense: 'VER LICENÇA PREMIUM',
      freeGuitarTitle: 'Braço Livre Rumie',
      freePianoTitle: 'Sintetizador Livre Rumie',
      freeGuitarDesc:
        'Toque qualquer corda solta ou casa (0 a 15) no braço abaixo para explorar a afinação padrão (Mi2–Sol5) e digitações em tempo real.',
      freePianoDesc:
        'Toque livremente no teclado abaixo, mude de oitava ou alterne entre piano acústico e guitarra dedilhada em tempo real.',
      intervalPadsTitle: (root) => `Pads de Intervalos a partir de ${root}`,
      melodic: 'Melódico',
      harmonic: 'Harmônico',
      semitoneShort: 'st',
      chordPadsTitle: (root) => `Pads de Acordes sobre ${root}`,
      rootPosShort: 'Fund.',
      firstInvShort: '1ª inv',
      secondInvShort: '2ª inv',
      scalesTitle: (root) => `Escalas musicais em ${root}`,
      scaleOf: (name, root) => `${name} de ${root}`,
      progressionInMajor: (name, root) => `${name} em ${root} Maior`,
      melodyTitle: 'Desafio Livre de Memória Melódica',
      melodyDescGuitar: (start) =>
        `Gere uma melodia aleatória de 4 notas em ${start} Maior e reproduza-a no braço abaixo sem dicas visuais.`,
      melodyDescPiano: (start) =>
        `Gere uma melodia aleatória de 4 notas em ${start} Maior e reproduza-a no piano abaixo sem dicas visuais.`,
      melodyPromptGuitar: (start) =>
        `Ouça a melodia de 4 notas (começa em ${start}) e reproduza-a no braço do instrumento.`,
      melodyPromptPiano: (start) =>
        `Ouça a melodia de 4 notas (começa em ${start}) e reproduza-a no piano.`,
      melodyExactConsole: (notes) => `Exato! Melodia: ${notes}.`,
      melodyWrongConsole: (notes) => `A melodia era ${notes}.`,
      melodySuccessMsg: 'Excelente ouvido! Melodia exata.',
      melodyHintGuitar: 'Observe as casas iluminadas no braço e tente novamente.',
      melodyHintPiano: 'Observe as teclas iluminadas em ciano e tente novamente.',
      newMelody: 'NOVA MELODIA',
      replay: 'Repetir',
      playedNote: (name, midi) => `Nota tocada: ${name} · MIDI ${midi}`,
      pianoAria: 'Teclado virtual interativo',
      pianoNoteAria: (n) => `Nota ${n}`,
      referenceNoteTitle: 'Nota de referência',
      guitarAria: 'Braço interativo de 6 cordas e 15 casas',
      guitarCellAria: (s, lbl, fret, n) => `Corda ${s} (${lbl}), casa ${fret}: ${n}`,
      guitarAnchorTitle: (n) => `Tônica âncora: ${n} (clique em outra corda para mudar posição)`,
      guitarOpenLabel: 'SOLTA',
    },
    arena: {
      exitAria: 'Voltar ao mapa',
      adaptiveTag: 'Reforço',
      worldLevelHeader: (w, l) => `Mundo ${w} · Nível ${l}`,
      challengeCounterAria: (c, t) => `Desafio ${c} de ${t}`,
      challengeLabel: (c, t) => `Desafio ${c} de ${t}`,
      listeningTag: 'Ouvindo',
      niceTryTag: 'Boa tentativa!',
      listenAria: 'Ouvir exemplo musical',
      playingBtn: 'TOCANDO',
      repeatBtn: 'REPETIR',
      listenBtn: 'OUVIR',
      onlyA: 'Só A',
      onlyB: 'Só B',
      positionNum: (p) => `Posição #${p}`,
      tapToPlay: 'Tocar',
      reset: 'Reiniciar',
      checkOrder: 'VERIFICAR ORDEM',
      notesLabel: 'NOTAS:',
      clear: 'Limpar',
      check: 'VERIFICAR',
      beatLabel: (n) => `PULSO ${n}`,
      startRecording: 'INICIAR GRAVAÇÃO (CONTAGEM 1-2-3-4)',
      getReady: 'PREPARE-SE... (1 · 2 · 3 · 4)',
      hitPad: 'TOQUE O PAD! (OU BARRA DE ESPAÇO)',
      hitsCounter: (c, e) => `Toques: ${c} / ${e}`,
      correctHeading: 'CORRETO!',
      reviewHeading: 'REVISAR',
      comboLabel: (c) => `· COMBO x${c}`,
      listenAgain: 'Ouvir',
      nextChallenge: 'PRÓXIMO DESAFIO',
      viewResult: 'VER RESULTADO',
      summaryAdaptiveTitle: 'Reforço concluído!',
      summaryPassedTitle: 'MISSÃO SUPERADA!',
      summaryRetryTitle: 'CONTINUE AFINANDO O OUVIDO',
      summaryAdaptiveDesc: 'Suas estatísticas adaptativas foram atualizadas na hora.',
      summaryPassedDesc: (title, acc) => `"${title}" concluído com ${acc}% de precisão.`,
      summaryRetryDesc: (acc) =>
        `Você alcançou ${acc}%. Precisa de ≥ 80% para avançar. Pode repetir sem limites.`,
      hitsTile: 'Acertos',
      accuracyTile: 'Precisão',
      maxComboTile: 'Combo máx',
      newMedalUnlocked: 'Nova medalha desbloqueada!',
      diplomaUnlockedBanner: 'Diploma Rumie EarHero desbloqueado na vitrine de Conquistas!',
      nextLevelBtn: 'PRÓXIMO NÍVEL',
      retryBtn: 'REPETIR',
      backToMapBtn: 'Voltar ao Mapa',
    },
    diagnostic: {
      dialogAria: 'Diagnóstico Auditivo Rumie EarHero',
      title: 'Diagnóstico Auditivo',
      closeAria: 'Fechar diagnóstico',
      scannerResultTag: 'Resultado do scanner auditivo',
      suggestedRoutePrefix: 'Rota sugerida: comece ou foque no ',
      suggestedWorld: (id) => `Mundo ${id}`,
      strengths: 'Pontos fortes',
      readyToStart: 'Base pronta para começar',
      focusAreas: 'Áreas a reforçar',
      outstandingMastery: 'Domínio excelente!',
      backToAdventureMap: 'VOLTAR AO MAPA DA AVENTURA',
      testCounter: (c, t) => `PROVA ${c} DE ${t}`,
      playing: 'TOCANDO',
      listen: 'OUVIR',
    },
    rewards: {
      vaultTitle: 'Vitrine de Conquistas',
      medalsTab: 'Medalhas',
      statsDiplomaTab: 'Stats / Diploma',
      diplomaBtn: 'Diploma',
      medalsGridAria: 'Vitrine de 16 medalhas',
      earnedBadge: 'CONQUISTADA',
      skillMasteryTitle: 'Domínio por Habilidade',
      levelsCount: (done) => `${done}/40 níveis`,
      trainAdaptiveBtn: 'TREINAR REFORÇO ADAPTATIVO',
      officialCertLabel: 'Certificado Oficial',
      masterEarDiploma: 'Diploma Mestre do Ouvido',
      diplomaReady: 'Desbloqueado e pronto!',
      diplomaLockedHint: 'Supere Mundo 8 · Nível 5',
      previewDiplomaAria: 'Pré-visualizar Diploma',
      viewBtn: 'Ver',
      downloadDiplomaAria: 'Baixar Diploma',
      diplomaModalAria: 'Pré-visualização do Diploma Rumie EarHero',
      closePreviewAria: 'Fechar pré-visualização',
      diplomaHeading: 'DIPLOMA DE CONCLUSÃO',
      diplomaSubtitle: 'Rumie EarHero — Treine seu ouvido jogando',
      certifiesThat: 'Certificamos que',
      completedJourneyLine: 'completou os 8 Mundos Musicais e superou o Grande Desafio Final.',
      diplomaStatsLine: (xp, stars, acc) =>
        `XP acumulado: ${xp} · Estrelas: ${stars}/120 · Precisão global: ${acc}%`,
      accuracyWord: 'Precisão',
      pendingWorld8: 'Pendente concluir o Mundo 8',
      awardedOn: (d) => `Concedido em ${d}`,
      rumieTagline: 'Aprenda, Compreenda e Crie Música.',
      downloadDiplomaBtn: 'BAIXAR DIPLOMA (.SVG)',
      completeWorld8ToDownload: 'Complete o Mundo 8 (Grande Desafio Final) para liberar o download',
      dateLocale: 'pt-BR',
    },
    license: {
      dialogAria: 'Licenças Rumie EarHero',
      title: 'Licenças Rumie EarHero',
      subtitle:
        'As licenças são validadas no servidor Laravel da Rumie sem gateways externos dentro do app.',
      closeAria: 'Fechar janela de licenças',
      freeTitle: 'Gratuita',
      activeBadge: 'Ativa',
      freeSubtitle: 'Ideal para iniciar seu treinamento',
      freeFeatures: [
        'Mundo 1 completo (5 níveis)',
        'Desafio Diário de 60 segundos',
        'Primeiras medalhas e XP',
        'Laboratório limitado (Teclado e Intervalos)',
      ],
      currentPlanBtn: 'PLANO ATUAL',
      tryFreeBtn: 'TESTAR MODO GRATUITO',
      premiumTitle: 'Premium',
      premiumActiveBadge: 'ATIVA',
      premiumSubtitle: 'Licença perpétua · Rumie EarHero',
      premiumFeatures: [
        'Todos os 8 mundos musicais (40 níveis)',
        'Laboratório Auditivo completo',
        'Estatísticas detalhadas e cartões de conquista',
        'Grande Desafio Final e Diploma oficial',
      ],
      premiumActiveBtn: 'LICENÇA PREMIUM ATIVA',
      activatePremiumBtn: 'ATIVAR PREMIUM (PROTÓTIPO)',
      laravelAdapterReady:
        'Adaptador Laravel pronto (`GET /api/rumie/ear-training/license` e `POST /api/rumie/ear-training/progress`).',
      verifyLicenseBtn: 'Verificar licença',
      verifiedByServer: (plan, synced) =>
        `Licença verificada pelo servidor Laravel (${plan}). ${synced ? 'Progresso sincronizado.' : ''}`,
      localCheckFallback: 'Verificação local concluída.',
      resetProgressBtn: 'Redefinir progresso local',
      resetConfirmPrompt: 'Tem certeza? XP e medalhas locais serão apagados.',
      resetConfirmBtn: 'Confirmar redefinição',
      cancel: 'Cancelar',
    },
    adaptive: {
      levelTitle: 'Reforço Adaptativo',
      levelShort: 'Reforço',
      levelDesc: 'Prática direcionada com contrastes para suas áreas de melhoria.',
      reasonWithContrast: (acc, label, contrast) =>
        `Precisão ${acc}%. Recomendado praticar ${label} em contraste com ${contrast}.`,
      reasonBasic: (acc, att) =>
        `Precisão ${acc}% em ${att} tentativas. Vale reforçar com novas rodadas.`,
    },
    daily60: {
      dialogAria: 'Desafio Diário de 60 segundos Rumie EarHero',
      title: 'Diário 60s',
      badge: 'CONTRA O RELÓGIO',
      readyHeading: 'Quantos acertos você faz em 60 segundos?',
      readyDesc: 'Responda rápido a desafios auditivos de direção melódica, intervalos, tríades e escalas.',
      categoriesHint: 'Direção · Intervalos · Tríades · Escalas',
      rewardHint: '+100 energia base + bônus por cada acerto',
      bestRecordLabel: 'Melhor recorde histórico',
      hitsUnit: 'acertos',
      startBtn: 'COMEÇAR 60s!',
      timeLeft: 'Tempo',
      scoreLabel: 'Pontos',
      hitsLabel: 'Acertos',
      comboLabel: (n) => `Combo x${n}`,
      listenBtn: 'Repetir',
      playingBtn: 'Tocando',
      finishTitle: 'Tempo esgotado!',
      newRecordBadge: 'NOVO RECORDE PESSOAL!',
      energyEarnedLabel: 'Energia ganha',
      accuracyLabel: 'Precisão',
      maxComboLabel: 'Combo máx.',
      recordEverLabel: 'Recorde histórico',
      todayMarkLabel: 'Sua marca de hoje',
      retryUnlimitedBtn: 'Jogar novamente (PRO)',
      freeCompletedHeading: 'Desafio Diário de hoje concluído!',
      freeCompletedDesc: 'Você registrou sua partida oficial de hoje e manteve sua sequência ativa.',
      freeLimitNotice: 'Plano FREE: 1 partida oficial por dia. Com Premium você tenta quantas vezes quiser para bater seu recorde.',
      unlockUnlimitedBtn: 'Desbloquear Premium',
      shareResultBtn: 'Compartilhar / Baixar Conquista',
      backToMapBtn: 'Voltar ao Mapa',
      cardCategory: 'DESAFIO DIÁRIO 60 SEGUNDOS',
      cardTitle: (hits) => `${hits} acertos em 60s`,
      cardSubtitle: (score, combo) => `Pontuação ${score} pts · Combo máximo x${combo}`,
      cardMetricHitsLabel: 'ACERTOS 60s',
      cardMetricHitsValue: (hits) => `${hits}`,
      closeAria: 'Fechar Desafio Diário 60s',
    },
    shareCard: {
      shareOrDownloadBtn: 'Compartilhar / Baixar',
      shareProgressBtn: 'Compartilhar Progresso',
      shareShortBtn: 'Compartilhar',
      modalAria: 'Cartão compartilhável de conquista Rumie EarHero',
      modalTitle: 'Cartão de Conquista',
      modalSubtitle: 'PNG 1080×1080 pronto para salvar ou compartilhar',
      closeAria: 'Fechar cartão compartilhável',
      downloadPngBtn: 'Baixar PNG',
      shareBtn: 'Compartilhar',
      downloadedToShareMsg: 'Imagem baixada pronta para compartilhar!',
      downloadedMsg: 'PNG salvo como Rumie-EarHero-Logro.png!',
      sharedSuccessMsg: 'Conquista compartilhada com sucesso!',
      starsMetric: 'ESTRELAS',
      streakMetric: 'SEQUÊNCIA',
      energyMetric: 'ENERGIA',
      accuracyMetric: 'PRECISÃO',
      progressCategory: 'PROGRESSO MUSICAL',
      progressTitle: (levels) => `${levels}/40 Etapas Concluídas`,
      progressSubtitle: (medals) => `${medals} de 16 medalhas desbloqueadas no Rumie EarHero`,
      medalCategory: 'MEDALHA DESBLOQUEADA',
      worldMedalCategory: (worldId) => `MEDALHA · MUNDO ${worldId}`,
      bossCategory: (worldId) => `CHEFE SUPERADO · MUNDO ${worldId}`,
      bossTitle: (worldName) => `Mestre de ${worldName}`,
      bossSubtitle: (accuracy, stars) => `${accuracy}% de precisão · ${stars}/3 estrelas obtidas`,
      diagnosticCategory: 'DIAGNÓSTICO AUDITIVO',
      diagnosticTitle: (score) => `${score}% no Diagnóstico Auditivo`,
      diagnosticSubtitle: (worldId) => `Rota recomendada: Mundo ${worldId} de 8`,
      shareText: (title) => `Confira minha conquista no Rumie EarHero: ${title}!`,
      shareSocialHeading: 'Compartilhar nas redes sociais',
      instagramReadyMsg: 'PNG baixado e texto copiado para postar no Instagram',
      linkCopiedMsg: 'Link e texto copiados para a área de transferência',
    },
  },
};
