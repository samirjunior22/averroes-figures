import { describe, it, expect } from 'vitest';
import { renderTimeline, renderMap, renderFigure, FIGURE_GENS } from '../index.js';

describe('مولّد الخطّ الزمني (timeline)', () => {
  const events = [
    { year: 1954, label: 'اندلاع الثورة', major: true },
    { year: 1962, label: 'الاستقلال', major: true },
  ];

  it('يُنتج SVG صالحاً بصنف الأشكال المشترك', () => {
    const svg = renderTimeline({ events });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('class="lesson-figure"');
    expect(svg).toContain('اندلاع الثورة');
    expect(svg).toContain('1962');
  });

  it('يكتب ما قبل الميلاد بالعرف العربي لا بإشارة ناقص', () => {
    const svg = renderTimeline({ events: [{ year: -814, label: 'قرطاجة' }, { year: 1962, label: 'الاستقلال' }] });
    expect(svg).toContain('814 ق.م');
    expect(svg).not.toContain('-814');
  });

  it('يرتّب الأحداث زمنياً مهما كان ترتيب الإدخال', () => {
    const shuffled = renderTimeline({ events: [events[1]!, events[0]!] });
    expect(shuffled).toBe(renderTimeline({ events }));
  });

  it('يوسّع الرسم بعدد الأحداث كي لا تتراكم التسميات', () => {
    const two = renderTimeline({ events });
    const eight = renderTimeline({
      events: Array.from({ length: 8 }, (_, i) => ({ year: 1950 + i, label: `حدث ${i}` })),
    });
    const width = (svg: string): number => Number(/viewBox="0 0 (\d+)/.exec(svg)![1]);
    expect(width(eight)).toBeGreaterThan(width(two));
  });

  it('يقصّ التسمية الطويلة بدل أن تفيض على جارتها', () => {
    const svg = renderTimeline({
      events: Array.from({ length: 8 }, (_, i) => ({
        year: 1950 + i,
        label: 'تسمية طويلة جداً لا تسع الحيّز المتاح إطلاقاً',
      })),
    });
    expect(svg).toContain('…');
  });

  it('لا يرمي على مواصفات غير صالحة — حدث واحد مرفوض', () => {
    expect(renderFigure({ gen: 'timeline', spec: { events: [{ year: 1954, label: 'وحيد' }] } })).toBe('');
    expect(renderFigure({ gen: 'timeline', spec: {} })).toBe('');
  });
});

describe('مولّد الخريطة التخطيطية (map)', () => {
  const spec = {
    title: 'توطين المدن',
    markers: [
      { label: 'الجزائر', x: 50, y: 20, kind: 'capital' as const },
      { label: 'وهران', x: 20, y: 25, kind: 'port' as const },
    ],
  };

  it('يُنتج SVG صالحاً بإطار ومفتاح', () => {
    const svg = renderMap(spec);
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('class="lesson-figure"');
    expect(svg).toContain('الجزائر');
    expect(svg).toContain('عاصمة'); // المفتاح
    expect(svg).toContain('ميناء');
  });

  it('المفتاح يذكر الأصناف المستعملة وحدها', () => {
    const svg = renderMap(spec);
    expect(svg).not.toContain('جبل');
    expect(svg).not.toContain('نهر/واد');
  });

  it('سهم الشمال افتراضي ويُطفأ صراحةً', () => {
    expect(renderMap(spec)).toContain('>ش<');
    expect(renderMap({ ...spec, compass: false })).not.toContain('>ش<');
  });

  it('النطاقات تُرسم وتُسمّى', () => {
    const svg = renderMap({ ...spec, zones: [{ label: 'الإقليم التلي', x: 5, y: 5, w: 90, h: 30 }] });
    expect(svg).toContain('الإقليم التلي');
    expect(svg).toContain('stroke-dasharray');
  });

  it('يرفض خريطة بلا معالم ولا نطاقات (إطارٌ فارغ لا يفيد)', () => {
    expect(renderFigure({ gen: 'map', spec: { title: 'فارغة' } })).toBe('');
  });

  it('يهرب النصّ ضدّ حقن XML', () => {
    const svg = renderMap({ markers: [{ label: '<script>x</script>', x: 10, y: 10 }] });
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&lt;script&gt;');
  });
});

describe('السجلّ', () => {
  it('يعرف المولّدين الجديدين', () => {
    expect(FIGURE_GENS).toContain('timeline');
    expect(FIGURE_GENS).toContain('map');
  });

  it('renderFigure يوزّع عليهما', () => {
    expect(renderFigure({ gen: 'timeline', spec: { events: [{ year: 1, label: 'أ' }, { year: 2, label: 'ب' }] } })).toContain('<svg');
    expect(renderFigure({ gen: 'map', spec: { markers: [{ label: 'م', x: 5, y: 5 }] } })).toContain('<svg');
  });
});
