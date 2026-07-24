# C00/ex00 — ft_putchar

> **1337 / 42 Piscine — Your first C function**  
> Phase 1, Day 8 · One character, one syscall, infinite lessons.

---

## Goal

Write **`ft_putchar`**, a function that prints **exactly one character** to the terminal using the Unix system call **`write()`**.

By the end of this exercise you will understand:

| Concept | Why it matters |
|---------|----------------|
| **`char` type** | How C stores letters as numbers (ASCII) |
| **`write()`** | The real mechanism behind all low-level output |
| **stdout** | Where normal program text goes (your screen) |
| **File descriptor `1`** | The integer name the OS uses for stdout |
| **Address-of `&`** | Why `write` needs a pointer, not a bare character |

> //! Do not memorize `write(1, &c, 1)`. **Predict** what happens in memory before every line.

---

## Required Knowledge

Read before coding (minimum):

- **Theory 01** — How computers work (CPU, RAM, input/output)
- **Theory 10–14** — Variables, types, ASCII, strings
- **Theory 23** — Functions (prototype, parameters, return)
- **Theory 43** — File descriptors
- **Theory 44** — `write` & `read`

---

## The Problem (42 Subject)

**Name:** `ft_putchar`  
**Files:** `ft_putchar.c` (submission), optionally `main.c` for testing  
**Prototype:**

```c
void ft_putchar(char c);
```

**Allowed:** `write` (from `<unistd.h>`)  
**Forbidden:** `printf`, `putchar`, and other stdio shortcuts for the exercise

**Expected behavior:** Calling `ft_putchar('Z')` displays `Z` on stdout with no extra characters.

---

## Thinking Process

1. **Restate:** "I must send one byte from memory to file descriptor 1."
2. **Identify types:** Input = `char c` (1 byte). Output = side effect on terminal (void return).
3. **Draw memory:** One box for `c`, label its address and ASCII value.
4. **Pseudo-code first** — no C syntax yet.
5. **Translate one line:** only `write(...)`.
6. **Trace by hand:** pick `c = 'A'`, follow bytes to the screen.

---

## Algorithm

```
START
  │
  ▼
Receive character c (one byte on stack)
  │
  ▼
Call write(1, address_of_c, 1)
  │
  ▼
OS copies 1 byte from that address → stdout → terminal displays glyph
  │
  ▼
END (no return value)
```

---

## Pseudo Code

```
function ft_putchar(c):
    // c is a single byte holding an ASCII code
    tell the operating system:
        from file number 1 (stdout)
        read 1 byte starting at the address of c
        send that byte to the terminal
    return nothing
```

---

## Dry Run

**Example:** `ft_putchar('A');`

| Step | What happens | Memory / I/O |
|------|--------------|--------------|
| 1 | Caller passes `'A'` | Value **65** copied into parameter `c` |
| 2 | `&c` evaluated | Address of `c` on stack, e.g. `0x7ffe…8` |
| 3 | `write(1, &c, 1)` | Kernel reads **1 byte** at that address → value **65** |
| 4 | stdout handler | Byte 65 routed to terminal driver |
| 5 | Terminal | Font maps 65 → glyph **A** on screen |
| 6 | Function returns | Stack frame for `ft_putchar` destroyed; `c` gone |

**Second example:** `ft_putchar('\n');`

- ASCII **10** is sent — not two characters `\` and `n`.
- Screen effect: newline (cursor moves down).

See **VISUALS.md** for stack diagrams.

---

## Memory Visualization

### Before `write` inside `ft_putchar`

```
STACK (simplified, high addresses at top)

    main's frame
    ┌─────────────┐
    │  ...        │
    └─────────────┘
           │
           ▼ call ft_putchar('A')
    ft_putchar's frame
    ┌─────────────┐
    │ c = 65 'A'  │  ← address &c points here
    └─────────────┘
