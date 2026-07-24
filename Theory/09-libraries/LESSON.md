# Libraries

> **1337 Piscine — Theory 09**  
> Phase 0, Day 4 · A library is reusable compiled code you link into your program.

---

## Definition

A **library** is a collection of **precompiled object code** (functions and data) packaged so programs can **link** against it without recompiling every function from source each time.

| Type | File examples | When code joins your program |
|------|---------------|------------------------------|
| **Static library** | `libft.a` (archive of `.o` files) | At **link time** — copied into executable |
| **Dynamic (shared) library** | `libc.so`, `libm.so` | At **load/run time** — shared copy in memory |

```bash
gcc main.c -L. -lft -o program
# links libft.a or libft.so depending on what exists
```

//! Important: A library is **not** magic — it is organized **machine code** built from `.c` files, plus headers so you know what to call.

---

## Why This Concept Exists

Programs reuse the same tools millions of times:

- `write`, `read` → C standard library  
- `ft_strlen`, `ft_strcpy` → your **libft** (C09)

Benefits:

1. **Reuse** — write once, link everywhere.
2. **Faster builds** — recompile only changed `.c` files.
3. **Modularity** — hide implementation, expose API via headers.
4. **Smaller source** — `main.c` stays readable.

C09 asks you to build **libft** — this lesson is the theory behind that project.

---

## Real Life Analogy

### Toolbox vs building tools from scratch each day

| Without library | With library |
|-----------------|--------------|
| Forge a hammer every morning | Take hammer from toolbox |
| Slow, repetitive | Fast, consistent |

The **header** is the tool label ("hammer: hits nails").  
The **library** is the toolbox with real tools inside.  
**Linking** is grabbing the hammer when you need it.

### LEGO kit instruction booklet + brick bag

- **Header** = picture of available bricks (what shapes exist)
- **Library** = bag of actual bricks
- **Your program** = model you build using those bricks

---

## Visual Explanation

### Static linking

```
  ft_strlen.o ──┐
  ft_strcpy.o ──┼──► ar rcs libft.a ──► libft.a (archive)
  ft_strcmp.o ──┘                              │
                                               │
  main.o ──────────────────────────────────────┼──► linker ──► program
                                               │              (contains
                                               │               libft code
                                               │               inside)
```

Executable grows larger — libft code **copied in**.

### Dynamic linking

```
  libft.so stored on disk once
         │
         ▼ OS loader at runtime
  program A ──┐
  program B ──┼──► share one libft.so in RAM
  program C ──┘
```

Saves disk/RAM when many programs use same library.

---

## ASCII Diagrams

### How `-lft` finds `libft.a`

```
gcc ... -L./libft -lft -o prog

-L./libft  → search directory for libraries
-lft       → look for libft.a or libft.so
             (lib + name + .a/.so)

Order matters sometimes:
  gcc main.o -L. -lft -o prog
```

### libft project map (C09 preview)

```
libft/
├── libft.h              ← API declarations
├── Makefile             ← builds libft.a
├── ft_strlen.c ──► ft_strlen.o ──┐
├── ft_strcpy.c ──► ft_strcpy.o ──┼──► libft.a
└── ...                            │
                                   │
your project main.c ──► main.o ────┴──► link ──► a.out
```

---

## Memory Diagrams

After linking and running:

```
STATIC library linked executable:

RAM text segment may contain:
  main's machine code
  ft_strlen's machine code    ← copied from libft.a at link time
  ft_strcpy's machine code

DYNAMIC library:

RAM text segment:
  main's machine code
  PLT stubs → jump to libft.so already loaded in memory
```

//? Question: Where does `ft_strlen` **code** live at runtime — in the header?  
// NOTE: In **RAM executable text segment** (or shared library mapping) — header had zero executable bytes.

### Calling a library function

```
main calls ft_strlen("abc"):

1. CPU executes call instruction in main's code
2. Jumps to ft_strlen machine code (from libft)
3. ft_strlen reads bytes from string in RAM
4. Returns length in register / stack
5. Returns to main
```

---

## Examples

### Example 1: Create static library (concept)

```bash
gcc -c ft_strlen.c -o ft_strlen.o
gcc -c ft_strcpy.c -o ft_strcpy.o
ar rcs libft.a ft_strlen.o ft_strcpy.o
```

`ar` **archives** object files into `.a`.

### Example 2: Link against it

```bash
gcc main.c -L. -lft -o program
# or
gcc main.o -L. -lft -o program
```

Also need `#include "libft.h"` so compiler knows prototypes.

### Example 3: System libraries

```c
#include <unistd.h>
write(1, "Hi\n", 3);
```

