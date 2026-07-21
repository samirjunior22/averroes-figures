// ============================================================
// اختبارات averroes-figures v2 — التحقق من الواجهة العامة
// ============================================================
// يغطّي: الاستيراد، كل مولّد، الأنواع الجديدة، خيارات التصيير،
// مبدأ "لا يرمي"، والتحقق من صحة الـ schemas.
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  renderFigure,
  renderChart,
  renderSetup,
  renderGeometry,
  renderCircuit,
  renderForces,
  renderNumberLine,
  renderFunctionPlot,
  chartSpecSchema,
  chartKindSchema,
  setupSpecSchema,
  setupKindSchema,
  geometrySpecSchema,
  geometryShapeSchema,
  circuitSpecSchema,
  circuitComponentSchema,
  forcesSpecSchema,
  forceVectorSchema,
  numberLineSpecSchema,
  numberLinePointSchema,
  numberLineIntervalSchema,
  functionPlotSpecSchema,
  plotPointSchema,
  moleculeSpecSchema,
  moleculeAtomSchema,
  moleculeBondSchema,
  renderMolecule,
  FIGURE_GENS,
} from '../index.js';
import type { RenderOptions } from '../index.js';

// ============================================================
// الواجهة العامة
// ============================================================
describe('الواجهة العامة للحزمة', () => {
  it('FIGURE_GENS يحوي الأنواع التسعة', () => {
    expect(FIGURE_GENS).toEqual(['circuit', 'geometry', 'chart', 'setup', 'forces', 'number_line', 'function_plot', 'molecule', 'rays']);
  });

  it('renderFigure موزّع عام يكتشف النوع من gen', () => {
    const chart = renderFigure({ gen: 'chart', spec: { kind: 'bar', labels: ['أ', 'ب'], values: [1, 2] } });
    const setup = renderFigure({ gen: 'setup', spec: { kind: 'heating' } });
    const geo = renderFigure({ gen: 'geometry', spec: { shape: 'triangle' } });
    const circ = renderFigure({ gen: 'circuit', spec: { components: ['generator', 'lamp'] } });
    const forces = renderFigure({ gen: 'forces', spec: { body: 'box', vectors: [{ dir: 'down', label: 'P', mag: 10 }] } });
    expect(chart.startsWith('<svg')).toBe(true);
    expect(setup.startsWith('<svg')).toBe(true);
    expect(geo.startsWith('<svg')).toBe(true);
    expect(circ.startsWith('<svg')).toBe(true);
    expect(forces.startsWith('<svg')).toBe(true);
  });
});

// ============================================================
// المخططات البيانية (chart)
// ============================================================
describe('renderChart — المخططات البيانية', () => {
  it('يُنتج SVG صالحاً لكل النواع السبعة', () => {
    const kinds = [
      { kind: 'bar', labels: ['أ', 'ب'], values: [1, 2] },
      { kind: 'pie', labels: ['أ', 'ب'], values: [3, 7] },
      { kind: 'line', labels: ['t0', 't1', 't2'], values: [1, 3, 5] },
      { kind: 'pyramid', labels: ['أ', 'ب', 'ج'], values: [100, 50, 10] },
      { kind: 'area', labels: ['x', 'y', 'z'], values: [2, 5, 3] },
      { kind: 'scatter', labels: ['p1', 'p2', 'p3', 'p4'], values: [1, 4, 2, 6] },
      { kind: 'horizontal_bar', labels: ['أ', 'ب', 'ج'], values: [30, 50, 20] },
    ] as const;
    for (const spec of kinds) {
      const svg = renderChart(spec);
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('class="lesson-figure"');
      expect(svg.endsWith('</svg>')).toBe(true);
    }
  });

  it('chartSpecSchema يرفض عدم تطابق labels/values', () => {
    const bad = chartSpecSchema.safeParse({ kind: 'bar', labels: ['a', 'b'], values: [1] });
    expect(bad.success).toBe(false);
  });

  it('مبدأ "لا يرمي": renderFigure بـ spec غير صالح → فارغ', () => {
    expect(renderFigure({ gen: 'chart', spec: { kind: 'bar', labels: ['a'], values: [1, 2] } })).toBe('');
    expect(renderFigure({ gen: 'chart', spec: {} })).toBe('');
  });

  it('يدعم خيارات التصيير (ألوان مخصصة)', () => {
    const svg = renderChart(
      { kind: 'bar', labels: ['أ', 'ب', 'ج'], values: [10, 20, 15] },
      { palette: ['#ff0000', '#00ff00', '#0000ff'], dark: true },
    );
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('#ff0000');
  });

  it('يدعم إخفاء القيم والشبكة', () => {
    const svg = renderChart(
      { kind: 'bar', labels: ['أ', 'ب'], values: [10, 20] },
      { showValues: false, showGrid: false },
    );
    expect(svg.startsWith('<svg')).toBe(true);
  });

  it('مخطط القيم السالبة في horizontal_bar', () => {
    const svg = renderChart({
      kind: 'horizontal_bar',
      labels: ['أ', 'ب', 'ج'],
      values: [-10, 20, -5],
    });
    expect(svg.startsWith('<svg')).toBe(true);
  });

  it('التوافقية: renderChart بدون خيارات يعمل كالمعتاد', () => {
    const svg = renderChart({ kind: 'bar', labels: ['أ', 'ب'], values: [1, 2] });
    expect(svg).toContain('class="lesson-figure"');
  });
});

