import { Router } from "express";
import { validateBody } from "../../middleware/validate.middleware";
import * as controller from "./budget.controller";
import { budgetSchema, copyBudgetSchema } from "./budget.validation";

const router = Router();

router.get("/", controller.overview);
router.put("/", validateBody(budgetSchema), controller.upsert);
router.post("/copy", validateBody(copyBudgetSchema), controller.copy);
router.delete("/:id", controller.remove);

export default router;
