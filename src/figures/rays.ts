// ============================================================
// Rays Generator — مولّد الأشعة والظواهر الضوئية (البصريات)
// ============================================================
// يشمل نماذج بصرية عالية الجودة بتجسيم متجهي ثلاثي الأبعاد (Vector 3D):
//
// أولاً — مسارات الأشعة الهندسية:
// 1. العدسة المجمّعة (converging_lens): محدبة الوجهين 3D مع البؤرتين F و F'
// 2. العدسة المفرّقة (diverging_lens): مقعرة الوجهين 3D والصورة التخيلية
// 3. المرآة المستوية (plane_mirror): سطح عاكس 3D وتناظر الصورة الافتراضية
// 4. المرآة المقعّرة (concave_mirror): مرآة كروية مجمعة والبؤرة F والمركز C
// 5. المرآة المحدّبة (convex_mirror): مرآة كروية مفرقة وصورة مصغرة
//
// ثانياً — التجارب المخبرية لمنهاج التعليم المتوسط (1AM - 4AM):
// 6. انعكاس وانكسار الضوء (reflection_refraction): قرص هارتل المدرج والناظم و i=r
// 7. تحليل وتبدد الضوء الأبيض (prism_dispersion): موشور زجاجي 3D وألوان الطيف السبعة
// 8. الانتشار المستقيمي والظل والظليل (shadow_penumbra): منبع ضوئي، كرة، مخروط الظل والظليل
// 9. المنضدة البصرية المخبرية 3D (optical_bench): شمعة مشتعلة، عدسة بحامل، شاشة بصورة مقلوبة
//
// يدعم 3 أوضاع للتأشيرات:
// - 'full': بطاقات شرح عصرية تجمع بين العربية واللاتينية (للشرح والسبورة)
// - 'numbered': دوائر ترقيم 1..N لأسئلة ومسائل الامتحانات و BEM
// - 'none': رسم توضيحي نقي بدون تأشيرات
//
// المبدأ الحاكم: "لا يرمي أبداً" — أي مواصفات غير صالحة تعيد ''
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

export interface CalloutItem {
  num: number;
  ar: string;
  sub: string;
  target: [number, number];
  card: [number, number];
}

// ------------------------------------------------------------
// مخطّطات Zod
// ------------------------------------------------------------

export const raysKindSchema = z.enum([
  'converging_lens',       // عدسة مجمّعة (محدّبة)
  'diverging_lens',        // عدسة مفرّقة (مقعّرة)
  'plane_mirror',          // مرآة مستوية
  'concave_mirror',        // مرآة مقعّرة (مجمّعة)
  'convex_mirror',         // مرآة محدّبة (مفرّقة)
  'reflection_refraction', // انعكاس وانكسار الضوء (قرص هارتل)
  'prism_dispersion',      // تبدد الضوء بالموشور 3D وألوان الطيف
  'shadow_penumbra',       // الانتشار المستقيمي والظل والظليل
  'optical_bench',         // المنضدة البصرية المخبرية 3D
]);
export type RaysKind = z.infer<typeof raysKindSchema>;

export const labelsModeSchema = z.enum(['full', 'numbered', 'none']).default('full');
export type LabelsMode = z.infer<typeof labelsModeSchema>;

export const raysThemeSchema = z.enum(['natural', 'vibrant', 'exam_print']).default('natural');
export type RaysTheme = z.infer<typeof raysThemeSchema>;

/** مواصفات مولّد الأشعة والظواهر الضوئية. */
export const raysSpecSchema = z
  .object({
    kind: raysKindSchema.describe('نوع العنصر أو التجربة البصرية'),
    /** بُعد الشيء عن العنصر (وحدات بكسل تقريبية). */
    objectDistance: z.number().positive().max(500).optional(),
    /** ارتفاع الشيء (طول السهم المنتصب). */
    objectHeight: z.number().positive().max(250).optional(),
    /** البعد البؤري (المسافة من العنصر إلى البؤرة). */
    focalLength: z.number().positive().max(350).optional(),
    /** رسم أشعّة الإنشاء (الوارد + المنكسر/المنعكس). الافتراضي true. */
    showConstructionRays: z.boolean().optional(),
    /** رسم الصورة المحسوبة. الافتراضي true. */
    showImage: z.boolean().optional(),
    /** رسم تسميات البؤر والمحور. الافتراضي true. */
    showLabels: z.boolean().optional(),

    // الخيارات الحديثة للأنماط والسمات
    labelsMode: labelsModeSchema.optional(),
    theme: raysThemeSchema.optional(),
    caption: z.string().optional(),

    // خيارات التجارب البصرية المتقدمة
    angleIncident: z.number().min(0).max(90).optional(),
    refractiveIndex: z.number().positive().optional(),
    lightSourceType: z.enum(['point', 'extended']).optional(),
    showDispersion: z.boolean().optional(),
  })
  .strict();

export type RaysSpec = z.infer<typeof raysSpecSchema>;

// ------------------------------------------------------------
// ثوابت الأبعاد والألوان
// ------------------------------------------------------------

const W = 960;
const H = 540;
const CX = W / 2; // 480
const CY = H / 2; // 270

const DEFAULT_OBJECT_DISTANCE = 130;
const DEFAULT_OBJECT_HEIGHT = 55;
const DEFAULT_FOCAL_LENGTH = 65;

const ELEMENT_HALF = 140;      // نصف ارتفاع رمز العنصر 3D
const RAY_INCIDENT = '#f59e0b'; // برتقالي ذهبي متوهج — شعاع مواز
const RAY_CHIEF = '#8b5cf6';    // بنفسجي ناصع — شعاع مركزي
const OBJECT_COLOR = '#10b981'; // أخضر زمردي — الشيء
const IMAGE_COLOR = '#ef4444';  // أحمر — الصورة
const EDGE = 25;

type Pt = readonly [number, number];

// ------------------------------------------------------------
// مساعدات هندسية والتأشيرات
// ------------------------------------------------------------

function renderOpticsCallouts(
  labels: CalloutItem[],
  mode: LabelsMode,
  uid: string,
  cPointerDot: string,
  cCalloutBg: string,
  cCalloutStroke: string,
  cTextMain: string,
  cTextSub: string,
  fontFamily?: string
): string {
  let res = `<g class="optics-callouts">`;
  const font = fontFamily ?? 'sans-serif';

  for (const item of labels) {
    const [tx, ty] = item.target;
    const [cx, cy] = item.card;

    if (mode === 'numbered') {
      res += `<!-- مؤشر مرقم [${item.num}] -->
      <line x1="${cx}" y1="${cy}" x2="${tx}" y2="${ty}" stroke="${cCalloutStroke}" stroke-width="1.6" stroke-dasharray="3,3" opacity="0.85"/>
      <circle cx="${tx}" cy="${ty}" r="4" fill="${cPointerDot}"/>
      <g filter="url(#opt-shadow-${uid})">
        <circle cx="${cx}" cy="${cy}" r="14" fill="${cCalloutBg}" stroke="${cPointerDot}" stroke-width="2.2"/>
        <text x="${cx}" y="${cy + 5}" font-size="13" font-weight="bold" fill="${cPointerDot}" text-anchor="middle" font-family="${font}">${item.num}</text>
      </g>`;
    } else {
      const cardW = 180;
      const cardH = 36;
      const rx = cx - cardW / 2;
      const ry = cy - cardH / 2;

      res += `<!-- بطاقة شرح [${item.ar}] -->
      <line x1="${cx}" y1="${cy > ty ? ry : ry + cardH}" x2="${tx}" y2="${ty}" stroke="${cCalloutStroke}" stroke-width="1.4" opacity="0.75"/>
      <circle cx="${tx}" cy="${ty}" r="3.5" fill="${cPointerDot}"/>
      <g filter="url(#opt-shadow-${uid})">
        <rect x="${rx}" y="${ry}" width="${cardW}" height="${cardH}" rx="9" fill="${cCalloutBg}" stroke="${cCalloutStroke}" stroke-width="1.2"/>
        <text x="${cx}" y="${cy - 3}" font-size="11" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${font}">${esc(item.ar)}</text>
        <text x="${cx}" y="${cy + 11}" font-size="9" font-weight="500" fill="${cTextSub}" text-anchor="middle" font-family="${font}">${esc(item.sub)}</text>
      </g>`;
    }
  }

  res += `</g>`;
  return res;
}

