import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Guitar,
  Lock,
  Piano,
  Play,
  Shuffle,
  Volume2,
  XCircle,
} from 'lucide-react';
import { AudioEngine } from '../engines/AudioEngine';
import {
  buildChordMidi,
  buildProgressionChordVoicing,
  buildScaleMidi,
  CADENCES,
  CHORDS,
  INTERVALS,
  POPULAR_PROGRESSIONS,
  SCALES,
} from '../engines/MusicTheory';
import { useI18n } from '../i18n/I18nContext';
import {
  formatMidiNote,
  getLocalizedChord,
  getLocalizedInterval,
  getLocalizedProgression,
  getLocalizedScale,
  getNoteNames,
} from '../i18n/musicLocalization';
import { LabModuleId, LicenseAdapter } from '../services/LicenseAdapter';
import { InstrumentType, LicensePlan } from '../types/music';
import {
  adaptNotesForGuitarRange,
  GuitarFretboard,
  GuitarHighlightMode,
} from './GuitarFretboard';
import { VirtualPiano } from './VirtualPiano';

interface EarTrainingLaboratoryProps {
  licensePlan: LicensePlan;
  instrument: InstrumentType;
  initialModule?: LabModuleId;
  onChangeInstrument: (inst: InstrumentType) => void;
  onOpenLicense: () => void;
}

const MODULE_IDS: LabModuleId[] = [
  'keyboard',
  'intervals',
  'chords',
  'scales',
  'progressions',
  'melody',
];

