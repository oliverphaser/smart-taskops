import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import { HttpError } from "../utils/httpError.js";

type RequestPart = "body" | "query" | "params";

export const validate =
  (schema: ZodTypeAny, part: RequestPart = "body"): RequestHandler =>
  (req, _res, next) => {
    const parsed = schema.safeParse(req[part]);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join(", ");
      return next(new HttpError(400, message));
    }
    req[part] = parsed.data;
    return next();
  };
