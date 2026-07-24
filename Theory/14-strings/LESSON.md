# Strings in C

> **1337 Piscine — Theory 14**  
> Phase 0, Day 5 · A C string is a sequence of char bytes ending with `\0` (ASCII 0).

---

## Definition

In C, a **string** is **not** a separate type. It is a **consecutive sequence of `char` values** in memory, terminated by a **null character** `'\0'` (byte value **0**).

```c
char msg[] = "Hello";
char *ptr = "Hello";
```

| Representation | Meaning |
|----------------|---------|
| `"Hello"` | 6 bytes: `'H' 'e' 'l' 'l' 'o' '\0'` |
| `'\0'` | End marker — tells functions where string stops |
| `char[]` / `char *` | Common ways to refer to string data |

//! Important: **`"Hello"` has length 5 for humans but occupies 6 bytes in memory** because of the hidden `'\0'`.

---

## Why This Concept Exists

Programs process names, paths, input lines, and protocol messages. The CPU needs to know **where text ends** in a byte stream.

C chose **null-terminated strings**:

1. **Simple** — no separate length field in classic C strings.  
2. **Compact** — one extra zero byte marks end.  
3. **Historical** — Unix, libc, and 1337 libft all assume this model.

Trade-off: you **must** never forget `'\0'`, or functions read past your data into garbage — classic segfault and wrong output source (C02 entire module).

---

## Real Life Analogy

### Pearl necklace with stopper bead

Each pearl = one **`char`** byte.  
Last special **invisible stopper** = **`'\0'`** — tells you "no more pearls."  
Without stopper, you keep grabbing random beads from neighbor's box (undefined memory).

### Sentence on paper with period

Visible letters = `'H' 'i' ...`  
The **`'\0'`** is like an invisible end mark machines need — not always shown on screen, but always in memory for C strings.

---

## Visual Explanation

### String vs characters

```
' A '     →  1 char, 1 byte  (value 65)
" A "     →  2 chars + '\0'  →  3 bytes: 65, 32?, actually " A " = ' ', 'A', ' ', '\0'

"Hi"      →  'H' 'i' '\0'  →  3 bytes
```

### String length vs size

```
String:  H   e   l   l   o   \0
Index:   0   1   2   3   4   5

strlen("Hello")  →  5   (counts until '\0', not including '\0')
sizeof("Hello")  →  6   (all bytes including '\0')  /* as array literal */
```

// NOTE: `strlen` (C04/libft) walks memory until `'\0'`. Missing `'\0'` → runaway read.

---

## ASCII Diagrams

### `"1337\n"` in memory

```
Index:    [0]  [1]  [2]  [3]  [4]  [5]  [6]
Char:     '1'  '3'  '3'  '7'  '\n' '\0'
Decimal:  49   51   51   55   10   0
Hex:      0x31 0x33 0x33 0x37 0x0A 0x00
```

Byte count for `write(1, "1337\n", 6)` — **6 bytes** (including `\n`, excluding `'\0'` if you choose count 6 — actually "1337\n" is 5 chars + newline = 6 visible bytes, no `\0` sent in count 6).

**Careful counting:**

```
"1337\n"  →  characters: 1,3,3,7,\n  = 5 chars + \0 stored = 6 bytes total in memory
write(..., 6) sends 6 bytes without needing to include \0 in count if you count data bytes only
```

### Array vs pointer (intro — deep in Lesson 16)

```
char s[] = "Hi";     /* array in writable memory — copy of bytes */
char *p = "Hi";      /* pointer to read-only string literal often */
```

Both point to `'H' 'i' '\0'` layout — ownership and mutability differ (pointers lesson).

---

## Memory Diagrams

### `char str[] = "Hi";`

```
Writable array (typical stack):

Address     Index    Value    ASCII
0x7FFE00    str[0]   72       'H'
0x7FFE01    str[1]   105      'i'
0x7FFE02    str[2]   0        '\0'
```

### Building string char by char (C00 style thinking)

```c
char buf[6];
buf[0] = 'H';
buf[1] = 'i';
buf[2] = '\0';   /* MUST terminate */
```

```
Without buf[2] = '\0':
buf[0] 'H', buf[1] 'i', buf[2] ??? garbage — strlen walks into danger
```

//? Question: Can a string contain ASCII 0 in the middle?  
// NOTE: **Classic C string — no.** First `'\0'` ends the string. Embedded nulls need length-based buffers (advanced).

### Two strings in memory

```
char *a = "Cat";
char *b = "Dog";

"a" somewhere in memory:
[C][a][t][\0]

"b" somewhere else:
[D][o][g][\0]
```

Separate regions — concatenation copies from first `\0`-bounded source (C02).

---

## Examples

### Example 1: Empty string

```c
char empty[] = "";
/* still contains one byte: '\0' at index 0 */
```

### Example 2: String byte size

```c
char word[] = "OK";
/* 'O' 'K' '\0' — 3 bytes in memory */
```

### Example 3: walk string manually (concept — not full libft)

```c
int i = 0;
while (str[i] != '\0')
{
    /* process str[i] */
    i++;
}
/* loop stops at terminator without knowing length in advance */
```

### Example 4: Output with write

```c
write(1, "Hello\n", 6);
/* 6 bytes: H e l l o \n — count each byte including escapes */
```

---

## Wrong Examples

### Wrong: Buffer without terminator

```c
char name[4];
name[0] = 'B';
name[1] = 'o';
name[2] = 'b';
/* forgot name[3] = '\0' */
/* printf/strlen may read garbage past Bob */
```

