# calloc

> **Read this lesson completely before the related exercises.**

**Prerequisites:** malloc (30), Heap (28)  
**You will use this in:** Zeroed arrays, safe initialization patterns, contrast with malloc

---

## Definition

**calloc** (clear allocate) allocates memory for an **array** of elements and **initializes all bytes to zero**.

```c
void *calloc(size_t count, size_t size);
```

Total bytes allocated: `count * size` (calloc multiplies internally — watch overflow in theory).

```c
int *arr = calloc(10, sizeof(int));
/* arr[0]..arr[9] all 0 — no garbage */
if (!arr)
	return (NULL);
free(arr);
```

Difference from malloc:

| | malloc | calloc |
|---|--------|--------|
| Args | total bytes | count × element size |
| Initial content | garbage | all bits 0 |
| Use case | general | arrays needing zero start |

---

## Why This Concept Exists

Reading uninitialized memory causes random bugs. Zero-init is the safe default for counters, flags, pointer arrays (NULL bits), and fresh structs.

`calloc` expresses intent: **"I need count elements, start clean."**

---

## Real Life Analogy

**malloc** rents empty apartments with previous tenants' furniture left behind. **calloc** rents the same space but **cleaning crew zeros everything** before you enter.

---

## Visual Explanation

```
calloc(4, sizeof(int))  — 4 ints, 16 bytes:

[ 0 | 0 | 0 | 0 ]   guaranteed

malloc(16):

[ ?? | ?? | ?? | ?? ]   unknown
```

---

## ASCII / Memory Diagrams

### Pointer array with calloc

```
calloc(3, sizeof(char *)):

[ NULL | NULL | NULL ]
   safe — dereferencable as "empty" if you treat as strings
```

### calloc vs manual loop

```
/* Same effect for ints: */
calloc(n, sizeof(int));

p = malloc(n * sizeof(int));
memset(p, 0, n * sizeof(int));   /* alternative — know both */
```

---

## Examples

### Correct Example

```c
#include <stdlib.h>

int *make_zeroed_range(int count)
{
	int *arr;
	int  i;

	if (count <= 0)
		return (NULL);
	arr = calloc(count, sizeof(int));
	if (!arr)
		return (NULL);
	i = 0;
	while (i < count)
	{
		arr[i] = i * 10;   /* optional — already zero */
		i++;
	}
	return (arr);
}
```

### Wrong Example

```c
int *assume_zero(void)
{
	int *p = malloc(10 * sizeof(int));
	return (p);   /* WRONG assumption: p[0]==0 — might be garbage */
}

int *overflow_risk(int n)
{
	/* WRONG conceptually: if n huge, count*size overflows */
	return (calloc(n, sizeof(int)));
}
```

---

## STOP / THINK

> **STOP** — Predict values.

> **THINK** —
```c
int *a = calloc(5, sizeof(int));
int *b = malloc(5 * sizeof(int));
```
> 1. Safe to read a[2] before writing?
> 2. Safe to read b[2] before writing?
> 3. calloc(1, 100) vs malloc(100)?

**Answers:** (1) Yes — reads 0. (2) No — undefined/garbage. (3) Same bytes; calloc zeroed.

---

## Common Mistakes

1. Assuming malloc gives zeros
2. Swapping calloc arguments conceptually (still count, size)
3. Forgetting free
4. Using calloc when size unknown — still need correct count
5. Thinking zero bits always mean `0.0f` for floats (usually yes on IEEE platforms — not portable nuance for beginners: ints OK)

---

## Best Practices

- Use calloc when you will **read before write**
- Pointer tables → calloc avoids wild pointers
- Still check NULL
- Still use `free`
- For single object, `calloc(1, sizeof(*p))` is clear

---

## Mini Quiz

1. calloc arguments meaning?
2. calloc vs malloc one-liner?
3. Are calloc bytes always zero?
4. When prefer calloc in Piscine?

---

## Interview Questions

1. Performance malloc vs calloc?
2. Why zero-init pointer arrays?
3. Can calloc fail? How detect?
4. memset vs calloc?

---

## Homework

1. Rewrite malloc+loop init using calloc.
2. Draw calloc(3, sizeof(int)) memory.
3. When would you NOT use calloc?

---

## Extra Challenge

Allocate 2D-ish row of char* with calloc — explain NULL rows.

---

## Summary

**calloc** allocates `count × size` bytes and zeroes them. Prefer it when uninitialized reads would be bugs. Always pair with `free` and NULL checks — same ownership rules as malloc.

---

## Cheat Sheet

| Item | Remember |
|------|----------|
| Syntax | `calloc(count, size)` |
| Content | All zero bytes |
| NULL | On failure |
| vs malloc | Zeroed vs garbage |
| free | Same as malloc |

---

## Useful Tips

//* Reading array before filling? → calloc  
//* Pointer array? → calloc sets NULL  
//* calloc doesn't replace correct logic — still set real values  
//* Overflow: count*size must fit — advanced caution  
//* Exam: "garbage vs zero" is favorite trick question
