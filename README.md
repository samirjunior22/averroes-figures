# averroes-figures

> مولّدات رسوم SVG تعليمية مستقلة — مخططات بيانية، تراكيب تجريبية، دوائر كهربائية، أشكال هندسية

[English](#english) | [العربية](#العربية)

---

## العربية

حزمة مكتفية ذاتياً لتوليد رسوم SVG بيداغوجية للمواد العلمية (فيزياء، علوم طبيعة، رياضيات، إعلام آلي). مخصّصة للمنهاج الجزائري لكنها قابلة للاستعمال في أي سياق تعليمي.

### المميزات

- 🎨 **4 مولّدات**: مخططات (chart)، تراكيب تجريبية (setup)، دوائر كهربائية (circuit)، أشكال هندسية (geometry)
- 📐 **SVG أصلي**: كل المخرجات SVG نصّي قابل للتنسيق بـ CSS
- 🌐 **دعم RTL**: التسميات العربية تُعرض بشكل صحيح
- 🛡️ **مبدأ "لا يرمي"**: أي spec غير صالح → نص فارغ (لا يكسر برنامجك)
- 🪶 **خفيف**: اعتماد وحيد إلزامي = `zod` فقط
- 🖼️ **PNG اختياري**: تحويل لـ PNG عبر `@resvg/resvg-js` (peerDependency اختياري)

### التثبيت

```bash
# من tarball محلي
npm install ./averroes-figures-1.0.0.tgz

# أو من المجلد
npm install ./averroes-figures

# لتفعيل PNG (اختياري)
npm install @resvg/resvg-js
```

### الاستخدام السريع

```typescript
import { renderChart, renderSetup, renderGeometry, renderCircuit } from 'averroes-figures';

// مخطط أعمدة
const bar = renderChart({
  kind: 'bar',
  title: 'استهلاك الأجهزة',
  unit: 'واط',
  labels: ['مصباح', 'تلفاز', 'ثلاجة'],
  values: [60, 150, 200],
});

// تركيب تجريبي (تسخين)
const heating = renderSetup({
  kind: 'heating',
  labels: { substance: 'كبريت' },
});

// شكل هندسي
const triangle = renderGeometry({
  shape: 'right_triangle',
  labels: ['A', 'B', 'C'],
});

// دارة كهربائية
const circuit = renderCircuit({
  components: ['generator', 'switch', 'lamp'],
});

// كل مُخرج = نص SVG
console.log(bar.startsWith('<svg')); // true
```

### الموزّع العام

```typescript
import { renderFigure } from 'averroes-figures';

// يكتشف النوع من حقل gen
const svg = renderFigure({
  gen: 'chart',  // 'chart' | 'setup' | 'geometry' | 'circuit'
  spec: { kind: 'pie', labels: ['أ', 'ب'], values: [3, 7] },
});
```

### تحويل PNG (اختياري)

```typescript
import { svgToPngDataUri } from 'averroes-figures/png';

const dataUri = svgToPngDataUri(svgString, { width: 480 });
// → 'data:image/png;base64,iVBOR...'
```

### الأنواع المدعومة

#### المخططات (chart)

| النوع | الاستعمال |
|---|---|
| `bar` | مقارنة فئات (استهلاك، نتائج) |
| `pie` | نسب وأجزاء (تركيب، احتمالات) |
| `line` | تغيّر زمني أو علاقة (منحنى، دالة) |
| `pyramid` | تصنيف هرمي (سلسلة غذائية) |

#### التراكيب التجريبية (setup)

| النوع | الاستعمال |
|---|---|
| `heating` | تسخين في أنبوب اختبار |
| `burning` | احتراق في ملعقة |
| `filtration` | ترشيح/فلترة |
| `melting` | ذوبان صلبة في سائل |

#### الأشكال الهندسية (geometry)

`triangle` · `right_triangle` · `isosceles_triangle` · `equilateral_triangle` · `square` · `rectangle` · `parallelogram` · `rhombus` · `trapezoid` · `circle`

#### الدارات الكهربائية (circuit)

مكوّنات: `generator` · `battery` · `lamp` · `switch` · `resistor` · `ammeter` · `voltmeter` · `motor` · `wire`

### التحقق من المواصفات (Zod)

```typescript
import { chartSpecSchema } from 'averroes-figures';

const result = chartSpecSchema.safeParse({
  kind: 'bar',
  labels: ['أ', 'ب'],
  values: [1, 2],
});
if (!result.success) {
  console.log(result.error.issues); // تفاصيل الخطأ
}
```

### الأمثلة

```bash
npm run example  # يولّد عينات SVG + PNG في examples/sample-output/
```

---

## English

A self-contained package for generating pedagogical SVG figures for science subjects (physics, natural sciences, mathematics, informatics). Designed for the Algerian curriculum but usable in any educational context.

### Features

- 🎨 **4 generators**: charts, lab setups, electric circuits, geometric shapes
- 📐 **Native SVG**: all output is SVG text, CSS-styleable
- 🌐 **RTL-aware**: Arabic labels render correctly
- 🛡️ **Never throws**: invalid spec → empty string (won't crash your app)
- 🪶 **Lightweight**: only required dependency is `zod`
- 🖼️ **Optional PNG**: convert via `@resvg/resvg-js` (optional peerDependency)

### Install

```bash
npm install ./averroes-figures-1.0.0.tgz
# optional, for PNG support:
npm install @resvg/resvg-js
```

### Quick Start

```typescript
import { renderChart, renderFigure } from 'averroes-figures';

const svg = renderChart({
  kind: 'bar',
  labels: ['A', 'B', 'C'],
  values: [10, 20, 30],
});

// or use the generic dispatcher
const svg2 = renderFigure({ gen: 'chart', spec: { kind: 'pie', labels: ['x', 'y'], values: [3, 7] } });
```

### API

| Export | Description |
|---|---|
| `renderFigure(input)` | Generic dispatcher — detect type from `gen` field |
| `renderChart(spec)` | Bar/pie/line/pyramid charts |
| `renderSetup(spec)` | Lab setups: heating/burning/filtration/melting |
| `renderGeometry(spec)` | Geometric shapes (triangle, square, circle...) |
| `renderCircuit(spec)` | Electric circuits (series, parametric) |
| `*SpecSchema` | Zod schemas for validation |
| `svgToPngDataUri(svg, opts)` | Optional PNG conversion (from `averroes-figures/png`) |

### License

MIT

### Related

Part of the [Averroes](../averroes-proxy) educational platform — extracted as a standalone package for reuse by other agents and chatbots.