```

### What `write(1, &c, 1)` sees

```
Your program          Kernel                 Terminal
┌──────────┐         ┌──────────┐           ┌──────────┐
│ byte: 65 │ ──────► │ fd = 1   │ ────────► │ shows A  │
│ at &c    │  1 byte │ stdout   │           └──────────┘
└──────────┘         └──────────┘
```

### `'A'` vs `"A"` (critical for later exercises)

```
'A'  →  single value 65 (type char / int promotion)

"A"  →  memory layout:
        ┌────┬────┐
        │ 65 │  0 │  ← 'A' then '\0' (string terminator)
        └────┴────┘
        address of this array — NOT the same as 'A'
```

---

## Complexity

| Case | Time | Space |
|------|------|-------|
| Single call | **O(1)** — one syscall, fixed 1 byte | **O(1)** — one local `char` |
| Printing n chars (n calls) | **O(n)** syscalls | **O(1)** per call |

**Note:** Each `write` crosses user/kernel boundary — slower than buffered I/O. That is acceptable here; clarity beats speed in C00.

---

## Common Mistakes

See **COMMON_ERRORS.md** for full list with fixes.

Quick hits:

- `write(1, c, 1)` — type error / wrong semantics (need address)
- `write(1, &c, 2)` — undefined behavior (reads past `c`)
- Using `printf` — violates subject rules
- Expecting `ft_putchar("hello")` — takes **one** `char`, not a string

---

## How to Test Locally

```bash
gcc -Wall -Wextra -Werror ft_putchar.c main.c -o test
./test
```

Minimal `main.c`:

```c
int main(void)
{
	ft_putchar('4');
	ft_putchar('2');
	ft_putchar('\n');
	return (0);
}
```

Expected output:

```
42
```

---

## Reflection Questions

Answer in your **NOTES.md** before the next exercise:

1. Why is the second argument of `write` a pointer (`const void *`) and not a `char`?
2. What file descriptors do `0`, `1`, and `2` represent? Where would `write(2, ...)` go?
3. If `c` holds `'\0'`, does anything appear on screen? Is a byte still written?
4. How is `ft_putchar('A')` different from `write(1, "A", 1)`?
5. Draw the stack for `main` calling `ft_putchar` twice in a row. What happens to the first `c`?
6. Why might checking the return value of `write` matter in a large project?

---

## File Map (this folder)

| File | Use |
|------|-----|
| **README.md** | You are here — overview and algorithm |
| **NOTES.md** | Live-meeting script for mentors |
| **VISUALS.md** | Diagrams and traces |
| **source.c** | Heavily commented reference (study, don't submit) |
| **COMMON_ERRORS.md** | Bug catalog |
| **EXERCISES.md** | Extra practice |
| **QUIZ.md** | Self-check |
| **CHEATSHEET.md** | One-page review |

---

## Summary

**ft_putchar** is tiny on purpose. One function, one syscall, one byte — but it encodes the entire model of **data in RAM → OS → screen**. Master this, and every future exercise (alphabet, numbers, GNL, ft_printf) is just repetition with more bytes.

**Next:** [ex01 — ft_print_alphabet](../ex01/README.md) — same `write`, wrapped in a loop.

---

## Mentor Notes

> **Audience:** Absolute beginners, first day of C  
> **Duration:** 60–90 minutes  
> **Mentor prep:** Open `source.c`, `VISUALS.md`, terminal ready to compile

---

## Pre-Meeting Checklist

- [ ] Students read Theory 01 (computers) and skim ASCII table
- [ ] Whiteboard or paper for stack diagrams
- [ ] Terminal: `gcc --version` works
- [ ] No one has copied a solution yet — emphasize **predict, then verify**

---

## Meeting Flow

### 0. Hook (5 min)

Ask: *"When you type `A` on keyboard, what does the computer store?"*

Accept answers, then reveal: **number 65** (ASCII). Letters are numbers; screens are output devices.

---

### 1. Theory Recall (10 min)

| Question | Expected answer |
|----------|-----------------|
| What is RAM? | Working memory where variables live while program runs |
| What is a function? | Named block of instructions; can take inputs |
| Input / Process / Output? | Keyboard → CPU + RAM → screen |

Point to **Theory 44** — `write` is how bytes leave your program.

---

### 2. VISUALS (15 min)

Open **VISUALS.md** together.

Draw on board:

1. Box `c` with value 65 inside
2. Arrow from `&c` to that box
3. Arrow from `write` to "fd 1" cloud → monitor

**Key sentence:** *"The OS does not read your variable name. It reads **bytes at an address**."*

---

### 3. STOP Block (3 min)

Read **STOP** section from `source.c` aloud.

Everyone writes on paper:

- Character: `A`
- ASCII decimal: `65`
- ASCII hex: `0x41`

No coding until done.

---

### 4. THINK Block (10 min)

Three questions from `source.c` — students discuss in pairs, then share:

1. **File descriptor** — integer handle for an open I/O stream. `1` = stdout (normal output).
2. **Why `&c`?** — `write` needs `const void *buf`; address of first byte to send.
3. **`write(1, &c, 2)`?** — reads 2 bytes from stack → garbage + **undefined behavior**.

---

### 5. LIVE DEMO (20 min)

#### Demo A — Reference file

```bash
cd C00/ex00
gcc -Wall -Wextra -Werror source.c -o demo
./demo
```

Expected: `Hi!` plus newline.

#### Demo B — Intentional bug (mentor only)

Temporarily change to `write(1, c, 1)` — show compiler error or wrong behavior.

Change to `write(1, &c, 2)` — discuss why this is dangerous (don't leave in code).

#### Demo C — Student builds ft_putchar

Blank file `ft_putchar.c`. Students write from memory:

```c
#include <unistd.h>

