# Quiz — Rush 00 (ASCII Art Box)

> **Topic-specific questions** · nested loops, position logic, `ft_putchar`
> Answer, then hit **Check answers**. Reasoning beats memorization.

---

## Multiple Choice (8)

### MCQ 1
In `rush(int x, int y)`, what does `x` represent?

- A) The height in rows
- B) The width in columns
- C) The number of corners
- D) An ASCII code

### MCQ 2
A cell is drawn as a corner `o` when:

- A) It is on a side column only
- B) It is on a top/bottom row only
- C) It is on a side column AND a top/bottom row
- D) It is anywhere on the first row

### MCQ 3
Why print `'\n'` after the inner (column) loop?

- A) To reset the CPU
- B) To end the current row and start a new line
- C) To flush the stack
- D) It is optional and does nothing

### MCQ 4
What does `rush(5, 3)` print on its middle row?

- A) `o---o`
- B) `|   |`
- C) `-----`
- D) `|||||`

### MCQ 5
Which loop condition is correct for 0-indexed columns of width `x`?

- A) `col <= x`
- B) `col < x`
- C) `col < x - 1`
- D) `col <= x + 1`

### MCQ 6
`ft_putchar('A')` ultimately calls:

- A) `printf("A")`
- B) `write(1, &c, 1)`
- C) `malloc(1)`
- D) `puts("A")`

### MCQ 7
What should `rush(1, 1)` print?

- A) A single `o`
- B) `o---o`
- C) Nothing
- D) `oo`

### MCQ 8
The outer loop variable (`row`) controls:

- A) Which column we are in
- B) Which row we are in
- C) The ASCII value printed
- D) The exit code

---

## True or False (6)

1. The corner test is `edge_x` AND `edge_y`. **T / F**
2. `rush(0, 0)` should print a single space. **T / F**
3. The inner loop walks across one row. **T / F**
4. Without the `'\n'`, all characters land on one line. **T / F**
5. `col < width` avoids an off-by-one error. **T / F**
6. The top row and bottom row use different characters. **T / F**

---

## Coding (4)

1. Write the `rush` prototype from memory.
2. Implement `rush(1, 1)` only.
3. Add the full nested-loop version.
4. Write a `main` that tests `rush(5, 3)`, `rush(1, 1)`, and `rush(3, 4)`.

---

## Answer Key

### Multiple Choice
| # | Answer | Why |
|---|--------|-----|
| 1 | **B** | `x` is the width (columns). |
| 2 | **C** | A corner is on a side column and a top/bottom row. |
| 3 | **B** | The newline ends the row so lines are real. |
| 4 | **B** | Middle row is `\|` + spaces + `\|`. |
| 5 | **B** | 0-indexed columns run `0 .. x-1`. |
| 6 | **B** | `ft_putchar` wraps `write(1, &c, 1)`. |
| 7 | **A** | One cell, which is a corner → `o`. |
| 8 | **B** | The outer loop selects the row. |

### True or False
| # | Answer | Why |
|---|--------|-----|
| 1 | **T** | Corner = both edges at once. |
| 2 | **F** | No cells → prints nothing. |
| 3 | **T** | Inner loop = columns of one row. |
| 4 | **T** | Newlines create separate lines. |
| 5 | **T** | `< width` keeps you in bounds. |
| 6 | **F** | Both use `-` (and `o` corners). |
