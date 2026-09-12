// ============================================================
// lab/elements — جدول العناصر (Z 1..36 + عناصر شائعة) — بيانات لا كود
// ============================================================
// يُغذّي الذرّة وبطاقة العنصر بالرمز والاسم والكتلة عند غيابها في المواصفة.
// ============================================================

export interface ElementInfo {
  Z: number;
  symbol: string;
  ar: string;
  en: string;
  mass: number;
}

const E = (Z: number, symbol: string, ar: string, en: string, mass: number): ElementInfo => ({ Z, symbol, ar, en, mass });

export const ELEMENTS: ElementInfo[] = [
  E(1, 'H', 'هيدروجين', 'Hydrogen', 1.008),
  E(2, 'He', 'هيليوم', 'Helium', 4.003),
  E(3, 'Li', 'ليثيوم', 'Lithium', 6.94),
  E(4, 'Be', 'بيريليوم', 'Beryllium', 9.012),
  E(5, 'B', 'بور', 'Boron', 10.81),
  E(6, 'C', 'كربون', 'Carbon', 12.011),
  E(7, 'N', 'آزوت', 'Nitrogen', 14.007),
  E(8, 'O', 'أكسجين', 'Oxygen', 15.999),
  E(9, 'F', 'فلور', 'Fluorine', 18.998),
  E(10, 'Ne', 'نيون', 'Neon', 20.18),
  E(11, 'Na', 'صوديوم', 'Sodium', 22.99),
  E(12, 'Mg', 'مغنيزيوم', 'Magnesium', 24.305),
  E(13, 'Al', 'ألمنيوم', 'Aluminium', 26.982),
  E(14, 'Si', 'سيليسيوم', 'Silicon', 28.085),
  E(15, 'P', 'فوسفور', 'Phosphorus', 30.974),
  E(16, 'S', 'كبريت', 'Sulfur', 32.06),
  E(17, 'Cl', 'كلور', 'Chlorine', 35.45),
  E(18, 'Ar', 'أرغون', 'Argon', 39.948),
  E(19, 'K', 'بوتاسيوم', 'Potassium', 39.098),
  E(20, 'Ca', 'كالسيوم', 'Calcium', 40.078),
  E(21, 'Sc', 'سكانديوم', 'Scandium', 44.956),
  E(22, 'Ti', 'تيتانيوم', 'Titanium', 47.867),
  E(23, 'V', 'فاناديوم', 'Vanadium', 50.942),
  E(24, 'Cr', 'كروم', 'Chromium', 51.996),
  E(25, 'Mn', 'منغنيز', 'Manganese', 54.938),
  E(26, 'Fe', 'حديد', 'Iron', 55.845),
  E(27, 'Co', 'كوبالت', 'Cobalt', 58.933),
  E(28, 'Ni', 'نيكل', 'Nickel', 58.693),
  E(29, 'Cu', 'نحاس', 'Copper', 63.546),
  E(30, 'Zn', 'زنك', 'Zinc', 65.38),
  E(31, 'Ga', 'غاليوم', 'Gallium', 69.723),
  E(32, 'Ge', 'جرمانيوم', 'Germanium', 72.63),
  E(33, 'As', 'زرنيخ', 'Arsenic', 74.922),
  E(34, 'Se', 'سيلينيوم', 'Selenium', 78.971),
  E(35, 'Br', 'بروم', 'Bromine', 79.904),
  E(36, 'Kr', 'كريبتون', 'Krypton', 83.798),
  E(47, 'Ag', 'فضة', 'Silver', 107.868),
  E(50, 'Sn', 'قصدير', 'Tin', 118.71),
  E(53, 'I', 'يود', 'Iodine', 126.904),
  E(79, 'Au', 'ذهب', 'Gold', 196.967),
  E(80, 'Hg', 'زئبق', 'Mercury', 200.592),
  E(82, 'Pb', 'رصاص', 'Lead', 207.2),
  E(92, 'U', 'يورانيوم', 'Uranium', 238.029),
];

export function elementByZ(Z: number): ElementInfo | undefined {
  return ELEMENTS.find((e) => e.Z === Z);
}

export function elementBySymbol(symbol: string): ElementInfo | undefined {
  const s = symbol.trim().toLowerCase();
  return ELEMENTS.find((e) => e.symbol.toLowerCase() === s);
}

/** ترتيب ملء الطبقات الإلكترونية في النموذج المدرسي (K, L, M, N, O, P, Q). */
export const SHELL_CAPACITY = [2, 8, 8, 18, 32, 32, 18] as const;
export const SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'] as const;

/** يوزّع Z إلكتروناً على الطبقات: 11 → [2, 8, 1]. */
export function shellDistribution(Z: number): number[] {
  const out: number[] = [];
  let left = Math.max(0, Math.floor(Z));
  for (const cap of SHELL_CAPACITY) {
    if (left <= 0) break;
    const n = Math.min(cap, left);
    out.push(n);
    left -= n;
  }
  return out;
}
