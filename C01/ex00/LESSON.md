# C01/ex00 — ft_ft

## Goal

Write **`ft_ft`**: a function that receives a pointer to an `int` and sets the **original** variable to **42**.

This is your first **pass-by-address** exercise. The function body is one line — the learning is entirely in **why** that line works and **what happens in memory**.

> //! Do not memorize. Predict memory state before every line.

---

## Required Knowledge

Complete before starting:

| Theory | Topic | Why |
|--------|-------|-----|
| [Theory/16-pointers](../../Theory/16-pointers/LESSON.md) | Pointers, `&`, `*` | Core of this exercise |
| [Theory/24-arguments-parameters](../../Theory/24-arguments-parameters/LESSON.md) | Pass by value vs pointer | Why `int n` fails but `int *n` works |
| [Theory/23-functions](../../Theory/23-functions/LESSON.md) | Function calls, stack frames | Trace caller + callee |
| [Theory/10-variables](../../Theory/10-variables/LESSON.md) | Variables live in memory | Every box has an address |

**Prerequisites:** C00 complete (functions, `return`, basic types).

---

## The Problem (1337 Subject)

Create a function with this prototype:

```c
void ft_ft(int *nbr);
```

**Behavior:** When called with a valid pointer to an `int`, the integer at that address becomes `42`.

**Example usage:**

```c
int number;

number = 0;
ft_ft(&number);
// number is now 42
```

---

## Concepts

| Concept | One-line definition |
|---------|---------------------|
| **Pointer** | Variable that stores a memory address |
| **`&` (address-of)** | "Where does this variable live?" |
| **`*` (dereference)** | "What value lives at this address?" |
| **Pass by value** | Function gets a **copy** — changes to the copy don't affect the original |
| **Pass by address** | Function gets the **address** — can modify the original through `*` |

---

## Why This Exercise Exists

In C00 you wrote functions like `ft_putchar` that **output** a result. Many real problems need a function to **modify** a variable the caller already owns:

- Swap two numbers (`ft_swap`)
- Return quotient and remainder (`ft_div_mod`)
- Fill an array in place (`ft_rev_int_tab`)

C cannot "return two values" cleanly without structs or pointers. **`ft_ft` is the smallest possible example** of: *"I give you my address — write there."*

---

## Thinking Process

1. **Restate:** "Someone has an `int`. I need to change it to 42 from inside a function."
2. **Why pass-by-value fails:** If you pass `number`, the function gets a copy. Changing the copy leaves `number` untouched.
3. **What you need:** The **address** of `number` so you can write to the same memory cell.
4. **Draw memory** before writing code (see **VISUALS.md**).
5. **Write one line:** `*nbr = 42;`
6. **Trace by hand** with `number = 0` before the call.

---

## Pass by Value vs Pass by Address

### Wrong approach (does NOT work)

```c
void try_change(int n)
{
    n = 42;   /* changes the COPY only */
}

int main(void)
{
    int number;

    number = 0;
    try_change(number);
    /* number is still 0 */
}
```

### Correct approach (this exercise)

```c
void ft_ft(int *nbr)
{
    *nbr = 42;   /* writes through address to original */
}

int main(void)
{
    int number;

    number = 0;
    ft_ft(&number);
    /* number is now 42 */
}
```

---

## Algorithm

```
1. Receive pointer parameter nbr (copy of an address)
2. Dereference nbr: follow address to the caller's int
3. Write 42 into that memory location
4. Return (void — no return value needed)
```

---

## Pseudo Code

```
function ft_ft(nbr):
    if nbr is invalid: (1337 subject does not require check — know the risk)
    value_at_address(nbr) ← 42
    return
```

---

## Flow

```
START
  │
  ▼
Caller has int `number` on stack
  │
  ▼
Caller passes &number ──► ft_ft receives copy of address in nbr
  │
  ▼
*nbr = 42  ──► WRITE to memory at that address
  │
  ▼
Caller sees number == 42
  │
  ▼
END
```

---

## Dry Run

**Before call:**

| Variable | Address | Value |
|----------|---------|-------|
| `number` (main) | `0x7ffd1000` | `0` |

**Call:** `ft_ft(&number)`

| Variable | Address | Value |
|----------|---------|-------|
| `nbr` (ft_ft) | `0x7ffd2000` | `0x7ffd1000` (copy of address) |

