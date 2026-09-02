"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

type Village = {
  id: number;
  user_id: string;
  level: number;
  experience: number;
  created_at?: string;
  updated_at?: string;
};

type Building = {
  id: number;
  user_id: string;
  village_id: number;
  building_type: string;
  level: number;
  position_x: number;
  position_y: number;
  created_at?: string;
  updated_at?: string;
};

type Gamification = {
  xp: number;
  level: number;
  completed_pomodoros: number;
  total_pomodoros: number;
};

const BUILDINGS = [
  {
    type: "house",
    name: "Ev",
    icon: "🏠",
    description: "Köyünün başlangıç noktası.",
    position_x: 1,
    position_y: 1,
  },
  {
    type: "library",
    name: "Kütüphane",
    icon: "📚",
    description: "Bilgi ve öğrenme merkezinin.",
    position_x: 2,
    position_y: 1,
  },
  {
    type: "academy",
    name: "Akademi",
    icon: "🏫",
    description: "Hedeflerine hazırlandığın merkez.",
    position_x: 1,
    position_y: 2,
  },
  {
    type: "park",
    name: "Park",
    icon: "🌳",
    description: "Köyünün dinlenme alanı.",
    position_x: 2,
    position_y: 2,
  },
];

const XP_PER_LEVEL = 100;

