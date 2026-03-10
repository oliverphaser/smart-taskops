import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { healthRouter } from "./routes/health.js";
import { createTaskRouter } from "./routes/tasks.js";
import { TaskService } from "./services/taskService.js";

export const createApp = (taskService: TaskService = new TaskService()) => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.use("/health", healthRouter);
  app.use("/api/v1/tasks", createTaskRouter(taskService));

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
