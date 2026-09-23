// ============================================================
// lab/informaticsObjects — كائنات الإعلام الآلي المفردة للمخبر والسبورة
// ============================================================
// عتاد، رمز خوارزمية، بوابة منطقية، تمثيل ثنائي، صندوق متغير،
// أيقونة ملف، شبكة، لبنة سكراتش، وسلم وحدات التخزين.
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

export const deviceSpecSchema = z.object({
  kind: z.literal('device'),
  type: z.enum([
    'monitor',
    'keyboard',
    'mouse',
    'cpu',
    'ram',
    'hdd',
    'ssd',
    'usb',
    'printer',
    'router',
    'server',
    'laptop',
    'tablet',
  ]).optional(),
  label: z.string().max(30).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const flowSymbolSpecSchema = z.object({
  kind: z.literal('flow_symbol'),
  shape: z.enum(['terminal', 'process', 'decision', 'io', 'loop', 'connector']).optional(),
  text: z.string().max(40).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const logicGateSpecSchema = z.object({
  kind: z.literal('logic_gate'),
  gate: z.enum(['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR']).optional(),
  a: z.number().int().min(0).max(1).optional(),
  b: z.number().int().min(0).max(1).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const binarySpecSchema = z.object({
  kind: z.literal('binary'),
  value: z.number().int().min(0).max(255).optional(),
  bits: z.number().int().min(4).max(8).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const variableBoxSpecSchema = z.object({
  kind: z.literal('variable_box'),
  name: z.string().max(10).optional(),
  value: z.string().max(20).optional(),
  varType: z.enum(['int', 'float', 'string', 'bool']).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const fileIconSpecSchema = z.object({
  kind: z.literal('file_icon'),
  fileType: z.enum(['file', 'folder', 'image', 'text', 'video', 'zip']).optional(),
  name: z.string().max(25).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const networkSpecSchema = z.object({
  kind: z.literal('network'),
  topology: z.enum(['star', 'bus', 'ring']).optional(),
  nodes: z.number().int().min(3).max(6).optional(),
  labelsMode: z.enum(['full', 'numbered', 'none']).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const scratchBlockSpecSchema = z.object({
  kind: z.literal('scratch_block'),
  category: z.enum(['motion', 'looks', 'control', 'events']).optional(),
  text: z.string().max(40).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export const storageUnitsSpecSchema = z.object({
  kind: z.literal('storage_units'),
  highlight: z.enum(['bit', 'byte', 'KB', 'MB', 'GB', 'TB', 'none']).optional(),
  theme: z.enum(['natural', 'vibrant', 'exam_print']).optional(),
}).strict();

export type DeviceSpec = z.infer<typeof deviceSpecSchema>;
export type FlowSymbolSpec = z.infer<typeof flowSymbolSpecSchema>;
export type LogicGateSpec = z.infer<typeof logicGateSpecSchema>;
export type BinarySpec = z.infer<typeof binarySpecSchema>;
export type VariableBoxSpec = z.infer<typeof variableBoxSpecSchema>;
export type FileIconSpec = z.infer<typeof fileIconSpecSchema>;
export type NetworkSpec = z.infer<typeof networkSpecSchema>;
export type ScratchBlockSpec = z.infer<typeof scratchBlockSpecSchema>;
export type StorageUnitsSpec = z.infer<typeof storageUnitsSpecSchema>;

// ------------------------------------------------------------
// 1. عتاد الحاسوب (Device)
// ------------------------------------------------------------
export function renderDevice(spec: DeviceSpec, opts?: RenderOptions): string {
  const W = 220, H = 200, id = `dev-${uid()}`, font = resolveFont(opts);
  const type = spec.type ?? 'monitor';
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const parts: string[] = [];
  const cx = W / 2;
  const devCol = isPrint ? '#334155' : '#1e293b';
  const screenCol = isPrint ? '#f1f5f9' : '#0284c7';

  parts.push(`<defs>${shadowDef(`${id}-sh`, 3, 4)}</defs>`);

  if (type === 'monitor') {
    // شاشة حاسوب
    parts.push(`<rect x="35" y="25" width="150" height="100" rx="8" fill="${devCol}" filter="url(#${id}-sh)"/>`);
    parts.push(`<rect x="43" y="33" width="134" height="84" rx="4" fill="${screenCol}"/>`);
    // قاعدة
    parts.push(`<rect x="${cx - 12}" y="125" width="24" height="25" fill="${devCol}"/>`);
    parts.push(`<ellipse cx="${cx}" cy="150" rx="42" ry="8" fill="${devCol}"/>`);
  } else if (type === 'cpu') {
    // معالج CPU
    parts.push(`<rect x="50" y="30" width="120" height="120" rx="10" fill="${isPrint ? '#475569' : '#047857'}" stroke="#0f172a" stroke-width="2" filter="url(#${id}-sh)"/>`);
    parts.push(`<rect x="70" y="50" width="80" height="80" rx="6" fill="${devCol}"/>`);
    parts.push(`<text x="${cx}" y="95" font-size="14" font-family="${font}" font-weight="bold" fill="#ffffff" text-anchor="middle">CPU</text>`);
  } else if (type === 'ram') {
    // ذاكرة RAM
    parts.push(`<rect x="30" y="60" width="160" height="50" rx="4" fill="${isPrint ? '#475569' : '#15803d'}" stroke="#0f172a" stroke-width="1.5" filter="url(#${id}-sh)"/>`);
    for (let i = 0; i < 4; i++) {
      parts.push(`<rect x="${45 + i * 36}" y="68" width="26" height="34" rx="2" fill="${devCol}"/>`);
    }
    // نقاط التماس الذهبية
    for (let i = 0; i < 14; i++) {
      parts.push(`<rect x="${36 + i * 11}" y="110" width="6" height="6" fill="${isPrint ? '#94a3b8' : '#eab308'}"/>`);
    }
  } else if (type === 'mouse') {
    // فارة
    parts.push(`<rect x="75" y="40" width="70" height="110" rx="35" fill="${devCol}" filter="url(#${id}-sh)"/>`);
    parts.push(`<line x1="${cx}" y1="40" x2="${cx}" y2="85" stroke="#94a3b8" stroke-width="1.5"/>`);
    parts.push(`<rect x="${cx - 4}" y="55" width="8" height="18" rx="3" fill="#cbd5e1"/>`);
  } else {
    // laptop / tablet
    parts.push(`<rect x="45" y="35" width="130" height="85" rx="6" fill="${devCol}" filter="url(#${id}-sh)"/>`);
    parts.push(`<rect x="52" y="42" width="116" height="71" rx="3" fill="${screenCol}"/>`);
    parts.push(`<polygon points="25,145 195,145 180,120 40,120" fill="${darken(devCol, 0.2)}"/>`);
  }

  const devTitle = spec.label ?? (type === 'monitor' ? 'شاشة' : type === 'cpu' ? 'معالج CPU' : type === 'ram' ? 'ذاكرة RAM' : 'جهاز إعلام آلي');
  parts.push(badge(cx, H - 18, devTitle, { font, size: 11 }));
  return wrapSvg(parts.join(''), W, H, `عتاد حاسوب — ${devTitle}`, opts);
}

// ------------------------------------------------------------
// 2. رمز المخطط الانسيابي (Flow Symbol)
// ------------------------------------------------------------
export function renderFlowSymbol(spec: FlowSymbolSpec, opts?: RenderOptions): string {
  const W = 220, H = 140, id = `flw-${uid()}`, font = resolveFont(opts);
  const shape = spec.shape ?? 'process';
  const txt = spec.text ?? (shape === 'terminal' ? 'بداية' : shape === 'decision' ? 'x > 0 ?' : 'عملية حسابية');
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const parts: string[] = [];
  const cx = W / 2, cy = 60;
  const strokeCol = isPrint ? '#0f172a' : '#0369a1';
  const bgCol = isPrint ? '#f1f5f9' : '#e0f2fe';

  parts.push(`<defs>${shadowDef(`${id}-sh`, 2, 3)}</defs>`);

  if (shape === 'terminal') {
    // بيضوي / مستطيل مستدير الأطراف (بداية/نهاية)
    parts.push(`<rect x="35" y="32" width="150" height="56" rx="28" fill="${bgCol}" stroke="${strokeCol}" stroke-width="2" filter="url(#${id}-sh)"/>`);
  } else if (shape === 'decision') {
    // معين شرطي (قرار)
    parts.push(`<polygon points="${cx},22 ${cx + 75},${cy} ${cx},98 ${cx - 75},${cy}" fill="${bgCol}" stroke="${strokeCol}" stroke-width="2" filter="url(#${id}-sh)"/>`);
  } else if (shape === 'io') {
    // متوازي أضلاع (إدخال/إخراج)
    parts.push(`<polygon points="45,32 195,32 175,88 25,88" fill="${bgCol}" stroke="${strokeCol}" stroke-width="2" filter="url(#${id}-sh)"/>`);
  } else if (shape === 'connector') {
    // دائرة ربط
    parts.push(`<circle cx="${cx}" cy="${cy}" r="28" fill="${bgCol}" stroke="${strokeCol}" stroke-width="2" filter="url(#${id}-sh)"/>`);
  } else {
    // process (مستطيل معالجة)
    parts.push(`<rect x="30" y="32" width="160" height="56" rx="6" fill="${bgCol}" stroke="${strokeCol}" stroke-width="2" filter="url(#${id}-sh)"/>`);
  }

  parts.push(`<text x="${cx}" y="${cy + 5}" font-size="12" font-family="${font}" font-weight="bold" fill="#0f172a" text-anchor="middle">${esc(txt)}</text>`);
  parts.push(label(cx, H - 12, `رمز خوارزمية (${shape})`, { font, size: 9, bold: true, color: '#64748b' }));

  return wrapSvg(parts.join(''), W, H, `رمز خوارزمية — ${shape}`, opts);
}

// ------------------------------------------------------------
// 3. البوابة المنطقية مع الخرج المحسوب (Logic Gate)
// ------------------------------------------------------------
export function renderLogicGate(spec: LogicGateSpec, opts?: RenderOptions): string {
  const W = 240, H = 160, id = `gate-${uid()}`, font = resolveFont(opts);
  const gate = spec.gate ?? 'AND';
  const a = spec.a ?? 1;
  const b = spec.b ?? 0;
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  // حساب الخرج المنطقي بدقة
  let out = 0;
  if (gate === 'AND') out = a & b;
  else if (gate === 'OR') out = a | b;
  else if (gate === 'NOT') out = a === 1 ? 0 : 1;
  else if (gate === 'NAND') out = (a & b) === 1 ? 0 : 1;
  else if (gate === 'NOR') out = (a | b) === 1 ? 0 : 1;
  else if (gate === 'XOR') out = a ^ b;

  const parts: string[] = [];
  const cx = 115, cy = 70;
  const bodyCol = isPrint ? '#f1f5f9' : '#e0f2fe';
  const strokeCol = isPrint ? '#0f172a' : '#0369a1';

  parts.push(`<defs>${shadowDef(`${id}-sh`, 2, 3)}</defs>`);

  // أسلاك الدخل (يسار)
  if (gate === 'NOT') {
    parts.push(`<line x1="30" y1="${cy}" x2="85" y2="${cy}" stroke="#0f172a" stroke-width="2"/>`);
    parts.push(badge(40, cy - 14, `A=${a}`, { font, size: 10, bg: a ? '#16a34a' : '#475569' }));
  } else {
    parts.push(`<line x1="30" y1="${cy - 20}" x2="85" y2="${cy - 20}" stroke="#0f172a" stroke-width="2"/>`);
    parts.push(`<line x1="30" y1="${cy + 20}" x2="85" y2="${cy + 20}" stroke="#0f172a" stroke-width="2"/>`);
    parts.push(badge(40, cy - 32, `A=${a}`, { font, size: 10, bg: a ? '#16a34a' : '#475569' }));
    parts.push(badge(40, cy + 34, `B=${b}`, { font, size: 10, bg: b ? '#16a34a' : '#475569' }));
  }

  // رسم رمز البوابة
  if (gate === 'AND' || gate === 'NAND') {
    parts.push(`<path d="M 85,${cy - 35} L 120,${cy - 35} A 35,35 0 0 1 120,${cy + 35} L 85,${cy + 35} Z" fill="${bodyCol}" stroke="${strokeCol}" stroke-width="2.2" filter="url(#${id}-sh)"/>`);
  } else if (gate === 'OR' || gate === 'NOR' || gate === 'XOR') {
    if (gate === 'XOR') {
      parts.push(`<path d="M 75,${cy - 35} Q 95,${cy} 75,${cy + 35}" fill="none" stroke="${strokeCol}" stroke-width="2.2"/>`);
    }
    parts.push(`<path d="M 85,${cy - 35} Q 105,${cy} 85,${cy + 35} Q 130,${cy + 35} 155,${cy} Q 130,${cy - 35} 85,${cy - 35} Z" fill="${bodyCol}" stroke="${strokeCol}" stroke-width="2.2" filter="url(#${id}-sh)"/>`);
  } else {
    // NOT
    parts.push(`<polygon points="85,${cy - 30} 140,${cy} 85,${cy + 30}" fill="${bodyCol}" stroke="${strokeCol}" stroke-width="2.2" filter="url(#${id}-sh)"/>`);
  }

  // دائرة النفي في NAND, NOR, NOT
  const hasInvert = gate === 'NAND' || gate === 'NOR' || gate === 'NOT';
  const outStartX = gate === 'NOT' ? 140 : gate === 'AND' || gate === 'NAND' ? 155 : 155;
  if (hasInvert) {
    parts.push(`<circle cx="${outStartX + 5}" cy="${cy}" r="4.5" fill="#ffffff" stroke="${strokeCol}" stroke-width="1.8"/>`);
  }

  // سلك الخرج (يمين)
  const lineStartX = hasInvert ? outStartX + 10 : outStartX;
  parts.push(`<line x1="${lineStartX}" y1="${cy}" x2="190" y2="${cy}" stroke="#0f172a" stroke-width="2.2"/>`);
  parts.push(badge(210, cy, `S = ${out}`, { font, size: 12, bg: out ? '#16a34a' : '#dc2626' }));

  parts.push(label(cx + 10, cy + 5, gate, { font, size: 12, bold: true, color: strokeCol }));
  parts.push(label(W / 2, H - 12, `بوابة ${gate} منطقية`, { font, size: 10, bold: true }));

  return wrapSvg(parts.join(''), W, H, `بوابة منطقية ${gate}`, opts);
}

// ------------------------------------------------------------
// 4. التمثيل الثنائي (Binary Register)
// ------------------------------------------------------------
export function renderBinary(spec: BinarySpec, opts?: RenderOptions): string {
  const W = 280, H = 150, id = `bin-${uid()}`, font = resolveFont(opts);
  const val = Math.max(0, Math.min(255, spec.value ?? 42));
  const nBits = spec.bits ?? 8;
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const parts: string[] = [];
  const startX = 20, bitW = 28, startY = 35;
  const borderCol = isPrint ? '#0f172a' : '#0369a1';

  parts.push(`<defs>${shadowDef(`${id}-sh`, 2, 3)}</defs>`);

  for (let i = 0; i < nBits; i++) {
    const bitPos = nBits - 1 - i;
    const isLit = (val & (1 << bitPos)) !== 0;
    const bx = startX + i * (bitW + 3);

    // صندوق البت
    const bg = isLit ? (isPrint ? '#334155' : '#16a34a') : '#f1f5f9';
    const textCol = isLit ? '#ffffff' : '#475569';
    parts.push(`<rect x="${bx}" y="${startY}" width="${bitW}" height="${bitW * 1.5}" rx="5" fill="${bg}" stroke="${borderCol}" stroke-width="1.5" filter="url(#${id}-sh)"/>`);
    parts.push(`<text x="${bx + bitW / 2}" y="${startY + 26}" font-size="16" font-family="${font}" font-weight="bold" fill="${textCol}" text-anchor="middle">${isLit ? 1 : 0}</text>`);
    // وزن الخانة 2^n
    parts.push(`<text x="${bx + bitW / 2}" y="${startY - 6}" font-size="8" font-family="${font}" fill="#64748b" text-anchor="middle">2^${bitPos}</text>`);
  }

  // شارة القيمة العشرية
  parts.push(badge(W / 2, H - 20, `القيمة العشرية: ${val} (Dec)`, { font, size: 12, bg: borderCol }));
  return wrapSvg(parts.join(''), W, H, `سجل ثنائي ${val}`, opts);
}

// ------------------------------------------------------------
// 5. صندوق المتغير (Variable Box)
// ------------------------------------------------------------
export function renderVariableBox(spec: VariableBoxSpec, opts?: RenderOptions): string {
  const W = 200, H = 190, id = `vbx-${uid()}`, font = resolveFont(opts);
  const name = spec.name ?? 'x';
  const val = spec.value ?? '5';
  const varType = spec.varType ?? 'int';
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const parts: string[] = [];
  const cx = W / 2, cy = 85;
  const boxCol = isPrint ? '#64748b' : '#3b82f6';

  parts.push(`<defs>${linGrad(`${id}-bx`, [[0, lighten(boxCol, 0.35)], [1, boxCol]])}${shadowDef(`${id}-sh`, 3, 4)}</defs>`);

  // صندوق ثلاثي الأبعاد
  parts.push(`<g filter="url(#${id}-sh)">`);
  // الغطاء والواجهة
  parts.push(`<polygon points="${cx - 50},${cy - 20} ${cx},${cy - 45} ${cx + 50},${cy - 20} ${cx},${cy + 5}" fill="${lighten(boxCol, 0.45)}" stroke="#0f172a" stroke-width="1.5"/>`);
  parts.push(`<polygon points="${cx - 50},${cy - 20} ${cx},${cy + 5} ${cx},${cy + 55} ${cx - 50},${cy + 30}" fill="url(#${id}-bx)" stroke="#0f172a" stroke-width="1.5"/>`);
  parts.push(`<polygon points="${cx + 50},${cy - 20} ${cx},${cy + 5} ${cx},${cy + 55} ${cx + 50},${cy + 30}" fill="${darken(boxCol, 0.2)}" stroke="#0f172a" stroke-width="1.5"/>`);
  parts.push(`</g>`);

  // القيمة خارجة من الصندوق
  parts.push(`<circle cx="${cx}" cy="${cy - 20}" r="22" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/>`);
  parts.push(`<text x="${cx}" y="${cy - 14}" font-size="16" font-family="${font}" font-weight="bold" text-anchor="middle" fill="#0f172a">${esc(val)}</text>`);

  // اسم المتغير والنوع
  parts.push(badge(cx - 25, cy + 25, `${name}`, { font, size: 12, bg: '#0f172a' }));
  parts.push(label(cx, H - 15, `متغير: ${name} (${varType}) = ${val}`, { font, size: 10, bold: true }));

  return wrapSvg(parts.join(''), W, H, `صندوق متغير ${name}`, opts);
}

// ------------------------------------------------------------
// 6. أيقونة الملف / المجلد (File Icon)
// ------------------------------------------------------------
export function renderFileIcon(spec: FileIconSpec, opts?: RenderOptions): string {
  const W = 180, H = 180, id = `fic-${uid()}`, font = resolveFont(opts);
  const type = spec.fileType ?? 'file';
  const name = spec.name ?? (type === 'folder' ? 'مجلد جديد' : 'document.txt');
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const parts: string[] = [];
  const cx = W / 2, cy = 70;

  parts.push(`<defs>${shadowDef(`${id}-sh`, 3, 4)}</defs>`);

  if (type === 'folder') {
    // مجلد
    const folCol = isPrint ? '#cbd5e1' : '#f59e0b';
    parts.push(`<path d="M ${cx - 45},${cy - 25} L ${cx - 15},${cy - 25} L ${cx},${cy - 15} L ${cx + 45},${cy - 15} L ${cx + 45},${cy + 35} L ${cx - 45},${cy + 35} Z" fill="${darken(folCol, 0.15)}" filter="url(#${id}-sh)"/>`);
    parts.push(`<rect x="${cx - 45}" y="${cy - 10}" width="90" height="48" rx="6" fill="${folCol}" stroke="#0f172a" stroke-width="1.2"/>`);
  } else {
    // ملف مع طية الزاوية العلوية
    const docCol = isPrint ? '#f1f5f9' : '#ffffff';
    parts.push(`<polygon points="${cx - 35},${cy - 45} ${cx + 15},${cy - 45} ${cx + 35},${cy - 25} ${cx + 35},${cy + 45} ${cx - 35},${cy + 45}" fill="${docCol}" stroke="#0f172a" stroke-width="1.8" filter="url(#${id}-sh)"/>`);
    // الطية
    parts.push(`<polygon points="${cx + 15},${cy - 45} ${cx + 15},${cy - 25} ${cx + 35},${cy - 25}" fill="#cbd5e1" stroke="#0f172a" stroke-width="1.2"/>`);
    // خطوط داخلية
    parts.push(`<line x1="${cx - 20}" y1="${cy - 5}" x2="${cx + 20}" y2="${cy - 5}" stroke="#94a3b8" stroke-width="2"/>`);
    parts.push(`<line x1="${cx - 20}" y1="${cy + 10}" x2="${cx + 20}" y2="${cy + 10}" stroke="#94a3b8" stroke-width="2"/>`);
    parts.push(`<line x1="${cx - 20}" y1="${cy + 25}" x2="${cx + 5}" y2="${cy + 25}" stroke="#94a3b8" stroke-width="2"/>`);
  }

  parts.push(label(cx, H - 20, name, { font, size: 11, bold: true }));
  return wrapSvg(parts.join(''), W, H, `أيقونة ${name}`, opts);
}

// ------------------------------------------------------------
// 7. طوبولوجيا الشبكة (Network)
// ------------------------------------------------------------
export function renderNetwork(spec: NetworkSpec, opts?: RenderOptions): string {
  const W = 260, H = 220, id = `net-${uid()}`, font = resolveFont(opts);
  const topology = spec.topology ?? 'star';
  const nNodes = Math.max(3, Math.min(6, spec.nodes ?? 4));
  const mode = spec.labelsMode ?? 'full';
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const parts: string[] = [];
  const cx = W / 2, cy = 100;
  const lineCol = isPrint ? '#0f172a' : '#0284c7';

  parts.push(`<defs>${shadowDef(`${id}-sh`, 2, 3)}</defs>`);

  if (topology === 'star') {
    // محول مركزي Switch
    parts.push(`<rect x="${cx - 20}" y="${cy - 16}" width="40" height="32" rx="6" fill="${isPrint ? '#334155' : '#0369a1'}" filter="url(#${id}-sh)"/>`);
    parts.push(`<text x="${cx}" y="${cy + 4}" font-size="9" font-family="${font}" font-weight="bold" fill="#ffffff" text-anchor="middle">Hub</text>`);

    // أجهزة متصلة شعاعياً
    const rad = 65;
    for (let i = 0; i < nNodes; i++) {
      const ang = (i / nNodes) * 2 * Math.PI - Math.PI / 2;
      const nx = cx + rad * Math.cos(ang), ny = cy + rad * Math.sin(ang);
      parts.push(`<line x1="${cx}" y1="${cy}" x2="${nx}" y2="${ny}" stroke="${lineCol}" stroke-width="2"/>`);
      parts.push(`<rect x="${nx - 14}" y="${ny - 12}" width="28" height="24" rx="4" fill="#ffffff" stroke="#0f172a" stroke-width="1.5" filter="url(#${id}-sh)"/>`);
      if (mode === 'numbered') {
        parts.push(`<text x="${nx}" y="${ny + 4}" font-size="10" font-family="${font}" font-weight="bold" fill="#0f172a" text-anchor="middle">${i + 1}</text>`);
      } else {
        parts.push(`<text x="${nx}" y="${ny + 3}" font-size="8" font-family="${font}" font-weight="bold" fill="#0f172a" text-anchor="middle">PC${i + 1}</text>`);
      }
    }
  } else if (topology === 'ring') {
    // شبكة حلقية
    const rad = 60;
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="${lineCol}" stroke-width="2.5"/>`);
    for (let i = 0; i < nNodes; i++) {
      const ang = (i / nNodes) * 2 * Math.PI - Math.PI / 2;
      const nx = cx + rad * Math.cos(ang), ny = cy + rad * Math.sin(ang);
      parts.push(`<rect x="${nx - 14}" y="${ny - 12}" width="28" height="24" rx="4" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/>`);
      parts.push(`<text x="${nx}" y="${ny + 3}" font-size="8" font-family="${font}" font-weight="bold" fill="#0f172a" text-anchor="middle">N${i + 1}</text>`);
    }
  } else {
    // خطية Bus
    parts.push(`<line x1="30" y1="${cy}" x2="230" y2="${cy}" stroke="${lineCol}" stroke-width="4"/>`);
    // نهايات كبل terminator
    parts.push(`<line x1="30" y1="${cy - 8}" x2="30" y2="${cy + 8}" stroke="#0f172a" stroke-width="3"/>`);
    parts.push(`<line x1="230" y1="${cy - 8}" x2="230" y2="${cy + 8}" stroke="#0f172a" stroke-width="3"/>`);
    const step = 180 / (nNodes + 1);
    for (let i = 0; i < nNodes; i++) {
      const nx = 30 + (i + 1) * step;
      const isTop = i % 2 === 0;
      const ny = isTop ? cy - 35 : cy + 35;
      parts.push(`<line x1="${nx}" y1="${cy}" x2="${nx}" y2="${ny}" stroke="${lineCol}" stroke-width="1.5"/>`);
      parts.push(`<rect x="${nx - 14}" y="${ny - 12}" width="28" height="24" rx="4" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/>`);
      parts.push(`<text x="${nx}" y="${ny + 3}" font-size="8" font-family="${font}" font-weight="bold" fill="#0f172a" text-anchor="middle">PC${i + 1}</text>`);
    }
  }

  parts.push(badge(cx, H - 16, `طوبولوجيا: ${topology}`, { font, size: 10 }));
  return wrapSvg(parts.join(''), W, H, `شبكة — ${topology}`, opts);
}

// ------------------------------------------------------------
// 8. لبنة سكراتش (Scratch Block)
// ------------------------------------------------------------
export function renderScratchBlock(spec: ScratchBlockSpec, opts?: RenderOptions): string {
  const W = 220, H = 100, id = `scb-${uid()}`, font = resolveFont(opts);
  const cat = spec.category ?? 'motion';
  const txt = spec.text ?? (cat === 'motion' ? 'تحرك 10 خطوة' : cat === 'looks' ? 'قل السلام عليكم' : 'كرر 10 مرات');
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const parts: string[] = [];
  const catColors: Record<string, string> = {
    motion: isPrint ? '#475569' : '#4c97ff',
    looks: isPrint ? '#64748b' : '#9966ff',
    events: isPrint ? '#334155' : '#ffbf00',
    control: isPrint ? '#1e293b' : '#ffab19',
  };
  const bgCol = catColors[cat] ?? '#4c97ff';

  parts.push(`<defs>${shadowDef(`${id}-sh`, 2, 3)}</defs>`);

  // مسار لبنة سكراتش القياسية مع نتوء علوي وسفلي
  const d = `M 20,25 h 16 l 4,4 h 16 l 4,-4 h 110 a 6,6 0 0 1 6,6 v 28 a 6,6 0 0 1 -6,6 h -110 l -4,4 h -16 l -4,-4 h -16 a 6,6 0 0 1 -6,-6 v -28 a 6,6 0 0 1 6,-6 Z`;
  parts.push(`<path d="${d}" fill="${bgCol}" stroke="${darken(bgCol, 0.25)}" stroke-width="1.5" filter="url(#${id}-sh)"/>`);
  parts.push(`<text x="100" y="49" font-size="12" font-family="${font}" font-weight="bold" fill="#ffffff" text-anchor="middle">${esc(txt)}</text>`);

  parts.push(label(W / 2, H - 12, `لبنة سكراتش (${cat})`, { font, size: 9, bold: true, color: '#64748b' }));
  return wrapSvg(parts.join(''), W, H, `لبنة سكراتش — ${txt}`, opts);
}

// ------------------------------------------------------------
// 9. سلم وحدات التخزين (Storage Units)
// ------------------------------------------------------------
export function renderStorageUnits(spec: StorageUnitsSpec, opts?: RenderOptions): string {
  const W = 280, H = 230, id = `sto-${uid()}`, font = resolveFont(opts);
  const hl = spec.highlight ?? 'none';
  const theme = spec.theme ?? 'natural';
  const isPrint = theme === 'exam_print';

  const parts: string[] = [];
  const units = [
    { name: 'TB', label: 'تيرابايت (TB)', eq: '= 1024 GB' },
    { name: 'GB', label: 'غيغابايت (GB)', eq: '= 1024 MB' },
    { name: 'MB', label: 'ميغابايت (MB)', eq: '= 1024 KB' },
    { name: 'KB', label: 'كيلوبايت (KB)', eq: '= 1024 Octets' },
    { name: 'byte', label: 'بايت / أوكتي (Byte)', eq: '= 8 bits' },
    { name: 'bit', label: 'بت (bit)', eq: 'أصغر وحدة (0 أو 1)' },
  ];

  parts.push(`<defs>${shadowDef(`${id}-sh`, 2, 2)}</defs>`);

  const startY = 22, rowH = 28, barW = 220, startX = 30;
  for (let i = 0; i < units.length; i++) {
    const u = units[i]!;
    const isHL = hl === u.name;
    const y = startY + i * (rowH + 4);
    const op = hl === 'none' || isHL ? 1 : 0.35;
    const bgCol = isHL ? (isPrint ? '#0f172a' : '#0284c7') : (isPrint ? '#f1f5f9' : '#f8fafc');
    const textCol = isHL ? '#ffffff' : '#0f172a';

    parts.push(`<g opacity="${op}">`);
    parts.push(`<rect x="${startX}" y="${y}" width="${barW}" height="${rowH}" rx="5" fill="${bgCol}" stroke="#cbd5e1" stroke-width="1.2" filter="url(#${id}-sh)"/>`);
    parts.push(`<text x="${startX + 12}" y="${y + 18}" font-size="11" font-family="${font}" font-weight="bold" fill="${textCol}">${u.label}</text>`);
    parts.push(`<text x="${startX + barW - 12}" y="${y + 18}" font-size="10" font-family="${font}" text-anchor="end" fill="${isHL ? '#fde047' : '#64748b'}">${u.eq}</text>`);
    parts.push(`</g>`);
  }

  parts.push(label(W / 2, H - 8, 'سلم وحدات التخزين والذاكرة', { font, size: 10, bold: true }));
  return wrapSvg(parts.join(''), W, H, `سلم وحدات التخزين`, opts);
}
