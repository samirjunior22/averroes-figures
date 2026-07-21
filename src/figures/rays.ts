// ============================================================
// Rays Generator — مولّد الأشعة الضوئية (فيزياء - البصريات)
// ============================================================
// يرسم عنصراً بصرياً (عدسة مجمّعة/مفرّقة، مرآة مستوية/مقعّرة/محدّبة)
// على محور بصري أفقي، مع شيء (سهم منتصب)، صورته المحسوبة،
// البؤرتين (F, F') وأشعّة الإنشاء (وارد + منكسر أو منعكس).
//
// الرمز في الـproxy:  [[أشعة: عدسة مجمّعة ; بعد:130 ; بؤرة:65]]
// ============================================================

import { z } from 'zod';
import type { RenderOptions } from './shared.js';
import {
  esc,
  text,
  wrapSvg,
  resolveColor,
  strokeThinAttr,
} from './shared.js';

// ------------------------------------------------------------
// مخطّطات Zod
// ------------------------------------------------------------

/** نوع العنصر البصري. */
export const raysKindSchema = z.enum([
  'converging_lens', // عدسة مجمّعة (محدّبة)
  'diverging_lens',  // عدسة مفرّقة (مقعّرة)
  'plane_mirror',    // مرآة مستوية
  'concave_mirror',  // مرآة مقعّرة (مجمّعة)
  'convex_mirror',   // مرآة محدّبة (مفرّقة)
]);
export type RaysKind = z.infer<typeof raysKindSchema>;

/** مواصفات مولّد الأشعة الضوئية. */
export const raysSpecSchema = z
  .object({
    kind: raysKindSchema.describe('نوع العنصر البصري'),
    /** بُعد الشيء عن العنصر (وحدات بكسل تقريبية). */
    objectDistance: z.number().positive().max(200).optional(),
    /** ارتفاع الشيء (طول السهم المنتصب). */
    objectHeight: z.number().positive().max(90).optional(),
    /** البعد البؤري (المسافة من العنصر إلى البؤرة). */
    focalLength: z.number().positive().max(150).optional(),
    /** رسم أشعّة الإنشاء (الوارد + المنكسر/المنعكس). الافتراضي true. */
    showConstructionRays: z.boolean().optional(),
    /** رسم الصورة المحسوبة. الافتراضي true. */
    showImage: z.boolean().optional(),
    /** رسم تسميات البؤر والمحور. الافتراضي true. */
    showLabels: z.boolean().optional(),
  })
  .strict();

export type RaysSpec = z.infer<typeof raysSpecSchema>;

// ------------------------------------------------------------
// ثوابت
// ------------------------------------------------------------

const W = 440;
const H = 280;
const CX = W / 2; // موضع العنصر البصري
const CY = H / 2; // المحور البصري

const DEFAULT_OBJECT_DISTANCE = 130;
const DEFAULT_OBJECT_HEIGHT = 55;
const DEFAULT_FOCAL_LENGTH = 65;

const ELEMENT_HALF = 62;     // نصف ارتفاع رمز العنصر
const RAY_INCIDENT = '#f59e0b'; // برتقالي — شعاع مواز
const RAY_CHIEF = '#8b5cf6';    // بنفسجي — شعاع مركزي
const OBJECT_COLOR = '#10b981'; // أخضر — الشيء
const IMAGE_COLOR = '#ef4444';  // أحمر — الصورة
const EDGE = 8; // مسافة امتداد الأشعّة خارج منطقة الرسم

type Pt = readonly [number, number];

// ------------------------------------------------------------
// مساعدات هندسية
// ------------------------------------------------------------

/** رأس سهم عند (x,y) موجّه نحو الاتجاه (dx,dy). */
function arrowHead(x: number, y: number, dx: number, dy: number, color: string): string {
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const size = 8;
  const spread = 0.45;
  const cos = Math.cos(spread);
  const sin = Math.sin(spread);
  const p1x = x - size * (ux * cos - uy * sin);
  const p1y = y - size * (uy * cos + ux * sin);
  const p2x = x - size * (ux * cos + uy * sin);
  const p2y = y - size * (uy * cos - ux * sin);
  return `<polygon points="${x.toFixed(1)},${y.toFixed(1)} ${p1x.toFixed(1)},${p1y.toFixed(1)} ${p2x.toFixed(1)},${p2y.toFixed(1)}" fill="${color}" stroke="none"/>`;
}

/** سهم عمودي من المحور (baseY) إلى القمة (topY). */
function verticalArrow(x: number, baseY: number, topY: number, color: string): string {
  const line = `<line x1="${x.toFixed(1)}" y1="${baseY}" x2="${x.toFixed(1)}" y2="${topY.toFixed(1)}" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`;
  const dir = topY < baseY ? -1 : 1;
  return line + arrowHead(x, topY, 0, dir, color);
}

