# Binary Numbers

> **1337 Piscine — Theory 02**  
> Phase 0, Day 1 · Computers count with only two digits: 0 and 1.

---

## Definition

**Binary** is a **base-2 number system**. Instead of ten digits (0–9) like everyday decimal numbers, binary uses only:

```
0  and  1
```

Each digit is called a **bit** (binary digit).  
**Eight bits** grouped together make one **byte** — the fundamental unit of memory.

| Term | Meaning |
|------|---------|
| **Bit** | One 0 or 1 |
| **Byte** | 8 bits (e.g. `01001001`) |
| **Binary** | Numbers written in base 2 |

//! Important: Inside RAM, there are no letters, colors, or sounds — only bits grouped into bytes.

---

## Why This Concept Exists

Computer circuits are made of transistors — tiny switches that are either **ON (1)** or **OFF (0)**. There is no "2" switch. So:

- Engineers chose **base 2** because it maps directly to hardware.
- Every value you store — age, score, letter `'A'`, pixel color — is stored as a **binary number**.
- Understanding binary lets you read memory dumps, debug bitwise bugs, and understand **why a `char` is 1 byte**.

Without binary, "memory" stays abstract. With binary, you can literally draw what sits at address `0x2000`.

---

## Real Life Analogy

### Light switches

Imagine a row of 8 light switches on a wall. Each switch is OFF (0) or ON (1):

```
Switch:  [OFF][ON ][OFF][OFF][ON ][OFF][OFF][ON ]
Binary:    0    1    0    0    1    0    0    1
```

The pattern **01001001** is not a word — it is a number. In decimal that number is **73**, which is also the ASCII code for the letter **`I`**.

One row of switches = one byte = one memory cell.

### Odometer that only has 0 and 1

Decimal odometer: `... 8, 9, 10, 11 ...`  
Binary odometer: `... 0, 1, 10, 11, 100 ...`

When you "run out" of digits in one position, you carry to the next — same idea, fewer digits.

---

## Visual Explanation

### Place values in decimal (base 10)

```
  Thousands  Hundreds  Tens  Ones
      10³        10²      10¹   10⁰

  4  2  9  7  =  4000 + 200 + 90 + 7  =  4297
```

### Place values in binary (base 2)

```
  128  64  32  16   8   4   2   1
  2⁷  2⁶  2⁵  2⁴  2³  2²  2¹  2⁰

  0   1   0   0   1   0   0   1  =  64 + 8 + 1  =  73
```

Each column is a power of 2. If the bit is `1`, add that column's value. If `0`, skip it.

---

## ASCII Diagrams

### Bit to byte layout

```
ONE BYTE IN MEMORY
┌───┬───┬───┬───┬───┬───┬───┬───┐
│b7 │b6 │b5 │b4 │b3 │b2 │b1 │b0 │  ← bit positions (b0 = rightmost = ones)
├───┼───┼───┼───┼───┼───┼───┼───┤
│ 0 │ 1 │ 0 │ 0 │ 1 │ 0 │ 0 │ 1 │  = 73 decimal
└───┴───┴───┴───┴───┴───┴───┴───┘
 128  64  32  16   8   4   2   1   ← place values
```

### Counting from 0 to 5 in binary

```
Decimal   Binary
    0  =    0
    1  =    1
    2  =   10      ← "1 two, 0 ones"
    3  =   11
    4  =  100      ← "1 four, 0 twos, 0 ones"
    5  =  101
```

---

## Memory Diagrams

Three bytes stored in RAM:

```
Address     Binary (8 bits)     Decimal    Meaning (later)
-------     ---------------     -------    ----------------
0x3000      00000000            0          number zero
0x3001      00001010            10         number ten
0x3002      01000001            65         letter 'A' (ASCII)
```

//? Question: How many bits are in address `0x3000`?  
// NOTE: The **address** is written in hexadecimal (Lesson 03). The **contents** at that address are 8 bits = 1 byte.

### Multi-byte numbers (preview)

An `int` often uses **4 bytes** (32 bits) on many systems:

```
Address     Byte contents
0x4000      00000000
0x4001      00000000
0x4002      00000000
0x4003      00000101    ← together these may represent 5 (depends on byte order)
```

//* Tip: Do not worry about byte order yet. Know that **bigger types use more bytes**.

---

## Examples

### Example 1: Convert binary `1101` to decimal

```
Place values:   8   4   2   1
Binary:         1   1   0   1

Calculate:  8 + 4 + 0 + 1  =  13
```

### Example 2: Convert decimal 5 to binary

```
5 ÷ 2 = 2 remainder 1  ↑
2 ÷ 2 = 1 remainder 0  │ read remainders
1 ÷ 2 = 0 remainder 1  ↑ bottom to top

5 in binary = 101
```

### Example 3: Why 8 bits?

```
With 1 bit:  2 patterns  (0, 1)
With 8 bits: 256 patterns (0 to 255)

That is enough for:
  - All English letters (upper + lower)
  - Digits 0–9
  - Punctuation
  - Many control codes
→ This is why ASCII fits in one byte (Lesson 12)
```

