# Null Pointer

> **Read this lesson completely before the related exercises.**

**Prerequisites:** Pointers (16)  
**You will use this in:** Every module — defensive coding, malloc checks, linked lists

---

## Definition

A **null pointer** is a pointer that **does not point to any valid object**. It represents "nowhere" or "no address assigned."

In C, you write this as:

```c
int *p = NULL;
```

`NULL` is a macro (from `<stddef.h>` or other headers) that expands to a **null pointer constant** — typically `(void *)0`.

Important facts:

- Dereferencing `NULL` is **undefined behavior** (usually segfault)
- Comparing `p == NULL` is safe and recommended
- `NULL` is not the same as uninitialized pointer (wild pointer)
- Assign `NULL` after `free(p)` to avoid use-after-free

---

## Why This Concept Exists

Pointers must always hold **some** value — even when there is no valid target. Without `NULL`:

- You could not express "optional" or "not found"
- Functions like `malloc` could not signal failure clearly
- Linked lists could not mark the end of a chain

`NULL` is the agreed-upon **sentinel** meaning "this pointer is intentionally empty."

---

## Real Life Analogy

A **remote control** with no batteries still exists in your hand, but pressing buttons does nothing useful. `NULL` is like labeling the slot **"no device paired"** instead of randomly pointing at your neighbor's TV.

An **uninitialized pointer** is worse — like a remote paired to a random unknown device without you knowing.

---

## Visual Explanation

```
Valid pointer:
p ──────> [ int: 42 ]   ✓ object exists

Null pointer:
p ──────> ∅  (points to nothing valid)

Dereference *p when p == NULL → CRASH (segfault)
```

---

## ASCII / Memory Diagrams

### malloc failure pattern

```
int *p = malloc(1000 * sizeof(int));

if (p == NULL)
{
	/* handle error — do NOT use p */
	return (1);
}
/* safe to use p here */
```

### Linked list termination

```
head ──> [ 10 | * ] ──> [ 20 | * ] ──> [ 30 | NULL ]
                                          ^
                                          |
                                    NULL = end of list
```

### After free — set to NULL

```
Before free:
p ──> [ heap block ]

free(p);
p = NULL;

After:
p ──> NULL     (safe to check, won't double-free if you guard)
```

---

## Examples

### Correct Example

```c
#include <stdlib.h>

char *ft_strdup(const char *src)
{
	char *copy;
	size_t len;
	size_t i;

	if (src == NULL)
		return (NULL);
	len = 0;
	while (src[len])
		len++;
	copy = malloc(len + 1);
	if (copy == NULL)
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
int *p = NULL;

/* WRONG: dereference without check */
*p = 42;

int *q;
/* WRONG: q is NOT NULL — it's garbage (wild) */
if (q == NULL)   /* might be false even though q is invalid */
	;
```

---

## STOP / THINK

> **STOP** — Do not read answers until you write your own.

> **THINK** —
> 1. What is the output/logical effect of `if (p)` when `p == NULL`?
> 2. Why do we return `NULL` from `malloc` failure instead of `0` as int?
> 3. After `free(p)`, why assign `p = NULL`?
> 4. Is `NULL == 0` true in C?

**Answers:** (1) Condition false — block skipped. (2) Return type is pointer; `NULL` is typed null pointer constant. (3) Prevents accidental use-after-free; `if (p)` safe. (4) Yes — `NULL` compares equal to 0 in pointer context.

---

## Common Mistakes

1. **Dereferencing without NULL check** after malloc or search
2. **Confusing NULL with '\0'** — one is pointer, one is char value
3. **Confusing NULL with uninitialized** — only NULL is predictable
4. **Double free** — not setting NULL after free
5. **Returning uninitialized pointer** instead of NULL on error

---

## Best Practices

- Check every `malloc` result: `if (!p) return NULL;`
- Check input pointers in library functions when spec allows NULL
- Use `p = NULL` immediately after `free(p)`
- Use linked list `NULL` tail consistently
- Prefer early return on NULL — avoid deep nesting

---

## Mini Quiz

1. What header provides `NULL`?
2. Can you compare `char *p = NULL` with `if (!p)`?
3. What happens on Linux if you `*NULL`?
4. Difference between `NULL` pointer and pointer to address 0 in data?

---

## Interview Questions

1. Why does `free(NULL)` do nothing safely?
2. Explain NULL as sentinel in linked lists.
3. How should `ft_strdup` behave if malloc fails?
4. NULL vs optional types in other languages?

---

## Homework

1. List five places in Piscine where NULL checks are mandatory.
2. Write pseudo-code for "find node" returning NULL if not found.
3. Explain why `memset(&p, 0, sizeof p)` nullifies pointer.

---

## Extra Challenge

Implement a safe `ft_free(void **pp)` that frees `*pp` and sets `*pp = NULL`.

---

## Summary

**NULL** means "this pointer points nowhere." Use it for empty lists, failed allocation, missing results, and after `free`. Always check before dereference — `NULL` is your friend, not an error by itself.

---

## Cheat Sheet

| Item | Remember |
|------|----------|
| Assign | `p = NULL;` |
| Test | `if (p == NULL)` or `if (!p)` |
| After free | `free(p); p = NULL;` |
| malloc fail | Returns `NULL` |
| Deref NULL | Undefined — usually segfault |

---

## Useful Tips

//* "If it can fail, check for NULL" — malloc, search, parse  
//* NULL is intentional; garbage is accidental — different bugs  
//* Say: "pointer to nothing" not "pointer is zero bytes"  
//* Linked list loops: `while (node != NULL)`  
//* Returning NULL on error is idiomatic C — document it
