# How Computers Work

> **1337 Piscine — Theory 01**  
> Phase 0, Day 1 · Before you write a single line of code, understand the machine.

---

## Definition

A **computer** is a machine that **stores data as numbers**, **follows step-by-step instructions**, and **produces results** — all at incredible speed.

At the lowest level, everything inside a computer is:

| Layer | What it is |
|-------|------------|
| **Hardware** | Physical parts: CPU, RAM, keyboard, screen, disk |
| **Software** | Instructions (programs) that tell hardware what to do |
| **Data** | Numbers stored in memory (text, images, music — all numbers eventually) |

//! Important: A program is not magic. It is a **list of numbered instructions** stored in memory, executed one after another by the CPU.

---

## Why This Concept Exists

Humans think in words and ideas. Computers only understand **on/off switches** (electricity high or low). We needed a shared model so that:

1. **Programmers** can write instructions humans can read (like C).
2. **Compilers** can translate those instructions into numbers the CPU understands.
3. **Hardware** can execute billions of those numbers per second.

Without this mental model, coding feels like guessing. With it, every bug becomes a question: *"What did the machine actually do with my numbers in memory?"*

---

## Real Life Analogy

Imagine a **kitchen in a restaurant**:

| Kitchen part | Computer part |
|--------------|-----------------|
| Recipe book on the shelf | Program stored on disk |
| Chef reading one step at a time | CPU executing instructions |
| Counter space where ingredients sit | RAM (working memory) |
| Pantry / freezer (long-term storage) | Hard drive / SSD |
| Waiter bringing orders in | Input (keyboard, mouse) |
| Plates going out to customers | Output (screen, speakers) |

The chef does not "understand" cooking philosophically — they follow steps. The computer does not "understand" your program — it follows numbers.

---

## Visual Explanation

Every program follows the same loop:

```
  ┌─────────┐
  │  INPUT  │  User types, file is read, sensor sends data
  └────┬────┘
       │
       ▼
  ┌─────────┐
  │ PROCESS │  CPU reads instructions + data from RAM, calculates
  └────┬────┘
       │
       ▼
  ┌─────────┐
  │ OUTPUT  │  Text on screen, sound, saved file
  └─────────┘
       │
       └──► (loop repeats)
```

**The big picture inside the box:**

```
    YOU (programmer)
         │
         ▼ writes source code (.c file)
    ┌─────────┐
    │ COMPILER│  translates human text → machine numbers
    └────┬────┘
         ▼
    ┌─────────┐     address bus (which cell?)     ┌─────────┐
    │   CPU   │ ◄──────────────────────────────► │   RAM   │
    │ (brain) │     data bus (what number?)       │(counter)│
    └─────────┘                                     └─────────┘
         │
         ▼
    SCREEN / DISK / NETWORK
```

---

## ASCII Diagrams

### Simple computer block diagram

```
+------------------------------------------------------------------+
|                         COMPUTER                                  |
|                                                                   |
|   [Keyboard] -----> [  CPU  ] <-----> [  RAM  ]                  |
|   [  Mouse  ] -----> (chip)  <-----> (memory)                    |
|                          |                                        |
|                          v                                        |
|                    [ Hard Drive ]                                 |
|                    (programs saved)                               |
|                          |                                        |
|                          v                                        |
|                     [ Monitor ]                                   |
+------------------------------------------------------------------+
```

### Instruction execution cycle (simplified)

```
Step 1: FETCH     CPU asks RAM: "Give me the next instruction"
Step 2: DECODE    CPU figures out what that instruction means
Step 3: EXECUTE   CPU does the action (add, compare, jump...)
Step 4: REPEAT    Go to Step 1 (millions of times per second)
```

---

## Memory Diagrams

When you run a program, **both the program and its data live in RAM** as numbers:

```
RAM (simplified view)
Address     Contents (meaning)
-------     ------------------
0x1000      instruction: "load number from 0x2000"
0x1004      instruction: "add 1 to that number"
0x1008      instruction: "store result back to 0x2000"
...
0x2000      data: 42          ← a variable lives here
0x2004      data: 0           ← another value
```

//? Question: Where is the number `42` stored — in the CPU or in RAM?  
// NOTE: In RAM. The CPU holds temporary copies in tiny internal slots called **registers**, but variables live in memory.

---

## Examples

### Example 1: Adding two numbers (conceptual)

```
Program says:
  1. Get value at address A
  2. Get value at address B
  3. Add them
  4. Store result at address C
  5. Show result on screen
```

No English. No symbols like `+` at the machine level — just numbered operations on memory cells.

### Example 2: Your first C program (high level)

```c
#include <unistd.h>

int main(void)
{
    write(1, "Hello\n", 6);
    return (0);
}
```

What the machine sees (conceptually):

```
- Load string "Hello\n" into memory
- Call operating system to print bytes from that memory address
- Return 0 (success code)
```

---

## Wrong Examples

### Wrong mental model 1: "The computer understands my intent"

```
You think:  "I wanted to print Hello"
Machine did: read whatever bytes were at some address — maybe garbage
```

//! Important: The computer never reads your mind. It only executes instructions exactly as compiled.

### Wrong mental model 2: "Programs run on the CPU directly from the hard drive"

```
Hard drive: hello.c, hello (slow, permanent storage)
CPU:        tries to execute from disk?  NO — too slow!

Correct:    Program is copied INTO RAM first, then CPU runs from RAM
```

