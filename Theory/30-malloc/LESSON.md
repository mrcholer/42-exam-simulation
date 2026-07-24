# malloc

> **Read this lesson completely before the related exercises.**

**Prerequisites:** Heap (28), Void Pointer (18), Pointers (16)  
**You will use this in:** C07, C10, C11 — core dynamic memory

---

## Definition

**malloc** (memory allocate) reserves a block of **uninitialized** bytes on the heap and returns a pointer to it.

```c
#include <stdlib.h>

void *malloc(size_t size);
```

Usage pattern:

```c
int *arr = malloc(5 * sizeof(int));
if (arr == NULL)
	return (NULL);   /* allocation failed */
/* use arr[0]..arr[4] */
free(arr);
```

- Returns `void *` — cast or assign to typed pointer
- Memory contents are **garbage** (not zeroed)
- On failure returns `NULL`
- `size` is in **bytes**

---

## Why This Concept Exists

Compile-time sizes (`int arr[10]`) fail when size depends on input. `malloc` asks the OS/allocator at runtime for exactly the bytes you need.

It is the foundation of dynamic strings, arrays, and data structures in C.

---

## Real Life Analogy

**malloc** is reserving **N empty boxes** in a warehouse. You get the address of the first box. Boxes may contain leftover junk from previous tenants — you clean or overwrite before trusting contents.

---

## Visual Explanation

```
malloc(12)  — request 12 bytes:

Heap before:  [ free space ........................ ]

Heap after:   [ 12 bytes — YOUR BLOCK ] [ free ... ]
               ^
               returned pointer

Contents: [ ?? ?? ?? ?? ?? ?? ?? ?? ?? ?? ?? ?? ]  uninitialized
```

---

## ASCII / Memory Diagrams

### Correct size calculation

```
Need 10 ints:

sizeof(int) == 4
malloc(10 * sizeof(int))  → 40 bytes

WRONG: malloc(10 * 4)        /* magic number */
WRONG: malloc(10)            /* only 10 bytes — fits ~2 ints */
WRONG: malloc(sizeof(arr))   /* sizeof pointer if arr is int* */
```

### Pointer on stack, block on heap

```
STACK:  int *p @ 0x1000  holds 0x5000
HEAP:   @ 0x5000 [ ? ? ? ? ]
        p ───────────────^
```

---

## Examples

### Correct Example

```c
#include <stdlib.h>

char *ft_strdup(const char *src)
{
	char   *copy;
	size_t  len;
	size_t  i;

	len = 0;
	while (src[len])
		len++;
	copy = malloc(len + 1);
	if (!copy)
		return (NULL);
	i = 0;
	while (src[i])
	{
		copy[i] = src[i];
		i++;
	}
	copy[i] = '\0';
	return (copy);
}
```

### Wrong Example

```c
int *bad_count(int n)
{
	return (malloc(n));   /* WRONG: n bytes, not n ints */
}

void no_check(void)
{
	int *p = malloc(1000 * sizeof(int));
	p[0] = 1;   /* WRONG: p might be NULL */
}

void leak(void)
{
	malloc(4);   /* WRONG: lost pointer — leak forever */
}
```

---

## STOP / THINK

> **STOP** — Calculate sizes by hand.

> **THINK** —
> 1. `malloc(100)` — how many `char`? how many `int` (size 4)?
> 2. Why `len + 1` for strings?
> 3. What must you do before using malloc'd memory as string?
> 4. If malloc fails, should you crash?

**Answers:** (1) 100 chars; ~25 ints if aligned packing (still request `100*sizeof(int)` for 100 ints). (2) Room for `'\0'`. (3) Write terminator or initialize. (4) No — handle NULL gracefully.

---

## Common Mistakes

1. Wrong byte count (`n` instead of `n * sizeof(type)`)
2. No NULL check
3. Memory leak — lose pointer
4. Off-by-one size for strings
5. Using memory after free

---

## Best Practices

- Pattern: `ptr = malloc(count * sizeof *ptr);`
- Always check NULL before use
- Initialize data you read before write
- Pair every malloc with free
- On failure, return NULL or cleanup partial allocations

---

## Mini Quiz

1. What header for malloc?
2. malloc(0) — legal?
3. Is malloc'd memory zeroed?
4. Who frees memory returned to caller?

---

## Interview Questions

1. malloc vs calloc?
2. What happens internally when malloc is called (high level)?
3. Why sizeof in allocation expressions?
4. Detecting leaks?

---

## Homework

1. Allocate int array of n elements — write full function skeleton.
2. Trace ft_strdup malloc line by line.
3. List three failure modes without free.

---

## Extra Challenge

Implement ft_range with malloc — handle min > max and malloc fail.

---

## Summary

**malloc** allocates raw uninitialized heap bytes. Size in bytes, check NULL, free when done. Correct sizing (`count * sizeof *ptr`) prevents buffer bugs that pass compilation.

---

## Cheat Sheet

| Item | Remember |
|------|----------|
| Include | `<stdlib.h>` |
| Size | Bytes — use sizeof |
| Init | Not zeroed |
| Fail | NULL |
| Pair | free(ptr) |

---

## Useful Tips

//* Say "bytes" every time you read malloc's argument  
//* sizeof *ptr ties size to pointer type — brilliant idiom  
//* NULL check is not optional in production or exams  
//* Draw heap block with length label  
//* If leak, ask: where did I last store this pointer?
