"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

type Exam = {
  id: string;
  name: string;
  description: string | null;
  exam_date: string | null;
  turkish_correct: number | null;
  turkish_wrong: number | null;
  math_correct: number | null;
  math_wrong: number | null;
  science_correct: number | null;
  science_wrong: number | null;
  social_correct: number | null;
  social_wrong: number | null;
  created_at: string;
  user_id: string;
};

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [examDate, setExamDate] = useState("");

  const [turkishCorrect, setTurkishCorrect] = useState("");
  const [turkishWrong, setTurkishWrong] = useState("");

  const [mathCorrect, setMathCorrect] = useState("");
  const [mathWrong, setMathWrong] = useState("");

  const [scienceCorrect, setScienceCorrect] = useState("");
  const [scienceWrong, setScienceWrong] = useState("");

  const [socialCorrect, setSocialCorrect] = useState("");
  const [socialWrong, setSocialWrong] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [deleteExamId, setDeleteExamId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadExams = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "Kullanıcı bilgisi alınamadı:",
          userError.message
        );

        setErrorMessage(
          "Oturum bilgileri alınırken bir hata oluştu."
        );

        return;
      }

      if (!user) {
        window.location.replace("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("exams")
        .select(
          `
          id,
          name,
          description,
          exam_date,
          turkish_correct,
          turkish_wrong,
          math_correct,
          math_wrong,
          science_correct,
          science_wrong,
          social_correct,
          social_wrong,
          created_at,
          user_id
          `
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
          error.hint,
          error.code
        );

        setErrorMessage(
          "Denemeler yüklenirken bir hata oluştu."
        );

        return;
      }

      setExams((data as Exam[]) || []);
    } catch (error) {
      console.error(
        "Denemeler yüklenirken beklenmeyen hata:",
        error
      );

      setErrorMessage(
        "Denemeler yüklenirken beklenmeyen bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadExams();
  }, [loadExams]);

  function getNumber(value: string) {
    if (!value.trim()) {
      return 0;
    }

    const number = Number(value);

    if (!Number.isFinite(number) || number < 0) {
      return 0;
    }

    return number;
  }

  function calculateNet(correct: number | null, wrong: number | null) {
    return (
      Number(correct || 0) -
      Number(wrong || 0) / 4
    );
  }

  function formatNet(value: number) {
    return value.toFixed(2);
  }

  function resetForm() {
    setName("");
    setDescription("");
    setExamDate("");

    setTurkishCorrect("");
    setTurkishWrong("");

    setMathCorrect("");
    setMathWrong("");

    setScienceCorrect("");
    setScienceWrong("");

    setSocialCorrect("");
    setSocialWrong("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const cleanName = name.trim();
    const cleanDescription = description.trim();

    if (!cleanName) {
      setErrorMessage("Lütfen deneme adını gir.");
      return;
    }

    if (!examDate) {
      setErrorMessage("Lütfen deneme tarihini seç.");
      return;
    }

    const values = {
      turkishCorrect: getNumber(turkishCorrect),
      turkishWrong: getNumber(turkishWrong),
      mathCorrect: getNumber(mathCorrect),
      mathWrong: getNumber(mathWrong),
      scienceCorrect: getNumber(scienceCorrect),
      scienceWrong: getNumber(scienceWrong),
      socialCorrect: getNumber(socialCorrect),
      socialWrong: getNumber(socialWrong),
    };

    if (
      values.turkishCorrect + values.turkishWrong > 40
    ) {
      setErrorMessage(
        "Türkçe doğru + yanlış toplamı 40'tan fazla olamaz."
      );
      return;
    }

    if (
      values.mathCorrect + values.mathWrong > 40
    ) {
      setErrorMessage(
        "Matematik doğru + yanlış toplamı 40'tan fazla olamaz."
      );
      return;
    }

    if (
      values.scienceCorrect + values.scienceWrong > 20
    ) {
      setErrorMessage(
        "Fen doğru + yanlış toplamı 20'den fazla olamaz."
      );
      return;
    }

    if (
      values.socialCorrect + values.socialWrong > 20
    ) {
      setErrorMessage(
        "Sosyal doğru + yanlış toplamı 20'den fazla olamaz."
      );
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(
          "Kullanıcı bilgisi alınamadı:",
          userError.message
        );

        setErrorMessage(
          "Oturum bilgileri alınırken bir hata oluştu."
        );

        return;
      }

      if (!user) {
        window.location.replace("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("exams")
        .insert({
          name: cleanName,
          description: cleanDescription || null,
          exam_date: examDate,

          turkish_correct: values.turkishCorrect,
          turkish_wrong: values.turkishWrong,

          math_correct: values.mathCorrect,
          math_wrong: values.mathWrong,

          science_correct: values.scienceCorrect,
          science_wrong: values.scienceWrong,

          social_correct: values.socialCorrect,
          social_wrong: values.socialWrong,

          user_id: user.id,
        })
        .select(
          `
          id,
          name,
          description,
          exam_date,
          turkish_correct,
          turkish_wrong,
          math_correct,
          math_wrong,
          science_correct,
          science_wrong,
          social_correct,
          social_wrong,
          created_at,
          user_id
          `
        )
        .single();

      if (error) {
        console.error(
          "Deneme oluşturma hatası:",
          error.message,
          error.details,
          error.hint,
          error.code
        );

        setErrorMessage(
          "Deneme oluşturulamadı. Lütfen tekrar dene."
        );

        return;
      }

      setExams((current) => [
        data as Exam,
        ...current,
      ]);

      resetForm();

      setSuccessMessage(
        "Deneme başarıyla oluşturuldu."
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Deneme oluşturulurken beklenmeyen hata:",
        error
      );

      setErrorMessage(
        "Deneme oluşturulurken beklenmeyen bir hata oluştu."
      );
    } finally {
      setSaving(false);
    }
  }

  function openDeleteModal(id: string) {
    setDeleteExamId(id);
  }

  function closeDeleteModal() {
    if (deletingId) {
      return;
    }

    setDeleteExamId(null);
  }

  async function confirmDelete() {
    if (!deleteExamId) {
      return;
    }

    setDeletingId(deleteExamId);
    setErrorMessage("");

    try {
      const { error } = await supabase
        .from("exams")
        .delete()
        .eq("id", deleteExamId);

      if (error) {
        console.error(
          "Deneme silme hatası:",
          error.message,
          error.details,
          error.hint,
          error.code
        );

        setErrorMessage(
          "Deneme silinemedi. Lütfen tekrar dene."
        );

        return;
      }

      setExams((current) =>
        current.filter(
          (exam) => exam.id !== deleteExamId
        )
      );

      setDeleteExamId(null);
    } catch (error) {
      console.error(
        "Deneme silinirken beklenmeyen hata:",
        error
      );

      setErrorMessage(
        "Deneme silinirken beklenmeyen bir hata oluştu."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(date: string | null) {
    if (!date) {
      return "-";
    }

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "tr-TR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  }

  const selectedExam = exams.find(
    (exam) => exam.id === deleteExamId
  );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header />

          <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

            {/* TITLE */}

            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-600">
                📝 Denemeler
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Denemelerini takip et.
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Çözdüğün denemeleri ve ders sonuçlarını
                kaydet. Netlerini düzenli olarak takip et.
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

            {/* MAIN GRID */}

            <div className="grid gap-8 lg:grid-cols-[400px_1fr]">

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
                    Çözdüğün denemeyi ve sonuçlarını sisteme ekle.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  {/* NAME */}

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

                  {/* DATE */}

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Deneme tarihi
                    </label>

                    <input
                      type="date"
                      value={examDate}
                      onChange={(event) =>
                        setExamDate(event.target.value)
                      }
                      disabled={saving}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:bg-slate-50"
                    />
                  </div>

                  {/* TURKISH */}

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="mb-3">
                      <p className="text-sm font-black text-slate-800">
                        🇹🇷 Türkçe
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        40 soru
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-600">
                          Doğru
                        </label>

                        <input
                          type="number"
                          min="0"
                          max="40"
                          value={turkishCorrect}
                          onChange={(event) =>
                            setTurkishCorrect(
                              event.target.value
                            )
                          }
                          disabled={saving}
                          placeholder="0"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-600">
                          Yanlış
                        </label>

                        <input
                          type="number"
                          min="0"
                          max="40"
                          value={turkishWrong}
                          onChange={(event) =>
                            setTurkishWrong(
                              event.target.value
                            )
                          }
                          disabled={saving}
                          placeholder="0"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* MATH */}

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="mb-3">
                      <p className="text-sm font-black text-slate-800">
                        ➗ Matematik
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        40 soru
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-600">
                          Doğru
                        </label>

                        <input
                          type="number"
                          min="0"
                          max="40"
                          value={mathCorrect}
                          onChange={(event) =>
                            setMathCorrect(
                              event.target.value
                            )
                          }
                          disabled={saving}
                          placeholder="0"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-600">
                          Yanlış
                        </label>

                        <input
                          type="number"
                          min="0"
                          max="40"
                          value={mathWrong}
                          onChange={(event) =>
                            setMathWrong(
                              event.target.value
                            )
                          }
                          disabled={saving}
                          placeholder="0"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SCIENCE */}

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="mb-3">
                      <p className="text-sm font-black text-slate-800">
                        🔬 Fen Bilimleri
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        20 soru
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-600">
                          Doğru
                        </label>

                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={scienceCorrect}
                          onChange={(event) =>
                            setScienceCorrect(
                              event.target.value
                            )
                          }
                          disabled={saving}
                          placeholder="0"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-600">
                          Yanlış
                        </label>

                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={scienceWrong}
                          onChange={(event) =>
                            setScienceWrong(
                              event.target.value
                            )
                          }
                          disabled={saving}
                          placeholder="0"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SOCIAL */}

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="mb-3">
                      <p className="text-sm font-black text-slate-800">
                        🌍 Sosyal Bilimler
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        20 soru
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-600">
                          Doğru
                        </label>

                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={socialCorrect}
                          onChange={(event) =>
                            setSocialCorrect(
                              event.target.value
                            )
                          }
                          disabled={saving}
                          placeholder="0"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-xs font-bold text-slate-600">
                          Yanlış
                        </label>

                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={socialWrong}
                          onChange={(event) =>
                            setSocialWrong(
                              event.target.value
                            )
                          }
                          disabled={saving}
                          placeholder="0"
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* DESCRIPTION */}

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

                  {/* SUBMIT */}

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

                  <button
                    type="button"
                    onClick={() => void loadExams()}
                    className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100"
                  >
                    Yenile
                  </button>
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
                    {exams.map((exam) => {
                      const turkishNet = calculateNet(
                        exam.turkish_correct,
                        exam.turkish_wrong
                      );

                      const mathNet = calculateNet(
                        exam.math_correct,
                        exam.math_wrong
                      );

                      const scienceNet = calculateNet(
                        exam.science_correct,
                        exam.science_wrong
                      );

                      const socialNet = calculateNet(
                        exam.social_correct,
                        exam.social_wrong
                      );

                      const totalNet =
                        turkishNet +
                        mathNet +
                        scienceNet +
                        socialNet;

                      return (
                        <div
                          key={exam.id}
                          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                          <div className="flex flex-col gap-5">

                            {/* HEADER */}

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                                  📝
                                </div>

                                <div className="min-w-0">
                                  <h3 className="break-words font-black text-slate-900">
                                    {exam.name}
                                  </h3>

                                  <p className="mt-1 text-xs font-semibold text-slate-400">
                                    Deneme tarihi:{" "}
                                    {formatDate(
                                      exam.exam_date
                                    )}
                                  </p>

                                  {exam.description && (
                                    <p className="mt-2 text-sm leading-5 text-slate-500">
                                      {exam.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  openDeleteModal(
                                    exam.id
                                  )
                                }
                                disabled={
                                  deletingId === exam.id
                                }
                                className="rounded-xl px-4 py-2 text-xs font-black text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {deletingId === exam.id
                                  ? "Siliniyor..."
                                  : "Sil"}
                              </button>
                            </div>

                            {/* TOTAL NET */}

                            <div className="rounded-2xl bg-indigo-50 p-4">
                              <div className="flex items-center justify-between gap-4">
                                <div>
                                  <p className="text-xs font-bold text-indigo-500">
                                    Toplam Net
                                  </p>

                                  <p className="mt-1 text-3xl font-black text-indigo-700">
                                    {formatNet(
                                      totalNet
                                    )}
                                  </p>
                                </div>

                                <div className="text-right">
                                  <p className="text-xs font-semibold text-indigo-400">
                                    4 yanlış = 1 doğru
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* SUBJECT NETS */}

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="rounded-xl bg-slate-50 p-4">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-black text-slate-700">
                                    🇹🇷 Türkçe
                                  </p>

                                  <p className="text-lg font-black text-slate-900">
                                    {formatNet(
                                      turkishNet
                                    )}
                                  </p>
                                </div>

                                <p className="mt-1 text-xs font-semibold text-slate-400">
                                  {exam.turkish_correct || 0} doğru ·{" "}
                                  {exam.turkish_wrong || 0} yanlış
                                </p>
                              </div>

                              <div className="rounded-xl bg-slate-50 p-4">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-black text-slate-700">
                                    ➗ Matematik
                                  </p>

                                  <p className="text-lg font-black text-slate-900">
                                    {formatNet(
                                      mathNet
                                    )}
                                  </p>
                                </div>

                                <p className="mt-1 text-xs font-semibold text-slate-400">
                                  {exam.math_correct || 0} doğru ·{" "}
                                  {exam.math_wrong || 0} yanlış
                                </p>
                              </div>

                              <div className="rounded-xl bg-slate-50 p-4">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-black text-slate-700">
                                    🔬 Fen
                                  </p>

                                  <p className="text-lg font-black text-slate-900">
                                    {formatNet(
                                      scienceNet
                                    )}
                                  </p>
                                </div>

                                <p className="mt-1 text-xs font-semibold text-slate-400">
                                  {exam.science_correct || 0} doğru ·{" "}
                                  {exam.science_wrong || 0} yanlış
                                </p>
                              </div>

                              <div className="rounded-xl bg-slate-50 p-4">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-black text-slate-700">
                                    🌍 Sosyal
                                  </p>

                                  <p className="text-lg font-black text-slate-900">
                                    {formatNet(
                                      socialNet
                                    )}
                                  </p>
                                </div>

                                <p className="mt-1 text-xs font-semibold text-slate-400">
                                  {exam.social_correct || 0} doğru ·{" "}
                                  {exam.social_wrong || 0} yanlış
                                </p>
                              </div>
                            </div>

                            {/* CREATED DATE */}

                            <div className="border-t border-slate-100 pt-3">
                              <p className="text-xs font-semibold text-slate-400">
                                Sisteme eklenme:{" "}
                                {formatDate(
                                  exam.created_at
                                )}
                              </p>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* DELETE MODAL */}

      {deleteExamId && selectedExam && (
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
            aria-labelledby="delete-exam-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-2xl">
                🗑️
              </div>

              <div className="min-w-0">
                <h2
                  id="delete-exam-title"
                  className="text-lg font-black text-slate-900"
                >
                  Denemeyi Sil
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Bu denemeyi silmek istediğine emin misin?
                  Bu işlem geri alınamaz.
                </p>

                <div className="mt-3 break-words rounded-xl bg-slate-50 px-3 py-3 text-sm font-bold text-slate-700">
                  {selectedExam.name}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={Boolean(deletingId)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={() => void confirmDelete()}
                disabled={Boolean(deletingId)}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId
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