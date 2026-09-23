# Prompt — مواصلة إنشاء كائنات المخبر (`gen: "lab"`) للرياضيات والجغرافيا والإعلام الآلي

> أعطِ هذا الملفّ كاملاً للنموذج (Gemini) مع الوصول إلى مستودع `averroes-figures`
> (ويُفضَّل `electron/` أيضاً لربط الشريط). كل ما يلزمه موجود هنا وفي الملفات المذكورة.

---

## دورك

أنت مهندس TypeScript يوسّع حزمة `averroes-figures` (مولّدات SVG تعليمية للمنهاج الجزائري،
الجيل الثاني). تضيف **كائنات مفردة** جديدة إلى المولّد `lab` — الذي يغذّي **السبورة الذكية**
في تطبيق Averroes — لثلاث موادّ جديدة: **الرياضيات**، **الجغرافيا**، **الإعلام الآلي**.

الكائن = رسم SVG واحد يركّبه الأستاذ بحرّية على السبورة، بأسلوب **ثلاثي الأبعاد ناعم**
(تدرّجات + لمعان + ظلّ خفيف)، وبـ**قيم حيّة** تُعرض على الكائن نفسه ويضبطها الأستاذ من لوحة
تخصيص تُشتقّ آلياً من الفهرس. مثال قائم: بطارية تعرض `E = 1.5 V`، ذرّة تحسب `p⁺/n⁰/e⁻` من Z وA.

**اقرأ أوّلاً — بالترتيب:**
1. `src/figures/lab/style.ts` — البدائيات المشتركة (`glossSphere`, `cylinder`, `vessel`, `flame`,
   `stand`, `badge`, `label`, `arrow3d`, `linGrad`, `metalGrad`, `shadowDef`, `glowDef`,
   `lighten`, `darken`, `uid`, `fmt`). **استعملها؛ لا تُعِد كتابة تدرّجات أو ظلال.**
2. `src/figures/lab/physicsObjects.ts` — النموذج الذي تُحاكيه (مخطّط + دالّة رسم لكل kind).
3. `src/figures/lab/atom.ts` — مثال على قيم **محسوبة** من المدخلات وجدول بيانات (`elements.ts`).
4. `src/figures/lab/catalog.ts` — الفهرس `LAB_CATALOG` (المادة، التسميات ar/fr، الحقول، الأشكال الجاهزة).
5. `src/figures/lab/index.ts` — `LAB_KINDS` + `labSpecSchema` (z.union) + `renderLab` (switch).
6. `src/__tests__/lab.test.ts` — الاختبارات التي يجب أن تبقى خضراء وتتوسّع.

---

## العقد الصارم (لا استثناء)

### المخطّط (zod)
- كل kind: `z.object({ kind: z.literal('...'), ...fields }).strict()`.
- **كل حقل `.optional()` بلا `.default()`** — الافتراضات في دالّة الرسم بـ`??`. (السبب: `.default()`
  يجعل نوع الإدخال ≠ الإخراج ويكسر اتحاد `spec` في العميل.)
- القيم العددية مقيَّدة (`min/max`)؛ النصوص مقيَّدة الطول (`max(8)` للتسميات، `max(20–30)` للأسماء).
- الألوان `z.string().regex(/^#[0-9a-fA-F]{6}$/)`.
- قيود العلاقات (مثل `max > min`) بـ`.refine()` — مقبول لأن الاتحاد `z.union` لا `discriminatedUnion`.

### دالّة الرسم
- التوقيع: `export function renderX(spec: XSpec, opts?: RenderOptions): string`.
- تُعيد `wrapSvg(inner, W, H, ariaLabelArabic, opts)` من `../shared.js`؛ **لكل كائن أبعاده الخاصة**
  (بطارية 220×110، ذرّة تُحسب من عدد الطبقات) — لا لوحة 960×540.
- **لا ترمي أبداً**: مواصفة غريبة → رسمٌ بالافتراضات؛ الخطأ الداخلي يلتقطه `renderLab`.
- `const id = \`xx-${uid()}\`` في أوّل كل دالّة، وكل `id` داخل `<defs>` يبدأ به. كائنات كثيرة
  تشترك في DOM واحد على السبورة؛ معرّفٌ مكرَّر يخلط تدرّج كائن بآخر.
- النصوص عبر `label()` و`badge()` من `style.ts` (تحملان `direction="ltr"` — صفحة RTL تقلب «12 V»).
  لا `<text>` خام إلا لضرورة، وحينها أضف `direction="ltr"` ومرّر النصّ بـ`esc()`.
