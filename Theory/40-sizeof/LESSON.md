# sizeof

> **Read this lesson completely before the related exercises.**

**Prerequisites:** Data Types (11), Pointers (16), malloc (30)  
**You will use this in:** Allocation sizing, array memory, struct padding awareness

---

## Definition

**sizeof** is a compile-time operator returning the **size in bytes** of a type or expression.

```c
sizeof(int);        /* typically 4 */
sizeof(char);       /* always 1 */
sizeof(double);     /* typically 8 */
sizeof(int *);      /* pointer size — 8 on 64-bit, 4 on 32-bit */

int arr[10];
sizeof(arr);       /* 10 * sizeof(int) — whole array if arr visible */
```

Important: operand is **not evaluated** at runtime (except VLAs in C99).

```c
sizeof(*ptr)  /* size of pointed type — preferred in malloc idiom */
```

---

## Why This Concept Exists

Memory is bytes. Types have different widths. `malloc` needs byte counts. Pointer arithmetic needs element size. sizeof connects **type system** to **memory layout**.

Using magic numbers (`malloc(n * 4)`) breaks when types change — sizeof stays correct.

---

## Real Life Analogy

**Shipping labels** show package dimensions by category — "book box" vs "refrigerator crate." sizeof is the automatic measuring tape for C types so you order the right truck space.

---

## Visual Explanation

```
Type sizes (typical 64-bit Linux):

char     [ # ]           1 byte
int      [ #### ]        4 bytes
double   [ ######## ]    8 bytes
int *    [ ######## ]    8 bytes (address size)
```

Platform dependent — always use sizeof, never assume in production.

---

## ASCII / Memory Diagrams

### Array total size

```
int a[5];

&a[0] -----> [ int | int | int | int | int ]
              ←—— sizeof(a) = 5 * sizeof(int) ——→
```

### Common malloc idiom

```
int *p = malloc(n * sizeof *p);

sizeof *p  == sizeof(int)  when p is int*
If p type changes, allocation auto-adjusts
```

### sizeof pointer trap

```
int *p;
sizeof(p)    /* pointer size — 8 */
sizeof(*p)   /* int size — 4 */
```

---

## Examples

### Correct Example

```c
#include <stdlib.h>

int *alloc_ints(size_t n)
{
	return (malloc(n * sizeof(int)));
}

size_t count_chars(char *s)
{
	size_t n;

	n = 0;
	while (s[n])
		n++;
	return (n);
}

void demo_sizes(void)
{
	int arr[20];

	(void)sizeof(arr);      /* 80 if int is 4 */
	(void)sizeof(arr[0]);   /* 4 */
	(void)sizeof arr / sizeof arr[0];  /* 20 — element count trick */
}
```

### Wrong Example

```c
int *bad_malloc(int n)
{
	return (malloc(n * 4));        /* WRONG: assumes int is 4 */
}

size_t wrong_len(int *p)
{
	return (sizeof(p));            /* WRONG: pointer size not array length */
}

char *copy(char *src)
{
	char *d = malloc(sizeof(src)); /* WRONG: sizeof pointer = 8 not string */
	return (d);
}
```

---

## STOP / THINK

> **STOP** — Compute sizes (assume int=4, ptr=8).

> **THINK** —
```c
int a[10];
int *p = a;
```
> 1. sizeof(a)?
> 2. sizeof(p)?
> 3. sizeof(*p)?
> 4. Element count of a via sizeof?

**Answers:** (1) 40 (2) 8 (3) 4 (4) sizeof(a)/sizeof(a[0]) = 10.

---

## Common Mistakes

1. sizeof pointer instead of array when decayed
2. Magic number instead of sizeof in malloc
3. Forgetting +1 byte for string terminator
4. Assuming int always 4 bytes
5. Using sizeof on function parameter array (decays to pointer)

---

## Best Practices

- malloc: `count * sizeof *ptr`
- String alloc: `strlen(s) + 1` bytes (or loop len+1)
- Element count: `sizeof arr / sizeof arr[0]` (only if arr in scope)
- Print sizes once in learning program for your platform
- Never sizeof(pointer) expecting array length

---

## Mini Quiz

1. sizeof char?
2. Is sizeof runtime function?
3. sizeof(*p) when p is int*?
4. Why sizeof(src) wrong for strdup length?

---

## Interview Questions

1. sizeof array parameter in function?
2. Struct padding and sizeof > sum of fields?
3. size_t type purpose?
4. VLA sizeof exception?

---

## Homework

1. Print all basic type sizes on your machine.
2. Fix three malloc sizeof bugs.
3. Compute nodes needed for `calloc(n, sizeof(t_list))`.

---

## Extra Challenge

Explain why `sizeof('a')` may be 4 (integer promotion) in C.

---

## Summary

**sizeof** reports byte size of types and variables. Use it in every allocation and when reasoning about memory spans. The `sizeof *ptr` malloc pattern prevents type-change bugs — memorize it for C07.

---

## Cheat Sheet

| Expression | Meaning |
|------------|---------|
| sizeof(int) | int bytes |
| sizeof *p | pointed type bytes |
| sizeof arr | total array bytes (in scope) |
| sizeof p | pointer bytes NOT count |
| malloc | n * sizeof(element) |

---

## Useful Tips

//* sizeof is not a function — no header needed for basic use  
//* Repeat: pointer size ≠ array length  
//* strlen+1 for strings, sizeof for typed arrays  
//* Run one sizeof demo day 1 of C07  
//* Exam trick: sizeof pointer vs dereferenced type
