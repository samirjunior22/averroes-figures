// ============================================================
// دارات كهربائية — أنواع ومُولِّد الدارات الكهربائية
// ============================================================
// يدعم: دارات تسلسلية ومتوازية مع تسميات اختيارية.
// مكوّنات: مولّد، بطارية، مصباح، قاطع، مقاومة، أمبيرمتر،
// فولتمتر، محرّك، سلك، صمام ثنائي باعث للضوء، مكثف، جرس.
// لا يرمي أبداً — مُدخَلات غير صالحة → سلسلة فارغة.
// ============================================================

import { z } from 'zod';
import {
  esc,
  text,
  wrapSvg,
  resolveColor,
  resolveFont,
  strokeAttr,
  fillAttr,
} from './shared.js';
import type { RenderOptions } from './shared.js';

// ------------------------------------------------------------
// مخطّط المكوّنات الكهربائية
// ------------------------------------------------------------
export const circuitComponentSchema = z.enum([
  'generator',   // مولّد كهربائي
  'battery',     // بطارية (= مصدر)
  'lamp',        // مصباح
  'switch',      // قاطع تيار
  'resistor',    // مقاومة (ناقل أومي)
  'ammeter',     // أمبيرمتر
  'voltmeter',   // فولتمتر
  'motor',       // محرّك كهربائي
  'wire',        // سلك توصيل (بلا رمز مميّز)
  'led',         // صمام ثنائي باعث للضوء
  'capacitor',   // مكثّف
  'buzzer',      // جرس كهربائي
]);
export type CircuitComponent = z.infer<typeof circuitComponentSchema>;

// ------------------------------------------------------------
// مخطّط مواصفات الدارة
// ------------------------------------------------------------
export const circuitSpecSchema = z.object({
  layout: z.enum(['series', 'parallel']).default('series'),
  components: z.array(circuitComponentSchema).min(1).max(10),
  /** تسميات اختيارية لكل مكوّن بالترتيب (مثل ['G', 'K', 'L']). */
  labels: z.array(z.string().max(8)).max(10).optional(),
  /** في الدارات المتوازية: مكوّنات الفرع الثاني (الفروع الأولى في components). */
  branch2: z.array(circuitComponentSchema).max(8).optional(),
}).strict();
export type CircuitSpec = z.infer<typeof circuitSpecSchema>;

// ------------------------------------------------------------
// ثوابت ومساعدات داخلية
// ------------------------------------------------------------

/** أنواع المصادر الكهربائية. */
const SRC_TYPES = new Set<CircuitComponent>(['generator', 'battery']);

/** عنصر موضوع على فرع مع فهرس تسميته الأصلي. */
interface PlacedItem {
  comp: CircuitComponent;
  labelIdx?: number;
}

// ------------------------------------------------------------
// رموز المكوّنات
// ------------------------------------------------------------

/**
 * يرسم رمز مكوّن على سلك أفقي عند الموضع (cx, y).
 * يُعيد نصف عرض الفجوة والـ SVG الناتج.
 */
