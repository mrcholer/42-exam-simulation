/**
 * Poolers Playground — API server
 * Compiles & runs C code with gcc, serves curriculum files.
 */

const express = require("express");
const fs = require("fs");
const path = require("path");
const { execFile, spawn } = require("child_process");
const { v4: uuidv4 } = require("uuid");

const ROOT = path.join(__dirname, "..");
const WEB = __dirname;
const TEMP = path.join(WEB, ".tmp");
const SCRATCH = path.join(WEB, ".scratch");
const PORT = process.env.PORT || 3847;

/* Compile sandbox limits (local learning tool — not a public multi-tenant sandbox) */
const MAX_CODE_BYTES = 200 * 1024; // 200 KB per file
const MAX_PROJECT_FILES = 24;
const MAX_STDIN_BYTES = 64 * 1024;
const MAX_ARGS = 16;
const MAX_ARG_LEN = 256;
const COMPILE_TIMEOUT_MS = 12000;
const RUN_TIMEOUT_MS = 4000;
const MAX_OUTPUT_BYTES = 256 * 1024;
const TEMP_MAX_AGE_MS = 15 * 60 * 1000;

const MODULE_ORDER = [
  "Theory",
  "Shell00",
  "Shell01",
  "C00",
  "C01",
  "C02",
  "C03",
  "C04",
  "C05",
  "C06",
  "C07",
  "C08",
  "C09",
  "C10",
  "C11",
  "C12",
  "C13",
  "Rush",
  "Exam",
];

const app = express();
app.use(express.json({ limit: "2mb" }));

// Dedicated examshell page (42-style)
app.get(["/exam", "/exam/"], (_req, res) => {
  res.sendFile(path.join(WEB, "public", "exam.html"));
});

app.use(express.static(path.join(WEB, "public")));

if (!fs.existsSync(TEMP)) fs.mkdirSync(TEMP, { recursive: true });
if (!fs.existsSync(SCRATCH)) fs.mkdirSync(SCRATCH, { recursive: true });

function safePath(relative) {
  if (!relative || typeof relative !== "string") return null;
  const normalized = path.normalize(relative).replace(/^(\.\.(\/|\\|$))+/, "");
  const full = path.resolve(ROOT, normalized);
  const rootResolved = path.resolve(ROOT);
  // Windows: case-insensitive root check
  if (process.platform === "win32") {
    if (!full.toLowerCase().startsWith(rootResolved.toLowerCase())) return null;
  } else if (!full.startsWith(rootResolved)) {
    return null;
  }
  return full;
}

function runCommand(cmd, args, cwd, timeoutMs = 8000) {
  return new Promise((resolve) => {
    execFile(cmd, args, { cwd, timeout: timeoutMs, maxBuffer: 1024 * 512 }, (err, stdout, stderr) => {
      resolve({
        stdout: stdout || "",
        stderr: stderr || "",
        exitCode: err ? (err.code === null ? 1 : err.code) : 0,
        signal: err && err.signal ? err.signal : null,
        error: err && err.killed ? "timeout" : null,
      });
    });
  });
}

function fileMeta(fullPath, relPath) {
  const stat = fs.statSync(fullPath);
  const ext = path.extname(fullPath).toLowerCase();
  const parts = relPath.split(/[/\\]/);
  const module = parts[0] || "";
  const exercise = parts.length > 2 ? parts[1] : parts[parts.length - 2] || "";
  let lines = 0;
  if (stat.isFile() && stat.size < 512000) {
    lines = fs.readFileSync(fullPath, "utf8").split("\n").length;
  }
  return {
    path: relPath.replace(/\\/g, "/"),
    name: path.basename(fullPath),
    ext: ext.slice(1) || "file",
    module,
    exercise,
    lines,
    bytes: stat.size,
    modified: stat.mtime.toISOString(),
  };
}

function listDir(dir, prefix = "") {
  const items = [];
  if (!fs.existsSync(dir)) return items;
  const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name, undefined, { numeric: true });
  });
  for (const name of entries) {
    if (name.name.startsWith(".")) continue;
    const rel = prefix ? `${prefix}/${name.name}` : name.name;
    const full = path.join(dir, name.name);
    if (name.isDirectory()) {
      items.push({ type: "dir", name: name.name, path: rel.replace(/\\/g, "/"), children: listDir(full, rel) });
    } else if (/\.(c|h|sh)$/i.test(name.name) || name.name === "Makefile" || name.name === "LESSON.md" || name.name === "QUIZ.md" || name.name === "CHEATSHEET.md") {
      const meta = fileMeta(full, rel);
      items.push({ type: "file", ...meta });
    }
  }
  return items;
}

function collectAllCFiles() {
  const files = [];
  function walk(dir, prefix) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "web") continue;
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, rel);
      else if (/\.c$/i.test(entry.name)) files.push(fileMeta(full, rel));
    }
  }
  for (const mod of MODULE_ORDER) {
    const modPath = path.join(ROOT, mod);
    walk(modPath, mod);
  }
  return files.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }));
}

function countByModule(files) {
  const counts = {};
  for (const f of files) {
    counts[f.module] = (counts[f.module] || 0) + 1;
  }
  return counts;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, root: ROOT, platform: process.platform, node: process.version });
});

app.get("/api/system", (_req, res) => {
  let gcc = null;
  let gccOk = false;
  try {
    gcc = require("child_process").execFileSync("gcc", ["--version"], { encoding: "utf8" }).split("\n")[0];
    gccOk = true;
  } catch (_) {
    gcc = "not found";
  }
  const cFiles = collectAllCFiles();
  res.json({
    ok: true,
    root: ROOT,
    platform: process.platform,
    node: process.version,
    gcc: gccOk ? gcc : null,
    gccOk,
    port: PORT,
    stats: {
      cFiles: cFiles.length,
      totalLines: cFiles.reduce((s, f) => s + f.lines, 0),
      modules: MODULE_ORDER.filter((m) => fs.existsSync(path.join(ROOT, m))).length,
      byModule: countByModule(cFiles),
    },
  });
});

