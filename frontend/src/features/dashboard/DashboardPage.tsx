"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { IncomeExpenseChart } from "@/components/charts/charts";
import { CategoryBreakdown } from "@/components/charts/CategoryBreakdown";
import { Badge } from "@/components/ui/Badge";
import { BalanceBreakdown } from "@/components/ui/BalanceBreakdown";
import { Card, CardTitle } from "@/components/ui/Card";
import { EntryRow } from "@/components/ui/EntryRow";
import { EmptyState, ErrorNotice, PageLoader } from "@/components/ui/Feedback";
import { MonthSwitcher } from "@/components/ui/MonthSwitcher";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatCard } from "@/components/ui/StatCard";
import { useAuth } from "@/features/auth/AuthProvider";
import { getDebtMeta, getExpenseMeta, getIncomeMeta } from "@/lib/constants";
import { currentMonth, firstName, formatMonth, formatRupiah, monthShortName } from "@/lib/format";
import { useApi } from "@/lib/hooks";
import type { DashboardData, Transaction } from "@/types";
import { dashboardApi } from "./dashboard.api";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 19) return "Selamat sore";
  return "Selamat malam";
}

function describe(tx: Transaction) {
  if (tx.type === "income") {
    const meta = getIncomeMeta(tx.category);
    return { emoji: meta.emoji, tone: meta.tone, title: meta.label, subtitle: tx.description };
  }
  if (tx.type === "expense") {
    const meta = getExpenseMeta(tx.category);
    return { emoji: meta.emoji, tone: meta.tone, title: meta.label, subtitle: tx.description };
  }
  const meta = getDebtMeta(tx.category);
  return {
    emoji: meta.emoji,
    tone: meta.tone,
    title: tx.category === "utang" ? `Bayar utang ke ${tx.personName}` : `Terima piutang dari ${tx.personName}`,
    subtitle: tx.description,
  };
}

export function DashboardPage() {
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonth());
  const { data, loading, error, reload } = useApi(() => dashboardApi.overview(month), [month]);

  return (
    <div className="animate-fade-up space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{greeting()},</p>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {user ? firstName(user.name) : "Teman Monee"} 👋
          </h1>
        </div>
        <MonthSwitcher value={month} onChange={setMonth} />
      </div>

      {error && !data ? (
        <ErrorNotice message={error} onRetry={reload} />
      ) : loading && !data ? (
        <PageLoader />
      ) : data ? (
        <DashboardContent data={data} month={month} />
      ) : null}
    </div>
  );
}