// WARNING: #1 string bug at Piscine.

### Wrong: Off-by-one in array size

```c
char s[4] = "1234";   /* needs 5 bytes: 1,2,3,4,\0 — overflow */
char s[5] = "1234";   /* correct */
```

### Wrong: Confusing length and size

```c
/* "Hi" — strlen 2, storage 3 bytes */
write(1, "Hi", 3);   /* sends H, i, AND \0 — may invisible on terminal */
write(1, "Hi", 2);   /* usually what you want for visible text only */
```

### Wrong: Modifying string literal

```c
char *s = "Hello";
s[0] = 'h';   /* undefined behavior — literal often in read-only memory */
```

Use `char arr[] = "Hello";` if you need to modify.

---

## Correct Examples

### Correct: Always null-terminate hand-built strings

```c
char result[100];
/* fill characters */
result[len] = '\0';
```

### Correct: Size array for content + 1

```c
char name[6] = "Imad";   /* 5 letters + '\0' */
```

### Correct: Count bytes for write explicitly

```c
write(1, "42\n", 3);   /* '4' '2' '\n' */
```

### Correct: Copy with termination (concept for ft_strcpy)

```
Copy bytes from source to dest until '\0' copied too
```

---

## Common Mistakes

| Mistake | Consequence |
|---------|-------------|
| Missing `'\0'` | Over-read, crash, wrong length |
| Array too small | Buffer overflow |
| `strlen` without valid string | Reads until random `\0` |
| `'x'` vs `"x"` | Type and size confusion |
| Compare with `==` on arrays | Compares addresses, not content (use strcmp later) |

---

## Best Practices

1. **Every string ends with `'\0'`** — no exceptions in classic C.
2. **Allocate strlen + 1** when building dynamic strings (C07 preview).
3. **Count bytes** for `write()` including `\n`, excluding `\0` unless intentional.
4. **Use `char[]` for mutable** strings; be careful with `char *` literals.
5. **Draw every string** as boxes with final `\0` cell shaded.

---

## STOP — Think

1. How many bytes does `"A"` occupy in memory?
2. Why does `strlen` stop at `'\0'`?
3. What happens if `'\0'` is missing after `'H' 'i'`?

---

## LIVE DEMO — Meeting Block

| Step | Activity |
|------|----------|
| 1 | Draw `"1337"` byte table — decimal + char columns |
| 2 | Build `char buf[4]` manually — show missing `\0` disaster |
| 3 | Fix with proper terminator |
| 4 | Count bytes for `write(1, "Hi\n", ?)` — agree on answer |
| 5 | Peer teaches: strlen vs sizeof on same literal |

---

## Mini Quiz

1. What byte ends a C string?
2. `"Cat"` — strlen? Storage bytes?
3. Difference between `"A"` and `'A'`?
4. Why must `char dest[5]` hold `"1234"`?
5. What does string "empty" `""` contain in memory?

---

## Interview Questions

1. How are C strings represented in memory?
2. Why null-terminated vs length-prefixed strings?
3. `char[]` vs `char *` for strings — basics?
4. What is buffer overflow in string context?
5. How does `write()` differ from string functions?

---

## Homework

1. Draw memory for: `""`, `"a"`, `"ab"`, `"abc"` — mark `\0` each time.
2. Write byte table for your login name + newline.
3. List 5 bugs caused by missing `'\0'` (describe, do not code exercises).
4. Complete Theory 10–14 review — variables, types, ASCII, chars, strings together.

---

## Extra Challenge

Research **length-prefixed strings** (Pascal style) vs C null-terminated.  
Write 6 sentences: one advantage and one disadvantage of each.

---

## Summary

- C **strings** = **`char` sequences** ending with **`'\0'`** (byte 0).
- **`"text"`** includes hidden terminator — account for **+1 byte** in arrays.
- **`strlen`** counts characters before `'\0'`; storage size includes `'\0'`.
- Missing terminator → functions **read garbage** → crashes / wrong output.
- C02/libft entire world assumes this model — internalize it now.

---

## Cheat Sheet

```
"Hi"  memory:  'H' | 'i' | '\0'
              72    105    0

Rules:
  - Last byte must be '\0'
  - Array size ≥ strlen + 1
  - "..." → string (char array / pointer)
  - '...' → single char
  - write(fd, str, count) — count bytes deliberately
```

| Function (later) | Needs `\0`? |
|------------------|-------------|
| strlen | Yes — scans until `\0` |
| strcpy | Yes — copies through `\0` |
| strcmp | Yes — compares until `\0` |
| write | No — uses explicit count |

---

## Useful Tips

//* Shade the `\0` cell in every string diagram — habit prevents bugs.  
//* Say "null terminator" not "null pointer" — related but different concepts.  
// NOTE: Lesson 15 Arrays and 16 Pointers deepen string mechanics.  
// WARNING: Never assume compiler adds `\0` when you build strings manually char-by-char.

---

**Previous:** [13 — Characters](../13-characters/LESSON.md) · **Next:** [15 — Arrays](../15-arrays/LESSON.md)

---

## Phase 0 Checkpoint (Lessons 01–14)

You should now explain:

- [ ] CPU + RAM + buses (Day 1–2 drawing)
- [ ] Binary bytes at addresses (Day 1–2)
- [ ] Compilation pipeline + gcc (Day 3)
- [ ] Headers vs libraries (Day 4)
- [ ] Variables, types, ASCII, chars, strings (Day 5 quiz)

**Target:** Level 4 — draw memory for a string and explain every byte before C00.
