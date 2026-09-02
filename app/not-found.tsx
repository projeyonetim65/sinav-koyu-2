export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md text-center">

        {/* ICON */}

        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-4xl">
          🔎
        </div>

        {/* ERROR CODE */}

        <p className="mt-6 text-sm font-black uppercase tracking-widest text-indigo-600">
          404
        </p>

        {/* TITLE */}

        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Sayfa bulunamadı
        </h1>

        {/* DESCRIPTION */}

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
          Aradığın sayfa mevcut değil, kaldırılmış veya taşınmış olabilir.
        </p>

        {/* ACTIONS */}

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">

          <a
            href="/"
            className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto"
          >
            Ana Sayfaya Dön
          </a>

          <a
            href="/dashboard"
            className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            Derslere Dön
          </a>

        </div>

        {/* BRAND */}

        <p className="mt-8 text-xs font-semibold text-slate-400">
          Sınav
          <span className="font-black text-indigo-600">
            Köyü
          </span>
        </p>

      </div>
    </main>
  );
}