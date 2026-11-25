import React from 'react';

interface StarSpec {
  id: number;
  cx: number;
  cy: number;
  r: number;
  fill: string;
  opacity: number;
  dur: string;
  delay: string;
  twinkle: boolean;
}

/**
 * Deterministic seeded starfield generator (~84 stars across 1200x700 space)
 * so stars never jump or flicker across re-renders.
 */
function buildStarfield(count: number): StarSpec[] {
  const palette = ['#FFFFFF', '#FFFFFF', '#FFE6B3', '#B8F6FF', '#FFFFFF', '#FFD89E', '#8CEEFF'];
  let seed = 42197;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const stars: StarSpec[] = [];
  for (let i = 0; i < count; i++) {
    const cx = Math.round(rand() * 1180 + 10);
    const cy = Math.round(rand() * 680 + 10);
    const r = Number((0.65 + rand() * 1.55).toFixed(2));
    const fill = palette[i % palette.length];
    const opacity = Number((0.32 + rand() * 0.62).toFixed(2));
    const dur = `${(2.6 + rand() * 3.4).toFixed(2)}s`;
    const delay = `${(rand() * 4.8).toFixed(2)}s`;
    const twinkle = i % 3 !== 0; // ~2/3 gently twinkle for organic depth
    stars.push({ id: i, cx, cy, r, fill, opacity, dur, delay, twinkle });
  }
  return stars;
}

const STARFIELD = buildStarfield(84);

/** 7 prominent 4-pointed sparkle stars strategically placed in open nebula pockets */
const FOUR_POINT_STARS: {
  x: number;
  y: number;
  scale: number;
  color: string;
  delay: string;
  dur: string;
}[] = [
  { x: 98, y: 122, scale: 1.05, color: '#FFE0A3', delay: '0.3s', dur: '3.4s' },
  { x: 318, y: 88, scale: 0.78, color: '#FFFFFF', delay: '1.4s', dur: '4.1s' },
  { x: 642, y: 112, scale: 0.92, color: '#A5F3FC', delay: '2.1s', dur: '3.7s' },
  { x: 1098, y: 146, scale: 1.15, color: '#B8F6FF', delay: '0.8s', dur: '4.3s' },
  { x: 256, y: 382, scale: 0.85, color: '#FFD28A', delay: '1.9s', dur: '3.5s' },
  { x: 928, y: 374, scale: 0.96, color: '#7CEEFF', delay: '2.7s', dur: '4.0s' },
  { x: 610, y: 632, scale: 0.84, color: '#FFE0A3', delay: '1.1s', dur: '3.9s' },
];

/** 3 subtle astronomical constellations placed in open sky regions between the world rows */
const CONSTELLATIONS: {
  id: string;
  points: [number, number][];
  edges: [number, number][];
}[] = [
  {
    // Left-center open pocket between M1/M2 and M7/M8
    id: 'lyra-west',
    points: [
      [225, 345],
      [278, 326],
      [324, 358],
      [296, 404],
      [242, 396],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
    ],
  },
  {
    // Central horizon constellation between M2/M3 and M6/M7
    id: 'orion-center',
    points: [
      [562, 354],
      [608, 336],
      [656, 362],
      [702, 340],
      [648, 405],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [2, 4],
    ],
  },
  {
    // Upper-right constellation above M4
    id: 'cygnus-east',
    points: [
      [888, 102],
      [942, 128],
      [998, 114],
      [956, 168],
    ],
    edges: [
      [0, 1],
      [1, 2],
      [1, 3],
    ],
  },
];

