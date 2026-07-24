# Heap

> **Read this lesson completely before the related exercises.**

**Prerequisites:** Stack (27), Pointers (16), malloc (30)  
**You will use this in:** C07 (strdup, range, strjoin), C10 lists, C11 GNL

---

## Definition

The **heap** is a region of memory for **dynamic allocation** — memory you request at runtime and release manually with `free`.

```c
int *p = malloc(10 * sizeof(int));   /* heap block */
/* use p ... */
free(p);
```

Properties:

- **Manual lifetime** — lives until you `free` it (or program ends)
- **Larger capacity** than stack (limited by RAM + OS)
- **Slower** than stack — allocator manages free blocks
- **Fragmentation** possible over time
- Returns **address** — you store in pointer

---

## Why This Concept Exists

Some data size is unknown until runtime ("how many lines in the file?"). Some data must **outlive** the function that created it (`ft_strdup`). Stack cannot do that safely.

The heap lets programs grow and shrink memory use dynamically.

---

## Real Life Analogy

**Stack** = desk workspace — cleared when you leave the room.  
**Heap** = **storage unit** you rent — you get a key (pointer), keep stuff as long as you pay (until `free`), and must not lose the key or you leak space.

---

## Visual Explanation

```
Process memory (simplified):

High addresses
    ┌──────────────┐
    │    Stack     │  ↓ grows down
    │      ↕       │
    │    (gap)     │
    │      ↕       │
    │    Heap      │  ↑ grows up
    ├──────────────┤
    │    BSS/Data  │
    │    Text      │
Low addresses
```

---

## ASCII / Memory Diagrams

### malloc block

```
Before malloc:
heap free list: [.................]

After p = malloc(16):
heap: [ used: 16 bytes ] [ free ... ]
       ^
       p points here

After free(p):
heap: [ free block returned to allocator ]
p should be NULL — else dangling
```

### Outliving function

```
ft_strdup returns heap pointer:

heap: [ 'h' 'i' '\0' ]  ←── survives after ft_strdup returns
main: char *s = ... ────────> same block
```

---

## Examples

### Correct Example

```c
#include <stdlib.h>

int *make_range(int min, int max)
{
	int *arr;
	int  size;
	int  i;

	if (min > max)
		return (NULL);
	size = max - min + 1;
	arr = malloc(size * sizeof(int));
	if (!arr)
		return (NULL);
	i = 0;
	while (i < size)
	{
		arr[i] = min + i;
		i++;
	}
	return (arr);   /* heap survives — caller owns it */
}
```

### Wrong Example

```c
void leak(void)
{
	int *p = malloc(100);
	/* WRONG: never free — memory leak */
}

void double_free(void)
{
	int *p = malloc(4);
	free(p);
	free(p);   /* WRONG: undefined behavior */
}

int *confuse(void)
{
	int stack_arr[10];
	return (stack_arr);   /* WRONG: stack, not heap */
}
```

---

## STOP / THINK

> **STOP** — Answer before scrolling.

> **THINK** —
> 1. Why must `ft_strdup` use heap not stack?
> 2. Who should call `free` on returned pointer — caller or callee?
> 3. What if you lose the pointer before free?
> 4. Can heap and stack overlap?

**Answers:** (1) String must outlive function. (2) Caller owns returned heap memory unless documented otherwise. (3) Memory leak — block unreachable. (4) No — OS keeps them apart until limits hit.

---

## Common Mistakes

1. Memory leaks — no `free`
2. Double free / use-after-free
3. Returning stack memory instead of heap
4. Wrong size to malloc (`sizeof pointer` vs `sizeof int`)
5. Not checking malloc NULL return

---

## Best Practices

- Every `malloc`/`calloc`/`realloc` has matching `free`
- Document ownership transfer on return
- `free(p); p = NULL;`
- Use `sizeof(*p)` in size calculations
- Valgrind / leaksanitizer when possible

---

## Mini Quiz

1. Heap vs stack lifetime?
2. Function that allocates heap?
3. What is memory leak?
4. Does freed memory disappear from RAM instantly?

---

## Interview Questions

1. When choose heap over stack?
2. Explain fragmentation simply.
3. How does `free` know how many bytes to release?
4. malloc failure handling strategy?

---

## Homework

1. Draw heap block lifecycle: malloc → use → free.
2. List all C07 functions that return heap memory.
3. Write ownership rule for your libft.

---

## Extra Challenge

Implement `ft_strjoin` — trace two mallocs or one, justify choice.

---

## Summary

The **heap** provides flexible, long-lived memory via `malloc` family. You manage lifetime with `free`. Master heap for C07+ — strings, arrays, lists all depend on it.

---

## Cheat Sheet

| Item | Remember |
|------|----------|
| Allocate | `malloc`, `calloc`, `realloc` |
| Release | `free(ptr)` once |
| Lifetime | Until free |
| Return from fn | Heap OK, stack NOT |
| Failure | Returns NULL |

---

## Useful Tips

//* malloc/free are married — don't divorce them  
//* Caller frees what callee malloc'd and returned  
//* Lost pointer = leak — draw ownership arrows  
//* Heap errors hurt later — trace early  
//* Size = count × sizeof(element), always
