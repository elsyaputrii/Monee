import { cn } from "@/lib/cn";
import { formatRupiah } from "@/lib/format";
import type { BalanceSummary } from "@/types";

interface Row {
  label: string;
  value: number;
  sign: "+" | "-" | "";
  hint?: string;
  className: string;
}

/**
 * Menampilkan rumus saldo secara transparan:
 * saldo akhir = saldo awal + pemasukan - pengeluaran - bayar utang + terima piutang
 */
export function BalanceBreakdown({ summary, openingLabel }: { summary: BalanceSummary; openingLabel: string }) {
  const rows: Row[] = [
    { label: openingLabel, value: summary.openingBalance, sign: "", hint: "dibawa dari bulan sebelumnya", className: "text-foreground" },
    { label: "Pemasukan", value: summary.income, sign: "+", className: "text-mint-ink" },
    { label: "Pengeluaran", value: summary.expense, sign: "-", className: "text-pink-ink" },
    { label: "Bayar utang", value: summary.debtPaid, sign: "-", className: "text-peach-ink" },
    { label: "Terima piutang", value: summary.debtReceived, sign: "+", className: "text-sky-ink" },
  ];

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-5">
      {rows.map((row) => (
        <div key={row.label} className="min-w-0">
          <dt className="truncate text-xs text-muted">{row.label}</dt>
          <dd className={cn("truncate text-sm font-bold tabular-nums", row.className)}>
            {row.sign}
            {formatRupiah(row.value)}
          </dd>
          {row.hint && <p className="mt-0.5 hidden text-[10px] leading-tight text-muted sm:block">{row.hint}</p>}
        </div>
      ))}
    </dl>
  );
}
