// ============================================================
// Biology Generator — مولّد رسومات علوم الطبيعة والحياة
// ============================================================
// يقدّم رسومات بيولوجية عالية الجمالية بتجسيم متجهي ثلاثي الأبعاد (Vector 3D)
// مع دعم ثلاثة أنماط للتأشيرات:
// 1. 'full': بطاقات شرح كاملة باللغتين العربية واللاتينية (للسبورة والشاشات).
// 2. 'numbered': تأشير مرقم (1..6) مخصص لسندات الامتحانات وتمارين BEM / BAC.
// 3. 'none': رسم صامت بدون تأشيرات للرسم التفاعلي والمسابقات.
//
// المبدأ الحاكم: "لا يرمي أبداً" — أي مدخلات فاسدة تعيد '' دون استثناء.
// ============================================================

import { z } from 'zod';
import type { RenderOptions } from './shared.js';
import { esc, wrapSvg } from './shared.js';

// ------------------------------------------------------------
// مخطّطات Zod
// ------------------------------------------------------------

export const biologyKindSchema = z.enum([
  'neuron',             // الخلية العصبية (العصبون)
  'respiratory_system', // الجهاز التنفسي والتبادلات الغازية
  'eye',                // مقطع كرة العين وحاسة الرؤية
]);
export type BiologyKind = z.infer<typeof biologyKindSchema>;

/** نمط إظهار البيانات والتأشيرات. */
export const labelsModeSchema = z.enum([
  'full',     // بطاقات شرح كاملة (عربي + مصطلح أجنبي)
  'numbered', // دوائر مرقمة 1..7 لتمارين الامتحانات
  'none',     // بدون تأشيرات (رسم صامت)
]);
export type LabelsMode = z.infer<typeof labelsModeSchema>;

/** سمة التلوين والإظهار. */
export const biologyThemeSchema = z.enum([
  'natural',    // ألوان طبيعية مجسمة حيوية (افتراضي للسبورة والشاشات)
  'vibrant',    // ألوان مشبعة وعالية التباين
  'exam_print', // تدرجات رمادية وأحادية مخصصة للطباعة الورقية
]);
export type BiologyTheme = z.infer<typeof biologyThemeSchema>;

/** مجال التركيز لتسليط الضوء على عضية محددة في الخلية العصبية. */
export const neuronFocusSchema = z.enum([
  'all',       // عرض شامل لكافة العضيات
  'soma',      // التركيز على الجسم الخلوي
  'nucleus',   // التركيز على النواة
  'myelin',    // التركيز على غمد النخاعين
  'axon',      // التركيز على المحور الأسطواني
  'terminals', // التركيز على التفرعات الانتهائية
]);
export type NeuronFocus = z.infer<typeof neuronFocusSchema>;

/** مجال التركيز في الجهاز التنفسي. */
export const respiratoryFocusSchema = z.enum([
  'all',          // عرض شامل للجهاز التنفسي
  'trachea',      // التركيز على القصبة الهوائية
  'lungs',        // التركيز على الرئتين
  'bronchi',      // التركيز على الشعبتين
  'bronchioles',  // التركيز على القصيبات
  'alveoli',      // التركيز على الحويصلات والمبادلات الغازية
  'diaphragm',    // التركيز على الحجاب الحاجز
]);
export type RespiratoryFocus = z.infer<typeof respiratoryFocusSchema>;

/** مجال التركيز في مقطع كرة العين. */
export const eyeFocusSchema = z.enum([
  'all',          // عرض شامل لكافة أجزاء العين
  'sclera',       // الصلبة
  'retina',       // المشيمية والشبكية
  'lens',         // العدسة البلورية
  'cornea',       // القرنية الشفافة
  'optic_nerve',  // العصب البصري
  'vitreous',     // الخلط الزجاجي
  'iris',         // القزحية والحدقة
]);
export type EyeFocus = z.infer<typeof eyeFocusSchema>;

/** مواصفات رسم الخلية العصبية. */
export const neuronSpecSchema = z
  .object({
    kind: z.literal('neuron'),
    /** نمط التأشيرات (افتراضي 'full'). */
    labelsMode: labelsModeSchema.optional(),
    /** سمة الألوان (افتراضي 'natural'). */
    theme: biologyThemeSchema.optional(),
    /** عضية التركيز (افتراضي 'all'). */
    focus: neuronFocusSchema.optional(),
    /** إظهار سهم اتجاه السيالة العصبية (افتراضي true). */
    showActionPotential: z.boolean().optional(),
    /** عدد قطع غمد النخاعين الأسطوانية على المحور (2 إلى 6، افتراضي 4). */
    myelinCount: z.number().int().min(2).max(6).optional(),
    /** عنوان مخصص للرسم يظهر أسفله. */
    caption: z.string().optional(),
  })
  .strict();
export type NeuronSpec = z.infer<typeof neuronSpecSchema>;

/** مواصفات رسم الجهاز التنفسي والتبادلات الغازية. */
export const respiratorySpecSchema = z
  .object({
    kind: z.literal('respiratory_system'),
    /** نمط التأشيرات (افتراضي 'full'). */
    labelsMode: labelsModeSchema.optional(),
    /** سمة الألوان (افتراضي 'natural'). */
    theme: biologyThemeSchema.optional(),
    /** جزء التركيز (افتراضي 'all'). */
    focus: respiratoryFocusSchema.optional(),
    /** إظهار نافذة تكبير الحويصلات والمبادلات (افتراضي true). */
    showAlveoliZoom: z.boolean().optional(),
    /** إظهار أسهم مسار الهواء شهيق/زفير (افتراضي true). */
    showAirflow: z.boolean().optional(),
    /** إظهار أسهم انتقال الغازات O2/CO2 (افتراضي true). */
    showGasExchange: z.boolean().optional(),
    /** عنوان مخصص للرسم يظهر أسفله. */
    caption: z.string().optional(),
  })
  .strict();
export type RespiratorySpec = z.infer<typeof respiratorySpecSchema>;

/** مواصفات رسم مقطع كرة العين وحاسة الرؤية. */
export const eyeSpecSchema = z
  .object({
    kind: z.literal('eye'),
    /** نمط التأشيرات (افتراضي 'full'). */
    labelsMode: labelsModeSchema.optional(),
    /** سمة الألوان (افتراضي 'natural'). */
    theme: biologyThemeSchema.optional(),
    /** جزء التركيز (افتراضي 'all'). */
    focus: eyeFocusSchema.optional(),
    /** إظهار المحور البصري ومسار الضوء (افتراضي true). */
    showOpticalAxis: z.boolean().optional(),
    /** عنوان مخصص للرسم يظهر أسفله. */
    caption: z.string().optional(),
  })
  .strict();
export type EyeSpec = z.infer<typeof eyeSpecSchema>;

/** المواصفات العامة لمولّد البيولوجيا. */
export const biologySpecSchema = z.discriminatedUnion('kind', [
  neuronSpecSchema,
  respiratorySpecSchema,
  eyeSpecSchema,
]);
export type BiologySpec = z.infer<typeof biologySpecSchema>;

// ------------------------------------------------------------
// ثوابت الرسم والأبعاد
// ------------------------------------------------------------

const W = 960;
const H = 500;

interface PaletteConfig {
  somaBase: string;
  somaGlow: string;
  somaShadow: string;
  nucleusBase: string;
  nucleusCore: string;
  nucleusHighlight: string;
  dendriteDark: string;
  dendriteLight: string;
  axonCore: string;
  myelinTop: string;
  myelinMid: string;
  myelinBot: string;
  myelinStroke: string;
  schwannDot: string;
  terminalsBase: string;
  bulbGlow: string;
  impulseArrow: string;
  calloutBg: string;
  calloutStroke: string;
  calloutTextMain: string;
  calloutTextSub: string;
  pointerLine: string;
  pointerDot: string;
}

