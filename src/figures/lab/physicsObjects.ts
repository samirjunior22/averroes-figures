// ============================================================
// lab/physicsObjects — كائنات الفيزياء المفردة للسبورة
// ============================================================
// بطارية، مقاومة، قاطعة، مصباح، مقياس (أمبير/فولط)، سلك، جسم/كتلة،
// متّجه (قوة/ثقل/سرعة…)، كرة مكهربة، موجة.
// الرموز الكهربائية تبقى رموزاً معيارية (تُقرأ كرموز في المنهاج) داخل إطار
// ناعم؛ الأجسام (بطارية/كرة/كتلة) واقعية بتدرّجات.
// ============================================================

import { z } from 'zod';
import { wrapSvg, type RenderOptions, resolveFont } from '../shared.js';
import {
  LAB_COLORS,
  uid,
  glossSphere,
  cylinder,
  badge,
  label,
  arrow3d,
  vectorName,
  linGrad,
  metalGrad,
  shadowDef,
  glowDef,
  lighten,
  darken,
  fmt,
} from './style.js';

// ------------------------------------------------------------
// المخطّطات
// ------------------------------------------------------------
const short = z.string().max(8);

export const batterySpecSchema = z.object({
  kind: z.literal('battery'),
  voltage: z.number().positive().max(1000).optional(),
  label: short.optional(),
}).strict();

export const resistorSpecSchema = z.object({
  kind: z.literal('resistor'),
  value: z.number().min(0).max(1e9).optional(),
  label: short.optional(),
}).strict();

export const switchSpecSchema = z.object({
  kind: z.literal('switch'),
  label: short.optional(),
  closed: z.boolean().optional(),
}).strict();

export const lampSpecSchema = z.object({
  kind: z.literal('lamp'),
  label: short.optional(),
  on: z.boolean().optional(),
}).strict();

export const meterSpecSchema = z.object({
  kind: z.literal('meter'),
  type: z.enum(['ammeter', 'voltmeter']).optional(),
  reading: z.number().min(0).max(1e6).optional(),
  label: short.optional(),
}).strict();

export const wireSpecSchema = z.object({
  kind: z.literal('wire'),
  label: short.optional(),
}).strict();

export const bodySpecSchema = z.object({
  kind: z.literal('body'),
  value: z.number().min(0).max(1e9).optional(),
  unit: z.string().max(6).optional(),
  shape: z.enum(['box', 'sphere', 'cylinder']).optional(),
  label: short.optional(),
  /** سرعة (m/s) — وجودها يرسم سهم سرعة: «جسم متحرك». */
  velocity: z.number().min(0).max(1e6).optional(),
}).strict();

export const vectorRoleSchema = z.enum(['force', 'weight', 'normal', 'velocity', 'acceleration', 'resultant', 'tension', 'friction']);
export type VectorRole = z.infer<typeof vectorRoleSchema>;

export const vectorSpecSchema = z.object({
  kind: z.literal('vector'),
  role: vectorRoleSchema.optional(),
  label: short.optional(),
  value: z.number().min(0).max(1e9).optional(),
  unit: z.string().max(6).optional(),
  /** الزاوية بالدرجات، عكس عقارب الساعة من الأفق (اصطلاح الرياضيات). */
  angle: z.number().min(-360).max(360).optional(),
  length: z.number().min(30).max(400).optional(),
}).strict();

export const chargedSphereSpecSchema = z.object({
  kind: z.literal('charged_sphere'),
  charge: z.enum(['positive', 'negative', 'neutral']).optional(),
  count: z.number().int().min(1).max(12).optional(),
  label: short.optional(),
}).strict();

export const waveSpecSchema = z.object({
  kind: z.literal('wave'),
  type: z.enum(['general', 'transverse', 'longitudinal']).optional(),
  amplitude: z.number().min(5).max(60).optional(),
  wavelength: z.number().min(30).max(200).optional(),
  cycles: z.number().min(1).max(8).optional(),
  showLabels: z.boolean().optional(),
}).strict();

