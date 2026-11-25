import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Award,
  Check,
  ChevronDown,
  Crown,
  Flame,
  FlaskConical,
  Globe,
  Map,
  Star,
  Zap,
} from 'lucide-react';
import { DailyChallengeModal, DailyChallengeOutcome } from './components/DailyChallengeModal';
import { EarTrainingLaboratory } from './components/EarTrainingLaboratory';
import { GameMap, UnlockTransition } from './components/GameMap';
import { LevelPlayer } from './components/LevelPlayer';
import { LicenseModal } from './components/LicenseModal';
import { RewardsView } from './components/RewardsView';
import { ShareCardModal } from './components/ShareCardModal';
import { AudioEngine } from './engines/AudioEngine';
import { ExerciseEngine } from './engines/ExerciseEngine';
import { LearningAnalytics } from './engines/LearningAnalytics';
import { LevelEngine } from './engines/LevelEngine';
import { RewardEngine } from './engines/RewardEngine';
import { WorldEngine } from './engines/WorldEngine';
import { useI18n } from './i18n/I18nContext';
import { SUPPORTED_LANGUAGES } from './i18n/types';
import { LabModuleId, LicenseAdapter } from './services/LicenseAdapter';
import {
  computeUpdatedStreak,
  createDefaultDailyChallenge,
  getTodayIsoDate,
  ProgressRepository,
} from './services/ProgressRepository';
import {
  Exercise,
  InstrumentType,
  LevelCompletionSummary,
  LevelDefinition,
  LicensePlan,
  ShareCardPayload,
  UserProgress,
} from './types/music';

type AppTab = 'map' | 'lab' | 'rewards';

interface ActiveSession {
  mode: 'level';
  level: LevelDefinition;
  exercises: Exercise[];
}

const OFFICIAL_RUMIE_LOGO_URL =
  (import.meta.env?.VITE_RUMIE_LOGO_URL as string | undefined) || '';

const DEFAULT_STORED_NAME = 'Estudiante Rumie';

const AVATAR_STYLES = [
  { bg: 'bg-[#FF5A00]', label: 'Sol', initials: 'RM' },
  { bg: 'bg-[#2563EB]', label: 'Do', initials: 'DO' },
  { bg: 'bg-[#0D9488]', label: 'Mi', initials: 'MI' },
  { bg: 'bg-[#D97706]', label: 'Fa', initials: 'FA' },
  { bg: 'bg-[#7C3AED]', label: 'La', initials: 'LA' },
  { bg: 'bg-[#E11D48]', label: 'Si', initials: 'SI' },
];