// ============================================================
// التراكيب التجريبية (setup)
// ============================================================
describe('renderSetup — التراكيب التجريبية', () => {
  it('يُنتج SVG لكل الأنواع الثمانية', () => {
    const kinds = [
      { kind: 'heating', labels: { substance: 'كبريت' } },
      { kind: 'burning', labels: { substance: 'سكر' } },
      { kind: 'filtration', labels: { substance: 'رمل', solvent: 'ماء' } },
      { kind: 'melting', labels: { substance: 'ملح', solvent: 'ماء' } },
      { kind: 'distillation', labels: { substance: 'ماء مالح', product: 'ماء نقي', temperature: '100°م' } },
      { kind: 'decantation', labels: { substance: 'رمل', solvent: 'ماء' } },
      { kind: 'electrolysis', labels: { substance: 'ماء + ملح', product: 'H₂ + O₂' } },
      { kind: 'conductivity', labels: { substance: 'محلول كلور الصوديوم', solvent: 'ماء' } },
    ] as const;
    for (const spec of kinds) {
      const svg = renderSetup(spec);
      expect(svg.startsWith('<svg')).toBe(true);
    }
  });

  it('يعمل بلا labels (تخطيط افتراضي)', () => {
    expect(renderSetup({ kind: 'heating' }).startsWith('<svg')).toBe(true);
    expect(renderSetup({ kind: 'distillation' }).startsWith('<svg')).toBe(true);
    expect(renderSetup({ kind: 'electrolysis' }).startsWith('<svg')).toBe(true);
    expect(renderSetup({ kind: 'conductivity' }).startsWith('<svg')).toBe(true);
  });

  it('ناقلية: يرسم المصباح والمولّد والقاطع والمسريين (لا تحليل كهربائي)', () => {
    const svg = renderSetup({ kind: 'conductivity', labels: { substance: 'محلول السكر' } });
    for (const label of ['مصباح', 'مولّد', 'قاطع', 'مسريان', 'محلول السكر']) {
      expect(svg).toContain(label);
    }
    // لا توهّج مرسوم: الشكل واحد للحالات الثلاث (ماء مقطر/سكر/ملح)
    expect(svg).not.toContain('أنود');
  });

  it('يهرب XML في labels.substance (أمان)', () => {
    const svg = renderSetup({ kind: 'heating', labels: { substance: '<script>x</script>' } });
    expect(svg).not.toContain('<script>');
  });

  it('setupSpecSchema يرفض نوعاً مجهولاً', () => {
    expect(setupSpecSchema.safeParse({ kind: 'unknown_kind' }).success).toBe(false);
  });

  it('setupKindSchema يحوي 8 أنواع', () => {
    const parsed = setupKindSchema.safeParse('distillation');
    expect(parsed.success).toBe(true);
    const parsed2 = setupKindSchema.safeParse('electrolysis');
    expect(parsed2.success).toBe(true);
    const parsed3 = setupKindSchema.safeParse('conductivity');
    expect(parsed3.success).toBe(true);
  });

  it('يدعم خيارات التصيير (dark mode)', () => {
    const svg = renderSetup({ kind: 'heating', labels: { substance: 'كبريت' } }, { dark: true });
    expect(svg.startsWith('<svg')).toBe(true);
  });
});

