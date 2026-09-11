// ============================================================
// مولّد مادة العلوم الفيزيائية والتكنولوجيا — averroes-figures
// ============================================================
// ميدان: الظواهر الكهربائية (Electrical Phenomena) — مرحلة التعليم المتوسط (BEM)
//
// يشمل خمسة نماذج متجهية ثلاثية الأبعاد (Vector 3D):
// 1. الكهروستاتيك وظواهر التكهرب (electrostatics): قضيب مشحون، كشاف كهربائي، نواس كهربائي
// 2. التحريض الكهرومغناطيسي (electromagnetic_induction): مغناطيس دائم، وشيعة، جلفانومتر، صمامات ضوئية
// 3. راسم الاهتزاز المهبطي (oscilloscope): شاشة فسفورية، منحنى جيبي، قياسات Umax و T وحسابات BEM
// 4. الأمن الكهربائي (electrical_safety): الطور والحيادي والأرضي، القاطع التفاضلي، الفاصمة، غسالة مؤرضة
// 5. الدارة الكهربائية المجسمة (circuit_3d): بطارية مسطحة 4.5V، قاطعة سكين، مصباح توهج، مشابك تمساح
//
// يدعم 3 أوضاع للتأشيرات:
// - 'full': بطاقات شرح عصرية تجمع بين العربية واللاتينية (للشرح والسبورة)
// - 'numbered': دوائر ترقيم 1..N لأسئلة ومسائل الامتحانات و BEM
// - 'none': رسم توضيحي نقي بدون تأشيرات
//
// المبدأ الحاكم: "لا يرمي أبداً" — أي مواصفات غير صالحة تعيد ''
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

export const physicsKindSchema = z.enum([
  'electrostatics',
  'electromagnetic_induction',
  'oscilloscope',
  'electrical_safety',
  'circuit_3d',
]);
export type PhysicsKind = z.infer<typeof physicsKindSchema>;

export const labelsModeSchema = z.enum(['full', 'numbered', 'none']).default('full');
export type LabelsMode = z.infer<typeof labelsModeSchema>;

export const physicsThemeSchema = z.enum(['natural', 'vibrant', 'exam_print']).default('natural');
export type PhysicsTheme = z.infer<typeof physicsThemeSchema>;

// 1. مخطط الكهروستاتيك والتكهرب
export const electrostaticsApparatusSchema = z.enum(['electroscope', 'pendulum', 'both']).default('both');
export const chargeTypeSchema = z.enum(['negative', 'positive']).default('negative');
export const chargingMethodSchema = z.enum(['induction', 'contact', 'friction']).default('induction');

export const electrostaticsSpecSchema = z.object({
  kind: z.literal('electrostatics'),
  apparatus: electrostaticsApparatusSchema.optional(),
  chargeType: chargeTypeSchema.optional(),
  method: chargingMethodSchema.optional(),
  showCharges: z.boolean().default(true),
  labelsMode: labelsModeSchema.optional(),
  theme: physicsThemeSchema.optional(),
  caption: z.string().optional(),
}).strict();
export type ElectrostaticsSpec = z.infer<typeof electrostaticsSpecSchema>;

// 2. مخطط التحريض الكهرومغناطيسي
export const magnetMovementSchema = z.enum(['approaching', 'receding', 'stationary']).default('approaching');

export const inductionSpecSchema = z.object({
  kind: z.literal('electromagnetic_induction'),
  magnetMovement: magnetMovementSchema.optional(),
  showFieldLines: z.boolean().default(true),
  showCurrentFlow: z.boolean().default(true),
  labelsMode: labelsModeSchema.optional(),
  theme: physicsThemeSchema.optional(),
  caption: z.string().optional(),
}).strict();
export type InductionSpec = z.infer<typeof inductionSpecSchema>;

// 3. مخطط راسم الاهتزاز المهبطي
export const oscilloscopeSignalSchema = z.enum(['ac_sine', 'dc', 'square']).default('ac_sine');

export const oscilloscopeSpecSchema = z.object({
  kind: z.literal('oscilloscope'),
  signalType: oscilloscopeSignalSchema.optional(),
  verticalSensitivity: z.number().positive().default(2), // V/div
  timeBase: z.number().positive().default(5), // ms/div
  showCalculations: z.boolean().default(true),
  labelsMode: labelsModeSchema.optional(),
  theme: physicsThemeSchema.optional(),
  caption: z.string().optional(),
}).strict();
export type OscilloscopeSpec = z.infer<typeof oscilloscopeSpecSchema>;

// 4. مخطط الأمن الكهربائي والشبكة المنزلية
export const safetyScenarioSchema = z.enum(['normal', 'protected', 'danger']).default('protected');

export const electricalSafetySpecSchema = z.object({
  kind: z.literal('electrical_safety'),
  scenario: safetyScenarioSchema.optional(),
  showGroundPath: z.boolean().default(true),
  labelsMode: labelsModeSchema.optional(),
  theme: physicsThemeSchema.optional(),
  caption: z.string().optional(),
}).strict();
export type ElectricalSafetySpec = z.infer<typeof electricalSafetySpecSchema>;

// 5. مخطط الدارة الكهربائية المجسمة 3D
export const switchStateSchema = z.enum(['closed', 'open']).default('closed');
export const circuitTypeSchema = z.enum(['simple', 'short_circuit', 'series']).default('simple');

export const circuit3dSpecSchema = z.object({
  kind: z.literal('circuit_3d'),
  switchState: switchStateSchema.optional(),
  circuitType: circuitTypeSchema.optional(),
  showCurrentFlow: z.boolean().default(true),
  labelsMode: labelsModeSchema.optional(),
  theme: physicsThemeSchema.optional(),
  caption: z.string().optional(),
}).strict();
export type Circuit3dSpec = z.infer<typeof circuit3dSpecSchema>;

// المخطط العام لمادة الفيزياء
export const physicsSpecSchema = z.discriminatedUnion('kind', [
  electrostaticsSpecSchema,
  inductionSpecSchema,
  oscilloscopeSpecSchema,
  electricalSafetySpecSchema,
  circuit3dSpecSchema,
]);
export type PhysicsSpec = z.infer<typeof physicsSpecSchema>;

// ------------------------------------------------------------
// دوال مساعدة للتأشيرات والسمات
// ------------------------------------------------------------

