import { describe, expect, it } from "vitest";
import { extractResumeText, getResumeFileKind } from "./resume.mjs";

describe("resume file kind", () => {
  it("detects text files", () => {
    expect(getResumeFileKind({ originalname: "resume.md", mimetype: "text/markdown" })).toBe("text");
  });

  it("detects pdf files", () => {
    expect(getResumeFileKind({ originalname: "resume.pdf", mimetype: "application/pdf" })).toBe("pdf");
  });

  it("rejects unsupported files", () => {
    expect(getResumeFileKind({ originalname: "resume.docx", mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })).toBe("unsupported");
  });
});

describe("extractResumeText", () => {
  it("reads plain text buffer", async () => {
    const text = await extractResumeText({
      originalname: "resume.txt",
      mimetype: "text/plain",
      buffer: Buffer.from("hello"),
    });
    expect(text).toBe("hello");
  });

  it("uses injected pdf parser", async () => {
    const text = await extractResumeText(
      {
        originalname: "resume.pdf",
        mimetype: "application/pdf",
        buffer: Buffer.from("pdf"),
      },
      {
        parsePdf: async () => ({ text: "pdf text" }),
      },
    );
    expect(text).toBe("pdf text");
  });

  it("throws when pdf parser returns empty text", async () => {
    await expect(
      extractResumeText(
        {
          originalname: "resume.pdf",
          mimetype: "application/pdf",
          buffer: Buffer.from("pdf"),
        },
        {
          parsePdf: async () => ({ text: "" }),
        },
      ),
    ).rejects.toThrow("PDF 预解析后未提取到文字内容");
  });
});
