import type { Metadata } from "next";
import { DebtPage } from "@/features/debt/DebtPage";

export const metadata: Metadata = { title: "Utang Piutang" };

export default function Page() {
  return <DebtPage />;
}
