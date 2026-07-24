# Data Types

> **1337 Piscine — Theory 11**  
> Phase 0, Day 5 · A data type tells the compiler how many bytes to use and how to interpret them.

---

## Definition

A **data type** is a classification that specifies:

1. **Size** — how many bytes a value occupies in memory  
2. **Interpretation** — how bits are read (integer, character, etc.)  
3. **Valid operations** — what you can do (`+` on ints, not on random pointers yet)

Common C types at 1337 start:

| Type | Typical size | Holds |
|------|--------------|-------|
| `char` | 1 byte | Small integer or ASCII character |
| `int` | 4 bytes (often) | Integer |
| `unsigned int` | 4 bytes | Non-negative integer |
| `long` | 4 or 8 bytes | Larger integer (platform-dependent) |
| `float` | 4 bytes | Approximate decimal |
| `double` | 8 bytes | More precise decimal |

//! Important: **`sizeof(type)`** tells you bytes on **your** machine. Do not guess — measure.

---

## Why This Concept Exists

Memory is raw bytes. The type is the **contract** between you and the compiler:

- How much RAM to allocate for a variable  
- How to encode literals (`'A'` vs `65` vs `"A"`)  
- Which instructions the CPU uses (integer add vs float add)

Wrong type → wrong size → adjacent memory corrupted → bugs that look supernatural.

1337 focuses early on **`char`** and **`int`** — master those before exotic types.

---

## Real Life Analogy

### Different sized containers

| Container | Holds | Wrong use |
|-----------|-------|-----------|
| Shot glass | 30 ml | Pouring 1 liter — overflow |
| Pitcher | 1 liter | OK for juice |
| Envelope | letter paper | Do not ship bricks |

Type = container size + shape. Value = what you put inside.

### Same box, different label

One byte `01000001`:

- Labeled **`char`**: often character `'A'`  
- Labeled **`unsigned char`**: number 65  
- Same bits — **interpretation** differs

---

## Visual Explanation

### Type sizes in memory row

```
char c = 'A';          int n = 65;

c (1 byte):           n (4 bytes, typical):
┌────┐                ┌────┬────┬────┬────┐
│ 65 │                │  0 │  0 │  0 │ 65 │
└────┘                └────┴────┴────┴────┘
0x1000                0x1000–0x1003
```

Same numeric idea (65) — **different footprint**.

### Type family tree (Phase 0 subset)

```
Integer family          Character          Floating (later)
├── char                └── char (1 byte)   ├── float
├── int                                     └── double
├── unsigned int
└── long
```

---

## ASCII Diagrams

### `sizeof` inspection

```c
#include <stdio.h>

int main(void)
{
    printf("%zu\n", sizeof(char));
    printf("%zu\n", sizeof(int));
    return (0);
}
```

Typical output on many Linux systems: `1` and `4` — **verify on your cluster**.

### Signed vs unsigned (preview)

```
signed char:   -128 to 127   (8 bits, one sign bit)
unsigned char:    0 to 255
```

// WARNING: Mixing signed/unsigned causes subtle bugs — know your range.

---

## Memory Diagrams

### Adjacent variables — why size matters

```c
char a = 'X';
char b = 'Y';
int n = 1000;
```

```
Address     Name    Size    Content
0x2000      a       1       'X' (88)
0x2001      b       1       'Y' (89)
0x2002      (pad?)  ?       compiler may align int to 4-byte boundary
0x2004      n       4       1000 (4 bytes)
```

//? Question: Can `char` hold 300?  
// NOTE: Plain `char` on many systems: **no** (max 127 signed or 255 unsigned). Overflow / implementation-defined behavior.

### Array of chars vs one int (preview Lesson 15)

```
char s[4] = "Hi";   /* 4 bytes: 'H' 'i' '\0' + maybe padding in other contexts */

int x = 2;          /* 4 bytes single integer */
```

---

## Examples

### Example 1: Explicit types required

```c
int count = 0;
char marker = '#';
unsigned int port = 8080;
```

### Example 2: Character vs integer literal

```c
char c = 'A';     /* character literal — value 65 */
char d = 65;      /* integer literal — same bits in c and d */
int n = 'A';      /* valid — n becomes 65 (int type) */
```

### Example 3: `write` needs byte count (C00)

```c
write(1, "Hello\n", 6);
/* 6 bytes — count matches char bytes sent */
```

Type **`char`** underlies each transmitted byte.

---

## Wrong Examples

### Wrong: Assume all ints are 2 bytes