export type BatterySpec = z.infer<typeof batterySpecSchema>;
export type ResistorSpec = z.infer<typeof resistorSpecSchema>;
export type SwitchSpec = z.infer<typeof switchSpecSchema>;
export type LampSpec = z.infer<typeof lampSpecSchema>;
export type MeterSpec = z.infer<typeof meterSpecSchema>;
export type WireSpec = z.infer<typeof wireSpecSchema>;
export type BodySpec = z.infer<typeof bodySpecSchema>;
export type VectorSpec = z.infer<typeof vectorSpecSchema>;
export type ChargedSphereSpec = z.infer<typeof chargedSphereSpecSchema>;
export type WaveSpec = z.infer<typeof waveSpecSchema>;

// ------------------------------------------------------------
// مساعدات محلية
// ------------------------------------------------------------
const SYMBOL = '#334155';
const wireAttr = `stroke="${SYMBOL}" stroke-width="2.5" stroke-linecap="round" fill="none"`;

/** إطار «بطاقة» ناعم خلف الرموز الكهربائية. */
function card(W: number, H: number, id: string): string {
  return (
    `<defs>${linGrad(`${id}-card`, [[0, '#ffffff'], [1, '#f1f5f9']])}${shadowDef(`${id}-cardsh`, 2, 3)}</defs>` +
    `<rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="12" fill="url(#${id}-card)" stroke="#e2e8f0" filter="url(#${id}-cardsh)"/>`
  );
}