---

## Wrong Examples

### Wrong: Treating binary as "text"

```
Binary in memory:  01000001
Wrong thought:     "The computer stores the letter A as A"
Correct thought:   "The computer stores the NUMBER 65"
                   (we INTERPRET 65 as 'A' using ASCII)
```

### Wrong: Reading bits left-to-right without place values

```
Binary: 101
Wrong:  "That is one hundred one" (decimal habit)
Right:  1×4 + 0×2 + 1×1 = 5
```

### Wrong: Assuming one byte holds any integer

```
// WARNING: A byte holds 0–255 unsigned. The number 1000 needs more than one byte.
```

---

## Correct Examples

### Correct: Link binary to memory

"When I store `42` in a `char`-sized cell, RAM holds `00101010` (8 bits)."

### Correct: Practice conversion both ways

```
Decimal 73  →  Binary 01001001  →  ASCII 'I'
```

Each step is reversible. That is the power of binary thinking.

### Correct: Use powers of 2 table

Memorize (or keep handy):

```
128  64  32  16   8   4   2   1
```

Most 8-bit conversions take seconds with this row.

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Confusing bit count with decimal value | `1111` binary = 15, not 1111 |
| Forgetting leading zeros | `00001010` and `1010` are the same value |
| Thinking binary is "only for advanced topics" | C00, ASCII, and pointers all need this |
| Mixing up hex and binary | Hex is shorthand for bits (Lesson 03); both describe memory |
| Skipping manual conversion | Do 5 conversions by hand daily until automatic |

---

## Best Practices

1. **Convert by hand** before using a calculator — build intuition.
2. **Always draw 8 boxes** for one byte when learning.
3. **Connect binary to ASCII early** — characters are numbers.
4. **Say "bits in memory"** instead of "the letter stored."
5. **Learn powers of 2** up to 2⁷ = 128 for Piscine work.

---

## STOP — Think

1. What is the decimal value of `10000000` (binary)?
2. How many different values can one byte represent?
3. Why can't a single transistor store the digit `7`?

---

## LIVE DEMO — Meeting Block

**Materials:** Paper, pen, partner

| Step | Task |
|------|------|
| 1 | Partner calls a decimal 0–15; you write binary within 10 seconds |
| 2 | Draw one RAM row with 8 boxes; fill in binary for your age mod 256 |
| 3 | Explain why `01000001` and `65` and `'A'` are the same memory content |

---

## Mini Quiz

1. How many bits in one byte?
2. Convert `1010` binary to decimal.
3. Convert decimal `7` to binary.
4. What decimal range can an unsigned byte hold?
5. If bit b0 is the rightmost bit, which bit represents the value 128?

---

## Interview Questions

1. Why do computers use binary instead of decimal?
2. What is the difference between a bit and a byte?
3. Convert `11111111` to decimal without counting one-by-one.
4. How does binary relate to characters in C?
5. Why is 8 bits a standard grouping?

---

## Homework

1. Convert **20 random decimal numbers** (0–255) to 8-bit binary on paper.
2. Convert these binary numbers to decimal: `1`, `11`, `100`, `1010`, `11111111`.
3. Draw a memory table: 5 addresses, random bytes, decimal value in each.
4. Memorize the place-value row: `128 64 32 16 8 4 2 1`.

---

## Extra Challenge

Research **hexadecimal** (base 16) as a compact way to write bytes.  
Write one paragraph: `0x41` = `01000001` = `65` = `'A'`.  
(Do not skip drawing the byte diagram.)

---

## Summary

- Binary uses only **0 and 1** because hardware switches are ON or OFF.
- A **bit** is one digit; a **byte** is **8 bits**.
- Every value in memory — numbers, characters, instructions — is stored as bits.
- Convert using **place values** (powers of 2).
- One byte holds **256 different patterns** (0–255 unsigned).

---

## Cheat Sheet

| Binary | Decimal |
|--------|---------|
| 0 | 0 |
| 1 | 1 |
| 10 | 2 |
| 11 | 3 |
| 100 | 4 |
| 101 | 5 |
| 1000 | 8 |
| 1111 | 15 |
| 10000 | 16 |
| 11111111 | 255 |

**Place values (8 bits):** `128  64  32  16  8  4  2  1`

**Formulas:**
- n bits → 2ⁿ different values
- 8 bits → 256 values (0–255 unsigned)

---

## Useful Tips

//* When stuck converting, fill place values under your 8 boxes first.  
//* Binary `10` is decimal 2 — not ten! Watch the habit.  
// NOTE: Hex (`0x..`) appears in debuggers — it is the same bits, shorter to write.  
// WARNING: Signed vs unsigned bytes (negative numbers) come later — for now, use 0–255.

---

**Previous:** [01 — How Computers Work](../01-how-computers-work/LESSON.md) · **Next:** [03 — Memory](../03-memory/LESSON.md)
