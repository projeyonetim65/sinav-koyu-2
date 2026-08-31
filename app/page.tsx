"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: "🎯",
    title: "Hedeflerim",
    description:
      "Hedef üniversiteni, bölümünü ve sıralamanı belirle. Nereye gitmek istediğini net olarak gör.",
  },
  {
    icon: "📚",
    title: "Konular",
    description:
      "TYT ve AYT konularını takip et. Neyi bitirdiğini, neyin kaldığını kolayca gör.",
  },
  {
    icon: "✓",
    title: "Görevler",
    description:
      "Büyük hedeflerini günlük yapılabilir görevlere dönüştür ve her tamamladığın adımı işaretle.",
  },
  {
    icon: "⏱️",
    title: "Pomodoro",
    description:
      "Çalışma süreni takip et, odaklanma alışkanlığını geliştir ve emeğini kaydet.",
  },
  {
    icon: "📝",
    title: "Denemeler",
    description:
      "Deneme sonuçlarını kaydet. Netlerini ve zaman içerisindeki değişimini tek yerde takip et.",
  },
  {
    icon: "📈",
    title: "İstatistikler",
    description:
      "Çalışma sürecini verilerle gör. Nerede olduğunu ve nasıl ilerlediğini daha iyi anla.",
  },
];

const steps = [
  {
    number: "01",
    title: "Hedef",
    description:
      "Gitmek istediğin üniversiteyi, bölümü ve hedef sıralamanı belirle.",
  },
  {
    number: "02",
    title: "Plan",
    description:
      "Hedefini gerçekçi bir çalışma planına dönüştür.",
  },
  {
    number: "03",
    title: "Görev",
    description:
      "Bugün yapman gereken çalışmaları küçük adımlara böl.",
  },
  {
    number: "04",
    title: "Pomodoro",
    description:
      "Odaklanarak çalış ve harcadığın zamanı takip et.",
  },
  {
    number: "05",
    title: "Deneme",
    description:
      "Deneme sonuçlarını kaydet ve net değişimini gör.",
  },
  {
    number: "06",
    title: "İlerleme",
    description:
      "Tüm çalışmalarını bir arada gör ve hedefine ne kadar yaklaştığını takip et.",
  },
];

const faqs = [
  {
    question: "Sınav Köyü nedir?",
    answer:
      "Sınav Köyü, YKS'ye hazırlanan öğrencilerin hedeflerini, çalışma süreçlerini, konularını, görevlerini, Pomodoro çalışmalarını ve deneme sonuçlarını tek bir yerde takip edebilmesi için geliştirilmiş bir öğrenci platformudur.",
  },
  {
    question: "Sınav Köyü ücretli mi?",
    answer:
      "Sınav Köyü'nün temel özelliklerini öğrencilerin kolayca kullanabilmesi için ücretsiz kullanım modeliyle başlamasını hedefliyoruz. Gelecekte sunulabilecek ücretli özellikler ayrıca açıkça belirtilecektir.",
  },
  {
    question: "Hangi sınava hazırlanabilirim?",
    answer:
      "Platformun ana odağı YKS hazırlığıdır. TYT ve AYT çalışma süreçlerini düzenlemeye yardımcı olacak özellikler sunuyoruz.",
  },
  {
    question: "Deneme sonuçlarımı takip edebilir miyim?",
    answer:
      "Evet. Deneme sonuçlarını sisteme girerek netlerini ve zaman içerisindeki gelişimini takip edebilirsin.",
  },
  {
    question: "Sınav Köyü benim yerime ders çalışır mı?",
    answer:
      "Hayır. Sınav Köyü senin yerine çalışmaz. Çalışma sürecini daha düzenli yönetmene, görevlerini takip etmene ve gelişimini görmene yardımcı olur.",
  },
  {
    question: "Verilerim güvende mi?",
    answer:
      "Hesabınla ilgili bilgileri korumaya ve yalnızca hizmetin çalışması için gerekli amaçlarla işlemeye çalışıyoruz. Kişisel verilerin ve çerezlerin nasıl işlendiğini ilgili Gizlilik Politikası ve Çerez Politikası sayfalarında açıklıyoruz.",
  },
];

