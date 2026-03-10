import type { CreateTaskPayload, Task, TaskFilters, UpdateTaskPayload } from "../types/task";

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api/v1";

interface ApiResponse<T> {
  data: T;
  error?: string;
}

const buildQuery = (filters: TaskFilters): string => {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  return params.toString();
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...init
  });

  if (!response.ok) {
    let message = "Ismeretlen hiba történt.";
    try {
      const body = (await response.json()) as ApiResponse<never>;
      if (body.error) {
        message = body.error;
      }
    } catch {
      // Nem JSON válasz esetén visszaesik az alapüzenetre.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json()) as ApiResponse<T>;
  return body.data;
}

export const taskApi = {
  list(filters: TaskFilters): Promise<Task[]> {
    const query = buildQuery(filters);
    return request<Task[]>(`/tasks${query ? `?${query}` : ""}`);
  },
  create(payload: CreateTaskPayload): Promise<Task> {
    return request<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  update(id: string, payload: UpdateTaskPayload): Promise<Task> {
    return request<Task>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },
  complete(id: string): Promise<Task> {
    return request<Task>(`/tasks/${id}/complete`, {
      method: "POST"
    });
  },
  remove(id: string): Promise<void> {
    return request<void>(`/tasks/${id}`, {
      method: "DELETE"
    });
  }
};
