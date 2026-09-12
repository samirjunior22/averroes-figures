// ============================================================
// مولّد الظواهر الميكانيكية — averroes-figures
// ============================================================
// ميدان: الظواهر الميكانيكية (Mechanical Phenomena) — منهاج التعليم المتوسط (BEM)
//
// يشمل 5 نماذج بيداغوجية بأسلوب 2.5D Isometric / Axonometric نقي وعالي الدقة:
// 1. توازن جسم صلب خاضع لقوتين (two_forces_equilibrium): معلق بربيعة/خيط أو مستقر على طاولة
// 2. توازن جسم صلب خاضع لـ 3 قوى غير متوازية (three_forces_equilibrium): تلاقي الحوامل ومثلث القوى المغلق
// 3. دافعة أرخميدس في السوائل (archimedes): الثقل الحقيقي P، الظاهري Papp، السائل المزاح، و FA
// 4. الربيعة، الثقل والكتلة (dynamometer_weight): ربيعة مكبرة مفصلة، P = m.g وخصائص شعاع الثقل
// 5. حركة واحتكاك على مستوٍ مائل (inclined_plane_motion): تفكيك الثقل Px, Py، رد الفعل الناظمي R، وقوة الاحتكاك f
//
// يدعم 3 أوضاع للتأشيرات:
// - 'full': بطاقات شرح عصرية تجمع التسمية العربية والمصطلح الأجنبي
// - 'numbered': دوائر ترقيم 1..N لأسئلة ومسائل الامتحانات وشهادة BEM
// - 'none': رسم توضيحي نقي بدون تأشيرات
//
// المبدأ الحاكم: "لا يرمي أبداً" — أي مواصفات غير صالحة تعيد ''
// ============================================================

import { z } from 'zod';
import type { RenderOptions } from './shared.js';
import { esc, wrapSvg } from './shared.js';

export interface CalloutItem {
  num: number;
  ar: string;
  sub: string;
  target: [number, number];
  card: [number, number];
}

// ------------------------------------------------------------
// المخططات (Zod Schemas)
// ------------------------------------------------------------

export const mechanicsKindSchema = z.enum([
  'two_forces_equilibrium',
  'three_forces_equilibrium',
  'archimedes',
  'dynamometer_weight',
  'inclined_plane_motion',
]);
export type MechanicsKind = z.infer<typeof mechanicsKindSchema>;

export const labelsModeSchema = z.enum(['full', 'numbered', 'none']).default('full');
export type LabelsMode = z.infer<typeof labelsModeSchema>;

export const mechanicsThemeSchema = z.enum(['natural', 'vibrant', 'exam_print']).default('natural');
export type MechanicsTheme = z.infer<typeof mechanicsThemeSchema>;

// 1. مخطط توازن جسم صلب خاضع لقوتين
export const twoForcesEquilibriumSpecSchema = z.object({
  kind: z.literal('two_forces_equilibrium'),
  setupType: z.enum(['suspended_dynamometer', 'suspended_thread', 'table_surface']).optional().default('suspended_dynamometer'),
  forceValue: z.number().positive().optional().default(3),
  bodyShape: z.enum(['box', 'cylinder', 'sphere']).optional().default('cylinder'),
  showVectors: z.boolean().optional().default(true),
  showEquilibriumEquation: z.boolean().optional().default(true),
  labelsMode: labelsModeSchema.optional(),
  theme: mechanicsThemeSchema.optional(),
  caption: z.string().optional(),
});
export type TwoForcesEquilibriumSpec = z.infer<typeof twoForcesEquilibriumSpecSchema>;

// 2. مخطط توازن جسم صلب خاضع لـ 3 قوى غير متوازية
export const threeForcesEquilibriumSpecSchema = z.object({
  kind: z.literal('three_forces_equilibrium'),
  f1: z.number().positive().optional().default(3),
  f2: z.number().positive().optional().default(4),
  f3: z.number().positive().optional().default(5),
  angle1: z.number().min(10).max(80).optional().default(40),
  angle2: z.number().min(100).max(170).optional().default(140),
  showPolygon: z.boolean().optional().default(true),
  showLinesOfAction: z.boolean().optional().default(true),
  labelsMode: labelsModeSchema.optional(),
  theme: mechanicsThemeSchema.optional(),
  caption: z.string().optional(),
});
export type ThreeForcesEquilibriumSpec = z.infer<typeof threeForcesEquilibriumSpecSchema>;

// 3. مخطط دافعة أرخميدس
export const archimedesSpecSchema = z.object({
  kind: z.literal('archimedes'),
  realWeight: z.number().positive().optional().default(4),
  apparentWeight: z.number().positive().optional().default(3),
  displacedVolume: z.number().positive().optional().default(100),
  liquidName: z.string().optional().default('ماء نقي'),
  liquidDensity: z.number().positive().optional().default(1.0),
  submerged: z.enum(['total', 'partial']).optional().default('total'),
  showBuoyancyVector: z.boolean().optional().default(true),
  showWeightVector: z.boolean().optional().default(true),
  showDisplacedLiquid: z.boolean().optional().default(true),
  showCalculations: z.boolean().optional().default(true),
  labelsMode: labelsModeSchema.optional(),
  theme: mechanicsThemeSchema.optional(),
  caption: z.string().optional(),
});
export type ArchimedesSpec = z.infer<typeof archimedesSpecSchema>;

// 4. مخطط الربيعة والثقل والكتلة
export const dynamometerWeightSpecSchema = z.object({
  kind: z.literal('dynamometer_weight'),
  mass: z.number().positive().optional().default(200),
  gravity: z.number().positive().optional().default(10),
  measuredForce: z.number().positive().optional(),
  maxCapacity: z.number().positive().optional().default(5),
  showSpringDetails: z.boolean().optional().default(true),
  showCharacteristics: z.boolean().optional().default(true),
  labelsMode: labelsModeSchema.optional(),
  theme: mechanicsThemeSchema.optional(),
  caption: z.string().optional(),
});
export type DynamometerWeightSpec = z.infer<typeof dynamometerWeightSpecSchema>;

// 5. مخطط المستوى المائل
export const inclinedPlaneMotionSpecSchema = z.object({
  kind: z.literal('inclined_plane_motion'),
  angle: z.number().min(10).max(75).optional().default(30),
  weight: z.number().positive().optional().default(10),
  motionDirection: z.enum(['down', 'up', 'rest']).optional().default('down'),
  showComponents: z.boolean().optional().default(true),
  showNormalReaction: z.boolean().optional().default(true),
  showFriction: z.boolean().optional().default(true),
  showMotionArrow: z.boolean().optional().default(true),
  labelsMode: labelsModeSchema.optional(),
  theme: mechanicsThemeSchema.optional(),
  caption: z.string().optional(),
});
export type InclinedPlaneMotionSpec = z.infer<typeof inclinedPlaneMotionSpecSchema>;

// المخطط العام للظواهر الميكانيكية
export const mechanicsSpecSchema = z.discriminatedUnion('kind', [
  twoForcesEquilibriumSpecSchema,
  threeForcesEquilibriumSpecSchema,
  archimedesSpecSchema,
  dynamometerWeightSpecSchema,
  inclinedPlaneMotionSpecSchema,
]);
export type MechanicsSpec = z.infer<typeof mechanicsSpecSchema>;

// ------------------------------------------------------------
// الثوابت والأبعاد القياسية
// ------------------------------------------------------------

const W = 960;
const H = 540;

interface Palette {
  bgGradient: [string, string];
  standBase: string;
  standRod: string;
  metalDark: string;
  metalLight: string;
  weightColor: string;     // P (أحمر)
  tensionColor: string;    // T (أخضر زمردي)
  reactionColor: string;   // R (أزرق سماوي)
  frictionColor: string;   // f (برتقالي ذهبي)
  liquidColor: string;
  liquidTop: string;
  glassStroke: string;
  glassFill: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  badgeBg: string;
  badgeText: string;
}

function getPalette(theme: MechanicsTheme = 'natural'): Palette {
  if (theme === 'exam_print') {
    return {
      bgGradient: ['#ffffff', '#ffffff'],
      standBase: '#333333',
      standRod: '#444444',
      metalDark: '#555555',
      metalLight: '#cccccc',
      weightColor: '#111111',
      tensionColor: '#222222',
      reactionColor: '#333333',
      frictionColor: '#444444',
      liquidColor: 'rgba(180, 180, 180, 0.25)',
      liquidTop: 'rgba(150, 150, 150, 0.4)',
      glassStroke: '#111111',
      glassFill: 'none',
      cardBg: '#ffffff',
      cardBorder: '#111111',
      textPrimary: '#000000',
      textSecondary: '#444444',
      badgeBg: '#000000',
      badgeText: '#ffffff',
    };
  }

  if (theme === 'vibrant') {
    return {
      bgGradient: ['#0b1329', '#1e1b4b'],
      standBase: '#334155',
      standRod: '#94a3b8',
      metalDark: '#1e293b',
      metalLight: '#cbd5e1',
      weightColor: '#f43f5e',
      tensionColor: '#10b981',
      reactionColor: '#06b6d4',
      frictionColor: '#f59e0b',
      liquidColor: 'rgba(6, 182, 212, 0.35)',
      liquidTop: 'rgba(6, 182, 212, 0.6)',
      glassStroke: 'rgba(255, 255, 255, 0.6)',
      glassFill: 'rgba(255, 255, 255, 0.08)',
      cardBg: 'rgba(15, 23, 42, 0.88)',
      cardBorder: 'rgba(148, 163, 184, 0.35)',
      textPrimary: '#ffffff',
      textSecondary: '#94a3b8',
      badgeBg: '#f43f5e',
      badgeText: '#ffffff',
    };
  }

  // natural (الافتراضي للسبورة التفاعلية)
  return {
    bgGradient: ['#0f172a', '#1e293b'],
    standBase: '#334155',
    standRod: '#94a3b8',
    metalDark: '#1e293b',
    metalLight: '#cbd5e1',
    weightColor: '#ef4444',    // أحمر ناصع للثقل
    tensionColor: '#10b981',   // أخضر زمردي للتوتر
    reactionColor: '#38bdf8',  // أزرق رد الفعل
    frictionColor: '#f59e0b',  // برتقالي الاحتكاك
    liquidColor: 'rgba(56, 189, 248, 0.28)',
    liquidTop: 'rgba(56, 189, 248, 0.45)',
    glassStroke: 'rgba(255, 255, 255, 0.5)',
    glassFill: 'rgba(255, 255, 255, 0.06)',
    cardBg: 'rgba(30, 41, 59, 0.85)',
    cardBorder: 'rgba(148, 163, 184, 0.28)',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    badgeBg: '#3b82f6',
    badgeText: '#ffffff',
  };
}