`write` lives in **libc** — linked automatically by gcc in most cases.

Math functions may need:

```bash
gcc main.c -lm -o main
```

---

## Wrong Examples

### Wrong: Link without compiling library sources

```bash
gcc main.c -lft -o main
# error: undefined reference to ft_strlen
# forgot to build libft.a or wrong -L path
```

### Wrong: Include header but never link library

```c
#include "libft.h"
/* compiles fine — calls look valid */
/* linker fails — no ft_strlen object anywhere */
```

### Wrong: Duplicate symbols

```
libft.a has ft_strlen.o
you also compile ft_strlen.c into main.o
linker error: multiple definition of ft_strlen
```

### Wrong: Confusing `.a` with `.h`

```
libft.h  → declarations (text for compiler)
libft.a  → machine code (for linker)
Both needed for different stages
```

---

## Correct Examples

### Correct: Build libft then link

```bash
cd libft && make
cd ../project
gcc -Wall -Wextra -Werror main.c -L../libft -lft -o project
```

### Correct: Header + library + objects aligned

```
libft.h declares exactly functions present in libft.a
Makefile rebuilds .a when any .c changes
```

### Correct: Inspect library contents

```bash
nm libft.a          # list symbols (function names)
ar -t libft.a       # list member .o files
```

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Wrong `-L` path | Point to directory containing `libft.a` |
| `-lft` before object files | Put `.o` / `.c` before `-l` flags often |
| Forgetting `make` in libft | Build archive first |
| Prototype mismatch | Same signatures in `.h` and `.c` |
| Not using include guard in libft.h | Standard in all headers |

---

## Best Practices

1. **One public header** (`libft.h`) for your library API.
2. **Static helpers** stay inside `.c` files — not in header.
3. **Version your Makefile** — reproducible builds for Moulinette.
4. **Test library alone** before linking big project.
5. **Use `nm`** to verify expected symbols exist in `.a`.

---

## STOP — Think

1. Static vs dynamic — when is code copied into the executable?
2. Why does `#include "libft.h"` not replace `-lft`?
3. What tool creates `libft.a` from `.o` files?

---

## LIVE DEMO — Meeting Block

| Step | Action |
|------|--------|
| 1 | Build two `.o` files, archive with `ar rcs mini.a` |
| 2 | `ar -t mini.a` — list contents |
| 3 | Link small `main.c` with `-L. -lmini` |
| 4 | `nm mini.a` — find function symbols |
| 5 | Draw static link diagram on board |

---

## Mini Quiz

1. What is `libft.a`?
2. What does `-lft` tell the linker?
3. What does `-L` do?
4. Difference between `.h` and `.a`?
5. Name one system library used by `write()`.

---

## Interview Questions

1. Static vs dynamic libraries — pros/cons.
2. What happens at link time vs load time?
3. Why use libraries instead of one big `.c` file?
4. Explain `ar` and `.a` archives.
5. What is an API in the context of libft?

---

## Homework

1. Manually build a 2-function mini-library with `ar`.
2. Link it from separate `main.c` — document full gcc lines.
3. Run `nm` on your archive — explain 3 symbol lines.
4. Write paragraph: how C09 libft fits this model.

---

## Extra Challenge

Read about **`ranlib`** / index in archives (optional).  
Compare size of program linked static vs dynamic (high level — no deep ops).

---

## Summary

- **Libraries** package reusable **compiled code** (`.o` → `.a` or `.so`).
- **Headers** declare the API; **libraries** provide the implementation at link/load time.
- **Static linking** embeds code in the executable; **dynamic** shares one copy at runtime.
- **`gcc -L` + `-l`** tells the linker where and what to link.
- **libft (C09)** is your first hands-on library — master this theory first.

---

## Cheat Sheet

| Item | Role |
|------|------|
| `libft.h` | Declarations |
| `libft.a` | Static library archive |
| `libft.so` | Shared library |
| `ar rcs lib.a *.o` | Create static library |
| `-L path` | Library search directory |
| `-lname` | Link `libname.a/so` |
| `nm lib.a` | Show symbols |

**Remember:** preprocess (header) → compile → link (library)

---

## Useful Tips

//* Linker errors = missing `.o` in archive or wrong `-l`/`-L`.  
//* Compiler errors = missing/wrong header or C syntax.  
// NOTE: C08 Makefile automates library builds — same concepts.  
// WARNING: Do not mix duplicate function definitions across project and libft.

---

**Previous:** [08 — Header Files](../08-header-files/LESSON.md) · **Next:** [10 — Variables](../10-variables/LESSON.md)
