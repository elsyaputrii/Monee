import type { Metadata } from "next";
import { ReportPage } from "@/features/report/ReportPage";

export const metadata: Metadata = { title: "Laporan" };

export default function Page() {
  return <ReportPage />;
}