// ------------------------------------------------------------
// مساعدات الرسم 2.5D Isometric والتأشيرات
// ------------------------------------------------------------

function renderDefs(palette: Palette): string {
  return `
  <defs>
    <linearGradient id="mech-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.bgGradient[0]}"/>
      <stop offset="100%" stop-color="${palette.bgGradient[1]}"/>
    </linearGradient>
    <linearGradient id="mech-metal-rod" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${palette.metalDark}"/>
      <stop offset="50%" stop-color="${palette.metalLight}"/>
      <stop offset="100%" stop-color="${palette.metalDark}"/>
    </linearGradient>
    <linearGradient id="mech-cylinder-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="45%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <linearGradient id="mech-gold-weight" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="50%" stop-color="#fcd34d"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <radialGradient id="mech-sphere-grad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#334155"/>
    </radialGradient>
    <filter id="mech-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <filter id="mech-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-opacity="0.3"/>
    </filter>
  </defs>`;
}

/** يرسم سهماً متجهياً أنيقاً مع نقطة مبدأ ورمز القوة. */
function renderVectorArrow(
  ox: number,
  oy: number,
  dx: number,
  dy: number,
  length: number,
  color: string,
  symbol: string,
  opts?: { labelSide?: 'left' | 'right' | 'above' | 'below'; showOriginDot?: boolean; dashed?: boolean }
): string {
  const norm = Math.hypot(dx, dy);
  if (norm === 0) return '';
  const ux = dx / norm;
  const uy = dy / norm;

  const ex = ox + ux * length;
  const ey = oy + uy * length;

  // رأس السهم
  const headLen = 12;
  const headWidth = 6;
  const px1 = ex - ux * headLen + uy * headWidth;
  const py1 = ey - uy * headLen - ux * headWidth;
  const px2 = ex - ux * headLen - uy * headWidth;
  const py2 = ey - uy * headLen + ux * headWidth;

  const dashAttr = opts?.dashed ? ' stroke-dasharray="4 3"' : '';
  let svg = `<line x1="${ox.toFixed(1)}" y1="${oy.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="${color}" stroke-width="3" stroke-linecap="round"${dashAttr}/>`;
  svg += `<polygon points="${ex.toFixed(1)},${ey.toFixed(1)} ${px1.toFixed(1)},${py1.toFixed(1)} ${px2.toFixed(1)},${py2.toFixed(1)}" fill="${color}" stroke="none"/>`;

  if (opts?.showOriginDot !== false) {
    svg += `<circle cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" r="4.5" fill="${color}" stroke="#ffffff" stroke-width="1.5"/>`;
  }

  // موقع التسمية الرمزية (مثلاً P شعاع)
  const midX = (ox + ex) / 2;
  const midY = (oy + ey) / 2;
  let lx = midX;
  let ly = midY;
  const offset = 18;

  const side = opts?.labelSide ?? (Math.abs(ux) > Math.abs(uy) ? 'above' : 'right');
  switch (side) {
    case 'left': lx -= offset; break;
    case 'right': lx += offset; break;
    case 'above': ly -= offset; break;
    case 'below': ly += offset; break;
  }

  svg += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" fill="${color}" font-size="16" font-weight="bold" text-anchor="middle" font-family="sans-serif">${esc(symbol)}</text>`;
  // سهم صغير فوق الحرف للدلالة على الشعاع
  svg += `<line x1="${(lx - 8).toFixed(1)}" y1="${(ly - 16).toFixed(1)}" x2="${(lx + 8).toFixed(1)}" y2="${(ly - 16).toFixed(1)}" stroke="${color}" stroke-width="1.6"/>`;
  svg += `<polygon points="${(lx + 8).toFixed(1)},${(ly - 16).toFixed(1)} ${(lx + 4).toFixed(1)},${(ly - 19).toFixed(1)} ${(lx + 4).toFixed(1)},${(ly - 13).toFixed(1)}" fill="${color}"/>`;

  return svg;
}

/** يرسم حامل مخبري شاقولي 2.5D متين مع قاعدة ومشبك. */
function renderLabStand(x: number, y: number, height: number, armLength: number, palette: Palette): string {
  const baseW = 120;
  const baseH = 18;
  const rodW = 10;

  // ظل القاعدة
  let svg = `<ellipse cx="${x}" cy="${y + baseH / 2 + 3}" rx="${baseW / 2 + 8}" ry="8" fill="rgba(0,0,0,0.3)"/>`;
  // قاعدة الحامل المتينة
  svg += `<rect x="${x - baseW / 2}" y="${y - baseH / 2}" width="${baseW}" height="${baseH}" rx="4" fill="${palette.standBase}" stroke="#475569" stroke-width="1.5"/>`;
  svg += `<rect x="${x - baseW / 2 + 4}" y="${y - baseH / 2 + 2}" width="${baseW - 8}" height="3" fill="rgba(255,255,255,0.2)"/>`;

  // ساق الحامل الشاقولية
  svg += `<rect x="${x - rodW / 2}" y="${y - height}" width="${rodW}" height="${height}" rx="2" fill="url(#mech-metal-rod)" stroke="#334155" stroke-width="1"/>`;

  // مشبك التثبيت المعدني العلوي
  const clampY = y - height + 30;
  svg += `<rect x="${x - 12}" y="${clampY - 8}" width="24" height="16" rx="3" fill="#64748b" stroke="#1e293b" stroke-width="1.2"/>`;
  svg += `<circle cx="${x}" cy="${clampY}" r="3" fill="#0f172a"/>`;

  // الذراع الأفقية الممتدة
  svg += `<rect x="${x}" y="${clampY - 4}" width="${armLength}" height="8" rx="2" fill="url(#mech-metal-rod)" stroke="#334155" stroke-width="1"/>`;
  // حلقة التعليق في طرف الذراع
  const hookX = x + armLength;
  svg += `<circle cx="${hookX}" cy="${clampY}" r="4" fill="none" stroke="#64748b" stroke-width="2"/>`;

  return svg;
}

/** يرسم ربيعة (دينامومتر) أسطوانية 2.5D دقيقة مع نابض داخلي ومؤشر وتدريجات. */
function renderDynamometer(
  x: number,
  y: number,
  length: number,
  value: number,
  maxCap: number,
  palette: Palette,
  opts?: { showSpring?: boolean }
): string {
  const r = 14;
  const innerH = length - 30;

  let svg = `<g filter="url(#mech-shadow)">`;
  // حلقة التعليق العلوية
  svg += `<circle cx="${x}" cy="${y - 8}" r="7" fill="none" stroke="${palette.metalLight}" stroke-width="2.5"/>`;
  // رأس الغلاف العلوي
  svg += `<rect x="${x - r}" y="${y}" width="${r * 2}" height="10" rx="3" fill="#475569" stroke="#334155" stroke-width="1.2"/>`;

  // الغلاف الشفاف للربيعة
  svg += `<rect x="${x - r}" y="${y + 10}" width="${r * 2}" height="${innerH}" rx="4" fill="${palette.glassFill}" stroke="${palette.glassStroke}" stroke-width="1.8"/>`;
  // خط لمعان زجاجي شاقولي
  svg += `<line x1="${x - r + 4}" y1="${y + 14}" x2="${x - r + 4}" y2="${y + innerH + 6}" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round"/>`;

  // النابض الحلزوني الداخلي 2.5D
  const clampedVal = Math.min(Math.max(value, 0), maxCap);
  const stretchRatio = clampedVal / maxCap;
  const springBaseY = y + 15;
  const pointerY = springBaseY + 20 + stretchRatio * (innerH - 45);

  if (opts?.showSpring !== false) {
    const coils = 8;
    const coilStep = (pointerY - springBaseY) / coils;
    let path = `M ${x} ${springBaseY}`;
    for (let i = 0; i < coils; i++) {
      const cy1 = springBaseY + i * coilStep + coilStep * 0.25;
      const cy2 = springBaseY + i * coilStep + coilStep * 0.75;
      path += ` C ${x + 8} ${cy1}, ${x - 8} ${cy2}, ${x} ${springBaseY + (i + 1) * coilStep}`;
    }
    svg += `<path d="${path}" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>`;
  }

  // سلم التدريجات على جانب الربيعة (بالنيوتن N)
  const scaleX = x + r - 3;
  const numSteps = 5;
  for (let i = 0; i <= numSteps; i++) {
    const markY = springBaseY + 20 + (i / numSteps) * (innerH - 45);
    const isMajor = i % 2 === 0;
    const markLen = isMajor ? 6 : 3;
    svg += `<line x1="${scaleX - markLen}" y1="${markY}" x2="${scaleX}" y2="${markY}" stroke="${palette.textSecondary}" stroke-width="1"/>`;
    if (isMajor) {
      const labelVal = ((i / numSteps) * maxCap).toFixed(0);
      svg += `<text x="${scaleX - markLen - 2}" y="${markY + 3}" fill="${palette.textSecondary}" font-size="8" text-anchor="end" font-family="sans-serif">${labelVal}</text>`;
    }
  }

  // المؤشر الأفقي الأحمر المشدود
  svg += `<line x1="${x - r + 3}" y1="${pointerY}" x2="${x + r - 3}" y2="${pointerY}" stroke="#ef4444" stroke-width="2.5"/>`;
  svg += `<polygon points="${x + r - 1},${pointerY} ${x + r - 5},${pointerY - 3} ${x + r - 5},${pointerY + 3}" fill="#ef4444"/>`;

  // الساق السفلية الممتدة من النابض
  const stemBottomY = y + innerH + 15;
  svg += `<line x1="${x}" y1="${pointerY}" x2="${x}" y2="${stemBottomY}" stroke="url(#mech-metal-rod)" stroke-width="2.5"/>`;

  // خطاف التعليق السفلي (Hook)
  svg += `<path d="M ${x} ${stemBottomY} v 10 c 0 7, 10 7, 10 0 c 0 -4, -4 -6, -7 -6" fill="none" stroke="${palette.metalLight}" stroke-width="2.5" stroke-linecap="round"/>`;

  // قيمة القوة المقاسة في علامة عصرية
  svg += `<g transform="translate(${x - 45}, ${pointerY - 9})">
    <rect width="36" height="18" rx="4" fill="${palette.cardBg}" stroke="${palette.tensionColor}" stroke-width="1"/>
    <text x="18" y="13" fill="${palette.tensionColor}" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">${clampedVal}N</text>
  </g>`;

  svg += `</g>`;
  return svg;
}

