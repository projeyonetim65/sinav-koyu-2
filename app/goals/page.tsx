"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

type Goal = {
  id: number;
  user_id: string;
  title: string;
  target_rank: number | null;
  target_net: number | null;
  exam_type: string;
  created_at: string;
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);

  const [title, setTitle] = useState("");
  const [targetRank, setTargetRank] = useState("");
  const [targetNet, setTargetNet] = useState("");
  const [examType, setExamType] = useState("YKS");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [deleteGoalId, setDeleteGoalId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  async function getUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.replace("/auth");
      return null;
    }

    return user;
  }

  async function loadGoals() {
    setLoading(true);

    const user = await getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("goals")
      .select(
        "id, user_id, title, target_rank, target_net, exam_type, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Hedef yükleme hatası:", error);

      alert(
        `Hedefler yüklenemedi: ${
          error.message || "Bilinmeyen hata"
        }`
      );

      setLoading(false);
      return;
    }

    setGoals(data || []);
    setLoading(false);
  }

  async function addGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      alert("Lütfen hedef başlığını gir.");
      return;
    }

    setSaving(true);

    const user = await getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const newGoal = {
      user_id: user.id,
      title: title.trim(),
      target_rank: targetRank ? Number(targetRank) : null,
      target_net: targetNet ? Number(targetNet) : null,
      exam_type: examType,
    };

    const { error } = await supabase
      .from("goals")
      .insert(newGoal);

    if (error) {
      console.error("Hedef ekleme hatası:", error);

      alert(
        `Hedef eklenemedi: ${
          error.message || "Bilinmeyen hata"
        }`
      );

      setSaving(false);
      return;
    }

    setTitle("");
    setTargetRank("");
    setTargetNet("");
    setExamType("YKS");

    await loadGoals();

    setSaving(false);
  }

  function openDeleteModal(id: number) {
    setDeleteGoalId(id);
  }

  function closeDeleteModal() {
    if (deleting) {
      return;
    }

    setDeleteGoalId(null);
  }

  async function deleteGoal() {
    if (deleteGoalId === null) {
      return;
    }

    setDeleting(true);

    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", deleteGoalId);

    if (error) {
      console.error("Hedef silme hatası:", error);

      alert(
        `Hedef silinemedi: ${
          error.message || "Bilinmeyen hata"
        }`
      );

      setDeleting(false);
      return;
    }

    setGoals((current) =>
      current.filter((goal) => goal.id !== deleteGoalId)
    );

    setDeleteGoalId(null);
    setDeleting(false);
  }

  const selectedGoal = goals.find(
    (goal) => goal.id === deleteGoalId
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-slate-500">
          Hedefler yükleniyor...
        </p>
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

            {/* PAGE HEADER */}

            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
                Hedef Takibi
              </p>

              <h1 className="mt-1 text-3xl font-black text-slate-900">
                Hedeflerim 🎯
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                YKS hedeflerini belirle, ne için çalıştığını
                unutma ve ilerlemeni takip et.
              </p>
            </div>

            {/* CREATE GOAL */}

            <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Yeni Hedef
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Ulaşmak istediğin hedefi sisteme ekle.
                </p>
              </div>

              <form
                onSubmit={addGoal}
                className="mt-6"
              >
                <div className="grid gap-5 md:grid-cols-2">

                  {/* TITLE */}

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Hedef
                    </label>

                    <input
                      type="text"
                      value={title}
                      onChange={(event) =>
                        setTitle(event.target.value)
                      }
                      placeholder="Örn: Bartın Üniversitesi Yazılım Mühendisliği"
                      maxLength={200}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      required
                    />
                  </div>

                  {/* EXAM TYPE */}

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Sınav
                    </label>

                    <select
                      value={examType}
                      onChange={(event) =>
                        setExamType(event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      <option value="YKS">
                        YKS
                      </option>

                      <option value="TYT">
                        TYT
                      </option>

                      <option value="AYT">
                        AYT
                      </option>

                      <option value="MSÜ">
                        MSÜ
                      </option>
                    </select>
                  </div>

                  {/* TARGET RANK */}

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Hedef Sıralama
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={targetRank}
                      onChange={(event) =>
                        setTargetRank(event.target.value)
                      }
                      placeholder="Örn: 100000"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                  {/* TARGET NET */}

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Hedef Net
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={targetNet}
                      onChange={(event) =>
                        setTargetNet(event.target.value)
                      }
                      placeholder="Örn: 100"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>

                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Ekleniyor..."
                    : "+ Hedef Ekle"}
                </button>
              </form>
            </section>

            {/* GOALS LIST */}

            <section className="mt-6">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Hedeflerim
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {goals.length} hedef kayıtlı
                  </p>
                </div>

                <button
                  onClick={loadGoals}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
                >
                  Yenile
                </button>
              </div>

              {goals.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                    🎯
                  </div>

                  <h3 className="mt-4 text-lg font-black text-slate-900">
                    Henüz hedefin yok
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Yukarıdaki formu kullanarak ilk hedefini
                    oluştur ve çalışma sürecine bir yön ver.
                  </p>

                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">

                  {goals.map((goal) => (
                    <article
                      key={goal.id}
                      className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">

                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                              {goal.exam_type}
                            </span>

                            <span className="text-xs text-slate-400">
                              Hedef
                            </span>

                          </div>

                          <h3 className="mt-3 break-words text-xl font-black text-slate-900">
                            {goal.title}
                          </h3>

                        </div>

                        <button
                          onClick={() =>
                            openDeleteModal(goal.id)
                          }
                          className="shrink-0 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                        >
                          Sil
                        </button>

                      </div>

                      <div className="mt-6 grid gap-3 sm:grid-cols-2">

                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-xs font-semibold text-slate-500">
                            Hedef Sıralama
                          </p>

                          <p className="mt-2 text-xl font-black text-slate-900">
                            {goal.target_rank !== null
                              ? goal.target_rank.toLocaleString(
                                  "tr-TR"
                                )
                              : "-"}
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-4">
                          <p className="text-xs font-semibold text-slate-500">
                            Hedef Net
                          </p>

                          <p className="mt-2 text-xl font-black text-slate-900">
                            {goal.target_net !== null
                              ? Number(
                                  goal.target_net
                                ).toFixed(2)
                              : "-"}
                          </p>
                        </div>

                      </div>

                      <div className="mt-4 border-t border-slate-100 pt-4">

                        <p className="text-xs text-slate-400">
                          Oluşturulma tarihi
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-600">
                          {new Date(
                            goal.created_at
                          ).toLocaleDateString(
                            "tr-TR"
                          )}
                        </p>

                      </div>

                    </article>
                  ))}

                </div>
              )}
            </section>

          </div>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}

      {deleteGoalId !== null && selectedGoal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-goal-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-2xl">
                🗑️
              </div>

              <div className="min-w-0">
                <h2
                  id="delete-goal-title"
                  className="text-lg font-black text-slate-900"
                >
                  Hedefi Sil
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Bu hedefi silmek istediğine emin misin?
                </p>

                <p className="mt-2 break-words rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700">
                  {selectedGoal.title}
                </p>
              </div>

            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={deleteGoal}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? "Siliniyor..." : "Evet, Sil"}
              </button>

            </div>

          </div>
        </div>
      )}

    </main>
  );
}