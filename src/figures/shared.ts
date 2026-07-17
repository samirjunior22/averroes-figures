// ============================================================
// Shared Types & Utilities — أنواع مشتركة وأدوات مساعدة
// ============================================================
// يضمّن: خيارات التصيير (RenderOptions)، أنماط الألوان (Theme)，
// أدوات النص (esc, text)، ومساعدات هندسية مشتركة.
// ============================================================

// ------------------------------------------------------------
// أنواع خيارات التصيير المشتركة
// ------------------------------------------------------------
export interface RenderOptions {
  /** عرض الـ viewBox. عند تغييره يغيّر نسبة العرض. */
  width?: number;
  /** ارتفاع الـ viewBox. عند تغييره يغيّر نسبة الارتفاع. */
  height?: number;
  /** خط النص. الافتراضي 'sans-serif'. */
  fontFamily?: string;
  /** لون الخطوط والحواف الافتراضي. الافتراضي '#1e293b'. */
  color?: string;
  /** لوحة ألوان مخصصة تُعيد اللوحة الافتراضية. */
  palette?: string[];
  /** تفعيل الوضع الداكن (يعكس الألوان). */
  dark?: boolean;
}

/** اللوحة الافتراضية (12 لوناً متناسقاً). */
export const DEFAULT_PALETTE = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
  '#06b6d4', '#f97316', '#84cc16', '#6366f1', '#14b8a6', '#e11d48',
];

/** اللوحة الداكنة. */
export const DARK_PALETTE = [
  '#60a5fa', '#f87171', '#34d399', '#fbbf24', '#a78bfa', '#f472b6',
  '#22d3ee', '#fb923c', '#a3e635', '#818cf8', '#2dd4bf', '#fb7185',
];

/** خلفية شبكة المحاور (فاتح). */
export const GRID_COLOR_LIGHT = '#e5e7eb';
/** خلفية شبكة المحاور (داكن). */
export const GRID_COLOR_DARK = '#374151';

// ------------------------------------------------------------
// أدوات بناء السمات
// ------------------------------------------------------------
export function resolvePalette(opts?: RenderOptions): string[] {
  if (opts?.palette && opts.palette.length > 0) return opts.palette;
  return opts?.dark ? DARK_PALETTE : DEFAULT_PALETTE;
}

export function resolveColor(opts?: RenderOptions): string {
  return opts?.color ?? (opts?.dark ? '#e2e8f0' : '#1e293b');
}

export function resolveFont(opts?: RenderOptions): string {
  return opts?.fontFamily ?? 'sans-serif';
}

export function resolveGridColor(opts?: RenderOptions): string {
  return opts?.dark ? GRID_COLOR_DARK : GRID_COLOR_LIGHT;
}

// ------------------------------------------------------------
// أدوات نص SVG
// ------------------------------------------------------------
export function esc(s: string): string {
  return s.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]!);
}

export interface TextOpts {
  size?: number;
  anchor?: 'start' | 'middle' | 'end';
  rotate?: number;
  bold?: boolean;
  fontFamily?: string;
  color?: string;
}

/** نص SVG مع خيارات كاملة. */
export function text(x: number, y: number, t: string, opts: TextOpts = {}, baseOpts?: RenderOptions): string {
  const size = opts.size ?? 11;
  const anchor = opts.anchor ?? 'middle';
  const ff = opts.fontFamily ?? baseOpts?.fontFamily ?? 'sans-serif';
  const col = opts.color ?? baseOpts?.color ?? '';
  const weight = opts.bold ? ' font-weight="bold"' : '';
  const rot = opts.rotate ? ` transform="rotate(${opts.rotate} ${x} ${y})"` : '';
  const fill = col ? `fill="${col}"` : 'fill="currentColor"';
  return `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" font-family="${ff}"${weight} ${fill} stroke="none">${esc(t)}</text>`;
}

// ------------------------------------------------------------
// أدوات تنسيق الأرقام
// ------------------------------------------------------------
export function fmtNum(v: number): string {
  if (Math.abs(v) >= 1000) return (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1) + 'k';
  if (Number.isInteger(v)) return String(v);
  if (Math.abs(v) < 0.01 && v !== 0) return v.toExponential(1);
  return v.toFixed(1);
}

export function fmtVal(v: number | undefined, unit: string | undefined): string {
  if (v === undefined) return '';
  const num = Number.isInteger(v) ? String(v) : v.toFixed(1);
  return unit ? `${num} ${unit}` : num;
}

export function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + '\u2026' : s;
}

// ------------------------------------------------------------
// ثوابت سمات SVG شائعة
// ------------------------------------------------------------
export function strokeAttr(color?: string): string {
  const c = color || 'currentColor';
  return `stroke="${c}" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
}

export function strokeThinAttr(color?: string): string {
  const c = color || 'currentColor';
  return `stroke="${c}" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"`;
}

export function fillAttr(color?: string): string {
  return `fill="${color || 'currentColor'}" stroke="none"`;
}

// ------------------------------------------------------------
// مساعدات هندسية
// ------------------------------------------------------------
export type Pt = [number, number];

export const vecSub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
export const vecAdd = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
export const vecMul = (a: Pt, s: number): Pt => [a[0] * s, a[1] * s];
export const vecMid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
export const vecNorm = (a: Pt): Pt => {
  const l = Math.hypot(a[0], a[1]) || 1;
  return [a[0] / l, a[1] / l];
};
export const vecCentroid = (pts: Pt[]): Pt => [
  pts.reduce((s, p) => s + p[0], 0) / pts.length,
  pts.reduce((s, p) => s + p[1], 0) / pts.length,
];
export const vecDist = (a: Pt, b: Pt): number => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** يحسب زاوية (بالدرجات) عند رأس v بين الضلعين prev-v و v-next. */
export function angleDeg(prev: Pt, v: Pt, next: Pt): number {
  const a = vecSub(prev, v);
  const b = vecSub(next, v);
  const dot = a[0] * b[0] + a[1] * b[1];
  const cross = a[0] * b[1] - a[1] * b[0];
  let angle = Math.atan2(Math.abs(cross), dot) * (180 / Math.PI);
  if (angle < 0) angle += 360;
  return angle;
}

/** مُغلِّف SVG عام مع خيارات. */
export function wrapSvg(inner: string, W: number, H: number, ariaLabel: string, opts?: RenderOptions): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(ariaLabel)}" class="lesson-figure">${inner}</svg>`;
}