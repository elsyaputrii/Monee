import type { Request, Response } from "express";
import { z } from "zod";
import { currentUserId } from "../../middleware/auth.middleware";
import { parse } from "../../middleware/validate.middleware";
import { currentMonth } from "../../utils/date";
import { sendOk } from "../../utils/response";
import { monthSchema } from "../../utils/schemas";
import { getDashboard } from "./dashboard.service";

const querySchema = z.object({ month: monthSchema.optional() });

export async function overview(req: Request, res: Response) {
  const { month } = parse(querySchema, req.query);
  sendOk(res, await getDashboard(currentUserId(req), month ?? currentMonth()));
}
