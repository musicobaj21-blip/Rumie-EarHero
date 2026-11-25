import React, { useEffect, useRef, useState } from 'react';

interface WorldStageBackdropProps {
  worldId: number;
}

const WORLD_AMBIENT_STARS: [number, number, number][] = [
  [82, 74, 1.3],
  [184, 128, 1.0],
  [292, 68, 1.4],
  [412, 114, 1.1],
  [548, 62, 1.5],
  [684, 108, 1.0],
  [796, 66, 1.4],
  [918, 112, 1.2],
  [136, 448, 1.2],
  [352, 466, 1.0],
  [618, 458, 1.3],
  [868, 442, 1.4],
];

const WorldThemeLayer: React.FC<{ worldId: number }> = ({ worldId }) => {
  switch (worldId) {
    /* =========================================================================
     * MUNDO 1 — El Despertar del Oído (Amanecer Acústico)
     * ========================================================================= */
    case 1:
      return (
        <div className="absolute inset-0">
          {/* Warm Rumie Orange & Amber Sunrise Glow (0.20 - 0.26) */}
          <div
            className="absolute -top-[18%] left-[14%] w-[64%] h-[68%] rounded-full blur-[78px]"
            style={{
              background:
                'radial-gradient(circle, rgba(255, 90, 0, 0.26) 0%, rgba(255, 158, 64, 0.18) 42%, transparent 76%)',
            }}
          />
          <div
            className="absolute bottom-[-16%] right-[6%] w-[48%] h-[52%] rounded-full blur-[72px]"
            style={{
              background:
                'radial-gradient(circle, rgba(255, 158, 64, 0.18) 0%, rgba(255, 90, 0, 0.08) 50%, transparent 78%)',
            }}
          />

          <svg
            viewBox="0 0 1000 520"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
            fill="none"
          >
            <defs>
              <linearGradient id="w1-wave" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FF5A00" stopOpacity="0" />
                <stop offset="35%" stopColor="#FF9E40" stopOpacity="1" />
                <stop offset="70%" stopColor="#FF5A00" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#FF9E40" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Concentric acoustic water-ripple resonance rings */}
            <g className="world-pulse-soft" opacity="0.16">
              {[72, 132, 198, 268, 342].map((r, idx) => (
                <circle
                  key={r}
                  cx="510"
                  cy="248"
                  r={r}
                  stroke={idx % 2 === 0 ? '#FF9E40' : '#FF5A00'}
                  strokeWidth={idx === 0 ? '2' : '1.35'}
                  strokeDasharray={idx === 3 ? '8 8' : undefined}
                />
              ))}
            </g>

            {/* Fine acoustic sine wave curves */}
            <g className="cosmic-drift" opacity="0.18">
              <path
                d="M -20 265 Q 110 190, 240 265 T 500 265 T 760 265 T 1020 265"
                stroke="url(#w1-wave)"
                strokeWidth="2.2"
              />
              <path
                d="M -20 292 Q 125 352, 270 292 T 560 292 T 850 292 T 1040 292"
                stroke="url(#w1-wave)"
                strokeWidth="1.4"
                strokeOpacity="0.7"
              />
            </g>

            {/* Subtle Acoustic Tuning Fork (Diapasón) Silhouette */}
            <g transform="translate(760 235) rotate(14)" opacity="0.15">
              <g className="world-float-slow">
                <path
                  d="M -26 -112 L -26 -24 C -26 6, -12 22, 0 28 C 12 22, 26 6, 26 -24 L 26 -112"
                  stroke="#FF9E40"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line
                  x1="0"
                  y1="28"
                  x2="0"
                  y2="112"
                  stroke="#FF5A00"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
                <circle cx="0" cy="116" r="10" fill="#FF9E40" />
                {/* Subtle sound ripples flanking fork prongs */}
                <path
                  d="M -46 -86 C -58 -68, -58 -42, -46 -24"
                  stroke="#FF9E40"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M 46 -86 C 58 -68, 58 -42, 46 -24"
                  stroke="#FF9E40"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>
            </g>
          </svg>
        </div>
      );

    /* =========================================================================
     * MUNDO 2 — Los Intervalos (Puentes Estelares de Distancia)
     * ========================================================================= */
    case 2:
      return (
        <div className="absolute inset-0">
          {/* Cyan & Sapphire Atmosphere */}
          <div
            className="absolute -top-[14%] right-[10%] w-[60%] h-[62%] rounded-full blur-[78px]"
            style={{
              background:
                'radial-gradient(circle, rgba(0, 180, 216, 0.25) 0%, rgba(59, 130, 246, 0.18) 46%, transparent 78%)',
            }}
          />
          <div
            className="absolute bottom-[-18%] left-[8%] w-[52%] h-[54%] rounded-full blur-[74px]"
            style={{
              background:
                'radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, rgba(0, 180, 216, 0.12) 48%, transparent 78%)',
            }}
          />

          <svg
            viewBox="0 0 1000 520"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
            fill="none"
          >
            <defs>
              <linearGradient id="w2-arc" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00B4D8" />
                <stop offset="50%" stopColor="#7DD3FC" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>

            {/* Stepped pitch-frequency horizontal reference lines */}
            <g opacity="0.11">
              {[130, 188, 246, 304, 362, 420].map((y, idx) => (
                <line
                  key={y}
                  x1={60 + idx * 18}
                  y1={y}
                  x2={940 - idx * 14}
                  y2={y}
                  stroke="#38BDF8"
                  strokeWidth="1"
                  strokeDasharray="6 10"
                />
              ))}
            </g>

            {/* Parabolic Interval Bridges Connecting Star Pairs at Different Heights */}
            <g className="cosmic-drift" opacity="0.18">
              <path
                d="M 135 340 Q 255 150, 390 250"
                stroke="url(#w2-arc)"
                strokeWidth="2.2"
              />
              <path
                d="M 270 390 Q 485 88, 695 215"
                stroke="url(#w2-arc)"
                strokeWidth="2.4"
              />
              <path
                d="M 465 365 Q 665 140, 865 280"
                stroke="url(#w2-arc)"
                strokeWidth="1.9"
                strokeDasharray="7 6"
              />
              <path
                d="M 610 170 Q 755 72, 895 155"
                stroke="url(#w2-arc)"
                strokeWidth="1.7"
              />

              {/* Binary Star Anchor Points */}
              {[
                [135, 340],
                [390, 250],
                [270, 390],
                [695, 215],
                [465, 365],
                [865, 280],
                [610, 170],
                [895, 155],
              ].map(([x, y], i) => (
                <g key={i} transform={`translate(${x} ${y})`}>
                  <circle r="7" fill="#00B4D8" fillOpacity="0.35" />
                  <circle r="3" fill="#E0F2FE" />
                </g>
              ))}
            </g>
          </svg>
        </div>
      );

    /* =========================================================================
     * MUNDO 3 — Acordes Misteriosos (Santuario de Cristales Armónicos)
     * ========================================================================= */
    case 3:
      return (
        <div className="absolute inset-0">
          {/* Mystical Violet & Subtle Gold Atmosphere */}
          <div
            className="absolute top-[-12%] left-[18%] w-[58%] h-[66%] rounded-full blur-[80px]"
            style={{
              background:
                'radial-gradient(circle, rgba(139, 92, 246, 0.26) 0%, rgba(109, 40, 217, 0.15) 48%, transparent 78%)',
            }}
          />
          <div
            className="absolute bottom-[-16%] right-[12%] w-[46%] h-[50%] rounded-full blur-[72px]"
            style={{
              background:
                'radial-gradient(circle, rgba(255, 184, 0, 0.19) 0%, rgba(139, 92, 246, 0.12) 52%, transparent 78%)',
            }}
          />

          <svg
            viewBox="0 0 1000 520"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
            fill="none"
          >
            <defs>
              <linearGradient id="w3-beam" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.85" />
                <stop offset="55%" stopColor="#8B5CF6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#FFB800" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="w3-prism" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DDD6FE" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#FFB800" stopOpacity="0.08" />
              </linearGradient>
            </defs>

            {/* Soft fanned prismatic light beams */}
            <g opacity="0.14">
              <polygon points="500,195 160,520 350,520" fill="url(#w3-beam)" />
              <polygon points="500,195 430,520 640,520" fill="url(#w3-beam)" />
              <polygon points="500,195 720,520 930,520" fill="url(#w3-beam)" />
            </g>

            {/* Large Crystalline Triad Triangles & Tetrad Diamond Prisms */}
            <g className="world-float-slow" opacity="0.17">
              {/* Central Harmonic Triad Crystal */}
              <polygon
                points="500,82 650,322 350,322"
                fill="url(#w3-prism)"
                stroke="#C4B5FD"
                strokeWidth="1.8"
              />
              <polygon
                points="500,126 604,296 396,296"
                stroke="#FFB800"
                strokeWidth="1.3"
                strokeDasharray="6 6"
              />
              {/* Internal crystal facet lines */}
              <line x1="500" y1="82" x2="500" y2="322" stroke="#DDD6FE" strokeWidth="1" />
              <line x1="500" y1="215" x2="650" y2="322" stroke="#C4B5FD" strokeWidth="1" />
              <line x1="500" y1="215" x2="350" y2="322" stroke="#C4B5FD" strokeWidth="1" />

              {/* Left Floating 4-note Tetrad Diamond */}
              <polygon
                points="195,120 265,220 195,320 125,220"
                fill="url(#w3-prism)"
                stroke="#A78BFA"
                strokeWidth="1.5"
              />
              <line x1="195" y1="120" x2="195" y2="320" stroke="#FFB800" strokeWidth="1" />

              {/* Right Floating Crystal Shard */}
              <polygon
                points="820,105 902,245 812,352 742,225"
                fill="url(#w3-prism)"
                stroke="#FFB800"
                strokeWidth="1.5"
              />
              <line x1="820" y1="105" x2="812" y2="352" stroke="#C4B5FD" strokeWidth="1" />
            </g>
          </svg>
        </div>
      );

    /* =========================================================================
     * MUNDO 4 — El Universo de las Escalas (Espiral y Órbitas Modales)
     * ========================================================================= */
    case 4:
      return (
        <div className="absolute inset-0">
          {/* Emerald Turquoise & Deep Blue Atmosphere */}
          <div
            className="absolute -top-[12%] left-[22%] w-[58%] h-[64%] rounded-full blur-[78px]"
            style={{
              background:
                'radial-gradient(circle, rgba(16, 185, 129, 0.24) 0%, rgba(6, 182, 212, 0.18) 46%, transparent 78%)',
            }}
          />
          <div
            className="absolute bottom-[-16%] right-[10%] w-[54%] h-[54%] rounded-full blur-[76px]"
            style={{
              background:
                'radial-gradient(circle, rgba(6, 182, 212, 0.22) 0%, rgba(14, 116, 144, 0.16) 50%, transparent 80%)',
            }}
          />

          <svg
            viewBox="0 0 1000 520"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
            fill="none"
          >
            {/* Tilted Planetary Orbital Rings */}
            <g opacity="0.16">
              <ellipse
                cx="520"
                cy="265"
                rx="380"
                ry="128"
                transform="rotate(-14 520 265)"
                stroke="#06B6D4"
                strokeWidth="1.6"
              />
              <ellipse
                cx="520"
                cy="265"
                rx="280"
                ry="92"
                transform="rotate(-14 520 265)"
                stroke="#10B981"
                strokeWidth="1.4"
                strokeDasharray="8 8"
              />
              <ellipse
                cx="520"
                cy="265"
                rx="178"
                ry="58"
                transform="rotate(-14 520 265)"
                stroke="#34D399"
                strokeWidth="1.4"
              />
            </g>

            {/* Galactic Spiral Arm */}
            <g className="world-pulse-soft" opacity="0.16">
              <path
                d="M 520 265 C 555 240, 585 275, 550 308 C 500 352, 412 316, 424 242 C 438 152, 574 128, 660 205 C 745 280, 704 415, 560 448"
                stroke="#34D399"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </g>

            {/* 7-Step Ascending Modal Staircase in Perspective */}
            <g className="world-float-slow" opacity="0.18">
              {[0, 1, 2, 3, 4, 5, 6].map((step) => {
                const x = 155 + step * 102;
                const y = 408 - step * 44;
                const w = 68 - step * 3;
                return (
                  <g key={step}>
                    <rect
                      x={x}
                      y={y}
                      width={w}
                      height="9"
                      rx="4.5"
                      fill={step % 2 === 0 ? '#10B981' : '#06B6D4'}
                    />
                    <circle cx={x + w / 2} cy={y - 10} r="3.2" fill="#A7F3D0" />
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      );

    /* =========================================================================
     * MUNDO 5 — Armonía en Acción (Gravedad Tonal y Cadencias)
     * ========================================================================= */
    case 5:
      return (
        <div className="absolute inset-0">
          {/* Indigo, Soft Magenta & Warm Rumie Orange Atmosphere */}
          <div
            className="absolute -top-[16%] left-[12%] w-[56%] h-[64%] rounded-full blur-[78px]"
            style={{
              background:
                'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(236, 72, 153, 0.16) 46%, transparent 78%)',
            }}
          />
          <div
            className="absolute bottom-[-16%] right-[8%] w-[54%] h-[58%] rounded-full blur-[76px]"
            style={{
              background:
                'radial-gradient(circle, rgba(255, 90, 0, 0.20) 0%, rgba(236, 72, 153, 0.15) 48%, transparent 78%)',
            }}
          />

          <svg
            viewBox="0 0 1000 520"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
            fill="none"
          >
            {/* Large Translucent Circle of Fifths Wheel */}
            <g transform="translate(510 262)" opacity="0.16">
              <g className="world-slow-spin">
                <circle cx="0" cy="0" r="205" stroke="#818CF8" strokeWidth="1.8" />
                <circle cx="0" cy="0" r="154" stroke="#EC4899" strokeWidth="1.4" strokeDasharray="6 6" />
                <circle cx="0" cy="0" r="96" stroke="#FF8C42" strokeWidth="1.4" />
                {Array.from({ length: 12 }, (_, idx) => {
                  const angle = (idx * 30 * Math.PI) / 180;
                  const x1 = Math.cos(angle) * 96;
                  const y1 = Math.sin(angle) * 96;
                  const x2 = Math.cos(angle) * 205;
                  const y2 = Math.sin(angle) * 205;
                  return (
                    <g key={idx}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#A5B4FC" strokeWidth="1.1" />
                      <circle cx={x2} cy={y2} r="4.5" fill={idx % 3 === 0 ? '#FF5A00' : '#F472B6'} />
                    </g>
                  );
                })}
              </g>
            </g>

            {/* Magnetic Tonal Gravity Curves (Tension <-> Resolution) */}
            <g className="cosmic-drift" opacity="0.17">
              <path
                d="M 110 262 C 260 110, 420 110, 510 262 C 600 414, 760 414, 900 262"
                stroke="#EC4899"
                strokeWidth="2"
              />
              <path
                d="M 110 262 C 260 414, 420 414, 510 262 C 600 110, 760 110, 900 262"
                stroke="#FF8C42"
                strokeWidth="1.8"
                strokeDasharray="8 7"
              />
            </g>
          </svg>
        </div>
      );

    /* =========================================================================
     * MUNDO 6 — Melodías y Memoria (Aurora Lírica Nocturna)
     * ========================================================================= */
    case 6:
      return (
        <div className="absolute inset-0">
          {/* Sky Blue, Violet & Pale Gold Aurora Glow */}
          <div
            className="absolute -top-[18%] left-[10%] w-[64%] h-[62%] rounded-full blur-[82px]"
            style={{
              background:
                'radial-gradient(ellipse, rgba(56, 189, 248, 0.24) 0%, rgba(168, 85, 247, 0.18) 48%, transparent 78%)',
            }}
          />
          <div
            className="absolute bottom-[-14%] right-[12%] w-[52%] h-[52%] rounded-full blur-[76px]"
            style={{
              background:
                'radial-gradient(circle, rgba(251, 191, 36, 0.18) 0%, rgba(168, 85, 247, 0.14) 52%, transparent 80%)',
            }}
          />

          <svg
            viewBox="0 0 1000 520"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
            fill="none"
          >
            <defs>
              <linearGradient id="w6-aurora" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0" />
                <stop offset="30%" stopColor="#38BDF8" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#A855F7" stopOpacity="0.9" />
                <stop offset="85%" stopColor="#FBBF24" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="w6-curtain" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
                <stop offset="55%" stopColor="#A855F7" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#080A11" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Soft Aurora Borealis Curtains */}
            <g className="cosmic-drift" opacity="0.16">
              <path
                d="M 40 90 C 240 25, 420 175, 650 105 C 810 55, 920 120, 1020 70 L 1020 270 C 860 315, 720 220, 560 270 C 370 325, 220 205, 40 265 Z"
                fill="url(#w6-curtain)"
              />
            </g>

            {/* Flowing 5-Line Curved Musical Staff Ribbon */}
            <g className="cosmic-drift-reverse" opacity="0.16">
              {[0, 10, 20, 30, 40].map((dy) => (
                <path
                  key={dy}
                  d={`M -30 ${255 + dy} C 220 ${170 + dy}, 430 ${345 + dy}, 695 ${240 + dy} C 835 ${185 + dy}, 935 ${235 + dy}, 1030 ${205 + dy}`}
                  stroke="url(#w6-aurora)"
                  strokeWidth="1.35"
                />
              ))}
            </g>

            {/* Floating Luminous Melodic Note Trails */}
            <g className="world-float-slow" opacity="0.18">
              <g transform="translate(230 220) rotate(-8)">
                <path
                  d="M 10 26 L 10 -8 L 36 -14 L 36 20 L 31 20 L 31 -7 L 15 -3 L 15 26 Z"
                  fill="#FBBF24"
                />
                <ellipse cx="7" cy="27" rx="7" ry="5" fill="#FBBF24" />
                <ellipse cx="30" cy="21" rx="7" ry="5" fill="#FBBF24" />
              </g>
              <g transform="translate(725 182) rotate(10)">
                <path
                  d="M 10 26 L 10 -12 C 20 -9, 27 -2, 24 8 C 22 2, 17 -3, 14 -4 L 14 26 Z"
                  fill="#38BDF8"
                />
                <ellipse cx="7" cy="27" rx="7" ry="5" fill="#38BDF8" />
              </g>
              <g transform="translate(530 345) rotate(-5)">
                <path
                  d="M 10 26 L 10 -12 C 20 -9, 27 -2, 24 8 C 22 2, 17 -3, 14 -4 L 14 26 Z"
                  fill="#C084FC"
                />
                <ellipse cx="7" cy="27" rx="7" ry="5" fill="#C084FC" />
              </g>
            </g>
          </svg>
        </div>
      );

    /* =========================================================================
     * MUNDO 7 — Ritmo y Precisión (Pulso y Compás Cósmico)
     * ========================================================================= */
    case 7:
      return (
        <div className="absolute inset-0">
          {/* Ruby / Energetic Rumie Orange & Cyan Atmosphere */}
          <div
            className="absolute -top-[14%] right-[16%] w-[56%] h-[62%] rounded-full blur-[78px]"
            style={{
              background:
                'radial-gradient(circle, rgba(244, 63, 94, 0.24) 0%, rgba(255, 90, 0, 0.18) 46%, transparent 78%)',
            }}
          />
          <div
            className="absolute bottom-[-18%] left-[12%] w-[52%] h-[52%] rounded-full blur-[74px]"
            style={{
              background:
                'radial-gradient(circle, rgba(0, 229, 255, 0.19) 0%, rgba(244, 63, 94, 0.12) 52%, transparent 80%)',
            }}
          />

          <svg
            viewBox="0 0 1000 520"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
            fill="none"
          >
            {/* Precision Subdivided Concentric Rhythm Compass / Clock */}
            <g transform="translate(505 248)" opacity="0.17">
              <g className="world-slow-spin">
                <circle cx="0" cy="0" r="198" stroke="#F43F5E" strokeWidth="1.6" />
                <circle cx="0" cy="0" r="146" stroke="#FF5A00" strokeWidth="1.4" strokeDasharray="10 6" />
                <circle cx="0" cy="0" r="92" stroke="#00E5FF" strokeWidth="1.3" />
                {/* 16th-note precision tick marks around the clock */}
                {Array.from({ length: 16 }, (_, idx) => {
                  const angle = (idx * 22.5 * Math.PI) / 180;
                  const isDownbeat = idx % 4 === 0;
                  const innerR = isDownbeat ? 168 : 182;
                  const outerR = 198;
                  return (
                    <line
                      key={idx}
                      x1={Math.cos(angle) * innerR}
                      y1={Math.sin(angle) * innerR}
                      x2={Math.cos(angle) * outerR}
                      y2={Math.sin(angle) * outerR}
                      stroke={isDownbeat ? '#FF5A00' : '#FDA4AF'}
                      strokeWidth={isDownbeat ? '3' : '1.4'}
                      strokeLinecap="round"
                    />
                  );
                })}
              </g>
            </g>

            {/* Rhythmic Pulse Wave Line */}
            <g opacity="0.16">
              <path
                d="M 0 250 L 210 250 L 235 198 L 258 292 L 282 250 L 440 250 L 465 182 L 492 308 L 518 250 L 690 250 L 714 202 L 736 286 L 758 250 L 1000 250"
                stroke="#00E5FF"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* Symmetrical Subtle Equalizer Bars along the Bottom Base */}
            <g opacity="0.15">
              {[24, 42, 68, 48, 84, 60, 96, 72, 108, 72, 96, 60, 84, 48, 68, 42, 24].map(
                (h, idx) => (
                  <rect
                    key={idx}
                    x={178 + idx * 38}
                    y={520 - h}
                    width="18"
                    height={h}
                    rx="5"
                    fill={idx % 3 === 0 ? '#00E5FF' : idx % 2 === 0 ? '#F43F5E' : '#FF5A00'}
                  />
                )
              )}
            </g>
          </svg>
        </div>
      );

    /* =========================================================================
     * MUNDO 8 — Maestro del Oído (Templo Dorado de la Maestría)
     * ========================================================================= */
    case 8:
    default:
      return (
        <div className="absolute inset-0">
          {/* Imperial Radiant Gold, Amber & Starlight Atmosphere */}
          <div
            className="absolute top-[-14%] left-[20%] w-[62%] h-[68%] rounded-full blur-[82px]"
            style={{
              background:
                'radial-gradient(circle, rgba(255, 184, 0, 0.27) 0%, rgba(255, 90, 0, 0.16) 46%, transparent 78%)',
            }}
          />
          <div
            className="absolute bottom-[-16%] right-[10%] w-[52%] h-[56%] rounded-full blur-[76px]"
            style={{
              background:
                'radial-gradient(circle, rgba(253, 230, 138, 0.20) 0%, rgba(255, 184, 0, 0.14) 50%, transparent 78%)',
            }}
          />

          <svg
            viewBox="0 0 1000 520"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full"
            fill="none"
          >
            {/* Grand Sacred Harmonic Rose-Window Mandala Filigree */}
            <g transform="translate(500 262)" opacity="0.18">
              <g className="world-slow-spin">
                <circle cx="0" cy="0" r="218" stroke="#FFB800" strokeWidth="1.8" />
                <circle cx="0" cy="0" r="176" stroke="#FDE68A" strokeWidth="1.2" strokeDasharray="5 5" />
                <circle cx="0" cy="0" r="118" stroke="#FF5A00" strokeWidth="1.4" />
                {/* 12 Sacred Filigree Petals */}
                {Array.from({ length: 12 }, (_, idx) => (
                  <ellipse
                    key={idx}
                    cx="0"
                    cy="-118"
                    rx="28"
                    ry="86"
                    transform={`rotate(${idx * 30})`}
                    stroke={idx % 2 === 0 ? '#FFB800' : '#FDE68A'}
                    strokeWidth="1.15"
                  />
                ))}
              </g>
              <g className="world-slow-spin-reverse">
                <polygon
                  points="0,-148 128,74 -128,74"
                  stroke="#FDE68A"
                  strokeWidth="1.2"
                />
                <polygon
                  points="0,148 128,-74 -128,-74"
                  stroke="#FFB800"
                  strokeWidth="1.2"
                />
              </g>
            </g>

            {/* Majestic Subtle Treble Clef Flank Motifs */}
            <g transform="translate(152 252) scale(0.75)" opacity="0.14">
              <g className="world-float-slow">
                <path
                  d="M 10 88 C 10 102, -4 108, -14 101 C -21 96, -20 84, -11 81 C -3 79, 2 85, 0 92 C 8 92, 13 84, 10 72 L -8 -74 C -10 -92, 2 -108, 13 -106 C 24 -104, 28 -86, 17 -66 C 8 -50, -19 -34, -26 -10 C -33 14, -18 39, 8 40 C 29 41, 43 24, 38 4 C 34 -13, 16 -22, 1 -15 C -12 -9, -15 8, -4 17 C 4 23, 14 21, 17 14 C 10 16, 4 11, 5 4 C 6 -4, 17 -6, 22 3 C 27 13, 18 28, 4 27 C -14 26, -22 8, -15 -10 C -8 -28, 16 -43, 25 -62 C 34 -81, 28 -110, 11 -112 C -6 -114, -19 -92, -16 -70 L 4 74 Z"
                  fill="#FDE68A"
                />
              </g>
            </g>

            {/* Fine Rising Golden Dust Particles Floating Toward the Final Boss */}
            <g opacity="0.28">
              {[
                [742, 412, 2.3, '0s'],
                [788, 365, 1.9, '1.2s'],
                [836, 428, 2.5, '2.4s'],
                [878, 344, 2.0, '0.7s'],
                [916, 392, 1.8, '1.9s'],
                [810, 290, 2.2, '3.1s'],
                [892, 258, 2.4, '1.5s'],
                [660, 420, 1.8, '2.8s'],
              ].map(([cx, cy, r, delay], i) => (
                <circle
                  key={i}
                  cx={cx as number}
                  cy={cy as number}
                  r={r as number}
                  fill="#FDE68A"
                  className="world-dust-rise"
                  style={{ animationDelay: delay as string }}
                />
              ))}
            </g>
          </svg>
        </div>
      );
  }
};

export const WorldStageBackdrop: React.FC<WorldStageBackdropProps> = ({ worldId }) => {
  const [prevWorldId, setPrevWorldId] = useState<number | null>(null);
  const currentRef = useRef<number>(worldId);

  useEffect(() => {
    if (currentRef.current !== worldId) {
      const outgoing = currentRef.current;
      currentRef.current = worldId;
      setPrevWorldId(outgoing);

      const timer = window.setTimeout(() => {
        setPrevWorldId((curr) => (curr === outgoing ? null : curr));
      }, 370);

      return () => window.clearTimeout(timer);
    }
  }, [worldId]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none bg-[#080A11]"
    >
      {/* Subtle architectural dark-studio grid whisper for cohesion */}
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
        }}
      />

      {/* Outgoing World Backdrop (stays steady underneath during the 350ms cross-fade) */}
      {prevWorldId !== null && (
        <div key={`out-${prevWorldId}`} className="absolute inset-0">
          <WorldThemeLayer worldId={prevWorldId} />
        </div>
      )}

      {/* Active World Backdrop with smooth 350ms ease fade-in */}
      <div
        key={`in-${worldId}`}
        className={`absolute inset-0 ${prevWorldId !== null ? 'world-backdrop-fade' : ''}`}
      >
        <WorldThemeLayer worldId={worldId} />
      </div>

      {/* Subtle Ambient Dust Stars (very low opacity for depth across all 8 worlds) */}
      <svg
        viewBox="0 0 1000 520"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full opacity-25"
        fill="none"
      >
        {WORLD_AMBIENT_STARS.map(([cx, cy, r], idx) => (
          <circle
            key={idx}
            cx={cx}
            cy={cy}
            r={r}
            fill="#FFFFFF"
            className="star-twinkle"
            style={
              {
                '--twinkle-dur': `${3.2 + (idx % 4) * 0.8}s`,
                '--twinkle-delay': `${(idx * 0.45).toFixed(2)}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </svg>

      {/* Protective Dark Perimeter & Top-Left Title Vignette for 100% Crisp Legibility */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 74% at 52% 54%, transparent 38%, rgba(8, 10, 17, 0.72) 100%), radial-gradient(ellipse 52% 38% at 10% 8%, rgba(8, 10, 17, 0.62) 0%, transparent 72%)',
        }}
      />
    </div>
  );
};
