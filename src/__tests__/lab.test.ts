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
          : f.type === 'color' ? '#ff0000' : 'x';
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

describe('lab — كائنات الرياضيات الجديدة', () => {
  it('الكسر يعرض البسط والمقام في وضع full وأرقام في numbered وبلا بطاقة في none', () => {
    const full = renderLab({ kind: 'fraction', num: 3, den: 4, labelsMode: 'full' });
    expect(full).toContain('3 / 4');
    const numbered = renderLab({ kind: 'fraction', num: 3, den: 4, labelsMode: 'numbered' });
    expect(numbered).toContain('>1<');
    const none = renderLab({ kind: 'fraction', num: 3, den: 4, labelsMode: 'none' });
    expect(none).not.toContain('3 / 4');
  });

  it('المجسمات الهندسية تعرض الأبعاد الصحيحة', () => {
    expect(renderLab({ kind: 'solid', shape: 'cube', a: 7, unit: 'cm' })).toContain('a = 7 cm');
    expect(renderLab({ kind: 'solid', shape: 'cylinder', r: 4, h: 10, unit: 'cm' })).toContain('r = 4 cm');
    expect(renderLab({ kind: 'solid', shape: 'cone', r: 3, h: 6, unit: 'cm' })).toContain('h = 6 cm');
  });

  it('الساعة التناظرية تحسب العقارب وتعرض التوقيت الرقمي', () => {
    const svg = renderLab({ kind: 'clock', hours: 4, minutes: 30, showDigital: true });
    expect(svg).toContain('04:30');
  });

  it('المسطرة والمنقلة والكوس والبركار', () => {
    expect(renderLab({ kind: 'ruler', length: 20 })).toContain('20');
    expect(renderLab({ kind: 'protractor', angle: 45 })).toContain('الزاوية: 45°');
    expect(renderLab({ kind: 'set_square', type: '45' })).toContain('كوس 45°');
    expect(renderLab({ kind: 'compass_tool', radius: 50 })).toContain('r = 50 mm');
  });

  it('مجموعات الأعداد تدعم خاصية التركيز focus/highlight', () => {
    const svgN = renderLab({ kind: 'number_sets', highlight: 'N' });
    expect(svgN).toContain('المجموعة المبرزة: N');
    expect(renderLab({ kind: 'place_value', value: 7240 })).toContain('العدد: 7240');
    expect(renderLab({ kind: 'dice', face: 5 })).toContain('الوجه 5');
    expect(renderLab({ kind: 'coin', side: 'heads' })).toContain('وجه');
    expect(renderLab({ kind: 'coin', side: 'tails', value: 200 })).toContain('200');
    expect(renderLab({ kind: 'abacus', value: 500 })).toContain('القيمة: 500');
    expect(renderLab({ kind: 'coordinate_point', x: 4, y: -2, label: 'B' })).toContain('B(4, -2)');
  });
});

describe('lab — كائنات الجغرافيا الجديدة', () => {
  it('وردة الرياح والكرة الأرضية وتعاقب الفصول', () => {
    expect(renderLab({ kind: 'compass_rose', style: 'full' })).toContain('شمال (N)');
    const eq = renderLab({ kind: 'globe', highlight: 'equator' });
    expect(eq).toContain('خط الاستواء');
    const sea = renderLab({ kind: 'seasons', season: 'winter' });
    expect(sea).toContain('انقلاب شتوي');
  });

  it('دورة الماء والمقطع التضاريسي والبركان مع التركيز', () => {
    expect(renderLab({ kind: 'water_cycle', labelsMode: 'full' })).toContain('تبخر');
    expect(renderLab({ kind: 'water_cycle', labelsMode: 'numbered' })).toContain('>1<');
    expect(renderLab({ kind: 'relief_profile' })).toContain('مقطع تضاريسي');
    const volChamber = renderLab({ kind: 'volcano', focus: 'chamber' });
    expect(volChamber).toContain('غرفة الصهارة');
    expect(renderLab({ kind: 'rock_layers', layers: 5 })).toContain('طبقات رسوبية');
  });

  it('أجهزة الأرصاد والمنحنى المناخي ورموز الخريطة ومقياس الرسم', () => {
    expect(renderLab({ kind: 'weather_instrument', type: 'thermometer', value: 32 })).toContain('32 °C');
    expect(renderLab({ kind: 'climate_bar', city: 'وهران' })).toContain('وهران');
    expect(renderLab({ kind: 'map_symbol', symbol: 'capital' })).toContain('عاصمة');
    expect(renderLab({ kind: 'scale_bar', km: 250 })).toContain('250 km');
  });
});

describe('lab — كائنات الإعلام الآلي الجديدة', () => {
  it('عتاد الحاسوب ورمز المخطط الانسيابي', () => {
    expect(renderLab({ kind: 'device', type: 'cpu' })).toContain('CPU');
    expect(renderLab({ kind: 'flow_symbol', shape: 'decision', text: 'n % 2 == 0' })).toContain('n % 2 == 0');
  });

  it('البوابات المنطقية تحسب الخرج آلياً', () => {
    // AND
    expect(renderLab({ kind: 'logic_gate', gate: 'AND', a: 1, b: 1 })).toContain('S = 1');
    expect(renderLab({ kind: 'logic_gate', gate: 'AND', a: 1, b: 0 })).toContain('S = 0');
    // OR
    expect(renderLab({ kind: 'logic_gate', gate: 'OR', a: 1, b: 0 })).toContain('S = 1');
    expect(renderLab({ kind: 'logic_gate', gate: 'OR', a: 0, b: 0 })).toContain('S = 0');
    // NOT
    expect(renderLab({ kind: 'logic_gate', gate: 'NOT', a: 1 })).toContain('S = 0');
    expect(renderLab({ kind: 'logic_gate', gate: 'NOT', a: 0 })).toContain('S = 1');
    // XOR
    expect(renderLab({ kind: 'logic_gate', gate: 'XOR', a: 1, b: 0 })).toContain('S = 1');
    expect(renderLab({ kind: 'logic_gate', gate: 'XOR', a: 1, b: 1 })).toContain('S = 0');
  });

  it('السجل الثنائي وصندوق المتغير وأيقونة الملف والشبكة وسكراتش وسلم التخزين', () => {
    expect(renderLab({ kind: 'binary', value: 13, bits: 8 })).toContain('القيمة العشرية: 13');
    expect(renderLab({ kind: 'variable_box', name: 'counter', value: '10', varType: 'int' })).toContain('counter');
    expect(renderLab({ kind: 'file_icon', fileType: 'folder', name: 'المشاريع' })).toContain('المشاريع');
    expect(renderLab({ kind: 'network', topology: 'star', nodes: 5 })).toContain('طوبولوجيا: star');
    expect(renderLab({ kind: 'scratch_block', category: 'motion', text: 'تحرك 20 خطوة' })).toContain('تحرك 20 خطوة');
    expect(renderLab({ kind: 'storage_units', highlight: 'GB' })).toContain('غيغابايت (GB)');
  });
});

