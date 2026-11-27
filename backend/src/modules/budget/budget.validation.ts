import { z } from "zod";
import { EXPENSE_CATEGORIES } from "../../utils/constants";
import { amountSchema, monthSchema } from "../../utils/schemas";

export const budgetSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES, { error: "Kategori tidak valid" }),
  month: monthSchema,
  amount: amountSchema,
});

export const budgetQuerySchema = z.object({
  month: monthSchema.optional(),
});

export const copyBudgetSchema = z
  .object({
    from: monthSchema,
    to: monthSchema,
  })
  .refine((data) => data.from !== data.to, {
    message: "Bulan asal dan tujuan tidak boleh sama",
    path: ["to"],
  });

export type BudgetInput = z.infer<typeof budgetSchema>;
export type CopyBudgetInput = z.infer<typeof copyBudgetSchema>;
