export function createState(savedAnalysis) {
  return {
    view: savedAnalysis ? "workbench" : "upload",
    status: "",
    progress: 0,
    error: "",
    uploadDraft: {
      targetRole: "",
      fileName: "",
      file: null,
    },
    selectedDimensions: [],
    search: "",
    keepSearchFocus: false,
    searchSelectionStart: null,
    searchSelectionEnd: null,
    activeModes: {},
    expanded: {},
    searchTimer: null,
    analysisDraft: null,
    editingHistoryIndex: null,
    savedAnalysis,
    editorText: {},
    editingSections: {
      candidate: false,
      dimensions: false,
      questions: false,
      interviewerTips: false,
    },
  };
}

export function resetToUploadState(state) {
  Object.assign(state, {
    view: "upload",
    status: "",
    progress: 0,
    error: "",
    uploadDraft: {
      targetRole: "",
      fileName: "",
      file: null,
    },
    selectedDimensions: [],
    search: "",
  });
}

export function hydrateWorkbenchState(state, analysis) {
  state.selectedDimensions = [];
  state.search = "";
  state.activeModes = Object.fromEntries((analysis.questions || []).map((question) => [question.id, "open"]));
  state.expanded = Object.fromEntries((analysis.questions || []).map((question, index) => [question.id, index === 0]));
}

export function toggleEditingSection(state, section) {
  state.editingSections[section] = !state.editingSections[section];
}
