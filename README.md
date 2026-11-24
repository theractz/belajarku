# Belajarku

Aplikasi belajar berbasis web (PC-First) yang mengubah materi pelajaran menjadi kuis interaktif dengan bantuan AI. Dibangun dengan **Next.js (JavaScript) + Tailwind CSS**, semua data tersimpan di **LocalStorage** browser — tanpa backend/database eksternal.

## Fitur

- **Autentikasi lokal**: Login / Register / Onboarding pilih kelas (7/8/9).
- **Materi → Kuis**: upload PDF/DOCX/TXT (maks 5MB), ekstraksi teks di client
  (`pdfjs-dist` untuk PDF, `mammoth` untuk DOCX), lalu generate soal via AI.
- **Kuis AI**: pilih materi, atur mapel/jenis/jumlah soal, klik generate, lalu
  langsung kerjakan tanpa timer. Soal kuis bersifat sekali pakai dan tidak
  disimpan.
- **Statistik akhir**: skor, jumlah benar/salah, daftar soal yang salah beserta
  kunci dan pembahasan.
- **Riwayat**: statistik hasil kuis yang sudah diselesaikan (skor, akurasi,
  soal salah). Kuisnya sendiri tidak disimpan.
- **Materi Saya**: daftar materi terunggah, jumlah kuis selesai, dan skor terakhir.
- **XP & Streak**: dapat XP saat menyelesaikan kuis.
- **Pengaturan**: ubah profil, kelas, password, dan reset seluruh data.

## Batasan & Error Handling

- Maksimal **3x generate AI per hari per user** (dicek via LocalStorage).
- PDF hasil scan/gambar (tanpa lapisan teks) menampilkan:
  "PDF tidak didukung, gunakan PDF berbasis teks."
- Parsing JSON dari AI menggunakan `try-catch` dengan pembersihan respons
  (menangani code-fence) sebelum dipakai.
- Kuis tidak disimpan; hanya ringkasan statistik (termasuk soal yang salah)
  yang dicatat ke Riwayat.

## Persyaratan

- Node.js 18.18+ / 20+
- Python 3 tidak diperlukan untuk menjalankan (hanya untuk skill desain).

## Setup

```bash
npm install
```

Salin konfigurasi API AI:

```bash
cp .env.example .env.local
```

Isi `.env.local` dengan API key kamu (jangan pernah commit file ini):

```
VIKEY_API_KEY=vk-xxxx
VIKEY_BASE_URL=https://api.vikey.ai/v1
VIKEY_MODEL=deepseek/deepseek-v4-flash
```

> API key hanya dibaca di server (route handler `app/api/generate/route.js`),
> tidak pernah dikirim ke browser. `.env*` sudah masuk `.gitignore`.

## Menjalankan

```bash
npm run dev            # development (http://localhost:3000)
npm run build          # build produksi
npm run start          # jalankan hasil build
npm run lint           # eslint
```

Mulai cepat: buka halaman utama, lalu klik **Daftar gratis** untuk membuat akun
baru. Setelah mendaftar, pilih kelasmu dan mulai mengunggah materi.

## Struktur

```
app/
  page.js                                       # Landing page publik
  login/ register/ onboarding/                  # halaman di luar shell
  (dashboard)/ dashboard/                       # Dashboard
  (dashboard)/ materi-saya/{,baru}/             # Upload & daftar materi
  (dashboard)/ kuis/                            # Generate → kerjakan → statistik
  (dashboard)/ riwayat/ pengaturan/             # Statistik hasil & pengaturan
  api/generate/route.js                         # Route handler AI (server-only)
components/
  KuisPage.jsx RiwayatPage.jsx
  Sidebar.jsx Topbar.jsx DashboardShell.jsx DataProvider.js RequireAuth.jsx
  ui/…                                            # UI kit (button, card, dialog, …)
lib/
  storage.js   # CRUD LocalStorage (users, materials, quiz results, …)
  extract.js   # ekstraksi teks PDF/DOCX/TXT di client
  utils.js
```

## Skema Data (LocalStorage)

| Key | Isi |
|-----|-----|
| `belajarku_users` | `[{ id, name, email, password, class_level, xp, streak, … }]` |
| `belajarku_materials` | `[{ id, user_id, file_name, extracted_text, created_at }]` |
| `belajarku_quiz_results` | `[{ id, user_id, material_name, subject, total, correct, wrong, score, xp, wrong_questions, created_at }]` |
| `belajarku_activities` | `[{ id, user_id, type, title, xp, created_at }]` |
| `belajarku_session` | `{ user_id }` untuk sesi masuk |

> Kunci lama (`belajarku_questions`, `belajarku_attempts`, `belajarku_drafts`)
> tidak dipakai lagi dan ikut dibersihkan saat reset data.

## Deploy (Vercel)

```bash
npm i -g vercel
vercel
```

Saat deploy, atur environment variables yang sama seperti `.env.local`
(VIKEY_API_KEY, VIKEY_BASE_URL, VIKEY_MODEL) di dashboard Vercel.