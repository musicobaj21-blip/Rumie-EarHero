import React from 'react';
import { RhythmToken } from '../types/music';

export type { RhythmToken };

export interface RhythmNotationProps {
  tokens: RhythmToken[];
  /** Rendered SVG height in pixels (default 26) */
  height?: number;
  className?: string;
  ariaLabel?: string;
}

const VIEW_HEIGHT = 36;
const HEAD_Y = 26.5;
const STEM_TOP_Y = 7.5;
const STEM_WIDTH = 1.75;
const BEAM_HEIGHT = 3.5;
const DOUBLE_BEAM_H = 2.9;
const SECOND_BEAM_Y = STEM_TOP_Y + 5.1;

interface TokenMetrics {
  /** Intrinsic graphic width in SVG units */
  width: number;
  /** Horizontal gap after this token when followed by another token */
  gapAfter: number;
}

const TOKEN_METRICS: Record<RhythmToken, TokenMetrics> = {
  whole: { width: 14, gapAfter: 20 },
  half: { width: 13, gapAfter: 20 },
  'dotted-half': { width: 18, gapAfter: 21 },
  quarter: { width: 12, gapAfter: 12 },
  'dotted-quarter': { width: 17, gapAfter: 14 },
  eighth: { width: 18, gapAfter: 8 },
  'dotted-eighth': { width: 21, gapAfter: 8 },
  'eighth-pair': { width: 28, gapAfter: 12 },
  'sixteenth-quad': { width: 50, gapAfter: 12 },
  gallop: { width: 40, gapAfter: 12 },
  'reverse-gallop': { width: 40, gapAfter: 12 },
  syncopation: { width: 50, gapAfter: 12 },
  'dotted-eighth-sixteenth': { width: 31, gapAfter: 12 },
  'eighth-triplet': { width: 39, gapAfter: 12 },
  'eighth-tie-quarter': { width: 30, gapAfter: 12 },
  'rest-whole': { width: 16, gapAfter: 20 },
  'rest-half': { width: 16, gapAfter: 18 },
  'rest-quarter': { width: 12, gapAfter: 11 },
  'rest-eighth': { width: 12, gapAfter: 6 },
};

function FilledHead({ cx, cy = HEAD_Y }: { cx: number; cy?: number }) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={5.0}
      ry={3.55}
      transform={`rotate(-20 ${cx} ${cy})`}
      fill="currentColor"
    />
  );
}

function HollowHead({ cx, cy = HEAD_Y }: { cx: number; cy?: number }) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={4.35}
      ry={2.95}
      transform={`rotate(-20 ${cx} ${cy})`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
    />
  );
}

function WholeHead({ cx, cy = HEAD_Y }: { cx: number; cy?: number }) {
  // Classical whole note: hollow horizontal oval with thicker side walls (evenodd cutout)
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <path
        fillRule="evenodd"
        d="M -6.1 0 A 6.1 4.05 0 1 0 6.1 0 A 6.1 4.05 0 1 0 -6.1 0 Z M 2.95 1.15 A 3.2 2.2 22 1 0 -2.95 -1.15 A 3.2 2.2 22 1 0 2.95 1.15 Z"
        fill="currentColor"
      />
    </g>
  );
}

function Stem({
  x,
  topY = STEM_TOP_Y,
  bottomY = HEAD_Y - 0.85,
  strokeWidth = STEM_WIDTH,
}: {
  x: number;
  topY?: number;
  bottomY?: number;
  strokeWidth?: number;
}) {
  return (
    <line
      x1={x}
      y1={bottomY}
      x2={x}
      y2={topY}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  );
}

function AugDot({ cx, cy = HEAD_Y - 0.4 }: { cx: number; cy?: number }) {
  return <circle cx={cx} cy={cy} r={1.65} fill="currentColor" />;
}

function EighthFlag({ stemX, topY = STEM_TOP_Y }: { stemX: number; topY?: number }) {
  return (
    <path
      d={`M ${stemX - 0.55} ${topY}
          C ${stemX + 0.6} ${topY + 4.3}, ${stemX + 7.5} ${topY + 5.6}, ${stemX + 6.3} ${topY + 13.4}
          C ${stemX + 5.8} ${topY + 9.4}, ${stemX + 2.3} ${topY + 6.9}, ${stemX - 0.55} ${topY + 5.1} Z`}
      fill="currentColor"
    />
  );
}

