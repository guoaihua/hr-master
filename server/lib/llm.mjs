export async function callLLMJson(messages, llmConfig) {
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
  logRawModelOutput({
    model: llmConfig.model,
    content,
  });
  const parsed = parseJsonFromModel(content);
  logParsedModelOutput({
    model: llmConfig.model,
    parsed,
  });
  return parsed;
}

const CORE_DIMENSIONS = [
  { name: "聪明度", note: "复杂信息拆解、关键判断、逻辑推理与问题解决。" },
  { name: "抗压性", note: "面对压力、挫折、冲突和突发变化时的稳定度与补救能力。" },
  { name: "是否挑活", note: "对基础、琐碎、边界模糊任务的责任心、服务意识和质量标准。" },
  { name: "AI工具应用", note: "能否用 AI 提升效率，并对 AI 输出进行校验、修正和风险控制。" },
  { name: "自驱动学习", note: "面对陌生领域时主动补课、建立框架、迁移应用的能力。" },
  { name: "成就动机", note: "是否主动追求结果、复盘改进，并愿意把事情做出可验证成果。" },
];

const QUESTION_FALLBACK_HINTS = {
  聪明度: {
    topic: "复杂信息拆解与关键判断",
    openEnded: "请结合你简历里最复杂的一段经历，讲讲你当时是怎么识别关键问题、做判断并推进解决的？",
    tips: ["追问判断标准", "核实信息来源", "观察逻辑拆解是否清楚"],
  },
  抗压性: {
    topic: "高压场景下的稳定度与补救",
    openEnded: "请讲一次你同时面对时间压力、任务冲突或结果不及预期时的经历。你当时如何稳住节奏并处理问题？",
    tips: ["追问压力来源", "观察优先级", "核实是否有复盘和补救动作"],
  },
  是否挑活: {
    topic: "对基础工作和边界外任务的态度",
    openEnded: "请分享一次工作本身比较琐碎、基础，或者不完全属于你职责范围，但你仍然认真接住并做好的经历。",
    tips: ["观察是否有服务意识", "追问细节标准", "核实是否主动补位"],
  },
  AI工具应用: {
    topic: "用 AI 提效并控制质量风险",
    openEnded: "你有没有用过 AI 工具辅助学习、整理信息或提升效率？请讲一个真实例子，包括你怎么判断输出是否可靠。",
    tips: ["追问输入方式", "核实校验动作", "观察是否理解 AI 边界"],
  },
  自驱动学习: {
    topic: "面对陌生领域的主动补课能力",
    openEnded: "请讲一次你为了完成任务或转向新方向，主动补课、建立框架并快速上手的经历。",
    tips: ["追问学习方法", "观察迁移能力", "核实是否形成自己的框架"],
  },
  成就动机: {
    topic: "从完成任务到做出可验证结果",
    openEnded: "请讲一个你不满足于完成交办，而是主动把事情做出更好结果的经历。你当时为什么愿意多走一步？",
    tips: ["追问目标是谁定的", "核实个人贡献", "观察复盘和改进意识"],
  },
};

export function buildInitialMessages({ fileName, targetRole, resumeText, model }) {
  const schemaPrompt = buildSchemaPrompt(model);
  return [
    {
      role: "system",
      content: buildInitialSystemPrompt(),
    },
    {
      role: "user",
      content: buildTextResumePrompt({ fileName, targetRole, resumeText, schemaPrompt }),
    },
  ];
}

