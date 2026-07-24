# Segmentation Fault

> **Read this lesson completely before the related exercises.**

**Prerequisites:** Pointers (16), Stack/Heap (27–28), NULL (20)  
**You will use this in:** Debugging every pointer mistake — daily at 1337

---

## Definition

A **segmentation fault (segfault)** is a crash where your program tries to access **memory it is not allowed to access**. The OS sends signal **SIGSEGV** and terminates the process.

Typical causes in Piscine:

- Dereference `NULL`
- Wild or dangling pointer
- Buffer overflow past array bounds
- Write to read-only memory (string literal)
- Stack overflow (deep recursion)
- Use-after-free

Message often looks like:

```
Segmentation fault (core dumped)
```

---

## Why This Concept Exists

The OS protects memory regions so processes cannot corrupt each other or the kernel. Segfault is the **guardrail** — painful but protective. Learning to read segfaults means translating crash into **invalid address + bad line**.

---

## Real Life Analogy

You have a key to **apartment 4B**. You try opening **4B**, **9Z**, or a **wall** — security stops you. Segfault is security catching an illegal door — better than silently entering someone else's home.

---

## Visual Explanation

```
Valid access:
p ──> [ your heap block ]  ✓ read/write allowed

Segfault:
p ──> NULL
*p     ✗ no mapping — CRASH

p ──> random 0xDEAD
*p     ✗ unmapped — CRASH

p ──> string literal (read-only)
p[0]='X'  ✗ write forbidden — CRASH
```

---

## ASCII / Memory Diagrams

### NULL dereference

```
int *p = NULL;
*p = 5;

Address 0 often unmapped → SIGSEGV
```

### Out of bounds

```
int arr[3] = {1,2,3};
arr[999] = 0;   /* undefined — often segfault */
```

### After free

```
free(p);
*p = 1;   /* use-after-free — may segfault or corrupt */
```

---

## Examples

### Correct Example (defensive)

```c
#include <stdlib.h>

int safe_get(int *arr, int size, int index)
{
	if (!arr || index < 0 || index >= size)
		return (0);
	return (arr[index]);
}

int main(void)
{
	int *data;

	data = malloc(3 * sizeof(int));
	if (!data)
		return (1);
	data[0] = safe_get(data, 3, 0);
	free(data);
	data = NULL;
	return (0);
}
```

### Wrong Example (crash gallery)

```c
void crash_null(void)
{
	int *p = NULL;
	*p = 42;
}

void crash_stack_return(void)
{
	int *p;
	{
		int x = 5;
		p = &x;
	}
	*p = 1;   /* dangling — segfault likely */
}

void crash_literal(void)
{
	char *s = "hello";
	s[0] = 'H';
}
```

---

## STOP / THINK

> **STOP** — Match crash to cause.

> **THINK** — Which segfault cause?
> 1. `write(1, NULL, 10);`
> 2. Infinite recursive function with no base case
> 3. `argv[9999]` when argc is 2
> 4. Modifying `"string"`

**Answers:** (1) NULL buffer (2) stack overflow (3) out of bounds (4) read-only segment.

---

## Common Mistakes

1. Ignoring compiler warnings then surprised by segfault
2. Not checking malloc NULL before use
3. Off-by-one array access
4. Returning stack address then using it
5. Assuming segfault always points to exact bug line (optimizer)

---

## Best Practices

- Check pointers before dereference
- Validate indices against size
- Initialize pointers to NULL
- Use `-g` compile for gdb backtrace
- Reproduce with smallest example

---

## Mini Quiz

1. Signal name for segfault on Linux?
2. Is segfault always immediate?
3. Can valid code segfault? (hint: UB)
4. First debug step when segfault?

---

## Interview Questions

1. Segfault vs bus error?
2. How gdb helps find faulting line?
3. Why doesn't Java segfault the same way?
4. Kernel role in segfault?

---

## Homework

1. Write 4 one-line crashers — predict each.
2. Fix each with guard/check.
3. Run under gdb, note fault address.

---

## Extra Challenge

Create segfault from double free — observe vs use-after-free.

---

## Summary

**Segmentation fault** means illegal memory access. It is a symptom, not root cause — trace to NULL, bounds, lifetime, or recursion. Every pointer lesson exists partly to prevent this crash.

---

## Cheat Sheet

| Cause | Fix |
|-------|-----|
| NULL deref | Check before * |
| Wild ptr | Initialize |
| Dangling | Don't use after free/return |
| OOB | Validate index |
| RO write | Copy literal to mutable buffer |

---

## Useful Tips

//* Segfault message = "your address was illegal"  
//* Draw pointer arrow — where does it point?  
//* Last changed pointer code — first suspect  
//* gcc -g + gdb bt — learn early  
//* Some bugs corrupt heap then segfault later — hard mode
