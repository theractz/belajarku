"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, Sparkles } from "lucide-react";
import { getCurrentUser, loginUser } from "@/lib/storage";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthShell from "@/components/AuthShell";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) router.replace(user.class_level ? "/dashboard" : "/onboarding");
  }, [router]);

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }
    setLoading(true);
    const result = loginUser({ email, password });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    toast("Selamat datang kembali, " + (result.user.name || "Belajar") + "!");
    router.replace(result.user.class_level ? "/dashboard" : "/onboarding");
  }

  return (
    <AuthShell>
      <h1 className="text-xl font-bold tracking-tight">Masuk ke Belajarku</h1>
      <p className="mb-6 mt-1 text-sm text-muted">
        Lanjutkan perjalanan belajarmu di mana pun kamu berhenti.
      </p>

      {error ? (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-danger/30 bg-rose-50 px-4 py-3 text-sm font-medium text-danger"
        >
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="kamu@contoh.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="pr-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted transition hover:bg-muted-bg hover:text-foreground"
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          <LogIn className="h-4 w-4" />
          {loading ? "Memproses..." : "Masuk"}
        </Button>
      </form>

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
        Gratis, tanpa kartu kredit.
      </p>

      <p className="mt-6 text-center text-sm text-muted">
        Belum punya akun?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          Daftar gratis
        </Link>
      </p>
    </AuthShell>
  );
}