export default function App() {
  const { lang, setLang, t } = useI18n();
  const [progress, setProgress] = useState<UserProgress>(() => ProgressRepository.load());
  const [activeTab, setActiveTab] = useState<AppTab>('map');
  const [labInitialModule, setLabInitialModule] = useState<LabModuleId>('intervals');
  const [rewardsInitialSection, setRewardsInitialSection] = useState<'medals' | 'skills'>('medals');
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [recentUnlockTransition, setRecentUnlockTransition] = useState<UnlockTransition | null>(
    null
  );
  const [showDailyChallenge, setShowDailyChallenge] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [sharePayload, setSharePayload] = useState<ShareCardPayload | null>(null);

  // Reversible QA / Test mode (strictly in-memory, always defaults to false, never saved to localStorage)
  const [qaUnlockAll, setQaUnlockAll] = useState(false);
  const [qaToast, setQaToast] = useState<string | null>(null);
  const qaToastTimerRef = useRef<number | null>(null);

  // Compact HUD Player Profile Popover & Language Dropdown
  const [showProfilePopover, setShowProfilePopover] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [draftName, setDraftName] = useState(progress.studentName);
  const [draftAvatar, setDraftAvatar] = useState(progress.avatarId);

  const langMenuRef = useRef<HTMLDivElement | null>(null);
  const profilePopoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      if (qaToastTimerRef.current !== null) {
        window.clearTimeout(qaToastTimerRef.current);
      }
    };
  }, []);

  const showBriefQaToast = (msg: string) => {
    if (qaToastTimerRef.current !== null) {
      window.clearTimeout(qaToastTimerRef.current);
    }
    setQaToast(msg);
    qaToastTimerRef.current = window.setTimeout(() => {
      setQaToast(null);
      qaToastTimerRef.current = null;
    }, 3200);
  };

  const handleActivateQaUnlock = () => {
    setQaUnlockAll(true);
    showBriefQaToast('🛠️ Modo QA activado: 8 mundos, 40 etapas y Laboratorio Pro desbloqueados.');
  };

  const handleDeactivateQaUnlock = () => {
    setQaUnlockAll(false);
    showBriefQaToast('🔒 Modo QA desactivado: candados y licencia real restaurados.');
  };

  useEffect(() => {
    ProgressRepository.save(progress);
  }, [progress]);

  useEffect(() => {
    let active = true;
    void LicenseAdapter.verifyLicenseWithLaravel(progress.licensePlan).then((res) => {
      if (active && res.verifiedByServer && res.plan !== progress.licensePlan) {
        setProgress((prev) => ({ ...prev, licensePlan: res.plan }));
      }
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close language dropdown / profile popover on outside click or Escape
  useEffect(() => {
    if (!showLangMenu && !showProfilePopover) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (showLangMenu && langMenuRef.current && !langMenuRef.current.contains(target)) {
        setShowLangMenu(false);
      }
      if (
        showProfilePopover &&
        profilePopoverRef.current &&
        !profilePopoverRef.current.contains(target)
      ) {
        setShowProfilePopover(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowLangMenu(false);
        setShowProfilePopover(false);
      }
    };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [showLangMenu, showProfilePopover]);

  const totalStars = useMemo(() => WorldEngine.getTotalStars(progress), [progress]);
  const completedCount = useMemo(
    () => Object.values(progress.levels).filter((l) => l.completed).length,
    [progress.levels]
  );
  const isDailyDoneToday = progress.dailyChallenge?.lastCompletedDate === getTodayIsoDate();
  const currentAvatar = AVATAR_STYLES[progress.avatarId % AVATAR_STYLES.length];

  // Display localized default student label unless user customized their name
  const displayStudentName =
    !progress.studentName.trim() || progress.studentName === DEFAULT_STORED_NAME
      ? t.brand.defaultStudent
      : progress.studentName;

  const avatarInitials = displayStudentName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'EH';

  const handleStartLevel = (level: LevelDefinition) => {
    const status = WorldEngine.getLevelAccessStatus(level, progress, qaUnlockAll);
    if (status === 'locked-license') {
      setShowLicenseModal(true);
      return;
    }
    if (status === 'locked-progress') {
      return;
    }
    AudioEngine.stopAll();
    const exercises = ExerciseEngine.generateLevelExercises(
      level,
      progress.conceptStats,
      progress.instrument,
      lang
    );
    setActiveSession({ mode: 'level', level, exercises });
  };

  const handleRecordAnswer = (exercise: Exercise, isCorrect: boolean) => {
    setProgress((prev) =>
      LearningAnalytics.recordAttempt(
        prev,
        exercise.conceptId,
        exercise.conceptLabel,
        exercise.skillCategory,
        isCorrect
      )
    );
  };

  const handleCompleteMission = (
    correctCount: number,
    totalCount: number
  ): LevelCompletionSummary | null => {
    if (!activeSession) return null;

    const { updatedProgress, summary } = LevelEngine.completeLevel(
      progress,
      activeSession.level,
      correctCount,
      totalCount
    );
    setProgress(updatedProgress);

    if (summary.unlockedNextLevelTitle) {
      const unlockedNext = WorldEngine.getNextLevel(activeSession.level.id);
      if (unlockedNext && unlockedNext.worldId === activeSession.level.worldId) {
        setRecentUnlockTransition({
          worldId: activeSession.level.worldId,
          fromLevelId: activeSession.level.id,
          toLevelId: unlockedNext.id,
        });
      }
    }

    return summary;
  };

  const handleRetrySession = () => {
    if (!activeSession) return;
    const freshExercises = ExerciseEngine.generateLevelExercises(
      activeSession.level,
      progress.conceptStats,
      progress.instrument,
      lang
    );
    setActiveSession({ ...activeSession, exercises: freshExercises });
  };

  const handleStartNextLevelById = (nextLevelId: string) => {
    const next = WorldEngine.getLevelById(nextLevelId);
    if (next) {
      handleStartLevel(next);
    } else {
      setActiveSession(null);
    }
  };

  const handleCompleteDaily = (outcome: DailyChallengeOutcome) => {
    setProgress((prev) => {
      const today = getTodayIsoDate();
      const prevDaily = prev.dailyChallenge ?? createDefaultDailyChallenge();
      const isSameDay = prevDaily.lastCompletedDate === today;
      const wrongCount = Math.max(0, outcome.totalAnswered - outcome.correctCount);
      const streakUpdate = computeUpdatedStreak(prev);

      const nextDaily = {
        lastCompletedDate: today,
        todayBestCorrect: isSameDay
          ? Math.max(prevDaily.todayBestCorrect, outcome.correctCount)
          : outcome.correctCount,
        todayBestScore: isSameDay
          ? Math.max(prevDaily.todayBestScore, outcome.score)
          : outcome.score,
        todayAttempts: isSameDay ? prevDaily.todayAttempts + 1 : 1,
        bestCorrectEver: Math.max(prevDaily.bestCorrectEver, outcome.correctCount),
        bestScoreEver: Math.max(prevDaily.bestScoreEver, outcome.score),
        bestComboEver: Math.max(prevDaily.bestComboEver, outcome.maxCombo),
        totalCompletedDays: isSameDay
          ? prevDaily.totalCompletedDays
          : prevDaily.totalCompletedDays + 1,
      };

      const interim: UserProgress = {
        ...prev,
        xp: prev.xp + outcome.energyGained,
        streakDays: streakUpdate.streakDays,
        lastActiveDate: streakUpdate.lastActiveDate,
        totalCorrect: prev.totalCorrect + outcome.correctCount,
        totalWrong: prev.totalWrong + wrongCount,
        dailyChallenge: nextDaily,
        syncPending: true,
      };

      const medalEval = RewardEngine.evaluateNewMedals(interim);
      return {
        ...interim,
        unlockedMedals: medalEval.allUnlockedIds,
        diplomaUnlockedAt: medalEval.diplomaUnlockedAt,
      };
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = draftName.trim() || DEFAULT_STORED_NAME;
    setProgress((prev) => ({
      ...prev,
      studentName: cleaned,
      avatarId: draftAvatar,
      syncPending: true,
    }));
    setShowProfilePopover(false);
  };

  const handleChangeInstrument = (instrument: InstrumentType) => {
    setProgress((prev) => ({ ...prev, instrument }));
  };

  const handleChangeLicense = (licensePlan: LicensePlan) => {
    setProgress((prev) => ({ ...prev, licensePlan }));
  };

  const handleResetProgress = () => {
    AudioEngine.stopAll();
    const fresh = ProgressRepository.reset();
    setProgress(fresh);
    setActiveSession(null);
    setActiveTab('map');
  };

  const nextLevel =
    activeSession?.mode === 'level'
      ? WorldEngine.getNextLevel(activeSession.level.id)
      : null;

  const effectiveLicensePlan: LicensePlan = qaUnlockAll ? 'premium' : progress.licensePlan;

  const canPlayNext =
    nextLevel &&
    (qaUnlockAll || LicenseAdapter.canAccessWorld(nextLevel.worldId, progress.licensePlan));

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col bg-[#090B11] text-white select-none">
      {/* GAMER TOP HUD (Mobile ~48px / Tablet 56px / Desktop 60px fixed, 3 airy blocks) */}
      {!activeSession && (
        <header className="relative z-40 h-12 md:h-14 lg:h-[60px] shrink-0 bg-[#0C0E16] border-b border-white/10 px-2.5 md:px-5 flex items-center justify-between gap-2 md:gap-3 lg:gap-4 min-w-0">
          {/* LEFT: Clean Rumie EarHero Brand Block */}
          <button
            type="button"
            onClick={() => {
              AudioEngine.stopAll();
              setActiveTab('map');
            }}
            className="flex items-center gap-1.5 md:gap-2 shrink-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00] rounded-lg py-0.5"
          >
            {OFFICIAL_RUMIE_LOGO_URL && (
              <img
                src={OFFICIAL_RUMIE_LOGO_URL}
                alt={t.brand.name}
                referrerPolicy="no-referrer"
                className="h-6 md:h-7 w-auto object-contain shrink-0"
              />
            )}
            <div className="flex flex-col leading-none">
              <span className="font-display text-[13px] md:text-[16px] lg:text-[17px] font-extrabold tracking-tight text-white whitespace-nowrap leading-[1.1]">
                Rumie{' '}
                <span className="text-[#FF5A00]">EarHero</span>
              </span>
              <span className="hidden lg:block text-[10px] font-medium tracking-[0.02em] text-[#94A3B8] whitespace-nowrap mt-[2px]">
                {t.brand.slogan}
              </span>
            </div>
          </button>

          {/* CENTER: 4 Clean Main Navigation Tabs with Icon + Full Text (Desktop lg: only) */}
          <nav
            aria-label={t.hud.navAria}
            className="hidden lg:flex items-center gap-2 shrink-0 min-w-0"
          >
            <div className="flex items-center gap-0.5 lg:gap-1 p-0.5 lg:p-1 rounded-xl bg-[#131522] border border-white/8">
              {(
                [
                  { id: 'map', label: t.hud.map, Icon: Map },
                  { id: 'lab', label: t.hud.lab, Icon: FlaskConical },
                  { id: 'rewards', label: t.hud.rewards, Icon: Award },
                ] as const
              ).map(({ id, label, Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    title={label}
                    onClick={() => {
                      AudioEngine.stopAll();
                      if (id === 'rewards') setRewardsInitialSection('medals');
                      setActiveTab(id);
                    }}
                    className={`h-7 lg:h-8 px-2 lg:px-3.5 rounded-lg text-[11px] lg:text-xs font-display font-bold inline-flex items-center gap-1 lg:gap-1.5 transition-all whitespace-nowrap ${
                      active
                        ? 'arcade-btn-orange text-white'
                        : 'text-[#9CA3AF] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                AudioEngine.stopAll();
                setShowDailyChallenge(true);
              }}
              title={isDailyDoneToday ? t.hud.daily60DoneTitle : t.hud.daily60Title}
              aria-label={isDailyDoneToday ? t.hud.daily60DoneTitle : t.hud.daily60Title}
              className={`relative h-8 lg:h-9 px-2.5 lg:px-3.5 rounded-xl arcade-btn-dark border text-[11px] lg:text-xs font-display font-bold inline-flex items-center gap-1 lg:gap-1.5 whitespace-nowrap transition-colors ${
                isDailyDoneToday
                  ? 'border-emerald-400/40 text-emerald-300 hover:border-emerald-400/70'
                  : 'border-[#FFB800]/45 text-[#FFB800] hover:border-[#FF5A00]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current shrink-0" />
              <span>{t.hud.daily60}</span>
              {isDailyDoneToday ? (
                <Check className="w-3 h-3 text-emerald-400 stroke-[3] shrink-0" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A00] shadow-[0_0_8px_#FF5A00] animate-pulse shrink-0" />
              )}
            </button>
          </nav>

          {/* RIGHT: 1) Progress Pills -> 2) Compact User Chip -> 3) Language Switcher -> 4) License CTA */}
          <div className="flex items-center gap-1 md:gap-2.5 lg:gap-2 shrink-0 min-w-0">
            {/* 1. Progress Pills: XP & Streak ALWAYS visible (Mobile + Tablet + Desktop); Stars visible Tablet + Desktop */}
            <div
              title={t.hud.xpTitle}
              className="h-7 md:h-8 lg:h-7 px-1.5 md:px-2.5 rounded-full bg-[#151826] border border-[#FF5A00]/35 flex items-center gap-0.5 md:gap-1 font-mono text-[10px] md:text-[11px] font-extrabold text-[#FF5A00] tabular-nums shrink-0"
            >
              <Zap className="w-3 h-3 fill-[#FF5A00] shrink-0" />
              <span>{progress.xp}</span>
            </div>

            <div
              title={t.hud.streakTitle}
              className="flex h-7 md:h-8 lg:h-7 px-1.5 md:px-2.5 rounded-full bg-[#151826] border border-[#FF5A00]/30 items-center gap-0.5 md:gap-1 font-mono text-[10px] md:text-[11px] font-extrabold text-white tabular-nums shrink-0"
            >
              <Flame className="w-3 h-3 text-[#FF5A00] fill-[#FF5A00] animate-flame shrink-0" />
              <span>{progress.streakDays}d</span>
            </div>

            <div
              title={t.hud.starsTitle}
              className="hidden sm:flex h-7 md:h-8 lg:h-7 px-1.5 md:px-2.5 rounded-full bg-[#151826] border border-[#FFB800]/35 items-center gap-0.5 md:gap-1 font-mono text-[10px] md:text-[11px] font-extrabold text-[#FFB800] tabular-nums shrink-0"
            >
              <Star className="w-3 h-3 fill-[#FFB800] shrink-0" />
              <span>{totalStars}</span>
            </div>

            <div
              title={t.hud.levelsProgressTitle}
              className="hidden xl:flex h-7 px-2.5 rounded-full bg-[#151826] border border-[#00E5FF]/30 items-center font-mono text-[11px] font-bold text-[#00E5FF] tabular-nums shrink-0"
            >
              <span>{completedCount}/40</span>
            </div>

            {/* 2. Discreet Compact User Chip (Mobile: avatar circle; Tablet: avatar + PRO/FREE; Desktop: avatar + name + PRO/FREE) */}
            <div ref={profilePopoverRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowProfilePopover((v) => !v);
                  setShowLangMenu(false);
                  setDraftName(
                    progress.studentName === DEFAULT_STORED_NAME ? displayStudentName : progress.studentName
                  );
                  setDraftAvatar(progress.avatarId);
                }}
                aria-label={t.hud.editProfileAria}
                title={`${displayStudentName} · ${t.hud.editProfileAria}`}
                className="h-7 md:h-8 lg:h-7 px-1 md:pl-1.5 md:pr-2.5 lg:pl-1 lg:pr-2 rounded-full bg-[#151826] hover:bg-[#1C2033] border border-white/10 hover:border-white/20 flex items-center gap-1 md:gap-1.5 transition-colors"
              >
                <span
                  className={`w-[18px] h-[18px] md:w-5 md:h-5 lg:w-[18px] lg:h-[18px] rounded-full ${currentAvatar.bg} text-[9px] font-display font-extrabold text-white flex items-center justify-center shrink-0 leading-none`}
                >
                  {avatarInitials}
                </span>
                <span className="hidden lg:inline text-[11px] font-semibold text-white/90 truncate max-w-[95px]">
                  {displayStudentName}
                </span>
                <span
                  className={`hidden md:inline text-[9px] md:text-[10px] lg:text-[9px] font-mono font-extrabold px-1 py-[1px] rounded uppercase leading-none ${
                    progress.licensePlan === 'premium'
                      ? 'bg-[#FFB800]/20 text-[#FFB800]'
                      : 'bg-white/10 text-[#9CA3AF]'
                  }`}
                >
                  {progress.licensePlan === 'premium' ? 'PRO' : 'FREE'}
                </span>
              </button>

              {/* Right-anchored Profile Popover */}
              {showProfilePopover && (
                <form
                  onSubmit={handleSaveProfile}
                  className="absolute right-0 top-[36px] z-50 w-[min(18rem,90vw)] rounded-2xl bg-[#14151D] border border-[#00E5FF]/40 p-4 shadow-[0_18px_48px_rgba(0,0,0,0.8)] space-y-3"
                >
                  <div>
                    <label
                      htmlFor="hud-player-name"
                      className="block text-[11px] font-mono text-[#9CA3AF] mb-1"
                    >
                      {t.hud.playerNameLabel}
                    </label>
                    <input
                      id="hud-player-name"
                      type="text"
                      maxLength={28}
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg bg-[#1C1F2E] border border-white/12 text-xs text-white focus:outline-none focus:border-[#FF5A00]"
                    />
                    <span className="block text-[10px] text-[#6B7280] mt-1">
                      {t.hud.playerNameHint}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[11px] font-mono text-[#9CA3AF] mb-1.5">
                      {t.hud.avatarColorLabel}
                    </span>
                    <div className="flex items-center gap-2">
                      {AVATAR_STYLES.map((av, idx) => (
                        <button
                          key={av.label}
                          type="button"
                          onClick={() => setDraftAvatar(idx)}
                          className={`w-8 h-8 rounded-full ${av.bg} text-[10px] font-bold text-white transition-transform ${
                            draftAvatar === idx ? 'ring-2 ring-white scale-110' : 'opacity-65 hover:opacity-100'
                          }`}
                        >
                          {av.initials}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowProfilePopover(false)}
                      className="h-8 px-3 rounded-lg bg-[#1C1D29] text-xs text-[#9CA3AF] hover:text-white"
                    >
                      {t.hud.cancel}
                    </button>
                    <button
                      type="submit"
                      className="h-8 px-4 rounded-lg arcade-btn-orange text-xs font-display font-bold text-white"
                    >
                      {t.hud.save}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Reversible QA Mode Active Toggle */}
            {qaUnlockAll && (
              <button
                type="button"
                onClick={handleDeactivateQaUnlock}
                title="Desactivar Modo QA y restaurar candados reales"
                className="h-7 md:h-8 lg:h-7 px-1.5 md:px-2.5 lg:px-2 rounded-full bg-[#FF5A00] hover:bg-[#FF6E1F] text-white text-[10px] md:text-[11px] font-display font-extrabold whitespace-nowrap inline-flex items-center gap-1 shadow-[0_0_12px_rgba(255,90,0,0.45)] transition-colors shrink-0"
              >
                <span className="lg:hidden">🛠️ QA</span>
                <span className="hidden lg:inline">🛠️ QA ON (Bloquear)</span>
              </button>
            )}

            {/* 3. Compact Language Switcher (🌐 ES ▾) */}
            <div ref={langMenuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowProfilePopover(false);
                  setShowLangMenu((v) => !v);
                }}
                aria-label={t.hud.languageAria}
                aria-expanded={showLangMenu}
                aria-haspopup="listbox"
                className="h-7 md:h-8 lg:h-7 px-1.5 md:px-2.5 lg:px-2 rounded-full bg-[#151826] hover:bg-[#1C2033] border border-white/10 hover:border-[#00E5FF]/45 text-[10px] md:text-[11px] font-mono font-bold text-[#E2E8F0] inline-flex items-center gap-0.5 md:gap-1 transition-colors"
              >
                <Globe className="w-3 h-3 text-[#00E5FF] shrink-0" />
                <span>{lang.toUpperCase()}</span>
                <ChevronDown
                  className={`hidden sm:block w-3 h-3 text-[#94A3B8] transition-transform duration-150 ${
                    showLangMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showLangMenu && (
                <div
                  role="listbox"
                  aria-label={t.hud.languageAria}
                  className="absolute right-0 top-[36px] z-50 w-40 rounded-xl bg-[#14151D] border border-white/14 p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.8)]"
                >
                  {SUPPORTED_LANGUAGES.map((item) => {
                    const isSelected = item.code === lang;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setLang(item.code);
                          setShowLangMenu(false);
                        }}
                        className={`w-full h-8 px-2.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#FF5A00]/18 text-white font-bold'
                            : 'text-[#CBD5E1] hover:bg-white/6 hover:text-white'
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <span className="font-mono text-[10px] font-extrabold text-[#00E5FF]">
                            {item.shortLabel}
                          </span>
                          <span>{item.nativeLabel}</span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#FF5A00]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 4. License / Premium CTA (ALWAYS visible with full label on Mobile, Tablet & Desktop) */}
            <button
              type="button"
              onClick={() => setShowLicenseModal(true)}
              className="h-7 md:h-8 px-2 md:px-3 rounded-lg md:rounded-xl arcade-btn-gold text-[#090B11] font-display font-extrabold text-[10px] md:text-[11px] inline-flex items-center gap-1 md:gap-1.5 whitespace-nowrap shrink-0"
            >
              <Crown className="w-3 h-3 md:w-3.5 md:h-3.5 shrink-0" />
              <span className="lg:hidden">
                {progress.licensePlan === 'premium' ? 'Pro' : t.hud.licenseBtn}
              </span>
              <span className="hidden lg:inline">
                {progress.licensePlan === 'premium' ? t.hud.premiumBtn : t.hud.licenseBtn}
              </span>
            </button>
          </div>
        </header>
      )}

      {/* MAIN SINGLE-SCREEN VIEWPORT (flex-1 min-h-0 min-w-0 overflow-hidden) */}
      <main className="flex-1 min-h-0 min-w-0 overflow-hidden">
        {activeSession ? (
          <LevelPlayer
            key={activeSession.exercises[0]?.id ?? activeSession.level.id}
            level={activeSession.level}
            exercises={activeSession.exercises}
            instrument={progress.instrument}
            mode={activeSession.mode}
            onRecordAnswer={handleRecordAnswer}
            onCompleteLevel={handleCompleteMission}
            onRetryLevel={handleRetrySession}
            onStartNextLevel={handleStartNextLevelById}
            nextLevelId={canPlayNext ? nextLevel?.id : null}
            onShareAchievement={setSharePayload}
            onExit={() => {
              AudioEngine.stopAll();
              setActiveSession(null);
            }}
          />
        ) : activeTab === 'map' ? (
          <GameMap
            progress={progress}
            qaUnlockAll={qaUnlockAll}
            recentUnlockTransition={recentUnlockTransition}
            onUnlockTransitionDone={() => setRecentUnlockTransition(null)}
            onStartLevel={handleStartLevel}
            onOpenLicense={() => setShowLicenseModal(true)}
            onShareAchievement={setSharePayload}
            onOpenDiploma={() => {
              AudioEngine.stopAll();
              setRewardsInitialSection('skills');
              setActiveTab('rewards');
            }}
            onOpenLabModule={(moduleId) => {
              AudioEngine.stopAll();
              setLabInitialModule(moduleId);
              setActiveTab('lab');
            }}
          />
        ) : activeTab === 'lab' ? (
          <EarTrainingLaboratory
            licensePlan={effectiveLicensePlan}
            instrument={progress.instrument}
            initialModule={labInitialModule}
            onChangeInstrument={handleChangeInstrument}
            onOpenLicense={() => setShowLicenseModal(true)}
          />
        ) : (
          <RewardsView
            progress={progress}
            initialSection={rewardsInitialSection}
            onOpenLicense={() => setShowLicenseModal(true)}
            onShareAchievement={setSharePayload}
          />
        )}
      </main>

      {/* MOBILE & TABLET VERTICAL BOTTOM ARCADE DOCK (< 1024px: 4 balanced tabs, fixed bottom) */}
      {!activeSession && (
        <nav
          aria-label={t.hud.mobileNavAria}
          className="lg:hidden min-h-[58px] md:h-16 md:min-h-16 shrink-0 bg-[#0C0E16] border-t border-white/10 grid grid-cols-4 items-center px-2 md:px-6 pt-1 md:pt-0 pb-[max(0.35rem,env(safe-area-inset-bottom))] md:pb-0"
        >
          <button
            type="button"
            onClick={() => {
              AudioEngine.stopAll();
              setActiveTab('map');
            }}
            className={`min-h-[48px] md:h-full flex flex-col items-center justify-center gap-1 md:gap-1.5 text-[11px] md:text-xs leading-none font-display font-bold whitespace-nowrap transition-colors ${
              activeTab === 'map' ? 'text-[#FF5A00]' : 'text-[#8E95AE] hover:text-white'
            }`}
          >
            <Map className="w-[19px] h-[19px] md:w-5 md:h-5 shrink-0" />
            <span>{t.hud.map}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              AudioEngine.stopAll();
              setActiveTab('lab');
            }}
            className={`min-h-[48px] md:h-full flex flex-col items-center justify-center gap-1 md:gap-1.5 text-[11px] md:text-xs leading-none font-display font-bold whitespace-nowrap transition-colors ${
              activeTab === 'lab' ? 'text-[#FF5A00]' : 'text-[#8E95AE] hover:text-white'
            }`}
          >
            <FlaskConical className="w-[19px] h-[19px] md:w-5 md:h-5 shrink-0" />
            <span className="md:hidden">{t.hud.labShort}</span>
            <span className="hidden md:inline">{t.hud.lab}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              AudioEngine.stopAll();
              setActiveTab('rewards');
            }}
            className={`min-h-[48px] md:h-full flex flex-col items-center justify-center gap-1 md:gap-1.5 text-[11px] md:text-xs leading-none font-display font-bold whitespace-nowrap transition-colors ${
              activeTab === 'rewards' ? 'text-[#FF5A00]' : 'text-[#8E95AE] hover:text-white'
            }`}
          >
            <Award className="w-[19px] h-[19px] md:w-5 md:h-5 shrink-0" />
            <span>{t.hud.rewards}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              AudioEngine.stopAll();
              setShowDailyChallenge(true);
            }}
            className={`relative min-h-[48px] md:h-full flex flex-col items-center justify-center gap-1 md:gap-1.5 text-[11px] md:text-xs leading-none font-display font-bold whitespace-nowrap transition-colors ${
              isDailyDoneToday ? 'text-emerald-400' : 'text-[#FFB800]'
            }`}
          >
            <span className="relative">
              <Zap className="w-[19px] h-[19px] md:w-5 md:h-5 fill-current shrink-0" />
              {isDailyDoneToday ? (
                <Check className="w-2.5 h-2.5 text-emerald-300 stroke-[3] absolute -top-1 -right-2" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A00] absolute -top-0.5 -right-1.5 animate-pulse" />
              )}
            </span>
            <span>{t.hud.daily60}</span>
          </button>
        </nav>
      )}

      {/* MODALS */}
      {showDailyChallenge && (
        <DailyChallengeModal
          progress={progress}
          qaUnlockAll={qaUnlockAll}
          onCompleteDaily={handleCompleteDaily}
          onShareAchievement={setSharePayload}
          onOpenLicense={() => {
            setShowDailyChallenge(false);
            setShowLicenseModal(true);
          }}
          onClose={() => setShowDailyChallenge(false)}
        />
      )}

      {showLicenseModal && (
        <LicenseModal
          progress={progress}
          qaUnlockAll={qaUnlockAll}
          onActivateQaUnlock={handleActivateQaUnlock}
          onDeactivateQaUnlock={handleDeactivateQaUnlock}
          onChangeLicense={handleChangeLicense}
          onResetProgress={handleResetProgress}
          onClose={() => setShowLicenseModal(false)}
        />
      )}

      {sharePayload && (
        <ShareCardModal
          payload={sharePayload}
          progress={progress}
          onClose={() => setSharePayload(null)}
        />
      )}

      {/* Brief floating QA confirmation toast (never causes layout shift or scroll) */}
      {qaToast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed top-16 right-4 z-50 max-w-sm rounded-xl bg-[#14151D]/95 border border-[#FF5A00]/65 px-3.5 py-2.5 text-xs font-semibold text-white shadow-[0_12px_32px_rgba(0,0,0,0.75)] backdrop-blur-md"
        >
          {qaToast}
        </div>
      )}
    </div>
  );
}