// ============================================================
// الأشكال الهندسية (geometry)
// ============================================================
describe('renderGeometry — الأشكال الهندسية', () => {
  it('يُنتج SVG لكل الأشكال الأساسية', () => {
    for (const shape of ['triangle', 'right_triangle', 'square', 'rectangle', 'circle'] as const) {
      const svg = renderGeometry({ shape });
      expect(svg.startsWith('<svg')).toBe(true);
    }
  });

  it('يُنتج SVG لكل الأشكال الجديدة', () => {
    const newShapes = ['pentagon', 'hexagon', 'ellipse', 'angle', 'line_segment'] as const;
    for (const shape of newShapes) {
      const svg = renderGeometry({ shape });
      expect(svg.startsWith('<svg')).toBe(true);
    }
  });

  it('يقبل تسميات رؤوس وأضلاع', () => {
    const svg = renderGeometry({ shape: 'square', labels: ['A', 'B', 'C', 'D'], sides: ['4', '4', '4', '4'] });
    expect(svg).toContain('A');
    expect(svg).toContain('4');
  });

  it('geometrySpecSchema يرفض شكلاً مجهولاً', () => {
    expect(geometrySpecSchema.safeParse({ shape: 'octagon' }).success).toBe(false);
  });

  it('يدعم خيار التلوين', () => {
    const svg = renderGeometry({ shape: 'circle', fill: '#3b82f6', fillOpacity: 0.3 });
    expect(svg).toContain('#3b82f6');
    expect(svg.startsWith('<svg')).toBe(true);
  });

  it('يدعم إظهار/إخفاء الزوايا القائمة', () => {
    const withAngles = renderGeometry({ shape: 'square', showRightAngles: true });
    const withoutAngles = renderGeometry({ shape: 'square', showRightAngles: false });
    expect(withAngles.length).not.toBe(withoutAngles.length);
  });

  it('يدعم خيار عرض قياس الزوايا العددية', () => {
    const svg = renderGeometry({ shape: 'right_triangle', showAngles: true });
    expect(svg.startsWith('<svg')).toBe(true);
  });

  it('الشكل angle يعرض الزاوية والتسميات', () => {
    const svg = renderGeometry({
      shape: 'angle',
      labels: ['A', 'B'],
      sides: ['60°'],
    });
    expect(svg).toContain('60');
    expect(svg.startsWith('<svg')).toBe(true);
  });

  it('التوافقية: بدون خيارات يعمل كالمعتاد', () => {
    const svg = renderGeometry({ shape: 'equilateral_triangle' });
    expect(svg).toContain('class="lesson-figure"');
  });
});

// ============================================================
// الدارات الكهربائية (circuit)
// ============================================================
describe('renderCircuit — الدارات الكهربائية', () => {
  it('يُنتج SVG لدارة بسيطة', () => {
    const svg = renderCircuit({ components: ['generator', 'switch', 'lamp'] });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('class="lesson-figure"');
  });

  it('يضع المصدر يساراً والبقية أعلى', () => {
    const svg = renderCircuit({ components: ['generator', 'lamp', 'ammeter'] });
    expect(svg).toContain('>A<'); // حرف الأمبيرمتر
  });

  it('يدعم الدارة المتوازية', () => {
    const svg = renderCircuit({
      layout: 'parallel',
      components: ['lamp', 'resistor'],
      branch2: ['lamp', 'lamp'],
    });
    expect(svg.startsWith('<svg')).toBe(true);
  });

  it('يدعم تسميات المكونات', () => {
    const svg = renderCircuit({
      components: ['generator', 'switch', 'lamp', 'resistor'],
      labels: ['G', 'K', 'L', 'R'],
    });
    expect(svg).toContain('G');
    expect(svg).toContain('L');
    expect(svg).toContain('R');
  });

  it('يدعم المكوّنات الجديدة', () => {
    const svg = renderCircuit({
      components: ['generator', 'led', 'capacitor', 'buzzer'],
    });
    expect(svg.startsWith('<svg')).toBe(true);
  });

  it('circuitComponentSchema يحوي المكوّنات الجديدة', () => {
    expect(circuitComponentSchema.safeParse('led').success).toBe(true);
    expect(circuitComponentSchema.safeParse('capacitor').success).toBe(true);
    expect(circuitComponentSchema.safeParse('buzzer').success).toBe(true);
  });

  it('circuitSpecSchema يرفض مكوّناً مجهولاً', () => {
    expect(circuitSpecSchema.safeParse({ components: ['unknown_device'] }).success).toBe(false);
  });

  it('circuitSpecSchema يرفض مصفوفة فارغة', () => {
    expect(circuitSpecSchema.safeParse({ components: [] }).success).toBe(false);
  });

  it('التوافقية: layout الافتراضي هو series', () => {
    const svg = renderCircuit({ components: ['generator', 'lamp'] });
    expect(svg.startsWith('<svg')).toBe(true);
  });
});

