import { ShareCardBadgeType, ShareCardPayload } from '../types/music';

export interface AchievementCardData {
  payload: ShareCardPayload;
  studentName: string;
  slogan: string;
  totalStars: number;
  streakDays: number;
  xp: number;
  globalAccuracy: number;
  dateText: string;
  labels: {
    starsMetric: string;
    streakMetric: string;
    energyMetric: string;
    accuracyMetric: string;
  };
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      if (current) lines.push(current);
      current = word;
      if (lines.length >= maxLines - 1) {
        // Append remainder into final line and truncate gracefully if needed
        const restIndex = words.indexOf(word);
        const remainder = words.slice(restIndex).join(' ');
        let clipped = remainder;
        while (ctx.measureText(clipped).width > maxWidth && clipped.length > 4) {
          clipped = `${clipped.slice(0, -2)}…`;
        }
        lines.push(clipped);
        return lines;
      }
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

function drawVectorStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  fill: string
) {
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

function drawVectorBolt(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  fill: string
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(4, -22);
  ctx.lineTo(-14, 3);
  ctx.lineTo(-1, 3);
  ctx.lineTo(-5, 22);
  ctx.lineTo(14, -3);
  ctx.lineTo(1, -3);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

function drawVectorFlame(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  fill: string
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.bezierCurveTo(10, -10, 15, 0, 13, 10);
  ctx.bezierCurveTo(11, 17, 6, 20, 0, 20);
  ctx.bezierCurveTo(-7, 20, -13, 15, -13, 7);
  ctx.bezierCurveTo(-13, -1, -7, -6, -4, -12);
  ctx.bezierCurveTo(-2, -15, -1, -17, 0, -20);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 10, 5.5, 0, Math.PI * 2);
  ctx.fillStyle = '#FFD452';
  ctx.fill();
  ctx.restore();
}

function drawVectorCrown(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  fill: string
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.moveTo(-22, 14);
  ctx.lineTo(-26, -12);
  ctx.lineTo(-10, 0);
  ctx.lineTo(0, -18);
  ctx.lineTo(10, 0);
  ctx.lineTo(26, -12);
  ctx.lineTo(22, 14);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.fillRect(-22, 17, 44, 5);
  ctx.restore();
}

function drawVectorTarget(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  stroke: string
) {
  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.56, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
  ctx.fillStyle = stroke;
  ctx.fill();
  ctx.restore();
}

function drawVectorWaveEmblem(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  const heights = [14, 28, 42, 24, 36, 18];
  const barW = 6;
  const gap = 5;
  const totalW = heights.length * barW + (heights.length - 1) * gap;
  const startX = -totalW / 2;
  heights.forEach((h, i) => {
    const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
    grad.addColorStop(0, '#00E5FF');
    grad.addColorStop(1, '#FFB800');
    ctx.fillStyle = grad;
    drawRoundedRect(ctx, startX + i * (barW + gap), -h / 2, barW, h, 3);
    ctx.fill();
  });
  ctx.restore();
}

function drawCenterEmblem(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  badgeType: ShareCardBadgeType
) {
  // Soft cosmic halo behind emblem
  const halo = ctx.createRadialGradient(cx, cy, 24, cx, cy, 168);
  if (badgeType === 'diagnostic') {
    halo.addColorStop(0, 'rgba(0, 229, 255, 0.36)');
    halo.addColorStop(0.55, 'rgba(255, 90, 0, 0.16)');
  } else if (badgeType === 'daily60') {
    halo.addColorStop(0, 'rgba(255, 184, 0, 0.42)');
    halo.addColorStop(0.55, 'rgba(255, 90, 0, 0.20)');
  } else {
    halo.addColorStop(0, 'rgba(255, 184, 0, 0.36)');
    halo.addColorStop(0.55, 'rgba(255, 90, 0, 0.18)');
  }
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, 168, 0, Math.PI * 2);
  ctx.fill();

  // Orbital dashed ring
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 184, 0, 0.35)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 10]);
  ctx.beginPath();
  ctx.arc(cx, cy, 114, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Medal ribbon tails for medal / world
  if (badgeType === 'medal' || badgeType === 'world') {
    ctx.save();
    ctx.fillStyle = '#C2410C';
    ctx.beginPath();
    ctx.moveTo(cx - 46, cy + 62);
    ctx.lineTo(cx - 64, cy + 124);
    ctx.lineTo(cx - 32, cy + 108);
    ctx.lineTo(cx - 10, cy + 124);
    ctx.lineTo(cx - 4, cy + 68);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#EA580C';
    ctx.beginPath();
    ctx.moveTo(cx + 46, cy + 62);
    ctx.lineTo(cx + 64, cy + 124);
    ctx.lineTo(cx + 32, cy + 108);
    ctx.lineTo(cx + 10, cy + 124);
    ctx.lineTo(cx + 4, cy + 68);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Outer metallic rim
  const rimGrad = ctx.createLinearGradient(cx - 88, cy - 88, cx + 88, cy + 88);
  rimGrad.addColorStop(0, '#FFE27A');
  rimGrad.addColorStop(0.5, '#FF8A00');
  rimGrad.addColorStop(1, '#FF5A00');
  ctx.save();
  ctx.shadowColor = 'rgba(255, 90, 0, 0.5)';
  ctx.shadowBlur = 24;
  ctx.fillStyle = rimGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 92, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Inner dark medallion core
  const coreGrad = ctx.createRadialGradient(cx, cy - 24, 8, cx, cy, 80);
  coreGrad.addColorStop(0, '#222842');
  coreGrad.addColorStop(1, '#0E111E');
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 78, 0, Math.PI * 2);
  ctx.fill();

  // Inner hairline gold ring
  ctx.strokeStyle = 'rgba(255, 212, 82, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 70, 0, Math.PI * 2);
  ctx.stroke();

  // Center icon
  if (badgeType === 'daily60') {
    drawVectorBolt(ctx, cx, cy, 2.25, '#FFD452');
  } else if (badgeType === 'boss' || badgeType === 'progress') {
    drawVectorCrown(ctx, cx, cy + 2, 1.75, '#FFD452');
  } else if (badgeType === 'diagnostic') {
    drawVectorWaveEmblem(ctx, cx, cy, 1.45);
  } else {
    drawVectorStar(ctx, cx, cy, 44, 19, '#FFD452');
  }
}

