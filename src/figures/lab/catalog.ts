// ============================================================
// lab/catalog — فهرس كائنات المخبر: المادة، التسميات، الحقول، الأشكال الجاهزة
// ============================================================
// **المصدر الوحيد** الذي تشتقّ منه واجهة السبورة أزرار الإدراج وحقول
// لوحة التخصيص. قائمة واحدة هنا بدل ثلاث قوائم متباعدة (presets / fields /
// options) في العميل — نسيان إحداها كان يُنتج كائناً يُدرَج ولا يُخصَّص.
// بيانات لا كود: لا React ولا منطق رسم.
// ============================================================

export type LabSubject = 'physics' | 'chemistry' | 'science' | 'math' | 'geography' | 'cs';

export interface LabFieldOption {
  value: string;
  ar: string;
}

export interface LabField {
  key: string;
  ar: string;
  type: 'number' | 'text' | 'select' | 'boolean' | 'color';
  options?: LabFieldOption[];
  /** للّون: القيمة المعروضة في المنتقي حين يغيب المفتاح (= افتراض المولّد). */
  def?: string;
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
const col = (key: string, ar: string, def: string): LabField => ({ key, ar, type: 'color', def });
const sel = (key: string, ar: string, options: LabFieldOption[]): LabField => ({ key, ar, type: 'select', options });
const p = (id: string, ar: string, fr: string, icon: string, spec: Record<string, unknown>, subject?: LabSubject): LabPreset =>
  subject ? { id, ar, fr, icon, subject, spec } : { id, ar, fr, icon, spec };

const LABEL = txt('label', 'التسمية');

const LABELS_MODE_FIELD: LabField = sel('labelsMode', 'التأشيرات', [
  { value: 'full', ar: 'كاملة (شرح)' },
  { value: 'numbered', ar: 'أرقام (امتحانات BEM)' },
  { value: 'none', ar: 'صامت تماماً' },
]);

const THEME_FIELD: LabField = sel('theme', 'الألوان', [
  { value: 'natural', ar: 'طبيعي ثلاثي الأبعاد' },
  { value: 'vibrant', ar: 'مشبَع عالي التباين' },
  { value: 'exam_print', ar: 'رمادي للطباعة الورقية' },
]);

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
      col('color', 'لون السائل', '#60a5fa'),
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
    fields: [num('level', 'مستوى السائل (%)', { min: 0, max: 100, step: 5 }), col('color', 'لون السائل', '#4ade80'), txt('label', 'اسم المحلول'), bool('lit', 'الموقد مشتعل')],
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
    fields: [col('color', 'لون الوسط', '#fde68a'), LABEL],
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

