# Memory Layout

> **Read this lesson completely before the related exercises.**

**Prerequisites:** Stack (27), Heap (28), RAM (04)  
**You will use this in:** Debugging, understanding globals, segfaults, entire C07+

---

## Definition

**Memory layout** describes how a running program's virtual memory is **organized into segments**: text (code), data, BSS, heap, and stack.

| Segment | Holds | Lifetime |
|---------|-------|----------|
| **Text** | Machine code (your functions) | Program duration |
| **Data** | Initialized globals/statics | Program duration |
| **BSS** | Zero-initialized globals/statics | Program duration |
| **Heap** | Dynamic allocations (malloc) | Until free |
| **Stack** | Locals, call frames | Function scope |

```c
int global_init = 5;      /* Data segment */
int global_zero;          /* BSS — starts as 0 */
int main(void) {
	int local = 3;        /* Stack */
	static int s = 0;     /* Data/BSS depending init */
	char *h = malloc(4);  /* pointer local on stack, block on heap */
	return (0);
}
```

---

## Why This Concept Exists

When you debug "where did this value come from?" or "why segfault here?", segment knowledge tells you **lifetime** and **validity**. It connects hardware RAM, OS virtual memory, and C variables into one map.

1337 exams love "draw memory layout" questions.

---

## Real Life Analogy

A **building floor plan**:

- **Lobby instructions** (text) — how to behave, fixed blueprint
- **Filing cabinets with labels** (data) — pre-filled forms
- **Empty labeled cabinets** (BSS) — reserved, start empty
- **Self-storage units** (heap) — rent on demand
- **Desk trays** (stack) — daily work, cleared each evening

---

## Visual Explanation

```
Typical process layout (addresses illustrative):

0xFFFFFFFF  ┌─────────────────┐
            │      Stack      │  local vars, frames
            │        ↓        │
            │     (free)      │
            │        ↑        │
            │      Heap       │  malloc blocks
0x08000000  ├─────────────────┤
            │      BSS        │  uninitialized static
            │      Data       │  initialized static/global
            │      Text       │  program code (read-only)
0x08048000  └─────────────────┘
```

Exact addresses vary — **relative structure** is what you must know.

---

## ASCII / Memory Diagrams

### One program snapshot

```
TEXT:  main(), ft_putchar(), ...

DATA:  global_init = 5
       static int count = 10;

BSS:   global_zero = 0 (implicit)

HEAP:  [ block A: strdup ]
       [ block B: int array ]

STACK: main: int i; char *p → points to heap block A
       ft_strlen frame: ...
```

### String literals

```c
char *s = "hello";
```

```
DATA/RO segment:  'h' 'e' 'l' 'l' 'o' '\0'  (often read-only)
STACK:  s ───────────────^ (pointer variable on stack)
```

Modifying `s[0] = 'H'` may crash — literal in read-only segment.

---

## Examples

### Correct Example

```c
#include <stdlib.h>

int g_initialized = 100;   /* Data */
int g_bss;                  /* BSS → 0 at start */

void demo(void)
{
	int         local = 1;           /* Stack */
	static int  persistent = 0;        /* Static storage — not stack */
	int        *heap_int;

	persistent++;
	heap_int = malloc(sizeof(int));
	if (heap_int)
	{
		*heap_int = 42;
		free(heap_int);
	}
	(void)local;
	(void)g_initialized;
	(void)g_bss;
}
```

### Wrong Example

```c
char *get_lit(void)
{
	return ("immutable");  /* OK pointer */
}

void break_lit(void)
{
	char *s = "hello";
	s[0] = 'H';   /* WRONG: undefined — literal may be read-only */
}

int big_stack(void)
{
	int arr[1000000];   /* WRONG: likely stack overflow */
	return (arr[0]);
}
```

---

## STOP / THINK

> **STOP** — Classify each variable.

> **THINK** — For:
```c
int a = 1;
int b;
static int c;
void f(void) { int d; static int e; char *p = malloc(1); }
```
> Match a,b,c,d,e,p and *p to segment/lifetime.

**Answers:** a→Data; b→BSS (if global) or stack (if inside f — here global BSS); c→static storage; d→stack; e→static storage; p→stack variable, *p→heap.

*(Clarify: if a,b at file scope, a=Data, b=BSS; d stack, e static, p stack, heap block.)*

---

## Common Mistakes

1. Putting huge arrays on stack
2. Modifying string literals
3. Confusing static local with stack local
4. Thinking malloc lives on stack (pointer does, block doesn't)
5. Ignoring read-only text segment

---

## Best Practices

- Draw five regions when teaching any bug
- Ask segment + lifetime for every variable
- Large buffers → heap
- Treat string literals as read-only
- Use `size` tool on binaries (advanced curiosity)

---

## Mini Quiz

1. Where does program code live?
2. Uninitialized global int starts as?
3. Where is malloc'd memory?
4. String literal "abc" — where stored?

---

## Interview Questions

1. Sketch process memory map.
2. Stack vs heap — speed and lifetime?
3. Why BSS exists separately from Data?
4. What is virtual memory (one sentence)?

---

## Homework

1. Draw full map for a 20-line program with global, local, malloc.
2. Label text/data/bss/heap/stack on your C07 strdup.
3. Explain read-only segfault on literal modify.

---

## Extra Challenge

Run `nm` or read symbol table — identify text vs data symbols.

---

## Summary

**Memory layout** splits program memory into code, globals, heap, and stack. Every variable lives in exactly one place with a defined lifetime. This map is your lens for all pointer and allocation bugs.

---

## Cheat Sheet

| Segment | What |
|---------|------|
| Text | Code |
| Data | Init globals/static |
| BSS | Zero-init globals |
| Heap | malloc |
| Stack | Locals, frames |

---

## Useful Tips

//* Two questions: WHERE and HOW LONG  
//* Globals survive entire program — locals don't  
//* Pointer on stack can point to heap — common pattern  
//* Literals ≠ writable arrays  
//* Draw layout before every C07 exercise
