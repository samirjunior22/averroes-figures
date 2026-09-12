// ============================================================
// lab/biologyObjects — كائنات العلوم الطبيعية المفردة
// ============================================================
// خلية (حيوانية/نباتية)، مجهر، طبق بتري، عدسة مكبّرة، نبتة كاملة، بذرة
// (مراحل الإنبات)، ورقة نبات. مشاهد الأجهزة الكاملة تبقى في `biology.ts`.
// ============================================================

import { z } from 'zod';
import { wrapSvg, type RenderOptions, resolveFont } from '../shared.js';
import { LAB_COLORS, uid, glossSphere, badge, label, linGrad, metalGrad, shadowDef, lighten, darken } from './style.js';

// ------------------------------------------------------------
// المخطّطات
// ------------------------------------------------------------
export const cellSpecSchema = z.object({
  kind: z.literal('cell'),
  type: z.enum(['animal', 'plant']).optional(),
  labels: z.boolean().optional(),
}).strict();

export const microscopeSpecSchema = z.object({
  kind: z.literal('microscope'),
  label: z.string().max(20).optional(),
}).strict();

export const petriDishSpecSchema = z.object({
  kind: z.literal('petri_dish'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  label: z.string().max(20).optional(),
}).strict();

export const magnifierSpecSchema = z.object({
  kind: z.literal('magnifier'),
}).strict();

export const plantSpecSchema = z.object({
  kind: z.literal('plant'),
  labels: z.boolean().optional(),
}).strict();

export const seedSpecSchema = z.object({
  kind: z.literal('seed'),
  stage: z.number().int().min(1).max(4).optional(),
}).strict();

export const leafSpecSchema = z.object({
  kind: z.literal('leaf'),
  labels: z.boolean().optional(),
}).strict();

export type CellSpec = z.infer<typeof cellSpecSchema>;
export type MicroscopeSpec = z.infer<typeof microscopeSpecSchema>;
export type PetriDishSpec = z.infer<typeof petriDishSpecSchema>;
export type MagnifierSpec = z.infer<typeof magnifierSpecSchema>;
export type PlantSpec = z.infer<typeof plantSpecSchema>;
export type SeedSpec = z.infer<typeof seedSpecSchema>;
export type LeafSpec = z.infer<typeof leafSpecSchema>;

// ------------------------------------------------------------
// مساعدات
// ------------------------------------------------------------
/** خطّ إشارة من جزء إلى تسمية في عمود التسميات على اليمين. */
function callout(px: number, py: number, lx: number, ly: number, txt: string, font: string): string {
  return (
    `<line x1="${px}" y1="${py}" x2="${lx - 6}" y2="${ly - 4}" stroke="#64748b" stroke-width="1.2"/>` +
    `<circle cx="${px}" cy="${py}" r="2.5" fill="#64748b"/>` +
    label(lx, ly, txt, { size: 11, bold: true, anchor: 'start', font })
  );
}

const GREEN = '#22c55e';
const SOIL = '#92400e';

function soil(y: number, W: number, H: number, id: string): string {
  return `<defs>${linGrad(`${id}-soil`, [[0, '#b45309'], [1, '#78350f']])}</defs><rect x="0" y="${y}" width="${W}" height="${H - y}" rx="6" fill="url(#${id}-soil)"/>`;
}

function leafShape(x: number, y: number, len: number, angle: number, id: string, flip = false): string {
  const w = len * 0.42;
  const d = `M 0,0 C ${len * 0.3},${-w} ${len * 0.8},${-w} ${len},0 C ${len * 0.8},${w} ${len * 0.3},${w} 0,0 Z`;
  return (
    `<g transform="translate(${x},${y}) rotate(${angle})${flip ? ' scale(1,-1)' : ''}">` +
    `<path d="${d}" fill="url(#${id}-leaf)" stroke="${darken(GREEN, 0.4)}" stroke-width="1.2"/>` +
    `<line x1="0" y1="0" x2="${len * 0.9}" y2="0" stroke="${darken(GREEN, 0.35)}" stroke-width="1"/>` +
    `</g>`
  );
}

// ------------------------------------------------------------
// خلية حيوانية / نباتية
// ------------------------------------------------------------
export function renderCell(spec: CellSpec, opts?: RenderOptions): string {
  const id = `cell-${uid()}`;
  const font = resolveFont(opts);
  const type = spec.type ?? 'animal';
  const showLabels = spec.labels ?? true;
  const W = showLabels ? 330 : 230;
  const H = 225;
  const parts: string[] = [];
  const LX = 236;
  if (type === 'animal') {
    parts.push(`<defs><radialGradient id="${id}-cy" cx="0.4" cy="0.4" r="0.7"><stop offset="0" stop-color="#fff1f2"/><stop offset="1" stop-color="#fecdd3"/></radialGradient>${shadowDef(`${id}-sh`, 3, 4)}</defs>`);
    parts.push(`<path d="M 115,28 C 165,22 205,60 200,110 C 196,160 160,200 112,198 C 60,196 22,160 26,108 C 30,58 65,34 115,28 Z" fill="url(#${id}-cy)" stroke="#e11d48" stroke-width="3" filter="url(#${id}-sh)"/>`);
    parts.push(glossSphere(105, 108, 28, '#a855f7', `${id}-nu`));
    parts.push(`<circle cx="112" cy="102" r="7" fill="${darken('#a855f7', 0.4)}"/>`);
    // ميتوكوندري
    for (const [mx, my, rot] of [[160, 80, -25], [70, 150, 20]] as const) {
      parts.push(`<g transform="translate(${mx},${my}) rotate(${rot})"><ellipse rx="22" ry="11" fill="#fb923c" stroke="#c2410c" stroke-width="1.5"/><path d="M -14,0 Q -10,-6 -6,0 Q -2,6 2,0 Q 6,-6 10,0 Q 12,4 14,0" fill="none" stroke="#c2410c" stroke-width="1.2"/></g>`);
    }
    // فجوات صغيرة
    parts.push(`<circle cx="150" cy="150" r="9" fill="#e0f2fe" stroke="#7dd3fc"/><circle cx="60" cy="80" r="7" fill="#e0f2fe" stroke="#7dd3fc"/>`);
    if (showLabels) {
      parts.push(callout(198, 100, LX, 44, 'غشاء هيولي', font));
      parts.push(callout(118, 96, LX, 84, 'نواة', font));
      parts.push(callout(168, 82, LX, 124, 'ميتوكوندري', font));
      parts.push(callout(145, 135, LX, 164, 'هيولى (سيتوبلازم)', font));
      parts.push(callout(150, 152, LX, 204, 'فجوة', font));
    }
  } else {
    parts.push(`<defs>${linGrad(`${id}-cy`, [[0, '#f0fdf4'], [1, '#dcfce7']])}${linGrad(`${id}-vac`, [[0, '#e0f2fe'], [1, '#bae6fd']])}${linGrad(`${id}-chl`, [[0, lighten(GREEN, 0.3)], [1, darken(GREEN, 0.25)]])}${shadowDef(`${id}-sh`, 3, 4)}</defs>`);
    parts.push(`<rect x="24" y="24" width="182" height="178" rx="20" fill="#86efac" stroke="#15803d" stroke-width="4" filter="url(#${id}-sh)"/>`);
    parts.push(`<rect x="34" y="34" width="162" height="158" rx="14" fill="url(#${id}-cy)" stroke="#16a34a" stroke-width="1.5"/>`);
    parts.push(`<ellipse cx="128" cy="122" rx="52" ry="46" fill="url(#${id}-vac)" stroke="#38bdf8" stroke-width="1.5"/>`);
    parts.push(glossSphere(72, 74, 21, '#a855f7', `${id}-nu`));
    parts.push(`<circle cx="78" cy="70" r="5" fill="${darken('#a855f7', 0.4)}"/>`);
    for (const [cx, cy, rot] of [[60, 150, 30], [170, 60, -20], [60, 115, -40], [175, 172, 15]] as const) {
      parts.push(`<ellipse cx="${cx}" cy="${cy}" rx="15" ry="8" transform="rotate(${rot} ${cx} ${cy})" fill="url(#${id}-chl)" stroke="#15803d" stroke-width="1.2"/>`);
    }
    if (showLabels) {
      parts.push(callout(206, 60, LX, 44, 'جدار سيليلوزي', font));
      parts.push(callout(196, 100, LX, 84, 'غشاء هيولي', font));
      parts.push(callout(80, 66, LX, 124, 'نواة', font));
      parts.push(callout(150, 130, LX, 164, 'فجوة كبيرة', font));
      parts.push(callout(178, 172, LX, 204, 'صانعة خضراء', font));
    }
  }
  return wrapSvg(parts.join(''), W, H, type === 'animal' ? 'خلية حيوانية' : 'خلية نباتية', opts);
}

// ------------------------------------------------------------
// مجهر ضوئي
// ------------------------------------------------------------
export function renderMicroscope(spec: MicroscopeSpec, opts?: RenderOptions): string {
  const W = 180;
  const H = spec.label ? 255 : 235;
  const id = `mic-${uid()}`;
  const font = resolveFont(opts);
  const parts: string[] = [];
  parts.push(`<defs>${metalGrad(`${id}-m`, '#475569', 'h')}${metalGrad(`${id}-t`, LAB_COLORS.metal, 'h')}${metalGrad(`${id}-b`, '#334155')}${shadowDef(`${id}-sh`, 3, 4)}</defs>`);
  parts.push(`<g filter="url(#${id}-sh)">`);
  parts.push(`<rect x="28" y="200" width="124" height="20" rx="8" fill="url(#${id}-b)"/>`);
  // الذراع
  parts.push(`<path d="M 132,200 C 150,150 150,90 118,52" stroke="url(#${id}-m)" stroke-width="16" stroke-linecap="round" fill="none"/>`);
  // المنصّة
  parts.push(`<rect x="42" y="132" width="86" height="10" rx="3" fill="url(#${id}-m)"/>`);
  parts.push(`<rect x="70" y="128" width="30" height="4" fill="#bae6fd" stroke="#7dd3fc"/>`);
  // الأنبوب البصري + العينية + الشيئية
  parts.push(`<rect x="82" y="44" width="24" height="76" rx="4" fill="url(#${id}-t)" stroke="#475569"/>`);
  parts.push(`<rect x="78" y="24" width="32" height="22" rx="5" fill="url(#${id}-m)"/>`);
  parts.push(`<rect x="88" y="118" width="12" height="16" rx="2" fill="url(#${id}-m)"/>`);
  parts.push(`<rect x="72" y="112" width="44" height="8" rx="3" fill="url(#${id}-m)"/>`);
  // المرآة والمسمار
  parts.push(`<ellipse cx="85" cy="176" rx="16" ry="7" fill="#e0f2fe" stroke="#64748b" stroke-width="1.5"/>`);
  parts.push(`<circle cx="146" cy="120" r="9" fill="url(#${id}-m)" stroke="#1e293b"/>`);
  parts.push(`</g>`);
  if (spec.label) parts.push(badge(W / 2, H - 14, spec.label, { font, size: 10 }));
  return wrapSvg(parts.join(''), W, H, 'مجهر ضوئي', opts);
}

// ------------------------------------------------------------
// طبق بتري
// ------------------------------------------------------------
export function renderPetriDish(spec: PetriDishSpec, opts?: RenderOptions): string {
  const W = 190;
  const H = spec.label ? 150 : 125;
  const id = `pd-${uid()}`;
  const font = resolveFont(opts);
  const agar = spec.color ?? '#fde68a';
  const cx = 95;
  const parts: string[] = [];
  parts.push(`<defs>${linGrad(`${id}-side`, [[0, '#ffffff', 0.6], [1, '#cbd5e1', 0.5]])}${linGrad(`${id}-agar`, [[0, lighten(agar, 0.2)], [1, darken(agar, 0.15)]])}${shadowDef(`${id}-sh`, 3, 3)}</defs>`);
  parts.push(`<g filter="url(#${id}-sh)">`);
  parts.push(`<path d="M 20,60 L 20,86 A 75,22 0 0 0 170,86 L 170,60" fill="url(#${id}-side)" stroke="${LAB_COLORS.glassStroke}" stroke-width="1.5"/>`);
  parts.push(`<ellipse cx="${cx}" cy="66" rx="70" ry="18" fill="url(#${id}-agar)" stroke="${darken(agar, 0.3)}" stroke-width="1"/>`);
  parts.push(`<ellipse cx="${cx}" cy="60" rx="75" ry="22" fill="#ffffff" fill-opacity="0.25" stroke="${LAB_COLORS.glassStroke}" stroke-width="2"/>`);
  parts.push(`</g>`);
  for (const [x, y, r] of [[70, 62, 4], [110, 70, 5], [95, 58, 3], [130, 62, 3.5], [82, 74, 3]] as const) {
    parts.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${darken(agar, 0.45)}" opacity="0.8"/>`);
  }
  if (spec.label) parts.push(badge(W / 2, H - 14, spec.label, { font, size: 10 }));
  return wrapSvg(parts.join(''), W, H, 'طبق بتري', opts);
}

// ------------------------------------------------------------
// عدسة مكبّرة
// ------------------------------------------------------------
export function renderMagnifier(_spec: MagnifierSpec, opts?: RenderOptions): string {
  const W = 175;
  const H = 175;
  const id = `mg-${uid()}`;
  const parts: string[] = [];
  parts.push(`<defs><radialGradient id="${id}-g" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#ffffff" stop-opacity="0.9"/><stop offset="0.6" stop-color="#bae6fd" stop-opacity="0.45"/><stop offset="1" stop-color="#7dd3fc" stop-opacity="0.6"/></radialGradient>${metalGrad(`${id}-rim`, '#64748b')}${metalGrad(`${id}-h`, '#92400e', 'h')}${shadowDef(`${id}-sh`, 3, 4)}</defs>`);
  parts.push(`<g filter="url(#${id}-sh)">`);
  parts.push(`<line x1="108" y1="108" x2="156" y2="156" stroke="url(#${id}-h)" stroke-width="16" stroke-linecap="round"/>`);
  parts.push(`<circle cx="70" cy="70" r="52" fill="url(#${id}-g)" stroke="url(#${id}-rim)" stroke-width="8"/>`);
  parts.push(`</g>`);
  parts.push(`<path d="M 40,52 Q 52,34 72,32" stroke="#ffffff" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.8"/>`);
  return wrapSvg(parts.join(''), W, H, 'عدسة مكبّرة', opts);
}

// ------------------------------------------------------------
// نبتة كاملة: جذر، ساق، ورقة، زهرة
// ------------------------------------------------------------
export function renderPlant(spec: PlantSpec, opts?: RenderOptions): string {
  const id = `pl-${uid()}`;
  const font = resolveFont(opts);
  const showLabels = spec.labels ?? true;
  const W = showLabels ? 290 : 200;
  const H = 270;
  const cx = 100;
  const soilY = 200;
  const parts: string[] = [];
  parts.push(`<defs>${linGrad(`${id}-leaf`, [[0, lighten(GREEN, 0.25)], [1, darken(GREEN, 0.2)]])}${linGrad(`${id}-stem`, [[0, darken(GREEN, 0.1)], [1, darken(GREEN, 0.45)]], 'h')}</defs>`);
  parts.push(soil(soilY, 200, H, id));
  // الجذور
  parts.push(`<g stroke="${lighten(SOIL, 0.5)}" stroke-width="3" stroke-linecap="round" fill="none"><path d="M ${cx},${soilY} C ${cx - 5},${soilY + 30} ${cx - 20},${soilY + 40} ${cx - 40},${soilY + 55}"/><path d="M ${cx},${soilY} C ${cx + 5},${soilY + 30} ${cx + 20},${soilY + 40} ${cx + 45},${soilY + 50}"/><path d="M ${cx},${soilY} L ${cx + 2},${soilY + 60}"/><path d="M ${cx - 12},${soilY + 25} L ${cx - 30},${soilY + 30}"/><path d="M ${cx + 10},${soilY + 22} L ${cx + 28},${soilY + 20}"/></g>`);
  // الساق
  parts.push(`<path d="M ${cx},${soilY} C ${cx - 4},150 ${cx + 6},110 ${cx},62" stroke="url(#${id}-stem)" stroke-width="8" stroke-linecap="round" fill="none"/>`);
  // الأوراق
  parts.push(leafShape(cx - 2, 150, 52, 200, id));
  parts.push(leafShape(cx + 2, 112, 56, -30, id, true));
  // الزهرة
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const px = (cx + Math.cos(a) * 16).toFixed(1);
    const py = (52 + Math.sin(a) * 16).toFixed(1);
    parts.push(`<ellipse cx="${px}" cy="${py}" rx="11" ry="7" transform="rotate(${((a * 180) / Math.PI).toFixed(1)} ${px} ${py})" fill="#f472b6" stroke="#be185d" stroke-width="1"/>`);
  }
  parts.push(glossSphere(cx, 52, 9, '#facc15', `${id}-fc`, false));
  if (showLabels) {
    const LX = 212;
    parts.push(callout(cx + 20, 52, LX, 46, 'زهرة', font));
    parts.push(callout(cx + 40, 96, LX, 96, 'ورقة', font));
    parts.push(callout(cx + 4, 140, LX, 146, 'ساق', font));
    parts.push(callout(cx + 30, soilY + 40, LX, 236, 'جذر', font));
  }
  return wrapSvg(parts.join(''), W, H, 'نبتة كاملة', opts);
}

