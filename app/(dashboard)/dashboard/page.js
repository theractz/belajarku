"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookText,
  Brain,
  Dumbbell,
  FileUp,
  Flame,
  ListChecks,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useData } from "@/components/DataProvider";
import { getDashboardStats } from "@/lib/storage";
import { cn } from "@/lib/utils";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Kemarin";
  return `${days} hari lalu`;
}

const ACTIVITY_META = {
  kuis: { icon: Dumbbell, bg: "bg-emerald-50 text-emerald-600" },
  latihan: { icon: Dumbbell, bg: "bg-emerald-50 text-emerald-600" },
  generate: { icon: Sparkles, bg: "bg-violet-50 text-violet-600" },
  upload: { icon: BookText, bg: "bg-sky-50 text-sky-600" },
};

const SUMMARY = [
  { key: "xp", label: "Total XP", icon: Zap, box: "bg-amber-50 text-amber-500", accent: "text-amber-500" },
  { key: "streak", label: "Streak", icon: Flame, box: "bg-orange-50 text-orange-500", accent: "text-orange-500" },
  { key: "kuis", label: "Kuis Selesai", icon: ListChecks, box: "bg-teal-50 text-teal-600", accent: "text-teal-600" },
  { key: "skor", label: "Rata-rata Skor", icon: Target, box: "bg-violet-50 text-violet-600", accent: "text-violet-600" },
];

export default function DashboardPage() {
  const { user } = useData();
  const stats = useMemo(() => {
    if (!user) return null;
    return getDashboardStats(user.id);
  }, [user]);

  if (!stats) {
    return (
      <div className="space-y-5">
        <div className="h-20 w-full animate-pulse rounded-2xl bg-muted-bg" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 w-full animate-pulse rounded-2xl bg-muted-bg" />
          ))}
        </div>
        <div className="h-64 w-full animate-pulse rounded-2xl bg-muted-bg" />
      </div>
    );
  }

  const maxCount = Math.max(1, ...stats.last7Days.map((day) => day.count));
  const summaryValues = {
    xp: stats.user.xp,
    streak: `${stats.user.streak} hari`,
    kuis: stats.totalQuizzes,
    skor: `${stats.averageScore}%`,
  };
  const summaryCaptions = {
    xp: "Teruskan semangat belajarmu!",
    streak: "Belajar berturut-turut",
    kuis: "Kuis yang sudah diselesaikan",
    skor: "Rata-rata dari semua kuis",
  };
  const firstName = (user?.name || "Pejuang").split(" ")[0];
  const classLabel = stats.user.class_level
    ? `Kelas ${stats.user.class_level}`
    : "Pilih kelasmu untuk mulai";

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {greeting()}, {firstName}!
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted">
            <span>{classLabel}</span>
            <span className="hidden rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] font-semibold text-primary sm:inline-flex">
              {stats.questionsToday} soal dikerjakan hari ini
            </span>
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

      {stats.totalQuizzes === 0 ? (
        <section className="rounded-2xl border border-primary/20 bg-accent p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
              <Sparkles className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold">Ayo mulai kuis pertamamu!</h2>
              <p className="mt-0.5 text-sm text-muted">
                Unggah materi pelajaranmu, lalu AI akan membuat soal yang langsung
                bisa kamu kerjakan.
              </p>
            </div>
            <Link
              href="/materi-saya/baru"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              <FileUp className="h-4 w-4" />
              Upload Materi
            </Link>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {[
              { icon: FileUp, label: "1. Unggah materi" },
              { icon: Sparkles, label: "2. Generate soal" },
              { icon: Dumbbell, label: "3. Kerjakan & lihat statistik" },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.label}
                  className="flex items-center gap-2 rounded-xl border border-primary/10 bg-card px-3 py-2.5 text-xs font-semibold"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  {step.label}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.key}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md"
            >
              <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", item.box)}>
                <Icon className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {item.label}
                </p>
                <p className={cn("mt-0.5 truncate text-2xl font-bold", item.accent)}>
                  {summaryValues[item.key]}
                </p>
                <p className="truncate text-xs text-muted">{summaryCaptions[item.key]}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold">Aktivitas Terakhir</h2>
              <p className="text-xs text-muted">Perjalanan belajarmu</p>
            </div>
            <Link
              href="/riwayat"
              className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary transition hover:text-accent-teal"
            >
              Lihat semua <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {stats.activities.length === 0 ? (
              <li className="py-8 text-center text-sm text-muted">
                Belum ada aktivitas. Mulai kuis sekarang!
              </li>
            ) : (
              stats.activities.map((activity) => {
                const meta = ACTIVITY_META[activity.type] || {
                  icon: Brain,
                  bg: "bg-muted-bg text-muted",
                };
                const Icon = meta.icon;
                return (
                  <li key={activity.id} className="flex items-center gap-3 py-3">
                    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", meta.bg)}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted">{relativeTime(activity.created_at)}</p>
                    </div>
                    {activity.xp > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-500">
                        <Zap className="h-3 w-3" /> +{activity.xp} XP
                      </span>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold">
                <TrendingUp className="h-4 w-4 text-primary" /> Statistik
              </h2>
              <p className="text-xs text-muted">7 hari terakhir</p>
            </div>
          </div>

          <div className="mb-2 flex h-36 items-end gap-2">
            {stats.last7Days.map((day, index) => (
              <div key={day.key} className="group flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] font-semibold text-muted opacity-0 transition group-hover:opacity-100">
                  {day.count}
                </span>
                <div
                  className="w-full rounded-full bg-primary/15 transition duration-150 group-hover:bg-primary/40"
                  style={{
                    height: `${Math.max(8, Math.round((day.count / maxCount) * 100))}%`,
                    backgroundColor: day.count > 0 ? "var(--primary)" : "var(--muted-bg)",
                    opacity: day.count > 0 ? Math.max(0.45, index / stats.last7Days.length + 0.3) : 1,
                  }}
                />
                <span className="text-[10px] text-muted">{day.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
            <div>
              <p className="text-xl font-bold">{stats.accuracy}%</p>
              <p className="text-xs text-muted">Akurasi</p>
            </div>
            <div>
              <p className="text-xl font-bold">{stats.totalQuestions}</p>
              <p className="text-xs text-muted">Soal dijawab</p>
            </div>
            <div>
              <p className="text-xl font-bold">{stats.questionsToday}</p>
              <p className="text-xs text-muted">Hari ini</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
