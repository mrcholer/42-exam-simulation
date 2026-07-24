# Undefined Behavior

> **Read this lesson completely before the related exercises.**

**Prerequisites:** Segmentation Fault (34), Pointers (16)  
**You will use this in:** Understanding why "it worked on my machine" fails exams

---

## Definition

**Undefined behavior (UB)** means the C standard places **no requirements** on what happens if your program does certain illegal things. Anything may occur: crash, wrong output, apparent success, or demons flying out of your nose (meme — but literally unpredictable).

Examples:

- Out-of-bounds array access
- Signed integer overflow
- Dereference invalid pointer
- Use-after-free
- Uninitialized variable read
- Missing return in non-void function
- Modifying string literal

**Implementation-defined** and **unspecified** are related but have tighter rules — UB is the worst category.

---

## Why This Concept Exists

C prioritizes speed and low-level control. The compiler assumes you follow rules and may **optimize** as if UB never happens — making bugs vanish in debug and explode in release.

1337 evaluators on different machines expose UB you "got away with" locally.

---

## Real Life Analogy

A **safety manual** says "do not mix these chemicals." Undefined behavior is mixing them — maybe nothing, maybe smoke, maybe explosion. You cannot sue the manual when you ignored it.

---

## Visual Explanation

```
Your code: arr[5] on size-3 array

Possible outcomes:
  A) Segfault now
  B) Wrong value silently
  C) Works today, breaks tomorrow
  D) Optimizer deletes your code entirely (advanced)

Standard says: NOT YOUR PROBLEM TO REASON ABOUT — DON'T DO IT
```

---

## ASCII / Memory Diagrams

### Buffer overflow UB

```
int a[3];
a[3] = 999;   /* one past — UB */

Memory might look:
[ a[0] | a[1] | a[2] | ??? maybe other vars ]
                         ^
                         overwrite hidden data?
```

### Uninitialized read

```
int x;        /* UB to read */
if (x > 0)    /* unpredictable branch */
```

---

## Examples

### Correct Example (defined behavior)

```c
#include <stdlib.h>

int safe_div(int a, int b, int *out)
{
	if (!out || b == 0)
		return (0);
	*out = a / b;
	return (1);
}

int bounded_copy(char *dest, size_t cap, const char *src)
{
	size_t i;

	if (!dest || !src || cap == 0)
		return (0);
	i = 0;
	while (src[i] && i + 1 < cap)
	{
		dest[i] = src[i];
		i++;
	}
	dest[i] = '\0';
	return (1);
}
```

### Wrong Example (UB collection)

```c
void ub_examples(void)
{
	int arr[2];
	arr[100] = 1;          /* UB: out of bounds */

	int *p;
	if (*p > 0)            /* UB: uninitialized */

	char *s = "lit";
	s[0] = 'L';            /* UB: modify literal */

	int x = 2147483647;
	x++;                   /* UB: signed overflow (typical platform) */
}
```

---

## STOP / THINK

> **STOP** — UB or defined?

> **THINK** —
> 1. `unsigned int u = -1;` (assigned to unsigned)
> 2. `shift 1 by 32` on 32-bit int
> 3. `free(NULL)`
> 4. `arr[i]` where i == size (one past end) — read only

**Answers:** (1) Defined — conversion rules. (2) UB if shift ≥ width. (3) Defined — safe. (4) UB even for read — one past is special allowed pointer but not dereference in C99+ (pointer one past is valid to point, dereference is UB — teach carefully: `&arr[n]` OK for array size n, `arr[n]` dereference UB).

Actually in C:
- For an array of size n, `&arr[n]` is valid as one-past-end pointer
- `arr[n]` dereference is UB

I'll keep that nuance in answer.

---

## Common Mistakes

1. "It ran fine" = "it is correct"
2. Relying on garbage values matching expectation once
3. Ignoring signed overflow in arithmetic exercises
4. Comparing unrelated pointers
5. Reading past string without bounds

---

## Best Practices

- If standard says UB — avoid entirely
- Write defined behavior even when lazy tests pass
- Enable warnings and sanitizers
- Treat compiler as adversary that exploits UB
- Peer review for bounds and initialization

---

## Mini Quiz

1. UB vs implementation-defined?
2. Is reading uninitialized stack int UB?
3. Why optimize breaks UB programs?
4. One UB example from C07?

---

## Interview Questions

1. Why does C allow UB instead of runtime checks?
2. Examples sanitizer catches?
3. Java vs C memory safety?
4. `arr[i]` vs `i[arr]` — defined?

---

## Homework

1. List 10 UB sources from pointer lessons.
2. Rewrite one UB snippet defined-safe.
3. Explain one-past-end pointer rule.

---

## Extra Challenge

Find UB in a "working" student strstr — fix bounds.

---

## Summary

**Undefined behavior** is code outside C's guarantees — never rely on observed behavior. Eliminate UB with bounds checks, initialization, valid pointers, and defined arithmetic. This mindset separates exam survivors from guessers.

---

## Cheat Sheet

| UB source | Prevention |
|-----------|------------|
| OOB access | Check indices |
| Bad pointer | NULL init, validate |
| Uninitialized | Assign before read |
| After free | NULL + don't touch |
| Literal write | Use char array/copy |

---

## Useful Tips

//* "Works on my machine" is not a certificate  
//* Warnings often flag UB-adjacent code  
//* Exam hidden tests exploit UB you didn't see  
//* Defined behavior is the only contract  
//* When mentor says UB, stop arguing with runtime
