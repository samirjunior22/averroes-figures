// ============================================================
// lab/style — بدائيات الأسلوب «ثلاثي الأبعاد الناعم» لكائنات المخبر
// ============================================================
// كل كائن على السبورة يُبنى من هذه القطع: كرة لامعة، أسطوانة معدنية،
// وعاء زجاجي بسائل، لهب، حامل، شارة قيمة، سهم مجسَّم.
// كل بدائية تحمل `<defs>` الخاصة بها بمعرّف فريد (uid) — كائنات كثيرة في
// صفحة واحدة تشترك في الـDOM، ومعرّفٌ مكرَّر يخلط تدرّج كائن بآخر.
// ============================================================

import { esc } from '../shared.js';

export const LAB_COLORS = {
  ink: '#1e293b',
  sub: '#64748b',
  badgeBg: '#1e293b',
  badgeText: '#ffffff',
  value: '#2563eb',
  metal: '#94a3b8',
  metalDark: '#475569',
  copper: '#d97706',
  glassStroke: '#94a3b8',
  liquid: '#60a5fa',
  electron: '#22d3ee',
  nucleus: '#dc2626',
  positive: '#ef4444',
  negative: '#3b82f6',
  flame: '#f97316',
  flameCore: '#fde047',
  flameBase: '#38bdf8',
} as const;

/** معرّف قصير عشوائي — يُلحق بكل id داخل `<defs>`. */
export function uid(): string {
  return Math.random().toString(36).slice(2, 8);
}

// ------------------------------------------------------------
// ألوان: مزج بسيط مع الأبيض/الأسود لاشتقاق درجات التدرّج
// ------------------------------------------------------------
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(hex: string, target: number, t: number): string {
  const [r, g, b] = hexToRgb(hex);
  const c = (v: number) => Math.round(v + (target - v) * t).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

export const lighten = (hex: string, t: number): string => mix(hex, 255, t);
export const darken = (hex: string, t: number): string => mix(hex, 0, t);

// ------------------------------------------------------------
// defs
// ------------------------------------------------------------
export function shadowDef(id: string, dy = 2, blur = 2): string {
  return `<filter id="${id}" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="${dy}" stdDeviation="${blur}" flood-color="#0f172a" flood-opacity="0.28"/></filter>`;
}

export function glowDef(id: string, color: string, blur = 4): string {
  return `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${blur}" result="b"/><feFlood flood-color="${color}" flood-opacity="0.8"/><feComposite in2="b" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
}

/** تدرّج خطّي: `dir` = 'v' (أعلى→أسفل) أو 'h' (يسار→يمين). */
export function linGrad(id: string, stops: [number, string, number?][], dir: 'v' | 'h' = 'v'): string {
  const coords = dir === 'v' ? 'x1="0" y1="0" x2="0" y2="1"' : 'x1="0" y1="0" x2="1" y2="0"';
  const s = stops
    .map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`)
    .join('');
  return `<linearGradient id="${id}" ${coords}>${s}</linearGradient>`;
}

/** تدرّج «معدني» (فاتح-داكن-فاتح) لأسطوانة أو أنبوب. */
export function metalGrad(id: string, base: string, dir: 'v' | 'h' = 'v'): string {
  return linGrad(id, [[0, lighten(base, 0.55)], [0.35, base], [0.7, darken(base, 0.25)], [1, darken(base, 0.45)]], dir);
}

// ------------------------------------------------------------
// كرة لامعة
// ------------------------------------------------------------
export function glossSphere(cx: number, cy: number, r: number, base: string, id: string, shadow = true): string {
  const g = `<defs><radialGradient id="${id}" cx="0.35" cy="0.3" r="0.75"><stop offset="0" stop-color="${lighten(base, 0.7)}"/><stop offset="0.45" stop-color="${base}"/><stop offset="1" stop-color="${darken(base, 0.45)}"/></radialGradient>${shadow ? shadowDef(`${id}-sh`) : ''}</defs>`;
  const f = shadow ? ` filter="url(#${id}-sh)"` : '';
  return (
    g +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"${f}/>` +
    `<ellipse cx="${cx - r * 0.3}" cy="${cy - r * 0.4}" rx="${r * 0.3}" ry="${r * 0.18}" fill="#ffffff" opacity="0.55"/>`
  );
}

// ------------------------------------------------------------
// أسطوانة معدنية (أفقية أو عمودية) بزوايا مستديرة
// ------------------------------------------------------------
export function cylinder(x: number, y: number, w: number, h: number, base: string, id: string, dir: 'v' | 'h' = 'h', rx = 6): string {
  // الأسطوانة الأفقية يظلّلها تدرّج عمودي والعكس
  const grad = metalGrad(id, base, dir === 'h' ? 'v' : 'h');
  return (
    `<defs>${grad}${shadowDef(`${id}-sh`)}</defs>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#${id})" stroke="${darken(base, 0.5)}" stroke-width="1" filter="url(#${id}-sh)"/>`
  );
}