// ------------------------------------------------------------
// بطارية واقعية — جسم أسطواني: قطب موجب برتقالي + جسم داكن + نتوء سالب
// ------------------------------------------------------------
export function renderBattery(spec: BatterySpec, opts?: RenderOptions): string {
  const W = 220;
  const H = 110;
  const id = `bat-${uid()}`;
  const font = resolveFont(opts);
  const v = spec.voltage ?? 1.5;
  const name = spec.label ?? 'E';
  const x = 28;
  const y = 30;
  const w = 160;
  const h = 52;
  const capW = 42;
  const parts: string[] = [];
  parts.push(
    `<defs>${metalGrad(`${id}-body`, '#475569')}${metalGrad(`${id}-cap`, '#f97316')}${metalGrad(`${id}-nub`, '#94a3b8')}${shadowDef(`${id}-sh`, 3, 3)}</defs>`,
  );
  parts.push(`<g filter="url(#${id}-sh)">`);
  parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="url(#${id}-body)" stroke="#1e293b" stroke-width="1"/>`);
  parts.push(`<path d="M ${x + 7},${y} H ${x + capW} V ${y + h} H ${x + 7} A 7,7 0 0 1 ${x},${y + h - 7} V ${y + 7} A 7,7 0 0 1 ${x + 7},${y} Z" fill="url(#${id}-cap)"/>`);
  parts.push(`<rect x="${x + w}" y="${y + h / 2 - 9}" width="9" height="18" rx="2" fill="url(#${id}-nub)" stroke="#334155" stroke-width="1"/>`);
  parts.push(`</g>`);
  // لمعة علوية
  parts.push(`<rect x="${x + 4}" y="${y + 5}" width="${w - 8}" height="9" rx="4" fill="#ffffff" opacity="0.28"/>`);
  parts.push(label(x + capW / 2, y + h / 2 + 8, '+', { size: 24, color: '#ffffff', bold: true, halo: false }));
  parts.push(label(x + capW + (w - capW) / 2, y + h / 2 + 6, `${name} = ${fmt(v)} V`, { size: 16, color: '#ffffff', bold: true, italic: true, halo: false, font }));
  return wrapSvg(parts.join(''), W, H, `بطارية ${fmt(v)} فولط`, opts);
}

// ------------------------------------------------------------
// مقاومة (ناقل أومي): رمز مستطيل على سلك + شارة القيمة
// ------------------------------------------------------------
export function renderResistor(spec: ResistorSpec, opts?: RenderOptions): string {
  const W = 200;
  const H = 100;
  const id = `res-${uid()}`;
  const font = resolveFont(opts);
  const y = 48;
  const name = spec.label ?? 'R';
  const val = spec.value ?? 10;
  return wrapSvg(
    card(W, H, id) +
      `<defs>${linGrad(`${id}-fill`, [[0, '#fef3c7'], [1, '#fcd34d']])}</defs>` +
      `<line x1="20" y1="${y}" x2="70" y2="${y}" ${wireAttr}/>` +
      `<line x1="130" y1="${y}" x2="180" y2="${y}" ${wireAttr}/>` +
      `<rect x="70" y="${y - 12}" width="60" height="24" rx="3" fill="url(#${id}-fill)" stroke="${SYMBOL}" stroke-width="2.5"/>` +
      label(100, y - 20, name, { size: 14, bold: true, italic: true, font }) +
      badge(100, y + 32, `${name} = ${fmt(val)} Ω`, { font }),
    W,
    H,
    `مقاومة ${fmt(val)} أوم`,
    opts,
  );
}

// ------------------------------------------------------------
// قاطعة: نقطتان + ذراع (مفتوح مائل / مغلق أفقي)
// ------------------------------------------------------------
export function renderSwitch(spec: SwitchSpec, opts?: RenderOptions): string {
  const W = 200;
  const H = 100;
  const id = `sw-${uid()}`;
  const font = resolveFont(opts);
  const y = 52;
  const name = spec.label ?? 'K';
  const closed = spec.closed ?? false;
  const arm = closed
    ? `<line x1="78" y1="${y}" x2="122" y2="${y}" ${wireAttr} stroke-width="3"/>`
    : `<line x1="78" y1="${y}" x2="118" y2="${y - 24}" ${wireAttr} stroke-width="3"/>`;
  return wrapSvg(
    card(W, H, id) +
      `<line x1="20" y1="${y}" x2="78" y2="${y}" ${wireAttr}/>` +
      `<line x1="122" y1="${y}" x2="180" y2="${y}" ${wireAttr}/>` +
      arm +
      `<circle cx="78" cy="${y}" r="4" fill="${SYMBOL}"/><circle cx="122" cy="${y}" r="4" fill="${SYMBOL}"/>` +
      label(100, 22, name, { size: 14, bold: true, italic: true, font }) +
      badge(100, y + 30, closed ? `${name} مغلقة` : `${name} مفتوحة`, { font, bg: closed ? '#15803d' : '#b91c1c' }),
    W,
    H,
    closed ? 'قاطعة مغلقة' : 'قاطعة مفتوحة',
    opts,
  );
}

// ------------------------------------------------------------
// مصباح: دائرة بصليب، يتوهّج أصفر عند التشغيل
// ------------------------------------------------------------
export function renderLamp(spec: LampSpec, opts?: RenderOptions): string {
  const W = 200;
  const H = 120;
  const id = `lamp-${uid()}`;
  const font = resolveFont(opts);
  const y = 56;
  const name = spec.label ?? 'L';
  const on = spec.on ?? false;
  const glow = on ? `<defs>${glowDef(`${id}-gl`, '#facc15', 6)}</defs><circle cx="100" cy="${y}" r="22" fill="#fde047" opacity="0.9" filter="url(#${id}-gl)"/>` : '';
  return wrapSvg(
    card(W, H, id) +
      `<line x1="20" y1="${y}" x2="78" y2="${y}" ${wireAttr}/>` +
      `<line x1="122" y1="${y}" x2="180" y2="${y}" ${wireAttr}/>` +
      glow +
      `<circle cx="100" cy="${y}" r="22" fill="${on ? '#fef9c3' : '#f8fafc'}" stroke="${SYMBOL}" stroke-width="2.5"/>` +
      `<line x1="85" y1="${y - 15}" x2="115" y2="${y + 15}" ${wireAttr}/><line x1="85" y1="${y + 15}" x2="115" y2="${y - 15}" ${wireAttr}/>` +
      label(100, 24, name, { size: 14, bold: true, italic: true, font }) +
      badge(100, y + 42, on ? `${name} مضاء` : `${name} مطفأ`, { font, bg: on ? '#ca8a04' : LAB_COLORS.badgeBg }),
    W,
    H,
    on ? 'مصباح مضاء' : 'مصباح مطفأ',
    opts,
  );
}

// ------------------------------------------------------------
// مقياس أمبير/فولط: دائرة بحرف + إبرة + شارة القراءة
// ------------------------------------------------------------
export function renderMeter(spec: MeterSpec, opts?: RenderOptions): string {
  const W = 200;
  const H = 130;
  const id = `met-${uid()}`;
  const font = resolveFont(opts);
  const type = spec.type ?? 'ammeter';
  const letter = type === 'ammeter' ? 'A' : 'V';
  const reading = spec.reading ?? 0;
  const name = spec.label ?? letter;
  const y = 58;
  const r = 30;
  // إبرة: تميل مع القراءة (تشبّع بصري عند 10 وحدات)
  const t = Math.min(1, reading / 10);
  const ang = -140 + 100 * t;
  const nx = 100 + Math.cos((ang * Math.PI) / 180) * (r - 6);
  const ny = y + Math.sin((ang * Math.PI) / 180) * (r - 6);
  const accent = type === 'ammeter' ? '#dc2626' : '#2563eb';
  return wrapSvg(
    card(W, H, id) +
      `<defs><radialGradient id="${id}-dial" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e2e8f0"/></radialGradient></defs>` +
      `<line x1="20" y1="${y}" x2="${100 - r}" y2="${y}" ${wireAttr}/>` +
      `<line x1="${100 + r}" y1="${y}" x2="180" y2="${y}" ${wireAttr}/>` +
      `<circle cx="100" cy="${y}" r="${r}" fill="url(#${id}-dial)" stroke="${accent}" stroke-width="3"/>` +
      `<path d="M ${100 - r + 8},${y - 4} A ${r - 8},${r - 8} 0 0 1 ${100 + r - 8},${y - 4}" stroke="#cbd5e1" stroke-width="2" fill="none"/>` +
      `<line x1="100" y1="${y + 8}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="#dc2626" stroke-width="1.5"/>` +
      label(100, y + 12, letter, { size: 22, bold: true, color: accent, halo: false, font }) +
      label(100, 20, name, { size: 13, bold: true, italic: true, font }) +
      badge(100, y + r + 22, `${fmt(reading)} ${letter}`, { font }),
    W,
    H,
    type === 'ammeter' ? 'مقياس الأمبير' : 'مقياس الفولط',
    opts,
  );
}

