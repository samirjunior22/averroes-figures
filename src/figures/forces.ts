// ============================================================
// Forces Generator — مولّد متجهات القوى (فيزياء - ميكانيك)
// ============================================================
// يرسم جسماً (صندوق/كرة/مستوى مائل) مع متجهات قوى مُسمّاة
// بأطوال نسبية وألوان دلالية.
//
// الرمز في الـproxy:  [[قوى: صندوق ; وزن:أسفل ; رد فعل:أعلى ; شد:يمين]]
// ============================================================

import { z } from 'zod';
import type { RenderOptions } from './shared.js';
import {
  esc,
  text,
  wrapSvg,
  resolveColor,
  strokeAttr,
  strokeThinAttr,
  fillAttr,
} from './shared.js';

// ------------------------------------------------------------
// مخطّطات Zod
// ------------------------------------------------------------

/** اتجاه المتجه: الأ directions الأساسية أو زاوية بالدرجات. */
const directionSchema = z.union([
  z.enum(['up', 'down', 'left', 'right']),
  z.number().min(0).max(359),
]);

/** متجه قوة واحد. */
export const forceVectorSchema = z
  .object({
    dir: directionSchema.describe('اتجاه القوة (up/down/left/right أو زاوية بالدرجات)'),
    label: z
      .string()
      .max(8)
      .describe('تسمية القوة مثل P, R, T, F'),
    mag: z
      .number()
      .positive()
      .optional()
      .describe('المقدار النسبي (يُحدّد طول السهم)'),
  })
  .strict();

export type ForceVector = z.infer<typeof forceVectorSchema>;

/** شكل الجسم. */
const bodyTypeSchema = z.enum([
  'box',
  'ball',
  'incline',
]);

/** مواصفات مولّد القوى. */
export const forcesSpecSchema = z
  .object({
    body: bodyTypeSchema.describe('شكل الجسم (صندوق/كرة/مستوى مائل)'),
    vectors: z
      .array(forceVectorSchema)
      .min(1)
      .max(6)
      .describe('متجهات القوى المطبّقة على الجسم'),
    angle: z
      .number()
      .min(10)
      .max(80)
      .optional()
      .describe('زاوية الميل بالدرجات (للمستوى المائل فقط)'),
  })
  .strict();

export type ForcesSpec = z.infer<typeof forcesSpecSchema>;

// ------------------------------------------------------------
// ثوابت
// ------------------------------------------------------------

const W = 320;
const H = 240;

/** ألوان دلالية للقوى حسب الاتجاه. */
const FORCE_COLORS: Record<string, string> = {
  down: '#ef4444',   // أحمر — وزن
  up: '#3b82f6',     // أزرق — رد فعل
  right: '#10b981',  // أخضر — شد / حركة
  left: '#f59e0b',   // برتقالي — احتكاك
};

/** طول السهم الأساسي (بكسل) — يُضرب بالمقدار النسبي. */
const BASE_ARROW = 55;
/** حجم خطأ الجسم (الصندوق). */
const BOX_SIZE = 50;
/** نصف قطر الكرة. */
const BALL_R = 25;

// ------------------------------------------------------------
// مساعدات الرسم
// ------------------------------------------------------------

/** يحوّل اتجاه إلى زاوية بالدرجات (من المحور الأفقي الموجب، عكس عقارب الساعة). */
function dirToAngle(dir: string | number): number {
  if (typeof dir === 'number') return dir;
  switch (dir) {
    case 'up': return 90;
    case 'down': return 270;
    case 'left': return 180;
    case 'right': return 0;
    default: return 0;
  }
}

/** يحوّل الزاوية بالدرجات إلى راديان. */
function degToRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/** يحوّل الاتجاه إلى لون دلالي. */
function forceColor(dir: string | number): string {
  if (typeof dir === 'string' && FORCE_COLORS[dir]) return FORCE_COLORS[dir];
  return '#8b5cf6'; // بنفسجي — زاوية مخصصة
}

/** يرسم رأس سهم عند نقطة النهاية. */
function arrowHead(x: number, y: number, angleDeg: number, color: string): string {
  const rad = degToRad(angleDeg);
  const len = 10;
  const spread = 0.45; // نصف زاوية الرأس (راديان)
  const x1 = x - len * Math.cos(rad - spread);
  const y1 = y + len * Math.sin(rad - spread);
  const x2 = x - len * Math.cos(rad + spread);
  const y2 = y + len * Math.sin(rad + spread);
  return `<polygon points="${x},${y} ${x1},${y1} ${x2},${y2}" fill="${color}" stroke="none"/>`;
}

/** يرسم سهم (خط + رأس) من نقطة بداية في اتجاه معيّن بطول محدّد. */
function drawArrow(
  ox: number,
  oy: number,
  angleDeg: number,
  length: number,
  color: string,
  label: string,
  labelSide: 'above' | 'below' | 'left' | 'right',
): string {
  const rad = degToRad(angleDeg);
  const ex = ox + length * Math.cos(rad);
  const ey = oy - length * Math.sin(rad);

  const line = `<line x1="${ox}" y1="${oy}" x2="${ex}" y2="${ey}" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`;
  const head = arrowHead(ex, ey, angleDeg, color);

  // موضع التسمية
  let lx = (ox + ex) / 2;
  let ly = (oy + ey) / 2;
  let anchor: 'start' | 'middle' | 'end' = 'middle';

  switch (labelSide) {
    case 'above':
      ly -= 10;
      break;
    case 'below':
      ly += 16;
      break;
    case 'left':
      lx -= 12;
      anchor = 'end';
      break;
    case 'right':
      lx += 12;
      anchor = 'start';
      break;
  }

  const labelSvg = text(lx, ly, label, { size: 12, bold: true, color, anchor });

  return line + head + labelSvg;
}