export function buildSectionMessages({ section, analysis, extraPrompt, sectionMeta }) {
  const meta = sectionMeta[section];
  const context = buildSectionContextPayload(section, analysis, extraPrompt);
  const sectionRules = buildSectionRegenerationRules(section);
  return [
    {
      role: "system",
      content: [
        "你是资深面试设计专家。",
        "你的任务是围绕用户填写的目标岗位，识别候选人的通用底层素质，而不是泛泛生成专业题库。",
        "目标岗位必须严格使用用户填写的原始文本，不得擅自改写、泛化、补充括号说明或替换成相近岗位名称。",
        "你正在局部重生成一个结构化 JSON 区块。",
        "仅返回纯 JSON，不要 Markdown、代码块或解释。",
        `只返回一个对象，且只包含 ${section} 这一个顶层字段。`,
        "优先使用提供的最小上下文，不要臆造简历中不存在的事实。",
        sectionRules,
      ].join("\n"),
    },
    {
      role: "user",
      content: `
请仅重新生成区块：${section}（${meta.title}）。

区块说明：${meta.description}
上下文（JSON）：
${JSON.stringify(context, null, 2)}
      `.trim(),
    },
  ];
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

targetRole 要求：
- 必须与用户填写的目标岗位完全一致，逐字保留
- 如果用户填写了目标岗位，candidate.targetRole 必须原样复用该文本
- 不允许把目标岗位改写成更宽泛、更专业化或更口语化的说法

questions 要求：
- 生成 6-12 道，必须覆盖 6 个固定底层素质维度，每个维度至少 1 道
- 每道题字段：id, dimension, topic, background, openEnded, situational, tips
- dimension 只能使用：${CORE_DIMENSIONS.map((item) => item.name).join("、")}
- topic 是提问主题，不是问题本身
- background 必须说明“为什么从简历这些细节切入这个维度”，每道题尽量融合 2-3 个简历事实，例如实习、项目、技能、证书、量化成果、时间冲突、跨领域经历
- openEnded 必须是开放式行为问题，用来深挖真实经历、个人贡献、判断过程和复盘
- situational 必须是目标岗位的真实工作场景或高度相关协作场景，用来测试迁移能力，不能和 openEnded 重复
- tips 必须给面试官 2-4 条追问或观察建议
- 如果某个维度简历证据不足，也要出题，但 background 要明确写“简历证据不足，需通过面试验证...”
- 如果 questions 一时难以完整生成，也必须先为每个维度至少返回 1 道可用问题，绝对不能返回空 questions

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
    "你是资深面试设计专家，负责把候选人简历解析成结构化 JSON。",
    "你的核心任务不是生成通用岗位题库，而是围绕用户填写的目标岗位识别候选人的通用底层素质。",
    `面试维度固定为：${CORE_DIMENSIONS.map((item) => `${item.name}（${item.note}）`).join("、")}。`,
    "用户填写的目标岗位是强约束。只要用户填写了 targetRole，就必须在 candidate.targetRole 中原样返回，不得改写。",
    "仅返回纯 JSON，不要 Markdown、代码块或解释。",
    "缺失字段用空字符串或空数组，不要删字段。",
    "问题必须巧妙融合简历中的多个事实，避免泛泛而谈、性格测试式提问或只复述简历。",
    "所有问题都要服务于底层素质验证：先在 background 里说明简历依据和验证意图，再给开放式问题和情景模拟问题。",
    "questions 绝不能留空；宁可基于有限证据生成待验证问题，也不要返回空数组。",
  ].join("\n");
}

function buildTextResumePrompt({ fileName, targetRole, resumeText, schemaPrompt }) {
  return `
任务：根据简历和目标岗位生成结构化结果。
${schemaPrompt}
文件名：${fileName}
目标岗位：${targetRole || "未填写"}

目标岗位使用规则：
- 如果上面提供了目标岗位，你必须逐字使用这段文本
- candidate.targetRole 必须与上面“目标岗位”完全一致
- 后续的维度、问题和风险点都要围绕这个目标岗位展开，不能偷偷切到别的岗位

固定维度定义：
${CORE_DIMENSIONS.map((item, index) => `${index + 1}. ${item.name}：${item.note}`).join("\n")}

面试提问生成逻辑：
1. 先提取简历中的关键事实，包括经历、项目、技能、证书、量化结果、跨领域转换、压力场景和主动行为。
2. 再把这些事实映射到 6 个固定底层素质维度，不允许新增或替换维度。
3. 每道题的 background 必须融合至少 2 个简历细节；如果证据不足，明确标注待验证，不要编造。
4. 开放式问题用于追问真实经历：怎么判断、怎么行动、个人贡献是什么、结果如何、复盘是什么。
5. 情景模拟问题必须落到目标岗位的真实工作场景，例如该岗位日常任务、跨团队协作、线上问题处理、性能优化、交付节奏、技术选型、质量保障、用户反馈处理等，不能跳去别的岗位语境。
6. 问法要自然，像资深 HR 在面试中追问，不要像考试题或心理测评题。
7. questions 不能为空；如果某些维度证据不足，也要明确写“待验证”的背景并产出问题。

简历文本：
${resumeText}
  `.trim();
}

