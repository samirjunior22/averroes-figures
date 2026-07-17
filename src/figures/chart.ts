// ============================================================
// Chart Figure — مخططات بيانية معلَمية
// ============================================================
// يدعم سبعة أنواع: bar, pie, line, pyramid, area, scatter, horizontal_bar
// كل دالة تصيير تقبل خيارات ChartOptions الاختيارية (سلسلة مكوّنة).
// مبدأ "لا يرمي أبداً" — أي spec غير صالح → ''.
// ============================================================

import { z } from 'zod';
import {
  esc,
  text,
  fmtNum,
  fmtVal,
  truncate,
  wrapSvg,
  resolvePalette,
  resolveColor,
  resolveFont,
  resolveGridColor,
  strokeAttr,
  type RenderOptions,
  type TextOpts,
  DEFAULT_PALETTE,
  DARK_PALETTE,
} from './shared.js';

// ------------------------------------------------------------
// مخطط Zod — التحقّق من المدخلات
// ------------------------------------------------------------
export const chartKindSchema = z.enum([
  'bar',
  'pie',
  'line',
  'pyramid',
  'area',
  'scatter',
  'horizontal_bar',
]);
export type ChartKind = z.infer<typeof chartKindSchema>;

export const chartSpecSchema = z
  .object({
    kind: chartKindSchema,
    /** عنوان المخطط (اختياري، بحد أقصى 80 حرفاً). */
    title: z.string().max(80).optional(),
    /** وحدة القياس المعروضة بجانب القيم (واط، %، °م، نسمة…). */
    unit: z.string().max(12).optional(),
    /** تسميات الفئات/النقاط. يجب أن تطابق values طولاً. */
    labels: z.array(z.string().max(30)).min(2).max(12),
    /** القيم الرقمية الموافقة لكل تسمية. */
    values: z.array(z.number().finite()).min(2).max(12),
    /**
     * إحداثيات x عددية اختيارية (مبعثر/منحنى حقيقي). إن حُدِّدت بطول مطابق لـ values
     * رُسمت النقاط على مقياس أفقي عددي (min→max) بدل التوزيع بالترتيب. غيابها = السلوك الافتراضي.
     */
    xs: z.array(z.number().finite()).min(2).max(12).optional(),
  })
  .strict()
  .refine((d) => d.labels.length === d.values.length, {
    message: 'labels و values يجب أن تتطابقا طولاً',
  });
export type ChartSpec = z.infer<typeof chartSpecSchema>;

// ------------------------------------------------------------
// خيارات المخططات
// ------------------------------------------------------------
export interface ChartOptions extends RenderOptions {
  /** إظهار/إخفاء وسيلة الإيضاح (legend). الافتراضي: تلقائي حسب النوع. */
  showLegend?: boolean;
  /** إظهار/إخفاء قيم البيانات على الرسم. الافتراضي true. */
  showValues?: boolean;
  /** إظهار/إخفاء شبكة المحاور. الافتراضي true. */
  showGrid?: boolean;
  /** شفافية الأعمدة/القطاعات. الافتراضي 0.85. */
  opacity?: number;
  /** نصف قطر حواف الأعمدة. الافتراضي 3. */
  borderRadius?: number;
  /** لون خلفية المخطط. الافتراضي شفاف. */
  background?: string;
}

// ------------------------------------------------------------
// ثوابت بصرية
// ------------------------------------------------------------
const CHART_W = 460;
const CHART_H = 280;

// ------------------------------------------------------------
// مساعدات داخلية
// ------------------------------------------------------------

/** يحدّد لوحة الألوان المناسبة. */
function pal(opts?: ChartOptions): string[] {
  return resolvePalette(opts);
}

/** يحدّد ما إذا كان يجب عرض وسيلة الإيضاح تلقائياً. */
function autoLegend(kind: ChartKind, labelCount: number): boolean {
  if (kind === 'pie') return true;
  if (kind === 'pyramid') return false;
  // الأنواع الجديدة (area, scatter, horizontal_bar) دائماً مع وسيلة إيضاح
  if (kind === 'area' || kind === 'scatter' || kind === 'horizontal_bar') return true;
  // bar و line: فقط عند كثرة العناصر (توافقية مع الإصدار السابق)
  return labelCount > 4;
}

