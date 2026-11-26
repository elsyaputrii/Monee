import {
  ChartColumn,
  HandCoins,
  History,
  LayoutDashboard,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/income", label: "Pemasukan", icon: TrendingUp },
  { href: "/expenses", label: "Pengeluaran", icon: TrendingDown },
  { href: "/debts", label: "Utang Piutang", icon: HandCoins },
  { href: "/transactions", label: "Riwayat", icon: History },
  { href: "/budgets", label: "Anggaran", icon: PiggyBank },
  { href: "/reports", label: "Laporan", icon: ChartColumn },
];

/** Empat menu utama di bottom nav HP; sisanya masuk ke "Lainnya". */
export const PRIMARY_MOBILE_HREFS = ["/dashboard", "/income", "/expenses", "/debts"];
