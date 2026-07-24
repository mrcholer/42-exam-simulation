# Bitwise Operations

> **Read this lesson completely before the related exercises.**

**Prerequisites:** Binary (02), Data Types (11)  
**You will use this in:** Flags, permissions (Shell00), low-level masks, optimization tricks

---

## Definition

**Bitwise operators** act on individual **bits** of integer types.

| Operator | Name | Effect per bit |
|----------|------|----------------|
| `&` | AND | 1 if both 1 |
| `\|` | OR | 1 if either 1 |
| `^` | XOR | 1 if different |
| `~` | NOT | flip bit |
| `<<` | Left shift | move bits left, fill 0 |
| `>>` | Right shift | move bits right |

```c
unsigned char a = 5;    /* 00000101 */
unsigned char b = 3;    /* 00000011 */
a & b;                  /* 00000001 = 1 */
a | b;                  /* 00000111 = 7 */
a ^ b;                  /* 00000110 = 6 */
```

Applies to **integer types** — not floats.

---

## Why This Concept Exists

Hardware thinks in bits. Permissions (`rwx`), color channels, protocol flags, and embedded registers pack multiple booleans into one int. Bitwise ops manipulate that packed data efficiently.

Shell `chmod 755` and file permission octal connect directly here.

---

## Real Life Analogy

**Light switches on a panel** — each switch is a bit. AND means "both switches on for light"; OR means "either on"; XOR means "exclusive — on if exactly one on." Shifting moves the whole pattern left/right like renumbering rooms.

---

## Visual Explanation

```
  5:   0 0 0 0 0 1 0 1
& 3:   0 0 0 0 0 0 1 1
  ─────────────────────
  1:   0 0 0 0 0 0 0 1

<< 1 on 5 (0101):
  0 0 0 0 1 0 1 0  → 10 (decimal)
```

---

## ASCII / Memory Diagrams

### Permission flags (concept)

```
rwx rwx rwx  (user group other)

r=4 w=2 x=1

755 octal = 111 101 101 binary grouped

check execute bit for user:
mode & 100  (octal)  → non-zero if x set
```

### Set/clear/toggle bit n

```
set:    flags |= (1 << n);
clear:  flags &= ~(1 << n);
toggle: flags ^= (1 << n);
test:   flags & (1 << n)
```

---

## Examples

### Correct Example

```c
unsigned int set_bit(unsigned int flags, int n)
{
	return (flags | (1u << n));
}

unsigned int clear_bit(unsigned int flags, int n)
{
	return (flags & ~(1u << n));
}

int is_even(unsigned int n)
{
	return ((n & 1u) == 0);
}

int is_power_of_two(unsigned int n)
{
	return (n && !(n & (n - 1)));
}
```

### Wrong Example

```c
void signed_shift_trap(int n)
{
	/* WRONG for negative: implementation-defined/UB historical */
	n >> 1;
}

void shift_overflow(int n)
{
	/* WRONG: shift >= width is UB */
	1 << 32;
}

int bad_mask(char c)
{
	/* WRONG: forgetting & 0xFF for byte extract on int */
	return (c >> 8);   /* probably 0 for char — logic error pattern */
}
```

---

## STOP / THINK

> **STOP** — Compute in binary.

> **THINK** —
> 1. `6 & 3`?
> 2. `6 | 3`?
> 3. `1 << 4`?
> 4. `8 >> 1`?

**Answers:** (1) 2 (2) 7 (3) 16 (4) 4.

---

## Common Mistakes

1. Confusing `&` (bitwise) with `&&` (logical)
2. Shifting by >= bit width
3. Signed right shift assumptions
4. Forgetting `u` suffix for unsigned constants
5. Operator precedence bugs — use parentheses

---

## Best Practices

- Use `unsigned` types for bit patterns
- Parentheses around shifts: `(1u << n)`
- Named flag constants `#define FLAG_READ 4`
- Prefer readable helpers set/clear/test
- Know octal permission math for Shell00 link

---

## Mini Quiz

1. AND vs OR use case?
2. XOR trick for swap (mention)?
3. Why unsigned for shifts?
4. 755 permissions meaning roughly?

---

## Interview Questions

1. Check if int is power of two?
2. Count set bits (concept)?
3. Bit fields preview?
4. Endianness relation to bytes not bits?

---

## Homework

1. Encode/decode last 3 bits of a byte.
2. Compute 644 octal in binary groupings.
3. Implement is_even with & not %.

---

## Extra Challenge

Pack two 4-bit nibbles into one byte and unpack.

---

## Summary

**Bitwise operations** manipulate integer bits directly — essential for flags, masks, and low-level work. Use unsigned types, mind shift limits, and practice binary on paper until & | ^ feel natural.

---

## Cheat Sheet

| Op | Use |
|----|-----|
| & | mask/test bits |
| \| | set bits |
| ^ | toggle/compare |
| ~ | invert mask |
| << >> | multiply/divide powers of 2 |

---

## Useful Tips

//* Draw 8-bit row for every homework problem  
//* Logical && || are NOT bitwise  
//* Shell chmod clicks after bitwise lesson  
//* 1u << n avoids signed shift surprises  
//* Parentheses — precedence bites