/** رأس سهم عند (x,y) موجّه نحو الاتجاه (dx,dy). */
function arrowHead(x: number, y: number, dx: number, dy: number, color: string): string {
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const size = 10;
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
  const line = `<line x1="${x.toFixed(1)}" y1="${baseY}" x2="${x.toFixed(1)}" y2="${topY.toFixed(1)}" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`;
  const dir = topY < baseY ? -1 : 1;
  return line + arrowHead(x, topY, 0, dir, color);
}

/** خط شعاع (متصل أو متقطّع). */
function rayLine(a: Pt, b: Pt, color: string, dashed: boolean): string {
  const dash = dashed ? ' stroke-dasharray="4 4"' : '';
  return `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="${color}" stroke-width="2.2"${dash}/>`;
}

// ------------------------------------------------------------
// حساب موضع الصورة (معادلة غاوس للعدسات والمرايا)
// ------------------------------------------------------------

interface ImageInfo {
  readonly imgX: number;
  readonly imgTopY: number;
  readonly virtual: boolean;
}

function computeImage(
  kind: RaysKind,
  objDist: number,
  objHeight: number,
  focal: number,
): ImageInfo {
  if (kind === 'plane_mirror') {
    return { imgX: CX + objDist, imgTopY: CY - objHeight, virtual: true };
  }

  const isMirror = kind === 'concave_mirror' || kind === 'convex_mirror';
  const diverging = kind === 'diverging_lens' || kind === 'convex_mirror';
  const fEff = diverging ? -focal : focal;

  const denom = objDist - fEff;
  const di = denom !== 0 ? (objDist * fEff) / denom : objDist * 1000;
  const m = -di / objDist;
  const imgHeight = m * objHeight;
  const imgTopY = CY - imgHeight;

  const imgX = isMirror ? CX - di : CX + di;
  return { imgX, imgTopY, virtual: di < 0 };
}

// ------------------------------------------------------------
// رسم العناصر البصرية 3D (عدسات، مرايا)
// ------------------------------------------------------------

function drawElement3D(kind: RaysKind, col: string, uid: string, isExam: boolean): string {
  const top = CY - ELEMENT_HALF;
  const bot = CY + ELEMENT_HALF;
  const h = bot - top;

  switch (kind) {
    case 'converging_lens': {
      // عدسة زجاجية محدبة الوجهين 3D مع لمعان بلوري وقاعدة
      return `<g class="lens-3d">
        <!-- جسم العدسة الزجاجي المحدب بتدرج ناصع -->
        <path d="M ${CX},${top} Q ${CX + 28},${CY} ${CX},${bot} Q ${CX - 28},${CY} ${CX},${top} Z" fill="${isExam ? '#cbd5e1' : 'url(#lens-glass-' + uid + ')'}" stroke="${isExam ? '#000000' : '#38bdf8'}" stroke-width="2.2" filter="url(#opt-shadow-${uid})"/>
        <!-- لمعة زجاجية مقوسة ناصعة -->
        <path d="M ${CX - 12},${top + 30} Q ${CX + 14},${CY} ${CX - 12},${bot - 30}" stroke="#ffffff" stroke-width="2.5" fill="none" opacity="0.75" stroke-linecap="round"/>
        <!-- رأس سهم مزدوج رمزي علوي وسفلي ↕ -->
        <line x1="${CX}" y1="${top - 12}" x2="${CX}" y2="${bot + 12}" stroke="${col}" stroke-width="1.8" stroke-linecap="round"/>
        ${arrowHead(CX, top - 12, 0, -1, col)}
        ${arrowHead(CX, bot + 12, 0, 1, col)}
      </g>`;
    }
    case 'diverging_lens': {
      // عدسة زجاجية مقعرة الوجهين 3D مع لمعان بلوري
      return `<g class="lens-3d">
        <path d="M ${CX - 20},${top} L ${CX + 20},${top} Q ${CX + 4},${CY} ${CX + 20},${bot} L ${CX - 20},${bot} Q ${CX - 4},${CY} ${CX - 20},${top} Z" fill="${isExam ? '#cbd5e1' : 'url(#lens-glass-' + uid + ')'}" stroke="${isExam ? '#000000' : '#38bdf8'}" stroke-width="2.2" filter="url(#opt-shadow-${uid})"/>
        <!-- رمز العدسة المفرقة بسهمين للداخل -->
        <line x1="${CX}" y1="${top - 12}" x2="${CX}" y2="${bot + 12}" stroke="${col}" stroke-width="1.8"/>
        ${arrowHead(CX, top + 6, 0, 1, col)}
        ${arrowHead(CX, bot - 6, 0, -1, col)}
      </g>`;
    }
    case 'plane_mirror': {
      // مرآة مستوية 3D بإطار معدني، سطح زجاجي أمامي، وتظليل فضي خلفي
      let s = `<g class="plane-mirror-3d" filter="url(#opt-shadow-${uid})">
        <rect x="${CX - 4}" y="${top}" width="8" height="${h}" rx="2" fill="${isExam ? '#94a3b8' : '#38bdf8'}" stroke="${isExam ? '#000000' : '#0284c7'}" stroke-width="1.5"/>
        <line x1="${CX - 4}" y1="${top}" x2="${CX - 4}" y2="${bot}" stroke="#ffffff" stroke-width="2"/>`;
      // خطوط التظليل المائلة في الجانب الخلفي للمرآة (جهة اليمين)
      for (let y = top; y <= bot; y += 18) {
        s += `<line x1="${CX + 4}" y1="${y}" x2="${CX + 16}" y2="${y + 12}" stroke="${isExam ? '#000000' : '#64748b'}" stroke-width="1.6"/>`;
      }
      s += `<!-- قاعدة تثبيت المرآة على المحور -->
        <polygon points="${CX - 15},${bot + 15} ${CX + 15},${bot + 15} ${CX + 5},${bot} ${CX - 5},${bot}" fill="${isExam ? '#64748b' : '#334155'}"/>
      </g>`;
      return s;
    }
    case 'concave_mirror': {
      // مرآة مقعرة كروية 3D (الوجه العاكس يواجه اليسار نحو الشيء)
      return `<g class="concave-mirror-3d" filter="url(#opt-shadow-${uid})">
        <path d="M ${CX},${top} Q ${CX + 45},${CY} ${CX},${bot}" fill="none" stroke="${isExam ? '#000000' : '#0284c7'}" stroke-width="5" stroke-linecap="round"/>
        <path d="M ${CX - 2},${top + 6} Q ${CX + 41},${CY} ${CX - 2},${bot - 6}" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.8"/>
        <!-- تظليلات خلفية للمرآة المقعرة -->
        ${Array.from({ length: 9 }).map((_, i) => {
          const ty = top + 20 + i * 28;
          const tx = CX + 15 + Math.sin((i / 8) * Math.PI) * 25;
          return `<line x1="${tx}" y1="${ty}" x2="${tx + 12}" y2="${ty + 8}" stroke="${isExam ? '#000000' : '#64748b'}" stroke-width="1.6"/>`;
        }).join('')}
      </g>`;
    }
    case 'convex_mirror': {
      // مرآة محدبة كروية 3D (الوجه العاكس المحدب يواجه اليسار)
      return `<g class="convex-mirror-3d" filter="url(#opt-shadow-${uid})">
        <path d="M ${CX},${top} Q ${CX - 45},${CY} ${CX},${bot}" fill="none" stroke="${isExam ? '#000000' : '#0284c7'}" stroke-width="5" stroke-linecap="round"/>
        <path d="M ${CX - 4},${top + 6} Q ${CX - 47},${CY} ${CX - 4},${bot - 6}" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.8"/>
        <!-- تظليلات داخلية -->
        ${Array.from({ length: 9 }).map((_, i) => {
          const ty = top + 20 + i * 28;
          const tx = CX - 15 - Math.sin((i / 8) * Math.PI) * 25;
          return `<line x1="${tx}" y1="${ty}" x2="${tx + 12}" y2="${ty + 8}" stroke="${isExam ? '#000000' : '#64748b'}" stroke-width="1.6"/>`;
        }).join('')}
      </g>`;
    }
    default:
      return '';
  }
}

