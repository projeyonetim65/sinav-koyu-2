"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error(
        "Header profil yükleme hatası:",
        error.message,
        error.details,
        error.hint,
        error.code
      );
      return;
    }

    setFullName(data?.full_name || "");
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Çıkış yapma hatası:", error.message);
      return;
    }

    setMenuOpen(false);
    router.push("/auth");
    router.refresh();
  }

  const firstName =
    fullName.trim().split(" ")[0] || "Profil";

  return (
    <>
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-100 bg-white/95 px-4 backdrop-blur md:px-6 lg:px-8">

        {/* MOBILE MENU BUTTON */}

        <button
          onClick={() => setMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-xl text-slate-700 transition hover:bg-slate-50 lg:hidden"
          aria-label="Menüyü aç"
          type="button"
        >
          ☰
        </button>

        {/* DESKTOP TITLE */}

        <div className="hidden lg:block">
          <p className="text-sm font-semibold text-slate-500">
            YKS hazırlık platformu
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            Hedefine bir adım daha yaklaş.
          </p>
        </div>

        {/* MOBILE LOGO */}

        <button
          onClick={() => router.push("/dashboard")}
          className="absolute left-1/2 -translate-x-1/2 text-xl font-black tracking-tight lg:hidden"
          type="button"
        >
          Sınav
          <span className="text-indigo-600">
            Köyü
          </span>
        </button>

        {/* PROFILE */}

        <button
          onClick={() => router.push("/profile")}
          className="group flex items-center gap-3 rounded-2xl px-2 py-1.5 transition hover:bg-slate-50"
          title="Profil"
          type="button"
        >
          <div className="hidden text-right sm:block">
            <p className="text-sm font-black text-slate-900">
              {firstName}
            </p>

            <p className="text-[11px] font-semibold text-slate-400">
              Profilim
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-lg transition group-hover:bg-indigo-100">
            👤
          </div>
        </button>

      </header>

      {/* MOBILE SIDEBAR */}

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">

          {/* BACKDROP */}

          <button
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            aria-label="Menüyü kapat"
            type="button"
          />

          {/* MENU */}

          <div className="relative z-10 h-full w-72 max-w-[85vw] animate-in slide-in-from-left bg-white shadow-2xl">

            {/* MENU HEADER */}

            <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">

              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/dashboard");
                }}
                className="text-2xl font-black tracking-tight"
                type="button"
              >
                Sınav
                <span className="text-indigo-600">
                  Köyü
                </span>
              </button>

              <button
                onClick={() => setMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-lg text-slate-500 transition hover:bg-slate-100"
                aria-label="Menüyü kapat"
                type="button"
              >
                ×
              </button>

            </div>

            {/* MOBILE USER */}

            <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-lg">
                  👤
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-slate-900">
                    {fullName || "Öğrenci"}
                  </p>

                  <p className="text-xs font-semibold text-slate-400">
                    Sınav Köyü öğrencisi
                  </p>
                </div>

              </div>

            </div>

            {/* MOBILE NAVIGATION */}

            <div className="flex h-[calc(100%-9rem)] flex-col">

              <div
                onClick={() => setMenuOpen(false)}
                className="min-h-0 flex-1 overflow-y-auto"
              >
                <Sidebar mobile />
              </div>

              {/* MOBILE LOGOUT */}

              <div className="border-t border-slate-100 bg-white p-4">

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
                  type="button"
                >
                  <span className="text-lg">
                    ↪
                  </span>

                  Çıkış Yap
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </>
  );
}