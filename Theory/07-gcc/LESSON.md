# GCC (GNU Compiler Collection)

> **1337 Piscine — Theory 07**  
> Phase 0, Day 3 · GCC is your main tool to turn C source into executables on Linux.

---

## Definition

**GCC** (GNU Compiler Collection) is the **compiler toolchain** on most Linux systems (including 1337 clusters) that implements the full pipeline: preprocessing, compiling, assembling, and linking — primarily invoked through the `gcc` command (which for C often calls `cc1`, `as`, and `ld` behind the scenes).

```bash
gcc [options] source.c -o output_name
```

//! Important: At 1337 you compile with **`gcc`**, not `g++` (C++), unless specified. Your C standard is often **`-std=c99`** or project rules.

---

## Why This Concept Exists

Every student needs a **reliable, standard way** to:

1. Turn `.c` files into runnable programs.
2. Enable **warnings** that catch bugs early.
3. Control **optimization** and **debug symbols**.
4. Link **libraries** and multiple object files.

GCC is the shared language of Moulinette, peers, and documentation. Mastering its flags prevents mysterious build failures during C00–C13.

---

## Real Life Analogy

### Swiss Army knife for building programs

| Tool part | GCC role |
|-----------|----------|
| Blade | Compile single file |
| Scissors | Preprocess (`-E`) |
| Screwdriver | Link objects (`gcc a.o b.o`) |
| Corkscrew | Include paths (`-I`) and libraries (`-l`) |

One command name, many jobs — depending on flags and file types you pass.

### Factory control panel

- **`-o hello`** = label the output box  
- **`-Wall`** = turn on quality sensors  
- **`-g`** = attach blueprint for debugger  
- **`-c`** = stop after partial assembly line  

---

## Visual Explanation

```
                    gcc command
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    preprocessor      compiler        linker
     (cpp)            (cc1+as)          (ld)
         │               │               │
         ▼               ▼               ▼
      hello.i          hello.o         hello
```

When you type `gcc main.c -o prog`, GCC orchestrates the whole chain unless `-c` stops early.

---

## ASCII Diagrams

### Typical 1337 compile line

```
┌────────────────────────────────────────────────────────────┐
│  gcc -Wall -Wextra -Werror  main.c  -o  main               │
│       │                      │            │                 │
│       │                      │            └── output name   │
│       │                      └── source file                │
│       └── treat warnings as errors (mandatory habit)        │
└────────────────────────────────────────────────────────────┘
```

### Multi-file project (preview)

```
  src/main.c  ──┐
  src/utils.c ──┼──► gcc -c ... ──► *.o ──► gcc *.o -o prog
                │
  includes/     └── -I includes for #include "libft.h"
```

---

## Memory Diagrams

GCC itself runs as a **program in RAM** while compiling. Your **source variables do not exist yet** — only the compiler's internal data structures.

After successful compile + run:

```
Your source said:  int x = 42;

After ./a.out runs:
  RAM contains runtime layout — x lives at some stack address
  (assigned by compiled code + OS loader, not by GCC interactively)
```

//? Question: Does `gcc` execute `int main` while compiling?  
// NOTE: **No.** It **generates code** that will run later. Compile time ≠ run time.

### Debug symbols (`-g`)

```
Without -g:  debugger sees machine code, limited line mapping
With -g:     extra metadata links machine instructions ↔ source lines
             (stored in executable on disk, used when debugging)
```

---

## Examples

### Example 1: Minimal compile

```bash
gcc hello.c -o hello
./hello
```

### Example 2: 1337-standard strict compile

```bash
gcc -Wall -Wextra -Werror hello.c -o hello
```

// WARNING: `-Werror` turns warnings into failures — fix all warnings.

### Example 3: Compile without linking

```bash
gcc -c ft_strlen.c -o ft_strlen.o
```

### Example 4: Curriculum inspection commands

```bash
gcc -c hello.c -o hello.o
file hello.o
ls -l hello.o
nm hello.o          # list symbols (function names) in object
```

### Example 5: Show assembly

```bash
gcc -S hello.c -o hello.s
```

### Example 6: Include path for headers

```bash
gcc -I includes -Wall -Wextra -Werror src/main.c -o main
```

---

## Wrong Examples

### Wrong: Using forbidden functions without flags mattering

```c
#include <stdio.h>
printf("hi\n");    // often forbidden in early 1337 exercises
```

GCC may compile, but **Moulinette / norm** fails you. GCC is not the only judge.

### Wrong: Ignoring warnings

```bash
gcc main.c -o main
main.c:5: warning: implicit declaration of function 'foo'
# Program still builds — bug waiting at runtime
```

