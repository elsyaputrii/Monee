import { api } from "@/lib/api";
import type { Debt, DebtDetail, DebtInput, DebtSummary, DebtType, PaymentInput } from "@/types";

export const debtApi = {
  list: (params: { status: "all" | "active" | "paid"; type: DebtType | "" }) =>
    api<{ items: Debt[]; summary: DebtSummary }>("/debts", {
      query: { status: params.status, type: params.type },
    }),
  detail: (id: number) => api<DebtDetail>(`/debts/${id}`),
  create: (body: DebtInput) => api<Debt>("/debts", { method: "POST", body }),
  update: (id: number, body: DebtInput) => api<Debt>(`/debts/${id}`, { method: "PUT", body }),
  remove: (id: number) => api<unknown>(`/debts/${id}`, { method: "DELETE" }),
  addPayment: (id: number, body: PaymentInput) =>
    api<DebtDetail>(`/debts/${id}/payments`, { method: "POST", body }),
  removePayment: (id: number, paymentId: number) =>
    api<DebtDetail>(`/debts/${id}/payments/${paymentId}`, { method: "DELETE" }),
};