/** يقرّر عرض وسيلة الإيضاح بناءً على الخيارات والتلقائي. */
function shouldShowLegend(spec: ChartSpec, opts?: ChartOptions): boolean {
  if (opts?.showLegend !== undefined) return opts.showLegend;
  return autoLegend(spec.kind, spec.labels.length);
}

/** يولّد وسيلة إيضاح أفقية في الأعلى. */
function buildTopLegend(
  spec: ChartSpec,
  opts: ChartOptions | undefined,
  startX: number,
  y: number,
  maxWidth: number,
): string {
  const palette = pal(opts);
  const font = resolveFont(opts);
  const col = resolveColor(opts);
  const opacity = opts?.opacity ?? 0.85;
  const items: string[] = [];
  let curX = startX;

  for (let i = 0; i < spec.labels.length; i++) {
    const lbl = truncate(spec.labels[i] ?? '', 12);
    // تقدير عرض العنصر: مربع (10) + فراغ (5) + نص (~7.5px/حرف)
    const estW = 10 + 5 + lbl.length * 7.5 + 8;
    if (i > 0 && curX + estW > startX + maxWidth) break; // لا يكفي مكان

    const c = palette[i % palette.length];
    items.push(
      `<rect x="${curX}" y="${y - 5}" width="10" height="10" fill="${c}" rx="2" opacity="${opacity}"/>`,
    );
    items.push(
      text(curX + 14, y + 3, lbl, { size: 9, anchor: 'start', fontFamily: font, color: col }),
    );
    curX += estW;
  }
  return items.join('');
}

/** ظلّ خفيف للأعمدة (مستطيل شفاف خلف العمود، إزاحة 2px). */
function barShadow(x: number, y: number, w: number, h: number, rx: number): string {
  // تجنّب ظلٍّ لعنصر صفر أو شبه صفر
  if (w < 1 || h < 1) return '';
  return `<rect x="${x + 2}" y="${y + 2}" width="${w}" height="${h}" rx="${rx}" fill="#000" fill-opacity="0.07"/>`;
}

/** حسابات المحور الصادي المشتركة (bar / line / area / scatter). */
interface AxisInfo {
  padL: number;
  padR: number;
  padT: number;
  padB: number;
  plotW: number;
  plotH: number;
  minV: number;
  maxV: number;
  baseV: number;
  topV: number;
  fullRange: number;
}

/** يحسب أبعاد منطقة الرسم ومديات القيم للرسم العمودي. */
function calcVerticalAxis(
  spec: ChartSpec,
  opts: ChartOptions | undefined,
  padL: number,
  padR: number,
  padTBase: number,
  padB: number,
): AxisInfo {
  const showLegend = shouldShowLegend(spec, opts);
  const legendExtra = showLegend ? 18 : 0;
  const padT = padTBase + legendExtra;
  const plotW = CHART_W - padL - padR;
  const plotH = CHART_H - padT - padB;

  const maxV = Math.max(...spec.values, 1);
  const minV = Math.min(...spec.values, 0);
  const baseV = minV < 0 ? minV : 0;
  const topV = maxV > 0 ? maxV : 0;
  const fullRange = topV - baseV || 1;

  return { padL, padR, padT, padB, plotW, plotH, minV, maxV, baseV, topV, fullRange };
}

/** يولّد خطوط الشبكة الأفقية + تدرّج المحور الصادي. */
function drawYGrid(
  axis: AxisInfo,
  opts: ChartOptions | undefined,
): string[] {
  const parts: string[] = [];
  const gridCol = resolveGridColor(opts);
  const font = resolveFont(opts);
  const col = resolveColor(opts);
  const ticks = 4;

  for (let i = 0; i <= ticks; i++) {
    const v = axis.baseV + (axis.fullRange * i) / ticks;
    const y = axis.padT + axis.plotH - (axis.plotH * i) / ticks;
    parts.push(
      `<line x1="${axis.padL}" y1="${y}" x2="${CHART_W - axis.padR}" y2="${y}" stroke="${gridCol}" stroke-width="1"/>`,
    );
    parts.push(
      text(axis.padL - 6, y + 3, fmtNum(v), { size: 9, anchor: 'end', fontFamily: font, color: col }),
    );
  }
  return parts;
}