void ft_putchar(char c)
{
	write(1, &c, 1);
}
```

Compile with a small `main.c`. Celebrate first working C function.

---

### 6. ASCII Deep Dive (10 min)

Write on board:

```
'0' = 48     '9' = 57
'A' = 65     'Z' = 90
'a' = 97     'z' = 122
'\n' = 10    '\0' = 0
```

Exercise: *"What is `ft_putchar('0')` vs `ft_putchar(0)`?"*

- `'0'` → displays zero digit (48)
- `0` → null byte — often invisible

---

### 7. COMMON_ERRORS (10 min)

Walk through **COMMON_ERRORS.md** — students mark which mistakes they almost made.

Emphasize **#1 beginner error:** confusing `'c'` with `"c"`.

---

### 8. Wrap-Up (5 min)

Quick round:

- One thing that surprised you
- One thing still unclear

Assign: **QUIZ.md** + one **EXERCISES.md** easy item before next session.

---

## Mentor Talking Points

### On void return

`ft_putchar` returns nothing because its job is a **side effect** (text on screen), not a computed value.

### On norm (42 style)

- Tabs for indentation
- Function name: `ft_` prefix (42 convention)
- No comments in submission unless allowed — this repo is educational

### On "why not printf?"

`printf` is powerful but hides file descriptors and buffering. You learn `write` now so GNL and syscalls make sense later.

---

## Assessment (Rubric Level 3+)

Student can, without notes:

- [ ] Write `ft_putchar` from scratch
- [ ] Explain all three arguments to `write`
- [ ] Draw stack frame with `c` and `&c`
- [ ] Convert `'B'` to decimal ASCII
- [ ] Explain difference between `'X'` and `"X"`

---

## Optional Extensions (if time)

- Redirect stdout: `./demo > out.txt` — same fd 1, different destination
- `write(2, "error\n", 6)` — stderr is fd 2
- Show `man 2 write` in terminal (read synopsis only)

---

## Post-Meeting Homework

1. Complete **QUIZ.md** (discuss wrong answers next time)
2. **EXERCISES.md** — Easy #1–3, Medium #1
3. Read **Theory 23** (functions) if shaky
4. Write reflection answers in personal notes (see README reflection questions)

---

## Visuals & Memory Diagrams

> Draw these by hand before compiling. Level 4 skill = predict memory state.

---

## 1. The Big Picture: One Character Out

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR C PROGRAM                           │
│                                                                 │
│   ft_putchar('A')                                               │
│        │                                                        │
│        ▼                                                        │
│   ┌─────────┐    write(1, &c, 1)    ┌─────────────────────┐    │
│   │ c = 65  │ ────────────────────► │  Operating System   │    │
│   └─────────┘                       │  (kernel I/O layer) │    │
│                                     └──────────┬──────────┘    │
└────────────────────────────────────────────────┼────────────────┘
                                                 │
                                                 ▼
                                      ┌─────────────────────┐
                                      │  Terminal (stdout)  │
                                      │       shows: A      │
                                      └─────────────────────┘
```

