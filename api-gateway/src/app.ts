import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";

const createTargetUrl = (path: string): string => {
  const base = new URL(env.TASK_SERVICE_URL);
  return new URL(path, base).toString();
};

export const createApp = () => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: "smart-taskops-api-gateway",
      timestamp: new Date().toISOString()
    });
  });

  app.use("/api/v1/tasks", async (req, res, next) => {
    try {
      const targetUrl = createTargetUrl(req.originalUrl);
      const headers: Record<string, string> = {
        Accept: "application/json"
      };
      if (req.headers["content-type"]) {
        headers["Content-Type"] = req.headers["content-type"];
      }

      const shouldHaveBody = !["GET", "HEAD"].includes(req.method);
      const response = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: shouldHaveBody ? JSON.stringify(req.body ?? {}) : undefined
      });

      const responseText = await response.text();
      res.status(response.status);
      const contentType = response.headers.get("content-type");
      if (contentType) {
        res.setHeader("content-type", contentType);
      }
      if (responseText.length === 0) {
        res.end();
        return;
      }
      res.send(responseText);
    } catch (error) {
      next(error);
    }
  });

  app.use(errorHandler);
  return app;
};
