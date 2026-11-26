import { api } from "@/lib/api";
import type { Expense } from "@/types";
import type { EntryFormValues } from "@/features/entries/EntryFormModal";

export const expenseApi = {
  list: (params: { month: string; kind: string }) =>
    api<{ items: Expense[]; total: number }>("/expenses", {
      query: { month: params.month, category: params.kind },
    }),
  save: (id: number | null, values: EntryFormValues) => {
    const body = { category: values.kind, amount: values.amount, date: values.date, note: values.note };
    return id === null
      ? api<Expense>("/expenses", { method: "POST", body })
      : api<Expense>(`/expenses/${id}`, { method: "PUT", body });
  },
  remove: (id: number) => api<unknown>(`/expenses/${id}`, { method: "DELETE" }),
};