const PALETTES: Record<BiologyTheme, PaletteConfig> = {
  natural: {
    somaBase: '#9333ea',
    somaGlow: '#d8b4fe',
    somaShadow: '#581c87',
    nucleusBase: '#2563eb',
    nucleusCore: '#1e1b4b',
    nucleusHighlight: '#93c5fd',
    dendriteDark: '#7e22ce',
    dendriteLight: '#c084fc',
    axonCore: '#ea580c',
    myelinTop: '#8b5cf6',
    myelinMid: '#6d28d9',
    myelinBot: '#4c1d95',
    myelinStroke: '#5b21b6',
    schwannDot: '#fde047',
    terminalsBase: '#8b5cf6',
    bulbGlow: '#c084fc',
    impulseArrow: '#dc2626',
    calloutBg: '#ffffff',
    calloutStroke: '#cbd5e1',
    calloutTextMain: '#0f172a',
    calloutTextSub: '#64748b',
    pointerLine: '#64748b',
    pointerDot: '#7c3aed',
  },
  vibrant: {
    somaBase: '#a855f7',
    somaGlow: '#f3e8ff',
    somaShadow: '#6b21a8',
    nucleusBase: '#0284c7',
    nucleusCore: '#082f49',
    nucleusHighlight: '#bae6fd',
    dendriteDark: '#9333ea',
    dendriteLight: '#e9d5ff',
    axonCore: '#f97316',
    myelinTop: '#a855f7',
    myelinMid: '#7e22ce',
    myelinBot: '#3b0764',
    myelinStroke: '#6b21a8',
    schwannDot: '#facc15',
    terminalsBase: '#a855f7',
    bulbGlow: '#f472b6',
    impulseArrow: '#ef4444',
    calloutBg: '#ffffff',
    calloutStroke: '#94a3b8',
    calloutTextMain: '#020617',
    calloutTextSub: '#475569',
    pointerLine: '#475569',
    pointerDot: '#c026d3',
  },
  exam_print: {
    somaBase: '#64748b',
    somaGlow: '#e2e8f0',
    somaShadow: '#334155',
    nucleusBase: '#475569',
    nucleusCore: '#0f172a',
    nucleusHighlight: '#cbd5e1',
    dendriteDark: '#475569',
    dendriteLight: '#94a3b8',
    axonCore: '#334155',
    myelinTop: '#94a3b8',
    myelinMid: '#64748b',
    myelinBot: '#1e293b',
    myelinStroke: '#0f172a',
    schwannDot: '#f8fafc',
    terminalsBase: '#64748b',
    bulbGlow: '#94a3b8',
    impulseArrow: '#0f172a',
    calloutBg: '#ffffff',
    calloutStroke: '#334155',
    calloutTextMain: '#000000',
    calloutTextSub: '#334155',
    pointerLine: '#0f172a',
    pointerDot: '#000000',
  },
};

// ------------------------------------------------------------
// تصيير الخلية العصبية (Neuron Renderer)
// ------------------------------------------------------------

