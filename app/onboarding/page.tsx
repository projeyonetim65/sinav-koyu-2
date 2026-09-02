"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  full_name: string | null;
  exam_year: number | null;
  field: string | null;
  target_university: string | null;
  target_department: string | null;
  target_rank: number | null;
};

export default function OnboardingPage() {
  const [fullName, setFullName] = useState("");
  const [examYear, setExamYear] = useState("");
  const [field, setField] = useState("");
  const [targetUniversity, setTargetUniversity] =
    useState("");
  const [targetDepartment, setTargetDepartment] =
    useState("");
  const [targetRank, setTargetRank] = useState("");

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  async function loadUserData() {
    setChecking(true);
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      window.location.replace("/auth");
      return;
    }

    /*
     * ---------------------------------------------------------
     * ONBOARDING YENİ KULLANICI İÇİN BOŞ BAŞLAR
     * ---------------------------------------------------------
     *
     * Auth sırasında girilen isim, burada otomatik
     * olarak forma aktarılmaz.
     *
     * Böylece kullanıcı onboarding ekranını açtığında:
     *
     * Ad Soyad          -> boş
     * Sınav yılı        -> boş
     * Alan              -> boş
     * Üniversite        -> boş
     * Bölüm             -> boş
     * Hedef sıralama    -> boş
     *
     * olur.
     */

    setFullName("");
    setExamYear("");
    setField("");
    setTargetUniversity("");
    setTargetDepartment("");
    setTargetRank("");

    /*
     * Burada profiles tablosundan veri çekmiyoruz.
     *
     * Bunun nedeni eski/test kullanıcı verilerinin veya
     * daha önce oluşturulmuş varsayılan profil bilgilerinin
     * yeni onboarding ekranına taşınmasını engellemektir.
     */

    setChecking(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadUserData();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  async function handleSubmit() {
    setErrorMessage("");

    if (!fullName.trim()) {
      setErrorMessage(
        "Lütfen adını ve soyadını gir."
      );
      return;
    }

    if (!examYear) {
      setErrorMessage(
        "Lütfen sınav yılını seç."
      );
      return;
    }

    if (!field) {
      setErrorMessage(
        "Lütfen alanını seç."
      );
      return;
    }

    if (!targetDepartment.trim()) {
      setErrorMessage(
        "Lütfen hedef bölümünü gir."
      );
      return;
    }

    if (!targetRank) {
      setErrorMessage(
        "Lütfen hedef sıralamanı gir."
      );
      return;
    }

    const rank = Number(targetRank);

    if (
      !Number.isFinite(rank) ||
      rank <= 0
    ) {
      setErrorMessage(
        "Lütfen geçerli bir hedef sıralama gir."
      );
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.replace("/auth");
      return;
    }

    const profileData = {
      id: user.id,
      full_name: fullName.trim(),
      exam_year: Number(examYear),
      field,
      target_university:
        targetUniversity.trim() || null,
      target_department:
        targetDepartment.trim(),
      target_rank: rank,
    };

    const { error } = await supabase
      .from("profiles")
      .upsert(profileData, {
        onConflict: "id",
      });

    if (error) {
      console.error(
        "Profil oluşturma hatası:",
        error.message,
        error.code
      );

      setErrorMessage(
        "Profil oluşturulamadı. Lütfen tekrar dene."
      );

      setLoading(false);
      return;
    }

    window.location.replace("/dashboard");
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Hesabın hazırlanıyor...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <button
              onClick={() =>
                window.location.replace("/")
              }
              className="text-3xl font-black tracking-tight text-slate-900"
            >
              Sınav
              <span className="text-indigo-600">
                Köyü
              </span>
            </button>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Seni tanıyalım ve YKS hazırlık
              sürecini sana göre kişiselleştirelim.
            </p>
          </div>

          <div className="mx-auto mb-8 max-w-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-xs font-black text-white">
                  1
                </div>

                <span className="hidden text-xs font-bold text-indigo-600 sm:block">
                  Seni tanıyalım
                </span>
              </div>

              <div className="mx-3 h-1 flex-1 rounded-full bg-slate-200">
                <div className="h-full w-1/3 rounded-full bg-indigo-600" />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-black text-slate-400">
                  2
                </div>

                <span className="hidden text-xs font-bold text-slate-400 sm:block">
                  Hedefin
                </span>
              </div>

              <div className="mx-3 h-1 flex-1 rounded-full bg-slate-200" />

              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-black text-slate-400">
                  3
                </div>

                <span className="hidden text-xs font-bold text-slate-400 sm:block">
                  Hazırsın
                </span>
              </div>
            </div>
          </div>

          <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="hidden bg-slate-900 p-8 text-white lg:flex lg:flex-col lg:justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-2xl">
                  🎯
                </div>

                <h2 className="mt-6 text-3xl font-black leading-tight">
                  Hedefini
                  <span className="block text-indigo-400">
                    netleştir.
                  </span>
                </h2>

                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Vereceğin bilgiler sayesinde
                  Sınav Köyü'nü sana daha uygun
                  hale getirebiliriz.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-sm">
                    ✓
                  </div>

                  <span className="text-sm font-semibold text-slate-300">
                    Kişisel hedeflerin
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-sm">
                    ✓
                  </div>

                  <span className="text-sm font-semibold text-slate-300">
                    Çalışma planların
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-sm">
                    ✓
                  </div>

                  <span className="text-sm font-semibold text-slate-300">
                    İlerleme takibin
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-10">
              <div className="mb-8">
                <p className="text-xs font-black uppercase tracking-wider text-indigo-600">
                  Başlangıç
                </p>

                <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
                  YKS hedeflerini belirle 🎯
                </h1>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Bu bilgiler dashboard'ını ve
                  çalışma sürecini kişiselleştirmemize
                  yardımcı olacak.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold leading-5 text-red-600">
                  {errorMessage}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Ad Soyad
                  </label>

                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(
                        e.target.value
                      )
                    }
                    placeholder="Adın ve soyadın"
                    maxLength={100}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Sınav yılı
                  </label>

                  <select
                    value={examYear}
                    onChange={(e) =>
                      setExamYear(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  >
                    <option value="">
                      Sınav yılını seç
                    </option>

                    <option value="2027">
                      YKS 2027
                    </option>

                    <option value="2028">
                      YKS 2028
                    </option>

                    <option value="2029">
                      YKS 2029
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Alanın
                  </label>

                  <select
                    value={field}
                    onChange={(e) =>
                      setField(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  >
                    <option value="">
                      Alanını seç
                    </option>

                    <option value="sayisal">
                      Sayısal
                    </option>

                    <option value="ea">
                      Eşit Ağırlık
                    </option>

                    <option value="sozel">
                      Sözel
                    </option>

                    <option value="dil">
                      Dil
                    </option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Hedef üniversite
                    <span className="ml-2 text-xs font-medium text-slate-400">
                      Opsiyonel
                    </span>
                  </label>

                  <input
                    type="text"
                    value={targetUniversity}
                    onChange={(e) =>
                      setTargetUniversity(
                        e.target.value
                      )
                    }
                    placeholder="Örn. İstanbul Üniversitesi"
                    maxLength={200}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Hedef bölüm
                  </label>

                  <input
                    type="text"
                    value={targetDepartment}
                    onChange={(e) =>
                      setTargetDepartment(
                        e.target.value
                      )
                    }
                    placeholder="Örn. Yazılım Mühendisliği"
                    maxLength={200}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Hedef sıralama
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={targetRank}
                    onChange={(e) =>
                      setTargetRank(
                        e.target.value
                      )
                    }
                    placeholder="Örn. 100000"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                  />

                  <p className="mt-2 text-xs font-semibold text-slate-400">
                    Hedeflediğin başarı sıralamasını
                    gir.
                  </p>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="mt-3 w-full rounded-xl bg-indigo-600 py-4 text-sm font-black text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? "Profil oluşturuluyor..."
                    : "Hedeflerimi Kaydet →"}
                </button>
              </div>

              <p className="mt-5 text-center text-xs leading-5 text-slate-400">
                Bu bilgileri daha sonra Profil
                sayfasından değiştirebilirsin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}