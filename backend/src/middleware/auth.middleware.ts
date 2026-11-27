import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { unauthorized } from "../utils/errors";
import { verifyToken } from "../utils/jwt";

/** Wajib login: membaca JWT dari cookie httpOnly. */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[env.COOKIE_NAME];
  if (!token || typeof token !== "string") {
    throw unauthorized();
  }

  const user = verifyToken(token);
  if (!user) {
    throw unauthorized("Sesi tidak valid atau sudah berakhir, silakan login ulang");
  }

  req.user = user;
  next();
}

/** ID user yang sedang login. Semua query data WAJIB memakai ID ini. */
export function currentUserId(req: Request): number {
  if (!req.user) throw unauthorized();
  return req.user.id;
}
