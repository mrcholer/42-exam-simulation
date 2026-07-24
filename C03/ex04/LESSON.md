# C03/ex04 — ft_strstr

> **1337 / 42 Piscine** · Concepts: substring search  
> //! Predict memory **before** every line. Do not copy — understand.

---

## Goal

Master **ft_strstr** and build intuition for: **substring search**.

| You will learn | Why it matters |
|----------------|----------------|
| Core pattern for `ft_strstr` | Appears again in exams and later modules |
| Memory trace on paper | Stops segfaults before they happen |
| Edge cases | 42 tests hidden inputs |

---

## Required Knowledge

- [C03/README.md](../README.md) module index
- Relevant **Theory/** lessons (see module README)
- Previous exercises in **C03**

---

## The Problem

Implement **ft_strstr** following the 42 subject for C03/ex04.

**Key concepts:** substring search

---

## Thinking Process

1. **Restate** the problem in one sentence aloud.
2. **Inputs/outputs** — types, return value, side effects (stdout?).
3. **Draw memory** — stack boxes before writing code.
4. **Pseudo-code** — no C syntax yet.
5. **One line at a time** — compile often with `-Wall -Wextra -Werror`.
6. **Dry run** — trace a small example on paper.

---

## Algorithm

```
1. Validate inputs (NULL, empty, bounds)
2. Initialize local state on the stack
3. Loop / recurse / process per subject rules
4. Return or output result
```

---

## Memory Diagram

```
Stack ( grows ↓ )
┌────────────┬─────────┬──────────────────────┐
│ variable   │ value   │ notes                │
├────────────┼─────────┼──────────────────────┤
│ (draw yours)│         │ substring search │
└────────────┴─────────┴──────────────────────┘
```

---

## Common Errors

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Wrong loop bounds | Extra/missing output | Trace first/last iteration |
| Uninitialized variable | Random output / crash | Set every local before use |
| Missing `\0` on strings | Garbage after text | C strings need null terminator |
| Using forbidden functions | Moulinette fail | Read subject allowed list |

---

## Practice (before `source.c`)

### Easy
Predict output for smallest valid input.

### Medium
Add a hand trace table (line → memory → stdout).

### Hard
Rewrite using a different approach (loop ↔ recursion).

---

## Cheat Sheet

| Item | Value |
|------|-------|
| Function | `ft_strstr` |
| Concepts | substring search |
| Compile | `gcc -Wall -Wextra -Werror source.c` |
| Question | Where in memory? |

---

## Reflection

1. What lives on the stack vs heap in this exercise?
2. What happens on the worst valid input?
3. How would you explain this to a peer in 60 seconds?

---

## Summary

**ft_strstr** — substring search. Understand the model, then the syntax.

> Open **QUIZ.md** in the Playground **Quiz** tab to test yourself.
