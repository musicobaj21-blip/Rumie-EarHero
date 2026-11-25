import React, { useState } from 'react';
import { AudioEngine } from '../engines/AudioEngine';
import { isBlackKey } from '../engines/MusicTheory';
import { useI18n } from '../i18n/I18nContext';
import { formatMidiNote } from '../i18n/musicLocalization';
import { InstrumentType } from '../types/music';

interface VirtualPianoProps {
  startMidi?: number;
  endMidi?: number;
  instrument?: InstrumentType;
  /** When true (during evaluated missions before submitting), never highlight target answers */
  blindMode?: boolean;
  /** Highlighted MIDI notes (shown only when blindMode is false) */
  highlightedMidi?: number[];
  /** Optional anchor/root note to subtly mark (e.g. starting Do4) */
  anchorMidi?: number;
  /** Show note names on white keys (disabled in blind mission tests, enabled in Lab) */
  showLabels?: boolean;
  /** Disable user input (e.g. post-answer review) */
  readOnly?: boolean;
  /** Compact height for post-answer pedagogical reveal or mobile */
  compact?: boolean;
  /** Extra-compact studio mode for 100dvh fixed screens */
  studioHeight?: 'sm' | 'md' | 'lg';
  onPlayNote?: (midi: number) => void;
}

export const VirtualPiano: React.FC<VirtualPianoProps> = ({
  startMidi = 60,
  endMidi = 72,
  instrument = 'piano',
  blindMode = false,
  highlightedMidi = [],
  anchorMidi,
  showLabels = false,
  readOnly = false,
  compact = false,
  studioHeight = 'md',
  onPlayNote,
}) => {
  const { lang, t } = useI18n();
  const [pressedMidi, setPressedMidi] = useState<number | null>(null);

  const allMidi: number[] = [];
  for (let m = startMidi; m <= endMidi; m++) {
    allMidi.push(m);
  }

  const whiteKeys = allMidi.filter((m) => !isBlackKey(m));
  const whiteCount = whiteKeys.length;

  const blackKeys: { midi: number; leftPercent: number }[] = [];
  let whiteIdx = 0;
  for (let i = 0; i < allMidi.length; i++) {
    const m = allMidi[i];
    if (!isBlackKey(m)) {
      whiteIdx += 1;
    } else {
      const leftPercent = (whiteIdx / whiteCount) * 100;
      blackKeys.push({ midi: m, leftPercent });
    }
  }

  const highlightSet = new Set(blindMode ? [] : highlightedMidi);

  const handleTrigger = (midi: number) => {
    if (readOnly) return;
    setPressedMidi(midi);
    void AudioEngine.playSingleNote(midi, 0.7, instrument);
    onPlayNote?.(midi);
    window.setTimeout(() => {
      setPressedMidi((prev) => (prev === midi ? null : prev));
    }, 180);
  };

  const heightClass = compact
    ? 'h-16 sm:h-20'
    : studioHeight === 'sm'
      ? 'h-24 sm:h-28'
      : studioHeight === 'lg'
        ? 'h-[144px] sm:h-[160px]'
        : 'h-28 sm:h-32';

  const blackHeightClass = compact
    ? 'h-10 sm:h-12'
    : studioHeight === 'sm'
      ? 'h-15 sm:h-17'
      : studioHeight === 'lg'
        ? 'h-[88px] sm:h-[98px]'
        : 'h-17 sm:h-20';

  return (
    <div
      className="w-full select-none rounded-xl bg-[#0B0D14] p-1.5 sm:p-2 border border-white/12 shadow-[inset_0_2px_12px_rgba(0,0,0,0.75)]"
      role="group"
      aria-label={t.lab.pianoAria}
    >
      {/* Top synth LED rail */}
      <div className="h-1 w-full rounded-full bg-gradient-to-r from-[#FF5A00]/60 via-[#00E5FF]/50 to-[#FF5A00]/60 mb-1.5 opacity-80" />

      <div className={`relative w-full ${heightClass} flex gap-[2px]`}>
        {/* White Keys */}
        {whiteKeys.map((midi) => {
          const isPressed = pressedMidi === midi;
          const isHighlighted = highlightSet.has(midi);
          const isAnchor = anchorMidi === midi;
          const noteLabel = formatMidiNote(midi, lang, false);

          let keyStyle =
            'bg-gradient-to-b from-[#FFFFFF] via-[#F4F6FB] to-[#DFE3EE] text-[#14151D] shadow-[0_4px_0_#9AA3B8] hover:brightness-105';
          if (isPressed) {
            keyStyle =
              'bg-gradient-to-b from-[#FF7828] to-[#FF5A00] text-white shadow-[0_1px_0_#9E3500,0_0_18px_rgba(255,90,0,0.65)] translate-y-[3px]';
          } else if (isHighlighted) {
            keyStyle =
              'bg-gradient-to-b from-[#33EEFF] to-[#00B8D4] text-[#071118] shadow-[0_3px_0_#006B7D,0_0_18px_rgba(0,229,255,0.55)]';
          }

          return (
            <button
              key={midi}
              type="button"
              disabled={readOnly}
              onPointerDown={(e) => {
                e.preventDefault();
                handleTrigger(midi);
              }}
              aria-label={t.lab.pianoNoteAria(formatMidiNote(midi, lang))}
              className={`relative flex-1 h-full rounded-b-lg rounded-t-[3px] transition-all duration-75 flex flex-col items-center justify-end pb-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00] ${keyStyle} ${
                readOnly ? 'cursor-default' : 'cursor-pointer active:translate-y-[3px]'
              }`}
            >
              {isAnchor && !isHighlighted && !isPressed && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#FF5A00] mb-1"
                  title={t.lab.referenceNoteTitle}
                />
              )}
              {(showLabels || isHighlighted || isAnchor) && (
                <span
                  className={`text-[10px] sm:text-[11px] font-mono font-bold leading-none ${
                    isPressed
                      ? 'text-white'
                      : isHighlighted
                        ? 'text-[#06131A]'
                        : 'text-[#393F54]'
                  }`}
                >
                  {noteLabel}
                </span>
              )}
            </button>
          );
        })}

        {/* Black Keys */}
        {blackKeys.map(({ midi, leftPercent }) => {
          const isPressed = pressedMidi === midi;
          const isHighlighted = highlightSet.has(midi);
          const blackWidthPercent = (0.62 / whiteCount) * 100;

          let bgClass =
            'bg-gradient-to-b from-[#2A2E42] via-[#171A26] to-[#0E1019] border-[#07090E] text-white/80 shadow-[0_4px_0_#05060A] hover:from-[#353A52]';
          if (isPressed) {
            bgClass =
              'bg-gradient-to-b from-[#FF7828] to-[#FF5A00] border-[#FF5A00] text-white shadow-[0_1px_0_#8C2E00,0_0_16px_rgba(255,90,0,0.75)] translate-y-[3px]';
          } else if (isHighlighted) {
            bgClass =
              'bg-gradient-to-b from-[#33EEFF] to-[#00B8D4] border-[#00E5FF] text-[#071118] shadow-[0_2px_0_#006B7D,0_0_16px_rgba(0,229,255,0.65)]';
          }

          return (
            <button
              key={midi}
              type="button"
              disabled={readOnly}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleTrigger(midi);
              }}
              style={{
                left: `${leftPercent - blackWidthPercent / 2}%`,
                width: `${blackWidthPercent}%`,
              }}
              aria-label={t.lab.pianoNoteAria(formatMidiNote(midi, lang))}
              className={`absolute top-0 z-10 ${blackHeightClass} rounded-b-md border transition-all duration-75 flex items-end justify-center pb-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A00] ${bgClass} ${
                readOnly ? 'cursor-default' : 'cursor-pointer active:translate-y-[3px]'
              }`}
            >
              {isHighlighted && !compact && (
                <span className="text-[9px] font-mono font-bold leading-none">
                  {formatMidiNote(midi, lang, false)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
