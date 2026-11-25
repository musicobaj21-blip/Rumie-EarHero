import React, { useMemo, useState } from 'react';
import {
  AudioWaveform,
  Award,
  Check,
  Compass,
  Crown,
  Drum,
  Ear,
  Layers,
  Lock,
  Music,
  Play,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react';
import { WORLDS, WorldEngine } from '../engines/WorldEngine';
import { getLocalizedLevel, getLocalizedWorld } from '../i18n/contentTranslations';
import { useI18n } from '../i18n/I18nContext';
import { LicenseAdapter } from '../services/LicenseAdapter';
import { UserProgress, WorldDefinition } from '../types/music';
import { GalacticMapBackdrop } from './GalacticMapBackdrop';
import { MusicianCharacter } from './MusicianCharacter';

interface WorldAtlasViewProps {
  progress: UserProgress;
  qaUnlockAll?: boolean;
  initialInspectedWorldId: number;
  onEnterWorld: (world: WorldDefinition) => void;
  onOpenLicense: () => void;
}

/**
 * Serpentine 8-Island coordinates matching SVG viewBox="0 0 1000 460":
 * Top row (L -> R): M1 -> M2 -> M3 -> M4
 * Right sweeping U-turn descending into bottom row (R -> L): M5 -> M6 -> M7 -> M8 (Final Boss)
 */
const ATLAS_COORDS: { xPct: number; yPct: number; xSvg: number; ySvg: number }[] = [
  { xPct: 14, yPct: 34, xSvg: 140, ySvg: 156 }, // M1
  { xPct: 38, yPct: 30, xSvg: 380, ySvg: 138 }, // M2
  { xPct: 62, yPct: 34, xSvg: 620, ySvg: 156 }, // M3
  { xPct: 85, yPct: 31, xSvg: 850, ySvg: 143 }, // M4
  { xPct: 85, yPct: 74, xSvg: 850, ySvg: 340 }, // M5
  { xPct: 62, yPct: 77, xSvg: 620, ySvg: 354 }, // M6
  { xPct: 38, yPct: 73, xSvg: 380, ySvg: 336 }, // M7
  { xPct: 14, yPct: 75, xSvg: 140, ySvg: 345 }, // M8 (Final Boss)
];

function getAtlasSegmentControlPoints(fromIdx: number) {
  const a = ATLAS_COORDS[fromIdx];
  const b = ATLAS_COORDS[fromIdx + 1];

  // Sweeping descending right-hand curve from World 4 -> World 5
  if (fromIdx === 3) {
    return {
      x0: a.xSvg,
      y0: a.ySvg,
      cx1: 975,
      cy1: a.ySvg + 10,
      cx2: 975,
      cy2: b.ySvg - 10,
      x1: b.xSvg,
      y1: b.ySvg,
    };
  }

  const cx1 = a.xSvg + (b.xSvg - a.xSvg) * 0.5;
  const cy1 = a.ySvg;
  const cx2 = a.xSvg + (b.xSvg - a.xSvg) * 0.5;
  const cy2 = b.ySvg;
  return { x0: a.xSvg, y0: a.ySvg, cx1, cy1, cx2, cy2, x1: b.xSvg, y1: b.ySvg };
}

function getAtlasSegmentPath(fromIdx: number): string {
  const { x0, y0, cx1, cy1, cx2, cy2, x1, y1 } = getAtlasSegmentControlPoints(fromIdx);
  return `M ${x0} ${y0} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x1} ${y1}`;
}

function evalCubicBezier(
  segIdx: number,
  t: number
): { x: number; y: number } {
  const { x0, y0, cx1, cy1, cx2, cy2, x1, y1 } = getAtlasSegmentControlPoints(segIdx);
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;
  return {
    x: uuu * x0 + 3 * uu * t * cx1 + 3 * u * tt * cx2 + ttt * x1,
    y: uuu * y0 + 3 * uu * t * cy1 + 3 * u * tt * cy2 + ttt * y1,
  };
}

/** Precomputed cosmic sparks distributed along the 7 serpentine trail segments */
const TRAIL_SPARKS = Array.from({ length: 7 }, (_, segIdx) => {
  const ts = segIdx === 3 ? [0.18, 0.34, 0.5, 0.66, 0.82] : [0.24, 0.5, 0.76];
  return ts.map((t, k) => {
    const pt = evalCubicBezier(segIdx, t);
    // Subtle perpendicular shimmer offset
    const offsetY = (k % 2 === 0 ? -1 : 1) * (segIdx === 3 ? 0 : 4.5);
    const offsetX = segIdx === 3 ? (k % 2 === 0 ? 5 : -5) : 0;
    return {
      segIdx,
      key: `${segIdx}-${k}`,
      x: Number((pt.x + offsetX).toFixed(1)),
      y: Number((pt.y + offsetY).toFixed(1)),
      r: k === 1 ? 2.6 : 1.9,
      dur: `${(2.2 + ((segIdx * 3 + k) % 5) * 0.45).toFixed(2)}s`,
      delay: `${(((segIdx * 7 + k * 5) % 11) * 0.32).toFixed(2)}s`,
    };
  });
}).flat();

function renderWorldIcon(iconName: WorldDefinition['iconName'], className = 'w-5 h-5') {
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

type WorldStatus = 'completed' | 'active' | 'locked-progress' | 'locked-premium';

function getWorldVisualStatus(
  world: WorldDefinition,
  activeWorldId: number,
  progress: UserProgress,
  qaUnlockAll = false
): WorldStatus {
  const stats = WorldEngine.getWorldStats(world, progress);
  if (stats.isCompleted) return 'completed';
  if (qaUnlockAll) return 'active';
  if (!LicenseAdapter.canAccessWorld(world.id, progress.licensePlan)) {
    return 'locked-premium';
  }
  if (world.id === activeWorldId || stats.completedCount > 0) {
    return 'active';
  }
  // Check if previous world is completed
  if (world.id === 1) return 'active';
  const prevWorld = WORLDS.find((w) => w.id === world.id - 1);
  if (prevWorld && WorldEngine.getWorldStats(prevWorld, progress).isCompleted) {
    return 'active';
  }
  return 'locked-progress';
}

export const WorldAtlasView: React.FC<WorldAtlasViewProps> = ({
  progress,
  qaUnlockAll = false,
  initialInspectedWorldId,
  onEnterWorld,
  onOpenLicense,
}) => {
  const { lang, t } = useI18n();
  const activeLevel = useMemo(() => WorldEngine.getCurrentActiveLevel(progress), [progress]);
  const [inspectedWorldId, setInspectedWorldId] = useState<number>(initialInspectedWorldId);

  const inspectedWorld = useMemo(
    () => WORLDS.find((w) => w.id === inspectedWorldId) ?? WORLDS[0],
    [inspectedWorldId]
  );

  const completedTotal = useMemo(
    () => Object.values(progress.levels).filter((l) => l.completed).length,
    [progress.levels]
  );
  const remainingTotal = Math.max(0, 40 - completedTotal);

  const inspectedStatus = getWorldVisualStatus(
    inspectedWorld,
    activeLevel.worldId,
    progress,
    qaUnlockAll
  );
  const inspectedStats = WorldEngine.getWorldStats(inspectedWorld, progress);
  const hasInspectedMedal = progress.unlockedMedals.includes(inspectedWorld.rewardMedalId);
  const locInspected = getLocalizedWorld(inspectedWorld, lang);
  const subParts = t.atlas.subtitle(activeLevel.worldId, completedTotal);

  const statusMeta: Record<
    WorldStatus,
    { label: string; colorClass: string; badgeClass: string }
  > = {
    completed: {
      label: t.atlas.statusCompleted,
      colorClass: 'text-emerald-400',
      badgeClass: 'bg-emerald-500/15 border-emerald-400/45 text-emerald-300',
    },
    active: {
      label: t.atlas.statusActive,
      colorClass: 'text-[#FF5A00]',
      badgeClass: 'bg-[#FF5A00]/20 border-[#FF5A00]/50 text-[#FF8A4C]',
    },
    'locked-progress': {
      label: t.atlas.statusLockedProgress,
      colorClass: 'text-[#9CA3AF]',
      badgeClass: 'bg-white/8 border-white/15 text-[#C5CAD8]',
    },
    'locked-premium': {
      label: t.atlas.statusLockedPremium,
      colorClass: 'text-[#FFB800]',
      badgeClass: 'bg-[#FFB800]/15 border-[#FFB800]/45 text-[#FFB800]',
    },
  };

  return (
    <div className="flex-1 min-h-0 min-w-0 flex flex-col gap-2 p-2.5 md:gap-4 md:p-5 lg:p-0 lg:gap-0 lg:grid lg:grid-cols-[7fr_3fr] overflow-hidden stage-zoom-in">
      {/* A) 8-WORLD OVERWORLD STAGE WITH IMMERSIVE GALACTIC BACKDROP */}
      <section
        aria-label={t.atlas.ariaLabel}
        className="relative flex-1 min-h-0 min-w-0 w-full lg:h-full overflow-hidden bg-[#05070E] rounded-2xl lg:rounded-none border border-white/10 lg:border-0 flex flex-col"
      >
        {/* Layered Cosmic Nebula, Filaments, Stars, Constellations & Translucent Musical Symbols */}
        <GalacticMapBackdrop />

        {/* INTEGRATED ATLAS EXPEDITION HEADER */}
        <div className="relative z-10 px-3 pt-2 md:px-5 md:pt-3.5 md:pb-1 lg:px-6 lg:pt-3.5 lg:pb-0 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="font-display text-sm md:text-xl font-extrabold text-white tracking-tight truncate">
                {t.atlas.title}
              </h1>
              <p className="text-[10px] md:text-xs text-[#C5CAD8] mt-0.5 truncate">
                {subParts.prefix}
                <strong className="text-[#FF5A00]">{subParts.worldHighlight}</strong>
                {subParts.mid}
                <strong className="text-white font-mono tabular-nums">{completedTotal}</strong>
                {subParts.suffix}{' '}
                <span className="hidden sm:inline text-[#9CA3AF]">
                  (
                  {remainingTotal > 0
                    ? t.atlas.remainingHint(remainingTotal)
                    : t.atlas.completedHint}
                  )
                </span>
              </p>
            </div>

            {/* 8-Segment Expedition Progress Bar + Trophy Goal */}
            <div className="hidden sm:flex items-center gap-1.5 lg:gap-2 shrink-0 bg-[#14151D]/90 border border-white/10 rounded-xl px-2 lg:px-2.5 py-1 lg:py-1.5">
              <div className="flex items-center gap-1" aria-label={t.atlas.progressBarAria}>
                {WORLDS.map((w) => {
                  const st = WorldEngine.getWorldStats(w, progress);
                  const wStatus = getWorldVisualStatus(w, activeLevel.worldId, progress, qaUnlockAll);
                  const locW = getLocalizedWorld(w, lang);
                  return (
                    <button
                      key={w.id}
                      type="button"
                      title={`${locW.title} (${st.completedCount}/5)`}
                      onClick={() => setInspectedWorldId(w.id)}
                      className={`w-3.5 lg:w-5 h-2 rounded-full transition-all ${
                        wStatus === 'completed'
                          ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]'
                          : wStatus === 'active'
                            ? 'bg-[#FF5A00] shadow-[0_0_8px_rgba(255,90,0,0.75)]'
                            : 'bg-[#262A3E] hover:bg-[#383E59]'
                      }`}
                    />
                  );
                })}
              </div>
              <div
                title={t.atlas.finalGoalTitle}
                className={`w-5 h-5 lg:w-6 lg:h-6 rounded-lg flex items-center justify-center ${
                  progress.diplomaUnlockedAt
                    ? 'bg-[#FFB800] text-[#090B11] shadow-[0_0_12px_rgba(255,184,0,0.6)]'
                    : 'bg-[#1C1F2E] text-[#FFB800]'
                }`}
              >
                <Trophy className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* SERPENTINE 8-WORLD INTERACTIVE OVERWORLD CANVAS */}
        <div className="relative flex-1 min-h-0 w-full md:flex md:items-center md:justify-center lg:block">
          <div className="relative w-full h-full md:h-[380px] md:max-h-full lg:h-full">
          {/* Grand Serpentine SVG Trail connecting M1 -> M8 */}
          <svg
            aria-hidden="true"
            viewBox="0 0 1000 460"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 w-full h-full"
            fill="none"
          >
            <defs>
              <linearGradient id="atlasLitGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FF5A00" />
                <stop offset="55%" stopColor="#FFB800" />
                <stop offset="100%" stopColor="#00E5FF" />
              </linearGradient>
              <filter id="atlasGlow">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {WORLDS.slice(0, -1).map((world, idx) => {
              const d = getAtlasSegmentPath(idx);
              const reachedNext =
                WorldEngine.getWorldStats(world, progress).isCompleted ||
                world.id < activeLevel.worldId;

              return (
                <g key={world.id}>
                  <path
                    d={d}
                    stroke="#0F1424"
                    strokeOpacity="0.88"
                    strokeWidth="13"
                    strokeLinecap="round"
                  />
                  {reachedNext ? (
                    <>
                      <path
                        d={d}
                        stroke="url(#atlasLitGrad)"
                        strokeWidth="5"
                        strokeLinecap="round"
                        filter="url(#atlasGlow)"
                      />
                      <path
                        d={d}
                        stroke="#FFFFFF"
                        strokeOpacity="0.72"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeDasharray="10 26"
                        className="animate-dash-flow"
                      />
                    </>
                  ) : (
                    <>
                      <path
                        d={d}
                        stroke="#FFB84D"
                        strokeOpacity="0.16"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                      <path
                        d={d}
                        stroke="#495478"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeDasharray="8 10"
                      />
                    </>
                  )}
                </g>
              );
            })}

            {/* Starlight Energy Sparks along the Serpentine 8-World Trail */}
            <g filter="url(#atlasGlow)">
              {TRAIL_SPARKS.map((spark) => {
                const segWorld = WORLDS[spark.segIdx];
                const isLitSeg =
                  WorldEngine.getWorldStats(segWorld, progress).isCompleted ||
                  segWorld.id < activeLevel.worldId;

                return (
                  <g
                    key={spark.key}
                    className="trail-spark-pulse"
                    style={
                      {
                        '--spark-dur': spark.dur,
                        '--spark-delay': spark.delay,
                      } as React.CSSProperties
                    }
                  >
                    <circle
                      cx={spark.x}
                      cy={spark.y}
                      r={isLitSeg ? spark.r * 2.4 : spark.r * 1.8}
                      fill={isLitSeg ? '#FF5A00' : '#FFB84D'}
                      fillOpacity={isLitSeg ? 0.36 : 0.22}
                    />
                    <circle
                      cx={spark.x}
                      cy={spark.y}
                      r={isLitSeg ? spark.r : spark.r * 0.85}
                      fill={isLitSeg ? '#FFF0C2' : '#FFB84D'}
                      fillOpacity={isLitSeg ? 0.95 : 0.68}
                    />
                  </g>
                );
              })}
            </g>
          </svg>

          {/* 8 Musical World Islands */}
          {WORLDS.map((world, idx) => {
            const coord = ATLAS_COORDS[idx];
            const stats = WorldEngine.getWorldStats(world, progress);
            const status = getWorldVisualStatus(world, activeLevel.worldId, progress, qaUnlockAll);
            const locWorld = getLocalizedWorld(world, lang);
            const isPlayerHere = world.id === activeLevel.worldId;
            const isInspected = world.id === inspectedWorld.id;
            const isFinalBossWorld = world.id === 8;

            return (
              <div
                key={world.id}
                style={{ left: `${coord.xPct}%`, top: `${coord.yPct}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
              >
                {isPlayerHere && (
                  <div className="pointer-events-none absolute -top-[42px] md:-top-[62px] lg:-top-[66px] left-1/2 -translate-x-1/2 z-30 char-arrive">
                    <div className="md:hidden">
                      <MusicianCharacter
                        state="idle"
                        size={40}
                        showGroundGlow={true}
                        showNotes={true}
                      />
                    </div>
                    <div className="hidden md:block lg:hidden">
                      <MusicianCharacter
                        state="idle"
                        size={60}
                        showGroundGlow={true}
                        showNotes={true}
                      />
                    </div>
                    <div className="hidden lg:block">
                      <MusicianCharacter
                        state="idle"
                        size={64}
                        showGroundGlow={true}
                        showNotes={true}
                      />
                    </div>
                  </div>
                )}

                <div className="relative flex items-center justify-center">
                  {isPlayerHere && (
                    <>
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none absolute -inset-3 lg:-inset-4 border border-[#00E5FF]/50 shadow-[0_0_26px_rgba(0,229,255,0.45)] ${
                          isFinalBossWorld ? 'rounded-3xl' : 'rounded-full'
                        }`}
                      />
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-3 lg:-inset-4 rounded-full bg-radial from-[#FF5A00]/45 via-[#FFB84D]/22 to-transparent blur-md"
                      />
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none absolute -inset-1.5 lg:-inset-2 border-2 border-[#FF5A00] animate-audio-ring ${
                          isFinalBossWorld ? 'rounded-2xl' : 'rounded-full'
                        }`}
                      />
                    </>
                  )}

                  {isInspected && (
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute -inset-1.5 lg:-inset-2 border-2 border-[#00E5FF] shadow-[0_0_18px_rgba(0,229,255,0.6)] ${
                        isFinalBossWorld ? 'rounded-2xl' : 'rounded-full'
                      }`}
                    />
                  )}

                  {isFinalBossWorld ? (
                    <button
                      type="button"
                      onClick={() => setInspectedWorldId(world.id)}
                      onDoubleClick={() => {
                        if (status === 'completed' || status === 'active') onEnterWorld(world);
                        else if (status === 'locked-premium') onOpenLicense();
                      }}
                      aria-label={locWorld.title}
                      className={`relative w-12 h-11 md:w-20 md:h-18 p-[2.5px] md:p-[3px] node-3d-boss transition-transform duration-150 active:scale-[0.97] focus-visible:outline-none ${
                        status === 'completed'
                          ? 'bg-gradient-to-b from-[#FFB800] via-[#FF5A00] to-[#10B981]'
                          : status === 'active'
                            ? 'bg-gradient-to-b from-[#FFB800] via-[#FF5A00] to-[#00E5FF]'
                            : status === 'locked-premium'
                              ? 'bg-gradient-to-b from-[#FFB800]/75 to-[#784A00]'
                              : 'bg-gradient-to-b from-[#4B526E] to-[#1E2133]'
                      }`}
                    >
                      <div
                        className={`w-full h-full node-3d-boss flex flex-col items-center justify-center ${
                          status === 'completed'
                            ? 'bg-gradient-to-b from-[#17332A] to-[#0F201B] text-[#FFB800]'
                            : status === 'active'
                              ? 'bg-gradient-to-b from-[#FF6D1A] to-[#C84200] text-white'
                              : 'bg-gradient-to-b from-[#1E2030] to-[#12141F] text-[#FFB800]'
                        }`}
                      >
                        <Trophy className="w-4 h-4 md:w-7 md:h-7" />
                      </div>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setInspectedWorldId(world.id)}
                      onDoubleClick={() => {
                        if (status === 'completed' || status === 'active') onEnterWorld(world);
                        else if (status === 'locked-premium') onOpenLicense();
                      }}
                      aria-label={locWorld.title}
                      className={`relative w-10 h-10 md:w-16 md:h-16 rounded-full border-[2.5px] md:border-[3px] flex items-center justify-center transition-all focus-visible:outline-none ${
                        status === 'completed'
                          ? 'bg-gradient-to-b from-[#16A34A] to-[#0F764A] border-[#6EE7B7] text-white node-3d-completed'
                          : status === 'active'
                            ? 'bg-gradient-to-b from-[#FF7526] to-[#FF5A00] border-[#FFE0CC] text-white node-3d-active'
                            : status === 'locked-premium'
                              ? 'bg-gradient-to-b from-[#252126] to-[#15141C] border-[#FFB800]/60 text-[#FFB800] node-3d-locked'
                              : 'bg-gradient-to-b from-[#222638] to-[#141724] border-[#3B415C] text-[#7D85A3] node-3d-locked'
                      }`}
                    >
                      {renderWorldIcon(world.iconName, 'w-4 h-4 md:w-6 md:h-6')}
                    </button>
                  )}

                  <span
                    className={`pointer-events-none absolute -top-1 -left-1 w-4 h-4 lg:w-5 lg:h-5 rounded-full text-[9px] lg:text-[10px] font-mono font-extrabold flex items-center justify-center border border-[#090B11] ${
                      status === 'active'
                        ? 'bg-white text-[#090B11]'
                        : status === 'completed'
                          ? 'bg-[#FFB800] text-[#090B11]'
                          : 'bg-[#1F2335] text-[#C5CAD8]'
                    }`}
                  >
                    {world.id}
                  </span>

                  <span
                    className={`pointer-events-none absolute -bottom-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 rounded-full flex items-center justify-center border border-[#090B11] ${
                      status === 'completed'
                        ? 'bg-emerald-400 text-[#090B11]'
                        : status === 'locked-premium'
                          ? 'bg-[#FFB800] text-[#090B11]'
                          : status === 'locked-progress'
                            ? 'bg-[#363B54] text-[#D1D5DB]'
                            : 'bg-[#00E5FF] text-[#090B11]'
                    }`}
                  >
                    {status === 'completed' ? (
                      <Check className="w-2.5 h-2.5 lg:w-3 lg:h-3 stroke-[3.2]" />
                    ) : status === 'locked-premium' ? (
                      <Crown className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                    ) : status === 'locked-progress' ? (
                      <Lock className="w-2 h-2 lg:w-2.5 lg:h-2.5" />
                    ) : (
                      <Play className="w-2 h-2 lg:w-2.5 lg:h-2.5 fill-[#090B11] translate-x-[0.5px]" />
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectedWorldId(world.id)}
                  className={`mt-1 lg:mt-1.5 px-1.5 md:px-2 py-0.5 lg:py-1 rounded-md lg:rounded-lg border text-center max-w-[74px] sm:max-w-[96px] md:max-w-[144px] lg:max-w-[146px] transition-colors ${
                    isInspected
                      ? 'bg-[#1A1E2F] border-[#00E5FF]/65 text-white'
                      : 'bg-[#0D0F18]/90 border-white/10 text-white/90 hover:border-white/25'
                  }`}
                >
                  <span className="block font-display text-[8.5px] md:text-[11px] font-bold leading-tight truncate">
                    {locWorld.shortName}
                  </span>
                  <div className="flex items-center justify-center gap-1 lg:gap-1.5 mt-0.5 text-[8.5px] lg:text-[10px] font-mono tabular-nums">
                    <span className={status === 'completed' ? 'text-emerald-400' : 'text-[#00E5FF]'}>
                      {stats.completedCount}/5
                    </span>
                    <span className="text-white/25">·</span>
                    <span className="inline-flex items-center gap-0.5 text-[#FFB800]">
                      <Star className="w-2 h-2 lg:w-2.5 lg:h-2.5 fill-[#FFB800]" />
                      {stats.earnedStars}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
          </div>
        </div>
      </section>

      {/* B) WORLD INSPECTOR CONSOLE (Mobile compact / Tablet md: p-5 12-col horizontal / Desktop lg: 3fr right col grouped) */}
      <aside className="shrink-0 md:w-full lg:h-full lg:min-h-0 min-w-0 bg-[#12141E] rounded-2xl lg:rounded-none border border-white/10 lg:border-0 lg:border-l lg:border-white/10 p-2.5 md:p-5 lg:p-5 flex flex-col justify-between md:grid md:grid-cols-12 md:gap-5 md:items-center lg:flex lg:flex-col lg:justify-start lg:items-stretch lg:gap-3 overflow-hidden">
        <div className="space-y-1.5 md:space-y-3 lg:space-y-2.5 min-h-0 flex flex-col md:col-span-6 lg:col-span-auto">
          {/* Top World Badge & Status */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 lg:gap-1.5 px-2 lg:px-2.5 py-0.5 lg:py-1 rounded-md lg:rounded-lg bg-[#1C1F2E] border border-white/10 text-[10px] md:text-xs lg:text-[11px] font-mono font-bold text-[#00E5FF] uppercase tracking-wider truncate">
              {renderWorldIcon(inspectedWorld.iconName, 'w-3 h-3 lg:w-3.5 lg:h-3.5')}
              <span>{t.map.worldOfEight(inspectedWorld.id)}</span>
            </span>

            <span
              className={`px-2 py-0.5 rounded-md border text-[9px] md:text-[10px] font-mono font-bold uppercase shrink-0 ${statusMeta[inspectedStatus].badgeClass}`}
            >
              {statusMeta[inspectedStatus].label}
            </span>
          </div>

          {/* World Title & Motivating Description */}
          <div>
            <h2 className="font-display text-sm sm:text-base md:text-2xl lg:text-xl font-extrabold text-white leading-tight truncate md:whitespace-normal">
              {locInspected.shortName}
            </h2>
            <p className="text-[11px] md:text-sm lg:text-xs text-[#9CA3AF] mt-0.5 lg:mt-1 leading-snug line-clamp-2">
              {locInspected.subtitle}
            </p>
          </div>

          {/* Exclusive World Medal Card (shown in left col on tablet md: and stacked on desktop lg:) */}
          <div className="hidden md:flex lg:hidden rounded-xl bg-gradient-to-r from-[#1A1C29] to-[#201A1F] border border-[#FFB800]/30 p-2.5 items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  hasInspectedMedal
                    ? 'bg-gradient-to-b from-[#FFD452] to-[#FF5A00] text-[#090B11]'
                    : 'bg-[#FFB800]/15 border border-[#FFB800]/35 text-[#FFB800]'
                }`}
              >
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-[9px] font-mono uppercase text-[#FFB800]">
                  {t.atlas.exclusiveMedal}
                </span>
                <span className="block text-xs font-bold text-white truncate">
                  {locInspected.rewardTitle}
                </span>
              </div>
            </div>
            {hasInspectedMedal && (
              <span className="text-[10px] font-mono font-bold text-emerald-400 shrink-0">
                {t.atlas.earnedTag}
              </span>
            )}
          </div>

          {/* Tablet CTA inside left column right below medal */}
          <div className="hidden md:block lg:hidden pt-1">
            {inspectedStatus === 'completed' || inspectedStatus === 'active' ? (
              <button
                type="button"
                onClick={() => onEnterWorld(inspectedWorld)}
                className="w-full py-4 rounded-2xl arcade-btn-orange text-white font-display font-extrabold text-base tracking-wide inline-flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>{t.atlas.enterWorld(inspectedWorld.id)}</span>
              </button>
            ) : inspectedStatus === 'locked-premium' ? (
              <button
                type="button"
                onClick={onOpenLicense}
                className="w-full py-4 rounded-2xl arcade-btn-gold text-[#090B11] font-display font-extrabold text-base tracking-wide inline-flex items-center justify-center gap-2"
              >
                <Crown className="w-5 h-5" />
                <span>{t.atlas.unlockAllWorlds}</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full py-4 rounded-2xl bg-[#1B1D2B] border border-white/10 text-[#9CA3AF] font-display font-bold text-sm inline-flex items-center justify-center gap-2 cursor-not-allowed px-3 text-center"
              >
                <Lock className="w-4 h-4 shrink-0" />
                <span>{t.atlas.completePrevWorld(inspectedWorld.id - 1)}</span>
              </button>
            )}
          </div>
        </div>

        {/* Compact 5-Stage Curriculum Preview List (Right col on tablet md: / Stacked on desktop lg:) */}
        <div className="hidden md:flex flex-col gap-1 lg:gap-1.5 pt-0.5 lg:pt-0 min-h-0 md:col-span-6 lg:col-span-auto">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#8E95AE]">
            <span>{t.atlas.fiveStagesHeading}</span>
            <span className="text-[#FFB800] tabular-nums">
              ★ {inspectedStats.earnedStars}/{inspectedStats.maxStars}
            </span>
          </div>
          <div className="space-y-1">
            {inspectedWorld.levels.map((lvl) => {
              const lvlStatus = WorldEngine.getLevelAccessStatus(lvl, progress, qaUnlockAll);
              const locLvl = getLocalizedLevel(lvl, lang);
              const lp = progress.levels[lvl.id];
              const isDone = lvlStatus === 'completed';
              const isCurr = lvlStatus === 'current' || lvlStatus === 'available';

              return (
                <div
                  key={lvl.id}
                  className={`px-2.5 py-1.5 rounded-lg border flex items-center justify-between gap-2 text-xs ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-white'
                      : isCurr
                        ? 'bg-[#FF5A00]/15 border-[#FF5A00]/50 text-white'
                        : 'bg-[#171925] border-white/6 text-[#9CA3AF]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-extrabold shrink-0 ${
                        isDone
                          ? 'bg-emerald-400 text-[#090B11]'
                          : isCurr
                            ? 'bg-[#FF5A00] text-white'
                            : lvl.isBoss
                              ? 'bg-[#FFB800]/20 text-[#FFB800]'
                              : 'bg-white/8 text-[#8E95AE]'
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-3 h-3 stroke-[3]" />
                      ) : lvl.isBoss ? (
                        <Crown className="w-3 h-3" />
                      ) : (
                        lvl.levelNumber
                      )}
                    </span>
                    <span className="truncate font-medium">
                      {lvl.isBoss ? `${t.atlas.bossPrefix}: ${locLvl.shortTitle}` : locLvl.title}
                    </span>
                  </div>

                  {isDone && lp ? (
                    <span className="text-[10px] font-mono text-[#FFB800] shrink-0">
                      {'★'.repeat(lp.stars)}
                    </span>
                  ) : lvl.isBoss ? (
                    <span className="text-[9px] font-mono font-bold text-[#FFB800] uppercase shrink-0">
                      {t.map.bossTag}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop Exclusive World Medal Card */}
        <div className="hidden lg:flex rounded-xl bg-gradient-to-r from-[#1A1C29] to-[#201A1F] border border-[#FFB800]/30 p-2.5 items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                hasInspectedMedal
                  ? 'bg-gradient-to-b from-[#FFD452] to-[#FF5A00] text-[#090B11]'
                  : 'bg-[#FFB800]/15 border border-[#FFB800]/35 text-[#FFB800]'
              }`}
            >
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="block text-[10px] font-mono uppercase text-[#FFB800]">
                {t.atlas.exclusiveMedal}
              </span>
              <span className="block text-xs font-bold text-white truncate">
                {locInspected.rewardTitle}
              </span>
            </div>
          </div>
          {hasInspectedMedal && (
            <span className="text-[10px] font-mono font-bold text-emerald-400 shrink-0">
              {t.atlas.earnedTag}
            </span>
          )}
        </div>

        {/* Mobile & Desktop Bottom Action Button */}
        <div className="md:hidden lg:block pt-0.5 lg:pt-1 pb-0.5 lg:pb-1 shrink-0">
          {inspectedStatus === 'completed' || inspectedStatus === 'active' ? (
            <button
              type="button"
              onClick={() => onEnterWorld(inspectedWorld)}
              className="w-full h-11 lg:h-13 rounded-xl lg:rounded-2xl arcade-btn-orange text-white font-display font-extrabold text-xs sm:text-sm lg:text-base tracking-wide inline-flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 lg:w-5 lg:h-5 fill-white" />
              <span>{t.atlas.enterWorld(inspectedWorld.id)}</span>
            </button>
          ) : inspectedStatus === 'locked-premium' ? (
            <button
              type="button"
              onClick={onOpenLicense}
              className="w-full h-11 lg:h-13 rounded-xl lg:rounded-2xl arcade-btn-gold text-[#090B11] font-display font-extrabold text-xs sm:text-sm lg:text-base tracking-wide inline-flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4 lg:w-5 lg:h-5" />
              <span>{t.atlas.unlockAllWorlds}</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full h-11 lg:h-13 rounded-xl lg:rounded-2xl bg-[#1B1D2B] border border-white/10 text-[#9CA3AF] font-display font-bold text-xs lg:text-sm inline-flex items-center justify-center gap-2 cursor-not-allowed px-3 text-center"
            >
              <Lock className="w-4 h-4 shrink-0" />
              <span>{t.atlas.completePrevWorld(inspectedWorld.id - 1)}</span>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
};
