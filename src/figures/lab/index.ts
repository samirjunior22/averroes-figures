// ============================================================
// lab — مولّد «كائنات المخبر» للسبورة الذكية (gen: "lab")
// ============================================================
// كائنات مفردة يركّبها الأستاذ بحرّية على السبورة، بقيم حيّة تُضبط من
// لوحة التخصيص (بطارية 12V، أمبيرمتر 1.2A، ذرّة Z=11…). الأسلوب ثلاثي
// الأبعاد ناعم (تدرّجات + لمعان + ظلّ). التوزيع على `kind`.
// المخطّطات كلّها `.strict()` وحقولها `.optional()` بلا `.default()`:
// الافتراضات في الرسم بـ`??` كي يبقى input = output (فخّ `circuit.layout`).
// ============================================================

import { z } from 'zod';
import type { RenderOptions } from '../shared.js';
import {
  batterySpecSchema, resistorSpecSchema, switchSpecSchema, lampSpecSchema, meterSpecSchema, wireSpecSchema,
  bodySpecSchema, vectorSpecSchema, chargedSphereSpecSchema, waveSpecSchema,
  renderBattery, renderResistor, renderSwitch, renderLamp, renderMeter, renderWire, renderBody, renderVector,
  renderChargedSphere, renderWave,
} from './physicsObjects.js';
import { atomSpecSchema, elementCardSpecSchema, formulaSpecSchema, bondSpecSchema, renderAtom, renderElementCard, renderFormula, renderBond } from './atom.js';
import {
  glasswareSpecSchema, burnerSpecSchema, heatingSpecSchema, thermometerSpecSchema, balanceSpecSchema, funnelSpecSchema, filterPaperSpecSchema,
  renderGlassware, renderBurner, renderHeating, renderThermometer, renderBalance, renderFunnel, renderFilterPaper,
} from './chemistryObjects.js';
import {
  cellSpecSchema, microscopeSpecSchema, petriDishSpecSchema, magnifierSpecSchema, plantSpecSchema, seedSpecSchema, leafSpecSchema,
  renderCell, renderMicroscope, renderPetriDish, renderMagnifier, renderPlant, renderSeed, renderLeaf,
} from './biologyObjects.js';

export const LAB_KINDS = [
  'battery', 'resistor', 'switch', 'lamp', 'meter', 'wire', 'body', 'vector', 'charged_sphere', 'wave',
  'atom', 'element_card', 'formula', 'bond', 'glassware', 'burner', 'heating', 'thermometer', 'balance', 'funnel', 'filter_paper',
  'cell', 'microscope', 'petri_dish', 'magnifier', 'plant', 'seed', 'leaf',
] as const;
export const labKindSchema = z.enum(LAB_KINDS);
export type LabKind = z.infer<typeof labKindSchema>;

// z.union لا discriminatedUnion: مخطّطا الذرّة والمحرار يحملان `.refine()`
// (A ≥ Z، max > min) فليسا ZodObject خامَين.
export const labSpecSchema = z.union([
  batterySpecSchema, resistorSpecSchema, switchSpecSchema, lampSpecSchema, meterSpecSchema, wireSpecSchema,
  bodySpecSchema, vectorSpecSchema, chargedSphereSpecSchema, waveSpecSchema,
  atomSpecSchema, elementCardSpecSchema, formulaSpecSchema, bondSpecSchema,
  glasswareSpecSchema, burnerSpecSchema, heatingSpecSchema, thermometerSpecSchema, balanceSpecSchema, funnelSpecSchema, filterPaperSpecSchema,
  cellSpecSchema, microscopeSpecSchema, petriDishSpecSchema, magnifierSpecSchema, plantSpecSchema, seedSpecSchema, leafSpecSchema,
]);
export type LabSpec = z.infer<typeof labSpecSchema>;

/** يُصيّر كائن مخبر إلى SVG. مواصفة غير صالحة أو خطأ داخلي → ''. */
export function renderLab(spec: LabSpec, opts?: RenderOptions): string {
  try {
    switch (spec.kind) {
      case 'battery': return renderBattery(spec, opts);
      case 'resistor': return renderResistor(spec, opts);
      case 'switch': return renderSwitch(spec, opts);
      case 'lamp': return renderLamp(spec, opts);
      case 'meter': return renderMeter(spec, opts);
      case 'wire': return renderWire(spec, opts);
      case 'body': return renderBody(spec, opts);
      case 'vector': return renderVector(spec, opts);
      case 'charged_sphere': return renderChargedSphere(spec, opts);
      case 'wave': return renderWave(spec, opts);
      case 'atom': return renderAtom(spec, opts);
      case 'element_card': return renderElementCard(spec, opts);
      case 'formula': return renderFormula(spec, opts);
      case 'bond': return renderBond(spec, opts);
      case 'glassware': return renderGlassware(spec, opts);
      case 'burner': return renderBurner(spec, opts);
      case 'heating': return renderHeating(spec, opts);
      case 'thermometer': return renderThermometer(spec, opts);
      case 'balance': return renderBalance(spec, opts);
      case 'funnel': return renderFunnel(spec, opts);
      case 'filter_paper': return renderFilterPaper(spec, opts);
      case 'cell': return renderCell(spec, opts);
      case 'microscope': return renderMicroscope(spec, opts);
      case 'petri_dish': return renderPetriDish(spec, opts);
      case 'magnifier': return renderMagnifier(spec, opts);
      case 'plant': return renderPlant(spec, opts);
      case 'seed': return renderSeed(spec, opts);
      case 'leaf': return renderLeaf(spec, opts);
      default: return '';
    }
  } catch {
    return '';
  }
}

export { LAB_CATALOG, labCatalogEntry } from './catalog.js';
export type { LabCatalogEntry, LabField, LabFieldOption, LabPreset, LabSubject } from './catalog.js';
export { ELEMENTS, elementByZ, elementBySymbol, shellDistribution } from './elements.js';
export type { ElementInfo } from './elements.js';
