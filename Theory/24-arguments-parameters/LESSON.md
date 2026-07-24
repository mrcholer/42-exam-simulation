# Arguments & Parameters

> **Read this lesson completely before the related exercises.**

**Prerequisites:** Functions (23), Variables (10)  
**You will use this in:** C01 (pass by pointer), all function design

---

## Definition

- **Parameter** — variable in the **function definition** that receives a value
- **Argument** — actual value **passed by the caller** during a call

```c
void greet(char *name)   /* name is a PARAMETER */
{
	(void)name;
}

int main(void)
{
	greet("Imad");       /* "Imad" is the ARGUMENT */
	return (0);
}
```

C passes arguments **by value** — the function receives a **copy** of the argument's value.

```c
void ft_ft(int *n);   /* parameter n is a copy of the pointer value (address) */
```

Even pointers are passed by value — the copy points to the same place, which is why you can modify `*n` but not reassign caller's pointer without `**`.

---

## Why This Concept Exists

Functions need inputs. Parameters define the **contract**: what type, how many, in what order. Mixing parameters and arguments causes bugs that compile but behave wrong.

Understanding pass-by-value vs pass-by-pointer is the gateway to C01.

---

## Real Life Analogy

A **form** asks for "Student ID" (parameter slot). You write **12345** on the form (argument). The school keeps a **photocopy** of your form — editing the copy does not change your original ID card unless the copy is a key to your locker (pointer case).

---

## Visual Explanation

### Pass by value (int)

```
Caller:                Callee:
x = 10                 void bump(int n)
   │                   {
   │  bump(x) ───────>     n = 10  (copy)
   │                       n = 11
   │                   }
x still 10  ←──────── copy only
```

### Pass by pointer (int *)

```
Caller:                Callee:
x = 10                 void bump(int *n)
   │                   {
   │  bump(&x) ──────>     n = address of x
   │                       *n = 11
   │                   }
x is 11  ←──────── shared object via address
```

---

## ASCII / Memory Diagrams

```
int x = 5;

ft_ft(&x):

Stack main:          Stack ft_ft:
x @ 1000: 5         n @ 2000: 1000  (copy of address)
                     *n writes to 1000 → x becomes new value
```

### Multiple parameters order matters

```c
void draw(int x, int y);   /* (3, 7) ≠ (7, 3) */
```

---

## Examples

### Correct Example

```c
void ft_swap(int *a, int *b)
{
	int tmp;

	tmp = *a;
	*a = *b;
	*b = tmp;
}

void ft_div_mod(int a, int b, int *div, int *mod)
{
	if (b == 0)
		return ;
	*div = a / b;
	*mod = a % b;
}
```

### Wrong Example

```c
void swap_wrong(int a, int b)
{
	int tmp;

	tmp = a;
	a = b;
	b = tmp;   /* WRONG: only swaps copies */
}

void leak(int *p)
{
	p = malloc(4);  /* WRONG: p is copy — caller never sees malloc */
}
```

---

## STOP / THINK

> **STOP** — Predict memory state.

> **THINK** —
```c
void mystery(int x, int *y) {
	x = 100;
	*y = 200;
}
int main(void) {
	int a = 1, b = 2;
	mystery(a, &b);
}
```
> 1. Value of `a` after call?
> 2. Value of `b`?
> 3. Why?

**Answers:** (1) `1` — int passed by value. (2) `200` — pointer copied but targets `b`. (3) Only `*y` writes through address.

---

## Common Mistakes

1. Expecting swap without pointers
2. Confusing parameter names with caller variable names
3. Wrong argument order
4. Passing uninitialized pointer as argument
5. Missing `&` when function expects pointer

---

## Best Practices

- Match prototype exactly — types and count
- Use pointers for **output parameters** (`div`, `mod`)
- `const` for read-only inputs when appropriate
- Document who owns memory passed as pointer
- `(void)param;` to silence unused parameter warnings in stubs

---

## Mini Quiz

1. Parameter vs argument — define each.
2. Is C pass-by-reference?
3. Why `ft_swap` needs `int *`?
4. What argument matches `char *s`?

---

## Interview Questions

1. Explain pass-by-value with diagram.
2. How do functions return multiple values in C?
3. Java passes objects by reference — compare to C pointers.
4. When pass array vs pointer?

---

## Homework

1. Trace `ft_ultimate_ft` parameters on paper.
2. Write function with 2 inputs + 2 output pointers.
3. List three bugs from swapping copies.

---

## Extra Challenge

Implement `ft_ultimate_range` signature explanation — why `int **range`?

---

## Summary

**Parameters** are placeholders; **arguments** are real values at call time. C copies values into parameters — modify originals only via pointers (addresses). C01 is entirely about learning this distinction.

---

## Cheat Sheet

| Item | Remember |
|------|----------|
| Pass int | Copy — callee can't change original |
| Pass `&x` | Give address — callee can change `x` via `*p` |
| Swap | Needs two pointers |
| Array arg | Decays to pointer — still pass-by-value of pointer |

---

## Useful Tips

//* Say "parameter in definition, argument at call site"  
//* Draw two columns: caller vars / callee params  
//* If original must change, you need pointer parameter  
//* `&` at call, `*` in function — pair them mentally  
//* Wrong arity is a logic bug — match prototypes
