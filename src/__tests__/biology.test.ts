// ============================================================
// اختبارات مولّد البيولوجيا — رسم الخلية العصبية 3D
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  renderFigure,
  renderBiology,
  renderNeuron,
  renderRespiratorySystem,
  renderEye,
  biologySpecSchema,
  neuronSpecSchema,
  respiratorySpecSchema,
  eyeSpecSchema,
  FIGURE_GENS,
} from '../index.js';

describe('مولّد البيولوجيا (biology / neuron)', () => {
  it('FIGURE_GENS يحوي biology', () => {
    expect(FIGURE_GENS).toContain('biology');
  });

  describe('مخطّط Zod (neuronSpecSchema & biologySpecSchema)', () => {
    it('يقبل مواصفة صحيحة بأبسط شكل', () => {
      const parsed = neuronSpecSchema.safeParse({ kind: 'neuron' });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.kind).toBe('neuron');
      }
    });

    it('يقبل كافة الخيارات المتاحة', () => {
      const parsed = neuronSpecSchema.safeParse({
        kind: 'neuron',
        labelsMode: 'numbered',
        theme: 'vibrant',
        focus: 'myelin',
        showActionPotential: true,
        myelinCount: 5,
        caption: 'خلية عصبية حسية',
      });
      expect(parsed.success).toBe(true);
    });

    it('يرفض kind غير معروف', () => {
      const parsed = biologySpecSchema.safeParse({ kind: 'unknown_bio' });
      expect(parsed.success).toBe(false);
    });

    it('يرفض myelinCount خارج المجال (أقل من 2 أو أكثر من 6)', () => {
      expect(neuronSpecSchema.safeParse({ kind: 'neuron', myelinCount: 1 }).success).toBe(false);
      expect(neuronSpecSchema.safeParse({ kind: 'neuron', myelinCount: 10 }).success).toBe(false);
    });

    it('يرفض حقولاً إضافية غير معلنة (.strict)', () => {
      const parsed = neuronSpecSchema.safeParse({
        kind: 'neuron',
        extraField: 123,
      });
      expect(parsed.success).toBe(false);
    });
  });

  describe('تصيير الرسم (renderNeuron & renderBiology)', () => {
    it('يولّد SVG صالحاً ومكتملاً', () => {
      const svg = renderNeuron({ kind: 'neuron' });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg.endsWith('</svg>')).toBe(true);
      expect(svg).toContain('class="lesson-figure"');
      expect(svg).toContain('role="img"');
    });

    it('يحتوي على تدرجات التجسيم ثلاثي الأبعاد والفلاتر', () => {
      const svg = renderNeuron({ kind: 'neuron' });
      expect(svg).toContain('<radialGradient');
      expect(svg).toContain('<linearGradient');
      expect(svg).toContain('<feDropShadow');
      expect(svg).toContain('somaGrad');
      expect(svg).toContain('nucleusGrad');
      expect(svg).toContain('myelinCylGrad');
    });

    it('يحتوي على بطاقات الشرح الكاملة في وضع full', () => {
      const svg = renderNeuron({ kind: 'neuron', labelsMode: 'full' });
      expect(svg).toContain('تفرعات شجيرية');
      expect(svg).toContain('Dendrites');
      expect(svg).toContain('غمد النخاعين (3D)');
      expect(svg).toContain('Myelin Sheath');
      expect(svg).toContain('جسم خلوي ونواة');
      expect(svg).toContain('اختناق رانفييه');
      expect(svg).toContain('محور أسطواني');
      expect(svg).toContain('تفرعات انتهائية وأزرار مشبكية');
    });

    it('يحتوي على دوائر مرقمة 1..6 في وضع الامتحانات numbered', () => {
      const svg = renderNeuron({ kind: 'neuron', labelsMode: 'numbered' });
      expect(svg).toContain('مؤشر مرقم [1]');
      expect(svg).toContain('مؤشر مرقم [6]');
      // لا يحتوي على نصوص البطاقات المطولة
      expect(svg).not.toContain('Myelin Sheath');
      expect(svg).not.toContain('Dendrites');
    });

    it('لا يحتوي على تأشيرات في الوضع الصامت none', () => {
      const svg = renderNeuron({ kind: 'neuron', labelsMode: 'none' });
      expect(svg).not.toContain('class="bio-callouts"');
      expect(svg).not.toContain('Dendrites');
      expect(svg).not.toContain('مؤشر مرقم');
    });

    it('يتحكم بسهم اتجاه السيالة العصبية', () => {
      const withAP = renderNeuron({ kind: 'neuron', showActionPotential: true });
      expect(withAP).toContain('اتجاه انتشار السيالة العصبية');

      const withoutAP = renderNeuron({ kind: 'neuron', showActionPotential: false });
      expect(withoutAP).not.toContain('اتجاه انتشار السيالة العصبية');
    });

    it('يدعم سمات التلوين المختلفة (natural, vibrant, exam_print)', () => {
      const natural = renderNeuron({ kind: 'neuron', theme: 'natural' });
      const vibrant = renderNeuron({ kind: 'neuron', theme: 'vibrant' });
      const exam = renderNeuron({ kind: 'neuron', theme: 'exam_print' });

      expect(natural.startsWith('<svg')).toBe(true);
      expect(vibrant.startsWith('<svg')).toBe(true);
      expect(exam.startsWith('<svg')).toBe(true);
    });

    it('يطبّق تأثير التركيز focus بتخفيف شفافية باقي العضيات', () => {
      const focusedMyelin = renderNeuron({ kind: 'neuron', focus: 'myelin' });
      expect(focusedMyelin).toContain('opacity="0.35"');
    });
  });

  describe('التكامل مع الموزع العام renderFigure ومبدأ لا يرمي', () => {
    it('renderFigure يوجّه إلى biology بنجاح', () => {
      const svg = renderFigure({
        gen: 'biology',
        spec: { kind: 'neuron', caption: 'رسم بيولوجي' },
      });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('رسم بيولوجي');
    });

    it('يعيد نصاً فارغاً عند تمرير مواصفات خاطئة بلا استثناء', () => {
      expect(() => {
        const res = renderFigure({
          gen: 'biology',
          spec: { kind: 'invalid', bad: 999 },
        });
        expect(res).toBe('');
      }).not.toThrow();
    });

    it('يعيد نصاً فارغاً عند تمرير spec فارغ أو غير كائن', () => {
      expect(() => {
        const res1 = renderFigure({ gen: 'biology', spec: null });
        const res2 = renderFigure({ gen: 'biology', spec: undefined });
        const res3 = renderFigure({ gen: 'biology', spec: 'not-an-object' });
        expect(res1).toBe('');
        expect(res2).toBe('');
        expect(res3).toBe('');
      }).not.toThrow();
    });
  });

  describe('الجهاز التنفسي والمبادلات الغازية (respiratory_system)', () => {
    it('يقبل مواصفة الجهاز التنفسي الصحيحة', () => {
      const parsed = respiratorySpecSchema.safeParse({ kind: 'respiratory_system' });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.kind).toBe('respiratory_system');
      }
    });

    it('يقبل كافة خيارات الجهاز التنفسي', () => {
      const parsed = respiratorySpecSchema.safeParse({
        kind: 'respiratory_system',
        labelsMode: 'numbered',
        theme: 'vibrant',
        focus: 'lungs',
        showAirflow: true,
        showAlveoliZoom: true,
        showGasExchange: true,
        caption: 'الجهاز التنفسي عند الإنسان',
      });
      expect(parsed.success).toBe(true);
    });

    it('يرفض حقولاً إضافية غير معلنة (.strict)', () => {
      const parsed = respiratorySpecSchema.safeParse({
        kind: 'respiratory_system',
        invalidField: true,
      });
      expect(parsed.success).toBe(false);
    });

    it('يولّد SVG مكتملاً للجهاز التنفسي', () => {
      const svg = renderRespiratorySystem({ kind: 'respiratory_system' });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg.endsWith('</svg>')).toBe(true);
      expect(svg).toContain('class="lesson-figure"');
    });

    it('يحتوي على تدرجات التجسيم ثلاثي الأبعاد للرئتين والقصبة والحجاب الحاجز', () => {
      const svg = renderRespiratorySystem({ kind: 'respiratory_system' });
      expect(svg).toContain('lungRightGrad');
      expect(svg).toContain('ringGrad');
      expect(svg).toContain('diaphragmGrad');
      expect(svg).toContain('alveolusGrad');
    });

    it('يحتوي على جميع التأشيرات السبع في وضع الشرح الكامل full', () => {
      const svg = renderRespiratorySystem({ kind: 'respiratory_system', labelsMode: 'full' });
      expect(svg).toContain('القصبة الهوائية');
      expect(svg).toContain('Trachea');
      expect(svg).toContain('الشعبتان الهوائيتان');
      expect(svg).toContain('Bronchi');
      expect(svg).toContain('الرئة اليمنى (3 فصوص)');
      expect(svg).toContain('القصيبات الهوائية (مقطع)');
      expect(svg).toContain('الحويصلات الرئوية (مكبرة)');
      expect(svg).toContain('الحجاب الحاجز');
      expect(svg).toContain('المبادلات الغازية (O₂ / CO₂)');
    });

    it('يحتوي على دوائر مرقمة 1..7 في وضع الامتحانات numbered', () => {
      const svg = renderRespiratorySystem({ kind: 'respiratory_system', labelsMode: 'numbered' });
      expect(svg).toContain('مؤشر مرقم [1]');
      expect(svg).toContain('مؤشر مرقم [7]');
      expect(svg).not.toContain('Trachea');
      expect(svg).not.toContain('Bronchioles');
    });

    it('لا يحتوي على تأشيرات في الوضع الصامت none', () => {
      const svg = renderRespiratorySystem({ kind: 'respiratory_system', labelsMode: 'none' });
      expect(svg).not.toContain('class="bio-callouts"');
      expect(svg).not.toContain('مؤشر مرقم');
    });

    it('يتحكم بنافذة تكبير الحويصلات showAlveoliZoom', () => {
      const withZoom = renderRespiratorySystem({ kind: 'respiratory_system', showAlveoliZoom: true });
      expect(withZoom).toContain('مقطع مكبر: الحويصلات الرئوية');

      const withoutZoom = renderRespiratorySystem({ kind: 'respiratory_system', showAlveoliZoom: false });
      expect(withoutZoom).not.toContain('مقطع مكبر: الحويصلات الرئوية');
    });

    it('يتحكم بأسهم مسار الهواء شهيق وزفير', () => {
      const withAir = renderRespiratorySystem({ kind: 'respiratory_system', showAirflow: true });
      expect(withAir).toContain('شهيق O₂');
      expect(withAir).toContain('زفير CO₂');

      const withoutAir = renderRespiratorySystem({ kind: 'respiratory_system', showAirflow: false });
      expect(withoutAir).not.toContain('شهيق O₂');
    });

    it('يدعم سمات التلوين (natural, vibrant, exam_print)', () => {
      const natural = renderRespiratorySystem({ kind: 'respiratory_system', theme: 'natural' });
      const vibrant = renderRespiratorySystem({ kind: 'respiratory_system', theme: 'vibrant' });
      const exam = renderRespiratorySystem({ kind: 'respiratory_system', theme: 'exam_print' });

      expect(natural.startsWith('<svg')).toBe(true);
      expect(vibrant.startsWith('<svg')).toBe(true);
      expect(exam.startsWith('<svg')).toBe(true);
    });

    it('renderFigure يوجّه إلى respiratory_system بنجاح', () => {
      const svg = renderFigure({
        gen: 'biology',
        spec: { kind: 'respiratory_system', caption: 'رسم الجهاز التنفسي' },
      });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('رسم الجهاز التنفسي');
    });
  });

  describe('مقطع كرة العين وحاسة الرؤية (eye)', () => {
    describe('مخطّط Zod (eyeSpecSchema)', () => {
      it('يقبل مواصفة صحيحة بأبسط شكل', () => {
        const parsed = eyeSpecSchema.safeParse({ kind: 'eye' });
        expect(parsed.success).toBe(true);
        if (parsed.success) {
          expect(parsed.data.kind).toBe('eye');
        }
      });

      it('يقبل كافة الخيارات المتاحة', () => {
        const parsed = eyeSpecSchema.safeParse({
          kind: 'eye',
          labelsMode: 'numbered',
          theme: 'vibrant',
          focus: 'lens',
          showOpticalAxis: true,
          caption: 'مقطع كرة العين',
        });
        expect(parsed.success).toBe(true);
      });

      it('يرفض focus غير معروف', () => {
        expect(eyeSpecSchema.safeParse({ kind: 'eye', focus: 'unknown_part' }).success).toBe(false);
      });

      it('يرفض حقولاً إضافية غير معلنة (.strict)', () => {
        expect(eyeSpecSchema.safeParse({ kind: 'eye', extra: 123 }).success).toBe(false);
      });
    });

    describe('تصيير مقطع كرة العين (renderEye)', () => {
      it('يولّد SVG صالحاً ومكتملاً', () => {
        const svg = renderEye({ kind: 'eye' });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg.endsWith('</svg>')).toBe(true);
        expect(svg).toContain('class="lesson-figure"');
      });

      it('يحتوي على تدرجات التجسيم ثلاثي الأبعاد للأوساط الشفافة وجدار العين', () => {
        const svg = renderEye({ kind: 'eye' });
        expect(svg).toContain('vitreousGrad');
        expect(svg).toContain('lensGrad');
        expect(svg).toContain('corneaGrad');
        expect(svg).toContain('nerveGrad');
      });

      it('يحتوي على جميع التأشيرات السبع في وضع الشرح الكامل full', () => {
        const svg = renderEye({ kind: 'eye', labelsMode: 'full' });
        expect(svg).toContain('الصلبة');
        expect(svg).toContain('Sclera');
        expect(svg).toContain('المشيمية والشبكية');
        expect(svg).toContain('Choroid &amp; Retina');
        expect(svg).toContain('القرنية الشفافة');
        expect(svg).toContain('Cornea');
        expect(svg).toContain('العدسة البلورية');
        expect(svg).toContain('Crystalline Lens');
        expect(svg).toContain('القزحية والحدقة');
        expect(svg).toContain('Iris &amp; Pupil');
        expect(svg).toContain('الخلط الزجاجي');
        expect(svg).toContain('Vitreous Body');
        expect(svg).toContain('العصب البصري');
        expect(svg).toContain('Optic Nerve');
      });

      it('يحتوي على دوائر مرقمة 1..7 في وضع الامتحانات numbered', () => {
        const svg = renderEye({ kind: 'eye', labelsMode: 'numbered' });
        expect(svg).toContain('مؤشر مرقم [1]');
        expect(svg).toContain('مؤشر مرقم [7]');
        expect(svg).not.toContain('Crystalline Lens');
        expect(svg).not.toContain('Optic Nerve');
      });

      it('لا يحتوي على تأشيرات في الوضع الصامت none', () => {
        const svg = renderEye({ kind: 'eye', labelsMode: 'none' });
        expect(svg).not.toContain('class="bio-callouts"');
        expect(svg).not.toContain('مؤشر مرقم');
      });

      it('يتحكم بخط وسهم مسار الضوء والمحور البصري showOpticalAxis', () => {
        const withAxis = renderEye({ kind: 'eye', showOpticalAxis: true });
        expect(withAxis).toContain('المحور البصري (مسار الضوء)');

        const withoutAxis = renderEye({ kind: 'eye', showOpticalAxis: false });
        expect(withoutAxis).not.toContain('المحور البصري (مسار الضوء)');
      });

      it('يدعم سمات التلوين (natural, vibrant, exam_print)', () => {
        const natural = renderEye({ kind: 'eye', theme: 'natural' });
        const vibrant = renderEye({ kind: 'eye', theme: 'vibrant' });
        const exam = renderEye({ kind: 'eye', theme: 'exam_print' });

        expect(natural.startsWith('<svg')).toBe(true);
        expect(vibrant.startsWith('<svg')).toBe(true);
        expect(exam.startsWith('<svg')).toBe(true);
      });

      it('renderFigure يوجّه إلى eye بنجاح', () => {
        const svg = renderFigure({
          gen: 'biology',
          spec: { kind: 'eye', caption: 'مقطع كرة العين' },
        });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg).toContain('مقطع كرة العين');
      });
    });
  });
});

