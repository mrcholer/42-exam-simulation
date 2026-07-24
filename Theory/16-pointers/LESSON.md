# Pointers — The Heart of C Programming

> **If you understand pointers, you understand C. If you don't, C will feel like magic until it crashes.**

---

## Definition

A **pointer** is a variable that stores a **memory address** — the location of another value in RAM, not the value itself.

```c
int  n = 42;      // n holds the VALUE 42
int *p = &n;      // p holds the ADDRESS of n
```

| Symbol | Name | Meaning |
|--------|------|---------|
| `int *p` | Pointer declaration | "p points to an int" |
| `&n` | Address-of operator | "where does n live?" |
| `*p` | Dereference operator | "what value lives at this address?" |
| `NULL` | Null pointer | "points nowhere (safe sentinel)" |

---

## Why This Concept Exists

### The Problem

When you call a function in C, arguments are **copied** by default:

```c
void try_to_change(int x)
{
    x = 100;  // changes the COPY, not the original
}

int main(void)
{
    int n = 5;
    try_to_change(n);
    // n is still 5!
}
```

### The Solution

Pass the **address** so the function can find and modify the original:

```c
void really_change(int *x)
{
    *x = 100;  // follows address, changes original
}
```

//! **Pointers exist so functions can share and modify memory efficiently.**

Without pointers: no dynamic memory, no strings, no linked lists, no arrays passed to functions, no `argv`.

---

## Real Life Analogy

### The House Address

- **Variable (`int n = 42`)** = a house with the number **42** painted on it
- **Address (`&n`)** = the street address written on an envelope: "123 Main St"
- **Pointer (`int *p`)** = the envelope holding that address
- **Dereference (`*p`)** = going to that address and reading the number on the house

```
Envelope (pointer p)          House (variable n)
+------------------+          +------------------+
| 123 Main St      |  -----> |  value: 42       |
+------------------+          +------------------+
```

//* You don't live inside the envelope. The envelope tells you WHERE to go.

---

## Visual Explanation — Memory Addresses

Every byte in RAM has an address (like house numbers on a street):

```
Address:   0x1000   0x1001   0x1002   0x1003
         +--------+--------+--------+--------+
         |   42   |   ??   |   ??   |   ??   |  <- int n (4 bytes typically)
         +--------+--------+--------+--------+
              ^
              |
         &n = 0x1000

Pointer p at address 0x2000:
         +------------------+
         |  0x1000          |  <- p stores address of n
         +------------------+
              |
              *p = 42  (go to 0x1000, read value)
```

---

## ASCII Diagrams

### Pointer Declaration and Initialization

```
Step 1: int n = 42;
+------------------+
| n  | 42          |  at 0x1000
+------------------+

Step 2: int *p;
+------------------+
| p  | garbage!    |  at 0x2000  // WARNING: uninitialized!
+------------------+

Step 3: p = &n;
+------------------+
| p  | 0x1000      |  at 0x2000  // now p knows where n is
+------------------+
```

### Dereferencing

```
*p means: "visit the address stored in p"

p = 0x1000  -->  visit 0x1000  -->  read 42
```

---

## Pointer Declaration

```c
int    *p;    // pointer to int
char   *s;    // pointer to char (often used for strings)
double *d;    // pointer to double
```

//? **Question:** Where does `p` itself live?
//* Answer: On the stack (if local) or elsewhere — `p` is ALSO a variable with its own address!

You can get address of a pointer: `&p` — pointer to pointer (see double pointers).

---

## Pointer Initialization

### Correct

```c
int n = 10;
int *p = &n;       // p points to n
int *q = NULL;     // p points nowhere (safe, intentional)
```

### Wrong

```c
int *p;            // WARNING: wild pointer — contains random address
*p = 5;            // SEGFAULT: writing to random memory

int *p = 42;       // ERROR: 42 is not an address (without cast)
```

---

## The & Operator (Address-Of)

```c
int n = 7;
printf("%p\n", (void *)&n);  // prints address like 0x7ffd...
```

**Returns:** memory address of variable `n`.

---

## The * Operator (Two Meanings)

