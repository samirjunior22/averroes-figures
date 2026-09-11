// ============================================================
// مولّد مادة الإعلام الآلي والمعلوماتية — averroes-figures
// ============================================================
// يشمل:
// 1. مكونات الحاسوب (computer_hardware): عتاد خارجي ومكونات داخلية للوحدة المركزية
// 2. طوبولوجيا الشبكات (network_topology): نجمية، خطية، حلقية، شجرية
// 3. واجهة نظام التشغيل (os_interface): سطح المكتب وشريط المهام ومكونات النافذة
// 4. بيئة وبرمجة سكراتش (scratch): واجهة البرنامج الكاملة والمقاطع البرمجية (لبنات البازل)
//
// يدعم 3 أوضاع للتأشيرات:
// - 'full': بطاقات شرح عصرية تجمع بين العربية واللاتينية (للشرح والسبورة)
// - 'numbered': دوائر ترقيم 1..N لأسئلة ومسائل الامتحانات و BEM
// - 'none': رسم توضيحي نقي بدون تأشيرات
// ============================================================

import { z } from 'zod';
import type { RenderOptions } from './shared.js';
import { esc, wrapSvg } from './shared.js';

export interface CalloutItem {
  num: number;
  ar: string;
  sub: string;
  target: [number, number];
  card: [number, number];
}

// ------------------------------------------------------------
// المخططات (Zod Schemas)
// ------------------------------------------------------------

export const informaticsKindSchema = z.enum([
  'computer_hardware',
  'network_topology',
  'os_interface',
  'scratch',
]);
export type InformaticsKind = z.infer<typeof informaticsKindSchema>;

export const labelsModeSchema = z.enum(['full', 'numbered', 'none']).default('full');
export type LabelsMode = z.infer<typeof labelsModeSchema>;

export const informaticsThemeSchema = z.enum(['natural', 'vibrant', 'exam_print']).default('natural');
export type InformaticsTheme = z.infer<typeof informaticsThemeSchema>;

// 1. مكونات الحاسوب
export const hardwareViewSchema = z.enum(['desktop', 'internal']).default('desktop');
export const hardwareFocusSchema = z.enum([
  'all',
  'monitor',
  'unit',
  'keyboard',
  'mouse',
  'motherboard',
  'cpu',
  'ram',
  'disk',
  'psu',
]).default('all');

export const computerHardwareSpecSchema = z.object({
  kind: z.literal('computer_hardware'),
  view: hardwareViewSchema.optional(),
  focus: hardwareFocusSchema.optional(),
  labelsMode: labelsModeSchema.optional(),
  theme: informaticsThemeSchema.optional(),
  caption: z.string().optional(),
}).strict();
export type ComputerHardwareSpec = z.infer<typeof computerHardwareSpecSchema>;

// 2. طوبولوجيا الشبكات
export const networkTopologyTypeSchema = z.enum(['star', 'bus', 'ring', 'tree']).default('star');

export const networkTopologySpecSchema = z.object({
  kind: z.literal('network_topology'),
  topology: networkTopologyTypeSchema.optional(),
  showDataFlow: z.boolean().default(true).optional(),
  labelsMode: labelsModeSchema.optional(),
  theme: informaticsThemeSchema.optional(),
  caption: z.string().optional(),
}).strict();
export type NetworkTopologySpec = z.infer<typeof networkTopologySpecSchema>;

// 3. واجهة نظام التشغيل
export const osComponentSchema = z.enum(['desktop', 'window']).default('desktop');

export const osInterfaceSpecSchema = z.object({
  kind: z.literal('os_interface'),
  component: osComponentSchema.optional(),
  labelsMode: labelsModeSchema.optional(),
  theme: informaticsThemeSchema.optional(),
  caption: z.string().optional(),
}).strict();
export type OsInterfaceSpec = z.infer<typeof osInterfaceSpecSchema>;

// 4. سكراتش
export const scratchViewSchema = z.enum(['interface', 'script']).default('interface');

export const scratchSpecSchema = z.object({
  kind: z.literal('scratch'),
  view: scratchViewSchema.optional(),
  labelsMode: labelsModeSchema.optional(),
  theme: informaticsThemeSchema.optional(),
  caption: z.string().optional(),
}).strict();
export type ScratchSpec = z.infer<typeof scratchSpecSchema>;

// المخطط العام للمعلوماتية
export const informaticsSpecSchema = z.discriminatedUnion('kind', [
  computerHardwareSpecSchema,
  networkTopologySpecSchema,
  osInterfaceSpecSchema,
  scratchSpecSchema,
]);
export type InformaticsSpec = z.infer<typeof informaticsSpecSchema>;

// ------------------------------------------------------------
// 1. تصيير مكونات الحاسوب (Computer Hardware Renderer)
// ------------------------------------------------------------

