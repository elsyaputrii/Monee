import { api } from "@/lib/api";
import type { TransactionList } from "@/types";

export interface TransactionParams {
  type: "all" | "income" | "expense" | "debt_payment";
  category: string;
  q: string;
  month: string; // "" = semua waktu
  page: number;
}

export const transactionApi = {
  list: (params: TransactionParams) =>
    api<TransactionList>("/transactions", {
      query: {
        type: params.type,
        category: params.category,
        q: params.q,
        month: params.month,
        page: params.page,
        limit: 15,
      },
    }),
};