**After `*nbr = 42`:**

| Variable | Address | Value |
|----------|---------|-------|
| `number` (main) | `0x7ffd1000` | **`42`** |
| `nbr` (ft_ft) | `0x7ffd2000` | `0x7ffd1000` (unchanged) |

Full diagrams: **VISUALS.md**.

---

## Memory Visualization

See **VISUALS.md** for stack frames, arrows, and step-by-step ASCII diagrams.

---

## Time Complexity

| Case | Complexity | Reason |
|------|------------|--------|
| Best / Average / Worst | **O(1)** | Single assignment through pointer |

---

## Space Complexity

| Structure | Space |
|-----------|-------|
| Parameter `nbr` | O(1) — one pointer on stack |
| Locals | O(1) — none beyond parameter |
| Heap | O(1) — none |

---

## Allowed Functions

Per 1337 C01 norm: your function uses only assignment. No library calls required inside `ft_ft`.

For your test `main` (local only, not submitted): `write` is fine.

---

## Submission Checklist

- [ ] File named correctly per your school's C01 layout
- [ ] Function name: `ft_ft`
- [ ] Prototype: `void ft_ft(int *nbr);`
- [ ] Body: `*nbr = 42;`
- [ ] Norm: tabs, no forbidden functions, ≤ 25 lines per function
- [ ] Compiles with `-Wall -Wextra -Werror`
- [ ] You can **draw** memory and **explain** every symbol

---

## Common Mistakes

See **COMMON_ERRORS.md**.

---

## Extra Challenges

See **EXERCISES.md**.

---

## Reflection Questions

1. What is stored **inside** `nbr` — the value 42 or something else?
2. If `nbr` holds `0x7ffd1000`, what does `*nbr` mean in plain English?
3. Why does the caller write `ft_ft(&number)` and not `ft_ft(number)`?
4. Is the pointer itself passed by value or by reference? (Trick question — read Theory/24.)
5. What happens if you call `ft_ft(NULL)`?

---

## Summary

**`ft_ft`** teaches the pattern that unlocks all of C01:

| Caller | Callee |
|--------|--------|
| `ft_ft(&variable)` | `void ft_ft(int *nbr)` |
| Pass **address** with `&` | Receive **address** in pointer |
| Original changes | `*nbr = new_value` writes through |

One line of code. A lifetime of C programming depends on understanding it.

---

## Mentor Notes

**Concepts:** pointers, pass by address, `&`, `*`, dereference, output parameters  
**Duration:** 45–60 minutes  
**Target level:** 4 (draw memory before/after call)

---

## Pre-Meeting Prep

- Student completed Theory **16**, **23**, **24** (minimum).
- Student attempted `ft_ft` alone for ≥ 15 minutes before seeing `source.c`.
- Have paper ready for memory diagrams — no IDE for first 20 minutes.

---

## Meeting Flow

| Phase | Time | Activity |
|-------|------|----------|
| 1. Theory recall | 8 min | Oral quiz: "What does `&` do? What does `*` do in `*p = 5`?" |
| 2. VISUALS | 12 min | Student draws stack for `main` + `ft_ft` **before** seeing solution |
| 3. THINK | 10 min | Wrong version first: `void broken(int n) { n = 42; }` — predict `number` after call |
| 4. LIVE DEMO | 15 min | Compile demo from `source.c`, print addresses with `%p` |
| 5. COMMON_ERRORS | 8 min | Walk top 3 mistakes; student explains fix |
| 6. Quiz + close | 7 min | 3 memory questions from **QUIZ.md** |

---

## Opening Question (Do Not Skip)

> "You have `int number = 0;` in `main`. Write a function that makes `number` become 42. Why can't you just pass `number`?"

**Good answer signals:** mentions copy, address, original unchanged.  
**Red flag:** "I'll return 42" — redirect to *void* prototype and in-place modification.

---

## THINK Block — Run Live

Cover the answer. Ask student to predict:

```c
void mystery(int x, int *y)
{
    x = 99;
    *y = 42;
}

int main(void)
{
    int a = 0;
    int b = 0;

    mystery(a, &b);
}
```

1. Value of `a` after call? → **0** (pass by value)  
2. Value of `b`? → **42** (write through pointer)  
3. Draw two stack frames and one arrow from `y` to `b`.

Only reveal after student commits on paper.

---

## LIVE DEMO Script

