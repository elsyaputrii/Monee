"use client";

import { useState } from "react";
import { BalanceLineChart, IncomeExpenseChart } from "@/components/charts/charts";
import { CategoryBreakdown } from "@/components/charts/CategoryBreakdown";
import { BalanceBreakdown } from "@/components/ui/BalanceBreakdown";
import { Card, CardTitle } from "@/components/ui/Card";
import { ErrorNotice, PageLoader } from "@/components/ui/Feedback";
import { MonthSwitcher, Stepper } from "@/components/ui/MonthSwitcher";
import { PageHeader } from "@/components/ui/PageHeader";
import { Segmented } from "@/components/ui/Segmented";
import { StatCard } from "@/components/ui/StatCard";
import { getExpenseMeta, getIncomeMeta } from "@/lib/constants";
import { currentMonth, formatMonth, formatRupiah, monthLongName, monthShortName } from "@/lib/format";
import { useApi } from "@/lib/hooks";
import { reportApi } from "./report.api";

type Mode = "monthly" | "yearly";

export function ReportPage() {
  const [mode, setMode] = useState<Mode>("monthly");
  const [month, setMonth] = useState(currentMonth());
  const [year, setYear] = useState(Number(currentMonth().slice(0, 4)));

  return (
    <div className="animate-fade-up">
      <PageHeader title="Laporan" description="Ringkasan keuangan bulanan dan tahunan lengkap dengan grafik." />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: "monthly", label: "Bulanan" },
            { value: "yearly", label: "Tahunan" },
          ]}
        />
        {mode === "monthly" ? (
          <MonthSwitcher value={month} onChange={setMonth} />
        ) : (
          <Stepper
            label={String(year)}
            onPrev={() => setYear((current) => current - 1)}
            onNext={() => setYear((current) => current + 1)}
            onReset={year === Number(currentMonth().slice(0, 4)) ? undefined : () => setYear(Number(currentMonth().slice(0, 4)))}
            resetLabel="Tahun ini"
          />
        )}
      </div>

      {mode === "monthly" ? <MonthlyReportView month={month} /> : <YearlyReportView year={year} />}
    </div>
  );
}

function MonthlyReportView({ month }: { month: string }) {
  const { data, loading, error, reload } = useApi(() => reportApi.monthly(month), [month]);

  if (error && !data) return <ErrorNotice message={error} onRetry={reload} />;
  if (loading && !data) return <PageLoader />;
  if (!data) return null;

  const { summary } = data;
  const net = summary.income - summary.expense;
  const points = data.daily.map((day) => ({
    label: String(Number(day.date.slice(8))),
    income: day.income,
    expense: day.expense,
  }));

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm font-medium text-muted">Saldo akhir {formatMonth(month)}</p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight tabular-nums">
          {formatRupiah(summary.closingBalance)}
        </p>
        <div className="mt-5 border-t border-border pt-4">
          <BalanceBreakdown summary={summary} openingLabel="Saldo awal" />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Pemasukan" value={formatRupiah(summary.income)} emoji="💰" tone="mint" valueClassName="text-mint-ink" />
        <StatCard label="Pengeluaran" value={formatRupiah(summary.expense)} emoji="🛍️" tone="pink" valueClassName="text-pink-ink" />
        <StatCard
          label="Selisih bulan ini"
          value={`${net >= 0 ? "+" : "-"}${formatRupiah(Math.abs(net))}`}
          emoji={net >= 0 ? "🌱" : "🌧️"}
          tone={net >= 0 ? "lavender" : "red"}
          hint="Pemasukan - pengeluaran"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <Card>
        <CardTitle title="Pemasukan & pengeluaran harian" />
        <IncomeExpenseChart data={points} />
        <Legend />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle title="Pengeluaran per kategori" />
          <CategoryBreakdown data={data.expenseByCategory} getMeta={getExpenseMeta} emptyText="Belum ada pengeluaran bulan ini" />
        </Card>
        <Card>
          <CardTitle title="Pemasukan per sumber" />
          <CategoryBreakdown data={data.incomeBySource} getMeta={getIncomeMeta} emptyText="Belum ada pemasukan bulan ini" />
        </Card>
      </div>
    </div>
  );
}

function YearlyReportView({ year }: { year: number }) {
  const { data, loading, error, reload } = useApi(() => reportApi.yearly(year), [year]);

  if (error && !data) return <ErrorNotice message={error} onRetry={reload} />;
  if (loading && !data) return <PageLoader />;
  if (!data) return null;

  const { summary } = data;
  const flowPoints = data.months.map((item) => ({
    label: monthShortName(item.month),
    income: item.income,
    expense: item.expense,
  }));
  const balancePoints = data.months.map((item) => ({
    label: monthShortName(item.month),
    balance: item.closingBalance,
  }));

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm font-medium text-muted">Saldo akhir tahun {data.year}</p>
        <p className="mt-1 text-3xl font-extrabold tracking-tight tabular-nums">
          {formatRupiah(summary.closingBalance)}
        </p>
        <div className="mt-5 border-t border-border pt-4">
          <BalanceBreakdown summary={summary} openingLabel="Saldo awal tahun" />
        </div>
      </Card>

      <Card>
        <CardTitle title="Pemasukan & pengeluaran per bulan" />
        <IncomeExpenseChart data={flowPoints} />
        <Legend />
      </Card>

      <Card>
        <CardTitle title="Saldo akhir per bulan" />
        <BalanceLineChart data={balancePoints} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle title="Pengeluaran per kategori" />
          <CategoryBreakdown data={data.expenseByCategory} getMeta={getExpenseMeta} emptyText="Belum ada pengeluaran tahun ini" />
        </Card>
        <Card>
          <CardTitle title="Pemasukan per sumber" />
          <CategoryBreakdown data={data.incomeBySource} getMeta={getIncomeMeta} emptyText="Belum ada pemasukan tahun ini" />
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="p-5 pb-3">
          <h2 className="text-base font-bold">Rincian per bulan</h2>
          <p className="mt-1 text-xs text-muted">Saldo akhir tiap bulan menjadi saldo awal bulan berikutnya.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-y border-border bg-surface-2 text-left text-xs text-muted">
                <th className="px-5 py-2.5 font-semibold">Bulan</th>
                <th className="px-3 py-2.5 text-right font-semibold">Saldo awal</th>
                <th className="px-3 py-2.5 text-right font-semibold">Masuk</th>
                <th className="px-3 py-2.5 text-right font-semibold">Keluar</th>
                <th className="px-5 py-2.5 text-right font-semibold">Saldo akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border tabular-nums">
              {data.months.map((item) => (
                <tr key={item.month}>
                  <td className="px-5 py-2.5 font-medium">{monthLongName(item.month)}</td>
                  <td className="px-3 py-2.5 text-right text-muted">{formatRupiah(item.openingBalance)}</td>
                  <td className="px-3 py-2.5 text-right text-mint-ink">{formatRupiah(item.income + item.debtReceived)}</td>
                  <td className="px-3 py-2.5 text-right text-pink-ink">{formatRupiah(item.expense + item.debtPaid)}</td>
                  <td className="px-5 py-2.5 text-right font-bold">{formatRupiah(item.closingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Legend() {
  return (
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
  );
}
