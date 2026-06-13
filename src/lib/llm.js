export async function callLLMJson(messages, llmConfig, hardcodedAnalysis, deepClone) {
  if (llmConfig.useHardcodedResult) {
    await new Promise((resolve) => window.setTimeout(resolve, 450));
    return deepClone(hardcodedAnalysis);
  }

  const url = `${llmConfig.baseURL.replace(/\/$/, "")}/chat/completions`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${llmConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: llmConfig.model,
      temperature: 0.2,
      messages,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`大模型调用失败：${detail || response.status}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("大模型没有返回内容");
  return parseJsonFromModel(content);
}

export function buildInitialMessages({ fileName, targetRole, resumeInput, llmConfig }) {
  const schemaPrompt = buildSchemaPrompt(llmConfig.model);
  const userContent =
    resumeInput.kind === "text"
      ? buildTextResumePrompt({ fileName, targetRole, resumeText: resumeInput.text, schemaPrompt })
      : buildFileResumePrompt({ fileName, targetRole, resumeInput, schemaPrompt });

  return [
    {
      role: "system",
      content: buildInitialSystemPrompt(),
    },
    {
      role: "user",
      content: userContent,
    },
  ];
}

export function buildSectionMessages({ section, analysis, extraPrompt, sectionMeta, toPrettyJson }) {
  const meta = sectionMeta[section];
  const context = buildSectionContextPayload(section, analysis, extraPrompt);
  return [
    {
      role: "system",
      content: [
        "你是资深 HR 面试设计专家。",
        "你正在局部重生成一个结构化 JSON 区块。",
        "仅返回纯 JSON，不要 Markdown、代码块或解释。",
        `只返回一个对象，且只包含 ${section} 这一个顶层字段。`,
        "优先使用提供的最小上下文，不要臆造简历中不存在的事实。",
      ].join("\n"),
    },
    {
      role: "user",
      content: `
请仅重新生成区块：${section}（${meta.title}）。

区块说明：${meta.description}
上下文（JSON）：
${toPrettyJson(context)}
      `.trim(),
    },
  ];
}

export function ensureLLMConfigured(llmConfig) {
  if (llmConfig.useHardcodedResult) return;
  if (!llmConfig.apiKey) {
    throw new Error("缺少 API Key：请在 .env 中配置 VITE_LLM_API_KEY。");
  }
}

export function llmStatusText(llmConfig) {
  if (llmConfig.useHardcodedResult) {
    return "当前使用写死的大模型解析结果，不会发起真实模型请求。";
  }
  if (!llmConfig.apiKey) {
    return "当前尚未配置 API Key：请在 .env 中设置 VITE_LLM_API_KEY。";
  }
  return `当前模型：${llmConfig.model}，接口：${llmConfig.baseURL}`;
}

function buildSchemaPrompt(model) {
  return `
输出 JSON 顶层字段：
- candidate
- dimensions
- questions
- interviewerTips
- meta

candidate 必含字段：
name, targetRole, summary, education, experience, otherExperience, skills, certificates, highlights, risks, metrics

questions 要求：
- 生成 8-12 道
- 每道题字段：id, dimension, topic, background, openEnded, situational, tips

数组项格式：
- metrics: [{ "label": "", "value": "" }]
- dimensions: [{ "name": "", "note": "" }]
- interviewerTips: ["..."]

meta 固定格式：
{ "parserVersion": "v1", "model": "${model}", "confidence": 0 }
`.trim();
}

function buildInitialSystemPrompt() {
  return [
    "你是资深 HR 面试设计专家，负责把候选人简历解析成结构化 JSON。",
    "仅返回纯 JSON，不要 Markdown、代码块或解释。",
    "缺失字段用空字符串或空数组，不要删字段。",
    "问题必须引用简历事实，避免泛泛而谈。",
    "如果输入是 base64 文件内容，直接按原始简历文件解析。",
  ].join("\n");
}

function buildTextResumePrompt({ fileName, targetRole, resumeText, schemaPrompt }) {
  return `
任务：根据简历和目标岗位生成结构化结果。
${schemaPrompt}
文件名：${fileName}
目标岗位：${targetRole || "未填写"}

简历文本：
${resumeText}
  `.trim();
}

function buildFileResumePrompt({ fileName, targetRole, resumeInput, schemaPrompt }) {
  return `
任务：直接解析简历文件并按目标岗位生成结构化结果。
${schemaPrompt}
文件名：${fileName}
目标岗位：${targetRole || "未填写"}
MIME 类型：${resumeInput.mimeType}

文件 base64 内容如下。请把它当作原始简历文件解析：
${resumeInput.base64}
  `.trim();
}

function buildSectionContextPayload(section, analysis, extraPrompt) {
  const candidate = analysis.candidate || {};
  const topHighlights = (candidate.highlights || []).slice(0, 4);
  const topRisks = (candidate.risks || []).slice(0, 4);
  const topMetrics = (candidate.metrics || []).slice(0, 4);
  const topExperience = (candidate.experience || []).slice(0, 3);
  const topEducation = (candidate.education || []).slice(0, 2);
  const dimensions = (analysis.dimensions || []).map((item) => ({ name: item.name, note: item.note }));
  const existingQuestions = (analysis.questions || []).slice(0, 8).map((item) => ({
    id: item.id,
    dimension: item.dimension,
    topic: item.topic,
  }));
  const resumeExcerpt = extractResumeExcerptBySection(section, analysis.source?.resumeText || "");

  const baseContext = {
    targetRole: analysis.source?.targetRole || candidate.targetRole || "",
    userRequirement: extraPrompt || "",
    resumeExcerpt,
    candidateBrief: {
      name: candidate.name || "",
      summary: candidate.summary || "",
      highlights: topHighlights,
      risks: topRisks,
      metrics: topMetrics,
    },
    currentSectionValue: analysis[section],
  };

  if (section === "candidate") {
    return {
      ...baseContext,
      relevantFacts: {
        education: topEducation,
        experience: topExperience,
        skills: (candidate.skills || []).slice(0, 12),
        certificates: (candidate.certificates || []).slice(0, 8),
      },
    };
  }

  if (section === "dimensions") {
    return {
      ...baseContext,
      relevantFacts: {
        skills: (candidate.skills || []).slice(0, 10),
        topExperience,
        highlights: topHighlights,
        risks: topRisks,
      },
    };
  }

  if (section === "questions") {
    return {
      ...baseContext,
      relevantFacts: {
        dimensions,
        topExperience,
        topMetrics,
        risks: topRisks,
        existingQuestions,
      },
    };
  }

  return {
    ...baseContext,
    relevantFacts: {
      topExperience,
      topMetrics,
      risks: topRisks,
      existingQuestions,
    },
  };
}

function extractResumeExcerptBySection(section, resumeText) {
  if (!resumeText) return "";
  const lines = String(resumeText)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const keywordsBySection = {
    candidate: ["教育", "经历", "实习", "项目", "技能", "证书", "GPA", "summary"],
    dimensions: ["职责", "成果", "能力", "技能", "项目", "协作", "数据"],
    questions: ["经历", "项目", "成果", "提升", "%", "负责", "难点", "复盘"],
    interviewerTips: ["风险", "亮点", "成果", "数据", "离职", "动机", "匹配"],
  };

  const keywords = keywordsBySection[section] || [];
  const matched = lines.filter((line) => keywords.some((keyword) => line.includes(keyword)));
  const merged = (matched.length ? matched : lines.slice(0, 24)).join("\n");
  return merged.slice(0, 2200);
}

function parseJsonFromModel(content) {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const startObject = cleaned.indexOf("{");
    const endObject = cleaned.lastIndexOf("}");
    if (startObject >= 0 && endObject > startObject) {
      return JSON.parse(cleaned.slice(startObject, endObject + 1));
    }
    throw new Error("大模型返回的内容不是合法 JSON");
  }
}
