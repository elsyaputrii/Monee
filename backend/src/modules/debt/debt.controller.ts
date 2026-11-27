import type { Request, Response } from "express";
import { currentUserId } from "../../middleware/auth.middleware";
import { parse } from "../../middleware/validate.middleware";
import { sendMessage, sendOk } from "../../utils/response";
import { idParamSchema } from "../../utils/schemas";
import * as service from "./debt.service";
import {
  debtListQuerySchema,
  paymentParamsSchema,
  type DebtInput,
  type PaymentInput,
} from "./debt.validation";

export async function list(req: Request, res: Response) {
  const query = parse(debtListQuerySchema, req.query);
  sendOk(res, await service.listDebts(currentUserId(req), query));
}

export async function detail(req: Request, res: Response) {
  const { id } = parse(idParamSchema, req.params);
  sendOk(res, await service.getDebtDetail(currentUserId(req), id));
}

export async function create(req: Request, res: Response) {
  sendOk(res, await service.createDebt(currentUserId(req), req.body as DebtInput), 201);
}

export async function update(req: Request, res: Response) {
  const { id } = parse(idParamSchema, req.params);
  sendOk(res, await service.updateDebt(currentUserId(req), id, req.body as DebtInput));
}

export async function remove(req: Request, res: Response) {
  const { id } = parse(idParamSchema, req.params);
  await service.deleteDebt(currentUserId(req), id);
  sendMessage(res, "Data utang/piutang dihapus");
}

export async function addPayment(req: Request, res: Response) {
  const { id } = parse(idParamSchema, req.params);
  sendOk(res, await service.addPayment(currentUserId(req), id, req.body as PaymentInput), 201);
}

export async function removePayment(req: Request, res: Response) {
  const { id, paymentId } = parse(paymentParamsSchema, req.params);
  sendOk(res, await service.deletePayment(currentUserId(req), id, paymentId));
}
