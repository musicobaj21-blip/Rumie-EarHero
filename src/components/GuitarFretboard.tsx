import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AudioEngine } from '../engines/AudioEngine';
import { useI18n } from '../i18n/I18nContext';
import { formatMidiNote, getGuitarOpenStringLabels } from '../i18n/musicLocalization';

export const GUITAR_MIN_MIDI = 40; // Mi2 (6th string open)
export const GUITAR_MAX_MIDI = 79; // Sol5 (1st string, fret 15)

const MAX_FRET = 15;
const FRET_COLUMNS = MAX_FRET + 1; // 16 equal columns (0..15) for exact geometric alignment
const FRET_NUMBERS = Array.from({ length: FRET_COLUMNS }, (_, i) => i);

/**
 * Standard 6-string guitar tuning in tab/diagram orientation:
 * Top (index 0): 1st string high E4 (MIDI 64) -> Bottom (index 5): 6th string low E2 (MIDI 40)
 */
const GUITAR_STRINGS = [
  { stringNumber: 1, label: 'Mi4', openMidi: 64, thicknessPx: 1.2, wound: false },
  { stringNumber: 2, label: 'Si3', openMidi: 59, thicknessPx: 1.5, wound: false },
  { stringNumber: 3, label: 'Sol3', openMidi: 55, thicknessPx: 1.85, wound: false },
  { stringNumber: 4, label: 'Re3', openMidi: 50, thicknessPx: 2.25, wound: true },
  { stringNumber: 5, label: 'La2', openMidi: 45, thicknessPx: 2.75, wound: true },
  { stringNumber: 6, label: 'Mi2', openMidi: 40, thicknessPx: 3.3, wound: true },
] as const;

const SINGLE_INLAY_FRETS = new Set([3, 5, 7, 9, 15]);
const DOUBLE_INLAY_FRETS = new Set([12]);

export type GuitarHighlightMode = 'single' | 'interval' | 'chord' | 'scale' | 'melody';

export interface FretPosition {
  stringIdx: number; // 0 = 1st string (Mi4), 5 = 6th string (Mi2)
  fret: number; // 0..15
  midi: number;
}

export interface GuitarFretboardProps {
  /** Highlighted MIDI notes (shown only when blindMode is false) */
  highlightedMidi?: number[];
  /** Currently sounding single note pulse during sequential playback */
  activePulseMidi?: number | null;
  /** Fingering layout strategy for highlighted notes */
  highlightMode?: GuitarHighlightMode;
  /** Root note MIDI (highlighted in Rumie Orange #FF5A00 vs other voices in Cyan #00E5FF) */
  rootMidi?: number;
  /** Optional anchor note subtly marked ONLY when no pad notes are highlighted */
  anchorMidi?: number;
  /** When true (during melody memory playback/input), never highlight targets */
  blindMode?: boolean;
  /** Disable user interaction */
  readOnly?: boolean;
  onPlayNote?: (midi: number) => void;
}

/**
 * Normalizes a note array cleanly into guitar playable range [40, 79].
 * Preserves relative intervals when shifting an entire group if possible.
 */
export function adaptNotesForGuitarRange(notes: number[]): number[] {
  if (notes.length === 0) return [];
  let shifted = [...notes];

  const minVal = Math.min(...shifted);
  const maxVal = Math.max(...shifted);

  if (maxVal > GUITAR_MAX_MIDI && minVal - 12 >= GUITAR_MIN_MIDI) {
    while (Math.max(...shifted) > GUITAR_MAX_MIDI && Math.min(...shifted) - 12 >= GUITAR_MIN_MIDI) {
      shifted = shifted.map((n) => n - 12);
    }
  } else if (minVal < GUITAR_MIN_MIDI && maxVal + 12 <= GUITAR_MAX_MIDI) {
    while (Math.min(...shifted) < GUITAR_MIN_MIDI && Math.max(...shifted) + 12 <= GUITAR_MAX_MIDI) {
      shifted = shifted.map((n) => n + 12);
    }
  }

  const clamped = shifted.map((n) => {
    let v = n;
    while (v < GUITAR_MIN_MIDI) v += 12;
    while (v > GUITAR_MAX_MIDI) v -= 12;
    return v;
  });

  return Array.from(new Set(clamped));
}