  // ── رياضيات ───────────────────────────────────────────────
  {
    kind: 'fraction', subject: 'math', ar: 'كسر', fr: 'Fraction', icon: '🥧',
    fields: [
      num('num', 'البسط', { min: 0, max: 100 }),
      num('den', 'المقام', { min: 1, max: 100 }),
      sel('style', 'النمط', [{ value: 'pie', ar: 'قرص' }, { value: 'bar', ar: 'شريط' }]),
      bool('showLabel', 'إظهار الكسر'),
      LABELS_MODE_FIELD,
      THEME_FIELD,
    ],
    presets: [
      p('lab-fraction-pie', 'كسر دائري (3/4)', 'Fraction (disque)', '🥧', { num: 3, den: 4, style: 'pie' }),
      p('lab-fraction-bar', 'كسر شريطي (2/5)', 'Fraction (barre)', '📊', { num: 2, den: 5, style: 'bar' }),
    ],
  },
  {
    kind: 'solid', subject: 'math', ar: 'مجسم هندسي', fr: 'Solide géométrique', icon: '🧊',
    fields: [
      sel('shape', 'الشكل', [{ value: 'cube', ar: 'مكعب' }, { value: 'cuboid', ar: 'متوازي مستطيلات' }, { value: 'cylinder', ar: 'أسطوانة' }, { value: 'cone', ar: 'مخروط' }, { value: 'sphere', ar: 'كرة' }, { value: 'pyramid', ar: 'هرم' }]),
      num('a', 'البعد a / الطول', { min: 1, max: 100 }),
      num('b', 'العرض b', { min: 1, max: 100 }),
      num('h', 'الارتفاع h', { min: 1, max: 100 }),
      num('r', 'نصف القطر r', { min: 1, max: 100 }),
      txt('unit', 'الوحدة'),
      bool('showDims', 'إظهار الأبعاد'),
      THEME_FIELD,
    ],
    presets: [
      p('lab-solid-cube', 'مكعب مجسم 3D', 'Cube 3D', '🧊', { shape: 'cube', a: 5, unit: 'cm' }),
      p('lab-solid-cylinder', 'أسطوانة دورانية', 'Cylindre', '🛢️', { shape: 'cylinder', r: 3, h: 8, unit: 'cm' }),
      p('lab-solid-sphere', 'كرة مجسمة', 'Sphère', '⚽', { shape: 'sphere', r: 4, unit: 'cm' }),
    ],
  },
  {
    kind: 'clock', subject: 'math', ar: 'ساعة تناظرية', fr: 'Horloge', icon: '🕒',
    fields: [
      num('hours', 'الساعات (0–23)', { min: 0, max: 23, step: 1 }),
      num('minutes', 'الدقائق (0–59)', { min: 0, max: 59, step: 1 }),
      bool('showDigital', 'إظهار الساعة الرقمية'),
      THEME_FIELD,
    ],
    presets: [p('lab-clock', 'ساعة تناظرية (03:00)', 'Horloge', '🕒', { hours: 3, minutes: 0 })],
  },
  {
    kind: 'ruler', subject: 'math', ar: 'مسطرة مدرجة', fr: 'Règle graduée', icon: '📏',
    fields: [
      num('length', 'الطول (سم)', { min: 5, max: 30, step: 1 }),
      sel('unit', 'الوحدة', [{ value: 'cm', ar: 'سم (cm)' }, { value: 'mm', ar: 'ملم (mm)' }]),
      THEME_FIELD,
    ],
    presets: [p('lab-ruler', 'مسطرة مدرجة (15 سم)', 'Règle graduée', '📏', { length: 15, unit: 'cm' })],
  },
  {
    kind: 'protractor', subject: 'math', ar: 'منقلة هندسية', fr: 'Rapporteur', icon: '📐',
    fields: [
      num('angle', 'الزاوية (°)', { min: 0, max: 180, step: 1 }),
      bool('showRays', 'إظهار الشعاعين'),
      THEME_FIELD,
    ],
    presets: [p('lab-protractor', 'منقلة هندسية (60°)', 'Rapporteur', '📐', { angle: 60 })],
  },
  {
    kind: 'set_square', subject: 'math', ar: 'كوس هندسي', fr: 'Équerre', icon: '📐',
    fields: [
      sel('type', 'النوع', [{ value: '45', ar: 'كوس 45°' }, { value: '30_60', ar: 'كوس 30°/60°' }]),
      THEME_FIELD,
    ],
    presets: [p('lab-set-square-45', 'كوس 45°', 'Équerre 45°', '📐', { type: '45' })],
  },
  {
    kind: 'compass_tool', subject: 'math', ar: 'مدور (فرجار)', fr: 'Compas', icon: '📐',
    fields: [
      num('radius', 'فتحة الفرجار (مم)', { min: 10, max: 100, step: 5 }),
      THEME_FIELD,
    ],
    presets: [p('lab-compass-tool', 'مدور (فرجار)', 'Compas', '📐', { radius: 40 })],
  },
  {
    kind: 'number_sets', subject: 'math', ar: 'مجموعات الأعداد', fr: 'Ensembles de nombres', icon: '🔢',
    fields: [
      sel('highlight', 'المجموعة المبرزة', [
        { value: 'none', ar: 'الكل متساوٍ' },
        { value: 'N', ar: 'الأعداد الطبيعية ℕ' },
        { value: 'Z', ar: 'الأعداد الصحيحة ℤ' },
        { value: 'Q', ar: 'الأعداد الناطقة ℚ' },
        { value: 'R', ar: 'الأعداد الحقيقية ℝ' },
      ]),
      THEME_FIELD,
    ],
    presets: [p('lab-number-sets', 'مجموعات الأعداد ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ', 'Ensembles de nombres', '🔢', { highlight: 'none' })],
  },
  {
    kind: 'place_value', subject: 'math', ar: 'جدول المراتب', fr: 'Tableau de numération', icon: '🧮',
    fields: [
      num('value', 'العدد', { min: 0, max: 999999, step: 1 }),
      THEME_FIELD,
    ],
    presets: [p('lab-place-value', 'جدول المراتب (4325)', 'Tableau de numération', '🧮', { value: 4325 })],
  },
  {
    kind: 'dice', subject: 'math', ar: 'نرد احتمالات', fr: 'Dé à jouer', icon: '🎲',
    fields: [
      num('face', 'الوجه (1–6)', { min: 1, max: 6, step: 1 }),
      THEME_FIELD,
    ],
    presets: [p('lab-dice', 'نرد احتمالات', 'Dé à jouer', '🎲', { face: 1 })],
  },
  {
    kind: 'coin', subject: 'math', ar: 'قطعة نقدية', fr: 'Pièce de monnaie', icon: '🪙',
    fields: [
      sel('side', 'الجانب', [{ value: 'heads', ar: 'وجه (شعار)' }, { value: 'tails', ar: 'ظهر (قيمة)' }]),
      num('value', 'القيمة', { min: 1, max: 500, step: 1 }),
      txt('currency', 'العملة'),
      THEME_FIELD,
    ],
    presets: [p('lab-coin-heads', 'قطعة نقدية (وجه)', 'Pièce (face)', '🪙', { side: 'heads', value: 100, currency: 'DA' })],
  },
  {
    kind: 'abacus', subject: 'math', ar: 'معداد مدرسي', fr: 'Boulier', icon: '🧮',
    fields: [
      num('value', 'العدد الممثل', { min: 0, max: 9999, step: 1 }),
      num('rods', 'عدد الأعمدة', { min: 3, max: 5, step: 1 }),
      THEME_FIELD,
    ],
    presets: [p('lab-abacus', 'معداد مدرسي (352)', 'Boulier', '🧮', { value: 352, rods: 3 })],
  },
  {
    kind: 'coordinate_point', subject: 'math', ar: 'نقطة في معلم', fr: 'Point repéré', icon: '📍',
    fields: [
      num('x', 'الفاصلة x', { min: -10, max: 10, step: 1 }),
      num('y', 'الترتيب y', { min: -10, max: 10, step: 1 }),
      txt('label', 'اسم النقطة'),
      THEME_FIELD,
    ],
    presets: [p('lab-coord-point', 'نقطة في معلم A(3, 2)', 'Point repéré A(3, 2)', '📍', { x: 3, y: 2, label: 'A' })],
  },