/** يولّد العناصر المشتركة: خلفية، عنوان، وسيلة إيضاح. */
function drawHeader(
  spec: ChartSpec,
  opts: ChartOptions | undefined,
  axis: AxisInfo,
): string[] {
  const parts: string[] = [];
  const font = resolveFont(opts);
  const col = resolveColor(opts);

  if (opts?.background) {
    parts.push(`<rect width="${CHART_W}" height="${CHART_H}" fill="${opts.background}" rx="6"/>`);
  }
  if (spec.title) {
    parts.push(
      text(CHART_W / 2, 16, spec.title, { size: 13, bold: true, fontFamily: font, color: col }),
    );
  }
  if (shouldShowLegend(spec, opts)) {
    const ly = spec.title ? 30 : 16;
    parts.push(buildTopLegend(spec, opts, axis.padL, ly, axis.plotW));
  }
  return parts;
}

// ============================================================
// bar — مخطط أعمدة رأسية
// ============================================================
function renderBarChart(spec: ChartSpec, opts?: ChartOptions): string {
  const axis = calcVerticalAxis(spec, opts, 44, 16, spec.title ? 32 : 14, 56);
  const palette = pal(opts);
  const font = resolveFont(opts);
  const col = resolveColor(opts);
  const opacity = opts?.opacity ?? 0.85;
  const rx = opts?.borderRadius ?? 3;
  const showValues = opts?.showValues !== false;
  const showGrid = opts?.showGrid !== false;

  const baseY = axis.padT + axis.plotH * (axis.topV / axis.fullRange);
  const n = spec.values.length;
  const slot = axis.plotW / n;
  const barW = Math.min(slot * 0.6, 56);

  const parts = drawHeader(spec, opts, axis);

  // شبكة المحور الصادي
  if (showGrid) parts.push(...drawYGrid(axis, opts));

  // الأعمدة
  spec.values.forEach((v, i) => {
    const cx = axis.padL + slot * i + slot / 2;
    const vNorm = (v - axis.baseV) / axis.fullRange;
    const barH = axis.plotH * Math.abs(vNorm);
    const y = v >= 0 ? baseY - barH : baseY;
    const bx = cx - barW / 2;
    const color = palette[i % palette.length];

    // ظلّ + عمود
    parts.push(barShadow(bx, y, barW, barH, rx));
    parts.push(
      `<rect x="${bx}" y="${y}" width="${barW}" height="${barH}" fill="${color}" opacity="${opacity}" rx="${rx}"/>`,
    );
    // القيمة فوق/تحت العمود
    if (showValues) {
      const valY = v >= 0 ? y - 4 : y + barH + 11;
      parts.push(text(cx, valY, fmtVal(v, spec.unit), { size: 9, fontFamily: font, color: col }));
    }
    // تسمية الفئة
    parts.push(
      text(cx, CHART_H - axis.padB + 18, spec.labels[i] ?? '', { size: 10, fontFamily: font, color: col }),
    );
  });

  // المحاور
  parts.push(
    `<line x1="${axis.padL}" y1="${baseY}" x2="${CHART_W - axis.padR}" y2="${baseY}" ${strokeAttr(col)}/>`,
  );
  parts.push(
    `<line x1="${axis.padL}" y1="${axis.padT}" x2="${axis.padL}" y2="${axis.padT + axis.plotH}" ${strokeAttr(col)}/>`,
  );

  return wrapSvg(parts.join(''), CHART_W, CHART_H, spec.title || spec.kind, opts);
}

