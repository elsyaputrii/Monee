import { api } from "@/lib/api";
import type { Income } from "@/types";
import type { EntryFormValues } from "@/features/entries/EntryFormModal";

export const incomeApi = {
  list: (params: { month: string; kind: string }) =>
    api<{ items: Income[]; total: number }>("/income", {
      query: { month: params.month, source: params.kind },
    }),
  save: (id: number | null, values: EntryFormValues) => {
    const body = { source: values.kind, amount: values.amount, date: values.date, note: values.note };
    return id === null
      ? api<Income>("/income", { method: "POST", body })
      : api<Income>(`/income/${id}`, { method: "PUT", body });
  },
  remove: (id: number) => api<unknown>(`/income/${id}`, { method: "DELETE" }),
};
