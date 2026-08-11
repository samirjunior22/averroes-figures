// ============================================================
// Timeline Generator — مولّد الخطّ الزمني (تاريخ)
// ============================================================
// يرسم خطّاً زمنياً بأحداث مؤرَّخة: محورٌ بسهم، علامة عند كل حدث، والسنة
// والتسمية على جانبَي المحور بالتناوب كي لا تتراكم النصوص.
//
// الرمز في الـproxy:  [[زمن: 1954,اندلاع الثورة ; 1962,الاستقلال]]
//
// ⚠ الاتجاه افتراضياً **من اليمين إلى اليسار**: الوثيقة عربية، والقارئ يبدأ
// من اليمين فيجد الأقدم أوّلاً. `ltr: true` يعكسه لمن يريد العرف الغربي.
// ============================================================

import { z } from 'zod';
import type { RenderOptions } from './shared.js';
import { text, wrapSvg, resolveColor, resolvePalette, strokeAttr, fillAttr, truncate } from './shared.js';

// ------------------------------------------------------------
// مخطّطات Zod
// ------------------------------------------------------------

/** حدث مؤرَّخ على الخطّ. */
export const timelineEventSchema = z
  .object({
    year: z.number().int().min(-4000).max(3000).describe('السنة (سالبة = قبل الميلاد)'),
    label: z.string().min(1).max(48).describe('اسم الحدث'),
    /** حدث مفصلي يُبرَز بعلامة أكبر ولون مميّز. */
    major: z.boolean().optional().describe('حدث مفصلي'),
  })
  .strict();

export type TimelineEvent = z.infer<typeof timelineEventSchema>;

/** مواصفات مولّد الخطّ الزمني. */
export const timelineSpecSchema = z
  .object({
    title: z.string().max(60).optional().describe('عنوان الخطّ الزمني'),
    events: z.array(timelineEventSchema).min(2).max(8).describe('الأحداث (2–8)'),
    /**
     * `equal` (الافتراضي) — تباعد متساوٍ، أوضح للقراءة المدرسية.
     * `proportional` — تباعد يتناسب مع الفارق الزمني الحقيقي.
     */
    spacing: z.enum(['equal', 'proportional']).optional().describe('نمط التباعد'),
    /** عكس الاتجاه إلى اليسار→اليمين (العرف الغربي). */
    ltr: z.boolean().optional().describe('اتجاه من اليسار إلى اليمين'),
  })
  .strict();

export type TimelineSpec = z.infer<typeof timelineSpecSchema>;

// ------------------------------------------------------------
// ثوابت
// ------------------------------------------------------------

const H = 190;
const MARGIN = 46;
const AXIS_Y = H / 2 + 6;
const TICK = 7;
const MAJOR_R = 6;
const MINOR_R = 4;
const LABEL_GAP = 16;

/**
 * العرض يتبع عدد الأحداث لا العكس: ستّة أحداث في 460px تترك ~74px للتسمية
 * الواحدة، فتتداخل التسميات العربية. الحاوية تُصغّر الـSVG بـ`max-width:100%`
 * فالتوسيع لا يكسر الصفحة، والتداخل يكسر القراءة.
 */
const SLOT_PX = 92;
const MIN_W = 460;

/** أقصى طول تسمية يسع الحيّز الفعلي (≈5.2px للحرف عند font-size 10.5). */
function labelBudget(step: number): number {
  return Math.max(8, Math.min(26, Math.floor(step / 5.2)));
}

