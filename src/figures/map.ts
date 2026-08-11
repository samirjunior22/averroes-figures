// ============================================================
// Map Generator — مولّد الخريطة التخطيطية (جغرافيا)
// ============================================================
// خريطةٌ **تخطيطية** لا جغرافية: إطارٌ وسهم شمال وسلّم رسم ومفتاح، مع معالم
// موقَّعة بإحداثيات نسبية (0..100) ونطاقات مستطيلة مظلَّلة.
//
// الرمز في الـproxy:  [[خريطة:عنوان;مدينة:الجزائر,50,20;جبل:الأطلس,40,45]]
//
// ⚠ **لماذا تخطيطية ولا حدود دول حقيقية؟** رسم حدود بلدٍ من الذاكرة يُنتج
// خريطة خاطئة في وثيقة رسمية يوقّعها المدير — وخطأٌ جغرافي مطبوع أسوأ من
// إطارٍ صريح في تخطيطيته. الحدود الحقيقية تحتاج معطيات جغرافية لا تخميناً.
// ============================================================

import { z } from 'zod';
import type { RenderOptions } from './shared.js';
import {
  esc,
  text,
  wrapSvg,
  resolveColor,
  resolvePalette,
  strokeAttr,
  strokeThinAttr,
  fillAttr,
  truncate,
} from './shared.js';

// ------------------------------------------------------------
// مخطّطات Zod
// ------------------------------------------------------------

/** صنف المَعلَم — يحدّد شكل الرمز في الخريطة والمفتاح. */
export const mapMarkerKindSchema = z.enum(['city', 'capital', 'mountain', 'river', 'port', 'site']);
export type MapMarkerKind = z.infer<typeof mapMarkerKindSchema>;

/** مَعلَم موقَّع بإحداثيات نسبية من 0 إلى 100. */
export const mapMarkerSchema = z
  .object({
    label: z.string().min(1).max(28).describe('اسم المَعلَم'),
    x: z.number().min(0).max(100).describe('الإحداثي الأفقي (0 = الحافة اليسرى)'),
    y: z.number().min(0).max(100).describe('الإحداثي العمودي (0 = الحافة العليا)'),
    kind: mapMarkerKindSchema.optional().describe('صنف المَعلَم (افتراضي: مدينة)'),
  })
  .strict();

export type MapMarker = z.infer<typeof mapMarkerSchema>;

/** نطاق مستطيل مظلَّل (إقليم مناخي، نطاق زراعي، مجال سكاني...). */
export const mapZoneSchema = z
  .object({
    label: z.string().min(1).max(28).describe('اسم النطاق'),
    x: z.number().min(0).max(100),
    y: z.number().min(0).max(100),
    w: z.number().positive().max(100),
    h: z.number().positive().max(100),
  })
  .strict();

export type MapZone = z.infer<typeof mapZoneSchema>;

/** مواصفات مولّد الخريطة التخطيطية. */
export const mapSpecSchema = z
  .object({
    title: z.string().max(60).optional().describe('عنوان الخريطة'),
    markers: z.array(mapMarkerSchema).max(10).optional().describe('المعالم الموقَّعة'),
    zones: z.array(mapZoneSchema).max(4).optional().describe('النطاقات المظلَّلة'),
    /** سهم الشمال. الافتراضي true. */
    compass: z.boolean().optional(),
    /** نصّ سلّم الرسم كما يكتبه الأستاذ («1/1000000»). */
    scale: z.string().max(24).optional(),
  })
  .strict()
  .refine((d) => (d.markers?.length ?? 0) + (d.zones?.length ?? 0) > 0, {
    message: 'map needs at least one marker or zone',
  });

export type MapSpec = z.infer<typeof mapSpecSchema>;

// ------------------------------------------------------------
// ثوابت
// ------------------------------------------------------------

const W = 420;
const H = 320;
const PAD = 14;
const TITLE_H = 22;
const LEGEND_H = 26;
const FRAME_X = PAD;
const FRAME_Y = PAD + TITLE_H;
const FRAME_W = W - PAD * 2;
const FRAME_H = H - FRAME_Y - PAD - LEGEND_H;

