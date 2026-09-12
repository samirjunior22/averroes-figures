// ============================================================
// lab/catalog — فهرس كائنات المخبر: المادة، التسميات، الحقول، الأشكال الجاهزة
// ============================================================
// **المصدر الوحيد** الذي تشتقّ منه واجهة السبورة أزرار الإدراج وحقول
// لوحة التخصيص. قائمة واحدة هنا بدل ثلاث قوائم متباعدة (presets / fields /
// options) في العميل — نسيان إحداها كان يُنتج كائناً يُدرَج ولا يُخصَّص.
// بيانات لا كود: لا React ولا منطق رسم.
// ============================================================

export type LabSubject = 'physics' | 'chemistry' | 'science';

export interface LabFieldOption {
  value: string;
  ar: string;
}

export interface LabField {
  key: string;
  ar: string;
  type: 'number' | 'text' | 'select' | 'boolean';
  options?: LabFieldOption[];
  min?: number;
  max?: number;
  step?: number;
}

export interface LabPreset {
  id: string;
  ar: string;
  fr: string;
  icon: string;
  /** يُخالف مادة الـkind (مثل المحرار: كيمياء وعلوم معاً). */
  subject?: LabSubject;
  spec: Record<string, unknown>;
}

export interface LabCatalogEntry {
  kind: string;
  subject: LabSubject;
  ar: string;
  fr: string;
  icon: string;
  fields: LabField[];
  presets: LabPreset[];
}

const num = (key: string, ar: string, extra: Partial<LabField> = {}): LabField => ({ key, ar, type: 'number', ...extra });
const txt = (key: string, ar: string): LabField => ({ key, ar, type: 'text' });
const bool = (key: string, ar: string): LabField => ({ key, ar, type: 'boolean' });
const sel = (key: string, ar: string, options: LabFieldOption[]): LabField => ({ key, ar, type: 'select', options });
const p = (id: string, ar: string, fr: string, icon: string, spec: Record<string, unknown>, subject?: LabSubject): LabPreset =>
  subject ? { id, ar, fr, icon, subject, spec } : { id, ar, fr, icon, spec };

const LABEL = txt('label', 'التسمية');