function renderPhysicsCallouts(
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
  let res = `<g class="phy-callouts">`;
  const font = fontFamily ?? 'sans-serif';

  for (const item of labels) {
    const [tx, ty] = item.target;
    const [cx, cy] = item.card;

    if (mode === 'numbered') {
      res += `<!-- مؤشر مرقم [${item.num}] -->
      <line x1="${cx}" y1="${cy}" x2="${tx}" y2="${ty}" stroke="${cCalloutStroke}" stroke-width="1.6" stroke-dasharray="3,3" opacity="0.85"/>
      <circle cx="${tx}" cy="${ty}" r="4" fill="${cPointerDot}"/>
      <g filter="url(#phy-shadow-${uid})">
        <circle cx="${cx}" cy="${cy}" r="14" fill="${cCalloutBg}" stroke="${cPointerDot}" stroke-width="2.2"/>
        <text x="${cx}" y="${cy + 5}" font-size="13" font-weight="bold" fill="${cPointerDot}" text-anchor="middle" font-family="${font}">${item.num}</text>
      </g>`;
    } else {
      const cardW = 180;
      const cardH = 36;
      const rx = cx - cardW / 2;
      const ry = cy - cardH / 2;

      res += `<!-- بطاقة شرح [${item.ar}] -->
      <line x1="${cx}" y1="${cy > ty ? ry : ry + cardH}" x2="${tx}" y2="${ty}" stroke="${cCalloutStroke}" stroke-width="1.4" opacity="0.75"/>
      <circle cx="${tx}" cy="${ty}" r="3.5" fill="${cPointerDot}"/>
      <g filter="url(#phy-shadow-${uid})">
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
// 1. الكهروستاتيك وظواهر التكهرب (Electrostatics Renderer)
// ------------------------------------------------------------

export function renderElectrostatics(spec: ElectrostaticsSpec, opts?: RenderOptions): string {
  const apparatus = spec.apparatus ?? 'both';
  const chargeType = spec.chargeType ?? 'negative';
  const method = spec.method ?? 'induction';
  const showCharges = spec.showCharges ?? true;
  const mode = spec.labelsMode ?? 'full';
  const theme = spec.theme ?? 'natural';

  const W = 960;
  const H = 540;
  const uid = Math.random().toString(36).substring(2, 8);

  const isExam = theme === 'exam_print';
  const isVibrant = theme === 'vibrant';

  const cTextMain = isExam ? '#000000' : '#0f172a';
  const cTextSub = isExam ? '#334155' : '#64748b';
  const cPointerDot = isExam ? '#000000' : (chargeType === 'negative' ? '#0284c7' : '#e11d48');
  const cCalloutBg = '#ffffff';
  const cCalloutStroke = isExam ? '#334155' : '#cbd5e1';

  // ألوان الشحنات والقضيب
  const isNeg = chargeType === 'negative';
  const cRod = isExam ? '#334155' : (isNeg ? '#1e293b' : '#38bdf8'); // إيبونيت أسود / زجاج شفاف أزرق
  const cChargeText = isNeg ? '#38bdf8' : '#f43f5e';

  let defs = `<defs>
    <filter id="phy-shadow-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.16"/>
    </filter>
    <linearGradient id="rod-grad-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${isNeg ? '#334155' : '#7dd3fc'}"/>
      <stop offset="50%" stop-color="${isNeg ? '#0f172a' : '#0284c7'}"/>
      <stop offset="100%" stop-color="${isNeg ? '#475569' : '#bae6fd'}"/>
    </linearGradient>
    <linearGradient id="jar-glass-${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="15%" stop-color="#38bdf8" stop-opacity="0.08"/>
      <stop offset="85%" stop-color="#38bdf8" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.4"/>
    </linearGradient>
    <linearGradient id="brass-grad-${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#d97706"/>
      <stop offset="50%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
  </defs>`;

  let content = '';

  // خلفية خفيفة وسطح الطاولة العازلة
  content += `<line x1="60" y1="460" x2="900" y2="460" stroke="${isExam ? '#94a3b8' : '#cbd5e1'}" stroke-width="3" stroke-linecap="round"/>`;

  // أ) النواس الكهربائي (Electric Pendulum) على اليسار
  if (apparatus === 'pendulum' || apparatus === 'both') {
    const baseX = apparatus === 'pendulum' ? 480 : 250;
    const standTopX = baseX - 70;
    const standTopY = 140;

    // الحامل العازل والقاعدة
    content += `<g class="pendulum-stand">
      <polygon points="${baseX - 110},460 ${baseX - 30},460 ${baseX - 45},445 ${baseX - 95},445" fill="${isExam ? '#64748b' : '#334155'}" filter="url(#phy-shadow-${uid})"/>
      <rect x="${standTopX - 6}" y="140" width="12" height="305" rx="4" fill="${isExam ? '#94a3b8' : '#64748b'}"/>
      <!-- الذراع الأفقية -->
      <rect x="${standTopX - 6}" y="140" width="90" height="10" rx="3" fill="${isExam ? '#94a3b8' : '#64748b'}"/>
      <circle cx="${standTopX + 75}" cy="145" r="4" fill="#f59e0b"/>
    </g>`;

    // خيط الحرير والكرية المغلفة بالألمنيوم (تنجذب أو تتنافر مائلة بزاوية)
    const ballRestX = standTopX + 75;
    const ballRestY = 320;
    // انحراف الكرية حسب الشحنة والطريقة
    const ballX = method === 'induction' ? ballRestX - 25 : (method === 'contact' ? ballRestX + 35 : ballRestX - 20);
    const ballY = ballRestY - 8;

    content += `<g class="pendulum-string-ball">
      <!-- خيط الحرير الرفيع -->
      <line x1="${standTopX + 75}" y1="145" x2="${ballX}" y2="${ballY}" stroke="${isExam ? '#475569' : '#94a3b8'}" stroke-width="1.8" stroke-dasharray="4,2"/>
      <!-- كرية البوليستيرين المغلفة بالألمنيوم -->
      <circle cx="${ballX}" cy="${ballY}" r="18" fill="url(#brass-grad-${uid})" stroke="${isExam ? '#000000' : '#d97706'}" stroke-width="1.5" filter="url(#phy-shadow-${uid})"/>
      <circle cx="${ballX - 5}" cy="${ballY - 5}" r="5" fill="#ffffff" opacity="0.6"/>
      ${showCharges ? `
        <!-- شحنات الكرية المستحثة -->
        <text x="${ballX - 6}" y="${ballY + 4}" font-size="11" font-weight="bold" fill="${isNeg ? '#ef4444' : '#0284c7'}">${isNeg ? '+' : '—'}</text>
        <text x="${ballX + 6}" y="${ballY + 4}" font-size="11" font-weight="bold" fill="${isNeg ? '#0284c7' : '#ef4444'}">${isNeg ? '—' : '+'}</text>
      ` : ''}
    </g>`;

    // قضيب التكهرب المقرب من الكرية
    const rodEndX = ballX - (method === 'contact' ? 5 : 45);
    const rodEndY = ballY - 10;
    content += `<g class="pendulum-rod" transform="rotate(-25 ${rodEndX} ${rodEndY})">
      <rect x="${rodEndX - 130}" y="${rodEndY - 12}" width="130" height="24" rx="8" fill="url(#rod-grad-${uid})" stroke="${isExam ? '#000000' : '#0f172a'}" stroke-width="2" filter="url(#phy-shadow-${uid})"/>
      ${showCharges ? `
        <!-- شحنات القضيب -->
        <text x="${rodEndX - 15}" y="${rodEndY + 5}" font-size="14" font-weight="bold" fill="${cChargeText}">${isNeg ? '—' : '+'}</text>
        <text x="${rodEndX - 40}" y="${rodEndY + 5}" font-size="14" font-weight="bold" fill="${cChargeText}">${isNeg ? '—' : '+'}</text>
        <text x="${rodEndX - 65}" y="${rodEndY + 5}" font-size="14" font-weight="bold" fill="${cChargeText}">${isNeg ? '—' : '+'}</text>
        <text x="${rodEndX - 90}" y="${rodEndY + 5}" font-size="14" font-weight="bold" fill="${cChargeText}">${isNeg ? '—' : '+'}</text>
      ` : ''}
    </g>`;
  }

  // ب) الكشاف الكهربائي (Electroscope 3D) على اليمين
  if (apparatus === 'electroscope' || apparatus === 'both') {
    const scX = apparatus === 'electroscope' ? 480 : 700;
    const baseWidth = 190;
    const jarH = 220;
    const jarTopY = 220;
    const jarBottomY = jarTopY + jarH;

    // 1. القاعدة الخشبية / البلاستيكية العازلة
    content += `<g class="scope-base">
      <ellipse cx="${scX}" cy="${jarBottomY + 10}" rx="${baseWidth / 2 + 15}" ry="18" fill="${isExam ? '#475569' : '#78350f'}" filter="url(#phy-shadow-${uid})"/>
      <ellipse cx="${scX}" cy="${jarBottomY + 4}" rx="${baseWidth / 2 + 14}" ry="16" fill="${isExam ? '#64748b' : '#92400e'}"/>
      <ellipse cx="${scX}" cy="${jarBottomY}" rx="${baseWidth / 2 + 10}" ry="14" fill="${isExam ? '#94a3b8' : '#b45309'}"/>
    </g>`;

    // 2. الناقوس الزجاجي الأسطواني الشفاف (Glass Jar)
    content += `<g class="scope-glass">
      <!-- خلفية زجاجية شفافة -->
      <rect x="${scX - 85}" y="${jarTopY}" width="170" height="${jarH}" rx="18" fill="url(#jar-glass-${uid})" stroke="${isExam ? '#94a3b8' : '#7dd3fc'}" stroke-width="2"/>
      <!-- لمعة زجاجية علوية وجانبية -->
      <path d="M ${scX - 75} ${jarTopY + 20} Q ${scX - 60} ${jarTopY + 110} ${scX - 75} ${jarBottomY - 20}" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.6" fill="none"/>
      <ellipse cx="${scX}" cy="${jarTopY + 12}" rx="80" ry="12" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
    </g>`;

    // 3. السدادة العازلة من الفلين أو المطاط
    content += `<g class="scope-cork">
      <polygon points="${scX - 28},${jarTopY - 4} ${scX + 28},${jarTopY - 4} ${scX + 22},${jarTopY + 26} ${scX - 22},${jarTopY + 26}" fill="${isExam ? '#64748b' : '#d97706'}" stroke="${isExam ? '#000000' : '#92400e'}" stroke-width="1.5" filter="url(#phy-shadow-${uid})"/>
    </g>`;

    // 4. الساق المعدنية الناقلة والقرص العلوي
    content += `<g class="scope-rod">
      <!-- الساق النحاسية الناقلة المارة عبر السدادة -->
      <rect x="${scX - 4}" y="${jarTopY - 35}" width="8" height="180" rx="3" fill="url(#brass-grad-${uid})" stroke="${isExam ? '#000000' : '#b45309'}" stroke-width="1.2"/>
      <!-- خطاف الساق السفلي -->
      <path d="M ${scX} ${jarTopY + 145} L ${scX} ${jarTopY + 155} L ${scX + 8} ${jarTopY + 155}" stroke="#b45309" stroke-width="4" fill="none" stroke-linecap="round"/>

      <!-- القرص المعدني العلوي المجسم -->
      <ellipse cx="${scX}" cy="${jarTopY - 35}" rx="55" ry="15" fill="url(#brass-grad-${uid})" stroke="${isExam ? '#000000' : '#b45309'}" stroke-width="2" filter="url(#phy-shadow-${uid})"/>
      <ellipse cx="${scX}" cy="${jarTopY - 38}" rx="52" ry="13" fill="#fef08a" opacity="0.4"/>
      ${showCharges ? `
        <!-- شحنات القرص العلوي -->
        <text x="${scX - 32}" y="${jarTopY - 32}" font-size="12" font-weight="bold" fill="${isNeg ? '#ef4444' : '#0284c7'}">${isNeg ? '+' : '—'}</text>
        <text x="${scX - 12}" y="${jarTopY - 32}" font-size="12" font-weight="bold" fill="${isNeg ? '#ef4444' : '#0284c7'}">${isNeg ? '+' : '—'}</text>
        <text x="${scX + 10}" y="${jarTopY - 32}" font-size="12" font-weight="bold" fill="${isNeg ? '#ef4444' : '#0284c7'}">${isNeg ? '+' : '—'}</text>
        <text x="${scX + 30}" y="${jarTopY - 32}" font-size="12" font-weight="bold" fill="${isNeg ? '#ef4444' : '#0284c7'}">${isNeg ? '+' : '—'}</text>
      ` : ''}
    </g>`;

    // 5. ورقتَا الألمنيوم المنفرجتان (Aluminum Leaves Deflected)
    content += `<g class="scope-leaves">
      <!-- الورقة اليمنى منفرجة -->
      <path d="M ${scX} ${jarTopY + 155} Q ${scX + 18} ${jarTopY + 185} ${scX + 38} ${jarTopY + 215} L ${scX + 30} ${jarTopY + 218} Q ${scX + 10} ${jarTopY + 185} ${scX} ${jarTopY + 155} Z" fill="#e2e8f0" stroke="${isExam ? '#000000' : '#94a3b8'}" stroke-width="1.4" filter="url(#phy-shadow-${uid})"/>
      <!-- الورقة اليسرى منفرجة بالتماثل -->
      <path d="M ${scX} ${jarTopY + 155} Q ${scX - 18} ${jarTopY + 185} ${scX - 38} ${jarTopY + 215} L ${scX - 30} ${jarTopY + 218} Q ${scX - 10} ${jarTopY + 185} ${scX} ${jarTopY + 155} Z" fill="#cbd5e1" stroke="${isExam ? '#000000' : '#94a3b8'}" stroke-width="1.4" filter="url(#phy-shadow-${uid})"/>

      ${showCharges ? `
        <!-- شحنات الورقتين المتماثلتين (تنافر) -->
        <text x="${scX - 25}" y="${jarTopY + 195}" font-size="11" font-weight="bold" fill="${cChargeText}">${isNeg ? '—' : '+'}</text>
        <text x="${scX + 18}" y="${jarTopY + 195}" font-size="11" font-weight="bold" fill="${cChargeText}">${isNeg ? '—' : '+'}</text>
      ` : ''}

      <!-- قوس قياس زاوية التنافر ثيتا -->
      <path d="M ${scX - 16} ${jarTopY + 190} Q ${scX} ${jarTopY + 196} ${scX + 16} ${jarTopY + 190}" fill="none" stroke="${isExam ? '#000000' : '#f59e0b'}" stroke-width="1.4" stroke-dasharray="3,2"/>
      <text x="${scX}" y="${jarTopY + 208}" font-size="11" font-weight="bold" fill="${isExam ? '#000000' : '#d97706'}" text-anchor="middle">θ</text>
    </g>`;

    // 6. قضيب التكهرب المقرب من القرص (التأثير أو اللمس)
    const rodX = scX - 70;
    const rodY = jarTopY - 75;
    content += `<g class="scope-rod-tool" transform="rotate(20 ${rodX} ${rodY})">
      <rect x="${rodX}" y="${rodY}" width="150" height="26" rx="8" fill="url(#rod-grad-${uid})" stroke="${isExam ? '#000000' : '#0f172a'}" stroke-width="2" filter="url(#phy-shadow-${uid})"/>
      ${showCharges ? `
        <!-- شحنات القضيب -->
        <text x="${rodX + 20}" y="${rodY + 18}" font-size="15" font-weight="bold" fill="${cChargeText}">${isNeg ? '—' : '+'}</text>
        <text x="${rodX + 50}" y="${rodY + 18}" font-size="15" font-weight="bold" fill="${cChargeText}">${isNeg ? '—' : '+'}</text>
        <text x="${rodX + 80}" y="${rodY + 18}" font-size="15" font-weight="bold" fill="${cChargeText}">${isNeg ? '—' : '+'}</text>
        <text x="${rodX + 110}" y="${rodY + 18}" font-size="15" font-weight="bold" fill="${cChargeText}">${isNeg ? '—' : '+'}</text>
      ` : ''}
    </g>`;
  }

  // التأشيرات
  if (mode !== 'none') {
    const labels: CalloutItem[] = [
      { num: 1, ar: isNeg ? 'قضيب إيبونيت مشحون' : 'قضيب زجاجي مشحون', sub: isNeg ? 'Charged Ebonite Rod' : 'Charged Glass Rod', target: [apparatus === 'pendulum' ? 240 : 660, 120], card: [apparatus === 'pendulum' ? 240 : 660, 50] },
      { num: 2, ar: 'قرص معدني ناقل', sub: 'Metallic Disc / Plateau', target: [700, 185], card: [860, 140] },
      { num: 3, ar: 'سدادة عازلة', sub: 'Insulating Cork Stopper', target: [700, 230], card: [860, 230] },
      { num: 4, ar: 'ساق معدنية ناقلة', sub: 'Conducting Rod / Tige', target: [700, 290], card: [860, 290] },
      { num: 5, ar: 'ورقتان معدنيتان منفرجتان', sub: 'Repelled Aluminum Leaves', target: [720, 395], card: [860, 390] },
      { num: 6, ar: 'ناقوس زجاجي شفاف', sub: 'Glass Protective Jar', target: [620, 330], card: [470, 330] },
    ];

    if (apparatus === 'both' || apparatus === 'pendulum') {
      labels.push({ num: 7, ar: 'كرية النواس المغلفة بالألمنيوم', sub: 'Metallic Pendulum Sphere', target: [apparatus === 'pendulum' ? 450 : 225, 310], card: [apparatus === 'pendulum' ? 450 : 150, 380] });
    }

    content += renderPhysicsCallouts(labels, mode, uid, cPointerDot, cCalloutBg, cCalloutStroke, cTextMain, cTextSub, opts?.fontFamily);
  }

  if (spec.caption) {
    content += `<text x="${W / 2}" y="${H - 15}" font-size="14" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
  }

  return wrapSvg(defs + content, W, H, spec.caption ?? 'الظواهر الكهروستاتيكية والتكهرب بالكشاف والنواس الكهربائي', opts);
}

// ------------------------------------------------------------
// 2. التحريض الكهرومغناطيسي (Electromagnetic Induction Renderer)
// ------------------------------------------------------------

export function renderInduction(spec: InductionSpec, opts?: RenderOptions): string {
  const magnetMovement = spec.magnetMovement ?? 'approaching';
  const showFieldLines = spec.showFieldLines ?? true;
  const showCurrentFlow = spec.showCurrentFlow ?? true;
  const mode = spec.labelsMode ?? 'full';
  const theme = spec.theme ?? 'natural';

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
    <filter id="phy-shadow-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.18"/>
    </filter>
    <linearGradient id="copper-wire-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="30%" stop-color="#fef08a"/>
      <stop offset="70%" stop-color="#b45309"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="core-cylinder-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="50%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>
    <linearGradient id="mag-north-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${isExam ? '#64748b' : '#ef4444'}"/>
      <stop offset="100%" stop-color="${isExam ? '#334155' : '#991b1b'}"/>
    </linearGradient>
    <linearGradient id="mag-south-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${isExam ? '#94a3b8' : '#3b82f6'}"/>
      <stop offset="100%" stop-color="${isExam ? '#475569' : '#1d4ed8'}"/>
    </linearGradient>
  </defs>`;

  let content = '';

  // طاولة التجارب
  content += `<line x1="80" y1="460" x2="880" y2="460" stroke="${isExam ? '#94a3b8' : '#cbd5e1'}" stroke-width="3" stroke-linecap="round"/>`;

  // 1. خطوط الحقل المغناطيسي المنحنية (Magnetic Field Lines)
  if (showFieldLines) {
    const cLine = isExam ? '#94a3b8' : '#38bdf8';
    content += `<g class="magnetic-field-lines" opacity="0.6">
      <path d="M 230 200 C 270 120 400 120 440 200" fill="none" stroke="${cLine}" stroke-width="1.8" stroke-dasharray="5,4"/>
      <path d="M 230 230 C 290 150 380 150 440 230" fill="none" stroke="${cLine}" stroke-width="1.8" stroke-dasharray="5,4"/>
      <path d="M 230 270 C 290 350 380 350 440 270" fill="none" stroke="${cLine}" stroke-width="1.8" stroke-dasharray="5,4"/>
      <path d="M 230 300 C 270 380 400 380 440 300" fill="none" stroke="${cLine}" stroke-width="1.8" stroke-dasharray="5,4"/>
      <!-- أسهم اتجاه الحقل B من N إلى S -->
      <polygon points="340,135 348,131 348,139" fill="${cLine}"/>
      <polygon points="340,365 348,361 348,369" fill="${cLine}"/>
    </g>`;
  }

  // 2. المغناطيس الدائم (Bar Magnet 3D)
  const magX = magnetMovement === 'approaching' ? 240 : (magnetMovement === 'receding' ? 180 : 210);
  const magY = 220;
  const magW = 160;
  const magH = 55;

  content += `<g class="bar-magnet" filter="url(#phy-shadow-${uid})">
    <!-- القطب الجنوبي S (أزرق) -->
    <rect x="${magX - magW / 2}" y="${magY}" width="${magW / 2}" height="${magH}" rx="5" fill="url(#mag-south-${uid})" stroke="${isExam ? '#000000' : '#1e3a8a'}" stroke-width="2"/>
    <text x="${magX - magW / 4}" y="${magY + 36}" font-size="24" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">S</text>
    <text x="${magX - magW / 4}" y="${magY + 50}" font-size="9" font-weight="bold" fill="#bfdbfe" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">جنوبي</text>

    <!-- القطب الشمالي N (أحمر) -->
    <rect x="${magX}" y="${magY}" width="${magW / 2}" height="${magH}" rx="5" fill="url(#mag-north-${uid})" stroke="${isExam ? '#000000' : '#7f1d1d'}" stroke-width="2"/>
    <text x="${magX + magW / 4}" y="${magY + 36}" font-size="24" font-weight="bold" fill="#ffffff" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">N</text>
    <text x="${magX + magW / 4}" y="${magY + 50}" font-size="9" font-weight="bold" fill="#fecaca" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">شمالي</text>

    <!-- سهم حركة المغناطيس v -->
    ${magnetMovement !== 'stationary' ? `
      <g class="motion-arrow">
        <line x1="${magX - 30}" y1="${magY - 25}" x2="${magX + 30}" y2="${magY - 25}" stroke="${isExam ? '#000000' : '#f59e0b'}" stroke-width="4" stroke-linecap="round"/>
        ${magnetMovement === 'approaching' ? `
          <polygon points="${magX + 42},${magY - 25} ${magX + 26},${magY - 32} ${magX + 26},${magY - 18}" fill="${isExam ? '#000000' : '#f59e0b'}"/>
        ` : `
          <polygon points="${magX - 42},${magY - 25} ${magX - 26},${magY - 32} ${magX - 26},${magY - 18}" fill="${isExam ? '#000000' : '#f59e0b'}"/>
        `}
        <text x="${magX}" y="${magY - 34}" font-size="14" font-weight="bold" fill="${isExam ? '#000000' : '#d97706'}" text-anchor="middle">v⃗ (حركة المحرّض)</text>
      </g>
    ` : ''}
  </g>`;

  // 3. الوشيعة النحاسية الأسطوانية (Solenoid Coil 3D)
  const coilX = 490;
  const coilY = 205;
  const coilW = 150;
  const coilH = 85;

  content += `<g class="solenoid-coil" filter="url(#phy-shadow-${uid})">
    <!-- حامل الوشيعة الأسطواني الداخلي -->
    <rect x="${coilX}" y="${coilY + 5}" width="${coilW}" height="${coilH - 10}" rx="14" fill="url(#core-cylinder-${uid})" stroke="${isExam ? '#000000' : '#334155'}" stroke-width="2"/>
    <ellipse cx="${coilX}" cy="${coilY + coilH / 2}" rx="16" ry="${coilH / 2 - 5}" fill="#1e293b"/>

    <!-- لفات السلك النحاسي المذهب المجسمة (3D loops) -->
    ${[0, 1, 2, 3, 4, 5, 6].map(i => {
      const lx = coilX + 18 + i * 18;
      return `<g class="coil-loop">
        <ellipse cx="${lx}" cy="${coilY + coilH / 2}" rx="8" ry="${coilH / 2 + 2}" fill="none" stroke="url(#copper-wire-${uid})" stroke-width="5.5"/>
        <ellipse cx="${lx}" cy="${coilY + coilH / 2}" rx="8" ry="${coilH / 2 + 2}" fill="none" stroke="#fef08a" stroke-width="1.2" opacity="0.6"/>
      </g>`;
    }).join('')}

    <!-- قاعدة حامل الوشيعة على الطاولة -->
    <polygon points="${coilX + 15},460 ${coilX + coilW - 15},460 ${coilX + coilW - 35},${coilY + coilH} ${coilX + 35},${coilY + coilH}" fill="${isExam ? '#64748b' : '#334155'}"/>
  </g>`;

  // 4. أسلاك التوصيل بين الوشيعة والجهازين
  content += `<g class="connecting-wires">
    <!-- سلك من طرف الوشيعة الأيسر إلى الجلفانومتر والصمامين -->
    <path d="M ${coilX + 18} ${coilY + coilH} Q ${coilX - 30} 380 730 380 L 730 330" fill="none" stroke="${isExam ? '#475569' : '#0284c7'}" stroke-width="3" stroke-linecap="round"/>
    <!-- سلك من طرف الوشيعة الأيمن إلى الجلفانومتر والصمامين -->
    <path d="M ${coilX + coilW - 18} ${coilY + coilH} Q ${coilX + coilW + 20} 400 810 400 L 810 330" fill="none" stroke="${isExam ? '#475569' : '#ef4444'}" stroke-width="3" stroke-linecap="round"/>
  </g>`;

  // 5. صمامان ثنائيان ضوئيان متعاكسان (Anti-parallel LEDs)
  const ledX = 570;
  const ledY = 385;
  const led1On = magnetMovement === 'approaching';
  const led2On = magnetMovement === 'receding';

  content += `<g class="anti-parallel-leds" filter="url(#phy-shadow-${uid})">
    <!-- لوحة تثبيت الصمامين -->
    <rect x="${ledX - 45}" y="${ledY - 22}" width="90" height="44" rx="8" fill="${isExam ? '#cbd5e1' : '#1e293b'}" stroke="${isExam ? '#000000' : '#475569'}" stroke-width="1.5"/>

    <!-- LED 1 (أخضر - يمين) -->
    <circle cx="${ledX - 20}" cy="${ledY}" r="11" fill="${isExam ? '#64748b' : (led1On ? '#22c55e' : '#14532d')}" stroke="${led1On ? '#86efac' : '#334155'}" stroke-width="2"/>
    ${led1On && !isExam ? `<circle cx="${ledX - 20}" cy="${ledY}" r="18" fill="#22c55e" opacity="0.35"/>` : ''}

    <!-- LED 2 (أحمر - يسار متعاكس) -->
    <circle cx="${ledX + 20}" cy="${ledY}" r="11" fill="${isExam ? '#94a3b8' : (led2On ? '#ef4444' : '#7f1d1d')}" stroke="${led2On ? '#fca5a5' : '#334155'}" stroke-width="2"/>
    ${led2On && !isExam ? `<circle cx="${ledX + 20}" cy="${ledY}" r="18" fill="#ef4444" opacity="0.35"/>` : ''}
  </g>`;

  // 6. جهاز الجلفانومتر الحساس بصفر مركزي (Galvanometer 3D)
  const gX = 770;
  const gY = 250;
  const gW = 150;
  const gH = 150;

  // انحراف الإبرة: يمين عند الاقتراب، يسار عند الابتعاد، صفر عند السكون
  const needleAngle = magnetMovement === 'approaching' ? 24 : (magnetMovement === 'receding' ? -24 : 0);

  content += `<g class="galvanometer" filter="url(#phy-shadow-${uid})">
    <!-- علبة الجهاز الخارجية 3D -->
    <rect x="${gX - gW / 2}" y="${gY - gH / 2}" width="${gW}" height="${gH}" rx="16" fill="${isExam ? '#e2e8f0' : '#0f172a'}" stroke="${isExam ? '#000000' : '#38bdf8'}" stroke-width="2"/>
    <!-- قرص الميناء الأبيض الداخلي -->
    <path d="M ${gX - 60} ${gY - 10} A 65 65 0 0 1 ${gX + 60} ${gY - 10} L ${gX + 50} ${gY + 35} L ${gX - 50} ${gY + 35} Z" fill="#ffffff" stroke="#94a3b8" stroke-width="1.2"/>

    <!-- تدريجات الجلفانومتر مع الصفر المركزي -->
    <text x="${gX}" y="${gY - 45}" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="middle">0</text>
    <text x="${gX - 45}" y="${gY - 20}" font-size="10" font-weight="bold" fill="#ef4444" text-anchor="middle">-G</text>
    <text x="${gX + 45}" y="${gY - 20}" font-size="10" font-weight="bold" fill="#22c55e" text-anchor="middle">+G</text>
    <path d="M ${gX - 45} ${gY - 12} A 50 50 0 0 1 ${gX + 45} ${gY - 12}" fill="none" stroke="#64748b" stroke-width="1.8"/>

    <!-- الشُّرَط الصغيرة للتدريجات -->
    <line x1="${gX}" y1="${gY - 42}" x2="${gX}" y2="${gY - 32}" stroke="#0f172a" stroke-width="2"/>
    <line x1="${gX - 25}" y1="${gY - 38}" x2="${gX - 20}" y2="${gY - 30}" stroke="#64748b" stroke-width="1.4"/>
    <line x1="${gX + 25}" y1="${gY - 38}" x2="${gX + 20}" y2="${gY - 30}" stroke="#64748b" stroke-width="1.4"/>

    <!-- إبرة المؤشر الحساسة المنحرفة -->
    <g transform="rotate(${needleAngle} ${gX} ${gY + 25})">
      <line x1="${gX}" y1="${gY + 25}" x2="${gX}" y2="${gY - 40}" stroke="${isExam ? '#000000' : '#ef4444'}" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="${gX}" cy="${gY + 25}" r="5" fill="#0f172a"/>
    </g>

    <!-- شارة الحرف G -->
    <text x="${gX}" y="${gY + 15}" font-size="16" font-weight="bold" fill="${isExam ? '#000000' : '#38bdf8'}" text-anchor="middle">G</text>
    <text x="${gX}" y="${gY + 60}" font-size="10" font-weight="bold" fill="${isExam ? '#334155' : '#94a3b8'}" text-anchor="middle">جلفانومتر ذو صفر مركزي</text>

    <!-- مربطا التوصيل السفليان -->
    <circle cx="${gX - 40}" cy="${gY + gH / 2 - 12}" r="6" fill="#0284c7" stroke="#ffffff" stroke-width="1.5"/>
    <circle cx="${gX + 40}" cy="${gY + gH / 2 - 12}" r="6" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
  </g>`;

  // التأشيرات
  if (mode !== 'none') {
    const labels: CalloutItem[] = [
      { num: 1, ar: 'مغناطيس دائم (المحرِّض)', sub: 'Bar Magnet / Inducteur', target: [magX, magY + 25], card: [240, 110] },
      { num: 2, ar: 'وشيعة نحاسية (المتحرَّض)', sub: 'Copper Coil / Induit', target: [coilX + coilW / 2, coilY + 20], card: [565, 110] },
      { num: 3, ar: 'جلفانومتر ذو صفر مركزي', sub: 'Center-Zero Galvanometer', target: [gX, gY - 10], card: [770, 90] },
      { num: 4, ar: 'خطوط الحقل المغناطيسي B⃗', sub: 'Magnetic Field Lines', target: [380, 150], card: [380, 75] },
      { num: 5, ar: 'صمامان ضوئيان متعاكسان', sub: 'Anti-Parallel LEDs', target: [ledX, ledY], card: [570, 480] },
      { num: 6, ar: 'سلكا التوصيل الكهربائي', sub: 'Connecting Wires', target: [coilX + 30, 380], card: [320, 480] },
    ];

    content += renderPhysicsCallouts(labels, mode, uid, cPointerDot, cCalloutBg, cCalloutStroke, cTextMain, cTextSub, opts?.fontFamily);
  }

  if (spec.caption) {
    content += `<text x="${W / 2}" y="${H - 15}" font-size="14" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
  }

  return wrapSvg(defs + content, W, H, spec.caption ?? 'ظاهرة التحريض الكهرومغناطيسي وإنتاج تيار كهربائي متناوب', opts);
}

