"use client";

import { useRouter } from "next/navigation";

export default function CookiesPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-4 sm:px-6">
          <button
            onClick={() => router.push("/")}
            className="text-2xl font-black tracking-tight"
          >
            Sınav
            <span className="text-indigo-600">Köyü</span>
          </button>

          <button
            onClick={() => router.back()}
            className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
          >
            ← Geri
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-10">
          <div className="mb-10 border-b border-slate-100 pb-8">
            <span className="inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-xs font-black text-amber-600">
              ÇEREZLER
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Çerez Politikası
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Son güncelleme: 29 Ağustos 2026
            </p>
          </div>

          <div className="space-y-10 text-sm leading-7 text-slate-600">
            <section>
              <h2 className="text-xl font-black text-slate-900">
                1. Çerez Nedir?
              </h2>

              <p className="mt-3">
                Çerezler, ziyaret ettiğiniz internet siteleri tarafından
                tarayıcınıza veya cihazınıza kaydedilebilen küçük veri
                dosyalarıdır.
              </p>

              <p className="mt-3">
                Çerezler sayesinde bir internet sitesi kullanıcı oturumunu
                koruyabilir, tercihleri hatırlayabilir ve bazı teknik
                özellikleri çalıştırabilir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                2. Sınav Köyü Çerezleri Neden Kullanır?
              </h2>

              <p className="mt-3">
                Sınav Köyü çerezleri ve benzeri teknolojileri aşağıdaki
                amaçlarla kullanabilir:
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>Oturum ve kullanıcı kimlik doğrulamasını sağlamak</li>
                <li>Güvenliği sağlamak</li>
                <li>Kullanıcı tercihlerini hatırlamak</li>
                <li>Platformun temel işlevlerini çalıştırmak</li>
                <li>Platform performansını değerlendirmek</li>
                <li>Hizmeti geliştirmek</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                3. Kesinlikle Gerekli Çerezler
              </h2>

              <p className="mt-3">
                Bazı çerezler platformun temel işlevlerinin çalışabilmesi
                için gerekli olabilir.
              </p>

              <p className="mt-3">
                Örneğin kullanıcı oturumunun korunması, kimlik doğrulama,
                güvenlik ve temel platform işlevlerinin gerçekleştirilmesi
                için kullanılan çerezler bu kategoriye girebilir.
              </p>

              <p className="mt-3">
                Bu çerezler kullanılmadan platformun bazı temel özellikleri
                düzgün şekilde çalışmayabilir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                4. Analitik ve Performans Çerezleri
              </h2>

              <p className="mt-3">
                Platformda gelecekte ziyaretçi davranışlarını veya platform
                performansını analiz etmek amacıyla analitik teknolojiler
                kullanılabilir.
              </p>

              <p className="mt-3">
                Bu tür teknolojilerin kişisel veri işlenmesine neden olması
                halinde gerekli bilgilendirme ve uygun rıza mekanizmaları
                uygulanır.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                5. Reklam ve Pazarlama Çerezleri
              </h2>

              <p className="mt-3">
                Sınav Köyü'nün mevcut temel kullanımında reklam veya
                pazarlama amacıyla çerez kullanılması zorunlu değildir.
              </p>

              <p className="mt-3">
                Gelecekte bu tür teknolojilerin kullanılması halinde
                kullanıcılar ayrıca bilgilendirilir ve gerekli durumlarda
                açık rıza mekanizması uygulanır.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                6. Çerez Tercihlerinin Yönetilmesi
              </h2>

              <p className="mt-3">
                Kullanıcılar tarayıcılarının ayarları üzerinden çerezleri
                görüntüleyebilir, silebilir veya engelleyebilir.
              </p>

              <p className="mt-3">
                Ancak kesinlikle gerekli bazı çerezlerin devre dışı
                bırakılması halinde giriş yapma veya platformun bazı temel
                özelliklerini kullanma konusunda sorun yaşanabilir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                7. Çerez Tercihleri
              </h2>

              <p className="mt-3">
                Sınav Köyü'nde zorunlu olmayan çerezlerin kullanılması halinde
                kullanıcıya uygun bir tercih ekranı sunulacaktır.
              </p>

              <p className="mt-3">
                Kullanıcı, zorunlu olmayan çerezleri kabul etmeyi veya
                reddetmeyi tercih edebilecektir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                8. Üçüncü Taraf Hizmetler
              </h2>

              <p className="mt-3">
                Platformun teknik altyapısında üçüncü taraf hizmet
                sağlayıcılar kullanılabilir. Bu hizmetlerin çerez veya
                benzeri teknolojiler kullanması durumunda ilgili bilgiler
                güncel çerez politikamızda açıklanacaktır.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                9. Politika Değişiklikleri
              </h2>

              <p className="mt-3">
                Kullanılan teknolojiler veya platformun özellikleri
                değiştikçe bu Çerez Politikası güncellenebilir.
              </p>

              <p className="mt-3">
                Güncel politika her zaman bu sayfada yayınlanır.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                10. İletişim
              </h2>

              <p className="mt-3">
                Çerezlerin kullanımı hakkında sorularınız için platformda
                belirtilen iletişim kanallarından bizimle iletişime
                geçebilirsiniz.
              </p>
            </section>
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            © 2026 Sınav Köyü
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400">
            <button
              onClick={() => router.push("/terms")}
              className="hover:text-slate-700"
            >
              Kullanım Koşulları
            </button>

            <button
              onClick={() => router.push("/privacy")}
              className="hover:text-slate-700"
            >
              Gizlilik
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}