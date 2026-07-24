# Quiz — ft_putchar

> **35 questions** · Test understanding, not memorization  
> Discuss reasoning in meeting — wrong answers with good logic are valuable.

**Answer key:** [bottom of file](#answer-key)

---

## Multiple Choice (10)

### MCQ 1

What is the primary purpose of `ft_putchar`?

- A) Allocate memory for a character  
- B) Send exactly one byte to standard output  
- C) Convert a string to an integer  
- D) Read one character from the keyboard  

---

### MCQ 2

Which `#include` is required for `write()`?

- A) `<stdio.h>`  
- B) `<stdlib.h>`  
- C) `<unistd.h>`  
- D) `<string.h>`  

---

### MCQ 3

File descriptor `1` corresponds to:

- A) stdin  
- B) stdout  
- C) stderr  
- D) A random file on disk  

---

### MCQ 4

What is stored in a variable of type `char` when you write `c = 'A'`?

- A) The two-character sequence `A\0` in one byte  
- B) The ASCII code 65 (one byte)  
- C) A pointer to the letter A  
- D) A floating-point approximation of A  

---

### MCQ 5

Why does `write(1, &c, 1)` use `&c`?

- A) To make `c` negative  
- B) Because `write` needs the **address** of memory to read bytes from  
- C) To convert `char` to `string`  
- D) Because norm requires ampersands on all variables  

---

### MCQ 6

What is the correct return type for `ft_putchar` per the 42 subject?

- A) `int`  
- B) `char`  
- C) `void`  
- D) `ssize_t`  

---

### MCQ 7

ASCII code for the character `'0'` (digit zero) is:

- A) 0  
- B) 48  
- C) 32  
- D) 57  

---

### MCQ 8

What does the third argument `1` in `write(1, &c, 1)` mean?

- A) File descriptor number  
- B) Number of bytes to write from `buf`  
- C) ASCII value to print  
- D) Number of times to repeat the character  

---

### MCQ 9

Which call is **correct** for printing the character stored in variable `c`?

- A) `write(1, c, 1)`  
- B) `write(1, "c", 1)`  
- C) `write(1, &c, 1)`  
- D) `write(c, &1, 1)`  

---

### MCQ 10

After `ft_putchar` returns, the local variable `c` inside it:

- A) Remains on the heap forever  
- B) Is popped from the stack — its memory is no longer valid for that frame  
- C) Becomes a global variable  
- D) Is automatically copied to stdout  

---

## True or False (10)

Mark **T** or **F**. Explain any false statement in one sentence.

