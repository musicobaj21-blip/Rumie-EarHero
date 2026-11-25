import React, { useId } from 'react';

export type MusicianState = 'idle' | 'walking' | 'listening' | 'celebrate' | 'encourage';

interface MusicianCharacterProps {
  state?: MusicianState;
  facing?: 'right' | 'left';
  size?: number;
  className?: string;
  showNotes?: boolean;
  showGroundGlow?: boolean;
}

/**
 * "El Viajero Musical Rumie" — Original 2D stylized chibi game protagonist
 * with padded dark guitar gig-bag (#FF5A00 trim) & headstock peeking diagonally
 * behind his shoulder, diagonal chest strap with buckle, Rumie hoodie, urban sneakers,
 * and electric cyan (#00E5FF) studio headphones.
 */
export const MusicianCharacter: React.FC<MusicianCharacterProps> = ({
  state = 'idle',
  facing = 'right',
  size = 76,
  className = '',
  showNotes = true,
  showGroundGlow = false,
}) => {
  const uid = useId().replace(/:/g, '');
  const isWalking = state === 'walking';
  const isListening = state === 'listening';
  const isCelebrate = state === 'celebrate';
  const isEncourage = state === 'encourage';

  const bodyAnimClass = isWalking
    ? 'char-walk-body'
    : isCelebrate
      ? 'char-celebrate'
      : 'char-breathe';

  const width = Math.round((size * 120) / 146);

  return (
    <div
      className={`relative inline-flex items-center justify-center pointer-events-none select-none ${className}`}
      style={{ width, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 -6 120 146"
        width={width}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transform: facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
          transition: 'transform 160ms ease',
          overflow: 'visible',
        }}
      >
        <defs>
          <linearGradient id={`bagGrad-${uid}`} x1="20" y1="10" x2="95" y2="108" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#262A3E" />
            <stop offset="100%" stopColor="#11131E" />
          </linearGradient>
          <linearGradient id={`hoodieGrad-${uid}`} x1="36" y1="66" x2="84" y2="106" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#272A3C" />
            <stop offset="100%" stopColor="#141622" />
          </linearGradient>
          <linearGradient id={`skinGrad-${uid}`} x1="42" y1="24" x2="78" y2="66" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE1C6" />
            <stop offset="100%" stopColor="#F1BA92" />
          </linearGradient>
          <linearGradient id={`hairGrad-${uid}`} x1="34" y1="24" x2="88" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2A2F45" />
            <stop offset="100%" stopColor="#141624" />
          </linearGradient>
          <linearGradient id={`capCrownGrad-${uid}`} x1="40" y1="11" x2="80" y2="35" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#282C3F" />
            <stop offset="55%" stopColor="#161822" />
            <stop offset="100%" stopColor="#0E1018" />
          </linearGradient>
          <linearGradient id={`capVisorGrad-${uid}`} x1="36" y1="30" x2="92" y2="39" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1C2030" />
            <stop offset="60%" stopColor="#0E1017" />
            <stop offset="100%" stopColor="#080A10" />
          </linearGradient>
          <radialGradient id={`groundGlow-${uid}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={isCelebrate ? '#FFB800' : '#00E5FF'} stopOpacity="0.65" />
            <stop offset="100%" stopColor={isCelebrate ? '#FF5A00' : '#00E5FF'} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ground Luminous Ring (Map Node Anchor) */}
        {showGroundGlow && (
          <ellipse
            cx="60"
            cy="131"
            rx="30"
            ry="8"
            fill={`url(#groundGlow-${uid})`}
          />
        )}

        {/* Ground Floor Shadow */}
        <ellipse
          cx="60"
          cy="131"
          rx={isCelebrate ? 17 : isWalking ? 21 : 23}
          ry="5"
          fill="#040509"
          fillOpacity={isCelebrate ? 0.42 : 0.65}
        />

        {/* Celebrate Golden Sparkles */}
        {isCelebrate && (
          <g>
            <path
              d="M20 26 L22.5 20 L25 26 L31 28.5 L25 31 L22.5 37 L20 31 L14 28.5 Z"
              fill="#FFB800"
            />
            <path
              d="M96 18 L98 13 L100 18 L105 20 L100 22 L98 27 L96 22 L91 20 Z"
              fill="#FFB800"
            />
            <circle cx="32" cy="10" r="2.5" fill="#00E5FF" />
            <circle cx="104" cy="40" r="2.5" fill="#FF5A00" />
          </g>
        )}

        {/* Floating Musical Notes (Idle / Listening) */}
        {showNotes && (state === 'idle' || isListening) && (
          <g>
            <text
              x="14"
              y="32"
              fill={isListening ? '#00E5FF' : '#FFB800'}
              fontSize="13"
              fontWeight="700"
              className="char-note-1"
            >
              ♪
            </text>
            <text
              x="98"
              y="52"
              fill={isListening ? '#00E5FF' : '#FF5A00'}
              fontSize="12"
              fontWeight="700"
              className="char-note-2"
            >
              ♫
            </text>
          </g>
        )}

        {/* MAIN ANIMATED CHARACTER GROUP */}
        <g className={bodyAnimClass}>
          {/* ===== GUITAR GIG-BAG BEHIND BACK (PROTAGONIST SIGNATURE) ===== */}
          <g className={isWalking ? '' : 'char-bag-sway'}>
            {/* Guitar Headstock (Pala) & Tuning Pegs peeking diagonally above right shoulder */}
            <g transform="rotate(28 84 38)">
              {/* Neck sleeve exiting top of gig bag */}
              <rect
                x="78"
                y="24"
                width="10"
                height="24"
                rx="3"
                fill="#181B29"
                stroke="#FF5A00"
                strokeWidth="1.4"
              />
              {/* Characteristic Guitar Headstock silhouette */}
              <path
                d="M76 8 C76 5, 89 3, 91 7 L90 25 L77 25 Z"
                fill="#222638"
                stroke="#FF5A00"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              {/* Orange Rumie accent stripe on headstock */}
              <path d="M81 10 L86 10 L85.5 21 L81.5 21 Z" fill="#FF5A00" opacity="0.85" />
              {/* Tuning Pegs (Clavijas) left & right */}
              <circle cx="74" cy="11" r="2.1" fill="#E5E9F5" stroke="#090B11" strokeWidth="0.8" />
              <circle cx="74" cy="16.5" r="2.1" fill="#E5E9F5" stroke="#090B11" strokeWidth="0.8" />
              <circle cx="74.5" cy="22" r="2.1" fill="#E5E9F5" stroke="#090B11" strokeWidth="0.8" />
              <circle cx="92.5" cy="11" r="2.1" fill="#FFB800" stroke="#090B11" strokeWidth="0.8" />
              <circle cx="92.5" cy="16.5" r="2.1" fill="#FFB800" stroke="#090B11" strokeWidth="0.8" />
              <circle cx="92" cy="22" r="2.1" fill="#FFB800" stroke="#090B11" strokeWidth="0.8" />
            </g>

            {/* Padded Gig-Bag Body behind torso (tilted diagonally) */}
            <g transform="rotate(26 62 78)">
              <path
                d="M44 46 C44 38, 76 38, 76 46 L81 74 C86 92, 82 106, 60 107 C38 106, 34 92, 39 74 Z"
                fill={`url(#bagGrad-${uid})`}
                stroke="#FF5A00"
                strokeWidth="2.4"
                strokeLinejoin="round"
              />
              {/* Gig-bag zipper pocket line */}
              <path
                d="M44 79 Q60 73 76 79"
                stroke="#FF5A00"
                strokeWidth="1.4"
                strokeLinecap="round"
                opacity="0.85"
              />
              {/* Lower gig-bag pocket */}
              <rect
                x="47"
                y="84"
                width="26"
                height="13"
                rx="4"
                fill="#1D2030"
                stroke="#FF5A00"
                strokeOpacity="0.6"
                strokeWidth="1.2"
              />
            </g>
          </g>

          {/* ===== LEGS & URBAN SNEAKERS ===== */}
          <g className={isWalking ? 'char-leg-l' : ''}>
            {/* Left leg */}
            <rect x="44" y="96" width="12" height="20" rx="5" fill="#131624" stroke="#090B11" strokeWidth="1.5" />
            {/* Left urban sneaker */}
            <path
              d="M41 114 C41 111, 56 111, 57 116 L58 122 C58 124, 39 124, 39 121 Z"
              fill="#1E2233"
              stroke="#090B11"
              strokeWidth="1.5"
            />
            <path d="M40 121 L57 121" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M45 116 L53 116" stroke="#FF5A00" strokeWidth="2" strokeLinecap="round" />
          </g>

          <g className={isWalking ? 'char-leg-r' : ''}>
            {/* Right leg */}
            <rect x="64" y="96" width="12" height="20" rx="5" fill="#171A2B" stroke="#090B11" strokeWidth="1.5" />
            {/* Right urban sneaker */}
            <path
              d="M63 114 C63 111, 78 111, 81 116 L81 122 C81 124, 62 124, 62 121 Z"
              fill="#23273B"
              stroke="#090B11"
              strokeWidth="1.5"
            />
            <path d="M63 121 L80 121" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M68 116 L76 116" stroke="#FF5A00" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* ===== TORSO / DARK HOODIE WITH RUMIE ORANGE ACCENTS ===== */}
          <path
            d="M38 72 C38 64, 82 64, 82 72 L85 98 C85 103, 76 105, 60 105 C44 105, 35 103, 35 98 Z"
            fill={`url(#hoodieGrad-${uid})`}
            stroke="#0A0C12"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Orange hood collar trim */}
          <path
            d="M44 67 Q60 75 76 67"
            stroke="#FF5A00"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Hoodie front kangaroo pocket */}
          <path
            d="M45 89 L75 89 L77 99 Q60 102 43 99 Z"
            fill="#141622"
            stroke="#2B3046"
            strokeWidth="1.2"
          />

          {/* ===== DIAGONAL GUITAR STRAP ACROSS CHEST WITH BUCKLE ===== */}
          <path
            d="M74 66 L41 99"
            stroke="#0C0E16"
            strokeWidth="7.5"
            strokeLinecap="round"
          />
          <path
            d="M74 66 L41 99"
            stroke="#FF5A00"
            strokeWidth="4.2"
            strokeLinecap="round"
          />
          {/* Metallic strap buckle */}
          <rect
            x="54"
            y="78"
            width="9"
            height="7"
            rx="1.8"
            transform="rotate(-45 58.5 81.5)"
            fill="#E5E9F5"
            stroke="#090B11"
            strokeWidth="1.2"
          />

          {/* ===== ARMS ===== */}
          {/* Left Arm */}
          {isCelebrate ? (
            <path
              d="M40 72 Q26 58 29 44"
              stroke="#1C1D29"
              strokeWidth="10"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M40 73 Q31 84 35 94"
              stroke="#1C1D29"
              strokeWidth="10"
              strokeLinecap="round"
            />
          )}
          <circle
            cx={isCelebrate ? 29 : 35}
            cy={isCelebrate ? 44 : 94}
            r="4.8"
            fill={`url(#skinGrad-${uid})`}
            stroke="#090B11"
            strokeWidth="1.3"
          />

          {/* Right Arm */}
          {isCelebrate ? (
            <path
              d="M80 72 Q94 58 91 44"
              stroke="#24273A"
              strokeWidth="10"
              strokeLinecap="round"
            />
          ) : isEncourage ? (
            <path
              d="M80 73 Q92 72 95 62"
              stroke="#24273A"
              strokeWidth="10"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M80 73 Q89 84 85 94"
              stroke="#24273A"
              strokeWidth="10"
              strokeLinecap="round"
            />
          )}
          <circle
            cx={isCelebrate ? 91 : isEncourage ? 95 : 85}
            cy={isCelebrate ? 44 : isEncourage ? 62 : 94}
            r="4.8"
            fill={`url(#skinGrad-${uid})`}
            stroke="#090B11"
            strokeWidth="1.3"
          />

          {/* ===== HEADPHONES AROUND NECK (when NOT in listening mode) ===== */}
          {!isListening && (
            <g>
              <path
                d="M44 65 Q60 76 76 65"
                stroke="#2D3248"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Left & Right Earcups on collar with electric cyan glow */}
              <rect x="41" y="64" width="8" height="11" rx="3.5" fill="#181B29" stroke="#00E5FF" strokeWidth="1.6" />
              <rect x="71" y="64" width="8" height="11" rx="3.5" fill="#181B29" stroke="#00E5FF" strokeWidth="1.6" />
            </g>
          )}

          {/* ===== UNIFIED HEAD + URBAN SNAPBACK CAP + EXPRESSIVE FACE GROUP ===== */}
          <g>
            {/* Ears */}
            <circle cx="36" cy="46" r="4.5" fill="#F0B890" stroke="#090B11" strokeWidth="1.5" />
            <circle cx="84" cy="46" r="4.5" fill="#F0B890" stroke="#090B11" strokeWidth="1.5" />

            {/* Head Shape */}
            <rect
              x="37"
              y="22"
              width="46"
              height="43"
              rx="21"
              fill={`url(#skinGrad-${uid})`}
              stroke="#0A0C12"
              strokeWidth="2"
            />

            {/* Natural Short Side Hair & Sideburns peeking beneath the cap */}
            <path
              d="M36.5 33.5 C35.5 37.5, 36.2 42.5, 39 45 C40.6 42.2, 41 37.5, 42.2 34 Z"
              fill={`url(#hairGrad-${uid})`}
              stroke="#0A0C12"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path
              d="M83.5 33.5 C84.5 37.5, 83.8 42.5, 81 45 C79.4 42.2, 79 37.5, 77.8 34 Z"
              fill={`url(#hairGrad-${uid})`}
              stroke="#0A0C12"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />

            {/* Soft Visor Cast Shadow on Upper Forehead (kept cleanly above eyebrows) */}
            <path
              d="M39.5 34.5 Q60 38.2 80.5 34.5 L80 37.6 Q60 40.6 40 37.6 Z"
              fill="#090B11"
              fillOpacity="0.22"
            />

            {/* Expressive Eyebrows (fully visible below visor shadow) */}
            <path
              d={isCelebrate ? 'M46 39.2 Q50 37.2 54 39' : 'M46 40.4 Q50 38.8 54 40.2'}
              stroke="#1C1F2E"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            <path
              d={isCelebrate ? 'M66 39 Q70 37.2 74 39.2' : 'M66 40.2 Q70 38.8 74 40.4'}
              stroke="#1C1F2E"
              strokeWidth="1.7"
              strokeLinecap="round"
            />

            {/* Eyes (with blink animation or focused closed arcs in listening mode) */}
            {isListening ? (
              <g>
                <path d="M46 46.5 Q50 43.5 54 46.5" stroke="#14151D" strokeWidth="2.4" strokeLinecap="round" />
                <path d="M66 46.5 Q70 43.5 74 46.5" stroke="#14151D" strokeWidth="2.4" strokeLinecap="round" />
              </g>
            ) : (
              <g className="char-blink">
                <ellipse cx="50" cy="46.5" rx="3.4" ry="4.1" fill="#14151D" />
                <circle cx="51.2" cy="45.1" r="1.2" fill="#FFFFFF" />
                <ellipse cx="70" cy="46.5" rx="3.4" ry="4.1" fill="#14151D" />
                <circle cx="71.2" cy="45.1" r="1.2" fill="#FFFFFF" />
              </g>
            )}

            {/* Rosy Cheeks */}
            <ellipse cx="43.5" cy="52.5" rx="3" ry="1.6" fill="#FF5A00" fillOpacity="0.22" />
            <ellipse cx="76.5" cy="52.5" rx="3" ry="1.6" fill="#FF5A00" fillOpacity="0.22" />

            {/* Expressive Mouth */}
            {isCelebrate ? (
              <path
                d="M54 54.5 Q60 62.5 66 54.5 Z"
                fill="#FF5A00"
                stroke="#14151D"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            ) : isListening ? (
              <path
                d="M56 55.5 Q60 58 64 55.5"
                stroke="#14151D"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : isEncourage ? (
              <path
                d="M55 55.5 Q60 59 65 55"
                stroke="#14151D"
                strokeWidth="2.1"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M54 54.5 Q60 60 66 54.5"
                stroke="#14151D"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            )}

            {/* ===== URBAN MUSIC-PRODUCER BASEBALL CAP / SNAPBACK (JOCKEY) ===== */}
            <g>
              {/* Classic Top Crown Button */}
              <ellipse
                cx="60"
                cy="11.6"
                rx="4.2"
                ry="2.2"
                fill="#222638"
                stroke="#090B11"
                strokeWidth="1.3"
              />
              <ellipse cx="60" cy="11.2" rx="1.6" ry="0.7" fill="#FF5A00" fillOpacity="0.85" />

              {/* Rounded Charcoal/Graphite Cap Crown */}
              <path
                d="M35.5 34.5 C34.8 19.2, 44.5 12.2, 60 12.2 C75.5 12.2, 85.2 19.2, 84.5 34.5 C76 31.4, 44 31.4, 35.5 34.5 Z"
                fill={`url(#capCrownGrad-${uid})`}
                stroke="#090B11"
                strokeWidth="1.9"
                strokeLinejoin="round"
              />

              {/* Subtle 6-Panel Seam Stitching & Dome Highlight */}
              <path
                d="M49 13.8 C45.8 20.5, 45 26.8, 45.4 32.5"
                stroke="#303650"
                strokeWidth="1"
                strokeDasharray="2 1.8"
                strokeLinecap="round"
              />
              <path
                d="M71 13.8 C74.2 20.5, 75 26.8, 74.6 32.5"
                stroke="#303650"
                strokeWidth="1"
                strokeDasharray="2 1.8"
                strokeLinecap="round"
              />
              <path
                d="M43 20.5 C47.5 15.2, 56 14, 65.5 15.6"
                stroke="#FFFFFF"
                strokeOpacity="0.14"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              {/* Minimalist Rumie Orange Front Panel Emblem (Sound-Wave Badge) */}
              <g>
                <rect
                  x="55"
                  y="19.5"
                  width="10"
                  height="7.5"
                  rx="2.5"
                  fill="#FF5A00"
                  fillOpacity="0.18"
                  stroke="#FF5A00"
                  strokeWidth="1.2"
                />
                <line x1="57.7" y1="24.8" x2="57.7" y2="22.4" stroke="#FF5A00" strokeWidth="1.4" strokeLinecap="round" />
                <line x1="60" y1="25.2" x2="60" y2="21.1" stroke="#FFB800" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="62.3" y1="24.8" x2="62.3" y2="22.4" stroke="#FF5A00" strokeWidth="1.4" strokeLinecap="round" />
              </g>

              {/* Curved Urban Front Visor / Brim (#0E1017 with crisp Rumie #FF5A00 edge trim) */}
              <path
                d="M34.2 34.4 C45 29.8, 69 29.2, 92.2 34.8 C93.8 35.3, 93.4 37.6, 90.4 38.1 C71.5 34.5, 48.5 34.2, 35.4 37.2 C33.8 37.4, 33.2 35.2, 34.2 34.4 Z"
                fill={`url(#capVisorGrad-${uid})`}
                stroke="#07090F"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              {/* Crisp Rumie Orange Visor Edge Trim */}
              <path
                d="M36.5 36.2 C52 33.2, 72.5 33.4, 90.8 36.7"
                stroke="#FF5A00"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </g>

            {/* ===== STUDIO HEADPHONES FITTED CLEANLY OVER THE CAP (LISTENING MODE) ===== */}
            {isListening && (
              <g>
                {/* Padded Over-Cap Studio Headband */}
                <path
                  d="M33.5 44 C31.5 5.5, 88.5 5.5, 86.5 44"
                  stroke="#25293D"
                  strokeWidth="4.8"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Cyan Studio Accent Strip along top of headband */}
                <path
                  d="M42.5 12.8 Q60 6.8 77.5 12.8"
                  stroke="#00E5FF"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Glowing Cyan Earcups */}
                <rect
                  x="30"
                  y="38"
                  width="9"
                  height="16"
                  rx="4.5"
                  fill="#141622"
                  stroke="#00E5FF"
                  strokeWidth="2.2"
                />
                <rect
                  x="81"
                  y="38"
                  width="9"
                  height="16"
                  rx="4.5"
                  fill="#141622"
                  stroke="#00E5FF"
                  strokeWidth="2.2"
                />
                {/* Sound pulse arcs outside earcups */}
                <path
                  d="M25 41 Q21 46 25 51"
                  stroke="#00E5FF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  opacity="0.85"
                />
                <path
                  d="M95 41 Q99 46 95 51"
                  stroke="#00E5FF"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  opacity="0.85"
                />
              </g>
            )}
          </g>
        </g>
      </svg>
    </div>
  );
};
