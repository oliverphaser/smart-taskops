import type { RequestHandler } from "express";
import { TaskService } from "../services/taskService.js";
import type { TaskFilters } from "../types/task.js";

export const makeTaskController = (service: TaskService) => {
  const getParamId = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) {
      return value[0] ?? "";
    }
    return value ?? "";
  };

  const list: RequestHandler = async (req, res, next) => {
    try {
      const filters = req.query as TaskFilters;
      const tasks = await service.list(filters);
      res.status(200).json({ data: tasks });
    } catch (error) {
      next(error);
    }
  };

  const getById: RequestHandler = async (req, res, next) => {
    try {
      const task = await service.getById(getParamId(req.params.id));
      res.status(200).json({ data: task });
    } catch (error) {
      next(error);
    }
  };

  const create: RequestHandler = async (req, res, next) => {
    try {
      const task = await service.create(req.body);
      res.status(201).json({ data: task });
    } catch (error) {
      next(error);
    }
  };

  const update: RequestHandler = async (req, res, next) => {
    try {
      const task = await service.update(getParamId(req.params.id), req.body);
      res.status(200).json({ data: task });
    } catch (error) {
      next(error);
    }
  };

  const complete: RequestHandler = async (req, res, next) => {
    try {
      const task = await service.markDone(getParamId(req.params.id));
      res.status(200).json({ data: task });
    } catch (error) {
      next(error);
    }
  };

  const remove: RequestHandler = async (req, res, next) => {
    try {
      await service.remove(getParamId(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  return {
    list,
    getById,
    create,
    update,
    complete,
    remove
  };
};