| Context | Meaning | Example |
|---------|---------|---------|
| Declaration | "pointer to" | `int *p;` |
| Expression | "value at address" | `*p = 99;` |

//====================================================
// STOP
Ask students: In `int *p = &n;` how many times does `*` appear and what does each mean?
Continue only after discussion.
//====================================================

---

## NULL Pointers

```c
int *p = NULL;   // intentional: "points to nothing"

if (p == NULL)
    return ;     // safe guard

// *p = 5;       // NEVER if p is NULL — segfault
```

**Why NULL exists:** Gives us a testable "invalid" state. Without it, we'd guess if an address is valid.

See: [Theory/20-null-pointer](../20-null-pointer/LESSON.md)

---

## Dangling Pointers

```c
int *bad(void)
{
    int x = 10;
    return (&x);   // WARNING: x dies when function returns!
}                  // bad now points to freed stack memory
```

The pointer **still holds an address**, but that memory is **reused** — undefined behavior.

See: [Theory/21-dangling-pointer](../21-dangling-pointer/LESSON.md)

---

## Wild Pointers

```c
int *p;          // uninitialized — random address
*p = 42;         // might crash, might corrupt data silently
```

**Always initialize pointers** — to a valid address or `NULL`.

See: [Theory/22-wild-pointer](../22-wild-pointer/LESSON.md)

---

## Void Pointers

```c
void *generic = &n;   // can point to any type
generic = &c;         // can reassign to different types

// Must cast before dereference:
int *ip = (int *)generic;
```

**Use case:** Generic functions (`malloc` returns `void *`).

See: [Theory/18-void-pointer](../18-void-pointer/LESSON.md)

---

## Double Pointers

```c
int n = 5;
int *p = &n;      // p points to n
int **pp = &p;    // pp points to p

**pp = 99;        // same as *p = 99, same as n = 99
```

```
pp --> p --> n
         (5 becomes 99)
```

**Why:** Modify a pointer inside another function (C01 ft_ultimate_ft).

See: [Theory/19-double-pointer](../19-double-pointer/LESSON.md)

---

## Pointers to Arrays

```c
int arr[3] = {10, 20, 30};
int *p = arr;     // arr decays to address of arr[0]

// These are equivalent:
arr[1]    // 20
*(arr+1)  // 20
p[1]      // 20
*(p+1)    // 20
```

//! **Array name = address of first element** (with exceptions — see arrays lesson).

---

## Pointers to Strings

```c
char *str = "Hello";
// str points to read-only memory containing: H e l l o \0

char buf[] = "Hello";
// buf IS an array in writable stack memory
```

| Form | Writable? | Memory |
|------|-----------|--------|
| `char *s = "..."` | Usually NO (literal) | read-only segment |
| `char s[] = "..."` | YES | stack |

---

## Pointers to Functions

```c
int add(int a, int b) { return a + b; }

int (*func_ptr)(int, int) = &add;
func_ptr(2, 3);   // calls add, returns 5
```

Used in: qsort callbacks, state machines, ft_printf.

See: [Theory/41-function-pointers](../41-function-pointers/LESSON.md)

---

## Pointer Arithmetic

```c
int arr[5] = {10, 20, 30, 40, 50};
int *p = arr;

p++;        // moves to NEXT int (not next byte!) — adds sizeof(int)
*p;         // 20
```

```
arr:  [10][20][30][40][50]
       ^
       p

After p++:
arr:  [10][20][30][40][50]
            ^
            p
```

See: [Theory/17-pointer-arithmetic](../17-pointer-arithmetic/LESSON.md)

---

## Passing Pointers to Functions

```c
void ft_swap(int *a, int *b)
{
    int tmp = *a;
    *a = *b;
    *b = tmp;
}

int main(void)
{
    int x = 1, y = 2;
    ft_swap(&x, &y);   // pass ADDRESSES
    // x=2, y=1
}
```

### Memory During ft_swap

```
Before:
x (0x1000): 1     y (0x1004): 2
a = 0x1000        b = 0x1004

After:
x (0x1000): 2     y (0x1004): 1
```

---

## Returning Pointers

### Correct

```c
int *make_int(void)
{
    int *p = malloc(sizeof(int));
    if (!p) return NULL;
    *p = 42;
    return p;    // heap survives after return
}
```

