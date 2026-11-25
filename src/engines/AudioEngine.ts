import * as Tone from 'tone';
import { AudioSequence, InstrumentType } from '../types/music';
import { midiToFrequency, midiToToneNote } from './MusicTheory';

/** Lowest allowed note in guitar chords (E3 = MIDI 52 ≈ 164.81 Hz) to prevent low-end mud */
const GUITAR_CHORD_MIN_MIDI = 52;
const GUITAR_CHORD_MAX_MIDI = 84;
const GUITAR_STRUM_OFFSET_SEC = 0.02;

/**
 * Shared singleton audio engine powered by Tone.js + Web Audio API.
 * - Uses one shared AudioContext unlocked on user gesture.
 * - Transparent master DynamicsCompressorNode before destination guarantees 0% digital clipping.
 * - Supports warm acoustic piano synthesis and clean, distortion-free classical/acoustic guitar synthesis.
 */
class RumieAudioEngine {
  private initialized = false;
  private pianoSynth: Tone.PolySynth | null = null;
  private guitarBus: BiquadFilterNode | null = null;
  private activeGuitarVoices = new Set<() => void>();
  private kickSynth: Tone.MembraneSynth | null = null;
  private clickSynth: Tone.Synth | null = null;
  private feedbackSynth: Tone.PolySynth | null = null;
  private activeTimeouts: number[] = [];
  private isPlayingFlag = false;
  private listeners = new Set<(playing: boolean) => void>();

