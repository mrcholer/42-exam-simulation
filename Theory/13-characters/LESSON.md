# Characters (The `char` Type in C)

> **1337 Piscine — Theory 13**  
> Phase 0, Day 5 · In C, a character is a 1-byte integer with ASCII meaning.

---

## Definition

In C, **`char`** is a **data type** occupying **1 byte** of memory. It can represent:

1. A **small integer** (−128..127 signed or 0..255 unsigned — implementation-dependent plain `char`)  
2. An **ASCII character** when assigned with character literals like `'A'`

```c
char letter = 'A';    /* byte value 65 */
char newline = '\n';  /* byte value 10 */
char zero_char = '0'; /* byte value 48 — NOT numeric zero */
```

//! Important: **`char` is numeric storage**. We **interpret** it as a character using ASCII. The CPU still sees one byte of bits.

---

## Why This Concept Exists

Text is fundamental — names, messages, file content, terminal output. C has no separate "character object" type at hardware level. **`char`** reuses the 1-byte integer cell:

- Efficient — one byte per character  
- Compatible with strings (arrays of `char`)  
- Works with `write()` — sends raw bytes  
- Enables arithmetic on characters (`'a' - 32` → `'A'`)

1337 C00–C02 heavily uses **`char`**, **`write()`**, and manual character logic — this type is your daily tool.

---

## Real Life Analogy

### Single Scrabble tile

One tile = one **`char`**:

- Blank tile with letter **A** printed on it → you see `'A'`  
- Back of tile has **inventory code 65** → computer sees `65`  
- Tile fits in one slot on rack → one memory byte  

A **word** = several tiles in a row → string (Lesson 14).

### Light bulb on/off panel (8 switches)

One **`char`** = one panel of 8 switches (one byte).  
Pattern `01000001` = lit pattern we call `'A'`.

---

## Visual Explanation

### Character literal syntax

```
'A'     single quotes — one character (one char)
"A"     double quotes — string (array of char, includes '\0')

'AB'    INVALID in standard C — multi-char constant, avoid
'\n'    escape sequence — one char, value 10
'\\'    backslash character
'\''    single quote character
```

### Escape sequences (common)

| Escape | ASCII dec | Meaning |
|--------|-----------|---------|
| `\0` | 0 | Null (end of string) |
| `\n` | 10 | Newline |
| `\t` | 9 | Tab |
| `\\` | 92 | Backslash |
| `\'` | 39 | Single quote |

---

## ASCII Diagrams

### `char` in memory vs `int`

```
char c = 'A';
int n = 'A';

Memory (conceptual):

c @0x1000  [ 65 ]           ← 1 byte

n @0x1004  [ 0 ][ 0 ][ 0 ][ 65 ]   ← 4 bytes (typical int)
           promotion when used in int context
```

### Reading order for `"Cat"`

```
Index:     [0]   [1]   [2]   [3]
Char:      'C'   'a'   't'   '\0'
Decimal:   67    97    116   0
Address:   +0    +1    +2    +3   (consecutive bytes)
```

---

## Memory Diagrams

### Declare and assign chars

```c
char a = 'H';
char b = 'i';
char end = '\0';
```

```
Address     Name    Value (dec)    Char
0x2000      a       72             'H'
0x2001      b       105            'i'
0x2002      end     0              '\0'
```

### Modifying a char variable

```c
char c = 'A';      /* 65 */
c = c + 1;         /* 66 — now 'B' if interpreted as ASCII letter */
```

```
Before: c → [65 'A']
After:  c → [66 'B']
```

//? Question: Is `c + 1` adding to the letter or the number?  
// NOTE: **The number** (byte value). `'A' + 1` → `'B'` because 65 + 1 = 66.

### Signed char overflow (preview)

```c
char c = 127;
c = c + 1;   /* often becomes -128 on signed char — know your platform */
```

// WARNING: Arithmetic on signed char can overflow — undefined behavior in many cases.

---

## Examples

### Example 1: Output one character with write

```c
#include <unistd.h>

int main(void)
{
    char c = 'Z';
    write(1, &c, 1);
    return (0);
}
```

`write` sends **1 byte** from address of `c`.

### Example 2: Compare characters

```c
char x = 'a';
char y = 'A';

/* x == y ?  FALSE — 97 vs 65 */
```

### Example 3: Check if digit

```c
char ch = '5';

if (ch >= '0' && ch <= '9')
    /* ch is digit character */
```

### Example 4: Printable vs control

```c
char tab = '\t';     /* ASCII 9 — may show as whitespace */
char visible = '!';  /* ASCII 33 */
```

---

