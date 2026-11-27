import { z } from "zod";
import { DEBT_TYPES } from "../../utils/constants";
import { amountSchema, dateSchema, noteSchema } from "../../utils/schemas";

export const debtSchema = z
  .object({
    personName: z
      .string({ error: "Nama orang wajib diisi" })
      .trim()
      .min(1, "Nama orang wajib diisi")
      .max(100, "Nama orang maksimal 100 karakter"),
    type: z.enum(DEBT_TYPES, { error: "Jenis harus utang atau piutang" }),
    totalAmount: amountSchema,
    installmentAmount: amountSchema.nullish().transform((value) => value ?? null),
    dueDate: dateSchema.nullish().transform((value) => value ?? null),
    note: noteSchema,
  })
  .refine((data) => data.installmentAmount === null || data.installmentAmount <= data.totalAmount, {
    message: "Cicilan tidak boleh lebih besar dari total",
    path: ["installmentAmount"],
  });

export const paymentSchema = z.object({
  amount: amountSchema,
  date: dateSchema,
  note: noteSchema,
});

export const debtListQuerySchema = z.object({
  status: z.enum(["all", "active", "paid"]).default("all"),
  type: z.enum(DEBT_TYPES).optional(),
});

export const paymentParamsSchema = z.object({
  id: z.coerce.number().int().positive("ID tidak valid"),
  paymentId: z.coerce.number().int().positive("ID pembayaran tidak valid"),
});

export type DebtInput = z.infer<typeof debtSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type DebtListQuery = z.infer<typeof debtListQuerySchema>;
