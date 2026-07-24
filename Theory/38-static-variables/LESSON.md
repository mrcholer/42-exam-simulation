# Static Variables

> **Read this lesson completely before the related exercises.**

**Prerequisites:** Memory Layout (29), Functions (23)  
**You will use this in:** C11 GNL (static buffer), persistent counters, file-scope helpers

---

## Definition

**static** in C changes **lifetime** and/or **visibility**:

1. **Static local variable** — inside function: keeps value between calls, stored in static/data segment (not stack)
2. **Static global/function** — file scope: not visible to other translation units (internal linkage)

```c
void counter(void)
{
	static int count = 0;   /* initialized once, persists */
	count++;
}

static int helper(void)   /* only visible in this .c file */
{
	return (42);
}
```

Static locals are **zero-initialized** if you omit `= 0`.

---

## Why This Concept Exists

Sometimes you need **memory that survives** after function returns but is not heap (no malloc). Static locals give private persistent state — used in GNL to hold buffer between reads.

Static globals hide implementation details — core to multi-file projects (C08/C09).

---

## Real Life Analogy

A **notebook in your desk drawer** (static local) vs **sticky note on your keyboard** (stack local). Closing the laptop (function return) throws away sticky notes, but the drawer notebook stays for next session.

---

## Visual Explanation

```
void foo(void) {
	int a;              /* stack — fresh each call */
	static int b = 0;   /* static storage — one shared cell */
}

Call 1: a=?, b goes 0→1
Call 2: a=?, b goes 1→2  (a re-created, b remembers)
```

---

## ASCII / Memory Diagrams

### Memory segments

```
STACK (each foo call):     STATIC / DATA:
+----------------+         +----------------+
| int a (new)    |         | static int b   |  ← single instance
+----------------+         +----------------+
```

### Static global linkage

```
file1.c:  static int secret = 5;   /* only file1 sees name */
file2.c:  cannot link to secret    /* encapsulation */
```

---

## Examples

### Correct Example

```c
#include <unistd.h>

static void ft_putchar(char c)
{
	write(1, &c, 1);
}

int call_count(void)
{
	static int count;

	count++;
	return (count);
}

/* GNL-style idea (simplified concept) */
static char buffer[100];
static int  buf_pos;
static int  buf_len;
/* buffer persists between get_next_line calls */
```

### Wrong Example

```c
int *bad_static_ptr(void)
{
	static int x = 0;
	return (&x);   /* OK actually — static persists — NOT dangling */
	/* BUT returning static buffer pointer to caller who writes wildly is risky design */
}

void race_concept(void)
{
	static int shared;   /* NOT thread-safe — advanced warning */
	shared++;
}
```

---

## STOP / THINK

> **STOP** — Predict outputs across calls.

> **THINK** —
```c
void test(void) {
	int a = 1;
	static int b = 1;
	a++; b++;
}
```
> Called 3 times from main — what are a and b each time inside test?

**Answers:** `a` always 2 then destroyed conceptually each entry (starts 1 each call). `b` becomes 2, 3, 4 across calls.

---

## Common Mistakes

1. Confusing static local with global (scope still local to function)
2. Assuming static local re-inits each call
3. Thread safety ignored (C13 preview)
4. Overusing static when malloc or parameter is clearer
5. Static buffer too small in GNL — logic bugs

---

## Best Practices

- Use static local for **single-function persistent state** only
- Document static buffers clearly (GNL)
- Prefer passing state via struct/parameters when testable
- `static` on file functions — default for helpers in .c
- Initialize static locals explicitly for readability

---

## Mini Quiz

1. Where static local stored?
2. Initialized how many times?
3. static global vs static local scope?
4. Why GNL uses static?

---

## Interview Questions

1. Static local vs global variable?
2. Why static helper functions in libraries?
3. Reentrancy problem with static?
4. static in header file — danger?

---

## Homework

1. Write call_count demo — predict 5 calls.
2. Mark static vs stack on memory layout diagram.
3. Explain why static local address return isn't dangling.

---

## Extra Challenge

Sketch GNL buffer static vars and their roles.

---

## Summary

**Static variables** persist for program lifetime (locals) or hide symbols (file scope). They live outside the stack frame cycle — perfect for counters and persistent buffers, dangerous if abused for shared mutable state without care.

---

## Cheat Sheet

| Form | Lifetime | Visibility |
|------|----------|------------|
| static local | Program | Function only |
| static global | Program | Current file |
| auto local | Function call | Function |

---

## Useful Tips

//* static local = "remember me next call"  
//* Zero-init static if no = value  
//* GNL lesson ties here — revisit after C11  
//* static .c helpers = good libft hygiene  
//* Ask: could this static break reentrancy?