---

## 2. File Descriptors (Standard Streams)

Every running process starts with three open files:

```
fd │ Name   │ Default connected to │ Typical use
───┼────────┼──────────────────────┼─────────────────────────
 0 │ stdin  │ keyboard             │ read input
 1 │ stdout │ terminal screen      │ normal output  ← ft_putchar
 2 │ stderr │ terminal screen      │ error messages
```

```
                    ┌──────────┐
   keyboard ──────► │ fd 0     │ stdin
                    └──────────┘

                    ┌──────────┐
   your write(1) ─► │ fd 1     │ stdout ──► screen
                    └──────────┘

                    ┌──────────┐
   write(2, ...) ─► │ fd 2     │ stderr ──► screen (often unbuffered)
                    └──────────┘
```

---

## 3. Stack During `main` → `ft_putchar('A')`

```
HIGH ADDRESS
┌────────────────────────────┐
│         main stack         │
│  return address            │
│  (saved for after call)    │
├────────────────────────────┤
│  ft_putchar stack frame    │
│  ┌──────────────────────┐  │
│  │ c  │ 65 (0x41) 'A'   │  │  ← &c points here
│  └──────────────────────┘  │
└────────────────────────────┘
LOW ADDRESS

After ft_putchar returns → entire frame popped → c no longer exists
```

---

## 4. What `write(1, &c, 1)` Reads

```
Memory at address &c:

  Address     Byte value    Meaning
  ───────     ──────────    ───────
  &c + 0         65         'A'  ← write reads THIS byte only (count=1)

If count were 2 (BUG):

  &c + 0         65         'A'
  &c + 1         ??         unknown stack garbage → DANGER
```

---

## 5. ASCII: Character vs Number

```
Source code          Stored in char c (1 byte)
───────────          ─────────────────────────

  'A'        ───►    01000001  (binary)
                      65        (decimal)
                      0x41      (hex)

  '0'        ───►    48        (digit zero — NOT integer 0)

  0 or '\0'  ───►    0         (null — invisible on screen)
```

### Printable ASCII row (subset)

```
Dec:  32  33  48  49  57  65  66  90  97  122
Chr:  sp  !   0   1   9   A   B   Z   a   z
      │                   │               │
      space               uppercase       lowercase
```

---

## 6. Character Literal vs String Literal

```
'A'  (char)

    Single integer value: 65


"A"  (string — array of char)

    Address ──► ┌────┬────┐
                │ 65 │  0 │
                └────┴────┘
                 'A'  '\0'  ← hidden terminator

write(1, "A", 1)  → writes 65 only (OK)
write(1, 'A', 1)  → WRONG — 'A' promoted to int, treated as address
write(1, &c, 1)   → CORRECT for variable c
```

---

## 7. Dry Run Table: `ft_putchar('0'); ft_putchar('\n');`