/** يحدّد أفضل جهة للتسمية بناءً على الاتجاه. */
function labelSideForDir(dir: string | number): 'above' | 'below' | 'left' | 'right' {
  if (typeof dir === 'number') {
    if (dir > 45 && dir < 135) return 'left';
    if (dir >= 135 && dir <= 225) return 'above';
    if (dir > 225 && dir < 315) return 'right';
    return 'above';
  }
  switch (dir) {
    case 'up': return 'right';
    case 'down': return 'right';
    case 'left': return 'above';
    case 'right': return 'above';
    default: return 'above';
  }
}

// ------------------------------------------------------------
// رسم الأجسام
// ------------------------------------------------------------

/** يرسم صندوقاً في المركز. */
function drawBox(cx: number, cy: number, size: number, color: string): string {
  const x = cx - size / 2;
  const y = cy - size / 2;
  return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="4" ${strokeAttr(color)} />`;
}

/** يرسم كرة في المركز. */
function drawBall(cx: number, cy: number, r: number, color: string): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" ${strokeAttr(color)} />`;
}

/** يرسم مستوى مائلاً مع جسم صندوق عليه. */
function drawIncline(cx: number, cy: number, angleDeg: number, color: string): string {
  const rad = degToRad(angleDeg);
  const baseLen = 120;
  const height = baseLen * Math.tan(rad);

  // أرضية أفقية
  const floorY = cy + 50;
  const floorLeft = cx - baseLen / 2 - 20;
  const floorRight = cx + baseLen / 2 + 20;
  let svg = `<line x1="${floorLeft}" y1="${floorY}" x2="${floorRight}" y2="${floorY}" stroke="${color}" stroke-width="2"/>`;

  // مثلث المستوى المائل
  const ax = floorRight;
  const ay = floorY;
  const bx = floorRight - baseLen;
  const by = floorY;
  const topX = ax;
  const topY = floorY - height;

  svg += `<polygon points="${ax},${ay} ${bx},${by} ${topX},${topY}" fill="#e2e8f0" ${strokeThinAttr(color)} opacity="0.5"/>`;
  svg += `<line x1="${bx}" y1="${by}" x2="${topX}" y2="${topY}" stroke="${color}" stroke-width="2.5"/>`;

  // زاوية القوس
  const arcR = 20;
  const arcEndX = bx + arcR;
  const arcEndY = by;
  const arcStartX = bx + arcR * Math.cos(rad);
  const arcStartY = by - arcR * Math.sin(rad);
  const largeArc = angleDeg > 180 ? 1 : 0;
  svg += `<path d="M${arcEndX},${arcEndY} A${arcR},${arcR} 0 ${largeArc} 0 ${arcStartX},${arcStartY}" fill="none" stroke="${color}" stroke-width="1.5"/>`;
  svg += text(bx + 24, by - 8, `${angleDeg}°`, { size: 10, color, anchor: 'start' });

  // جسم صغير على المائل
  const boxSmall = 30;
  const midFrac = 0.5;
  const bodyCx = bx + (topX - bx) * midFrac;
  const bodyCy = by + (topY - by) * midFrac;
  svg += `<rect x="${bodyCx - boxSmall / 2}" y="${bodyCy - boxSmall / 2}" width="${boxSmall}" height="${boxSmall}" rx="3" ${strokeAttr(color)} />`;

  return svg;
}

// ------------------------------------------------------------
// المُصيّر الرئيسي
// ------------------------------------------------------------

/** يُصيّر مخطط القوى إلى SVG. spec غير صالح → ''. */
export function renderForces(spec: ForcesSpec, opts?: RenderOptions): string {
  try {
    const col = resolveColor(opts);

    // المركز
    const cx = W / 2;
    const cy = H / 2;

    let svg = '';

    // رسم الجسم
    switch (spec.body) {
      case 'box':
        svg += drawBox(cx, cy, BOX_SIZE, col);
        break;
      case 'ball':
        svg += drawBall(cx, cy, BALL_R, col);
        break;
      case 'incline': {
        const angle = spec.angle ?? 30;
        svg += drawIncline(cx, cy - 10, angle, col);
        // نقطة تثبيت القوى (وسط الجسم على المائل)
        break;
      }
    }

    // حساب أقصى مقدار لتوحيد الأطوال
    const maxMag = Math.max(...spec.vectors.map((v) => v.mag ?? 1));
    const scale = BASE_ARROW / maxMag;

    // رسم متجهات القوى
    const originX = cx;
    const originY = cy;

    for (const v of spec.vectors) {
      const angle = dirToAngle(v.dir);
      const length = (v.mag ?? 1) * scale;
      const fColor = forceColor(v.dir);
      const side = labelSideForDir(v.dir);

      svg += drawArrow(originX, originY, angle, length, fColor, esc(v.label), side);
    }

    // ARIA label
    const bodyName = spec.body === 'box' ? 'صندوق' : spec.body === 'ball' ? 'كرة' : 'مستوى مائل';
    const ariaLabel = `مخطط قوى: ${bodyName} مع ${spec.vectors.length} قوى`;

    return wrapSvg(svg, W, H, ariaLabel, opts);
  } catch {
    // مبدأ "لا يرمي أبداً"
    return '';
  }
}
