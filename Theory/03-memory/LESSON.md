# Memory

> **1337 Piscine — Theory 03**  
> Phase 0, Day 2 · Memory is a giant grid of numbered boxes, each holding one byte.

---

## Definition

**Memory** (specifically **RAM** while a program runs) is a large array of **bytes**, where each byte has a unique **address** — a number that identifies its location.

| Term | Meaning |
|------|---------|
| **Address** | Location number of a byte in memory (like a house number on a street) |
| **Byte** | 8 bits of data at one address |
| **Read** | CPU copies value from an address into a register |
| **Write** | CPU stores a new value at an address |
| **Word / cell** | Often means one byte in beginner contexts |

//! Important: A variable in C is a **name** the compiler gives to an **address** (or set of addresses). The value lives in memory, not in the name.

---

## Why This Concept Exists

Programs manipulate data. Data must live somewhere physical while the program runs. Memory provides:

1. **Addressability** — the CPU can say "get byte at location 5000."
2. **Uniformity** — everything (instructions, numbers, text) is stored as bytes.
3. **Speed** — RAM is fast enough for the CPU to access billions of times per second.

When you debug at 1337, **"where in memory?"** is the most important question. Segfaults, wrong output, and pointer bugs all come from misunderstanding addresses.

---

## Real Life Analogy

### Apartment building

```
Floor 0, Room 000  →  address 0x0000
Floor 0, Room 001  →  address 0x0001
...
Floor 0, Room 255  →  address 0x00FF
```

- **Address** = room number on the mailbox  
- **Byte** = what is inside the room (one box of stuff)  
- **Read** = open the door and look  
- **Write** = replace what is inside  

You cannot have two different mailboxes with the same number. Each address holds **one byte** at a time.

### Library shelf

The **shelf number** is the address. The **book** is the byte's content. The **librarian (CPU)** walks to shelf 42, reads or replaces the book.

---

## Visual Explanation

```
MEMORY AS A LONG STRIP OF BYTE-SIZED CELLS

Address:  1000   1001   1002   1003   1004   1005
        +------+------+------+------+------+------+
        |  65  |  66  |  67  |   0  |  42  |  10  |
        +------+------+------+------+------+------+
           'A'    'B'    'C'   '\0'   42    newline
         (if interpreted as ASCII text starting at 1000)
```

The same bytes can mean different things depending on **how the program interprets** them — number, character, or part of an instruction.

---

## ASCII Diagrams

### Address bus vs data bus

```
                    ADDRESS BUS (which cell?)
                    "I want location 0x2000"
                           │
                           ▼
    ┌──────────┐      ┌─────────────┐
    │   CPU    │─────►│    RAM      │
    │          │◄─────│  [grid of   │
    └──────────┘      │   bytes]    │
         ▲            └─────────────┘
         │
    DATA BUS (what byte value?)
    "Here is the value: 42"
```

- **Address bus** carries the location number.  
- **Data bus** carries the byte value being read or written.

### Reading a byte (step by step)

```
1. CPU puts address 0x2000 on ADDRESS BUS
2. RAM looks up cell 0x2000
3. RAM puts value 42 on DATA BUS
4. CPU receives 42 into an internal register
```

---

## Memory Diagrams

### Single variable `x = 42`

```
After:  int x = 42;   (conceptual — int may use 4 bytes)

Address     Content (simplified 1-byte view for learning)
0x7FFE10    42        ← compiler chose this address; you use name "x"
```

### Multiple variables

```
int age = 20;
char grade = 'B';

Address     Name (in your head)    Value (decimal)    Binary (8-bit view)
0x1000      age                    20                 00010100
0x1004      grade                  66 ('B')           01000010
```

//? Question: Does `age` live inside the name `age`?  
// NOTE: No. `age` is a label. The value `20` lives at address `0x1000`.

### String in memory (preview for Lesson 14)

```
char msg[] = "Hi";

Address     Content
0x3000      72  ('H')
0x3001      105 ('i')
0x3002      0   ('\0' end marker)
```

---

## Examples

### Example 1: Write then read

```
WRITE address 0x5000 ← value 99
READ  address 0x5000 → CPU gets 99
WRITE address 0x5000 ← value 100   (old value 99 is gone forever)
READ  address 0x5000 → CPU gets 100
```

Memory **overwrites** — it does not remember history.

### Example 2: Hexadecimal addresses

Programmers often write addresses in **hex** (base 16) because it is compact:

```
Decimal 4096  =  Hex 0x1000  =  Binary ... (same bits, different notation)
```

// NOTE: `0x` prefix means "this number is hexadecimal."

### Example 3: Why addresses matter for C

```c
int score = 10;
```

The compiler might generate:

```
Store value 10 at address assigned to score
Later: load from that address when score is used
```

You will use `&score` (address-of) in C01 — this lesson is the foundation.

---

## Wrong Examples

### Wrong: "Variables float in the computer"

