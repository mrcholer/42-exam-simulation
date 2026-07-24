# Poolers — Premium 1337 Piscine Curriculum

> **You will not memorize code here. You will understand why every line exists.**

**Poolers** is a university-grade programming course built for live teaching at **1337 / 42 School**. It takes students from absolute zero to deep systems understanding — with lessons, quizzes, reference code, and a local website where you can **browse, run, quiz, and practice exams**.

---

## What is this repository?

Two things live together:

1. **The curriculum** — Theory, Shell, C00–C13, Rush, Exam prep (markdown lessons + quizzes + commented `source.c`)
2. **The website** (`web/`) — a local Node app that turns that curriculum into an interactive playground and a 42-style exam shell

| Piece | What you get |
|-------|----------------|
| `Theory/`, `C00/`… | Lessons, quizzes, reference solutions for mentors & students |
| `http://localhost:3847/` | **Playground** — browse files, edit, run with gcc, step, quiz |
| `http://localhost:3847/exam` | **Exam Shell** — timed practice exams like examshell |

---

## Philosophy

| Principle | What it means for you |
|-----------|----------------------|
| **WHY before HOW** | Every concept starts with purpose, not syntax |
| **Memory first** | We draw RAM, stack, and heap constantly |
| **No magic** | Compilers, OS, and hardware are explained |
| **Active learning** | STOP / THINK / LIVE DEMO blocks in every lesson |
| **Zero assumptions** | If you can read English, you can start here |

Inspired by Harvard CS50, MIT OCW, Stanford CS106B, K&R, TLPI, CS:APP, and Clean Code.

---

## The website (explained)

Start the server once, then use two pages.

### Requirements

- **Node.js** 18+
- **GCC** (MinGW on Windows) — same toolchain you use for the Piscine

### Start

```bash
cd web
npm install
npm start
```

Then open:

