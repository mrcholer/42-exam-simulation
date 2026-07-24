# ASCII (Character Encoding)

> **1337 Piscine — Theory 12**  
> Phase 0, Day 5 · ASCII maps numbers 0–127 to characters computers can display and process.

---

## Definition

**ASCII** (American Standard Code for Information Interchange) is a **character encoding standard** that assigns a **numeric code** (0–127) to each character — letters, digits, punctuation, and control symbols.

| Concept | Meaning |
|---------|---------|
| **Code point** | The number (e.g. 65 for `'A'`) |
| **Character** | Human symbol (e.g. A) |
| **Encoding** | Rule: character ↔ number |

In C, a **`char`** (1 byte) can hold ASCII values 0–127 comfortably. Extended ASCII uses 128–255 with locale-specific meaning — focus on **0–127** first.

//! Important: The computer stores **65**, not the shape `'A'`. The screen **displays** A because software interprets 65 as ASCII letter A.

---

## Why This Concept Exists

Computers only store **binary numbers**. To represent text:

1. Early engineers agreed on a **fixed table** — ASCII.
2. Keyboard input → numbers stored in RAM.
3. Programs manipulate text as **sequences of numbers**.
4. Output devices map numbers back to glyphs on screen.

Every C string function (C02, libft) compares, copies, and walks **bytes** whose numeric values follow ASCII rules (and `'0'` is not the same as `0` — critical!).

Curriculum Day 5 includes an **ASCII table quiz** — this lesson prepares you for that.

---

## Real Life Analogy

### Morse code / telegraph

| Morse | ASCII |
|-------|-------|
| Dots and dashes represent letters | Numbers represent letters |
| Operator knows codebook | Program uses ASCII table |
| On wire: signals, not letters | In RAM: integers, not letters |

The **codebook** is ASCII. The **message** is a sequence of codes.

### Hotel room numbers

Room **65** might always be the "A wing special suite" in a fictional hotel map. Everyone agrees: **65 → A**. ASCII is that agreement for all computers.

---

## Visual Explanation

### ASCII table (essential subset)

```
Dec  Hex  Char     Dec  Hex  Char     Dec  Hex  Char
---  ---  ----     ---  ---  ----     ---  ---  ----
 48  0x30  '0'      65  0x41  'A'      97  0x61  'a'
 49  0x31  '1'      66  0x42  'B'      98  0x62  'b'
 50  0x32  '2'      67  0x43  'C'      99  0x63  'c'
 ...
 57  0x39  '9'      90  0x5A  'Z'     122  0x7A  'z'

 32  0x20  space
 10  0x0A  newline (\n)
 48  0x30  '0'  ← digit zero character (NOT integer 0)
```

### Digit characters vs numeric values

```
Character '0'  → ASCII 48  → binary 00110000
Character '1'  → ASCII 49
...
Character '9'  → ASCII 57

Integer 0      → stored as int (4 bytes typically) — value zero, not char '0'
```

**Huge beginner trap:** `'0' + 1` is **not** `1`. It is `49` (`'1'` character).

---

## ASCII Diagrams

### Byte with ASCII interpretation

```
Memory byte at 0x3000:

Binary:   0 1 0 0 0 0 0 1
Decimal:  65
Hex:      0x41
ASCII:    'A'
Glyph:    A   (when sent to terminal as text)
```

### Range layout 0–127

```
0–31    Control codes (newline, tab, bell...) — not always printable
32      Space
33–47   Punctuation ! " # ...
48–57   Digits '0'–'9'
58–64   More punctuation
65–90   Uppercase A–Z
91–96   Brackets etc.
97–122  Lowercase a–z
123–127 More symbols
```

---

## Memory Diagrams

### String "Hi" in RAM (preview Lesson 14)

```
Address     Decimal value    ASCII char
0x4000      72               'H'
0x4001      105              'i'
0x4002      0                '\0' (end marker — not visible)
```

Each **character** = one **byte** ASCII value.

### `'A'` vs `'a'` in memory

```
'A'  →  65  (0x41)  01000001
'a'  →  97  (0x61)  01100001
       difference 32 in decimal — toggle bit pattern relates to case conversion (C02)
```

//? Question: Is lowercase `'a'` stored as a smaller number than uppercase `'A'`?  
// NOTE: **No** — `'a'` (97) > `'A'` (65). Alphabetical sort ≠ numeric order of ASCII for mixed case.

### Array of digit characters

```
char num[] = "42";

Address     Value    Char
0x5000      52       '4'
0x5001      50       '2'
0x5002      0        '\0'
```

This is **not** the integer forty-two — it is two digit **characters**.

---

## Examples

### Example 1: Character literal = number

```c
char upper = 'A';
char same  = 65;
/* upper and same — identical bits in memory */
```

### Example 2: Digit to value (manual)

```c
char c = '7';
int value = c - '0';   /* 55 - 48 = 7 */
```

// NOTE: Works for `'0'`–`'9'` only — ASCII digits are consecutive.

### Example 3: Case distance (concept for ft_strlowercase etc.)

```c
/* 'A' to 'a' difference is 32 */
/* 'a' - 32 → 'A' if in range — used in case conversion functions */
```