/** خط شعاع (متصل أو متقطّع). */
function rayLine(a: Pt, b: Pt, color: string, dashed: boolean): string {
  const dash = dashed ? ' stroke-dasharray="4 4"' : '';
  return `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${color}" stroke-width="1.6"${dash}/>`;
}

// ------------------------------------------------------------
// حساب موضع الصورة (معادلة العدسة/المرآة الموحّدة)
// ------------------------------------------------------------

interface ImageInfo {
  readonly imgX: number;    // موضع الصورة أفقياً (بكسل)
  readonly imgTopY: number; // قمة سهم الصورة
  readonly virtual: boolean;
}

/**
 * يحسب موضع الصورة. الاصطلاح: 1/do + 1/di = 1/f، m = -di/do.
 * fEff موجب للعناصر المجمّعة، سالب للمفرّقة.
 * العدسة: الصورة الحقيقية يميناً (di>0). المرآة: الصورة الحقيقية يساراً.
 */
function computeImage(
  kind: RaysKind,
  objDist: number,
  objHeight: number,
  focal: number,
): ImageInfo {
  if (kind === 'plane_mirror') {
    // صورة تخيّلية خلف المرآة على البعد نفسه، منتصبة بالحجم نفسه
    return { imgX: CX + objDist, imgTopY: CY - objHeight, virtual: true };
  }

  const isMirror = kind === 'concave_mirror' || kind === 'convex_mirror';
  const diverging = kind === 'diverging_lens' || kind === 'convex_mirror';
  const fEff = diverging ? -focal : focal;

  const denom = objDist - fEff;
  const di = denom !== 0 ? (objDist * fEff) / denom : objDist * 1000;
  const m = -di / objDist;
  const imgHeight = m * objHeight; // موجب = منتصبة، سالب = مقلوبة
  const imgTopY = CY - imgHeight;

  // di>0 صورة حقيقية: العدسة يميناً، المرآة يساراً (جهة الشيء)
  const imgX = isMirror ? CX - di : CX + di;
  return { imgX, imgTopY, virtual: di < 0 };
}

// ------------------------------------------------------------
// رسم العنصر البصري
// ------------------------------------------------------------

/** يرسم رمز العنصر البصري عند المحور. */
function drawElement(kind: RaysKind, col: string): string {
  const top = CY - ELEMENT_HALF;
  const bot = CY + ELEMENT_HALF;
  const axisLine = `<line x1="${CX}" y1="${top}" x2="${CX}" y2="${bot}" stroke="${col}" stroke-width="2.5" stroke-linecap="round"/>`;

  switch (kind) {
    case 'converging_lens': {
      // خط عمودي مع رؤوس أسهم للخارج (↕)
      return axisLine
        + arrowHead(CX, top, 0, -1, col)
        + arrowHead(CX, bot, 0, 1, col);
    }
    case 'diverging_lens': {
      // خط عمودي مع رؤوس أسهم للداخل
      return axisLine
        + arrowHead(CX, top + 12, 0, 1, col)
        + arrowHead(CX, bot - 12, 0, -1, col);
    }
    case 'plane_mirror': {
      // خط + تظليل خلفي (يمين)
      let s = axisLine;
      for (let y = top; y < bot; y += 12) {
        s += `<line x1="${CX}" y1="${y}" x2="${CX + 9}" y2="${y + 9}" stroke="${col}" stroke-width="1.2"/>`;
      }
      return s;
    }
    case 'concave_mirror':
      // قوس منحنٍ يميناً (السطح العاكس يواجه اليسار)
      return `<path d="M${CX},${top} Q${CX + 20},${CY} ${CX},${bot}" fill="none" stroke="${col}" stroke-width="2.5" stroke-linecap="round"/>`;
    case 'convex_mirror':
      // قوس منحنٍ يساراً (السطح العاكس يواجه اليسار)
      return `<path d="M${CX},${top} Q${CX - 20},${CY} ${CX},${bot}" fill="none" stroke="${col}" stroke-width="2.5" stroke-linecap="round"/>`;
  }
}

/** يرسم البؤر والتسميات على المحور. */
function drawFoci(kind: RaysKind, focal: number, col: string): string {
  if (kind === 'plane_mirror') return '';
  const isMirror = kind === 'concave_mirror' || kind === 'convex_mirror';

  const dot = (x: number, label: string): string =>
    `<circle cx="${x}" cy="${CY}" r="2.5" fill="${col}"/>` + text(x, CY + 15, label, { size: 11, bold: true, color: col });

  if (isMirror) {
    // المرآة: البؤرة F والمركز C على جهة الشيء (يسار)
    return dot(CX - focal, 'F') + dot(CX - 2 * focal, 'C');
  }
  // العدسة: F يساراً وF' يميناً
  return dot(CX - focal, 'F') + dot(CX + focal, "F'");
}

// ------------------------------------------------------------
// رسم أشعّة الإنشاء
// ------------------------------------------------------------

/**
 * الشعاع الخارج بعد العنصر نحو الصورة.
 * realTowardImage: هل يسير الضوء فعلاً نحو الصورة (صورة حقيقية)؟
 * إن لا، يُرسم الشعاع الحقيقي في اتجاه سيره، وامتداده الوهمي متقطّعاً إلى الصورة.
 */