function getAllPositionsForMidi(midi: number): FretPosition[] {
  const results: FretPosition[] = [];
  for (let s = 0; s < GUITAR_STRINGS.length; s++) {
    const fret = midi - GUITAR_STRINGS[s].openMidi;
    if (fret >= 0 && fret <= MAX_FRET) {
      results.push({ stringIdx: s, fret, midi });
    }
  }
  return results;
}

/**
 * Picks a single clean default Root anchor in the comfortable mid-neck zone
 * (frets 3..8 on 6th or 5th string whenever available, otherwise closest mid-neck position).
 */
function pickDefaultRootAnchor(midi: number): FretPosition | null {
  const adapted = adaptNotesForGuitarRange([midi]);
  if (adapted.length === 0) return null;
  const targetMidi = adapted[0];
  const candidates = getAllPositionsForMidi(targetMidi);
  if (candidates.length === 0) return null;

  let best = candidates[0];
  let bestScore = Infinity;

  for (const c of candidates) {
    const inMidFrets = c.fret >= 3 && c.fret <= 8;
    const isBassString = c.stringIdx === 5 || c.stringIdx === 4;
    let score = Math.abs(c.fret - 5) * 1.4;

    if (inMidFrets && isBassString) {
      // Ideal central anchor on 5th or 6th string (frets 3..8)
      score -= 14;
      if (c.stringIdx === 4) score -= 0.5;
    } else if (inMidFrets) {
      // Comfortable central zone on 4th/3rd string for higher roots (e.g. Oct 4)
      score -= 8;
    } else if (c.fret === 0) {
      score += 4;
    } else if (c.fret > 10) {
      score += (c.fret - 10) * 3.5;
    }

    // Prefer thicker strings (room to build intervals/chords/scales upward)
    score += (5 - c.stringIdx) * 0.9;

    if (score < bestScore) {
      bestScore = score;
      best = c;
    }
  }

  return best;
}

/**
 * Exact minimum hand-distance solver relative to a fixed root anchor:
 *   cost = (fretDist * 2.5) + (stringDist * 1.2) + openPenalty + gravePenalty
 */
function pickClosestTargetToAnchor(
  anchor: FretPosition,
  targetMidi: number,
  avoidGraveStrings = true
): FretPosition | null {
  const candidates = getAllPositionsForMidi(targetMidi);
  if (candidates.length === 0) return null;

  let best = candidates[0];
  let bestCost = Infinity;

  for (const c of candidates) {
    const fretDist = Math.abs(c.fret - anchor.fret);
    const stringDist = Math.abs(c.stringIdx - anchor.stringIdx);
    const openPenalty = c.fret === 0 && anchor.fret > 3 ? 12 : 0;
    const gravePenalty =
      avoidGraveStrings && targetMidi >= anchor.midi && c.stringIdx > anchor.stringIdx ? 8 : 0;

    const cost = fretDist * 2.5 + stringDist * 1.2 + openPenalty + gravePenalty;
    if (cost < bestCost) {
      bestCost = cost;
      best = c;
    }
  }

  return best;
}

/**
 * Computes ergonomic, hand-box-coherent guitar fingerings anchored around `rootAnchor`.
 */
