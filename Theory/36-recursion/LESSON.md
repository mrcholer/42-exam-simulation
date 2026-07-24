# Recursion

> **Read this lesson completely before the related exercises.**

**Prerequisites:** Functions (23), Stack (27), Return Values (25)  
**You will use this in:** C00 ex07–08, C05 factorial/fibonacci/power, tree/list advanced

---

## Definition

**Recursion** is when a function **calls itself** to solve a problem by breaking it into smaller **same-shaped** subproblems.

Two required parts:

1. **Base case** — stop condition (no more self-calls)
2. **Recursive step** — call self with problem closer to base

```c
int factorial(int n)
{
	if (n <= 1)
		return (1);           /* base case */
	return (n * factorial(n - 1));  /* recursive step */
}
```

Each call waits for inner call to return — builds a **call stack** of frames.

---

## Why This Concept Exists

Some structures are naturally recursive: factorial, tree traversal, divide-and-conquer. Recursion trades stack space for elegant code matching problem definition.

C05 and exam questions test whether you understand **stack depth** and base cases — not just syntax.

---

## Real Life Analogy

**Russian nesting dolls** — open one doll, find smaller same-shaped doll inside, until you reach the **smallest solid doll** (base case). You cannot open forever — eventually you stop.

---

## Visual Explanation

```
factorial(4):

factorial(4)
  └─> factorial(3)
        └─> factorial(2)
              └─> factorial(1) → returns 1
        returns 2 * 1 = 2
  returns 3 * 2 = 6
returns 4 * 6 = 24
```

---

## ASCII / Memory Diagrams

### Stack during factorial(3)

```
| fact(1) n=1  return 1     |
| fact(2) n=2  wait...      |
| fact(3) n=3  wait...      |
| main                      |
```

Unwind returns multiply upward.

### Missing base case

```
fact(n) calls fact(n-1) forever...

| fact(-999) |
| fact(-998) |
| ...        |
| STACK OVERFLOW → segfault
```

---

## Examples

### Correct Example

```c
int ft_recursive_power(int nb, int power)
{
	if (power < 0)
		return (0);
	if (power == 0)
		return (1);
	return (nb * ft_recursive_power(nb, power - 1));
}

int ft_fibonacci(int index)
{
	if (index < 0)
		return (-1);
	if (index == 0)
		return (0);
	if (index == 1)
		return (1);
	return (ft_fibonacci(index - 1) + ft_fibonacci(index - 2));
}
```

### Wrong Example

```c
int no_base(int n)
{
	return (no_base(n - 1));   /* WRONG: infinite recursion */
}

int fact_bad(int n)
{
	return (n * fact_bad(n - 1));   /* WRONG: no base case */
}

int missing_negative(int n)
{
	if (n == 0)
		return (1);
	return (n * missing_negative(n - 1)); /* WRONG: negative n infinite */
}
```

---

## STOP / THINK

> **STOP** — Trace by hand.

> **THINK** — `ft_recursive_power(2, 3)`:
> 1. How many recursive calls?
> 2. Stack depth?
> 3. Return value?
> 4. What if power is -1 per 42 subject?

**Answers:** (1) 3 calls to power>0 after checks (2→1→0) (2) depth 4 with main (3) 8 (4) return 0 per typical 42 spec.

---

## Common Mistakes

1. No base case
2. Base case unreachable (wrong condition)
3. Not progressing toward base (n+1 instead of n-1)
4. Exponential duplicate work (naive fib without memo)
5. Deep recursion → stack overflow

---

## Best Practices

- Write base case **first**
- Prove each call moves toward base
- Compare iterative version for same task (C05)
- Mind stack limits — very large n may need loop
- Draw call tree before coding

---

## Mini Quiz

1. Two parts every recursion needs?
2. Where do local n values live each call?
3. factorial(0) typically?
4. Iterative vs recursive trade-off?

---

## Interview Questions

1. Explain stack overflow in recursion.
2. Tail recursion — what is it?
3. When avoid recursion?
4. Convert recursion to loop — factorial.

---

## Homework

1. Trace ft_print_combn recursion tree for n=2.
2. Write iterative and recursive factorial — compare stack.
3. Count calls for naive fib(5) — draw tree.

---

## Extra Challenge

Implement recursive string length with pointer advance only.

---

## Summary

**Recursion** solves problems by self-calls with a proven base case. Each call consumes stack — understand depth and termination. C05 makes recursion muscle memory for exams.

---

## Cheat Sheet

| Item | Remember |
|------|----------|
| Base case | Stop recursion |
| Step | Smaller subproblem |
| Stack | One frame per call |
| Risk | Overflow if too deep |
| 42 | Handle negatives per subject |

---

## Useful Tips

//* Always write base case before recursive line  
//* Trace small inputs on paper — n=0,1,2  
//* Infinite recursion feels like hang then crash  
//* Iteration is OK — recursion is thinking tool  
//* Call tree drawings impress evaluators