function outgoingRay(p: Pt, img: Pt, color: string, realTowardImage: boolean): string {
  if (realTowardImage) return rayLine(p, img, color, false);
  // صورة تخيّلية: الشعاع الحقيقي يبدو صادراً من الصورة عبر p ويكمل بعدها
  const dx = p[0] - img[0];
  const dy = p[1] - img[1];
  const len = Math.hypot(dx, dy) || 1;
  const solidEnd: Pt = [p[0] + (dx / len) * (ELEMENT_HALF + EDGE), p[1] + (dy / len) * (ELEMENT_HALF + EDGE)];
  return rayLine(p, solidEnd, color, false) + rayLine(img, p, color, true);
}

/** يرسم شعاعي الإنشاء الرئيسيين من قمة الشيء إلى قمة الصورة. */
function drawRays(
  kind: RaysKind,
  objX: number,
  objTopY: number,
  info: ImageInfo,
): string {
  const isMirror = kind === 'concave_mirror' || kind === 'convex_mirror' || kind === 'plane_mirror';
  const img: Pt = [info.imgX, info.imgTopY];

  // اتجاه سير الضوء الخارج: العدسة يميناً، المرآة يساراً
  const realTowardImage = isMirror ? info.imgX < CX : info.imgX > CX;

  // الشعاع 1 — مواز للمحور ثم ينكسر/ينعكس نحو البؤرة
  const p1: Pt = [CX, objTopY];
  let svg = rayLine([objX, objTopY], p1, RAY_INCIDENT, false);
  svg += outgoingRay(p1, img, RAY_INCIDENT, realTowardImage);

  // الشعاع 2 — يمرّ بمركز العدسة / قمّة المرآة (يخرج بميل متناظر)
  const p2: Pt = [CX, CY];
  svg += rayLine([objX, objTopY], p2, RAY_CHIEF, false);
  svg += outgoingRay(p2, img, RAY_CHIEF, realTowardImage);

  return svg;
}

// ------------------------------------------------------------
// المُصيّر الرئيسي
// ------------------------------------------------------------

/** يُصيّر مخطط الأشعة الضوئية إلى SVG. spec غير صالح → ''. */
export function renderRays(spec: RaysSpec, opts?: RenderOptions): string {
  try {
    const col = resolveColor(opts);
    const objDist = spec.objectDistance ?? DEFAULT_OBJECT_DISTANCE;
    const objHeight = spec.objectHeight ?? DEFAULT_OBJECT_HEIGHT;
    const focal = spec.focalLength ?? DEFAULT_FOCAL_LENGTH;
    const showRays = spec.showConstructionRays ?? true;
    const showImage = spec.showImage ?? true;
    const showLabels = spec.showLabels ?? true;

    // المحور البصري الأفقي
    let svg = `<line x1="0" y1="${CY}" x2="${W}" y2="${CY}" ${strokeThinAttr(col)} stroke-dasharray="6 4"/>`;

    // العنصر البصري
    svg += drawElement(spec.kind, col);

    // البؤر
    if (showLabels) svg += drawFoci(spec.kind, focal, col);

    // الشيء (سهم أخضر منتصب على اليسار)
    const objX = CX - objDist;
    const objTopY = CY - objHeight;
    svg += verticalArrow(objX, CY, objTopY, OBJECT_COLOR);
    if (showLabels) svg += text(objX, CY + 15, 'B', { size: 11, bold: true, color: OBJECT_COLOR });

    // حساب الصورة
    const info = computeImage(spec.kind, objDist, objHeight, focal);

    // أشعّة الإنشاء
    if (showRays) svg += drawRays(spec.kind, objX, objTopY, info);

    // الصورة (سهم أحمر — متقطّع إن كانت تخيّلية)
    if (showImage) {
      const imgVisible = info.imgX > 4 && info.imgX < W - 4;
      if (imgVisible) {
        const stroke = info.virtual ? ' stroke-dasharray="4 3"' : '';
        svg += `<line x1="${info.imgX.toFixed(1)}" y1="${CY}" x2="${info.imgX.toFixed(1)}" y2="${info.imgTopY.toFixed(1)}" stroke="${IMAGE_COLOR}" stroke-width="2.5" stroke-linecap="round"${stroke}/>`;
        const dir = info.imgTopY < CY ? -1 : 1;
        svg += arrowHead(info.imgX, info.imgTopY, 0, dir, IMAGE_COLOR);
        if (showLabels) svg += text(info.imgX, CY + 15, "B'", { size: 11, bold: true, color: IMAGE_COLOR });
      }
    }

    const ariaLabel = `مخطط أشعّة ضوئية: ${spec.kind}`;
    return wrapSvg(svg, W, H, ariaLabel, opts);
  } catch {
    // مبدأ "لا يرمي أبداً"
    return '';
  }
}