// ============================================================
// horizontal_bar — مخطط أعمدة أفقية
// ============================================================
function renderHorizontalBarChart(spec: ChartSpec, opts?: ChartOptions): string {
  const palette = pal(opts);
  const gridCol = resolveGridColor(opts);
  const font = resolveFont(opts);
  const col = resolveColor(opts);
  const opacity = opts?.opacity ?? 0.85;
  const rx = opts?.borderRadius ?? 3;
  const showValues = opts?.showValues !== false;
  const showGrid = opts?.showGrid !== false;

  const showLegend = shouldShowLegend(spec, opts);
  const legendExtra = showLegend ? 18 : 0;
  const padT = (spec.title ? 32 : 14) + legendExtra;
  const padB = 28;
  const padL = 80;
  const padR = 44;
  const plotW = CHART_W - padL - padR;
  const plotH = CHART_H - padT - padB;

  const maxV = Math.max(...spec.values, 1);
  const minV = Math.min(...spec.values, 0);
  const baseV = minV < 0 ? minV : 0;
  const topV = maxV > 0 ? maxV : 0;
  const fullRange = topV - baseV || 1;
  // موضع خط الصفر على المحور الأفقي
  const baseX = padL + plotW * ((0 - baseV) / fullRange);

  const n = spec.values.length;
  const slot = plotH / n;
  const barH = Math.min(slot * 0.65, 36);

  const parts: string[] = [];

  // خلفية
  if (opts?.background) {
    parts.push(`<rect width="${CHART_W}" height="${CHART_H}" fill="${opts.background}" rx="6"/>`);
  }
  // عنوان
  if (spec.title) {
    parts.push(text(CHART_W / 2, 16, spec.title, { size: 13, bold: true, fontFamily: font, color: col }));
  }
  // وسيلة إيضاح
  if (showLegend) {
    const ly = spec.title ? 30 : 16;
    parts.push(buildTopLegend(spec, opts, padL, ly, plotW));
  }

  // شبكة عمودية
  if (showGrid) {
    const ticks = 4;
    for (let i = 0; i <= ticks; i++) {
      const v = baseV + (fullRange * i) / ticks;
      const x = padL + (plotW * i) / ticks;
      parts.push(
        `<line x1="${x}" y1="${padT}" x2="${x}" y2="${CHART_H - padB}" stroke="${gridCol}" stroke-width="1"/>`,
      );
      parts.push(text(x, CHART_H - padB + 14, fmtNum(v), { size: 9, fontFamily: font, color: col }));
    }
  }

  // الأعمدة الأفقية
  spec.values.forEach((v, i) => {
    const cy = padT + slot * i + slot / 2;
    // حساب موضع القيمة على المحور
    const valX = padL + plotW * ((v - baseV) / fullRange);
    const bx = v >= 0 ? baseX : valX;
    const bw = Math.abs(valX - baseX);
    const by = cy - barH / 2;
    const color = palette[i % palette.length];

    // ظلّ + عمود
    parts.push(barShadow(bx, by, bw, barH, rx));
    parts.push(
      `<rect x="${bx}" y="${by}" width="${bw}" height="${barH}" fill="${color}" opacity="${opacity}" rx="${rx}"/>`,
    );
    // القيمة بعد العمود
    if (showValues && bw > 2) {
      const valTxtX = v >= 0 ? bx + bw + 4 : bx - 4;
      const anchor: 'start' | 'end' = v >= 0 ? 'start' : 'end';
      parts.push(
        text(valTxtX, cy + 3, fmtVal(v, spec.unit), { size: 9, anchor, fontFamily: font, color: col }),
      );
    }
    // تسمية الفئة على اليسار
    parts.push(
      text(padL - 6, cy + 3, truncate(spec.labels[i] ?? '', 10), { size: 10, anchor: 'end', fontFamily: font, color: col }),
    );
  });

  // المحاور
  parts.push(
    `<line x1="${baseX}" y1="${padT}" x2="${baseX}" y2="${CHART_H - padB}" ${strokeAttr(col)}/>`,
  );
  parts.push(
    `<line x1="${padL}" y1="${CHART_H - padB}" x2="${CHART_W - padR}" y2="${CHART_H - padB}" ${strokeAttr(col)}/>`,
  );

  return wrapSvg(parts.join(''), CHART_W, CHART_H, spec.title || spec.kind, opts);
}

