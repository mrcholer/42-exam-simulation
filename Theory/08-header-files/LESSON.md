# Header Files

> **1337 Piscine — Theory 08**  
> Phase 0, Day 4 · Headers declare what exists; `.c` files define how it works.

---

## Definition

A **header file** (`.h`) is a text file containing **declarations** — function prototypes, type definitions, macros, and constants — that other source files can share via `#include`.

| File type | Contains |
|-----------|----------|
| **`.h` header** | Declarations (names, types, signatures) — the "table of contents" |
| **`.c` source** | Definitions (actual function bodies, global variable storage) |

```c
// libft.h — declaration
int ft_strlen(char *str);

// ft_strlen.c — definition
int ft_strlen(char *str) { /* body */ }
```

//! Important: `#include "libft.h"` does **not** link code. It only **pastes text** before compilation. The linker still needs `.o` files or libraries.

---

## Why This Concept Exists

Large programs split across many `.c` files. Each file needs to know:

- What functions exist elsewhere.
- What types and constants mean.
- Function **signatures** (name, return type, parameters) to compile calls correctly.

Without headers, you would copy-paste declarations everywhere — one change breaks everything. Headers provide a **single shared contract**.

The preprocessor (Lesson 06) implements `#include` **before** the compiler runs.

---

## Real Life Analogy

### Restaurant menu vs kitchen recipe

| Menu (header `.h`) | Kitchen recipe book (`.c`) |
|--------------------|----------------------------|
| "Burger — beef, bun, cheese" | Exact steps, temperatures, timing |
| Tells you **what** you can order | Shows **how** it is made |
| Front of house | Back of house |

Customers (other `.c` files) read the menu. They do not need the full recipe — only what the dish is called and what it returns (a burger).

### Table of contents

The header is the **table of contents** of your library. The `.c` files are the **chapters**.

---

## Visual Explanation

### `#include` expansion (preprocessor)

```
Before preprocessing — main.c:
┌─────────────────────────────┐
│ #include "libft.h"          │
│ int main(void) {            │
│     ft_strlen("hi");        │
│ }                           │
└─────────────────────────────┘

After preprocessing — main.i (conceptual):
┌─────────────────────────────┐
│ /* entire contents of libft.h pasted here */
│ int ft_strlen(char *str);   │
│ int main(void) {            │
│     ft_strlen("hi");        │
│ }                           │
└─────────────────────────────┘
```

The compiler then sees **one big file** — it does not magically find `.c` files from `#include`.

### Two include styles

```
#include <stdio.h>      → system / standard library paths
#include "libft.h"      → project paths (often current dir or -I path)
```

---

## ASCII Diagrams

### Project structure (typical 1337 libft preview)

```
project/
├── includes/
│   └── libft.h          ← declarations for all ft_* functions
├── srcs/
│   ├── ft_strlen.c      ← definitions
│   └── ft_strcpy.c
└── main.c               ← #include "libft.h"
```

Compile:

```
main.c  ──includes──► libft.h (declarations)
   │                      ▲
   └── calls ft_strlen ───┘ (compiler checks signature)

ft_strlen.c ──defines──► ft_strlen body ──► ft_strlen.o
main.c ──► main.o
linker: main.o + ft_strlen.o ──► program
```

### Include guard pattern

```c
#ifndef LIBFT_H
# define LIBFT_H

/* declarations */

#endif
```

Prevents double-pasting if multiple headers include each other.

---

## Memory Diagrams

Headers do not allocate runtime memory by themselves. They may **declare** types that affect memory layout:

```c
// header declares:
typedef struct s_point
{
    int x;
    int y;
} t_point;
```

When a `.c` file uses `t_point p;`:

```
Stack RAM (later lesson):
Address     Variable    Size
0x7FFC00    p.x         4 bytes (int)
0x7FFC04    p.y         4 bytes (int)
```

//? Question: Does `#include` copy function **code** into your `.c`?  
// NOTE: No — only **text** (declarations). Code comes from compiling other `.c` files and **linking**.

---

## Examples

### Example 1: Minimal header

```c
/* add.h */
#ifndef ADD_H
# define ADD_H

int add(int a, int b);

#endif
```

```c
/* main.c */
#include "add.h"

int main(void)
{
    int result = add(2, 3);
    (void)result;
    return (0);
}
```

```c
/* add.c */
#include "add.h"

int add(int a, int b)
{
    return (a + b);
}
```

### Example 2: Standard header `<unistd.h>`

```c
#include <unistd.h>

/* preprocessor pastes declarations for write(), read(), etc. */
/* implementation lives in C library — linked automatically */
```

### Example 3: Curriculum Day 4 — trace expansion

```bash
gcc -E main.c | less
```

Scroll and see where `libft.h` content appears inline.

---

## Wrong Examples

