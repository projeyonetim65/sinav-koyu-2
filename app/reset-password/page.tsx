"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [recoveryReady, setRecoveryReady] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) {
          return;
        }

        console.log(
          "Auth event:",
          event
        );

        if (
          event === "PASSWORD_RECOVERY" &&
          session?.user
        ) {
          setRecoveryReady(true);
          setErrorMessage("");
          setLoading(false);
        }
      }
    );

    async function initializeRecovery() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      /*
       * Supabase recovery bağlantısı açıldığında
       * PASSWORD_RECOVERY event'i normalde çalışır.
       *
       * Eğer session zaten mevcutsa ve recovery event'i
       * henüz gelmemişse kısa bir süre bekliyoruz.
       */

      if (session?.user) {
        setRecoveryReady(true);
        setLoading(false);
        return;
      }

      /*
       * Recovery session bulunamadı.
       */

      setErrorMessage(
        "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş olabilir."
      );

      setLoading(false);
    }

    initializeRecovery();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!recoveryReady) {
      setErrorMessage(
        "Şifre sıfırlama oturumu geçerli değil. Lütfen e-postandaki bağlantıyı tekrar aç."
      );
      return;
    }

    if (!newPassword) {
      setErrorMessage(
        "Lütfen yeni şifreni gir."
      );
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage(
        "Şifre en az 6 karakter olmalı."
      );
      return;
    }

    if (!confirmPassword) {
      setErrorMessage(
        "Lütfen yeni şifreni tekrar gir."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(
        "Şifreler birbiriyle eşleşmiyor."
      );
      return;
    }

    setSaving(true);

    const { error } =
      await supabase.auth.updateUser({
        password: newPassword,
      });

    if (error) {
      console.error(
        "Şifre güncelleme hatası:",
        error.message,
        error.code
      );

      setErrorMessage(
        getPasswordErrorMessage(
          error.message
        )
      );

      setSaving(false);
      return;
    }

    /*
     * Şifre başarıyla değişti.
     */

    setSuccessMessage(
      "Şifren başarıyla yenilendi. Giriş sayfasına yönlendiriliyorsun..."
    );

    setNewPassword("");
    setConfirmPassword("");

    setRecoveryReady(false);

    /*
     * Recovery session'ını kapatıyoruz.
     *
     * Böylece başka bir component veya dashboard
     * kontrolü bu oturumu normal giriş olarak
     * değerlendirmeyecek.
     */

    await supabase.auth.signOut();

    /*
     * Kullanıcıyı dashboard'a değil,
     * normal giriş ekranına gönderiyoruz.
     */

    setTimeout(() => {
      router.replace("/auth");
    }, 1500);
  }

  function getPasswordErrorMessage(
    message: string
  ) {
    const lowerMessage =
      message.toLowerCase();

    if (
      lowerMessage.includes(
        "password should be at least"
      )
    ) {
      return "Şifre en az 6 karakter olmalı.";
    }

    if (
      lowerMessage.includes(
        "same password"
      )
    ) {
      return "Yeni şifren eski şifrenle aynı olamaz.";
    }

    if (
      lowerMessage.includes(
        "weak password"
      )
    ) {
      return "Bu şifre yeterince güçlü değil. Daha güçlü bir şifre seç.";
    }

    if (
      lowerMessage.includes(
        "session"
      )
    ) {
      return "Şifre sıfırlama oturumunun süresi dolmuş olabilir. Lütfen yeni bir sıfırlama bağlantısı iste.";
    }

    return "Şifre güncellenemedi. Lütfen tekrar dene.";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Şifre yenileme bağlantısı kontrol ediliyor...
          </p>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* TOP BAR */}

      <header className="border-b border-slate-100 bg-white">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <button
            onClick={() =>
              router.push("/")
            }
            className="text-2xl font-black tracking-tight"
          >
            Sınav
            <span className="text-indigo-600">
              Köyü
            </span>
          </button>

          <button
            onClick={() =>
              router.push("/auth")
            }
            className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            ← Giriş Yap
          </button>

        </div>

      </header>


      {/* CONTENT */}

      <section className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 py-10">

        <div className="w-full max-w-md">

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">

            {/* ICON */}

            <div className="text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
                🔐
              </div>

              <h1 className="mt-5 text-2xl font-black text-slate-900">
                Şifremi Yenile
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Hesabın için yeni ve güvenli
                bir şifre oluştur.
              </p>

            </div>


            {/* ERROR */}

            {errorMessage && (
              <div className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold leading-5 text-red-600">
                {errorMessage}
              </div>
            )}


            {/* SUCCESS */}

            {successMessage && (
              <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold leading-5 text-emerald-600">
                {successMessage}
              </div>
            )}


            {/* INVALID RECOVERY */}

            {!recoveryReady &&
              !successMessage && (
                <div className="mt-7 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">

                  <div className="text-3xl">
                    🔗
                  </div>

                  <p className="mt-3 text-sm font-bold text-slate-900">
                    Geçerli sıfırlama oturumu bulunamadı.
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    E-postandaki şifre sıfırlama
                    bağlantısını kullanarak bu
                    sayfaya yeniden gel.
                  </p>

                  <button
                    onClick={() =>
                      router.replace("/auth")
                    }
                    className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white transition hover:bg-indigo-700"
                  >
                    Giriş Sayfasına Dön
                  </button>

                </div>
              )}


            {/* FORM */}

            {recoveryReady &&
              !successMessage && (
                <form
                  onSubmit={handleSubmit}
                  className="mt-7 space-y-5"
                >

                  {/* NEW PASSWORD */}

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Yeni Şifre
                    </label>

                    <input
                      type="password"
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(
                          event.target.value
                        )
                      }
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                    />

                    <p className="mt-2 text-xs font-semibold text-slate-400">
                      En az 6 karakter
                    </p>

                  </div>


                  {/* CONFIRM PASSWORD */}

                  <div>

                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Yeni Şifre Tekrar
                    </label>

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={`w-full rounded-xl border bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                        confirmPassword &&
                        newPassword !==
                          confirmPassword
                          ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                          : confirmPassword &&
                            newPassword ===
                              confirmPassword
                          ? "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-50"
                          : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-50"
                      }`}
                    />

                    {confirmPassword && (
                      <p
                        className={`mt-2 text-xs font-semibold ${
                          newPassword ===
                          confirmPassword
                            ? "text-emerald-600"
                            : "text-red-500"
                        }`}
                      >
                        {newPassword ===
                        confirmPassword
                          ? "✓ Şifreler eşleşiyor."
                          : "Şifreler eşleşmiyor."}
                      </p>
                    )}

                  </div>


                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Şifre yenileniyor..."
                      : "Şifremi Yenile →"}
                  </button>

                </form>
              )}


            {/* BOTTOM */}

            <div className="mt-6 border-t border-slate-100 pt-5 text-center">

              <button
                onClick={() =>
                  router.push("/auth")
                }
                className="text-sm font-black text-indigo-600 transition hover:text-indigo-700"
              >
                ← Giriş sayfasına dön
              </button>

            </div>

          </div>


          {/* SECURITY */}

          <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
            <span>🔒</span>

            <span>
              Şifre sıfırlama işlemin güvenli şekilde korunuyor.
            </span>
          </div>

        </div>

      </section>

    </main>
  );
}