function buildSectionRegenerationRules(section) {
  if (section === "dimensions") {
    return [
      "dimensions 必须严格返回 6 个固定维度，顺序和名称不可变。",
      JSON.stringify(CORE_DIMENSIONS),
    ].join("\n");
  }

  if (section === "questions") {
    return [
      "questions 必须围绕 6 个固定底层素质维度生成：聪明度、抗压性、是否挑活、AI工具应用、自驱动学习、成就动机。",
      "所有问题都必须服务于 analysis.source.targetRole 指向的目标岗位，不得自行切换岗位语境。",
      "每个维度至少 1 道题；每道题必须包含 topic、background、openEnded、situational、tips。",
      "background 要融合 2-3 个简历细节并说明验证意图；证据不足时明确写待验证，不要编造。",
      "openEnded 深挖真实经历，situational 必须转换到目标岗位的真实工作场景。",
      "即便信息不足，也必须返回非空 questions。",
    ].join("\n");
  }

  return "";
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
    dimensions: ["职责", "成果", "能力", "技能", "项目", "协作", "数据", "压力", "学习", "AI"],
    questions: ["经历", "项目", "成果", "提升", "%", "负责", "难点", "复盘", "压力", "学习", "AI", "主动"],
    interviewerTips: ["风险", "亮点", "成果", "数据", "离职", "动机", "匹配"],
  };

  const keywords = keywordsBySection[section] || [];
  const matched = lines.filter((line) => keywords.some((keyword) => line.includes(keyword)));
  const merged = (matched.length ? matched : lines.slice(0, 24)).join("\n");
  return merged.slice(0, 2200);
}

export function parseJsonFromModel(content) {
  const cleaned = content
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("大模型返回的不是合法 JSON");
  }
}

export function ensureAnalysisCompleteness(analysis) {
  const normalized = {
    ...analysis,
    dimensions: ensureCoreDimensions(analysis?.dimensions),
  };
  normalized.candidate = ensureCandidateTargetRole(normalized.candidate, normalized.source);
  normalized.questions = ensureQuestions(normalized);
  return normalized;
}

function ensureCandidateTargetRole(candidate, source) {
  const safeCandidate = candidate && typeof candidate === "object" ? { ...candidate } : {};
  const strictTargetRole = String(source?.targetRole || "").trim();
  if (strictTargetRole) {
    safeCandidate.targetRole = strictTargetRole;
  } else {
    safeCandidate.targetRole = String(safeCandidate.targetRole || "").trim();
  }
  return safeCandidate;
}

function ensureCoreDimensions(dimensions) {
  if (Array.isArray(dimensions) && dimensions.length === CORE_DIMENSIONS.length) {
    const names = dimensions.map((item) => String(item?.name || ""));
    if (CORE_DIMENSIONS.every((item) => names.includes(item.name))) {
      return dimensions.map((item) => ({
        name: String(item?.name || ""),
        note: String(item?.note || ""),
      }));
    }
  }
  return CORE_DIMENSIONS.map((item) => ({ ...item }));
}

function ensureQuestions(analysis) {
  const sourceQuestions = Array.isArray(analysis?.questions) ? analysis.questions : [];
  const usable = sourceQuestions
    .map((question, index) => normalizeQuestion(question, index, analysis?.dimensions || CORE_DIMENSIONS))
    .filter(Boolean);

  const byDimension = new Map();
  for (const question of usable) {
    if (!byDimension.has(question.dimension)) byDimension.set(question.dimension, question);
  }

  const resumeText = analysis?.source?.resumeText || "";
  const candidate = analysis?.candidate || {};

  return CORE_DIMENSIONS.map((dimension, index) => {
    return (
      byDimension.get(dimension.name) ||
      buildFallbackQuestion({
        dimension,
        index,
        candidate,
        resumeText,
      })
    );
  });
}

function normalizeQuestion(question, index, dimensions) {
  if (!question || typeof question !== "object") return null;
  const dimensionNames = new Set((dimensions || CORE_DIMENSIONS).map((item) => item.name));
  const dimension = String(question.dimension || "");
  if (!dimensionNames.has(dimension)) return null;

  const topic = String(question.topic || "").trim();
  const openEnded = String(question.openEnded || "").trim();
  const situational = String(question.situational || "").trim();
  if (!topic || !openEnded || !situational) return null;

  const background = String(question.background || "").trim() || "简历中相关证据有限，建议通过面试进一步验证该维度。";
  const tips = Array.isArray(question.tips) ? question.tips.map((item) => String(item || "").trim()).filter(Boolean) : [];

  return {
    id: String(question.id || `q${index + 1}`),
    dimension,
    topic,
    background,
    openEnded,
    situational,
    tips: tips.length ? tips : ["追问具体情境", "核实个人贡献", "观察是否能形成稳定方法"],
  };
}

