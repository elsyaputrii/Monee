import type { Metadata } from "next";
import { ExpensePage } from "@/features/expense/ExpensePage";

export const metadata: Metadata = { title: "Pengeluaran" };

export default function Page() {
  return <ExpensePage />;
}
