import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { authenticate } from "./middleware/auth.middleware";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import authRoutes from "./modules/auth/auth.routes";
import budgetRoutes from "./modules/budget/budget.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import debtRoutes from "./modules/debt/debt.routes";
import expenseRoutes from "./modules/expense/expense.routes";
import incomeRoutes from "./modules/income/income.routes";
import reportRoutes from "./modules/report/report.routes";
import transactionRoutes from "./modules/transaction/transaction.routes";

export function createApp() {
  const app = express();

  if (env.isProduction) app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigins,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    }),
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "Monee API berjalan 🐷" });
  });

  // Rute publik (login & register)
  app.use("/api/auth", authRoutes);

  // Semua rute di bawah ini wajib login. Setiap query memakai user_id dari token,
  // sehingga data tiap pengguna terpisah.
  app.use("/api/dashboard", authenticate, dashboardRoutes);
  app.use("/api/income", authenticate, incomeRoutes);
  app.use("/api/expenses", authenticate, expenseRoutes);
  app.use("/api/debts", authenticate, debtRoutes);
  app.use("/api/transactions", authenticate, transactionRoutes);
  app.use("/api/budgets", authenticate, budgetRoutes);
  app.use("/api/reports", authenticate, reportRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
