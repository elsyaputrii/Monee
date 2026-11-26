import { api } from "@/lib/api";
import type { MonthlyReport, YearlyReport } from "@/types";

export const reportApi = {
  monthly: (month: string) => api<MonthlyReport>("/reports/monthly", { query: { month } }),
  yearly: (year: number) => api<YearlyReport>("/reports/yearly", { query: { year } }),
};
