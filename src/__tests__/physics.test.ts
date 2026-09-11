// ============================================================
// اختبارات مولّد مادة العلوم الفيزيائية والتكنولوجيا — averroes-figures
// ============================================================
// يغطي:
// 1. الكهروستاتيك والتكهرب (electrostatics)
// 2. التحريض الكهرومغناطيسي (electromagnetic_induction)
// 3. راسم الاهتزاز المهبطي (oscilloscope)
// 4. الأمن الكهربائي (electrical_safety)
// 5. الدارة الكهربائية المجسمة 3D (circuit_3d)
// والتكامل مع renderFigure وأوضاع التأشيرات (full, numbered, none)
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  renderFigure,
  renderPhysics,
  renderElectrostatics,
  renderInduction,
  renderOscilloscope,
  renderElectricalSafety,
  renderCircuit3D,
  physicsSpecSchema,
  electrostaticsSpecSchema,
  inductionSpecSchema,
  oscilloscopeSpecSchema,
  electricalSafetySpecSchema,
  circuit3dSpecSchema,
  FIGURE_GENS,
} from '../index.js';

describe('مولّد العلوم الفيزيائية والتكنولوجيا (Physics)', () => {
  it('FIGURE_GENS يحوي physics', () => {
    expect(FIGURE_GENS).toContain('physics');
  });

  it('renderPhysics يرجع نصاً فارغاً عند تمرير مواصفات فاسدة (مبدأ لا يرمي أبداً)', () => {
    // @ts-expect-error اختبار مدخلات فاسدة
    expect(renderPhysics({ kind: 'unknown_kind' })).toBe('');
  });

  // ============================================================
  // 1. الكهروستاتيك وظواهر التكهرب (electrostatics)
  // ============================================================
  describe('الكهروستاتيك والتكهرب (electrostatics)', () => {
    describe('مخطط Zod (electrostaticsSpecSchema)', () => {
      it('يقبل مواصفة سليمة افتراضية', () => {
        const parsed = electrostaticsSpecSchema.safeParse({ kind: 'electrostatics' });
        expect(parsed.success).toBe(true);
      });

      it('يقبل كافة الخيارات المخصصة', () => {
        const parsed = electrostaticsSpecSchema.safeParse({
          kind: 'electrostatics',
          apparatus: 'electroscope',
          chargeType: 'positive',
          method: 'induction',
          showCharges: true,
          labelsMode: 'numbered',
          theme: 'vibrant',
          caption: 'تجربة التكهرب بالتأثير',
        });
        expect(parsed.success).toBe(true);
      });

      it('يرفض apparatus غير معتمد', () => {
        expect(electrostaticsSpecSchema.safeParse({ kind: 'electrostatics', apparatus: 'invalid' }).success).toBe(false);
      });

      it('يرفض حقولاً إضافية غير معلنة', () => {
        expect(electrostaticsSpecSchema.safeParse({ kind: 'electrostatics', extra: true }).success).toBe(false);
      });
    });

    describe('تصيير الكهروستاتيك', () => {
      it('يولّد SVG صالحاً ومكتملاً', () => {
        const svg = renderElectrostatics({ kind: 'electrostatics' });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg.endsWith('</svg>')).toBe(true);
        expect(svg).toContain('class="lesson-figure"');
      });

      it('يحتوي على عناصر الكشاف والنواس في وضع both', () => {
        const svg = renderElectrostatics({ kind: 'electrostatics', apparatus: 'both' });
        expect(svg).toContain('scope-glass');
        expect(svg).toContain('scope-leaves');
        expect(svg).toContain('pendulum-stand');
        expect(svg).toContain('pendulum-string-ball');
      });

      it('يدعم وضع التأشيرات full مع بطاقات الشرح الثنائية', () => {
        const svg = renderElectrostatics({ kind: 'electrostatics', labelsMode: 'full' });
        expect(svg).toContain('قرص معدني');
        expect(svg).toContain('سدادة عازلة');
        expect(svg).toContain('ورقتان معدنيتان');
        expect(svg).toContain('ناقوس زجاجي');
      });

      it('يدعم وضع التأشيرات numbered مع دوائر الترقيم', () => {
        const svg = renderElectrostatics({ kind: 'electrostatics', labelsMode: 'numbered' });
        expect(svg).toContain('مؤشر مرقم [1]');
        expect(svg).toContain('مؤشر مرقم [2]');
        expect(svg).toContain('مؤشر مرقم [5]');
      });

      it('يدعم وضع التأشيرات none بدون بطاقات تأشير', () => {
        const svg = renderElectrostatics({ kind: 'electrostatics', labelsMode: 'none' });
        expect(svg).not.toContain('class="phy-callouts"');
      });

      it('يدعم الشحنة الموجبة (قضيب زجاجي)', () => {
        const svg = renderElectrostatics({ kind: 'electrostatics', chargeType: 'positive', labelsMode: 'full' });
        expect(svg).toContain('قضيب زجاجي مشحون');
      });

      it('يدعم إخفاء الشحنات الكهربائية showCharges: false', () => {
        const svg = renderElectrostatics({ kind: 'electrostatics', showCharges: false });
        expect(svg).not.toContain('شحنات القرص العلوي');
        expect(svg).not.toContain('شحنات الورقتين');
      });

      it('يدعم سمة الطباعة exam_print', () => {
        const svg = renderElectrostatics({ kind: 'electrostatics', theme: 'exam_print' });
        expect(svg).toBeDefined();
        expect(svg.startsWith('<svg')).toBe(true);
      });
    });
  });

  // ============================================================
  // 2. التحريض الكهرومغناطيسي (electromagnetic_induction)
  // ============================================================
  describe('التحريض الكهرومغناطيسي (electromagnetic_induction)', () => {
    describe('مخطط Zod (inductionSpecSchema)', () => {
      it('يقبل مواصفة سليمة افتراضية', () => {
        const parsed = inductionSpecSchema.safeParse({ kind: 'electromagnetic_induction' });
        expect(parsed.success).toBe(true);
      });

      it('يقبل حركة الابتعاد receding ومختلف الخيارات', () => {
        const parsed = inductionSpecSchema.safeParse({
          kind: 'electromagnetic_induction',
          magnetMovement: 'receding',
          showFieldLines: false,
          showCurrentFlow: true,
          labelsMode: 'numbered',
        });
        expect(parsed.success).toBe(true);
      });

      it('يرفض حركة مغناطيس غير معروفة', () => {
        expect(inductionSpecSchema.safeParse({ kind: 'electromagnetic_induction', magnetMovement: 'flying' }).success).toBe(false);
      });
    });

    describe('تصيير التحريض الكهرومغناطيسي', () => {
      it('يولّد SVG صالحاً', () => {
        const svg = renderInduction({ kind: 'electromagnetic_induction' });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg.endsWith('</svg>')).toBe(true);
      });

      it('يحتوي على قطبي المغناطيس N و S والوشيعة والجلفانومتر والصمامين', () => {
        const svg = renderInduction({ kind: 'electromagnetic_induction' });
        expect(svg).toContain('bar-magnet');
        expect(svg).toContain('solenoid-coil');
        expect(svg).toContain('galvanometer');
        expect(svg).toContain('anti-parallel-leds');
        expect(svg).toContain('>N<');
        expect(svg).toContain('>S<');
      });

      it('يدعم وضع التأشيرات full مع مصطلحات المنهاج', () => {
        const svg = renderInduction({ kind: 'electromagnetic_induction', labelsMode: 'full' });
        expect(svg).toContain('مغناطيس دائم (المحرِّض)');
        expect(svg).toContain('وشيعة نحاسية (المتحرَّض)');
        expect(svg).toContain('جلفانومتر ذو صفر مركزي');
        expect(svg).toContain('خطوط الحقل المغناطيسي');
        expect(svg).toContain('صمامان ضوئيان متعاكسان');
      });

      it('يدعم وضع التأشيرات numbered', () => {
        const svg = renderInduction({ kind: 'electromagnetic_induction', labelsMode: 'numbered' });
        expect(svg).toContain('مؤشر مرقم [1]');
        expect(svg).toContain('مؤشر مرقم [3]');
      });

      it('يظهر خطوط الحقل المغناطيسي عند showFieldLines: true', () => {
        const svg = renderInduction({ kind: 'electromagnetic_induction', showFieldLines: true });
        expect(svg).toContain('magnetic-field-lines');
      });

      it('يخفي خطوط الحقل المغناطيسي عند showFieldLines: false', () => {
        const svg = renderInduction({ kind: 'electromagnetic_induction', showFieldLines: false });
        expect(svg).not.toContain('magnetic-field-lines');
      });

      it('يتفاعل مع حركة الابتعاد receding بتدوير مؤشر الجلفانومتر لليسار', () => {
        const svg = renderInduction({ kind: 'electromagnetic_induction', magnetMovement: 'receding' });
        expect(svg).toContain('rotate(-24');
      });
    });
  });

  // ============================================================
  // 3. راسم الاهتزاز المهبطي (oscilloscope)
  // ============================================================
  describe('راسم الاهتزاز المهبطي (oscilloscope)', () => {
    describe('مخطط Zod (oscilloscopeSpecSchema)', () => {
      it('يقبل مواصفة سليمة افتراضية', () => {
        const parsed = oscilloscopeSpecSchema.safeParse({ kind: 'oscilloscope' });
        expect(parsed.success).toBe(true);
      });

      it('يقبل إشارة مستمرة dc وتعيير مخصص للحساسية والمسح', () => {
        const parsed = oscilloscopeSpecSchema.safeParse({
          kind: 'oscilloscope',
          signalType: 'dc',
          verticalSensitivity: 5,
          timeBase: 10,
          showCalculations: true,
        });
        expect(parsed.success).toBe(true);
      });

      it('يرفض حساسية سالبة أو صفراً', () => {
        expect(oscilloscopeSpecSchema.safeParse({ kind: 'oscilloscope', verticalSensitivity: -2 }).success).toBe(false);
        expect(oscilloscopeSpecSchema.safeParse({ kind: 'oscilloscope', timeBase: 0 }).success).toBe(false);
      });
    });

    describe('تصيير راسم الاهتزاز المهبطي', () => {
      it('يولّد SVG صالحاً مع الشاشة والشبكة', () => {
        const svg = renderOscilloscope({ kind: 'oscilloscope' });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg.endsWith('</svg>')).toBe(true);
        expect(svg).toContain('crt-screen');
        expect(svg).toContain('crt-waveform');
      });

      it('يحتوي على أسهم قياس Umax و T في إشارة AC الجيبية', () => {
        const svg = renderOscilloscope({ kind: 'oscilloscope', signalType: 'ac_sine' });
        expect(svg).toContain('Umax = Y × Sv');
        expect(svg).toContain('T = X × Sh');
      });

      it('يعرض بطاقة الحسابات الرياضية وقوانين BEM', () => {
        const svg = renderOscilloscope({ kind: 'oscilloscope', verticalSensitivity: 2, timeBase: 5, showCalculations: true });
        expect(svg).toContain('calc-card');
        expect(svg).toContain('قوانين وحسابات التوتر المتناوب');
        expect(svg).toContain('Umax = 2.5 div × 2 V/div = 5 V');
        expect(svg).toContain('50 Hz');
      });

      it('يخفي بطاقة الحسابات عند showCalculations: false', () => {
        const svg = renderOscilloscope({ kind: 'oscilloscope', showCalculations: false });
        expect(svg).not.toContain('calc-card');
      });

      it('يدعم وضع التأشيرات full مع بيانات راسم الاهتزاز', () => {
        const svg = renderOscilloscope({ kind: 'oscilloscope', labelsMode: 'full' });
        expect(svg).toContain('شاشة راسم الاهتزاز');
        expect(svg).toContain('التوتر الأعظمي');
        expect(svg).toContain('الدور الزمني');
        expect(svg).toContain('الحساسية الشاقولية');
        expect(svg).toContain('المسح الزمني');
      });

      it('يدعم وضع التأشيرات numbered', () => {
        const svg = renderOscilloscope({ kind: 'oscilloscope', labelsMode: 'numbered' });
        expect(svg).toContain('مؤشر مرقم [1]');
        expect(svg).toContain('مؤشر مرقم [4]');
      });

      it('يدعم إشارة التيار المستمر dc', () => {
        const svg = renderOscilloscope({ kind: 'oscilloscope', signalType: 'dc' });
        expect(svg).toContain('تيار مستمر');
      });
    });
  });

  // ============================================================
  // 4. الأمن الكهربائي والشبكة المنزلية (electrical_safety)
  // ============================================================
  describe('الأمن الكهربائي (electrical_safety)', () => {
    describe('مخطط Zod (electricalSafetySpecSchema)', () => {
      it('يقبل مواصفة سليمة افتراضية', () => {
        const parsed = electricalSafetySpecSchema.safeParse({ kind: 'electrical_safety' });
        expect(parsed.success).toBe(true);
      });

      it('يقبل سيناريو الخطر danger مع إخفاء مسار التأريض', () => {
        const parsed = electricalSafetySpecSchema.safeParse({
          kind: 'electrical_safety',
          scenario: 'danger',
          showGroundPath: false,
          labelsMode: 'full',
        });
        expect(parsed.success).toBe(true);
      });

      it('يرفض سيناريو غير معرف', () => {
        expect(electricalSafetySpecSchema.safeParse({ kind: 'electrical_safety', scenario: 'fire' }).success).toBe(false);
      });
    });

    describe('تصيير الأمن الكهربائي', () => {
      it('يولّد SVG صالحاً', () => {
        const svg = renderElectricalSafety({ kind: 'electrical_safety' });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg.endsWith('</svg>')).toBe(true);
      });

      it('يحتوي على عناصر الحماية: القاطع التفاضلي، الفاصمة، القاطعة، الغسالة، وتد التأريض', () => {
        const svg = renderElectricalSafety({ kind: 'electrical_safety' });
        expect(svg).toContain('breaker-3d');
        expect(svg).toContain('fuse-and-switch');
        expect(svg).toContain('washing-machine');
        expect(svg).toContain('باطن الأرض');
      });

      it('يعرض تنبيه الحماية في سيناريو protected', () => {
        const svg = renderElectricalSafety({ kind: 'electrical_safety', scenario: 'protected' });
        expect(svg).toContain('محمي من الصعق');
        expect(svg).toContain('ground-protection-path');
      });

      it('يعرض تنبيه الخطر في سيناريو danger عند غياب التأريض', () => {
        const svg = renderElectricalSafety({ kind: 'electrical_safety', scenario: 'danger' });
        expect(svg).toContain('خطر الصعق الكهربائي');
        expect(svg).not.toContain('ground-protection-path');
      });

      it('يدعم وضع التأشيرات full مع بيانات المنهاج الرسمية', () => {
        const svg = renderElectricalSafety({ kind: 'electrical_safety', labelsMode: 'full' });
        expect(svg).toContain('سلك الطور');
        expect(svg).toContain('سلك الحيادي');
        expect(svg).toContain('القاطع التفاضلي');
        expect(svg).toContain('الفاصمة');
        expect(svg).toContain('القاطعة');
        expect(svg).toContain('سلك ومأخذ التأريض');
        expect(svg).toContain('هيكل معدني مؤرّض');
      });

      it('يدعم وضع التأشيرات numbered', () => {
        const svg = renderElectricalSafety({ kind: 'electrical_safety', labelsMode: 'numbered' });
        expect(svg).toContain('مؤشر مرقم [1]');
        expect(svg).toContain('مؤشر مرقم [6]');
      });
    });
  });

  // ============================================================
  // 5. الدارة الكهربائية المجسمة 3D (circuit_3d)
  // ============================================================
  describe('الدارة الكهربائية المجسمة (circuit_3d)', () => {
    describe('مخطط Zod (circuit3dSpecSchema)', () => {
      it('يقبل مواصفة سليمة افتراضية', () => {
        const parsed = circuit3dSpecSchema.safeParse({ kind: 'circuit_3d' });
        expect(parsed.success).toBe(true);
      });

      it('يقبل حالة القاطعة المفتوحة open ومختلف الخيارات', () => {
        const parsed = circuit3dSpecSchema.safeParse({
          kind: 'circuit_3d',
          switchState: 'open',
          showCurrentFlow: false,
          labelsMode: 'numbered',
        });
        expect(parsed.success).toBe(true);
      });

      it('يرفض switchState غير صحيح', () => {
        expect(circuit3dSpecSchema.safeParse({ kind: 'circuit_3d', switchState: 'semi' }).success).toBe(false);
      });
    });

    describe('تصيير الدارة 3D', () => {
      it('يولّد SVG صالحاً ومكتملاً', () => {
        const svg = renderCircuit3D({ kind: 'circuit_3d' });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg.endsWith('</svg>')).toBe(true);
      });

      it('يحتوي على البطارية المسطحة 4.5V، قاطعة السكين، المصباح، المشابك', () => {
        const svg = renderCircuit3D({ kind: 'circuit_3d' });
        expect(svg).toContain('battery-4v5');
        expect(svg).toContain('knife-switch');
        expect(svg).toContain('light-bulb');
        expect(svg).toContain('wires-and-clips');
        expect(svg).toContain('4.5V');
      });

      it('يضيء المصباح وتظهر أسهم التيار عند غلق القاطعة closed', () => {
        const svg = renderCircuit3D({ kind: 'circuit_3d', switchState: 'closed', showCurrentFlow: true });
        expect(svg).toContain('current-flow-arrows');
        expect(svg).toContain('جهة التيار الاصطلاحي');
      });

      it('ينطفئ المصباح وتختفي أسهم التيار عند فتح القاطعة open', () => {
        const svg = renderCircuit3D({ kind: 'circuit_3d', switchState: 'open' });
        expect(svg).not.toContain('current-flow-arrows');
      });

      it('يدعم وضع التأشيرات full مع تسميات واقعية', () => {
        const svg = renderCircuit3D({ kind: 'circuit_3d', labelsMode: 'full' });
        expect(svg).toContain('عمود كهربائي مسطح 4.5V');
        expect(svg).toContain('قاطعة سكين');
        expect(svg).toContain('مصباح توهج');
        expect(svg).toContain('أسلاك توصيل');
        expect(svg).toContain('سلك التنجستن');
      });

      it('يدعم وضع التأشيرات numbered', () => {
        const svg = renderCircuit3D({ kind: 'circuit_3d', labelsMode: 'numbered' });
        expect(svg).toContain('مؤشر مرقم [1]');
        expect(svg).toContain('مؤشر مرقم [5]');
      });
    });
  });

  // ============================================================
  // 6. التكامل العام مع renderFigure
  // ============================================================
  describe('التكامل مع renderFigure', () => {
    it('يصيّر electrostatics عبر renderFigure', () => {
      const svg = renderFigure({ gen: 'physics', spec: { kind: 'electrostatics' } });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('class="lesson-figure"');
    });

    it('يصيّر electromagnetic_induction عبر renderFigure', () => {
      const svg = renderFigure({ gen: 'physics', spec: { kind: 'electromagnetic_induction' } });
      expect(svg.startsWith('<svg')).toBe(true);
    });

    it('يصيّر oscilloscope عبر renderFigure', () => {
      const svg = renderFigure({ gen: 'physics', spec: { kind: 'oscilloscope' } });
      expect(svg.startsWith('<svg')).toBe(true);
    });

    it('يصيّر electrical_safety عبر renderFigure', () => {
      const svg = renderFigure({ gen: 'physics', spec: { kind: 'electrical_safety' } });
      expect(svg.startsWith('<svg')).toBe(true);
    });

    it('يصيّر circuit_3d عبر renderFigure', () => {
      const svg = renderFigure({ gen: 'physics', spec: { kind: 'circuit_3d' } });
      expect(svg.startsWith('<svg')).toBe(true);
    });

    it('يرجع نصاً فارغاً عند مواصفات فاسدة', () => {
      const svg = renderFigure({ gen: 'physics', spec: { kind: 'nonexistent' } });
      expect(svg).toBe('');
    });
  });
});