// ============================================================
// pie — مخطط دائري بنسب مئوية
// ============================================================
function renderPieChart(spec: ChartSpec, opts?: ChartOptions): string {
  const palette = pal(opts);
  const font = resolveFont(opts);
  const col = resolveColor(opts);
  const opacity = opts?.opacity ?? 0.85;
  const showValues = opts?.showValues !== false;

  const cx = 140;
  const cy = CHART_H / 2 + (spec.title ? 8 : 0);
  const r = 92;
  const legendX = 270;

  const total = spec.values.reduce((s, v) => s + Math.abs(v), 0) || 1;
  const parts: string[] = [];

  // خلفية
  if (opts?.background) {
    parts.push(`<rect width="${CHART_W}" height="${CHART_H}" fill="${opts.background}" rx="6"/>`);
  }
  // عنوان
  if (spec.title) {
    parts.push(text(CHART_W / 2, 18, spec.title, { size: 13, bold: true, fontFamily: font, color: col }));
  }

  // القطاعات
  let angle = -Math.PI / 2; // نبدأ من الأعلى
  spec.values.forEach((v, i) => {
    const frac = Math.abs(v) / total;
    const a2 = angle + frac * Math.PI * 2;
    const large = frac > 0.5 ? 1 : 0;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(a2);
    const y2 = cy + r * Math.sin(a2);
    const color = palette[i % palette.length];

    // القطاع: إن كانت قطعة وحيدة (≈100%) نرسم دائرة كاملة
    if (frac >= 0.9999) {
      parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${opacity}"/>`);
    } else {
      parts.push(
        `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z" fill="${color}" opacity="${opacity}" stroke="#fff" stroke-width="1.5"/>`,
      );
    }

    // النسبة المئوية وسط القطاع (إن كانت ≥ 5%)
    if (showValues && frac >= 0.05) {
      const midA = (angle + a2) / 2;
      const lx = cx + r * 0.62 * Math.cos(midA);
      const ly = cy + r * 0.62 * Math.sin(midA);
      parts.push(
        text(lx, ly + 3, `${Math.round(frac * 100)}%`, { size: 10, fontFamily: font, color: col }),
      );
    }
    angle = a2;
  });

  // وسيلة الإيضاح على اليمين (دائماً لـ pie)
  spec.labels.forEach((lbl, i) => {
    const ly = 40 + i * 22 + (spec.title ? 16 : 0);
    const color = palette[i % palette.length];
    const frac = Math.abs(spec.values[i] ?? 0) / total;
    parts.push(
      `<rect x="${legendX}" y="${ly - 9}" width="12" height="12" fill="${color}" opacity="${opacity}" rx="2"/>`,
    );
    parts.push(
      text(legendX + 18, ly, truncate(lbl, 14), { size: 10, anchor: 'start', fontFamily: font, color: col }),
    );
    parts.push(
      text(legendX + 140, ly, `${Math.round(frac * 100)}%`, { size: 10, anchor: 'end', fontFamily: font, color: col }),
    );
  });

  return wrapSvg(parts.join(''), CHART_W, CHART_H, spec.title || spec.kind, opts);
}

// ============================================================
// خطوط/نقاط مشتركة لـ line / area / scatter
// ============================================================
interface ComputedPoint {
  x: number;
  y: number;
}

/** يحوّل القيم إلى إحداثيات بكسل على منطقة الرسم. */
function toPoints(spec: ChartSpec, axis: AxisInfo): ComputedPoint[] {
  const n = spec.values.length;
  const xs = spec.xs;
  // مقياس أفقي عددي إن وُجد xs بطول مطابق (مبعثر/منحنى حقيقي)، وإلا توزيع منتظم بالترتيب
  let xAt: (i: number) => number;
  if (xs && xs.length === n) {
    const minX = Math.min(...xs);
    const rangeX = Math.max(...xs) - minX || 1;
    xAt = (i) => axis.padL + (axis.plotW * (xs[i]! - minX)) / rangeX;
  } else {
    xAt = (i) => axis.padL + (n === 1 ? axis.plotW / 2 : (axis.plotW * i) / (n - 1));
  }
  return spec.values.map((v, i) => ({
    x: xAt(i),
    y: axis.padT + axis.plotH - (axis.plotH * (v - axis.minV)) / axis.fullRange,
  }));
}

/** يولّد تسميات المحور الأفقي أسفل النقاط. */
function drawXLabels(
  pts: ComputedPoint[],
  spec: ChartSpec,
  axis: AxisInfo,
  opts: ChartOptions | undefined,
): string[] {
  const font = resolveFont(opts);
  const col = resolveColor(opts);
  return pts.map((p, i) =>
    text(p.x, CHART_H - axis.padB + 18, spec.labels[i] ?? '', { size: 10, fontFamily: font, color: col }),
  );
}

