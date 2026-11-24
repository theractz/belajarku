import { Plus_Jakarta_Sans } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "Belajarku - Belajar Lebih Mudah",
    template: "%s | Belajarku",
  },
  description:
    "Belajarku membantu kamu mengubah materi pelajaran menjadi soal kuis interaktif. Upload materi, generate soal dengan AI, kerjakan kuis, dan lihat statistik.",
  applicationName: "Belajarku",
  keywords: [
    "belajar",
    "kuis online",
    "soal kuis",
    "SMP",
    "AI",
    "materi pelajaran",
  ],
};

export const viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}