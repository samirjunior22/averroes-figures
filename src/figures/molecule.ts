// ============================================================
// Molecule Generator — مولّد الجزيء (كيمياء / علوم)
// ============================================================
// يرسم مخططاً بسيطاً لجزيء: ذرّات ملوّنة مع روابط.
// يدعم الوصف المباشر (atoms + bonds) أو الصيغة الكيميائية مع تخطيط تلقائي.
//
// الرمز في الـproxy:  [[جزيء: H2O]]  أو  [[جزيء: C,H,O ; روابط: 0-1,0-2]]
// ============================================================

import { z } from 'zod';
import type { RenderOptions } from './shared.js';
import {
  esc,
  text,
  wrapSvg,
  resolveColor,
} from './shared.js';

// ------------------------------------------------------------
// ألوان الذرّات (اصطلاحية CPK مبسّطة)
// ------------------------------------------------------------
const ATOM_COLORS: Record<string, { fill: string; stroke: string; text: string }> = {
  H:  { fill: '#ffffff', stroke: '#374151', text: '#1e293b' },
  C:  { fill: '#6b7280', stroke: '#374151', text: '#ffffff' },
  N:  { fill: '#3b82f6', stroke: '#1e40af', text: '#ffffff' },
  O:  { fill: '#ef4444', stroke: '#b91c1c', text: '#ffffff' },
  S:  { fill: '#eab308', stroke: '#a16207', text: '#1e293b' },
  Cl: { fill: '#22c55e', stroke: '#15803d', text: '#ffffff' },
  Na: { fill: '#a855f7', stroke: '#7e22ce', text: '#ffffff' },
  F:  { fill: '#06b6d4', stroke: '#0e7490', text: '#ffffff' },
};

const DEFAULT_ATOM_STYLE = { fill: '#94a3b8', stroke: '#475569', text: '#ffffff' };

/** ألوان الوضع الداكن */
const ATOM_COLORS_DARK: Record<string, { fill: string; stroke: string; text: string }> = {
  H:  { fill: '#d1d5db', stroke: '#6b7280', text: '#111827' },
  C:  { fill: '#4b5563', stroke: '#374151', text: '#e5e7eb' },
  N:  { fill: '#2563eb', stroke: '#1d4ed8', text: '#e5e7eb' },
  O:  { fill: '#dc2626', stroke: '#991b1b', text: '#e5e7eb' },
  S:  { fill: '#ca8a04', stroke: '#a16207', text: '#111827' },
  Cl: { fill: '#16a34a', stroke: '#15803d', text: '#e5e7eb' },
  Na: { fill: '#9333ea', stroke: '#7e22ce', text: '#e5e7eb' },
  F:  { fill: '#0891b2', stroke: '#0e7490', text: '#e5e7eb' },
};

const DEFAULT_ATOM_STYLE_DARK = { fill: '#64748b', stroke: '#475569', text: '#e5e7eb' };

// ------------------------------------------------------------
// أنصاف أقطار الذرّات (للعرض البصري)
// ------------------------------------------------------------
const ATOM_RADII: Record<string, number> = {
  H: 14, He: 14,
  C: 20, N: 19, O: 18, F: 17, Ne: 17,
  Na: 22, Mg: 22, Al: 21, Si: 21, P: 20, S: 20, Cl: 19,
};

const DEFAULT_RADIUS = 18;

// ------------------------------------------------------------
// مخطّطات Zod
// ------------------------------------------------------------

/** ذرّة في المخطط. */
export const moleculeAtomSchema = z
  .object({
    el: z.string().max(3).describe('رمز العنصر (H, O, C, N, S, Cl...)'),
    x: z.number().optional().describe('الإحداثي x (اختياري — يُحسب تلقائياً)'),
    y: z.number().optional().describe('الإحداثي y (اختياري — يُحسب تلقائياً)'),
  })
  .strict();

export type MoleculeAtom = z.infer<typeof moleculeAtomSchema>;

/** رابط بين ذرتين. */
export const moleculeBondSchema = z
  .object({
    a: z.number().describe('فهرس الذرّة الأولى'),
    b: z.number().describe('فهرس الذرّة الثانية'),
    order: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional().describe('ترتيب الرابط (افتراضي 1)'),
  })
  .strict();

export type MoleculeBond = z.infer<typeof moleculeBondSchema>;

