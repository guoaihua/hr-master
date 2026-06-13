import express from "express";
import multer from "multer";
import { buildInitialMessages, buildSectionMessages, callLLMJson } from "./lib/llm.mjs";
import { extractResumeText } from "./lib/resume.mjs";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const SECTION_META = {
  candidate: {
    title: "人选档案",
    description: "姓名、目标岗位、教育经历、核心经历、亮点、风险点和量化指标。",
  },
  dimensions: {
    title: "面试维度",
    description: "用于筛选题目的考察维度。建议 5-7 个，名称要能覆盖岗位核心胜任力。",
  },
  questions: {
    title: "定制化面试问题",
    description: "默认 8-12 道题，每题包含简历依据、开放式问题、情景模拟和面试官提示。",
  },
  interviewerTips: {
    title: "面试官小贴士",
    description: "围绕简历中的量化成果、风险点、亮点和待核实信息给面试官提醒。",
  },
};

export function loadServerConfig() {
  return {
    apiKey: cleanValue(process.env.LLM_API_KEY),
    baseURL: cleanValue(process.env.LLM_BASE_URL || "https://www.dmxapi.cn/v1"),
    model: cleanValue(process.env.LLM_MODEL || "mimo-v2.5-pro"),
    port: Number(process.env.PORT || 3001),
  };
}

export function createApp({ config = loadServerConfig(), staticDir = null, llmClient = callLLMJson, parsePdf } = {}) {
  const app = express();

  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      model: config.model,
    });
  });

  app.post("/api/resume/parse", upload.single("file"), async (req, res) => {
    try {
      ensureServerConfigured(config);
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "缺少简历文件" });
      }

      const targetRole = cleanValue(req.body?.targetRole);
      const resumeText = await extractResumeText(file, { parsePdf });
      const messages = buildInitialMessages({
        fileName: file.originalname,
        targetRole,
        resumeText,
        model: config.model,
      });

      const analysis = await llmClient(messages, config);

      return res.json({
        ...analysis,
        source: {
          ...(analysis.source || {}),
          fileName: file.originalname,
          targetRole,
          resumeText,
          updatedAt: new Date().toISOString(),
        },
        meta: {
          ...(analysis.meta || {}),
          model: analysis.meta?.model || config.model,
        },
      });
    } catch (error) {
      return handleError(res, error);
    }
  });

  app.post("/api/analysis/regenerate-section", async (req, res) => {
    try {
      ensureServerConfigured(config);
      const section = cleanValue(req.body?.section);
      const analysis = req.body?.analysis;
      const extraPrompt = cleanValue(req.body?.extraPrompt);

      if (!SECTION_META[section]) {
        return res.status(400).json({ error: "区块字段不合法" });
      }
      if (!analysis || typeof analysis !== "object") {
        return res.status(400).json({ error: "缺少分析上下文" });
      }

      const messages = buildSectionMessages({
        section,
        analysis,
        extraPrompt,
        sectionMeta: SECTION_META,
      });
      const payload = await llmClient(messages, config);
      return res.json(payload);
    } catch (error) {
      return handleError(res, error);
    }
  });

  if (staticDir) {
    app.use(express.static(staticDir));
    app.use((_req, res) => {
      res.sendFile("index.html", { root: staticDir });
    });
  }

  return app;
}

function ensureServerConfigured(config) {
  if (!config.apiKey) {
    throw new Error("服务端缺少 LLM_API_KEY 配置");
  }
}

function cleanValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function handleError(res, error) {
  const message = error instanceof Error ? error.message : "服务异常";
  const status = inferStatusCode(message);
  return res.status(status).json({ error: message });
}

function inferStatusCode(message) {
  if (message.includes("缺少")) return 400;
  if (message.includes("仅支持")) return 415;
  if (message.includes("预解析")) return 422;
  if (message.includes("大模型")) return 502;
  return 500;
}
