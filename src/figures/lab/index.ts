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
import {
  fractionSpecSchema, solidSpecSchema, clockSpecSchema, rulerSpecSchema, protractorSpecSchema, setSquareSpecSchema,
  compassToolSpecSchema, numberSetsSpecSchema, placeValueSpecSchema, diceSpecSchema, coinSpecSchema, abacusSpecSchema, coordinatePointSpecSchema,
  renderFraction, renderSolid, renderClock, renderRuler, renderProtractor, renderSetSquare, renderCompassTool,
  renderNumberSets, renderPlaceValue, renderDice, renderCoin, renderAbacus, renderCoordinatePoint,
} from './mathObjects.js';
import {
  compassRoseSpecSchema, globeSpecSchema, seasonsSpecSchema, waterCycleSpecSchema, reliefProfileSpecSchema,
  volcanoSpecSchema, rockLayersSpecSchema, weatherInstrumentSpecSchema, climateBarSpecSchema, mapSymbolSpecSchema, scaleBarSpecSchema,
  renderCompassRose, renderGlobe, renderSeasons, renderWaterCycle, renderReliefProfile, renderVolcano,
  renderRockLayers, renderWeatherInstrument, renderClimateBar, renderMapSymbol, renderScaleBar,
} from './geographyObjects.js';
import {
  deviceSpecSchema, flowSymbolSpecSchema, logicGateSpecSchema, binarySpecSchema, variableBoxSpecSchema,
  fileIconSpecSchema, networkSpecSchema, scratchBlockSpecSchema, storageUnitsSpecSchema,
  renderDevice, renderFlowSymbol, renderLogicGate, renderBinary, renderVariableBox,
  renderFileIcon, renderNetwork, renderScratchBlock, renderStorageUnits,
} from './informaticsObjects.js';

export const LAB_KINDS = [
  'battery', 'resistor', 'switch', 'lamp', 'meter', 'wire', 'body', 'vector', 'charged_sphere', 'wave',
  'atom', 'element_card', 'formula', 'bond', 'glassware', 'burner', 'heating', 'thermometer', 'balance', 'funnel', 'filter_paper',
  'cell', 'microscope', 'petri_dish', 'magnifier', 'plant', 'seed', 'leaf',
  // رياضيات
  'fraction', 'solid', 'clock', 'ruler', 'protractor', 'set_square', 'compass_tool', 'number_sets', 'place_value', 'dice', 'coin', 'abacus', 'coordinate_point',
  // جغرافيا
  'compass_rose', 'globe', 'seasons', 'water_cycle', 'relief_profile', 'volcano', 'rock_layers', 'weather_instrument', 'climate_bar', 'map_symbol', 'scale_bar',
  // إعلام آلي
  'device', 'flow_symbol', 'logic_gate', 'binary', 'variable_box', 'file_icon', 'network', 'scratch_block', 'storage_units',
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
  // رياضيات
  fractionSpecSchema, solidSpecSchema, clockSpecSchema, rulerSpecSchema, protractorSpecSchema, setSquareSpecSchema,
  compassToolSpecSchema, numberSetsSpecSchema, placeValueSpecSchema, diceSpecSchema, coinSpecSchema, abacusSpecSchema, coordinatePointSpecSchema,
  // جغرافيا
  compassRoseSpecSchema, globeSpecSchema, seasonsSpecSchema, waterCycleSpecSchema, reliefProfileSpecSchema,
  volcanoSpecSchema, rockLayersSpecSchema, weatherInstrumentSpecSchema, climateBarSpecSchema, mapSymbolSpecSchema, scaleBarSpecSchema,
  // إعلام آلي
  deviceSpecSchema, flowSymbolSpecSchema, logicGateSpecSchema, binarySpecSchema, variableBoxSpecSchema,
  fileIconSpecSchema, networkSpecSchema, scratchBlockSpecSchema, storageUnitsSpecSchema,
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
      // رياضيات
      case 'fraction': return renderFraction(spec, opts);
      case 'solid': return renderSolid(spec, opts);
      case 'clock': return renderClock(spec, opts);
      case 'ruler': return renderRuler(spec, opts);
      case 'protractor': return renderProtractor(spec, opts);
      case 'set_square': return renderSetSquare(spec, opts);
      case 'compass_tool': return renderCompassTool(spec, opts);
      case 'number_sets': return renderNumberSets(spec, opts);
      case 'place_value': return renderPlaceValue(spec, opts);
      case 'dice': return renderDice(spec, opts);
      case 'coin': return renderCoin(spec, opts);
      case 'abacus': return renderAbacus(spec, opts);
      case 'coordinate_point': return renderCoordinatePoint(spec, opts);
      // جغرافيا
      case 'compass_rose': return renderCompassRose(spec, opts);
      case 'globe': return renderGlobe(spec, opts);
      case 'seasons': return renderSeasons(spec, opts);
      case 'water_cycle': return renderWaterCycle(spec, opts);
      case 'relief_profile': return renderReliefProfile(spec, opts);
      case 'volcano': return renderVolcano(spec, opts);
      case 'rock_layers': return renderRockLayers(spec, opts);
      case 'weather_instrument': return renderWeatherInstrument(spec, opts);
      case 'climate_bar': return renderClimateBar(spec, opts);
      case 'map_symbol': return renderMapSymbol(spec, opts);
      case 'scale_bar': return renderScaleBar(spec, opts);
      // إعلام آلي
      case 'device': return renderDevice(spec, opts);
      case 'flow_symbol': return renderFlowSymbol(spec, opts);
      case 'logic_gate': return renderLogicGate(spec, opts);
      case 'binary': return renderBinary(spec, opts);
      case 'variable_box': return renderVariableBox(spec, opts);
      case 'file_icon': return renderFileIcon(spec, opts);
      case 'network': return renderNetwork(spec, opts);
      case 'scratch_block': return renderScratchBlock(spec, opts);
      case 'storage_units': return renderStorageUnits(spec, opts);
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