/** بطاقة عرض الشرح والتأشيرات الموحدة. */
function renderCallouts(items: CalloutItem[], mode: LabelsMode, palette: Palette): string {
  if (mode === 'none') return '';
  let svg = '';

  for (const item of items) {
    const [tx, ty] = item.target;
    const [cx, cy] = item.card;

    if (mode === 'numbered') {
      // شارة ترقيم دائرية
      svg += `
      <g filter="url(#mech-shadow)">
        <line x1="${cx}" y1="${cy}" x2="${tx}" y2="${ty}" stroke="${palette.badgeBg}" stroke-width="1.5" stroke-dasharray="3 3"/>
        <circle cx="${cx}" cy="${cy}" r="13" fill="${palette.badgeBg}" stroke="#ffffff" stroke-width="1.8"/>
        <text x="${cx}" y="${cy + 5}" fill="${palette.badgeText}" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif">${item.num}</text>
        <circle cx="${tx}" cy="${ty}" r="3" fill="${palette.badgeBg}"/>
      </g>`;
    } else {
      // بطاقة شرح كاملة (العربية + الأجنبية)
      const isLeft = cx < tx;
      const cardW = 160;
      const cardH = 36;
      const rx = isLeft ? cx - cardW : cx;
      const ry = cy - cardH / 2;

      svg += `
      <g filter="url(#mech-shadow)">
        <path d="M ${tx} ${ty} L ${isLeft ? cx : cx} ${cy}" stroke="${palette.cardBorder}" stroke-width="1.4" stroke-dasharray="3 2" fill="none"/>
        <circle cx="${tx}" cy="${ty}" r="3.5" fill="${palette.tensionColor}"/>
        <rect x="${rx}" y="${ry}" width="${cardW}" height="${cardH}" rx="6" fill="${palette.cardBg}" stroke="${palette.cardBorder}" stroke-width="1.2"/>
        <rect x="${isLeft ? rx + cardW - 4 : rx}" y="${ry}" width="4" height="${cardH}" fill="${palette.tensionColor}" rx="2"/>
        <text x="${rx + cardW / 2}" y="${ry + 15}" fill="${palette.textPrimary}" font-size="11.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">${esc(item.ar)}</text>
        <text x="${rx + cardW / 2}" y="${ry + 29}" fill="${palette.textSecondary}" font-size="9" text-anchor="middle" font-family="sans-serif">${esc(item.sub)}</text>
      </g>`;
    }
  }

  return svg;
}

// ============================================================
// 1. توازن جسم صلب خاضع لقوتين (two_forces_equilibrium)
// ============================================================
function renderTwoForces(spec: TwoForcesEquilibriumSpec, palette: Palette): string {
  let content = '';
  const force = spec.forceValue ?? 3;
  const shape = spec.bodyShape ?? 'cylinder';
  const type = spec.setupType ?? 'suspended_dynamometer';

  const apparatusX = 360;
  const apparatusY = 460;
  const standH = 390;
  const armLen = 130;
  const suspendX = apparatusX + armLen;

  // 1. رسم الحامل أو الطاولة
  if (type === 'table_surface') {
    // طاولة مخبرية 2.5D
    const tblY = 360;
    content += `<ellipse cx="480" cy="410" rx="380" ry="16" fill="rgba(0,0,0,0.35)"/>`;
    content += `<polygon points="160,${tblY} 800,${tblY} 760,${tblY + 30} 120,${tblY + 30}" fill="#334155" stroke="#475569" stroke-width="1.5"/>`;
    content += `<rect x="180" y="${tblY + 30}" width="18" height="90" fill="#1e293b"/>`;
    content += `<rect x="740" y="${tblY + 30}" width="18" height="90" fill="#1e293b"/>`;
  } else {
    // حامل فيزيائي شاقولي
    content += renderLabStand(apparatusX, apparatusY, standH, armLen, palette);
  }

  // 2. أداة القياس أو التعليق
  let bodyTopY = 280;
  let bodyH = 70;
  let bodyW = 60;

  if (type === 'suspended_dynamometer') {
    content += renderDynamometer(suspendX, apparatusY - standH + 30, 160, force, 5, palette);
    bodyTopY = apparatusY - standH + 30 + 175;
  } else if (type === 'suspended_thread') {
    const hookY = apparatusY - standH + 30;
    bodyTopY = 270;
    content += `<line x1="${suspendX}" y1="${hookY}" x2="${suspendX}" y2="${bodyTopY}" stroke="#e2e8f0" stroke-width="2"/>`;
    content += `<circle cx="${suspendX}" cy="${bodyTopY}" r="3" fill="#38bdf8"/>`;
  } else {
    // على طاولة
    bodyTopY = 290;
  }

  const Gx = suspendX;
  const Gy = bodyTopY + bodyH / 2;
  const Ax = suspendX;
  const Ay = type === 'table_surface' ? bodyTopY + bodyH : bodyTopY;

  // 3. رسم الجسم الصلب (S)
  if (shape === 'box') {
    // مكعب خشبي / صلب 2.5D
    const bw = 64;
    const bh = 54;
    content += `
    <g filter="url(#mech-shadow)">
      <rect x="${Gx - bw / 2}" y="${bodyTopY}" width="${bw}" height="${bh}" rx="4" fill="#d97706" stroke="#b45309" stroke-width="1.5"/>
      <rect x="${Gx - bw / 2 + 4}" y="${bodyTopY + 4}" width="${bw - 8}" height="${bh - 8}" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1"/>
      <text x="${Gx}" y="${Gy + 5}" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle" font-family="sans-serif">(S)</text>
    </g>`;
  } else if (shape === 'sphere') {
    content += `
    <g filter="url(#mech-shadow)">
      <circle cx="${Gx}" cy="${Gy}" r="${bodyH / 2}" fill="url(#mech-sphere-grad)" stroke="#334155" stroke-width="1.5"/>
      <text x="${Gx}" y="${Gy + 5}" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle" font-family="sans-serif">(S)</text>
    </g>`;
  } else {
    // أسطوانة معدنية 2.5D
    const cr = 28;
    content += `
    <g filter="url(#mech-shadow)">
      <ellipse cx="${Gx}" cy="${bodyTopY + bodyH}" rx="${cr}" ry="10" fill="#334155"/>
      <rect x="${Gx - cr}" y="${bodyTopY}" width="${cr * 2}" height="${bodyH}" fill="url(#mech-cylinder-grad)"/>
      <ellipse cx="${Gx}" cy="${bodyTopY}" rx="${cr}" ry="10" fill="#94a3b8" stroke="#cbd5e1" stroke-width="1.2"/>
      <text x="${Gx}" y="${Gy + 5}" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle" font-family="sans-serif">(S)</text>
    </g>`;
  }

  // 4. رسم متجهات القوى وشروط التوازن
  if (spec.showVectors) {
    const arrowLen = Math.min(Math.max(force * 25, 50), 100);

    // خط الشاقول المنقط (حامل القوتين المشترك)
    content += `<line x1="${Gx}" y1="${Gy - arrowLen - 25}" x2="${Gx}" y2="${Gy + arrowLen + 25}" stroke="rgba(255,255,255,0.3)" stroke-width="1.2" stroke-dasharray="4 3"/>`;

    // 1. قوة الثقل P (المبدأ G نحو الأسفل)
    content += renderVectorArrow(Gx, Gy, 0, 1, arrowLen, palette.weightColor, 'P', { labelSide: 'right' });

    // 2. قوة التوتر T أو رد الفعل R (المبدأ A نحو الأعلى)
    const upperLabel = type === 'table_surface' ? 'R' : 'T';
    const upperColor = type === 'table_surface' ? palette.reactionColor : palette.tensionColor;
    content += renderVectorArrow(Ax, Ay, 0, -1, arrowLen, upperColor, upperLabel, { labelSide: 'right' });
  }

  // 5. بطاقة شرط التوازن BEM على اليمين
  if (spec.showEquilibriumEquation) {
    const cardX = 670;
    const cardY = 120;
    const cardW = 250;
    const cardH = 240;
    const secLabel = type === 'table_surface' ? 'R' : 'T';

    content += `
    <g filter="url(#mech-shadow)">
      <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="10" fill="${palette.cardBg}" stroke="${palette.cardBorder}" stroke-width="1.5"/>
      <rect x="${cardX}" y="${cardY}" width="${cardW}" height="32" rx="10" fill="${palette.tensionColor}" opacity="0.9"/>
      <text x="${cardX + cardW / 2}" y="${cardY + 21}" fill="#ffffff" font-size="13.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">شرطا توازن جسم صلب (خاضع لقوتين)</text>

      <text x="${cardX + cardW - 15}" y="${cardY + 60}" fill="${palette.textPrimary}" font-size="12" font-weight="bold" text-anchor="end" font-family="sans-serif">1. للقوتين نفس المنحى (الشاقول).</text>
      <text x="${cardX + cardW - 15}" y="${cardY + 85}" fill="${palette.textPrimary}" font-size="12" font-weight="bold" text-anchor="end" font-family="sans-serif">2. للقوتين جهتان متعاكستان.</text>
      <text x="${cardX + cardW - 15}" y="${cardY + 110}" fill="${palette.textPrimary}" font-size="12" font-weight="bold" text-anchor="end" font-family="sans-serif">3. للقوتين نفس الشدة:</text>
      <text x="${cardX + cardW / 2}" y="${cardY + 138}" fill="${palette.tensionColor}" font-size="14" font-weight="bold" text-anchor="middle" font-family="sans-serif">P = ${secLabel} = ${force} N</text>

      <line x1="${cardX + 20}" y1="${cardY + 155}" x2="${cardX + cardW - 20}" y2="${cardY + 155}" stroke="${palette.cardBorder}" stroke-width="1"/>

      <text x="${cardX + cardW - 15}" y="${cardY + 180}" fill="${palette.textSecondary}" font-size="11" font-weight="bold" text-anchor="end" font-family="sans-serif">المجموع الشعاعي للقوتين معدوم:</text>
      <text x="${cardX + cardW / 2}" y="${cardY + 212}" fill="${palette.textPrimary}" font-size="17" font-weight="bold" text-anchor="middle" font-family="sans-serif">P&#x20D7; + ${secLabel}&#x20D7; = 0&#x20D7;</text>
    </g>`;
  }

  // 6. التأشيرات
  const labels: CalloutItem[] = [
    { num: 1, ar: 'حامل فيزيائي متين 2.5D', sub: 'Laboratory Stand', target: [apparatusX, apparatusY - standH / 2], card: [150, 160] },
    { num: 2, ar: type === 'table_surface' ? 'سطح الطاولة الأفقي' : 'ربيعة القياس (دينامومتر)', sub: type === 'table_surface' ? 'Table Surface' : 'Dynamometer', target: [suspendX, apparatusY - standH + 100], card: [suspendX - 110, 110] },
    { num: 3, ar: 'نقطة التعليق والتأثير (A)', sub: 'Point of Application (A)', target: [Ax, Ay], card: [suspendX - 130, Ay] },
    { num: 4, ar: 'مركز ثقل الجسم الصلب (G)', sub: 'Center of Gravity (G)', target: [Gx, Gy], card: [suspendX - 130, Gy + 20] },
    { num: 5, ar: 'شعاع قوة الثقل (P)', sub: 'Weight Force Vector', target: [Gx, Gy + 40], card: [suspendX - 130, Gy + 70] },
    { num: 6, ar: type === 'table_surface' ? 'شعاع رد فعل السطح (R)' : 'شعاع قوة توتر النابض (T)', sub: type === 'table_surface' ? 'Reaction Force' : 'Tension Force', target: [Ax, Ay - 40], card: [suspendX - 130, Ay - 45] },
  ];

  content += renderCallouts(labels, spec.labelsMode ?? 'full', palette);
  return content;
}