const KIND_LABEL: Record<MapMarkerKind, string> = {
  capital: 'عاصمة',
  city: 'مدينة',
  mountain: 'جبل',
  river: 'نهر/واد',
  port: 'ميناء',
  site: 'موقع',
};

/** نسبة 0..100 → إحداثي داخل الإطار. */
const px = (x: number): number => FRAME_X + (x / 100) * FRAME_W;
const py = (y: number): number => FRAME_Y + (y / 100) * FRAME_H;

/**
 * نصّ بهالة بيضاء — يبقى مقروءاً فوق النطاقات المظلَّلة وخطوطها المتقطّعة.
 * `paint-order="stroke"` يرسم الحدّ قبل الحشو فلا يقضم الحرف.
 */
function haloText(x: number, y: number, t: string, size: number, color: string, anchor: 'middle' | 'end' | 'start', bold = false): string {
  const weight = bold ? ' font-weight="bold"' : '';
  return `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}"${weight} fill="${color}" stroke="#ffffff" stroke-width="3.5" paint-order="stroke" stroke-linejoin="round">${esc(t)}</text>`;
}

/** رمز المَعلَم — شكلٌ مميّز لكل صنف كي يُقرأ بلا لون (طباعة أبيض وأسود). */
function markerGlyph(kind: MapMarkerKind, x: number, y: number, color: string): string {
  switch (kind) {
    case 'capital':
      return `<path d="M ${x} ${y - 7} L ${x + 2.2} ${y - 2.2} L ${x + 7} ${y - 2.2} L ${x + 3} ${y + 1.5} L ${x + 4.5} ${y + 6.5} L ${x} ${y + 3.5} L ${x - 4.5} ${y + 6.5} L ${x - 3} ${y + 1.5} L ${x - 7} ${y - 2.2} L ${x - 2.2} ${y - 2.2} Z" ${fillAttr(color)}/>`;
    case 'mountain':
      return `<path d="M ${x - 7} ${y + 5} L ${x} ${y - 6} L ${x + 7} ${y + 5} Z" ${fillAttr(color)}/>`;
    case 'river':
      return `<path d="M ${x - 8} ${y} q 4 -5 8 0 q 4 5 8 0" ${strokeThinAttr(color)}/>`;
    case 'port':
      return `<g ${strokeThinAttr(color)}><line x1="${x}" y1="${y - 6}" x2="${x}" y2="${y + 5}"/><line x1="${x - 4}" y1="${y - 3}" x2="${x + 4}" y2="${y - 3}"/><path d="M ${x - 5} ${y + 1} q 5 8 10 0"/></g>`;
    case 'site':
      return `<rect x="${x - 4.5}" y="${y - 4.5}" width="9" height="9" transform="rotate(45 ${x} ${y})" ${fillAttr(color)}/>`;
    default:
      return `<circle cx="${x}" cy="${y}" r="4.5" fill="#ffffff" stroke="${color}" stroke-width="2"/>`;
  }
}

/** وردة الشمال في الزاوية العليا من الإطار. */
function compassRose(col: string, opts?: RenderOptions): string {
  const cx = FRAME_X + FRAME_W - 22;
  const cy = FRAME_Y + 24;
  return [
    `<path d="M ${cx} ${cy - 14} L ${cx + 5} ${cy + 4} L ${cx} ${cy} L ${cx - 5} ${cy + 4} Z" ${fillAttr(col)}/>`,
    text(cx, cy + 17, 'ش', { size: 10, bold: true }, opts),
  ].join('');
}

// ------------------------------------------------------------
// المُصيّر الرئيسي
// ------------------------------------------------------------

