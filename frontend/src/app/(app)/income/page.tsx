import type { Metadata } from "next";
import { IncomePage } from "@/features/income/IncomePage";

export const metadata: Metadata = { title: "Pemasukan" };

export default function Page() {
  return <IncomePage />;
}