// ============================================================
// 2. توازن جسم صلب خاضع لـ 3 قوى غير متوازية (three_forces_equilibrium)
// ============================================================
function renderThreeForces(spec: ThreeForcesEquilibriumSpec, palette: Palette): string {
  let content = '';
  const f1 = spec.f1 ?? 3;
  const f2 = spec.f2 ?? 4;
  const f3 = spec.f3 ?? 5;
  const a1Deg = spec.angle1 ?? 40;
  const a2Deg = spec.angle2 ?? 140;

  const Ox = 360;
  const Oy = 260;

  // خلفية لوحة التجارب المغناطيسية البيضاء
  const boardX = 80;
  const boardY = 60;
  const boardW = 540;
  const boardH = 410;
  content += `
  <g filter="url(#mech-shadow)">
    <rect x="${boardX}" y="${boardY}" width="${boardW}" height="${boardH}" rx="12" fill="rgba(255,255,255,0.04)" stroke="${palette.glassStroke}" stroke-width="1.8"/>
    <rect x="${boardX + 10}" y="${boardY + 10}" width="${boardW - 20}" height="${boardH - 20}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-dasharray="20 20"/>
  </g>`;

  // الحلقة الدائرية الخفيفة في المركز O (مهملة الكتلة)
  const ringR = 12;
  content += `
  <g filter="url(#mech-glow)">
    <circle cx="${Ox}" cy="${Oy}" r="${ringR}" fill="none" stroke="#e2e8f0" stroke-width="3"/>
    <circle cx="${Ox}" cy="${Oy}" r="3" fill="#ef4444"/>
    <text x="${Ox}" y="${Oy - 16}" fill="#f8fafc" font-size="13" font-weight="bold" text-anchor="middle" font-family="sans-serif">O</text>
  </g>`;

  // حساب زوايا القوى بالراديان
  const rad1 = (a1Deg * Math.PI) / 180;
  const rad2 = (a2Deg * Math.PI) / 180;

  // ربيعتان جانبيتان D1 و D2
  const d1Dist = 170;
  const d2Dist = 170;
  const d1X = Ox + Math.cos(rad1) * d1Dist;
  const d1Y = Oy - Math.sin(rad1) * d1Dist;
  const d2X = Ox + Math.cos(rad2) * d2Dist;
  const d2Y = Oy - Math.sin(rad2) * d2Dist;

  // خيوط التوصيل بين الحلقة والربيعتين
  content += `<line x1="${Ox}" y1="${Oy}" x2="${d1X}" y2="${d1Y}" stroke="#94a3b8" stroke-width="2"/>`;
  content += `<line x1="${Ox}" y1="${Oy}" x2="${d2X}" y2="${d2Y}" stroke="#94a3b8" stroke-width="2"/>`;

  // الربيعة 1 (D1) مائلة
  content += `
  <g transform="translate(${d1X}, ${d1Y}) rotate(${-(a1Deg - 90)})">
    <rect x="-10" y="-30" width="20" height="60" rx="4" fill="${palette.cardBg}" stroke="${palette.reactionColor}" stroke-width="1.5"/>
    <circle cx="0" cy="-35" r="5" fill="none" stroke="${palette.reactionColor}" stroke-width="2"/>
    <line x1="-6" y1="0" x2="6" y2="0" stroke="#ef4444" stroke-width="2"/>
    <text x="0" y="3" fill="${palette.reactionColor}" font-size="9" font-weight="bold" text-anchor="middle" transform="rotate(90)">${f1}N</text>
    <text x="18" y="0" fill="${palette.textPrimary}" font-size="11" font-weight="bold">(D&#x2081;)</text>
  </g>`;

  // الربيعة 2 (D2) مائلة
  content += `
  <g transform="translate(${d2X}, ${d2Y}) rotate(${-(a2Deg - 90)})">
    <rect x="-10" y="-30" width="20" height="60" rx="4" fill="${palette.cardBg}" stroke="${palette.tensionColor}" stroke-width="1.5"/>
    <circle cx="0" cy="-35" r="5" fill="none" stroke="${palette.tensionColor}" stroke-width="2"/>
    <line x1="-6" y1="0" x2="6" y2="0" stroke="#ef4444" stroke-width="2"/>
    <text x="0" y="3" fill="${palette.tensionColor}" font-size="9" font-weight="bold" text-anchor="middle" transform="rotate(-90)">${f2}N</text>
    <text x="-22" y="0" fill="${palette.textPrimary}" font-size="11" font-weight="bold">(D&#x2082;)</text>
  </g>`;

  // القوة الثالثة (F3) موجهة نحو الأسفل مع كتلة معلقة
  const massDist = 130;
  const massY = Oy + massDist;
  content += `<line x1="${Ox}" y1="${Oy}" x2="${Ox}" y2="${massY}" stroke="#94a3b8" stroke-width="2"/>`;
  content += `
  <g filter="url(#mech-shadow)">
    <rect x="${Ox - 22}" y="${massY}" width="44" height="40" rx="4" fill="url(#mech-gold-weight)" stroke="#78350f" stroke-width="1.5"/>
    <text x="${Ox}" y="${massY + 24}" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">${f3}N</text>
    <text x="${Ox + 35}" y="${massY + 25}" fill="${palette.textPrimary}" font-size="11" font-weight="bold">(D&#x2083; / S)</text>
  </g>`;

  // خطوط التأثير (الحوامل) المتقاطعة في O
  if (spec.showLinesOfAction) {
    const ext = 190;
    content += `<line x1="${Ox - Math.cos(rad1) * 60}" y1="${Oy + Math.sin(rad1) * 60}" x2="${Ox + Math.cos(rad1) * ext}" y2="${Oy - Math.sin(rad1) * ext}" stroke="${palette.reactionColor}" stroke-width="1" stroke-dasharray="4 3" opacity="0.6"/>`;
    content += `<line x1="${Ox - Math.cos(rad2) * 60}" y1="${Oy + Math.sin(rad2) * 60}" x2="${Ox + Math.cos(rad2) * ext}" y2="${Oy - Math.sin(rad2) * ext}" stroke="${palette.tensionColor}" stroke-width="1" stroke-dasharray="4 3" opacity="0.6"/>`;
    content += `<line x1="${Ox}" y1="${Oy - 60}" x2="${Ox}" y2="${Oy + ext}" stroke="${palette.weightColor}" stroke-width="1" stroke-dasharray="4 3" opacity="0.6"/>`;
  }

  // متجهات القوى الثلاثة
  const scale = 18;
  content += renderVectorArrow(Ox, Oy, Math.cos(rad1), -Math.sin(rad1), f1 * scale, palette.reactionColor, 'F₁', { labelSide: 'above' });
  content += renderVectorArrow(Ox, Oy, Math.cos(rad2), -Math.sin(rad2), f2 * scale, palette.tensionColor, 'F₂', { labelSide: 'above' });
  content += renderVectorArrow(Ox, Oy, 0, 1, f3 * scale, palette.weightColor, 'F₃', { labelSide: 'right' });

  // مضلع القوى المغلق (مثلث القوى) على اليمين
  if (spec.showPolygon) {
    const polyCardX = 660;
    const polyCardY = 70;
    const polyCardW = 270;
    const polyCardH = 390;

    content += `
    <g filter="url(#mech-shadow)">
      <rect x="${polyCardX}" y="${polyCardY}" width="${polyCardW}" height="${polyCardH}" rx="10" fill="${palette.cardBg}" stroke="${palette.cardBorder}" stroke-width="1.5"/>
      <rect x="${polyCardX}" y="${polyCardY}" width="${polyCardW}" height="32" rx="10" fill="${palette.badgeBg}" opacity="0.9"/>
      <text x="${polyCardX + polyCardW / 2}" y="${polyCardY + 21}" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle" font-family="sans-serif">مضلع القوى المغلق (مثلث القوى)</text>
    `;

    // رسم مثلث المتجهات المتتالي المغلق
    const tx0 = polyCardX + 80;
    const ty0 = polyCardY + 220;
    const tx1 = tx0 + Math.cos(rad1) * f1 * 22;
    const ty1 = ty0 - Math.sin(rad1) * f1 * 22;
    const tx2 = tx1 + Math.cos(rad2) * f2 * 22;
    const ty2 = ty1 - Math.sin(rad2) * f2 * 22;

    // الأسهم الثلاثة المتعاقبة في حلقة مغلقة
    content += renderVectorArrow(tx0, ty0, tx1 - tx0, ty1 - ty0, Math.hypot(tx1 - tx0, ty1 - ty0), palette.reactionColor, 'F₁', { labelSide: 'above' });
    content += renderVectorArrow(tx1, ty1, tx2 - tx1, ty2 - ty1, Math.hypot(tx2 - tx1, ty2 - ty1), palette.tensionColor, 'F₂', { labelSide: 'above' });
    content += renderVectorArrow(tx2, ty2, tx0 - tx2, ty0 - ty2, Math.hypot(tx0 - tx2, ty0 - ty2), palette.weightColor, 'F₃', { labelSide: 'left' });

    // نص شروط التوازن في BEM
    content += `
      <text x="${polyCardX + polyCardW - 15}" y="${polyCardY + 270}" fill="${palette.textPrimary}" font-size="11.5" font-weight="bold" text-anchor="end" font-family="sans-serif">1. حوامل القوى مستوية ومتلاقية في (O).</text>
      <text x="${polyCardX + polyCardW - 15}" y="${polyCardY + 295}" fill="${palette.textPrimary}" font-size="11.5" font-weight="bold" text-anchor="end" font-family="sans-serif">2. المجموع الشعاعي للقوى معدوم:</text>
      <text x="${polyCardX + polyCardW / 2}" y="${polyCardY + 330}" fill="${palette.reactionColor}" font-size="15" font-weight="bold" text-anchor="middle" font-family="sans-serif">F&#x2081;&#x20D7; + F&#x2082;&#x20D7; + F&#x2083;&#x20D7; = 0&#x20D7;</text>
      <text x="${polyCardX + polyCardW / 2}" y="${polyCardY + 360}" fill="${palette.textSecondary}" font-size="10.5" text-anchor="middle" font-family="sans-serif">(يشكل مضلعاً متتالياً مغلقاً)</text>
    </g>`;
  }

  // التأشيرات
  const labels: CalloutItem[] = [
    { num: 1, ar: 'لوحة التجارب المغناطيسية', sub: 'Magnetic Whiteboard', target: [boardX + 30, boardY + 40], card: [160, 50] },
    { num: 2, ar: 'حلقة خفيفة مهملة الكتلة (O)', sub: 'Lightweight Ring (O)', target: [Ox, Oy], card: [Ox - 120, Oy - 60] },
    { num: 3, ar: 'الربيعة الأولى (D₁)', sub: 'Dynamometer 1', target: [d1X, d1Y], card: [d1X + 40, d1Y - 40] },
    { num: 4, ar: 'الربيعة الثانية (D₂)', sub: 'Dynamometer 2', target: [d2X, d2Y], card: [d2X - 50, d2Y - 40] },
    { num: 5, ar: 'الثقل المعلق / الربيعة 3', sub: 'Suspended Weight (D₃)', target: [Ox, massY + 20], card: [Ox - 120, massY + 20] },
    { num: 6, ar: 'حوامل القوى المتلاقية في O', sub: 'Concurrent Lines of Action', target: [Ox, Oy + 50], card: [Ox + 130, Oy + 50] },
  ];

  content += renderCallouts(labels, spec.labelsMode ?? 'full', palette);
  return content;
}

