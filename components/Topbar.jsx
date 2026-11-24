"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Zap } from "lucide-react";
import { useData } from "@/components/DataProvider";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/materi-saya": "Materi Saya",
  "/kuis": "Kuis",
  "/riwayat": "Riwayat",
  "/pengaturan": "Pengaturan",
};

function pageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const match = Object.keys(PAGE_TITLES)
    .filter((key) => key !== "/dashboard")
    .find((key) => pathname.startsWith(`${key}/`));
  return match ? PAGE_TITLES[match] : "Belajarku";
}

function todayLabel() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Topbar({ onMenuOpen }) {
  const pathname = usePathname();
  const { user } = useData();
  const initial = (user?.name || user?.email || "B").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        className="cursor-pointer rounded-lg p-2 text-muted transition hover:bg-muted-bg lg:hidden"
        onClick={onMenuOpen}
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold sm:text-base">{pageTitle(pathname)}</p>
        <p className="hidden truncate text-xs text-muted sm:block">{todayLabel()}</p>
      </div>

      <span
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground"
        title={`Total XP kamu: ${user?.xp ?? 0}`}
      >
        <Zap className="h-3.5 w-3.5 text-amber-500" />
        {user?.xp ?? 0} XP
      </span>

      <Link
        href="/pengaturan"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90"
        title="Buka pengaturan profil"
        aria-label="Buka pengaturan profil"
      >
        {initial}
      </Link>
    </header>
  );
}
