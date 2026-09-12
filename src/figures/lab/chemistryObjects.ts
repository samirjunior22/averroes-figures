// ============================================================
// lab/chemistryObjects — زجاجيات وأدوات المخبر الكيميائي
// ============================================================
// وعاء زجاجي (بيشر/دورق/إرلنماير/أنبوب اختبار/ماصّة) بسائل قابل الضبط،
// موقد بنسن، تسخين (بيشر على حامل فوق موقد)، محرار، ميزان إلكتروني،
// قمع ترشيح، ورق ترشيح.
// ============================================================

import { z } from 'zod';
import { wrapSvg, type RenderOptions, resolveFont } from '../shared.js';
import { LAB_COLORS, uid, vessel, flame, stand, badge, label, cylinder, linGrad, metalGrad, shadowDef, lighten, darken, fmt, type VesselBox } from './style.js';

// ------------------------------------------------------------
// المخطّطات
// ------------------------------------------------------------
const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const glasswareShapeSchema = z.enum(['beaker', 'flask', 'erlenmeyer', 'test_tube', 'pipette']);
export type GlasswareShape = z.infer<typeof glasswareShapeSchema>;

export const glasswareSpecSchema = z.object({
  kind: z.literal('glassware'),
  shape: glasswareShapeSchema.optional(),
  /** مستوى السائل 0..100 %. */
  level: z.number().min(0).max(100).optional(),
  color: color.optional(),
  label: z.string().max(20).optional(),
  /** سعة معروضة على الزجاج (mL). */
  volume: z.number().positive().max(10000).optional(),
}).strict();

export const burnerSpecSchema = z.object({
  kind: z.literal('burner'),
  lit: z.boolean().optional(),
}).strict();

export const heatingSpecSchema = z.object({
  kind: z.literal('heating'),
  level: z.number().min(0).max(100).optional(),
  color: color.optional(),
  label: z.string().max(20).optional(),
  lit: z.boolean().optional(),
}).strict();

export const thermometerSpecSchema = z
  .object({
    kind: z.literal('thermometer'),
    value: z.number().min(-100).max(500).optional(),
    min: z.number().min(-100).max(500).optional(),
    max: z.number().min(-100).max(500).optional(),
  })
  .strict()
  .refine((s) => (s.max ?? 110) > (s.min ?? -10), { message: 'max must be > min' });

export const balanceSpecSchema = z.object({
  kind: z.literal('balance'),
  reading: z.number().min(0).max(1e6).optional(),
  unit: z.string().max(4).optional(),
}).strict();

export const funnelSpecSchema = z.object({
  kind: z.literal('funnel'),
  label: z.string().max(20).optional(),
}).strict();

export const filterPaperSpecSchema = z.object({
  kind: z.literal('filter_paper'),
  label: z.string().max(20).optional(),
}).strict();

export type GlasswareSpec = z.infer<typeof glasswareSpecSchema>;
export type BurnerSpec = z.infer<typeof burnerSpecSchema>;
export type HeatingSpec = z.infer<typeof heatingSpecSchema>;
export type ThermometerSpec = z.infer<typeof thermometerSpecSchema>;
export type BalanceSpec = z.infer<typeof balanceSpecSchema>;
export type FunnelSpec = z.infer<typeof funnelSpecSchema>;
export type FilterPaperSpec = z.infer<typeof filterPaperSpecSchema>;

// ------------------------------------------------------------
// أشكال الأوعية: مسار الزجاج + صندوق السائل + أبعاد اللوحة
// ------------------------------------------------------------
interface VesselShape {
  d: string;
  box: VesselBox;
  W: number;
  H: number;
  ar: string;
  /** زخارف تُرسم فوق الزجاج (فوهة، تدريج). */
  extra?: string;
}