function hSymbol(
  comp: CircuitComponent,
  cx: number,
  y: number,
  col: string,
  font: string,
): { hw: number; svg: string } {
  const s = strokeAttr(col);
  const f = fillAttr(col);

  switch (comp) {
    // --- مصباح: دائرة فيها خطّان متقاطعان ---
    case 'lamp':
      return {
        hw: 10,
        svg:
          `<circle cx="${cx}" cy="${y}" r="10" ${s}/>` +
          `<line x1="${cx - 7}" y1="${y - 7}" x2="${cx + 7}" y2="${y + 7}" ${s}/>` +
          `<line x1="${cx - 7}" y1="${y + 7}" x2="${cx + 7}" y2="${y - 7}" ${s}/>`,
      };

    // --- قاطع: نقطتا توصيل مع ذراع مفتوح ---
    case 'switch':
      return {
        hw: 12,
        svg:
          `<circle cx="${cx - 12}" cy="${y}" r="2" ${f}/>` +
          `<circle cx="${cx + 12}" cy="${y}" r="2" ${f}/>` +
          `<line x1="${cx - 12}" y1="${y}" x2="${cx + 10}" y2="${y - 11}" ${s}/>`,
      };

    // --- مقاومة: مستطيل ---
    case 'resistor':
      return {
        hw: 14,
        svg: `<rect x="${cx - 14}" y="${y - 6}" width="28" height="12" ${s}/>`,
      };

    // --- أمبيرمتر ---
    case 'ammeter':
      return { hw: 12, svg: meterCircle(cx, y, 'A', col, font) };

    // --- فولتمتر ---
    case 'voltmeter':
      return { hw: 12, svg: meterCircle(cx, y, 'V', col, font) };

    // --- محرّك ---
    case 'motor':
      return { hw: 12, svg: meterCircle(cx, y, 'M', col, font) };

    // --- مصدر (مولّد أو بطارية) على سلك أفقي: صفيحتان عموديتان ---
    case 'generator':
    case 'battery':
      return {
        hw: 8,
        svg:
          `<line x1="${cx - 4}" y1="${y - 11}" x2="${cx - 4}" y2="${y + 11}" ${s}/>` +
          `<line x1="${cx + 4}" y1="${y - 6}" x2="${cx + 4}" y2="${y + 6}" ${s}/>`,
      };

    // --- صمام ثنائي باعث للضوء: مثلّث + خطّ كاثود + سهام إشعاع ---
    case 'led':
      return {
        hw: 12,
        svg:
          `<polygon points="${cx - 8},${y - 8} ${cx - 8},${y + 8} ${cx + 8},${y}" ${s}/>` +
          `<line x1="${cx + 8}" y1="${y - 9}" x2="${cx + 8}" y2="${y + 9}" ${s}/>` +
          `<polyline points="${cx + 1},${y - 10} ${cx + 4},${y - 14} ${cx + 7},${y - 10}" ${s}/>` +
          `<polyline points="${cx + 5},${y - 7} ${cx + 8},${y - 11} ${cx + 11},${y - 7}" ${s}/>`,
      };

    // --- مكثّف: صفيحتان متوازيتان مع فجوة ---
    case 'capacitor':
      return {
        hw: 4,
        svg:
          `<line x1="${cx - 3}" y1="${y - 10}" x2="${cx - 3}" y2="${y + 10}" ${s}/>` +
          `<line x1="${cx + 3}" y1="${y - 10}" x2="${cx + 3}" y2="${y + 10}" ${s}/>`,
      };

    // --- جرس: دائرة فيها رمز الموجة ---
    case 'buzzer':
      return {
        hw: 12,
        svg:
          `<circle cx="${cx}" cy="${y}" r="12" ${s}/>` +
          text(cx, y + 5, esc('~'), { size: 16, color: col, fontFamily: font }),
      };

    // --- سلك: لا رمز ---
    case 'wire':
    default:
      return { hw: 0, svg: '' };
  }
}

/** دائرة متر مع حرف داخلها (أمبيرمتر / فولتمتر / محرّك). */
function meterCircle(
  cx: number,
  y: number,
  letter: string,
  col: string,
  font: string,
): string {
  return (
    `<circle cx="${cx}" cy="${y}" r="12" ${strokeAttr(col)}/>` +
    text(cx, y + 4, letter, { size: 12, bold: true, color: col, fontFamily: font })
  );
}

/** رمز المصدر على حافة عمودية (صفحتان أفقيتان: طويلة وقصيرة). */
function vSource(x: number, cy: number, col: string): string {
  const s = strokeAttr(col);
  return (
    `<line x1="${x - 14}" y1="${cy - 4}" x2="${x + 14}" y2="${cy - 4}" ${s}/>` +
    `<line x1="${x - 7}" y1="${cy + 5}" x2="${x + 7}" y2="${cy + 5}" ${s}/>`
  );
}

/** رمز قاطع على حافة عمودية (ذراع مفتوح بين نقطتيّ توصيل). */
function vSwitch(x: number, y1: number, y2: number, col: string): string {
  const s = strokeAttr(col);
  const f = fillAttr(col);
  const mid = (y1 + y2) / 2;
  const g = 10; // نصف الفجوة
  return (
    `<line x1="${x}" y1="${y1}" x2="${x}" y2="${mid - g}" ${s}/>` +
    `<circle cx="${x}" cy="${mid - g}" r="2" ${f}/>` +
    `<circle cx="${x}" cy="${mid + g}" r="2" ${f}/>` +
    `<line x1="${x}" y1="${mid - g}" x2="${x + 11}" y2="${mid + g - 2}" ${s}/>` +
    `<line x1="${x}" y1="${mid + g}" x2="${x}" y2="${y2}" ${s}/>`
  );
}

