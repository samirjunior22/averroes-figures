// ============================================================
// averroes-figures v2 — مولّدات رسوم SVG تعليمية
// ============================================================
// حزمة مكتفية ذاتياً لتوليد رسوم SVG تعليمية بيداغوجية للمواد العلمية:
//   - مخططات بيانية (chart): أعمدة، دائرة، خطّي، هرم، مساحة، انتشار، أعمدة أفقية
//   - تراكيب تجريبية (setup): تسخين، احتراق، فلترة، ذوبان، تقطير، تصفية، تحليل كهربائي
//   - دوائر كهربائية (circuit): دارات تسلسلية ومتوازية مع تسميات
//   - أشكال هندسية (geometry): مثلث، مربع، دائرة، خماسي، سداسي، قطع ناقص، زاوية، قطعة مستقيمة
//
// كل المولّدات تُخرج SVG نصّاً (صفر تبعيات إلزامية عدا zod).
// تحويل PNG اختياري عبر subpath:  import { svgToPngDataUri } from 'averroes-figures/png'
//
// مبادئ:
//   • مبدأ "لا يرمي": أي spec غير صالح → '' أو placeholder (لا يكسر الاستدعاء)
//   • كل النصوص تُهرب ضد حقن XML (esc)
//   • SVG بأسلوب currentColor خطّي قابل للتنسيق بـ CSS
//   • RTL-aware: التسميات العربية تُعرض بشكل صحيح
//   • خيارات تصيير كاملة: ألوان، خطوط، أبعاد، وضع داكن
//
// الاستخدام السريع:
//   import { renderChart } from 'averroes-figures';
//   const svg = renderChart({ kind: 'bar', labels: ['أ','ب'], values: [10, 20] });
// ============================================================

// الموزّع العام (يكتشف النوع من حقل gen) — نقطة الدخول الرئيسية
export { renderFigure, FIGURE_GENS } from './figures/registry.js';
export type { FigureGen, FigureInput } from './figures/registry.js';

// مولّد المخططات البيانية (bar/pie/line/pyramid/area/scatter/horizontal_bar)
export { renderChart, chartSpecSchema, chartKindSchema } from './figures/chart.js';
export type { ChartSpec, ChartKind, ChartOptions } from './figures/chart.js';

// مولّد التراكيب التجريبية (heating/burning/filtration/melting/distillation/decantation/electrolysis)
export { renderSetup, setupSpecSchema, setupKindSchema } from './figures/setup.js';
export type { SetupSpec, SetupKind } from './figures/setup.js';

// مولّد الأشكال الهندسية (triangle/square/circle/pentagon/hexagon/ellipse/angle/line_segment...)
export { renderGeometry, geometrySpecSchema, geometryShapeSchema } from './figures/geometry.js';
export type { GeometrySpec, GeometryShape } from './figures/geometry.js';

// مولّد الدارات الكهربائية (تسلسلية + متوازية)
export { renderCircuit, circuitSpecSchema, circuitComponentSchema } from './figures/circuit.js';
export type { CircuitSpec, CircuitComponent } from './figures/circuit.js';

// مولّد متجهات القوى (فيزياء - ميكانيك)
export { renderForces, forcesSpecSchema, forceVectorSchema } from './figures/forces.js';
export type { ForcesSpec, ForceVector } from './figures/forces.js';

// مولّد المستقيم المدرّج (رياضيات)
export { renderNumberLine, numberLineSpecSchema, numberLinePointSchema, numberLineIntervalSchema } from './figures/number_line.js';
export type { NumberLineSpec, NumberLinePoint, NumberLineInterval } from './figures/number_line.js';

// مولّد منحنى الدالة (رياضيات)
export { renderFunctionPlot, functionPlotSpecSchema, plotPointSchema } from './figures/function_plot.js';
export type { FunctionPlotSpec, PlotPoint } from './figures/function_plot.js';

// مولّد الجزيء (كيمياء / علوم)
export { renderMolecule, moleculeSpecSchema, moleculeAtomSchema, moleculeBondSchema } from './figures/molecule.js';
export type { MoleculeSpec, MoleculeAtom, MoleculeBond } from './figures/molecule.js';

// الأنواع المشتركة
export type { RenderOptions } from './figures/shared.js';