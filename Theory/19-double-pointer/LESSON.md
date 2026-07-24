# Double Pointer

> **Read this lesson completely before the related exercises.**

**Prerequisites:** Pointers (16), Pointer Arithmetic (17)  
**You will use this in:** C01 ex01/ex04 (ft_ultimate_ft), C07 (ft_ultimate_range), linked lists

---

## Definition

A **double pointer** (pointer to pointer) is a variable that stores the **address of another pointer**.

```c
int   x = 42;
int  *p = &x;      /* p points to x */
int **pp = &p;     /* pp points to p */
```

Reading levels:

| Expression | Type | Meaning |
|------------|------|---------|
| `pp` | `int **` | Address of `p` |
| `*pp` | `int *` | Value of `p` (address of `x`) |
| `**pp` | `int` | Value of `x` (`42`) |

Syntax: each `*` peels one layer of indirection.

---

## Why This Concept Exists

Sometimes a function must **modify a pointer itself**, not just the value it points to.

```c
void set_to_null(int *p) { p = NULL; }        /* useless — copy of pointer */
void set_to_null(int **pp) { *pp = NULL; }    /* works — modifies original p */
```

Double pointers appear when:

- Returning allocated memory through a parameter (C07)
- Building linked lists (`next` is `struct s_list *`)
- Creating 2D arrays or arrays of strings
- Swapping two pointers

---

## Real Life Analogy

A **business card** (`int *p`) holds someone's **home address**. Your **wallet slot** (`int **pp`) holds the business card itself.

- Changing what's **written on the card** = `*p = new_value`
- Replacing the **card in the wallet** = `*pp = new_pointer`
- The wallet lets someone else update which card you carry — that's pass-by-pointer-to-pointer.

---

## Visual Explanation

```
Variable    Address    Value (holds)
─────────────────────────────────────
x           1000       42
p           2000       1000  ──> points to x
pp          3000       2000  ──> points to p

*pp  →  read pp        → 2000  (value stored in pp) = address of p
**pp → read *(*pp)     → read p at 2000 → 1000 → read x → 42
```

---

## ASCII / Memory Diagrams

### Modifying value vs modifying pointer

```
Before ft_ultimate_ft(&p):

pp ──> [ p: 1000 ] ──> [ x: 42 ]

After *pp = &other; (conceptually):

pp ──> [ p: 5000 ] ──> [ other: 99 ]
```

### Array of strings (char **)

```
argv is char **:

argv ──> [ ptr0 ] ──> "program"
      └> [ ptr1 ] ──> "arg1"
      └> [ ptr2 ] ──> "arg2"
      └> [ NULL ]

argv[1]     → char * to "arg1"
argv[1][0]  → 'a'
*(*(argv+1)) → same as argv[1][0]
```

---

## Examples

### Correct Example

```c
void set_value(int *p, int value)
{
	*p = value;
}

void set_pointer(int **pp, int *new_target)
{
	*pp = new_target;
}

int main(void)
{
	int  a = 10;
	int  b = 99;
	int *p;

	p = &a;
	set_value(p, 25);       /* a becomes 25 */
	set_pointer(&p, &b);      /* p now points to b */
	set_value(p, 77);       /* b becomes 77 */
	return (0);
}
```

### Wrong Example

```c
void broken(int *p)
{
	p = malloc(sizeof(int));  /* WRONG: local copy lost */
	*p = 5;
}

void also_broken(int **pp)
{
	/* WRONG: pp uninitialized */
	*pp = malloc(sizeof(int));
}

int main(void)
{
	int *ptr = NULL;
	broken(ptr);   /* ptr still NULL — leak on heap */
	return (0);
}
```

---

## STOP / THINK

> **STOP** — Draw three boxes: `x`, `p`, `pp` with addresses.

> **THINK** — `int x = 5; int *p = &x; int **pp = &p;`
> 1. What is the type of `*pp`?
> 2. What is the value of `**pp`?
> 3. If you run `(*pp)++;` does `x` change? What about `pp++`?
> 4. Why does C01 `ft_ultimate_ft` need `int ********` for 8 levels?

**Answers:** (1) `int *` (2) `5` (3) `(*pp)++` changes `p`'s address (bad if uncontrolled); `x` unchanged unless p still valid. `pp++` moves pp itself. (4) Each `*` in parameter peels one `&` at call site — extreme drill for indirection mastery.

---

## Common Mistakes

1. **Confusing `*pp` with `**pp`** — one level vs two
2. **Passing `&p` when function expects `int *`** — type mismatch
3. **Not initializing `*pp` before assign** — writing through garbage
4. **Memory leaks** when reassigning `*pp` without freeing old block
5. **Overusing `**`** — often a struct or return value is clearer

---

## Best Practices

- Read declarations **right-to-left**: `int **pp` = pointer to pointer to int
- Draw three columns: variable / address / points-to
- When function must change caller's pointer, signature uses `T **`
- Free old memory before `*pp = malloc(...)`
- For 2D strings, master `char **` early — argc/argv preview

---

## Mini Quiz

1. How many `*` to get an `int` from `int **pp`?
2. Why is `malloc` + single pointer parameter often insufficient?
3. What type is `argv` in `main(int argc, char **argv)`?
4. Expression `*(*pp)` — same as what?

---

## Interview Questions

1. When do you need `int **` instead of `int *`?
2. Explain `char **` as array of strings.
3. Draw memory for swapping two pointers via double pointer.
4. How does `ft_ultimate_range` use `int **` to return an array?

---

## Homework

1. Implement `ft_swap_ptr(int **a, int **b)` swapping what two pointers point to.
2. Draw `char *words[3]` and access `words[2][1]` as pointer steps.
3. Write 5 lines explaining `&` vs `*` at each level.

---

## Extra Challenge

Build a tiny linked list node with `int data` and `struct node *next`. Explain why `next` is a pointer, not a double pointer (until insertion at head).

---

## Summary

**Double pointers** store the address of a pointer. Use them when a function must update **where** a pointer points, or when modeling arrays of pointers (`char **`, linked lists). Peel indirection one `*` at a time and draw every level.

---

## Cheat Sheet

| Item | Remember |
|------|----------|
| Declare | `int **pp;` |
| Get pointer | `*pp` |
| Get value | `**pp` |
| Pass to modify ptr | `func(&p)` with `func(int **pp)` |
| argv | `char **argv` |

---

## Useful Tips

//* Read `int **pp` aloud: "pp is pointer to pointer to int"  
//* Count stars on paper before writing function calls  
//* If lost, make a table: pp / *pp / **pp  
//* C01 ultimate exercises are indirection gym — embrace them  
//* Always initialize caller's pointer before callee writes `*pp`