export default function VillagePage() {
  const [village, setVillage] =
    useState<Village | null>(null);

  const [buildings, setBuildings] =
    useState<Building[]>([]);

  const [gamification, setGamification] =
    useState<Gamification | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    loadVillage();
  }, []);

  async function loadVillage() {
    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.replace("/auth");
      return;
    }

    /*
     * --------------------------------------------------
     * GAMIFICATION
     * --------------------------------------------------
     */

    const {
      data: gamificationData,
      error: gamificationError,
    } = await supabase
      .from("user_gamification")
      .select(
        "xp, level, completed_pomodoros, total_pomodoros"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (gamificationError) {
      console.error(
        "Gamification yükleme hatası:",
        gamificationError.message,
        gamificationError.details,
        gamificationError.hint,
        gamificationError.code
      );
    }

    setGamification(
      gamificationData || null
    );

    /*
     * --------------------------------------------------
     * KÖY KAYDINI BUL
     * --------------------------------------------------
     */

    let {
      data: villageData,
      error: villageError,
    } = await supabase
      .from("village")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    /*
     * --------------------------------------------------
     * KÖY YOKSA OLUŞTUR
     * --------------------------------------------------
     */

    if (!villageData && !villageError) {
      const {
        data: createdVillage,
        error: createVillageError,
      } = await supabase
        .from("village")
        .insert({
          user_id: user.id,
          level: 1,
          experience: 0,
        })
        .select("*")
        .single();

      /*
       * --------------------------------------------------
       * AYNI ANDA BAŞKA İŞLEM KÖY OLUŞTURDUYSA
       *
       * 23505 = unique constraint violation
       *
       * Bu durumda hata göstermek yerine mevcut köyü
       * tekrar okuyacağız.
       * --------------------------------------------------
       */

      if (
        createVillageError &&
        createVillageError.code === "23505"
      ) {
        const {
          data: existingVillage,
          error: existingVillageError,
        } = await supabase
          .from("village")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (existingVillageError) {
          console.error(
            "Mevcut köy okunamadı:",
            existingVillageError.message,
            existingVillageError.details,
            existingVillageError.hint,
            existingVillageError.code
          );

          setErrorMessage(
            "Mevcut köy bilgileri okunamadı. Lütfen tekrar dene."
          );

          setLoading(false);
          return;
        }

        villageData =
          existingVillage;
      } else if (createVillageError) {
        console.error(
          "Köy oluşturma hatası:",
          createVillageError.message,
          createVillageError.details,
          createVillageError.hint,
          createVillageError.code
        );

        setErrorMessage(
          "Köyün oluşturulamadı. Lütfen tekrar dene."
        );

        setLoading(false);
        return;
      } else {
        villageData =
          createdVillage;
      }
    }

    if (villageError) {
      console.error(
        "Köy yükleme hatası:",
        villageError.message,
        villageError.details,
        villageError.hint,
        villageError.code
      );

      setErrorMessage(
        "Köy bilgileri yüklenemedi. Lütfen tekrar dene."
      );

      setLoading(false);
      return;
    }

    if (!villageData) {
      setErrorMessage(
        "Köy bilgileri bulunamadı."
      );

      setLoading(false);
      return;
    }

    setVillage(villageData);

    /*
     * --------------------------------------------------
     * BİNALARI BUL
     * --------------------------------------------------
     */

    const {
      data: buildingData,
      error: buildingError,
    } = await supabase
      .from("village_buildings")
      .select("*")
      .eq("user_id", user.id)
      .eq(
        "village_id",
        villageData.id
      )
      .order("id", {
        ascending: true,
      });

    if (buildingError) {
      console.error(
        "Bina yükleme hatası:",
        buildingError.message,
        buildingError.details,
        buildingError.hint,
        buildingError.code
      );

      setErrorMessage(
        "Köy binaları yüklenemedi. Lütfen tekrar dene."
      );

      setLoading(false);
      return;
    }

    /*
     * --------------------------------------------------
     * BİNALAR YOKSA BAŞLANGIÇ BİNALARINI OLUŞTUR
     * --------------------------------------------------
     */

    let currentBuildings =
      buildingData || [];

    if (currentBuildings.length === 0) {
      const buildingsToInsert =
        BUILDINGS.map(
          (building) => ({
            user_id: user.id,
            village_id:
              villageData.id,
            building_type:
              building.type,
            level: 1,
            position_x:
              building.position_x,
            position_y:
              building.position_y,
          })
        );

      const {
        data: createdBuildings,
        error:
          createBuildingsError,
      } = await supabase
        .from("village_buildings")
        .insert(
          buildingsToInsert
        )
        .select("*");

      if (createBuildingsError) {
        console.error(
          "Başlangıç binaları oluşturma hatası:",
          createBuildingsError.message,
          createBuildingsError.details,
          createBuildingsError.hint,
          createBuildingsError.code
        );

        setErrorMessage(
          "Köy binaları oluşturulamadı. Lütfen tekrar dene."
        );

        setLoading(false);
        return;
      }

      currentBuildings =
        createdBuildings || [];
    }

    setBuildings(
      currentBuildings
    );

    setLoading(false);
  }

  /*
   * --------------------------------------------------
   * KÖY SEVİYESİ
   * --------------------------------------------------
   */

  const villageLevel =
    village?.level || 1;

  const villageXP =
    village?.experience || 0;

  const currentLevelXP =
    villageXP %
    XP_PER_LEVEL;

  const nextLevelXP =
    XP_PER_LEVEL;

  const progressPercentage =
    Math.min(
      100,
      (currentLevelXP /
        nextLevelXP) *
        100
    );

  const totalPomodoros =
    gamification?.total_pomodoros ||
    gamification?.completed_pomodoros ||
    0;

  /*
   * --------------------------------------------------
   * BİNA BİLGİSİ
   * --------------------------------------------------
   */

  function getBuildingInfo(
    type: string
  ) {
    return (
      BUILDINGS.find(
        (building) =>
          building.type === type
      ) || {
        type,
        name: "Bina",
        icon: "🏗️",
        description:
          "Köyünün gelişim yapılarından biri.",
        position_x: 0,
        position_y: 0,
      }
    );
  }

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
            🏡
          </div>

          <p className="mt-4 font-semibold text-slate-600">
            Köyün hazırlanıyor...
          </p>
        </div>
      </main>
    );
  }

  /*
   * --------------------------------------------------
   * HATA
   * --------------------------------------------------
   */

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="flex min-h-screen">
          <Sidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <Header />

            <div className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-4 py-10">
              <div className="w-full rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
                <div className="text-5xl">
                  😕
                </div>

                <h1 className="mt-4 text-2xl font-black text-slate-900">
                  Köy yüklenemedi
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                  {errorMessage}
                </p>

                <button
                  type="button"
                  onClick={loadVillage}
                  className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-black text-white transition hover:bg-indigo-700"
                >
                  Tekrar Dene
                </button>
              </div>
            </div>
          </div>
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
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">
                <span>🏡</span>

                <span>
                  GELİŞİM ALANI
                </span>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                    Köyüm
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                    Çalıştıkça gelişen,
                    senin emeğinle büyüyen
                    kendi köyün.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadVillage}
                  className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-100"
                >
                  ↻ Yenile
                </button>
              </div>
            </div>

            {/* LEVEL CARD */}

            <section className="mb-6 overflow-hidden rounded-3xl bg-indigo-600 p-6 text-white shadow-sm sm:p-8">

              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-indigo-200">
                    KÖY SEVİYESİ
                  </p>

                  <div className="mt-2 flex items-end gap-3">
                    <p className="text-6xl font-black">
                      {villageLevel}
                    </p>

                    <p className="pb-2 text-sm font-bold text-indigo-200">
                      SEVİYE
                    </p>
                  </div>

                  <p className="mt-2 text-sm text-indigo-100">
                    Her tamamlanan Pomodoro
                    köyünün gelişimine katkı
                    sağlar.
                  </p>
                </div>

                <div className="w-full max-w-md">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-200">
                    <span>
                      {currentLevelXP} XP
                    </span>

                    <span>
                      Sonraki seviye:{" "}
                      {nextLevelXP} XP
                    </span>
                  </div>

                  <div className="mt-2 h-4 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-white transition-all"
                      style={{
                        width: `${progressPercentage}%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-indigo-200">
                    {Math.max(
                      0,
                      nextLevelXP -
                        currentLevelXP
                    )}{" "}
                    XP sonra köyün
                    seviye atlayacak.
                  </p>
                </div>

              </div>

            </section>

            {/* STATS */}

            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-400">
                  Köy Seviyesi
                </p>

                <p className="mt-2 text-3xl font-black text-indigo-600">
                  {villageLevel}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-400">
                  Köy Deneyimi
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900">
                  {villageXP}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  XP
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-400">
                  Toplam Pomodoro
                </p>

                <p className="mt-2 text-3xl font-black text-emerald-600">
                  {totalPomodoros}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-400">
                  Bina Sayısı
                </p>

                <p className="mt-2 text-3xl font-black text-slate-900">
                  {buildings.length}
                </p>
              </div>

            </div>

            {/* VILLAGE */}

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">

              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    Köyün
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Çalışma ilerlemenle birlikte
                    büyüyen gelişim alanın.
                  </p>
                </div>

                <div className="rounded-xl bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-600">
                  🍅 Pomodoro ile gelişir
                </div>
              </div>

              {/* VILLAGE MAP */}

              <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b from-emerald-50 to-slate-50 p-4 sm:p-8">

                <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:gap-6">

                  {buildings.map(
                    (building) => {
                      const info =
                        getBuildingInfo(
                          building.building_type
                        );

                      return (
                        <div
                          key={
                            building.id
                          }
                          className="group rounded-3xl border border-white bg-white/90 p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-8"
                        >
                          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-5xl transition group-hover:scale-105 sm:h-24 sm:w-24 sm:text-6xl">
                            {info.icon}
                          </div>

                          <h3 className="mt-4 text-lg font-black text-slate-900">
                            {info.name}
                          </h3>

                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            {info.description}
                          </p>

                          <div className="mt-4 inline-flex rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-600">
                            Seviye{" "}
                            {building.level}
                          </div>
                        </div>
                      );
                    }
                  )}

                </div>

              </div>

            </section>

            {/* HOW IT WORKS */}

            <section className="mt-6 rounded-3xl border border-indigo-100 bg-indigo-50 p-6 sm:p-8">

              <div className="flex gap-4">
                <div className="text-3xl">
                  💡
                </div>

                <div>
                  <h2 className="font-black text-indigo-900">
                    Köyün nasıl gelişiyor?
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-indigo-700">
                    Pomodoro'da bir çalışma
                    seansını tamamladığında
                    sistem sana XP kazandırır.
                    Bu XP, Köyüm bölümünde
                    deneyime dönüşür. Deneyimin
                    arttıkça köyün seviye atlar
                    ve zamanla binaların da
                    gelişir.
                  </p>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">

                    <div className="rounded-2xl bg-white/70 p-4">
                      <p className="text-xl">
                        🍅
                      </p>

                      <p className="mt-2 text-sm font-black text-indigo-900">
                        Pomodoro
                      </p>

                      <p className="mt-1 text-xs text-indigo-600">
                        Gerçek çalışma
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/70 p-4">
                      <p className="text-xl">
                        ⭐
                      </p>

                      <p className="mt-2 text-sm font-black text-indigo-900">
                        XP
                      </p>

                      <p className="mt-1 text-xs text-indigo-600">
                        Çalışma ödülü
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/70 p-4">
                      <p className="text-xl">
                        🏡
                      </p>

                      <p className="mt-2 text-sm font-black text-indigo-900">
                        Köy
                      </p>

                      <p className="mt-1 text-xs text-indigo-600">
                        Gelişim
                      </p>
                    </div>

                  </div>
                </div>
              </div>

            </section>

          </div>
        </div>
      </div>
    </main>
  );
}