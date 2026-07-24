# free

> **Read this lesson completely before the related exercises.**

**Prerequisites:** malloc (30), Heap (28), Null Pointer (20)  
**You will use this in:** Every C07+ exercise — leak prevention

---

## Definition

**free** releases a heap block previously allocated by `malloc`, `calloc`, or `realloc`, returning it to the allocator for reuse.

```c
#include <stdlib.h>

void free(void *ptr);
```

Rules:

- Pass exactly the pointer returned by allocation function (or NULL)
- `free(NULL)` is safe — no operation
- After `free(p)`, **do not dereference p** — dangling pointer
- **Double free** (`free` same block twice) → undefined behavior
- Never `free` stack memory or string literals

```c
int *p = malloc(10 * sizeof(int));
/* use p */
free(p);
p = NULL;
```

---

## Why This Concept Exists

Heap memory is not automatic like stack. Without `free`, programs **leak** memory until exit — bad for servers, loops, and exam evaluators running many tests.

`free` completes the contract: you requested bytes, you return them when done.

---

## Real Life Analogy

**malloc** checks out a library book. **free** returns it. Keeping books forever (leak) empties the shelf. Returning the same book twice (double free) confuses the catalog system. Reading after return (use-after-free) is stealing someone else's checkout.

---

## Visual Explanation

```
Before free:
p ──> [ allocated block in heap ]

free(p):
p ──> [ block marked free — may be reused ]
      DO NOT read/write through p

p = NULL:
p ──> NULL  (safe sentinel)
```

---

## ASCII / Memory Diagrams

### Ownership chain

```
ft_strdup returns copy ──> caller owns ──> caller must free

main:
	s = ft_strdup("hi");
	use(s);
	free(s);
	s = NULL;
```

### Double free disaster

```
p ──> [ block X ]
free(p);   /* OK */
free(p);   /* UNDEFINED — heap corruption */
```

### free invalid pointers

```
int x;
free(&x);           /* WRONG — stack */

free("hello");      /* WRONG — not heap */

free(p + 1);        /* WRONG — not block start */
```

---

## Examples

### Correct Example

```c
#include <stdlib.h>

void cleanup(char **str)
{
	if (str && *str)
	{
		free(*str);
		*str = NULL;
	}
}

int main(void)
{
	char *line;

	line = malloc(1);
	if (!line)
		return (1);
	free(line);
	line = NULL;
	return (0);
}
```

### Wrong Example

```c
void leak_loop(void)
{
	while (1)
	{
		malloc(100);
		/* WRONG: never free — eventual crash/OOM */
	}
}

void bad_free(void)
{
	int *p = malloc(4);
	free(p);
	*p = 0;      /* WRONG: use-after-free */
}

void double(void)
{
	int *p = malloc(4);
	free(p);
	free(p);     /* WRONG */
}
```

---

## STOP / THINK

> **STOP** — Ownership quiz.

> **THINK** —
```c
char *a = ft_strdup("x");
char *b = a;
free(a);
```
> 1. Can you use b after free(a)?
> 2. Should you free(b) too?
> 3. Why set a = NULL after free?

**Answers:** (1) No — same block, dangling. (2) No — double free. (3) Prevents accidental use/double free.

---

## Common Mistakes

1. Memory leak — no free
2. Double free
3. Use-after-free
4. Freeing non-heap pointer
5. Freeing middle of block (pointer arithmetic error)

---

## Best Practices

- One malloc → exactly one free
- `free(p); p = NULL;`
- Decide owner — document in function comment
- Free in reverse order of dependency when chaining allocs
- Use cleanup labels in complex functions (`goto cleanup` pattern — advanced)

---

## Mini Quiz

1. Is free(NULL) safe?
2. After free, what is p?
3. Who frees ft_strdup result?
4. Can free shrink program RAM instantly visible?

---

## Interview Questions

1. How detect memory leaks?
2. Explain double free corruption.
3. free vs stack automatic cleanup?
4. Why not free after every function always?

---

## Homework

1. Trace C07 program — list every malloc/free pair.
2. Draw shared pointer alias before single free.
3. Write safe free macro conceptually (void ft_free(void **p)).

---

## Extra Challenge

Implement list destroy freeing all nodes without leak or double free.

---

## Summary

**free** returns heap memory. Call it once per successful allocation, never on invalid pointers, and nullify after to avoid dangling use. Leak-free C07 is impossible without mastering `free`.

---

## Cheat Sheet

| Item | Remember |
|------|----------|
| Valid arg | malloc/calloc/realloc ptr or NULL |
| Count | Once per allocation |
| After | Set pointer NULL |
| Invalid | stack, literals, mid-block |
| Double free | Undefined |

---

## Useful Tips

//* malloc/free ledger — track on paper during eval  
//* If two pointers one block, pick one free owner  
//* free doesn't change pointer bits — you must NULL  
//* Evaluators run leaks tests — take free seriously  
//* "Who owns this?" before every return statement
