// ============================================================
// Setup Figure — تراكيب تجريبية مخبرية معلَمية (فيزياء/علوم)
// ============================================================
// النموذج يصف نوع التجربة (+ المادة اختيارياً)، والمحرك يرسم التركيب المخبري
// الصحيح برموز اصطلاحية ثابتة. يحلّ الفجوة التي أجبرت النموذج سابقاً على وصف
// كل تجربة نصياً. يعتمد "presets" (أنواع جاهزة) لأن رسم تركيب حر عشوائي
// غير قابل للضبط. يُشار إليه في prompts/profiles/physics.md كمولّد منتظَر.
//
// مبدأ "لا يرمي أبداً" — kind مجهول/labels خاطئة → '' (لا يكسر التصيير).
// ============================================================

import { z } from 'zod';
import {
  esc,
  text,
  wrapSvg,
  resolveColor,
  resolveFont,
  type RenderOptions,
  strokeAttr,
  strokeThinAttr,
  fillAttr,
} from './shared.js';

// ------------------------------------------------------------
// مخططات Zod — أنواع التجارب والتسميات
// ------------------------------------------------------------
export const setupKindSchema = z.enum([
  'heating',       // تسخين
  'burning',       // احتراق
  'filtration',    // ترشيح
  'melting',       // ذوبان
  'distillation',  // تقطير
  'decantation',   // تصفية / ديكانتاسيون
  'electrolysis',  // تحليل كهربائي
  'conductivity',  // اختبار ناقلية محلول (دارة + مصباح + مسريان)
]);
export type SetupKind = z.infer<typeof setupKindSchema>;

/** تسميات اختيارية لكل تجربة */
const setupLabelsSchema = z
  .object({
    /** المادة الفعلية للتجربة (كبريت، سكر، ملح…). */
    substance: z.string().max(30).optional(),
    /** السائل المُذيب (ماء، كحول…). */
    solvent: z.string().max(20).optional(),
    /** المنتج الناتج (في التقطير والتحليل الكهربائي). */
    product: z.string().max(30).optional(),
    /** درجة الحرارة المطلوبة (في التسخين والتقطير). */
    temperature: z.string().max(20).optional(),
  })
  .strict();

export const setupSpecSchema = z
  .object({
    kind: setupKindSchema,
    labels: setupLabelsSchema.optional(),
  })
  .strict();
export type SetupSpec = z.infer<typeof setupSpecSchema>;

// ------------------------------------------------------------
// أدوات مساعدة محلية للرسم
// ------------------------------------------------------------

/** استخراج لون الحدّ مع الحفاظ على التوافق — عند غياب opts يُستخدم currentColor */
function strokeColor(opts?: RenderOptions): string {
  return opts ? resolveColor(opts) : 'currentColor';
}

/** سمة الزجاج — شفافية زجاجية مع لون الحدّ المُمرَّر */
function glassAttr(c: string): string {
  return `fill="rgba(125,180,220,0.18)" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"`;
}

/** لهب الموقد — ثلاث طبقات متدرّجة (خارجي برتقالي ← وسط أصفر ← داخلي أزرق) */
function bunsenFlame(cx: number, bottom: number): string {
  const outer =
    `<path d="M ${cx - 7} ${bottom} Q ${cx - 14} ${bottom - 22} ${cx} ${bottom - 42} Q ${cx + 14} ${bottom - 22} ${cx + 7} ${bottom} Z" fill="rgba(255,140,40,0.5)" stroke="rgba(220,100,20,0.6)" stroke-width="1"/>`;
  const mid =
    `<path d="M ${cx - 4} ${bottom} Q ${cx - 8} ${bottom - 16} ${cx} ${bottom - 32} Q ${cx + 8} ${bottom - 16} ${cx + 4} ${bottom} Z" fill="rgba(255,195,70,0.6)" stroke="none"/>`;
  const inner =
    `<path d="M ${cx - 2} ${bottom} Q ${cx - 3} ${bottom - 10} ${cx} ${bottom - 22} Q ${cx + 3} ${bottom - 10} ${cx + 2} ${bottom} Z" fill="rgba(80,150,255,0.55)" stroke="none"/>`;
  return outer + mid + inner;
}

