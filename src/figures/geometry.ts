// ============================================================
// Geometry Figure — أشكال هندسية معلَمية (رياضيات)
// ============================================================
// النموذج يصف النوع + تسميات الرؤوس + (اختياري) تسميات الأضلاع، والمحرك يرسم
// الشكل الصحيح مع علامات الزاوية القائمة وتساوي الأضلاع. أسلوب currentColor خطّي.
// يدعم: مثلث، مربع، مستطيل، متوازي أضلاع، معيّن، شبه منحرف، دائرة،
//        خماسي منتظم، سداسي منتظم، قطع ناقص، زاوية، قطعة مستقيمة.
// ============================================================

import { z } from 'zod';
import {
  esc,
  text,
  wrapSvg,
  resolveColor,
  resolveFont,
  RenderOptions,
  strokeAttr,
  strokeThinAttr,
  fillAttr,
  Pt,
  vecSub,
  vecAdd,
  vecMul,
  vecMid,
  vecNorm,
  vecCentroid,
  vecDist,
  angleDeg,
} from './shared.js';

// ------------------------------------------------------------
// مخطط الأنواع
// ------------------------------------------------------------

export const geometryShapeSchema = z.enum([
  'triangle',
  'right_triangle',
  'isosceles_triangle',
  'equilateral_triangle',
  'square',
  'rectangle',
  'parallelogram',
  'rhombus',
  'trapezoid',
  'circle',
  'pentagon',
  'hexagon',
  'ellipse',
  'angle',
  'line_segment',
]);
export type GeometryShape = z.infer<typeof geometryShapeSchema>;

export const geometrySpecSchema = z
  .object({
    shape: geometryShapeSchema,
    /** تسميات الرؤوس بالترتيب (الدائرة: [المركز]). افتراضياً A,B,C,D… */
    labels: z.array(z.string().max(8)).max(6).optional(),
    /** تسميات الأضلاع بالترتيب (طول/قياس) — تُحاذى الحواف بالتتابع. */
    sides: z.array(z.string().max(14)).max(6).optional(),
    /** لون تعبئة الشكل (شفاف افتراضياً) */
    fill: z.string().max(20).optional(),
    /** شفافية التعبئة (0-1, الافتراضي 0.1) */
    fillOpacity: z.number().min(0).max(1).optional(),
    /** إظهار/إخفاء علامات الزوايا القائمة (الافتراضي true) */
    showRightAngles: z.boolean().optional(),
    /** إظهار/إخفاء شرطات التساوي (الافتراضي true) */
    showTicks: z.boolean().optional(),
    /** إظهار/إخفاء قياس الزوايا العددية (الافتراضي false) */
    showAngles: z.boolean().optional(),
    /** سماكة الحواف (الافتراضي 2) */
    strokeWidth: z.number().min(0.5).max(10).optional(),
    /** تسميات زاوية لكل رأس (مثلاً ['60°', '90°', '30°']) */
    angleLabels: z.array(z.string().max(8)).max(6).optional(),
    /** قياس الزاوية بالدرجات لشكل 'angle' (1..179؛ الافتراضي 60) — يرسم الفتحة الفعلية */
    angleDeg: z.number().min(1).max(179).optional(),
  })
  .strict();
export type GeometrySpec = z.infer<typeof geometrySpecSchema>;

// ------------------------------------------------------------
// ثوابت
// ------------------------------------------------------------

/** عرض الـ viewBox */
const W = 220;
/** ارتفاع الـ viewBox */
const H = 180;

/** أحرف التسمية الافتراضية */
const ABCDEF = ['A', 'B', 'C', 'D', 'E', 'F'];

/** أسماء الأشكال بالعربية (للوصف الافتراضي) */
const SHAPE_NAMES: Record<string, string> = {
  triangle: 'مثلث',
  right_triangle: 'مثلث قائم',
  isosceles_triangle: 'مثلث متساوي الساقين',
  equilateral_triangle: 'مثلث متساوي الأضلاع',
  square: 'مربع',
  rectangle: 'مستطيل',
  parallelogram: 'متوازي أضلاع',
  rhombus: 'معيّن',
  trapezoid: 'شبه منحرف',
  circle: 'دائرة',
  pentagon: 'خماسي منتظم',
  hexagon: 'سداسي منتظم',
  ellipse: 'قطع ناقص',
  angle: 'زاوية',
  line_segment: 'قطعة مستقيمة',
};

