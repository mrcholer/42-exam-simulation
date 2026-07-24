# RAM (Random Access Memory)

> **1337 Piscine — Theory 04**  
> Phase 0, Day 2 · RAM is the computer's fast, temporary workspace.

---

## Definition

**RAM** (Random Access Memory) is the computer's **main working memory** — a hardware chip (or chips) that stores bytes the CPU can **read or write quickly**, using **random access** (any address takes roughly the same time to reach).

| Property | RAM | Hard Drive / SSD |
|----------|-----|------------------|
| Speed | Very fast | Much slower |
| Volatility | **Volatile** — loses data when power off | **Non-volatile** — keeps data |
| Role while running | Holds active program + data | Stores files long-term |
| CPU access | Direct | Through loading into RAM first |

//! Important: When you "run a program," a copy (or parts) of it is loaded into **RAM**. The CPU does not execute programs directly from the disk.

---

## Why This Concept Exists

The CPU needs data **now** — billions of times per second. Disk is too slow. RAM sits close to the CPU on the motherboard and uses electronic circuits (not spinning disks) for speed.

Trade-off engineers accepted:

- **Fast + close to CPU** → RAM (but forgets when power cuts)
- **Slow + large + permanent** → Disk (keeps your files safe)

Understanding RAM explains why unsaved work disappears, why more RAM helps multitasking, and why **everything you manipulate in C while debugging lives in RAM**.

---

## Real Life Analogy

### Desk vs filing cabinet

| Filing cabinet (disk) | Desk (RAM) |
|-----------------------|------------|
| Stores all project folders | Only today's active papers |
| Takes time to walk and fetch | Immediate reach |
| Keeps files after you leave | Cleared when you leave (power off) |
| Huge capacity | Limited space |

When you open a program, you **pull files from the cabinet onto the desk**. The CPU **works only on the desk**.

### Whiteboard in a meeting

RAM = whiteboard everyone uses **right now**.  
Disk = notebook archived in a drawer.

Power outage = whiteboard erased. Notebook remains.

---

## Visual Explanation

```
POWER ON — PROGRAM RUNNING

  ┌─────────────┐         fast electrical paths
  │     CPU     │◄──────────────────────────────►┌──────────────┐
  │  (executes) │                                │     RAM      │
  └─────────────┘                                │  [programs]  │
        │                                        │  [variables] │
        │ slow                                   │  [stack]     │
        ▼                                        │  [heap]      │
  ┌─────────────┐                                └──────────────┘
  │ Disk / SSD  │
  │ hello.c     │  ──load──► copied into RAM when you run ./hello
  │ a.out       │
  └─────────────┘

POWER OFF — RAM contents GONE (volatile)
Disk still has hello.c and a.out
```

---

## ASCII Diagrams

### Motherboard layout (simplified)

```
+----------------------------------------------------------+
|  MOTHERBOARD                                              |
|                                                           |
|   +-------+     memory slots     +------------------+   |
|   |  CPU  │◄────────────────────►| RAM stick(s)     |   |
|   +-------+     (data + address   | DDR4/DDR5 chips  |   |
|       │          buses)           +------------------+   |
|       │                                                   |
|       └──────────► SSD connector (storage, not workspace) |
+----------------------------------------------------------+
```

### Random access concept

```
Sequential tape:  must rewind to start to reach beginning  (slow metaphor)
RAM:              jump directly to address 0x7FFE00 or 0x00001000  (same speed class)
```

"Random" does **not** mean "random values" — it means **any address is directly reachable**.

---

## Memory Diagrams

### Program loaded into RAM

```
DISK (file on storage)              RAM (while running)
+------------------+                +------------------+
| a.out (binary)   |  ──load──►     | instructions...  | 0x400000
|                  |                | instructions...  |
|                  |                | data section...  | 0x601000
|                  |                | heap grows ►       |
|                  |                | ... free ...     |
|                  |                | stack grows ◄    | 0x7FFE00
+------------------+                +------------------+
```

// NOTE: Exact addresses vary (ASLR, OS). The **layout idea** matters more than exact numbers in Phase 0.

### Variable living in RAM

```
When you run:

    int lives = 1;

RAM cell at some address (example):

Address       Value
0x7FFC14      00000001  (conceptual — int is often 4 bytes)
```

When program ends, those cells are **reclaimed** — your variable no longer exists.

---

## Examples

### Example 1: Opening vs running

```
Double-click game icon:
  1. OS reads executable from DISK
  2. OS allocates RAM regions
  3. Code + data copied into RAM
  4. CPU starts executing from RAM address

Closing game:
  RAM freed — next program may reuse those addresses
```

### Example 2: Why save files?

```
You type essay in editor:
  Keystrokes → RAM (buffer)
  Power loss before Save → RAM cleared → essay gone
  Save → copy from RAM to DISK → survives power off
```