### Wrong mental model 3: "More code lines = more understanding"

Copying 100 lines without knowing what memory each line touches is not programming — it is typing.

---

## Correct Examples

### Correct approach: Trace the data flow

Before running any program, ask:

1. **Where does input come from?** (keyboard, file, argument)
2. **Where is it stored in memory?** (variable, buffer, address)
3. **What instructions modify it?** (functions, operators)
4. **Where does output go?** (stdout, return value, file)

### Correct study habit for 1337

```
Day 1 checklist:
  □ Draw CPU + RAM on paper
  □ Label address bus and data bus
  □ Explain to a peer: "A program is numbers in memory"
```

---

## Common Mistakes

| Mistake | Why it hurts |
|---------|--------------|
| Skipping hardware basics | Pointers and memory make no sense later |
| Treating the screen as "the program" | Output is just bytes sent to a device |
| Ignoring that text = numbers | ASCII lessons become confusing |
| Assuming `return 0` is optional decoration | It is a number sent to the operating system |
| Not drawing diagrams | You cannot reach Level 4 at 1337 without visuals |

---

## Best Practices

1. **Always ask "where in memory?"** before asking "why doesn't it compile?"
2. **Draw before you code** — even a rough box diagram helps.
3. **Separate the three phases:** write source → compile → run. Problems happen in different phases.
4. **Use simple English** when explaining to peers; jargon hides gaps.
5. **Connect every new topic back here:** binary → memory → variables → pointers.

//* Tip: When stuck, say out loud: "The CPU is doing FETCH → DECODE → EXECUTE on numbers in RAM."

---

## STOP — Think

Before continuing to Lesson 02 (Binary), answer without looking:

1. Name the three parts of Input → Process → Output.
2. What is the difference between RAM and a hard drive?
3. Where does a running program live while it executes?

*Write your answers on paper. If you cannot answer #3, re-read the Memory Diagrams section.*

---

## LIVE DEMO — Meeting Block

**Duration:** 15 minutes · **Pairs**

| Step | Action |
|------|--------|
| 1 | Partner A draws a computer with CPU, RAM, disk, screen |
| 2 | Partner B labels data flow for "user types `A`, screen shows `A`" |
| 3 | Swap roles with "program adds 2 + 3, prints 5" |
| 4 | Together: list what is **hardware** vs **software** in the room |

---

## Mini Quiz

1. What are the two main categories of everything inside a computer?
2. What does CPU stand for, and what is its job in one sentence?
3. In the fetch-decode-execute cycle, what happens during **fetch**?
4. Why must programs be loaded into RAM before running?
5. Is the letter `'A'` stored as the letter A inside RAM? (Trick question — explain.)

**Answers:** (1) Hardware and software (2) Central Processing Unit — executes instructions (3) CPU reads the next instruction from memory (4) CPU can only access RAM fast enough for execution (5) No — stored as a number; see Lesson 12 ASCII)

---

## Interview Questions

1. Explain how a computer works to someone who has never used one.
2. What is the difference between a compiler and the CPU?
3. Why do we say "everything is data"?
4. What happens from the moment you press Enter on `./a.out`?
5. Where would you look first if a program runs but prints wrong output?

---

## Homework

1. **Draw** a full computer diagram with CPU, RAM, buses, disk, input, output. Label everything.
2. **Write** (in plain English, not code) the steps the machine takes to display one character on screen.
3. **Research:** Find your computer's CPU model and RAM size. Write one paragraph on what each does.
4. **Teach:** Explain this lesson to one person in under 3 minutes.

---

## Extra Challenge

Write a one-page essay: **"If I had to build a computer with only boxes and arrows, what boxes would I need?"**

Include: storage, processing, input, output, and the path a number takes from keyboard to screen.

Do not write code. Focus on the machine.

---

## Summary

- A computer **stores data as numbers** and **executes instructions** on that data.
- **Hardware** is physical; **software** is instructions; both cooperate through **memory**.
- The **CPU** fetches instructions from **RAM**, decodes them, and executes them in a loop.
- Programs on disk are **copied to RAM** before they run.
- Your job as a 1337 student is not to memorize syntax first — it is to **see the machine**.

---

## Cheat Sheet

| Term | One-line meaning |
|------|------------------|
| CPU | Executes instructions, one step at a time |
| RAM | Fast working memory; holds running program + data |
| Disk | Slow permanent storage for files and programs |
| Program | Sequence of instructions stored as numbers |
| Data | Numbers the program reads and writes |
| Input | Data entering the system (keyboard, file, etc.) |
| Output | Data leaving the system (screen, file, etc.) |
| Fetch-Decode-Execute | CPU cycle: get instruction → understand it → do it |
| Hardware | Physical components |
| Software | Instructions that control hardware |

---

## Useful Tips

//* Draw before code — always.  
//* When reading C code, whisper: "Where in memory?"  
//* Phase 0 is not slow — it prevents Phase 2 pointer pain.  
// NOTE: At 1337, Level 4 means you can draw memory before and after a function call. Start that habit now.  
// WARNING: Do not skip to exercises thinking "I'll learn theory later." The Piscine assumes this foundation on Day 6.

---

**Next lesson:** [02 — Binary Numbers](../02-binary/LESSON.md)
