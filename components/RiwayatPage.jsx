"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  History,
  ListChecks,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { useData } from "@/components/DataProvider";
import { deleteResult } from "@/lib/storage";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function answerLabel(question, value) {
  if (value === undefined || value === null || value === "") return "-";
  if (Array.isArray(question.options) && question.options.length > 0) {
    const option = question.options.find((item) => item.key === value);
    return option ? `${value}. ${option.value}` : String(value);
  }
  return String(value);
}

export default function RiwayatPage() {
  const { results, refresh } = useData();
  const toast = useToast();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const stats = useMemo(() => {
    const totalQuizzes = results.length;
    const totalQuestions = results.reduce((sum, item) => sum + (item.total || 0), 0);
    const totalCorrect = results.reduce((sum, item) => sum + (item.correct || 0), 0);
    const averageScore =
      totalQuizzes > 0
        ? Math.round(
            results.reduce((sum, item) => sum + (item.score || 0), 0) / totalQuizzes,
          )
        : 0;
    return {
      totalQuizzes,
      totalQuestions,
      averageScore,
      accuracy:
        totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
    };
  }, [results]);

  function handleDelete() {
    if (!deleteTarget) return;
    deleteResult(deleteTarget.id);
    refresh();
    toast("Riwayat kuis dihapus.");
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Riwayat</h1>
          <p className="mt-1 text-sm text-muted">
            Statistik hasil kuis yang sudah kamu selesaikan.
          </p>
        </div>
        <Link
          href="/kuis"
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:from-emerald-600 hover:to-teal-700"
        >
          <Sparkles className="h-4 w-4" />
          Mulai Kuis
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Kuis Selesai", value: stats.totalQuizzes, icon: ListChecks, color: "text-teal-600 bg-teal-50" },
          { label: "Rata-rata Skor", value: `${stats.averageScore}%`, icon: Trophy, color: "text-amber-500 bg-amber-50" },
          { label: "Akurasi", value: `${stats.accuracy}%`, icon: Target, color: "text-violet-600 bg-violet-50" },
          { label: "Soal Dikerjakan", value: stats.totalQuestions, icon: History, color: "text-sky-600 bg-sky-50" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${item.color}`}>
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-2 text-lg font-bold">{item.value}</p>
              <p className="text-xs text-muted">{item.label}</p>
            </div>
          );
        })}
      </div>

      {results.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
            <History className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-base font-semibold">Belum ada riwayat kuis</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Selesaikan kuis pertamamu untuk melihat statistik benar/salah di sini.
          </p>
          <Link
            href="/kuis"
            className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <Sparkles className="h-4 w-4" />
            Mulai Kuis Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((result) => {
            const wrongQuestions = result.wrong_questions || [];
            return (
              <div
                key={result.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {result.material_name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatDate(result.created_at)} • {formatTime(result.created_at)}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {result.subject ? (
                        <Badge variant="primary">{result.subject}</Badge>
                      ) : null}
                      <Badge variant="default">
                        {result.type === "isian" ? "Isian" : "Pilihan Ganda"}
                      </Badge>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-600">
                        <Zap className="h-3 w-3" />+{result.xp} XP
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{result.score}%</p>
                    <p className="text-xs text-muted">
                      {result.correct}/{result.total} benar
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(result)}
                    className="cursor-pointer rounded-lg p-2 text-muted transition hover:bg-danger/10 hover:text-danger"
                    aria-label="Hapus riwayat kuis"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center text-xs">
                  <div>
                    <p className="font-bold text-success">{result.correct}</p>
                    <p className="text-muted">Benar</p>
                  </div>
                  <div>
                    <p className="font-bold text-danger">{result.wrong}</p>
                    <p className="text-muted">Salah</p>
                  </div>
                  <div>
                    <p className="font-bold">{result.total}</p>
                    <p className="text-muted">Total Soal</p>
                  </div>
                </div>

                {wrongQuestions.length > 0 ? (
                  <details className="mt-3">
                    <summary className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-primary">
                      <XCircle className="h-3.5 w-3.5" />
                      Lihat {wrongQuestions.length} soal yang salah
                    </summary>
                    <div className="mt-2 space-y-2">
                      {wrongQuestions.map((item, position) => (
                        <div
                          key={`${result.id}-${position}`}
                          className="rounded-xl bg-muted-bg p-3"
                        >
                          <p className="text-[11px] font-semibold text-danger">
                            Soal {item.number ?? position + 1}
                          </p>
                          <p className="mt-0.5 text-sm font-medium leading-relaxed">
                            {item.question_text}
                          </p>
                          <div className="mt-1.5 flex flex-col gap-0.5 text-xs">
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
                            <p className="mt-1.5 text-xs leading-relaxed text-muted">
                              {item.explanation}
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </details>
                ) : (
                  <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Semua jawaban benar.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus riwayat ini?"
        description="Statistik kuis ini akan dihapus permanen. Soal kuis tidak tersimpan."
        confirmLabel="Hapus"
      />
    </div>
  );
}
