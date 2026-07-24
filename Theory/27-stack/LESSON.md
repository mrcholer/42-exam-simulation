# Stack

> **Read this lesson completely before the related exercises.**

**Prerequisites:** Memory (03), Functions (23)  
**You will use this in:** Understanding locals, recursion, segfaults, C07 contrast with heap

---

## Definition

The **stack** is a region of memory used for **automatic, short-lived** data: function call frames, local variables, and return addresses.

Key properties:

- **Automatic** — created when function is called, destroyed when it returns
- **Fast** — pointer bump (push/pop), no manual free
- **Limited size** — typically a few MB (overflow = stack overflow)
- **LIFO** — Last In, First Out (last called function finishes first)

```c
void foo(void)
{
	int x = 10;   /* x lives on the stack — gone when foo returns */
}
```

---

## Why This Concept Exists

Every function call needs temporary workspace. The CPU and OS use a stack so nested calls know **where to return** and each function gets **fresh locals** without manual bookkeeping.

Without the stack, recursion and nested calls would be impractical.

---

## Real Life Analogy

A **stack of plates** in a cafeteria: you add plates on top (push), take from top (pop). The last plate placed is the first removed. Each function call adds a plate; return removes it.

You would not store groceries forever on the plate stack — same for long-lived data (use heap instead).

---

## Visual Explanation

```
Call sequence: main → bar → foo → returns → bar → returns → main

Stack growth (conceptual, often downward in diagrams):

    ┌─────────────┐
    │ foo()       │  ← top while foo runs
    │   locals    │
    ├─────────────┤
    │ bar()       │
    │   locals    │
    ├─────────────┤
    │ main()      │
    │   locals    │
    └─────────────┘
```

---

## ASCII / Memory Diagrams

### Local variables in stack frame

```
main() frame:
+------------------+
| return to OS     |
| argc, argv ...   |
| int i = 0        |  @ 0x7fff1000
| char c = 'x'     |  @ 0x7fff0ffc
+------------------+
```

Addresses often **decrease** as stack grows — platform dependent, but **relative order** matters for learning.

### Recursion stack buildup

```
fact(3) calls fact(2) calls fact(1):

| fact(1) n=1 |
| fact(2) n=2 |
| fact(3) n=3 |
| main        |

Unwind on return — frames pop one by one
```

---

## Examples

### Correct Example

```c
int sum_three(int a, int b, int c)
{
	int total;

	total = a + b + c;
	return (total);    /* total destroyed after return — value copied out */
}

int main(void)
{
	int arr[100];      /* stack array — dies at end of main */
	int x;

	x = sum_three(1, 2, 3);
	return (0);
}
```

### Wrong Example

```c
int *bad(void)
{
	int local = 42;
	return (&local);   /* WRONG: stack memory invalid after return */
}

void huge(void)
{
	char buf[10000000];   /* WRONG: may stack overflow */
	(void)buf;
}
```

---

## STOP / THINK

> **STOP** — Draw stack frames.

> **THINK** —
```c
void a(void) { int x = 1; b(); }
void b(void) { int y = 2; }
int main(void) { a(); return (0); }
```
> 1. How many frames on stack inside `b`?
> 2. When is `x` destroyed?
> 3. Can two functions share same stack variable name safely?

**Answers:** (1) main + a + b = 3. (2) When `a` returns (after `b` returns). (3) Yes — separate frames, separate `x`s.

---

## Common Mistakes

1. Returning pointer to stack variable
2. Large arrays on stack in recursive functions
3. Assuming stack variables zero-initialized (they are not, unless static)
4. Infinite recursion → stack overflow
5. Confusing stack with heap allocation

---

## Best Practices

- Stack for small, short-lived data
- Return values, not addresses of locals
- Watch recursion depth
- Large buffers → malloc (heap)
- Draw call stack when debugging

---

## Mini Quiz

1. Who allocates stack frames?
2. What happens to locals on return?
3. Stack overflow symptom?
4. Stack vs heap speed?

---

## Interview Questions

1. Explain stack to non-programmer.
2. Why can't you return &local safely?
3. How does stack enable recursion?
4. Typical stack size on Linux?

---

## Homework

1. Draw stack for 3-level nested calls.
2. Estimate size of `int arr[1000]` on stack.
3. Write one-line rule: stack vs heap choice.

---

## Extra Challenge

Trace recursive factorial stack depth for n=5 — count frames.

---

## Summary

The **stack** holds temporary function data — automatic, fast, limited. Locals die when their function returns. Never return stack addresses. Pair this lesson with **Heap (28)** for complete memory picture.

---

## Cheat Sheet

| Item | Remember |
|------|----------|
| Lifetime | Function call duration |
| Allocation | Automatic |
| Free | Automatic on return |
| Size limit | Small — don't allocate huge arrays |
| Return &local | Forbidden |

---

## Useful Tips

//* Every function call = new stack plate  
//* Recursion = many plates — depth matters  
//* "Where does it live?" → if local, stack  
//* Stack overflow feels like instant crash — check recursion  
//* Compare addresses of locals — often descending