- ⚠ **لا تدرّج objectBoundingBox على `<line>` عمودي/أفقي** (عرضه صفر ⇒ طلاء غير صالح ⇒ يختفي).
  استعمل لوناً صلباً أو `<rect>`.
- التسميات العربية قصيرة، `text-anchor="middle"` ما أمكن؛ الرموز اللاتينية للكميات (`m`, `v`, `F`).
- الرموز التي يقرؤها التلميذ كرموز في المنهاج (رموز الخوارزميات، البوابات المنطقية، رموز الخريطة)
  تبقى **معيارية** داخل بطاقة ناعمة؛ الأجسام (كرة، عدسة، مجسّم) واقعية بتدرّجات.

### التسجيل (أربع خطوات، كلّها إلزامية)
1. ملفّ المادة: `src/figures/lab/mathObjects.ts` / `geographyObjects.ts` / `informaticsObjects.ts`
   (≤ 600 سطر لكل ملف؛ قسّم إن لزم).
2. `src/figures/lab/index.ts`: أضف الـkind إلى `LAB_KINDS`، والمخطّط إلى `labSpecSchema`،
   والفرع إلى `switch` في `renderLab`.
3. `src/figures/lab/catalog.ts`: إدخال في `LAB_CATALOG` بـ`kind`, `subject`, `ar`, `fr`, `icon`,
   `fields` (بالمساعدات `num/txt/bool/sel`)، و`presets` (شكل جاهز واحد على الأقل، معرّفه يبدأ بـ`lab-`).
   - **وسّع `LabSubject`** إلى `'physics' | 'chemistry' | 'science' | 'math' | 'geography' | 'cs'`.
   - كل حقل في `fields` يجب أن يقبله مخطّط الـkind (اختبار «يحرس الانحراف» يفشل وإلّا).
   - أوّل preset لكل kind يجب أن يحمل **كل الحقول ذات العلاقات** (مثل `min`+`max`) بقيم متّسقة.
4. `src/__tests__/lab.test.ts`: الاختبارات العامة تغطّي كل kind جديد آلياً (تصيير بالافتراضات،
   كل preset، حراسة الحقول، تفرّد المعرّفات). أضف فوقها اختباراً واحداً على الأقل لكل kind
   **يفحص القيمة الحيّة** (مثل: `renderLab({kind:'fraction', num:3, den:4})` يحوي `3/4`).

### التحقّق قبل التسليم
```bash
npx tsc --noEmit      # صفر أخطاء
npm test              # كل الاختبارات خضراء — وقارن العدد: يجب أن يرتفع لا أن ينقص
npm run build
```
ثم أنشئ معرضاً بصرياً (سكربت يستورد `dist/index.js` ويكتب HTML بكل presets الجديدة) وافحصه
بعينك: لا نصّ خارج الإطار، لا NaN، القيم تتغيّر فعلاً بتغيّر المواصفة.

---

## الكائنات المطلوبة

اختر أبعاداً معقولة لكل كائن (150–300 عرضاً). القيم المقترحة أدناه افتراضات؛ الحقول كلّها
اختيارية في المخطّط.

### 1) رياضيات — `subject: 'math'`
| kind | المواصفة | الرسم |
|---|---|---|
| `fraction` | `num=1, den=2, style:'pie'\|'bar', showLabel` | قرص أو شريط مقسوم مع تظليل الأجزاء + شارة `a/b` |
| `solid` | `shape:'cube'\|'cuboid'\|'cylinder'\|'cone'\|'sphere'\|'pyramid', a, b, h, r, unit='cm', showDims` | مجسّم بتدرّج ووجوه مظلّلة + قياسات على الأحرف |
| `clock` | `hours=3, minutes=0, showDigital` | ساعة تناظرية بعقارب محسوبة من الوقت |
| `ruler` | `length=10, unit='cm'` | مسطرة مدرّجة (شكل واقعي، للعرض لا للقياس) |
| `protractor` | `angle?` | منقلة نصف دائرية مدرّجة؛ إن أُعطيت زاوية تُرسم شعاعان ملوّنان |
| `set_square` | `type:'45'\|'30_60'` | كوس |
| `compass_tool` | `radius=40` | بركار مفتوح بزاوية تعبّر عن نصف القطر |
| `number_sets` | `highlight:'N'\|'Z'\|'Q'\|'R'\|'none'` | مخطّط ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ (دوائر متداخلة) مع إبراز |
| `place_value` | `value=4325` | جدول المراتب (آلاف/مئات/عشرات/آحاد) بالأرقام موزَّعة |
| `dice` | `face=1..6, count=1..2` | نرد مجسَّم بوجه محدَّد (احتمالات) |
| `coin` | `side:'heads'\|'tails'` | قطعة نقدية لامعة |
| `abacus` | `value=0..9999` | معداد بخرزات محسوبة من القيمة |
| `coordinate_point` | `x=2, y=3, label='A'` | معلم صغير بنقطة معلَّمة وإسقاطاتها المتقطّعة |

