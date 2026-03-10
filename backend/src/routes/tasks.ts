import { Router } from "express";
import { z } from "zod";
import { makeTaskController } from "../controllers/taskController.js";
import { validate } from "../middleware/validate.js";
import { TaskService } from "../services/taskService.js";

const statusSchema = z.enum(["todo", "in_progress", "done"]);
const prioritySchema = z.enum(["low", "medium", "high", "critical"]);

const querySchema = z.object({
  status: statusSchema.optional(),
  priority: prioritySchema.optional(),
  q: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "dueDate", "priority"]).optional(),
  order: z.enum(["asc", "desc"]).optional()
});

const createTaskSchema = z.object({
  title: z.string().trim().min(1, "A cím kötelező.").max(200),
  description: z.string().trim().max(2000).optional(),
  priority: prioritySchema.optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).optional(),
  dueDate: z.string().datetime().optional()
});

const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).optional(),
    status: statusSchema.optional(),
    priority: prioritySchema.optional(),
    tags: z.array(z.string().trim().min(1).max(30)).max(10).optional(),
    dueDate: z.string().datetime().optional()
  })
  .refine((value) => Object.keys(value).length > 0, { message: "Legalább egy mezőt meg kell adni." });

const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Érvénytelen azonosító.")
});

export const createTaskRouter = (service: TaskService): Router => {
  const router = Router();
  const controller = makeTaskController(service);

  router.get("/", validate(querySchema, "query"), controller.list);
  router.get("/:id", validate(idParamSchema, "params"), controller.getById);
  router.post("/", validate(createTaskSchema), controller.create);
  router.patch("/:id", validate(idParamSchema, "params"), validate(updateTaskSchema), controller.update);
  router.post("/:id/complete", validate(idParamSchema, "params"), controller.complete);
  router.delete("/:id", validate(idParamSchema, "params"), controller.remove);

  return router;
};