// ------------------------------------------------------------
// تعريف الأشكال المضلّعة
// ------------------------------------------------------------

interface ShapeDef {
  /** إحداثيات الرؤوس */
  points: Pt[];
  /** تسميات الرؤوس الافتراضية */
  labels: string[];
  /** مؤشرات الرؤوس ذات الزاوية القائمة */
  rightAngles: number[];
  /** مؤشرات الحواف المتساوية (شرطات التساوي) */
  tickEdges: number[];
}

const ABCD = ['A', 'B', 'C', 'D'];

/** التعريفات الثابتة للأشكال المضلّعة */
const SHAPES: Record<string, ShapeDef> = {
  triangle: {
    points: [[30, 150], [190, 150], [78, 42]],
    labels: ['A', 'B', 'C'],
    rightAngles: [],
    tickEdges: [],
  },
  right_triangle: {
    points: [[46, 150], [186, 150], [46, 46]],
    labels: ['A', 'B', 'C'],
    rightAngles: [0],
    tickEdges: [],
  },
  isosceles_triangle: {
    points: [[46, 150], [186, 150], [116, 40]],
    labels: ['A', 'B', 'C'],
    rightAngles: [],
    tickEdges: [1, 2],
  },
  equilateral_triangle: {
    points: [[46, 150], [186, 150], [116, 29]],
    labels: ['A', 'B', 'C'],
    rightAngles: [],
    tickEdges: [0, 1, 2],
  },
  square: {
    points: [[66, 145], [161, 145], [161, 50], [66, 50]],
    labels: ABCD,
    rightAngles: [0, 1, 2, 3],
    tickEdges: [0, 1, 2, 3],
  },
  rectangle: {
    points: [[38, 145], [186, 145], [186, 55], [38, 55]],
    labels: ABCD,
    rightAngles: [0, 1, 2, 3],
    tickEdges: [],
  },
  parallelogram: {
    points: [[38, 150], [150, 150], [190, 55], [78, 55]],
    labels: ABCD,
    rightAngles: [],
    tickEdges: [],
  },
  rhombus: {
    points: [[110, 25], [190, 95], [110, 165], [30, 95]],
    labels: ABCD,
    rightAngles: [],
    tickEdges: [0, 1, 2, 3],
  },
  trapezoid: {
    points: [[30, 150], [190, 150], [150, 55], [70, 55]],
    labels: ABCD,
    rightAngles: [],
    tickEdges: [],
  },
};

// ------------------------------------------------------------
// أدوات مساعدة
// ------------------------------------------------------------

/** يُنشئ مضلّعاً منتظماً بعدد أضلاع محدد */
function regularPolygon(n: number, cx: number, cy: number, r: number): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    // يبدأ من أعلى (−π/2) ويدور مع عقارب الساعة
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}

/** بناء سمة الحواف مع سماكة مخصصة */
function buildStroke(color: string, sw: number): string {
  return `stroke="${color}" fill="none" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
}

/** بناء سمة التعبئة مع الشفافية */
function buildFill(color: string, opacity: number): string {
  return `fill="${color}" fill-opacity="${opacity}"`;
}

/** الحصول على تعريف الشكل (ثابت أو مُولَّد ديناميكياً للأشكال الجديدة) */
function getShapeDef(shape: string): ShapeDef {
  // الأشكال المضلّعة الثابتة
  if (SHAPES[shape]) return SHAPES[shape]!;

  // الخماسي المنتظم — 5 أضلاع متساوية
  if (shape === 'pentagon') {
    return {
      points: regularPolygon(5, 110, 92, 65),
      labels: ABCDEF.slice(0, 5),
      rightAngles: [],
      tickEdges: [0, 1, 2, 3, 4],
    };
  }

  // السداسي المنتظم — 6 أضلاع متساوية
  if (shape === 'hexagon') {
    return {
      points: regularPolygon(6, 110, 92, 65),
      labels: ABCDEF.slice(0, 6),
      rightAngles: [],
      tickEdges: [0, 1, 2, 3, 4, 5],
    };
  }

  // احتياطي — لا ينبغي أن يصل هنا مع مخطط صحيح
  return {
    points: [[30, 150], [190, 150], [110, 40]],
    labels: ['A', 'B', 'C'],
    rightAngles: [],
    tickEdges: [],
  };
}

// ------------------------------------------------------------
// أدوات الرسم
// ------------------------------------------------------------

/** نص مُحاذاة عمودياً وأفقياً عند نقطة (يستخدم dominant-baseline) */
function centeredText(
  x: number,
  y: number,
  t: string,
  size: number,
  color: string,
  opts?: RenderOptions,
): string {
  const ff = resolveFont(opts);
  const c = color || 'currentColor';
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${size}" text-anchor="middle" dominant-baseline="central" font-family="${ff}" fill="${c}" stroke="none">${esc(t)}</text>`;
}