function buildFallbackQuestion({ dimension, index, candidate, resumeText }) {
  const hint = QUESTION_FALLBACK_HINTS[dimension.name];
  const evidence = buildEvidenceSnippet(resumeText, candidate, dimension.name);
  return {
    id: `q-fallback-${index + 1}`,
    dimension: dimension.name,
    topic: hint.topic,
    background: evidence,
    openEnded: hint.openEnded,
    situational: buildRoleSpecificSituational(dimension.name, candidate?.targetRole || "", resumeText),
    tips: hint.tips,
  };
}

function buildEvidenceSnippet(resumeText, candidate, dimensionName) {
  const lines = String(resumeText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 20);
  const highlights = Array.isArray(candidate?.highlights) ? candidate.highlights.slice(0, 2) : [];
  const metrics = Array.isArray(candidate?.metrics) ? candidate.metrics.slice(0, 2).map((item) => `${item.label}:${item.value}`) : [];
  const fragments = [...lines.slice(0, 3), ...highlights, ...metrics].filter(Boolean).slice(0, 4);
  if (!fragments.length) {
    return `简历证据不足，需通过面试验证候选人的${dimensionName}。`;
  }
  return `结合简历中的这些线索进一步验证${dimensionName}：${fragments.join("；")}。`;
}

function buildRoleSpecificSituational(dimensionName, targetRole, resumeText) {
  const role = String(targetRole || "").trim() || "该岗位";
  const roleCue = inferRoleCue(role, resumeText);
  const templates = {
    聪明度: `如果你作为${role}接手一个信息不完整但必须尽快推进的${roleCue}任务，你会如何拆解问题、识别关键点并做出初步判断？`,
    抗压性: `如果你作为${role}同时遇到交付周期紧、需求反复变化和线上/联调问题叠加的情况，你会如何稳住节奏并推进解决？`,
    是否挑活: `如果你作为${role}被分配到一项基础但没人愿意接的${roleCue}工作，例如排查遗留问题、补文档或做重复验证，你会怎么理解它的价值并把它做好？`,
    AI工具应用: `如果你作为${role}需要借助 AI 工具提升${roleCue}效率，你会把 AI 用在哪些环节，又会如何验证输出质量？`,
    自驱动学习: `如果你作为${role}需要在 3 天内补齐一个你不熟悉的${roleCue}知识点并投入实战，你会怎么制定学习和验证路径？`,
    成就动机: `如果你作为${role}完成了基本交付，但你判断${roleCue}还有明显优化空间，你会如何主动设定更高目标并证明改进结果？`,
  };
  return templates[dimensionName] || `如果你作为${role}在实际工作中遇到一个需要重点体现${dimensionName}的场景，你会如何处理？`;
}

function inferRoleCue(targetRole, resumeText) {
  const text = `${targetRole} ${resumeText}`.toLowerCase();
  if (text.includes("unity") || text.includes("ue") || text.includes("unreal") || text.includes("游戏")) return "开发与体验优化";
  if (text.includes("前端") || text.includes("react") || text.includes("web")) return "页面与交互实现";
  if (text.includes("后端") || text.includes("server") || text.includes("java") || text.includes("golang")) return "接口与系统稳定性";
  if (text.includes("算法") || text.includes("模型") || text.includes("machine learning")) return "模型效果与实验迭代";
  if (text.includes("产品")) return "需求拆解与跨团队协作";
  return "核心工作";
}

function logRawModelOutput({ model, content }) {
  console.info("[LLM RAW OUTPUT START]");
  console.info(`model=${model}`);
  console.info(content);
  console.info("[LLM RAW OUTPUT END]");
}

function logParsedModelOutput({ model, parsed }) {
  console.info("[LLM PARSED OUTPUT START]");
  console.info(`model=${model}`);
  console.info(
    JSON.stringify(
      {
        candidateTargetRole: parsed?.candidate?.targetRole || "",
        dimensionsCount: Array.isArray(parsed?.dimensions) ? parsed.dimensions.length : 0,
        questionsCount: Array.isArray(parsed?.questions) ? parsed.questions.length : 0,
        questionDimensions: Array.isArray(parsed?.questions) ? parsed.questions.map((item) => item?.dimension || "") : [],
      },
      null,
      2,
    ),
  );
  console.info("[LLM PARSED OUTPUT END]");
}
