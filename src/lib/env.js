function cleanValue(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

export function getApiKey(fallback = "") {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_LLM_API_KEY) {
    return cleanValue(import.meta.env.VITE_LLM_API_KEY);
  }

  if (typeof process !== "undefined" && process.env?.VITE_LLM_API_KEY) {
    return cleanValue(process.env.VITE_LLM_API_KEY);
  }

  return cleanValue(fallback);
}

export function loadEnvConfig() {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("缺少 API Key：请在 .env 中配置 VITE_LLM_API_KEY。");
  }

  return {
    apiKey,
    isDevelopment: process.env.NODE_ENV === "development",
  };
}

export function isApiKeyConfigured() {
  return Boolean(getApiKey());
}