// ------------------------------------------------------------
// 3. راسم الاهتزاز المهبطي (Oscilloscope Renderer)
// ------------------------------------------------------------

export function renderOscilloscope(spec: OscilloscopeSpec, opts?: RenderOptions): string {
  const signalType = spec.signalType ?? 'ac_sine';
  const sv = spec.verticalSensitivity ?? 2; // V/div
  const sh = spec.timeBase ?? 5; // ms/div
  const showCalculations = spec.showCalculations ?? true;
  const mode = spec.labelsMode ?? 'full';
  const theme = spec.theme ?? 'natural';

  const W = 960;
  const H = 540;
  const uid = Math.random().toString(36).substring(2, 8);

  const isExam = theme === 'exam_print';
  const isVibrant = theme === 'vibrant';

  const cTextMain = isExam ? '#000000' : '#0f172a';
  const cTextSub = isExam ? '#334155' : '#64748b';
  const cPointerDot = isExam ? '#000000' : '#10b981';
  const cCalloutBg = '#ffffff';
  const cCalloutStroke = isExam ? '#334155' : '#cbd5e1';

  // معالم الشاشة
  const scrX = 80;
  const scrY = 80;
  const scrW = 480;
  const scrH = 360;
  const divX = scrW / 8; // 8 مربعات أفقية
  const divY = scrH / 6; // 6 مربعات عمودية
  const centerY = scrY + scrH / 2;

  const cScreenBg = isExam ? '#f8fafc' : '#022c22';
  const cGridLine = isExam ? '#cbd5e1' : '#065f46';
  const cGridSub = isExam ? '#e2e8f0' : '#047857';
  const cWave = isExam ? '#000000' : '#34d399';
  const cWaveGlow = isExam ? '#64748b' : '#10b981';

  let defs = `<defs>
    <filter id="phy-shadow-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.18"/>
    </filter>
    <filter id="wave-glow-${uid}" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>`;

  let content = '';

  // 1. هيكل جهاز راسم الاهتزاز المهبطي (Oscilloscope Chassis)
  content += `<g class="oscillo-chassis" filter="url(#phy-shadow-${uid})">
    <rect x="50" y="40" width="860" height="440" rx="20" fill="${isExam ? '#f1f5f9' : '#0f172a'}" stroke="${isExam ? '#000000' : '#334155'}" stroke-width="3"/>
    <!-- حزام الإطار العلوي والشعار -->
    <rect x="50" y="40" width="860" height="35" rx="10" fill="${isExam ? '#cbd5e1' : '#1e293b'}"/>
    <text x="75" y="63" font-size="15" font-weight="bold" fill="${isExam ? '#000000' : '#38bdf8'}" font-family="${opts?.fontFamily ?? 'sans-serif'}">AVERROES OSCILLOSCOPE 4AM-LAB</text>
    <!-- زر التشغيل متوهج أخضر -->
    <circle cx="875" cy="58" r="8" fill="#22c55e"/>
    <circle cx="875" cy="58" r="4" fill="#ffffff" opacity="0.6"/>
  </g>`;

  // 2. شاشة التدريجات الفسفورية (Phosphor CRT Screen & Graticule)
  content += `<g class="crt-screen">
    <!-- خلفية الشاشة الداكنة المقعرة بحواف دائرية -->
    <rect x="${scrX}" y="${scrY}" width="${scrW}" height="${scrH}" rx="14" fill="${cScreenBg}" stroke="${isExam ? '#000000' : '#047857'}" stroke-width="2.5"/>

    <!-- شبكة التدريجات المربعة (Divisions Grid) 8 x 6 -->
    ${Array.from({ length: 9 }).map((_, i) => {
      const gx = scrX + i * divX;
      return `<line x1="${gx}" y1="${scrY}" x2="${gx}" y2="${scrY + scrH}" stroke="${cGridLine}" stroke-width="${i === 4 ? 1.8 : 1}" opacity="0.7"/>`;
    }).join('')}
    ${Array.from({ length: 7 }).map((_, i) => {
      const gy = scrY + i * divY;
      return `<line x1="${scrX}" y1="${gy}" x2="${scrX + scrW}" y2="${gy}" stroke="${cGridLine}" stroke-width="${i === 3 ? 1.8 : 1}" opacity="0.7"/>`;
    }).join('')}

    <!-- شُرَط التدريج الفرعية الدقيقة على المحورين المركزيين (Sub-divisions) -->
    ${Array.from({ length: 41 }).map((_, i) => {
      const sx = scrX + i * (scrW / 40);
      return `<line x1="${sx}" y1="${centerY - 3}" x2="${sx}" y2="${centerY + 3}" stroke="${cGridSub}" stroke-width="1"/>`;
    }).join('')}
    ${Array.from({ length: 31 }).map((_, i) => {
      const sy = scrY + i * (scrH / 30);
      return `<line x1="${scrX + scrW / 2 - 3}" y1="${sy}" x2="${scrX + scrW / 2 + 3}" y2="${sy}" stroke="${cGridSub}" stroke-width="1"/>`;
    }).join('')}
  </g>`;

  // 3. مسار إشارة التوتر (Waveform Signal)
  content += `<g class="crt-waveform">`;
  if (signalType === 'ac_sine') {
    const YmaxDiv = 2.5;
    const YmaxPx = YmaxDiv * divY;
    const periodDiv = 4;
    const periodPx = periodDiv * divX;

    let wavePath = `M ${scrX} ${centerY}`;
    for (let x = 0; x <= scrW; x += 3) {
      const t = (x / periodPx) * 2 * Math.PI;
      const y = centerY - Math.sin(t) * YmaxPx;
      wavePath += ` L ${scrX + x} ${y}`;
    }

    content += `<!-- هالة التوهج للإشارة -->
    <path d="${wavePath}" fill="none" stroke="${cWaveGlow}" stroke-width="5" opacity="0.4" filter="url(#wave-glow-${uid})"/>
    <path d="${wavePath}" fill="none" stroke="${cWave}" stroke-width="2.8" stroke-linecap="round"/>`;

    // أسهم القياس على الشاشة لـ Umax و T
    const arrowUmaxX = scrX + divX;
    content += `<!-- سهم قياس التوتر الأعظمي Umax -->
    <line x1="${arrowUmaxX}" y1="${centerY}" x2="${arrowUmaxX}" y2="${centerY - YmaxPx}" stroke="${isExam ? '#000000' : '#f59e0b'}" stroke-width="2.2" stroke-dasharray="4,2"/>
    <polygon points="${arrowUmaxX},${centerY - YmaxPx - 2} ${arrowUmaxX - 4},${centerY - YmaxPx + 10} ${arrowUmaxX + 4},${centerY - YmaxPx + 10}" fill="${isExam ? '#000000' : '#f59e0b'}"/>
    <text x="${arrowUmaxX + 14}" y="${centerY - YmaxPx / 2 + 4}" font-size="13" font-weight="bold" fill="${isExam ? '#000000' : '#f59e0b'}">Umax = Y × Sv</text>`;

    const arrowTY = centerY + YmaxPx + 18;
    const periodStartX = scrX;
    const periodEndX = scrX + periodPx;
    content += `<!-- سهم قياس الدور الزمني T -->
    <line x1="${periodStartX}" y1="${arrowTY}" x2="${periodEndX}" y2="${arrowTY}" stroke="${isExam ? '#000000' : '#38bdf8'}" stroke-width="2.2"/>
    <polygon points="${periodStartX},${arrowTY} ${periodStartX + 8},${arrowTY - 4} ${periodStartX + 8},${arrowTY + 4}" fill="${isExam ? '#000000' : '#38bdf8'}"/>
    <polygon points="${periodEndX},${arrowTY} ${periodEndX - 8},${arrowTY - 4} ${periodEndX - 8},${arrowTY + 4}" fill="${isExam ? '#000000' : '#38bdf8'}"/>
    <text x="${(periodStartX + periodEndX) / 2}" y="${arrowTY - 6}" font-size="13" font-weight="bold" fill="${isExam ? '#000000' : '#38bdf8'}" text-anchor="middle">T = X × Sh</text>`;
  } else if (signalType === 'dc') {
    const yDc = centerY - 2 * divY;
    content += `
    <line x1="${scrX}" y1="${yDc}" x2="${scrX + scrW}" y2="${yDc}" stroke="${cWave}" stroke-width="3" filter="url(#wave-glow-${uid})"/>
    <text x="${scrX + 30}" y="${yDc - 10}" font-size="13" font-weight="bold" fill="${cWave}">U = ثابت (تيار مستمر)</text>`;
  } else {
    let sqPath = `M ${scrX} ${centerY - divY}`;
    for (let x = 0; x < scrW; x += divX * 2) {
      sqPath += ` L ${scrX + x + divX} ${centerY - divY} L ${scrX + x + divX} ${centerY + divY} L ${scrX + x + divX * 2} ${centerY + divY} L ${scrX + x + divX * 2} ${centerY - divY}`;
    }
    content += `<path d="${sqPath}" fill="none" stroke="${cWave}" stroke-width="2.8" filter="url(#wave-glow-${uid})"/>`;
  }
  content += `</g>`;

  // 4. أزرار التحكم والعيار (Knobs) على لوحة الجهاز اليمنى
  const panelX = 600;
  const panelY = 80;

  // زر الحساسية الشاقولية Sv (Vertical Sensitivity)
  content += `<g class="knob-sv" filter="url(#phy-shadow-${uid})">
    <rect x="${panelX}" y="${panelY}" width="280" height="95" rx="12" fill="${isExam ? '#ffffff' : '#1e293b'}" stroke="${isExam ? '#cbd5e1' : '#475569'}" stroke-width="1.5"/>
    <circle cx="${panelX + 45}" cy="${panelY + 48}" r="26" fill="${isExam ? '#cbd5e1' : '#334155'}" stroke="${isExam ? '#000000' : '#f59e0b'}" stroke-width="2.5"/>
    <line x1="${panelX + 45}" y1="${panelY + 48}" x2="${panelX + 60}" y2="${panelY + 32}" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
    <text x="${panelX + 90}" y="${panelY + 38}" font-size="13" font-weight="bold" fill="${isExam ? '#000000' : '#f59e0b'}" font-family="${opts?.fontFamily ?? 'sans-serif'}">الحساسية الشاقولية (Sv)</text>
    <text x="${panelX + 90}" y="${panelY + 62}" font-size="16" font-weight="bold" fill="${isExam ? '#334155' : '#ffffff'}" font-family="${opts?.fontFamily ?? 'sans-serif'}">Sv = ${sv} V/div</text>
  </g>`;

  // زر المسح الزمني Sh (Horizontal Sweep / Time Base)
  content += `<g class="knob-sh" filter="url(#phy-shadow-${uid})">
    <rect x="${panelX}" y="${panelY + 110}" width="280" height="95" rx="12" fill="${isExam ? '#ffffff' : '#1e293b'}" stroke="${isExam ? '#cbd5e1' : '#475569'}" stroke-width="1.5"/>
    <circle cx="${panelX + 45}" cy="${panelY + 158}" r="26" fill="${isExam ? '#cbd5e1' : '#334155'}" stroke="${isExam ? '#000000' : '#38bdf8'}" stroke-width="2.5"/>
    <line x1="${panelX + 45}" y1="${panelY + 158}" x2="${panelX + 32}" y2="${panelY + 140}" stroke="#38bdf8" stroke-width="3" stroke-linecap="round"/>
    <text x="${panelX + 90}" y="${panelY + 148}" font-size="13" font-weight="bold" fill="${isExam ? '#000000' : '#38bdf8'}" font-family="${opts?.fontFamily ?? 'sans-serif'}">المسح الزمني (Sh)</text>
    <text x="${panelX + 90}" y="${panelY + 172}" font-size="16" font-weight="bold" fill="${isExam ? '#334155' : '#ffffff'}" font-family="${opts?.fontFamily ?? 'sans-serif'}">Sh = ${sh} ms/div</text>
  </g>`;

  // 5. بطاقة الحسابات الرياضية والقوانين الفيزيائية (BEM Calculations Card)
  if (showCalculations && signalType === 'ac_sine') {
    const calcY = panelY + 220;
    const umaxVal = 2.5 * sv;
    const ueffVal = (umaxVal / Math.sqrt(2)).toFixed(2);
    const tMs = 4 * sh;
    const tSec = (tMs / 1000).toFixed(3);
    const freq = Math.round(1 / (tMs / 1000));

    content += `<g class="calc-card" filter="url(#phy-shadow-${uid})">
      <rect x="${panelX}" y="${calcY}" width="280" height="135" rx="12" fill="${isExam ? '#ffffff' : '#1e293b'}" stroke="${isExam ? '#000000' : '#10b981'}" stroke-width="1.8"/>
      <text x="${panelX + 140}" y="${calcY + 24}" font-size="13" font-weight="bold" fill="${isExam ? '#000000' : '#10b981'}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">قوانين وحسابات التوتر المتناوب</text>
      <line x1="${panelX + 15}" y1="${calcY + 34}" x2="${panelX + 265}" y2="${calcY + 34}" stroke="${isExam ? '#cbd5e1' : '#334155'}" stroke-width="1"/>

      <text x="${panelX + 18}" y="${calcY + 54}" font-size="11.5" font-weight="bold" fill="${isExam ? '#000000' : '#ffffff'}" font-family="${opts?.fontFamily ?? 'sans-serif'}">1. التوتر الأعظمي: Umax = Y × Sv</text>
      <text x="${panelX + 35}" y="${calcY + 70}" font-size="11" font-weight="bold" fill="${isExam ? '#475569' : '#38bdf8'}" font-family="${opts?.fontFamily ?? 'sans-serif'}">Umax = 2.5 div × ${sv} V/div = ${umaxVal} V</text>

      <text x="${panelX + 18}" y="${calcY + 92}" font-size="11.5" font-weight="bold" fill="${isExam ? '#000000' : '#ffffff'}" font-family="${opts?.fontFamily ?? 'sans-serif'}">2. الدور والتواتر: T = X × Sh | f = 1/T</text>
      <text x="${panelX + 35}" y="${calcY + 108}" font-size="11" font-weight="bold" fill="${isExam ? '#475569' : '#38bdf8'}" font-family="${opts?.fontFamily ?? 'sans-serif'}">T = 4 div × ${sh} ms/div = ${tMs} ms = ${tSec} s</text>
      <text x="${panelX + 35}" y="${calcY + 124}" font-size="11" font-weight="bold" fill="${isExam ? '#475569' : '#10b981'}" font-family="${opts?.fontFamily ?? 'sans-serif'}">f = 1 / ${tSec} = ${freq} Hz  |  Ueff ≈ ${ueffVal} V</text>
    </g>`;
  }

  // 6. التأشيرات
  if (mode !== 'none') {
    const labels: CalloutItem[] = [
      { num: 1, ar: 'شاشة راسم الاهتزاز الفسفورية', sub: 'CRT Phosphor Graticule Screen', target: [scrX + 100, scrY + 30], card: [200, 25] },
      { num: 2, ar: 'التوتر الأعظمي Umax', sub: 'Peak Maximum Voltage', target: [scrX + divX, centerY - 150], card: [80, 210] },
      { num: 3, ar: 'الدور الزمني T لدورة كاملة', sub: 'Period / Période (T)', target: [scrX + 120, centerY + 170], card: [220, 500] },
      { num: 4, ar: 'زر الحساسية الشاقولية Sv', sub: 'Vertical Sensitivity Knob', target: [panelX + 45, panelY + 48], card: [740, 25] },
      { num: 5, ar: 'زر المسح الزمني الأفقي Sh', sub: 'Horizontal Sweep Knob', target: [panelX + 45, panelY + 158], card: [510, 500] },
      { num: 6, ar: 'مدخل الإشارة (قناة المسح)', sub: 'BNC Input Channel', target: [panelX - 50, panelY + 100], card: [470, 20] },
    ];

    content += renderPhysicsCallouts(labels, mode, uid, cPointerDot, cCalloutBg, cCalloutStroke, cTextMain, cTextSub, opts?.fontFamily);
  }

  if (spec.caption) {
    content += `<text x="${W / 2}" y="${H - 15}" font-size="14" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
  }

  return wrapSvg(defs + content, W, H, spec.caption ?? 'معاينة التوتر الكهربائي المتناوب الجيبي براسم الاهتزاز المهبطي', opts);
}

// ------------------------------------------------------------
// 4. الأمن الكهربائي والشبكة المنزلية (Electrical Safety Renderer)
// ------------------------------------------------------------

export function renderElectricalSafety(spec: ElectricalSafetySpec, opts?: RenderOptions): string {
  const scenario = spec.scenario ?? 'protected';
  const showGroundPath = spec.showGroundPath ?? true;
  const mode = spec.labelsMode ?? 'full';
  const theme = spec.theme ?? 'natural';

  const W = 960;
  const H = 540;
  const uid = Math.random().toString(36).substring(2, 8);

  const isExam = theme === 'exam_print';
  const isVibrant = theme === 'vibrant';

  const cTextMain = isExam ? '#000000' : '#0f172a';
  const cTextSub = isExam ? '#334155' : '#64748b';
  const cPointerDot = isExam ? '#000000' : '#ef4444';
  const cCalloutBg = '#ffffff';
  const cCalloutStroke = isExam ? '#334155' : '#cbd5e1';

  // ألوان الأسلاك القياسية المعيارية
  const cPhase = isExam ? '#000000' : '#dc2626';
  const cNeutral = isExam ? '#64748b' : '#2563eb';
  const cEarth = isExam ? '#94a3b8' : '#16a34a';

  let defs = `<defs>
    <filter id="phy-shadow-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000000" flood-opacity="0.18"/>
    </filter>
    <linearGradient id="washer-metal-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
  </defs>`;

  let content = '';

  // أرضية الغرفة ومستوى التربة
  content += `<g class="safety-ground-plane">
    <line x1="60" y1="450" x2="900" y2="450" stroke="${isExam ? '#94a3b8' : '#cbd5e1'}" stroke-width="3"/>
    <!-- طبقة التربة الأرضية مع وتد التأريض -->
    <rect x="730" y="450" width="160" height="40" fill="${isExam ? '#f1f5f9' : '#fef3c7'}" stroke="${isExam ? '#cbd5e1' : '#d97706'}" stroke-width="1.2"/>
    <text x="810" y="475" font-size="11" font-weight="bold" fill="${isExam ? '#475569' : '#92400e'}" text-anchor="middle">باطن الأرض (وتد التأريض)</text>
    <!-- رمز التأريض القياسي -->
    <line x1="810" y1="435" x2="810" y2="455" stroke="${cEarth}" stroke-width="3"/>
    <line x1="795" y1="455" x2="825" y2="455" stroke="${cEarth}" stroke-width="3"/>
    <line x1="800" y1="460" x2="820" y2="460" stroke="${cEarth}" stroke-width="2"/>
    <line x1="805" y1="465" x2="815" y2="465" stroke="${cEarth}" stroke-width="1.5"/>
  </g>`;

  // 1. القاطع التفاضلي العام (Differential Circuit Breaker 3D)
  const dX = 140;
  const dY = 180;
  const dW = 120;
  const dH = 190;

  content += `<g class="breaker-3d" filter="url(#phy-shadow-${uid})">
    <rect x="${dX}" y="${dY}" width="${dW}" height="${dH}" rx="10" fill="${isExam ? '#ffffff' : '#1e293b'}" stroke="${isExam ? '#000000' : '#475569'}" stroke-width="2"/>
    <!-- شريط الرأس والاسم -->
    <rect x="${dX}" y="${dY}" width="${dW}" height="28" rx="6" fill="${isExam ? '#cbd5e1' : '#0f172a'}"/>
    <text x="${dX + dW / 2}" y="${dY + 18}" font-size="11" font-weight="bold" fill="${isExam ? '#000000' : '#38bdf8'}" text-anchor="middle">قاطع تفاضلي</text>

    <!-- زر الاختبار T (Test) -->
    <circle cx="${dX + 30}" cy="${dY + 60}" r="12" fill="${isExam ? '#94a3b8' : '#f59e0b'}"/>
    <text x="${dX + 30}" y="${dY + 64}" font-size="11" font-weight="bold" fill="#ffffff" text-anchor="middle">T</text>

    <!-- ذراع القاطع (Lever) -->
    <rect x="${dX + 70}" y="${dY + 50}" width="20" height="30" rx="4" fill="${isExam ? '#475569' : '#22c55e'}"/>
    <text x="${dX + 80}" y="${dY + 70}" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">I</text>

    <!-- الحساسية التفاضلية -->
    <text x="${dX + dW / 2}" y="${dY + 115}" font-size="11" font-weight="bold" fill="${isExam ? '#000000' : '#f87171'}" text-anchor="middle">IΔn = 30mA</text>
    <text x="${dX + dW / 2}" y="${dY + 135}" font-size="10" font-weight="bold" fill="${isExam ? '#475569' : '#94a3b8'}" text-anchor="middle">230V ~ 50Hz</text>

    <!-- مرابط الطور والحيادي العلوية والسفلية -->
    <circle cx="${dX + 35}" cy="${dY + 8}" r="5" fill="${cPhase}"/>
    <circle cx="${dX + 85}" cy="${dY + 8}" r="5" fill="${cNeutral}"/>
    <circle cx="${dX + 35}" cy="${dY + dH - 8}" r="5" fill="${cPhase}"/>
    <circle cx="${dX + 85}" cy="${dY + dH - 8}" r="5" fill="${cNeutral}"/>
  </g>`;

  // خطوط الشبكة المغذية من اليسار
  content += `<g class="mains-supply">
    <line x1="40" y1="${dY + 8}" x2="${dX + 35}" y2="${dY + 8}" stroke="${cPhase}" stroke-width="3.5"/>
    <text x="60" y="${dY - 2}" font-size="13" font-weight="bold" fill="${cPhase}">الطور P (230V)</text>

    <line x1="40" y1="${dY + 22}" x2="${dX + 85}" y2="${dY + 22}" stroke="${cNeutral}" stroke-width="3.5"/>
    <line x1="${dX + 85}" y1="${dY + 22}" x2="${dX + 85}" y2="${dY + 8}" stroke="${cNeutral}" stroke-width="3.5"/>
    <text x="60" y="${dY + 38}" font-size="13" font-weight="bold" fill="${cNeutral}">الحيادي N (0V)</text>
  </g>`;

  // 2. الفاصمة (Fuse) والقاطعة على سلك الطور
  const fuseX = 350;
  const fuseY = dY + dH - 8;

  content += `<g class="fuse-and-switch">
    <!-- سلك الطور الممتد من أسفل القاطع -->
    <line x1="${dX + 35}" y1="${fuseY}" x2="${fuseX - 35}" y2="${fuseY}" stroke="${cPhase}" stroke-width="3.5"/>

    <!-- الفاصمة (Fuse) الأسطوانية الزجاجية -->
    <rect x="${fuseX - 35}" y="${fuseY - 10}" width="70" height="20" rx="5" fill="#ffffff" stroke="${isExam ? '#000000' : '#475569'}" stroke-width="1.8" filter="url(#phy-shadow-${uid})"/>
    <rect x="${fuseX - 35}" y="${fuseY - 10}" width="12" height="20" rx="2" fill="#94a3b8"/>
    <rect x="${fuseX + 23}" y="${fuseY - 10}" width="12" height="20" rx="2" fill="#94a3b8"/>
    <line x1="${fuseX - 23}" y1="${fuseY}" x2="${fuseX + 23}" y2="${fuseY}" stroke="${isExam ? '#000000' : '#e11d48'}" stroke-width="2"/>
    <text x="${fuseX}" y="${fuseY - 15}" font-size="11" font-weight="bold" fill="${cPhase}" text-anchor="middle">فاصمة (16A)</text>

    <!-- القاطعة البسيطة على سلك الطور -->
    <line x1="${fuseX + 35}" y1="${fuseY}" x2="${fuseX + 75}" y2="${fuseY}" stroke="${cPhase}" stroke-width="3.5"/>
    <circle cx="${fuseX + 75}" cy="${fuseY}" r="4" fill="#0f172a"/>
    <line x1="${fuseX + 75}" y1="${fuseY}" x2="${fuseX + 105}" y2="${fuseY - 14}" stroke="${cPhase}" stroke-width="3.5"/>
    <circle cx="${fuseX + 110}" cy="${fuseY}" r="4" fill="#0f172a"/>
    <text x="${fuseX + 90}" y="${fuseY - 22}" font-size="11" font-weight="bold" fill="${cPhase}" text-anchor="middle">قاطعة (K)</text>

    <!-- متابعة سلك الطور نحو الجهاز -->
    <line x1="${fuseX + 110}" y1="${fuseY}" x2="550" y2="${fuseY}" stroke="${cPhase}" stroke-width="3.5"/>

    <!-- سلك الحيادي الممتد مباشرة نحو الجهاز دون فاصمة -->
    <line x1="${dX + 85}" y1="${dY + dH - 8}" x2="${dX + 85}" y2="${fuseY + 45}" stroke="${cNeutral}" stroke-width="3.5"/>
    <line x1="${dX + 85}" y1="${fuseY + 45}" x2="550" y2="${fuseY + 45}" stroke="${cNeutral}" stroke-width="3.5"/>
  </g>`;

  // 3. الجهاز الكهرومنزلي المجسم (غسالة ملابس Washing Machine 3D)
  const wX = 560;
  const wY = 170;
  const wW = 180;
  const wH = 220;

  content += `<g class="washing-machine" filter="url(#phy-shadow-${uid})">
    <!-- هيكل الغسالة المعدني المجسم -->
    <rect x="${wX}" y="${wY}" width="${wW}" height="${wH}" rx="14" fill="url(#washer-metal-${uid})" stroke="${isExam ? '#000000' : '#475569'}" stroke-width="2.5"/>

    <!-- لوحة التحكم والأزرار -->
    <rect x="${wX + 10}" y="${wY + 12}" width="${wW - 20}" height="32" rx="6" fill="${isExam ? '#e2e8f0' : '#1e293b'}"/>
    <circle cx="${wX + 35}" cy="${wY + 28}" r="9" fill="${isExam ? '#94a3b8' : '#38bdf8'}"/>
    <rect x="${wX + 60}" y="${wY + 23}" width="40" height="10" rx="3" fill="#22c55e"/>

    <!-- باب الحوض الزجاجي الدائري 3D -->
    <circle cx="${wX + wW / 2}" cy="${wY + 125}" r="55" fill="${isExam ? '#cbd5e1' : '#334155'}" stroke="${isExam ? '#000000' : '#64748b'}" stroke-width="3"/>
    <circle cx="${wX + wW / 2}" cy="${wY + 125}" r="45" fill="${isExam ? '#f1f5f9' : '#0284c7'}" opacity="0.3"/>
    <ellipse cx="${wX + wW / 2 - 10}" cy="${wY + 115}" rx="30" ry="18" fill="#ffffff" opacity="0.4"/>

    <!-- محرك الغسالة الداخلي وتوصيل الأسلاك -->
    <rect x="${wX + 25}" y="${wY + 160}" width="50" height="30" rx="4" fill="${isExam ? '#94a3b8' : '#475569'}"/>
    <text x="${wX + 50}" y="${wY + 180}" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">محرك M</text>
  </g>`;

  // 4. توصيلات سلك الطور وسلك الحيادي بالمحرك
  content += `<g class="appliance-internal-wiring">
    <line x1="550" y1="${fuseY}" x2="${wX + 35}" y2="${fuseY}" stroke="${cPhase}" stroke-width="3"/>
    <line x1="${wX + 35}" y1="${fuseY}" x2="${wX + 35}" y2="${wY + 160}" stroke="${cPhase}" stroke-width="3"/>

    <line x1="550" y1="${fuseY + 45}" x2="${wX + 60}" y2="${fuseY + 45}" stroke="${cNeutral}" stroke-width="3"/>
    <line x1="${wX + 60}" y1="${fuseY + 45}" x2="${wX + 60}" y2="${wY + 160}" stroke="${cNeutral}" stroke-width="3"/>

    ${scenario !== 'normal' ? `
      <!-- سلك طور معرى يلامس الهيكل المعدني للغسالة (Fault Leakage) -->
      <path d="M ${wX + 35} ${wY + 140} L ${wX} ${wY + 140}" stroke="#ef4444" stroke-width="3.5" stroke-dasharray="3,2"/>
      <polygon points="${wX},${wY + 140} ${wX + 8},${wY + 134} ${wX + 8},${wY + 146}" fill="#ef4444"/>
      <circle cx="${wX}" cy="${wY + 140}" r="6" fill="#fbbf24"/>
      <text x="${wX - 8}" y="${wY + 130}" font-size="10" font-weight="bold" fill="#ef4444" text-anchor="end">ملامسة الطور للهيكل!</text>
    ` : ''}
  </g>`;

  // 5. سلك التأريض الواقي (Earth Ground Wire T)
  if (showGroundPath && scenario !== 'danger') {
    content += `<g class="ground-protection-path">
      <path d="M ${wX + wW - 20} ${wY + 200} L ${wX + wW + 40} ${wY + 200} L ${wX + wW + 40} 445 L 810 445 L 810 455" fill="none" stroke="${cEarth}" stroke-width="3.5" stroke-dasharray="6,3"/>
      <circle cx="${wX + wW - 20}" cy="${wY + 200}" r="5" fill="${cEarth}"/>
      <polygon points="${wX + wW + 40},300 ${wX + wW + 36},285 ${wX + wW + 44},285" fill="${cEarth}"/>
      <polygon points="780,445 770,441 770,449" fill="${cEarth}"/>
      <text x="${wX + wW + 45}" y="320" font-size="10.5" font-weight="bold" fill="${cEarth}">تسرب التيار للأرض (Id)</text>
    </g>`;
  }

  // 6. شخص يلمس الهيكل (Person Touching Chassis)
  const pX = 810;
  const pY = 250;
  content += `<g class="person-touching">
    <circle cx="${pX}" cy="${pY}" r="18" fill="${isExam ? '#cbd5e1' : '#fde047'}" stroke="${isExam ? '#000000' : '#475569'}" stroke-width="2"/>
    <line x1="${pX}" y1="${pY + 18}" x2="${pX}" y2="${pY + 100}" stroke="${isExam ? '#000000' : '#334155'}" stroke-width="3.5"/>
    <line x1="${pX}" y1="${pY + 40}" x2="${wX + wW}" y2="${wY + 120}" stroke="${isExam ? '#000000' : '#334155'}" stroke-width="3"/>
    <line x1="${pX}" y1="${pY + 100}" x2="${pX - 25}" y2="450" stroke="${isExam ? '#000000' : '#334155'}" stroke-width="3.5"/>
    <line x1="${pX}" y1="${pY + 100}" x2="${pX + 25}" y2="450" stroke="${isExam ? '#000000' : '#334155'}" stroke-width="3.5"/>

    ${scenario === 'protected' ? `
      <rect x="${pX - 50}" y="${pY - 50}" width="120" height="28" rx="6" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
      <text x="${pX + 10}" y="${pY - 32}" font-size="11" font-weight="bold" fill="#15803d" text-anchor="middle">محمي من الصعق ✓</text>
    ` : (scenario === 'danger' ? `
      <rect x="${pX - 55}" y="${pY - 55}" width="130" height="32" rx="6" fill="#fee2e2" stroke="#dc2626" stroke-width="1.8"/>
      <text x="${pX + 10}" y="${pY - 34}" font-size="11.5" font-weight="bold" fill="#b91c1c" text-anchor="middle">خطر الصعق الكهربائي ⚠</text>
    ` : '')}
  </g>`;

  // 7. التأشيرات
  if (mode !== 'none') {
    const labels: CalloutItem[] = [
      { num: 1, ar: 'سلك الطور (Phase - P)', sub: 'Live Phase Wire (230V)', target: [100, dY + 8], card: [100, 80] },
      { num: 2, ar: 'سلك الحيادي (Neutral - N)', sub: 'Neutral Wire (0V)', target: [100, dY + 22], card: [100, 130] },
      { num: 3, ar: 'القاطع التفاضلي العام', sub: 'Differential Circuit Breaker', target: [dX + dW / 2, dY + 50], card: [200, 420] },
      { num: 4, ar: 'الفاصمة مركبة على الطور', sub: 'Fuse on Phase Wire', target: [fuseX, fuseY], card: [350, 480] },
      { num: 5, ar: 'القاطعة مركبة على الطور', sub: 'Switch on Phase Wire', target: [fuseX + 90, fuseY], card: [480, 80] },
      { num: 6, ar: 'سلك ومأخذ التأريض الواقي', sub: 'Protective Earth Ground (T)', target: [810, 445], card: [690, 500] },
      { num: 7, ar: 'هيكل معدني مؤرّض للغسالة', sub: 'Grounded Metallic Chassis', target: [wX + wW / 2, wY + 50], card: [650, 80] },
    ];

    content += renderPhysicsCallouts(labels, mode, uid, cPointerDot, cCalloutBg, cCalloutStroke, cTextMain, cTextSub, opts?.fontFamily);
  }

  if (spec.caption) {
    content += `<text x="${W / 2}" y="${H - 15}" font-size="14" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
  }

  return wrapSvg(defs + content, W, H, spec.caption ?? 'مخطط الأمن الكهربائي وقواعد الحماية في الشبكة المنزلية', opts);
}

