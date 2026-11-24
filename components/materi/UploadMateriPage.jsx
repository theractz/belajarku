"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  FileUp,
  Loader2,
  Save,
  UploadCloud,
} from "lucide-react";
import { useData } from "@/components/DataProvider";
import { addMaterial } from "@/lib/storage";
import { extractTextFromFile, MAX_FILE_SIZE } from "@/lib/extract";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadMateriPage() {
  const router = useRouter();
  const toast = useToast();
  const { refresh } = useData();
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const hasText = extractedText.trim().length > 0;

  const handleFile = useCallback(
    async (selected) => {
      if (!selected) return;
      setError("");
      setFile(selected);
      setFileName(selected.name);
      setExtractedText("");
      setBusy(true);
      const result = await extractTextFromFile(selected);
      setBusy(false);
      if (result.error) {
        setError(result.error);
        return;
      }
      setExtractedText(result.text);
      toast("Teks berhasil dibaca dari file.");
    },
    [toast],
  );

  function onDrop(event) {
    event.preventDefault();
    setDragOver(false);
    handleFile(event.dataTransfer.files?.[0]);
  }

  function resetFile() {
    setFile(null);
    setFileName("");
    setExtractedText("");
    setError("");
    setPreviewOpen(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleSave() {
    setError("");
    if (!hasText) {
      setError("Belum ada teks materi. Upload file terlebih dahulu.");
      return;
    }
    setSaving(true);
    const created = addMaterial({
      file_name: fileName || "Materi.txt",
      extracted_text: extractedText,
    });
    setSaving(false);
    if (created.error) {
      setError(created.error);
      return;
    }
    refresh();
    toast("Materi tersimpan. Yuk buat soal kuis!");
    router.push(`/kuis?material=${created.material.id}`);
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-semibold text-primary">Langkah 1 dari 3</p>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Upload Materi
          </h1>
          <p className="mt-1 text-sm text-muted">
            Unggah materi pelajaranmu. Setelah tersimpan, AI akan membuat soal
            kuis dari materi ini.
          </p>
        </div>
      </div>

      {!hasText ? (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-card p-10 text-center shadow-sm transition",
            dragOver ? "border-primary bg-accent" : "border-border",
          )}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent text-primary">
            {busy ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : (
              <UploadCloud className="h-8 w-8" />
            )}
          </span>
          <h2 className="mt-4 text-base font-semibold">
            {busy ? "Membaca isi berkas..." : "Tarik & lepas file di sini"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            atau klik untuk memilih berkas
          </p>
          <p className="mt-4 text-xs text-muted">
            Format: PDF (berbasis teks), DOCX, TXT • Maks{" "}
            {Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB
          </p>
          {error ? (
            <div
              role="alert"
              className="mt-4 flex items-start gap-2 rounded-xl border border-danger/30 bg-rose-50 px-4 py-3 text-left text-sm font-medium text-danger"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3 rounded-xl bg-muted-bg p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FileUp className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{fileName}</p>
                <p className="text-xs text-muted">
                  {formatBytes(file?.size || 0)} • teks siap dibuat soal
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={resetFile}>
                Ganti
              </Button>
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-accent px-4 py-3 text-sm text-primary">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Teks berhasil dibaca. Klik tombol di bawah untuk menyimpan materi
                dan lanjut membuat soal.
              </span>
            </div>

            {error ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-danger/30 bg-rose-50 px-4 py-3 text-sm font-medium text-danger"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            <Button size="lg" className="w-full" disabled={saving} onClick={handleSave}>
              <Save className="h-4 w-4" />
              {saving ? "Menyimpan..." : "Simpan & Buat Kuis"}
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-base font-bold">
                  <FileText className="h-4 w-4 text-primary" />
                  Teks Materi
                </h2>
                <p className="text-xs text-muted">
                  {extractedText.length.toLocaleString("id-ID")} karakter
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewOpen((value) => !value)}
              >
                {previewOpen ? "Sembunyikan" : "Lihat Isi"}
              </Button>
            </div>
            {previewOpen ? (
              <pre className="max-h-[420px] overflow-y-auto whitespace-pre-wrap rounded-xl bg-muted-bg p-4 text-xs leading-relaxed text-foreground">
                {extractedText}
              </pre>
            ) : (
              <p className="line-clamp-6 text-sm leading-relaxed text-muted">
                {extractedText}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-muted">
        <ArrowLeft className="h-4 w-4" />
        <button
          type="button"
          className="cursor-pointer hover:text-foreground"
          onClick={() => router.push("/materi-saya")}
        >
          Kembali ke Materi Saya
        </button>
      </div>
    </div>
  );
}
