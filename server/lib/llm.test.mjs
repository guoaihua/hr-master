import { describe, expect, it } from "vitest";
import { parseJsonFromModel } from "./llm.mjs";

describe("parseJsonFromModel", () => {
  it("parses plain json", () => {
    expect(parseJsonFromModel('{"ok":true}')).toEqual({ ok: true });
  });

  it("parses fenced json", () => {
    expect(parseJsonFromModel('```json\n{"ok":true}\n```')).toEqual({ ok: true });
  });

  it("throws on invalid json", () => {
    expect(() => parseJsonFromModel("not-json")).toThrow("大模型返回的不是合法 JSON");
  });
});
