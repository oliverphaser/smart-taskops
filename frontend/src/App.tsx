import { useEffect, useMemo, useState } from "react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { TaskFiltersBar } from "./components/TaskFilters";
import { TaskForm } from "./components/TaskForm";
import { TaskList } from "./components/TaskList";
import { useTasks } from "./hooks/useTasks";

const PAGE_SIZE = 5;

function App() {
  const { tasks, filters, setFilters, isLoading, error, stats, createTask, setTaskStatus, removeTask } = useTasks();
  const [page, setPage] = useState(1);
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "rounded-full border px-4 py-2 text-sm font-medium transition",
      isActive
        ? "border-emerald-700 bg-emerald-700 text-white"
        : "border-zinc-300 bg-white text-zinc-700 hover:border-emerald-400 hover:text-emerald-700"
    ].join(" ");

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(tasks.length / PAGE_SIZE));
  }, [tasks.length]);

  useEffect(() => {
    setPage(1);
  }, [filters.status, filters.priority, filters.q]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedTasks = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return tasks.slice(start, start + PAGE_SIZE);
  }, [page, tasks]);

  const latestTasks = useMemo(() => tasks.slice(0, 5), [tasks]);

  const goPrev = () => setPage((current) => Math.max(1, current - 1));
  const goNext = () => setPage((current) => Math.min(totalPages, current + 1));

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="animate-fade-in rounded-3xl border border-zinc-200 bg-gradient-to-br from-white via-emerald-50 to-amber-50 p-6 shadow-sm sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-700">Smart TaskOps</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-zinc-900 sm:text-4xl">Feladatkezelés fejlesztői csapatoknak</h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-zinc-600">
          Egyetlen felületen követheted a teendőket, prioritásokat és folyamatban lévő munkákat.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-3">
            <strong className="block text-2xl font-semibold text-zinc-900">{stats.total}</strong>
            <span className="text-sm text-zinc-600">Összes</span>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-3">
            <strong className="block text-2xl font-semibold text-zinc-900">{stats.todo}</strong>
            <span className="text-sm text-zinc-600">Teendő</span>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-3">
            <strong className="block text-2xl font-semibold text-zinc-900">{stats.inProgress}</strong>
            <span className="text-sm text-zinc-600">Folyamatban</span>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white/80 p-3">
            <strong className="block text-2xl font-semibold text-zinc-900">{stats.done}</strong>
            <span className="text-sm text-zinc-600">Kész</span>
          </div>
        </div>
      </header>

      <nav className="mt-4 flex flex-wrap gap-2">
        <NavLink to="/" end className={navLinkClass}>
          Áttekintés
        </NavLink>
        <NavLink to="/taskok" className={navLinkClass}>
          Feladatok
        </NavLink>
      </nav>

      {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

      <Routes>
        <Route
          path="/"
          element={
            <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[380px_1fr]">
              <TaskForm onCreate={createTask} />
              <TaskList
                tasks={latestTasks}
                isLoading={isLoading}
                onStatusChange={setTaskStatus}
                onDelete={removeTask}
                title="Legfrissebb feladatok"
              />
            </section>
          }
        />

        <Route
          path="/taskok"
          element={
            <section className="mt-4 grid grid-cols-1 gap-4">
              <TaskFiltersBar value={filters} onChange={setFilters} />
              <TaskList
                tasks={pagedTasks}
                isLoading={isLoading}
                onStatusChange={setTaskStatus}
                onDelete={removeTask}
                title={`Feladatlista (oldal: ${page}/${totalPages})`}
              />
              <div className="flex items-center justify-center gap-3">
                <button
                  className="h-11 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:border-emerald-400 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={goPrev}
                  disabled={page === 1}
                >
                  Előző
                </button>
                <span className="text-sm font-medium text-zinc-600">
                  Oldal {page} / {totalPages}
                </span>
                <button
                  className="h-11 rounded-xl border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:border-emerald-400 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={goNext}
                  disabled={page === totalPages}
                >
                  Következő
                </button>
              </div>
            </section>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}

export default App;
