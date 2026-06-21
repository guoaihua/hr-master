# InterviewMaster (React + TypeScript + Webpack + Express)

智能面试助手前端项目，支持：
- 上传简历（文本 / PDF）
- 服务端接管大模型结构化解析
- PDF 服务端预解析后再送入大模型
- 解析结果预览、分区重生成、确认保存
- 面试工作台展示（档案/维度/问题/小贴士）

## 技术栈

- React 18
- TypeScript
- Webpack 5
- Express
- Docker

## 目录结构

```text
.
├── public/
│   └── index.html
├── server/
│   ├── app.mjs                  # Express API 与静态资源托管
│   └── lib/
│       ├── llm.mjs              # 服务端 LLM 调用与 prompt 构造
│       └── resume.mjs           # 文本/PDF 简历预解析
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── styles.css
│   ├── legacyApp.js                # 现阶段主编排入口（状态流转/流程）
│   ├── legacy/
│   │   ├── views.js                # upload/preview/workbench 页面渲染
│   │   ├── bindings.js             # DOM 事件绑定
│   │   └── store.js                # 状态初始化与动作
│   └── lib/
│       ├── llm.js                  # 前端调用本地 API
│       ├── storage.js              # localStorage 读写
│       └── fileUtils.js            # 上传文件类型校验
├── Dockerfile
├── server.mjs
├── webpack.config.js
├── tsconfig.json
└── package.json
```

## 本地开发

安装依赖：

```bash
npm install
```

配置环境变量：

```bash
cp .env.example .env
```

在 `.env` 中填写：

```bash
LLM_API_KEY=你的真实APIKey
# 可选
LLM_BASE_URL=https://www.dmxapi.cn/v1
LLM_MODEL=mimo-v2.5-pro
PORT=3001
```

如果页面通过 Nginx 挂在子路径，例如 `/hr/`，构建时追加：

```bash
PUBLIC_PATH=/hr/ npm run build
```

这样前端静态资源和前端发起的 API 请求都会带上 `/hr/` 前缀。

启动开发环境：

```bash
npm start
```

默认：

```text
前端：http://localhost:4173/
服务端：http://localhost:3001/
```

开发期前端会通过 webpack proxy 把 `/api` 转发到 Express 服务端。

## 生产构建

```bash
npm run build
npm run serve
```

构建产物输出到 `dist/`，并由 Express 统一托管静态页面和 API。

## Docker 部署

构建镜像：

```bash
docker build -t interviewmaster .
```

运行容器：

```bash
docker run --rm -p 3001:3001 --env-file .env interviewmaster
```

访问：

```text
http://localhost:3001/
```

## 关键配置

- 服务端必须配置 `LLM_API_KEY`
- 可选配置 `LLM_BASE_URL`、`LLM_MODEL`
- 前端不再注入任何 LLM 密钥
- 当前正式支持 `TXT / Markdown / JSON / PDF`
- PDF 会先在服务端提取文字，再传给 OpenAI-compatible 模型做结构化解析

## 当前重构状态

项目当前已完成：

- 前端上传与预览流程
- 服务端 API 化的 LLM 调用
- PDF 服务端预解析
- 基础单元测试与 API 测试



docker swarm init
docker build -t interviewmaster:latest .
docker service create \
  --name interviewmaster \
  --publish 3001:3001 \
  --env LLM_API_KEY=sk-1z04BLtScjucChTa10pIgJrb5u7RRPYVgwqJFLflSg1D6Y8P \
  --env LLM_BASE_URL=https://www.dmxapi.cn/v1 \
  --env LLM_MODEL=mimo-v2.5-pro \
  --env PORT=3001 \
  ziminga/interviewmaster:latest



docker service update --image ziminga/interviewmaster:latest --force interviewmaster