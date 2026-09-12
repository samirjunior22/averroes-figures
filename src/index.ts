// ============================================================
// averroes-figures v2 — مولّدات رسوم SVG تعليمية
// ============================================================
// حزمة مكتفية ذاتياً لتوليد رسوم SVG تعليمية بيداغوجية للمواد العلمية:
//   - مخططات بيانية (chart): أعمدة، دائرة، خطّي، هرم، مساحة، انتشار، أعمدة أفقية
//   - تراكيب تجريبية (setup): تسخين، احتراق، فلترة، ذوبان، تقطير، تصفية، تحليل كهربائي
//   - دوائر كهربائية (circuit): دارات تسلسلية ومتوازية مع تسميات
//   - أشكال هندسية (geometry): مثلث، مربع، دائرة، خماسي، سداسي، قطع ناقص، زاوية، قطعة مستقيمة
//   - خطّ زمني (timeline): أحداث مؤرَّخة على محور — للمواد الأدبية (تاريخ)
//   - خريطة تخطيطية (map): إطار + معالم + نطاقات + مفتاح — للمواد الأدبية (جغرافيا)
//
// كل المولّدات تُخرج SVG نصّاً (صفر تبعيات إلزامية عدا zod).
// تحويل PNG اختياري عبر subpath:  import { svgToPngDataUri } from 'averroes-figures/png'
//
// مبادئ:
//   • مبدأ "لا يرمي": أي spec غير صالح → '' أو placeholder (لا يكسر الاستدعاء)
//   • كل النصوص تُهرب ضد حقن XML (esc)
//   • SVG بأسلوب currentColor خطّي قابل للتنسيق بـ CSS
//   • RTL-aware: التسميات العربية تُعرض بشكل صحيح
//   • خيارات تصيير كاملة: ألوان، خطوط، أبعاد، وضع داكن
//
// الاستخدام السريع:
//   import { renderChart } from 'averroes-figures';
//   const svg = renderChart({ kind: 'bar', labels: ['أ','ب'], values: [10, 20] });
// ============================================================

// الموزّع العام (يكتشف النوع من حقل gen) — نقطة الدخول الرئيسية
export { renderFigure, FIGURE_GENS } from './figures/registry.js';
export type { FigureGen, FigureInput } from './figures/registry.js';

// مولّد المخططات البيانية (bar/pie/line/pyramid/area/scatter/horizontal_bar)
export { renderChart, chartSpecSchema, chartKindSchema } from './figures/chart.js';
export type { ChartSpec, ChartKind, ChartOptions } from './figures/chart.js';

// مولّد التراكيب التجريبية (heating/burning/filtration/melting/distillation/decantation/electrolysis/conductivity)
export { renderSetup, setupSpecSchema, setupKindSchema } from './figures/setup.js';
export type { SetupSpec, SetupKind } from './figures/setup.js';

// مولّد الأشكال الهندسية (triangle/square/circle/pentagon/hexagon/ellipse/angle/line_segment...)
export { renderGeometry, geometrySpecSchema, geometryShapeSchema } from './figures/geometry.js';
export type { GeometrySpec, GeometryShape } from './figures/geometry.js';

// مولّد الدارات الكهربائية (تسلسلية + متوازية)
export { renderCircuit, circuitSpecSchema, circuitComponentSchema } from './figures/circuit.js';
export type { CircuitSpec, CircuitComponent } from './figures/circuit.js';

// مولّد متجهات القوى (فيزياء - ميكانيك)
export { renderForces, forcesSpecSchema, forceVectorSchema } from './figures/forces.js';
export type { ForcesSpec, ForceVector } from './figures/forces.js';

// مولّد الظواهر الميكانيكية (فيزياء التعليم المتوسط - BEM)
export {
  renderMechanics,
  mechanicsSpecSchema,
  mechanicsKindSchema,
  mechanicsThemeSchema,
  twoForcesEquilibriumSpecSchema,
  threeForcesEquilibriumSpecSchema,
  archimedesSpecSchema,
  dynamometerWeightSpecSchema,
  inclinedPlaneMotionSpecSchema,
} from './figures/mechanics.js';
export type {
  MechanicsSpec,
  MechanicsKind,
  MechanicsTheme,
  TwoForcesEquilibriumSpec,
  ThreeForcesEquilibriumSpec,
  ArchimedesSpec,
  DynamometerWeightSpec,
  InclinedPlaneMotionSpec,
} from './figures/mechanics.js';

// مولّد المستقيم المدرّج (رياضيات)
export { renderNumberLine, numberLineSpecSchema, numberLinePointSchema, numberLineIntervalSchema } from './figures/number_line.js';
export type { NumberLineSpec, NumberLinePoint, NumberLineInterval } from './figures/number_line.js';

// مولّد منحنى الدالة (رياضيات)
export { renderFunctionPlot, functionPlotSpecSchema, plotPointSchema } from './figures/function_plot.js';
export type { FunctionPlotSpec, PlotPoint } from './figures/function_plot.js';

// مولّد الجزيء (كيمياء / علوم)
export { renderMolecule, moleculeSpecSchema, moleculeAtomSchema, moleculeBondSchema } from './figures/molecule.js';
export type { MoleculeSpec, MoleculeAtom, MoleculeBond } from './figures/molecule.js';

