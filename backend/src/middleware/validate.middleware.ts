import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import { AppError } from "../utils/errors";

export function formatZodError(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/** Validasi data apa pun (query, params, body) dan lempar 422 jika tidak valid. */
export function parse<S extends z.ZodType>(schema: S, data: unknown): z.output<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = formatZodError(result.error);
    const firstMessage = Object.values(errors)[0] ?? "Data yang dikirim tidak valid";
    throw new AppError(422, firstMessage, errors);
  }
  return result.data;
}

/** Middleware: validasi req.body lalu ganti dengan hasil yang sudah bersih. */
export function validateBody<S extends z.ZodType>(schema: S) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.body = parse(schema, req.body ?? {});
    next();
  };
}
