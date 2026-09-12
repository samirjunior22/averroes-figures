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
import {
  absorptionPathwaysSpecSchema,
  renderAbsorptionPathways,
  bloodSmearSpecSchema,
  renderBloodSmear,
  enzymaticDigestionSpecSchema,
  renderEnzymaticDigestion,
  cellularRespirationSpecSchema,
  renderCellularRespiration,
} from './biologyNutrition.js';
import type {
  AbsorptionPathwaysSpec,
  BloodSmearSpec,
  EnzymaticDigestionSpec,
  CellularRespirationSpec,
} from './biologyNutrition.js';

// ------------------------------------------------------------
// مخطّطات Zod
// ------------------------------------------------------------

export const biologyKindSchema = z.enum([
  'neuron',             // الخلية العصبية (العصبون)
  'respiratory_system', // الجهاز التنفسي والتبادلات الغازية
  'eye',                // مقطع كرة العين وحاسة الرؤية
  'villus',             // الزغابة المعوية والامتصاص المعوي
  'synapse',            // المشبك العصبي والنقل الكيميائي
  'digestive_system',   // الجهاز الهضمي العام وملحقاته
  'urinary_system',     // الجهاز البولي والإطراح وتصفية الدم
  'circulatory_system', // الجهاز الدوراني والقلب والدورتان الدمويتان
  'skeletal_system',    // الهيكل العظمي العام والمفاصل
  'absorption_pathways', // طريقا الامتصاص ونقل المغذيات وتعديل السكر
  'blood_smear',         // السحبة الدموية وخلايا الوسط الداخلي
  'enzymatic_digestion', // الهضم الأنزيمي للنشا وتجارب الكواشف
  'cellular_respiration', // التنفس الخلوي واستعمال المغذيات والطاقة
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

/** مجال التركيز في رسم الزغابة المعوية. */
export const villusFocusSchema = z.enum([
  'all',          // عرض شامل للزغابة
  'epithelium',   // الظهارة المعوية والخلايا العمودية
  'goblet_cells', // الخلايا الكأسية المفرزة للمخاط
  'lacteal',      // الوعاء اللمفاوي (البلغمي) المركزي
  'capillaries',  // شبكة الشعيرات الدموية
  'arteriole',    // الشريان الوارد
  'venule',       // الوريد الصادر
]);
export type VillusFocus = z.infer<typeof villusFocusSchema>;

/** مجال التركيز في رسم المشبك العصبي. */
export const synapseFocusSchema = z.enum([
  'all',              // عرض شامل للمشبك
  'presynaptic',      // الزر والغشاء قبل المشبكي
  'vesicles',         // الحويصلات المشبكية
  'neurotransmitter', // جزيئات الوسيط الكيميائي
  'cleft',            // الشق المشبكي
  'postsynaptic',     // الغشاء بعد المشبكي
  'receptors',        // المستقبلات الغشائية النوعية
  'mitochondria',     // الميتوكندريا
]);
export type SynapseFocus = z.infer<typeof synapseFocusSchema>;

/** مجال التركيز في الجهاز الهضمي العام. */
export const digestiveFocusSchema = z.enum([
  'all',              // عرض شامل لكافة أعضاء الجهاز الهضمي
  'mouth',            // التجويف الفموي والغدد اللعابية
  'esophagus',        // المريء
  'stomach',          // المعدة
  'liver',            // الكبد والحويصل الصفراوي
  'pancreas',         // البنكرياس المعثكلة
  'small_intestine',  // المعي الدقيق والتلافيف
  'large_intestine',  // المعي الغليظ والقولون
]);
export type DigestiveFocus = z.infer<typeof digestiveFocusSchema>;

/** مجال التركيز في الجهاز البولي والإطراح. */
export const urinaryFocusSchema = z.enum([
  'all',        // عرض شامل للجهاز البولي
  'kidneys',    // الكليتان
  'cortex',     // القشرة الكلوية
  'medulla',    // اللب وأهرامات مالبيغي
  'ureters',    // الحالبان
  'bladder',    // المثانة البولية
  'vessels',    // الأوعية الدموية الكلوية
]);
export type UrinaryFocus = z.infer<typeof urinaryFocusSchema>;

/** مجال التركيز في الجهاز الدوراني والقلب. */
export const circulatoryFocusSchema = z.enum([
  'all',         // عرض شامل للقلب والدورة الدموية
  'heart',       // تجاويف القلب الأربعة
  'atria',       // الأذينان
  'ventricles',  // البطينان
  'aorta',       // الشريان الأبهر وفروعه
  'pulmonary',   // الشرايين والأوردة الرئوية
  'valves',      // الصمامات القلبية
]);
export type CirculatoryFocus = z.infer<typeof circulatoryFocusSchema>;

/** مجال التركيز في الهيكل العظمي العام. */
export const skeletalFocusSchema = z.enum([
  'all',          // عرض شامل للهيكل العظمي
  'skull',        // الجمجمة والفك السفلي
  'spine',        // العمود الفقري
  'ribcage',      // القفص الصدري وعظم القص
  'upper_limbs',  // الطرفان العلويان (العضد والساعد واليد)
  'pelvis',       // عظام الحوض
  'lower_limbs',  // الطرفان السفليان (الفخذ والساق والقدم)
]);
export type SkeletalFocus = z.infer<typeof skeletalFocusSchema>;

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

/** مواصفات رسم الزغابة المعوية والامتصاص المعوي. */
export const villusSpecSchema = z
  .object({
    kind: z.literal('villus'),
    /** نمط التأشيرات (افتراضي 'full'). */
    labelsMode: labelsModeSchema.optional(),
    /** سمة الألوان (افتراضي 'natural'). */
    theme: biologyThemeSchema.optional(),
    /** جزء التركيز (افتراضي 'all'). */
    focus: villusFocusSchema.optional(),
    /** إظهار أسهم مسار المغذيات والامتصاص (افتراضي true). */
    showNutrientFlow: z.boolean().optional(),
    /** عنوان مخصص للرسم يظهر أسفله. */
    caption: z.string().optional(),
  })
  .strict();
export type VillusSpec = z.infer<typeof villusSpecSchema>;

/** مواصفات رسم المشبك العصبي والنقل الكيميائي. */
export const synapseSpecSchema = z
  .object({
    kind: z.literal('synapse'),
    /** نمط التأشيرات (افتراضي 'full'). */
    labelsMode: labelsModeSchema.optional(),
    /** سمة الألوان (افتراضي 'natural'). */
    theme: biologyThemeSchema.optional(),
    /** جزء التركيز (افتراضي 'all'). */
    focus: synapseFocusSchema.optional(),
    /** إظهار سهم اتجاه انتقال السيالة العصبية (افتراضي true). */
    showImpulseDirection: z.boolean().optional(),
    /** عنوان مخصص للرسم يظهر أسفله. */
    caption: z.string().optional(),
  })
  .strict();
export type SynapseSpec = z.infer<typeof synapseSpecSchema>;

/** مواصفات رسم الجهاز الهضمي العام. */
export const digestiveSpecSchema = z
  .object({
    kind: z.literal('digestive_system'),
    /** نمط التأشيرات (افتراضي 'full'). */
    labelsMode: labelsModeSchema.optional(),
    /** سمة الألوان (افتراضي 'natural'). */
    theme: biologyThemeSchema.optional(),
    /** عضو التركيز (افتراضي 'all'). */
    focus: digestiveFocusSchema.optional(),
    /** إظهار مسار حركة وهضم الغذاء بالأسهم الحركية (افتراضي true). */
    showDigestivePath: z.boolean().optional(),
    /** إظهار الغدد الهاضمة الملحقة بتوهج (افتراضي true). */
    showGlands: z.boolean().optional(),
    /** عنوان مخصص للرسم يظهر أسفله. */
    caption: z.string().optional(),
  })
  .strict();
export type DigestiveSpec = z.infer<typeof digestiveSpecSchema>;

/** مواصفات رسم الجهاز البولي والإطراح. */
export const urinarySpecSchema = z
  .object({
    kind: z.literal('urinary_system'),
    /** نمط التأشيرات (افتراضي 'full'). */
    labelsMode: labelsModeSchema.optional(),
    /** سمة الألوان (افتراضي 'natural'). */
    theme: biologyThemeSchema.optional(),
    /** جزء التركيز (افتراضي 'all'). */
    focus: urinaryFocusSchema.optional(),
    /** إظهار مقطع داخلي شفاف في الكلية للقشرة واللب والحويضة (افتراضي true). */
    showKidneySection: z.boolean().optional(),
    /** إظهار أسهم تدفق وتجمع البول (افتراضي true). */
    showUrineFlow: z.boolean().optional(),
    /** عنوان مخصص للرسم يظهر أسفله. */
    caption: z.string().optional(),
  })
  .strict();
export type UrinarySpec = z.infer<typeof urinarySpecSchema>;

/** مواصفات رسم الجهاز الدوراني والقلب. */
export const circulatorySpecSchema = z
  .object({
    kind: z.literal('circulatory_system'),
    /** نمط التأشيرات (افتراضي 'full'). */
    labelsMode: labelsModeSchema.optional(),
    /** سمة الألوان (افتراضي 'natural'). */
    theme: biologyThemeSchema.optional(),
    /** جزء التركيز (افتراضي 'all'). */
    focus: circulatoryFocusSchema.optional(),
    /** إظهار أسهم مسار الدورتين الدمويتين الرئوية والجهازية (افتراضي true). */
    showCirculation: z.boolean().optional(),
    /** عنوان مخصص للرسم يظهر أسفله. */
    caption: z.string().optional(),
  })
  .strict();
export type CirculatorySpec = z.infer<typeof circulatorySpecSchema>;

/** مواصفات رسم الهيكل العظمي العام. */
export const skeletalSpecSchema = z
  .object({
    kind: z.literal('skeletal_system'),
    /** نمط التأشيرات (افتراضي 'full'). */
    labelsMode: labelsModeSchema.optional(),
    /** سمة الألوان (افتراضي 'natural'). */
    theme: biologyThemeSchema.optional(),
    /** منطقة التركيز (افتراضي 'all'). */
    focus: skeletalFocusSchema.optional(),
    /** إظهار نقاط المفاصل الحركية الرئيسية المضيئة (افتراضي true). */
    showJoints: z.boolean().optional(),
    /** عنوان مخصص للرسم يظهر أسفله. */
    caption: z.string().optional(),
  })
  .strict();
export type SkeletalSpec = z.infer<typeof skeletalSpecSchema>;

/** المواصفات العامة لمولّد البيولوجيا. */
export const biologySpecSchema = z.discriminatedUnion('kind', [
  neuronSpecSchema,
  respiratorySpecSchema,
  eyeSpecSchema,
  villusSpecSchema,
  synapseSpecSchema,
  digestiveSpecSchema,
  urinarySpecSchema,
  circulatorySpecSchema,
  skeletalSpecSchema,
  absorptionPathwaysSpecSchema,
  bloodSmearSpecSchema,
  enzymaticDigestionSpecSchema,
  cellularRespirationSpecSchema,
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
// تصيير بنية الزغابة المعوية والامتصاص المعوي (Intestinal Villus Renderer)
// ------------------------------------------------------------

export function renderVillus(spec: VillusSpec, opts?: RenderOptions): string {
  const theme = spec.theme ?? 'natural';
  const mode = spec.labelsMode ?? 'full';
  const focus = spec.focus ?? 'all';
  const showFlow = spec.showNutrientFlow ?? true;

  const W_VIL = 960;
  const H_VIL = 540;
  const uid = Math.random().toString(36).substring(2, 8);

  const isExam = theme === 'exam_print';
  const isVibrant = theme === 'vibrant';

  // الشفافية عند التركيز
  const opEpi = focus === 'all' || focus === 'epithelium' ? '1' : '0.35';
  const opGoblet = focus === 'all' || focus === 'goblet_cells' ? '1' : '0.35';
  const opLacteal = focus === 'all' || focus === 'lacteal' ? '1' : '0.35';
  const opCap = focus === 'all' || focus === 'capillaries' || focus === 'arteriole' || focus === 'venule' ? '1' : '0.35';

  const cTextMain = isExam ? '#000000' : '#0f172a';
  const cTextSub = isExam ? '#334155' : '#64748b';
  const cPointerDot = isExam ? '#000000' : '#0284c7';
  const cCalloutBg = '#ffffff';
  const cCalloutStroke = isExam ? '#334155' : '#cbd5e1';

  // تدرجات الألوان
  const cLacteal1 = isExam ? '#f1f5f9' : '#fef9c3';
  const cLacteal2 = isExam ? '#94a3b8' : (isVibrant ? '#facc15' : '#eab308');
  const cArtery = isExam ? '#475569' : '#dc2626';
  const cVein = isExam ? '#1e293b' : '#2563eb';
  const cCore = isExam ? '#f8fafc' : '#fff1f2';
  const cEpiCell = isExam ? '#f1f5f9' : (isVibrant ? '#fed7aa' : '#ffedd5');
  const cNucleus = isExam ? '#475569' : '#9333ea';

  let defs = `<defs>
    <filter id="vil-shadow-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#000000" flood-opacity="0.16"/>
    </filter>
    <filter id="vil-callout-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.12"/>
    </filter>

    <!-- تدرج الوعاء اللمفاوي البلغمي المركزي -->
    <linearGradient id="lactealGrad-${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${cLacteal1}"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="${cLacteal2}"/>
    </linearGradient>

    <!-- تدرج الشريان الوارد -->
    <linearGradient id="arteryGrad-${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f87171"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="${cArtery}"/>
    </linearGradient>

    <!-- تدرج الوريد الصادر -->
    <linearGradient id="veinGrad-${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="${cVein}"/>
    </linearGradient>
  </defs>`;

  let content = '';

  // ── 1. جدار المعي الدقيق في القاعدة (Intestinal Base & Crypts) ───
  content += `
  <!-- قاعدة الطبقة المخاطية للمعي -->
  <path d="M 120 450 C 250 450, 310 470, 360 450 C 375 420, 395 380, 400 350" fill="none" stroke="${isExam ? '#64748b' : '#fda4af'}" stroke-width="8"/>
  <path d="M 840 450 C 710 450, 650 470, 600 450 C 585 420, 565 380, 560 350" fill="none" stroke="${isExam ? '#64748b' : '#fda4af'}" stroke-width="8"/>
  <rect x="120" y="450" width="720" height="25" fill="${isExam ? '#e2e8f0' : '#ffe4e6'}" rx="4"/>
  `;

  // ── 2. نسيج اللحمة الداخلي للزغابة (Lamina Propria Core) ──────
  content += `
  <!-- قلب الزغابة المعوية النسيجي الداخلي -->
  <path d="M 370 450 C 370 300, 385 140, 480 90 C 575 140, 590 300, 590 450 Z"
        fill="${cCore}" filter="url(#vil-shadow-${uid})" stroke="${isExam ? '#94a3b8' : '#fecdd3'}" stroke-width="2"/>
  `;

  // ── 3. الوعاء اللمفاوي (البلغمي) المركزي (Central Lacteal) ─────
  content += `<g opacity="${opLacteal}">
    <!-- الوعاء البلغمي المركزي الصاعد في قلب الزغابة -->
    <path d="M 466 450 L 466 160 C 466 142, 494 142, 494 160 L 494 450 Z"
          fill="url(#lactealGrad-${uid})" filter="url(#vil-shadow-${uid})" stroke="${isExam ? '#475569' : '#ca8a04'}" stroke-width="2.2"/>
    <!-- لمعان أسطواني -->
    <line x1="477" y1="165" x2="477" y2="445" stroke="#ffffff" stroke-width="2.5" opacity="0.75" stroke-linecap="round"/>
    <!-- امتداد الوعاء اللمفاوي القاعدي نحو الجهاز اللمفاوي العام -->
    <path d="M 466 450 C 466 470, 450 480, 420 485" stroke="${isExam ? '#475569' : '#ca8a04'}" stroke-width="6" fill="none"/>
  </g>`;

  // ── 4. الشبكة الشعرية الدموية (Blood Capillary Network) ────────
  content += `<g opacity="${opCap}">
    <!-- الشريان الوارد (Arteriole - أحمر) على اليسار -->
    <path d="M 320 485 C 380 480, 430 460, 435 440 L 435 220"
          stroke="url(#arteryGrad-${uid})" stroke-width="5.5" fill="none" stroke-linecap="round"/>

    <!-- الوريد الصادر (Venule - أزرق) على اليمين -->
    <path d="M 525 220 L 525 440 C 530 460, 580 480, 640 485"
          stroke="url(#veinGrad-${uid})" stroke-width="6" fill="none" stroke-linecap="round"/>

    <!-- شبكة الشعيرات الدموية الملتفة بين الشريان والوريد حول الوعاء البلغمي -->
    <!-- قوس علوي 1 -->
    <path d="M 435 200 C 435 150, 525 150, 525 200" stroke="${isExam ? '#475569' : '#dc2626'}" stroke-width="3" fill="none"/>
    <!-- حلقات متبادلة تغلف الوعاء البلغمي -->
    <path d="M 435 240 Q 480 225, 525 240" stroke="${isExam ? '#475569' : '#ef4444'}" stroke-width="2.8" fill="none"/>
    <path d="M 435 280 Q 480 295, 525 280" stroke="${isExam ? '#334155' : '#8b5cf6'}" stroke-width="2.8" fill="none"/>
    <path d="M 435 320 Q 480 305, 525 320" stroke="${isExam ? '#334155' : '#6366f1'}" stroke-width="2.8" fill="none"/>
    <path d="M 435 360 Q 480 375, 525 360" stroke="${isExam ? '#1e293b' : '#3b82f6'}" stroke-width="2.8" fill="none"/>
    <path d="M 435 400 Q 480 385, 525 400" stroke="${isExam ? '#1e293b' : '#2563eb'}" stroke-width="2.8" fill="none"/>

    <!-- تفريعات تشابكية شعرية -->
    <line x1="435" y1="260" x2="455" y2="300" stroke="${isExam ? '#475569' : '#dc2626'}" stroke-width="1.8"/>
    <line x1="525" y1="260" x2="505" y2="300" stroke="${isExam ? '#1e293b' : '#2563eb'}" stroke-width="1.8"/>
    <line x1="445" y1="340" x2="465" y2="380" stroke="${isExam ? '#334155' : '#6366f1'}" stroke-width="1.8"/>
    <line x1="515" y1="340" x2="495" y2="380" stroke="${isExam ? '#1e293b' : '#2563eb'}" stroke-width="1.8"/>
  </g>`;

  // ── 5. الظهارة المعوية والخلايا الكأسية (Intestinal Epithelium) ─
  content += `<g opacity="${opEpi}">
    <!-- الغشاء القاعدي -->
    <path d="M 370 450 C 370 300, 385 140, 480 90 C 575 140, 590 300, 590 450"
          fill="none" stroke="${isExam ? '#475569' : '#fb923c'}" stroke-width="2"/>

    <!-- شريط الحافة الفرشاتية المتوهج (Microvilli Brush Border) على السطح الخارجي -->
    <path d="M 350 450 C 350 280, 365 120, 480 65 C 595 120, 610 280, 610 450"
          fill="none" stroke="${isExam ? '#94a3b8' : '#fed7aa'}" stroke-width="18" opacity="0.6"/>
    <path d="M 346 450 C 346 280, 361 115, 480 60 C 599 115, 614 280, 614 450"
          fill="none" stroke="${isExam ? '#475569' : '#f97316'}" stroke-width="2.5" stroke-dasharray="2,3"/>

    <!-- صف من الخلايا العمودية المعوية مع أنويتها البنفسجية -->
    <g>`;
    const cellSteps = 22;
    for (let i = 0; i <= cellSteps; i++) {
      const t = i / cellSteps;
      // استيفاء إحداثيات محيط الزغابة
      let px = 0;
      let py = 0;
      if (t <= 0.5) {
        const u = t * 2;
        px = 370 + (480 - 370) * Math.sin((u * Math.PI) / 2);
        py = 450 - (450 - 90) * Math.sin((u * Math.PI) / 2);
      } else {
        const u = (t - 0.5) * 2;
        px = 480 + (590 - 480) * (1 - Math.cos((u * Math.PI) / 2));
        py = 90 + (450 - 90) * (1 - Math.cos((u * Math.PI) / 2));
      }

      // هل هي خلية كأسية مفرزة للمخاط؟
      const isGoblet = i === 4 || i === 8 || i === 14 || i === 18;

      if (isGoblet) {
        content += `<circle cx="${px}" cy="${py}" r="7.5" fill="${isExam ? '#cbd5e1' : '#38bdf8'}" stroke="${isExam ? '#475569' : '#0284c7'}" stroke-width="1.5"/>
        <circle cx="${px}" cy="${py}" r="3" fill="#ffffff"/>`;
      } else {
        content += `<circle cx="${px}" cy="${py}" r="6.5" fill="${cEpiCell}" stroke="${isExam ? '#64748b' : '#f97316'}" stroke-width="1"/>
        <ellipse cx="${px}" cy="${py}" rx="2" ry="3.5" fill="${cNucleus}"/>`;
      }
    }
    content += `</g>
  </g>`;

  // ── 6. تدفق وامتصاص المغذيات (Nutrient Flow Dynamics) ──────────
  if (showFlow) {
    content += `
    <g>
      <!-- جسيمات المغذيات في لمعة المعي الدقيق -->
      <circle cx="280" cy="200" r="4.5" fill="#f59e0b"/>
      <circle cx="310" cy="140" r="3.5" fill="#10b981"/>
      <circle cx="330" cy="250" r="4" fill="#ef4444"/>
      <circle cx="650" cy="180" r="4.5" fill="#10b981"/>
      <circle cx="630" cy="260" r="3.5" fill="#f59e0b"/>
      <circle cx="660" cy="120" r="4" fill="#3b82f6"/>

      <!-- أسهم مسار الامتصاص عبر الخلايا نحو الوعاء البلغمي (أحماض دسمة + غليسيرول) -->
      <g stroke="#16a34a" stroke-width="2" fill="#16a34a">
        <!-- يسار إلى الوعاء البلغمي -->
        <line x1="310" y1="210" x2="350" y2="210" stroke-dasharray="3,2"/>
        <polygon points="352,210 345,206 345,214"/>
        <line x1="375" y1="210" x2="460" y2="210" stroke-dasharray="4,3"/>
        <polygon points="463,210 455,206 455,214"/>

        <!-- يمين إلى الوعاء البلغمي -->
        <line x1="650" y1="230" x2="610" y2="230" stroke-dasharray="3,2"/>
        <polygon points="607,230 615,226 615,234"/>
        <line x1="585" y1="230" x2="500" y2="230" stroke-dasharray="4,3"/>
        <polygon points="497,230 505,226 505,234"/>
      </g>

      <!-- بطاقة توضيح طريقي الامتصاص (سند تعليمي مهم لـ BEM) -->
      <g transform="translate(700, 360)" filter="url(#vil-callout-${uid})">
        <rect x="0" y="0" width="180" height="56" rx="8" fill="#ffffff" stroke="${cCalloutStroke}" stroke-width="1.2"/>
        <circle cx="16" cy="18" r="5" fill="#ca8a04"/>
        <text x="28" y="22" font-size="10" font-weight="bold" fill="${cTextMain}">طريق لمفاوي (بلغمي): دسم</text>
        <circle cx="16" cy="38" r="5" fill="#dc2626"/>
        <text x="28" y="42" font-size="10" font-weight="bold" fill="${cTextMain}">طريق دموي: سكريات + بروتين</text>
      </g>
    </g>`;
  }

  // ── 7. التأشيرات وبطاقات الشرح (Callouts) ──────────────────────
  if (mode !== 'none') {
    interface VillusLabelItem {
      num: number;
      ar: string;
      sub: string;
      target: [number, number];
      card: [number, number];
    }

    const labels: VillusLabelItem[] = [
      {
        num: 1,
        ar: 'ظهارة معوية مع حافة فرشاتية',
        sub: 'Intestinal Epithelium & Microvilli',
        target: [405, 110],
        card: [210, 60],
      },
      {
        num: 2,
        ar: 'خلايا كأسية مفرزة للمخاط',
        sub: 'Goblet Cells',
        target: [375, 235],
        card: [180, 160],
      },
      {
        num: 3,
        ar: 'وعاء لمفاوي (بلغمي) مركزي',
        sub: 'Central Lacteal',
        target: [480, 145],
        card: [480, 30],
      },
      {
        num: 4,
        ar: 'شبكة شعيرات دموية',
        sub: 'Capillary Network',
        target: [480, 305],
        card: [750, 200],
      },
      {
        num: 5,
        ar: 'شريان وارد (دم شرياني)',
        sub: 'Arteriole',
        target: [435, 430],
        card: [220, 430],
      },
      {
        num: 6,
        ar: 'وريد صادر (دم محمل بالمغذيات)',
        sub: 'Venule',
        target: [530, 430],
        card: [750, 430],
      },
      {
        num: 7,
        ar: 'لمعة المعي الدقيق',
        sub: 'Intestinal Lumen',
        target: [595, 100],
        card: [750, 60],
      },
    ];

    content += `<g class="bio-callouts">`;
    for (const item of labels) {
      const [tx, ty] = item.target;
      const [cxCard, cyCard] = item.card;

      if (mode === 'numbered') {
        content += `<!-- مؤشر مرقم [${item.num}] -->
        <line x1="${cxCard}" y1="${cyCard}" x2="${tx}" y2="${ty}" stroke="${cCalloutStroke}" stroke-width="1.6" stroke-dasharray="3,3" opacity="0.85"/>
        <circle cx="${tx}" cy="${ty}" r="4" fill="${cPointerDot}"/>
        <g filter="url(#vil-callout-${uid})">
          <circle cx="${cxCard}" cy="${cyCard}" r="15" fill="${cCalloutBg}" stroke="${cPointerDot}" stroke-width="2.2"/>
          <text x="${cxCard}" y="${cyCard + 5}" font-size="13" font-weight="bold" fill="${cPointerDot}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${item.num}</text>
        </g>`;
      } else {
        const cardW = 175;
        const cardH = 36;
        const rx = cxCard - cardW / 2;
        const ry = cyCard - cardH / 2;

        content += `<!-- بطاقة شرح [${item.ar}] -->
        <line x1="${cxCard}" y1="${cyCard > ty ? ry : ry + cardH}" x2="${tx}" y2="${ty}" stroke="${cCalloutStroke}" stroke-width="1.4" opacity="0.75"/>
        <circle cx="${tx}" cy="${ty}" r="3.5" fill="${cPointerDot}"/>
        <g filter="url(#vil-callout-${uid})">
          <rect x="${rx}" y="${ry}" width="${cardW}" height="${cardH}" rx="10" fill="${cCalloutBg}" stroke="${cCalloutStroke}" stroke-width="1.2"/>
          <text x="${cxCard}" y="${cyCard - 3}" font-size="11.5" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(item.ar)}</text>
          <text x="${cxCard}" y="${cyCard + 11}" font-size="9.5" font-weight="500" fill="${cTextSub}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(item.sub)}</text>
        </g>`;
      }
    }
    content += `</g>`;
  }

  // عنوان توضيحي أسفل الرسم
  if (spec.caption) {
    content += `<text x="${W_VIL / 2}" y="${H_VIL - 16}" font-size="14" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
  }

  return wrapSvg(defs + content, W_VIL, H_VIL, spec.caption ?? 'رسم تخطيطي ومجسم لبنية الزغابة المعوية ومقر الامتصاص', opts);
}

// ------------------------------------------------------------
// تصيير المشبك العصبي والنقل الكيميائي (Synapse Renderer)
// ------------------------------------------------------------

export function renderSynapse(spec: SynapseSpec, opts?: RenderOptions): string {
  const theme = spec.theme ?? 'natural';
  const mode = spec.labelsMode ?? 'full';
  const focus = spec.focus ?? 'all';
  const showImpulse = spec.showImpulseDirection ?? true;

  const W_SYN = 960;
  const H_SYN = 540;
  const uid = Math.random().toString(36).substring(2, 8);

  const isExam = theme === 'exam_print';
  const isVibrant = theme === 'vibrant';

  // فحص الشفافية عند التركيز
  const opPre = focus === 'all' || focus === 'presynaptic' ? '1' : '0.35';
  const opVes = focus === 'all' || focus === 'vesicles' ? '1' : '0.35';
  const opNt = focus === 'all' || focus === 'neurotransmitter' ? '1' : '0.35';
  const opCleft = focus === 'all' || focus === 'cleft' ? '1' : '0.35';
  const opPost = focus === 'all' || focus === 'postsynaptic' ? '1' : '0.35';
  const opRec = focus === 'all' || focus === 'receptors' ? '1' : '0.35';
  const opMito = focus === 'all' || focus === 'mitochondria' ? '1' : '0.35';

  const cTextMain = isExam ? '#000000' : '#0f172a';
  const cTextSub = isExam ? '#334155' : '#64748b';
  const cPointerDot = isExam ? '#000000' : '#ea580c';
  const cCalloutBg = '#ffffff';
  const cCalloutStroke = isExam ? '#334155' : '#cbd5e1';

  // الألوان
  const cPreBulb = isExam ? '#f1f5f9' : (isVibrant ? '#e0f2fe' : '#eff6ff');
  const cPreStroke = isExam ? '#475569' : '#0284c7';
  const cPostCell = isExam ? '#f8fafc' : (isVibrant ? '#fef3c7' : '#fffbeb');
  const cPostStroke = isExam ? '#475569' : '#d97706';
  const cVesicle = isExam ? '#94a3b8' : (isVibrant ? '#38bdf8' : '#0ea5e9');
  const cNt = isExam ? '#1e293b' : '#dc2626';
  const cReceptor = isExam ? '#64748b' : '#10b981';

  let defs = `<defs>
    <filter id="syn-shadow-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#000000" flood-opacity="0.16"/>
    </filter>
    <filter id="syn-callout-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.12"/>
    </filter>

    <!-- تدرج كروي للحويصلات المشبكية -->
    <radialGradient id="vesicleGrad-${uid}" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="${cVesicle}"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </radialGradient>

    <!-- تدرج الميتوكندريا -->
    <linearGradient id="mitoGrad-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fdba74"/>
      <stop offset="60%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#9a3412"/>
    </linearGradient>
  </defs>`;

  let content = '';

  // ── 1. الزر الانتهائي قبل المشبكي (Presynaptic Terminal & Membrane) ─
  content += `<g opacity="${opPre}">
    <!-- المحور العصبي المتوسع إلى زر مشبكي كبير -->
    <path d="M 450 40 L 450 90
             C 450 140, 320 160, 320 230
             C 320 285, 390 285, 480 285
             C 570 285, 640 285, 640 230
             C 640 160, 510 140, 510 90
             L 510 40 Z"
          fill="${cPreBulb}" filter="url(#syn-shadow-${uid})" stroke="${cPreStroke}" stroke-width="4"/>

    <!-- طبقة الفوسفوليبيد للغشاء قبل المشبكي -->
    <path d="M 335 285 C 400 285, 560 285, 625 285" stroke="${isExam ? '#334155' : '#0369a1'}" stroke-width="7" stroke-linecap="round"/>
    <path d="M 335 285 C 400 285, 560 285, 625 285" stroke="#ffffff" stroke-width="1.8" stroke-dasharray="3,2"/>
  </g>`;

  // ── 2. الميتوكندريا الحيوية (Mitochondria) داخل الزر ─────────
  content += `<g opacity="${opMito}">
    <!-- ميتوكندريا 1 يسار -->
    <g transform="translate(370, 130) rotate(-25)">
      <rect x="0" y="0" width="70" height="38" rx="19" fill="url(#mitoGrad-${uid})" filter="url(#syn-shadow-${uid})" stroke="#c2410c" stroke-width="1.5"/>
      <!-- تلافيف داخلية (Cristae) -->
      <path d="M 12 19 Q 20 8, 28 19 T 44 19 T 58 19" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.8"/>
    </g>
    <!-- ميتوكندريا 2 يمين -->
    <g transform="translate(520, 130) rotate(25)">
      <rect x="0" y="0" width="70" height="38" rx="19" fill="url(#mitoGrad-${uid})" filter="url(#syn-shadow-${uid})" stroke="#c2410c" stroke-width="1.5"/>
      <path d="M 12 19 Q 20 8, 28 19 T 44 19 T 58 19" stroke="#ffffff" stroke-width="2" fill="none" opacity="0.8"/>
    </g>
  </g>`;

  // ── 3. الحويصلات المشبكية (Synaptic Vesicles) ────────────────
  content += `<g opacity="${opVes}">
    <!-- حويصلات كروية 3D في السيتوبلازم -->
    <circle cx="430" cy="180" r="14" fill="url(#vesicleGrad-${uid})" filter="url(#syn-shadow-${uid})"/>
    <circle cx="470" cy="165" r="14" fill="url(#vesicleGrad-${uid})" filter="url(#syn-shadow-${uid})"/>
    <circle cx="510" cy="185" r="14" fill="url(#vesicleGrad-${uid})" filter="url(#syn-shadow-${uid})"/>
    <circle cx="390" cy="220" r="13" fill="url(#vesicleGrad-${uid})" filter="url(#syn-shadow-${uid})"/>
    <circle cx="560" cy="215" r="13" fill="url(#vesicleGrad-${uid})" filter="url(#syn-shadow-${uid})"/>

    <!-- حويصلات تقترب من الغشاء في المنطقة النشطة (Active Zone) -->
    <circle cx="440" cy="245" r="13.5" fill="url(#vesicleGrad-${uid})"/>
    <circle cx="520" cy="245" r="13.5" fill="url(#vesicleGrad-${uid})"/>

    <!-- حويصلة في طور الالتحام الغشائي والإفراغ الخلوي (Exocytosis) -->
    <path d="M 470 285 C 470 265, 490 265, 490 285" fill="${cPreBulb}" stroke="${cPreStroke}" stroke-width="3"/>
    <circle cx="480" cy="272" r="4" fill="${cNt}"/>
    <circle cx="474" cy="278" r="3.5" fill="${cNt}"/>
    <circle cx="486" cy="278" r="3.5" fill="${cNt}"/>
  </g>`;

  // ── 4. الشق المشبكي والوسيط الكيميائي (Synaptic Cleft & Neurotransmitter)
  content += `<g opacity="${opCleft}">
    <!-- منطقة الشق المشبكي (20-30nm) بين 285 و 340 -->
    <rect x="300" y="288" width="360" height="48" fill="${isExam ? '#f1f5f9' : '#f0fdf4'}" opacity="0.45"/>

    <!-- جزيئات الوسيط الكيميائي (الأسيتيل كولين) تسبح في الشق المشبكي -->
    <g opacity="${opNt}">
      <circle cx="480" cy="298" r="4" fill="${cNt}"/>
      <circle cx="465" cy="305" r="4" fill="${cNt}"/>
      <circle cx="495" cy="308" r="4" fill="${cNt}"/>
      <circle cx="440" cy="315" r="4" fill="${cNt}"/>
      <circle cx="520" cy="315" r="4" fill="${cNt}"/>
      <circle cx="390" cy="320" r="3.8" fill="${cNt}"/>
      <circle cx="570" cy="320" r="3.8" fill="${cNt}"/>
      <circle cx="475" cy="325" r="4" fill="${cNt}"/>
      <circle cx="505" cy="325" r="4" fill="${cNt}"/>
    </g>
  </g>`;

  // ── 5. الغشاء بعد المشبكي والمستقبلات النوعية (Postsynaptic Membrane)
  content += `<g opacity="${opPost}">
    <!-- الغشاء والخلية بعد المشبكية في الأسفل -->
    <path d="M 280 340 C 380 340, 580 340, 680 340
             C 680 430, 640 450, 480 450
             C 320 450, 280 430, 280 340 Z"
          fill="${cPostCell}" filter="url(#syn-shadow-${uid})" stroke="${cPostStroke}" stroke-width="4"/>

    <!-- كثافة بعد مشبكية (Postsynaptic Density) -->
    <path d="M 310 346 C 390 346, 570 346, 650 346" stroke="${isExam ? '#64748b' : '#b45309'}" stroke-width="8" stroke-linecap="round"/>
  </g>`;

  // المستقبلات الغشائية النوعية (Receptors)
  content += `<g opacity="${opRec}">
    <!-- مستقبلات غشائية نوعية بتجويف قفل ومفتاح -->
    <!-- مستقبل 1 (فارغ) -->
    <g transform="translate(360, 332)">
      <path d="M -8 8 L -8 -4 L -3 -4 L 0 2 L 3 -4 L 8 -4 L 8 8 Z" fill="${cReceptor}" stroke="#065f46" stroke-width="1.2"/>
    </g>
    <!-- مستقبل 2 (مثبت عليه جزيء وسيط كيميائي) -->
    <g transform="translate(420, 332)">
      <path d="M -8 8 L -8 -4 L -3 -4 L 0 2 L 3 -4 L 8 -4 L 8 8 Z" fill="${cReceptor}" stroke="#065f46" stroke-width="1.2"/>
      <circle cx="0" cy="-3" r="4.5" fill="${cNt}"/>
    </g>
    <!-- مستقبل 3 (فارغ) -->
    <g transform="translate(480, 332)">
      <path d="M -8 8 L -8 -4 L -3 -4 L 0 2 L 3 -4 L 8 -4 L 8 8 Z" fill="${cReceptor}" stroke="#065f46" stroke-width="1.2"/>
    </g>
    <!-- مستقبل 4 (مثبت عليه جزيء وسيط كيميائي) -->
    <g transform="translate(540, 332)">
      <path d="M -8 8 L -8 -4 L -3 -4 L 0 2 L 3 -4 L 8 -4 L 8 8 Z" fill="${cReceptor}" stroke="#065f46" stroke-width="1.2"/>
      <circle cx="0" cy="-3" r="4.5" fill="${cNt}"/>
    </g>
    <!-- مستقبل 5 (فارغ) -->
    <g transform="translate(600, 332)">
      <path d="M -8 8 L -8 -4 L -3 -4 L 0 2 L 3 -4 L 8 -4 L 8 8 Z" fill="${cReceptor}" stroke="#065f46" stroke-width="1.2"/>
    </g>
  </g>`;

  // ── 6. سهم اتجاه انتقال السيالة العصبية (Impulse Direction) ───
  if (showImpulse) {
    content += `
    <g transform="translate(480, 45)">
      <line x1="0" y1="0" x2="0" y2="50" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
      <polygon points="0,58 -7,44 7,44" fill="#f59e0b"/>
      <!-- بطاقة الاتجاه -->
      <rect x="20" y="12" width="170" height="24" rx="6" fill="${cCalloutBg}" stroke="#f59e0b" stroke-width="1.2" filter="url(#syn-callout-${uid})"/>
      <text x="105" y="28" font-size="10" font-weight="bold" fill="#b45309" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">اتجاه السيالة العصبية ↓</text>
    </g>`;
  }

  // ── 7. التأشيرات وبطاقات الشرح (Callouts) ──────────────────────
  if (mode !== 'none') {
    interface SynapseLabelItem {
      num: number;
      ar: string;
      sub: string;
      target: [number, number];
      card: [number, number];
    }

    const labels: SynapseLabelItem[] = [
      {
        num: 1,
        ar: 'زر انتهائي وغشاء قبل مشبكي',
        sub: 'Presynaptic Terminal & Membrane',
        target: [340, 200],
        card: [160, 180],
      },
      {
        num: 2,
        ar: 'حويصلات مشبكية',
        sub: 'Synaptic Vesicles',
        target: [430, 180],
        card: [230, 110],
      },
      {
        num: 3,
        ar: 'وسيط كيميائي عصبي (أسيتيل كولين)',
        sub: 'Neurotransmitter (ACh)',
        target: [495, 308],
        card: [760, 280],
      },
      {
        num: 4,
        ar: 'شق مشبكي',
        sub: 'Synaptic Cleft',
        target: [330, 310],
        card: [160, 310],
      },
      {
        num: 5,
        ar: 'غشاء بعد مشبكي',
        sub: 'Postsynaptic Membrane',
        target: [330, 365],
        card: [160, 420],
      },
      {
        num: 6,
        ar: 'مستقبلات غشائية نوعية',
        sub: 'Specific Receptors',
        target: [540, 335],
        card: [760, 350],
      },
      {
        num: 7,
        ar: 'ميتوكندريا (توليد الطاقة)',
        sub: 'Mitochondria',
        target: [570, 140],
        card: [750, 130],
      },
    ];

    content += `<g class="bio-callouts">`;
    for (const item of labels) {
      const [tx, ty] = item.target;
      const [cxCard, cyCard] = item.card;

      if (mode === 'numbered') {
        content += `<!-- مؤشر مرقم [${item.num}] -->
        <line x1="${cxCard}" y1="${cyCard}" x2="${tx}" y2="${ty}" stroke="${cCalloutStroke}" stroke-width="1.6" stroke-dasharray="3,3" opacity="0.85"/>
        <circle cx="${tx}" cy="${ty}" r="4" fill="${cPointerDot}"/>
        <g filter="url(#syn-callout-${uid})">
          <circle cx="${cxCard}" cy="${cyCard}" r="15" fill="${cCalloutBg}" stroke="${cPointerDot}" stroke-width="2.2"/>
          <text x="${cxCard}" y="${cyCard + 5}" font-size="13" font-weight="bold" fill="${cPointerDot}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${item.num}</text>
        </g>`;
      } else {
        const cardW = 180;
        const cardH = 36;
        const rx = cxCard - cardW / 2;
        const ry = cyCard - cardH / 2;

        content += `<!-- بطاقة شرح [${item.ar}] -->
        <line x1="${cxCard}" y1="${cyCard > ty ? ry : ry + cardH}" x2="${tx}" y2="${ty}" stroke="${cCalloutStroke}" stroke-width="1.4" opacity="0.75"/>
        <circle cx="${tx}" cy="${ty}" r="3.5" fill="${cPointerDot}"/>
        <g filter="url(#syn-callout-${uid})">
          <rect x="${rx}" y="${ry}" width="${cardW}" height="${cardH}" rx="10" fill="${cCalloutBg}" stroke="${cCalloutStroke}" stroke-width="1.2"/>
          <text x="${cxCard}" y="${cyCard - 3}" font-size="11" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(item.ar)}</text>
          <text x="${cxCard}" y="${cyCard + 11}" font-size="9" font-weight="500" fill="${cTextSub}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(item.sub)}</text>
        </g>`;
      }
    }
    content += `</g>`;
  }

  // عنوان توضيحي أسفل الرسم
  if (spec.caption) {
    content += `<text x="${W_SYN / 2}" y="${H_SYN - 16}" font-size="14" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
  }

  return wrapSvg(defs + content, W_SYN, H_SYN, spec.caption ?? 'رسم تخطيطي ومجسم لبنية المشبك العصبي وآلية النقل الكيميائي', opts);
}

// ------------------------------------------------------------
// المُوزِّع العام لمولّد البيولوجيا
// ------------------------------------------------------------


// ------------------------------------------------------------
// مولّد رسم الجهاز الهضمي العام وملحقاته
// ------------------------------------------------------------

export function renderDigestiveSystem(spec: DigestiveSpec, opts?: RenderOptions): string {
  const W_DIG = 960;
  const H_DIG = 560;
  const uid = Math.random().toString(36).substring(2, 8);
  const theme = spec.theme ?? 'natural';
  const mode = spec.labelsMode ?? 'full';
  const focus = spec.focus ?? 'all';
  const showPath = spec.showDigestivePath !== false;
  const showGlands = spec.showGlands !== false;
  const isExam = theme === 'exam_print';

  // ألوان السمة والتظليل
  const cEsoph1 = isExam ? '#94a3b8' : theme === 'vibrant' ? '#fb7185' : '#f43f5e';
  const cEsoph2 = isExam ? '#64748b' : theme === 'vibrant' ? '#e11d48' : '#be123c';
  const cStomach1 = isExam ? '#cbd5e1' : theme === 'vibrant' ? '#fda4af' : '#fb7185';
  const cStomach2 = isExam ? '#64748b' : theme === 'vibrant' ? '#e11d48' : '#be123c';
  const cLiver1 = isExam ? '#64748b' : theme === 'vibrant' ? '#b91c1c' : '#991b1b';
  const cLiver2 = isExam ? '#475569' : theme === 'vibrant' ? '#991b1b' : '#7f1d1d';
  const cGall = isExam ? '#475569' : theme === 'vibrant' ? '#10b981' : '#059669';
  const cPancreas = isExam ? '#94a3b8' : theme === 'vibrant' ? '#f59e0b' : '#d97706';
  const cSmallInt1 = isExam ? '#cbd5e1' : theme === 'vibrant' ? '#f472b6' : '#fb7185';
  const cSmallInt2 = isExam ? '#64748b' : theme === 'vibrant' ? '#db2777' : '#e11d48';
  const cLargeInt1 = isExam ? '#94a3b8' : theme === 'vibrant' ? '#fb923c' : '#f97316';
  const cLargeInt2 = isExam ? '#475569' : theme === 'vibrant' ? '#ea580c' : '#c2410c';

  const cTextMain = '#0f172a';
  const cTextSub = isExam ? '#475569' : '#64748b';
  const cCalloutBg = '#ffffff';
  const cCalloutStroke = isExam ? '#94a3b8' : '#cbd5e1';
  const cPointerDot = isExam ? '#334155' : theme === 'vibrant' ? '#e11d48' : '#e11d48';

  // معايير التعتيم حسب التركيز
  const opMouth = focus === 'all' || focus === 'mouth' ? 1 : 0.25;
  const opEsoph = focus === 'all' || focus === 'esophagus' ? 1 : 0.25;
  const opStomach = focus === 'all' || focus === 'stomach' ? 1 : 0.25;
  const opLiver = focus === 'all' || focus === 'liver' ? 1 : 0.25;
  const opPancreas = focus === 'all' || focus === 'pancreas' ? 1 : 0.25;
  const opSmall = focus === 'all' || focus === 'small_intestine' ? 1 : 0.25;
  const opLarge = focus === 'all' || focus === 'large_intestine' ? 1 : 0.25;

  let defs = `<defs>
    <filter id="dig-shadow-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.16"/>
    </filter>
    <filter id="dig-callout-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.12"/>
    </filter>

    <linearGradient id="esophGrad-${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${cEsoph1}"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="${cEsoph2}"/>
    </linearGradient>

    <linearGradient id="stomachGrad-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${cStomach1}"/>
      <stop offset="60%" stop-color="${cStomach2}"/>
      <stop offset="100%" stop-color="${isExam ? '#475569' : '#881337'}"/>
    </linearGradient>

    <linearGradient id="liverGrad-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${cLiver1}"/>
      <stop offset="70%" stop-color="${cLiver2}"/>
      <stop offset="100%" stop-color="${isExam ? '#334155' : '#450a0a'}"/>
    </linearGradient>

    <linearGradient id="pancreasGrad-${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="40%" stop-color="${cPancreas}"/>
      <stop offset="100%" stop-color="${isExam ? '#475569' : '#b45309'}"/>
    </linearGradient>

    <linearGradient id="smallIntGrad-${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${cSmallInt1}"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="${cSmallInt2}"/>
    </linearGradient>

    <linearGradient id="largeIntGrad-${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${cLargeInt1}"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="${cLargeInt2}"/>
    </linearGradient>
  </defs>`;

  let content = '';

  // 1. خيال الجسم
  content += `<!-- خيال الجسم والرقبة الخلفي -->
  <path d="M 435 35 C 455 30, 505 30, 525 35 C 535 55, 545 80, 532 105 C 555 120, 590 145, 600 220 C 605 290, 595 440, 575 510 L 385 510 C 365 440, 355 290, 360 220 C 370 145, 405 120, 428 105 C 415 80, 425 55, 435 35 Z"
        fill="${isExam ? '#f1f5f9' : '#fff1f2'}" opacity="0.45" stroke="${isExam ? '#e2e8f0' : '#ffe4e6'}" stroke-width="2"/>`;

  // 2. التجويف الفموي والغدد اللعابية
  content += `<g opacity="${opMouth}">
    <path d="M 460 55 C 460 42, 500 42, 500 55 C 500 68, 460 68, 460 55 Z" fill="${isExam ? '#e2e8f0' : '#ffffff'}" stroke="${isExam ? '#64748b' : '#f43f5e'}" stroke-width="1.8"/>
    <path d="M 466 60 C 475 54, 488 54, 494 62 C 485 66, 472 66, 466 60 Z" fill="${isExam ? '#94a3b8' : '#fda4af'}"/>
    <text x="480" y="58" font-size="10" fill="${isExam ? '#475569' : '#be123c'}" font-weight="bold" text-anchor="middle">👄</text>
  `;

  if (showGlands) {
    content += `<!-- الغدد اللعابية الثلاث -->
    <ellipse cx="522" cy="58" rx="10" ry="14" fill="${isExam ? '#cbd5e1' : '#fde047'}" stroke="${isExam ? '#64748b' : '#d97706'}" stroke-width="1.5" filter="url(#dig-shadow-${uid})"/>
    <ellipse cx="498" cy="78" rx="8" ry="6" fill="${isExam ? '#cbd5e1' : '#fde047'}" stroke="${isExam ? '#64748b' : '#d97706'}" stroke-width="1.3"/>
    <ellipse cx="476" cy="74" rx="6" ry="4" fill="${isExam ? '#cbd5e1' : '#fde047'}" stroke="${isExam ? '#64748b' : '#d97706'}" stroke-width="1.1"/>
    <path d="M 515 62 L 498 60 M 495 73 L 488 68" stroke="${isExam ? '#64748b' : '#d97706'}" stroke-width="1.2" stroke-dasharray="2,2"/>`;
  }
  content += `</g>`;

  // 3. المريء
  content += `<g opacity="${opEsoph}">
    <path d="M 473 80 C 473 80, 480 88, 487 80 L 488 95 L 472 95 Z" fill="${isExam ? '#94a3b8' : '#fda4af'}"/>
    <path d="M 482 95 L 482 205" fill="none" stroke="url(#esophGrad-${uid})" stroke-width="13" stroke-linecap="round" filter="url(#dig-shadow-${uid})"/>
    <path d="M 480 98 L 480 202" fill="none" stroke="#ffffff" stroke-width="2.6" opacity="0.65" stroke-linecap="round"/>
  </g>`;

  // 4. الكبد والحويصل الصفراوي
  content += `<g opacity="${opLiver}">
    <path d="M 370 240 C 370 185, 410 180, 465 195 C 470 225, 465 258, 450 270 C 410 280, 375 270, 370 240 Z"
          fill="url(#liverGrad-${uid})" filter="url(#dig-shadow-${uid})" stroke="${isExam ? '#475569' : '#7f1d1d'}" stroke-width="2.2"/>
    <path d="M 385 220 C 395 195, 435 192, 455 205" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.45" stroke-linecap="round"/>
    <path d="M 435 190 C 438 215, 436 242, 432 268" fill="none" stroke="${isExam ? '#94a3b8' : '#fca5a5'}" stroke-width="2" stroke-dasharray="3,2"/>
    <path d="M 433 255 C 428 263, 429 275, 436 275 C 443 275, 445 263, 441 255 Z"
          fill="${cGall}" stroke="${isExam ? '#334155' : '#064e3b'}" stroke-width="1.8" filter="url(#dig-shadow-${uid})"/>
    <ellipse cx="436" cy="264" rx="2.5" ry="5" fill="#ffffff" opacity="0.6"/>
    <path d="M 436 275 C 440 283, 450 288, 458 290" fill="none" stroke="${cGall}" stroke-width="3" stroke-linecap="round"/>
  </g>`;

  // 5. المعدة
  content += `<g opacity="${opStomach}">
    <path d="M 478 202 C 498 190, 528 202, 532 232 C 536 270, 498 302, 464 296 C 446 292, 448 262, 460 248 C 470 236, 472 218, 478 202 Z"
          fill="url(#stomachGrad-${uid})" filter="url(#dig-shadow-${uid})" stroke="${isExam ? '#475569' : '#be123c'}" stroke-width="2.5"/>
    <path d="M 495 204 C 515 208, 524 220, 525 235" fill="none" stroke="#ffffff" stroke-width="3.2" opacity="0.6" stroke-linecap="round"/>
    <path d="M 488 222 C 496 238, 492 264, 478 280" fill="none" stroke="#ffffff" stroke-width="1.8" opacity="0.45" stroke-linecap="round"/>
    <path d="M 505 232 C 512 248, 508 268, 492 284" fill="none" stroke="#ffffff" stroke-width="1.6" opacity="0.35" stroke-linecap="round"/>
    <circle cx="462" cy="295" r="4" fill="${isExam ? '#64748b' : '#be123c'}"/>
  </g>`;

  // 6. البنكرياس والعفج
  content += `<g opacity="${opPancreas}">
    <path d="M 462 295 C 445 295, 442 320, 460 322 L 475 320" fill="none" stroke="${isExam ? '#94a3b8' : '#fda4af'}" stroke-width="10" stroke-linecap="round"/>
    <path d="M 458 284 C 480 276, 515 272, 535 278 C 538 285, 528 293, 505 291 C 485 289, 468 295, 458 284 Z"
          fill="url(#pancreasGrad-${uid})" filter="url(#dig-shadow-${uid})" stroke="${isExam ? '#475569' : '#b45309'}" stroke-width="1.8"/>
    <circle cx="478" cy="285" r="1.5" fill="${isExam ? '#475569' : '#b45309'}"/>
    <circle cx="492" cy="283" r="1.8" fill="${isExam ? '#475569' : '#b45309'}"/>
    <circle cx="508" cy="282" r="1.5" fill="${isExam ? '#475569' : '#b45309'}"/>
    <circle cx="522" cy="281" r="1.3" fill="${isExam ? '#475569' : '#b45309'}"/>
    <path d="M 526 280 L 468 288" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.8"/>
  </g>`;

  // 7. المعي الغليظ (القولون)
  content += `<g opacity="${opLarge}">
    <path d="M 405 425 C 402 435, 408 445, 404 455" fill="none" stroke="${isExam ? '#64748b' : '#c2410c'}" stroke-width="5" stroke-linecap="round"/>
    <path d="M 405 420 C 392 415, 390 395, 400 385" fill="none" stroke="url(#largeIntGrad-${uid})" stroke-width="16" stroke-linecap="round"/>
    <path d="M 400 385 C 395 355, 395 325, 402 300" fill="none" stroke="url(#largeIntGrad-${uid})" stroke-width="16" stroke-linecap="round" filter="url(#dig-shadow-${uid})"/>
    <path d="M 402 300 C 440 292, 520 292, 560 300" fill="none" stroke="url(#largeIntGrad-${uid})" stroke-width="16" stroke-linecap="round" filter="url(#dig-shadow-${uid})"/>
    <path d="M 560 300 C 566 335, 566 375, 558 410" fill="none" stroke="url(#largeIntGrad-${uid})" stroke-width="16" stroke-linecap="round" filter="url(#dig-shadow-${uid})"/>
    <path d="M 558 410 C 550 435, 510 440, 482 450" fill="none" stroke="url(#largeIntGrad-${uid})" stroke-width="15" stroke-linecap="round"/>
    <path d="M 482 450 L 482 495" fill="none" stroke="url(#largeIntGrad-${uid})" stroke-width="14" stroke-linecap="round" filter="url(#dig-shadow-${uid})"/>
    <circle cx="482" cy="502" r="5" fill="${isExam ? '#475569' : '#9a3412'}"/>
    <path d="M 398 330 Q 402 335 406 330 M 398 360 Q 402 365 406 360" stroke="#ffffff" stroke-width="1.8" opacity="0.6" fill="none"/>
    <path d="M 440 293 Q 445 297 450 293 M 480 293 Q 485 297 490 293 M 520 293 Q 525 297 530 293" stroke="#ffffff" stroke-width="1.8" opacity="0.6" fill="none"/>
    <path d="M 556 340 Q 560 345 564 340 M 556 375 Q 560 380 564 375" stroke="#ffffff" stroke-width="1.8" opacity="0.6" fill="none"/>
  </g>`;

  // 8. المعي الدقيق
  content += `<g opacity="${opSmall}">
    <path d="M 460 322 C 480 325, 520 325, 525 338 C 530 350, 480 345, 455 350 C 430 355, 435 372, 465 370 C 495 368, 525 365, 525 382 C 525 395, 490 392, 460 395 C 435 398, 440 415, 470 415 C 500 415, 520 418, 522 430 C 522 435, 480 435, 435 425 C 418 422, 405 415, 405 405"
          fill="none" stroke="url(#smallIntGrad-${uid})" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" filter="url(#dig-shadow-${uid})"/>
    <path d="M 465 324 C 485 326, 515 326, 520 336 M 460 352 C 485 348, 515 348, 520 360 M 465 372 C 490 370, 515 368, 520 380 M 465 396 C 490 394, 515 394, 518 405"
          fill="none" stroke="#ffffff" stroke-width="2.2" opacity="0.65" stroke-linecap="round"/>
  </g>`;

  // 9. مسار الهضم التمعجي
  if (showPath) {
    content += `<!-- مسار الهضم وحركة الغذاء التمعجية -->
    <g class="digestive-flow">
      <path d="M 480 65 L 482 185 C 482 205, 520 215, 520 245 C 520 275, 470 290, 460 315 C 450 335, 510 340, 500 375 C 490 405, 440 405, 420 420 C 400 415, 400 320, 415 305 C 440 295, 545 295, 555 315 L 555 405 C 550 435, 500 445, 482 460 L 482 500"
            fill="none" stroke="${isExam ? '#334155' : '#06b6d4'}" stroke-width="2.4" stroke-dasharray="6,4" opacity="0.85"/>
      <circle cx="482" cy="120" r="3.5" fill="${isExam ? '#334155' : '#06b6d4'}"/>
      <circle cx="515" cy="245" r="3.5" fill="${isExam ? '#334155' : '#06b6d4'}"/>
      <circle cx="475" cy="350" r="3.5" fill="${isExam ? '#334155' : '#06b6d4'}"/>
      <circle cx="480" cy="300" r="3.5" fill="${isExam ? '#334155' : '#06b6d4'}"/>
      <circle cx="558" cy="360" r="3.5" fill="${isExam ? '#334155' : '#06b6d4'}"/>
      <circle cx="482" cy="480" r="3.5" fill="${isExam ? '#334155' : '#06b6d4'}"/>
    </g>`;
  }

  // 10. التأشيرات
  if (mode !== 'none') {
    const labels = [
      {
        num: 1,
        ar: 'التجويف الفموي والغدد اللعابية',
        sub: 'Oral Cavity & Salivary Glands',
        target: [480, 65] as [number, number],
        card: [160, 65] as [number, number],
      },
      {
        num: 2,
        ar: 'المريء',
        sub: 'Esophagus',
        target: [482, 140] as [number, number],
        card: [160, 145] as [number, number],
      },
      {
        num: 3,
        ar: 'المعدة',
        sub: 'Stomach',
        target: [495, 235] as [number, number],
        card: [800, 230] as [number, number],
      },
      {
        num: 4,
        ar: 'الكبد والحويصل الصفراوي',
        sub: 'Liver & Gallbladder',
        target: [425, 225] as [number, number],
        card: [160, 230] as [number, number],
      },
      {
        num: 5,
        ar: 'البنكرياس (المعثكلة)',
        sub: 'Pancreas',
        target: [485, 280] as [number, number],
        card: [800, 305] as [number, number],
      },
      {
        num: 6,
        ar: 'المعي الدقيق (تلافيف الامتصاص)',
        sub: 'Small Intestine',
        target: [480, 365] as [number, number],
        card: [800, 375] as [number, number],
      },
      {
        num: 7,
        ar: 'المعي الغليظ (القولون)',
        sub: 'Large Intestine / Colon',
        target: [400, 350] as [number, number],
        card: [160, 345] as [number, number],
      },
      {
        num: 8,
        ar: 'المستقيم وفتحة الشرج',
        sub: 'Rectum & Anus',
        target: [482, 485] as [number, number],
        card: [800, 480] as [number, number],
      },
    ];

    content += `<g class="bio-callouts">`;
    for (const item of labels) {
      const [tx, ty] = item.target;
      const [cxCard, cyCard] = item.card;

      if (mode === 'numbered') {
        content += `<!-- مؤشر مرقم [${item.num}] -->
        <line x1="${cxCard}" y1="${cyCard}" x2="${tx}" y2="${ty}" stroke="${cCalloutStroke}" stroke-width="1.6" stroke-dasharray="3,3" opacity="0.85"/>
        <circle cx="${tx}" cy="${ty}" r="4" fill="${cPointerDot}"/>
        <g filter="url(#dig-callout-${uid})">
          <circle cx="${cxCard}" cy="${cyCard}" r="15" fill="${cCalloutBg}" stroke="${cPointerDot}" stroke-width="2.2"/>
          <text x="${cxCard}" y="${cyCard + 5}" font-size="13" font-weight="bold" fill="${cPointerDot}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${item.num}</text>
        </g>`;
      } else {
        const cardW = 185;
        const cardH = 36;
        const rx = cxCard - cardW / 2;
        const ry = cyCard - cardH / 2;

        content += `<!-- بطاقة شرح [${item.ar}] -->
        <line x1="${cxCard}" y1="${cyCard > ty ? ry : ry + cardH}" x2="${tx}" y2="${ty}" stroke="${cCalloutStroke}" stroke-width="1.4" opacity="0.75"/>
        <circle cx="${tx}" cy="${ty}" r="3.5" fill="${cPointerDot}"/>
        <g filter="url(#dig-callout-${uid})">
          <rect x="${rx}" y="${ry}" width="${cardW}" height="${cardH}" rx="10" fill="${cCalloutBg}" stroke="${cCalloutStroke}" stroke-width="1.2"/>
          <text x="${cxCard}" y="${cyCard - 3}" font-size="11" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(item.ar)}</text>
          <text x="${cxCard}" y="${cyCard + 11}" font-size="9" font-weight="500" fill="${cTextSub}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(item.sub)}</text>
        </g>`;
      }
    }
    content += `</g>`;
  }

  if (spec.caption) {
    content += `<text x="${W_DIG / 2}" y="${H_DIG - 14}" font-size="14" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
  }

  return wrapSvg(defs + content, W_DIG, H_DIG, spec.caption ?? 'رسم تخطيطي ومجسم لأعضاء الجهاز الهضمي العام والملحقات', opts);
}


// ------------------------------------------------------------
// مولّد رسم الجهاز البولي والإطراح وتصفية الدم
// ------------------------------------------------------------

export function renderUrinarySystem(spec: UrinarySpec, opts?: RenderOptions): string {
  const W_URI = 960;
  const H_URI = 540;
  const uid = Math.random().toString(36).substring(2, 8);
  const theme = spec.theme ?? 'natural';
  const mode = spec.labelsMode ?? 'full';
  const focus = spec.focus ?? 'all';
  const showSection = spec.showKidneySection !== false;
  const showFlow = spec.showUrineFlow !== false;
  const isExam = theme === 'exam_print';

  // الألوان
  const cKidney1 = isExam ? '#64748b' : theme === 'vibrant' ? '#b91c1c' : '#991b1b';
  const cKidney2 = isExam ? '#334155' : theme === 'vibrant' ? '#7f1d1d' : '#450a0a';
  const cAdrenal = isExam ? '#94a3b8' : '#f59e0b';
  const cAorta = isExam ? '#94a3b8' : '#ef4444';
  const cVenaCava = isExam ? '#64748b' : '#3b82f6';
  const cUreter1 = isExam ? '#cbd5e1' : '#fde047';
  const cUreter2 = isExam ? '#64748b' : '#ca8a04';
  const cBladder1 = isExam ? '#cbd5e1' : theme === 'vibrant' ? '#fda4af' : '#fb7185';
  const cBladder2 = isExam ? '#64748b' : theme === 'vibrant' ? '#e11d48' : '#be123c';

  const cTextMain = '#0f172a';
  const cTextSub = isExam ? '#475569' : '#64748b';
  const cCalloutBg = '#ffffff';
  const cCalloutStroke = isExam ? '#94a3b8' : '#cbd5e1';
  const cPointerDot = isExam ? '#334155' : theme === 'vibrant' ? '#be123c' : '#be123c';

  const opKidneys = focus === 'all' || focus === 'kidneys' || focus === 'cortex' || focus === 'medulla' ? 1 : 0.25;
  const opVessels = focus === 'all' || focus === 'vessels' ? 1 : 0.25;
  const opUreters = focus === 'all' || focus === 'ureters' ? 1 : 0.25;
  const opBladder = focus === 'all' || focus === 'bladder' ? 1 : 0.25;

  let defs = `<defs>
    <filter id="uri-shadow-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.16"/>
    </filter>
    <filter id="uri-callout-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.12"/>
    </filter>

    <linearGradient id="kidneyGrad-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${cKidney1}"/>
      <stop offset="60%" stop-color="${cKidney2}"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>

    <linearGradient id="aortaGrad-${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f87171"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="${cAorta}"/>
    </linearGradient>

    <linearGradient id="venaCavaGrad-${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="${cVenaCava}"/>
    </linearGradient>

    <linearGradient id="ureterGrad-${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${cUreter1}"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="${cUreter2}"/>
    </linearGradient>

    <linearGradient id="bladderGrad-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${cBladder1}"/>
      <stop offset="70%" stop-color="${cBladder2}"/>
      <stop offset="100%" stop-color="#881337"/>
    </linearGradient>
  </defs>`;

  let content = '';

  // خيال تجويف البطن والحوض الخلفي
  content += `<!-- تجويف البطن والحوض -->
  <path d="M 340 70 C 370 60, 590 60, 620 70 C 650 140, 660 300, 640 440 C 620 500, 340 500, 320 440 C 300 300, 310 140, 340 70 Z"
        fill="${isExam ? '#f8fafc' : '#fdf2f8'}" opacity="0.4" stroke="${isExam ? '#e2e8f0' : '#fce7f3'}" stroke-width="1.8"/>`;

  // 1. الأوعية الدموية الكبرى: الأبهر البطني والوريد الأجوف السفلي
  content += `<g opacity="${opVessels}">
    <!-- الوريد الأجوف السفلي (أزرق - يمين تشريحياً / يسار الرسم) -->
    <path d="M 458 70 L 458 410" stroke="url(#venaCavaGrad-${uid})" stroke-width="15" fill="none" stroke-linecap="round"/>
    <!-- الشريان الأبهر البطني (أحمر - يسار تشريحياً / يمين الرسم) -->
    <path d="M 482 70 L 482 410" stroke="url(#aortaGrad-${uid})" stroke-width="13" fill="none" stroke-linecap="round"/>
    <!-- تفرعات الأوعية الحرقفية للحوض والطرفين السفليين -->
    <path d="M 458 410 C 455 435, 435 450, 410 465 M 482 410 C 485 435, 505 450, 530 465"
          fill="none" stroke="${isExam ? '#64748b' : '#94a3b8'}" stroke-width="10" stroke-linecap="round"/>

    <!-- الأوعية الكلوية اليمنى (شريان ووريد) -->
    <path d="M 458 175 L 400 178" stroke="url(#venaCavaGrad-${uid})" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M 482 185 L 405 188" stroke="url(#aortaGrad-${uid})" stroke-width="8" fill="none" stroke-linecap="round"/>

    <!-- الأوعية الكلوية اليسرى (شريان ووريد) -->
    <path d="M 482 170 L 560 172" stroke="url(#aortaGrad-${uid})" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M 458 162 C 480 162, 530 160, 555 162" stroke="url(#venaCavaGrad-${uid})" stroke-width="9" fill="none" stroke-linecap="round"/>
  </g>`;

  // 2. الكلية اليمنى (كاملة ومجسمة) والغدة الكظرية
  content += `<g opacity="${opKidneys}">
    <!-- الكلية اليمنى (حبة فاصولياء مجسمة 3D) -->
    <path d="M 375 125 C 405 125, 410 160, 395 185 C 385 200, 395 220, 375 235 C 340 235, 335 125, 375 125 Z"
          fill="url(#kidneyGrad-${uid})" filter="url(#uri-shadow-${uid})" stroke="${isExam ? '#334155' : '#7f1d1d'}" stroke-width="2.2"/>
    <!-- لمعان السطح المحدب للكلية -->
    <path d="M 352 145 C 345 170, 345 200, 355 220" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.45" stroke-linecap="round"/>
    <!-- الغدة الكظرية اليمنى (قبعة هرمية ذهبية) -->
    <path d="M 360 125 C 365 105, 390 105, 395 125 Z" fill="${cAdrenal}" stroke="${isExam ? '#475569' : '#d97706'}" stroke-width="1.6" filter="url(#uri-shadow-${uid})"/>
  </g>`;

  // 3. الكلية اليسرى (مقطع تشريحي يكشف القشرة واللب والحويضة)
  content += `<g opacity="${opKidneys}">
    <!-- الغدة الكظرية اليسرى -->
    <path d="M 570 115 C 575 95, 600 95, 605 115 Z" fill="${cAdrenal}" stroke="${isExam ? '#475569' : '#d97706'}" stroke-width="1.6" filter="url(#uri-shadow-${uid})"/>

    <!-- الغلاف الخارجي للكلية اليسرى -->
    <path d="M 585 115 C 625 115, 630 225, 585 225 C 565 210, 575 190, 565 175 C 555 150, 560 115, 585 115 Z"
          fill="url(#kidneyGrad-${uid})" filter="url(#uri-shadow-${uid})" stroke="${isExam ? '#334155' : '#7f1d1d'}" stroke-width="2.2"/>
  `;

  if (showSection) {
    content += `<!-- مقطع الكلية اليسرى الداخلي -->
    <!-- 1. القشرة الكلوية (Renal Cortex) -->
    <path d="M 585 120 C 620 120, 624 220, 585 220 C 568 205, 575 190, 568 175 C 560 155, 565 120, 585 120 Z"
          fill="${isExam ? '#cbd5e1' : '#f87171'}" stroke="${isExam ? '#64748b' : '#ef4444'}" stroke-width="1"/>

    <!-- 2. اللب الكلوي وأهرامات مالبيغي (Renal Pyramids) -->
    <g class="medulla-pyramids" fill="${isExam ? '#64748b' : '#991b1b'}">
      <!-- هرم 1 علوي -->
      <polygon points="578,140 605,130 608,145"/>
      <!-- هرم 2 وسطي علوي -->
      <polygon points="578,155 612,152 612,168"/>
      <!-- هرم 3 وسطي سفلي -->
      <polygon points="578,175 612,175 610,190"/>
      <!-- هرم 4 سفلي -->
      <polygon points="578,195 605,195 598,210"/>
    </g>

    <!-- 3. الكؤوس الكلوية والحويضة (Renal Pelvis) -->
    <path d="M 578 145 C 570 155, 568 185, 578 195 L 565 178 Z" fill="${isExam ? '#f1f5f9' : '#fef08a'}" stroke="${isExam ? '#94a3b8' : '#eab308'}" stroke-width="1.5"/>
    `;
  }
  content += `</g>`;

  // 4. الحالبان (Ureters)
  content += `<g opacity="${opUreters}">
    <!-- الحالب الأيمن من حويضة الكلية اليمنى إلى المثانة -->
    <path d="M 388 200 C 400 280, 435 360, 462 410" fill="none" stroke="url(#ureterGrad-${uid})" stroke-width="6.5" stroke-linecap="round" filter="url(#uri-shadow-${uid})"/>
    <path d="M 388 200 C 400 280, 435 360, 462 410" fill="none" stroke="#ffffff" stroke-width="1.8" opacity="0.65"/>

    <!-- الحالب الأيسر من حويضة الكلية اليسرى إلى المثانة -->
    <path d="M 572 195 C 560 280, 525 360, 498 410" fill="none" stroke="url(#ureterGrad-${uid})" stroke-width="6.5" stroke-linecap="round" filter="url(#uri-shadow-${uid})"/>
    <path d="M 572 195 C 560 280, 525 360, 498 410" fill="none" stroke="#ffffff" stroke-width="1.8" opacity="0.65"/>
  </g>`;

  // 5. المثانة البولية والإحليل
  content += `<g opacity="${opBladder}">
    <!-- المثانة البولية المجسمة 3D -->
    <path d="M 480 380 C 530 380, 540 435, 495 448 C 485 450, 475 450, 465 448 C 420 435, 430 380, 480 380 Z"
          fill="url(#bladderGrad-${uid})" filter="url(#uri-shadow-${uid})" stroke="${isExam ? '#475569' : '#be123c'}" stroke-width="2.2"/>
    <!-- لمعان كروي على قبة المثانة -->
    <ellipse cx="480" cy="402" rx="22" ry="12" fill="#ffffff" opacity="0.45"/>

    <!-- الإحليل (قناة مجرى البول) -->
    <path d="M 480 448 L 480 485" fill="none" stroke="url(#ureterGrad-${uid})" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="480" cy="487" rx="3.5" ry="2" fill="${isExam ? '#475569' : '#ca8a04'}"/>
  </g>`;

  // 6. تدفق البول المتشكل (showUrineFlow)
  if (showFlow) {
    content += `<!-- قطرات وأسهم تدفق البول نحو المثانة -->
    <g class="urine-flow">
      <path d="M 392 220 C 405 290, 440 365, 465 408" fill="none" stroke="${isExam ? '#334155' : '#eab308'}" stroke-width="2" stroke-dasharray="4,4"/>
      <path d="M 568 215 C 555 290, 520 365, 495 408" fill="none" stroke="${isExam ? '#334155' : '#eab308'}" stroke-width="2" stroke-dasharray="4,4"/>
      <circle cx="410" cy="270" r="3" fill="#facc15"/>
      <circle cx="435" cy="340" r="3" fill="#facc15"/>
      <circle cx="550" cy="270" r="3" fill="#facc15"/>
      <circle cx="525" cy="340" r="3" fill="#facc15"/>
      <circle cx="480" cy="465" r="3" fill="#facc15"/>
    </g>`;
  }

  // 7. التأشيرات
  if (mode !== 'none') {
    const labels = [
      {
        num: 1,
        ar: 'الكلية (مقطع يظهر القشرة واللب)',
        sub: 'Kidney (Cortex & Medulla)',
        target: [595, 155] as [number, number],
        card: [800, 130] as [number, number],
      },
      {
        num: 2,
        ar: 'الغدة الكظرية',
        sub: 'Adrenal Gland',
        target: [375, 105] as [number, number],
        card: [160, 105] as [number, number],
      },
      {
        num: 3,
        ar: 'الشريان والوريد الكلويان',
        sub: 'Renal Artery & Vein',
        target: [450, 175] as [number, number],
        card: [160, 195] as [number, number],
      },
      {
        num: 4,
        ar: 'الحالب',
        sub: 'Ureter',
        target: [535, 280] as [number, number],
        card: [800, 270] as [number, number],
      },
      {
        num: 5,
        ar: 'المثانة البولية',
        sub: 'Urinary Bladder',
        target: [450, 420] as [number, number],
        card: [160, 410] as [number, number],
      },
      {
        num: 6,
        ar: 'الإحليل ومجرى البول',
        sub: 'Urethra',
        target: [480, 480] as [number, number],
        card: [800, 470] as [number, number],
      },
      {
        num: 7,
        ar: 'الحويضة (مقر تجمع البول)',
        sub: 'Renal Pelvis',
        target: [565, 175] as [number, number],
        card: [800, 200] as [number, number],
      },
    ];

    content += `<g class="bio-callouts">`;
    for (const item of labels) {
      const [tx, ty] = item.target;
      const [cxCard, cyCard] = item.card;

      if (mode === 'numbered') {
        content += `<!-- مؤشر مرقم [${item.num}] -->
        <line x1="${cxCard}" y1="${cyCard}" x2="${tx}" y2="${ty}" stroke="${cCalloutStroke}" stroke-width="1.6" stroke-dasharray="3,3" opacity="0.85"/>
        <circle cx="${tx}" cy="${ty}" r="4" fill="${cPointerDot}"/>
        <g filter="url(#uri-callout-${uid})">
          <circle cx="${cxCard}" cy="${cyCard}" r="15" fill="${cCalloutBg}" stroke="${cPointerDot}" stroke-width="2.2"/>
          <text x="${cxCard}" y="${cyCard + 5}" font-size="13" font-weight="bold" fill="${cPointerDot}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${item.num}</text>
        </g>`;
      } else {
        const cardW = 185;
        const cardH = 36;
        const rx = cxCard - cardW / 2;
        const ry = cyCard - cardH / 2;

        content += `<!-- بطاقة شرح [${item.ar}] -->
        <line x1="${cxCard}" y1="${cyCard > ty ? ry : ry + cardH}" x2="${tx}" y2="${ty}" stroke="${cCalloutStroke}" stroke-width="1.4" opacity="0.75"/>
        <circle cx="${tx}" cy="${ty}" r="3.5" fill="${cPointerDot}"/>
        <g filter="url(#uri-callout-${uid})">
          <rect x="${rx}" y="${ry}" width="${cardW}" height="${cardH}" rx="10" fill="${cCalloutBg}" stroke="${cCalloutStroke}" stroke-width="1.2"/>
          <text x="${cxCard}" y="${cyCard - 3}" font-size="11" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(item.ar)}</text>
          <text x="${cxCard}" y="${cyCard + 11}" font-size="9" font-weight="500" fill="${cTextSub}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(item.sub)}</text>
        </g>`;
      }
    }
    content += `</g>`;
  }

  if (spec.caption) {
    content += `<text x="${W_URI / 2}" y="${H_URI - 14}" font-size="14" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
  }

  return wrapSvg(defs + content, W_URI, H_URI, spec.caption ?? 'رسم تخطيطي ومجسم لأعضاء الجهاز البولي وتصفية الدم', opts);
}


// ------------------------------------------------------------
// مولّد رسم الجهاز الدوراني والقلب والدورتين الدمويتين
// ------------------------------------------------------------

export function renderCirculatorySystem(spec: CirculatorySpec, opts?: RenderOptions): string {
  const W_CIR = 960;
  const H_CIR = 540;
  const uid = Math.random().toString(36).substring(2, 8);
  const theme = spec.theme ?? 'natural';
  const mode = spec.labelsMode ?? 'full';
  const focus = spec.focus ?? 'all';
  const showCirc = spec.showCirculation !== false;
  const isExam = theme === 'exam_print';

  // ألوان الدم المؤكسج (أحمر) وغير المؤكسج (أزرق)
  const cOxy1 = isExam ? '#cbd5e1' : theme === 'vibrant' ? '#f87171' : '#ef4444';
  const cOxy2 = isExam ? '#64748b' : theme === 'vibrant' ? '#dc2626' : '#b91c1c';
  const cDeoxy1 = isExam ? '#94a3b8' : theme === 'vibrant' ? '#60a5fa' : '#3b82f6';
  const cDeoxy2 = isExam ? '#334155' : theme === 'vibrant' ? '#2563eb' : '#1d4ed8';

  const cTextMain = '#0f172a';
  const cTextSub = isExam ? '#475569' : '#64748b';
  const cCalloutBg = '#ffffff';
  const cCalloutStroke = isExam ? '#94a3b8' : '#cbd5e1';
  const cPointerDot = isExam ? '#334155' : '#dc2626';

  const opHeart = focus === 'all' || focus === 'heart' || focus === 'atria' || focus === 'ventricles' || focus === 'valves' ? 1 : 0.25;
  const opAorta = focus === 'all' || focus === 'aorta' ? 1 : 0.25;
  const opPulmonary = focus === 'all' || focus === 'pulmonary' ? 1 : 0.25;

  let defs = `<defs>
    <filter id="cir-shadow-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.18"/>
    </filter>
    <filter id="cir-callout-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.12"/>
    </filter>

    <linearGradient id="aortaGrad-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${cOxy1}"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="${cOxy2}"/>
    </linearGradient>

    <linearGradient id="pulmGrad-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${cDeoxy1}"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="${cDeoxy2}"/>
    </linearGradient>

    <linearGradient id="leftVentGrad-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${cOxy1}"/>
      <stop offset="70%" stop-color="${cOxy2}"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </linearGradient>

    <linearGradient id="rightVentGrad-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${cDeoxy1}"/>
      <stop offset="70%" stop-color="${cDeoxy2}"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
  </defs>`;

  let content = '';

  // 1. الدورة الدموية العامة ومخطط التبادل (خلفي)
  if (showCirc) {
    content += `<!-- مسار الدورة الدموية الرئوية (العليا) والجهازية (السفلى) -->
    <g class="circulation-loops" opacity="0.65">
      <!-- الدورة الرئوية الصغرى في الرئتين (أعلى القلب) -->
      <path d="M 480 120 C 420 50, 360 70, 380 40 C 400 20, 560 20, 580 40 C 600 70, 540 50, 480 120"
            fill="none" stroke="${isExam ? '#64748b' : '#3b82f6'}" stroke-width="2.5" stroke-dasharray="5,3"/>
      <!-- الدورة الجهازية الكبرى في أنسجة الجسم (أسفل القلب) -->
      <path d="M 480 370 C 420 440, 350 460, 370 495 C 390 515, 570 515, 590 495 C 610 460, 540 440, 480 370"
            fill="none" stroke="${isExam ? '#475569' : '#ef4444'}" stroke-width="2.5" stroke-dasharray="5,3"/>
      <text x="480" y="35" font-size="11" font-weight="bold" fill="${isExam ? '#475569' : '#2563eb'}" text-anchor="middle">التبادلات الغازية في الرئتين (أكسجة الدم)</text>
      <text x="480" y="505" font-size="11" font-weight="bold" fill="${isExam ? '#475569' : '#dc2626'}" text-anchor="middle">التبادلات في أعضاء وأنسجة الجسم (تغذية الأعضاء)</text>
    </g>`;
  }

  // 2. الأوعية الدموية الكبرى (الأبهر والجذع الرئوي والأوردة)
  content += `<g opacity="${opAorta}">
    <!-- قوس الشريان الأبهر (Aorta) المنحني المرتفع -->
    <path d="M 475 190 C 475 125, 460 95, 490 85 C 525 80, 535 120, 530 200"
          fill="none" stroke="url(#aortaGrad-${uid})" stroke-width="20" stroke-linecap="round" filter="url(#cir-shadow-${uid})"/>
    <path d="M 475 190 C 475 125, 460 95, 490 85 C 525 80, 535 120, 530 200"
          fill="none" stroke="#ffffff" stroke-width="3" opacity="0.6" stroke-linecap="round"/>

    <!-- الفروع الشريانية الرأسية الثلاثة للأبهر -->
    <path d="M 478 88 L 472 65 M 494 84 L 494 62 M 510 86 L 516 65"
          fill="none" stroke="url(#aortaGrad-${uid})" stroke-width="8" stroke-linecap="round"/>
  </g>`;

  content += `<g opacity="${opPulmonary}">
    <!-- الجذع الشرياني الرئوي (Pulmonary Trunk) المتفرع للرئتين يمنة ويسرة -->
    <path d="M 465 210 C 470 160, 485 135, 515 130"
          fill="none" stroke="url(#pulmGrad-${uid})" stroke-width="17" stroke-linecap="round" filter="url(#cir-shadow-${uid})"/>
    <!-- التفرع الرئوي الأيسر والأيمن -->
    <path d="M 495 140 C 450 140, 410 135, 390 145" fill="none" stroke="url(#pulmGrad-${uid})" stroke-width="11" stroke-linecap="round"/>
    <path d="M 505 135 C 530 135, 560 135, 580 145" fill="none" stroke="url(#pulmGrad-${uid})" stroke-width="11" stroke-linecap="round"/>

    <!-- الوريد الأجوف العلوي (SVC) على يمين القلب تشريحياً / يسار الرسم -->
    <path d="M 420 100 L 420 185" fill="none" stroke="url(#pulmGrad-${uid})" stroke-width="16" stroke-linecap="round" filter="url(#cir-shadow-${uid})"/>
    <!-- الوريد الأجوف السفلي (IVC) القادم من الأسفل -->
    <path d="M 425 320 L 425 385" fill="none" stroke="url(#pulmGrad-${uid})" stroke-width="15" stroke-linecap="round"/>

    <!-- الأوردة الرئوية الأربعة الحاملة للدم المؤكسج للأذين الأيسر -->
    <path d="M 545 180 L 575 175 M 548 192 L 578 188" fill="none" stroke="url(#aortaGrad-${uid})" stroke-width="7" stroke-linecap="round"/>
    <path d="M 412 180 L 385 175 M 415 192 L 388 188" fill="none" stroke="url(#aortaGrad-${uid})" stroke-width="7" stroke-linecap="round"/>
  </g>`;

  // 3. كتلة القلب وتجاويفه الأربعة (مقطع تشريحي أمامي شفاف)
  content += `<g opacity="${opHeart}">
    <!-- الجدار الخارجي العضلي للقلب ككل -->
    <path d="M 480 380 C 440 375, 395 330, 400 240 C 405 185, 455 185, 480 205 C 505 185, 555 185, 560 240 C 565 330, 520 375, 480 380 Z"
          fill="${isExam ? '#e2e8f0' : '#ffe4e6'}" filter="url(#cir-shadow-${uid})" stroke="${isExam ? '#64748b' : '#be123c'}" stroke-width="3"/>

    <!-- 1. الأذين الأيمن (Right Atrium - دم غير مؤكسج أزرق) -->
    <path d="M 405 210 C 405 185, 445 185, 452 215 C 452 245, 415 250, 405 210 Z"
          fill="url(#rightVentGrad-${uid})" stroke="${isExam ? '#334155' : '#1e3a8a'}" stroke-width="2"/>
    <text x="428" y="222" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">أ.أ</text>

    <!-- 2. الأذين الأيسر (Left Atrium - دم مؤكسج أحمر) -->
    <path d="M 555 210 C 555 185, 515 185, 508 215 C 508 245, 545 250, 555 210 Z"
          fill="url(#leftVentGrad-${uid})" stroke="${isExam ? '#475569' : '#881337'}" stroke-width="2"/>
    <text x="532" y="222" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">أ.ي</text>

    <!-- الحاجز العضلي السميك بين البطينين (Interventricular Septum) -->
    <path d="M 480 230 C 476 280, 474 340, 480 375 C 486 340, 484 280, 480 230 Z"
          fill="${isExam ? '#94a3b8' : '#be123c'}" stroke="${isExam ? '#475569' : '#881337'}" stroke-width="1.8"/>

    <!-- 3. البطين الأيمن (Right Ventricle - تجويف أزرق) -->
    <path d="M 415 255 C 430 250, 465 245, 472 255 C 470 300, 465 340, 450 355 C 425 340, 415 300, 415 255 Z"
          fill="url(#rightVentGrad-${uid})" stroke="${isExam ? '#334155' : '#1e3a8a'}" stroke-width="2"/>
    <text x="444" y="295" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">ب.أ</text>

    <!-- 4. البطين الأيسر (Left Ventricle - جدار عضلي أحمر فائق السماكة) -->
    <!-- سماكة جدار العضلة القلبية اليسرى -->
    <path d="M 560 255 C 565 320, 535 365, 482 378 C 498 355, 508 300, 488 255 C 520 248, 550 250, 560 255 Z"
          fill="${isExam ? '#64748b' : '#9f1239'}"/>
    <!-- تجويف البطين الأيسر -->
    <path d="M 488 255 C 508 300, 498 355, 482 378 C 520 360, 542 320, 540 255 Z"
          fill="url(#leftVentGrad-${uid})" stroke="${isExam ? '#475569' : '#881337'}" stroke-width="2"/>
    <text x="515" y="295" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">ب.ي</text>

    <!-- الصمامات القلبية (Valves): الصمام التاجي والصمام ثلاثي الشرفات -->
    <!-- صمام ثلاثي الشرفات (أيمن) -->
    <line x1="425" y1="250" x2="455" y2="250" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    <path d="M 432 250 L 436 265 M 448 250 L 444 265" stroke="#ffffff" stroke-width="1.6"/>
    <!-- صمام تاجي ثنائي الشرفات (أيسر) -->
    <line x1="505" y1="250" x2="535" y2="250" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    <path d="M 512 250 L 516 265 M 528 250 L 524 265" stroke="#ffffff" stroke-width="1.6"/>
  </g>`;

  // 4. التأشيرات
  if (mode !== 'none') {
    const labels = [
      {
        num: 1,
        ar: 'الشريان الأبهر (الأورطي)',
        sub: 'Aorta',
        target: [490, 85] as [number, number],
        card: [160, 75] as [number, number],
      },
      {
        num: 2,
        ar: 'الشريان الرئوي',
        sub: 'Pulmonary Artery',
        target: [515, 130] as [number, number],
        card: [800, 80] as [number, number],
      },
      {
        num: 3,
        ar: 'الوريد الأجوف العلوي',
        sub: 'Superior Vena Cava',
        target: [420, 140] as [number, number],
        card: [160, 155] as [number, number],
      },
      {
        num: 4,
        ar: 'الأذين الأيمن',
        sub: 'Right Atrium',
        target: [425, 215] as [number, number],
        card: [160, 230] as [number, number],
      },
      {
        num: 5,
        ar: 'البطين الأيمن',
        sub: 'Right Ventricle',
        target: [445, 295] as [number, number],
        card: [160, 320] as [number, number],
      },
      {
        num: 6,
        ar: 'البطين الأيسر (جدار عضلي سميك)',
        sub: 'Left Ventricle',
        target: [520, 305] as [number, number],
        card: [800, 320] as [number, number],
      },
      {
        num: 7,
        ar: 'الأذين الأيسر والأوردة الرئوية',
        sub: 'Left Atrium & Pulmonary Veins',
        target: [540, 205] as [number, number],
        card: [800, 205] as [number, number],
      },
      {
        num: 8,
        ar: 'الصمامات القلبية والحاجز',
        sub: 'Heart Valves & Septum',
        target: [480, 265] as [number, number],
        card: [800, 420] as [number, number],
      },
    ];

    content += `<g class="bio-callouts">`;
    for (const item of labels) {
      const [tx, ty] = item.target;
      const [cxCard, cyCard] = item.card;

      if (mode === 'numbered') {
        content += `<!-- مؤشر مرقم [${item.num}] -->
        <line x1="${cxCard}" y1="${cyCard}" x2="${tx}" y2="${ty}" stroke="${cCalloutStroke}" stroke-width="1.6" stroke-dasharray="3,3" opacity="0.85"/>
        <circle cx="${tx}" cy="${ty}" r="4" fill="${cPointerDot}"/>
        <g filter="url(#cir-callout-${uid})">
          <circle cx="${cxCard}" cy="${cyCard}" r="15" fill="${cCalloutBg}" stroke="${cPointerDot}" stroke-width="2.2"/>
          <text x="${cxCard}" y="${cyCard + 5}" font-size="13" font-weight="bold" fill="${cPointerDot}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${item.num}</text>
        </g>`;
      } else {
        const cardW = 190;
        const cardH = 36;
        const rx = cxCard - cardW / 2;
        const ry = cyCard - cardH / 2;

        content += `<!-- بطاقة شرح [${item.ar}] -->
        <line x1="${cxCard}" y1="${cyCard > ty ? ry : ry + cardH}" x2="${tx}" y2="${ty}" stroke="${cCalloutStroke}" stroke-width="1.4" opacity="0.75"/>
        <circle cx="${tx}" cy="${ty}" r="3.5" fill="${cPointerDot}"/>
        <g filter="url(#cir-callout-${uid})">
          <rect x="${rx}" y="${ry}" width="${cardW}" height="${cardH}" rx="10" fill="${cCalloutBg}" stroke="${cCalloutStroke}" stroke-width="1.2"/>
          <text x="${cxCard}" y="${cyCard - 3}" font-size="11" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(item.ar)}</text>
          <text x="${cxCard}" y="${cyCard + 11}" font-size="9" font-weight="500" fill="${cTextSub}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(item.sub)}</text>
        </g>`;
      }
    }
    content += `</g>`;
  }

  if (spec.caption) {
    content += `<text x="${W_CIR / 2}" y="${H_CIR - 14}" font-size="14" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
  }

  return wrapSvg(defs + content, W_CIR, H_CIR, spec.caption ?? 'رسم تخطيطي ومجسم للقلب والدورتين الدمويتين الصغرى والكبرى', opts);
}


// ------------------------------------------------------------
// مولّد رسم الهيكل العظمي العام والمفاصل
// ------------------------------------------------------------

export function renderSkeletalSystem(spec: SkeletalSpec, opts?: RenderOptions): string {
  const W_SKE = 960;
  const H_SKE = 560;
  const uid = Math.random().toString(36).substring(2, 8);
  const theme = spec.theme ?? 'natural';
  const mode = spec.labelsMode ?? 'full';
  const focus = spec.focus ?? 'all';
  const showJoints = spec.showJoints !== false;
  const isExam = theme === 'exam_print';

  // تدرجات لون العظام ثلاثية الأبعاد
  const cBone1 = isExam ? '#ffffff' : '#fef3c7';
  const cBone2 = isExam ? '#cbd5e1' : '#e2e8f0';
  const cBoneShadow = isExam ? '#64748b' : '#94a3b8';
  const cCartilage = isExam ? '#94a3b8' : '#38bdf8';
  const cJointGlow = isExam ? '#334155' : '#06b6d4';

  const cTextMain = '#0f172a';
  const cTextSub = isExam ? '#475569' : '#64748b';
  const cCalloutBg = '#ffffff';
  const cCalloutStroke = isExam ? '#94a3b8' : '#cbd5e1';
  const cPointerDot = isExam ? '#334155' : '#0284c7';

  const opSkull = focus === 'all' || focus === 'skull' ? 1 : 0.25;
  const opSpine = focus === 'all' || focus === 'spine' ? 1 : 0.25;
  const opRibs = focus === 'all' || focus === 'ribcage' ? 1 : 0.25;
  const opUpper = focus === 'all' || focus === 'upper_limbs' ? 1 : 0.25;
  const opPelvis = focus === 'all' || focus === 'pelvis' ? 1 : 0.25;
  const opLower = focus === 'all' || focus === 'lower_limbs' ? 1 : 0.25;

  let defs = `<defs>
    <filter id="ske-shadow-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.16"/>
    </filter>
    <filter id="ske-callout-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.12"/>
    </filter>

    <linearGradient id="boneGrad-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${cBone1}"/>
      <stop offset="60%" stop-color="${cBone2}"/>
      <stop offset="100%" stop-color="${cBoneShadow}"/>
    </linearGradient>

    <linearGradient id="boneVertGrad-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${cBone1}"/>
      <stop offset="50%" stop-color="${cBone2}"/>
      <stop offset="100%" stop-color="${cBoneShadow}"/>
    </linearGradient>
  </defs>`;

  let content = '';

  // خلفية ناعمة لخيال الجسم
  content += `<!-- خيال الجسم البشري الهادئ -->
  <path d="M 480 30 C 495 30, 508 42, 508 60 C 508 75, 498 85, 488 90 C 525 95, 575 125, 595 180 L 610 320 L 595 330 L 585 240 L 555 240 L 540 330 C 535 370, 545 450, 540 520 L 505 520 L 495 400 L 485 340 L 475 340 L 465 400 L 455 520 L 420 520 C 415 450, 425 370, 420 330 L 405 240 L 375 240 L 365 330 L 350 320 L 365 180 C 385 125, 435 95, 472 90 C 462 85, 452 75, 452 60 C 452 42, 465 30, 480 30 Z"
        fill="${isExam ? '#f8fafc' : '#f1f5f9'}" opacity="0.35" stroke="${isExam ? '#e2e8f0' : '#e2e8f0'}" stroke-width="1.5"/>`;

  // 1. الجمجمة (Skull & Mandible)
  content += `<g opacity="${opSkull}">
    <!-- قبة الجمجمة (Cranium) -->
    <path d="M 480 40 C 460 40, 455 55, 458 75 C 460 88, 470 95, 480 95 C 490 95, 500 88, 502 75 C 505 55, 500 40, 480 40 Z"
          fill="url(#boneGrad-${uid})" filter="url(#ske-shadow-${uid})" stroke="${cBoneShadow}" stroke-width="1.8"/>
    <!-- حجاج العينين (Orbits) -->
    <circle cx="472" cy="62" r="5.5" fill="#1e293b"/>
    <circle cx="488" cy="62" r="5.5" fill="#1e293b"/>
    <!-- تجويف الأنف الكمثري -->
    <polygon points="480,68 477,77 483,77" fill="#1e293b"/>
    <!-- الفك العلوي والأسنان -->
    <rect x="473" y="80" width="14" height="4" rx="1" fill="#ffffff" stroke="${cBoneShadow}" stroke-width="1"/>
    <!-- الفك السفلي (Mandible) -->
    <path d="M 466 84 C 472 94, 488 94, 494 84 Z" fill="url(#boneGrad-${uid})" stroke="${cBoneShadow}" stroke-width="1.4"/>
  </g>`;

  // 2. العمود الفقري (Vertebral Column)
  content += `<g opacity="${opSpine}">
    <!-- فقرات العنق والظهر والقطن (Vertebrae stack) -->
    <g class="spine-column" fill="url(#boneGrad-${uid})" stroke="${cBoneShadow}" stroke-width="1.2">
      <!-- فقرات عنقية -->
      <rect x="476" y="98" width="8" height="3.5" rx="1.5"/>
      <rect x="475" y="103" width="10" height="3.5" rx="1.5"/>
      <rect x="475" y="108" width="10" height="3.5" rx="1.5"/>
      <rect x="474" y="113" width="12" height="3.5" rx="1.5"/>
      <!-- فقرات ظهرية -->
      <rect x="474" y="125" width="12" height="4" rx="1.5"/>
      <rect x="473" y="132" width="14" height="4" rx="1.5"/>
      <rect x="473" y="140" width="14" height="4" rx="1.5"/>
      <rect x="473" y="148" width="14" height="4" rx="1.5"/>
      <rect x="473" y="156" width="14" height="4" rx="1.5"/>
      <rect x="473" y="164" width="14" height="4" rx="1.5"/>
      <rect x="473" y="172" width="14" height="4" rx="1.5"/>
      <rect x="473" y="180" width="14" height="4" rx="1.5"/>
      <!-- فقرات قطنية سميكة -->
      <rect x="472" y="195" width="16" height="5" rx="1.5"/>
      <rect x="471" y="203" width="18" height="5" rx="1.5"/>
      <rect x="471" y="211" width="18" height="5" rx="1.5"/>
      <rect x="470" y="219" width="20" height="5" rx="1.5"/>
      <rect x="470" y="227" width="20" height="5" rx="1.5"/>
    </g>
  </g>`;

  // 3. القفص الصدري وعظم القص (Rib Cage & Sternum)
  content += `<g opacity="${opRibs}">
    <!-- عظم القص (Sternum) المركزي -->
    <path d="M 477 122 L 483 122 L 482 170 L 480 178 L 478 170 Z"
          fill="url(#boneGrad-${uid})" filter="url(#ske-shadow-${uid})" stroke="${cBoneShadow}" stroke-width="1.5"/>

    <!-- أضلاع القفص الصدري المنحنية ثلاثية الأبعاد (7 أزواج حقيقية + كاذبة) -->
    <g fill="none" stroke="url(#boneGrad-${uid})" stroke-width="3" stroke-linecap="round" filter="url(#ske-shadow-${uid})">
      <!-- ضلع 1 -->
      <path d="M 476 128 C 455 125, 442 135, 455 145 C 468 148, 477 140, 478 135"/>
      <path d="M 484 128 C 505 125, 518 135, 505 145 C 492 148, 483 140, 482 135"/>
      <!-- ضلع 2 -->
      <path d="M 476 135 C 445 132, 435 145, 450 155 C 465 158, 477 150, 478 142"/>
      <path d="M 484 135 C 515 132, 525 145, 510 155 C 495 158, 483 150, 482 142"/>
      <!-- ضلع 3 -->
      <path d="M 476 142 C 440 140, 430 155, 448 168 C 465 170, 477 160, 478 152"/>
      <path d="M 484 142 C 520 140, 530 155, 512 168 C 495 170, 483 160, 482 152"/>
      <!-- ضلع 4 -->
      <path d="M 476 150 C 438 150, 428 168, 445 180 C 465 182, 477 170, 478 162"/>
      <path d="M 484 150 C 522 150, 532 168, 515 180 C 495 182, 483 170, 482 162"/>
      <!-- ضلع 5 و6 المقوسان -->
      <path d="M 476 160 C 435 160, 425 180, 442 195 C 462 195, 476 182, 478 172"/>
      <path d="M 484 160 C 525 160, 535 180, 518 195 C 498 195, 484 182, 482 172"/>
    </g>
    <!-- غضاريف الأضلاع المتصلة بالقص (Costal Cartilages) -->
    <g stroke="${cCartilage}" stroke-width="2" fill="none" opacity="0.75">
      <path d="M 465 145 L 478 135 M 495 145 L 482 135"/>
      <path d="M 462 156 L 478 143 M 498 156 L 482 143"/>
      <path d="M 460 168 L 478 153 M 500 168 L 482 153"/>
    </g>
  </g>`;

  // 4. حزام الكتف والطرفان العلويان (Clavicles, Scapula, Arms)
  content += `<g opacity="${opUpper}">
    <!-- الترقوتان (Clavicles) -->
    <path d="M 477 116 C 455 114, 435 120, 422 125" fill="none" stroke="url(#boneGrad-${uid})" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M 483 116 C 505 114, 525 120, 538 125" fill="none" stroke="url(#boneGrad-${uid})" stroke-width="4.5" stroke-linecap="round"/>

    <!-- لوحا الكتف (Scapulae) خلف الظهر -->
    <polygon points="418,128 412,158 430,148" fill="url(#boneGrad-${uid})" stroke="${cBoneShadow}" stroke-width="1.2"/>
    <polygon points="542,128 548,158 530,148" fill="url(#boneGrad-${uid})" stroke="${cBoneShadow}" stroke-width="1.2"/>

    <!-- عظم العضد (Humerus) - يمنة ويسرة -->
    <path d="M 418 132 L 398 215" fill="none" stroke="url(#boneGrad-${uid})" stroke-width="7.5" stroke-linecap="round" filter="url(#ske-shadow-${uid})"/>
    <path d="M 542 132 L 562 215" fill="none" stroke="url(#boneGrad-${uid})" stroke-width="7.5" stroke-linecap="round" filter="url(#ske-shadow-${uid})"/>

    <!-- عظما الساعد: الزند والكعبرة (Radius & Ulna) -->
    <path d="M 396 220 L 380 295 M 400 220 L 386 295" fill="none" stroke="url(#boneGrad-${uid})" stroke-width="4" stroke-linecap="round"/>
    <path d="M 564 220 L 580 295 M 560 220 L 574 295" fill="none" stroke="url(#boneGrad-${uid})" stroke-width="4" stroke-linecap="round"/>

    <!-- عظام اليد والأصابع (Carpals, Metacarpals, Phalanges) -->
    <ellipse cx="383" cy="302" rx="6" ry="4" fill="url(#boneGrad-${uid})"/>
    <path d="M 380 306 L 375 325 M 383 306 L 381 328 M 386 306 L 388 325" stroke="url(#boneGrad-${uid})" stroke-width="2" stroke-linecap="round"/>

    <ellipse cx="577" cy="302" rx="6" ry="4" fill="url(#boneGrad-${uid})"/>
    <path d="M 574 306 L 572 325 M 577 306 L 579 328 M 580 306 L 585 325" stroke="url(#boneGrad-${uid})" stroke-width="2" stroke-linecap="round"/>
  </g>`;

  // 5. عظام الحوض (Pelvis)
  content += `<g opacity="${opPelvis}">
    <!-- عظام الحوض والحرقة (Ilium, Sacrum, Pubis) -->
    <path d="M 445 235 C 430 240, 432 275, 452 285 C 465 292, 475 288, 480 282 C 485 288, 495 292, 508 285 C 528 275, 530 240, 515 235 C 498 238, 462 238, 445 235 Z"
          fill="url(#boneGrad-${uid})" filter="url(#ske-shadow-${uid})" stroke="${cBoneShadow}" stroke-width="2"/>
    <!-- فتحتا الحوض السداديتان (Obturator Foramen) -->
    <ellipse cx="465" cy="278" rx="6.5" ry="8" fill="#1e293b"/>
    <ellipse cx="495" cy="278" rx="6.5" ry="8" fill="#1e293b"/>
    <!-- عظم العجز والعصعص (Sacrum & Coccyx) -->
    <polygon points="480,240 474,270 486,270" fill="url(#boneGrad-${uid})" stroke="${cBoneShadow}" stroke-width="1.2"/>
  </g>`;

  // 6. الطرفان السفليان (Lower Limbs: Femur, Patella, Tibia, Fibula, Feet)
  content += `<g opacity="${opLower}">
    <!-- عظم الفخذ الأيمن والأيسر (Femur) - أطول وأقوى عظام الجسم -->
    <path d="M 452 285 L 444 385" fill="none" stroke="url(#boneGrad-${uid})" stroke-width="10" stroke-linecap="round" filter="url(#ske-shadow-${uid})"/>
    <path d="M 508 285 L 516 385" fill="none" stroke="url(#boneGrad-${uid})" stroke-width="10" stroke-linecap="round" filter="url(#ske-shadow-${uid})"/>

    <!-- مفصل الركبة والرضفة (Patella) -->
    <ellipse cx="444" cy="392" rx="6.5" ry="5.5" fill="url(#boneGrad-${uid})" stroke="${cBoneShadow}" stroke-width="1.5"/>
    <ellipse cx="516" cy="392" rx="6.5" ry="5.5" fill="url(#boneGrad-${uid})" stroke="${cBoneShadow}" stroke-width="1.5"/>

    <!-- عظما الساق: القصبة الكبرى والشظية الصغرى (Tibia & Fibula) -->
    <!-- الساق اليمنى -->
    <path d="M 444 398 L 442 485" fill="none" stroke="url(#boneGrad-${uid})" stroke-width="7" stroke-linecap="round"/>
    <path d="M 436 405 L 434 480" fill="none" stroke="url(#boneGrad-${uid})" stroke-width="3" stroke-linecap="round"/>
    <!-- الساق اليسرى -->
    <path d="M 516 398 L 518 485" fill="none" stroke="url(#boneGrad-${uid})" stroke-width="7" stroke-linecap="round"/>
    <path d="M 524 405 L 526 480" fill="none" stroke="url(#boneGrad-${uid})" stroke-width="3" stroke-linecap="round"/>

    <!-- عظام القدم وأصابعها (Tarsals, Metatarsals, Phalanges) -->
    <path d="M 442 486 C 438 495, 430 502, 420 505" fill="none" stroke="url(#boneGrad-${uid})" stroke-width="6.5" stroke-linecap="round"/>
    <path d="M 518 486 C 522 495, 530 502, 540 505" fill="none" stroke="url(#boneGrad-${uid})" stroke-width="6.5" stroke-linecap="round"/>
  </g>`;

  // 7. إبراز المفاصل الزلالية الرئيسية (showJoints)
  if (showJoints) {
    const joints = [
      [418, 132], [542, 132], // الكتفان
      [398, 218], [562, 218], // المرفقان
      [383, 300], [577, 300], // الرسغان
      [452, 285], [508, 285], // الحرقفتان/الوركان
      [444, 392], [516, 392], // الركبتان
      [442, 486], [518, 486], // الكاحلان
    ];
    content += `<!-- نقاط المفاصل الحركية الرئيسية المضيئة -->
    <g class="skeletal-joints">`;
    for (const [jx, jy] of joints) {
      content += `
      <circle cx="${jx}" cy="${jy}" r="8" fill="none" stroke="${cJointGlow}" stroke-width="1.8" opacity="0.85"/>
      <circle cx="${jx}" cy="${jy}" r="3" fill="${cJointGlow}"/>`;
    }
    content += `</g>`;
  }

  // 8. التأشيرات
  if (mode !== 'none') {
    const labels = [
      {
        num: 1,
        ar: 'الجمجمة والفك السفلي',
        sub: 'Skull & Mandible',
        target: [480, 65] as [number, number],
        card: [160, 60] as [number, number],
      },
      {
        num: 2,
        ar: 'القفص الصدري وعظم القص',
        sub: 'Rib Cage & Sternum',
        target: [455, 165] as [number, number],
        card: [160, 160] as [number, number],
      },
      {
        num: 3,
        ar: 'العمود الفقري',
        sub: 'Vertebral Column',
        target: [485, 210] as [number, number],
        card: [800, 160] as [number, number],
      },
      {
        num: 4,
        ar: 'عظام الطرف العلوي (العضد والساعد)',
        sub: 'Upper Limb (Humerus & Forearm)',
        target: [390, 230] as [number, number],
        card: [160, 250] as [number, number],
      },
      {
        num: 5,
        ar: 'عظام الحوض',
        sub: 'Pelvis',
        target: [480, 285] as [number, number],
        card: [800, 270] as [number, number],
      },
      {
        num: 6,
        ar: 'عظم الفخذ',
        sub: 'Femur',
        target: [445, 360] as [number, number],
        card: [160, 360] as [number, number],
      },
      {
        num: 7,
        ar: 'مفصل الركبة والرضفة',
        sub: 'Knee Joint & Patella',
        target: [450, 425] as [number, number],
        card: [800, 390] as [number, number],
      },
      {
        num: 8,
        ar: 'عظام الساق (القصبة والشظية)',
        sub: 'Lower Leg (Tibia & Fibula)',
        target: [445, 465] as [number, number],
        card: [160, 460] as [number, number],
      },
    ];

    content += `<g class="bio-callouts">`;
    for (const item of labels) {
      const [tx, ty] = item.target;
      const [cxCard, cyCard] = item.card;

      if (mode === 'numbered') {
        content += `<!-- مؤشر مرقم [${item.num}] -->
        <line x1="${cxCard}" y1="${cyCard}" x2="${tx}" y2="${ty}" stroke="${cCalloutStroke}" stroke-width="1.6" stroke-dasharray="3,3" opacity="0.85"/>
        <circle cx="${tx}" cy="${ty}" r="4" fill="${cPointerDot}"/>
        <g filter="url(#ske-callout-${uid})">
          <circle cx="${cxCard}" cy="${cyCard}" r="15" fill="${cCalloutBg}" stroke="${cPointerDot}" stroke-width="2.2"/>
          <text x="${cxCard}" y="${cyCard + 5}" font-size="13" font-weight="bold" fill="${cPointerDot}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${item.num}</text>
        </g>`;
      } else {
        const cardW = 190;
        const cardH = 36;
        const rx = cxCard - cardW / 2;
        const ry = cyCard - cardH / 2;

        content += `<!-- بطاقة شرح [${item.ar}] -->
        <line x1="${cxCard}" y1="${cyCard > ty ? ry : ry + cardH}" x2="${tx}" y2="${ty}" stroke="${cCalloutStroke}" stroke-width="1.4" opacity="0.75"/>
        <circle cx="${tx}" cy="${ty}" r="3.5" fill="${cPointerDot}"/>
        <g filter="url(#ske-callout-${uid})">
          <rect x="${rx}" y="${ry}" width="${cardW}" height="${cardH}" rx="10" fill="${cCalloutBg}" stroke="${cCalloutStroke}" stroke-width="1.2"/>
          <text x="${cxCard}" y="${cyCard - 3}" font-size="11" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(item.ar)}</text>
          <text x="${cxCard}" y="${cyCard + 11}" font-size="9" font-weight="500" fill="${cTextSub}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(item.sub)}</text>
        </g>`;
      }
    }
    content += `</g>`;
  }

  if (spec.caption) {
    content += `<text x="${W_SKE / 2}" y="${H_SKE - 14}" font-size="14" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
  }

  return wrapSvg(defs + content, W_SKE, H_SKE, spec.caption ?? 'رسم تخطيطي ومجسم للهيكل العظمي العام للإنسان والمفاصل', opts);
}


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
    if (spec.kind === 'villus') {
      return renderVillus(spec, opts);
    }
    if (spec.kind === 'synapse') {
      return renderSynapse(spec, opts);
    }
    if (spec.kind === 'digestive_system') {
      return renderDigestiveSystem(spec, opts);
    }
    if (spec.kind === 'urinary_system') {
      return renderUrinarySystem(spec, opts);
    }
    if (spec.kind === 'circulatory_system') {
      return renderCirculatorySystem(spec, opts);
    }
    if (spec.kind === 'skeletal_system') {
      return renderSkeletalSystem(spec, opts);
    }
    if (spec.kind === 'absorption_pathways') {
      return renderAbsorptionPathways(spec, opts);
    }
    if (spec.kind === 'blood_smear') {
      return renderBloodSmear(spec, opts);
    }
    if (spec.kind === 'enzymatic_digestion') {
      return renderEnzymaticDigestion(spec, opts);
    }
    if (spec.kind === 'cellular_respiration') {
      return renderCellularRespiration(spec, opts);
    }
  } catch {
    // مبدأ "لا يرمي أبداً"
  }
  return '';
}

export {
  renderAbsorptionPathways,
  renderBloodSmear,
  renderEnzymaticDigestion,
  renderCellularRespiration,
  absorptionPathwaysSpecSchema,
  bloodSmearSpecSchema,
  enzymaticDigestionSpecSchema,
  cellularRespirationSpecSchema,
};
export type {
  AbsorptionPathwaysSpec,
  BloodSmearSpec,
  EnzymaticDigestionSpec,
  CellularRespirationSpec,
};