export const EarTrainingLaboratory: React.FC<EarTrainingLaboratoryProps> = ({
  licensePlan,
  instrument,
  initialModule,
  onChangeInstrument,
  onOpenLicense,
}) => {
  const { lang, t } = useI18n();
  const [activeModule, setActiveModule] = useState<LabModuleId>(initialModule ?? 'intervals');
  const [rootPitchClass, setRootPitchClass] = useState(0);
  const [octave, setOctave] = useState<number>(4);

  useEffect(() => {
    if (initialModule) {
      setActiveModule(initialModule);
    }
  }, [initialModule]);
  const [harmonicIntervalMode, setHarmonicIntervalMode] = useState(false);
  const [chordInversion, setChordInversion] = useState<0 | 1 | 2>(0);
  const [highlightedMidi, setHighlightedMidi] = useState<number[]>([]);
  const [highlightMode, setHighlightMode] = useState<GuitarHighlightMode>('interval');
  const [highlightRootMidi, setHighlightRootMidi] = useState<number | undefined>(undefined);
  const [activePulseMidi, setActivePulseMidi] = useState<number | null>(null);
  const [activeDescription, setActiveDescription] = useState<string>(() =>
    instrument === 'guitar' ? t.lab.idleGuitar : t.lab.idlePiano
  );

  const [melodyTarget, setMelodyTarget] = useState<number[]>([]);
  const [melodyUserInput, setMelodyUserInput] = useState<number[]>([]);
  const [melodyStatus, setMelodyStatus] = useState<'idle' | 'playing' | 'correct' | 'wrong'>('idle');

  const prevInstrumentRef = useRef<InstrumentType>(instrument);

  const rootMidi = (octave + 1) * 12 + rootPitchClass;
  const isGuitar = instrument === 'guitar';
  const noteNames = getNoteNames(lang);

  // Synchronize console message whenever instrument switches (keep real reference octave 4)
  useEffect(() => {
    if (prevInstrumentRef.current !== instrument) {
      prevInstrumentRef.current = instrument;
      AudioEngine.stopAll();
      setActivePulseMidi(null);
      setHighlightedMidi([]);
      setHighlightRootMidi(undefined);
      setActiveDescription(instrument === 'guitar' ? t.lab.idleGuitar : t.lab.idlePiano);
    }
  }, [instrument, t.lab.idleGuitar, t.lab.idlePiano]);

  // Refresh idle console prompt on language switch
  useEffect(() => {
    setActiveDescription(instrument === 'guitar' ? t.lab.idleGuitar : t.lab.idlePiano);
  }, [lang, instrument, t.lab.idleGuitar, t.lab.idlePiano]);

  useEffect(() => {
    return () => {
      AudioEngine.stopAll();
    };
  }, []);

  const isModuleAllowed = LicenseAdapter.canAccessLabModule(activeModule, licensePlan);

  const handleSelectInstrument = (nextInst: InstrumentType) => {
    if (nextInst !== instrument) {
      onChangeInstrument(nextInst);
    }
  };

  const playIntervalItem = async (semitones: number, label: string, character: string) => {
    const rawNotes = [rootMidi, rootMidi + semitones];
    const notes = isGuitar ? adaptNotesForGuitarRange(rawNotes) : rawNotes;

    setHighlightMode('interval');
    setHighlightRootMidi(notes[0]);
    setHighlightedMidi(notes);
    setActivePulseMidi(null);
    setActiveDescription(
      `${label} (${formatMidiNote(notes[0], lang)} → ${formatMidiNote(notes[1], lang)}) · ${character}`
    );

    const events = harmonicIntervalMode
      ? [{ type: 'chord' as const, midiNotes: notes, startBeat: 0, durationBeats: 2.0 }]
      : [
          { type: 'note' as const, midiNotes: [notes[0]], startBeat: 0, durationBeats: 0.9 },
          { type: 'note' as const, midiNotes: [notes[1]], startBeat: 0.95, durationBeats: 1.3 },
        ];

    await AudioEngine.playSequence(
      { tempoBpm: 96, events, totalBeats: 2.4, instrument },
      {
        instrument,
        onEventStart: (_idx, midiNotes) => {
          if (!harmonicIntervalMode && midiNotes.length === 1) {
            setActivePulseMidi(midiNotes[0]);
          }
        },
        onComplete: () => {
          setActivePulseMidi(null);
        },
      }
    );
  };

  const playChordItem = async (chordId: string, label: string, character: string) => {
    const rawNotes = buildChordMidi(rootMidi, chordId, chordInversion);
    const notes = isGuitar ? adaptNotesForGuitarRange(rawNotes) : rawNotes;

    setHighlightMode('chord');
    setHighlightRootMidi(rootMidi);
    setHighlightedMidi(notes);
    setActivePulseMidi(null);
    setActiveDescription(
      `${label} (${notes.map((n) => formatMidiNote(n, lang, false)).join(' - ')}) · ${character}`
    );
    await AudioEngine.playChordNow(notes, 1.4, instrument, false);
  };

  const playScaleItem = async (scaleId: string, label: string, character: string) => {
    const rawNotes = buildScaleMidi(rootMidi, scaleId);
    const notes = isGuitar ? adaptNotesForGuitarRange(rawNotes) : rawNotes;

    setHighlightMode('scale');
    setHighlightRootMidi(notes[0]);
    setHighlightedMidi(notes);
    setActivePulseMidi(null);
    setActiveDescription(
      `${t.lab.scaleOf(label, formatMidiNote(notes[0], lang, false))} (${notes.map((n) => formatMidiNote(n, lang, false)).join('–')}) · ${character}`
    );
    await AudioEngine.playSequence(
      {
        tempoBpm: 120,
        instrument,
        totalBeats: notes.length * 0.52 + 0.8,
        events: notes.map((n, idx) => ({
          type: 'note',
          midiNotes: [n],
          startBeat: idx * 0.52,
          durationBeats: idx === notes.length - 1 ? 1.2 : 0.48,
        })),
      },
      {
        instrument,
        onEventStart: (_idx, midiNotes) => {
          if (midiNotes.length > 0) {
            setActivePulseMidi(midiNotes[0]);
          }
        },
        onComplete: () => {
          setActivePulseMidi(null);
        },
      }
    );
  };

  const playProgressionItem = async (prog: (typeof POPULAR_PROGRESSIONS)[number]) => {
    const effectiveRoot = isGuitar ? adaptNotesForGuitarRange([rootMidi])[0] : rootMidi;
    const locProg = getLocalizedProgression(prog.id, lang);
    setActiveDescription(
      `${t.lab.progressionInMajor(locProg.name, formatMidiNote(effectiveRoot, lang, false))} · ${locProg.description}`
    );

    const chordRoots = prog.degrees.map((deg) => effectiveRoot + deg.rootOffset);
    const events = prog.degrees.map((deg, idx) => {
      const rawVoicing = buildProgressionChordVoicing(effectiveRoot, deg.rootOffset, deg.quality);
      const voicing = isGuitar ? adaptNotesForGuitarRange(rawVoicing) : rawVoicing;
      return {
        type: 'chord' as const,
        midiNotes: voicing,
        startBeat: idx * 1.65,
        durationBeats: 1.5,
      };
    });

    setHighlightMode('chord');
    setActivePulseMidi(null);

    await AudioEngine.playSequence(
      {
        tempoBpm: 98,
        instrument,
        events,
        totalBeats: prog.degrees.length * 1.65 + 0.5,
      },
      {
        instrument,
        onEventStart: (idx, midiNotes) => {
          setHighlightRootMidi(chordRoots[idx]);
          setHighlightedMidi(midiNotes);
        },
      }
    );
  };

  const startRandomMelodyMemory = async () => {
    const scale = [60, 62, 64, 65, 67, 69, 71, 72];
    const seq: number[] = [60];
    let idx = 0;
    for (let i = 0; i < 3; i++) {
      const moves = [-2, -1, 1, 2].filter((d) => idx + d >= 0 && idx + d < scale.length);
      idx += moves[Math.floor(Math.random() * moves.length)];
      seq.push(scale[idx]);
    }
    setMelodyTarget(seq);
    setMelodyUserInput([]);
    setMelodyStatus('playing');
    setHighlightedMidi([]);
    setHighlightRootMidi(60);
    setActivePulseMidi(null);
    const startNoteLabel = formatMidiNote(60, lang, true);
    setActiveDescription(
      isGuitar
        ? t.lab.melodyPromptGuitar(startNoteLabel)
        : t.lab.melodyPromptPiano(startNoteLabel)
    );

    await AudioEngine.playSequence(
      {
        tempoBpm: 96,
        instrument,
        totalBeats: seq.length + 0.6,
        events: seq.map((n, i) => ({
          type: 'note',
          midiNotes: [n],
          startBeat: i,
          durationBeats: 0.85,
        })),
      },
      { instrument }
    );
  };

  const replayMelodyMemory = async () => {
    if (melodyTarget.length === 0) return;
    await AudioEngine.playSequence(
      {
        tempoBpm: 96,
        instrument,
        totalBeats: melodyTarget.length + 0.6,
        events: melodyTarget.map((n, i) => ({
          type: 'note',
          midiNotes: [n],
          startBeat: i,
          durationBeats: 0.85,
        })),
      },
      { instrument }
    );
  };

  const handleInstrumentPlay = (midi: number) => {
    if (activeModule === 'melody' && melodyTarget.length > 0 && melodyStatus === 'playing') {
      const next = [...melodyUserInput, midi];
      setMelodyUserInput(next);
      if (next.length === melodyTarget.length) {
        const ok = next.every((m, idx) => m === melodyTarget[idx]);
        setMelodyStatus(ok ? 'correct' : 'wrong');
        setHighlightMode('melody');
        setHighlightRootMidi(melodyTarget[0]);
        setHighlightedMidi(melodyTarget);
        const melodyNotesStr = melodyTarget.map((n) => formatMidiNote(n, lang)).join(' → ');
        setActiveDescription(
          ok ? t.lab.melodyExactConsole(melodyNotesStr) : t.lab.melodyWrongConsole(melodyNotesStr)
        );
        void AudioEngine.playFeedback(ok ? 'correct' : 'wrong');
      }
      return;
    }

    setHighlightMode('single');
    setHighlightRootMidi(midi);
    setActivePulseMidi(null);
    setHighlightedMidi([midi]);
    setActiveDescription(t.lab.playedNote(formatMidiNote(midi, lang), midi));
  };

  const getModuleLabel = (id: LabModuleId): string => {
    switch (id) {
      case 'keyboard':
        return isGuitar ? t.lab.modules.keyboardGuitar : t.lab.modules.keyboardPiano;
      case 'intervals':
        return t.lab.modules.intervals;
      case 'chords':
        return t.lab.modules.chords;
      case 'scales':
        return t.lab.modules.scales;
      case 'progressions':
        return t.lab.modules.progressions;
      case 'melody':
        return t.lab.modules.melody;
    }
  };

  return (
    <div className="h-full w-full min-h-0 min-w-0 flex flex-col justify-start overflow-hidden arcade-grid-bg select-none">
      {/* TOP COMPACT SYNTH RACK BAR */}
      <div className="shrink-0 bg-[#0D0F18]/95 border-b border-white/10 px-2.5 sm:px-5 py-1.5 flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 min-w-0">
        {/* Module Selector */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
          {MODULE_IDS.map((modId) => {
            const allowed = LicenseAdapter.canAccessLabModule(modId, licensePlan);
            const isActive = activeModule === modId;
            return (
              <button
                key={modId}
                type="button"
                onClick={() => setActiveModule(modId)}
                className={`h-7 sm:h-8 px-2.5 sm:px-3 rounded-lg text-[11px] sm:text-xs font-display font-bold inline-flex items-center gap-1 whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'arcade-btn-orange text-white'
                    : 'bg-[#171926] hover:bg-[#212436] text-[#9CA3AF] hover:text-white border border-white/8'
                }`}
              >
                {!allowed && <Lock className="w-3 h-3 opacity-80" />}
                <span>{getModuleLabel(modId)}</span>
              </button>
            );
          })}
        </div>

        {/* Compact Synth Hardware Controls: Instrument, Key, Octave */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center p-0.5 rounded-lg bg-[#14151D] border border-white/10">
            <button
              type="button"
              onClick={() => handleSelectInstrument('piano')}
              className={`h-6 sm:h-7 px-2 sm:px-2.5 rounded-md text-[11px] font-bold inline-flex items-center gap-1 transition-all ${
                instrument === 'piano' ? 'arcade-btn-orange text-white' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Piano className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.lab.piano}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectInstrument('guitar')}
              className={`h-6 sm:h-7 px-2 sm:px-2.5 rounded-md text-[11px] font-bold inline-flex items-center gap-1 transition-all ${
                instrument === 'guitar' ? 'arcade-btn-orange text-white' : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              <Guitar className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.lab.guitar}</span>
            </button>
          </div>

          <label className="flex items-center gap-1 bg-[#14151D] border border-white/10 rounded-lg px-2 h-7 sm:h-8 text-[11px] text-[#9CA3AF]">
            <span className="hidden sm:inline">{t.lab.root}</span>
            <select
              value={rootPitchClass}
              onChange={(e) => {
                setRootPitchClass(Number(e.target.value));
                setHighlightedMidi([]);
                setHighlightRootMidi(undefined);
                setActivePulseMidi(null);
              }}
              className="bg-transparent text-[#00E5FF] font-mono font-bold focus:outline-none cursor-pointer"
            >
              {noteNames.map((name, idx) => (
                <option key={name} value={idx} className="bg-[#14151D] text-white">
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-1 bg-[#14151D] border border-white/10 rounded-lg px-2 h-7 sm:h-8 text-[11px] text-[#9CA3AF]">
            <span className="hidden sm:inline">{t.lab.octaveShort}</span>
            <select
              value={octave}
              onChange={(e) => {
                setOctave(Number(e.target.value));
                setHighlightedMidi([]);
                setHighlightRootMidi(undefined);
                setActivePulseMidi(null);
              }}
              className="bg-transparent text-[#FFB800] font-mono font-bold focus:outline-none cursor-pointer"
            >
              {[3, 4, 5].map((oct) => (
                <option key={oct} value={oct} className="bg-[#14151D] text-white">
                  {oct}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* UNIFIED COMPACT STUDIO WORKSPACE: Status + Pads + Piano/Guitar directly stacked with zero dead void */}
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto">
        <div className="max-w-6xl w-full mx-auto px-2.5 sm:px-5 py-2 sm:py-3 flex flex-col justify-start gap-2.5 sm:gap-3">
          {/* Slim Synth LED Status Bar */}
          <div className="shrink-0 rounded-xl bg-[#0D101A] border border-[#00E5FF]/25 px-3 py-1.5 flex items-center justify-between gap-3">
            <p className="text-[11px] sm:text-xs text-[#E5E9F5] truncate">{activeDescription}</p>
            <span className="font-mono text-[11px] font-bold text-[#00E5FF] shrink-0">
              {formatMidiNote(rootMidi, lang)}
            </span>
          </div>

          {/* Compact Module Pad Deck (shrink-0, hugs content tightly) */}
          <div className="shrink-0 rounded-2xl bg-[#14151D]/90 border border-white/10 p-2.5 sm:p-3.5 flex flex-col justify-start">
            {!isModuleAllowed ? (
              <div className="text-center max-w-md mx-auto py-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1C1D29] border border-[#FFB800]/40 text-[#FFB800] flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-5 h-5" />
                </div>
                <h2 className="font-display text-base sm:text-lg font-extrabold text-white">
                  {t.lab.premiumTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1">
                  {t.lab.premiumDesc}
                </p>
                <button
                  type="button"
                  onClick={onOpenLicense}
                  className="mt-3 h-10 px-5 rounded-xl arcade-btn-gold text-[#090B11] text-xs font-display font-extrabold"
                >
                  {t.lab.viewPremiumLicense}
                </button>
              </div>
            ) : activeModule === 'keyboard' ? (
              <div className="text-center max-w-lg mx-auto py-2 space-y-1">
                <h2 className="font-display text-base sm:text-lg font-extrabold text-white">
                  {isGuitar ? t.lab.freeGuitarTitle : t.lab.freePianoTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[#9CA3AF]">
                  {isGuitar ? t.lab.freeGuitarDesc : t.lab.freePianoDesc}
                </p>
              </div>
            ) : activeModule === 'intervals' ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between shrink-0">
                  <span className="font-display text-xs sm:text-sm font-bold text-white">
                    {t.lab.intervalPadsTitle(formatMidiNote(rootMidi, lang))}
                  </span>
                  <div className="flex items-center p-0.5 rounded-lg bg-[#0D0F18] border border-white/10">
                    <button
                      type="button"
                      onClick={() => setHarmonicIntervalMode(false)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                        !harmonicIntervalMode ? 'arcade-btn-orange text-white' : 'text-[#9CA3AF] hover:text-white'
                      }`}
                    >
                      {t.lab.melodic}
                    </button>
                    <button
                      type="button"
                      onClick={() => setHarmonicIntervalMode(true)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                        harmonicIntervalMode
                          ? 'bg-[#00E5FF] text-[#090B11] border border-white/25 shadow-[0_4px_12px_rgba(0,229,255,0.25)]'
                          : 'text-[#9CA3AF] hover:text-white'
                      }`}
                    >
                      {t.lab.harmonic}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {INTERVALS.map((iv) => {
                    const locIv = getLocalizedInterval(iv.id, lang);
                    return (
                      <button
                        key={iv.id}
                        type="button"
                        onClick={() => playIntervalItem(iv.semitones, locIv.name, locIv.character)}
                        className="rounded-xl arcade-btn-dark border border-white/10 hover:border-[#FF5A00]/60 py-2.5 px-3 text-left flex flex-col justify-between gap-1 min-w-0"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono text-xs sm:text-sm font-extrabold text-[#FF5A00]">
                            {locIv.shortName}
                          </span>
                          <Volume2 className="w-3.5 h-3.5 text-[#00E5FF] opacity-80 shrink-0" />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[11px] font-bold text-white truncate">
                            {locIv.name}
                          </span>
                          <span className="block text-[10px] font-mono text-[#8E95AE]">
                            {iv.semitones} {t.lab.semitoneShort}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : activeModule === 'chords' ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between shrink-0">
                  <span className="font-display text-xs sm:text-sm font-bold text-white">
                    {t.lab.chordPadsTitle(formatMidiNote(rootMidi, lang, false))}
                  </span>
                  <div className="flex items-center p-0.5 rounded-lg bg-[#0D0F18] border border-white/10">
                    {([0, 1, 2] as const).map((inv) => (
                      <button
                        key={inv}
                        type="button"
                        onClick={() => setChordInversion(inv)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                          chordInversion === inv ? 'arcade-btn-orange text-white' : 'text-[#9CA3AF] hover:text-white'
                        }`}
                      >
                        {inv === 0
                          ? t.lab.rootPosShort
                          : inv === 1
                            ? t.lab.firstInvShort
                            : t.lab.secondInvShort}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CHORDS.map((ch) => {
                    const locCh = getLocalizedChord(ch.id, lang);
                    return (
                      <button
                        key={ch.id}
                        type="button"
                        onClick={() => playChordItem(ch.id, locCh.name, locCh.character)}
                        className="rounded-xl arcade-btn-dark border border-white/10 hover:border-[#00E5FF]/60 py-2.5 px-3 text-left flex flex-col justify-between gap-1 min-w-0"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display text-sm font-extrabold text-[#FFB800]">
                            {locCh.shortName}
                          </span>
                          <Play className="w-3.5 h-3.5 text-[#FF5A00] fill-[#FF5A00]" />
                        </div>
                        <span className="text-[11px] text-[#C5CAD8] truncate">{locCh.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : activeModule === 'scales' ? (
              <div className="flex flex-col gap-2">
                <span className="font-display text-xs sm:text-sm font-bold text-white shrink-0">
                  {t.lab.scalesTitle(formatMidiNote(rootMidi, lang, false))}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SCALES.map((sc) => {
                    const locSc = getLocalizedScale(sc.id, lang);
                    return (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => playScaleItem(sc.id, locSc.name, locSc.character)}
                        className="rounded-xl arcade-btn-dark border border-white/10 hover:border-[#FF5A00]/60 py-2.5 px-3 text-left flex flex-col justify-between gap-1 min-w-0"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display font-bold text-xs sm:text-sm text-white truncate">
                            {locSc.name}
                          </span>
                          <Volume2 className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-[#9CA3AF] line-clamp-2">
                          {locSc.character}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : activeModule === 'progressions' ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[...CADENCES, ...POPULAR_PROGRESSIONS].map((item) => {
                  const locProg = getLocalizedProgression(item.id, lang);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => playProgressionItem(item)}
                      className="rounded-xl arcade-btn-dark border border-white/10 hover:border-[#00E5FF]/60 py-2.5 px-3 text-left flex flex-col justify-between gap-1 min-w-0"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-xs font-extrabold text-[#00E5FF]">
                          {item.roman}
                        </span>
                        <Play className="w-3.5 h-3.5 text-[#FF5A00] fill-[#FF5A00] shrink-0" />
                      </div>
                      <span className="text-[11px] font-medium text-white line-clamp-2">
                        {locProg.name.split(' (')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 py-1">
                <div>
                  <h2 className="font-display text-base sm:text-lg font-extrabold text-white">
                    {t.lab.melodyTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#9CA3AF] mt-0.5">
                    {isGuitar
                      ? t.lab.melodyDescGuitar(formatMidiNote(60, lang, false))
                      : t.lab.melodyDescPiano(formatMidiNote(60, lang, false))}
                  </p>
                  {melodyStatus === 'correct' && (
                    <p className="mt-1.5 text-xs sm:text-sm text-emerald-400 inline-flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.lab.melodySuccessMsg}</span>
                    </p>
                  )}
                  {melodyStatus === 'wrong' && (
                    <p className="mt-1.5 text-xs sm:text-sm text-rose-400 inline-flex items-center gap-1.5 font-bold">
                      <XCircle className="w-4 h-4" />
                      <span>{isGuitar ? t.lab.melodyHintGuitar : t.lab.melodyHintPiano}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={startRandomMelodyMemory}
                    className="h-10 px-4 rounded-xl arcade-btn-orange text-xs sm:text-sm font-display font-extrabold text-white inline-flex items-center gap-2"
                  >
                    <Shuffle className="w-4 h-4" />
                    <span>{t.lab.newMelody}</span>
                  </button>
                  {melodyTarget.length > 0 && (
                    <button
                      type="button"
                      onClick={replayMelodyMemory}
                      className="h-10 px-3.5 rounded-xl arcade-btn-dark border border-white/12 text-xs font-bold text-white inline-flex items-center gap-1.5"
                    >
                      <Volume2 className="w-4 h-4 text-[#00E5FF]" />
                      <span>{t.lab.replay}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* INTERACTIVE SYNTHESIZER: VIRTUAL PIANO OR GUITAR FRETBOARD (IMMEDIATELY BELOW PADS, ZERO GAP) */}
          <div className="shrink-0 w-full mt-1 overflow-x-auto no-scrollbar">
            {isGuitar ? (
              <GuitarFretboard
                highlightedMidi={highlightedMidi}
                activePulseMidi={activePulseMidi}
                highlightMode={highlightMode}
                rootMidi={highlightRootMidi ?? rootMidi}
                anchorMidi={activeModule === 'melody' ? 60 : rootMidi}
                blindMode={activeModule === 'melody' && melodyStatus === 'playing'}
                onPlayNote={handleInstrumentPlay}
              />
            ) : (
              <VirtualPiano
                startMidi={activeModule === 'melody' ? 60 : Math.max(48, (octave + 1) * 12 - 12)}
                endMidi={activeModule === 'melody' ? 72 : Math.min(84, (octave + 1) * 12 + 12)}
                instrument={instrument}
                blindMode={activeModule === 'melody' && melodyStatus === 'playing'}
                highlightedMidi={highlightedMidi}
                anchorMidi={activeModule === 'melody' ? 60 : rootMidi}
                showLabels={activeModule !== 'melody' || melodyStatus !== 'playing'}
                studioHeight="lg"
                onPlayNote={handleInstrumentPlay}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