app.get("/api/curriculum", (_req, res) => {
  const cFiles = collectAllCFiles();
  const tree = [];
  for (const mod of MODULE_ORDER) {
    const modPath = path.join(ROOT, mod);
    if (!fs.existsSync(modPath)) continue;
    tree.push({
      name: mod,
      path: mod,
      children: listDir(modPath, mod),
    });
  }
  res.json({ tree, stats: { cFiles: cFiles.length, modules: tree.length, byModule: countByModule(cFiles) } });
});

app.get("/api/c-files", (_req, res) => {
  const files = collectAllCFiles();
  res.json({ files, total: files.length, byModule: countByModule(files) });
});

function collectQuizzes() {
  const quizzes = [];
  function walk(dir, prefix) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".") || entry.name === "web") continue;
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, rel);
      else if (entry.name === "QUIZ.md") {
        const meta = fileMeta(full, rel);
        const title = fs.readFileSync(full, "utf8").match(/^#\s+(.+)/m)?.[1] || "Quiz";
        quizzes.push({ ...meta, name: "QUIZ.md", title });
      }
    }
  }
  for (const mod of MODULE_ORDER) walk(path.join(ROOT, mod), mod);
  return quizzes.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }));
}

app.get("/api/quizzes", (_req, res) => {
  const quizzes = collectQuizzes();
  res.json({ quizzes, total: quizzes.length, byModule: countByModule(quizzes.map((q) => ({ module: q.module }))) });
});

app.get("/api/file", (req, res) => {
  const rel = (req.query.path || "").replace(/\\/g, "/");
  const full = safePath(rel);
  if (!full || !fs.existsSync(full) || !fs.statSync(full).isFile()) {
    return res.status(404).json({ error: "File not found" });
  }
  const content = fs.readFileSync(full, "utf8");
  const meta = fileMeta(full, rel);
  const companions = {};
  const dir = path.dirname(full);
  const base = path.dirname(rel);
  for (const [file, key] of [
    ["LESSON.md", "lesson"],
    ["QUIZ.md", "quiz"],
    ["CHEATSHEET.md", "cheatsheet"],
  ]) {
    const cp = path.join(dir, file);
    if (fs.existsSync(cp)) companions[key] = `${base}/${file}`;
  }
  res.json({ path: rel, content, ext: path.extname(full), meta, companions });
});

/* ── Scratch files (temp C files with full save history) ── */

function scratchDir(id) {
  // ids are server-generated uuids; guard against traversal anyway.
  if (!/^[a-f0-9-]{8,}$/i.test(id)) return null;
  return path.join(SCRATCH, id);
}

function readScratchMeta(id) {
  const dir = scratchDir(id);
  if (!dir) return null;
  const metaFile = path.join(dir, "meta.json");
  if (!fs.existsSync(metaFile)) return null;
  try {
    return JSON.parse(fs.readFileSync(metaFile, "utf8"));
  } catch (_) {
    return null;
  }
}

function writeScratchMeta(id, meta) {
  const dir = scratchDir(id);
  fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify(meta, null, 2), "utf8");
}

const SCRATCH_TEMPLATE = `#include <unistd.h>

void\tft_putchar(char c)
{
\twrite(1, &c, 1);
}

int\tmain(void)
{
\tft_putchar('H');
\tft_putchar('i');
\tft_putchar('\\n');
\treturn (0);
}
`;

// List all scratch files (most-recently-updated first).
app.get("/api/scratch", (_req, res) => {
  const items = [];
  for (const id of fs.readdirSync(SCRATCH)) {
    const meta = readScratchMeta(id);
    if (meta) {
      items.push({
        id,
        name: meta.name,
        created: meta.created,
        updated: meta.updated,
        versionCount: (meta.versions || []).length,
      });
    }
  }
  items.sort((a, b) => (b.updated || "").localeCompare(a.updated || ""));
  res.json({ files: items, total: items.length });
});

// Create a new scratch file.
app.post("/api/scratch", (req, res) => {
  const id = uuidv4();
  const dir = scratchDir(id);
  fs.mkdirSync(dir, { recursive: true });
  const now = new Date().toISOString();
  let name = (req.body && typeof req.body.name === "string" && req.body.name.trim()) || "scratch.c";
  if (!/\.c$/i.test(name)) name += ".c";
  name = name.replace(/[/\\]/g, "_");
  const content = (req.body && typeof req.body.content === "string") ? req.body.content : SCRATCH_TEMPLATE;

  fs.writeFileSync(path.join(dir, "v1.c"), content, "utf8");
  const meta = {
    id,
    name,
    created: now,
    updated: now,
    versions: [{ version: 1, savedAt: now, bytes: Buffer.byteLength(content) }],
  };
  writeScratchMeta(id, meta);
  res.json({ id, name, content, meta });
});

// Get latest content + meta of a scratch file.
app.get("/api/scratch/:id", (req, res) => {
  const meta = readScratchMeta(req.params.id);
  if (!meta) return res.status(404).json({ error: "Scratch file not found" });
  const latest = meta.versions[meta.versions.length - 1];
  const file = path.join(scratchDir(req.params.id), `v${latest.version}.c`);
  const content = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  res.json({ id: req.params.id, name: meta.name, content, meta });
});