/** تسمية رأس الشكل — توضع خارج الشكل باتجاه المركز */
function vertexLabel(
  pt: Pt,
  c: Pt,
  label: string,
  color: string,
  opts?: RenderOptions,
): string {
  const dir = vecNorm(vecSub(pt, c));
  const pos = vecAdd(pt, vecMul(dir, 15));
  return text(pos[0], pos[1] + 4, label, { size: 13, bold: true, color }, opts);
}

/** تسمية ضلع — توضع في منتصف الضلع باتجاه خارج الشكل */
function sideLabelStr(
  a: Pt,
  b: Pt,
  c: Pt,
  label: string,
  color: string,
  opts?: RenderOptions,
): string {
  const m = vecMid(a, b);
  const dir = vecNorm(vecSub(m, c));
  const pos = vecAdd(m, vecMul(dir, 14));
  return text(pos[0], pos[1] + 3, label, { size: 11, color }, opts);
}

/** شرطة تساوٍ على ضلع (تدلّ على أضلاع متساوية الطول) */
function edgeTick(a: Pt, b: Pt, color: string): string {
  const m = vecMid(a, b);
  const d = vecNorm(vecSub(b, a));
  const perp: Pt = [-d[1], d[0]];
  const p1 = vecAdd(m, vecMul(perp, 5));
  const p2 = vecAdd(m, vecMul(perp, -5));
  return (
    `<line x1="${p1[0].toFixed(1)}" y1="${p1[1].toFixed(1)}" ` +
    `x2="${p2[0].toFixed(1)}" y2="${p2[1].toFixed(1)}" ` +
    `${strokeAttr(color || undefined)}/>`
  );
}

/** علامة زاوية قائمة (مربع صغير عند الرأس) */
function rightAngleMark(prev: Pt, v: Pt, next: Pt, color: string): string {
  const s = 12;
  const u1 = vecMul(vecNorm(vecSub(prev, v)), s);
  const u2 = vecMul(vecNorm(vecSub(next, v)), s);
  const p1 = vecAdd(v, u1);
  const corner = vecAdd(vecAdd(v, u1), u2);
  const p2 = vecAdd(v, u2);
  return (
    `<path d="M ${p1[0].toFixed(1)} ${p1[1].toFixed(1)} ` +
    `L ${corner[0].toFixed(1)} ${corner[1].toFixed(1)} ` +
    `L ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}" ` +
    `${strokeAttr(color || undefined)}/>`
  );
}

/** تسمية قياس الزاوية عند رأس — توضع داخل الشكل */
function angleValueLabel(
  prev: Pt,
  v: Pt,
  next: Pt,
  c: Pt,
  label: string,
  color: string,
  opts?: RenderOptions,
): string {
  const d1 = vecNorm(vecSub(prev, v));
  const d2 = vecNorm(vecSub(next, v));
  // حساب متّجه منصف الزاوية الداخلية
  const bisector: Pt = [d1[0] + d2[0], d1[1] + d2[1]];
  // التأكد من أن الاتجاه نحو الداخل (نحو المركز)
  const toC = vecSub(c, v);
  if (bisector[0] * toC[0] + bisector[1] * toC[1] < 0) {
    bisector[0] = -bisector[0];
    bisector[1] = -bisector[1];
  }
  const bn = vecNorm(bisector);
  const pos = vecAdd(v, vecMul(bn, 22));
  return centeredText(pos[0], pos[1], label, 9, color, opts);
}

// ------------------------------------------------------------
// رسامو الأشكال المضلّعة
// ------------------------------------------------------------

