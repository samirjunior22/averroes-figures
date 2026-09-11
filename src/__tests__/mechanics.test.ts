import { describe, it, expect } from 'vitest';
import {
  renderMechanics,
  renderForces,
  renderFigure,
  mechanicsSpecSchema,
  twoForcesEquilibriumSpecSchema,
  threeForcesEquilibriumSpecSchema,
  archimedesSpecSchema,
  dynamometerWeightSpecSchema,
  inclinedPlaneMotionSpecSchema,
} from '../index.js';

describe('مولّد الظواهر الميكانيكية — Mechanics Generator', () => {
  // ============================================================
  // 1. توازن جسم صلب خاضع لقوتين (two_forces_equilibrium)
  // ============================================================
  describe('two_forces_equilibrium — توازن جسم صلب خاضع لقوتين', () => {
    it('يُنتج SVG لجسم معلق بربيعة مع القيم الافتراضية', () => {
      const svg = renderMechanics({
        kind: 'two_forces_equilibrium',
      });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('class="lesson-figure"');
      expect(svg).toContain('3N');
      expect(svg).toContain('P');
      expect(svg).toContain('T');
      expect(svg).toContain('شرطا توازن جسم صلب');
    });

    it('يدعم تعليق بخيط أو استقرار على طاولة وأشكال أجسام مختلفة', () => {
      const threadSvg = renderMechanics({
        kind: 'two_forces_equilibrium',
        setupType: 'suspended_thread',
        bodyShape: 'box',
        forceValue: 5,
      });
      expect(threadSvg).toContain('5 N');
      expect(threadSvg).toContain('(S)');

      const tableSvg = renderMechanics({
        kind: 'two_forces_equilibrium',
        setupType: 'table_surface',
        bodyShape: 'sphere',
        forceValue: 8,
      });
      expect(tableSvg).toContain('8 N');
      expect(tableSvg).toContain('R');
    });

    it('يدعم وضع الترقيم للامتحانات بدون بطاقات الشرح', () => {
      const svg = renderMechanics({
        kind: 'two_forces_equilibrium',
        labelsMode: 'numbered',
      });
      expect(svg).toContain('text-anchor="middle" font-family="sans-serif">1</text>');
      expect(svg).toContain('text-anchor="middle" font-family="sans-serif">6</text>');
      expect(svg).not.toContain('Laboratory Stand');
    });

    it('يدعم وضع الرسم الصامت none', () => {
      const svg = renderMechanics({
        kind: 'two_forces_equilibrium',
        labelsMode: 'none',
      });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).not.toContain('Laboratory Stand');
    });
  });

  // ============================================================
  // 2. توازن جسم صلب خاضع لـ 3 قوى غير متوازية (three_forces_equilibrium)
  // ============================================================
  describe('three_forces_equilibrium — توازن جسم خاضع لـ 3 قوى', () => {
    it('يُنتج SVG مع ربيعتين وثقل معلق ومثلث القوى المغلق', () => {
      const svg = renderMechanics({
        kind: 'three_forces_equilibrium',
        f1: 3,
        f2: 4,
        f3: 5,
        angle1: 35,
        angle2: 145,
      });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('D&#x2081;');
      expect(svg).toContain('D&#x2082;');
      expect(svg).toContain('D&#x2083;');
      expect(svg).toContain('F₁');
      expect(svg).toContain('F₂');
      expect(svg).toContain('F₃');
      expect(svg).toContain('مضلع القوى المغلق');
    });

    it('يمكن إخفاء مضلع القوى أو حوامل القوى', () => {
      const svg = renderMechanics({
        kind: 'three_forces_equilibrium',
        showPolygon: false,
        showLinesOfAction: false,
      });
      expect(svg).not.toContain('مضلع القوى المغلق');
    });

    it('يدعم وضع الترقيم للامتحانات 1..6', () => {
      const svg = renderMechanics({
        kind: 'three_forces_equilibrium',
        labelsMode: 'numbered',
      });
      expect(svg).toContain('>1</text>');
      expect(svg).toContain('>6</text>');
    });
  });

  // ============================================================
  // 3. دافعة أرخميدس في السوائل (archimedes)
  // ============================================================
  describe('archimedes — دافعة أرخميدس في السوائل', () => {
    it('يُنتج مقارنة مخبرية كاملة بين الهواء والسائل مع بيشر الإزاحة', () => {
      const svg = renderMechanics({
        kind: 'archimedes',
        realWeight: 4,
        apparentWeight: 2.5,
        displacedVolume: 150,
        liquidName: 'ماء مالح',
      });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('الوضعية (1): في الهواء');
      expect(svg).toContain('الوضعية (2): في السائل');
      expect(svg).toContain('4 N');
      expect(svg).toContain('2.5 N');
      expect(svg).toContain('1.5 N'); // Fa = 4 - 2.5
      expect(svg).toContain('V = 150mL');
      expect(svg).toContain('ماء مالح');
      expect(svg).toContain('F_A');
    });

    it('يدعم إخفاء لوحة الحسابات أو المتجهات', () => {
      const svg = renderMechanics({
        kind: 'archimedes',
        showCalculations: false,
        showBuoyancyVector: false,
      });
      expect(svg).not.toContain('قوانين دافعة أرخميدس');
    });

    it('يدعم وضع الترقيم لسندات BEM', () => {
      const svg = renderMechanics({
        kind: 'archimedes',
        labelsMode: 'numbered',
      });
      expect(svg).toContain('>1</text>');
      expect(svg).toContain('>6</text>');
    });
  });

  // ============================================================
  // 4. الربيعة والثقل والكتلة (dynamometer_weight)
  // ============================================================
  describe('dynamometer_weight — الربيعة والثقل والكتلة', () => {
    it('يُنتج ربيعة مكبرة مع نابض مفصل وكتلة عيارية موسومة وبطاقة خصائص', () => {
      const svg = renderMechanics({
        kind: 'dynamometer_weight',
        mass: 300,
        gravity: 10,
      });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('300g');
      expect(svg).toContain('3N');
      expect(svg).toContain('P = m &#xB7; g');
      expect(svg).toContain('مركز ثقل الجسم الصلب (G)');
      expect(svg).toContain('المستقيم الشاقولي');
    });

    it('يحسب القوة تلقائياً بدقة مع قيم تسارع مختلفة', () => {
      const svg = renderMechanics({
        kind: 'dynamometer_weight',
        mass: 250,
        gravity: 9.8,
      });
      expect(svg).toContain('2.45N');
    });

    it('يدعم وضع الترقيم للامتحانات 1..7', () => {
      const svg = renderMechanics({
        kind: 'dynamometer_weight',
        labelsMode: 'numbered',
      });
      expect(svg).toContain('>1</text>');
      expect(svg).toContain('>7</text>');
    });
  });

  // ============================================================
  // 5. حركة واحتكاك على مستوٍ مائل (inclined_plane_motion)
  // ============================================================
  describe('inclined_plane_motion — المستوى المائل وتفكيك القوى', () => {
    it('يُنتج مستوى مائلاً مع تفكيك الثقل Px, Py ورد الفعل R وقوة الاحتكاك f', () => {
      const svg = renderMechanics({
        kind: 'inclined_plane_motion',
        angle: 35,
        weight: 12,
        motionDirection: 'down',
      });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('35&#xB0;');
      expect(svg).toContain('P');
      expect(svg).toContain('P_x');
      expect(svg).toContain('P_y');
      expect(svg).toContain('R');
      expect(svg).toContain('f');
      expect(svg).toContain('جهة الحركة');
      expect(svg).toContain('تفكيك شعاع الثقل');
    });

    it('يدعم الاتجاه نحو الأعلى أو السكون', () => {
      const upSvg = renderMechanics({
        kind: 'inclined_plane_motion',
        motionDirection: 'up',
      });
      expect(upSvg).toContain('جهة الحركة');

      const restSvg = renderMechanics({
        kind: 'inclined_plane_motion',
        motionDirection: 'rest',
        showMotionArrow: false,
      });
      expect(restSvg).not.toContain('جهة الحركة');
    });

    it('يدعم وضع الترقيم للامتحانات 1..7', () => {
      const svg = renderMechanics({
        kind: 'inclined_plane_motion',
        labelsMode: 'numbered',
      });
      expect(svg).toContain('>1</text>');
      expect(svg).toContain('>7</text>');
    });
  });

  // ============================================================
  // 6. التوافقية ومبدأ "لا يرمي أبداً" والتوجيه الذكي
  // ============================================================
  describe('التوافقية ومبدأ "لا يرمي أبداً"', () => {
    it('المواصفات غير الصالحة تعيد نصاً فارغاً بلا رمي', () => {
      expect(renderMechanics({ kind: 'unknown_kind' } as any)).toBe('');
      expect(renderMechanics({} as any)).toBe('');
    });

    it('renderFigure يوجه gen: forces بنجاح لمواصفات mechanics', () => {
      const svg = renderFigure({
        gen: 'forces',
        spec: {
          kind: 'archimedes',
          realWeight: 5,
          apparentWeight: 3.5,
        },
      });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('F_A');
    });

    it('renderForces يقبل مواصفات mechanics كواجهة متوافقة', () => {
      const svg = renderForces({
        kind: 'dynamometer_weight',
        mass: 400,
      } as any);
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('400g');
    });

    it('المخططات Zod تفحص المعطيات بدقة وتضع قيوداً سليمة', () => {
      expect(mechanicsSpecSchema.safeParse({ kind: 'archimedes', realWeight: -2 }).success).toBe(false);
      expect(twoForcesEquilibriumSpecSchema.safeParse({ kind: 'two_forces_equilibrium', forceValue: 4 }).success).toBe(true);
      expect(threeForcesEquilibriumSpecSchema.safeParse({ kind: 'three_forces_equilibrium', angle1: 120 }).success).toBe(false);
      expect(dynamometerWeightSpecSchema.safeParse({ kind: 'dynamometer_weight', mass: 100 }).success).toBe(true);
      expect(inclinedPlaneMotionSpecSchema.safeParse({ kind: 'inclined_plane_motion', angle: 85 }).success).toBe(false);
    });

    it('يدعم سمات الألوان الثلاثة (natural, vibrant, exam_print)', () => {
      const natSvg = renderMechanics({ kind: 'two_forces_equilibrium', theme: 'natural' });
      const vibSvg = renderMechanics({ kind: 'two_forces_equilibrium', theme: 'vibrant' });
      const examSvg = renderMechanics({ kind: 'two_forces_equilibrium', theme: 'exam_print' });

      expect(natSvg).toContain('#0f172a');
      expect(vibSvg).toContain('#1e1b4b');
      expect(examSvg).toContain('#ffffff');
    });

    it('يدعم إضافة شريط caption في الأسفل', () => {
      const svg = renderMechanics({
        kind: 'archimedes',
        caption: 'تجربة قياس دافعة أرخميدس في السوائل - شهادة BEM',
      });
      expect(svg).toContain('تجربة قياس دافعة أرخميدس في السوائل - شهادة BEM');
    });
  });
});
