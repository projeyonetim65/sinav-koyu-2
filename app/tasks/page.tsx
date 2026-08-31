"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

type Task = {
  id: number;
  user_id: string;
  plan_id: number | null;
  topic_id: number | null;
  title: string;
  description: string | null;
  task_date: string;
  status: string;
  duration_minutes: number | null;
  question_count: number | null;
  created_at: string;
  completed_at: string | null;
};

type FilterType =
  | "all"
  | "today"
  | "pending"
  | "completed";

type MessageType =
  | "success"
  | "error"
  | "warning";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [duration, setDuration] = useState("");
  const [questionCount, setQuestionCount] =
    useState("");

  const [filter, setFilter] =
    useState<FilterType>("today");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<MessageType>("success");

  const [deletingTaskId, setDeletingTaskId] =
    useState<number | null>(null);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  useEffect(() => {
    const today = getLocalDate();

    setTaskDate(today);
    loadTasks();
  }, []);

  function getLocalDate() {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(
      now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function showMessage(
    text: string,
    type: MessageType
  ) {
    setMessage(text);
    setMessageType(type);

    window.setTimeout(() => {
      setMessage("");
    }, 4000);
  }

  async function loadTasks() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.replace("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("tasks")
      .select(
        "id, user_id, plan_id, topic_id, title, description, task_date, status, duration_minutes, question_count, created_at, completed_at"
      )
      .eq("user_id", user.id)
      .order("task_date", {
        ascending: true,
      })
      .order("id", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Görev yükleme hatası:",
        error.message,
        error.details,
        error.hint,
        error.code
      );

      showMessage(
        `Görevler yüklenemedi: ${
          error.message || "Bilinmeyen hata"
        }`,
        "error"
      );

      setLoading(false);
      return;
    }

    setTasks(data || []);
    setLoading(false);
  }

  async function addTask() {
    setMessage("");

    if (!title.trim()) {
      showMessage(
        "Lütfen görev adı gir.",
        "warning"
      );
      return;
    }

    if (!taskDate) {
      showMessage(
        "Lütfen görev tarihi seç.",
        "warning"
      );
      return;
    }

    if (
      duration &&
      (!Number.isFinite(Number(duration)) ||
        Number(duration) < 0)
    ) {
      showMessage(
        "Lütfen geçerli bir süre gir.",
        "warning"
      );
      return;
    }

    if (
      questionCount &&
      (!Number.isFinite(
        Number(questionCount)
      ) ||
        Number(questionCount) < 0)
    ) {
      showMessage(
        "Lütfen geçerli bir soru sayısı gir.",
        "warning"
      );
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      showMessage(
        "Oturum bulunamadı. Lütfen tekrar giriş yap.",
        "error"
      );

      setSaving(false);

      window.location.replace("/auth");

      return;
    }

    const newTask = {
      user_id: user.id,
      plan_id: null,
      topic_id: null,
      title: title.trim(),
      description:
        description.trim() || null,
      task_date: taskDate,
      status: "pending",
      duration_minutes: duration
        ? Number(duration)
        : null,
      question_count: questionCount
        ? Number(questionCount)
        : null,
      completed_at: null,
    };

    const { data, error } = await supabase
      .from("tasks")
      .insert(newTask)
      .select()
      .single();

    if (error) {
      console.error(
        "Görev ekleme hatası:",
        error.message,
        error.details,
        error.hint,
        error.code
      );

      showMessage(
        `Görev eklenemedi: ${
          error.message || "Bilinmeyen hata"
        }`,
        "error"
      );

      setSaving(false);
      return;
    }

    if (data) {
      setTasks((current) =>
        [...current, data as Task].sort(
          (a, b) => {
            if (
              a.task_date === b.task_date
            ) {
              return a.id - b.id;
            }

            return a.task_date.localeCompare(
              b.task_date
            );
          }
        )
      );
    } else {
      await loadTasks();
    }

    setTitle("");
    setDescription("");
    setDuration("");
    setQuestionCount("");

    setSaving(false);

    showMessage(
      "Görev başarıyla oluşturuldu.",
      "success"
    );
  }

  async function toggleTask(task: Task) {
    setMessage("");

    const isCompleted =
      task.status === "completed";

    const newStatus = isCompleted
      ? "pending"
      : "completed";

    const newCompletedAt = isCompleted
      ? null
      : new Date().toISOString();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      showMessage(
        "Oturum bulunamadı. Lütfen tekrar giriş yap.",
        "error"
      );

      window.location.replace("/auth");

      return;
    }

    if (task.user_id !== user.id) {
      showMessage(
        "Bu görev üzerinde işlem yapma yetkin yok.",
        "error"
      );

      return;
    }

    const { error } = await supabase
      .from("tasks")
      .update({
        status: newStatus,
        completed_at: newCompletedAt,
      })
      .eq("id", task.id)
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "Görev güncelleme hatası:",
        error.message,
        error.details,
        error.hint,
        error.code
      );

      showMessage(
        `Görev güncellenemedi: ${
          error.message || "Bilinmeyen hata"
        }`,
        "error"
      );

      return;
    }

    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? {
              ...item,
              status: newStatus,
              completed_at:
                newCompletedAt,
            }
          : item
      )
    );

    showMessage(
      newStatus === "completed"
        ? "Görev tamamlandı. Harika iş! 🎯"
        : "Görev tekrar bekleyen duruma alındı.",
      "success"
    );
  }

  function requestDeleteTask(id: number) {
    setMessage("");
    setDeletingTaskId(id);
  }

  function cancelDelete() {
    if (deleteLoading) {
      return;
    }

    setDeletingTaskId(null);
  }

  async function confirmDeleteTask() {
    if (deletingTaskId === null) {
      return;
    }

    setDeleteLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setDeleteLoading(false);
      setDeletingTaskId(null);

      showMessage(
        "Oturum bulunamadı. Lütfen tekrar giriş yap.",
        "error"
      );

      window.location.replace("/auth");

      return;
    }

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", deletingTaskId)
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "Görev silme hatası:",
        error.message,
        error.details,
        error.hint,
        error.code
      );

      setDeleteLoading(false);
      setDeletingTaskId(null);

      showMessage(
        `Görev silinemedi: ${
          error.message || "Bilinmeyen hata"
        }`,
        "error"
      );

      return;
    }

    setTasks((current) =>
      current.filter(
        (task) =>
          task.id !== deletingTaskId
      )
    );

    setDeleteLoading(false);
    setDeletingTaskId(null);

    showMessage(
      "Görev başarıyla silindi.",
      "success"
    );
  }

  const today = getLocalDate();

  const todayTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        task.task_date === today
    );
  }, [tasks, today]);

  const completedCount = tasks.filter(
    (task) =>
      task.status === "completed"
  ).length;

  const pendingCount =
    tasks.length - completedCount;

  const todayCompletedCount =
    todayTasks.filter(
      (task) =>
        task.status === "completed"
    ).length;

  const todayProgress =
    todayTasks.length > 0
      ? Math.round(
          (todayCompletedCount /
            todayTasks.length) *
            100
        )
      : 0;

  const totalMinutes = tasks.reduce(
    (total, task) =>
      total +
      (task.duration_minutes || 0),
    0
  );

  const totalQuestions = tasks.reduce(
    (total, task) =>
      total +
      (task.question_count || 0),
    0
  );

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (filter === "today") {
      result = result.filter(
        (task) =>
          task.task_date === today
      );
    }

    if (filter === "pending") {
      result = result.filter(
        (task) =>
          task.status !== "completed"
      );
    }

    if (filter === "completed") {
      result = result.filter(
        (task) =>
          task.status === "completed"
      );
    }

    return result;
  }, [tasks, filter, today]);

  function formatDate(date: string) {
    const [year, month, day] =
      date.split("-");

    return `${day}.${month}.${year}`;
  }

  const deletingTask =
    deletingTaskId !== null
      ? tasks.find(
          (task) =>
            task.id === deletingTaskId
        )
      : null;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">

        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">

          <Header />

          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

            {/* PAGE HEADER */}

            <div className="mb-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

                <div>

                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-600">
                    📋 GÖREV YÖNETİMİ
                  </div>

                  <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                    Görevlerim
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                    Günlük çalışma görevlerini
                    oluştur, tamamla ve YKS
                    hazırlığını düzenli takip et.
                  </p>

                </div>

              </div>
            </div>

            {/* MESSAGE */}

            {message && (
              <div
                className={`mb-6 flex items-start gap-3 rounded-2xl border p-4 shadow-sm ${
                  messageType === "success"
                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                    : messageType === "warning"
                    ? "border-amber-100 bg-amber-50 text-amber-700"
                    : "border-red-100 bg-red-50 text-red-700"
                }`}
              >

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/70 text-sm font-black">
                  {messageType === "success"
                    ? "✓"
                    : messageType === "warning"
                    ? "!"
                    : "×"}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold">
                    {message}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMessage("")
                  }
                  className="rounded-lg px-2 py-1 text-lg font-bold opacity-60 transition hover:bg-white/60 hover:opacity-100"
                  aria-label="Mesajı kapat"
                >
                  ×
                </button>

              </div>
            )}

            {/* STATISTICS */}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-2xl bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                    🎯
                  </div>

                  <span className="text-xs font-bold text-slate-400">
                    Bugün
                  </span>

                </div>

                <p className="mt-4 text-sm font-semibold text-slate-500">
                  Günlük İlerleme
                </p>

                <p className="mt-1 text-3xl font-black text-slate-900">
                  %{todayProgress}
                </p>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{
                      width: `${todayProgress}%`,
                    }}
                  />

                </div>

              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                  ✓
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-500">
                  Tamamlanan
                </p>

                <p className="mt-1 text-3xl font-black text-emerald-600">
                  {completedCount}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  toplam görev
                </p>

              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-xl">
                  ⏱
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-500">
                  Planlanan Süre
                </p>

                <p className="mt-1 text-3xl font-black text-amber-500">
                  {totalMinutes}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  dakika
                </p>

              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-xl">
                  📝
                </div>

                <p className="mt-4 text-sm font-semibold text-slate-500">
                  Soru Hedefi
                </p>

                <p className="mt-1 text-3xl font-black text-purple-600">
                  {totalQuestions}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  planlanan soru
                </p>

              </div>

            </div>

            {/* ADD TASK */}

            <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6">

              <div>

                <p className="text-xs font-black uppercase tracking-wider text-indigo-500">
                  Yeni çalışma
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900">
                  Yeni Görev Oluştur
                </h2>

              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Görev adı
                  </label>

                  <input
                    value={title}
                    onChange={(e) =>
                      setTitle(
                        e.target.value
                      )
                    }
                    placeholder="Örn: TYT Matematik - Problemler"
                    maxLength={200}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />

                </div>

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Açıklama
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(
                        e.target.value
                      )
                    }
                    placeholder="Bugün ne yapacağını kısaca yaz..."
                    rows={3}
                    maxLength={1000}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Tarih
                  </label>

                  <input
                    type="date"
                    value={taskDate}
                    onChange={(e) =>
                      setTaskDate(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Süre
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={duration}
                    onChange={(e) =>
                      setDuration(
                        e.target.value
                      )
                    }
                    placeholder="Dakika"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Soru sayısı
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={questionCount}
                    onChange={(e) =>
                      setQuestionCount(
                        e.target.value
                      )
                    }
                    placeholder="Örn: 40"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />

                </div>

              </div>

              <div className="mt-5 flex justify-end">

                <button
                  type="button"
                  onClick={addTask}
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Ekleniyor..."
                    : "+ Görev Ekle"}
                </button>

              </div>

            </section>

            {/* TASK LIST */}

            <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="text-xl font-black text-slate-900">
                    Görev Listesi
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {todayCompletedCount} /{" "}
                    {todayTasks.length}{" "}
                    bugünkü görev tamamlandı
                  </p>

                </div>

                <button
                  type="button"
                  onClick={loadTasks}
                  className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  ↻ Yenile
                </button>

              </div>

              {/* FILTERS */}

              <div className="mt-5 flex gap-2 overflow-x-auto pb-1">

                <button
                  type="button"
                  onClick={() =>
                    setFilter("today")
                  }
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    filter === "today"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Bugün
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFilter("all")
                  }
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    filter === "all"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Tümü ({tasks.length})
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFilter("pending")
                  }
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    filter === "pending"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Bekleyen ({pendingCount})
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFilter("completed")
                  }
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    filter === "completed"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Tamamlanan ({completedCount})
                </button>

              </div>

              {/* LIST */}

              {loading ? (

                <div className="py-16 text-center">

                  <div className="text-4xl">
                    📋
                  </div>

                  <p className="mt-3 text-sm font-semibold text-slate-500">
                    Görevler yükleniyor...
                  </p>

                </div>

              ) : filteredTasks.length ===
                0 ? (

                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-12 text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                    🎯
                  </div>

                  <h3 className="mt-5 text-lg font-black text-slate-900">
                    Burada görev yok
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Bu filtreye uygun görev
                    bulunmuyor. Yukarıdaki formdan
                    yeni bir çalışma görevi
                    oluşturabilirsin.
                  </p>

                </div>

              ) : (

                <div className="mt-6 space-y-3">

                  {filteredTasks.map(
                    (task) => {

                      const completed =
                        task.status ===
                        "completed";

                      return (
                        <div
                          key={task.id}
                          className={`group rounded-2xl border p-4 transition sm:p-5 ${
                            completed
                              ? "border-emerald-100 bg-emerald-50/30"
                              : "border-slate-100 bg-white hover:border-indigo-100 hover:shadow-sm"
                          }`}
                        >

                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                            {/* CHECK */}

                            <button
                              type="button"
                              onClick={() =>
                                toggleTask(task)
                              }
                              disabled={
                                deleteLoading
                              }
                              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-black transition ${
                                completed
                                  ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                                  : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                              } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              {completed
                                ? "✓"
                                : "○"}
                            </button>

                            {/* CONTENT */}

                            <div className="min-w-0 flex-1">

                              <div className="flex flex-wrap items-center gap-2">

                                <h3
                                  className={`font-black ${
                                    completed
                                      ? "text-slate-400 line-through"
                                      : "text-slate-900"
                                  }`}
                                >
                                  {task.title}
                                </h3>

                                <span
                                  className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
                                    completed
                                      ? "bg-emerald-100 text-emerald-600"
                                      : "bg-amber-100 text-amber-600"
                                  }`}
                                >
                                  {completed
                                    ? "Tamamlandı"
                                    : "Bekliyor"}
                                </span>

                              </div>

                              {task.description && (
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                  {
                                    task.description
                                  }
                                </p>
                              )}

                              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-400">

                                <span>
                                  📅{" "}
                                  {formatDate(
                                    task.task_date
                                  )}
                                </span>

                                {task.duration_minutes !==
                                  null && (
                                  <span>
                                    ⏱{" "}
                                    {
                                      task.duration_minutes
                                    }{" "}
                                    dk
                                  </span>
                                )}

                                {task.question_count !==
                                  null && (
                                  <span>
                                    📝{" "}
                                    {
                                      task.question_count
                                    }{" "}
                                    soru
                                  </span>
                                )}

                              </div>

                            </div>

                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={() =>
                                requestDeleteTask(
                                  task.id
                                )
                              }
                              disabled={
                                deleteLoading
                              }
                              className="rounded-xl px-3 py-2 text-sm font-bold text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Sil
                            </button>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </section>

            {/* FOOTER INFO */}

            <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">

              <div className="flex gap-4">

                <div className="text-2xl">
                  💡
                </div>

                <div>

                  <h3 className="font-black text-indigo-900">
                    Küçük görevler, büyük ilerleme
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-indigo-700">
                    Gün içinde yapacağın çalışmaları
                    küçük görevlere böl. Her
                    tamamladığın görev, YKS
                    hedeflerine biraz daha
                    yaklaşman demek.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* DELETE CONFIRMATION MODAL */}

      {deletingTaskId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              cancelDelete();
            }
          }}
        >

          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl">
              🗑️
            </div>

            <h2 className="mt-5 text-xl font-black text-slate-900">
              Görevi silmek istiyor musun?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {deletingTask
                ? `"${deletingTask.title}" görevini silmek üzeresin. Bu işlem geri alınamaz.`
                : "Bu görevi silmek üzeresin. Bu işlem geri alınamaz."}
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={cancelDelete}
                disabled={deleteLoading}
                className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={confirmDeleteTask}
                disabled={deleteLoading}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteLoading
                  ? "Siliniyor..."
                  : "Evet, Görevi Sil"}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}