/** مواصفات مولّد الجزيء. */
export const moleculeSpecSchema = z
  .object({
    formula: z.string().max(10).optional().describe('صيغة كيميائية (H2O, CO2, CH4...)'),
    atoms: z.array(moleculeAtomSchema).max(12).optional().describe('ذرات مباشرة'),
    bonds: z.array(moleculeBondSchema).max(15).optional().describe('روابط مباشرة'),
  })
  .strict()
  .refine(
    (d) => d.formula || (d.atoms && d.atoms.length > 0),
    { message: 'formula or atoms required' },
  );

export type MoleculeSpec = z.infer<typeof moleculeSpecSchema>;

// ------------------------------------------------------------
// تخطيط تلقائي لصيغ شائعة
// ------------------------------------------------------------

interface LayoutEntry {
  atoms: Array<{ el: string; x: number; y: number }>;
  bonds: Array<{ a: number; b: number; order: number }>;
}

const AUTO_LAYOUTS: Record<string, () => LayoutEntry> = {
  // ── H₂O ──
  H2O: () => {
    const cx = 150, cy = 100;
    return {
      atoms: [
        { el: 'O', x: cx, y: cy },
        { el: 'H', x: cx - 55, y: cy + 42 },
        { el: 'H', x: cx + 55, y: cy + 42 },
      ],
      bonds: [
        { a: 0, b: 1, order: 1 },
        { a: 0, b: 2, order: 1 },
      ],
    };
  },

  // ── CO₂ ──
  CO2: () => {
    const cx = 150, cy = 100;
    return {
      atoms: [
        { el: 'C', x: cx, y: cy },
        { el: 'O', x: cx - 65, y: cy },
        { el: 'O', x: cx + 65, y: cy },
      ],
      bonds: [
        { a: 0, b: 1, order: 2 },
        { a: 0, b: 2, order: 2 },
      ],
    };
  },

  // ── CH₄ ──
  CH4: () => {
    const cx = 150, cy = 100;
    return {
      atoms: [
        { el: 'C', x: cx, y: cy },
        { el: 'H', x: cx, y: cy - 50 },
        { el: 'H', x: cx + 48, y: cy + 18 },
        { el: 'H', x: cx - 48, y: cy + 18 },
        { el: 'H', x: cx, y: cy + 55 },
      ],
      bonds: [
        { a: 0, b: 1, order: 1 },
        { a: 0, b: 2, order: 1 },
        { a: 0, b: 3, order: 1 },
        { a: 0, b: 4, order: 1 },
      ],
    };
  },

  // ── O₂ ──
  O2: () => ({
    atoms: [
      { el: 'O', x: 120, y: 100 },
      { el: 'O', x: 180, y: 100 },
    ],
    bonds: [
      { a: 0, b: 1, order: 2 },
    ],
  }),

  // ── N₂ ──
  N2: () => ({
    atoms: [
      { el: 'N', x: 120, y: 100 },
      { el: 'N', x: 180, y: 100 },
    ],
    bonds: [
      { a: 0, b: 1, order: 3 },
    ],
  }),

  // ── HCl ──
  HCl: () => ({
    atoms: [
      { el: 'H', x: 120, y: 100 },
      { el: 'Cl', x: 180, y: 100 },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
    ],
  }),

  // ── NaCl ──
  NaCl: () => ({
    atoms: [
      { el: 'Na', x: 120, y: 100 },
      { el: 'Cl', x: 180, y: 100 },
    ],
    bonds: [
      { a: 0, b: 1, order: 1 },
    ],
  }),

  // ── H₂SO₄ (simplified: HO-S(=O)(=O)-OH) ──
  H2SO4: () => {
    const cx = 150, cy = 95;
    return {
      atoms: [
        { el: 'S', x: cx, y: cy },
        { el: 'O', x: cx - 55, y: cy - 30 },
        { el: 'O', x: cx + 55, y: cy - 30 },
        { el: 'O', x: cx - 55, y: cy + 35 },
        { el: 'O', x: cx + 55, y: cy + 35 },
        { el: 'H', x: cx - 95, y: cy + 55 },
        { el: 'H', x: cx + 95, y: cy + 55 },
      ],
      bonds: [
        { a: 0, b: 1, order: 2 },
        { a: 0, b: 2, order: 2 },
        { a: 0, b: 3, order: 1 },
        { a: 0, b: 4, order: 1 },
        { a: 3, b: 5, order: 1 },
        { a: 4, b: 6, order: 1 },
      ],
    };
  },
};