```
Wrong picture:
   score = 10  (floating cloud labeled "score")

Right picture:
   Address 0x7FFC08 contains bytes representing 10
   The source code name "score" maps to 0x7FFC08
```

### Wrong: Reading uninitialized memory

```
Address 0x9000   ???   (never written — garbage bits)

int x;           // x not initialized
printf("%d", x); // might print random garbage — reading unknown cell
```

// WARNING: Uninitialized memory contains whatever was left there before.

### Wrong: Writing outside your allowed cells

```
Your program owns addresses 0x1000–0x1100
CPU tries to write at 0x99999999
→ Operating system stops program (segmentation fault — Lesson 34)
```

---

## Correct Examples

### Correct: Track address and value separately

```
"I stored 42 at address 0x2000"
NOT "I stored 42 in the variable" (incomplete — where?)
```

### Correct: Draw before/after assignment

```
Before:  address 0x1000 → 5
After:   x = 10;
After:   address 0x1000 → 10
```

### Correct: Initialize variables

```c
int count = 0;   // WRITE known value to memory immediately
```

---

## Common Mistakes

| Mistake | Reality |
|---------|---------|
| Thinking small numbers use less memory | An `int` uses fixed size (often 4 bytes) even if value is 0 or 1 |
| Ignoring that strings use multiple addresses | One char = one byte = one address each |
| Using magic numbers without knowing size | Always ask: how many bytes does this type use? |
| Confusing value and address | Value 42 ≠ address 42 |
| Skipping hex addresses | Debuggers and `%p` show hex — learn to read it |

---

## Best Practices

1. **Draw memory tables** with Address | Name | Value columns.
2. **Say "address" and "value"** as separate words.
3. **Initialize** before read — always.
4. **Learn hex** alongside decimal for addresses.
5. **Preview pointers early mentally:** a pointer holds an address number.

//* Tip: Use paper grids with 8-bit binary in each cell for Phase 0.

---

## STOP — Think

1. What is the difference between an address and the value stored there?
2. What happens to the old value when you write a new one to the same address?
3. Why does the CPU need an address bus and a data bus?

---

## LIVE DEMO — Meeting Block

| Step | Activity |
|------|----------|
| 1 | Draw 10 memory cells with addresses 0x1000–0x1009 |
| 2 | Partner assigns `int a=3`, `int b=7` — you fill values (note: ints use 4 bytes each on most systems — discuss spacing) |
| 3 | Simulate one READ and one WRITE with arrows from CPU box |
| 4 | Label address bus and data bus on your diagram |

---

## Mini Quiz

1. What is stored at one memory address — one bit or one byte (typical PC)?
2. What does "write to memory" mean?
3. Can two bytes share the same address at the same time?
4. What notation often prefixes hexadecimal numbers?
5. If address `0x2000` holds `65`, what ASCII character might that be?

---

## Interview Questions

1. Explain memory to a non-programmer using the apartment analogy.
2. What is the difference between RAM and memory in everyday speech?
3. Why do programmers care about addresses?
4. What happens when you read memory you never initialized?
5. Explain address bus vs data bus.

---

## Homework

1. Draw a memory map for this pseudo-code:
   ```
   int x = 1;
   int y = 2;
   x = x + y;
   ```
   Show before and after the addition.

2. Convert addresses `0x1000`, `0x1004`, `0x1008` — what is the gap between them if each `int` uses 4 bytes?

3. Write 5 sentences: why "where in memory?" beats "why doesn't my code work?"

---

## Extra Challenge

Look up a **hex dump** screenshot (e.g. `xxd` or hex editor).  
Write a paragraph explaining one line: offset, bytes, ASCII column.  
Connect each byte to the grid model from this lesson.

---

## Summary

- Memory is a **sequence of byte-sized cells**, each with a unique **address**.
- **Read** = copy byte from address to CPU; **Write** = store new byte at address.
- **Address bus** selects location; **data bus** carries the value.
- Variables are **names for addresses**; values live in cells.
- Drawing memory is not optional at 1337 — it is how you reach Level 4.

---

## Cheat Sheet

| Term | Meaning |
|------|---------|
| Address | Numeric location of a byte |
| Byte | 8 bits at one address |
| Read | Fetch value from address |
| Write | Store value at address |
| 0x... | Hexadecimal number (often an address) |
| Uninitialized | Cell never written — contents unknown |
| Overwrite | New write replaces old value |

**Key question:** Where in memory?

---

## Useful Tips

//* Every variable assignment is a WRITE to some address.  
//* Every use of a variable is a READ from that address.  
// NOTE: Lesson 04 (RAM) explains the physical chip; this lesson is the **logical grid** model.  
// WARNING: Never assume memory is zero-filled unless you initialized it or used `calloc`.

---

**Previous:** [02 — Binary](../02-binary/LESSON.md) · **Next:** [04 — RAM](../04-ram/LESSON.md)