// ------------------------------------------------------------
// بذرة: مراحل الإنبات 1..4
// ------------------------------------------------------------
export function renderSeed(spec: SeedSpec, opts?: RenderOptions): string {
  const W = 170;
  const H = 210;
  const id = `sd-${uid()}`;
  const font = resolveFont(opts);
  const stage = spec.stage ?? 1;
  const cx = 85;
  const soilY = 120;
  const parts: string[] = [];
  parts.push(`<defs>${linGrad(`${id}-leaf`, [[0, lighten(GREEN, 0.25)], [1, darken(GREEN, 0.2)]])}${linGrad(`${id}-seed`, [[0, '#d97706'], [1, '#78350f']])}${shadowDef(`${id}-sh`, 2, 2)}</defs>`);
  parts.push(soil(soilY, W, H - 30, id));
  const sy = soilY + 30;
  parts.push(`<ellipse cx="${cx}" cy="${sy}" rx="16" ry="11" transform="rotate(-20 ${cx} ${sy})" fill="url(#${id}-seed)" stroke="#451a03" stroke-width="1.2" filter="url(#${id}-sh)"/>`);
  if (stage >= 2) {
    parts.push(`<path d="M ${cx + 8},${sy + 6} C ${cx + 12},${sy + 20} ${cx + 4},${sy + 30} ${cx + 8},${sy + 44}" stroke="#fef3c7" stroke-width="3" stroke-linecap="round" fill="none"/>`);
  }
  if (stage >= 3) {
    const topY = stage === 3 ? soilY - 14 : soilY - 60;
    parts.push(`<path d="M ${cx - 6},${sy - 6} C ${cx - 14},${sy - 30} ${cx - 4},${soilY} ${cx - 2},${topY}" stroke="${darken(GREEN, 0.2)}" stroke-width="4" stroke-linecap="round" fill="none"/>`);
    if (stage === 3) parts.push(`<circle cx="${cx - 2}" cy="${topY}" r="5" fill="${lighten(GREEN, 0.4)}" stroke="${darken(GREEN, 0.3)}"/>`);
  }
  if (stage >= 4) {
    parts.push(leafShape(cx - 2, soilY - 60, 34, 200, id));
    parts.push(leafShape(cx - 2, soilY - 60, 34, -20, id, true));
    parts.push(`<path d="M ${cx - 20},${sy - 12} L ${cx - 30},${sy + 10} M ${cx + 2},${sy + 8} L ${cx - 6},${sy + 34}" stroke="#fef3c7" stroke-width="2.5" stroke-linecap="round" fill="none"/>`);
  }
  const names = ['البذرة في التربة', 'ظهور الجذير', 'ظهور الساق', 'البادرة'];
  parts.push(badge(W / 2, H - 14, `${stage}. ${names[stage - 1]}`, { font, size: 10 }));
  return wrapSvg(parts.join(''), W, H, `إنبات — المرحلة ${stage}`, opts);
}

