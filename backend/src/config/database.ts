import mysql from "mysql2/promise";
import { env } from "./env";

/**
 * Pool koneksi MySQL.
 * - decimalNumbers: kolom DECIMAL dikembalikan sebagai number (bukan string)
 * - dateStrings: kolom DATE dikembalikan sebagai "YYYY-MM-DD" (tanpa geser zona waktu)
 */
export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  dateStrings: true,
});

export async function testConnection(): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}