/** يرسم البؤر والتسميات على المحور. */
function drawFoci3D(kind: RaysKind, focal: number, col: string, opts?: RenderOptions): string {
  if (kind === 'plane_mirror') return '';
  const isMirror = kind === 'concave_mirror' || kind === 'convex_mirror';

  const dot = (x: number, label: string): string =>
    `<circle cx="${x}" cy="${CY}" r="4" fill="${col}" stroke="#ffffff" stroke-width="1.5"/>` +
    text(x, CY + 22, label, { size: 14, bold: true, color: col, fontFamily: opts?.fontFamily });

  if (isMirror) {
    if (kind === 'concave_mirror') {
      // المرآة المقعرة: البؤرة والمركز في الجهة الحقيقية (يسار)
      return dot(CX - focal, 'F') + dot(CX - 2 * focal, 'C');
    }
    // المرآة المحدبة: البؤرة والمركز في الجهة الافتراضية (يمين)
    return dot(CX + focal, 'F') + dot(CX + 2 * focal, 'C');
  }
  // العدسة: F يساراً و F' يميناً
  return dot(CX - focal, 'F') + dot(CX + focal, "F'");
}

function outgoingRay(p: Pt, img: Pt, color: string, realTowardImage: boolean): string {
  if (realTowardImage) return rayLine(p, img, color, false);
  const dx = p[0] - img[0];
  const dy = p[1] - img[1];
  const len = Math.hypot(dx, dy) || 1;
  const solidEnd: Pt = [p[0] + (dx / len) * (ELEMENT_HALF * 1.6 + EDGE), p[1] + (dy / len) * (ELEMENT_HALF * 1.6 + EDGE)];
  return rayLine(p, solidEnd, color, false) + rayLine(img, p, color, true);
}

function drawRays3D(kind: RaysKind, objX: number, objTopY: number, info: ImageInfo): string {
  const isMirror = kind === 'concave_mirror' || kind === 'convex_mirror' || kind === 'plane_mirror';
  const img: Pt = [info.imgX, info.imgTopY];

  const realTowardImage = isMirror ? info.imgX < CX : info.imgX > CX;

  // الشعاع 1 — مواز للمحور ثم ينكسر/ينعكس ماراً بالبؤرة
  const p1: Pt = [CX, objTopY];
  let svg = rayLine([objX, objTopY], p1, RAY_INCIDENT, false);
  svg += arrowHead((objX + CX) / 2, objTopY, 1, 0, RAY_INCIDENT);
  svg += outgoingRay(p1, img, RAY_INCIDENT, realTowardImage);

  // الشعاع 2 — يمرّ بمركز العدسة / قمّة المرآة
  const p2: Pt = [CX, CY];
  svg += rayLine([objX, objTopY], p2, RAY_CHIEF, false);
  svg += arrowHead((objX + CX) / 2, (objTopY + CY) / 2, CX - objX, CY - objTopY, RAY_CHIEF);
  svg += outgoingRay(p2, img, RAY_CHIEF, realTowardImage);

  return svg;
}

// ------------------------------------------------------------
// 6. انعكاس وانكسار الضوء — قرص هارتل (Reflection & Refraction)
// ------------------------------------------------------------

