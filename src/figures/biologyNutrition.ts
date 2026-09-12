// ============================================================
// Biology Nutrition Generator — مولّد التغذية عند الإنسان وجسم الإنسان
// ============================================================
// مادة: علوم الطبيعة والحياة — مرحلة التعليم المتوسط (BEM)
//
// يشمل 4 نماذج بيداغوجية أساسية بأسلوب 2.5D فائق الجمالية مع خلفية شفافة 100%:
// 1. طريقا الامتصاص ونقل المغذيات (absorption_pathways): الطريق الدموي واللمفاوي، تعديل السكر في الكبد والقلب
// 2. السحبة الدموية وخلايا الوسط الداخلي (blood_smear): كريات حمراء، بيضاء، صفائح، بلازما، ومعادلة الهيموغلوبين
// 3. الهضم الأنزيمي للنشا والكواشف الملونة (enzymatic_digestion): حمام مائي 37°C، ماء اليود وفهلنك، والتبسيط الجزيئي
// 4. التنفس الخلوي والمبادلات الطاقوية (cellular_respiration): هدم الغلوكوز والأكسجين في الميتوكندريا وإنتاج الطاقة والفضلات
//
// شروط التصيير:
// - خلفية شفافة تماماً (بدون أي مستطيل خلفية مصمت) لتندمج الرسوم بسلاسة فوق أي صفحة أو عرض
// - كافة المتغيرات الحسابية والقوانين والتركيزات تؤخذ من مدخلات الـ input بديناميكية كاملة
// - دعم الأنماط الثلاثة: 'full', 'numbered', 'none'
// - المبدأ الحاكم: "لا يرمي أبداً" — أي مواصفات غير صالحة تعيد ''
// ============================================================

import { z } from 'zod';
import type { RenderOptions } from './shared.js';
import { esc, wrapSvg } from './shared.js';
export const labelsModeSchema = z.enum([
  'full',     // بطاقات شرح كاملة (عربي + مصطلح أجنبي)
  'numbered', // دوائر مرقمة 1..7 لتمارين الامتحانات
  'none',     // بدون تأشيرات (رسم صامت)
]);
export type LabelsMode = z.infer<typeof labelsModeSchema>;

export const biologyThemeSchema = z.enum([
  'natural',    // ألوان طبيعية مجسمة حيوية (افتراضي للسبورة والشاشات)
  'vibrant',    // ألوان مشبعة وعالية التباين
  'exam_print', // تدرجات رمادية وأحادية مخصصة للطباعة الورقية
]);
export type BiologyTheme = z.infer<typeof biologyThemeSchema>;

export interface CalloutItem {
  num: number;
  ar: string;
  sub: string;
  target: [number, number];
  card: [number, number];
}

// ------------------------------------------------------------
// المخططات (Zod Schemas)
// ------------------------------------------------------------

// 1. طريقا الامتصاص ونقل المغذيات
export const absorptionPathwaysSpecSchema = z.object({
  kind: z.literal('absorption_pathways'),
  glycemiaPortal: z.number().positive().optional().default(2.5), // تركيز الغلوكوز في الوريد البابي الكبدي (g/L)
  glycemiaSupra: z.number().positive().optional().default(1.0),  // تركيز الغلوكوز في الوريد فوق الكبدي (g/L)
  highlightPathway: z.enum(['both', 'blood', 'lymph']).optional().default('both'),
  showNutrientCards: z.boolean().optional().default(true),
  labelsMode: labelsModeSchema.optional(),
  theme: biologyThemeSchema.optional(),
  caption: z.string().optional(),
});
export type AbsorptionPathwaysSpec = z.infer<typeof absorptionPathwaysSpecSchema>;

// 2. السحبة الدموية ومكونات الدم
export const bloodSmearSpecSchema = z.object({
  kind: z.literal('blood_smear'),
  rbcCountMillion: z.number().positive().optional().default(5.0),
  wbcCountThousand: z.number().positive().optional().default(7.5),
  plateletCountThousand: z.number().positive().optional().default(250),
  hbConcentration: z.number().positive().optional().default(15), // g/dL
  showGasEquation: z.boolean().optional().default(true),
  oxygenSaturation: z.number().min(0).max(100).optional().default(98),
  focus: z.enum(['all', 'rbc', 'wbc', 'platelets', 'plasma']).optional().default('all'),
  labelsMode: labelsModeSchema.optional(),
  theme: biologyThemeSchema.optional(),
  caption: z.string().optional(),
});
export type BloodSmearSpec = z.infer<typeof bloodSmearSpecSchema>;

// 3. الهضم الأنزيمي للنشا وتجارب الكواشف
export const enzymaticDigestionSpecSchema = z.object({
  kind: z.literal('enzymatic_digestion'),
  temperature: z.number().optional().default(37), // °C
  substrate: z.string().optional().default('مطبوخ النشا'),
  enzyme: z.string().optional().default('الأميلاز اللعابي'),
  product: z.string().optional().default('مالتوز (سكر شعير)'),
  testReagent: z.enum(['both', 'iodine', 'fehling']).optional().default('both'),
  showMolecularModel: z.boolean().optional().default(true),
  labelsMode: labelsModeSchema.optional(),
  theme: biologyThemeSchema.optional(),
  caption: z.string().optional(),
});
export type EnzymaticDigestionSpec = z.infer<typeof enzymaticDigestionSpecSchema>;

// 4. التنفس الخلوي واستعمال المغذيات
export const cellularRespirationSpecSchema = z.object({
  kind: z.literal('cellular_respiration'),
  energyKJ: z.number().positive().optional().default(2840), // kJ لكل مول غلوكوز
  atpPercent: z.number().min(0).max(100).optional().default(40),
  heatPercent: z.number().min(0).max(100).optional().default(60),
  cellType: z.enum(['muscle', 'general']).optional().default('muscle'),
  showWasteProducts: z.boolean().optional().default(true),
  labelsMode: labelsModeSchema.optional(),
  theme: biologyThemeSchema.optional(),
  caption: z.string().optional(),
});
export type CellularRespirationSpec = z.infer<typeof cellularRespirationSpecSchema>;

// ------------------------------------------------------------
// الثوابت والألوان
// ------------------------------------------------------------

const W = 960;
const H = 520;

interface BioPalette {
  bloodVein: string;
  bloodArtery: string;
  lymphColor: string;
  liverBase: string;
  liverBorder: string;
  intestineBase: string;
  heartBase: string;
  rbcBase: string;
  rbcHighlight: string;
  wbcBase: string;
  wbcNucleus: string;
  plateletColor: string;
  plasmaBg: string;
  cardBg: string;
  cardBorder: string;
  textMain: string;
  textSub: string;
  badgeBg: string;
  badgeText: string;
}

