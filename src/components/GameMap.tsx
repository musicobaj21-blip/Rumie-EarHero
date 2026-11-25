import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AudioWaveform,
  Award,
  Check,
  Compass,
  Crown,
  Drum,
  Ear,
  Globe,
  GraduationCap,
  Headphones,
  Layers,
  Lock,
  MapPin,
  Music,
  Play,
  Share2,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
import { WORLDS, WorldEngine } from '../engines/WorldEngine';
import { getLocalizedLevel, getLocalizedWorld } from '../i18n/contentTranslations';
import { useI18n } from '../i18n/I18nContext';
import { LabModuleId, LicenseAdapter } from '../services/LicenseAdapter';
import { LevelDefinition, ShareCardPayload, UserProgress, WorldDefinition } from '../types/music';
import { MusicianCharacter, MusicianState } from './MusicianCharacter';
import { WorldAtlasView } from './WorldAtlasView';
import { WorldStageBackdrop } from './WorldStageBackdrop';

function getLabModuleForWorld(worldId: number): LabModuleId {
  switch (worldId) {
    case 2:
      return 'intervals';
    case 3:
      return 'chords';
    case 4:
      return 'scales';
    case 5:
      return 'progressions';
    case 6:
      return 'melody';
    default:
      return 'keyboard';
  }
}

export interface UnlockTransition {
  worldId: number;
  fromLevelId: string;
  toLevelId: string;
}

interface GameMapProps {
  progress: UserProgress;
  qaUnlockAll?: boolean;
  recentUnlockTransition?: UnlockTransition | null;
  onUnlockTransitionDone?: () => void;
  onStartLevel: (level: LevelDefinition) => void;
  onOpenLicense: () => void;
  onShareAchievement: (payload: ShareCardPayload) => void;
  onOpenDiploma?: () => void;
  onOpenLabModule?: (moduleId: LabModuleId) => void;
}

function renderWorldIcon(iconName: WorldDefinition['iconName'], className = 'w-4 h-4') {
  switch (iconName) {
    case 'ear':
      return <Ear className={className} />;
    case 'waves':
      return <AudioWaveform className={className} />;
    case 'layers':
      return <Layers className={className} />;
    case 'music':
      return <Music className={className} />;
    case 'compass':
      return <Compass className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'drum':
      return <Drum className={className} />;
    case 'crown':
      return <Crown className={className} />;
  }
}

/**
 * Coordinates in percentage (matching SVG viewBox 1000 x 420).
 * Top peaks (Nodes 2 & 4) sit at 46% height so the animated MusicianCharacter
 * with guitar headstock always has generous headroom and never clips or scrolls.
 */
const STAGE_COORDS: { xPct: number; yPct: number; xSvg: number; ySvg: number }[] = [
  { xPct: 12, yPct: 72, xSvg: 120, ySvg: 302 },
  { xPct: 31, yPct: 46, xSvg: 310, ySvg: 193 },
  { xPct: 50, yPct: 73, xSvg: 500, ySvg: 307 },
  { xPct: 69, yPct: 46, xSvg: 690, ySvg: 193 },
  { xPct: 87, yPct: 61, xSvg: 870, ySvg: 256 },
];