### Wrong: Link order confusion (advanced preview)

```bash
gcc -lft main.c -o main    # may fail — library before object sometimes matters
gcc main.c -lft -o main    # try objects first, then -l flags
```

### Wrong: Compiling `.h` files

```bash
gcc libft.h -o libft    # headers are not compiled alone
gcc libft.c -c -o libft.o   # correct
```

---

## Correct Examples

### Correct: Habitual command template

```bash
gcc -Wall -Wextra -Werror myfile.c -o myprogram
```

### Correct: Split compile and link

```bash
gcc -Wall -Wextra -Werror -c a.c
gcc -Wall -Wextra -Werror -c b.c
gcc -Wall -Wextra -Werror a.o b.o -o prog
```

### Correct: Check exit code

```bash
gcc hello.c -o hello
echo $?    # 0 means success
```

---

## Common Mistakes

| Mistake | Solution |
|---------|----------|
| Running `gcc` with no `-o` | Output is `a.out` — confusing with many programs |
| Not in correct directory | `gcc` needs path to `.c` file |
| Missing `-c` when building library `.o` files | Accidentally links incomplete executable |
| Forgetting `-lm` for math (`sin`, `sqrt`) | Link with `-lm` when allowed |
| Using C++ headers in C | Use C headers: `<unistd.h>`, not iostream |

---

## Best Practices

1. **Always** `-Wall -Wextra -Werror` at 1337.
2. **Name output** with `-o meaningful_name`.
3. **Use `-c`** for each `.c` in multi-file projects.
4. **Run `file`** on `.o` and executable once to learn formats.
5. **Keep compile commands** in Makefile later (C08) — same flags every time.

//* Tip: Alias or script your standard gcc line to avoid typos.

---

## STOP — Think

1. What does `-c` do?
2. What does `-o` do?
3. Why is `-Werror` valuable during learning?

---

## LIVE DEMO — Meeting Block

| Step | Action |
|------|--------|
| 1 | Compile `hello.c` with full warning flags |
| 2 | Introduce one warning (unused variable) — observe `-Werror` stop build |
| 3 | Fix and rebuild |
| 4 | Run `file` on executable and `.o` |
| 5 | Peer explains each flag in the command |

---

## Mini Quiz

1. What command produces `program.o` without linking?
2. What flag treats warnings as errors?
3. Default executable name if `-o` omitted?
4. Which flag adds debug symbols for gdb?
5. Does GCC run your program or only build it?

---

## Interview Questions

1. Difference between `gcc` and `clang`? (Both compilers; 1337 uses gcc)
2. Explain `-Wall`.
3. When do you need `-c`?
4. What is `nm` used for on `.o` files?
5. Compile-time vs run-time errors — examples?

---

## Homework

1. Write your **personal default gcc line** in notes — use it all week.
2. Compile one file with and without `-Wall` — compare message count.
3. Use `gcc -S` — find one instruction related to `write` or `return`.
4. Document what `file hello.o` prints on your system.

---

## Extra Challenge

Read `man gcc` sections on `-I`, `-L`, `-l`.  
Summarize in 8 lines how you would link a folder `libft` with `-L` and `-lft`.

---

## Summary

- **GCC** drives preprocessing, compilation, assembly, and linking via `gcc`.
- Use **`-Wall -Wextra -Werror`** and **`-o name`** every time at 1337.
- **`-c`** creates object files; linking combines them into executables.
- Inspection tools: **`file`**, **`nm`**, **`-S`** for assembly.
- GCC builds the program; the **OS loader + CPU** run it.

---

## Cheat Sheet

| Flag | Effect |
|------|--------|
| `-o name` | Output executable name |
| `-c` | Compile only → `.o` |
| `-Wall -Wextra -Werror` | Strict warnings as errors |
| `-g` | Debug info |
| `-E` | Preprocessor only |
| `-S` | Assembly output |
| `-I dir` | Header search path |
| `-L dir` | Library search path |
| `-lname` | Link library `libname.a/so` |
| `-std=c99` | C standard (if required) |

```bash
gcc -Wall -Wextra -Werror source.c -o program
gcc -Wall -Wextra -Werror -c file.c
gcc -Wall -Wextra -Werror a.o b.o -o program
```

---

## Useful Tips

//* Read the **first** error GCC prints — later errors are often cascades.  
//* `echo $?` after gcc — non-zero means failure.  
// NOTE: Moulinette uses its own gcc invocation — match project rules.  
// WARNING: "Works on my machine" often means wrong flags or wrong files linked.

---

**Previous:** [06 — Compilation](../06-compilation/LESSON.md) · **Next:** [08 — Header Files](../08-header-files/LESSON.md)
