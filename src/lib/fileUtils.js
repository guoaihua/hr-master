const SUPPORTED_EXTENSIONS = new Set(["txt", "md", "markdown", "json", "pdf"]);

export function assertSupportedResumeFile(file) {
  const extension = getExtension(file?.name || "");
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error("当前仅支持文本类简历和 PDF 简历");
  }
}

function getExtension(fileName) {
  const parts = String(fileName).split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}
