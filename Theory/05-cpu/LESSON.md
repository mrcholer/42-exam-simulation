# CPU (Central Processing Unit)

> **1337 Piscine — Theory 05**  
> Phase 0, Day 2 · The CPU is the brain that executes instructions on data in RAM.

---

## Definition

The **CPU** (Central Processing Unit) is the hardware component that **fetches instructions from memory**, **decodes** what they mean, and **executes** them — performing arithmetic, comparisons, and control flow (jumps, branches) at clock speed.

| Part | Role |
|------|------|
| **ALU** | Arithmetic Logic Unit — adds, subtracts, compares bits |
| **Registers** | Tiny ultra-fast storage inside CPU (temporary holding) |
| **Control unit** | Orchestrates fetch-decode-execute |
| **Program counter (PC)** | Holds address of **next** instruction to fetch |
| **Clock** | Metronome — billions of ticks per second (GHz) |

//! Important: The CPU never executes C source code directly. It executes **machine code** — numbers that encode operations.

---

## Why This Concept Exists

Someone must **do** the work: add two numbers, decide if a loop continues, jump to a function. RAM only **stores** bytes; it does not "understand" them. The CPU is the active agent that:

1. Reads instruction bytes from RAM.
2. Interprets them as operations (add, load, store, jump…).
3. Modifies data in registers and RAM.
4. Repeats forever until power off or halt.

Every line of C eventually becomes CPU actions. When you predict program behavior, you are predicting **CPU + memory** together.

---

## Real Life Analogy

### Chef in a kitchen (again — deeper)

| Kitchen | CPU |
|---------|-----|
| Recipe step | Instruction |
| Recipe bookmark | Program counter (next step) |
| Small prep bowl on counter | Register |
| Counter ingredients | RAM |
| "Add salt to pot" | ALU operation |
| "If soup too thin, simmer longer" | Branch (conditional jump) |

The chef reads **one recipe step at a time**, not the whole book at once. The CPU fetches **one instruction at a time** (often several in parallel in modern chips — but learn the simple model first).

### Factory worker on an assembly line

Each station (clock tick) may complete one small action. Billions of stations per second = modern CPU speed.

---

## Visual Explanation

### Fetch — Decode — Execute cycle

```
        ┌──────────────────────────────────────────┐
        │                  CPU                      │
        │                                           │
        │   ┌─────────┐    ┌─────────┐    ┌──────┐ │
 RAM ◄──┼──►│ FETCH   │───►│ DECODE  │───►│ EXEC │ │
        │   │ get inst│    │ what op?│    │ do it│ │
        │   └────┬────┘    └─────────┘    └──┬───┘ │
        │        │                            │     │
        │        └──────── PC points here ────┘     │
        │              (next instruction addr)      │
        └──────────────────────────────────────────┘
                    loop billions/sec
```

### Registers vs RAM

```
REGISTERS (inside CPU)          RAM (outside CPU)
┌────┐ ┌────┐ ┌────┐           huge grid of bytes
│ R1 │ │ R2 │ │ R3 │  ◄──────►  addresses 0x... 
└────┘ └────┘ └────┘           slowER than registers
  bytes each                     but MUCH bigger

Typical flow:
  LOAD from RAM address → into register
  ADD two registers
  STORE register → back to RAM address
```

---

## ASCII Diagrams

### CPU connected to RAM (from curriculum Day 2)

```
         ADDRESS BUS                    DATA BUS
    (which byte?)                   (which value?)

         ┌─────────────────────────────────────┐
         │              CPU CHIP                │
         │  [PC] [Registers] [ALU] [Control]   │
         └───────────┬─────────────┬───────────┘
                     │             │
                     ▼             ▼
         ┌─────────────────────────────────────┐
         │              RAM                     │
         │  addr:  1000  1001  1002  1003 ...  │
         │  data:   42    10     0    65  ...  │
         └─────────────────────────────────────┘
```

Label these on paper for Day 2 curriculum checkpoint.

### Instruction types (conceptual)

```
LOAD    — copy byte/word from RAM → register
STORE   — copy register → RAM
ADD     — add two registers, store result
CMP     — compare (sets flags for branches)
JMP     — set PC to new address (loop, if, function)
CALL    — jump to function, save return address
RET     — return from function
```

Your C `if`, `while`, and functions become these.

---

## Memory Diagrams

### Before and after `x = x + 1` (conceptual machine steps)

```
C code:  int x = 5;  x = x + 1;

Step 1 — initial:
  RAM @0x1000: 5

Step 2 — CPU FETCH/EXEC for x = x + 1:
  LOAD  RAM[0x1000] → register R1     (R1 = 5)
  ADD   R1, 1       → R1              (R1 = 6)
  STORE R1 → RAM[0x1000]              (RAM @0x1000: 6)
```

//? Question: Where did the addition happen — in RAM or in the CPU?  
// NOTE: In the **ALU** (inside CPU). RAM only held the stored result.

### Program counter during a loop

```
Instructions at:
  0x4000:  compare i with 10
  0x4004:  jump if done to 0x4010
  0x4008:  body of loop
  0x400C:  jump back to 0x4000

PC jumps: 4000 → 4008 → 400C → 4000 → ... → 4010
```

---

## Examples

### Example 1: Clock speed

```
3 GHz ≈ 3 billion cycles per second

Not every cycle completes one full instruction (pipelining, caches),
but the clock sets the rhythm of the chip.
```

