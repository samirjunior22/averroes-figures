import { describe, it, expect } from 'vitest';
import {
  renderAbsorptionPathways,
  renderBloodSmear,
  renderEnzymaticDigestion,
  renderCellularRespiration,
  renderBiology,
  renderFigure,
  absorptionPathwaysSpecSchema,
  bloodSmearSpecSchema,
  enzymaticDigestionSpecSchema,
  cellularRespirationSpecSchema,
  biologySpecSchema,
} from '../index.js';

describe('مولّد التغذية عند الإنسان وجسم الإنسان — Human Nutrition Generator (BEM)', () => {
  // ============================================================
  // 1. طريقا الامتصاص ونقل المغذيات (absorption_pathways)
  // ============================================================
  describe('absorption_pathways — طريقا الامتصاص ونقل المغذيات وتعديل السكر', () => {
    it('يُنتج SVG كامل بالقيم الافتراضية وخلفية شفافة تماماً', () => {
      const svg = renderAbsorptionPathways({
        kind: 'absorption_pathways',
      });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('class="lesson-figure"');
      expect(svg).toContain('المعي الدقيق');
      expect(svg).toContain('الكبد');
      expect(svg).toContain('القلب');
      expect(svg).toContain('الوريد البابي الكبدي');
      expect(svg).toContain('الوريد فوق الكبدي');
      // التحقق من القيم الديناميكية الافتراضية
      expect(svg).toContain('2.5 g/L');
      expect(svg).toContain('1 g/L');
      // التحقق من عدم وجود خلفية مصمتة على مستوى اللوحة
      expect(svg).not.toMatch(/<rect[^>]+width="960"[^>]+height="520"/);
    });

    it('يدعم تغيير تراكيز الغلوكوز الديناميكية', () => {
      const svg = renderAbsorptionPathways({
        kind: 'absorption_pathways',
        glycemiaPortal: 3.2,
        glycemiaSupra: 1.05,
      });
      expect(svg).toContain('3.2 g/L');
      expect(svg).toContain('1.05 g/L');
    });

    it('يدعم إبراز المسار الدموي أو اللمفاوي فقط', () => {
      const bloodSvg = renderAbsorptionPathways({
        kind: 'absorption_pathways',
        highlightPathway: 'blood',
      });
      expect(bloodSvg).toContain('الطريق الدموي');

      const lymphSvg = renderAbsorptionPathways({
        kind: 'absorption_pathways',
        highlightPathway: 'lymph',
      });
      expect(lymphSvg).toContain('الطريق اللمفاوي');
    });

    it('يدعم نمط الترقيم للامتحانات (numbered) والنمط الصامت (none)', () => {
      const numSvg = renderAbsorptionPathways({
        kind: 'absorption_pathways',
        labelsMode: 'numbered',
      });
      expect(numSvg).toContain('>1</text>');
      expect(numSvg).toContain('>6</text>');
      expect(numSvg).not.toContain('Hepatic Portal Vein');

      const noneSvg = renderAbsorptionPathways({
        kind: 'absorption_pathways',
        labelsMode: 'none',
      });
      expect(noneSvg).not.toContain('>1</text>');
      expect(noneSvg).not.toContain('Hepatic Portal Vein');
    });

    it('يدعم السمات المختلفة وتضمين الشرح أسفل الرسم', () => {
      const examSvg = renderAbsorptionPathways({
        kind: 'absorption_pathways',
        theme: 'exam_print',
        caption: 'وثيقة تبرز دور الكبد في تعديل نسبة السكر في الدم',
      });
      expect(examSvg).toContain('وثيقة تبرز دور الكبد');
    });
  });

  // ============================================================
  // 2. السحبة الدموية وخلايا الوسط الداخلي (blood_smear)
  // ============================================================
  describe('blood_smear — السحبة الدموية وخلايا الوسط الداخلي', () => {
    it('يُنتج SVG للسحبة المجهرية مع معادلة الهيموغلوبين', () => {
      const svg = renderBloodSmear({
        kind: 'blood_smear',
      });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('Hb + 4 O&#x2082; &#x21C4; HbO&#x2088;');
      expect(svg).toContain('5 مليون / mm&#xB3;');
      expect(svg).toContain('7.5 آلاف / mm&#xB3;');
      expect(svg).toContain('250 ألف / mm&#xB3;');
      expect(svg).toContain('Hb = 15 g/dL');
      expect(svg).not.toMatch(/<rect[^>]+width="960"[^>]+height="520"/);
    });

    it('يدعم تعديل القيم البيولوجية والتركيزات من الـ input', () => {
      const svg = renderBloodSmear({
        kind: 'blood_smear',
        rbcCountMillion: 4.8,
        wbcCountThousand: 9.0,
        plateletCountThousand: 300,
        hbConcentration: 13.5,
        oxygenSaturation: 95,
      });
      expect(svg).toContain('4.8 مليون');
      expect(svg).toContain('9 آلاف');
      expect(svg).toContain('300 ألف');
      expect(svg).toContain('Hb = 13.5 g/dL');
      expect(svg).toContain('(95%)');
    });

    it('يدعم التركيز على مكون محدد من مكونات الدم', () => {
      const rbcSvg = renderBloodSmear({
        kind: 'blood_smear',
        focus: 'rbc',
      });
      expect(rbcSvg).toContain('كرية دم حمراء');

      const wbcSvg = renderBloodSmear({
        kind: 'blood_smear',
        focus: 'wbc',
      });
      expect(wbcSvg).toContain('Polynuclear Neutrophil');
    });

    it('يدعم إخفاء معادلة تنفس الهيموغلوبين', () => {
      const svg = renderBloodSmear({
        kind: 'blood_smear',
        showGasEquation: false,
      });
      expect(svg).not.toContain('Hb + 4 O&#x2082;');
    });

    it('يدعم نمط الترقيم 1..6 للامتحانات', () => {
      const svg = renderBloodSmear({
        kind: 'blood_smear',
        labelsMode: 'numbered',
      });
      expect(svg).toContain('>1</text>');
      expect(svg).toContain('>6</text>');
      expect(svg).not.toContain('Red Blood Cell (RBC)');
    });
  });

  // ============================================================
  // 3. الهضم الأنزيمي للنشا وتجارب الكواشف (enzymatic_digestion)
  // ============================================================
  describe('enzymatic_digestion — الهضم الأنزيمي للنشا وتجارب الكواشف', () => {
    it('يُنتج SVG للحمام المائي 37°C وأنابيب الاختبار ونموذج المالتوز', () => {
      const svg = renderEnzymaticDigestion({
        kind: 'enzymatic_digestion',
      });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('حمام مائي ثابت (37°C)');
      expect(svg).toContain('37°C');
      expect(svg).toContain('مطبوخ النشا');
      expect(svg).toContain('الأميلاز اللعابي');
      expect(svg).toContain('مالتوز (سكر شعير)');
      expect(svg).toContain('ماء اليود');
      expect(svg).toContain('محلول فهلنك');
      expect(svg).not.toMatch(/<rect[^>]+width="960"[^>]+height="520"/);
    });

    it('يدعم تعديل درجة الحرارة والكواشف والإنزيمات ديناميكياً', () => {
      const svg = renderEnzymaticDigestion({
        kind: 'enzymatic_digestion',
        temperature: 0,
        enzyme: 'أنزيم بيبسين معدي',
        substrate: 'زلال البيض (بروتين)',
        product: 'متعدد ببتيد',
      });
      expect(svg).toContain('0&#xB0;C');
      expect(svg).toContain('أنزيم بيبسين معدي');
      expect(svg).toContain('زلال البيض (بروتين)');
      expect(svg).toContain('متعدد ببتيد');
    });

    it('يدعم تجربة ماء اليود وحدها أو فهلنك وحده', () => {
      const iodineSvg = renderEnzymaticDigestion({
        kind: 'enzymatic_digestion',
        testReagent: 'iodine',
      });
      expect(iodineSvg).toContain('كاشف ماء اليود');
      expect(iodineSvg).not.toContain('فهلنك المغلي');

      const fehlingSvg = renderEnzymaticDigestion({
        kind: 'enzymatic_digestion',
        testReagent: 'fehling',
      });
      expect(fehlingSvg).toContain('محلول فهلنك');
      expect(fehlingSvg).not.toContain('ماء اليود (أزرق بنفسجي)');
    });

    it('يدعم نمط الترقيم ونمط إخفاء النموذج الجزيئي', () => {
      const svg = renderEnzymaticDigestion({
        kind: 'enzymatic_digestion',
        labelsMode: 'numbered',
        showMolecularModel: false,
      });
      expect(svg).toContain('>1</text>');
      expect(svg).not.toContain('Water Bath 37°C');
      expect(svg).not.toContain('جزيئة نشا ضخمة');
    });
  });

  // ============================================================
  // 4. التنفس الخلوي واستعمال المغذيات (cellular_respiration)
  // ============================================================
  describe('cellular_respiration — التنفس الخلوي واستعمال المغذيات', () => {
    it('يُنتج SVG للخلية الحية والميتوكندريا وحصيلة الطاقة ومعادلة الأكسدة', () => {
      const svg = renderCellularRespiration({
        kind: 'cellular_respiration',
      });
      expect(svg.startsWith('<svg')).toBe(true);
      expect(svg).toContain('الميتوكندريا');
      expect(svg).toContain('شعيرة دموية');
      expect(svg).toContain('السائل البيني');
      expect(svg).toContain('C&#x2086;H&#x2081;&#x2082;O&#x2086; + 6 O&#x2082;');
      expect(svg).toContain('2840 kJ / mol');
      expect(svg).toContain('طاقة حيوية ATP: 40%');
      expect(svg).toContain('طاقة حرارية ضائعة (60%)');
      expect(svg).not.toMatch(/<rect[^>]+width="960"[^>]+height="520"/);
    });

    it('يدعم تعديل مقادير الطاقة والنسب ونوع الخلية ديناميكياً', () => {
      const svg = renderCellularRespiration({
        kind: 'cellular_respiration',
        energyKJ: 2820,
        atpPercent: 42,
        heatPercent: 58,
        cellType: 'muscle',
      });
      expect(svg).toContain('2820 kJ / mol');
      expect(svg).toContain('طاقة حيوية ATP: 42%');
      expect(svg).toContain('طاقة حرارية ضائعة (58%)');
      expect(svg).toContain('خلية عضلية نشطة');
    });

    it('يدعم إخفاء الفضلات المطروحة ونمط الترقيم', () => {
      const svg = renderCellularRespiration({
        kind: 'cellular_respiration',
        showWasteProducts: false,
        labelsMode: 'numbered',
      });
      expect(svg).not.toContain('طرح غاز ثنائي أكسيد الكربون واليوريا');
      expect(svg).toContain('>1</text>');
      expect(svg).toContain('>6</text>');
      expect(svg).not.toContain('Mitochondria Organelle');
    });
  });

  // ============================================================
  // 5. التوزيع والتكامل عبر renderBiology و renderFigure
  // ============================================================
  describe('التكامل مع renderBiology و renderFigure', () => {
    it('renderBiology يُصيّر النماذج الأربعة بدقة', () => {
      expect(renderBiology({ kind: 'absorption_pathways' })).toContain('المعي الدقيق');
      expect(renderBiology({ kind: 'blood_smear' })).toContain('Hb + 4 O&#x2082;');
      expect(renderBiology({ kind: 'enzymatic_digestion' })).toContain('حمام مائي');
      expect(renderBiology({ kind: 'cellular_respiration' })).toContain('C&#x2086;H&#x2081;&#x2082;O&#x2086;');
    });

    it('renderFigure مع gen="biology" يُصيّر النماذج الأربعة بنجاح', () => {
      const pathways = renderFigure({ gen: 'biology', spec: { kind: 'absorption_pathways' } });
      expect(pathways).toContain('الوريد البابي الكبدي');

      const smear = renderFigure({ gen: 'biology', spec: { kind: 'blood_smear' } });
      expect(smear).toContain('كرية دم حمراء');

      const digestion = renderFigure({ gen: 'biology', spec: { kind: 'enzymatic_digestion' } });
      expect(digestion).toContain('الأميلاز اللعابي');

      const respiration = renderFigure({ gen: 'biology', spec: { kind: 'cellular_respiration' } });
      expect(respiration).toContain('الميتوكندريا');
    });

    it('مبدأ "لا يرمي أبداً" — مواصفات فاسدة تعيد سلسلة فارغة ولا تكسر التنفيذ', () => {
      // @ts-expect-error اختبار مدخلات غير صالحة
      expect(renderAbsorptionPathways({ kind: 'absorption_pathways', glycemiaPortal: -5 })).toBe('');
      // @ts-expect-error اختبار مدخلات غير صالحة
      expect(renderBloodSmear({ kind: 'blood_smear', oxygenSaturation: 150 })).toBe('');
      // @ts-expect-error اختبار نوع غير موجود
      expect(renderBiology({ kind: 'unknown_bio' })).toBe('');
      // @ts-expect-error مدخلات غير صالحة لـ renderFigure
      expect(renderFigure({ gen: 'biology', spec: { kind: 'cellular_respiration', atpPercent: 200 } })).toBe('');
    });
  });

  // ============================================================
  // 6. فحوصات Zod Schemas
  // ============================================================
  describe('Zod Schemas Validation', () => {
    it('يقبل المخططات الصالحة بالقيم الافتراضية', () => {
      expect(absorptionPathwaysSpecSchema.safeParse({ kind: 'absorption_pathways' }).success).toBe(true);
      expect(bloodSmearSpecSchema.safeParse({ kind: 'blood_smear' }).success).toBe(true);
      expect(enzymaticDigestionSpecSchema.safeParse({ kind: 'enzymatic_digestion' }).success).toBe(true);
      expect(cellularRespirationSpecSchema.safeParse({ kind: 'cellular_respiration' }).success).toBe(true);
      expect(biologySpecSchema.safeParse({ kind: 'cellular_respiration' }).success).toBe(true);
    });

    it('يرفض القيم السالبة للتركيزات أو نسب تتجاوز 100%', () => {
      expect(absorptionPathwaysSpecSchema.safeParse({ kind: 'absorption_pathways', glycemiaPortal: -2 }).success).toBe(false);
      expect(bloodSmearSpecSchema.safeParse({ kind: 'blood_smear', oxygenSaturation: -10 }).success).toBe(false);
      expect(cellularRespirationSpecSchema.safeParse({ kind: 'cellular_respiration', atpPercent: 120 }).success).toBe(false);
    });
  });
});
