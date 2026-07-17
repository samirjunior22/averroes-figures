// ============================================================
// مثال استخدام averroes-figures v2 — يولّد عيّنة من كل نوع
// ============================================================
// يشغّل: npm run example
// يُخرج: ملفات SVG في examples/sample-output/
// ============================================================

import { writeFileSync, mkdirSync } from 'node:fs';
import {
  renderFigure,
  renderChart,
  renderSetup,
  renderGeometry,
  renderCircuit,
  type ChartSpec,
  type SetupSpec,
  type GeometrySpec,
  type CircuitSpec,
  type ChartOptions,
} from '../src/index.js';

const OUT = 'examples/sample-output';
mkdirSync(OUT, { recursive: true });

interface Sample {
  name: string;
  svg: string;
}

const samples: Sample[] = [];
const darkOpts: ChartOptions = { dark: true, palette: ['#60a5fa', '#f87171', '#34d399', '#fbbf24'] };

// ----- المخططات البيانية (chart) — 7 أنواع -----
const charts: Array<[string, ChartSpec, ChartOptions?]> = [
  ['chart_bar', { kind: 'bar', title: 'استهلاك الأجهزة المنزلية', unit: 'واط', labels: ['مصباح', 'تلفاز', 'ثلاجة', 'حاسوب', 'غسالة'], values: [60, 150, 200, 100, 180] }],
  ['chart_pie', { kind: 'pie', title: 'تركيب الهواء الجوي', labels: ['نيتروجين', 'أكسجين', 'أرجون', 'أخرى'], values: [78, 21, 0.9, 0.1] }],
  ['chart_line', { kind: 'line', title: 'منحنى تسخين الماء', unit: '°م', labels: ['0د', '5د', '10د', '15د', '20د'], values: [20, 45, 70, 92, 100] }],
  ['chart_pyramid', { kind: 'pyramid', title: 'السلسلة الغذائية', labels: ['منتجات', 'مستهلكات أولية', 'مستهلكات ثانوية', 'مفترسات عليا'], values: [1000, 100, 10, 1] }],
  ['chart_area', { kind: 'area', title: 'تغيّر درجة الحرارة', unit: '°م', labels: ['صباحاً', 'ظهيراً', 'عصراً', 'مساءً', 'ليلاً'], values: [15, 32, 28, 20, 12] }],
  ['chart_scatter', { kind: 'scatter', title: 'العلاقة بين الكتلة والحجم', labels: ['عينة 1', 'عينة 2', 'عينة 3', 'عينة 4', 'عينة 5'], values: [2.5, 5.1, 7.3, 10.2, 12.8] }],
  ['chart_horizontal_bar', { kind: 'horizontal_bar', title: 'نتائج الامتحان', unit: '%', labels: ['رياضيات', 'فيزياء', 'علوم', 'عربي', 'فرنسي'], values: [85, 72, 90, 78, 65] }],
  ['chart_bar_dark', { kind: 'bar', title: 'استهلاك الأجهزة (وضع داكن)', unit: 'واط', labels: ['مصباح', 'تلفاز', 'ثلاجة'], values: [60, 150, 200] }, darkOpts],
];
for (const [name, spec, opts] of charts) samples.push({ name, svg: renderChart(spec, opts) });

// ----- التراكيب التجريبية (setup) — 7 أنواع -----
const setups: Array<[string, SetupSpec]> = [
  ['setup_heating', { kind: 'heating', labels: { substance: 'كبريت' } }],
  ['setup_burning', { kind: 'burning', labels: { substance: 'سكر' } }],
  ['setup_filtration', { kind: 'filtration', labels: { substance: 'رمل + ماء', solvent: 'ماء' } }],
  ['setup_melting', { kind: 'melting', labels: { substance: 'ملح', solvent: 'ماء' } }],
  ['setup_distillation', { kind: 'distillation', labels: { substance: 'ماء مالح', product: 'ماء نقي', temperature: '100°م' } }],
  ['setup_decantation', { kind: 'decantation', labels: { substance: 'رمل', solvent: 'ماء' } }],
  ['setup_electrolysis', { kind: 'electrolysis', labels: { substance: 'ماء + ملح', product: 'H₂ + O₂' } }],
];
for (const [name, spec] of setups) samples.push({ name, svg: renderSetup(spec) });

// ----- الأشكال الهندسية (geometry) — مختارات -----
const geometries: Array<[string, GeometrySpec]> = [
  ['geo_right_triangle', { shape: 'right_triangle', labels: ['A', 'B', 'C'], showAngles: true }],
  ['geo_square', { shape: 'square', labels: ['A', 'B', 'C', 'D'], sides: ['4 cm', '4 cm', '4 cm', '4 cm'] }],
  ['geo_circle', { shape: 'circle', labels: ['O'], sides: ['r = 3 cm'] }],
  ['geo_pentagon', { shape: 'pentagon' }],
  ['geo_hexagon', { shape: 'hexagon' }],
  ['geo_ellipse', { shape: 'ellipse', labels: ['O'], sides: ['a = 5', 'b = 3'] }],
  ['geo_angle', { shape: 'angle', labels: ['A', 'B'], sides: ['60°'] }],
  ['geo_rhombus_fill', { shape: 'rhombus', fill: '#3b82f6', fillOpacity: 0.15 }],
];
for (const [name, spec] of geometries) samples.push({ name, svg: renderGeometry(spec) });

// ----- الدارات الكهربائية (circuit) -----
const circuits: Array<[string, CircuitSpec]> = [
  ['circuit_basic', { components: ['generator', 'switch', 'lamp'] }],
  ['circuit_measuring', { components: ['generator', 'switch', 'ammeter', 'lamp'], labels: ['G', 'K', 'A', 'L'] }],
  ['circuit_parallel', { layout: 'parallel', components: ['lamp', 'resistor'], branch2: ['lamp', 'lamp'], labels: ['L₁', 'R', 'L₂', 'L₃'] }],
  ['circuit_led', { components: ['battery', 'switch', 'led', 'resistor'], labels: ['Bat', 'K', 'LED', 'R'] }],
];
for (const [name, spec] of circuits) samples.push({ name, svg: renderCircuit(spec) });

// ----- الموزّع العام -----
samples.push({
  name: 'dispatch_chart',
  svg: renderFigure({ gen: 'chart', spec: charts[0]![1] }),
});

// ----- الكتابة -----
let count = 0;
for (const s of samples) {
  if (!s.svg) {
    console.warn(`⚠️  ${s.name}: SVG فارغ (spec غير صالح؟)`);
    continue;
  }
  const svgPath = `${OUT}/${s.name}.svg`;
  writeFileSync(svgPath, s.svg, 'utf-8');
  count++;
}

console.log(`\n✅ تم توليد ${count} ملف SVG في ${OUT}/`);
console.log(`\n📁 الملفات:`);
for (const s of samples) {
  if (!s.svg) continue;
  console.log(`   ${s.name}.svg (${(s.svg.length / 1024).toFixed(1)} KB)`);
}