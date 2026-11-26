"use client";

import type { OptionMeta } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import type { CategoryAmount } from "@/types";
import { DONUT_COLORS, DonutChart } from "./charts";

interface CategoryBreakdownProps {
  data: CategoryAmount[];
  getMeta: (value: string) => OptionMeta<string>;
  emptyText: string;
}

/** Donat + daftar legenda (emoji, nama, nominal, persen). */
export function CategoryBreakdown({ data, getMeta, emptyText }: CategoryBreakdownProps) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-muted">{emptyText}</p>;
  }

  const slices = data.map((item) => ({ name: getMeta(item.category).label, value: item.amount }));

  return (
    // Container query: berdampingan hanya jika kartunya cukup lebar, kalau tidak donat di atas, legenda di bawah
    <div className="@container">
      <div className="grid items-center gap-5 @lg:grid-cols-2">
        <DonutChart data={slices} />
      <ul className="space-y-2.5">
        {data.map((item, index) => {
          const meta = getMeta(item.category);
          return (
            <li key={item.category} className="flex items-center gap-2.5 text-sm">
              <span
                aria-hidden
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ background: DONUT_COLORS[index % DONUT_COLORS.length] }}
              />
              <span aria-hidden>{meta.emoji}</span>
              <span className="min-w-0 flex-1 truncate font-medium">{meta.label}</span>
              <span className="shrink-0 font-semibold tabular-nums">{formatRupiah(item.amount)}</span>
              <span className="w-12 shrink-0 text-right text-xs text-muted tabular-nums">{item.percent}%</span>
            </li>
          );
        })}
      </ul>
      </div>
    </div>
  );
}