function DashboardContent({ data, month }: { data: DashboardData; month: string }) {
  const { summary, budget, debts } = data;
  const trend = data.trend.map((item) => ({
    label: monthShortName(Number(item.month.slice(5))),
    income: item.income,
    expense: item.expense,
  }));
  const hasAnyData =
    summary.income + summary.expense + summary.debtPaid + summary.debtReceived > 0 || summary.openingBalance !== 0;

  return (
    <>
      {/* Saldo utama */}
      <Card className="relative overflow-hidden">
        <div aria-hidden className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-lavender-soft" />
        <div aria-hidden className="absolute right-16 top-10 h-12 w-12 rounded-full bg-pink-soft" />
        <div className="relative">
          <p className="text-sm font-medium text-muted">Saldo akhir {formatMonth(month)}</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight tabular-nums sm:text-4xl">
            {formatRupiah(summary.closingBalance)}
          </p>
          <p className="mt-1 text-xs text-muted">
            Saldo awal + pemasukan - pengeluaran - bayar utang + terima piutang
          </p>
        </div>
        <div className="relative mt-5 border-t border-border pt-4">
          <BalanceBreakdown summary={summary} openingLabel="Saldo awal" />
        </div>
      </Card>

      {/* Ringkasan bulanan */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Pemasukan" value={formatRupiah(summary.income)} emoji="💰" tone="mint" valueClassName="text-mint-ink" />
        <StatCard label="Pengeluaran" value={formatRupiah(summary.expense)} emoji="🛍️" tone="pink" valueClassName="text-pink-ink" />
        <StatCard
          label="Sisa utang saya"
          value={formatRupiah(debts.utangRemaining)}
          emoji="🤝"
          tone="peach"
          hint={<Link href="/debts" className="font-semibold text-lavender-ink hover:underline">Lihat utang</Link>}
        />
        <StatCard
          label="Piutang belum kembali"
          value={formatRupiah(debts.piutangRemaining)}
          emoji="💌"
          tone="sky"
          hint="Belum memengaruhi saldo"
        />
      </div>

      {!hasAnyData && (
        <Card>
          <EmptyState
            emoji="🐷"
            title="Yuk, mulai catat!"
            description="Tambahkan pemasukan pertamamu, lalu catat pengeluaran. Saldo akan terhitung otomatis."
            action={
              <Link
                href="/income"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90"
              >
                <Plus className="h-4.5 w-4.5" />
                Tambah Pemasukan
              </Link>
            }
          />
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardTitle title="Tren 6 bulan terakhir" />
          <IncomeExpenseChart data={trend} height={240} />
          <div className="mt-3 flex items-center justify-center gap-5 text-xs font-medium text-muted">
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--chart-income)" }} />
              Pemasukan
            </span>
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--chart-expense)" }} />
              Pengeluaran
            </span>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle
            title="Anggaran bulan ini"
            action={
              <Link href="/budgets" className="text-xs font-semibold text-lavender-ink hover:underline">
                Atur
              </Link>
            }
          />
          {budget.count === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-muted">Belum ada anggaran untuk bulan ini.</p>
              <Link href="/budgets" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-lavender-ink hover:underline">
                Buat anggaran <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div>
              <div className="flex items-end justify-between gap-2">
                <p className="text-2xl font-extrabold tabular-nums">{budget.percent}%</p>
                <Badge tone={budget.remaining < 0 ? "red" : budget.percent >= 80 ? "lemon" : "mint"}>
                  {budget.remaining < 0 ? "Melebihi" : budget.percent >= 80 ? "Hampir habis" : "Aman"}
                </Badge>
              </div>
              <ProgressBar
                value={budget.percent}
                barClassName={budget.percent > 100 ? "bg-red-ink/60" : "bg-lavender-ink/60"}
                className="mt-3"
              />
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Terpakai</dt>
                  <dd className="font-semibold tabular-nums">{formatRupiah(budget.totalSpent)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">Total anggaran</dt>
                  <dd className="font-semibold tabular-nums">{formatRupiah(budget.totalBudget)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">{budget.remaining < 0 ? "Melebihi" : "Sisa"}</dt>
                  <dd className="font-semibold tabular-nums">{formatRupiah(Math.abs(budget.remaining))}</dd>
                </div>
              </dl>
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle
            title="Pengeluaran terbesar"
            action={
              <Link href="/reports" className="text-xs font-semibold text-lavender-ink hover:underline">
                Laporan
              </Link>
            }
          />
          <CategoryBreakdown data={data.expenseByCategory} getMeta={getExpenseMeta} emptyText="Belum ada pengeluaran bulan ini" />
        </Card>

        <Card>
          <CardTitle
            title="Transaksi terbaru"
            action={
              <Link href="/transactions" className="text-xs font-semibold text-lavender-ink hover:underline">
                Lihat semua
              </Link>
            }
          />
          {data.recentTransactions.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">Belum ada transaksi bulan ini</p>
          ) : (
            <div className="-mx-2.5">
              {data.recentTransactions.map((tx) => {
                const info = describe(tx);
                return (
                  <EntryRow
                    key={tx.uid}
                    emoji={info.emoji}
                    tone={info.tone}
                    title={info.title}
                    subtitle={info.subtitle}
                    date={tx.date}
                    amount={tx.amount}
                    direction={tx.direction}
                  />
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