// ------------------------------------------------------------
// ورقة نبات: نصل، عرق رئيسي، عنق
// ------------------------------------------------------------
export function renderLeaf(spec: LeafSpec, opts?: RenderOptions): string {
  const id = `lf-${uid()}`;
  const font = resolveFont(opts);
  const showLabels = spec.labels ?? true;
  const W = showLabels ? 320 : 240;
  const H = 175;
  const parts: string[] = [];
  parts.push(`<defs>${linGrad(`${id}-leaf`, [[0, lighten(GREEN, 0.3)], [1, darken(GREEN, 0.25)]])}${shadowDef(`${id}-sh`, 3, 4)}</defs>`);
  parts.push(`<path d="M 38,86 L 12,98" stroke="${darken(GREEN, 0.35)}" stroke-width="5" stroke-linecap="round"/>`);
  parts.push(`<path d="M 36,86 C 66,22 186,22 220,86 C 186,150 66,150 36,86 Z" fill="url(#${id}-leaf)" stroke="${darken(GREEN, 0.4)}" stroke-width="1.5" filter="url(#${id}-sh)"/>`);
  parts.push(`<line x1="38" y1="86" x2="214" y2="86" stroke="${darken(GREEN, 0.45)}" stroke-width="2"/>`);
  for (let i = 1; i <= 5; i++) {
    const x = 50 + i * 26;
    parts.push(`<path d="M ${x},86 Q ${x + 12},${86 - 22} ${x + 30},${86 - 34}" stroke="${darken(GREEN, 0.4)}" stroke-width="1.2" fill="none"/>`);
    parts.push(`<path d="M ${x},86 Q ${x + 12},${86 + 22} ${x + 30},${86 + 34}" stroke="${darken(GREEN, 0.4)}" stroke-width="1.2" fill="none"/>`);
  }
  if (showLabels) {
    const LX = 244;
    parts.push(callout(150, 55, LX, 46, 'نصل', font));
    parts.push(callout(130, 86, LX, 92, 'عرق رئيسي', font));
    parts.push(callout(20, 95, LX, 140, 'عنق', font));
  }
  return wrapSvg(parts.join(''), W, H, 'ورقة نبات', opts);
}