## Wrong Examples

### Wrong: Double quotes for single char (without string intent)

```c
char c = "A";   /* WRONG — "A" is char* string, not char */
char c = 'A';   /* CORRECT */
```

### Wrong: Forgetting char is signed on many compilers

```c
char c = 200;   /* may become negative when printed as %d */
```

Use `unsigned char` if you need 0–255 range explicitly.

### Wrong: Comparing char to int without thinking

```c
char c = '0';
if (c == 0)     /* always false — comparing to null byte value */
if (c == '0')   /* correct */
```

### Wrong: Multi-character constant confusion

```c
char bad = 'ab';  /* implementation-defined, non-portable — NEVER at 1337 */
```

---

## Correct Examples

### Correct: Explicit char for byte-sized data

```c
char buffer_byte;
unsigned char ubyte = 255;
```

### Correct: Use escapes for special chars

```c
write(1, "Line1\n", 6);
```

### Correct: Case conversion pattern (concept)

```c
char upper = 'G';
char lower = upper + 32;   /* 'g' if upper was uppercase letter */
/* real functions check ranges first — see libft / C02 */
```

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| `'A'` vs `"A"` | Single vs string |
| `'0'` vs `0` | Character 48 vs integer 0 |
| Not including `\0` in string thinking | Strings need terminator byte |
| `%c` vs `%d` confusion | Same byte, different display format |
| Assuming char is unsigned | Plain char may be signed |

---

## Best Practices

1. **Single characters** → `'...'` and type **`char`**.
2. **Text sequences** → `"..."` and string/`char[]` (Lesson 14).
3. **Draw one box per char** in memory — 1 byte each.
4. **Check ranges** before `'0'` math or case conversion.
5. **Use `write` with correct byte count** for char output.

---

## STOP — Think

1. How many bytes is `char c = 'X'`?
2. After `c = '\n'`, what decimal value is in memory?
3. Why is `"A"` invalid for `char c = ...`?

---

## LIVE DEMO — Meeting Block

| Step | Task |
|------|------|
| 1 | Declare 5 `char` variables — draw memory with ASCII decimals |
| 2 | Predict output of `write(1, &c, 1)` for `c = '0'` (shows zero digit, not null) |
| 3 | Partner quiz: `'7' - '0'` = ? |
| 4 | List 4 escape sequences and their decimal values |

---

## Mini Quiz

1. Size of `char` in bytes?
2. Value of `'B'` in decimal?
3. `'\\'` stores how many bytes?
4. Difference between `'\0'` and `'0'`?
5. Valid: `char c = 65;` — what character if printed as `%c`?

---

## Interview Questions

1. Is `char` always signed?
2. Explain `'A'` storage in memory.
3. Why does C use integers for characters?
4. Escape sequences — why exist?
5. How does `write()` relate to `char`?

---

## Homework

1. Table of 10 chars: literal, decimal, hex, binary (8 bits).
2. Write program sketch (no full exercise solution) declaring chars for `\n`, `\t`, `'0'`, `'A'` — draw memory.
3. Explain `'5' + 2` numeric result and resulting character.

---

## Extra Challenge

Compare `char`, `signed char`, `unsigned char` with `sizeof` and sample values 127, 128, 255.  
Write when each matters (5 sentences).

---

## Summary

- **`char`** = **1 byte** — small integer and/or ASCII character.
- **Character literals** use **single quotes** `'A'`.
- Storage is **numeric** (ASCII code); display is human interpretation.
- **`'\0'`** (0) ends strings; **`'0'`** (48) is digit zero character.
- Escape sequences represent **special bytes** in one char.

---

## Cheat Sheet

```c
char c = 'A';        /* 65, 1 byte */
char n = '\n';       /* 10 */
char z = '\0';       /* 0 — string terminator */
char d = '0';        /* 48 — digit zero */

/* invalid for single char */
/* char bad = "A"; */
/* char bad = 'ab'; */
```

| Need | Use |
|------|-----|
| One letter | `char` + `'...'` |
| Special byte | escape `\n`, `\t`, `\0` |
| Digit to int | `c - '0'` |
| Output byte | `write(1, &c, 1)` |

---

## Useful Tips

//* Every `'X'` is a number — look up ASCII when unsure.  
//* `'A'` fits in one byte; `"A"` is two bytes ('A' + '\0').  
// NOTE: Lesson 14 connects chars into strings.  
// WARNING: Norm may restrict some functions — `write` is your friend in C00.

---

**Previous:** [12 — ASCII](../12-ascii/LESSON.md) · **Next:** [14 — Strings](../14-strings/LESSON.md)
