import type { Metadata } from "next";
import { BudgetPage } from "@/features/budget/BudgetPage";

export const metadata: Metadata = { title: "Anggaran" };

export default function Page() {
  return <BudgetPage />;
}
