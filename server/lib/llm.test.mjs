import { describe, expect, it } from "vitest";
import { buildInitialMessages, buildSectionMessages, ensureAnalysisCompleteness, parseJsonFromModel } from "./llm.mjs";

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

describe("prompt builders", () => {
  it("keeps interview questions focused on fixed HR core dimensions", () => {
    const messages = buildInitialMessages({
      fileName: "resume.txt",
      targetRole: "HR实习生",
      resumeText: "候选人做过招聘实习、社团活动和 AI 工具使用。",
      model: "test-model",
    });
    const prompt = messages.map((message) => message.content).join("\n");

    expect(prompt).toContain("聪明度");
    expect(prompt).toContain("抗压性");
    expect(prompt).toContain("是否挑活");
    expect(prompt).toContain("AI工具应用");
    expect(prompt).toContain("自驱动学习");
    expect(prompt).toContain("成就动机");
    expect(prompt).toContain("background 必须融合至少 2 个简历细节");
    expect(prompt).toContain("情景模拟问题必须落到目标岗位的真实工作场景");
    expect(prompt).toContain("candidate.targetRole 必须与上面“目标岗位”完全一致");
  });

  it("adds strict regeneration rules for the questions section", () => {
    const messages = buildSectionMessages({
      section: "questions",
      analysis: {
        candidate: { name: "候选人" },
        dimensions: [],
        questions: [],
        source: { resumeText: "简历内容" },
      },
      extraPrompt: "",
      sectionMeta: {
        questions: {
          title: "定制化面试问题",
          description: "问题说明",
        },
      },
    });
    const prompt = messages.map((message) => message.content).join("\n");

    expect(prompt).toContain("每个维度至少 1 道题");
    expect(prompt).toContain("openEnded 深挖真实经历");
    expect(prompt).toContain("situational 必须转换到目标岗位的真实工作场景");
  });
});

describe("analysis fallback", () => {
  it("backfills one usable question for each core dimension when model returns none", () => {
    const completed = ensureAnalysisCompleteness({
      candidate: {
        highlights: ["有跨领域经历", "做过数据分析"],
        metrics: [{ label: "社群活跃度提升", value: "+15%" }],
      },
      dimensions: [],
      questions: [],
      source: {
        resumeText: "做过运营实习，负责用户调研、活动复盘和 AI 工具辅助整理资料。",
      },
    });

    expect(completed.dimensions).toHaveLength(6);
    expect(completed.questions).toHaveLength(6);
    expect(completed.questions.map((item) => item.dimension)).toEqual([
      "聪明度",
      "抗压性",
      "是否挑活",
      "AI工具应用",
      "自驱动学习",
      "成就动机",
    ]);
    expect(completed.questions.every((item) => item.openEnded && item.situational)).toBe(true);
  });

  it("forces candidate targetRole to match source targetRole", () => {
    const completed = ensureAnalysisCompleteness({
      candidate: {
        name: "王五",
        targetRole: "模型擅自改写的岗位",
      },
      source: {
        targetRole: "用户填写的真实岗位",
      },
      dimensions: [],
      questions: [],
    });

    expect(completed.candidate.targetRole).toBe("用户填写的真实岗位");
  });
});
