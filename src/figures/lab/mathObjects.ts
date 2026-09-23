// ============================================================
// lab/mathObjects — كائنات الرياضيات المفردة للمخبر والسبورة
// ============================================================
// كسر، مجسمات هندسية، ساعة، مسطرة، منقلة، كوس، بركار،
// مجموعات الأعداد، جدول المراتب، نرد، قطعة نقدية، معداد، ونقطة في معلم.
// ============================================================

import { z } from 'zod';
import { wrapSvg, type RenderOptions, resolveFont } from '../shared.js';
import {
  uid,
  badge,
  label,
  linGrad,
  metalGrad,
  shadowDef,
  darken,
} from './style.js';

// ------------------------------------------------------------
// المخطّطات (Zod schemas — strict, optional fields without default)
// ------------------------------------------------------------

export const fractionSpecSchema = z.object({
  kind: z.literal('fraction'),
  num: z.number().int().min(0).max(100).optional(),
  den: z.number().int().min(1).max(100).optional(),
  style: z.enum(['pie', 'bar']).optional(),
  showLabel: z.boolean().optional(),
  labelsMode: z.enum(['full', 'numbered', 'none']).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const solidSpecSchema = z.object({
  kind: z.literal('solid'),
  shape: z.enum(['cube', 'cuboid', 'cylinder', 'cone', 'sphere', 'pyramid']).optional(),
  a: z.number().min(1).max(100).optional(),
  b: z.number().min(1).max(100).optional(),
  h: z.number().min(1).max(100).optional(),
  r: z.number().min(1).max(100).optional(),
  unit: z.string().max(8).optional(),
  showDims: z.boolean().optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const clockSpecSchema = z.object({
  kind: z.literal('clock'),
  hours: z.number().int().min(0).max(23).optional(),
  minutes: z.number().int().min(0).max(59).optional(),
  showDigital: z.boolean().optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const rulerSpecSchema = z.object({
  kind: z.literal('ruler'),
  length: z.number().int().min(5).max(30).optional(),
  unit: z.enum(['cm', 'mm']).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const protractorSpecSchema = z.object({
  kind: z.literal('protractor'),
  angle: z.number().min(0).max(180).optional(),
  showRays: z.boolean().optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const setSquareSpecSchema = z.object({
  kind: z.literal('set_square'),
  type: z.enum(['45', '30_60']).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const compassToolSpecSchema = z.object({
  kind: z.literal('compass_tool'),
  radius: z.number().min(10).max(100).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const numberSetsSpecSchema = z.object({
  kind: z.literal('number_sets'),
  highlight: z.enum(['N', 'Z', 'Q', 'R', 'none']).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const placeValueSpecSchema = z.object({
  kind: z.literal('place_value'),
  value: z.number().int().min(0).max(999999).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const diceSpecSchema = z.object({
  kind: z.literal('dice'),
  face: z.number().int().min(1).max(6).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const coinSpecSchema = z.object({
  kind: z.literal('coin'),
  side: z.enum(['heads', 'tails']).optional(),
  value: z.number().int().min(1).max(500).optional(),
  currency: z.string().max(8).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const abacusSpecSchema = z.object({
  kind: z.literal('abacus'),
  value: z.number().int().min(0).max(9999).optional(),
  rods: z.number().int().min(3).max(5).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const coordinatePointSpecSchema = z.object({
  kind: z.literal('coordinate_point'),
  x: z.number().min(-10).max(10).optional(),
  y: z.number().min(-10).max(10).optional(),
  label: z.string().max(8).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export type FractionSpec = z.infer<typeof fractionSpecSchema>;
export type SolidSpec = z.infer<typeof solidSpecSchema>;
export type ClockSpec = z.infer<typeof clockSpecSchema>;
export type RulerSpec = z.infer<typeof rulerSpecSchema>;
export type ProtractorSpec = z.infer<typeof protractorSpecSchema>;
export type SetSquareSpec = z.infer<typeof setSquareSpecSchema>;
export type CompassToolSpec = z.infer<typeof compassToolSpecSchema>;
export type NumberSetsSpec = z.infer<typeof numberSetsSpecSchema>;
export type PlaceValueSpec = z.infer<typeof placeValueSpecSchema>;
export type DiceSpec = z.infer<typeof diceSpecSchema>;
export type CoinSpec = z.infer<typeof coinSpecSchema>;
export type AbacusSpec = z.infer<typeof abacusSpecSchema>;
export type CoordinatePointSpec = z.infer<typeof coordinatePointSpecSchema>;

// ------------------------------------------------------------
// 1. الكسر (Fraction)
// ------------------------------------------------------------
export function renderFraction(spec: FractionSpec, opts?: RenderOptions): string {
  const W = 220, H = 200, id = `frac-${uid()}`, font = resolveFont(opts);
  const num = Math.max(0, spec.num ?? 3);
  const den = Math.max(1, spec.den ?? 4);
  const style = spec.style ?? 'pie';
  const showLabel = spec.showLabel ?? true;
  const labelsMode = spec.labelsMode ?? 'full';
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const fillCol = isPrint ? '#475569' : '#3b82f6';
  const emptyCol = isPrint ? '#f1f5f9' : '#e0f2fe';
  const strokeCol = isPrint ? '#0f172a' : '#1d4ed8';

  const parts: string[] = [];
  parts.push(`<defs>${shadowDef(`${id}-sh`, 2, 3)}</defs>`);

  if (style === 'pie') {
    const cx = W / 2, cy = 90, r = 65;
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${emptyCol}" stroke="${strokeCol}" stroke-width="2" filter="url(#${id}-sh)"/>`);
    const totalSlices = Math.min(den, 36);
    const filledSlices = Math.min(num, totalSlices);

    for (let i = 0; i < totalSlices; i++) {
      const a1 = (i / totalSlices) * 2 * Math.PI - Math.PI / 2;
      const a2 = ((i + 1) / totalSlices) * 2 * Math.PI - Math.PI / 2;
      const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
      const largeArc = 1 / totalSlices > 0.5 ? 1 : 0;
      const isFilled = i < filledSlices;
      const d = `M ${cx},${cy} L ${x1.toFixed(1)},${y1.toFixed(1)} A ${r},${r} 0 ${largeArc} 1 ${x2.toFixed(1)},${y2.toFixed(1)} Z`;
      parts.push(`<path d="${d}" fill="${isFilled ? fillCol : emptyCol}" stroke="${strokeCol}" stroke-width="1.2"/>`);
    }
  } else {
    // شريط مجزأ
    const bx = 25, by = 65, bw = 170, bh = 45;
    parts.push(`<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="6" fill="${emptyCol}" stroke="${strokeCol}" stroke-width="2" filter="url(#${id}-sh)"/>`);
    const totalBars = Math.min(den, 20);
    const filledBars = Math.min(num, totalBars);
    const segW = bw / totalBars;
    for (let i = 0; i < totalBars; i++) {
      const sx = bx + i * segW;
      const isFilled = i < filledBars;
      parts.push(`<rect x="${sx}" y="${by}" width="${segW}" height="${bh}" fill="${isFilled ? fillCol : emptyCol}" stroke="${strokeCol}" stroke-width="1"/>`);
    }
  }

  if (showLabel && labelsMode !== 'none') {
    if (labelsMode === 'numbered') {
      parts.push(`<circle cx="${W / 2}" cy="${H - 22}" r="12" fill="${isPrint ? '#1e293b' : '#2563eb'}"/>`);
      parts.push(`<text x="${W / 2}" y="${H - 17}" font-size="12" text-anchor="middle" font-weight="bold" fill="#ffffff">1</text>`);
    } else {
      parts.push(badge(W / 2, H - 22, `${num} / ${den}`, { font, size: 14, bg: strokeCol }));
    }
  }

  return wrapSvg(parts.join(''), W, H, `كسر ${num} على ${den}`, opts);
}

// ------------------------------------------------------------
// 2. المجسم الهندسي (Solid)
// ------------------------------------------------------------
export function renderSolid(spec: SolidSpec, opts?: RenderOptions): string {
  const W = 220, H = 220, id = `sol-${uid()}`, font = resolveFont(opts);
  const shape = spec.shape ?? 'cube';
  const unit = spec.unit ?? 'cm';
  const showDims = spec.showDims ?? true;
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const baseCol = isPrint ? '#64748b' : '#38bdf8';
  const topCol = isPrint ? '#94a3b8' : '#7dd3fc';
  const sideCol = isPrint ? '#475569' : '#0284c7';
  const strokeCol = isPrint ? '#0f172a' : '#0369a1';

  const parts: string[] = [];
  parts.push(`<defs>${linGrad(`${id}-f`, [[0, topCol], [1, baseCol]])}${shadowDef(`${id}-sh`, 4, 4)}</defs>`);

  if (shape === 'cube') {
    const a = spec.a ?? 5;
    const ox = 110, oy = 115, s = 52;
    const top = `M ${ox},${oy - s} L ${ox + s * 0.866},${oy - s * 0.5} L ${ox},${oy} L ${ox - s * 0.866},${oy - s * 0.5} Z`;
    const right = `M ${ox},${oy} L ${ox + s * 0.866},${oy - s * 0.5} L ${ox + s * 0.866},${oy + s * 0.5} L ${ox},${oy + s} Z`;
    const left = `M ${ox},${oy} L ${ox - s * 0.866},${oy - s * 0.5} L ${ox - s * 0.866},${oy + s * 0.5} L ${ox},${oy + s} Z`;

    parts.push(`<g filter="url(#${id}-sh)">`);
    parts.push(`<path d="${top}" fill="${topCol}" stroke="${strokeCol}" stroke-width="1.5"/>`);
    parts.push(`<path d="${right}" fill="${sideCol}" stroke="${strokeCol}" stroke-width="1.5"/>`);
    parts.push(`<path d="${left}" fill="${baseCol}" stroke="${strokeCol}" stroke-width="1.5"/>`);
    parts.push(`</g>`);
    if (showDims) {
      parts.push(badge(ox, oy + s + 22, `a = ${a} ${unit}`, { font, size: 11, bg: strokeCol }));
    }
  } else if (shape === 'cylinder') {
    const r = spec.r ?? 3, h = spec.h ?? 8;
    const cx = 110, cy = 60, rx = 55, ry = 18, ch = 85;
    parts.push(`<g filter="url(#${id}-sh)">`);
    parts.push(`<path d="M ${cx - rx},${cy} v ${ch} a ${rx},${ry} 0 0 0 ${2 * rx},0 v ${-ch} Z" fill="url(#${id}-f)" stroke="${strokeCol}" stroke-width="1.5"/>`);
    parts.push(`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${topCol}" stroke="${strokeCol}" stroke-width="1.5"/>`);
    parts.push(`</g>`);
    if (showDims) {
      parts.push(label(cx, cy + ch + 32, `r = ${r} ${unit} · h = ${h} ${unit}`, { font, size: 11, bold: true, color: strokeCol }));
    }
  } else if (shape === 'sphere') {
    const r = spec.r ?? 4;
    const cx = 110, cy = 105, rad = 58;
    parts.push(`<defs><radialGradient id="${id}-sp" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="${topCol}"/><stop offset="60%" stop-color="${baseCol}"/><stop offset="100%" stop-color="${sideCol}"/></radialGradient></defs>`);
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${rad}" fill="url(#${id}-sp)" stroke="${strokeCol}" stroke-width="1.5" filter="url(#${id}-sh)"/>`);
    parts.push(`<ellipse cx="${cx}" cy="${cy}" rx="${rad}" ry="${rad * 0.32}" fill="none" stroke="${strokeCol}" stroke-width="1.2" stroke-dasharray="3 3"/>`);
    if (showDims) {
      parts.push(`<line x1="${cx}" y1="${cy}" x2="${cx + rad}" y2="${cy}" stroke="${strokeCol}" stroke-width="1.5"/>`);
      parts.push(label(cx + rad / 2, cy - 8, `r = ${r} ${unit}`, { font, size: 10, bold: true, color: strokeCol }));
    }
  } else if (shape === 'cone') {
    const r = spec.r ?? 3, h = spec.h ?? 7;
    const cx = 110, topY = 40, baseY = 150, rx = 52, ry = 16;
    parts.push(`<g filter="url(#${id}-sh)">`);
    parts.push(`<path d="M ${cx},${topY} L ${cx - rx},${baseY} a ${rx},${ry} 0 0 0 ${2 * rx},0 Z" fill="url(#${id}-f)" stroke="${strokeCol}" stroke-width="1.5"/>`);
    parts.push(`<ellipse cx="${cx}" cy="${baseY}" rx="${rx}" ry="${ry}" fill="${sideCol}" fill-opacity="0.3" stroke="${strokeCol}" stroke-width="1.2" stroke-dasharray="4 3"/>`);
    parts.push(`</g>`);
    if (showDims) {
      parts.push(label(cx, baseY + 28, `r = ${r} ${unit} · h = ${h} ${unit}`, { font, size: 11, bold: true, color: strokeCol }));
    }
  } else if (shape === 'pyramid') {
    const h = spec.h ?? 6;
    const topX = 110, topY = 40, baseY = 155;
    parts.push(`<g filter="url(#${id}-sh)">`);
    parts.push(`<polygon points="${topX},${topY} 50,${baseY} 115,${baseY + 12}" fill="${baseCol}" stroke="${strokeCol}" stroke-width="1.5"/>`);
    parts.push(`<polygon points="${topX},${topY} 115,${baseY + 12} 175,${baseY - 5}" fill="${sideCol}" stroke="${strokeCol}" stroke-width="1.5"/>`);
    parts.push(`</g>`);
    if (showDims) {
      parts.push(badge(topX, baseY + 32, `h = ${h} ${unit}`, { font, size: 11, bg: strokeCol }));
    }
  } else {
    // cuboid
    const a = spec.a ?? 6, b = spec.b ?? 4, h = spec.h ?? 3;
    const ox = 110, oy = 110, w = 60, d = 35, ht = 45;
    parts.push(`<g filter="url(#${id}-sh)">`);
    parts.push(`<polygon points="${ox - w},${oy} ${ox},${oy - d} ${ox + w},${oy - d} ${ox},${oy}" fill="${topCol}" stroke="${strokeCol}" stroke-width="1.5"/>`);
    parts.push(`<polygon points="${ox - w},${oy} ${ox},${oy} ${ox},${oy + ht} ${ox - w},${oy + ht}" fill="${baseCol}" stroke="${strokeCol}" stroke-width="1.5"/>`);
    parts.push(`<polygon points="${ox},${oy} ${ox + w},${oy - d} ${ox + w},${oy - d + ht} ${ox},${oy + ht}" fill="${sideCol}" stroke="${strokeCol}" stroke-width="1.5"/>`);
    parts.push(`</g>`);
    if (showDims) {
      parts.push(label(ox, oy + ht + 26, `${a}×${b}×${h} ${unit}`, { font, size: 11, bold: true, color: strokeCol }));
    }
  }

  return wrapSvg(parts.join(''), W, H, `مجسم هندسي — ${shape}`, opts);
}

// ------------------------------------------------------------
// 3. الساعة التناظرية (Clock)
// ------------------------------------------------------------
export function renderClock(spec: ClockSpec, opts?: RenderOptions): string {
  const W = 210, H = 220, id = `clk-${uid()}`, font = resolveFont(opts);
  const hours = spec.hours ?? 3;
  const minutes = spec.minutes ?? 0;
  const showDigital = spec.showDigital ?? true;
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const cx = W / 2, cy = 95, r = 72;
  const dialBg = isPrint ? '#ffffff' : '#f8fafc';
  const ringCol = isPrint ? '#334155' : '#0284c7';
  const hrAngle = ((hours % 12) + minutes / 60) * (Math.PI / 6) - Math.PI / 2;
  const minAngle = (minutes / 60) * (2 * Math.PI) - Math.PI / 2;

  const parts: string[] = [];
  parts.push(`<defs>${shadowDef(`${id}-sh`, 3, 3)}</defs>`);
  parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${dialBg}" stroke="${ringCol}" stroke-width="5" filter="url(#${id}-sh)"/>`);

  // تدريجات الساعات 1..12
  for (let h = 1; h <= 12; h++) {
    const ang = h * (Math.PI / 6) - Math.PI / 2;
    const tx = cx + (r - 16) * Math.cos(ang);
    const ty = cy + (r - 16) * Math.sin(ang) + 4;
    parts.push(`<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-size="11" font-family="${font}" font-weight="bold" text-anchor="middle" fill="#0f172a">${h}</text>`);
  }

  // عقرب الساعات
  const hrLen = r * 0.52;
  const hx = cx + hrLen * Math.cos(hrAngle), hy = cy + hrLen * Math.sin(hrAngle);
  parts.push(`<line x1="${cx}" y1="${cy}" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round"/>`);

  // عقرب الدقائق
  const minLen = r * 0.76;
  const mx = cx + minLen * Math.cos(minAngle), my = cy + minLen * Math.sin(minAngle);
  parts.push(`<line x1="${cx}" y1="${cy}" x2="${mx.toFixed(1)}" y2="${my.toFixed(1)}" stroke="${isPrint ? '#0f172a' : '#ef4444'}" stroke-width="2.2" stroke-linecap="round"/>`);

  // نقطة الارتكاز المركزية
  parts.push(`<circle cx="${cx}" cy="${cy}" r="4.5" fill="#0f172a"/>`);

  if (showDigital) {
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    parts.push(badge(cx, H - 20, `${hh}:${mm}`, { font, size: 12, bg: ringCol }));
  }

  return wrapSvg(parts.join(''), W, H, `ساعة — ${hours}:${minutes}`, opts);
}

// ------------------------------------------------------------
// 4. المسطرة المدرجة (Ruler)
// ------------------------------------------------------------
export function renderRuler(spec: RulerSpec, opts?: RenderOptions): string {
  const len = Math.max(5, Math.min(30, spec.length ?? 15));
  const pxPerCm = 24;
  const W = len * pxPerCm + 60, H = 90, id = `rul-${uid()}`, font = resolveFont(opts);
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const woodBase = isPrint ? '#e2e8f0' : '#fef08a';
  const woodBorder = isPrint ? '#475569' : '#ca8a04';
  const parts: string[] = [];

  parts.push(`<defs>${shadowDef(`${id}-sh`, 2, 3)}</defs>`);
  parts.push(`<rect x="20" y="20" width="${len * pxPerCm + 20}" height="48" rx="4" fill="${woodBase}" stroke="${woodBorder}" stroke-width="1.8" filter="url(#${id}-sh)"/>`);

  for (let cm = 0; cm <= len; cm++) {
    const x = 30 + cm * pxPerCm;
    parts.push(`<line x1="${x}" y1="20" x2="${x}" y2="36" stroke="#0f172a" stroke-width="1.2"/>`);
    parts.push(`<text x="${x}" y="52" font-size="10" font-family="${font}" text-anchor="middle" font-weight="bold" fill="#0f172a">${cm}</text>`);
    if (cm < len) {
      const midX = x + pxPerCm / 2;
      parts.push(`<line x1="${midX}" y1="20" x2="${midX}" y2="30" stroke="#475569" stroke-width="1"/>`);
      for (let mm = 1; mm < 10; mm++) {
        if (mm !== 5) {
          const mmX = x + (mm * pxPerCm) / 10;
          parts.push(`<line x1="${mmX}" y1="20" x2="${mmX}" y2="26" stroke="#64748b" stroke-width="0.8"/>`);
        }
      }
    }
  }

  parts.push(`<text x="${W - 25}" y="52" font-size="10" font-family="${font}" font-weight="bold" fill="#0f172a">cm</text>`);
  return wrapSvg(parts.join(''), W, H, `مسطرة ${len} سم`, opts);
}

// ------------------------------------------------------------
// 5. المنقلة (Protractor)
// ------------------------------------------------------------
export function renderProtractor(spec: ProtractorSpec, opts?: RenderOptions): string {
  const W = 260, H = 165, id = `pro-${uid()}`, font = resolveFont(opts);
  const angle = spec.angle;
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const cx = 130, cy = 135, r = 105;
  const arcCol = isPrint ? '#334155' : '#0284c7';
  const parts: string[] = [];

  parts.push(`<defs>${shadowDef(`${id}-sh`, 2, 4)}</defs>`);
  // نصف دائرة المنقلة
  const d = `M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy} Z`;
  parts.push(`<path d="${d}" fill="#f8fafc" fill-opacity="0.85" stroke="${arcCol}" stroke-width="2" filter="url(#${id}-sh)"/>`);
  // فتحة داخلية نصف دائرية
  const ir = 42;
  parts.push(`<path d="M ${cx - ir},${cy} A ${ir},${ir} 0 0 1 ${cx + ir},${cy} Z" fill="#ffffff" stroke="${arcCol}" stroke-width="1"/>`);
  parts.push(`<circle cx="${cx}" cy="${cy}" r="3" fill="#0f172a"/>`);

  // درجات 0..180
  for (let deg = 0; deg <= 180; deg += 10) {
    const rad = (deg * Math.PI) / 180;
    const x1 = cx - r * Math.cos(rad);
    const y1 = cy - r * Math.sin(rad);
    const x2 = cx - (r - 10) * Math.cos(rad);
    const y2 = cy - (r - 10) * Math.sin(rad);
    parts.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#0f172a" stroke-width="1"/>`);
    if (deg % 30 === 0) {
      const tx = cx - (r - 20) * Math.cos(rad);
      const ty = cy - (r - 20) * Math.sin(rad) + 3;
      parts.push(`<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-size="8" font-family="${font}" text-anchor="middle" fill="#334155">${deg}°</text>`);
    }
  }

  // إذا كانت هناك زاوية محددة: شعاعان ملونان
  if (typeof angle === 'number' && angle >= 0 && angle <= 180) {
    const rayCol = isPrint ? '#0f172a' : '#dc2626';
    const rad = (angle * Math.PI) / 180;
    const ax = cx + (r - 8) * Math.cos(0);
    const ay = cy;
    const bx = cx - (r - 8) * Math.cos(rad);
    const by = cy - (r - 8) * Math.sin(rad);
    parts.push(`<line x1="${cx}" y1="${cy}" x2="${ax}" y2="${ay}" stroke="${rayCol}" stroke-width="2.5"/>`);
    parts.push(`<line x1="${cx}" y1="${cy}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="${rayCol}" stroke-width="2.5"/>`);
    parts.push(badge(cx, cy + 22, `الزاوية: ${angle}°`, { font, size: 11, bg: rayCol }));
  }

  return wrapSvg(parts.join(''), W, H, `منقلة هندسية`, opts);
}

// ------------------------------------------------------------
// 6. الكوس (Set Square)
// ------------------------------------------------------------
export function renderSetSquare(spec: SetSquareSpec, opts?: RenderOptions): string {
  const W = 220, H = 200, id = `sq-${uid()}`, font = resolveFont(opts);
  const type = spec.type ?? '45';
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const strokeCol = isPrint ? '#334155' : '#0284c7';
  const bgCol = isPrint ? '#f1f5f9' : '#e0f2fe';
  const parts: string[] = [];

  parts.push(`<defs>${shadowDef(`${id}-sh`, 3, 3)}</defs>`);

  if (type === '45') {
    // مثلث قائم متساوي الساقين
    const p1 = '30,170', p2 = '190,170', p3 = '30,30';
    const ip1 = '50,150', ip2 = '150,150', ip3 = '50,70';
    parts.push(`<polygon points="${p1} ${p2} ${p3}" fill="${bgCol}" fill-opacity="0.85" stroke="${strokeCol}" stroke-width="2" filter="url(#${id}-sh)"/>`);
    parts.push(`<polygon points="${ip1} ${ip2} ${ip3}" fill="#ffffff" stroke="${strokeCol}" stroke-width="1.2"/>`);
    // رمز الزاوية القائمة
    parts.push(`<rect x="30" y="152" width="18" height="18" fill="none" stroke="${strokeCol}" stroke-width="1.2"/>`);
    parts.push(label(110, 192, 'كوس 45°', { font, size: 11, bold: true, color: strokeCol }));
  } else {
    // 30-60
    const p1 = '30,170', p2 = '190,170', p3 = '30,20';
    const ip1 = '50,150', ip2 = '145,150', ip3 = '50,55';
    parts.push(`<polygon points="${p1} ${p2} ${p3}" fill="${bgCol}" fill-opacity="0.85" stroke="${strokeCol}" stroke-width="2" filter="url(#${id}-sh)"/>`);
    parts.push(`<polygon points="${ip1} ${ip2} ${ip3}" fill="#ffffff" stroke="${strokeCol}" stroke-width="1.2"/>`);
    parts.push(`<rect x="30" y="152" width="18" height="18" fill="none" stroke="${strokeCol}" stroke-width="1.2"/>`);
    parts.push(label(110, 192, 'كوس 30° / 60°', { font, size: 11, bold: true, color: strokeCol }));
  }

  return wrapSvg(parts.join(''), W, H, `كوس هندسي — ${type}°`, opts);
}

// ------------------------------------------------------------
// 7. البركار / المدور (Compass Tool)
// ------------------------------------------------------------
export function renderCompassTool(spec: CompassToolSpec, opts?: RenderOptions): string {
  const W = 200, H = 220, id = `cmp-${uid()}`, font = resolveFont(opts);
  const radius = spec.radius ?? 40;
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const metalCol = isPrint ? '#64748b' : '#94a3b8';
  const pencilCol = isPrint ? '#0f172a' : '#f59e0b';
  const parts: string[] = [];

  const topX = 100, topY = 35;
  const spread = Math.min(65, Math.max(20, radius * 0.85));
  const leftX = topX - spread, leftY = 175;
  const rightX = topX + spread, rightY = 175;

  parts.push(`<defs>${metalGrad(`${id}-leg`, metalCol, 'v')}${shadowDef(`${id}-sh`, 3, 3)}</defs>`);

  // قوس الرسم بالقلم الرصاص
  parts.push(`<path d="M ${rightX - 30},${rightY - 10} A ${radius * 1.5},${radius * 1.5} 0 0 1 ${rightX + 25},${rightY + 12}" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3 3"/>`);

  // الساق الإبرية (يسار)
  parts.push(`<line x1="${topX}" y1="${topY}" x2="${leftX}" y2="${leftY}" stroke="url(#${id}-leg)" stroke-width="6" stroke-linecap="round" filter="url(#${id}-sh)"/>`);
  parts.push(`<polygon points="${leftX},${leftY} ${leftX - 2},${leftY + 14} ${leftX + 2},${leftY + 14}" fill="#0f172a"/>`);

  // ساق القلم (يمين)
  parts.push(`<line x1="${topX}" y1="${topY}" x2="${rightX}" y2="${rightY - 20}" stroke="url(#${id}-leg)" stroke-width="6" stroke-linecap="round" filter="url(#${id}-sh)"/>`);
  parts.push(`<rect x="${rightX - 5}" y="${rightY - 24}" width="10" height="24" rx="2" fill="${pencilCol}"/>`);
  parts.push(`<polygon points="${rightX - 5},${rightY} ${rightX + 5},${rightY} ${rightX},${rightY + 12}" fill="#0f172a"/>`);

  // المفصل العلوي
  parts.push(`<circle cx="${topX}" cy="${topY}" r="9" fill="#334155" filter="url(#${id}-sh)"/>`);
  parts.push(`<circle cx="${topX}" cy="${topY}" r="4" fill="#cbd5e1"/>`);
  parts.push(badge(topX, H - 15, `r = ${radius} mm`, { font, size: 11, bg: '#1e293b' }));

  return wrapSvg(parts.join(''), W, H, `مدور هندسي`, opts);
}

// ------------------------------------------------------------
// 8. مجموعات الأعداد (Number Sets)
// ------------------------------------------------------------
export function renderNumberSets(spec: NumberSetsSpec, opts?: RenderOptions): string {
  const W = 280, H = 220, id = `nsets-${uid()}`, font = resolveFont(opts);
  const hl = spec.highlight ?? 'none';
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const parts: string[] = [];
  parts.push(`<defs>${shadowDef(`${id}-sh`, 2, 4)}</defs>`);

  const sets = [
    { name: 'R', label: 'ℝ', rx: 125, ry: 90, cx: 140, cy: 105, col: '#f43f5e', sample: '√2, π, -√3', op: hl === 'R' ? 0.35 : hl === 'none' ? 0.12 : 0.04 },
    { name: 'Q', label: 'ℚ', rx: 96, ry: 70, cx: 140, cy: 112, col: '#f59e0b', sample: '0.75, 1/3', op: hl === 'Q' ? 0.4 : hl === 'none' ? 0.16 : 0.05 },
    { name: 'Z', label: 'ℤ', rx: 68, ry: 50, cx: 140, cy: 120, col: '#3b82f6', sample: '-3, -15', op: hl === 'Z' ? 0.45 : hl === 'none' ? 0.2 : 0.06 },
    { name: 'N', label: 'ℕ', rx: 42, ry: 32, cx: 140, cy: 126, col: '#10b981', sample: '0, 5, 42', op: hl === 'N' ? 0.5 : hl === 'none' ? 0.25 : 0.07 },
  ];

  for (const s of sets) {
    const isHL = hl === s.name;
    const stroke = isPrint ? '#0f172a' : s.col;
    const strokeW = isHL ? 2.5 : 1.5;
    parts.push(`<ellipse cx="${s.cx}" cy="${s.cy}" rx="${s.rx}" ry="${s.ry}" fill="${isPrint ? '#0f172a' : s.col}" fill-opacity="${s.op}" stroke="${stroke}" stroke-width="${strokeW}"/>`);
    parts.push(`<text x="${s.cx - s.rx + 16}" y="${s.cy - s.ry + 20}" font-size="14" font-weight="bold" font-family="${font}" fill="${isPrint ? '#000000' : s.col}">${s.label}</text>`);
  }

  // عينات الأعداد
  parts.push(label(140, 130, '0, 5, 42', { font, size: 10, bold: true, color: '#0f172a' }));
  parts.push(label(140, 95, '-3, -15', { font, size: 10, bold: true, color: '#1e3a8a' }));
  parts.push(label(140, 68, '0.75, 1/3', { font, size: 10, bold: true, color: '#78350f' }));
  parts.push(label(140, 42, '√2, π', { font, size: 10, bold: true, color: '#881337' }));

  if (hl !== 'none') {
    parts.push(badge(140, H - 14, `المجموعة المبرزة: ${hl}`, { font, size: 11, bg: '#0f172a' }));
  }

  return wrapSvg(parts.join(''), W, H, `مجموعات الأعداد ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ`, opts);
}

// ------------------------------------------------------------
// 9. جدول المراتب (Place Value)
// ------------------------------------------------------------
export function renderPlaceValue(spec: PlaceValueSpec, opts?: RenderOptions): string {
  const W = 280, H = 140, id = `pv-${uid()}`, font = resolveFont(opts);
  const val = spec.value ?? 4325;
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const borderCol = isPrint ? '#334155' : '#0284c7';
  const headerBg = isPrint ? '#e2e8f0' : '#bae6fd';
  const parts: string[] = [];

  const cols = [
    { title: 'آلاف', digit: Math.floor((val % 10000) / 1000) },
    { title: 'مئات', digit: Math.floor((val % 1000) / 100) },
    { title: 'عشرات', digit: Math.floor((val % 100) / 10) },
    { title: 'آحاد', digit: val % 10 },
  ];

  const colW = 60, startX = 20, startY = 25, rowH = 34;
  parts.push(`<defs>${shadowDef(`${id}-sh`, 2, 3)}</defs>`);
  parts.push(`<rect x="${startX}" y="${startY}" width="${colW * 4}" height="${rowH * 2}" rx="6" fill="#ffffff" stroke="${borderCol}" stroke-width="1.8" filter="url(#${id}-sh)"/>`);
  parts.push(`<rect x="${startX}" y="${startY}" width="${colW * 4}" height="${rowH}" rx="6" fill="${headerBg}"/>`);

  for (let i = 0; i < cols.length; i++) {
    const x = startX + i * colW;
    if (i > 0) parts.push(`<line x1="${x}" y1="${startY}" x2="${x}" y2="${startY + rowH * 2}" stroke="${borderCol}" stroke-width="1"/>`);
    parts.push(`<text x="${x + colW / 2}" y="${startY + 22}" font-size="12" font-family="${font}" font-weight="bold" text-anchor="middle" fill="#0f172a">${cols[i]!.title}</text>`);
    parts.push(`<text x="${x + colW / 2}" y="${startY + rowH + 24}" font-size="16" font-family="${font}" font-weight="bold" text-anchor="middle" fill="${isPrint ? '#000000' : '#0284c7'}">${cols[i]!.digit}</text>`);
  }

  parts.push(badge(W / 2, H - 18, `العدد: ${val}`, { font, size: 12, bg: borderCol }));
  return wrapSvg(parts.join(''), W, H, `جدول المراتب — ${val}`, opts);
}

// ------------------------------------------------------------
// 10. نرد الاحتمالات (Dice)
// ------------------------------------------------------------
const PIPS: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]],
  2: [[0.25, 0.25], [0.75, 0.75]],
  3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
  4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
  5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
  6: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.5], [0.75, 0.5], [0.25, 0.75], [0.75, 0.75]],
};

export function renderDice(spec: DiceSpec, opts?: RenderOptions): string {
  const W = 160, H = 175, id = `dice-${uid()}`, font = resolveFont(opts);
  const face = Math.max(1, Math.min(6, spec.face ?? 1));
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const base = isPrint ? '#f1f5f9' : '#ffffff';
  const s = 95, x = (W - s) / 2, y = 25;
  const parts: string[] = [];

  parts.push(`<defs>${linGrad(`${id}-f`, [[0, '#ffffff'], [1, darken(base, 0.15)]])}${shadowDef(`${id}-sh`, 4, 4)}</defs>`);
  parts.push(`<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="16" fill="url(#${id}-f)" stroke="${darken(base, 0.45)}" stroke-width="2" filter="url(#${id}-sh)"/>`);

  for (const [fx, fy] of PIPS[face] ?? PIPS[1]!) {
    parts.push(`<circle cx="${x + fx * s}" cy="${y + fy * s}" r="7.5" fill="${isPrint ? '#000000' : '#1e293b'}"/>`);
  }

  parts.push(badge(W / 2, H - 20, `الوجه ${face}`, { font, size: 11 }));
  return wrapSvg(parts.join(''), W, H, `نرد — الوجه ${face}`, opts);
}

// ------------------------------------------------------------
// 11. القطعة النقدية (Coin)
// ------------------------------------------------------------
export function renderCoin(spec: CoinSpec, opts?: RenderOptions): string {
  const W = 180, H = 190, id = `coin-${uid()}`, font = resolveFont(opts);
  const side = spec.side ?? 'heads';
  const val = spec.value ?? 100;
  const curr = spec.currency ?? 'DA';
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const cx = W / 2, cy = 85, r = 62;
  const parts: string[] = [];

  const gold1 = isPrint ? '#e2e8f0' : '#fef08a';
  const gold2 = isPrint ? '#94a3b8' : '#eab308';
  const gold3 = isPrint ? '#475569' : '#a16207';

  parts.push(`<defs><radialGradient id="${id}-g" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="${gold1}"/><stop offset="60%" stop-color="${gold2}"/><stop offset="100%" stop-color="${gold3}"/></radialGradient>${shadowDef(`${id}-sh`, 4, 4)}</defs>`);

  parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}-g)" stroke="${gold3}" stroke-width="3" filter="url(#${id}-sh)"/>`);
  parts.push(`<circle cx="${cx}" cy="${cy}" r="${r - 8}" fill="none" stroke="${gold1}" stroke-width="1.5" stroke-dasharray="3 3"/>`);

  if (side === 'heads') {
    parts.push(`<circle cx="${cx + 4}" cy="${cy}" r="22" fill="${gold3}"/>`);
    parts.push(`<circle cx="${cx + 11}" cy="${cy}" r="19" fill="url(#${id}-g)"/>`);
    parts.push(`<polygon points="${cx - 8},${cy - 8} ${cx - 4},${cy - 2} ${cx + 2},${cy - 2} ${cx - 3},${cy + 2} ${cx - 1},${cy + 8} ${cx - 6},${cy + 4} ${cx - 11},${cy + 8} ${cx - 9},${cy + 2} ${cx - 14},${cy - 2} ${cx - 8},${cy - 2}" fill="${gold3}"/>`);
    parts.push(label(cx, cy + 38, 'الجمهورية الجزائرية', { font, size: 9, bold: true, color: gold3 }));
  } else {
    parts.push(`<text x="${cx}" y="${cy + 6}" font-size="28" font-family="${font}" font-weight="bold" text-anchor="middle" fill="${gold3}">${val}</text>`);
    parts.push(`<text x="${cx}" y="${cy + 26}" font-size="12" font-family="${font}" font-weight="bold" text-anchor="middle" fill="${gold3}">${curr}</text>`);
  }

  parts.push(badge(cx, H - 20, side === 'heads' ? 'وجه' : 'ظهر', { font, size: 11, bg: gold3 }));
  return wrapSvg(parts.join(''), W, H, `قطعة نقدية — ${side === 'heads' ? 'وجه' : 'ظهر'}`, opts);
}

// ------------------------------------------------------------
// 12. المعداد المدرسي (Abacus)
// ------------------------------------------------------------
export function renderAbacus(spec: AbacusSpec, opts?: RenderOptions): string {
  const W = 220, H = 180, id = `abc-${uid()}`, font = resolveFont(opts);
  const val = spec.value ?? 352;
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const frameCol = isPrint ? '#334155' : '#78350f';
  const beadCol = isPrint ? '#64748b' : '#3b82f6';
  const parts: string[] = [];

  const fx = 25, fy = 25, fw = 170, fh = 115;
  parts.push(`<defs>${shadowDef(`${id}-sh`, 3, 3)}</defs>`);
  parts.push(`<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="8" fill="#f8fafc" stroke="${frameCol}" stroke-width="5" filter="url(#${id}-sh)"/>`);
  parts.push(`<line x1="${fx}" y1="${fy + 35}" x2="${fx + fw}" y2="${fy + 35}" stroke="${frameCol}" stroke-width="3.5"/>`);

  const rods = [
    Math.floor((val % 1000) / 100),
    Math.floor((val % 100) / 10),
    val % 10,
  ];

  const rodW = fw / (rods.length + 1);
  for (let i = 0; i < rods.length; i++) {
    const rx = fx + (i + 1) * rodW;
    parts.push(`<line x1="${rx}" y1="${fy}" x2="${rx}" y2="${fy + fh}" stroke="#94a3b8" stroke-width="2"/>`);
    const digit = rods[i]!;
    const topActive = digit >= 5;
    const topBeadY = topActive ? fy + 24 : fy + 12;
    parts.push(`<ellipse cx="${rx}" cy="${topBeadY}" rx="11" ry="6" fill="${beadCol}" stroke="${darken(beadCol, 0.4)}" stroke-width="1"/>`);

    const lowerCount = digit % 5;
    for (let b = 0; b < 4; b++) {
      const isUp = b < lowerCount;
      const beadY = isUp ? fy + 48 + b * 13 : fy + fh - 12 - (3 - b) * 13;
      parts.push(`<ellipse cx="${rx}" cy="${beadY}" rx="11" ry="6" fill="${beadCol}" stroke="${darken(beadCol, 0.4)}" stroke-width="1"/>`);
    }
  }

  parts.push(badge(W / 2, H - 15, `القيمة: ${val}`, { font, size: 11, bg: frameCol }));
  return wrapSvg(parts.join(''), W, H, `معداد — ${val}`, opts);
}

// ------------------------------------------------------------
// 13. نقطة في معلم (Coordinate Point)
// ------------------------------------------------------------
export function renderCoordinatePoint(spec: CoordinatePointSpec, opts?: RenderOptions): string {
  const W = 210, H = 210, id = `pt-${uid()}`, font = resolveFont(opts);
  const px = spec.x ?? 3;
  const py = spec.y ?? 2;
  const ptName = spec.label ?? 'A';
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const axisCol = isPrint ? '#0f172a' : '#334155';
  const ptCol = isPrint ? '#0f172a' : '#ef4444';
  const gridCol = '#e2e8f0';
  const cx = 105, cy = 105, scale = 16;
  const parts: string[] = [];

  parts.push(`<defs>${shadowDef(`${id}-sh`, 2, 3)}</defs>`);

  for (let g = -5; g <= 5; g++) {
    const gx = cx + g * scale;
    const gy = cy - g * scale;
    parts.push(`<line x1="${gx}" y1="20" x2="${gx}" y2="${H - 25}" stroke="${gridCol}" stroke-width="0.8"/>`);
    parts.push(`<line x1="20" y1="${gy}" x2="${W - 20}" y2="${gy}" stroke="${gridCol}" stroke-width="0.8"/>`);
  }

  parts.push(`<line x1="20" y1="${cy}" x2="${W - 15}" y2="${cy}" stroke="${axisCol}" stroke-width="1.8"/>`);
  parts.push(`<polygon points="${W - 15},${cy - 3} ${W - 8},${cy} ${W - 15},${cy + 3}" fill="${axisCol}"/>`);
  parts.push(`<line x1="${cx}" y1="${H - 20}" x2="${cx}" y2="15" stroke="${axisCol}" stroke-width="1.8"/>`);
  parts.push(`<polygon points="${cx - 3},15 ${cx},8 ${cx + 3},15" fill="${axisCol}"/>`);
  parts.push(`<text x="${W - 18}" y="${cy + 15}" font-size="10" font-family="${font}" fill="${axisCol}">x</text>`);
  parts.push(`<text x="${cx - 15}" y="18" font-size="10" font-family="${font}" fill="${axisCol}">y</text>`);
  parts.push(`<text x="${cx - 10}" y="${cy + 12}" font-size="9" font-family="${font}" fill="${axisCol}">O</text>`);

  const targetX = cx + px * scale;
  const targetY = cy - py * scale;

  parts.push(`<line x1="${targetX}" y1="${targetY}" x2="${targetX}" y2="${cy}" stroke="${ptCol}" stroke-width="1.2" stroke-dasharray="3 3"/>`);
  parts.push(`<line x1="${targetX}" y1="${targetY}" x2="${cx}" y2="${targetY}" stroke="${ptCol}" stroke-width="1.2" stroke-dasharray="3 3"/>`);
  parts.push(`<circle cx="${targetX}" cy="${targetY}" r="5" fill="${ptCol}" filter="url(#${id}-sh)"/>`);
  parts.push(`<text x="${targetX + 8}" y="${targetY - 6}" font-size="12" font-family="${font}" font-weight="bold" fill="${ptCol}">${ptName}(${px}, ${py})</text>`);

  return wrapSvg(parts.join(''), W, H, `نقطة ${ptName}(${px}, ${py}) في معلم`, opts);
}
