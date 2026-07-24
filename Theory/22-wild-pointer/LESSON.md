# Wild Pointer

> **Read this lesson completely before the related exercises.**

**Prerequisites:** Pointers (16), Null Pointer (20)  
**You will use this in:** Debugging mysterious segfaults, writing safe C from day one

---

## Definition

A **wild pointer** is a pointer that has **never been initialized** (or was corrupted) and therefore contains a **garbage address** — random bits left over in memory.

```c
int *p;      /* WILD — p contains whatever was on the stack */
*p = 5;      /* UNDEFINED — might segfault, might corrupt data */
```

Contrast:

| Pointer state | Value | Safe to dereference? |
|---------------|-------|----------------------|
| Valid | Known good address | Yes (if object alive) |
| NULL | 0 / null | No — predictable crash |
| Wild | Garbage | **Never** — unpredictable |
| Dangling | Old valid-looking address | No — object gone |

---

## Why This Concept Exists

Local variables are **not zeroed by default** in C (unless static, or you assign). The pointer variable is just memory — without initialization, it holds whatever bits were there before.

Knowing **wild pointers** explains crashes that "make no sense" and why `-Wall` warns about uninitialized variables.

---

## Real Life Analogy

A **GPS with no destination entered** might show coordinates from the last driver — a parking lot in another city. Following it blindly takes you somewhere random. **Initializing** the GPS is like `p = NULL` or `p = &x` before use.

---

## Visual Explanation

```
Stack slot for int *p (never assigned):

Address 3000: [ 0xDEADBEEF ]  ← random leftover bits
                ^
                |
                p points WHO KNOWS WHERE

Dereference *p → segfault OR silent corruption
```

---

## ASCII / Memory Diagrams

### Uninitialized local

```
void foo(void)
{
	int *p;        /* wild */
	/* ... */
	if (p)         /* undefined — might appear "true" */
		*p = 1;
}
```

### Proper initialization paths

```
int x;
int *p = &x;     /* valid — points to x */

int *q = NULL;   /* valid state — empty, checkable */

int *r = malloc(sizeof(int));  /* valid if malloc OK */
if (r)
	*r = 0;
```

### Wild vs NULL vs dangling

```
WILD:      p = ????????     never set
NULL:      p = 0            intentionally empty
DANGLING:  p = 0x1000       object at 1000 is dead
VALID:     p = 0x1000       object at 1000 is alive
```

---

## Examples

### Correct Example

```c
#include <stdlib.h>

int main(void)
{
	int  value;
	int *p;

	p = &value;       /* always initialize before use */
	value = 0;
	*p = 42;

	p = NULL;         /* reset when done */

	p = malloc(sizeof(int));
	if (p == NULL)
		return (1);
	*p = 7;
	free(p);
	p = NULL;
	return (0);
}
```

### Wrong Example

```c
void crash_prone(void)
{
	int *p;
	/* WRONG: p is wild */
	write(1, "?", 1);
	*p = 'X';    /* undefined */
}

void maybe_hide_bug(int *p)
{
	/* WRONG: caller might pass wild pointer */
	*p = 0;
}

int main(void)
{
	int *q;
	maybe_hide_bug(q);   /* q wild — disaster */
	return (0);
}
```

---

## STOP / THINK

> **STOP** — Answer on paper first.

> **THINK** —
> 1. Why might `if (p)` fail to protect you when `p` is wild?
> 2. Are global pointers wild at startup?
> 3. What does `int *p = 0;` give you — wild or NULL?
> 4. Heap memory from malloc — wild or zeroed?

**Answers:** (1) Garbage may be non-zero — looks "valid". (2) Static/global zero-init → NULL if not assigned. (3) NULL. (4) malloc uninitialized — contents wild; pointer itself valid if malloc succeeded.

---

## Common Mistakes

1. Declaring `int *p;` and dereferencing later
2. Passing uninitialized pointer to functions
3. Assuming all pointers default to NULL (only static/global)
4. Partial initialization in branches — use path leaves `p` wild
5. Reading freed memory thinking pointer is NULL (that's dangling, not wild)

---

## Best Practices

- **Initialize every pointer** at declaration: `int *p = NULL;`
- Set pointer when you know target: `p = &x` or `p = malloc(...)`
- Never read `*p` until assignment path is proven
- Enable `-Wall -Wextra -Wuninitialized`
- On failure paths, set `p = NULL` before return

---

## Mini Quiz

1. Wild pointer vs dangling pointer?
2. Why is wild pointer behavior "undefined"?
3. Does `calloc` leave pointer wild or memory wild?
4. Local vs static uninitialized pointer?

---

## Interview Questions

1. How would you explain wild pointer to a beginner?
2. Why doesn't C auto-init locals to NULL?
3. Static analysis tools for uninitialized use?
4. Defensive patterns in public API functions?

---

## Homework

1. Write three-line program that crashes from wild pointer — predict, then run.
2. Fix it with initialization only.
3. List initialization rules for stack/static/heap pointers.

---

## Extra Challenge

Audit a small function: every pointer declaration must have immediate initializer or NULL.

---

## Summary

**Wild pointers** are uninitialized — they aim at random memory. Always assign `NULL` or a valid address before use. They are the easiest pointer bug to prevent and the hardest to debug if ignored.

---

## Cheat Sheet

| State | Init | Deref |
|-------|------|-------|
| Wild | None | Never |
| NULL | `= NULL` | Check first |
| Valid | `&x` / malloc | OK if alive |
| Dangling | Was valid | Never |

---

## Useful Tips

//* Rule: no bare `int *p;` without immediate `=`  
//* NULL is your default until you have a real address  
//* If crash location jumps randomly, suspect wild pointer  
//* Compiler warnings are free bug detectors — enable them  
//* Teach peers: "pointer = address, must be chosen"