/** نقطة تقاطع مملوءة عند تفرّع الأسلاك. */
function juncDot(x: number, y: number, col: string): string {
  return `<circle cx="${x}" cy="${y}" r="3" ${fillAttr(col)}/>`;
}

/** سهم اتجاه التيّار على سلك أفقي. */
function currentArrow(
  x: number,
  y: number,
  dir: 'left' | 'right',
  col: string,
): string {
  const s = strokeAttr(col);
  const f = fillAttr(col);
  // d سالب ← سهم لليمين (رأس عند x)، d موجب ← سهم لليسار
  const d = dir === 'right' ? -1 : 1;
  return (
    `<polygon points="${x},${y} ${x + d * 6},${y - 4} ${x + d * 6},${y + 4}" ${f}/>` +
    `<line x1="${x + d * 6}" y1="${y}" x2="${x + d * 13}" y2="${y}" ${s}/>`
  );
}

// ------------------------------------------------------------
// بناء فرع أفقي مع مكوّنات وتسميات
// ------------------------------------------------------------

/**
 * يوزّع المكوّنات على سلك أفقي من xStart إلى xEnd
 * ويعيد SVG السلك والرموز والتسميات.
 */
function buildBranch(
  items: PlacedItem[],
  y: number,
  xStart: number,
  xEnd: number,
  col: string,
  font: string,
  labels: string[] | undefined,
): string {
  const s = strokeAttr(col);
  const parts: string[] = [];

  // فرع فارغ → سلك مستقيم
  if (items.length === 0) {
    return `<line x1="${xStart}" y1="${y}" x2="${xEnd}" y2="${y}" ${s}/>`;
  }

  const n = items.length;
  const margin = 15;
  const iStart = xStart + margin;
  const iEnd = xEnd - margin;

  // حساب المراكز بتوزيع متساوٍ
  const positions: number[] = items.map((_, i) =>
    n === 1
      ? (xStart + xEnd) / 2
      : iStart + (i * (iEnd - iStart)) / (n - 1),
  );

  let cursor = xStart;

  for (let i = 0; i < n; i++) {
    const { comp, labelIdx } = items[i]!;
    const cx = positions[i]!;
    const { hw, svg } = hSymbol(comp, cx, y, col, font);

    // سلك قبل الرمز (يُتجنَّب الخطوط ذات الطول صفر)
    if (cx - hw > cursor + 0.5) {
      parts.push(
        `<line x1="${cursor}" y1="${y}" x2="${cx - hw}" y2="${y}" ${s}/>`,
      );
    }

    // رسم الرمز
    if (svg) parts.push(svg);

    // التسمية أسفل الرمز
    if (
      labels &&
      labelIdx !== undefined &&
      labelIdx < labels.length &&
      labels[labelIdx]
    ) {
      parts.push(
        text(cx, y + 20, labels[labelIdx]!, {
          size: 10,
          color: col,
          fontFamily: font,
        }),
      );
    }

    cursor = cx + hw;
  }

  // سلك بعد آخر رمز
  if (xEnd > cursor + 0.5) {
    parts.push(
      `<line x1="${cursor}" y1="${y}" x2="${xEnd}" y2="${y}" ${s}/>`,
    );
  }

  return parts.join('');
}

// ------------------------------------------------------------
// دارة تسلسلية
// ------------------------------------------------------------

