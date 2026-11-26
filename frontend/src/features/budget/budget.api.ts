import { api } from "@/lib/api";
import type { BudgetOverview } from "@/types";

export const budgetApi = {
  overview: (month: string) => api<BudgetOverview>("/budgets", { query: { month } }),
  save: (body: { category: string; month: string; amount: number }) =>
    api<BudgetOverview>("/budgets", { method: "PUT", body }),
  remove: (id: number) => api<unknown>(`/budgets/${id}`, { method: "DELETE" }),
  copy: (body: { from: string; to: string }) =>
    api<BudgetOverview>("/budgets/copy", { method: "POST", body }),
};