/** خط انعكاس سطح السائل — يُعطي مظهراً لامعاً */
function liquidSurface(x1: number, x2: number, y: number): string {
  return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="rgba(200,225,245,0.45)" stroke-width="1" stroke-linecap="round"/>`;
}

/** خط انعكاس زجاجي على الجانب الأيسر من الوعاء */
function glassHighlight(x: number, y1: number, y2: number): string {
  return `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="rgba(255,255,255,0.22)" stroke-width="1.5" stroke-linecap="round"/>`;
}

/** رأس سهم صغير يشير للأسفل */
function arrowDown(cx: number, tipY: number, size: number): string {
  return `<polygon points="${cx - size},${tipY - size * 1.6} ${cx + size},${tipY - size * 1.6} ${cx},${tipY}" ${fillAttr('currentColor')}/>`;
}

/** رأس سهم صغير يشير للأعلى */
function arrowUp(cx: number, tipY: number, size: number): string {
  return `<polygon points="${cx - size},${tipY + size * 1.6} ${cx + size},${tipY + size * 1.6} ${cx},${tipY}" ${fillAttr('currentColor')}/>`;
}

// ============================================================
// heating — تسخين مادة في أنبوب اختبار فوق لهب الموقد وحامل ثلاثي
// ============================================================
function renderHeating(spec: SetupSpec, opts?: RenderOptions): string {
  const c = strokeColor(opts);
  const substance = spec.labels?.substance?.trim();
  const temperature = spec.labels?.temperature?.trim();
  const W = 300, H = 260;
  const p: string[] = [
    // — حامل ثلاثي —
    // قاعدة الحامل
    `<line x1="40" y1="210" x2="120" y2="210" ${strokeAttr(c)}/>`,
    // عمود الحامل
    `<line x1="60" y1="210" x2="60" y2="95" ${strokeAttr(c)}/>`,
    // ذراع الحامل
    `<line x1="60" y1="125" x2="150" y2="125" ${strokeAttr(c)}/>`,
    // مشبك الحامل (حلقة)
    `<circle cx="150" cy="125" r="6" ${strokeAttr(c)}/>`,
    // — أنبوب الاختبار (زجاج) مائل قليلاً —
    `<g transform="rotate(-12 155 120)">`,
    `<rect x="140" y="60" width="30" height="110" rx="4" ry="4" ${glassAttr(c)}/>`,
    `<path d="M 140 168 Q 155 178 170 168" ${strokeThinAttr(c)}/>`,
    glassHighlight(144, 66, 162),
  ];
  // المادة داخل الأنبوب (تملأ الثلث السفلي)
  if (substance) {
    p.push(
      `<rect x="142" y="130" width="26" height="38" rx="2" fill="rgba(200,120,60,0.4)" stroke="none"/>`,
      liquidSurface(143, 167, 130),
      text(155, 152, substance, { size: 9 }, opts),
    );
  }
  p.push(`</g>`);
  // — موقد بنزن —
  p.push(
    `<rect x="140" y="205" width="30" height="8" rx="2" ${strokeAttr(c)}/>`,
    `<rect x="151" y="180" width="8" height="25" ${strokeAttr(c)}/>`,
    bunsenFlame(155, 180),
  );
  // تسمية درجة الحرارة إن وُجدت
  if (temperature) {
    p.push(text(200, 100, `${esc(temperature)} °C`, { size: 9, anchor: 'start' }, opts));
  }
  // تسميات الأجزاء
  p.push(text(70, 232, 'حامل', { size: 10 }, opts));
  p.push(text(155, 232, 'موقد', { size: 10 }, opts));
  return wrapSvg(p.join(''), W, H, spec.labels?.substance ?? 'تسخين', opts);
}

// ============================================================
// burning — احتراق مادة في ملعقة احتراق فوق لهب الموقد
// ============================================================
function renderBurning(spec: SetupSpec, opts?: RenderOptions): string {
  const c = strokeColor(opts);
  const substance = spec.labels?.substance?.trim();
  const W = 280, H = 220;
  const p: string[] = [
    // مقبض ملعقة الاحتراق
    `<line x1="60" y1="110" x2="150" y2="110" ${strokeAttr(c)}/>`,
    // ملعقة الاحتراق (بيضاوية)
    `<ellipse cx="160" cy="110" rx="18" ry="8" ${glassAttr(c)}/>`,
  ];
  // المادة داخل الملعقة
  if (substance) {
    p.push(
      `<path d="M 144 110 Q 160 100 176 110" fill="rgba(80,80,80,0.6)" stroke="none"/>`,
      text(160, 96, substance, { size: 9 }, opts),
    );
  }
  // الموقد ولهبه
  p.push(
    bunsenFlame(160, 158),
    `<rect x="135" y="178" width="40" height="8" rx="2" ${strokeAttr(c)}/>`,
    `<rect x="150" y="158" width="10" height="20" ${strokeAttr(c)}/>`,
    // دخان / طلاقات صاعدة
    `<path d="M 155 88 Q 150 75 158 65" ${strokeThinAttr(c)}/>`,
    `<path d="M 165 88 Q 170 75 162 65" ${strokeThinAttr(c)}/>`,
  );
  // تسميات
  p.push(text(40, 110, 'ملعقة', { size: 10, anchor: 'end' }, opts));
  p.push(text(155, 200, 'موقد', { size: 10 }, opts));
  return wrapSvg(p.join(''), W, H, spec.labels?.substance ?? 'احتراق', opts);
}

// ============================================================
// filtration — ترشيح: قمع ورق فوق بيكر، رشاحة تنقط
// ============================================================
function renderFiltration(spec: SetupSpec, opts?: RenderOptions): string {
  const c = strokeColor(opts);
  const substance = spec.labels?.substance?.trim();
  const solvent = spec.labels?.solvent?.trim();
  const W = 260, H = 250;
  const p: string[] = [
    // — حامل القمع —
    `<line x1="40" y1="212" x2="100" y2="212" ${strokeAttr(c)}/>`,
    `<line x1="60" y1="212" x2="60" y2="82" ${strokeAttr(c)}/>`,
    `<line x1="60" y1="72" x2="140" y2="72" ${strokeAttr(c)}/>`,
    `<circle cx="140" cy="72" r="8" ${strokeAttr(c)}/>`,
    // — قمع ورق الترشيح (مثلث مقلوب) —
    `<polygon points="115,42 165,42 140,92" ${glassAttr(c)}/>`,
    // محتوى القمع (خليط عكِر) — نصف ممتلئ
    `<polygon points="118,57 162,57 140,92" fill="rgba(160,140,100,0.5)" stroke="none"/>`,
  ];
  if (substance) {
    p.push(text(140, 34, `خليط ${esc(substance)}`, { size: 9 }, opts));
  }
  // قطرة من فوهة القمع
  p.push(`<ellipse cx="140" cy="102" rx="2.5" ry="4" ${fillAttr(c)}/>`);
  // — البيكر (كأس) أسفل القمع —
  p.push(
    `<path d="M 110 112 L 110 182 Q 110 192 120 192 L 160 192 Q 170 192 170 182 L 170 112" ${glassAttr(c)}/>`,
    `<path d="M 108 114 L 116 110" ${strokeAttr(c)}/>`,
    glassHighlight(114, 118, 180),
  );
  // الرشاحة (سائل نقي) داخل البيكر
  p.push(
    `<rect x="112" y="150" width="56" height="40" fill="rgba(120,180,220,0.35)" stroke="none"/>`,
    liquidSurface(113, 167, 150),
  );
  if (solvent) {
    p.push(text(140, 183, solvent, { size: 9 }, opts));
  }
  // تسميات
  p.push(text(140, 215, 'رشاحة', { size: 10 }, opts));
  p.push(text(60, 207, 'حامل', { size: 10, anchor: 'end' }, opts));
  return wrapSvg(p.join(''), W, H, spec.labels?.substance ?? 'فلترة', opts);
}

// ============================================================
// melting — ذوبان مادة صلبة في سائل داخل بيكر مع تحريك
// ============================================================
function renderMelting(spec: SetupSpec, opts?: RenderOptions): string {
  const c = strokeColor(opts);
  const substance = spec.labels?.substance?.trim();
  const solvent = spec.labels?.solvent?.trim();
  const W = 260, H = 230;
  const p: string[] = [
    // — البيكر —
    `<path d="M 70 70 L 70 172 Q 70 187 85 187 L 175 187 Q 190 187 190 172 L 190 70" ${glassAttr(c)}/>`,
    `<path d="M 68 72 L 80 66" ${strokeAttr(c)}/>`,
    glassHighlight(75, 76, 174),
  ];
  // السائل داخل البيكر (حتى ~⅔)
  p.push(
    `<rect x="72" y="108" width="116" height="77" fill="rgba(120,180,220,0.35)" stroke="none"/>`,
    liquidSurface(73, 187, 108),
  );
  if (solvent) {
    p.push(text(130, 102, solvent, { size: 10 }, opts));
  }
  // المادة الصلبة (قطع صغيرة في القاع)
  if (substance) {
    p.push(
      `<rect x="95" y="165" width="10" height="8" rx="1" fill="rgba(200,120,60,0.7)" stroke="none"/>`,
      `<rect x="120" y="170" width="9" height="7" rx="1" fill="rgba(200,120,60,0.7)" stroke="none"/>`,
      `<rect x="145" y="167" width="11" height="8" rx="1" fill="rgba(200,120,60,0.7)" stroke="none"/>`,
      `<rect x="110" y="173" width="8" height="6" rx="1" fill="rgba(200,120,60,0.7)" stroke="none"/>`,
      `<rect x="160" y="170" width="9" height="7" rx="1" fill="rgba(200,120,60,0.7)" stroke="none"/>`,
      text(130, 158, substance, { size: 9 }, opts),
    );
  }
  // قضيب التحريك
  p.push(
    `<line x1="155" y1="40" x2="120" y2="138" ${strokeAttr(c)}/>`,
    text(162, 35, 'تحريك', { size: 10, anchor: 'start' }, opts),
  );
  return wrapSvg(p.join(''), W, H, spec.labels?.substance ?? 'ذوبان', opts);
}

// ============================================================
// distillation — تقطير: قارورة كروية + موقد + مُكثِّف + بيكر جمع
// ============================================================
function renderDistillation(spec: SetupSpec, opts?: RenderOptions): string {
  const c = strokeColor(opts);
  const substance = spec.labels?.substance?.trim();
  const product = spec.labels?.product?.trim();
  const temperature = spec.labels?.temperature?.trim();
  const W = 340, H = 280;
  const p: string[] = [];

  // ——— حامل ثلاثي ———
  p.push(
    `<line x1="18" y1="242" x2="98" y2="242" ${strokeAttr(c)}/>`,   // قاعدة
    `<line x1="42" y1="242" x2="42" y2="100" ${strokeAttr(c)}/>`,    // عمود
    `<line x1="42" y1="172" x2="95" y2="172" ${strokeAttr(c)}/>`,    // ذراع
    `<path d="M 90 169 Q 96 164 102 169" ${strokeThinAttr(c)}/>`,     // مشبك صغير
  );

  // ——— قارورة كروية (Round-bottom flask) ———
  // جسم القارورة
  p.push(`<circle cx="75" cy="160" r="32" ${glassAttr(c)}/>`);
  // عنق القارورة
  p.push(`<rect x="69" y="90" width="12" height="38" rx="2" ${glassAttr(c)}/>`);
  // انعكاس زجاجي
  p.push(glassHighlight(52, 136, 178));
  // السائل داخل القارورة
  p.push(
    `<path d="M 55 162 Q 55 180 75 192 Q 95 180 95 162 Z" fill="rgba(120,180,220,0.35)" stroke="none"/>`,
    liquidSurface(56, 94, 162),
  );
  if (substance) {
    p.push(text(75, 182, substance, { size: 9 }, opts));
  }

  // ——— ميزان حرارة ———
  p.push(
    `<line x1="75" y1="50" x2="75" y2="118" ${strokeThinAttr(c)}/>`,                       // قضيب الزجاج
    `<line x1="75" y1="62" x2="75" y2="116" stroke="rgba(220,40,40,0.5)" stroke-width="1.5"/>`, // عمود الزئبق
    `<circle cx="75" cy="119" r="3.5" fill="rgba(220,40,40,0.7)" stroke="none"/>`,              // كرة الزئبق
  );
  if (temperature) {
    p.push(text(75, 44, `${esc(temperature)} °C`, { size: 9, bold: true }, opts));
  }

  // ——— مُكثِّف (Condenser) ———
  // يُرسم أفقياً ثم يُدار 19° حول نقطة البداية
  // البداية: أعلى عنق القارورة (82, 90) → النهاية التقريبية: (285, 160)
  p.push(
    `<g transform="rotate(19 82 90)">`,
    // غلاف التبريد الخارجي (أنبوب أوسع)
    `<rect x="100" y="78" width="178" height="24" rx="6" ${glassAttr(c)}/>`,
    // خط انعكاس على الغلاف
    `<line x1="108" y1="82" x2="108" y2="98" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>`,
    // الأنبوب الداخلي (يمتد من داخل القارورة إلى خارج الغلاف)
    `<line x1="72" y1="90" x2="306" y2="90" stroke="${c}" stroke-width="1.5" stroke-linecap="round"/>`,
    // مدخل الماء البارد (أسفل الجانب الأيمن من الغلاف)
    `<line x1="258" y1="102" x2="258" y2="116" ${strokeThinAttr(c)}/>`,
    arrowDown(258, 118, 2.5),
    // مخرج الماء الدافئ (أعلى الجانب الأيسر من الغلاف)
    `<line x1="122" y1="78" x2="122" y2="64" ${strokeThinAttr(c)}/>`,
    arrowUp(122, 62, 2.5),
    `</g>`,
  );
  // تسمية المُكثِّف (خارج مجموعة الدوران)
  p.push(text(192, 58, 'مُكثِّف', { size: 9 }, opts));

  // ——— بيكر الجمع ———
  p.push(
    `<path d="M 262 160 L 262 232 Q 262 242 272 242 L 302 242 Q 312 242 312 232 L 312 160" ${glassAttr(c)}/>`,
    `<path d="M 260 162 L 268 158" ${strokeAttr(c)}/>`,
    glassHighlight(266, 165, 230),
  );
  // السائل المقطر
  p.push(
    `<rect x="264" y="198" width="46" height="42" fill="rgba(120,180,220,0.35)" stroke="none"/>`,
    liquidSurface(265, 309, 198),
  );
  if (product) {
    p.push(text(287, 234, product, { size: 9 }, opts));
  }

  // ——— موقد بنزن ———
  p.push(
    `<rect x="62" y="226" width="26" height="7" rx="2" ${strokeAttr(c)}/>`,
    `<rect x="71" y="206" width="8" height="20" ${strokeAttr(c)}/>`,
    bunsenFlame(75, 206),
  );

  // ——— تسميات الأجزاء ———
  p.push(text(42, 260, 'حامل', { size: 10 }, opts));
  p.push(text(75, 260, 'موقد', { size: 10 }, opts));
  p.push(text(287, 258, 'بيكر جمع', { size: 9 }, opts));

  return wrapSvg(p.join(''), W, H, spec.labels?.substance ?? 'تقطير', opts);
}

// ============================================================
// decantation — تصفية / ديكانتاسيون: صبّ سائل صافٍ وترك الراسب
// ============================================================
function renderDecantation(spec: SetupSpec, opts?: RenderOptions): string {
  const c = strokeColor(opts);
  const substance = spec.labels?.substance?.trim();
  const solvent = spec.labels?.solvent?.trim();
  const W = 300, H = 240;
  const p: string[] = [];

  // ——— البيكر المائل (يُصبّ منه) ———
  // يُدار 30° عكس عقارب الساعة حول مركزه التقريبي
  p.push(`<g transform="rotate(-30 105 140)">`);
  // جسم البيكر
  p.push(
    `<path d="M 80 82 L 80 172 Q 80 187 95 187 L 115 187 Q 130 187 130 172 L 130 82" ${glassAttr(c)}/>`,
    `<path d="M 78 84 L 86 80" ${strokeAttr(c)}/>`,
    glassHighlight(84, 88, 174),
  );
  // السائل (الجزء العلوي بعد ميل البيكر)
  p.push(
    `<rect x="82" y="95" width="46" height="88" fill="rgba(120,180,220,0.35)" stroke="none"/>`,
    liquidSurface(83, 127, 95),
  );
  // الراسب الصلب في القاع
  p.push(
    `<path d="M 83 172 Q 105 182 127 172 L 127 184 Q 127 187 115 187 L 95 187 Q 83 187 83 184 Z" fill="rgba(160,140,100,0.55)" stroke="none"/>`,
    // حبيبات راسب مرئية
    `<circle cx="96" cy="180" r="2" fill="rgba(140,120,80,0.6)" stroke="none"/>`,
    `<circle cx="107" cy="182" r="2.5" fill="rgba(140,120,80,0.5)" stroke="none"/>`,
    `<circle cx="116" cy="179" r="1.8" fill="rgba(140,120,80,0.55)" stroke="none"/>`,
  );
  p.push(`</g>`);

  // ——— تيّار الصبّ (من البيكر المائل إلى البيكر المستقبل) ———
  // نقطة البداية التقريبية بعد دوران فوهة البيكر ≈ (157, 76)
  p.push(
    // تيّار السائل الرئيسي
    `<path d="M 155 76 Q 180 100 212 132" stroke="rgba(120,180,220,0.6)" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
    // انعكاس خفيف على التيار
    `<path d="M 155 76 Q 180 100 212 132" stroke="rgba(200,230,250,0.3)" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
  );
  // سهم اتجاه الصبّ
  p.push(`<polygon points="209,128 217,134 210,137" ${fillAttr(c)}/>`);

  // ——— البيكر المستقبل ———
  p.push(
    `<path d="M 205 132 L 205 208 Q 205 218 215 218 L 255 218 Q 265 218 265 208 L 265 132" ${glassAttr(c)}/>`,
    `<path d="M 203 134 L 211 130" ${strokeAttr(c)}/>`,
    glassHighlight(209, 138, 206),
  );
  // السائل الصافي في البيكر المستقبل
  p.push(
    `<rect x="207" y="172" width="56" height="44" fill="rgba(120,180,220,0.35)" stroke="none"/>`,
    liquidSurface(208, 262, 172),
  );

  // ——— تسميات ———
  if (substance) {
    p.push(text(80, 215, substance, { size: 9 }, opts));
  }
  if (solvent) {
    p.push(text(235, 212, solvent, { size: 9 }, opts));
  }
  p.push(text(105, 235, 'راسب', { size: 9 }, opts));
  p.push(text(235, 235, 'سائل صافٍ', { size: 9 }, opts));

  return wrapSvg(p.join(''), W, H, spec.labels?.substance ?? 'تصفية', opts);
}

// ============================================================
// electrolysis — تحليل كهربائي: بيكر مع قطبين وبطارية وفقاعات
// ============================================================
function renderElectrolysis(spec: SetupSpec, opts?: RenderOptions): string {
  const c = strokeColor(opts);
  const substance = spec.labels?.substance?.trim();
  const product = spec.labels?.product?.trim();
  const W = 300, H = 260;
  const p: string[] = [];

  // ——— البيكر ———
  p.push(
    `<path d="M 80 80 L 80 218 Q 80 233 95 233 L 205 233 Q 220 233 220 218 L 220 80" ${glassAttr(c)}/>`,
    `<path d="M 78 82 L 90 76" ${strokeAttr(c)}/>`,
    glassHighlight(85, 86, 220),
  );
  // المحلول الإلكتروليتي (أزرق فاتح)
  p.push(
    `<rect x="82" y="105" width="136" height="126" fill="rgba(100,160,220,0.3)" stroke="none"/>`,
    liquidSurface(83, 217, 105),
  );

  // ——— القطب الموجب (أنود +) ———
  p.push(
    `<line x1="130" y1="50" x2="130" y2="180" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`,
    text(130, 44, '+', { size: 14, bold: true }, opts),
  );
  // فقاعات عند القطب الموجب
  p.push(
    `<circle cx="126" cy="108" r="2" fill="rgba(255,255,255,0.4)" stroke="none"/>`,
    `<circle cx="134" cy="118" r="1.5" fill="rgba(255,255,255,0.35)" stroke="none"/>`,
    `<circle cx="128" cy="92" r="2.5" fill="rgba(255,255,255,0.3)" stroke="none"/>`,
    `<circle cx="133" cy="82" r="1.8" fill="rgba(255,255,255,0.25)" stroke="none"/>`,
    `<circle cx="127" cy="130" r="1.5" fill="rgba(255,255,255,0.3)" stroke="none"/>`,
  );

  // ——— القطب السالب (كاثود −) ———
  p.push(
    `<line x1="170" y1="50" x2="170" y2="180" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`,
    text(170, 44, '−', { size: 14, bold: true }, opts),
  );
  // فقاعات عند القطب السالب
  p.push(
    `<circle cx="166" cy="104" r="2" fill="rgba(255,255,255,0.4)" stroke="none"/>`,
    `<circle cx="174" cy="114" r="1.5" fill="rgba(255,255,255,0.35)" stroke="none"/>`,
    `<circle cx="168" cy="88" r="2.5" fill="rgba(255,255,255,0.3)" stroke="none"/>`,
    `<circle cx="173" cy="80" r="2" fill="rgba(255,255,255,0.25)" stroke="none"/>`,
    `<circle cx="167" cy="126" r="1.5" fill="rgba(255,255,255,0.3)" stroke="none"/>`,
  );

  // ——— أسلاك من الأقطاب إلى البطارية ———
  p.push(
    // سلك من القطب الموجب إلى البطارية
    `<line x1="130" y1="50" x2="130" y2="26" ${strokeAttr(c)}/>`,
    // سلك من القطب السالب إلى البطارية
    `<line x1="170" y1="50" x2="170" y2="26" ${strokeAttr(c)}/>`,
  );

  // ——— البطارية ———
  p.push(
    // جسم البطارية
    `<rect x="138" y="10" width="24" height="16" rx="3" ${strokeAttr(c)}/>`,
    // خط الطرف الموجب (يسار)
    `<line x1="138" y1="18" x2="130" y2="18" ${strokeAttr(c)}/>`,
    // خط الطرف السالب (يمين)
    `<line x1="162" y1="18" x2="170" y2="18" ${strokeAttr(c)}/>`,
    // نقاط الاتصال
    `<circle cx="130" cy="18" r="2" ${fillAttr(c)}/>`,
    `<circle cx="170" cy="18" r="2" ${fillAttr(c)}/>`,
  );
  p.push(text(150, 6, 'بطارية', { size: 8 }, opts));

  // ——— تسميات ———
  if (substance) {
    p.push(text(150, 228, substance, { size: 9 }, opts));
  }
  if (product) {
    p.push(text(150, 215, product, { size: 9 }, opts));
  }
  p.push(text(110, 198, 'أنود', { size: 8 }, opts));
  p.push(text(190, 198, 'كاثود', { size: 8 }, opts));

  return wrapSvg(p.join(''), W, H, spec.labels?.substance ?? 'تحليل كهربائي', opts);
}

// ============================================================
// conductivity — اختبار ناقلية محلول: كأس محلول + مسريان + مصباح + مولّد + قاطع
// ============================================================
// النشاط القياسي في «المحاليل الشاردية والجزيئية»: تُقارَن ناقلية الماء المقطر
// والمحاليل بملاحظة توهّج المصباح. المصباح مرسوم بلا أشعّة توهّج عمداً — الشكل
// واحد للحالات الثلاث، والنتيجة يقرّرها المحلول لا الرسم.
function renderConductivity(spec: SetupSpec, opts?: RenderOptions): string {
  const c = strokeColor(opts);
  const substance = spec.labels?.substance?.trim();
  const solvent = spec.labels?.solvent?.trim();
  const W = 300, H = 270;
  const p: string[] = [];

  // ——— الكأس والمحلول ———
  p.push(
    `<path d="M 90 112 L 90 226 Q 90 241 105 241 L 195 241 Q 210 241 210 226 L 210 112" ${glassAttr(c)}/>`,
    glassHighlight(96, 120, 228),
    `<rect x="92" y="142" width="116" height="97" fill="rgba(100,160,220,0.3)" stroke="none"/>`,
    liquidSurface(93, 207, 142),
  );

  // ——— المسريان (قطبان غاطسان في المحلول) ———
  for (const x of [125, 175]) {
    p.push(`<line x1="${x}" y1="70" x2="${x}" y2="200" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`);
  }

  // ——— أسلاك التوصيل: من المسريين إلى الدارة العلوية ———
  p.push(
    `<path d="M 125 70 L 125 58 L 50 58 L 50 34" ${strokeAttr(c)}/>`,
    `<path d="M 175 70 L 175 58 L 250 58 L 250 34" ${strokeAttr(c)}/>`,
    // السلك العلوي مقطّع لإفساح مواضع القاطع والمولّد والمصباح
    `<path d="M 50 30 L 74 30" ${strokeAttr(c)}/>`,
    `<path d="M 104 30 L 138 30" ${strokeAttr(c)}/>`,
    `<path d="M 162 30 L 197 30" ${strokeAttr(c)}/>`,
    `<path d="M 223 30 L 250 30" ${strokeAttr(c)}/>`,
  );

  // ——— القاطع (مغلق) ———
  p.push(
    `<circle cx="76" cy="30" r="2.5" ${fillAttr(c)}/>`,
    `<circle cx="102" cy="30" r="2.5" ${fillAttr(c)}/>`,
    `<line x1="76" y1="30" x2="103" y2="24" ${strokeAttr(c)}/>`,
    text(89, 15, 'قاطع', { size: 8 }, opts),
  );

  // ——— المولّد (خطّان: طويل موجب، قصير سالب) ———
  p.push(
    `<line x1="144" y1="18" x2="144" y2="42" ${strokeAttr(c)}/>`,
    `<line x1="156" y1="24" x2="156" y2="36" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`,
    text(150, 54, 'مولّد', { size: 8 }, opts),
  );

  // ——— المصباح (دائرة بصليب) ———
  p.push(
    `<circle cx="210" cy="30" r="13" ${strokeAttr(c)}/>`,
    `<line x1="201" y1="21" x2="219" y2="39" ${strokeThinAttr(c)}/>`,
    `<line x1="219" y1="21" x2="201" y2="39" ${strokeThinAttr(c)}/>`,
    text(210, 12, 'مصباح', { size: 8 }, opts),
  );

  // ——— التسميات ———
  // تسمية واحدة تحت الكأس: المحلول هو المتغيّر الوحيد بين حالات التجربة.
  const liquid = substance || solvent;
  p.push(text(150, 90, 'مسريان', { size: 8 }, opts));
  if (liquid) p.push(text(150, 258, liquid, { size: 9 }, opts));

  return wrapSvg(p.join(''), W, H, liquid ?? 'اختبار ناقلية محلول', opts);
}

// ------------------------------------------------------------
// الموزّع العام للتراكيب التجريبية
// مبدأ "لا يرمي أبداً" — يُرجع سلسلة فارغة عند أي خطأ.
// ------------------------------------------------------------
export function renderSetup(spec: SetupSpec, opts?: RenderOptions): string {
  try {
    switch (spec.kind) {
      case 'heating':
        return renderHeating(spec, opts);
      case 'burning':
        return renderBurning(spec, opts);
      case 'filtration':
        return renderFiltration(spec, opts);
      case 'melting':
        return renderMelting(spec, opts);
      case 'distillation':
        return renderDistillation(spec, opts);
      case 'decantation':
        return renderDecantation(spec, opts);
      case 'electrolysis':
        return renderElectrolysis(spec, opts);
      case 'conductivity':
        return renderConductivity(spec, opts);
      default:
        return '';
    }
  } catch {
    return '';
  }
}