// ------------------------------------------------------------
// سلك كهربائي نحاسي بعزل، طرفاه عاريان
// ------------------------------------------------------------
export function renderWire(spec: WireSpec, opts?: RenderOptions): string {
  const W = 220;
  const H = 70;
  const id = `wire-${uid()}`;
  const font = resolveFont(opts);
  return wrapSvg(
    `<defs>${shadowDef(`${id}-sh`)}</defs>` +
      `<g filter="url(#${id}-sh)">` +
      `<path d="M 30,40 C 70,10 150,60 190,35" stroke="${LAB_COLORS.copper}" stroke-width="8" stroke-linecap="round" fill="none"/>` +
      `<path d="M 45,29 C 80,10 140,55 175,36" stroke="#dc2626" stroke-width="10" stroke-linecap="butt" fill="none"/>` +
      `<path d="M 45,27 C 80,8 140,53 175,34" stroke="#ffffff" stroke-width="3" stroke-linecap="butt" fill="none" opacity="0.35"/>` +
      `</g>` +
      (spec.label ? label(110, 62, spec.label, { size: 12, bold: true, font }) : ''),
    W,
    H,
    'سلك كهربائي',
    opts,
  );
}

// ------------------------------------------------------------
// جسم/كتلة (صندوق/كرة/أسطوانة) + سهم سرعة اختياري
// ------------------------------------------------------------
export function renderBody(spec: BodySpec, opts?: RenderOptions): string {
  const moving = spec.velocity !== undefined;
  const W = moving ? 260 : 200;
  const H = 170;
  const id = `body-${uid()}`;
  const font = resolveFont(opts);
  const shape = spec.shape ?? 'box';
  const value = spec.value ?? 200;
  const unit = spec.unit ?? 'g';
  const name = spec.label ?? 'm';
  const cx = 90;
  const cy = 80;
  const base = '#3b82f6';
  const parts: string[] = [];
  // أرضية
  parts.push(`<line x1="20" y1="${cy + 40}" x2="${W - 20}" y2="${cy + 40}" stroke="#94a3b8" stroke-width="2"/>`);
  if (shape === 'sphere') {
    parts.push(glossSphere(cx, cy + 4, 36, base, `${id}-sp`));
  } else if (shape === 'cylinder') {
    parts.push(cylinder(cx - 30, cy - 36, 60, 76, base, `${id}-cy`, 'v', 4));
    parts.push(`<ellipse cx="${cx}" cy="${cy - 36}" rx="30" ry="7" fill="${lighten(base, 0.45)}" stroke="${darken(base, 0.4)}"/>`);
  } else {
    parts.push(
      `<defs>${linGrad(`${id}-top`, [[0, lighten(base, 0.5)], [1, lighten(base, 0.2)]])}${linGrad(`${id}-front`, [[0, base], [1, darken(base, 0.25)]])}${linGrad(`${id}-side`, [[0, darken(base, 0.3)], [1, darken(base, 0.55)]], 'h')}${shadowDef(`${id}-sh`, 3, 3)}</defs>`,
    );
    const s = 60;
    const dpt = 16;
    const top = cy - s / 2 + 10;
    parts.push(`<g filter="url(#${id}-sh)">`);
    parts.push(`<rect x="${cx - s / 2}" y="${top}" width="${s}" height="${s}" fill="url(#${id}-front)" stroke="${darken(base, 0.5)}"/>`);
    parts.push(`<polygon points="${cx - s / 2},${top} ${cx - s / 2 + dpt},${top - dpt} ${cx + s / 2 + dpt},${top - dpt} ${cx + s / 2},${top}" fill="url(#${id}-top)" stroke="${darken(base, 0.5)}"/>`);
    parts.push(`<polygon points="${cx + s / 2},${top} ${cx + s / 2 + dpt},${top - dpt} ${cx + s / 2 + dpt},${top + s - dpt} ${cx + s / 2},${top + s}" fill="url(#${id}-side)" stroke="${darken(base, 0.5)}"/>`);
    parts.push(`</g>`);
  }
  parts.push(label(cx, cy + 12, name, { size: 20, bold: true, italic: true, color: '#ffffff', halo: false, font }));
  parts.push(badge(cx, cy + 62, `${name} = ${fmt(value)} ${unit}`, { font }));
  if (moving) {
    parts.push(arrow3d(cx + 50, cy - 10, cx + 140, cy - 10, '#10b981', `${id}-v`, 7));
    parts.push(vectorName(cx + 95, cy - 24, 'v', '#047857', 14));
    parts.push(badge(cx + 95, cy + 12, `v = ${fmt(spec.velocity ?? 0)} m/s`, { font, bg: '#047857', size: 10 }));
  }
  return wrapSvg(parts.join(''), W, H, moving ? 'جسم متحرك' : 'كتلة', opts);
}