  // ── جغرافيا ───────────────────────────────────────────────
  {
    kind: 'compass_rose', subject: 'geography', ar: 'وردة الرياح', fr: 'Rose des vents', icon: '🧭',
    fields: [
      sel('style', 'النمط', [{ value: 'full', ar: '8 جهات' }, { value: 'simple', ar: '4 جهات' }]),
      LABELS_MODE_FIELD,
      THEME_FIELD,
    ],
    presets: [p('lab-compass-rose', 'وردة الرياح التعليمية', 'Rose des vents', '🧭', { style: 'full' })],
  },
  {
    kind: 'globe', subject: 'geography', ar: 'الكرة الأرضية', fr: 'Globe terrestre', icon: '🌍',
    fields: [
      sel('highlight', 'التركيز / الإبراز', [
        { value: 'none', ar: 'عام' },
        { value: 'equator', ar: 'خط الاستواء' },
        { value: 'meridian', ar: 'خط غرينتش' },
        { value: 'tropics', ar: 'المداران' },
      ]),
      LABELS_MODE_FIELD,
      THEME_FIELD,
    ],
    presets: [p('lab-globe', 'الكرة الأرضية وإحداثياتها', 'Globe terrestre', '🌍', { highlight: 'equator' })],
  },
  {
    kind: 'seasons', subject: 'geography', ar: 'تعاقب الفصول', fr: 'Les quatre saisons', icon: '☀️',
    fields: [
      sel('season', 'الفصل', [
        { value: 'summer', ar: 'انقلاب صيفي' },
        { value: 'winter', ar: 'انقلاب شتوي' },
        { value: 'spring', ar: 'اعتدال ربيعي' },
        { value: 'autumn', ar: 'اعتدال خريفي' },
      ]),
      LABELS_MODE_FIELD,
      THEME_FIELD,
    ],
    presets: [p('lab-seasons', 'تعاقب الفصول الأربعة', 'Les quatre saisons', '☀️', { season: 'summer' })],
  },
  {
    kind: 'water_cycle', subject: 'geography', ar: 'دورة الماء', fr: 'Cycle de l’eau', icon: '💧',
    fields: [LABELS_MODE_FIELD, THEME_FIELD],
    presets: [p('lab-water-cycle', 'دورة الماء في الطبيعة', 'Cycle de l’eau', '💧', {})],
  },
  {
    kind: 'relief_profile', subject: 'geography', ar: 'مقطع تضاريسي', fr: 'Profil topographique', icon: '⛰️',
    fields: [LABELS_MODE_FIELD, THEME_FIELD],
    presets: [p('lab-relief-profile', 'مقطع تضاريسي طوبوغرافي', 'Profil topographique', '⛰️', {})],
  },
  {
    kind: 'volcano', subject: 'geography', ar: 'مقطع بركان', fr: 'Volcan', icon: '🌋',
    fields: [
      sel('focus', 'التركيز', [
        { value: 'all', ar: 'كامل البركان' },
        { value: 'chamber', ar: 'غرفة الصهارة' },
        { value: 'conduit', ar: 'المدخنة' },
        { value: 'crater', ar: 'الفوهة' },
        { value: 'cloud', ar: 'سحابة الرماد' },
      ]),
      bool('erupting', 'بركان ثائر نشط'),
      LABELS_MODE_FIELD,
      THEME_FIELD,
    ],
    presets: [p('lab-volcano', 'مقطع بركان انفجاري', 'Volcan en éruption', '🌋', { focus: 'all', erupting: true })],
  },
  {
    kind: 'rock_layers', subject: 'geography', ar: 'طبقات الصخور', fr: 'Strates géologiques', icon: '🪨',
    fields: [
      num('layers', 'عدد الطبقات (2–6)', { min: 2, max: 6, step: 1 }),
      LABELS_MODE_FIELD,
      THEME_FIELD,
    ],
    presets: [p('lab-rock-layers', 'طبقات الصخور والترسبات', 'Strates géologiques', '🪨', { layers: 4 })],
  },
  {
    kind: 'weather_instrument', subject: 'geography', ar: 'جهاز أرصاد', fr: 'Instrument météo', icon: '🌡️',
    fields: [
      sel('type', 'الجهاز', [
        { value: 'thermometer', ar: 'محرار زئبقي' },
        { value: 'barometer', ar: 'بارومتر' },
      ]),
      num('value', 'القيمة المقروءة'),
      LABELS_MODE_FIELD,
      THEME_FIELD,
    ],
    presets: [p('lab-weather-thermometer', 'محرار الأرصاد (24°C)', 'Thermomètre météo', '🌡️', { type: 'thermometer', value: 24 })],
  },
  {
    kind: 'climate_bar', subject: 'geography', ar: 'منحنى مناخي', fr: 'Diagramme ombrothermique', icon: '📊',
    fields: [txt('city', 'اسم المدينة / المحطة'), THEME_FIELD],
    presets: [p('lab-climate-bar', 'منحنى مناخي أومبروترمي', 'Diagramme ombrothermique', '📊', { city: 'الجزائر العاصمة' })],
  },
  {
    kind: 'map_symbol', subject: 'geography', ar: 'رمز خريطة', fr: 'Symbole de carte', icon: '📍',
    fields: [
      sel('symbol', 'الرمز', [
        { value: 'capital', ar: 'عاصمة دولية' },
        { value: 'mountain', ar: 'قمة جبلية' },
        { value: 'airport', ar: 'مطار' },
        { value: 'port', ar: 'ميناء' },
      ]),
      txt('label', 'التسمية'),
      THEME_FIELD,
    ],
    presets: [p('lab-map-symbol-capital', 'رمز مفتاح الخريطة: عاصمة', 'Symbole carte: capitale', '📍', { symbol: 'capital', label: 'عاصمة' })],
  },
  {
    kind: 'scale_bar', subject: 'geography', ar: 'مقياس رسم خطي', fr: 'Échelle graphique', icon: '📏',
    fields: [
      num('km', 'المسافة بالكيلومتر', { min: 10, max: 1000, step: 10 }),
      num('divisions', 'عدد التدريجات', { min: 2, max: 5, step: 1 }),
      THEME_FIELD,
    ],
    presets: [p('lab-scale-bar', 'مقياس رسم خطي (100 كم)', 'Échelle graphique (100 km)', '📏', { km: 100, divisions: 4 })],
  },