### Example 4: Non-printable newline

```c
write(1, "Line1\nLine2\n", 14);
/* \n is ASCII 10 — moves cursor to next line */
```

---

## Wrong Examples

### Wrong: `'0'` equals 0

```c
char c = '0';
if (c == 0)   /* FALSE — c is 48 */
```

### Wrong: Sort strings by char without ASCII knowledge

```
"B" < "a" numerically?  Compare 66 vs 97 — 'B' comes first
Lexicographic order follows byte values, not dictionary intuition always
```

### Wrong: Assume char is always printable

```c
char bell = 7;   /* ASCII BEL — may not show visibly */
```

### Wrong: Using `char` for values above 127 without unsigned

```c
/* signed char 127 + 1 → -128 on typical two's complement */
```

// WARNING: Know signed vs unsigned when leaving 0–127.

---

## Correct Examples

### Correct: Compare characters by ASCII value

```c
if (c >= 'A' && c <= 'Z')
    /* uppercase letter */
```

### Correct: Convert digit char to int

```c
if (c >= '0' && c <= '9')
    digit = c - '0';
```

### Correct: Use `\0` (ASCII 0) as string end

```c
/* strings end at first zero byte — Lesson 14 */
```

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| `'5' + 5` expecting 10 | `'5'` is 53; know char numeric value |
| Forgetting `\n` is one byte (10) | Count bytes for `write()` carefully |
| Confusing hex 0x30 with decimal 30 | 0x30 = 48 = `'0'` |
| Case compare without normalization | `'A' != 'a'` (65 vs 97) |
| No `\0` in hand-built strings | String functions read until 0 |

---

## Best Practices

1. **Memorize**: `'0'`–`'9'` → 48–57, `'A'`–`'Z'` → 65–90, `'a'`–`'z'` → 97–122.
2. **Keep ASCII table** in notes for quiz.
3. **Draw each char as byte value** in memory diagrams.
4. **Use `'0'` trick** for digit conversion.
5. **Count `\n`, `\0`, spaces** when measuring string byte length.

---

## STOP — Think

1. ASCII value of `'0'`? Of `0` (integer)?
2. How many bytes in `"A"` vs `'A'`?
3. Why is `'a' - 'A'` equal to 32?

---

## LIVE DEMO — Meeting Block

**Curriculum ASCII table quiz prep**

| Step | Activity |
|------|----------|
| 1 | Partner calls character — you answer decimal + hex |
| 2 | Reverse: partner says 72 — you say character |
| 3 | Write `"1337\n"` byte table with decimal column |
| 4 | Explain `'0'` vs `0` to peer in 30 seconds |

---

## Mini Quiz

1. What ASCII value is `'A'`?
2. What character is decimal 48?
3. What is `\n` in decimal?
4. `'9' - '0'` equals what?
5. Why is ASCII limited to 128 standard codes?

---

## Interview Questions

1. Explain ASCII to a non-programmer.
2. Difference between `'5'` and `5` in memory?
3. How does ASCII relate to `char` type?
4. What is a control character? Example?
5. Why do C strings use `\0` (ASCII 0)?

---

## Homework

1. **Fill blank ASCII table**: 0, 9, 10, 32, 48, 57, 65, 90, 97, 122.
2. Encode your first name as decimal byte sequence.
3. Write byte count and hex for `"Hello\n"`.
4. Complete curriculum **ASCII table quiz** with peer.

---

## Extra Challenge

Research **UTF-8** in 5 sentences: how it extends ASCII for emoji and international text while keeping ASCII-compatible first 128 codes.

---

## Summary

- **ASCII** maps characters to numbers **0–127** (standard set).
- Computers store **numbers**; screens show **characters** via encoding rules.
- **`'0'`–`'9'`**, **`'A'`–`'Z'`**, **`'a'`–`'z'`** occupy distinct numeric ranges.
- **`'0'` is 48**, not integer zero — classic beginner bug.
- C text processing = processing **ASCII bytes** in memory.

---

## Cheat Sheet

| Char | Dec | Hex |
|------|-----|-----|
| `\0` | 0 | 0x00 |
| `\n` | 10 | 0x0A |
| space | 32 | 0x20 |
| `'0'` | 48 | 0x30 |
| `'9'` | 57 | 0x39 |
| `'A'` | 65 | 0x41 |
| `'Z'` | 90 | 0x5A |
| `'a'` | 97 | 0x61 |
| `'z'` | 122 | 0x7A |

**Tricks:**
- Digit value: `c - '0'` (if `'0'` ≤ c ≤ `'9'`)
- `'A'` to `'a'`: +32 (lowercase) / -32 (uppercase)

---

## Useful Tips

//* Flashcard: character ↔ decimal both directions daily.  
//* In `write()`, count ASCII bytes, not letters you see.  
// NOTE: Lesson 13 applies ASCII to `char` variables.  
// WARNING: Extended ASCII (128+) is not portable — stick to 0–127 in early Piscine.

---

**Previous:** [11 — Data Types](../11-data-types/LESSON.md) · **Next:** [13 — Characters](../13-characters/LESSON.md)