function getPalette(theme: BiologyTheme = 'natural'): BioPalette {
  if (theme === 'exam_print') {
    return {
      bloodVein: '#333333',
      bloodArtery: '#111111',
      lymphColor: '#666666',
      liverBase: '#cccccc',
      liverBorder: '#222222',
      intestineBase: '#dddddd',
      heartBase: '#aaaaaa',
      rbcBase: '#555555',
      rbcHighlight: '#888888',
      wbcBase: '#ffffff',
      wbcNucleus: '#222222',
      plateletColor: '#444444',
      plasmaBg: 'rgba(240, 240, 240, 0.5)',
      cardBg: '#ffffff',
      cardBorder: '#222222',
      textMain: '#000000',
      textSub: '#444444',
      badgeBg: '#000000',
      badgeText: '#ffffff',
    };
  }

  if (theme === 'vibrant') {
    return {
      bloodVein: '#2563eb',
      bloodArtery: '#f43f5e',
      lymphColor: '#10b981',
      liverBase: '#b91c1c',
      liverBorder: '#991b1b',
      intestineBase: '#f59e0b',
      heartBase: '#e11d48',
      rbcBase: '#e11d48',
      rbcHighlight: '#fda4af',
      wbcBase: '#ede9fe',
      wbcNucleus: '#7c3aed',
      plateletColor: '#a855f7',
      plasmaBg: 'rgba(254, 240, 138, 0.25)',
      cardBg: 'rgba(15, 23, 42, 0.88)',
      cardBorder: 'rgba(148, 163, 184, 0.35)',
      textMain: '#ffffff',
      textSub: '#94a3b8',
      badgeBg: '#f43f5e',
      badgeText: '#ffffff',
    };
  }

  // natural (الافتراضي للسبورة الذكية والأوراق)
  return {
    bloodVein: '#3b82f6',     // أزرق الأوردة
    bloodArtery: '#ef4444',   // أحمر الشرايين
    lymphColor: '#10b981',    // أخضر اللمف
    liverBase: '#991b1b',     // كبدي داكن
    liverBorder: '#7f1d1d',
    intestineBase: '#f59e0b', // تلافيف المعي الدقيق
    heartBase: '#be123c',     // لون القلب
    rbcBase: '#dc2626',       // كريات حمراء
    rbcHighlight: '#fca5a5',
    wbcBase: '#f8fafc',       // كريات بيضاء
    wbcNucleus: '#6d28d9',   // أنوية بنفسجية
    plateletColor: '#9333ea', // صفائح دموية
    plasmaBg: 'rgba(253, 230, 138, 0.18)', // مصورة صفراء شفافة
    cardBg: 'rgba(30, 41, 59, 0.88)',
    cardBorder: 'rgba(148, 163, 184, 0.28)',
    textMain: '#f8fafc',
    textSub: '#94a3b8',
    badgeBg: '#0284c7',
    badgeText: '#ffffff',
  };
}

// ------------------------------------------------------------
// مساعدات الرسم والتأشيرات المشتركة
// ------------------------------------------------------------

function renderDefs(P: BioPalette, uid: string): string {
  return `
  <defs>
    <filter id="bio-shadow-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-opacity="0.25"/>
    </filter>
    <!-- تدرج كبدي -->
    <linearGradient id="liver-grad-${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b91c1c"/>
      <stop offset="60%" stop-color="${P.liverBase}"/>
      <stop offset="100%" stop-color="#450a0a"/>
    </linearGradient>
    <!-- تدرج وريدي دموي -->
    <linearGradient id="vein-grad-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="50%" stop-color="${P.bloodVein}"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <!-- تدرج لمفاوي بلغمي -->
    <linearGradient id="lymph-grad-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#6ee7b7"/>
      <stop offset="50%" stop-color="${P.lymphColor}"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
    <!-- تدرج كرية دم حمراء مقعرة 2.5D -->
    <radialGradient id="rbc-grad-${uid}" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="${P.rbcHighlight}"/>
      <stop offset="45%" stop-color="${P.rbcBase}"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </radialGradient>
    <!-- تدرج ميتوكندريا -->
    <linearGradient id="mito-grad-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fb923c"/>
      <stop offset="50%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#9a3412"/>
    </linearGradient>
  </defs>`;
}

function renderCallouts(items: CalloutItem[], mode: LabelsMode, P: BioPalette, uid: string): string {
  if (mode === 'none') return '';
  let svg = '';

  for (const item of items) {
    const [tx, ty] = item.target;
    const [cx, cy] = item.card;

    if (mode === 'numbered') {
      svg += `
      <g filter="url(#bio-shadow-${uid})">
        <line x1="${cx}" y1="${cy}" x2="${tx}" y2="${ty}" stroke="${P.badgeBg}" stroke-width="1.5" stroke-dasharray="3 3"/>
        <circle cx="${cx}" cy="${cy}" r="13" fill="${P.badgeBg}" stroke="#ffffff" stroke-width="1.8"/>
        <text x="${cx}" y="${cy + 5}" fill="${P.badgeText}" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif">${item.num}</text>
        <circle cx="${tx}" cy="${ty}" r="3" fill="${P.badgeBg}"/>
      </g>`;
    } else {
      const isLeft = cx < tx;
      const cardW = 165;
      const cardH = 36;
      const rx = isLeft ? cx - cardW : cx;
      const ry = cy - cardH / 2;

      svg += `
      <g filter="url(#bio-shadow-${uid})">
        <path d="M ${tx} ${ty} L ${cx} ${cy}" stroke="${P.cardBorder}" stroke-width="1.4" stroke-dasharray="3 2" fill="none"/>
        <circle cx="${tx}" cy="${ty}" r="3.5" fill="${P.bloodArtery}"/>
        <rect x="${rx}" y="${ry}" width="${cardW}" height="${cardH}" rx="6" fill="${P.cardBg}" stroke="${P.cardBorder}" stroke-width="1.2"/>
        <rect x="${isLeft ? rx + cardW - 4 : rx}" y="${ry}" width="4" height="${cardH}" fill="${P.bloodVein}" rx="2"/>
        <text x="${rx + cardW / 2}" y="${ry + 15}" fill="${P.textMain}" font-size="11.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">${esc(item.ar)}</text>
        <text x="${rx + cardW / 2}" y="${ry + 29}" fill="${P.textSub}" font-size="9" text-anchor="middle" font-family="sans-serif">${esc(item.sub)}</text>
      </g>`;
    }
  }

  return svg;
}

