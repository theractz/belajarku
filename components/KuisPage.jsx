"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileUp,
  History,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { useData } from "@/components/DataProvider";
import {
  addResult,
  consumeGenerate,
  getRemainingGenerates,
  recordActivity,
} from "@/lib/storage";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const SUBJECTS = [
  "Matematika",
  "IPA Biologi",
  "IPA Fisika",
  "IPA Kimia",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "IPS",
  "PPKn",
  "Pendidikan Agama",
  "Informatika",
  "Seni Budaya",
  "PJOK",
  "Lainnya",
];

const COUNTS = [5, 10, 20];
const TYPES = [
  { value: "PG", label: "Pilihan Ganda" },
  { value: "isian", label: "Isian Singkat" },
];

function normalizeAnswer(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,;:!?]+$/, "");
}

function isCorrectAnswer(userAnswer, correctAnswer) {
  const answer = normalizeAnswer(userAnswer);
  if (!answer) return false;
  const accepted = normalizeAnswer(correctAnswer)
    .split(/\s*(?:\/|\||\batau\b|\bor\b)\s*/)
    .filter(Boolean);
  return accepted.includes(answer);
}

function answerLabel(question, value) {
  if (value === undefined || value === null || value === "") return "-";
  if (Array.isArray(question.options) && question.options.length > 0) {
    const option = question.options.find((item) => item.key === value);
    return option ? `${value}. ${option.value}` : String(value);
  }
  return String(value);
}

function scoreMessage(score) {
  if (score >= 85) return "Luar biasa! Kamu menguasainya.";
  if (score >= 70) return "Bagus! Terus tingkatkan ya.";
  if (score >= 50) return "Lumayan. Yuk pelajari lagi yang salah.";
  return "Jangan menyerah, coba lagi ya!";
}