// ============================================================
// 3. دافعة أرخميدس في السوائل (archimedes)
// ============================================================
function renderArchimedesSetup(spec: ArchimedesSpec, palette: Palette): string {
  let content = '';
  const P = spec.realWeight ?? 4;
  const Papp = spec.apparentWeight ?? 3;
  const V = spec.displacedVolume ?? 100;
  const liquid = spec.liquidName ?? 'ماء نقي';
  const rho = spec.liquidDensity ?? 1.0;
  const Fa = Math.max(P - Papp, 0);

  // إحداثيات الوضعيتين جنباً إلى جنب
  // الوضعية 1: في الهواء (شمال / وسط يسار)
  const s1X = 220;
  const s1Y = 460;
  const s2X = 520;
  const s2Y = 460;
  const standH = 390;
  const armLen = 110;

  // 1. الحاملان الفيزيائيان
  content += renderLabStand(s1X - armLen, s1Y, standH, armLen, palette);
  content += renderLabStand(s2X - armLen, s2Y, standH, armLen, palette);

  // لافتات الوضعية
  content += `
  <g>
    <rect x="${s1X - 80}" y="45" width="160" height="26" rx="6" fill="${palette.cardBg}" stroke="${palette.cardBorder}" stroke-width="1.2"/>
    <text x="${s1X}" y="63" fill="${palette.textPrimary}" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif">الوضعية (1): في الهواء</text>

    <rect x="${s2X - 80}" y="45" width="160" height="26" rx="6" fill="${palette.cardBg}" stroke="${palette.cardBorder}" stroke-width="1.2"/>
    <text x="${s2X}" y="63" fill="${palette.textPrimary}" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif">الوضعية (2): في السائل</text>
  </g>`;

  // 2. الربيعة في الهواء (تقيس الثقل الحقيقي P)
  content += renderDynamometer(s1X, s1Y - standH + 30, 150, P, 5, palette);

  // الجسم الصلب المعلق في الهواء
  const bodyH = 65;
  const bodyW = 46;
  const s1BodyY = s1Y - standH + 30 + 175;
  const s1Gx = s1X;
  const s1Gy = s1BodyY + bodyH / 2;

  content += `
  <g filter="url(#mech-shadow)">
    <rect x="${s1Gx - bodyW / 2}" y="${s1BodyY}" width="${bodyW}" height="${bodyH}" rx="3" fill="url(#mech-cylinder-grad)" stroke="#334155" stroke-width="1.2"/>
    <text x="${s1Gx}" y="${s1Gy + 5}" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">(S)</text>
  </g>`;

  // شعاع الثقل الحقيقي في الوضعية 1
  content += renderVectorArrow(s1Gx, s1Gy, 0, 1, 60, palette.weightColor, 'P', { labelSide: 'right' });
  content += renderVectorArrow(s1Gx, s1BodyY, 0, -1, 60, palette.tensionColor, 'T', { labelSide: 'right' });

  // 3. الوضعية 2: الربيعة تقيس الثقل الظاهري Papp
  content += renderDynamometer(s2X, s2Y - standH + 30, 150, Papp, 5, palette);

  // بيشر الإزاحة الشفاف 2.5D مع فوهة سكب مائلة
  const beakerX = s2X - 60;
  const beakerY = s2Y - 180;
  const beakerW = 120;
  const beakerH = 160;

  content += `
  <g filter="url(#mech-shadow)">
    <!-- طاولة رفع البيشر -->
    <rect x="${beakerX - 10}" y="${beakerY + beakerH}" width="${beakerW + 20}" height="20" rx="3" fill="#334155" stroke="#475569" stroke-width="1"/>
    <!-- السائل داخل البيشر -->
    <rect x="${beakerX + 3}" y="${beakerY + 40}" width="${beakerW - 6}" height="${beakerH - 43}" rx="4" fill="${palette.liquidColor}"/>
    <ellipse cx="${s2X}" cy="${beakerY + 40}" rx="${beakerW / 2 - 4}" ry="8" fill="${palette.liquidTop}"/>

    <!-- جدار البيشر الشفاف -->
    <rect x="${beakerX}" y="${beakerY}" width="${beakerW}" height="${beakerH}" rx="6" fill="${palette.glassFill}" stroke="${palette.glassStroke}" stroke-width="2"/>
    <!-- فوهة السكب المائلة -->
    <path d="M ${beakerX + beakerW} ${beakerY + 45} L ${beakerX + beakerW + 28} ${beakerY + 65}" stroke="${palette.glassStroke}" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M ${beakerX + beakerW} ${beakerY + 47} L ${beakerX + beakerW + 26} ${beakerY + 65}" stroke="${palette.liquidTop}" stroke-width="2" fill="none"/>
    <!-- قطرات الماء المتدفقة -->
    <circle cx="${beakerX + beakerW + 34}" cy="${beakerY + 76}" r="2.5" fill="#38bdf8"/>
    <circle cx="${beakerX + beakerW + 36}" cy="${beakerY + 86}" r="2" fill="#38bdf8"/>
  </g>`;

  // الجسم الصلب مغمور في السائل
  const s2BodyY = beakerY + 65;
  const s2Gx = s2X;
  const s2Gy = s2BodyY + bodyH / 2;

  content += `
  <g filter="url(#mech-shadow)" opacity="0.95">
    <rect x="${s2Gx - bodyW / 2}" y="${s2BodyY}" width="${bodyW}" height="${bodyH}" rx="3" fill="url(#mech-cylinder-grad)" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="${s2Gx}" y="${s2Gy + 5}" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">(S)</text>
  </g>`;

  // أشعة القوى على الجسم المغمور:
  // 1. الثقل الحقيقي P للأسفل من مركز الثقل G
  if (spec.showWeightVector) {
    content += renderVectorArrow(s2Gx, s2Gy, 0, 1, 60, palette.weightColor, 'P', { labelSide: 'right' });
  }
  // 2. دافعة أرخميدس FA للأعلى من مركز الجزء المغمور C
  if (spec.showBuoyancyVector) {
    const C_pt_y = s2Gy;
    content += renderVectorArrow(s2Gx, C_pt_y, 0, -1, 40, palette.reactionColor, 'F_A', { labelSide: 'left' });
  }

  // 4. إناء جمع السائل المزاح (مخبار مدرج صغير)
  if (spec.showDisplacedLiquid) {
    const cylX = beakerX + beakerW + 25;
    const cylY = beakerY + 95;
    const cylW = 34;
    const cylH = 65;

    content += `
    <g filter="url(#mech-shadow)">
      <rect x="${cylX}" y="${cylY}" width="${cylW}" height="${cylH}" rx="3" fill="${palette.glassFill}" stroke="${palette.glassStroke}" stroke-width="1.5"/>
      <rect x="${cylX + 2}" y="${cylY + 25}" width="${cylW - 4}" height="${cylH - 27}" fill="${palette.liquidColor}"/>
      <text x="${cylX + cylW / 2}" y="${cylY + cylH + 15}" fill="${palette.reactionColor}" font-size="10" font-weight="bold" text-anchor="middle">V = ${V}mL</text>
      <text x="${cylX + cylW / 2}" y="${cylY + cylH + 28}" fill="${palette.textSecondary}" font-size="9" text-anchor="middle">P_L = ${Fa}N</text>
    </g>`;
  }

  // 5. لوحة القوانين والحسابات BEM على اليمين
  if (spec.showCalculations) {
    const cardX = 725;
    const cardY = 80;
    const cardW = 215;
    const cardH = 370;

    content += `
    <g filter="url(#mech-shadow)">
      <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="10" fill="${palette.cardBg}" stroke="${palette.cardBorder}" stroke-width="1.5"/>
      <rect x="${cardX}" y="${cardY}" width="${cardW}" height="32" rx="10" fill="${palette.reactionColor}" opacity="0.9"/>
      <text x="${cardX + cardW / 2}" y="${cardY + 21}" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle" font-family="sans-serif">قوانين دافعة أرخميدس (BEM)</text>

      <text x="${cardX + cardW - 12}" y="${cardY + 58}" fill="${palette.textSecondary}" font-size="11" font-weight="bold" text-anchor="end">الثقل الحقيقي في الهواء:</text>
      <text x="${cardX + 20}" y="${cardY + 78}" fill="${palette.weightColor}" font-size="14" font-weight="bold">P = ${P} N</text>

      <text x="${cardX + cardW - 12}" y="${cardY + 110}" fill="${palette.textSecondary}" font-size="11" font-weight="bold" text-anchor="end">الثقل الظاهري في السائل:</text>
      <text x="${cardX + 20}" y="${cardY + 130}" fill="${palette.tensionColor}" font-size="14" font-weight="bold">P_app = ${Papp} N</text>

      <line x1="${cardX + 15}" y1="${cardY + 148}" x2="${cardX + cardW - 15}" y2="${cardY + 148}" stroke="${palette.cardBorder}" stroke-width="1"/>

      <text x="${cardX + cardW - 12}" y="${cardY + 175}" fill="${palette.textPrimary}" font-size="12" font-weight="bold" text-anchor="end">شدة دافعة أرخميدس:</text>
      <text x="${cardX + cardW / 2}" y="${cardY + 205}" fill="${palette.reactionColor}" font-size="15" font-weight="bold" text-anchor="middle">F_A = P - P_app</text>
      <text x="${cardX + cardW / 2}" y="${cardY + 230}" fill="${palette.reactionColor}" font-size="14" font-weight="bold" text-anchor="middle">F_A = ${P} - ${Papp} = ${Fa} N</text>

      <line x1="${cardX + 15}" y1="${cardY + 248}" x2="${cardX + cardW - 15}" y2="${cardY + 248}" stroke="${palette.cardBorder}" stroke-width="1"/>

      <text x="${cardX + cardW - 12}" y="${cardY + 275}" fill="${palette.textSecondary}" font-size="11" font-weight="bold" text-anchor="end">ثقل السائل المزاح:</text>
      <text x="${cardX + cardW / 2}" y="${cardY + 300}" fill="${palette.textPrimary}" font-size="13" font-weight="bold" text-anchor="middle">F_A = P_L = &#x03C1; &#xB7; V &#xB7; g</text>
      <text x="${cardX + cardW / 2}" y="${cardY + 325}" fill="${palette.textSecondary}" font-size="11" text-anchor="middle">السائل: ${esc(liquid)}</text>
      <text x="${cardX + cardW / 2}" y="${cardY + 348}" fill="${palette.textSecondary}" font-size="10" text-anchor="middle">&#x03C1; = ${rho} g/cm&#xB3;</text>
    </g>`;
  }

  // التأشيرات
  const labels: CalloutItem[] = [
    { num: 1, ar: 'الثقل الحقيقي في الهواء (P)', sub: 'Real Weight in Air', target: [s1X - 30, s1Y - standH + 110], card: [90, 110] },
    { num: 2, ar: 'الثقل الظاهري في السائل (Papp)', sub: 'Apparent Weight', target: [s2X - 30, s2Y - standH + 110], card: [390, 110] },
    { num: 3, ar: 'بيشر الإزاحة ذو الفوهة', sub: 'Overflow Beaker', target: [beakerX, beakerY + 30], card: [390, beakerY + 30] },
    { num: 4, ar: 'السائل المزاح في المخبار (VL)', sub: 'Displaced Liquid', target: [beakerX + beakerW + 40, beakerY + 120], card: [beakerX + beakerW + 80, beakerY + 120] },
    { num: 5, ar: 'شعاع ثقل الجسم (P)', sub: 'Weight Vector', target: [s2Gx, s2Gy + 30], card: [s2Gx - 120, s2Gy + 40] },
    { num: 6, ar: 'شعاع دافعة أرخميدس (FA)', sub: 'Archimedes Buoyancy Force', target: [s2Gx, s2Gy - 20], card: [s2Gx - 120, s2Gy - 30] },
  ];

  content += renderCallouts(labels, spec.labelsMode ?? 'full', palette);
  return content;
}