// Save a new version of a scratch file.
app.post("/api/scratch/:id/save", (req, res) => {
  const meta = readScratchMeta(req.params.id);
  if (!meta) return res.status(404).json({ error: "Scratch file not found" });
  const content = req.body && req.body.content;
  if (typeof content !== "string") return res.status(400).json({ error: "No content" });

  const now = new Date().toISOString();
  const version = (meta.versions[meta.versions.length - 1]?.version || 0) + 1;
  fs.writeFileSync(path.join(scratchDir(req.params.id), `v${version}.c`), content, "utf8");
  meta.versions.push({ version, savedAt: now, bytes: Buffer.byteLength(content) });
  meta.updated = now;
  if (req.body.name && typeof req.body.name === "string") {
    meta.name = req.body.name.replace(/[/\\]/g, "_");
  }
  writeScratchMeta(req.params.id, meta);
  res.json({ id: req.params.id, version, savedAt: now, versionCount: meta.versions.length, meta });
});

// List the save history of a scratch file.
app.get("/api/scratch/:id/history", (req, res) => {
  const meta = readScratchMeta(req.params.id);
  if (!meta) return res.status(404).json({ error: "Scratch file not found" });
  res.json({ id: req.params.id, name: meta.name, versions: meta.versions.slice().reverse() });
});

// Get a specific version's content.
app.get("/api/scratch/:id/version/:v", (req, res) => {
  const meta = readScratchMeta(req.params.id);
  if (!meta) return res.status(404).json({ error: "Scratch file not found" });
  const v = parseInt(req.params.v, 10);
  const entry = meta.versions.find((x) => x.version === v);
  if (!entry) return res.status(404).json({ error: "Version not found" });
  const file = path.join(scratchDir(req.params.id), `v${v}.c`);
  const content = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  res.json({ id: req.params.id, version: v, savedAt: entry.savedAt, content });
});

// Delete a scratch file (and its history).
app.delete("/api/scratch/:id", (req, res) => {
  const dir = scratchDir(req.params.id);
  if (!dir || !fs.existsSync(dir)) return res.status(404).json({ error: "Scratch file not found" });
  fs.rmSync(dir, { recursive: true, force: true });
  res.json({ ok: true });
});

// Rename a scratch file.
app.patch("/api/scratch/:id", (req, res) => {
  const meta = readScratchMeta(req.params.id);
  if (!meta) return res.status(404).json({ error: "Scratch file not found" });
  let name = req.body && typeof req.body.name === "string" ? req.body.name.trim() : "";
  if (!name) return res.status(400).json({ error: "Name required" });
  if (!/\.c$/i.test(name)) name += ".c";
  name = name.replace(/[/\\]/g, "_").slice(0, 80);
  meta.name = name;
  meta.updated = new Date().toISOString();
  writeScratchMeta(req.params.id, meta);
  res.json({ id: req.params.id, name: meta.name, meta });
});

// Export scratch as a single JSON bundle (versions + latest).
app.get("/api/scratch/:id/export", (req, res) => {
  const meta = readScratchMeta(req.params.id);
  if (!meta) return res.status(404).json({ error: "Scratch file not found" });
  const dir = scratchDir(req.params.id);
  const versions = [];
  for (const v of meta.versions || []) {
    const file = path.join(dir, `v${v.version}.c`);
    versions.push({
      ...v,
      content: fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "",
    });
  }
  res.json({ id: req.params.id, name: meta.name, created: meta.created, updated: meta.updated, versions });
});

// Run norminette if installed (optional).
app.post("/api/norme", async (req, res) => {
  const { code, path: filePath = null } = req.body || {};
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "No code provided" });
  }
  if (Buffer.byteLength(code, "utf8") > MAX_CODE_BYTES) {
    return res.status(400).json({ error: "Code too large" });
  }

  let norminette = null;
  try {
    require("child_process").execFileSync("norminette", ["--version"], { encoding: "utf8", timeout: 3000 });
    norminette = "norminette";
  } catch (_) {
    return res.json({
      available: false,
      ok: false,
      output: "norminette not found on PATH. Install from https://github.com/42School/norminette then restart the server.",
    });
  }

  const id = uuidv4();
  const workDir = path.join(TEMP, id);
  fs.mkdirSync(workDir, { recursive: true });
  const src = path.join(workDir, "check.c");
  fs.writeFileSync(src, code, "utf8");

  const result = await runCommand(norminette, ["check.c"], workDir, 10000);
  cleanup(workDir);

  const out = (result.stdout || "") + (result.stderr || "");
  const ok = result.exitCode === 0 && !/Error/i.test(out);
  res.json({
    available: true,
    ok,
    exitCode: result.exitCode,
    output: truncateBuf(out.trim() || (ok ? "OK!" : "Norme check finished."), MAX_OUTPUT_BYTES),
    path: filePath,
  });
});

/**
 * Gather sibling .c files for multi-file projects (Rush, etc.).
 * When the folder has a real project (main.c + other .c), skip source.c
 * so the educational single-file demo does not collide with the project.
 */
function collectProjectCFiles(relPath, editorCode) {
  const files = [];
  const full = relPath ? safePath(relPath) : null;
  if (!full || !fs.existsSync(full)) {
    files.push({ name: "main.c", content: injectMissingHelpers(editorCode) });
    return files;
  }
  const dir = fs.statSync(full).isDirectory() ? full : path.dirname(full);
  const activeName = path.basename(full);
  const names = fs.readdirSync(dir).filter((n) => /\.c$/i.test(n)).sort();
  const hasProject = names.includes("main.c") && names.some((n) => n !== "main.c" && n !== "source.c");

  // source.c is the educational single-file demo — always compile alone.
  if (activeName === "source.c" || !hasProject) {
    const content = typeof editorCode === "string" ? editorCode : fs.readFileSync(full, "utf8");
    return [{ name: "main.c", content: injectMissingHelpers(content) }];
  }

  const useNames = names.filter((n) => n !== "source.c");
  if (!useNames.length) {
    return [{ name: "main.c", content: injectMissingHelpers(editorCode) }];
  }

  const bundled = [];
  for (const name of useNames) {
    const fp = path.join(dir, name);
    let content = fs.readFileSync(fp, "utf8");
    if (name === activeName && typeof editorCode === "string") content = editorCode;
    bundled.push({ name, content });
  }
  // Multi-file projects ship their own helpers (ft_putchar.c) — do not inject.
  return bundled;
}