// ------------------------------------------------------------
// وعاء زجاجي بسائل
// ------------------------------------------------------------
export interface VesselBox {
  /** المستطيل الداخلي الذي يملؤه السائل (بإحداثيات المسار نفسه). */
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * يرسم وعاءً زجاجياً بمسار `d` وسائلاً بمستوى `level` (0..100) مقصوصاً بالمسار نفسه.
 * الزجاج شفّاف مع لمعة عمودية على اليسار وهلال على سطح السائل.
 */
export function vessel(d: string, box: VesselBox, level: number, liquid: string, id: string): string {
  const lv = Math.max(0, Math.min(100, level));
  const top = box.y + box.h * (1 - lv / 100);
  const parts: string[] = [];
  parts.push(
    `<defs><clipPath id="${id}-clip"><path d="${d}"/></clipPath>` +
      linGrad(`${id}-liq`, [[0, lighten(liquid, 0.25)], [1, darken(liquid, 0.2)]]) +
      linGrad(`${id}-glass`, [[0, '#ffffff', 0.55], [0.5, '#ffffff', 0.08], [1, '#ffffff', 0.35]], 'h') +
      shadowDef(`${id}-sh`, 3, 3) +
      `</defs>`,
  );
  parts.push(`<path d="${d}" fill="#e0f2fe" fill-opacity="0.35" filter="url(#${id}-sh)"/>`);
  if (lv > 0) {
    parts.push(`<g clip-path="url(#${id}-clip)">`);
    parts.push(`<rect x="${box.x - 5}" y="${top}" width="${box.w + 10}" height="${box.h + 20}" fill="url(#${id}-liq)" opacity="0.9"/>`);
    parts.push(`<ellipse cx="${box.x + box.w / 2}" cy="${top}" rx="${box.w / 2 + 5}" ry="4" fill="${lighten(liquid, 0.45)}" opacity="0.9"/>`);
    parts.push(`</g>`);
  }
  parts.push(`<path d="${d}" fill="url(#${id}-glass)" stroke="${LAB_COLORS.glassStroke}" stroke-width="2" stroke-linejoin="round"/>`);
  return parts.join('');
}

// ------------------------------------------------------------
// لهب موقد (طبقات: خارجي برتقالي، داخلي أصفر، قاعدة زرقاء)
// ------------------------------------------------------------
export function flame(cx: number, baseY: number, h: number, id: string): string {
  const w = h * 0.42;
  const tear = (hh: number, ww: number, y0: number) =>
    `M ${cx},${y0 - hh} C ${cx + ww},${y0 - hh * 0.55} ${cx + ww * 0.9},${y0 - hh * 0.1} ${cx},${y0} C ${cx - ww * 0.9},${y0 - hh * 0.1} ${cx - ww},${y0 - hh * 0.55} ${cx},${y0 - hh} Z`;
  return (
    `<defs>${linGrad(`${id}-fo`, [[0, LAB_COLORS.flameCore], [0.6, LAB_COLORS.flame], [1, '#dc2626']])}${glowDef(`${id}-gl`, LAB_COLORS.flame, 3)}</defs>` +
    `<g filter="url(#${id}-gl)">` +
    `<path d="${tear(h, w, baseY)}" fill="url(#${id}-fo)" opacity="0.92"/>` +
    `<path d="${tear(h * 0.55, w * 0.5, baseY)}" fill="${LAB_COLORS.flameCore}" opacity="0.9"/>` +
    `<path d="${tear(h * 0.22, w * 0.3, baseY)}" fill="${LAB_COLORS.flameBase}" opacity="0.9"/>` +
    `</g>`
  );
}

// ------------------------------------------------------------
// حامل ثلاثي القوائم (كالصورة المرجعية): صفيحة علوية + قائمتان + قاعدة
// ------------------------------------------------------------
export function stand(cx: number, topY: number, baseY: number, w: number, id: string): string {
  const half = w / 2;
  return (
    `<defs>${metalGrad(`${id}-leg`, LAB_COLORS.metal, 'h')}${metalGrad(`${id}-plate`, LAB_COLORS.metalDark)}</defs>` +
    `<rect x="${cx - half - 6}" y="${topY}" width="${w + 12}" height="6" rx="2" fill="url(#${id}-plate)"/>` +
    `<rect x="${cx - half}" y="${topY + 6}" width="7" height="${baseY - topY - 6}" fill="url(#${id}-leg)"/>` +
    `<rect x="${cx + half - 7}" y="${topY + 6}" width="7" height="${baseY - topY - 6}" fill="url(#${id}-leg)"/>` +
    `<rect x="${cx - half - 12}" y="${baseY}" width="${w + 24}" height="10" rx="3" fill="url(#${id}-plate)"/>`
  );
}

// ------------------------------------------------------------
// شارة قيمة: كبسولة داكنة بنص أبيض — «E = 1.5 V»
// ------------------------------------------------------------
export interface BadgeOpts {
  size?: number;
  bg?: string;
  fg?: string;
  font?: string;
  bold?: boolean;
}

export function badge(cx: number, cy: number, txt: string, opts: BadgeOpts = {}): string {
  const size = opts.size ?? 11;
  const w = Math.max(28, txt.length * size * 0.62 + 16);
  const h = size + 10;
  const bg = opts.bg ?? LAB_COLORS.badgeBg;
  const fg = opts.fg ?? LAB_COLORS.badgeText;
  const weight = opts.bold === false ? '' : ' font-weight="bold"';
  return (
    `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="${bg}" opacity="0.92"/>` +
    `<text x="${cx}" y="${cy + size * 0.36}" font-size="${size}" text-anchor="middle" direction="ltr" font-family="${opts.font ?? 'sans-serif'}"${weight} fill="${fg}">${esc(txt)}</text>`
  );
}

// ------------------------------------------------------------
// نص بهالة بيضاء — يُقرأ فوق أي خلفية على السبورة.
// `direction="ltr"` مثبَّت: صفحة المذكرة RTL تقلب «12 V» إلى «V 12» لولاه،
// والعربية وحدها لا تتأثّر (الـbidi يرتّب كل مقطع داخلياً).
// ------------------------------------------------------------
export interface LabelOpts {
  size?: number;
  color?: string;
  anchor?: 'start' | 'middle' | 'end';
  bold?: boolean;
  font?: string;
  halo?: boolean;
  italic?: boolean;
}

export function label(x: number, y: number, txt: string, opts: LabelOpts = {}): string {
  const size = opts.size ?? 11;
  const halo = opts.halo === false ? '' : ' stroke="#ffffff" stroke-width="3" paint-order="stroke" stroke-linejoin="round"';
  const weight = opts.bold ? ' font-weight="bold"' : '';
  const style = opts.italic ? ' font-style="italic"' : '';
  return `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${opts.anchor ?? 'middle'}" direction="ltr" font-family="${opts.font ?? 'sans-serif'}"${weight}${style} fill="${opts.color ?? LAB_COLORS.ink}"${halo}>${esc(txt)}</text>`;
}

// ------------------------------------------------------------
// سهم مجسَّم (ساق + رأس) بتدرّج وظلّ
// ------------------------------------------------------------
export function arrow3d(x1: number, y1: number, x2: number, y2: number, color: string, id: string, width = 8): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const head = Math.min(18, len * 0.35);
  const hw = width * 1.6;
  const bx = x2 - ux * head;
  const by = y2 - uy * head;
  const w2 = width / 2;
  const pts = [
    [x1 + px * w2, y1 + py * w2],
    [bx + px * w2, by + py * w2],
    [bx + px * hw, by + py * hw],
    [x2, y2],
    [bx - px * hw, by - py * hw],
    [bx - px * w2, by - py * w2],
    [x1 - px * w2, y1 - py * w2],
  ]
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');
  return (
    `<defs>${linGrad(`${id}`, [[0, lighten(color, 0.45)], [0.5, color], [1, darken(color, 0.35)]], Math.abs(ux) >= Math.abs(uy) ? 'v' : 'h')}${shadowDef(`${id}-sh`)}</defs>` +
    `<polygon points="${pts}" fill="url(#${id})" stroke="${darken(color, 0.4)}" stroke-width="1" stroke-linejoin="round" filter="url(#${id}-sh)"/>`
  );
}

/** «F» مع سهم صغير فوقها — تمثيل المتّجه في المنهاج. */
export function vectorName(x: number, y: number, name: string, color: string, size = 14): string {
  const w = size * 0.6 * name.length;
  return (
    label(x, y, name, { size, color, bold: true, italic: true }) +
    `<line x1="${x - w / 2}" y1="${y - size - 2}" x2="${x + w / 2}" y2="${y - size - 2}" stroke="${color}" stroke-width="1.5"/>` +
    `<polygon points="${x + w / 2},${y - size - 2} ${x + w / 2 - 4},${y - size - 5} ${x + w / 2 - 4},${y - size + 1}" fill="${color}"/>`
  );
}

/** الأرقام في صيغة كيميائية → منخفضة (H2O → H₂O). */
export function subscriptDigits(formula: string): string {
  const sub = '₀₁₂₃₄₅₆₇₈₉';
  return formula.replace(/(?<=[A-Za-z)\]])\d+/g, (m) => m.split('').map((d) => sub[Number(d)]).join(''));
}

export function fmt(v: number): string {
  return Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100);
}