export function renderNeuron(spec: NeuronSpec, opts?: RenderOptions): string {
  const theme = spec.theme ?? 'natural';
  const P = PALETTES[theme];
  const mode = spec.labelsMode ?? 'full';
  const focus = spec.focus ?? 'all';
  const showAP = spec.showActionPotential ?? true;
  const myelinSegments = spec.myelinCount ?? 4;

  // فحص الشفافية عند التركيز
  const opSoma = focus === 'all' || focus === 'soma' || focus === 'nucleus' ? '1' : '0.35';
  const opNucleus = focus === 'all' || focus === 'nucleus' || focus === 'soma' ? '1' : '0.35';
  const opMyelin = focus === 'all' || focus === 'myelin' ? '1' : '0.35';
  const opAxon = focus === 'all' || focus === 'axon' ? '1' : '0.35';
  const opTerminals = focus === 'all' || focus === 'terminals' ? '1' : '0.35';

  const uid = Math.random().toString(36).substring(2, 8);

  // مواضع المكونات
  const somaX = 220;
  const somaY = 250;
  const axonStartX = 275;
  const axonEndX = 680;
  const axonY = somaY;

  // تعريفات التدرجات والفلاتر ثلاثية الأبعاد
  const defs = `<defs>
    <filter id="bio-shadow-${uid}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.18"/>
    </filter>
    <filter id="callout-shadow-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.12"/>
    </filter>

    <!-- تدرج كروي للجسم الخلوي -->
    <radialGradient id="somaGrad-${uid}" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="${P.somaGlow}"/>
      <stop offset="45%" stop-color="${P.somaBase}"/>
      <stop offset="100%" stop-color="${P.somaShadow}"/>
    </radialGradient>

    <!-- تدرج كروي ثلاثي الأبعاد للنواة -->
    <radialGradient id="nucleusGrad-${uid}" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="${P.nucleusHighlight}"/>
      <stop offset="35%" stop-color="${P.nucleusBase}"/>
      <stop offset="90%" stop-color="${P.nucleusCore}"/>
      <stop offset="100%" stop-color="#09090b"/>
    </radialGradient>

    <!-- تدرج أسطواني لغمد النخاعين 3D -->
    <linearGradient id="myelinCylGrad-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${P.myelinTop}"/>
      <stop offset="18%" stop-color="${P.somaGlow}"/>
      <stop offset="45%" stop-color="${P.myelinMid}"/>
      <stop offset="85%" stop-color="${P.myelinBot}"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>

    <!-- تدرج غطاء أسطوانة النخاعين البيضاوي -->
    <radialGradient id="myelinCapGrad-${uid}" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${P.somaGlow}"/>
      <stop offset="50%" stop-color="${P.myelinMid}"/>
      <stop offset="100%" stop-color="${P.myelinBot}"/>
    </radialGradient>

    <!-- تدرج المحور الأسطواني -->
    <linearGradient id="axonGrad-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fdba74"/>
      <stop offset="50%" stop-color="${P.axonCore}"/>
      <stop offset="100%" stop-color="#9a3412"/>
    </linearGradient>

    <!-- تدرج زر مشبكي -->
    <radialGradient id="bulbGrad-${uid}" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="${P.bulbGlow}"/>
      <stop offset="60%" stop-color="${P.terminalsBase}"/>
      <stop offset="100%" stop-color="#3b0764"/>
    </radialGradient>

    <!-- تدرج سهم السيالة -->
    <linearGradient id="apGrad-${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#fb7185"/>
      <stop offset="100%" stop-color="${P.impulseArrow}"/>
    </linearGradient>
  </defs>`;

  let content = '';

  // ── 1. المحور الأسطواني (Axon) ──────────────────────────────────
  content += `<g opacity="${opAxon}">
    <!-- جذع المحور الأسطواني الداخلي -->
    <rect x="${axonStartX}" y="${axonY - 5}" width="${axonEndX - axonStartX}" height="10" rx="5" fill="url(#axonGrad-${uid})" filter="url(#bio-shadow-${uid})"/>
    <line x1="${axonStartX}" y1="${axonY - 2}" x2="${axonEndX}" y2="${axonY - 2}" stroke="#ffedd5" stroke-width="1.5" stroke-linecap="round" opacity="0.8"/>
  </g>`;

  // ── 2. قطع غمد النخاعين الأسطوانية (Myelin Sheath) ────────────
  content += `<g opacity="${opMyelin}">`;
  const axonSpan = axonEndX - axonStartX;
  const segGap = 16; // عرض اختناق رانفييه
  const totalGaps = (myelinSegments - 1) * segGap;
  const segWidth = (axonSpan - totalGaps - 20) / myelinSegments;
  const segHeight = 56;
  const segHalfH = segHeight / 2;

  for (let i = 0; i < myelinSegments; i++) {
    const segX = axonStartX + 10 + i * (segWidth + segGap);
    const segY = axonY - segHalfH;

    // جسم الأسطوانة
    content += `<rect x="${segX}" y="${segY}" width="${segWidth}" height="${segHeight}" rx="14" fill="url(#myelinCylGrad-${uid})" filter="url(#bio-shadow-${uid})" stroke="${P.myelinStroke}" stroke-width="1"/>`;

    // لمعان أسطواني طولي علوي
    content += `<line x1="${segX + 12}" y1="${segY + 10}" x2="${segX + segWidth - 12}" y2="${segY + 10}" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.55"/>`;

    // نواة خلية شوان (Schwann cell nucleus)
    const dotX = segX + segWidth / 2;
    const dotY = segY + 14;
    content += `<ellipse cx="${dotX}" cy="${dotY}" rx="6" ry="3" fill="${P.schwannDot}" stroke="${P.myelinStroke}" stroke-width="0.8" opacity="0.9"/>`;

    // خطوط تدريج الغمد
    content += `<path d="M ${segX + 8} ${segY + 4} Q ${segX + 14} ${axonY} ${segX + 8} ${segY + segHeight - 4}" stroke="${P.somaGlow}" stroke-width="1" fill="none" opacity="0.4"/>`;
    content += `<path d="M ${segX + segWidth - 8} ${segY + 4} Q ${segX + segWidth - 2} ${axonY} ${segX + segWidth - 8} ${segY + segHeight - 4}" stroke="${P.myelinBot}" stroke-width="1" fill="none" opacity="0.5"/>`;
  }
  content += `</g>`;

  // ── 3. التفرعات الشجيرية والجسم الخلوي (Dendrites & Soma) ──────
  content += `<g opacity="${opSoma}">`;
  const dendritePaths = [
    // شجيرة علوية 1
    `M ${somaX - 20} ${somaY - 45} Q ${somaX - 60} ${somaY - 110} ${somaX - 110} ${somaY - 135} Q ${somaX - 140} ${somaY - 150} ${somaX - 165} ${somaY - 160}`,
    `M ${somaX - 110} ${somaY - 135} Q ${somaX - 120} ${somaY - 105} ${somaX - 155} ${somaY - 95}`,
    // شجيرة علوية مائلة يسار 2
    `M ${somaX - 50} ${somaY - 20} Q ${somaX - 115} ${somaY - 50} ${somaX - 160} ${somaY - 35} Q ${somaX - 190} ${somaY - 25} ${somaX - 205} ${somaY - 15}`,
    `M ${somaX - 160} ${somaY - 35} Q ${somaX - 170} ${somaY - 70} ${somaX - 195} ${somaY - 80}`,
    // شجيرة سفلية يسار 3
    `M ${somaX - 45} ${somaY + 30} Q ${somaX - 105} ${somaY + 80} ${somaX - 150} ${somaY + 115} Q ${somaX - 180} ${somaY + 140} ${somaX - 195} ${somaY + 165}`,
    `M ${somaX - 150} ${somaY + 115} Q ${somaX - 135} ${somaY + 145} ${somaX - 145} ${somaY + 180}`,
    // شجيرة سفلية 4
    `M ${somaX - 10} ${somaY + 50} Q ${somaX - 25} ${somaY + 120} ${somaX - 55} ${somaY + 160} Q ${somaX - 75} ${somaY + 195} ${somaX - 85} ${somaY + 215}`,
    `M ${somaX - 55} ${somaY + 160} Q ${somaX - 25} ${somaY + 180} ${somaX - 15} ${somaY + 205}`,
  ];

  for (const d of dendritePaths) {
    content += `<path d="${d}" stroke="${P.dendriteDark}" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="0.95"/>`;
    content += `<path d="${d}" stroke="${P.dendriteLight}" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.75"/>`;
  }

  // مخروط بداية المحور الأسطواني (Axon Hillock)
  content += `<path d="M ${somaX + 35} ${somaY - 25} Q ${somaX + 65} ${somaY - 12} ${axonStartX + 5} ${axonY - 5} L ${axonStartX + 5} ${axonY + 5} Q ${somaX + 65} ${somaY + 12} ${somaX + 35} ${somaY + 25} Z" fill="url(#somaGrad-${uid})"/>`;

  // كتلة الجسم الخلوي المتعرج طبيعياً (Soma organic blob)
  content += `<path d="M ${somaX + 45} ${somaY}
    C ${somaX + 45} ${somaY - 35}, ${somaX + 25} ${somaY - 55}, ${somaX - 15} ${somaY - 55}
    C ${somaX - 50} ${somaY - 55}, ${somaX - 65} ${somaY - 25}, ${somaX - 60} ${somaY}
    C ${somaX - 65} ${somaY + 35}, ${somaX - 45} ${somaY + 55}, ${somaX - 10} ${somaY + 55}
    C ${somaX + 30} ${somaY + 55}, ${somaX + 45} ${somaY + 25}, ${somaX + 45} ${somaY} Z"
    fill="url(#somaGrad-${uid})" filter="url(#bio-shadow-${uid})" stroke="${P.somaShadow}" stroke-width="1.5"/>`;

  // لمعان داخلي في السيتوبلازم
  content += `<ellipse cx="${somaX - 15}" cy="${somaY - 22}" rx="22" ry="12" fill="#ffffff" opacity="0.3" transform="rotate(-15 ${somaX - 15} ${somaY - 22})"/>`;
  content += `</g>`;

  // ── 4. النواة المجسمة والنوية (Nucleus & Nucleolus) ────────────
  content += `<g opacity="${opNucleus}">
    <circle cx="${somaX - 5}" cy="${somaY}" r="26" fill="url(#nucleusGrad-${uid})" filter="url(#bio-shadow-${uid})" stroke="#1e1b4b" stroke-width="1.2"/>
    <ellipse cx="${somaX - 13}" cy="${somaY - 8}" rx="9" ry="5" fill="#ffffff" opacity="0.55" transform="rotate(-20 ${somaX - 13} ${somaY - 8})"/>
    <circle cx="${somaX}" cy="${somaY + 2}" r="7" fill="#0f172a" opacity="0.85"/>
    <circle cx="${somaX - 2}" cy="${somaY}" r="2" fill="#93c5fd" opacity="0.75"/>
    <circle cx="${somaX - 14}" cy="${somaY + 8}" r="1.5" fill="#60a5fa" opacity="0.6"/>
    <circle cx="${somaX + 8}" cy="${somaY - 12}" r="1.5" fill="#60a5fa" opacity="0.6"/>
  </g>`;

  // ── 5. التفرعات الانتهائية والأزرار المشبكية (Terminals & Bulbs) ─
  content += `<g opacity="${opTerminals}">`;
  const tBranches = [
    { start: [axonEndX, axonY], mid: [axonEndX + 35, axonY - 35], end: [axonEndX + 70, axonY - 70], bulb: [axonEndX + 70, axonY - 70] },
    { start: [axonEndX + 35, axonY - 35], mid: [axonEndX + 65, axonY - 30], end: [axonEndX + 85, axonY - 35], bulb: [axonEndX + 85, axonY - 35] },
    { start: [axonEndX, axonY], mid: [axonEndX + 45, axonY], end: [axonEndX + 90, axonY], bulb: [axonEndX + 90, axonY] },
    { start: [axonEndX, axonY], mid: [axonEndX + 35, axonY + 35], end: [axonEndX + 65, axonY + 45], bulb: [axonEndX + 65, axonY + 45] },
    { start: [axonEndX + 35, axonY + 35], mid: [axonEndX + 55, axonY + 70], end: [axonEndX + 75, axonY + 85], bulb: [axonEndX + 75, axonY + 85] },
  ];

  for (const tb of tBranches) {
    content += `<path d="M ${tb.start[0]} ${tb.start[1]} Q ${tb.mid[0]} ${tb.mid[1]} ${tb.end[0]} ${tb.end[1]}" stroke="${P.terminalsBase}" stroke-width="2.8" stroke-linecap="round" fill="none"/>`;
    content += `<path d="M ${tb.start[0]} ${tb.start[1]} Q ${tb.mid[0]} ${tb.mid[1]} ${tb.end[0]} ${tb.end[1]}" stroke="${P.somaGlow}" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.6"/>`;
    content += `<circle cx="${tb.bulb[0]}" cy="${tb.bulb[1]}" r="6.5" fill="url(#bulbGrad-${uid})" filter="url(#bio-shadow-${uid})" stroke="${P.somaShadow}" stroke-width="1"/>`;
    content += `<circle cx="${tb.bulb[0] - 2}" cy="${tb.bulb[1] - 2}" r="2" fill="#ffffff" opacity="0.65"/>`;
  }
  content += `</g>`;

  // ── 6. سهم اتجاه السيالة العصبية (Action Potential Arrow) ───────
  if (showAP) {
    const arrowY = axonY - 62;
    const arrowX1 = axonStartX + 40;
    const arrowX2 = axonEndX - 40;
    content += `<g>
      <line x1="${arrowX1}" y1="${arrowY}" x2="${arrowX2}" y2="${arrowY}" stroke="url(#apGrad-${uid})" stroke-width="3" stroke-linecap="round" stroke-dasharray="6,4"/>
      <polygon points="${arrowX2 + 8},${arrowY} ${arrowX2 - 4},${arrowY - 6} ${arrowX2 - 4},${arrowY + 6}" fill="${P.impulseArrow}"/>
      <rect x="${(arrowX1 + arrowX2) / 2 - 105}" y="${arrowY - 26}" width="210" height="20" rx="10" fill="${P.calloutBg}" stroke="${P.impulseArrow}" stroke-width="1.2" opacity="0.95"/>
      <text x="${(arrowX1 + arrowX2) / 2}" y="${arrowY - 12}" font-size="11" font-weight="bold" fill="${P.impulseArrow}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">اتجاه انتشار السيالة العصبية →</text>
    </g>`;
  }

  // ── 7. التأشيرات والبطاقات (Callouts & Labels) ─────────────────
  if (mode !== 'none') {
    interface LabelItem {
      num: number;
      ar: string;
      sub: string;
      target: [number, number];
      card: [number, number];
    }

    const firstNodeX = axonStartX + 10 + segWidth + segGap / 2;
    const middleMyelinX = axonStartX + 10 + (segWidth + segGap) * 1.5;

    const labels: LabelItem[] = [
      {
        num: 1,
        ar: 'تفرعات شجيرية',
        sub: 'Dendrites',
        target: [somaX - 110, somaY - 135],
        card: [somaX - 90, 75],
      },
      {
        num: 2,
        ar: 'جسم خلوي ونواة',
        sub: 'Soma & Nucleus',
        target: [somaX - 5, somaY + 25],
        card: [somaX - 30, 420],
      },
      {
        num: 3,
        ar: 'غمد النخاعين (3D)',
        sub: 'Myelin Sheath',
        target: [middleMyelinX, axonY - segHalfH],
        card: [middleMyelinX, 115],
      },
      {
        num: 4,
        ar: 'اختناق رانفييه',
        sub: 'Node of Ranvier',
        target: [firstNodeX, axonY],
        card: [firstNodeX, 420],
      },
      {
        num: 5,
        ar: 'محور أسطواني',
        sub: 'Axon',
        target: [axonStartX + 8, axonY],
        card: [axonStartX + 5, 365],
      },
      {
        num: 6,
        ar: 'تفرعات انتهائية وأزرار مشبكية',
        sub: 'Synaptic Terminals',
        target: [axonEndX + 70, axonY + 45],
        card: [axonEndX + 115, 395],
      },
    ];

    content += `<g class="bio-callouts">`;
    for (const item of labels) {
      const [tx, ty] = item.target;
      const [cx, cy] = item.card;

      if (mode === 'numbered') {
        content += `<!-- مؤشر مرقم [${item.num}] -->
        <line x1="${cx}" y1="${cy}" x2="${tx}" y2="${ty}" stroke="${P.pointerLine}" stroke-width="1.6" stroke-dasharray="3,3" opacity="0.85"/>
        <circle cx="${tx}" cy="${ty}" r="4" fill="${P.pointerDot}"/>
        <g filter="url(#callout-shadow-${uid})">
          <circle cx="${cx}" cy="${cy}" r="15" fill="${P.calloutBg}" stroke="${P.pointerDot}" stroke-width="2.2"/>
          <text x="${cx}" y="${cy + 5}" font-size="13" font-weight="bold" fill="${P.pointerDot}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${item.num}</text>
        </g>`;
      } else {
        const cardW = 165;
        const cardH = 36;
        const rx = cx - cardW / 2;
        const ry = cy - cardH / 2;

        content += `<!-- بطاقة شرح [${item.ar}] -->
        <line x1="${cx}" y1="${cy > ty ? ry : ry + cardH}" x2="${tx}" y2="${ty}" stroke="${P.pointerLine}" stroke-width="1.4" opacity="0.75"/>
        <circle cx="${tx}" cy="${ty}" r="3.5" fill="${P.pointerDot}"/>
        <g filter="url(#callout-shadow-${uid})">
          <rect x="${rx}" y="${ry}" width="${cardW}" height="${cardH}" rx="10" fill="${P.calloutBg}" stroke="${P.calloutStroke}" stroke-width="1.2"/>
          <text x="${cx}" y="${cy - 3}" font-size="11.5" font-weight="bold" fill="${P.calloutTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(item.ar)}</text>
          <text x="${cx}" y="${cy + 11}" font-size="9.5" font-weight="500" fill="${P.calloutTextSub}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(item.sub)}</text>
        </g>`;
      }
    }
    content += `</g>`;
  }

  // عنوان توضيحي أسفل الرسم إذا توفر
  if (spec.caption) {
    content += `<text x="${W / 2}" y="${H - 18}" font-size="14" font-weight="bold" fill="${P.calloutTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
  }

  return wrapSvg(defs + content, W, H, spec.caption ?? 'رسم تخطيطي ومجسم لبنية الخلية العصبية (العصبون)', opts);
}

// ------------------------------------------------------------
// تصيير الجهاز التنفسي والتبادلات الغازية (Respiratory System Renderer)
// ------------------------------------------------------------

export function renderRespiratorySystem(spec: RespiratorySpec, opts?: RenderOptions): string {
  const theme = spec.theme ?? 'natural';
  const mode = spec.labelsMode ?? 'full';
  const focus = spec.focus ?? 'all';
  const showZoom = spec.showAlveoliZoom ?? true;
  const showAirflow = spec.showAirflow ?? true;
  const showExchange = spec.showGasExchange ?? true;

  const W_RESP = 1040;
  const H_RESP = 590;

  // فحص الشفافية عند التركيز
  const opTrachea = focus === 'all' || focus === 'trachea' ? '1' : '0.35';
  const opBronchi = focus === 'all' || focus === 'bronchi' ? '1' : '0.35';
  const opLungs = focus === 'all' || focus === 'lungs' ? '1' : '0.35';
  const opBronchioles = focus === 'all' || focus === 'bronchioles' ? '1' : '0.35';
  const opAlveoli = focus === 'all' || focus === 'alveoli' ? '1' : '0.35';
  const opDiaphragm = focus === 'all' || focus === 'diaphragm' ? '1' : '0.35';

  const uid = Math.random().toString(36).substring(2, 8);

  // إعدادات ألوان السمة
  const isExam = theme === 'exam_print';
  const isVibrant = theme === 'vibrant';

  const cTrachea = isExam ? '#cbd5e1' : (isVibrant ? '#f8fafc' : '#f1f5f9');
  const cTracheaBorder = isExam ? '#334155' : '#64748b';
  const cLobeRight1 = isExam ? '#e2e8f0' : (isVibrant ? '#fda4af' : '#fecdd3');
  const cLobeRight2 = isExam ? '#64748b' : (isVibrant ? '#e11d48' : '#f43f5e');
  const cLobeRightShadow = isExam ? '#1e293b' : (isVibrant ? '#881337' : '#9f1239');
  const cLobeLeftStroke = isExam ? '#475569' : '#f43f5e';
  const cLobeLeftFill = isExam ? '#f1f5f9' : '#ffe4e6';
  const cBronchi = isExam ? '#475569' : '#d97706';
  const cBronchioles = isExam ? '#334155' : '#ea580c';
  const cDiaphragm1 = isExam ? '#64748b' : '#b91c1c';
  const cDiaphragm2 = isExam ? '#1e293b' : '#450a0a';
  const cO2 = isExam ? '#334155' : '#0284c7';
  const cCO2 = isExam ? '#0f172a' : '#ea580c';
  const cCapillaryRed = isExam ? '#475569' : '#dc2626';
  const cCapillaryBlue = isExam ? '#1e293b' : '#2563eb';
  const cAlveolusFill = isExam ? '#f8fafc' : '#fdf2f8';
  const cAlveolusStroke = isExam ? '#475569' : '#f472b6';
  const cCalloutBg = '#ffffff';
  const cCalloutStroke = isExam ? '#334155' : '#cbd5e1';
  const cTextMain = isExam ? '#000000' : '#0f172a';
  const cTextSub = isExam ? '#334155' : '#64748b';
  const cPointerDot = isExam ? '#000000' : '#e11d48';

  const defs = `<defs>
    <filter id="resp-shadow-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.16"/>
    </filter>
    <filter id="resp-inset-shadow-${uid}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="8" flood-color="#000000" flood-opacity="0.18"/>
    </filter>
    <filter id="resp-callout-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.12"/>
    </filter>

    <!-- تدرج الرئة اليمنى 3D -->
    <radialGradient id="lungRightGrad-${uid}" cx="40%" cy="35%" r="70%">
      <stop offset="0%" stop-color="${cLobeRight1}"/>
      <stop offset="55%" stop-color="${cLobeRight2}"/>
      <stop offset="100%" stop-color="${cLobeRightShadow}"/>
    </radialGradient>

    <!-- تدرج الحلقات الغضروفية للقصبة 3D -->
    <linearGradient id="ringGrad-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="${cTrachea}"/>
      <stop offset="80%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>

    <!-- تدرج الحنجرة -->
    <linearGradient id="larynxGrad-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="60%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>

    <!-- تدرج الحجاب الحاجز -->
    <linearGradient id="diaphragmGrad-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${cDiaphragm1}"/>
      <stop offset="100%" stop-color="${cDiaphragm2}"/>
    </linearGradient>

    <!-- تدرج الحويصلات الكروية 3D -->
    <radialGradient id="alveolusGrad-${uid}" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="45%" stop-color="${cAlveolusFill}"/>
      <stop offset="100%" stop-color="#f472b6"/>
    </radialGradient>

    <!-- تدرج خلفية نافذة التكبير -->
    <radialGradient id="insetBgGrad-${uid}" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="85%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </radialGradient>
  </defs>`;

  let content = '';

  const cxCenter = 410;
  const tracheaTopY = 95;
  const carinaY = 190;

  // ── 1. الحجاب الحاجز (Diaphragm) ──────────────────────────────
  content += `<g opacity="${opDiaphragm}">
    <!-- قبة الحجاب الحاجز العضلية -->
    <path d="M 190 480 Q 290 425 410 428 Q 530 425 630 480 L 630 505 Q 530 450 410 453 Q 290 450 190 505 Z"
          fill="url(#diaphragmGrad-${uid})" filter="url(#resp-shadow-${uid})" stroke="#450a0a" stroke-width="1.2"/>
    <!-- خطوط الألياف العضلية المقوسة -->
    <path d="M 230 480 Q 320 445 410 447 Q 500 445 590 480" stroke="#fca5a5" stroke-width="1" fill="none" opacity="0.45"/>
    <path d="M 270 478 Q 340 450 410 452 Q 480 450 550 478" stroke="#fca5a5" stroke-width="0.8" fill="none" opacity="0.35"/>
  </g>`;

  // ── 2. الرئة اليمنى (Right Lung - كاملة 3D بثلاثة فصوص) ───────
  content += `<g opacity="${opLungs}">
    <!-- كتلة الرئة اليمنى كاملة بتجسيم ثلاثي الأبعاد -->
    <path d="M 365 195
             C 340 190, 270 230, 240 280
             C 215 325, 220 380, 245 425
             C 265 460, 310 455, 360 435
             C 385 425, 385 365, 370 310
             C 360 270, 380 230, 365 195 Z"
          fill="url(#lungRightGrad-${uid})" filter="url(#resp-shadow-${uid})" stroke="${cLobeRightShadow}" stroke-width="1.5"/>

    <!-- الشق الأفقي (Horizontal Fissure) يقسم الفص العلوي عن الأوسط -->
    <path d="M 230 330 Q 290 320 365 315" stroke="${cLobeRightShadow}" stroke-width="1.6" fill="none" opacity="0.6"/>
    <!-- الشق المائل (Oblique Fissure) يقسم الفص السفلي -->
    <path d="M 245 415 Q 310 380 375 270" stroke="${cLobeRightShadow}" stroke-width="1.6" fill="none" opacity="0.6"/>

    <!-- انعكاس ضوئي سطحي ثلاثي الأبعاد على الفص العلوي -->
    <ellipse cx="295" cy="255" rx="35" ry="20" fill="#ffffff" opacity="0.32" transform="rotate(-25 295 255)"/>
  </g>`;

  // ── 3. الرئة اليسرى (Left Lung - مقطع شفاف للشجرة القصبية) ─────
  content += `<g opacity="${opLungs}">
    <!-- الغلاف الشفاف للرئة اليسرى مع تلم القلب (Cardiac Notch) -->
    <path d="M 455 195
             C 480 190, 550 230, 580 280
             C 605 325, 600 380, 575 425
             C 555 460, 510 455, 460 435
             C 435 425, 430 385, 442 355
             C 455 325, 440 270, 455 195 Z"
          fill="${cLobeLeftFill}" fill-opacity="0.28" stroke="${cLobeLeftStroke}" stroke-width="1.8" stroke-dasharray="6,3" filter="url(#resp-shadow-${uid})"/>

    <!-- الشق المائل للرئة اليسرى -->
    <path d="M 575 415 Q 510 375 450 260" stroke="${cLobeLeftStroke}" stroke-width="1.2" fill="none" opacity="0.5"/>
  </g>`;

  // ── 4. الشجرة القصبية داخل الرئة اليسرى (Bronchial Tree) ───────
  content += `<g opacity="${opBronchioles}">`;
  // الشعبة الرئيسية اليسرى تتفرع إلى فروع فصية ثم قصيبات شجرية ناعمة
  const bTree = [
    // فرع رئيسي علوي
    'M 470 235 Q 500 245 525 240',
    'M 525 240 Q 545 225 560 215',
    'M 525 240 Q 550 255 570 265',
    'M 560 215 Q 570 200 580 195',
    // فرع وسطي متجه نحو منطقة التكبير
    'M 470 235 Q 505 275 530 295',
    'M 530 295 Q 555 290 575 295',
    'M 530 295 Q 545 325 565 345',
    'M 565 345 Q 580 355 590 370',
    // فرع سفلي
    'M 470 235 Q 485 305 495 345',
    'M 495 345 Q 480 375 475 405',
    'M 495 345 Q 520 380 540 410',
  ];

  for (const p of bTree) {
    content += `<path d="${p}" stroke="${cBronchi}" stroke-width="3" stroke-linecap="round" fill="none"/>`;
    content += `<path d="${p}" stroke="${cBronchioles}" stroke-width="1.4" stroke-linecap="round" fill="none" opacity="0.8"/>`;
  }

  // دائرة توضيح موضع العينات الرئوية نحو التكبير
  content += `<circle cx="565" cy="345" r="7" fill="none" stroke="${cCapillaryRed}" stroke-width="2"/>`;
  content += `<circle cx="565" cy="345" r="3" fill="${cCapillaryRed}"/>`;
  content += `</g>`;

  // ── 5. الحنجرة والقصبة والشعبتان (Larynx, Trachea & Bronchi) ───
  content += `<g opacity="${opTrachea}">
    <!-- الحنجرة (Larynx / الغضروف الدرقي) -->
    <path d="M 395 55 L 425 55 L 435 85 L 410 92 L 385 85 Z" fill="url(#larynxGrad-${uid})" stroke="${cTracheaBorder}" stroke-width="1.2" filter="url(#resp-shadow-${uid})"/>
    <line x1="410" y1="58" x2="410" y2="88" stroke="#ffffff" stroke-width="1.2" opacity="0.6"/>

    <!-- القصبة الهوائية ذات الحلقات الغضروفية -->
    <rect x="397" y="${tracheaTopY}" width="26" height="${carinaY - tracheaTopY}" fill="#94a3b8" rx="2" opacity="0.3"/>`;

  // رسم 8 حلقات غضروفية ثلاثية الأبعاد
  for (let y = tracheaTopY + 4; y < carinaY - 6; y += 11) {
    content += `<rect x="394" y="${y}" width="32" height="7.5" rx="3.5" fill="url(#ringGrad-${uid})" stroke="${cTracheaBorder}" stroke-width="0.8" filter="url(#resp-shadow-${uid})"/>`;
    content += `<line x1="398" y1="${y + 2}" x2="422" y2="${y + 2}" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.75"/>`;
  }

  // الشعبتان الهوائيتان (Primary Bronchi)
  content += `<!-- تفرع القصبة (Carina) والشعبتان -->
    <g opacity="${opBronchi}">
      <!-- شعبة يمنى -->
      <path d="M 400 ${carinaY} Q 375 205 350 235 L 362 242 Q 385 215 410 ${carinaY + 8} Z" fill="url(#ringGrad-${uid})" stroke="${cTracheaBorder}" stroke-width="1"/>
      <!-- شعبة يسرى -->
      <path d="M 420 ${carinaY} Q 445 205 470 235 L 458 242 Q 435 215 410 ${carinaY + 8} Z" fill="url(#ringGrad-${uid})" stroke="${cTracheaBorder}" stroke-width="1"/>
    </g>
  </g>`;

  // ── 6. أسهم مسار الهواء شهيق / زفير (Airflow Dynamics) ──────────
  if (showAirflow) {
    content += `<g>
      <!-- سهم الشهيق O2 (يسار القصبة) -->
      <path d="M 370 65 L 370 145" stroke="${cO2}" stroke-width="3" stroke-linecap="round" stroke-dasharray="5,3"/>
      <polygon points="370,153 365,140 375,140" fill="${cO2}"/>
      <rect x="310" y="85" width="55" height="22" rx="6" fill="${cCalloutBg}" stroke="${cO2}" stroke-width="1.2" filter="url(#resp-callout-${uid})"/>
      <text x="337" y="100" font-size="10.5" font-weight="bold" fill="${cO2}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">شهيق O₂</text>

      <!-- سهم الزفير CO2 (يمين القصبة) -->
      <path d="M 450 145 L 450 65" stroke="${cCO2}" stroke-width="3" stroke-linecap="round" stroke-dasharray="5,3"/>
      <polygon points="450,57 445,70 455,70" fill="${cCO2}"/>
      <rect x="455" y="85" width="60" height="22" rx="6" fill="${cCalloutBg}" stroke="${cCO2}" stroke-width="1.2" filter="url(#resp-callout-${uid})"/>
      <text x="485" y="100" font-size="10.5" font-weight="bold" fill="${cCO2}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">زفير CO₂</text>
    </g>`;
  }

  // ── 7. نافذة تكبير الحويصلات والمبادلات الغازية (Alveoli Inset) ──
  if (showZoom) {
    const inX = 830;
    const inY = 250;
    const inR = 115;

    content += `<g opacity="${opAlveoli}">
      <!-- خطوط الاتصال التكبيرية من الرئة إلى النافذة -->
      <line x1="565" y1="345" x2="${inX - inR + 10}" y2="${inY - 50}" stroke="${cCapillaryRed}" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.65"/>
      <line x1="565" y1="345" x2="${inX - inR + 10}" y2="${inY + 60}" stroke="${cCapillaryRed}" stroke-width="1.5" stroke-dasharray="4,4" opacity="0.65"/>

      <!-- إطار نافذة التكبير الكروية -->
      <circle cx="${inX}" cy="${inY}" r="${inR}" fill="url(#insetBgGrad-${uid})" stroke="#94a3b8" stroke-width="2.5" filter="url(#resp-inset-shadow-${uid})"/>

      <!-- ترويسة نافذة التكبير -->
      <rect x="${inX - 90}" y="${inY - inR + 8}" width="180" height="20" rx="6" fill="#0f172a" opacity="0.85"/>
      <text x="${inX}" y="${inY - inR + 22}" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">مقطع مكبر: الحويصلات الرئوية</text>

      <!-- القصيبة الانتهائية داخل النافذة -->
      <path d="M ${inX - 85} ${inY - 45} Q ${inX - 35} ${inY - 40} ${inX - 10} ${inY - 15}" stroke="${cBronchi}" stroke-width="10" stroke-linecap="round" fill="none"/>
      <path d="M ${inX - 85} ${inY - 45} Q ${inX - 35} ${inY - 40} ${inX - 10} ${inY - 15}" stroke="#fef3c7" stroke-width="5" stroke-linecap="round" fill="none"/>

      <!-- عناقيد الحويصلات الرئوية الكروية (Alveolar Sacs) ثلاثية الأبعاد -->
      <g filter="url(#resp-shadow-${uid})">
        <circle cx="${inX - 25}" cy="${inY + 15}" r="22" fill="url(#alveolusGrad-${uid})" stroke="${cAlveolusStroke}" stroke-width="1"/>
        <circle cx="${inX + 15}" cy="${inY - 10}" r="25" fill="url(#alveolusGrad-${uid})" stroke="${cAlveolusStroke}" stroke-width="1"/>
        <circle cx="${inX + 35}" cy="${inY + 25}" r="24" fill="url(#alveolusGrad-${uid})" stroke="${cAlveolusStroke}" stroke-width="1"/>
        <circle cx="${inX - 5}" cy="${inY + 45}" r="23" fill="url(#alveolusGrad-${uid})" stroke="${cAlveolusStroke}" stroke-width="1"/>
        <circle cx="${inX - 10}" cy="${inY - 5}" r="20" fill="url(#alveolusGrad-${uid})" stroke="${cAlveolusStroke}" stroke-width="1"/>
      </g>

      <!-- شبكة الشعيرات الدموية الملتفة حول الحويصلات -->
      <!-- وريد أزرق (محمل بـ CO2 وارد) -->
      <path d="M ${inX - 70} ${inY - 80} Q ${inX - 45} ${inY - 10} ${inX - 20} ${inY + 10} Q ${inX + 5} ${inY + 15} ${inX + 25} ${inY + 45}"
            stroke="${cCapillaryBlue}" stroke-width="3" fill="none" opacity="0.85"/>
      <!-- شريان أحمر (محمل بـ O2 صادر) -->
      <path d="M ${inX + 25} ${inY + 45} Q ${inX + 55} ${inY + 35} ${inX + 50} ${inY - 5} Q ${inX + 35} ${inY - 50} ${inX + 65} ${inY - 80}"
            stroke="${cCapillaryRed}" stroke-width="3" fill="none" opacity="0.85"/>

      <!-- شبكة تفرعات شعرية دقيقة فوق الحويصلات -->
      <path d="M ${inX - 15} ${inY + 10} Q ${inX + 10} ${inY + 5} ${inX + 35} ${inY + 20}" stroke="#a855f7" stroke-width="1.8" fill="none" opacity="0.75"/>
      <path d="M ${inX - 5} ${inY - 5} Q ${inX + 25} ${inY - 15} ${inX + 45} ${inY - 5}" stroke="#ec4899" stroke-width="1.8" fill="none" opacity="0.75"/>`;

    // أسهم المبادلات الغازية الدقيقة O2 / CO2
    if (showExchange) {
      content += `<!-- انتقال O2 إلى الدم -->
        <path d="M ${inX - 10} ${inY + 20} Q ${inX + 5} ${inY + 30} ${inX + 15} ${inY + 35}" stroke="${cO2}" stroke-width="2" stroke-linecap="round" fill="none"/>
        <polygon points="${inX + 18},${inY + 37} ${inX + 10},${inY + 32} ${inX + 12},${inY + 40}" fill="${cO2}"/>
        <text x="${inX + 8}" y="${inY + 55}" font-size="9" font-weight="bold" fill="${cO2}">O₂ → دم</text>

        <!-- طرح CO2 من الدم للحويصلة -->
        <path d="M ${inX - 25} ${inY + 5} Q ${inX - 15} ${inY - 10} ${inX - 5} ${inY - 12}" stroke="${cCO2}" stroke-width="2" stroke-linecap="round" fill="none"/>
        <polygon points="${inX - 3},${inY - 13} ${inX - 12},${inY - 8} ${inX - 10},${inY - 16}" fill="${cCO2}"/>
        <text x="${inX - 50}" y="${inY - 15}" font-size="9" font-weight="bold" fill="${cCO2}">CO₂ ← هواء</text>`;
    }

    content += `</g>`;
  }

  // ── 8. التأشيرات والبطاقات (Callouts & Labels) ─────────────────
  if (mode !== 'none') {
    interface RespLabelItem {
      num: number;
      ar: string;
      sub: string;
      target: [number, number];
      card: [number, number];
    }

    const labels: RespLabelItem[] = [
      {
        num: 1,
        ar: 'القصبة الهوائية',
        sub: 'Trachea',
        target: [cxCenter, 140],
        card: [230, 115],
      },
      {
        num: 2,
        ar: 'الشعبتان الهوائيتان',
        sub: 'Bronchi',
        target: [435, 215],
        card: [210, 195],
      },
      {
        num: 3,
        ar: 'الرئة اليمنى (3 فصوص)',
        sub: 'Right Lung',
        target: [300, 310],
        card: [140, 320],
      },
      {
        num: 4,
        ar: 'القصيبات الهوائية (مقطع)',
        sub: 'Bronchioles',
        target: [530, 290],
        card: [620, 240],
      },
      {
        num: 5,
        ar: 'الحويصلات الرئوية (مكبرة)',
        sub: 'Alveoli (Zoom)',
        target: [820, 220],
        card: [830, 95],
      },
      {
        num: 6,
        ar: 'الحجاب الحاجز',
        sub: 'Diaphragm',
        target: [410, 435],
        card: [410, 535],
      },
      {
        num: 7,
        ar: 'المبادلات الغازية (O₂ / CO₂)',
        sub: 'Gas Exchange',
        target: [830, 300],
        card: [830, 420],
      },
    ];

    content += `<g class="bio-callouts">`;
    for (const item of labels) {
      const [tx, ty] = item.target;
      const [cx, cy] = item.card;

      if (mode === 'numbered') {
        content += `<!-- مؤشر مرقم [${item.num}] -->
        <line x1="${cx}" y1="${cy}" x2="${tx}" y2="${ty}" stroke="${cTracheaBorder}" stroke-width="1.6" stroke-dasharray="3,3" opacity="0.85"/>
        <circle cx="${tx}" cy="${ty}" r="4" fill="${cPointerDot}"/>
        <g filter="url(#resp-callout-${uid})">
          <circle cx="${cx}" cy="${cy}" r="15" fill="${cCalloutBg}" stroke="${cPointerDot}" stroke-width="2.2"/>
          <text x="${cx}" y="${cy + 5}" font-size="13" font-weight="bold" fill="${cPointerDot}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${item.num}</text>
        </g>`;
      } else {
        const cardW = 175;
        const cardH = 36;
        const rx = cx - cardW / 2;
        const ry = cy - cardH / 2;

        content += `<!-- بطاقة شرح [${item.ar}] -->
        <line x1="${cx}" y1="${cy > ty ? ry : ry + cardH}" x2="${tx}" y2="${ty}" stroke="${cTracheaBorder}" stroke-width="1.4" opacity="0.75"/>
        <circle cx="${tx}" cy="${ty}" r="3.5" fill="${cPointerDot}"/>
        <g filter="url(#resp-callout-${uid})">
          <rect x="${rx}" y="${ry}" width="${cardW}" height="${cardH}" rx="10" fill="${cCalloutBg}" stroke="${cCalloutStroke}" stroke-width="1.2"/>
          <text x="${cx}" y="${cy - 3}" font-size="11.5" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(item.ar)}</text>
          <text x="${cx}" y="${cy + 11}" font-size="9.5" font-weight="500" fill="${cTextSub}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(item.sub)}</text>
        </g>`;
      }
    }
    content += `</g>`;
  }

  // عنوان توضيحي أسفل الرسم إذا توفر
  if (spec.caption) {
    content += `<text x="${W_RESP / 2}" y="${H_RESP - 18}" font-size="14" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
  }

  return wrapSvg(defs + content, W_RESP, H_RESP, spec.caption ?? 'رسم تخطيطي ومجسم للجهاز التنفسي والمبادلات الغازية', opts);
}

// ------------------------------------------------------------
// تصيير مقطع كرة العين وحاسة الرؤية (Eye Cross-Section Renderer)
// ------------------------------------------------------------

export function renderEye(spec: EyeSpec, opts?: RenderOptions): string {
  const theme = spec.theme ?? 'natural';
  const mode = spec.labelsMode ?? 'full';
  const focus = spec.focus ?? 'all';
  const showAxis = spec.showOpticalAxis ?? true;

  const W_EYE = 980;
  const H_EYE = 540;

  // فحص الشفافية عند التركيز
  const opSclera = focus === 'all' || focus === 'sclera' ? '1' : '0.35';
  const opRetina = focus === 'all' || focus === 'retina' ? '1' : '0.35';
  const opLens = focus === 'all' || focus === 'lens' ? '1' : '0.35';
  const opCornea = focus === 'all' || focus === 'cornea' ? '1' : '0.35';
  const opNerve = focus === 'all' || focus === 'optic_nerve' ? '1' : '0.35';
  const opVitreous = focus === 'all' || focus === 'vitreous' ? '1' : '0.35';
  const opIris = focus === 'all' || focus === 'iris' ? '1' : '0.35';

  const uid = Math.random().toString(36).substring(2, 8);

  const isExam = theme === 'exam_print';
  const isVibrant = theme === 'vibrant';

  // لوحة الألوان
  const cSclera = isExam ? '#e2e8f0' : '#f8fafc';
  const cScleraStroke = isExam ? '#334155' : '#94a3b8';
  const cChoroid = isExam ? '#334155' : (isVibrant ? '#581c87' : '#451a03');
  const cRetina = isExam ? '#94a3b8' : (isVibrant ? '#f59e0b' : '#f59e0b');
  const cCornea = isExam ? '#f1f5f9' : (isVibrant ? '#38bdf8' : '#38bdf8');
  const cLens1 = isExam ? '#f8fafc' : '#e0f2fe';
  const cLens2 = isExam ? '#64748b' : (isVibrant ? '#0284c7' : '#0284c7');
  const cIris = isExam ? '#475569' : (isVibrant ? '#9333ea' : '#7c3aed');
  const cVitreous1 = isExam ? '#f8fafc' : '#f0f9ff';
  const cVitreous2 = isExam ? '#cbd5e1' : (isVibrant ? '#7dd3fc' : '#bae6fd');
  const cNerve = isExam ? '#94a3b8' : '#fed7aa';
  const cAxis = isExam ? '#000000' : '#ea580c';
  const cCalloutBg = '#ffffff';
  const cCalloutStroke = isExam ? '#334155' : '#cbd5e1';
  const cTextMain = isExam ? '#000000' : '#0f172a';
  const cTextSub = isExam ? '#334155' : '#64748b';
  const cPointerDot = isExam ? '#000000' : '#2563eb';

  const cx = 440;
  const cy = 270;

  const defs = `<defs>
    <filter id="eye-shadow-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.16"/>
    </filter>
    <filter id="eye-callout-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.12"/>
    </filter>

    <!-- تدرج الخلط الزجاجي 3D كروي -->
    <radialGradient id="vitreousGrad-${uid}" cx="45%" cy="40%" r="65%">
      <stop offset="0%" stop-color="${cVitreous1}"/>
      <stop offset="65%" stop-color="${cVitreous2}"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </radialGradient>

    <!-- تدرج العدسة البلورية الزجاجية -->
    <linearGradient id="lensGrad-${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${cLens1}"/>
      <stop offset="35%" stop-color="#ffffff"/>
      <stop offset="70%" stop-color="${cLens2}"/>
      <stop offset="100%" stop-color="${cLens1}"/>
    </linearGradient>

    <!-- تدرج القرنية الشفافة -->
    <linearGradient id="corneaGrad-${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
      <stop offset="60%" stop-color="${cCornea}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${cCornea}" stop-opacity="0.25"/>
    </linearGradient>

    <!-- تدرج العصب البصري -->
    <linearGradient id="nerveGrad-${uid}" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stop-color="${cNerve}"/>
      <stop offset="50%" stop-color="#fdba74"/>
      <stop offset="100%" stop-color="#fb923c"/>
    </linearGradient>
  </defs>`;

  let content = '';

  // ── 1. العصب البصري (Optic Nerve - قطب خلفي يسار) ─────────────
  content += `<g opacity="${opNerve}">
    <!-- جذع العصب البصري الممتد نحو المخ -->
    <path d="M 305 245 C 240 240, 180 235, 120 230 L 120 310 C 180 305, 240 300, 305 295 Z"
          fill="url(#nerveGrad-${uid})" filter="url(#eye-shadow-${uid})" stroke="#ea580c" stroke-width="1.2"/>
    <!-- غلاف الصلبة المحيط بالعصب -->
    <path d="M 305 240 C 240 235, 180 230, 120 225 L 120 235 C 180 240, 240 245, 305 250 Z" fill="${cSclera}" stroke="${cScleraStroke}" stroke-width="0.8"/>
    <path d="M 305 290 C 240 295, 180 300, 120 305 L 120 315 C 180 310, 240 305, 305 300 Z" fill="${cSclera}" stroke="${cScleraStroke}" stroke-width="0.8"/>
    <!-- الأوعية الدموية المركزية داخل العصب (الشريان والوريد) -->
    <path d="M 120 265 C 180 267, 240 268, 300 270" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <path d="M 120 275 C 180 273, 240 272, 300 270" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  </g>`;

  // ── 2. الخلط الزجاجي (Vitreous Body - التجويف الكروي الأكبر) ───
  content += `<g opacity="${opVitreous}">
    <!-- مادة الخلط الزجاجي الشفافة ثلاثية الأبعاد -->
    <path d="M 535 180 A 130 130 0 1 0 535 360 Z"
          fill="url(#vitreousGrad-${uid})" filter="url(#eye-shadow-${uid})"/>
    <!-- انعكاس لمعان كروي داخلي -->
    <ellipse cx="400" cy="225" rx="55" ry="30" fill="#ffffff" opacity="0.38" transform="rotate(-20 400 225)"/>
  </g>`;

  // ── 3. جدار كرة العين ثلاثي الطبقات (Layers of the Eye Wall) ──
  // أ) الطبقة الخارجية: الصلبة (Sclera)
  content += `<g opacity="${opSclera}">
    <path d="M 540 175 A 150 150 0 1 0 540 365"
          fill="none" stroke="${cSclera}" stroke-width="12" stroke-linecap="round" filter="url(#eye-shadow-${uid})"/>
    <path d="M 540 175 A 150 150 0 1 0 540 365"
          fill="none" stroke="${cScleraStroke}" stroke-width="1.2" opacity="0.8"/>
  </g>`;

  // ب) الطبقة المتوسطة: المشيمية (Choroid)
  content += `<g opacity="${opRetina}">
    <path d="M 535 178 A 140 140 0 1 0 535 362"
          fill="none" stroke="${cChoroid}" stroke-width="8" stroke-linecap="round"/>
  </g>`;

  // ج) الطبقة الداخلية: الشبكية (Retina)
  content += `<g opacity="${opRetina}">
    <path d="M 530 182 A 133 133 0 1 0 530 358"
          fill="none" stroke="${cRetina}" stroke-width="6" stroke-linecap="round"/>

    <!-- الحفيرة المركزية / البقعة الصفراء (Fovea / Macula) -->
    <circle cx="307" cy="270" r="5" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/>
    <circle cx="307" cy="270" r="2" fill="#ffffff"/>

    <!-- البقعة العمياء (Blind Spot) -->
    <ellipse cx="308" cy="285" rx="3" ry="6" fill="#f97316"/>
  </g>`;

  // ── 4. الأوساط الشفافة الأمامية (Cornea, Iris, Lens) ───────────
  // أ) الجسم الهدبي والقزحية والحدقة (Ciliary Body & Iris)
  content += `<g opacity="${opIris}">
    <!-- الجسم الهدبي العلوي والسفلي (Ciliary body) -->
    <polygon points="535,172 548,176 544,195 530,190" fill="#78350f" stroke="#451a03" stroke-width="1"/>
    <polygon points="535,368 548,364 544,345 530,350" fill="#78350f" stroke="#451a03" stroke-width="1"/>

    <!-- أربطة التعليق للعدسة (Zonules) -->
    <line x1="535" y1="190" x2="535" y2="225" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="2,2"/>
    <line x1="535" y1="350" x2="535" y2="315" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="2,2"/>

    <!-- القزحية العلوية (Iris flap top) -->
    <path d="M 548 176 C 555 200, 552 230, 545 240 L 538 238 C 544 228, 546 200, 540 175 Z"
          fill="${cIris}" stroke="#4c1d95" stroke-width="1"/>
    <!-- القزحية السفلية (Iris flap bottom) -->
    <path d="M 548 364 C 555 340, 552 310, 545 300 L 538 302 C 544 312, 546 340, 540 365 Z"
          fill="${cIris}" stroke="#4c1d95" stroke-width="1"/>
  </g>`;

  // ب) العدسة البلورية المحدبة الوجهين (Crystalline Lens)
  content += `<g opacity="${opLens}">
    <path d="M 535 225
             C 552 240, 552 300, 535 315
             C 518 300, 518 240, 535 225 Z"
          fill="url(#lensGrad-${uid})" filter="url(#eye-shadow-${uid})" stroke="#38bdf8" stroke-width="1.5"/>
    <path d="M 533 235 Q 541 270 533 305" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.75"/>
  </g>`;

  // ج) القرنية الشفافة المحدبة للأمام (Cornea)
  content += `<g opacity="${opCornea}">
    <path d="M 540 175
             C 590 190, 645 225, 645 270
             C 645 315, 590 350, 540 365
             C 575 340, 615 310, 615 270
             C 615 230, 575 200, 540 175 Z"
          fill="url(#corneaGrad-${uid})" stroke="#38bdf8" stroke-width="1.8" filter="url(#eye-shadow-${uid})"/>
    <path d="M 565 195 C 610 220, 630 245, 635 270" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" fill="none" opacity="0.7"/>
  </g>`;

  // ── 5. المحور البصري ومسار الضوء (Optical Axis) ───────────────
  if (showAxis) {
    content += `<g>
      <!-- خط متقطع لمسار الضوء من الخارج حتى الشبكية -->
      <line x1="750" y1="${cy}" x2="310" y2="${cy}" stroke="${cAxis}" stroke-width="2.4" stroke-dasharray="6,4"/>
      <!-- أسهم مسار الضوء -->
      <polygon points="680,${cy} 670,${cy - 5} 670,${cy + 5}" fill="${cAxis}"/>
      <polygon points="490,${cy} 480,${cy - 5} 480,${cy + 5}" fill="${cAxis}"/>
      <!-- تسمية المحور البصري -->
      <rect x="670" y="${cy - 28}" width="150" height="20" rx="6" fill="${cCalloutBg}" stroke="${cAxis}" stroke-width="1" filter="url(#eye-callout-${uid})"/>
      <text x="745" y="${cy - 14}" font-size="10" font-weight="bold" fill="${cAxis}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">المحور البصري (مسار الضوء) ←</text>
    </g>`;
  }

  // ── 6. التأشيرات والبطاقات (Callouts & Labels) ─────────────────
  if (mode !== 'none') {
    interface EyeLabelItem {
      num: number;
      ar: string;
      sub: string;
      target: [number, number];
      card: [number, number];
    }

    const labels: EyeLabelItem[] = [
      {
        num: 1,
        ar: 'الصلبة',
        sub: 'Sclera',
        target: [420, 122],
        card: [320, 55],
      },
      {
        num: 2,
        ar: 'المشيمية والشبكية',
        sub: 'Choroid & Retina',
        target: [350, 145],
        card: [165, 95],
      },
      {
        num: 3,
        ar: 'القرنية الشفافة',
        sub: 'Cornea',
        target: [625, 230],
        card: [780, 135],
      },
      {
        num: 4,
        ar: 'العدسة البلورية',
        sub: 'Crystalline Lens',
        target: [535, 220],
        card: [635, 55],
      },
      {
        num: 5,
        ar: 'القزحية والحدقة',
        sub: 'Iris & Pupil',
        target: [545, 200],
        card: [485, 55],
      },
      {
        num: 6,
        ar: 'الخلط الزجاجي',
        sub: 'Vitreous Body',
        target: [430, 270],
        card: [430, 480],
      },
      {
        num: 7,
        ar: 'العصب البصري',
        sub: 'Optic Nerve',
        target: [220, 270],
        card: [100, 360],
      },
    ];

    content += `<g class="bio-callouts">`;
    for (const item of labels) {
      const [tx, ty] = item.target;
      const [cxCard, cyCard] = item.card;

      if (mode === 'numbered') {
        content += `<!-- مؤشر مرقم [${item.num}] -->
        <line x1="${cxCard}" y1="${cyCard}" x2="${tx}" y2="${ty}" stroke="${cScleraStroke}" stroke-width="1.6" stroke-dasharray="3,3" opacity="0.85"/>
        <circle cx="${tx}" cy="${ty}" r="4" fill="${cPointerDot}"/>
        <g filter="url(#eye-callout-${uid})">
          <circle cx="${cxCard}" cy="${cyCard}" r="15" fill="${cCalloutBg}" stroke="${cPointerDot}" stroke-width="2.2"/>
          <text x="${cxCard}" y="${cyCard + 5}" font-size="13" font-weight="bold" fill="${cPointerDot}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${item.num}</text>
        </g>`;
      } else {
        const cardW = 160;
        const cardH = 36;
        const rx = cxCard - cardW / 2;
        const ry = cyCard - cardH / 2;

        content += `<!-- بطاقة شرح [${item.ar}] -->
        <line x1="${cxCard}" y1="${cyCard > ty ? ry : ry + cardH}" x2="${tx}" y2="${ty}" stroke="${cScleraStroke}" stroke-width="1.4" opacity="0.75"/>
        <circle cx="${tx}" cy="${ty}" r="3.5" fill="${cPointerDot}"/>
        <g filter="url(#eye-callout-${uid})">
          <rect x="${rx}" y="${ry}" width="${cardW}" height="${cardH}" rx="10" fill="${cCalloutBg}" stroke="${cCalloutStroke}" stroke-width="1.2"/>
          <text x="${cxCard}" y="${cyCard - 3}" font-size="11.5" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(item.ar)}</text>
          <text x="${cxCard}" y="${cyCard + 11}" font-size="9.5" font-weight="500" fill="${cTextSub}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(item.sub)}</text>
        </g>`;
      }
    }
    content += `</g>`;
  }

  // عنوان توضيحي أسفل الرسم إذا توفر
  if (spec.caption) {
    content += `<text x="${W_EYE / 2}" y="${H_EYE - 18}" font-size="14" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
  }

  return wrapSvg(defs + content, W_EYE, H_EYE, spec.caption ?? 'مقطع تخطيطي ومجسم في كرة العين وحاسة الرؤية', opts);
}

// ------------------------------------------------------------
// المُوزِّع العام لمولّد البيولوجيا
// ------------------------------------------------------------

export function renderBiology(spec: BiologySpec, opts?: RenderOptions): string {
  try {
    if (spec.kind === 'neuron') {
      return renderNeuron(spec, opts);
    }
    if (spec.kind === 'respiratory_system') {
      return renderRespiratorySystem(spec, opts);
    }
    if (spec.kind === 'eye') {
      return renderEye(spec, opts);
    }
  } catch {
    // مبدأ "لا يرمي أبداً"
  }
  return '';
}

