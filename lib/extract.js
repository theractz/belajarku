export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_FORMATS = [".pdf", ".docx", ".txt"];

function sanitizeText(text) {
  return String(text || "").replace(/\u0000/g, "").replace(/[ \t]+/g, " ").trim();
}

async function extractPdf(file) {
  const pdfjs = await import("pdfjs-dist");
  let workerConfigured = false;
  try {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    workerConfigured = true;
  } catch (error) {
    workerConfigured = false;
  }

  const data = new Uint8Array(await file.arrayBuffer());

  let doc;
  try {
    doc = await pdfjs.getDocument({
      data,
      isEvalSupported: false,
      useSystemFonts: true,
    }).promise;
  } catch (error) {
    if (workerConfigured) {
      pdfjs.GlobalWorkerOptions.workerSrc = "";
      doc = await pdfjs.getDocument({
        data,
        isEvalSupported: false,
        useSystemFonts: true,
      }).promise;
    } else {
      throw error;
    }
  }

  try {
    let text = "";
    for (let i = 1; i <= doc.numPages; i += 1) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => (item && typeof item.str === "string" ? item.str : ""))
        .join(" ");
      text += ` ${pageText} `;
      page.cleanup();
    }
    text = sanitizeText(text);
    if (!text) {
      return { error: "PDF tidak didukung, gunakan PDF berbasis teks." };
    }
    return { text };
  } finally {
    await doc.destroy();
  }
}

async function extractDocx(file) {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = sanitizeText(result.value);
  if (!text) return { error: "Dokumen kosong atau tidak terbaca." };
  return { text };
}

async function extractTxt(file) {
  const text = sanitizeText(await file.text());
  if (!text) return { error: "File kosong." };
  return { text };
}

export async function extractTextFromFile(file) {
  if (file.size > MAX_FILE_SIZE) {
    return { error: "Ukuran file maksimal 5MB." };
  }
  const lowerName = String(file.name || "").toLowerCase();
  try {
    if (lowerName.endsWith(".pdf")) return await extractPdf(file);
    if (lowerName.endsWith(".docx")) return await extractDocx(file);
    if (lowerName.endsWith(".txt")) return await extractTxt(file);
    return { error: "Format file harus PDF, DOCX, atau TXT." };
  } catch (error) {
    console.error("Gagal ekstrak teks file:", error);
    if (lowerName.endsWith(".pdf")) {
      return { error: "PDF tidak didukung, gunakan PDF berbasis teks." };
    }
    return { error: "Gagal membaca file. Pastikan file tidak rusak." };
  }
}