| URL | Page |
|-----|------|
| [http://localhost:3847/](http://localhost:3847/) | Playground |
| [http://localhost:3847/exam](http://localhost:3847/exam) | Exam Shell |

Code compiles and runs **on your machine** via gcc (local learning tool — not a public multi-tenant sandbox).

---

### 1. Playground — learn & experiment

The main site is a VS Code–like workspace wired to this repo.

**Sidebar**

| Tab | Purpose |
|-----|---------|
| **Browse** | Full curriculum tree (`Theory`, `Shell00`, `C00`…) |
| **C Files** | Flat list of every `.c` file — filter by module |
| **Quizzes** | All `QUIZ.md` files → interactive Quiz mode |
| **Scratch** | Temporary C files with save history (practice without touching exercises) |

**Editor**

- Open several files in tabs
- On a `.c` file: **Lesson** / **Quiz** / **Cheat** companions
- Markdown modes: **Edit · Preview · Split · Quiz**

**Actions**

| Button | What it does |
|--------|----------------|
| **Run** (`Ctrl+Enter`) | `gcc` compile + execute; shows stdout/stderr |
| **Step** | Educational line-by-line trace + memory panel |
| **Norme** | Run norminette on the current C file (if installed) |
| **Done** | Mark progress (saved in the browser) |
| **Exam** | Jump to the Exam Shell |

**How students typically use it**

1. Open `Theory/…/LESSON.md` or an exercise `LESSON.md`
2. Open `QUIZ.md` → switch to **Quiz** mode and answer without peeking
3. Open `source.c`, predict output, then **Run** or **Step**
4. Use **Scratch** to try ideas before writing a real rendu

---

### 2. Exam Shell — practice like the real exam

A separate page that mimics **42 examshell** for local practice.

**Flow**

1. Open `/exam`
2. Type `examshell` (or `start exam00 hard`)
3. Pick exam + difficulty → timer starts (**4h** for exam00–02, **8h** for final)
4. Workspace opens: **rendu** editor (left) + **subject** (right) + terminal (bottom)
5. Type your solution by hand → `grade` / `grademe` (or Ctrl+Enter)
6. Clear levels to unlock the next (**~116** subjects · 2 random per level · harder from L5+ by difficulty)

**Terminal**

- Commands such as `help`, `status`, `time`, `grade`, `leave`, `clear`
- Tab completion and ↑↓ command recall (saved locally)
- Extra **Test** tabs (`+`) to compile/run with a temporary `main` before grademe
- Split / kill tabs like a simple VS Code terminal

**Practice rules (anti-cheat for realism)**

- Paste and drop into the editor are blocked — type by hand
- Forbidden functions vs the subject’s allowed list are checked on grade

Use this for **timed rehearsal**, not as a replacement for understanding lessons in the Playground.

More detail: [web/README.md](web/README.md).

---

## How to use this repository

### For students

1. Start with **`Theory/`** — finish lessons before rushing into exercises  
2. Read each exercise’s **`LESSON.md`** (goal, visuals, common errors, practice)  
3. Try **`QUIZ.md`** in the Playground **Quiz** tab before opening `source.c`  
4. When stuck, re-read **Common Errors** in `LESSON.md`  
5. Use cheat sheets only after you understand the concept  
6. Rehearse under time pressure with **`/exam`**

### For mentors (meeting mode)

1. Open **`LESSON.md`** in Split view on a shared screen  
2. Use **STOP**, **THINK**, and **LIVE DEMO** blocks in `source.c`  
3. Run quizzes live from the Playground  
4. Use **Step** before **Run** — students predict memory and output first  
5. Never paste solutions — guide students to reason about memory

---

## Curriculum map

```
Theory/          ← START HERE (46 lessons)
    ↓
Shell00/         ← Git, terminal, first commands
Shell01/         ← Shell scripting
    ↓
C00/             ← First C programs, loops, conditions
C01/             ← Pointers (your first real superpower)
C02/             ← String manipulation
C03/             ← Comparisons, case conversion
C04/             ← String library from scratch
C05/             ← Math, recursion
C06/             ← argc, argv, sorting
C07/             ← Heap: malloc, strdup, join
C08/             ← Headers, Makefile, norms
C09/             ← libft (your standard library)
C10/             ← Linked lists
C11/             ← ft_printf, get_next_line
C12/             ← push_swap (algorithms)
C13/             ← philosophers (threads)
    ↓
Rush/            ← Team projects (48h)
Exam/            ← Exam preparation notes
```

Full week-by-week plan: [CURRICULUM.md](CURRICULUM.md)  
Mentor tips: [MENTOR_GUIDE.md](MENTOR_GUIDE.md)

---

## Every exercise contains

| File | Purpose |
|------|---------|
| `LESSON.md` | Full lesson: goal, algorithm, mentor notes, visuals, errors, practice, cheat sheet |
| `QUIZ.md` | MCQ, T/F, coding, memory, debug — open in Playground **Quiz** tab |
| `source.c` | Heavily commented reference (**study, don’t copy**) |

Some Theory topics also include a standalone `CHEATSHEET.md`.

---

## Theory lessons (complete before C00)

| # | Topic | Why it matters |
|---|-------|----------------|
| 01 | [How Computers Work](Theory/01-how-computers-work/LESSON.md) | Foundation of everything |
| 02 | [Binary](Theory/02-binary/LESSON.md) | How data is stored |
| 15 | [Arrays](Theory/15-arrays/LESSON.md) | Continuous memory |
| 16 | [Pointers](Theory/16-pointers/LESSON.md) | **Critical — read twice** |
| 26 | [argc & argv](Theory/26-argc-argv/LESSON.md) | Command-line programs |
| 27–33 | Stack, Heap, malloc, free | Dynamic memory |
| 43–46 | File descriptors, syscalls | Unix programming |

Full index: [Theory/README.md](Theory/README.md)

---

## Quick start (Day 1)

```bash
# 1. Clone
git clone <your-repo-url> poolers
cd poolers

# 2. First theory lesson
# Open Theory/01-how-computers-work/LESSON.md

# 3. Launch the website (recommended)
cd web
npm install
npm start
# → http://localhost:3847       Playground
# → http://localhost:3847/exam  Exam Shell

# 4. When ready for C (after Theory 01–14), or from the terminal:
cd ../C00/ex00
# Read LESSON.md, then:
gcc -Wall -Wextra -Werror source.c -o test
./test
```

---

## Meeting schedule suggestion (4 weeks)

| Week | Focus | Modules |
|------|-------|---------|
| 1 | Computer basics + Shell + C00 | Theory 01–14, Shell00–01, C00 |
| 2 | Pointers + Strings | Theory 15–22, C01–C04 |
| 3 | Memory + Projects | Theory 27–35, C05–C09 |
| 4 | Advanced C + Exam prep | C10–C13, Rush, Exam + `/exam` |

---

## Rules for learning (not cheating)

- **Do not submit `source.c` from this repo** — it is for learning only  
- Write your own code after understanding  
- If you copy, you fail the real exam — **understanding is the product**  
- Ask “what happens in memory?” before every line you write  
- Exam Shell blocks paste on purpose — practice typing under pressure  

---

## Contributing

Mentors: improve diagrams in `LESSON.md`, add real student mistakes to **Common Errors**, and expand `QUIZ.md` with questions from your sessions.

---

**Remember:** A programmer who understands memory can learn any language. A programmer who memorizes syntax will struggle forever.
