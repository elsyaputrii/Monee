import { Router } from "express";
import * as controller from "./dashboard.controller";

const router = Router();

router.get("/", controller.overview);

export default router;
