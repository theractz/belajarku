"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, GraduationCap } from "lucide-react";
import { getCurrentUser, updateClassLevel } from "@/lib/storage";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LEVELS = [
  {
    value: 7,
    title: "Kelas VII",
    badge: "SMP",
    description: "Semester awal — fondasi yang seru untuk dipelajari.",
  },
  {
    value: 8,
    title: "Kelas VIII",
    badge: "SMP",
    description: "Pertengahan jalan — materimu makin menantang!",
  },
  {
    value: 9,
    title: "Kelas IX",
    badge: "SMP",
    description: "Tahun terakhir — persiapkan diri untuk ujian.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const toast = useToast();
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (getCurrentUser()?.class_level) router.replace("/dashboard");
  }, [router]);

  function handleContinue() {
    if (!selected) return;
    setSaving(true);
    updateClassLevel(selected);
    toast("Kelas berhasil disimpan, selamat belajar!");
    router.replace("/dashboard");
    setSaving(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center gap-2.5 px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
          <GraduationCap className="h-5 w-5" />
        </span>
        <span className="text-base font-bold">Belajar<span className="text-primary">ku</span></span>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              Kamu duduk di kelas berapa?
            </h1>
            <p className="mt-2 text-sm text-muted">
              Pilih kelasmu agar soal kuis sesuai tingkatanmu. Kamu bisa
              mengubahnya nanti di Pengaturan.
            </p>
          </div>

          <div className="space-y-3">
            {LEVELS.map((level) => {
              const active = selected === level.value;
              return (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setSelected(level.value)}
                  className={cn(
                    "flex w-full cursor-pointer items-start gap-4 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition",
                    active
                      ? "border-primary bg-accent ring-2 ring-ring/30"
                      : "hover:border-primary/40 hover:shadow-md",
                  )}
                  aria-pressed={active}
                >
                  <span
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                      active
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
                        : "bg-muted-bg text-muted",
                    )}
                  >
                    {level.value}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{level.title}</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {level.badge}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {level.description}
                    </span>
                  </span>
                  {active ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <Button
            size="lg"
            className="mt-6 w-full"
            disabled={!selected || saving}
            onClick={handleContinue}
          >
            Lanjut
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}