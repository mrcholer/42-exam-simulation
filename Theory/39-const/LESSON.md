# const

> **Read this lesson completely before the related exercises.**

**Prerequisites:** Variables (10), Pointers (16)  
**You will use this in:** String parameters, read-only APIs, safer interfaces

---

## Definition

**const** means a value **must not be modified** through that name (or path).

Common forms:

```c
const int x = 5;           /* cannot assign to x */
int y = 10;
const int *p = &y;         /* cannot modify *p via p */
int * const q = &y;        /* cannot change q's address */
const int * const r = &y;  /* neither */
```

Read **`const int *p`** as: pointer to **const int** — data read-only.  
Read **`int * const p`** as: **const pointer** to int — address fixed.

---

## Why This Concept Exists

const documents **intent** and lets the compiler catch accidental writes. Functions taking `const char *` promise not to modify your string — critical for libft prototypes.

It also enables placing data in read-only segments when applicable.

---

## Real Life Analogy

A **museum exhibit** behind glass — you can look (read) but guards stop you from touching (write). `const` is the glass for variables accessed through that name.

---

## Visual Explanation

```
const char *s = "hello";

Can:    s++, read *s, pass to print
Cannot: s[0] = 'H'  through const char * (literal also RO)

int n = 3;
const int *p = &n;
*p = 5;   /* ERROR compile time */
n = 5;    /* OK — non-const n still writable */
```

---

## ASCII / Memory Diagrams

### Parameter const char *

```
caller: char str[] = "edit me";
        ft_print(str);

ft_print(const char *s):
  can read s[i]
  cannot do s[i]='X'  — protects caller data contractually
```

### const pointer vs pointer to const

```
const int *a;     /* *a fixed, a moves     → "read-only data" */
int * const b;    /* b fixed, *b writable  → "fixed address" */
```

---

## Examples

### Correct Example

```c
int ft_strlen(const char *str)
{
	int len;

	len = 0;
	while (str[len])
		len++;
	return (len);
}

void print_ints(const int *arr, int size)
{
	int i;

	i = 0;
	while (i < size)
	{
		/* read arr[i] only */
		i++;
	}
	(void)arr;
}
```

### Wrong Example

```c
void break_const(const char *s)
{
	s[0] = 'X';   /* COMPILE ERROR — good */
}

void cast_hack(const char *s)
{
	char *mutable = (char *)s;   /* BAD STYLE: breaks string literal RO */
	mutable[0] = 'X';            /* undefined if literal */
}
```

---

## STOP / THINK

> **STOP** — Parse declarations right-to-left.

> **THINK** — What is forbidden?
> 1. `const int *p;` — change p? change *p?
> 2. `int * const p;`
> 3. `const char *s = "hi"; s++;` legal?

**Answers:** (1) p OK, *p no (2) p no, *p OK (3) yes — pointer moves, chars not written.

---

## Common Mistakes

1. Omitting const on read-only string functions
2. Confusing `const int *` vs `int * const`
3. Casting away const to force write — UB risk
4. Thinking const makes variable globally immutable via all aliases
5. const in wrong position in prototypes

---

## Best Practices

- String inputs: `const char *`
- Don't cast away const without extreme reason
- Read declaration right-to-left aloud
- Match const in header and .c
- const correctness catches bugs at compile time

---

## Mini Quiz

1. libft strlen parameter type?
2. Modify through const pointer?
3. const local vs #define?
4. argv strings const?

---

## Interview Questions

1. const char * vs char * const — exam favorite?
2. Why const in API design?
3. const and ROM string literals?
4. Mutable keyword equivalents elsewhere?

---

## Homework

1. Annotate 5 functions with correct const.
2. Draw read-only vs read-write pointer arrows.
3. Fix prototype missing const on string param.

---

## Extra Challenge

Write ft_strcmp with const-correct parameters both sides.

---

## Summary

**const** protects data from modification through specific names/pointers. Use `const char *` for read-only strings. Parse pointer declarations carefully — const placement changes meaning entirely.

---

## Cheat Sheet

| Declaration | Can't change |
|-------------|--------------|
| `const int x` | x |
| `const int *p` | *p |
| `int * const p` | p |
| `const int * const p` | both |

---

## Useful Tips

//* Read right-to-left: "p is pointer to const int"  
//* If function only reads string → const  
//* Cast-away const is code smell  
//* const helps compiler help you  
//* Exam prototypes often require exact const
