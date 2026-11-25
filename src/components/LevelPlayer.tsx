import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Drum,
  Flame,
  Play,
  RotateCcw,
  Share2,
  Star,
  Volume2,
  XCircle,
  Zap,
} from 'lucide-react';
import { AudioEngine } from '../engines/AudioEngine';
import { WorldEngine } from '../engines/WorldEngine';
import {
  getLocalizedLevel,
  getLocalizedMedal,
  getLocalizedWorld,
} from '../i18n/contentTranslations';
import { useI18n } from '../i18n/I18nContext';
import { formatMidiNote } from '../i18n/musicLocalization';
import {
  Exercise,
  InstrumentType,
  LevelCompletionSummary,
  LevelDefinition,
  ShareCardPayload,
} from '../types/music';
import { MusicianCharacter, MusicianState } from './MusicianCharacter';
import { RhythmNotation } from './RhythmNotation';
import { VirtualPiano } from './VirtualPiano';

interface LevelPlayerProps {
  level: LevelDefinition;
  exercises: Exercise[];
  instrument: InstrumentType;
  mode?: 'level' | 'adaptive';
  onRecordAnswer: (exercise: Exercise, isCorrect: boolean) => void;
  onCompleteLevel: (correctCount: number, totalCount: number) => LevelCompletionSummary | null;
  onRetryLevel: () => void;
  onStartNextLevel?: (nextLevelId: string) => void;
  nextLevelId?: string | null;
  onShareAchievement?: (payload: ShareCardPayload) => void;
  onExit: () => void;
}

type AnswerPhase = 'answering' | 'feedback' | 'summary';

const EQ_HEIGHTS = [24, 42, 64, 88, 52, 96, 68, 36];

function RhythmStepsBar({ steps }: { steps: number[] }) {
  const stepSet = new Set(steps);
  return (
    <div className="grid grid-cols-16 gap-0.5 mt-1.5" aria-hidden="true">
      {Array.from({ length: 16 }).map((_, idx) => {
        const isHit = stepSet.has(idx);
        const isBeatStart = idx % 4 === 0;
        return (
          <div
            key={idx}
            className={`h-2 rounded-[2px] ${
              isHit
                ? 'bg-[#FF5A00] shadow-[0_0_6px_rgba(255,90,0,0.7)]'
                : isBeatStart
                  ? 'bg-white/20'
                  : 'bg-white/6'
            }`}
          />
        );
      })}
    </div>
  );
}

function AudioEqualizer({ active, mirror = false }: { active: boolean; mirror?: boolean }) {
  const bars = mirror ? [...EQ_HEIGHTS].reverse() : EQ_HEIGHTS;
  return (
    <div className="hidden sm:flex items-center gap-1.5 h-14" aria-hidden="true">
      {bars.map((maxH, idx) => (
        <span
          key={idx}
          style={{
            height: `${Math.round((maxH / 100) * 48)}px`,
            animationDelay: `${idx * 65}ms`,
          }}
          className={`w-1.5 rounded-full transition-opacity duration-200 ${
            active
              ? 'eq-bar-active bg-gradient-to-t from-[#FF5A00] via-[#FFB800] to-[#00E5FF] opacity-100 shadow-[0_0_8px_rgba(0,229,255,0.4)]'
              : 'bg-[#282C40] opacity-55 scale-y-25'
          }`}
        />
      ))}
    </div>
  );
}

