# Functions

> **Read this lesson completely before the related exercises.**

**Prerequisites:** Variables (10), Compilation (06)  
**You will use this in:** Every C module — C00 onward

---

## Definition

A **function** is a named block of code that performs a specific task. You can **call** it from other places instead of repeating the same instructions.

```c
int add(int a, int b)
{
	return (a + b);
}

int main(void)
{
	int sum;

	sum = add(3, 4);   /* call — sum becomes 7 */
	return (0);
}
```

Parts of a function:

| Part | Example | Role |
|------|---------|------|
| Return type | `int` | What the function gives back |
| Name | `add` | Identifier for calls |
| Parameters | `(int a, int b)` | Inputs |
| Body | `{ ... }` | Instructions |
| return | `return (a + b);` | Send value to caller |

---

## Why This Concept Exists

Programs grow fast. Without functions:

- Code duplicates everywhere (bugs multiply)
- Logic is hard to test in isolation
- Reading `main` becomes impossible

Functions are **reusable machines**: define once, call many times. They also create **stack frames** — isolated workspaces for local variables.

---

## Real Life Analogy

A **vending machine** is a function: you insert coins (arguments), press a button (call by name), and receive a snack (return value). You do not rebuild the machine each time — you reuse it.

The **recipe inside the machine** is the function body — hidden until needed.

---

## Visual Explanation

```
Program flow:

main()
  │
  ├──> ft_putchar('A')  ──> executes, returns
  │
  ├──> add(3, 4)        ──> new frame, computes 7, returns
  │
  └──> return 0

Each call = temporary workspace on the stack
```

---

## ASCII / Memory Diagrams

### Call stack during nested calls

```
Stack ( grows downward conceptually ):

+------------------------+
| main()                 |
|   sum = 7              |
|   return address       |
+------------------------+
| add(3, 4)              |
|   a = 3, b = 4         |
|   return 7             |
+------------------------+
```

When `add` returns, its frame is **destroyed** — locals gone.

### Declaration vs definition

```
/* Declaration (prototype) — in header */
int ft_strlen(char *s);

/* Definition — in .c file */
int ft_strlen(char *s)
{
	...
}
```

Compiler needs prototype before call to check types.

---

## Examples

### Correct Example

```c
#include <unistd.h>

void ft_putchar(char c)
{
	write(1, &c, 1);
}

void ft_print_alphabet(void)
{
	char letter;

	letter = 'a';
	while (letter <= 'z')
	{
		ft_putchar(letter);
		letter++;
	}
}

int main(void)
{
	ft_print_alphabet();
	return (0);
}
```

### Wrong Example

```c
/* WRONG: no prototype, wrong argument types */
int main(void)
{
	ft_putchar();        /* too few args — undefined if not caught */
	ft_putchar('a', 'b'); /* too many */
	return (0);
}

/* WRONG: missing return in non-void function */
int get_answer(void)
{
	/* forgot return — undefined behavior */
}
```

---

## STOP / THINK

> **STOP** — Trace on paper before reading.

> **THINK** — Given:
```c
int triple(int x) { return (x * 3); }
int main(void) {
	int n = 2;
	n = triple(n + 1);
	return (0);
}
```
> 1. What value is passed to `triple`?
> 2. What does `triple` return?
> 3. What is `n` after assignment?
> 4. When is `x` destroyed?

**Answers:** (1) `3` (2) `9` (3) `9` (4) When `triple` returns — end of its stack frame.

---

## Common Mistakes

1. **Calling before prototype** — implicit int legacy issues
2. **Mismatch parameter count/types**
3. **Forgetting return** in non-`void` function
4. **Huge functions** — hard to debug (split them)
5. **Side effects hidden** — function modifies globals unexpectedly

---

## Best Practices

- One function = one clear job (Single Responsibility)
- Use verbs for names: `ft_print`, `ft_swap`, `ft_strlen`
- Put prototypes in header files (C08+)
- Keep functions short enough to draw on one whiteboard
- 42 norm: max 25 lines per function, max 5 functions per file (learn early)

---

## Mini Quiz

1. Difference between `void foo(void)` and `void foo()`?
2. What happens to local variables when function returns?
3. Why use prototypes in `.h` files?
4. Can a function call itself?

---

## Interview Questions

1. Explain function call stack to a beginner.
2. Declaration vs definition — why both?
3. How does the compiler know where to jump back after return?
4. What is recursion preview (link to lesson 36)?

---

## Homework

1. Write `ft_swap` prototype + definition separately.
2. Draw stack for `main → A → B → return`.
3. Split a 40-line main into 3 functions — list names and roles.

---

## Extra Challenge

Implement `ft_iterative_factorial` and trace stack depth for `n=5`.

---

## Summary

**Functions** package reusable behavior with a name, parameters, and optional return value. Each call creates a stack frame with its own locals. Master prototypes, returns, and stack lifecycle before pointers get involved.

---

## Cheat Sheet

| Item | Remember |
|------|----------|
| Prototype | `int foo(int x);` |
| void return | `void foo(void);` — no return value |
| Call | `result = foo(arg);` |
| Locals | Die when function returns |
| Norm | ≤25 lines, descriptive names |

---

## Useful Tips

//* Name functions by what they DO, not how  
//* Draw stack frames in every mentor session  
//* Prototype at top of file or in header — always  
//* If main is long, you need more functions  
//* Read call stack bottom-up: main calls child