### 2) جغرافيا — `subject: 'geography'`
| kind | المواصفة | الرسم |
|---|---|---|
| `compass_rose` | `style:'simple'\|'full'` | وردة الرياح (4 أو 8 جهات) بتسميات عربية |
| `globe` | `highlight:'equator'\|'meridian'\|'tropics'\|'none', tilt` | كرة أرضية لامعة بخطوط الطول والعرض |
| `seasons` | `season:'summer'\|'winter'\|'spring'\|'autumn'` | الأرض حول الشمس بميل المحور وإبراز الفصل |
| `water_cycle` | `labels` | دورة الماء (تبخّر/تكاثف/تساقط/جريان) بأسهم |
| `relief_profile` | `heights:number[]`، `labels` | مقطع تضاريسي من مصفوفة ارتفاعات |
| `volcano` | `labels, erupting` | مقطع بركان (غرفة الصهارة/المدخنة/الفوهة) |
| `rock_layers` | `layers=4, labels` | طبقات رسوبية ملوّنة |
| `weather_instrument` | `type:'thermometer'\|'rain_gauge'\|'anemometer'\|'barometer'\|'wind_vane', value` | جهاز أرصاد بقراءة |
| `climate_bar` | `temps:number[12], rains:number[12]` | مخطّط مناخي مبسّط (12 شهراً) |
| `map_symbol` | `symbol:'city'\|'capital'\|'river'\|'mountain'\|'road'\|'railway'\|'border'\|'port'\|'airport', label` | رمز خريطة واحد بحجم كبير (مفتاح الخريطة) |
| `scale_bar` | `km=100` | مقياس رسم خطّي |

### 3) إعلام آلي — `subject: 'cs'`
| kind | المواصفة | الرسم |
|---|---|---|
| `device` | `type:'monitor'\|'keyboard'\|'mouse'\|'cpu'\|'ram'\|'hdd'\|'ssd'\|'usb'\|'printer'\|'router'\|'server'\|'laptop'\|'tablet', label` | جهاز واحد مجسَّم |
| `flow_symbol` | `shape:'terminal'\|'process'\|'decision'\|'io'\|'loop'\|'connector', text` | رمز خوارزمية معياري بنصّ داخله (قابل للتكرار لبناء مخطّط) |
| `logic_gate` | `gate:'AND'\|'OR'\|'NOT'\|'NAND'\|'NOR'\|'XOR', a?:0\|1, b?:0\|1` | بوابة منطقية بمدخلين وخرج **محسوب** من المدخلين |
| `binary` | `value=42, bits=8` | تمثيل ثنائي محسوب (خانات مضيئة/مطفأة) + شارة العدد العشري |
| `variable_box` | `name='x', value='5', type?` | صندوق متغيّر (اسم + قيمة) — التصوّر الذهني للمتغيّر |
| `file_icon` | `kind:'file'\|'folder'\|'image'\|'text'\|'video'\|'zip', name` | أيقونة ملفّ/مجلّد بأسم |
| `network` | `nodes=3, topology:'star'\|'bus'\|'ring'` | شبكة صغيرة مبسّطة (أجهزة + خطوط) |
| `scratch_block` | `category:'motion'\|'looks'\|'control'\|'events', text` | كتلة سكراتش بلونها الرسمي ونصّها |
| `storage_units` | `highlight:'bit'\|'byte'\|'KB'\|'MB'\|'GB'` | سلّم وحدات التخزين مع الإبراز |

---

## ربط الشريط في Electron (إن كان لديك الوصول إلى `electron/`)

الشريط يشتقّ الأزرار من الفهرس آلياً، لا حاجة لكتابة أزرار:
- `electron/src/components/board/boardPresets.ts` يشتقّ كل presets من `LAB_CATALOG` — لا تلمسه.
- `electron/src/components/board/boardSubjectPresets.ts`: القوائم `MATH_ITEMS`, `MAP_ITEMS` موجودة؛
  أضف في أوّلهما `...labItems('math')` و`...labItems('geography')`. للإعلام الآلي أنشئ
  `INFORMATICS_ITEMS = [...labItems('cs')]` وأضف قائمة «إعلام آلي» في `BoardToolbar.tsx`
  (`menuConfig` + زرّ في الشريط بأيقونة `Cpu` من lucide، **بلون `text-slate-900 dark:text-slate-100`**
  كبقية الأزرار).
