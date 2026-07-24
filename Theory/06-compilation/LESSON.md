# Compilation

> **1337 Piscine — Theory 06**  
> Phase 0, Day 3 · From human-readable C to machine instructions the CPU can run.

---

## Definition

**Compilation** is the process of **translating source code** (text you write, like `.c` files) into **machine code** (binary instructions the CPU understands), usually through several **stages** involving intermediate files.

| Stage | Input | Output | What happens |
|-------|-------|--------|--------------|
| **Preprocessing** | `.c` | expanded `.c` | `#include`, `#define` handled |
| **Compilation** | expanded `.c` | `.o` object file | C → assembly → machine code |
| **Linking** | `.o` + libraries | executable | Combine pieces, resolve symbols |

//! Important: The CPU never sees your `.c` file. It only sees the **final executable** after compilation and linking.

---

## Why This Concept Exists

Humans cannot efficiently write billions of 0s and 1s. We write **C** (readable). The **compiler** bridges the gap:

1. **Catch errors early** — syntax mistakes before running.
2. **Optimize** — rearrange instructions for speed/size.
3. **Target hardware** — same C can compile for different CPUs (with the right toolchain).
4. **Separate compilation** — build parts (`.o` files) and link later (projects, libraries).

At 1337, knowing **where** an error happens (preprocessor? compiler? linker?) saves hours of confusion.

---

## Real Life Analogy

### Translation and publishing a book

| Book process | Compilation |
|--------------|-------------|
| Author writes manuscript (English) | You write C source |
| Editor fixes grammar | Compiler reports syntax errors |
| Translator converts to another language | Compiler outputs machine code |
| Printer binds chapters + index | Linker combines `.o` + libraries into one executable |
| Reader reads final book | CPU runs final program |

You do not hand the reader your rough draft — you hand the **finished book**.

### Recipe → numbered factory steps

Source code = recipe in words.  
Machine code = numbered machine settings on industrial equipment.  
Compiler = engineer who converts recipe to machine settings.

---

## Visual Explanation

### Full pipeline

```
  hello.c
     │
     ▼  PREPROCESSOR (cpp)
  hello.i   ← stdio.h pasted in, macros expanded
     │
     ▼  COMPILER (cc1)
  hello.s   ← assembly (human-readable-ish mnemonics)
     │
     ▼  ASSEMBLER (as)
  hello.o   ← object file (machine code, not yet complete)
     │
     ▼  LINKER (ld)
  a.out     ← executable (ready to load into RAM)
     │
     ▼  LOADER (OS)
  Running in RAM → CPU fetch-decode-execute
```

### What each file "looks like" conceptually

```
hello.c     →  int main(void) { write(1, "Hi\n", 3); }
hello.s     →  mov ..., call write, ...
hello.o     →  010011010010... (binary blobs + symbol table)
a.out       →  complete program + metadata for OS
```

---

## ASCII Diagrams

### Separate compilation model

```
  file1.c ──► file1.o ──┐
                        ├──► linker ──► program
  file2.c ──► file2.o ──┤
                        │
  libft.a ──────────────┘   (library archive — Lesson 09)
```

Each `.c` can compile independently. Linker resolves `ft_strlen` used in one file but defined in another.

### Error stage map

```
Error message contains          Likely stage
──────────────────────          ────────────
"undefined reference to..."     LINKER
"syntax error"                  COMPILER
" No such file: stdio.h"        PREPROCESSOR / paths
"expected ';'"                  COMPILER
```

---

## Memory Diagrams

Compilation mostly touches **disk files**, not your program's runtime RAM. But the **result** defines what loads into RAM:

```
DISK after gcc hello.c -o hello

hello.c   ──source you edit
hello.o   ──optional intermediate (if -c used)
hello     ──executable bytes

When you run ./hello:

RAM layout (conceptual):
  Text segment   ← machine instructions from hello.o/linker
  Data segment   ← string "Hi\n", global values
  Stack/heap     ← created at runtime
```

//? Question: Is `hello.o` ready to double-click and run?  
// NOTE: Usually **no** on Unix — it may lack startup code and unresolved library links until linking.

### Symbol resolution (linking) mental model

```
file1.o says:  "I need function write at address ???"
libc.so says:  "write is at address X"
Linker fills in ??? → X in final executable
```

---

## Examples

### Example 1: One-command compile (full pipeline)

```bash
gcc hello.c -o hello
```

Hidden steps: preprocess → compile → assemble → link.

### Example 2: Stop at object file

```bash
gcc -c hello.c -o hello.o
```

Stops after assembler. **No linking yet.** Useful for multi-file projects.

### Example 3: Inspect stages (curriculum Day 3)

```bash
gcc -E hello.c -o hello.i    # preprocessor only
gcc -S hello.c -o hello.s    # assembly output
gcc -c hello.c -o hello.o    # object file
file hello.o                   # inspect type
```

// NOTE: Curriculum Day 3 asks you to compile `hello.c` and inspect the object file — use `file`, `ls -l`, maybe `nm hello.o`.

