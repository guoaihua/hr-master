import { afterEach, describe, expect, it } from "vitest";
import { ensureLLMConfigured } from "./llm.js";
import { getApiKey, isApiKeyConfigured, loadEnvConfig } from "./env.js";

const originalApiKey = process.env.VITE_LLM_API_KEY;

afterEach(() => {
  if (originalApiKey === undefined) {
    delete process.env.VITE_LLM_API_KEY;
  } else {
    process.env.VITE_LLM_API_KEY = originalApiKey;
  }
});

describe("env config", () => {
  it("reads api key from process env", () => {
    process.env.VITE_LLM_API_KEY = "test-key";
    expect(getApiKey()).toBe("test-key");
    expect(isApiKeyConfigured()).toBe(true);
  });

  it("throws when api key is missing", () => {
    delete process.env.VITE_LLM_API_KEY;
    expect(() => loadEnvConfig()).toThrow("缺少 API Key");
    expect(isApiKeyConfigured()).toBe(false);
  });
});

describe("llm config", () => {
  it("does not require api key in hardcoded mode", () => {
    expect(() =>
      ensureLLMConfigured({
        useHardcodedResult: true,
        apiKey: "",
      }),
    ).not.toThrow();
  });

  it("requires api key when hardcoded mode is off", () => {
    expect(() =>
      ensureLLMConfigured({
        useHardcodedResult: false,
        apiKey: "",
      }),
    ).toThrow("缺少 API Key");
  });
});