app.post("/api/compile-run", async (req, res) => {
  cleanupStaleTemp();

  const { code, stdin = "", args = [], path: filePath = null } = req.body;
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "No code provided" });
  }
  if (Buffer.byteLength(code, "utf8") > MAX_CODE_BYTES) {
    return res.status(400).json({ error: `Code too large (max ${MAX_CODE_BYTES} bytes)` });
  }

  const safeArgs = sanitizeArgs(args);
  const id = uuidv4();
  const workDir = path.join(TEMP, id);
  fs.mkdirSync(workDir, { recursive: true });

  const outFile = path.join(workDir, "program");
  const outExe = path.join(workDir, "program.exe");

  let projectFiles;
  try {
    projectFiles = collectProjectCFiles(filePath, code);
  } catch (e) {
    cleanup(workDir);
    return res.status(400).json({ error: e.message || "Invalid project files" });
  }
  if (projectFiles.length > MAX_PROJECT_FILES) {
    cleanup(workDir);
    return res.status(400).json({ error: `Too many .c files (max ${MAX_PROJECT_FILES})` });
  }
  for (const f of projectFiles) {
    if (!/^[a-zA-Z0-9_./\\-]+\.c$/i.test(f.name) || f.name.includes("..")) {
      cleanup(workDir);
      return res.status(400).json({ error: `Unsafe filename: ${f.name}` });
    }
    if (Buffer.byteLength(f.content, "utf8") > MAX_CODE_BYTES) {
      cleanup(workDir);
      return res.status(400).json({ error: `${f.name} exceeds size limit` });
    }
    fs.writeFileSync(path.join(workDir, path.basename(f.name)), f.content, "utf8");
  }
  const srcNames = projectFiles.map((f) => path.basename(f.name));

  const steps = [];
  const gccPath = process.env.GCC || "gcc";
  const compileArgs = ["-Wall", "-Wextra", "-Werror", "-o", "program", ...srcNames];

  steps.push({
    phase: "compile",
    title: "Compile",
    command: `${gccPath} ${compileArgs.join(" ")}`,
    explanation: srcNames.length > 1
      ? `Multi-file project (${srcNames.join(", ")}). GCC compiles each unit then links — same as \`make\` with -Wall -Wextra -Werror (1337 norm).`
      : "GCC translates your C source into machine code. -Wall -Wextra -Werror catch mistakes early (1337 norm).",
  });

  const compile = await runCommand(gccPath, compileArgs, workDir, COMPILE_TIMEOUT_MS);
  steps[0].stdout = truncateBuf(compile.stdout, MAX_OUTPUT_BYTES);
  steps[0].stderr = truncateBuf(compile.stderr, MAX_OUTPUT_BYTES);
  steps[0].success = compile.exitCode === 0;

  if (compile.exitCode !== 0) {
    cleanup(workDir);
    return res.json({
      success: false,
      steps,
      compileError: compile.stderr || compile.stdout,
      output: "",
      explanation: explainCompileError(compile.stderr || compile.stdout),
    });
  }

  const binary = fs.existsSync(outExe) ? outExe : outFile;

  steps.push({
    phase: "run",
    title: "Execute",
    command: `./program${process.platform === "win32" ? ".exe" : ""}${safeArgs.length ? " " + safeArgs.join(" ") : ""}`,
    explanation:
      "The OS loads the program into memory, creates a stack, calls main(), and collects stdout/stderr. Sandbox: short timeout, capped output, no inherited secrets.",
  });

  const runResult = await runWithStdin(binary, safeArgs, stdin, workDir, RUN_TIMEOUT_MS);
  steps[1].stdout = runResult.stdout;
  steps[1].stderr = runResult.stderr;
  steps[1].exitCode = runResult.exitCode;
  steps[1].success = runResult.exitCode === 0;
  if (runResult.signal === "TIMEOUT") {
    steps[1].explanation = `Killed after ${RUN_TIMEOUT_MS}ms (possible infinite loop).`;
  }

  const explanation = explainOutput(code, runResult.stdout, runResult.stderr, runResult.exitCode);
  if (runResult.signal === "TIMEOUT") {
    explanation.unshift({ type: "error", text: `Program timed out after ${RUN_TIMEOUT_MS}ms.` });
  }

  cleanup(workDir);

  res.json({
    success: runResult.exitCode === 0 && !compile.error,
    steps,
    stdout: runResult.stdout,
    stderr: runResult.stderr,
    exitCode: runResult.exitCode,
    explanation,
  });
});

function truncateBuf(s, max) {
  if (!s || s.length <= max) return s || "";
  return s.slice(0, max) + `\n… [truncated at ${max} bytes]`;
}

function sanitizeArgs(args) {
  if (!Array.isArray(args)) return [];
  return args
    .slice(0, MAX_ARGS)
    .map((a) => String(a).slice(0, MAX_ARG_LEN))
    .filter((a) => a.length > 0 && !/[\0\r\n]/.test(a));
}

function cleanupStaleTemp() {
  try {
    if (!fs.existsSync(TEMP)) return;
    const now = Date.now();
    for (const name of fs.readdirSync(TEMP)) {
      const full = path.join(TEMP, name);
      try {
        const st = fs.statSync(full);
        if (now - st.mtimeMs > TEMP_MAX_AGE_MS) {
          fs.rmSync(full, { recursive: true, force: true });
        }
      } catch (_) { }
    }
  } catch (_) { }
}

