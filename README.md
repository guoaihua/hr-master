# InterviewMaster (React + TypeScript + Webpack)

智能面试助手前端项目，支持：
- 上传简历（文本/文件）
- 大模型结构化解析（当前支持硬编码结果模式）
- 解析结果预览、分区重生成、确认保存
- 面试工作台展示（档案/维度/问题/小贴士）

## 技术栈

- React 18
- TypeScript
- Webpack 5
- Docker (Nginx 静态部署)

## 目录结构

```text
.
├── public/
│   └── index.html
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
│       ├── llm.js                  # 大模型调用与提示词构造
│       ├── storage.js              # localStorage 读写
│       └── fileUtils.js            # 文件读取与简历输入预处理
├── docker/
│   └── nginx.conf
├── Dockerfile
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
VITE_LLM_API_KEY=你的真实APIKey
```

启动开发服务器：

```bash
npm start
```

默认地址：

```text
http://localhost:4173/
```

## 生产构建

```bash
npm run build
```

构建产物输出到 `dist/`。

## Docker 部署

构建镜像：

```bash
docker build -t interviewmaster .
```

运行容器：

```bash
docker run --rm -p 8080:80 interviewmaster
```

访问：

```text
http://localhost:8080/
```

## 关键配置

大模型配置位于：

- `src/legacyApp.js` 中 `LLM_CONFIG`

当前默认：

- `useHardcodedResult: false`（默认走真实模型调用）

如需切换真实模型调用：

1. 将 `useHardcodedResult` 改为 `false`
2. 在 `.env` 配置 `VITE_LLM_API_KEY`
3. 按需调整 `baseURL / model`

生产环境同样需要注入 `VITE_LLM_API_KEY`，再执行构建：

```bash
VITE_LLM_API_KEY=你的真实APIKey npm run build
```

## 当前重构状态

项目已完成分层拆分（`legacyApp` + `legacy/*` + `lib/*`），功能可用并可构建。

下一步建议：

1. 将 `legacy/views.js` 逐步替换为真正 React 组件
2. 为核心数据结构补充 TypeScript 类型定义（`types.ts`）
3. 增加基础单元测试与流程测试
