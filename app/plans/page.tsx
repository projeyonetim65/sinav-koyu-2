"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

type StudyPlan = {
  id: number;
  user_id: string;
  title: string;
  start_date: string;
  end_date: string;
  created_at: string;
};

type ModalType = "success" | "error" | "confirm";

export default function PlansPage() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] =
    useState<ModalType>("success");
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const [deleteId, setDeleteId] =
    useState<number | null>(null);

  useEffect(() => {
    const today = new Date();
    const nextWeek = new Date();

    nextWeek.setDate(today.getDate() + 7);

    setStartDate(formatDate(today));
    setEndDate(formatDate(nextWeek));

    loadPlans();
  }, []);

  function formatDate(date: Date) {
    return date.toISOString().split("T")[0];
  }

  function showModal(
    type: ModalType,
    title: string,
    message: string
  ) {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setDeleteId(null);
  }

  async function loadPlans() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    const { data, error } = await supabase
      .from("study_plans")
      .select(
        "id, user_id, title, start_date, end_date, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Plan yükleme hatası:", error);

      showModal(
        "error",
        "Planlar yüklenemedi",
        error.message ||
          "Planlar yüklenirken beklenmeyen bir hata oluştu."
      );

      setLoading(false);
      return;
    }

    setPlans(data || []);
    setLoading(false);
  }

  async function addPlan() {
    if (!title.trim()) {
      showModal(
        "error",
        "Plan adı eksik",
        "Lütfen oluşturmak istediğin plan için bir ad gir."
      );
      return;
    }

    if (!startDate || !endDate) {
      showModal(
        "error",
        "Tarih eksik",
        "Lütfen başlangıç ve bitiş tarihlerini seç."
      );
      return;
    }

    if (startDate > endDate) {
      showModal(
        "error",
        "Geçersiz tarih",
        "Bitiş tarihi başlangıç tarihinden önce olamaz."
      );
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      showModal(
        "error",
        "Oturum bulunamadı",
        "Oturumun sona ermiş olabilir. Lütfen tekrar giriş yap."
      );

      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("study_plans")
      .insert({
        user_id: user.id,
        title: title.trim(),
        start_date: startDate,
        end_date: endDate,
      });

    if (error) {
      console.error("Plan ekleme hatası:", error);

      showModal(
        "error",
        "Plan oluşturulamadı",
        error.message ||
          "Plan oluşturulurken beklenmeyen bir hata oluştu."
      );

      setSaving(false);
      return;
    }

    setTitle("");

    await loadPlans();

    setSaving(false);

    showModal(
      "success",
      "Plan oluşturuldu 🎉",
      "Çalışma planın başarıyla oluşturuldu."
    );
  }

  function askDeletePlan(id: number) {
    setDeleteId(id);

    showModal(
      "confirm",
      "Planı silmek istiyor musun?",
      "Bu işlem planı kalıcı olarak silecek. Bu işlemi geri alamazsın."
    );
  }

  async function deletePlan() {
    if (deleteId === null) {
      return;
    }

    const id = deleteId;

    closeModal();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      showModal(
        "error",
        "Oturum bulunamadı",
        "Oturumun sona ermiş olabilir. Lütfen tekrar giriş yap."
      );
      return;
    }

    const { error } = await supabase
      .from("study_plans")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Plan silme hatası:", error);

      showModal(
        "error",
        "Plan silinemedi",
        error.message ||
          "Plan silinirken beklenmeyen bir hata oluştu."
      );

      return;
    }

    setPlans((current) =>
      current.filter((plan) => plan.id !== id)
    );

    showModal(
      "success",
      "Plan silindi",
      "Çalışma planı başarıyla silindi."
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

            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
                Planlama
              </p>

              <h1 className="mt-1 text-3xl font-black text-slate-900">
                Çalışma Planların
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                YKS hazırlığını planla, çalışmalarını düzenli takip et.
              </p>
            </div>

            {/* CREATE PLAN */}

            <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">

              <h2 className="text-xl font-black text-slate-900">
                Yeni Plan Oluştur
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Çalışmak istediğin dönem için yeni bir plan oluştur.
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Plan adı
                  </label>

                  <input
                    type="text"
                    value={title}
                    onChange={(e) =>
                      setTitle(e.target.value)
                    }
                    placeholder="Örn: TYT Başlangıç Programı"
                    maxLength={150}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Başlangıç tarihi
                  </label>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) =>
                      setStartDate(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Bitiş tarihi
                  </label>

                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) =>
                      setEndDate(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

              </div>

              <button
                onClick={addPlan}
                disabled={saving}
                className="mt-5 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Oluşturuluyor..."
                  : "+ Plan Oluştur"}
              </button>

            </section>

            {/* PLAN LIST */}

            <section className="mt-6">

              <div className="mb-4 flex items-center justify-between">

                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Planların
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Oluşturduğun çalışma planları
                  </p>
                </div>

                <button
                  onClick={loadPlans}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
                >
                  Yenile
                </button>

              </div>

              {loading ? (

                <div className="rounded-2xl bg-white p-10 text-center shadow-sm">

                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

                  <p className="mt-4 text-sm font-semibold text-slate-500">
                    Planlar yükleniyor...
                  </p>

                </div>

              ) : plans.length === 0 ? (

                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">

                  <div className="text-5xl">
                    🗓️
                  </div>

                  <h3 className="mt-4 font-bold text-slate-900">
                    Henüz plan oluşturmadın
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                    Yukarıdaki formu kullanarak ilk çalışma planını oluştur.
                  </p>

                </div>

              ) : (

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                  {plans.map((plan) => (

                    <div
                      key={plan.id}
                      className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    >

                      <div className="flex items-start justify-between">

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                          📚
                        </div>

                        <button
                          onClick={() =>
                            askDeletePlan(plan.id)
                          }
                          className="rounded-lg px-3 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50"
                        >
                          Sil
                        </button>

                      </div>

                      <h3 className="mt-5 break-words text-lg font-black text-slate-900">
                        {plan.title}
                      </h3>

                      <div className="mt-4 space-y-2">

                        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                          <span className="text-xs font-semibold text-slate-400">
                            Başlangıç
                          </span>

                          <span className="text-sm font-bold text-slate-700">
                            {plan.start_date}
                          </span>
                        </div>

                        <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                          <span className="text-xs font-semibold text-slate-400">
                            Bitiş
                          </span>

                          <span className="text-sm font-bold text-slate-700">
                            {plan.end_date}
                          </span>
                        </div>

                      </div>

                      <button
                        onClick={() => {
                          window.location.href =
                            `/tasks?plan=${plan.id}`;
                        }}
                        className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                      >
                        Planı Aç →
                      </button>

                    </div>

                  ))}

                </div>

              )}

            </section>

          </div>
        </div>
      </div>

      {/* MODAL */}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm"
          onClick={closeModal}
        >

          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* ICON */}

            <div className="flex justify-center">

              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl text-2xl ${
                  modalType === "success"
                    ? "bg-emerald-50 text-emerald-600"
                    : modalType === "error"
                    ? "bg-red-50 text-red-600"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                {modalType === "success"
                  ? "✓"
                  : modalType === "error"
                  ? "!"
                  : "⚠"}
              </div>

            </div>

            {/* CONTENT */}

            <div className="mt-5 text-center">

              <h2 className="text-xl font-black text-slate-900">
                {modalTitle}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {modalMessage}
              </p>

            </div>

            {/* BUTTONS */}

            {modalType === "confirm" ? (

              <div className="mt-6 grid grid-cols-2 gap-3">

                <button
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Vazgeç
                </button>

                <button
                  onClick={deletePlan}
                  className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                >
                  Evet, Sil
                </button>

              </div>

            ) : (

              <button
                onClick={closeModal}
                className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-bold text-white transition ${
                  modalType === "success"
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                Tamam
              </button>

            )}

          </div>

        </div>
      )}

    </main>
  );
}