function runWithStdin(binary, args, stdin, cwd, timeoutMs) {
  return new Promise((resolve) => {
    const bin = path.resolve(binary);
    if (!fs.existsSync(bin)) {
      resolve({ stdout: "", stderr: `Binary not found: ${bin}`, exitCode: 1, signal: null });
      return;
    }

    let proc;
    try {
      proc = spawn(bin, args, {
        cwd,
        windowsHide: true,
        env: {
          PATH: process.env.PATH,
          SystemRoot: process.env.SystemRoot,
          TEMP: cwd,
          TMP: cwd,
          LANG: "C",
        },
      });
    } catch (err) {
      resolve({ stdout: "", stderr: err.message || String(err), exitCode: 1, signal: null });
      return;
    }

    let stdout = "";
    let stderr = "";
    let killed = false;
    let forceTimer = null;

    const timer = setTimeout(() => {
      killed = true;
      try { proc.kill("SIGTERM"); } catch (_) { }
      forceTimer = setTimeout(() => {
        try { proc.kill("SIGKILL"); } catch (_) { }
      }, 800);
    }, timeoutMs);

    const onChunk = (dest) => (d) => {
      if (dest === "out") {
        if (stdout.length < MAX_OUTPUT_BYTES) stdout += d.toString();
      } else if (stderr.length < MAX_OUTPUT_BYTES) {
        stderr += d.toString();
      }
    };
    proc.stdout.on("data", onChunk("out"));
    proc.stderr.on("data", onChunk("err"));
    try {
      if (stdin) proc.stdin.write(String(stdin).slice(0, MAX_STDIN_BYTES));
      proc.stdin.end();
    } catch (_) { }

    proc.on("error", (err) => {
      clearTimeout(timer);
      if (forceTimer) clearTimeout(forceTimer);
      resolve({
        stdout: truncateBuf(stdout, MAX_OUTPUT_BYTES),
        stderr: truncateBuf(err.message || String(err), MAX_OUTPUT_BYTES),
        exitCode: 1,
        signal: null,
      });
    });

    proc.on("close", (code, signal) => {
      clearTimeout(timer);
      if (forceTimer) clearTimeout(forceTimer);
      resolve({
        stdout: truncateBuf(stdout, MAX_OUTPUT_BYTES),
        stderr: truncateBuf(stderr, MAX_OUTPUT_BYTES),
        exitCode: killed ? 124 : code ?? 1,
        signal: killed ? "TIMEOUT" : signal,
      });
    });
  });
}

/**
 * Standard 1337/libft helper definitions. Many curriculum exercises declare a
 * prototype (e.g. `void ft_putchar(char c);`) and call the helper without
 * defining it, expecting it to be linked from libft. Since we compile each file
 * standalone, we auto-inject the canonical definition for any helper that is
 * referenced but not defined in the source, so snippets run out of the box.
 */
const LIBFT_HELPERS = {
  ft_putchar: `void ft_putchar(char c)\n{\n\twrite(1, &c, 1);\n}\n`,
  ft_putstr: `void ft_putstr(char *s)\n{\n\twhile (s && *s)\n\t\twrite(1, s++, 1);\n}\n`,
  ft_putendl: `void ft_putendl(char *s)\n{\n\twhile (s && *s)\n\t\twrite(1, s++, 1);\n\twrite(1, "\\n", 1);\n}\n`,
  ft_putnbr: `void ft_putnbr(int n)\n{\n\tchar c;\n\tif (n == -2147483648)\n\t{\n\t\twrite(1, "-2147483648", 11);\n\t\treturn;\n\t}\n\tif (n < 0)\n\t{\n\t\twrite(1, "-", 1);\n\t\tn = -n;\n\t}\n\tif (n >= 10)\n\t\tft_putnbr(n / 10);\n\tc = (char)('0' + (n % 10));\n\twrite(1, &c, 1);\n}\n`,
  ft_strlen: `int ft_strlen(char *s)\n{\n\tint i = 0;\n\twhile (s && s[i])\n\t\ti++;\n\treturn (i);\n}\n`,
  ft_swap: `void ft_swap(int *a, int *b)\n{\n\tint tmp = *a;\n\t*a = *b;\n\t*b = tmp;\n}\n`,
};

function helperIsDefined(name, code) {
  // A definition is `name (...) {` with a body (allowing newlines / static / type before it).
  const re = new RegExp(`\\b${name}\\s*\\([^;{]*\\)\\s*\\{`);
  return re.test(code);
}

function helperIsReferenced(name, code) {
  return new RegExp(`\\b${name}\\s*\\(`).test(code);
}

function injectMissingHelpers(code) {
  const missing = [];
  for (const name of Object.keys(LIBFT_HELPERS)) {
    if (helperIsReferenced(name, code) && !helperIsDefined(name, code)) {
      missing.push(name);
    }
  }
  if (missing.length === 0) return code;

  const prelude = missing.map((n) => LIBFT_HELPERS[n]).join("\n");
  const banner =
    "/* Auto-linked libft helpers (ft_putchar, etc.) so this snippet runs standalone. */\n";
  // Always place unistd.h first so injected helpers can use write(). A duplicate
  // include (if the original already has one) is harmless.
  const includeLine = "#include <unistd.h>\n";

  return `${includeLine}${banner}${prelude}\n${code}`;
}

function explainCompileError(text) {
  const lines = [];
  if (/undefined reference/.test(text))
    lines.push("Linker error: a function is declared but not defined. Add the function body or link the right file.");
  if (/implicit declaration/.test(text))
    lines.push("Missing prototype or #include. The compiler does not know that function exists.");
  if (/expected .* before/.test(text))
    lines.push("Syntax error: check semicolons, braces, and parentheses near the line GCC mentions.");
  if (/incompatible/.test(text))
    lines.push("Type mismatch: you passed the wrong type (e.g. int instead of int *).");
  if (/unused/.test(text))
    lines.push("With -Werror, warnings become errors. Remove or use unused variables.");
  if (lines.length === 0)
    lines.push("Read the first error line GCC prints — later errors are often cascading.");
  return lines.map((text) => ({ type: "error", text }));
}