// ------------------------------------------------------------
// متّجه: قوة/ثقل/رد فعل/سرعة/تسارع/محصلة/توتر/احتكاك
// ------------------------------------------------------------
const ROLES: Record<VectorRole, { name: string; color: string; unit: string; ar: string; angle: number }> = {
  force: { name: 'F', color: '#ef4444', unit: 'N', ar: 'قوة', angle: 0 },
  weight: { name: 'P', color: '#7c3aed', unit: 'N', ar: 'ثقل', angle: -90 },
  normal: { name: 'R', color: '#2563eb', unit: 'N', ar: 'رد فعل السطح', angle: 90 },
  velocity: { name: 'v', color: '#10b981', unit: 'm/s', ar: 'سرعة', angle: 0 },
  acceleration: { name: 'a', color: '#f59e0b', unit: 'm/s²', ar: 'تسارع', angle: 0 },
  resultant: { name: 'ΣF', color: '#0f172a', unit: 'N', ar: 'محصلة القوى', angle: 0 },
  tension: { name: 'T', color: '#0891b2', unit: 'N', ar: 'توتر الخيط', angle: 90 },
  friction: { name: 'f', color: '#b45309', unit: 'N', ar: 'احتكاك', angle: 180 },
};

export function renderVector(spec: VectorSpec, opts?: RenderOptions): string {
  const id = `vec-${uid()}`;
  const font = resolveFont(opts);
  const role = ROLES[spec.role ?? 'force'];
  const name = spec.label ?? role.name;
  const angle = spec.angle ?? role.angle;
  const len = spec.length ?? 110;
  const rad = (angle * Math.PI) / 180;
  const dx = Math.cos(rad) * len;
  const dy = -Math.sin(rad) * len;
  const PAD = 46;
  const W = Math.abs(dx) + PAD * 2;
  const H = Math.abs(dy) + PAD * 2 + 20;
  const x1 = dx >= 0 ? PAD : PAD - dx;
  const y1 = dy >= 0 ? PAD : PAD - dy;
  const x2 = x1 + dx;
  const y2 = y1 + dy;
  // الاسم عمودياً على السهم عند منتصفه، والشارة أسفل الإطار
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const nx = mx - Math.sin(rad) * 22;
  const ny = my - Math.cos(rad) * 22;
  const unit = spec.unit ?? role.unit;
  const val = spec.value !== undefined ? `${name} = ${fmt(spec.value)} ${unit}` : `${name} (${unit})`;
  return wrapSvg(
    `<circle cx="${x1}" cy="${y1}" r="4" fill="${role.color}"/>` +
      arrow3d(x1, y1, x2, y2, role.color, `${id}-a`, 8) +
      vectorName(nx, ny + 5, name, darken(role.color, 0.2), 15) +
      badge(W / 2, H - 14, val, { font, bg: darken(role.color, 0.2), size: 10 }),
    Math.round(W),
    Math.round(H),
    `متّجه ${role.ar}`,
    opts,
  );
}

