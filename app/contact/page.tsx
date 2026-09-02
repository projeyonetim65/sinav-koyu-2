"use client";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            ← Dashboard&apos;a dön
          </a>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-10">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              İletişim
            </span>

            <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Sınav Köyü&apos;ne ulaş
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400">
              Bir sorunla karşılaştıysan, önerin varsa veya bizimle iletişime
              geçmek istiyorsan aşağıdaki kanallardan bize ulaşabilirsin.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-2xl gap-5 sm:grid-cols-2">
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=sinavkoyu@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-blue-800 dark:hover:bg-blue-950/30"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl dark:bg-blue-950">
                📧
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                E-posta ile ulaş
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Gmail üzerinden doğrudan bize mesaj gönderebilirsin.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition group-hover:gap-3 dark:text-blue-400">
                Gmail&apos;i aç
                <span>→</span>
              </div>
            </a>

            <a
              href="https://www.instagram.com/sinav_koyu/"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:-translate-y-1 hover:border-pink-300 hover:bg-pink-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-pink-800 dark:hover:bg-pink-950/30"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100 text-2xl dark:bg-pink-950">
                📸
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                Instagram
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Duyurular, güncellemeler ve iletişim için Instagram hesabımızı
                ziyaret edebilirsin.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-pink-600 transition group-hover:gap-3 dark:text-pink-400">
                @sinav_koyu
                <span>→</span>
              </div>
            </a>
          </div>

          <div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-blue-100 bg-blue-50 p-6 text-center dark:border-blue-900/40 dark:bg-blue-950/30">
            <div className="text-2xl">💡</div>

            <h3 className="mt-3 font-bold text-slate-900 dark:text-white">
              Geri bildirimin bizim için önemli
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Sınav Köyü&apos;nü daha iyi hale getirmek için önerilerini ve
              karşılaştığın sorunları bizimle paylaşabilirsin.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}