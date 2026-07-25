/**
 * Poolers Playground v3 — VS Code-style tabs, Monaco C + Markdown
 */

(() => {
  let editor = null;
  let traceSteps = [];
  let stepIndex = 0;
  let stepDecorationIds = [];
  let autoStepTimer = null;
  let autoStepRunning = false;
  const AUTO_STEP_MS = 1400;
  let curriculum = { tree: [], stats: {} };
  let allCFiles = [];
  let allQuizzes = [];
  let scratchFiles = [];
  let activeModuleFilter = "all";
  let sidebarView = "browse";
  let suppressUrlUpdates = false;

  /** @type {Map<string, Tab>} */
  const tabs = new Map();
  let activeTabId = null;
  let previewTimer = null;

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const els = {
    tabBar: $("#editor-tab-bar"),
    editorPane: $("#editor-pane"),
    previewPane: $("#preview-pane"),
    mdPreview: $("#md-preview"),
    quizPreview: $("#quiz-preview"),
    companionBtns: $("#companion-btns"),
    btnOpenLesson: $("#btn-open-lesson"),
    btnOpenQuiz: $("#btn-open-quiz"),
    btnOpenCheatsheet: $("#btn-open-cheatsheet"),
    mdModeBtns: $("#md-mode-btns"),
    btnQuizMode: $("#btn-quiz-mode"),
    editorHost: $("#editor"),
    workspace: $("#editor-workspace"),
    tree: $("#curriculum-tree"),
    cfilesList: $("#cfiles-list"),
    quizzesList: $("#quizzes-list"),
    scratchList: $("#scratch-list"),
    scratchHistory: $("#scratch-history"),
    scratchHistoryWrap: $("#scratch-history-wrap"),
    btnNewScratch: $("#btn-new-scratch"),
    btnSaveScratch: $("#btn-save-scratch"),
    filterChips: $("#filter-chips"),
    terminal: $("#terminal"),
    steps: $("#steps-panel"),
    memory: $("#memory-panel"),
    explanation: $("#explanation"),
    stepCounter: $("#step-counter"),
    exitBadge: $("#exit-badge"),
    search: $("#search"),
    fileMeta: $("#file-meta"),
    lineBadge: $("#line-badge"),
    langBadge: $("#lang-badge"),
    statCfiles: $("#stat-cfiles"),
    statLines: $("#stat-lines"),
    statDone: $("#stat-done"),
    statModule: $("#stat-module"),
    btnRenameScratch: $("#btn-rename-scratch"),
    btnExportScratch: $("#btn-export-scratch"),
    bottomPanel: $("#bottom-panel"),
    stepsModeHint: $("#steps-mode-hint"),
  };

  const FILE_ICONS = { c: "●", md: "◆", lesson: "📖", "quiz-md": "✓", cheatsheet: "⚡", h: "◇", sh: "$" };

  const DEFAULT_CODE = `/* Poolers Playground — your first runnable C program */
#include <unistd.h>

void	ft_putchar(char c)
{
	write(1, &c, 1);
}

int	main(void)
{
	ft_putchar('H');
	ft_putchar('i');
	ft_putchar('!');
	ft_putchar('\\n');
	return (0);
}
`;

  initMonaco().then(async () => {
    if (typeof marked !== "undefined") {
      try {
        marked.use({ gfm: true, breaks: true });
      } catch (e) {
        console.warn("marked.use failed:", e);
      }
    }
    applyPersistedSettings();
    bindEvents();
    initResize();
    initWorkspaceSplitResize();
    await Promise.all([loadCurriculum(), loadCFiles(), loadQuizzes()]);
    await applyUrlStateFromLocation();
    if (!getActiveTab()) {
      openTabFromContent("demo/welcome.c", DEFAULT_CODE, {
        ext: "c",
        module: "Demo",
        lines: DEFAULT_CODE.split("\n").length,
        bytes: DEFAULT_CODE.length,
        exercise: "welcome",
      }, true);
    }
    refreshStats();
    refreshProgressUi();
  });

  function initMonaco() {
    return new Promise((resolve) => {
      require.config({
        paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs" },
      });
      require(["vs/editor/editor.main"], () => {
        if (window.AtomOneDark) AtomOneDark.define(monaco, { background: "#09090b" });
        else monaco.editor.defineTheme("atom-one-dark", { base: "vs-dark", inherit: true, rules: [], colors: { "editor.background": "#09090b" } });
        editor = monaco.editor.create(els.editorHost, {
          theme: "atom-one-dark",
          fontSize: 14,
          fontFamily: "'JetBrains Mono', Consolas, monospace",
          fontLigatures: true,
          lineNumbers: "on",
          minimap: { enabled: true, scale: 1, showSlider: "mouseover" },
          scrollBeyondLastLine: false,
          fixedOverflowWidgets: true,
          padding: { top: 16, bottom: 16 },
          renderLineHighlight: "all",
          bracketPairColorization: { enabled: true, independentColorPoolPerBracketType: true },
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          roundedSelection: true,
          wordWrap: "off",
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
            useShadows: false,
          },
        });
        editor.onDidChangeModelContent(() => {
          const tab = getActiveTab();
          if (!tab) return;
          if (tab.type === "md" || tab.type === "lesson" || tab.type === "quiz-md" || tab.type === "cheatsheet") {
            schedulePreview(tab);
            if (tab.mdMode === "quiz") renderQuizInTab(tab);
          }
        });
        watchEditorResize();
        relayoutEditor();
        resolve();
      });
    });
  }

  /* ── Tab system ── */

  function tabIdForPath(path) {
    return path.replace(/\\/g, "/");
  }

  function fileName(path) {
    return path.split(/[/\\]/).pop();
  }

  function fileType(path, ext) {
    if (/LESSON\.md$/i.test(path)) return "lesson";
    if (/QUIZ\.md$/i.test(path)) return "quiz-md";
    if (/CHEATSHEET\.md$/i.test(path)) return "cheatsheet";
    if (ext === "c" || path.endsWith(".c")) return "c";
    if (ext === "h" || path.endsWith(".h")) return "h";
    if (ext === "md" || path.endsWith(".md")) return "md";
    return "text";
  }

  function langForType(type) {
    if (type === "c" || type === "h") return "c";
    if (type === "md" || type === "lesson" || type === "quiz-md" || type === "cheatsheet") return "markdown";
    return "plaintext";
  }

  function buildUrlState(tab, view) {
    const params = new URLSearchParams();
    if (tab?.scratchId) {
      params.set("folder", "scratch");
      params.set("file", tab.name || "");
      params.set("tab", tab.name || "");
    } else if (tab?.path) {
      const path = tab.path.replace(/\\/g, "/");
      const parts = path.split("/");
      if (parts.length > 1) {
        params.set("folder", parts[0]);
        params.set("file", parts.slice(1).join("/"));
      } else {
        params.set("file", parts[0]);
      }
      params.set("tab", tab.name || path);
    }
    if (tab && ["md", "lesson", "quiz-md", "cheatsheet"].includes(tab.type) && tab.mdMode) {
      params.set("mode", tab.mdMode);
    }
    if (view && view !== "browse") params.set("sidebar", view);
    return params.toString();
  }

  function updateUrlState(tab, view, replace = false) {
    if (suppressUrlUpdates) return;
    const url = new URL(window.location.href);
    url.search = buildUrlState(tab, view);
    url.hash = window.location.hash || "";
    if (replace) {
      window.history.replaceState({}, "", url);
    } else {
      window.history.pushState({}, "", url);
    }
  }

  function setSidebarView(view) {
    sidebarView = view;
    $$(".sidebar-tab").forEach((t) => t.classList.toggle("active", t.dataset.view === view));
    $$(".sidebar-view").forEach((v) => v.classList.toggle("active", v.id === `view-${view}`));
    if (view === "scratch") {
      els.filterChips.classList.add("hidden");
      const active = getActiveTab();
      loadScratchList(active?.scratchId, els.search.value);
      if (active?.scratchId) loadScratchHistory(active.scratchId);
    } else {
      els.filterChips.classList.remove("hidden");
      if (view === "cfiles") renderCFilesList(allCFiles, els.search.value);
      else if (view === "quizzes") renderQuizzesList(allQuizzes, els.search.value);
      else renderTree(curriculum.tree || [], els.search.value);
    }
  }

  async function applyUrlStateFromLocation(isPopstate = false) {
    const params = new URLSearchParams(window.location.search);
    const folder = params.get("folder");
    const file = params.get("file");
    const tab = params.get("tab");
    const sidebar = params.get("sidebar");
    const mode = params.get("mode");

    if (sidebar) setSidebarView(sidebar);

    if (!file) {
      if (!isPopstate) updateUrlState(getActiveTab(), sidebarView, true);
      return;
    }

    if (folder === "scratch" || !folder) {
      await loadScratchList(null);
      let scratchId = scratchFiles.find((f) => f.name === file || f.name === tab)?.id;
      if (!scratchId && file) {
        const created = await fetch("/api/scratch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: file }),
        }).then((res) => res.json()).catch(() => null);
        if (created?.id) {
          scratchId = created.id;
          scratchFiles.push(created);
        }
      }
      if (scratchId) {
        suppressUrlUpdates = true;
        await openScratch(scratchId);
        suppressUrlUpdates = false;
        updateUrlState(getActiveTab(), sidebarView, true);
      }
      return;
    }

    const path = `${folder}/${file}`;
    suppressUrlUpdates = true;
    await openFile(path);
    const activeTab = getActiveTab();
    if (activeTab && ["md", "lesson", "quiz-md", "cheatsheet"].includes(activeTab.type) && mode) {
      setMdMode(mode);
    }
    suppressUrlUpdates = false;
    updateUrlState(getActiveTab(), sidebarView, true);
    jumpToHashForTab(getActiveTab(), true);
  }

  function getActiveTab() {
    return activeTabId ? tabs.get(activeTabId) : null;
  }

  async function openFile(filePath) {
    const id = tabIdForPath(filePath);
    closeSidebarIfMobile();
    if (typeof PoolersProgress !== "undefined") PoolersProgress.markOpened(filePath);
    if (tabs.has(id)) {
      activateTab(id);
      highlightSidebar(filePath);
      refreshProgressUi();
      return;
    }

    try {
      const res = await fetch(`/api/file?path=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      openTabFromContent(filePath, data.content, data.meta, true, data.companions || {});
      highlightSidebar(filePath);
      refreshProgressUi();
    } catch (e) {
      setTerminal(`Error: ${e.message}`, true);
    }
  }

  function openTabFromContent(path, content, meta, activate = true, companions = {}, opts = {}) {
    const id = opts.scratchId
      ? `scratch:${opts.scratchId}`
      : tabIdForPath(path);
    const type = opts.scratchId
      ? "c"
      : fileType(path, meta?.ext?.replace(".", ""));
    const lang = langForType(type);
    const uri = monaco.Uri.parse(
      `file:///${(opts.scratchId ? "scratch/" + opts.scratchId + "/" : "") + path.replace(/\\/g, "/")}`
    );
    let model = monaco.editor.getModel(uri);
    if (!model) model = monaco.editor.createModel(content, lang, uri);
    else model.setValue(content);

    const tab = {
      id,
      path,
      type,
      name: fileName(path),
      model,
      meta: meta || {},
      companions,
      mdMode: type === "lesson" || type === "md" || type === "cheatsheet" ? "preview" : type === "quiz-md" ? "quiz" : null,
      isQuiz: type === "quiz-md" || /QUIZ\.md$/i.test(path),
      isLesson: type === "lesson" || /LESSON\.md$/i.test(path),
      isCheatsheet: type === "cheatsheet" || /CHEATSHEET\.md$/i.test(path),
      scratchId: opts.scratchId || null,
    };

    tabs.set(id, tab);
    renderTabBar();
    if (activate) activateTab(id);
    return tab;
  }

  function activateTab(id) {
    const tab = tabs.get(id);
    if (!tab) return;

    activeTabId = id;
    editor.setModel(tab.model);
    configureEditorForTab(tab);

    renderTabBar();
    updateToolbar(tab);
    updateFileMeta(tab);
    highlightSidebar(tab.path);

    applyMdLayout(tab);
    if (tab.type === "md" || tab.type === "lesson" || tab.type === "quiz-md" || tab.type === "cheatsheet") {
      schedulePreview(tab, true);
      if (tab.mdMode === "quiz") renderQuizInTab(tab);
    }

    resetStepMode();

    if (tab.scratchId && sidebarView === "scratch") {
      loadScratchHistory(tab.scratchId);
    }

    updateUrlState(tab, sidebarView);
    relayoutEditor();
    setTimeout(relayoutEditor, 120);
  }

  function configureEditorForTab(tab) {
    if (!editor || !tab) return;
    const isCode = tab.type === "c" || tab.type === "h";
    editor.updateOptions({
      wordWrap: isCode ? "off" : "on",
      minimap: { enabled: isCode, scale: 1, showSlider: "mouseover" },
      fontSize: isCode ? 14 : 13,
      scrollBeyondLastLine: false,
      padding: { top: isCode ? 16 : 12, bottom: isCode ? 16 : 12 },
    });
    const hint = $("#editor-pane-hint");
    if (hint) {
      hint.textContent = isCode
        ? "Monaco · C"
        : tab.isQuiz
          ? "Monaco · Quiz source"
          : tab.isLesson
            ? "Monaco · Lesson source"
            : tab.isCheatsheet
              ? "Monaco · Cheat sheet"
              : "Monaco · Markdown";
    }
  }

  function closeTab(id, e) {
    e?.stopPropagation();
    const tab = tabs.get(id);
    if (!tab) return;

    tab.model.dispose();
    tabs.delete(id);

    if (activeTabId === id) {
      const remaining = [...tabs.keys()];
      if (remaining.length) activateTab(remaining[remaining.length - 1]);
      else {
        activeTabId = null;
        renderTabBar();
        els.mdModeBtns.classList.add("hidden");
        els.companionBtns.classList.add("hidden");
        updateUrlState(null, sidebarView, true);
      }
    } else {
      renderTabBar();
    }
  }

  function renderTabBar() {
    els.tabBar.innerHTML = "";
    for (const [id, tab] of tabs) {
      const btn = document.createElement("button");
      btn.className = `editor-tab${id === activeTabId ? " active" : ""}`;
      btn.dataset.id = id;
      const icon = FILE_ICONS[tab.type] || FILE_ICONS[tab.type === "h" ? "h" : tab.type] || "·";
      btn.innerHTML = `
        <span class="editor-tab-icon ${tab.type}">${icon}</span>
        <span class="editor-tab-name">${escapeHtml(tab.name)}</span>
        <span class="editor-tab-close" title="Close">×</span>
      `;
      btn.addEventListener("click", (e) => {
        if (e.target.classList.contains("editor-tab-close")) closeTab(id, e);
        else activateTab(id);
      });
      els.tabBar.appendChild(btn);
    }
  }

  function updateToolbar(tab) {
    const isMd = tab.type === "md" || tab.type === "lesson" || tab.type === "quiz-md" || tab.type === "cheatsheet";
    const hasCompanions = tab.companions?.lesson || tab.companions?.quiz || tab.companions?.cheatsheet;
    els.mdModeBtns.classList.toggle("hidden", !isMd);
    els.companionBtns.classList.toggle("hidden", !hasCompanions);
    els.btnOpenLesson.classList.toggle("hidden", !tab.companions?.lesson);
    els.btnOpenQuiz.classList.toggle("hidden", !tab.companions?.quiz);
    if (els.btnOpenCheatsheet) els.btnOpenCheatsheet.classList.toggle("hidden", !tab.companions?.cheatsheet);
    els.btnQuizMode.classList.toggle("hidden", !tab.isQuiz);
    if (els.btnSaveScratch) els.btnSaveScratch.classList.toggle("hidden", !tab.scratchId);
    if (els.btnRenameScratch) els.btnRenameScratch.classList.toggle("hidden", !tab.scratchId);
    if (els.btnExportScratch) els.btnExportScratch.classList.toggle("hidden", !tab.scratchId);
    updateMarkDoneButton(tab);

    if (isMd) {
      $$(".mode-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.mdmode === tab.mdMode);
      });
    }

    els.btnOpenLesson.onclick = () => tab.companions?.lesson && openFile(tab.companions.lesson);
    els.btnOpenQuiz.onclick = () => tab.companions?.quiz && openFile(tab.companions.quiz);
    if (els.btnOpenCheatsheet) els.btnOpenCheatsheet.onclick = () => tab.companions?.cheatsheet && openFile(tab.companions.cheatsheet);

    const langLabel = tab.type === "c" ? "C" : tab.type === "h" ? "H" : tab.type === "lesson" ? "Lesson" : tab.isQuiz ? "Quiz" : tab.isCheatsheet ? "Cheat" : "MD";
    els.langBadge.textContent = langLabel;
    els.lineBadge.textContent = `${tab.meta.lines || tab.model.getLineCount()} lines`;
    els.statModule.textContent = tab.meta.module || "—";
  }

  let relayoutTimer = null;
  function relayoutEditor() {
    if (!editor || !els.editorHost) return;
    if (relayoutTimer) cancelAnimationFrame(relayoutTimer);
    relayoutTimer = requestAnimationFrame(() => {
      const rect = els.editorHost.parentElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        editor.layout({ width: Math.floor(rect.width), height: Math.floor(rect.height) });
      } else {
        editor.layout();
      }

      // Second pass for safety
      requestAnimationFrame(() => {
        const r2 = els.editorHost.parentElement.getBoundingClientRect();
        if (r2.width > 0 && r2.height > 0) {
          editor.layout({ width: Math.floor(r2.width), height: Math.floor(r2.height) });
        } else {
          editor.layout();
        }
      });
    });
  }

  function watchEditorResize() {
    if (!window.ResizeObserver || !els.workspace) return;
    const ro = new ResizeObserver(() => relayoutEditor());
    ro.observe(els.workspace);
    ro.observe(els.editorPane);
  }

  function setMdMode(mode) {
    const tab = getActiveTab();
    if (!tab || (tab.type !== "md" && tab.type !== "lesson" && tab.type !== "quiz-md" && tab.type !== "cheatsheet")) return;
    tab.mdMode = mode;
    $$(".mode-btn").forEach((b) => b.classList.toggle("active", b.dataset.mdmode === mode));
    applyMdLayout(tab);
    if (mode === "quiz" && tab.isQuiz) renderQuizInTab(tab);
    else if (mode !== "quiz") schedulePreview(tab, true);
    relayoutEditor();
  }

  function applyMdLayout(tab) {
    const isMd = tab.type === "md" || tab.type === "lesson" || tab.type === "quiz-md" || tab.type === "cheatsheet";
    const previewTitle = $("#preview-pane-title");

    if (!isMd) {
      els.workspace.classList.remove("mode-split", "mode-preview", "mode-edit", "mode-quiz");
      els.editorPane.classList.remove("pane-collapsed");
      els.previewPane.classList.add("pane-collapsed");
      if (previewTitle) previewTitle.textContent = "Preview";
      relayoutEditor();
      return;
    }

    els.workspace.classList.remove("mode-split", "mode-preview", "mode-edit", "mode-quiz");
    els.workspace.classList.add(`mode-${tab.mdMode}`);

    const mode = tab.mdMode;
    els.editorPane.classList.toggle("pane-collapsed", mode === "preview" || mode === "quiz");
    els.previewPane.classList.toggle("pane-collapsed", mode === "edit");

    els.mdPreview.classList.toggle("hidden", mode === "quiz");
    els.quizPreview.classList.toggle("hidden", mode !== "quiz");

    if (previewTitle) previewTitle.textContent = mode === "quiz" ? "Interactive Quiz" : "Preview";

    relayoutEditor();
  }

  function schedulePreview(tab, immediate = false) {
    clearTimeout(previewTimer);
    const run = () => {
      if (!tab || (tab.type !== "md" && tab.type !== "lesson" && tab.type !== "quiz-md" && tab.type !== "cheatsheet")) return;
      const src = tab.model.getValue();
      const body = src.split(/##\s+Answer\s+Key/i)[0] || src;
      if (typeof marked !== "undefined") {
        els.mdPreview.innerHTML = marked.parse(body);
      } else {
        els.mdPreview.textContent = body;
      }
      attachHeadingAnchors(tab);
      jumpToHashForTab(tab);
    };
    if (immediate) run();
    else previewTimer = setTimeout(run, 180);
  }

  function attachHeadingAnchors(tab) {
    const preview = els.mdPreview;
    if (!preview) return;
    const headings = preview.querySelectorAll("h1, h2, h3, h4, h5, h6");
    headings.forEach((heading) => {
      const text = heading.textContent || "";
      const id = heading.id || generateHeadingId(text);
      heading.id = id;
      heading.style.cursor = "pointer";
      heading.addEventListener("click", (event) => {
        event.preventDefault();
        const hash = `#${encodeURIComponent(id)}`;
        if (window.location.hash !== hash) {
          window.location.hash = hash;
        }
        updateUrlState(getActiveTab(), sidebarView, true);
      });
    });
  }

  function generateHeadingId(text) {
    return text
      .trim()
      .toLowerCase()
      .replace(/[\u00A0\s]+/g, "-")
      .replace(/[^a-z0-9\-\s]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function jumpToHashForTab(tab, useHash = false) {
    if (!tab || !window.location.hash) return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const targetId = decodeURIComponent(hash);
    const preview = els.mdPreview;
    const editorModel = tab.model;

    if (tab.mdMode === "preview" || tab.mdMode === "quiz") {
      const target = preview.querySelector(`#${CSS.escape(targetId)}`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    if (tab.mdMode === "edit" || tab.mdMode === "split") {
      const line = findLineForHash(editorModel, targetId);
      if (typeof line === "number") {
        editor.revealLineInCenter(line);
      }
    }

    if (useHash && window.location.hash && !tab.mdMode) {
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  function findLineForHash(model, hash) {
    if (!model) return null;
    const lines = model.getLinesContent();
    const normalized = hash.toLowerCase();
    for (let i = 0; i < lines.length; i += 1) {
      const text = lines[i].trim();
      const match = text.match(/^#+\s*(.+)$/);
      if (match) {
        const id = match[1].trim().toLowerCase().replace(/\s+/g, "-").replace(/[^ -]/g, "");
        if (id === normalized) return i + 1;
      }
    }
    return null;
  }

  function renderQuizInTab(tab) {
    const content = tab.model.getValue();
    els.quizPreview.innerHTML = "";
    const quizPath = tab?.path || null;
    PoolersQuiz.render(els.quizPreview, PoolersQuiz.parse(content), {
      path: quizPath,
      onScore: (correct, total) => {
        if (typeof PoolersProgress !== "undefined" && quizPath) {
          PoolersProgress.saveQuizScore(quizPath, correct, total);
          refreshProgressUi();
        }
      },
      fallbackHtml: typeof marked !== "undefined" ? marked.parse(content.split(/##\s+Answer\s+Key/i)[0] || content) : content,
    });
  }

  function updateFileMeta(tab) {
    els.fileMeta.innerHTML = "";
    const m = tab.meta || {};
    const pills = [
      m.module && `Module: ${m.module}`,
      m.exercise && `Exercise: ${m.exercise}`,
      m.bytes && formatBytes(m.bytes),
    ].filter(Boolean);

    for (const t of pills) {
      const span = document.createElement("span");
      span.className = "meta-pill";
      span.textContent = t;
      els.fileMeta.appendChild(span);
    }

    for (const [key, path] of Object.entries(tab.companions || {})) {
      const span = document.createElement("span");
      span.className = "meta-pill";
      const a = document.createElement("a");
      a.textContent = key;
      a.href = "#";
      a.addEventListener("click", (e) => { e.preventDefault(); openFile(path); });
      span.appendChild(a);
      els.fileMeta.appendChild(span);
    }
  }

  function highlightSidebar(filePath) {
    document.querySelectorAll(".tree-item, .cfile-row, .quiz-row").forEach((el) => {
      el.classList.toggle("active", el.dataset.path === filePath);
    });
  }

  function getEditorCode() {
    const tab = getActiveTab();
    if (!tab) return "";
    return tab.model.getValue();
  }

  /* ── Curriculum loading (unchanged logic) ── */

  async function loadCurriculum() {
    try {
      const res = await fetch("/api/curriculum");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      curriculum = Array.isArray(data) ? { tree: data, stats: {} } : data;
      renderTree(curriculum.tree || []);
      if (curriculum.stats?.byModule) renderFilterChips(curriculum.stats.byModule);
    } catch (e) {
      els.tree.innerHTML = `<p class="empty-state">Server offline. <kbd>cd web && npm start</kbd><br><small>${escapeHtml(e.message)}</small></p>`;
    }
  }

  async function loadCFiles() {
    try {
      const res = await fetch("/api/c-files");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      allCFiles = data.files || [];
      renderCFilesList(allCFiles);
      if (data.byModule && !curriculum.stats?.byModule) renderFilterChips(data.byModule);
    } catch (_) {
      els.cfilesList.innerHTML = `<p class="empty-state">Could not load C files.</p>`;
    }
  }

  async function loadQuizzes() {
    try {
      const res = await fetch("/api/quizzes");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      allQuizzes = data.quizzes || [];
      renderQuizzesList(allQuizzes);
    } catch (_) {
      els.quizzesList.innerHTML = `<p class="empty-state">Could not load quizzes.</p>`;
    }
  }

  function refreshStats() {
    els.statCfiles.textContent = allCFiles.length || curriculum.stats?.cFiles || "—";
    const totalLines = allCFiles.reduce((s, f) => s + (f.lines || 0), 0);
    els.statLines.textContent = totalLines > 0 ? totalLines.toLocaleString() : "—";
    refreshProgressUi();
  }

  function refreshProgressUi() {
    if (typeof PoolersProgress === "undefined") return;
    const s = PoolersProgress.stats();
    if (els.statDone) els.statDone.textContent = String(s.done);
    const tab = getActiveTab();
    updateMarkDoneButton(tab);
    document.querySelectorAll(".tree-item[data-path], .cfile-row[data-path], .quiz-row[data-path]").forEach((el) => {
      el.classList.toggle("done", PoolersProgress.isDone(el.dataset.path));
    });
  }

  function updateMarkDoneButton(tab) {
    const btn = $("#btn-mark-done");
    if (!btn) return;
    const path = tab && !tab.scratchId ? tab.path : null;
    btn.disabled = !path;
    const done = path && typeof PoolersProgress !== "undefined" && PoolersProgress.isDone(path);
    btn.classList.toggle("active", !!done);
    btn.textContent = done ? "✓ Done" : "Mark done";
  }

  function applyTheme(theme) {
    const t = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", t);
    const btn = $("#btn-theme");
    if (btn) btn.textContent = t === "light" ? "☾" : "☀";
    if (typeof monaco !== "undefined" && editor) {
      monaco.editor.setTheme(t === "light" ? "vs" : "atom-one-dark");
    }
    if (typeof PoolersProgress !== "undefined") PoolersProgress.setSettings({ theme: t });
  }

  function applyPersistedSettings() {
    if (typeof PoolersProgress === "undefined") return;
    const s = PoolersProgress.getSettings();
    applyTheme(s.theme || "dark");
    const root = $("#app-root");
    if (s.sidebarWidth) root?.style.setProperty("--sidebar", `${s.sidebarWidth}px`);
    if (s.bottomHeight) root?.style.setProperty("--bottom-h", `${s.bottomHeight}px`);
    if (s.panelCollapsed) root?.classList.add("panel-collapsed");
    setBottomTab(s.bottomTab || "steps", false);
  }

  function setBottomTab(name, persist = true) {
    const tab = ["steps", "memory", "terminal"].includes(name) ? name : "steps";
    if (els.bottomPanel) els.bottomPanel.dataset.activeTab = tab;
    $$(".bottom-tab").forEach((b) => {
      const on = b.dataset.btab === tab;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    if (persist && typeof PoolersProgress !== "undefined") {
      PoolersProgress.setSettings({ bottomTab: tab });
    }
  }

  /* ── Scratch files (temp C files with save history) ── */

  async function loadScratchList(activeId, filter = "") {
    try {
      const res = await fetch("/api/scratch");
      const data = await res.json();
      scratchFiles = data.files || [];
      renderScratchList(scratchFiles, activeId, filter);
    } catch (_) {
      els.scratchList.innerHTML = `<p class="empty-state">Could not load scratch files.</p>`;
    }
  }

  function renderScratchList(files, activeId, filter = "") {
    const q = filter.toLowerCase();
    let filtered = files;
    if (q) {
      filtered = filtered.filter((f) => f.name.toLowerCase().includes(q) || (f.path || "").toLowerCase().includes(q));
    }
    els.scratchList.innerHTML = "";
    if (!filtered.length) {
      els.scratchList.innerHTML = `<p class="empty-state">No scratch files match.</p>`;
      return;
    }
    for (const f of files) {
      const row = document.createElement("div");
      row.className = `scratch-row${activeId === f.id ? " active" : ""}`;
      row.dataset.id = f.id;
      row.innerHTML = `
        <span class="file-type-icon c">●</span>
        <span class="scratch-name">${escapeHtml(f.name)}</span>
        <span class="scratch-meta">v${f.versionCount}</span>
        <button class="scratch-del" title="Delete scratch file" aria-label="Delete">✕</button>
      `;
      row.addEventListener("click", (e) => {
        if (e.target.classList.contains("scratch-del")) {
          deleteScratch(f.id);
        } else {
          openScratch(f.id);
        }
      });
      els.scratchList.appendChild(row);
    }
  }

  async function renameScratch() {
    const tab = getActiveTab();
    if (!tab?.scratchId) return;
    const next = prompt("Rename scratch file:", tab.name || "scratch.c");
    if (!next || !next.trim()) return;
    try {
      const res = await fetch(`/api/scratch/${tab.scratchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: next.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      tab.name = data.name;
      tab.path = data.name;
      renderTabBar();
      updateToolbar(tab);
      loadScratchList(tab.scratchId);
      setTerminal(`Renamed to ${data.name}`, false);
    } catch (e) {
      setTerminal(`Rename failed: ${e.message}`, true);
    }
  }

  async function exportScratch() {
    const tab = getActiveTab();
    if (!tab?.scratchId) return;
    try {
      const res = await fetch(`/api/scratch/${tab.scratchId}/export`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${(data.name || "scratch").replace(/\.c$/i, "")}-export.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      setTerminal(`Exported ${data.name} (${(data.versions || []).length} versions).`, false);
    } catch (e) {
      setTerminal(`Export failed: ${e.message}`, true);
    }
  }

  async function runNorme() {
    const tab = getActiveTab();
    if (!tab || (tab.type !== "c" && tab.type !== "h")) {
      setTerminal("Open a .c file to run norme.", true);
      return;
    }
    setTerminal("$ norminette check.c\nChecking…", false);
    try {
      const res = await fetch("/api/norme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: getEditorCode(), path: tab.scratchId ? null : tab.path }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setTerminal(data.output || (data.ok ? "OK!" : "Norme finished."), !data.ok);
      els.exitBadge.textContent = !data.available ? "no norme" : data.ok ? "norme OK" : "norme fail";
      els.exitBadge.className = !data.available ? "pill" : data.ok ? "pill pill-success" : "pill pill-error";
      setBottomTab("terminal");
    } catch (e) {
      setTerminal(`Norme error: ${e.message}`, true);
    }
  }

  async function createScratch() {
    try {
      const res = await fetch("/api/scratch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "scratch.c" }),
      });
      const data = await res.json();
      openScratchFromData(data);
      await loadScratchList(data.id);
      loadScratchHistory(data.id);
    } catch (e) {
      setTerminal(`Could not create scratch file: ${e.message}`, true);
    }
  }

  function openScratchFromData(data) {
    closeSidebarIfMobile();
    openTabFromContent(
      data.name,
      data.content,
      { ext: "c", module: "Scratch", exercise: data.name, lines: data.content.split("\n").length, bytes: data.content.length },
      true,
      {},
      { scratchId: data.id }
    );
  }

  async function openScratch(id) {
    const existing = tabs.get(`scratch:${id}`);
    if (existing) { activateTab(existing.id); loadScratchHistory(id); return; }
    try {
      const res = await fetch(`/api/scratch/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      openScratchFromData(data);
      loadScratchHistory(id);
      renderScratchList((await (await fetch("/api/scratch")).json()).files || [], id);
    } catch (e) {
      setTerminal(`Could not open scratch file: ${e.message}`, true);
    }
  }

  async function saveScratch() {
    const tab = getActiveTab();
    if (!tab || !tab.scratchId) return;
    try {
      const res = await fetch(`/api/scratch/${tab.scratchId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: tab.model.getValue(), name: tab.name }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTerminal(`Saved ${tab.name} — version ${data.version} (${data.versionCount} total).`, false);
      loadScratchHistory(tab.scratchId);
      loadScratchList(tab.scratchId);
    } catch (e) {
      setTerminal(`Save failed: ${e.message}`, true);
    }
  }

  async function loadScratchHistory(id) {
    if (!id) { els.scratchHistory.innerHTML = ""; return; }
    try {
      const res = await fetch(`/api/scratch/${id}/history`);
      const data = await res.json();
      els.scratchHistory.innerHTML = "";
      if (!data.versions?.length) {
        els.scratchHistory.innerHTML = `<p class="empty-state">No saves yet.</p>`;
        return;
      }
      for (const v of data.versions) {
        const row = document.createElement("button");
        row.className = "scratch-ver-row";
        row.innerHTML = `
          <span class="scratch-ver-num">v${v.version}</span>
          <span class="scratch-ver-time">${formatTime(v.savedAt)}</span>
          <span class="scratch-ver-bytes">${v.bytes} B</span>
        `;
        row.addEventListener("click", () => openScratchVersion(id, v.version));
        els.scratchHistory.appendChild(row);
      }
    } catch (_) {
      els.scratchHistory.innerHTML = `<p class="empty-state">Could not load history.</p>`;
    }
  }

  async function openScratchVersion(id, version) {
    try {
      const res = await fetch(`/api/scratch/${id}/version/${version}`);
      const data = await res.json();
      const tab = tabs.get(`scratch:${id}`) || getActiveTab();
      if (tab && tab.scratchId === id) {
        tab.model.setValue(data.content);
        setTerminal(`Loaded version ${version} into editor. Save to keep it as a new version.`, false);
      } else {
        openScratchFromData({ id, name: `scratch-v${version}.c`, content: data.content });
      }
    } catch (e) {
      setTerminal(`Could not load version: ${e.message}`, true);
    }
  }

  async function deleteScratch(id) {
    try {
      await fetch(`/api/scratch/${id}`, { method: "DELETE" });
      const tabId = `scratch:${id}`;
      if (tabs.has(tabId)) closeTab(tabId);
      els.scratchHistory.innerHTML = "";
      loadScratchList();
    } catch (_) { }
  }

  function formatTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  function renderFilterChips(byModule) {
    els.filterChips.innerHTML = "";
    els.filterChips.appendChild(chip("all", "All", true));
    for (const mod of Object.keys(byModule).sort()) {
      els.filterChips.appendChild(chip(mod, `${mod} (${byModule[mod]})`));
    }
  }

  function chip(mod, label, active = false) {
    const b = document.createElement("button");
    b.className = `chip${active ? " active" : ""}`;
    b.textContent = label;
    b.dataset.module = mod;
    b.addEventListener("click", () => {
      activeModuleFilter = mod;
      $$(".chip").forEach((c) => c.classList.toggle("active", c.dataset.module === mod));
      const q = els.search.value;
      if (sidebarView === "cfiles") renderCFilesList(allCFiles, q);
      else if (sidebarView === "quizzes") renderQuizzesList(allQuizzes, q);
      else renderTree(curriculum.tree || [], q);
    });
    return b;
  }

  function renderTree(tree, filter = "") {
    els.tree.innerHTML = "";
    const q = filter.toLowerCase();
    const activePath = getActiveTab()?.path;
    for (const mod of tree) {
      if (activeModuleFilter !== "all" && mod.name !== activeModuleFilter) continue;
      if (q && !mod.name.toLowerCase().includes(q) && !JSON.stringify(mod).toLowerCase().includes(q)) continue;
      const details = document.createElement("details");
      details.className = "tree-module";
      details.open = true;
      const cCount = countCInTree(mod);
      details.innerHTML = `<summary><span>${mod.name}</span>${cCount ? `<span class="module-badge">${cCount} .c</span>` : ""}</summary>`;
      appendChildren(details, mod.children || [], q, activePath);
      els.tree.appendChild(details);
    }
  }

  function countCInTree(node) {
    if (node.ext === "c") return 1;
    return (node.children || []).reduce((n, c) => n + countCInTree(c), 0);
  }

  function appendChildren(parent, children, q, activePath) {
    for (const item of children) {
      if (item.type === "dir") {
        if (q && !item.name.toLowerCase().includes(q) && !JSON.stringify(item).toLowerCase().includes(q)) continue;
        const sub = document.createElement("details");
        sub.className = "tree-module";
        sub.open = q.length > 0 || item.name.startsWith("ex") || item.name === "libft";
        sub.innerHTML = `<summary>${item.name}</summary>`;
        appendChildren(sub, item.children || [], q, activePath);
        parent.appendChild(sub);
      } else {
        if (q && !item.path.toLowerCase().includes(q) && !item.name.toLowerCase().includes(q)) continue;
        if (activeModuleFilter !== "all" && item.module !== activeModuleFilter) continue;
        parent.appendChild(treeFileButton(item, activePath));
      }
    }
  }

  function treeFileIcon(item) {
    if (/LESSON\.md$/i.test(item.name)) return { cls: "lesson", icon: "📖" };
    if (/QUIZ\.md$/i.test(item.name)) return { cls: "quiz-md", icon: "✓" };
    if (/CHEATSHEET\.md$/i.test(item.name)) return { cls: "cheatsheet", icon: "⚡" };
    return { cls: item.ext || "file", icon: FILE_ICONS[item.ext] || "·" };
  }

  function treeFileButton(item, activePath) {
    const btn = document.createElement("button");
    const done = typeof PoolersProgress !== "undefined" && PoolersProgress.isDone(item.path);
    btn.className = `tree-item${activePath === item.path ? " active" : ""}${done ? " done" : ""}`;
    const { cls, icon } = treeFileIcon(item);
    btn.innerHTML = `
      <span class="file-type-icon ${cls}">${icon}</span>
      <span>${item.name}</span>
      ${item.lines ? `<span class="tree-item-meta">${item.lines}L</span>` : ""}
    `;
    btn.dataset.path = item.path;
    btn.addEventListener("click", () => openFile(item.path));
    return btn;
  }

  function renderCFilesList(files, filter = "") {
    const q = filter.toLowerCase();
    els.cfilesList.innerHTML = "";
    let filtered = files;
    if (activeModuleFilter !== "all") filtered = filtered.filter((f) => f.module === activeModuleFilter);
    if (q) filtered = filtered.filter((f) => f.path.toLowerCase().includes(q));
    const activePath = getActiveTab()?.path;

    if (!filtered.length) {
      els.cfilesList.innerHTML = `<p class="empty-state">No C files match.</p>`;
      return;
    }

    const grouped = {};
    for (const f of filtered) {
      (grouped[f.module] ||= []).push(f);
    }

    for (const mod of Object.keys(grouped).sort()) {
      const group = document.createElement("div");
      group.className = "cfile-group";
      group.innerHTML = `<div class="cfile-group-title">${mod} · ${grouped[mod].length} files</div>`;
      for (const f of grouped[mod]) {
        const row = document.createElement("button");
        const done = typeof PoolersProgress !== "undefined" && PoolersProgress.isDone(f.path);
        row.className = `cfile-row${activePath === f.path ? " active" : ""}${done ? " done" : ""}`;
        row.dataset.path = f.path;
        row.innerHTML = `
          <span class="file-type-icon c">●</span>
          <span class="cfile-path">${f.exercise}/${f.name}</span>
          <span class="cfile-details"><span>${f.lines}L</span><span>${formatBytes(f.bytes)}</span></span>
        `;
        row.addEventListener("click", () => openFile(f.path));
        group.appendChild(row);
      }
      els.cfilesList.appendChild(group);
    }
  }

  function renderQuizzesList(quizzes, filter = "") {
    const q = filter.toLowerCase();
    els.quizzesList.innerHTML = "";
    let filtered = quizzes;
    if (activeModuleFilter !== "all") filtered = filtered.filter((x) => x.module === activeModuleFilter);
    if (q) filtered = filtered.filter((x) => x.path.toLowerCase().includes(q) || (x.title || "").toLowerCase().includes(q));
    const activePath = getActiveTab()?.path;

    if (!filtered.length) {
      els.quizzesList.innerHTML = `<p class="empty-state">No quizzes match.</p>`;
      return;
    }

    const grouped = {};
    for (const item of filtered) {
      (grouped[item.module] ||= []).push(item);
    }

    for (const mod of Object.keys(grouped).sort()) {
      const g = document.createElement("div");
      g.className = "cfile-group";
      g.innerHTML = `<div class="cfile-group-title">${mod} · ${grouped[mod].length} quizzes</div>`;
      for (const item of grouped[mod]) {
        const row = document.createElement("button");
        const done = typeof PoolersProgress !== "undefined" && PoolersProgress.isDone(item.path);
        const score = typeof PoolersProgress !== "undefined" ? PoolersProgress.getQuizScore(item.path) : null;
        row.className = `quiz-row${activePath === item.path ? " active" : ""}${done ? " done" : ""}`;
        row.dataset.path = item.path;
        row.innerHTML = `
          <span class="quiz-row-title">${escapeHtml(item.title || item.exercise)}</span>
          <span class="quiz-row-path">${item.exercise}/QUIZ.md${score ? ` · ${score.correct}/${score.total}` : ""}</span>
        `;
        row.addEventListener("click", () => openFile(item.path));
        g.appendChild(row);
      }
      els.quizzesList.appendChild(g);
    }
  }

  function formatBytes(n) {
    if (!n) return "";
    return n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`;
  }

  /* ── Events ── */

  function bindEvents() {
    window.addEventListener("popstate", () => applyUrlStateFromLocation(true));
    window.addEventListener("hashchange", () => jumpToHashForTab(getActiveTab()));
    $("#btn-run").addEventListener("click", runCode);
    $("#btn-step").addEventListener("click", startStepMode);
    $("#btn-auto").addEventListener("click", toggleAutoStep);
    $("#btn-close-steps").addEventListener("click", closeStepMode);
    $("#btn-reset").addEventListener("click", resetAll);
    $("#btn-next").addEventListener("click", () => goStep(1));
    $("#btn-prev").addEventListener("click", () => goStep(-1));
    $("#btn-theme")?.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") || "dark";
      applyTheme(cur === "light" ? "dark" : "light");
    });
    $("#btn-norme")?.addEventListener("click", runNorme);
    $("#btn-mark-done")?.addEventListener("click", () => {
      const tab = getActiveTab();
      if (!tab || tab.scratchId || typeof PoolersProgress === "undefined") return;
      PoolersProgress.toggleDone(tab.path);
      refreshProgressUi();
      if (sidebarView === "quizzes") renderQuizzesList(allQuizzes, els.search.value);
      else if (sidebarView === "cfiles") renderCFilesList(allCFiles, els.search.value);
      else renderTree(curriculum.tree || [], els.search.value);
    });
    $$(".bottom-tab").forEach((btn) => {
      btn.addEventListener("click", () => setBottomTab(btn.dataset.btab));
    });

    $$(".sidebar-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        setSidebarView(tab.dataset.view);
        updateUrlState(getActiveTab(), sidebarView);
      });
    });

    els.btnNewScratch?.addEventListener("click", createScratch);
    els.btnSaveScratch?.addEventListener("click", saveScratch);
    els.btnRenameScratch?.addEventListener("click", renameScratch);
    els.btnExportScratch?.addEventListener("click", exportScratch);

    // Mobile sidebar drawer
    $("#btn-sidebar-toggle")?.addEventListener("click", toggleSidebar);
    $("#sidebar-overlay")?.addEventListener("click", () => setSidebar(false));

    $$(".mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => setMdMode(btn.dataset.mdmode));
    });

    $("#btn-toggle-panel")?.addEventListener("click", () => {
      const root = $("#app-root");
      root.classList.toggle("panel-collapsed");
      if (typeof PoolersProgress !== "undefined") {
        PoolersProgress.setSettings({ panelCollapsed: root.classList.contains("panel-collapsed") });
      }
      setTimeout(() => relayoutEditor(), 220);
    });

    els.search.addEventListener("input", (e) => {
      const q = e.target.value;
      if (sidebarView === "scratch") {
        renderScratchList(scratchFiles, getActiveTab()?.scratchId, q);
      } else if (sidebarView === "quizzes") {
        renderQuizzesList(allQuizzes, q);
      } else if (sidebarView === "cfiles") {
        renderCFilesList(allCFiles, q);
      } else {
        renderTree(curriculum.tree || [], q);
      }
    });

    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        runCode();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        const tab = getActiveTab();
        if (tab?.scratchId) saveScratch();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ".") { e.preventDefault(); startStepMode(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "w") {
        e.preventDefault();
        if (activeTabId) closeTab(activeTabId);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Tab") {
        e.preventDefault();
        cycleTab(e.shiftKey ? -1 : 1);
      }
    });

    window.addEventListener("resize", () => relayoutEditor());
  }

  function setSidebar(open) {
    const root = $("#app-root");
    const overlay = $("#sidebar-overlay");
    const isMobile = window.matchMedia("(max-width: 900px)").matches;
    root?.classList.toggle("sidebar-open", open);
    root?.classList.toggle("sidebar-closed", !open);
    if (isMobile) {
      overlay?.classList.toggle("show", open);
    } else {
      overlay?.classList.remove("show");
    }
  }
  function toggleSidebar() {
    setSidebar(!$("#app-root")?.classList.contains("sidebar-open"));
  }
  function closeSidebarIfMobile() {
    if (window.matchMedia("(max-width: 900px)").matches) setSidebar(false);
  }

  function cycleTab(dir) {
    const ids = [...tabs.keys()];
    if (ids.length < 2) return;
    const idx = ids.indexOf(activeTabId);
    const next = (idx + dir + ids.length) % ids.length;
    activateTab(ids[next]);
  }

  function initWorkspaceSplitResize() {
    const handle = $("#workspace-split-resize");
    if (!handle || !els.workspace) return;
    let dragging = false;

    handle.addEventListener("mousedown", (e) => {
      if (!els.workspace.classList.contains("mode-split")) return;
      dragging = true;
      handle.classList.add("dragging");
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      e.preventDefault();
    });

    document.addEventListener("mouseup", () => {
      if (!dragging) return;
      dragging = false;
      handle.classList.remove("dragging");
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      relayoutEditor();
    });

    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const rect = els.workspace.getBoundingClientRect();
      const pct = Math.max(22, Math.min(78, ((e.clientX - rect.left) / rect.width) * 100));
      els.workspace.style.setProperty("--split-editor", `${pct}%`);
      els.workspace.style.setProperty("--split-preview", `${100 - pct}%`);
      relayoutEditor();
    });
  }

  function initResize() {
    const root = $("#app-root");
    let dragSide = false, dragBottom = false;

    $("#sidebar-resize")?.addEventListener("mousedown", (e) => { dragSide = true; e.preventDefault(); });
    $("#bottom-resize")?.addEventListener("mousedown", (e) => { dragBottom = true; e.preventDefault(); });

    document.addEventListener("mousemove", (e) => {
      if (dragSide) {
        root.style.setProperty("--sidebar", `${Math.max(220, Math.min(520, e.clientX))}px`);
        relayoutEditor();
      }
      if (dragBottom) {
        root.style.setProperty("--bottom-h", `${Math.max(120, Math.min(window.innerHeight * 0.7, window.innerHeight - e.clientY))}px`);
        relayoutEditor();
      }
    });
    document.addEventListener("mouseup", () => {
      if ((dragSide || dragBottom) && typeof PoolersProgress !== "undefined") {
        const side = parseInt(getComputedStyle(root).getPropertyValue("--sidebar"), 10);
        const bottom = parseInt(getComputedStyle(root).getPropertyValue("--bottom-h"), 10);
        const patch = {};
        if (dragSide && side) patch.sidebarWidth = side;
        if (dragBottom && bottom) patch.bottomHeight = bottom;
        if (Object.keys(patch).length) PoolersProgress.setSettings(patch);
      }
      dragSide = false;
      dragBottom = false;
    });
  }

  /* ── Run / Step (use active tab) ── */

  async function runCode() {
    const tab = getActiveTab();
    if (!tab || (tab.type !== "c" && tab.type !== "h")) {
      setTerminal("Open a .c file tab to compile and run.", true);
      return;
    }

    const code = getEditorCode();
    if (els.stepsModeHint) els.stepsModeHint.textContent = "· run (gcc)";
    setTerminal("$ gcc -Wall -Wextra -Werror -o program main.c\nCompiling…", false);
    els.explanation.innerHTML = "";
    els.exitBadge.className = "pill pill-hidden";
    setBottomTab("terminal");

    const btn = $("#btn-run");
    btn.disabled = true;
    btn.classList.add("loading");

    try {
      const res = await fetch("/api/compile-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, path: tab.scratchId ? null : tab.path }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const data = await res.json();

      renderRunSteps(data.steps || []);
      renderTerminal(data);

      if (!data.success && data.compileError) {
        setTerminal(data.compileError, true);
        els.exitBadge.textContent = "Compile failed";
        els.exitBadge.className = "pill pill-error";
      }

      const explain = (data.explanation || []).map((p) =>
        typeof p === "string" ? { type: "error", text: p } : p
      );
      renderExplanation(explain, data);

      if (data.exitCode !== undefined) {
        els.exitBadge.textContent = `exit ${data.exitCode}`;
        els.exitBadge.className = data.exitCode === 0 ? "pill pill-success" : "pill pill-error";
      }
    } catch (e) {
      setTerminal(`Server error: ${e.message}`, true);
    } finally {
      btn.disabled = false;
      btn.classList.remove("loading");
    }
  }

  function renderRunSteps(steps) {
    els.steps.innerHTML = "";
    steps.forEach((s, i) => {
      const card = document.createElement("div");
      card.className = `step-card phase-${s.phase} done`;
      card.innerHTML = `
        <div class="step-title">${i + 1}. ${escapeHtml(s.title)}</div>
        <div class="step-line">${escapeHtml(s.command || "")}</div>
        <div class="step-explain">${escapeHtml(s.explanation || "")}</div>
        ${s.stderr ? `<div class="step-explain" style="color:var(--red)">${escapeHtml(s.stderr.slice(0, 500))}</div>` : ""}
      `;
      els.steps.appendChild(card);
    });
  }

  function renderTerminal(data) {
    let out = "";
    if (data.steps?.[0]) {
      out += `$ ${data.steps[0].command}\n`;
      out += data.steps[0].stderr || (data.steps[0].success ? "✓ compile OK\n" : "");
    }
    if (data.steps?.[1]) {
      out += `\n$ ${data.steps[1].command}\n`;
      out += (data.stdout || "").replace(/\r\n/g, "\n") || "(no output)";
    }
    setTerminal(out || data.compileError || "(empty)", !data.success);
  }

  function renderExplanation(points, data) {
    els.explanation.innerHTML = "";
    const items = [...(points || [])];
    if (data?.stdout) items.unshift({ type: "output", text: `Visual: ${visualizeOutput(data.stdout.replace(/\r\n/g, "\n"))}` });
    for (const p of items) {
      const li = document.createElement("li");
      li.className = `type-${p.type || "info"}`;
      li.textContent = p.text;
      els.explanation.appendChild(li);
    }
  }

  function visualizeOutput(s) {
    return s.split("").map((ch) => {
      if (ch === "\n") return "↵";
      if (ch === "\t") return "→";
      if (ch.charCodeAt(0) < 32) return "·";
      return ch;
    }).join("");
  }

  function setTerminal(text, isError) {
    els.terminal.textContent = text;
    els.terminal.style.color = isError ? "var(--red)" : "var(--green)";
  }

  function clearStepHighlight() {
    if (editor && stepDecorationIds.length) {
      stepDecorationIds = editor.deltaDecorations(stepDecorationIds, []);
    }
  }

  function stopAutoStep() {
    autoStepRunning = false;
    if (autoStepTimer) {
      clearTimeout(autoStepTimer);
      autoStepTimer = null;
    }
    const btnAuto = $("#btn-auto");
    if (btnAuto) {
      btnAuto.textContent = "▶ Auto";
      btnAuto.classList.remove("active");
    }
  }

  function closeStepMode() {
    stopAutoStep();
    clearStepHighlight();
    traceSteps = [];
    stepIndex = 0;
    els.stepCounter.textContent = "";
    els.stepCounter.className = "pill";
    $("#btn-prev").disabled = true;
    $("#btn-next").disabled = true;
    els.steps.innerHTML = `<p class="empty-state">Press <kbd>Step</kbd> to trace from <code>int main</code>, or <kbd>Run</kbd> (Ctrl+Enter).</p>`;
    els.memory.textContent = "Stack appears here in Step mode.";
  }

  function finishStepWalkthrough() {
    stopAutoStep();
    clearStepHighlight();
    els.stepCounter.textContent = "Done ✓";
    els.stepCounter.className = "pill pill-success";
    els.steps.querySelectorAll(".step-card.active").forEach((c) => {
      c.classList.remove("active");
      c.classList.add("done");
    });
  }

  function toggleAutoStep() {
    if (autoStepRunning) {
      stopAutoStep();
      return;
    }
    const tab = getActiveTab();
    if (!tab || tab.type !== "c") {
      setTerminal("Auto step works on C code tabs.", true);
      return;
    }
    if (!traceSteps.length) startStepMode();
    if (!traceSteps.length) return;
    autoStepRunning = true;
    const btnAuto = $("#btn-auto");
    btnAuto.textContent = "⏸ Pause";
    btnAuto.classList.add("active");
    runAutoStepLoop();
  }

  function runAutoStepLoop() {
    if (!autoStepRunning) return;
    showStep(stepIndex);
    if (stepIndex >= traceSteps.length - 1) {
      autoStepTimer = setTimeout(finishStepWalkthrough, AUTO_STEP_MS);
      return;
    }
    autoStepTimer = setTimeout(() => {
      if (!autoStepRunning) return;
      stepIndex += 1;
      runAutoStepLoop();
    }, AUTO_STEP_MS);
  }

  function startStepMode() {
    stopAutoStep();
    const tab = getActiveTab();
    if (!tab || tab.type !== "c") {
      setTerminal("Step mode works on C code tabs.", true);
      return;
    }
    if (els.stepsModeHint) els.stepsModeHint.textContent = "· sim";
    setBottomTab("steps");
    traceSteps = PoolersTracer.buildSteps(getEditorCode());
    stepIndex = 0;
    els.stepCounter.className = "pill";
    $("#btn-next").disabled = traceSteps.length <= 1;
    $("#btn-prev").disabled = true;
    showStep(0);
  }

  function goStep(delta) {
    stopAutoStep();
    const atEnd = stepIndex >= traceSteps.length - 1;
    if (delta > 0 && atEnd) {
      finishStepWalkthrough();
      return;
    }
    stepIndex = Math.max(0, Math.min(traceSteps.length - 1, stepIndex + delta));
    showStep(stepIndex);
    if (delta > 0 && stepIndex >= traceSteps.length - 1) {
      finishStepWalkthrough();
    }
  }

  function showStep(idx) {
    const step = traceSteps[idx];
    if (!step) return;

    els.stepCounter.textContent = `${idx + 1} / ${traceSteps.length}`;
    els.stepCounter.className = "pill";
    $("#btn-prev").disabled = idx === 0;
    $("#btn-next").disabled = idx >= traceSteps.length - 1;

    if (step.line && editor) {
      editor.revealLineInCenter(Math.max(1, step.line));
      stepDecorationIds = editor.deltaDecorations(stepDecorationIds, [{
        range: new monaco.Range(Math.max(1, step.line), 1, Math.max(1, step.line), 200),
        options: { isWholeLine: true, className: "step-highlight" },
      }]);
    } else {
      clearStepHighlight();
    }

    els.steps.innerHTML = "";
    traceSteps.forEach((s, i) => {
      const card = document.createElement("div");
      const phase = s.phase || "exec";
      card.className = `step-card phase-${phase}${i === idx ? " active" : i < idx ? " done" : " pending"}`;
      if (s.depth) card.dataset.depth = String(Math.min(4, s.depth));
      card.innerHTML = `
        <div class="step-title">${i + 1}. ${escapeHtml(s.title)}</div>
        ${s.code ? `<div class="step-line">${s.line ? `L${s.line}: ` : ""}${escapeHtml(s.code)}</div>` : ""}
        <div class="step-explain">${escapeHtml(s.explain || s.explanation || "")}</div>
      `;
      card.addEventListener("click", () => {
        stopAutoStep();
        stepIndex = i;
        showStep(i);
        if (i >= traceSteps.length - 1) finishStepWalkthrough();
      });
      els.steps.appendChild(card);
    });

    requestAnimationFrame(() => {
      els.steps.querySelector(".step-card.active")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });

    els.memory.textContent = step.memory || "—";
    if (step.output !== undefined) {
      setTerminal(step.output ? `Output:\n"${visualizeOutput(step.output)}"` : "(no output yet)", false);
    }
  }

  function resetStepMode() {
    stopAutoStep();
    clearStepHighlight();
    traceSteps = [];
    stepIndex = 0;
    els.stepCounter.textContent = "";
    els.stepCounter.className = "pill";
    $("#btn-next").disabled = true;
    $("#btn-prev").disabled = true;
  }

  function resetAll() {
    closeStepMode();
    els.steps.innerHTML = `<p class="empty-state">Press <kbd>Step</kbd> to trace from <code>int main</code>, or <kbd>Run</kbd>.</p>`;
    els.memory.textContent = "Stack appears here in Step mode.";
    els.terminal.textContent = "";
    els.explanation.innerHTML = "";
    els.exitBadge.className = "pill pill-hidden";
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }
})();