// ------------------------------------------------------------
// كرة مكهربة: كرة لامعة بشحنات موزّعة على سطحها
// ------------------------------------------------------------
export function renderChargedSphere(spec: ChargedSphereSpec, opts?: RenderOptions): string {
  const W = 170;
  const H = 170;
  const id = `chs-${uid()}`;
  const font = resolveFont(opts);
  const charge = spec.charge ?? 'negative';
  const count = spec.count ?? 6;
  const cx = 85;
  const cy = 74;
  const r = 46;
  const base = charge === 'positive' ? '#fca5a5' : charge === 'negative' ? '#93c5fd' : '#cbd5e1';
  const sign = charge === 'positive' ? '+' : charge === 'negative' ? '−' : '';
  const signColor = charge === 'positive' ? LAB_COLORS.positive : LAB_COLORS.negative;
  const parts: string[] = [glossSphere(cx, cy, r, base, `${id}-sp`)];
  if (sign) {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 - Math.PI / 2;
      const px = cx + Math.cos(a) * r * 0.68;
      const py = cy + Math.sin(a) * r * 0.68;
      parts.push(`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="7" fill="#ffffff" stroke="${signColor}" stroke-width="1.5"/>`);
      parts.push(label(px, py + 4, sign, { size: 12, bold: true, color: signColor, halo: false, font }));
    }
  }
  const name = spec.label ?? 'q';
  const txt = charge === 'positive' ? `${name} > 0` : charge === 'negative' ? `${name} < 0` : `${name} = 0 (معتدلة)`;
  parts.push(badge(cx, H - 22, txt, { font, bg: charge === 'neutral' ? LAB_COLORS.badgeBg : signColor }));
  const ar = charge === 'positive' ? 'موجبة' : charge === 'negative' ? 'سالبة' : 'معتدلة';
  return wrapSvg(parts.join(''), W, H, `كرة مكهربة ${ar}`, opts);
}