const SHAPES: Record<GlasswareShape, VesselShape> = {
  beaker: {
    W: 130,
    H: 165,
    ar: 'بيشر',
    d: 'M 20,20 L 20,137 Q 20,145 28,145 L 102,145 Q 110,145 110,137 L 110,20',
    box: { x: 20, y: 20, w: 90, h: 125 },
    extra:
      `<path d="M 20,20 L 13,13" stroke="${LAB_COLORS.glassStroke}" stroke-width="2" stroke-linecap="round"/>` +
      [60, 80, 100, 120].map((y) => `<line x1="96" y1="${y}" x2="106" y2="${y}" stroke="#64748b" stroke-width="1.2"/>`).join(''),
  },
  flask: {
    W: 140,
    H: 190,
    ar: 'دورق',
    d: 'M 58,15 L 58,95 C 58,110 22,118 22,140 C 22,172 118,172 118,140 C 118,118 82,110 82,95 L 82,15',
    box: { x: 22, y: 15, w: 96, h: 150 },
    extra: `<line x1="54" y1="15" x2="86" y2="15" stroke="${LAB_COLORS.glassStroke}" stroke-width="3" stroke-linecap="round"/>`,
  },
  erlenmeyer: {
    W: 150,
    H: 190,
    ar: 'دورق إرلنماير',
    d: 'M 60,15 L 60,60 L 20,160 Q 18,170 28,170 L 122,170 Q 132,170 130,160 L 90,60 L 90,15',
    box: { x: 18, y: 15, w: 114, h: 155 },
    extra: `<line x1="56" y1="15" x2="94" y2="15" stroke="${LAB_COLORS.glassStroke}" stroke-width="3" stroke-linecap="round"/>`,
  },
  test_tube: {
    W: 70,
    H: 190,
    ar: 'أنبوب اختبار',
    d: 'M 22,15 L 22,150 A 13,13 0 0 0 48,150 L 48,15',
    box: { x: 22, y: 15, w: 26, h: 148 },
    extra: `<line x1="17" y1="15" x2="53" y2="15" stroke="${LAB_COLORS.glassStroke}" stroke-width="3" stroke-linecap="round"/>`,
  },
  pipette: {
    W: 60,
    H: 225,
    ar: 'ماصّة',
    d: 'M 25,10 L 25,80 C 25,90 12,95 12,115 C 12,135 25,140 25,150 L 25,195 L 30,212 L 35,195 L 35,150 C 35,140 48,135 48,115 C 48,95 35,90 35,80 L 35,10',
    box: { x: 12, y: 10, w: 36, h: 202 },
    extra: `<line x1="18" y1="60" x2="42" y2="60" stroke="#b91c1c" stroke-width="1.5"/>`,
  },
};

/** يرسم وعاءً مع سائله وزخارفه عند نقطة الأصل. */
function drawVessel(shape: GlasswareShape, level: number, liquid: string, id: string, volume?: number, font = 'sans-serif'): string {
  const s = SHAPES[shape];
  const parts: string[] = [vessel(s.d, s.box, level, liquid, id)];
  if (s.extra) parts.push(s.extra);
  if (volume !== undefined && shape !== 'pipette') {
    parts.push(label(s.box.x + s.box.w - 8, s.box.y + s.box.h - 8, `${fmt(volume)} mL`, { size: 9, color: '#475569', anchor: 'end', font }));
  }
  return parts.join('');
}

// ------------------------------------------------------------
// وعاء زجاجي
// ------------------------------------------------------------
export function renderGlassware(spec: GlasswareSpec, opts?: RenderOptions): string {
  const id = `gl-${uid()}`;
  const font = resolveFont(opts);
  const shape = spec.shape ?? 'beaker';
  const s = SHAPES[shape];
  const level = spec.level ?? 50;
  const liquid = spec.color ?? LAB_COLORS.liquid;
  const W = s.W;
  const H = s.H + (spec.label ? 26 : 0);
  const parts: string[] = [drawVessel(shape, level, liquid, id, spec.volume, font)];
  if (spec.label) parts.push(badge(W / 2, H - 14, spec.label, { font, size: 10 }));
  return wrapSvg(parts.join(''), W, H, `${s.ar}${spec.label ? ` — ${spec.label}` : ''}`, opts);
}

// ------------------------------------------------------------
// موقد بنسن
// ------------------------------------------------------------
/** جسم الموقد بأصله عند (cx, baseY) — يُعاد استعماله في التسخين. */
function burnerBody(cx: number, baseY: number, id: string, lit: boolean, flameH: number): string {
  const parts: string[] = [];
  parts.push(`<defs>${metalGrad(`${id}-base`, '#334155', 'h')}${metalGrad(`${id}-tube`, LAB_COLORS.metal, 'h')}${shadowDef(`${id}-sh`, 3, 3)}</defs>`);
  parts.push(`<ellipse cx="${cx}" cy="${baseY}" rx="40" ry="9" fill="url(#${id}-base)" filter="url(#${id}-sh)"/>`);
  parts.push(`<rect x="${cx - 12}" y="${baseY - 88}" width="24" height="88" fill="url(#${id}-tube)" stroke="#475569" stroke-width="1"/>`);
  parts.push(`<rect x="${cx - 18}" y="${baseY - 92}" width="36" height="14" rx="3" fill="url(#${id}-base)"/>`);
  parts.push(`<rect x="${cx - 7}" y="${baseY - 118}" width="14" height="28" fill="url(#${id}-tube)" stroke="#475569" stroke-width="1"/>`);
  // صنبور الغاز
  parts.push(`<rect x="${cx + 12}" y="${baseY - 40}" width="16" height="7" rx="2" fill="#fbbf24" stroke="#b45309"/>`);
  if (lit) parts.push(flame(cx, baseY - 118, flameH, `${id}-fl`));
  return parts.join('');
}

