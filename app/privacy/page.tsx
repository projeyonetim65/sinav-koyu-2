"use client";

import { useRouter } from "next/navigation";

export default function PrivacyPage() {
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
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-600">
              KVKK
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              Gizlilik ve Kişisel Veriler
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Son güncelleme: 29 Ağustos 2026
            </p>
          </div>

          <div className="space-y-10 text-sm leading-7 text-slate-600">
            <section>
              <h2 className="text-xl font-black text-slate-900">
                1. Amaç
              </h2>

              <p className="mt-3">
                Bu metin, Sınav Köyü platformunu kullanan kişilere ait
                kişisel verilerin hangi amaçlarla ve hangi kapsamda
                işlenebileceği hakkında bilgi vermek amacıyla hazırlanmıştır.
              </p>

              <p className="mt-3">
                Sınav Köyü, kişisel verilerin korunmasına ve kullanıcı
                bilgilerinin güvenliğinin sağlanmasına önem verir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                2. İşlenebilecek Veriler
              </h2>

              <p className="mt-3">
                Platformun kullanımına bağlı olarak aşağıdaki veri kategorileri
                işlenebilir:
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>Ad ve soyadı</li>
                <li>E-posta adresi</li>
                <li>Hesap ve kimlik doğrulama bilgileri</li>
                <li>Sınav yılı ve alan bilgisi</li>
                <li>Hedef üniversite ve bölüm bilgileri</li>
                <li>Hedef sıralama ve hedef net bilgileri</li>
                <li>Çalışma planları ve günlük görevler</li>
                <li>Konu ilerleme bilgileri</li>
                <li>Deneme sonuçları ve net bilgileri</li>
                <li>Kaynak ve soru çözüm bilgileri</li>
                <li>Teknik kullanım ve güvenlik kayıtları</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                3. Verilerin İşlenme Amaçları
              </h2>

              <p className="mt-3">
                Kişisel veriler aşağıdaki amaçlarla işlenebilir:
              </p>

              <ul className="mt-4 list-disc space-y-2 pl-5">
                <li>Kullanıcı hesabının oluşturulması ve yönetilmesi</li>
                <li>Kimlik doğrulama ve hesap güvenliğinin sağlanması</li>
                <li>Platform özelliklerinin sunulması</li>
                <li>Kullanıcı tarafından oluşturulan çalışma bilgilerinin saklanması</li>
                <li>Teknik sorunların tespit edilmesi ve giderilmesi</li>
                <li>Platform güvenliğinin sağlanması</li>
                <li>Hizmetin geliştirilmesi ve iyileştirilmesi</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                4. E-posta Adresi
              </h2>

              <p className="mt-3">
                Hesap oluşturmanız sırasında verdiğiniz e-posta adresi,
                hesabınızın oluşturulması, kimlik doğrulama, hesap güvenliği
                ve hizmetle ilgili gerekli bildirimlerin gönderilmesi
                amacıyla kullanılabilir.
              </p>

              <p className="mt-3">
                Pazarlama veya reklam amaçlı elektronik ileti gönderimi
                gerekiyorsa bunun için yürürlükteki mevzuata uygun gerekli
                izin ve onay süreçleri ayrıca uygulanır.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                5. Çalışma Verileri
              </h2>

              <p className="mt-3">
                Sınav Köyü'nün temel özelliklerinden biri kullanıcının kendi
                çalışma sürecini takip edebilmesidir. Bu nedenle kullanıcı
                tarafından girilen hedefler, görevler, planlar, konu
                ilerlemeleri, kaynaklar ve deneme sonuçları hesabıyla
                ilişkilendirilerek saklanabilir.
              </p>

              <p className="mt-3">
                Bu bilgiler, platformun çalışma takip özelliklerinin
                sunulması amacıyla kullanılır.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                6. Verilerin Aktarılması
              </h2>

              <p className="mt-3">
                Kişisel veriler, hizmetin teknik olarak sunulması için gerekli
                olduğu ölçüde kullanılan teknoloji ve altyapı sağlayıcılarına
                aktarılabilir.
              </p>

              <p className="mt-3">
                Bu tür hizmet sağlayıcılarla gerçekleştirilen veri aktarımları
                ilgili mevzuata uygun şekilde yürütülmeye çalışılır.
              </p>

              <p className="mt-3">
                Kullanılan üçüncü taraf hizmetlerin ve veri aktarım
                mekanizmalarının güncel listesi, platformun teknik altyapısı
                kesinleştirildiğinde bu metinde ayrıca açıklanacaktır.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                7. Veri Güvenliği
              </h2>

              <p className="mt-3">
                Sınav Köyü, kişisel verilerin hukuka aykırı olarak işlenmesini,
                erişilmesini, değiştirilmesini veya kaybolmasını önlemek için
                uygun teknik ve idari tedbirleri almaya çalışır.
              </p>

              <p className="mt-3">
                Bununla birlikte internet üzerinden gerçekleştirilen hiçbir
                veri aktarımının tamamen risksiz olduğu garanti edilemez.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                8. Saklama Süresi
              </h2>

              <p className="mt-3">
                Kişisel veriler, işlenme amaçlarının gerektirdiği süre boyunca
                ve ilgili mevzuatta öngörülen saklama yükümlülükleri dikkate
                alınarak saklanır.
              </p>

              <p className="mt-3">
                Hesabın silinmesi durumunda verilerin silinmesi veya
                anonimleştirilmesi, yasal saklama yükümlülükleri ve teknik
                gereklilikler dikkate alınarak gerçekleştirilir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                9. Kullanıcı Hakları
              </h2>

              <p className="mt-3">
                İlgili kişi olarak kişisel verilerinizle ilgili yürürlükteki
                mevzuat kapsamında sahip olduğunuz haklar hakkında bilgi
                talep edebilir ve ilgili mevzuatta öngörülen yöntemlerle
                başvuruda bulunabilirsiniz.
              </p>

              <p className="mt-3">
                Başvurular için platformda yayınlanan güncel iletişim
                kanalları kullanılabilir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-900">
                10. Güncellemeler
              </h2>

              <p className="mt-3">
                Bu metin, platformun teknik altyapısı, kullanılan hizmetler
                veya mevzuattaki değişikliklere göre güncellenebilir.
                Güncel metin bu sayfada yayınlanır.
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