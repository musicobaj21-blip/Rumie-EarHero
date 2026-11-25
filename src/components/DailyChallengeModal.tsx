import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Crown,
  Flame,
  Lock,
  RotateCcw,
  Share2,
  Trophy,
  Volume2,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import { AudioEngine } from '../engines/AudioEngine';
import { ExerciseEngine } from '../engines/ExerciseEngine';
import { useI18n } from '../i18n/I18nContext';
import { getTodayIsoDate } from '../services/ProgressRepository';
import { Exercise, ShareCardPayload, UserProgress } from '../types/music';

export interface DailyChallengeOutcome {
  correctCount: number;
  totalAnswered: number;
  score: number;
  maxCombo: number;
  energyGained: number;
  isNewRecord: boolean;
}

interface DailyChallengeModalProps {
  progress: UserProgress;
  qaUnlockAll: boolean;
  onCompleteDaily: (outcome: DailyChallengeOutcome) => void;
  onShareAchievement: (payload: ShareCardPayload) => void;
  onOpenLicense: () => void;
  onClose: () => void;
}

type DailyPhase = 'ready' | 'playing' | 'summary' | 'free-locked';

const DURATION_SEC = 60;
const EQ_BARS = [30, 62, 92, 48, 86, 54];

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  progress,
  qaUnlockAll,
  onCompleteDaily,
  onShareAchievement,
  onOpenLicense,
  onClose,
}) => {
  const { lang, t } = useI18n();
  const isUnlimited = progress.licensePlan === 'premium' || qaUnlockAll;
  const today = getTodayIsoDate();
  const dailyRec = progress.dailyChallenge;
  const alreadyDoneToday = dailyRec?.lastCompletedDate === today;

  const [phase, setPhase] = useState<DailyPhase>(() =>
    !isUnlimited && alreadyDoneToday ? 'free-locked' : 'ready'
  );
  const [secondsLeft, setSecondsLeft] = useState(DURATION_SEC);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentEx, setCurrentEx] = useState<Exercise | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [flashSelection, setFlashSelection] = useState<{
    optId: string;
    isCorrect: boolean;
  } | null>(null);
  const [outcome, setOutcome] = useState<DailyChallengeOutcome | null>(null);

  const endTimeRef = useRef<number>(0);
  const advanceTimerRef = useRef<number | null>(null);
  const finishedRef = useRef<boolean>(false);
  const statsRef = useRef({ correctCount: 0, totalAnswered: 0, score: 0, maxCombo: 0 });
  const lastConceptRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const unsub = AudioEngine.subscribePlayback(setIsPlayingAudio);
    return () => {
      unsub();
      AudioEngine.stopAll();
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
    };
  }, []);

  const loadAndPlayQuestion = useCallback(
    (idx: number) => {
      const ex = ExerciseEngine.generateDaily60Question(
        idx,
        progress.instrument,
        progress.conceptStats,
        lang,
        lastConceptRef.current
      );
      lastConceptRef.current = ex.conceptId.split(':')[1];
      setCurrentEx(ex);
      setFlashSelection(null);
      void AudioEngine.playSequence(ex.audio, { instrument: progress.instrument });
    },
    [progress.instrument, progress.conceptStats, lang]
  );

  const finishRun = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    AudioEngine.stopAll();
    void AudioEngine.playFeedback('complete');

    const { correctCount: hits, totalAnswered: answered, score: finalScore, maxCombo: bestStreak } =
      statsRef.current;
    const prevBest = progress.dailyChallenge?.bestCorrectEver ?? 0;
    const energyGained = 100 + hits * 15;
    const isNewRecord = hits > 0 && hits > prevBest;

    const result: DailyChallengeOutcome = {
      correctCount: hits,
      totalAnswered: answered,
      score: finalScore,
      maxCombo: bestStreak,
      energyGained,
      isNewRecord,
    };

    setOutcome(result);
    setPhase('summary');
    onCompleteDaily(result);
  }, [onCompleteDaily, progress.dailyChallenge?.bestCorrectEver]);

  // Real 60-second countdown timer using wall-clock endTime for zero drift
  useEffect(() => {
    if (phase !== 'playing') return;
    const intervalId = window.setInterval(() => {
      const remainingMs = endTimeRef.current - Date.now();
      const nextSec = Math.max(0, Math.ceil(remainingMs / 1000));
      setSecondsLeft(nextSec);
      if (remainingMs <= 0) {
        window.clearInterval(intervalId);
        finishRun();
      }
    }, 150);

    return () => window.clearInterval(intervalId);
  }, [phase, finishRun]);

  const startBlitz = () => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    finishedRef.current = false;
    lastConceptRef.current = undefined;
    statsRef.current = { correctCount: 0, totalAnswered: 0, score: 0, maxCombo: 0 };

    setCorrectCount(0);
    setTotalAnswered(0);
    setCombo(0);
    setMaxCombo(0);
    setScore(0);
    setOutcome(null);
    setSecondsLeft(DURATION_SEC);
    setQuestionIndex(0);

    endTimeRef.current = Date.now() + DURATION_SEC * 1000;
    setPhase('playing');
    loadAndPlayQuestion(0);
  };

  const handleReplayAudio = () => {
    if (!currentEx || phase !== 'playing') return;
    void AudioEngine.playSequence(currentEx.audio, { instrument: progress.instrument });
  };

  const handleSelectOption = (optId: string) => {
    if (phase !== 'playing' || !currentEx || flashSelection || finishedRef.current) return;

    AudioEngine.stopAll();
    const isCorrect = optId === currentEx.correctOptionId;
    setFlashSelection({ optId, isCorrect });
    void AudioEngine.playFeedback(isCorrect ? 'correct' : 'wrong');

    const nextAnswered = statsRef.current.totalAnswered + 1;
    const nextCorrect = statsRef.current.correctCount + (isCorrect ? 1 : 0);
    const nextCombo = isCorrect ? combo + 1 : 0;
    const nextMaxCombo = Math.max(statsRef.current.maxCombo, nextCombo);
    const gainedPts = isCorrect ? 100 + Math.min(nextCombo, 10) * 20 : 0;
    const nextScore = statsRef.current.score + gainedPts;

    statsRef.current = {
      correctCount: nextCorrect,
      totalAnswered: nextAnswered,
      score: nextScore,
      maxCombo: nextMaxCombo,
    };

    setTotalAnswered(nextAnswered);
    setCorrectCount(nextCorrect);
    setCombo(nextCombo);
    setMaxCombo(nextMaxCombo);
    setScore(nextScore);

    const nextIdx = questionIndex + 1;
    advanceTimerRef.current = window.setTimeout(() => {
      if (finishedRef.current) return;
      setQuestionIndex(nextIdx);
      loadAndPlayQuestion(nextIdx);
    }, 300);
  };

  const handleShareDailyResult = (hits: number, pts: number, bestCombo: number) => {
    onShareAchievement({
      badgeType: 'daily60',
      categoryTag: t.daily60.cardCategory,
      title: t.daily60.cardTitle(hits),
      subtitle: t.daily60.cardSubtitle(pts, bestCombo),
      metric4Label: t.daily60.cardMetricHitsLabel,
      metric4Value: t.daily60.cardMetricHitsValue(hits),
    });
  };

  const bestRecordEver = Math.max(
    dailyRec?.bestCorrectEver ?? 0,
    outcome?.correctCount ?? 0
  );

  const accuracyPct =
    outcome && outcome.totalAnswered > 0
      ? Math.round((outcome.correctCount / outcome.totalAnswered) * 100)
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 h-[100dvh] max-h-[100dvh] w-full arcade-grid-bg flex flex-col overflow-hidden select-none"
      role="dialog"
      aria-modal="true"
      aria-label={t.daily60.dialogAria}
    >
      {/* TOP BAR */}
      <header className="h-12 sm:h-14 shrink-0 bg-[#0D0F18]/95 border-b border-white/10 px-2.5 sm:px-5 flex items-center justify-between gap-2 sm:gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#FF5A00]/20 border border-[#FF5A00]/50 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-[#FFB800] fill-[#FFB800]" />
          </div>
          <span className="font-display text-sm sm:text-base font-extrabold text-white truncate">
            {t.daily60.title}
          </span>
        </div>

        {/* LIVE COUNTDOWN + COMBO + SCORE DURING PLAY */}
        {phase === 'playing' && (
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={`h-9 px-3 rounded-xl border font-mono text-sm sm:text-base font-extrabold tabular-nums flex items-center gap-1.5 transition-colors ${
                secondsLeft <= 10
                  ? 'bg-rose-500/20 border-rose-400 text-rose-300 animate-pulse'
                  : secondsLeft <= 20
                    ? 'bg-[#FFB800]/15 border-[#FFB800]/60 text-[#FFB800]'
                    : 'bg-[#151826] border-[#00E5FF]/45 text-[#00E5FF]'
              }`}
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span>{secondsLeft}s</span>
            </div>

            {combo >= 2 && (
              <div className="h-8 px-2.5 rounded-lg bg-[#FF5A00]/20 border border-[#FF5A00]/55 text-[#FFB800] font-mono text-xs font-extrabold inline-flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#FF5A00] fill-[#FF5A00]" />
                <span>{t.daily60.comboLabel(combo)}</span>
              </div>
            )}

            <div className="hidden sm:flex h-8 px-2.5 rounded-lg bg-[#151826] border border-white/10 items-center gap-2 font-mono text-xs tabular-nums">
              <span className="text-emerald-400 font-bold">
                {correctCount} {t.daily60.hitsUnit}
              </span>
              <span className="text-white/20">|</span>
              <span className="text-[#FFB800] font-bold">{score} pts</span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            AudioEngine.stopAll();
            onClose();
          }}
          aria-label={t.daily60.closeAria}
          className="w-9 h-9 rounded-xl arcade-btn-dark border border-white/10 flex items-center justify-center text-[#9CA3AF] hover:text-white shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      {/* MAIN ZERO-SCROLL STAGE */}
      <div className="flex-1 min-h-0 min-w-0 flex items-center justify-center p-2.5 sm:p-5 overflow-y-auto lg:overflow-hidden">
        {/* 1) FREE LOCKED (ALREADY COMPLETED TODAY) */}
        {phase === 'free-locked' && (
          <div className="w-[92vw] sm:w-full max-w-lg max-h-[88dvh] overflow-y-auto rounded-3xl bg-[#14151D] border border-[#FFB800]/45 p-4 sm:p-7 text-center space-y-3.5 sm:space-y-4 shadow-[0_0_50px_rgba(255,184,0,0.12)]">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-400/50 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
                {t.daily60.badge}
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white mt-1">
                {t.daily60.freeCompletedHeading}
              </h2>
              <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1">
                {t.daily60.freeCompletedDesc}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl bg-[#1C1D29] border border-white/10 p-3">
                <span className="block text-[10px] font-mono uppercase text-[#9CA3AF]">
                  {t.daily60.todayMarkLabel}
                </span>
                <span className="font-mono text-2xl font-extrabold text-[#FFB800] tabular-nums">
                  {dailyRec?.todayBestCorrect ?? 0} {t.daily60.hitsUnit}
                </span>
              </div>
              <div className="rounded-xl bg-[#1C1D29] border border-[#00E5FF]/25 p-3">
                <span className="block text-[10px] font-mono uppercase text-[#00E5FF]">
                  {t.daily60.recordEverLabel}
                </span>
                <span className="font-mono text-2xl font-extrabold text-white tabular-nums">
                  {dailyRec?.bestCorrectEver ?? 0} {t.daily60.hitsUnit}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-[#FFB800]/10 border border-[#FFB800]/30 px-3.5 py-2.5 text-xs text-[#FDE68A] flex items-center gap-2 text-left">
              <Lock className="w-4 h-4 text-[#FFB800] shrink-0" />
              <span>{t.daily60.freeLimitNotice}</span>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={() =>
                  handleShareDailyResult(
                    dailyRec?.todayBestCorrect ?? 0,
                    dailyRec?.todayBestScore ?? 0,
                    dailyRec?.bestComboEver ?? 0
                  )
                }
                className="w-full h-11 rounded-xl arcade-btn-orange text-xs sm:text-sm font-display font-extrabold text-white inline-flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>{t.daily60.shareResultBtn}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLicense();
                  }}
                  className="h-11 rounded-xl arcade-btn-gold text-[#090B11] text-xs sm:text-sm font-display font-extrabold inline-flex items-center justify-center gap-1.5"
                >
                  <Crown className="w-4 h-4" />
                  <span>{t.daily60.unlockUnlimitedBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 rounded-xl arcade-btn-dark border border-white/12 text-xs sm:text-sm font-semibold text-[#C5CAD8] hover:text-white"
                >
                  {t.daily60.backToMapBtn}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2) READY LAUNCH SCREEN */}
        {phase === 'ready' && (
          <div className="w-[92vw] sm:w-full max-w-lg max-h-[88dvh] overflow-y-auto rounded-3xl bg-[#14151D] border border-[#FF5A00]/45 p-4 sm:p-7 text-center space-y-3.5 sm:space-y-4 shadow-[0_0_50px_rgba(255,90,0,0.18)]">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#FF5A00] to-[#FFB800] text-[#090B11] flex items-center justify-center shadow-[0_0_28px_rgba(255,90,0,0.45)]">
              <Zap className="w-8 h-8 fill-[#090B11]" />
            </div>

            <div>
              <span className="inline-block text-[10px] font-mono font-bold uppercase tracking-widest text-[#FFB800]">
                {t.daily60.badge}
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white mt-1">
                {t.daily60.readyHeading}
              </h2>
              <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1.5 leading-relaxed">
                {t.daily60.readyDesc}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-left">
              <div className="rounded-xl bg-[#1C1D29] border border-white/8 p-3">
                <span className="block text-[10px] font-mono uppercase text-[#00E5FF] font-bold">
                  60s BLITZ
                </span>
                <span className="block text-xs text-white/90 mt-0.5">
                  {t.daily60.categoriesHint}
                </span>
              </div>
              <div className="rounded-xl bg-[#1C1D29] border border-[#FFB800]/25 p-3">
                <span className="block text-[10px] font-mono uppercase text-[#FFB800] font-bold">
                  {t.daily60.bestRecordLabel}
                </span>
                <span className="block font-mono text-base font-extrabold text-white mt-0.5 tabular-nums">
                  {bestRecordEver} {t.daily60.hitsUnit}
                </span>
              </div>
            </div>

            <p className="text-xs font-mono text-[#FF8A4C]">{t.daily60.rewardHint}</p>

            <button
              type="button"
              onClick={startBlitz}
              className="w-full h-13 rounded-2xl arcade-btn-orange text-sm sm:text-base font-display font-extrabold text-white inline-flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-white" />
              <span>{t.daily60.startBtn}</span>
            </button>
          </div>
        )}

        {/* 3) ACTIVE 60-SECOND GAMEPLAY ARENA */}
        {phase === 'playing' && currentEx && (
          <div className="w-full max-w-3xl h-full min-h-0 flex flex-col justify-between py-1 sm:py-2 gap-2 sm:gap-3">
            {/* Progress time bar */}
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-[#1C1F2E] overflow-hidden border border-white/8">
                <div
                  className={`h-full transition-all duration-200 ${
                    secondsLeft <= 10
                      ? 'bg-rose-500'
                      : 'bg-gradient-to-r from-[#FF5A00] via-[#FFB800] to-[#00E5FF]'
                  }`}
                  style={{ width: `${Math.round((secondsLeft / DURATION_SEC) * 100)}%` }}
                />
              </div>

              <div className="text-center">
                <div className="flex sm:hidden items-center justify-center gap-3 text-xs font-mono mb-1">
                  <span className="text-emerald-400 font-bold">
                    {t.daily60.hitsLabel}: {correctCount}
                  </span>
                  <span className="text-[#FFB800] font-bold">
                    {t.daily60.scoreLabel}: {score}
                  </span>
                </div>
                <h2 className="font-display text-base sm:text-xl font-extrabold text-white">
                  {currentEx.instruction}
                </h2>
              </div>
            </div>

            {/* Central Audio Orb + Equalizer */}
            <div className="flex items-center justify-center gap-5">
              <div className="hidden sm:flex items-center gap-1.5 h-12">
                {EQ_BARS.map((h, i) => (
                  <span
                    key={i}
                    style={{
                      height: `${Math.round((h / 100) * 44)}px`,
                      animationDelay: `${i * 65}ms`,
                    }}
                    className={`w-1.5 rounded-full ${
                      isPlayingAudio
                        ? 'eq-bar-active bg-gradient-to-t from-[#FF5A00] to-[#00E5FF]'
                        : 'bg-[#282C40] opacity-50 scale-y-25'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleReplayAudio}
                className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-full arcade-btn-orange text-white flex flex-col items-center justify-center gap-1"
              >
                {isPlayingAudio && (
                  <span className="pointer-events-none absolute -inset-2 rounded-full border-2 border-[#00E5FF] animate-audio-ring" />
                )}
                <Volume2 className="w-6 h-6 sm:w-7 sm:h-7" />
                <span className="font-display text-[11px] font-extrabold">
                  {isPlayingAudio ? t.daily60.playingBtn : t.daily60.listenBtn}
                </span>
              </button>

              <div className="hidden sm:flex items-center gap-1.5 h-12">
                {[...EQ_BARS].reverse().map((h, i) => (
                  <span
                    key={i}
                    style={{
                      height: `${Math.round((h / 100) * 44)}px`,
                      animationDelay: `${i * 65}ms`,
                    }}
                    className={`w-1.5 rounded-full ${
                      isPlayingAudio
                        ? 'eq-bar-active bg-gradient-to-t from-[#FF5A00] to-[#00E5FF]'
                        : 'bg-[#282C40] opacity-50 scale-y-25'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Rapid Answer Pads */}
            <div
              className={`grid gap-2.5 sm:gap-3 ${
                (currentEx.options?.length ?? 0) === 3 ? 'grid-cols-3' : 'grid-cols-2'
              }`}
            >
              {currentEx.options?.map((opt) => {
                const isPicked = flashSelection?.optId === opt.id;
                const isCorrectOpt = opt.id === currentEx.correctOptionId;
                let cls = 'arcade-btn-dark border border-white/12 text-white';
                if (flashSelection) {
                  if (isCorrectOpt) {
                    cls = 'bg-emerald-500/25 border-2 border-emerald-400 text-white';
                  } else if (isPicked && !flashSelection.isCorrect) {
                    cls = 'bg-rose-500/25 border-2 border-rose-400 text-white';
                  } else {
                    cls = 'bg-[#14151D]/55 border border-white/5 text-[#5D637A]';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={Boolean(flashSelection)}
                    onClick={() => handleSelectOption(opt.id)}
                    className={`min-h-[54px] sm:min-h-[68px] lg:min-h-[80px] p-2.5 sm:p-3.5 rounded-2xl text-left min-w-0 flex items-center justify-between gap-2 transition-all ${cls}`}
                  >
                    <div className="min-w-0">
                      <span className="block font-display text-sm sm:text-base font-bold truncate">
                        {opt.label}
                      </span>
                      {opt.sublabel && (
                        <span className="block text-[11px] text-[#9CA3AF] mt-0.5 truncate">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                    {flashSelection && isCorrectOpt && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                    {flashSelection && isPicked && !isCorrectOpt && (
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4) COMPACT SUMMARY SCREEN */}
        {phase === 'summary' && outcome && (
          <div className="w-[92vw] sm:w-full max-w-lg max-h-[88dvh] overflow-y-auto rounded-3xl bg-[#14151D] border border-[#FF5A00]/50 p-4 sm:p-6 text-center space-y-3.5 sm:space-y-4 shadow-[0_0_55px_rgba(255,90,0,0.2)]">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#FFD452] to-[#FF5A00] text-[#090B11] flex items-center justify-center shadow-[0_0_24px_rgba(255,184,0,0.45)]">
                <Trophy className="w-7 h-7" />
              </div>
              {outcome.isNewRecord && (
                <span className="mt-2 px-2.5 py-0.5 rounded-full bg-[#FFB800]/20 border border-[#FFB800]/55 text-[10px] font-mono font-extrabold text-[#FFB800]">
                  {t.daily60.newRecordBadge}
                </span>
              )}
              <h2 className="font-display text-2xl font-extrabold text-white mt-1.5">
                {t.daily60.finishTitle}
              </h2>
              <p className="font-mono text-sm text-[#FFB800] font-bold mt-0.5 tabular-nums">
                {outcome.correctCount} {t.daily60.hitsUnit} · {outcome.score} pts
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div className="rounded-xl bg-[#1C1D29] border border-white/8 p-2.5">
                <span className="block text-[9px] font-mono uppercase text-[#9CA3AF]">
                  {t.daily60.accuracyLabel}
                </span>
                <span className="font-mono text-base font-extrabold text-[#00E5FF] tabular-nums">
                  {accuracyPct}%
                </span>
              </div>
              <div className="rounded-xl bg-[#1C1D29] border border-white/8 p-2.5">
                <span className="block text-[9px] font-mono uppercase text-[#9CA3AF]">
                  {t.daily60.maxComboLabel}
                </span>
                <span className="font-mono text-base font-extrabold text-[#FFB800] tabular-nums">
                  x{outcome.maxCombo}
                </span>
              </div>
              <div className="rounded-xl bg-[#1C1D29] border border-[#FF5A00]/35 p-2.5">
                <span className="block text-[9px] font-mono uppercase text-[#FF8A4C]">
                  {t.daily60.energyEarnedLabel}
                </span>
                <span className="font-mono text-base font-extrabold text-[#FF5A00] tabular-nums">
                  +{outcome.energyGained}
                </span>
              </div>
              <div className="rounded-xl bg-[#1C1D29] border border-white/8 p-2.5">
                <span className="block text-[9px] font-mono uppercase text-[#9CA3AF]">
                  {t.daily60.recordEverLabel}
                </span>
                <span className="font-mono text-base font-extrabold text-white tabular-nums">
                  {bestRecordEver}
                </span>
              </div>
            </div>

            {!isUnlimited && (
              <div className="rounded-xl bg-[#FFB800]/10 border border-[#FFB800]/30 px-3 py-2 text-[11px] text-[#FDE68A] text-left flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#FFB800] shrink-0" />
                <span>{t.daily60.freeLimitNotice}</span>
              </div>
            )}

            <div className="space-y-2 pt-0.5">
              <button
                type="button"
                onClick={() =>
                  handleShareDailyResult(outcome.correctCount, outcome.score, outcome.maxCombo)
                }
                className="w-full h-11 rounded-xl arcade-btn-orange text-xs sm:text-sm font-display font-extrabold text-white inline-flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>{t.daily60.shareResultBtn}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                {isUnlimited ? (
                  <button
                    type="button"
                    onClick={startBlitz}
                    className="h-11 rounded-xl arcade-btn-dark border border-[#00E5FF]/45 text-xs sm:text-sm font-display font-extrabold text-[#00E5FF] inline-flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{t.daily60.retryUnlimitedBtn}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenLicense();
                    }}
                    className="h-11 rounded-xl arcade-btn-gold text-[#090B11] text-xs sm:text-sm font-display font-extrabold inline-flex items-center justify-center gap-1.5"
                  >
                    <Crown className="w-4 h-4" />
                    <span>{t.daily60.unlockUnlimitedBtn}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 rounded-xl arcade-btn-dark border border-white/12 text-xs sm:text-sm font-semibold text-[#C5CAD8] hover:text-white"
                >
                  {t.daily60.backToMapBtn}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
