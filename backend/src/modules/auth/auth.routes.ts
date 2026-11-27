import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { authenticate } from "../../middleware/auth.middleware";
import { validateBody } from "../../middleware/validate.middleware";
import * as controller from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validation";

const router = Router();

// Batasi percobaan login/register agar sulit di-brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Terlalu banyak percobaan, coba lagi dalam 15 menit" },
});

router.post("/register", authLimiter, validateBody(registerSchema), controller.register);
router.post("/login", authLimiter, validateBody(loginSchema), controller.login);
router.post("/logout", controller.logout);
router.get("/me", authenticate, controller.me);

export default router;
