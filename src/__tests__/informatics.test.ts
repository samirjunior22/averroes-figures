// ============================================================
// اختبارات مولّد الإعلام الآلي والمعلوماتية — averroes-figures
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  renderFigure,
  renderInformatics,
  renderComputerHardware,
  renderNetworkTopology,
  renderOsInterface,
  renderScratch,
  informaticsSpecSchema,
  computerHardwareSpecSchema,
  networkTopologySpecSchema,
  osInterfaceSpecSchema,
  scratchSpecSchema,
  FIGURE_GENS,
} from '../index.js';

describe('مولّد الإعلام الآلي (Informatics)', () => {
  it('FIGURE_GENS يحوي informatics', () => {
    expect(FIGURE_GENS).toContain('informatics');
  });

  // ============================================================
  // 1. مكونات الحاسوب (computer_hardware)
  // ============================================================
  describe('مكونات الحاسوب (computer_hardware)', () => {
    describe('مخطط Zod (computerHardwareSpecSchema)', () => {
      it('يقبل مواصفة سليمة افتراضية (desktop)', () => {
        const parsed = computerHardwareSpecSchema.safeParse({ kind: 'computer_hardware' });
        expect(parsed.success).toBe(true);
      });

      it('يقبل العتاد الداخلي (internal) مع كافة الخيارات', () => {
        const parsed = computerHardwareSpecSchema.safeParse({
          kind: 'computer_hardware',
          view: 'internal',
          focus: 'cpu',
          labelsMode: 'numbered',
          theme: 'vibrant',
          caption: 'مكونات الوحدة المركزية الداخلية',
        });
        expect(parsed.success).toBe(true);
      });

      it('يرفض view غير مدعوم', () => {
        expect(computerHardwareSpecSchema.safeParse({ kind: 'computer_hardware', view: 'laptop' }).success).toBe(false);
      });

      it('يرفض حقولاً إضافية غير معلنة', () => {
        expect(computerHardwareSpecSchema.safeParse({ kind: 'computer_hardware', extraKey: 99 }).success).toBe(false);
      });
    });

    describe('تصيير العتاد المكتبي الخارجي (desktop)', () => {
      it('يولّد SVG صالحاً ومكتملاً', () => {
        const svg = renderComputerHardware({ kind: 'computer_hardware', view: 'desktop' });
        expect(svg.startsWith('<svg')).toBe(true);
        expect(svg.endsWith('</svg>')).toBe(true);
        expect(svg).toContain('class="lesson-figure"');
      });

      it('يحتوي على الأجزاء الأربعة وبطاقات الشرح في وضع full', () => {
        const svg = renderComputerHardware({ kind: 'computer_hardware', view: 'desktop', labelsMode: 'full' });
        expect(svg).toContain('الشاشة');
        expect(svg).toContain('Monitor');
        expect(svg).toContain('الوحدة المركزية');
        expect(svg).toContain('Central Unit');
        expect(svg).toContain('لوحة المفاتيح');
        expect(svg).toContain('Keyboard');
        expect(svg).toContain('الفأرة');
        expect(svg).toContain('Mouse');
      });

      it('يحتوي على دوائر مرقمة 1..4 في وضع numbered', () => {
        const svg = renderComputerHardware({ kind: 'computer_hardware', view: 'desktop', labelsMode: 'numbered' });
        expect(svg).toContain('مؤشر مرقم [1]');
        expect(svg).toContain('مؤشر مرقم [4]');
        expect(svg).not.toContain('Monitor');
        expect(svg).not.toContain('Keyboard');
      });

      it('لا يحتوي على تأشيرات في الوضع الصامت none', () => {
        const svg = renderComputerHardware({ kind: 'computer_hardware', view: 'desktop', labelsMode: 'none' });
        expect(svg).not.toContain('class="info-callouts"');
        expect(svg).not.toContain('مؤشر مرقم');
      });
    });

    describe('تصيير العتاد الداخلي للوحدة المركزية (internal)', () => {
      it('يحتوي على المكونات الداخلية الخمسة وبطاقات الشرح في وضع full', () => {
        const svg = renderComputerHardware({ kind: 'computer_hardware', view: 'internal', labelsMode: 'full' });
        expect(svg).toContain('اللوحة الأم');
        expect(svg).toContain('Motherboard');
        expect(svg).toContain('المعالج الدقيق');
        expect(svg).toContain('CPU');
        expect(svg).toContain('الذاكرة الحية');
        expect(svg).toContain('RAM');
        expect(svg).toContain('القرص الصلب');
        expect(svg).toContain('Hard Disk');
        expect(svg).toContain('علبة التغذية');
        expect(svg).toContain('Power Supply');
      });

      it('يحتوي على دوائر مرقمة 1..5 في وضع numbered', () => {
        const svg = renderComputerHardware({ kind: 'computer_hardware', view: 'internal', labelsMode: 'numbered' });
        expect(svg).toContain('مؤشر مرقم [1]');
        expect(svg).toContain('مؤشر مرقم [5]');
        expect(svg).not.toContain('Motherboard');
      });
    });
  });

  // ============================================================
  // 2. طوبولوجيا الشبكات (network_topology)
  // ============================================================
  describe('طوبولوجيا الشبكات (network_topology)', () => {
    describe('مخطط Zod (networkTopologySpecSchema)', () => {
      it('يقبل كافة أنواع الطوبولوجيا (star, bus, ring, tree)', () => {
        const types = ['star', 'bus', 'ring', 'tree'] as const;
        for (const t of types) {
          const parsed = networkTopologySpecSchema.safeParse({ kind: 'network_topology', topology: t });
          expect(parsed.success).toBe(true);
        }
      });

      it('يرفض طوبولوجيا غير معروفة', () => {
        expect(networkTopologySpecSchema.safeParse({ kind: 'network_topology', topology: 'mesh_grid' }).success).toBe(false);
      });
    });

    describe('تصيير الطوبولوجيا النجمية (star)', () => {
      it('يحتوي على المبدل Switch والحواسيب والتأشيرات', () => {
        const svg = renderNetworkTopology({ kind: 'network_topology', topology: 'star', labelsMode: 'full' });
        expect(svg).toContain('SWITCH');
        expect(svg).toContain('الموزع / المبدل المركزي');
        expect(svg).toContain('حواسيب طرفية');
        expect(svg).toContain('كوابل توصيل الشبكة');
      });

      it('يتحكم بنقاط مسار البيانات showDataFlow', () => {
        const withFlow = renderNetworkTopology({ kind: 'network_topology', topology: 'star', showDataFlow: true });
        const withoutFlow = renderNetworkTopology({ kind: 'network_topology', topology: 'star', showDataFlow: false });
        expect(withFlow.length).toBeGreaterThan(withoutFlow.length);
      });
    });

    describe('تصيير الطوبولوجيا الخطية (bus)', () => {
      it('يحتوي على الناقل الرئيسي ومقاومات النهاية والتفريعات', () => {
        const svg = renderNetworkTopology({ kind: 'network_topology', topology: 'bus', labelsMode: 'full' });
        expect(svg).toContain('الناقل الخطي الرئيسي');
        expect(svg).toContain('مقاومة النهاية');
        expect(svg).toContain('حاسوب طرفي وموصل');
      });
    });

    describe('تصيير الطوبولوجيا الحلقية (ring)', () => {
      it('يحتوي على الحلقة المغلقة وتدفق البيانات', () => {
        const svg = renderNetworkTopology({ kind: 'network_topology', topology: 'ring', labelsMode: 'full' });
        expect(svg).toContain('الحلقة المغلقة');
        expect(svg).toContain('محطة عمل متصلة بالحلقة');
        expect(svg).toContain('اتجاه تدفق البيانات');
      });
    });

    describe('تصيير الطوبولوجيا الشجرية (tree)', () => {
      it('يحتوي على المبدل الجذري والمبدلات الفرعية', () => {
        const svg = renderNetworkTopology({ kind: 'network_topology', topology: 'tree', labelsMode: 'full' });
        expect(svg).toContain('مبدل رئيسي');
        expect(svg).toContain('المبدل الجذري الرئيسي');
        expect(svg).toContain('مبدل فرعي');
      });
    });
  });

  // ============================================================
  // 3. واجهة نظام التشغيل (os_interface)
  // ============================================================
  describe('واجهة نظام التشغيل (os_interface)', () => {
    describe('مخطط Zod (osInterfaceSpecSchema)', () => {
      it('يقبل desktop و window', () => {
        expect(osInterfaceSpecSchema.safeParse({ kind: 'os_interface', component: 'desktop' }).success).toBe(true);
        expect(osInterfaceSpecSchema.safeParse({ kind: 'os_interface', component: 'window' }).success).toBe(true);
      });

      it('يرفض مكوناً غير صالح', () => {
        expect(osInterfaceSpecSchema.safeParse({ kind: 'os_interface', component: 'dock' }).success).toBe(false);
      });
    });

    describe('تصيير سطح المكتب (desktop)', () => {
      it('يحتوي على شريط المهام وزر ابدأ والأيقونات ومنطقة الإعلام', () => {
        const svg = renderOsInterface({ kind: 'os_interface', component: 'desktop', labelsMode: 'full' });
        expect(svg).toContain('سطح المكتب');
        expect(svg).toContain('أيقونات البرامج والمجلدات');
        expect(svg).toContain('شريط المهام');
        expect(svg).toContain('زر ابدأ');
        expect(svg).toContain('منطقة الإعلام والساعة');
        expect(svg).toContain('ابدأ');
      });

      it('يدعم وضع الترقيم للامتحانات numbered', () => {
        const svg = renderOsInterface({ kind: 'os_interface', component: 'desktop', labelsMode: 'numbered' });
        expect(svg).toContain('مؤشر مرقم [1]');
        expect(svg).toContain('مؤشر مرقم [6]');
        expect(svg).not.toContain('Desktop Area');
      });
    });

    describe('تصيير مكونات النافذة (window)', () => {
      it('يحتوي على شريط العنوان وشريط القوائم وأزرار التحكم ومساحة العمل وشريط التمرير', () => {
        const svg = renderOsInterface({ kind: 'os_interface', component: 'window', labelsMode: 'full' });
        expect(svg).toContain('شريط العنوان');
        expect(svg).toContain('أزرار التحكم (إغلاق، تكبير، تصغير)');
        expect(svg).toContain('شريط القوائم');
        expect(svg).toContain('مساحة العمل والتحرير');
        expect(svg).toContain('شريط التمرير العمودي');
        expect(svg).toContain('شريط الحالة والمعلومات');
        expect(svg).toContain('ملف');
        expect(svg).toContain('تحرير');
      });
    });
  });

  // ============================================================
  // 4. بيئة وبرمجة سكراتش (scratch)
  // ============================================================
  describe('بيئة وبرمجة سكراتش (scratch)', () => {
    describe('مخطط Zod (scratchSpecSchema)', () => {
      it('يقبل interface و script', () => {
        expect(scratchSpecSchema.safeParse({ kind: 'scratch', view: 'interface' }).success).toBe(true);
        expect(scratchSpecSchema.safeParse({ kind: 'scratch', view: 'script' }).success).toBe(true);
      });

      it('يرفض view غير صالح', () => {
        expect(scratchSpecSchema.safeParse({ kind: 'scratch', view: 'costumes' }).success).toBe(false);
      });
    });

    describe('تصيير واجهة سكراتش (interface)', () => {
      it('يحتوي على المنصة والكائنات ولوحة اللبنات ومساحة المقاطع', () => {
        const svg = renderScratch({ kind: 'scratch', view: 'interface', labelsMode: 'full' });
        expect(svg).toContain('SCRATCH');
        expect(svg).toContain('لوحة فئات اللبنات');
        expect(svg).toContain('منطقة تجميع اللبنات');
        expect(svg).toContain('منصة العرض والعلم الأخضر');
        expect(svg).toContain('كائن القط سكراتش');
        expect(svg).toContain('منطقة إدارة الكائنات');
        expect(svg).toContain('حركة');
        expect(svg).toContain('أحداث');
      });

      it('يدعم وضع الامتحانات numbered', () => {
        const svg = renderScratch({ kind: 'scratch', view: 'interface', labelsMode: 'numbered' });
        expect(svg).toContain('مؤشر مرقم [1]');
        expect(svg).toContain('مؤشر مرقم [5]');
        expect(svg).not.toContain('Active Sprite');
      });
    });

    describe('تصيير المقاطع البرمجية (script - لبنات البازل)', () => {
      it('يحتوي على لبنات الأحداث والتكرار والحركة والارتداد', () => {
        const svg = renderScratch({ kind: 'scratch', view: 'script', labelsMode: 'full' });
        expect(svg).toContain('عند النقر على العلم الأخضر');
        expect(svg).toContain('كرر');
        expect(svg).toContain('تحرك');
        expect(svg).toContain('ارتد إذا كنت عند الحافة');
        expect(svg).toContain('لبنة الأحداث والبداية');
        expect(svg).toContain('لبنة التكرار والتحكم');
        expect(svg).toContain('لبنة الحركة والإزاحة');
      });
    });
  });

  // ============================================================
  // 5. الموزع العام والتكامل (renderInformatics & renderFigure)
  // ============================================================
  describe('الموزع العام والتكامل (renderInformatics & renderFigure)', () => {
    it('renderFigure يوجّه إلى informatics بنجاح لجميع الأنواع', () => {
      const hw = renderFigure({ gen: 'informatics', spec: { kind: 'computer_hardware' } });
      const net = renderFigure({ gen: 'informatics', spec: { kind: 'network_topology' } });
      const os = renderFigure({ gen: 'informatics', spec: { kind: 'os_interface' } });
      const scr = renderFigure({ gen: 'informatics', spec: { kind: 'scratch' } });

      expect(hw.startsWith('<svg')).toBe(true);
      expect(net.startsWith('<svg')).toBe(true);
      expect(os.startsWith('<svg')).toBe(true);
      expect(scr.startsWith('<svg')).toBe(true);
    });

    it('يدعم سمات التلوين (natural, vibrant, exam_print)', () => {
      const nat = renderInformatics({ kind: 'computer_hardware', theme: 'natural' });
      const vib = renderInformatics({ kind: 'computer_hardware', theme: 'vibrant' });
      const ex = renderInformatics({ kind: 'computer_hardware', theme: 'exam_print' });

      expect(nat.startsWith('<svg')).toBe(true);
      expect(vib.startsWith('<svg')).toBe(true);
      expect(ex.startsWith('<svg')).toBe(true);
    });

    it('مبدأ لا يرمي: إدخال خاطئ يرجع سلسلة فارغة بلا استثناء', () => {
      const invalid = renderFigure({ gen: 'informatics', spec: { kind: 'unknown_kind' } });
      expect(invalid).toBe('');
    });
  });
});
