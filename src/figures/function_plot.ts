// ============================================================
// Function Plot Generator — مولّد منحنى دالة (رياضيات)
// ============================================================
// يرسم منحنى دالة على معلم ديكارتي مع شبكة ومحاور.
//
// الرمز في الـproxy:  [[دالة: x^2 ; -3..3 | منحنى y=x²]]
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

/** نقطة على المنحنى. */
export const plotPointSchema = z
  .object({
    x: z.number(),
    y: z.number(),
  })
  .strict();

export type PlotPoint = z.infer<typeof plotPointSchema>;

/** مواصفات مولّد رسم الدالة. */
export const functionPlotSpecSchema = z
  .object({
    /** نقاط من جدول قيم — يُرسم منحنى يمرّ بها. */
    points: z.array(plotPointSchema).min(2).max(50).optional(),
    /** تعبير رياضي آمن يُقيَّم بدل النقاط. */
    expr: z.string().max(60).optional(),
    /** حدّ أدنى لـ x (مع expr). */
    xmin: z.number().optional(),
    /** حدّ أقصى لـ x (مع expr). */
    xmax: z.number().optional(),
    /** تسمية المحور الأفقي. */
    xlabel: z.string().max(8).optional(),
    /** تسمية المحور العمودي. */
    ylabel: z.string().max(8).optional(),
  })
  .strict()
  .refine((d) => d.points || d.expr, { message: 'points or expr required' })
  .refine(
    (d) => {
      if (d.expr && (d.xmin === undefined || d.xmax === undefined)) return false;
      return true;
    },
    { message: 'expr requires xmin and xmax' },
  );

export type FunctionPlotSpec = z.infer<typeof functionPlotSpecSchema>;

// ------------------------------------------------------------
// محلّل تعبيرات آمن (لا eval — لا تبعيات خارجية)
// ------------------------------------------------------------
// يدعم: x, الأعداد, +, -, *, /, ^ (أس), ().
// لا يدعم: eval, Function, import, require, أو أي استدعاءات.

const BINARY_OPS = new Set(['+', '-', '*', '/', '^']);

/** يحوّل '2x' إلى '2*x' لمعالجة الضرب الضمني. */
function insertImplicitMul(expr: string): string {
  return expr
    .replace(/(\d)([a-zA-Z])/g, '$1*$2')   // 2x → 2*x
    .replace(/(\))(\d)/g, '$1*$2')          // )2 → )*2
    .replace(/(\))(\()/g, '$1*$2')          // )( → )*(
    .replace(/(\d)(\()/g, '$1*$2');         // 2( → 2*(
}

/** يحوّل تعبير مع x إلى قائمة توكنز ثم يقيّمها بالـ postfix. */
function tokenize(expr: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i]!;
    if (ch === ' ') { i++; continue; }
    if ('+-*/^()'.includes(ch)) {
      tokens.push(ch); i++; continue;
    }
    // رقم (صحيح أو عشري، مع إشارة سالبة إن كان أول شيء أو بعد عامل)
    if (ch === '.' || /\d/.test(ch)) {
      let num = '';
      while (i < expr.length && (expr[i] === '.' || /\d/.test(expr[i]!))) { num += expr[i]!; i++; }
      tokens.push(num); continue;
    }
    // حرف أو كلمة — متغيّر مجهول (يُرفض لاحقاً)
    i++;
  }
  return tokens;
}

/** تقييم Postfix. */
function evalPostfix(tokens: string[]): number {
  const stack: number[] = [];
  for (const tok of tokens) {
    if (BINARY_OPS.has(tok)) {
      const b = stack.pop()!;
      const a = stack.pop()!;
      switch (tok) {
        case '+': stack.push(a + b); break;
        case '-': stack.push(a - b); break;
        case '*': stack.push(a * b); break;
        case '/': stack.push(b !== 0 ? a / b : NaN); break;
        case '^': stack.push(Math.pow(a, b)); break;
      }
    } else {
      const n = Number(tok);
      if (Number.isFinite(n)) stack.push(n);
      else return NaN;
    }
  }
  return stack.length === 1 ? stack[0]! : NaN;
}

