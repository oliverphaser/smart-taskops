export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  q?: string;
  sortBy?: "createdAt" | "dueDate" | "priority";
  order?: "asc" | "desc";
}