1. Show `source.c` **main only** — compile: `gcc -Wall -Wextra -Werror source.c -o demo`
2. Run `./demo` — student reads output aloud.
3. Uncomment address-print lines one at a time; relate `%p` to diagram boxes.
4. Deliberately call wrong version (`ft_ft(number)` without `&`) in a scratch file — show no change.
5. Optional: `ft_ft(0)` or NULL — segfault teachable moment (Theory/34).

---

## Key Teaching Points

### The `*` double meaning

| Context | Meaning |
|---------|---------|
| `int *nbr` in prototype | "nbr is a pointer to int" |
| `*nbr = 42` in body | "write 42 at the address stored in nbr" |

Say aloud: **"Star in declaration = type. Star in expression = go there."**

### Pointer passed by value

`nbr` inside `ft_ft` is a **copy** of the address from the caller. That is enough — both copies point to the same `number`. Changing `nbr` itself (e.g. `nbr = &other`) would **not** change caller's pointer (preview for ex01).

### 1337 subject vs real world

Subject does not require NULL check. Teach that production code should guard `if (!nbr) return;` — student should **know** the crash, not necessarily implement guard for grading.

---

## Common Student Blockers

| Blocker | Response |
|---------|----------|
| "I wrote `nbr = 42`" | "What lives inside nbr — a value or an address?" |
| "I don't need `&`" | Trace `ft_ft(number)` — nbr gets 0, not an address |
| "Same name `nbr` and `number`?" | Parameter name is local label; address is what matters |
| Segfault | Check: uninitialized pointer? NULL? Wild address? |

---

## Assessment Rubric (This Exercise)

| Level | Student can... |
|-------|----------------|
| 1 | Recite `*nbr = 42` |
| 2 | Submit working code |
| 3 | Explain `&` at call site and `*` in body |
| 4 | Draw stack before/after without notes |
| 5 | Explain why pass-by-value int fails; predict NULL crash |
| 6 | Teach ex01 double-pointer preview using same diagram style |

**Gate:** Level **4** before ex01.

---

## Homework Assignments

1. Complete **QUIZ.md** (all sections) — bring written answers.
2. **EXERCISES.md** #1 and #3 (draw only, no code).
3. Read Theory/16 "Passing Pointers to Functions" — one paragraph summary in own words.

---

## Files Map

| File | Use in meeting |
|------|----------------|
| README.md | Problem statement + algorithm |
| VISUALS.md | Primary teaching artifact |
| source.c | LIVE DEMO only — after student attempt |
| COMMON_ERRORS.md | Error gallery |
| QUIZ.md | Close + async review |
| CHEATSHEET.md | Take-home reference |
| EXERCISES.md | Stretch goals |

---

## Red Lines (Mentor)

- Do not let student submit without drawing memory once.
- Do not skip the **broken pass-by-value** demo — it anchors the lesson.
- Do not rush to ex01 if student confuses `nbr` and `*nbr`.

---

## Visuals & Memory Diagrams

Draw these on paper **before** opening `source.c`. Addresses are illustrative — your machine will differ; **relationships** stay the same.

---

## 1. The Big Picture

```
CALLER (main)                         CALLEE (ft_ft)
┌─────────────────────┐               ┌─────────────────────┐
│  int number         │               │  int *nbr           │
│  addr: 0x7ffd1000   │◄──────────────│  value: 0x7ffd1000  │
│  value: 0  →  42    │    same       │  (copy of address)  │
└─────────────────────┘    memory     └─────────────────────┘
         ▲
         │
    *nbr = 42 writes HERE
```

**Rule:** `nbr` does not contain 42. `nbr` contains **where to write** 42.

---

## 2. Stack Before `ft_ft(&number)`

Assume `number = 0` in `main`, then call `ft_ft(&number)`.

```
STACK (grows downward — high addresses at top)

  HIGH
  ┌──────────────────────────┐
  │  main frame              │
  │  ┌────────────────────┐  │
  │  │ number             │  │
  │  │ addr: 0x7ffd1000   │  │
  │  │ value: 0           │  │
  │  └────────────────────┘  │
  │                          │
  │  (about to call ft_ft)   │
  ├──────────────────────────┤
  │  ft_ft frame             │
  │  ┌────────────────────┐  │
  │  │ nbr                │  │
  │  │ addr: 0x7ffd2000   │  │
  │  │ value: 0x7ffd1000  │──┼──► points to number
  │  └────────────────────┘  │
  └──────────────────────────┘
  LOW
```