  public subscribePlayback(listener: (playing: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private setPlaying(state: boolean) {
    this.isPlayingFlag = state;
    this.listeners.forEach((fn) => fn(state));
  }

  public getIsPlaying(): boolean {
    return this.isPlayingFlag;
  }

  public async ensureReady(): Promise<void> {
    if (Tone.getContext().state !== 'running') {
      await Tone.start();
    }
    if (this.initialized) return;

    const rawCtx = Tone.getContext().rawContext as AudioContext;

    // Master transparent safety compressor before audioCtx.destination (0% digital clipping)
    const masterCompressor = rawCtx.createDynamicsCompressor();
    masterCompressor.threshold.value = -6;
    masterCompressor.knee.value = 12;
    masterCompressor.ratio.value = 6;
    masterCompressor.attack.value = 0.003;
    masterCompressor.release.value = 0.15;
    masterCompressor.connect(rawCtx.destination);

    // Master chain routed through transparent compressor
    const limiter = new Tone.Limiter(-2);
    Tone.connect(limiter, masterCompressor);

    const reverb = new Tone.Reverb({
      decay: 1.5,
      wet: 0.14,
    }).connect(limiter);

    const pianoFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: 3600,
      rolloff: -12,
    }).connect(reverb);

    // Warm acoustic piano approximation with rich overtones and natural decay
    this.pianoSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'custom',
        partials: [1, 0.45, 0.25, 0.14, 0.08, 0.04],
      },
      envelope: {
        attack: 0.008,
        decay: 0.55,
        sustain: 0.22,
        release: 1.05,
      },
      volume: -7,
    }).connect(pianoFilter);
    this.pianoSynth.maxPolyphony = 16;

    // Dedicated clean Acoustic/Classical Guitar bus:
    // Smooth highpass @ 140 Hz with Q = 0.5 (zero resonance, zero sub-bass rumble)
    const guitarHighpass = rawCtx.createBiquadFilter();
    guitarHighpass.type = 'highpass';
    guitarHighpass.frequency.value = 140;
    guitarHighpass.Q.value = 0.5;
    Tone.connect(guitarHighpass, reverb);
    this.guitarBus = guitarHighpass;

    // Crisp percussion voices for World 7 Rhythm
    this.kickSynth = new Tone.MembraneSynth({
      pitchDecay: 0.03,
      octaves: 4,
      envelope: {
        attack: 0.002,
        decay: 0.18,
        sustain: 0,
        release: 0.12,
      },
      volume: -7,
    }).connect(limiter);

    this.clickSynth = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.001,
        decay: 0.045,
        sustain: 0,
        release: 0.03,
      },
      volume: -10,
    }).connect(limiter);

    // Soft, respectful feedback chimes (never overly loud)
    this.feedbackSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.01,
        decay: 0.22,
        sustain: 0.05,
        release: 0.4,
      },
      volume: -16,
    }).connect(limiter);

    this.initialized = true;
  }

  /**
   * Protects Guitar chords (3+ notes) from low-register mud:
   * - Guarantees no chord tone falls below E3 (MIDI 52 ≈ 164.81 Hz).
   * - Preserves exact chord inversions when shifting upward by +12 semitones.
   * - Opens tight low-register thirds (+12) into clear acoustic guitar voicings.
   */
  private shapeGuitarChordVoicing(midiNotes: number[]): number[] {
    if (midiNotes.length === 0) return [];
    let voiced = [...midiNotes].sort((a, b) => a - b);

    if (voiced.length >= 3) {
      while (
        voiced[0] < GUITAR_CHORD_MIN_MIDI &&
        voiced[voiced.length - 1] + 12 <= GUITAR_CHORD_MAX_MIDI
      ) {
        voiced = voiced.map((n) => n + 12);
      }

      voiced = voiced.map((n) => {
        let v = n;
        while (v < GUITAR_CHORD_MIN_MIDI) v += 12;
        return v;
      });
      voiced = Array.from(new Set(voiced)).sort((a, b) => a - b);

      if (
        voiced.length >= 3 &&
        voiced[0] < 57 &&
        voiced[1] - voiced[0] <= 4 &&
        voiced[1] + 12 <= GUITAR_CHORD_MAX_MIDI
      ) {
        const opened = [...voiced];
        opened[1] += 12;
        voiced = Array.from(new Set(opened)).sort((a, b) => a - b);
      }
    }

    return voiced;
  }

  /**
   * Synthesizes a 100% clean, distortion-free classical/acoustic guitar string at exact pitch:
   * - Fundamental: smooth `triangle` at f (C4 = 261.63 Hz, zero downward octave shift)
   * - 2nd harmonic: pure `sine` at f * 2 @ 20% volume with fast 0.22s decay
   * - 3rd harmonic: pure `sine` at f * 3 @ 7% volume with short 0.10s decay
   * - Soft resonance-free lowpass (Q = 0.5): 2400 Hz -> 1100 Hz over 0.4s
   * - Click-free envelope: attack 0.006s, decay 1.2s, sustain 0.04, release 0.35s
   * - Conservative headroom: peakGain strictly capped at <= 0.18
   */
  private triggerGuitarPluck(
    midi: number,
    durationSec: number,
    startTime: number,
    peakGain: number
  ): void {
    if (!this.guitarBus) return;

    const rawCtx = Tone.getContext().rawContext as AudioContext;
    const freq = midiToFrequency(midi);
    const t0 = Math.max(rawCtx.currentTime + 0.002, startTime);
    const peak = Math.max(0.015, Math.min(0.18, peakGain));

    // Smooth resonance-free lowpass filter (Q = 0.5): 2400 Hz -> 1100 Hz in 0.4s
    const pluckLowpass = rawCtx.createBiquadFilter();
    pluckLowpass.type = 'lowpass';
    pluckLowpass.Q.setValueAtTime(0.5, t0);
    pluckLowpass.frequency.setValueAtTime(2400, t0);
    pluckLowpass.frequency.setValueAtTime(2400, t0 + 0.006);
    pluckLowpass.frequency.exponentialRampToValueAtTime(1100, t0 + 0.006 + 0.4);

    // Clean click-free amplitude envelope (A: 0.006s, D: 1.2s, S: 0.04, R: 0.35s)
    const ampGain = rawCtx.createGain();
    const attackEnd = t0 + 0.006;
    const decayTime = 1.2;
    const sustainRatio = 0.04;
    const releaseTime = 0.35;
    const sustainLevel = Math.max(0.0004, peak * sustainRatio);
    const releaseStart = Math.max(attackEnd + 0.05, t0 + durationSec);
    const stopTime = releaseStart + releaseTime + 0.03;

    ampGain.gain.setValueAtTime(0.0001, t0);
    ampGain.gain.linearRampToValueAtTime(peak, attackEnd);

    if (releaseStart < attackEnd + decayTime) {
      const elapsed = releaseStart - attackEnd;
      const levelAtRelease = Math.max(
        0.0004,
        peak * Math.pow(sustainRatio, elapsed / decayTime)
      );
      ampGain.gain.exponentialRampToValueAtTime(levelAtRelease, releaseStart);
    } else {
      ampGain.gain.exponentialRampToValueAtTime(sustainLevel, attackEnd + decayTime);
      ampGain.gain.setValueAtTime(sustainLevel, releaseStart);
    }
    ampGain.gain.exponentialRampToValueAtTime(0.0001, releaseStart + releaseTime);

    // 1) Fundamental: clean triangle oscillator at real frequency f
    const fundamentalOsc = rawCtx.createOscillator();
    fundamentalOsc.type = 'triangle';
    fundamentalOsc.frequency.setValueAtTime(freq, t0);

    // 2) Second harmonic: pure sine at f * 2 @ 20% volume with fast 0.22s decay
    const harmonic2Osc = rawCtx.createOscillator();
    harmonic2Osc.type = 'sine';
    harmonic2Osc.frequency.setValueAtTime(freq * 2, t0);

    const harmonic2Gain = rawCtx.createGain();
    harmonic2Gain.gain.setValueAtTime(0.0001, t0);
    harmonic2Gain.gain.linearRampToValueAtTime(0.2, attackEnd);
    harmonic2Gain.gain.exponentialRampToValueAtTime(0.0001, attackEnd + 0.22);

    // 3) Third harmonic: subtle pure sine at f * 3 @ 7% volume with short 0.10s decay
    const harmonic3Osc = rawCtx.createOscillator();
    harmonic3Osc.type = 'sine';
    harmonic3Osc.frequency.setValueAtTime(freq * 3, t0);

    const harmonic3Gain = rawCtx.createGain();
    harmonic3Gain.gain.setValueAtTime(0.0001, t0);
    harmonic3Gain.gain.linearRampToValueAtTime(0.07, attackEnd);
    harmonic3Gain.gain.exponentialRampToValueAtTime(0.0001, attackEnd + 0.1);

    // Route oscillators -> smooth lowpass (Q=0.5) -> amp envelope -> 140 Hz highpass bus (Q=0.5)
    fundamentalOsc.connect(pluckLowpass);
    harmonic2Osc.connect(harmonic2Gain);
    harmonic2Gain.connect(pluckLowpass);
    harmonic3Osc.connect(harmonic3Gain);
    harmonic3Gain.connect(pluckLowpass);

    pluckLowpass.connect(ampGain);
    ampGain.connect(this.guitarBus);

    fundamentalOsc.start(t0);
    harmonic2Osc.start(t0);
    harmonic3Osc.start(t0);

    fundamentalOsc.stop(stopTime);
    harmonic2Osc.stop(Math.min(stopTime, attackEnd + 0.25));
    harmonic3Osc.stop(Math.min(stopTime, attackEnd + 0.13));

    let cleanedUp = false;
    const disconnectAll = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      this.activeGuitarVoices.delete(stopVoice);
      try {
        fundamentalOsc.disconnect();
        harmonic2Osc.disconnect();
        harmonic2Gain.disconnect();
        harmonic3Osc.disconnect();
        harmonic3Gain.disconnect();
        pluckLowpass.disconnect();
        ampGain.disconnect();
      } catch {
        // Ignore already disconnected nodes
      }
    };

    const stopVoice = () => {
      if (cleanedUp) return;
      const now = rawCtx.currentTime;
      try {
        ampGain.gain.cancelScheduledValues(now);
        ampGain.gain.setTargetAtTime(0.0001, now, 0.015);
        fundamentalOsc.stop(now + 0.06);
        harmonic2Osc.stop(now + 0.04);
        harmonic3Osc.stop(now + 0.04);
      } catch {
        disconnectAll();
      }
    };

    this.activeGuitarVoices.add(stopVoice);
    fundamentalOsc.onended = disconnectAll;
  }

  /**
   * Triggers a clean acoustic guitar chord with E3 mud protection, smooth 20ms micro-strum,
   * and conservative 0.22 / N per-voice headroom so chords never clip or distort.
   */
  private triggerGuitarChord(
    midiNotes: number[],
    durationSec: number,
    startTime: number,
    velocity: number,
    strumOffsetSec = GUITAR_STRUM_OFFSET_SEC
  ): void {
    const voiced =
      midiNotes.length >= 3
        ? this.shapeGuitarChordVoicing(midiNotes)
        : [...midiNotes].sort((a, b) => a - b);

    if (voiced.length === 0) return;

    const velScale = Math.min(1, Math.max(0.55, velocity));
    const perVoicePeak = Math.min(0.18, (0.22 / voiced.length) * velScale);

    voiced.forEach((midi, idx) => {
      this.triggerGuitarPluck(
        midi,
        durationSec,
        startTime + idx * strumOffsetSec,
        perVoicePeak
      );
    });
  }

  public stopAll(): void {
    this.activeTimeouts.forEach((id) => window.clearTimeout(id));
    this.activeTimeouts = [];

    try {
      this.pianoSynth?.releaseAll();
      this.feedbackSynth?.releaseAll();
    } catch {
      // Ignore release errors when context is suspended
    }

    // Smoothly stop any ringing guitar voices without clicks
    Array.from(this.activeGuitarVoices).forEach((stopFn) => stopFn());
    this.activeGuitarVoices.clear();

    this.setPlaying(false);
  }

  public async playSingleNote(
    midi: number,
    durationSec = 0.65,
    instrument: InstrumentType = 'piano',
    velocity = 0.8
  ): Promise<void> {
    await this.ensureReady();
    const now = Tone.now() + 0.01;
    if (instrument === 'guitar') {
      const singlePeak = Math.min(0.18, Math.max(0.06, velocity * 0.18));
      this.triggerGuitarPluck(midi, durationSec, now, singlePeak);
      return;
    }
    if (!this.pianoSynth) return;
    const noteName = midiToToneNote(midi);
    this.pianoSynth.triggerAttackRelease(noteName, durationSec, now, velocity);
  }

  public async playChordNow(
    midiNotes: number[],
    durationSec = 1.15,
    instrument: InstrumentType = 'piano',
    arpeggiate = false
  ): Promise<void> {
    await this.ensureReady();
    const now = Tone.now() + 0.02;

    if (instrument === 'guitar') {
      const strumGap = arpeggiate ? 0.08 : GUITAR_STRUM_OFFSET_SEC;
      this.triggerGuitarChord(midiNotes, durationSec, now, 0.95, strumGap);
      return;
    }

    if (!this.pianoSynth) return;
    if (arpeggiate) {
      midiNotes.forEach((midi, index) => {
        this.pianoSynth?.triggerAttackRelease(
          midiToToneNote(midi),
          durationSec,
          now + index * 0.08,
          0.76
        );
      });
    } else {
      const names = midiNotes.map(midiToToneNote);
      this.pianoSynth.triggerAttackRelease(names, durationSec, now, 0.72);
    }
  }

  public async playMetronomeClick(accent = false): Promise<void> {
    await this.ensureReady();
    if (!this.clickSynth) return;
    this.clickSynth.triggerAttackRelease(
      accent ? 'G5' : 'C5',
      0.035,
      Tone.now() + 0.005,
      accent ? 0.85 : 0.55
    );
  }

  public async playDrumHit(accent = false): Promise<void> {
    await this.ensureReady();
    const now = Tone.now() + 0.005;
    if (accent && this.kickSynth) {
      this.kickSynth.triggerAttackRelease('G2', 0.14, now, 0.9);
    }
    if (this.clickSynth) {
      this.clickSynth.triggerAttackRelease(accent ? 'E5' : 'A4', 0.045, now, accent ? 0.75 : 0.65);
    }
  }

  /**
   * Plays an AudioSequence cleanly without overlapping any previous playback.
   * Optionally emits visual beat / active-note callbacks for UI sync.
   */
  public async playSequence(
    sequence: AudioSequence,
    options?: {
      instrument?: InstrumentType;
      playSecondary?: boolean;
      onEventStart?: (eventIndex: number, midiNotes: number[], isCountIn: boolean) => void;
      onComplete?: () => void;
    }
  ): Promise<void> {
    this.stopAll();
    await this.ensureReady();

    const instrument = options?.instrument ?? sequence.instrument ?? 'piano';
    const events = options?.playSecondary && sequence.secondaryEvents
      ? sequence.secondaryEvents
      : sequence.events;
    const totalBeats = options?.playSecondary && sequence.secondaryTotalBeats
      ? sequence.secondaryTotalBeats
      : sequence.totalBeats;

    const beatSec = 60 / sequence.tempoBpm;
    const countInBeats = options?.playSecondary ? 0 : (sequence.countInBeats ?? 0);
    const startDelaySec = 0.05;
    const baseAudioTime = Tone.now() + startDelaySec;

    this.setPlaying(true);

    // Optional count-in clicks (used for rhythm exercises)
    for (let c = 0; c < countInBeats; c++) {
      const clickTime = baseAudioTime + c * beatSec;
      const isDownbeat = c === 0;
      this.clickSynth?.triggerAttackRelease(
        isDownbeat ? 'G5' : 'C5',
        0.04,
        clickTime,
        isDownbeat ? 0.85 : 0.55
      );
      const tId = window.setTimeout(() => {
        options?.onEventStart?.(c, [], true);
      }, (startDelaySec + c * beatSec) * 1000);
      this.activeTimeouts.push(tId);
    }

    const offsetSec = countInBeats * beatSec;

    events.forEach((ev, idx) => {
      const eventTime = baseAudioTime + offsetSec + ev.startBeat * beatSec;
      const durSec = Math.max(0.08, ev.durationBeats * beatSec * 0.92);
      const vel = ev.velocity ?? 0.78;

      if (ev.type === 'rhythm') {
        if (ev.accent) {
          this.kickSynth?.triggerAttackRelease('G2', 0.14, eventTime, 0.88);
          this.clickSynth?.triggerAttackRelease('E5', 0.04, eventTime, 0.7);
        } else {
          this.clickSynth?.triggerAttackRelease('A4', 0.045, eventTime, 0.72);
        }
      } else if (ev.midiNotes.length > 0) {
        if (instrument === 'guitar') {
          if (ev.midiNotes.length === 1) {
            const singlePeak = Math.min(0.18, Math.max(0.06, vel * 0.18));
            this.triggerGuitarPluck(ev.midiNotes[0], durSec, eventTime, singlePeak);
          } else {
            this.triggerGuitarChord(ev.midiNotes, durSec, eventTime, vel, GUITAR_STRUM_OFFSET_SEC);
          }
        } else if (this.pianoSynth) {
          const names = ev.midiNotes.map(midiToToneNote);
          if (names.length === 1) {
            this.pianoSynth.triggerAttackRelease(names[0], durSec, eventTime, vel);
          } else {
            // Slight gentle scaling for multi-note piano chords
            this.pianoSynth.triggerAttackRelease(names, durSec, eventTime, Math.min(0.7, vel));
          }
        }
      }

      const visualDelayMs = Math.max(0, (startDelaySec + offsetSec + ev.startBeat * beatSec) * 1000);
      const tId = window.setTimeout(() => {
        options?.onEventStart?.(idx, ev.midiNotes, false);
      }, visualDelayMs);
      this.activeTimeouts.push(tId);
    });

    const endMs = Math.ceil((startDelaySec + offsetSec + totalBeats * beatSec + 0.18) * 1000);
    const endTimeout = window.setTimeout(() => {
      this.setPlaying(false);
      options?.onComplete?.();
    }, endMs);
    this.activeTimeouts.push(endTimeout);
  }

  public async playFeedback(type: 'correct' | 'wrong' | 'complete'): Promise<void> {
    await this.ensureReady();
    if (!this.feedbackSynth) return;
    const now = Tone.now() + 0.01;
    if (type === 'correct') {
      this.feedbackSynth.triggerAttackRelease('E5', 0.14, now, 0.55);
      this.feedbackSynth.triggerAttackRelease('G#5', 0.22, now + 0.09, 0.55);
    } else if (type === 'wrong') {
      this.feedbackSynth.triggerAttackRelease('E4', 0.16, now, 0.45);
      this.feedbackSynth.triggerAttackRelease('D4', 0.22, now + 0.1, 0.4);
    } else {
      // Gentle celebratory arpeggio
      ['C5', 'E5', 'G5', 'C6'].forEach((n, idx) => {
        this.feedbackSynth?.triggerAttackRelease(n, 0.28, now + idx * 0.085, 0.52);
      });
    }
  }
}

export const AudioEngine = new RumieAudioEngine();
