import { useCallback, useEffect, useMemo, useState } from "react";
import { taskApi } from "../api/client";
import type { CreateTaskPayload, Task, TaskFilters, TaskStatus, UpdateTaskPayload } from "../types/task";

const defaultFilters: TaskFilters = {
  status: "",
  priority: "",
  q: ""
};

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await taskApi.list(filters);
      setTasks(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "A feladatlista betöltése sikertelen.");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const createTask = useCallback(
    async (payload: CreateTaskPayload) => {
      setError(null);
      try {
        await taskApi.create(payload);
        await loadTasks();
      } catch (err) {
        setError(err instanceof Error ? err.message : "A feladat létrehozása sikertelen.");
        throw err;
      }
    },
    [loadTasks]
  );

  const updateTask = useCallback(
    async (id: string, payload: UpdateTaskPayload) => {
      setError(null);
      try {
        await taskApi.update(id, payload);
        await loadTasks();
      } catch (err) {
        setError(err instanceof Error ? err.message : "A feladat frissítése sikertelen.");
        throw err;
      }
    },
    [loadTasks]
  );

  const setTaskStatus = useCallback(
    async (id: string, status: TaskStatus) => {
      if (status === "done") {
        await taskApi.complete(id);
        await loadTasks();
        return;
      }
      await updateTask(id, { status });
    },
    [loadTasks, updateTask]
  );

  const removeTask = useCallback(
    async (id: string) => {
      setError(null);
      try {
        await taskApi.remove(id);
        await loadTasks();
      } catch (err) {
        setError(err instanceof Error ? err.message : "A feladat törlése sikertelen.");
        throw err;
      }
    },
    [loadTasks]
  );

  const stats = useMemo(() => {
    // A dashboard számai mindig az aktuális listából származnak.
    const total = tasks.length;
    const done = tasks.filter((task) => task.status === "done").length;
    const inProgress = tasks.filter((task) => task.status === "in_progress").length;
    const todo = total - done - inProgress;
    return { total, done, inProgress, todo };
  }, [tasks]);

  return {
    tasks,
    filters,
    setFilters,
    isLoading,
    error,
    stats,
    reload: loadTasks,
    createTask,
    updateTask,
    setTaskStatus,
    removeTask
  };
};
