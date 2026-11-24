"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  History,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Settings,
  X,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useData } from "@/components/DataProvider";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/materi-saya", label: "Materi Saya", icon: BookOpen },
  { href: "/kuis", label: "Kuis", icon: ListChecks },
  { href: "/riwayat", label: "Riwayat", icon: History },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useData();

  const initial = (user?.name || user?.email || "B").charAt(0).toUpperCase();
  const classLabel = user?.class_level
    ? `Kelas ${user.class_level}`
    : "Belum pilih kelas";

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-sidebar transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-base font-bold tracking-tight">
              Belajar<span className="text-primary">ku</span>
            </span>
          </Link>
          <button
            type="button"
            className="rounded-lg p-1.5 text-muted transition hover:bg-muted-bg lg:hidden"
            onClick={onClose}
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-muted-bg hover:text-foreground",
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="mb-2 flex items-center gap-2 rounded-xl border border-border bg-accent px-3 py-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-semibold text-foreground">
              {user?.xp ?? 0} XP
            </span>
            <span className="ml-auto text-[11px] text-muted">{classLabel}</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-muted-bg p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {initial}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{user?.name || "Pengguna"}</p>
              <p className="truncate text-xs text-muted">
                {user?.email || "Akun lokal"}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="cursor-pointer rounded-lg p-1.5 text-muted transition hover:bg-card hover:text-danger"
              title="Keluar"
              aria-label="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}