  // ── إعلام آلي ─────────────────────────────────────────────
  {
    kind: 'device', subject: 'cs', ar: 'عتاد حاسوب', fr: 'Périphérique matériel', icon: '🖥️',
    fields: [
      sel('type', 'نوع العتاد', [
        { value: 'monitor', ar: 'شاشة' },
        { value: 'cpu', ar: 'معالج CPU' },
        { value: 'ram', ar: 'ذاكرة RAM' },
        { value: 'mouse', ar: 'فارة' },
        { value: 'laptop', ar: 'حاسوب محمول' },
      ]),
      txt('label', 'التسمية'),
      THEME_FIELD,
    ],
    presets: [p('lab-device-monitor', 'شاشة حاسوب', 'Écran', '🖥️', { type: 'monitor', label: 'شاشة حاسوب' })],
  },
  {
    kind: 'flow_symbol', subject: 'cs', ar: 'رمز انسيابي', fr: 'Symbole d’organigramme', icon: '⚙️',
    fields: [
      sel('shape', 'نوع الرمز', [
        { value: 'terminal', ar: 'بداية / نهاية' },
        { value: 'process', ar: 'عملية معالجة' },
        { value: 'decision', ar: 'شرط / قرار' },
        { value: 'io', ar: 'إدخال / إخراج' },
        { value: 'connector', ar: 'رابط' },
      ]),
      txt('text', 'النص داخل الرمز'),
      THEME_FIELD,
    ],
    presets: [p('lab-flow-terminal', 'رمز انسيابي: بداية', 'Organigramme: Début', '🛑', { shape: 'terminal', text: 'بداية' })],
  },
  {
    kind: 'logic_gate', subject: 'cs', ar: 'بوابة منطقية', fr: 'Porte logique', icon: '🔌',
    fields: [
      sel('gate', 'نوع البوابة', [
        { value: 'AND', ar: 'و (AND)' },
        { value: 'OR', ar: 'أو (OR)' },
        { value: 'NOT', ar: 'لا (NOT)' },
        { value: 'NAND', ar: 'نفي و (NAND)' },
        { value: 'NOR', ar: 'نفي أو (NOR)' },
        { value: 'XOR', ar: 'أو الاستبعادية (XOR)' },
      ]),
      num('a', 'المدخل A (0 أو 1)', { min: 0, max: 1, step: 1 }),
      num('b', 'المدخل B (0 أو 1)', { min: 0, max: 1, step: 1 }),
      THEME_FIELD,
    ],
    presets: [p('lab-logic-and', 'بوابة منطقية AND (و)', 'Porte logique ET (AND)', '🔌', { gate: 'AND', a: 1, b: 0 })],
  },
  {
    kind: 'binary', subject: 'cs', ar: 'تمثيل ثنائي', fr: 'Représentation binaire', icon: '🔢',
    fields: [
      num('value', 'القيمة العشرية (0–255)', { min: 0, max: 255, step: 1 }),
      num('bits', 'عدد البتات (4–8)', { min: 4, max: 8, step: 1 }),
      THEME_FIELD,
    ],
    presets: [p('lab-binary-byte', 'تمثيل ثنائي 8 بت (42)', 'Octet binaire (42)', '🔢', { value: 42, bits: 8 })],
  },
  {
    kind: 'variable_box', subject: 'cs', ar: 'صندوق متغير', fr: 'Boîte de variable', icon: '📦',
    fields: [
      txt('name', 'اسم المتغير'),
      txt('value', 'القيمة'),
      sel('varType', 'النوع', [
        { value: 'int', ar: 'صحيح (int)' },
        { value: 'float', ar: 'حقيقي (float)' },
        { value: 'string', ar: 'نصي (string)' },
        { value: 'bool', ar: 'منطقي (bool)' },
      ]),
      THEME_FIELD,
    ],
    presets: [p('lab-variable-box', 'صندوق متغير برمجي (x = 5)', 'Variable en mémoire', '📦', { name: 'x', value: '5', varType: 'int' })],
  },
  {
    kind: 'file_icon', subject: 'cs', ar: 'أيقونة ملف', fr: 'Icône de fichier', icon: '📁',
    fields: [
      sel('fileType', 'النوع', [
        { value: 'file', ar: 'ملف' },
        { value: 'folder', ar: 'مجلد' },
        { value: 'image', ar: 'صورة' },
        { value: 'text', ar: 'نص' },
        { value: 'video', ar: 'فيديو' },
        { value: 'zip', ar: 'مضغوط' },
      ]),
      txt('name', 'اسم الملف'),
      THEME_FIELD,
    ],
    presets: [p('lab-file-folder', 'مجلد نظام ملفات', 'Dossier', '📁', { fileType: 'folder', name: 'المستندات' })],
  },
  {
    kind: 'network', subject: 'cs', ar: 'شبكة حاسوب', fr: 'Réseau informatique', icon: '🌐',
    fields: [
      sel('topology', 'الطوبولوجيا', [
        { value: 'star', ar: 'نجمية (Star)' },
        { value: 'bus', ar: 'خطية (Bus)' },
        { value: 'ring', ar: 'حلقية (Ring)' },
      ]),
      num('nodes', 'عدد الأجهزة', { min: 3, max: 6, step: 1 }),
      LABELS_MODE_FIELD,
      THEME_FIELD,
    ],
    presets: [p('lab-network-star', 'طوبولوجيا نجمية (Star)', 'Topologie en étoile', '🌐', { topology: 'star', nodes: 4 })],
  },
  {
    kind: 'scratch_block', subject: 'cs', ar: 'لبنة سكراتش', fr: 'Bloc Scratch', icon: '🧩',
    fields: [
      sel('category', 'المجموعة', [
        { value: 'motion', ar: 'حركة (أزرق)' },
        { value: 'looks', ar: 'مظاهر (بنفسجي)' },
        { value: 'events', ar: 'أحداث (أصفر)' },
        { value: 'control', ar: 'تحكم (برتقالي)' },
      ]),
      txt('text', 'نص اللبنة'),
      THEME_FIELD,
    ],
    presets: [p('lab-scratch-motion', 'لبنة سكراتش: حركة', 'Bloc Scratch: Mouvement', '🧩', { category: 'motion', text: 'تحرك 10 خطوة' })],
  },
  {
    kind: 'storage_units', subject: 'cs', ar: 'سلم وحدات التخزين', fr: 'Unités de stockage', icon: '🪜',
    fields: [
      sel('highlight', 'التركيز على وحدة', [
        { value: 'none', ar: 'الكل' },
        { value: 'bit', ar: 'بت (bit)' },
        { value: 'byte', ar: 'بايت (Byte)' },
        { value: 'KB', ar: 'كيلوبايت (KB)' },
        { value: 'MB', ar: 'ميغابايت (MB)' },
        { value: 'GB', ar: 'غيغابايت (GB)' },
        { value: 'TB', ar: 'تيرابايت (TB)' },
      ]),
      THEME_FIELD,
    ],
    presets: [p('lab-storage-units', 'سلم وحدات قياس الذاكرة', 'Unités de stockage', '🪜', { highlight: 'byte' })],
  },
];

export function labCatalogEntry(kind: string): LabCatalogEntry | undefined {
  return LAB_CATALOG.find((e) => e.kind === kind);
}
