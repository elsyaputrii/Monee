import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),

  DB_HOST: z.string().min(1).default("localhost"),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().min(1).default("root"),
  DB_PASSWORD: z.string().default(""),
  DB_NAME: z.string().min(1).default("monee_db"),

  JWT_SECRET: z.string().min(16, "JWT_SECRET minimal 16 karakter"),
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^\d+[smhd]$/, "JWT_EXPIRES_IN harus berformat angka + s/m/h/d, contoh: 7d")
    .default("7d"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(14).default(10),

  CORS_ORIGIN: z.string().default("http://localhost:3000"),

  COOKIE_NAME: z.string().min(1).default("monee_token"),
  COOKIE_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]).default("lax"),

  APP_TIMEZONE: z.string().min(1).default("Asia/Jakarta"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Konfigurasi .env tidak valid:");
  for (const issue of parsed.error.issues) {
    console.error(`   - ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

if (parsed.data.COOKIE_SAMESITE === "none" && !parsed.data.COOKIE_SECURE) {
  console.error("❌ COOKIE_SAMESITE=none mewajibkan COOKIE_SECURE=true (HTTPS).");
  process.exit(1);
}

export const env = {
  ...parsed.data,
  isProduction: parsed.data.NODE_ENV === "production",
  corsOrigins: parsed.data.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
