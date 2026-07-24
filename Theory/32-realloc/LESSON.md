# realloc

> **Read this lesson completely before the related exercises.**

**Prerequisites:** malloc (30), free (33), Heap (28)  
**You will use this in:** Growing buffers, dynamic strings, GNL-style patterns

---

## Definition

**realloc** resizes an existing heap block — possibly **moving** it to a new location.

```c
void *realloc(void *ptr, size_t new_size);
```

Behavior:

- `ptr == NULL` → behaves like `malloc(new_size)`
- `new_size == 0` → implementation-defined (may free — avoid portable reliance)
- On success: returns pointer to resized block (may equal old ptr)
- On failure: returns `NULL`, **original block unchanged**
- Contents preserved up to minimum of old/new size

```c
int *arr = malloc(5 * sizeof(int));
arr = realloc(arr, 10 * sizeof(int));
if (!arr) { /* handle — old 5-int block still valid if realloc failed */ }
```

---

## Why This Concept Exists

Sometimes you start with estimated size and need more — reading lines, building strings, growing arrays. `realloc` avoids manual malloc-copy-free when expanding.

It is powerful and easy to misuse — master the failure rules.

---

## Real Life Analogy

You rent a storage unit (malloc). You need more space. **realloc** asks management for a bigger unit — they might **move all your boxes** to a new aisle and give you a new key. Your old key (pointer) might be invalid after a successful move if you don't update it.

---

## Visual Explanation

```
Old block (8 bytes):  [ A B C D E F G H ]
Need 16 bytes:

Case A — expanded in place:
[ A B C D E F G H | ? ? ? ? ? ? ? ? ]

Case B — moved:
Old location freed/cached
New location: [ A B C D E F G H | ? ? ? ? ? ? ? ? ]
              ^
              new pointer — MUST assign back to p
```

---

## ASCII / Memory Diagrams

### Correct reassignment pattern

```
p ──> [ old block ]

p = realloc(p, new_size);

p ──> [ maybe same, maybe new block ]
       ALWAYS use returned pointer
```

### Failure handling

```
tmp = realloc(p, big);
if (!tmp)
{
	/* p STILL VALID — keep using or free p */
	return ;
}
p = tmp;
```

---

## Examples

### Correct Example

```c
#include <stdlib.h>

char *grow_buffer(char *buf, size_t *capacity, size_t new_cap)
{
	char *new_buf;

	new_buf = realloc(buf, new_cap);
	if (!new_buf)
		return (NULL);
	*capacity = new_cap;
	return (new_buf);
}
```

### Wrong Example

```c
void lose_block(void)
{
	char *p = malloc(10);
	realloc(p, 20);   /* WRONG: return value ignored — may leak old */
}

void double_free_trap(void)
{
	char *p = malloc(10);
	p = realloc(p, 0);   /* risky/portable issues */
	free(p);
}

void use_old_after_move(void)
{
	char *p = malloc(10);
	char *q = p;
	p = realloc(p, 1000);
	q[0] = 'x';   /* WRONG if block moved — q dangling */
}
```

---

## STOP / THINK

> **STOP** — Reason about failure.

> **THINK** —
```c
int *p = malloc(4 * sizeof(int));
p[0] = 42;
p = realloc(p, 8 * sizeof(int));
if (p == NULL) { ... }
```
> 1. If realloc fails, is original block still allocated?
> 2. Why assign `p = realloc(p, ...)` not separate void call?
> 3. After success, is p[0] still 42?

**Answers:** (1) Yes — unless you free manually. (2) May return new address. (3) Yes — preserved content.

---

## Common Mistakes

1. Ignoring return value
2. Using old pointer if realloc moved block
3. Assuming realloc zeroes new space (it doesn't)
4. Calling realloc on non-malloc pointer (stack, string literal)
5. Memory leak on failure paths without cleanup strategy

---

## Best Practices

- Always: `ptr = realloc(ptr, new_size);`
- Use temp variable on failure-sensitive code
- Track logical size vs allocated capacity separately
- New bytes uninitialized — set them explicitly
- Prefer clean malloc+copy+free when learning before clever realloc

---

## Mini Quiz

1. realloc(NULL, n) equivalent?
2. Is old pointer valid after successful realloc?
3. New portion of expanded block initialized?
4. Can realloc shrink block?

---

## Interview Questions

1. realloc failure handling idiom?
2. realloc vs new malloc + memcpy?
3. Why GNL uses static buffer + realloc patterns?
4. Fragmentation and realloc?

---

## Homework

1. Write grow function with tmp pointer pattern.
2. Draw in-place vs moved realloc.
3. Explain dangling risk with alias pointer q.

---

## Extra Challenge

Implement dynamic array append with realloc — size/capacity struct.

---

## Summary

**realloc** resizes heap blocks, possibly moving them. Always capture return pointer, handle NULL without losing old block, and initialize any newly acquired bytes. Advanced but essential for growing data structures.

---

## Cheat Sheet

| Item | Remember |
|------|----------|
| Assign | `p = realloc(p, n);` |
| Fail | NULL → old block remains |
| Move | Old ptr may be invalid after success |
| New bytes | Uninitialized |
| NULL ptr | Like malloc |

---

## Useful Tips

//* Never throw away realloc's return value  
//* Temp pointer pattern for critical code  
//* After grow, write into new indices explicitly  
//* Don't realloc stack memory — ever  
//* When learning C07, malloc enough first; realloc later
