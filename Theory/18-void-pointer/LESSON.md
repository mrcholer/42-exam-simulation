# Void Pointer

> **Read this lesson completely before the related exercises.**

**Prerequisites:** Pointers (16), Data Types (11)  
**You will use this in:** Generic memory functions, `malloc`, `write`/`read`, advanced C

---

## Definition

A **void pointer** (`void *`) is a pointer that can hold the address of **any data type**, without knowing what type lives there yet.

```c
int   x = 42;
char  c = 'A';
void *vp;

vp = &x;    /* OK — store address of int */
vp = &c;    /* OK — store address of char */
```

`void *` is a **generic address holder**. You cannot dereference it directly — the compiler does not know how many bytes to read. You must **cast** back to the correct type first:

```c
int *ip = (int *)vp;
printf("%d\n", *ip);
```

---

## Why This Concept Exists

C is a low-level language. Sometimes one function must work with **any** type of memory:

- `malloc` returns `void *` because it allocates raw bytes — you decide the type
- `write(fd, buf, count)` accepts any buffer as `const void *`
- Sorting/search libraries need one memory-copy interface for all types

`void *` is C's way of saying: **"I have an address, but the type comes later."**

---

## Real Life Analogy

A **labeled locker** holds a specific item (int locker, char locker). A **mystery box** with only a **location tag** (void pointer) says "something is stored at shelf 7" but does not say if it is books or shoes. You must open the box according to what you **know** you put there — wrong label, wrong contents.

---

## Visual Explanation

```
Memory:

Address 2000:  [ int: 42 ]     ← x
Address 2004:  [ char: 'A' ]   ← c

void *vp can hold:
   2000  (when vp = &x)
   or
   2004  (when vp = &c)

Dereference vp directly?  ✗  Compiler error
Cast first: *(int *)vp     ✓  if vp really points to int
```

---

## ASCII / Memory Diagrams

### malloc returns void *

```
malloc(12)  ──>  [ ? ? ? ? ? ? ? ? ? ? ? ? ]  raw bytes on heap
                  ^
                  |
              void *p

After you decide it's 3 ints:
int *arr = (int *)p;
arr[0] = 1;  arr[1] = 2;  arr[2] = 3;
```

### Passing any buffer to write()

```
int data[] = {1, 2, 3};

write(1, data, 12);
         ^
         |
    const void *  — write doesn't care about type, only bytes
```

---

## Examples

### Correct Example

```c
#include <stdlib.h>

void swap_bytes(void *a, void *b, size_t size)
{
	unsigned char *pa;
	unsigned char *pb;
	unsigned char tmp;
	size_t          i;

	pa = (unsigned char *)a;
	pb = (unsigned char *)b;
	i = 0;
	while (i < size)
	{
		tmp = pa[i];
		pa[i] = pb[i];
		pb[i] = tmp;
		i++;
	}
}

int main(void)
{
	int x = 10;
	int y = 20;

	swap_bytes(&x, &y, sizeof(int));
	/* x == 20, y == 10 */
	return (0);
}
```

### Wrong Example

```c
void *vp;
int   x = 5;
char  c = 'z';

vp = &x;
/* WRONG: treating void * as int without cast */
/* printf("%d", *vp);  — compile error */

vp = &c;
/* WRONG: cast to wrong type */
int *wrong = (int *)vp;
printf("%d\n", *wrong);  /* undefined behavior — reads 4 bytes from char */
```

---

## STOP / THINK

> **STOP** — Cover the answers. Draw two variables `int n` and `double d` in memory.

> **THINK** — A `void *p` first holds `&n`, then later holds `&d`.
> 1. Why must you track what type `p` currently points to?
> 2. What happens if you always cast `p` to `int *`?
> 3. Why does `malloc` return `void *` instead of `int *`?

**Answers:** (1) Cast must match actual object type. (2) Reading `double` as `int` is UB/wrong bits. (3) Allocation size is in bytes; caller picks type.

---

## Common Mistakes

1. **Dereferencing `void *` directly** — always cast first
2. **Forgetting what type was stored** — document or use typed pointers when possible
3. **Wrong cast after `malloc`** — `(int *)malloc(n * sizeof(double))` is a bug
4. **Assuming void pointer arithmetic** — standard C disallows `vp++` on `void *` (GCC extension exists — avoid)
5. **Casting away const incorrectly** — use `const void *` for read-only buffers

---

## Best Practices

- Cast `malloc` result to the pointer type you need: `int *p = malloc(n * sizeof *p);`
- Use `void *` at API boundaries; convert to typed pointers inside your code quickly
- Pair `void *` with a `size` or type tag when building generic containers
- Prefer `unsigned char *` for raw byte manipulation
- Comment what type a `void *` holds if it cannot be inferred

---

## Mini Quiz

1. Can you write `*vp` when `vp` is `void *`?
2. Why is `write`'s buffer parameter `const void *`?
3. What cast turns `void *` from `malloc(4)` into a single integer?
4. Is `void *` the same as "null pointer"?

---

## Interview Questions

1. Explain `void *` to someone who knows only `int *`.
2. Why doesn't C let you do arithmetic on `void *` in the standard?
3. How does `memcpy` work with `void *`?
4. Trade-off: generic `void *` vs type-safe templates (C++ style)?

---

## Homework

1. Write a function `ft_memset(void *s, int c, size_t n)` conceptually — explain each parameter.
2. Draw memory before/after swapping two `int`s via `void *`.
3. List three standard library functions that use `void *`.

---

## Extra Challenge

Implement a tiny generic stack using `void *` array and `size_t elem_size`. Push/pop must copy `elem_size` bytes.

---

## Summary

**Void pointers** store any address but carry no type information. They enable generic memory APIs like `malloc` and `write`. Always cast to the correct type before reading or writing through them — the compiler will not catch type lies at runtime.

---

## Cheat Sheet

| Item | Remember |
|------|----------|
| Declaration | `void *p;` |
| Assign | `p = &anything;` |
| Dereference | Cast first: `*(int *)p` |
| malloc | Returns `void *` — cast on use |
| Arithmetic | Not on `void *` in standard C |

---

## Useful Tips

//* Think of `void *` as "address only, type later"  
//* After every `malloc`, immediately assign to a typed pointer  
//* For byte-level work, cast to `unsigned char *`  
//* Never guess the type — track it in a struct or variable name  
//* `write` and `read` want bytes; `void *` is perfect for that