/** يرسم شكلاً مضلّعاً (مثلثات، رباعيات، خماسي، سداسي) */
function renderPolygon(
  def: ShapeDef,
  spec: GeometrySpec,
  colorStr: string,
  sw: number,
  opts?: RenderOptions,
): string {
  const pts = def.points;
  const n = pts.length;
  const c = vecCentroid(pts);
  const cAttr = colorStr || 'currentColor';

  // تسميات الرؤوس (من المستخدم أو الافتراضية)
  const labels = def.labels.map((d, i) => spec.labels?.[i]?.trim() || d);

  // خيارات العرض
  const showRA = spec.showRightAngles ?? true;
  const showTk = spec.showTicks ?? true;
  const showAng = spec.showAngles ?? false;
  const hasFill = !!spec.fill;
  const fillOp = spec.fillOpacity ?? 0.1;

  // بناء عنصر المضلّع
  const strokePart = `stroke="${cAttr}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
  const fillPart = hasFill
    ? buildFill(esc(spec.fill!), fillOp)
    : 'fill="none"';
  const poly = `<polygon points="${pts.map((p) => `${p[0]},${p[1]}`).join(' ')}" ${strokePart} ${fillPart}/>`;

  // علامات الزوايا القائمة
  let raMarks = '';
  if (showRA) {
    raMarks = def.rightAngles
      .map((v) => rightAngleMark(pts[(v - 1 + n) % n]!, pts[v]!, pts[(v + 1) % n]!, colorStr))
      .join('');
  }

  // شرطات التساوي
  let ticks = '';
  if (showTk) {
    ticks = def.tickEdges
      .map((e) => edgeTick(pts[e]!, pts[(e + 1) % n]!, colorStr))
      .join('');
  }

  // تسميات الرؤوس
  const vLabels = pts
    .map((p, i) => vertexLabel(p, c, labels[i]!, colorStr, opts))
    .join('');

  // تسميات الأضلاع
  const sLabels = (spec.sides ?? [])
    .map((s, e) =>
      s && s.trim() && e < n
        ? sideLabelStr(pts[e]!, pts[(e + 1) % n]!, c, s.trim(), colorStr, opts)
        : '',
    )
    .join('');

  // قياسات الزوايا (اختياري)
  let angLabels = '';
  if (showAng) {
    angLabels = pts
      .map((v, i) => {
        const prev = pts[(i - 1 + n) % n]!;
        const next = pts[(i + 1) % n]!;
        const label =
          spec.angleLabels?.[i]?.trim() ||
          `${Math.round(angleDeg(prev, v, next))}°`;
        return angleValueLabel(prev, v, next, c, label, colorStr, opts);
      })
      .join('');
  }

  return poly + raMarks + ticks + sLabels + angLabels + vLabels;
}

// ------------------------------------------------------------
// رسامو الأشكال الخاصة
// ------------------------------------------------------------

/** يرسم شكل الدائرة */
function renderCircle(
  spec: GeometrySpec,
  colorStr: string,
  sw: number,
  opts?: RenderOptions,
): string {
  const cx = 110;
  const cy = 92;
  const r = 62;
  const cAttr = colorStr || 'currentColor';
  const hasFill = !!spec.fill;
  const fillOp = spec.fillOpacity ?? 0.1;

  // التسميات
  const center = spec.labels?.[0]?.trim() || 'O';
  const rimAngle = -0.6; // اتجاه نصف القطر (أعلى-يمين)
  const rim: Pt = [cx + r * Math.cos(rimAngle), cy + r * Math.sin(rimAngle)];
  const radiusLabel = spec.sides?.[0]?.trim();
  const rMid = vecMid([cx, cy], rim);

  // عناصر SVG
  const strokePart = `stroke="${cAttr}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
  const fillPart = hasFill
    ? buildFill(esc(spec.fill!), fillOp)
    : 'fill="none"';
  const circle = `<circle cx="${cx}" cy="${cy}" r="${r}" ${strokePart} ${fillPart}/>`;
  const dot = `<circle cx="${cx}" cy="${cy}" r="2.5" ${fillAttr(cAttr)}/>`;
  const radius = `<line x1="${cx}" y1="${cy}" x2="${rim[0].toFixed(1)}" y2="${rim[1].toFixed(1)}" ${buildStroke(cAttr, sw)}/>`;
  const centerLabel = centeredText(cx - 10, cy + 4, center, 13, colorStr, opts);
  const rLabel = radiusLabel
    ? text(rMid[0] + 6, rMid[1] - 4, radiusLabel, { size: 11, color: colorStr }, opts)
    : '';

  return circle + dot + radius + centerLabel + rLabel;
}

