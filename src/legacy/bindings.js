export function bindHeaderActions({
  state,
  render,
  openPreview,
  hydrateWorkbenchState,
  resetToUploadState,
  sampleAnalysis,
  deepClone,
  openHistory,
}) {
  document.querySelectorAll("[data-action='restart'], [data-action='back-upload']").forEach((button) => {
    button.addEventListener("click", () => {
      resetToUploadState(state);
      render();
    });
  });

  document.querySelectorAll("[data-action='continue-saved']").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = "workbench";
      hydrateWorkbenchState(state.savedAnalysis);
      render();
    });
  });

  document.querySelectorAll("[data-action='load-sample']").forEach((button) => {
    button.addEventListener("click", () => {
      openPreview(deepClone(sampleAnalysis));
    });
  });

  document.querySelectorAll("[data-action='open-history']").forEach((button) => {
    button.addEventListener("click", () => {
      openHistory();
    });
  });
}

export function bindPreviewActions({ applySectionEdit, regenerateSection, confirmAndSave, toggleEditingSection, state, renderPreview }) {
  document.querySelectorAll("[data-action='toggle-edit']").forEach((button) => {
    button.addEventListener("click", () => {
      const section = button.dataset.section;
      toggleEditingSection(state, section);
      renderPreview();
    });
  });

  document.querySelectorAll("[data-action='apply-section']").forEach((button) => {
    button.addEventListener("click", () => applySectionEdit(button.dataset.section));
  });

  document.querySelectorAll("[data-action='regen-section']").forEach((button) => {
    button.addEventListener("click", () => regenerateSection(button.dataset.section));
  });

  document.querySelectorAll("[data-action='confirm-save']").forEach((button) => {
    button.addEventListener("click", confirmAndSave);
  });
}

export function bindWorkbenchActions({ state, renderWorkbench }) {
  const searchInput = document.querySelector("#searchInput");
  searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    state.keepSearchFocus = true;
    state.searchSelectionStart = event.target.selectionStart;
    state.searchSelectionEnd = event.target.selectionEnd;
    window.clearTimeout(state.searchTimer);
    state.searchTimer = window.setTimeout(renderWorkbench, 80);
  });

  document.querySelectorAll("[data-action='select-all']").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedDimensions = state.savedAnalysis.dimensions.map((dimension) => dimension.name);
      renderWorkbench();
    });
  });

  document.querySelectorAll("[data-action='clear-dimensions']").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedDimensions = [];
      renderWorkbench();
    });
  });

  document.querySelectorAll("[data-action='toggle-dimension']").forEach((button) => {
    button.addEventListener("click", () => {
      const dimension = button.dataset.dimension;
      if (state.selectedDimensions.includes(dimension)) {
        state.selectedDimensions = state.selectedDimensions.filter((item) => item !== dimension);
      } else {
        state.selectedDimensions = [...state.selectedDimensions, dimension];
      }
      renderWorkbench();
    });
  });

  document.querySelectorAll("[data-action='set-mode']").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeModes[button.dataset.id] = button.dataset.mode;
      renderWorkbench();
    });
  });

  document.querySelectorAll("[data-action='toggle-expand']").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      state.expanded[id] = state.expanded[id] === false;
      renderWorkbench();
    });
  });

  document.querySelectorAll("[data-action='clear-search']").forEach((button) => {
    button.addEventListener("click", () => {
      state.search = "";
      renderWorkbench();
    });
  });
}

export function bindHistoryActions({ openHistoryItem, editHistoryItem }) {
  document.querySelectorAll("[data-action='open-history-item']").forEach((button) => {
    button.addEventListener("click", () => {
      openHistoryItem(Number(button.dataset.index));
    });
  });

  document.querySelectorAll("[data-action='edit-history-item']").forEach((button) => {
    button.addEventListener("click", () => {
      editHistoryItem(Number(button.dataset.index));
    });
  });
}