// ------------------------------------------------------------
// موجة: عامة / عرضية (A, λ) / طولية (تضاغطات وتخلخلات)
// ------------------------------------------------------------
export function renderWave(spec: WaveSpec, opts?: RenderOptions): string {
  const id = `wave-${uid()}`;
  const font = resolveFont(opts);
  const type = spec.type ?? 'general';
  const A = spec.amplitude ?? 30;
  const lam = spec.wavelength ?? 80;
  const cycles = spec.cycles ?? 3;
  const showLabels = spec.showLabels ?? true;
  const PAD = 30;
  const W = Math.round(lam * cycles + PAD * 2);
  const H = Math.round(A * 2 + 90);
  const cy = A + 30;
  const x0 = PAD;
  const x1 = x0 + lam * cycles;
  const parts: string[] = [];
  parts.push(`<line x1="${x0 - 10}" y1="${cy}" x2="${x1 + 10}" y2="${cy}" stroke="#94a3b8" stroke-width="1" stroke-dasharray="4 4"/>`);
  if (type === 'longitudinal') {
    // خطوط عمودية تتكاثف عند التضاغط وتتباعد عند التخلخل.
    // لون صلب لا تدرّج: تدرّج objectBoundingBox على خطّ عرضه صفر «خادم طلاء»
    // غير صالح فيختفي الخطّ كلّه بلا خطأ.
    const n = Math.round(cycles * 16);
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const x = x0 + u * lam * cycles + Math.sin(u * cycles * Math.PI * 2) * (lam * 0.16);
      parts.push(`<line x1="${x.toFixed(1)}" y1="${cy - A}" x2="${x.toFixed(1)}" y2="${cy + A}" stroke="#475569" stroke-width="3" stroke-linecap="round"/>`);
    }
    if (showLabels) {
      parts.push(label(x0 + lam * 0.25, cy + A + 18, 'تضاغط', { size: 11, bold: true, color: '#b91c1c', font }));
      parts.push(label(x0 + lam * 0.75, cy + A + 18, 'تخلخل', { size: 11, bold: true, color: '#1d4ed8', font }));
    }
  } else {
    const pts: string[] = [];
    const n = Math.round(cycles * 40);
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const x = x0 + u * lam * cycles;
      const y = cy - Math.sin(u * cycles * Math.PI * 2) * A;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    parts.push(`<defs>${glowDef(`${id}-gl`, '#3b82f6', 2)}</defs>`);
    parts.push(`<polyline points="${pts.join(' ')}" fill="none" stroke="#2563eb" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#${id}-gl)"/>`);
    if (showLabels && type === 'transverse') {
      // السعة عند أوّل قمة
      const xa = x0 + lam / 4;
      parts.push(`<defs><marker id="${id}-mk" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#dc2626"/></marker></defs>`);
      parts.push(`<line x1="${xa}" y1="${cy}" x2="${xa}" y2="${cy - A}" stroke="#dc2626" stroke-width="1.5" marker-end="url(#${id}-mk)"/>`);
      parts.push(label(xa + 12, cy - A / 2 + 4, 'A', { size: 13, bold: true, italic: true, color: '#dc2626', font }));
      // طول الموجة بين قمّتين
      const xb = xa + lam;
      const yl = cy - A - 14;
      parts.push(`<line x1="${xa}" y1="${yl}" x2="${xb}" y2="${yl}" stroke="#059669" stroke-width="1.5"/>`);
      parts.push(`<line x1="${xa}" y1="${yl - 5}" x2="${xa}" y2="${yl + 5}" stroke="#059669" stroke-width="1.5"/><line x1="${xb}" y1="${yl - 5}" x2="${xb}" y2="${yl + 5}" stroke="#059669" stroke-width="1.5"/>`);
      parts.push(label((xa + xb) / 2, yl - 6, 'λ', { size: 14, bold: true, italic: true, color: '#059669', font }));
    }
  }
  const title = type === 'transverse' ? 'موجة عرضية' : type === 'longitudinal' ? 'موجة طولية' : 'موجة';
  if (showLabels) parts.push(badge(W / 2, H - 16, title, { font }));
  return wrapSvg(parts.join(''), W, H, title, opts);
}