---

## 3. During `*nbr = 42` (The Critical Moment)

```
Step A — READ address from nbr:
  nbr holds 0x7ffd1000

Step B — WRITE 42 to that address:

  0x7ffd1000  ┌────────┐
              │   42   │  ← number (updated!)
              └────────┘

  0x7ffd2000  ┌────────────┐
              │ 0x7ffd1000 │  ← nbr (unchanged)
              └────────────┘
```

**READ/WRITE trace:**

| Line | Operation | Detail |
|------|-----------|--------|
| `*nbr = 42` | READ | Read address from `nbr` → `0x7ffd1000` |
| `*nbr = 42` | WRITE | Write `42` to address `0x7ffd1000` |

---

## 4. Stack After `ft_ft` Returns

```
  HIGH
  ┌──────────────────────────┐
  │  main frame              │
  │  ┌────────────────────┐  │
  │  │ number             │  │
  │  │ addr: 0x7ffd1000   │  │
  │  │ value: 42  ✓       │  │
  │  └────────────────────┘  │
  └──────────────────────────┘
  LOW

  ft_ft frame destroyed — nbr no longer exists
  number persists — modification survived return
```

---

## 5. Pass by Value (Broken) — Compare Side by Side

### Broken: `void bad(int n) { n = 42; }`

```
CALL: bad(number)   — passes COPY of value 0

main:                    bad:
┌─────────────┐          ┌─────────────┐
│ number: 0   │          │ n: 0 → 42   │  (copy changed)
└─────────────┘          └─────────────┘
      │                        ✗
      └── still 0 ──────────────┘  (original untouched)
```

### Correct: `void ft_ft(int *nbr) { *nbr = 42; }`

```
CALL: ft_ft(&number)  — passes COPY of address

main:                    ft_ft:
┌─────────────┐          ┌─────────────────┐
│ number: 0   │◄─────────│ nbr: &number    │
└─────────────┘  *nbr=42 └─────────────────┘
      │
      └── becomes 42 ✓
```

---

## 6. The `&` at Call Site

```
Expression:  &number

  number lives here ──► 0x7ffd1000 [ 0 ]

  &number evaluates to ──► 0x7ffd1000  (the address itself, not the value)
```

**Call:** `ft_ft(&number)` passes `0x7ffd1000` into parameter `nbr`.

---

## 7. Arrow Notation (Use in Exams)

```
Before *nbr = 42:

  main                ft_ft
  ┌───────┐           ┌───────┐
  │number │◄──────────│  nbr  │
  │  0    │           │0x1000 │
  └───────┘           └───────┘

After *nbr = 42:

  main                ft_ft
  ┌───────┐           ┌───────┐
  │number │◄──────────│  nbr  │
  │  42   │           │0x1000 │
  └───────┘           └───────┘
```

---

## 8. What `*` Means in Two Places

```
Prototype:     void ft_ft(int *nbr);
                              ↑
                    "nbr is pointer to int"

Body:          *nbr = 42;
                ↑
                    "follow nbr, write there"
```

Same symbol — different **context**. Exam favorite.

---

## 9. NULL Call (Undefined / Crash)

```
  nbr = NULL (0x0)

  *nbr = 42  ──►  WRITE to address 0
                  OS: "invalid" ──► Segmentation fault
```

```
  nbr ──► [ NULL / 0x0 ] ──X──► (nowhere valid)
```

Always draw this when discussing edge cases.

---

## 10. Full Timeline (Animation Style)

```
T0  int number;           number = uninitialized (danger — always init!)
T1  number = 0;           [0x1000]: 0
T2  ft_ft(&number);       call begins
T3  nbr = 0x1000;         parameter receives address
T4  *nbr = 42;            [0x1000]: 42
T5  return;               ft_ft frame popped
T6  (main continues)      number == 42
```

---

## 11. Memory Map (Zoom Out)

```
RAM (simplified)

Address      Content              Owner
────────     ───────              ─────
0x7ffd1000   int: 42              main.number
0x7ffd2000   ptr: 0x7ffd1000      ft_ft.nbr (while active)
...
```

---

## 12. Practice Diagram (Blank Template)

Fill in before your mentor meeting:

```
Before call:
  number @ ______ : ______
  (no ft_ft frame yet)

During ft_ft:
  number @ ______ : ______
  nbr    @ ______ : ______  ──► points to ______

After *nbr = 42:
  number @ ______ : ______

After return:
  number @ ______ : ______
  nbr exists? ______
```

---

## 13. Connection to Next Exercises

| Exercise | Same pattern |
|----------|--------------|
| ex01 `ft_ultimate_ft` | One more level of indirection (`**`) |
| ex02 `ft_swap` | Two pointers, two writes through `*` |
| ex03 `ft_div_mod` | Two output parameters |
| ex07 `ft_rev_int_tab` | Pointer + array indexing |

Master this diagram once — reuse the arrow style everywhere in C01.

---

## Common Errors

Each error includes **symptom**, **broken code**, **why it fails**, and **fix**.

---

## 1. Assigning to the Pointer Instead of Dereferencing

**Symptom:** Segfault or garbage write — program may crash immediately.

```c
void ft_ft(int *nbr)
{
    nbr = 42;   /* WRONG */
}
```

**Why:** `nbr` holds an **address**, not the caller's integer. You overwrite the address with the integer `42` (often invalid as a pointer). You never write to `number`.

**Fix:**

```c
void ft_ft(int *nbr)
{
    *nbr = 42;
}
```

**Memory:** You changed the envelope, not the house.

---

## 2. Forgetting `&` at the Call Site

**Symptom:** Compiles (with warning) or crashes. `number` stays unchanged.

```c
int number;

number = 0;
ft_ft(number);   /* WRONG — passes value 0, not address */
```

**Why:** `ft_ft` expects `int *`. Passing `number` passes the **value** `0`. On many systems that is treated as NULL — dereferencing crashes.

**Fix:**

```c
ft_ft(&number);
```

**Memory diagram mistake:** Arrow from `nbr` points to address `0`, not to `number`.

---

## 3. Using Pass-by-Value int Parameter

**Symptom:** No crash, but `number` never changes. Silent logic bug.

```c
void ft_ft(int nbr)   /* WRONG prototype */
{
    nbr = 42;
}

ft_ft(number);
```

**Why:** Classic pass-by-value. `nbr` is a copy; original `number` untouched.

**Fix:** Pointer parameter + address at call + dereference in body.

---

## 4. Confusing `*` in Declaration vs Expression

**Symptom:** Syntax errors or wrong logic when reading/writing code.

```c
int *nbr;     /* * means "pointer to int" */
*nbr = 42;    /* * means "value at address" */
```

**Why:** Same symbol, two roles — C grammar, not inconsistency.

**Fix:** Say context aloud: "declare pointer" vs "go there."

---

## 5. Returning 42 Instead of Writing Through Pointer

**Symptom:** Wrong design — subject expects `void` and in-place modification.

```c
int ft_ft(int nbr)   /* WRONG — wrong return type and parameter */
{
    return (42);
}
```

**Why:** Caller would need `number = ft_ft(number);` — not the exercise contract.

**Fix:** `void ft_ft(int *nbr) { *nbr = 42; }`

---

## 6. Dereferencing Uninitialized Pointer

**Symptom:** Random segfault or silent corruption.

```c
int *nbr;       /* wild — random address */
*nbr = 42;      /* WRONG */
```

**Why:** Pointer must point to valid `int` memory before `*`.

**Fix:** Always initialize: `int number;` then `nbr = &number;` or pass `&number` from caller.

---

## 7. Calling with NULL

**Symptom:** Segmentation fault on `*nbr = 42`.

```c
ft_ft(0);       /* or ft_ft(NULL) */
```

**Why:** Writing to address 0 is forbidden by OS.

**Fix (production):** Guard inside function. **1337 subject:** not required, but you must **explain** the crash.

```c
void ft_ft(int *nbr)
{
    if (!nbr)
        return ;
    *nbr = 42;
}
```

---

## 8. Wrong Parameter Type

**Symptom:** Compiler warning/error or undefined behavior.

```c
void ft_ft(int nbr);           /* WRONG — expects value, not pointer */
void ft_ft(int **nbr);         /* WRONG — double pointer (that's ex01) */
void ft_ft(long *nbr);         /* WRONG — type mismatch with int* */
```

**Fix:** Exact prototype: `void ft_ft(int *nbr);`

---