// مولّد الأشعة والظواهر الضوئية (فيزياء / البصريات)
export { renderRays, raysSpecSchema, raysKindSchema, raysThemeSchema } from './figures/rays.js';
export type { RaysSpec, RaysKind, RaysTheme } from './figures/rays.js';

// مولّد الخطّ الزمني (تاريخ)
export { renderTimeline, timelineSpecSchema, timelineEventSchema } from './figures/timeline.js';
export type { TimelineSpec, TimelineEvent } from './figures/timeline.js';

// مولّد الخريطة التخطيطية (جغرافيا)
export { renderMap, mapSpecSchema, mapMarkerSchema, mapZoneSchema, mapMarkerKindSchema } from './figures/map.js';
export type { MapSpec, MapMarker, MapZone, MapMarkerKind } from './figures/map.js';

// مولّد علوم الطبيعة والحياة (بيولوجيا)
export {
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
  renderAbsorptionPathways,
  renderBloodSmear,
  renderEnzymaticDigestion,
  renderCellularRespiration,
  biologySpecSchema,
  biologyKindSchema,
  neuronSpecSchema,
  respiratorySpecSchema,
  eyeSpecSchema,
  villusSpecSchema,
  synapseSpecSchema,
  digestiveSpecSchema,
  urinarySpecSchema,
  circulatorySpecSchema,
  skeletalSpecSchema,
  absorptionPathwaysSpecSchema,
  bloodSmearSpecSchema,
  enzymaticDigestionSpecSchema,
  cellularRespirationSpecSchema,
  labelsModeSchema,
  biologyThemeSchema,
  neuronFocusSchema,
  respiratoryFocusSchema,
  eyeFocusSchema,
  villusFocusSchema,
  synapseFocusSchema,
  digestiveFocusSchema,
  urinaryFocusSchema,
  circulatoryFocusSchema,
  skeletalFocusSchema,
} from './figures/biology.js';
export type {
  BiologySpec,
  BiologyKind,
  NeuronSpec,
  RespiratorySpec,
  EyeSpec,
  VillusSpec,
  SynapseSpec,
  DigestiveSpec,
  UrinarySpec,
  CirculatorySpec,
  SkeletalSpec,
  AbsorptionPathwaysSpec,
  BloodSmearSpec,
  EnzymaticDigestionSpec,
  CellularRespirationSpec,
  LabelsMode,
  BiologyTheme,
  NeuronFocus,
  RespiratoryFocus,
  EyeFocus,
  VillusFocus,
  SynapseFocus,
  DigestiveFocus,
  UrinaryFocus,
  CirculatoryFocus,
  SkeletalFocus,
} from './figures/biology.js';

// مولّد الإعلام الآلي والمعلوماتية
export {
  renderInformatics,
  renderComputerHardware,
  renderNetworkTopology,
  renderOsInterface,
  renderScratch,
  informaticsSpecSchema,
  informaticsKindSchema,
  informaticsThemeSchema,
  computerHardwareSpecSchema,
  hardwareViewSchema,
  hardwareFocusSchema,
  networkTopologySpecSchema,
  networkTopologyTypeSchema,
  osInterfaceSpecSchema,
  osComponentSchema,
  scratchSpecSchema,
  scratchViewSchema,
} from './figures/informatics.js';
export type {
  InformaticsSpec,
  InformaticsKind,
  InformaticsTheme,
  ComputerHardwareSpec,
  NetworkTopologySpec,
  OsInterfaceSpec,
  ScratchSpec,
} from './figures/informatics.js';

// مولّد العلوم الفيزيائية والتكنولوجيا (الظواهر الكهربائية)
export {
  renderPhysics,
  renderElectrostatics,
  renderInduction,
  renderOscilloscope,
  renderElectricalSafety,
  renderCircuit3D,
  physicsSpecSchema,
  physicsKindSchema,
  physicsThemeSchema,
  electrostaticsSpecSchema,
  electrostaticsApparatusSchema,
  chargeTypeSchema,
  chargingMethodSchema,
  inductionSpecSchema,
  magnetMovementSchema,
  oscilloscopeSpecSchema,
  oscilloscopeSignalSchema,
  electricalSafetySpecSchema,
  safetyScenarioSchema,
  circuit3dSpecSchema,
  switchStateSchema,
  circuitTypeSchema,
} from './figures/physics.js';
export type {
  PhysicsSpec,
  PhysicsKind,
  PhysicsTheme,
  ElectrostaticsSpec,
  InductionSpec,
  OscilloscopeSpec,
  ElectricalSafetySpec,
  Circuit3dSpec,
} from './figures/physics.js';

// الأنواع المشتركة
export type { RenderOptions } from './figures/shared.js';

// مولّد كائنات المخبر للسبورة (gen: 'lab') — بطارية/مقاومة/قاطعة/مقياس/متّجه/موجة/ذرّة/زجاجيات/خلية…
// + الفهرس LAB_CATALOG الذي تشتقّ منه واجهة السبورة الأزرار وحقول التخصيص
export { renderLab, labSpecSchema, labKindSchema, LAB_KINDS, LAB_CATALOG, labCatalogEntry, ELEMENTS, elementByZ, elementBySymbol, shellDistribution } from './figures/lab/index.js';
export type { LabSpec, LabKind, LabCatalogEntry, LabField, LabFieldOption, LabPreset, LabSubject, ElementInfo } from './figures/lab/index.js';