// ------------------------------------------------------------
// محلّل الصيغة الكيميائية (بسيط — بدون أقواس)
// ------------------------------------------------------------

interface ParsedAtom { el: string; count: number }

function parseFormula(formula: string): ParsedAtom[] {
  const result: ParsedAtom[] = [];
  let i = 0;
  const s = formula.trim();
  while (i < s.length) {
    // عنصر: حرف كبير + حرف صغير اختياري
    const elMatch = s.slice(i).match(/^([A-Z][a-z]?)/);
    if (!elMatch) break;
    const el = elMatch[1]!;
    i += el.length;
    // عدد اختياري
    const numMatch = s.slice(i).match(/^(\d+)/);
    const count = numMatch ? parseInt(numMatch[1]!, 10) : 1;
    i += numMatch ? numMatch[0]!.length : 0;
    result.push({ el, count });
  }
  return result;
}

/** تخطيط دائري بسيط لجزيئات بدون layout مُعدّ. */
function circularLayout(atoms: ParsedAtom[]): LayoutEntry {
  const n = atoms.reduce((s, a) => s + a.count, 0);
  if (n === 0) return { atoms: [], bonds: [] };

  // الذرّة المركزية (الأولى) إن كان هناك أكثر من ذرّة واحدة
  const expanded: Array<{ el: string }> = [];
  for (const a of atoms) {
    for (let i = 0; i < a.count; i++) expanded.push({ el: a.el });
  }

  const cx = 150, cy = 100, R = 55;
  const positioned: Array<{ el: string; x: number; y: number }> = [];

  if (expanded.length === 1) {
    positioned.push({ el: expanded[0]!.el, x: cx, y: cy });
  } else {
    // الذرّة الأولى في المركز
    positioned.push({ el: expanded[0]!.el, x: cx, y: cy });
    // البقية حولها
    for (let i = 1; i < expanded.length; i++) {
      const angle = ((i - 1) / (expanded.length - 1)) * 2 * Math.PI - Math.PI / 2;
      positioned.push({
        el: expanded[i]!.el,
        x: cx + R * Math.cos(angle),
        y: cy + R * Math.sin(angle),
      });
    }
  }

  // روابط: كل ذرّة طرفيّة مرتبطة بالمركزية
  const bonds: Array<{ a: number; b: number; order: number }> = [];
  for (let i = 1; i < positioned.length; i++) {
    bonds.push({ a: 0, b: i, order: 1 });
  }

  return { atoms: positioned, bonds };
}

// ------------------------------------------------------------
// ثوابت
// ------------------------------------------------------------

const W = 300;
const H = 200;

// ------------------------------------------------------------
// المُصيّر الرئيسي
// ------------------------------------------------------------