/** «1954» · «‏332 ق.م» — السالب يُكتب بالعرف العربي لا بإشارة ناقص. */
function formatYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} ق.م` : String(year);
}

/** مواضع الأحداث على المحور حسب نمط التباعد والاتجاه. */
function eventPositions(spec: TimelineSpec, sorted: TimelineEvent[], W: number): number[] {
  const from = MARGIN;
  const to = W - MARGIN;
  const n = sorted.length;

  const ratios: number[] = [];
  if (spec.spacing === 'proportional') {
    const min = sorted[0]!.year;
    const max = sorted[n - 1]!.year;
    const span = max - min;
    // كل الأحداث في السنة نفسها ⇒ لا تناسب ممكن، فنسقط إلى المتساوي.
    for (let i = 0; i < n; i++) {
      ratios.push(span === 0 ? i / (n - 1) : (sorted[i]!.year - min) / span);
    }
  } else {
    for (let i = 0; i < n; i++) ratios.push(i / (n - 1));
  }

  // الأقدم يميناً افتراضياً: النسبة 0 عند الحافة اليمنى.
  return ratios.map((r) => (spec.ltr ? from + r * (to - from) : to - r * (to - from)));
}

// ------------------------------------------------------------
// المُصيّر الرئيسي
// ------------------------------------------------------------

/** يُصيّر خطّاً زمنياً إلى SVG. spec غير صالح → ''. */
export function renderTimeline(spec: TimelineSpec, opts?: RenderOptions): string {
  try {
    const col = resolveColor(opts);
    const accent = resolvePalette(opts)[1] ?? '#ef4444';

    const sorted = [...spec.events].sort((a, b) => a.year - b.year);
    const W = Math.max(MIN_W, sorted.length * SLOT_PX);
    const xs = eventPositions(spec, sorted, W);
    const maxChars = labelBudget((W - MARGIN * 2) / Math.max(1, sorted.length - 1));

    const parts: string[] = [];

    if (spec.title) {
      parts.push(text(W / 2, 18, spec.title, { size: 13, bold: true }, opts));
    }

    // المحور: خطٌّ أفقي ينتهي بسهم في جهة «الأحدث».
    const tipX = spec.ltr ? W - 12 : 12;
    const tailX = spec.ltr ? 18 : W - 18;
    const dir = spec.ltr ? -1 : 1;
    parts.push(`<line x1="${tailX}" y1="${AXIS_Y}" x2="${tipX}" y2="${AXIS_Y}" ${strokeAttr(col)}/>`);
    parts.push(
      `<path d="M ${tipX} ${AXIS_Y} L ${tipX + dir * 10} ${AXIS_Y - 5} L ${tipX + dir * 10} ${AXIS_Y + 5} Z" ${fillAttr(col)}/>`,
    );

    sorted.forEach((ev, i) => {
      const x = xs[i]!;
      const above = i % 2 === 0; // تناوب: التسمية أعلى ثم أسفل، فلا تتراكم
      const r = ev.major ? MAJOR_R : MINOR_R;

      // علامة الحدث + شرطة صغيرة نحو جهة التسمية
      const tickY = above ? AXIS_Y - TICK : AXIS_Y + TICK;
      parts.push(`<line x1="${x}" y1="${AXIS_Y}" x2="${x}" y2="${tickY}" ${strokeAttr(col)}/>`);
      parts.push(
        ev.major
          ? `<circle cx="${x}" cy="${AXIS_Y}" r="${r}" ${fillAttr(accent)}/>`
          : `<circle cx="${x}" cy="${AXIS_Y}" r="${r}" fill="#ffffff" stroke="${col || 'currentColor'}" stroke-width="2"/>`,
      );

      // التسمية في جهة، والسنة في الجهة المقابلة قرب المحور
      const labelY = above ? tickY - LABEL_GAP + 4 : tickY + LABEL_GAP;
      const yearY = above ? AXIS_Y + 18 : AXIS_Y - 12;
      parts.push(
        text(x, labelY, truncate(ev.label, maxChars), { size: 10.5, bold: ev.major === true }, opts),
      );
      parts.push(text(x, yearY, formatYear(ev.year), { size: 10, color: accent }, opts));
    });

    const label = spec.title ?? `خط زمني من ${formatYear(sorted[0]!.year)} إلى ${formatYear(sorted[sorted.length - 1]!.year)}`;
    return wrapSvg(parts.join(''), W, H, label, opts);
  } catch {
    return '';
  }
}