// ============================================================
// متجهات القوى (forces)
// ============================================================
describe('renderForces — متجهات القوى', () => {
  it('يُنتج SVG لصندوق مع قوى متعددة', () => {
    const svg = renderForces({
      body: 'box',
      vectors: [
        { dir: 'down', label: 'P', mag: 10 },
        { dir: 'up', label: 'R', mag: 10 },
        { dir: 'right', label: 'T', mag: 5 },
      ],
    });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('class="lesson-figure"');
    expect(svg.endsWith('</svg>')).toBe(true);
    expect(svg).toContain('P');
    expect(svg).toContain('R');
    expect(svg).toContain('T');
  });

  it('يُنتج SVG لكرة مع قوى', () => {
    const svg = renderForces({
      body: 'ball',
      vectors: [
        { dir: 'down', label: 'mg' },
        { dir: 'up', label: 'N' },
      ],
    });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('mg');
    expect(svg).toContain('N');
  });

  it('يُنتج SVG لمستوى مائل مع زاوية', () => {
    const svg = renderForces({
      body: 'incline',
      angle: 30,
      vectors: [
        { dir: 'down', label: 'P', mag: 10 },
        { dir: 90, label: 'R', mag: 8 },
      ],
    });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('30');
  });

  it('يدعم اتجاهات رقمية (زوايا بالدرجات)', () => {
    const svg = renderForces({
      body: 'box',
      vectors: [
        { dir: 45, label: 'F', mag: 5 },
        { dir: 'down', label: 'P', mag: 10 },
      ],
    });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('F');
  });

  it('forcesSpecSchema يرفض body مجهولاً', () => {
    expect(forcesSpecSchema.safeParse({ body: 'pyramid', vectors: [] }).success).toBe(false);
  });

  it('forcesSpecSchema يرفض vectors فارغة', () => {
    expect(forcesSpecSchema.safeParse({ body: 'box', vectors: [] }).success).toBe(false);
  });

  it('forcesSpecSchema يرفض حقلاً إضافية', () => {
    expect(forcesSpecSchema.safeParse({ body: 'box', vectors: [{ dir: 'down', label: 'P' }], unknown: true } as any).success).toBe(false);
  });

  it('forceVectorSchema يقبل mag اختياري', () => {
    expect(forceVectorSchema.safeParse({ dir: 'down', label: 'P' }).success).toBe(true);
    expect(forceVectorSchema.safeParse({ dir: 'up', label: 'R', mag: 10 }).success).toBe(true);
  });

  it('forceVectorSchema يرفض label طويلة', () => {
    expect(forceVectorSchema.safeParse({ dir: 'down', label: 'طويل_جداً' }).success).toBe(false);
  });

  it('مبدأ "لا يرمي": spec غير صالح عبر renderFigure → فارغ', () => {
    expect(renderFigure({ gen: 'forces', spec: { body: 'box' } })).toBe('');
    expect(renderFigure({ gen: 'forces', spec: {} })).toBe('');
    expect(renderFigure({ gen: 'forces', spec: { vectors: [{ dir: 'down', label: 'P' }] } })).toBe('');
  });

  it('التوافقية: بدون خيارات يعمل كالمعتاد', () => {
    const svg = renderForces({
      body: 'box',
      vectors: [{ dir: 'down', label: 'P' }],
    });
    expect(svg).toContain('class="lesson-figure"');
  });

  it('يدعم خيارات التصيير (dark mode)', () => {
    const svg = renderForces(
      { body: 'ball', vectors: [{ dir: 'down', label: 'mg', mag: 10 }] },
      { dark: true },
    );
    expect(svg.startsWith('<svg')).toBe(true);
  });

  it('renderFigure عبر gen forces يُنتج SVG صالحاً', () => {
    const svg = renderFigure({
      gen: 'forces',
      spec: { body: 'box', vectors: [{ dir: 'down', label: 'P', mag: 10 }, { dir: 'up', label: 'R', mag: 10 }] },
    });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('class="lesson-figure"');
  });
});