function renderSeries(
  spec: CircuitSpec,
  col: string,
  font: string,
  opts: RenderOptions | undefined,
): string {
  const W = 300;
  const H = 170;
  const xL = 40;
  const xR = 260;
  const yT = 45;
  const yB = 135;
  const cyMid = 90; // مركز الحافة اليسرى للمصدر
  const s = strokeAttr(col);

  const comps = spec.components;
  const labels = spec.labels;

  // أوّل مصدر (مولّد أو بطارية) يوضع على الحافة اليسرى
  const srcIdx = comps.findIndex((c) => SRC_TYPES.has(c));
  const hasSource = srcIdx !== -1;

  // المكوّنات المتبقية على السلك العلوي (باستثناء المصدر والأسلاك)
  const topItems: PlacedItem[] = [];
  for (let i = 0; i < comps.length; i++) {
    if (i === srcIdx || comps[i] === 'wire') continue;
    topItems.push({ comp: comps[i]!, labelIdx: i });
  }

  const parts: string[] = [];

  // --- السلك العلوي مع المكوّنات ---
  parts.push(buildBranch(topItems, yT, xL, xR, col, font, labels));

  // --- الحافة اليسرى (المصدر أو سلك مستقيم) ---
  if (hasSource) {
    parts.push(`<line x1="${xL}" y1="${yT}" x2="${xL}" y2="${cyMid - 9}" ${s}/>`);
    parts.push(vSource(xL, cyMid, col));
    parts.push(`<line x1="${xL}" y1="${cyMid + 9}" x2="${xL}" y2="${yB}" ${s}/>`);
    // تسمية المصدر
    if (labels && srcIdx < labels.length && labels[srcIdx]) {
      parts.push(
        text(xL, yB + 18, labels[srcIdx]!, {
          size: 10,
          color: col,
          fontFamily: font,
        }),
      );
    }
  } else {
    parts.push(`<line x1="${xL}" y1="${yT}" x2="${xL}" y2="${yB}" ${s}/>`);
  }

  // --- الحافة اليمنى ---
  parts.push(`<line x1="${xR}" y1="${yT}" x2="${xR}" y2="${yB}" ${s}/>`);

  // --- السلك السفلي ---
  parts.push(`<line x1="${xL}" y1="${yB}" x2="${xR}" y2="${yB}" ${s}/>`);

  // --- نقاط التقاطع عند الزوايا الأربع ---
  parts.push(juncDot(xL, yT, col));
  parts.push(juncDot(xR, yT, col));
  parts.push(juncDot(xL, yB, col));
  parts.push(juncDot(xR, yB, col));

  // --- سهم اتجاه التيّار على السلك السفلي (من اليمين إلى اليسار) ---
  parts.push(currentArrow((xL + xR) / 2, yB, 'left', col));

  return wrapSvg(parts.join(''), W, H, 'دارة كهربائية تسلسلية', opts);
}

// ------------------------------------------------------------
// دارة متوازية
// ------------------------------------------------------------

