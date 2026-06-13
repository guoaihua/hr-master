export function renderShell(app, state, content) {
  const action =
    state.view === "workbench"
      ? '<button class="btn secondary" data-action="restart">重新上传</button>'
      : state.view === "preview"
        ? '<button class="btn secondary" data-action="back-upload">返回上传</button>'
        : state.savedAnalysis
          ? '<button class="btn secondary" data-action="continue-saved">继续上次结果</button><button class="btn secondary" data-action="load-sample">加载匿名样例</button>'
          : '<button class="btn secondary" data-action="load-sample">加载匿名样例</button>';

  app.innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div class="topbar-inner">
          <div class="brand">
            <div class="brand-mark">I</div>
            <div>
              <p class="brand-title">InterviewMaster</p>
              <p class="brand-subtitle">智能面试助手</p>
            </div>
          </div>
          <div class="header-actions">${action}</div>
        </div>
      </header>
      ${content}
    </div>
  `;
}

export function renderUpload(app, state, helpers) {
  const { llmStatusText, LLM_CONFIG, bindHeaderActions, processFile, deepClone, sampleAnalysis, render, openPreview, hydrateWorkbenchState, resetToUploadState } = helpers;

  renderShell(
    app,
    state,
    `
    <main class="upload-page">
      <section class="intro-panel">
        <p class="eyebrow">大模型结构化解析</p>
        <h1>上传简历，先预览确认，再生成面试工作台</h1>
        <p class="intro-copy">
          文本简历会直接送服务端解析，PDF 会先提取文字再交给大模型生成统一 JSON。你可以在预览页编辑或分区重生成，确认后才保存并渲染页面。
        </p>
        <div class="feature-grid">
          <div class="feature"><strong>统一结构</strong><span>候选人档案、维度、问题和小贴士都进入同一个 JSON。</span></div>
          <div class="feature"><strong>人工确认</strong><span>生成结果不会直接进入工作台，先由面试官预览和调整。</span></div>
          <div class="feature"><strong>分区重生成</strong><span>人选档案、维度、问题、小贴士可以分别重跑。</span></div>
          <div class="feature"><strong>本地保存</strong><span>确认后的结构化内容保存到浏览器本地存储。</span></div>
        </div>
      </section>

      <section class="upload-panel">
        <div class="field">
          <label for="targetRole">目标岗位</label>
          <input id="targetRole" type="text" value="HR实习生-招聘方向" placeholder="例如：HR实习生-招聘方向" />
        </div>
        <div class="dropzone" data-action="choose-file">
          <div>
            <div class="upload-icon" aria-hidden="true">
              <svg width="25" height="25" viewBox="0 0 24 24" fill="none">
                <path d="M12 15V4m0 0 4 4m-4-4-4 4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2>选择或拖拽简历文件</h2>
            <p>支持 TXT / Markdown / JSON / PDF。PDF 会先在服务端预解析成文字，再交给大模型处理。</p>
            <button class="btn" type="button">上传并解析</button>
            <input class="file-input" id="resumeFile" type="file" accept=".txt,.md,.markdown,.json,.pdf" />
          </div>
        </div>
        <p class="small-note">${escapeHtml(llmStatusText(LLM_CONFIG))}</p>
        ${statusMarkup(state)}
        ${errorMarkup(state)}
      </section>
    </main>
  `,
  );

  bindHeaderActions({
    state,
    render,
    openPreview,
    hydrateWorkbenchState,
    resetToUploadState,
    sampleAnalysis,
    deepClone,
  });

  const fileInput = document.querySelector("#resumeFile");
  const dropzone = document.querySelector(".dropzone");
  const roleInput = document.querySelector("#targetRole");

  dropzone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) processFile(file, roleInput.value.trim());
  });
  dropzone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropzone.classList.add("dragging");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragging"));
  dropzone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragging");
    const file = event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) processFile(file, roleInput.value.trim());
  });
}

export function renderPreview(app, state, helpers) {
  const { SECTION_META, LLM_CONFIG, bindHeaderActions, bindPreviewActions, applySectionEdit, regenerateSection, confirmAndSave, toggleEditingSection, renderPreview, render } = helpers;
  const analysis = state.analysisDraft;

  renderShell(
    app,
    state,
    `
    <main class="preview-page">
      <section class="preview-main">
        <div class="preview-hero">
          <div>
            <p class="eyebrow">解析结果预览</p>
            <h1>确认结构化内容后再生成工作台</h1>
            <p>默认展示结构化结果。需要修改时可进入编辑模式，或按区块重生成。</p>
          </div>
          <button class="btn" data-action="confirm-save">确认并保存</button>
        </div>
        ${sectionEditor("candidate", state, SECTION_META)}
        ${sectionEditor("dimensions", state, SECTION_META)}
        ${sectionEditor("questions", state, SECTION_META)}
        ${sectionEditor("interviewerTips", state, SECTION_META)}
      </section>
      <aside class="preview-side stack">
        <div class="card">
          <h3>来源信息</h3>
          <ul class="plain-list">
            <li>文件：${escapeHtml(analysis.source.fileName || "未命名")}</li>
            <li>岗位：${escapeHtml(analysis.source.targetRole || "未填写")}</li>
            <li>模型：${escapeHtml(analysis.meta.model || LLM_CONFIG.model)}</li>
            <li>更新时间：${escapeHtml(formatDateTime(analysis.source.updatedAt))}</li>
          </ul>
        </div>
        <div class="card">
          <h3>输出约束</h3>
          <ul class="bullet-list">
            <li>确认保存后，工作台只消费这份 JSON。</li>
            <li>字段缺失时用空字符串或空数组。</li>
            <li>分区重生成只覆盖对应区块。</li>
            <li>保存位置是浏览器 localStorage。</li>
          </ul>
        </div>
        ${errorMarkup(state)}
        ${statusMarkup(state)}
      </aside>
    </main>
  `,
  );

  bindHeaderActions({
    state,
    render,
    openPreview: helpers.openPreview,
    hydrateWorkbenchState: helpers.hydrateWorkbenchState,
    resetToUploadState: helpers.resetToUploadState,
    sampleAnalysis: helpers.sampleAnalysis,
    deepClone: helpers.deepClone,
  });
  bindPreviewActions({
    applySectionEdit,
    regenerateSection,
    confirmAndSave,
    state,
    renderPreview,
    toggleEditingSection,
  });
}

export function renderWorkbench(app, state, helpers) {
  const { render, bindHeaderActions, bindWorkbenchActions, openPreview, hydrateWorkbenchState, resetToUploadState, sampleAnalysis, deepClone, renderWorkbench } = helpers;
  const analysis = state.savedAnalysis;
  const selected = state.selectedDimensions;
  const query = state.search.trim().toLowerCase();
  const questions = analysis.questions.filter((question) => {
    const dimensionMatch = selected.length === 0 || selected.includes(question.dimension);
    const text = [
      question.topic,
      question.background,
      question.openEnded,
      question.situational,
      ...(question.tips || []),
    ]
      .join(" ")
      .toLowerCase();
    return dimensionMatch && (!query || text.includes(query));
  });

  renderShell(
    app,
    state,
    `
    <main class="workbench">
      <aside class="stack">
        ${candidateCard(analysis.candidate)}
        ${dimensionFilter(analysis.dimensions, state)}
      </aside>
      <section class="stack">
        <div class="card search-card">
          <div class="search-box">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="m21 21-4.2-4.2M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" stroke="#7b8aa0" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input id="searchInput" type="text" value="${escapeAttribute(state.search)}" placeholder="搜索问题内容..." />
            ${state.search ? '<button class="icon-btn" type="button" data-action="clear-search" aria-label="清空搜索" title="清空搜索">×</button>' : ""}
          </div>
        </div>
        <p class="result-line">找到 <strong>${questions.length}</strong> 个问题</p>
        <div class="question-list">${questions.length ? questions.map((question) => questionCard(question, state)).join("") : emptyState()}</div>
      </section>
      <aside class="stack">
        ${starTips()}
        ${interviewerTips(analysis)}
      </aside>
    </main>
  `,
  );

  bindHeaderActions({
    state,
    render,
    openPreview,
    hydrateWorkbenchState,
    resetToUploadState,
    sampleAnalysis,
    deepClone,
  });
  bindWorkbenchActions({
    state,
    renderWorkbench,
  });
  if (state.keepSearchFocus) {
    const input = document.querySelector("#searchInput");
    if (input) {
      input.focus();
      if (Number.isInteger(state.searchSelectionStart) && Number.isInteger(state.searchSelectionEnd)) {
        input.setSelectionRange(state.searchSelectionStart, state.searchSelectionEnd);
      }
    }
    state.keepSearchFocus = false;
  }
}

function candidateCard(candidate) {
  return `
    <div class="card">
      <div class="candidate-head">
        <div class="avatar">${escapeHtml((candidate.name || "候").slice(0, 1))}</div>
        <div>
          <h2>${escapeHtml(candidate.name || "候选人")}</h2>
          <p>${escapeHtml(candidate.targetRole || "目标岗位待确认")}</p>
        </div>
      </div>
      ${candidate.summary ? `<p class="profile-summary">${escapeHtml(candidate.summary)}</p>` : ""}
      <div class="metrics">
        ${candidate.metrics
          .slice(0, 4)
          .map((item) => `<div class="metric"><div><strong>${escapeHtml(item.value)}</strong><br><span>${escapeHtml(item.label)}</span></div></div>`)
          .join("")}
      </div>
      ${profileSection("教育背景", candidate.education)}
      ${profileSection("核心经历", candidate.experience)}
      ${profileSection("其他经历", candidate.otherExperience)}
      ${profileSection("技能", candidate.skills)}
      ${profileSection("技能证书", candidate.certificates)}
      ${profileSection("简历亮点", candidate.highlights, true)}
      ${profileSection("待核实信息", candidate.risks, true)}
    </div>
  `;
}

function profileSection(title, items, bullet = false) {
  if (!items || items.length === 0) return "";
  const className = bullet ? "bullet-list" : "plain-list";
  return `
    <section class="section">
      <h3>${escapeHtml(title)}</h3>
      <ul class="${className}">
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </section>
  `;
}

function dimensionFilter(dimensions, state) {
  return `
    <div class="card">
      <div class="filter-actions">
        <h3>素质维度</h3>
        <div class="mini-actions">
          <button class="link-btn" data-action="select-all">全选</button>
          <button class="link-btn" data-action="clear-dimensions">清空</button>
        </div>
      </div>
      <div class="dimension-list">
        ${dimensions
          .map((dimension) => {
            const active = state.selectedDimensions.includes(dimension.name);
            return `
              <button class="dimension-btn ${active ? "active" : ""}" data-action="toggle-dimension" data-dimension="${escapeAttribute(dimension.name)}">
                <span>${escapeHtml(dimension.name)}</span>
                <small>${escapeHtml(dimension.note || "")}</small>
              </button>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function questionCard(question, state) {
  const mode = state.activeModes[question.id] || "open";
  const expanded = state.expanded[question.id] !== false;
  const tone = getTone(question.dimension);
  return `
    <article class="question-card">
      <div class="question-accent"></div>
      <div class="question-body">
        <div class="question-head">
          <div>
            <h3>${escapeHtml(question.topic)}</h3>
            <span class="tag ${tone}">${escapeHtml(question.dimension)}</span>
          </div>
          <button class="icon-btn" title="${expanded ? "收起" : "展开"}" data-action="toggle-expand" data-id="${escapeAttribute(question.id)}">
            ${expanded ? "⌃" : "⌄"}
          </button>
        </div>
        <p class="background-text">${escapeHtml(question.background)}</p>
        <div class="mode-toggle">
          <button class="${mode === "open" ? "active" : ""}" data-action="set-mode" data-id="${escapeAttribute(question.id)}" data-mode="open">开放式</button>
          <button class="${mode === "situational" ? "active" : ""}" data-action="set-mode" data-id="${escapeAttribute(question.id)}" data-mode="situational">情景模拟</button>
        </div>
        <p class="question-text">${escapeHtml(mode === "open" ? question.openEnded : question.situational)}</p>
        ${
          expanded
            ? `<div class="tips">
                <h4>面试官提示</h4>
                <ul class="bullet-list">${(question.tips || []).map((tip) => `<li>${escapeHtml(tip)}</li>`).join("")}</ul>
              </div>`
            : ""
        }
      </div>
    </article>
  `;
}

function starTips() {
  return `
    <div class="tips-card">
      <h3>STAR 追问指南</h3>
      <div class="tip-item"><strong>S - Situation 情境</strong><p>当时具体的背景和难点是什么？</p></div>
      <div class="tip-item"><strong>T - Task 任务</strong><p>你的具体职责是什么？</p></div>
      <div class="tip-item"><strong>A - Action 行动</strong><p>你具体说了什么、做了什么？重点深挖实际动作。</p></div>
      <div class="tip-item"><strong>R - Result 结果</strong><p>最终的量化产出或他人的评价如何？</p></div>
    </div>
  `;
}

function interviewerTips(analysis) {
  const tips = analysis.interviewerTips.length
    ? analysis.interviewerTips
    : ["针对简历中的量化数据逐项追问，确认其真实角色和贡献度。"];
  return `
    <div class="tips-card">
      <h3>面试官小贴士</h3>
      ${tips
        .map((tip, index) => `<div class="tip-item"><strong>${index + 1}. 追问建议</strong><p>${escapeHtml(tip)}</p></div>`)
        .join("")}
    </div>
  `;
}

function emptyState() {
  return `
    <div class="card empty-state">
      <h3>没有找到匹配的问题</h3>
      <p>试试调整搜索词或清空筛选维度。</p>
    </div>
  `;
}

function statusMarkup(state) {
  if (!state.status) return "";
  return `
    <div class="status-box">
      <div class="status-row"><span class="spinner"></span><span>${escapeHtml(state.status)}</span></div>
      <div class="progress"><span style="width:${state.progress}%"></span></div>
    </div>
  `;
}

function errorMarkup(state) {
  return state.error ? `<div class="error">${escapeHtml(state.error)}</div>` : "";
}

function getTone(dimension) {
  if (dimension === "抗压性") return "red";
  if (dimension === "是否挑活") return "green";
  if (dimension === "AI工具应用") return "purple";
  if (dimension === "自驱动学习") return "gray";
  return "";
}

function sectionEditor(key, state, sectionMeta) {
  const meta = sectionMeta[key];
  const editing = !!state.editingSections[key];
  const value = state.editorText[key] ?? toPrettyJson(state.analysisDraft[key]);
  return `
    <article class="preview-card">
      <div class="preview-card-head">
        <div>
          <h2>${escapeHtml(meta.title)}</h2>
          <p>${escapeHtml(meta.description)}</p>
        </div>
        <div class="section-actions">
          <button class="btn secondary" data-action="toggle-edit" data-section="${key}">${editing ? "取消编辑" : "编辑区块"}</button>
          ${editing ? `<button class="btn secondary" data-action="apply-section" data-section="${key}">应用编辑</button>` : ""}
          <button class="btn" data-action="regen-section" data-section="${key}">重新生成</button>
        </div>
      </div>
      ${editing ? `<textarea class="json-editor" data-editor="${key}" spellcheck="false">${escapeHtml(value)}</textarea>` : previewSectionContent(key, state)}
      <div class="regen-row">
        <input data-extra="${key}" type="text" placeholder="补充要求，例如：更关注抗压性，减少 AI 工具问题" />
      </div>
    </article>
  `;
}

function previewSectionContent(section, state) {
  if (section === "candidate") return previewCandidate(state.analysisDraft.candidate);
  if (section === "dimensions") return previewDimensions(state.analysisDraft.dimensions);
  if (section === "questions") return previewQuestions(state.analysisDraft.questions);
  if (section === "interviewerTips") return previewInterviewerTips(state.analysisDraft.interviewerTips);
  return "";
}

function previewCandidate(candidate) {
  return `
    <div class="preview-content">
      <div class="preview-grid">
        <div><strong>姓名</strong><p>${escapeHtml(candidate.name || "-")}</p></div>
        <div><strong>目标岗位</strong><p>${escapeHtml(candidate.targetRole || "-")}</p></div>
      </div>
      <div class="preview-block">
        <strong>个人总结</strong>
        <p>${escapeHtml(candidate.summary || "-")}</p>
      </div>
      ${previewListBlock("教育背景", candidate.education)}
      ${previewListBlock("核心经历", candidate.experience)}
      ${previewListBlock("其他经历", candidate.otherExperience)}
      ${previewListBlock("技能", candidate.skills)}
      ${previewListBlock("证书", candidate.certificates)}
      ${previewListBlock("亮点", candidate.highlights)}
      ${previewListBlock("风险点", candidate.risks)}
      ${previewMetrics(candidate.metrics)}
    </div>
  `;
}

function previewDimensions(dimensions) {
  const items = (dimensions || [])
    .map(
      (item, index) => `
        <li>
          <strong>${index + 1}. ${escapeHtml(item.name || "未命名维度")}</strong>
          <p>${escapeHtml(item.note || "-")}</p>
        </li>
      `,
    )
    .join("");
  return `<div class="preview-content"><ul class="preview-list">${items || "<li>暂无维度</li>"}</ul></div>`;
}

function previewQuestions(questions) {
  const cards = (questions || [])
    .map(
      (question, index) => `
        <article class="question-preview">
          <h4>${escapeHtml(`${index + 1}. ${question.topic || `问题 ${index + 1}`}`)}</h4>
          <p><strong>维度：</strong>${escapeHtml(question.dimension || "-")}</p>
          <p><strong>简历依据：</strong>${escapeHtml(question.background || "-")}</p>
          <p><strong>开放式：</strong>${escapeHtml(question.openEnded || "-")}</p>
          <p><strong>情景模拟：</strong>${escapeHtml(question.situational || "-")}</p>
          <p><strong>提示：</strong>${escapeHtml((question.tips || []).join("；") || "-")}</p>
        </article>
      `,
    )
    .join("");
  return `<div class="preview-content stack">${cards || "<p>暂无问题</p>"}</div>`;
}

function previewInterviewerTips(tips) {
  const items = (tips || []).map((tip) => `<li>${escapeHtml(tip)}</li>`).join("");
  return `<div class="preview-content"><ul class="preview-list">${items || "<li>暂无小贴士</li>"}</ul></div>`;
}

function previewListBlock(title, items) {
  const list = (items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  return `
    <div class="preview-block">
      <strong>${escapeHtml(title)}</strong>
      <ul class="preview-list compact">${list || "<li>-</li>"}</ul>
    </div>
  `;
}

function previewMetrics(metrics) {
  const cards = (metrics || [])
    .map(
      (item) => `
        <div class="metric-chip">
          <strong>${escapeHtml(item.value || "-")}</strong>
          <span>${escapeHtml(item.label || "-")}</span>
        </div>
      `,
    )
    .join("");
  return `
    <div class="preview-block">
      <strong>量化指标</strong>
      <div class="metric-chip-row">${cards || '<div class="metric-chip"><span>暂无指标</span></div>'}</div>
    </div>
  `;
}

function toPrettyJson(value) {
  return JSON.stringify(value, null, 2);
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