/** يولّد المحاور لرسم عمودي. */
function drawAxes(axis: AxisInfo, opts: ChartOptions | undefined): string[] {
  const col = resolveColor(opts);
  const baseline = axis.padT + axis.plotH;
  return [
    `<line x1="${axis.padL}" y1="${baseline}" x2="${CHART_W - axis.padR}" y2="${baseline}" ${strokeAttr(col)}/>`,
    `<line x1="${axis.padL}" y1="${axis.padT}" x2="${axis.padL}" y2="${baseline}" ${strokeAttr(col)}/>`,
  ];
}

// ============================================================
// line — مخطط خطّي/منحنى
// ============================================================
function renderLineChart(spec: ChartSpec, opts?: ChartOptions): string {
  const axis = calcVerticalAxis(spec, opts, 44, 16, spec.title ? 34 : 18, 50);
  const palette = pal(opts);
  const font = resolveFont(opts);
  const col = resolveColor(opts);
  const showValues = opts?.showValues !== false;
  const showGrid = opts?.showGrid !== false;

  const pts = toPoints(spec, axis);
  const parts = drawHeader(spec, opts, axis);

  // شبكة + تدرّج
  if (showGrid) parts.push(...drawYGrid(axis, opts));

  // المنحنى
  const lineColor = palette[0];
  const path = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
  parts.push(
    `<path d="${path}" fill="none" stroke="${lineColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`,
  );

  // النقاط والقيم والتسميات
  pts.forEach((p, i) => {
    parts.push(
      `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="${lineColor}"/>`,
    );
    if (showValues) {
      parts.push(
        text(p.x, p.y - 8, fmtVal(spec.values[i]!, spec.unit), { size: 9, fontFamily: font, color: col }),
      );
    }
  });
  parts.push(...drawXLabels(pts, spec, axis, opts));

  // المحاور
  parts.push(...drawAxes(axis, opts));

  return wrapSvg(parts.join(''), CHART_W, CHART_H, spec.title || spec.kind, opts);
}

// ============================================================
// area — مخطط مساحة (مثل الخطّي لكن بملء تحت المنحنى)
// ============================================================
function renderAreaChart(spec: ChartSpec, opts?: ChartOptions): string {
  const axis = calcVerticalAxis(spec, opts, 44, 16, spec.title ? 34 : 18, 50);
  const palette = pal(opts);
  const font = resolveFont(opts);
  const col = resolveColor(opts);
  const showValues = opts?.showValues !== false;
  const showGrid = opts?.showGrid !== false;

  const pts = toPoints(spec, axis);
  const baseline = axis.padT + axis.plotH;
  const parts = drawHeader(spec, opts, axis);

  // شبكة
  if (showGrid) parts.push(...drawYGrid(axis, opts));

  // المنطقة المملوءة
  const areaColor = palette[0];
  const linePath = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');
  // إغلاق المسار: من آخر نقطة نزولاً لخط الأساس ثم رجوعاً لأول نقطة
  const closing = ` L ${pts[pts.length - 1].x.toFixed(1)} ${baseline} L ${pts[0].x.toFixed(1)} ${baseline} Z`;
  parts.push(
    `<path d="${linePath}${closing}" fill="${areaColor}" opacity="0.18" stroke="none"/>`,
  );
  // خط الحد الأعلى
  parts.push(
    `<path d="${linePath}" fill="none" stroke="${areaColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  );

  // النقاط والقيم والتسميات
  pts.forEach((p, i) => {
    parts.push(
      `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3" fill="${areaColor}"/>`,
    );
    if (showValues) {
      parts.push(
        text(p.x, p.y - 8, fmtVal(spec.values[i]!, spec.unit), { size: 9, fontFamily: font, color: col }),
      );
    }
  });
  parts.push(...drawXLabels(pts, spec, axis, opts));

  // المحاور
  parts.push(...drawAxes(axis, opts));

  return wrapSvg(parts.join(''), CHART_W, CHART_H, spec.title || spec.kind, opts);
}

