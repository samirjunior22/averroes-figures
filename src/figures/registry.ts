// ============================================================
// Figure Registry — مُوزِّع المولّدات + واجهة عامة موحّدة
// ============================================================
// يكتشف نوع المولّد من حقل gen ويمرّر المواصفات للمولّد المناسب.
// كل المولّدات مستقلّة في ملفاتها الخاصة.
// لا يرمي أبداً — gen/spec غير صالح → ''.
// ============================================================

import { z } from 'zod';
import { geometrySpecSchema, renderGeometry } from './geometry.js';
import { chartSpecSchema, renderChart } from './chart.js';
import { setupSpecSchema, renderSetup } from './setup.js';
import { circuitSpecSchema, renderCircuit } from './circuit.js';
import { forcesSpecSchema, renderForces } from './forces.js';
import { numberLineSpecSchema, renderNumberLine } from './number_line.js';
import { functionPlotSpecSchema, renderFunctionPlot } from './function_plot.js';
import { moleculeSpecSchema, renderMolecule } from './molecule.js';
import { raysSpecSchema, renderRays } from './rays.js';

// ------------------------------------------------------------
// المُوزِّع العام
// ------------------------------------------------------------
export const FIGURE_GENS = ['circuit', 'geometry', 'chart', 'setup', 'forces', 'number_line', 'function_plot', 'molecule', 'rays'] as const;
export type FigureGen = (typeof FIGURE_GENS)[number];

/** مواصفات الشكل حسب المولّد. */
export interface FigureInput {
  gen: FigureGen;
  spec: unknown;
}

/** يُصيّر كتلة شكل معلَمي إلى SVG. gen/spec غير صالح → '' (لا يكسر التصيير). */
export function renderFigure(input: FigureInput): string {
  try {
    if (input.gen === 'circuit') {
      const parsed = circuitSpecSchema.safeParse(input.spec);
      return parsed.success ? renderCircuit(parsed.data) : '';
    }
    if (input.gen === 'geometry') {
      const parsed = geometrySpecSchema.safeParse(input.spec);
      return parsed.success ? renderGeometry(parsed.data) : '';
    }
    if (input.gen === 'chart') {
      const parsed = chartSpecSchema.safeParse(input.spec);
      return parsed.success ? renderChart(parsed.data) : '';
    }
    if (input.gen === 'setup') {
      const parsed = setupSpecSchema.safeParse(input.spec);
      return parsed.success ? renderSetup(parsed.data) : '';
    }
    if (input.gen === 'forces') {
      const parsed = forcesSpecSchema.safeParse(input.spec);
      return parsed.success ? renderForces(parsed.data) : '';
    }
    if (input.gen === 'number_line') {
      const parsed = numberLineSpecSchema.safeParse(input.spec);
      return parsed.success ? renderNumberLine(parsed.data) : '';
    }
    if (input.gen === 'function_plot') {
      const parsed = functionPlotSpecSchema.safeParse(input.spec);
      return parsed.success ? renderFunctionPlot(parsed.data) : '';
    }
    if (input.gen === 'molecule') {
      const parsed = moleculeSpecSchema.safeParse(input.spec);
      return parsed.success ? renderMolecule(parsed.data) : '';
    }
    if (input.gen === 'rays') {
      const parsed = raysSpecSchema.safeParse(input.spec);
      return parsed.success ? renderRays(parsed.data) : '';
    }
  } catch {
    // مبدأ "لا يرمي أبداً"
  }
  return '';
}