# Return Values

> **Read this lesson completely before the related exercises.**

**Prerequisites:** Functions (23), Data Types (11)  
**You will use this in:** Every exercise — conditions, recursion, malloc functions

---

## Definition

A **return value** is data a function sends **back to the caller** using the `return` statement.

```c
int ft_is_negative(int n)
{
	if (n < 0)
		return (1);
	return (0);
}
```

Rules:

- Return type in prototype must match returned expression
- `void` functions return nothing — use bare `return;`
- Execution stops at `return` — code below is skipped
- Caller can ignore return: `ft_strlen(s);` — wasteful but legal
- Caller can store: `int len = ft_strlen(s);`

---

## Why This Concept Exists

Functions compute results. Without return values, every function would need pointer out-parameters for even simple questions like "is this negative?" or "how long is this string?"

Return values make code readable: `if (ft_isalpha(c))` reads like English.

---

## Real Life Analogy

You ask a friend **"Is it raining?"** They answer **"yes"** or **"no"** — that's the return value. You don't need them to rewrite your notebook (pointer output) for a simple boolean answer.

For **"What's the weather forecast?"** they might hand you a full report (return pointer to struct/string).

---

## Visual Explanation

```
int square(int x)
{
	return (x * x);     ──> value placed where caller expects
}

main:
	result = square(5);
	
Flow: square runs → computes 25 → frame destroyed → 25 copied to result
```

---

## ASCII / Memory Diagrams

### Return on stack

```
Before return from square(5):

square frame:  x = 5, computing 25

After return:

main frame: result = 25     square frame GONE
```

### Returning pointer (heap)

```
char *ft_strdup(...)

heap: [ copy of string ]  ←── return address to caller
                              caller's s points here
                              caller must free later
```

### Early return paths

```
int safe_div(int a, int b)
{
	if (b == 0)
		return (0);      /* path 1 */
	return (a / b);      /* path 2 */
}
/* every path in non-void function should return */
```

---

## Examples

### Correct Example

```c
int ft_factorial(int n)
{
	int result;

	if (n < 0)
		return (0);
	if (n == 0)
		return (1);
	result = 1;
	while (n > 0)
	{
		result *= n;
		n--;
	}
	return (result);
}

char *ft_strdup(const char *src)
{
	char *dup;
	/* ... allocate ... */
	if (!dup)
		return (NULL);   /* signal failure */
	return (dup);
}
```

### Wrong Example

```c
int broken(void)
{
	/* WRONG: no return — undefined behavior */
}

int *bad(void)
{
	int x = 5;
	return (&x);   /* WRONG: dangling pointer returned */
}

int confusing(int n)
{
	if (n > 0)
		return (1);
	/* WRONG: missing return when n <= 0 */
}
```

---

## STOP / THINK

> **STOP** — Trace each path.

> **THINK** —
```c
int pick(int n) {
	if (n > 10) return (100);
	if (n > 5) return (50);
	return (n);
}
```
> What does `pick(7)`, `pick(3)`, `pick(20)` return?

**Answers:** `50`, `3`, `100`.

---

## Common Mistakes

1. Missing return on some branches
2. Returning address of local variable
3. Ignoring malloc failure return (NULL)
4. Wrong return type (implicit conversions hiding bugs)
5. Returning inside loop accidentally — logic cut short

---

## Best Practices

- Every non-void path returns a value
- Use return codes: `0` success, non-zero error (common pattern)
- Return NULL on allocation failure — document it
- Prefer single cleanup return in complex functions when norm allows
- Match 42 style: `return (value);` with parentheses

---

## Mini Quiz

1. Can `void` function use `return;`?
2. What should `malloc` failure functions return?
3. Is return value copied or referenced for `int`?
4. Why return `char *` from `ft_strdup`?

---

## Interview Questions

1. How return large struct vs pointer?
2. Multiple return points — good or bad?
3. Explain return value optimization (conceptual).
4. Error handling without exceptions in C?

---

## Homework

1. Write function with three early returns — draw paths.
2. Fix `confusing` to return on all branches.
3. Compare return vs out-parameter for `div/mod`.

---

## Extra Challenge

Implement `ft_range` returning malloc'd array or NULL — document ownership.

---

## Summary

**Return values** pass results from callee to caller. Match types, return on every path, never return dangling addresses. Use NULL for pointer failure. Returns make functions composable building blocks.

---

## Cheat Sheet

| Type | Return example |
|------|----------------|
| int | `return (0);` |
| char * | `return (dup);` or `NULL` |
| void | `return;` only |
| bool-like | `return (1);` / `return (0);` |

---

## Useful Tips

//* Ask: "What does caller need back?"  
//* Pointer return = often heap — who frees?  
//* Check every if-branch returns in non-void functions  
//* `-Wreturn-type` catches missing returns  
//* Read call site: `x = foo()` — foo must provide x's meaning
