# Function Pointers

> **Read this lesson completely before the related exercises.**

**Prerequisites:** Pointers (16), Functions (23)  
**You will use this in:** Callbacks, qsort-style patterns, advanced libft, sorting function arrays

---

## Definition

A **function pointer** stores the **address of a function** so you can call it indirectly.

```c
int add(int a, int b)
{
	return (a + b);
}

int (*op)(int, int);   /* pointer to function taking two ints, returning int */

op = add;
op(3, 4);              /* calls add — result 7 */
(*op)(3, 4);           /* equivalent call syntax */
```

Declaration read: `return_type (*name)(param_types)`

Functions live in **text segment** — their address is callable code location.

---

## Why This Concept Exists

Sometimes behavior must be **selected at runtime** — sort ascending vs descending, apply different operations to data. Function pointers pass **behavior** as data.

They bridge toward callbacks, virtual tables, and event handlers in larger systems.

---

## Real Life Analogy

**Speed dial** on a phone stores a number (address). Pressing dial doesn't type digits each time — it jumps to the saved contact. Function pointer = speed dial for code.

---

## Visual Explanation

```
TEXT segment:
  add()    @ 0x400500
  sub()    @ 0x400520

Stack:
  op ──> 0x400500

call op(2,3)  → CPU jumps to add
```

---

## ASCII / Memory Diagrams

### Array of function pointers

```
operations[3]:

[0] ──> ft_strlen
[1] ──> ft_strcpy
[2] ──> ft_strcmp

idx = 1;
operations[idx](dest, src);   /* indirect call */
```

### Parameter passing callback

```
void apply(int *arr, int n, int (*f)(int))
{
	int i = 0;
	while (i < n)
	{
		arr[i] = f(arr[i]);
		i++;
	}
}
```

---

## Examples

### Correct Example

```c
int square(int x)
{
	return (x * x);
}

int double_val(int x)
{
	return (x * 2);
}

void transform(int *arr, int size, int (*fn)(int))
{
	int i;

	i = 0;
	while (i < size)
	{
		arr[i] = fn(arr[i]);
		i++;
	}
}

int main(void)
{
	int (*func)(int);

	func = square;
	transform((int[]){1, 2, 3}, 3, func);
	func = double_val;
	return (0);
}
```

### Wrong Example

```c
int wrong(void)
{
	int (*p)(void);
	/* WRONG: p uninitialized wild */
	return (p());
}

void mismatch(void)
{
	int (*p)(int, int) = add;
	/* WRONG signature if assigned func with different params — compile error if typed */
}

/* WRONG: confusing function pointer declaration syntax */
int *func(int);        /* function returning int* */
int (*func)(int);      /* pointer to function */
```

---

## STOP / THINK

> **STOP** — Parse declarations.

> **THINK** — What is each?
> 1. `int (*fp)(char *);`
> 2. `int *fp(char *);`
> 3. Parentheses role in function pointer declare?

**Answers:** (1) pointer to func(char*)→int (2) function taking char* returning int* (3) bind * to name as pointer not return type.

---

## Common Mistakes

1. Missing parentheses — `int *fp()` vs `int (*fp)()`
2. Signature mismatch on assign/call
3. Uninitialized function pointer call
4. Confusing function name decay with pointer assign (`func` is address)
5. Returning pointer to local function (nonsensical — functions aren't data on stack that way)

---

## Best Practices

- Use typedef for readability: `typedef int (*t_op)(int, int);`
- Match prototypes exactly
- Initialize before call
- NULL-check function pointers in generic APIs if optional
- Parentheses around `*name` always in declarations

---

## Mini Quiz

1. How store address of ft_strlen?
2. Call syntax through pointer?
3. Where functions live in memory?
4. Why typedef helps?

---

## Interview Questions

1. Function pointer vs switch-case dispatch?
2. qsort comparator signature?
3. Array of functions — use case?
4. Can functions be passed without function pointers in C?

---

## Homework

1. Declare pointer to `void ft_putchar(char c)`.
2. Write apply() using pointer param.
3. Compare `func` and `&func` — same?

---

## Extra Challenge

Sort int array using function pointer compare ascending/descending.

---

## Summary

**Function pointers** hold callable addresses with typed signatures. Parentheses define them; calls look like normal functions. They enable runtime behavior selection — advanced but powerful C feature.

---

## Cheat Sheet

| Item | Syntax |
|------|--------|
| Declare | `ret (*name)(args);` |
| Assign | `name = func;` |
| Call | `name(a,b);` |
| typedef | `typedef ret (*t_fn)(args);` |
| Location | Text segment |

---

## Useful Tips

//* Parentheses around *name — syntax lifesaver  
//* typedef t_compare once, reuse everywhere  
//* Function name decays to address like arrays  
//* Signature must match exactly — compiler enforces  
//* Draw text segment with function addresses