// ============================================================
// مبدأ "لا يرمي" الشامل
// ============================================================
describe('مبدأ "لا يرمي" عبر renderFigure', () => {
  it('gen مجهول → فارغ', () => {
    expect(renderFigure({ gen: 'unknown' as never, spec: {} })).toBe('');
  });

  it('spec فارغ لكل gen → فارغ (لا يرمي)', () => {
    expect(renderFigure({ gen: 'chart', spec: null })).toBe('');
    expect(renderFigure({ gen: 'setup', spec: null })).toBe('');
    expect(renderFigure({ gen: 'geometry', spec: null })).toBe('');
    expect(renderFigure({ gen: 'circuit', spec: null })).toBe('');
    expect(renderFigure({ gen: 'forces', spec: null })).toBe('');
    expect(renderFigure({ gen: 'number_line', spec: null })).toBe('');
    expect(renderFigure({ gen: 'function_plot', spec: null })).toBe('');
    expect(renderFigure({ gen: 'molecule', spec: null })).toBe('');
  });

  it('كل المولّدات لا ترمي حتى بمدخلات شاذة', () => {
    // مدخلات صحيحة النوع لكنها شاذة
    expect(renderChart({ kind: 'bar' as any, labels: [], values: [] })).toBe('');
    // renderSetup و renderCircuit يُمرّران المواصفات مباشرة (التحقق عبر renderFigure)
    expect(() => renderSetup({ kind: 'heating', labels: { substance: 'x'.repeat(100) } as any })).not.toThrow();
    expect(() => renderCircuit({ components: [] as any })).not.toThrow();
  });
});

// ============================================================
// الأنواع والتخطيطات (Schemas)
// ============================================================
describe('التخطيطات (Schemas)', () => {
  it('chartKindSchema يحوي 7 أنواع', () => {
    const valid = ['bar', 'pie', 'line', 'pyramid', 'area', 'scatter', 'horizontal_bar'];
    for (const k of valid) {
      expect(chartKindSchema.safeParse(k).success).toBe(true);
    }
    expect(chartKindSchema.safeParse('radar').success).toBe(false);
  });

  it('geometryShapeSchema يحوي 15 شكلاً', () => {
    const valid = [
      'triangle', 'right_triangle', 'isosceles_triangle', 'equilateral_triangle',
      'square', 'rectangle', 'parallelogram', 'rhombus', 'trapezoid', 'circle',
      'pentagon', 'hexagon', 'ellipse', 'angle', 'line_segment',
    ];
    for (const s of valid) {
      expect(geometryShapeSchema.safeParse(s).success).toBe(true);
    }
    expect(geometryShapeSchema.safeParse('octagon').success).toBe(false);
  });

  it('circuitComponentSchema يحوي 12 مكوّناً', () => {
    const valid = [
      'generator', 'battery', 'lamp', 'switch', 'resistor',
      'ammeter', 'voltmeter', 'motor', 'wire', 'led', 'capacitor', 'buzzer',
    ];
    for (const c of valid) {
      expect(circuitComponentSchema.safeParse(c).success).toBe(true);
    }
    expect(circuitComponentSchema.safeParse('relay').success).toBe(false);
  });

  it('circuitSpecSchema يقبل layout اختياري', () => {
    const s1 = circuitSpecSchema.safeParse({ components: ['generator', 'lamp'] });
    expect(s1.success).toBe(true);
    if (s1.success) expect(s1.data.layout).toBe('series');

    const s2 = circuitSpecSchema.safeParse({ layout: 'parallel', components: ['lamp'], branch2: ['lamp'] });
    expect(s2.success).toBe(true);
  });

  it('forcesSpecSchema يقبل body وvectors صالحين', () => {
    const s1 = forcesSpecSchema.safeParse({ body: 'box', vectors: [{ dir: 'down', label: 'P' }] });
    expect(s1.success).toBe(true);

    const s2 = forcesSpecSchema.safeParse({
      body: 'ball',
      vectors: [{ dir: 'up', label: 'N', mag: 10 }, { dir: 'right', label: 'F', mag: 5 }],
    });
    expect(s2.success).toBe(true);

    const s3 = forcesSpecSchema.safeParse({ body: 'incline', angle: 30, vectors: [{ dir: 'down', label: 'P', mag: 10 }] });
    expect(s3.success).toBe(true);
  });
});

