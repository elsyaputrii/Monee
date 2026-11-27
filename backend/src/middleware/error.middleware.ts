import type { ErrorRequestHandler, RequestHandler } from "express";
import { env } from "../config/env";
import { AppError } from "../utils/errors";

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Rute ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.status).json({ success: false, message: err.message, errors: err.errors });
    return;
  }

  // JSON body rusak / terlalu besar (dari express.json)
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ success: false, message: "Format JSON tidak valid" });
    return;
  }
  if (err?.type === "entity.too.large") {
    res.status(413).json({ success: false, message: "Data yang dikirim terlalu besar" });
    return;
  }

  // Data ganda di MySQL (mis. email sudah terdaftar)
  if (err?.code === "ER_DUP_ENTRY") {
    res.status(409).json({ success: false, message: "Data sudah ada" });
    return;
  }

  console.error("[ERROR]", err);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server",
    ...(env.isProduction ? {} : { detail: err instanceof Error ? err.message : String(err) }),
  });
};
