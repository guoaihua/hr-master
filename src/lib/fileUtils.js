const SUPPORTED_EXTENSIONS = new Set(["txt", "md", "markdown", "json", "pdf"]);
const MAX_RESUME_FILE_SIZE = 10 * 1024 * 1024;

export function assertSupportedResumeFile(file) {
  const extension = getExtension(file?.name || "");
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error("当前仅支持 TXT / Markdown / JSON / PDF 简历");
  }
  if (file.size > MAX_RESUME_FILE_SIZE) {
    throw new Error("简历文件不能超过 10MB");
  }
  if (file.size === 0) {
    throw new Error("简历文件为空，请重新选择");
  }
}

function getExtension(fileName) {
  const parts = String(fileName).split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}
