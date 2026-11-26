import type { ReactNode } from "react";
import { IconBubble } from "./Badge";
import type { Tone } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { formatDate, formatRupiah } from "@/lib/format";

interface EntryRowProps {
  emoji: string;
  tone: Tone;
  title: string;
  subtitle?: string | null;
  date: string;
  amount: number;
  direction: "in" | "out";
  actions?: ReactNode;
}

/** Satu baris transaksi (dipakai di pemasukan, pengeluaran, riwayat, dan dashboard). */
export function EntryRow({ emoji, tone, title, subtitle, date, amount, direction, actions }: EntryRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl p-2.5 transition hover:bg-surface-2/70 sm:p-3">
      <IconBubble emoji={emoji} tone={tone} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="truncate text-xs text-muted">
          {subtitle ? `${subtitle} · ` : ""}
          {formatDate(date)}
        </p>
      </div>
      <p
        className={cn(
          "shrink-0 text-sm font-bold tabular-nums",
          direction === "in" ? "text-mint-ink" : "text-pink-ink",
        )}
      >
        {direction === "in" ? "+" : "-"}
        {formatRupiah(amount)}
      </p>
      {actions && <div className="flex shrink-0 items-center">{actions}</div>}
    </div>
  );
}
