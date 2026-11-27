import { createApp } from "./app";
import { pool, testConnection } from "./config/database";
import { env } from "./config/env";

async function start() {
  try {
    await testConnection();
    console.log(`✅ Terhubung ke MySQL (${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME})`);
  } catch (error) {
    console.error("❌ Gagal terhubung ke MySQL. Periksa .env dan pastikan MySQL menyala.");
    console.error(error instanceof Error ? error.message : error);
    console.error('   Belum ada database? Jalankan: npm run db:setup');
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`🐷 Monee API berjalan di http://localhost:${env.PORT}/api`);
  });

  const shutdown = (signal: string) => {
    console.log(`\n${signal} diterima, menutup server...`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start();