| # | Statement | T / F |
|---|-----------|-------|
| 1 | `write` is a C standard library function like `printf`. | |
| 2 | Standard output is associated with file descriptor 1. | |
| 3 | The character literal `'A'` and the integer `65` can represent the same value in C. | |
| 4 | `ft_putchar("hello")` is valid because a string is a character. | |
| 5 | `'\n'` represents a single control character, not two visible characters `\` and `n`. | |
| 6 | `write(1, &c, 0)` prints nothing because zero bytes are requested. | |
| 7 | Using `&c` with `count` greater than 1 is safe if `c` is a char. | |
| 8 | A successful `write` of one byte typically returns 1. | |
| 9 | stderr and stdout both default to the terminal but use different file descriptors. | |
| 10 | For this exercise, `printf` is an acceptable replacement for `write`. | |

---

## Coding (5)

Write code on paper or in a file. No IDE autocomplete.

### C1 — Core implementation

Write complete `ft_putchar.c`: include, prototype, function body. Use only `write`.

---

### C2 — Mini main

Write `main` that prints `OK` followed by a newline using **only** `ft_putchar` (three or more calls).

---

### C3 — Digit printer

Write `void ft_print_one_digit(int d)` that prints one digit 0–9 using only `ft_putchar`. Assume `d` is valid.

---

### C4 — Error-aware variant

Write `int ft_putchar_checked(char c)` that returns `1` if `write` succeeds in writing one byte, `-1` otherwise.

---

### C5 — Trace comment

Given your implementation, add a comment on **each line** explaining what happens to memory (as comments only — for learning).

---

## Memory (5)

Draw diagrams on paper. Label stack, values, and addresses where asked.

### M1

Draw the stack when `main` calls `ft_putchar('Z')`. Show parameter `c` and indicate where `&c` points.

---

### M2

Show the difference in memory between:

```c
char x = 'A';
char *s = "A";
```

Label bytes and addresses conceptually.

---

### M3

For `write(1, &c, 1)` with `c = '!'`, what decimal byte value is read from memory? What is at `&c + 1` if count were wrongly set to 2?

---

### M4

Two calls: `ft_putchar('1'); ft_putchar('2');` — how many stack frames for `ft_putchar` exist **at once**? Explain.

---

### M5

Where does the byte go after the kernel receives it from `write(1, ...)`? Draw user space → kernel → terminal.

---

## Debugging (5)

Each snippet is broken. Identify the bug and fix.

### D1

```c
void ft_putchar(char c)
{
	write(1, c, 1);
}
```

**Bug:**  
**Fix:**

---

### D2

```c
void ft_putchar(char c)
{
	write(1, &c, 1);
}
/* compiles with warning about implicit write */
```

**Bug:**  
**Fix:**

---

### D3

```c
#include <unistd.h>
void ft_putchar(char c)
{
	write(1, &c, 2);
}
```

**Bug:**  
**Fix:**

---

### D4

```c
#include <unistd.h>
int ft_putchar(char c)
{
	write(1, &c, 1);
}
```

**Bug (vs 42 subject):**  
**Fix:**

---

### D5

```c
#include <unistd.h>
void ft_putchar(char c)
{
	printf("%c", c);
}
```

**Bug (vs 42 C00 rules):**  
**Fix:**

---

## Answer Key

### Multiple Choice

| # | Answer | Brief why |
|---|--------|-----------|
| 1 | **B** | One byte to stdout |
| 2 | **C** | `write` declared in unistd.h |
| 3 | **B** | fd 1 = stdout |
| 4 | **B** | char holds numeric ASCII code |
| 5 | **B** | write needs pointer to buffer |
| 6 | **C** | Subject specifies void |
| 7 | **B** | Digit `'0'` is 48, not 0 |
| 8 | **B** | Third arg is byte count |
| 9 | **C** | Address of c, count 1 |
| 10 | **B** | Stack frame destroyed on return |

### True or False

| # | Answer | Note |
|---|--------|------|
| 1 | **F** | `write` is a **system call** (POSIX), not stdio |
| 2 | **T** | |
| 3 | **T** | `'A'` has value 65 |
| 4 | **F** | Parameter is `char`, not string |
| 5 | **T** | Single byte ASCII 10 |
| 6 | **T** | count 0 → no bytes transferred |
| 7 | **F** | Reads past c → undefined behavior |
| 8 | **T** | Assuming full write of 1 byte |
| 9 | **T** | fd 1 vs fd 2 |
| 10 | **F** | Subject allows only write |

### Coding — Sample Solutions

**C1:**

```c
#include <unistd.h>

void ft_putchar(char c)
{
	write(1, &c, 1);
}
```

**C2:**

```c
int main(void)
{
	ft_putchar('O');
	ft_putchar('K');
	ft_putchar('\n');
	return (0);
}
```

**C3:**

```c
void ft_print_one_digit(int d)
{
	ft_putchar('0' + d);
}
```

**C4:**

```c
int ft_putchar_checked(char c)
{
	if (write(1, &c, 1) != 1)
		return (-1);
	return (1);
}
```

**C5:** Graded on accurate per-line memory comments.

### Memory — Key Points

| # | Key answer |
|---|------------|
| M1 | `c` = 90 in ft_putchar frame; `&c` → that slot |
| M2 | `x` is one byte 65; `"A"` is array {65,0}, `s` points to it |
| M3 | Byte 33; `&c+1` is adjacent stack — unknown/garbage |
| M4 | At most one at a time; sequential calls reuse stack |
| M5 | Kernel stdout handler → terminal driver → display |

### Debugging — Fixes

| # | Bug | Fix |
|---|-----|-----|
| D1 | `c` is not an address | `write(1, &c, 1)` |
| D2 | missing include | `#include <unistd.h>` |
| D3 | count too large | `write(1, &c, 1)` |
| D4 | wrong return type | `void ft_putchar(char c)` |
| D5 | forbidden printf | use `write(1, &c, 1)` |

---

## Scoring Guide (self-assessment)

| Section | Ready for ex01 if… |
|---------|---------------------|
| MCQ | 8+ / 10 |
| T/F | 8+ / 10 |
| Coding | C1–C2 without notes |
| Memory | M1, M4 explained clearly |
| Debugging | 4+ / 5 bugs found quickly |

**Level 4 target:** Can teach `ft_putchar` to a peer using a stack diagram and ASCII table.
