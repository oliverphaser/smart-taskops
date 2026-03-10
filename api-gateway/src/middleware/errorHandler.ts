import type { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (_err, _req, res, _next) => {
  return res.status(500).json({ error: "Belső gateway hiba." });
};
