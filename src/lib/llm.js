export async function parseResumeWithServer(file, targetRole, llmConfig, hardcodedAnalysis, deepClone, options = {}) {
  if (llmConfig.useHardcodedResult) {
    await delay(450, options.signal);
    return deepClone(hardcodedAnalysis);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("targetRole", targetRole || "");

  const response = await fetch(buildApiUrl("/api/resume/parse"), {
    method: "POST",
    body: formData,
    signal: options.signal,
  });

  return readJsonResponse(response, "简历解析失败");
}

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError());
      return;
    }
    const timer = window.setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timer);
        reject(createAbortError());
      },
      { once: true },
    );
  });
}

function createAbortError() {
  return new DOMException("Aborted", "AbortError");
}

export async function regenerateSectionWithServer({ section, analysis, extraPrompt, llmConfig, hardcodedAnalysis, deepClone }) {
  if (llmConfig.useHardcodedResult) {
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    return {
      [section]: deepClone(hardcodedAnalysis[section]),
    };
  }

  const response = await fetch(buildApiUrl("/api/analysis/regenerate-section"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      section,
      analysis,
      extraPrompt,
    }),
  });

  return readJsonResponse(response, "区块重生成失败");
}

export function ensureLLMConfigured() {}

export function llmStatusText(llmConfig) {
  if (llmConfig.useHardcodedResult) {
    return "当前使用写死的大模型解析结果，不会发起真实模型请求。";
  }
  return "当前由服务端mimo-v2.5-pro大模型支持解析。支持文本类与 PDF 简历。";
}

async function readJsonResponse(response, fallbackMessage) {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error || fallbackMessage);
  }
  return payload;
}

function buildApiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const basePath =
    typeof document !== "undefined"
      ? normalizeBasePath(document.querySelector("base")?.getAttribute("href") || "/")
      : "/";
  return `${basePath}${normalizedPath.replace(/^\/+/, "")}`;
}

function normalizeBasePath(value) {
  const raw = String(value || "/").trim();
  if (!raw || raw === "/") return "/";
  return `/${raw.replace(/^\/+|\/+$/g, "")}/`;
}
