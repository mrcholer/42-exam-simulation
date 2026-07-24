# Pointer Arithmetic

> **Read this lesson completely before the related exercises.**

**Prerequisites:** Pointers (16), Arrays (15)  
**You will use this in:** C01 (string iteration), C02 (strcpy, strlen), C06–C07

---

## Definition

**Pointer arithmetic** is the ability to add, subtract, and compare pointers — not as raw numbers, but in units of the type they point to.

When you write `ptr + 1`, the address moves forward by `sizeof(*ptr)` bytes, not by 1 byte.

```c
int arr[5] = {10, 20, 30, 40, 50};
int *p = arr;       /* p points to arr[0] */
p++;                /* p now points to arr[1] — moved 4 bytes on most systems */
```

Key operations:

| Operation | Meaning |
|-----------|---------|
| `p + n` | Address n elements forward |
| `p - n` | Address n elements backward |
| `p - q` | Number of elements between two pointers (same array) |
| `p++`, `p--` | Move to next/previous element |
| `p < q` | Compare positions (valid only within same array) |

---

## Why This Concept Exists

Arrays and strings are contiguous blocks of memory. The CPU does not "know" about arrays — it only sees addresses. Pointer arithmetic is how C lets you walk through memory efficiently without re-indexing with `[ ]` every time.

Without pointer arithmetic:

- String functions like `strlen` would be awkward and slow
- Iterating arrays would require extra index variables
- You could not express "move to the next element" naturally

Pointer arithmetic is the bridge between **array notation** (`arr[i]`) and **pointer notation** (`*(arr + i)`).

---

## Real Life Analogy

Imagine a **train** where each car holds one passenger (one `int`). Your ticket says **"Car 3"** (the pointer). Walking to the **next car** means moving one car forward — not one inch. The "step size" depends on car length.

If you switch to a **freight train** (each car holds a `double`, bigger cars), one step forward skips a bigger distance. That is `sizeof(type)`.

---

## Visual Explanation

```
Array in memory (each int = 4 bytes):

Address:   1000    1004    1008    1012    1016
           +-------+-------+-------+-------+-------+
Value:     |  10   |  20   |  30   |  40   |  50   |
           +-------+-------+-------+-------+-------+
Index:       [0]     [1]     [2]     [3]     [4]
             ^
             |
             p  (after int *p = arr;)

After p++:

             p --> points here (address 1004, value 20)
```

The formula: `address of arr[i] = address of arr + i * sizeof(int)`

---

## ASCII / Memory Diagrams

### Equivalence: `arr[i]` and `*(arr + i)`

```
arr ──────> [ 10 | 20 | 30 | 40 | 50 ]
             ^
             |
        arr + 0  ==  &arr[0]  ==  *arr       → 10
        arr + 2  ==  &arr[2]  → *(arr + 2)   → 30
```

### Pointer subtraction (distance in elements)

```
p ──> [ 10 | 20 | 30 | 40 | 50 ] <── q
      index 0   1    2

q - p == 2   (two int elements apart, NOT 8 bytes)
```

### Invalid: arithmetic across unrelated objects

```
int x = 5;
int y = 9;
int *p = &x;
int *q = &y;
/* p - q  →  UNDEFINED BEHAVIOR (different objects) */
```

---

## Examples

### Correct Example

```c
#include <unistd.h>

void ft_putchar(char c)
{
	write(1, &c, 1);
}

int main(void)
{
	int nums[] = {1, 2, 3, 4, 5};
	int *p;
	int *end;

	p = nums;
	end = nums + 5;          /* one past last element — valid to point, not dereference */
	while (p < end)
	{
		/* process *p */
		p++;
	}
	/* String walk — classic pointer arithmetic */
	char *s = "hello";
	while (*s)
	{
		ft_putchar(*s);
		s++;                 /* moves to next char (1 byte) */
	}
	return (0);
}
```

### Wrong Example

```c
int a[3] = {1, 2, 3};
int b[3] = {4, 5, 6};
int *p = a + 1;
int *q = b + 1;

/* WRONG: comparing/subtracting pointers from different arrays */
if (p < q)   /* undefined behavior */
	;

int *wild = (int *)0x12345678;
wild++;      /* WRONG: arithmetic on invalid pointer */
*wild;       /* likely segfault */
```

---

## STOP / THINK

> **STOP** — Do not scroll past this block until you have drawn the diagram.

> **THINK** — Given `int arr[4] = {100, 200, 300, 400};` and `int *p = arr + 2;`:
> 1. What value does `*p` hold?
> 2. What is `*(p - 1)`?
> 3. If `p` is at address `5008`, what address is `p + 1`? (Assume `sizeof(int) == 4`.)
> 4. Is `arr + 4` valid to compute? Can you dereference it?

**Answers:** (1) `300` (2) `200` (3) `5012` (4) Valid address (one-past-end), dereferencing is **invalid**.

---

## Common Mistakes

1. **Treating `p + 1` as "add 1 byte"** — it adds `sizeof(*p)` bytes
2. **Arithmetic on `void *`** — in standard C, `void *` cannot be arithmetically adjusted (cast first)
3. **Going past array bounds** — `arr + n` for `n > length` is undefined if dereferenced
4. **Subtracting unrelated pointers** — only defined for pointers into the **same array**
5. **Confusing `++*p` with `*p++`** — first increments value, second increments pointer

---

## Best Practices

- Prefer `ptr < end` with `end = arr + length` for loops
- Use `size_t` for lengths and pointer differences when appropriate
- Draw the array and pointer before every loop
- For strings, remember each `char` step is 1 byte
- After pointer arithmetic, ask: **"Does this pointer still point inside valid memory?"**

---

## Mini Quiz

1. If `int *p` points to `arr[3]`, what does `p - arr` equal?
2. Why is `arr[i]` exactly the same as `*(arr + i)`?
3. Can you use `p++` on a pointer to a single `int` variable (not an array)?
4. What happens with `char *s = "abc"; s + 10;` then `*s`?

---

## Interview Questions

1. Explain pointer arithmetic without using the word "address."
2. Why does `sizeof(char)` matter for string walking but `sizeof(int)` for int arrays?
3. What is the "one-past-end" pointer and why is it useful?
4. How would you iterate a string using only pointer arithmetic (no `[ ]`)?

---

## Homework

1. Write a function `ft_strlen` using only `char *` and `++` — no array indexing.
2. Draw memory for `int a[5]` and mark where `a`, `a+2`, and `a+5` point.
3. Explain in 3 sentences why `p - q` gives element count, not byte count.

---

## Extra Challenge

Implement `ft_strcpy` with two pointers (`dest` and `src`), advancing both until `'\0'`. Trace every pointer move on paper for `"hi"`.

---

## Summary

**Pointer arithmetic** moves a pointer by whole elements, not bytes. It powers array indexing, string loops, and buffer traversal. Master the rule: `p + n` skips `n * sizeof(type)` bytes. Always stay within the same array object when comparing or subtracting.

---

## Cheat Sheet

| Item | Remember |
|------|----------|
| `p + n` | Skip n elements of type `*p` |
| `arr[i]` | Shorthand for `*(arr + i)` |
| `p - q` | Element distance (same array only) |
| One-past-end | `arr + length` — compare, don't dereference |
| `void *` | No arithmetic until cast |

---

## Useful Tips

//* Draw the array as boxes before writing any loop  
//* Say aloud: "Each step is sizeof(type) bytes"  
//* When stuck, rewrite `p[i]` as `*(p + i)` on paper  
//* Use `-Wall -Wextra`; out-of-bounds often hides until runtime  
//* Predict the address after `++` before running the program
