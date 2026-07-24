# Variables

> **1337 Piscine — Theory 10**  
> Phase 0, Day 5 · A variable is a named place in memory that holds a value.

---

## Definition

A **variable** is a **name** your program uses to refer to a **memory location** where a value of a specific **type** is stored.

```c
int score = 10;
```

| Part | Meaning |
|------|---------|
| `int` | Type — how many bytes and how to interpret bits |
| `score` | Identifier — human-readable name for an address |
| `=` | Assignment — write value into that memory |
| `10` | Value stored |

//! Important: The **name** `score` is for humans and the compiler. The **CPU** uses **addresses**. Always think: "10 is stored at the address bound to score."

---

## Why This Concept Exists

Programs process changing data — scores, counts, characters, flags. Hard-coding values inside logic would require rewriting code for every situation.

Variables let you:

1. **Store** intermediate results (sum, index, temp).
2. **Reuse** values by name instead of memorizing addresses.
3. **Change** state over time (`count = count + 1`).
4. **Read** input into memory for processing.

At 1337 Level 4, you draw **before/after memory** for every assignment. Variables are where those values live.

---

## Real Life Analogy

### Labeled storage box

```
Box on shelf labeled "score" contains paper with number 10.

You say "check score" — assistant goes to labeled box, reads 10.
You say "score = 15" — assistant replaces paper with 15.

The label is not the number. The box location is not the label.
```

### Whiteboard variable in math class

Teacher writes: `x = 5`  
Later: `x = x + 2`  

`x` is a **name** for "whatever value we currently store." The **value** changes; the **name** stays.

---

## Visual Explanation

### Declaration vs assignment

```
int age;        /* declare — reserve memory, name it "age" (value uninitialized!) */
age = 20;       /* assign — WRITE value 20 into that memory */

int score = 10; /* declare + initialize — one step, safer */
```

### Variable lifetime (simplified)

```
Program starts → variables in main created
Function called → its local variables created
Function returns → its locals destroyed (memory reclaimed)
Program ends → all gone
```

// NOTE: Details in stack lesson (27). For now: variables exist while their scope runs.

---

## ASCII Diagrams

### Name → address → value chain

```
SOURCE CODE          COMPILER MAP           RAM
───────────          ────────────           ───

score = 10;    →    score → 0x7FFC08   →   [ 10 ]
age = 20;      →    age   → 0x7FFC0C   →   [ 20 ]
```

You never type `0x7FFC08` — compiler handles mapping.

### Assignment overwrites

```
Before:  score ──► [ 10 ]
After:   score = 99;
After:   score ──► [ 99 ]     ← 10 is gone forever
```

---

## Memory Diagrams

### Single `int` variable

```
int x = 42;

Address (example)    Variable name    Value (decimal)    Bytes (conceptual)
0x7FFE10             x                42                 00 00 00 2A
                                                          (4 bytes for int)
```

### Multiple variables

```
int a = 1;
int b = 2;
int c = 3;

Address     Name    Value
0x1000      a       1
0x1004      b       2
0x1008      c       3
```

//? Question: After `c = a + b;`, what is in memory?  
// NOTE: `a` still 1, `b` still 2, `c` becomes 3 — addition reads a and b, writes c.

### Before and after swap preview (C01 mental prep)

```
Before swap a,b:     a→[3]  b→[7]
After successful swap: a→[7]  b→[3]
```

Variables are **cells** — swap exchanges **contents** of two cells.

---

## Examples

### Example 1: Read and write

```c
int count;

count = 0;       /* WRITE 0 */
count = count + 1; /* READ count (0), ADD 1, WRITE 1 */
count = count + 1; /* READ 1, WRITE 2 */
```

Trace memory each line.

### Example 2: Character variable (links to Lesson 13)

```c
char letter = 'A';
```

```
letter's byte holds 65 (ASCII) — not the glyph 'A' in memory
```

### Example 3: Why initialization matters

```c
int x;
/* x contains garbage — unknown previous RAM content */
int y = 0;
/* y contains 0 — predictable */
```

---

## Wrong Examples