function TripletThree({ cx }: { cx: number }) {
  // Pure vector numeral "3" (zero external font or Unicode dependency)
  return (
    <path
      d={`M ${cx - 2.0} 1.5
          C ${cx - 1.2} 0.6, ${cx + 2.1} 0.6, ${cx + 2.1} 2.3
          C ${cx + 2.1} 3.4, ${cx + 0.9} 3.9, ${cx - 0.4} 4.0
          C ${cx + 1.1} 4.1, ${cx + 2.3} 4.8, ${cx + 2.3} 5.9
          C ${cx + 2.3} 7.4, ${cx - 1.3} 7.7, ${cx - 2.2} 6.6`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.35}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function renderToken(token: RhythmToken, x: number, key: number): React.ReactNode {
  switch (token) {
    case 'whole': {
      return <WholeHead key={key} cx={x + 6.8} />;
    }

    case 'half': {
      const cx = x + 5.5;
      return (
        <g key={key}>
          <HollowHead cx={cx} />
          <Stem x={cx + 4.35} />
        </g>
      );
    }

    case 'dotted-half': {
      const cx = x + 5.5;
      return (
        <g key={key}>
          <HollowHead cx={cx} />
          <Stem x={cx + 4.35} />
          <AugDot cx={cx + 8.6} />
        </g>
      );
    }

    case 'quarter': {
      const cx = x + 5.2;
      return (
        <g key={key}>
          <FilledHead cx={cx} />
          <Stem x={cx + 4.05} />
        </g>
      );
    }

    case 'dotted-quarter': {
      const cx = x + 5.2;
      return (
        <g key={key}>
          <FilledHead cx={cx} />
          <Stem x={cx + 4.05} />
          <AugDot cx={cx + 8.2} />
        </g>
      );
    }

    case 'eighth': {
      const cx = x + 5.2;
      const stemX = cx + 4.05;
      return (
        <g key={key}>
          <FilledHead cx={cx} />
          <Stem x={stemX} />
          <EighthFlag stemX={stemX} />
        </g>
      );
    }

    case 'dotted-eighth': {
      const cx = x + 5.2;
      const stemX = cx + 4.05;
      return (
        <g key={key}>
          <FilledHead cx={cx} />
          <Stem x={stemX} />
          <EighthFlag stemX={stemX} />
          <AugDot cx={cx + 8.3} />
        </g>
      );
    }

    case 'eighth-pair': {
      const x0 = x + 5.2;
      const x1 = x0 + 16.0;
      const s0 = x0 + 4.05;
      const s1 = x1 + 4.05;
      return (
        <g key={key}>
          <FilledHead cx={x0} />
          <FilledHead cx={x1} />
          <Stem x={s0} topY={STEM_TOP_Y + 1.0} />
          <Stem x={s1} topY={STEM_TOP_Y + 1.0} />
          <rect
            x={s0 - 0.88}
            y={STEM_TOP_Y}
            width={s1 - s0 + 1.76}
            height={BEAM_HEIGHT}
            rx={0.55}
            fill="currentColor"
          />
        </g>
      );
    }

    case 'sixteenth-quad': {
      const positions = [x + 5.2, x + 17.7, x + 30.2, x + 42.7];
      const stems = positions.map((px) => px + 4.05);
      const beamX = stems[0] - 0.85;
      const beamW = stems[3] - stems[0] + 1.7;
      return (
        <g key={key}>
          {positions.map((px, i) => (
            <React.Fragment key={i}>
              <FilledHead cx={px} />
              <Stem x={stems[i]} topY={STEM_TOP_Y + 1.0} strokeWidth={1.65} />
            </React.Fragment>
          ))}
          <rect x={beamX} y={STEM_TOP_Y} width={beamW} height={DOUBLE_BEAM_H} rx={0.45} fill="currentColor" />
          <rect x={beamX} y={SECOND_BEAM_Y} width={beamW} height={DOUBLE_BEAM_H} rx={0.45} fill="currentColor" />
        </g>
      );
    }

    case 'gallop': {
      // Eighth + two sixteenths
      const positions = [x + 5.2, x + 20.5, x + 32.5];
      const stems = positions.map((px) => px + 4.05);
      return (
        <g key={key}>
          {positions.map((px, i) => (
            <React.Fragment key={i}>
              <FilledHead cx={px} />
              <Stem x={stems[i]} topY={STEM_TOP_Y + 1.0} strokeWidth={1.65} />
            </React.Fragment>
          ))}
          <rect
            x={stems[0] - 0.85}
            y={STEM_TOP_Y}
            width={stems[2] - stems[0] + 1.7}
            height={DOUBLE_BEAM_H}
            rx={0.45}
            fill="currentColor"
          />
          <rect
            x={stems[1] - 0.85}
            y={SECOND_BEAM_Y}
            width={stems[2] - stems[1] + 1.7}
            height={DOUBLE_BEAM_H}
            rx={0.45}
            fill="currentColor"
          />
        </g>
      );
    }

    case 'reverse-gallop': {
      // Two sixteenths + eighth
      const positions = [x + 5.2, x + 17.2, x + 32.5];
      const stems = positions.map((px) => px + 4.05);
      return (
        <g key={key}>
          {positions.map((px, i) => (
            <React.Fragment key={i}>
              <FilledHead cx={px} />
              <Stem x={stems[i]} topY={STEM_TOP_Y + 1.0} strokeWidth={1.65} />
            </React.Fragment>
          ))}
          <rect
            x={stems[0] - 0.85}
            y={STEM_TOP_Y}
            width={stems[2] - stems[0] + 1.7}
            height={DOUBLE_BEAM_H}
            rx={0.45}
            fill="currentColor"
          />
          <rect
            x={stems[0] - 0.85}
            y={SECOND_BEAM_Y}
            width={stems[1] - stems[0] + 1.7}
            height={DOUBLE_BEAM_H}
            rx={0.45}
            fill="currentColor"
          />
        </g>
      );
    }

    case 'dotted-eighth-sixteenth': {
      const x0 = x + 5.2;
      const x1 = x0 + 18.8;
      const s0 = x0 + 4.05;
      const s1 = x1 + 4.05;
      const stubW = 6.6;
      return (
        <g key={key}>
          <FilledHead cx={x0} />
          <AugDot cx={x0 + 8.1} />
          <FilledHead cx={x1} />
          <Stem x={s0} topY={STEM_TOP_Y + 1.0} strokeWidth={1.65} />
          <Stem x={s1} topY={STEM_TOP_Y + 1.0} strokeWidth={1.65} />
          <rect
            x={s0 - 0.85}
            y={STEM_TOP_Y}
            width={s1 - s0 + 1.7}
            height={DOUBLE_BEAM_H}
            rx={0.45}
            fill="currentColor"
          />
          <rect
            x={s1 + 0.85 - stubW}
            y={SECOND_BEAM_Y}
            width={stubW}
            height={DOUBLE_BEAM_H}
            rx={0.45}
            fill="currentColor"
          />
        </g>
      );
    }

    case 'eighth-triplet': {
      const positions = [x + 5.2, x + 18.7, x + 32.2];
      const stems = positions.map((px) => px + 4.05);
      const beamY = 9.6;
      return (
        <g key={key}>
          <TripletThree cx={stems[1]} />
          {positions.map((px, i) => (
            <React.Fragment key={i}>
              <FilledHead cx={px} />
              <Stem x={stems[i]} topY={beamY + 1.0} strokeWidth={1.65} />
            </React.Fragment>
          ))}
          <rect
            x={stems[0] - 0.85}
            y={beamY}
            width={stems[2] - stems[0] + 1.7}
            height={3.2}
            rx={0.5}
            fill="currentColor"
          />
        </g>
      );
    }

    case 'syncopation': {
      // Classic eighth + quarter + eighth
      const x0 = x + 5.2;
      const x1 = x0 + 17.5;
      const x2 = x1 + 14.5;
      return (
        <g key={key}>
          <FilledHead cx={x0} />
          <Stem x={x0 + 4.05} />
          <EighthFlag stemX={x0 + 4.05} />

          <FilledHead cx={x1} />
          <Stem x={x1 + 4.05} />

          <FilledHead cx={x2} />
          <Stem x={x2 + 4.05} />
          <EighthFlag stemX={x2 + 4.05} />
        </g>
      );
    }

    case 'eighth-tie-quarter': {
      // Eighth note tied to quarter note underneath with clean curved slur
      const x0 = x + 5.2;
      const x1 = x0 + 18.0;
      const s0 = x0 + 4.05;
      const s1 = x1 + 4.05;
      return (
        <g key={key}>
          <FilledHead cx={x0} />
          <Stem x={s0} />
          <EighthFlag stemX={s0} />

          <FilledHead cx={x1} />
          <Stem x={s1} />

          <path
            d={`M ${x0 + 1.4} ${HEAD_Y + 4.4} Q ${(x0 + x1) / 2} ${HEAD_Y + 9.2} ${x1 - 1.4} ${HEAD_Y + 4.4}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.55}
            strokeLinecap="round"
          />
        </g>
      );
    }

    case 'rest-whole': {
      const cx = x + 8.0;
      return (
        <g key={key}>
          <line
            x1={cx - 7.2}
            y1={18.5}
            x2={cx + 7.2}
            y2={18.5}
            stroke="currentColor"
            strokeWidth={1.35}
            strokeLinecap="round"
            opacity={0.75}
          />
          <rect x={cx - 4.3} y={18.5} width={8.6} height={4.4} rx={0.55} fill="currentColor" />
        </g>
      );
    }

    case 'rest-half': {
      const cx = x + 8.0;
      return (
        <g key={key}>
          <line
            x1={cx - 7.2}
            y1={23.5}
            x2={cx + 7.2}
            y2={23.5}
            stroke="currentColor"
            strokeWidth={1.35}
            strokeLinecap="round"
            opacity={0.75}
          />
          <rect x={cx - 4.3} y={19.1} width={8.6} height={4.4} rx={0.55} fill="currentColor" />
        </g>
      );
    }

    case 'rest-quarter': {
      const cx = x + 6.0;
      return (
        <path
          key={key}
          d={`M ${cx - 0.8} 10.6
              L ${cx + 2.8} 15.3
              C ${cx + 1.1} 17.0, ${cx - 0.3} 18.2, ${cx + 0.4} 19.8
              L ${cx + 3.0} 23.6
              C ${cx + 1.2} 22.9, ${cx - 0.9} 23.6, ${cx - 1.1} 25.4
              C ${cx - 1.3} 27.1, ${cx - 0.1} 28.6, ${cx + 1.2} 29.6
              L ${cx + 0.4} 30.3
              C ${cx - 2.0} 29.0, ${cx - 3.3} 26.8, ${cx - 2.7} 24.4
              C ${cx - 2.3} 22.7, ${cx - 0.8} 21.8, ${cx + 0.6} 22.0
              L ${cx - 2.4} 18.4
              C ${cx - 0.4} 16.7, ${cx + 0.7} 15.6, ${cx + 0.1} 14.0
              L ${cx - 1.8} 11.4 Z`}
          fill="currentColor"
        />
      );
    }

    case 'rest-eighth': {
      const cx = x + 5.8;
      return (
        <g key={key}>
          <circle cx={cx - 1.8} cy={16.8} r={2.15} fill="currentColor" />
          <path
            d={`M ${cx - 0.7} 18.2 C ${cx + 0.8} 19.0, ${cx + 2.4} 18.2, ${cx + 3.4} 16.0 L ${cx - 0.6} 29.6`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.95}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );
    }
  }
}

export const RhythmNotation: React.FC<RhythmNotationProps> = ({
  tokens,
  height = 26,
  className = 'text-white',
  ariaLabel,
}) => {
  const padX = 2;
  let cursor = padX;

  const placed = tokens.map((token, idx) => {
    const metrics = TOKEN_METRICS[token];
    const startX = cursor;
    cursor += metrics.width + (idx < tokens.length - 1 ? metrics.gapAfter : 0);
    return { token, startX, idx };
  });

  const viewWidth = Math.max(24, cursor + padX);
  const renderedWidth = Math.round((viewWidth / VIEW_HEIGHT) * height);

  return (
    <svg
      viewBox={`0 0 ${viewWidth} ${VIEW_HEIGHT}`}
      width={renderedWidth}
      height={height}
      preserveAspectRatio="xMinYMid meet"
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={`block max-w-full shrink-0 overflow-visible ${className}`}
    >
      {placed.map(({ token, startX, idx }) => renderToken(token, startX, idx))}
    </svg>
  );
};
