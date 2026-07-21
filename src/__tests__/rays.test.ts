// ============================================================
// اختبارات مولّد الأشعة الضوئية (rays) — البصريات
// ============================================================
// يغطّي: كل الأنواع الخمسة، التحقّق من الـ schema، الخيارات،
// مبدأ "لا يرمي"، والتوجيه عبر renderFigure.
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  renderRays,
  raysSpecSchema,
  raysKindSchema,
  renderFigure,
} from '../index.js';
import type { RaysSpec, RaysKind } from '../index.js';

const ALL_KINDS: readonly RaysKind[] = [
  'converging_lens',
  'diverging_lens',
  'plane_mirror',
  'concave_mirror',
  'convex_mirror',
];

describe('renderRays — الأشعة الضوئية (البصريات)', () => {
  it('يُنتج SVG صالحاً لكل الأنواع الخمسة', () => {
    for (const kind of ALL_KINDS) {
      const svg = renderRays({ kind });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('class="lesson-figure"');
      expect(svg.endsWith('</svg>')).toBe(true);
      expect(svg).toContain('viewBox=');
    }
  });

  it('يرسم المحور البصري والشيء والصورة', () => {
    const svg = renderRays({ kind: 'converging_lens' });
    // المحور البصري متقطّع
    expect(svg).toContain('stroke-dasharray="6 4"');
    // تسمية الشيء B وصورته B'
    expect(svg).toContain('>B<');
    expect(svg).toContain(">B'<");
  });

  it('يرسم البؤر F وF\' للعدسات', () => {
    const svg = renderRays({ kind: 'converging_lens' });
    expect(svg).toContain('>F<');
    expect(svg).toContain(">F'<");
  });

  it('يرسم البؤرة F والمركز C للمرايا', () => {
    const svg = renderRays({ kind: 'concave_mirror' });
    expect(svg).toContain('>F<');
    expect(svg).toContain('>C<');
  });

  it('العدسة المفرّقة تُنتج صورة تخيّلية (خطوط متقطّعة)', () => {
    const svg = renderRays({ kind: 'diverging_lens' });
    expect(svg).toContain('stroke-dasharray');
    expect(svg.startsWith('<svg')).toBe(true);
  });

  it('المرآة المستوية تُنتج صورة تخيّلية خلفها', () => {
    const svg = renderRays({ kind: 'plane_mirror' });
    expect(svg.startsWith('<svg')).toBe(true);
    // المرآة المستوية بلا بؤر
    expect(svg).not.toContain('>C<');
  });

  it('يحترم أبعاد الشيء والبؤرة المخصّصة', () => {
    const svg = renderRays({
      kind: 'converging_lens',
      objectDistance: 150,
      objectHeight: 60,
      focalLength: 50,
    });
    expect(svg.startsWith('<svg')).toBe(true);
  });

  it('يدعم إخفاء أشعّة الإنشاء', () => {
    const withRays = renderRays({ kind: 'converging_lens', showConstructionRays: true });
    const noRays = renderRays({ kind: 'converging_lens', showConstructionRays: false });
    expect(noRays.length).toBeLessThan(withRays.length);
    // ألوان أشعّة الإنشاء غائبة عند الإخفاء
    expect(noRays).not.toContain('#8b5cf6');
  });

  it('يدعم إخفاء التسميات', () => {
    const svg = renderRays({ kind: 'converging_lens', showLabels: false });
    expect(svg).not.toContain('>F<');
    expect(svg.startsWith('<svg')).toBe(true);
  });

  it('raysKindSchema يحوي 5 أنواع', () => {
    for (const k of ALL_KINDS) {
      expect(raysKindSchema.safeParse(k).success).toBe(true);
    }
    expect(raysKindSchema.safeParse('prism').success).toBe(false);
  });

  it('raysSpecSchema يرفض نوعاً مجهولاً', () => {
    expect(raysSpecSchema.safeParse({ kind: 'telescope' }).success).toBe(false);
  });

  it('raysSpecSchema يرفض حقولاً إضافية', () => {
    expect(raysSpecSchema.safeParse({ kind: 'converging_lens', extra: true }).success).toBe(false);
  });

  it('raysSpecSchema يرفض قيماً غير موجبة', () => {
    expect(raysSpecSchema.safeParse({ kind: 'converging_lens', objectDistance: -5 }).success).toBe(false);
    expect(raysSpecSchema.safeParse({ kind: 'converging_lens', focalLength: 0 }).success).toBe(false);
  });

  it('renderFigure يُرسّل rays ويُنتج SVG', () => {
    const svg = renderFigure({ gen: 'rays', spec: { kind: 'converging_lens' } });
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('class="lesson-figure"');
  });

  it('مبدأ "لا يرمي": spec غير صالح عبر renderFigure → فارغ', () => {
    expect(renderFigure({ gen: 'rays', spec: {} })).toBe('');
    expect(renderFigure({ gen: 'rays', spec: null })).toBe('');
    expect(renderFigure({ gen: 'rays', spec: { kind: 'bad' } })).toBe('');
  });

  it('يدعم خيارات التصيير (dark mode)', () => {
    const svg = renderRays({ kind: 'concave_mirror' }, { dark: true });
    expect(svg.startsWith('<svg')).toBe(true);
    // الوضع الداكن يستخدم لون الخط الداكن
    expect(svg).toContain('#e2e8f0');
  });

  it('التوافقية: بدون خيارات يعمل كالمعتاد', () => {
    const spec: RaysSpec = { kind: 'convex_mirror' };
    expect(renderRays(spec)).toContain('class="lesson-figure"');
  });
});
