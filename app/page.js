import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Dumbbell,
  FileText,
  Flame,
  GraduationCap,
  LibraryBig,
  Sparkles,
  UploadCloud,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: UploadCloud,
    title: "Upload materimu",
    description:
      "Unggah PDF, DOCX, atau TXT dari buku catatan dan materi sekolahmu. Cukup satu klik.",
    color: "bg-sky-50 text-sky-600",
  },
  {
    icon: Sparkles,
    title: "AI menyusun soal",
    description:
      "AI mengubah materi menjadi soal pilihan ganda atau isian singkat lengkap dengan pembahasan.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: Dumbbell,
    title: "Kuis & statistik",
    description:
      "Kerjakan soal tanpa timer, dapatkan XP, jaga streak, dan lihat statistik benar/salah di akhir kuis.",
    color: "bg-emerald-50 text-emerald-600",
  },
];

const STEPS = [
  {
    icon: FileText,
    title: "Unggah materi",
    description: "Pilih file pelajaran yang ingin kamu kuasai.",
  },
  {
    icon: Sparkles,
    title: "Generate soal",
    description: "Atur mapel dan jumlah soal, lalu biarkan AI bekerja.",
  },
  {
    icon: CheckCircle2,
    title: "Kerjakan & lihat statistik",
    description: "Jawab semua soal, lalu lihat benar/salah dan pembahasannya.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-base font-bold tracking-tight">
              Belajar<span className="text-primary">ku</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-muted transition hover:bg-muted-bg hover:text-foreground"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              Daftar gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-32 right-0 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-teal-200/40 blur-3xl" />
          <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
            <div className="animate-fade-in">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Belajar dibantu AI, gratis untuk pelajar
              </span>
              <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Ubah materi sekolahmu jadi{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  soal kuis seru
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                Belajarku membantu siswa SMP memahami pelajaran lewat soal yang
                dibuat langsung dari materi yang kamu unggah. Lengkap dengan
                pembahasan, XP, dan streak biar makin semangat.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:from-emerald-600 hover:to-teal-700"
                >
                  Mulai belajar gratis
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted-bg"
                >
                  Sudah punya akun
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Tanpa install
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Tanpa kartu kredit
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Data aman di perangkatmu
                </span>
              </div>
            </div>

            <div className="relative animate-fade-in">
              <div className="rounded-3xl border border-border bg-card p-5 shadow-xl shadow-emerald-900/5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-primary">
                      <BookOpen className="h-3.5 w-3.5" />
                    </span>
                    IPA Biologi • Kelas VIII
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
                    Soal 1 dari 5
                  </span>
                </div>
                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted-bg">
                  <div className="h-full w-1/5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
                </div>
                <p className="mt-5 text-sm font-semibold leading-relaxed sm:text-base">
                  Organ tubuh manusia yang berfungsi menyaring darah dan membentuk
                  urine adalah ...
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    { key: "A", text: "Hati" },
                    { key: "B", text: "Ginjal" },
                    { key: "C", text: "Paru-paru" },
                    { key: "D", text: "Usus besar" },
                  ].map((option) => {
                    const correct = option.key === "B";
                    return (
                      <div
                        key={option.key}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm ${
                          correct
                            ? "border-primary/40 bg-accent font-semibold text-primary"
                            : "border-border bg-background"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                            correct
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted-bg text-muted"
                          }`}
                        >
                          {correct ? <CheckCircle2 className="h-4 w-4" /> : option.key}
                        </span>
                        {option.text}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-muted-bg px-3 py-2.5 text-xs font-semibold">
                  <span className="inline-flex items-center gap-1.5 text-amber-600">
                    <Zap className="h-3.5 w-3.5" /> +5 XP
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-orange-500">
                    <Flame className="h-3.5 w-3.5" /> Streak 6 hari
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-border bg-card px-4 py-3 shadow-lg sm:flex sm:items-center sm:gap-2">
                <LibraryBig className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-bold">Statistik Kuis</p>
                  <p className="text-[11px] text-muted">Benar & salah</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card/60">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Semua yang kamu butuhkan untuk belajar
              </h2>
              <p className="mt-3 text-sm text-muted">
                Dari catatan pelajaran sampai kuis interaktif, semuanya dalam satu
                tempat.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${feature.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 text-base font-bold">{feature.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Mulai dalam 3 langkah
            </h2>
            <p className="mt-3 text-sm text-muted">
              Nggak perlu paham teknologi. Cukup ikuti langkahnya.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <span className="absolute right-5 top-5 text-3xl font-bold text-muted-bg">
                    {index + 1}
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-bold">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 px-6 py-12 text-center text-white shadow-lg sm:px-12">
            <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white_2px,transparent_2px)] [background-size:28px_28px]" />
            <div className="relative">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Siap belajar dengan cara yang lebih seru?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-white/85">
                Buat akun gratis dan ubah materi pertamamu menjadi soal kuis
                dalam hitungan menit.
              </p>
              <Link
                href="/register"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
              >
                Daftar gratis sekarang
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted sm:flex-row sm:px-6">
          <p className="flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4 text-primary" />
            Belajarku — belajar lebih mudah untuk semua pelajar.
          </p>
          <p>Dibuat dengan semangat belajar.</p>
        </div>
      </footer>
    </div>
  );
}