// ============================================================
// 4. الربيعة، الثقل والكتلة (dynamometer_weight)
// ============================================================
function renderDynamometerWeightSetup(spec: DynamometerWeightSpec, palette: Palette): string {
  let content = '';
  const massG = spec.mass ?? 200;
  const g = spec.gravity ?? 10;
  const P = spec.measuredForce ?? (massG / 1000) * g;
  const maxCap = spec.maxCapacity ?? 5;

  const dynX = 300;
  const dynY = 80;
  const dynLen = 250;

  // ربيعة مخبرية مكبرة ومفصلة
  content += renderDynamometer(dynX, dynY, dynLen, P, maxCap, palette, { showSpring: spec.showSpringDetails });

  // كتلة عيارية معلقة أسفل الربيعة
  const massY = dynY + dynLen + 15;
  const massW = 70;
  const massH = 65;
  const massGx = dynX;
  const massGy = massY + massH / 2;

  content += `
  <g filter="url(#mech-shadow)">
    <!-- مقبض الكتلة العيارية -->
    <circle cx="${dynX}" cy="${massY - 4}" r="6" fill="none" stroke="#b45309" stroke-width="3"/>
    <!-- جسم الكتلة العيارية النحاسية المصقولة -->
    <rect x="${dynX - massW / 2}" y="${massY}" width="${massW}" height="${massH}" rx="6" fill="url(#mech-gold-weight)" stroke="#78350f" stroke-width="1.8"/>
    <rect x="${dynX - massW / 2 + 5}" y="${massY + 5}" width="${massW - 10}" height="4" fill="rgba(255,255,255,0.3)"/>
    <!-- وسم الكتلة بالجرام -->
    <text x="${dynX}" y="${massGy + 5}" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle" font-family="sans-serif">${massG}g</text>
  </g>`;

  // شعاع الثقل P المنطلق من مركز الثقل G نحو الأسفل
  content += renderVectorArrow(massGx, massGy, 0, 1, 80, palette.weightColor, 'P', { labelSide: 'right' });

  // بطاقة خصائص شعاع الثقل وجدول المقارنة على اليمين
  if (spec.showCharacteristics) {
    const cardX = 520;
    const cardY = 70;
    const cardW = 390;
    const cardH = 390;

    content += `
    <g filter="url(#mech-shadow)">
      <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="10" fill="${palette.cardBg}" stroke="${palette.cardBorder}" stroke-width="1.5"/>
      <rect x="${cardX}" y="${cardY}" width="${cardW}" height="32" rx="10" fill="${palette.weightColor}" opacity="0.9"/>
      <text x="${cardX + cardW / 2}" y="${cardY + 21}" fill="#ffffff" font-size="13.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">الخصائص الأربعة لشعاع الثقل (P&#x20D7;) والعلاقة P = m &#xB7; g</text>

      <!-- الخصائص الأربعة -->
      <g transform="translate(${cardX + 15}, ${cardY + 45})">
        <text x="${cardW - 30}" y="18" fill="${palette.textPrimary}" font-size="12" font-weight="bold" text-anchor="end">1. المبدأ (نقطة التأثير):</text>
        <text x="${cardW - 40}" y="36" fill="${palette.reactionColor}" font-size="11.5" text-anchor="end">مركز ثقل الجسم الصلب (G)</text>

        <text x="${cardW - 30}" y="62" fill="${palette.textPrimary}" font-size="12" font-weight="bold" text-anchor="end">2. المنحى (الحامل):</text>
        <text x="${cardW - 40}" y="80" fill="${palette.reactionColor}" font-size="11.5" text-anchor="end">المستقيم الشاقولي المار من G</text>

        <text x="${cardW - 30}" y="106" fill="${palette.textPrimary}" font-size="12" font-weight="bold" text-anchor="end">3. الاتجاه (الجهة):</text>
        <text x="${cardW - 40}" y="124" fill="${palette.reactionColor}" font-size="11.5" text-anchor="end">شاقولياً نحو الأسفل (مركز الأرض)</text>

        <text x="${cardW - 30}" y="150" fill="${palette.textPrimary}" font-size="12" font-weight="bold" text-anchor="end">4. الشدة (المقدار):</text>
        <text x="${cardW - 40}" y="168" fill="${palette.reactionColor}" font-size="11.5" font-weight="bold" text-anchor="end">P = ${P} N (تقاس بالربيعة)</text>
      </g>

      <line x1="${cardX + 15}" y1="${cardY + 235}" x2="${cardX + cardW - 15}" y2="${cardY + 235}" stroke="${palette.cardBorder}" stroke-width="1"/>

      <!-- جدول المقارنة بين الكتلة والثقل -->
      <g transform="translate(${cardX + 15}, ${cardY + 245})">
        <text x="${cardW / 2}" y="15" fill="${palette.textPrimary}" font-size="12" font-weight="bold" text-anchor="middle">المقارنة الجوهرية (مقررة في BEM)</text>

        <!-- جدول صغير -->
        <rect x="0" y="25" width="${cardW - 30}" height="85" rx="5" fill="rgba(255,255,255,0.03)" stroke="${palette.cardBorder}"/>
        <line x1="${(cardW - 30) / 2}" y1="25" x2="${(cardW - 30) / 2}" y2="110" stroke="${palette.cardBorder}"/>
        <line x1="0" y1="48" x2="${cardW - 30}" y2="48" stroke="${palette.cardBorder}"/>

        <text x="${(cardW - 30) * 0.75}" y="41" fill="${palette.tensionColor}" font-size="11" font-weight="bold" text-anchor="middle">الكتلة (m)</text>
        <text x="${(cardW - 30) * 0.25}" y="41" fill="${palette.weightColor}" font-size="11" font-weight="bold" text-anchor="middle">الثقل (P)</text>

        <text x="${(cardW - 30) * 0.75}" y="67" fill="${palette.textSecondary}" font-size="10" text-anchor="middle">كمية المادة (ثابتة)</text>
        <text x="${(cardW - 30) * 0.25}" y="67" fill="${palette.textSecondary}" font-size="10" text-anchor="middle">قوة جذب الأرض (متغيرة)</text>

        <text x="${(cardW - 30) * 0.75}" y="92" fill="${palette.textSecondary}" font-size="10" text-anchor="middle">الميزان (kg)</text>
        <text x="${(cardW - 30) * 0.25}" y="92" fill="${palette.textSecondary}" font-size="10" text-anchor="middle">الربيعة (N)</text>
      </g>
    </g>`;
  }

  // التأشيرات
  const labels: CalloutItem[] = [
    { num: 1, ar: 'حلقة التعليق العلوية', sub: 'Hanging Ring', target: [dynX, dynY - 8], card: [120, dynY - 8] },
    { num: 2, ar: 'النابض الحلزوني المرن', sub: 'Helical Spring', target: [dynX, dynY + 80], card: [120, dynY + 80] },
    { num: 3, ar: 'سلم التدريجات بوحدة النيوتن', sub: 'Graduated Scale (N)', target: [dynX + 12, dynY + 120], card: [dynX + 110, dynY + 120] },
    { num: 4, ar: 'المؤشر الأفقي للقياس', sub: 'Measurement Pointer', target: [dynX - 10, dynY + 160], card: [120, dynY + 160] },
    { num: 5, ar: 'الكتلة العيارية المعلقة (m)', sub: 'Calibrated Mass (m)', target: [dynX, massGy], card: [120, massGy] },
    { num: 6, ar: 'مركز الثقل (G)', sub: 'Center of Gravity (G)', target: [massGx, massGy], card: [dynX + 90, massGy] },
    { num: 7, ar: 'شعاع قوة الثقل (P)', sub: 'Weight Vector', target: [massGx, massGy + 50], card: [120, massGy + 60] },
  ];

  content += renderCallouts(labels, spec.labelsMode ?? 'full', palette);
  return content;
}