export const LevelPlayer: React.FC<LevelPlayerProps> = ({
  level,
  exercises,
  instrument,
  mode = 'level',
  onRecordAnswer,
  onCompleteLevel,
  onRetryLevel,
  onStartNextLevel,
  nextLevelId,
  onShareAchievement,
  onExit,
}) => {
  const { lang, t } = useI18n();
  const localizedLevelTitle =
    mode === 'adaptive' ? t.adaptive.levelTitle : getLocalizedLevel(level, lang).title;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<AnswerPhase>('answering');
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasListened, setHasListened] = useState(false);

  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [playedPianoMidi, setPlayedPianoMidi] = useState<number[]>([]);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean>(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [resultsHistory, setResultsHistory] = useState<('correct' | 'wrong')[]>([]);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [liveXp, setLiveXp] = useState(0);
  const [summary, setSummary] = useState<LevelCompletionSummary | null>(null);

  // Rhythm tap interactive state
  const [rhythmState, setRhythmState] = useState<'idle' | 'count-in' | 'recording' | 'done'>('idle');
  const [activeBeatIndicator, setActiveBeatIndicator] = useState<number>(-1);
  const [recordedTaps, setRecordedTaps] = useState<number[]>([]);
  const recordStartPerfRef = useRef<number>(0);
  const recordedTapsRef = useRef<number[]>([]);
  const rhythmTimersRef = useRef<number[]>([]);

  const exercise = exercises[currentIndex];

  const clearRhythmTimers = useCallback(() => {
    rhythmTimersRef.current.forEach((id) => window.clearTimeout(id));
    rhythmTimersRef.current = [];
  }, []);

  useEffect(() => {
    const unsub = AudioEngine.subscribePlayback(setIsPlaying);
    return () => {
      unsub();
      clearRhythmTimers();
      AudioEngine.stopAll();
    };
  }, [clearRhythmTimers]);

  useEffect(() => {
    setSelectedOptionId(null);
    setOrderedIds([]);
    setPlayedPianoMidi([]);
    setHasListened(false);
    setRhythmState('idle');
    setActiveBeatIndicator(-1);
    setRecordedTaps([]);
    recordedTapsRef.current = [];
    clearRhythmTimers();
    AudioEngine.stopAll();
  }, [currentIndex, exercises, clearRhythmTimers]);

  const handlePlayMain = useCallback(async () => {
    if (!exercise) return;
    setHasListened(true);
    await AudioEngine.playSequence(exercise.audio, {
      instrument,
      onEventStart: (idx, _notes, isCountIn) => {
        if (isCountIn) {
          setActiveBeatIndicator(idx);
        } else if (exercise.interactionType === 'rhythm-tap') {
          setActiveBeatIndicator(-1);
        }
      },
      onComplete: () => {
        setActiveBeatIndicator(-1);
      },
    });
  }, [exercise, instrument]);

  const handlePlayPartA = async () => {
    if (!exercise) return;
    setHasListened(true);
    const partAEvents = exercise.audio.events.filter((e) => e.startBeat < 2.0);
    await AudioEngine.playSequence(
      {
        tempoBpm: exercise.audio.tempoBpm,
        events: partAEvents,
        totalBeats: 2.0,
        instrument,
      },
      { instrument }
    );
  };

  const handlePlayPartB = async () => {
    if (!exercise) return;
    setHasListened(true);
    await AudioEngine.playSequence(exercise.audio, {
      instrument,
      playSecondary: true,
    });
  };

  const handlePlayContrast = async () => {
    if (!exercise?.contrastAudio) return;
    await AudioEngine.playSequence(exercise.contrastAudio.sequence, { instrument });
  };

  const finalizeQuestionAnswer = useCallback(
    (isCorrect: boolean) => {
      if (phase !== 'answering' || !exercise) return;
      AudioEngine.stopAll();
      clearRhythmTimers();
      setLastAnswerCorrect(isCorrect);
      setResultsHistory((prev) => [...prev, isCorrect ? 'correct' : 'wrong']);

      if (isCorrect) {
        setCorrectCount((c) => c + 1);
        setCombo((prev) => {
          const next = prev + 1;
          setMaxCombo((m) => Math.max(m, next));
          setLiveXp((xp) => xp + 10 + (next >= 2 ? next * 2 : 0));
          return next;
        });
        void AudioEngine.playFeedback('correct');
      } else {
        setCombo(0);
        void AudioEngine.playFeedback('wrong');
      }

      onRecordAnswer(exercise, isCorrect);
      setPhase('feedback');
    },
    [phase, exercise, onRecordAnswer, clearRhythmTimers]
  );

  const handleSelectOption = (optionId: string) => {
    if (phase !== 'answering' || !exercise) return;
    setSelectedOptionId(optionId);
    finalizeQuestionAnswer(optionId === exercise.correctOptionId);
  };

  const handleToggleOrderChip = (chipId: string, midi: number) => {
    if (phase !== 'answering') return;
    void AudioEngine.playSingleNote(midi, 0.55, instrument);
    setOrderedIds((prev) =>
      prev.includes(chipId) ? prev.filter((id) => id !== chipId) : [...prev, chipId]
    );
  };

  const handleSubmitOrder = () => {
    if (!exercise?.correctOrderIds) return;
    const isCorrect =
      orderedIds.length === exercise.correctOrderIds.length &&
      orderedIds.every((id, idx) => id === exercise.correctOrderIds![idx]);
    finalizeQuestionAnswer(isCorrect);
  };

  const handlePianoNoteInput = (midi: number) => {
    if (phase !== 'answering' || !exercise?.pianoConfig) return;
    const expectedLen = exercise.pianoConfig.expectedMidi.length;
    setPlayedPianoMidi((prev) => {
      if (prev.length >= expectedLen) return prev;
      return [...prev, midi];
    });
  };

  const handleSubmitPiano = () => {
    if (!exercise?.pianoConfig) return;
    const expected = exercise.pianoConfig.expectedMidi;
    const isCorrect =
      playedPianoMidi.length === expected.length &&
      playedPianoMidi.every((m, idx) => m === expected[idx]);
    finalizeQuestionAnswer(isCorrect);
  };

  const evaluateRhythmTaps = useCallback(
    (tapsInBeats: number[]) => {
      if (!exercise?.rhythmTapConfig) return;
      const { expectedOnsets, toleranceBeats } = exercise.rhythmTapConfig;
      const unmatched = [...tapsInBeats];
      let matchedCount = 0;

      for (const expected of expectedOnsets) {
        let bestIdx = -1;
        let bestDiff = Infinity;
        unmatched.forEach((tap, idx) => {
          const diff = Math.abs(tap - expected);
          if (diff < bestDiff) {
            bestDiff = diff;
            bestIdx = idx;
          }
        });
        if (bestIdx >= 0 && bestDiff <= toleranceBeats) {
          matchedCount += 1;
          unmatched.splice(bestIdx, 1);
        }
      }

      const extraPenalty = unmatched.length > 1;
      const hitRatio = matchedCount / Math.max(1, expectedOnsets.length);
      setRhythmState('done');
      finalizeQuestionAnswer(hitRatio >= 0.75 && !extraPenalty);
    },
    [exercise, finalizeQuestionAnswer]
  );

  const handleStartRhythmRecording = async () => {
    if (!exercise?.rhythmTapConfig || phase !== 'answering') return;
    AudioEngine.stopAll();
    clearRhythmTimers();
    await AudioEngine.ensureReady();

    const tempoBpm = exercise.audio.tempoBpm;
    const beatMs = (60 / tempoBpm) * 1000;
    const beatsCount = exercise.rhythmTapConfig.beatsCount;

    setRecordedTaps([]);
    recordedTapsRef.current = [];
    setRhythmState('count-in');
    setHasListened(true);

    for (let b = 0; b < 4; b++) {
      const id = window.setTimeout(() => {
        setActiveBeatIndicator(b);
        void AudioEngine.playMetronomeClick(b === 0);
      }, b * beatMs);
      rhythmTimersRef.current.push(id);
    }

    const startRecId = window.setTimeout(() => {
      setRhythmState('recording');
      recordStartPerfRef.current = performance.now();

      for (let b = 0; b < beatsCount; b++) {
        const beatClickId = window.setTimeout(() => {
          setActiveBeatIndicator(b);
          void AudioEngine.playMetronomeClick(b === 0);
        }, b * beatMs);
        rhythmTimersRef.current.push(beatClickId);
      }

      const endId = window.setTimeout(() => {
        setActiveBeatIndicator(-1);
        evaluateRhythmTaps(recordedTapsRef.current);
      }, (beatsCount + 0.45) * beatMs);
      rhythmTimersRef.current.push(endId);
    }, 4 * beatMs);

    rhythmTimersRef.current.push(startRecId);
  };

  const handleRhythmPadTap = useCallback(() => {
    if (rhythmState !== 'recording' || !exercise) return;
    const beatMs = (60 / exercise.audio.tempoBpm) * 1000;
    const elapsedBeats = (performance.now() - recordStartPerfRef.current) / beatMs;
    if (elapsedBeats < -0.25 || elapsedBeats > 4.4) return;
    const clamped = Math.max(0, Math.round(elapsedBeats * 100) / 100);
    void AudioEngine.playDrumHit(recordedTapsRef.current.length === 0);
    recordedTapsRef.current = [...recordedTapsRef.current, clamped];
    setRecordedTaps(recordedTapsRef.current);
  }, [rhythmState, exercise]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && rhythmState === 'recording') {
        e.preventDefault();
        handleRhythmPadTap();
      } else if (e.key.toLowerCase() === 'r' && phase !== 'summary') {
        void handlePlayMain();
      } else if (
        phase === 'answering' &&
        (exercise?.interactionType === 'multiple-choice' ||
          exercise?.interactionType === 'compare-two') &&
        exercise.options
      ) {
        const num = Number(e.key);
        if (num >= 1 && num <= exercise.options.length) {
          handleSelectOption(exercise.options[num - 1].id);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [rhythmState, phase, exercise, handleRhythmPadTap, handlePlayMain]);

  const handleNextStep = () => {
    AudioEngine.stopAll();
    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex((i) => i + 1);
      setPhase('answering');
    } else {
      const result = onCompleteLevel(correctCount, exercises.length);
      if (result) {
        setSummary(result);
        if (result.passed) {
          void AudioEngine.playFeedback('complete');
        }
      }
      setPhase('summary');
    }
  };

  if (!exercise) return null;

  // ---------- 100dvh ARCADE SUMMARY SCREEN ----------
  if (phase === 'summary') {
    const total = exercises.length;
    const accuracy = Math.round((correctCount / Math.max(1, total)) * 100);
    const passed = summary ? summary.passed : accuracy >= 80;
    const starsEarned = summary
      ? summary.starsEarned
      : accuracy === 100
        ? 3
        : accuracy >= 90
          ? 2
          : accuracy >= 80
            ? 1
            : 0;

    return (
      <div className="h-full w-full min-h-0 min-w-0 arcade-grid-bg flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto">
        <div className="w-[92vw] sm:w-full max-w-xl max-h-[90dvh] overflow-y-auto rounded-3xl bg-[#14151D]/95 border border-white/12 p-4 sm:p-7 text-center shadow-[0_24px_60px_rgba(0,0,0,0.65)]">
          {/* Animated Stars Row + Victory Musician */}
          <div className="flex items-center justify-center gap-3 mb-3">
            {passed && (
              <MusicianCharacter
                state="celebrate"
                size={68}
                showNotes={false}
                showGroundGlow={true}
              />
            )}
            {[1, 2, 3].map((s) => {
              const active = s <= starsEarned;
              return (
                <div
                  key={s}
                  className={`w-13 h-13 sm:w-15 sm:h-15 rounded-2xl flex items-center justify-center transition-transform ${
                    active
                      ? 'bg-[#FFB800]/18 border-2 border-[#FFB800] shadow-[0_0_24px_rgba(255,184,0,0.4)] scale-105'
                      : 'bg-[#1C1D29] border border-white/8'
                  }`}
                >
                  <Star
                    className={`w-6 h-6 sm:w-7 sm:h-7 ${
                      active ? 'text-[#FFB800] fill-[#FFB800]' : 'text-[#393D52]'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            {mode === 'adaptive'
              ? t.arena.summaryAdaptiveTitle
              : passed
                ? t.arena.summaryPassedTitle
                : t.arena.summaryRetryTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1">
            {mode === 'adaptive'
              ? t.arena.summaryAdaptiveDesc
              : passed
                ? t.arena.summaryPassedDesc(localizedLevelTitle, accuracy)
                : t.arena.summaryRetryDesc(accuracy)}
          </p>

          {/* 4 Arcade Score Tiles */}
          <div className="grid grid-cols-4 gap-2 mt-5">
            <div className="rounded-xl bg-[#1C1D29] border border-white/8 p-2.5 sm:p-3">
              <span className="text-[10px] font-mono uppercase text-[#9CA3AF] block">
                {t.arena.hitsTile}
              </span>
              <span className="font-mono text-base sm:text-lg font-extrabold text-white tabular-nums">
                {correctCount}/{total}
              </span>
            </div>
            <div className="rounded-xl bg-[#1C1D29] border border-white/8 p-2.5 sm:p-3">
              <span className="text-[10px] font-mono uppercase text-[#9CA3AF] block">
                {t.arena.accuracyTile}
              </span>
              <span className="font-mono text-base sm:text-lg font-extrabold text-[#00E5FF] tabular-nums">
                {accuracy}%
              </span>
            </div>
            <div className="rounded-xl bg-[#1C1D29] border border-white/8 p-2.5 sm:p-3">
              <span className="text-[10px] font-mono uppercase text-[#9CA3AF] block">
                {t.arena.maxComboTile}
              </span>
              <span className="font-mono text-base sm:text-lg font-extrabold text-[#FFB800] tabular-nums">
                x{maxCombo}
              </span>
            </div>
            <div className="rounded-xl bg-[#1C1D29] border border-[#FF5A00]/35 p-2.5 sm:p-3">
              <span className="text-[10px] font-mono uppercase text-[#FF8A4C] block">XP</span>
              <span className="font-mono text-base sm:text-lg font-extrabold text-[#FF5A00] tabular-nums">
                +{summary?.xpGained ?? liveXp}
              </span>
            </div>
          </div>

          {summary && summary.newlyUnlockedMedals.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-[#FFB800]/10 border border-[#FFB800]/35 text-left flex items-center gap-3">
              <Award className="w-6 h-6 text-[#FFB800] shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-mono font-bold text-[#FFB800] uppercase block">
                  {t.arena.newMedalUnlocked}
                </span>
                <span className="text-xs sm:text-sm font-bold text-white truncate block">
                  {summary.newlyUnlockedMedals
                    .map((m) => getLocalizedMedal(m, lang).title)
                    .join(' · ')}
                </span>
              </div>
            </div>
          )}

          {summary?.diplomaJustUnlocked && (
            <div className="mt-3 p-2.5 rounded-xl bg-[#FF5A00]/15 border border-[#FF5A00]/45 text-xs font-semibold text-white">
              {t.arena.diplomaUnlockedBanner}
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            {passed && nextLevelId && onStartNextLevel && mode === 'level' && (
              <button
                type="button"
                onClick={() => onStartNextLevel(nextLevelId)}
                className="w-full sm:w-auto h-11 px-5 rounded-xl arcade-btn-orange text-sm font-display font-extrabold text-white inline-flex items-center justify-center gap-2"
              >
                <span>{t.arena.nextLevelBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {mode === 'level' &&
              passed &&
              onShareAchievement &&
              (level.isBoss || (summary && summary.newlyUnlockedMedals.length > 0)) && (
                <button
                  type="button"
                  onClick={() => {
                    if (level.isBoss) {
                      const world = WorldEngine.getWorldById(level.worldId);
                      const locWorld = world ? getLocalizedWorld(world, lang) : null;
                      onShareAchievement({
                        badgeType: 'boss',
                        categoryTag: t.shareCard.bossCategory(level.worldId),
                        title: t.shareCard.bossTitle(locWorld?.title ?? localizedLevelTitle),
                        subtitle: t.shareCard.bossSubtitle(accuracy, starsEarned),
                        highlightStat: `${accuracy}%`,
                      });
                    } else if (summary && summary.newlyUnlockedMedals.length > 0) {
                      const firstMedal = getLocalizedMedal(summary.newlyUnlockedMedals[0], lang);
                      onShareAchievement({
                        badgeType:
                          summary.newlyUnlockedMedals[0].category === 'world' ? 'world' : 'medal',
                        categoryTag: t.shareCard.medalCategory,
                        title: firstMedal.title,
                        subtitle: firstMedal.description,
                      });
                    }
                  }}
                  className="w-full sm:w-auto h-11 px-4 rounded-xl arcade-btn-dark border border-[#FFB800]/50 hover:border-[#FFB800] text-[#FFB800] hover:text-white text-xs sm:text-sm font-display font-bold inline-flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-4 h-4 shrink-0" />
                  <span>{t.shareCard.shareOrDownloadBtn}</span>
                </button>
              )}

            <button
              type="button"
              onClick={() => {
                setCurrentIndex(0);
                setCorrectCount(0);
                setResultsHistory([]);
                setCombo(0);
                setMaxCombo(0);
                setLiveXp(0);
                setSummary(null);
                setPhase('answering');
                onRetryLevel();
              }}
              className={`w-full sm:w-auto h-11 px-5 rounded-xl text-sm font-display font-extrabold inline-flex items-center justify-center gap-2 ${
                passed && nextLevelId && mode === 'level'
                  ? 'arcade-btn-dark text-white border border-white/10'
                  : 'arcade-btn-orange text-white'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.arena.retryBtn}</span>
            </button>

            <button
              type="button"
              onClick={onExit}
              className="w-full sm:w-auto h-11 px-5 rounded-xl arcade-btn-dark border border-white/10 text-sm font-semibold text-[#C5CAD8] hover:text-white"
            >
              {t.arena.backToMapBtn}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- 100dvh ACTIVE GAME ARENA ----------
  return (
    <div className="relative h-full w-full min-h-0 min-w-0 arcade-grid-bg flex flex-col overflow-hidden select-none">
      {/* TOP MATCH HUD BAR */}
      <header className="h-12 sm:h-14 shrink-0 bg-[#0D0F18]/95 border-b border-white/10 px-2.5 sm:px-5 flex items-center justify-between gap-2 sm:gap-3">
        {/* Exit & Level Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => {
              AudioEngine.stopAll();
              onExit();
            }}
            aria-label={t.arena.exitAria}
            className="w-9 h-9 rounded-xl arcade-btn-dark border border-white/10 flex items-center justify-center text-[#C5CAD8] hover:text-white shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="hidden sm:block min-w-0">
            <span className="block text-[10px] font-mono text-[#00E5FF] uppercase tracking-wider leading-none">
              {mode === 'adaptive'
                ? t.arena.adaptiveTag
                : t.arena.worldLevelHeader(level.worldId, level.levelNumber)}
            </span>
            <span className="block text-xs font-display font-bold text-white truncate max-w-[180px] mt-0.5">
              {localizedLevelTitle}
            </span>
          </div>
        </div>

        {/* Segmented LED Challenge Progress Bar */}
        <div
          className="flex-1 max-w-md flex items-center gap-1.5"
          aria-label={t.arena.challengeCounterAria(currentIndex + 1, exercises.length)}
        >
          {exercises.map((ex, idx) => {
            const hist = resultsHistory[idx];
            const isCurr = idx === currentIndex;
            let barClass = 'bg-[#1F2233] border-white/6';
            if (hist === 'correct') {
              barClass = 'bg-emerald-400 border-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.55)]';
            } else if (hist === 'wrong') {
              barClass = 'bg-rose-500 border-rose-400';
            } else if (isCurr) {
              barClass = 'bg-[#FF5A00] border-[#FFB080] shadow-[0_0_10px_rgba(255,90,0,0.7)]';
            }
            return (
              <div
                key={ex.id}
                className={`h-2.5 flex-1 rounded-full border transition-all duration-200 ${barClass}`}
              />
            );
          })}
          <span className="font-mono text-[11px] font-bold text-[#9CA3AF] tabular-nums ml-1 shrink-0">
            {currentIndex + 1}/{exercises.length}
          </span>
        </div>

        {/* Live Combo & Session XP */}
        <div className="flex items-center gap-2 shrink-0">
          {combo >= 2 && (
            <div
              key={combo}
              className="animate-combo-pop px-2.5 py-1 rounded-full bg-gradient-to-r from-[#FF5A00]/25 to-[#FFB800]/25 border border-[#FFB800]/60 flex items-center gap-1 text-xs font-display font-extrabold text-[#FFB800]"
            >
              <Flame className="w-3.5 h-3.5 text-[#FF5A00] fill-[#FF5A00]" />
              <span>x{combo}</span>
            </div>
          )}
          <div className="px-2.5 py-1 rounded-full bg-[#171926] border border-[#FF5A00]/35 flex items-center gap-1 font-mono text-xs font-bold text-[#FF5A00] tabular-nums">
            <Zap className="w-3.5 h-3.5" />
            <span>+{liveXp}</span>
          </div>
        </div>
      </header>

      {/* MAIN GAME ARENA BODY (fits 100% remaining height) */}
      <div className="flex-1 min-h-0 min-w-0 max-w-4xl w-full mx-auto px-2.5 sm:px-6 py-2 sm:py-3 lg:py-4 flex flex-col justify-between gap-2 sm:gap-3 lg:gap-4 overflow-y-auto lg:overflow-hidden">
        {/* Instruction Banner */}
        <div className="text-center shrink-0">
          <span className="inline-block text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider text-[#00E5FF]">
            {exercise.audio.contextLabel ?? t.arena.challengeLabel(currentIndex + 1, exercises.length)}
          </span>
          <h2 className="font-display text-sm sm:text-lg lg:text-xl font-extrabold text-white mt-0.5 leading-snug">
            {exercise.instruction}
          </h2>
          {exercise.promptSubtitle && (
            <p className="text-[11px] sm:text-xs text-[#9CA3AF] mt-0.5">
              {exercise.promptSubtitle}
            </p>
          )}
        </div>

        {/* CENTRAL AUDIO ORB + COMPACT REACTIVE MUSICIAN + REAL-TIME EQUALIZER */}
        <div className="flex flex-col items-center justify-center shrink-0">
          {(() => {
            const arenaCharState: MusicianState = isPlaying
              ? 'listening'
              : phase === 'feedback'
                ? lastAnswerCorrect
                  ? 'celebrate'
                  : 'encourage'
                : 'idle';

            return (
              <div className="flex items-center justify-center gap-2.5 sm:gap-4 lg:gap-5">
                {/* Compact Musician Protagonist beside the Audio Orb */}
                <div className="relative flex flex-col items-center justify-center">
                  <div className="sm:hidden">
                    <MusicianCharacter
                      state={arenaCharState}
                      facing="right"
                      size={56}
                      showNotes={arenaCharState === 'listening' || arenaCharState === 'idle'}
                    />
                  </div>
                  <div className="hidden sm:block lg:hidden">
                    <MusicianCharacter
                      state={arenaCharState}
                      facing="right"
                      size={74}
                      showNotes={arenaCharState === 'listening' || arenaCharState === 'idle'}
                    />
                  </div>
                  <div className="hidden lg:block">
                    <MusicianCharacter
                      state={arenaCharState}
                      facing="right"
                      size={92}
                      showNotes={arenaCharState === 'listening' || arenaCharState === 'idle'}
                    />
                  </div>
                  {arenaCharState === 'listening' && (
                    <span className="mt-0.5 text-[9px] font-mono font-bold text-[#00E5FF] uppercase tracking-wider">
                      {t.arena.listeningTag}
                    </span>
                  )}
                  {arenaCharState === 'encourage' && (
                    <span className="mt-0.5 text-[9px] font-mono font-bold text-[#FFB800] uppercase tracking-wider">
                      {t.arena.niceTryTag}
                    </span>
                  )}
                </div>

                <AudioEqualizer active={isPlaying} />

                <button
                  type="button"
                  onClick={handlePlayMain}
                  aria-label={t.arena.listenAria}
                  className="relative w-[76px] h-[76px] sm:w-22 sm:h-22 lg:w-26 lg:h-26 rounded-full arcade-btn-orange flex flex-col items-center justify-center gap-1 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]"
                >
                  {isPlaying && (
                    <>
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-2 rounded-full border-2 border-[#00E5FF] animate-audio-ring"
                      />
                      <span
                        aria-hidden="true"
                        style={{ animationDelay: '380ms' }}
                        className="pointer-events-none absolute -inset-2 rounded-full border-2 border-[#FF5A00] animate-audio-ring"
                      />
                    </>
                  )}
                  <Volume2
                    className={`w-6 h-6 sm:w-7 sm:h-7 ${isPlaying ? 'scale-110' : ''} transition-transform`}
                  />
                  <span className="font-display text-[10px] sm:text-[11px] font-extrabold tracking-wider uppercase">
                    {isPlaying
                      ? t.arena.playingBtn
                      : hasListened
                        ? t.arena.repeatBtn
                        : t.arena.listenBtn}
                  </span>
                </button>

                <AudioEqualizer active={isPlaying} mirror />
              </div>
            );
          })()}

          {exercise.interactionType === 'compare-two' && (
            <div className="flex items-center gap-2.5 mt-3">
              <button
                type="button"
                onClick={handlePlayPartA}
                className="h-9 px-3.5 rounded-xl arcade-btn-dark border border-white/12 text-xs font-bold text-white inline-flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-[#00E5FF] fill-[#00E5FF]" />
                <span>{t.arena.onlyA}</span>
              </button>
              <button
                type="button"
                onClick={handlePlayPartB}
                className="h-9 px-3.5 rounded-xl arcade-btn-dark border border-white/12 text-xs font-bold text-white inline-flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 text-[#FF5A00] fill-[#FF5A00]" />
                <span>{t.arena.onlyB}</span>
              </button>
            </div>
          )}
        </div>

        {/* BOTTOM INTERACTIVE GAME DECK */}
        <div className="shrink-0 w-full pb-1">
          {/* 1 & 2: Multiple Choice / Compare Two — 3D Arcade Musical Pads */}
          {(exercise.interactionType === 'multiple-choice' ||
            exercise.interactionType === 'compare-two') &&
            exercise.options && (
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {exercise.options.map((opt, idx) => {
                  const isSelected = selectedOptionId === opt.id;
                  const isCorrectOpt = opt.id === exercise.correctOptionId;

                  let padClass =
                    'arcade-btn-dark border border-white/12 text-white hover:border-[#FF5A00]/60';
                  if (phase === 'feedback') {
                    if (isCorrectOpt) {
                      padClass =
                        'bg-emerald-500/20 border-2 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]';
                    } else if (isSelected && !isCorrectOpt) {
                      padClass = 'bg-rose-500/20 border-2 border-rose-400 text-white';
                    } else {
                      padClass = 'bg-[#14151D]/60 border border-white/5 text-[#5D637A]';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={phase !== 'answering'}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`min-h-[54px] sm:min-h-[68px] lg:min-h-[78px] px-2.5 py-2 sm:px-4 sm:py-3 rounded-2xl text-left min-w-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] ${padClass}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="hidden sm:inline-flex w-5 h-5 rounded-md bg-white/8 text-[10px] font-mono font-bold text-[#9CA3AF] items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          {opt.rhythmTokens ? (
                            <RhythmNotation
                              tokens={opt.rhythmTokens}
                              height={26}
                              ariaLabel={opt.sublabel || opt.label}
                              className="text-current"
                            />
                          ) : (
                            <span className="font-display font-bold text-xs sm:text-base truncate">
                              {opt.label}
                            </span>
                          )}
                        </div>
                        {phase === 'feedback' && isCorrectOpt && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        )}
                        {phase === 'feedback' && isSelected && !isCorrectOpt && (
                          <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                        )}
                      </div>
                      {opt.sublabel && (
                        <span className="block text-[10px] sm:text-xs text-[#9CA3AF] mt-0.5 truncate">
                          {opt.sublabel}
                        </span>
                      )}
                      {opt.rhythmSteps && <RhythmStepsBar steps={opt.rhythmSteps} />}
                    </button>
                  );
                })}
              </div>
            )}

          {/* 3: Note Order Pads */}
          {exercise.interactionType === 'note-order' && exercise.orderPool && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2.5">
                {exercise.orderPool.map((chip) => {
                  const pos = orderedIds.indexOf(chip.id);
                  const selected = pos >= 0;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      disabled={phase !== 'answering'}
                      onClick={() => handleToggleOrderChip(chip.id, chip.midi)}
                      className={`h-14 sm:h-18 lg:h-20 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                        selected
                          ? 'bg-[#FF5A00]/20 border-2 border-[#FF5A00] text-white shadow-[0_0_16px_rgba(255,90,0,0.3)]'
                          : 'arcade-btn-dark border-white/12 text-white'
                      }`}
                    >
                      <span className="font-display font-bold text-sm">{chip.displayLabel}</span>
                      <span className="text-[11px] font-mono text-[#00E5FF] mt-0.5">
                        {selected ? t.arena.positionNum(pos + 1) : t.arena.tapToPlay}
                      </span>
                    </button>
                  );
                })}
              </div>

              {phase === 'answering' && (
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setOrderedIds([])}
                    className="h-11 px-4 rounded-xl arcade-btn-dark border border-white/10 text-xs font-bold text-[#9CA3AF] hover:text-white"
                  >
                    {t.arena.reset}
                  </button>
                  <button
                    type="button"
                    disabled={orderedIds.length !== exercise.orderPool.length}
                    onClick={handleSubmitOrder}
                    className="h-11 px-6 rounded-xl arcade-btn-orange disabled:opacity-40 text-sm font-display font-extrabold text-white"
                  >
                    {t.arena.checkOrder}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4: Blind Virtual Piano Deck */}
          {exercise.interactionType === 'piano-play' && exercise.pianoConfig && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-[#14151D] border border-white/10">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-mono text-[#9CA3AF]">{t.arena.notesLabel}</span>
                  {exercise.pianoConfig.expectedMidi.map((_m, idx) => {
                    const entered = playedPianoMidi[idx];
                    return (
                      <span
                        key={idx}
                        className={`min-w-[34px] sm:min-w-[38px] h-7 px-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center border ${
                          entered !== undefined
                            ? 'bg-[#FF5A00]/25 border-[#FF5A00] text-white'
                            : 'bg-[#0D0F18] border-white/10 text-[#5C627A]'
                        }`}
                      >
                        {entered !== undefined ? formatMidiNote(entered, lang, false) : idx + 1}
                      </span>
                    );
                  })}
                </div>
                {phase === 'answering' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPlayedPianoMidi([])}
                      className="text-xs text-[#9CA3AF] hover:text-white underline"
                    >
                      {t.arena.clear}
                    </button>
                    <button
                      type="button"
                      disabled={playedPianoMidi.length !== exercise.pianoConfig.expectedMidi.length}
                      onClick={handleSubmitPiano}
                      className="h-8 px-4 rounded-lg arcade-btn-orange disabled:opacity-40 text-xs font-display font-extrabold text-white"
                    >
                      {t.arena.check}
                    </button>
                  </div>
                )}
              </div>

              <div className="overflow-x-auto no-scrollbar">
                <VirtualPiano
                  startMidi={exercise.pianoConfig.startMidi}
                  endMidi={exercise.pianoConfig.endMidi}
                  instrument={instrument}
                  blindMode={phase === 'answering'}
                  highlightedMidi={phase === 'feedback' ? exercise.revealMidiNotes ?? [] : []}
                  anchorMidi={exercise.pianoConfig.keyRootMidi}
                  showLabels={phase === 'feedback'}
                  readOnly={phase !== 'answering'}
                  studioHeight="sm"
                  onPlayNote={handlePianoNoteInput}
                />
              </div>
            </div>
          )}

          {/* 5: Luminous Drum-Machine Rhythm Pad */}
          {exercise.interactionType === 'rhythm-tap' && exercise.rhythmTapConfig && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((beat) => {
                  const isLit = activeBeatIndicator === beat;
                  return (
                    <div
                      key={beat}
                      className={`h-9 rounded-xl flex items-center justify-center font-mono text-xs font-extrabold border transition-all ${
                        isLit
                          ? 'bg-[#00E5FF] border-white text-[#090B11] shadow-[0_0_16px_rgba(0,229,255,0.75)]'
                          : 'bg-[#14151D] border-white/10 text-[#6B7280]'
                      }`}
                    >
                      {t.arena.beatLabel(beat + 1)}
                    </div>
                  );
                })}
              </div>

              {phase === 'answering' &&
                (rhythmState === 'idle' ? (
                  <button
                    type="button"
                    onClick={handleStartRhythmRecording}
                    className="w-full h-14 sm:h-16 rounded-2xl arcade-btn-dark border-2 border-[#00E5FF]/60 text-white font-display font-extrabold text-sm sm:text-base inline-flex items-center justify-center gap-2.5"
                  >
                    <Drum className="w-5 h-5 text-[#00E5FF]" />
                    <span>{t.arena.startRecording}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handleRhythmPadTap();
                    }}
                    disabled={rhythmState !== 'recording'}
                    className={`w-full h-20 sm:h-24 rounded-2xl font-display font-extrabold text-base sm:text-lg transition-transform active:scale-[0.98] flex flex-col items-center justify-center ${
                      rhythmState === 'recording'
                        ? 'arcade-btn-orange text-white'
                        : 'bg-[#171926] border border-white/12 text-[#00E5FF]'
                    }`}
                  >
                    <span>
                      {rhythmState === 'count-in' ? t.arena.getReady : t.arena.hitPad}
                    </span>
                    <span className="text-xs font-mono font-normal mt-0.5 tabular-nums opacity-90">
                      {t.arena.hitsCounter(
                        recordedTaps.length,
                        exercise.rhythmTapConfig.expectedOnsets.length
                      )}
                    </span>
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* INTEGRATED ZERO-SCROLL PEDAGOGICAL FEEDBACK OVERLAY BAR */}
      {phase === 'feedback' && (
        <div className="absolute inset-x-0 bottom-0 z-30 px-2.5 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] sm:p-4 bg-gradient-to-t from-[#090B11] via-[#090B11]/95 to-transparent">
          <div
            className={`max-w-4xl mx-auto max-h-[48dvh] overflow-y-auto rounded-2xl p-3 sm:p-4 border-2 backdrop-blur-md shadow-[0_-12px_40px_rgba(0,0,0,0.75)] ${
              lastAnswerCorrect
                ? 'bg-[#0F1E1B]/95 border-emerald-400/70'
                : 'bg-[#221319]/95 border-rose-400/70'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                {lastAnswerCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`font-display font-extrabold text-sm sm:text-base ${
                        lastAnswerCorrect ? 'text-emerald-300' : 'text-rose-300'
                      }`}
                    >
                      {lastAnswerCorrect ? t.arena.correctHeading : t.arena.reviewHeading}
                    </span>
                    {exercise.revealRhythmTokens && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-white/8 border border-white/10">
                        <RhythmNotation
                          tokens={exercise.revealRhythmTokens}
                          height={20}
                          ariaLabel={exercise.conceptLabel}
                          className="text-white"
                        />
                      </span>
                    )}
                    {lastAnswerCorrect && combo >= 2 && (
                      <span className="text-[11px] font-mono font-bold text-[#FFB800]">
                        {t.arena.comboLabel(combo)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-white/90 mt-0.5 leading-snug">
                    {exercise.explanation}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={handlePlayMain}
                      className="h-8 px-3 rounded-lg bg-[#14151D] hover:bg-[#1E2130] border border-white/15 text-[11px] font-bold text-white inline-flex items-center gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-[#FF5A00]" />
                      <span>{t.arena.listenAgain}</span>
                    </button>
                    {exercise.contrastAudio && (
                      <button
                        type="button"
                        onClick={handlePlayContrast}
                        className="h-8 px-3 rounded-lg bg-[#14151D] hover:bg-[#1E2130] border border-[#00E5FF]/40 text-[11px] font-bold text-[#00E5FF] inline-flex items-center gap-1.5"
                      >
                        <Play className="w-3 h-3 fill-[#00E5FF]" />
                        <span>{exercise.contrastAudio.label}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Compact Post-Answer Piano Reveal + Next CTA */}
              <div className="flex flex-col sm:items-end gap-2 shrink-0">
                {exercise.interactionType !== 'piano-play' &&
                  exercise.revealMidiNotes &&
                  exercise.revealMidiNotes.length > 0 && (
                    <div className="hidden md:block w-56">
                      <VirtualPiano
                        startMidi={Math.max(48, Math.min(...exercise.revealMidiNotes) - 2)}
                        endMidi={Math.min(
                          84,
                          Math.max(
                            Math.min(...exercise.revealMidiNotes) + 12,
                            Math.max(...exercise.revealMidiNotes) + 2
                          )
                        )}
                        instrument={instrument}
                        blindMode={false}
                        highlightedMidi={exercise.revealMidiNotes}
                        showLabels={true}
                        compact={true}
                      />
                    </div>
                  )}

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full sm:w-auto h-11 px-6 rounded-xl arcade-btn-orange text-xs sm:text-sm font-display font-extrabold text-white inline-flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <span>
                    {currentIndex + 1 < exercises.length
                      ? t.arena.nextChallenge
                      : t.arena.viewResult}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
