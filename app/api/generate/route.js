import { NextResponse } from "next/server";

const ALLOWED_COUNTS = [5, 10, 20];
const LETTERS = ["A", "B", "C", "D"];

function buildSystemPrompt() {
  return [
    "Kamu adalah pembuat soal ulangan yang sangat teliti untuk siswa SMP Indonesia.",
    "Kamu HANYA boleh membalas dengan satu objek JSON yang valid dan lengkap.",
    "Jangan menulis markdown, tidak ada teks di luar JSON, tanpa ```fence```.",
    "Gunakan skema persis seperti ini:",
    JSON.stringify({
      questions: [
        {
          question: "teks soal",
          options: ["opsi A", "opsi B", "opsi C", "opsi D"],
          answer: "B",
          explanation: "pembahasan singkat dan jelas",
        },
      ],
    }),
    "Aturan:",
    "- Untuk pilihan ganda: options berisi 4 opsi (A-D) dan answer adalah huruf kunci yang benar.",
    "- Untuk isian: options berisi array kosong [] dan answer adalah teks jawaban yang benar.",
    "- Setiap soal wajib memiliki explanation (pembahasan).",
    "- Soal harus berdasarkan isi materi, bukan pengetahuan umum.",
    "- Gunakan bahasa Indonesia yang baik.",
  ].join("\n");
}

function buildUserPrompt({ extracted_text, count, type, subject, class_level }) {
  const typeLabel =
    type === "isian"
      ? "isian singkat (jawaban berupa kata/angka pendek)"
      : "pilihan ganda dengan 4 opsi (A, B, C, D)";
  return [
    `Buatkan ${count} soal ${typeLabel} untuk siswa SMP kelas ${class_level} pada mata pelajaran "${subject}".`,
    "Susun dari materi di bawah ini. Tingkat kesulitan berjenjang (sedang-menengah-tinggi).",
    "Materi:",
    "---",
    String(extracted_text).slice(0, 20000),
    "---",
    "Kembalikan JSON sesuai skema yang diminta.",
  ].join("\n");
}

function extractJson(text) {
  const fenced = String(text || "").match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : String(text || "");
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch (error) {
    return null;
  }
}

function normalizeQuestions(raw, type) {
  let list = null;
  if (Array.isArray(raw)) list = raw;
  else if (raw && Array.isArray(raw.questions)) list = raw.questions;
  else if (raw && raw.data && Array.isArray(raw.data.questions)) list = raw.data.questions;

  if (!list) return [];

  return list
    .map((q) => {
      if (!q) return null;
      const optsRaw = Array.isArray(q.options) ? q.options : [];
      const options = optsRaw
        .map((opt, idx) => ({
          key: LETTERS[idx] || String(idx + 1),
          value: String(
            opt && typeof opt === "object" ? opt.value || opt.text || "" : opt ?? "",
          ).trim(),
        }))
        .filter((o) => o.value)
        .slice(0, 4);

      let correct = String(q.answer ?? q.correct_answer ?? q.correct ?? "").trim();

      if (type === "isian") {
        if (options.length === 0 && !correct) return null;
      } else {
        if (options.length < 2) return null;
        const upper = correct.toUpperCase().charAt(0);
        if (LETTERS.includes(upper)) {
          correct = upper;
        } else {
          const matchIndex = options.findIndex(
            (o) => o.value.toLowerCase() === correct.toLowerCase(),
          );
          correct = matchIndex >= 0 ? options[matchIndex].key : options[0].key;
        }
      }

      return {
        question_text: String(q.question ?? q.question_text ?? "").trim(),
        options: type === "isian" ? [] : options,
        correct_answer: correct,
        explanation: String(q.explanation ?? q.pembahasan ?? "").trim(),
      };
    })
    .filter(Boolean)
    .filter((q) => q.question_text.length > 0);
}

async function callAI({ apiKey, baseUrl, model, messages, jsonMode }) {
  const body = {
    model,
    messages,
    temperature: 0.5,
    max_tokens: 5000,
    stream: false,
  };
  if (jsonMode) body.response_format = { type: "json_object" };

  return fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000),
  });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Body request tidak valid." }, { status: 400 });
  }

  const extracted_text = String(body.extracted_text || "").trim();
  const count = ALLOWED_COUNTS.includes(Number(body.count)) ? Number(body.count) : 5;
  const type = body.type === "isian" ? "isian" : "PG";
  const subject = String(body.subject || "Lainnya").trim();
  const class_level = Number(body.class_level) || 8;

  if (!extracted_text) {
    return NextResponse.json(
      { error: "Teks materi kosong. Upload file valid terlebih dahulu." },
      { status: 400 },
    );
  }

  const apiKey = process.env.VIKEY_API_KEY;
  const baseUrl = process.env.VIKEY_BASE_URL || "https://api.vikey.ai/v1";
  const model = process.env.VIKEY_MODEL || "deepseek/deepseek-v4-flash";

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key AI belum dikonfigurasi di .env.local." },
      { status: 500 },
    );
  }

  const messages = [
    { role: "system", content: buildSystemPrompt() },
    {
      role: "user",
      content: buildUserPrompt({ extracted_text, count, type, subject, class_level }),
    },
  ];

  let response = await callAI({ apiKey, baseUrl, model, messages, jsonMode: true });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    const mentionsFormat = /response_format|json_object|format/i.test(errorBody);
    if (mentionsFormat) {
      response = await callAI({ apiKey, baseUrl, model, messages, jsonMode: false });
    } else {
      return NextResponse.json(
        {
          error:
            errorBody ||
            `Provider AI mengembalikan error (${response.status}). Coba lagi beberapa saat.`,
        },
        { status: 502 },
      );
    }
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: "Gagal menjalankan generate. Coba lagi beberapa saat." },
      { status: 502 },
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Respons AI tidak dapat dibaca." },
      { status: 502 },
    );
  }

  const content = data.choices?.[0]?.message?.content || "";
  const parsed = extractJson(content);
  const questions = normalizeQuestions(parsed, type);

  if (questions.length === 0) {
    return NextResponse.json(
      { error: "AI kembali dengan format yang tidak dikenali. Coba generate lagi." },
      { status: 502 },
    );
  }

  return NextResponse.json({ questions });
}