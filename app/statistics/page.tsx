"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

type Exam = {
  id: number;
  exam_name: string;
  exam_date: string;
  total_net: number | null;
};

type UserTopic = {
  topic_id: number;
  status: "not_started" | "in_progress" | "completed";
};

export default function StatisticsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [topics, setTopics] = useState<UserTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  async function loadStatistics() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.replace("/auth");
      return;
    }

    const [
      { data: examData, error: examError },
      { data: topicData, error: topicError },
    ] = await Promise.all([
      supabase
        .from("exams_results")
        .select("id, exam_name, exam_date, total_net")
        .eq("user_id", user.id)
        .order("exam_date", {
          ascending: true,
        }),

      supabase
        .from("user_topics")
        .select("topic_id, status")
        .eq("user_id", user.id),
    ]);

    if (examError) {
      console.error(
        "Deneme istatistikleri yükleme hatası:",
        examError
      );
    }

    if (topicError) {
      console.error(
        "Konu istatistikleri yükleme hatası:",
        topicError
      );
    }

    setExams(examData || []);
    setTopics(topicData || []);

    setLoading(false);
  }

  const statistics = useMemo(() => {
    const validNets = exams
      .map((exam) => Number(exam.total_net))
      .filter((net) => !Number.isNaN(net));

    const examCount = validNets.length;

    const latestNet =
      examCount > 0
        ? validNets[validNets.length - 1]
        : 0;

    const firstNet =
      examCount > 0
        ? validNets[0]
        : 0;

    const averageNet =
      examCount > 0
        ? validNets.reduce(
            (total, net) => total + net,
            0
          ) / examCount
        : 0;

    const highestNet =
      examCount > 0
        ? Math.max(...validNets)
        : 0;

    const netChange =
      latestNet - firstNet;

    const completedTopics = topics.filter(
      (topic) => topic.status === "completed"
    ).length;

    const inProgressTopics = topics.filter(
      (topic) => topic.status === "in_progress"
    ).length;

    const notStartedTopics = topics.filter(
      (topic) => topic.status === "not_started"
    ).length;

    const totalTopics = topics.length;

    const topicCompletionRate =
      totalTopics > 0
        ? (completedTopics / totalTopics) * 100
        : 0;

    return {
      examCount,
      latestNet,
      firstNet,
      averageNet,
      highestNet,
      netChange,
      completedTopics,
      inProgressTopics,
      notStartedTopics,
      totalTopics,
      topicCompletionRate,
    };
  }, [exams, topics]);

  function formatDate(date: string) {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("tr-TR");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          İstatistikler yükleniyor...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header />

          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
                Analiz
              </p>

              <h1 className="mt-1 text-3xl font-black text-slate-900">
                İstatistikler
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                YKS hazırlığındaki gelişimini ve çalışma
                performansını takip et.
              </p>
            </div>

            {/* DENEME İSTATİSTİKLERİ */}

            <section>
              <div className="mb-4">
                <h2 className="text-xl font-black text-slate-900">
                  Deneme Performansı
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Çözdüğün denemelerdeki net gelişimin.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    Son Net
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {statistics.latestNet.toFixed(2)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    Ortalama Net
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {statistics.averageNet.toFixed(2)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    En Yüksek Net
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {statistics.highestNet.toFixed(2)}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    Net Değişimi
                  </p>

                  <p
                    className={`mt-2 text-3xl font-black ${
                      statistics.netChange > 0
                        ? "text-green-600"
                        : statistics.netChange < 0
                        ? "text-red-600"
                        : "text-slate-900"
                    }`}
                  >
                    {statistics.netChange > 0
                      ? "+"
                      : ""}
                    {statistics.netChange.toFixed(2)}
                  </p>
                </div>

              </div>
            </section>

            {/* KONU İSTATİSTİKLERİ */}

            <section className="mt-8">
              <div className="mb-4">
                <h2 className="text-xl font-black text-slate-900">
                  Konu İlerlemesi
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Ders ve konu çalışma durumun.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    Toplam Konu
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-900">
                    {statistics.totalTopics}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    Tamamlanan
                  </p>

                  <p className="mt-2 text-3xl font-black text-green-600">
                    {statistics.completedTopics}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    Çalışılıyor
                  </p>

                  <p className="mt-2 text-3xl font-black text-amber-500">
                    {statistics.inProgressTopics}
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    Başlanmadı
                  </p>

                  <p className="mt-2 text-3xl font-black text-slate-700">
                    {statistics.notStartedTopics}
                  </p>
                </div>

              </div>

              {/* İLERLEME ÇUBUĞU */}

              <div className="mt-4 rounded-2xl bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Konu Tamamlama Oranı
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Tamamladığın konuların toplam konulara oranı.
                    </p>
                  </div>

                  <span className="text-xl font-black text-indigo-600">
                    {statistics.topicCompletionRate.toFixed(0)}%
                  </span>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        statistics.topicCompletionRate,
                        100
                      )}%`,
                    }}
                  />
                </div>

              </div>
            </section>

            {/* DENEME GEÇMİŞİ */}

            <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm sm:p-6">

              <div className="flex flex-wrap items-center justify-between gap-3">

                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Deneme Geçmişi
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Toplam {statistics.examCount} deneme kaydı.
                  </p>
                </div>

                <button
                  onClick={loadStatistics}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-200"
                >
                  Yenile
                </button>

              </div>

              {exams.length === 0 ? (

                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 p-10 text-center">

                  <div className="text-4xl">
                    📊
                  </div>

                  <h3 className="mt-3 font-bold text-slate-900">
                    Henüz deneme sonucu yok
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Denemeler sayfasından ilk deneme sonucunu eklediğinde
                    istatistiklerin burada görünecek.
                  </p>

                </div>

              ) : (

                <div className="mt-6 space-y-3">

                  {exams
                    .slice()
                    .reverse()
                    .map((exam) => (

                      <div
                        key={exam.id}
                        className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >

                        <div>
                          <h3 className="font-bold text-slate-900">
                            {exam.exam_name}
                          </h3>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDate(exam.exam_date)}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="text-xs font-medium text-slate-400">
                            Net
                          </p>

                          <p className="text-xl font-black text-indigo-600">
                            {Number(
                              exam.total_net || 0
                            ).toFixed(2)}
                          </p>
                        </div>

                      </div>

                    ))}

                </div>

              )}

            </section>

            {/* ÖZET */}

            <section className="mt-8 rounded-2xl bg-indigo-600 p-6 text-white shadow-sm">

              <p className="text-sm font-bold uppercase tracking-wide text-indigo-200">
                Genel Durum
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Çalışmaya devam et! 🚀
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-indigo-100">
                {statistics.examCount === 0 &&
                statistics.totalTopics === 0
                  ? "Henüz yeterli veri oluşmadı. Deneme sonuçlarını ve konu ilerlemelerini eklemeye başladığında gelişimini burada görebileceksin."
                  : statistics.netChange > 0
                  ? `İlk denemene göre netini ${statistics.netChange.toFixed(
                      2
                    )} artırmışsın. Bu gelişimi korumak için düzenli çalışmaya devam et.`
                  : statistics.completedTopics > 0
                  ? `${statistics.completedTopics} konuyu tamamladın. Konu ilerlemeni artırdıkça performansını daha net görebileceğiz.`
                  : "Verilerini düzenli olarak güncelle. Böylece gelişimini daha doğru takip edebiliriz."}
              </p>

            </section>

          </div>
        </div>
      </div>
    </main>
  );
}