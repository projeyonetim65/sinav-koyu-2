"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Mode = "login" | "signup" | "forgot";

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] =
    useState<Mode>("login");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [fullName, setFullName] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  /*
   * ---------------------------------------------------------
   * OTURUM KONTROLÜ
   * ---------------------------------------------------------
   *
   * Kullanıcı zaten giriş yaptıysa doğrudan
   * dashboard'a gönderiyoruz.
   *
   * ONBOARDING DEVRE DIŞI.
   */

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const {
          data: { session },
          error,
        } =
          await supabase.auth.getSession();

        if (error) {
          console.error(
            "Session kontrol hatası:",
            error.message
          );
        }

        /*
         * Kullanıcı zaten giriş yapmışsa
         * direkt dashboard'a git.
         */

        if (session?.user) {
          router.replace("/dashboard");
          return;
        }

        /*
         * Session yoksa giriş ekranını göster.
         */

        if (!cancelled) {
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "Oturum kontrolünde beklenmeyen hata:",
          error
        );

        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void checkSession();

    /*
     * Supabase auth değişikliklerini dinle.
     */

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (event, session) => {
          /*
           * Kullanıcı giriş yaptıysa
           * direkt dashboard'a gönder.
           *
           * ONBOARDING YOK.
           */

          if (
            session?.user &&
            (
              event === "SIGNED_IN" ||
              event === "INITIAL_SESSION" ||
              event === "USER_UPDATED"
            )
          ) {
            router.replace("/dashboard");
          }
        }
      );

    return () => {
      cancelled = true;

      subscription.unsubscribe();
    };
  }, [router]);

  /*
   * ---------------------------------------------------------
   * MOD DEĞİŞTİR
   * ---------------------------------------------------------
   */

  function switchMode(
    nextMode: Mode
  ) {
    setMode(nextMode);

    setErrorMessage("");

    setSuccessMessage("");

    setPassword("");
  }

  /*
   * ---------------------------------------------------------
   * FORM
   * ---------------------------------------------------------
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setErrorMessage("");

    setSuccessMessage("");

    const cleanEmail =
      email.trim().toLowerCase();

    /*
     * E-posta kontrolü
     */

    if (!cleanEmail) {
      setErrorMessage(
        "Lütfen e-posta adresini gir."
      );

      return;
    }

    /*
     * Şifre unutma
     */

    if (mode === "forgot") {
      await handleForgotPassword(
        cleanEmail
      );

      return;
    }

    /*
     * Şifre kontrolü
     */

    if (!password) {
      setErrorMessage(
        "Lütfen şifreni gir."
      );

      return;
    }

    /*
     * Kayıt şifresi
     */

    if (
      mode === "signup" &&
      password.length < 6
    ) {
      setErrorMessage(
        "Kayıt olmak için şifren en az 6 karakter olmalı."
      );

      return;
    }

    /*
     * Ad soyad
     */

    if (
      mode === "signup" &&
      !fullName.trim()
    ) {
      setErrorMessage(
        "Lütfen adını ve soyadını gir."
      );

      return;
    }

    setSubmitting(true);

    try {
      /*
       * GİRİŞ
       */

      if (mode === "login") {
        await handleLogin(
          cleanEmail,
          password
        );

        return;
      }

      /*
       * KAYIT
       */

      if (mode === "signup") {
        await handleSignup(
          cleanEmail,
          password
        );

        return;
      }
    } catch (error) {
      console.error(
        "Auth işlemi hatası:",
        error
      );

      setErrorMessage(
        "Bir bağlantı hatası oluştu. Lütfen tekrar dene."
      );

      setSubmitting(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * GİRİŞ
   * ---------------------------------------------------------
   */

  async function handleLogin(
    cleanEmail: string,
    cleanPassword: string
  ) {
    const {
      data,
      error,
    } =
      await supabase.auth.signInWithPassword(
        {
          email: cleanEmail,
          password: cleanPassword,
        }
      );

    if (error) {
      setErrorMessage(
        getLoginErrorMessage(
          error.message
        )
      );

      setSubmitting(false);

      return;
    }

    if (!data.user) {
      setErrorMessage(
        "Giriş yapılamadı. Lütfen tekrar dene."
      );

      setSubmitting(false);

      return;
    }

    /*
     * -------------------------------------------------------
     * BAŞARILI GİRİŞ
     * -------------------------------------------------------
     *
     * ONBOARDING YOK.
     *
     * Kullanıcı doğrudan dashboard'a gider.
     */

    router.replace("/dashboard");
  }

  /*
   * ---------------------------------------------------------
   * KAYIT
   * ---------------------------------------------------------
   */

  async function handleSignup(
    cleanEmail: string,
    cleanPassword: string
  ) {
    const {
      data,
      error,
    } =
      await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,

        options: {
          data: {
            full_name:
              fullName.trim(),
          },

          /*
           * E-posta doğrulaması sonrası
           * kullanıcı tekrar auth sayfasına gelir.
           */

          emailRedirectTo:
            `${window.location.origin}/auth`,
        },
      });

    /*
     * Supabase hata verdi.
     */

    if (error) {
      setErrorMessage(
        getAuthErrorMessage(
          error.message
        )
      );

      setSubmitting(false);

      return;
    }

    /*
     * Mevcut e-posta kontrolü.
     */

    if (
      data.user &&
      data.user.identities &&
      data.user.identities.length === 0
    ) {
      setErrorMessage(
        "Bu e-posta adresiyle zaten bir hesap var. Lütfen giriş yap."
      );

      setSubmitting(false);

      return;
    }

    /*
     * -------------------------------------------------------
     * SESSION VARSA
     * -------------------------------------------------------
     *
     * Email confirmation kapalıysa kullanıcı
     * direkt giriş yapmış olur.
     *
     * ONBOARDING YOK.
     */

    if (
      data.session &&
      data.user
    ) {
      router.replace("/dashboard");

      return;
    }

    /*
     * -------------------------------------------------------
     * EMAIL CONFIRMATION AÇIKSA
     * -------------------------------------------------------
     */

    setSuccessMessage(
      "Hesabın oluşturuldu. E-posta adresine gönderdiğimiz doğrulama bağlantısına tıkla. Doğrulama tamamlandığında giriş yapabilirsin."
    );

    setMode("login");

    setPassword("");

    setSubmitting(false);
  }

  /*
   * ---------------------------------------------------------
   * ŞİFRE SIFIRLAMA
   * ---------------------------------------------------------
   */

  async function handleForgotPassword(
    cleanEmail: string
  ) {
    setSubmitting(true);

    try {
      const {
        error,
      } =
        await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo:
              `${window.location.origin}/reset-password`,
          }
        );

      if (error) {
        setErrorMessage(
          "Şifre sıfırlama bağlantısı gönderilemedi. Lütfen biraz sonra tekrar dene."
        );

        setSubmitting(false);

        return;
      }

      setSuccessMessage(
        "Şifre sıfırlama bağlantısı e-posta adresine gönderildi. Gelen kutunu ve spam klasörünü kontrol et."
      );

      setSubmitting(false);
    } catch (error) {
      console.error(
        "Şifre sıfırlama hatası:",
        error
      );

      setErrorMessage(
        "Bir bağlantı hatası oluştu. Lütfen tekrar dene."
      );

      setSubmitting(false);
    }
  }

  /*
   * ---------------------------------------------------------
   * GİRİŞ HATALARI
   * ---------------------------------------------------------
   */

  function getLoginErrorMessage(
    message: string
  ) {
    const lowerMessage =
      message.toLowerCase();

    if (
      lowerMessage.includes(
        "invalid login credentials"
      )
    ) {
      return "E-posta veya şifre hatalı.";
    }

    if (
      lowerMessage.includes(
        "email not confirmed"
      )
    ) {
      return "Önce e-posta adresini doğrulaman gerekiyor.";
    }

    if (
      lowerMessage.includes(
        "too many requests"
      ) ||
      lowerMessage.includes(
        "rate limit"
      )
    ) {
      return "Çok fazla giriş denemesi yapıldı. Birkaç dakika sonra tekrar dene.";
    }

    if (
      lowerMessage.includes(
        "network"
      ) ||
      lowerMessage.includes(
        "fetch"
      )
    ) {
      return "Bağlantı kurulamadı. İnternet bağlantını kontrol edip tekrar dene.";
    }

    return "E-posta veya şifre hatalı.";
  }

  /*
   * ---------------------------------------------------------
   * KAYIT HATALARI
   * ---------------------------------------------------------
   */

  function getAuthErrorMessage(
    message: string
  ) {
    const lowerMessage =
      message.toLowerCase();

    if (
      lowerMessage.includes(
        "user already registered"
      ) ||
      lowerMessage.includes(
        "email_exists"
      ) ||
      lowerMessage.includes(
        "already registered"
      )
    ) {
      return "Bu e-posta adresiyle zaten bir hesap var. Lütfen giriş yap.";
    }

    if (
      lowerMessage.includes(
        "password should be at least"
      )
    ) {
      return "Şifre en az 6 karakter olmalı.";
    }

    if (
      lowerMessage.includes(
        "rate limit"
      ) ||
      lowerMessage.includes(
        "too many requests"
      )
    ) {
      return "Çok fazla işlem yapıldı. Birkaç dakika sonra tekrar dene.";
    }

    if (
      lowerMessage.includes(
        "email address"
      ) &&
      lowerMessage.includes(
        "invalid"
      )
    ) {
      return "Geçerli bir e-posta adresi gir.";
    }

    if (
      lowerMessage.includes(
        "network"
      ) ||
      lowerMessage.includes(
        "fetch"
      )
    ) {
      return "Bağlantı kurulamadı. İnternet bağlantını kontrol edip tekrar dene.";
    }

    return "Hesap oluşturulurken bir hata oluştu. Lütfen tekrar dene.";
  }

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Yükleniyor...
          </p>

        </div>
      </main>
    );
  }

  /*
   * ---------------------------------------------------------
   * SAYFA
   * ---------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-slate-50">

      <header className="border-b border-slate-100 bg-white">

        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <button
            type="button"
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
            type="button"
            onClick={() =>
              router.push("/")
            }
            className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          >
            ← Ana Sayfa
          </button>

        </div>

      </header>

      <section className="relative flex min-h-[calc(100vh-5rem)] items-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">

        <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />

        <div className="absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-violet-200/30 blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-2">

          <div className="hidden lg:block">

            <div className="max-w-lg">

              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-xs font-black text-indigo-600 shadow-sm">
                🎯 YKS hazırlık platformu
              </div>

              <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight text-slate-900">

                Hedefine giden

                <span className="block text-indigo-600">
                  yolu birlikte planla.
                </span>

              </h1>

              <p className="mt-5 text-base leading-7 text-slate-500">

                Hedeflerini, görevlerini,
                konularını, kaynaklarını ve
                deneme sonuçlarını tek bir
                yerde yönet.

              </p>

              <div className="mt-8 space-y-4">

                {[
                  "Hedeflerini belirle",
                  "Günlük görevlerini takip et",
                  "Eksik konularını gör",
                  "Deneme sonuçlarını kaydet",
                  "İlerlemeni analiz et",
                ].map((item) => (

                  <div
                    key={item}
                    className="flex items-center gap-3"
                  >

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-sm font-black text-emerald-600">
                      ✓
                    </div>

                    <span className="text-sm font-bold text-slate-700">
                      {item}
                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          <div className="mx-auto w-full max-w-md">

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">

              <div className="text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                  {mode === "login"
                    ? "👋"
                    : mode === "signup"
                    ? "🚀"
                    : "🔑"}
                </div>

                <h2 className="mt-5 text-2xl font-black text-slate-900">

                  {mode === "login"
                    ? "Tekrar hoş geldin!"
                    : mode === "signup"
                    ? "Sınav Köyü'ne katıl"
                    : "Şifreni mi unuttun?"}

                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">

                  {mode === "login"
                    ? "Hesabına giriş yap ve çalışmaya devam et."
                    : mode === "signup"
                    ? "Hesabını oluştur ve YKS hazırlığını düzenlemeye başla."
                    : "E-posta adresini gir. Sana şifre sıfırlama bağlantısı gönderelim."}

                </p>

              </div>

              {mode !== "forgot" && (

                <div className="mt-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1">

                  <button
                    type="button"
                    onClick={() =>
                      switchMode("login")
                    }
                    disabled={submitting}
                    className={`rounded-lg py-2.5 text-sm font-black transition ${
                      mode === "login"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    Giriş Yap
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      switchMode("signup")
                    }
                    disabled={submitting}
                    className={`rounded-lg py-2.5 text-sm font-black transition ${
                      mode === "signup"
                        ? "bg-white text-indigo-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    } disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    Kayıt Ol
                  </button>

                </div>

              )}

              {errorMessage && (

                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm font-semibold leading-5 text-red-600"
                >
                  {errorMessage}
                </div>

              )}

              {successMessage && (

                <div
                  role="status"
                  className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-3.5 text-sm font-semibold leading-5 text-emerald-600"
                >
                  {successMessage}
                </div>

              )}

              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-4"
              >

                {mode === "signup" && (

                  <div>

                    <label
                      htmlFor="fullName"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Ad Soyad
                    </label>

                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(event) =>
                        setFullName(
                          event.target.value
                        )
                      }
                      placeholder="Örn: Ahmet Yılmaz"
                      autoComplete="name"
                      disabled={submitting}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />

                  </div>

                )}

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    E-posta
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    placeholder="ornek@mail.com"
                    autoComplete="email"
                    disabled={submitting}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />

                </div>

                {mode !== "forgot" && (

                  <div>

                    <div className="mb-2 flex items-center justify-between">

                      <label
                        htmlFor="password"
                        className="block text-sm font-bold text-slate-700"
                      >
                        Şifre
                      </label>

                      {mode === "signup" && (

                        <span className="text-xs font-semibold text-slate-400">
                          En az 6 karakter
                        </span>

                      )}

                    </div>

                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="••••••••"
                      autoComplete={
                        mode === "login"
                          ? "current-password"
                          : "new-password"
                      }
                      disabled={submitting}
                      required
                      minLength={6}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />

                  </div>

                )}

                {mode === "login" && (

                  <div className="flex justify-end">

                    <button
                      type="button"
                      onClick={() =>
                        switchMode("forgot")
                      }
                      disabled={submitting}
                      className="text-xs font-bold text-indigo-600 transition hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Şifremi unuttum
                    </button>

                  </div>

                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {submitting
                    ? mode === "login"
                      ? "Giriş yapılıyor..."
                      : mode === "signup"
                      ? "Hesap oluşturuluyor..."
                      : "Bağlantı gönderiliyor..."
                    : mode === "login"
                    ? "Giriş Yap →"
                    : mode === "signup"
                    ? "Hesap Oluştur →"
                    : "Sıfırlama Bağlantısı Gönder →"}

                </button>

              </form>

              <div className="mt-6 border-t border-slate-100 pt-5 text-center">

                {mode === "forgot" ? (

                  <>
                    <p className="text-xs leading-5 text-slate-400">
                      Şifreni hatırladın mı?
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        switchMode("login")
                      }
                      disabled={submitting}
                      className="mt-1 text-sm font-black text-indigo-600 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      ← Giriş yap
                    </button>
                  </>

                ) : (

                  <>

                    <p className="text-xs leading-5 text-slate-400">

                      {mode === "login"
                        ? "Henüz hesabın yok mu?"
                        : "Zaten hesabın var mı?"}

                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        switchMode(
                          mode === "login"
                            ? "signup"
                            : "login"
                        )
                      }
                      disabled={submitting}
                      className="mt-1 text-sm font-black text-indigo-600 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {mode === "login"
                        ? "Ücretsiz hesap oluştur"
                        : "Giriş yap"}

                    </button>

                  </>

                )}

              </div>

            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">

              <span>🔒</span>

              <span>
                Hesabın güvenli şekilde korunuyor.
              </span>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}