"use client";

import { usePathname, useRouter } from "next/navigation";

type MenuItem = {
  label: string;
  href: string;
  icon: string;
};

type SidebarProps = {
  mobile?: boolean;
};

const mainMenu: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "🏠",
  },
  {
    label: "Hedeflerim",
    href: "/goals",
    icon: "🎯",
  },
  {
    label: "Konular",
    href: "/topics",
    icon: "📚",
  },
  {
    label: "Görevler",
    href: "/tasks",
    icon: "📝",
  },
  {
    label: "Planlar",
    href: "/plans",
    icon: "🗓️",
  },
  {
    label: "Denemeler",
    href: "/exams",
    icon: "📈",
  },
  {
    label: "Kaynaklar",
    href: "/resources",
    icon: "📖",
  },
];

const developmentMenu: MenuItem[] = [
  {
    label: "Pomodoro",
    href: "/pomodoro",
    icon: "⏱️",
  },
  {
    label: "Köyüm",
    href: "/village",
    icon: "🏡",
  },
  {
    label: "İstatistikler",
    href: "/statistics",
    icon: "📊",
  },
];

export default function Sidebar({
  mobile = false,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  function navigate(href: string) {
    router.push(href);
  }

  function isActive(href: string) {
    return pathname === href;
  }

  function renderMenu(items: MenuItem[]) {
    return (
      <nav className="space-y-1">
        {items.map((item) => {
          const active = isActive(item.href);

          return (
            <button
              key={item.href}
              type="button"
              onClick={() => navigate(item.href)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${
                active
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg transition ${
                  active
                    ? "bg-indigo-100"
                    : "bg-slate-50 group-hover:bg-slate-100"
                }`}
              >
                {item.icon}
              </span>

              <span className="flex-1">
                {item.label}
              </span>

              {active && (
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
              )}
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <aside
      className={
        mobile
          ? "flex h-full w-full flex-col bg-white"
          : "flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white"
      }
    >
      {/* LOGO */}

      <div
        className={`flex h-20 shrink-0 items-center border-b border-slate-100 px-6 ${
          mobile ? "hidden" : ""
        }`}
      >
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-xl shadow-sm">
            🎓
          </div>

          <div className="text-left">
            <p className="text-lg font-black tracking-tight text-slate-900">
              Sınav Köyü
            </p>

            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              YKS 2027
            </p>
          </div>
        </button>
      </div>

      {/* MENU */}

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">

        {/* ÇALIŞMA ALANI */}

        <div>
          <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Çalışma Alanı
          </p>

          {renderMenu(mainMenu)}
        </div>

        {/* GELİŞİM */}

        <div className="mt-8">
          <p className="mb-3 px-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Gelişim
          </p>

          {renderMenu(developmentMenu)}
        </div>

      </div>

      {/* ALT PROFİL */}

      <div className="shrink-0 border-t border-slate-100 p-4">
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
            isActive("/profile")
              ? "bg-indigo-50"
              : "hover:bg-slate-50"
          }`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg">
            👤
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-black text-slate-900">
              Profil
            </p>

            <p className="truncate text-xs text-slate-400">
              Hesap ayarları
            </p>
          </div>

          <span className="text-slate-400">
            ⚙️
          </span>
        </button>
      </div>
    </aside>
  );
}