/**
 * Renders a crisp 1080x1080 Rumie EarHero achievement PNG card using pure HTML5 Canvas 2D.
 */
export function renderAchievementCardToCanvas(
  canvas: HTMLCanvasElement,
  data: AchievementCardData
): void {
  const SIZE = 1080;
  canvas.width = SIZE;
  canvas.height = SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1) Deep cosmic background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, SIZE, SIZE);
  bgGrad.addColorStop(0, '#070912');
  bgGrad.addColorStop(0.5, '#0D1120');
  bgGrad.addColorStop(1, '#060811');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // 2) Ambient dual-tone cosmic nebulas
  const neb1 = ctx.createRadialGradient(210, 200, 20, 210, 200, 480);
  neb1.addColorStop(0, 'rgba(255, 90, 0, 0.28)');
  neb1.addColorStop(0.5, 'rgba(255, 140, 0, 0.11)');
  neb1.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = neb1;
  ctx.fillRect(0, 0, SIZE, SIZE);

  const neb2 = ctx.createRadialGradient(890, 860, 20, 890, 860, 460);
  neb2.addColorStop(0, 'rgba(0, 229, 255, 0.17)');
  neb2.addColorStop(0.55, 'rgba(99, 102, 241, 0.08)');
  neb2.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = neb2;
  ctx.fillRect(0, 0, SIZE, SIZE);

  // 3) Subtle cosmic arcade grid
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  for (let p = 72; p < SIZE; p += 72) {
    ctx.beginPath();
    ctx.moveTo(p, 36);
    ctx.lineTo(p, SIZE - 36);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(36, p);
    ctx.lineTo(SIZE - 36, p);
    ctx.stroke();
  }
  ctx.restore();

  // 4) Deterministic starfield specks
  ctx.save();
  for (let i = 0; i < 82; i++) {
    const sx = ((i * 197 + 43) % 980) + 50;
    const sy = ((i * 313 + 71) % 980) + 50;
    const sr = i % 9 === 0 ? 2.4 : i % 4 === 0 ? 1.6 : 1.05;
    const alpha = i % 7 === 0 ? 0.8 : i % 3 === 0 ? 0.45 : 0.25;
    ctx.fillStyle = i % 11 === 0 ? `rgba(255, 184, 0, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 5) Glowing orange/amber double border frame
  const borderGrad = ctx.createLinearGradient(36, 36, SIZE - 36, SIZE - 36);
  borderGrad.addColorStop(0, '#FF5A00');
  borderGrad.addColorStop(0.5, '#FFB800');
  borderGrad.addColorStop(1, '#FF5A00');

  ctx.save();
  ctx.shadowColor = 'rgba(255, 90, 0, 0.45)';
  ctx.shadowBlur = 24;
  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = 5;
  drawRoundedRect(ctx, 36, 36, SIZE - 72, SIZE - 72, 42);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(255, 184, 0, 0.22)';
  ctx.lineWidth = 1.8;
  drawRoundedRect(ctx, 54, 54, SIZE - 108, SIZE - 108, 30);
  ctx.stroke();
  ctx.restore();

  // 6) Header: "Rumie EarHero · Entrena tu oído jugando"
  ctx.save();
  const brandFont = '800 38px "Outfit", "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  const sloganFont = '500 26px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';

  ctx.font = brandFont;
  const rumieW = ctx.measureText('Rumie ').width;
  const earHeroW = ctx.measureText('EarHero').width;
  ctx.font = sloganFont;
  const sepText = '  ·  ';
  const sepW = ctx.measureText(sepText).width;
  const sloganW = ctx.measureText(data.slogan).width;

  const totalHeaderW = rumieW + earHeroW + sepW + sloganW;
  let hx = (SIZE - totalHeaderW) / 2;
  const hy = 118;

  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';

  ctx.font = brandFont;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Rumie ', hx, hy);
  hx += rumieW;

  ctx.fillStyle = '#FF5A00';
  ctx.fillText('EarHero', hx, hy);
  hx += earHeroW;

  ctx.font = sloganFont;
  ctx.fillStyle = '#64748B';
  ctx.fillText(sepText, hx, hy);
  hx += sepW;

  ctx.fillStyle = '#CBD5E1';
  ctx.fillText(data.slogan, hx, hy);

  // Glowing divider line under header
  const divGrad = ctx.createLinearGradient(220, 152, 860, 152);
  divGrad.addColorStop(0, 'rgba(255, 90, 0, 0)');
  divGrad.addColorStop(0.5, 'rgba(255, 184, 0, 0.55)');
  divGrad.addColorStop(1, 'rgba(255, 90, 0, 0)');
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(220, 154);
  ctx.lineTo(860, 154);
  ctx.stroke();
  ctx.restore();

  // 7) Central Featured Emblem
  drawCenterEmblem(ctx, SIZE / 2, 294, data.payload.badgeType);

  // 8) Category Pill Tag
  ctx.save();
  const catText = data.payload.categoryTag.toUpperCase();
  ctx.font = '700 20px "JetBrains Mono", ui-monospace, monospace';
  const catW = Math.min(760, ctx.measureText(catText).width + 54);
  const catX = (SIZE - catW) / 2;
  const catY = 434;

  drawRoundedRect(ctx, catX, catY, catW, 42, 21);
  ctx.fillStyle = 'rgba(255, 90, 0, 0.16)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 184, 0, 0.55)';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.fillStyle = '#FFB800';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(catText, SIZE / 2, catY + 21);
  ctx.restore();

  // 9) Achievement Title (wrapped cleanly up to 2 lines)
  ctx.save();
  ctx.font = '800 50px "Outfit", "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const titleLines = wrapText(ctx, data.payload.title, 860, 2);
  const titleStartY = titleLines.length === 1 ? 526 : 514;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, SIZE / 2, titleStartY + i * 58);
  });

  // Subtitle
  const subY = titleLines.length === 1 ? 588 : 622;
  ctx.font = '500 27px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#CBD5E1';
  const subLines = wrapText(ctx, data.payload.subtitle, 840, 2);
  subLines.forEach((line, i) => {
    ctx.fillText(line, SIZE / 2, subY + i * 35);
  });
  ctx.restore();

  // 10) Player Profile Badge
  ctx.save();
  const profileName = data.studentName.trim() || 'Rumie EarHero';
  ctx.font = '700 28px "Outfit", "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
  const nameW = ctx.measureText(profileName).width;
  const pillW = Math.min(620, Math.max(240, nameW + 106));
  const pillH = 62;
  const pillX = (SIZE - pillW) / 2;
  const pillY = 678;

  drawRoundedRect(ctx, pillX, pillY, pillW, pillH, 31);
  ctx.fillStyle = 'rgba(20, 24, 40, 0.92)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Initials avatar inside pill
  const initials =
    profileName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'EH';
  const avCx = pillX + 34;
  const avCy = pillY + pillH / 2;
  const avGrad = ctx.createLinearGradient(avCx - 20, avCy - 20, avCx + 20, avCy + 20);
  avGrad.addColorStop(0, '#FF5A00');
  avGrad.addColorStop(1, '#FFB800');
  ctx.fillStyle = avGrad;
  ctx.beginPath();
  ctx.arc(avCx, avCy, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#090B11';
  ctx.font = '800 17px "Outfit", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, avCx, avCy + 1);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 27px "Outfit", "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(profileName, pillX + 68, avCy + 1, pillW - 92);
  ctx.restore();

  // 11) 4 Real Metrics Tiles
  const metrics = [
    {
      kind: 'stars' as const,
      value: `${data.totalStars}`,
      label: data.labels.starsMetric,
      accent: '#FFB800',
      border: 'rgba(255, 184, 0, 0.35)',
    },
    {
      kind: 'streak' as const,
      value: `${data.streakDays}d`,
      label: data.labels.streakMetric,
      accent: '#FF6B1A',
      border: 'rgba(255, 90, 0, 0.35)',
    },
    {
      kind: 'energy' as const,
      value: `${data.xp}`,
      label: data.labels.energyMetric,
      accent: '#FF8A4C',
      border: 'rgba(255, 90, 0, 0.35)',
    },
    {
      kind: 'accuracy' as const,
      value: data.payload.metric4Value ?? `${data.globalAccuracy}%`,
      label: data.payload.metric4Label ?? data.labels.accuracyMetric,
      accent: '#00E5FF',
      border: 'rgba(0, 229, 255, 0.35)',
    },
  ];

  const gridLeft = 86;
  const gridW = SIZE - gridLeft * 2;
  const gap = 20;
  const cardW = (gridW - gap * 3) / 4;
  const cardH = 148;
  const cardY = 774;

  metrics.forEach((m, idx) => {
    const x = gridLeft + idx * (cardW + gap);
    const cx = x + cardW / 2;

    ctx.save();
    drawRoundedRect(ctx, x, cardY, cardW, cardH, 24);
    ctx.fillStyle = 'rgba(18, 22, 36, 0.92)';
    ctx.fill();
    ctx.strokeStyle = m.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Vector icon
    const iconY = cardY + 34;
    if (m.kind === 'stars') {
      drawVectorStar(ctx, cx, iconY, 15, 7, m.accent);
    } else if (m.kind === 'streak') {
      drawVectorFlame(ctx, cx, iconY, 0.78, m.accent);
    } else if (m.kind === 'energy') {
      drawVectorBolt(ctx, cx, iconY, 0.78, m.accent);
    } else {
      drawVectorTarget(ctx, cx, iconY, 13, m.accent);
    }

    // Value
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 38px "JetBrains Mono", ui-monospace, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(m.value, cx, cardY + 84, cardW - 20);

    // Label
    ctx.fillStyle = m.accent;
    ctx.font = '700 15px "JetBrains Mono", ui-monospace, monospace';
    ctx.fillText(m.label.toUpperCase(), cx, cardY + 124, cardW - 18);
    ctx.restore();
  });

  // 12) Footer: Date + Brand Mark
  ctx.save();
  ctx.font = '600 22px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.fillStyle = '#94A3B8';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(data.dateText, 92, 976);

  ctx.font = '800 22px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillStyle = '#FF5A00';
  ctx.textAlign = 'right';
  ctx.fillText('RUMIE EARHERO', SIZE - 92, 976);
  ctx.restore();
}
