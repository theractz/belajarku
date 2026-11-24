"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  FileUp,
  Play,
  Trash2,
} from "lucide-react";
import { useData } from "@/components/DataProvider";
import { deleteMaterial } from "@/lib/storage";
import { useToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";

const FILE_TYPE_META = {
  pdf: { icon: FileText, bg: "bg-rose-50 text-rose-600" },
  docx: { icon: FileText, bg: "bg-sky-50 text-sky-600" },
  txt: { icon: FileText, bg: "bg-emerald-50 text-emerald-600" },
};

function fileTypeOf(name = "") {
  const ext = String(name).split(".").pop().toLowerCase();
  return FILE_TYPE_META[ext] || FILE_TYPE_META.txt;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MateriSayaPage() {
  const { materials, results, refresh } = useData();
  const toast = useToast();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const statsByMaterial = useMemo(() => {
    const map = {};
    results.forEach((result) => {
      if (!result.material_id) return;
      const current = map[result.material_id] || { count: 0, lastScore: null };
      current.count += 1;
      if (current.lastScore === null) current.lastScore = result.score;
      map[result.material_id] = current;
    });
    return map;
  }, [results]);

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMaterial(deleteTarget.id);
    refresh();
    toast("Materi berhasil dihapus.");
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Materi Saya</h1>
          <p className="mt-1 text-sm text-muted">
            Berkas materi yang kamu unggah dan hasil kuis dari tiap materi.
          </p>
        </div>
        <Link
          href="/materi-saya/baru"
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:from-emerald-600 hover:to-teal-700"
        >
          <FileUp className="h-4 w-4" />
          Upload Materi Baru
        </Link>
      </div>

      {materials.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
            <BookOpen className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-base font-semibold">Belum ada materi</h2>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Upload PDF, DOCX, atau TXT untuk dibuatkan soal kuis oleh AI.
          </p>
          <Link
            href="/materi-saya/baru"
            className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <FileUp className="h-4 w-4" />
            Upload Sekarang
          </Link>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                    <th className="px-5 py-3 font-semibold">File Materi</th>
                    <th className="px-5 py-3 font-semibold">Tanggal Upload</th>
                    <th className="px-5 py-3 text-center font-semibold">Kuis Selesai</th>
                    <th className="px-5 py-3 text-center font-semibold">Skor Terakhir</th>
                    <th className="px-5 py-3 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {materials.map((material) => {
                    const typeMeta = fileTypeOf(material.file_name);
                    const TypeIcon = typeMeta.icon;
                    const stats = statsByMaterial[material.id];
                    return (
                      <tr key={material.id} className="transition hover:bg-muted-bg/50">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", typeMeta.bg)}>
                              <TypeIcon className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="max-w-[260px] truncate font-medium">
                                {material.file_name}
                              </p>
                              <p className="text-xs text-muted">
                                {material.extracted_text.length.toLocaleString("id-ID")} karakter
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-muted">
                          {formatDate(material.created_at)}
                        </td>
                        <td className="px-5 py-3.5 text-center font-semibold">
                          {stats?.count || 0}
                        </td>
                        <td className="px-5 py-3.5 text-center font-semibold">
                          {stats?.lastScore !== null && stats?.lastScore !== undefined ? (
                            <span className="text-primary">{stats.lastScore}%</span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/kuis?material=${material.id}`}
                              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                            >
                              <Play className="h-3.5 w-3.5" />
                              Mulai Kuis
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(material)}
                              className="cursor-pointer rounded-lg p-2 text-muted transition hover:bg-danger/10 hover:text-danger"
                              aria-label={`Hapus ${material.file_name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {materials.map((material) => {
              const typeMeta = fileTypeOf(material.file_name);
              const TypeIcon = typeMeta.icon;
              const stats = statsByMaterial[material.id];
              return (
                <div
                  key={material.id}
                  className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", typeMeta.bg)}>
                      <TypeIcon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {material.file_name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {formatDate(material.created_at)} • {stats?.count || 0} kuis
                        {stats?.lastScore !== null && stats?.lastScore !== undefined
                          ? ` • skor ${stats.lastScore}%`
                          : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(material)}
                      className="cursor-pointer rounded-lg p-2 text-muted transition hover:bg-danger/10 hover:text-danger"
                      aria-label={`Hapus ${material.file_name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-end border-t border-border pt-3">
                    <Link
                      href={`/kuis?material=${material.id}`}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Mulai Kuis
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Hapus materi ini?"
        description={
          deleteTarget
            ? `"${deleteTarget.file_name}" beserta riwayat kuis yang dibuat dari materi ini akan dihapus permanen.`
            : ""
        }
        confirmLabel="Hapus"
      />
    </div>
  );
}