## 9. Modifying Through Wrong Variable Name

**Symptom:** Works if logic correct, but shows conceptual gap.

```c
void ft_ft(int *nbr)
{
    int local;

    local = 42;   /* WRONG — never touches caller's int */
}
```

**Why:** Must write through the **parameter that holds caller's address**.

**Fix:** `*nbr = 42;`

---

## 10. Norm Violations (1337)

| Violation | Example |
|-----------|---------|
| Forbidden function inside `ft_ft` | `printf` in submitted function |
| Too many lines per function | Splitting unnecessary logic |
| Wrong indentation | Spaces instead of tabs |
| Multiple statements against norm | Not an issue here — one line body |

**Fix:** Keep `ft_ft` minimal and norm-clean.

---

## 11. Testing Mistake — Checking Before Call

**Symptom:** Student thinks code failed.

```c
int number;

ft_ft(&number);
/* checked number before assignment in main? */
number = 0;   /* WRONG order — overwrites ft_ft result */
```

**Fix:** Set initial value, call, **then** verify.

---

## Quick Diagnostic Table

| Observation | Likely error |
|-------------|--------------|
| Segfault on call | Missing `&`, NULL, wild pointer |
| Compiles, value unchanged | Pass by value `int n` |
| Segfault inside function | `nbr = 42` then later `*nbr`, or NULL |
| Works on mentor machine, not yours | Uninitialized `number` read before set |

---

## Mentor Debug Script

Ask in order:

1. "What is **inside** `nbr` right now?"
2. "Show me where `number` lives on your diagram."
3. "Does your arrow go from `nbr` to `number`?"
4. "READ or WRITE on the line `*nbr = 42`?"

If any answer is wrong, return to **VISUALS.md** §2 — do not patch code randomly.

---

## Practice Exercises

Progression from **recall** → **trace** → **implement** → **teach**. Attempt in order.

---

## Level 1 — Trace Only (No Compiler)

### 1.1 Predict the Output

```c
void ft_ft(int *nbr);

int main(void)
{
    int a;
    int b;

    a = 10;
    b = 99;
    ft_ft(&a);
    /* What is a? What is b? */
}
```

**Deliverable:** Values of `a` and `b` + one-sentence why.

---

### 1.2 Broken vs Fixed

For each snippet, write **works / fails** and **what `number` equals** after:

```c
/* A */
void g(int x) { x = 42; }
g(number);

/* B */
void h(int *x) { *x = 42; }
h(&number);

/* C */
void i(int *x) { x = 42; }
i(&number);
```

---

### 1.3 Symbol Table

Fill in the table after `ft_ft(&score);` where `score` started at `0`:

| Name | Type | Holds (value or address) | After call |
|------|------|--------------------------|------------|
| `score` | `int` | | |
| `nbr` | `int *` | | |
| `*nbr` | `int` (concept) | | |

---

## Level 2 — Draw Memory

### 2.1 Three-Frame Comic

Draw three panels:

1. Before `ft_ft(&n)` — show `n = 7`
2. Inside `ft_ft` — show `nbr` arrow to `n`
3. After return — show `n = 42`

Label every address and value.

---

### 2.2 READ/WRITE Audit

List every memory READ and WRITE in:

```c
number = 0;
ft_ft(&number);
```

Include hidden reads (e.g. evaluating `&number`).

---

### 2.3 Compare Stacks

Side-by-side diagrams: `bad(int n)` vs `ft_ft(int *nbr)` for the same caller. Highlight which box changes.

---

## Level 3 — Implement Variations

### 3.1 ft_ft_ten

Write `void ft_ft_ten(int *nbr)` that sets `*nbr` to `10`. Same pattern — confirm you generalize the idea.

---

### 3.2 ft_set

Write `void ft_set(int *nbr, int value)` that sets `*nbr` to `value`. Call it to set a variable to 42 **without** hardcoding 42 inside a dedicated `ft_ft` clone.

---

### 3.3 ft_ft_safe

Write `void ft_ft_safe(int *nbr)` — same as `ft_ft` but returns immediately if `nbr` is NULL. Explain why 1337 does not require this but real code does.

---

### 3.4 ft_double

Write `void ft_double(int *nbr)` that sets `*nbr` to `*nbr * 2`. Start with `number = 21`, call once — result should be 42. **Requires read then write.**

---

## Level 4 — Debug Broken Code

