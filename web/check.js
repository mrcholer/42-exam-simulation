/**
 * Poolers system check — run: node check.js
 */
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const http = require("http");

const ROOT = path.join(__dirname, "..");
const WEB = __dirname;
const PORT = process.env.PORT || 3847;
const BASE = `http://localhost:${PORT}`;

const REQUIRED_MODULES = [
  "Theory", "Shell00", "Shell01",
  "C00", "C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09",
  "C10", "C11", "C12", "C13", "Rush", "Exam",
];

const EXERCISE_FILES = ["LESSON.md", "QUIZ.md", "source.c"];

let errors = [];
let warnings = [];

function err(msg) { errors.push(msg); console.log("  ✗", msg); }
function warn(msg) { warnings.push(msg); console.log("  ⚠", msg); }
function ok(msg) { console.log("  ✓", msg); }

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    }).on("error", reject);
  });
}

function post(url, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const payload = JSON.stringify(body);
    const req = http.request(
      { hostname: u.hostname, port: u.port, path: u.pathname, method: "POST",
        headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode, body: data }));
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

console.log("\n=== Poolers System Check ===\n");

// 1. Directory structure
console.log("1. Curriculum structure");
for (const mod of REQUIRED_MODULES) {
  const p = path.join(ROOT, mod);
  if (!fs.existsSync(p)) err(`Missing module: ${mod}`);
  else ok(`Module ${mod}`);
}

// 2. Exercise completeness (sample C modules)
console.log("\n2. Exercise files (C00-C13 sample)");
for (const mod of ["C00", "C01", "C04", "C06", "C07"]) {
  const modPath = path.join(ROOT, mod);
  if (!fs.existsSync(modPath)) continue;
  for (const ex of fs.readdirSync(modPath, { withFileTypes: true })) {
    if (!ex.isDirectory() || ex.name.startsWith(".")) continue;
    const exPath = path.join(modPath, ex.name);
    for (const f of EXERCISE_FILES) {
      if (!fs.existsSync(path.join(exPath, f))) warn(`${mod}/${ex.name} missing ${f}`);
    }
  }
}
ok("Exercise scan done");

// 2b. Content quality (scaffold detection)
console.log("\n2b. Content quality");
let scaffoldLessons = 0;
let scaffoldSources = 0;
let scaffoldQuizzes = 0;
let enrichedLessons = 0;

function walkContent(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.name === "web" || e.name === "node_modules" || e.name === "scripts") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkContent(full);
    else if (e.name === "LESSON.md") {
      const t = fs.readFileSync(full, "utf8");
      if (/See \*\*VISUALS\.md\*\*/.test(t)) scaffoldLessons++;
      else if (t.length > 4000) enrichedLessons++;
    } else if (e.name === "source.c") {
      const t = fs.readFileSync(full, "utf8");
      if (/Implement .+ yourself/.test(t) && t.length < 800) scaffoldSources++;
    } else if (e.name === "QUIZ.md") {
      const t = fs.readFileSync(full, "utf8");
      if (/Primary learning goal of \*\*/.test(t) && t.length < 4000) scaffoldQuizzes++;
    }
  }
}
for (const mod of REQUIRED_MODULES) walkContent(path.join(ROOT, mod));
if (scaffoldSources > 10) warn(`${scaffoldSources} source.c still stub (run: node scripts/enrich-content.js)`);
else ok(`source.c stubs: ${scaffoldSources}`);
if (scaffoldLessons > 10) warn(`${scaffoldLessons} LESSON.md still old scaffold`);
else ok(`LESSON scaffolds: ${scaffoldLessons}, enriched: ${enrichedLessons}+`);
if (scaffoldQuizzes > 20) warn(`${scaffoldQuizzes} QUIZ.md still generic`);
else ok(`QUIZ scaffolds: ${scaffoldQuizzes}`);

// 3. C file count
console.log("\n3. C source files");
let cCount = 0;
function countC(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".") || e.name === "web" || e.name === "node_modules") continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) countC(full);
    else if (/\.c$/i.test(e.name)) cCount++;
  }
}
for (const mod of REQUIRED_MODULES) countC(path.join(ROOT, mod));
if (cCount < 80) warn(`Only ${cCount} .c files (expected ~88)`);
else ok(`${cCount} .c files found`);

// 4. Web static files
console.log("\n4. Web frontend");
const staticFiles = [
  "public/index.html", "public/css/app.css", "public/js/app.js", "public/js/tracer.js",
  "server.js", "package.json",
];
for (const f of staticFiles) {
  if (!fs.existsSync(path.join(WEB, f))) err(`Missing web file: ${f}`);
  else ok(f);
}

