# NEW-GENERATORS-BRIEF.md — دليل إضافة مولّدات رسوم معلَمية جديدة لـ averroes-figures

عقد تنفيذ لوكيل (أو محرِّر بشري) لإضافة **مولّدات معلَمية** جديدة (رسوم تُبنى من بيانات/بارامترات)
تُغطّي مواد أكثر من الجيل الثاني الجزائري. المولّدات الحالية: `chart` · `geometry` · `circuit` · `setup`.

> **مبدأ حاكم — إضافي دائماً، غير كاسر:** مولّد جديد = ملف جديد + تسجيل + تصدير + ربط proxy. لا تُعِد
> تسمية/تحذف حقولاً موجودة، ولا تجعل اختيارياً مطلوباً. هكذا لا يتأثّر أي سلوك قائم، ولا تتكرّر أي «هجرة».

---

## 0) البنية والعقد (لا تخالفه)
```
النموذج يكتب رمزاً نصّياً في خلية «سير الدرس»:   [[دالة: x^2 ; -3..3 | منحنى]]
        ↓ documentNormalizerV3.ts (EMBED_RE + parseXxx)
كتلة figure { gen:'<newgen>', spec:{...} } في مكانها
        ↓ renderFigure({gen,spec})  (averroes-figures)
SVG مضمَّن → معاينة/PDF/DOCX
```
- **الحزمة** مكتفية ذاتياً (صفر تبعيات عدا zod). كل مخطّط `.strict()` و«لا يرمي» → spec غير صالح يعيد `''`.
- كل مولّد يُخرج SVG نصّاً بصنف `lesson-figure`، ألوان قابلة للتنسيق، RTL-محايد (تسميات قصيرة).

## 1) آليّة الإضافة (لكل مولّد جديد) — 6 خطوات
**في الحزمة `averroes-figures/`:**
1. `src/figures/<gen>.ts`: عرّف `<gen>SpecSchema = z.object({...}).strict()` + `type <Gen>Spec` + `export function render<Gen>(spec, opts?): string`. اتبع مبدأ «لا يرمي».
2. `src/figures/registry.ts`: أضِف `'<gen>'` إلى `FIGURE_GENS` + فرعاً في `renderFigure` (`safeParse` ثم `render<Gen>`).
3. `src/index.ts`: صدّر `render<Gen>` + `<gen>SpecSchema` + الأنواع.
4. اختبار: `src/__tests__/figures.test.ts` — صحّة SVG + رفض spec فاسد (بلا رمي).
5. ابنِ: `npm --prefix averroes-figures run build` (لتحديث `dist/*.d.ts` قبل tsc الـproxy).

**في الـproxy `averroes-proxy/`:**
6. `src/templates/shared/documentNormalizerV3.ts`: أضِف بادئة الرمز إلى `EMBED_RE` (مجموعة مسمّاة جديدة) + `parse<Gen>(payload)` + فرع `out.push({type:'figure', gen, spec})`. ثم بند في `prompts/profiles/<subject>.md`، واختبار في `src/templates/__tests__/`. راجع النمط في المُفكّكات القائمة (chart/geometry/circuit/setup).

نقطتا فحص: `documentNormalizerV3.ts` هما `EMBED_RE` (السطر ~89) وحلقة `while (EMBED_RE.exec)`؛ كل الأشكال تُصيَّر أيضاً في مسار DOCX عبر `docxShared.ts` (اختبار `docxSvgBlocks.test.ts`).

---

## 2) المولّدات ذات الأولوية (المواد الأربع)

### أ) رياضيات — دوال وأعداد
- **`number_line`** رمز `[[أعداد: ...]]`: مستقيم مدرّج مع نقاط/فترات مؤشَّرة. الحقول: `min,max,step`، `points: {x:number,label?:string,filled?:boolean}[]`، `interval?: {from,to,openLeft?,openRight?}`. يرسم سهمين، تدريجاً، ونقاطاً/قوس فترة. مثال: `[[أعداد:-5..5; نقطة:2; فترة:-1..3]]`.
- **`function_plot`** رمز `[[دالة: ...]]`: منحنى دالة على معلم بشبكة. الحقول: `points: {x,y}[]` (من جدول قيم) **أو** `expr: 'x^2-1'` مع `xmin,xmax` (قيّم داخلياً بمحلّل بسيط آمن — لا `eval`)، `xlabel?,ylabel?`. **ملاحظة:** الحزمة تملك بالفعل `chart` بمقياس x عددي (`xs`)؛ يمكن أن يكون `function_plot` غلافاً حول منطق النقاط الحالي + رسم محاور/شبكة. مثال: `[[دالة: x^2 ; -3..3 | منحنى y=x²]]`.

