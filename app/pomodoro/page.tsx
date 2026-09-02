"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

type Gamification = {
  id: number;
  user_id: string;
  xp: number;
  created_at?: string;
  updated_at?: string;
};

type PomodoroSession = {
  id: number;
  user_id: string;
  duration_minutes: number;
  completed_at: string | null;
  created_at?: string;
};

export default function PomodoroPage() {
  const [gamification, setGamification] =
    useState<Gamification | null>(null);

  const [sessions, setSessions] =
    useState<PomodoroSession[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [isRunning, setIsRunning] =
    useState(false);

  const [duration, setDuration] =
    useState(25);

  const [timeLeft, setTimeLeft] =
    useState(25 * 60);

  const [mode, setMode] =
    useState<"work" | "break">("work");

  const [message, setMessage] =
    useState("");

  /*
   * --------------------------------------------------
   * SAYFA AÇILDIĞINDA
   * --------------------------------------------------
   */

  useEffect(() => {
    loadData();
  }, []);

  /*
   * --------------------------------------------------
   * TIMER
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!isRunning) return;

    if (timeLeft <= 0) {
      finishTimer();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  /*
   * --------------------------------------------------
   * VERİLERİ YÜKLE
   * --------------------------------------------------
   */

  async function loadData() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.replace("/auth");
      return;
    }

    /*
     * GAMIFICATION
     */

    const {
      data: gamificationData,
      error: gamificationError,
    } = await supabase
      .from("user_gamification")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (gamificationError) {
      console.error(
        "Oyunlaştırma verisi yükleme hatası:",
        gamificationError.message,
        gamificationError.details,
        gamificationError.hint,
        gamificationError.code
      );
    }

    /*
     * Eğer kullanıcının gamification kaydı yoksa oluştur.
     */

    let currentGamification =
      gamificationData;

    if (!currentGamification) {
      const {
        data: createdData,
        error: createError,
      } = await supabase
        .from("user_gamification")
        .insert({
          user_id: user.id,
          xp: 0,
        })
        .select("*")
        .single();

      if (createError) {
        console.error(
          "Oyunlaştırma kaydı oluşturma hatası:",
          createError.message,
          createError.details,
          createError.hint,
          createError.code
        );
      } else {
        currentGamification =
          createdData;
      }
    }

    /*
     * POMODORO KAYITLARI
     */

    const {
      data: sessionData,
      error: sessionError,
    } = await supabase
      .from("pomodoro_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("completed_at", {
        ascending: false,
        nullsFirst: false,
      });

    if (sessionError) {
      console.error(
        "Pomodoro verisi yükleme hatası:",
        sessionError.message,
        sessionError.details,
        sessionError.hint,
        sessionError.code
      );
    }

    setGamification(
      currentGamification || null
    );

    setSessions(
      sessionData || []
    );

    setLoading(false);
  }

  /*
   * --------------------------------------------------
   * TIMER SÜRESİ DEĞİŞTİRME
   * --------------------------------------------------
   */

  function changeDuration(
    minutes: number
  ) {
    if (isRunning) return;

    const safeDuration =
      Math.max(
        1,
        Math.min(minutes, 180)
      );

    setDuration(safeDuration);
    setTimeLeft(
      safeDuration * 60
    );
  }

  /*
   * --------------------------------------------------
   * TIMER BAŞLAT
   * --------------------------------------------------
   */

  function startTimer() {
    if (timeLeft <= 0) {
      setTimeLeft(
        duration * 60
      );
    }

    setIsRunning(true);
    setMessage("");
  }

  /*
   * --------------------------------------------------
   * TIMER DURDUR
   * --------------------------------------------------
   */

  function pauseTimer() {
    setIsRunning(false);
  }

  /*
   * --------------------------------------------------
   * TIMER SIFIRLA
   * --------------------------------------------------
   */

  function resetTimer() {
    setIsRunning(false);

    setMode("work");

    setTimeLeft(
      duration * 60
    );

    setMessage("");
  }

  /*
   * --------------------------------------------------
   * TIMER TAMAMLANDI
   * --------------------------------------------------
   */

  async function finishTimer() {
    setIsRunning(false);

    if (mode === "break") {
      setMode("work");

      setTimeLeft(
        duration * 60
      );

      setMessage(
        "Mola bitti. Yeni bir çalışma turuna hazırsın."
      );

      return;
    }

    await completePomodoro();
  }

  /*
   * --------------------------------------------------
   * POMODORO TAMAMLA
   * --------------------------------------------------
   */

  async function completePomodoro() {
    if (saving) return;

    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.replace("/auth");
      return;
    }

    /*
     * 1 Pomodoro = 10 XP
     */

    const earnedXP = 10;

    /*
     * POMODORO KAYDI
     */

    const {
      data: newSession,
      error: sessionError,
    } = await supabase
      .from("pomodoro_sessions")
      .insert({
        user_id: user.id,
        duration_minutes:
          duration,
        completed_at:
          new Date().toISOString(),
      })
      .select("*")
      .single();

    if (sessionError) {
      console.error(
        "Pomodoro kaydetme hatası:",
        sessionError.message,
        sessionError.details,
        sessionError.hint,
        sessionError.code
      );

      setMessage(
        "Pomodoro kaydedilemedi."
      );

      setSaving(false);
      return;
    }

    /*
     * --------------------------------------------------
     * GAMIFICATION XP
     * --------------------------------------------------
     */

    let currentXP =
      gamification?.xp || 0;

    const newXP =
      currentXP + earnedXP;

    const {
      data: updatedGamification,
      error: gamificationError,
    } =
      await supabase
        .from("user_gamification")
        .update({
          xp: newXP,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "user_id",
          user.id
        )
        .select("*")
        .single();

    if (gamificationError) {
      console.error(
        "XP güncelleme hatası:",
        gamificationError.message,
        gamificationError.details,
        gamificationError.hint,
        gamificationError.code
      );

      setMessage(
        "Pomodoro tamamlandı ancak XP güncellenirken bir sorun oluştu."
      );
    } else {
      setGamification(
        updatedGamification
      );
    }

    /*
     * --------------------------------------------------
     * KÖY XP
     *
     * 1 Pomodoro = +10 Köy XP
     * 100 XP = +1 Köy seviyesi
     * --------------------------------------------------
     */

    const {
      data: villageData,
      error: villageLoadError,
    } = await supabase
      .from("village")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (villageLoadError) {
      console.error(
        "Köy verisi yükleme hatası:",
        villageLoadError.message,
        villageLoadError.details,
        villageLoadError.hint,
        villageLoadError.code
      );
    } else {
      /*
       * Eğer Köy kaydı yoksa oluştur.
       */

      if (!villageData) {
        const {
          error: villageCreateError,
        } = await supabase
          .from("village")
          .insert({
            user_id: user.id,
            level: 1,
            experience: earnedXP,
          });

        if (villageCreateError) {
          console.error(
            "Köy oluşturma hatası:",
            villageCreateError.message,
            villageCreateError.details,
            villageCreateError.hint,
            villageCreateError.code
          );
        }
      } else {
        /*
         * Mevcut Köy XP'sini artır.
         */

        const currentVillageXP =
          Number(
            villageData.experience || 0
          );

        const newVillageXP =
          currentVillageXP +
          earnedXP;

        /*
         * Her 100 XP = 1 seviye.
         *
         * 0-99   => Seviye 1
         * 100-199 => Seviye 2
         * 200-299 => Seviye 3
         */

        const newVillageLevel =
          Math.floor(
            newVillageXP / 100
          ) + 1;

        const {
          error: villageUpdateError,
        } = await supabase
          .from("village")
          .update({
            experience:
              newVillageXP,
            level:
              newVillageLevel,
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "user_id",
            user.id
          );

        if (villageUpdateError) {
          console.error(
            "Köy XP güncelleme hatası:",
            villageUpdateError.message,
            villageUpdateError.details,
            villageUpdateError.hint,
            villageUpdateError.code
          );
        }
      }
    }

    /*
     * Yeni session'ı ekrana hemen ekle.
     */

    if (newSession) {
      setSessions((current) => [
        newSession,
        ...current,
      ]);
    }

    /*
     * Başarılı mesaj.
     */

    if (!gamificationError) {
      setMessage(
        `Pomodoro tamamlandı! +${earnedXP} XP kazandın. 🏡🚀`
      );
    }

    /*
     * Yeni timer.
     */

    setMode("break");

    setTimeLeft(5 * 60);

    setSaving(false);
  }

  /*
   * --------------------------------------------------
   * BUGÜNKÜ POMODOROLAR
   * --------------------------------------------------
   */

  const today =
    new Date();

  const todayString =
    today.toLocaleDateString(
      "en-CA"
    );

  const todaySessions =
    sessions.filter(
      (session) => {
        if (!session.completed_at) {
          return false;
        }

        const sessionDate =
          new Date(
            session.completed_at
          ).toLocaleDateString(
            "en-CA"
          );

        return (
          sessionDate ===
          todayString
        );
      }
    );

  const todayPomodoros =
    todaySessions.length;

  /*
   * --------------------------------------------------
   * TOPLAM POMODORO
   * --------------------------------------------------
   */

  const totalPomodoros =
    sessions.length;

  /*
   * --------------------------------------------------
   * TOPLAM ÇALIŞMA SÜRESİ
   * --------------------------------------------------
   */

  const totalMinutes =
    sessions.reduce(
      (total, session) =>
        total +
        Number(
          session.duration_minutes ||
            0
        ),
      0
    );

  const totalHours =
    Math.floor(
      totalMinutes / 60
    );

  const remainingMinutes =
    totalMinutes % 60;

  /*
   * --------------------------------------------------
   * TIMER FORMAT
   * --------------------------------------------------
   */

  const minutes =
    Math.floor(
      timeLeft / 60
    );

  const seconds =
    timeLeft % 60;

  const formattedTime =
    `${String(
      minutes
    ).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;

  /*
   * --------------------------------------------------
   * LOADING
   * --------------------------------------------------
   */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
            ⏱️
          </div>

          <p className="mt-4 font-semibold text-slate-600">
            Pomodoro yükleniyor...
          </p>
        </div>
      </main>
    );
  }

  /*
   * --------------------------------------------------
   * SAYFA
   * --------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header />

          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

            {/* HEADER */}

            <div className="mb-8">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                <span>⏱️</span>

                <span>
                  ODAKLANMA MERKEZİ
                </span>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Pomodoro
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Çalışma süreni yönet,
                Pomodoro'larını tamamla
                ve XP kazan.
              </p>
            </div>

            {/* MESSAGE */}

            {message && (
              <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm font-semibold text-indigo-700">
                {message}
              </div>
            )}

            {/* STATS */}

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-400">
                  Toplam XP
                </p>

                <p className="mt-2 text-3xl font-black text-indigo-600">
                  {gamification?.xp || 0}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-400">
                  Toplam Pomodoro
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900">
                  {totalPomodoros}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-400">
                  Bugün
                </p>

                <p className="mt-2 text-3xl font-black text-emerald-600">
                  {todayPomodoros}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-400">
                  Toplam Süre
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900">
                  {totalHours > 0
                    ? `${totalHours}s ${remainingMinutes}dk`
                    : `${remainingMinutes}dk`}
                </p>
              </div>

            </div>

            {/* MAIN */}

            <div className="grid gap-6 lg:grid-cols-3">

              {/* TIMER */}

              <section className="lg:col-span-2 rounded-3xl bg-white p-6 shadow-sm sm:p-10">

                <div className="text-center">

                  <p className="text-sm font-bold uppercase tracking-wider text-indigo-500">
                    {mode === "work"
                      ? "ÇALIŞMA"
                      : "MOLA"}
                  </p>

                  <div className="mt-6">

                    <p className="text-7xl font-black tracking-tight text-slate-900 sm:text-8xl">
                      {formattedTime}
                    </p>

                  </div>

                  <p className="mt-4 text-sm text-slate-400">
                    {mode === "work"
                      ? "Odaklan ve çalış."
                      : "Biraz dinlen ve nefes al."}
                  </p>

                </div>

                {/* CONTROLS */}

                <div className="mt-8 flex flex-wrap justify-center gap-3">

                  {!isRunning ? (
                    <button
                      onClick={
                        startTimer
                      }
                      disabled={
                        saving
                      }
                      className="rounded-xl bg-indigo-600 px-7 py-3 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      ▶ Başlat
                    </button>
                  ) : (
                    <button
                      onClick={
                        pauseTimer
                      }
                      className="rounded-xl bg-amber-500 px-7 py-3 text-sm font-black text-white shadow-sm transition hover:bg-amber-600"
                    >
                      ⏸ Duraklat
                    </button>
                  )}

                  <button
                    onClick={
                      resetTimer
                    }
                    className="rounded-xl bg-slate-100 px-7 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-200"
                  >
                    ↻ Sıfırla
                  </button>

                </div>

                {/* DURATION */}

                <div className="mt-10 border-t border-slate-100 pt-8">

                  <div className="text-center">

                    <h2 className="font-black text-slate-900">
                      Çalışma Süresi
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      Süreyi istediğin gibi
                      ayarlayabilirsin.
                    </p>

                  </div>

                  <div className="mt-5 flex flex-wrap justify-center gap-2">

                    {[15, 25, 30, 45, 50, 60].map(
                      (minute) => (
                        <button
                          key={
                            minute
                          }
                          disabled={
                            isRunning
                          }
                          onClick={() =>
                            changeDuration(
                              minute
                            )
                          }
                          className={`rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            duration ===
                            minute
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {minute} dk
                        </button>
                      )
                    )}

                  </div>

                  <div className="mx-auto mt-5 flex max-w-xs items-center gap-2">

                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={
                        duration
                      }
                      disabled={
                        isRunning
                      }
                      onChange={(
                        event
                      ) =>
                        changeDuration(
                          Number(
                            event
                              .target
                              .value
                          )
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-500"
                    />

                    <span className="text-sm font-bold text-slate-400">
                      dakika
                    </span>

                  </div>

                </div>

              </section>

              {/* XP CARD */}

              <section className="rounded-3xl bg-indigo-600 p-6 text-white shadow-sm">

                <p className="text-sm font-bold uppercase tracking-wider text-indigo-200">
                  OYUNLAŞTIRMA
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Çalış, XP kazan. 🚀
                </h2>

                <p className="mt-3 text-sm leading-6 text-indigo-100">
                  Tamamladığın her
                  Pomodoro sana XP
                  kazandırır. Kazandığın
                  XP aynı zamanda Köyü'nün
                  gelişmesini sağlar.
                </p>

                <div className="mt-8 rounded-2xl bg-white/10 p-5">

                  <p className="text-xs font-bold text-indigo-200">
                    1 POMODORO
                  </p>

                  <p className="mt-1 text-4xl font-black">
                    +10 XP
                  </p>

                </div>

                <div className="mt-4 rounded-2xl bg-white/10 p-5">

                  <p className="text-xs font-bold text-indigo-200">
                    BUGÜN
                  </p>

                  <p className="mt-1 text-3xl font-black">
                    {todayPomodoros} Pomodoro
                  </p>

                </div>

              </section>

            </div>

            {/* HISTORY */}

            <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Pomodoro Geçmişi
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Tamamladığın çalışma
                    seansları.
                  </p>
                </div>

                <button
                  onClick={
                    loadData
                  }
                  className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
                >
                  Yenile
                </button>

              </div>

              {sessions.length ===
              0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-10 text-center">

                  <div className="text-4xl">
                    ⏱️
                  </div>

                  <h3 className="mt-3 font-bold text-slate-900">
                    Henüz Pomodoro yok
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    İlk Pomodoro'nu
                    tamamladığında
                    burada görünecek.
                  </p>

                </div>
              ) : (
                <div className="mt-6 space-y-3">

                  {sessions
                    .slice(0, 20)
                    .map(
                      (
                        session
                      ) => {

                        const date =
                          session.completed_at
                            ? new Date(
                                session.completed_at
                              )
                            : null;

                        return (
                          <div
                            key={
                              session.id
                            }
                            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
                          >

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg">
                                🍅
                              </div>

                              <div>

                                <p className="text-sm font-bold text-slate-800">
                                  Pomodoro
                                  tamamlandı
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                  {date
                                    ? date.toLocaleDateString(
                                        "tr-TR"
                                      )
                                    : "-"}
                                </p>

                              </div>

                            </div>

                            <div className="text-right">

                              <p className="font-black text-indigo-600">
                                {
                                  session.duration_minutes
                                }{" "}
                                dk
                              </p>

                              <p className="mt-1 text-xs font-bold text-emerald-600">
                                +10 XP
                              </p>

                            </div>

                          </div>
                        );
                      }
                    )}

                </div>
              )}

            </section>

            {/* INFO */}

            <section className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">

              <div className="flex gap-4">

                <div className="text-2xl">
                  💡
                </div>

                <div>

                  <h3 className="font-black text-indigo-900">
                    Sistem nasıl çalışıyor?
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-indigo-700">
                    Çalışma süresini
                    kendin belirle.
                    Pomodoro'yu tamamla,
                    sistem otomatik olarak
                    kaydetsin ve +10 XP
                    kazandırsın. Biriken
                    XP'ler Köyü'nün
                    seviyesini ve gelişimini
                    artırır.
                  </p>

                </div>

              </div>

            </section>

          </div>
        </div>
      </div>
    </main>
  );
}