export function renderBurner(spec: BurnerSpec, opts?: RenderOptions): string {
  const W = 130;
  const H = 210;
  const id = `bn-${uid()}`;
  const lit = spec.lit ?? true;
  return wrapSvg(burnerBody(65, 190, id, lit, 58), W, H, lit ? 'موقد بنسن مشتعل' : 'موقد بنسن مطفأ', opts);
}

// ------------------------------------------------------------
// تسخين: بيشر على حامل فوق موقد
// ------------------------------------------------------------
export function renderHeating(spec: HeatingSpec, opts?: RenderOptions): string {
  const W = 220;
  const H = 290;
  const id = `ht-${uid()}`;
  const font = resolveFont(opts);
  const lit = spec.lit ?? true;
  const level = spec.level ?? 55;
  const liquid = spec.color ?? '#4ade80';
  const cx = 110;
  const plateY = 150;
  const baseY = 260;
  const parts: string[] = [];
  parts.push(stand(cx, plateY, baseY, 110, `${id}-st`));
  // الموقد أطول من الحامل بحجمه الأصلي (118px) فيُصغَّر ليدخل تحت الصفيحة
  // ويبقى اللهب يلامس قاع البيشر.
  const k = 0.62;
  parts.push(`<g transform="translate(${cx},${baseY - 4}) scale(${k}) translate(${-cx},${-(baseY - 4)})">${burnerBody(cx, baseY - 4, `${id}-bn`, lit, 42 / k)}</g>`);
  // البيشر يجلس على الصفيحة: قاعه عند y=145 في إحداثياته
  parts.push(`<g transform="translate(${cx - 65}, ${plateY - 145})">${drawVessel('beaker', level, liquid, `${id}-bk`, undefined, font)}</g>`);
  if (spec.label) {
    const top = plateY - 125 + 125 * (1 - level / 100);
    parts.push(label(cx, (top + plateY) / 2 + 5, spec.label, { size: 13, bold: true, color: darken(liquid, 0.55), font }));
  }
  return wrapSvg(parts.join(''), W, H, `تسخين${spec.label ? ` ${spec.label}` : ''}`, opts);
}

// ------------------------------------------------------------
// محرار مخبري
// ------------------------------------------------------------
export function renderThermometer(spec: ThermometerSpec, opts?: RenderOptions): string {
  const W = 90;
  const H = 240;
  const id = `th-${uid()}`;
  const font = resolveFont(opts);
  const min = spec.min ?? -10;
  const max = spec.max ?? 110;
  const value = Math.max(min, Math.min(max, spec.value ?? 25));
  const top = 22;
  const bottom = 178;
  const t = (value - min) / (max - min);
  const yv = bottom - t * (bottom - top);
  const cx = 38;
  const parts: string[] = [];
  parts.push(`<defs>${linGrad(`${id}-glass`, [[0, '#f8fafc'], [0.5, '#e2e8f0'], [1, '#cbd5e1']], 'h')}${linGrad(`${id}-hg`, [[0, '#f87171'], [1, '#b91c1c']], 'h')}${shadowDef(`${id}-sh`, 2, 3)}</defs>`);
  parts.push(`<rect x="${cx - 9}" y="${top - 8}" width="18" height="${bottom - top + 16}" rx="9" fill="url(#${id}-glass)" stroke="#94a3b8" stroke-width="1.5" filter="url(#${id}-sh)"/>`);
  parts.push(`<rect x="${cx - 3.5}" y="${yv}" width="7" height="${bottom - yv + 10}" fill="url(#${id}-hg)"/>`);
  parts.push(`<circle cx="${cx}" cy="${bottom + 18}" r="16" fill="url(#${id}-hg)" stroke="#991b1b" stroke-width="1.5" filter="url(#${id}-sh)"/>`);
  parts.push(`<ellipse cx="${cx - 5}" cy="${bottom + 12}" rx="4" ry="2.5" fill="#ffffff" opacity="0.5"/>`);
  // التدريج
  for (let i = 0; i <= 10; i++) {
    const y = bottom - (i / 10) * (bottom - top);
    const major = i % 5 === 0;
    parts.push(`<line x1="${cx + 11}" y1="${y}" x2="${cx + (major ? 20 : 16)}" y2="${y}" stroke="#475569" stroke-width="${major ? 1.5 : 1}"/>`);
    if (major) parts.push(label(cx + 24, y + 3.5, fmt(min + (i / 10) * (max - min)), { size: 9, color: '#475569', anchor: 'start', font }));
  }
  parts.push(badge(W / 2 + 6, H - 12, `${fmt(value)} °C`, { font, size: 11, bg: '#b91c1c' }));
  return wrapSvg(parts.join(''), W, H, `محرار ${fmt(value)} درجة`, opts);
}