function renderReflectionRefraction(spec: RaysSpec, opts?: RenderOptions): string {
  const angleInc = spec.angleIncident ?? 45; // بالدرجات
  const n = spec.refractiveIndex ?? 1.5; // قرينة انكسار الزجاج
  const mode = spec.labelsMode ?? 'full';
  const theme = spec.theme ?? 'natural';
  const uid = Math.random().toString(36).substring(2, 8);

  const isExam = theme === 'exam_print';
  const cTextMain = isExam ? '#000000' : '#0f172a';
  const cTextSub = isExam ? '#334155' : '#64748b';
  const cPointerDot = isExam ? '#000000' : '#ef4444';
  const cCalloutBg = '#ffffff';
  const cCalloutStroke = isExam ? '#334155' : '#cbd5e1';

  // حساب زاوية الانكسار بقانون سنيل-ديكارت: sin(i) = n * sin(r')
  const radI = (angleInc * Math.PI) / 180;
  const sinRPrime = Math.sin(radI) / n;
  const radRPrime = Math.asin(sinRPrime);
  const angleRefract = Math.round((radRPrime * 180) / Math.PI);

  const discR = 210;
  const oX = CX;
  const oY = CY;

  let content = '';

  // 1. قرص هارتل البصري المدرج 3D (Hartl Disc)
  content += `<g class="hartl-disc" filter="url(#opt-shadow-${uid})">
    <!-- خلفية القرص الأبيض -->
    <circle cx="${oX}" cy="${oY}" r="${discR}" fill="${isExam ? '#f8fafc' : '#f1f5f9'}" stroke="${isExam ? '#000000' : '#94a3b8'}" stroke-width="3"/>
    <circle cx="${oX}" cy="${oY}" r="${discR - 8}" fill="none" stroke="${isExam ? '#cbd5e1' : '#cbd5e1'}" stroke-width="1"/>

    <!-- تدريجات الزوايا كل 10 درجات -->
    ${Array.from({ length: 36 }).map((_, i) => {
      const a = (i * 10 * Math.PI) / 180;
      const isMajor = i % 3 === 0;
      const x1 = oX + Math.cos(a) * (discR - (isMajor ? 16 : 8));
      const y1 = oY + Math.sin(a) * (discR - (isMajor ? 16 : 8));
      const x2 = oX + Math.cos(a) * discR;
      const y2 = oY + Math.sin(a) * discR;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${isExam ? '#475569' : '#64748b'}" stroke-width="${isMajor ? 1.8 : 1}"/>`;
    }).join('')}

    <!-- أرقام الزوايا 0, 30, 60, 90 -->
    <text x="${oX}" y="${oY - discR + 25}" font-size="11" font-weight="bold" fill="#64748b" text-anchor="middle">0° (الناظم)</text>
    <text x="${oX + discR - 25}" y="${oY + 4}" font-size="11" font-weight="bold" fill="#64748b" text-anchor="middle">90°</text>
    <text x="${oX - discR + 25}" y="${oY + 4}" font-size="11" font-weight="bold" fill="#64748b" text-anchor="middle">90°</text>
  </g>`;

  // 2. الوسط الكاسر نصف الدائري في الأسفل (متوازي مستطيلات أو حوض زجاجي)
  content += `<g class="refracting-medium">
    <!-- النصف السفلي للقرص كوسط شفاف (زجاج n=1.5) -->
    <path d="M ${oX - discR + 20},${oY} A ${discR - 20} ${discR - 20} 0 0 0 ${oX + discR - 20},${oY} Z" fill="${isExam ? '#e2e8f0' : '#38bdf8'}" fill-opacity="${isExam ? '0.4' : '0.18'}" stroke="${isExam ? '#000000' : '#0284c7'}" stroke-width="2"/>
    <text x="${oX + 90}" y="${oY + 50}" font-size="13" font-weight="bold" fill="${isExam ? '#000000' : '#0284c7'}">وسط شفاف 2 (زجاج n=1.5)</text>
    <text x="${oX + 90}" y="${oY - 50}" font-size="13" font-weight="bold" fill="${isExam ? '#000000' : '#0284c7'}">وسط شفاف 1 (هواء n=1)</text>
  </g>`;

  // 3. السطح الفاصل العاكس/الكاسر والناظم N
  content += `<g class="boundary-and-normal">
    <!-- السطح الفاصل الأفقي -->
    <line x1="${oX - discR + 10}" y1="${oY}" x2="${oX + discR - 10}" y2="${oY}" stroke="${isExam ? '#000000' : '#1e293b'}" stroke-width="2.8"/>
    <!-- الناظم الشاقولي المنقط N -->
    <line x1="${oX}" y1="${oY - discR + 10}" x2="${oX}" y2="${oY + discR - 10}" stroke="${isExam ? '#475569' : '#0284c7'}" stroke-width="2" stroke-dasharray="6,4"/>
    <text x="${oX + 8}" y="${oY - discR + 38}" font-size="13" font-weight="bold" fill="${isExam ? '#000000' : '#0284c7'}">N (الناظم)</text>
    <!-- نقطة الورود O -->
    <circle cx="${oX}" cy="${oY}" r="4.5" fill="#ef4444"/>
    <text x="${oX - 14}" y="${oY - 8}" font-size="13" font-weight="bold" fill="#ef4444">O</text>
  </g>`;

  // 4. الحزم الضوئية الليزرية
  const rayLen = 190;
  // شعاع الورود (من أعلى اليسار بزاوية i مع الناظم)
  const incX = oX - Math.sin(radI) * rayLen;
  const incY = oY - Math.cos(radI) * rayLen;

  // شعاع الانعكاس (إلى أعلى اليمين بزاوية r = i مع الناظم)
  const refX = oX + Math.sin(radI) * rayLen;
  const refY = oY - Math.cos(radI) * rayLen;

  // شعاع الانكسار (إلى أسفل اليمين بزاوية r' مع الناظم)
  const refrX = oX + Math.sin(radRPrime) * rayLen;
  const refrY = oY + Math.cos(radRPrime) * rayLen;

  content += `<g class="laser-rays">
    <!-- شعاع الورود -->
    <line x1="${incX}" y1="${incY}" x2="${oX}" y2="${oY}" stroke="#ef4444" stroke-width="3.5" stroke-linecap="round"/>
    ${arrowHead((incX + oX) / 2, (incY + oY) / 2, oX - incX, oY - incY, '#ef4444')}

    <!-- شعاع الانعكاس -->
    <line x1="${oX}" y1="${oY}" x2="${refX}" y2="${refY}" stroke="#ef4444" stroke-width="3" stroke-linecap="round" stroke-dasharray="5,2"/>
    ${arrowHead((oX + refX) / 2, (oY + refY) / 2, refX - oX, refY - oY, '#ef4444')}

    <!-- شعاع الانكسار النافذ في الزجاج -->
    <line x1="${oX}" y1="${oY}" x2="${refrX}" y2="${refrY}" stroke="#ef4444" stroke-width="3.5" stroke-linecap="round"/>
    ${arrowHead((oX + refrX) / 2, (oY + refrY) / 2, refrX - oX, refrY - oY, '#ef4444')}

    <!-- منبع الليزر الأحمر 3D في أعلى مسار الورود -->
    <g transform="rotate(${90 - angleInc} ${incX} ${incY})">
      <rect x="${incX - 50}" y="${incY - 14}" width="50" height="28" rx="5" fill="${isExam ? '#64748b' : '#1e293b'}" stroke="${isExam ? '#000000' : '#475569'}" stroke-width="1.8"/>
      <rect x="${incX - 8}" y="${incY - 10}" width="8" height="20" rx="2" fill="#ef4444"/>
      <circle cx="${incX - 35}" cy="${incY}" r="4" fill="#fbbf24"/>
    </g>

    <!-- أقواس وتسميات الزوايا: زاوية الورود i وزاوية الانعكاس r وزاوية الانكسار r' -->
    <path d="M ${oX} ${oY - 50} A 50 50 0 0 0 ${oX - Math.sin(radI) * 50} ${oY - Math.cos(radI) * 50}" fill="none" stroke="#f59e0b" stroke-width="2"/>
    <text x="${oX - 30}" y="${oY - 60}" font-size="13" font-weight="bold" fill="#f59e0b">i = ${angleInc}°</text>

    <path d="M ${oX} ${oY - 50} A 50 50 0 0 1 ${oX + Math.sin(radI) * 50} ${oY - Math.cos(radI) * 50}" fill="none" stroke="#f59e0b" stroke-width="2"/>
    <text x="${oX + 25}" y="${oY - 60}" font-size="13" font-weight="bold" fill="#f59e0b">r = ${angleInc}°</text>

    <path d="M ${oX} ${oY + 50} A 50 50 0 0 0 ${oX + Math.sin(radRPrime) * 50} ${oY + Math.cos(radRPrime) * 50}" fill="none" stroke="#38bdf8" stroke-width="2"/>
    <text x="${oX + 22}" y="${oY + 75}" font-size="13" font-weight="bold" fill="${isExam ? '#000000' : '#0284c7'}">r' = ${angleRefract}°</text>
  </g>`;

  // 5. التأشيرات
  if (mode !== 'none') {
    const labels: CalloutItem[] = [
      { num: 1, ar: 'منبع ضوئي ليزري', sub: 'Laser Light Source', target: [incX - 25, incY - 10], card: [170, 70] },
      { num: 2, ar: 'شعاع ضوئي وارد', sub: 'Incident Ray (i)', target: [(incX + oX) / 2, (incY + oY) / 2], card: [250, 160] },
      { num: 3, ar: 'الناظم على السطح العاكس', sub: 'Normal Line (N)', target: [oX, oY - 100], card: [480, 45] },
      { num: 4, ar: 'شعاع ضوئي منعكس (i=r)', sub: 'Reflected Ray (r)', target: [(oX + refX) / 2, (oY + refY) / 2], card: [710, 160] },
      { num: 5, ar: 'شعاع ضوئي منكسر', sub: 'Refracted Ray (r\')', target: [(oX + refrX) / 2, (oY + refrY) / 2], card: [760, 390] },
      { num: 6, ar: 'قرص هارتل المدرج', sub: 'Hartl Optical Disc', target: [oX - discR + 30, oY + 80], card: [210, 420] },
    ];

    content += renderOpticsCallouts(labels, mode, uid, cPointerDot, cCalloutBg, cCalloutStroke, cTextMain, cTextSub, opts?.fontFamily);
  }

  return content;
}

// ------------------------------------------------------------
// 7. تحليل وتبدد الضوء الأبيض بالموشور 3D (Prism Dispersion)
// ------------------------------------------------------------

function renderPrismDispersion(spec: RaysSpec, opts?: RenderOptions): string {
  const mode = spec.labelsMode ?? 'full';
  const theme = spec.theme ?? 'natural';
  const uid = Math.random().toString(36).substring(2, 8);

  const isExam = theme === 'exam_print';
  const cTextMain = isExam ? '#000000' : '#0f172a';
  const cTextSub = isExam ? '#334155' : '#64748b';
  const cPointerDot = isExam ? '#000000' : '#8b5cf6';
  const cCalloutBg = '#ffffff';
  const cCalloutStroke = isExam ? '#334155' : '#cbd5e1';

  let content = '';

  // طاولة التجارب المخبرية
  content += `<line x1="60" y1="460" x2="900" y2="460" stroke="${isExam ? '#94a3b8' : '#cbd5e1'}" stroke-width="3" stroke-linecap="round"/>`;

  // 1. موشور زجاجي ثلاثي الأبعاد 3D (Triangular Glass Prism)
  // رأس الموشور عند قمة المثلث، مع منظور إيزومتري
  const prX = 400;
  const prY = 160;
  const prW = 160;
  const prH = 200;

  content += `<g class="glass-prism-3d" filter="url(#opt-shadow-${uid})">
    <!-- الوجه الخلفي المائل للموشور -->
    <polygon points="${prX + 60},${prY - 40} ${prX + prW / 2 + 60},${prY + prH - 40} ${prX - prW / 2 + 60},${prY + prH - 40}" fill="${isExam ? '#e2e8f0' : '#bae6fd'}" opacity="0.4"/>
    <!-- الوجه العلوي المنحدر ثلاثي الأبعاد -->
    <polygon points="${prX},${prY} ${prX + 60},${prY - 40} ${prX + prW / 2 + 60},${prY + prH - 40} ${prX + prW / 2},${prY + prH}" fill="${isExam ? '#cbd5e1' : '#7dd3fc'}" opacity="0.55"/>
    <!-- الوجه الأمامي المثلث الرئيسي الشفاف -->
    <polygon points="${prX},${prY} ${prX + prW / 2},${prY + prH} ${prX - prW / 2},${prY + prH}" fill="${isExam ? '#ffffff' : 'url(#lens-glass-' + uid + ')'}" stroke="${isExam ? '#000000' : '#38bdf8'}" stroke-width="2.5"/>

    <!-- انعكاس لمعان الحواف الزجاجية الكريستالية -->
    <line x1="${prX}" y1="${prY}" x2="${prX - prW / 2}" y2="${prY + prH}" stroke="#ffffff" stroke-width="3" opacity="0.85"/>
    <line x1="${prX}" y1="${prY}" x2="${prX + 60}" y2="${prY - 40}" stroke="#ffffff" stroke-width="2.5" opacity="0.75"/>
    <line x1="${prX - prW / 2}" y1="${prY + prH}" x2="${prX + prW / 2}" y2="${prY + prH}" stroke="${isExam ? '#000000' : '#0284c7'}" stroke-width="2"/>
  </g>`;

  // 2. منبع الضوء الأبيض والحزمة الواردة المركزة
  const srcX = 140;
  const srcY = 240;
  const hitX = prX - prW / 4;
  const hitY = prY + prH / 2 + 10;

  content += `<g class="white-light-source">
    <!-- المنبع الضوئي 3D -->
    <rect x="${srcX - 60}" y="${srcY - 25}" width="60" height="50" rx="8" fill="${isExam ? '#64748b' : '#1e293b'}" stroke="${isExam ? '#000000' : '#475569'}" stroke-width="2" filter="url(#opt-shadow-${uid})"/>
    <circle cx="${srcX - 8}" cy="${srcY}" r="12" fill="#ffffff" filter="url(#opt-glow-${uid})"/>
    <rect x="${srcX - 3}" y="${srcY - 18}" width="6" height="36" rx="2" fill="#fbbf24"/>

    <!-- شاشة الحاجز مع الشق الضيق لتحديد الحزمة -->
    <rect x="220" y="200" width="8" height="110" rx="2" fill="${isExam ? '#475569' : '#334155'}"/>
    <line x1="220" y1="${srcY + 5}" x2="228" y2="${srcY + 5}" stroke="#ffffff" stroke-width="5"/>

    <!-- حزمة الضوء الأبيض الواردة -->
    <polygon points="${srcX},${srcY - 4} ${hitX},${hitY - 6} ${hitX},${hitY + 6} ${srcX},${srcY + 4}" fill="#ffffff" stroke="${isExam ? '#000000' : '#cbd5e1'}" stroke-width="1.2" filter="url(#opt-glow-${uid})"/>
    ${arrowHead((srcX + hitX) / 2, srcY + 2, hitX - srcX, hitY - srcY, '#fbbf24')}
    <text x="240" y="195" font-size="12" font-weight="bold" fill="${isExam ? '#000000' : '#ffffff'}">حزمة ضوء أبيض</text>
  </g>`;

  // 3. مسارات التبدد والانكسار اللوني للألوان السبعة
  // تخرج الأشعة من الوجه الأيمن للموشور نحو شاشة الاستقبال
  const exitX = prX + prW / 4 + 10;
  const exitY = prY + prH / 2 + 20;

  const scX = 800; // موضع الشاشة
  const colors = [
    { name: 'أحمر', en: 'Red', col: '#ef4444', y: 220 },
    { name: 'برتقالي', en: 'Orange', col: '#f97316', y: 242 },
    { name: 'أصفر', en: 'Yellow', col: '#eab308', y: 264 },
    { name: 'أخضر', en: 'Green', col: '#22c55e', y: 286 },
    { name: 'أزرق', en: 'Blue', col: '#06b6d4', y: 308 },
    { name: 'نيلي', en: 'Indigo', col: '#3b82f6', y: 330 },
    { name: 'بنفسجي', en: 'Violet', col: '#8b5cf6', y: 352 },
  ];

  content += `<g class="dispersion-rays">`;
  // انكسار داخلي في الموشور
  colors.forEach((c, i) => {
    const inY = hitY - 4 + i * 1.5;
    const outY = exitY - 8 + i * 3.5;
    content += `<line x1="${hitX}" y1="${inY}" x2="${exitX}" y2="${outY}" stroke="${c.col}" stroke-width="2" opacity="0.8"/>`;
  });

  // الحزم السبعة الخارجة نحو الشاشة
  colors.forEach((c) => {
    content += `<line x1="${exitX}" y1="${exitY}" x2="${scX}" y2="${c.y}" stroke="${c.col}" stroke-width="3" stroke-linecap="round" filter="url(#opt-glow-${uid})"/>`;
    content += arrowHead((exitX + scX) / 2, (exitY + c.y) / 2, scX - exitX, c.y - exitY, c.col);
  });
  content += `</g>`;

  // 4. شاشة الاستقبال البيضاء 3D وطيف قوس قزح المتدرج
  content += `<g class="spectrum-screen" filter="url(#opt-shadow-${uid})">
    <!-- لوح الشاشة البيضاء المائلة في المنظور -->
    <polygon points="${scX},180 ${scX + 45},150 ${scX + 45},410 ${scX},440" fill="#ffffff" stroke="${isExam ? '#000000' : '#94a3b8'}" stroke-width="2"/>
    <!-- قاعدة حامل الشاشة -->
    <polygon points="${scX - 15},460 ${scX + 60},460 ${scX + 35},440 ${scX},440" fill="${isExam ? '#64748b' : '#334155'}"/>

    <!-- شريط الطيف الضوئي المستمر السبعة على الشاشة -->
    <rect x="${scX + 8}" y="210" width="28" height="155" rx="3" fill="url(#rainbow-grad-${uid})"/>
  </g>`;

  // 5. التأشيرات
  if (mode !== 'none') {
    const labels: CalloutItem[] = [
      { num: 1, ar: 'حزمة ضوء أبيض مركزة', sub: 'White Light Beam', target: [260, 240], card: [180, 140] },
      { num: 2, ar: 'موشور زجاجي شفاف 3D', sub: 'Glass Triangular Prism', target: [prX, prY + 50], card: [430, 80] },
      { num: 3, ar: 'انكسار وتبدد داخلي للضوء', sub: 'Refraction & Dispersion', target: [exitX, exitY], card: [530, 430] },
      { num: 4, ar: 'طيف الضوء المرئي السبعة', sub: 'Visible Light Spectrum', target: [scX + 20, 280], card: [750, 100] },
      { num: 5, ar: 'اللون الأحمر (الأقل انحرافاً)', sub: 'Red (Least Deflected)', target: [scX, 220], card: [880, 220] },
      { num: 6, ar: 'اللون البنفسجي (الأكثر انحرافاً)', sub: 'Violet (Most Deflected)', target: [scX, 352], card: [880, 360] },
    ];

    content += renderOpticsCallouts(labels, mode, uid, cPointerDot, cCalloutBg, cCalloutStroke, cTextMain, cTextSub, opts?.fontFamily);
  }

  return content;
}

// ------------------------------------------------------------
// 8. الانتشار المستقيمي والظل والظليل (Shadow & Penumbra)
// ------------------------------------------------------------

function renderShadowPenumbra(spec: RaysSpec, opts?: RenderOptions): string {
  const mode = spec.labelsMode ?? 'full';
  const theme = spec.theme ?? 'natural';
  const uid = Math.random().toString(36).substring(2, 8);

  const isExam = theme === 'exam_print';
  const cTextMain = isExam ? '#000000' : '#0f172a';
  const cTextSub = isExam ? '#334155' : '#64748b';
  const cPointerDot = isExam ? '#000000' : '#f59e0b';
  const cCalloutBg = '#ffffff';
  const cCalloutStroke = isExam ? '#334155' : '#cbd5e1';

  let content = '';

  // طاولة التجارب
  content += `<line x1="60" y1="460" x2="900" y2="460" stroke="${isExam ? '#94a3b8' : '#cbd5e1'}" stroke-width="3" stroke-linecap="round"/>`;

  // 1. المنبع الضوئي الواسع 3D (مصباح كروي مشتعل)
  const lX = 170;
  const lY = 270;
  const lR = 36;

  content += `<g class="light-source-3d" filter="url(#opt-shadow-${uid})">
    <!-- هالة توهج المنبع الضوئي الواسع -->
    <circle cx="${lX}" cy="${lY}" r="${lR + 25}" fill="#fef08a" opacity="${isExam ? '0.2' : '0.4'}" filter="url(#opt-glow-${uid})"/>
    <circle cx="${lX}" cy="${lY}" r="${lR}" fill="${isExam ? '#ffffff' : '#fde047'}" stroke="${isExam ? '#000000' : '#f59e0b'}" stroke-width="2.5"/>
    <circle cx="${lX - 8}" cy="${lY - 10}" r="12" fill="#ffffff" opacity="0.6"/>

    <!-- حامل المصباح على الطاولة -->
    <polygon points="${lX - 25},460 ${lX + 25},460 ${lX + 12},${lY + lR} ${lX - 12},${lY + lR}" fill="${isExam ? '#64748b' : '#334155'}"/>
    <!-- نقطتا المنبع الضوئي القصوى S1 و S2 -->
    <circle cx="${lX}" cy="${lY - lR}" r="4" fill="#ef4444"/>
    <text x="${lX - 18}" y="${lY - lR + 4}" font-size="12" font-weight="bold" fill="#ef4444">S1</text>
    <circle cx="${lX}" cy="${lY + lR}" r="4" fill="#ef4444"/>
    <text x="${lX - 18}" y="${lY + lR + 4}" font-size="12" font-weight="bold" fill="#ef4444">S2</text>
  </g>`;

  // 2. الجسم العاتم (كرة معتمة 3D معلقة)
  const sX = 460;
  const sY = 270;
  const sR = 50;

  content += `<g class="opaque-sphere-3d" filter="url(#opt-shadow-${uid})">
    <!-- خيط التعليق -->
    <line x1="${sX}" y1="80" x2="${sX}" y2="${sY - sR}" stroke="${isExam ? '#475569' : '#64748b'}" stroke-width="1.8" stroke-dasharray="4,2"/>
    <!-- جسم الكرة بتظليل كروي يُظهر الظل الخاص -->
    <circle cx="${sX}" cy="${sY}" r="${sR}" fill="${isExam ? '#475569' : 'url(#sphere-shade-' + uid + ')'}" stroke="${isExam ? '#000000' : '#1e293b'}" stroke-width="2"/>
    <!-- نقطتا التماس العلوية والسفلية T1 و T2 -->
    <circle cx="${sX}" cy="${sY - sR}" r="3.5" fill="#f59e0b"/>
    <circle cx="${sX}" cy="${sY + sR}" r="3.5" fill="#f59e0b"/>
  </g>`;

  // 3. شاشة الاستقبال البيضاء 3D
  const scX = 820;
  const scH = 340;

  // إحداثيات الظل التام (Umbra) والظليل (Penumbra) على الشاشة
  // شعاع مماس خارجي (S1 -> T1) وشعاع مماس داخلي (S1 -> T2 متقاطع)
  const yUmbraTop = 230;
  const yUmbraBottom = 310;
  const yPenumTop = 150;
  const yPenumBottom = 390;

  content += `<g class="shadow-screen" filter="url(#opt-shadow-${uid})">
    <!-- لوح الشاشة البيضاء الشاقولي -->
    <polygon points="${scX},100 ${scX + 35},80 ${scX + 35},420 ${scX},440" fill="#ffffff" stroke="${isExam ? '#000000' : '#94a3b8'}" stroke-width="2"/>
    <!-- حامل الشاشة -->
    <polygon points="${scX - 15},460 ${scX + 50},460 ${scX + 25},440 ${scX},440" fill="${isExam ? '#64748b' : '#334155'}"/>

    <!-- منطقة الظليل البيضاوية (Penumbra) على الشاشة -->
    <ellipse cx="${scX + 16}" cy="${sY}" rx="14" ry="${(yPenumBottom - yPenumTop) / 2}" fill="${isExam ? '#cbd5e1' : '#94a3b8'}" opacity="0.6"/>

    <!-- قرص الظل التام الداكن (Umbra) في المركز على الشاشة -->
    <ellipse cx="${scX + 16}" cy="${sY}" rx="14" ry="${(yUmbraBottom - yUmbraTop) / 2}" fill="${isExam ? '#000000' : '#0f172a'}"/>
  </g>`;

  // 4. الأشعة الضوئية المماسية ومخاريط الظل في الفضاء
  content += `<g class="light-cones">
    <!-- مخروط الظل التام في الفضاء (بين الكرة والشاشة) -->
    <polygon points="${sX},${sY - sR} ${scX},${yUmbraTop} ${scX},${yUmbraBottom} ${sX},${sY + sR}" fill="${isExam ? '#94a3b8' : '#0f172a'}" opacity="${isExam ? '0.2' : '0.35'}"/>

    <!-- منطقة الظليل في الفضاء -->
    <polygon points="${sX},${sY - sR} ${scX},${yPenumTop} ${scX},${yUmbraTop}" fill="${isExam ? '#cbd5e1' : '#64748b'}" opacity="0.2"/>
    <polygon points="${sX},${sY + sR} ${scX},${yUmbraBottom} ${scX},${yPenumBottom}" fill="${isExam ? '#cbd5e1' : '#64748b'}" opacity="0.2"/>

    <!-- الأشعة المماسية الخارجية (S1 -> T1 -> Penum) -->
    <line x1="${lX}" y1="${lY - lR}" x2="${scX}" y2="${yPenumTop}" stroke="#f59e0b" stroke-width="1.8"/>
    <line x1="${lX}" y1="${lY + lR}" x2="${scX}" y2="${yPenumBottom}" stroke="#f59e0b" stroke-width="1.8"/>

    <!-- الأشعة المماسية المتقاطعة الداخلية (S1 -> T2 -> Umbra) -->
    <line x1="${lX}" y1="${lY - lR}" x2="${scX}" y2="${yUmbraBottom}" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="4,2"/>
    <line x1="${lX}" y1="${lY + lR}" x2="${scX}" y2="${yUmbraTop}" stroke="#f59e0b" stroke-width="1.8" stroke-dasharray="4,2"/>
  </g>`;

  // 5. التأشيرات
  if (mode !== 'none') {
    const labels: CalloutItem[] = [
      { num: 1, ar: 'منبع ضوئي واسع', sub: 'Extended Light Source', target: [lX, lY - lR], card: [150, 110] },
      { num: 2, ar: 'جسم عاتم (كرة معتمة)', sub: 'Opaque Spherical Body', target: [sX - 25, sY - 20], card: [460, 120] },
      { num: 3, ar: 'منطقة الظل الخاص', sub: 'Own Shadow / Ombre propre', target: [sX + 25, sY], card: [430, 390] },
      { num: 4, ar: 'مخروط الظل التام في الفضاء', sub: 'Cone of Umbra in Space', target: [(sX + scX) / 2, sY], card: [620, 210] },
      { num: 5, ar: 'قرص الظل التام على الشاشة', sub: 'Umbra / Ombre portée', target: [scX, sY], card: [860, 270] },
      { num: 6, ar: 'منطقة الظليل على الشاشة', sub: 'Penumbra / Pénombre', target: [scX, yPenumTop + 20], card: [860, 140] },
    ];

    content += renderOpticsCallouts(labels, mode, uid, cPointerDot, cCalloutBg, cCalloutStroke, cTextMain, cTextSub, opts?.fontFamily);
  }

  return content;
}

// ------------------------------------------------------------
// 9. المنضدة البصرية المخبرية 3D (Optical Bench)
// ------------------------------------------------------------

function renderOpticalBench(spec: RaysSpec, opts?: RenderOptions): string {
  const mode = spec.labelsMode ?? 'full';
  const theme = spec.theme ?? 'natural';
  const uid = Math.random().toString(36).substring(2, 8);

  const isExam = theme === 'exam_print';
  const cTextMain = isExam ? '#000000' : '#0f172a';
  const cTextSub = isExam ? '#334155' : '#64748b';
  const cPointerDot = isExam ? '#000000' : '#10b981';
  const cCalloutBg = '#ffffff';
  const cCalloutStroke = isExam ? '#334155' : '#cbd5e1';

  let content = '';

  // طاولة المخبر
  content += `<line x1="60" y1="460" x2="900" y2="460" stroke="${isExam ? '#94a3b8' : '#cbd5e1'}" stroke-width="3" stroke-linecap="round"/>`;

  // 1. سكة المنضدة البصرية المدرجة 3D (Optical Rail)
  const rX1 = 100;
  const rX2 = 860;
  const rY = 400;

  content += `<g class="optical-rail-3d" filter="url(#opt-shadow-${uid})">
    <!-- قضيب السكة المعدني المنشوري 3D -->
    <polygon points="${rX1},${rY} ${rX2},${rY} ${rX2 - 20},${rY - 25} ${rX1 + 20},${rY - 25}" fill="${isExam ? '#cbd5e1' : '#475569'}" stroke="${isExam ? '#000000' : '#334155'}" stroke-width="1.8"/>
    <polygon points="${rX1},${rY} ${rX2},${rY} ${rX2},${rY + 18} ${rX1},${rY + 18}" fill="${isExam ? '#94a3b8' : '#1e293b'}"/>

    <!-- تدريجات السنتيمتر على طول السكة -->
    ${Array.from({ length: 25 }).map((_, i) => {
      const rx = rX1 + 30 + i * 29;
      return `<line x1="${rx}" y1="${rY}" x2="${rx - 6}" y2="${rY - 10}" stroke="#cbd5e1" stroke-width="1.4"/>`;
    }).join('')}
    <text x="${rX1 + 45}" y="${rY + 14}" font-size="10" font-weight="bold" fill="#ffffff">0 cm</text>
    <text x="${rX2 - 55}" y="${rY + 14}" font-size="10" font-weight="bold" fill="#ffffff">100 cm</text>
  </g>`;

  // 2. الشيء المضيء: شمعة مخبرية مشتعلة 3D (Luminous Candle Object)
  const cX = 220;
  const cY = 320;

  content += `<g class="candle-object" filter="url(#opt-shadow-${uid})">
    <!-- الحامل المنزلق على السكة -->
    <rect x="${cX - 25}" y="${rY - 35}" width="50" height="40" rx="4" fill="${isExam ? '#64748b' : '#334155'}" stroke="${isExam ? '#000000' : '#1e293b'}" stroke-width="1.5"/>
    <circle cx="${cX}" cy="${rY - 15}" r="6" fill="#f59e0b"/>

    <!-- ساق الحامل وجسم الشمعة البيضاء 3D -->
    <rect x="${cX - 5}" y="${cY + 10}" width="10" height="60" fill="#94a3b8"/>
    <rect x="${cX - 12}" y="${cY - 60}" width="24" height="70" rx="5" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
    <ellipse cx="${cX}" cy="${cY - 60}" rx="12" ry="5" fill="#e2e8f0"/>

    <!-- فتيل الشمعة واللهب المشتعل المتوهج -->
    <line x1="${cX}" y1="${cY - 60}" x2="${cX}" y2="${cY - 70}" stroke="#0f172a" stroke-width="2"/>
    <!-- توهج اللهب -->
    <ellipse cx="${cX}" cy="${cY - 85}" rx="18" ry="26" fill="#fef08a" opacity="0.5" filter="url(#opt-glow-${uid})"/>
    <path d="M ${cX},${cY - 105} Q ${cX + 12},${cY - 80} ${cX},${cY - 68} Q ${cX - 12},${cY - 80} ${cX},${cY - 105} Z" fill="#f97316"/>
    <path d="M ${cX},${cY - 98} Q ${cX + 7},${cY - 82} ${cX},${cY - 70} Q ${cX - 7},${cY - 82} ${cX},${cY - 98} Z" fill="#fde047"/>
  </g>`;

  // 3. حامل العدسة المجمعة 3D (Lens Mount)
  const lX = 480;
  const lY = 240;

  content += `<g class="lens-stand" filter="url(#opt-shadow-${uid})">
    <!-- الحامل المنزلق -->
    <rect x="${lX - 25}" y="${rY - 35}" width="50" height="40" rx="4" fill="${isExam ? '#64748b' : '#334155'}" stroke="${isExam ? '#000000' : '#1e293b'}" stroke-width="1.5"/>
    <circle cx="${lX}" cy="${rY - 15}" r="6" fill="#f59e0b"/>

    <!-- عمود الحامل المعدني -->
    <rect x="${lX - 6}" y="${lY + 70}" width="12" height="95" fill="#94a3b8"/>

    <!-- إطار العدسة الحلقي المعدني والعدسة الزجاجية 3D -->
    <circle cx="${lX}" cy="${lY}" r="68" fill="${isExam ? '#cbd5e1' : 'url(#lens-glass-' + uid + ')'}" stroke="${isExam ? '#000000' : '#1e293b'}" stroke-width="6"/>
    <circle cx="${lX}" cy="${lY}" r="64" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.75"/>
    <ellipse cx="${lX - 20}" cy="${lY - 20}" rx="30" ry="16" fill="#ffffff" opacity="0.35"/>
  </g>`;

  // 4. شاشة الاستقبال وصورة اللهب المقلوبة 3D (Screen with Inverted Flame Image)
  const scX = 740;
  const scY = 240;

  content += `<g class="screen-stand" filter="url(#opt-shadow-${uid})">
    <!-- الحامل المنزلق -->
    <rect x="${scX - 25}" y="${rY - 35}" width="50" height="40" rx="4" fill="${isExam ? '#64748b' : '#334155'}" stroke="${isExam ? '#000000' : '#1e293b'}" stroke-width="1.5"/>
    <circle cx="${scX}" cy="${rY - 15}" r="6" fill="#f59e0b"/>
    <rect x="${scX - 6}" y="${scY + 70}" width="12" height="95" fill="#94a3b8"/>

    <!-- لوح الشاشة الأبيض -->
    <rect x="${scX - 55}" y="${scY - 85}" width="110" height="160" rx="6" fill="#ffffff" stroke="${isExam ? '#000000' : '#94a3b8'}" stroke-width="2.5"/>

    <!-- صورة لهب الشمعة الحقيقية المقلوبة على الشاشة -->
    <path d="M ${scX},${scY + 45} Q ${scX + 10},${scY + 20} ${scX},${scY + 8} Q ${scX - 10},${scY + 20} ${scX},${scY + 45} Z" fill="#f97316"/>
    <path d="M ${scX},${scY + 38} Q ${scX + 6},${scY + 22} ${scX},${scY + 10} Q ${scX - 6},${scY + 22} ${scX},${scY + 38} Z" fill="#fde047"/>
    <line x1="${scX}" y1="${scY + 5}" x2="${scX}" y2="${scY}" stroke="#0f172a" stroke-width="2"/>
    <text x="${scX}" y="${scY + 65}" font-size="11" font-weight="bold" fill="#ef4444" text-anchor="middle">صورة مقلوبة</text>
  </g>`;

  // 5. حزم الأشعة المتقاطعة من لهب الشمعة عبر العدسة نحو الشاشة
  content += `<g class="bench-rays">
    <!-- شعاع مواز للمحور ينكسر ماراً ببؤرة العدسة نحو قمة الصورة المقلوبة -->
    <line x1="${cX}" y1="${cY - 85}" x2="${lX}" y2="${cY - 85}" stroke="#f59e0b" stroke-width="2.2"/>
    <line x1="${lX}" y1="${cY - 85}" x2="${scX}" y2="${scY + 25}" stroke="#f59e0b" stroke-width="2.2"/>
    ${arrowHead((cX + lX) / 2, cY - 85, 1, 0, '#f59e0b')}
    ${arrowHead((lX + scX) / 2, (cY - 85 + scY + 25) / 2, scX - lX, scY + 25 - (cY - 85), '#f59e0b')}

    <!-- شعاع مار بالمركز البصري دون انحراف -->
    <line x1="${cX}" y1="${cY - 85}" x2="${scX}" y2="${scY + 25}" stroke="#8b5cf6" stroke-width="2.2"/>
    ${arrowHead((cX + lX) / 2, (cY - 85 + lY) / 2, lX - cX, lY - (cY - 85), '#8b5cf6')}
  </g>`;

  // 6. التأشيرات
  if (mode !== 'none') {
    const labels: CalloutItem[] = [
      { num: 1, ar: 'شيء مضيء (شمعة مشتعلة)', sub: 'Luminous Candle Object', target: [cX, cY - 85], card: [190, 110] },
      { num: 2, ar: 'عدسة مجمّعة على حامل 3D', sub: 'Converging Lens on Stand', target: [lX, lY], card: [480, 80] },
      { num: 3, ar: 'شاشة استقبال بيضاء', sub: 'Observation Screen', target: [scX, scY - 50], card: [770, 80] },
      { num: 4, ar: 'صورة حقيقية مقلوبة للشمعة', sub: 'Real Inverted Flame Image', target: [scX, scY + 25], card: [880, 240] },
      { num: 5, ar: 'سكة المنضدة البصرية المدرجة', sub: 'Graduated Optical Bench Rail', target: [350, rY], card: [330, 480] },
      { num: 6, ar: 'الركائز المنزلقة على السكة', sub: 'Sliding Rail Mounts', target: [cX, rY - 15], card: [150, 480] },
    ];

    content += renderOpticsCallouts(labels, mode, uid, cPointerDot, cCalloutBg, cCalloutStroke, cTextMain, cTextSub, opts?.fontFamily);
  }

  return content;
}

// ------------------------------------------------------------
// المُصيّر الرئيسي لمولّد الظواهر الضوئية (Main Optics Renderer)
// ------------------------------------------------------------

export function renderRays(spec: RaysSpec, opts?: RenderOptions): string {
  try {
    const col = resolveColor(opts);
    const mode = spec.labelsMode ?? 'full';
    const theme = spec.theme ?? 'natural';
    const uid = Math.random().toString(36).substring(2, 8);

    const isExam = theme === 'exam_print';

    let defs = `<defs>
      <filter id="opt-shadow-${uid}" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.18"/>
      </filter>
      <filter id="opt-glow-${uid}" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <linearGradient id="lens-glass-${uid}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.75"/>
        <stop offset="40%" stop-color="#38bdf8" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#0284c7" stop-opacity="0.55"/>
      </linearGradient>
      ${spec.kind === 'prism_dispersion' ? `<linearGradient id="rainbow-grad-${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ef4444"/>
        <stop offset="16%" stop-color="#f97316"/>
        <stop offset="33%" stop-color="#eab308"/>
        <stop offset="50%" stop-color="#22c55e"/>
        <stop offset="66%" stop-color="#06b6d4"/>
        <stop offset="83%" stop-color="#3b82f6"/>
        <stop offset="100%" stop-color="#7c3aed"/>
      </linearGradient>` : ''}
      <radialGradient id="sphere-shade-${uid}" cx="35%" cy="35%" r="65%">
        <stop offset="0%" stop-color="#cbd5e1"/>
        <stop offset="50%" stop-color="#475569"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </radialGradient>
    </defs>`;

    let content = '';

    // توجيه التجارب الضوئية الجديدة المضافة
    if (spec.kind === 'reflection_refraction') {
      content = renderReflectionRefraction(spec, opts);
      if (spec.caption) {
        content += `<text x="${W / 2}" y="${H - 15}" font-size="14" font-weight="bold" fill="${isExam ? '#000000' : '#0f172a'}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
      }
      return wrapSvg(defs + content, W, H, spec.caption ?? 'تجربة انعكاس وانكسار الضوء على قرص هارتل', opts);
    }

    if (spec.kind === 'prism_dispersion') {
      content = renderPrismDispersion(spec, opts);
      if (spec.caption) {
        content += `<text x="${W / 2}" y="${H - 15}" font-size="14" font-weight="bold" fill="${isExam ? '#000000' : '#0f172a'}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
      }
      return wrapSvg(defs + content, W, H, spec.caption ?? 'تجربة تبدد وتحليل الضوء الأبيض بالموشور الزجاجي', opts);
    }

    if (spec.kind === 'shadow_penumbra') {
      content = renderShadowPenumbra(spec, opts);
      if (spec.caption) {
        content += `<text x="${W / 2}" y="${H - 15}" font-size="14" font-weight="bold" fill="${isExam ? '#000000' : '#0f172a'}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
      }
      return wrapSvg(defs + content, W, H, spec.caption ?? 'الانتشار المستقيمي للضوء ومناطق الظل التام والظليل', opts);
    }

    if (spec.kind === 'optical_bench') {
      content = renderOpticalBench(spec, opts);
      if (spec.caption) {
        content += `<text x="${W / 2}" y="${H - 15}" font-size="14" font-weight="bold" fill="${isExam ? '#000000' : '#0f172a'}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
      }
      return wrapSvg(defs + content, W, H, spec.caption ?? 'المنضدة البصرية وتشكل الصور الحقيقية بالعدسة المجمعة', opts);
    }

    // ── تصيير النماذج الهندسية الخمسة للأشعة (عدسات ومرايا 3D) ──
    // مقياس ملائم لملء شاشة 960x540
    const rawDist = spec.objectDistance ?? DEFAULT_OBJECT_DISTANCE;
    const rawH = spec.objectHeight ?? DEFAULT_OBJECT_HEIGHT;
    const rawF = spec.focalLength ?? DEFAULT_FOCAL_LENGTH;

    // مضاعفة النسب لتناسب 960x540 إذا كانت القيم في النطاق القديم
    const scale = rawDist <= 200 ? 1.8 : 1.0;
    const objDist = rawDist * scale;
    const objHeight = rawH * scale;
    const focal = rawF * scale;

    const showRays = spec.showConstructionRays ?? true;
    const showImage = spec.showImage ?? true;
    const showLabels = spec.showLabels ?? true;

    // المحور البصري الأفقي مع stroke-dasharray="6 4"
    content += `<line x1="0" y1="${CY}" x2="${W}" y2="${CY}" ${strokeThinAttr(col)} stroke-dasharray="6 4"/>`;

    // العنصر البصري 3D
    content += drawElement3D(spec.kind, col, uid, isExam);

    // البؤر F و F' أو C
    if (showLabels) {
      content += drawFoci3D(spec.kind, focal, col, opts);
    }

    // الشيء (سهم أخضر زمردي منتصب على اليسار)
    const objX = CX - objDist;
    const objTopY = CY - objHeight;
    content += verticalArrow(objX, CY, objTopY, OBJECT_COLOR);
    if (showLabels) {
      content += text(objX, CY + 22, 'B', { size: 14, bold: true, color: OBJECT_COLOR, fontFamily: opts?.fontFamily });
    }

    // حساب موضع الصورة
    const info = computeImage(spec.kind, objDist, objHeight, focal);

    // أشعة الإنشاء (الواردة والمنكسرة/المنعكسة)
    if (showRays) {
      content += drawRays3D(spec.kind, objX, objTopY, info);
    }

    // الصورة المحسوبة (سهم أحمر — متقطّع إن كانت افتراضية)
    if (showImage) {
      const imgVisible = info.imgX > 20 && info.imgX < W - 20;
      if (imgVisible) {
        const stroke = info.virtual ? ' stroke-dasharray="4 3"' : '';
        content += `<line x1="${info.imgX.toFixed(1)}" y1="${CY}" x2="${info.imgX.toFixed(1)}" y2="${info.imgTopY.toFixed(1)}" stroke="${IMAGE_COLOR}" stroke-width="3.2" stroke-linecap="round"${stroke}/>`;
        const dir = info.imgTopY < CY ? -1 : 1;
        content += arrowHead(info.imgX, info.imgTopY, 0, dir, IMAGE_COLOR);
        if (showLabels) {
          content += text(info.imgX, CY + 22, "B'", { size: 14, bold: true, color: IMAGE_COLOR, fontFamily: opts?.fontFamily });
        }
      }
    }

    // بطاقات التأشيرات للسبورة والامتحانات
    if (mode !== 'none') {
      const isLens = spec.kind === 'converging_lens' || spec.kind === 'diverging_lens';
      const labels: CalloutItem[] = [
        { num: 1, ar: 'شيء ضوئي منتصب AB', sub: 'Luminous Object (AB)', target: [objX, objTopY], card: [objX < 250 ? 160 : objX, 80] },
        { num: 2, ar: isLens ? (spec.kind === 'converging_lens' ? 'عدسة مجمّعة محدبة 3D' : 'عدسة مفرّقة مقعرة 3D') : 'مرآة عاكسة 3D', sub: isLens ? 'Optical Lens' : 'Optical Mirror', target: [CX, CY - 100], card: [480, 70] },
        { num: 3, ar: 'المحور البصري الرئيسي', sub: 'Principal Optical Axis', target: [CX - focal / 2, CY], card: [360, CY + 80] },
      ];

      if (isLens) {
        labels.push({ num: 4, ar: 'البؤرة الرئيسية للصورة F\'', sub: 'Image Focal Point (F\')', target: [CX + focal, CY], card: [CX + focal, CY + 70] });
      }

      if (showImage) {
        labels.push({ num: 5, ar: info.virtual ? 'صورة افتراضية منتصبة A\'B\'' : 'صورة حقيقية مقلوبة A\'B\'', sub: info.virtual ? 'Virtual Upright Image' : 'Real Inverted Image', target: [info.imgX, info.imgTopY], card: [info.imgX > W - 150 ? W - 120 : info.imgX, info.imgTopY < CY ? 80 : 440] });
      }

      content += renderOpticsCallouts(labels, mode, uid, '#0284c7', '#ffffff', isExam ? '#334155' : '#cbd5e1', isExam ? '#000000' : '#0f172a', isExam ? '#334155' : '#64748b', opts?.fontFamily);
    }

    if (spec.caption) {
      content += `<text x="${W / 2}" y="${H - 15}" font-size="14" font-weight="bold" fill="${isExam ? '#000000' : '#0f172a'}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
    }

    const ariaLabel = spec.caption ?? `مخطط أشعّة وبصريات: ${spec.kind}`;
    return wrapSvg(defs + content, W, H, ariaLabel, opts);
  } catch {
    // مبدأ "لا يرمي أبداً"
    return '';
  }
}