// ============================================================
// 1. طريقا الامتصاص ونقل المغذيات (absorption_pathways)
// ============================================================
export function renderAbsorptionPathways(spec: AbsorptionPathwaysSpec, opts?: RenderOptions): string {
  const parsed = absorptionPathwaysSpecSchema.safeParse(spec);
  if (!parsed.success) return '';
  const S = parsed.data;

  const P = getPalette(S.theme);
  const uid = Math.random().toString(36).substring(2, 8);
  const showBlood = S.highlightPathway === 'both' || S.highlightPathway === 'blood';
  const showLymph = S.highlightPathway === 'both' || S.highlightPathway === 'lymph';

  let svg = renderDefs(P, uid);

  // إحداثيات الأعضاء الرئيسية في الرسم المخطط لـ BEM
  const intestineX = 460;
  const intestineY = 410;
  const liverX = 350;
  const liverY = 250;
  const heartX = 460;
  const heartY = 90;

  // 1. المعي الدقيق في الأسفل (مصدر المغذيات الممتصة)
  svg += `
  <g filter="url(#bio-shadow-${uid})">
    <!-- تلافيف المعي الدقيق 2.5D -->
    <path d="M 370 410 C 390 385, 430 385, 450 410 C 470 435, 510 435, 530 410 C 550 385, 570 405, 560 430 C 550 455, 500 450, 480 435 C 460 420, 420 420, 400 435 C 380 450, 355 435, 370 410 Z"
      fill="#fed7aa" stroke="#ea580c" stroke-width="2.5"/>
    <path d="M 390 405 Q 430 425 470 405 Q 510 425 545 405" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round"/>
    <text x="${intestineX}" y="${intestineY + 45}" fill="${P.textMain}" font-size="13" font-weight="bold" text-anchor="middle" font-family="sans-serif">المعي الدقيق (مقر الامتصاص عبر الزغابات)</text>
  </g>`;

  // 2. الكبد في مسار الطريق الدموي (على اليمين تشريحياً / يسار الرسم)
  svg += `
  <g filter="url(#bio-shadow-${uid})" opacity="${showBlood ? '1' : '0.25'}">
    <!-- فص الكبد الأيمن والأيسر -->
    <path d="M 270 230 C 270 195, 380 195, 415 225 C 430 245, 420 280, 380 285 C 330 290, 270 270, 270 230 Z"
      fill="url(#liver-grad-${uid})" stroke="${P.liverBorder}" stroke-width="2"/>
    <ellipse cx="330" cy="225" rx="35" ry="12" fill="#ffffff" opacity="0.15"/>
    <text x="350" y="248" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle" font-family="sans-serif">الكبد</text>
    <text x="350" y="265" fill="#fecaca" font-size="9.5" text-anchor="middle" font-family="sans-serif">تعديل نسبة السكر إلى 1g/L</text>
  </g>`;

  // 3. القلب في الأعلى
  svg += `
  <g filter="url(#bio-shadow-${uid})">
    <path d="M 435 85 C 435 60, 460 60, 460 80 C 460 60, 485 60, 485 85 C 485 110, 460 125, 460 130 C 460 125, 435 110, 435 85 Z"
      fill="${P.heartBase}" stroke="#9f1239" stroke-width="2"/>
    <text x="460" y="98" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle" font-family="sans-serif">القلب</text>
    <text x="460" y="112" fill="#ffe4e6" font-size="8.5" text-anchor="middle" font-family="sans-serif">الأذين الأيمن</text>
  </g>`;

  // 4. الطريق الدموي (الأزرق / الوريدي)
  if (showBlood) {
    // أوعية مساريقية دموية من المعي إلى الوريد البابي
    svg += `
    <g opacity="${showBlood ? '1' : '0.2'}">
      <!-- الوريد البابي الكبدي -->
      <path d="M 440 395 C 420 360, 360 340, 350 290" fill="none" stroke="url(#vein-grad-${uid})" stroke-width="7" stroke-linecap="round"/>
      <path d="M 440 395 C 420 360, 360 340, 350 290" fill="none" stroke="#93c5fd" stroke-width="2" stroke-dasharray="8 6"/>

      <!-- وسم تركيز السكر قبل الكبد (ديناميكي من input) -->
      <g transform="translate(325, 335)">
        <rect x="-65" y="-12" width="130" height="24" rx="6" fill="${P.cardBg}" stroke="${P.bloodVein}" stroke-width="1.2"/>
        <text x="0" y="4" fill="#38bdf8" font-size="10.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">غلوكوز: ${S.glycemiaPortal} g/L</text>
      </g>

      <!-- الوريد فوق الكبدي الخارج من الكبد إلى الوريد الأجوف السفلي -->
      <path d="M 370 205 C 385 170, 430 160, 445 130" fill="none" stroke="url(#vein-grad-${uid})" stroke-width="6" stroke-linecap="round"/>
      <path d="M 370 205 C 385 170, 430 160, 445 130" fill="none" stroke="#93c5fd" stroke-width="2" stroke-dasharray="6 4"/>

      <!-- وسم تركيز السكر بعد الكبد (ديناميكي من input) -->
      <g transform="translate(370, 165)">
        <rect x="-60" y="-11" width="120" height="22" rx="5" fill="${P.cardBg}" stroke="${P.bloodVein}" stroke-width="1.2"/>
        <text x="0" y="4" fill="#4ade80" font-size="10" font-weight="bold" text-anchor="middle" font-family="sans-serif">غلوكوز: ${S.glycemiaSupra} g/L</text>
      </g>
    </g>`;
  }

  // 5. الطريق اللمفاوي / البلغمي (الأخضر / اللمف)
  if (showLymph) {
    svg += `
    <g opacity="${showLymph ? '1' : '0.2'}">
      <!-- أوعية بلغمية مساريقية صاعدة نحو القناة الصدرية -->
      <path d="M 480 395 C 500 350, 540 310, 545 220 C 550 160, 500 135, 475 125" fill="none" stroke="url(#lymph-grad-${uid})" stroke-width="6" stroke-linecap="round"/>
      <path d="M 480 395 C 500 350, 540 310, 545 220 C 550 160, 500 135, 475 125" fill="none" stroke="#a7f3d0" stroke-width="2" stroke-dasharray="6 5"/>

      <!-- عقدة لمفاوية مساريقية -->
      <circle cx="542" cy="270" r="9" fill="${P.lymphColor}" stroke="#ffffff" stroke-width="1.5"/>
      <text x="560" y="274" fill="${P.textSub}" font-size="9" text-anchor="start" font-family="sans-serif">عقدة لمفاوية</text>

      <!-- وسم القناة الصدرية -->
      <g transform="translate(565, 180)">
        <rect x="-5" y="-11" width="115" height="22" rx="5" fill="${P.cardBg}" stroke="${P.lymphColor}" stroke-width="1"/>
        <text x="52" y="4" fill="#34d399" font-size="9.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">القناة الصدرية اللمفاوية</text>
      </g>
    </g>`;
  }

  // 6. بطاقات المغذيات المنقولة في كل طريق (يسار ويمين)
  if (S.showNutrientCards) {
    // بطاقة الطريق الدموي على اليسار
    svg += `
    <g transform="translate(45, 170)" filter="url(#bio-shadow-${uid})">
      <rect width="185" height="155" rx="8" fill="${P.cardBg}" stroke="${P.bloodVein}" stroke-width="1.5"/>
      <rect width="185" height="26" rx="8" fill="${P.bloodVein}" opacity="0.85"/>
      <text x="92" y="18" fill="#ffffff" font-size="11.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">المغذيات في الطريق الدموي</text>

      <text x="170" y="48" fill="${P.textMain}" font-size="11" text-anchor="end" font-family="sans-serif">&#x2022; ماء + أملاح معدنية</text>
      <text x="170" y="70" fill="${P.textMain}" font-size="11" text-anchor="end" font-family="sans-serif">&#x2022; غلوكوز (سكريات بسيطة)</text>
      <text x="170" y="92" fill="${P.textMain}" font-size="11" text-anchor="end" font-family="sans-serif">&#x2022; أحماض أمينية</text>
      <text x="170" y="114" fill="${P.textMain}" font-size="11" text-anchor="end" font-family="sans-serif">&#x2022; فيتامينات منحلة بالماء (B, C)</text>
      <text x="92" y="140" fill="#38bdf8" font-size="9.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">(يمر وجوباً عبر الكبد للتعديل)</text>
    </g>`;

    // بطاقة الطريق اللمفاوي على اليمين
    svg += `
    <g transform="translate(730, 170)" filter="url(#bio-shadow-${uid})">
      <rect width="185" height="155" rx="8" fill="${P.cardBg}" stroke="${P.lymphColor}" stroke-width="1.5"/>
      <rect width="185" height="26" rx="8" fill="${P.lymphColor}" opacity="0.85"/>
      <text x="92" y="18" fill="#ffffff" font-size="11.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">المغذيات في الطريق اللمفاوي</text>

      <text x="170" y="48" fill="${P.textMain}" font-size="11" text-anchor="end" font-family="sans-serif">&#x2022; ماء + أملاح معدنية</text>
      <text x="170" y="70" fill="${P.textMain}" font-size="11" text-anchor="end" font-family="sans-serif">&#x2022; أحماض دسمة</text>
      <text x="170" y="92" fill="${P.textMain}" font-size="11" text-anchor="end" font-family="sans-serif">&#x2022; غليسيرول</text>
      <text x="170" y="114" fill="${P.textMain}" font-size="11" text-anchor="end" font-family="sans-serif">&#x2022; فيتامينات منحلة بالدسم (A, D, E, K)</text>
      <text x="92" y="140" fill="#34d399" font-size="9.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">(يتجنب الكبد ويصب بالقلب)</text>
    </g>`;
  }

  // 7. التأشيرات الرسمية لـ BEM
  const labels: CalloutItem[] = [
    { num: 1, ar: 'المعي الدقيق (مقر الامتصاص)', sub: 'Small Intestine', target: [intestineX, intestineY], card: [intestineX, 480] },
    { num: 2, ar: 'الوريد البابي الكبدي', sub: 'Hepatic Portal Vein', target: [380, 340], card: [220, 370] },
    { num: 3, ar: 'الكبد (تعديل الغليكوجين)', sub: 'Liver Organ', target: [320, 230], card: [180, 140] },
    { num: 4, ar: 'الوريد فوق الكبدي', sub: 'Supra-Hepatic Vein', target: [400, 185], card: [260, 95] },
    { num: 5, ar: 'الوريد الأجوف والقلب', sub: 'Heart (Right Atrium)', target: [heartX, heartY + 20], card: [heartX, 40] },
    { num: 6, ar: 'القناة الصدرية اللمفاوية', sub: 'Thoracic Lymph Duct', target: [545, 220], card: [710, 130] },
    { num: 7, ar: 'أوعية بلغمية مساريقية', sub: 'Mesenteric Lymphatics', target: [495, 375], card: [710, 370] },
  ];

  svg += renderCallouts(labels, S.labelsMode ?? 'full', P, uid);

  if (S.caption) {
    svg += `
    <g filter="url(#bio-shadow-${uid})">
      <rect x="80" y="${H - 42}" width="${W - 160}" height="32" rx="8" fill="${P.cardBg}" stroke="${P.cardBorder}" stroke-width="1"/>
      <text x="${W / 2}" y="${H - 22}" fill="${P.textMain}" font-size="12.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">${esc(S.caption)}</text>
    </g>`;
  }

  return wrapSvg(svg, W, H, 'رسم تخطيطي لطريقي نقل المغذيات في العضوية', opts);
}