### Example 2: From C to CPU (high level)

```c
int a = 3;
int b = 4;
int c = a + b;
```

Conceptual machine work:

```
STORE 3 → address of a
STORE 4 → address of b
LOAD a → register
LOAD b → register
ADD registers → register
STORE result → address of c
```

### Example 3: Why busy loop heats CPU

```
while (1) { }  → CPU constantly fetching and executing jump
                 never idle — uses power, generates heat
```

---

## Wrong Examples

### Wrong: "CPU stores all my variables"

```
Variables live in RAM (mostly).
CPU registers hold temporary copies during calculation.
Stack and heap are in RAM — not inside the CPU chip.
```

### Wrong: "More GHz = always 2× faster programs"

```
Performance depends on:
  - Algorithm efficiency
  - RAM/cache access patterns
  - Cores, I/O, compiler optimizations

GHz is one factor, not the whole story.
```

### Wrong: "The CPU reads my comments"

```c
// this adds two numbers   ← never reaches CPU; stripped at compile time
int sum = a + b;           ← becomes machine instructions only
```

---

## Correct Examples

### Correct: Trace fetch-decode-execute for one line

Pick one assignment. Write three columns: FETCH | DECODE | EXECUTE for each machine step.

### Correct: Label buses on diagram

Curriculum Day 2 requires **address bus** and **data bus** on your drawing — do it every time.

### Correct: Connect CPU to compilation

```
C source → compiler → machine code in file → loaded to RAM → CPU executes
         (Lesson 06)                         (Lesson 04)
```

---

## Common Mistakes

| Mistake | Truth |
|---------|-------|
| CPU executes `.c` files | Executes machine code in RAM |
| Registers = variables | Variables usually in RAM; registers are scratch space |
| Ignoring program counter | Loops and functions are PC jumps |
| Thinking one C line = one CPU instruction | One C line may become many instructions |
| Forgetting ALU does math | RAM does not add numbers — CPU does |

---

## Best Practices

1. **Always pair CPU diagram with RAM diagram.**
2. **Use fetch-decode-execute** when explaining any running program.
3. **Registers are small** — do not imagine unlimited CPU storage.
4. **Learn that compilation produces CPU instructions** before writing big programs.
5. **Predict output** by simulating CPU + memory on paper.

---

## STOP — Think

1. What three steps repeat in the CPU cycle?
2. Where is the program counter, and what does it hold?
3. If RAM holds `5` at address `0x1000`, what must happen before the CPU can add 1 to it?

---

## LIVE DEMO — Meeting Block

**Curriculum Day 2 checkpoint activity**

| Step | Action |
|------|--------|
| 1 | Draw CPU + RAM on one page |
| 2 | Label **address bus** and **data bus** with arrow directions |
| 3 | Write PC value pointing to one instruction cell |
| 4 | Simulate 3 fetch-decode-execute cycles on a toy instruction list |

Peer must verify labels before you proceed to Lesson 06.

---

## Mini Quiz

1. What does CPU stand for?
2. Name the three stages of the instruction cycle.
3. What is the ALU's job?
4. Where do instructions come from when the CPU fetches?
5. What is the difference between a register and a RAM cell?

---

## Interview Questions

1. Explain fetch-decode-execute without acronyms.
2. Why doesn't the CPU run programs straight from the hard drive?
3. What is a program counter?
4. How does `if (x > 0)` map to CPU behavior?
5. Registers vs RAM — speed and size?

---

## Homework

1. Complete curriculum drawing: **CPU + RAM + both buses** (photo or scan).
2. Pick `int n = 0; n = n + 1;` — write pseudo machine steps (LOAD/ADD/STORE).
3. Research: how many cores does your CPU have? What is a core in one paragraph?

---

## Extra Challenge

Read about **instruction set architecture (ISA)** — e.g. x86-64 vs ARM.  
Write 8 sentences: same C program, different CPU families, same high-level idea (fetch-decode-execute), different machine code numbers.

---

## Summary

- The **CPU** executes **machine instructions** fetched from **RAM**.
- **Fetch → Decode → Execute** repeats; **program counter** tracks the next instruction.
- **Registers** are fast tiny storage inside the CPU; **RAM** is large external storage.
- **ALU** performs math and comparisons; control logic handles jumps and calls.
- C code is a human-friendly layer above what the CPU actually runs.

---

## Cheat Sheet

| Term | Meaning |
|------|---------|
| CPU | Executes instructions |
| Fetch | Read instruction from RAM at PC |
| Decode | Determine operation |
| Execute | Perform operation |
| PC | Address of next instruction |
| Register | Small fast CPU-internal storage |
| ALU | Does arithmetic and logic |
| Clock | Timing ticks (Hz) |
| Machine code | Binary instructions for CPU |
| Address bus | Carries memory address |
| Data bus | Carries data value |

---

## Useful Tips

//* When debugging, ask: "What instruction would the CPU be running now?"  
//* Loops are just PC jumping backward — not magic.  
// NOTE: Multi-core CPUs run multiple instruction streams — start with one core mentally.  
// WARNING: Modern CPUs optimize heavily (pipelines, out-of-order). Learn the simple model first.

---

**Previous:** [04 — RAM](../04-ram/LESSON.md) · **Next:** [06 — Compilation](../06-compilation/LESSON.md)
