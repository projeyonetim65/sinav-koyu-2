"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

type Resource = {
  id: number;
  user_id: string;
  name: string;
  publisher: string | null;
  subject_id: number | null;
  resource_type: string;
  total_questions: number;
  solved_questions: number;
  status: "not_started" | "in_progress" | "completed";
  created_at: string;
};

type Subject = {
  id: number;
  name: string;
};

type NoticeType = "success" | "error";

type Notice = {
  type: NoticeType;
  message: string;
} | null;

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [notice, setNotice] = useState<Notice>(null);

  const [name, setName] = useState("");
  const [publisher, setPublisher] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [resourceType, setResourceType] = useState("test");
  const [totalQuestions, setTotalQuestions] = useState("");
  const [solvedQuestions, setSolvedQuestions] = useState("");

  const [editingResource, setEditingResource] =
    useState<Resource | null>(null);

  const [editSolvedQuestions, setEditSolvedQuestions] =
    useState("");

  const [deletingResource, setDeletingResource] =
    useState<Resource | null>(null);

  function showNotice(type: NoticeType, message: string) {
    setNotice({
      type,
      message,
    });

    window.setTimeout(() => {
      setNotice(null);
    }, 3500);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.replace("/auth");
      return;
    }

    const [
      { data: resourceData, error: resourceError },
      { data: subjectData, error: subjectError },
    ] = await Promise.all([
      supabase
        .from("resources")
        .select(
          "id, user_id, name, publisher, subject_id, resource_type, total_questions, solved_questions, status, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("subjects")
        .select("id, name")
        .order("id", {
          ascending: true,
        }),
    ]);

    if (resourceError) {
      console.error(
        "Kaynak yükleme hatası:",
        resourceError.message,
        resourceError.details,
        resourceError.code
      );

      showNotice(
        "error",
        "Kaynaklar yüklenemedi. Lütfen tekrar dene."
      );
    }

    if (subjectError) {
      console.error(
        "Ders yükleme hatası:",
        subjectError.message,
        subjectError.details,
        subjectError.code
      );

      showNotice(
        "error",
        "Dersler yüklenemedi."
      );
    }

    setResources(
      (resourceData || []) as Resource[]
    );

    setSubjects(
      (subjectData || []) as Subject[]
    );

    setLoading(false);
  }

  function getSubjectName(subjectId: number | null) {
    if (!subjectId) {
      return "Ders seçilmemiş";
    }

    const subject = subjects.find(
      (item) => item.id === subjectId
    );

    return subject?.name || "Bilinmeyen ders";
  }

  function getResourceTypeLabel(type: string) {
    if (type === "test") return "Test";
    if (type === "book") return "Kitap";
    if (type === "question_bank") return "Soru Bankası";
    if (type === "deneme") return "Deneme";
    if (type === "video") return "Video";

    return type;
  }

  function calculateStatus(
    solved: number,
    total: number
  ): Resource["status"] {
    if (total <= 0 || solved <= 0) {
      return "not_started";
    }

    if (solved >= total) {
      return "completed";
    }

    return "in_progress";
  }

  async function addResource(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setNotice(null);

    if (!name.trim()) {
      showNotice(
        "error",
        "Lütfen kaynak adını gir."
      );
      return;
    }

    const total = Number(totalQuestions);

    if (
      !Number.isInteger(total) ||
      total < 1
    ) {
      showNotice(
        "error",
        "Toplam soru sayısı en az 1 olmalıdır."
      );
      return;
    }

    const solved = solvedQuestions
      ? Number(solvedQuestions)
      : 0;

    if (
      !Number.isInteger(solved) ||
      solved < 0 ||
      solved > total
    ) {
      showNotice(
        "error",
        "Çözülen soru sayısı 0 ile toplam soru sayısı arasında olmalıdır."
      );
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      window.location.replace("/auth");
      return;
    }

    const status = calculateStatus(
      solved,
      total
    );

    const { data, error } = await supabase
      .from("resources")
      .insert({
        user_id: user.id,
        name: name.trim(),
        publisher:
          publisher.trim() || null,
        subject_id: subjectId
          ? Number(subjectId)
          : null,
        resource_type: resourceType,
        total_questions: total,
        solved_questions: solved,
        status,
      })
      .select()
      .single();

    if (error) {
      console.error(
        "Kaynak ekleme hatası:",
        error.message,
        error.details,
        error.code
      );

      showNotice(
        "error",
        `Kaynak eklenemedi: ${error.message}`
      );

      setSaving(false);
      return;
    }

    if (data) {
      setResources((current) => [
        data as Resource,
        ...current,
      ]);
    }

    setName("");
    setPublisher("");
    setSubjectId("");
    setResourceType("test");
    setTotalQuestions("");
    setSolvedQuestions("");

    setSaving(false);

    showNotice(
      "success",
      "Kaynak başarıyla eklendi."
    );
  }

  function openUpdateModal(resource: Resource) {
    setEditingResource(resource);

    setEditSolvedQuestions(
      String(resource.solved_questions || 0)
    );

    setNotice(null);
  }

  function closeUpdateModal() {
    if (updating) {
      return;
    }

    setEditingResource(null);
    setEditSolvedQuestions("");
  }

  async function saveSolvedQuestions() {
    if (!editingResource) {
      return;
    }

    const solved = Number(
      editSolvedQuestions
    );

    const total = Number(
      editingResource.total_questions
    );

    if (
      !Number.isInteger(solved) ||
      solved < 0 ||
      solved > total
    ) {
      showNotice(
        "error",
        "Geçerli bir çözülen soru sayısı gir."
      );
      return;
    }

    setUpdating(true);

    const status = calculateStatus(
      solved,
      total
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUpdating(false);
      window.location.replace("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("resources")
      .update({
        solved_questions: solved,
        status,
      })
      .eq("id", editingResource.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error(
        "Kaynak güncelleme hatası:",
        error.message,
        error.details,
        error.code
      );

      showNotice(
        "error",
        `Kaynak güncellenemedi: ${error.message}`
      );

      setUpdating(false);
      return;
    }

    if (data) {
      setResources((current) =>
        current.map((resource) =>
          resource.id === editingResource.id
            ? (data as Resource)
            : resource
        )
      );
    }

    setUpdating(false);

    setEditingResource(null);
    setEditSolvedQuestions("");

    showNotice(
      "success",
      "Kaynak ilerlemesi güncellendi."
    );
  }

  function openDeleteModal(resource: Resource) {
    setDeletingResource(resource);
    setNotice(null);
  }

  function closeDeleteModal() {
    if (deleting) {
      return;
    }

    setDeletingResource(null);
  }

  async function confirmDeleteResource() {
    if (!deletingResource) {
      return;
    }

    setDeleting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setDeleting(false);
      window.location.replace("/auth");
      return;
    }

    const { error } = await supabase
      .from("resources")
      .delete()
      .eq("id", deletingResource.id)
      .eq("user_id", user.id);

    if (error) {
      console.error(
        "Kaynak silme hatası:",
        error.message,
        error.details,
        error.code
      );

      showNotice(
        "error",
        `Kaynak silinemedi: ${error.message}`
      );

      setDeleting(false);
      return;
    }

    setResources((current) =>
      current.filter(
        (resource) =>
          resource.id !== deletingResource.id
      )
    );

    const deletedName =
      deletingResource.name;

    setDeleting(false);
    setDeletingResource(null);

    showNotice(
      "success",
      `"${deletedName}" kaynağı silindi.`
    );
  }

  const completedResources =
    useMemo(
      () =>
        resources.filter(
          (resource) =>
            resource.status === "completed"
        ).length,
      [resources]
    );

  const inProgressResources =
    useMemo(
      () =>
        resources.filter(
          (resource) =>
            resource.status === "in_progress"
        ).length,
      [resources]
    );

  const totalQuestionCount =
    useMemo(
      () =>
        resources.reduce(
          (total, resource) =>
            total +
            Number(
              resource.total_questions || 0
            ),
          0
        ),
      [resources]
    );

  const solvedQuestionCount =
    useMemo(
      () =>
        resources.reduce(
          (total, resource) =>
            total +
            Number(
              resource.solved_questions || 0
            ),
          0
        ),
      [resources]
    );

  const overallProgress =
    totalQuestionCount > 0
      ? Math.min(
          100,
          Math.round(
            (solvedQuestionCount /
              totalQuestionCount) *
              100
          )
        )
      : 0;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Kaynaklar yükleniyor...
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

            {/* NOTICE */}

            {notice && (
              <div
                className={`fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-md rounded-2xl border p-4 shadow-xl ${
                  notice.type === "success"
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-start gap-3">

                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
                      notice.type === "success"
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {notice.type === "success"
                      ? "✓"
                      : "!"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-bold ${
                        notice.type === "success"
                          ? "text-emerald-800"
                          : "text-red-800"
                      }`}
                    >
                      {notice.message}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setNotice(null)
                    }
                    className="rounded-lg px-2 py-1 text-sm font-bold text-slate-400 transition hover:bg-white hover:text-slate-600"
                  >
                    ×
                  </button>

                </div>
              </div>
            )}

            {/* PAGE HEADER */}

            <div className="mb-8">

              <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
                Çalışma Sistemi
              </p>

              <h1 className="mt-1 text-3xl font-black text-slate-900">
                Kaynaklarım 📚
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Kullandığın kitap, soru bankası,
                deneme ve diğer kaynakları takip et.
              </p>

            </div>

            {/* STATISTICS */}

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-500">
                    Toplam Kaynak
                  </p>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                    📚
                  </div>
                </div>

                <p className="mt-3 text-3xl font-black text-slate-900">
                  {resources.length}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-500">
                    Tamamlanan
                  </p>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    ✓
                  </div>
                </div>

                <p className="mt-3 text-3xl font-black text-emerald-600">
                  {completedResources}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-500">
                    Çalışılan
                  </p>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                    🔥
                  </div>
                </div>

                <p className="mt-3 text-3xl font-black text-amber-500">
                  {inProgressResources}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-500">
                    Genel İlerleme
                  </p>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    %
                  </div>
                </div>

                <p className="mt-3 text-3xl font-black text-indigo-600">
                  %{overallProgress}
                </p>
              </div>

            </section>

            {/* ADD RESOURCE */}

            <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6">

              <div>
                <p className="text-xs font-black uppercase tracking-wider text-indigo-500">
                  Kütüphanen
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900">
                  Yeni Kaynak Ekle
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Çalıştığın kaynağı sisteme ekle.
                </p>
              </div>

              <form
                onSubmit={addResource}
                className="mt-6 grid gap-4 md:grid-cols-2"
              >

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Kaynak adı
                  </label>

                  <input
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Örn: 345 TYT Matematik"
                    maxLength={200}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Yayıncı
                  </label>

                  <input
                    value={publisher}
                    onChange={(e) =>
                      setPublisher(
                        e.target.value
                      )
                    }
                    placeholder="Örn: 345 Yayınları"
                    maxLength={200}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Ders
                  </label>

                  <select
                    value={subjectId}
                    onChange={(e) =>
                      setSubjectId(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  >
                    <option value="">
                      Ders seç
                    </option>

                    {subjects.map(
                      (subject) => (
                        <option
                          key={subject.id}
                          value={subject.id}
                        >
                          {subject.name}
                        </option>
                      )
                    )}
                  </select>

                </div>

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Kaynak türü
                  </label>

                  <select
                    value={resourceType}
                    onChange={(e) =>
                      setResourceType(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  >
                    <option value="test">
                      Test
                    </option>

                    <option value="book">
                      Kitap
                    </option>

                    <option value="question_bank">
                      Soru Bankası
                    </option>

                    <option value="deneme">
                      Deneme
                    </option>

                    <option value="video">
                      Video
                    </option>
                  </select>

                </div>

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Toplam soru
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={totalQuestions}
                    onChange={(e) =>
                      setTotalQuestions(
                        e.target.value
                      )
                    }
                    placeholder="Örn: 1200"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Çözülen soru
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={solvedQuestions}
                    onChange={(e) =>
                      setSolvedQuestions(
                        e.target.value
                      )
                    }
                    placeholder="Örn: 150"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />

                </div>

                <div className="md:col-span-2 flex justify-end">

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Ekleniyor..."
                      : "+ Kaynak Ekle"}
                  </button>

                </div>

              </form>

            </section>

            {/* RESOURCE LIST */}

            <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <h2 className="text-xl font-black text-slate-900">
                    Kaynak Listem
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {solvedQuestionCount.toLocaleString(
                      "tr-TR"
                    )}{" "}
                    /{" "}
                    {totalQuestionCount.toLocaleString(
                      "tr-TR"
                    )}{" "}
                    soru çözüldü.
                  </p>

                </div>

                <button
                  onClick={loadData}
                  disabled={loading}
                  className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ↻ Yenile
                </button>

              </div>

              {resources.length === 0 ? (

                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-12 text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                    📚
                  </div>

                  <h3 className="mt-5 text-lg font-black text-slate-900">
                    Henüz kaynak yok
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Yukarıdaki formu kullanarak
                    ilk kaynağını ekle.
                  </p>

                </div>

              ) : (

                <div className="mt-6 space-y-4">

                  {resources.map(
                    (resource) => {

                      const total =
                        Number(
                          resource.total_questions
                        ) || 0;

                      const solved =
                        Number(
                          resource.solved_questions
                        ) || 0;

                      const progress =
                        total > 0
                          ? Math.min(
                              100,
                              Math.round(
                                (solved /
                                  total) *
                                  100
                              )
                            )
                          : 0;

                      return (
                        <div
                          key={resource.id}
                          className="rounded-2xl border border-slate-100 bg-white p-5 transition hover:border-indigo-100 hover:shadow-sm"
                        >

                          <div className="flex flex-col gap-5 lg:flex-row lg:items-center">

                            <div className="flex min-w-0 flex-1 items-start gap-4">

                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                                📚
                              </div>

                              <div className="min-w-0 flex-1">

                                <div className="flex flex-wrap items-center gap-2">

                                  <h3 className="font-black text-slate-900">
                                    {resource.name}
                                  </h3>

                                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                                    {getResourceTypeLabel(
                                      resource.resource_type
                                    )}
                                  </span>

                                </div>

                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-slate-400">

                                  {resource.publisher && (
                                    <span>
                                      🏢{" "}
                                      {
                                        resource.publisher
                                      }
                                    </span>
                                  )}

                                  <span>
                                    📚{" "}
                                    {getSubjectName(
                                      resource.subject_id
                                    )}
                                  </span>

                                  <span>
                                    📝{" "}
                                    {solved.toLocaleString(
                                      "tr-TR"
                                    )}{" "}
                                    /{" "}
                                    {total.toLocaleString(
                                      "tr-TR"
                                    )}{" "}
                                    soru
                                  </span>

                                </div>

                              </div>

                            </div>

                            <div className="flex flex-wrap items-center gap-2">

                              <span
                                className={
                                  resource.status ===
                                  "completed"
                                    ? "rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-black text-emerald-600"
                                    : resource.status ===
                                      "in_progress"
                                    ? "rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-600"
                                    : "rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600"
                                }
                              >
                                {resource.status ===
                                "completed"
                                  ? "Tamamlandı"
                                  : resource.status ===
                                    "in_progress"
                                  ? "Çalışıyorum"
                                  : "Başlanmadı"}
                              </span>

                              <button
                                onClick={() =>
                                  openUpdateModal(
                                    resource
                                  )
                                }
                                className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-600 transition hover:bg-indigo-100"
                              >
                                Güncelle
                              </button>

                              <button
                                onClick={() =>
                                  openDeleteModal(
                                    resource
                                  )
                                }
                                className="rounded-xl bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-100"
                              >
                                Sil
                              </button>

                            </div>

                          </div>

                          <div className="mt-5">

                            <div className="mb-2 flex items-center justify-between">

                              <span className="text-xs font-bold text-slate-400">
                                İlerleme
                              </span>

                              <span className="text-xs font-black text-slate-600">
                                %{progress}
                              </span>

                            </div>

                            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">

                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  progress >= 100
                                    ? "bg-emerald-500"
                                    : "bg-indigo-600"
                                }`}
                                style={{
                                  width: `${progress}%`,
                                }}
                              />

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </section>

            {/* INFO */}

            <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">

              <div className="flex gap-4">

                <div className="text-2xl">
                  💡
                </div>

                <div>

                  <h3 className="font-black text-indigo-900">
                    Kaynaklarını takip et
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-indigo-700">
                    Hangi kaynaktan kaç soru
                    çözdüğünü takip ederek çalışma
                    ilerlemeni daha net görebilirsin.
                  </p>

                </div>

              </div>

            </div>

          </div>
        </div>
      </div>

      {/* UPDATE MODAL */}

      {editingResource && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="update-resource-title"
          >

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-xs font-black uppercase tracking-wider text-indigo-500">
                  Kaynak ilerlemesi
                </p>

                <h2
                  id="update-resource-title"
                  className="mt-1 text-xl font-black text-slate-900"
                >
                  Soruları Güncelle
                </h2>

              </div>

              <button
                type="button"
                onClick={closeUpdateModal}
                disabled={updating}
                className="rounded-xl px-3 py-2 text-xl font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              >
                ×
              </button>

            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 p-4">

              <p className="text-sm font-black text-slate-900">
                {editingResource.name}
              </p>

              <p className="mt-1 text-xs font-semibold text-slate-400">
                Toplam soru:{" "}
                {Number(
                  editingResource.total_questions
                ).toLocaleString("tr-TR")}
              </p>

            </div>

            <div className="mt-5">

              <label className="mb-2 block text-sm font-bold text-slate-700">
                Çözülen soru
              </label>

              <input
                type="number"
                min="0"
                max={editingResource.total_questions}
                value={editSolvedQuestions}
                onChange={(e) =>
                  setEditSolvedQuestions(
                    e.target.value
                  )
                }
                autoFocus
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
              />

              <p className="mt-2 text-xs font-semibold text-slate-400">
                0 -{" "}
                {Number(
                  editingResource.total_questions
                ).toLocaleString("tr-TR")}{" "}
                arasında bir değer gir.
              </p>

            </div>

            <div className="mt-6 flex gap-3">

              <button
                type="button"
                onClick={closeUpdateModal}
                disabled={updating}
                className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={saveSolvedQuestions}
                disabled={updating}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updating
                  ? "Kaydediliyor..."
                  : "Kaydet"}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* DELETE MODAL */}

      {deletingResource && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-resource-title"
          >

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-600">
              🗑️
            </div>

            <h2
              id="delete-resource-title"
              className="mt-5 text-xl font-black text-slate-900"
            >
              Kaynağı Sil
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              <span className="font-bold text-slate-700">
                {deletingResource.name}
              </span>{" "}
              adlı kaynağı silmek istediğine emin misin?
              Bu işlem geri alınamaz.
            </p>

            <div className="mt-6 flex gap-3">

              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={confirmDeleteResource}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting
                  ? "Siliniyor..."
                  : "Evet, Sil"}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}