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
  renderVillus,
  renderSynapse,
  renderDigestiveSystem,
  renderUrinarySystem,
  renderCirculatorySystem,
  renderSkeletalSystem,
  biologySpecSchema,
  neuronSpecSchema,
  respiratorySpecSchema,
  eyeSpecSchema,
  villusSpecSchema,
  synapseSpecSchema,
  digestiveSpecSchema,
  urinarySpecSchema,
  circulatorySpecSchema,
  skeletalSpecSchema,
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

  describe('الزغابة المعوية والامتصاص المعوي (villus)', () => {
    describe('مخطّط Zod (villusSpecSchema)', () => {
      it('يقبل مواصفة صحيحة بأبسط شكل', () => {
        const parsed = villusSpecSchema.safeParse({ kind: 'villus' });
        expect(parsed.success).toBe(true);
        if (parsed.success) {
          expect(parsed.data.kind).toBe('villus');
        }
      });

      it('يقبل كافة الخيارات المتاحة', () => {
        const parsed = villusSpecSchema.safeParse({
          kind: 'villus',
          labelsMode: 'numbered',
          theme: 'vibrant',
          focus: 'lacteal',
          showNutrientFlow: true,
          caption: 'مقطع الزغابة المعوية',
        });
        expect(parsed.success).toBe(true);
      });

      it('يرفض focus غير معروف', () => {
        expect(villusSpecSchema.safeParse({ kind: 'villus', focus: 'invalid_part' }).success).toBe(false);
      });

      it('يرفض حقولاً إضافية غير معلنة (.strict)', () => {
        expect(villusSpecSchema.safeParse({ kind: 'villus', unknownKey: 123 }).success).toBe(false);
      });
    });

    describe('تصيير الزغابة المعوية (renderVillus)', () => {
      it('يولّد SVG صالحاً ومكتملاً', () => {
        const svg = renderVillus({ kind: 'villus' });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg.endsWith('</svg>')).toBe(true);
        expect(svg).toContain('class="lesson-figure"');
      });

      it('يحتوي على تدرجات التجسيم للوعاء البلغمي والشعيرات الدموية', () => {
        const svg = renderVillus({ kind: 'villus' });
        expect(svg).toContain('lactealGrad');
        expect(svg).toContain('arteryGrad');
        expect(svg).toContain('veinGrad');
      });

      it('يحتوي على جميع التأشيرات السبع في وضع الشرح الكامل full', () => {
        const svg = renderVillus({ kind: 'villus', labelsMode: 'full' });
        expect(svg).toContain('ظهارة معوية مع حافة فرشاتية');
        expect(svg).toContain('Intestinal Epithelium &amp; Microvilli');
        expect(svg).toContain('خلايا كأسية مفرزة للمخاط');
        expect(svg).toContain('Goblet Cells');
        expect(svg).toContain('وعاء لمفاوي (بلغمي) مركزي');
        expect(svg).toContain('Central Lacteal');
        expect(svg).toContain('شبكة شعيرات دموية');
        expect(svg).toContain('Capillary Network');
        expect(svg).toContain('شريان وارد (دم شرياني)');
        expect(svg).toContain('Arteriole');
        expect(svg).toContain('وريد صادر (دم محمل بالمغذيات)');
        expect(svg).toContain('Venule');
        expect(svg).toContain('لمعة المعي الدقيق');
        expect(svg).toContain('Intestinal Lumen');
      });

      it('يحتوي على دوائر مرقمة 1..7 في وضع الامتحانات numbered', () => {
        const svg = renderVillus({ kind: 'villus', labelsMode: 'numbered' });
        expect(svg).toContain('مؤشر مرقم [1]');
        expect(svg).toContain('مؤشر مرقم [7]');
        expect(svg).not.toContain('Central Lacteal');
        expect(svg).not.toContain('Goblet Cells');
      });

      it('لا يحتوي على تأشيرات في الوضع الصامت none', () => {
        const svg = renderVillus({ kind: 'villus', labelsMode: 'none' });
        expect(svg).not.toContain('class="bio-callouts"');
        expect(svg).not.toContain('مؤشر مرقم');
      });

      it('يتحكم بإظهار أسهم مسار المغذيات showNutrientFlow', () => {
        const withFlow = renderVillus({ kind: 'villus', showNutrientFlow: true });
        expect(withFlow).toContain('طريق لمفاوي (بلغمي): دسم');
        expect(withFlow).toContain('طريق دموي: سكريات + بروتين');

        const withoutFlow = renderVillus({ kind: 'villus', showNutrientFlow: false });
        expect(withoutFlow).not.toContain('طريق لمفاوي (بلغمي): دسم');
      });

      it('يدعم سمات التلوين (natural, vibrant, exam_print)', () => {
        const natural = renderVillus({ kind: 'villus', theme: 'natural' });
        const vibrant = renderVillus({ kind: 'villus', theme: 'vibrant' });
        const exam = renderVillus({ kind: 'villus', theme: 'exam_print' });

        expect(natural.startsWith('<svg')).toBe(true);
        expect(vibrant.startsWith('<svg')).toBe(true);
        expect(exam.startsWith('<svg')).toBe(true);
      });

      it('renderFigure يوجّه إلى villus بنجاح', () => {
        const svg = renderFigure({
          gen: 'biology',
          spec: { kind: 'villus', caption: 'بنية الزغابة المعوية' },
        });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg).toContain('بنية الزغابة المعوية');
      });
    });
  });

  describe('المشبك العصبي والنقل الكيميائي (synapse)', () => {
    describe('مخطّط Zod (synapseSpecSchema)', () => {
      it('يقبل مواصفة صحيحة بأبسط شكل', () => {
        const parsed = synapseSpecSchema.safeParse({ kind: 'synapse' });
        expect(parsed.success).toBe(true);
        if (parsed.success) {
          expect(parsed.data.kind).toBe('synapse');
        }
      });

      it('يقبل كافة الخيارات المتاحة', () => {
        const parsed = synapseSpecSchema.safeParse({
          kind: 'synapse',
          labelsMode: 'numbered',
          theme: 'vibrant',
          focus: 'vesicles',
          showImpulseDirection: true,
          caption: 'مخطط المشبك العصبي',
        });
        expect(parsed.success).toBe(true);
      });

      it('يرفض focus غير معروف', () => {
        expect(synapseSpecSchema.safeParse({ kind: 'synapse', focus: 'unknown_bio' }).success).toBe(false);
      });

      it('يرفض حقولاً إضافية غير معلنة (.strict)', () => {
        expect(synapseSpecSchema.safeParse({ kind: 'synapse', invalidField: true }).success).toBe(false);
      });
    });

    describe('تصيير المشبك العصبي (renderSynapse)', () => {
      it('يولّد SVG صالحاً ومكتملاً', () => {
        const svg = renderSynapse({ kind: 'synapse' });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg.endsWith('</svg>')).toBe(true);
        expect(svg).toContain('class="lesson-figure"');
      });

      it('يحتوي على تدرجات التجسيم للحويصلات والميتوكندريا', () => {
        const svg = renderSynapse({ kind: 'synapse' });
        expect(svg).toContain('vesicleGrad');
        expect(svg).toContain('mitoGrad');
      });

      it('يحتوي على جميع التأشيرات السبع في وضع الشرح الكامل full', () => {
        const svg = renderSynapse({ kind: 'synapse', labelsMode: 'full' });
        expect(svg).toContain('زر انتهائي وغشاء قبل مشبكي');
        expect(svg).toContain('Presynaptic Terminal &amp; Membrane');
        expect(svg).toContain('حويصلات مشبكية');
        expect(svg).toContain('Synaptic Vesicles');
        expect(svg).toContain('وسيط كيميائي عصبي (أسيتيل كولين)');
        expect(svg).toContain('Neurotransmitter (ACh)');
        expect(svg).toContain('شق مشبكي');
        expect(svg).toContain('Synaptic Cleft');
        expect(svg).toContain('غشاء بعد مشبكي');
        expect(svg).toContain('Postsynaptic Membrane');
        expect(svg).toContain('مستقبلات غشائية نوعية');
        expect(svg).toContain('Specific Receptors');
        expect(svg).toContain('ميتوكندريا (توليد الطاقة)');
        expect(svg).toContain('Mitochondria');
      });

      it('يحتوي على دوائر مرقمة 1..7 في وضع الامتحانات numbered', () => {
        const svg = renderSynapse({ kind: 'synapse', labelsMode: 'numbered' });
        expect(svg).toContain('مؤشر مرقم [1]');
        expect(svg).toContain('مؤشر مرقم [7]');
        expect(svg).not.toContain('Synaptic Vesicles');
        expect(svg).not.toContain('Postsynaptic Membrane');
      });

      it('لا يحتوي على تأشيرات في الوضع الصامت none', () => {
        const svg = renderSynapse({ kind: 'synapse', labelsMode: 'none' });
        expect(svg).not.toContain('class="bio-callouts"');
        expect(svg).not.toContain('مؤشر مرقم');
      });

      it('يتحكم بسهم اتجاه السيالة العصبية showImpulseDirection', () => {
        const withImpulse = renderSynapse({ kind: 'synapse', showImpulseDirection: true });
        expect(withImpulse).toContain('اتجاه السيالة العصبية ↓');

        const withoutImpulse = renderSynapse({ kind: 'synapse', showImpulseDirection: false });
        expect(withoutImpulse).not.toContain('اتجاه السيالة العصبية ↓');
      });

      it('يدعم سمات التلوين (natural, vibrant, exam_print)', () => {
        const natural = renderSynapse({ kind: 'synapse', theme: 'natural' });
        const vibrant = renderSynapse({ kind: 'synapse', theme: 'vibrant' });
        const exam = renderSynapse({ kind: 'synapse', theme: 'exam_print' });

        expect(natural.startsWith('<svg')).toBe(true);
        expect(vibrant.startsWith('<svg')).toBe(true);
        expect(exam.startsWith('<svg')).toBe(true);
      });

      it('renderFigure يوجّه إلى synapse بنجاح', () => {
        const svg = renderFigure({
          gen: 'biology',
          spec: { kind: 'synapse', caption: 'بنية المشبك العصبي' },
        });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg).toContain('بنية المشبك العصبي');
      });
    });
  });

  // ============================================================
  // الجهاز الهضمي العام (digestive_system)
  // ============================================================
  describe('الجهاز الهضمي العام (digestive_system)', () => {
    describe('مخطّط Zod (digestiveSpecSchema)', () => {
      it('يقبل مواصفة صحيحة بأبسط شكل', () => {
        const parsed = digestiveSpecSchema.safeParse({ kind: 'digestive_system' });
        expect(parsed.success).toBe(true);
      });

      it('يقبل خيارات التركيز والسمة ومسار الهضم والغدد', () => {
        const parsed = digestiveSpecSchema.safeParse({
          kind: 'digestive_system',
          labelsMode: 'numbered',
          theme: 'vibrant',
          focus: 'stomach',
          showDigestivePath: true,
          showGlands: true,
          caption: 'الجهاز الهضمي وملحقاته',
        });
        expect(parsed.success).toBe(true);
      });

      it('يرفض focus غير معروف', () => {
        const parsed = digestiveSpecSchema.safeParse({
          kind: 'digestive_system',
          focus: 'invalid_focus' as any,
        });
        expect(parsed.success).toBe(false);
      });

      it('يرفض حقولاً إضافية غير معلنة (.strict)', () => {
        const parsed = digestiveSpecSchema.safeParse({
          kind: 'digestive_system',
          unexpectedProp: 123,
        });
        expect(parsed.success).toBe(false);
      });
    });

    describe('توليد SVG والتجسيم ثلاثي الأبعاد (renderDigestiveSystem)', () => {
      it('يولّد SVG متكامل مع الفلاتر والتدرجات وخيال الجسم', () => {
        const svg = renderDigestiveSystem({ kind: 'digestive_system' });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg).toContain('viewBox="0 0 960 560"');
        expect(svg).toContain('<defs>');
        expect(svg).toContain('esophGrad-');
        expect(svg).toContain('stomachGrad-');
        expect(svg).toContain('liverGrad-');
        expect(svg).toContain('smallIntGrad-');
        expect(svg).toContain('largeIntGrad-');
      });

      it('يحتوي على كافة بطاقات الشرح الـ 8 في الوضع الكامل full', () => {
        const svg = renderDigestiveSystem({ kind: 'digestive_system', labelsMode: 'full' });
        expect(svg).toContain('التجويف الفموي والغدد اللعابية');
        expect(svg).toContain('Oral Cavity &amp; Salivary Glands');
        expect(svg).toContain('المريء');
        expect(svg).toContain('Esophagus');
        expect(svg).toContain('المعدة');
        expect(svg).toContain('Stomach');
        expect(svg).toContain('الكبد والحويصل الصفراوي');
        expect(svg).toContain('Liver &amp; Gallbladder');
        expect(svg).toContain('البنكرياس (المعثكلة)');
        expect(svg).toContain('Pancreas');
        expect(svg).toContain('المعي الدقيق (تلافيف الامتصاص)');
        expect(svg).toContain('Small Intestine');
        expect(svg).toContain('المعي الغليظ (القولون)');
        expect(svg).toContain('Large Intestine / Colon');
        expect(svg).toContain('المستقيم وفتحة الشرج');
        expect(svg).toContain('Rectum &amp; Anus');
      });

      it('يحتوي على دوائر مرقمة 1..8 في وضع الامتحانات numbered', () => {
        const svg = renderDigestiveSystem({ kind: 'digestive_system', labelsMode: 'numbered' });
        expect(svg).toContain('مؤشر مرقم [1]');
        expect(svg).toContain('مؤشر مرقم [8]');
        expect(svg).not.toContain('Oral Cavity &amp; Salivary Glands');
        expect(svg).not.toContain('Small Intestine');
      });

      it('لا يحتوي على تأشيرات في الوضع الصامت none', () => {
        const svg = renderDigestiveSystem({ kind: 'digestive_system', labelsMode: 'none' });
        expect(svg).not.toContain('class="bio-callouts"');
        expect(svg).not.toContain('مؤشر مرقم');
      });

      it('يتحكم بمسار الهضم الحركي showDigestivePath', () => {
        const withPath = renderDigestiveSystem({ kind: 'digestive_system', showDigestivePath: true });
        expect(withPath).toContain('class="digestive-flow"');

        const withoutPath = renderDigestiveSystem({ kind: 'digestive_system', showDigestivePath: false });
        expect(withoutPath).not.toContain('class="digestive-flow"');
      });

      it('يتحكم بالغدد اللعابية الملحقة showGlands', () => {
        const withGlands = renderDigestiveSystem({ kind: 'digestive_system', showGlands: true });
        expect(withGlands).toContain('الغدد اللعابية الثلاث');

        const withoutGlands = renderDigestiveSystem({ kind: 'digestive_system', showGlands: false });
        expect(withoutGlands).not.toContain('الغدد اللعابية الثلاث');
      });

      it('يدعم سمات التلوين (natural, vibrant, exam_print)', () => {
        const natural = renderDigestiveSystem({ kind: 'digestive_system', theme: 'natural' });
        const vibrant = renderDigestiveSystem({ kind: 'digestive_system', theme: 'vibrant' });
        const exam = renderDigestiveSystem({ kind: 'digestive_system', theme: 'exam_print' });

        expect(natural.startsWith('<svg')).toBe(true);
        expect(vibrant.startsWith('<svg')).toBe(true);
        expect(exam.startsWith('<svg')).toBe(true);
      });

      it('renderFigure يوجّه إلى digestive_system بنجاح', () => {
        const svg = renderFigure({
          gen: 'biology',
          spec: { kind: 'digestive_system', caption: 'الجهاز الهضمي' },
        });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg).toContain('الجهاز الهضمي');
      });
    });
  });

  // ============================================================
  // الجهاز البولي وتصفية الدم (urinary_system)
  // ============================================================
  describe('الجهاز البولي والإطراح (urinary_system)', () => {
    describe('مخطّط Zod (urinarySpecSchema)', () => {
      it('يقبل مواصفة صحيحة بأبسط شكل', () => {
        const parsed = urinarySpecSchema.safeParse({ kind: 'urinary_system' });
        expect(parsed.success).toBe(true);
      });

      it('يقبل كافة خيارات التركيز والسمة ومقطع الكلية والتدفق', () => {
        const parsed = urinarySpecSchema.safeParse({
          kind: 'urinary_system',
          labelsMode: 'numbered',
          theme: 'exam_print',
          focus: 'kidneys',
          showKidneySection: true,
          showUrineFlow: true,
          caption: 'الجهاز البولي وتصفية الدم',
        });
        expect(parsed.success).toBe(true);
      });

      it('يرفض focus غير معروف', () => {
        const parsed = urinarySpecSchema.safeParse({
          kind: 'urinary_system',
          focus: 'invalid_part' as any,
        });
        expect(parsed.success).toBe(false);
      });
    });

    describe('توليد SVG والتجسيم ثلاثي الأبعاد (renderUrinarySystem)', () => {
      it('يولّد SVG متكامل مع الكليتين والأوعية والمثانة', () => {
        const svg = renderUrinarySystem({ kind: 'urinary_system' });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg).toContain('viewBox="0 0 960 540"');
        expect(svg).toContain('kidneyGrad-');
        expect(svg).toContain('aortaGrad-');
        expect(svg).toContain('venaCavaGrad-');
        expect(svg).toContain('ureterGrad-');
        expect(svg).toContain('bladderGrad-');
      });

      it('يحتوي على كافة بطاقات الشرح الـ 7 في الوضع الكامل full', () => {
        const svg = renderUrinarySystem({ kind: 'urinary_system', labelsMode: 'full' });
        expect(svg).toContain('الكلية (مقطع يظهر القشرة واللب)');
        expect(svg).toContain('Kidney (Cortex &amp; Medulla)');
        expect(svg).toContain('الغدة الكظرية');
        expect(svg).toContain('Adrenal Gland');
        expect(svg).toContain('الشريان والوريد الكلويان');
        expect(svg).toContain('Renal Artery &amp; Vein');
        expect(svg).toContain('الحالب');
        expect(svg).toContain('Ureter');
        expect(svg).toContain('المثانة البولية');
        expect(svg).toContain('Urinary Bladder');
        expect(svg).toContain('الإحليل ومجرى البول');
        expect(svg).toContain('Urethra');
        expect(svg).toContain('الحويضة (مقر تجمع البول)');
        expect(svg).toContain('Renal Pelvis');
      });

      it('يحتوي على دوائر مرقمة 1..7 في وضع الامتحانات numbered', () => {
        const svg = renderUrinarySystem({ kind: 'urinary_system', labelsMode: 'numbered' });
        expect(svg).toContain('مؤشر مرقم [1]');
        expect(svg).toContain('مؤشر مرقم [7]');
        expect(svg).not.toContain('Renal Artery &amp; Vein');
        expect(svg).not.toContain('Urinary Bladder');
      });

      it('لا يحتوي على تأشيرات في الوضع الصامت none', () => {
        const svg = renderUrinarySystem({ kind: 'urinary_system', labelsMode: 'none' });
        expect(svg).not.toContain('class="bio-callouts"');
        expect(svg).not.toContain('مؤشر مرقم');
      });

      it('يتحكم بمقطع الكلية الداخلي showKidneySection', () => {
        const withSection = renderUrinarySystem({ kind: 'urinary_system', showKidneySection: true });
        expect(withSection).toContain('medulla-pyramids');

        const withoutSection = renderUrinarySystem({ kind: 'urinary_system', showKidneySection: false });
        expect(withoutSection).not.toContain('medulla-pyramids');
      });

      it('يتحكم بتدفق البول showUrineFlow', () => {
        const withFlow = renderUrinarySystem({ kind: 'urinary_system', showUrineFlow: true });
        expect(withFlow).toContain('class="urine-flow"');

        const withoutFlow = renderUrinarySystem({ kind: 'urinary_system', showUrineFlow: false });
        expect(withoutFlow).not.toContain('class="urine-flow"');
      });

      it('renderFigure يوجّه إلى urinary_system بنجاح', () => {
        const svg = renderFigure({
          gen: 'biology',
          spec: { kind: 'urinary_system', caption: 'الجهاز البولي' },
        });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg).toContain('الجهاز البولي');
      });
    });
  });

  // ============================================================
  // الجهاز الدوراني والقلب (circulatory_system)
  // ============================================================
  describe('الجهاز الدوراني والقلب (circulatory_system)', () => {
    describe('مخطّط Zod (circulatorySpecSchema)', () => {
      it('يقبل مواصفة صحيحة بأبسط شكل', () => {
        const parsed = circulatorySpecSchema.safeParse({ kind: 'circulatory_system' });
        expect(parsed.success).toBe(true);
      });

      it('يقبل خيارات التركيز والدورتين الدمويتين', () => {
        const parsed = circulatorySpecSchema.safeParse({
          kind: 'circulatory_system',
          labelsMode: 'full',
          theme: 'vibrant',
          focus: 'heart',
          showCirculation: true,
          caption: 'مقطع القلب وتجاويفه الأربعة',
        });
        expect(parsed.success).toBe(true);
      });

      it('يرفض focus غير معروف', () => {
        const parsed = circulatorySpecSchema.safeParse({
          kind: 'circulatory_system',
          focus: 'invalid_chamber' as any,
        });
        expect(parsed.success).toBe(false);
      });
    });

    describe('توليد SVG والتجسيم ثلاثي الأبعاد (renderCirculatorySystem)', () => {
      it('يولّد SVG للقلب بتجاويفه الأربعة والأوعية الكبرى', () => {
        const svg = renderCirculatorySystem({ kind: 'circulatory_system' });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg).toContain('viewBox="0 0 960 540"');
        expect(svg).toContain('aortaGrad-');
        expect(svg).toContain('pulmGrad-');
        expect(svg).toContain('leftVentGrad-');
        expect(svg).toContain('rightVentGrad-');
      });

      it('يحتوي على كافة بطاقات الشرح الـ 8 في الوضع الكامل full', () => {
        const svg = renderCirculatorySystem({ kind: 'circulatory_system', labelsMode: 'full' });
        expect(svg).toContain('الشريان الأبهر (الأورطي)');
        expect(svg).toContain('Aorta');
        expect(svg).toContain('الشريان الرئوي');
        expect(svg).toContain('Pulmonary Artery');
        expect(svg).toContain('الوريد الأجوف العلوي');
        expect(svg).toContain('Superior Vena Cava');
        expect(svg).toContain('الأذين الأيمن');
        expect(svg).toContain('Right Atrium');
        expect(svg).toContain('البطين الأيمن');
        expect(svg).toContain('Right Ventricle');
        expect(svg).toContain('البطين الأيسر (جدار عضلي سميك)');
        expect(svg).toContain('Left Ventricle');
        expect(svg).toContain('الأذين الأيسر والأوردة الرئوية');
        expect(svg).toContain('Left Atrium &amp; Pulmonary Veins');
        expect(svg).toContain('الصمامات القلبية والحاجز');
        expect(svg).toContain('Heart Valves &amp; Septum');
      });

      it('يحتوي على دوائر مرقمة 1..8 في وضع الامتحانات numbered', () => {
        const svg = renderCirculatorySystem({ kind: 'circulatory_system', labelsMode: 'numbered' });
        expect(svg).toContain('مؤشر مرقم [1]');
        expect(svg).toContain('مؤشر مرقم [8]');
        expect(svg).not.toContain('Pulmonary Artery');
        expect(svg).not.toContain('Superior Vena Cava');
      });

      it('لا يحتوي على تأشيرات في الوضع الصامت none', () => {
        const svg = renderCirculatorySystem({ kind: 'circulatory_system', labelsMode: 'none' });
        expect(svg).not.toContain('class="bio-callouts"');
        expect(svg).not.toContain('مؤشر مرقم');
      });

      it('يتحكم بمسار الدورة الدموية showCirculation', () => {
        const withCirc = renderCirculatorySystem({ kind: 'circulatory_system', showCirculation: true });
        expect(withCirc).toContain('class="circulation-loops"');

        const withoutCirc = renderCirculatorySystem({ kind: 'circulatory_system', showCirculation: false });
        expect(withoutCirc).not.toContain('class="circulation-loops"');
      });

      it('renderFigure يوجّه إلى circulatory_system بنجاح', () => {
        const svg = renderFigure({
          gen: 'biology',
          spec: { kind: 'circulatory_system', caption: 'القلب والأوعية الدموية' },
        });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg).toContain('القلب والأوعية الدموية');
      });
    });
  });

  // ============================================================
  // الهيكل العظمي والمفاصل (skeletal_system)
  // ============================================================
  describe('الهيكل العظمي العام والمفاصل (skeletal_system)', () => {
    describe('مخطّط Zod (skeletalSpecSchema)', () => {
      it('يقبل مواصفة صحيحة بأبسط شكل', () => {
        const parsed = skeletalSpecSchema.safeParse({ kind: 'skeletal_system' });
        expect(parsed.success).toBe(true);
      });

      it('يقبل خيارات التركيز والمفاصل الحركية', () => {
        const parsed = skeletalSpecSchema.safeParse({
          kind: 'skeletal_system',
          labelsMode: 'numbered',
          theme: 'natural',
          focus: 'skull',
          showJoints: true,
          caption: 'الهيكل العظمي للإنسان',
        });
        expect(parsed.success).toBe(true);
      });

      it('يرفض focus غير معروف', () => {
        const parsed = skeletalSpecSchema.safeParse({
          kind: 'skeletal_system',
          focus: 'invalid_bone' as any,
        });
        expect(parsed.success).toBe(false);
      });
    });

    describe('توليد SVG والتجسيم ثلاثي الأبعاد (renderSkeletalSystem)', () => {
      it('يولّد SVG للهيكل العظمي كاملاً مع العظام والمفاصل', () => {
        const svg = renderSkeletalSystem({ kind: 'skeletal_system' });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg).toContain('viewBox="0 0 960 560"');
        expect(svg).toContain('boneGrad-');
      });

      it('يحتوي على كافة بطاقات الشرح الـ 8 في الوضع الكامل full', () => {
        const svg = renderSkeletalSystem({ kind: 'skeletal_system', labelsMode: 'full' });
        expect(svg).toContain('الجمجمة والفك السفلي');
        expect(svg).toContain('Skull &amp; Mandible');
        expect(svg).toContain('القفص الصدري وعظم القص');
        expect(svg).toContain('Rib Cage &amp; Sternum');
        expect(svg).toContain('العمود الفقري');
        expect(svg).toContain('Vertebral Column');
        expect(svg).toContain('عظام الطرف العلوي (العضد والساعد)');
        expect(svg).toContain('Upper Limb (Humerus &amp; Forearm)');
        expect(svg).toContain('عظام الحوض');
        expect(svg).toContain('Pelvis');
        expect(svg).toContain('عظم الفخذ');
        expect(svg).toContain('Femur');
        expect(svg).toContain('مفصل الركبة والرضفة');
        expect(svg).toContain('Knee Joint &amp; Patella');
        expect(svg).toContain('عظام الساق (القصبة والشظية)');
        expect(svg).toContain('Lower Leg (Tibia &amp; Fibula)');
      });

      it('يحتوي على دوائر مرقمة 1..8 في وضع الامتحانات numbered', () => {
        const svg = renderSkeletalSystem({ kind: 'skeletal_system', labelsMode: 'numbered' });
        expect(svg).toContain('مؤشر مرقم [1]');
        expect(svg).toContain('مؤشر مرقم [8]');
        expect(svg).not.toContain('Skull &amp; Mandible');
        expect(svg).not.toContain('Vertebral Column');
      });

      it('لا يحتوي على تأشيرات في الوضع الصامت none', () => {
        const svg = renderSkeletalSystem({ kind: 'skeletal_system', labelsMode: 'none' });
        expect(svg).not.toContain('class="bio-callouts"');
        expect(svg).not.toContain('مؤشر مرقم');
      });

      it('يتحكم بنقاط المفاصل الحركية المضيئة showJoints', () => {
        const withJoints = renderSkeletalSystem({ kind: 'skeletal_system', showJoints: true });
        expect(withJoints).toContain('class="skeletal-joints"');

        const withoutJoints = renderSkeletalSystem({ kind: 'skeletal_system', showJoints: false });
        expect(withoutJoints).not.toContain('class="skeletal-joints"');
      });

      it('renderFigure يوجّه إلى skeletal_system بنجاح', () => {
        const svg = renderFigure({
          gen: 'biology',
          spec: { kind: 'skeletal_system', caption: 'الهيكل العظمي والمفاصل' },
        });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg).toContain('الهيكل العظمي والمفاصل');
      });
    });
  });

});
