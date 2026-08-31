"use client";

import { FormEvent, useEffect, useState } from "react";
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

type ModalType = "success" | "error" | "confirm" | null;

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [examYear, setExamYear] = useState("2027");
  const [field, setField] = useState("sayisal");
  const [targetUniversity, setTargetUniversity] = useState("");
  const [targetDepartment, setTargetDepartment] = useState("");
  const [targetRank, setTargetRank] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const [modalType, setModalType] =
    useState<ModalType>(null);

  const [modalTitle, setModalTitle] =
    useState("");

  const [modalMessage, setModalMessage] =
    useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  function showModal(
    type: Exclude<ModalType, null>,
    title: string,
    message: string
  ) {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
  }

  function closeModal() {
    setModalType(null);
    setModalTitle("");
    setModalMessage("");
  }

  async function loadProfile() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.replace("/auth");
      return;
    }

    setEmail(user.email || "");

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "full_name, exam_year, field, target_university, target_department, target_rank"
      )
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error(
        "Profil yükleme hatası:",
        error.message,
        error.details,
        error.code
      );

      showModal(
        "error",
        "Profil yüklenemedi",
        "Profil bilgilerin alınırken bir hata oluştu. Lütfen sayfayı yenileyip tekrar dene."
      );

      setLoading(false);
      return;
    }

    if (data) {
      const profile = data as Profile;

      setFullName(
        profile.full_name || ""
      );

      setExamYear(
        profile.exam_year
          ? String(profile.exam_year)
          : "2027"
      );

      setField(
        profile.field || "sayisal"
      );

      setTargetUniversity(
        profile.target_university || ""
      );

      setTargetDepartment(
        profile.target_department || ""
      );

      setTargetRank(
        profile.target_rank !== null &&
        profile.target_rank !== undefined
          ? String(profile.target_rank)
          : ""
      );
    }

    setLoading(false);
  }

  async function saveProfile(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    closeModal();

    const cleanName = fullName.trim();
    const cleanUniversity =
      targetUniversity.trim();
    const cleanDepartment =
      targetDepartment.trim();

    if (!cleanName) {
      showModal(
        "error",
        "Eksik bilgi",
        "Lütfen ad soyad bilgisini gir."
      );
      return;
    }

    if (cleanName.length < 2) {
      showModal(
        "error",
        "Geçersiz ad soyad",
        "Lütfen geçerli bir ad soyad bilgisi gir."
      );
      return;
    }

    if (!examYear) {
      showModal(
        "error",
        "Eksik bilgi",
        "Lütfen sınav yılını seç."
      );
      return;
    }

    if (!field) {
      showModal(
        "error",
        "Eksik bilgi",
        "Lütfen alanını seç."
      );
      return;
    }

    if (cleanDepartment.length > 200) {
      showModal(
        "error",
        "Hedef bölüm çok uzun",
        "Hedef bölüm bilgisi en fazla 200 karakter olabilir."
      );
      return;
    }

    if (cleanUniversity.length > 200) {
      showModal(
        "error",
        "Üniversite adı çok uzun",
        "Hedef üniversite bilgisi en fazla 200 karakter olabilir."
      );
      return;
    }

    let rank: number | null = null;

    if (targetRank.trim()) {
      rank = Number(targetRank);

      if (
        !Number.isFinite(rank) ||
        rank <= 0 ||
        !Number.isInteger(rank)
      ) {
        showModal(
          "error",
          "Geçersiz sıralama",
          "Lütfen geçerli bir hedef sıralama gir."
        );
        return;
      }
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);

      showModal(
        "error",
        "Oturum bulunamadı",
        "Oturumun sona ermiş olabilir. Lütfen tekrar giriş yap."
      );

      setTimeout(() => {
        window.location.replace("/auth");
      }, 1800);

      return;
    }

    const updateData = {
      full_name: cleanName,
      exam_year: Number(examYear),
      field,
      target_university:
        cleanUniversity || null,
      target_department:
        cleanDepartment || null,
      target_rank: rank,
    };

    const { data, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select(
        "full_name, exam_year, field, target_university, target_department, target_rank"
      )
      .maybeSingle();

    if (error) {
      console.error(
        "Profil kaydetme hatası:",
        error.message,
        error.details,
        error.code
      );

      setSaving(false);

      showModal(
        "error",
        "Profil kaydedilemedi",
        "Değişikliklerin kaydedilirken bir hata oluştu. Lütfen tekrar dene."
      );

      return;
    }

    if (!data) {
      console.error(
        "Profil kaydedildi ancak kayıt geri döndürülmedi."
      );

      setSaving(false);

      showModal(
        "error",
        "Profil güncellenemedi",
        "Profil kaydı bulunamadı veya güncellenemedi. Lütfen tekrar dene."
      );

      return;
    }

    const profile = data as Profile;

    setFullName(
      profile.full_name || ""
    );

    setExamYear(
      profile.exam_year
        ? String(profile.exam_year)
        : "2027"
    );

    setField(
      profile.field || "sayisal"
    );

    setTargetUniversity(
      profile.target_university || ""
    );

    setTargetDepartment(
      profile.target_department || ""
    );

    setTargetRank(
      profile.target_rank !== null &&
      profile.target_rank !== undefined
        ? String(profile.target_rank)
        : ""
    );

    setSaving(false);

    showModal(
      "success",
      "Profil güncellendi",
      "Profil ve YKS hedeflerin başarıyla kaydedildi."
    );
  }

  function requestSignOut() {
    if (saving || signingOut) {
      return;
    }

    showModal(
      "confirm",
      "Çıkış yapmak üzeresin",
      "Hesabından çıkış yapmak istediğine emin misin?"
    );
  }

  async function confirmSignOut() {
    closeModal();
    setSigningOut(true);

    const { error } =
      await supabase.auth.signOut();

    if (error) {
      console.error(
        "Çıkış hatası:",
        error.message
      );

      setSigningOut(false);

      showModal(
        "error",
        "Çıkış yapılamadı",
        "Hesabından çıkış yapılırken bir hata oluştu. Lütfen tekrar dene."
      );

      return;
    }

    window.location.replace("/auth");
  }

  function getFieldName() {
    if (field === "sayisal") {
      return "Sayısal";
    }

    if (field === "ea") {
      return "Eşit Ağırlık";
    }

    if (field === "sozel") {
      return "Sözel";
    }

    if (field === "dil") {
      return "Dil";
    }

    return "Belirlenmedi";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Profil yükleniyor...
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

            {/* PAGE HEADER */}

            <div className="mb-6">

              <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
                Hesabım
              </p>

              <h1 className="mt-1 text-3xl font-black text-slate-900">
                Profil ve Ayarlar
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Kişisel bilgilerini ve YKS hedeflerini
                buradan yönetebilirsin.
              </p>

            </div>

            {/* CONTENT */}

            <div className="grid gap-6 lg:grid-cols-3">

              {/* PROFILE FORM */}

              <section className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2">

                <div className="flex items-center gap-4">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-2xl font-black text-indigo-600">
                    {fullName
                      ? fullName
                          .charAt(0)
                          .toUpperCase()
                      : "?"}
                  </div>

                  <div>

                    <h2 className="text-xl font-black text-slate-900">
                      Hesap Bilgileri
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Profil bilgilerini güncel tut.
                    </p>

                  </div>

                </div>

                <form
                  onSubmit={saveProfile}
                  className="mt-6"
                >

                  {/* EMAIL */}

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      E-posta
                    </label>

                    <input
                      value={email}
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                    />

                    <p className="mt-2 text-xs font-medium text-slate-400">
                      E-posta adresin hesap kimliğindir ve
                      buradan değiştirilemez.
                    </p>

                  </div>

                  {/* NAME */}

                  <div className="mt-5">

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Ad Soyad
                    </label>

                    <input
                      value={fullName}
                      onChange={(e) =>
                        setFullName(
                          e.target.value
                        )
                      }
                      placeholder="Ad Soyad"
                      maxLength={100}
                      disabled={saving}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />

                  </div>

                  {/* EXAM YEAR */}

                  <div className="mt-5">

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Sınav Yılı
                    </label>

                    <select
                      value={examYear}
                      onChange={(e) =>
                        setExamYear(
                          e.target.value
                        )
                      }
                      disabled={saving}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    >

                      <option value="2027">
                        2027
                      </option>

                      <option value="2028">
                        2028
                      </option>

                      <option value="2029">
                        2029
                      </option>

                    </select>

                  </div>

                  {/* YKS GOALS */}

                  <div className="mt-8 border-t border-slate-100 pt-6">

                    <h3 className="text-lg font-black text-slate-900">
                      YKS Hedeflerin
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Sınav hedeflerini belirle ve
                      sistemin sana göre şekillensin.
                    </p>

                  </div>

                  {/* FIELD */}

                  <div className="mt-5">

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Alan
                    </label>

                    <select
                      value={field}
                      onChange={(e) =>
                        setField(
                          e.target.value
                        )
                      }
                      disabled={saving}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    >

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

                  {/* UNIVERSITY */}

                  <div className="mt-5">

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Hedef Üniversite
                    </label>

                    <input
                      value={targetUniversity}
                      onChange={(e) =>
                        setTargetUniversity(
                          e.target.value
                        )
                      }
                      placeholder="Örn: Bartın Üniversitesi"
                      maxLength={200}
                      disabled={saving}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />

                  </div>

                  {/* DEPARTMENT */}

                  <div className="mt-5">

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Hedef Bölüm
                    </label>

                    <input
                      value={targetDepartment}
                      onChange={(e) =>
                        setTargetDepartment(
                          e.target.value
                        )
                      }
                      placeholder="Örn: Bilgisayar Mühendisliği"
                      maxLength={200}
                      disabled={saving}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />

                  </div>

                  {/* RANK */}

                  <div className="mt-5">

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Hedef Sıralama
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
                      placeholder="Örn: 100000"
                      disabled={saving}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />

                    <p className="mt-2 text-xs font-semibold text-slate-400">
                      Hedef sıralamanı değiştirmek
                      istemiyorsan bu alanı boş bırakabilirsin.
                    </p>

                  </div>

                  {/* SAVE */}

                  <button
                    type="submit"
                    disabled={saving}
                    className="mt-8 w-full rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-black text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {saving
                      ? "Kaydediliyor..."
                      : "Değişiklikleri Kaydet"}

                  </button>

                </form>

              </section>

              {/* RIGHT SIDE */}

              <div className="space-y-6">

                {/* GOAL SUMMARY */}

                <section className="rounded-2xl bg-white p-6 shadow-sm">

                  <h2 className="text-lg font-black text-slate-900">
                    Hedef Özeti
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Mevcut YKS hedeflerin
                  </p>

                  <div className="mt-5 space-y-4">

                    {/* EXAM */}

                    <div className="rounded-xl bg-slate-50 p-4">

                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Sınav
                      </p>

                      <p className="mt-1 font-black text-slate-900">
                        YKS {examYear}
                      </p>

                    </div>

                    {/* FIELD */}

                    <div className="rounded-xl bg-slate-50 p-4">

                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Alan
                      </p>

                      <p className="mt-1 font-black text-slate-900">
                        {getFieldName()}
                      </p>

                    </div>

                    {/* UNIVERSITY */}

                    <div className="rounded-xl bg-slate-50 p-4">

                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Üniversite
                      </p>

                      <p className="mt-1 break-words font-black text-slate-900">
                        {targetUniversity ||
                          "Belirlenmedi"}
                      </p>

                    </div>

                    {/* DEPARTMENT */}

                    <div className="rounded-xl bg-slate-50 p-4">

                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                        Bölüm
                      </p>

                      <p className="mt-1 break-words font-black text-slate-900">
                        {targetDepartment ||
                          "Belirlenmedi"}
                      </p>

                    </div>

                    {/* RANK */}

                    <div className="rounded-xl bg-indigo-50 p-4">

                      <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
                        Hedef Sıralama
                      </p>

                      <p className="mt-1 text-2xl font-black text-indigo-700">
                        {targetRank
                          ? Number(
                              targetRank
                            ).toLocaleString(
                              "tr-TR"
                            )
                          : "Belirlenmedi"}
                      </p>

                    </div>

                  </div>

                </section>

                {/* ACCOUNT */}

                <section className="rounded-2xl bg-white p-6 shadow-sm">

                  <h2 className="font-black text-slate-900">
                    Hesap
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Hesabından güvenli şekilde çıkış
                    yapabilirsin.
                  </p>

                  <button
                    onClick={requestSignOut}
                    disabled={saving || signingOut}
                    className="mt-5 w-full rounded-xl bg-red-50 px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {signingOut
                      ? "Çıkış yapılıyor..."
                      : "Çıkış Yap"}

                  </button>

                </section>

              </div>

            </div>

          </div>

        </div>
      </div>

      {/* MODAL */}

      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">

          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
          >

            {/* ICON */}

            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${
                modalType === "success"
                  ? "bg-emerald-50"
                  : modalType === "error"
                  ? "bg-red-50"
                  : "bg-amber-50"
              }`}
            >

              {modalType === "success"
                ? "✓"
                : modalType === "error"
                ? "!"
                : "?"}

            </div>

            {/* TEXT */}

            <div className="mt-5 text-center">

              <h3 className="text-xl font-black text-slate-900">
                {modalTitle}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {modalMessage}
              </p>

            </div>

            {/* ACTIONS */}

            <div className="mt-6 flex gap-3">

              {modalType === "confirm" ? (
                <>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                  >
                    Vazgeç
                  </button>

                  <button
                    type="button"
                    onClick={confirmSignOut}
                    className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-black text-white transition hover:bg-red-700"
                  >
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={closeModal}
                  className={`w-full rounded-xl px-4 py-3 text-sm font-black text-white transition ${
                    modalType === "success"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Tamam
                </button>
              )}

            </div>

          </div>

        </div>
      )}

    </main>
  );
}