export function renderComputerHardware(spec: ComputerHardwareSpec, opts?: RenderOptions): string {
  const view = spec.view ?? 'desktop';
  const mode = spec.labelsMode ?? 'full';
  const theme = spec.theme ?? 'natural';
  const focus = spec.focus ?? 'all';

  const W = 960;
  const H = 540;
  const uid = Math.random().toString(36).substring(2, 8);

  const isExam = theme === 'exam_print';
  const isVibrant = theme === 'vibrant';

  const cTextMain = isExam ? '#000000' : '#0f172a';
  const cTextSub = isExam ? '#334155' : '#64748b';
  const cPointerDot = isExam ? '#000000' : '#0284c7';
  const cCalloutBg = '#ffffff';
  const cCalloutStroke = isExam ? '#334155' : '#cbd5e1';

  let defs = `<defs>
    <filter id="hw-shadow-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#000000" flood-opacity="0.18"/>
    </filter>
    <filter id="hw-callout-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.12"/>
    </filter>
  </defs>`;

  let content = '';

  if (view === 'desktop') {
    // ── العتاد الخارجي: الشاشة، الوحدة المركزية، الفأرة، لوحة المفاتيح ──
    const opMonitor = focus === 'all' || focus === 'monitor' ? '1' : '0.3';
    const opUnit = focus === 'all' || focus === 'unit' ? '1' : '0.3';
    const opKeyboard = focus === 'all' || focus === 'keyboard' ? '1' : '0.3';
    const opMouse = focus === 'all' || focus === 'mouse' ? '1' : '0.3';

    // سطح طاولة العمل
    content += `
    <line x1="80" y1="450" x2="880" y2="450" stroke="${isExam ? '#94a3b8' : '#cbd5e1'}" stroke-width="3"/>
    <rect x="60" y="450" width="840" height="15" fill="${isExam ? '#f1f5f9' : '#e2e8f0'}" rx="4"/>
    `;

    // 1. الشاشة (Monitor) - في المنتصف/اليسار
    const cBezel = isExam ? '#334155' : '#1e293b';
    const cScreen = isExam ? '#e2e8f0' : (isVibrant ? '#38bdf8' : '#0284c7');
    content += `<g opacity="${opMonitor}">
      <!-- قاعدة الشاشة والقائم -->
      <path d="M 370 445 L 430 445 L 420 405 L 380 405 Z" fill="${isExam ? '#64748b' : '#334155'}"/>
      <ellipse cx="400" cy="445" rx="55" ry="9" fill="${isExam ? '#475569' : '#1e293b'}"/>

      <!-- إطار الشاشة والشاشة 3D -->
      <rect x="230" y="160" width="340" height="225" rx="12" fill="${cBezel}" filter="url(#hw-shadow-${uid})"/>
      <rect x="242" y="172" width="316" height="195" rx="6" fill="${cScreen}"/>

      <!-- رسم توضيحي داخل الشاشة -->
      <path d="M 242 320 C 310 270, 390 350, 470 290 L 558 330 L 558 367 L 242 367 Z" fill="${isExam ? '#cbd5e1' : '#bae6fd'}" opacity="0.6"/>
      <line x1="260" y1="210" x2="380" y2="210" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
      <line x1="260" y1="230" x2="330" y2="230" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.6"/>

      <!-- لمعان زجاجي على الشاشة -->
      <polygon points="242,172 380,172 270,367 242,367" fill="#ffffff" opacity="0.15"/>
      <circle cx="400" cy="374" r="3" fill="#38bdf8"/>
    </g>`;

    // 2. الوحدة المركزية (Central Unit) - على اليمين مجسمة بزاوية ثلاثية الأبعاد
    const cUnitFront = isExam ? '#475569' : '#0f172a';
    const cUnitSide = isExam ? '#1e293b' : '#020617';
    content += `<g opacity="${opUnit}">
      <!-- الواجهة الجانبية للوحدة -->
      <polygon points="760,130 840,105 840,390 760,440" fill="${cUnitSide}" filter="url(#hw-shadow-${uid})"/>
      <!-- الواجهة الأمامية للوحدة -->
      <rect x="630" y="130" width="130" height="310" rx="8" fill="${cUnitFront}" filter="url(#hw-shadow-${uid})"/>

      <!-- قارئ الأقراص / منافذ USB -->
      <rect x="645" y="150" width="100" height="24" rx="4" fill="${isExam ? '#94a3b8' : '#334155'}"/>
      <circle cx="730" cy="162" r="3" fill="#10b981"/>
      <rect x="655" y="195" width="22" height="6" fill="#64748b"/>
      <rect x="685" y="195" width="22" height="6" fill="#64748b"/>

      <!-- زر التشغيل متوهج -->
      <circle cx="695" cy="240" r="14" fill="${isExam ? '#cbd5e1' : '#1e293b'}" stroke="#38bdf8" stroke-width="2"/>
      <circle cx="695" cy="240" r="6" fill="#38bdf8"/>

      <!-- فتحات تهوية أمامية أنيقة -->
      <line x1="655" y1="310" x2="735" y2="310" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
      <line x1="655" y1="325" x2="735" y2="325" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
      <line x1="655" y1="340" x2="735" y2="340" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
      <line x1="655" y1="355" x2="735" y2="355" stroke="#334155" stroke-width="3" stroke-linecap="round"/>
    </g>`;

    // 3. لوحة المفاتيح (Keyboard) - أمام الشاشة بمنظور مائل
    const cKb = isExam ? '#475569' : '#1e293b';
    content += `<g opacity="${opKeyboard}">
      <!-- جسم لوحة المفاتيح مائل في المنظور -->
      <polygon points="210,432 490,432 470,402 230,402" fill="${cKb}" filter="url(#hw-shadow-${uid})"/>
      <!-- صفوف المفاتيح -->
      <line x1="235" y1="410" x2="465" y2="410" stroke="${isExam ? '#94a3b8' : '#475569'}" stroke-width="3" stroke-dasharray="7,3"/>
      <line x1="230" y1="418" x2="470" y2="418" stroke="${isExam ? '#94a3b8' : '#475569'}" stroke-width="3" stroke-dasharray="7,3"/>
      <line x1="220" y1="426" x2="480" y2="426" stroke="${isExam ? '#94a3b8' : '#475569'}" stroke-width="3" stroke-dasharray="14,4"/>
    </g>`;

    // 4. الفأرة (Mouse) - بجانب لوحة المفاتيح
    content += `<g opacity="${opMouse}">
      <ellipse cx="540" cy="425" rx="16" ry="24" fill="${cKb}" filter="url(#hw-shadow-${uid})"/>
      <line x1="540" y1="403" x2="540" y2="420" stroke="${isExam ? '#94a3b8' : '#64748b'}" stroke-width="1.8"/>
      <ellipse cx="540" cy="414" rx="3" ry="5" fill="#38bdf8"/>
    </g>`;

    // التأشيرات الخارجية
    if (mode !== 'none') {
      const labels: CalloutItem[] = [
        { num: 1, ar: 'الشاشة', sub: 'Monitor / Écran', target: [400, 160], card: [400, 80] },
        { num: 2, ar: 'الوحدة المركزية', sub: 'Central Unit', target: [700, 130], card: [770, 60] },
        { num: 3, ar: 'لوحة المفاتيح', sub: 'Keyboard / Clavier', target: [350, 420], card: [200, 485] },
        { num: 4, ar: 'الفأرة', sub: 'Mouse / Souris', target: [540, 425], card: [560, 485] },
      ];

      content += renderCalloutGroup(labels, mode, uid, cPointerDot, cCalloutBg, cCalloutStroke, cTextMain, cTextSub, opts?.fontFamily);
    }
  } else {
    // ── العتاد الداخلي للوحدة المركزية (Internal Components) ──
    const opMb = focus === 'all' || focus === 'motherboard' ? '1' : '0.3';
    const opCpu = focus === 'all' || focus === 'cpu' ? '1' : '0.3';
    const opRam = focus === 'all' || focus === 'ram' ? '1' : '0.3';
    const opDisk = focus === 'all' || focus === 'disk' ? '1' : '0.3';
    const opPsu = focus === 'all' || focus === 'psu' ? '1' : '0.3';

    // اللوحة الأم (Motherboard) في الخلفية كلوحة دارات إلكترونية
    const cPcb = isExam ? '#475569' : '#065f46';
    content += `<g opacity="${opMb}">
      <rect x="180" y="70" width="600" height="400" rx="14" fill="${cPcb}" filter="url(#hw-shadow-${uid})" stroke="#10b981" stroke-width="2"/>

      <!-- مسارات الدارات النحاسية (Traces) -->
      <path d="M 220 120 L 320 120 L 370 170 L 450 170" stroke="${isExam ? '#94a3b8' : '#34d399'}" stroke-width="2" fill="none" opacity="0.6"/>
      <path d="M 220 150 L 300 150 L 350 200 L 450 200" stroke="${isExam ? '#94a3b8' : '#34d399'}" stroke-width="2" fill="none" opacity="0.6"/>
      <path d="M 450 330 L 530 330 L 580 270 L 680 270" stroke="${isExam ? '#94a3b8' : '#34d399'}" stroke-width="2" fill="none" opacity="0.6"/>
      <circle cx="220" cy="120" r="4" fill="#fbbf24"/>
      <circle cx="220" cy="150" r="4" fill="#fbbf24"/>
      <circle cx="680" cy="270" r="4" fill="#fbbf24"/>

      <!-- مكثفات ودوائر إلكترونية متفرقة -->
      <circle cx="240" cy="220" r="10" fill="${isExam ? '#334155' : '#1e293b'}" stroke="#94a3b8" stroke-width="1.5"/>
      <circle cx="240" cy="260" r="10" fill="${isExam ? '#334155' : '#1e293b'}" stroke="#94a3b8" stroke-width="1.5"/>
      <circle cx="240" cy="300" r="10" fill="${isExam ? '#334155' : '#1e293b'}" stroke="#94a3b8" stroke-width="1.5"/>
      <!-- منافذ اللوحة الخلفية (Back Panel Ports) -->
      <rect x="180" y="90" width="16" height="60" fill="#94a3b8" rx="2"/>
      <rect x="180" y="170" width="16" height="40" fill="#3b82f6" rx="2"/>
    </g>`;

    // 1. المعالج CPU والمروحة (Processor & Heatsink)
    content += `<g opacity="${opCpu}">
      <rect x="340" y="150" width="130" height="130" rx="8" fill="${isExam ? '#64748b' : '#334155'}" stroke="#e2e8f0" stroke-width="2"/>
      <circle cx="405" cy="215" r="50" fill="${isExam ? '#1e293b' : '#0f172a'}"/>
      <!-- شفرات المروحة -->
      <path d="M 405 215 L 405 175 C 420 175, 430 190, 405 215 Z" fill="#64748b"/>
      <path d="M 405 215 L 445 215 C 445 230, 430 240, 405 215 Z" fill="#64748b"/>
      <path d="M 405 215 L 405 255 C 390 255, 380 240, 405 215 Z" fill="#64748b"/>
      <path d="M 405 215 L 365 215 C 365 200, 380 190, 405 215 Z" fill="#64748b"/>
      <circle cx="405" cy="215" r="14" fill="#38bdf8"/>
      <text x="405" y="219" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">CPU</text>
    </g>`;

    // 2. الذاكرة الحية (RAM Slots & Sticks)
    content += `<g opacity="${opRam}">
      <rect x="520" y="130" width="18" height="160" rx="3" fill="#1e293b"/>
      <rect x="550" y="130" width="18" height="160" rx="3" fill="#1e293b"/>
      <!-- شريحة رام مركبة -->
      <rect x="522" y="140" width="14" height="140" rx="2" fill="${isExam ? '#94a3b8' : '#0284c7'}"/>
      <rect x="524" y="155" width="10" height="20" rx="1" fill="#000000"/>
      <rect x="524" y="185" width="10" height="20" rx="1" fill="#000000"/>
      <rect x="524" y="215" width="10" height="20" rx="1" fill="#000000"/>
      <rect x="524" y="245" width="10" height="20" rx="1" fill="#000000"/>
    </g>`;

    // 3. القرص الصلب (Hard Disk Drive / SSD)
    content += `<g opacity="${opDisk}">
      <rect x="510" y="320" width="160" height="110" rx="8" fill="${isExam ? '#64748b' : '#334155'}" stroke="#94a3b8" stroke-width="2"/>
      <circle cx="585" cy="375" r="35" fill="${isExam ? '#cbd5e1' : '#cbd5e1'}" stroke="#64748b" stroke-width="2"/>
      <circle cx="585" cy="375" r="12" fill="#475569"/>
      <path d="M 585 375 L 635 345" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
      <rect x="518" y="328" width="50" height="18" rx="2" fill="#0f172a"/>
      <text x="543" y="340" font-size="8" font-weight="bold" fill="#ffffff" text-anchor="middle">HDD/SSD</text>
    </g>`;

    // 4. علبة التغذية الكهربائية (Power Supply Unit - PSU)
    content += `<g opacity="${opPsu}">
      <rect x="230" y="320" width="130" height="120" rx="8" fill="${isExam ? '#334155' : '#1e293b'}" stroke="#64748b" stroke-width="2"/>
      <!-- مروحة التغذية الخلفية -->
      <circle cx="295" cy="380" r="36" fill="${isExam ? '#475569' : '#0f172a'}" stroke="#64748b" stroke-dasharray="5,3"/>
      <!-- حزمة الكوابل الملونة الخارجة من العلبة -->
      <path d="M 360 400 Q 420 420, 480 390" stroke="#ef4444" stroke-width="3" fill="none"/>
      <path d="M 360 405 Q 420 425, 480 395" stroke="#fbbf24" stroke-width="3" fill="none"/>
      <path d="M 360 410 Q 420 430, 480 400" stroke="#000000" stroke-width="3" fill="none"/>
      <text x="295" y="345" font-size="9" font-weight="bold" fill="#e2e8f0" text-anchor="middle">Power Supply (PSU)</text>
    </g>`;

    // التأشيرات الداخلية
    if (mode !== 'none') {
      const labels: CalloutItem[] = [
        { num: 1, ar: 'اللوحة الأم', sub: 'Motherboard', target: [210, 85], card: [120, 85] },
        { num: 2, ar: 'المعالج الدقيق', sub: 'CPU (Processor)', target: [405, 150], card: [405, 40] },
        { num: 3, ar: 'الذاكرة الحية', sub: 'RAM Memory', target: [530, 130], card: [610, 40] },
        { num: 4, ar: 'القرص الصلب', sub: 'Hard Disk (HDD/SSD)', target: [670, 380], card: [830, 380] },
        { num: 5, ar: 'علبة التغذية', sub: 'Power Supply (PSU)', target: [230, 420], card: [120, 450] },
      ];

      content += renderCalloutGroup(labels, mode, uid, cPointerDot, cCalloutBg, cCalloutStroke, cTextMain, cTextSub, opts?.fontFamily);
    }
  }

  // عنوان توضيحي
  if (spec.caption) {
    content += `<text x="${W / 2}" y="${H - 15}" font-size="14" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
  }

  return wrapSvg(defs + content, W, H, spec.caption ?? 'رسم تخطيطي لمكونات الحاسوب الآلي', opts);
}

// ------------------------------------------------------------
// 2. تصيير طوبولوجيا الشبكات (Network Topology Renderer)
// ------------------------------------------------------------

export function renderNetworkTopology(spec: NetworkTopologySpec, opts?: RenderOptions): string {
  const topology = spec.topology ?? 'star';
  const mode = spec.labelsMode ?? 'full';
  const theme = spec.theme ?? 'natural';
  const showFlow = spec.showDataFlow ?? true;

  const W = 960;
  const H = 540;
  const uid = Math.random().toString(36).substring(2, 8);

  const isExam = theme === 'exam_print';
  const isVibrant = theme === 'vibrant';

  const cTextMain = isExam ? '#000000' : '#0f172a';
  const cTextSub = isExam ? '#334155' : '#64748b';
  const cPointerDot = isExam ? '#000000' : '#2563eb';
  const cCalloutBg = '#ffffff';
  const cCalloutStroke = isExam ? '#334155' : '#cbd5e1';

  let defs = `<defs>
    <filter id="net-shadow-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.15"/>
    </filter>
  </defs>`;

  let content = '';

  // دالة مساعدة لرسم حاسوب طرفي صغير
  const renderPC = (x: number, y: number, label: string) => {
    return `<g transform="translate(${x - 30}, ${y - 30})" filter="url(#net-shadow-${uid})">
      <!-- شاشة -->
      <rect x="5" y="5" width="50" height="35" rx="4" fill="${isExam ? '#475569' : '#1e293b'}"/>
      <rect x="8" y="8" width="44" height="28" rx="2" fill="${isExam ? '#e2e8f0' : (isVibrant ? '#38bdf8' : '#0284c7')}"/>
      <!-- قائم وقاعدة -->
      <rect x="26" y="40" width="8" height="8" fill="${isExam ? '#64748b' : '#334155'}"/>
      <ellipse cx="30" cy="49" rx="14" ry="3" fill="${isExam ? '#334155' : '#0f172a'}"/>
      <!-- تسمية الحاسوب -->
      <text x="30" y="65" font-size="10.5" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(label)}</text>
    </g>`;
  };

  if (topology === 'star') {
    // ── طوبولوجيا نجمية (Star Topology) ──
    const cx = 480;
    const cy = 270;
    const radius = 170;
    const pcCount = 5;

    // كوابل الشبكة النجمية
    content += `
    <!-- كوابل الشبكة النجمية -->
    <g>`;
    for (let i = 0; i < pcCount; i++) {
      const angle = (i * 2 * Math.PI) / pcCount - Math.PI / 2;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * radius;
      content += `<line x1="${cx}" y1="${cy}" x2="${px}" y2="${py}" stroke="${isExam ? '#475569' : '#0284c7'}" stroke-width="3" stroke-dasharray="${showFlow ? '6,3' : 'none'}"/>`;
      if (showFlow) {
        const mx = (cx + px) / 2;
        const my = (cy + py) / 2;
        content += `<circle cx="${mx}" cy="${my}" r="4" fill="${isExam ? '#000000' : '#10b981'}"/>`;
      }
    }
    content += `</g>`;

    // رسم جهاز Switch المركزي
    content += `
    <g transform="translate(${cx - 55}, ${cy - 25})" filter="url(#net-shadow-${uid})">
      <rect x="0" y="0" width="110" height="50" rx="8" fill="${isExam ? '#1e293b' : '#0f172a'}" stroke="#38bdf8" stroke-width="2"/>
      <!-- منافذ RJ45 ومصابيح LED -->
      <rect x="12" y="16" width="12" height="14" fill="#334155" rx="1"/>
      <rect x="28" y="16" width="12" height="14" fill="#334155" rx="1"/>
      <rect x="44" y="16" width="12" height="14" fill="#334155" rx="1"/>
      <rect x="60" y="16" width="12" height="14" fill="#334155" rx="1"/>
      <rect x="76" y="16" width="12" height="14" fill="#334155" rx="1"/>
      <!-- مصابيح LED خضراء نشطة -->
      <circle cx="18" cy="38" r="2.5" fill="#10b981"/>
      <circle cx="34" cy="38" r="2.5" fill="#10b981"/>
      <circle cx="50" cy="38" r="2.5" fill="#10b981"/>
      <circle cx="66" cy="38" r="2.5" fill="#10b981"/>
      <circle cx="82" cy="38" r="2.5" fill="#10b981"/>
      <text x="55" y="12" font-size="8.5" font-weight="bold" fill="#94a3b8" text-anchor="middle">SWITCH</text>
    </g>`;

    // رسم الحواسيب المحيطية
    for (let i = 0; i < pcCount; i++) {
      const angle = (i * 2 * Math.PI) / pcCount - Math.PI / 2;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * radius;
      content += renderPC(px, py, `حاسوب ${i + 1}`);
    }

    // التأشيرات
    if (mode !== 'none') {
      const labels: CalloutItem[] = [
        { num: 1, ar: 'الموزع / المبدل المركزي', sub: 'Switch / Hub', target: [cx, cy - 25], card: [260, 160] },
        { num: 2, ar: 'حواسيب طرفية', sub: 'Workstations / Nodes', target: [cx, cy - radius - 20], card: [cx, 35] },
        { num: 3, ar: 'كوابل توصيل الشبكة', sub: 'RJ45 Cables', target: [cx + 80, cy - 80], card: [700, 160] },
      ];
      content += renderCalloutGroup(labels, mode, uid, cPointerDot, cCalloutBg, cCalloutStroke, cTextMain, cTextSub, opts?.fontFamily);
    }
  } else if (topology === 'bus') {
    // ── طوبولوجيا خطية (Bus Topology) ──
    const lineY = 270;
    const startX = 140;
    const endX = 820;

    // كابل الناقل الرئيسي (Backbone)
    content += `
    <line x1="${startX}" y1="${lineY}" x2="${endX}" y2="${lineY}" stroke="${isExam ? '#000000' : '#0284c7'}" stroke-width="7" stroke-linecap="round"/>
    `;

    // مقاومات النهاية (Terminators)
    content += `
    <!-- مقاومة النهاية يسار -->
    <rect x="${startX - 20}" y="${lineY - 18}" width="20" height="36" rx="4" fill="${isExam ? '#334155' : '#dc2626'}"/>
    <!-- مقاومة النهاية يمين -->
    <rect x="${endX}" y="${lineY - 18}" width="20" height="36" rx="4" fill="${isExam ? '#334155' : '#dc2626'}"/>
    `;

    // تفريعات الحواسيب (Drop Lines & PCs)
    const xs = [240, 400, 560, 720];
    for (let i = 0; i < xs.length; i++) {
      const x = xs[i];
      const isTop = i % 2 === 0;
      const pcY = isTop ? lineY - 110 : lineY + 110;

      // موصل BNC على الناقل
      content += `<circle cx="${x}" cy="${lineY}" r="7" fill="${isExam ? '#475569' : '#f59e0b'}"/>`;
      // سلك الربط
      content += `<line x1="${x}" y1="${lineY}" x2="${x}" y2="${pcY}" stroke="${isExam ? '#64748b' : '#0284c7'}" stroke-width="3"/>`;
      content += renderPC(x, pcY, `محطة ${i + 1}`);
    }

    // التأشيرات
    if (mode !== 'none') {
      const labels: CalloutItem[] = [
        { num: 1, ar: 'الناقل الخطي الرئيسي', sub: 'Bus Backbone Cable', target: [480, lineY], card: [480, lineY - 35] },
        { num: 2, ar: 'مقاومة النهاية', sub: 'Terminator', target: [endX + 10, lineY], card: [830, lineY - 60] },
        { num: 3, ar: 'حاسوب طرفي وموصل', sub: 'Terminal Node & Drop Line', target: [240, lineY - 110], card: [120, lineY - 120] },
      ];
      content += renderCalloutGroup(labels, mode, uid, cPointerDot, cCalloutBg, cCalloutStroke, cTextMain, cTextSub, opts?.fontFamily);
    }
  } else if (topology === 'ring') {
    // ── طوبولوجيا حلقية (Ring Topology) ──
    const cx = 480;
    const cy = 270;
    const r = 160;
    const n = 5;

    // الحلقة الدائرية المغلقة
    content += `
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${isExam ? '#334155' : '#0284c7'}" stroke-width="5"/>
    `;

    // أسهم اتجاه دوران البيانات على طول الحلقة
    if (showFlow) {
      for (let i = 0; i < n; i++) {
        const a = (i * 2 * Math.PI) / n + 0.3;
        const ax = cx + Math.cos(a) * r;
        const ay = cy + Math.sin(a) * r;
        content += `<circle cx="${ax}" cy="${ay}" r="4.5" fill="${isExam ? '#000000' : '#10b981'}"/>`;
      }
    }

    // الحواسيب على الحلقة
    for (let i = 0; i < n; i++) {
      const a = (i * 2 * Math.PI) / n - Math.PI / 2;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      content += renderPC(px, py, `جهاز ${i + 1}`);
    }

    // التأشيرات
    if (mode !== 'none') {
      const labels: CalloutItem[] = [
        { num: 1, ar: 'الحلقة المغلقة', sub: 'Closed Token Ring', target: [cx + r, cy], card: [750, cy] },
        { num: 2, ar: 'محطة عمل متصلة بالحلقة', sub: 'Ring Node', target: [cx, cy - r - 20], card: [cx, 35] },
        { num: 3, ar: 'اتجاه تدفق البيانات', sub: 'Data / Token Flow', target: [cx - r, cy], card: [210, cy] },
      ];
      content += renderCalloutGroup(labels, mode, uid, cPointerDot, cCalloutBg, cCalloutStroke, cTextMain, cTextSub, opts?.fontFamily);
    }
  } else {
    // ── طوبولوجيا شجرية (Tree / Hierarchical Topology) ──
    const rootX = 480;
    const rootY = 120;
    const sw1X = 300;
    const sw1Y = 250;
    const sw2X = 660;
    const sw2Y = 250;

    // خطوط الاتصال الهرمية
    content += `
    <line x1="${rootX}" y1="${rootY}" x2="${sw1X}" y2="${sw1Y}" stroke="${isExam ? '#334155' : '#0284c7'}" stroke-width="3"/>
    <line x1="${rootX}" y1="${rootY}" x2="${sw2X}" y2="${sw2Y}" stroke="${isExam ? '#334155' : '#0284c7'}" stroke-width="3"/>

    <line x1="${sw1X}" y1="${sw1Y}" x2="200" y2="390" stroke="${isExam ? '#64748b' : '#38bdf8'}" stroke-width="2.5"/>
    <line x1="${sw1X}" y1="${sw1Y}" x2="380" y2="390" stroke="${isExam ? '#64748b' : '#38bdf8'}" stroke-width="2.5"/>

    <line x1="${sw2X}" y1="${sw2Y}" x2="580" y2="390" stroke="${isExam ? '#64748b' : '#38bdf8'}" stroke-width="2.5"/>
    <line x1="${sw2X}" y1="${sw2Y}" x2="760" y2="390" stroke="${isExam ? '#64748b' : '#38bdf8'}" stroke-width="2.5"/>
    `;

    // المبدل الرئيسي في القمة (Root Switch)
    content += `
    <g transform="translate(${rootX - 45}, ${rootY - 20})" filter="url(#net-shadow-${uid})">
      <rect x="0" y="0" width="90" height="40" rx="6" fill="${isExam ? '#0f172a' : '#1e3a8a'}" stroke="#60a5fa" stroke-width="2"/>
      <text x="45" y="24" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">مبدل رئيسي</text>
    </g>
    <!-- المبدلات الفرعية -->
    <g transform="translate(${sw1X - 40}, ${sw1Y - 18})" filter="url(#net-shadow-${uid})">
      <rect x="0" y="0" width="80" height="36" rx="6" fill="${isExam ? '#1e293b' : '#0284c7'}"/>
      <text x="40" y="22" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">مبدل 1</text>
    </g>
    <g transform="translate(${sw2X - 40}, ${sw2Y - 18})" filter="url(#net-shadow-${uid})">
      <rect x="0" y="0" width="80" height="36" rx="6" fill="${isExam ? '#1e293b' : '#0284c7'}"/>
      <text x="40" y="22" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">مبدل 2</text>
    </g>
    `;

    // الحواسيب في المستوى الأدنى
    content += renderPC(200, 390, 'حاسوب 1');
    content += renderPC(380, 390, 'حاسوب 2');
    content += renderPC(580, 390, 'حاسوب 3');
    content += renderPC(760, 390, 'حاسوب 4');

    // التأشيرات
    if (mode !== 'none') {
      const labels: CalloutItem[] = [
        { num: 1, ar: 'المبدل الجذري الرئيسي', sub: 'Root Switch', target: [rootX, rootY - 20], card: [rootX, 40] },
        { num: 2, ar: 'مبدل فرعي', sub: 'Branch Switch', target: [sw1X, sw1Y - 18], card: [120, sw1Y] },
        { num: 3, ar: 'عقد وحواسيب طرفية', sub: 'Leaf Nodes / PCs', target: [580, 390], card: [680, 480] },
      ];
      content += renderCalloutGroup(labels, mode, uid, cPointerDot, cCalloutBg, cCalloutStroke, cTextMain, cTextSub, opts?.fontFamily);
    }
  }

  // عنوان توضيحي
  if (spec.caption) {
    content += `<text x="${W / 2}" y="${H - 15}" font-size="14" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
  }

  return wrapSvg(defs + content, W, H, spec.caption ?? `طوبولوجيا شبكات الحاسوب (${topology})`, opts);
}

