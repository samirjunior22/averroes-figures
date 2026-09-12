// ============================================================
// lab/atom — الذرّة (نموذج رذرفورد) وبطاقة العنصر والصيغة والرابطة
// ============================================================
// الذرّة تُحسب من Z وA: p⁺ = Z، n⁰ = A − Z، e⁻ = Z موزّعة على طبقات
// K/L/M… بالنموذج المدرسي [2, 8, 8, 18…]. الرمز والاسم يُملآن من جدول
// العناصر إن غابا في المواصفة.
// ============================================================

import { z } from 'zod';
import { wrapSvg, type RenderOptions, resolveFont } from '../shared.js';
import { LAB_COLORS, uid, glossSphere, badge, label, linGrad, shadowDef, lighten, darken, subscriptDigits, fmt } from './style.js';
import { elementByZ, elementBySymbol, shellDistribution, SHELL_NAMES } from './elements.js';

// ------------------------------------------------------------
// المخطّطات
// ------------------------------------------------------------
export const atomSpecSchema = z
  .object({
    kind: z.literal('atom'),
    /** العدد الذرّي (بروتونات). */
    Z: z.number().int().min(1).max(118).optional(),
    /** العدد الكتلي (نويّات). */
    A: z.number().int().min(1).max(300).optional(),
    symbol: z.string().max(3).optional(),
    name: z.string().max(24).optional(),
    showShells: z.boolean().optional(),
  })
  .strict()
  .refine((s) => s.A === undefined || s.A >= (s.Z ?? 6), { message: 'A must be ≥ Z' });

export const elementCardSpecSchema = z.object({
  kind: z.literal('element_card'),
  Z: z.number().int().min(1).max(118).optional(),
  symbol: z.string().max(3).optional(),
  name: z.string().max(24).optional(),
  mass: z.number().positive().max(400).optional(),
}).strict();

export const formulaSpecSchema = z.object({
  kind: z.literal('formula'),
  text: z.string().min(1).max(24).optional(),
  name: z.string().max(30).optional(),
}).strict();

export const bondSpecSchema = z.object({
  kind: z.literal('bond'),
  a: z.string().max(3).optional(),
  b: z.string().max(3).optional(),
  type: z.enum(['single', 'double', 'triple', 'ionic']).optional(),
}).strict();

export type AtomSpec = z.infer<typeof atomSpecSchema>;
export type ElementCardSpec = z.infer<typeof elementCardSpecSchema>;
export type FormulaSpec = z.infer<typeof formulaSpecSchema>;
export type BondSpec = z.infer<typeof bondSpecSchema>;

// ------------------------------------------------------------
// ألوان الذرّات (CPK مبسَّط) للرابطة
// ------------------------------------------------------------
const CPK: Record<string, string> = {
  H: '#e2e8f0', C: '#6b7280', N: '#3b82f6', O: '#ef4444', S: '#eab308', Cl: '#22c55e', Na: '#a855f7', F: '#06b6d4', K: '#8b5cf6', Mg: '#84cc16', Ca: '#f59e0b',
};

// ------------------------------------------------------------
// الذرّة
// ------------------------------------------------------------
/** يحلّ الرمز والاسم من المواصفة ثم من الجدول. */
function resolveElement(Z: number, symbol?: string, name?: string): { symbol: string; ar: string; en: string } {
  const info = elementByZ(Z) ?? (symbol ? elementBySymbol(symbol) : undefined);
  return { symbol: symbol ?? info?.symbol ?? '?', ar: name ?? info?.ar ?? '', en: info?.en ?? '' };
}