// ------------------------------------------------------------
// ميزان إلكتروني
// ------------------------------------------------------------
export function renderBalance(spec: BalanceSpec, opts?: RenderOptions): string {
  const W = 210;
  const H = 150;
  const id = `bal-${uid()}`;
  const font = resolveFont(opts);
  const reading = spec.reading ?? 0;
  const unit = spec.unit ?? 'g';
  const parts: string[] = [];
  parts.push(`<defs>${linGrad(`${id}-body`, [[0, '#f1f5f9'], [1, '#cbd5e1']])}${linGrad(`${id}-lcd`, [[0, '#166534'], [1, '#14532d']])}${shadowDef(`${id}-sh`, 3, 3)}</defs>`);
  parts.push(`<rect x="30" y="60" width="150" height="70" rx="10" fill="url(#${id}-body)" stroke="#94a3b8" stroke-width="1.5" filter="url(#${id}-sh)"/>`);
  parts.push(cylinder(45, 40, 120, 14, '#94a3b8', `${id}-plate`, 'h', 5));
  parts.push(`<rect x="90" y="54" width="30" height="8" fill="#64748b"/>`);
  parts.push(`<rect x="52" y="78" width="106" height="34" rx="5" fill="url(#${id}-lcd)" stroke="#052e16" stroke-width="1.5"/>`);
  parts.push(label(105, 101, `${reading.toFixed(2)} ${unit}`, { size: 18, bold: true, color: '#bbf7d0', halo: false, font }));
  parts.push(`<circle cx="45" cy="118" r="4" fill="#3b82f6"/><circle cx="58" cy="118" r="4" fill="#ef4444"/>`);
  parts.push(label(150, 122, 'TARE', { size: 7, color: '#475569', halo: false, font }));
  return wrapSvg(parts.join(''), W, H, `ميزان إلكتروني ${reading.toFixed(2)} ${unit}`, opts);
}

// ------------------------------------------------------------
// قمع ترشيح
// ------------------------------------------------------------
export function renderFunnel(spec: FunnelSpec, opts?: RenderOptions): string {
  const W = 140;
  const H = spec.label ? 190 : 165;
  const id = `fn-${uid()}`;
  const font = resolveFont(opts);
  const d = 'M 20,28 L 120,28 L 78,98 L 78,150 L 62,150 L 62,98 Z';
  const parts: string[] = [];
  parts.push(`<defs>${linGrad(`${id}-g`, [[0, '#ffffff', 0.7], [0.5, '#e0f2fe', 0.35], [1, '#ffffff', 0.55]], 'h')}${shadowDef(`${id}-sh`, 3, 3)}</defs>`);
  parts.push(`<path d="${d}" fill="url(#${id}-g)" stroke="${LAB_COLORS.glassStroke}" stroke-width="2" stroke-linejoin="round" filter="url(#${id}-sh)"/>`);
  parts.push(`<ellipse cx="70" cy="28" rx="50" ry="7" fill="#e0f2fe" fill-opacity="0.5" stroke="${LAB_COLORS.glassStroke}" stroke-width="2"/>`);
  if (spec.label) parts.push(badge(W / 2, H - 14, spec.label, { font, size: 10 }));
  return wrapSvg(parts.join(''), W, H, 'قمع ترشيح', opts);
}

// ------------------------------------------------------------
// ورق ترشيح (دائرة مطويّة ربعاً)
// ------------------------------------------------------------
export function renderFilterPaper(spec: FilterPaperSpec, opts?: RenderOptions): string {
  const W = 150;
  const H = spec.label ? 170 : 150;
  const id = `fp-${uid()}`;
  const font = resolveFont(opts);
  const cx = 75;
  const cy = 72;
  const r = 58;
  const parts: string[] = [];
  parts.push(`<defs><radialGradient id="${id}-p" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e7e5e4"/></radialGradient>${shadowDef(`${id}-sh`, 2, 3)}</defs>`);
  parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}-p)" stroke="#a8a29e" stroke-width="1.5" filter="url(#${id}-sh)"/>`);
  parts.push(`<path d="M ${cx},${cy} L ${cx + r},${cy} A ${r},${r} 0 0 1 ${cx},${cy + r} Z" fill="${lighten('#d6d3d1', 0.2)}" stroke="#a8a29e" stroke-width="1.5"/>`);
  parts.push(`<line x1="${cx}" y1="${cy - r}" x2="${cx}" y2="${cy + r}" stroke="#a8a29e" stroke-width="1" stroke-dasharray="3 3"/>`);
  parts.push(`<line x1="${cx - r}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="#a8a29e" stroke-width="1" stroke-dasharray="3 3"/>`);
  if (spec.label) parts.push(badge(W / 2, H - 14, spec.label, { font, size: 10 }));
  return wrapSvg(parts.join(''), W, H, 'ورق ترشيح', opts);
}