---

## Wrong Examples

### Wrong: "Compilation checks if my program logic is correct"

```
Compiler checks:
  ✓ syntax, many type errors, some obvious issues

Compiler does NOT guarantee:
  ✗ your algorithm is correct
  ✗ no infinite loops
  ✗ no runtime crashes from bad pointers
```

### Wrong: Running the `.c` file directly

```bash
./hello.c        # wrong — not executable (usually)
gcc hello.c && ./a.out   # correct path
```

### Wrong: Ignoring linker errors

```
$ gcc main.o -o prog
undefined reference to `ft_putchar'
→ compile succeeded for main.o, but LINK step failed
→ need to link libft or object containing ft_putchar
```

---

## Correct Examples

### Correct: Match error to stage

```
hello.c:3:1: error: expected ';'     → fix C syntax (compile stage)

/usr/bin/ld: undefined reference      → add .o or -l library (link stage)
```

### Correct: Understand `-c`

```bash
gcc -c a.c    # produces a.o only
gcc -c b.c    # produces b.o only
gcc a.o b.o -o prog   # link step combines
```

### Correct: Relate to CPU lesson

```
Compilation output = bytes that become CPU instructions in RAM text segment
```

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| One giant `gcc` without understanding stages | Run `-E`, `-S`, `-c` once to see outputs |
| Confusing compiler and linker | Compiler: `.c`→`.o`. Linker: `.o`→executable |
| Not using `-o name` | Default `a.out` — easy to run wrong program |
| Skipping warnings | Use `-Wall -Wextra -Werror` at 1337 |
| Thinking `#include` is "compiled separately" | Preprocessor **pastes** text before compile |

---

## Best Practices

1. **Learn the four stages** by name: preprocess, compile, assemble, link.
2. **Read error messages from bottom up** — first error often matters most.
3. **Use `-Wall -Wextra -Werror`** — warnings are future segfaults.
4. **Keep `.o` files organized** in multi-file projects (Makefile later).
5. **Connect compilation to Lesson 05** — output is CPU instructions.

---

## STOP — Think

1. Which stage handles `#include <stdio.h>`?
2. What is the difference between `hello.o` and `hello` (executable)?
3. An "undefined reference" error — compiler or linker?

---

## LIVE DEMO — Meeting Block

**Curriculum Day 3 — compile hello.c, inspect object file**

| Step | Command / action |
|------|------------------|
| 1 | Write minimal `hello.c` with `write()` |
| 2 | `gcc -c hello.c -o hello.o` |
| 3 | `file hello.o` — discuss output |
| 4 | `gcc hello.o -o hello` then `./hello` |
| 5 | Draw pipeline diagram from memory on whiteboard |

---

## Mini Quiz

1. Name the four compilation stages in order.
2. What file extension is a typical object file on Linux?
3. What tool combines `main.o` and `libft.a`?
4. Does the preprocessor execute your code?
5. What runs in RAM after `./program` — `.c` or executable bytes?

---

## Interview Questions

1. Explain compilation vs interpretation (Python/JS interpret — C compiles).
2. What is an object file?
3. Why separate compilation?
4. What happens during linking?
5. Where do `#define` macros go in the pipeline?

---

## Homework

1. Run all four stage commands (`-E`, `-S`, `-c`, link) on one small `.c` file.
2. Open `hello.s` — circle one line that looks like a CPU operation.
3. Draw the pipeline diagram from this lesson from memory.
4. Cause one compile error and one link error on purpose — save messages.

---

## Extra Challenge

Research **static vs dynamic linking** (preview Lesson 09).  
Write 6 sentences: when is code copied into the executable vs loaded at runtime?

---

## Summary

- **Compilation** translates C source into **machine code** through preprocessing, compiling, assembling, and linking.
- The **preprocessor** handles `#include` and macros.
- The **compiler** produces **object files** (`.o`).
- The **linker** builds the final **executable** from objects and libraries.
- Errors belong to **specific stages** — learn to read them.

---

## Cheat Sheet

| Flag / file | Purpose |
|-------------|---------|
| `.c` | Source code |
| `.i` | Preprocessed output (`gcc -E`) |
| `.s` | Assembly (`gcc -S`) |
| `.o` | Object file (`gcc -c`) |
| `a.out` / `-o name` | Executable |
| `gcc -c` | Compile only, no link |
| `gcc a.o b.o -o prog` | Link objects |
| `-Wall -Wextra -Werror` | Strict warnings |

**Pipeline:** `.c` → preprocess → compile → assemble → `.o` → link → executable

---

## Useful Tips

//* Fix compile errors before link errors — one stage at a time.  
//* `file` and `nm` are your friends for inspecting `.o`.  
// NOTE: Lesson 07 covers GCC commands in detail.  
// WARNING: At 1337, "it compiles" ≠ "it is correct" — always trace memory.

---

**Previous:** [05 — CPU](../05-cpu/LESSON.md) · **Next:** [07 — GCC](../07-gcc/LESSON.md)
