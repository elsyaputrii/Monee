import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string({ error: "Nama wajib diisi" })
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(60, "Nama maksimal 60 karakter"),
  email: z
    .string({ error: "Email wajib diisi" })
    .trim()
    .toLowerCase()
    .max(150, "Email maksimal 150 karakter")
    .pipe(z.email("Format email tidak valid")),
  password: z
    .string({ error: "Password wajib diisi" })
    .min(8, "Password minimal 8 karakter")
    .max(72, "Password maksimal 72 karakter")
    .regex(/[A-Za-z]/, "Password harus mengandung huruf")
    .regex(/\d/, "Password harus mengandung angka"),
});

export const loginSchema = z.object({
  email: z
    .string({ error: "Email wajib diisi" })
    .trim()
    .toLowerCase()
    .pipe(z.email("Format email tidak valid")),
  password: z.string({ error: "Password wajib diisi" }).min(1, "Password wajib diisi").max(72),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
