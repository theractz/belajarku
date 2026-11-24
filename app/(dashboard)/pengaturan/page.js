"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BookOpen,
  Flame,
  GraduationCap,
  ListChecks,
  LogOut,
  Mail,
  Save,
  Shield,
  Target,
  Zap,
} from "lucide-react";
import { useData } from "@/components/DataProvider";
import {
  getCurrentUser,
  getMaterials,
  getResults,
  resetAllData,
  updateUser,
  updateClassLevel,
} from "@/lib/storage";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export default function PengaturanPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, refresh, logout } = useData();
  const [name, setName] = useState(user?.name || "");
  const [classLevel, setClassLevel] = useState(String(user?.class_level || ""));
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetOpen, setResetOpen] = useState(false);

  function saveProfile() {
    if (!name.trim()) {
      toast("Nama tidak boleh kosong.", "error");
      return;
    }
    updateUser({ name: name.trim() });
    if (classLevel) updateClassLevel(Number(classLevel));
    refresh();
    toast("Profil berhasil disimpan.");
  }

  function savePassword() {
    if (!password) {
      toast("Masukkan password lama dahulu.", "error");
      return;
    }
    const current = getCurrentUser();
    if (current?.password !== password) {
      toast("Password lama salah.", "error");
      return;
    }
    if (newPassword.length < 6) {
      toast("Password baru minimal 6 karakter.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("Konfirmasi password baru tidak cocok.", "error");
      return;
    }
    updateUser({ password: newPassword });
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast("Password berhasil diganti.");
  }

  function handleReset() {
    resetAllData();
    router.replace("/login");
  }

  if (!user) return null;

  const quizResults = getResults(user.id);
  const stats = [
    { label: "XP", value: user.xp, icon: Zap, color: "text-amber-500 bg-amber-50" },
    { label: "Streak", value: `${user.streak} hari`, icon: Flame, color: "text-orange-500 bg-orange-50" },
    { label: "Materi", value: getMaterials(user.id).length, icon: BookOpen, color: "text-sky-600 bg-sky-50" },
    { label: "Kuis", value: quizResults.length, icon: ListChecks, color: "text-teal-600 bg-teal-50" },
    { label: "Soal", value: quizResults.reduce((sum, item) => sum + (item.total || 0), 0), icon: Target, color: "text-violet-600 bg-violet-50" },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Pengaturan</h1>
          <p className="mt-1 text-sm text-muted">
            Kelola akun dan preferensi Belajarku kamu.
          </p>
        </div>
        <Badge variant="primary">Akun {user.email}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${s.color}`}>
                <Icon className="h-4 w-4" />
              </span>
              <p className="mt-2 text-lg font-bold">{s.value}</p>
              <p className="text-xs text-muted">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <div className="flex h-10 items-center gap-2 rounded-xl border border-border bg-muted-bg px-3 text-sm text-muted">
                <Mail className="h-4 w-4" />
                <span className="truncate">{user.email}</span>
              </div>
            </div>
            <div>
              <Label htmlFor="class">Kelas</Label>
              <Select id="class" value={classLevel} onChange={(e) => setClassLevel(e.target.value)}>
                <option value="">Pilih kelas</option>
                <option value="7">Kelas VII</option>
                <option value="8">Kelas VIII</option>
                <option value="9">Kelas IX</option>
              </Select>
            </div>
            <Button onClick={saveProfile}>
              <Save className="h-4 w-4" />
              Simpan Profil
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Keamanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="oldPass">Password Lama</Label>
                <Input
                  id="oldPass"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="newPass">Password Baru</Label>
                <Input
                  id="newPass"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirmPass">Konfirmasi Password Baru</Label>
                <Input
                  id="confirmPass"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={savePassword}>
                <Shield className="h-4 w-4" />
                Ganti Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              Tentang Belajarku
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted">
              Belajarku mengubah materi pelajaranmu menjadi soal kuis dengan
              bantuan AI. Setiap kuis memberi XP dan menjaga streak belajarmu
              tetap menyala.
            </p>
            <p className="mt-3 text-xs text-muted">
              Semua data tersimpan aman di perangkat ini dan tidak dikirim ke mana
              pun.
            </p>
          </CardContent>
        </Card>

        <Card className="border-danger/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-danger">
              <AlertTriangle className="h-4 w-4" />
              Zona Berbahaya
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted">
              Hapus semua data (akun, materi, dan riwayat kuis) dari peramban
              ini. Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4" />
                Keluar
              </Button>
              <Button variant="destructive" onClick={() => setResetOpen(true)}>
                <AlertTriangle className="h-4 w-4" />
                Hapus Semua Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={handleReset}
        title="Hapus semua data?"
        description="Seluruh akun, materi, dan riwayat kuis akan dihapus permanen dari peramban ini."
        confirmLabel="Hapus Semua"
      />
    </div>
  );
}