/** يرسم شكل القطع الناقص */
function renderEllipse(
  spec: GeometrySpec,
  colorStr: string,
  sw: number,
  opts?: RenderOptions,
): string {
  const cx = 110;
  const cy = 92;
  const a = 80; // نصف المحور الأكبر (أفقي)
  const b = 50; // نصف المحور الأصغر (عمودي)
  const cAttr = colorStr || 'currentColor';
  const hasFill = !!spec.fill;
  const fillOp = spec.fillOpacity ?? 0.1;

  // التسميات
  const centerName = spec.labels?.[0]?.trim() || 'O';
  const aLabel = spec.sides?.[0]?.trim();
  const bLabel = spec.sides?.[1]?.trim();

  // نقاط نهاية المحاور (تُستخدم لمواقع التسميات)
  const aEnd: Pt = [cx + a, cy];
  const bEnd: Pt = [cx, cy - b];

  // عناصر SVG
  const strokePart = `stroke="${cAttr}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
  const fillPart = hasFill
    ? buildFill(esc(spec.fill!), fillOp)
    : 'fill="none"';
  const ellipse = `<ellipse cx="${cx}" cy="${cy}" rx="${a}" ry="${b}" ${strokePart} ${fillPart}/>`;
  const dot = `<circle cx="${cx}" cy="${cy}" r="2.5" ${fillAttr(cAttr)}/>`;

  // خطوط المحاور (متقطّعة خفيفة)
  const axisStroke = `${strokeThinAttr(colorStr || undefined)} stroke-dasharray="4 3"`;
  const axisH = `<line x1="${cx - a}" y1="${cy}" x2="${cx + a}" y2="${cy}" ${axisStroke}/>`;
  const axisV = `<line x1="${cx}" y1="${cy - b}" x2="${cx}" y2="${cy + b}" ${axisStroke}/>`;

  // التسميات
  const centerLbl = centeredText(cx - 12, cy + 4, centerName, 13, colorStr, opts);
  const aLbl = aLabel
    ? text(vecMid([cx, cy], aEnd)[0], vecMid([cx, cy], aEnd)[1] + 16, aLabel, { size: 10, color: colorStr }, opts)
    : '';
  const bLbl = bLabel
    ? text(vecMid([cx, cy], bEnd)[0] - 16, vecMid([cx, cy], bEnd)[1], bLabel, { size: 10, color: colorStr }, opts)
    : '';

  return ellipse + dot + axisH + axisV + centerLbl + aLbl + bLbl;
}

/** يرسم شكل الزاوية (شعاعان وقوس من رأس مشترك) */
function renderAngle(
  spec: GeometrySpec,
  colorStr: string,
  sw: number,
  opts?: RenderOptions,
): string {
  const cAttr = colorStr || 'currentColor';

  // إحداثيات الرأس
  const V: Pt = [55, 140];
  const rayLen = 150;

  // زاوية الشعاع الثاني (الافتراضي 60° للأعلى في نظام SVG؛ أو قيمة angleDeg الفعلية)
  const angleDeg = spec.angleDeg ?? 60;
  const angRad = -(angleDeg * Math.PI) / 180;

  // نهايتا الشعاعين
  const A: Pt = vecAdd(V, [rayLen, 0]); // أفقي لليمين
  const B: Pt = vecAdd(V, vecMul([Math.cos(angRad), Math.sin(angRad)], rayLen));

  // التسميات
  const labelA = spec.labels?.[0]?.trim() || 'A';
  const labelB = spec.labels?.[1]?.trim() || 'B';
  // نصّ القياس: من sides[0] صراحةً، وإلا من angleDeg إن حُدِّد
  const angleText = spec.sides?.[0]?.trim() || (spec.angleDeg != null ? `${angleDeg}°` : undefined);

  // رسم الشعاعين
  const ray1 = `<line x1="${V[0]}" y1="${V[1]}" x2="${A[0].toFixed(1)}" y2="${A[1].toFixed(1)}" ${buildStroke(cAttr, sw)}/>`;
  const ray2 = `<line x1="${V[0]}" y1="${V[1]}" x2="${B[0].toFixed(1)}" y2="${B[1].toFixed(1)}" ${buildStroke(cAttr, sw)}/>`;

  // رسم القوس (نصف قطر 30)
  const arcR = 30;
  const arcStart: Pt = vecAdd(V, [arcR, 0]);
  const arcEnd: Pt = vecAdd(V, vecMul([Math.cos(angRad), Math.sin(angRad)], arcR));
  const arc = (
    `<path d="M ${arcStart[0].toFixed(1)} ${arcStart[1].toFixed(1)} ` +
    `A ${arcR} ${arcR} 0 0 0 ${arcEnd[0].toFixed(1)} ${arcEnd[1].toFixed(1)}" ` +
    `${strokeThinAttr(colorStr || undefined)}/>`
  );

  // نقطة الرأس
  const dot = `<circle cx="${V[0]}" cy="${V[1]}" r="2.5" ${fillAttr(cAttr)}/>`;

  // تسميات نهايات الأشعة
  const lblA = text(A[0] - 10, A[1] + 18, labelA, { size: 13, bold: true, color: colorStr }, opts);
  const lblB = text(B[0] + 10, B[1] + 4, labelB, { size: 13, bold: true, color: colorStr }, opts);

  // قياس الزاوية (يُعرض على القوس)
  let angleLbl = '';
  if (angleText) {
    const midAngle = angRad / 2;
    const labelR = arcR + 16;
    const lx = V[0] + labelR * Math.cos(midAngle);
    const ly = V[1] + labelR * Math.sin(midAngle);
    angleLbl = centeredText(lx, ly, angleText, 12, colorStr, opts);
  }

  return ray1 + ray2 + arc + dot + lblA + lblB + angleLbl;
}

