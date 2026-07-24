# Poolers Website — Playground & Exam Shell

Local web app that sits on top of the Poolers curriculum. Browse lessons, run C with **gcc**, take interactive quizzes, and practice timed exams like **42 examshell**.

```bash
cd web
npm install
npm start
```

| Page | URL |
|------|-----|
| **Playground** | http://localhost:3847/ |
| **Exam Shell** | http://localhost:3847/exam |

Default port: **3847** (`PORT` env var overrides it).

---

## Requirements

- **Node.js** 18+
- **GCC** (MinGW on Windows) — required for Run / Exam grade / Test terminal `run`
- Optional: **norminette** for the Playground Norme button

---

## Playground (`/`)

Interactive IDE for the whole repo.

### What you can do

| Feature | Description |
|---------|-------------|
| **Browse** | Curriculum tree — Theory, Shell, C00–C13, Rush, Exam |
| **C Files** | Flat list of all `.c` files, filterable by module |
| **Quizzes** | Every `QUIZ.md` → interactive **Quiz** mode |
| **Scratch** | Temp C files with version save history |
| **Tabs** | Multi-file editor (VS Code–style) |
| **Companions** | From a `.c` tab: open Lesson / Quiz / Cheat sheet |
| **Markdown** | Edit · Preview · Split · Quiz |
| **Run** | Real gcc compile + execute (`Ctrl+Enter`) |
| **Step** | Line-by-line educational trace + memory panel |
| **Exam** | Header button → `/exam` |

### Typical session

1. Pick an exercise in **Browse** (e.g. `C00/ex00/LESSON.md`)
2. Open `QUIZ.md` → **Quiz** mode — answer before peeking at code
3. Open `source.c` → predict output → **Run** or **Step**
4. Use **Scratch** when you want a sandbox without touching curriculum files

### Mentors

Prefer **Step** before **Run** in meetings so students predict memory and output first.

---

## Exam Shell (`/exam`)

42-inspired practice exam UI (local only).

### Flow

1. Type `examshell` or `start exam00 hard`
2. Choose exam + difficulty → timer starts  
   - **exam00 / exam01 / exam02** → 4 hours  
   - **final** → 8 hours  
3. Editor (**rendu**) + subject pane + terminal appear
4. Solve by typing (paste/drop blocked)
5. `grade` / `grademe` or **Ctrl+Enter**
6. Clear both assignments in a level to unlock the next

**~116 graded subjects** across display, pointers, strings, math, bits, malloc, and exam classics. Each level picks **2 random** exercises from a themed pool; from level 5+, harder pools are preferred based on **normal / hard / extreme**.

### Terminal

| Feature | Notes |
|---------|--------|
| Shell commands | `help`, `status`, `time`, `grade`, `leave`, `clear`, … |
| Tab completion | Commands and wizard answers |
| ↑↓ history | Persisted in the browser (no `history` list command) |
| **+** New Test | Extra terminal to `run` editor code (try with a temp `main`) |
| **▭** Split | Side-by-side terminals |
| **×** Kill | Close a terminal tab |

### Anti-cheat (practice realism)

- No paste / drop into the exam editor
- Grade checks for forbidden libc usage vs allowed functions

Sessions are stored under `web/.exam-sessions/` (local).

---

## API (overview)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/curriculum` | GET | Curriculum tree |
| `/api/file?path=` | GET | File contents |
| `/api/compile-run` | POST | Compile & run C (`code`, `stdin`, `args`) |
| `/api/exam/...` | * | Start / resume / grade / abandon exam sessions |

Temp compile artifacts live in `web/.tmp/` and are cleaned periodically.

---

## Scripts

```bash
npm start    # node server.js
npm run check
```

---

## Safety note

Execution is **local gcc**, not a hardened public sandbox. Use on trusted machines for teaching and self-study only.

Back to the curriculum overview: [../README.md](../README.md).