function renderParallel(
  spec: CircuitSpec,
  col: string,
  font: string,
  opts: RenderOptions | undefined,
): string {
  const W = 360;
  const H = 200;
  const xL = 40;   // الحافة اليسرى (المصدر)
  const xR = 310;   // الحافة اليمنى (القاطع)
  const yTop = 45;  // الفرع الأوّل (أعلى)
  const yBot = 150; // الفرع الثاني (أسفل)
  const cyMid = 98; // مركز المصدر ≈ (45+150)/2
  const jL = 95;    // نقطة تقاطع الفرع الأيسر
  const jR = 255;   // نقطة تقاطع الفرع الأيمن
  const s = strokeAttr(col);

  const comps = spec.components;
  const b2 = spec.branch2 ?? [];
  const labels = spec.labels;

  // --- فهرسة المصدر والقاطع في كلا الفرعين ---
  const srcIdx1 = comps.findIndex((c) => SRC_TYPES.has(c));
  const srcIdx2 = b2.findIndex((c) => SRC_TYPES.has(c));
  const swIdx1 = comps.findIndex((c) => c === 'switch');
  const swIdx2 = b2.findIndex((c) => c === 'switch');

  // --- استخراج المصدر (الأولوية: components ثم branch2) ---
  let srcLabel: string | undefined;
  let hasSrc = false;

  if (srcIdx1 !== -1) {
    hasSrc = true;
    srcLabel = labels?.[srcIdx1];
  } else if (srcIdx2 !== -1) {
    hasSrc = true;
  }

  // --- استخراج القاطع (الأولوية: components ثم branch2) ---
  let swLabel: string | undefined;
  let hasSw = false;

  if (swIdx1 !== -1) {
    hasSw = true;
    swLabel = labels?.[swIdx1];
  } else if (swIdx2 !== -1) {
    hasSw = true;
  }

  // --- بناء الفرع الأوّل (components بعد حذف المصدر والقاطع والأسلاك) ---
  const branch1: PlacedItem[] = [];
  for (let i = 0; i < comps.length; i++) {
    if (i === srcIdx1 || i === swIdx1 || comps[i] === 'wire') continue;
    branch1.push({ comp: comps[i]!, labelIdx: i });
  }

  // --- بناء الفرع الثاني (branch2 بعد حذف المصدر والقاطع والأسلاك) ---
  const branch2Items: PlacedItem[] = [];
  for (let i = 0; i < b2.length; i++) {
    if (i === srcIdx2 || i === swIdx2 || b2[i] === 'wire') continue;
    branch2Items.push({ comp: b2[i]! });
  }

  const parts: string[] = [];

  // --- الحافة اليسرى مع المصدر ---
  if (hasSrc) {
    parts.push(`<line x1="${xL}" y1="${yTop}" x2="${xL}" y2="${cyMid - 9}" ${s}/>`);
    parts.push(vSource(xL, cyMid, col));
    parts.push(`<line x1="${xL}" y1="${cyMid + 9}" x2="${xL}" y2="${yBot}" ${s}/>`);
    if (srcLabel) {
      parts.push(
        text(xL, yBot + 18, srcLabel, {
          size: 10,
          color: col,
          fontFamily: font,
        }),
      );
    }
  } else {
    parts.push(`<line x1="${xL}" y1="${yTop}" x2="${xL}" y2="${yBot}" ${s}/>`);
  }

  // --- الحافة اليمنى مع القاطع ---
  if (hasSw) {
    parts.push(vSwitch(xR, yTop, yBot, col));
    if (swLabel) {
      parts.push(
        text(xR, yBot + 18, swLabel, {
          size: 10,
          color: col,
          fontFamily: font,
        }),
      );
    }
  } else {
    parts.push(`<line x1="${xR}" y1="${yTop}" x2="${xR}" y2="${yBot}" ${s}/>`);
  }

  // --- الأسلاك الأفقية الجانبية ---
  // يسار: من الحافة اليسرى إلى نقطة التقاطع اليسرى
  parts.push(`<line x1="${xL}" y1="${yTop}" x2="${jL}" y2="${yTop}" ${s}/>`);
  parts.push(`<line x1="${xL}" y1="${yBot}" x2="${jL}" y2="${yBot}" ${s}/>`);
  // يمين: من نقطة التقاطع اليمنى إلى الحافة اليمنى
  parts.push(`<line x1="${jR}" y1="${yTop}" x2="${xR}" y2="${yTop}" ${s}/>`);
  parts.push(`<line x1="${jR}" y1="${yBot}" x2="${xR}" y2="${yBot}" ${s}/>`);

  // --- أسلاك تقاطع الفروع (عمودية) ---
  parts.push(`<line x1="${jL}" y1="${yTop}" x2="${jL}" y2="${yBot}" ${s}/>`);
  parts.push(`<line x1="${jR}" y1="${yTop}" x2="${jR}" y2="${yBot}" ${s}/>`);

  // --- الفرع الأوّل مع المكوّنات ---
  parts.push(buildBranch(branch1, yTop, jL, jR, col, font, labels));

  // --- الفرع الثاني مع المكوّنات (بلا تسميات مخصّصة) ---
  parts.push(buildBranch(branch2Items, yBot, jL, jR, col, font, undefined));

  // --- نقاط التقاطع عند التفريعات ---
  parts.push(juncDot(jL, yTop, col));
  parts.push(juncDot(jL, yBot, col));
  parts.push(juncDot(jR, yTop, col));
  parts.push(juncDot(jR, yBot, col));

  // --- نقاط الزوايا عند الحواف ---
  parts.push(juncDot(xL, yTop, col));
  parts.push(juncDot(xL, yBot, col));
  parts.push(juncDot(xR, yTop, col));
  parts.push(juncDot(xR, yBot, col));

  // --- سهم اتجاه التيّار على السلك العلوي الأيسر (من المصدر إلى اليمين) ---
  parts.push(currentArrow((xL + jL) / 2, yTop, 'right', col));

  return wrapSvg(parts.join(''), W, H, 'دارة كهربائية متوازية', opts);
}

// ------------------------------------------------------------
// الدالّة الرئيسية — تصيير الدارة الكهربائية
// ------------------------------------------------------------

export function renderCircuit(
  spec: CircuitSpec,
  opts?: RenderOptions,
): string {
  try {
    const col = resolveColor(opts);
    const font = resolveFont(opts);
    return spec.layout === 'parallel'
      ? renderParallel(spec, col, font, opts)
      : renderSeries(spec, col, font, opts);
  } catch {
    return '';
  }
}