// ------------------------------------------------------------
// 5. الدارة الكهربائية التجريبية المجسمة 3D (Circuit 3D Renderer)
// ------------------------------------------------------------

export function renderCircuit3D(spec: Circuit3dSpec, opts?: RenderOptions): string {
  const switchState = spec.switchState ?? 'closed';
  const circuitType = spec.circuitType ?? 'simple';
  const showCurrentFlow = spec.showCurrentFlow ?? true;
  const mode = spec.labelsMode ?? 'full';
  const theme = spec.theme ?? 'natural';

  const W = 960;
  const H = 540;
  const uid = Math.random().toString(36).substring(2, 8);

  const isExam = theme === 'exam_print';
  const isVibrant = theme === 'vibrant';

  const cTextMain = isExam ? '#000000' : '#0f172a';
  const cTextSub = isExam ? '#334155' : '#64748b';
  const cPointerDot = isExam ? '#000000' : '#f59e0b';
  const cCalloutBg = '#ffffff';
  const cCalloutStroke = isExam ? '#334155' : '#cbd5e1';

  const isClosed = switchState === 'closed';

  let defs = `<defs>
    <filter id="phy-shadow-${uid}" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#000000" flood-opacity="0.18"/>
    </filter>
    <filter id="bulb-glow-${uid}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="15" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <linearGradient id="battery-body-${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${isExam ? '#cbd5e1' : '#1e3a8a'}"/>
      <stop offset="50%" stop-color="${isExam ? '#94a3b8' : '#1e40af'}"/>
      <stop offset="100%" stop-color="${isExam ? '#475569' : '#0f172a'}"/>
    </linearGradient>
    <linearGradient id="brass-strip-${uid}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="50%" stop-color="#fde047"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>`;

  let content = '';

  // 1. لوحة التجارب الخشبية المخبرية 3D (Wooden Workbench)
  content += `<g class="workbench" filter="url(#phy-shadow-${uid})">
    <polygon points="100,430 860,430 820,130 140,130" fill="${isExam ? '#f1f5f9' : '#f8fafc'}" stroke="${isExam ? '#cbd5e1' : '#e2e8f0'}" stroke-width="2"/>
    <polygon points="100,430 860,430 860,448 100,448" fill="${isExam ? '#cbd5e1' : '#cbd5e1'}"/>
  </g>`;

  // 2. بطارية أعمدة مسطحة 4.5V واقعية (Flat Battery 4.5V 3R12)
  const bX = 220;
  const bY = 220;
  const bW = 120;
  const bH = 140;

  content += `<g class="battery-4v5" filter="url(#phy-shadow-${uid})">
    <!-- علبة البطارية المنشورية المتوازية 3D -->
    <rect x="${bX}" y="${bY}" width="${bW}" height="${bH}" rx="8" fill="url(#battery-body-${uid})" stroke="${isExam ? '#000000' : '#1d4ed8'}" stroke-width="2"/>
    <!-- ملصق البطارية والجهد 4.5V -->
    <rect x="${bX + 10}" y="${bY + 25}" width="${bW - 20}" height="70" rx="6" fill="${isExam ? '#ffffff' : '#f59e0b'}"/>
    <text x="${bX + bW / 2}" y="${bY + 58}" font-size="22" font-weight="bold" fill="${isExam ? '#000000' : '#0f172a'}" text-anchor="middle">4.5V</text>
    <text x="${bX + bW / 2}" y="${bY + 80}" font-size="10" font-weight="bold" fill="${isExam ? '#475569' : '#78350f'}" text-anchor="middle">عمود كهربائي مسطح 3R12</text>

    <!-- النصلتان المعدنيتان المرنتان (Brass Strips) -->
    <!-- نصلة القطب السالب (-) طويلة -->
    <path d="M ${bX + 25} ${bY} L ${bX + 25} ${bY - 55} Q ${bX + 25} ${bY - 65} ${bX + 38} ${bY - 65}" fill="none" stroke="url(#brass-strip-${uid})" stroke-width="7" stroke-linecap="round"/>
    <text x="${bX + 12}" y="${bY - 45}" font-size="16" font-weight="bold" fill="${isExam ? '#000000' : '#38bdf8'}">—</text>

    <!-- نصلة القطب الموجب (+) قصيرة -->
    <path d="M ${bX + bW - 25} ${bY} L ${bX + bW - 25} ${bY - 35} Q ${bX + bW - 25} ${bY - 45} ${bX + bW - 12} ${bY - 45}" fill="none" stroke="url(#brass-strip-${uid})" stroke-width="7" stroke-linecap="round"/>
    <text x="${bX + bW - 38}" y="${bY - 30}" font-size="16" font-weight="bold" fill="${isExam ? '#000000' : '#ef4444'}">+</text>
  </g>`;

  // 3. قاطعة سكين نحاسية 3D (Knife Switch)
  const swX = 490;
  const swY = 320;
  const swW = 110;
  const swH = 50;

  content += `<g class="knife-switch" filter="url(#phy-shadow-${uid})">
    <rect x="${swX}" y="${swY}" width="${swW}" height="${swH}" rx="6" fill="${isExam ? '#e2e8f0' : '#f1f5f9'}" stroke="${isExam ? '#000000' : '#94a3b8'}" stroke-width="2"/>
    <circle cx="${swX + 20}" cy="${swY + swH / 2}" r="8" fill="url(#brass-strip-${uid})" stroke="#b45309" stroke-width="1.5"/>
    <circle cx="${swX + swW - 20}" cy="${swY + swH / 2}" r="8" fill="url(#brass-strip-${uid})" stroke="#b45309" stroke-width="1.5"/>

    ${isClosed ? `
      <line x1="${swX + 20}" y1="${swY + swH / 2}" x2="${swX + swW - 20}" y2="${swY + swH / 2}" stroke="url(#brass-strip-${uid})" stroke-width="6" stroke-linecap="round"/>
      <circle cx="${swX + swW - 15}" cy="${swY + swH / 2}" r="7" fill="#0f172a"/>
    ` : `
      <line x1="${swX + 20}" y1="${swY + swH / 2}" x2="${swX + swW - 35}" y2="${swY - 18}" stroke="url(#brass-strip-${uid})" stroke-width="6" stroke-linecap="round"/>
      <circle cx="${swX + swW - 30}" cy="${swY - 22}" r="8" fill="#0f172a"/>
    `}
  </g>`;

  // 4. مصباح التوهج وقاعدته 3D (Incandescent Lamp)
  const lpX = 720;
  const lpY = 230;

  content += `<g class="light-bulb" filter="url(#phy-shadow-${uid})">
    ${isClosed && !isExam ? `
      <circle cx="${lpX}" cy="${lpY - 35}" r="75" fill="#fef08a" opacity="0.45" filter="url(#bulb-glow-${uid})"/>
      <circle cx="${lpX}" cy="${lpY - 35}" r="45" fill="#fde047" opacity="0.65"/>
    ` : ''}

    <polygon points="${lpX - 35},${lpY + 50} ${lpX + 35},${lpY + 50} ${lpX + 25},${lpY + 15} ${lpX - 25},${lpY + 15}" fill="${isExam ? '#94a3b8' : '#334155'}" stroke="${isExam ? '#000000' : '#1e293b'}" stroke-width="2"/>
    <rect x="${lpX - 16}" y="${lpY}" width="32" height="20" fill="url(#brass-strip-${uid})" stroke="#b45309" stroke-width="1.2"/>
    <line x1="${lpX - 16}" y1="${lpY + 6}" x2="${lpX + 16}" y2="${lpY + 6}" stroke="#78350f" stroke-width="1.8"/>
    <line x1="${lpX - 16}" y1="${lpY + 13}" x2="${lpX + 16}" y2="${lpY + 13}" stroke="#78350f" stroke-width="1.8"/>

    <circle cx="${lpX}" cy="${lpY - 35}" r="36" fill="${isClosed ? (isExam ? '#ffffff' : '#fef9c3') : '#f8fafc'}" stroke="${isExam ? '#000000' : '#94a3b8'}" stroke-width="2" fill-opacity="${isClosed ? '0.9' : '0.5'}"/>
    <path d="M ${lpX - 24} ${lpY - 50} Q ${lpX - 14} ${lpY - 65} ${lpX + 10} ${lpY - 60}" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.75"/>

    <path d="M ${lpX - 10} ${lpY} L ${lpX - 8} ${lpY - 30} L ${lpX + 8} ${lpY - 30} L ${lpX + 10} ${lpY}" fill="none" stroke="${isClosed ? (isExam ? '#000000' : '#f97316') : '#64748b'}" stroke-width="${isClosed ? 3 : 1.5}"/>
    ${isClosed ? `
      <circle cx="${lpX}" cy="${lpY - 30}" r="7" fill="${isExam ? '#000000' : '#ffffff'}"/>
    ` : ''}

    <circle cx="${lpX - 30}" cy="${lpY + 45}" r="6" fill="#f59e0b" stroke="#000000" stroke-width="1"/>
    <circle cx="${lpX + 30}" cy="${lpY + 45}" r="6" fill="#f59e0b" stroke="#000000" stroke-width="1"/>
  </g>`;

  // 5. أسلاك التوصيل المخبرية المرنة مع المشابك التمساحية (Alligator Clips)
  content += `<g class="wires-and-clips">
    <path d="M ${bX + bW - 12} ${bY - 45} Q ${bX + bW + 80} ${bY - 10} ${swX + 20} ${swY + swH / 2}" fill="none" stroke="${isExam ? '#000000' : '#ef4444'}" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M ${swX + swW - 20} ${swY + swH / 2} Q ${swX + swW + 50} ${swY + 40} ${lpX - 30} ${lpY + 45}" fill="none" stroke="${isExam ? '#475569' : '#0f172a'}" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M ${lpX + 30} ${lpY + 45} Q ${lpX + 90} 400 500 420 Q 200 420 ${bX + 38} ${bY - 65}" fill="none" stroke="${isExam ? '#64748b' : '#2563eb'}" stroke-width="4.5" stroke-linecap="round"/>

    <rect x="${bX + bW - 16}" y="${bY - 52}" width="16" height="12" rx="3" fill="#64748b"/>
    <rect x="${bX + 30}" y="${bY - 72}" width="16" height="12" rx="3" fill="#64748b"/>
    <rect x="${swX + 12}" y="${swY + swH / 2 - 6}" width="16" height="12" rx="3" fill="#64748b"/>
    <rect x="${swX + swW - 28}" y="${swY + swH / 2 - 6}" width="16" height="12" rx="3" fill="#64748b"/>
  </g>`;

  // 6. أسهم اتجاه التيار الاصطلاحي (Conventional Current Flow I: + -> -)
  if (showCurrentFlow && isClosed) {
    const cArrow = isExam ? '#000000' : '#f59e0b';
    content += `<g class="current-flow-arrows">
      <polygon points="${swX - 45},${swY - 20} ${swX - 30},${swY - 14} ${swX - 40},${swY - 6}" fill="${cArrow}"/>
      <polygon points="${lpX - 85},${lpY + 70} ${lpX - 70},${lpY + 62} ${lpX - 75},${lpY + 52}" fill="${cArrow}"/>
      <polygon points="460,420 440,425 440,415" fill="${cArrow}"/>
      <text x="450" y="445" font-size="12" font-weight="bold" fill="${cArrow}" text-anchor="middle">جهة التيار الاصطلاحي I (من + إلى —)</text>
    </g>`;
  }

  // 7. التأشيرات
  if (mode !== 'none') {
    const labels: CalloutItem[] = [
      { num: 1, ar: 'عمود كهربائي مسطح 4.5V', sub: 'Flat Battery 4.5V / Pile', target: [bX + bW / 2, bY + 30], card: [200, 110] },
      { num: 2, ar: 'قاطعة سكين نحاسية', sub: 'Knife Switch / Interrupteur', target: [swX + swW / 2, swY + swH / 2], card: [500, 480] },
      { num: 3, ar: isClosed ? 'مصباح توهج مضيء' : 'مصباح توهج منطفئ', sub: 'Incandescent Bulb / Lampe', target: [lpX, lpY - 35], card: [840, 150] },
      { num: 4, ar: 'أسلاك توصيل بمشابك تمساح', sub: 'Wires & Alligator Clips', target: [380, 240], card: [380, 80] },
      { num: 5, ar: 'سلك التنجستن المتوهج', sub: 'Glowing Tungsten Filament', target: [lpX, lpY - 30], card: [720, 80] },
      { num: 6, ar: 'اتجاه التيار الاصطلاحي', sub: 'Conventional Current (I)', target: [450, 420], card: [260, 480] },
    ];

    content += renderPhysicsCallouts(labels, mode, uid, cPointerDot, cCalloutBg, cCalloutStroke, cTextMain, cTextSub, opts?.fontFamily);
  }

  if (spec.caption) {
    content += `<text x="${W / 2}" y="${H - 15}" font-size="14" font-weight="bold" fill="${cTextMain}" text-anchor="middle" font-family="${opts?.fontFamily ?? 'sans-serif'}">${esc(spec.caption)}</text>`;
  }

  return wrapSvg(defs + content, W, H, spec.caption ?? 'دارة كهربائية مخبرية بسيطة مجسمة ثلاثية الأبعاد', opts);
}

// ------------------------------------------------------------
// المُوزِّع العام لمولّد العلوم الفيزيائية (Physics Generator Dispatcher)
// ------------------------------------------------------------

export function renderPhysics(spec: PhysicsSpec, opts?: RenderOptions): string {
  try {
    if (spec.kind === 'electrostatics') {
      return renderElectrostatics(spec, opts);
    }
    if (spec.kind === 'electromagnetic_induction') {
      return renderInduction(spec, opts);
    }
    if (spec.kind === 'oscilloscope') {
      return renderOscilloscope(spec, opts);
    }
    if (spec.kind === 'electrical_safety') {
      return renderElectricalSafety(spec, opts);
    }
    if (spec.kind === 'circuit_3d') {
      return renderCircuit3D(spec, opts);
    }
  } catch {
    // مبدأ "لا يرمي أبداً"
  }
  return '';
}