### Example 3: RAM size (8 GB vs 16 GB)

More RAM = more desk space = more programs + data **active at once** without slowing down to swap (using disk as fake RAM — very slow).

---

## Wrong Examples

### Wrong: "RAM stores my files permanently"

```
Photos in Pictures folder → on DISK
Opened photo in editor     → copy in RAM while editing
Close without save         → edits in RAM lost
```

### Wrong: "More RAM makes CPU faster"

```
RAM size     → how much can fit on the desk at once
CPU speed    → how fast the chef reads recipes

Related but not the same upgrade
```

### Wrong: "Memory address 100 is always my variable"

```
// WARNING: Addresses change between runs (ASLR) and between variables.
// The NAME is stable in source code; the ADDRESS is assigned at runtime.
```

---

## Correct Examples

### Correct mental model for C debugging

```
Breakpoint on line x:
  Inspect variable → debugger READS RAM at compiler-chosen address
  Shows hex/value  → same bits Lesson 02 taught
```

### Correct: Distinguish storage types

| What | Where |
|------|-------|
| Source code `hello.c` | Disk until you edit in editor (also in RAM while open) |
| Compiled `a.out` | Disk |
| Running process | Instructions + stack + heap in **RAM** |
| `return 0` exit | OS frees that program's RAM |

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Saying "memory" when meaning "disk" | Be precise: RAM vs storage |
| Expecting data to survive after program ends | Local variables die with the function/process (with exceptions later) |
| Ignoring volatility | Unsaved = RAM only |
| Thinking unused RAM is "wasted" | OS uses free RAM for cache — normal |
| Confusing RAM chip with "memory concept" | Lesson 03 = logical grid; Lesson 04 = physical hardware |

---

## Best Practices

1. **Say RAM** when talking about running programs and variables.
2. **Say disk/SSD** when talking about files and persistence.
3. **Connect to Lesson 03:** RAM implements the address grid.
4. **When drawing at 1337**, label "RAM" on your workspace region.
5. **Preview:** stack and heap (Lessons 27–29) both live **in RAM**.

---

## STOP — Think

1. What happens to RAM when you shut down?
2. Why must `a.out` load into RAM before the CPU runs it?
3. Is a Word document on your laptop in RAM or on disk before you open it?

---

## LIVE DEMO — Meeting Block

| Step | Task |
|------|------|
| 1 | Open Task Manager / `top` — note RAM usage |
| 2 | Launch a small program — watch RAM change slightly |
| 3 | Draw disk → RAM → CPU arrow chain on whiteboard |
| 4 | Explain "volatile" in one sentence to partner |

---

## Mini Quiz

1. What does volatile mean for RAM?
2. Why is RAM faster than a hard drive?
3. What does "random access" mean?
4. Where do running program variables live?
5. What happens to your `int x` when the program exits?

---

## Interview Questions

1. Difference between RAM and ROM? (Brief — ROM is read-mostly firmware)
2. Why is RAM necessary if we have SSDs?
3. Explain load-time: from `./program` to first instruction executed.
4. What is swapping / paging? (High level: disk used when RAM full)
5. How does RAM relate to the memory addresses in C?

---

## Homework

1. Find your system RAM size. Write when you would need more for development.
2. Draw **two** diagrams: (a) file on disk only, (b) same program running in RAM.
3. Explain to a friend: "RAM is not where I store photos forever."
4. Read about **DDR** in one paragraph — physical RAM technology.

---

## Extra Challenge

Research: **What is cache?** (L1, L2, L3 between CPU and RAM)  
Write 5 sentences on why cache is even faster than RAM, and why you still model "main memory" as RAM in C courses.

---

## Summary

- **RAM** is fast, **volatile** working memory next to the CPU.
- Running programs, their data, stack, and heap live in **RAM**, not on disk.
- **Random access** = direct reach any address quickly.
- Disk stores files **permanently**; RAM holds **active work** temporarily.
- Power off → RAM cleared. Save important data to disk.

---

## Cheat Sheet

| Term | One line |
|------|----------|
| RAM | Fast volatile main memory |
| Volatile | Lost without power |
| Non-volatile | Keeps data (disk, flash) |
| Load | Copy from disk into RAM |
| Random access | Any address ~ equally reachable |
| Workspace | RAM while CPU works |
| Storage | Disk for long-term files |

---

## Useful Tips

//* If output is wrong, the bug is in what RAM holds — trace writes.  
//* "Out of memory" often means RAM (or heap) full — not disk full.  
// NOTE: Lesson 03 = addresses; Lesson 04 = physical RAM chip implementing them.  
// WARNING: Never confuse browser "memory" tab with your C program's heap — related but different scopes.

---

**Previous:** [03 — Memory](../03-memory/LESSON.md) · **Next:** [05 — CPU](../05-cpu/LESSON.md)
