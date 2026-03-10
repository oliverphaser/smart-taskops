import type { TaskFilters, TaskPriority, TaskStatus } from "../types/task";

interface TaskFiltersProps {
  value: TaskFilters;
  onChange: (filters: TaskFilters) => void;
}

const statusOptions: Array<{ value: "" | TaskStatus; label: string }> = [
  { value: "", label: "Minden státusz" },
  { value: "todo", label: "Teendő" },
  { value: "in_progress", label: "Folyamatban" },
  { value: "done", label: "Kész" }
];

const priorityOptions: Array<{ value: "" | TaskPriority; label: string }> = [
  { value: "", label: "Minden prioritás" },
  { value: "low", label: "Alacsony" },
  { value: "medium", label: "Közepes" },
  { value: "high", label: "Magas" },
  { value: "critical", label: "Kritikus" }
];

export const TaskFiltersBar = ({ value, onChange }: TaskFiltersProps) => {
  const controlClass =
    "h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-800 transition placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100";

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">Szűrés</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
          Keresés
          <input
            className={controlClass}
            value={value.q ?? ""}
            onChange={(event) => onChange({ ...value, q: event.target.value })}
            placeholder="Keress címre, leírásra vagy címkére"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
          Státusz
          <select
            className={controlClass}
            value={value.status ?? ""}
            onChange={(event) => onChange({ ...value, status: event.target.value as TaskStatus | "" })}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
          Prioritás
          <select
            className={controlClass}
            value={value.priority ?? ""}
            onChange={(event) => onChange({ ...value, priority: event.target.value as TaskPriority | "" })}
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
};
