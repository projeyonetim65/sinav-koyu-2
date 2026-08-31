"use client";

import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* HEADER */}
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

      {/* CONTENT */}
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="rounded-3xl bg-white p-6 shadow-sm sm:p-10">
          <div className="mb-10 border-b border-slate-100 pb-8">
            <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-600">
              HUKUKİ BİLGİLER
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Kullanım Koşulları
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Son güncelleme: 29 Ağustos 2026
            </p>
          </div>

          <div className="space-y-10 text-sm leading-7 text-slate-600">
            <section>
              <h2 className="text-xl font-black text-slate-900">
                1. Genel Hükümler
              </h2>

              <p className="mt-3">
                Sınav Köyü, YKS'ye hazırlanan öğrencilerin hedeflerini,
                çalışma planlarını, günlük görevlerini, konu ilerlemelerini,
                kaynaklarını ve deneme sonuçlarını takip etmelerine yardımcı
                olmak amacıyla oluşturulmuş çevrim içi bir platformdur.
              </p>

              <p className="mt-3">
                Sınav Köyü'nü kullanarak bu Kullanım Koşulları'nı okuduğunuzu,
                anladığınızı ve platformu bu koşullara uygun şekilde
                kullanacağınızı kabul etmiş olursunuz.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                2. Hesap Oluşturma
              </h2>

              <p className="mt-3">
                Platformun bazı özelliklerini kullanabilmek için kullanıcı
                hesabı oluşturmanız gerekebilir. Hesap oluştururken verdiğiniz
                bilgilerin doğru, güncel ve size ait olması gerekir.
              </p>

              <p className="mt-3">
                Hesabınızın güvenliğinden ve hesabınız üzerinden gerçekleştirilen
                işlemlerden siz sorumlusunuz. Hesap bilgilerinizin üçüncü
                kişilerle paylaşılmaması gerekir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                3. Platformun Kullanımı
              </h2>

              <p className="mt-3">
                Sınav Köyü yalnızca yasal amaçlarla ve platformun kullanım
                amacına uygun şekilde kullanılabilir.
              </p>

              <p className="mt-3">
                Platformun güvenliğini bozacak, diğer kullanıcıların
                kullanımını engelleyecek, sisteme yetkisiz erişim sağlamaya
                çalışacak veya platformun altyapısına zarar verecek işlemler
                gerçekleştirilemez.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                4. Eğitim İçeriği ve Sorumluluk
              </h2>

              <p className="mt-3">
                Sınav Köyü, öğrencilerin çalışma süreçlerini düzenlemelerine
                yardımcı olan bir araçtır. Platform tarafından sunulan
                öneriler, planlar, istatistikler veya diğer bilgiler eğitim
                sonucunu veya belirli bir sınav sonucunu garanti etmez.
              </p>

              <p className="mt-3">
                YKS'ye ilişkin resmi sınav kuralları, başvuru tarihleri,
                puanlama ve yerleştirme işlemleri için ilgili resmi kurumların
                açıklamaları esas alınmalıdır.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                5. Kullanıcı İçeriği
              </h2>

              <p className="mt-3">
                Kullanıcı tarafından platforma girilen hedef, görev, çalışma
                planı, deneme sonucu, kaynak ve benzeri bilgiler kullanıcının
                kendi verileridir.
              </p>

              <p className="mt-3">
                Kullanıcı, platforma yüklediği veya girdiği içeriklerin
                hukuka uygun olduğunu kabul eder.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                6. Hizmetin Değiştirilmesi
              </h2>

              <p className="mt-3">
                Sınav Köyü, platformun özelliklerini geliştirmek, değiştirmek,
                yeni özellikler eklemek veya bazı özellikleri kaldırmak
                hakkını saklı tutar.
              </p>

              <p className="mt-3">
                Teknik bakım, güvenlik çalışmaları veya zorunlu nedenlerle
                platforma geçici olarak erişilemeyebilir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                7. Fikri Mülkiyet
              </h2>

              <p className="mt-3">
                Sınav Köyü'nün tasarımı, marka unsurları, yazılımı, metinleri,
                görsel unsurları ve platforma ait diğer içerikler, aksi
                belirtilmedikçe Sınav Köyü'ne aittir veya kullanım hakkına
                sahiptir.
              </p>

              <p className="mt-3">
                Bu unsurlar izinsiz şekilde kopyalanamaz, çoğaltılamaz,
                dağıtılamaz veya ticari amaçla kullanılamaz.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                8. Hesabın Sonlandırılması
              </h2>

              <p className="mt-3">
                Kullanıcı hesabını istediği zaman sonlandırabilir. Platformun
                kötüye kullanılması, güvenliğinin tehdit edilmesi veya
                yürürlükteki mevzuata aykırı kullanım tespit edilmesi halinde
                gerekli önlemler alınabilir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                9. Değişiklikler
              </h2>

              <p className="mt-3">
                Bu Kullanım Koşulları gerektiğinde güncellenebilir. Güncel
                metin bu sayfada yayımlanır.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                10. İletişim
              </h2>

              <p className="mt-3">
                Kullanım koşulları hakkında sorularınız için platformda
                belirtilen iletişim kanallarından bizimle iletişime
                geçebilirsiniz.
              </p>
            </section>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 sm:px-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            © 2026 Sınav Köyü
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-400">
            <button
              onClick={() => router.push("/privacy")}
              className="hover:text-slate-700"
            >
              Gizlilik
            </button>

            <button
              onClick={() => router.push("/cookies")}
              className="hover:text-slate-700"
            >
              Çerezler
            </button>
          </div>
        </div>
      </footer>
    </main>
  );
}