/** يُصيّر مخطط جزيء إلى SVG. spec غير صالح → ''. */
export function renderMolecule(spec: MoleculeSpec, opts?: RenderOptions): string {
  try {
    const dark = opts?.dark ?? false;
    const col = resolveColor(opts);
    const ff = opts?.fontFamily ?? 'sans-serif';
    const getStyle = (el: string) =>
      (dark ? (ATOM_COLORS_DARK[el] ?? DEFAULT_ATOM_STYLE_DARK) : (ATOM_COLORS[el] ?? DEFAULT_ATOM_STYLE));
    const getRadius = (el: string) => ATOM_RADII[el] ?? DEFAULT_RADIUS;

    let layout: LayoutEntry;

    if (spec.formula && AUTO_LAYOUTS[spec.formula]) {
      // layout مُعدّ مسبقاً
      layout = AUTO_LAYOUTS[spec.formula]();
    } else if (spec.atoms && spec.atoms.length > 0) {
      // ذرات مباشرة — استخدم إحداثياتها أو تخطيط دائري
      const hasCoords = spec.atoms.every((a) => a.x !== undefined && a.y !== undefined);
      if (hasCoords) {
        layout = {
          atoms: spec.atoms.map((a) => ({ el: a.el, x: a.x!, y: a.y! })),
          bonds: (spec.bonds ?? []).map((b) => ({ a: b.a, b: b.b, order: b.order ?? 1 })),
        };
      } else {
        // لا إحداثيات — حوّل إلى صيغة مبسّطة واستعمل التخطيط الدائري
        const parsed: ParsedAtom[] = [];
        for (const a of spec.atoms) parsed.push({ el: a.el, count: 1 });
        layout = circularLayout(parsed);
        // تحويل الروابط المُمرّرة إن وُجدت
        if (spec.bonds && spec.bonds.length > 0) {
          layout = {
            atoms: layout.atoms,
            bonds: spec.bonds.map((b) => ({ a: b.a, b: b.b, order: b.order ?? 1 })),
          };
        }
      }
    } else if (spec.formula) {
      // صيغة بدون layout مُعدّ — محلّل + تخطيط دائري
      const parsed = parseFormula(spec.formula);
      layout = circularLayout(parsed);
    } else {
      return '';
    }

    // تحقق من فهرس الروابط
    const maxIdx = layout.atoms.length - 1;
    const validBonds = layout.bonds.filter(
      (b) => b.a >= 0 && b.a <= maxIdx && b.b >= 0 && b.b <= maxIdx && b.a !== b.b,
    );

    let svg = '';

    // رسم الروابط (تحت الذرّات)
    for (const bond of validBonds) {
      const a1 = layout.atoms[bond.a]!;
      const a2 = layout.atoms[bond.b]!;
      const r1 = getRadius(a1.el);
      const r2 = getRadius(a2.el);

      // خط الرابط
      const bondColor = dark ? '#9ca3af' : '#6b7280';
      if (bond.order === 1) {
        svg += `<line x1="${a1.x}" y1="${a1.y}" x2="${a2.x}" y2="${a2.y}" stroke="${bondColor}" stroke-width="3" stroke-linecap="round"/>`;
      } else if (bond.order === 2) {
        // رابط مزدوج — خطّان متوازيان
        const dx = a2.x - a1.x;
        const dy = a2.y - a1.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = (-dy / len) * 4; // normal
        const ny = (dx / len) * 4;
        svg += `<line x1="${a1.x + nx}" y1="${a1.y + ny}" x2="${a2.x + nx}" y2="${a2.y + ny}" stroke="${bondColor}" stroke-width="2.5" stroke-linecap="round"/>`;
        svg += `<line x1="${a1.x - nx}" y1="${a1.y - ny}" x2="${a2.x - nx}" y2="${a2.y - ny}" stroke="${bondColor}" stroke-width="2.5" stroke-linecap="round"/>`;
      } else if (bond.order === 3) {
        // رابط ثلاثي
        const dx = a2.x - a1.x;
        const dy = a2.y - a1.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = (-dy / len) * 5;
        const ny = (dx / len) * 5;
        svg += `<line x1="${a1.x}" y1="${a1.y}" x2="${a2.x}" y2="${a2.y}" stroke="${bondColor}" stroke-width="2.5" stroke-linecap="round"/>`;
        svg += `<line x1="${a1.x + nx}" y1="${a1.y + ny}" x2="${a2.x + nx}" y2="${a2.y + ny}" stroke="${bondColor}" stroke-width="2" stroke-linecap="round"/>`;
        svg += `<line x1="${a1.x - nx}" y1="${a1.y - ny}" x2="${a2.x - nx}" y2="${a2.y - ny}" stroke="${bondColor}" stroke-width="2" stroke-linecap="round"/>`;
      }
    }

    // رسم الذرّات
    for (let i = 0; i < layout.atoms.length; i++) {
      const atom = layout.atoms[i]!;
      const style = getStyle(atom.el);
      const r = getRadius(atom.el);

      // دائرة الذرّة
      svg += `<circle cx="${atom.x}" cy="${atom.y}" r="${r}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="2"/>`;

      // رمز العنصر
      svg += text(atom.x, atom.y + 1, atom.el, {
        size: atom.el.length > 1 ? 10 : 13,
        bold: true,
        fontFamily: ff,
        color: style.text,
      });
    }

    // التسمية التوضيحية (إن كانت صيغة)
    const label = spec.formula ?? '';
    if (label) {
      svg += text(W / 2, H - 12, label, {
        size: 13,
        bold: true,
        fontFamily: ff,
        color: col,
      });
    }

    const ariaLabel = `مخطط جزيء ${label || 'كيميائي'}`;
    return wrapSvg(svg, W, H, ariaLabel, opts);
  } catch {
    return '';
  }
}
