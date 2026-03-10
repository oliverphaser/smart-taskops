import type { ErrorRequestHandler } from "express";
import { HttpError } from "../utils/httpError.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  return res.status(500).json({ error: "Belső szerverhiba." });
};