// 5. GCC
console.log("\n5. Toolchain");
try {
  const gcc = execFileSync("gcc", ["--version"], { encoding: "utf8" }).split("\n")[0];
  ok(`GCC: ${gcc.slice(0, 60)}`);
} catch {
  err("GCC not found — Run button will fail");
}

// 6. node_modules
if (!fs.existsSync(path.join(WEB, "node_modules"))) err("Run: cd web && npm install");
else ok("node_modules present");

// 7. API tests (server must be running)
console.log("\n6. API endpoints (server on :3847)");
async function apiTests() {
  try {
    const health = await get(`${BASE}/api/health`);
    if (health.status !== 200) err(`/api/health → ${health.status}`);
    else ok("/api/health");

    const curr = await get(`${BASE}/api/curriculum`);
    if (curr.status !== 200) err(`/api/curriculum → ${curr.status}`);
    else {
      const data = JSON.parse(curr.body);
      if (!data.tree) err("/api/curriculum missing tree");
      else ok(`/api/curriculum (${data.tree.length} modules, ${data.stats?.cFiles} c files)`);
    }

    const cfiles = await get(`${BASE}/api/c-files`);
    const cf = JSON.parse(cfiles.body);
    if (cf.total !== cCount) warn(`API c-files (${cf.total}) vs disk (${cCount}) mismatch`);
    else ok(`/api/c-files (${cf.total} files)`);

    const file = await get(`${BASE}/api/file?path=${encodeURIComponent("C00/ex00/source.c")}`);
    if (file.status !== 200) err("/api/file C00/ex00/source.c failed");
    else {
      const fd = JSON.parse(file.body);
      if (!fd.content.includes("ft_putchar")) err("/api/file content invalid");
      else if (!fd.companions.lesson || !fd.companions.quiz) err("companions missing lesson/quiz");
      else ok("/api/file C00/ex00/source.c (+ lesson & quiz links)");
    }

    const bad = await get(`${BASE}/api/file?path=../../../etc/passwd`);
    if (bad.status === 200) err("Path traversal not blocked!");
    else ok("Path traversal blocked");

    const run = await post(`${BASE}/api/compile-run`, {
      code: '#include <unistd.h>\nint main(void){write(1,"OK\\n",3);return 0;}',
    });
    const rd = JSON.parse(run.body);
    if (!rd.success) err(`compile-run failed: ${rd.compileError || rd.stderr}`);
    else if (!rd.stdout.includes("OK")) err(`compile-run unexpected output: ${JSON.stringify(rd.stdout)}`);
    else ok("/api/compile-run");

    // Full exercise source (comments + main)
    const exSrc = fs.readFileSync(path.join(ROOT, "C00/ex00/source.c"), "utf8");
    const exRun = await post(`${BASE}/api/compile-run`, { code: exSrc });
    const ex = JSON.parse(exRun.body);
    if (!ex.success) err(`C00/ex00 compile failed: ${(ex.compileError || "").slice(0, 120)}`);
    else ok(`C00/ex00 source.c compiles → "${ex.stdout.replace(/\r\n/g, "\\n")}"`);

    const sys = await get(`${BASE}/api/system`);
    if (sys.status !== 200) err("/api/system failed");
    else {
      const sd = JSON.parse(sys.body);
      if (!sd.gccOk) warn("GCC not available via /api/system");
      else ok(`/api/system (${sd.stats.cFiles} files, ${sd.stats.totalLines} lines)`);
    }

    const quizzes = await get(`${BASE}/api/quizzes`);
    if (quizzes.status !== 200) err(`/api/quizzes → ${quizzes.status}`);
    else {
      const qd = JSON.parse(quizzes.body);
      ok(`/api/quizzes (${qd.total} quizzes)`);
    }

    const theoryLesson = await get(`${BASE}/api/file?path=${encodeURIComponent("Theory/02-binary/LESSON.md")}`);
    if (theoryLesson.status !== 200) err("Theory LESSON.md load failed");
    else {
      const td = JSON.parse(theoryLesson.body);
      if (!td.companions?.quiz) err("Theory file missing quiz companion");
      else ok("Theory/02-binary/LESSON.md (+ companions)");
    }

    const index = await get(`${BASE}/`);
    if (index.status !== 200 || !index.body.includes("Poolers Playground")) err("index.html not served");
    else ok("Static index.html");
  } catch (e) {
    err(`API tests skipped — server not running: ${e.message}`);
    console.log("\n  → Start server: cd web && npm start\n");
  }

  console.log("\n=== Summary ===");
  console.log(`  Errors:   ${errors.length}`);
  console.log(`  Warnings: ${warnings.length}`);
  if (errors.length) {
    console.log("\n  FAILED — fix errors above\n");
    process.exit(1);
  }
  console.log("\n  ALL CHECKS PASSED\n");
}

apiTests();