export const LAB_CATALOG: LabCatalogEntry[] = [
  // ── فيزياء ────────────────────────────────────────────────
  {
    kind: 'battery', subject: 'physics', ar: 'بطارية', fr: 'Pile', icon: '🔋',
    fields: [num('voltage', 'التوتر (V)', { min: 0.1, max: 1000, step: 0.5 }), LABEL],
    presets: [p('lab-battery', 'بطارية واقعية', 'Pile réaliste', '🔋', { voltage: 1.5, label: 'E' })],
  },
  {
    kind: 'resistor', subject: 'physics', ar: 'مقاومة', fr: 'Résistance', icon: '⏛',
    fields: [num('value', 'القيمة (Ω)', { min: 0 }), LABEL],
    presets: [p('lab-resistor', 'مقاومة / ناقل أومي (R)', 'Résistance (R)', '⏛', { value: 10, label: 'R' })],
  },
  {
    kind: 'switch', subject: 'physics', ar: 'قاطعة', fr: 'Interrupteur', icon: '🔀',
    fields: [LABEL, bool('closed', 'مغلقة')],
    presets: [p('lab-switch', 'قاطعة كهربائية (K)', 'Interrupteur (K)', '🔀', { label: 'K', closed: false })],
  },
  {
    kind: 'lamp', subject: 'physics', ar: 'مصباح', fr: 'Lampe', icon: '💡',
    fields: [LABEL, bool('on', 'مضاء')],
    presets: [p('lab-lamp', 'مصباح كهربائي (L)', 'Lampe (L)', '💡', { label: 'L', on: true })],
  },
  {
    kind: 'meter', subject: 'physics', ar: 'مقياس', fr: 'Appareil de mesure', icon: '🎛️',
    fields: [
      sel('type', 'النوع', [{ value: 'ammeter', ar: 'أمبيرمتر (A)' }, { value: 'voltmeter', ar: 'فولطمتر (V)' }]),
      num('reading', 'القراءة', { min: 0, step: 0.1 }),
      LABEL,
    ],
    presets: [
      p('lab-ammeter', 'مقياس الأمبير (A)', 'Ampèremètre (A)', '🅰️', { type: 'ammeter', reading: 1.2 }),
      p('lab-voltmeter', 'مقياس الفولط (V)', 'Voltmètre (V)', '🆚', { type: 'voltmeter', reading: 12 }),
    ],
  },
  {
    kind: 'wire', subject: 'physics', ar: 'سلك', fr: 'Fil', icon: '〰️',
    fields: [LABEL],
    presets: [p('lab-wire', 'سلك كهربائي', 'Fil électrique', '〰️', {})],
  },
  {
    kind: 'body', subject: 'physics', ar: 'جسم / كتلة', fr: 'Corps / masse', icon: '📦',
    fields: [
      num('value', 'الكتلة', { min: 0 }),
      txt('unit', 'الوحدة'),
      sel('shape', 'الشكل', [{ value: 'box', ar: 'صندوق' }, { value: 'sphere', ar: 'كرة' }, { value: 'cylinder', ar: 'أسطوانة' }]),
      LABEL,
      num('velocity', 'السرعة (m/s) — اتركه فارغاً لجسم ساكن', { min: 0, step: 0.5 }),
    ],
    presets: [
      p('lab-mass', 'الكتلة (m)', 'Masse (m)', '📦', { value: 200, unit: 'g', shape: 'box', label: 'm' }),
      p('lab-moving-body', 'جسم متحرك', 'Corps en mouvement', '🏃', { value: 2, unit: 'kg', shape: 'sphere', label: 'm', velocity: 3 }),
    ],
  },
  {
    kind: 'vector', subject: 'physics', ar: 'شعاع', fr: 'Vecteur', icon: '➡️',
    fields: [
      sel('role', 'الدور', [
        { value: 'force', ar: 'قوة (F)' }, { value: 'weight', ar: 'ثقل (P)' }, { value: 'normal', ar: 'رد فعل السطح (R)' },
        { value: 'velocity', ar: 'سرعة (v)' }, { value: 'acceleration', ar: 'تسارع (a)' }, { value: 'resultant', ar: 'محصلة القوى (ΣF)' },
        { value: 'tension', ar: 'توتر الخيط (T)' }, { value: 'friction', ar: 'احتكاك (f)' },
      ]),
      LABEL,
      num('value', 'الشدّة', { min: 0, step: 0.5 }),
      txt('unit', 'الوحدة'),
      num('angle', 'الزاوية (°)', { min: -360, max: 360, step: 15 }),
      num('length', 'الطول (px)', { min: 30, max: 400, step: 10 }),
    ],
    presets: [
      p('lab-vec-force', 'شعاع القوة (F)', 'Vecteur force (F)', '➡️', { role: 'force', value: 5 }),
      p('lab-vec-weight', 'قوة الثقل (P)', 'Poids (P)', '⬇️', { role: 'weight', value: 10 }),
      p('lab-vec-normal', 'رد الفعل السطحي (R)', 'Réaction (R)', '⬆️', { role: 'normal', value: 10 }),
      p('lab-vec-velocity', 'شعاع السرعة (v)', 'Vecteur vitesse (v)', '💨', { role: 'velocity', value: 3 }),
      p('lab-vec-accel', 'شعاع التسارع (a)', 'Vecteur accélération (a)', '⏩', { role: 'acceleration', value: 2 }),
      p('lab-vec-resultant', 'محصلة القوى (ΣF)', 'Résultante (ΣF)', '🎯', { role: 'resultant', value: 0 }),
    ],
  },
  {
    kind: 'charged_sphere', subject: 'physics', ar: 'كرة مكهربة', fr: 'Sphère chargée', icon: '⚡',
    fields: [
      sel('charge', 'الشحنة', [{ value: 'positive', ar: 'موجبة (+)' }, { value: 'negative', ar: 'سالبة (−)' }, { value: 'neutral', ar: 'معتدلة' }]),
      num('count', 'عدد الشحنات', { min: 1, max: 12, step: 1 }),
      LABEL,
    ],
    presets: [p('lab-charged-sphere', 'كرة مكهربة', 'Sphère chargée', '⚡', { charge: 'negative', count: 6 })],
  },
  {
    kind: 'wave', subject: 'physics', ar: 'موجة', fr: 'Onde', icon: '🌊',
    fields: [
      sel('type', 'النوع', [{ value: 'general', ar: 'عامة' }, { value: 'transverse', ar: 'عرضية' }, { value: 'longitudinal', ar: 'طولية' }]),
      num('amplitude', 'السعة (px)', { min: 5, max: 60, step: 5 }),
      num('wavelength', 'طول الموجة (px)', { min: 30, max: 200, step: 10 }),
      num('cycles', 'عدد الدورات', { min: 1, max: 8, step: 1 }),
      bool('showLabels', 'إظهار التسميات'),
    ],
    presets: [
      p('lab-wave', 'موجة عامة', 'Onde', '🌊', { type: 'general' }),
      p('lab-wave-transverse', 'موجة عرضية', 'Onde transversale', '〽️', { type: 'transverse', showLabels: true }),
      p('lab-wave-longitudinal', 'موجة طولية', 'Onde longitudinale', '🪗', { type: 'longitudinal', showLabels: true }),
    ],
  },

  // ── كيمياء ────────────────────────────────────────────────
  {
    kind: 'atom', subject: 'chemistry', ar: 'ذرّة', fr: 'Atome', icon: '⚛️',
    fields: [
      num('Z', 'العدد الذرّي Z (البروتونات)', { min: 1, max: 118, step: 1 }),
      num('A', 'العدد الكتلي A (النويّات)', { min: 1, max: 300, step: 1 }),
      txt('symbol', 'الرمز الكيميائي'),
      txt('name', 'اسم العنصر'),
      bool('showShells', 'إظهار المدارات (K, L, M)'),
    ],
    presets: [p('lab-atom', 'ذرّة (نموذج رذرفورد)', 'Atome (Rutherford)', '⚛️', { Z: 6, A: 12, showShells: true })],
  },
  {
    kind: 'element_card', subject: 'chemistry', ar: 'بطاقة عنصر', fr: 'Fiche élément', icon: '🪪',
    fields: [num('Z', 'العدد الذرّي Z', { min: 1, max: 118, step: 1 }), txt('symbol', 'الرمز'), txt('name', 'الاسم'), num('mass', 'الكتلة الذرّية', { min: 0.1, step: 0.001 })],
    presets: [p('lab-element-card', 'بطاقة عنصر', 'Fiche élément', '🪪', { Z: 11 })],
  },
  {
    kind: 'formula', subject: 'chemistry', ar: 'رمز كيميائي', fr: 'Formule', icon: '🧬',
    fields: [txt('text', 'الصيغة (مثل H2O)'), txt('name', 'الاسم')],
    presets: [p('lab-formula', 'رمز كيميائي', 'Formule chimique', '🧬', { text: 'H2O', name: 'الماء' })],
  },
  {
    kind: 'bond', subject: 'chemistry', ar: 'رابطة كيميائية', fr: 'Liaison', icon: '🔗',
    fields: [
      txt('a', 'الذرّة الأولى'), txt('b', 'الذرّة الثانية'),
      sel('type', 'النوع', [{ value: 'single', ar: 'أحادية' }, { value: 'double', ar: 'ثنائية' }, { value: 'triple', ar: 'ثلاثية' }, { value: 'ionic', ar: 'شاردية' }]),
    ],
    presets: [p('lab-bond', 'رابطة كيميائية', 'Liaison chimique', '🔗', { a: 'H', b: 'Cl', type: 'single' })],
  },
  {
    kind: 'glassware', subject: 'chemistry', ar: 'زجاجيات', fr: 'Verrerie', icon: '🥃',
    fields: [
      sel('shape', 'الشكل', [{ value: 'beaker', ar: 'بيشر' }, { value: 'flask', ar: 'دورق' }, { value: 'erlenmeyer', ar: 'دورق إرلنماير' }, { value: 'test_tube', ar: 'أنبوب اختبار' }, { value: 'pipette', ar: 'ماصّة' }]),
      num('level', 'مستوى السائل (%)', { min: 0, max: 100, step: 5 }),
      txt('color', 'لون السائل (#hex)'),
      LABEL,
      num('volume', 'السعة (mL)', { min: 1 }),
    ],
    presets: [
      p('lab-beaker', 'بيشر مخبري', 'Bécher', '🥃', { shape: 'beaker', level: 50, volume: 250 }),
      p('lab-flask', 'دورق مخبري', 'Ballon', '⚗️', { shape: 'flask', level: 40 }),
      p('lab-erlenmeyer', 'دورق إرلنماير', 'Erlenmeyer', '🔻', { shape: 'erlenmeyer', level: 35 }),
      p('lab-test-tube', 'أنبوب اختبار', 'Tube à essai', '🧪', { shape: 'test_tube', level: 45 }),
      p('lab-pipette', 'ماصّة مخبرية', 'Pipette', '💉', { shape: 'pipette', level: 60 }),
      p('lab-pipette-svt', 'ماصّة مخبرية', 'Pipette', '💉', { shape: 'pipette', level: 60 }, 'science'),
    ],
  },
  {
    kind: 'burner', subject: 'chemistry', ar: 'موقد بنسن', fr: 'Bec Bunsen', icon: '🔥',
    fields: [bool('lit', 'مشتعل')],
    presets: [p('lab-burner', 'موقد بنسن', 'Bec Bunsen', '🔥', { lit: true })],
  },
  {
    kind: 'heating', subject: 'chemistry', ar: 'تسخين', fr: 'Chauffage', icon: '♨️',
    fields: [num('level', 'مستوى السائل (%)', { min: 0, max: 100, step: 5 }), txt('color', 'لون السائل (#hex)'), txt('label', 'اسم المحلول'), bool('lit', 'الموقد مشتعل')],
    presets: [p('lab-heating', 'تسخين واقعي', 'Chauffage', '♨️', { level: 55, label: 'محلول', lit: true })],
  },
  {
    kind: 'thermometer', subject: 'chemistry', ar: 'محرار', fr: 'Thermomètre', icon: '🌡️',
    fields: [num('value', 'الدرجة (°C)', { min: -100, max: 500 }), num('min', 'أدنى التدريج', { min: -100, max: 500 }), num('max', 'أعلى التدريج', { min: -100, max: 500 })],
    presets: [
      p('lab-thermometer', 'محرار مخبري', 'Thermomètre', '🌡️', { value: 25, min: -10, max: 110 }),
      p('lab-thermometer-svt', 'محرار', 'Thermomètre', '🌡️', { value: 37, min: 30, max: 45 }, 'science'),
    ],
  },
  {
    kind: 'balance', subject: 'chemistry', ar: 'ميزان إلكتروني', fr: 'Balance', icon: '⚖️',
    fields: [num('reading', 'القراءة', { min: 0, step: 0.01 }), txt('unit', 'الوحدة')],
    presets: [p('lab-balance', 'ميزان إلكتروني', 'Balance électronique', '⚖️', { reading: 0 })],
  },
  {
    kind: 'funnel', subject: 'chemistry', ar: 'قمع ترشيح', fr: 'Entonnoir', icon: '🔽',
    fields: [LABEL],
    presets: [p('lab-funnel', 'قمع ترشيح', 'Entonnoir', '🔽', {})],
  },
  {
    kind: 'filter_paper', subject: 'chemistry', ar: 'ورق ترشيح', fr: 'Papier filtre', icon: '📄',
    fields: [LABEL],
    presets: [p('lab-filter-paper', 'ورق ترشيح', 'Papier filtre', '📄', {})],
  },

  // ── علوم طبيعية ───────────────────────────────────────────
  {
    kind: 'cell', subject: 'science', ar: 'خلية', fr: 'Cellule', icon: '🦠',
    fields: [sel('type', 'النوع', [{ value: 'animal', ar: 'حيوانية' }, { value: 'plant', ar: 'نباتية' }]), bool('labels', 'إظهار التسميات')],
    presets: [
      p('lab-cell-animal', 'خلية حيوانية', 'Cellule animale', '🔴', { type: 'animal', labels: true }),
      p('lab-cell-plant', 'خلية نباتية', 'Cellule végétale', '🟩', { type: 'plant', labels: true }),
    ],
  },
  {
    kind: 'microscope', subject: 'science', ar: 'مجهر', fr: 'Microscope', icon: '🔬',
    fields: [LABEL],
    presets: [p('lab-microscope', 'مجهر ضوئي', 'Microscope', '🔬', {})],
  },
  {
    kind: 'petri_dish', subject: 'science', ar: 'طبق بتري', fr: 'Boîte de Petri', icon: '🫙',
    fields: [txt('color', 'لون الوسط (#hex)'), LABEL],
    presets: [p('lab-petri-dish', 'طبق بتري', 'Boîte de Petri', '🫙', {})],
  },
  {
    kind: 'magnifier', subject: 'science', ar: 'عدسة مكبّرة', fr: 'Loupe', icon: '🔍',
    fields: [],
    presets: [p('lab-magnifier', 'عدسة مكبّرة', 'Loupe', '🔍', {})],
  },
  {
    kind: 'plant', subject: 'science', ar: 'نبتة', fr: 'Plante', icon: '🌱',
    fields: [bool('labels', 'إظهار التسميات')],
    presets: [p('lab-plant', 'نبتة كاملة', 'Plante entière', '🌱', { labels: true })],
  },
  {
    kind: 'seed', subject: 'science', ar: 'إنبات بذرة', fr: 'Germination', icon: '🌰',
    fields: [num('stage', 'المرحلة (1–4)', { min: 1, max: 4, step: 1 })],
    presets: [p('lab-seed', 'إنبات بذرة', 'Germination', '🌰', { stage: 1 })],
  },
  {
    kind: 'leaf', subject: 'science', ar: 'ورقة نبات', fr: 'Feuille', icon: '🍃',
    fields: [bool('labels', 'إظهار التسميات')],
    presets: [p('lab-leaf', 'ورقة نبات', 'Feuille', '🍃', { labels: true })],
  },
];

export function labCatalogEntry(kind: string): LabCatalogEntry | undefined {
  return LAB_CATALOG.find((e) => e.kind === kind);
}
