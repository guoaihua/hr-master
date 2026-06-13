import { PDFParse } from "pdf-parse";

const TEXT_EXTENSIONS = new Set(["txt", "md", "markdown", "json"]);

export function getResumeFileKind(file) {
  const extension = getExtension(file.originalname || "");
  const mimeType = String(file.mimetype || "").toLowerCase();

  if (TEXT_EXTENSIONS.has(extension) || mimeType.startsWith("text/") || mimeType === "application/json") {
    return "text";
  }

  if (extension === "pdf" || mimeType === "application/pdf") {
    return "pdf";
  }

  return "unsupported";
}

export async function extractResumeText(file, options = {}) {
  const kind = getResumeFileKind(file);
  if (kind === "text") {
    const text = Buffer.from(file.buffer || []).toString("utf-8").trim();
    if (!text) throw new Error("简历文本为空，无法解析");
    return text;
  }

  if (kind === "pdf") {
    const parsePdf = options.parsePdf || parsePdfBuffer;
    let parsed;
    try {
      parsed = await parsePdf(file.buffer);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "未知错误";
      throw new Error(`PDF 预解析失败：${detail}`);
    }
    const text = String(parsed?.text || "").trim();
    if (!text) throw new Error("PDF 预解析后未提取到文字内容");
    return text;
  }

  throw new Error("当前仅支持文本类简历和 PDF 简历");
}

function getExtension(fileName) {
  const parts = String(fileName).split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

async function parsePdfBuffer(buffer) {
  const parser = new PDFParse({ data: buffer });
  try {
    return await parser.getText();
  } finally {
    await parser.destroy();
  }
}
