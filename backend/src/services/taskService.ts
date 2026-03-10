import type { SortOrder } from "mongoose";
import { TaskModel } from "../models/taskModel.js";
import type { Task, TaskFilters, TaskPriority, TaskStatus } from "../types/task.js";
import { HttpError } from "../utils/httpError.js";

interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  tags?: string[];
  dueDate?: string;
}

interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  tags?: string[];
  dueDate?: string;
}

export class TaskService {
  private toTask(value: unknown): Task {
    return value as Task;
  }

  async list(filters: TaskFilters): Promise<Task[]> {
    const query: Record<string, unknown> = {};

    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;

    if (filters.q?.trim()) {
      const regex = new RegExp(filters.q.trim(), "i");
      query.$or = [{ title: regex }, { description: regex }, { tags: regex }];
    }

    const direction: SortOrder = filters.order === "asc" ? 1 : -1;
    const sortMap: Record<string, SortOrder> = filters.sortBy ? { [filters.sortBy]: direction } : { createdAt: -1 };
    const items = await TaskModel.find(query).sort(sortMap);
    return items.map((item) => this.toTask(item.toJSON()));
  }

  async getById(id: string): Promise<Task> {
    const task = await TaskModel.findById(id);
    if (!task) {
      throw new HttpError(404, "A task nem található.");
    }
    return this.toTask(task.toJSON());
  }

  async create(input: CreateTaskInput): Promise<Task> {
    const created = await TaskModel.create({
      title: input.title,
      description: input.description,
      status: "todo",
      priority: input.priority ?? "medium",
      tags: input.tags ?? [],
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined
    });
    return this.toTask(created.toJSON());
  }

  async update(id: string, input: UpdateTaskInput): Promise<Task> {
    const task = await TaskModel.findById(id);
    if (!task) {
      throw new HttpError(404, "A task nem található.");
    }

    const previousStatus = task.status as TaskStatus;
    if (input.title !== undefined) task.title = input.title;
    if (input.description !== undefined) task.description = input.description;
    if (input.status !== undefined) task.status = input.status;
    if (input.priority !== undefined) task.priority = input.priority;
    if (input.tags !== undefined) task.tags = input.tags;
    if (input.dueDate !== undefined) task.dueDate = new Date(input.dueDate);

    if (input.status && input.status !== previousStatus) {
      task.completedAt = input.status === "done" ? new Date() : undefined;
    }

    await task.save();
    return this.toTask(task.toJSON());
  }

  async markDone(id: string): Promise<Task> {
    return this.update(id, { status: "done" });
  }

  async remove(id: string): Promise<void> {
    const deleted = await TaskModel.findByIdAndDelete(id);
    if (!deleted) {
      throw new HttpError(404, "A task nem található.");
    }
  }
}
