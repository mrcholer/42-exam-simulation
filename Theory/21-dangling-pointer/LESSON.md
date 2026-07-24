# Dangling Pointer

> **Read this lesson completely before the related exercises.**

**Prerequisites:** Pointers (16), Stack (27), Heap (28), free (33)  
**You will use this in:** Debugging C07, linked lists, any dynamic memory code

---

## Definition

A **dangling pointer** is a pointer that **still holds an address**, but the memory at that address is **no longer valid** — it has been freed, or the variable it pointed to has gone out of scope.

```c
int *danger(void)
{
	int x = 5;
	return (&x);   /* DANGLING after function returns — x is destroyed */
}
```

The pointer **looks** valid (non-NULL address) but reading/writing through it is **undefined behavior**.

Common causes:

1. Returning address of local (stack) variable
2. Using memory after `free()`
3. Pointer to element after realloc moved the block
4. Iterator invalidation (advanced)

---

## Why This Concept Exists

Understanding dangling pointers explains mysterious crashes: your program compiles, pointer is not NULL, yet everything breaks. The address is a **ghost** — the object is gone.

This concept connects **lifetime** (how long memory is valid) with **pointers** (which can outlive that memory).

---

## Real Life Analogy

You save a **hotel room number** on your phone. After checkout, the hotel assigns the **same room** to another guest. If you enter using your old key code, you might see someone else's luggage — or security throws you out.

The number (address) is the same; **your right to use that room** expired.

---

## Visual Explanation

```
Stack frame during function:

func() stack:
+----------------+
| x = 5  @ 1000  | <── p points here
+----------------+

After func() returns — frame destroyed:

p still holds 1000  ──> [ ??? garbage / reused by other function ]
                         ^
                         dangling — must not dereference
```

---

## ASCII / Memory Diagrams

### Use-after-free

```
Step 1: p ──> [ heap: "hello" ]

Step 2: free(p);
        p ──> [ freed memory — may be reused ]

Step 3: *p = 'H';   ← UNDEFINED BEHAVIOR (dangling)
```

### Fix: NULL after free

```
free(p);
p = NULL;
*p;   /* still wrong if you forget check, but if (p) catches it */
```

### Return address of local

```
int *make(void)
{
	int n = 7;
	return (&n);
}  /* n destroyed */

main: p = make();  /* p dangling */
```

---

## Examples

### Correct Example

```c
#include <stdlib.h>
#include <string.h>

char *safe_dup(const char *src)
{
	char *copy;

	copy = malloc(strlen(src) + 1);
	if (!copy)
		return (NULL);
	strcpy(copy, src);
	return (copy);   /* OK — heap outlives function */
}

void use_string(void)
{
	char *s;

	s = safe_dup("poolers");
	if (s)
	{
		/* use s */
		free(s);
		s = NULL;    /* prevent dangling */
	}
}
```

### Wrong Example

```c
char *broken(void)
{
	char buf[10] = "oops";
	return (buf);    /* WRONG: buf dies at return */
}

void uaf(void)
{
	int *p = malloc(sizeof(int));
	free(p);
	*p = 10;         /* WRONG: dangling after free */
}

int *keep;
void scope_bug(void)
{
	int local = 99;
	keep = &local;   /* WRONG: local dies */
}
/* keep is now dangling */
```

---

## STOP / THINK

> **STOP** — Predict before reading solutions.

> **THINK** —
> 1. Why is dangling worse than NULL sometimes?
> 2. Does `-Wall` always catch `return &local`?
> 3. After `free(p)`, is `p == NULL` automatically?
> 4. realloc returns new pointer — what happens to old pointer?

**Answers:** (1) Looks valid — silent corruption. (2) Often warns (`-Wreturn-local-addr`) but not always with optimization. (3) No — unless you assign NULL. (4) Old pointer dangling if realloc moved block; use returned pointer only.

---

## Common Mistakes

1. **`return &local_array`** from function
2. **Use-after-free** in linked list deletion
3. **Multiple pointers** to same block — free one, use other
4. **Forgot to update** pointer after `realloc`
5. **Storing pointer to loop variable** outside loop

---

## Best Practices

- Never return address of stack variable — return malloc copy or pass buffer
- Always `p = NULL` after `free(p)`
- One owner rule: one pointer "owns" free responsibility
- After `realloc`, assume old pointer invalid unless it returned same address
- Use Valgrind / `-fsanitize=address` when available

---

## Mini Quiz

1. Define dangling pointer in one sentence.
2. Is dangling pointer always NULL?
3. Name two Piscine patterns that create dangling pointers.
4. Why does setting NULL after free help?

---

## Interview Questions

1. Stack vs heap dangling — same bug?
2. How would you debug intermittent use-after-free?
3. Explain why `char *s = "lit";` is NOT dangling (hint: storage class).
4. What is double-free vs use-after-free?

---

## Homework

1. Draw timeline: malloc → use → free → dangling access.
2. Fix `broken()` by returning heap duplicate.
3. Write three test cases Valgrind would flag.

---

## Extra Challenge

Implement list node removal that updates all pointer references and frees safely without leaving dangling `next` links.

---

## Summary

A **dangling pointer** references memory whose lifetime ended. It is not NULL — that is what makes it dangerous. Respect scope and ownership: free once, nullify pointers, never touch stack after return.

---

## Cheat Sheet

| Cause | Fix |
|-------|-----|
| Return &local | Return malloc or use parameter buffer |
| After free | `p = NULL` |
| realloc moved | Use new return value only |
| Shared ownership | Document who frees |

---

## Useful Tips

//* Ask: "Is the object still alive at this line?"  
//* If function returns pointer, ask: stack or heap?  
//* free + NULL is a two-step habit  
//* Crashes "sometimes" often mean dangling / reuse  
//* Draw lifetime bars alongside pointer arrows
