import { api } from "@/lib/api";
import type { DashboardData } from "@/types";

export const dashboardApi = {
  overview: (month: string) => api<DashboardData>("/dashboard", { query: { month } }),
};