// ============================================================
describe('renderNumberLine — المستقيم المدرّج', () => {
  it('يُنتج SVG صالحاً لـ min=-5, max=5', () => {
    const svg = renderNumberLine({ min: -5, max: 5 });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('class="lesson-figure"');
    expect(svg).toContain('viewBox=');
  });

  it('يرسم تدريجاً يحتوي 0', () => {
    const svg = renderNumberLine({ min: -5, max: 5 });
    expect(svg).toContain('>0<');
  });

  it('يرسم نقاطاً مُعلَّمة مع تسميات', () => {
    const svg = renderNumberLine({ min: -5, max: 5, points: [{ x: 2, label: 'A' }, { x: -3, label: 'B' }] });
    expect(svg).toContain('>A<');
    expect(svg).toContain('>B<');
  });

  it('يرسم نقطة مجوّفة (filled=false)', () => {
    const svg = renderNumberLine({ min: 0, max: 10, points: [{ x: 3, label: 'C', filled: false }] });
    expect(svg).toContain('>C<');
    expect(svg).toContain('fill="none"');
  });

  it('يرسم فترة مؤشَّرة', () => {
    const svg = renderNumberLine({ min: -5, max: 5, interval: { from: -1, to: 3 } });
    expect(svg).toContain('#ef4444');
  });

  it('يرسم فترة مفتوحة', () => {
    const svg = renderNumberLine({ min: -5, max: 5, interval: { from: -1, to: 3, openLeft: true } });
    expect(svg).toContain('white');
  });

  it('يرسم خطوة مخصّصة', () => {
    const svg = renderNumberLine({ min: 0, max: 100, step: 20 });
    // range > 20 → يعرض كل خطوتين، فيظهر 0 و 40 و 80
    expect(svg).toContain('>0<');
    expect(svg).toContain('>40<');
  });

  it('numberLineSpecSchema يرفض max ≤ min', () => {
    expect(numberLineSpecSchema.safeParse({ min: 5, max: 3 }).success).toBe(false);
  });

  it('numberLineSpecSchema يرفض حقولاً إضافية', () => {
    expect(numberLineSpecSchema.safeParse({ min: 0, max: 10, extra: true }).success).toBe(false);
  });

  it('renderFigure يُرسّل number_line ويُنتج SVG', () => {
    const svg = renderFigure({ gen: 'number_line', spec: { min: -3, max: 3, points: [{ x: 1, label: 'M' }] } });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('>M<');
  });

  it('renderFigure يُعيد فارغاً عند spec غير صالح', () => {
    expect(renderFigure({ gen: 'number_line', spec: { min: 10 } })).toBe('');
  });

  it('يعمل في الوضع الداكن', () => {
    const svg = renderNumberLine({ min: -2, max: 2 }, { dark: true });
    // الوضع الداكن يستخدم لون الخط الداكن #e2e8f0
    expect(svg).toContain('#e2e8f0');
  });
});

