"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Exam = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  user_id: string;
};

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadExams();
  }, []);

  async function loadExams() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.replace("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("exams")
      .select(
        "id, name, description, created_at, user_id"
      )
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Denemeler yüklenemedi:",
        error.message,
        error.details,
        error.code
      );

      setErrorMessage(
        "Denemeler yüklenirken bir hata oluştu."
      );

      setLoading(false);
      return;
    }

    setExams((data as Exam[]) || []);
    setLoading(false);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const cleanName = name.trim();
    const cleanDescription =
      description.trim();

    if (!cleanName) {
      setErrorMessage(
        "Lütfen deneme adını gir."
      );
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.replace("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("exams")
      .insert({
        name: cleanName,
        description:
          cleanDescription || null,
        user_id: user.id,
      })
      .select(
        "id, name, description, created_at, user_id"
      )
      .single();

    if (error) {
      console.error(
        "Deneme oluşturma hatası:",
        error.message,
        error.details,
        error.code
      );

      setErrorMessage(
        "Deneme oluşturulamadı. Lütfen tekrar dene."
      );

      setSaving(false);
      return;
    }

    setExams((current) => [
      data as Exam,
      ...current,
    ]);

    setName("");
    setDescription("");

    setSuccessMessage(
      "Deneme başarıyla oluşturuldu."
    );

    setSaving(false);

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Bu denemeyi silmek istediğine emin misin?"
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setErrorMessage("");

    const { error } = await supabase
      .from("exams")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "Deneme silme hatası:",
        error.message,
        error.details,
        error.code
      );

      setErrorMessage(
        "Deneme silinemedi. Lütfen tekrar dene."
      );

      setDeletingId(null);
      return;
    }

    setExams((current) =>
      current.filter(
        (exam) => exam.id !== id
      )
    );

    setDeletingId(null);
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString(
      "tr-TR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <button
            onClick={() =>
              window.location.replace(
                "/dashboard"
              )
            }
            className="text-2xl font-black tracking-tight text-slate-900"
          >
            Sınav
            <span className="text-indigo-600">
              Köyü
            </span>
          </button>

          <button
            onClick={() =>
              window.location.replace(
                "/dashboard"
              )
            }
            className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
          >
            ← Dashboard
          </button>

        </div>
      </header>

      {/* CONTENT */}

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        {/* TITLE */}

        <div className="mb-8">

          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-600">
            📝 Denemeler
          </div>

          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Denemelerini takip et.
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Çözdüğün denemeleri kaydet. Sonuçlarını
            daha sonra bu denemeler üzerinden
            takip edeceğiz.
          </p>

        </div>

        {/* MESSAGES */}

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-600">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-600">
            {successMessage}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">

          {/* CREATE EXAM */}

          <div className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                ➕
              </div>

              <h2 className="mt-4 text-xl font-black text-slate-900">
                Yeni deneme
              </h2>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                Çözdüğün denemeyi sisteme ekle.
              </p>

            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Deneme adı
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Örn. TYT Türkiye Geneli #1"
                  maxLength={150}
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:bg-slate-50"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Açıklama
                  <span className="ml-2 text-xs font-medium text-slate-400">
                    Opsiyonel
                  </span>
                </label>

                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                  placeholder="Denemeyle ilgili notun..."
                  maxLength={500}
                  rows={4}
                  disabled={saving}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:bg-slate-50"
                />

              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-black text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Ekleniyor..."
                  : "Denemeyi Ekle →"}
              </button>

            </form>

          </div>

          {/* EXAM LIST */}

          <div>

            <div className="mb-4 flex items-center justify-between">

              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Denemelerin
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {exams.length} deneme kayıtlı
                </p>
              </div>

            </div>

            {loading ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">

                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

                <p className="mt-4 text-sm font-semibold text-slate-500">
                  Denemelerin yükleniyor...
                </p>

              </div>
            ) : exams.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">

                <div className="text-5xl">
                  📝
                </div>

                <h3 className="mt-4 text-lg font-black text-slate-900">
                  Henüz deneme eklemedin.
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  İlk denemeni ekleyerek sonuçlarını
                  takip etmeye başlayabilirsin.
                </p>

              </div>
            ) : (
              <div className="space-y-4">

                {exams.map((exam) => (

                  <div
                    key={exam.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                  >

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div className="flex gap-4">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                          📝
                        </div>

                        <div>

                          <h3 className="font-black text-slate-900">
                            {exam.name}
                          </h3>

                          {exam.description && (
                            <p className="mt-1 text-sm leading-5 text-slate-500">
                              {exam.description}
                            </p>
                          )}

                          <p className="mt-2 text-xs font-semibold text-slate-400">
                            Oluşturulma:{" "}
                            {formatDate(
                              exam.created_at
                            )}
                          </p>

                        </div>

                      </div>

                      <button
                        onClick={() =>
                          handleDelete(exam.id)
                        }
                        disabled={
                          deletingId === exam.id
                        }
                        className="rounded-xl px-4 py-2 text-xs font-black text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === exam.id
                          ? "Siliniyor..."
                          : "Sil"}
                      </button>

                    </div>

                  </div>

                ))}

              </div>
            )}

          </div>

        </div>

      </section>

    </main>
  );
}