# C10/ex01 — ft_list_push_front

> **1337 / 42 Piscine** · Concepts: list insert front  
> //! Predict memory **before** every line. Do not copy — understand.

---

## Goal

Master **ft_list_push_front** and build intuition for: **list insert front**.

| You will learn | Why it matters |
|----------------|----------------|
| Core pattern for `ft_list_push_front` | Appears again in exams and later modules |
| Memory trace on paper | Stops segfaults before they happen |
| Edge cases | 42 tests hidden inputs |

---

## Required Knowledge

- [C10/README.md](../README.md) module index
- Relevant **Theory/** lessons (see module README)
- Previous exercises in **C10**

---

## The Problem

Implement **ft_list_push_front** following the 42 subject for C10/ex01.

**Key concepts:** list insert front

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
│ (draw yours)│         │ list insert front │
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
| Function | `ft_list_push_front` |
| Concepts | list insert front |
| Compile | `gcc -Wall -Wextra -Werror source.c` |
| Question | Where in memory? |

---

## Reflection

1. What lives on the stack vs heap in this exercise?
2. What happens on the worst valid input?
3. How would you explain this to a peer in 60 seconds?

---

## Summary

**ft_list_push_front** — list insert front. Understand the model, then the syntax.

> Open **QUIZ.md** in the Playground **Quiz** tab to test yourself.
