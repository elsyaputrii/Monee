import { addMonths, monthRange } from "../../utils/date";
import { getBudgetOverview } from "../budget/budget.service";
import { getDebtSummary } from "../debt/debt.service";
import { listTransactions } from "../transaction/transaction.service";
import {
  emptyFlows,
  getBalanceSummary,
  getExpenseByCategory,
  getFlowsByMonth,
} from "./balance.service";

export async function getDashboard(userId: number, month: string) {
  const { start, end } = monthRange(month);
  const trendFirstMonth = addMonths(month, -5);

  const [summary, topExpenses, recent, budget, debts, trendFlows] = await Promise.all([
    getBalanceSummary(userId, start, end),
    getExpenseByCategory(userId, start, end),
    listTransactions(userId, { type: "all", month, page: 1, limit: 5 }),
    getBudgetOverview(userId, month),
    getDebtSummary(userId),
    getFlowsByMonth(userId, monthRange(trendFirstMonth).start, end),
  ]);

  // Tren 6 bulan terakhir (termasuk bulan terpilih)
  const trend = Array.from({ length: 6 }, (_, index) => {
    const key = addMonths(trendFirstMonth, index);
    const flows = trendFlows.get(key) ?? emptyFlows();
    return { month: key, income: flows.income, expense: flows.expense };
  });

  return {
    month,
    summary,
    expenseByCategory: topExpenses.slice(0, 5),
    recentTransactions: recent.items,
    budget: { ...budget.summary, count: budget.items.length },
    debts,
    trend,
  };
}
