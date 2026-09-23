// ============================================================
// lab/geographyObjects — كائنات الجغرافيا المفردة للمخبر والسبورة
// ============================================================
// وردة الرياح، الكرة الأرضية، تعاقب الفصول، دورة الماء، مقطع تضاريسي،
// مقطع بركان، طبقات الصخور، أجهزة الأرصاد، المخطط المناخي، رموز الخريطة، ومقياس الرسم.
// ============================================================

import { z } from 'zod';
import { wrapSvg, type RenderOptions, resolveFont, esc } from '../shared.js';
import {
  uid,
  badge,
  label,
  linGrad,
  metalGrad,
  shadowDef,
  darken,
  lighten,
  glossSphere,
} from './style.js';

// ------------------------------------------------------------
// المخطّطات
// ------------------------------------------------------------

export const compassRoseSpecSchema = z.object({
  kind: z.literal('compass_rose'),
  style: z.enum(['simple', 'full']).optional(),
  labelsMode: z.enum(['full', 'numbered', 'none']).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const globeSpecSchema = z.object({
  kind: z.literal('globe'),
  highlight: z.enum(['equator', 'meridian', 'tropics', 'none']).optional(),
  tilt: z.number().optional(),
  labelsMode: z.enum(['full', 'numbered', 'none']).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const seasonsSpecSchema = z.object({
  kind: z.literal('seasons'),
  season: z.enum(['summer', 'winter', 'spring', 'autumn']).optional(),
  labelsMode: z.enum(['full', 'numbered', 'none']).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const waterCycleSpecSchema = z.object({
  kind: z.literal('water_cycle'),
  labelsMode: z.enum(['full', 'numbered', 'none']).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const reliefProfileSpecSchema = z.object({
  kind: z.literal('relief_profile'),
  heights: z.array(z.number()).max(10).optional(),
  labels: z.array(z.string().max(20)).max(10).optional(),
  labelsMode: z.enum(['full', 'numbered', 'none']).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const volcanoSpecSchema = z.object({
  kind: z.literal('volcano'),
  focus: z.enum(['all', 'chamber', 'conduit', 'crater', 'cloud']).optional(),
  erupting: z.boolean().optional(),
  labelsMode: z.enum(['full', 'numbered', 'none']).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const rockLayersSpecSchema = z.object({
  kind: z.literal('rock_layers'),
  layers: z.number().int().min(2).max(6).optional(),
  labelsMode: z.enum(['full', 'numbered', 'none']).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const weatherInstrumentSpecSchema = z.object({
  kind: z.literal('weather_instrument'),
  type: z.enum(['thermometer', 'rain_gauge', 'anemometer', 'barometer', 'wind_vane']).optional(),
  value: z.number().optional(),
  labelsMode: z.enum(['full', 'numbered', 'none']).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const climateBarSpecSchema = z.object({
  kind: z.literal('climate_bar'),
  temps: z.array(z.number()).max(12).optional(),
  rains: z.array(z.number()).max(12).optional(),
  city: z.string().max(30).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const mapSymbolSpecSchema = z.object({
  kind: z.literal('map_symbol'),
  symbol: z.enum(['city', 'capital', 'river', 'mountain', 'road', 'railway', 'border', 'port', 'airport']).optional(),
  label: z.string().max(30).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const scaleBarSpecSchema = z.object({
  kind: z.literal('scale_bar'),
  km: z.number().min(1).max(1000).optional(),
  divisions: z.number().int().min(2).max(5).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export type CompassRoseSpec = z.infer<typeof compassRoseSpecSchema>;
export type GlobeSpec = z.infer<typeof globeSpecSchema>;
export type SeasonsSpec = z.infer<typeof seasonsSpecSchema>;
export type WaterCycleSpec = z.infer<typeof waterCycleSpecSchema>;
export type ReliefProfileSpec = z.infer<typeof reliefProfileSpecSchema>;
export type VolcanoSpec = z.infer<typeof volcanoSpecSchema>;
export type RockLayersSpec = z.infer<typeof rockLayersSpecSchema>;
export type WeatherInstrumentSpec = z.infer<typeof weatherInstrumentSpecSchema>;
export type ClimateBarSpec = z.infer<typeof climateBarSpecSchema>;
export type MapSymbolSpec = z.infer<typeof mapSymbolSpecSchema>;
export type ScaleBarSpec = z.infer<typeof scaleBarSpecSchema>;

// ------------------------------------------------------------
// 1. وردة الرياح (Compass Rose)
// ------------------------------------------------------------
export function renderCompassRose(spec: CompassRoseSpec, opts?: RenderOptions): string {
  const W = 220, H = 220, id = `rose-${uid()}`, font = resolveFont(opts);
  const isFull = (spec.style ?? 'full') === 'full';
  const mode = spec.labelsMode ?? 'full';
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const cx = W / 2, cy = H / 2, r = 76;
  const parts: string[] = [];

  const nCol = isPrint ? '#0f172a' : '#ef4444';
  const sCol = isPrint ? '#475569' : '#3b82f6';
  const darkCol = isPrint ? '#334155' : '#1e293b';
  const lightCol = isPrint ? '#f1f5f9' : '#ffffff';

  parts.push(`<defs>${shadowDef(`${id}-sh`, 3, 4)}</defs>`);
  parts.push(`<circle cx="${cx}" cy="${cy}" r="${r + 10}" fill="none" stroke="${darkCol}" stroke-width="1.2" stroke-dasharray="3 3"/>`);
  parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${darkCol}" stroke-width="1.8"/>`);

  const drawPoint = (ang: number, len: number, w: number, fill1: string, fill2: string) => {
    const rad = (ang * Math.PI) / 180;
    const px = cx + len * Math.sin(rad), py = cy - len * Math.cos(rad);
    const lx = cx + w * Math.sin(rad - Math.PI / 2), ly = cy - w * Math.cos(rad - Math.PI / 2);
    const rx = cx + w * Math.sin(rad + Math.PI / 2), ry = cy - w * Math.cos(rad + Math.PI / 2);
    return (
      `<polygon points="${cx},${cy} ${px.toFixed(1)},${py.toFixed(1)} ${lx.toFixed(1)},${ly.toFixed(1)}" fill="${fill1}"/>` +
      `<polygon points="${cx},${cy} ${px.toFixed(1)},${py.toFixed(1)} ${rx.toFixed(1)},${ry.toFixed(1)}" fill="${fill2}"/>`
    );
  };

  parts.push(`<g filter="url(#${id}-sh)">`);
  if (isFull) {
    // الاتجاهات الفرعية
    for (const deg of [45, 135, 225, 315]) {
      parts.push(drawPoint(deg, r * 0.7, 9, darkCol, lightCol));
    }
  }
  // الاتجاهات الرئيسية
  parts.push(drawPoint(0, r * 0.95, 12, nCol, lightCol));
  parts.push(drawPoint(90, r * 0.95, 12, darkCol, lightCol));
  parts.push(drawPoint(180, r * 0.95, 12, sCol, lightCol));
  parts.push(drawPoint(270, r * 0.95, 12, darkCol, lightCol));
  parts.push(`</g>`);
  parts.push(`<circle cx="${cx}" cy="${cy}" r="6" fill="${darkCol}" stroke="${lightCol}" stroke-width="1.5"/>`);

  if (mode !== 'none') {
    if (mode === 'numbered') {
      const dirs = [
        { x: cx, y: cy - r - 14, n: 1 },
        { x: cx + r + 14, y: cy + 4, n: 2 },
        { x: cx, y: cy + r + 18, n: 3 },
        { x: cx - r - 14, y: cy + 4, n: 4 },
      ];
      for (const d of dirs) {
        parts.push(`<circle cx="${d.x}" cy="${d.y}" r="8" fill="#1e293b"/>`);
        parts.push(`<text x="${d.x}" y="${d.y + 3}" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">${d.n}</text>`);
      }
    } else {
      parts.push(`<text x="${cx}" y="${cy - r - 14}" font-size="12" font-family="${font}" font-weight="bold" text-anchor="middle" fill="${nCol}">شمال (N)</text>`);
      parts.push(`<text x="${cx + r + 14}" y="${cy + 4}" font-size="11" font-family="${font}" font-weight="bold" text-anchor="start" fill="${darkCol}">شرق (E)</text>`);
      parts.push(`<text x="${cx}" y="${cy + r + 20}" font-size="11" font-family="${font}" font-weight="bold" text-anchor="middle" fill="${sCol}">جنوب (S)</text>`);
      parts.push(`<text x="${cx - r - 14}" y="${cy + 4}" font-size="11" font-family="${font}" font-weight="bold" text-anchor="end" fill="${darkCol}">غرب (W)</text>`);
    }
  }

  return wrapSvg(parts.join(''), W, H, `وردة الرياح`, opts);
}

// ------------------------------------------------------------
// 2. الكرة الأرضية (Globe)
// ------------------------------------------------------------
export function renderGlobe(spec: GlobeSpec, opts?: RenderOptions): string {
  const W = 220, H = 220, id = `glb-${uid()}`, font = resolveFont(opts);
  const hl = spec.highlight ?? 'none';
  const mode = spec.labelsMode ?? 'full';
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const cx = W / 2, cy = H / 2, r = 70;
  const parts: string[] = [];

  const ocean1 = isPrint ? '#f1f5f9' : '#bae6fd';
  const ocean2 = isPrint ? '#cbd5e1' : '#0284c7';
  const strokeCol = isPrint ? '#0f172a' : '#0369a1';
  const equatorCol = isPrint ? '#0f172a' : '#ef4444';
  const meridianCol = isPrint ? '#0f172a' : '#10b981';
  const tropicsCol = isPrint ? '#475569' : '#f59e0b';

  parts.push(`<defs><radialGradient id="${id}-oc" cx="35%" cy="30%" r="70%"><stop offset="0%" stop-color="${ocean1}"/><stop offset="70%" stop-color="${ocean2}"/><stop offset="100%" stop-color="${darken(ocean2, 0.4)}"/></radialGradient>${shadowDef(`${id}-sh`, 4, 4)}</defs>`);

  // محور مائل 23.5 درجة
  parts.push(`<line x1="${cx - 30}" y1="${cy - r - 18}" x2="${cx + 30}" y2="${cy + r + 18}" stroke="#475569" stroke-width="4" stroke-linecap="round"/>`);
  // كرة الأرض
  parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id}-oc)" stroke="${strokeCol}" stroke-width="2" filter="url(#${id}-sh)"/>`);

  // دوائر العرض
  // مدار السرطان (شمالاً)
  const isTrop = hl === 'tropics';
  const opTrop = hl === 'none' || isTrop ? 1 : 0.25;
  parts.push(`<ellipse cx="${cx}" cy="${cy - 26}" rx="${r * 0.92}" ry="14" fill="none" stroke="${tropicsCol}" stroke-width="${isTrop ? 2.5 : 1}" stroke-dasharray="4 3" opacity="${opTrop}"/>`);
  // خط الاستواء
  const isEq = hl === 'equator';
  const opEq = hl === 'none' || isEq ? 1 : 0.25;
  parts.push(`<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="18" fill="none" stroke="${equatorCol}" stroke-width="${isEq ? 3 : 1.8}" opacity="${opEq}"/>`);
  // مدار الجدي (جنوباً)
  parts.push(`<ellipse cx="${cx}" cy="${cy + 26}" rx="${r * 0.92}" ry="14" fill="none" stroke="${tropicsCol}" stroke-width="${isTrop ? 2.5 : 1}" stroke-dasharray="4 3" opacity="${opTrop}"/>`);

  // خطوط الطول (غرينتش)
  const isMer = hl === 'meridian';
  const opMer = hl === 'none' || isMer ? 1 : 0.25;
  parts.push(`<ellipse cx="${cx}" cy="${cy}" rx="24" ry="${r}" fill="none" stroke="${meridianCol}" stroke-width="${isMer ? 3 : 1.5}" opacity="${opMer}"/>`);
  parts.push(`<ellipse cx="${cx}" cy="${cy}" rx="50" ry="${r}" fill="none" stroke="${strokeCol}" stroke-width="1" stroke-dasharray="3 3" opacity="0.4"/>`);

  if (mode === 'full') {
    if (hl === 'equator') parts.push(badge(cx, H - 15, 'خط الاستواء (0°)', { font, size: 10, bg: equatorCol }));
    else if (hl === 'meridian') parts.push(badge(cx, H - 15, 'خط غرينتش (0°)', { font, size: 10, bg: meridianCol }));
    else if (hl === 'tropics') parts.push(badge(cx, H - 15, 'المداران (السرطان والجدي)', { font, size: 10, bg: tropicsCol }));
  }

  return wrapSvg(parts.join(''), W, H, `الكرة الأرضية وإحداثياتها`, opts);
}

// ------------------------------------------------------------
// 3. تعاقب الفصول (Seasons)
// ------------------------------------------------------------
export function renderSeasons(spec: SeasonsSpec, opts?: RenderOptions): string {
  const W = 280, H = 220, id = `sea-${uid()}`, font = resolveFont(opts);
  const curSeason = spec.season ?? 'summer';
  const mode = spec.labelsMode ?? 'full';
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const cx = 140, cy = 110;
  const parts: string[] = [];

  parts.push(`<defs>${shadowDef(`${id}-sh`, 3, 3)}</defs>`);

  // المدار الإهليلجي
  parts.push(`<ellipse cx="${cx}" cy="${cy}" rx="110" ry="60" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 4"/>`);

  // الشمس في المركز
  const sunCol = isPrint ? '#0f172a' : '#f59e0b';
  parts.push(glossSphere(cx, cy, 22, sunCol, `${id}-sun`));

  // مواضع الأرض الأربعة
  const positions = [
    { season: 'summer', x: cx + 110, y: cy, label: 'انقلاب صيفي', num: 1 },
    { season: 'winter', x: cx - 110, y: cy, label: 'انقلاب شتوي', num: 2 },
    { season: 'spring', x: cx, y: cy - 60, label: 'اعتدال ربيعي', num: 3 },
    { season: 'autumn', x: cx, y: cy + 60, label: 'اعتدال خريفي', num: 4 },
  ];

  for (const p of positions) {
    const isCur = p.season === curSeason;
    const op = isCur ? '1' : '0.35';
    const earthCol = isPrint ? '#475569' : '#0284c7';
    parts.push(`<g opacity="${op}">`);
    // ميل المحور
    parts.push(`<line x1="${p.x - 7}" y1="${p.y - 18}" x2="${p.x + 7}" y2="${p.y + 18}" stroke="#334155" stroke-width="2"/>`);
    parts.push(`<circle cx="${p.x}" cy="${p.y}" r="12" fill="${earthCol}" stroke="#0f172a" stroke-width="1.2"/>`);
    parts.push(`</g>`);

    if (mode === 'numbered') {
      parts.push(`<circle cx="${p.x}" cy="${p.y + 24}" r="8" fill="#1e293b"/>`);
      parts.push(`<text x="${p.x}" y="${p.y + 27}" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">${p.num}</text>`);
    } else if (mode === 'full' && isCur) {
      parts.push(badge(p.x, p.y - 24, p.label, { font, size: 10, bg: isPrint ? '#0f172a' : '#ea580c' }));
    }
  }

  return wrapSvg(parts.join(''), W, H, `تعاقب الفصول حول الشمس`, opts);
}

// ------------------------------------------------------------
// 4. دورة الماء (Water Cycle)
// ------------------------------------------------------------
export function renderWaterCycle(spec: WaterCycleSpec, opts?: RenderOptions): string {
  const W = 280, H = 220, id = `wtr-${uid()}`, font = resolveFont(opts);
  const mode = spec.labelsMode ?? 'full';
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const parts: string[] = [];
  const skyCol = isPrint ? '#f8fafc' : '#f0f9ff';
  const mtnCol = isPrint ? '#64748b' : '#15803d';
  const seaCol = isPrint ? '#94a3b8' : '#0284c7';

  parts.push(`<defs>${shadowDef(`${id}-sh`, 2, 3)}</defs>`);

  // سماء وجبل وبحر
  parts.push(`<rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="10" fill="${skyCol}" stroke="#cbd5e1" stroke-width="1"/>`);
  // جبل (يسار)
  parts.push(`<polygon points="10,180 85,60 160,180" fill="${mtnCol}"/>`);
  parts.push(`<polygon points="85,60 70,85 100,85" fill="#ffffff"/>`); // قمة ثلجية
  // بحر (يمين)
  parts.push(`<rect x="150" y="150" width="${W - 170}" height="40" fill="${seaCol}"/>`);

  // شمس
  parts.push(`<circle cx="230" cy="40" r="16" fill="${isPrint ? '#475569' : '#f59e0b'}"/>`);

  // سحب وأمطار
  parts.push(`<ellipse cx="95" cy="45" rx="25" ry="12" fill="#e2e8f0" stroke="#94a3b8"/>`);
  parts.push(`<ellipse cx="115" cy="42" rx="18" ry="10" fill="#e2e8f0" stroke="#94a3b8"/>`);
  // خطوط مطر
  parts.push(`<line x1="90" y1="62" x2="85" y2="76" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="2 2"/>`);
  parts.push(`<line x1="105" y1="62" x2="100" y2="76" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="2 2"/>`);

  // أسهم تبخر (من البحر للأعلى)
  parts.push(`<path d="M 210,140 Q 215,110 205,80" fill="none" stroke="${isPrint ? '#0f172a' : '#ef4444'}" stroke-width="2" stroke-dasharray="3 3"/>`);
  parts.push(`<polygon points="205,80 201,88 209,88" fill="${isPrint ? '#0f172a' : '#ef4444'}"/>`);

  // أسهم جريان (من الجبل للبحر)
  parts.push(`<path d="M 120,155 Q 140,165 170,160" fill="none" stroke="#0284c7" stroke-width="2"/>`);

  if (mode === 'numbered') {
    const steps = [
      { x: 225, y: 110, n: 1 }, // تبخر
      { x: 130, y: 35, n: 2 },  // تكاثف
      { x: 70, y: 80, n: 3 },   // تساقط
      { x: 140, y: 175, n: 4 }, // جريان
    ];
    for (const s of steps) {
      parts.push(`<circle cx="${s.x}" cy="${s.y}" r="8" fill="#1e293b"/>`);
      parts.push(`<text x="${s.x}" y="${s.y + 3}" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">${s.n}</text>`);
    }
  } else if (mode === 'full') {
    parts.push(label(235, 110, '1. تبخر', { font, size: 9, bold: true, color: '#0f172a' }));
    parts.push(label(125, 25, '2. تكاثف', { font, size: 9, bold: true, color: '#0f172a' }));
    parts.push(label(55, 75, '3. تساقط', { font, size: 9, bold: true, color: '#0f172a' }));
    parts.push(label(140, 195, '4. جريان سطحي', { font, size: 9, bold: true, color: '#0f172a' }));
  }

  return wrapSvg(parts.join(''), W, H, `دورة الماء في الطبيعة`, opts);
}

// ------------------------------------------------------------
// 5. مقطع تضاريسي (Relief Profile)
// ------------------------------------------------------------
export function renderReliefProfile(spec: ReliefProfileSpec, opts?: RenderOptions): string {
  const W = 280, H = 180, id = `rlf-${uid()}`, font = resolveFont(opts);
  const heights = spec.heights ?? [100, 450, 800, 600, 300, 50];
  const labels = spec.labels ?? ['سهل', 'هضبة', 'قمة', 'واد', 'تلة', 'بحر'];
  const mode = spec.labelsMode ?? 'full';
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const parts: string[] = [];
  const maxH = 1000;
  const baseY = 135, plotH = 90;
  const startX = 40, endX = W - 25;
  const stepX = (endX - startX) / (heights.length - 1);

  parts.push(`<defs>${linGrad(`${id}-g`, [[0, isPrint ? '#94a3b8' : '#15803d'], [1, isPrint ? '#475569' : '#78350f']])}${shadowDef(`${id}-sh`, 2, 3)}</defs>`);

  // محاور الارتفاع
  parts.push(`<line x1="${startX}" y1="${baseY}" x2="${endX}" y2="${baseY}" stroke="#0f172a" stroke-width="1.5"/>`);
  parts.push(`<line x1="${startX}" y1="${baseY}" x2="${startX}" y2="${baseY - plotH - 10}" stroke="#0f172a" stroke-width="1.5"/>`);
  parts.push(`<text x="${startX - 8}" y="${baseY - plotH}" font-size="8" font-family="${font}" text-anchor="end" fill="#64748b">1000m</text>`);
  parts.push(`<text x="${startX - 8}" y="${baseY}" font-size="8" font-family="${font}" text-anchor="end" fill="#64748b">0m</text>`);

  // بناء مسار التضاريس
  const pts: [number, number][] = [];
  for (let i = 0; i < heights.length; i++) {
    const x = startX + i * stepX;
    const y = baseY - (Math.min(heights[i]!, maxH) / maxH) * plotH;
    pts.push([x, y]);
  }

  let d = `M ${pts[0]![0]},${pts[0]![1]}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i]![0].toFixed(1)},${pts[i]![1].toFixed(1)}`;
  }
  const fillD = `${d} L ${pts[pts.length - 1]![0]},${baseY} L ${pts[0]![0]},${baseY} Z`;

  parts.push(`<path d="${fillD}" fill="url(#${id}-g)" opacity="0.85"/>`);
  parts.push(`<path d="${d}" fill="none" stroke="${isPrint ? '#0f172a' : '#14532d'}" stroke-width="2.2"/>`);

  if (mode !== 'none') {
    for (let i = 0; i < pts.length; i++) {
      const [px, py] = pts[i]!;
      parts.push(`<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="3" fill="#0f172a"/>`);
      if (mode === 'numbered') {
        parts.push(`<text x="${px.toFixed(1)}" y="${py - 8}" font-size="9" font-weight="bold" text-anchor="middle" fill="#0f172a">${i + 1}</text>`);
      } else if (labels[i]) {
        parts.push(`<text x="${px.toFixed(1)}" y="${py - 7}" font-size="8" font-family="${font}" text-anchor="middle" fill="#0f172a">${esc(labels[i]!)}</text>`);
      }
    }
  }

  parts.push(badge(W / 2, H - 14, `مقطع تضاريسي طوبوغرافي`, { font, size: 10 }));
  return wrapSvg(parts.join(''), W, H, `مقطع تضاريسي`, opts);
}

// ------------------------------------------------------------
// 6. مقطع بركان (Volcano)
// ------------------------------------------------------------
export function renderVolcano(spec: VolcanoSpec, opts?: RenderOptions): string {
  const W = 280, H = 220, id = `vol-${uid()}`, font = resolveFont(opts);
  const focus = spec.focus ?? 'all';
  const erupting = spec.erupting ?? true;
  const mode = spec.labelsMode ?? 'full';
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const parts: string[] = [];
  const lavaCol = isPrint ? '#0f172a' : '#ef4444';
  const mtnCol = isPrint ? '#64748b' : '#78350f';

  const opChamber = focus === 'all' || focus === 'chamber' ? '1' : '0.35';
  const opConduit = focus === 'all' || focus === 'conduit' ? '1' : '0.35';
  const opCrater = focus === 'all' || focus === 'crater' ? '1' : '0.35';
  const opCloud = focus === 'all' || focus === 'cloud' ? '1' : '0.35';

  parts.push(`<defs>${shadowDef(`${id}-sh`, 2, 4)}</defs>`);

  // سفح البركان والطبقات
  parts.push(`<polygon points="25,190 120,90 160,90 255,190" fill="${mtnCol}" stroke="#451a03" stroke-width="1.5"/>`);
  parts.push(`<polygon points="45,190 128,105 152,105 235,190" fill="${lighten(mtnCol, 0.2)}" opacity="0.6"/>`);

  // غرفة الصهارة (Magma Chamber)
  parts.push(`<g opacity="${opChamber}">`);
  parts.push(`<ellipse cx="140" cy="180" rx="42" ry="18" fill="${lavaCol}" filter="url(#${id}-sh)"/>`);
  parts.push(`</g>`);

  // المدخنة الرئيسية (Conduit)
  parts.push(`<g opacity="${opConduit}">`);
  parts.push(`<path d="M 134,180 L 134,92 L 146,92 L 146,180 Z" fill="${lavaCol}"/>`);
  parts.push(`</g>`);

  // الفوهة (Crater)
  parts.push(`<g opacity="${opCrater}">`);
  parts.push(`<ellipse cx="140" cy="90" rx="20" ry="7" fill="${darken(lavaCol, 0.3)}" stroke="#0f172a" stroke-width="1.2"/>`);
  parts.push(`</g>`);

  // سحابة الرماد والمقذوفات
  if (erupting) {
    parts.push(`<g opacity="${opCloud}">`);
    const ashCol = isPrint ? '#94a3b8' : '#475569';
    parts.push(`<ellipse cx="140" cy="55" rx="36" ry="22" fill="${ashCol}" opacity="0.85"/>`);
    parts.push(`<ellipse cx="120" cy="45" rx="25" ry="16" fill="${ashCol}" opacity="0.9"/>`);
    parts.push(`<ellipse cx="160" cy="48" rx="28" ry="18" fill="${ashCol}" opacity="0.85"/>`);
    // شظايا بركانية
    parts.push(`<circle cx="115" cy="72" r="3" fill="${lavaCol}"/>`);
    parts.push(`<circle cx="165" cy="70" r="3.5" fill="${lavaCol}"/>`);
    parts.push(`</g>`);
  }

  if (mode === 'numbered') {
    const labelsPos = [
      { x: 195, y: 180, n: 1 }, // غرفة الصهارة
      { x: 115, y: 135, n: 2 }, // مدخنة
      { x: 175, y: 92, n: 3 },  // فوهة
      { x: 210, y: 48, n: 4 },  // سحابة
    ];
    for (const p of labelsPos) {
      parts.push(`<circle cx="${p.x}" cy="${p.y}" r="8" fill="#1e293b"/>`);
      parts.push(`<text x="${p.x}" y="${p.y + 3}" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">${p.n}</text>`);
    }
  } else if (mode === 'full') {
    parts.push(label(140, 205, '1. غرفة الصهارة (الماغما)', { font, size: 9, bold: true, color: '#0f172a' }));
    parts.push(label(75, 135, '2. المدخنة', { font, size: 9, bold: true, color: '#0f172a' }));
    parts.push(label(195, 92, '3. الفوهة', { font, size: 9, bold: true, color: '#0f172a' }));
    parts.push(label(225, 40, '4. نواتج الاندفاع', { font, size: 9, bold: true, color: '#0f172a' }));
  }

  return wrapSvg(parts.join(''), W, H, `مقطع بركان اندفاعي`, opts);
}

// ------------------------------------------------------------
// 7. طبقات الصخور (Rock Layers)
// ------------------------------------------------------------
export function renderRockLayers(spec: RockLayersSpec, opts?: RenderOptions): string {
  const W = 240, H = 210, id = `rck-${uid()}`, font = resolveFont(opts);
  const nLayers = Math.max(2, Math.min(6, spec.layers ?? 4));
  const mode = spec.labelsMode ?? 'full';
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const parts: string[] = [];
  parts.push(`<defs>${shadowDef(`${id}-sh`, 2, 4)}</defs>`);

  const layerDefs = [
    { col: isPrint ? '#e2e8f0' : '#fef08a', name: 'طمي حديث' },
    { col: isPrint ? '#cbd5e1' : '#fde047', name: 'حجر رملي' },
    { col: isPrint ? '#94a3b8' : '#a3e635', name: 'كلسي مع أحافير' },
    { col: isPrint ? '#64748b' : '#38bdf8', name: 'طين غضاري' },
    { col: isPrint ? '#475569' : '#fb923c', name: 'صخر رسوبي' },
    { col: isPrint ? '#334155' : '#818cf8', name: 'صخر بلوري قديم' },
  ];

  const bx = 25, by = 25, bw = 190, totalH = 150;
  const lH = totalH / nLayers;

  parts.push(`<g filter="url(#${id}-sh)">`);
  for (let i = 0; i < nLayers; i++) {
    const ly = by + i * lH;
    const def = layerDefs[i]!;
    parts.push(`<rect x="${bx}" y="${ly}" width="${bw}" height="${lH}" fill="${def.col}" stroke="#0f172a" stroke-width="1.2"/>`);

    // زخرفة تنقيط أو خطوط
    if (i % 2 === 1) {
      parts.push(`<line x1="${bx}" y1="${ly + lH / 2}" x2="${bx + bw}" y2="${ly + lH / 2}" stroke="#0f172a" stroke-width="0.8" stroke-dasharray="4 4"/>`);
    }

    if (mode === 'numbered') {
      parts.push(`<circle cx="${bx + 20}" cy="${ly + lH / 2}" r="8" fill="#1e293b"/>`);
      parts.push(`<text x="${bx + 20}" y="${ly + lH / 2 + 3}" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">${i + 1}</text>`);
    } else if (mode === 'full') {
      parts.push(`<text x="${bx + bw / 2}" y="${ly + lH / 2 + 4}" font-size="10" font-family="${font}" font-weight="bold" text-anchor="middle" fill="#0f172a">${def.name}</text>`);
    }
  }
  parts.push(`</g>`);

  parts.push(label(W / 2, H - 12, 'طبقات رسوبية جيولوجية', { font, size: 10, bold: true }));
  return wrapSvg(parts.join(''), W, H, `طبقات الصخور والترسبات`, opts);
}

// ------------------------------------------------------------
// 8. أجهزة الأرصاد (Weather Instrument)
// ------------------------------------------------------------
export function renderWeatherInstrument(spec: WeatherInstrumentSpec, opts?: RenderOptions): string {
  const W = 200, H = 220, id = `winst-${uid()}`, font = resolveFont(opts);
  const type = spec.type ?? 'thermometer';
  const val = spec.value ?? (type === 'thermometer' ? 24 : 1013);
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const parts: string[] = [];
  parts.push(`<defs>${shadowDef(`${id}-sh`, 3, 3)}</defs>`);

  if (type === 'thermometer') {
    const cx = W / 2;
    // محرار كحولي/زئبقي
    parts.push(`<rect x="${cx - 18}" y="20" width="36" height="150" rx="10" fill="#f8fafc" stroke="#64748b" stroke-width="2" filter="url(#${id}-sh)"/>`);
    // الأنبوب الداخلي
    parts.push(`<rect x="${cx - 4}" y="35" width="8" height="110" rx="4" fill="#e2e8f0"/>`);
    // مستوى السائل الأحمر
    const liquidH = Math.max(10, Math.min(100, val * 2));
    const fillCol = isPrint ? '#0f172a' : '#ef4444';
    parts.push(`<rect x="${cx - 4}" y="${145 - liquidH}" width="8" height="${liquidH}" rx="4" fill="${fillCol}"/>`);
    // الخزان السفلي
    parts.push(`<circle cx="${cx}" cy="150" r="14" fill="${fillCol}"/>`);
    // تدريجات
    for (let t = 0; t <= 5; t++) {
      const ty = 40 + t * 20;
      parts.push(`<line x1="${cx + 6}" y1="${ty}" x2="${cx + 14}" y2="${ty}" stroke="#0f172a" stroke-width="1"/>`);
      parts.push(`<text x="${cx + 18}" y="${ty + 3}" font-size="8" font-family="${font}" fill="#0f172a">${50 - t * 10}</text>`);
    }
    parts.push(badge(cx, H - 20, `${val} °C`, { font, size: 12, bg: fillCol }));
  } else {
    // بارومتر قياس الضغط
    const cx = W / 2, cy = 95, r = 65;
    const dialCol = isPrint ? '#334155' : '#0284c7';
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#f8fafc" stroke="${dialCol}" stroke-width="4" filter="url(#${id}-sh)"/>`);
    // عقرب القياس
    parts.push(`<line x1="${cx}" y1="${cy}" x2="${cx + 35}" y2="${cy - 30}" stroke="${isPrint ? '#0f172a' : '#ef4444'}" stroke-width="2.5" stroke-linecap="round"/>`);
    parts.push(`<circle cx="${cx}" cy="${cy}" r="5" fill="#0f172a"/>`);
    parts.push(label(cx, cy + 24, 'بارومتر (hPa)', { font, size: 10, bold: true }));
    parts.push(badge(cx, H - 20, `${val} hPa`, { font, size: 12, bg: dialCol }));
  }

  return wrapSvg(parts.join(''), W, H, `جهاز أرصاد — ${type}`, opts);
}

// ------------------------------------------------------------
// 9. المنحنى المناخي (Climate Bar)
// ------------------------------------------------------------
export function renderClimateBar(spec: ClimateBarSpec, opts?: RenderOptions): string {
  const W = 320, H = 220, id = `clm-${uid()}`, font = resolveFont(opts);
  const city = spec.city ?? 'الجزائر العاصمة';
  const temps = spec.temps ?? [12, 13, 15, 18, 22, 26, 29, 30, 26, 21, 16, 13];
  const rains = spec.rains ?? [80, 70, 55, 45, 35, 12, 4, 6, 28, 65, 85, 95];
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const parts: string[] = [];
  const startX = 40, endX = W - 35, baseY = 160, plotH = 110;
  const barW = (endX - startX) / 12;

  parts.push(`<defs>${shadowDef(`${id}-sh`, 2, 3)}</defs>`);

  // إطار ومحاور
  parts.push(`<rect x="${startX}" y="35" width="${endX - startX}" height="${baseY - 35}" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>`);
  parts.push(`<line x1="${startX}" y1="${baseY}" x2="${endX}" y2="${baseY}" stroke="#0f172a" stroke-width="1.5"/>`);

  // أعمدة الأمطار P (أزرق)
  const maxRain = 120;
  const rainCol = isPrint ? '#94a3b8' : '#38bdf8';
  for (let m = 0; m < 12; m++) {
    const rH = ((rains[m] ?? 0) / maxRain) * plotH;
    const rx = startX + m * barW + 2;
    parts.push(`<rect x="${rx}" y="${baseY - rH}" width="${barW - 4}" height="${rH}" fill="${rainCol}" stroke="#0284c7" stroke-width="0.8"/>`);
  }

  // منحنى الحرارة T (أحمر، وفق مقياس P = 2T)
  const maxTemp = maxRain / 2; // 60
  const tempCol = isPrint ? '#0f172a' : '#ef4444';
  const tempPts: [number, number][] = [];
  for (let m = 0; m < 12; m++) {
    const tx = startX + m * barW + barW / 2;
    const ty = baseY - ((temps[m] ?? 0) / maxTemp) * plotH;
    tempPts.push([tx, ty]);
  }

  let lineD = `M ${tempPts[0]![0]},${tempPts[0]![1]}`;
  for (let i = 1; i < tempPts.length; i++) {
    lineD += ` L ${tempPts[i]![0]},${tempPts[i]![1]}`;
  }
  parts.push(`<path d="${lineD}" fill="none" stroke="${tempCol}" stroke-width="2.5"/>`);
  for (const [tx, ty] of tempPts) {
    parts.push(`<circle cx="${tx}" cy="${ty}" r="3" fill="${tempCol}"/>`);
  }

  parts.push(`<text x="${startX - 6}" y="42" font-size="8" font-family="${font}" text-anchor="end" fill="#0284c7">P(mm)</text>`);
  parts.push(`<text x="${endX + 6}" y="42" font-size="8" font-family="${font}" text-anchor="start" fill="${tempCol}">T(°C)</text>`);
  parts.push(label(W / 2, 22, `المنحنى المناخي — ${city}`, { font, size: 11, bold: true }));

  return wrapSvg(parts.join(''), W, H, `منحنى مناخي ${city}`, opts);
}

// ------------------------------------------------------------
// 10. رموز الخريطة (Map Symbol)
// ------------------------------------------------------------
export function renderMapSymbol(spec: MapSymbolSpec, opts?: RenderOptions): string {
  const W = 180, H = 160, id = `sym-${uid()}`, font = resolveFont(opts);
  const symbol = spec.symbol ?? 'capital';
  const txt = spec.label ?? (symbol === 'capital' ? 'عاصمة' : symbol === 'port' ? 'ميناء' : 'معلم');
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const parts: string[] = [];
  const cx = W / 2, cy = 65;

  parts.push(`<defs>${shadowDef(`${id}-sh`, 2, 4)}</defs>`);
  parts.push(`<rect x="25" y="15" width="130" height="100" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" filter="url(#${id}-sh)"/>`);

  if (symbol === 'capital') {
    parts.push(`<circle cx="${cx}" cy="${cy}" r="18" fill="none" stroke="${isPrint ? '#0f172a' : '#ef4444'}" stroke-width="3"/>`);
    parts.push(`<circle cx="${cx}" cy="${cy}" r="8" fill="${isPrint ? '#0f172a' : '#ef4444'}"/>`);
  } else if (symbol === 'mountain') {
    parts.push(`<polygon points="${cx},${cy - 20} ${cx - 22},${cy + 16} ${cx + 22},${cy + 16}" fill="${isPrint ? '#475569' : '#78350f'}"/>`);
    parts.push(`<polygon points="${cx},${cy - 20} ${cx - 8},${cy - 6} ${cx + 8},${cy - 6}" fill="#ffffff"/>`);
  } else if (symbol === 'airport') {
    parts.push(`<path d="M ${cx},${cy - 20} L ${cx + 4},${cy - 5} L ${cx + 22},${cy + 2} L ${cx + 22},${cy + 8} L ${cx + 4},${cy + 5} L ${cx + 2},${cy + 18} L ${cx + 8},${cy + 22} L ${cx - 8},${cy + 22} L ${cx - 2},${cy + 18} L ${cx - 4},${cy + 5} L ${cx - 22},${cy + 8} L ${cx - 22},${cy + 2} L ${cx - 4},${cy - 5} Z" fill="${isPrint ? '#0f172a' : '#0284c7'}"/>`);
  } else {
    // port / general
    parts.push(`<circle cx="${cx}" cy="${cy}" r="16" fill="${isPrint ? '#0f172a' : '#0284c7'}"/>`);
    parts.push(`<text x="${cx}" y="${cy + 5}" font-size="14" fill="#ffffff" text-anchor="middle" font-weight="bold">⚓</text>`);
  }

  parts.push(badge(cx, H - 20, txt, { font, size: 11 }));
  return wrapSvg(parts.join(''), W, H, `رمز خريطة — ${txt}`, opts);
}

// ------------------------------------------------------------
// 11. مقياس الرسم الخطي (Scale Bar)
// ------------------------------------------------------------
export function renderScaleBar(spec: ScaleBarSpec, opts?: RenderOptions): string {
  const W = 260, H = 90, id = `scl-${uid()}`, font = resolveFont(opts);
  const km = spec.km ?? 100;
  const divs = Math.max(2, Math.min(5, spec.divisions ?? 4));
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const parts: string[] = [];
  const barW = 180, barH = 12, startX = (W - barW) / 2, startY = 32;
  const segW = barW / divs;
  const stepKm = km / divs;

  parts.push(`<defs>${shadowDef(`${id}-sh`, 2, 2)}</defs>`);

  for (let i = 0; i < divs; i++) {
    const sx = startX + i * segW;
    const isDark = i % 2 === 0;
    const fillCol = isDark ? (isPrint ? '#000000' : '#1e293b') : '#ffffff';
    parts.push(`<rect x="${sx}" y="${startY}" width="${segW}" height="${barH}" fill="${fillCol}" stroke="#0f172a" stroke-width="1.2"/>`);
    const markVal = Math.round(i * stepKm);
    parts.push(`<text x="${sx}" y="${startY - 6}" font-size="9" font-family="${font}" font-weight="bold" text-anchor="middle" fill="#0f172a">${markVal}</text>`);
  }
  parts.push(`<text x="${startX + barW}" y="${startY - 6}" font-size="9" font-family="${font}" font-weight="bold" text-anchor="middle" fill="#0f172a">${km} km</text>`);

  parts.push(label(W / 2, startY + barH + 22, 'مقياس رسم خطي (Échelle graphique)', { font, size: 10, bold: true }));
  return wrapSvg(parts.join(''), W, H, `مقياس رسم ${km} كم`, opts);
}