function computeErgonomicFingering(
  notes: number[],
  mode: GuitarHighlightMode,
  rootAnchor: FretPosition | null
): FretPosition[] {
  const validNotes = adaptNotesForGuitarRange(notes);
  if (validNotes.length === 0) return [];

  // 1) SINGLE NOTE
  if (validNotes.length === 1 || mode === 'single') {
    if (rootAnchor && rootAnchor.midi === validNotes[0]) return [rootAnchor];
    const pos = pickDefaultRootAnchor(validNotes[0]);
    return pos ? [pos] : [];
  }

  // 2) INTERVALS (Root anchor + exact minimum hand-distance target)
  if (mode === 'interval' && validNotes.length === 2) {
    const [rootNote, targetNote] = validNotes;
    const anchor =
      rootAnchor && rootAnchor.midi === rootNote
        ? rootAnchor
        : pickDefaultRootAnchor(rootNote);
    if (!anchor) return [];
    const targetPos = pickClosestTargetToAnchor(anchor, targetNote, true);
    return targetPos ? [anchor, targetPos] : [anchor];
  }

  // 3) MELODY (All notes grouped tightly around the starting anchor note)
  if (mode === 'melody') {
    const startNote = validNotes[0];
    const anchor =
      rootAnchor && rootAnchor.midi === startNote
        ? rootAnchor
        : pickDefaultRootAnchor(startNote);
    if (!anchor) return [];

    const positions: FretPosition[] = [anchor];
    const seen = new Set<string>([`${anchor.stringIdx}-${anchor.fret}`]);

    for (let i = 1; i < validNotes.length; i++) {
      const pos = pickClosestTargetToAnchor(anchor, validNotes[i], false);
      if (pos) {
        const key = `${pos.stringIdx}-${pos.fret}`;
        if (!seen.has(key)) {
          seen.add(key);
          positions.push(pos);
        }
      }
    }
    return positions;
  }

  // 4) SCALES (Single clean 4-5 fret box around rootAnchor)
  if (mode === 'scale' || validNotes.length > 6) {
    const sorted = [...validNotes].sort((a, b) => a - b);
    const scaleRoot = sorted[0];
    const anchor =
      rootAnchor && rootAnchor.midi === scaleRoot
        ? rootAnchor
        : pickDefaultRootAnchor(scaleRoot);

    const anchorFret = anchor ? anchor.fret : 3;
    // Candidate 4-5 fret box windows containing the anchor fret
    const candidateStarts = Array.from(
      new Set([
        Math.max(0, anchorFret - 1),
        Math.max(0, anchorFret - 2),
        Math.min(MAX_FRET - 4, anchorFret),
      ])
    );

    let bestBox: FretPosition[] = [];
    let bestCost = Infinity;

    for (const boxStart of candidateStarts) {
      const boxEnd = Math.min(MAX_FRET, boxStart + 4);
      const assigned: FretPosition[] = [];
      let totalCost = 0;
      let valid = true;

      for (const midi of sorted) {
        if (anchor && midi === anchor.midi) {
          assigned.push(anchor);
          continue;
        }
        const candidates = getAllPositionsForMidi(midi);
        if (candidates.length === 0) {
          valid = false;
          break;
        }
        let localBest = candidates[0];
        let localCost = Infinity;

        for (const c of candidates) {
          const inBox = c.fret >= boxStart && c.fret <= boxEnd;
          const outDist = inBox
            ? 0
            : c.fret < boxStart
              ? (boxStart - c.fret) * 24
              : (c.fret - boxEnd) * 24;
          const openPenalty = c.fret === 0 && anchorFret > 3 ? 16 : 0;
          const gravePenalty = anchor && midi > anchor.midi && c.stringIdx > anchor.stringIdx ? 12 : 0;
          const fretDist = Math.abs(c.fret - anchorFret) * 1.1;

          const cost = outDist + openPenalty + gravePenalty + fretDist;
          if (cost < localCost) {
            localCost = cost;
            localBest = c;
          }
        }
        assigned.push(localBest);
        totalCost += localCost;
      }

      if (valid && totalCost < bestCost) {
        bestCost = totalCost;
        bestBox = assigned;
      }
    }

    return bestBox;
  }

  // 5) CHORDS & PROGRESSIONS (Max 1 note per string, tight <= 4-fret window around rootAnchor)
  const sortedAsc = [...validNotes].sort((a, b) => a - b);
  const candidateLists = sortedAsc.map((m) => getAllPositionsForMidi(m));
  const targetCenterFret = rootAnchor ? rootAnchor.fret : 4;

  let bestCombo: FretPosition[] | null = null;
  let bestScore = Infinity;

  const current: FretPosition[] = [];
  const usedStrings = new Set<number>();

  const dfs = (voiceIdx: number) => {
    if (voiceIdx === sortedAsc.length) {
      const fretted = current.filter((p) => p.fret > 0).map((p) => p.fret);
      const minFret = fretted.length > 0 ? Math.min(...fretted) : 0;
      const maxFret = fretted.length > 0 ? Math.max(...fretted) : 0;
      const span = fretted.length > 1 ? maxFret - minFret : 0;

      // Strict preference for compact <= 3-4 fret hand box
      let score = 0;
      if (span <= 3) score += span * 2.5;
      else if (span === 4) score += 16;
      else score += 90 + (span - 4) * 35;

      // Keep chord tightly anchored near rootAnchor fret (no distant leaps)
      const avgFret = current.reduce((acc, p) => acc + p.fret, 0) / current.length;
      score += Math.abs(avgFret - targetCenterFret) * 3.2;

      // Reward placing the root note on the exact user/default rootAnchor
      if (
        rootAnchor &&
        current.some(
          (p) =>
            p.midi === rootAnchor.midi &&
            p.stringIdx === rootAnchor.stringIdx &&
            p.fret === rootAnchor.fret
        )
      ) {
        score -= 10;
      }

      // Penalize far open strings when chord is high on neck
      for (const p of current) {
        if (p.fret === 0 && maxFret > 4) score += 14;
      }

      // Standard pitch-to-string order (bass on thicker strings / higher stringIdx)
      for (let i = 0; i < current.length - 1; i++) {
        if (current[i].stringIdx < current[i + 1].stringIdx) {
          score += 22;
        }
      }

      // Prefer compact adjacent string cluster
      const strIdxs = current.map((p) => p.stringIdx);
      const skippedStrings = Math.max(...strIdxs) - Math.min(...strIdxs) + 1 - current.length;
      score += skippedStrings * 2.5;

      if (score < bestScore) {
        bestScore = score;
        bestCombo = [...current];
      }
      return;
    }

    for (const pos of candidateLists[voiceIdx]) {
      if (usedStrings.has(pos.stringIdx)) continue;
      usedStrings.add(pos.stringIdx);
      current.push(pos);
      dfs(voiceIdx + 1);
      current.pop();
      usedStrings.delete(pos.stringIdx);
    }
  };

  dfs(0);

  if (bestCombo) return bestCombo;

  return sortedAsc
    .map((m) =>
      rootAnchor ? pickClosestTargetToAnchor(rootAnchor, m, false) : pickDefaultRootAnchor(m)
    )
    .filter((p): p is FretPosition => p !== null);
}

