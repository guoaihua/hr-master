import { afterAll, describe, expect, it } from "vitest";
import { createApp } from "./app.mjs";

const servers = [];

afterAll(async () => {
  await Promise.all(
    servers.map(
      (server) =>
        new Promise((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        }),
    ),
  );
});

describe("server api", () => {
  it("parses text resume via api", async () => {
    const app = createApp({
      config: {
        apiKey: "test-key",
        baseURL: "https://example.com/v1",
        model: "test-model",
        port: 0,
      },
      llmClient: async (messages, config) => ({
        candidate: { name: "张三", targetRole: "HR" },
        dimensions: [],
        questions: [],
        interviewerTips: [],
        meta: { parserVersion: "v1", model: config.model, confidence: 0.8 },
        echo: messages,
      }),
    });
    const server = app.listen(0);
    servers.push(server);
    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const formData = new FormData();
    formData.append("file", new Blob(["简历内容"], { type: "text/plain" }), "resume.txt");
    formData.append("targetRole", "HR");

    const response = await fetch(`${baseUrl}/api/resume/parse`, {
      method: "POST",
      body: formData,
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe("ok");
    expect(payload.messages[1].content).toContain("简历内容");
    expect(payload.messages[1].content).toContain("test-model");
  });

  it("rejects unsupported upload types", async () => {
    const app = createApp({
      config: {
        apiKey: "test-key",
        baseURL: "https://example.com/v1",
        model: "test-model",
        port: 0,
      },
      llmClient: async () => ({}),
    });
    const server = app.listen(0);
    servers.push(server);
    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const formData = new FormData();
    formData.append("file", new Blob(["docx"], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }), "resume.docx");

    const response = await fetch(`${baseUrl}/api/resume/parse`, {
      method: "POST",
      body: formData,
    });
    const payload = await response.json();

    expect(response.status).toBe(415);
    expect(payload.error).toContain("仅支持文本类简历和 PDF 简历");
  });

  it("regenerates section via api", async () => {
    const app = createApp({
      config: {
        apiKey: "test-key",
        baseURL: "https://example.com/v1",
        model: "test-model",
        port: 0,
      },
      llmClient: async () => ({
        questions: [{ id: "q1", dimension: "综合", topic: "topic" }],
      }),
    });
    const server = app.listen(0);
    servers.push(server);
    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;

    const response = await fetch(`${baseUrl}/api/analysis/regenerate-section`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        section: "questions",
        analysis: {
          candidate: {},
          dimensions: [],
          questions: [],
          interviewerTips: [],
          source: { resumeText: "简历" },
        },
        extraPrompt: "更关注数据能力",
      }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.questions).toHaveLength(1);
  });
});