/**
 * محلّل تعبيري آمن — Dijkstra Shunting Yard.
 * يعيد NaN عند خطأ أو دالّة غير مدعومة.
 * لا يستعمل eval أو Function أو أيّ شيء خطر.
 */
function safeEval(expr: string, xVal: number): number {
  try {
    let processed = insertImplicitMul(expr.trim());
    // استبدال x بالقيمة العددية (بلا أقواس — أضيف ضرباً ضمنياً إن لزم)
    processed = processed.replace(/\bx\b/g, String(xVal));
    // توكنيز
    const matches = tokenize(processed);
    if (!matches.length) return NaN;
    // Shunting Yard
    const output: string[] = [];
    const ops: string[] = [];
    const prec: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };
    for (const tok of matches) {
      if (/[\d.]/.test(tok)) {
        output.push(tok);
      } else if (BINARY_OPS.has(tok)) {
        while (ops.length && ops[ops.length - 1] !== '(' &&
               prec[ops[ops.length - 1]!]! >= prec[tok]!) {
          output.push(ops.pop()!);
        }
        ops.push(tok);
      } else if (tok === '(') {
        ops.push(tok);
      } else if (tok === ')') {
        while (ops.length && ops[ops.length - 1] !== '(') {
          output.push(ops.pop()!);
        }
        ops.pop(); // إزالة '('
      } else {
        return NaN; // رمز غير معروف
      }
    }
    while (ops.length) output.push(ops.pop()!);
    return evalPostfix(output);
  } catch {
    return NaN;
  }
}

// ------------------------------------------------------------
// ثوابت
// ------------------------------------------------------------

const W = 400;
const H = 300;
const PAD = 45; // هوامش للمحاور والتسميات

// ------------------------------------------------------------
// المُصيّر الرئيسي
// ------------------------------------------------------------