export const GalacticMapBackdrop: React.FC = () => {
  const customBgUrl = (
    import.meta as unknown as { env?: Record<string, string | undefined> }
  ).env?.VITE_GALAXY_BG_URL?.trim();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none bg-[#05070E]"
    >
      {/* OPTIONAL CUSTOM GALAXY BACKGROUND IMAGE */}
      {customBgUrl ? (
        <>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("${customBgUrl}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          {/* Balanced dark overlay ensuring high legibility over custom art */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(5,7,14,0.68) 0%, rgba(5,7,14,0.44) 48%, rgba(5,7,14,0.66) 100%)',
            }}
          />
        </>
      ) : (
        /* LAYER 1: DEEP MULTI-LAYER TWO-TONE COSMIC NEBULA */
        <>
          {/* Deep cosmic base gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 90% 80% at 15% 18%, rgba(48, 18, 8, 0.55) 0%, rgba(5, 7, 14, 0) 60%), radial-gradient(ellipse 95% 85% at 78% 76%, rgba(6, 36, 56, 0.65) 0%, rgba(5, 7, 14, 0) 68%), #05070E',
            }}
          />

          {/* Top-left Fiery Rumie Orange & Amber Nebula (World 1 zone) */}
          <div
            className="absolute -top-[16%] -left-[10%] w-[58%] h-[64%] rounded-full blur-[68px]"
            style={{
              background:
                'radial-gradient(circle at 38% 40%, rgba(255, 90, 0, 0.38) 0%, rgba(255, 140, 0, 0.24) 36%, rgba(184, 59, 0, 0.16) 62%, transparent 80%)',
            }}
          />
          <div
            className="absolute top-[4%] left-[6%] w-[36%] h-[42%] rounded-full blur-[52px]"
            style={{
              background:
                'radial-gradient(circle at 45% 45%, rgba(255, 140, 0, 0.28) 0%, rgba(255, 90, 0, 0.14) 52%, transparent 78%)',
            }}
          />

          {/* Central-Diagonal to Bottom-Right Deep Petroleum Blue & Stellar Cyan Nebula (Worlds 3-7 zone) */}
          <div
            className="absolute top-[12%] right-[-10%] w-[72%] h-[78%] rounded-full blur-[78px]"
            style={{
              background:
                'radial-gradient(ellipse at 58% 52%, rgba(0, 168, 204, 0.34) 0%, rgba(7, 59, 84, 0.42) 38%, rgba(10, 34, 57, 0.32) 66%, transparent 85%)',
            }}
          />
          <div
            className="absolute bottom-[-14%] left-[26%] w-[54%] h-[56%] rounded-full blur-[66px]"
            style={{
              background:
                'radial-gradient(circle at 52% 55%, rgba(7, 59, 84, 0.38) 0%, rgba(0, 168, 204, 0.20) 44%, rgba(10, 34, 57, 0.14) 68%, transparent 82%)',
            }}
          />

          {/* Subtle golden harmonic bridge glowing between warm & cool nebulae */}
          <div
            className="absolute top-[34%] left-[24%] w-[42%] h-[34%] rounded-full blur-[64px]"
            style={{
              background:
                'radial-gradient(ellipse at 50% 50%, rgba(255, 162, 66, 0.14) 0%, rgba(0, 229, 255, 0.09) 55%, transparent 80%)',
            }}
          />
        </>
      )}

      {/* LAYERS 2 & 3: COSMIC FILAMENTS, STARFIELD, CONSTELLATIONS & MUSICAL SYMBOLS (SVG) */}
      <svg
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        fill="none"
      >
        <defs>
          {/* Golden-to-Cyan Cosmic Soundwave Gradients */}
          <linearGradient id="cosmicWaveA" x1="0%" y1="15%" x2="100%" y2="85%">
            <stop offset="0%" stopColor="#FF5A00" stopOpacity="0" />
            <stop offset="18%" stopColor="#FF5A00" stopOpacity="0.52" />
            <stop offset="48%" stopColor="#FFB84D" stopOpacity="0.62" />
            <stop offset="78%" stopColor="#00E5FF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="cosmicWaveB" x1="5%" y1="0%" x2="95%" y2="100%">
            <stop offset="0%" stopColor="#FFB84D" stopOpacity="0" />
            <stop offset="28%" stopColor="#FF8C00" stopOpacity="0.38" />
            <stop offset="62%" stopColor="#FFB84D" stopOpacity="0.48" />
            <stop offset="86%" stopColor="#00A8CC" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="cosmicWaveC" x1="10%" y1="90%" x2="95%" y2="20%">
            <stop offset="0%" stopColor="#FF5A00" stopOpacity="0" />
            <stop offset="30%" stopColor="#FF8C00" stopOpacity="0.26" />
            <stop offset="65%" stopColor="#00E5FF" stopOpacity="0.36" />
            <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="symbolGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE1B3" />
            <stop offset="55%" stopColor="#FFB84D" />
            <stop offset="100%" stopColor="#7CEEFF" />
          </linearGradient>

          <filter id="filamentGlow" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="starHalo" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* LAYER 2: 4 GOLDEN COSMIC SOUNDWAVE FILAMENTS */}
        <g className="cosmic-drift" filter="url(#filamentGlow)" opacity="0.82">
          <path
            d="M -40 165 C 180 65, 360 285, 610 215 C 845 150, 995 390, 1245 310"
            stroke="url(#cosmicWaveA)"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <path
            d="M -30 205 C 210 115, 390 315, 630 250 C 875 182, 1020 420, 1240 355"
            stroke="url(#cosmicWaveB)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </g>

        <g className="cosmic-drift-reverse" filter="url(#filamentGlow)" opacity="0.72">
          <path
            d="M -20 470 C 215 560, 425 355, 695 430 C 915 492, 1055 280, 1250 385"
            stroke="url(#cosmicWaveA)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M 80 680 C 310 535, 540 570, 770 390 C 930 265, 1065 215, 1230 120"
            stroke="url(#cosmicWaveC)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>

        {/* LAYER 3A: 3 SUBTLE ASTRONOMICAL CONSTELLATIONS (opacity ~0.16) */}
        <g opacity="0.18">
          {CONSTELLATIONS.map((constellation) => (
            <g key={constellation.id}>
              {constellation.edges.map(([aIdx, bIdx], eIdx) => {
                const a = constellation.points[aIdx];
                const b = constellation.points[bIdx];
                return (
                  <line
                    key={`${constellation.id}-e-${eIdx}`}
                    x1={a[0]}
                    y1={a[1]}
                    x2={b[0]}
                    y2={b[1]}
                    stroke="#B8F4FF"
                    strokeWidth="1.1"
                    strokeDasharray="3 3"
                  />
                );
              })}
              {constellation.points.map(([px, py], pIdx) => (
                <circle
                  key={`${constellation.id}-p-${pIdx}`}
                  cx={px}
                  cy={py}
                  r="2.4"
                  fill="#E0F9FF"
                />
              ))}
            </g>
          ))}
        </g>

        {/* LAYER 3B: PROCEDURAL STARFIELD (~84 STARS WITH STAGGERED TWINKLE) */}
        <g>
          {STARFIELD.map((st) => (
            <circle
              key={st.id}
              cx={st.cx}
              cy={st.cy}
              r={st.r}
              fill={st.fill}
              opacity={st.opacity}
              className={st.twinkle ? 'star-twinkle' : undefined}
              style={
                st.twinkle
                  ? ({
                      '--twinkle-dur': st.dur,
                      '--twinkle-delay': st.delay,
                    } as React.CSSProperties)
                  : undefined
              }
            />
          ))}
        </g>

        {/* LAYER 3C: 7 BRIGHT 4-POINTED SPARKLE STARS (✦) */}
        <g filter="url(#starHalo)">
          {FOUR_POINT_STARS.map((sp, i) => (
            <g
              key={`sparkle-${i}`}
              transform={`translate(${sp.x} ${sp.y}) scale(${sp.scale})`}
            >
              <g
                className="star-twinkle"
                style={
                  {
                    '--twinkle-dur': sp.dur,
                    '--twinkle-delay': sp.delay,
                  } as React.CSSProperties
                }
              >
                <path
                  d="M 0 -11 C 0.8 -2.8, 2.8 -0.8, 11 0 C 2.8 0.8, 0.8 2.8, 0 11 C -0.8 2.8, -2.8 0.8, -11 0 C -2.8 -0.8, -0.8 -2.8, 0 -11 Z"
                  fill={sp.color}
                />
                <circle cx="0" cy="0" r="2.2" fill="#FFFFFF" />
              </g>
            </g>
          ))}
        </g>

        {/* LAYER 3D: SUBTLE TRANSLUCENT COSMIC MUSICAL SYMBOLS (opacity 0.09 - 0.14) */}
        <g>
          {/* Large Graceful Treble Clef (Clave de Sol) nestled in upper-center open nebula */}
          <g transform="translate(592 225) scale(1.18)" opacity="0.12">
            <g className="cosmic-symbol-float">
              <path
                d="M 10 88 C 10 102, -4 108, -14 101 C -21 96, -20 84, -11 81 C -3 79, 2 85, 0 92 C 8 92, 13 84, 10 72 L -8 -74 C -10 -92, 2 -108, 13 -106 C 24 -104, 28 -86, 17 -66 C 8 -50, -19 -34, -26 -10 C -33 14, -18 39, 8 40 C 29 41, 43 24, 38 4 C 34 -13, 16 -22, 1 -15 C -12 -9, -15 8, -4 17 C 4 23, 14 21, 17 14 C 10 16, 4 11, 5 4 C 6 -4, 17 -6, 22 3 C 27 13, 18 28, 4 27 C -14 26, -22 8, -15 -10 C -8 -28, 16 -43, 25 -62 C 34 -81, 28 -110, 11 -112 C -6 -114, -19 -92, -16 -70 L 4 74 Z"
                fill="url(#symbolGrad)"
              />
            </g>
          </g>

          {/* Beamed Eighth Notes (♫) in left-middle pocket */}
          <g transform="translate(115 395) rotate(-8) scale(0.95)" opacity="0.11">
            <g className="cosmic-symbol-float" style={{ animationDelay: '-2.6s' }}>
              <path
                d="M 18 46 L 18 -14 L 68 -26 L 68 34 L 60 34 L 60 -12 L 26 -4 L 26 46 Z"
                fill="url(#symbolGrad)"
              />
              <ellipse cx="12" cy="48" rx="13" ry="9" transform="rotate(-18 12 48)" fill="url(#symbolGrad)" />
              <ellipse cx="56" cy="36" rx="13" ry="9" transform="rotate(-18 56 36)" fill="url(#symbolGrad)" />
            </g>
          </g>

          {/* Single Eighth Note (♪) in lower-center open space */}
          <g transform="translate(765 445) rotate(11) scale(0.85)" opacity="0.10">
            <g className="cosmic-symbol-float" style={{ animationDelay: '-4.8s' }}>
              <path
                d="M 16 42 L 16 -22 C 34 -18, 46 -6, 42 12 C 39 2, 30 -6, 23 -8 L 23 42 Z"
                fill="url(#symbolGrad)"
              />
              <ellipse cx="10" cy="44" rx="13" ry="9" transform="rotate(-18 10 44)" fill="url(#symbolGrad)" />
            </g>
          </g>

          {/* Small Beamed Eighth Notes (♫) in upper-right cosmic sky */}
          <g transform="translate(1062 248) rotate(7) scale(0.72)" opacity="0.10">
            <g className="cosmic-symbol-float" style={{ animationDelay: '-1.5s' }}>
              <path
                d="M 16 42 L 16 -12 L 58 -22 L 58 32 L 51 32 L 51 -10 L 23 -3 L 23 42 Z"
                fill="url(#symbolGrad)"
              />
              <ellipse cx="11" cy="44" rx="11.5" ry="8" transform="rotate(-18 11 44)" fill="url(#symbolGrad)" />
              <ellipse cx="48" cy="34" rx="11.5" ry="8" transform="rotate(-18 48 34)" fill="url(#symbolGrad)" />
            </g>
          </g>

          {/* Soft Eighth Note (♪) near lower-left beneath M8 */}
          <g transform="translate(422 612) rotate(-12) scale(0.68)" opacity="0.09">
            <g className="cosmic-symbol-float" style={{ animationDelay: '-6.2s' }}>
              <path
                d="M 16 42 L 16 -22 C 34 -18, 46 -6, 42 12 C 39 2, 30 -6, 23 -8 L 23 42 Z"
                fill="url(#symbolGrad)"
              />
              <ellipse cx="10" cy="44" rx="13" ry="9" transform="rotate(-18 10 44)" fill="url(#symbolGrad)" />
            </g>
          </g>
        </g>
      </svg>

      {/* SOFT PERIMETER VIGNETTE FOR CRISP HEADER & WORLD LABEL CONTRAST */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 84% 78% at 50% 52%, transparent 48%, rgba(5, 7, 14, 0.72) 100%), linear-gradient(180deg, rgba(5, 7, 14, 0.56) 0%, transparent 18%, transparent 86%, rgba(5, 7, 14, 0.48) 100%)',
        }}
      />
    </div>
  );
};