/** يرسم قطعة مستقيمة بين نقطتين */
function renderLineSegment(
  spec: GeometrySpec,
  colorStr: string,
  sw: number,
  opts?: RenderOptions,
): string {
  const cAttr = colorStr || 'currentColor';

  // نقطتا الطرف
  const p1: Pt = [30, 92];
  const p2: Pt = [190, 92];

  // التسميات
  const lbl1 = spec.labels?.[0]?.trim() || 'A';
  const lbl2 = spec.labels?.[1]?.trim() || 'B';
  const lenLabel = spec.sides?.[0]?.trim();

  // حساب المسافة (للاستخدام الداخلي)
  const dist = vecDist(p1, p2);

  // رسم القطعة
  const line = `<line x1="${p1[0]}" y1="${p1[1]}" x2="${p2[0]}" y2="${p2[1]}" ${buildStroke(cAttr, sw)}/>`;

  // نقطتا الطرف
  const dot1 = `<circle cx="${p1[0]}" cy="${p1[1]}" r="3" ${fillAttr(cAttr)}/>`;
  const dot2 = `<circle cx="${p2[0]}" cy="${p2[1]}" r="3" ${fillAttr(cAttr)}/>`;

  // تسميات النقاط
  const labelPt1 = text(p1[0], p1[1] - 14, lbl1, { size: 13, bold: true, color: colorStr }, opts);
  const labelPt2 = text(p2[0], p2[1] - 14, lbl2, { size: 13, bold: true, color: colorStr }, opts);

  // تسمية الطول (في المنتصف أسفل القطعة)
  let lenLbl = '';
  if (lenLabel) {
    const mid = vecMid(p1, p2);
    // إزاحة عمودية تعتمد على طول القطعة
    const offset = dist > 100 ? 18 : 16;
    lenLbl = centeredText(mid[0], mid[1] + offset, lenLabel, 11, colorStr, opts);
  }

  return line + dot1 + dot2 + labelPt1 + labelPt2 + lenLbl;
}

// ------------------------------------------------------------
// الدالة الرئيسية
// ------------------------------------------------------------

/** يرسم شكلاً هندسياً معلَماً بتسميات الرؤوس/الأضلاع وعلامات القائمة/التساوي. */
export function renderGeometry(spec: GeometrySpec, opts?: RenderOptions): string {
  // حساب اللون والسماكة
  const colorStr = opts ? resolveColor(opts) : '';
  const sw = spec.strokeWidth ?? 2;

  let inner = '';

  switch (spec.shape) {
    case 'circle':
      inner = renderCircle(spec, colorStr, sw, opts);
      break;
    case 'ellipse':
      inner = renderEllipse(spec, colorStr, sw, opts);
      break;
    case 'angle':
      inner = renderAngle(spec, colorStr, sw, opts);
      break;
    case 'line_segment':
      inner = renderLineSegment(spec, colorStr, sw, opts);
      break;
    default: {
      // جميع الأشكال المضلّعة (ثابتة أو مُولَّدة)
      const def = getShapeDef(spec.shape);
      inner = renderPolygon(def, spec, colorStr, sw, opts);
    }
  }

  const ariaLabel = SHAPE_NAMES[spec.shape] || 'شكل هندسي';
  return wrapSvg(inner, W, H, ariaLabel, opts);
}