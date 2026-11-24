"use client";

import Link from "next/link";
import { BookOpen, CheckCircle2, GraduationCap, Sparkles } from "lucide-react";

const FEATURES = [
  "Upload materi PDF, DOCX, atau TXT",
  "Ubah materi jadi soal kuis dengan AI",
  "Kerjakan kuis & lihat statistik benar/salah",
];

export default function AuthShell({ children }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="relative hidden w-[42%] max-w-xl flex-col justify-between overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 p-10 text-primary-foreground lg:flex">
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white_2px,transparent_2px)] [background-size:28px_28px]" />
        <Link href="/" className="relative flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <GraduationCap className="h-6 w-6" />
          </span>
          <span className="text-lg font-bold tracking-tight">
            Belajar<span className="text-white">ku</span>
          </span>
        </Link>

        <div className="relative space-y-6">
          <h1 className="text-3xl font-bold leading-tight">
            Ubah materi pelajaran menjadi kuis yang seru.
          </h1>
          <p className="text-sm leading-relaxed text-white/80">
            Belajarku membantu kamu memahami pelajaran lewat kuis yang dibuat
            langsung dari materi yang kamu unggah.
          </p>
          <ul className="space-y-3">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm font-medium">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-xs text-white/70">
          <Sparkles className="h-4 w-4" />
          Didukung AI • Data di perangkatmu • Tanpa install
        </p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
              <GraduationCap className="h-6 w-6" />
            </span>
            <span className="text-lg font-bold">Belajar<span className="text-primary">ku</span></span>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            {children}
          </div>
          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
            <BookOpen className="h-3.5 w-3.5" />
            Data kamu tersimpan aman di perangkat ini.
          </p>
        </div>
      </main>
    </div>
  );
}