export default function KuisPage({ initialMaterialId }) {
  const { materials, user, refresh } = useData();
  const toast = useToast();

  const [phase, setPhase] = useState("setup");
  const [materialId, setMaterialId] = useState(initialMaterialId || "");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [type, setType] = useState("PG");
  const [count, setCount] = useState(5);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [inputAnswer, setInputAnswer] = useState("");
  const [summary, setSummary] = useState(null);
  const [exitOpen, setExitOpen] = useState(false);

  const remaining = getRemainingGenerates();
  const selectedMaterial = useMemo(
    () => materials.find((material) => material.id === materialId) || null,
    [materials, materialId],
  );

  async function handleGenerate() {
    setError("");
    if (!selectedMaterial) {
      setError("Pilih materi terlebih dahulu.");
      return;
    }
    if (!String(selectedMaterial.extracted_text || "").trim()) {
      setError("Materi ini tidak memiliki teks. Upload ulang materinya.");
      return;
    }
    if (remaining <= 0) {
      setError("Kamu sudah mencapai batas 3x generate hari ini. Coba lagi besok!");
      return;
    }

    setPhase("generating");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extracted_text: selectedMaterial.extracted_text,
          count,
          type,
          subject,
          class_level: user?.class_level || 8,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat soal. Coba lagi.");
      }
      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("AI tidak menghasilkan soal. Coba lagi.");
      }
      const quota = consumeGenerate();
      if (quota.error) throw new Error(quota.error);

      setQuestions(data.questions);
      setAnswers({});
      setIndex(0);
      setSummary(null);
      setPhase("ready");
      toast(`${data.questions.length} soal siap dikerjakan!`);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan. Coba lagi.");
      setPhase("setup");
    }
  }

  function startQuiz() {
    setAnswers({});
    setIndex(0);
    setInputAnswer("");
    setSummary(null);
    setPhase("playing");
  }

  function answerQuestion(value) {
    const question = questions[index];
    if (!question || answers[index]) return;
    const correct = isCorrectAnswer(value, question.correct_answer);
    setAnswers((prev) => ({
      ...prev,
      [index]: { user_answer: value, is_correct: correct },
    }));
    setInputAnswer("");
  }

  function nextQuestion() {
    if (index + 1 >= questions.length) {
      finishQuiz();
      return;
    }
    setIndex((current) => current + 1);
    setInputAnswer("");
  }

  function finishQuiz() {
    const entries = questions.map((question, position) => ({
      question,
      position,
      ...answers[position],
    }));
    const correct = entries.filter((entry) => entry.is_correct).length;
    const wrong = entries.length - correct;
    const score = entries.length > 0 ? Math.round((correct / entries.length) * 100) : 0;
    const xp = correct * 5 + 10;
    const wrongList = entries
      .filter((entry) => !entry.is_correct)
      .map((entry) => ({
        number: entry.position + 1,
        question_text: entry.question.question_text,
        user_answer: entry.user_answer ?? "",
        correct_answer: entry.question.correct_answer,
        explanation: entry.question.explanation || "",
        options: entry.question.options || [],
      }));

    const saved = addResult({
      material_id: selectedMaterial?.id || null,
      material_name: selectedMaterial?.file_name || "Materi",
      subject,
      type,
      total: entries.length,
      correct,
      wrong,
      score,
      xp,
      wrong_questions: wrongList,
    });
    if (saved.error) {
      setError(saved.error);
      toast(saved.error, "error");
      return;
    }

    recordActivity({
      type: "kuis",
      title: `Menyelesaikan kuis ${subject} (${entries.length} soal)`,
      xp,
    });
    refresh();
    setSummary({ correct, wrong, total: entries.length, score, xp, wrongList });
    setPhase("done");
    toast(`Kuis selesai! +${xp} XP`, "success");
  }

  function resetToSetup() {
    setPhase("setup");
    setQuestions([]);
    setAnswers({});
    setIndex(0);
    setInputAnswer("");
    setSummary(null);
    setError("");
  }

  if (phase === "generating") {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-accent text-primary">
          <Loader2 className="h-8 w-8 animate-spin" />
        </span>
        <h1 className="mt-5 text-lg font-bold">AI sedang menyusun soal...</h1>
        <p className="mt-1 max-w-sm text-sm text-muted">
          Tunggu sebentar ya, soal dibuat dari materi {selectedMaterial?.file_name}.
        </p>
      </div>
    );
  }

  if (phase === "ready") {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
            <Sparkles className="h-8 w-8" />
          </span>
          <h1 className="mt-5 text-xl font-bold">Soal siap dikerjakan!</h1>
          <p className="mt-1 text-sm text-muted">
            {questions.length} soal {type === "isian" ? "isian singkat" : "pilihan ganda"}{" "}
            sudah dibuat dari materimu.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted-bg px-3 py-1.5">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              {selectedMaterial?.file_name}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted-bg px-3 py-1.5">
              {subject}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted-bg px-3 py-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              {questions.length} soal
            </span>
          </div>
          <p className="mt-5 text-xs text-muted">
            Kuis ini tidak disimpan. Statistik akan muncul setelah semua soal
            dijawab.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button size="lg" onClick={startQuiz}>
              <Play className="h-4 w-4" />
              Mulai Mengerjakan
            </Button>
            <Button size="lg" variant="outline" onClick={resetToSetup}>
              Buat Soal Lain
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "done" && summary) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm sm:p-8">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-500">
            <Trophy className="h-8 w-8" />
          </span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
            Skor Kuis
          </p>
          <p className="text-5xl font-bold tracking-tight text-primary">
            {summary.score}
            <span className="text-2xl">%</span>
          </p>
          <p className="mt-1 text-sm text-muted">{scoreMessage(summary.score)}</p>

          <div className="mx-auto mt-6 grid max-w-lg grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="text-lg font-bold text-success">{summary.correct}</p>
              <p className="text-xs text-muted">Benar</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="text-lg font-bold text-danger">{summary.wrong}</p>
              <p className="text-xs text-muted">Salah</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="text-lg font-bold">{summary.total}</p>
              <p className="text-xs text-muted">Total Soal</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="flex items-center justify-center gap-1 text-lg font-bold text-amber-500">
                <Zap className="h-4 w-4" />+{summary.xp}
              </p>
              <p className="text-xs text-muted">XP</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Button size="lg" onClick={startQuiz}>
              <RotateCcw className="h-4 w-4" />
              Kerjakan Lagi
            </Button>
            <Button size="lg" variant="outline" onClick={resetToSetup}>
              Buat Kuis Baru
            </Button>
            <Link
              href="/riwayat"
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-medium shadow-sm transition hover:bg-muted-bg"
            >
              <History className="h-4 w-4" />
              Lihat Riwayat
            </Link>
          </div>
        </div>

        {summary.wrongList.length > 0 ? (
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-5 py-4">
              <h2 className="flex items-center gap-2 text-base font-bold">
                <XCircle className="h-4 w-4 text-danger" />
                Soal yang Salah
              </h2>
              <p className="text-xs text-muted">
                Pelajari lagi jawaban yang benar dan pembahasannya.
              </p>
            </div>
            <div className="space-y-3 p-5">
              {summary.wrongList.map((item, position) => (
                <div
                  key={`${item.question_text}-${position}`}
                  className="rounded-xl border border-border p-4"
                >
                  <p className="text-xs font-semibold text-danger">
                    Soal {item.number}
                  </p>
                  <p className="mt-1 text-sm font-medium leading-relaxed">
                    {item.question_text}
                  </p>
                  <div className="mt-2 flex flex-col gap-1 text-xs">
                    <p>
                      Jawabanmu:{" "}
                      <span className="font-semibold text-danger">
                        {answerLabel(item, item.user_answer)}
                      </span>
                    </p>
                    <p>
                      Kunci:{" "}
                      <span className="font-semibold text-success">
                        {answerLabel(item, item.correct_answer)}
                      </span>
                    </p>
                  </div>
                  {item.explanation ? (
                    <p className="mt-2 rounded-lg bg-muted-bg p-2.5 text-xs leading-relaxed text-muted">
                      {item.explanation}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-accent p-5 text-sm font-medium text-primary">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            Semua jawabanmu benar. Hebat!
          </div>
        )}
      </div>
    );
  }

  if (phase === "playing") {
    const question = questions[index];
    const answered = Boolean(answers[index]);
    const currentAnswer = answers[index]?.user_answer;
    const isIsian = !Array.isArray(question.options) || question.options.length === 0;
    const progress = ((index + (answered ? 1 : 0)) / questions.length) * 100;
    const isLast = index + 1 >= questions.length;

    return (
      <div className="animate-fade-in space-y-5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setExitOpen(true)}
            className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Keluar
          </button>
          <div className="flex-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted-bg">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="shrink-0 text-xs font-semibold text-muted">
            {index + 1}/{questions.length}
          </span>
        </div>

        <p className="text-xs font-semibold text-primary">
          {subject} • {isIsian ? "Isian Singkat" : "Pilihan Ganda"}
        </p>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <p className="text-base font-semibold leading-relaxed sm:text-lg">
            {index + 1}. {question.question_text}
          </p>

          <div className="mt-5 space-y-2.5">
            {isIsian ? (
              <div className="space-y-3">
                <input
                  value={answered ? currentAnswer : inputAnswer}
                  onChange={(event) => setInputAnswer(event.target.value)}
                  disabled={answered}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && inputAnswer.trim() && !answered) {
                      answerQuestion(inputAnswer.trim());
                    }
                  }}
                  placeholder="Ketik jawabanmu..."
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:opacity-70"
                />
                {!answered ? (
                  <Button
                    disabled={!inputAnswer.trim()}
                    onClick={() => answerQuestion(inputAnswer.trim())}
                  >
                    Jawab
                  </Button>
                ) : (
                  <p className="flex items-center gap-1.5 text-xs font-medium text-muted">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Jawaban tersimpan. Lanjut ke soal berikutnya.
                  </p>
                )}
              </div>
            ) : (
              question.options.map((option) => {
                const isChosen = currentAnswer === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => answerQuestion(option.key)}
                    disabled={answered}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition disabled:cursor-default",
                      isChosen
                        ? "border-primary bg-accent text-primary"
                        : answered
                          ? "border-border bg-background opacity-50"
                          : "border-border bg-background hover:border-primary/50 hover:bg-accent",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                        isChosen ? "bg-primary text-primary-foreground" : "bg-muted-bg text-muted",
                      )}
                    >
                      {isChosen ? <CheckCircle2 className="h-4 w-4" /> : option.key}
                    </span>
                    <span className="min-w-0 flex-1">{option.value}</span>
                  </button>
                );
              })
            )}
          </div>

          {answered ? (
            <div className="mt-5 flex justify-end">
              <Button size="lg" onClick={nextQuestion}>
                {isLast ? "Selesai & Lihat Statistik" : "Soal Berikutnya"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>

        <ConfirmDialog
          open={exitOpen}
          onClose={() => setExitOpen(false)}
          onConfirm={resetToSetup}
          title="Keluar dari kuis?"
          description="Jawabanmu belum disimpan dan kuis ini akan hilang."
          confirmLabel="Keluar"
          cancelLabel="Lanjut Mengerjakan"
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Kuis</h1>
          <p className="mt-1 text-sm text-muted">
            Pilih materi, biarkan AI membuat soal, lalu langsung kerjakan.
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
            remaining > 0
              ? "border-border bg-card text-foreground"
              : "border-danger/30 bg-rose-50 text-danger",
          )}
        >
          <Zap className="h-4 w-4 text-amber-500" />
          Kuota generate: {remaining}/3 hari ini
        </span>
      </div>

      {materials.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
            <BookOpen className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-base font-semibold">Belum ada materi</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Upload materi pelajaranmu dulu, lalu AI akan membuat soal kuis dari
            materi tersebut.
          </p>
          <Link
            href="/materi-saya/baru"
            className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <FileUp className="h-4 w-4" />
            Upload Materi
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-3">
            <div>
              <label
                htmlFor="material"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Pilih Materi
              </label>
              <Select
                id="material"
                value={materialId}
                onChange={(event) => setMaterialId(event.target.value)}
              >
                <option value="">Pilih materi...</option>
                {materials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.file_name}
                  </option>
                ))}
              </Select>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                <span>
                  {selectedMaterial
                    ? `${selectedMaterial.extracted_text.length.toLocaleString("id-ID")} karakter`
                    : "Belum ada materi dipilih"}
                </span>
                <Link
                  href="/materi-saya/baru"
                  className="font-semibold text-primary hover:underline"
                >
                  Upload materi baru
                </Link>
              </div>
            </div>

            <div>
              <label
                htmlFor="subject"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted"
              >
                Mata Pelajaran
              </label>
              <Select
                id="subject"
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              >
                {SUBJECTS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Jenis Soal
              </span>
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setType(item.value)}
                    className={cn(
                      "cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                      type === item.value
                        ? "border-primary bg-accent text-primary"
                        : "border-border bg-background text-muted hover:border-primary/40",
                    )}
                    aria-pressed={type === item.value}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted">
                Jumlah Soal
              </span>
              <div className="grid grid-cols-3 gap-2">
                {COUNTS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCount(value)}
                    className={cn(
                      "cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-bold transition",
                      count === value
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border bg-background text-muted hover:border-primary/40",
                    )}
                    aria-pressed={count === value}
                  >
                    {value} Soal
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-danger/30 bg-rose-50 px-4 py-3 text-sm font-medium text-danger"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <Button
              size="lg"
              className="w-full"
              disabled={!selectedMaterial || remaining <= 0}
              onClick={handleGenerate}
            >
              <Sparkles className="h-4 w-4" />
              Generate {count} Soal dengan AI
            </Button>
          </div>

          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h2 className="text-base font-bold">Cara kerja kuis</h2>
              <ol className="mt-4 space-y-3">
                {[
                  "Pilih materi pelajaran yang sudah kamu upload.",
                  "Atur mapel, jenis, dan jumlah soal.",
                  "AI membuat soal, lalu klik Mulai Mengerjakan.",
                  "Jawab semua soal, lalu lihat statistikmu.",
                ].map((text, position) => (
                  <li key={text} className="flex items-start gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {position + 1}
                    </span>
                    <span className="text-muted">{text}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-accent p-4 text-xs leading-relaxed text-muted">
              Kuis bersifat sekali pakai dan tidak disimpan. Setelah selesai,
              statistik benar/salah akan tersimpan di Riwayat.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
