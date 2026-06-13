export function saveAnalysis(storageKeys, analysis) {
  localStorage.setItem(storageKeys.current, JSON.stringify(analysis));
  const history = readHistory(storageKeys);
  history.unshift({
    savedAt: new Date().toISOString(),
    fileName: analysis.source.fileName,
    targetRole: analysis.source.targetRole,
    analysis,
  });
  localStorage.setItem(storageKeys.history, JSON.stringify(history.slice(0, 10)));
}

export function readSavedAnalysis(storageKeys, normalizeAnalysis) {
  try {
    const raw = localStorage.getItem(storageKeys.current);
    return raw ? normalizeAnalysis(JSON.parse(raw), JSON.parse(raw).source) : null;
  } catch {
    return null;
  }
}

export function readHistory(storageKeys) {
  try {
    return JSON.parse(localStorage.getItem(storageKeys.history) || "[]");
  } catch {
    return [];
  }
}
