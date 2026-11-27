import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../../config/database";
import { monthRange, percentOf, round2 } from "../../utils/date";
import { notFound } from "../../utils/errors";
import { getExpenseByCategory } from "../dashboard/balance.service";
import type { BudgetInput, CopyBudgetInput } from "./budget.validation";

interface BudgetRow extends RowDataPacket {
  id: number;
  category: string;
  budget_month: string;
  amount: number;
}

type BudgetStatus = "ok" | "warning" | "over";

const statusOf = (percent: number): BudgetStatus =>
  percent > 100 ? "over" : percent >= 80 ? "warning" : "ok";

/** Anggaran per kategori untuk satu bulan, lengkap dengan realisasi pengeluaran. */
export async function getBudgetOverview(userId: number, month: string) {
  const { start, end } = monthRange(month);

  const [rows, spentByCategory] = await Promise.all([
    pool
      .query<BudgetRow[]>(
        "SELECT id, category, budget_month, amount FROM budgets WHERE user_id = ? AND budget_month = ? ORDER BY category",
        [userId, month],
      )
      .then(([result]) => result),
    getExpenseByCategory(userId, start, end),
  ]);

  const spentMap = new Map(spentByCategory.map((item) => [item.category, item.amount]));

  const items = rows.map((row) => {
    const amount = Number(row.amount);
    const spent = spentMap.get(row.category) ?? 0;
    const percent = percentOf(spent, amount);
    return {
      id: row.id,
      category: row.category,
      month: row.budget_month,
      amount,
      spent,
      remaining: round2(amount - spent),
      percent,
      status: statusOf(percent),
    };
  });

  const budgetedCategories = new Set(items.map((item) => item.category));
  const unbudgeted = spentByCategory
    .filter((item) => !budgetedCategories.has(item.category))
    .map((item) => ({ category: item.category, spent: item.amount }));

  const totalBudget = round2(items.reduce((sum, item) => sum + item.amount, 0));
  const totalSpent = round2(items.reduce((sum, item) => sum + item.spent, 0));
  const percent = percentOf(totalSpent, totalBudget);

  return {
    month,
    items,
    unbudgeted,
    summary: { totalBudget, totalSpent, remaining: round2(totalBudget - totalSpent), percent },
  };
}

/** Buat atau ubah anggaran (satu kategori per bulan). */
export async function upsertBudget(userId: number, input: BudgetInput) {
  const [existing] = await pool.query<BudgetRow[]>(
    "SELECT id FROM budgets WHERE user_id = ? AND category = ? AND budget_month = ? LIMIT 1",
    [userId, input.category, input.month],
  );

  if (existing[0]) {
    await pool.query("UPDATE budgets SET amount = ? WHERE id = ? AND user_id = ?", [
      input.amount,
      existing[0].id,
      userId,
    ]);
  } else {
    await pool.query("INSERT INTO budgets (user_id, category, budget_month, amount) VALUES (?, ?, ?, ?)", [
      userId,
      input.category,
      input.month,
      input.amount,
    ]);
  }

  return getBudgetOverview(userId, input.month);
}

export async function deleteBudget(userId: number, id: number) {
  const [rows] = await pool.query<BudgetRow[]>(
    "SELECT id FROM budgets WHERE id = ? AND user_id = ? LIMIT 1",
    [id, userId],
  );
  if (!rows[0]) throw notFound("Anggaran tidak ditemukan");
  await pool.query("DELETE FROM budgets WHERE id = ? AND user_id = ?", [id, userId]);
}

/** Salin anggaran dari bulan lain (kategori yang sudah ada di bulan tujuan tidak ditimpa). */
export async function copyBudgets(userId: number, input: CopyBudgetInput) {
  const [source] = await pool.query<BudgetRow[]>(
    "SELECT category, amount FROM budgets WHERE user_id = ? AND budget_month = ?",
    [userId, input.from],
  );

  const [target] = await pool.query<BudgetRow[]>(
    "SELECT category FROM budgets WHERE user_id = ? AND budget_month = ?",
    [userId, input.to],
  );
  const existing = new Set(target.map((row) => row.category));

  for (const row of source) {
    if (existing.has(row.category)) continue;
    await pool.query<ResultSetHeader>(
      "INSERT INTO budgets (user_id, category, budget_month, amount) VALUES (?, ?, ?, ?)",
      [userId, row.category, input.to, row.amount],
    );
  }

  return getBudgetOverview(userId, input.to);
}