// ============================================================
// scatter — مخطط انتشار (نقاط فقط بدون خطوط ربط)
// ============================================================
function renderScatterChart(spec: ChartSpec, opts?: ChartOptions): string {
  const axis = calcVerticalAxis(spec, opts, 44, 16, spec.title ? 34 : 18, 50);
  const palette = pal(opts);
  const font = resolveFont(opts);
  const col = resolveColor(opts);
  const opacity = opts?.opacity ?? 0.85;
  const showValues = opts?.showValues !== false;
  const showGrid = opts?.showGrid !== false;

  const pts = toPoints(spec, axis);
  const parts = drawHeader(spec, opts, axis);

  // شبكة
  if (showGrid) parts.push(...drawYGrid(axis, opts));

  // النقاط (كل نقطة بلون مختلف من اللوحة)
  pts.forEach((p, i) => {
    const dotColor = palette[i % palette.length];
    // هالة خفيفة حول النقطة
    parts.push(
      `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="7" fill="${dotColor}" opacity="0.15"/>`,
    );
    // النقطة نفسها
    parts.push(
      `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" fill="${dotColor}" opacity="${opacity}"/>`,
    );
    // إطار أبيض رقيق
    parts.push(
      `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" fill="none" stroke="#fff" stroke-width="1.5"/>`,
    );
    if (showValues) {
      parts.push(
        text(p.x, p.y - 11, fmtVal(spec.values[i]!, spec.unit), { size: 9, fontFamily: font, color: col }),
      );
    }
  });
  parts.push(...drawXLabels(pts, spec, axis, opts));

  // المحاور
  parts.push(...drawAxes(axis, opts));

  return wrapSvg(parts.join(''), CHART_W, CHART_H, spec.title || spec.kind, opts);
}

// ============================================================
// pyramid — هرم/تصنيف شجري (من القمة للقاعدة)
// ============================================================
function renderPyramid(spec: ChartSpec, opts?: ChartOptions): string {
  const palette = pal(opts);
  const font = resolveFont(opts);
  const col = resolveColor(opts);
  const opacity = opts?.opacity ?? 0.85;
  const showValues = opts?.showValues !== false;

  const cx = CHART_W / 2;
  const top = spec.title ? 34 : 18;
  const bottom = CHART_H - 24;
  const totalH = bottom - top;
  const maxW = 260;

  const n = spec.labels.length;
  const levelH = totalH / n;
  const parts: string[] = [];

  // خلفية
  if (opts?.background) {
    parts.push(`<rect width="${CHART_W}" height="${CHART_H}" fill="${opts.background}" rx="6"/>`);
  }

  // المستويات
  spec.labels.forEach((lbl, i) => {
    const wTop = (maxW * i) / n;
    const wBot = (maxW * (i + 1)) / n;
    const yT = top + i * levelH;
    const yB = yT + levelH;
    const color = palette[i % palette.length];
    // شبه منحرف: ضيّق في الأعلى، واسع في الأسفل
    parts.push(
      `<path d="M ${cx - wTop / 2} ${yT} L ${cx + wTop / 2} ${yT} L ${cx + wBot / 2} ${yB} L ${cx - wBot / 2} ${yB} Z" fill="${color}" opacity="${opacity}" stroke="#fff" stroke-width="1.5"/>`,
    );
    // التسمية في وسط المستوى
    const midY = (yT + yB) / 2;
    let lblText = lbl;
    if (showValues && spec.values[i] !== undefined) {
      lblText = `${lbl}: ${fmtVal(spec.values[i], spec.unit)}`;
    }
    parts.push(text(cx, midY + 4, lblText, { size: 11, fontFamily: font, color: col }));
  });

  // عنوان
  if (spec.title) {
    parts.push(text(cx, 18, spec.title, { size: 13, bold: true, fontFamily: font, color: col }));
  }

  return wrapSvg(parts.join(''), CHART_W, CHART_H, spec.title || spec.kind, opts);
}

// ============================================================
// الموزّع العام للمخططات
// ============================================================
export function renderChart(spec: ChartSpec, opts?: ChartOptions): string {
  try {
    const parsed = chartSpecSchema.safeParse(spec);
    if (!parsed.success) return '';
    const s = parsed.data;

    switch (s.kind) {
      case 'bar':
        return renderBarChart(s, opts);
      case 'horizontal_bar':
        return renderHorizontalBarChart(s, opts);
      case 'pie':
        return renderPieChart(s, opts);
      case 'line':
        return renderLineChart(s, opts);
      case 'area':
        return renderAreaChart(s, opts);
      case 'scatter':
        return renderScatterChart(s, opts);
      case 'pyramid':
        return renderPyramid(s, opts);
      default:
        return '';
    }
  } catch {
    // مبدأ "لا يرمي أبداً"
    return '';
  }
}