function explainOutput(code, stdout, stderr, exitCode) {
  const points = [];

  if (stdout.length === 0 && !stderr && exitCode === 0)
    points.push({
      type: "info",
      text: "Program exited successfully but printed nothing. Maybe no write()/printf() ran, or output went elsewhere.",
    });
  else if (stdout.length > 0) {
    const display = stdout.replace(/\r\n/g, "\n");
    points.push({
      type: "output",
      text: `stdout (${display.length} byte${display.length !== 1 ? "s" : ""}): characters sent to file descriptor 1 (terminal).`,
    });
    for (const ch of display.slice(0, 20)) {
      const code = ch.charCodeAt(0);
      if (code < 32 || code === 127) {
        points.push({
          type: "ascii",
          text: `Control char \\${specialCharName(ch)} = ASCII ${code} (0x${code.toString(16).toUpperCase()})`,
        });
      } else {
        points.push({
          type: "ascii",
          text: `'${ch}' = ASCII ${code} (0x${code.toString(16).toUpperCase()})`,
        });
      }
    }
    if (stdout.length > 20)
      points.push({ type: "info", text: `… and ${stdout.length - 20} more characters.` });
  }

  if (stderr) points.push({ type: "error", text: `stderr: ${stderr.trim()}` });
  if (exitCode !== 0)
    points.push({ type: "error", text: `Exit code ${exitCode} — non-zero means failure or crash.` });

  if (/write\s*\(\s*1/.test(code))
    points.push({
      type: "concept",
      text: "write(1, …) sends bytes directly to stdout — no buffering like printf.",
    });
  if (/ft_putchar/.test(code))
    points.push({ type: "concept", text: "ft_putchar wraps write(1, &c, 1) — one byte per call." });
  if (/\*\w+\s*=/.test(code))
    points.push({ type: "concept", text: "*pointer = value writes through the address — modifies caller memory." });
  if (/&\w+/.test(code))
    points.push({ type: "concept", text: "&variable passes the address so the callee can modify the original." });

  return points;
}

function specialCharName(ch) {
  const map = { "\n": "n", "\t": "t", "\0": "0", "\r": "r" };
  return map[ch] || `x${ch.charCodeAt(0).toString(16).padStart(2, "0")}`;
}

function cleanup(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch (_) { }
}

/* ── Exam shell (42-style) ── */
const examBank = require("./exam-bank");
const EXAM_SESSIONS = new Map();
const EXAM_DIR = path.join(WEB, ".exam-sessions");
if (!fs.existsSync(EXAM_DIR)) fs.mkdirSync(EXAM_DIR, { recursive: true });

function sessionPublic(s) {
  const exam = examBank.getExam(s.examId);
  const levelState = s.levels[s.level];
  const currentId = levelState ? levelState.assigned[levelState.currentIndex] : null;
  const current = examBank.publicExercise(examBank.getExercise(currentId));
  const diff = examBank.normalizeDifficulty(s.difficulty);
  const startedAt = s.startedAt || s.created || null;
  const durationMs = s.durationMs || examBank.getExamDurationMs(s.examId);
  const deadline = s.deadline || (startedAt ? new Date(Date.parse(startedAt) + durationMs).toISOString() : null);
  const remainingMs = deadline && s.status === "active"
    ? Math.max(0, Date.parse(deadline) - Date.now())
    : null;
  return {
    id: s.id,
    examId: s.examId,
    title: exam ? exam.title : s.examId,
    difficulty: diff,
    difficultyTitle: examBank.DIFFICULTIES[diff].title,
    status: s.status,
    level: s.level,
    levelCount: s.levels.length,
    exercisesPerLevel: examBank.EXERCISES_PER_LEVEL,
    levels: s.levels.map((lv) => ({
      level: lv.level,
      assigned: lv.assigned,
      poolSize: lv.poolSize || (lv.pool && lv.pool.length) || lv.assigned.length,
      passed: lv.passed,
      currentIndex: lv.currentIndex,
      locked: lv.level > s.level,
      complete: lv.passed.length >= lv.assigned.length,
    })),
    current,
    currentProgress: levelState
      ? { index: levelState.currentIndex, total: levelState.assigned.length, passed: levelState.passed.length }
      : null,
    message: s.message || null,
    startedAt,
    durationMs,
    durationHours: durationMs / (60 * 60 * 1000),
    deadline,
    remainingMs,
  };
}

function expireIfNeeded(s) {
  if (!s || s.status !== "active") return false;
  const deadline = s.deadline || (s.startedAt || s.created
    ? new Date(Date.parse(s.startedAt || s.created) + (s.durationMs || examBank.getExamDurationMs(s.examId))).toISOString()
    : null);
  if (!deadline) return false;
  if (Date.now() <= Date.parse(deadline)) return false;
  s.status = "expired";
  s.message = "Time is up — exam expired.";
  s.updated = new Date().toISOString();
  if (!s.deadline) s.deadline = deadline;
  saveSession(s);
  return true;
}

function loadSession(id) {
  if (EXAM_SESSIONS.has(id)) return EXAM_SESSIONS.get(id);
  const file = path.join(EXAM_DIR, `${id}.json`);
  if (!fs.existsSync(file)) return null;
  try {
    const s = JSON.parse(fs.readFileSync(file, "utf8"));
    EXAM_SESSIONS.set(id, s);
    return s;
  } catch (_) {
    return null;
  }
}

function saveSession(s) {
  EXAM_SESSIONS.set(s.id, s);
  try {
    fs.writeFileSync(path.join(EXAM_DIR, `${s.id}.json`), JSON.stringify(s, null, 2), "utf8");
  } catch (_) { }
}

app.get("/api/exams", (_req, res) => {
  res.json({ exams: examBank.listExams() });
});

app.post("/api/exam/start", (req, res) => {
  const examId = req.body && req.body.examId;
  const difficulty = examBank.normalizeDifficulty(req.body && req.body.difficulty);
  const exam = examBank.getExam(examId);
  if (!exam) return res.status(400).json({ error: "Unknown exam. Use exam00, exam01, exam02, or final." });

  const levels = examBank.pickLevelAssignments(examId, difficulty);
  const id = uuidv4();
  const first = levels[0].assigned[0];
  const firstEx = examBank.getExercise(first);
  const files = {};
  if (firstEx) files[firstEx.filename] = "";
  const diffTitle = examBank.DIFFICULTIES[difficulty].title;
  const startedAt = new Date().toISOString();
  const durationMs = examBank.getExamDurationMs(examId);
  const deadline = new Date(Date.now() + durationMs).toISOString();
  const hours = durationMs / (60 * 60 * 1000);

  const session = {
    id,
    examId,
    difficulty,
    status: "active",
    level: 0,
    levels,
    files,
    message: `${exam.title} (${diffTitle}) started — ${hours}h timer · 10 levels. Level 0 exercise 1/${examBank.EXERCISES_PER_LEVEL}: ${first}. Clear 2 exercises per level to advance.`,
    startedAt,
    durationMs,
    deadline,
    created: startedAt,
    updated: startedAt,
  };
  saveSession(session);
  res.json(sessionPublic(session));
});

app.get("/api/exam/:id", (req, res) => {
  const s = loadSession(req.params.id);
  if (!s) return res.status(404).json({ error: "Exam session not found" });
  if (expireIfNeeded(s)) return res.json(sessionPublic(s));
  res.json(sessionPublic(s));
});

app.get("/api/exam/:id/file", (req, res) => {
  const s = loadSession(req.params.id);
  if (!s) return res.status(404).json({ error: "Exam session not found" });
  if (expireIfNeeded(s)) return res.status(400).json({ error: "Time is up — exam expired", session: sessionPublic(s) });
  const name = String(req.query.name || "");
  if (!name || name.includes("..") || name.includes("/") || name.includes("\\")) {
    return res.status(400).json({ error: "Invalid file name" });
  }
  const levelState = s.levels[s.level];
  const currentId = levelState && levelState.assigned[levelState.currentIndex];
  const current = examBank.getExercise(currentId);
  if (!current || !current.allowedFiles.includes(name)) {
    return res.status(403).json({ error: "File not allowed for current exercise" });
  }
  if (s.files[name] === undefined) s.files[name] = "";
  res.json({ name, content: s.files[name], subject: current.subject, exercise: examBank.publicExercise(current) });
});

app.put("/api/exam/:id/file", (req, res) => {
  const s = loadSession(req.params.id);
  if (!s) return res.status(404).json({ error: "Exam session not found" });
  if (expireIfNeeded(s)) return res.status(400).json({ error: "Time is up — exam expired", session: sessionPublic(s) });
  if (s.status !== "active") return res.status(400).json({ error: "Exam is not active" });
  const name = req.body && req.body.name;
  const content = req.body && req.body.content;
  if (!name || typeof content !== "string") return res.status(400).json({ error: "name and content required" });
  if (name.includes("..") || name.includes("/") || name.includes("\\")) {
    return res.status(400).json({ error: "Invalid file name" });
  }
  if (Buffer.byteLength(content, "utf8") > MAX_CODE_BYTES) {
    return res.status(400).json({ error: "File too large" });
  }
  const levelState = s.levels[s.level];
  const currentId = levelState && levelState.assigned[levelState.currentIndex];
  const current = examBank.getExercise(currentId);
  if (!current || !current.allowedFiles.includes(name)) {
    return res.status(403).json({ error: "File not allowed for current exercise" });
  }
  s.files[name] = content;
  s.updated = new Date().toISOString();
  saveSession(s);
  res.json({ ok: true });
});

app.post("/api/exam/:id/grade", async (req, res) => {
  cleanupStaleTemp();
  const s = loadSession(req.params.id);
  if (!s) return res.status(404).json({ error: "Exam session not found" });
  if (expireIfNeeded(s)) {
    return res.status(400).json({ error: "Time is up — exam expired", session: sessionPublic(s) });
  }
  if (s.status !== "active") return res.status(400).json({ error: "Exam is not active" });

  const levelState = s.levels[s.level];
  if (!levelState) return res.status(400).json({ error: "Invalid level" });
  const currentId = levelState.assigned[levelState.currentIndex];
  const exercise = examBank.getExercise(currentId);
  if (!exercise) return res.status(400).json({ error: "Exercise missing" });

  // Accept latest editor content if provided
  if (req.body && typeof req.body.content === "string" && req.body.name) {
    if (exercise.allowedFiles.includes(req.body.name)) {
      if (Buffer.byteLength(req.body.content, "utf8") > MAX_CODE_BYTES) {
        return res.status(400).json({ error: "Code too large" });
      }
      s.files[req.body.name] = req.body.content;
    }
  }

  const studentCode = s.files[exercise.filename];
  if (typeof studentCode !== "string") {
    return res.status(400).json({ error: `Missing ${exercise.filename}` });
  }

  // Anti-cheat: client paste/drop flag
  const clientCheat = req.body && req.body.cheat;
  if (clientCheat && (clientCheat.paste || clientCheat.drop)) {
    const why = clientCheat.paste && clientCheat.drop
      ? "paste and drop detected"
      : clientCheat.paste
        ? "paste detected"
        : "file drop detected";
    s.message = `KO — cheating (${why}). Write the code yourself.`;
    s.updated = new Date().toISOString();
    saveSession(s);
    return res.json({
      ok: false,
      passed: false,
      stage: "cheat",
      output: [
        "========================================",
        "              g r a d e m e",
        "========================================",
        "",
        `CHEAT : ${why}`,
        "Paste / drop is not allowed in the exam editor.",
        "Type your solution by hand.",
        "",
        "GRADE: KO",
      ].join("\n"),
      session: sessionPublic(s),
    });
  }

  // Anti-cheat: forbidden functions (server-side)
  const integrity = examBank.checkCodeIntegrity(
    studentCode,
    exercise.allowedFuncs || [],
    exercise.name || exercise.id
  );
  if (!integrity.ok) {
    s.message = integrity.message;
    s.updated = new Date().toISOString();
    saveSession(s);
    return res.json({
      ok: false,
      passed: false,
      stage: "cheat",
      output: [
        "========================================",
        "              g r a d e m e",
        "========================================",
        "",
        integrity.message,
        "",
        "GRADE: KO",
      ].join("\n"),
      session: sessionPublic(s),
    });
  }

  const id = uuidv4();
  const workDir = path.join(TEMP, id);
  fs.mkdirSync(workDir, { recursive: true });

  const srcNames = [];
  fs.writeFileSync(path.join(workDir, exercise.filename), studentCode, "utf8");
  srcNames.push(exercise.filename);
  (exercise.helpers || []).forEach((h, i) => {
    const name = `helper_${i}.c`;
    fs.writeFileSync(path.join(workDir, name), h, "utf8");
    srcNames.push(name);
  });
  fs.writeFileSync(path.join(workDir, "grader_main.c"), exercise.grader, "utf8");
  srcNames.push("grader_main.c");

  const gccPath = process.env.GCC || "gcc";
  const compileArgs = ["-Wall", "-Wextra", "-Werror", "-o", "program", ...srcNames];
  const compile = await runCommand(gccPath, compileArgs, workDir, COMPILE_TIMEOUT_MS);

  if (compile.exitCode !== 0) {
    cleanup(workDir);
    s.message = `KO — compile error on ${exercise.name}`;
    saveSession(s);
    return res.json({
      ok: false,
      passed: false,
      stage: "compile",
      output: truncateBuf(compile.stderr || compile.stdout || "compile failed", MAX_OUTPUT_BYTES),
      session: sessionPublic(s),
    });
  }

  const binary = fs.existsSync(path.join(workDir, "program.exe"))
    ? path.join(workDir, "program.exe")
    : path.join(workDir, "program");
  const runResult = await runWithStdin(binary, [], "", workDir, RUN_TIMEOUT_MS);
  cleanup(workDir);

  const got = (runResult.stdout || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const expected = String(exercise.expected).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const passed = runResult.exitCode === 0 && got === expected;

  let terminal = `$ gcc -Wall -Wextra -Werror -o program ${exercise.filename} …\n`;
  terminal += `✓ compile OK\n$ ./program\n`;
  terminal += got.length ? got : "(no output)\n";
  if (runResult.stderr) terminal += runResult.stderr;
  if (runResult.signal === "TIMEOUT") {
    terminal += `\n[timeout after ${RUN_TIMEOUT_MS}ms]\n`;
  }
  terminal += `\n---\n`;
  if (passed) terminal += `GRADE: OK\n`;
  else {
    terminal += `GRADE: KO\n`;
    terminal += `expected (${expected.length} bytes): ${JSON.stringify(expected)}\n`;
    terminal += `got      (${got.length} bytes): ${JSON.stringify(got)}\n`;
  }

  if (passed) {
    if (!levelState.passed.includes(currentId)) levelState.passed.push(currentId);

    if (levelState.passed.length >= levelState.assigned.length) {
      if (s.level >= s.levels.length - 1) {
        s.status = "passed";
        s.message = `SUCCESS — you cleared ${examBank.getExam(s.examId).title}.`;
      } else {
        s.level += 1;
        const next = s.levels[s.level];
        next.currentIndex = 0;
        const nextEx = examBank.getExercise(next.assigned[0]);
        if (nextEx && s.files[nextEx.filename] === undefined) s.files[nextEx.filename] = "";
        s.message = `Level ${s.level - 1} cleared. Now Level ${s.level} — exercise 1/${next.assigned.length}: ${next.assigned[0]}`;
      }
    } else {
      levelState.currentIndex += 1;
      const nextId = levelState.assigned[levelState.currentIndex];
      const nextEx = examBank.getExercise(nextId);
      if (nextEx && s.files[nextEx.filename] === undefined) s.files[nextEx.filename] = "";
      s.message = `OK — ${exercise.name}. Next: ${nextId} (${levelState.passed.length}/${levelState.assigned.length} in level ${s.level})`;
    }
  } else {
    s.message = `KO — ${exercise.name}. Fix and grade again.`;
  }

  s.updated = new Date().toISOString();
  saveSession(s);

  res.json({
    ok: true,
    passed,
    stage: passed ? "pass" : "run",
    output: truncateBuf(terminal, MAX_OUTPUT_BYTES),
    session: sessionPublic(s),
  });
});

app.post("/api/exam/:id/abandon", (req, res) => {
  const s = loadSession(req.params.id);
  if (!s) return res.status(404).json({ error: "Exam session not found" });
  s.status = "abandoned";
  s.message = "Exam abandoned.";
  s.updated = new Date().toISOString();
  saveSession(s);
  res.json(sessionPublic(s));
});

// JSON parse errors
app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON in request body" });
  }
  next(err);
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const server = app.listen(PORT, () => {
  console.log(`\n  Poolers Playground running at http://localhost:${PORT}\n`);
  console.log(`  Curriculum root: ${ROOT}\n`);
  console.log(`  System check:    node check.js\n`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n  Port ${PORT} already in use. Kill other process or set PORT=3848\n`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