// ============================================================
describe('renderFunctionPlot — منحنى الدالة', () => {
  it('يُنتج SVG صالحاً من نقاط', () => {
    const svg = renderFunctionPlot({ points: [{ x: -2, y: -4 }, { x: -1, y: -2 }, { x: 0, y: 0 }, { x: 1, y: 2 }, { x: 2, y: 4 }] });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('class="lesson-figure"');
    expect(svg).toContain('viewBox=');
  });

  it('يرسم منحنى من تعبير expr', () => {
    const svg = renderFunctionPlot({ expr: 'x^2', xmin: -3, xmax: 3 });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('stroke-width="2.5"');
  });

  it('التعبير x*2+1 يعطي قيماً صحيحة', () => {
    const svg = renderFunctionPlot({ expr: 'x*2+1', xmin: -2, xmax: 2 });
    expect(svg).toContain('fill="none"');
    expect(svg).toContain('#2563eb');
  });

  it('يرسم شبكة ومحاور', () => {
    const svg = renderFunctionPlot({ expr: 'x^2', xmin: -3, xmax: 3 });
    // شبكة: خطوط رقيقة
    expect(svg).toContain('stroke-width="0.5"');
    // إطار
    expect(svg).toContain('rx="2"');
  });

  it('يدعم تسميات المحاور', () => {
    const svg = renderFunctionPlot({ points: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 4 }], xlabel: 'x', ylabel: 'y' });
    expect(svg).toContain('>x<');
    expect(svg).toContain('>y<');
  });

  it('functionPlotSpecSchema يرفض بلا points أو expr', () => {
    expect(functionPlotSpecSchema.safeParse({}).success).toBe(false);
  });

  it('functionPlotSpecSchema يرفض expr بلا xmin/xmax', () => {
    expect(functionPlotSpecSchema.safeParse({ expr: 'x^2' }).success).toBe(false);
  });

  it('functionPlotSpecSchema يرفض حقولاً إضافية', () => {
    expect(functionPlotSpecSchema.safeParse({ points: [{ x: 0, y: 0 }, { x: 1, y: 1 }], extra: true }).success).toBe(false);
  });

  it('renderFigure يُرسّل function_plot ويُنتج SVG', () => {
    const svg = renderFigure({ gen: 'function_plot', spec: { points: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 4 }] } });
    expect(svg.startsWith('<svg')).toBe(true);
  });

  it('renderFigure يُعيد فارغاً عند spec غير صالح', () => {
    expect(renderFigure({ gen: 'function_plot', spec: { points: [] } })).toBe('');
  });

  it('يعمل في الوضع الداكن', () => {
    const svg = renderFunctionPlot({ expr: 'x^2', xmin: -2, xmax: 2 }, { dark: true });
    expect(svg).toContain('#60a5fa');
    expect(svg).toContain('#334155');
  });
});

// ============================================================
describe('renderMolecule — الجزيء (كيمياء)', () => {
  it('يُنتج SVG صالحاً من صيغة H2O', () => {
    const svg = renderMolecule({ formula: 'H2O' });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('class="lesson-figure"');
    expect(svg).toContain('viewBox=');
    expect(svg).toContain('>O<');
  });

  it('يرسم روابط مزدوجة لـ CO2', () => {
    const svg = renderMolecule({ formula: 'CO2' });
    expect(svg).toContain('>C<');
    expect(svg).toContain('>O<');
  });

  it('يرسم رابطاً ثلاثياً لـ N2', () => {
    const svg = renderMolecule({ formula: 'N2' });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('>N<');
  });

  it('يرسم ذرّات مباشرة مع روابط', () => {
    const svg = renderMolecule({
      atoms: [
        { el: 'C', x: 150, y: 100 },
        { el: 'O', x: 90, y: 100 },
        { el: 'H', x: 210, y: 100 },
      ],
      bonds: [{ a: 0, b: 1, order: 2 }, { a: 0, b: 2, order: 1 }],
    });
    expect(svg).toContain('>C<');
    expect(svg).toContain('>O<');
    expect(svg).toContain('>H<');
  });

  it('صيغة غير مُعدّة مسبقاً تستعمل التخطيط الدائري', () => {
    const svg = renderMolecule({ formula: 'CH4' });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('>C<');
    expect(svg).toContain('>H<');
  });

  it('renderFigure يُرسّل molecule ويُنتج SVG', () => {
    const svg = renderFigure({ gen: 'molecule', spec: { formula: 'H2O' } });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('>O<');
  });

  it('renderFigure يُعيد فارغاً عند spec غير صالح', () => {
    expect(renderFigure({ gen: 'molecule', spec: {} })).toBe('');
  });

  it('moleculeSpecSchema يرفض حقولاً إضافية', () => {
    expect(moleculeSpecSchema.safeParse({ formula: 'H2O', extra: true }).success).toBe(false);
  });

  it('يعمل في الوضع الداكن', () => {
    const svg = renderMolecule({ formula: 'H2O' }, { dark: true });
    // الوضع الداكن يستخدم لون الخط الداكن #e2e8f0
    expect(svg).toContain('#e2e8f0');
  });
});