// ============================================================
// 5. حركة واحتكاك على مستوٍ مائل (inclined_plane_motion)
// ============================================================
function renderInclinedPlaneSetup(spec: InclinedPlaneMotionSpec, palette: Palette): string {
  let content = '';
  const angleDeg = spec.angle ?? 30;
  const P = spec.weight ?? 10;
  const motion = spec.motionDirection ?? 'down';

  const rad = (angleDeg * Math.PI) / 180;
  const originX = 140;
  const originY = 410;
  const planeLen = 480;

  // إحداثيات قمة المستوى المائل
  const topX = originX + Math.cos(rad) * planeLen;
  const topY = originY - Math.sin(rad) * planeLen;

  // 1. رسم الإسفين المائل 2.5D
  content += `
  <g filter="url(#mech-shadow)">
    <!-- الأرضية الأفقية -->
    <line x1="${originX - 40}" y1="${originY}" x2="${topX + 50}" y2="${originY}" stroke="${palette.standRod}" stroke-width="2"/>
    <line x1="${originX - 40}" y1="${originY + 2}" x2="${topX + 50}" y2="${originY + 2}" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>

    <!-- مثلث المستوى المائل المصقول -->
    <polygon points="${originX},${originY} ${topX},${topY} ${topX},${originY}" fill="${palette.cardBg}" stroke="${palette.cardBorder}" stroke-width="2"/>
    <!-- الوجه المائل المصقول -->
    <line x1="${originX}" y1="${originY}" x2="${topX}" y2="${topY}" stroke="#38bdf8" stroke-width="3.5" stroke-linecap="round"/>

    <!-- قوس زاوية الميلان alpha -->
    <path d="M ${originX + 50} ${originY} A 50 50 0 0 0 ${originX + 50 * Math.cos(rad)} ${originY - 50 * Math.sin(rad)}" fill="none" stroke="${palette.frictionColor}" stroke-width="2"/>
    <text x="${originX + 65}" y="${originY - 14}" fill="${palette.frictionColor}" font-size="13" font-weight="bold" font-family="sans-serif">&#x03B1; = ${angleDeg}&#xB0;</text>
  </g>`;

  // 2. الجسم الصلب على السطح المائل
  const blockFrac = 0.52;
  const blockCx = originX + (topX - originX) * blockFrac;
  const blockCy = originY + (topY - originY) * blockFrac;
  const blockW = 60;
  const blockH = 40;

  content += `
  <g transform="translate(${blockCx}, ${blockCy}) rotate(${-angleDeg})">
    <!-- ظل الجسم على السطح -->
    <rect x="${-blockW / 2}" y="${-blockH}" width="${blockW}" height="${blockH}" rx="4" fill="#d97706" stroke="#b45309" stroke-width="1.8" filter="url(#mech-shadow)"/>
    <text x="0" y="${-blockH / 2 + 5}" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle" font-family="sans-serif">(S)</text>
  </g>`;

  // مركز ثقل الجسم G (بالإحداثيات العامة)
  const normX = -Math.sin(rad);
  const normY = -Math.cos(rad);
  const Gx = blockCx + normX * (blockH / 2);
  const Gy = blockCy + normY * (blockH / 2);

  // نقطة التماس A
  const Ax = blockCx;
  const Ay = blockCy;

  // 3. متجهات القوى وتفكيك الثقل
  const pScale = 8;
  const pLen = Math.min(Math.max(P * pScale, 60), 100);

  // 1. الثقل الشاقولي P (نحو الأسفل عمودياً على الأرضية)
  content += renderVectorArrow(Gx, Gy, 0, 1, pLen, palette.weightColor, 'P', { labelSide: 'right' });

  // 2. مركبتي الثقل Px و Py
  if (spec.showComponents) {
    const Px_len = pLen * Math.sin(rad);
    const Py_len = pLen * Math.cos(rad);

    // Py عمودي على المستوى للأسفل (-Norm)
    const pyDirX = -normX;
    const pyDirY = -normY;
    content += renderVectorArrow(Gx, Gy, pyDirX, pyDirY, Py_len, '#fb7185', 'P_y', { labelSide: 'left', dashed: true });

    // Px موازٍ للسطح نحو الأسفل
    const pxDirX = -Math.cos(rad);
    const pxDirY = Math.sin(rad);
    content += renderVectorArrow(Gx, Gy, pxDirX, pxDirY, Px_len, '#fb7185', 'P_x', { labelSide: 'below', dashed: true });

    // خطوط الإسقاط المنقطة لإكمال المستطيل
    const projEx = Gx + pyDirX * Py_len;
    const projEy = Gy + pyDirY * Py_len;
    content += `<line x1="${projEx}" y1="${projEy}" x2="${Gx}" y2="${Gy + pLen}" stroke="#fb7185" stroke-width="1" stroke-dasharray="3 3"/>`;
    content += `<line x1="${Gx + pxDirX * Px_len}" y1="${Gy + pxDirY * Px_len}" x2="${Gx}" y2="${Gy + pLen}" stroke="#fb7185" stroke-width="1" stroke-dasharray="3 3"/>`;
  }

  // 3. رد الفعل الناظمي R للسطح (انطلاقاً من A عمودياً نحو الأعلى)
  if (spec.showNormalReaction) {
    const rLen = pLen * Math.cos(rad);
    content += renderVectorArrow(Ax, Ay, normX, normY, rLen, palette.reactionColor, 'R', { labelSide: 'right' });
  }

  // 4. قوة الاحتكاك f (موازية للسطح ومعاكسة للحركة)
  if (spec.showFriction) {
    const fLen = 35;
    // إذا كان ينزل، فالاحتكاك نحو الأعلى على السطح
    const fDirX = motion === 'down' ? Math.cos(rad) : -Math.cos(rad);
    const fDirY = motion === 'down' ? -Math.sin(rad) : Math.sin(rad);
    content += renderVectorArrow(Ax, Ay, fDirX, fDirY, fLen, palette.frictionColor, 'f', { labelSide: 'above' });
  }

  // 5. سهم اتجاه الحركة
  if (spec.showMotionArrow && motion !== 'rest') {
    const mDirX = motion === 'down' ? -Math.cos(rad) : Math.cos(rad);
    const mDirY = motion === 'down' ? Math.sin(rad) : -Math.sin(rad);
    const arrowStartX = blockCx + normX * (blockH + 25);
    const arrowStartY = blockCy + normY * (blockH + 25);

    content += renderVectorArrow(arrowStartX, arrowStartY, mDirX, mDirY, 45, '#10b981', 'v', { labelSide: 'above', showOriginDot: false });
    content += `<text x="${arrowStartX + mDirX * 22}" y="${arrowStartY + mDirY * 22 - 14}" fill="#10b981" font-size="11" font-weight="bold" text-anchor="middle">جهة الحركة</text>`;
  }

  // 6. بطاقة القوانين وتفكيك القوى على اليمين
  const cardX = 660;
  const cardY = 80;
  const cardW = 270;
  const cardH = 370;

  content += `
  <g filter="url(#mech-shadow)">
    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="10" fill="${palette.cardBg}" stroke="${palette.cardBorder}" stroke-width="1.5"/>
    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="32" rx="10" fill="${palette.frictionColor}" opacity="0.9"/>
    <text x="${cardX + cardW / 2}" y="${cardY + 21}" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle" font-family="sans-serif">القوى على مستوٍ مائل وتفكيك الثقل</text>

    <text x="${cardX + cardW - 15}" y="${cardY + 60}" fill="${palette.textPrimary}" font-size="12" font-weight="bold" text-anchor="end">تفكيك شعاع الثقل (P&#x20D7;):</text>
    <text x="${cardX + cardW / 2}" y="${cardY + 85}" fill="${palette.weightColor}" font-size="14" font-weight="bold" text-anchor="middle">P&#x20D7; = P_x&#x20D7; + P_y&#x20D7;</text>

    <text x="${cardX + cardW - 15}" y="${cardY + 115}" fill="${palette.textSecondary}" font-size="11.5" text-anchor="end">&#x2022; المركبة المماسية (المحركة):</text>
    <text x="${cardX + cardW / 2}" y="${cardY + 138}" fill="#fb7185" font-size="13.5" font-weight="bold" text-anchor="middle">P_x = P &#xB7; sin(&#x03B1;)</text>

    <text x="${cardX + cardW - 15}" y="${cardY + 170}" fill="${palette.textSecondary}" font-size="11.5" text-anchor="end">&#x2022; المركبة الناظمية (الضاغطة):</text>
    <text x="${cardX + cardW / 2}" y="${cardY + 193}" fill="#fb7185" font-size="13.5" font-weight="bold" text-anchor="middle">P_y = P &#xB7; cos(&#x03B1;)</text>

    <line x1="${cardX + 15}" y1="${cardY + 215}" x2="${cardX + cardW - 15}" y2="${cardY + 215}" stroke="${palette.cardBorder}" stroke-width="1"/>

    <text x="${cardX + cardW - 15}" y="${cardY + 245}" fill="${palette.textPrimary}" font-size="12" font-weight="bold" text-anchor="end">القوى الأخرى المؤثرة:</text>
    <text x="${cardX + cardW - 25}" y="${cardY + 270}" fill="${palette.reactionColor}" font-size="11" text-anchor="end">&#x2022; رد الفعل الناظمي R&#x20D7; (عمودي على السطح)</text>
    <text x="${cardX + cardW - 25}" y="${cardY + 295}" fill="${palette.frictionColor}" font-size="11" text-anchor="end">&#x2022; قوة الاحتكاك f&#x20D7; (${motion === 'rest' ? 'تمنع انزلاق الجسم' : 'معاكسة لجهة الحركة'})</text>

    <text x="${cardX + cardW / 2}" y="${cardY + 340}" fill="${palette.textPrimary}" font-size="13" font-weight="bold" text-anchor="middle">&#x2211; F&#x20D7; = P&#x20D7; + R&#x20D7; + f&#x20D7;</text>
  </g>`;

  // التأشيرات
  const labels: CalloutItem[] = [
    { num: 1, ar: 'المستوى المائل بزاوية (&#x03B1;)', sub: 'Inclined Plane Surface', target: [topX - 60, topY + 40], card: [topX - 100, 60] },
    { num: 2, ar: 'الجسم الصلب المنزلق (S)', sub: 'Moving Body (S)', target: [blockCx, blockCy - 20], card: [blockCx - 140, blockCy - 70] },
    { num: 3, ar: 'شعاع الثقل الشاقولي (P)', sub: 'True Weight Vector', target: [Gx, Gy + 50], card: [Gx + 60, Gy + 80] },
    { num: 4, ar: 'المركبة المماسية للثقل (Px)', sub: 'Tangential Component (Px)', target: [Gx - 25, Gy + 20], card: [Gx - 130, Gy + 40] },
    { num: 5, ar: 'المركبة الناظمية للثقل (Py)', sub: 'Normal Component (Py)', target: [Gx + 20, Gy + 40], card: [Gx - 130, Gy + 90] },
    { num: 6, ar: 'رد الفعل الناظمي للسطح (R)', sub: 'Normal Reaction Force', target: [Ax + normX * 30, Ay + normY * 30], card: [Ax + normX * 30 + 60, Ay + normY * 30 - 30] },
    { num: 7, ar: 'قوة الاحتكاك المعاكسة (f)', sub: 'Friction Force', target: [Ax + Math.cos(rad) * 20, Ay - Math.sin(rad) * 20], card: [Ax + 90, Ay - 50] },
  ];

  content += renderCallouts(labels, spec.labelsMode ?? 'full', palette);
  return content;
}