Fix each function **and** write one sentence on the bug:

```c
/* Bug 1 */
void ft_ft(int nbr)
{
    nbr = 42;
}

/* Bug 2 */
void ft_ft(int *nbr)
{
    nbr = (int *)42;
}

/* Bug 3 */
void ft_ft(int *nbr)
{
    int x;

    x = 42;
    nbr = &x;
}
```

---

## Level 5 — Explain Like I'm Five (Peer Teaching)

### 5.1 Two-Minute Talk

Explain `ft_ft` using only:

- house (variable)
- address (street number)
- envelope (pointer)

No code words except `&` and `*`.

---

### 5.2 Exam Paper

Write answers for:

1. Why C uses pointers for this problem
2. Difference between `nbr` and `*nbr`
3. What happens on `ft_ft(NULL)`

---

## Level 6 — Bridge to ex01

### 6.1 Preview Question

```c
int n = 0;
int *p = &n;
ft_ft(p);        /* Valid? Why? */
ft_ft(&p);       /* What type does &p have? Preview ex01. */
```

Draw memory for the valid call only.

---

### 6.2 Design Question

Could you make `number` become 42 **without** pointers? List approaches (return value, global, macro) and why pointers are preferred.

---

## Challenge — Pointer-Only Trace

Implement logic equivalent to `ft_ft` in a **single function** `void set_forty_two(int *target)` and a `main` that:

1. Tests with `int`, value `0` → `42`
2. Tests with `int`, value `-1` → `42`
3. Tests with `int`, value `999` → `42`

Print nothing except optional `write`-based checks you build yourself.

---

## Self-Check Answers (Selected)

<details>
<summary>1.1</summary>

`a = 42`, `b = 99`. Only `a`'s address was passed.

</details>

<details>
<summary>1.2</summary>

A: fails — `number` unchanged. B: works — `number = 42`. C: fails — overwrites pointer variable, not `*nbr` meaningfully / crash on later use.

</details>

Discuss all other answers in meeting — reasoning beats matching keys.

---

## Cheat Sheet

One-page review. Memorize **relationships**, not addresses.

---

## Prototype & Body

```c
void ft_ft(int *nbr);

void ft_ft(int *nbr)
{
	*nbr = 42;
}
```

---

## Caller Pattern

```c
int number;

number = 0;
ft_ft(&number);   /* & = "address of" */
/* number is 42 */
```

---

## Symbol Quick Reference

| Symbol | Name | Use |
|--------|------|-----|
| `int *nbr` | pointer to int | parameter type |
| `&number` | address-of | at **call site** |
| `*nbr` | dereference | in **function body** |
| `nbr` | pointer variable | holds address (not 42) |

---

## The One Sentence

> **`nbr` knows WHERE; `*nbr` is WHAT you change there.**

---

## Pass by Value vs Address

| Style | Parameter | Call | Modifies original? |
|-------|-----------|------|-------------------|
| Value | `int n` | `f(n)` | No |
| Address | `int *n` | `f(&n)` | Yes (via `*n`) |

---

## Memory Arrow

```
number [ 42 ]  ◄──  nbr (holds address of number)
```

---

## READ / WRITE on `*nbr = 42`

1. **READ** address from `nbr`
2. **WRITE** `42` to that address

---

## Common Bugs (One Line Each)

| Bug | Fix |
|-----|-----|
| `nbr = 42` | `*nbr = 42` |
| `ft_ft(number)` | `ft_ft(&number)` |
| `void f(int n)` | `void f(int *n)` |

---

## Edge Cases

| Call | Result |
|------|--------|
| Valid `&number` | `number = 42` |
| `NULL` / `0` | Segfault (subject: no guard required) |
| Uninitialized pointer | Undefined — crash possible |

---

## Complexity

| Time | Space |
|------|-------|
| O(1) | O(1) |

---

## Norm Reminders

- Tabs for indentation
- ≤ 25 lines per function
- No forbidden functions in `ft_ft`
- Compile: `gcc -Wall -Wextra -Werror`

---

## What's Next (C01)

| ex | Skill |
|----|-------|
| ex01 | `int **` double pointer |
| ex02 | two pointers, swap |
| ex03 | multiple output params |

---

## Exam Mantra

**Draw → Predict → Code → Verify**

If you can draw the arrow from `nbr` to `number`, you can pass the exam.