export function renderAtom(spec: AtomSpec, opts?: RenderOptions): string {
  const id = `atom-${uid()}`;
  const font = resolveFont(opts);
  const Z = spec.Z ?? 6;
  const A = spec.A ?? Math.round(Z * 2);
  const el = resolveElement(Z, spec.symbol, spec.name);
  const showShells = spec.showShells ?? true;
  const shells = shellDistribution(Z);
  const R0 = 44;
  const STEP = 22;
  const rMax = R0 + STEP * Math.max(0, shells.length - 1);
  const cx = rMax + 40;
  const cy = rMax + 48;
  const W = Math.round(cx * 2);
  const H = Math.round(cy + rMax + 60);
  const parts: string[] = [];

  // المدارات
  if (showShells) {
    shells.forEach((_, i) => {
      const r = R0 + STEP * i;
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="5 4"/>`);
      const nm = SHELL_NAMES[i] ?? '';
      parts.push(label(cx + r * 0.72 + 6, cy - r * 0.72 - 4, nm, { size: 10, bold: true, color: '#64748b', font }));
    });
  }
  // النواة
  parts.push(glossSphere(cx, cy, 22, LAB_COLORS.nucleus, `${id}-nuc`));
  parts.push(label(cx, cy + 6, el.symbol, { size: 17, bold: true, color: '#ffffff', halo: false, font }));
  // الإلكترونات
  shells.forEach((n, i) => {
    const r = R0 + STEP * i;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 - Math.PI / 2 + (i % 2 ? Math.PI / n : 0);
      const ex = cx + Math.cos(a) * r;
      const ey = cy + Math.sin(a) * r;
      parts.push(glossSphere(ex, ey, 5, LAB_COLORS.electron, `${id}-e${i}-${k}`, false));
    }
  });
  // شارة A/Z + الرمز (أعلى اليسار)
  parts.push(`<defs>${linGrad(`${id}-tag`, [[0, '#1e293b'], [1, '#0f172a']])}${shadowDef(`${id}-tagsh`)}</defs>`);
  parts.push(`<rect x="10" y="10" width="64" height="40" rx="7" fill="url(#${id}-tag)" filter="url(#${id}-tagsh)"/>`);
  parts.push(label(28, 26, `A=${A}`, { size: 10, bold: true, color: '#fca5a5', halo: false, font }));
  parts.push(label(28, 42, `Z=${Z}`, { size: 10, bold: true, color: '#7dd3fc', halo: false, font }));
  parts.push(label(58, 40, el.symbol, { size: 20, bold: true, color: '#ffffff', halo: false, font }));
  // شريط القيم المحسوبة
  const nameTxt = el.ar ? ` (${el.ar}${el.en ? ` · ${el.en}` : ''})` : '';
  parts.push(badge(cx, H - 22, `p⁺ = ${Z} | n⁰ = ${A - Z} | e⁻ = ${Z}${nameTxt}`, { font, size: 11 }));
  return wrapSvg(parts.join(''), W, H, `ذرّة ${el.ar || el.symbol} — Z=${Z}, A=${A}`, opts);
}

// ------------------------------------------------------------
// بطاقة عنصر (بلاطة الجدول الدوري)
// ------------------------------------------------------------
export function renderElementCard(spec: ElementCardSpec, opts?: RenderOptions): string {
  const W = 170;
  const H = 190;
  const id = `elc-${uid()}`;
  const font = resolveFont(opts);
  const Z = spec.Z ?? 6;
  const info = elementByZ(Z);
  const symbol = spec.symbol ?? info?.symbol ?? '?';
  const ar = spec.name ?? info?.ar ?? '';
  const en = info?.en ?? '';
  const mass = spec.mass ?? info?.mass;
  const base = '#0ea5e9';
  return wrapSvg(
    `<defs>${linGrad(`${id}-bg`, [[0, lighten(base, 0.85)], [1, lighten(base, 0.6)]])}${shadowDef(`${id}-sh`, 3, 4)}</defs>` +
      `<rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="14" fill="url(#${id}-bg)" stroke="${base}" stroke-width="3" filter="url(#${id}-sh)"/>` +
      `<rect x="10" y="10" width="${W - 20}" height="34" rx="14" fill="${base}"/><rect x="10" y="30" width="${W - 20}" height="14" fill="${base}"/>` +
      label(28, 33, String(Z), { size: 15, bold: true, color: '#ffffff', halo: false, font }) +
      (mass !== undefined ? label(W - 26, 33, fmt(mass), { size: 12, color: '#ffffff', halo: false, anchor: 'end', font }) : '') +
      label(W / 2, 108, symbol, { size: 48, bold: true, color: darken(base, 0.45), halo: false, font }) +
      label(W / 2, 140, ar, { size: 15, bold: true, color: LAB_COLORS.ink, halo: false, font }) +
      label(W / 2, 160, en, { size: 11, color: LAB_COLORS.sub, halo: false, font }),
    W,
    H,
    `بطاقة عنصر ${ar || symbol}`,
    opts,
  );
}

// ------------------------------------------------------------
// صيغة/رمز كيميائي (H2O → H₂O) في بطاقة
// ------------------------------------------------------------
export function renderFormula(spec: FormulaSpec, opts?: RenderOptions): string {
  const id = `fml-${uid()}`;
  const font = resolveFont(opts);
  const raw = spec.text ?? 'H2O';
  const txt = subscriptDigits(raw);
  const W = Math.max(120, txt.length * 22 + 50);
  const H = spec.name ? 96 : 76;
  return wrapSvg(
    `<defs>${linGrad(`${id}-bg`, [[0, '#ffffff'], [1, '#f1f5f9']])}${shadowDef(`${id}-sh`, 2, 3)}</defs>` +
      `<rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="12" fill="url(#${id}-bg)" stroke="#cbd5e1" filter="url(#${id}-sh)"/>` +
      label(W / 2, 50, txt, { size: 30, bold: true, color: '#0f172a', halo: false, font }) +
      (spec.name ? label(W / 2, 76, spec.name, { size: 12, color: LAB_COLORS.sub, halo: false, font }) : ''),
    W,
    H,
    `صيغة ${raw}`,
    opts,
  );
}

// ------------------------------------------------------------
// رابطة كيميائية بين ذرّتين: أحادية/ثنائية/ثلاثية/شاردية
// ------------------------------------------------------------
export function renderBond(spec: BondSpec, opts?: RenderOptions): string {
  const W = 240;
  const H = 130;
  const id = `bond-${uid()}`;
  const font = resolveFont(opts);
  const a = spec.a ?? 'H';
  const b = spec.b ?? 'Cl';
  const type = spec.type ?? 'single';
  const ca = CPK[a] ?? '#94a3b8';
  const cb = CPK[b] ?? '#94a3b8';
  const y = 58;
  const xa = 66;
  const xb = 174;
  const parts: string[] = [];
  if (type === 'ionic') {
    parts.push(`<defs><marker id="${id}-mk" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#475569"/></marker></defs>`);
    parts.push(`<path d="M ${xa + 10},${y - 30} Q 120,${y - 55} ${xb - 10},${y - 30}" fill="none" stroke="#475569" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#${id}-mk)"/>`);
    parts.push(label(120, y - 46, 'e⁻', { size: 12, bold: true, color: '#475569', font }));
  } else {
    const n = type === 'single' ? 1 : type === 'double' ? 2 : 3;
    for (let i = 0; i < n; i++) {
      const off = (i - (n - 1) / 2) * 7;
      parts.push(`<line x1="${xa + 26}" y1="${y + off}" x2="${xb - 26}" y2="${y + off}" stroke="#334155" stroke-width="3.5" stroke-linecap="round"/>`);
    }
  }
  parts.push(glossSphere(xa, y, 28, ca, `${id}-a`));
  parts.push(glossSphere(xb, y, 28, cb, `${id}-b`));
  const dark = (c: string) => (c === '#e2e8f0' || c === '#eab308' ? '#1e293b' : '#ffffff');
  parts.push(label(xa, y + 6, a + (type === 'ionic' ? '⁺' : ''), { size: 18, bold: true, color: dark(ca), halo: false, font }));
  parts.push(label(xb, y + 6, b + (type === 'ionic' ? '⁻' : ''), { size: 18, bold: true, color: dark(cb), halo: false, font }));
  const names = { single: 'رابطة تكافؤية أحادية', double: 'رابطة تكافؤية ثنائية', triple: 'رابطة تكافؤية ثلاثية', ionic: 'رابطة شاردية' } as const;
  parts.push(badge(120, H - 20, names[type], { font, size: 10 }));
  return wrapSvg(parts.join(''), W, H, `${names[type]} ${a}–${b}`, opts);
}
