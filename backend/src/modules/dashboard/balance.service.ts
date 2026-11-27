/**
 * Perhitungan saldo - SATU-SATUNYA tempat rumus saldo didefinisikan.
 *
 *   saldo akhir = saldo awal + pemasukan - pengeluaran
 *                 - pembayaran utang + penerimaan piutang
 *
 * - Saldo awal bulan = hasil bersih SEMUA transaksi sebelum bulan itu.
 *   Jadi saldo bulan lalu otomatis menjadi saldo awal bulan ini, dan tidak
 *   pernah dicatat sebagai pemasukan baru (tidak ada saldo ganda).
 * - Utang yang belum dibayar TIDAK memengaruhi saldo. Hanya pembayarannya.
 */
import type { RowDataPacket } from "mysql2";
import { pool } from "../../config/database";
import { percentOf, round2 } from "../../utils/date";

export interface PeriodFlows {
  income: number;
  expense: number;
  debtPaid: number; // pembayaran utang (uang keluar)
  debtReceived: number; // penerimaan piutang (uang masuk)
}

export interface BalanceSummary extends PeriodFlows {
  openingBalance: number;
  closingBalance: number;
}

export interface CategoryAmount {
  category: string;
  amount: number;
  percent: number;
}

export type FlowKind = keyof PeriodFlows;

export const emptyFlows = (): PeriodFlows => ({
  income: 0,
  expense: 0,
  debtPaid: 0,
  debtReceived: 0,
});

export const netOf = (flows: PeriodFlows): number =>
  round2(flows.income - flows.expense - flows.debtPaid + flows.debtReceived);

interface FlowRow extends RowDataPacket {
  income: number;
  expense: number;
  debt_paid: number;
  debt_received: number;
}

/**
 * Total arus kas user pada rentang tanggal [from, to).
 * from = null berarti sejak awal; to = null berarti sampai sekarang.
 */
export async function getFlows(
  userId: number,
  from: string | null,
  to: string | null,
): Promise<PeriodFlows> {
  const range = (column: string) => {
    let sql = "";
    const params: string[] = [];
    if (from) {
      sql += ` AND ${column} >= ?`;
      params.push(from);
    }
    if (to) {
      sql += ` AND ${column} < ?`;
      params.push(to);
    }
    return { sql, params };
  };

  const income = range("income_date");
  const expense = range("expense_date");
  const payment = range("p.payment_date");

  const [rows] = await pool.query<FlowRow[]>(
    `SELECT
       (SELECT COALESCE(SUM(amount), 0) FROM incomes
         WHERE user_id = ?${income.sql}) AS income,
       (SELECT COALESCE(SUM(amount), 0) FROM expenses
         WHERE user_id = ?${expense.sql}) AS expense,
       (SELECT COALESCE(SUM(p.amount), 0) FROM debt_payments p
          JOIN debts d ON d.id = p.debt_id
         WHERE p.user_id = ? AND d.type = 'utang'${payment.sql}) AS debt_paid,
       (SELECT COALESCE(SUM(p.amount), 0) FROM debt_payments p
          JOIN debts d ON d.id = p.debt_id
         WHERE p.user_id = ? AND d.type = 'piutang'${payment.sql}) AS debt_received`,
    [
      userId,
      ...income.params,
      userId,
      ...expense.params,
      userId,
      ...payment.params,
      userId,
      ...payment.params,
    ],
  );

  const row = rows[0];
  return {
    income: round2(Number(row.income)),
    expense: round2(Number(row.expense)),
    debtPaid: round2(Number(row.debt_paid)),
    debtReceived: round2(Number(row.debt_received)),
  };
}

/** Saldo awal = hasil bersih semua transaksi SEBELUM tanggal `before`. */
export async function getOpeningBalance(userId: number, before: string): Promise<number> {
  return netOf(await getFlows(userId, null, before));
}

