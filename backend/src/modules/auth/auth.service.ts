import bcrypt from "bcryptjs";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../../config/database";
import { env } from "../../config/env";
import { conflict, notFound, unauthorized } from "../../utils/errors";
import type { LoginInput, RegisterInput } from "./auth.validation";

interface UserRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

const toPublicUser = (row: UserRow): PublicUser => ({
  id: row.id,
  name: row.name,
  email: row.email,
  createdAt: row.created_at,
});

// Hash palsu agar waktu respon tetap mirip saat email tidak ditemukan (anti user enumeration)
const DUMMY_HASH = bcrypt.hashSync("monee-dummy-password", env.BCRYPT_SALT_ROUNDS);

export async function registerUser(input: RegisterInput): Promise<PublicUser> {
  const [existing] = await pool.query<UserRow[]>("SELECT id FROM users WHERE email = ? LIMIT 1", [
    input.email,
  ]);
  if (existing.length > 0) {
    throw conflict("Email sudah terdaftar", { email: "Email sudah terdaftar" });
  }

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_SALT_ROUNDS);
  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [input.name, input.email, passwordHash],
  );

  return getUserById(result.insertId);
}

export async function loginUser(input: LoginInput): Promise<PublicUser> {
  const [rows] = await pool.query<UserRow[]>("SELECT * FROM users WHERE email = ? LIMIT 1", [
    input.email,
  ]);
  const user = rows[0];

  const passwordMatches = await bcrypt.compare(input.password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !passwordMatches) {
    throw unauthorized("Email atau password salah");
  }

  return toPublicUser(user);
}

export async function getUserById(id: number): Promise<PublicUser> {
  const [rows] = await pool.query<UserRow[]>("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
  if (!rows[0]) throw notFound("Pengguna tidak ditemukan");
  return toPublicUser(rows[0]);
}
