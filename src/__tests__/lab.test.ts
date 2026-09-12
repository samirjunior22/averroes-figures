// ============================================================
// اختبارات مولّد كائنات المخبر (gen: 'lab')
// ============================================================
import { describe, it, expect } from 'vitest';
import { renderFigure, renderLab, labSpecSchema, LAB_KINDS, LAB_CATALOG, shellDistribution, elementByZ, FIGURE_GENS } from '../index.js';

const isSvg = (s: string) => s.startsWith('<svg') && s.endsWith('</svg>');

describe('lab — الواجهة العامة', () => {
  it('FIGURE_GENS يحوي lab', () => {
    expect(FIGURE_GENS).toContain('lab');
  });

  it('كل kind يُصيَّر بالافتراضات وحدها', () => {
    for (const kind of LAB_KINDS) {
      const svg = renderFigure({ gen: 'lab', spec: { kind } });
      expect(isSvg(svg), kind).toBe(true);
      expect(svg, kind).not.toContain('NaN');
      expect(svg, kind).not.toContain('undefined');
    }
  });

  it('يرفض kind مجهولاً ومفتاحاً زائداً (strict)', () => {
    expect(labSpecSchema.safeParse({ kind: 'nope' }).success).toBe(false);
    expect(labSpecSchema.safeParse({ kind: 'battery', foo: 1 }).success).toBe(false);
    expect(renderFigure({ gen: 'lab', spec: { kind: 'battery', foo: 1 } })).toBe('');
  });

  it('تصييران متتاليان لا يشتركان في معرّفات defs', () => {
    const a = renderLab({ kind: 'battery' });
    const b = renderLab({ kind: 'battery' });
    const ids = (s: string) => [...s.matchAll(/id="([^"]+)"/g)].map((m) => m[1]);
    const ia = new Set(ids(a));
    expect(ia.size).toBeGreaterThan(0);
    for (const id of ids(b)) expect(ia.has(id)).toBe(false);
  });
});

describe('lab — الفهرس LAB_CATALOG', () => {
  it('كل kind في الفهرس معروف للمخطّط، وكل preset يُصيَّر', () => {
    const kinds = new Set<string>(LAB_KINDS);
    const ids = new Set<string>();
    for (const entry of LAB_CATALOG) {
      expect(kinds.has(entry.kind), entry.kind).toBe(true);
      for (const preset of entry.presets) {
        expect(ids.has(preset.id), preset.id).toBe(false);
        ids.add(preset.id);
        const svg = renderFigure({ gen: 'lab', spec: { kind: entry.kind, ...preset.spec } });
        expect(isSvg(svg), preset.id).toBe(true);
      }
    }
  });

  it('كل kind له إدخال في الفهرس', () => {
    const inCatalog = new Set(LAB_CATALOG.map((e) => e.kind));
    for (const kind of LAB_KINDS) expect(inCatalog.has(kind), kind).toBe(true);
  });

  it('كل حقل في الفهرس يقبله مخطّط الـkind (يحرس الانحراف)', () => {
    for (const entry of LAB_CATALOG) {
      // نبدأ من أوّل شكل جاهز كي لا تُسقط قيود العلاقات (A ≥ Z، max > min) العيّنة
      const base = entry.presets[0]?.spec ?? {};
      for (const f of entry.fields) {
        const preset = base[f.key];
        const sample =
          f.type === 'number' ? (typeof preset === 'number' ? preset : (f.min ?? 1))
          : f.type === 'boolean' ? true
          : f.type === 'select' ? f.options![0]!.value
          : f.key === 'color' ? '#ff0000' : 'x';
        const res = labSpecSchema.safeParse({ kind: entry.kind, ...base, [f.key]: sample });
        expect(res.success, `${entry.kind}.${f.key}`).toBe(true);
      }
    }
  });
});