```c
/* old embedded habit — wrong on 1337 Linux */
int x;   /* often 4 bytes — use sizeof */
```

### Wrong: Store big number in char

```c
char score = 200;   /* may warn or wrap depending on signedness */
```

### Wrong: `%d` for char without promotion understanding

```c
char c = 'A';
printf("%d", c);    /* prints 65 — OK */
printf("%c", 65);   /* prints A — promotion rules apply */
```

### Wrong: Using undeclared type

```c
string name = "Imad";   /* no 'string' type in C — use char * or char[] */
```

---

## Correct Examples

### Correct: Use `sizeof` when size matters

```c
if (sizeof(int) == 4)
    /* common on many clusters */
```

Full lesson on `sizeof` in Theory 40 — preview here.

### Correct: Match format specifier to type (preview)

```c
int x = 42;
char c = 'Z';
/* printf allowed in some contexts; early 1337 uses write() */
/* concept: int → numeric, char → byte/character */
```

### Correct: Choose smallest type that fits (when norm allows)

```c
char digit = '7';   /* when you know it's one ASCII digit */
```

---

## Common Mistakes

| Mistake | Reality |
|---------|---------|
| Ignoring `sizeof` | Sizes vary by platform |
| Confusing `char` with `string` | Strings are arrays of `char` (Lesson 14) |
| Signed overflow assumptions | Undefined behavior in many cases |
| Using `float` for money | Rounding errors — use integers (cents) |
| Casting randomly | Casts reinterpret bits — dangerous without understanding |

---

## Best Practices

1. **Run `sizeof`** on every type you use — once per machine.
2. **Use `int` for general integers**, `char` for characters/small bytes.
3. **Know ASCII range** 0–127 for standard chars (Lesson 12).
4. **Draw byte widths** next to variable names in diagrams.
5. **Read compiler warnings** about sign comparison and truncation.

---

## STOP — Think

1. How many bytes is `char` on your system?
2. Same bits `01000001` — possible values as char and as int?
3. Why does C require a type on every variable?

---

## LIVE DEMO — Meeting Block

| Step | Task |
|------|------|
| 1 | Small program printing `sizeof(char)`, `sizeof(int)`, `sizeof(long)` |
| 2 | Draw 3 variables of different types in memory with correct widths |
| 3 | Partner quizzes: "Which type for age 25? For letter 'Z'?" |

---

## Mini Quiz

1. What two things does a type specify?
2. Typical size of `int` on 1337 Linux?
3. Difference between `char c = 'A'` and `char c = 65`?
4. What function/operator reveals type size?
5. Can `float` and `int` share the same memory interpretation?

---

## Interview Questions

1. Why are there different integer types?
2. Signed vs unsigned — when use each?
3. What is integer overflow?
4. Explain why `char` is numeric at heart.
5. Platform-dependent types — examples?

---

## Homework

1. Print sizes of: `char`, `short`, `int`, `long`, `float`, `double`.
2. Draw memory layout for mixed declarations in one function.
3. Make table: type → size → typical range.

---

## Extra Challenge

Research **fixed-width types**: `uint8_t`, `int32_t` (`<stdint.h>`).  
When are they useful vs plain `int`? (5 sentences)

---

## Summary

- **Types** define **size** and **meaning** of memory.
- **`char`** = 1 byte; **`int`** = often 4 bytes — verify with **`sizeof`**.
- Same bits can be interpreted differently based on type.
- Choosing wrong type → overflow, wasted space, or corruption.
- Early 1337: focus **`char`** and **`int`** — foundation for strings and loops.

---

## Cheat Sheet

| Type | Typical bytes | Use case |
|------|---------------|----------|
| `char` | 1 | Character, small byte |
| `int` | 4 | General counting |
| `unsigned int` | 4 | Non-negative only |
| `long` | 4/8 | Bigger ints |
| `float` | 4 | Decimals (approx) |
| `double` | 8 | Better decimals |

```c
sizeof(char)   /* usually 1 */
sizeof(int)    /* often 4 on 1337 */
```

---

## Useful Tips

//* Write type and byte size in margin of every memory diagram.  
//* `'A'` and 65 are the same for char — ASCII lesson next.  
// NOTE: Theory 40 deep-dives `sizeof`.  
// WARNING: Never assume `int` is 4 without checking — but many 1337 environments use 4.

---

**Previous:** [10 — Variables](../10-variables/LESSON.md) · **Next:** [12 — ASCII](../12-ascii/LESSON.md)
