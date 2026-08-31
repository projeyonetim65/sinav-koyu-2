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

type TopicStatus =
  | "not_started"
  | "in_progress"
  | "completed";

type UserTopic = {
  topic_id: number;
  status: TopicStatus;
};

export default function TopicsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [progress, setProgress] = useState<UserTopic[]>([]);

  const [selectedExam, setSelectedExam] =
    useState<"TYT" | "AYT">("TYT");

  const [selectedSubject, setSelectedSubject] =
    useState<number | null>(null);

  const [newTopic, setNewTopic] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingTopic, setSavingTopic] =
    useState<number | null>(null);

  const [addingTopic, setAddingTopic] =
    useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

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
      { data: progressData, error: progressError },
    ] = await Promise.all([
      supabase
        .from("subjects")
        .select("id, name, exam")
        .order("id"),

      supabase
        .from("topics")
        .select(
          "id, name, subject_id, order_index, unit_id"
        )
        .eq("user_id", user.id)
        .order("order_index"),

      supabase
        .from("user_topics")
        .select("topic_id, status")
        .eq("user_id", user.id),
    ]);

    if (subjectError) {
      console.error(
        "Ders yükleme hatası:",
        subjectError.message
      );
    }

    if (topicError) {
      console.error(
        "Konu yükleme hatası:",
        topicError.message
      );
    }

    if (progressError) {
      console.error(
        "Konu ilerleme yükleme hatası:",
        progressError.message
      );
    }

    const loadedSubjects =
      subjectData || [];

    setSubjects(loadedSubjects);
    setTopics(topicData || []);
    setProgress(progressData || []);

    const firstTYT =
      loadedSubjects.find(
        (subject) =>
          subject.exam?.toUpperCase() === "TYT"
      );

    const firstAYT =
      loadedSubjects.find(
        (subject) =>
          subject.exam?.toUpperCase() === "AYT"
      );

    if (firstTYT) {
      setSelectedExam("TYT");
      setSelectedSubject(firstTYT.id);
    } else if (firstAYT) {
      setSelectedExam("AYT");
      setSelectedSubject(firstAYT.id);
    }

    setLoading(false);
  }

  const examSubjects = useMemo(() => {
    return subjects.filter(
      (subject) =>
        subject.exam?.toUpperCase() ===
        selectedExam
    );
  }, [subjects, selectedExam]);

  const currentSubject = subjects.find(
    (subject) =>
      subject.id === selectedSubject
  );

  const currentSubjectTopics =
    useMemo(() => {
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
            a.order_index -
            b.order_index
        );
    }, [topics, selectedSubject]);

  function getTopicStatus(
    topicId: number
  ): TopicStatus {
    return (
      progress.find(
        (item) =>
          item.topic_id === topicId
      )?.status || "not_started"
    );
  }

  async function addTopic() {
    const cleanTopic =
      newTopic.trim();

    if (!selectedSubject) {
      setMessage({
        type: "error",
        text: "Önce bir ders seçmelisin.",
      });

      return;
    }

    if (!cleanTopic) {
      setMessage({
        type: "error",
        text: "Konu adı boş bırakılamaz.",
      });

      return;
    }

    setAddingTopic(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.replace("/auth");
      return;
    }

    const nextOrder =
      currentSubjectTopics.length;

    const { data, error } =
      await supabase
        .from("topics")
        .insert({
          user_id: user.id,
          subject_id: selectedSubject,
          name: cleanTopic,
          order_index: nextOrder,
          unit_id: null,
        })
        .select(
          "id, name, subject_id, order_index, unit_id"
        )
        .single();

    if (error) {
      console.error(
        "Konu ekleme hatası:",
        error.message,
        error.details,
        error.hint,
        error.code
      );

      setMessage({
        type: "error",
        text: "Konu eklenemedi. Lütfen tekrar dene.",
      });

      setAddingTopic(false);
      return;
    }

    if (data) {
      setTopics((current) => [
        ...current,
        data,
      ]);
    }

    setNewTopic("");
    setAddingTopic(false);

    setMessage({
      type: "success",
      text: `"${cleanTopic}" konusu eklendi.`,
    });
  }

  async function updateTopicStatus(
    topicId: number,
    status: TopicStatus
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.replace("/auth");
      return;
    }

    setSavingTopic(topicId);
    setMessage(null);

    const { error } =
      await supabase
        .from("user_topics")
        .upsert(
          {
            user_id: user.id,
            topic_id: topicId,
            status,
            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              "user_id,topic_id",
          }
        );

    if (error) {
      console.error(
        "Konu durumu güncelleme hatası:",
        error.message,
        error.details,
        error.hint,
        error.code
      );

      setMessage({
        type: "error",
        text: "Konu durumu kaydedilemedi.",
      });

      setSavingTopic(null);
      return;
    }

    setProgress((current) => {
      const exists =
        current.some(
          (item) =>
            item.topic_id === topicId
        );

      if (exists) {
        return current.map((item) =>
          item.topic_id === topicId
            ? {
                ...item,
                status,
              }
            : item
        );
      }

      return [
        ...current,
        {
          topic_id: topicId,
          status,
        },
      ];
    });

    setSavingTopic(null);
  }

  function changeExam(
    exam: "TYT" | "AYT"
  ) {
    setSelectedExam(exam);

    const firstSubject =
      subjects.find(
        (subject) =>
          subject.exam?.toUpperCase() ===
          exam
      );

    setSelectedSubject(
      firstSubject?.id || null
    );

    setMessage(null);
  }

  const completedCount =
    currentSubjectTopics.filter(
      (topic) =>
        getTopicStatus(topic.id) ===
        "completed"
    ).length;

  const inProgressCount =
    currentSubjectTopics.filter(
      (topic) =>
        getTopicStatus(topic.id) ===
        "in_progress"
    ).length;

  const totalTopicCount =
    currentSubjectTopics.length;

  const progressPercentage =
    totalTopicCount > 0
      ? Math.round(
          (completedCount /
            totalTopicCount) *
            100
        )
      : 0;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl">
            📚
          </div>

          <p className="mt-4 font-semibold text-slate-600">
            Konular yükleniyor...
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
                    <span>🎯</span>
                    <span>KONU TAKİBİ</span>
                  </div>

                  <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                    Konularım
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                    Derslerini seç, kendi konularını
                    oluştur ve çalışma durumunu takip et.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">

                  <div className="rounded-2xl bg-white px-4 py-4 text-center shadow-sm">
                    <p className="text-xs font-semibold text-slate-400">
                      Toplam
                    </p>

                    <p className="mt-1 text-xl font-black text-slate-900">
                      {totalTopicCount}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white px-4 py-4 text-center shadow-sm">
                    <p className="text-xs font-semibold text-slate-400">
                      Çalışıyorum
                    </p>

                    <p className="mt-1 text-xl font-black text-amber-500">
                      {inProgressCount}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white px-4 py-4 text-center shadow-sm">
                    <p className="text-xs font-semibold text-slate-400">
                      Tamamlandı
                    </p>

                    <p className="mt-1 text-xl font-black text-emerald-600">
                      {completedCount}
                    </p>
                  </div>

                </div>

              </div>
            </div>

            {/* MESSAGE */}

            {message && (
              <div
                className={`mb-5 rounded-xl border px-4 py-3 text-sm font-semibold ${
                  message.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* EXAM */}

            <div className="rounded-2xl bg-white p-2 shadow-sm">

              <div className="grid grid-cols-2 gap-2">

                <button
                  onClick={() =>
                    changeExam("TYT")
                  }
                  className={`rounded-xl px-5 py-3 text-sm font-black transition ${
                    selectedExam === "TYT"
                      ? "bg-indigo-600 text-white"
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
                      ? "bg-indigo-600 text-white"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  AYT
                </button>

              </div>

            </div>

            {/* SUBJECTS */}

            <div className="mt-4">

              <div className="flex gap-2 overflow-x-auto pb-2">

                {examSubjects.map(
                  (subject) => (

                    <button
                      key={subject.id}
                      onClick={() =>
                        setSelectedSubject(
                          subject.id
                        )
                      }
                      className={`whitespace-nowrap rounded-xl px-5 py-3 text-sm font-bold transition ${
                        selectedSubject ===
                        subject.id
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-600 shadow-sm hover:bg-slate-100"
                      }`}
                    >
                      {subject.name}
                    </button>

                  )
                )}

              </div>

            </div>

            {/* SUBJECT */}

            {currentSubject && (
              <div className="mt-6 rounded-2xl bg-white shadow-sm">

                <div className="border-b border-slate-100 p-5 sm:p-6">

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                    <div>

                      <p className="text-xs font-bold uppercase tracking-wider text-indigo-500">
                        {selectedExam}
                      </p>

                      <h2 className="mt-1 text-2xl font-black text-slate-900">
                        {currentSubject.name}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Bu derse ait kendi konularını ekle.
                      </p>

                    </div>

                    <div className="text-left sm:text-right">

                      <p className="text-2xl font-black text-indigo-600">
                        %{progressPercentage}
                      </p>

                      <p className="text-xs text-slate-400">
                        tamamlanma
                      </p>

                    </div>

                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                      style={{
                        width: `${progressPercentage}%`,
                      }}
                    />

                  </div>

                </div>

                {/* ADD TOPIC */}

                <div className="border-b border-slate-100 bg-slate-50/60 p-5 sm:p-6">

                  <div className="mb-3">
                    <h3 className="font-black text-slate-900">
                      Yeni Konu Ekle
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Bu dersi kendi çalışma sistemine göre
                      istediğin şekilde oluşturabilirsin.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">

                    <input
                      type="text"
                      value={newTopic}
                      onChange={(event) =>
                        setNewTopic(
                          event.target.value
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          !addingTopic
                        ) {
                          addTopic();
                        }
                      }}
                      placeholder="Örn. Problemler"
                      maxLength={100}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    />

                    <button
                      onClick={addTopic}
                      disabled={
                        addingTopic ||
                        !newTopic.trim()
                      }
                      className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-black text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {addingTopic
                        ? "Ekleniyor..."
                        : "Konu Ekle"}
                    </button>

                  </div>

                </div>

                {/* TOPICS */}

                {currentSubjectTopics.length ===
                0 ? (

                  <div className="p-10 text-center sm:p-14">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                      📝
                    </div>

                    <h3 className="mt-5 text-lg font-black text-slate-900">
                      Henüz konu eklemedin
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                      Yukarıdaki alandan bu derse ait
                      ilk konunu oluşturabilirsin.
                    </p>

                  </div>

                ) : (

                  <div className="divide-y divide-slate-100">

                    {currentSubjectTopics.map(
                      (topic, index) => {

                        const status =
                          getTopicStatus(
                            topic.id
                          );

                        const isSaving =
                          savingTopic ===
                          topic.id;

                        return (

                          <div
                            key={topic.id}
                            className="p-4 transition hover:bg-slate-50 sm:p-5"
                          >

                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                              <div className="flex min-w-0 items-center gap-3">

                                <div
                                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                                    status ===
                                    "completed"
                                      ? "bg-emerald-100 text-emerald-600"
                                      : status ===
                                        "in_progress"
                                      ? "bg-amber-100 text-amber-600"
                                      : "bg-slate-100 text-slate-400"
                                  }`}
                                >
                                  {status ===
                                  "completed"
                                    ? "✓"
                                    : index + 1}
                                </div>

                                <div className="min-w-0">

                                  <p
                                    className={`text-sm font-bold ${
                                      status ===
                                      "completed"
                                        ? "text-slate-400 line-through"
                                        : "text-slate-800"
                                    }`}
                                  >
                                    {topic.name}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">

                                    {status ===
                                    "completed"
                                      ? "Konu tamamlandı"
                                      : status ===
                                        "in_progress"
                                      ? "Bu konu üzerinde çalışıyorsun"
                                      : "Henüz başlanmadı"}

                                  </p>

                                </div>

                              </div>

                              <div className="flex flex-wrap gap-2 lg:justify-end">

                                <button
                                  disabled={
                                    isSaving
                                  }
                                  onClick={() =>
                                    updateTopicStatus(
                                      topic.id,
                                      "not_started"
                                    )
                                  }
                                  className={`rounded-lg px-3 py-2 text-xs font-bold transition disabled:opacity-50 ${
                                    status ===
                                    "not_started"
                                      ? "bg-slate-900 text-white"
                                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                  }`}
                                >
                                  Başlamadım
                                </button>

                                <button
                                  disabled={
                                    isSaving
                                  }
                                  onClick={() =>
                                    updateTopicStatus(
                                      topic.id,
                                      "in_progress"
                                    )
                                  }
                                  className={`rounded-lg px-3 py-2 text-xs font-bold transition disabled:opacity-50 ${
                                    status ===
                                    "in_progress"
                                      ? "bg-amber-500 text-white"
                                      : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                  }`}
                                >
                                  Çalışıyorum
                                </button>

                                <button
                                  disabled={
                                    isSaving
                                  }
                                  onClick={() =>
                                    updateTopicStatus(
                                      topic.id,
                                      "completed"
                                    )
                                  }
                                  className={`rounded-lg px-3 py-2 text-xs font-bold transition disabled:opacity-50 ${
                                    status ===
                                    "completed"
                                      ? "bg-emerald-600 text-white"
                                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  }`}
                                >
                                  Tamamlandı
                                </button>

                              </div>

                            </div>

                          </div>

                        );
                      }
                    )}

                  </div>

                )}

              </div>
            )}

            {/* INFO */}

            <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">

              <div className="flex gap-4">

                <div className="text-2xl">
                  💡
                </div>

                <div>

                  <h3 className="font-black text-indigo-900">
                    Konular artık sana özel
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-indigo-700">
                    TYT ve AYT dersleri sistem tarafından
                    hazır olarak sunulur. Konuları ise kendi
                    çalışma düzenine göre sen oluşturursun.
                    Böylece farklı kaynaklar veya çalışma
                    yöntemleri kullansan bile sistemi kendine
                    göre şekillendirebilirsin.
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