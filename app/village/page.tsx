"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

type Profile = {
  full_name: string | null;
  exam_year: number | null;
  field: string | null;
  target_university: string | null;
  target_department: string | null;
  target_rank: number | null;
};

type Task = {
  id: number;
  title: string;
  task_date: string;
  status: string;
  duration_minutes: number | null;
  question_count: number | null;
};

type Goal = {
  id: number;
  title: string;
  target_rank: number | null;
  target_net: number | null;
  exam_type: string;
};

type Exam = {
  id: number;
  exam_name: string;
  exam_date: string;
  total_net: number;
};

type UserTopic = {
  topic_id: number;
  status: "not_started" | "in_progress" | "completed";
};

type Resource = {
  id: number;
  name: string;
  publisher: string | null;
  subject_id: number | null;
  resource_type: string | null;
  total_questions: number | null;
  solved_questions: number | null;
  status: "not_started" | "in_progress" | "completed";
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [topicProgress, setTopicProgress] = useState<UserTopic[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);

    try {
      /*
       * ---------------------------------------------------------
       * 1. OTURUMU KONTROL ET
       * ---------------------------------------------------------
       */

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error(
          "Oturum kontrol hatası:",
          sessionError.message,
          sessionError
        );

        window.location.replace("/auth");
        return;
      }

      if (!session?.user) {
        window.location.replace("/auth");
        return;
      }

      /*
       * ---------------------------------------------------------
       * 2. SESSION'I YENİLE
       * ---------------------------------------------------------
       */

      const {
        data: refreshedSessionData,
        error: refreshError,
      } = await supabase.auth.refreshSession();

      if (refreshError) {
        console.error(
          "Oturum yenileme hatası:",
          refreshError.message,
          refreshError
        );

        await supabase.auth.signOut();

        window.location.replace("/auth");
        return;
      }

      const currentUser =
        refreshedSessionData.session?.user || session.user;

      if (!currentUser) {
        window.location.replace("/auth");
        return;
      }

      /*
       * ---------------------------------------------------------
       * 3. BUGÜNÜ AL
       * ---------------------------------------------------------
       */

      const today = new Date()
        .toISOString()
        .split("T")[0];

      /*
       * ---------------------------------------------------------
       * 4. DASHBOARD VERİLERİNİ ÇEK
       * ---------------------------------------------------------
       */

      const [
        { data: profileData, error: profileError },
        { data: taskData, error: taskError },
        { data: goalData, error: goalError },
        { data: examData, error: examError },
        { data: topicData, error: topicError },
        { data: resourceData, error: resourceError },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            "full_name, exam_year, field, target_university, target_department, target_rank"
          )
          .eq("id", currentUser.id)
          .maybeSingle(),

        supabase
          .from("tasks")
          .select(
            "id, title, task_date, status, duration_minutes, question_count"
          )
          .eq("user_id", currentUser.id)
          .eq("task_date", today)
          .order("id", { ascending: true }),

        supabase
          .from("goals")
          .select(
            "id, title, target_rank, target_net, exam_type"
          )
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(3),

        supabase
          .from("exams_results")
          .select(
            "id, exam_name, exam_date, total_net"
          )
          .eq("user_id", currentUser.id)
          .order("exam_date", { ascending: false })
          .limit(5),

        supabase
          .from("user_topics")
          .select("topic_id, status")
          .eq("user_id", currentUser.id),

        supabase
          .from("resources")
          .select(
            "id, name, publisher, subject_id, resource_type, total_questions, solved_questions, status"
          )
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      /*
       * ---------------------------------------------------------
       * 5. HATALARI KONTROL ET
       * ---------------------------------------------------------
       */

      if (profileError) {
        console.error(
          "Profil yükleme hatası:",
          profileError.message,
          profileError.details,
          profileError.hint,
          profileError.code
        );
      }

      if (taskError) {
        console.error(
          "Görev yükleme hatası:",
          taskError.message,
          taskError.details,
          taskError.hint,
          taskError.code
        );
      }

      if (goalError) {
        console.error(
          "========== HEDEF HATASI =========="
        );

        console.error(
          "message:",
          goalError.message
        );

        console.error(
          "details:",
          goalError.details
        );

        console.error(
          "hint:",
          goalError.hint
        );

        console.error(
          "code:",
          goalError.code
        );

        console.error(
          "full error:",
          goalError
        );

        console.error(
          "=================================="
        );
      }

      if (examError) {
        console.error(
          "Deneme yükleme hatası:",
          examError.message,
          examError.details,
          examError.hint,
          examError.code
        );
      }

      if (topicError) {
        console.error(
          "Konu ilerleme yükleme hatası:",
          topicError.message,
          topicError.details,
          topicError.hint,
          topicError.code
        );
      }

      if (resourceError) {
        console.error(
          "Kaynak yükleme hatası:",
          resourceError.message,
          resourceError.details,
          resourceError.hint,
          resourceError.code
        );
      }

      /*
       * ---------------------------------------------------------
       * 6. STATE'LERİ DOLDUR
       * ---------------------------------------------------------
       */

      setProfile(profileData || null);
      setTasks(taskData || []);
      setGoals(goalData || []);
      setExams(examData || []);
      setTopicProgress(topicData || []);
      setResources(resourceData || []);
    } catch (error) {
      console.error(
        "Dashboard yükleme sırasında beklenmeyen hata:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleTask(task: Task) {
    const completed =
      task.status === "completed";

    const newStatus = completed
      ? "pending"
      : "completed";

    const completedAt = completed
      ? null
      : new Date().toISOString();

    const { error } = await supabase
      .from("tasks")
      .update({
        status: newStatus,
        completed_at: completedAt,
      })
      .eq("id", task.id);

    if (error) {
      console.error(
        "Görev güncelleme hatası:",
        error.message,
        error.details,
        error.hint,
        error.code
      );

      return;
    }

    setTasks((current) =>
      current.map((item) =>
        item.id === task.id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    );
  }

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const taskProgress =
    tasks.length > 0
      ? Math.round(
          (completedTasks / tasks.length) * 100
        )
      : 0;

  const completedTopics =
    topicProgress.filter(
      (topic) => topic.status === "completed"
    ).length;

  const inProgressTopics =
    topicProgress.filter(
      (topic) => topic.status === "in_progress"
    ).length;

  const totalTopics = topicProgress.length;

  const topicPercentage =
    totalTopics > 0
      ? Math.round(
          (completedTopics / totalTopics) * 100
        )
      : 0;

  const latestExam =
    exams.length > 0 ? exams[0] : null;

  const previousExam =
    exams.length > 1 ? exams[1] : null;

  const latestNet = latestExam
    ? Number(latestExam.total_net)
    : 0;

  const previousNet = previousExam
    ? Number(previousExam.total_net)
    : null;

  const netChange =
    previousNet !== null
      ? latestNet - previousNet
      : 0;

  const totalResourceQuestions =
    resources.reduce(
      (total, resource) =>
        total +
        Number(resource.total_questions || 0),
      0
    );

  const solvedResourceQuestions =
    resources.reduce(
      (total, resource) =>
        total +
        Number(resource.solved_questions || 0),
      0
    );

  const resourcePercentage =
    totalResourceQuestions > 0
      ? Math.round(
          (solvedResourceQuestions /
            totalResourceQuestions) *
            100
        )
      : 0;

  const firstName =
    profile?.full_name?.split(" ")[0] ||
    "Öğrenci";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Dashboard yükleniyor...
          </p>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">

      <div className="flex min-h-screen">

        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">

          <Header />

          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

            {/* =====================================================
                WELCOME
            ===================================================== */}

            <section className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white shadow-sm sm:p-8">

              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div>

                  <p className="text-sm font-semibold text-indigo-100">
                    YKS {profile?.exam_year || 2027}
                  </p>

                  <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                    Hoş geldin, {firstName}! 👋
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                    Bugün küçük bir adım daha at.
                    Düzenli çalıştığında hedefin
                    sandığından daha yakın.
                  </p>

                </div>

                {/* ÜST BUTONLAR */}

                <div className="flex flex-col gap-3 sm:flex-row">

                  <a
                    href="https://www.instagram.com/sinav_koyu/?hl=en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-white/10 px-5 py-3 text-center text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    📸 Instagram
                  </a>

                  <button
                    onClick={() =>
                      window.location.replace("/tasks")
                    }
                    className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-600 shadow-sm transition hover:bg-indigo-50"
                  >
                    Bugünkü Görevler →
                  </button>

                </div>

              </div>

            </section>

            {/* =====================================================
                QUICK STATS
            ===================================================== */}

            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

              {/* BUGÜNKÜ GÖREVLER */}

              <div className="rounded-2xl bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <p className="text-sm font-semibold text-slate-500">
                    Bugünkü Görevler
                  </p>

                  <span className="rounded-xl bg-indigo-50 px-3 py-2 text-lg">
                    ✓
                  </span>

                </div>

                <p className="mt-4 text-3xl font-black text-slate-900">
                  {completedTasks}/{tasks.length}
                </p>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{
                      width: `${taskProgress}%`,
                    }}
                  />

                </div>

                <p className="mt-2 text-xs text-slate-400">
                  %{taskProgress} tamamlandı
                </p>

              </div>

              {/* KONU İLERLEMESİ */}

              <div className="rounded-2xl bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <p className="text-sm font-semibold text-slate-500">
                    Konu İlerlemesi
                  </p>

                  <span className="rounded-xl bg-green-50 px-3 py-2 text-lg">
                    📚
                  </span>

                </div>

                <p className="mt-4 text-3xl font-black text-slate-900">
                  %{topicPercentage}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {completedTopics} tamamlandı ·{" "}
                  {inProgressTopics} çalışılıyor
                </p>

              </div>

              {/* SON NET */}

              <div className="rounded-2xl bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <p className="text-sm font-semibold text-slate-500">
                    Son Net
                  </p>

                  <span className="rounded-xl bg-yellow-50 px-3 py-2 text-lg">
                    📈
                  </span>

                </div>

                <p className="mt-4 text-3xl font-black text-slate-900">
                  {latestNet.toFixed(2)}
                </p>

                {previousNet !== null ? (

                  <p
                    className={`mt-2 text-xs font-bold ${
                      netChange >= 0
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {netChange >= 0 ? "+" : ""}
                    {netChange.toFixed(2)} son denemeye göre
                  </p>

                ) : (

                  <p className="mt-2 text-xs text-slate-400">
                    Henüz karşılaştırma yok
                  </p>

                )}

              </div>

              {/* SORU İLERLEMESİ */}

              <div className="rounded-2xl bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between">

                  <p className="text-sm font-semibold text-slate-500">
                    Soru İlerlemesi
                  </p>

                  <span className="rounded-xl bg-purple-50 px-3 py-2 text-lg">
                    📝
                  </span>

                </div>

                <p className="mt-4 text-3xl font-black text-slate-900">
                  %{resourcePercentage}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {solvedResourceQuestions.toLocaleString("tr-TR")}{" "}
                  /{" "}
                  {totalResourceQuestions.toLocaleString("tr-TR")}{" "}
                  soru
                </p>

              </div>

            </section>

            {/* =====================================================
                MAIN GRID
            ===================================================== */}

            <section className="mt-6 grid gap-6 lg:grid-cols-3">

              {/* GÖREVLER */}

              <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-xl font-black text-slate-900">
                      Bugünkü Görevler
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Bugün yapman gerekenler
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      window.location.replace("/tasks")
                    }
                    className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
                  >
                    Tümü
                  </button>

                </div>

                {tasks.length === 0 ? (

                  <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-8 text-center">

                    <div className="text-4xl">
                      🎯
                    </div>

                    <h3 className="mt-3 font-bold text-slate-900">
                      Bugün için görev yok
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Çalışma planını oluştur ve ilk görevini ekle.
                    </p>

                    <button
                      onClick={() =>
                        window.location.replace("/tasks")
                      }
                      className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
                    >
                      Görev Oluştur
                    </button>

                  </div>

                ) : (

                  <div className="mt-5 space-y-3">

                    {tasks.slice(0, 5).map((task) => {

                      const completed =
                        task.status === "completed";

                      return (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 rounded-xl border border-slate-100 p-4"
                        >

                          <button
                            onClick={() =>
                              toggleTask(task)
                            }
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black ${
                              completed
                                ? "bg-green-100 text-green-600"
                                : "bg-indigo-50 text-indigo-600"
                            }`}
                          >
                            {completed ? "✓" : "○"}
                          </button>

                          <div className="min-w-0 flex-1">

                            <p
                              className={`font-bold ${
                                completed
                                  ? "text-slate-400 line-through"
                                  : "text-slate-900"
                              }`}
                            >
                              {task.title}
                            </p>

                            <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-400">

                              {task.duration_minutes !== null && (
                                <span>
                                  ⏱ {task.duration_minutes} dk
                                </span>
                              )}

                              {task.question_count !== null && (
                                <span>
                                  📝 {task.question_count} soru
                                </span>
                              )}

                            </div>

                          </div>

                          <span
                            className={`hidden rounded-full px-3 py-1 text-xs font-bold sm:block ${
                              completed
                                ? "bg-green-100 text-green-600"
                                : "bg-amber-100 text-amber-600"
                            }`}
                          >
                            {completed
                              ? "Tamamlandı"
                              : "Bekliyor"}
                          </span>

                        </div>
                      );
                    })}

                  </div>

                )}

              </div>

              {/* HEDEFLER */}

              <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-xl font-black text-slate-900">
                      Hedeflerim
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Ulaşmak istediğin hedefler
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      window.location.replace("/goals")
                    }
                    className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
                  >
                    +
                  </button>

                </div>

                {goals.length === 0 ? (

                  <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-6 text-center">

                    <div className="text-3xl">
                      🎯
                    </div>

                    <p className="mt-3 text-sm font-bold text-slate-900">
                      Henüz hedef yok
                    </p>

                    <button
                      onClick={() =>
                        window.location.replace("/goals")
                      }
                      className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white"
                    >
                      Hedef Ekle
                    </button>

                  </div>

                ) : (

                  <div className="mt-5 space-y-3">

                    {goals.map((goal) => (

                      <div
                        key={goal.id}
                        className="rounded-xl border border-slate-100 p-4"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <h3 className="font-bold text-slate-900">
                            {goal.title}
                          </h3>

                          <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-600">
                            {goal.exam_type}
                          </span>

                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">

                          <div className="rounded-lg bg-slate-50 p-3">

                            <p className="text-[10px] text-slate-400">
                              Sıralama
                            </p>

                            <p className="mt-1 text-sm font-black">
                              {goal.target_rank !== null
                                ? goal.target_rank.toLocaleString("tr-TR")
                                : "-"}
                            </p>

                          </div>

                          <div className="rounded-lg bg-slate-50 p-3">

                            <p className="text-[10px] text-slate-400">
                              Net
                            </p>

                            <p className="mt-1 text-sm font-black">
                              {goal.target_net !== null
                                ? goal.target_net
                                : "-"}
                            </p>

                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                )}

              </div>

            </section>

            {/* =====================================================
                SECOND ROW
            ===================================================== */}

            <section className="mt-6 grid gap-6 lg:grid-cols-2">

              {/* DENEMELER */}

              <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-xl font-black text-slate-900">
                      Son Denemeler
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Net gelişimini takip et
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      window.location.replace("/exams")
                    }
                    className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
                  >
                    Tümü
                  </button>

                </div>

                {exams.length === 0 ? (

                  <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-8 text-center">

                    <div className="text-3xl">
                      📈
                    </div>

                    <p className="mt-3 text-sm font-bold text-slate-900">
                      Henüz deneme eklenmemiş
                    </p>

                    <button
                      onClick={() =>
                        window.location.replace("/exams")
                      }
                      className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white"
                    >
                      Deneme Ekle
                    </button>

                  </div>

                ) : (

                  <div className="mt-5 space-y-3">

                    {exams.map((exam) => (

                      <div
                        key={exam.id}
                        className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
                      >

                        <div>

                          <p className="font-bold text-slate-900">
                            {exam.exam_name}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {exam.exam_date}
                          </p>

                        </div>

                        <p className="text-xl font-black text-indigo-600">
                          {Number(
                            exam.total_net
                          ).toFixed(2)}
                        </p>

                      </div>

                    ))}

                  </div>

                )}

              </div>

              {/* KAYNAKLAR */}

              <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="text-xl font-black text-slate-900">
                      Kaynaklar
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Çözdüğün soruları takip et
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      window.location.replace("/resources")
                    }
                    className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
                  >
                    Tümü
                  </button>

                </div>

                {resources.length === 0 ? (

                  <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-8 text-center">

                    <div className="text-3xl">
                      📚
                    </div>

                    <p className="mt-3 text-sm font-bold text-slate-900">
                      Henüz kaynak eklenmemiş
                    </p>

                    <button
                      onClick={() =>
                        window.location.replace("/resources")
                      }
                      className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white"
                    >
                      Kaynak Ekle
                    </button>

                  </div>

                ) : (

                  <div className="mt-5 space-y-3">

                    {resources.map((resource) => {

                      const total =
                        Number(
                          resource.total_questions || 0
                        );

                      const solved =
                        Number(
                          resource.solved_questions || 0
                        );

                      const percentage =
                        total > 0
                          ? Math.min(
                              100,
                              Math.round(
                                (solved / total) * 100
                              )
                            )
                          : 0;

                      return (
                        <div
                          key={resource.id}
                          className="rounded-xl border border-slate-100 p-4"
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div className="min-w-0">

                              <p className="truncate font-bold text-slate-900">
                                {resource.name}
                              </p>

                              {resource.publisher && (
                                <p className="mt-1 text-xs text-slate-400">
                                  {resource.publisher}
                                </p>
                              )}

                            </div>

                            <span className="shrink-0 text-sm font-black text-indigo-600">
                              %{percentage}
                            </span>

                          </div>

                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">

                            <div
                              className="h-full rounded-full bg-indigo-600 transition-all"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                          <p className="mt-2 text-xs text-slate-400">
                            {solved.toLocaleString("tr-TR")}{" "}
                            /{" "}
                            {total.toLocaleString("tr-TR")} soru
                          </p>

                        </div>
                      );
                    })}

                  </div>

                )}

              </div>

            </section>

            {/* =====================================================
                TARGET
            ===================================================== */}

            <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6">

              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-sm font-bold text-indigo-600">
                    ANA HEDEF
                  </p>

                  <h2 className="mt-2 text-2xl font-black text-slate-900">
                    {profile?.target_department ||
                      "Hedef bölümünü belirle"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {profile?.target_university ||
                      "Hedef üniversiteni belirle"}
                  </p>

                </div>

                <div className="rounded-2xl bg-indigo-50 px-6 py-4 text-center">

                  <p className="text-xs font-semibold text-indigo-500">
                    Hedef Sıralama
                  </p>

                  <p className="mt-1 text-2xl font-black text-indigo-600">
                    {profile?.target_rank
                      ? profile.target_rank.toLocaleString("tr-TR")
                      : "-"}
                  </p>

                </div>

              </div>

            </section>

            {/* =====================================================
                NAVIGATION
            ===================================================== */}

            <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <button
                onClick={() =>
                  window.location.replace("/topics")
                }
                className="rounded-2xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-2xl">
                  📚
                </span>

                <h3 className="mt-3 font-black">
                  Konular
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Konu ilerlemeni takip et
                </p>

              </button>

              <button
                onClick={() =>
                  window.location.replace("/statistics")
                }
                className="rounded-2xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-2xl">
                  📊
                </span>

                <h3 className="mt-3 font-black">
                  İstatistikler
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Gelişimini analiz et
                </p>

              </button>

              <button
                onClick={() =>
                  window.location.replace("/plans")
                }
                className="rounded-2xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-2xl">
                  🗓️
                </span>

                <h3 className="mt-3 font-black">
                  Planlar
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Çalışma planını yönet
                </p>

              </button>

              <button
                onClick={() =>
                  window.location.replace("/profile")
                }
                className="rounded-2xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="text-2xl">
                  ⚙️
                </span>

                <h3 className="mt-3 font-black">
                  Profil
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Hesap ve hedef bilgileri
                </p>

              </button>

            </section>

          </div>

        </div>

      </div>

    </main>
  );
}