/** يُصيّر منحنى دالة إلى SVG. spec غير صالح → ''. */
export function renderFunctionPlot(spec: FunctionPlotSpec, opts?: RenderOptions): string {
  try {
    const col = resolveColor(opts);
    const ff = opts?.fontFamily ?? 'sans-serif';

    // حساب النقاط
    let points: PlotPoint[];
    if (spec.points) {
      points = spec.points;
    } else if (spec.expr && spec.xmin !== undefined && spec.xmax !== undefined) {
      // تقييم التعبير عند 100 نقطة
      const nSamples = 100;
      const dx = (spec.xmax - spec.xmin) / nSamples;
      points = [];
      for (let i = 0; i <= nSamples; i++) {
        const x = spec.xmin + i * dx;
        const y = safeEval(spec.expr, x);
        if (Number.isFinite(y)) points.push({ x, y });
      }
      if (points.length < 2) return '';
    } else {
      return '';
    }

    // حساب النطاق
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;

    // إضافة 10% هوامش رياضية
    const xPad = xRange * 0.1;
    const yPad = yRange * 0.1;
    const plotXMin = xMin - xPad;
    const plotXMax = xMax + xPad;
    const plotYMin = yMin - yPad;
    const plotYMax = yMax + yPad;
    const plotW = W - 2 * PAD;
    const plotH = H - 2 * PAD;

    /** يحوّل قيمة رياضية إلى بكسل. */
    const toSvgX = (v: number): number => PAD + ((v - plotXMin) / (plotXMax - plotXMin)) * plotW;
    const toSvgY = (v: number): number => PAD + plotH - ((v - plotYMin) / (plotYMax - plotYMin)) * plotH;

    let svg = '';

    // خلفية الشبكة
    const gridSteps = 5;
    const gridColor = opts?.dark ? '#334155' : '#e2e8f0';
    for (let i = 0; i <= gridSteps; i++) {
      const gx = PAD + (i / gridSteps) * plotW;
      const gy = PAD + (i / gridSteps) * plotH;
      svg += `<line x1="${gx}" y1="${PAD}" x2="${gx}" y2="${PAD + plotH}" stroke="${gridColor}" stroke-width="0.5"/>`;
      svg += `<line x1="${PAD}" y1="${gy}" x2="${PAD + plotW}" y2="${gy}" stroke="${gridColor}" stroke-width="0.5"/>`;
    }

    // المحاور (إن كانت النطاقات تحتوي 0)
    if (plotXMin <= 0 && plotXMax >= 0) {
      const zeroX = toSvgX(0);
      svg += `<line x1="${zeroX}" y1="${PAD}" x2="${zeroX}" y2="${PAD + plotH}" ${strokeAttr(col)} />`;
    }
    if (plotYMin <= 0 && plotYMax >= 0) {
      const zeroY = toSvgY(0);
      svg += `<line x1="${PAD}" y1="${zeroY}" x2="${PAD + plotW}" y2="${zeroY}" ${strokeAttr(col)} />`;
    }

    // إطار المحور
    svg += `<rect x="${PAD}" y="${PAD}" width="${plotW}" height="${plotH}" fill="none" stroke="${col}" stroke-width="1.5" rx="2"/>`;

    // تسميات المحاور
    if (spec.xlabel) {
      svg += text(PAD + plotW / 2, H - 8, esc(spec.xlabel), { size: 12, fontFamily: ff });
    }
    if (spec.ylabel) {
      svg += text(12, PAD + plotH / 2, esc(spec.ylabel), { size: 12, fontFamily: ff });
    }

    // تسميات التدريج على المحاور
    for (let i = 0; i <= gridSteps; i++) {
      const xVal = plotXMin + (i / gridSteps) * (plotXMax - plotXMin);
      const yVal = plotYMin + (i / gridSteps) * (plotYMax - plotYMin);
      const gx = PAD + (i / gridSteps) * plotW;
      const gy = PAD + plotH - (i / gridSteps) * plotH;
      // أرقام x في الأسفل
      const xLabel = Number.isInteger(xVal) ? String(xVal) : xVal.toFixed(1);
      svg += text(gx, PAD + plotH + 15, xLabel, { size: 9, fontFamily: ff });
      // أرقام y على اليسار
      const yLabel = Number.isInteger(yVal) ? String(yVal) : yVal.toFixed(1);
      svg += text(PAD - 15, gy + 3, yLabel, { size: 9, anchor: 'end', fontFamily: ff });
    }

    // المنحنى — قطع خطّية بين النقاط
    const curveColor = opts?.dark ? '#60a5fa' : '#2563eb';
    let pathD = '';
    for (let i = 0; i < points.length; i++) {
      const sx = toSvgX(points[i]!.x);
      const sy = toSvgY(points[i]!.y);
      // تجاوز النقاط خارج منطقة الرسم
      if (sy < PAD - 50 || sy > PAD + plotH + 50) continue;
      if (pathD === '') {
        pathD = `M${sx.toFixed(1)},${sy.toFixed(1)}`;
      } else {
        pathD += ` L${sx.toFixed(1)},${sy.toFixed(1)}`;
      }
    }
    if (pathD) {
      svg += `<path d="${pathD}" fill="none" stroke="${curveColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    }

    // النقاط المميّزة (أول نقطة وأخيرة إن قليلة، أو كل نقطة إن ≤ 20)
    if (points.length <= 20) {
      for (const pt of points) {
        const sx = toSvgX(pt.x);
        const sy = toSvgY(pt.y);
        if (sy < PAD - 50 || sy > PAD + plotH + 50) continue;
        svg += `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="3.5" fill="${curveColor}" stroke="white" stroke-width="1.5"/>`;
      }
    }

    const ariaLabel = spec.expr
      ? `منحنى الدالة ${spec.expr}`
      : `رسم بياني لـ ${points.length} نقطة`;
    return wrapSvg(svg, W, H, ariaLabel, opts);
  } catch {
    return '';
  }
}