// ------------------------------------------------------------
// 3. تصيير واجهة نظام التشغيل (OS Interface Renderer)
// ------------------------------------------------------------

export function renderOsInterface(spec: OsInterfaceSpec, opts?: RenderOptions): string {
  const comp = spec.component ?? 'desktop';
  const mode = spec.labelsMode ?? 'full';
  const theme = spec.theme ?? 'natural';

  const W = 960;
  const H = 540;
  const uid = Math.random().toString(36).substring(2, 8);

  const isExam = theme === 'exam_print';
  const isVibrant = theme === 'vibrant';

  const cTextMain = isExam ? '#000000' : '#0f172a';
  const cTextSub = isExam ? '#334155' : '#64748b';
  const cPointerDot = isExam ? '#000000' : '#2563eb';
  const cCalloutBg = '#ffffff';
  const cCalloutStroke = isExam ? '#334155' : '#cbd5e1';

  let defs = `<defs>
    <filter id="os-shadow-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#000000" flood-opacity="0.2"/>
    </filter>
  </defs>`;

  let content = '';

  if (comp === 'desktop') {
    // ── سطح المكتب وشريط المهام وقائمة ابدأ ──
    const cBg1 = isExam ? '#f1f5f9' : (isVibrant ? '#0284c7' : '#0f172a');
    const cBg2 = isExam ? '#cbd5e1' : (isVibrant ? '#38bdf8' : '#1e293b');
    const cTaskbar = isExam ? '#334155' : '#020617';

    // خلفية سطح المكتب
    content += `
    <rect x="70" y="40" width="820" height="460" rx="12" fill="${cBg1}" filter="url(#os-shadow-${uid})"/>
    <ellipse cx="650" cy="200" rx="200" ry="120" fill="${cBg2}" opacity="0.45"/>
    `;

    // أيقونات سطح المكتب (مرتبة على اليمين باللغة العربية)
    const icons = [
      { x: 810, y: 80, label: 'هذا الكمبيوتر', iconType: 'pc' },
      { x: 810, y: 160, label: 'سلة المحذوفات', iconType: 'recycle' },
      { x: 810, y: 240, label: 'المستندات', iconType: 'folder' },
      { x: 810, y: 320, label: 'الإنترنت', iconType: 'web' },
    ];

    for (const ic of icons) {
      content += `
      <g transform="translate(${ic.x - 25}, ${ic.y - 15})">
        <rect x="0" y="0" width="50" height="42" rx="6" fill="${isExam ? '#64748b' : '#38bdf8'}" opacity="0.3"/>
        <rect x="8" y="4" width="34" height="26" rx="4" fill="${isExam ? '#ffffff' : '#38bdf8'}"/>
        <text x="25" y="48" font-size="9" font-weight="bold" fill="${isExam ? '#000000' : '#ffffff'}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(ic.label)}</text>
      </g>`;
    }

    // نافذة تطبيق مصغرة مفتوحة في المنتصف
    content += `
    <g transform="translate(260, 110)" filter="url(#os-shadow-${uid})">
      <rect x="0" y="0" width="420" height="260" rx="8" fill="#ffffff"/>
      <!-- شريط عنوان النافذة -->
      <rect x="0" y="0" width="420" height="32" rx="8" fill="${isExam ? '#475569' : '#0284c7'}"/>
      <rect x="0" y="24" width="420" height="8" fill="${isExam ? '#475569' : '#0284c7'}"/>
      <circle cx="20" cy="16" r="5" fill="#ef4444"/>
      <circle cx="36" cy="16" r="5" fill="#f59e0b"/>
      <circle cx="52" cy="16" r="5" fill="#10b981"/>
      <text x="210" y="21" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">نافذة برنامج Averroes</text>
      <!-- محتوى تجريبي داخل النافذة -->
      <rect x="25" y="55" width="160" height="80" rx="4" fill="${isExam ? '#f1f5f9' : '#e0f2fe'}"/>
      <rect x="205" y="55" width="190" height="18" rx="3" fill="${isExam ? '#e2e8f0' : '#f1f5f9'}"/>
      <rect x="205" y="85" width="150" height="14" rx="3" fill="${isExam ? '#e2e8f0' : '#f1f5f9'}"/>
      <rect x="25" y="150" width="370" height="85" rx="4" fill="${isExam ? '#f8fafc' : '#f8fafc'}"/>
    </g>`;

    // شريط المهام في الأسفل (Taskbar)
    content += `
    <g transform="translate(70, 458)">
      <rect x="0" y="0" width="820" height="42" fill="${cTaskbar}" rx="0 0 12 12"/>

      <!-- زر ابدأ (Start Button) -->
      <rect x="12" y="6" width="75" height="30" rx="6" fill="${isExam ? '#475569' : '#0284c7'}"/>
      <circle cx="27" cy="21" r="7" fill="#ffffff"/>
      <text x="56" y="25" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">ابدأ</text>

      <!-- أيقونات البرامج المفتوحة على شريط المهام -->
      <rect x="100" y="7" width="32" height="28" rx="4" fill="#334155"/>
      <rect x="138" y="7" width="32" height="28" rx="4" fill="#334155"/>
      <rect x="176" y="7" width="32" height="28" rx="4" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5"/>

      <!-- منطقة الإعلام والساعة (System Tray & Clock) على اليمين -->
      <text x="760" y="26" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">12:30 | AR</text>
    </g>`;

    // التأشيرات
    if (mode !== 'none') {
      const labels: CalloutItem[] = [
        { num: 1, ar: 'سطح المكتب', sub: 'Desktop Area', target: [170, 200], card: [100, 120] },
        { num: 2, ar: 'أيقونات البرامج والمجلدات', sub: 'Desktop Icons', target: [810, 80], card: [750, 25] },
        { num: 3, ar: 'نافذة تطبيق مفتوحة', sub: 'Active Window', target: [470, 110], card: [470, 50] },
        { num: 4, ar: 'شريط المهام', sub: 'Taskbar', target: [470, 480], card: [470, 525] },
        { num: 5, ar: 'زر ابدأ', sub: 'Start Button', target: [110, 480], card: [110, 525] },
        { num: 6, ar: 'منطقة الإعلام والساعة', sub: 'System Tray / Clock', target: [830, 480], card: [830, 525] },
      ];
      content += renderCalloutGroup(labels, mode, uid, cPointerDot, cCalloutBg, cCalloutStroke, cTextMain, cTextSub, opts?.fontFamily);
    }
  } else {
    // ── مكونات النافذة (Window Components) بالتفصيل ──
    const winX = 140;
    const winY = 60;
    const winW = 680;
    const winH = 410;

    content += `
    <g transform="translate(${winX}, ${winY})" filter="url(#os-shadow-${uid})">
      <rect x="0" y="0" width="${winW}" height="${winH}" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>

      <!-- 1. شريط العنوان (Title Bar) -->
      <rect x="0" y="0" width="${winW}" height="38" rx="10" fill="${isExam ? '#334155' : '#0284c7'}"/>
      <rect x="0" y="26" width="${winW}" height="12" fill="${isExam ? '#334155' : '#0284c7'}"/>
      <text x="${winW / 2}" y="24" font-size="12.5" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">المعالج النصي — Averroes Word</text>

      <!-- 2. أزرار التحكم الثلاثة (Control Buttons) -->
      <!-- إغلاق -->
      <rect x="12" y="9" width="22" height="20" rx="4" fill="#ef4444"/>
      <text x="23" y="23" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">✕</text>
      <!-- تكبير -->
      <rect x="38" y="9" width="22" height="20" rx="4" fill="#f59e0b"/>
      <text x="49" y="23" font-size="12" font-weight="bold" fill="#ffffff" text-anchor="middle">□</text>
      <!-- تصغير -->
      <rect x="64" y="9" width="22" height="20" rx="4" fill="#10b981"/>
      <text x="75" y="23" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">−</text>

      <!-- 3. شريط القوائم (Menu Bar) -->
      <rect x="0" y="38" width="${winW}" height="28" fill="${isExam ? '#f1f5f9' : '#f8fafc'}" stroke="#e2e8f0" stroke-width="1"/>
      <text x="${winW - 35}" y="56" font-size="11" font-weight="bold" fill="${cTextMain}" font-family="${opts?.fontFamily ?? 'sans-serif'}">ملف</text>
      <text x="${winW - 75}" y="56" font-size="11" font-weight="bold" fill="${cTextMain}" font-family="${opts?.fontFamily ?? 'sans-serif'}">تحرير</text>
      <text x="${winW - 120}" y="56" font-size="11" font-weight="bold" fill="${cTextMain}" font-family="${opts?.fontFamily ?? 'sans-serif'}">عرض</text>
      <text x="${winW - 170}" y="56" font-size="11" font-weight="bold" fill="${cTextMain}" font-family="${opts?.fontFamily ?? 'sans-serif'}">إدراج</text>
      <text x="${winW - 225}" y="56" font-size="11" font-weight="bold" fill="${cTextMain}" font-family="${opts?.fontFamily ?? 'sans-serif'}">تنسيق</text>

      <!-- 4. مساحة العمل (Workspace) -->
      <rect x="15" y="78" width="${winW - 45}" height="${winH - 110}" fill="#ffffff" stroke="#e2e8f0" rx="4"/>
      <!-- أسطر نصية وهمية في مساحة العمل -->
      <line x1="45" y1="110" x2="${winW - 75}" y2="110" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round"/>
      <line x1="45" y1="130" x2="${winW - 120}" y2="130" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round"/>
      <line x1="45" y1="150" x2="${winW - 90}" y2="150" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round"/>
      <line x1="45" y1="170" x2="${winW - 150}" y2="170" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round"/>

      <!-- 5. شريط التمرير العمودي (Vertical Scrollbar) -->
      <rect x="${winW - 22}" y="78" width="14" height="${winH - 110}" fill="#f1f5f9" rx="2"/>
      <rect x="${winW - 20}" y="110" width="10" height="60" rx="3" fill="#94a3b8"/>
      <!-- أسهم التمرير -->
      <polygon points="${winW - 15},82 ${winW - 20},90 ${winW - 10},90" fill="#64748b"/>
      <polygon points="${winW - 15},${winH - 36} ${winW - 20},${winH - 44} ${winW - 10},${winH - 44}" fill="#64748b"/>

      <!-- 6. شريط الحالة (Status Bar) -->
      <rect x="0" y="${winH - 26}" width="${winW}" height="26" fill="${isExam ? '#f1f5f9' : '#f8fafc'}" rx="0 0 10 10"/>
      <text x="25" y="${winH - 9}" font-size="10" font-weight="500" fill="#64748b" font-family="${opts?.fontFamily ?? 'sans-serif'}">الصفحة 1 من 1 | 120 كلمة | 100%</text>
    </g>`;

    // التأشيرات
    if (mode !== 'none') {
      const labels: CalloutItem[] = [
        { num: 1, ar: 'شريط العنوان', sub: 'Title Bar', target: [winX + 340, winY + 18], card: [winX + 340, winY - 25] },
        { num: 2, ar: 'أزرار التحكم (إغلاق، تكبير، تصغير)', sub: 'Window Control Buttons', target: [winX + 45, winY + 18], card: [winX - 50, winY + 18] },
        { num: 3, ar: 'شريط القوائم', sub: 'Menu Bar', target: [winX + winW - 100, winY + 52], card: [winX + winW + 50, winY + 52] },
        { num: 4, ar: 'مساحة العمل والتحرير', sub: 'Document Workspace', target: [winX + 250, winY + 160], card: [winX - 50, winY + 160] },
        { num: 5, ar: 'شريط التمرير العمودي', sub: 'Vertical Scrollbar', target: [winX + winW - 15, winY + 140], card: [winX + winW + 50, winY + 140] },
        { num: 6, ar: 'شريط الحالة والمعلومات', sub: 'Status Bar', target: [winX + 200, winY + winH - 12], card: [winX + 200, winY + winH + 35] },
      ];
      content += renderCalloutGroup(labels, mode, uid, cPointerDot, cCalloutBg, cCalloutStroke, cTextMain, cTextSub, opts?.fontFamily);
    }
  }

  // عنوان توضيحي
  if (spec.caption) {
    content += `<text x="${W / 2}" y="${H - 15}" font-size="14" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
  }

  return wrapSvg(defs + content, W, H, spec.caption ?? `واجهة نظام التشغيل (${comp})`, opts);
}

// ------------------------------------------------------------
// 4. تصيير بيئة وبرمجة سكراتش (Scratch Environment & Blocks)
// ------------------------------------------------------------

export function renderScratch(spec: ScratchSpec, opts?: RenderOptions): string {
  const view = spec.view ?? 'interface';
  const mode = spec.labelsMode ?? 'full';
  const theme = spec.theme ?? 'natural';

  const W = 960;
  const H = 540;
  const uid = Math.random().toString(36).substring(2, 8);

  const isExam = theme === 'exam_print';
  const isVibrant = theme === 'vibrant';

  const cTextMain = isExam ? '#000000' : '#0f172a';
  const cTextSub = isExam ? '#334155' : '#64748b';
  const cPointerDot = isExam ? '#000000' : '#ea580c';
  const cCalloutBg = '#ffffff';
  const cCalloutStroke = isExam ? '#334155' : '#cbd5e1';

  let defs = `<defs>
    <filter id="scr-shadow-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.16"/>
    </filter>
  </defs>`;

  let content = '';

  if (view === 'interface') {
    // ── واجهة سكراتش الكاملة (Scratch 3.0 Interface) ──
    const barX = 70;
    const barY = 40;
    const barW = 820;
    const barH = 450;

    content += `
    <!-- الإطار الخارجي لواجهة سكراتش -->
    <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.8" filter="url(#scr-shadow-${uid})"/>

    <!-- الشريط العلوي الأزرق (Header Toolbar) -->
    <rect x="${barX}" y="${barY}" width="${barW}" height="38" rx="10" fill="${isExam ? '#334155' : '#4d97fe'}"/>
    <rect x="${barX}" y="${barY + 26}" width="${barW}" height="12" fill="${isExam ? '#334155' : '#4d97fe'}"/>
    <text x="${barX + 50}" y="${barY + 24}" font-size="14" font-weight="bold" fill="#ffffff">SCRATCH</text>
    <circle cx="${barX + 25}" cy="${barY + 19}" r="9" fill="#ffab19"/>

    <!-- 1. شريط فئات اللبنات العمودي (Block Categories Sidebar) -->
    <g transform="translate(${barX}, ${barY + 38})">
      <rect x="0" y="0" width="70" height="${barH - 38}" fill="${isExam ? '#e2e8f0' : '#ffffff'}" stroke="#e2e8f0"/>
      <!-- فئات ملونة -->
      <!-- حركة (Motion) -->
      <circle cx="35" cy="30" r="13" fill="${isExam ? '#475569' : '#4c97ff'}"/>
      <text x="35" y="55" font-size="8.5" font-weight="bold" fill="${cTextMain}" text-anchor="middle">حركة</text>
      <!-- مظاهر (Looks) -->
      <circle cx="35" cy="80" r="13" fill="${isExam ? '#64748b' : '#9966ff'}"/>
      <text x="35" y="105" font-size="8.5" font-weight="bold" fill="${cTextMain}" text-anchor="middle">مظاهر</text>
      <!-- صوت (Sound) -->
      <circle cx="35" cy="130" r="13" fill="${isExam ? '#475569' : '#cf63cf'}"/>
      <text x="35" y="155" font-size="8.5" font-weight="bold" fill="${cTextMain}" text-anchor="middle">صوت</text>
      <!-- أحداث (Events) -->
      <circle cx="35" cy="180" r="13" fill="${isExam ? '#334155' : '#ffd500'}"/>
      <text x="35" y="205" font-size="8.5" font-weight="bold" fill="${cTextMain}" text-anchor="middle">أحداث</text>
      <!-- تحكم (Control) -->
      <circle cx="35" cy="230" r="13" fill="${isExam ? '#475569' : '#ffab19'}"/>
      <text x="35" y="255" font-size="8.5" font-weight="bold" fill="${cTextMain}" text-anchor="middle">تحكم</text>
      <!-- تحسس (Sensing) -->
      <circle cx="35" cy="280" r="13" fill="${isExam ? '#64748b' : '#5cb1d6'}"/>
      <text x="35" y="305" font-size="8.5" font-weight="bold" fill="${cTextMain}" text-anchor="middle">تحسس</text>
    </g>

    <!-- 2. قائمة اللبنات (Blocks Palette Column) -->
    <g transform="translate(${barX + 70}, ${barY + 38})">
      <rect x="0" y="0" width="160" height="${barH - 38}" fill="${isExam ? '#f1f5f9' : '#f9fafb'}" stroke="#e2e8f0"/>
      <!-- عينات من اللبنات -->
      <rect x="15" y="20" width="130" height="28" rx="5" fill="${isExam ? '#64748b' : '#4c97ff'}"/>
      <text x="80" y="38" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">تحرك (10) خطوة</text>

      <rect x="15" y="60" width="130" height="28" rx="5" fill="${isExam ? '#64748b' : '#4c97ff'}"/>
      <text x="80" y="78" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">استدر ↻ 15 درجة</text>

      <rect x="15" y="110" width="130" height="28" rx="5" fill="${isExam ? '#475569' : '#ffd500'}"/>
      <text x="80" y="128" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">عند النقر على ⚑</text>

      <rect x="15" y="160" width="130" height="28" rx="5" fill="${isExam ? '#334155' : '#ffab19'}"/>
      <text x="80" y="178" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">كرر (10) مرة</text>
    </g>

    <!-- 3. منطقة المقاطع البرمجية (Scripts Workspace) -->
    <g transform="translate(${barX + 230}, ${barY + 38})">
      <rect x="0" y="0" width="310" height="${barH - 38}" fill="#ffffff" stroke="#e2e8f0"/>
      <!-- شبكة رمادية خفيفة -->
      <line x1="0" y1="100" x2="310" y2="100" stroke="#f1f5f9" stroke-width="1"/>
      <line x1="0" y1="200" x2="310" y2="200" stroke="#f1f5f9" stroke-width="1"/>
      <!-- مقطع برمجي مجمع داخل مساحة العمل -->
      <g transform="translate(45, 50)">
        <!-- لبنة الحدث -->
        <path d="M 0 10 C 20 0, 50 0, 70 10 L 190 10 Q 195 10 195 15 L 195 40 Q 195 45 190 45 L 60 45 L 50 52 L 30 52 L 20 45 L 0 45 Z" fill="${isExam ? '#475569' : '#ffd500'}"/>
        <circle cx="35" cy="27" r="7" fill="#10b981"/>
        <text x="110" y="32" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">عند النقر على العلم</text>
        <!-- لبنة الحركة مركبة أسفلها -->
        <g transform="translate(0, 45)">
          <path d="M 0 0 L 20 0 L 30 7 L 50 7 L 60 0 L 190 0 Q 195 0 195 5 L 195 35 Q 195 40 190 40 L 60 40 L 50 47 L 30 47 L 20 40 L 0 40 Z" fill="${isExam ? '#64748b' : '#4c97ff'}"/>
          <text x="95" y="25" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">تحرك (10) خطوة</text>
        </g>
      </g>
    </g>

    <!-- 4. منصة العرض (Stage) في اليمين -->
    <g transform="translate(${barX + 540}, ${barY + 38})">
      <rect x="0" y="0" width="280" height="260" fill="#ffffff" stroke="#e2e8f0"/>
      <!-- شريط التحكم بالمنصة: العلم الأخضر وزر التوقف الأحمر -->
      <g transform="translate(15, 10)">
        <!-- العلم الأخضر -->
        <circle cx="15" cy="15" r="12" fill="#dcfce7"/>
        <polygon points="12,8 22,12 12,16" fill="#16a34a"/>
        <!-- زر التوقف الأحمر -->
        <circle cx="45" cy="15" r="12" fill="#fee2e2"/>
        <polygon points="41,11 49,11 53,15 53,19 49,23 41,23 37,19 37,15" fill="#dc2626"/>
      </g>

      <!-- كائن القط الشهير (Scratch Cat Silhouette) في منتصف المنصة -->
      <g transform="translate(120, 100)">
        <!-- رأس القط وأذناه -->
        <circle cx="20" cy="20" r="18" fill="${isExam ? '#94a3b8' : '#f59e0b'}"/>
        <polygon points="6,8 14,0 16,10" fill="${isExam ? '#94a3b8' : '#f59e0b'}"/>
        <polygon points="26,10 28,0 36,8" fill="${isExam ? '#94a3b8' : '#f59e0b'}"/>
        <!-- عينان وأنف -->
        <circle cx="14" cy="18" r="4" fill="#ffffff"/>
        <circle cx="14" cy="18" r="2" fill="#000000"/>
        <circle cx="26" cy="18" r="4" fill="#ffffff"/>
        <circle cx="26" cy="18" r="2" fill="#000000"/>
        <polygon points="20,22 18,25 22,25" fill="#ef4444"/>
        <!-- جسم وأطراف وذيل -->
        <ellipse cx="20" cy="45" rx="14" ry="16" fill="${isExam ? '#94a3b8' : '#f59e0b'}"/>
        <path d="M 8 50 Q -5 45, -6 30" stroke="${isExam ? '#94a3b8' : '#f59e0b'}" stroke-width="4" fill="none" stroke-linecap="round"/>
      </g>
    </g>

    <!-- 5. منطقة الكائنات والخلفيات (Sprites Area) أسفل المنصة -->
    <g transform="translate(${barX + 540}, ${barY + 298})">
      <rect x="0" y="0" width="280" height="${barH - 298}" fill="${isExam ? '#f1f5f9' : '#f8fafc'}" stroke="#e2e8f0"/>
      <text x="15" y="24" font-size="10.5" font-weight="bold" fill="${cTextMain}">منطقة الكائنات (Sprite1)</text>
      <!-- بطاقة الكائن المفعل -->
      <rect x="15" y="38" width="60" height="60" rx="6" fill="#ffffff" stroke="#4d97fe" stroke-width="2"/>
      <circle cx="45" cy="65" r="15" fill="#f59e0b"/>
      <text x="45" y="112" font-size="9" font-weight="bold" fill="${cTextMain}" text-anchor="middle">الكائن 1</text>
    </g>`;

    // التأشيرات
    if (mode !== 'none') {
      const labels: CalloutItem[] = [
        { num: 1, ar: 'لوحة فئات اللبنات', sub: 'Block Categories Palette', target: [barX + 35, barY + 90], card: [barX - 8, barY + 14] },
        { num: 2, ar: 'منطقة تجميع اللبنات', sub: 'Scripts Workspace', target: [barX + 330, barY + 120], card: [barX + 330, barY - 15] },
        { num: 3, ar: 'منصة العرض والعلم الأخضر', sub: 'Stage & Run Flag', target: [barX + 680, barY + 70], card: [barX + 680, barY - 15] },
        { num: 4, ar: 'كائن القط سكراتش', sub: 'Active Sprite', target: [barX + 680, barY + 160], card: [barX + 830, barY + 160] },
        { num: 5, ar: 'منطقة إدارة الكائنات', sub: 'Sprites Management Pane', target: [barX + 600, barY + 360], card: [barX + 830, barY + 360] },
      ];
      content += renderCalloutGroup(labels, mode, uid, cPointerDot, cCalloutBg, cCalloutStroke, cTextMain, cTextSub, opts?.fontFamily);
    }
  } else {
    // ── المقاطع البرمجية (Scratch Puzzle-Blocks Script) ──
    const blkX = 300;
    let blkY = 80;

    content += `
    <!-- خلفية منطقة العمل -->
    <rect x="140" y="40" width="680" height="450" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.8" filter="url(#scr-shadow-${uid})"/>
    <text x="170" y="75" font-size="13" font-weight="bold" fill="#64748b" font-family="${opts?.fontFamily ?? 'sans-serif'}">مقطع برمجي: حركة وتكرار مستمر</text>
    `;

    // 1. لبنة البداية / الأحداث (Hat Block - Event)
    content += `
    <g transform="translate(${blkX}, ${blkY})">
      <!-- شكل لبنة القبعة العلوية -->
      <path d="M 0 16 C 30 -2, 70 -2, 100 16 L 260 16 Q 266 16 266 22 L 266 52 Q 266 58 260 58 L 70 58 L 56 68 L 30 68 L 16 58 L 0 58 Z" fill="${isExam ? '#334155' : '#ffd500'}" filter="url(#scr-shadow-${uid})"/>
      <circle cx="45" cy="37" r="10" fill="#16a34a"/>
      <text x="145" y="42" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">عند النقر على العلم الأخضر</text>
    </g>`;

    // 2. لبنة التكرار (Repeat C-Block - Control)
    blkY += 58;
    content += `
    <g transform="translate(${blkX}, ${blkY})">
      <!-- جسم الـ C-Block الملتف -->
      <path d="M 0 0 L 16 0 L 30 10 L 56 10 L 70 0 L 260 0 Q 266 0 266 6 L 266 38 Q 266 44 260 44 L 110 44 L 96 54 L 70 54 L 56 44 L 40 44 L 40 130 L 70 130 L 84 140 L 110 140 L 124 130 L 260 130 Q 266 130 266 136 L 266 160 Q 266 166 260 166 L 70 166 L 56 176 L 30 176 L 16 166 L 0 166 Z" fill="${isExam ? '#475569' : '#ffab19'}" filter="url(#scr-shadow-${uid})"/>
      <text x="80" y="28" font-size="13" font-weight="bold" fill="#ffffff" font-family="${opts?.fontFamily ?? 'sans-serif'}">كرر</text>
      <!-- مدخل القيمة الرقمية 10 -->
      <rect x="115" y="12" width="34" height="24" rx="12" fill="#ffffff"/>
      <text x="132" y="29" font-size="13" font-weight="bold" fill="#000000" text-anchor="middle">10</text>
      <text x="160" y="28" font-size="13" font-weight="bold" fill="#ffffff" font-family="${opts?.fontFamily ?? 'sans-serif'}">مرة</text>
    </g>`;

    // 3. لبنة الحركة الأولى داخل التكرار (Motion Block)
    content += `
    <g transform="translate(${blkX + 40}, ${blkY + 44})">
      <path d="M 0 0 L 16 0 L 30 10 L 56 10 L 70 0 L 210 0 Q 216 0 216 6 L 216 36 Q 216 42 210 42 L 70 42 L 56 52 L 30 52 L 16 42 L 0 42 Z" fill="${isExam ? '#64748b' : '#4c97ff'}"/>
      <text x="25" y="26" font-size="12" font-weight="bold" fill="#ffffff" font-family="${opts?.fontFamily ?? 'sans-serif'}">تحرك</text>
      <rect x="70" y="10" width="32" height="22" rx="11" fill="#ffffff"/>
      <text x="86" y="26" font-size="12" font-weight="bold" fill="#000000" text-anchor="middle">15</text>
      <text x="110" y="26" font-size="12" font-weight="bold" fill="#ffffff" font-family="${opts?.fontFamily ?? 'sans-serif'}">خطوة</text>
    </g>`;

    // 4. لبنة الانتظار داخل التكرار (Wait Block)
    content += `
    <g transform="translate(${blkX + 40}, ${blkY + 86})">
      <path d="M 0 0 L 16 0 L 30 10 L 56 10 L 70 0 L 210 0 Q 216 0 216 6 L 216 36 Q 216 42 210 42 L 70 42 L 56 52 L 30 52 L 16 42 L 0 42 Z" fill="${isExam ? '#475569' : '#ffab19'}"/>
      <text x="25" y="26" font-size="12" font-weight="bold" fill="#ffffff" font-family="${opts?.fontFamily ?? 'sans-serif'}">انتظر</text>
      <rect x="75" y="10" width="34" height="22" rx="11" fill="#ffffff"/>
      <text x="92" y="26" font-size="11" font-weight="bold" fill="#000000" text-anchor="middle">0.2</text>
      <text x="116" y="26" font-size="12" font-weight="bold" fill="#ffffff" font-family="${opts?.fontFamily ?? 'sans-serif'}">ثانية</text>
    </g>`;

    // 5. لبنة الارتداد عند الحافة أسفل التكرار (If on edge bounce)
    blkY += 166;
    content += `
    <g transform="translate(${blkX}, ${blkY})">
      <path d="M 0 0 L 16 0 L 30 10 L 56 10 L 70 0 L 260 0 Q 266 0 266 6 L 266 38 Q 266 44 260 44 L 0 44 Z" fill="${isExam ? '#64748b' : '#4c97ff'}" filter="url(#scr-shadow-${uid})"/>
      <text x="133" y="27" font-size="12.5" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">ارتد إذا كنت عند الحافة</text>
    </g>`;

    // التأشيرات
    if (mode !== 'none') {
      const labels: CalloutItem[] = [
        { num: 1, ar: 'لبنة الأحداث والبداية', sub: 'Hat Block (Event Trigger)', target: [blkX + 266, 110], card: [blkX + 380, 110] },
        { num: 2, ar: 'لبنة التكرار والتحكم', sub: 'Repeat Loop (Control C-Block)', target: [blkX + 266, 170], card: [blkX + 380, 170] },
        { num: 3, ar: 'لبنة الحركة والإزاحة', sub: 'Motion Block', target: [blkX + 20, 200], card: [blkX - 100, 200] },
        { num: 4, ar: 'مدخلات عددية لمعاملات اللبنة', sub: 'Editable Value Inputs', target: [blkX + 130, 150], card: [blkX - 100, 150] },
        { num: 5, ar: 'لبنة الشروط والحركة', sub: 'Boundary Bounce Block', target: [blkX + 266, 330], card: [blkX + 380, 330] },
      ];
      content += renderCalloutGroup(labels, mode, uid, cPointerDot, cCalloutBg, cCalloutStroke, cTextMain, cTextSub, opts?.fontFamily);
    }
  }

  // عنوان توضيحي
  if (spec.caption) {
    content += `<text x="${W / 2}" y="${H - 15}" font-size="14" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
  }

  return wrapSvg(defs + content, W, H, spec.caption ?? `برمجة سكراتش (${view})`, opts);
}

// ------------------------------------------------------------
// دالة مساعدة لتصيير التأشيرات وبطاقات الشرح
// ------------------------------------------------------------

function renderCalloutGroup(
  labels: CalloutItem[],
  mode: LabelsMode,
  uid: string,
  cPointerDot: string,
  cCalloutBg: string,
  cCalloutStroke: string,
  cTextMain: string,
  cTextSub: string,
  fontFamily?: string
): string {
  let res = `<g class="info-callouts">`;
  const font = fontFamily ?? 'sans-serif';

  for (const item of labels) {
    const [tx, ty] = item.target;
    const [cx, cy] = item.card;

    if (mode === 'numbered') {
      res += `<!-- مؤشر مرقم [${item.num}] -->
      <line x1="${cx}" y1="${cy}" x2="${tx}" y2="${ty}" stroke="${cCalloutStroke}" stroke-width="1.6" stroke-dasharray="3,3" opacity="0.85"/>
      <circle cx="${tx}" cy="${ty}" r="4" fill="${cPointerDot}"/>
      <g>
        <circle cx="${cx}" cy="${cy}" r="14" fill="${cCalloutBg}" stroke="${cPointerDot}" stroke-width="2"/>
        <text x="${cx}" y="${cy + 5}" font-size="12.5" font-weight="bold" fill="${cPointerDot}" text-anchor="middle" font-family="${font}">${item.num}</text>
      </g>`;
    } else {
      const cardW = 160;
      const cardH = 36;
      const rx = cx - cardW / 2;
      const ry = cy - cardH / 2;

      res += `<!-- بطاقة شرح [${item.ar}] -->
      <line x1="${cx}" y1="${cy > ty ? ry : ry + cardH}" x2="${tx}" y2="${ty}" stroke="${cCalloutStroke}" stroke-width="1.4" opacity="0.75"/>
      <circle cx="${tx}" cy="${ty}" r="3.5" fill="${cPointerDot}"/>
      <g>
        <rect x="${rx}" y="${ry}" width="${cardW}" height="${cardH}" rx="9" fill="${cCalloutBg}" stroke="${cCalloutStroke}" stroke-width="1.2"/>
        <text x="${cx}" y="${cy - 3}" font-size="11" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${font}">${esc(item.ar)}</text>
        <text x="${cx}" y="${cy + 11}" font-size="9" font-weight="500" fill="${cTextSub}" text-anchor="middle" font-family="${font}">${esc(item.sub)}</text>
      </g>`;
    }
  }

  res += `</g>`;
  return res;
}

// ------------------------------------------------------------
// المُوزِّع العام لمولّد الإعلام الآلي
// ------------------------------------------------------------

export function renderInformatics(spec: InformaticsSpec, opts?: RenderOptions): string {
  try {
    if (spec.kind === 'computer_hardware') {
      return renderComputerHardware(spec, opts);
    }
    if (spec.kind === 'network_topology') {
      return renderNetworkTopology(spec, opts);
    }
    if (spec.kind === 'os_interface') {
      return renderOsInterface(spec, opts);
    }
    if (spec.kind === 'scratch') {
      return renderScratch(spec, opts);
    }
  } catch {
    // مبدأ "لا يرمي أبداً"
  }
  return '';
}
