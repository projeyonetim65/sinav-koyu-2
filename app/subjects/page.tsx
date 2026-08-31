"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

type Subject = {
  id: number;
  name: string;
  exam: string;
};

type Topic = {
  id: number;
  name: string;
  subject_id: number;
  order_index: number;
  unit_id: number | null;
};

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [selectedExam, setSelectedExam] =
    useState<"TYT" | "AYT">("TYT");

  const [selectedSubject, setSelectedSubject] =
    useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.replace("/auth");
      return;
    }

    const [
      { data: subjectData, error: subjectError },
      { data: topicData, error: topicError },
    ] = await Promise.all([
      supabase
        .from("subjects")
        .select("id, name, exam")
        .order("id", {
          ascending: true,
        }),

      supabase
        .from("topics")
        .select(
          "id, name, subject_id, order_index, unit_id"
        )
        .eq("user_id", user.id)
        .order("order_index", {
          ascending: true,
        }),
    ]);

    if (subjectError) {
      console.error(
        "Ders yükleme hatası:",
        subjectError.message,
        subjectError.details,
        subjectError.hint,
        subjectError.code
      );
    }

    if (topicError) {
      console.error(
        "Konu yükleme hatası:",
        topicError.message,
        topicError.details,
        topicError.hint,
        topicError.code
      );
    }

    const loadedSubjects = subjectData || [];

    setSubjects(loadedSubjects);
    setTopics(topicData || []);

    const firstTYT = loadedSubjects.find(
      (subject) =>
        subject.exam?.toUpperCase() === "TYT"
    );

    if (firstTYT) {
      setSelectedSubject(firstTYT.id);
    } else if (loadedSubjects.length > 0) {
      setSelectedExam("AYT");

      const firstAYT = loadedSubjects.find(
        (subject) =>
          subject.exam?.toUpperCase() === "AYT"
      );

      setSelectedSubject(
        firstAYT?.id || loadedSubjects[0].id
      );
    }

    setLoading(false);
  }

  const filteredSubjects = useMemo(() => {
    return subjects.filter(
      (subject) =>
        subject.exam?.toUpperCase() ===
        selectedExam
    );
  }, [subjects, selectedExam]);

  const selectedSubjectData = subjects.find(
    (subject) =>
      subject.id === selectedSubject
  );

  const selectedTopics = useMemo(() => {
    if (!selectedSubject) {
      return [];
    }

    return topics
      .filter(
        (topic) =>
          topic.subject_id ===
          selectedSubject
      )
      .sort(
        (a, b) =>
          a.order_index - b.order_index
      );
  }, [topics, selectedSubject]);

  const totalTYTTopics = topics.filter(
    (topic) => {
      const subject = subjects.find(
        (subject) =>
          subject.id === topic.subject_id
      );

      return (
        subject?.exam?.toUpperCase() === "TYT"
      );
    }
  ).length;

  const totalAYTTopics = topics.filter(
    (topic) => {
      const subject = subjects.find(
        (subject) =>
          subject.id === topic.subject_id
      );

      return (
        subject?.exam?.toUpperCase() === "AYT"
      );
    }
  ).length;

  function changeExam(
    exam: "TYT" | "AYT"
  ) {
    setSelectedExam(exam);

    const firstSubject = subjects.find(
      (subject) =>
        subject.exam?.toUpperCase() ===
        exam
    );

    setSelectedSubject(
      firstSubject?.id || null
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
            📚
          </div>

          <p className="mt-4 font-semibold text-slate-600">
            Dersler yükleniyor...
          </p>
        </div>
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

            {/* HEADER */}

            <div className="mb-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

                <div>
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
                    <span>📚</span>
                    <span>DERS MERKEZİ</span>
                  </div>

                  <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                    Derslerim
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                    YKS'de çalışacağın dersleri seç ve
                    her ders için kendi konularını oluştur.
                  </p>
                </div>

                {/* SUMMARY */}

                <div className="grid grid-cols-3 gap-3">

                  <div className="rounded-2xl bg-white px-4 py-4 text-center shadow-sm">
                    <p className="text-xs font-semibold text-slate-400">
                      Ders
                    </p>

                    <p className="mt-1 text-xl font-black text-slate-900">
                      {filteredSubjects.length}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white px-4 py-4 text-center shadow-sm">
                    <p className="text-xs font-semibold text-slate-400">
                      Konu
                    </p>

                    <p className="mt-1 text-xl font-black text-indigo-600">
                      {selectedTopics.length}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white px-4 py-4 text-center shadow-sm">
                    <p className="text-xs font-semibold text-slate-400">
                      Toplam
                    </p>

                    <p className="mt-1 text-xl font-black text-slate-900">
                      {selectedExam === "TYT"
                        ? totalTYTTopics
                        : totalAYTTopics}
                    </p>
                  </div>

                </div>

              </div>
            </div>

            {/* EXAM SELECTOR */}

            <div className="rounded-2xl bg-white p-2 shadow-sm">
              <div className="grid grid-cols-2 gap-2">

                <button
                  onClick={() =>
                    changeExam("TYT")
                  }
                  className={`rounded-xl px-5 py-3 text-sm font-black transition ${
                    selectedExam === "TYT"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  TYT
                </button>

                <button
                  onClick={() =>
                    changeExam("AYT")
                  }
                  className={`rounded-xl px-5 py-3 text-sm font-black transition ${
                    selectedExam === "AYT"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  AYT
                </button>

              </div>
            </div>

            {/* SUBJECTS */}

            <section className="mt-6">

              <div className="mb-4">
                <h2 className="text-xl font-black text-slate-900">
                  {selectedExam} Dersleri
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Çalışmak istediğin dersi seç.
                </p>
              </div>

              {filteredSubjects.length === 0 ? (

                <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">

                  <div className="text-4xl">
                    📚
                  </div>

                  <h3 className="mt-4 text-xl font-black text-slate-900">
                    Ders bulunamadı
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Bu sınav türü için henüz ders
                    tanımlanmamış.
                  </p>

                </div>

              ) : (

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                  {filteredSubjects.map(
                    (subject) => {

                      const subjectTopicCount =
                        topics.filter(
                          (topic) =>
                            topic.subject_id ===
                            subject.id
                        ).length;

                      const isSelected =
                        selectedSubject ===
                        subject.id;

                      return (
                        <button
                          key={subject.id}
                          onClick={() =>
                            setSelectedSubject(
                              subject.id
                            )
                          }
                          className={`group rounded-2xl border p-5 text-left transition ${
                            isSelected
                              ? "border-indigo-200 bg-indigo-50 shadow-sm"
                              : "border-slate-100 bg-white hover:border-indigo-100 hover:bg-indigo-50/50 hover:shadow-sm"
                          }`}
                        >

                          <div className="flex items-start justify-between gap-4">

                            <div className="flex min-w-0 items-center gap-4">

                              <div
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl transition ${
                                  isSelected
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                                }`}
                              >
                                📖
                              </div>

                              <div className="min-w-0">

                                <h3
                                  className={`truncate text-lg font-black ${
                                    isSelected
                                      ? "text-indigo-900"
                                      : "text-slate-900"
                                  }`}
                                >
                                  {subject.name}
                                </h3>

                                <p className="mt-1 text-xs font-medium text-slate-400">
                                  {subjectTopicCount} konu
                                </p>

                              </div>

                            </div>

                            {isSelected && (
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-black text-white">
                                ✓
                              </div>
                            )}

                          </div>

                        </button>
                      );
                    }
                  )}

                </div>

              )}

            </section>

            {/* SELECTED SUBJECT */}

            {selectedSubjectData && (
              <section className="mt-6">

                <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

                  <div className="border-b border-slate-100 p-5 sm:p-6">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                          {selectedExam}
                        </p>

                        <h2 className="mt-1 text-2xl font-black text-slate-900">
                          {selectedSubjectData.name}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Bu derse eklediğin konular.
                        </p>
                      </div>

                      <div className="rounded-xl bg-indigo-50 px-4 py-3 text-center">
                        <p className="text-2xl font-black text-indigo-600">
                          {selectedTopics.length}
                        </p>

                        <p className="text-xs font-bold text-indigo-400">
                          konu
                        </p>
                      </div>

                    </div>

                  </div>

                  {/* TOPICS */}

                  {selectedTopics.length === 0 ? (

                    <div className="p-10 text-center sm:p-14">

                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                        📝
                      </div>

                      <h3 className="mt-5 text-lg font-black text-slate-900">
                        Henüz konu eklenmemiş
                      </h3>

                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                        Bu ders için henüz bir konu
                        oluşturmadın. Konular sayfasından
                        kendi çalışma konularını ekleyebilirsin.
                      </p>

                    </div>

                  ) : (

                    <div className="divide-y divide-slate-100">

                      {selectedTopics.map(
                        (topic, index) => (

                          <div
                            key={topic.id}
                            className="flex items-center gap-4 p-4 transition hover:bg-slate-50 sm:p-5"
                          >

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-500">
                              {String(
                                index + 1
                              ).padStart(2, "0")}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-slate-800">
                                {topic.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Konu
                              </p>
                            </div>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>

              </section>
            )}

            {/* INFO */}

            <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">

              <div className="flex gap-4">

                <div className="text-2xl">
                  💡
                </div>

                <div>

                  <h3 className="font-black text-indigo-900">
                    Ders sistemi nasıl çalışıyor?
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-indigo-700">
                    TYT ve AYT dersleri sistem tarafından
                    hazır olarak sunulur. Konular ise sabit
                    değildir. Her öğrenci kendi çalışma
                    sistemine göre konularını oluşturabilir.
                    Böylece değişen müfredatlara ve farklı
                    çalışma yöntemlerine uyum sağlayabiliriz.
                  </p>

                </div>

              </div>

            </div>

          </div>
        </div>
      </div>
    </main>
  );
}