| Step | Call | c in frame | Byte sent | Screen |
|------|------|------------|-----------|--------|
| 1 | `ft_putchar('0')` | 48 | 48 | `0` |
| 2 | frame destroyed | — | — | — |
| 3 | `ft_putchar('\n')` | 10 | 10 | newline |
| 4 | return to main | — | — | cursor on new line |

---

## 8. Multiple Calls (ex01 preview)

```
ft_putchar('H'); ft_putchar('i');

Call 1: stack has c=72  → write → H
        frame popped
Call 2: NEW stack has c=105 → write → i

Screen accumulates: Hi

(No string in memory — two separate bytes to same fd 1)
```

---

## 9. Syscall Boundary

```
 USER SPACE                          KERNEL SPACE
 ┌─────────────────┐                ┌─────────────────┐
 │ your ft_putchar │                │                 │
 │ write(1,&c,1)   │ ── syscall ──► │ stdout driver   │
 └─────────────────┘                │ terminal/file   │
                                    └─────────────────┘

Each write = transition user → kernel ( relatively expensive )
```

---

## 10. Memory Trace Exercise (student fills in)

**Code:**

```c
int main(void)
{
	ft_putchar('X');
	return (0);
}
```

Fill before running:

| Variable | Location | Value (dec) | Value (char) |
|----------|----------|-------------|--------------|
| c in ft_putchar | stack | ? | ? |
| fd passed to write | register/stack | ? | — |
| count passed to write | register/stack | ? | — |

**Answers:** c = 88 / 'X', fd = 1, count = 1

---

## 11. Redirect Visualization (bonus)

```bash
./program > output.txt
```

```
Without redirect:     write(1, ...) ──► terminal screen

With redirect:        write(1, ...) ──► output.txt file
                      (fd 1 still "stdout" — destination changed)
```

Same function `ft_putchar` — different sink. Powerful Unix idea.

---

## Common Errors

> Every bug is a story about memory or types. Read the **why**, not just the fix.

---

## Error 1: Passing `c` instead of `&c`

### Wrong

```c
write(1, c, 1);  /* c is a value, not an address */
```

### Symptom

- Compiler warning/error (pointer from integer without cast)
- Or cryptic crash if it compiles (treats ASCII value as address)

### Why

`write`'s second parameter is `const void *buf` — a **memory address**. The integer `72` (`'H'`) is not where `'H'` is stored.

### Fix

```c
write(1, &c, 1);
```

---

## Error 2: Wrong `count` — off-by-one or too many

### Wrong

```c
write(1, &c, 0);  /* sends nothing */
write(1, &c, 2);  /* reads past c — undefined behavior */
```

### Symptom

- Nothing on screen (count 0)
- Garbage characters, random crashes, sanitizer errors (count > 1)

### Fix

```c
write(1, &c, 1);  /* exactly one char */
```

---

## Error 3: Using `printf` or `putchar`

### Wrong (for 42 C00 subject)

```c
#include <stdio.h>
printf("%c", c);
```

### Why it's a problem here

Subject restricts you to `write` so you learn file descriptors. `printf` also adds buffering and hidden formatting.

### Fix

```c
#include <unistd.h>
write(1, &c, 1);
```

---

## Error 4: Confusing `'A'` with `"A"`

### Wrong

```c
ft_putchar("A");     /* type error: string where char expected */
write(1, "A", 1);    /* works but NOT the same as variable c */
write(1, 'A', 1);    /* disaster: char used as pointer */
```

### Memory picture

```
'A'  →  number 65
"A"  →  address of array {65, 0}
```

### Fix

Pass a **single character** to `ft_putchar`:

```c
ft_putchar('A');
```

---

## Error 5: Missing `#include <unistd.h>`

### Symptom

```
error: implicit declaration of function 'write'
```

### Fix

```c
#include <unistd.h>
```

At top of file, before `ft_putchar`.

---

## Error 6: Wrong function signature

### Wrong

