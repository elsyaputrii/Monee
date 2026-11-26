export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export type IncomeSource = "uang_jajan" | "gaji_magang" | "pemberian" | "beasiswa" | "lainnya";

export type ExpenseCategory =
  | "makanan"
  | "transport"
  | "belanja"
  | "tagihan"
  | "hiburan"
  | "kesehatan"
  | "pendidikan"
  | "lainnya";

export interface Income {
  id: number;
  source: IncomeSource;
  amount: number;
  date: string;
  note: string | null;
  createdAt: string;
}

export interface Expense {
  id: number;
  category: ExpenseCategory;
  amount: number;
  date: string;
  note: string | null;
  createdAt: string;
}

export type DebtType = "utang" | "piutang";

export interface Debt {
  id: number;
  personName: string;
  type: DebtType;
  totalAmount: number;
  installmentAmount: number | null;
  installmentsLeft: number | null;
  dueDate: string | null;
  note: string | null;
  paidAmount: number;
  remainingAmount: number;
  status: "active" | "paid";
  createdAt: string;
}

export interface DebtPayment {
  id: number;
  amount: number;
  date: string;
  note: string | null;
}

export interface DebtDetail extends Debt {
  payments: DebtPayment[];
}

export interface DebtSummary {
  utangRemaining: number;
  piutangRemaining: number;
  activeCount: number;
}

export interface DebtInput {
  personName: string;
  type: DebtType;
  totalAmount: number;
  installmentAmount: number | null;
  dueDate: string | null;
  note: string | null;
}

export interface PaymentInput {
  amount: number;
  date: string;
  note: string | null;
}

export type TransactionType = "income" | "expense" | "debt_payment";

export interface Transaction {
  uid: string;
  type: TransactionType;
  direction: "in" | "out";
  id: number;
  category: string;
  amount: number;
  date: string;
  description: string | null;
  personName: string | null;
}

export interface TransactionList {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: { totalIn: number; totalOut: number };
}

export interface BalanceSummary {
  openingBalance: number;
  income: number;
  expense: number;
  debtPaid: number;
  debtReceived: number;
  closingBalance: number;
}

export interface CategoryAmount {
  category: string;
  amount: number;
  percent: number;
}

export interface BudgetItem {
  id: number;
  category: ExpenseCategory;
  month: string;
  amount: number;
  spent: number;
  remaining: number;
  percent: number;
  status: "ok" | "warning" | "over";
}

export interface BudgetOverview {
  month: string;
  items: BudgetItem[];
  unbudgeted: { category: string; spent: number }[];
  summary: { totalBudget: number; totalSpent: number; remaining: number; percent: number };
}

export interface DashboardData {
  month: string;
  summary: BalanceSummary;
  expenseByCategory: CategoryAmount[];
  recentTransactions: Transaction[];
  budget: { totalBudget: number; totalSpent: number; remaining: number; percent: number; count: number };
  debts: DebtSummary;
  trend: { month: string; income: number; expense: number }[];
}

export interface MonthlyReport {
  month: string;
  summary: BalanceSummary;
  expenseByCategory: CategoryAmount[];
  incomeBySource: CategoryAmount[];
  daily: { date: string; income: number; expense: number }[];
}

export interface YearlyMonth {
  month: number;
  income: number;
  expense: number;
  debtPaid: number;
  debtReceived: number;
  openingBalance: number;
  closingBalance: number;
}

export interface YearlyReport {
  year: number;
  summary: BalanceSummary;
  months: YearlyMonth[];
  expenseByCategory: CategoryAmount[];
  incomeBySource: CategoryAmount[];
}