// ============================================================
// 2. السحبة الدموية وخلايا الوسط الداخلي (blood_smear)
// ============================================================
export function renderBloodSmear(spec: BloodSmearSpec, opts?: RenderOptions): string {
  const parsed = bloodSmearSpecSchema.safeParse(spec);
  if (!parsed.success) return '';
  const S = parsed.data;

  const P = getPalette(S.theme);
  const uid = Math.random().toString(36).substring(2, 8);
  const focus = S.focus ?? 'all';

  const opRBC = focus === 'all' || focus === 'rbc' ? '1' : '0.25';
  const opWBC = focus === 'all' || focus === 'wbc' ? '1' : '0.25';
  const opPlatelets = focus === 'all' || focus === 'platelets' ? '1' : '0.25';
  const opPlasma = focus === 'all' || focus === 'plasma' ? '1' : '0.25';

  let svg = renderDefs(P, uid);

  // إطار عدسة المجهر الدائرية 2.5D (خلفية شفافة للسائل البلازمي)
  const lensCx = 380;
  const lensCy = 250;
  const lensR = 210;

  svg += `
  <g filter="url(#bio-shadow-${uid})">
    <!-- هالة البلازما الصفراء الشفافة المحصورة في حقل المجهر -->
    <circle cx="${lensCx}" cy="${lensCy}" r="${lensR}" fill="${P.plasmaBg}" stroke="${P.cardBorder}" stroke-width="2.5" opacity="${opPlasma}"/>
    <circle cx="${lensCx}" cy="${lensCy}" r="${lensR - 6}" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
    <ellipse cx="${lensCx - 60}" cy="${lensCy - 80}" rx="90" ry="40" fill="#ffffff" opacity="0.08" transform="rotate(-30 ${lensCx - 60} ${lensCy - 80})"/>
  </g>`;

  // 1. كريات الدم الحمراء (RBCs) العديدة مقعرة الوجهين ثنائية التحدب
  svg += `<g opacity="${opRBC}">`;
  const rbcPositions: [number, number, number][] = [
    [260, 160, 22], [320, 130, 24], [410, 120, 23], [480, 150, 24],
    [230, 230, 24], [300, 200, 23], [440, 220, 25], [520, 210, 23],
    [250, 310, 23], [330, 340, 24], [420, 350, 24], [490, 310, 23],
    [370, 180, 23], [360, 300, 24], [280, 260, 22], [460, 270, 23],
  ];

  for (const [rx, ry, r] of rbcPositions) {
    svg += `
    <g filter="url(#bio-shadow-${uid})">
      <!-- القرص مقعر الوجهين -->
      <circle cx="${rx}" cy="${ry}" r="${r}" fill="url(#rbc-grad-${uid})" stroke="#991b1b" stroke-width="1"/>
      <!-- التقعر المركزي الشاحب الشفاف -->
      <ellipse cx="${rx}" cy="${ry}" rx="${r * 0.45}" ry="${r * 0.4}" fill="#fca5a5" opacity="0.75"/>
      <circle cx="${rx - r * 0.3}" cy="${ry - r * 0.3}" r="${r * 0.2}" fill="#ffffff" opacity="0.35"/>
    </g>`;
  }
  svg += `</g>`;

  // 2. كريات الدم البيضاء (WBCs) - أنواعها المميزة في المنهاج
  svg += `<g opacity="${opWBC}">`;
  // أ) كرية بيضاء متعددة الفصوص (Neutrophil) في المركز العلوي
  const w1X = 370;
  const w1Y = 240;
  const w1R = 34;
  svg += `
  <g filter="url(#bio-shadow-${uid})">
    <circle cx="${w1X}" cy="${w1Y}" r="${w1R}" fill="${P.wbcBase}" stroke="#cbd5e1" stroke-width="1.8"/>
    <!-- نواة مفصصة بثلاث فصوص بنفسجية متصلة -->
    <path d="M ${w1X - 14} ${w1Y - 8} Q ${w1X} ${w1Y - 18} ${w1X + 14} ${w1Y - 8} Q ${w1X + 16} ${w1Y + 12} ${w1X} ${w1Y + 14} Q ${w1X - 16} ${w1Y + 10} ${w1X - 14} ${w1Y - 8} Z"
      fill="${P.wbcNucleus}" stroke="#4c1d95" stroke-width="1.2"/>
    <circle cx="${w1X - 10}" cy="${w1Y - 6}" r="7" fill="${P.wbcNucleus}"/>
    <circle cx="${w1X + 10}" cy="${w1Y - 6}" r="8" fill="${P.wbcNucleus}"/>
    <circle cx="${w1X}" cy="${w1Y + 10}" r="8.5" fill="${P.wbcNucleus}"/>
  </g>`;

  // ب) كرية بيضاء لمفاوية (Lymphocyte) في الأسفل يسار
  const w2X = 270;
  const w2Y = 360;
  const w2R = 26;
  svg += `
  <g filter="url(#bio-shadow-${uid})">
    <circle cx="${w2X}" cy="${w2Y}" r="${w2R}" fill="${P.wbcBase}" stroke="#cbd5e1" stroke-width="1.5"/>
    <!-- نواة كروية ضخمة تحتل أغلب حجم الخلية -->
    <circle cx="${w2X}" cy="${w2Y}" r="${w2R * 0.78}" fill="${P.wbcNucleus}" stroke="#4c1d95" stroke-width="1"/>
    <circle cx="${w2X - 6}" cy="${w2Y - 6}" r="3" fill="#c4b5fd" opacity="0.6"/>
  </g>`;

  // ج) كرية بيضاء وحيدة النواة (Monocyte) كلوية الشكل
  const w3X = 470;
  const w3Y = 160;
  const w3R = 30;
  svg += `
  <g filter="url(#bio-shadow-${uid})">
    <circle cx="${w3X}" cy="${w3Y}" r="${w3R}" fill="${P.wbcBase}" stroke="#cbd5e1" stroke-width="1.5"/>
    <path d="M ${w3X - 10} ${w3Y - 12} C ${w3X + 14} ${w3Y - 12}, ${w3X + 14} ${w3Y + 12}, ${w3X - 8} ${w3Y + 14} C ${w3X + 2} ${w3Y + 4}, ${w3X + 2} ${w3Y - 4}, ${w3X - 10} ${w3Y - 12} Z"
      fill="${P.wbcNucleus}" stroke="#4c1d95" stroke-width="1"/>
  </g>`;
  svg += `</g>`;

  // 3. الصفائح الدموية (Platelets) شظايا أرجوانية صغيرة مبعثرة
  svg += `<g opacity="${opPlatelets}">`;
  const platelets: [number, number][] = [
    [310, 165], [318, 172], [420, 275], [428, 270], [422, 282],
    [240, 270], [245, 276], [490, 250], [498, 256], [360, 350],
  ];
  for (const [px, py] of platelets) {
    svg += `<polygon points="${px},${py - 3} ${px + 4},${py} ${px + 2},${py + 4} ${px - 3},${py + 2}" fill="${P.plateletColor}" stroke="#581c87" stroke-width="0.8"/>`;
  }
  svg += `</g>`;

  // 4. بطاقة المعطيات والإحصائيات الحيوية ومعادلة الهيموغلوبين على اليمين
  const cardX = 640;
  const cardY = 60;
  const cardW = 290;
  const cardH = 400;

  svg += `
  <g filter="url(#bio-shadow-${uid})">
    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="10" fill="${P.cardBg}" stroke="${P.cardBorder}" stroke-width="1.5"/>
    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="32" rx="10" fill="${P.bloodArtery}" opacity="0.9"/>
    <text x="${cardX + cardW / 2}" y="${cardY + 21}" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle" font-family="sans-serif">مكونات الدم ووظائفه (BEM)</text>

    <!-- إحصائيات من input -->
    <g transform="translate(${cardX + 15}, ${cardY + 50})">
      <text x="${cardW - 30}" y="15" fill="${P.textMain}" font-size="11.5" font-weight="bold" text-anchor="end">&#x2022; الكريات الحمراء (RBC):</text>
      <text x="${cardW - 40}" y="32" fill="#ef4444" font-size="11" font-weight="bold" text-anchor="end">حوالي ${S.rbcCountMillion} مليون / mm&#xB3; (نقل الغازات)</text>

      <text x="${cardW - 30}" y="58" fill="${P.textMain}" font-size="11.5" font-weight="bold" text-anchor="end">&#x2022; الكريات البيضاء (WBC):</text>
      <text x="${cardW - 40}" y="75" fill="#a78bfa" font-size="11" font-weight="bold" text-anchor="end">حوالي ${S.wbcCountThousand} آلاف / mm&#xB3; (الدفاع والمناعة)</text>

      <text x="${cardW - 30}" y="101" fill="${P.textMain}" font-size="11.5" font-weight="bold" text-anchor="end">&#x2022; الصفائح الدموية:</text>
      <text x="${cardW - 40}" y="118" fill="#c084fc" font-size="11" font-weight="bold" text-anchor="end">حوالي ${S.plateletCountThousand} ألف / mm&#xB3; (تخثر الدم)</text>

      <text x="${cardW - 30}" y="144" fill="${P.textMain}" font-size="11.5" font-weight="bold" text-anchor="end">&#x2022; البلازما (المصورة):</text>
      <text x="${cardW - 40}" y="161" fill="#facc15" font-size="11" font-weight="bold" text-anchor="end">55% من حجم الدم (نقل المغذيات والفضلات)</text>
    </g>

    <line x1="${cardX + 15}" y1="${cardY + 235}" x2="${cardX + cardW - 15}" y2="${cardY + 235}" stroke="${P.cardBorder}" stroke-width="1"/>

    <!-- معادلة تنفس الهيموغلوبين -->
    ${S.showGasEquation ? `
    <g transform="translate(${cardX + 15}, ${cardY + 250})">
      <text x="${cardW / 2}" y="12" fill="${P.textMain}" font-size="12" font-weight="bold" text-anchor="middle">معادلة تنفس الهيموغلوبين (Hb):</text>
      <text x="${cardW / 2}" y="38" fill="#f87171" font-size="14" font-weight="bold" text-anchor="middle">Hb + 4 O&#x2082; &#x21C4; HbO&#x2088;</text>

      <text x="${cardW - 30}" y="65" fill="${P.textSub}" font-size="10" text-anchor="end">&#x2022; بالرئتين (دم قانٍ أحمر فاتح): أكسجة (${S.oxygenSaturation}%)</text>
      <text x="${cardW - 30}" y="85" fill="${P.textSub}" font-size="10" text-anchor="end">&#x2022; بالأنسجة (دم قاتم أحمر داكن): تحرير O&#x2082;</text>
      <text x="${cardW / 2}" y="108" fill="${P.textMain}" font-size="10.5" font-weight="bold" text-anchor="middle">Hb = ${S.hbConcentration} g/dL</text>
    </g>` : ''}
  </g>`;

  // 5. التأشيرات الرسمية
  const labels: CalloutItem[] = [
    { num: 1, ar: 'كرية دم حمراء مقعرة (Hb)', sub: 'Red Blood Cell (RBC)', target: [320, 130], card: [120, 100] },
    { num: 2, ar: 'كرية بيضاء متعددة الفصوص', sub: 'Polynuclear Neutrophil', target: [w1X, w1Y], card: [120, 210] },
    { num: 3, ar: 'كرية بيضاء لمفاوية', sub: 'Lymphocyte WBC', target: [w2X, w2Y], card: [120, 360] },
    { num: 4, ar: 'صفائح دموية للتخثر', sub: 'Blood Platelets', target: [315, 170], card: [200, 470] },
    { num: 5, ar: 'مصورة الدم (البلازما)', sub: 'Blood Plasma', target: [lensCx + 120, lensCy + 40], card: [470, 470] },
    { num: 6, ar: 'كرية بيضاء وحيدة النواة', sub: 'Monocyte WBC', target: [w3X, w3Y], card: [590, 100] },
  ];

  svg += renderCallouts(labels, S.labelsMode ?? 'full', P, uid);

  if (S.caption) {
    svg += `
    <g filter="url(#bio-shadow-${uid})">
      <rect x="80" y="${H - 40}" width="${W - 160}" height="32" rx="8" fill="${P.cardBg}" stroke="${P.cardBorder}" stroke-width="1"/>
      <text x="${W / 2}" y="${H - 20}" fill="${P.textMain}" font-size="12.5" font-weight="bold" text-anchor="middle" font-family="sans-serif">${esc(S.caption)}</text>
    </g>`;
  }

  return wrapSvg(svg, W, H, 'سحبة دموية مجهرية توضح خلايا الدم ومكونات الوسط الداخلي', opts);
}