```c
int ft_putchar(char c);           /* should be void */
void ft_putchar(int c);           /* subject says char */
void putchar(char c);             /* wrong name */
void ft_putchar(char c, int x);   /* too many parameters */
```

### Fix

```c
void ft_putchar(char c);
```

Must match subject exactly for Moulinette.

---

## Error 7: Expecting a return value

### Wrong thinking

```c
if (ft_putchar('X') == 0)  /* void — no return value to test */
```

### Fix

`ft_putchar` returns nothing. If you need error handling, check `write`'s return inside the function (advanced).

---

## Error 8: Forgetting newline

### Not a crash — a logic/UX bug

```c
ft_putchar('H');
ft_putchar('i');
/* no \n — shell prompt appears on same line: Hi$ */
```

### Fix

```c
ft_putchar('\n');
```

Newline is a **character** like any other (ASCII 10).

---

## Error 9: Signed char confusion

### Context

On some platforms `char` is signed (−128 to 127). Value 200 may become negative when printed with wrong format (in other functions).

### For ft_putchar

`write` sends raw byte — display depends on terminal. Know that `char` is **one byte**, not always "positive letter."

---

## Error 10: Undefined behavior from local pointer escape (preview)

### Wrong pattern (not this exercise, but related)

```c
char *bad(void)
{
	char c = 'A';
	return (&c);  /* address invalid after return */
}
```

### Lesson

`c` in `ft_putchar` lives only during the call — which is exactly long enough for `write` inside the same function. **Safe here.**

---

## Error 11: Norm violations (42)

| Violation | Example |
|-----------|---------|
| Wrong indentation | spaces instead of tabs |
| Too many functions in file | multiple unrelated functions |
| Forbidden function | `printf`, `fprintf` |
| Missing prototype in header | later in libft — not ex00 yet |

---

## Debugging Checklist

When output is wrong, ask:

1. [ ] Is `#include <unistd.h>` present?
2. [ ] Is it `&c` with count `1`?
3. [ ] Did I pass `'X'` not `"X"`?
4. [ ] Did I compile the right file?
5. [ ] Did I add `\n` if I expected a new line?
6. [ ] What ASCII value is in `c`? (draw the box)

---

## Quick Fix Reference

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Nothing prints | count = 0 or wrong fd | `write(1, &c, 1)` |
| Garbage / crash | `write(1, c, 1)` or count > 1 | use `&c`, count 1 |
| Compile error on write | missing header | `#include <unistd.h>` |
| "A" works, variable doesn't | using string for var | `write(1, &c, 1)` |
| Prompt stuck to output | no newline | `ft_putchar('\n')` |

---

## Practice Exercises

> Practice in order. **Predict output before running.** No copy-paste from solutions.

---

## Easy

### E1 — Predict output

What appears on screen?

```c
int main(void)
{
	ft_putchar('4');
	ft_putchar('2');
	ft_putchar('\n');
	return (0);
}
```

<details>
<summary>Answer</summary>

```
42
```
(then newline)
</details>

---

### E2 — ASCII lookup

Without a table, compute ASCII values, then verify:

- `'B'` = ?
- `'b'` = ?
- `'9'` = ?

Call `ft_putchar` for each to confirm.

---

### E3 — First implementation

From a blank file, write `ft_putchar.c` with:

- Correct include
- Correct prototype
- One `write` call

Compile with a 3-line `main`. Zero warnings with `-Wall -Wextra -Werror`.

---

### E4 — Space and punctuation

Print exactly: `Hi!` (no extra spaces). How many `ft_putchar` calls?

---

### E5 — Null byte experiment

```c
ft_putchar('\0');
ft_putchar('X');
```

Predict: does `X` appear? Is a byte still written for `\0`?

---

## Medium

### M1 — ft_putstr (one line at a time)

Write `ft_putstr` that prints a C string using **only** `ft_putchar` in a loop.

```c
void ft_putstr(char *str);
```

