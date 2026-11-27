import type { Request, Response } from "express";
import { currentUserId } from "../../middleware/auth.middleware";
import { parse } from "../../middleware/validate.middleware";
import { currentMonth } from "../../utils/date";
import { sendMessage, sendOk } from "../../utils/response";
import { idParamSchema } from "../../utils/schemas";
import * as service from "./budget.service";
import { budgetQuerySchema, type BudgetInput, type CopyBudgetInput } from "./budget.validation";

export async function overview(req: Request, res: Response) {
  const { month } = parse(budgetQuerySchema, req.query);
  sendOk(res, await service.getBudgetOverview(currentUserId(req), month ?? currentMonth()));
}

export async function upsert(req: Request, res: Response) {
  sendOk(res, await service.upsertBudget(currentUserId(req), req.body as BudgetInput));
}

export async function copy(req: Request, res: Response) {
  sendOk(res, await service.copyBudgets(currentUserId(req), req.body as CopyBudgetInput));
}

export async function remove(req: Request, res: Response) {
  const { id } = parse(idParamSchema, req.params);
  await service.deleteBudget(currentUserId(req), id);
  sendMessage(res, "Anggaran dihapus");
}
