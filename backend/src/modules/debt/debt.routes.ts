import { Router } from "express";
import { validateBody } from "../../middleware/validate.middleware";
import * as controller from "./debt.controller";
import { debtSchema, paymentSchema } from "./debt.validation";

const router = Router();

router.get("/", controller.list);
router.post("/", validateBody(debtSchema), controller.create);
router.get("/:id", controller.detail);
router.put("/:id", validateBody(debtSchema), controller.update);
router.delete("/:id", controller.remove);

router.post("/:id/payments", validateBody(paymentSchema), controller.addPayment);
router.delete("/:id/payments/:paymentId", controller.removePayment);

export default router;