// ============================================================
// 3. الهضم الأنزيمي للنشا وتجارب الكواشف (enzymatic_digestion)
// ============================================================
export function renderEnzymaticDigestion(spec: EnzymaticDigestionSpec, opts?: RenderOptions): string {
  const parsed = enzymaticDigestionSpecSchema.safeParse(spec);
  if (!parsed.success) return '';
  const S = parsed.data;

  const P = getPalette(S.theme);
  const uid = Math.random().toString(36).substring(2, 8);

  let svg = renderDefs(P, uid);

  // 1. الحمام المائي 2.5D في الوسط الأيسر (37°C)
  const bathX = 220;
  const bathY = 240;
  const bathW = 260;
  const bathH = 170;

  svg += `
  <g filter="url(#bio-shadow-${uid})">
    <!-- وعاء الحمام المائي الزجاجي -->
    <rect x="${bathX - bathW / 2}" y="${bathY - bathH / 2}" width="${bathW}" height="${bathH}" rx="12" fill="rgba(255,255,255,0.06)" stroke="${P.cardBorder}" stroke-width="2"/>
    <!-- ماء دافئ شفاف داخل الحمام -->
    <rect x="${bathX - bathW / 2 + 6}" y="${bathY - bathH / 2 + 35}" width="${bathW - 12}" height="${bathH - 41}" rx="8" fill="rgba(56, 189, 248, 0.2)"/>
    <ellipse cx="${bathX}" cy="${bathY - bathH / 2 + 35}" rx="${bathW / 2 - 8}" ry="10" fill="rgba(56, 189, 248, 0.35)"/>

    <!-- ميزان حرارة زئبقي يشير بدقة إلى درجة الحرارة المدخلة -->
    <rect x="${bathX + bathW / 2 - 28}" y="${bathY - bathH / 2 - 30}" width="8" height="${bathH + 10}" rx="4" fill="#f1f5f9" stroke="#94a3b8"/>
    <line x1="${bathX + bathW / 2 - 24}" y1="${bathY}" x2="${bathX + bathW / 2 - 24}" y2="${bathY + bathH / 2 - 10}" stroke="#ef4444" stroke-width="3"/>
    <circle cx="${bathX + bathW / 2 - 24}" cy="${bathY + bathH / 2 - 8}" r="7" fill="#ef4444"/>

    <!-- شارة درجة الحرارة (ديناميكية) -->
    <rect x="${bathX + bathW / 2 - 50}" y="${bathY - bathH / 2 - 48}" width="60" height="24" rx="5" fill="${P.cardBg}" stroke="#ef4444" stroke-width="1.2"/>
    <text x="${bathX + bathW / 2 - 20}" y="${bathY - bathH / 2 - 32}" fill="#ef4444" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif">${S.temperature}&#xB0;C</text>
  </g>`;

  // 2. أنبوبا الاختبار داخل الحمام المائي
  // الأنبوب (أ): الشاهد (نشا فقط)
  const t1X = bathX - 50;
  const t1Y = bathY - 40;
  // الأنبوب (ب): نشا + لعابين
  const t2X = bathX + 30;
  const t2Y = bathY - 40;

  // رسم الأنبوب الشاهد (أ)
  svg += `
  <g filter="url(#bio-shadow-${uid})">
    <!-- جسم الأنبوب الزجاجي -->
    <path d="M ${t1X - 14} ${t1Y} L ${t1X - 14} ${t1Y + 120} C ${t1X - 14} ${t1Y + 138}, ${t1X + 14} ${t1Y + 138}, ${t1X + 14} ${t1Y + 120} L ${t1X + 14} ${t1Y}"
      fill="rgba(255,255,255,0.1)" stroke="${P.cardBorder}" stroke-width="1.8"/>
    <!-- مطبوخ النشا العكر الأبيض -->
    <path d="M ${t1X - 12} ${t1Y + 50} L ${t1X - 12} ${t1Y + 120} C ${t1X - 12} ${t1Y + 136}, ${t1X + 12} ${t1Y + 136}, ${t1X + 12} ${t1Y + 120} L ${t1X + 12} ${t1Y + 50} Z"
      fill="#e2e8f0" opacity="0.8"/>
    <ellipse cx="${t1X}" cy="${t1Y + 50}" rx="12" ry="3" fill="#cbd5e1"/>

    <text x="${t1X}" y="${t1Y - 10}" fill="${P.textMain}" font-size="12" font-weight="bold" text-anchor="middle">(أ)</text>
    <text x="${t1X}" y="${t1Y + 80}" fill="#334155" font-size="9" font-weight="bold" text-anchor="middle">شاهد</text>
  </g>`;

  // رسم الأنبوب التجريبي (ب)
  svg += `
  <g filter="url(#bio-shadow-${uid})">
    <path d="M ${t2X - 14} ${t2Y} L ${t2X - 14} ${t2Y + 120} C ${t2X - 14} ${t2Y + 138}, ${t2X + 14} ${t2Y + 138}, ${t2X + 14} ${t2Y + 120} L ${t2X + 14} ${t2Y}"
      fill="rgba(255,255,255,0.1)" stroke="${P.cardBorder}" stroke-width="1.8"/>
    <!-- نشا + إنزيم اللعابين -->
    <path d="M ${t2X - 12} ${t2Y + 50} L ${t2X - 12} ${t2Y + 120} C ${t2X - 12} ${t2Y + 136}, ${t2X + 12} ${t2Y + 136}, ${t2X + 12} ${t2Y + 120} L ${t2X + 12} ${t2Y + 50} Z"
      fill="#fef08a" opacity="0.85"/>
    <ellipse cx="${t2X}" cy="${t2Y + 50}" rx="12" ry="3" fill="#fde047"/>

    <text x="${t2X}" y="${t2Y - 10}" fill="${P.textMain}" font-size="12" font-weight="bold" text-anchor="middle">(ب)</text>
    <text x="${t2X}" y="${t2Y + 80}" fill="#854d0e" font-size="8.5" font-weight="bold" text-anchor="middle">نشا+لعاب</text>
  </g>`;

  // 3. نتائج الكواشف الملونة على اليمين العلوي
  const reagX = 540;
  const reagY = 60;
  const reagW = 380;
  const reagH = 170;

  svg += `
  <g filter="url(#bio-shadow-${uid})">
    <rect x="${reagX}" y="${reagY}" width="${reagW}" height="${reagH}" rx="10" fill="${P.cardBg}" stroke="${P.cardBorder}" stroke-width="1.5"/>
    <rect x="${reagX}" y="${reagY}" width="${reagW}" height="28" rx="10" fill="#0284c7" opacity="0.9"/>
    <text x="${reagX + reagW / 2}" y="${reagY + 19}" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif">نتائج الكواشف اللونية بعد الهضم في 37°C</text>

    <!-- اختبار ماء اليود -->
    <g transform="translate(${reagX + 15}, ${reagY + 40})">
      <text x="${reagW - 30}" y="16" fill="${P.textMain}" font-size="11" font-weight="bold" text-anchor="end">1. كاشف ماء اليود (الكشف عن النشا):</text>
      <!-- أنبوب شاهد أزرق بنفسجي -->
      <rect x="${reagW - 130}" y="25" width="22" height="42" rx="3" fill="#1e1b4b" stroke="#312e81"/>
      <text x="${reagW - 140}" y="50" fill="#818cf8" font-size="10" text-anchor="end">الأنبوب (أ): أزرق بنفسجي (نشا موجود)</text>
      <!-- أنبوب ب أصفر بني -->
      <rect x="${reagW - 130}" y="72" width="22" height="42" rx="3" fill="#ca8a04" stroke="#a16207"/>
      <text x="${reagW - 140}" y="97" fill="#facc15" font-size="10" text-anchor="end">الأنبوب (ب): عدم تلون / أصفر بني (اختفاء النشا)</text>
    </g>
  </g>`;

  // 4. النموذج الجزيئي للتبسيط الأنزيمي (أسفل يمين)
  const molX = 540;
  const molY = 245;
  const molW = 380;
  const molH = 190;

  if (S.showMolecularModel) {
    svg += `
    <g filter="url(#bio-shadow-${uid})">
      <rect x="${molX}" y="${molY}" width="${molW}" height="${molH}" rx="10" fill="${P.cardBg}" stroke="${P.cardBorder}" stroke-width="1.5"/>
      <rect x="${molX}" y="${molY}" width="${molW}" height="28" rx="10" fill="#d97706" opacity="0.9"/>
      <text x="${molX + molW / 2}" y="${molY + 19}" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif">التبسيط الجزيئي النوعي (تأثير ${esc(S.enzyme)})</text>

      <!-- تمثيل جزيئة النشا المتسلسلة -->
      <g transform="translate(${molX + 20}, ${molY + 45})">
        <text x="${molW - 40}" y="14" fill="${P.textMain}" font-size="11" font-weight="bold" text-anchor="end">جزيئة ${esc(S.substrate)} الضخمة:</text>
        <circle cx="40" cy="30" r="8" fill="#cbd5e1" stroke="#64748b"/>
        <line x1="48" y1="30" x2="60" y2="30" stroke="#94a3b8" stroke-width="2"/>
        <circle cx="68" cy="30" r="8" fill="#cbd5e1" stroke="#64748b"/>
        <line x1="76" y1="30" x2="88" y2="30" stroke="#94a3b8" stroke-width="2"/>
        <circle cx="96" cy="30" r="8" fill="#cbd5e1" stroke="#64748b"/>
        <line x1="104" y1="30" x2="116" y2="30" stroke="#94a3b8" stroke-width="2"/>
        <circle cx="124" cy="30" r="8" fill="#cbd5e1" stroke="#64748b"/>
        <text x="145" y="34" fill="${P.textSub}" font-size="9">(سلاسل غلوكوز متعددة)</text>

        <!-- سهم عمل الإنزيم -->
        <path d="M 96 46 L 96 68" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="3 2"/>
        <polygon points="96,74 92,66 100,66" fill="#f59e0b"/>
        <text x="110" y="62" fill="#f59e0b" font-size="10.5" font-weight="bold">+ ${esc(S.enzyme)}</text>

        <!-- النواتج: جزيئات سكر ثنائي (مالتوز) -->
        <g transform="translate(0, 80)">
          <text x="${molW - 40}" y="14" fill="${P.textMain}" font-size="11" font-weight="bold" text-anchor="end">الناتج: ${esc(S.product)} ثنائي:</text>
          <!-- ثنائي 1 -->
          <circle cx="50" cy="32" r="8" fill="#fde047" stroke="#ca8a04"/>
          <line x1="58" y1="32" x2="68" y2="32" stroke="#eab308" stroke-width="2"/>
          <circle cx="76" cy="32" r="8" fill="#fde047" stroke="#ca8a04"/>

          <!-- ثنائي 2 -->
          <circle cx="110" cy="32" r="8" fill="#fde047" stroke="#ca8a04"/>
          <line x1="118" y1="32" x2="128" y2="32" stroke="#eab308" stroke-width="2"/>
          <circle cx="136" cy="32" r="8" fill="#fde047" stroke="#ca8a04"/>

          ${S.testReagent !== 'iodine' ? `<text x="${molW - 40}" y="52" fill="#4ade80" font-size="10" font-weight="bold" text-anchor="end">&#x2713; يعطي راسباً أحمر آجورياً مع محلول فهلنك المغلي</text>` : ''}
        </g>
      </g>
    </g>`;
  }

  // 5. التأشيرات
  const labels: CalloutItem[] = [
    { num: 1, ar: 'حمام مائي ثابت (37°C)', sub: 'Water Bath 37°C', target: [bathX, bathY + 60], card: [120, 460] },
    { num: 2, ar: 'الأنبوب الشاهد (أ) مطبوخ نشا', sub: 'Control Tube (Starch)', target: [t1X, t1Y + 30], card: [120, 110] },
    { num: 3, ar: 'الأنبوب الهضمي (ب) نشا+لعاب', sub: 'Digestive Tube (Enzyme)', target: [t2X, t2Y + 30], card: [330, 90] },
    { num: 4, ar: 'ميزان حرارة زئبقي', sub: 'Laboratory Thermometer', target: [bathX + bathW / 2 - 24, bathY - 20], card: [380, 40] },
    { num: 5, ar: 'كاشف ماء اليود وفهلنك', sub: 'Color Reagent Test', target: [reagX + 30, reagY + 80], card: [reagX + 220, reagY + 190] },
    ...(S.showMolecularModel ? [{ num: 6, ar: 'التبسيط الجزيئي للمالتوز', sub: 'Molecular Breakdown', target: [molX + 80, molY + 140] as [number, number], card: [molX + 240, molY + 220] as [number, number] }] : []),
  ];

  svg += renderCallouts(labels, S.labelsMode ?? 'full', P, uid);

  if (S.caption) {
    svg += `
    <g filter="url(#bio-shadow-${uid})">
      <rect x="80" y="${H - 38}" width="${W - 160}" height="30" rx="6" fill="${P.cardBg}" stroke="${P.cardBorder}" stroke-width="1"/>
      <text x="${W / 2}" y="${H - 19}" fill="${P.textMain}" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif">${esc(S.caption)}</text>
    </g>`;
  }

  return wrapSvg(svg, W, H, 'التجربة المخبرية للهضم النوعي للنشا في 37 درجة مئوية', opts);
}

// ============================================================
// 4. التنفس الخلوي واستعمال المغذيات (cellular_respiration)
// ============================================================
export function renderCellularRespiration(spec: CellularRespirationSpec, opts?: RenderOptions): string {
  const parsed = cellularRespirationSpecSchema.safeParse(spec);
  if (!parsed.success) return '';
  const S = parsed.data;

  const P = getPalette(S.theme);
  const uid = Math.random().toString(36).substring(2, 8);

  let svg = renderDefs(P, uid);

  // 1. الشعيرة الدموية على اليسار (تنقل المغذيات والغازات)
  const capX = 140;
  const capY = 240;
  const capW = 50;
  const capH = 400;

  svg += `
  <g filter="url(#bio-shadow-${uid})">
    <!-- وعاء شعيرة دموية مجسم 2.5D -->
    <rect x="${capX - capW / 2}" y="${capY - capH / 2}" width="${capW}" height="${capH}" rx="14" fill="rgba(239, 68, 68, 0.18)" stroke="${P.bloodArtery}" stroke-width="2"/>
    <line x1="${capX}" y1="${capY - capH / 2 + 10}" x2="${capX}" y2="${capY + capH / 2 - 10}" stroke="${P.bloodArtery}" stroke-width="2" stroke-dasharray="8 6"/>

    <!-- كريات دم حمراء مارة بالشعيرة تحمل O2 -->
    <circle cx="${capX}" cy="${capY - 120}" r="14" fill="url(#rbc-grad-${uid})"/>
    <circle cx="${capX}" cy="${capY}" r="14" fill="url(#rbc-grad-${uid})"/>
    <circle cx="${capX}" cy="${capY + 120}" r="14" fill="url(#rbc-grad-${uid})"/>

    <text x="${capX}" y="${capY - capH / 2 - 14}" fill="${P.bloodArtery}" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif">شعيرة دموية</text>
  </g>`;

  // 2. منطقة السائل البيني (بين الشعيرة والخلية) وأسهم الانتشار
  svg += `
  <g>
    <!-- تدفق غاز الأكسجين O2 من الدم للخلية -->
    <path d="M ${capX + capW / 2} ${capY - 80} L 310 ${capY - 80}" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 4"/>
    <polygon points="316,${capY - 80} 306,${capY - 84} 306,${capY - 76}" fill="#38bdf8"/>
    <text x="240" y="${capY - 90}" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">O&#x2082; (أكسجين)</text>

    <!-- تدفق الغلوكوز من الدم للخلية -->
    <path d="M ${capX + capW / 2} ${capY - 30} L 310 ${capY - 30}" stroke="#4ade80" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 4"/>
    <polygon points="316,${capY - 30} 306,${capY - 34} 306,${capY - 26}" fill="#4ade80"/>
    <text x="240" y="${capY - 40}" fill="#4ade80" font-size="12" font-weight="bold" text-anchor="middle">غلوكوز (C&#x2086;H&#x2081;&#x2082;O&#x2086;)</text>

    <!-- طرح غاز CO2 والفضلات من الخلية إلى الدم -->
    <path d="M 310 ${capY + 50} L ${capX + capW / 2} ${capY + 50}" stroke="#94a3b8" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 4"/>
    <polygon points="${capX + capW / 2 - 4},${capY + 50} ${capX + capW / 2 + 6},${capY + 46} ${capX + capW / 2 + 6},${capY + 54}" fill="#94a3b8"/>
    <text x="240" y="${capY + 40}" fill="#cbd5e1" font-size="12" font-weight="bold" text-anchor="middle">CO&#x2082; (طرح فضلات)</text>

    <text x="240" y="${capY + 120}" fill="${P.textSub}" font-size="10.5" text-anchor="middle" font-family="sans-serif">سائل بيني (لمف بيني)</text>
  </g>`;

  // 3. الخلية الحية المجسمة 2.5D مع ميتوكندريا في الوسط
  const cellX = 460;
  const cellY = 240;
  const cellW = 260;
  const cellH = 340;

  svg += `
  <g filter="url(#bio-shadow-${uid})">
    <!-- غشاء هيولي وسيتوبلازم الخلية -->
    <rect x="${cellX - cellW / 2}" y="${cellY - cellH / 2}" width="${cellW}" height="${cellH}" rx="22" fill="rgba(255,255,255,0.06)" stroke="#38bdf8" stroke-width="2.5"/>
    <text x="${cellX}" y="${cellY - cellH / 2 + 25}" fill="${P.textMain}" font-size="13" font-weight="bold" text-anchor="middle" font-family="sans-serif">${S.cellType === 'muscle' ? 'خلية عضلية نشطة' : 'خلية حية عامة'}</text>

    <!-- نواة الخلية -->
    <circle cx="${cellX - 60}" cy="${cellY - 70}" r="28" fill="#7c3aed" opacity="0.8" stroke="#5b21b6" stroke-width="1.5"/>
    <circle cx="${cellX - 64}" cy="${cellY - 74}" r="8" fill="#ddd6fe"/>
    <text x="${cellX - 60}" y="${cellY - 32}" fill="${P.textSub}" font-size="10" text-anchor="middle">نواة الخلية</text>

    <!-- الميتوكندريا 2.5D (محطة توليد الطاقة والتنفس الخلوي) -->
    <g transform="translate(${cellX + 15}, ${cellY + 20})">
      <ellipse cx="0" cy="0" rx="65" ry="42" fill="url(#mito-grad-${uid})" stroke="#9a3412" stroke-width="2"/>
      <!-- الأعراف الداخلية للميتوكندريا (Cristae) -->
      <path d="M -45 0 Q -25 -25 -20 0 Q -15 25 5 0 Q 25 -25 35 0" fill="none" stroke="#fed7aa" stroke-width="3.5" stroke-linecap="round"/>
      <text x="0" y="24" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">ميتوكندريا</text>
      <text x="0" y="36" fill="#ffedd5" font-size="8.5" text-anchor="middle">(مقر الأكسدة الخلوية)</text>
    </g>
  </g>`;

  // 4. بطاقة الطاقة والمعادلة الكيميائية الديناميكية على اليمين
  const cardX = 630;
  const cardY = 60;
  const cardW = 300;
  const cardH = 390;

  svg += `
  <g filter="url(#bio-shadow-${uid})">
    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="10" fill="${P.cardBg}" stroke="${P.cardBorder}" stroke-width="1.5"/>
    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="32" rx="10" fill="#ea580c" opacity="0.9"/>
    <text x="${cardX + cardW / 2}" y="${cardY + 21}" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle" font-family="sans-serif">حصيلة التنفس الخلوي لإنتاج الطاقة</text>

    <!-- المعادلة الكيميائية الإجمالية -->
    <g transform="translate(${cardX + 15}, ${cardY + 48})">
      <text x="${cardW - 30}" y="16" fill="${P.textMain}" font-size="11.5" font-weight="bold" text-anchor="end">معادلة التنفس الخلوي (أكسدة تامة):</text>
      <text x="${cardW / 2 - 15}" y="42" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">C&#x2086;H&#x2081;&#x2082;O&#x2086; + 6 O&#x2082; &#x2192; 6 CO&#x2082; + 6 H&#x2082;O + طاقة</text>
    </g>

    <line x1="${cardX + 15}" y1="${cardY + 115}" x2="${cardX + cardW - 15}" y2="${cardY + 115}" stroke="${P.cardBorder}" stroke-width="1"/>

    <!-- تفصيل الحصيلة الطاقوية (ديناميكية من input) -->
    <g transform="translate(${cardX + 15}, ${cardY + 130})">
      <text x="${cardW - 30}" y="14" fill="${P.textMain}" font-size="12" font-weight="bold" text-anchor="end">الحصيلة الطاقوية الإجمالية:</text>
      <text x="${cardW / 2 - 15}" y="38" fill="#f59e0b" font-size="15" font-weight="bold" text-anchor="middle">E = ${S.energyKJ} kJ / mol</text>

      <!-- توزيع الطاقة -->
      <rect x="15" y="55" width="${cardW - 60}" height="30" rx="5" fill="rgba(255,255,255,0.04)" stroke="${P.cardBorder}"/>
      <rect x="15" y="55" width="${(cardW - 60) * (S.atpPercent / 100)}" height="30" rx="5" fill="#10b981" opacity="0.8"/>
      <text x="${cardW / 2 - 15}" y="74" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">طاقة حيوية ATP: ${S.atpPercent}%</text>

      <text x="${cardW - 30}" y="110" fill="${P.textSub}" font-size="10.5" text-anchor="end">&#x2022; طاقة قابلة للاستعمال: للنشاط والتقلص العضلي</text>
      <text x="${cardW - 30}" y="130" fill="#f87171" font-size="10.5" text-anchor="end">&#x2022; طاقة حرارية ضائعة (${S.heatPercent}%): ثبات حرارة 37°C</text>

      <text x="${cardW - 30}" y="165" fill="${P.textMain}" font-size="11" font-weight="bold" text-anchor="end">الفضلات المطروحة إلى الدم:</text>
      <text x="${cardW - 40}" y="185" fill="${P.textSub}" font-size="10.5" text-anchor="end">غاز CO&#x2082; + بخار ماء H&#x2082;O + فضلات آزوتية (يوريا)</text>
    </g>
  </g>`;

  // 5. التأشيرات
  const labels: CalloutItem[] = [
    { num: 1, ar: 'شعيرة دموية واردة (مغذيات و O2)', sub: 'Blood Capillary', target: [capX, capY - 60], card: [100, 70] },
    { num: 2, ar: 'السائل البيني (وسيط التبادل)', sub: 'Interstitial Lymph', target: [240, capY], card: [240, 430] },
    { num: 3, ar: 'غشاء وسيتوبلازم الخلية الحية', sub: 'Living Cell Cytoplasm', target: [cellX - 70, cellY + 60], card: [390, 460] },
    { num: 4, ar: 'الميتوكندريا (الأكسدة الخلوية)', sub: 'Mitochondria Organelle', target: [cellX + 15, cellY + 20], card: [530, 460] },
    { num: 5, ar: 'دخول الأكسجين والغلوكوز', sub: 'O2 & Glucose Influx', target: [300, capY - 50], card: [320, 100] },
    { num: 6, ar: 'طرح ثنائي أكسيد الكربون CO2', sub: 'CO2 Waste Elimination', target: [290, capY + 50], card: [120, 390] },
  ];

  svg += renderCallouts(labels, S.labelsMode ?? 'full', P, uid);

  if (S.caption) {
    svg += `
    <g filter="url(#bio-shadow-${uid})">
      <rect x="80" y="${H - 38}" width="${W - 160}" height="30" rx="6" fill="${P.cardBg}" stroke="${P.cardBorder}" stroke-width="1"/>
      <text x="${W / 2}" y="${H - 19}" fill="${P.textMain}" font-size="12" font-weight="bold" text-anchor="middle" font-family="sans-serif">${esc(S.caption)}</text>
    </g>`;
  }

  return wrapSvg(svg, W, H, 'رسم تخطيطي للمبادلات والتنفس الخلوي لإنتاج الطاقة', opts);
}