export default function HomePage() {
  const router = useRouter();

  const [cookieVisible, setCookieVisible] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const cookieChoice = localStorage.getItem("sinav-koyu-cookie-choice");

    if (!cookieChoice) {
      setCookieVisible(true);
    }
  }, []);

  function acceptCookies() {
    localStorage.setItem("sinav-koyu-cookie-choice", "accepted");
    setCookieVisible(false);
  }

  function rejectCookies() {
    localStorage.setItem("sinav-koyu-cookie-choice", "rejected");
    setCookieVisible(false);
  }

  function openCookieSettings() {
    setCookieVisible(true);
  }

  function goToAuth() {
    setMobileMenuOpen(false);
    router.push("/auth");
  }

  function goToSection(id: string) {
    setMobileMenuOpen(false);

    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      {/* ===================================================== */}
      {/* NAVBAR */}
      {/* ===================================================== */}

      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push("/")}
            className="group flex items-center gap-2"
            aria-label="Sınav Köyü ana sayfa"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg shadow-sm transition group-hover:scale-105">
              🎓
            </div>

            <div className="text-left text-xl font-black tracking-tight">
              Sınav
              <span className="text-indigo-600"> Köyü</span>
            </div>
          </button>

          <nav className="hidden items-center gap-7 md:flex">
            <button
              onClick={() => goToSection("hakkimizda")}
              className="text-sm font-bold text-slate-500 transition hover:text-slate-900"
            >
              Hakkımızda
            </button>

            <button
              onClick={() => goToSection("ozellikler")}
              className="text-sm font-bold text-slate-500 transition hover:text-slate-900"
            >
              Özellikler
            </button>

            <button
              onClick={() => goToSection("nasil-calisir")}
              className="text-sm font-bold text-slate-500 transition hover:text-slate-900"
            >
              Nasıl Çalışır?
            </button>

            <button
              onClick={() => goToSection("sss")}
              className="text-sm font-bold text-slate-500 transition hover:text-slate-900"
            >
              SSS
            </button>
          </nav>

          <div className="hidden items-center gap-2 sm:gap-3 md:flex">
            <button
              onClick={goToAuth}
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Giriş Yap
            </button>

            <button
              onClick={goToAuth}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-indigo-700"
            >
              Ücretsiz Başla
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 md:hidden"
            aria-label="Menüyü aç"
            aria-expanded={mobileMenuOpen}
          >
            <div className="space-y-1.5">
              <span
                className={`block h-0.5 w-5 bg-slate-700 transition ${
                  mobileMenuOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />

              <span
                className={`block h-0.5 w-5 bg-slate-700 transition ${
                  mobileMenuOpen ? "opacity-0" : ""
                }`}
              />

              <span
                className={`block h-0.5 w-5 bg-slate-700 transition ${
                  mobileMenuOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              <button
                onClick={() => goToSection("hakkimizda")}
                className="rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Hakkımızda
              </button>

              <button
                onClick={() => goToSection("ozellikler")}
                className="rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Özellikler
              </button>

              <button
                onClick={() => goToSection("nasil-calisir")}
                className="rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Nasıl Çalışır?
              </button>

              <button
                onClick={() => goToSection("sss")}
                className="rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                SSS
              </button>

              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                <button
                  onClick={goToAuth}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700"
                >
                  Giriş Yap
                </button>

                <button
                  onClick={goToAuth}
                  className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-black text-white"
                >
                  Ücretsiz Başla
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ===================================================== */}
      {/* HERO */}
      {/* ===================================================== */}

      <section className="relative overflow-hidden bg-slate-50">
        <div className="absolute -left-48 top-0 h-[500px] w-[500px] rounded-full bg-indigo-200/30 blur-3xl" />

        <div className="absolute -right-48 top-40 h-[500px] w-[500px] rounded-full bg-violet-200/30 blur-3xl" />

        <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-4 py-2 text-xs font-black text-indigo-600 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              YKS hazırlığını tek yerde yönet
            </div>

            <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[1.02] tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Hedefini belirle.
              <span className="block text-indigo-600">
                Yolunu oluştur.
              </span>
              İlerlemeni gör.
            </h1>

            <p className="mt-7 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
              Sınav Köyü, YKS hazırlık sürecini daha düzenli
              yönetmen için hedeflerini, planlarını, görevlerini,
              çalışma sürelerini ve denemelerini tek bir yerde
              bir araya getirir.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={goToAuth}
                className="rounded-xl bg-indigo-600 px-7 py-4 text-sm font-black text-white shadow-xl shadow-indigo-200 transition hover:-translate-y-1 hover:bg-indigo-700"
              >
                Ücretsiz Başla →
              </button>

              <button
                onClick={() => goToSection("nasil-calisir")}
                className="rounded-xl border border-slate-200 bg-white px-7 py-4 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                Nasıl Çalışır?
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                Hedef takibi
              </span>

              <span className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                Görev yönetimi
              </span>

              <span className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                Deneme takibi
              </span>

              <span className="flex items-center gap-2">
                <span className="text-emerald-500">✓</span>
                Pomodoro
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-[3rem] bg-indigo-100/50 blur-3xl" />

            <div className="relative rounded-[2rem] border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-300/40 sm:p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-xs font-bold text-slate-400">
                    Sınav Köyü
                  </p>

                  <h3 className="mt-1 text-lg font-black text-slate-900">
                    Bugünkü Çalışma
                  </h3>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg">
                  🎯
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-400">
                      Günlük ilerleme
                    </p>

                    <p className="mt-1 text-3xl font-black text-slate-900">
                      %72
                    </p>
                  </div>

                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-indigo-100 border-t-indigo-600 text-xs font-black text-indigo-600">
                    72%
                  </div>
                </div>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-white">
                  <div className="h-full w-[72%] rounded-full bg-indigo-600" />
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-black text-slate-900">
                    Bugünün görevleri
                  </p>

                  <span className="text-xs font-bold text-slate-400">
                    2 / 4 tamamlandı
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm font-black text-emerald-600">
                      ✓
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-500 line-through">
                        TYT Matematik
                      </p>

                      <p className="mt-0.5 text-xs font-semibold text-slate-400">
                        Problemler • 40 soru
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm font-black text-emerald-600">
                      ✓
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-500 line-through">
                        TYT Türkçe
                      </p>

                      <p className="mt-0.5 text-xs font-semibold text-slate-400">
                        Paragraf • 25 soru
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-black text-indigo-600">
                      ○
                    </div>

                    <div>
                      <p className="text-sm font-black text-slate-900">
                        AYT Fizik
                      </p>

                      <p className="mt-0.5 text-xs font-semibold text-slate-400">
                        Elektrik • 30 soru
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-indigo-50 p-3">
                  <p className="text-[11px] font-bold text-indigo-400">
                    Hedef
                  </p>

                  <p className="mt-1 text-base font-black text-indigo-700">
                    100K
                  </p>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-3">
                  <p className="text-[11px] font-bold text-emerald-500">
                    Bugün
                  </p>

                  <p className="mt-1 text-base font-black text-emerald-700">
                    95 soru
                  </p>
                </div>

                <div className="rounded-2xl bg-amber-50 p-3">
                  <p className="text-[11px] font-bold text-amber-500">
                    Seri
                  </p>

                  <p className="mt-1 text-base font-black text-amber-700">
                    7 gün
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* FLOW */}
      {/* ===================================================== */}

      <section className="border-y border-slate-100 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-black text-slate-500 sm:gap-3 sm:text-sm">
            {[
              "Hedef",
              "Plan",
              "Görev",
              "Pomodoro",
              "Deneme",
              "İlerleme",
            ].map((item, index) => (
              <div key={item} className="flex items-center gap-2">
                <span className="rounded-full bg-slate-50 px-4 py-2.5">
                  {item}
                </span>

                {index < 5 && (
                  <span className="hidden text-slate-300 sm:block">
                    →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* ABOUT */}
      {/* ===================================================== */}

      <section
        id="hakkimizda"
        className="scroll-mt-20 bg-white px-4 py-24 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-600">
              SINAV KÖYÜ
            </div>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              YKS hazırlığını
              <span className="text-indigo-600">
                {" "}daha anlaşılır{" "}
              </span>
              hale getir.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-500">
              YKS hazırlığında bazen problem ders çalışmak değil,
              nereden başlayacağını ve yaptıklarını nasıl takip
              edeceğini bilmektir.
            </p>

            <p className="mt-4 max-w-xl text-base leading-7 text-slate-500">
              Sınav Köyü bunun için var. Hedefini belirle,
              çalışmalarını düzenle, görevlerini tamamla,
              denemelerini kaydet ve zaman içerisinde gelişimini gör.
            </p>

            <button
              onClick={goToAuth}
              className="mt-7 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-black text-white transition hover:bg-slate-800"
            >
              Kendi Köyünü Oluştur →
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                🧭
              </div>

              <h3 className="mt-5 font-black text-slate-900">
                Yol Haritası
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Hedefin ile günlük çalışmaların arasında bağlantı kur.
              </p>
            </div>

            <div className="rounded-3xl bg-indigo-50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                📋
              </div>

              <h3 className="mt-5 font-black text-slate-900">
                Düzen
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Yapacaklarını unutmak yerine sistemli şekilde takip et.
              </p>
            </div>

            <div className="rounded-3xl bg-emerald-50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                📈
              </div>

              <h3 className="mt-5 font-black text-slate-900">
                Gelişim
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Küçük ilerlemelerini zaman içerisinde fark et.
              </p>
            </div>

            <div className="rounded-3xl bg-amber-50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                🚀
              </div>

              <h3 className="mt-5 font-black text-slate-900">
                Hedef
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Büyük hedefini her gün biraz daha yakına getir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* FEATURES */}
      {/* ===================================================== */}

      <section
        id="ozellikler"
        className="scroll-mt-20 bg-slate-50 px-4 py-24 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <div className="inline-flex rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-black text-indigo-600">
              ÖZELLİKLER
            </div>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              İhtiyacın olan araçlar
              <span className="text-indigo-600">
                {" "}tek yerde.
              </span>
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-500">
              YKS hazırlığındaki temel ihtiyaçlarını farklı uygulamalar
              arasında bölmek yerine tek bir sistem içerisinde yönet.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-3xl border border-slate-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-2xl transition group-hover:bg-indigo-50">
                  {feature.icon}
                </div>

                <h3 className="mt-5 text-lg font-black text-slate-900">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* HOW IT WORKS */}
      {/* ===================================================== */}

      <section
        id="nasil-calisir"
        className="scroll-mt-20 bg-white px-4 py-24 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="inline-flex rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-600">
              NASIL ÇALIŞIR?
            </div>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Hedefinden
              <span className="text-indigo-600">
                {" "}ilerlemene{" "}
              </span>
              kadar.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500">
              Sınav hazırlığını tek bir büyük problem olarak görmek yerine
              küçük ve takip edilebilir adımlara böl.
            </p>
          </div>

          <div className="relative mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative rounded-3xl border border-slate-200 bg-slate-50 p-6"
              >
                <span className="text-5xl font-black text-indigo-100">
                  {step.number}
                </span>

                <h3 className="mt-5 text-lg font-black text-slate-900">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* MESSAGE */}
      {/* ===================================================== */}

      <section className="bg-slate-900 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-indigo-300">
            Büyük hedefler
          </p>

          <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-5xl">
            100.000 sıralama da,
            <span className="block text-indigo-300">
              10.000 sıralama da
            </span>
            bugün atacağın küçük adımlarla başlar.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Sınav Köyü sana mucize vaat etmez. Sadece hedefini,
            çalışmalarını ve ilerlemeni daha düzenli takip edebilmen
            için ihtiyacın olan sistemi sunar.
          </p>
        </div>
      </section>

      {/* ===================================================== */}
      {/* FAQ */}
      {/* ===================================================== */}

      <section
        id="sss"
        className="scroll-mt-20 bg-slate-50 px-4 py-24 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="inline-flex rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-black text-indigo-600">
              MERAK EDİLENLER
            </div>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Sık sorulan sorular
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-500">
              Sınav Köyü hakkında merak edebileceğin temel soruların
              cevapları.
            </p>
          </div>

          <div className="mt-12 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.question}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-5 p-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-black text-slate-900">
                      {faq.question}
                    </span>

                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-lg transition ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 px-5 pb-5 pt-4">
                      <p className="text-sm leading-7 text-slate-500">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* FINAL CTA */}
      {/* ===================================================== */}

      <section id="basla" className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-indigo-600 px-6 py-16 text-center shadow-2xl shadow-indigo-200 sm:px-10">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />

          <div className="relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl">
              🎓
            </div>

            <h2 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-4xl">
              YKS hedefin için
              <span className="block text-indigo-100">
                bugün başla.
              </span>
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
              Hedefini belirle, çalışma düzenini oluştur ve
              kendi ilerlemeni takip etmeye başla.
            </p>

            <button
              onClick={goToAuth}
              className="mt-8 rounded-xl bg-white px-7 py-3.5 text-sm font-black text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
            >
              Ücretsiz Hesap Oluştur →
            </button>
          </div>
        </div>
      </section>

      {/* ===================================================== */}
      {/* FOOTER */}
      {/* ===================================================== */}

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          <div className="md:col-span-2">
            <button
              onClick={() => router.push("/")}
              className="group flex items-center gap-2"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-sm">
                🎓
              </div>

              <div className="text-xl font-black tracking-tight">
                Sınav
                <span className="text-indigo-600"> Köyü</span>
              </div>
            </button>

            <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
              YKS hazırlık sürecini daha düzenli, anlaşılır ve
              takip edilebilir hale getirmek için tasarlanmış öğrenci
              platformu.
            </p>

            <p className="mt-4 text-sm font-bold text-slate-400">
              Hedef → Plan → Görev → İlerleme
            </p>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-900">
              Hızlı Linkler
            </h3>

            <div className="mt-4 space-y-3 text-sm font-semibold text-slate-500">
              <button
                onClick={() => goToSection("hakkimizda")}
                className="block transition hover:text-slate-900"
              >
                Hakkımızda
              </button>

              <button
                onClick={() => goToSection("ozellikler")}
                className="block transition hover:text-slate-900"
              >
                Özellikler
              </button>

              <button
                onClick={() => goToSection("nasil-calisir")}
                className="block transition hover:text-slate-900"
              >
                Nasıl Çalışır?
              </button>

              <button
                onClick={() => goToSection("sss")}
                className="block transition hover:text-slate-900"
              >
                SSS
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-900">
              Yasal
            </h3>

            <div className="mt-4 space-y-3 text-sm font-semibold text-slate-500">
              <button
                onClick={() => router.push("/terms")}
                className="block transition hover:text-slate-900"
              >
                Kullanım Koşulları
              </button>

              <button
                onClick={() => router.push("/privacy")}
                className="block transition hover:text-slate-900"
              >
                Gizlilik Politikası
              </button>

              <button
                onClick={() => router.push("/cookies")}
                className="block transition hover:text-slate-900"
              >
                Çerez Politikası
              </button>

              <button
                onClick={openCookieSettings}
                className="block transition hover:text-slate-900"
              >
                Çerez Ayarları
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
            <p>© 2026 Sınav Köyü. Tüm hakları saklıdır.</p>

            <p>YKS hazırlığını daha düzenli hale getir.</p>
          </div>
        </div>
      </footer>

      {/* ===================================================== */}
      {/* COOKIE CONSENT */}
      {/* ===================================================== */}

      {cookieVisible && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-5">
          <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xl">
                    🍪
                  </div>

                  <h2 className="text-lg font-black text-slate-900">
                    Gizlilik ve Çerez Tercihlerin
                  </h2>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Sınav Köyü'nü kullanırken hesabının çalışması için
                  gerekli teknik işlemler yapılabilir. İsteğe bağlı
                  çerezler ise deneyimi geliştirmek amacıyla kullanılabilir.
                  Tercihlerini istediğin zaman Çerez Ayarları üzerinden
                  değiştirebilirsin.
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  Ayrıntılı bilgi için{" "}
                  <button
                    onClick={() => router.push("/privacy")}
                    className="font-bold text-indigo-600 hover:underline"
                  >
                    Gizlilik Politikası
                  </button>{" "}
                  ve{" "}
                  <button
                    onClick={() => router.push("/cookies")}
                    className="font-bold text-indigo-600 hover:underline"
                  >
                    Çerez Politikası
                  </button>{" "}
                  sayfalarını inceleyebilirsin.
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                <button
                  onClick={acceptCookies}
                  className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-black text-white transition hover:bg-indigo-700"
                >
                  Kabul Et
                </button>

                <button
                  onClick={rejectCookies}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Reddet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}