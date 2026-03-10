import { FormEvent, useState } from "react";
import type { CreateTaskPayload, TaskPriority } from "../types/task";

interface TaskFormProps {
  onCreate: (payload: CreateTaskPayload) => Promise<void>;
}

const priorityOptions: Array<{ value: TaskPriority; label: string }> = [
  { value: "low", label: "Alacsony" },
  { value: "medium", label: "Közepes" },
  { value: "high", label: "Magas" },
  { value: "critical", label: "Kritikus" }
];

export const TaskForm = ({ onCreate }: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [tags, setTags] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controlClass =
    "h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-800 transition placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100";

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("A cím nem lehet üres.");
      return;
    }

    setSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined
      });
      setTitle("");
      setDescription("");
      setPriority("medium");
      setTags("");
      setDueDate("");
    } catch {
      setError("A feladat mentése sikertelen.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-900">Új feladat</h2>
      <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
        <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
          Cím
          <input
            className={controlClass}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Pl. CI pipeline javítás"
          />
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
          Leírás
          <textarea
            className="min-h-28 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-800 transition placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Rövid leírás a feladatról"
            rows={3}
          />
        </label>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
            Prioritás
            <select
              className={controlClass}
              value={priority}
              onChange={(event) => setPriority(event.target.value as TaskPriority)}
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
            Határidő
            <input
              className={controlClass}
              type="datetime-local"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </label>
        </div>

        <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
          Címkék (vesszővel elválasztva)
          <input
            className={controlClass}
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="ops, backend, security"
          />
        </label>

        {error && <p className="text-sm font-medium text-red-700">{error}</p>}
        <button
          className="h-11 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Mentés..." : "Feladat létrehozása"}
        </button>
      </form>
    </section>
  );
};