### Wrong: Variable name inside memory

```
RAM cell does not store the string "score" next to 10.
It stores bits for 10. Name exists only in source/debug symbols.
```

### Wrong: Uninitialized use

```c
int total;
total = total + 5;   /* READ garbage, undefined behavior territory */
```

// WARNING: Reading uninitialized variables is a serious bug.

### Wrong: Confusing assignment with equality

```c
if (x = 5)   /* assignment — often wrong in conditions */
if (x == 5)  /* comparison — intended in if */
```

### Wrong: Magic without type

```c
score = 10;   /* compiler error — unknown type for score */
```

---

## Correct Examples

### Correct: Declare type, initialize early

```c
int index = 0;
char c = '\0';
```

### Correct: Trace every assignment on paper

```c
int a = 5;
int b = a + 3;
```

```
After line 1: a=5
After line 2: a=5, b=8
```

### Correct: Meaningful names

```c
int student_count = 30;   /* clearer than int x = 30; for humans */
```

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using variable before declare | Declare at top of block (C99 allows mid-block) |
| Assuming zero default | Local ints are NOT auto-zero — initialize |
| `=` vs `==` | Assignment vs comparison |
| Changing type mid-way | `int x; float x;` illegal redeclaration |
| Ignoring memory size | `int` uses fixed bytes regardless of small value |

---

## Best Practices

1. **Initialize** every variable when declared.
2. **Draw memory** after each assignment while learning.
3. **Use clear names** — `i`, `j` OK for loops; not for everything.
4. **One variable, one purpose** — avoid reusing `temp` for unrelated things.
5. **Ask**: READ or WRITE operation on this line?

---

## STOP — Think

1. What three things does `int x = 7;` tell the compiler?
2. After `x = x + 1;`, how many WRITEs to x's address happened?
3. Where does the value live — in the name or in memory?

---

## LIVE DEMO — Meeting Block

| Step | Activity |
|------|----------|
| 1 | Partner writes 5 assignment lines |
| 2 | You draw memory table after each line |
| 3 | Swap roles with `char` variables |
| 4 | Discuss one uninitialized variable disaster story |

---

## Mini Quiz

1. What is a variable in one sentence?
2. Difference between declaration and assignment?
3. Are local variables auto-initialized to 0 in C?
4. What does `x = x + 1` do in memory terms?
5. Can two variables share the same name in one scope?

---

## Interview Questions

1. Variable vs constant (preview `const` Lesson 39)?
2. Explain "variable is a named memory location."
3. What is scope? (Brief — block/function)
4. Why initialize variables?
5. Trace memory for three lines of assignments.

---

## Homework

1. Draw memory for:
   ```c
   int a = 1;
   int b = 2;
   int c = a + b;
   b = c;
   ```
2. List every READ and WRITE in homework 1.
3. Find one bug using uninitialized variable in peer code (review).

---

## Extra Challenge

Write 10 lines of pseudo-code using only variables (no functions).  
Draw final memory state. Label each operation READ/WRITE.

---

## Summary

- A **variable** binds a **name** to a **typed memory location**.
- **Assignment** writes a new value, **destroying** the old one.
- **Declaration** reserves memory; **initialization** writes first value.
- Locals are **not** auto-zero — always initialize.
- Master memory tracing now — pointers (Lesson 16) extend this exact model.

---

## Cheat Sheet

| Concept | Syntax example |
|---------|----------------|
| Declare | `int x;` |
| Initialize | `int x = 0;` |
| Assign | `x = 42;` |
| Read | `y = x + 1;` |
| Identifier rules | letters, digits, `_`; no reserved words |

**Memory mantra:** Name → address → bytes → value

---

## Useful Tips

//* Every `=` is a WRITE unless part of `==`.  
//* Say "binds to address" not "stores the name in RAM."  
// NOTE: Lesson 11 covers types and sizes.  
// WARNING: Moulinette cares about norm — declare at top of function in C89 style if required.

---

**Previous:** [09 — Libraries](../09-libraries/LESSON.md) · **Next:** [11 — Data Types](../11-data-types/LESSON.md)
