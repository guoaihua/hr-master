export async function readResumeForModel(file) {
  const extension = file.name.split(".").pop().toLowerCase();
  const textTypes = ["txt", "md", "markdown", "json"];
  if (textTypes.includes(extension) || file.type.startsWith("text/")) {
    return {
      kind: "text",
      fileName: file.name,
      mimeType: file.type || "text/plain",
      text: await readFileAsText(file),
    };
  }

  const dataUrl = await readFileAsDataURL(file);
  const base64 = dataUrl.split(",")[1] || "";
  if (!base64) throw new Error("文件读取失败，未获得 base64 内容");
  return {
    kind: "file",
    fileName: file.name,
    mimeType: file.type || inferMimeType(file.name),
    base64,
  };
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsText(file, "utf-8");
  });
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });
}

function inferMimeType(fileName) {
  const extension = fileName.split(".").pop().toLowerCase();
  const mimeMap = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    doc: "application/msword",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
  };
  return mimeMap[extension] || "application/octet-stream";
}
