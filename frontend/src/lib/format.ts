const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const compactFormatter = new Intl.NumberFormat("id-ID", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

const MONTHS_LONG = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const pad = (value: number) => String(value).padStart(2, "0");

export const formatRupiah = (value: number): string =>
  rupiahFormatter.format(value).replace(/ /g, " ");

export const formatCompact = (value: number): string => compactFormatter.format(value);

export const formatNumber = (value: number): string => numberFormatter.format(value);

/** "2026-11-25" -> "25 Nov 2026" (tanpa konversi zona waktu) */
export function formatDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return `${day} ${MONTHS_SHORT[month - 1]} ${year}`;
}

/** "2026-11" -> "November 2026" */
export function formatMonth(value: string): string {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return value;
  return `${MONTHS_LONG[month - 1]} ${year}`;
}

export const monthShortName = (month: number): string => MONTHS_SHORT[month - 1] ?? "";
export const monthLongName = (month: number): string => MONTHS_LONG[month - 1] ?? "";

export function todayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export const currentMonth = (): string => todayString().slice(0, 7);

export function shiftMonth(month: string, delta: number): string {
  const [year, m] = month.split("-").map(Number);
  const index = year * 12 + (m - 1) + delta;
  return `${Math.floor(index / 12)}-${pad((index % 12) + 1)}`;
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}