### ب) فيزياء — ميكانيك (غير مغطّى إطلاقاً)
- **`forces`** رمز `[[قوى: ...]]`: جسم (صندوق/كرة) مع متجهات قوى مُسمّاة. الحقول: `body: 'box'|'ball'|'incline'`، `vectors: {dir:'up'|'down'|'left'|'right'|deg, label:string, mag?:number}[]`. يرسم سهاماً بأطوال نسبية + تسميات (P، R، T، F). مثال: `[[قوى: صندوق ; وزن:أسفل ; رد فعل:أعلى ; شد:يمين]]`.
- **`inclined_plane`** و**`pulley`**: أنواع ضمن `forces` أو مولّد مستقل — مستوٍ مائل بزاوية + جسم، أو بكرة بحبل وكتلتين.

### ج) علوم/كيمياء
- **`molecule`** رمز `[[جزيء: ...]]`: ذرّات وروابط من صيغة أو وصف. الحقول: `atoms: {el:string,x?,y?}[]`، `bonds: {a:number,b:number,order?:1|2|3}[]`؛ أو `formula:'H2O'` مع تخطيط تلقائي لبنى شائعة (H2O، CO2، CH4، O2). ألوان ذرّات اصطلاحية (O أحمر، H أبيض، C رمادي، N أزرق). مثال: `[[جزيء: H2O]]`.
- **`equation`** (اختياري): معادلة كيميائية موزونة كصورة رمزية بسيطة (متفاعلات → نواتج بأسهم ومعاملات).

### د) جغرافيا/تاريخ (بلا مولّدات)
- **`timeline`** رمز `[[زمن: ...]]`: خطّ زمن أفقي لأحداث مؤرّخة. الحقول: `events: {date:string,label:string}[]`، `orientation?:'h'|'v'`. يرسم محوراً بعلامات مؤرّخة وتسميات متناوبة. مثال: `[[زمن: 1954,اندلاع الثورة ; 1962,الاستقلال]]`.
- مخطّطات بسيطة إضافية: دورة (سهام دائرية)، هرم سكّاني (عمودان متقابلان) — يمكن أن تكون أنواعاً في `chart` بدل مولّد جديد.

---

## 3) قواعد الجودة (لكل مولّد)
- `viewBox` فقط (بلا width/height)؛ صنف `lesson-figure`؛ `role="img"` + `aria-label`.
- لوحة قابلة للتنسيق (currentColor حيث يناسب) مع ألوان دلالية للعناصر (قوى، ذرّات...).
- «لا يرمي»: أي حقل ناقص/فاسد → قيمة افتراضية أو `''`، لا استثناء.
- RTL-محايد: لا نصّ عربي طويل داخل الرسم (التسميات قصيرة؛ الشرح في caption).
- بيانات حقيقية: المُفكِّك في الـproxy يرفض بلطف الحمولات الفارغة/الفاسدة (يحفظ النصّ الخام).

## 4) صيغة مهمة جاهزة لوكيل (انسخها)
> «أضِف مولّد `<gen>` إلى averroes-figures وفق NEW-GENERATORS-BRIEF.md: (1) `src/figures/<gen>.ts` بمخطّط
> Zod strict + render يتبع «لا يرمي»؛ (2) سجّله في registry.ts + صدّره في index.ts؛ (3) أضِف اختبار
> صحّة SVG + رفض فاسد في figures.test.ts؛ (4) ابنِ الحزمة؛ (5) في الـproxy أضِف بادئة الرمز إلى
> EMBED_RE + parse<Gen> + فرع figure في documentNormalizerV3.ts؛ (6) بند برومبت في
> prompts/profiles/<subject>.md + اختبار توكن→figure + DOCX ImageRun. تحقّق: tsc نظيف + كل الاختبارات
> خضراء + renderFigure يعيد '<svg' لكل حالة. إضافي فقط — لا تغيّر سلوكاً قائماً.»

**ابدأ بمولّد واحد** (الأعلى قيمة: `forces` للفيزياء أو `number_line` للرياضيات)، تحقّق كاملاً، ثم كرّر.
