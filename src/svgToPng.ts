// ============================================================
// SVG → PNG — تحويل رسوم SVG إلى PNG (اختياري)
// ============================================================
// يستعمل @resvg/resvg-js (peerDependency اختياري). إن لم تُثبَّت المكتبة،
// كل الدوال تُعيد '' بلا رمي — فيستعمل المُستدعي SVG الأصلي بدلاً منه.
//
// مبدأ "لا يرمي أبداً": أي فشل (مكتبة مفقودة، SVG معطوب...) → ''
// ============================================================

/** عرض PNG الافتراضي بالبكسل. */
const DEFAULT_PNG_WIDTH = 480;

export interface SvgToPngOptions {
  /** عرض PNG الناتج بالبكسل. الافتراضي 480. */
  width?: number;
  /** خلفية PNG. الافتراضي أبيض معتم. */
  background?: string;
}

// تحميل lazy لـ @resvg/resvg-js — إن غابت المكتبة نُعيد '' (ميزة اختيارية).
let ResvgCtor: any = null;
let resvgMissing = false;
try {
  // createRequire للتوافق مع ESM (import ثابت سيفشل TypeScript عند غياب الوحدة)
  const { createRequire } = await import('node:module');
  const require = createRequire(import.meta.url);
  ResvgCtor = require('@resvg/resvg-js').Resvg;
} catch {
  resvgMissing = true;
}

// تخبئة بسيطة لتفادي إعادة تحويل نفس الـ SVG.
const cache = new Map<string, string>();
const CACHE_MAX = 256;

/**
 * يحوّل نص SVG إلى data-URI بصيغة PNG. متزامن. يعيد '' عند أي فشل (لا يرمي).
 * إن لم تُثبَّت @resvg/resvg-js، يعيد '' دائماً (ميزة اختيارية).
 */
export function svgToPngDataUri(svg: string, opts: SvgToPngOptions = {}): string {
  if (resvgMissing || !ResvgCtor) return '';
  if (typeof svg !== 'string' || svg.length === 0) return '';
  const trimmed = svg.trim();
  if (!/^<svg[\s>]/i.test(trimmed)) return '';

  const width = typeof opts.width === 'number' && Number.isFinite(opts.width) && opts.width > 0 ? opts.width : DEFAULT_PNG_WIDTH;
  const background = typeof opts.background === 'string' && opts.background.length > 0 ? opts.background : '#ffffff';

  const cacheKey = `${width}|${background}|${trimmed}`;
  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  let result = '';
  try {
    const resvg = new ResvgCtor(trimmed, { fitTo: { mode: 'width', value: width }, background });
    const pngBuffer = resvg.render().asPng();
    result = `data:image/png;base64,${Buffer.from(pngBuffer).toString('base64')}`;
  } catch {
    result = '';
  }

  if (cache.size >= CACHE_MAX) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) cache.delete(firstKey);
  }
  cache.set(cacheKey, result);
  return result;
}

/**
 * يحوّل نص SVG إلى Buffer بصيغة PNG. متزامن. يعيد null عند أي فشل.
 */
export function svgToPngBuffer(svg: string, opts?: SvgToPngOptions): Buffer | null {
  const dataUri = svgToPngDataUri(svg, opts);
  if (!dataUri) return null;
  const b64 = dataUri.slice('data:image/png;base64,'.length);
  return Buffer.from(b64, 'base64');
}

/** هل تحويل PNG متاح؟ (أي هل @resvg/resvg-js مثبّتة؟) */
export function isPngConversionAvailable(): boolean {
  return !resvgMissing && Boolean(ResvgCtor);
}

/** يمسح تخبئة التحويل (للاختبارات). */
export function clearSvgToPngCache(): void {
  cache.clear();
}