Do not use `write` on whole string yet — force yourself through `ft_putchar`.

---

### M2 — Check write return

Extend `ft_putchar` to return `int`: `1` on success, `-1` if `write` fails.

```c
int ft_putchar(char c);
```

Research: when can `write` return `-1`?

---

### M3 — Print decimal digit

Write `ft_putdigit(int n)` that prints one digit `0`–`9` using `ft_putchar` only.

Hint: `'0' + n` for valid n.

---

### M4 — Visible vs invisible

Print characters for ASCII 9 (tab), 10 (newline), 32 (space). Describe what you see for each.

---

### M5 — Count syscalls

How many `write` calls if you print `"Hello"` with five `ft_putchar` calls? With a loop in `ft_putstr`?

---

## Hard

### H1 — ft_puthex_byte

Print one byte as two hex digits (`0`–`9`, `A`–`F`) using only `ft_putchar`.

Example: value 171 → `AB`.

---

### H2 — Redirect proof

Run program that calls `ft_putchar('Z')` twice with:

```bash
./prog > z.txt
./prog 2> err.txt
```

Explain where bytes go. Read `z.txt` with a text editor.

---

### H3 — No variable main

Write `main` that prints `1337` using exactly four `ft_putchar` calls and no `int` variables.

---

### H4 — Wrapper with stderr

Write `ft_putchar_err(char c)` that writes to **stderr** (fd 2). Compare behavior with stdout when redirected.

---

### H5 — Performance awareness

Print 10,000 characters with 10,000 `ft_putchar` calls. Time it. Then write version using one `write(1, string, len)` (outside subject — comparison only). Discuss difference.

---

## Expert

### X1 — Prove correctness

Write a short proof sketch: for any `char c`, `ft_putchar(c)` sends exactly one byte whose value equals `(unsigned char)c` to fd 1, assuming `write` succeeds.

---

### X2 — Abstract model

Define formally: `ft_putchar : char → ∅` with side effect `stdout ← stdout · c`. Discuss composition of two calls.

---

### X3 — Minimal syscall wrapper

Implement `ft_putchar` as a macro vs function. Compare object file size (`objdump -d`). Norm allows only function here — exercise is conceptual.

---

### X4 — Portability note

Research: platforms where `char` is 9 bits or `write` partial. Would this implementation still hold?

---

## Mini Projects

### P1 — ASCII Art Printer

Read 5 lines of "pixel art" from a `char *` array and print with `ft_putchar` only (loop over rows and columns).

---

### P2 — Banner

Print your name in "big letters" using blocks of `#` characters — all via `ft_putchar`.

---

### P3 — Escape sequences

Research ANSI codes. Print colored text using `ft_putchar` to emit `\033` sequences (may need unsigned char casts).

---

## Interview Style

1. **Explain** `write(1, &c, 1)` to a non-programmer in 30 seconds.
2. **Why** is return type `void`?
3. **Difference** between stdout and stderr — when use each?
4. **Implement** `ft_putchar` on a whiteboard without syntax errors.
5. **What** happens at syscall boundary during `write`?

---

## Debugging Drills

Fix broken snippets (each has exactly one primary bug):

### D1

```c
#include <unistd.h>
void ft_putchar(char c)
{
	write(1, c, 1);
}
```

---

### D2

```c
void ft_putchar(char c)
{
	write(1, &c, 1);
}
/* missing include — what error? */
```

---

### D3

```c
void ft_putchar(char c)
{
	write(1, &c, 2);
}
/* what can go wrong? */
```

---

### D4

```c
int main(void)
{
	ft_putchar("A");
	return (0);
}
```

---

### D5

```c
int main(void)
{
	char c = 'Z';
	write(1, &c, 0);
	return (0);
}
```

---

## Predict Output

### PO1

```c
ft_putchar('0');
ft_putchar(48);
```

---

### PO2

```c
ft_putchar('A' + 1);
```

---

### PO3