/** Ringkasan satu periode [start, end) lengkap dengan saldo awal & akhir. */
export async function getBalanceSummary(
  userId: number,
  start: string,
  end: string,
): Promise<BalanceSummary> {
  const [openingBalance, flows] = await Promise.all([
    getOpeningBalance(userId, start),
    getFlows(userId, start, end),
  ]);
  return {
    openingBalance,
    ...flows,
    closingBalance: round2(openingBalance + netOf(flows)),
  };
}

interface GroupedRow extends RowDataPacket {
  dt: string;
  total: number;
}

/** Arus kas per hari pada rentang [from, to). */
export async function getFlowsByDate(
  userId: number,
  from: string,
  to: string,
): Promise<{ date: string; kind: FlowKind; total: number }[]> {
  const params = [userId, from, to];
  const queries: [FlowKind, string][] = [
    [
      "income",
      `SELECT income_date AS dt, SUM(amount) AS total FROM incomes
        WHERE user_id = ? AND income_date >= ? AND income_date < ?
        GROUP BY income_date`,
    ],
    [
      "expense",
      `SELECT expense_date AS dt, SUM(amount) AS total FROM expenses
        WHERE user_id = ? AND expense_date >= ? AND expense_date < ?
        GROUP BY expense_date`,
    ],
    [
      "debtPaid",
      `SELECT p.payment_date AS dt, SUM(p.amount) AS total FROM debt_payments p
         JOIN debts d ON d.id = p.debt_id
        WHERE p.user_id = ? AND d.type = 'utang' AND p.payment_date >= ? AND p.payment_date < ?
        GROUP BY p.payment_date`,
    ],
    [
      "debtReceived",
      `SELECT p.payment_date AS dt, SUM(p.amount) AS total FROM debt_payments p
         JOIN debts d ON d.id = p.debt_id
        WHERE p.user_id = ? AND d.type = 'piutang' AND p.payment_date >= ? AND p.payment_date < ?
        GROUP BY p.payment_date`,
    ],
  ];

  const results = await Promise.all(
    queries.map(async ([kind, sql]) => {
      const [rows] = await pool.query<GroupedRow[]>(sql, params);
      return rows.map((row) => ({ date: String(row.dt), kind, total: Number(row.total) }));
    }),
  );
  return results.flat();
}

/** Arus kas per bulan ("YYYY-MM") pada rentang [from, to). */
export async function getFlowsByMonth(
  userId: number,
  from: string,
  to: string,
): Promise<Map<string, PeriodFlows>> {
  const byMonth = new Map<string, PeriodFlows>();
  for (const row of await getFlowsByDate(userId, from, to)) {
    const month = row.date.slice(0, 7);
    const flows = byMonth.get(month) ?? emptyFlows();
    flows[row.kind] = round2(flows[row.kind] + row.total);
    byMonth.set(month, flows);
  }
  return byMonth;
}

interface CategoryRow extends RowDataPacket {
  category: string;
  total: number;
}

function toCategoryAmounts(rows: CategoryRow[]): CategoryAmount[] {
  const total = rows.reduce((sum, row) => sum + Number(row.total), 0);
  return rows
    .map((row) => ({
      category: row.category,
      amount: round2(Number(row.total)),
      percent: percentOf(Number(row.total), total),
    }))
    .sort((a, b) => b.amount - a.amount);
}

export async function getExpenseByCategory(
  userId: number,
  start: string,
  end: string,
): Promise<CategoryAmount[]> {
  const [rows] = await pool.query<CategoryRow[]>(
    `SELECT category, SUM(amount) AS total FROM expenses
      WHERE user_id = ? AND expense_date >= ? AND expense_date < ?
      GROUP BY category`,
    [userId, start, end],
  );
  return toCategoryAmounts(rows);
}

export async function getIncomeBySource(
  userId: number,
  start: string,
  end: string,
): Promise<CategoryAmount[]> {
  const [rows] = await pool.query<CategoryRow[]>(
    `SELECT source AS category, SUM(amount) AS total FROM incomes
      WHERE user_id = ? AND income_date >= ? AND income_date < ?
      GROUP BY source`,
    [userId, start, end],
  );
  return toCategoryAmounts(rows);
}