### Wrong

```c
int *broken(void)
{
    int x = 42;
    return &x;   // DANGLING — stack frame destroyed
}
```

---

## Pointer Bugs

| Bug | Symptom | Fix |
|-----|---------|-----|
| NULL deref | Segfault immediately | Check before `*` |
| Dangling | Random values, late crash | Don't return stack address |
| Wild | Random crash/corruption | Initialize to NULL or valid |
| Buffer overflow | Corrupt adjacent data | Bounds checking |
| Memory leak | RAM grows | `free` after `malloc` |
| Double free | Crash | Set pointer to NULL after free |

---

## Segmentation Fault

OS says: **"You touched memory that isn't yours."**

Common causes:
- `*NULL`
- Dangling pointer
- Wild pointer
- Stack overflow

See: [Theory/34-segmentation-fault](../34-segmentation-fault/LESSON.md)

---

## Memory Corruption

Writing past array bounds overwrites **other variables** — may not crash immediately.

// WARNING: Silent corruption is worse than immediate segfault — harder to debug.

---

## Real-World Examples

1. **Linked lists** — each node has `next` pointer
2. **File I/O** — `read()` fills buffer via pointer
3. **Dynamic arrays** — `malloc` returns pointer
4. **Function callbacks** — pointer to function
5. **argv** — `char **argv` array of string pointers

---

## Examples — Correct vs Wrong

### Correct: Swap

```c
void swap(int *a, int *b)
{
    int t = *a;
    *a = *b;
    *b = t;
}
```

### Wrong: Swap without pointers

```c
void swap(int a, int b)  // copies only!
{
    int t = a;
    a = b;
    b = t;
}
```

---

## Common Mistakes

1. **Uninitialized pointer** — always set to `NULL` or valid address
2. **Confusing `*` in declaration vs expression**
3. **Forgetting `&` when passing to function** that needs pointer
4. **Using `*` on non-pointer**
5. **Returning address of local variable**
6. **Not checking `malloc` return**
7. **Comparing strings with `==` instead of strcmp** (compares addresses!)

---

## Best Practices

//* Draw boxes and arrows for every pointer problem
//* Say aloud: "p holds address X, *p is value at X"
//* Initialize every pointer
//* Check for NULL before dereference
//* After `free(p)`, set `p = NULL`
//* Use `-Wall -Wextra -Werror`

---

## Mini Quiz

1. What does `int *p` declare?
2. What is the output difference between `printf("%d", n)` and `printf("%p", &n)`?
3. Why does `ft_swap` need pointers?
4. What is NULL?
5. What happens if you return `&local_var`?

---

## Interview Questions

1. Explain pointer vs reference (if they know C++).
2. Why is `char **argv` not `char *argv`?
3. What is pointer arithmetic and why does `p++` add 4 for `int *`?
4. How would you detect a memory leak?
5. Draw memory for `int a=1, b=2, *p=&a; *p=3;`

---

## Homework

1. Draw memory for every example in this lesson.
2. Predict output of 5 pointer snippets (write before running).
3. Explain to a roommate why `ft_ft` (C01) exists.

---

## Extra Challenge

Implement `ft_swap`, `ft_ft`, and a function that reverses an array using only pointers (no `[]` syntax).

---

## Summary

| Concept | One line |
|---------|----------|
| Pointer | Variable holding an address |
| `&` | Get address |
| `*` | Follow address / declare pointer |
| NULL | Points nowhere — check it |
| Why | Share memory, modify originals, heap, data structures |

**Master pointers = master C.**

---

## Cheat Sheet

```
Declaration:  type *name;
Address-of:   &variable
Dereference:  *pointer
Null:         NULL
Valid pattern: if (p) { use *p; }
Invalid:      return &local;
Array:        arr[i] == *(arr+i)
```

---

## Useful Tips

//! Never rush C01 — pointers are the foundation for everything until graduation
//? Ask "where?" before every pointer line
//* When stuck, print addresses: `printf("p=%p *p=%d\n", (void*)p, *p);`
// NOTE: 1337 exams WILL test pointer tracing on paper