```c
ft_putchar('\n');
ft_putchar('\n');
```

---

### PO4

```c
ft_putchar(' ');
ft_putchar(' ');
ft_putchar('X');
```

---

### PO5

```c
ft_putchar(49);
ft_putchar('2');
ft_putchar('3');
```

---

## Memory Tracing

### MT1

Draw stack before and after `ft_putchar('M')` when called from `main`.

---

### MT2

Two consecutive calls: `ft_putchar('a'); ft_putchar('b');` — are there two separate `c` variables? Explain.

---

### MT3

Label: where does `'A'` live before the call? During the call? After return?

---

### MT4

If `write(1, &c, 1)` reads address `0x7fff0008`, what sits at that address for `c = '!'`? (Give decimal byte value.)

---

### MT5

Compare memory layout of:

```c
char a = 'A';
char *s = "A";
```

Which address goes to `write` for each if you tried to print them? (Only `&a` and `s` respectively — discuss `*s`.)

---

## Submission Practice

Create folder structure as 42 expects:

```
ex00/
  ft_putchar.c
  (main.c for local tests only — not submitted)
```

Run:

```bash
norminette ft_putchar.c
gcc -Wall -Wextra -Werror ft_putchar.c main.c
```

Peer review: can partner explain every line without looking?

---

## Cheat Sheet

> One page. Print or keep open during practice — close during quiz.

---

## Prototype

```c
void ft_putchar(char c);
```

---

## Implementation (42 C00)

```c
#include <unistd.h>

void ft_putchar(char c)
{
	write(1, &c, 1);
}
```

---

## write() Signature

```c
ssize_t write(int fd, const void *buf, size_t count);
```

| Arg | ft_putchar value | Meaning |
|-----|------------------|---------|
| `fd` | `1` | stdout (terminal) |
| `buf` | `&c` | address of byte to send |
| `count` | `1` | exactly one byte |

---

## Standard File Descriptors

| fd | Stream | Default |
|----|--------|---------|
| 0 | stdin | keyboard |
| 1 | stdout | screen |
| 2 | stderr | screen (errors) |

---

## char & ASCII

| Idea | Detail |
|------|--------|
| `char` size | typically **1 byte** |
| `'A'` | integer **65** |
| `'0'` | integer **48** (not zero) |
| `'\0'` | integer **0** (null) |
| `'\n'` | integer **10** (newline) |

---

## `'X'` vs `"X"`

```
'A'   →  value 65
"A"   →  address of {'A','\0'}
```

Use **`&c`** for variable; never `write(1, 'A', 1)`.

---

## Memory (one call)

```
ft_putchar frame:  [ c | one byte ]  ← &c
                      │
                      └── write reads 1 byte → fd 1 → screen
```

---

## Complexity

| | |
|-|-|
| Time | O(1) per call |
| Space | O(1) — one local char |

---

## Common Mistakes

| Wrong | Right |
|-------|-------|
| `write(1, c, 1)` | `write(1, &c, 1)` |
| `write(1, &c, 2)` | count must be **1** |
| `#include <stdio.h>` + printf | `#include <unistd.h>` + write |
| `ft_putchar("A")` | `ft_putchar('A')` |

---

## Compile & Test

```bash
gcc -Wall -Wextra -Werror ft_putchar.c main.c -o test
./test
```

---

## Includes (allowed)

```c
#include <unistd.h>   /* write */
```

---

## Norm Reminders

- Tabs for indentation
- Function name: `ft_putchar`
- Return: `void`
- No forbidden functions

---

## Mental Model

```
letter in code → number in RAM → write syscall → byte on stdout → glyph on screen
```

---

## Related Theory

- **43** File descriptors
- **44** write / read
- **23** Functions
- **14** ASCII

---

## Next Exercise Preview

**ex01 — ft_print_alphabet:** same `ft_putchar`, inside a `while` loop from `'a'` to `'z'`.