### Wrong: Put function bodies in headers (early 1337 habit)

```c
/* bad.h */
int double_it(int x)
{
    return (x * 2);    /* definition in header — causes problems in multi-file projects */
}
```

// WARNING: Multiple `.c` files including this can cause **duplicate symbol** linker errors.

### Wrong: `#include` a `.c` file

```c
#include "ft_strlen.c"   /* NEVER — compile .c separately, link .o */
```

### Wrong: Missing header in one file

```c
/* file2.c — no include */
int len = ft_strlen("hi");  /* compiler error: implicit declaration */
```

### Wrong: Mismatch declaration vs definition

```c
/* header */  int ft_strlen(char *str);
/* .c file */ int ft_strlen(int *str) { ... }   /* linker or undefined behavior */
```

---

## Correct Examples

### Correct: Header guard + prototype only

```c
#ifndef LIBFT_H
# define LIBFT_H

int ft_strlen(char *str);
char *ft_strcpy(char *dest, char *src);

#endif
```

### Correct: Include what you use

```c
/* ft_strlen.c */
#include "libft.h"

int ft_strlen(char *str)
{
    /* implementation */
}
```

### Correct: One header per project module (C08/C09 pattern)

Shared `libft.h` lists all public functions. Private helpers stay static in `.c` only (Lesson 38 preview).

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Header without include guards | Use `#ifndef` / `#define` / `#endif` |
| Declaring in `.c` but not `.h` | Other files cannot call your function |
| Circular includes (`a.h` ↔ `b.h`) | Forward declarations, restructure |
| Forgetting `-I` path | `gcc -I includes ...` |
| Thinking `#include` = linking | Must compile and link `.c` files too |

---

## Best Practices

1. **Headers declare; `.c` files define.**
2. **Always use include guards** (or `#pragma once` if allowed).
3. **Keep headers minimal** — only what other files need.
4. **Match prototypes exactly** between `.h` and `.c`.
5. **Trace with `gcc -E`** once per project to demystify preprocessing.

---

## STOP — Think

1. What is the difference between a declaration and a definition?
2. What stage processes `#include` — compiler or preprocessor?
3. Why is `ft_strlen.o` still needed after `#include "libft.h"`?

---

## LIVE DEMO — Meeting Block

**Curriculum Day 4 — trace `#include` expansion**

| Step | Action |
|------|--------|
| 1 | Create tiny `greet.h` with one prototype |
| 2 | `gcc -E main.c > expanded.txt` |
| 3 | Find pasted header in `expanded.txt` |
| 4 | Explain to peer: pasted text vs linked object |
| 5 | Draw compile + link diagram with header role labeled |

---

## Mini Quiz

1. What file extension is a header?
2. What does `#include` do in one sentence?
3. What is an include guard for?
4. `<unistd.h>` vs `"libft.h"` — typical search difference?
5. Can you run a program with only a header? Why?

---

## Interview Questions

1. Declaration vs definition — give examples.
2. Explain `#include` to someone who knows only `.c` files.
3. What is a prototype?
4. Why not put all code in one `.c` file forever?
5. What linker error happens if declaration and definition mismatch?

---

## Homework

1. Split one small program into `main.c`, `ops.h`, `ops.c`.
2. Run `gcc -E` and highlight pasted header lines.
3. Add include guard — include same header twice, confirm no duplicate errors.
4. Draw project diagram: arrows for include vs link.

---

## Extra Challenge

Research **forward declaration**: declare `struct s_node;` without full struct in header.  
Write when you need full struct definition in header vs pointer only (preview linked lists).

---

## Summary

- **Headers (`.h`)** share **declarations** across source files.
- **`#include`** pastes header text at compile time (preprocessor).
- **Definitions** live in **`.c` files** and become **`.o`** objects linked together.
- **Include guards** prevent duplicate pasting.
- Headers are the **contract**; `.c` files are the **implementation**.

---

## Cheat Sheet

| Syntax | Meaning |
|--------|---------|
| `#include <h>` | System header search |
| `#include "h"` | Project header search |
| `#ifndef / #define / #endif` | Include guard |
| `int foo(int x);` | Function prototype (declaration) |
| `int foo(int x) { }` | Function definition (usually in `.c`) |

**Pipeline role:** preprocessor pastes headers → compiler sees declarations → linker resolves definitions in `.o`

---

## Useful Tips

//* If compiler says "implicit declaration" — missing or wrong `#include`.  
//* If linker says "undefined reference" — missing `.o` or library, not missing include alone.  
// NOTE: Lesson 09 covers libraries built from many `.o` files.  
// WARNING: Never submit `#include` of `.c` in 1337 projects.

---

**Previous:** [07 — GCC](../07-gcc/LESSON.md) · **Next:** [09 — Libraries](../09-libraries/LESSON.md)
