"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompact, formatRupiah } from "@/lib/format";

/** Warna donat (pastel) - urut sesuai peringkat. */
export const DONUT_COLORS = [
  "#f58db1",
  "#5fd0a3",
  "#9b88f0",
  "#f6a778",
  "#6cb8ee",
  "#eccb4a",
  "#ee7b7b",
  "#b7c0cf",
];

const tooltipStyle = {
  contentStyle: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 14,
    fontSize: 12,
    color: "var(--foreground)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },
  labelStyle: { color: "var(--muted)", fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: "var(--foreground)" },
  cursor: { fill: "var(--surface-2)", opacity: 0.7 },
} as const;

const axisTick = { fill: "var(--muted)", fontSize: 11 };

const formatTooltip = (value: unknown) => formatRupiah(Number(value ?? 0));

export interface FlowPoint {
  label: string;
  income: number;
  expense: number;
}

/** Batang pemasukan vs pengeluaran. */
export function IncomeExpenseChart({ data, height = 260 }: { data: FlowPoint[]; height?: number }) {
  return (
    <div role="img" aria-label="Grafik pemasukan dan pengeluaran">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 4, left: -8, bottom: 0 }} barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} tickFormatter={formatCompact} width={48} />
          <Tooltip {...tooltipStyle} formatter={(value, name) => [formatTooltip(value), String(name)]} />
          <Bar dataKey="income" name="Pemasukan" fill="var(--chart-income)" radius={[6, 6, 0, 0]} maxBarSize={22} />
          <Bar dataKey="expense" name="Pengeluaran" fill="var(--chart-expense)" radius={[6, 6, 0, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface BalancePoint {
  label: string;
  balance: number;
}

/** Garis saldo akhir tiap bulan. */
export function BalanceLineChart({ data, height = 220 }: { data: BalancePoint[]; height?: number }) {
  return (
    <div role="img" aria-label="Grafik saldo akhir per bulan">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} tickFormatter={formatCompact} width={48} />
          <Tooltip {...tooltipStyle} formatter={(value) => [formatTooltip(value), "Saldo akhir"]} />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="var(--chart-line)"
            strokeWidth={3}
            dot={{ r: 3.5, fill: "var(--chart-line)", strokeWidth: 0 }}
            activeDot={{ r: 5.5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface DonutSlice {
  name: string;
  value: number;
}

/** Donat komposisi per kategori. */
export function DonutChart({ data, height = 200 }: { data: DonutSlice[]; height?: number }) {
  return (
    <div role="img" aria-label="Grafik komposisi per kategori">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Tooltip {...tooltipStyle} formatter={(value, name) => [formatTooltip(value), String(name)]} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="92%"
            paddingAngle={data.length > 1 ? 3 : 0}
            cornerRadius={6}
            stroke="none"
          >
            {data.map((slice, index) => (
              <Cell key={slice.name} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