function getSegmentPathD(idx: number): string {
  const p1 = STAGE_COORDS[idx];
  const p2 = STAGE_COORDS[idx + 1];
  const cx1 = p1.xSvg + (p2.xSvg - p1.xSvg) * 0.55;
  const cy1 = p1.ySvg;
  const cx2 = p1.xSvg + (p2.xSvg - p1.xSvg) * 0.45;
  const cy2 = p2.ySvg;
  return `M ${p1.xSvg} ${p1.ySvg} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p2.xSvg} ${p2.ySvg}`;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export const GameMap: React.FC<GameMapProps> = ({
  progress,
  qaUnlockAll = false,
  recentUnlockTransition,
  onUnlockTransitionDone,
  onStartLevel,
  onOpenLicense,
  onShareAchievement,
  onOpenDiploma,
  onOpenLabModule,
}) => {
  const { lang, t } = useI18n();
  const activeLevel = useMemo(() => WorldEngine.getCurrentActiveLevel(progress), [progress]);
  const [mapViewMode, setMapViewMode] = useState<'stages' | 'atlas'>('stages');
  const [selectedWorldId, setSelectedWorldId] = useState<number>(
    recentUnlockTransition?.worldId ?? activeLevel.worldId
  );
  const [selectedLevel, setSelectedLevel] = useState<LevelDefinition>(activeLevel);
  const [stageEnterKey, setStageEnterKey] = useState<number>(0);

  // Animated Musician Protagonist state on the S-curve SVG path
  const initialIdx = useMemo(() => {
    const w = WORLDS.find((item) => item.id === (recentUnlockTransition?.worldId ?? activeLevel.worldId)) ?? WORLDS[0];
    if (recentUnlockTransition && recentUnlockTransition.worldId === w.id) {
      const fromIdx = w.levels.findIndex((l) => l.id === recentUnlockTransition.fromLevelId);
      if (fromIdx >= 0) return fromIdx;
    }
    const idx = w.levels.findIndex((l) => l.id === activeLevel.id);
    return idx >= 0 ? idx : 0;
  }, [activeLevel, recentUnlockTransition]);

  const [charNodeIdx, setCharNodeIdx] = useState<number>(initialIdx);
  const [charPos, setCharPos] = useState<{ xPct: number; yPct: number }>({
    xPct: STAGE_COORDS[initialIdx].xPct,
    yPct: STAGE_COORDS[initialIdx].yPct,
  });
  const [charState, setCharState] = useState<MusicianState>('idle');
  const [charFacing, setCharFacing] = useState<'right' | 'left'>('right');
  const [arriveKey, setArriveKey] = useState<number>(0);

  const pathRefs = useRef<(SVGPathElement | null)[]>([null, null, null, null]);
  const worldBtnRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const walkRafRef = useRef<number | null>(null);
  const celebrateTimerRef = useRef<number | null>(null);
  const charNodeIdxRef = useRef<number>(initialIdx);

  // Auto-scroll selected world pill into view on mobile carousel
  useEffect(() => {
    const el = worldBtnRefs.current[selectedWorldId];
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedWorldId]);

  const cancelWalkAnimation = useCallback(() => {
    if (walkRafRef.current !== null) {
      cancelAnimationFrame(walkRafRef.current);
      walkRafRef.current = null;
    }
    if (celebrateTimerRef.current !== null) {
      window.clearTimeout(celebrateTimerRef.current);
      celebrateTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => cancelWalkAnimation();
  }, [cancelWalkAnimation]);

  /**
   * Walks the musician smoothly along the exact SVG cubic Bézier curve segments
   * using SVGPathElement.getPointAtLength().
   */
  const walkAlongCurve = useCallback(
    (fromIdx: number, toIdx: number, celebrateOnArrival = false, onFinished?: () => void) => {
      cancelWalkAnimation();
      if (fromIdx === toIdx) {
        setCharPos({ xPct: STAGE_COORDS[toIdx].xPct, yPct: STAGE_COORDS[toIdx].yPct });
        charNodeIdxRef.current = toIdx;
        setCharNodeIdx(toIdx);
        onFinished?.();
        return;
      }

      const direction = toIdx > fromIdx ? 1 : -1;
      const steps: { segIdx: number; forward: boolean }[] = [];
      for (let i = fromIdx; i !== toIdx; i += direction) {
        steps.push({
          segIdx: direction === 1 ? i : i - 1,
          forward: direction === 1,
        });
      }

      setCharFacing(direction === 1 ? 'right' : 'left');
      setCharState('walking');

      const totalDurationMs = steps.length === 1 ? 820 : Math.min(1150, 620 + steps.length * 220);
      const startTime = performance.now();

      const tick = (now: number) => {
        const rawT = Math.min(1, (now - startTime) / totalDurationMs);
        const eased = easeInOutCubic(rawT);

        const scaled = eased * steps.length;
        const stepNumber = Math.min(steps.length - 1, Math.floor(scaled));
        const localT = Math.min(1, Math.max(0, scaled - stepNumber));
        const step = steps[stepNumber];
        const pathEl = pathRefs.current[step.segIdx];

        if (pathEl) {
          const totalLen = pathEl.getTotalLength();
          const dist = step.forward ? localT * totalLen : (1 - localT) * totalLen;
          const pt = pathEl.getPointAtLength(dist);
          setCharPos({
            xPct: (pt.x / 1000) * 100,
            yPct: (pt.y / 420) * 100,
          });
        } else {
          // Fallback linear interpolation if ref unavailable
          const startNode = step.forward ? step.segIdx : step.segIdx + 1;
          const endNode = step.forward ? step.segIdx + 1 : step.segIdx;
          const a = STAGE_COORDS[startNode];
          const b = STAGE_COORDS[endNode];
          setCharPos({
            xPct: a.xPct + (b.xPct - a.xPct) * localT,
            yPct: a.yPct + (b.yPct - a.yPct) * localT,
          });
        }

        if (rawT < 1) {
          walkRafRef.current = requestAnimationFrame(tick);
        } else {
          walkRafRef.current = null;
          charNodeIdxRef.current = toIdx;
          setCharNodeIdx(toIdx);
          setCharPos({ xPct: STAGE_COORDS[toIdx].xPct, yPct: STAGE_COORDS[toIdx].yPct });
          setCharFacing('right');

          if (celebrateOnArrival) {
            setCharState('celebrate');
            celebrateTimerRef.current = window.setTimeout(() => {
              setCharState('idle');
            }, 1350);
          } else {
            setCharState('idle');
          }
          onFinished?.();
        }
      };

      walkRafRef.current = requestAnimationFrame(tick);
    },
    [cancelWalkAnimation]
  );

  const currentWorld = useMemo(
    () => WORLDS.find((w) => w.id === selectedWorldId) ?? WORLDS[0],
    [selectedWorldId]
  );

  // Auto-walk along newly illuminated path when returning from a newly passed level!
  useEffect(() => {
    if (!recentUnlockTransition) return;
    const world = WORLDS.find((w) => w.id === recentUnlockTransition.worldId);
    if (!world) {
      onUnlockTransitionDone?.();
      return;
    }

    const fromIdx = world.levels.findIndex((l) => l.id === recentUnlockTransition.fromLevelId);
    const toIdx = world.levels.findIndex((l) => l.id === recentUnlockTransition.toLevelId);

    setMapViewMode('stages');
    setSelectedWorldId(world.id);
    if (toIdx >= 0) {
      setSelectedLevel(world.levels[toIdx]);
    }

    if (fromIdx >= 0 && toIdx >= 0 && fromIdx !== toIdx) {
      // Snap to completed node first, then walk automatically across the illuminated curve!
      charNodeIdxRef.current = fromIdx;
      setCharNodeIdx(fromIdx);
      setCharPos({ xPct: STAGE_COORDS[fromIdx].xPct, yPct: STAGE_COORDS[fromIdx].yPct });

      const startDelay = window.setTimeout(() => {
        walkAlongCurve(fromIdx, toIdx, true, () => {
          onUnlockTransitionDone?.();
        });
      }, 240);

      return () => window.clearTimeout(startDelay);
    }

    onUnlockTransitionDone?.();
  }, [recentUnlockTransition, walkAlongCurve, onUnlockTransitionDone]);

  const worldStats = WorldEngine.getWorldStats(currentWorld, progress);
  const isWorldLicenseLocked =
    !qaUnlockAll && !LicenseAdapter.canAccessWorld(currentWorld.id, progress.licensePlan);

  const selectedStatus = WorldEngine.getLevelAccessStatus(selectedLevel, progress, qaUnlockAll);
  const selectedProg = progress.levels[selectedLevel.id];
  const locCurrentWorld = getLocalizedWorld(currentWorld, lang);
  const locSelectedLevel = getLocalizedLevel(selectedLevel, lang);

  const handleSelectWorld = (world: WorldDefinition, enterStages = true) => {
    cancelWalkAnimation();
    setSelectedWorldId(world.id);

    // Find active/highest unlocked stage in this world
    let targetIdx = world.levels.findIndex(
      (l) => WorldEngine.getLevelAccessStatus(l, progress, qaUnlockAll) === 'current'
    );
    if (targetIdx < 0) {
      // If all completed in this world, stand on Boss (last) node; otherwise node 0
      const allDone = world.levels.every((l) => progress.levels[l.id]?.completed);
      targetIdx = allDone ? world.levels.length - 1 : 0;
    }

    setSelectedLevel(world.levels[targetIdx]);
    charNodeIdxRef.current = targetIdx;
    setCharNodeIdx(targetIdx);
    setCharPos({ xPct: STAGE_COORDS[targetIdx].xPct, yPct: STAGE_COORDS[targetIdx].yPct });
    setCharFacing('right');
    setCharState('idle');
    setArriveKey((k) => k + 1);
    if (enterStages) {
      if (mapViewMode !== 'stages') {
        setStageEnterKey((k) => k + 1);
      }
      setMapViewMode('stages');
    }
  };

  const handleNodeClick = (level: LevelDefinition, targetIdx: number) => {
    setSelectedLevel(level);
    const status = WorldEngine.getLevelAccessStatus(level, progress, qaUnlockAll);
    // Walk the musician smoothly along the curve if the target stage is unlocked!
    if (status === 'completed' || status === 'current' || status === 'available') {
      walkAlongCurve(charNodeIdxRef.current, targetIdx, false);
    }
  };

  const handleNodeDoubleClick = (level: LevelDefinition) => {
    const status = WorldEngine.getLevelAccessStatus(level, progress, qaUnlockAll);
    if (status === 'locked-license') {
      onOpenLicense();
    } else if (status !== 'locked-progress') {
      onStartLevel(level);
    }
  };

  // Determine whether the musician is present in the currently viewed world
  const showMusicianInWorld =
    !isWorldLicenseLocked &&
    currentWorld.levels.some((lvl) => {
      const s = WorldEngine.getLevelAccessStatus(lvl, progress, qaUnlockAll);
      return s === 'completed' || s === 'current' || s === 'available';
    });

  const mobileWorldsShort = lang === 'en' ? 'Worlds' : 'Mundos';
  const tabletWorldsShort = lang === 'en' ? '8 Worlds' : '8 Mundos';
  const compactStagesShort = lang === 'en' ? 'Stages' : 'Etapas';

  return (
    <div className="h-full w-full min-h-0 min-w-0 flex flex-col overflow-hidden select-none">
      {/* TOP WORLD SELECTOR STRIP (Mobile 40px / Tablet 46px / Desktop 54px fixed) */}
      <div className="h-[40px] md:h-[46px] lg:h-[54px] shrink-0 bg-[#0D0F18] border-b border-white/10 px-2 md:px-3 lg:px-4 flex items-center gap-1.5 md:gap-2 lg:gap-3 min-w-0">
        {/* Synchronized Atlas <-> Stages Toggle Button */}
        <button
          type="button"
          onClick={() =>
            setMapViewMode((m) => (m === 'stages' ? 'atlas' : 'stages'))
          }
          className={`h-[30px] md:h-[34px] lg:h-[38px] px-2 md:px-2.5 lg:px-3.5 rounded-lg md:rounded-xl font-display text-[11px] lg:text-xs font-extrabold inline-flex items-center gap-1 lg:gap-1.5 shrink-0 whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] ${
            mapViewMode === 'atlas'
              ? 'arcade-btn-orange text-white'
              : 'arcade-btn-dark border border-[#00E5FF]/55 text-[#00E5FF] hover:border-[#00E5FF]'
          }`}
        >
          {mapViewMode === 'atlas' ? (
            <>
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="lg:hidden">{compactStagesShort}</span>
              <span className="hidden lg:inline">{t.map.backToStages}</span>
            </>
          ) : (
            <>
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span className="md:hidden">{mobileWorldsShort}</span>
              <span className="hidden md:inline lg:hidden">{tabletWorldsShort}</span>
              <span className="hidden lg:inline">{t.map.viewAllWorlds}</span>
            </>
          )}
        </button>

        {/* Connected M1..M8 World Pills (Mobile smooth carousel / Tablet & Desktop full 8-col grid) */}
        <div className="relative flex-1 min-w-0 flex items-center">
          <div className="relative flex-1 min-w-0 flex items-center overflow-x-auto md:overflow-visible no-scrollbar scroll-smooth py-0.5 md:py-1">
            {/* Background horizontal progress connector line on desktop */}
            <div
              aria-hidden="true"
              className="hidden lg:block pointer-events-none absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[3px] bg-[#212538] rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-gradient-to-r from-[#FF5A00] via-[#FFB800] to-[#00E5FF] transition-all duration-300"
                style={{
                  width: `${Math.round(((activeLevel.worldId - 1) / 7) * 100)}%`,
                }}
              />
            </div>

            <div className="relative z-10 w-max md:w-full flex md:grid md:grid-cols-8 items-center gap-1.5 md:gap-1 lg:gap-2 pr-5 md:pr-0">
              {WORLDS.map((world) => {
                const st = WorldEngine.getWorldStats(world, progress);
                const locWorld = getLocalizedWorld(world, lang);
                const locked =
                  !qaUnlockAll && !LicenseAdapter.canAccessWorld(world.id, progress.licensePlan);
                const isSelected = mapViewMode === 'stages' && world.id === currentWorld.id;
                const isPlayerHere = world.id === activeLevel.worldId;

                return (
                  <button
                    key={world.id}
                    ref={(el) => {
                      worldBtnRefs.current[world.id] = el;
                    }}
                    type="button"
                    title={`${locWorld.title} (${st.completedCount}/5)`}
                    onClick={() => handleSelectWorld(world, true)}
                    aria-label={`${locWorld.title} (${st.completedCount}/5)`}
                    className={`relative h-[30px] md:h-[34px] lg:h-[38px] px-2 md:px-1.5 lg:px-2.5 rounded-lg md:rounded-xl flex items-center justify-between gap-1 lg:gap-1.5 shrink-0 md:shrink md:min-w-0 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00] ${
                      isSelected
                        ? 'bg-gradient-to-br from-[#2C2020] to-[#1A1620] border border-[#FF5A00] text-white shadow-[0_4px_14px_rgba(255,90,0,0.25)]'
                        : locked
                          ? 'bg-[#131520] border border-white/8 text-[#6B7280] hover:border-white/20'
                          : st.isCompleted
                            ? 'bg-[#14201D] border border-emerald-500/45 text-emerald-200 hover:border-emerald-400'
                            : 'bg-[#14151D] border border-white/12 text-[#C5CAD8] hover:bg-[#1C1E2B] hover:text-white'
                    }`}
                  >
                    {/* Player-here cyan beacon */}
                    {isPlayerHere && (
                      <span
                        title={t.map.yourLocation}
                        className="absolute -top-1 -right-1 w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-[#00E5FF] border border-[#090B11] shadow-[0_0_8px_#00E5FF]"
                      />
                    )}

                    <div className="flex items-center gap-1 lg:gap-1.5 min-w-0">
                      <span
                        className={`md:hidden lg:inline-flex ${
                          isSelected
                            ? 'text-[#FF5A00]'
                            : st.isCompleted
                              ? 'text-emerald-400'
                              : locked
                                ? 'text-[#52586D]'
                                : 'text-[#00E5FF]'
                        }`}
                      >
                        {renderWorldIcon(world.iconName, 'w-3 h-3 lg:w-3.5 lg:h-3.5')}
                      </span>
                      <span className="font-display text-[11px] lg:text-xs font-extrabold tracking-tight whitespace-nowrap">
                        M{world.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      {locked ? (
                        <Lock className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-[#6B7280]" />
                      ) : st.isCompleted ? (
                        <Check className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-emerald-400 stroke-[3]" />
                      ) : (
                        <span className="font-mono text-[9px] lg:text-[10px] tabular-nums opacity-85">
                          {st.completedCount}/5
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Soft right scroll indicator fade on mobile carousel */}
          <div
            aria-hidden="true"
            className="md:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#0D0F18] to-transparent z-20"
          />
        </div>
      </div>

      {/* SWITCH BETWEEN OVERWORLD ATLAS OF 8 WORLDS AND 5-STAGE WORLD VIEW */}
      {mapViewMode === 'atlas' ? (
        <WorldAtlasView
          progress={progress}
          qaUnlockAll={qaUnlockAll}
          initialInspectedWorldId={currentWorld.id}
          onEnterWorld={(world) => handleSelectWorld(world, true)}
          onOpenLicense={onOpenLicense}
        />
      ) : (
      /* CENTRAL STAGE + MISSION PANEL (Mobile: vertical stack | Tablet md: elastic map + mission card filling 100% height above bottom dock | Desktop lg: 7fr/3fr 2-col) */
      <div
        key={`world-stage-${stageEnterKey}`}
        className="flex-1 min-h-0 min-w-0 flex flex-col gap-2 p-2.5 md:gap-4 md:p-5 lg:p-0 lg:gap-0 lg:grid lg:grid-cols-[7fr_3fr] overflow-hidden stage-zoom-in"
      >
        {/* A) ACTIVE WORLD GAME STAGE WITH EXCLUSIVE SEMITRANSPARENT WORLD BACKDROP */}
        <section
          aria-label={locCurrentWorld.title}
          className="relative flex-1 min-h-0 min-w-0 w-full lg:h-full overflow-hidden bg-[#080A11] rounded-2xl lg:rounded-none border border-white/10 lg:border-0 flex flex-col"
        >
          {/* Exclusive Per-World Semitransparent Backdrop (z-0, strictly behind trail, nodes & musician) */}
          <WorldStageBackdrop worldId={currentWorld.id} />

          {/* Compact Stage Header Banner */}
          <div className="relative z-10 px-2.5 pt-2 md:px-5 md:pt-3.5 md:pb-1 lg:px-6 lg:pt-3.5 lg:pb-0 flex items-start justify-between gap-2 lg:gap-3 shrink-0">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 lg:gap-2">
                <span className="inline-flex items-center gap-1 lg:gap-1.5 px-2 md:px-2.5 py-0.5 rounded-md bg-[#FF5A00]/20 border border-[#FF5A00]/50 text-[10px] md:text-[11px] font-mono font-bold text-[#FF8A4C] uppercase tracking-wider">
                  {renderWorldIcon(currentWorld.iconName, 'w-3 h-3 md:w-3.5 md:h-3.5')}
                  <span>{t.map.worldOfEight(currentWorld.id)}</span>
                </span>
                {isWorldLicenseLocked && (
                  <button
                    type="button"
                    onClick={onOpenLicense}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FFB800]/15 border border-[#FFB800]/45 text-[10px] md:text-[11px] font-bold text-[#FFB800] hover:bg-[#FFB800]/25 transition-colors"
                  >
                    <Lock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    <span>{t.map.premiumBadge}</span>
                  </button>
                )}
              </div>
              <h1 className="font-display text-sm md:text-xl font-extrabold text-white tracking-tight mt-0.5 truncate">
                {locCurrentWorld.shortName}
              </h1>
              <p className="text-xs text-[#9CA3AF] truncate max-w-xl hidden md:block">
                {locCurrentWorld.subtitle}
              </p>
            </div>

            {/* World Stars & Progress Compact Counter */}
            <div className="shrink-0 flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl bg-[#14151D]/90 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-1 text-[11px] md:text-xs font-mono font-bold text-[#FFB800] tabular-nums">
                <Star className="w-3 h-3 md:w-3.5 md:h-3.5 fill-[#FFB800]" />
                <span>
                  {worldStats.earnedStars}/{worldStats.maxStars}
                </span>
              </div>
              <span className="h-3 md:h-3.5 w-px bg-white/15" aria-hidden="true" />
              <div className="text-[11px] md:text-xs font-mono font-bold text-[#00E5FF] tabular-nums">
                {worldStats.completedCount}/5
              </div>
            </div>
          </div>

          {/* 5-NODE HORIZONTAL S-CURVE ARENA + ANIMATED MUSICIAN CHARACTER (z-10 above backdrop) */}
          <div className="relative z-10 flex-1 min-h-0 w-full md:flex md:items-center md:justify-center lg:block">
            <div className="relative w-full h-full md:h-[340px] md:max-h-full lg:h-full">
            {/* SVG S-Curve Trail (measured via pathRefs for exact getPointAtLength walking!) */}
            <svg
              aria-hidden="true"
              viewBox="0 0 1000 420"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 w-full h-full"
              fill="none"
            >
              <defs>
                <linearGradient id="litPathGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FF5A00" />
                  <stop offset="50%" stopColor="#FFB800" />
                  <stop offset="100%" stopColor="#00E5FF" />
                </linearGradient>
                <filter id="pathGlow">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {currentWorld.levels.slice(0, -1).map((lvl, idx) => {
                const pathD = getSegmentPathD(idx);
                const isLit = Boolean(progress.levels[lvl.id]?.completed);

                return (
                  <g key={lvl.id}>
                    {/* Hidden/Base reference path used by SVGPathElement.getPointAtLength */}
                    <path
                      ref={(el) => {
                        pathRefs.current[idx] = el;
                      }}
                      d={pathD}
                      stroke="#1D2030"
                      strokeWidth="12"
                      strokeLinecap="round"
                    />
                    {isLit ? (
                      <>
                        <path
                          d={pathD}
                          stroke="url(#litPathGrad)"
                          strokeWidth="5"
                          strokeLinecap="round"
                          filter="url(#pathGlow)"
                        />
                        <path
                          d={pathD}
                          stroke="#FFFFFF"
                          strokeOpacity="0.65"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeDasharray="10 26"
                          className="animate-dash-flow"
                        />
                      </>
                    ) : (
                      <path
                        d={pathD}
                        stroke="#32374F"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeDasharray="8 10"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* 5 Tactile 3D Level Nodes */}
            {currentWorld.levels.map((level, idx) => {
              const coord = STAGE_COORDS[idx];
              const locLvl = getLocalizedLevel(level, lang);
              const status = WorldEngine.getLevelAccessStatus(level, progress, qaUnlockAll);
              const lp = progress.levels[level.id];
              const isSelected = selectedLevel.id === level.id;
              const isCurrent = status === 'current';
              const isAvailable = status === 'available';
              const isCompleted = status === 'completed';
              const isLocked = status === 'locked-progress' || status === 'locked-license';
              const isBoss = level.isBoss;
              const musicianStandingHere =
                showMusicianInWorld && charState !== 'walking' && charNodeIdx === idx;

              return (
                <div
                  key={level.id}
                  style={{ left: `${coord.xPct}%`, top: `${coord.yPct}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                >
                  {/* Floating Stars above completed nodes */}
                  <div className="h-4 md:h-6 flex items-end justify-center mb-0.5 md:mb-1">
                    {!musicianStandingHere && isCompleted && lp ? (
                      <div
                        className="flex items-center gap-0.5 px-1 md:px-1.5 py-0.5 rounded-full bg-[#0D0F18]/90 border border-[#FFB800]/35"
                        aria-label={t.map.starsAria(lp.stars)}
                      >
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-2.5 h-2.5 md:w-3.5 md:h-3.5 ${
                              s <= lp.stars
                                ? 'text-[#FFB800] fill-[#FFB800] drop-shadow-[0_0_5px_rgba(255,184,0,0.7)]'
                                : 'text-[#2D3145]'
                            }`}
                          />
                        ))}
                      </div>
                    ) : !musicianStandingHere && isBoss ? (
                      <span className="px-1.5 md:px-2 py-0.5 rounded-full bg-[#FFB800]/15 border border-[#FFB800]/50 text-[8px] md:text-[9px] font-mono font-bold text-[#FFB800] uppercase tracking-wider">
                        {t.map.bossTag}
                      </span>
                    ) : null}
                  </div>

                  {/* Node Button */}
                  <div className="relative flex items-center justify-center">
                    {isCurrent && (
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none absolute -inset-1.5 lg:-inset-2 border-2 border-[#FF5A00] animate-audio-ring ${
                          isBoss ? 'rounded-2xl' : 'rounded-full'
                        }`}
                      />
                    )}
                    {isBoss && !isLocked && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-2.5 lg:-inset-3 rounded-full bg-[#FFB800]/20 blur-md"
                      />
                    )}

                    {isSelected && (
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none absolute -inset-1.5 lg:-inset-2 border-2 border-[#00E5FF] shadow-[0_0_16px_rgba(0,229,255,0.55)] ${
                          isBoss ? 'rounded-2xl' : 'rounded-full'
                        }`}
                      />
                    )}

                    {isBoss ? (
                      <button
                        type="button"
                        onClick={() => handleNodeClick(level, idx)}
                        onDoubleClick={() => handleNodeDoubleClick(level)}
                        aria-label={t.map.bossAria(locLvl.title)}
                        className={`relative w-[52px] h-[48px] md:w-[78px] md:h-[72px] p-[2.5px] md:p-[3px] node-3d-boss transition-transform duration-150 active:scale-[0.97] focus-visible:outline-none ${
                          isCompleted
                            ? 'bg-gradient-to-b from-[#FFB800] via-[#FF5A00] to-[#10B981]'
                            : isCurrent || isAvailable
                              ? 'bg-gradient-to-b from-[#FFB800] via-[#FF5A00] to-[#00E5FF]'
                              : 'bg-gradient-to-b from-[#3A3F58] to-[#1E2133]'
                        }`}
                      >
                        <div
                          className={`w-full h-full node-3d-boss flex flex-col items-center justify-center ${
                            isCompleted
                              ? 'bg-gradient-to-b from-[#17332A] to-[#0F201B] text-[#FFB800]'
                              : isCurrent || isAvailable
                                ? 'bg-gradient-to-b from-[#FF6D1A] to-[#D94800] text-white'
                                : 'bg-gradient-to-b from-[#1A1C2A] to-[#11131D] text-[#5B617A]'
                          }`}
                        >
                          {isLocked ? (
                            <Lock className="w-4 h-4 md:w-6 md:h-6" />
                          ) : isCompleted ? (
                            <Crown className="w-5 h-5 md:w-7 md:h-7 fill-[#FFB800]/30" />
                          ) : (
                            <Crown className="w-5 h-5 md:w-7 md:h-7" />
                          )}
                        </div>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleNodeClick(level, idx)}
                        onDoubleClick={() => handleNodeDoubleClick(level)}
                        aria-label={t.map.levelAria(level.levelNumber, locLvl.title)}
                        className={`relative w-10 h-10 md:w-15 md:h-15 rounded-full border-[2.5px] md:border-[3px] flex items-center justify-center transition-all duration-100 focus-visible:outline-none ${
                          isCurrent || isAvailable
                            ? 'bg-gradient-to-b from-[#FF7526] to-[#FF5A00] border-[#FFE0CC] text-white node-3d-active'
                            : isCompleted
                              ? 'bg-gradient-to-b from-[#16A34A] to-[#0F764A] border-[#6EE7B7] text-white node-3d-completed'
                              : 'bg-gradient-to-b from-[#202334] to-[#141622] border-[#31364F] text-[#5C627A] node-3d-locked'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 md:w-6 md:h-6 stroke-[3]" />
                        ) : isCurrent || isAvailable ? (
                          <Play className="w-4 h-4 md:w-6 md:h-6 fill-white translate-x-0.5" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 md:w-5 md:h-5" />
                        )}

                        <span
                          className={`absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full text-[9px] md:text-[10px] font-mono font-extrabold flex items-center justify-center border border-[#090B11] ${
                            isCurrent || isAvailable
                              ? 'bg-white text-[#090B11]'
                              : isCompleted
                                ? 'bg-[#FFB800] text-[#090B11]'
                                : 'bg-[#262A3E] text-[#8E95AE]'
                          }`}
                        >
                          {level.levelNumber}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Compact Title Plate (full stage names without ellipsis on panoramic tablet md:) */}
                  <button
                    type="button"
                    onClick={() => handleNodeClick(level, idx)}
                    className={`mt-1 md:mt-2 lg:mt-1.5 px-1.5 md:px-2.5 lg:px-2 py-0.5 md:py-1 lg:py-0.5 rounded-md md:rounded-lg text-[9px] md:text-xs font-display font-bold leading-tight max-w-[66px] sm:max-w-[84px] md:max-w-[146px] lg:max-w-[126px] line-clamp-2 md:line-clamp-none md:whitespace-normal lg:truncate border text-center transition-colors ${
                      isSelected
                        ? 'bg-[#1C1F30] border-[#00E5FF]/60 text-white'
                        : isLocked
                          ? 'bg-[#0D0F18]/80 border-white/5 text-[#6B7280]'
                          : 'bg-[#0D0F18]/85 border-white/10 text-white/90 hover:border-white/25'
                    }`}
                  >
                    {locLvl.shortTitle}
                  </button>
                </div>
              );
            })}

            {/* ===== ANIMATED PROTAGONIST ("EL VIAJERO MUSICAL RUMIE") ===== */}
            {showMusicianInWorld && (
              <div
                key={`world-arrive-${arriveKey}`}
                style={{
                  left: `${charPos.xPct}%`,
                  top: `${charPos.yPct}%`,
                }}
                className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[118%] md:-translate-y-[128%] char-arrive"
              >
                <div className="md:hidden">
                  <MusicianCharacter
                    state={charState}
                    facing={charFacing}
                    size={46}
                    showGroundGlow={true}
                    showNotes={charState === 'idle'}
                  />
                </div>
                <div className="hidden md:block lg:hidden">
                  <MusicianCharacter
                    state={charState}
                    facing={charFacing}
                    size={72}
                    showGroundGlow={true}
                    showNotes={charState === 'idle'}
                  />
                </div>
                <div className="hidden lg:block">
                  <MusicianCharacter
                    state={charState}
                    facing={charFacing}
                    size={76}
                    showGroundGlow={true}
                    showNotes={charState === 'idle'}
                  />
                </div>
              </div>
            )}
            </div>
          </div>
        </section>

        {/* B1) TABLET VERTICAL COMPACT 12-COL MISSION CONSOLE (strictly md: 768px - 1023px) */}
        {(() => {
          const isWorldMedalUnlocked = progress.unlockedMedals.includes(
            currentWorld.rewardMedalId
          );

          return (
            <aside className="hidden md:grid lg:hidden w-full shrink-0 min-w-0 bg-[#12141E] rounded-2xl border border-white/10 p-5 grid-cols-12 gap-5 items-center overflow-hidden">
              {/* Left Column (7 cols): Badge, Title, Description, Pass/Best Score, World Medal */}
              <div className="col-span-7 min-w-0 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1C1F2E] border border-white/10 text-xs font-mono font-bold text-[#00E5FF] uppercase tracking-wider truncate">
                    {selectedLevel.isBoss
                      ? t.map.bossWorldTag(selectedLevel.worldId)
                      : t.map.worldLevelTag(selectedLevel.worldId, selectedLevel.levelNumber)}
                  </span>
                  {selectedProg?.completed && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      {t.map.completedBadge}
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="font-display text-2xl font-extrabold text-white leading-tight">
                    {locSelectedLevel.title}
                  </h2>
                  <p className="text-sm text-[#9CA3AF] mt-1 leading-snug line-clamp-2">
                    {locSelectedLevel.description}
                  </p>
                </div>

                {selectedProg && selectedProg.attempts > 0 ? (
                  <div className="rounded-xl bg-[#1A1C28] border border-white/8 px-3.5 py-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#9CA3AF] block">{t.map.bestScore}</span>
                      <span className="font-mono text-base font-extrabold text-white tabular-nums">
                        {t.map.accuracySuffix(selectedProg.bestAccuracy)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= selectedProg.stars
                              ? 'text-[#FFB800] fill-[#FFB800]'
                              : 'text-[#32364A]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-[#1A1C28]/70 border border-white/6 px-3.5 py-2.5 flex items-center justify-between">
                    <span className="text-xs text-[#9CA3AF]">{t.map.passRequired}</span>
                    <span className="font-mono text-xs font-bold text-[#00E5FF]">
                      {t.map.passThreshold}
                    </span>
                  </div>
                )}

                <div
                  className={`rounded-xl bg-gradient-to-r from-[#1A1C29] to-[#1E1A22] border px-3.5 py-2.5 flex items-center justify-between gap-2 ${
                    isWorldMedalUnlocked
                      ? 'border-[#FFB800]/65 shadow-[0_0_16px_rgba(255,184,0,0.16)]'
                      : 'border-[#FFB800]/25'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isWorldMedalUnlocked
                          ? 'bg-gradient-to-b from-[#FFD452] to-[#FF5A00] text-[#090B11]'
                          : 'bg-[#FFB800]/15 border border-[#FFB800]/40 text-[#FFB800]'
                      }`}
                    >
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] font-mono uppercase text-[#FFB800]">
                        {t.map.worldMedal(currentWorld.id)}
                      </span>
                      <span className="block text-sm font-bold text-white truncate">
                        {locCurrentWorld.rewardTitle}
                      </span>
                    </div>
                  </div>
                  {isWorldMedalUnlocked && (
                    <button
                      type="button"
                      onClick={() =>
                        onShareAchievement({
                          badgeType: 'world',
                          categoryTag: t.shareCard.worldMedalCategory(currentWorld.id),
                          title: locCurrentWorld.rewardTitle,
                          subtitle: locCurrentWorld.title,
                        })
                      }
                      title={t.shareCard.shareOrDownloadBtn}
                      className="h-8 px-2.5 rounded-lg bg-[#14151D] hover:bg-[#FF5A00] border border-[#FFB800]/45 hover:border-[#FF5A00] text-[#FFB800] hover:text-white text-[11px] font-display font-bold inline-flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{t.shareCard.shareShortBtn}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column (5 cols): 3 Stat Tiles, Recommended Drill, Primary Play Mission CTA */}
              <div className="col-span-5 min-w-0 flex flex-col gap-3">
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="rounded-xl bg-[#1A1C28] border border-white/8 px-2.5 py-3 text-center">
                    <span className="block text-[10px] text-[#8E95AE] uppercase font-mono">
                      {t.map.challengesLabel}
                    </span>
                    <span className="font-mono text-base font-bold text-white tabular-nums">
                      {selectedLevel.questionCount}
                    </span>
                  </div>
                  <div className="rounded-xl bg-[#1A1C28] border border-white/8 px-2.5 py-3 text-center">
                    <span className="block text-[10px] text-[#8E95AE] uppercase font-mono">
                      {t.map.timeLabel}
                    </span>
                    <span className="font-mono text-base font-bold text-white tabular-nums">
                      {locSelectedLevel.estimatedMinutes}
                    </span>
                  </div>
                  <div className="rounded-xl bg-[#1A1C28] border border-[#FF5A00]/30 px-2.5 py-3 text-center">
                    <span className="block text-[10px] text-[#FF8A4C] uppercase font-mono">
                      {t.map.rewardLabel}
                    </span>
                    <span className="font-mono text-base font-bold text-[#FF5A00] tabular-nums inline-flex items-center justify-center gap-0.5">
                      <Zap className="w-3.5 h-3.5" />+{selectedLevel.baseXp}
                    </span>
                  </div>
                </div>

                {selectedStatus === 'locked-license' ? (
                  <button
                    type="button"
                    onClick={onOpenLicense}
                    className="w-full py-4 rounded-2xl arcade-btn-gold text-[#090B11] font-display font-extrabold text-base tracking-wide inline-flex items-center justify-center gap-2"
                  >
                    <Crown className="w-5 h-5" />
                    <span>{t.map.unlockPremium}</span>
                  </button>
                ) : selectedStatus === 'locked-progress' ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-4 rounded-2xl bg-[#1B1D2B] border border-white/10 text-[#6B7280] font-display font-bold text-sm inline-flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{t.map.passPrevious}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onStartLevel(selectedLevel)}
                    className="w-full py-4 rounded-2xl arcade-btn-orange text-white font-display font-extrabold text-base tracking-wide inline-flex items-center justify-center gap-2.5"
                  >
                    <Play className="w-5 h-5 fill-white" />
                    <span>
                      {selectedStatus === 'completed' ? t.map.replayMission : t.map.playMission}
                    </span>
                  </button>
                )}
              </div>
            </aside>
          );
        })()}

        {/* B2) MOBILE (< 768px) & DESKTOP (>= 1024px) ARCADE MISSION CONSOLE PANEL */}
        <aside className="flex md:hidden lg:flex shrink-0 lg:h-full lg:min-h-0 min-w-0 bg-[#12141E] rounded-2xl lg:rounded-none border border-white/10 lg:border-0 lg:border-l lg:border-white/10 p-2.5 lg:p-3.5 flex-col justify-between gap-2 overflow-hidden">
          <div className="space-y-1.5 lg:space-y-2 min-h-0 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 px-2 lg:px-2.5 py-0.5 lg:py-1 rounded-md lg:rounded-lg bg-[#1C1F2E] border border-white/10 text-[10px] lg:text-[11px] font-mono font-bold text-[#00E5FF] uppercase tracking-wider truncate">
                {selectedLevel.isBoss
                  ? t.map.bossWorldTag(selectedLevel.worldId)
                  : t.map.worldLevelTag(selectedLevel.worldId, selectedLevel.levelNumber)}
              </span>

              {selectedProg?.completed && (
                <span className="inline-flex items-center gap-1 text-[10px] lg:text-[11px] font-bold text-emerald-400 shrink-0">
                  <Check className="w-3 h-3 lg:w-3.5 lg:h-3.5 stroke-[3]" />
                  {t.map.completedBadge}
                </span>
              )}
            </div>

            <div>
              <h2 className="font-display text-sm sm:text-base lg:text-lg font-extrabold text-white leading-tight truncate lg:whitespace-normal">
                {locSelectedLevel.title}
              </h2>
              <p className="text-[11px] lg:text-xs text-[#9CA3AF] mt-0.5 lg:mt-1 leading-snug line-clamp-2">
                {locSelectedLevel.description}
              </p>
            </div>

            {/* Compact stats row */}
            <div className="grid grid-cols-3 gap-1.5 lg:gap-2">
              <div className="rounded-lg lg:rounded-xl bg-[#1A1C28] border border-white/8 px-2 py-1 lg:px-2.5 lg:py-2 text-center">
                <span className="block text-[9px] lg:text-[10px] text-[#8E95AE] uppercase font-mono">
                  {t.map.challengesLabel}
                </span>
                <span className="font-mono text-[11px] lg:text-sm font-bold text-white tabular-nums">
                  {selectedLevel.questionCount}
                </span>
              </div>
              <div className="rounded-lg lg:rounded-xl bg-[#1A1C28] border border-white/8 px-2 py-1 lg:px-2.5 lg:py-2 text-center">
                <span className="block text-[9px] lg:text-[10px] text-[#8E95AE] uppercase font-mono">
                  {t.map.timeLabel}
                </span>
                <span className="font-mono text-[11px] lg:text-sm font-bold text-white tabular-nums">
                  {locSelectedLevel.estimatedMinutes}
                </span>
              </div>
              <div className="rounded-lg lg:rounded-xl bg-[#1A1C28] border border-[#FF5A00]/30 px-2 py-1 lg:px-2.5 lg:py-2 text-center">
                <span className="block text-[9px] lg:text-[10px] text-[#FF8A4C] uppercase font-mono">
                  {t.map.rewardLabel}
                </span>
                <span className="font-mono text-[11px] lg:text-sm font-bold text-[#FF5A00] tabular-nums inline-flex items-center justify-center gap-0.5">
                  <Zap className="w-2.5 h-2.5 lg:w-3 lg:h-3" />+{selectedLevel.baseXp}
                </span>
              </div>
            </div>

            {/* Mobile compact World Medal strip */}
            {(() => {
              const isWorldMedalUnlocked = progress.unlockedMedals.includes(
                currentWorld.rewardMedalId
              );
              return (
                <div className="flex lg:hidden items-center justify-between gap-2 rounded-lg bg-[#1A1C29]/90 border border-[#FFB800]/25 px-2.5 py-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <Award className="w-3.5 h-3.5 text-[#FFB800] shrink-0" />
                    <span className="text-[11px] font-bold text-white truncate">
                      {locCurrentWorld.rewardTitle}
                    </span>
                  </div>
                  {isWorldMedalUnlocked ? (
                    <button
                      type="button"
                      onClick={() =>
                        onShareAchievement({
                          badgeType: 'world',
                          categoryTag: t.shareCard.worldMedalCategory(currentWorld.id),
                          title: locCurrentWorld.rewardTitle,
                          subtitle: locCurrentWorld.title,
                        })
                      }
                      className="h-6 px-2 rounded-md bg-[#14151D] border border-[#FFB800]/45 text-[#FFB800] text-[10px] font-display font-bold inline-flex items-center gap-1 shrink-0"
                    >
                      <Share2 className="w-2.5 h-2.5" />
                      <span>{t.shareCard.shareShortBtn}</span>
                    </button>
                  ) : (
                    <span className="text-[9px] font-mono text-[#FFB800]/80 uppercase shrink-0">
                      {t.map.worldMedal(currentWorld.id)}
                    </span>
                  )}
                </div>
              );
            })()}

            {/* Desktop Secondary Mission Cards (3 Compact Twin Cards: World Medal + Diploma + Lab Pre-Practice) */}
            <div className="hidden lg:flex lg:flex-col lg:gap-2">
              {selectedProg && selectedProg.attempts > 0 ? (
                <div className="rounded-xl bg-[#1A1C28] border border-white/8 px-3 py-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#9CA3AF] block">{t.map.bestScore}</span>
                    <span className="font-mono text-sm font-extrabold text-white tabular-nums">
                      {t.map.accuracySuffix(selectedProg.bestAccuracy)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= selectedProg.stars
                            ? 'text-[#FFB800] fill-[#FFB800]'
                            : 'text-[#32364A]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-[#1A1C28]/70 border border-white/6 px-3 py-2 flex items-center justify-between">
                  <span className="text-xs text-[#9CA3AF]">{t.map.passRequired}</span>
                  <span className="font-mono text-xs font-bold text-[#00E5FF]">
                    {t.map.passThreshold}
                  </span>
                </div>
              )}

              {/* 1) World Medal Twin Card */}
              {(() => {
                const isWorldMedalUnlocked = progress.unlockedMedals.includes(
                  currentWorld.rewardMedalId
                );
                return (
                  <div
                    className={`rounded-xl bg-gradient-to-r from-[#1A1C29] to-[#1E1A22] border px-3.5 py-2.5 max-h-[58px] flex items-center justify-between gap-2 shrink-0 ${
                      isWorldMedalUnlocked
                        ? 'border-[#FFB800]/65 shadow-[0_0_16px_rgba(255,184,0,0.16)]'
                        : 'border-[#FFB800]/25'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isWorldMedalUnlocked
                            ? 'bg-gradient-to-b from-[#FFD452] to-[#FF5A00] text-[#090B11]'
                            : 'bg-[#FFB800]/15 border border-[#FFB800]/40 text-[#FFB800]'
                        }`}
                      >
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10px] font-mono uppercase text-[#FFB800] leading-none">
                          {t.map.worldMedal(currentWorld.id)}
                        </span>
                        <span className="block text-xs font-bold text-white truncate mt-0.5 leading-tight">
                          {locCurrentWorld.rewardTitle}
                        </span>
                      </div>
                    </div>
                    {isWorldMedalUnlocked && (
                      <button
                        type="button"
                        onClick={() =>
                          onShareAchievement({
                            badgeType: 'world',
                            categoryTag: t.shareCard.worldMedalCategory(currentWorld.id),
                            title: locCurrentWorld.rewardTitle,
                            subtitle: locCurrentWorld.title,
                          })
                        }
                        title={t.shareCard.shareOrDownloadBtn}
                        className="h-7 px-2 rounded-lg bg-[#14151D] hover:bg-[#FF5A00] border border-[#FFB800]/45 hover:border-[#FF5A00] text-[#FFB800] hover:text-white text-[10px] font-display font-bold inline-flex items-center gap-1 shrink-0 transition-colors"
                      >
                        <Share2 className="w-3 h-3" />
                        <span>{t.shareCard.shareShortBtn}</span>
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* 2) Official Diploma Twin Card (max 58px) */}
              {(() => {
                const completedTotal = Object.values(progress.levels).filter(
                  (l) => l.completed
                ).length;
                const diplomaPct = Math.min(100, Math.round((completedTotal / 40) * 100));
                return (
                  <button
                    type="button"
                    onClick={() => onOpenDiploma?.()}
                    className="hidden lg:flex w-full max-h-[58px] items-center gap-3 py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/25 cursor-pointer hover:border-amber-400/50 transition text-left shrink-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-[10px] uppercase tracking-wider text-amber-400 font-semibold leading-none truncate">
                        {t.map.finalGoalDiplomaLabel}
                      </span>
                      <div className="flex items-center justify-between gap-2 text-xs font-bold text-white mt-0.5 leading-tight">
                        <span className="truncate">{t.map.diplomaCardTitle}</span>
                        <span className="font-mono text-[11px] font-extrabold text-amber-300 tabular-nums shrink-0">
                          {completedTotal}/40
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-white/10 mt-1 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-[#FF5A00] transition-all duration-300"
                          style={{ width: `${diplomaPct}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })()}

              {/* 3) Pre-Practice Laboratory Twin Card (exact same ~54-58px footprint, cyan accent) */}
              <button
                type="button"
                onClick={() => onOpenLabModule?.(getLabModuleForWorld(currentWorld.id))}
                className="hidden lg:flex w-full max-h-[58px] items-center gap-3 py-2.5 px-3.5 rounded-xl bg-cyan-500/[0.07] border border-cyan-500/25 cursor-pointer hover:border-cyan-400/50 transition text-left shrink-0"
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 flex items-center justify-center shrink-0">
                  <Headphones className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[10px] uppercase tracking-wider text-cyan-400 font-semibold leading-none truncate">
                    {t.map.labPracticeLabel}
                  </span>
                  <div className="flex items-center justify-between gap-2 text-xs font-bold text-white mt-0.5 leading-tight">
                    <span className="truncate">
                      {t.map.labPracticeByWorld[currentWorld.id] ?? t.map.labPracticeByWorld[1]}
                    </span>
                    <span className="text-cyan-400 font-extrabold shrink-0">→</span>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="pt-0.5 lg:mt-auto lg:pt-1 pb-0.5 lg:pb-0 shrink-0">
            {selectedStatus === 'locked-license' ? (
              <button
                type="button"
                onClick={onOpenLicense}
                className="w-full h-11 lg:h-12 rounded-xl lg:rounded-2xl arcade-btn-gold text-[#090B11] font-display font-extrabold text-xs sm:text-sm lg:text-base tracking-wide inline-flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4 lg:w-5 lg:h-5" />
                <span>{t.map.unlockPremium}</span>
              </button>
            ) : selectedStatus === 'locked-progress' ? (
              <button
                type="button"
                disabled
                className="w-full h-11 lg:h-12 rounded-xl lg:rounded-2xl bg-[#1B1D2B] border border-white/10 text-[#6B7280] font-display font-bold text-xs lg:text-sm inline-flex items-center justify-center gap-2 cursor-not-allowed"
              >
                <Lock className="w-4 h-4" />
                <span>{t.map.passPrevious}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onStartLevel(selectedLevel)}
                className="w-full h-11 lg:h-12 rounded-xl lg:rounded-2xl arcade-btn-orange text-white font-display font-extrabold text-xs sm:text-sm lg:text-base tracking-wide inline-flex items-center justify-center gap-2 lg:gap-2.5"
              >
                <Play className="w-4 h-4 lg:w-5 lg:h-5 fill-white" />
                <span>
                  {selectedStatus === 'completed' ? t.map.replayMission : t.map.playMission}
                </span>
              </button>
            )}
          </div>
        </aside>
      </div>
      )}
    </div>
  );
};
