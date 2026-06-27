"use client";

import { useState, useEffect } from "react";

type FilterType = "all" | "active" | "completed";

interface Task {
  id: number;
  text: string;
  done: boolean;
}

const STORAGE_KEY = "todo-next-tasks";

const FILTERS: { key: FilterType; label: string; emoji: string }[] = [
  { key: "all",       label: "すべて",   emoji: "✨" },
  { key: "active",    label: "未完了",   emoji: "🌸" },
  { key: "completed", label: "完了済み", emoji: "🎉" },
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTasks(JSON.parse(saved));
    } catch {}
  }, []);

  const save = (next: Task[]) => {
    setTasks(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    save([...tasks, { id: Date.now(), text, done: false }]);
    setInput("");
  };

  const toggleDone = (id: number) =>
    save(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTask = (id: number) =>
    save(tasks.filter((t) => t.id !== id));

  const clearCompleted = () =>
    save(tasks.filter((t) => !t.done));

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.text);
  };

  const commitEdit = () => {
    if (editText.trim())
      save(tasks.map((t) => (t.id === editingId ? { ...t, text: editText.trim() } : t)));
    setEditingId(null);
  };

  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "completed") return t.done;
    return true;
  });

  const activeCount = tasks.filter((t) => !t.done).length;
  const doneCount   = tasks.filter((t) =>  t.done).length;

  const today = new Date().toLocaleDateString("ja-JP", {
    year: "numeric", month: "long", day: "numeric", weekday: "short",
  });

  return (
    <div
      className="min-h-screen flex items-start justify-center pt-10 px-4 pb-16"
      style={{
        background: "linear-gradient(135deg, #fce4ec 0%, #f3e5f5 40%, #e8eaf6 100%)",
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 8px 40px rgba(180,120,200,0.18), 0 2px 8px rgba(180,120,200,0.10)",
          border: "1.5px solid rgba(255,255,255,0.7)",
        }}
      >
        {/* ── Header ── */}
        <div
          className="px-7 pt-7 pb-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #f48fb1 0%, #ce93d8 60%, #9fa8da 100%)",
          }}
        >
          {/* 装飾バブル */}
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-20 bg-white" />
          <div className="absolute top-8 -right-2 w-14 h-14 rounded-full opacity-15 bg-white" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🌷</span>
              <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-sm">
                My ToDo
              </h1>
            </div>
            <p className="text-pink-100 text-sm font-medium">{today}</p>

            {/* Progress bar */}
            {tasks.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-pink-100 mb-1.5">
                  <span>{doneCount} / {tasks.length} 完了</span>
                  <span>{Math.round((doneCount / tasks.length) * 100)}%</span>
                </div>
                <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-500"
                    style={{ width: `${(doneCount / tasks.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Input ── */}
        <form onSubmit={addTask} className="flex gap-2.5 px-5 py-4 border-b border-pink-100/60">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="🖊️ 新しいタスクを追加..."
            maxLength={100}
            className="flex-1 rounded-2xl px-4 py-2.5 text-sm text-gray-700 placeholder-pink-300 focus:outline-none transition"
            style={{
              background: "rgba(252,228,236,0.45)",
              border: "1.5px solid rgba(244,143,177,0.3)",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(206,147,216,0.7)")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(244,143,177,0.3)")}
          />
          <button
            type="submit"
            className="flex-shrink-0 w-11 h-11 rounded-2xl text-white text-xl font-bold flex items-center justify-center active:scale-90 transition-transform"
            style={{
              background: "linear-gradient(135deg, #f48fb1, #ce93d8)",
              boxShadow: "0 4px 12px rgba(206,147,216,0.4)",
            }}
          >
            +
          </button>
        </form>

        {/* ── Filter tabs ── */}
        <div className="flex gap-2 px-5 py-3 border-b border-pink-100/60">
          {FILTERS.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={
                filter === key
                  ? {
                      background: "linear-gradient(135deg, #f48fb1, #ce93d8)",
                      color: "#fff",
                      boxShadow: "0 3px 10px rgba(206,147,216,0.35)",
                    }
                  : {
                      background: "rgba(252,228,236,0.4)",
                      color: "#c2788a",
                    }
              }
            >
              {emoji} {label}
            </button>
          ))}
        </div>

        {/* ── Task list ── */}
        <ul className="min-h-24 max-h-96 overflow-y-auto">
          {filtered.length === 0 && (
            <li className="flex flex-col items-center justify-center py-12 gap-2 text-pink-300">
              <span className="text-4xl">🌸</span>
              <span className="text-sm font-medium">タスクがありません</span>
            </li>
          )}
          {filtered.map((task) => (
            <li
              key={task.id}
              className="flex items-center gap-3 px-5 py-3.5 border-b border-pink-50 last:border-none group transition-colors hover:bg-pink-50/40"
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleDone(task.id)}
                className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                style={
                  task.done
                    ? {
                        background: "linear-gradient(135deg, #f48fb1, #ce93d8)",
                        borderColor: "transparent",
                        boxShadow: "0 2px 8px rgba(206,147,216,0.4)",
                      }
                    : { borderColor: "#f8bbd0", background: "transparent" }
                }
              >
                {task.done && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4l3 3 5-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              {/* Text / Edit */}
              {editingId === task.id ? (
                <input
                  autoFocus
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitEdit();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="flex-1 rounded-lg px-2 py-0.5 text-sm focus:outline-none"
                  style={{
                    border: "1.5px solid #ce93d8",
                    background: "rgba(252,228,236,0.5)",
                  }}
                />
              ) : (
                <span
                  onDoubleClick={() => !task.done && startEdit(task)}
                  title={task.done ? undefined : "ダブルクリックで編集"}
                  className={`flex-1 text-sm leading-relaxed break-words select-none ${
                    task.done
                      ? "line-through text-pink-200"
                      : "text-gray-600 cursor-text"
                  }`}
                >
                  {task.text}
                </span>
              )}

              {/* Delete */}
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-pink-200 hover:text-rose-400 text-sm px-1"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-5 py-3.5 text-xs text-pink-300 font-medium">
          <span>🌟 残り {activeCount} 件</span>
          <button
            onClick={clearCompleted}
            className="hover:text-rose-400 transition-colors"
          >
            完了済みを削除
          </button>
        </div>
      </div>
    </div>
  );
}