export const GuitarFretboard: React.FC<GuitarFretboardProps> = ({
  highlightedMidi = [],
  activePulseMidi = null,
  highlightMode = 'chord',
  rootMidi,
  anchorMidi,
  blindMode = false,
  readOnly = false,
  onPlayNote,
}) => {
  const { lang, t } = useI18n();
  const openLabels = getGuitarOpenStringLabels(lang);
  const [pressedPos, setPressedPos] = useState<FretPosition | null>(null);
  const [lastClickedPos, setLastClickedPos] = useState<FretPosition | null>(null);
  const [preferredAnchor, setPreferredAnchor] = useState<FretPosition | null>(null);
  const [vibratingStrings, setVibratingStrings] = useState<Record<number, number>>({});
  const pressedTimerRef = useRef<number | null>(null);
  const directClickRef = useRef(false);

  useEffect(() => {
    return () => {
      if (pressedTimerRef.current !== null) {
        window.clearTimeout(pressedTimerRef.current);
      }
    };
  }, []);

  // Adapted root MIDI used to compute the single clean anchor position
  const effectiveAnchorMidi = useMemo(() => {
    const raw = anchorMidi ?? rootMidi;
    if (raw === undefined) return undefined;
    return adaptNotesForGuitarRange([raw])[0];
  }, [anchorMidi, rootMidi]);

  // Reset user's custom string anchor when the Lab root/octave changes to a different MIDI note
  useEffect(() => {
    if (
      preferredAnchor &&
      effectiveAnchorMidi !== undefined &&
      preferredAnchor.midi !== effectiveAnchorMidi
    ) {
      setPreferredAnchor(null);
    }
  }, [effectiveAnchorMidi, preferredAnchor]);

  // Single authoritative root anchor (either user-chosen string for this root or default central anchor)
  const activeRootAnchor = useMemo(() => {
    if (effectiveAnchorMidi === undefined) return null;
    if (preferredAnchor && preferredAnchor.midi === effectiveAnchorMidi) {
      return preferredAnchor;
    }
    return pickDefaultRootAnchor(effectiveAnchorMidi);
  }, [effectiveAnchorMidi, preferredAnchor]);

  const triggerStringVibration = (stringIndices: number[]) => {
    if (stringIndices.length === 0) return;
    setVibratingStrings((prev) => {
      const next = { ...prev };
      for (const s of stringIndices) {
        next[s] = (next[s] ?? 0) + 1;
      }
      return next;
    });
  };

  // Compute ergonomic hand-box positions for highlighted notes
  const highlightedPositions = useMemo(() => {
    if (blindMode || highlightedMidi.length === 0) return [];
    if (
      lastClickedPos &&
      highlightMode === 'single' &&
      highlightedMidi.length === 1 &&
      highlightedMidi[0] === lastClickedPos.midi
    ) {
      return [lastClickedPos];
    }
    return computeErgonomicFingering(highlightedMidi, highlightMode, activeRootAnchor);
  }, [blindMode, highlightedMidi, highlightMode, lastClickedPos, activeRootAnchor]);

  // O(1) cell lookup
  const highlightLookup = useMemo(() => {
    const map = new Map<string, FretPosition>();
    for (const p of highlightedPositions) {
      map.set(`${p.stringIdx}-${p.fret}`, p);
    }
    return map;
  }, [highlightedPositions]);

  // Subtle geometric connector between Root (#FF5A00) and Interval target (#00E5FF)
  const intervalConnector = useMemo(() => {
    if (blindMode || highlightMode !== 'interval' || highlightedPositions.length !== 2) {
      return null;
    }
    const [a, b] = highlightedPositions;
    const x1 = ((a.fret + 0.5) / FRET_COLUMNS) * 1000;
    const y1 = ((a.stringIdx + 0.5) / 6) * 120;
    const x2 = ((b.fret + 0.5) / FRET_COLUMNS) * 1000;
    const y2 = ((b.stringIdx + 0.5) / 6) * 120;

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    // Slight arc curve so same-string intervals (e.g. fret 8 -> 9) arch gracefully above/below string
    const sameString = a.stringIdx === b.stringIdx;
    const curveLift = sameString ? (a.stringIdx === 0 ? 15 : -15) : -8;
    const d = `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${midX.toFixed(1)} ${(midY + curveLift).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
    return { x1, y1, x2, y2, d };
  }, [blindMode, highlightMode, highlightedPositions]);

  // Gently vibrate strings on pad playback
  useEffect(() => {
    if (blindMode) return;
    if (directClickRef.current) {
      directClickRef.current = false;
      return;
    }
    if (activePulseMidi !== null) {
      const matching = highlightedPositions.filter((p) => p.midi === activePulseMidi);
      if (matching.length > 0) {
        triggerStringVibration(matching.map((p) => p.stringIdx));
      }
      return;
    }
    if (highlightedPositions.length > 0) {
      triggerStringVibration(Array.from(new Set(highlightedPositions.map((p) => p.stringIdx))));
    }
  }, [highlightedMidi, activePulseMidi, blindMode, highlightedPositions]);

  const rootPitchClass =
    rootMidi !== undefined ? ((rootMidi % 12) + 12) % 12 : undefined;

  const handleFretClick = (stringIdx: number, fret: number) => {
    if (readOnly) return;
    const midi = GUITAR_STRINGS[stringIdx].openMidi + fret;
    const pos: FretPosition = { stringIdx, fret, midi };

    directClickRef.current = true;
    setLastClickedPos(pos);
    setPressedPos(pos);

    // If the user clicks the current root note on any string (e.g. Do3 on 6th fret 8 vs 5th fret 3),
    // promote that position as the new preferred root anchor!
    if (effectiveAnchorMidi !== undefined && midi === effectiveAnchorMidi) {
      setPreferredAnchor(pos);
    }

    triggerStringVibration([stringIdx]);
    void AudioEngine.playSingleNote(midi, 0.9, 'guitar');
    onPlayNote?.(midi);

    if (pressedTimerRef.current !== null) {
      window.clearTimeout(pressedTimerRef.current);
    }
    pressedTimerRef.current = window.setTimeout(() => {
      setPressedPos((curr) =>
        curr && curr.stringIdx === stringIdx && curr.fret === fret ? null : curr
      );
    }, 340);
  };

  // Show the idle root anchor ring ONLY when nothing else is highlighted (zero ghost rings!)
  const showIdleAnchor =
    !blindMode && highlightedPositions.length === 0 && !pressedPos && activeRootAnchor !== null;

  return (
    <div
      className="w-full select-none rounded-xl bg-[#0B0D14] p-1.5 sm:p-2 border border-white/12 shadow-[inset_0_2px_12px_rgba(0,0,0,0.8)]"
      role="group"
      aria-label={t.lab.guitarAria}
    >
      {/* Top synth LED rail matching VirtualPiano */}
      <div className="h-1 w-full rounded-full bg-gradient-to-r from-[#FF5A00]/65 via-[#00E5FF]/55 to-[#FF5A00]/65 mb-1.5 opacity-85" />

      {/* Main Ebony Fretboard Container */}
      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="min-w-[660px] w-full flex flex-col">
          {/* Fretboard Neck Area */}
          <div className="relative h-[106px] sm:h-[118px] w-full rounded-lg overflow-hidden border border-white/10 bg-gradient-to-b from-[#171822] via-[#12141C] to-[#171822] shadow-[inset_0_4px_14px_rgba(0,0,0,0.75)]">
            {/* Subtle Ebony Wood Grain Sheen */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 5px)',
              }}
            />

            {/* 16 Equal Fret Columns (0 = open strings left of bone nut, 1..15 = frets) */}
            <div
              className="relative z-10 h-full w-full grid"
              style={{ gridTemplateColumns: `repeat(${FRET_COLUMNS}, minmax(0, 1fr))` }}
            >
              {FRET_NUMBERS.map((fret) => {
                const isOpenCol = fret === 0;
                const hasSingleInlay = SINGLE_INLAY_FRETS.has(fret);
                const hasDoubleInlay = DOUBLE_INLAY_FRETS.has(fret);

                return (
                  <div
                    key={fret}
                    className={`relative h-full ${
                      isOpenCol
                        ? 'bg-[#0C0E16]/90 border-r-[4px] border-r-[#E8DFCE] shadow-[2px_0_6px_rgba(0,0,0,0.6)]'
                        : 'border-r-[1.5px] border-r-[#5A627A]/75'
                    }`}
                  >
                    {!isOpenCol && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute top-0 bottom-0 right-0 w-[1px] bg-white/20"
                      />
                    )}

                    {/* Pearloid Inlays (Frets 3, 5, 7, 9, 12 double, 15) */}
                    {hasSingleInlay && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white/14 border border-white/15 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]"
                      />
                    )}
                    {hasDoubleInlay && (
                      <>
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute left-1/2 top-[29%] -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white/18 border border-white/20"
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute left-1/2 top-[71%] -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white/18 border border-white/20"
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 6 Horizontal Guitar Strings Overlay (aligned identically to 6 flex-1 rows) */}
            <div className="pointer-events-none absolute inset-0 z-20 flex flex-col">
              {GUITAR_STRINGS.map((str, sIdx) => {
                const vibKey = vibratingStrings[sIdx] ?? 0;
                const isLitString =
                  (!blindMode && highlightedPositions.some((p) => p.stringIdx === sIdx)) ||
                  pressedPos?.stringIdx === sIdx;

                return (
                  <div
                    key={`str-${str.stringNumber}-${vibKey}`}
                    className={`relative flex-1 w-full flex items-center ${
                      vibKey > 0 ? 'guitar-string-vibrate' : ''
                    }`}
                  >
                    <div
                      className="w-full transition-shadow duration-150"
                      style={{
                        height: `${str.thicknessPx}px`,
                        background: isLitString
                          ? 'linear-gradient(90deg, #FF8C42 0%, #FFE2C4 50%, #00E5FF 100%)'
                          : str.wound
                            ? 'repeating-linear-gradient(90deg, #B89D7A 0px, #7A664D 2px, #D2B896 4px)'
                            : 'linear-gradient(180deg, #E2E8F0 0%, #94A3B8 100%)',
                        boxShadow: isLitString
                          ? '0 0 8px rgba(255, 90, 0, 0.65)'
                          : '0 1px 2px rgba(0, 0, 0, 0.85)',
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Luminous Dotted Interval Connector Arc (Root #FF5A00 -> Target #00E5FF) */}
            {intervalConnector && (
              <svg
                aria-hidden="true"
                viewBox="0 0 1000 120"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 z-25 w-full h-full"
                fill="none"
              >
                <defs>
                  <linearGradient
                    id="intervalArcGrad"
                    x1={intervalConnector.x1}
                    y1={intervalConnector.y1}
                    x2={intervalConnector.x2}
                    y2={intervalConnector.y2}
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop offset="0%" stopColor="#FF5A00" />
                    <stop offset="50%" stopColor="#FFB84D" />
                    <stop offset="100%" stopColor="#00E5FF" />
                  </linearGradient>
                </defs>
                {/* Soft outer glow trail */}
                <path
                  d={intervalConnector.d}
                  stroke="url(#intervalArcGrad)"
                  strokeWidth="5"
                  strokeOpacity="0.28"
                  strokeLinecap="round"
                />
                {/* Crisp luminous dotted connector */}
                <path
                  d={intervalConnector.d}
                  stroke="url(#intervalArcGrad)"
                  strokeWidth="2.2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
              </svg>
            )}

            {/* Interactive 6 x 16 String-Fret Touch Matrix */}
            <div className="absolute inset-0 z-30 flex flex-col">
              {GUITAR_STRINGS.map((str, sIdx) => (
                <div
                  key={str.stringNumber}
                  className="grid flex-1 items-center"
                  style={{ gridTemplateColumns: `repeat(${FRET_COLUMNS}, minmax(0, 1fr))` }}
                >
                  {FRET_NUMBERS.map((fret) => {
                    const midi = str.openMidi + fret;
                    const key = `${sIdx}-${fret}`;
                    const hlPos = highlightLookup.get(key);
                    const isPressed =
                      pressedPos?.stringIdx === sIdx && pressedPos?.fret === fret;
                    const isPulsing =
                      !blindMode && hlPos !== undefined && activePulseMidi === midi;
                    const isHighlighted = !blindMode && hlPos !== undefined;
                    const isIdleAnchorCell =
                      showIdleAnchor &&
                      activeRootAnchor?.stringIdx === sIdx &&
                      activeRootAnchor?.fret === fret;

                    const isRoot =
                      isHighlighted &&
                      (highlightMode === 'interval'
                        ? highlightedPositions[0]?.stringIdx === sIdx &&
                          highlightedPositions[0]?.fret === fret
                        : rootPitchClass !== undefined &&
                          ((midi % 12) + 12) % 12 === rootPitchClass);

                    const shortNote = formatMidiNote(midi, lang, false);
                    const localizedOpenLabel = openLabels[sIdx];

                    return (
                      <button
                        key={key}
                        type="button"
                        disabled={readOnly}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          handleFretClick(sIdx, fret);
                        }}
                        aria-label={t.lab.guitarCellAria(
                          str.stringNumber,
                          localizedOpenLabel,
                          fret,
                          formatMidiNote(midi, lang)
                        )}
                        className={`group relative h-full w-full flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FF5A00] ${
                          readOnly ? 'cursor-default' : 'cursor-pointer'
                        }`}
                      >
                        {/* Open-string tuning label at fret 0 when not lit */}
                        {fret === 0 && !isPressed && !isHighlighted && (
                          <span
                            className={`px-1 py-[1px] rounded text-[9px] font-mono font-bold leading-none bg-[#0B0D14]/90 border transition-colors ${
                              isIdleAnchorCell
                                ? 'border-[#FF5A00] text-[#FF8A4C] shadow-[0_0_8px_rgba(255,90,0,0.4)]'
                                : 'border-white/12 text-[#9CA3AF] group-hover:text-white group-hover:border-[#FF5A00]/60'
                            }`}
                          >
                            {localizedOpenLabel}
                          </span>
                        )}

                        {/* Hover ghost preview on fretted intersections */}
                        {fret > 0 && !isPressed && !isHighlighted && !isIdleAnchorCell && !readOnly && (
                          <span className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded-full bg-white/15 border border-white/40 transition-opacity" />
                        )}

                        {/* Single clear idle Root anchor ring (ONLY when no notes are lit) */}
                        {fret > 0 && isIdleAnchorCell && (
                          <span
                            title={t.lab.guitarAnchorTitle(formatMidiNote(midi, lang))}
                            className="w-4 h-4 rounded-full bg-[#090B11]/90 border-2 border-[#FF5A00] shadow-[0_0_10px_rgba(255,90,0,0.55)]"
                          />
                        )}

                        {/* Active / Pressed / Highlighted Illuminated Note Marker */}
                        {(isPressed || isHighlighted) && (
                          <span
                            className={`relative z-10 min-w-[20px] sm:min-w-[22px] h-[16px] sm:h-[17px] px-1 rounded-full font-mono text-[9px] sm:text-[10px] font-extrabold leading-none flex items-center justify-center transition-transform duration-100 ${
                              isPressed || isRoot
                                ? 'bg-[#FF5A00] text-white border border-[#FFD1B5] shadow-[0_0_12px_rgba(255,90,0,0.85)]'
                                : 'bg-[#00E5FF] text-[#071118] border border-white/75 shadow-[0_0_10px_rgba(0,229,255,0.75)]'
                            } ${isPressed || isPulsing ? 'scale-115 ring-2 ring-white/80' : ''}`}
                          >
                            {blindMode ? '♪' : shortNote}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Discreet Fret Number Ruler (0..15) */}
          <div
            className="grid pt-1 text-center font-mono text-[9px] sm:text-[10px] leading-none"
            style={{ gridTemplateColumns: `repeat(${FRET_COLUMNS}, minmax(0, 1fr))` }}
          >
            {FRET_NUMBERS.map((fret) => {
              const isLandmark = SINGLE_INLAY_FRETS.has(fret) || DOUBLE_INLAY_FRETS.has(fret);
              return (
                <span
                  key={`num-${fret}`}
                  className={
                    fret === 0
                      ? 'text-[#FF8A4C] font-bold'
                      : isLandmark
                        ? 'text-[#C5CAD8] font-bold'
                        : 'text-[#5C637B]'
                  }
                >
                  {fret === 0 ? t.lab.guitarOpenLabel : fret}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