describe('lab — الذرّة', () => {
  it('توزيع الطبقات المدرسي', () => {
    expect(shellDistribution(1)).toEqual([1]);
    expect(shellDistribution(6)).toEqual([2, 4]);
    expect(shellDistribution(11)).toEqual([2, 8, 1]);
    expect(shellDistribution(18)).toEqual([2, 8, 8]);
    expect(shellDistribution(20)).toEqual([2, 8, 8, 2]);
  });

  it('الشريط المحسوب: p⁺ = Z، n⁰ = A − Z، e⁻ = Z + الاسم من الجدول', () => {
    const svg = renderLab({ kind: 'atom', Z: 11, A: 23 });
    expect(svg).toContain('p⁺ = 11');
    expect(svg).toContain('n⁰ = 12');
    expect(svg).toContain('e⁻ = 11');
    expect(svg).toContain('صوديوم');
    expect(svg).toContain('>Na<');
  });

  it('الرمز والاسم يُملآن من الجدول لـZ=6، ويُغلَّبان من المواصفة', () => {
    expect(renderLab({ kind: 'atom', Z: 6 })).toContain('كربون');
    expect(renderLab({ kind: 'atom', Z: 6, symbol: 'X', name: 'مجهول' })).toContain('مجهول');
    expect(elementByZ(8)?.symbol).toBe('O');
  });

  it('A < Z مرفوض، وإخفاء المدارات يُزيل الدوائر المتقطّعة', () => {
    expect(labSpecSchema.safeParse({ kind: 'atom', Z: 11, A: 5 }).success).toBe(false);
    expect(renderLab({ kind: 'atom', Z: 6, showShells: false })).not.toContain('stroke-dasharray="5 4"');
    expect(renderLab({ kind: 'atom', Z: 6, showShells: true })).toContain('stroke-dasharray="5 4"');
  });
});

describe('lab — قيم حيّة على الكائن', () => {
  it('البطارية والمقاومة والمقياس تعرض القيم', () => {
    expect(renderLab({ kind: 'battery', voltage: 12 })).toContain('E = 12 V');
    expect(renderLab({ kind: 'resistor', value: 47, label: 'R1' })).toContain('R1 = 47 Ω');
    expect(renderLab({ kind: 'meter', type: 'ammeter', reading: 1.2 })).toContain('1.2 A');
    expect(renderLab({ kind: 'meter', type: 'voltmeter', reading: 12 })).toContain('12 V');
  });

  it('القاطعة والمصباح بحالتين', () => {
    expect(renderLab({ kind: 'switch', closed: true })).toContain('مغلقة');
    expect(renderLab({ kind: 'switch' })).toContain('مفتوحة');
    expect(renderLab({ kind: 'lamp', on: true })).toContain('مضاء');
    expect(renderLab({ kind: 'lamp', on: false })).toContain('مطفأ');
  });

  it('الزجاجيات بمستوى 0 و100 بلا NaN، والأشكال الخمسة تختلف', () => {
    for (const level of [0, 100]) {
      const svg = renderLab({ kind: 'glassware', shape: 'flask', level });
      expect(isSvg(svg)).toBe(true);
      expect(svg).not.toContain('NaN');
    }
    const shapes = ['beaker', 'flask', 'erlenmeyer', 'test_tube', 'pipette'] as const;
    const out = shapes.map((shape) => renderLab({ kind: 'glassware', shape }).replace(/gl-[a-z0-9]+/g, 'gl'));
    expect(new Set(out).size).toBe(shapes.length);
  });

  it('الشعاع: الدور يُحدّد الاسم والوحدة، والزاوية تغيّر الإطار', () => {
    expect(renderLab({ kind: 'vector', role: 'weight', value: 10 })).toContain('P = 10 N');
    expect(renderLab({ kind: 'vector', role: 'velocity', value: 3 })).toContain('v = 3 m/s');
    const h = renderLab({ kind: 'vector', angle: 0, length: 100 });
    const v = renderLab({ kind: 'vector', angle: 90, length: 100 });
    expect(h.match(/viewBox="0 0 (\d+) (\d+)"/)?.[1]).not.toEqual(v.match(/viewBox="0 0 (\d+) (\d+)"/)?.[1]);
  });

  it('الصيغة تُحوّل الأرقام إلى منخفضة، والنصّ يُهرَّب', () => {
    expect(renderLab({ kind: 'formula', text: 'H2SO4' })).toContain('H₂SO₄');
    expect(renderLab({ kind: 'glassware', label: '<b>' })).toContain('&lt;b&gt;');
  });

  it('المحرار يقصّ القيمة داخل التدريج ويرفض max ≤ min', () => {
    expect(renderLab({ kind: 'thermometer', value: 999 })).toContain('110 °C');
    expect(labSpecSchema.safeParse({ kind: 'thermometer', min: 50, max: 10 }).success).toBe(false);
  });
});
