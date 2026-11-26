import type { Metadata } from "next";
import { TransactionPage } from "@/features/transaction/TransactionPage";

export const metadata: Metadata = { title: "Riwayat" };

export default function Page() {
  return <TransactionPage />;
}