- لوحة التخصيص (`FigureInspector`) تقرأ `fields` من الفهرس آلياً — لا حاجة لأي كود.
- بعد بناء الحزمة (`npm run build`) انسخ `dist/` و`src/` و`package.json` فوق
  `electron/node_modules/averroes-figures/`، واحذف `electron/node_modules/.vite/deps`
  (كاش vite لا يلاحظ تغيّر محتوى الحزمة)، ثم `npx tsc --noEmit && npm test` في `electron/`.

---

## مثال كامل — kind واحد من البداية إلى النهاية (`dice`)

```ts
// في src/figures/lab/mathObjects.ts
import { z } from 'zod';
import { wrapSvg, type RenderOptions, resolveFont } from '../shared.js';
import { uid, badge, linGrad, shadowDef, darken } from './style.js';

export const diceSpecSchema = z.object({
  kind: z.literal('dice'),
  face: z.number().int().min(1).max(6).optional(),
}).strict();
export type DiceSpec = z.infer<typeof diceSpecSchema>;

const PIPS: Record<number, [number, number][]> = {
  1: [[0.5, 0.5]], 2: [[0.25, 0.25], [0.75, 0.75]], 3: [[0.25, 0.25], [0.5, 0.5], [0.75, 0.75]],
  4: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]],
  5: [[0.25, 0.25], [0.75, 0.25], [0.5, 0.5], [0.25, 0.75], [0.75, 0.75]],
  6: [[0.25, 0.25], [0.75, 0.25], [0.25, 0.5], [0.75, 0.5], [0.25, 0.75], [0.75, 0.75]],
};

export function renderDice(spec: DiceSpec, opts?: RenderOptions): string {
  const W = 150, H = 170, id = `dice-${uid()}`, font = resolveFont(opts);
  const face = spec.face ?? 1;
  const base = '#f8fafc', s = 90, x = 30, y = 25;
  const parts: string[] = [];
  parts.push(`<defs>${linGrad(`${id}-f`, [[0, '#ffffff'], [1, darken(base, 0.12)]])}${shadowDef(`${id}-sh`, 3, 3)}</defs>`);
  parts.push(`<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="14" fill="url(#${id}-f)" stroke="${darken(base, 0.35)}" stroke-width="1.5" filter="url(#${id}-sh)"/>`);
  for (const [fx, fy] of PIPS[face] ?? PIPS[1]!) {
    parts.push(`<circle cx="${x + fx * s}" cy="${y + fy * s}" r="7" fill="#1e293b"/>`);
  }
  parts.push(badge(W / 2, H - 20, `الوجه ${face}`, { font, size: 10 }));
  return wrapSvg(parts.join(''), W, H, `نرد — الوجه ${face}`, opts);
}
```

```ts
// في catalog.ts (داخل LAB_CATALOG)
{
  kind: 'dice', subject: 'math', ar: 'نرد', fr: 'Dé', icon: '🎲',
  fields: [num('face', 'الوجه (1–6)', { min: 1, max: 6, step: 1 })],
  presets: [p('lab-dice', 'نرد (احتمالات)', 'Dé', '🎲', { face: 1 })],
},
```

```ts
// في lab.test.ts
it('النرد يعرض الوجه المختار', () => {
  expect(renderLab({ kind: 'dice', face: 5 })).toContain('الوجه 5');
});
```

ثم: `LAB_KINDS` + `labSpecSchema` + فرع `case 'dice'` في `index.ts`.

---

## ما لا تفعله
- لا تعدّل المولّدات القائمة (`circuit`, `geometry`, `physics`, `biology`…) ولا `shared.ts`.
- لا تضف تبعيات؛ الحزمة تعتمد على `zod` وحده.
- لا تكتب Markdown داخل الـSVG ولا `<foreignObject>`؛ لا CSS خارجي؛ لا خطوط من الشبكة.
- لا تُكرّر بدائية موجودة في `style.ts` — وإن احتجت بدائية جديدة عامة (مثل `cube3d`) أضفها إلى
  `style.ts` بنفس الأسلوب (تحمل `<defs>` بمعرّف يُمرَّر إليها) واستعملها من ملفّ المادة.
- لا تُنقص عدد الاختبارات. لا تُبدّل مخطّطاً قائماً.