/** يُصيّر خريطة تخطيطية إلى SVG. spec غير صالح → ''. */
export function renderMap(spec: MapSpec, opts?: RenderOptions): string {
  try {
    const col = resolveColor(opts);
    const palette = resolvePalette(opts);
    const parts: string[] = [];

    if (spec.title) parts.push(text(W / 2, 17, spec.title, { size: 13, bold: true }, opts));

    // الإطار
    parts.push(
      `<rect x="${FRAME_X}" y="${FRAME_Y}" width="${FRAME_W}" height="${FRAME_H}" fill="#f8fafc" stroke="${col}" stroke-width="2" rx="4"/>`,
    );

    // النطاقات أوّلاً كي تبقى تحت المعالم
    (spec.zones ?? []).forEach((z, i) => {
      const color = palette[i % palette.length] ?? '#3b82f6';
      const x = px(z.x);
      const y = py(z.y);
      const w = (z.w / 100) * FRAME_W;
      const h = (z.h / 100) * FRAME_H;
      parts.push(
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" fill-opacity="0.16" stroke="${color}" stroke-width="1.5" stroke-dasharray="5 3"/>`,
      );
      // التسمية **فوق** حافّة النطاق لا داخله: المعالم تقع داخله، فأي موضع
      // داخلي قد يصطدم بها. والمحاذاة `middle` لا `end`: النصّ عربي والـSVG
      // يرث اتجاه الصفحة (rtl) فينقلب معنى `end` ويخرج النصّ من الإطار.
      const labelY = Math.max(FRAME_Y + 11, y - 4);
      parts.push(haloText(x + w / 2, labelY, truncate(z.label, 20), 10, color, 'middle'));
    });

    // المعالم
    const usedKinds = new Set<MapMarkerKind>();
    (spec.markers ?? []).forEach((m) => {
      const kind = m.kind ?? 'city';
      usedKinds.add(kind);
      const x = px(m.x);
      const y = py(m.y);
      parts.push(markerGlyph(kind, x, y, col));
      // التسمية أسفل الرمز، وتنزاح لأعلى قرب الحافة السفلى كي لا تخرج
      const below = y < FRAME_Y + FRAME_H - 18;
      parts.push(
        haloText(x, below ? y + 16 : y - 11, truncate(m.label, 18), 10, col, 'middle', kind === 'capital'),
      );
    });

    if (spec.compass !== false) parts.push(compassRose(col, opts));

    // سلّم الرسم داخل الزاوية السفلى
    if (spec.scale) {
      const sx = FRAME_X + 12;
      const sy = FRAME_Y + FRAME_H - 12;
      // خلفية بيضاء: السلّم يقع كثيراً فوق نطاقٍ مظلَّل فيختفي خطّه.
      parts.push(`<rect x="${sx - 6}" y="${sy - 20}" width="64" height="27" fill="#ffffff" fill-opacity="0.85" stroke="none"/>`);
      parts.push(`<line x1="${sx}" y1="${sy}" x2="${sx + 52}" y2="${sy}" ${strokeAttr(col)}/>`);
      parts.push(`<line x1="${sx}" y1="${sy - 4}" x2="${sx}" y2="${sy + 4}" ${strokeThinAttr(col)}/>`);
      parts.push(`<line x1="${sx + 52}" y1="${sy - 4}" x2="${sx + 52}" y2="${sy + 4}" ${strokeThinAttr(col)}/>`);
      parts.push(text(sx + 26, sy - 7, spec.scale, { size: 9 }, opts));
    }

    // المفتاح: الأصناف المستعملة فقط
    if (usedKinds.size > 0) {
      const legendY = FRAME_Y + FRAME_H + 17;
      const kinds = [...usedKinds];
      const stepX = FRAME_W / kinds.length;
      kinds.forEach((kind, i) => {
        // الترتيب من اليمين إلى اليسار: المفتاح يُقرأ كبقيّة الوثيقة
        const cx = FRAME_X + FRAME_W - stepX * (i + 0.5);
        parts.push(markerGlyph(kind, cx - 26, legendY - 4, col));
        parts.push(text(cx + 2, legendY, KIND_LABEL[kind], { size: 9.5 }, opts));
      });
    }

    return wrapSvg(parts.join(''), W, H, spec.title ?? 'خريطة تخطيطية', opts);
  } catch {
    return '';
  }
}
