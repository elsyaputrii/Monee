import type { DebtType, ExpenseCategory, IncomeSource } from "@/types";

export type Tone = "pink" | "mint" | "lavender" | "peach" | "sky" | "lemon" | "red";

/** Kelas Tailwind untuk badge/ikon pastel (warna lembut sebagai aksen). */
export const TONE_CLASS: Record<Tone, string> = {
  pink: "bg-pink-soft text-pink-ink",
  mint: "bg-mint-soft text-mint-ink",
  lavender: "bg-lavender-soft text-lavender-ink",
  peach: "bg-peach-soft text-peach-ink",
  sky: "bg-sky-soft text-sky-ink",
  lemon: "bg-lemon-soft text-lemon-ink",
  red: "bg-red-soft text-red-ink",
};

export const TONE_BAR_CLASS: Record<Tone, string> = {
  pink: "bg-pink-ink/60",
  mint: "bg-mint-ink/60",
  lavender: "bg-lavender-ink/60",
  peach: "bg-peach-ink/60",
  sky: "bg-sky-ink/60",
  lemon: "bg-lemon-ink/60",
  red: "bg-red-ink/60",
};

/** Warna solid untuk grafik (pie/donut). */
export const TONE_CHART_COLOR: Record<Tone, string> = {
  pink: "#f58db1",
  mint: "#5fd0a3",
  lavender: "#9b88f0",
  peach: "#f6a778",
  sky: "#6cb8ee",
  lemon: "#eccb4a",
  red: "#ee7b7b",
};

export interface OptionMeta<V extends string> {
  value: V;
  label: string;
  emoji: string;
  tone: Tone;
}

export const INCOME_SOURCES: OptionMeta<IncomeSource>[] = [
  { value: "uang_jajan", label: "Uang Jajan", emoji: "🐷", tone: "pink" },
  { value: "gaji_magang", label: "Gaji Magang", emoji: "💼", tone: "sky" },
  { value: "pemberian", label: "Pemberian", emoji: "🎁", tone: "lavender" },
  { value: "beasiswa", label: "Beasiswa", emoji: "🎓", tone: "mint" },
  { value: "lainnya", label: "Lainnya", emoji: "✨", tone: "lemon" },
];

export const EXPENSE_CATEGORIES: OptionMeta<ExpenseCategory>[] = [
  { value: "makanan", label: "Makanan", emoji: "🍜", tone: "peach" },
  { value: "transport", label: "Transport", emoji: "🚌", tone: "sky" },
  { value: "belanja", label: "Belanja", emoji: "🛍️", tone: "pink" },
  { value: "tagihan", label: "Tagihan", emoji: "🧾", tone: "lemon" },
  { value: "hiburan", label: "Hiburan", emoji: "🎮", tone: "lavender" },
  { value: "kesehatan", label: "Kesehatan", emoji: "💊", tone: "mint" },
  { value: "pendidikan", label: "Pendidikan", emoji: "📚", tone: "sky" },
  { value: "lainnya", label: "Lainnya", emoji: "📦", tone: "lemon" },
];

export const DEBT_TYPES: OptionMeta<DebtType>[] = [
  { value: "utang", label: "Utang saya", emoji: "🤝", tone: "peach" },
  { value: "piutang", label: "Piutang (orang berutang ke saya)", emoji: "💌", tone: "mint" },
];

const FALLBACK: OptionMeta<string> = { value: "", label: "Lainnya", emoji: "✨", tone: "lemon" };

const ALL_META = new Map<string, OptionMeta<string>>([
  ...INCOME_SOURCES.map((item) => [`income:${item.value}`, item] as const),
  ...EXPENSE_CATEGORIES.map((item) => [`expense:${item.value}`, item] as const),
]);

export const getIncomeMeta = (value: string): OptionMeta<string> =>
  ALL_META.get(`income:${value}`) ?? { ...FALLBACK, value, label: value };

export const getExpenseMeta = (value: string): OptionMeta<string> =>
  ALL_META.get(`expense:${value}`) ?? { ...FALLBACK, value, label: value };

export const getDebtMeta = (value: string): OptionMeta<string> =>
  DEBT_TYPES.find((item) => item.value === value) ?? { ...FALLBACK, value, label: value };
