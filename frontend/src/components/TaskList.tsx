import type { Task, TaskStatus } from "../types/task";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  title?: string;
}

const statusLabels: Record<TaskStatus, string> = {
  todo: "Teendő",
  in_progress: "Folyamatban",
  done: "Kész"
};

const priorityLabels: Record<Task["priority"], string> = {
  low: "Alacsony",
  medium: "Közepes",
  high: "Magas",
  critical: "Kritikus"
};

const priorityColor: Record<Task["priority"], string> = {
  low: "border-l-teal-600",
  medium: "border-l-lime-600",
  high: "border-l-amber-600",
  critical: "border-l-red-700"
};

export const TaskList = ({ tasks, isLoading, onStatusChange, onDelete, title = "Feladatlista" }: TaskListProps) => {
  if (isLoading) {
    return (
      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
        <p className="mt-3 text-sm text-zinc-600">Betöltés folyamatban...</p>
      </section>
    );
  }

  if (tasks.length === 0) {
    return (
      <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
        <p className="mt-3 text-sm text-zinc-600">Nincs megjeleníthető feladat.</p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
      <div className="mt-4 grid gap-3">
        {tasks.map((task) => (
          <article
            key={task.id}
            className={`animate-rise rounded-2xl border border-zinc-200 border-l-4 bg-zinc-50/60 p-4 ${priorityColor[task.priority]}`}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-zinc-900">{task.title}</h3>
              <span className="rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700">
                {priorityLabels[task.priority]}
              </span>
            </div>

            {task.description && <p className="mt-3 text-sm leading-relaxed text-zinc-700">{task.description}</p>}

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-zinc-500">
              <span>Státusz: {statusLabels[task.status]}</span>
              {task.dueDate && <span>Határidő: {new Date(task.dueDate).toLocaleString("hu-HU")}</span>}
            </div>

            {task.tags.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <li key={tag} className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800">
                    {tag}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
              <select
                className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-800 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                value={task.status}
                onChange={(event) => void onStatusChange(task.id, event.target.value as TaskStatus)}
              >
                <option value="todo">Teendő</option>
                <option value="in_progress">Folyamatban</option>
                <option value="done">Kész</option>
              </select>
              <button
                className="h-11 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white transition hover:bg-red-800"
                onClick={() => void onDelete(task.id)}
              >
                Törlés
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
