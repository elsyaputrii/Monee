import type { Request, Response } from "express";
import { env } from "../../config/env";
import { currentUserId } from "../../middleware/auth.middleware";
import { authCookieOptions, clearCookieOptions, signToken } from "../../utils/jwt";
import { sendMessage, sendOk } from "../../utils/response";
import { getUserById, loginUser, registerUser } from "./auth.service";
import type { LoginInput, RegisterInput } from "./auth.validation";

export async function register(req: Request, res: Response) {
  const user = await registerUser(req.body as RegisterInput);
  res.cookie(env.COOKIE_NAME, signToken(user), authCookieOptions());
  sendOk(res, { user }, 201);
}

export async function login(req: Request, res: Response) {
  const user = await loginUser(req.body as LoginInput);
  res.cookie(env.COOKIE_NAME, signToken(user), authCookieOptions());
  sendOk(res, { user });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(env.COOKIE_NAME, clearCookieOptions());
  sendMessage(res, "Berhasil keluar");
}

export async function me(req: Request, res: Response) {
  const user = await getUserById(currentUserId(req));
  sendOk(res, { user });
}