// ------------------------------------------------------------
// المُصيّر العام للظواهر الميكانيكية
// ------------------------------------------------------------

/**
 * يُصيّر أشكال وتجارب الظواهر الميكانيكية لمرحلة التعليم المتوسط.
 * المبدأ الحاكم: "لا يرمي أبداً" — أي مواصفات غير صالحة تعيد ''.
 */
export function renderMechanics(spec: MechanicsSpec, opts?: RenderOptions): string {
  try {
    const parsed = mechanicsSpecSchema.safeParse(spec);
    if (!parsed.success) return '';
    const validSpec = parsed.data;

    const theme = validSpec.theme ?? 'natural';
    const palette = getPalette(theme);

    let svgBody = renderDefs(palette);

    // خلفية المشهد (شفافة بدون مستطيل مصمت لسهولة الدمج والطباعة)

    // توجيه الرسم حسب النموذج
    switch (validSpec.kind) {
      case 'two_forces_equilibrium':
        svgBody += renderTwoForces(validSpec, palette);
        break;
      case 'three_forces_equilibrium':
        svgBody += renderThreeForces(validSpec, palette);
        break;
      case 'archimedes':
        svgBody += renderArchimedesSetup(validSpec, palette);
        break;
      case 'dynamometer_weight':
        svgBody += renderDynamometerWeightSetup(validSpec, palette);
        break;
      case 'inclined_plane_motion':
        svgBody += renderInclinedPlaneSetup(validSpec, palette);
        break;
    }

    // شريط التسمية التوضيحية (Caption)
    if (validSpec.caption) {
      svgBody += `
      <g filter="url(#mech-shadow)">
        <rect x="60" y="${H - 46}" width="${W - 120}" height="32" rx="8" fill="${palette.cardBg}" stroke="${palette.cardBorder}" stroke-width="1"/>
        <text x="${W / 2}" y="${H - 25}" fill="${palette.textPrimary}" font-size="13" font-weight="bold" text-anchor="middle" font-family="sans-serif">${esc(validSpec.caption)}</text>
      </g>`;
    }

    const titleMap: Record<MechanicsKind, string> = {
      two_forces_equilibrium: 'توازن جسم صلب خاضع لقوتين',
      three_forces_equilibrium: 'توازن جسم صلب خاضع لـ 3 قوى غير متوازية',
      archimedes: 'دافعة أرخميدس في السوائل',
      dynamometer_weight: 'الربيعة، الثقل والكتلة',
      inclined_plane_motion: 'حركة واحتكاك على مستوٍ مائل',
    };

    return wrapSvg(svgBody, W, H, `مخطط فيزيائي: ${titleMap[validSpec.kind]}`, opts);
  } catch {
    return '';
  }
}
