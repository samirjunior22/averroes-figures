// ============================================================
// Number Line Generator — مولّد المستقيم المدرّج (رياضيات)
// ============================================================
// يرسم مستقيماً عددياً مدرّجاً مع نقاط مُعلَّمة وفترات مؤشَّرة.
//
// الرمز في الـproxy:  [[أعداد: -5..5 ; نقطة:2 ; فترة:-1..3]]
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
} from './shared.js';

// ------------------------------------------------------------
// مخطّطات Zod
// ------------------------------------------------------------

/** نقطة على المستقيم. */
export const numberLinePointSchema = z
  .object({
    x: z.number().describe('الإحداثي على المستقيم'),
    label: z.string().max(6).optional().describe('تسمية النقطة (اختياري)'),
    filled: z.boolean().optional().describe('نقطة مملوءة (افتراضي true)'),
  })
  .strict();

export type NumberLinePoint = z.infer<typeof numberLinePointSchema>;

/** فترة مفتوحة/مغلقة على المستقيم. */
export const numberLineIntervalSchema = z
  .object({
    from: z.number().describe('بداية الفترة'),
    to: z.number().describe('نهاية الفترة'),
    openLeft: z.boolean().optional().describe('قوس مفتوح يساراً'),
    openRight: z.boolean().optional().describe('قوس مفتوح يميناً'),
  })
  .strict();

export type NumberLineInterval = z.infer<typeof numberLineIntervalSchema>;

/** مواصفات مولّد المستقيم المدرّج. */
export const numberLineSpecSchema = z
  .object({
    min: z.number().describe('أدنى قيمة'),
    max: z.number().describe('أقصى قيمة'),
    step: z.number().positive().optional().describe('الخطوة (التدريج)'),
    points: z.array(numberLinePointSchema).max(12).optional().describe('نقاط مُعلَّمة'),
    interval: numberLineIntervalSchema.optional().describe('فترة مؤشَّرة'),
  })
  .strict()
  .refine((d) => d.max > d.min, { message: 'max must be > min' });

export type NumberLineSpec = z.infer<typeof numberLineSpecSchema>;

// ------------------------------------------------------------
// ثوابت
// ------------------------------------------------------------

const W = 400;
const H = 80;
const MARGIN = 40;
const AXIS_Y = H / 2;
const TICK_H = 6;

// ------------------------------------------------------------
// المُصيّر الرئيسي
// ------------------------------------------------------------

/** يُصيّر مستقيماً مدرّجاً إلى SVG. spec غير صالح → ''. */
export function renderNumberLine(spec: NumberLineSpec, opts?: RenderOptions): string {
  try {
    const col = resolveColor(opts);
    const ff = opts?.fontFamily ?? 'sans-serif';

    const { min, max } = spec;
    const range = max - min;
    const step = spec.step ?? (range <= 10 ? 1 : range <= 20 ? 2 : range <= 100 ? 5 : 10);

    // حساب البيكسلات: المسافة المتاحة بين الحواف
    const pxMin = MARGIN;
    const pxMax = W - MARGIN;
    const pxRange = pxMax - pxMin;

    /** يحوّل قيمة رقمية إلى إحداثي x بكسل. */
    const toX = (v: number): number => pxMin + ((v - min) / range) * pxRange;

    let svg = '';

    // السهم الأيسر
    const axStart = pxMin - 15;
    svg += `<line x1="${axStart + 12}" y1="${AXIS_Y}" x2="${pxMax + 15}" y2="${AXIS_Y}" ${strokeAttr(col)} />`;
    svg += `<polygon points="${pxMax + 15},${AXIS_Y} ${pxMax + 6},${AXIS_Y - 4} ${pxMax + 6},${AXIS_Y + 4}" fill="${col}" stroke="none"/>`;

    // التدريج
    const firstTick = Math.ceil(min / step) * step;
    for (let v = firstTick; v <= max + step * 0.001; v += step) {
      const px = toX(v);
      const isZero = Math.abs(v) < step * 0.01;
      svg += `<line x1="${px}" y1="${AXIS_Y - TICK_H}" x2="${px}" y2="${AXIS_Y + TICK_H}" ${strokeThinAttr(col)} />`;
      // أرقام التدريج (كل خطوة أو كل خطوتين إن كثرت)
      const showLabel = range <= 20 || Math.round(v / step) % 2 === 0 || isZero;
      if (showLabel) {
        const display = Number.isInteger(v) ? String(v) : v.toFixed(1);
        svg += text(px, AXIS_Y + 20, display, { size: 10, fontFamily: ff });
      }
    }

    // نقطة الأصل (إن كانت ضمن النطاق)
    if (min <= 0 && max >= 0) {
      const zeroX = toX(0);
      svg += `<line x1="${zeroX}" y1="${AXIS_Y - 8}" x2="${zeroX}" y2="${AXIS_Y + 8}" stroke="${col}" stroke-width="2"/>`;
    }

    // النقاط المُعلَّمة
    for (const pt of spec.points ?? []) {
      const px = toX(pt.x);
      if (px < pxMin - 5 || px > pxMax + 5) continue;

      const filled = pt.filled !== false;
      const r = 5;
      svg += `<circle cx="${px}" cy="${AXIS_Y}" r="${r}" fill="${filled ? col : 'none'}" stroke="${col}" stroke-width="2"/>`;

      if (pt.label) {
        svg += text(px, AXIS_Y - 14, esc(pt.label), { size: 11, bold: true, fontFamily: ff });
      }
    }

    // الفترة المؤشَّرة (قوس)
    if (spec.interval) {
      const { from, to, openLeft, openRight } = spec.interval;
      const x1 = toX(from);
      const x2 = toX(to);
      const arcY = AXIS_Y + 18;
      const arcR = 6;

      // خط الفترة
      svg += `<line x1="${x1}" y1="${arcY}" x2="${x2}" y2="${arcY}" stroke="#ef4444" stroke-width="2.5"/>`;

      // نقاط نهاية الفترة (مفتوحة/مغلقة)
      const leftR = openLeft ? 3 : 5;
      const leftFill = openLeft ? 'white' : '#ef4444';
      svg += `<circle cx="${x1}" cy="${arcY}" r="${leftR}" fill="${leftFill}" stroke="#ef4444" stroke-width="2"/>`;
      const rightR = openRight ? 3 : 5;
      const rightFill = openRight ? 'white' : '#ef4444';
      svg += `<circle cx="${x2}" cy="${arcY}" r="${rightR}" fill="${rightFill}" stroke="#ef4444" stroke-width="2"/>`;
    }

    const ariaLabel = `مستقيم مدرّج من ${min} إلى ${max}`;
    return wrapSvg(svg, W, H, ariaLabel, opts);
  } catch {
    return '';
  }
}
