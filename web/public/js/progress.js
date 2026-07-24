/**
 * Progress + UI settings persistence (localStorage)
 */
const PoolersProgress = (() => {
  const PROG_KEY = "poolers.progress.v1";
  const SETTINGS_KEY = "poolers.settings.v1";
  const QUIZ_KEY = "poolers.quizScores.v1";

  const defaultSettings = () => ({
    theme: "dark",
    sidebarWidth: null,
    bottomHeight: null,
    panelCollapsed: false,
    bottomTab: "steps",
  });

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return { ...fallback, ...JSON.parse(raw) };
    } catch (_) {
      return fallback;
    }
  }

  function saveJson(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (_) {}
  }

  function getProgress() {
    return loadJson(PROG_KEY, { done: {}, opened: {} });
  }

  function markOpened(path) {
    if (!path) return;
    const p = getProgress();
    p.opened[path] = Date.now();
    saveJson(PROG_KEY, p);
  }

  function toggleDone(path) {
    if (!path) return false;
    const p = getProgress();
    if (p.done[path]) delete p.done[path];
    else p.done[path] = Date.now();
    saveJson(PROG_KEY, p);
    return !!p.done[path];
  }

  function isDone(path) {
    return !!getProgress().done[path];
  }

  function stats() {
    const p = getProgress();
    return {
      done: Object.keys(p.done).length,
      opened: Object.keys(p.opened).length,
    };
  }

  function getSettings() {
    return loadJson(SETTINGS_KEY, defaultSettings());
  }

  function setSettings(patch) {
    const s = { ...getSettings(), ...patch };
    saveJson(SETTINGS_KEY, s);
    return s;
  }

  function saveQuizScore(path, correct, total) {
    if (!path) return;
    const all = loadJson(QUIZ_KEY, {});
    all[path] = { correct, total, at: Date.now() };
    saveJson(QUIZ_KEY, all);
  }

  function getQuizScore(path) {
    return loadJson(QUIZ_KEY, {})[path] || null;
  }

  return {
    getProgress,
    markOpened,
    toggleDone,
    isDone,
    stats,
    getSettings,
    setSettings,
    saveQuizScore,
    getQuizScore,
  };
})();

if (typeof module !== "undefined") module.exports = PoolersProgress;
